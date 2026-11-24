/* =============================================================
   kompilieren.mjs – eine MDX-Lektion (app/inhalte/vNN/<art>.mdx) wird zu dem, was quelle.mjs
   bisher aus einer site/-Seite geschnitten hat: Titel, Beschreibung, Stylesheets, Body-Attribute,
   Inhalt (HTML) und Skripte. Alles danach (Hülle, Index, Glossar, Tutor-Daten) bleibt unverändert.

   Aufbau einer Datei:
     ---
     titel: …            <title>
     beschreibung: …     <meta name="description">
     body: {data-lesson: V01, data-page: lerneinheit}
     stile: [../assets/css/dhbw-base.css, …]
     skripte: [../assets/js/speicher.js, {src: ../assets/js/kurs.js, defer: true}]
     ---
     Markdown und Bausteine (siehe bausteine.mjs)
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { evaluateSync } from '@mdx-js/mdx';
import { jsx, jsxs, Fragment, zuHtml } from './knoten.mjs';
import { bausteine } from './bausteine.mjs';

/* Angaben hinter der Sprache eines Codeblocks (```python data-timeout="5000") an das code-Element hängen */
function codeAngaben() {
  const lauf = (k) => {
    if (k.type === 'element' && k.tagName === 'code' && k.data && k.data.meta) k.properties.dataMeta = k.data.meta;
    for (const kind of k.children || []) lauf(kind);
  };
  return (baum) => lauf(baum);
}

/** Kopf (YAML zwischen --- und ---) vom Rumpf trennen. */
export function trenne(text, datei = 'MDX') {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) throw new Error(`${datei}: Kopf (--- … ---) fehlt`);
  const kopf = YAML.parse(m[1]) || {};
  return { kopf, rumpf: text.slice(m[0].length), kopfZeilen: m[0].split('\n').length - 1 };
}

/** MDX-Rumpf zu HTML. ordner: Ordner der Datei (für Bausteine, die Dateien einlesen). */
export function mdxZuHtml(rumpf, { ordner = null, datei = 'MDX' } = {}) {
  let modul;
  try {
    modul = evaluateSync(rumpf, {
      jsx, jsxs, Fragment,
      format: 'mdx',
      elementAttributeNameCase: 'html',
      stylePropertyNameCase: 'css',
      rehypePlugins: [codeAngaben],
    });
  } catch (e) {
    const wo = e && e.line ? ` (Zeile ${e.line}${e.column ? ':' + e.column : ''} im Rumpf)` : '';
    throw new Error(`${datei}${wo}: ${e && e.reason ? e.reason : e && e.message ? e.message : e}`);
  }
  try {
    return zuHtml(modul.default({ components: bausteine({ ordner, datei }) }));
  } catch (e) {
    throw new Error(`${datei}: ${e && e.message ? e.message : e}`);
  }
}

const skriptTag = (s) => (typeof s === 'string' ? `<script src="${s}"></script>` : s.roh ? String(s.roh) : `<script src="${s.src}"${s.defer ? ' defer' : ''}></script>`);

/**
 * Ganze Datei übersetzen. Rückgabe wie zerlege() in quelle.mjs (ohne die Felder für den Byte-Vergleich).
 */
export function kompiliere(datei, relPfad) {
  const text = fs.readFileSync(datei, 'utf8');
  const { kopf, rumpf } = trenne(text, datei);
  for (const k of ['titel', 'body', 'stile', 'skripte']) if (kopf[k] == null) throw new Error(`${datei}: Feld ${k} fehlt im Kopf`);
  const inhalt = mdxZuHtml(rumpf, { ordner: path.dirname(datei), datei });
  if (!/\bid="inhalt"/.test(inhalt)) throw new Error(`${datei}: Element mit id="inhalt" fehlt im Inhalt`);
  const skripte = kopf.skripte.map((s) => {
    const roh = skriptTag(s);
    const src = typeof s === 'string' ? s : s.src || null;
    return { src, defer: Boolean(s && s.defer), inline: !src, roh };
  });
  return {
    relPfad,
    mdx: datei,
    titel: String(kopf.titel),
    beschreibung: String(kopf.beschreibung || ''),
    stylesheets: kopf.stile.map(String),
    kopfStile: (kopf.kopfStile || []).map(String),
    bodyAttribute: Object.entries(kopf.body).map(([name, wert]) => ({ name, wert: wert === true || wert === null ? null : String(wert) })),
    inhalt,
    skripte,
    weiterleitung: false,
  };
}
