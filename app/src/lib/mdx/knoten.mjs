/* =============================================================
   knoten.mjs – kleines Knotenmodell für die MDX-Inhalte und die JSX-Laufzeit dazu.
   MDX wird mit @mdx-js/mdx übersetzt; statt React entsteht ein Baum aus schlichten Knoten,
   den die Bausteine (bausteine.mjs) umbauen dürfen und der am Ende zu HTML wird.

     Element   {tag, attrs: {name: wert|true}, kinder: [Knoten]}
     Text      'Zeichenkette' (wird beim Ausgeben maskiert)
     Roh       {roh: '<fertiges HTML>'} (wird unverändert ausgegeben)

   Kein Framework im Browser: Das Ergebnis ist statisches HTML wie die bisherigen site/-Seiten.
   ============================================================= */

export const LEER = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ROHTEXT = new Set(['script', 'style']);

/** Kinder flach machen; null, undefined, false und true entfallen, Zahlen werden Text. */
export function flach(k, ziel = []) {
  if (k === null || k === undefined || k === false || k === true) return ziel;
  if (Array.isArray(k)) { for (const x of k) flach(x, ziel); return ziel; }
  ziel.push(typeof k === 'number' ? String(k) : k);
  return ziel;
}

/** Element anlegen: h('p', {class: 'x'}, 'Text', h('em', null, 'betont')) */
export function h(tag, attrs, ...kinder) {
  const a = {};
  for (const [n, w] of Object.entries(attrs || {})) if (w !== null && w !== undefined && w !== false) a[n] = w === true ? true : String(w);
  return { tag, attrs: a, kinder: flach(kinder) };
}
export const roh = (html) => ({ roh: String(html) });
export const istElement = (k, tag) => Boolean(k) && typeof k === 'object' && typeof k.tag === 'string' && (!tag || k.tag === tag);
export const istLeerraum = (k) => typeof k === 'string' && !/\S/.test(k);
export const hatKlasse = (k, klasse) => istElement(k) && String(k.attrs.class || '').split(/\s+/).includes(klasse);
/** Kinder ohne reine Leerraum-Texte (Zeilenumbrüche zwischen Blöcken). */
export const ohneLeerraum = (kinder) => kinder.filter((k) => !istLeerraum(k));
/** Reiner Text eines Knotens (ohne Markup). */
export function textVon(k) {
  if (typeof k === 'string') return k;
  if (Array.isArray(k)) return k.map(textVon).join('');
  if (istElement(k)) return k.kinder.map(textVon).join('');
  return '';
}

const maskText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const maskAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function zuHtml(k) {
  if (k === null || k === undefined) return '';
  if (typeof k === 'string') return maskText(k);
  if (Array.isArray(k)) return k.map(zuHtml).join('');
  if (typeof k.roh === 'string') return k.roh;
  if (!istElement(k)) throw new Error('knoten.mjs: unbekannter Knoten ' + JSON.stringify(k).slice(0, 80));
  let s = '<' + k.tag;
  for (const [n, w] of Object.entries(k.attrs)) s += w === true ? ' ' + n : ` ${n}="${maskAttr(w)}"`;
  s += '>';
  if (LEER.has(k.tag)) return s;
  const innen = ROHTEXT.has(k.tag) ? k.kinder.map((x) => (typeof x === 'string' ? x : zuHtml(x))).join('') : zuHtml(k.kinder);
  return s + innen + `</${k.tag}>`;
}

/* ── JSX-Laufzeit für @mdx-js/mdx (automatische Laufzeit: jsx, jsxs, Fragment) ───────────── */
export const Fragment = Symbol('Fragment');
export function jsx(typ, props) {
  const { children, ...rest } = props || {};
  const kinder = flach(children);
  if (typ === Fragment) return kinder;
  if (typeof typ === 'function') return typ({ ...rest, kinder });
  if (typeof typ !== 'string') throw new Error('MDX: Baustein ist nicht definiert');
  return h(typ, rest, kinder);
}
export const jsxs = jsx;
