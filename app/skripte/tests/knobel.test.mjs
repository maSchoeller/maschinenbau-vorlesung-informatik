/* Selbsttest Knobelaufgaben (freiwillig, Teil K; Regeln: docs/app/INHALTE.md, Abschnitt „Knobelaufgaben“):
   - Baustein <Knobel>: Aufbau, fester Satz, Kennzeichnung data-knobel an Station und Aufgabe, Fehler bei falscher Schreibweise.
   - index-bauen: Knobel-Station hat pruefbar [] und keine Zeitangaben; ihre Kennungen stehen in knobel (und in ids für den Tutor).
   - kern.js (Fortschritt, Heute, Lernpfad): gelöste oder begonnene Knobelaufgaben ändern weder Zählung noch Status.
   Die Rechenregeln der Kursübersicht für Dozierende: api/tests/knobel.test.js. Das Verhalten im Browser: pruefe-seiten.mjs. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parse } from 'node-html-parser';
import { mdxZuHtml } from '../../src/lib/mdx/kompilieren.mjs';
import { KNOBEL_SATZ } from '../../src/lib/mdx/bausteine.mjs';
import { stationDaten } from '../index-bauen.mjs';
import { APP } from '../../src/lib/pfade.mjs';

const TASCHE = '<Station id="a-w" titel="Werkzeug" teil="A" min="5">\n\n<Werkzeugkasten>\n\n</Werkzeugkasten>\n\n</Station>\n\n';
const PFLICHT = '<Station id="a-1" titel="Plan" teil="A" sterne="1" min="8">\n\n<Aufgabe art="code" id="w-1" titel="Plan">\n\n</Aufgabe>\n\n</Station>\n\n'
  + '<Station id="t-1" titel="Training" teil="B" sterne="2" min="6">\n\n<Aufgabe art="code" id="tr-1" titel="Training">\n\n</Aufgabe>\n\n</Station>\n\n';
const KNOBEL1 = '<Knobel id="kn-1" titel="Der kürzeste Weg">\n\nAufgabentext.\n\n<Aufgabe art="code" id="k-1" titel="Der kürzeste Weg">\n\n</Aufgabe>\n\n</Knobel>\n\n';
const KNOBEL2 = '<Knobel id="kn-2" titel="Zahlenrätsel">\n\n<Aufgabe art="code" id="k-2" titel="Zahlenrätsel">\n\n</Aufgabe>\n\n</Knobel>\n\n';
const labor = (...teile) => mdxZuHtml('<Labor nr="V99" name="Termin 99" lerneinheit="x.html">\n\n' + teile.join('') + '</Labor>\n');

test('Knobel: Station mit Teil K, Kennzeichnung, festem Satz und ohne Zeitangaben', () => {
  const dom = parse(labor(TASCHE, PFLICHT, KNOBEL1, KNOBEL2));
  const k = dom.querySelectorAll('section.l-task').filter((s) => s.getAttribute('data-part') === 'K');
  assert.deepEqual(k.map((s) => s.getAttribute('id')), ['kn-1', 'kn-2']);
  for (const s of k) {
    assert.ok(s.hasAttribute('data-knobel'), 'Station trägt data-knobel');
    assert.ok(s.classList.contains('l-task--knobel'));
    assert.equal(s.getAttribute('data-min'), undefined);
    assert.equal(s.getAttribute('data-stars'), undefined);
    assert.equal(s.querySelector('.l-task__knobel').textContent, KNOBEL_SATZ);
    assert.ok(s.querySelector('[data-a][data-id]').hasAttribute('data-knobel'), 'Aufgabe trägt data-knobel');
    assert.equal(s.querySelectorAll('[data-a][data-id]').length, 1);
  }
  assert.deepEqual(k.map((s) => s.querySelector('[data-a]').getAttribute('data-id')), ['k-1', 'k-2']);
  const pflicht = dom.querySelectorAll('section.l-task').filter((s) => s.getAttribute('data-part') !== 'K');
  for (const s of pflicht) assert.ok(!s.hasAttribute('data-knobel'), 'Pflichtstationen bleiben unmarkiert');
  assert.equal(dom.querySelectorAll('[data-a][data-knobel]').length, 2);
});

test('Knobel: der feste Satz ist freundlich, ohne Ausrufezeichen und ohne Wertung', () => {
  assert.match(KNOBEL_SATZ, /Zugabe/);
  assert.match(KNOBEL_SATZ, /zählen nicht/);
  assert.match(KNOBEL_SATZ, /Klausur/);
  assert.match(KNOBEL_SATZ, /fehlt dir nichts/);
  assert.doesNotMatch(KNOBEL_SATZ, /!/);
  assert.doesNotMatch(KNOBEL_SATZ, /Profi|Beste|Elite|Genie|schwer|Pflicht/i);
});

test('Knobel: falsche Schreibweise bricht den Build ab', () => {
  const k = (kopf, inhalt) => `<Knobel ${kopf}>\n\n${inhalt}\n\n</Knobel>\n\n`;
  const aufgabe = (id, mehr = '') => `<Aufgabe art="code" id="${id}"${mehr}>\n\n</Aufgabe>`;
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="x-1" titel="T"', aufgabe('k-1'))), /erwartet id="kn-1"/);
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="kn-1"', aufgabe('k-1'))), /titel fehlt/);
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="kn-1" titel="T" min="9"', aufgabe('k-1'))), /min und extra gibt es bei Knobelaufgaben nicht/);
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="kn-1" titel="T"', 'Nur Text.')), /genau eine <Aufgabe/);
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="kn-1" titel="T"', aufgabe('k-2'))), /erwartet "k-1"/);
  assert.throws(() => labor(TASCHE, PFLICHT, k('id="kn-1" titel="T"', aufgabe('k-1', ' data-count="0"'))), /data-count/);
  assert.throws(() => labor(TASCHE, PFLICHT, KNOBEL1, KNOBEL2, k('id="kn-3" titel="T"', aufgabe('k-3'))), /höchstens 2/);
  assert.throws(() => labor(TASCHE, KNOBEL1, PFLICHT), /letzte Gruppe/);
  assert.throws(() => labor(TASCHE, PFLICHT, KNOBEL1, KNOBEL1), /doppelt/);
  assert.throws(() => labor(TASCHE, KNOBEL1, KNOBEL2), /mindestens zwei <Station>/, 'Knobelaufgaben ersetzen keine Pflichtstation');
});

test('Station: Teil K und die Kennungen k-1, k-2 sind den Knobelaufgaben vorbehalten', () => {
  const st = (teil, id) => `<Station id="x" titel="T" teil="${teil}">\n\n<Aufgabe art="code" id="${id}">\n\n</Aufgabe>\n\n</Station>\n\n`;
  assert.throws(() => labor(TASCHE, st('K', 'w-9')), /teil ist A oder B/);
  assert.throws(() => labor(TASCHE, st('A', 'k-1')), /reserviert/);
  assert.doesNotThrow(() => labor(TASCHE, st('A', 'kurz-1'), PFLICHT));
});

test('index-bauen: Knobel-Station hat keine prüfbaren Teile, keine Zeiten; Kennungen in knobel', () => {
  const dom = parse(labor(TASCHE, PFLICHT, KNOBEL1));
  const alle = dom.querySelectorAll('section.l-task').map((s) => stationDaten(s));
  const k = alle.find((x) => x.a.id === 'kn-1');
  assert.deepEqual(k.a.pruefbar, []);
  assert.deepEqual(k.a.knobel, ['k-1']);
  assert.deepEqual(k.ids, ['k-1'], 'der Tutor findet die Aufgabe über ihre Kennung');
  assert.equal(k.a.teil, 'K');
  assert.equal(k.a.sterne, null);
  assert.equal(k.a.minuten, null);
  const p = alle.find((x) => x.a.id === 'a-1');
  assert.deepEqual(p.a.pruefbar, ['w-1']);
  assert.equal(p.a.knobel, undefined);
  assert.equal(p.a.minuten, 8);
  assert.deepEqual(alle.filter((x) => !x.knobel).flatMap((x) => x.a.pruefbar), ['w-1', 'tr-1'], 'nur Pflichtaufgaben sind prüfbar');
});

/* ── kern.js: Zählregel für Fortschritt, Heute und Lernpfad ── */
const KERN = fs.readFileSync(path.join(APP, 'public', 'app', 'kern.js'), 'utf8');
function kern(speicher) {
  const ablage = () => ({ getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 });
  const ctx = {
    addEventListener() {},
    KursSpeicher: { pfad: (l, k) => 'inf-mb/' + l.toLowerCase() + '/' + k, sofort: { lesen: (p) => speicher[p] || null } },
    document: { body: { getAttribute: () => 'lernpfad', classList: { add() {}, remove() {} } }, currentScript: { src: 'http://localhost/app/kern.js?v=1' }, referrer: '', querySelector: () => null, contains: () => false },
    location: { origin: 'http://localhost', pathname: '/lernpfad.html', search: '', hash: '', href: 'http://localhost/lernpfad.html' },
    sessionStorage: ablage(), localStorage: ablage(), performance: { getEntriesByType: () => [{ type: 'navigate' }] },
    URL, Date, setTimeout, console, fetch: () => Promise.resolve({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(KERN, ctx);
  return ctx.KursApp.fortschritt;
}
const TERMIN = {
  nr: 'V01', labor: 'lektionen/v01-labor.html',
  abschnitte: [{ id: 'a', titel: 'Warum' }],
  aufgaben: [
    { id: 'a-w', teil: 'A', pruefbar: [] },
    { id: 'a-1', teil: 'A', pruefbar: ['w-1'] },
    { id: 't-1', teil: 'B', pruefbar: ['tr-1'] },
    { id: 'kn-1', teil: 'K', pruefbar: [], knobel: ['k-1'] },
    { id: 'kn-2', teil: 'K', pruefbar: [], knobel: ['k-2'] },
  ],
};
const j = (x) => JSON.stringify(x);   /* andere vm-Welt: über JSON vergleichen */

test('Fortschritt: gelöste Knobelaufgaben zählen nicht bei „gelöst“, nicht bei „begonnen“, nicht für „fertig“', () => {
  const nur = kern({ 'inf-mb/v01/aufg': { 'k-1': 1, 'k-2': 1 }, 'inf-mb/v01/begonnen': { 'k-1': 1, 'k-2': 1 } }).termin(TERMIN);
  assert.equal(j(nur.aufgaben), j({ geloest: 0, gesamt: 2 }), 'Nenner ohne Knobelaufgaben, Zähler 0');
  assert.equal(nur.status, 'offen', 'wer nur Knobelaufgaben gelöst hat, hat den Termin nicht begonnen');
  assert.equal(nur.begonnen, false);
  assert.equal(nur.gearbeitet, false);
  assert.equal(nur.labor.ganz, false);
  assert.equal(nur.labor.gesamt, 2);

  const pflicht = { 'w-1': 1, 'tr-1': 1 };
  const mit = kern({ 'inf-mb/v01/done': { a: 1 }, 'inf-mb/v01/aufg': { ...pflicht, 'k-1': 1 } }).termin(TERMIN);
  const ohne = kern({ 'inf-mb/v01/done': { a: 1 }, 'inf-mb/v01/aufg': pflicht }).termin(TERMIN);
  assert.equal(j(mit), j(ohne), 'mit gelösten Knobelaufgaben derselbe Stand wie ohne');
  assert.equal(mit.status, 'fertig');
  assert.equal(j(mit.aufgaben), j({ geloest: 2, gesamt: 2 }));

  const halb = kern({ 'inf-mb/v01/done': { a: 1 }, 'inf-mb/v01/aufg': { 'w-1': 1, 'k-1': 1, 'k-2': 1 } }).termin(TERMIN);
  assert.equal(halb.status, 'begonnen');
  assert.equal(j(halb.aufgaben), j({ geloest: 1, gesamt: 2 }), 'zwei gelöste Knobelaufgaben ersetzen keine Pflichtaufgabe');
  assert.equal(halb.labor.ganz, false);
});

test('Fortschritt: offene Aufgaben (Warm-up, „Weiter im Labor“) nennen nie eine Knobelaufgabe', () => {
  const f = kern({});
  const offen = f.offeneAufgaben(TERMIN).map((a) => a.id);
  assert.equal(j(offen), j(['a-1', 't-1']));
  assert.equal(j(f.knobelIds(TERMIN)), j(['k-1', 'k-2']));
  assert.equal(j(f.ohneKnobel(TERMIN, { 'k-1': 1, 'w-1': 1 })), j({ 'w-1': 1 }));
});

test('Fortschritt: eine Übung der Lerneinheit (Kennung nicht in kurs.json) und Knobelaufgaben sind kein Beginn des Labors', () => {
  const f = kern({});
  /* Termin 03: Übung „tabelle“ in der Lerneinheit, steht in keiner Liste pruefbar */
  assert.equal(j(f.nurPruefbare(TERMIN, { tabelle: 1 })), j({}), 'Übung der Lerneinheit zählt nicht');
  assert.equal(j(f.nurPruefbare(TERMIN, { tabelle: 1, 'k-1': 1, 'w-1': 1 })), j({ 'w-1': 1 }), 'nur prüfbare Teile des Labors bleiben');
  assert.equal(j(f.nurPruefbare(TERMIN, undefined)), j({}));
});
