'use strict';
// Erkennung "lokal" gegenüber "Produktion" an genau einer Stelle.
//
// Regel (dokumentiert in docs/app/BETRIEB.md und docs/app/uebergaben/api.md):
//   LOKAL  = die Einstellung ABLAGE ist 'datei' oder 'speicher'  UND  der Prozess läuft nicht auf
//            der Azure-Plattform (Umgebungsvariable WEBSITE_INSTANCE_ID fehlt; sie wird von
//            Azure App Service/Functions gesetzt, nicht von den Core Tools).
//   PRODUKTION = alles andere.
// Folgen in Produktion: Ablage nur über COSMOS_VERBINDUNG (sonst 503), BENUTZER_SALT ist Pflicht
// (sonst 503). Lokal dürfen ABLAGE=datei|speicher und ein fester Entwicklungs-Salt verwendet werden.
// Damit kann eine vergessene Einstellung in Azure nie still in den Arbeitsspeicher schreiben.

function ablageWunsch() {
  const a = String(process.env.ABLAGE || '').trim().toLowerCase();
  return a === 'datei' || a === 'speicher' ? a : null;
}

function aufAzure() {
  return Boolean(process.env.WEBSITE_INSTANCE_ID);
}

function istLokal() {
  return ablageWunsch() !== null && !aufAzure();
}

module.exports = { istLokal, ablageWunsch, aufAzure };
