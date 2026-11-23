# Recherche 02: Cosmos DB, Static Web App, Storage und Budget per Bicep

Stand: 2026-11-22. Quellen sind Microsoft-Learn-Seiten (Abruf per Microsoft-Learn-MCP). Was nicht belegt ist, steht als **UNBELEGT**. Versionsnummern der API und Preise sind nur dort genannt, wo eine Quelle sie nennt.

## 0. Kurzfazit

- **Free-Tier und Serverless schliessen sich aus.** Der Free-Tier-Rabatt ist fuer Serverless nicht verfuegbar, die Option wird im Portal bei Serverless ausgeblendet. Es gilt Serverless (kein Mindestbetrag, Abrechnung nach RU und GB).
- **Managed Identity ist im SWA-Free-Tarif nicht fuer die API nutzbar.** Zugriff auf Cosmos laeuft ueber Schluessel (Connection String) in den App-Einstellungen.
- **Kosten** liegen mit Serverless bei wenigen Dollar im Monat (siehe Abschnitt 1, Rechenbeispiel). Budget 30 USD ist realistisch.
- **Offen:** Ob Bicep-Deployments manuell gesetzte App-Einstellungen ueberschreiben (siehe Abschnitt 2.4). Dies ist nicht belegt und per `what-if` plus `az staticwebapp appsettings list` zu pruefen.

## 1. Cosmos DB for NoSQL, Serverless

### 1.1 Serverless und Free-Tier

- Serverless: Abrechnung nur fuer verbrauchte RUs und Speicher, kein Mindestbetrag, keine Kapazitaetsplanung. Quelle: https://learn.microsoft.com/azure/cosmos-db/serverless
- Free-Tier: "Free tier is currently not available for serverless accounts." Quelle: https://learn.microsoft.com/azure/cosmos-db/free-tier
- Bei Serverless sind "Apply Free Tier Discount", "Limit total account throughput", Geo-Redundanz und Multi-Region-Writes nicht verfuegbar. Quelle: https://learn.microsoft.com/azure/cosmos-db/how-to-create-account
- Serverless-Konto laeuft in genau einer Azure-Region. Quelle: https://learn.microsoft.com/azure/cosmos-db/distribute-data-globally
- Serverless-Limits: max. 5.000 RU/s pro Container, max. 20 GB pro logische Partition, Speicher pro Container unbegrenzt. Quellen: https://learn.microsoft.com/azure/cosmos-db/serverless-performance und https://learn.microsoft.com/azure/cosmos-db/concepts-limits

### 1.2 Preise (Serverless)

- Die Learn-Beispiele nennen **0,25 USD pro Mio. RU** und **0,25 USD pro GB und Monat**. Quellen: https://learn.microsoft.com/azure/cosmos-db/understand-your-bill und https://learn.microsoft.com/azure/cosmos-db/optimize-cost-storage
- Aktuelle Preise je Region: Preisseite (nicht abgerufen, daher **UNBELEGT** fuer aktuelle Werte): https://azure.microsoft.com/pricing/details/cosmos-db/
- Richtwerte aus Learn: Punktlesen 1 RU (1 KB), Schreiben 5 RU, Update 10 RU, Abfrage ca. 10 RU. Quelle: https://learn.microsoft.com/azure/cosmos-db/plan-manage-costs

Rechenbeispiel (nur mit den oben belegten Raten): 200.000 Lesevorgaenge und 100.000 Schreibvorgaenge pro Monat ergeben ca. 1,2 Mio. RU, also ca. 0,30 USD. 1 GB Speicher kostet 0,25 USD. Gesamt deutlich unter 1 USD. Das Budget von 30 USD wird damit nicht annaehernd erreicht. Die Mengen sind Annahmen, nicht belegt.

### 1.3 Backup und Kosten

- Periodic (Standard fuer bestehende Konten): zwei Kopien kostenlos, weitere Kopien kostenpflichtig. Quelle: https://learn.microsoft.com/azure/cosmos-db/periodic-backup-restore-introduction
- Continuous 7 Tage: keine Speicherkosten fuer Backups. Quelle: https://learn.microsoft.com/azure/cosmos-db/continuous-backup-restore-introduction
- Continuous 30 oder 35 Tage: 0,20 USD pro GB, pro Region und Monat (Beispielpreis West US). Restore: 0,15 USD pro GB und Restore-Vorgang. Quelle: https://learn.microsoft.com/azure/cosmos-db/continuous-backup-restore-introduction#pricing
- Empfehlung fuer dieses Projekt: Continuous7Days (Tier-Name laut https://learn.microsoft.com/azure/cosmos-db/continuous-backup-restore-resource-model). Das Umstellen von periodic auf continuous ist einseitig und nicht rueckgaengig machbar. Quelle: https://learn.microsoft.com/azure/cosmos-db/migrate-continuous-backup. Bei Neuanlage ist das unkritisch.

### 1.4 Regionen

- germanywestcentral und westeurope unterstuetzen Verfuegbarkeitszonen (3 Zonen). Quelle: https://learn.microsoft.com/azure/reliability/availability-zones-overview#regions-with-availability-zones
- Serverless-Konten mit Zonenredundanz: nur bei Neuanlage waehlbar, nicht nachtraeglich. Quelle: https://learn.microsoft.com/azure/reliability/reliability-cosmos-db#resilience-to-availability-zone-failures
- Ob Serverless in germanywestcentral und westeurope verfuegbar ist: **UNBELEGT** (keine explizite Serverless-Regionsliste abgerufen). Mit `az deployment group what-if` pruefen, Fehler wuerden dort sichtbar.
- Zonenredundanz in Serverless ist mit Aufpreis verbunden (Quelle sagt, dass Aufpreis fuer Multi-Region-Writes und Autoscale entfaellt). Hoehe **UNBELEGT**. Empfehlung: `isZoneRedundant: false`.

### 1.5 Bicep-Geruest Cosmos (Serverless)

Hinweis: Der Ressourcentyp und die Eigenschaften sind belegt (https://learn.microsoft.com/azure/templates/microsoft.documentdb/databaseaccounts). Die API-Version `2024-11-15` ist **UNBELEGT** und vor dem Einsatz gegen den Learn-Eintrag "Latest" zu pruefen. Die Schluessel `backupPolicy`, `continuousModeProperties` und die Indexing-Details sind nach dem Learn-Muster gebaut, aber nicht per Abruf bestaetigt (**UNBELEGT** in Syntax), `what-if` prueft das.

```bicep
// cosmos.bicep (Modul) – Serverless, eine Region, Continuous 7 Tage
param location string
param accountName string
param databaseName string = 'app'
param containerName string = 'items'

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' = {
  name: accountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableServerless' }
    ]
    locations: [
      { locationName: location, failoverPriority: 0, isZoneRedundant: false }
    ]
    consistencyPolicy: { defaultConsistencyLevel: 'Session' }
    backupPolicy: {
      type: 'Continuous' // UNBELEGT in Syntax
      continuousModeProperties: { tier: 'Continuous7Days' }
    }
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false // Schluessel-Auth bleibt an (Free-Plan hat keine MI)
  }
}

resource db 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-11-15' = {
  parent: cosmos
  name: databaseName
  properties: { resource: { id: databaseName } }
}

// Kein "throughput" setzen: Serverless-Container haben keinen Durchsatz.
resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-11-15' = {
  parent: db
  name: containerName
  properties: {
    resource: {
      id: containerName
      partitionKey: { paths: ['/pk'], kind: 'Hash' } // belegt: partitionKeyPath-Konzept
      defaultTtl: -1 // -1 = kein Ablauf; belegt: defaultTtl (quickstart-template-bicep)
      indexingPolicy: { // UNBELEGT im Detail
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [ { path: '/*' } ]
        excludedPaths: [ { path: '/"_etag"/?' } ]
      }
    }
  }
}

// Verbindungszeichenfolge nur als Ausgabe im Modul fuer das SWA-Config-Modul, nicht als output
var cosmosConnectionString = cosmos.listConnectionStrings().connectionStrings[0].connectionString // Syntax UNBELEGT, what-if pruefen

output cosmosId string = cosmos.id
output cosmosEndpoint string = cosmos.properties.documentEndpoint
```

Warnung: `cosmosConnectionString` darf nicht als `output` des Moduls erscheinen. Der Wert soll nur als Parameter an die App-Einstellungen gehen (siehe 2.3).

Partitionierung: Die Partition `/pk` sollte je Nutzer oder Programm einen stabilen Wert tragen (z. B. `u:<githubLogin>`). Begruendung: Abfragen innerhalb einer Partition sind guenstiger und schneller. Das ist eine Entwurfsempfehlung ohne Quelle.

## 2. Static Web App (Free) per Bicep

### 2.1 Plan und Funktionen

- Free: APIs nur als **Managed Functions** (nur HTTP-Trigger). "Bring your own Functions app" ist nicht im Free-Plan. Quellen: https://learn.microsoft.com/azure/static-web-apps/plans und https://learn.microsoft.com/azure/static-web-apps/faq
- Free: Authentifizierung ist **vorkonfiguriert** (Dienst-definiert). Eigene Registrierungen (Custom Auth) gibt es nur in Standard. Quelle: https://learn.microsoft.com/azure/static-web-apps/plans
- Free: keine privaten Endpunkte, keine Custom-Rollen per Funktion. Quelle: https://learn.microsoft.com/azure/static-web-apps/plans
- Free: maximale App-Groesse 250 MB, zwei Custom Domains. Videos gehoeren deshalb in den Blob-Storage, nicht in die SWA. Quelle: https://learn.microsoft.com/azure/static-web-apps/plans
- Ob GitHub unter den vorkonfigurierten Anbietern im Free-Plan ist: **UNBELEGT** in dieser Recherche. Vor dem Umsetzen des GitHub-Logins in der Learn-Seite https://learn.microsoft.com/azure/static-web-apps/authentication-authorization pruefen.

### 2.2 Managed Identity im Free-Plan: NICHT verfuegbar fuer die API

- Quelle FAQ: "Static Web Apps supports managed identity, but it's only used to retrieve authentication secrets from Key Vault. If you need managed identity or Key Vault references in your API, use the bring your own Functions app feature" (https://learn.microsoft.com/azure/static-web-apps/faq#does-static-web-apps-support-managed-identity).
- Quelle Key-Vault-Seite: "Using managed identity is only available in the Azure Static Web Apps Standard plan." (https://learn.microsoft.com/azure/static-web-apps/key-vault-secrets)
- Schluesselfolgerung: **Im Free-Plan gibt es keine MI fuer die Cosmos-Abfrage aus der API. Zugriff ueber Schluessel-Verbindungszeichenfolge in den App-Einstellungen.** Fuer MI braeuchte man Standard (Preis UNBELEGT, Preisseite nicht abgerufen).

### 2.3 Bicep: SWA ohne Repository-Verknuepfung, App-Einstellungen aus Cosmos

Ressourcentyp und Eigenschaften belegt: https://learn.microsoft.com/azure/templates/microsoft.web/staticsites/config-appsettings . API-Version `2024-11-01` belegt als existierende Version, "Latest" nicht geprueft. Die Eigenschaft `repositoryUrl` wird weggelassen (kein GitHub-Link, Deployment per CLI).

Regeln fuer App-Einstellungen (belegt, https://learn.microsoft.com/azure/static-web-apps/application-settings): nur alphanumerische Zeichen, `.` und `_`. Werte werden verschluesselt gespeichert. Einstellungen gelten fuer das Backend (API), nicht fuer den Frontend-Build.

```bicep
// main.bicep
targetScope = 'resourceGroup'

@description('Region fuer Cosmos DB und Storage')
param location string = 'germanywestcentral'

@description('Region der Static Web App (Free-Plan: verfuegbare Regionen UNBELEGT, ggf. anpassen)')
param swaLocation string = 'westeurope'

param prefix string = 'lernapp'

@description('Budget-Benachrichtigung')
param budgetMail string

@secure()
@description('Anthropic-Schluessel: nur zur Deployment-Zeit aus Umgebungsvariable uebergeben, nie im Repo')
param anthropicApiKey string

@secure()
@description('Salt fuer Hashes. Default newGuid() ist nur als Parameter-Default erlaubt (belegt). Beim Redeploy ohne Wert wird neu erzeugt, deshalb beim Deploy immer explizit uebergeben.')
param authSalt string = newGuid()

var uniq = uniqueString(resourceGroup().id)
var cosmosName = toLower('${prefix}-cdb-${uniq}')
var storageName = toLower(take('${prefix}st${uniq}', 24))
var swaName = '${prefix}-swa'

module cosmosMod 'cosmos.bicep' = {
  name: 'cosmos'
  params: {
    location: location
    accountName: cosmosName
  }
}

resource st 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: true // belegt: AllowBlobPublicAccess (anonymous-read-access-configure)
  }
}

resource swa 'Microsoft.Web/staticSites@2024-11-01' = {
  name: swaName
  location: swaLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

resource swaSettings 'Microsoft.Web/staticSites/config@2024-11-01' = {
  parent: swa
  name: 'appsettings'
  properties: {
    COSMOS_CONNECTION_STRING: cosmosMod.outputs.cosmosConnectionString // siehe Hinweis unten
    COSMOS_DATABASE: 'app'
    COSMOS_CONTAINER: 'items'
    AUTH_SALT: authSalt
    ANTHROPIC_API_KEY: anthropicApiKey
  }
}

output swaHostname string = swa.properties.defaultHostname
```

Hinweis zu `cosmosMod.outputs.cosmosConnectionString`: Das Modul in 1.5 gibt bewusst KEIN Connection-String-Output aus. Damit das obige Beispiel laeuft, muss im Modul entweder `output cosmosConnectionString string = cosmosConnectionString` stehen (dann ist der Schluessel im Deployment-Ausgabeprotokoll sichtbar, also **nicht** empfohlen), oder die Zeichenfolge wird direkt in `main.bicep` ueber `listConnectionStrings` ermittelt. Empfehlung: Im Modul `cosmos.bicep` oder direkt in `main.bicep` das `listConnectionStrings()`-Ergebnis nur im Ressourcenparameter verwenden und keinen Output anlegen. Dann bleibt der Wert ausserhalb der Ausgaben. Ob Deployment-Historie den Wert trotzdem enthaelt, ist **UNBELEGT**. Der Learn-Linter sagt nur, dass `@secure()`-Parameter nicht in der Deployment-Historie gespeichert werden (https://learn.microsoft.com/azure/azure-resource-manager/bicep/linter-rule-secure-parameter-default).

Schluessel-Quelle belegt: `az cosmosdb keys list --type connection-strings` (https://learn.microsoft.com/cli/azure/cosmosdb/keys) und `listConnectionStrings` (https://learn.microsoft.com/javascript/api/@azure/arm-cosmosdb/databaseaccountsoperations). Die Bicep-Schreibweise `cosmos.listConnectionStrings()` ist **UNBELEGT**; bei Fehler im what-if auf `listConnectionStrings(cosmos.id, cosmos.apiVersion)` umstellen.

### 2.4 Ueberschreibt ein Bicep-Deployment manuell gesetzte App-Einstellungen?

- Belegt: `az staticwebapp appsettings set` **fuegt hinzu oder aendert** die angegebenen Einstellungen (Beschreibung: "Add to or change the app settings of the static app"). Quelle: https://learn.microsoft.com/cli/azure/staticwebapp/appsettings
- **UNBELEGT:** ob die Ressource `Microsoft.Web/staticSites/config` mit `name: 'appsettings'` beim Deployment die gesamte Liste ersetzt. Die Learn-Seite beschreibt nur die Struktur, nicht das Merge-Verhalten. Vermutung: Sie ersetzt die Liste, sodass Einstellungen, die nicht im Bicep stehen, entfernt werden.
- **Loesung (empfohlen):** Bicep ist die einzige Quelle fuer alle App-Einstellungen. Der Schluessel wird beim Deployment als `@secure()`-Parameter aus einer Umgebungsvariable uebergeben, nicht im Repo gespeichert. Ad-hoc-Aenderungen per CLI nur als Uebergangsloesung, weil ein Redeploy sie sonst ueberschreiben koennte.
- **Alternative:** Die `appsettings`-Ressource weglassen und alle Einstellungen per CLI setzen. Dann gibt es kein Ueberschreiben durch Bicep, aber die Konfiguration ist nicht reproduzierbar.
- **Pruefen nach dem ersten Deployment:** `az staticwebapp appsettings list --name lernapp-swa -g rg-lernapp`

## 3. Storage-Konto fuer oeffentlich lesbare Videos (mp4, vtt, png)

### 3.1 Bicep

- Standard_LRS und StorageV2 sind in einem Learn-Beispiel belegt (https://learn.microsoft.com/azure/azure-resource-manager/bicep/linter-rule-use-stable-resource-identifier). API-Version `2023-05-01` ist **UNBELEGT** (nicht gegen Latest geprueft).
- Anonymer Lesezugriff: Auf Kontoebene `allowBlobPublicAccess` (belegt). Auf Container-Ebene `publicAccess: 'Blob'` (Bezeichnung aus dem Learn-Konzept "anonymous read access for containers", Bicep-Eigenschaft **UNBELEGT** im Abruf). Quelle: https://learn.microsoft.com/azure/storage/blobs/anonymous-read-access-configure
- Warnung: Anonymer Zugriff macht alle Blobs im Container oeffentlich lesbar. Nur fuer Lerninhalte nutzen, keine personenbezogenen Daten ablegen.

```bicep
resource blobSvc 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: st
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [ 'https://${swa.properties.defaultHostname}' ]
          allowedMethods: [ 'GET', 'HEAD', 'OPTIONS' ]
          allowedHeaders: [ '*' ]
          exposedHeaders: [ 'Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag' ]
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobSvc
  name: 'media'
  properties: {
    publicAccess: 'Blob' // UNBELEGT im Abruf, nach what-if pruefen
  }
}
```

Wichtig: `swa` muss im Template vor `blobSvc` existieren oder ueber `dependsOn` abhaengig sein. Im Beispiel in 2.3 ist das der Fall, sofern die Ressourcen im selben File stehen.

### 3.2 CORS (belegt)

- Ursprung muss exakt uebereinstimmen (Gross-/Kleinschreibung, ohne Slash am Ende). Quelle: https://learn.microsoft.com/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services#enabling-cors-for-azure-storage
- Maximal fuenf Regeln pro Dienst, maximal 2 KiB Gesamtgroesse. Gleiche Quelle.
- CORS ist keine Autorisierung. Oeffentliche Blobs bleiben ohne Auth lesbar. Gleiche Quelle.
- CLI-Alternative (belegt in Syntax): `az storage cors add --services b --methods GET HEAD OPTIONS --origins https://<swa-host>` (https://learn.microsoft.com/cli/azure/storage/cors). Ob dafuer ein Account-Key noetig ist, ist **UNBELEGT**. Bicep ist die bevorzugte Variante.

### 3.3 Upload-Befehl und noetige Rolle

Rolle: Zum Hochladen mit `--auth-mode login` braucht das Konto **Storage Blob Data Contributor** (belegt: https://learn.microsoft.com/azure/storage/blobs/assign-azure-role-data-access und https://learn.microsoft.com/rest/api/storageservices/blob-batch#authorization). Zusaetzlich fuer das Portal: **Reader** auf Kontoebene (belegt, gleiche Seite). Rollenzuweisung wirkt nach 1 bis 8 Minuten (belegt: https://learn.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-go#authenticate-to-azure-and-authorize-access-to-blob-data).

```bash
# Rolle fuer den eigenen Benutzer (Rollen-Syntax: UNBELEGT im Detail, Hilfe mit az role assignment create --help pruefen)
ST_ID=$(az storage account show -n lernappstXXXX -g rg-lernapp --query id -o tsv)
az role assignment create --assignee "<eigene-upn>" --role "Storage Blob Data Contributor" --scope "$ST_ID"

# Hochladen (belegte Flags: --destination, --source, --auth-mode login, --pattern, --overwrite)
az storage blob upload-batch \
  --account-name lernappstXXXX \
  --destination media \
  --source ./media-out \
  --pattern "*" \
  --overwrite \
  --auth-mode login
```

Content-Type fuer `.vtt` (`text/vtt`) sicherstellen. Ob die CLI den Typ aus der Endung ableitet, ist **UNBELEGT**. Notfalls mit `--content-type` oder je Datei setzen.

### 3.4 Kosten Storage (nicht belegt)

- Preis pro GB fuer LRS: **UNBELEGT** (Preisseite nicht abgerufen). Fuer 0,5 GB ist der Betrag nach Erfahrung gering, aber das ist keine belegte Aussage. Mit dem Azure-Preisrechner pruefen.
- Egress (Traffic aus dem Blob-Storage): **UNBELEGT**. Bei oeffentlichen Videos ist das der Kostentreiber, nicht der Speicher. Kann nicht per Learn-Quelle beziffert werden.
- Bandbreiten-Quoten der SWA Free: nicht abgerufen, **UNBELEGT**.

## 4. @azure/cosmos (Node SDK) Kurzreferenz

Belegt: Client aus Verbindungszeichenfolge (Learn-Beispiel mit `new CosmosClient(connectionString)`, https://learn.microsoft.com/azure/cosmos-db/development-loop#create-the-application). Mit Schluessel: `new CosmosClient({ endpoint, key })` (https://learn.microsoft.com/javascript/api/@azure/cosmos/items?view=azure-node-latest). Punktlesen, Replace, Delete und Abfrage mit `fetchAll()` stammen aus dem Learn-Schnellstart (https://learn.microsoft.com/azure/cosmos-db/quickstart-nodejs) und dem Beispiel oben. Die Partitionsoption bei Abfragen und die Bedingung fuer Replace sind **UNBELEGT** in der JS-Schreibweise, Fehler-Eigenschaft `err.code` ebenfalls **UNBELEGT**.

```js
// api/lib/cosmos.js  – Client einmal pro Prozess anlegen (Modul-Ebene wiederverwenden)
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const container = client
  .database(process.env.COSMOS_DATABASE || 'app')
  .container(process.env.COSMOS_CONTAINER || 'items');

module.exports = { container };
```

Wiederverwendung: Das Muster "Client auf Modul-Ebene" zeigt das Learn-Beispiel (Next.js-Sample). Die Empfehlung gilt damit fuer Functions allgemein (Empfehlung, nicht als Learn-Regel belegt).

```js
const { container } = require('../lib/cosmos');

// Anlegen (409, wenn id schon existiert)
await container.items.create({ id, pk: 'u:' + login, kind: 'program', body });

// Upsert (ersetzt oder legt an, ohne ETag-Pruefung)
await container.items.upsert({ id, pk: 'u:' + login, kind: 'program', body });

// Punktlesen (Learn-Muster: id + Partitionsschluessel)
const { resource } = await container.item(id, 'u:' + login).read();
// 404: resource ist dann undefined (UNBELEGT, ob SDK wirft; Fehlerbehandlung beides abdecken)

// Optimistische Sperre: nur ersetzen, wenn ETag noch passt
// Optionsname accessCondition ist UNBELEGT in der JS-Schreibweise; C#-Entsprechung belegt (AccessCondition, IfMatch)
await container.item(id, 'u:' + login).replace(doc, {
  accessCondition: { type: 'IfMatch', condition: doc._etag },
});

// Abfrage innerhalb einer Partition (Partitionsoption UNBELEGT in der JS-Schreibweise)
const { resources } = await container.items
  .query(
    { query: 'SELECT * FROM c WHERE c.kind = @k', parameters: [{ name: '@k', value: 'program' }] },
    { partitionKey: 'u:' + login }
  )
  .fetchAll();

// Loeschen
await container.item(id, 'u:' + login).delete();
```

Fehlercodes (belegt, https://learn.microsoft.com/rest/api/cosmos-db/http-status-codes-for-cosmosdb):

| Code | Bedeutung | Behandlung |
|---|---|---|
| 404 | Ressource fehlt | Lesen: "nicht gefunden" zurueckgeben. Loeschen: idempotent als Erfolg werten |
| 409 | ID existiert bereits (POST/PUT) | Anlegen: Konflikt melden |
| 412 | ETag passt nicht (Optimistic Concurrency) | Neu lesen, ETag aktualisieren, erneut versuchen |
| 429 | RU-Limit (Rate Limit) | SDK wiederholt standardmaessig; Wartezeit steht in `x-ms-retry-after-ms`. Quelle: https://learn.microsoft.com/azure/cosmos-db/conceptual-resilient-sdk-applications |
| 449 | Transienter Schreibfehler | Sicher wiederholbar (SDK wiederholt) |
| 408, 503 | Timeout, Verbindungsfehler | Lesen wird vom SDK wiederholt; Schreiben nicht (nicht idempotent) |

Dazu: Die Quelle nennt 413 (Dokument > 2 MB). Bei Programmen mit grossen Inhalten daran denken.

## 5. Budget mit E-Mail-Warnung (30 USD)

- Ressourcentyp belegt: `Microsoft.Consumption/budgets`, Eigenschaften (Benachrichtigungen mit `threshold`, `operator`, `contactEmails`, `thresholdType` Actual/Forecasted, `enabled`). Quelle: https://learn.microsoft.com/azure/templates/microsoft.consumption/budgets. Eine Version mit Learn-Eintrag: 2023-11-01 (in der Liste belegt).
- Scope: Ressourcengruppe (belegt: Benachrichtigungs-E-Mail ist fuer RG-Scope Pflicht). Quelle: gleiche Seite.
- Schwellwerte: 0 bis 1000 Prozent, Benachrichtigung nach Ueberschreiten. Quelle: gleiche Seite.
- Berechtigung zum Anlegen: Cost Management Contributor oder `Microsoft.Consumption/budgets/write` (belegt: https://learn.microsoft.com/azure/cost-management-billing/costs/cost-management-error-codes#rbacaccessdenied)
- Benachrichtigungs-E-Mail kommt in der Regel innerhalb einer Stunde nach Auswertung (belegt: https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets)

```bicep
// Am Ende von main.bicep
resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: '${prefix}-budget-30'
  properties: {
    category: 'Cost'
    amount: 30
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '2026-12-01T00:00:00Z' // erster Tag eines Monats; Vergangenheit vermeiden
      endDate: '2027-12-31T00:00:00Z'   // UNBELEGT, ob Pflichtfeld
    }
    notifications: {
      actual80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [ budgetMail ]
      }
      forecast100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [ budgetMail ]
      }
    }
  }
}
```

Visual Studio Enterprise (MSDN):
- Budgets werden fuer Pay-as-you-go, MSDN und Visual-Studio-Abos unterstuetzt (belegt: https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets). Visual Studio Enterprise ist in der Liste der unterstuetzten Angebote aufgefuehrt (MS-AZR-0063P, belegt: https://learn.microsoft.com/azure/cost-management-billing/costs/understand-cost-mgt-data#supported-microsoft-azure-offers).
- Monatsguthaben: "Visual Studio Enterprise Standard: 150 USD monatlich, erneuerbar" (belegt: https://learn.microsoft.com/visualstudio/subscriptions/vs-azure-eligibility#eligibility).
- Kosten in Cost Management enthalten keine kostenlosen oder vorausbezahlten Guthaben (belegt: https://learn.microsoft.com/azure/cost-management-billing/costs/understand-cost-mgt-data#costs-included-in-cost-management). Das Budget zaehlt also die Brutto-Kosten. Die Warnung kann ausloesen, obwohl die Rechnung durch das Guthaben null ist. Das ist konservativ und gewollt, aber zu erwarten.
- Bei MSDN/VS-Angeboten koennen historische Kosten vom Rechnungsbetrag abweichen (belegt, gleiche Seite, Abschnitt "Historical data might not match invoice").
- Ob fuer das konkrete Abo "Dev/Test"-Preise gelten, ist **UNBELEGT**.

## 6. Deployment-Befehle

Belegt: `az group create --name <rg> --location <region>` (https://learn.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-cli). Das Anlegen einer Ressourcengruppe mit `az group create` ist also nachgewiesen.

Die folgenden Befehle sind **UNBELEGT** in Flags und Schreibweise (nicht abgerufen). Vor dem Lauf `az deployment group what-if --help` und `az deployment group create --help` pruefen:

```bash
az login
az account set --subscription "<Abo-Name-oder-ID>"

az group create --name rg-lernapp --location germanywestcentral

# Vorschau: zeigt Aenderungen, ohne etwas anzulegen
az deployment group what-if \
  --resource-group rg-lernapp \
  --template-file main.bicep \
  --parameters budgetMail="<eigene-mail>" anthropicApiKey="$ANTHROPIC_API_KEY" authSalt="<fester-salt-wert>"

# Deployment
az deployment group create \
  --resource-group rg-lernapp \
  --template-file main.bicep \
  --parameters budgetMail="<eigene-mail>" anthropicApiKey="$ANTHROPIC_API_KEY" authSalt="<fester-salt-wert>"
```

PowerShell: Statt `$ANTHROPIC_API_KEY` `$env:ANTHROPIC_API_KEY` verwenden. Der `authSalt`-Wert soll einmal erzeugt, sicher abgelegt (z. B. in Key Vault auf Entwicklerrechner oder in einem Passwortmanager) und bei jedem Deployment gleich uebergeben werden. Sonst aendert sich der Salt beim Redeploy.

SWA-Deployment (CLI, ohne Repository): Die Learn-Seite fuer die SWA-CLI belegt `swa deploy` nicht gesondert in dieser Recherche. **UNBELEGT** im Detail. Quelle fuer die CLI-Konfiguration: https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-configuration

Quelle fuer SWA-CLI-Deploy-Befehl: https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy (nicht abgerufen, daher nicht belegt in diesem Dokument).

Einzelne Einstellung nachtraeglich setzen, ohne andere zu beruehren (belegt, Flags `--name`, `--setting-names`, `-g`):

```bash
az staticwebapp appsettings set --name lernapp-swa -g rg-lernapp --setting-names "ANTHROPIC_API_KEY=<wert>"
```

Mehrere Eintraege gleichzeitig: mehrere `key=value`-Paare hintereinander angeben (belegt: "Tip: You can add or update multiple settings by passing multiple name-value pairs").

Einstellungen anzeigen und loeschen (belegt): `az staticwebapp appsettings list --name lernapp-swa -g rg-lernapp`, `az staticwebapp appsettings delete --name lernapp-swa -g rg-lernapp --setting-names ANTHROPIC_API_KEY`.

## Offene Unsicherheiten

1. Serverless in germanywestcentral und westeurope: keine explizite Regionsliste abgerufen (UNBELEGT). Vor Deployment mit what-if pruefen.
2. Ueberschreiben App-Einstellungen durch Bicep: UNBELEGT. Nach dem ersten Deployment mit `appsettings list` pruefen.
3. Bicep-Schreibweise `listConnectionStrings()` und `publicAccess: 'Blob'`, `backupPolicy`-Struktur, API-Versionen: aus dem Learn-Muster, aber nicht vollstaendig belegt. `az bicep build` und what-if pruefen.
4. Preise Storage (LRS), Egress, Cosmos-Serverless in der jeweiligen Region, SWA-Standard: UNBELEGT (Preisseiten nicht abgerufen).
5. Ob GitHub im Free-Plan als vorkonfigurierter Login verfuegbar ist: UNBELEGT in dieser Recherche.
6. Ob die Deployment-Historie den Verbindungszeichenfolgen-Wert enthaelt, wenn er als Ressourceneigenschaft gesetzt wird: UNBELEGT.
