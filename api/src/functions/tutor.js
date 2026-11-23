'use strict';
// POST /api/tutor (Vertrag Abschnitt 10)
// Body: {verlauf:[{rolle:'nutzer'|'tutor', text}], kontext:{lektion, seite, aufgabe, code, ausgabe}}
// 200 {antwort, rest:{heute}} · 400 Eingabe · 401 ohne Login · 403 {fehler:'freischaltung'} (KURS_CODE) · 429 {fehler:'tageslimit'|'kursbudget'}
// 503 {fehler:'nicht-eingerichtet'} ohne Schlüssel · 502 {fehler:'modell-fehler'} bei Fehlern des Modells
//
// Zählung: eine Frage zählt einmal (auch mit Prüfer-Aufruf und zweitem Versuch). Scheitert schon der
// erste Modellaufruf, wird die Nutzung erstattet. Geloggt werden nur Zähler und Token-Verbrauch.

const { app } = require('@azure/functions');
const { ok, json, sicher, wirf } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const limits = require('../lib/limits');
const kontext = require('../lib/tutor/kontext');
const modell = require('../lib/tutor/modell');
const { beantworte, ModellFehler } = require('../lib/tutor/ablauf');
const zugang = require('../lib/zugang');
const { ablage } = require('../lib/ablage');

const MELDUNG_429 = {
  tageslimit: 'Du hast heute alle Fragen an den Tutor verbraucht. Morgen geht es weiter.',
  kursbudget: 'Der Tutor hat für heute sein Kontingent für den ganzen Kurs erreicht. Morgen geht es weiter.',
};

function log(context, daten) {
  const f = context && typeof context.log === 'function' ? context.log.bind(context) : null;
  if (f) f(JSON.stringify({ ereignis: 'tutor', ...daten }));
}

async function tutor(request, context) {
  const b = verlangeBenutzer(request);
  const body = await pruefen.body(request);
  const anfrage = kontext.anfrageAusBody(body);     // 400 vor dem Zählen: ungültige Anfragen kosten nichts

  if (modell.doppelGewuenscht() && !modell.doppelAktiv()) log(context, { warnung: 'TUTOR_DOPPEL außerhalb der lokalen Umgebung ignoriert' });
  const client = modell.client();
  if (!client) wirf(503, 'nicht-eingerichtet', 'Der Tutor ist noch nicht eingerichtet.');

  // Freischaltung mit Kurscode (nur mit KURS_CODE): Wegwerf-Konten verbrauchen sonst das Kurskontingent
  if (zugang.freischaltungNoetig() && !zugang.freigeschaltet(await ablage().benutzerLesen(b.benutzerId))) {
    wirf(403, 'freischaltung', 'Der Tutor ist für Teilnehmende des Kurses. Gib einmal den Kurscode aus der Vorlesung ein.');
  }

  const { limitNutzer, limitKurs } = limits.tutorLimits();
  const k = await limits.pruefeUndZaehle({ benutzerId: b.benutzerId, art: 'tutor', limitNutzer, limitKurs });
  if (!k.erlaubt) {
    return json(429, { fehler: k.grund, meldung: MELDUNG_429[k.grund] || MELDUNG_429.tageslimit, rest: { heute: k.restNutzer } });
  }

  let e;
  try {
    e = await beantworte(anfrage, { client, modell: modell.modellId(), pruefer: modell.prueferAn() });
  } catch (err) {
    await limits.erstatte({ benutzerId: b.benutzerId, art: 'tutor' });
    const art = err instanceof ModellFehler ? err.art : 'intern';
    log(context, { fehler: art, client: client.art });
    wirf(502, 'modell-fehler', art === 'zeitueberschreitung'
      ? 'Der Tutor hat zu lange gebraucht. Bitte versuche es noch einmal.'
      : 'Der Tutor ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal.');
  }

  const p = e.protokoll;
  log(context, {
    client: client.art, versuche: p.versuche, prueferAufrufe: p.prueferAufrufe, prueferAusfall: p.prueferAusfall,
    prueferUrsache: p.prueferUrsache || null, ersetzt: p.ersetzt, abgelehnt: p.abgelehnt, gruende: p.gruende, mitAufgabe: Boolean(anfrage.aufgabe),
    tokens: p.tokens, ms: p.ms,
  });
  return ok({ antwort: e.antwort, rest: { heute: k.restNutzer } });
}

app.http('tutor', { methods: ['POST'], authLevel: 'anonymous', route: 'tutor', handler: sicher(tutor) });

module.exports = { tutor };
