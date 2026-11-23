/* =============================================================
   html-nach-mdx.mjs – zieht eine site/-Lektionsseite nach MDX um (app/inhalte/vNN/<art>.mdx).

   Aufruf (in app/):
     node skripte/html-nach-mdx.mjs lektionen/v07-funktionen.html            nur Bericht
     node skripte/html-nach-mdx.mjs lektionen/v07-funktionen.html --schreiben  schreibt MDX und Code-Dateien
     node skripte/html-nach-mdx.mjs --alle                                    Bericht über alle Lektionen

   Arbeitsweise: Jeder Block wird in der lesbarsten Form versucht und sofort geprüft, indem das
   MDX wieder zu HTML übersetzt und mit dem Original verglichen wird (src/lib/mdx/vergleich.mjs):
     1. Baustein oder Markdown (Abschnitt, Hinweis, Vorhersage, Absatz, Liste, Codeblock …)
     2. HTML-Element mit umgezogenem Inhalt (<div class="…"> … </div>)
     3. unverändertes HTML in <Html>{`…`}</Html>
   Dadurch ist das Ergebnis immer gleich dem Original; der Bericht nennt, wie viel noch in Stufe 3 steckt.
   Python (Tests, Lösungen, Startcode) und JSON wandern in Dateien neben die MDX-Datei.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { parse } from 'node-html-parser';
import { APP, SITE, CACHE } from '../src/lib/pfade.mjs';
import { zerlegeText } from '../src/lib/quelle.mjs';
import { ladeKurs, terminZuDatei } from '../src/lib/kurs.mjs';
import { mdxZuHtml } from '../src/lib/mdx/kompilieren.mjs';
import { unterschied, entitaeten } from '../src/lib/mdx/vergleich.mjs';

const BLOCK = new Set(('address article aside audio blockquote dd details dialog div dl dt fieldset figcaption figure footer form '
  + 'h1 h2 h3 h4 h5 h6 header hgroup hr li main nav noscript ol p picture pre script section select source style '
  + 'summary table tbody td template tfoot th thead tr track ul video textarea').split(' '));
const LEER = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const HINWEIS_TITEL = { merke: 'Merke', achtung: 'Achtung', warum: 'Warum muss ich das wissen?' };

class Nicht extends Error {}
const nicht = (grund) => { throw new Nicht(grund); };

/* ── Knoten-Hilfen (node-html-parser) ────────────────────────────── */
const istEl = (k, tag) => k && k.nodeType === 1 && (!tag || k.rawTagName.toLowerCase() === tag);
const istText = (k) => k && k.nodeType === 3;
const tagVon = (k) => k.rawTagName.toLowerCase();
const attrsVon = (k) => Object.fromEntries(Object.entries(k.rawAttributes || {}).map(([n, w]) => [n, w === null || w === undefined ? '' : entitaeten(String(w))]));
const klassen = (k) => (attrsVon(k).class || '').trim().split(/\s+/).filter(Boolean);
const hat = (k, kl) => klassen(k).includes(kl);
const textRoh = (k) => entitaeten(k.rawText.replace(/\r\n/g, '\n'));
const leerraum = (k) => istText(k) && !/\S/.test(textRoh(k));
const kinder = (k) => k.childNodes.filter((c) => c.nodeType === 1 || c.nodeType === 3);
const elemente = (k) => k.childNodes.filter((c) => c.nodeType === 1);
const ohneLeer = (k) => kinder(k).filter((c) => !leerraum(c));
const nurText = (k) => kinder(k).every(istText);
const istBlock = (k) => istEl(k) && BLOCK.has(tagVon(k));
const nurInline = (k) => kinder(k).every((c) => istText(c) || (istEl(c) && !istBlock(c) && nurInlineTief(c)));
function nurInlineTief(k) { return kinder(k).every((c) => istText(c) || (istEl(c) && !istBlock(c) && nurInlineTief(c))); }
/* genau diese Attribute (Namen), sonst keine */
const nurAttrs = (k, namen) => Object.keys(attrsVon(k)).every((n) => namen.includes(n));

/* ── Text und Attribute für MDX ───────────────────────────────────── */
function maskiere(text) {
  return text.replace(/[ \t\n\r\f]+/g, ' ')
    .replace(/[\\`*_{}<>[\]~|]/g, '\\$&')
    .replace(/&/g, '&amp;')
    .replace(/ /g, '&nbsp;').replace(/­/g, '&shy;');
}
/* Zeichen, die am Zeilenanfang etwas anderes bedeuten würden (Überschrift, Liste, Zitat, import/export) */
function zeilenanfang(s) {
  return s.replace(/^(\s*)(#{1,6}(?=\s|$)|[-+](?=\s|$)|=+(?=\s*$)|(\d+)([.)])(?=\s|$))/, (alles, leer, marke, zahl, punkt) => (zahl ? `${leer}${zahl}\\${punkt}` : `${leer}\\${marke}`))
    .replace(/^(\s*)(import|export)\b/, (alles, leer, wort) => `${leer}&#${wort.charCodeAt(0)};${wort.slice(1)}`);
}
const NAME_RE = /^[A-Za-z_][A-Za-z0-9_:.-]*$/;
function attr(name, wert) {
  if (!NAME_RE.test(name)) nicht('Attributname ' + name);
  if (wert === '') return name;
  return /^[^"{}&\n\r\\<>]*$/.test(wert) ? `${name}="${wert}"` : `${name}={${JSON.stringify(wert)}}`;
}
const attrText = (obj) => Object.entries(obj).map(([n, w]) => ' ' + attr(n, w)).join('');
const ausdruck = (text) => '{' + JSON.stringify(text) + '}';

/* ── Fließtext (inline) ───────────────────────────────────────────── */
function inlineKinder(k, opt) { return kinder(k).map((c) => inline(c, opt)).join(''); }
function inline(k, opt) {
  if (istText(k)) return maskiere(textRoh(k));
  if (!istEl(k)) return '';
  const tag = tagVon(k), a = attrsVon(k), n = Object.keys(a).length;
  if (istBlock(k) && !opt.einzeilig) nicht('Block im Fließtext: ' + tag);
  if (tag === 'script' || tag === 'style' || tag === 'textarea') nicht(tag + ' im Fließtext');
  if (tag === 'pre') {
    const code = ohneLeer(k);
    if (code.length === 1 && istEl(code[0], 'code') && nurText(code[0])) return `<pre${attrText(a)}><code${attrText(attrsVon(code[0]))}>${ausdruck(textRoh(code[0]))}</code></pre>`;
    if (nurText(k)) return `<pre${attrText(a)}>${ausdruck(textRoh(k))}</pre>`;
    nicht('pre mit Markup');
  }
  if (tag === 'br' && !n) return '<br />';
  if (!opt.sicher) {
    const innen = () => inlineKinder(k, opt);
    if (tag === 'strong' && !n && kinder(k).length) { const s = innen(); if (s.trim() === s && s) return `**${s}**`; }
    if (tag === 'em' && !n && kinder(k).length) { const s = innen(); if (s.trim() === s && s) return `*${s}*`; }
    if (tag === 'a' && n === 1 && a.href && /^[^\s()<>\\"]+$/.test(a.href) && kinder(k).length) return `[${innen()}](${a.href})`;
  }
  if (tag === 'code' && nurText(k)) {
    const t = textRoh(k);
    if (n === 1 && a.class === 'k-i' && t && !/[`\n]/.test(t) && t.trim() === t) return '`' + t + '`';
    return `<code${attrText(a)}>${/^[A-Za-z0-9 .,:;()=+\-/'"%!?äöüÄÖÜß]*$/.test(t) ? t : ausdruck(t)}</code>`;
  }
  if (tag === 'abbr' && a.class === 'k-begriff' && a['data-erklaerung'] !== undefined && n === 2) return `<Begriff ${attr('e', a['data-erklaerung'])}>${inlineKinder(k, opt)}</Begriff>`;
  if (tag === 'svg' && a.class === 'k-ic' && a['aria-hidden'] === 'true' && a.focusable === 'false' && n === 3) {
    const use = ohneLeer(k);
    const m = use.length === 1 && istEl(use[0], 'use') && /^\.\.\/assets\/img\/icons\.svg#i-([a-z0-9-]+)$/.exec(attrsVon(use[0]).href || '');
    if (m && Object.keys(attrsVon(use[0])).length === 1) return `<Icon n="${m[1]}" />`;
  }
  if (LEER.has(tag)) return `<${tag}${attrText(a)} />`;
  if (!kinder(k).length) return `<${tag}${attrText(a)}></${tag}>`;
  return `<${tag}${attrText(a)}>${inlineKinder(k, opt)}</${tag}>`;
}

/* ── Umzug einer Seite ────────────────────────────────────────────── */
function umziehen(relPfad, { schreiben = false, leise = false } = {}) {
  const zu = terminZuDatei(relPfad.replace(/^lektionen\//, ''));
  if (!zu) throw new Error(`${relPfad} steht nicht in kurs.yaml`);
  const nr = zu.termin.nr.toLowerCase();
  const zielOrdner = schreiben ? path.join(APP, 'inhalte', nr) : path.join(CACHE, 'umzug', nr);
  const unterordner = zu.art;                                   /* Code-Dateien: <art>/<name> */
  fs.mkdirSync(path.join(zielOrdner, unterordner), { recursive: true });

  const q = zerlegeText(fs.readFileSync(path.join(SITE, relPfad), 'utf8'), relPfad, { videoBasis: '' });
  const wurzel = parse(q.inhaltOriginal, { comment: false, blockTextElements: { script: true, style: true, textarea: true } });
  const stat = { zeichen: q.inhaltOriginal.length, roh: 0, rohBloecke: [], dateien: 0, einzeilig: 0 };
  const vergeben = new Set();

  const gleich = (knoten, mdx) => {
    let html;
    try { html = mdxZuHtml(mdx, { ordner: zielOrdner, datei: relPfad }); } catch (e) { return false; }
    return unterschied(knoten.outerHTML, html) === null;
  };
  function datei(knoten, endung, inhalt) {
    let p = knoten, id = null;
    while (p && !id) { if (istEl(p)) id = attrsVon(p)['data-id'] || null; p = p.parentNode; }
    if (!id) { p = knoten; while (p && !id) { if (istEl(p) && attrsVon(p).id && /^(section|div|article)$/.test(tagVon(p))) id = attrsVon(p).id; p = p.parentNode; } }
    const basis = (id || 'block').replace(/[^A-Za-z0-9._-]+/g, '-');
    let name = `${unterordner}/${basis}.${endung}`, i = 2;
    while (vergeben.has(name)) name = `${unterordner}/${basis}-${i++}.${endung}`;
    vergeben.add(name);
    fs.writeFileSync(path.join(zielOrdner, name), inhalt);
    stat.dateien++;
    return name;
  }

  /* Stufe 3 */
  function unveraendert(k) {
    const html = k.outerHTML;
    stat.roh += html.length;
    stat.rohBloecke.push(`${tagVon(k)}${klassen(k).length ? '.' + klassen(k).join('.') : ''} (${html.length})`);
    return '<Html>{`' + html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`}</Html>';
  }
  const absatz = (k, opt) => zeilenanfang(inlineKinder(k, opt).trim());
  const bloecke = (liste, gr) => liste.filter((c) => !leerraum(c)).map((c) => block(c, gr)).join('\n\n');
  const huelle = (auf, innen, zu2) => (innen ? `${auf}\n\n${innen}\n\n${zu2}` : `${auf}\n${zu2}`);

  function zaun(k, a, sprache, text) {
    const meta = Object.entries(a).map(([n, w]) => {
      if (!NAME_RE.test(n) || /\s/.test(n)) nicht('Angabe');
      if (w === '') return n;
      if (!/["\n]/.test(w)) return `${n}="${w}"`;
      if (!/['\n]/.test(w)) return `${n}='${w}'`;
      return nicht('Anführungszeichen in Angabe');
    }).join(' ');
    let z = '```';
    while (text.includes(z)) z += '`';
    if (/^\s*$/.test(text) && text !== '') nicht('leerer Codeblock');
    return `${z}${sprache}${meta ? ' ' + meta : ''}\n${text}\n${z}`;
  }

  /* Kandidaten für einen Block, lesbarste zuerst; jeder wird gegen das Original geprüft */
  function* kandidaten(k, gr) {
    const tag = tagVon(k), a = attrsVon(k), n = Object.keys(a).length, kl = klassen(k);
    const el = elemente(k);

    /* Abschnitt einer Lerneinheit */
    if (tag === 'section' && a.class === 'k-section' && a.id && a['data-section'] === a.id && nurAttrs(k, ['class', 'id', 'data-section', 'aria-labelledby'])) {
      const h2 = el[0];
      if (istEl(h2, 'h2') && attrsVon(h2).class === 'k-section__title' && attrsVon(h2).id === a['aria-labelledby']) {
        const teile = ohneLeer(h2);
        const num = teile[0], titel = teile[1], zusatz = teile[2];
        if (istEl(num, 'span') && attrsVon(num).class === 'k-section__num' && istText(titel) && teile.length <= 3
          && (!zusatz || (istEl(zusatz, 'span') && attrsVon(zusatz).class === 'k-muted' && nurText(zusatz)))) {
          const p = { id: a.id, nr: textRoh(num).trim(), titel: textRoh(titel).replace(/\s+/g, ' ').trim() };
          if (zusatz) p.zusatz = textRoh(zusatz).trim();
          if (attrsVon(h2).id !== 'h-' + a.id) p.kopf = attrsVon(h2).id;
          yield huelle(`<Abschnitt${attrText(p)}>`, bloecke(kinder(k).filter((c) => c !== h2), gr), '</Abschnitt>');
        }
      }
    }
    /* Station im Labor */
    if (tag === 'section' && a.class === 'l-task' && a.id && a['aria-labelledby'] === 'h-' + a.id && a.hidden !== undefined
      && nurAttrs(k, ['class', 'id', 'data-title', 'data-part', 'data-stars', 'data-min', 'data-extra', 'aria-labelledby', 'hidden'])) {
      const kopf = el[0];
      if (istEl(kopf, 'header') && attrsVon(kopf).class === 'l-task__head') {
        const p = { id: a.id, titel: a['data-title'] || '', teil: a['data-part'] || '' };
        if (a['data-stars']) p.sterne = a['data-stars'];
        if (a['data-min']) p.min = a['data-min'];
        if (a['data-extra']) p.extra = a['data-extra'];
        yield huelle(`<Station${attrText(p)}>`, bloecke(kinder(k).filter((c) => c !== kopf), gr), '</Station>');
      }
    }
    /* Hinweis */
    if (tag === 'div' && kl.length === 2 && kl[0] === 'hinweis' && /^hinweis--/.test(kl[1]) && n === 1) {
      const t = el[0];
      if (istEl(t, 'strong') && attrsVon(t).class === 'hinweis__title' && nurText(t)) {
        const art = kl[1].slice('hinweis--'.length), titel = textRoh(t).trim();
        const p = { art };
        if (HINWEIS_TITEL[art] !== titel) p.titel = titel;
        yield huelle(`<Hinweis${attrText(p)}>`, bloecke(kinder(k).filter((c) => c !== t), gr), '</Hinweis>');
      }
    }
    /* Vorhersage */
    if (tag === 'div' && a.class === 'k-predict' && n === 1 && el.length === 4) {
      const [f, o, r, e] = el;
      if (hat(f, 'k-predict__q') && nurInline(f) && hat(o, 'k-predict__opts') && hat(r, 'k-predict__result') && !kinder(r).length
        && hat(e, 'k-predict__expl') && nurInline(e) && elemente(o).every((b) => istEl(b, 'button') && nurInline(b))) {
        for (const opt of [{}, { sicher: true }]) {
          const punkte = elemente(o).map((b) => '- ' + (attrsVon(b)['data-correct'] !== undefined ? '[x] ' : '') + zeilenanfang(inlineKinder(b, opt).trim()));
          yield huelle('<Vorhersage>', [absatz(f, opt), punkte.join('\n'), absatz(e, opt)].join('\n\n'), '</Vorhersage>');
        }
      }
    }
    /* Quiz und Frage */
    if (tag === 'div' && a.class === 'k-quiz' && a['data-quiz'] && n === 2) {
      const letzt = el[el.length - 1];
      if (letzt && hat(letzt, 'k-score') && !kinder(letzt).length) yield huelle(`<Quiz id="${a['data-quiz']}">`, bloecke(el.slice(0, -1), gr), '</Quiz>');
    }
    if (tag === 'div' && a.class === 'k-q' && a['data-id']) {
      const [kopf, text, ...rest] = el;
      const optionen = rest.find((x) => hat(x, 'k-q__options')), erkl = rest.find((x) => hat(x, 'k-q__expl'));
      if (kopf && hat(kopf, 'k-q__head') && text && hat(text, 'k-q__text') && rest.every((x) => x === optionen || x === erkl)) {
        const [tt, pp] = elemente(kopf);
        const p = { id: a['data-id'], typ: a['data-type'] || '', punkte: a['data-points'] || '' };
        if (a['data-answer'] !== undefined) p.antwort = a['data-answer'];
        if (a['data-tol'] !== undefined) p.tol = a['data-tol'];
        p.titel = tt ? textRoh(tt).trim() : '';
        for (const [name, w] of Object.entries(a)) if (!['class', 'data-id', 'data-type', 'data-points', 'data-answer', 'data-tol'].includes(name)) p[name] = w;
        if (tt && pp && nurText(tt) && nurText(pp)) {
          for (const opt of [{}, { sicher: true }]) {
            /* Text der Frage: Fließtext und Blöcke gemischt -> Absätze und Blöcke */
            const stuecke = [];
            let lauf = [];
            const ende = () => { const s = zeilenanfang(lauf.map((c) => inline(c, opt)).join('').trim()); if (s) stuecke.push(s); lauf = []; };
            for (const c of kinder(text)) { if (istBlock(c)) { ende(); stuecke.push(block(c, gr)); } else lauf.push(c); }
            ende();
            if (optionen) stuecke.push(elemente(optionen).map((li) => '- ' + (attrsVon(li)['data-correct'] !== undefined ? '[x] ' : '') + zeilenanfang(inlineKinder(li, opt).trim())).join('\n'));
            if (erkl) stuecke.push(huelle('<Erklaerung>', nurInline(erkl) ? absatz(erkl, opt) : bloecke(kinder(erkl), gr), '</Erklaerung>'));
            yield huelle(`<Frage${attrText(p)}>`, stuecke.join('\n\n'), '</Frage>');
          }
        }
      }
    }
    /* Explorable */
    if (tag === 'div' && a.class === 'k-explorable' && n === 1) {
      const h3 = el[0], lead = el.find((x) => hat(x, 'k-explorable__lead')), ziel = el.find((x) => attrsVon(x)['data-explorable'] !== undefined), ohne = el.find((x) => istEl(x, 'noscript'));
      if (istEl(h3, 'h3') && nurText(h3) && !Object.keys(attrsVon(h3)).length && ziel && !kinder(ziel).length && el.every((x) => [h3, lead, ziel, ohne].includes(x))) {
        const za = attrsVon(ziel);
        const p = { name: za['data-explorable'], titel: textRoh(h3).replace(/\s+/g, ' ').trim() };
        for (const [name, w] of Object.entries(za)) if (name !== 'data-explorable') p[name] = w;
        for (const opt of [{}, { sicher: true }]) {
          const innen = [];
          if (lead) innen.push(absatz(lead, opt));
          if (ohne) innen.push(huelle('<Ohne>', bloecke(kinder(ohne), gr), '</Ohne>'));
          yield huelle(`<Explorable${attrText(p)}>`, innen.join('\n\n'), '</Explorable>');
        }
      }
    }
    /* Python, JSON, Editor: Inhalt in Dateien */
    if (tag === 'script' && a.type === 'text/x-python' && a['data-role'] && n === 2) {
      const name = datei(k, `${a['data-role']}.py`, k.rawText.replace(/\r\n/g, '\n').replace(/^\n/, '').replace(/\s+$/, '') + '\n');
      yield `<Python rolle="${a['data-role']}" datei="${name}" />`;
    }
    if (tag === 'script' && a.type === 'application/json' && nurAttrs(k, ['type', 'data-role'])) {
      const name = datei(k, `${a['data-role'] || 'daten'}.json`, k.rawText.replace(/\r\n/g, '\n').trim() + '\n');
      yield `<Daten datei="${name}"${a['data-role'] ? ` rolle="${a['data-role']}"` : ''} />`;
    }
    if (tag === 'textarea') {
      const text = textRoh(k).replace(/^\n/, '');
      const p = { ...a };
      if (p.class === 'py-editor') delete p.class;
      const name = text ? datei(k, 'vorlage.py', text + '\n') : null;
      yield `<Editor${name ? ` datei="${name}"` : ''}${attrText(p)} />`;
    }
    /* Codeblöcke */
    if (tag === 'pre') {
      const c = ohneLeer(k);
      if (c.length === 1 && istEl(c[0], 'code') && nurText(c[0]) && !Object.keys(attrsVon(c[0])).length && kinder(k).length === 1) { try { yield zaun(k, a, 'python', textRoh(c[0])); } catch (e) { if (!(e instanceof Nicht)) throw e; } }
      else if (nurText(k)) { try { yield zaun(k, a, 'text', textRoh(k).replace(/^\n/, '')); } catch (e) { if (!(e instanceof Nicht)) throw e; } }
    }
    /* Markdown: Absatz, Überschrift, Liste */
    if (!n && nurInline(k) && kinder(k).length) {
      const m = /^h([1-6])$/.exec(tag);
      for (const opt of [{}, { sicher: true }]) {
        try {
          if (tag === 'p') yield absatz(k, opt);
          if (m) yield '#'.repeat(Number(m[1])) + ' ' + inlineKinder(k, opt).trim();
        } catch (e) { if (!(e instanceof Nicht)) throw e; }
      }
    }
    if ((tag === 'ul' || tag === 'ol') && !n && el.length && ohneLeer(k).every((li) => istEl(li, 'li') && !Object.keys(attrsVon(li)).length && nurInline(li) && kinder(li).length)) {
      for (const opt of [{}, { sicher: true }]) {
        try { yield el.map((li, i) => (tag === 'ul' ? '- ' : `${i + 1}. `) + zeilenanfang(inlineKinder(li, opt).trim())).join('\n'); } catch (e) { if (!(e instanceof Nicht)) throw e; }
      }
    }
    /* Stufe 2: Element mit Fließtext auf einer Zeile */
    if (nurInline(k) && tag !== 'script' && tag !== 'style') {
      for (const opt of [{}, { sicher: true }]) {
        try { yield LEER.has(tag) ? `<${tag}${attrText(a)} />` : `<${tag}${attrText(a)}>${inlineKinder(k, opt).trim()}</${tag}>`; } catch (e) { if (!(e instanceof Nicht)) throw e; }
      }
    }
    /* Stufe 2: Element als Hülle um umgezogene Blöcke (kein loser Text zwischen den Blöcken) */
    if (!['script', 'style', 'textarea', 'pre'].includes(tag) && kinder(k).every((c) => istEl(c) || leerraum(c)) && el.length) {
      try { yield huelle(`<${tag}${attrText(a)}>`, bloecke(kinder(k), gr), `</${tag}>`); } catch (e) { if (!(e instanceof Nicht)) throw e; }
    }
    /* Stufe 2: kurzes Element mit gemischtem Inhalt auf einer Zeile */
    if (k.outerHTML.length <= 700 && !['script', 'style', 'textarea'].includes(tag)) {
      try { const s = `<${tag}${attrText(a)}>${inlineKinder(k, { einzeilig: true, sicher: true }).trim()}</${tag}>`; stat.einzeilig++; yield s; } catch (e) { if (!(e instanceof Nicht)) throw e; }
    }
  }

  /* Prüfpunkte: Hier wird das Ergebnis gegen das Original geprüft. Blätter immer, Hüllen nur gründlich. */
  const istBlatt = (k) => nurInline(k) || ['pre', 'script', 'textarea', 'ul', 'ol'].includes(tagVon(k)) || (tagVon(k) === 'div' && ['k-predict', 'k-q', 'k-explorable'].includes(attrsVon(k).class));
  const istPruefpunkt = (k) => tagVon(k) === 'section' || tagVon(k) === 'main' || hat(k, 'k-quiz');

  function block(k, gr) {
    if (istText(k)) return nicht('loser Text zwischen Blöcken');
    const pruefen = gr || istBlatt(k) || istPruefpunkt(k);
    let erster = null;
    try {
      for (const kand of kandidaten(k, gr)) {
        if (!pruefen) return kand;
        if (gleich(k, kand)) return kand;
        if (erster === null) erster = kand;
      }
    } catch (e) { if (!(e instanceof Nicht)) throw e; }
    /* Ein Prüfpunkt ist gescheitert: noch einmal gründlich, damit nur der fehlerhafte Teil roh bleibt */
    if (!gr && istPruefpunkt(k)) {
      try { for (const kand of kandidaten(k, true)) if (gleich(k, kand)) return kand; } catch (e) { if (!(e instanceof Nicht)) throw e; }
    }
    return unveraendert(k);
  }

  let rumpf;
  try { rumpf = bloecke(kinder(wurzel), false); } catch (e) { if (!(e instanceof Nicht)) throw e; rumpf = null; }
  let abweichung = rumpf === null ? { alt: 'loser Text auf oberster Ebene' } : unterschied(q.inhaltOriginal, mdxZuHtml(rumpf, { ordner: zielOrdner, datei: relPfad }));
  if (abweichung) {
    /* gründlich: jede Hülle einzeln prüfen */
    stat.roh = 0; stat.rohBloecke = [];
    rumpf = kinder(wurzel).filter((c) => !leerraum(c)).map((c) => block(c, true)).join('\n\n');
    abweichung = unterschied(q.inhaltOriginal, mdxZuHtml(rumpf, { ordner: zielOrdner, datei: relPfad }));
  }

  /* Kopf */
  const skripte = q.skripte.map((s) => {
    if (s.src && !s.defer && unterschied(s.roh, `<script src="${s.src}"></script>`) === null) return s.src;
    if (s.src && s.defer && unterschied(s.roh, `<script src="${s.src}" defer></script>`) === null) return { src: s.src, defer: true };
    return { roh: s.roh };
  });
  const kopf = {
    titel: q.titel,
    beschreibung: q.beschreibung,
    body: Object.fromEntries(q.bodyAttribute.map((x) => [x.name, x.wert === null ? true : x.wert])),
    stile: q.stylesheets,
    ...(q.kopfStile.length ? { kopfStile: q.kopfStile } : {}),
    skripte,
  };
  const text = '---\n' + YAML.stringify(kopf, { lineWidth: 0 }) + '---\n\n' + rumpf + '\n';
  const ziel = path.join(zielOrdner, `${zu.art}.mdx`);
  fs.writeFileSync(ziel, text);
  if (!fs.readdirSync(path.join(zielOrdner, unterordner)).length) fs.rmdirSync(path.join(zielOrdner, unterordner));

  const anteil = Math.round((stat.roh / stat.zeichen) * 100);
  if (!leise) {
    console.log(`${relPfad} -> ${path.relative(APP, ziel)}: ${abweichung ? 'ABWEICHUNG' : 'gleich'}, ${stat.dateien} Code-Dateien, ${anteil} % noch unverändertes HTML (${stat.rohBloecke.length} Blöcke)`);
    if (abweichung) console.log('  erste Abweichung:', JSON.stringify(abweichung));
    for (const b of stat.rohBloecke.slice(0, 40)) console.log('  roh: ' + b);
  }
  return { relPfad, ziel, gleich: !abweichung, anteil, roh: stat.rohBloecke, dateien: stat.dateien };
}

/* ── Aufruf ───────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
if (args.includes('--alle')) {
  const seiten = ladeKurs().lektionen.flatMap((t) => [t.lerneinheit, t.labor]).filter(Boolean).map((d) => 'lektionen/' + d).filter((r) => fs.existsSync(path.join(SITE, r)));
  let ok = 0;
  const haeufig = new Map();
  for (const r of seiten) {
    const e = umziehen(r, { schreiben, leise: true });
    if (e.gleich) ok++;
    for (const b of e.roh) { const art = b.replace(/ \(\d+\)$/, ''); haeufig.set(art, (haeufig.get(art) || 0) + 1); }
    console.log(`${e.gleich ? 'gleich    ' : 'ABWEICHUNG'} ${String(e.anteil).padStart(3)} % roh  ${String(e.dateien).padStart(3)} Dateien  ${r}`);
  }
  console.log(`\n${ok} von ${seiten.length} Seiten gleich. Häufigste unveränderte Blöcke:`);
  for (const [art, z] of [...haeufig.entries()].sort((x, y) => y[1] - x[1]).slice(0, 25)) console.log(`  ${String(z).padStart(4)}  ${art}`);
  process.exit(ok === seiten.length ? 0 : 1);
} else {
  const seiten = args.filter((x) => !x.startsWith('--'));
  if (!seiten.length) { console.error('Aufruf: node skripte/html-nach-mdx.mjs lektionen/<datei>.html [--schreiben] | --alle'); process.exit(2); }
  let fehler = 0;
  for (const r of seiten) if (!umziehen(r, { schreiben }).gleich) fehler++;
  process.exit(fehler ? 1 : 0);
}
