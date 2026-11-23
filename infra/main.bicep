// Lern-App Informatik Maschinenbau – Infrastruktur (Ressourcengruppen-Deployment)
//
//   $env:LERNAPP_BUDGET_EMAIL = '<adresse>'
//   az deployment group create -g rg-informatik-lernapp -n lernapp-main -p infra/main.bicepparam
//   (üblicherweise über infra/bereitstellen.ps1)
//
// Ressourcen: Static Web App (Free), Cosmos DB for NoSQL (Serverless), Storage-Konto für Videos,
// App-Einstellungen der SWA (vorhandene Werte bleiben erhalten, siehe swa-einstellungen.bicep),
// Kostenbudget mit E-Mail-Warnung. Keine Geheimnisse in den Ausgaben.

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
@description('Nur beim allerersten Deployment verwendet: Kandidat für BENUTZER_SALT. Ist in der SWA bereits ein Salt gesetzt, bleibt er unverändert.')
param saltKandidat string = '${newGuid()}${newGuid()}'

@description('Optional: Name eines vorhandenen Cosmos-Kontos (z. B. nach einer Point-in-Time-Wiederherstellung). Leer = Standardname.')
param cosmosKontoName string = ''

var suffix = uniqueString(resourceGroup().id)
var swaName = '${praefix}-swa-${take(suffix, 6)}'
var cosmosName = empty(cosmosKontoName) ? toLower('${praefix}-cosmos-${take(suffix, 8)}') : cosmosKontoName
var storageName = toLower(take('${praefix}vid${suffix}', 24))
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

// ------------------------------------------------------------------ App-Einstellungen der SWA

module einstellungen 'module/swa-einstellungen.bicep' = {
  name: 'swa-einstellungen'
  params: {
    swaName: swa.name
    cosmosName: cosmos.outputs.kontoName   // Ausgabe-Referenz = Abhängigkeit: erst Cosmos fertig, dann Einstellungen
    saltKandidat: saltKandidat
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
