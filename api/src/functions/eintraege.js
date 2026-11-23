'use strict';
const { app } = require('@azure/functions');
const { ok, json, sicher, wirf } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage, eintragAusgabe } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');

function pfadAusRoute(request) {
  let p = request.params && request.params.pfad;
  if (typeof p !== 'string') p = '';
  if (p.includes('%')) {
    try { p = decodeURIComponent(p); } catch { wirf(400, 'pfad-ungueltig', 'Der Pfad des Eintrags ist ungültig.'); }
  }
  return pruefen.pfad(p);
}

function antwortAufErgebnis(r) {
  if (r.status === 'uebernommen' || r.status === 'gleich') return ok({ eintrag: eintragAusgabe(r.eintrag) });
  if (r.status === 'grenze') {
    wirf(403, 'grenze-erreicht', `Je Konto sind höchstens ${ablage().MAX_EINTRAEGE} Einträge und 10 MB möglich.`);
  }
  if (r.status === 'konto-geloescht') {
    wirf(410, 'konto-geloescht', 'Das Konto wurde gelöscht; ältere Stände werden nicht wieder aufgenommen.');
  }
  return json(409, {
    fehler: 'server-neuer',
    meldung: 'Auf dem Server liegt ein neuerer Stand.',
    eintrag: eintragAusgabe(r.eintrag),
  });
}

// GET /api/eintraege?seit=<ISO>
async function liste(request) {
  const b = verlangeBenutzer(request);
  const seit = pruefen.seit(request.query.get('seit'));
  return gebremst(b.benutzerId, request, async () => ok(await ablage().eintraegeSeit(b.benutzerId, seit)));
}

// PUT /api/eintraege/{*pfad} {wert, geaendert}
async function setzen(request) {
  const b = verlangeBenutzer(request);
  const pfad = pfadAusRoute(request);
  return gebremst(b.benutzerId, request, async () => {
    const body = await pruefen.body(request);
    const wert = pruefen.eintragWert(body.wert);
    const geaendert = pruefen.geaendert(body.geaendert, Date.now());
    const r = await ablage().eintragSetzen(b.benutzerId, { pfad, wert, geaendert, geloescht: false });
    return antwortAufErgebnis(r);
  });
}

// DELETE /api/eintraege/{*pfad}?geaendert=<ISO>  → Löschmarke (ohne geaendert: Serverzeit)
async function loeschen(request) {
  const b = verlangeBenutzer(request);
  pruefen.aenderndeAnfrage(request);
  const pfad = pfadAusRoute(request);
  const q = request.query.get('geaendert');
  const jetzt = Date.now();
  const geaendert = q ? pruefen.geaendert(q, jetzt) : new Date(jetzt).toISOString();
  return gebremst(b.benutzerId, request, async () => {
    const r = await ablage().eintragSetzen(b.benutzerId, { pfad, geaendert, geloescht: true });
    return antwortAufErgebnis(r);
  });
}

async function eintrag(request, context) {
  return request.method === 'DELETE' ? loeschen(request, context) : setzen(request, context);
}

app.http('eintraegeListe', { methods: ['GET'], authLevel: 'anonymous', route: 'eintraege', handler: sicher(liste) });
app.http('eintrag', { methods: ['PUT', 'DELETE'], authLevel: 'anonymous', route: 'eintraege/{*pfad}', handler: sicher(eintrag) });

module.exports = { liste, eintrag };
