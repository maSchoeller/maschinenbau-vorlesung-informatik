// App-Einstellungen der Static Web App, ohne Vorhandenes zu zerstören, und Sicherung des Salts
// im Key Vault.
//
// Hintergrund: 'Microsoft.Web/staticSites/config' mit Namen 'appsettings' ist ein PUT der
// GESAMTEN Liste (REST: "Create or update app settings"). Ein schlichtes Deployment würde also
// alles entfernen, was nicht im Template steht – etwa den vom Besitzer per CLI gesetzten
// ANTHROPIC_API_KEY – und bei newGuid() den Salt neu würfeln (alle Konten wären verwaist).
//
// Lösung: Vor dem Schreiben werden die vorhandenen Einstellungen mit listAppSettings() gelesen
// (REST: POST .../staticSites/{name}/listAppSettings) und zusammengeführt:
//
//   union( { BENUTZER_SALT: saltKandidat }      // nur mit neuenSaltErlauben (echtes Erstdeployment)
//          vorhanden,                           // Vorhandenes gewinnt (Salt, ANTHROPIC_API_KEY, alles Manuelle)
//          { BENUTZER_SALT: saltAusTresor },    // nur wenn übergeben: der Tresor gewinnt beim Salt
//          { COSMOS_VERBINDUNG, verwaltet } )   // von Bicep verwaltet: gewinnt immer
//
// union() übernimmt bei gleichen Schlüsseln den Wert des späteren Objekts.
// Quelle der Wahrheit für den Salt also: 1. Tresor, 2. vorhandene SWA-Einstellung, 3. neuer
// Zufallswert (nur wenn ausdrücklich erlaubt). Welcher Fall vorliegt, entscheidet
// infra/salt-fall.ps1 vor dem Deployment.
//
// Mit saltSichern = true wird der wirksame Salt als Geheimnis in den Tresor geschrieben, und zwar
// VOR den App-Einstellungen (dependsOn). Das geschieht nur, wenn der Tresor ihn noch nicht hat: Jeder
// PUT eines Geheimnisses legt eine neue Version an, deshalb wird bei Folgedeployments gar nicht
// geschrieben.
//
// Dieses Modul läuft in einem eigenen (verschachtelten) Deployment nach der SWA, daher existiert
// sie, wenn listAppSettings ausgewertet wird. Sichere Parameter und alles, was aus listAppSettings
// stammt, bleiben innerhalb des Moduls (Bicep-Module werten im inneren Geltungsbereich aus) und
// erscheinen nicht im Deployment-Verlauf.

param swaName string
param cosmosName string
param tresorName string
param geheimnisName string

@secure()
param saltKandidat string

@secure()
param saltAusTresor string = ''

param saltSichern bool = false
param neuenSaltErlauben bool = false

@description('Von Bicep verwaltete, nicht geheime Einstellungen (gewinnen gegenüber Vorhandenem).')
param verwaltet object

resource swa 'Microsoft.Web/staticSites@2024-04-01' existing = {
  name: swaName
}

resource konto 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' existing = {
  name: cosmosName
}

resource tresor 'Microsoft.KeyVault/vaults@2025-05-01' existing = {
  name: tresorName
}

// '.?' und '?? {}': eine frisch angelegte SWA kann ohne 'properties' antworten
var vorhanden = swa.listAppSettings().?properties ?? {}

var verbindung = konto.listConnectionStrings().connectionStrings[0].connectionString

var kandidat = neuenSaltErlauben ? { BENUTZER_SALT: saltKandidat } : {}
var ausTresor = empty(saltAusTresor) ? {} : { BENUTZER_SALT: saltAusTresor }

var wirksam = union(
  kandidat,
  vorhanden,
  ausTresor,
  { COSMOS_VERBINDUNG: verbindung },
  verwaltet
)

// Erst sichern, dann schreiben: Die Einstellungen hängen ausdrücklich vom Geheimnis ab. Scheitert dessen
// PUT (z. B. weil ein gleichnamiges Geheimnis soft-deleted ist), kommt ein neuer Salt nie in die SWA,
// ohne im Tresor gesichert zu sein. Ist das Geheimnis nicht Teil des Deployments (saltSichern = false),
// entfernt Resource Manager die Abhängigkeit (learn.microsoft.com/azure/azure-resource-manager/bicep/
// conditional-resource-deployment).
resource einstellungen 'Microsoft.Web/staticSites/config@2024-04-01' = {
  parent: swa
  name: 'appsettings'
  properties: wirksam
  dependsOn: [
    geheimnis
  ]
}

// Erste Sicherung: wirksamer Salt (vorhandener Salt der SWA bzw. beim Erstdeployment der Kandidat).
// Fehlt BENUTZER_SALT in 'wirksam', scheitert das Deployment hier, statt etwas Leeres zu sichern.
// Der Ausdruck steht hinter '?:', weil Werte bedingter Ressourcen mit list-Funktionen auch dann
// ausgewertet werden, wenn die Ressource nicht bereitgestellt wird; '?:' wertet nur den gewählten Zweig
// aus. So bricht ein Deployment mit saltSichern = false nicht ab, wenn die SWA keinen Salt hat.
resource geheimnis 'Microsoft.KeyVault/vaults/secrets@2025-05-01' = if (saltSichern) {
  parent: tresor
  name: geheimnisName
  properties: {
    value: saltSichern ? wirksam.BENUTZER_SALT : ''
    contentType: 'BENUTZER_SALT der Lern-App, nicht aendern'
    attributes: {
      enabled: true
    }
  }
}

// bewusst keine Ausgaben (Geheimnisse)
