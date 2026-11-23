'use strict';
// Kursstruktur für das Gruppenbild: je Lektion die Abschnitte der Lerneinheit, das Quiz und die
// Labor-Stationen mit ihren prüfbaren Teilen. Kommt aus api/daten/aufgaben.json, Feld `kurs`
// (vom App-Build erzeugt, app/skripte/index-bauen.mjs). Ohne die Datei gibt es kein Gruppenbild.

const fs = require('node:fs');
const path = require('node:path');

const DATEI = path.join(__dirname, '..', '..', 'daten', 'aufgaben.json');
const NR_RE = /^V\d{2}$/;
const ID_RE = /^[A-Za-z0-9:._-]{1,80}$/;

let cache;   // undefined = noch nicht gelesen, null = fehlt

const ids = (liste) => (Array.isArray(liste) ? liste.filter((x) => typeof x === 'string' && ID_RE.test(x)) : []);

function normal(roh) {
  if (!Array.isArray(roh)) return null;
  const kurs = [];
  for (const t of roh) {
    if (!t || !NR_RE.test(t.nr)) continue;
    kurs.push({
      nr: t.nr,
      quiz: typeof t.quiz === 'string' && ID_RE.test(t.quiz) ? t.quiz : null,
      abschnitte: ids(t.abschnitte),
      stationen: (Array.isArray(t.stationen) ? t.stationen : [])
        .filter((s) => s && typeof s.id === 'string' && ID_RE.test(s.id))
        .map((s) => ({ id: s.id, teil: s.teil === 'A' || s.teil === 'B' ? s.teil : null, pruefbar: ids(s.pruefbar) })),
    });
  }
  return kurs.length ? kurs : null;
}

/** Kursstruktur oder null (Datei fehlt oder hat das Feld `kurs` nicht). */
function kursstruktur() {
  if (cache !== undefined) return cache;
  try {
    cache = normal(JSON.parse(fs.readFileSync(DATEI, 'utf8')).kurs);
  } catch (e) {
    cache = null;
  }
  return cache;
}

/** Nur für Tests: eigene Struktur setzen (undefined = wieder aus der Datei lesen). */
function _setzeKursstruktur(roh) { cache = roh === undefined ? undefined : normal(roh); }

module.exports = { kursstruktur, _setzeKursstruktur, DATEI };
