'use strict';
// Ablauf einer Tutor-Antwort (Vertrag Abschnitt 10 Nr. 4–6), ohne HTTP, Login und Kontingent.
// Wird von der Function (functions/tutor.js) und vom Angriffs-Skript (tests/tutor-angriffe-lauf.js)
// gleich benutzt, damit der Prüflauf genau das prüft, was in Produktion läuft.
//
//   1. Antwort erzeugen (gecachter System-Prompt, Kontextblock, Datenblöcke)
//   2. Nachprüfung a (deterministisch, mit Musterlösung) und b (Prüfer-Aufruf, ohne Musterlösung)
//   3. schlägt eine an: einmal verschärft neu erzeugen und erneut prüfen
//   4. schlägt sie wieder an (oder reicht die Zeit nicht): feste Ersatzantwort
// Zeitbudget: alles zusammen unter GESAMT_MS, weil die Plattform eine API-Anfrage nach 45 s abbricht.

const { systemBloecke, nutzerNachricht } = require('./prompt');
const { pruefeDeterministisch, pruefeMitModell } = require('./pruefer');
const { alleAufgaben } = require('./kontext');
const { aufgabenbezug } = require('./bezug');

const GESAMT_MS = 38000;
const MAX_TOKENS = 450;

class ModellFehler extends Error {
  constructor(art) { super('Modellfehler'); this.name = 'ModellFehler'; this.art = art; }
}

const ERSATZ_MIT_AUFGABE = 'Da würde ich dir zu viel verraten, und dann hättest du die Aufgabe nicht selbst gelöst. Lass uns kleiner anfangen: Was genau soll dein Programm am Ende ausgeben oder zurückgeben, und welche Werte bekommt es dafür? Schreib nur die erste Zeile, führe sie aus und schau, was passiert. Wo hängst du dann?';
const ERSATZ_OHNE_AUFGABE = 'Da würde ich dir zu viel verraten. Erzähl mir lieber, was du schon versucht hast und an welcher Stelle du nicht weiterkommst. Dann suchen wir zusammen den nächsten kleinen Schritt.';
// Reine Konzeptfrage ohne Aufgabenbezug: ehrlich und neutral (Grund kann Länge oder Nähe zu einer
// Kursaufgabe sein), statt „zu viel verraten“
const ERSATZ_KONZEPT = 'Mein Beispiel dazu ist zu lang oder zu nah an einer Kursaufgabe geraten, deshalb halte ich es zurück. Magst du die Frage enger stellen, zum Beispiel nach einem einzelnen Teil davon? Kurze Beispiele zur Schreibweise findest du auch in den Syntax-Karten im Labor und in der Bibliothek der Lektion.';
const ERSATZ_TEXTE = [ERSATZ_MIT_AUFGABE, ERSATZ_OHNE_AUFGABE, ERSATZ_KONZEPT];
const ABLEHNUNG = 'Dabei kann ich dir nicht helfen. Wenn du eine Frage zu Python oder zu einer Aufgabe aus dem Kurs hast, bin ich gern für dich da. Woran arbeitest du gerade?';

function ersatz(anfrage, bezug) {
  if (anfrage.aufgabe) return ERSATZ_MIT_AUFGABE;
  return bezug.streng ? ERSATZ_OHNE_AUFGABE : ERSATZ_KONZEPT;
}

/**
 * Prüfkontext für die deterministische Nachprüfung (auch vom Angriffs-Skript benutzt).
 * Ohne Aufgaben-id, aber im Text erkannte Kursaufgabe: deren Musterlösung gilt wie die der aktuellen Aufgabe.
 */
function pruefKontext(anfrage, alle) {
  const bezug = aufgabenbezug(anfrage, alle);
  const ziel = bezug.aufgabe;
  return {
    bezug,
    pk: {
      loesung: ziel ? ziel.loesung : '',
      aufgabentext: ziel ? ziel.text : '',
      titel: ziel ? ziel.titel || '' : '',
      code: anfrage.code,
      frueher: anfrage.verlauf.filter((b) => b.rolle === 'tutor').map((b) => b.text),
      // alle übrigen Aufgaben des Kurses: Aufgabentext kann in Werkbank oder Lerneinheit eingefügt sein
      alle: alle.filter((a) => a !== ziel),
      streng: bezug.streng,
      mittel: bezug.mittel,
    },
  };
}

function textVon(r) {
  return (r && Array.isArray(r.content) ? r.content : []).filter((b) => b && b.type === 'text').map((b) => b.text).join('').trim();
}

function addiere(summe, u) {
  if (!u) return;
  summe.ein += u.input_tokens || 0;
  summe.aus += u.output_tokens || 0;
  summe.cacheLesen += u.cache_read_input_tokens || 0;
  summe.cacheSchreiben += u.cache_creation_input_tokens || 0;
}

/**
 * @param {object} anfrage  aus kontext.anfrageAusBody (enthält aufgabe mit Musterlösung, nur für Prüfung a)
 * @param {{client: object, modell: string, pruefer: boolean, jetzt?: () => number}} o
 * @returns {Promise<{antwort: string, protokoll: {versuche:number, ersetzt:boolean, abgelehnt:boolean,
 *           gruende:string[], prueferAusfall:boolean, tokens:object, ms:number}}>}
 * @throws {ModellFehler} wenn schon der erste Modellaufruf scheitert (nichts zählt)
 */
async function beantworte(anfrage, o) {
  const jetzt = o.jetzt || Date.now;
  const start = jetzt();
  const rest = () => GESAMT_MS - (jetzt() - start);
  const tokens = { ein: 0, aus: 0, cacheLesen: 0, cacheSchreiben: 0 };
  const p = { versuche: 0, ersetzt: false, abgelehnt: false, gruende: [], prueferAusfall: false, prueferAufrufe: 0, tokens, ms: 0 };
  const nachricht = nutzerNachricht(anfrage);
  const { bezug, pk } = pruefKontext(anfrage, (o.alleAufgaben || alleAufgaben)());
  p.bezug = bezug.grund || 'konzept';   // nur ein Code, kein Inhalt

  async function erzeuge(verschaerft, timeout, maxRetries) {
    p.versuche += 1;
    const r = await o.client.erzeuge({
      model: o.modell,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: systemBloecke(anfrage, { verschaerft, streng: bezug.streng, mittel: bezug.mittel, erkannt: anfrage.aufgabe ? null : bezug.aufgabe, gruende: p.gruende }),
      messages: [{ role: 'user', content: nachricht }],
    }, { timeout, maxRetries });
    addiere(tokens, r && r.usage);
    return r;
  }

  /** a immer, b wenn eingeschaltet und Zeit bleibt. → Liste der Gründe (leer = in Ordnung) */
  async function pruefe(entwurf) {
    const a = pruefeDeterministisch(entwurf, pk);
    const gruende = a.gruende.slice();
    if (!gruende.length && o.pruefer) {
      if (rest() > 5000) {
        p.prueferAufrufe += 1;
        const b = await pruefeMitModell(o.client, { anfrage, entwurf, modell: o.modell, streng: bezug.streng, timeoutMs: Math.min(7000, rest() - 1500) });
        addiere(tokens, b.usage);
        if (b.ursache) p.prueferUrsache = b.ursache;   // nur ein Code (max_tokens, json, zeit …), kein Inhalt
        if (b.ausfall) p.prueferAusfall = true;
        else if (b.loesung) gruende.push('pruefer');
      } else {
        p.prueferAusfall = true;
        p.prueferUrsache = 'keine-zeit';
      }
    }
    return gruende;
  }

  function fertig(antwort) { p.ms = jetzt() - start; return { antwort, protokoll: p }; }

  // 1. erster Versuch: Fehler hier → 502 (und die Frage zählt nicht)
  let r;
  try {
    const t = Math.min(14000, rest() - 2000);
    r = await erzeuge(false, t, rest() > 30000 ? 1 : 0);
  } catch (e) {
    throw new ModellFehler(o.client.fehlerArt ? o.client.fehlerArt(e) : 'unbekannt');
  }
  if (r && r.stop_reason === 'refusal') { p.abgelehnt = true; return fertig(ABLEHNUNG); }
  let entwurf = textVon(r);
  let gruende = entwurf ? await pruefe(entwurf) : ['leer'];
  if (!gruende.length) return fertig(r.stop_reason === 'max_tokens' ? entwurf + ' …' : entwurf);
  p.gruende.push(...gruende);

  // 2. einmal verschärft neu erzeugen
  if (rest() > 8000) {
    try {
      const r2 = await erzeuge(true, Math.min(10000, rest() - 1500), 0);
      if (r2 && r2.stop_reason === 'refusal') { p.abgelehnt = true; return fertig(ABLEHNUNG); }
      entwurf = textVon(r2);
      gruende = entwurf ? await pruefe(entwurf) : ['leer'];
      if (!gruende.length) return fertig(r2.stop_reason === 'max_tokens' ? entwurf + ' …' : entwurf);
      p.gruende.push(...gruende);
    } catch (e) {
      p.gruende.push('zweiter-versuch-fehler');
    }
  }

  // 3. feste Ersatzantwort
  p.ersetzt = true;
  return fertig(ersatz(anfrage, bezug));
}

module.exports = { beantworte, pruefKontext, ModellFehler, GESAMT_MS, MAX_TOKENS, ERSATZ_MIT_AUFGABE, ERSATZ_OHNE_AUFGABE, ERSATZ_KONZEPT, ERSATZ_TEXTE, ABLEHNUNG };
