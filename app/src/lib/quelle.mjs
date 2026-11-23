/* =============================================================
   quelle.mjs – zerlegt eine site/-Seite für die Hülle (Architektur-Vertrag, Abschnitt 3).
   Lektionen mit MDX-Quelle (Abschnitt 15, src/lib/mdx/) liefern dieselben Felder aus dem übersetzten MDX.
   Byte-genau: Der Inhalt wird per Index aus dem Originaltext geschnitten, nie über einen
   Parser neu serialisiert. Entfernt werden nur Sprunglink (.k-skip), Kopf (header.dhbw-header)
   und Fuß (footer.dhbw-footer); die Skript-Tags am Ende kommen getrennt zurück.
   Erlaubte Umschreibungen: index.html#lernpfad -> lernpfad.html; mit VIDEO_BASIS
   <source src="…/assets/video/X.mp4"> -> VIDEO_BASIS/X.mp4.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from './pfade.mjs';
import { ladeMdx, mdxSeiten } from './mdx/inhalte.mjs';

function fehler(datei, t) { throw new Error(`quelle.mjs (${datei}): ${t}`); }

/* Ende eines Tags ab Position i ('<' ...) unter Beachtung von Anführungszeichen */
function tagEnde(text, i) {
  let q = null;
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '>') return j + 1;
  }
  return -1;
}

/* Attribute eines Start-Tags als Liste [{name, wert}] (wert null bei booleschen Attributen) */
export function attribute(tag) {
  const innen = tag.replace(/^<[a-zA-Z0-9-]+/, '').replace(/\/?>$/, '');
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  const liste = [];
  let m;
  while ((m = re.exec(innen))) liste.push({ name: m[1].toLowerCase(), wert: m[2] ?? m[3] ?? m[4] ?? null });
  return liste;
}

function entitaetenWeg(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
}

/* Block von <tag …marker…> bis zum passenden </tag> (ohne Verschachtelung gleichen Namens) */
function block(text, von, bis, startRe, tagName, datei, pflicht) {
  const ausschnitt = text.slice(von, bis);
  const m = startRe.exec(ausschnitt);
  if (!m) { if (pflicht) fehler(datei, `${startRe} nicht gefunden`); return null; }
  const start = von + m.index;
  const zu = text.indexOf(`</${tagName}>`, start);
  if (zu < 0 || zu > bis) fehler(datei, `</${tagName}> fehlt`);
  const ende = zu + tagName.length + 3;
  const innen = text.slice(tagEnde(text, start), zu);
  if (new RegExp(`<${tagName}[\\s>]`).test(innen)) fehler(datei, `verschachteltes <${tagName}> im entfernten Block`);
  return { start, ende };
}

/* Umschreibungen (nur die im Vertrag erlaubten) */
export function umschreiben(s, videoBasis) {
  let r = s.replace(/(href=")((?:\.\.\/)*)index\.html#lernpfad"/g, '$1$2lernpfad.html"');
  if (videoBasis) {
    const basis = videoBasis.replace(/\/+$/, '');
    r = r.replace(/(<source\b[^>]*?\bsrc=")(?:\.\.\/)*assets\/video\/([^"/]+\.mp4)"/g, (_, a, datei) => `${a}${basis}/${datei}"`);
  }
  return r;
}

/**
 * Zerlegt eine Seite. relPfad relativ zu site/, z. B. 'lektionen/v07-funktionen.html'.
 * Rückgabe: {
 *   relPfad, titel, beschreibung, stylesheets: [href], kopfStile: [roher <style>-Block],
 *   bodyAttribute: [{name, wert}], inhalt (umgeschrieben), inhaltOriginal (Ausschnitte ohne Umschreibung),
 *   ausschnitte: [{von, bis}] (Positionen im Original), skripte: [{src, defer, inline, roh}],
 *   weiterleitung: bool, original
 * }
 */
export function zerlege(relPfad, optionen = {}) {
  /* Lektion mit MDX-Quelle (app/inhalte/vNN/<art>.mdx): gleiche Felder, nur ohne Byte-Ausschnitte */
  const mdx = ladeMdx(relPfad);
  if (mdx) {
    const videoBasis = optionen.videoBasis ?? process.env.VIDEO_BASIS ?? '';
    return { ...mdx, inhalt: umschreiben(mdx.inhalt, videoBasis), inhaltOriginal: mdx.inhalt, ausschnitte: [], original: null };
  }
  const datei = path.join(SITE, relPfad);
  const text = fs.readFileSync(datei, 'utf8');
  return zerlegeText(text, relPfad, optionen);
}

export function zerlegeText(text, relPfad, { videoBasis = process.env.VIDEO_BASIS || '' } = {}) {
  const kopfAuf = text.indexOf('<head>');
  const kopfZu = text.indexOf('</head>');
  if (kopfAuf < 0 || kopfZu < 0) fehler(relPfad, '<head> fehlt');
  const kopf = text.slice(kopfAuf, kopfZu);

  const titelM = /<title>([\s\S]*?)<\/title>/.exec(kopf);
  const titel = titelM ? entitaetenWeg(titelM[1].trim()) : '';
  const beschrM = /<meta\s+name="description"\s+content="([^"]*)"/.exec(kopf);
  const beschreibung = beschrM ? entitaetenWeg(beschrM[1]) : '';
  const stylesheets = [...kopf.matchAll(/<link\b[^>]*>/g)]
    .map((m) => attribute(m[0]))
    .filter((a) => a.some((x) => x.name === 'rel' && x.wert === 'stylesheet'))
    .map((a) => a.find((x) => x.name === 'href').wert);
  const kopfStile = [...kopf.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]);
  const weiterleitung = /<meta\s+http-equiv="refresh"/i.test(kopf);

  const bodyM = /<body\b[^>]*>/.exec(text);
  if (!bodyM) fehler(relPfad, '<body> fehlt');
  const bodyStart = bodyM.index + bodyM[0].length;
  const bodyEnde = text.lastIndexOf('</body>');
  if (bodyEnde < bodyStart) fehler(relPfad, '</body> fehlt');
  const bodyAttribute = attribute(bodyM[0]);

  if (weiterleitung) {
    return { relPfad, titel, beschreibung, stylesheets, kopfStile, bodyAttribute, inhalt: '', inhaltOriginal: '', ausschnitte: [], skripte: [], weiterleitung, original: text };
  }

  const fuss = block(text, bodyStart, bodyEnde, /<footer\s+class="dhbw-footer\b/, 'footer', relPfad, true);
  const kopfzeile = block(text, bodyStart, fuss.start, /<header\s+class="dhbw-header\b/, 'header', relPfad, true);
  let sprung = null;
  const sm = /<a\s+class="k-skip"[^>]*>[\s\S]*?<\/a>/.exec(text.slice(bodyStart, kopfzeile.start));
  if (sm) sprung = { start: bodyStart + sm.index, ende: bodyStart + sm.index + sm[0].length };

  /* Skripte am Ende: alles nach dem Fuß bis </body> muss aus <script>-Tags und Leerraum bestehen */
  const schwanz = text.slice(fuss.ende, bodyEnde);
  const skripte = [];
  const reSkript = /<script\b[^>]*>[\s\S]*?<\/script>/g;
  let rest = schwanz, m;
  while ((m = reSkript.exec(schwanz))) {
    const start = m[0].slice(0, tagEnde(m[0], 0));
    const a = attribute(start);
    const src = a.find((x) => x.name === 'src');
    skripte.push({ src: src ? src.wert : null, defer: a.some((x) => x.name === 'defer'), inline: !src, roh: m[0] });
    rest = rest.replace(m[0], '');
  }
  if (rest.trim()) fehler(relPfad, 'nach dem Seitenfuß steht mehr als <script>-Tags: ' + rest.trim().slice(0, 60));

  /* Inhalt = Original zwischen <body…> und Fuß, ohne Sprunglink und Kopf */
  const ausschnitte = [];
  let pos = bodyStart;
  for (const b of [sprung, kopfzeile].filter(Boolean).sort((x, y) => x.start - y.start)) {
    ausschnitte.push({ von: pos, bis: b.start });
    pos = b.ende;
  }
  ausschnitte.push({ von: pos, bis: fuss.start });
  const inhaltOriginal = ausschnitte.map((x) => text.slice(x.von, x.bis)).join('');
  const inhalt = umschreiben(inhaltOriginal, videoBasis);
  if (!/\bid="inhalt"/.test(inhalt)) fehler(relPfad, 'Element mit id="inhalt" fehlt im Inhalt');

  return { relPfad, titel, beschreibung, stylesheets, kopfStile, bodyAttribute, inhalt, inhaltOriginal, ausschnitte, skripte, weiterleitung, original: text };
}

/* Einzelne Abschnitte <section … id="X"> … </section> einer site/-Seite, byte-genau ausgeschnitten.
   Für „Über den Kurs“ (Inhalte der bisherigen Startseite). */
export function abschnitte(relPfad, ids) {
  const text = fs.readFileSync(path.join(SITE, relPfad), 'utf8');
  return ids.map((id) => {
    const re = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`);
    const b = block(text, 0, text.length, re, 'section', relPfad, true);
    return text.slice(b.start, b.ende);
  });
}
export function textVon(relPfad, re) {
  const m = re.exec(fs.readFileSync(path.join(SITE, relPfad), 'utf8'));
  return m ? m[1] : '';
}

/* HTML einer Seite zum Auslesen (Index, Glossar, Tutor-Daten): site/-Datei oder übersetztes MDX */
export function seitenHtml(relPfad) {
  const mdx = ladeMdx(relPfad);
  return mdx ? `<body>${mdx.inhalt}</body>` : fs.readFileSync(path.join(SITE, relPfad), 'utf8');
}

/* Alle zu veröffentlichenden Seiten (relativ zu site/): site/-Seiten und Lektionen mit MDX-Quelle */
export const NICHT_VEROEFFENTLICHT = ['werkzeuge/labor-test.html', 'index.html'];
export function alleSeiten() {
  const liste = [];
  const lauf = (rel) => {
    for (const f of fs.readdirSync(path.join(SITE, rel))) {
      const r = rel ? `${rel}/${f}` : f;
      const p = path.join(SITE, r);
      if (fs.statSync(p).isDirectory()) { if (!['assets', 'notebooks'].includes(f)) lauf(r); }
      else if (f.endsWith('.html') && !NICHT_VEROEFFENTLICHT.includes(r)) liste.push(r);
    }
  };
  lauf('');
  for (const r of mdxSeiten()) if (!liste.includes(r)) liste.push(r);
  return liste.sort();
}
