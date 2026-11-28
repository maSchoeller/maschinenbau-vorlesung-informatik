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

/* ── Blocktyp „Funktion“ (def) ── */
const stationBaum = () => [
  P.nDef('kmh_in_ms(v)', [P.nOp('wert = v / 3.6')], 'wert'),
  P.nIn('kmh', undefined, 'kmh: '),
  P.nCall('ms = kmh_in_ms(kmh)'),
  P.nOut('f"{ms:.1f} m/s"'),
];
const stationCode = 'def kmh_in_ms(v):\n    wert = v / 3.6\n    return wert\n\nkmh = float(input("kmh: "))\nms = kmh_in_ms(kmh)\nprint(f"{ms:.1f} m/s")';

test('Funktion: Code mit def und return, Funktionen stehen vor dem Hauptprogramm', () => {
  assert.equal(P.toText(stationBaum()), stationCode);
  /* egal, wo der Block im Baum steht */
  const spaet = stationBaum(); spaet.push(spaet.shift());
  assert.equal(P.toText(spaet), stationCode);
});

test('Funktion: ohne Rückgabe kein return, ohne Rumpf pass, ohne Parameter, leerer Kopf ist eine Lücke', () => {
  assert.equal(P.toText([P.nDef('zeige()', [P.nOut('"Hallo"')], '')]), 'def zeige():\n    print("Hallo")');
  assert.equal(P.toText([P.nDef('nichts()', [], '')]), 'def nichts():\n    pass');
  assert.equal(P.toText([P.nDef('eins()', [], '1')]), 'def eins():\n    return 1');
  assert.equal(P.toText([P.nDef('', [P.nOut('1')], 'x')]), 'pass  # Lücke: Funktionskopf eintragen');
  assert.equal(P.toText([P.nDef('f(a, b)', [], 'a − b')]), 'def f(a, b):\n    return a - b');
  const zwei = P.toText([P.nDef('a(x)', [], 'x'), P.nDef('b(y)', [], 'y'), P.nOut('1')]);
  assert.equal(zwei, 'def a(x):\n    return x\n\ndef b(y):\n    return y\n\nprint(1)');
});

test('Funktion: Rundlauf Code -> Baum -> Code und JSON mit Rückgabe', () => {
  const baum = P.parseCode(stationCode, { erweitert: true }).nodes;
  assert.deepEqual(baum.map((n) => n.k), ['def', 'in', 'call', 'out']);
  assert.equal(baum[0].v, 'kmh_in_ms(v)');
  assert.equal(baum[0].ret, 'wert');
  assert.equal(baum[2].k, 'call', 'Aufruf der eigenen Funktion ist ein Unterprogramm-Symbol');
  assert.equal(P.toText(baum), stationCode);
  const json = P.toJson(baum);
  assert.equal(json[0].ret, 'wert');
  const neu = P.fromJson(JSON.parse(JSON.stringify(json)));
  assert.equal(neu[0].ret, 'wert');
  assert.equal(neu[0].body.length, 1);
  assert.equal(P.toText(neu), stationCode);
  assert.equal(P.toText(P.fromJson({ baum: json })), stationCode);
});

test('Funktion: Parser mit pass, ohne Rückgabe, mit Verzweigung im Rumpf', () => {
  const b = P.parseCode('def zeige(nr):\n    if nr > 1:\n        print(nr)\n    else:\n        pass\n\nzeige(3)', { erweitert: true }).nodes;
  assert.equal(b[0].k, 'def'); assert.equal(b[0].ret, ''); assert.equal(b[0].body[0].k, 'if');
  assert.equal(b[1].k, 'call');
  const leer = P.parseCode('def tu():\n    pass', { erweitert: true }).nodes[0];
  assert.deepEqual(leer.body, []);
});

test('Funktion: Fehler mit Zeilennummer (return mitten im Rumpf, def im Block, drei Parameter, Standardwert, ohne erweitert)', () => {
  const fehler = (code, muster) => assert.throws(() => P.parseCode(code, { erweitert: true }), (e) => muster.test(e.message) && Number.isInteger(e.line), code);
  fehler('def f(x):\n    return x\n    print(1)', /Zeile 2: return steht nur am Ende/);
  fehler('def f(x):\n    if x > 0:\n        return 1\n    return 2', /Zeile 3: return steht nur am Ende/);
  fehler('x = 1\nif x > 0:\n    def f():\n        pass', /Zeile 3: Eine Funktion mit def steht ganz links/);
  fehler('def f():\n    def g():\n        pass', /Zeile 2: Eine Funktion mit def steht ganz links/);
  fehler('def f(a, b, c):\n    return a', /Zeile 1: Eine Funktion hat hier höchstens zwei Parameter/);
  fehler('def f(a, b=2):\n    return a', /Zeile 1: Parameter stehen ohne Standardwert/);
  fehler('def f(a)\n    return a', /Zeile 1: Nach dem Funktionskopf fehlt der Doppelpunkt/);
  fehler('x = 1\nreturn x', /Zeile 2: return gehört in eine Funktion/);
  assert.throws(() => P.parseCode('def f():\n    pass'), /Zeile 1/, 'ohne erweitert bleibt def ein Fehler wie bisher');
});

test('Funktion: Nummerierung (Hauptplan zuerst), Suche und Lese-Reihenfolge', () => {
  const baum = stationBaum();
  P.numberTree(baum);
  assert.deepEqual(baum.map((n) => n.num), [4, 1, 2, 3]);
  assert.equal(baum[0].body[0].num, 5);
  assert.deepEqual(P.flat(baum).map((n) => n.k), ['in', 'call', 'out', 'def', 'op']);
  assert.equal(P.find(baum, baum[0].body[0].id).parent.k, 'def');
  assert.equal(P.find(baum, baum[0].body[0].id).slot, 'body');
});

test('Funktion: Zeichnung je Funktion ein Plan, Start mit Name, Ende mit Rückgabe, Aufruf als Unterprogramm', () => {
  const baum = stationBaum();
  P.numberTree(baum);
  const plaene = P.toPapAll(baum);
  assert.equal(plaene.length, 2);
  assert.equal(plaene[0].def, null);
  const haupt = plaene[0].spec.map((n) => n.t + ':' + n.text);
  assert.deepEqual(haupt, ['start:Start', 'io:kmh einlesen', 'sub:ms = kmh_in_ms(kmh)', 'io:Ausgabe: f"{ms:.1f} m/s"', 'end:Ende']);
  const fkt = plaene[1].spec.map((n) => n.t + ':' + n.text);
  assert.deepEqual(fkt, ['start:kmh_in_ms(v)', 'op:wert = v / 3.6', 'end:Rückgabe wert']);
  const ohne = P.toPapAll([P.nDef('zeige()', [P.nOut('"x"')], '')])[1].spec.map((n) => n.text);
  assert.deepEqual(ohne, ['zeige()', 'Ausgabe: x', 'Ende']);
  /* ohne Funktion bleibt alles beim Alten: ein Plan, Start und Ende */
  assert.equal(P.toPapAll([P.nOut('1')]).length, 1);
  assert.equal(P.toPap([P.nOut('1')]).length, 3);
  const svg = P.svgAll(baum, {});
  assert.equal((svg.match(/<svg /g) || []).length, 2);
  assert.match(svg, /Funktion kmh_in_ms\(v\)/);
  assert.match(svg, /pap-n--sub/);
  assert.match(P.describeAll(baum), /Funktion kmh_in_ms\(v\): kmh_in_ms\(v\), dann wert = v \/ 3\.6, dann Rückgabe wert\./);
  const ex = P.exportSvgAll(baum, {});
  assert.match(ex, /^<\?xml/); assert.match(ex, /Rückgabe wert/); assert.match(ex, /translate\(/);
  const einfach = [P.nOut('1')];
  assert.equal(P.exportSvgAll(einfach, {}), P.exportSvg(P.toPap(einfach), {}), 'ohne Funktion derselbe Export wie bisher');
});

test('Funktion: Einfügestellen im Funktionsplan liegen im Rumpf (slot body), Hauptplan zählt im ganzen Baum', () => {
  const baum = stationBaum();
  P.numberTree(baum);
  const alle = P.marksAll(baum);
  assert.equal(alle.length, 2);
  const imRumpf = alle[1].marks.flatMap((m) => m.targets);
  assert.ok(imRumpf.length >= 2);
  imRumpf.forEach((t) => { assert.equal(t.slot, 'body'); assert.equal(t.parent, baum[0].id); });
  assert.deepEqual(imRumpf.map((t) => t.idx).sort(), [0, 1]);
  /* Hauptplan: die Stellen verweisen auf Plätze im Baum, an dem die def-Knoten vorn stehen (idx 1 bis 4) */
  const haupt = alle[0].marks.flatMap((m) => m.targets);
  assert.ok(haupt.every((t) => t.parent === null && t.slot === 'root'));
  assert.deepEqual(haupt.map((t) => t.idx).sort(), [1, 2, 3, 4]);
  assert.deepEqual(P.marks(baum).marks.flatMap((m) => m.targets).map((t) => t.idx).sort(), [1, 2, 3, 4]);
  /* leerer Funktionsrumpf: eine Stelle „hinein“ */
  const leer = P.marksAll([P.nDef('f()', [], '')])[1].marks;
  assert.equal(leer.length, 1); assert.equal(leer[0].targets[0].label, 'hinein');
});

test('Funktion: Lösung der Station „Funktionsplan zeichnen“ ergibt den Code des Zuschnitts', async () => {
  const fs = await import('node:fs');
  const dir = path.join(SITE, '..', 'app', 'inhalte', 'v07', 'labor');
  const loesung = JSON.parse(fs.readFileSync(path.join(dir, 'w-funktionsplan.solution.json'), 'utf8'));
  assert.equal(P.toText(P.fromJson(loesung)), stationCode);
  const start = JSON.parse(fs.readFileSync(path.join(dir, 'w-funktionsplan.start.json'), 'utf8'));
  const gerade = P.toText(P.fromJson(start));
  assert.match(gerade, /^kmh = float\(input\("kmh: "\)\)\nms = kmh_in_ms\(kmh\)\nprint\(f"\{ms:\.1f\} m\/s"\)$/);
});

test('Funktion: Anfängereingaben im Kopf und in der Rückgabe führen nicht zu Syntaxfehlern', () => {
  assert.equal(P.toText([P.nDef('def f(x)', [], 'return x')]), 'def f(x):\n    return x');
  assert.equal(P.toText([P.nDef('f(x):', [], 'x')]), 'def f(x):\n    return x');
  assert.equal(P.toText([P.nDef('def f(x):', [P.nOp('y = x')], 'return y')]), 'def f(x):\n    y = x\n    return y');
  assert.equal(P.toText([P.nDef('f', [], 'x')]), 'pass  # Lücke: Funktionskopf eintragen');
});

test('Funktion: Code mit def hinter dem Hauptprogramm wird mit Zeilennummer abgelehnt', () => {
  assert.throws(() => P.parseCode('y = f(2)\ndef f(x):\n    return x', { erweitert: true }), (e) => e.line === 2 && /vor dem Hauptprogramm/.test(e.message));
  const ok = P.parseCode('def f(x):\n    return x\ny = f(2)', { erweitert: true });
  assert.equal(ok.nodes.length, 2, 'def zuerst ist erlaubt');
});

/* Termin 08 bis 10: vorgegebene Funktion in den Startdaten, Eingaben mit typ int, import random als erster Knoten */
test('Startdaten mit fertiger Funktion (k: def) und zwei Eingaben mit typ int ergeben den Code, den der Zuschnitt verlangt', () => {
  const start = [
    { k: 'def', v: 'ist_gerade(n)', body: [], ret: 'n % 2 == 0' },
    { k: 'in', v: 'a', typ: 'int', prompt: 'a: ' },
    { k: 'in', v: 'b', typ: 'int', prompt: 'b: ' },
  ];
  const baum = P.fromJson(start);
  assert.equal(baum[0].k, 'def');
  assert.equal(P.toText(baum), 'def ist_gerade(n):\n    return n % 2 == 0\n\na = int(input("a: "))\nb = int(input("b: "))');
  /* die Funktion steht vor dem Hauptprogramm, auch wenn sie in den Startdaten hinten steht */
  const hinten = P.fromJson([start[1], start[2], start[0]]);
  assert.equal(P.toText(hinten), P.toText(baum));
  /* Rundlauf Code -> Baum -> Code */
  const code = P.toText(baum);
  assert.equal(P.toText(P.parseCode(code, { erweitert: true }).nodes), code);
});

test('Plan mit def und Verzweigung: die Antwort steht in einer Variablen, die Funktion hat ein Ende (Rückgabe antwort)', () => {
  const baum = P.fromJson([{ k: 'def', v: 'sieger(summe)', body: [
    { k: 'op', v: 'antwort = "Ben"' },
    { k: 'if', v: 'summe % 2 == 0', yes: [{ k: 'op', v: 'antwort = "Anna"' }], no: [] },
  ], ret: 'antwort' }, { k: 'call', v: 'print(sieger(7))' }]);
  const code = P.toText(baum);
  assert.equal(code, 'def sieger(summe):\n    antwort = "Ben"\n    if summe % 2 == 0:\n        antwort = "Anna"\n    return antwort\n\nprint(sieger(7))');
  const alle = P.toPapAll(baum);
  assert.equal(alle.length, 2);
  assert.ok(P.svgAll(baum, { label: 'Test', minw: 1 }).length > 100, 'Zeichnung entsteht');
});

test('import random als erste Operation im Hauptplan: steht vor dem Hauptprogramm, nach den Funktionen, und überlebt den Rundlauf', () => {
  const baum = P.fromJson([
    { k: 'op', v: 'import random' },
    { k: 'op', v: 'geheim = random.randint(1, 100)' },
    { k: 'def', v: 'hinweis(geraten, geheim)', body: [], ret: '"Zu klein"' },
    { k: 'out', v: 'hinweis(30, geheim)' },
  ]);
  const code = P.toText(baum);
  assert.equal(code, 'def hinweis(geraten, geheim):\n    return "Zu klein"\n\nimport random\ngeheim = random.randint(1, 100)\nprint(hinweis(30, geheim))');
  assert.equal(P.toText(P.parseCode(code, { erweitert: true }).nodes), code);
  assert.ok(P.svgAll(baum, { label: 'Test', minw: 1 }).includes('import random'), 'die Operation steht im Plan');
});
