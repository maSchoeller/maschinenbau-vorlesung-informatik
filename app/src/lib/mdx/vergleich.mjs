/* =============================================================
   vergleich.mjs – sind zwei HTML-Stücke für den Browser dasselbe?
   Beide werden zu einer Normalform (Liste von Marken) gemacht und verglichen. Gleich heißt:
   gleiche Elemente in gleicher Reihenfolge, gleiche Attribute (Reihenfolge egal), gleicher Text.
   Leerraum zählt, wo der Browser ihn zeigt: in <pre> und <textarea> zeichengenau, im Fließtext
   als ein Leerzeichen, an Blockgrenzen gar nicht. Kommentare zählen nicht.
   Python in <script type="text/x-python"> wird verglichen, wie aufgaben.js es liest
   (ein Zeilenumbruch am Anfang und Leerraum am Ende entfallen), JSON nach seinem Wert.
   ============================================================= */
import { parse } from 'node-html-parser';
import { decodeNamedCharacterReference } from 'decode-named-character-reference';

const BLOCK = new Set(('address article aside audio blockquote body br dd details dialog div dl dt fieldset figcaption figure footer form '
  + 'h1 h2 h3 h4 h5 h6 head header hgroup hr html li main nav noscript ol optgroup option p picture pre script section select source style '
  + 'summary table tbody td template tfoot th thead title tr track ul video').split(' '));
const ROH = { script: true, style: true, textarea: true };

/** Zeichenreferenzen (&amp; &#x27; &nbsp; …) zu Zeichen. */
export function entitaeten(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (alles, n) => {
    if (n[0] === '#') { const z = n[1].toLowerCase() === 'x' ? parseInt(n.slice(2), 16) : parseInt(n.slice(1), 10); return Number.isFinite(z) && z > 0 && z <= 0x10ffff ? String.fromCodePoint(z) : alles; }
    const z = decodeNamedCharacterReference(n);
    return z === false ? alles : z;
  });
}

function skriptText(el) {
  const typ = (el.getAttribute('type') || '').toLowerCase();
  const text = el.rawText.replace(/\r\n/g, '\n');
  if (typ === 'text/x-python') return text.replace(/^\n/, '').replace(/\s+$/, '');
  if (typ === 'application/json') { try { return JSON.stringify(JSON.parse(text)); } catch { return text.trim(); } }
  return text.trim();
}

/** HTML -> Liste von Marken: {a: 'auf', tag, attrs} | {a: 'zu', tag} | {a: 'text', text, genau} */
export function marken(html) {
  const wurzel = parse(html, { comment: false, blockTextElements: ROH });
  const liste = [];
  const lauf = (k, inPre) => {
    if (k.nodeType === 3) {
      const text = entitaeten(k.rawText.replace(/\r\n/g, '\n'));
      liste.push({ a: 'text', text, genau: inPre });
      return;
    }
    if (k.nodeType !== 1) return;
    const tag = (k.rawTagName || '').toLowerCase();
    if (!tag) { for (const c of k.childNodes) lauf(c, inPre); return; }
    const attrs = Object.entries(k.rawAttributes || {}).map(([n, w]) => {
      let wert = w === null || w === undefined ? '' : entitaeten(String(w));   /* Attribut ohne Wert (hidden, controls) */
      if (n.toLowerCase() === 'class') wert = wert.trim().split(/\s+/).join(' ');
      return n.toLowerCase() === 'viewbox' ? ['viewBox', wert] : [n, wert];
    }).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    liste.push({ a: 'auf', tag, attrs: attrs.map(([n, w]) => `${n}=${JSON.stringify(w)}`).join(' ') });
    if (tag === 'script' || tag === 'style') liste.push({ a: 'text', text: tag === 'script' ? skriptText(k) : k.rawText.trim(), genau: true });
    else if (tag === 'textarea') liste.push({ a: 'text', text: entitaeten(k.rawText.replace(/\r\n/g, '\n')).replace(/^\n/, ''), genau: true });
    else {
      const start = liste.length;
      for (const c of k.childNodes) lauf(c, inPre || tag === 'pre');
      /* HTML ignoriert einen Zeilenumbruch direkt nach <pre> */
      if (tag === 'pre' && liste[start] && liste[start].a === 'text') liste[start].text = liste[start].text.replace(/^\n/, '');
    }
    liste.push({ a: 'zu', tag });
  };
  for (const c of wurzel.childNodes) lauf(c, false);

  /* Texte zusammenfassen, Leerraum im Fließtext auf ein Leerzeichen, an Blockgrenzen weg */
  const aus = [];
  for (const m of liste) {
    const vor = aus[aus.length - 1];
    if (m.a === 'text' && vor && vor.a === 'text' && vor.genau === m.genau) vor.text += m.text; else aus.push({ ...m });
  }
  const block = (m) => !m || (m.a !== 'text' && BLOCK.has(m.tag));
  const fertig = [];
  aus.forEach((m, i) => {
    if (m.a !== 'text') { fertig.push(m); return; }
    if (m.genau) { if (m.text !== '') fertig.push(m); return; }
    let t = m.text.replace(/[ \t\n\r\f]+/g, ' ');
    if (block(aus[i - 1])) t = t.replace(/^ /, '');
    if (block(aus[i + 1])) t = t.replace(/ $/, '');
    if (t !== '') fertig.push({ a: 'text', text: t, genau: false });
  });
  return fertig;
}

const zeige = (m) => (!m ? '(Ende)' : m.a === 'auf' ? `<${m.tag}${m.attrs ? ' ' + m.attrs : ''}>` : m.a === 'zu' ? `</${m.tag}>` : JSON.stringify(m.text.length > 160 ? m.text.slice(0, 160) + '…' : m.text));
const gleich = (x, y) => x && y && x.a === y.a && (x.a === 'text' ? x.text === y.text : x.tag === y.tag && (x.a === 'zu' || x.attrs === y.attrs));

/** null, wenn gleich; sonst {stelle, alt, neu, davor} mit der ersten Abweichung. */
export function unterschied(altHtml, neuHtml) {
  const a = marken(altHtml), b = marken(neuHtml);
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (!gleich(a[i], b[i])) {
      let alt = zeige(a[i]), neu = zeige(b[i]);
      if (a[i] && b[i] && a[i].a === 'text' && b[i].a === 'text') {
        let j = 0;
        while (j < a[i].text.length && a[i].text[j] === b[i].text[j]) j++;
        const von = Math.max(0, j - 30);
        alt = JSON.stringify(a[i].text.slice(von, j + 60)); neu = JSON.stringify(b[i].text.slice(von, j + 60));
      }
      return { stelle: i, alt, neu, davor: a.slice(Math.max(0, i - 3), i).map(zeige).join(' ') };
    }
  }
  return null;
}
export const istGleich = (altHtml, neuHtml) => unterschied(altHtml, neuHtml) === null;
