// Lern-App Informatik Maschinenbau – Infrastruktur (Ressourcengruppen-Deployment)
//
//   $env:LERNAPP_BUDGET_EMAIL = '<adresse>'
//   az deployment group create -g rg-informatik-lernapp -n lernapp-main -p infra/main.bicepparam
//   (üblicherweise über infra/bereitstellen.ps1)
//
// Ressourcen: Static Web App (Free), Cosmos DB for NoSQL (Serverless), Storage-Konto für Videos,
// Key Vault mit dem gesicherten BENUTZER_SALT, App-Einstellungen der SWA (vorhandene Werte bleiben
// erhalten, siehe swa-einstellungen.bicep), Kostenbudget mit E-Mail-Warnung. Keine Geheimnisse in
// den Ausgaben.

targetScope = 'resourceGroup'

@description('Region der Static Web App (Functions laufen dort).')
param swaRegion string = 'westeurope'

@description('Region für Cosmos DB und Storage. Rückfall, falls Serverless dort nicht verfügbar ist: westeurope.')
param datenRegion string = 'germanywestcentral'

@description('Namenspräfix der Ressourcen.')
@minLength(3)
@maxLength(12)
param praefix string = 'lernapp'

@description('E-Mail-Adresse für die Budgetwarnungen (kein Standardwert im Repo).')
param budgetEmail string

@description('Monatsbudget in der Abrechnungswährung des Abos (bei einem in Deutschland geführten Abo meist EUR).')
param budgetBetrag int = 30

@description('Beginn des Budgets (JJJJ-MM-TT). Leer = Erster des aktuellen Monats. Bei einem vorhandenen Budget muss es dessen Startdatum sein (bereitstellen.ps1 liest es aus), sonst lehnt Azure die Änderung ab bzw. das Deployment ist nicht idempotent.')
param budgetStart string = ''

@description('Nicht setzen: Erster des aktuellen Monats zum Zeitpunkt des Deployments (Rückfall für budgetStart).')
param monatsErster string = utcNow('yyyy-MM-01')

@description('Objekt-ID (Entra) der Person, die Videos hochlädt; erhält "Storage Blob Data Contributor" auf dem Storage-Konto. Leer = keine Rollenzuweisung.')
param videoUploaderObjectId string = ''

@description('Art des Prinzipals für die Rollenzuweisung.')
@allowed([ 'User', 'ServicePrincipal', 'Group' ])
param videoUploaderTyp string = 'User'

@description('Modell-ID für den Tutor.')
param tutorModell string = 'claude-haiku-5-5'

@description('Tutor-Fragen je Benutzer und Tag.')
param tutorLimitNutzerTag int = 40

@description('Tutor-Fragen im ganzen Kurs je Tag.')
param tutorLimitKursTag int = 1500

@description('Zweite Prüfung jeder Tutor-Antwort durch ein kurzes Modell (an/aus).')
@allowed([ 'an', 'aus' ])
param tutorPruefer string = 'an'

@secure()
@description('Nur beim allerersten Deployment verwendet (und nur mit neuenSaltErlauben = true): Kandidat für BENUTZER_SALT.')
param saltKandidat string = '${newGuid()}${newGuid()}'

// ---- Salt-Sicherung im Key Vault (Fallunterscheidung in bereitstellen.ps1 / salt-fall.ps1).
// Die Standardwerte sind die sichere Wahl für ein Deployment von Hand: nichts in den Tresor
// schreiben, keinen neuen Salt erzeugen, den vorhandenen Salt der SWA unverändert lassen.

@secure()
@description('Salt aus dem Tresor (setzt bereitstellen.ps1, wenn der Tresor ihn hat). Gewinnt gegenüber der SWA-Einstellung. Leer = kein Tresorwert übergeben.')
param saltAusTresor string = ''

@description('true: Geheimnis "benutzer-salt" in den Tresor schreiben (nur, wenn es dort noch fehlt; der Wert ist der wirksame Salt der SWA). Setzt bereitstellen.ps1.')
param saltSichern bool = false

@description('true: Gibt es weder im Tresor noch in der SWA einen Salt, wird saltKandidat verwendet. Nur beim echten Erstdeployment (setzt bereitstellen.ps1).')
param neuenSaltErlauben bool = false

@description('Objekt-ID der bereitstellenden Person; erhält "Key Vault Secrets User" auf dem Tresor (Lesen für den Abgleich in bereitstellen.ps1). Leer = keine Rollenzuweisung.')
param tresorLeserObjectId string = ''

@description('Art des Prinzipals für die Tresor-Rolle.')
@allowed([ 'User', 'ServicePrincipal', 'Group' ])
param tresorLeserTyp string = 'User'

@description('Optional: Name eines vorhandenen Cosmos-Kontos (z. B. nach einer Point-in-Time-Wiederherstellung). Leer = Standardname.')
param cosmosKontoName string = ''

var suffix = uniqueString(resourceGroup().id)
var swaName = '${praefix}-swa-${take(suffix, 6)}'
var cosmosName = empty(cosmosKontoName) ? toLower('${praefix}-cosmos-${take(suffix, 8)}') : cosmosKontoName
var storageName = toLower(take('${praefix}vid${suffix}', 24))
// Key Vault: 3 bis 24 Zeichen, Buchstaben, Ziffern, Bindestriche, global eindeutig. Bei praefix
// 'lernapp' genau 24 Zeichen (7 + 4 + 13); praefix hat höchstens 12 Zeichen, das Ende ist also nie '-'.
var tresorName = toLower(take('${praefix}-kv-${suffix}', 24))
var saltGeheimnis = 'benutzer-salt'
var videoContainer = 'video'
var datenbank = 'lernapp'
var budgetBeginn = empty(budgetStart) ? monatsErster : budgetStart

// ------------------------------------------------------------------ Static Web App (Free, ohne Repository)

resource swa 'Microsoft.Web/staticSites@2024-04-01' = {
  name: swaName
  location: swaRegion
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // keine repositoryUrl/branch: Bereitstellung per SWA-CLI (swa deploy)
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// ------------------------------------------------------------------ Cosmos DB (NoSQL, Serverless)

module cosmos 'module/cosmos.bicep' = {
  name: 'cosmos'
  params: {
    kontoName: cosmosName
    region: datenRegion
    datenbank: datenbank
  }
}

// ------------------------------------------------------------------ Storage für Videos

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: datenRegion
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: true      // nötig für den öffentlichen Container 'video'
    allowSharedKeyAccess: false      // Hochladen nur mit Entra-Anmeldung (--auth-mode login)
    defaultToOAuthAuthentication: true
    publicNetworkAccess: 'Enabled'
  }
}

resource blobDienst 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [ 'https://${swa.properties.defaultHostname}' ]
          allowedMethods: [ 'GET', 'HEAD' ]
          allowedHeaders: [ 'range', 'if-none-match', 'if-modified-since', 'if-range' ]
          exposedHeaders: [ 'content-length', 'content-range', 'accept-ranges', 'etag', 'content-type' ]
          maxAgeInSeconds: 86400
        }
      ]
    }
  }
}

resource videoBehaelter 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobDienst
  name: videoContainer
  properties: {
    publicAccess: 'Blob'             // nur einzelne Blobs anonym lesbar, keine Auflistung
  }
}

// Storage Blob Data Contributor für die hochladende Person (optional)
var rolleBlobContributor = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')

resource uploaderRolle 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(videoUploaderObjectId)) {
  name: guid(storage.id, videoUploaderObjectId, rolleBlobContributor)
  scope: storage
  properties: {
    roleDefinitionId: rolleBlobContributor
    principalId: videoUploaderObjectId
    principalType: videoUploaderTyp
  }
}

// ------------------------------------------------------------------ Key Vault (Sicherung des BENUTZER_SALT)
//
// Ohne Salt passen die Daten in Cosmos zu keinem Konto mehr. Der Tresor hält deshalb eine Kopie,
// die das Löschen oder Neuanlegen der SWA übersteht. Soft-Delete 90 Tage und Purge-Schutz: auch ein
// gelöschter Tresor bleibt 90 Tage wiederherstellbar und kann in dieser Zeit von niemandem endgültig
// gelöscht werden. Öffentlicher Netzzugriff ist nötig, weil vom Entwicklungsrechner (wechselnde IP)
// bereitgestellt und abgeglichen wird; der Zugriff auf Werte verlangt trotzdem eine Entra-Anmeldung
// mit Datenrolle (RBAC). enabledForTemplateDeployment bleibt aus: Die Vorlage liest den Tresor nicht
// (kein getSecret); geschrieben wird über die Steuerungsebene (vaults/secrets/write).

resource tresor 'Microsoft.KeyVault/vaults@2025-05-01' = {
  name: tresorName
  location: datenRegion
  tags: {
    zweck: 'benutzer-salt'
  }
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    accessPolicies: []
    enableSoftDelete: true
    softDeleteRetentionInDays: 90     // nur beim Anlegen festlegbar
    enablePurgeProtection: true       // lässt sich nicht mehr abschalten
    enabledForTemplateDeployment: false
    enabledForDeployment: false
    enabledForDiskEncryption: false
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'None'
    }
  }
}

// Key Vault Secrets User (nur lesen: getSecret, readMetadata) für die bereitstellende Person.
// Schreiben braucht keine Datenrolle: das Geheimnis legt das Deployment über die Steuerungsebene an.
// Fester Name guid(...): Dieselbe Zuweisung (Bereich, Person, Rolle) von Hand unter anderem Namen ließe
// dieses Deployment mit RoleAssignmentExists scheitern; deshalb nie von Hand zuweisen (BETRIEB.md, Abschnitt 5).
var rolleSecretsUser = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

resource tresorLeserRolle 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(tresorLeserObjectId)) {
  name: guid(tresor.id, tresorLeserObjectId, rolleSecretsUser)
  scope: tresor
  properties: {
    roleDefinitionId: rolleSecretsUser
    principalId: tresorLeserObjectId
    principalType: tresorLeserTyp
  }
}

// ------------------------------------------------------------------ App-Einstellungen der SWA

module einstellungen 'module/swa-einstellungen.bicep' = {
  name: 'swa-einstellungen'
  params: {
    swaName: swa.name
    cosmosName: cosmos.outputs.kontoName   // Ausgabe-Referenz = Abhängigkeit: erst Cosmos fertig, dann Einstellungen
    tresorName: tresor.name                // Abhängigkeit: Tresor existiert, bevor das Geheimnis geschrieben wird
    geheimnisName: saltGeheimnis
    saltKandidat: saltKandidat
    saltAusTresor: saltAusTresor
    saltSichern: saltSichern
    neuenSaltErlauben: neuenSaltErlauben
    verwaltet: {
      COSMOS_DATENBANK: datenbank
      TUTOR_MODELL: tutorModell
      TUTOR_LIMIT_NUTZER_TAG: string(tutorLimitNutzerTag)
      TUTOR_LIMIT_KURS_TAG: string(tutorLimitKursTag)
      TUTOR_PRUEFER: tutorPruefer
    }
  }
}

// ------------------------------------------------------------------ Kostenbudget

resource budget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: '${praefix}-budget-monat'
  properties: {
    category: 'Cost'
    amount: budgetBetrag
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '${budgetBeginn}T00:00:00Z'
    }
    notifications: {
      ist50: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: [ budgetEmail ]
        locale: 'de-de'
      }
      ist80: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [ budgetEmail ]
        locale: 'de-de'
      }
      ist100: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: [ budgetEmail ]
        locale: 'de-de'
      }
      prognose100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [ budgetEmail ]
        locale: 'de-de'
      }
    }
  }
}

// ------------------------------------------------------------------ Ausgaben (keine Geheimnisse)

output swaName string = swa.name
output swaHostname string = swa.properties.defaultHostname
output videoBasis string = '${storage.properties.primaryEndpoints.blob}${videoContainer}'
output storageName string = storage.name
output cosmosKonto string = cosmosName
output tresorName string = tresor.name
