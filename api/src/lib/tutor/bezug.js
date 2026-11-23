'use strict';
// Hat eine Anfrage Aufgabenbezug? Davon hängen die Code-Grenzen der Nachprüfung, die Hinweise im
// Kontextblock und die Ersatzantwort ab.
//
//   streng (Aufgabenbezug): höchstens 3 Codezeilen am Stück / 6 gesamt, Lösungsweg- und Korrektur-Signale.
//   mittel (nur „wort“, keine Aufgabe bekannt): 5 am Stück / 8 gesamt.
//   locker (reine Konzeptfrage): Beispiele bis 8 Zeilen am Stück / 12 gesamt.
//
// Der Abgleich mit ALLEN Musterlösungen und das Stückeln über mehrere Beiträge gelten in beiden Fällen.
// Damit man die lockere Grenze nicht erschleichen kann, gilt Aufgabenbezug schon, wenn EINES zutrifft:
//   aufgabe    – der Server hat eine Aufgabe zur id gefunden (Labor oder Aufgabe in der Lerneinheit)
//   labor      – die Anfrage kommt aus dem Labor, auch ohne (gültige) Aufgaben-id
//   wort       – die Studierenden sprechen selbst von einer Aufgabe, Übung, Abgabe, Klausur …
//                (nur aktuelle Frage und der Nutzerbeitrag davor)
//   bestellung – „schreib mir ein Programm / eine Funktion …“ (fertige Programme auf Bestellung)
//   erkannt    – der Text enthält Teile einer Kursaufgabe (Funktionsname, vorgegebene Ausgabe,
//                längere wörtliche Passage des Aufgabentexts), auch in früheren Beiträgen

// „labor“ fehlt bewusst: Das Labor erkennt der Server an der Seite, und „Laborwert“ ist keine Aufgabe.
const AUFGABEN_WORT_RE = /aufgabe|übung|uebung|abgabe|klausur|testat/i;
// (^|[^a-zäöüß]) statt \b, weil \b in JavaScript Umlaute nicht als Buchstaben kennt
const BESTELLUNG_RE = /(^|[^a-zäöüß])(schreib|programmier|erstell|bau|lös|loes|implementier)[a-zäöüß]*[^.?!\n]{0,60}(programm|funktion|skript|lösung|loesung)/i;
// „Schreib mir ein Beispiel für eine Funktion“ ist eine Konzeptfrage („Beispielaufruf“ zählt nicht)
const BEISPIEL_RE = /(^|[^a-zäöüß])beispiel(e|en)?([^a-zäöüß]|$)/i;

function woerter(s) {
  return String(s || '').toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}

// Merkmale je Aufgabe einmal vorbereiten (Funktionsnamen, Ausgabetexte, 6-Wort-Folgen des Texts)
const MERKMALE = new WeakMap();
let HAEUFIG = null;            // 6-Wort-Folgen, die in vielen Aufgaben vorkommen (Einleitungstexte)
let HAEUFIG_VON = null;
const SCHINDEL = 6;

function schindeln(text) {
  const w = woerter(text);
  const s = new Set();
  for (let i = 0; i + SCHINDEL <= w.length; i++) s.add(w.slice(i, i + SCHINDEL).join(' '));
  return s;
}

function merkmale(a) {
  let m = MERKMALE.get(a);
  if (m) return m;
  const loesung = String(a.loesung || '');
  const namen = new Set();
  for (const t of loesung.matchAll(/\bdef\s+([A-Za-z_]\w*)\s*\(/g)) {
    const n = t[1].toLowerCase();
    if (n.length >= 8 || (n.includes('_') && n.length >= 6)) namen.add(n);
  }
  const ausgaben = new Set();
  for (const t of loesung.matchAll(/print\(\s*f?(["'])(.*?)\1/g)) {
    const s = t[2].replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (s.length >= 10 && /[a-zäöüß]{4,}/.test(s)) ausgaben.add(s);
  }
  m = { namen, ausgaben, schindeln: schindeln(a.text) };
  MERKMALE.set(a, m);
  return m;
}

function haeufigeSchindeln(alle) {
  if (HAEUFIG && HAEUFIG_VON === alle) return HAEUFIG;
  const zaehl = new Map();
  for (const a of alle) for (const s of merkmale(a).schindeln) zaehl.set(s, (zaehl.get(s) || 0) + 1);
  HAEUFIG = new Set([...zaehl].filter(([, n]) => n >= 5).map(([s]) => s));
  HAEUFIG_VON = alle;
  return HAEUFIG;
}

/**
 * Welche Kursaufgabe steckt im Text der Studierenden? (bester Treffer oder null)
 * Treffer: Funktionsname aus der Musterlösung, vorgegebene Ausgabe, oder mindestens zwei
 * 6-Wort-Folgen aus dem Aufgabentext (ohne Einleitungstexte, die in vielen Aufgaben stehen).
 */
function erkenneAufgabe(text, alle) {
  if (!text || !Array.isArray(alle) || !alle.length) return null;
  const klein = String(text).toLowerCase();
  const kleinNorm = klein.replace(/\s+/g, ' ');
  const eigene = schindeln(text);
  const haeufig = haeufigeSchindeln(alle);
  let best = null, bestPunkte = 0;
  for (const a of alle) {
    if (!a) continue;
    const m = merkmale(a);
    let punkte = 0;
    for (const n of m.namen) if (new RegExp('\\b' + n + '\\b').test(klein)) punkte += 3;
    for (const s of m.ausgaben) if (kleinNorm.includes(s)) punkte += 3;
    let sch = 0;
    for (const s of eigene) if (m.schindeln.has(s) && !haeufig.has(s)) sch += 1;
    if (sch >= 2) punkte += sch;
    if (punkte >= 2 && punkte > bestPunkte) { best = a; bestPunkte = punkte; }
  }
  return best;
}

/**
 * @param {object} anfrage aus kontext.anfrageAusBody
 * @param {object[]} alle  alle Aufgaben mit Musterlösung
 * @returns {{streng: boolean, mittel: boolean, grund: string|null, aufgabe: object|null}}
 *   aufgabe: die vom Server gewählte oder die im Text erkannte Aufgabe (für die Nachprüfung)
 *   mittel:  nur „wort“: streng, aber mit mittlerer Code-Grenze (5 am Stück), weil keine Aufgabe bekannt ist
 */
function aufgabenbezug(anfrage, alle = []) {
  const nutzer = (anfrage.verlauf || []).filter((b) => b.rolle === 'nutzer').map((b) => b.text);
  const text = nutzer.concat(anfrage.code ? [anfrage.code] : []).join('\n');
  const erkannt = anfrage.aufgabe ? null : erkenneAufgabe(text, alle);
  const aufgabe = anfrage.aufgabe || erkannt || null;
  // Wörter wie „Aufgabe“ nur in der aktuellen Frage und dem Beitrag davor: Eine frühere Erwähnung
  // soll nicht jede spätere Konzeptfrage im Gespräch streng machen.
  const zuletzt = nutzer.slice(-2);
  let grund = null;
  if (anfrage.aufgabe) grund = 'aufgabe';
  else if (anfrage.seite === 'labor') grund = 'labor';
  else if (erkannt) grund = 'erkannt';
  else if (nutzer.some((t) => BESTELLUNG_RE.test(t) && !BEISPIEL_RE.test(t))) grund = 'bestellung';
  else if (zuletzt.some((t) => AUFGABEN_WORT_RE.test(t))) grund = 'wort';
  return { streng: Boolean(grund), mittel: grund === 'wort', grund, aufgabe };
}

module.exports = { aufgabenbezug, erkenneAufgabe };
