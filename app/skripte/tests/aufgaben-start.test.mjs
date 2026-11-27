/* Selbsttest gemeinsame Werkzeuge für Termin 08 bis 10 (site/assets/js/aufgaben.js):
   Startcode aus einer Vorstufe („Meinen Code laden“, data-start-aus), Hinweistexte für NameError, UnboundLocalError und
   AttributeError mit NoneType, Testhilfe mit_zufall. Die Python-Teile laufen mit dem System-Python (ohne Python übersprungen). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { SITE } from '../../src/lib/pfade.mjs';

const quelle = fs.readFileSync(path.join(SITE, 'assets', 'js', 'aufgaben.js'), 'utf8');
const PRELUDE = quelle.slice(quelle.indexOf('String.raw`') + 11, quelle.indexOf('`;\n  /*PY-END*/'));
const py = ['python', 'python3'].find((c) => spawnSync(c, ['--version']).status === 0);
const mitPython = { skip: py ? false : 'kein Python im PATH' };

function ladeKern() {
  const dok = { readyState: 'loading', addEventListener() {}, body: { getAttribute: () => 'V10' }, querySelectorAll: () => [] };
  const fenster = { KursSpeicher: undefined };
  fenster.window = fenster;
  const ctx = vm.createContext({ window: fenster, document: dok, console });
  vm.runInContext(quelle, ctx);
  return fenster.KursAufgaben;
}

function laufe(code) {
  const r = spawnSync(py, ['-I', '-X', 'utf8', '-c', PRELUDE + '\n' + code], { encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}
function teste(src, tests, mode = 'programm') {
  const args = ['test', src, [], tests, mode].map((v) => JSON.stringify(v)).join(', ');
  const out = laufe('_main(' + args + ')\n');
  return out.split('\n').filter((l) => l.startsWith('\x1e')).map((l) => JSON.parse(l.slice(1))).filter((z) => z.t);
}
const hinweis = (src) => {
  const out = laufe('try:\n    exec(compile(' + JSON.stringify(src) + ', "x", "exec"), {})\nexcept Exception as e:\n    print("H|" + _hint(e))\n');
  return out.split('\n').find((l) => l.startsWith('H|')).slice(2);
};

test('Startcode: Kennung der Vorstufe, mit und ohne Lektion', () => {
  const S = ladeKern().startcode;
  assert.deepEqual({ ...S.parse('w-stufe2', 'V10') }, { lektion: 'V10', id: 'w-stufe2' });
  assert.deepEqual({ ...S.parse(' V09:w-spiel ', 'V10') }, { lektion: 'V09', id: 'w-spiel' });
  assert.equal(S.parse('', 'V10'), null);
  assert.equal(S.parse(null, 'V10'), null);
  assert.equal(S.parse('V09:', 'V10'), null);
});

test('Startcode: der gespeicherte eigene Code gewinnt vor der Musterlösung, leerer Stand zählt nicht', () => {
  const S = ladeKern().startcode;
  assert.deepEqual({ ...S.waehle({ v: 1, code: 'x = 1' }, 'muster = 2') }, { code: 'x = 1', quelle: 'eigen' });
  assert.deepEqual({ ...S.waehle(undefined, 'muster = 2') }, { code: 'muster = 2', quelle: 'muster' });
  assert.deepEqual({ ...S.waehle({ v: 1, code: '   ' }, 'muster = 2') }, { code: 'muster = 2', quelle: 'muster' });
  assert.deepEqual({ ...S.waehle({ v: 1, ab: 1 }, 'muster = 2') }, { code: 'muster = 2', quelle: 'muster' });
  assert.equal(S.waehle(undefined, ''), null);
  assert.equal(S.waehle(null, null), null);
});

test('Startcode: Knopf, Meldungen und Zurücksetzen stehen im Quelltext, ohne Gedankenstrich', () => {
  for (const t of ['Meinen Code laden', 'Dein Code aus der letzten Aufgabe ist geladen.', 'Du hast die letzte Aufgabe nicht bearbeitet. Geladen ist die Musterlösung.', 'Zu dieser Aufgabe gibt es noch keinen Code.', 'Wirklich ersetzen?', 'Dein Code hier wird ersetzt.']) {
    assert.ok(quelle.includes(t), t);
    assert.ok(!/[–—]/.test(t), t);
  }
  assert.match(quelle, /getAttribute\('data-start-aus'\)/);
});

test('Hinweise: NameError nennt auch Namen, die nur in einer Funktion gelten', mitPython, () => {
  const h = hinweis('def f(x):\n    ergebnis = x\n    return 1\nf(2)\nprint(ergebnis)');
  assert.match(h, /gilt nur in einer Funktion/);
  assert.match(h, /Tippfehler/);
});

test('Hinweise: UnboundLocalError hat einen eigenen Satz (Zweig setzt den Namen nicht)', mitPython, () => {
  const h = hinweis('def f(n):\n    if n > 5:\n        name = "gross"\n    return name\nf(1)');
  assert.match(h, /bekommt auf diesem Weg durch die Funktion noch keinen Wert/);
  assert.match(h, /jedem Zweig/);
  assert.ok(!/Tippfehler/.test(h));
});

test('Hinweise: AttributeError mit NoneType (fehlendes return) bekommt den return-Satz, andere AttributeError bleiben beim Modul-Satz', mitPython, () => {
  const none = hinweis('def g(x):\n    y = x * 2\nr = g(3)\nr.append(1)');
  assert.match(none, /Ein Wert ist None/);
  assert.match(none, /Fehlt in der Funktion ein return/);
  const modul = hinweis('import math\nmath.piii');
  assert.match(modul, /Name im Modul falsch geschrieben/);
  const typ = hinweis('def g(x):\n    y = x * 2\nr = g(3)\nr + 1');
  assert.match(typ, /Ein Wert ist None/);
});

test('Hinweise: Texte ohne Gedankenstrich', () => {
  const m = quelle.slice(quelle.indexOf('def _hint(e):'), quelle.indexOf('def _format_exc'));
  assert.ok(!/[–—]/.test(m));
});

test('mit_zufall: feste Werte, Aufrufe werden gezählt, randint wird zurückgestellt', mitPython, () => {
  const src = 'import random\ngeheim = random.randint(1, 100)\nwhile True:\n    t = int(input())\n    if t < geheim:\n        print("Zu klein")\n    elif t > geheim:\n        print("Zu groß")\n    else:\n        print("Richtig!")\n        break\n';
  const tests = [
    'def test_fest():', '    "Feste Zahl, ein Aufruf"',
    '    z, aufrufe = mit_zufall([42], [30, 50, 42])',
    '    assert z == ["Zu klein", "Zu groß", "Richtig!"], z',
    '    assert aufrufe == [(1, 100)], aufrufe',
    'def test_zurueck():', '    "randint ist danach wieder echt"',
    '    import random',
    '    mit_zufall([7], [7])',
    '    assert random.randint(1, 1) == 1',
  ].join('\n');
  const r = teste(src, tests);
  assert.equal(r.length, 2);
  r.forEach((z) => assert.ok(z.ok, JSON.stringify(z)));
});

test('mit_zufall: Zufallszahl in der Schleife wird sichtbar (mehrere Werte, mehr Aufrufe als einer)', mitPython, () => {
  const src = 'import random\nt = 0\nwhile t != 30:\n    geheim = random.randint(1, 100)\n    t = int(input())\n    print("Zu klein" if t < geheim else "Zu groß" if t > geheim else "Richtig!")\n';
  const tests = [
    'def test_einmal():', '    "Genau einmal ziehen"',
    '    z, aufrufe = mit_zufall([30, 99, 5], [10, 30])',
    '    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100). Aufrufe: %d" % len(aufrufe)',
  ].join('\n');
  const r = teste(src, tests);
  assert.equal(r.length, 1);
  assert.equal(r[0].ok, false);
  assert.match(r[0].m, /genau einmal/);
});

test('mit_zufall: wer random.choice nimmt, fällt durch die Prüfung der Aufrufe', mitPython, () => {
  const src = 'import random\ngeheim = random.choice(range(1, 101))\nprint(geheim)\n';
  const tests = ['def test_a():', '    "Aufrufe"', '    z, aufrufe = mit_zufall([42], [])', '    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100)."'].join('\n');
  const r = teste(src, tests);
  assert.equal(r[0].ok, false);
});

test('code-Aufgaben: Pflichtliste, Schema und eigene Erfolgsmeldung sind vorgesehen (data-role pflicht und scheme, data-erfolg)', () => {
  assert.match(quelle, /script\[data-role="pflicht"\]/);
  assert.match(quelle, /initAbhaken\(root, cursor/);
  assert.match(quelle, /getAttribute\('data-erfolg'\)/);
  assert.match(quelle, /Pflichtliste: Hake ab, was dein Spiel schon kann/);
});

test('trace: sprache befehle zeigt „Programm“ ohne Kopieren-Knopf', () => {
  const kurs = fs.readFileSync(path.join(SITE, 'assets', 'js', 'kurs.js'), 'utf8');
  assert.match(kurs, /sprache === 'befehle'[\s\S]{0,200}'Programm'/);
  assert.match(quelle, /cfg\.sprache === 'befehle'/);
});

test('Plan-Editor: data-ohne-code lässt den Bereich „Erzeugten Python-Code“ weg', () => {
  const ed = fs.readFileSync(path.join(SITE, 'assets', 'js', 'pap-editor.js'), 'utf8');
  assert.match(ed, /hasAttribute\('data-ohne-code'\)/);
});
