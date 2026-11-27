/* Selbsttest Termin 09: Rechenkern der Bausteine bauteile, zerlegen und spielzeug (site/assets/js/explorables-v09.js).
   Die Ausgaben von zerlegen stammen aus einem Lauf mit Python 3.13: beide Programmtexte des Bausteins (langes und zerlegtes Programm, aus dem Baustein
   gelesen) wurden für alle 33 Eingaben (3 Getränke mal 11 Geldbeträge in halben Euro) mit input() ausgeführt und gaben dasselbe aus.
   Spielzeug-Rechner: Beispielprogramm ergibt C gleich 8 nach 12 Takten, Vermutungsprogramm B gleich 8 und D gleich 16 nach 18 Takten (nachgerechnet).
   Das Verhalten im Browser (Tastatur, Ansagen, keine Lösung im Ausgangszustand) prüft pruefe-v09.mjs an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V9 = lade('./explorables-v09.js');
const keinStrich = (s) => assert.ok(!/[–—]/.test(s), 'kein Gedankenstrich: ' + s);

/* Python 3.13: [Getränk, Geld, Ausgabe beider Programme] */
const PYTHON_AUSGABEN = [
  [1, 0, "Es fehlen 2.50 Euro"],
  [1, 0.5, "Es fehlen 2.00 Euro"],
  [1, 1, "Es fehlen 1.50 Euro"],
  [1, 1.5, "Es fehlen 1.00 Euro"],
  [1, 2, "Es fehlen 0.50 Euro"],
  [1, 2.5, "Bitte sehr. Wechselgeld: 0.00 Euro"],
  [1, 3, "Bitte sehr. Wechselgeld: 0.50 Euro"],
  [1, 3.5, "Bitte sehr. Wechselgeld: 1.00 Euro"],
  [1, 4, "Bitte sehr. Wechselgeld: 1.50 Euro"],
  [1, 4.5, "Bitte sehr. Wechselgeld: 2.00 Euro"],
  [1, 5, "Bitte sehr. Wechselgeld: 2.50 Euro"],
  [2, 0, "Es fehlen 1.00 Euro"],
  [2, 0.5, "Es fehlen 0.50 Euro"],
  [2, 1, "Bitte sehr. Wechselgeld: 0.00 Euro"],
  [2, 1.5, "Bitte sehr. Wechselgeld: 0.50 Euro"],
  [2, 2, "Bitte sehr. Wechselgeld: 1.00 Euro"],
  [2, 2.5, "Bitte sehr. Wechselgeld: 1.50 Euro"],
  [2, 3, "Bitte sehr. Wechselgeld: 2.00 Euro"],
  [2, 3.5, "Bitte sehr. Wechselgeld: 2.50 Euro"],
  [2, 4, "Bitte sehr. Wechselgeld: 3.00 Euro"],
  [2, 4.5, "Bitte sehr. Wechselgeld: 3.50 Euro"],
  [2, 5, "Bitte sehr. Wechselgeld: 4.00 Euro"],
  [3, 0, "Es fehlen 2.00 Euro"],
  [3, 0.5, "Es fehlen 1.50 Euro"],
  [3, 1, "Es fehlen 1.00 Euro"],
  [3, 1.5, "Es fehlen 0.50 Euro"],
  [3, 2, "Bitte sehr. Wechselgeld: 0.00 Euro"],
  [3, 2.5, "Bitte sehr. Wechselgeld: 0.50 Euro"],
  [3, 3, "Bitte sehr. Wechselgeld: 1.00 Euro"],
  [3, 3.5, "Bitte sehr. Wechselgeld: 1.50 Euro"],
  [3, 4, "Bitte sehr. Wechselgeld: 2.00 Euro"],
  [3, 4.5, "Bitte sehr. Wechselgeld: 2.50 Euro"],
  [3, 5, "Bitte sehr. Wechselgeld: 3.00 Euro"]
];

/* ── bauteile ── */
test('bauteile: Ausgangszustand hat Level 3 auf der SSD und Level 5 im Arbeitsspeicher', () => {
  const z = V9.startBau();
  assert.equal(V9.ssdText(z), 'Spielstand: Level 3');
  assert.equal(V9.ramText(z), 'Spiel läuft: Level 5');
  assert.ok(V9.laeuft(z));
  for (const w of ['flüchtig', 'dauerhaft', 'verschwind']) {
    assert.ok(!V9.ssdText(z).includes(w) && !V9.ramText(z).includes(w));
  }
});

test('bauteile: Strom aus leert nur den Arbeitsspeicher', () => {
  const z = V9.stromAus(V9.startBau());
  assert.equal(z.ram, null);
  assert.equal(z.ssd, 3);
  assert.equal(V9.ramText(z), 'leer');
  assert.ok(!V9.laeuft(z));
  const r = V9.anwenden(V9.startBau(), 'strom_aus');
  assert.deepEqual(r.zustand, { ssd: 3, ram: null });
  assert.match(r.satz, /Die SSD zeigt weiter: Spielstand: Level 3\./);
});

test('bauteile: ohne Speichern startet das Spiel nach Strom aus bei Level 3, mit Speichern bei Level 5', () => {
  let z = V9.anwenden(V9.startBau(), 'strom_aus').zustand;
  z = V9.anwenden(z, 'starten').zustand;
  assert.equal(z.ram, 3);
  assert.equal(z.ssd, 3);
  let y = V9.anwenden(V9.startBau(), 'speichern').zustand;
  assert.deepEqual(y, { ssd: 5, ram: 5 });
  y = V9.anwenden(y, 'strom_aus').zustand;
  assert.deepEqual(y, { ssd: 5, ram: null });
  y = V9.anwenden(y, 'starten').zustand;
  assert.deepEqual(y, { ssd: 5, ram: 5 });
});

test('bauteile: Speichern ändert die SSD, Taste, Rechnen und Ergebnis ändern nichts', () => {
  const z0 = V9.startBau();
  for (const id of ['taste', 'rechnen', 'ergebnis']) {
    const r = V9.anwenden(z0, id);
    assert.deepEqual(r.zustand, z0, id);
    assert.equal(r.geaendert, false);
  }
  const s = V9.anwenden(z0, 'speichern');
  assert.equal(s.geaendert, true);
  assert.equal(s.zustand.ssd, 5);
  assert.equal(s.zustand.ram, 5);
  assert.equal(z0.ssd, 3, 'der alte Zustand bleibt unverändert');
});

test('bauteile: beteiligte Bauteile und Richtungen am Bus', () => {
  const z = V9.startBau();
  const kanten = (id) => V9.anwenden(z, id).kanten.map((k) => k.box + ':' + k.richtung).join(',');
  assert.deepEqual(V9.anwenden(z, 'taste').boxen, ['ea', 'prozessor']);
  assert.equal(kanten('taste'), 'ea:zum_bus,prozessor:vom_bus');
  assert.deepEqual(V9.anwenden(z, 'rechnen').boxen, ['prozessor', 'ram']);
  assert.equal(kanten('rechnen'), 'prozessor:beide,ram:beide');
  assert.deepEqual(V9.anwenden(z, 'ergebnis').boxen, ['prozessor', 'ram', 'ea']);
  assert.equal(kanten('ergebnis'), 'prozessor:zum_bus,ram:vom_bus,ea:vom_bus');
  assert.deepEqual(V9.anwenden(z, 'starten').boxen, ['ssd', 'ram']);
  assert.deepEqual(V9.anwenden(z, 'starten').zustand, z, 'der laufende Zustand ändert sich nicht');
  assert.deepEqual(V9.anwenden(z, 'speichern').boxen, ['ram', 'ssd']);
  assert.equal(kanten('speichern'), 'ram:zum_bus,ssd:vom_bus');
  const aus = V9.anwenden(V9.stromAus(z), 'starten');
  assert.deepEqual(aus.boxen, ['ssd', 'ram']);
  assert.equal(aus.kanten.map((k) => k.box + ':' + k.richtung).join(','), 'ssd:zum_bus,ram:vom_bus');
  assert.match(aus.satz, /Das Spiel wird von der SSD in den Arbeitsspeicher geladen\./);
});

test('bauteile: bei ausgeschaltetem Rechner tun die übrigen Knöpfe nichts', () => {
  const z = V9.stromAus(V9.startBau());
  for (const id of ['taste', 'rechnen', 'ergebnis', 'speichern']) {
    const r = V9.anwenden(z, id);
    assert.deepEqual(r.zustand, z, id);
    assert.deepEqual(r.boxen, []);
    assert.equal(r.satz, V9.MELDUNG_AUS);
  }
  assert.equal(V9.SZENARIEN.length, 6);
  assert.deepEqual(V9.SZENARIEN.map((s) => s.knopf), ['Spiel starten', 'Taste drücken', 'Rechnen', 'Ergebnis zeigen', 'Spielstand speichern', 'Strom aus']);
});

test('bauteile: keine Gedankenstriche in den Sätzen', () => {
  for (const z of [V9.startBau(), V9.stromAus(V9.startBau())]) {
    for (const s of V9.SZENARIEN) keinStrich(V9.anwenden(z, s.id).satz);
  }
  keinStrich(V9.MELDUNG_AUS);
});

/* ── zerlegen ── */
test('zerlegen: beide Programme geben für alle 33 Eingaben die Ausgabe von Python', () => {
  assert.equal(PYTHON_AUSGABEN.length, 33);
  for (const [w, g, text] of PYTHON_AUSGABEN) {
    assert.equal(V9.ausgabeLang(w, g), text, `lang ${w} ${g}`);
    assert.equal(V9.ausgabeZerlegt(w, g), text, `zerlegt ${w} ${g}`);
  }
  assert.equal(V9.ausgabeLang(3, 1.5), 'Es fehlen 0.50 Euro');
  assert.equal(V9.ausgabeZerlegt(3, 1.5), 'Es fehlen 0.50 Euro');
  assert.equal(V9.ausgabeZerlegt(1, 3), 'Bitte sehr. Wechselgeld: 0.50 Euro');
  assert.equal(V9.ausgabeZerlegt(2, 1), 'Bitte sehr. Wechselgeld: 0.00 Euro');
  assert.equal(V9.GETRAENKE.length * V9.GELD_WERTE.length, 33);
});

test('zerlegen: das lange Programm hat 14 Zeilen, das Hauptprogramm 4, alle drei Gruppen kommen vor', () => {
  assert.equal(V9.anzahlCode(V9.LANG), 14);
  assert.equal(V9.hauptZeilen(), 4);
  assert.equal(V9.anzahlCode(V9.ZERLEGT), 18);
  assert.deepEqual([...new Set(V9.LANG.map((z) => z.gruppe))].sort(), ['antwort', 'eingabe', 'preis']);
  assert.equal(V9.LANG.filter((z) => z.gruppe === 'eingabe').length, 2);
  assert.equal(V9.LANG.filter((z) => z.gruppe === 'preis').length, 6);
  assert.equal(V9.LANG.filter((z) => z.gruppe === 'antwort').length, 6);
  assert.deepEqual(V9.ZERLEGT.filter((z) => z.teil === 'haupt').map((z) => z.text), [
    'wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))', 'geld = float(input("Geld in Euro: "))', 'preis = preis_von(wahl)', 'print(antwort(geld, preis))'
  ]);
  assert.equal(V9.einr(V9.LANG[3]), '    preis = 2.5');
  assert.equal(V9.einr(V9.ZERLEGT[2]), '        return 2.5');
});

test('zerlegen: der Ablauf springt in die Funktion und kommt zurück', () => {
  const lauf = (w, g) => V9.ablauf(w, g).map((s) => s.zeile);
  /* Zeilenindizes in ZERLEGT: 16 wahl, 17 geld, 18 preis_von-Aufruf, 19 print; 1 bis 6 in preis_von, 9 bis 14 in antwort */
  assert.deepEqual(lauf(1, 3), [16, 17, 18, 1, 2, 18, 19, 9, 10, 11, 19]);
  assert.deepEqual(lauf(2, 1.5), [16, 17, 18, 1, 3, 4, 18, 19, 9, 10, 11, 19]);
  assert.deepEqual(lauf(3, 1.5), [16, 17, 18, 1, 3, 6, 18, 19, 9, 13, 14, 19]);
  for (const w of [1, 2, 3]) {
    for (const g of V9.GELD_WERTE) {
      for (const s of V9.ablauf(w, g)) {
        assert.ok(!V9.ZERLEGT[s.zeile].leer, 'keine Leerzeile');
        assert.equal(s.wo, V9.ZERLEGT[s.zeile].teil);
        keinStrich(s.satz);
      }
    }
  }
  const a = V9.ablauf(3, 1.5);
  assert.equal(V9.satzAblauf(a, 0), 'Als Nächstes: Hauptprogramm: wahl wird eingelesen.');
  assert.equal(V9.satzAblauf(a, a.length), 'Das Programm ist zu Ende.');
  assert.equal(V9.eingabeText(3, 1.5), 'Eingabe: Getränk 3, Geld 1.5 Euro');
  assert.equal(V9.pyFloat(3), '3.0');
});

/* ── spielzeug ── */
function bisEnde(id) { return V9.laufen(V9.neuSpielzeug(id)); }

test('spielzeug: Beispielprogramm ergibt C gleich 8 nach 12 Takten', () => {
  const z = bisEnde('beispiel');
  assert.deepEqual(z.zellen, { A: 5, B: 3, C: 8, D: 0 });
  assert.equal(z.platz, 8);
  assert.equal(z.takte, 12);
  assert.ok(z.halt);
  assert.match(V9.schlussSatz(z), /c = a \+ b/);
});

test('spielzeug: Vermutungsprogramm ergibt B gleich 8 und D gleich 16 nach 18 Takten', () => {
  const z = bisEnde('vermutung');
  assert.deepEqual(z.zellen, { A: 4, B: 8, C: 0, D: 16 });
  assert.equal(z.platz, 16);
  assert.equal(z.takte, 18);
  assert.ok(z.halt);
});

test('spielzeug: Ausgangszustand ohne Zwischenergebnis und ohne Ergebniszelle', () => {
  for (const id of V9.PROGRAMM_IDS) {
    const z = V9.neuSpielzeug(id);
    assert.equal(z.platz, 0);
    assert.equal(z.takte, 0);
    assert.equal(z.geholt, '');
    assert.equal(z.pc, 0);
    assert.equal(z.phase, -1);
    assert.equal(z.halt, false);
    assert.deepEqual(z.zellen, V9.PROGRAMME[id].zellen);
    assert.equal(V9.schlussSatz(z), '');
  }
  assert.deepEqual(V9.PROGRAMME.beispiel.zellen, { A: 5, B: 3, C: 0, D: 0 });
  assert.deepEqual(V9.PROGRAMME.vermutung.zellen, { A: 4, B: 0, C: 0, D: 0 });
  assert.equal(V9.PROGRAMME.beispiel.zeilen.length, 4);
  assert.equal(V9.PROGRAMME.vermutung.zeilen.length, 6);
});

test('spielzeug: ein Befehl braucht drei Takte (holen, entschlüsseln, ausführen), auch STOPP', () => {
  const z = V9.neuSpielzeug('beispiel');
  let r = V9.takt(z);
  assert.equal(r.zustand.phase, 0);
  assert.equal(r.zustand.geholt, 'LADE A');
  assert.equal(r.zustand.pc, 1, 'der Pfeil rückt beim Holen weiter');
  assert.equal(r.zustand.aktiv, 0);
  assert.equal(r.zustand.platz, 0, 'beim Holen ändert sich der Rechenplatz nicht');
  assert.equal(r.satz, 'Takt 1, holen: Der Prozessor holt den Befehl LADE A.');
  assert.equal(z.takte, 0, 'der alte Zustand bleibt unverändert');
  r = V9.takt(r.zustand);
  assert.equal(r.zustand.phase, 1);
  assert.equal(r.zustand.platz, 0);
  assert.equal(r.satz, 'Takt 2, entschlüsseln: LADE A heißt: Der Rechenplatz bekommt den Wert der Zelle A.');
  r = V9.takt(r.zustand);
  assert.equal(r.zustand.phase, 2);
  assert.equal(r.zustand.platz, 5);
  assert.equal(r.zustand.takte, 3);
  assert.equal(r.satz, 'Takt 3, ausführen: Der Rechenplatz bekommt 5.');
  /* Ein Befehl: von der Mitte aus zu Ende */
  const m = V9.takt(r.zustand).zustand;
  const b = V9.befehl(m);
  assert.equal(b.zustand.phase, 2);
  assert.equal(b.zustand.takte, 6);
  assert.equal(b.zustand.platz, 8);
  /* STOPP */
  let s = V9.neuSpielzeug('beispiel');
  for (let i = 0; i < 9; i++) s = V9.takt(s).zustand;
  assert.equal(s.halt, false);
  assert.equal(s.takte, 9);
  s = V9.befehl(s).zustand;
  assert.equal(s.takte, 12);
  assert.ok(s.halt);
  assert.equal(s.pc, 4);
  const nach = V9.takt(s);
  assert.equal(nach.getan, false);
  assert.equal(nach.zustand, s);
  assert.equal(V9.befehl(s).getan, false);
});

test('spielzeug: der Rechenplatz hält Zwischenergebnisse, die Zellen nur, was SPEICHERE schreibt', () => {
  let z = V9.neuSpielzeug('vermutung');
  const verlauf = [];
  for (let i = 0; i < 6; i++) { z = V9.befehl(z).zustand; verlauf.push([z.platz, z.zellen.B, z.zellen.D]); }
  assert.deepEqual(verlauf, [[4, 0, 0], [8, 0, 0], [8, 8, 0], [16, 8, 0], [16, 8, 16], [16, 8, 16]]);
});

test('spielzeug: Sätze ohne Gedankenstrich und ohne Umrechnung in Sekunden', () => {
  for (const id of V9.PROGRAMM_IDS) {
    let z = V9.neuSpielzeug(id);
    while (!z.halt) { const r = V9.takt(z); keinStrich(r.satz); assert.ok(!/Sekunde/.test(r.satz)); z = r.zustand; }
    keinStrich(V9.schlussSatz(z));
    keinStrich(V9.takt(z).satz);
  }
  assert.equal(V9.TAKTE_PRO_BEFEHL, 3);
});
