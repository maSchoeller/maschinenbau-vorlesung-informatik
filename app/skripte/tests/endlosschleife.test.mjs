/* Selbsttest Endlosschleifenschutz: Schrittzähler im Testlauf (PY_PRELUDE in aufgaben.js, läuft hier mit dem
   System-Python) und Ausgabekappung (Py.kappe in kurs.js). Ohne Python im PATH werden die Python-Tests übersprungen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { SITE } from '../../src/lib/pfade.mjs';

const JS = (n) => fs.readFileSync(path.join(SITE, 'assets', 'js', n), 'utf8');
const aufgaben = JS('aufgaben.js');
const PRELUDE = aufgaben.slice(aufgaben.indexOf('String.raw`') + 11, aufgaben.indexOf('`;\n  /*PY-END*/'.replace(/\n/g, aufgaben.includes('\r\n') ? '\r\n' : '\n')));
const ENDLOS = 'Dein Programm läuft nicht zu Ende. Ändert sich in der Schleife etwas an der Bedingung?';

const py = ['python', 'python3'].find((c) => spawnSync(c, ['--version']).status === 0);
const mitPython = { skip: py ? false : 'kein Python im PATH' };

function teste(src, tests, mode = 'programm') {
  const args = ['test', src, [], tests, mode].map((v) => JSON.stringify(v)).join(', ');
  const t0 = Date.now();
  const r = spawnSync(py, ['-I', '-X', 'utf8', '-c', PRELUDE + '\n_main(' + args + ')\n'], { encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, r.stderr);
  const zeilen = r.stdout.split('\n').filter((l) => l.startsWith('\x1e')).map((l) => JSON.parse(l.slice(1)));
  return { zeilen, ms: Date.now() - t0 };
}

test('Prelude: Schrittzähler und Grenzen sind im Python-Text vorhanden', () => {
  assert.match(PRELUDE, /_MAX_ZEILEN = 200000/);
  assert.ok(PRELUDE.includes(ENDLOS));
});

test('Testlauf: while True: pass scheitert mit der Meldung, die übrigen Tests laufen weiter', mitPython, () => {
  const tests = [
    'def test_a():', '    "Erster Test"', '    run_program()',
    'def test_b():', '    "Zweiter Test"', '    run_program()',
    'def test_c():', '    "Dritter Test"', '    assert 1 + 1 == 2',
  ].join('\n');
  const { zeilen, ms } = teste('while True:\n    pass\n', tests);
  const ergebnisse = zeilen.filter((z) => z.t);
  assert.equal(ergebnisse.length, 3);
  assert.deepEqual(ergebnisse.map((z) => z.ok), [false, false, true]);
  assert.equal(ergebnisse[0].m, ENDLOS);
  assert.equal(ergebnisse[1].m, ENDLOS);
  assert.deepEqual(zeilen.at(-1), { done: 3 });
  assert.ok(ms < 30000, `zu langsam: ${ms} ms`);
});

test('Testlauf: Zählschleife ohne Änderung der Bedingung', mitPython, () => {
  const { zeilen } = teste('n = 5\nwhile n > 0:\n    print(n)\n', 'def test_x():\n    run_program()\n');
  assert.equal(zeilen[0].m, ENDLOS);
});

test('Testlauf: print in Endlosschleife sammelt keine unbegrenzte Ausgabe', mitPython, () => {
  const { zeilen } = teste('while True:\n    print("x" * 100000)\n', 'def test_x():\n    run_program()\n');
  assert.equal(zeilen[0].ok, false);
  assert.equal(zeilen[0].m, ENDLOS);
});

test('Testlauf: Funktion mit Endlosschleife, vom Test aufgerufen (Modus funktion)', mitPython, () => {
  const { zeilen } = teste('def f():\n    while True:\n        pass\n', 'def test_f():\n    f()\ndef test_g():\n    assert True\n', 'funktion');
  const e = zeilen.filter((z) => z.t);
  assert.deepEqual(e.map((z) => z.ok), [false, true]);
  assert.equal(e[0].m, ENDLOS);
});

test('Testlauf: Endlosschleife direkt beim Einlesen (Modus funktion) meldet die Meldung als Fehler', mitPython, () => {
  const { zeilen } = teste('while True:\n    pass\n', 'def test_f():\n    assert True\n', 'funktion');
  assert.equal(zeilen[0].fatal, ENDLOS);
});

test('Testlauf: normale Programme laufen unverändert, auch mit langer Schleife unter dem Limit', mitPython, () => {
  const src = 's = 0\nfor i in range(1, 50001):\n    s = s + i\nprint(s)\n';
  const tests = 'def test_s():\n    "Summe"\n    assert zeilen(run_program())[-1] == "1250025000"\n';
  const { zeilen } = teste(src, tests);
  assert.deepEqual(zeilen[0], { t: 'Summe', ok: true });
});

test('Testlauf: ein Programm, das sauber endet, wird nach einem Abbruch nicht weiter gebremst', mitPython, () => {
  const tests = 'def test_1():\n    run_program()\ndef test_2():\n    assert zeilen(run_program())[-1] == "3"\n';
  const { zeilen } = teste('print(1 + 2)\n', tests);
  assert.deepEqual(zeilen.filter((z) => z.t).map((z) => z.ok), [true, true]);
});

/* Py.kappe aus kurs.js herauslösen */
const kurs = JS('kurs.js');
const start = kurs.indexOf('Py.kappe = function');
const kappeQuelle = kurs.slice(start, kurs.indexOf('Py.mix = function', start)).replace('Py.kappe =', 'return');
const kappe = new Function(kappeQuelle.replace(/;\s*$/, ''))();
function sammle(max) {
  const teile = [];
  const k = kappe((t, c) => teile.push([t, c]), max);
  return { k, teile, text: () => teile.map((x) => x[0]).join('') };
}

test('Ausgabekappung: bis zur Grenze unverändert, kein Hinweis bei genau 500 Zeilen', () => {
  const s = sammle();
  for (let i = 0; i < 500; i++) s.k(i + '\n');
  assert.equal(s.teile.length, 500);
  assert.ok(!s.text().includes('abgeschnitten'));
});

test('Ausgabekappung: ab Zeile 501 nichts mehr, einmal der Hinweis', () => {
  const s = sammle();
  for (let i = 0; i < 100000; i++) s.k(i + '\n');
  const zeilen = s.text().split('\n');
  assert.equal(zeilen.filter((l) => /^\d+$/.test(l)).length, 500);
  assert.equal(s.text().split('weitere Ausgabe abgeschnitten').length - 1, 1);
  assert.equal(s.teile.at(-1)[1], 'sys');
});

test('Ausgabekappung: ein großer Block mit vielen Zeilen wird an der Grenze geteilt', () => {
  const s = sammle(10);
  s.k(Array.from({ length: 50 }, (_, i) => 'z' + i).join('\n') + '\n');
  assert.equal(s.text(), Array.from({ length: 10 }, (_, i) => 'z' + i).join('\n') + '\n… weitere Ausgabe abgeschnitten\n');
});

test('Ausgabekappung: eine einzige riesige Zeile wird nach 100000 Zeichen gekappt', () => {
  const s = sammle();
  s.k('x'.repeat(250000));
  assert.ok(s.text().startsWith('x'.repeat(100000) + '\n…'));
  assert.ok(s.text().length < 100100);
});
