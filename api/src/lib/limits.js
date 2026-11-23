'use strict';
// Kontingente und Obergrenzen.
//
// Tageszähler (atomar, konfliktsicher; in Cosmos über bedingtes Patch mit incr):
//   je Benutzer:  zaehler-Dokument  '<art>:<benutzerId>:<JJJJ-MM-TT>'
//   kursweit:     zaehler-Dokument  '<art>:kurs:<JJJJ-MM-TT>'
// Der Tag wechselt um Mitternacht deutscher Zeit (Europe/Berlin). Die Dokumente verfallen
// über die TTL des Containers 'zaehler' (8 Tage). Beim Kontolöschen bleiben sie bewusst stehen
// (nur pseudonyme Kennung und Anzahl), sonst ließe sich ein Tageskontingent durch Löschen erneuern.
//
// Schnittstelle für die Tutor-Rolle:
//   const limits = require('../lib/limits');
//   const r = await limits.pruefeUndZaehle({ benutzerId, art: 'tutor', limitNutzer: 40, limitKurs: 1500 });
//   // r = { erlaubt: true,  grund: null,         restNutzer: 39 }
//   // r = { erlaubt: false, grund: 'tageslimit', restNutzer: 0 }   (Benutzer hat sein Tageslimit erreicht)
//   // r = { erlaubt: false, grund: 'kursbudget', restNutzer: n }   (Kurs hat das Tagesbudget erreicht; nichts gezählt)
//   await limits.erstatte({ benutzerId, art: 'tutor' });            // z. B. wenn das Modell ausfiel (502)
//   await limits.stand({ benutzerId, art: 'tutor', limitNutzer: 40 }) // → { restNutzer } ohne zu zählen
//   limits.tutorLimits()  → { limitNutzer, limitKurs } aus TUTOR_LIMIT_NUTZER_TAG / TUTOR_LIMIT_KURS_TAG (Standard 40 / 1500)

const { ablage, MAX_EINTRAEGE, MAX_GETEILT } = require('./ablage');

const ART_RE = /^[a-z][a-z0-9-]{0,19}$/;

function tag(d = new Date()) {
  // 'sv-SE' liefert JJJJ-MM-TT
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function ids(benutzerId, art, d) {
  if (!ART_RE.test(art)) throw new Error('limits: ungültige art');
  const t = tag(d);
  return { nutzer: `${art}:${benutzerId}:${t}`, kurs: `${art}:kurs:${t}` };
}

function ganzzahl(wert, standard) {
  const n = Number.parseInt(wert, 10);
  return Number.isFinite(n) && n >= 0 ? n : standard;
}

/**
 * Prüft beide Tageskontingente und zählt atomar hoch.
 * @param {{benutzerId: string, art: string, limitNutzer: number, limitKurs: number}} o
 * @returns {Promise<{erlaubt: boolean, grund: null|'tageslimit'|'kursbudget', restNutzer: number}>}
 */
async function pruefeUndZaehle({ benutzerId, art, limitNutzer, limitKurs }) {
  const a = ablage();
  const k = ids(benutzerId, art);
  const nNutzer = await a.zaehlerAendern(k.nutzer, benutzerId, 1, limitNutzer);
  if (nNutzer === null) return { erlaubt: false, grund: 'tageslimit', restNutzer: 0 };
  const nKurs = await a.zaehlerAendern(k.kurs, null, 1, limitKurs);
  if (nKurs === null) {
    await a.zaehlerAendern(k.nutzer, benutzerId, -1, limitNutzer); // Ausgleich: nichts verbraucht
    return { erlaubt: false, grund: 'kursbudget', restNutzer: Math.max(0, limitNutzer - nNutzer + 1) };
  }
  return { erlaubt: true, grund: null, restNutzer: Math.max(0, limitNutzer - nNutzer) };
}

/** Gibt eine gezählte Nutzung zurück (beide Zähler, nie unter 0). */
async function erstatte({ benutzerId, art }) {
  const a = ablage();
  const k = ids(benutzerId, art);
  await a.zaehlerAendern(k.nutzer, benutzerId, -1, 0);
  await a.zaehlerAendern(k.kurs, null, -1, 0);
}

/** Restkontingent des Benutzers heute, ohne zu zählen. */
async function stand({ benutzerId, art, limitNutzer }) {
  const n = await ablage().zaehlerLesen(ids(benutzerId, art).nutzer);
  return { restNutzer: Math.max(0, limitNutzer - n) };
}

function tutorLimits() {
  return {
    limitNutzer: ganzzahl(process.env.TUTOR_LIMIT_NUTZER_TAG, 40),
    limitKurs: ganzzahl(process.env.TUTOR_LIMIT_KURS_TAG, 1500),
  };
}

// ---------------------------------------------------------------- Mengenbremse (alle Nicht-Tutor-Routen)
//
// Begrenzt, wie viel Datenbankarbeit ein Konto bzw. der ganze Kurs am Tag auslösen kann, damit eine
// Schleife (auch mit vielen GitHub-Konten) die Cosmos-Kosten nicht unbegrenzt treibt.
// Einheit "Punkt": jede Anfrage 1 Punkt, dazu 1 Punkt je angefangene 16 KB in Anfrage und Antwort.
// Gezählt wird gesammelt: Jede Function-Instanz merkt sich die Punkte im Arbeitsspeicher und
// schreibt sie ab BREMSE_SAMMELN Punkten mit einem bedingten Patch in die Tageszähler
// ('menge:<benutzerId>:<tag>', 'menge:kurs:<tag>', anonym 'anonym:kurs:<tag>'). Das kostet etwa
// 2 Patches je 50 Punkte statt je Anfrage. Ist eine Grenze erreicht, antwortet die Instanz bis zum
// Tageswechsel mit 429 'mengenbremse'. Ungenauigkeit: höchstens BREMSE_SAMMELN Punkte je Instanz.
//
//   MENGE_LIMIT_NUTZER_TAG   Standard 5000   (ein Tab, der jede Minute abgleicht, braucht ca. 600)
//   MENGE_LIMIT_KURS_TAG     Standard 200000 (ca. 100 aktive Studierende mit viel Reserve)
//   MENGE_LIMIT_ANONYM_TAG   Standard 50000  (GET /api/geteilt/{id} ohne Login, kursweit)

const BREMSE_SAMMELN = 50;
const PUNKT_BYTES = 16 * 1024;
const offenePunkte = new Map();  // schluessel → Punkte, noch nicht geschrieben
const gesperrt = new Map();      // schluessel → Tag, an dem die Grenze erreicht wurde

function bremsLimits() {
  return {
    nutzer: ganzzahl(process.env.MENGE_LIMIT_NUTZER_TAG, 5000),
    kurs: ganzzahl(process.env.MENGE_LIMIT_KURS_TAG, 200000),
    anonym: ganzzahl(process.env.MENGE_LIMIT_ANONYM_TAG, 50000),
  };
}

function bremsSchluessel(benutzerId, t) {
  return benutzerId
    ? { nutzer: `menge:${benutzerId}:${t}`, kurs: `menge:kurs:${t}` }
    : { nutzer: null, kurs: `anonym:kurs:${t}` };
}

function istGesperrt(schluessel, t) { return schluessel && gesperrt.get(schluessel) === t; }

function wirfBremse() {
  const { wirf } = require('./antwort');
  wirf(429, 'mengenbremse', 'Für heute sind zu viele Anfragen eingegangen. Deine Daten bleiben auf diesem Gerät gespeichert; der Abgleich geht morgen weiter.');
}

/** Vor der Arbeit: wirft 429, wenn diese Instanz die Grenze heute schon erreicht hat. */
function bremsePruefen(benutzerId) {
  const t = tag();
  const k = bremsSchluessel(benutzerId, t);
  if (istGesperrt(k.nutzer, t) || istGesperrt(k.kurs, t)) wirfBremse();
}

async function schreibePunkte(schluessel, benutzerId, punkte, grenze, t) {
  if (!schluessel) return;
  const n = await ablage().zaehlerAendern(schluessel, benutzerId, punkte, grenze);
  if (n === null) gesperrt.set(schluessel, t);
}

/** Nach der Arbeit: Punkte zählen, ab BREMSE_SAMMELN in die Datenbank schreiben. Fehler werden geschluckt. */
async function bremseZaehlen(benutzerId, bytesGesamt) {
  const t = tag();
  const k = bremsSchluessel(benutzerId, t);
  const punkte = 1 + Math.floor(Math.max(0, bytesGesamt || 0) / PUNKT_BYTES);
  const g = bremsLimits();
  // Benutzer- und Kurszähler sammeln getrennt (der Kurs auch über viele kleine Konten hinweg)
  const ziele = [
    [k.nutzer, benutzerId, g.nutzer],
    [k.kurs, null, benutzerId ? g.kurs : g.anonym],
  ];
  for (const [schluessel, bid, grenze] of ziele) {
    if (!schluessel) continue;
    const summe = (offenePunkte.get(schluessel) || 0) + punkte;
    if (summe < BREMSE_SAMMELN) { offenePunkte.set(schluessel, summe); continue; }
    offenePunkte.delete(schluessel);
    try { await schreibePunkte(schluessel, bid, summe, grenze, t); } catch { /* Zählen darf die Antwort nicht verhindern */ }
  }
  // alte Tage aus dem Arbeitsspeicher entfernen
  for (const [s, tg] of gesperrt) if (tg !== t) gesperrt.delete(s);
  if (offenePunkte.size > 10000) offenePunkte.clear();
}

/**
 * Umhüllt die Arbeit einer Route: prüft die Bremse vorher und zählt danach (auch bei Fehlern).
 * @param {string|null} benutzerId  null = anonym
 * @param {import('@azure/functions').HttpRequest} request
 * @param {() => Promise<object>} arbeit  liefert die HTTP-Antwort
 */
async function gebremst(benutzerId, request, arbeit) {
  bremsePruefen(benutzerId);
  let antwortBytes = 0;
  try {
    const antwort = await arbeit();
    antwortBytes = antwort && typeof antwort.body === 'string' ? Buffer.byteLength(antwort.body) : 0;
    return antwort;
  } finally {
    const anfrageBytes = Number(request && request.headers && request.headers.get('content-length')) || 0;
    await bremseZaehlen(benutzerId, anfrageBytes + antwortBytes);
  }
}

/** Nur für Tests: Arbeitsspeicher der Bremse leeren. */
function _bremseZuruecksetzen() { offenePunkte.clear(); gesperrt.clear(); }

module.exports = {
  pruefeUndZaehle, erstatte, stand, tutorLimits, tag,
  gebremst, bremsePruefen, bremseZaehlen, bremsLimits, _bremseZuruecksetzen, BREMSE_SAMMELN,
  MAX_EINTRAEGE, MAX_GETEILT,
};
