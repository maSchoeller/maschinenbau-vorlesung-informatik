'use strict';
// Modell-Client mit austauschbarer Umsetzung.
//
// Schnittstelle (eine Methode, gleiche Form wie das Anthropic-SDK):
//   client.erzeuge(params, { timeout, maxRetries }) → Promise<Message>
//     params:  Parameter von messages.create (model, max_tokens, system, messages, thinking, output_config)
//     Ergebnis: { content: [{type:'text', text}], stop_reason, usage }
//   Fehler werden geworfen (SDK-Fehlerklassen bzw. beliebige Error-Objekte beim Doppel).
//
// Umsetzungen:
//   echt   – @anthropic-ai/sdk (Abhängigkeit in api/package.json, Wunsch an die API-Rolle)
//   doppel – feste, regelbasierte Antworten ohne Netz; für Tests und den lokalen Emulator
//            (TUTOR_DOPPEL=1, nur lokal wirksam, siehe umgebung.js).

const { istLokal } = require('../umgebung');

const STANDARD_MODELL = 'claude-haiku-5-5';

function modellId() {
  const m = String(process.env.TUTOR_MODELL || '').trim();
  return /^[a-z0-9][a-z0-9.\-]{2,60}$/.test(m) ? m : STANDARD_MODELL;
}

function prueferAn() {
  return String(process.env.TUTOR_PRUEFER || 'an').trim().toLowerCase() !== 'aus';
}

/** TUTOR_DOPPEL=1 gilt nur lokal; in Produktion wird es ignoriert (und gemeldet). */
function doppelGewuenscht() {
  return String(process.env.TUTOR_DOPPEL || '').trim() === '1';
}
function doppelAktiv() {
  return doppelGewuenscht() && istLokal();
}

// ---------------------------------------------------------------- echter Client

let echt = null;
function echterClient() {
  if (echt) return echt;
  let Anthropic;
  try {
    const m = require('@anthropic-ai/sdk');
    Anthropic = m.Anthropic || m.default || m;
  } catch (e) {
    return null; // Paket fehlt: wie "nicht eingerichtet" behandeln
  }
  // Zeitlimit und Wiederholungen setzt der Aufrufer je Anfrage (Plattformgrenze 45 s).
  // Schlüssel ausdrücklich aus der App-Einstellung (keine anderen Anmeldewege des SDK).
  const sdk = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0, timeout: 20000 });
  echt = {
    art: 'echt',
    erzeuge(params, opt = {}) {
      return sdk.messages.create(params, { timeout: opt.timeout, maxRetries: opt.maxRetries || 0 });
    },
    fehlerArt(e) {
      if (e instanceof Anthropic.APIConnectionTimeoutError) return 'zeitueberschreitung';
      if (e instanceof Anthropic.RateLimitError) return 'ratenlimit';
      if (e instanceof Anthropic.AuthenticationError) return 'schluessel';
      if (e instanceof Anthropic.APIConnectionError) return 'verbindung';
      if (e instanceof Anthropic.APIError) return 'api-' + (e.status || 'x');
      return 'unbekannt';
    },
  };
  return echt;
}

// ---------------------------------------------------------------- Modell-Doppel

function textAus(params) {
  const m = params.messages && params.messages[params.messages.length - 1];
  return m && typeof m.content === 'string' ? m.content : '';
}
function block(text, tag) {
  const r = new RegExp(`<${tag}[^>]*>\\n?([\\s\\S]*?)\\n?</${tag}>`).exec(text);
  return r ? r[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '';
}
const USAGE = (aus) => ({ input_tokens: 120, output_tokens: aus, cache_read_input_tokens: 1800, cache_creation_input_tokens: 0 });

/**
 * Regelbasiertes Doppel. Erkennt Tutor- und Prüfer-Aufrufe am Aufbau der Parameter.
 * Testauslöser in der Frage (nur im Doppel): „testfall:loesung“ liefert absichtlich zu viel Code
 * (zeigt die Ersatzantwort), „testfall:pruefer“ lässt den Prüfer anschlagen (ebenfalls Ersatz),
 * „testfall:fehler“ wirft einen Modellfehler (502),
 * „testfall:langsam“ wartet 3 s (Ladeanzeige).
 */
function doppel(opt = {}) {
  const aufrufe = [];
  return {
    art: 'doppel',
    aufrufe,
    async erzeuge(params, o = {}) {
      aufrufe.push({ params, optionen: o });
      const nachricht = textAus(params);
      const istPruefer = Boolean(params.output_config && params.output_config.format);
      if (istPruefer) {
        const viel = /testfall:pruefer/.test(block(nachricht, 'frage'));
        return { content: [{ type: 'text', text: JSON.stringify({ loesung_verraten: viel, grund: viel ? 'Doppel: viel Code' : 'Doppel: unauffällig' }) }], stop_reason: 'end_turn', usage: USAGE(12) };
      }
      const frage = block(nachricht, 'frage');
      if (/testfall:fehler/.test(frage)) { const e = new Error('Doppel: Modellfehler'); e.name = 'DoppelFehler'; throw e; }
      if (/testfall:langsam/.test(frage)) await new Promise((r) => setTimeout(r, 3000));
      if (/testfall:loesung/.test(frage)) {
        return { content: [{ type: 'text', text: 'Hier ist alles:\n```python\nimport math\ndef f(d, n):\n    x = d * n\n    y = x / 1000\n    return math.pi * y\nprint(f(60, 1000))\n```' }], stop_reason: 'end_turn', usage: USAGE(60) };
      }
      const system = Array.isArray(params.system) ? params.system.map((b) => b.text).join('\n') : String(params.system || '');
      const aufgabe = /Aktuelle Aufgabe „([^“]+)“ \(([a-z0-9-]+)\)/.exec(system);
      const code = block(nachricht, 'code');
      const ausgabe = block(nachricht, 'ausgabe');
      const teile = ['(Modell-Doppel, keine echte KI.)'];
      if (aufgabe) teile.push(`Ich sehe die Aufgabe ${aufgabe[2]} („${aufgabe[1]}“).`);
      else if (/Termin: (Termin \d\d)/.test(system)) teile.push(`Ich sehe ${/Termin: (Termin \d\d)/.exec(system)[1]}, aber keine bestimmte Aufgabe.`);
      if (code) teile.push(`Dein Code hat ${code.split('\n').length} Zeilen.`);
      if (ausgabe) teile.push('Die letzte Ausgabe ist mitgekommen.');
      teile.push('Ein kleines Beispiel an einem anderen Problem:\n```python\nflaeche = breite * hoehe\nprint(flaeche)\n```\nWas soll in deinem Programm am Ende herauskommen, und welche Werte bekommt es dafür? Schreib die erste Zeile und probier sie mit `print` aus.');
      return { content: [{ type: 'text', text: teile.join('\n\n') }], stop_reason: 'end_turn', usage: USAGE(90) };
    },
    fehlerArt(e) { return e && e.name === 'DoppelFehler' ? 'doppel-fehler' : 'unbekannt'; },
    ...opt,
  };
}

// ---------------------------------------------------------------- Auswahl

let gesetzt = null;

/** Nur für Tests: eigenen Client setzen (null = Standardauswahl). */
function _setzeClient(c) { gesetzt = c; }

/**
 * Liefert den zu verwendenden Client oder null (nicht eingerichtet).
 * Reihenfolge: in Tests gesetzter Client → Doppel (nur lokal) → echter Client mit Schlüssel.
 */
function client() {
  if (gesetzt) return gesetzt;
  if (doppelAktiv()) return doppel();
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return echterClient();
}

module.exports = { client, doppel, modellId, prueferAn, doppelAktiv, doppelGewuenscht, _setzeClient, STANDARD_MODELL };
