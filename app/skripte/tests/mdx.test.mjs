/* Selbsttest MDX-Inhalte (npm run selbsttest): Bausteine erzeugen das HTML des Bestands,
   und der Vergleich ist streng genug, um echte Abweichungen zu melden. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mdxZuHtml, trenne } from '../../src/lib/mdx/kompilieren.mjs';
import { unterschied } from '../../src/lib/mdx/vergleich.mjs';

const gleich = (alt, mdx, opt) => assert.equal(unterschied(alt, mdxZuHtml(mdx, opt)), null);

test('Markdown: Absatz, Betonung, Code im Fließtext, Liste, Überschrift', () => {
  gleich('<p>Die Frage ist: <em>wo</em>? <strong>Kopf</strong>: <code class="k-i">def</code> und a * b</p><h3>Szene 1</h3><ul><li>Erster <code class="k-i">a</code></li><li>Zweiter</li></ul>',
    'Die Frage ist: *wo*? **Kopf**: `def` und a \\* b\n\n### Szene 1\n\n- Erster `a`\n- Zweiter\n');
});

test('Codeblock: python mit <code>, text ohne, Attribute aus den Angaben, Text zeichengenau', () => {
  gleich('<pre data-timeout="5000"><code>if tau &lt;= 40:\n    print("ok")</code></pre><pre data-run="no">Ergebnis: ok</pre><pre class="k-code" data-run="nach-antwort"><code>x = 1</code></pre>',
    '```python data-timeout="5000"\nif tau <= 40:\n    print("ok")\n```\n\n```text data-run="no"\nErgebnis: ok\n```\n\n```python class="k-code" data-run="nach-antwort"\nx = 1\n```\n');
});

test('Begriff, Icon, Hinweis, schlichtes code', () => {
  gleich('<p>Eine <abbr class="k-begriff" data-erklaerung="Eine „Funktion“ &amp; mehr">Funktion</abbr> <svg class="k-ic" aria-hidden="true" focusable="false"><use href="../assets/img/icons.svg#i-head"/></svg> <code>x &lt; 3</code></p>'
    + '<div class="hinweis hinweis--merke"><strong class="hinweis__title">Merke</strong><p>Drei Regeln.</p></div>'
    + '<div class="hinweis hinweis--achtung"><strong class="hinweis__title">Vorsicht</strong><p>Text.</p></div>',
  'Eine <Begriff e="Eine „Funktion“ & mehr">Funktion</Begriff> <Icon n="head" /> <code>{"x < 3"}</code>\n\n<Hinweis art="merke">\n\nDrei Regeln.\n\n</Hinweis>\n\n<Hinweis art="achtung" titel="Vorsicht">\n\nText.\n\n</Hinweis>\n');
});

test('Abschnitt und Station', () => {
  gleich('<section class="k-section" id="deepdive" data-section="deepdive" aria-labelledby="h-dd"><h2 class="k-section__title" id="h-dd"><span class="k-section__num" aria-hidden="true">5</span> Deep Dive <span class="k-muted">(freiwillig)</span></h2><p>Text.</p></section>',
    '<Abschnitt id="deepdive" nr="5" titel="Deep Dive" zusatz="(freiwillig)" kopf="h-dd">\n\nText.\n\n</Abschnitt>\n');
  gleich('<section class="l-task" id="t-3" data-title="Toleranz" data-part="B" data-stars="2" data-min="8" data-extra="" aria-labelledby="h-t-3" hidden><header class="l-task__head"><p class="l-task__kicker"></p><h2 class="l-task__title" id="h-t-3" tabindex="-1">Toleranz</h2><p class="l-task__meta"></p></header><p>Text.</p></section>',
    '<Station id="t-3" titel="Toleranz" teil="B" sterne="2" min="8">\n\nText.\n\n</Station>\n');
});

test('Vorhersage: Frage, Antworten mit [x], Auflösung', () => {
  gleich('<div class="k-predict"><p class="k-predict__q">Welchen Wert hat <code class="k-i">y</code>?</p><div class="k-predict__opts"><button type="button">10</button><button type="button" data-correct>None</button></div><div class="k-predict__result"></div><div class="k-predict__expl" hidden><code>None</code>. Kein return.</div></div>',
    '<Vorhersage>\n\nWelchen Wert hat `y`?\n\n- 10\n- [x] None\n\n<code>None</code>. Kein return.\n\n</Vorhersage>\n');
  assert.throws(() => mdxZuHtml('<Vorhersage>\n\nFrage?\n\n- a\n- b\n\nText.\n\n</Vorhersage>\n'), /keine Antwort ist mit \[x\]/);
});

test('Quiz und Frage: Text mit Codeblock, Auswahl, Erklärung, Punktzahl', () => {
  gleich('<div class="k-quiz" data-quiz="v07"><div class="k-q" data-type="mc" data-points="1" data-id="t1"><div class="k-q__head"><span class="k-q__title">T1 · Titel</span><span class="k-q__pts">1 Punkt</span></div>'
    + '<div class="k-q__text">Was gibt es aus?<pre class="k-code"><code>print(1)</code></pre>Freigeben?</div><ul class="k-q__options"><li>Ja</li><li data-correct>Nein, <code>x</code> fehlt</li></ul><div class="k-q__expl">Weil <code>x</code> fehlt.</div></div>'
    + '<div class="k-q" data-type="num" data-points="3" data-id="t2" data-answer="63.7" data-tol="0.1"><div class="k-q__head"><span class="k-q__title">T2</span><span class="k-q__pts">3 Punkte</span></div><div class="k-q__text">Wie viel?</div></div>'
    + '<div class="k-score" data-score aria-live="polite"></div></div>',
  '<Quiz id="v07">\n\n<Frage id="t1" typ="mc" punkte="1" titel="T1 · Titel">\n\nWas gibt es aus?\n\n```python class="k-code"\nprint(1)\n```\n\nFreigeben?\n\n- Ja\n- [x] Nein, <code>x</code> fehlt\n\n<Erklaerung>\n\nWeil <code>x</code> fehlt.\n\n</Erklaerung>\n\n</Frage>\n\n<Frage id="t2" typ="num" punkte="3" antwort="63.7" tol="0.1" titel="T2">\n\nWie viel?\n\n</Frage>\n\n</Quiz>\n');
});

test('Explorable mit Einleitung und Text ohne JavaScript', () => {
  gleich('<div class="k-explorable"><h3>Titel</h3><p class="k-explorable__lead">Einleitung.</p><div data-explorable="pap" data-pap="haupt"></div><noscript><p>Ohne JavaScript.</p></noscript></div>',
    '<Explorable name="pap" titel="Titel" data-pap="haupt">\n\nEinleitung.\n\n<Ohne>\n\nOhne JavaScript.\n\n</Ohne>\n\n</Explorable>\n');
});

test('Python, Editor und Daten lesen Dateien neben der MDX-Datei', () => {
  const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'mdx-test-'));
  try {
    fs.mkdirSync(path.join(ordner, 'labor'));
    fs.writeFileSync(path.join(ordner, 'labor/t-1.tests.py'), 'def test_a():\n    assert f(2) == 4\n');
    fs.writeFileSync(path.join(ordner, 'labor/t-1.vorlage.py'), '# dein Code\nx = "<a>"\n');
    fs.writeFileSync(path.join(ordner, 'labor/t-1.daten.json'), '{"code": ["a = 1"]}\n');
    gleich('<script type="text/x-python" data-role="tests">\ndef test_a():\n    assert f(2) == 4\n        </script><textarea class="py-editor" data-lesson="V07"># dein Code\nx = "&lt;a&gt;"</textarea> <textarea class="py-editor"></textarea> <script type="application/json">{"code":["a = 1"]}</script>',
      '<Python rolle="tests" datei="labor/t-1.tests.py" />\n\n<Editor datei="labor/t-1.vorlage.py" data-lesson="V07" />\n\n<Editor />\n\n<Daten datei="labor/t-1.daten.json" />\n', { ordner });
    assert.throws(() => mdxZuHtml('<Python rolle="tests" datei="labor/fehlt.py" />\n', { ordner, datei: 'labor.mdx' }), /Datei "labor\/fehlt\.py" fehlt/);
    assert.throws(() => mdxZuHtml('<Python rolle="tests" datei="../geheim.py" />\n', { ordner }), /ungültiger Dateiname/);
  } finally { fs.rmSync(ordner, { recursive: true, force: true }); }
});

test('Html gibt unverändert aus; unbekannter Baustein und fehlender Kopf brechen ab', () => {
  gleich('<div class="x">roh &amp; <b>fett</b></div>', '<Html>{`<div class="x">roh &amp; <b>fett</b></div>`}</Html>\n');
  assert.throws(() => mdxZuHtml('<Vorhersge>\n\nx\n\n</Vorhersge>\n', { datei: 'test.mdx' }), /test\.mdx/);
  assert.throws(() => trenne('ohne Kopf\n', 'test.mdx'), /Kopf/);
});

test('Vergleich meldet echte Abweichungen und übersieht Unwichtiges', () => {
  const u = unterschied;
  assert.equal(u('<p class="a  b" id="x">Text  hier</p>\n<p>zwei</p>', '<p id="x" class="a b">Text hier</p><p>zwei</p>'), null, 'Attributreihenfolge, Leerraum an Blockgrenzen');
  assert.equal(u('<div hidden>x</div>', '<div hidden="">x</div>'), null, 'Attribut ohne Wert');
  assert.equal(u('<p>a<!-- Kommentar -->b</p>', '<p>ab</p>'), null, 'Kommentare');
  assert.notEqual(u('<p>a <b>b</b></p>', '<p>a<b>b</b></p>'), null, 'Leerzeichen im Fließtext zählt');
  assert.notEqual(u('<p>eins</p>', '<p>zwei</p>'), null, 'Text');
  assert.notEqual(u('<p class="a">x</p>', '<p class="b">x</p>'), null, 'Attributwert');
  assert.notEqual(u('<p>x</p>', '<div>x</div>'), null, 'Element');
  assert.notEqual(u('<pre>a\n  b</pre>', '<pre>a\n b</pre>'), null, 'Leerraum in pre zeichengenau');
  assert.notEqual(u('<textarea>a\n</textarea>', '<textarea>a</textarea>'), null, 'Editor-Inhalt zeichengenau');
  assert.equal(u('<script type="text/x-python">\nx = 1\n    </script>', '<script type="text/x-python">\nx = 1\n</script>'), null, 'Python wie aufgaben.js es liest');
  assert.notEqual(u('<script type="text/x-python">\nx = 1\n</script>', '<script type="text/x-python">\nx = 2\n</script>'), null, 'Python-Inhalt');
  assert.equal(u('<script type="application/json">{"a": [1, 2]}</script>', '<script type="application/json">{"a":[1,2]}</script>'), null, 'JSON nach Wert');
  assert.notEqual(u('<button>a</button><button>b</button>', '<button>a</button> <button>b</button>'), null, 'Leerzeichen zwischen Knöpfen');
});

test('Plan: Folge, Entscheidung mit ja und nein, verschachtelt; Fehler bei falscher Einrückung', () => {
  const plan = (text) => mdxZuHtml('<Plan titel="Test">\n\n```text\n' + text + '\n```\n\n</Plan>\n');
  const einfach = plan('Eingabe: punkte\nEntscheidung: punkte >= 50?\n  ja:\n    Ausgabe: "bestanden"\n  nein:\n    Ausgabe: "nicht bestanden"\nAusgabe: "fertig"');
  assert.equal((einfach.match(/pap-n--if/g) || []).length, 1, 'eine Raute');
  assert.equal((einfach.match(/pap-n--io/g) || []).length, 4, 'vier Parallelogramme');
  assert.match(einfach, /aria-label="Programmablaufplan: Test"/);
  assert.match(einfach, />ja</);
  assert.match(einfach, />nein</);
  const nurJa = plan('Entscheidung: x > 0?\n  ja:\n    y = 1\nAusgabe: y');
  assert.equal((nurJa.match(/pap-n--if/g) || []).length, 1);
  const kette = plan('Entscheidung: n >= 90?\n  ja:\n    note = 1\n  nein:\n    Entscheidung: n >= 50?\n      ja:\n        note = 3\n      nein:\n        note = 5\nAusgabe: note');
  assert.equal((kette.match(/pap-n--if/g) || []).length, 2, 'zwei Rauten für eine Kette');
  assert.equal((kette.match(/pap-n--op/g) || []).length, 3);
  assert.throws(() => plan('Eingabe: x\n   y = 1'), /Einrückung/);
  assert.throws(() => plan('ja:\n  y = 1'), /ohne Entscheidung/);
  assert.throws(() => plan('Eingabe: x\n    y = 1'), /zu weit eingerückt/);
});

test('Plan: Schleife mit Rumpf, Rücksprung, Schreibweise der Bedingung, verschachtelt, Fehler', () => {
  const plan = (text) => mdxZuHtml('<Plan titel="Test">\n\n```text\n' + text + '\n```\n\n</Plan>\n');
  const h = plan('Eingabe: preis\nsumme = 0\nSchleife: preis != 0?\n  summe = summe + preis\n  Eingabe: preis\nAusgabe: summe');
  assert.equal((h.match(/pap-n--while/g) || []).length, 1, 'eine Schleifenraute');
  assert.equal((h.match(/pap-n--io/g) || []).length, 3, 'Eingabe, Eingabe im Rumpf, Ausgabe');
  assert.equal((h.match(/pap-n--op/g) || []).length, 2, 'summe = 0 und im Rumpf');
  assert.match(h, /preis ≠ 0\?/, 'wie im Editor: != wird ≠');
  assert.match(h, />ja</);
  assert.match(h, />nein</);
  assert.match(h, /<path class="pap-line" d="M[\d.]+ [\d.]+L[\d.]+ [\d.]+L-[\d.]+ [\d.]+L-[\d.]+ [\d.]+L[\d.]+ [\d.]+"\/>/, 'Rücksprung links herum gezeichnet');
  const logik = plan('Schleife: not (m >= 1 and m <= 12)?\n  Eingabe: m');
  assert.match(logik, /nicht/);
  assert.match(logik, /≥/);
  assert.match(logik, /≤/);
  assert.match(logik, /und/);
  const innen = plan('Schleife: a > 0?\n  Entscheidung: a > 5?\n    ja:\n      b = 1\n    nein:\n      b = 2\n  Schleife: b > 0?\n    b = b - 1\n  a = a - 1\nAusgabe: a');
  assert.equal((innen.match(/pap-n--while/g) || []).length, 2, 'Schleife in der Schleife');
  assert.equal((innen.match(/pap-n--if/g) || []).length, 1);
  assert.equal((plan('Schleife: x < 3?\n  Eingabe: x').match(/pap-n--while/g) || []).length, 1, 'Schleife am Ende');
  assert.throws(() => plan('Schleife: x < 3?\n    y = 1'), /zu weit eingerückt/);
  assert.throws(() => plan('Schleife: x < 3?\n  ja:\n    y = 1'), /ohne Entscheidung/);
});
