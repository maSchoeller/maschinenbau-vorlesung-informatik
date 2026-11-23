'use strict';
const { app } = require('@azure/functions');
const { ok, sicher, wirf } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const { ablage } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');
const { istDozent } = require('../lib/dozent');
const { kursstruktur } = require('../lib/kursstruktur');
const gruppenbild = require('../lib/gruppenbild');

// Das Gruppenbild liest partitionsübergreifend. Es wird je Function-Instanz kurz aufbewahrt,
// damit „Aktualisieren“ im Hörsaal nichts kostet.
const AUFBEWAHREN_MS = 30 * 1000;
let gemerkt = null;   // {ablage, zeit, daten}

// GET /api/dozent/uebersicht → {stand, mindest, konten, genug, lektionen:[{nr, konten, abschnitte, stationen, teile, quiz}]}
// 401 ohne Login · 403 kein-dozent · 503 ohne Kursstruktur
async function uebersicht(request) {
  const b = verlangeBenutzer(request);
  if (!istDozent(b.benutzerId)) {
    wirf(403, 'kein-dozent', 'Dieses Konto ist nicht als Dozent eingetragen.');
  }
  return gebremst(b.benutzerId, request, async () => {
    const kurs = kursstruktur();
    if (!kurs) wirf(503, 'nicht-eingerichtet', 'Die Kursstruktur fehlt auf dem Server (api/daten/aufgaben.json ohne Feld kurs).');
    const a = ablage();
    if (!gemerkt || gemerkt.ablage !== a || Date.now() - gemerkt.zeit > AUFBEWAHREN_MS) {
      const docs = await a.eintraegeNachPfaden([...gruppenbild.pfade(kurs).keys()]);
      gemerkt = { ablage: a, zeit: Date.now(), daten: { stand: new Date().toISOString(), ...gruppenbild.berechne(kurs, docs) } };
    }
    return ok(gemerkt.daten);
  });
}

/** Nur für Tests: aufbewahrtes Gruppenbild verwerfen. */
function _vergessen() { gemerkt = null; }

app.http('dozentUebersicht', { methods: ['GET'], authLevel: 'anonymous', route: 'dozent/uebersicht', handler: sicher(uebersicht) });

module.exports = { uebersicht, _vergessen };
