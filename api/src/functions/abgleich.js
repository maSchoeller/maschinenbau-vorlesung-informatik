'use strict';
const { app } = require('@azure/functions');
const { ok, sicher, wirf, ApiFehler } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');

/** Prüft einen Eintrag; wirft ApiFehler (400/413) bei Ungültigem. */
function eintragPruefen(e, jetzt) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) wirf(400, 'eintrag-ungueltig', 'Jeder Eintrag muss ein Objekt sein.');
  const pfad = pruefen.pfad(e.pfad);
  const g = pruefen.geaendertGeprueft(e.geaendert, jetzt);
  if (e.geloescht !== undefined && typeof e.geloescht !== 'boolean') {
    wirf(400, 'eintrag-ungueltig', "Das Feld 'geloescht' muss true oder false sein.");
  }
  if (e.geloescht === true) return { pfad, geaendert: g.wert, geloescht: true, ersetzt: g.ersetzt };
  return { pfad, wert: pruefen.eintragWert(e.wert), geaendert: g.wert, geloescht: false, ersetzt: g.ersetzt };
}

// POST /api/abgleich {eintraege:[{pfad, wert, geaendert, geloescht?}], seit}
// → {uebernommen, eintraege:[Serverstand, der neuer ist bzw. seit 'seit' geändert wurde], serverzeit,
//    abgelehnt?: [{pfad, fehler, meldung}]}
// Ein ungültiger Eintrag lässt NICHT die ganze Anfrage scheitern: er steht in 'abgelehnt', der Rest
// wird angewendet. 400 gibt es nur für die Form der Anfrage selbst (Body, Liste, 'seit').
async function abgleich(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const body = await pruefen.body(request);
    const roh = body.eintraege === undefined ? [] : body.eintraege;
    if (!Array.isArray(roh)) wirf(400, 'eintraege-ungueltig', "Das Feld 'eintraege' muss eine Liste sein.");
    if (roh.length > pruefen.GRENZEN.ABGLEICH_MAX) {
      wirf(413, 'zu-viele', `Höchstens ${pruefen.GRENZEN.ABGLEICH_MAX} Einträge je Abgleich.`);
    }
    const seit = pruefen.seit(body.seit);
    const jetzt = Date.now();
    const liste = [];
    const abgelehnt = [];
    for (const e of roh) {
      try {
        liste.push(eintragPruefen(e, jetzt));
      } catch (err) {
        if (!(err instanceof ApiFehler)) throw err;
        const pfad = e && typeof e === 'object' && typeof e.pfad === 'string' ? e.pfad : null;
        abgelehnt.push({ pfad, fehler: err.fehler, meldung: err.message });
      }
    }
    return ok(await ablage().abgleich(b.benutzerId, liste, seit, abgelehnt));
  });
}

app.http('abgleich', { methods: ['POST'], authLevel: 'anonymous', route: 'abgleich', handler: sicher(abgleich) });

module.exports = { abgleich };
