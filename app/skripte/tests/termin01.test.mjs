/* Selbsttest Termin 01 (npm run selbsttest): Rechenkern der interaktiven Bausteine
   (site/assets/js/explorables-v01.js) und die Seiten selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';
import { zerlege } from '../../src/lib/quelle.mjs';

const K = createRequire(path.join(SITE, 'assets', 'js', 'x.js'))('./explorables-v01.js');

test('Trinkgeld-Rechner: 10 Prozent von 40 Euro', () => {
  assert.equal(K.trinkgeld(40, 10), 4);
  assert.equal(K.gesamt(40, 10), 44);
  assert.equal(K.gesamt(40, 20), 48, 'doppeltes Trinkgeld verdoppelt nicht den Gesamtbetrag');
  assert.equal(K.euro(44.5), '44,50');
  assert.equal(K.zahl(4), '4');
  assert.equal(K.zahl(2.5), '2,5');
});

test('Plan Schritt für Schritt: sieben Schritte, Werte in der Reihenfolge des Plans', () => {
  const s = K.planSchritte(40, 10);
  assert.deepEqual(s.map((x) => x.id), ['s', 'e1', 'e2', 'r1', 'r2', 'a1', 'e']);
  assert.deepEqual(s.filter((x) => x.setze).map((x) => x.setze), [['betrag', 40], ['prozent', 10], ['trinkgeld', 4], ['gesamt', 44]]);
  assert.deepEqual(s.map((x) => x.art), ['grenze', 'ein', 'ein', 'tun', 'tun', 'aus', 'grenze']);
});

test('Schachteln: erst rechts ausrechnen, dann links ablegen; die andere Schachtel bleibt', () => {
  const z = (code) => K.ZUWEISUNGEN.find((x) => x.code === code);
  let w = { a: undefined, b: undefined };
  assert.match(K.zuweisen(w, z('b = a')).fehler, /NameError/, 'b = a geht nicht, solange a leer ist');
  w = K.zuweisen(w, z('a = 5')).werte;
  w = K.zuweisen(w, z('b = a')).werte;
  w = K.zuweisen(w, z('a = a + 1')).werte;
  assert.deepEqual(w, { a: 6, b: 5 });
  w = K.zuweisen(w, z('b = b * 2')).werte;
  assert.deepEqual(w, { a: 6, b: 10 });
});

test('Seiten von Termin 01: fünf Abschnitte, drei Bausteine, Quiz ohne Nummern im Titel, Labor mit Teil A und B', () => {
  const le = zerlege('lektionen/v01-ablauf-und-erste-programme.html', { videoBasis: '' }).inhalt;
  assert.equal((le.match(/class="k-section" id=/g) || []).length, 5);
  for (const n of ['eva', 'papschritt', 'schachteln']) assert.ok(le.includes(`data-explorable="${n}"`), n);
  const titel = [...le.matchAll(/class="k-q__title">([^<]*)</g)].map((m) => m[1]);
  assert.equal(titel.length, 6);
  for (const t of titel) assert.doesNotMatch(t, /^(T|Frage)\s*\d/, 'Fragen werden gemischt: keine Nummer im Titel');
  assert.doesNotMatch(le, /Wissens-Ampel|k-ampel/, 'die Wissens-Ampel entfällt');
  const lab = zerlege('lektionen/v01-labor.html', { videoBasis: '' }).inhalt;
  assert.equal((lab.match(/data-part="A"/g) || []).length, 8);
  assert.equal((lab.match(/data-part="B"/g) || []).length, 6);
  assert.ok(/id="a-werkzeugkasten"[\s\S]*id="lab-toolbox"/.test(lab), 'Werkzeugkasten in der ersten Station');
  assert.equal((lab.match(/class="pap-wrap"/g) || []).length, 5, 'Pläne zu Beispiel, Zeilen ordnen, eigener Aufgabe und zwei Trainingsaufgaben');
});
