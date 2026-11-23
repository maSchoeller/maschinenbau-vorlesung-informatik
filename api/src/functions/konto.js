'use strict';
const { app } = require('@azure/functions');
const { ok, sicher } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');

// GET /api/konto/export → alle Daten des Benutzers (Profil, Einträge, geteilte Programme)
async function exportieren(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const daten = await ablage().kontoExport(b.benutzerId);
    return ok(daten, { 'content-disposition': 'attachment; filename="lernapp-meine-daten.json"' });
  });
}

// DELETE /api/konto → löscht endgültig Einträge, geteilte Programme und Profil (Tageszähler verfallen nach 8 Tagen)
async function loeschen(request) {
  const b = verlangeBenutzer(request);
  pruefen.aenderndeAnfrage(request);
  const r = await ablage().kontoLoeschen(b.benutzerId);
  return ok({ geloescht: true, eintraege: r.eintraege, geteilt: r.geteilt });
}

app.http('kontoExport', { methods: ['GET'], authLevel: 'anonymous', route: 'konto/export', handler: sicher(exportieren) });
app.http('kontoLoeschen', { methods: ['DELETE'], authLevel: 'anonymous', route: 'konto', handler: sicher(loeschen) });

module.exports = { exportieren, loeschen };
