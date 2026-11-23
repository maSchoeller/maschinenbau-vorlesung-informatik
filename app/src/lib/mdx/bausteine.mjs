/* =============================================================
   bausteine.mjs – die Bausteine der MDX-Lektionen. Jeder erzeugt genau das HTML, das kurs.js,
   labor.js, aufgaben.js und das CSS des Bestands erwarten. Übersicht mit Beispielen:
   docs/app/INHALTE.md.

   Markdown:
     `code`                         <code class="k-i">  (schlichtes <code> schreibt man als HTML)
     ```python data-timeout="5000"  <pre data-timeout="5000"><code>…</code></pre>  (ausführbar)
     ```text class="a-gap__src"     <pre class="a-gap__src">…</pre>               (ohne <code>)
   Bausteine:
     <Begriff e="Erklärung">Wort</Begriff>       Begriffs-Hinweis
     <Icon n="head" />                            Symbol aus dem Sprite
     <Hinweis art="merke|achtung|warum">          die drei Hinweis-Typen
     <Abschnitt id nr titel [zusatz] [kopf]>      Abschnitt einer Lerneinheit
     <Station id titel teil [sterne] [min] [extra]>  Station im Labor
     <Vorhersage>  Frage, Liste der Antworten ([x] = richtig), Auflösung
     <Quiz id> mit <Frage id typ punkte titel [antwort] [tol]> … <Erklaerung>
     <Explorable name titel> Einleitung … <Ohne>Text ohne JavaScript</Ohne>
     <Python rolle="tests|solution|…" datei="x.py" />   Python aus einer Datei neben der MDX-Datei
     <Editor datei="x.py" … />                    Editor mit Startcode aus einer Datei
     <Daten datei="x.json" [rolle] />             JSON-Angaben einer Aufgabe
     <Html>{`…`}</Html>                           unverändertes HTML (noch nicht umgezogen)
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../pfade.mjs';
import { h, roh, istElement, hatKlasse, ohneLeerraum, textVon } from './knoten.mjs';

/* Dieselbe Zeichenroutine wie im Browser (reines JS ohne DOM), damit Pläne im Text und in Aufgaben gleich aussehen */
let pap = null;
function papEngine() {
  if (!pap) pap = createRequire(path.join(SITE, 'assets', 'js', 'x.js'))('./pap-engine.js');
  return pap;
}

const HINWEIS_TITEL = { merke: 'Merke', achtung: 'Achtung', warum: 'Warum muss ich das wissen?' };

/* Angaben eines Codeblocks: key="wert" key='wert' key=wert key */
export function angaben(text) {
  const a = {};
  const re = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m;
  while ((m = re.exec(text || ''))) a[m[1]] = m[2] ?? m[3] ?? m[4] ?? true;
  return a;
}

/* Einen einzelnen Absatz auspacken: [<p>a</p>] -> [a]; sonst unverändert */
function ausgepackt(kinder) {
  const k = ohneLeerraum(kinder);
  return k.length === 1 && istElement(k[0], 'p') && !Object.keys(k[0].attrs).length ? k[0].kinder : k;
}
/* Absätze auflösen (für Stellen, an denen der Bestand Text und Blöcke direkt mischt) */
function ohneAbsaetze(kinder) {
  return ohneLeerraum(kinder).flatMap((k) => (istElement(k, 'p') && !Object.keys(k.attrs).length ? k.kinder : [k]));
}
/* Listenpunkt mit „[x] “ am Anfang ist richtig; liefert {richtig, kinder} */
function auswahl(li) {
  const kinder = [...li.kinder];
  let richtig = false;
  if (typeof kinder[0] === 'string' && /^\s*\[x\]\s+/i.test(kinder[0])) { richtig = true; kinder[0] = kinder[0].replace(/^\s*\[x\]\s+/i, ''); }
  else if (typeof kinder[0] === 'string') kinder[0] = kinder[0].replace(/^\s+/, '');
  return { richtig, kinder };
}
const TEIL = (name) => ({ kinder }) => ({ tag: 'x-' + name, attrs: {}, kinder });
const istTeil = (k, name) => istElement(k, 'x-' + name);

export function bausteine({ ordner = null, datei = 'MDX' } = {}) {
  function lies(name) {
    if (!ordner) throw new Error(`Baustein mit datei="${name}" braucht den Ordner der MDX-Datei`);
    if (!/^[A-Za-z0-9._/-]+$/.test(String(name)) || String(name).includes('..')) throw new Error(`ungültiger Dateiname "${name}"`);
    const p = path.join(ordner, name);
    if (!fs.existsSync(p)) throw new Error(`Datei "${name}" fehlt neben ${path.basename(datei)}`);
    return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  }
  const ohneEndzeile = (s) => s.replace(/\n$/, '');

  return {
    /* Codeblock: ```python … (mit <code>) oder ```text … (nur <pre>) */
    pre({ kinder, ...rest }) {
      const code = ohneLeerraum(kinder)[0];
      if (!istElement(code, 'code')) return h('pre', rest, kinder);
      const sprache = /(?:^|\s)language-(\S+)/.exec(code.attrs.class || '');
      const attrs = angaben(code.attrs['data-meta']);
      /* vorbelegte Eingaben: mehrere Zeilen schreibt man in den Angaben als \n (data-stdin="40\n10") */
      if (typeof attrs['data-stdin'] === 'string') attrs['data-stdin'] = attrs['data-stdin'].replace(/\\n/g, '\n');
      const text = ohneEndzeile(textVon(code));
      return sprache && sprache[1] === 'text' ? h('pre', attrs, text) : h('pre', attrs, h('code', null, text));
    },
    /* `code` im Fließtext; der Code eines Codeblocks kommt hier zuerst vorbei und bleibt unverändert */
    code({ kinder, ...rest }) {
      const imBlock = rest.class || rest['data-meta'] || /\n$/.test(textVon(kinder));
      return h('code', imBlock ? rest : { class: 'k-i' }, kinder);
    },

    Begriff: ({ e, kinder }) => h('abbr', { class: 'k-begriff', 'data-erklaerung': e }, kinder),
    Icon: ({ n }) => h('svg', { class: 'k-ic', 'aria-hidden': 'true', focusable: 'false' }, h('use', { href: `../assets/img/icons.svg#i-${n}` })),

    Hinweis({ art, titel, kinder }) {
      if (!HINWEIS_TITEL[art] && !titel) throw new Error(`<Hinweis art="${art}">: unbekannte Art (merke, achtung, warum) und kein titel`);
      return h('div', { class: `hinweis hinweis--${art}` }, h('strong', { class: 'hinweis__title' }, titel || HINWEIS_TITEL[art]), ohneLeerraum(kinder));
    },

    Abschnitt({ id, nr, titel, zusatz, kopf, kinder }) {
      const hid = kopf || 'h-' + id;
      return h('section', { class: 'k-section', id, 'data-section': id, 'aria-labelledby': hid },
        h('h2', { class: 'k-section__title', id: hid }, h('span', { class: 'k-section__num', 'aria-hidden': 'true' }, String(nr)), ' ' + titel,
          zusatz ? [' ', h('span', { class: 'k-muted' }, zusatz)] : null),
        ohneLeerraum(kinder));
    },

    /* Programmablaufplan als Bild, beim Build gezeichnet (site/assets/js/pap-engine.js). Der Ablauf steht
       als ```text darin, eine Zeile je Symbol: „Eingabe: …“ und „Ausgabe: …“ werden Parallelogramme,
       alles andere ein Rechteck; Start und Ende kommen von selbst. Die Seite braucht v05.css. */
    Plan({ titel, kinder }) {
      const block = ohneLeerraum(kinder).find((x) => istElement(x, 'pre'));
      if (!block || !titel) throw new Error('<Plan titel="…">: erwartet den Ablauf als ```text, eine Zeile je Symbol');
      const K = papEngine();
      const zeilen = textVon(block).split('\n').map((z) => z.trim()).filter(Boolean);
      const spec = [K.P.start('n0'), ...zeilen.map((z, i) => (/^(Eingabe|Ausgabe)\b/.test(z) ? K.P.io(z, 'n' + (i + 1), { wrapAt: 40 }) : K.P.op(z, 'n' + (i + 1), { wrapAt: 40 }))), K.P.end('n' + (zeilen.length + 1))];
      return roh(K.figure(spec, { label: 'Programmablaufplan: ' + titel, minw: 0.85 }));
    },

    /* ── Seitenrahmen ─────────────────────────────────────────── */
    /* Lerneinheit: Inhaltsverzeichnis aus den Abschnitten, Fortschritt, Weg ins Labor, <main> */
    Lerneinheit({ nr, name, labor, kinder }) {
      const k = ohneLeerraum(kinder);
      const abschnitte = k.filter((x) => hatKlasse(x, 'k-section') && x.attrs['data-section']);
      if (!abschnitte.length) throw new Error('<Lerneinheit>: kein <Abschnitt> gefunden');
      const eintrag = (s) => {
        const h2 = s.kinder.find((x) => istElement(x, 'h2'));
        return h('li', null, h('a', { href: '#' + s.attrs.id }, h('span', { class: 'k-toc__n' }, textVon(h2.kinder[0])), String(h2.kinder[1]).trim()));
      };
      return h('div', { class: 'l-page' },
        h('nav', { class: 'k-toc', 'aria-label': 'Inhalt dieser Lerneinheit' },
          h('p', { class: 'k-toc__title' }, 'Lerneinheit ' + name),
          h('ol', { class: 'k-toc__list' }, abschnitte.map(eintrag)),
          h('div', { class: 'k-progress', 'data-progress-for': nr },
            h('span', { class: 'k-progress__bar' }, h('span', { class: 'k-progress__fill' })),
            h('span', { class: 'k-progress__text' }, `0 von ${abschnitte.length} Abschnitten`)),
          labor ? h('a', { class: 'k-toc__lab', href: labor }, 'Weiter ins Programmierlabor →') : null),
        h('main', { id: 'inhalt', class: 'l-content' }, k));
    },
    /* Seitenkopf: erster Absatz = Vorspann, Liste = Lernziele, weitere Absätze = kleiner Hinweis */
    Kopf({ marke, titel, kinder }) {
      const k = ohneLeerraum(kinder);
      const liste = k.find((x) => istElement(x, 'ul'));
      const absaetze = k.filter((x) => istElement(x, 'p'));
      return h('header', { class: 'k-title' },
        h('p', { class: 'k-title__label' }, marke),
        h('h1', { id: 'h-titel' }, titel),
        absaetze[0] ? h('p', { class: 'k-title__lead' }, absaetze[0].kinder) : null,
        liste ? [h('p', { class: 'k-title__goals' }, 'Nach dieser Lerneinheit kannst du:'), h('ul', { class: 'k-title__list' }, liste.kinder)] : null,
        absaetze.slice(1).map((p) => h('p', { class: 'k-small k-muted' }, p.kinder)));
    },
    Weiter: ({ ziel, knopf = 'Weiter ins Programmierlabor →', kinder }) => h('section', { class: 'k-next', 'aria-labelledby': 'h-next' },
      h('h2', { id: 'h-next' }, 'Wie geht es weiter?'), ohneLeerraum(kinder), h('p', null, h('a', { class: 'k-btn', href: ziel }, knopf))),
    Dozent: ({ titel, kinder }) => h('section', { class: 'k-section k-section--dozent', 'aria-labelledby': 'h-doz' },
      h('h2', { id: 'h-doz', class: 'k-sr' }, 'Für Dozierende'),
      h('details', { class: 'k-dozent' }, h('summary', null, titel), h('div', { class: 'k-dozent__body' }, ohneLeerraum(kinder)))),
    /* Erklärvideo mit Untertiteln und dem Ersatztext „Video folgt“ */
    Video({ name, id, titel, fehlt = 'Video folgt.', kinder }) {
      return h('figure', { class: 'k-video', id },
        h('video', { controls: true, preload: 'metadata', poster: `../assets/video/${name}-poster.png`, 'aria-label': titel },
          h('source', { src: `../assets/video/${name}.mp4`, type: 'video/mp4' }),
          h('track', { kind: 'subtitles', srclang: 'de', label: 'Deutsch', src: `../assets/video/${name}.vtt`, default: true }),
          'Dein Browser kann dieses Video nicht abspielen.'),
        h('div', { class: 'k-video__missing', hidden: true }, fehlt),
        h('figcaption', null, kinder.length ? ausgepackt(kinder) : titel));
    },

    /* Labor: Aufgabenliste, Kopfzeile mit Auswahl und Werkzeugkasten-Knopf, Stationen, Blättern */
    Labor({ nr, name, lerneinheit, kinder }) {
      const k = ohneLeerraum(kinder);
      const stationen = k.filter((x) => hatKlasse(x, 'l-task'));
      if (stationen.length < 2) throw new Error('<Labor>: mindestens zwei <Station> erwartet');
      if (!stationen[0].kinder.some((x) => hatKlasse(x, 'lab__toolbox'))) throw new Error('<Labor>: die erste <Station> muss den <Werkzeugkasten> enthalten');
      const zeichen = (n, text) => h('span', null, h('svg', { class: 'k-ic', 'aria-hidden': 'true', focusable: 'false' }, h('use', { href: `../assets/img/icons.svg#i-${n}` })), ' ' + text);
      return h('div', { class: 'lab', 'data-lab': true },
        h('nav', { class: 'lab__list', 'aria-label': 'Aufgabenliste' },
          h('div', { class: 'lab__listhead' }, h('p', { class: 'lab__title' }, 'Programmierlabor ' + name), h('a', { class: 'lab__back', href: lerneinheit }, '← Lerneinheit')),
          h('div', { class: 'a-progress', 'data-a-progress': true },
            h('span', { class: 'a-progress__bar' }, h('span', { class: 'a-progress__fill' })),
            h('span', { class: 'a-progress__text' }, '0 Aufgaben gelöst')),
          h('p', { class: 'lab__legend k-small k-muted' }, zeichen('circle', 'offen'), zeichen('half', 'begonnen'), zeichen('done', 'gelöst')),
          h('div', { 'data-lab-items': true })),
        h('main', { id: 'inhalt', class: 'lab__main', tabindex: '-1' },
          h('div', { class: 'lab__bar' },
            h('div', { class: 'lab__select' }, h('label', { for: 'lab-select' }, 'Aufgabe'), h('select', { id: 'lab-select' })),
            h('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', id: 'lab-toolbox-btn', 'aria-expanded': 'false', 'aria-controls': 'lab-drawer' }, 'Werkzeugkasten')),
          h('section', { class: 'lab__drawer', id: 'lab-drawer', 'aria-label': 'Werkzeugkasten', hidden: true }),
          k,
          h('nav', { class: 'lab__pager', 'aria-label': 'Zwischen Aufgaben wechseln' },
            h('a', { class: 'k-btn k-btn--ghost', id: 'lab-prev', href: '#' + stationen[0].attrs.id }, '← Zurück'),
            h('a', { class: 'k-btn k-btn--ghost', id: 'lab-next', href: '#' + stationen[1].attrs.id }, 'Weiter →'))),
        h('div', { class: 'lab__dock', 'data-library-dock': true, 'data-state': 'off' }));
    },
    Werkzeugkasten: ({ kinder }) => h('div', { class: 'lab__toolbox', id: 'lab-toolbox' }, h('div', { class: 'a-syntax-list' }, ohneLeerraum(kinder))),
    Syntaxkarte: ({ id, nr, titel, kinder }) => h('article', { class: 'a-syntax', 'aria-labelledby': id },
      h('span', { class: 'a-syntax__label' }, 'Syntax-Karte ' + nr), h('h4', { id }, titel), ohneLeerraum(kinder)),

    /* Aufgabe im Labor: art = trace | parsons | gap | code | run | klausur | pap-zeichnen; weitere Attribute wie geschrieben */
    Aufgabe({ art, id, titel, kinder, ...rest }) {
      const k = ohneLeerraum(kinder).map((x) => (istElement(x, 'textarea') ? h('div', { class: 'a-editor' }, x) : x));
      return h('div', { class: art === 'pap-zeichnen' ? 'a-task k-pap-aufgabe' : 'a-task', 'data-a': art, 'data-id': id, ...rest },
        titel ? h('div', { class: 'a-task__head' }, h('h3', { class: 'a-task__title' }, titel)) : null, k);
    },
    /* Liste mit Klasse: <Tipps> für gestufte Hinweise, <Schritte> für die Erklärung eines vorgerechneten Beispiels */
    Tipps({ kinder }) { const l = ohneLeerraum(kinder)[0]; if (!istElement(l, 'ol')) throw new Error('<Tipps>: erwartet eine nummerierte Liste'); return h('ol', { class: 'a-hints' }, l.kinder); },
    Schritte({ kinder }) { const l = ohneLeerraum(kinder)[0]; if (!istElement(l, 'ol')) throw new Error('<Schritte>: erwartet eine nummerierte Liste'); return h('ol', { class: 'a-explain' }, l.kinder); },
    /* Fehler finden: Beschreibung, Programm als ```text, danach die Auflösung. fehler="3 5" nennt die falschen Zeilen. */
    Fehlersuche({ titel, fehler, kinder }) {
      const k = ohneLeerraum(kinder);
      const i = k.findIndex((x) => istElement(x, 'pre'));
      const falsch = String(fehler || '').split(/[\s,]+/).filter(Boolean).map(Number);
      if (i < 0 || !falsch.length) throw new Error('<Fehlersuche>: erwartet das Programm als ```text und fehler="Zeilennummern"');
      const zeilen = textVon(k[i]).split('\n');
      if (falsch.some((n) => !(n >= 1 && n <= zeilen.length))) throw new Error('<Fehlersuche>: fehler nennt eine Zeile, die es nicht gibt');
      return h('div', { class: 'k-mirror' },
        h('h3', null, titel), k.slice(0, i),
        h('ol', { class: 'k-codelines', 'aria-label': 'Programm, Zeilen anklickbar' },
          zeilen.map((z, n) => h('li', null, h('button', { type: 'button', class: 'k-line', 'data-bug': falsch.includes(n + 1) ? 'z' + (n + 1) : null }, z === '' ? ' ' : z)))),
        h('div', { class: 'k-mirror__task' },
          h('p', null, h('strong', null, falsch.length === 1 ? 'Welche Zeile ist falsch?' : `Welche ${falsch.length} Zeilen sind falsch?`), ' Klick sie an und löse dann auf.'),
          h('button', { type: 'button', class: 'k-btn', 'data-mirror-check': true }, 'Auflösen'),
          h('p', { class: 'k-verdict', role: 'status', hidden: true }),
          h('div', { 'data-mirror-after': true, hidden: true }, k.slice(i + 1))));
    },

    Station({ id, titel, teil, sterne = '', min = '', extra = '', kinder, ...rest }) {
      return h('section', { class: 'l-task', id, 'data-title': titel, 'data-part': teil, 'data-stars': sterne, 'data-min': min, 'data-extra': extra, 'aria-labelledby': 'h-' + id, hidden: true, ...rest },
        h('header', { class: 'l-task__head' },
          h('p', { class: 'l-task__kicker' }),
          h('h2', { class: 'l-task__title', id: 'h-' + id, tabindex: '-1' }, titel),
          h('p', { class: 'l-task__meta' })),
        ohneLeerraum(kinder));
    },

    /* Frage, Liste der Antworten ([x] = richtig), danach die Auflösung */
    Vorhersage({ kinder }) {
      const k = ohneLeerraum(kinder);
      const liste = k.findIndex((x) => istElement(x, 'ul'));
      if (liste !== 1 || !istElement(k[0], 'p')) throw new Error('<Vorhersage>: erwartet einen Absatz (Frage), dann eine Liste der Antworten, dann die Auflösung');
      const knoepfe = ohneLeerraum(k[liste].kinder).map((li) => { const a = auswahl(li); return h('button', { type: 'button', 'data-correct': a.richtig }, a.kinder); });
      if (!knoepfe.some((b) => b.attrs['data-correct'])) throw new Error('<Vorhersage>: keine Antwort ist mit [x] als richtig markiert');
      return h('div', { class: 'k-predict' },
        h('p', { class: 'k-predict__q' }, k[0].kinder),
        h('div', { class: 'k-predict__opts' }, knoepfe),
        h('div', { class: 'k-predict__result' }),
        h('div', { class: 'k-predict__expl', hidden: true }, ausgepackt(k.slice(liste + 1))));
    },

    Quiz: ({ id, kinder }) => h('div', { class: 'k-quiz', 'data-quiz': id }, ohneLeerraum(kinder), h('div', { class: 'k-score', 'data-score': true, 'aria-live': 'polite' })),
    Erklaerung: TEIL('erklaerung'),
    Frage({ id, typ, punkte, titel, antwort, tol, kinder, ...rest }) {
      const k = ohneLeerraum(kinder);
      const erkl = k.find((x) => istTeil(x, 'erklaerung'));
      const optionen = k.find((x) => istElement(x, 'ul'));
      const text = k.filter((x) => x !== erkl && x !== optionen);
      const p = Number(punkte);
      return h('div', { class: 'k-q', 'data-type': typ, 'data-points': String(punkte), 'data-id': id, 'data-answer': antwort, 'data-tol': tol, ...rest },
        h('div', { class: 'k-q__head' }, h('span', { class: 'k-q__title' }, titel), h('span', { class: 'k-q__pts' }, p === 1 ? '1 Punkt' : `${punkte} Punkte`)),
        h('div', { class: 'k-q__text' }, ohneAbsaetze(text)),
        optionen ? h('ul', { class: 'k-q__options' }, ohneLeerraum(optionen.kinder).map((li) => { const a = auswahl(li); return h('li', { 'data-correct': a.richtig }, a.kinder); })) : null,
        erkl ? h('div', { class: 'k-q__expl' }, ausgepackt(erkl.kinder)) : null);
    },

    Ohne: TEIL('ohne'),
    Explorable({ name, titel, kinder, ...rest }) {
      const k = ohneLeerraum(kinder);
      const ohne = k.find((x) => istTeil(x, 'ohne'));
      const einleitung = k.filter((x) => x !== ohne);
      if (einleitung.length > 1 || (einleitung[0] && !istElement(einleitung[0], 'p'))) throw new Error('<Explorable>: erwartet höchstens einen Absatz als Einleitung und <Ohne>');
      return h('div', { class: 'k-explorable' },
        h('h3', null, titel),
        einleitung[0] ? h('p', { class: 'k-explorable__lead' }, einleitung[0].kinder) : null,
        h('div', { 'data-explorable': name, ...rest }),
        ohne ? h('noscript', null, ohneLeerraum(ohne.kinder)) : null);
    },

    Python: ({ rolle, datei: name }) => h('script', { type: 'text/x-python', 'data-role': rolle }, '\n' + lies(name).replace(/\s+$/, '') + '\n'),
    Editor: ({ datei: name, kinder, ...rest }) => h('textarea', { class: 'py-editor', ...rest }, name ? ohneEndzeile(lies(name)) : null),
    Daten: ({ datei: name, rolle }) => h('script', { type: 'application/json', 'data-role': rolle }, lies(name).trim()),

    Html({ kinder }) {
      if (kinder.length !== 1 || typeof kinder[0] !== 'string') throw new Error('<Html>: erwartet genau einen Text in {`…`}');
      return roh(kinder[0]);
    },
  };
}

export { hatKlasse };
