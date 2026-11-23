'use strict';
const { app } = require('@azure/functions');
const { ok, json, sicher, wirf } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage, MAX_GETEILT } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');

function nichtGefunden() {
  wirf(404, 'nicht-gefunden', 'Dieses geteilte Programm gibt es nicht (mehr).');
}

// GET /api/geteilt → eigene {eintraege:[{id, titel, erstellt}]}
async function eigene(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const liste = await ablage().geteiltVonBenutzer(b.benutzerId);
    liste.sort((x, y) => (x.erstellt < y.erstellt ? 1 : -1));
    return ok({ eintraege: liste.map((g) => ({ id: g.id, titel: g.titel, lektion: g.lektion || null, erstellt: g.erstellt })) });
  });
}

// POST /api/geteilt {titel, code, eingaben?, lektion?} → 201 {id, erstellt}
async function anlegen(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const body = await pruefen.body(request);
    const titel = pruefen.titel(body.titel);
    const code = pruefen.code(body.code);
    const eingaben = pruefen.eingaben(body.eingaben);
    const lektion = pruefen.lektion(body.lektion);
    const a = ablage();
    const profil = await a.benutzerLesen(b.benutzerId);
    if (!profil || !profil.anzeigename) {
      wirf(409, 'anzeigename-fehlt', 'Lege zuerst in deinem Konto einen Anzeigenamen fest, dann kannst du teilen.');
    }
    // Grenze atomar über den Kontozähler (auch bei gleichzeitigen Anfragen höchstens 50)
    const doc = await a.geteiltAnlegen(b.benutzerId, { titel, code, eingaben, lektion, autor: profil.anzeigename });
    if (!doc) wirf(403, 'grenze-erreicht', `Du kannst höchstens ${MAX_GETEILT} Programme teilen. Lösche zuerst ältere Links.`);
    return json(201, { id: doc.id, erstellt: doc.erstellt });
  });
}

// GET /api/geteilt/{id} (ohne Login)
async function lesen(request) {
  const id = request.params.id;
  if (!pruefen.geteiltId(id)) nichtGefunden();
  return gebremst(null, request, async () => {
    const g = await ablage().geteiltLesen(id);
    if (!g) nichtGefunden();
    return ok({
      id: g.id,
      titel: String(g.titel),
      code: String(g.code),
      eingaben: typeof g.eingaben === 'string' ? g.eingaben : '',
      lektion: g.lektion ? String(g.lektion) : null,
      autor: String(g.autor || ''),
      erstellt: g.erstellt,
    });
  });
}

// DELETE /api/geteilt/{id} → nur eigene
async function loeschen(request) {
  const b = verlangeBenutzer(request);
  pruefen.aenderndeAnfrage(request);
  const id = request.params.id;
  if (!pruefen.geteiltId(id)) nichtGefunden();
  return gebremst(b.benutzerId, request, async () => {
    const a = ablage();
    const g = await a.geteiltLesen(id);
    if (!g) nichtGefunden();
    if (g.benutzerId !== b.benutzerId) wirf(403, 'nicht-eigen', 'Du kannst nur deine eigenen geteilten Programme löschen.');
    await a.geteiltLoeschen(id, b.benutzerId);
    return ok({ geloescht: true, id });
  });
}

app.http('geteiltListe', {
  methods: ['GET', 'POST'], authLevel: 'anonymous', route: 'geteilt',
  handler: sicher((req, ctx) => (req.method === 'POST' ? anlegen(req, ctx) : eigene(req, ctx))),
});
app.http('geteiltEinzeln', {
  methods: ['GET', 'DELETE'], authLevel: 'anonymous', route: 'geteilt/{id}',
  handler: sicher((req, ctx) => (req.method === 'DELETE' ? loeschen(req, ctx) : lesen(req, ctx))),
});

module.exports = { eigene, anlegen, lesen, loeschen };
