/* Selbsttest Termin 05: Rechenkern der Bausteine byte, range und summe (site/assets/js/explorables-v05.js).
   Alle Erwartungswerte sind mit Python 3 nachgerechnet (Stellenwerttabelle, range, die vier Programmfassungen samt f"{x:.1f}"), nicht im Kopf.
   Das Verhalten im Browser (Tastatur, 44 px, Live-Ansage) prüft die Sichtprüfung an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V5 = lade('./explorables-v05.js');

/* ── byte ─────────────────────────────────────────────────── */
const BYTE = {
  0: { gruppen: '0000 0000', bit: '00000000', rest: [0, 0, 0, 0, 0, 0, 0, 0] },
  1: { gruppen: '0000 0001', bit: '00000001', rest: [1, 1, 1, 1, 1, 1, 1, 0] },
  45: { gruppen: '0010 1101', bit: '00101101', rest: [45, 45, 13, 13, 5, 1, 1, 0] },
  128: { gruppen: '1000 0000', bit: '10000000', rest: [0, 0, 0, 0, 0, 0, 0, 0] },
  166: { gruppen: '1010 0110', bit: '10100110', rest: [38, 38, 6, 6, 6, 2, 0, 0] },
  200: { gruppen: '1100 1000', bit: '11001000', rest: [72, 8, 8, 8, 0, 0, 0, 0] },
  255: { gruppen: '1111 1111', bit: '11111111', rest: [127, 63, 31, 15, 7, 3, 1, 0] }
};

test('byte: Bits, Vierergruppen und Reste der Stellenwerttabelle (Python)', () => {
  for (const [z, e] of Object.entries(BYTE)) {
    const n = Number(z), s = V5.stellenwertSchritte(n);
    assert.equal(V5.bits(n).join(''), e.bit, `bits ${z}`);
    assert.equal(V5.gruppen(V5.bits(n)), e.gruppen, `gruppen ${z}`);
    assert.equal(s.map((x) => x.bit).join(''), e.bit, `schritte ${z}`);
    assert.deepEqual(s.map((x) => x.rest), e.rest, `rest ${z}`);
    assert.equal(V5.wertVon(V5.bits(n)), n, `rueckweg ${z}`);
  }
  assert.deepEqual(V5.WERTE, [128, 64, 32, 16, 8, 4, 2, 1]);
});

test('byte: 45 ergibt 0010 1101 mit der Rechnung 32 + 8 + 4 + 1 = 45', () => {
  const a = V5.ansichtSchalter(V5.bits(45));
  assert.equal(a.wert, 45);
  assert.equal(a.gruppen, '0010 1101');
  assert.equal(a.rechnung, '32 + 8 + 4 + 1 = 45');
  assert.equal(a.satz, 'Byte 0010 1101. 32 + 8 + 4 + 1 = 45.');
  assert.equal(V5.rechnung(V5.bits(166)), '128 + 32 + 4 + 2 = 166');
  assert.equal(V5.rechnung(V5.bits(0)), 'Kein Schalter an: 0');
});

test('byte: Sätze der Schritte und der Weg von „Nächste Stelle“ für 45 und 200', () => {
  const s = V5.stellenwertSchritte(45);
  assert.equal(s[0].satz, 'Passt 128 in den Rest 45? Nein: Bit 0, Rest 45.');
  assert.equal(s[2].satz, 'Passt 32 in den Rest 45? Ja: Bit 1, Rest 13.');
  assert.equal(s[7].satz, 'Passt 1 in den Rest 1? Ja: Bit 1, Rest 0.');
  assert.equal(V5.ansichtZahl(45, 0).satz, 'Noch kein Schritt. Der Rest ist 45. Als Nächstes: Stellenwert 128.');
  const drei = V5.ansichtZahl(45, 3);
  assert.equal(drei.bits.join(''), '00100000');
  assert.equal(drei.rechnung, 'Bisher: 32 = 32');
  assert.equal(drei.satz, 'Passt 32 in den Rest 45? Ja: Bit 1, Rest 13. Als Nächstes: Stellenwert 16.');
  assert.ok(!drei.fertig);
  const fertig = V5.ansichtZahl(200, 8);
  assert.ok(fertig.fertig);
  assert.equal(fertig.gruppen, '1100 1000');
  assert.equal(fertig.rechnung, 'Probe: 128 + 64 + 8 = 200');
  assert.match(fertig.satz, /Fertig: 1100 1000\. Probe: 128 \+ 64 \+ 8 = 200\.$/);
  assert.equal(V5.ansichtZahl(255, 8).gruppen, '1111 1111');
});

test('byte: Eingabe prüft 0 bis 255, Leerzeichen zählen nicht, ab 256 die Meldung zum Byte', () => {
  assert.deepEqual(V5.pruefeEingabe('45'), { ok: true, zahl: 45 });
  assert.deepEqual(V5.pruefeEingabe(' 2 55 '), { ok: true, zahl: 255 });
  assert.deepEqual(V5.pruefeEingabe('0'), { ok: true, zahl: 0 });
  assert.equal(V5.pruefeEingabe('256').meldung, 'Ein Byte reicht von 0 bis 255.');
  assert.equal(V5.pruefeEingabe('1000').meldung, 'Ein Byte reicht von 0 bis 255.');
  for (const t of ['', 'abc', '-1', '4.5', '1e2']) assert.equal(V5.pruefeEingabe(t).meldung, 'Gib eine ganze Zahl von 0 bis 255 ein.', t);
});

test('byte: Beobachtungen zu 255 und 128 (127 + 1)', () => {
  assert.equal(V5.wertVon([1, 1, 1, 1, 1, 1, 1, 1]), 255);
  assert.match(V5.hinweis(255), /255, die größte Zahl eines Bytes\.$/);
  assert.equal(V5.wertVon([0, 1, 1, 1, 1, 1, 1, 1]), 127);
  assert.equal(V5.hinweis(128), 'Nur der linke Schalter an ergibt 128, eins mehr als alle sieben anderen zusammen (127).');
  assert.equal(V5.hinweis(45), '');
});

/* ── range ────────────────────────────────────────────────── */
test('range: range(3, 8) hat 5 Durchläufe, die Zahlen 3 bis 7, die Raute „i von 3 bis 7?“', () => {
  assert.deepEqual(V5.zahlenVon(3, 8), [3, 4, 5, 6, 7]);
  assert.equal(V5.durchlaeufe(3, 8), 5);
  assert.equal(V5.rechnungDurchlaeufe(3, 8), 'Durchläufe: 8 − 3 = 5');
  assert.equal(V5.forZeile(3, 8), 'for i in range(3, 8):');
  assert.equal(V5.rautenText(3, 8), 'i von 3 bis 7?');
  assert.equal(V5.rautenText(5, 2), 'gleich beim ersten Mal nein');
  assert.equal(V5.rautenText(3, 3), 'gleich beim ersten Mal nein');
  assert.deepEqual(V5.whileZeilen(3, 8), ['i = 3', 'while i <= 7:', '    # Rumpf', '    i = i + 1']);
  assert.equal(V5.kurzForm(3, 8), '');
});

test('range: Start 0 zeigt die Kurzform, Start nicht kleiner als Stopp läuft nie', () => {
  assert.equal(V5.kurzForm(0, 8), 'kurz: range(8)');
  assert.deepEqual(V5.zahlenVon(0, 8), [0, 1, 2, 3, 4, 5, 6, 7]);
  for (const [a, b] of [[5, 3], [4, 4], [0, 0]]) {
    assert.equal(V5.durchlaeufe(a, b), 0, `${a} ${b}`);
    assert.deepEqual(V5.zahlenVon(a, b), []);
    assert.equal(V5.rechnungDurchlaeufe(a, b), 'Durchläufe: 0');
    assert.match(V5.satzRange(a, b, 0), /Keine Zahl\. Der Rumpf läuft nie\.$/);
  }
  assert.equal(V5.durchlaeufe(5, 6), 1);
});

test('range: alle Einstellungen zählen wie len(range()) in Python', () => {
  /* Python: len(range(a, b)) für a in 0..5 und b in 0..10 ist max(0, b - a) */
  let summe = 0;
  for (let a = 0; a <= V5.START_MAX; a++) for (let b = 0; b <= V5.STOPP_MAX; b++) summe += V5.durchlaeufe(a, b);
  assert.equal(summe, 200);
});

test('range: Ansage nennt den Durchlauf, i, alle Zahlen und den Stoppwert', () => {
  assert.equal(V5.satzRange(3, 8, 0), 'for i in range(3, 8): 5 Durchläufe: 3, 4, 5, 6, 7. 8 gehört nicht dazu.');
  assert.equal(V5.satzRange(3, 8, 2), 'Durchlauf 2 von 5: i ist 4. for i in range(3, 8): 5 Durchläufe: 3, 4, 5, 6, 7. 8 gehört nicht dazu.');
  assert.match(V5.satzRange(4, 5, 0), /1 Durchlauf: 4\. 5 gehört nicht dazu\.$/);
});

/* ── summe ────────────────────────────────────────────────── */
function lauf(fassung, zaehlen = false, op = '>=', werte = [8, 10, 4, 8]) {
  return V5.lauf({ werte, fassung, zaehlen, op });
}

test('summe: richtig mit 8, 10, 4, 8 ergibt Summe 30 und Durchschnitt 7.5 (Python)', () => {
  const l = lauf('richtig');
  assert.equal(l.fehler, null);
  assert.equal(l.ende.summe, 30);
  assert.deepEqual(l.ende.ausgabe, ['Summe: 30, Durchschnitt: 7.5']);
  /* Zeilen: start, 4 × (for, eingabe, add), for am Ende, mittel, ausgabe */
  assert.equal(l.ereignisse.length, 1 + 12 + 1 + 2);
  assert.deepEqual(l.zeilen.map((z) => z.text), [
    'summe = 0', 'for i in range(1, 5):', 'punkte = int(input(f"Punkte Blatt {i}: "))', 'summe = summe + punkte',
    'mittel = summe / 4', 'print(f"Summe: {summe}, Durchschnitt: {mittel:.1f}")'
  ]);
  assert.deepEqual(l.zeilen.map((z) => z.ein), [0, 0, 1, 1, 0, 0]);
});

test('summe: Zeilenfolge der for-Schleife, die for-Zeile kommt auch einmal am Ende', () => {
  const l = lauf('richtig');
  assert.deepEqual(l.ereignisse.map((e) => e.zeile + 1), [1, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 5, 6]);
  const letztesFor = l.ereignisse[13];
  assert.equal(letztesFor.zeile, 1);
  assert.equal(letztesFor.nachher.i, 4);
  assert.match(letztesFor.satz, /Weg nein.* i bleibt 4\.$/);
  assert.deepEqual(l.ereignisse.filter((e) => e.id === 'add').map((e) => e.nachher.summe), [8, 18, 22, 30]);
});

test('summe: „Startwert fehlt“ endet mit NameError ohne Python, schon im ersten Durchlauf', () => {
  const l = lauf('startfehlt');
  assert.equal(l.fehler, "NameError: name 'summe' is not defined");
  assert.equal(V5.NAME_ERROR, "NameError: name 'summe' is not defined");
  assert.deepEqual(l.ereignisse.map((e) => e.zeile + 1), [1, 2, 3]);
  assert.equal(l.ereignisse[2].id, 'add');
  assert.equal(l.ende.summe, null);
  assert.deepEqual(l.ende.ausgabe, []);
  assert.ok(!l.zeilen.some((z) => z.text === 'summe = 0'));
  assert.match(V5.satzSumme(l, 3), /^Zeile 3: summe hat noch keinen Wert\./);
});

test('summe: „Startwert im Rumpf“ endet mit Summe 8 und Durchschnitt 2.0', () => {
  const l = lauf('startimrumpf');
  assert.equal(l.fehler, null);
  assert.equal(l.ende.summe, 8);
  assert.deepEqual(l.ende.ausgabe, ['Summe: 8, Durchschnitt: 2.0']);
  assert.deepEqual(l.zeilen.map((z) => [z.text, z.ein]).slice(0, 4), [['for i in range(1, 5):', 0], ['summe = 0', 1], ['punkte = int(input(f"Punkte Blatt {i}: "))', 1], ['summe = summe + punkte', 1]]);
});

test('summe: „Ausgabe im Rumpf“ gibt vier Zwischenzeilen aus (Python)', () => {
  const l = lauf('ausgabeimrumpf');
  assert.equal(l.fehler, null);
  assert.deepEqual(l.ende.ausgabe, [
    'Summe: 8, Durchschnitt: 2.0', 'Summe: 18, Durchschnitt: 4.5', 'Summe: 22, Durchschnitt: 5.5', 'Summe: 30, Durchschnitt: 7.5'
  ]);
  assert.equal(l.ende.summe, 30);
  /* print und mittel stehen eingerückt im Rumpf */
  const druck = l.zeilen.find((z) => z.id === 'ausgabe');
  assert.equal(druck.ein, 1);
});

test('summe: mitzählen mit >= ergibt 3, mit > ergibt 1 (Python)', () => {
  for (const fassung of ['richtig', 'startimrumpf', 'ausgabeimrumpf']) {
    assert.equal(lauf(fassung, true, '>=').ende.anzahl, 3, fassung);
    assert.equal(lauf(fassung, true, '>').ende.anzahl, 1, fassung);
  }
  const l = lauf('richtig', true, '>=');
  assert.deepEqual(l.ende.ausgabe, ['Summe: 30, Durchschnitt: 7.5', 'Blätter mit mindestens 8 Punkten: 3']);
  assert.deepEqual(lauf('richtig', true, '>').ende.ausgabe, ['Summe: 30, Durchschnitt: 7.5', 'Blätter mit mindestens 8 Punkten: 1']);
  assert.deepEqual(lauf('richtig', false).ende.anzahl, null);
  /* ohne Startwert bleibt anzahl trotzdem 0, der Fehler kommt von summe */
  const f = lauf('startfehlt', true, '>=');
  assert.equal(f.fehler, V5.NAME_ERROR);
  assert.equal(f.ende.anzahl, 0);
});

test('summe: das Programm mit if hat die zweite Einrückungsstufe, ohne else', () => {
  const p = V5.programm({ fassung: 'richtig', zaehlen: true, op: '>' });
  const zeilen = p.zeilen.map((z) => '    '.repeat(z.ein) + z.text);
  assert.deepEqual(zeilen, [
    'summe = 0', 'anzahl = 0', 'for i in range(1, 5):', '    punkte = int(input(f"Punkte Blatt {i}: "))', '    summe = summe + punkte',
    '    if punkte > 8:', '        anzahl = anzahl + 1', 'mittel = summe / 4', 'print(f"Summe: {summe}, Durchschnitt: {mittel:.1f}")',
    'print(f"Blätter mit mindestens 8 Punkten: {anzahl}")'
  ]);
  assert.ok(!zeilen.some((t) => /else/.test(t)));
});

test('summe: if-Zeile gibt bei „nein“ keinen anzahl-Schritt, bei „ja“ zwei Zeilen', () => {
  const l = lauf('richtig', true, '>=');
  const ifs = l.ereignisse.filter((e) => e.id === 'if'), zaehl = l.ereignisse.filter((e) => e.id === 'anzahl+');
  assert.equal(ifs.length, 4);
  assert.equal(zaehl.length, 3);
  assert.match(ifs[2].satz, /^4 >= 8 ist falsch: Weg nein/);
  assert.match(ifs[0].satz, /^8 >= 8 ist wahr: Weg ja/);
  assert.deepEqual(zaehl.map((e) => e.nachher.anzahl), [1, 2, 3]);
});

test('summe: Durchschnitt wie f"{x:.1f}" in Python, auch bei Gleichstand (7.25 wird 7.2, 7.75 wird 7.8)', () => {
  /* Python: [f"{s/4:.1f}" for s in range(41)] */
  const python = ['0.0', '0.2', '0.5', '0.8', '1.0', '1.2', '1.5', '1.8', '2.0', '2.2', '2.5', '2.8', '3.0', '3.2', '3.5', '3.8', '4.0', '4.2', '4.5', '4.8', '5.0', '5.2', '5.5', '5.8', '6.0', '6.2', '6.5', '6.8', '7.0', '7.2', '7.5', '7.8', '8.0', '8.2', '8.5', '8.8', '9.0', '9.2', '9.5', '9.8', '10.0'];
  assert.deepEqual(python.map((_, s) => V5.eineStelle(s)), python);
  assert.deepEqual([0, 8, 18, 22, 29, 30, 31].map(V5.mittelText), ['0.0', '2.0', '4.5', '5.5', '7.25', '7.5', '7.75']);
  const l = lauf('richtig', false, '>=', [10, 10, 5, 4]);
  assert.deepEqual(l.ende.ausgabe, ['Summe: 29, Durchschnitt: 7.2']);
});

test('summe: Zustand und Ansage nach p Zeilen, Zustand ist unveränderlich', () => {
  const l = lauf('richtig');
  assert.deepEqual(V5.zustandNach(l, 0), { i: null, punkte: null, summe: null, anzahl: null, ausgabe: [] });
  assert.equal(V5.satzSumme(l, 0), 'Noch keine Zeile ausgeführt.');
  assert.equal(V5.satzSumme(l, 1), 'Zeile 1: summe wird 0.');
  assert.equal(V5.satzSumme(l, 4), 'Zeile 4: summe wird 0 + 8 = 8.');
  const z = V5.zustandNach(l, 4);
  assert.deepEqual([z.i, z.punkte, z.summe], [1, 8, 8]);
  z.ausgabe.push('x');
  assert.deepEqual(V5.zustandNach(l, l.ereignisse.length).ausgabe, ['Summe: 30, Durchschnitt: 7.5']);
  assert.match(V5.satzSumme(l, l.ereignisse.length), /Das Programm ist zu Ende\.$/);
  assert.match(V5.satzSumme(l, 3), /^Zeile 3: Eingabe 8 für „Punkte Blatt 1:“\. punkte wird 8\.$/);
});

test('summe: jede Fassung hat vier Auswahlpunkte und die Voreinstellung 8, 10, 4, 8 mit >=', () => {
  assert.deepEqual(V5.FASSUNGEN.map((f) => f.text), ['richtig', 'Startwert fehlt', 'Startwert im Rumpf', 'Ausgabe im Rumpf']);
  assert.deepEqual(V5.standard(), { werte: [8, 10, 4, 8], fassung: 'richtig', zaehlen: false, op: '>=' });
  assert.deepEqual(V5.VERGLEICHE, ['>=', '>']);
});

test('Texte der Bausteine enthalten keinen Gedankenstrich als Satzzeichen', () => {
  const alle = [
    V5.stellenwertSchritte(45).map((s) => s.satz), V5.ansichtZahl(45, 5).satz, V5.ansichtZahl(45, 8).satz, V5.hinweis(128), V5.hinweis(255),
    V5.pruefeEingabe('300').meldung, V5.KEINE_ZAHL, V5.satzRange(3, 8, 2),
    ...['richtig', 'startfehlt', 'startimrumpf', 'ausgabeimrumpf'].flatMap((f) => lauf(f, true).ereignisse.map((e) => e.satz))
  ].flat();
  for (const t of alle) assert.ok(!/[–—]|\s-\s/.test(t), t);
});

/* ── trace-Schalter leerzeichen: false (Vergleich in aufgaben.js) ─────────── */
test('trace: leerzeichen: false vergleicht ohne Leerraum, Anführungszeichen werden weiter normalisiert', async () => {
  const fs = await import('node:fs');
  const quelle = fs.readFileSync(path.join(SITE, 'assets', 'js', 'aufgaben.js'), 'utf8');
  const hole = (name) => { const a = quelle.indexOf('function ' + name + '('); return quelle.slice(a, quelle.indexOf(String.fromCharCode(10), a)); };
  const f = new Function(`${hole('normVal')}\n${hole('normOut')}\n${hole('gleichOhneLeer')}
    return { gleichWert: (a, b) => gleichOhneLeer(normVal(a), normVal(b)), gleichAus: (a, b) => gleichOhneLeer(normOut(a), normOut(b)) };`)();
  assert.equal(f.gleichWert('0010 1101', '00101101'), true);
  assert.equal(f.gleichWert(' 0010  1101 ', '0010 1101'), true);
  assert.equal(f.gleichWert('0010 1100', '0010 1101'), false);
  assert.equal(f.gleichWert('0010 110', '0010 1101'), false);
  assert.equal(f.gleichWert('"a"', "'a'"), true);
  assert.equal(f.gleichAus('1\n2\n', '1 2'), true);
});
