'use strict';
// Eingabeprüfungen. Jede Funktion wirft bei ungültiger Eingabe einen ApiFehler (400/413)
// und gibt sonst den bereinigten Wert zurück.

const { wirf } = require('./antwort');

const GRENZEN = Object.freeze({
  BODY_BYTES: 256 * 1024,      // ganzer Request-Body
  EINTRAG_BYTES: 64 * 1024,    // JSON eines Eintragswerts
  CODE_BYTES: 64 * 1024,       // Code eines geteilten Programms
  ABGLEICH_MAX: 500,           // Einträge je /api/abgleich
  KONTO_BYTES: 10 * 1024 * 1024, // Summe aller Eintragswerte je Benutzer
  ZUKUNFT_MS: 5 * 60 * 1000,   // erlaubter Vorlauf von 'geaendert'
});

const PFAD_RE = /^inf-mb\/[a-z0-9-]{1,40}\/[A-Za-z0-9:._-]{1,120}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;
const ANZEIGENAME_RE = /^[\p{L}\p{N} _.-]{2,30}$/u;
const STEUERZEICHEN_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
// Unicode-Formatzeichen (u. a. Bidi-Steuerung U+202A-U+202E, U+2066-U+2069, Nullbreite): verfälschen die Anzeige
const FORMATZEICHEN_RE = /\p{Cf}/u;
// Rollenwörter, mit denen sich jemand als Lehrende oder System ausgeben könnte (ganze Wörter, ohne Groß/klein)
const RESERVIERT_RE = /(^|[^\p{L}\p{N}])(prof|professor|professorin|dozent|dozentin|lehrer|lehrerin|admin|administrator|moderator|tutor|tutorin|dhbw|system|support)(?=$|[^\p{L}\p{N}])/iu;
const LEKTION_RE = /^[A-Za-z0-9-]{1,20}$/;
const GETEILT_ID_RE = /^[A-Za-z0-9_-]{10}$/;

function bytes(s) {
  return Buffer.byteLength(s, 'utf8');
}

/** Pfad eines Eintrags nach Vertrag. */
function pfad(p) {
  if (typeof p !== 'string' || !PFAD_RE.test(p)) {
    wirf(400, 'pfad-ungueltig', 'Der Pfad des Eintrags ist ungültig.');
  }
  return p;
}

/** ISO-Zeitstempel → normalisierte ISO-Zeichenkette (UTC, Millisekunden). Wirft 400. */
function iso(wert, feld) {
  if (typeof wert !== 'string' || !ISO_RE.test(wert)) {
    wirf(400, 'zeit-ungueltig', `Das Feld '${feld || 'zeit'}' muss ein ISO-8601-Zeitstempel sein.`);
  }
  const ms = Date.parse(wert);
  if (!Number.isFinite(ms)) wirf(400, 'zeit-ungueltig', `Das Feld '${feld || 'zeit'}' ist kein gültiger Zeitpunkt.`);
  return new Date(ms).toISOString();
}

/**
 * Zeitstempel 'geaendert': mehr als 5 Minuten in der Zukunft → Serverzeit.
 * @param {string} wert ISO
 * @param {number} jetztMs Serverzeit in ms
 */
function geaendert(wert, jetztMs) {
  return geaendertGeprueft(wert, jetztMs).wert;
}

/** Wie geaendert(), meldet zusätzlich, ob der Server den Zeitstempel ersetzt hat. → {wert, ersetzt} */
function geaendertGeprueft(wert, jetztMs) {
  const z = iso(wert, 'geaendert');
  if (Date.parse(z) > jetztMs + GRENZEN.ZUKUNFT_MS) return { wert: new Date(jetztMs).toISOString(), ersetzt: true };
  return { wert: z, ersetzt: false };
}

/** Optionaler Parameter 'seit' → ISO oder null. */
function seit(wert) {
  if (wert === undefined || wert === null || wert === '') return null;
  return iso(wert, 'seit');
}

/** Wert eines Eintrags: beliebiges JSON (nicht undefined), höchstens 64 KB. */
function eintragWert(w) {
  if (w === undefined) wirf(400, 'wert-fehlt', 'Der Eintrag hat keinen Wert.');
  const s = JSON.stringify(w);
  if (s === undefined) wirf(400, 'wert-ungueltig', 'Der Wert des Eintrags ist kein JSON.');
  if (bytes(s) > GRENZEN.EINTRAG_BYTES) wirf(413, 'eintrag-zu-gross', 'Ein Eintrag darf höchstens 64 KB groß sein.');
  return w;
}

function anzeigename(n) {
  if (typeof n !== 'string') wirf(400, 'anzeigename-ungueltig', 'Der Anzeigename fehlt.');
  const t = n.trim().replace(/\s+/g, ' ');
  if (!ANZEIGENAME_RE.test(t)) {
    wirf(400, 'anzeigename-ungueltig', 'Der Anzeigename muss 2 bis 30 Zeichen lang sein (Buchstaben, Ziffern, Leerzeichen, - _ .).');
  }
  if (RESERVIERT_RE.test(t)) {
    wirf(400, 'anzeigename-reserviert', 'Wörter wie Prof, Dozent, Tutor oder Admin sind im Anzeigenamen nicht erlaubt.');
  }
  return t;
}

function titel(t) {
  if (typeof t !== 'string') wirf(400, 'titel-ungueltig', 'Der Titel fehlt.');
  const s = t.trim();
  if (s.length < 1 || [...s].length > 80 || STEUERZEICHEN_RE.test(s) || FORMATZEICHEN_RE.test(s) || /[\r\n\t]/.test(s)) {
    wirf(400, 'titel-ungueltig', 'Der Titel muss 1 bis 80 Zeichen lang sein und darf keine Zeilenumbrüche enthalten.');
  }
  return s;
}

function code(c) {
  if (typeof c !== 'string') wirf(400, 'code-ungueltig', 'Der Code fehlt.');
  if (bytes(c) > GRENZEN.CODE_BYTES) wirf(413, 'code-zu-gross', 'Der Code darf höchstens 64 KB groß sein.');
  if (STEUERZEICHEN_RE.test(c)) wirf(400, 'code-ungueltig', 'Der Code enthält unzulässige Steuerzeichen.');
  return c;
}

/** Optionale Lektion ('V07' o. ä.) → Zeichenkette oder null. */
function lektion(l) {
  if (l === undefined || l === null || l === '') return null;
  if (typeof l !== 'string' || !LEKTION_RE.test(l)) wirf(400, 'lektion-ungueltig', 'Die Lektion ist ungültig.');
  return l;
}

function geteiltId(id) {
  return typeof id === 'string' && GETEILT_ID_RE.test(id);
}

/** Ändernde Anfragen: Kopfzeile X-Kurs-App: 1 und content-type application/json. */
function aenderndeAnfrage(request) {
  const m = String(request.method || '').toUpperCase();
  if (m !== 'POST' && m !== 'PUT' && m !== 'DELETE' && m !== 'PATCH') return;
  if (request.headers.get('x-kurs-app') !== '1') {
    wirf(400, 'kopfzeile-fehlt', 'Die Anfrage muss die Kopfzeile X-Kurs-App: 1 tragen.');
  }
  const ct = String(request.headers.get('content-type') || '').toLowerCase();
  if (!ct.startsWith('application/json')) {
    wirf(400, 'content-type', 'Die Anfrage muss content-type: application/json verwenden.');
  }
}

/**
 * Liest den Body als JSON-Objekt (höchstens 256 KB). Leerer Body → {} (wenn leerErlaubt).
 * Prüft vorher aenderndeAnfrage().
 */
async function body(request, { leerErlaubt = false, maxBytes = GRENZEN.BODY_BYTES } = {}) {
  aenderndeAnfrage(request);
  const laenge = Number(request.headers.get('content-length'));
  if (Number.isFinite(laenge) && laenge > maxBytes) {
    wirf(413, 'zu-gross', 'Die Anfrage ist zu groß (höchstens 256 KB).');
  }
  const text = await request.text();
  if (bytes(text) > maxBytes) wirf(413, 'zu-gross', 'Die Anfrage ist zu groß (höchstens 256 KB).');
  if (text.trim() === '') {
    if (leerErlaubt) return {};
    wirf(400, 'body-fehlt', 'Die Anfrage hat keinen Inhalt.');
  }
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    wirf(400, 'json-ungueltig', 'Der Inhalt der Anfrage ist kein gültiges JSON.');
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    wirf(400, 'json-ungueltig', 'Der Inhalt der Anfrage muss ein JSON-Objekt sein.');
  }
  return obj;
}

module.exports = {
  GRENZEN, PFAD_RE, pfad, iso, geaendert, geaendertGeprueft, seit, eintragWert, anzeigename, titel, code, lektion,
  geteiltId, aenderndeAnfrage, body, bytes,
};
