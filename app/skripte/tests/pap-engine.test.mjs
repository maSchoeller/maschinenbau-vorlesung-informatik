/* Selbsttest PAP-Zeichner (site/assets/js/pap-engine.js): erzeugter Code */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const P = createRequire(path.join(SITE, 'assets', 'js', 'x.js'))('./pap-engine.js');

test('Raute mit Fragezeichen am Ende: kein Fragezeichen im erzeugten Code', () => {
  const baum = [P.nIn('alter', 'int'), P.nIf('alter >= 16?', [P.nOut('"Einlass"')], [P.nOut('"Kein Einlass"')])];
  const code = P.toText(baum);
  assert.match(code, /^if alter >= 16:$/m);
  assert.ok(!code.includes('?'), code);
});

test('Fragezeichen mit Leerzeichen davor und doppelt, in elif und in Schleifen', () => {
  const zweite = P.nIf('x > 5 ??', [P.nOut('1')], [P.nOut('2')]);
  const code = P.toText([P.nIf('x < 0 ?', [P.nOut('0')], [zweite]), P.nWhile('x < 3?', [P.nOp('x = x + 1')])]);
  assert.match(code, /^if x < 0:$/m);
  assert.match(code, /^elif x > 5:$/m);
  assert.match(code, /^while x < 3:$/m);
  assert.ok(!code.includes('?'), code);
});

test('Ein Fragezeichen in einer Zeichenkette bleibt, und Bedingungen ohne Fragezeichen ändern sich nicht', () => {
  assert.match(P.toText([P.nIf('antwort == "ja?"', [], [])]), /^if antwort == "ja\?":$/m);
  assert.match(P.toText([P.nIf('a ≤ b and c ≠ d', [], [])]), /^if a <= b and c != d:$/m);
  assert.match(P.toText([P.nIf('', [], [])]), /^if True:$/m);
});

test('Der erzeugte Code mit Fragezeichen ist als Python lesbar (Zeile endet auf Doppelpunkt)', () => {
  const zeilen = P.toLines([P.nIf('geld >= 1.5?', [P.nOut('"Cola"')], [])], 0, []);
  assert.equal(zeilen[0].text, 'if geld >= 1.5:');
});

test('Plan-Anzeige: ein getipptes Fragezeichen in der Raute wird nicht verdoppelt', () => {
  const alle = (s, f) => { const r = []; (function lauf(a) { for (const n of a) { if (f(n)) r.push(n.text); for (const k of ['yes', 'no', 'body']) if (n[k]) lauf(n[k]); } })(s); return r; };
  const spec = P.toPap([P.nIf('alter < 18?', [P.nOut('"Kind"')], [P.nOut('"Erwachsen"')]), P.nIf('x > 1', [], []), P.nWhile('x < 3 ??', [P.nOp('x = x + 1')])]);
  const texte = alle(spec, (n) => n.type === 'if' || n.type === 'while' || n.kind === 'if' || n.kind === 'while' || /\?$/.test(n.text || ''));
  assert.ok(texte.includes('alter < 18?'), JSON.stringify(texte));
  assert.ok(texte.includes('x > 1?'), JSON.stringify(texte));
  assert.ok(texte.includes('x < 3?'), JSON.stringify(texte));
  assert.ok(!texte.some((t) => /\?\?/.test(t)), JSON.stringify(texte));
});

test('Zählschleife: die Raute zeigt „i von a bis b − 1“ statt range', () => {
  assert.equal(P.forText('i in range(1, 11)'), 'i von 1 bis 10');
  assert.equal(P.forText('i in range(1, 11)?'), 'i von 1 bis 10');
  assert.equal(P.forText('zahl in range(0, 8)'), 'zahl von 0 bis 7');
  assert.equal(P.forText('k in range(8)'), 'k von 0 bis 7');
  assert.equal(P.forText('i in range(1, n + 1)'), 'i von 1 bis n');
  assert.equal(P.forText('i in range(n)'), 'i von 0 bis n − 1');
  assert.equal(P.forText('i in range(n + 1)'), 'i von 0 bis n');
  assert.equal(P.forText('i in range(a, 2 * n)'), 'i von a bis (2 * n) − 1');
  assert.equal(P.forText('i in range(5, 0, -1)'), 'i von 5 bis 1, Schritt −1');
  assert.equal(P.forText('i in range(2, 20, 3)?'), 'i von 2 bis 19, Schritt 3');
  assert.equal(P.forText('i in range(0, 11, 2)'), 'i von 0 bis 10, Schritt 2');
  assert.equal(P.forText('i in range(10, 0, -k)'), 'i in range(10, 0, -k)');
  assert.equal(P.forText('y in range(0, hoehe + 1, abstand)'), 'y von 0 bis hoehe, Schritt abstand');
  assert.equal(P.forText('x in range(0, breite, abstand)'), 'x von 0 bis breite − 1, Schritt abstand');
  assert.equal(P.forText('i in range(a, b, -2)'), 'i in range(a, b, -2)');
  assert.equal(P.forText('x in werte'), 'x in werte');
});

test('Zählschleife im Plan: Raute mit „von … bis …?“, der erzeugte Code bleibt range', () => {
  const baum = [P.nFor('i in range(1, 11)', [P.nOp('summe = summe + i')])];
  const alle = []; (function lauf(a) { for (const n of a) { alle.push(n.text || ''); for (const k of ['yes', 'no', 'body']) if (n[k]) lauf(n[k]); } })(P.toPap(baum));
  assert.ok(alle.includes('i von 1 bis 10?'), JSON.stringify(alle));
  assert.match(P.toText(baum), /^for i in range\(1, 11\):$/m);
});
