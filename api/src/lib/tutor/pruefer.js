'use strict';
// Nachprüfung jeder Tutor-Antwort, bevor sie den Browser erreicht (Vertrag Abschnitt 10 Nr. 6).
//
// a) deterministisch (diese Datei, ohne Modell):
//    - Codezeilen zählen: mehr als 3 zusammenhängende oder mehr als 6 insgesamt gelten als Lösung.
//      Gezählt wird Code in jeder Form: Markdown-Zaun, eingerückt, ohne Zaun als Klartextzeile,
//      zerstückelt in Inline-Code (`…`) oder als nummerierte Schritte („1. `def f(x):`“),
//      auch Code in Kommentaren und in anderen Programmiersprachen.
//    - Überdeckung mit der Musterlösung: normalisierter Zeilenvergleich (auch mit umbenannten
//      Variablen und rückwärts geschrieben); 50 % der nicht trivialen, nicht schon bekannten Zeilen.
//    - Kodierte Blöcke (Base64, Hex) und wiedergegebene Teile des System-Prompts.
// b) Prüfer-Aufruf mit dem Modell (pruefeMitModell): bekommt Aufgabentext, Code und Frage der
//    Studierenden und den Antwortentwurf, aber NICHT die Musterlösung (siehe tutor.md: die
//    Musterlösung verlässt den Server nie; der Prüfer beurteilt, ob „das Verlangte“ verraten wird,
//    was weiter reicht als die eine Musterlösung).

const { STABIL, KENNUNG, PRUEFER_SYSTEM, PRUEFER_SCHEMA, prueferNachricht } = require('./prompt');

// Mit Aufgabenbezug (bezug.js) streng, bei reinen Konzeptfragen großzügiger: ein sinnvolles
// if/elif/else- oder try/except-Beispiel hat 5 bis 8 Zeilen.
const GRENZE_AM_STUECK = 3;
const GRENZE_GESAMT = 6;
const GRENZE_AM_STUECK_LOCKER = 8;
const GRENZE_GESAMT_LOCKER = 12;
// „wort“ ohne erkannte Aufgabe („Ich brauche das für eine Aufgabe“): Beispiele bis 5 Zeilen am Stück
const GRENZE_AM_STUECK_MITTEL = 5;
const GRENZE_GESAMT_MITTEL = 8;
const SCHWELLE_UEBERDECKUNG = 0.5;
const SCHWELLE_ANDERE_LOCKER = 0.4;

/** Code-Grenzen je nach Aufgabenbezug: k.streng (Standard true), k.mittel (streng, aber ohne bekannte Aufgabe). */
function grenzen(k = {}) {
  if (k.streng === false) return { amStueck: GRENZE_AM_STUECK_LOCKER, gesamt: GRENZE_GESAMT_LOCKER };
  if (k.mittel) return { amStueck: GRENZE_AM_STUECK_MITTEL, gesamt: GRENZE_GESAMT_MITTEL };
  return { amStueck: GRENZE_AM_STUECK, gesamt: GRENZE_GESAMT };
}
// Schema mit Urteil zuerst und Begründung „höchstens 15 Wörter“; 250 lässt auch bei langer deutscher
// Begründung Luft (Haiku 5.5 zählt laut Skill etwa 30 % mehr Token als ältere Modelle).
const PRUEFER_MAX_TOKENS = 250;

// ---------------------------------------------------------------- Erkennen einer Codezeile

const STATEMENT_RES = [
  /^(def|class)\s+[A-Za-z_]\w*\s*[(:]/,
  /^(for|while|if|elif|with)\b.*:\s*$/,
  /^(if|elif|while|for|with|else|try|except|finally|def|class)\b[^:\n]*:\s*\S/,   // zusammengesetzt: „elif x < 20: print(1)“
  /^(for)\s+[A-Za-z_][\w, ]*\s+in\s+\S/,
  /^while\s+\S.*[<>=!]/,
  /^(if|elif)\s+\S.*([<>=!]=?|\bin\b|\bnot\b)/,
  /^else\s*:/,
  /^(try|finally)\s*:/,
  /^except\b.*:\s*$/,
  /^return\s+\S/,
  /^(import\s+[A-Za-z_]|from\s+[A-Za-z_][\w.]*\s+import\b)/,
  /^(print|input|len|range|int|float|str|round|abs)\s*\(/,
  /^[A-Za-z_][\w.]*\(.*\)\s*$/,                                            // Aufruf: name(...)
  /^[A-Za-z_][\w.]*(\[[^\]]*\])?(\s*,\s*[A-Za-z_]\w*)*\s*(\*\*|\/\/|[+\-*/%])?=(?!=)\s*\S/, // Zuweisung
  /^(assert|global|nonlocal|lambda|yield|raise|del)\b\s*\S/,
  // andere Sprachen
  /^(function|let|const|var|public|private|static|void|int|double|float|String|System\.out|console\.log|printf|cout|#include)\b/,
  /^[}\]{]\s*[;,]?\s*$/,
  /^[^\s].*[;{]\s*$/,
];

// Pseudocode auf Deutsch („solange i <= n:“), nur mit Operator oder typischen Wörtern
const PSEUDO_RE = /^(wenn|falls|solange|für|fuer|sonst|wiederhole|gib|setze|erhöhe|erhoehe)\b.*([=<>+\-*/]|\bbis\b|\bin\b|\bzurück\b|\bzurueck\b).*:?\s*$/i;

function ohneListenmarke(s) {
  return s
    .replace(/^\s*(>\s*)+/, '')
    .replace(/^\s*(\d{1,3}[.)]|[-*+•–])\s+/, '')
    .replace(/^\s*(schritt|zeile|step|line|teil)\s*\d{1,3}\s*[:.)\-–]\s*/i, '')
    .trim();
}

/** Ist der (von Markierungen befreite) Text eine Codezeile? */
function istCodeZeile(roh) {
  const s = String(roh || '').trim();
  if (s.length < 2 && s !== '}') return false;
  if (/^#/.test(s)) return istCodeZeile(s.replace(/^#+\s*/, ''));   // Code im Kommentar
  for (const re of STATEMENT_RES) if (re.test(s)) return !istProsa(s);
  if (s.length < 90 && PSEUDO_RE.test(s) && /[:=<>]/.test(s)) return true;
  if (/^[A-Za-zÄÖÜäöüß_]\w*\s*(←|:=|<-)\s*\S/.test(s)) return true;   // Pseudocode-Zuweisung
  return false;
}

// Schutz gegen Fehlalarme: lange deutsche Sätze, die zufällig wie Code beginnen
function istProsa(s) {
  const woerter = s.split(/\s+/).filter((w) => /^[A-Za-zÄÖÜäöüß]{2,}[,.!?]?$/.test(w));
  return woerter.length >= 9 && !/[=(){}\[\];]/.test(s.slice(0, 40));
}

// ---------------------------------------------------------------- Zerlegen einer Antwort

const INLINE_RE = /`([^`\n]+)`/g;
const ZUSAMMEN_RE = /^(if|elif|while|for|with|else|try|except|finally|def|class)\b([^:\n]*):\s*(\S.*)$/;

/**
 * Weitere Vergleichsstücke einer Zeile für den Abgleich mit Musterlösungen: Kopf und Rumpf einer
 * zusammengesetzten Anweisung („elif x < 20: print(…)“), Zellen einer Markdown-Tabelle, Code hinter „#“.
 */
function stuecke(zeile) {
  const s = String(zeile || '').trim();
  if (!s) return [];
  const aus = [s];
  const ohneKommentar = s.replace(/^#+\s*/, '');
  if (ohneKommentar !== s && ohneKommentar) aus.push(ohneKommentar);
  const m = ZUSAMMEN_RE.exec(ohneKommentar);
  if (m) { aus.push(m[1] + m[2]); aus.push(m[3]); }
  if (s.includes('|')) {
    for (const zelle of s.split('|')) {
      const t = zelle.replace(/`/g, '').trim();
      if (t && !/^:?-{2,}:?$/.test(t)) aus.push(t);
    }
  }
  return aus;
}

/** Mehrere Anweisungen in einer Zeile (a = 1; b = 2) trennen, Semikolons in Zeichenketten nicht. */
function teile(zeile) {
  const aus = [];
  let akt = '', q = null;
  for (const ch of String(zeile)) {
    if (q) { if (ch === q) q = null; akt += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; akt += ch; continue; }
    if (ch === ';') { if (akt.trim()) aus.push(akt.trim()); akt = ''; continue; }
    akt += ch;
  }
  if (akt.trim()) aus.push(akt.trim());
  return aus;
}

/**
 * Zerlegt eine Antwort in Codezeilen mit Lauf-Zählung.
 * @returns {{gesamt:number, amStueck:number, kandidaten:string[]}}
 *   kandidaten: alle codeartigen Stücke (auch Ausdrücke) für den Vergleich mit der Musterlösung
 */
function zerlege(text, { bekannt } = {}) {
  const zeilen = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const kandidaten = [];
  let gesamt = 0, lauf = 0, amStueck = 0, imZaun = false;
  const istBekannt = (z) => bekannt && bekannt.has(norm(z));
  const zaehle = (z) => {
    kandidaten.push(...stuecke(z));
    if (istBekannt(z)) return;                // Code der Studierenden zitieren ist erlaubt
    gesamt += 1; lauf += 1; if (lauf > amStueck) amStueck = lauf;
  };

  for (const roh of zeilen) {
    const zaunAnf = /^\s*(```|~~~)/.test(roh);
    if (zaunAnf) {
      // ```code``` auf einer Zeile
      const rest = roh.replace(/^\s*(```|~~~)[\w+-]*/, '');
      const ende = rest.search(/(```|~~~)\s*$/);
      if (ende > 0) { for (const t of teile(rest.slice(0, ende))) if (t.trim()) zaehle(t.trim()); continue; }
      imZaun = !imZaun;
      continue;
    }
    if (imZaun) {
      const t = roh.trim();
      if (!t) continue;                        // Leerzeilen im Block unterbrechen den Lauf nicht
      if (/^#/.test(t) || /^("""|''')/.test(t)) {
        if (istCodeZeile(t)) zaehle(t.replace(/^#+\s*/, '')); else kandidaten.push(...stuecke(t));
        continue;
      }
      for (const teil of teile(t)) zaehle(teil);
      continue;
    }

    const zeile = ohneListenmarke(roh);
    if (!zeile) continue;                       // Leerzeile: Lauf geht weiter
    const spans = [];
    zeile.replace(INLINE_RE, (_, inhalt) => { spans.push(inhalt.trim()); return ''; });
    let codeInZeile = false;
    let prosaZeile = false;
    if (spans.length) {
      // Ein Satz mit Inline-Code („Welcher Zweig läuft bei `t = 5`?“) setzt keinen Codeblock fort:
      // Der Inline-Code zählt für „gesamt“, der Lauf beginnt danach neu.
      const ausserhalb = zeile.replace(INLINE_RE, ' ').split(/\s+/).filter((w) => /^[A-Za-zÄÖÜäöüß]{2,}[,.!?:;]?$/.test(w));
      prosaZeile = ausserhalb.length >= 3;
      if (prosaZeile) lauf = 0;
      for (const sp of spans) {
        kandidaten.push(sp);
        for (const teil of teile(sp)) {
          if (istCodeZeile(teil)) { zaehle(teil); codeInZeile = true; }
        }
      }
      // Rest der Zeile ohne Inline-Code kann selbst Code sein („return x“ ohne Backticks)
      const rest = ohneListenmarke(zeile.replace(INLINE_RE, ' ').trim());
      if (!codeInZeile && istCodeZeile(rest)) { zaehle(rest); codeInZeile = true; }
    } else {
      // eingerückt oder Klartext: wie eine Zeile behandeln
      for (const teil of teile(zeile)) {
        if (istCodeZeile(teil)) { zaehle(teil.replace(/^#+\s*/, '')); codeInZeile = true; }
      }
      if (!codeInZeile && /[=()*/+\-]/.test(zeile) && zeile.length < 120) kandidaten.push(zeile);
    }
    if (!codeInZeile || prosaZeile) lauf = 0;   // Prosa unterbricht den Lauf
  }
  return { gesamt, amStueck, kandidaten };
}

// ---------------------------------------------------------------- Normalisieren und Vergleichen

/** Zeile ohne Kommentar, ohne Leerraum, einheitliche Anführungszeichen. */
function norm(z) {
  let s = String(z || '');
  s = s.replace(/(^|\s)#.*$/, '$1');           // Kommentar am Ende (vereinfachend)
  return s.replace(/[’‘]/g, "'").replace(/[“”„]/g, '"').replace(/'/g, '"').replace(/\s+/g, '').replace(/:$/, '').toLowerCase();
}

const BEHALTEN = new Set(('and as assert break class continue def del elif else except false finally for from global if import in is lambda none nonlocal not or pass raise return true try while with yield ' +
  'print input len range int float str bool list dict set tuple round abs min max sum sorted enumerate zip open type isinstance math pi sqrt sin cos tan exp log radians degrees isclose ' +
  'append split strip join format upper lower replace items keys values get np numpy pd pandas plt array mean').split(' '));

/** Wie norm, aber eigene Namen durch „v“ ersetzt (erkennt umbenannte Variablen). */
function normNamen(z) {
  const namen = (s) => s.replace(/[a-zäöüß_][a-zäöüß0-9_]*/g, (w) => (BEHALTEN.has(w) ? w : 'v'));
  // Zeichenketten bleiben wörtlich (sonst würden print("A:", a) und print("B:", b) gleich), außer den
  // Ausdrücken in {…} eines f-Strings: f"Summe: {gesamt}" und f"Summe: {summe}" sind dieselbe Zeile.
  return norm(z).split(/("[^"]*")/).map((teil, i) => (i % 2 === 1
    ? teil.replace(/\{([^}:!]*)/g, (m, e) => '{' + namen(e))
    : namen(teil))).join('');
}

function istTrivial(zeile) {
  const t = String(zeile).trim();
  if (!t) return true;
  if (/^#/.test(t)) return true;
  if (/^("""|''')/.test(t) || /("""|''')$/.test(t)) return true;
  if (/^(import\s|from\s+\S+\s+import\s)/.test(t)) return true;
  return norm(t).length < 8;
}

/** Zeilen der Musterlösung ohne Docstrings und Triviales. */
function loesungsZeilen(loesung) {
  const zeilen = String(loesung || '').replace(/\r\n?/g, '\n').split('\n');
  const aus = [];
  let imDoc = false;
  for (const z of zeilen) {
    const t = z.trim();
    const anz = (t.match(/"""|'''/g) || []).length;
    if (imDoc) { if (anz % 2 === 1) imDoc = false; continue; }
    if (anz % 2 === 1 && /^("""|''')/.test(t)) { imDoc = true; continue; }
    if (!istTrivial(t)) aus.push(t);
  }
  return aus;
}

/**
 * Kern einer (namensnormalisierten) Zeile: ohne führendes Schlüsselwort, ohne Zeichenketten und
 * Klammern. So treffen sich „elif x < 20:“, „x < 20“ in einer Tabelle und „if (x<20)“.
 */
function kernVon(nn) {
  return nn.replace(/"[^"]*"/g, '').replace(/^(elif|if|while|return|print)/, '').replace(/[()[\]:]/g, '');
}
/** Enthält der Kern mehr als nur Namen und Operatoren (Zahl, Schlüsselwort, Funktionsname)? */
function spezifisch(kern) {
  return /\d|[a-zäöüß]{2,}/.test(kern);
}
/** Operanden eines Ausdrucks (namensnormalisiert), für den Vergleich unabhängig von der Reihenfolge. */
function operanden(nn) {
  const ausdruck = nn.replace(/"[^"]*"/g, '"').replace(/^(return|v=)/, '');
  return (ausdruck.match(/[a-zäöüß_][\w.]*|\d[\w.]*/g) || []).sort();
}
function enthaeltMultimenge(gross, klein) {
  let i = 0;
  for (const x of gross) { if (i < klein.length && x === klein[i]) i += 1; else if (i < klein.length && x > klein[i]) return false; }
  return i === klein.length;
}

/** Vorbereitete Form eines Kandidaten oder einer Lösungszeile (alles einmal normalisiert). */
function bereite(roh) {
  const n = norm(roh);
  const nn = normNamen(roh);
  const kern = kernVon(nn);
  const ops = operanden(nn);
  return { roh, n, nn, kern, ops, rev: null };
}

function trifftV(k, l) {
  if (k.n.length < 4 || l.n.length < 6) return false;
  if (k.n === l.n) return true;
  if (k.n.length >= 8 && l.n.includes(k.n) && k.n.length >= 0.6 * l.n.length) return true;
  if (l.n.length >= 8 && k.n.includes(l.n)) return true;
  if (k.rev === null) k.rev = norm(String(k.roh).split('').reverse().join(''));
  if (k.rev === l.n || (l.n.length >= 8 && k.rev.includes(l.n))) return true;
  // umbenannte Variablen: lange Zeilen immer, kurze nur mit Zahl oder Schlüsselwort („elif v<20“)
  const grenze = spezifisch(kernVon(l.nn)) && /[<>=+\-*/%]/.test(l.nn) ? 7 : 12;
  if (l.nn.length >= grenze && (k.nn === l.nn || k.nn.includes(l.nn))) return true;
  // gleicher Kern (Bedingung in einer Tabelle, ohne if/elif/Klammern)
  if (l.kern.length >= 4 && spezifisch(l.kern) && /[<>=+\-*/%]/.test(l.kern) && k.kern === l.kern) return true;
  // gleiche Operanden in anderer Reihenfolge (umgestellte Formel, auch in einen größeren Ausdruck eingesetzt)
  if (l.ops.length >= 5 && l.ops.filter((o) => o !== 'v').length >= 2
    && k.ops.length <= l.ops.length + 3 && enthaeltMultimenge(k.ops, l.ops)) return true;
  return false;
}

/** Für Tests und Aufrufer mit Rohtext. */
function trifft(kandidat, zeile) { return trifftV(bereite(kandidat), bereite(zeile)); }

/** Steht die Zeile (bzw. ihr Kern) schon im Aufgabentext? Signaturen, Probeaufrufe und vorgegebene Ausgaben. */
function imText(n, text) {
  if (!text) return false;
  if (n.length >= 8 && text.includes(n)) return true;
  const sig = /^def(.+)$/.exec(n);                       // def name(a, b): → name(a,b)
  if (sig && sig[1].length >= 6 && text.includes(sig[1])) return true;
  const aufruf = /^print\((.+)\)$/.exec(n);              // print(name(30, 200)) → name(30,200)
  if (aufruf && aufruf[1].length >= 6 && text.includes(aufruf[1])) return true;
  // print("Status: Normal"), wenn die Aufgabe genau diese Ausgabe vorgibt
  if (aufruf && /^("[^"]*",?)+$/.test(aufruf[1])) {
    const texte = aufruf[1].match(/"([^"]*)"/g).map((t) => t.slice(1, -1)).filter(Boolean);
    if (texte.length && texte.every((t) => text.includes(t))) return true;
  }
  return false;
}

// Vorbereitete Lösungszeilen je Aufgabe (ohne Triviales und ohne Zeilen aus dem Aufgabentext)
const ZEILEN_CACHE = new Map();
function relevanteZeilen(loesung, aufgabentext) {
  const schluessel = loesung + '\u0000' + (aufgabentext || '');
  let z = ZEILEN_CACHE.get(schluessel);
  if (!z) {
    const text = norm(aufgabentext || '');
    z = loesungsZeilen(loesung).map(bereite).filter((l) => !imText(l.n, text));
    if (ZEILEN_CACHE.size > 2000) ZEILEN_CACHE.clear();
    ZEILEN_CACHE.set(schluessel, z);
  }
  return z;
}

function ueberdeckungV(kand, { loesung, aufgabentext }, eigen) {
  const zeilen = relevanteZeilen(loesung, aufgabentext).filter((l) => !eigen.has(l.n));
  if (!zeilen.length) return { anteil: 0, getroffen: 0, zeilen: 0 };
  let getroffen = 0, schwer = 0;
  for (const l of zeilen) {
    if (!kand.some((k) => trifftV(k, l))) continue;
    getroffen += 1;
    if (l.ops.length >= 5 && l.ops.filter((o) => o !== 'v').length >= 2) schwer += 1;   // eine ganze Formel
  }
  return { anteil: getroffen / zeilen.length, getroffen, zeilen: zeilen.length, schwer };
}

/**
 * Anteil der Musterlösung, den die Kandidaten abdecken. Zeilen, die schon im Aufgabentext oder im
 * Code der Studierenden stehen, zählen nicht (sie sind bekannt); eigene Zeilen zu zitieren ist erlaubt.
 */
function ueberdeckung(kandidaten, k) {
  const eigen = eigeneZeilen(k.code);
  const kand = kandidaten.map(bereite).filter((x) => !eigen.has(x.n));
  return ueberdeckungV(kand, k, eigen);
}
function vorbereiteKandidaten(roh, eigen) {
  const gesehen = new Set();
  const aus = [];
  for (const r of roh) {
    const x = bereite(r);
    if (!x.n || eigen.has(x.n) || gesehen.has(x.n)) continue;
    gesehen.add(x.n);
    aus.push(x);
  }
  return aus;
}
function eigeneZeilen(code) {
  return new Set(String(code || '').split('\n').map(norm).filter(Boolean));
}

/**
 * Abgleich mit allen anderen Aufgaben des Kurses (Aufgabentext in der Werkbank oder Lerneinheit
 * eingefügt, falsche oder fehlende Aufgaben-id). Strenger als bei der aktuellen Aufgabe: mindestens
 * zwei getroffene Zeilen (oder eine ganze Formel mit mindestens fünf Operanden), damit kurze Konzeptbeispiele nicht an Ein-Zeilen-Lösungen hängen bleiben.
 * @returns {{anteil:number, getroffen:number, zeilen:number, id?:string}} bester Treffer
 */
function ueberdeckungAlle(kand, alle, eigen, { nurMit } = {}) {
  let best = { anteil: 0, getroffen: 0, zeilen: 0 };
  for (const a of alle) {
    if (!a || !a.loesung) continue;
    if (nurMit && !nurMit.has(a)) continue;
    const u = ueberdeckungV(kand, { loesung: a.loesung, aufgabentext: a.text }, eigen);
    // sehr kurze Aufgaben (2–3 wesentliche Zeilen, etwa input/print-Etiketten aus V01) nur ganz:
    // sonst bleiben gewöhnliche Konzeptbeispiele mit input und print daran hängen
    const mindest = u.zeilen < 4 ? Math.max(2, u.zeilen) : 2;
    if (u.getroffen < mindest && !u.schwer) continue;
    if (u.anteil > best.anteil) best = { ...u, id: a.lektion + '/' + a.id, aufgabe: a };
  }
  return best;
}

// ---------------------------------------------------------------- Kodierte Inhalte, Prompt-Leck

function dekodiereVerdaechtiges(text) {
  const funde = [];
  const s = String(text || '');
  for (const m of s.match(/[A-Za-z0-9+/]{24,}={0,2}/g) || []) {
    if (!/[0-9+/]/.test(m) && !/[A-Z].*[a-z].*[A-Z]/.test(m)) continue; // normale lange Wörter auslassen
    try {
      const d = Buffer.from(m, 'base64').toString('utf8');
      if (d.length >= 12 && /^[\x09\x0A\x0D\x20-\x7EÀ-ſ]+$/.test(d)) funde.push(d);
    } catch (e) { /* kein Base64 */ }
  }
  for (const m of s.match(/\b(?:[0-9a-fA-F]{2}[\s:]?){16,}/g) || []) {
    const d = Buffer.from(m.replace(/[\s:]/g, ''), 'hex').toString('utf8');
    if (/^[\x09\x0A\x0D\x20-\x7E]+$/.test(d)) funde.push(d);
  }
  return funde;
}

function woerter(s) {
  return String(s).toLowerCase().replace(/[^a-zäöüß0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
}
const SCHINDELN = (() => {
  // Beispiel-Zitate („…“) zählen nicht: Der Tutor darf eine vorgeschlagene Rückfrage wörtlich stellen.
  const set = new Set();
  for (const teil of STABIL.replace(/Regelwerk.*$/s, '').split(/„[^“]*“/)) {
    const w = woerter(teil);
    for (let i = 0; i + 8 <= w.length; i++) set.add(w.slice(i, i + 8).join(' '));
  }
  return set;
})();

function promptLeck(text) {
  if (String(text).includes(KENNUNG) || /TR-7Q4/i.test(text)) return true;
  const w = woerter(text);
  let treffer = 0;
  for (let i = 0; i + 8 <= w.length; i++) if (SCHINDELN.has(w.slice(i, i + 8).join(' '))) treffer += 1;
  return treffer >= 3;
}

// ---------------------------------------------------------------- Lösungsweg in Worten, benannte Korrektur
//
// Mit Aufgabenbezug gegen die bekannte Musterlösung; ohne Bezug nur loesungsweg/loesungsausdruck gegen
// Aufgaben, deren Rechenzahlen im Entwurf stehen (wegOhneBezug). Bewusst wenige, enge Signale (echter
// Lauf 2026-11-23, Fälle A39 und A47); jedes hat in tutor-pruefer.test.js ein Gegenbeispiel.
//   loesungsweg       mindestens zwei Sätze/Listenpunkte mit einer Rechenhandlung („teile“, „Rest“ …)
//                     und einer Zahl, die in der Musterlösung steht, aber nicht im Aufgabentext
//                     („Teile durch 3600 …“, „Teile den Rest durch 60.“)
//   loesungsausdruck  mindestens zwei Operator-Zahl-Paare der Musterlösung (`3725 // 3600`, `% 3600`)
//   korrektur-benannt „wo müsste ein return stehen“, „ersetze … durch return“, „return statt print“,
//                     „es fehlt ein return“, mit einem Schlüsselwort aus der Musterlösung

const AKTION_RE = /(teil|dividier|multiplizier|addier|subtrahier|zieh|rechne|berechn|nimm|quadrier|potenzier|rest|ganzzahl|modulo|\bmal\b)/i;
const ZAHL_RE = /\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi;
const ZU_ALLGEMEIN = new Set(['0', '1', '2']);
// Schlüsselwörter, die zugleich deutsche Wörter oder zu allgemein sind
const KEIN_FIX_WORT = new Set(['in', 'is', 'as', 'or', 'and', 'not', 'set', 'type', 'open', 'get', 'log', 'exp', 'zip', 'min', 'max', 'sum', 'list', 'v']);

const MERKMAL_CACHE = new Map();
function wegMerkmale(loesung, aufgabentext, code) {
  const schluessel = loesung + '\u0000' + (aufgabentext || '') + '\u0000' + (code || '');
  let m = MERKMAL_CACHE.get(schluessel);
  if (m) return m;
  const bekannteZahlen = new Set([...String(aufgabentext || '').matchAll(ZAHL_RE), ...String(code || '').matchAll(ZAHL_RE)].map((x) => x[0]));
  const zeilen = relevanteZeilen(loesung, aufgabentext).map((l) => l.roh.replace(/"[^"]*"|'[^']*'/g, '""'));
  const zahlen = new Set();
  const paare = new Set();
  const fixWoerter = new Set();
  for (const z of zeilen) {
    for (const x of z.matchAll(ZAHL_RE)) if (!bekannteZahlen.has(x[0]) && !ZU_ALLGEMEIN.has(x[0])) zahlen.add(x[0]);
    for (const x of z.matchAll(/(\/\/|\*\*|%|[+\-*/])\s*(\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi)) {
      if (zahlen.has(x[2])) paare.add(x[1] + ' ' + x[2]);
    }
    for (const w of z.toLowerCase().match(/[a-z_]+/g) || []) if (BEHALTEN.has(w) && !KEIN_FIX_WORT.has(w)) fixWoerter.add(w);
    for (const op of z.match(/<=|>=|==|!=|\/\/|%/g) || []) fixWoerter.add(op);
  }
  // Rechenzahlen: Zahlen hinter einem Operator (`// 3600`), nicht Datenwerte wie `t1_spannung = 150`
  const rechen = new Set([...paare].map((x) => x.split(' ')[1]));
  m = { zahlen, rechen, paare: [...paare], fixRes: [...fixWoerter].map(fixMuster) };
  if (MERKMAL_CACHE.size > 2000) MERKMAL_CACHE.clear();
  MERKMAL_CACHE.set(schluessel, m);
  return m;
}

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); }

function fixMuster(wort) {
  // „for-Schleife“, „if-Zweig“, „input-Aufruf“ benennen ein Konstrukt, nicht die Korrektur
  const kein = '(?![-\\s]?(?:schleife|zweig|bedingung|anweisung|aufruf|funktion|abfrage|block)[a-zäöüß]*)';
  const y = /^\w+$/.test(wort) ? `\\b${esc(wort)}\\b${kein}` : `(?<![<>=!/*%])${esc(wort)}(?![=/*])`;
  const art = '(?:(?:ein|eine|einen|das|der|die|dein|deine)\\s+)?';
  return new RegExp([
    `(?:müsste|müssten|muss|sollte|gehört|gehören)[^.?!]{0,50}${y}[^.?!]{0,25}(?:stehen|hin(?:ein)?\\b|rein\\b)`,
    `ersetze?n?\\b[^.?!]{0,50}\\bdurch\\s+${art}${y}`,
    `${y}\\s+(?:statt|anstatt|anstelle)\\b`,
    `statt\\b[^.?!]{0,40}(?:schreibst du|schreib|nimm|nimmst du|brauchst du|verwende|benutze)\\b[^.?!]{0,15}?\\s${art}${y}`,
    // nur „gegen/zu“: „in“ ist eine Ortsangabe („wenn du in range den zweiten Wert änderst“)
    `(?:tausch|änder|wechsel)[a-zäöüß]*\\b[^.?!]{0,50}\\b(?:gegen|zu)\\s+${art}${y}`,
    `\\bfehlt\\s+(?:noch\\s+|nur\\s+)?${art}${y}`,
  ].join('|'), 'i');
}

/** Wortfolgen (ab 3 Wörtern) aus dem Titel der Aufgabe: „print statt return“ im Titel ist kein Hinweis des Tutors. */
function ohneTitel(satz, titel) {
  const w = String(titel || '').toLowerCase().split(/[^a-zäöüß0-9_]+/).filter(Boolean);
  let s = satz.toLowerCase();
  for (let n = w.length; n >= 3; n--) {
    for (let i = 0; i + n <= w.length; i++) {
      const folge = w.slice(i, i + n).join('\\W+');
      s = s.replace(new RegExp(folge, 'g'), ' ');
    }
  }
  return s;
}

/** Sätze und Listenpunkte einer Antwort, ohne Backticks und Markdown-Hervorhebung. */
function einheiten(text) {
  return String(text || '').replace(/`/g, '').replace(/\*\*/g, '').split('\n')
    .flatMap((z) => ohneListenmarke(z).split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"])/))
    .map((s) => s.trim()).filter(Boolean);
}

function wegUndKorrektur(antwort, k, { korrektur = true, nurRechenzahlen = false } = {}) {
  const gruende = [];
  if (!k.loesung) return gruende;
  const m = wegMerkmale(k.loesung, k.aufgabentext, k.code);
  const teile = einheiten(antwort);
  const zahlen = nurRechenzahlen ? m.rechen : m.zahlen;
  const zahlIn = (s) => [...s.matchAll(ZAHL_RE)].some((x) => zahlen.has(x[0]) && !/\d/.test(s[x.index + x[0].length] || ''));
  const schritte = teile.filter((s) => AKTION_RE.test(s) && zahlIn(s)).length;
  if (schritte >= 2) gruende.push('loesungsweg');
  const flach = String(antwort).replace(/`/g, '');
  const paare = m.paare.filter((p) => {
    const [op, zahl] = p.split(' ');
    return new RegExp(`(?<![/*])${esc(op)}\\s*${esc(zahl)}(?!\\d|\\.\\d)`).test(flach);
  });
  if (paare.length >= 2) gruende.push('loesungsausdruck');
  if (korrektur && teile.some((s) => { const t = ohneTitel(s, k.titel); return m.fixRes.some((re) => re.test(t)); })) gruende.push('korrektur-benannt');
  return gruende;
}

/**
 * Ohne Aufgabenbezug (Konzeptfrage, auch umschriebene Aufgabe in der Lerneinheit): Lösungsweg in Worten
 * und Lösungsausdrücke gegen die bekannte Aufgabe und gegen jede Aufgabe, von deren Rechenzahlen
 * (hinter einem Operator in der Musterlösung, nicht im Aufgabentext) mindestens zwei im Entwurf stehen.
 * Nur Rechenzahlen, weil Datenwerte (Testtabellen, Grenzwerte) in Konzeptbeispielen zufällig vorkommen.
 * Ohne Korrektur-Signal, weil es ohne Aufgabe keinen zu korrigierenden Code gibt.
 */
function wegOhneBezug(antwort, k, andere) {
  const imEntwurf = new Set([...String(antwort || '').matchAll(ZAHL_RE)].map((x) => x[0]));
  if (imEntwurf.size < 2) return null;
  const kandidaten = (k.loesung ? [{ loesung: k.loesung, text: k.aufgabentext, titel: k.titel }] : []).concat(andere);
  for (const a of kandidaten) {
    if (!a || !a.loesung) continue;
    const m = wegMerkmale(a.loesung, a.text, '');
    let n = 0;
    for (const z of m.rechen) if (imEntwurf.has(z)) n += 1;
    if (n < 2) continue;
    const g = wegUndKorrektur(antwort, { loesung: a.loesung, aufgabentext: a.text, code: k.code }, { korrektur: false, nurRechenzahlen: true });
    if (g.length) return { gruende: g, id: a.lektion ? a.lektion + '/' + a.id : null };
  }
  return null;
}

// ---------------------------------------------------------------- a) deterministische Prüfung

/**
 * @param {string} antwort  Antwortentwurf des Modells
 * @param {{loesung?: string, aufgabentext?: string, code?: string, frueher?: string[], alle?: object[], streng?: boolean}} k
 *   Server-Kontext (Musterlösung nur hier); frueher = frühere Tutor-Beiträge des Gesprächs;
 *   streng = Aufgabenbezug (bezug.js), Standard true; false nur bei reinen Konzeptfragen
 * @returns {{loesung: boolean, gruende: string[], werte: object}}
 */
function pruefeDeterministisch(antwort, k = {}) {
  const gruende = [];
  const streng = k.streng !== false;
  const g = grenzen(k);
  const bekannt = new Set(String(k.code || '').split('\n').map(norm).filter((n) => n.length >= 6));
  const z = zerlege(antwort, { bekannt });
  if (z.amStueck > g.amStueck) gruende.push('zu-viel-code-am-stueck');
  if (z.gesamt > g.gesamt) gruende.push('zu-viel-code');
  let wegAndere = null;
  if (streng) gruende.push(...wegUndKorrektur(antwort, k));
  else {
    wegAndere = wegOhneBezug(antwort, k, Array.isArray(k.alle) ? k.alle : []);
    if (wegAndere) gruende.push(...wegAndere.gruende);
  }

  const dekodiert = dekodiereVerdaechtiges(antwort);
  let kandidaten = z.kandidaten;
  if (dekodiert.length) {
    gruende.push('kodierter-inhalt');
    for (const d of dekodiert) kandidaten = kandidaten.concat(d.split('\n'));
  }

  let ue = { anteil: 0, getroffen: 0, zeilen: 0 };
  let ueAlle = { anteil: 0, getroffen: 0, zeilen: 0 };
  const andere = Array.isArray(k.alle) ? k.alle : [];
  if (k.loesung || andere.length) {
    const eigen = eigeneZeilen(k.code);
    // auch jede Zeile der Antwort selbst (Code ohne jede Markierung) und ihre Stücke
    const roh = kandidaten.concat(String(antwort).split('\n').flatMap((zl) => stuecke(ohneListenmarke(zl))));
    const kand = vorbereiteKandidaten(roh, eigen);
    const frueher = Array.isArray(k.frueher) && k.frueher.length ? k.frueher : null;
    let kandVorher = null;
    const mitVorher = () => {
      if (!kandVorher) {
        const vorher = frueher.flatMap((t) => zerlege(t).kandidaten.concat(String(t).split('\n').flatMap((zl) => stuecke(ohneListenmarke(zl)))));
        kandVorher = kand.concat(vorbereiteKandidaten(vorher, eigen));
      }
      return kandVorher;
    };

    // 1) die aktuelle Aufgabe (Lösung vom Server)
    if (k.loesung) {
      ue = ueberdeckungV(kand, k, eigen);
      if (ue.zeilen > 0 && ue.anteil >= SCHWELLE_UEBERDECKUNG) gruende.push('musterloesung');
      // Stückeln über mehrere Beiträge: frühere Tutor-Antworten (aus dem Verlauf) plus dieser Entwurf.
      // Gefälschte frühere Beiträge können die Prüfung nur verschärfen, nie lockern. Angeschlagen wird
      // nur, wenn dieser Entwurf selbst mindestens eine Lösungszeile beiträgt.
      else if (ue.getroffen > 0 && frueher) {
        const zus = ueberdeckungV(mitVorher(), k, eigen);
        if (zus.anteil >= SCHWELLE_UEBERDECKUNG) gruende.push('stueckeln');
      }
    }
    // 2) alle anderen Aufgaben des Kurses (Werkbank, Lerneinheit, eingefügter Aufgabentext)
    if (andere.length && !gruende.includes('musterloesung')) {
      ueAlle = ueberdeckungAlle(kand, andere, eigen);
      // Ohne Aufgabenbezug sind längere Beispiele erlaubt; ein langer Block, der drei oder mehr Zeilen
      // einer Kursaufgabe trifft, ist dann aber schon ab 40 % deren Lösung (umschriebene Aufgabe, A66).
      const schwelle = !streng && z.amStueck > GRENZE_AM_STUECK && ueAlle.getroffen >= 3 ? SCHWELLE_ANDERE_LOCKER : SCHWELLE_UEBERDECKUNG;
      if (ueAlle.anteil >= schwelle) gruende.push('musterloesung-andere');
      else if (frueher && !gruende.includes('stueckeln')) {
        // nur Aufgaben, zu denen dieser Entwurf selbst etwas beiträgt
        const beteiligt = new Set(andere.filter((a) => a && a.loesung
          && ueberdeckungV(kand, { loesung: a.loesung, aufgabentext: a.text }, eigen).getroffen > 0));
        if (beteiligt.size) {
          const zus = ueberdeckungAlle(mitVorher(), andere, eigen, { nurMit: beteiligt });
          if (zus.anteil >= SCHWELLE_UEBERDECKUNG) { gruende.push('stueckeln'); ueAlle = zus; }
        }
      }
    }
  }
  if (promptLeck(antwort)) gruende.push('system-prompt');

  const andereTreffer = ueAlle.id ? { id: ueAlle.id, anteil: ueAlle.anteil, getroffen: ueAlle.getroffen, zeilen: ueAlle.zeilen } : null;
  return { loesung: gruende.length > 0, gruende, werte: { gesamt: z.gesamt, amStueck: z.amStueck, ueberdeckung: ue, andere: andereTreffer, weg: wegAndere ? wegAndere.id : null } };
}

// ---------------------------------------------------------------- b) Prüfer-Aufruf

/**
 * Zweiter, kurzer Modellaufruf. Liefert {loesung: true|false} oder {ausfall: true}.
 * Fehler, Zeitüberschreitung, Ablehnung oder unlesbare Antwort gelten als Ausfall (dann gilt nur a).
 */
async function pruefeMitModell(client, { anfrage, entwurf, modell, timeoutMs, streng = true }) {
  try {
    const r = await client.erzeuge({
      model: modell,
      max_tokens: PRUEFER_MAX_TOKENS,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low', format: { type: 'json_schema', schema: PRUEFER_SCHEMA } },
      system: PRUEFER_SYSTEM,
      messages: [{ role: 'user', content: prueferNachricht(anfrage, entwurf, { streng }) }],
    }, { timeout: timeoutMs, maxRetries: 0 });
    if (!r) return { ausfall: true, ursache: 'leer' };
    if (r.stop_reason === 'refusal') return { ausfall: true, ursache: 'refusal', usage: r.usage };
    const text = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    // Abgeschnittenes JSON: steht das Urteil schon da (es ist das erste Feld), gilt es trotzdem.
    if (r.stop_reason === 'max_tokens') {
      const m = /"loesung_verraten"\s*:\s*(true|false)/.exec(text);
      if (m) return { loesung: m[1] === 'true', ursache: 'max_tokens', usage: r.usage };
      return { ausfall: true, ursache: 'max_tokens', usage: r.usage };
    }
    let daten;
    try { daten = JSON.parse(text); } catch (e) { return { ausfall: true, ursache: 'json', usage: r.usage }; }
    if (!daten || typeof daten.loesung_verraten !== 'boolean') return { ausfall: true, ursache: 'schema', usage: r.usage };
    return { loesung: daten.loesung_verraten, usage: r.usage };
  } catch (e) {
    return { ausfall: true, ursache: e && e.name === 'ModellFehler' ? 'modell' : (e && /timeout|abort/i.test(String(e.name || e.message)) ? 'zeit' : 'fehler'), fehlerArt: e && e.name ? e.name : 'Fehler' };
  }
}

module.exports = {
  pruefeDeterministisch, pruefeMitModell,
  zerlege, istCodeZeile, ueberdeckung, loesungsZeilen, norm, normNamen, promptLeck, dekodiereVerdaechtiges, trifft, stuecke, wegUndKorrektur, grenzen,
  GRENZE_AM_STUECK, GRENZE_GESAMT, GRENZE_AM_STUECK_LOCKER, GRENZE_GESAMT_LOCKER, GRENZE_AM_STUECK_MITTEL, GRENZE_GESAMT_MITTEL,
  SCHWELLE_UEBERDECKUNG, SCHWELLE_ANDERE_LOCKER, PRUEFER_MAX_TOKENS,
};
