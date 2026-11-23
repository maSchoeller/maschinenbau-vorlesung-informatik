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
import { h, roh, istElement, hatKlasse, ohneLeerraum, textVon } from './knoten.mjs';

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

    Station({ id, titel, teil, sterne = '', min = '', extra = '', kinder }) {
      return h('section', { class: 'l-task', id, 'data-title': titel, 'data-part': teil, 'data-stars': sterne, 'data-min': min, 'data-extra': extra, 'aria-labelledby': 'h-' + id, hidden: true },
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
