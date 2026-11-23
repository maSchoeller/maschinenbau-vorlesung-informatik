// App-Einstellungen der Static Web App, ohne Vorhandenes zu zerstören.
//
// Hintergrund: 'Microsoft.Web/staticSites/config' mit Namen 'appsettings' ist ein PUT der
// GESAMTEN Liste (REST: "Create or update app settings"). Ein schlichtes Deployment würde also
// alles entfernen, was nicht im Template steht – etwa den vom Besitzer per CLI gesetzten
// ANTHROPIC_API_KEY – und bei newGuid() den Salt neu würfeln (alle Konten wären verwaist).
//
// Lösung: Vor dem Schreiben werden die vorhandenen Einstellungen mit listAppSettings() gelesen
// (REST: POST .../staticSites/{name}/listAppSettings) und zusammengeführt:
//
//   union( { BENUTZER_SALT: saltKandidat },   // nur Vorschlag für das Erstdeployment
//          vorhanden,                         // Vorhandenes gewinnt (Salt, ANTHROPIC_API_KEY, alles Manuelle)
//          { COSMOS_VERBINDUNG, verwaltet } ) // von Bicep verwaltet: gewinnt immer
//
// union() übernimmt bei gleichen Schlüsseln den Wert des späteren Objekts.
// Erstdeployment: Die SWA ist gerade angelegt, listAppSettings liefert {} → Salt aus saltKandidat.
// Dieses Modul läuft in einem eigenen (verschachtelten) Deployment nach der SWA, daher existiert
// sie, wenn listAppSettings ausgewertet wird.

param swaName string
param cosmosName string

@secure()
param saltKandidat string

@description('Von Bicep verwaltete, nicht geheime Einstellungen (gewinnen gegenüber Vorhandenem).')
param verwaltet object

resource swa 'Microsoft.Web/staticSites@2024-04-01' existing = {
  name: swaName
}

resource konto 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' existing = {
  name: cosmosName
}

// '.?' und '?? {}': eine frisch angelegte SWA kann ohne 'properties' antworten
var vorhanden = swa.listAppSettings().?properties ?? {}

var verbindung = konto.listConnectionStrings().connectionStrings[0].connectionString

resource einstellungen 'Microsoft.Web/staticSites/config@2024-04-01' = {
  parent: swa
  name: 'appsettings'
  properties: union(
    { BENUTZER_SALT: saltKandidat },
    vorhanden,
    { COSMOS_VERBINDUNG: verbindung },
    verwaltet
  )
}

// bewusst keine Ausgaben (Geheimnisse)
