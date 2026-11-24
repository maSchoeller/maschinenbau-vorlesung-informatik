'use strict';
// Gruppenbild für Dozierende: Route /api/dozent/uebersicht (gegen beide Ablagen) und die Zählregeln.

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./hilfe');
const ablageModul = require('../src/lib/ablage');
const { benutzerIdAus } = require('../src/lib/auth');
const { _setzeKursstruktur } = require('../src/lib/kursstruktur');
const gruppenbild = require('../src/lib/gruppenbild');
const { erzeugeCosmosDoppel } = require('./cosmos-doppel');

h.lade(['ich', 'abgleich', 'eintraege', 'dozent']);
const dozentFn = require('../src/functions/dozent');

const KURS = [
  {
    nr: 'V07', quiz: 'v07', abschnitte: ['warum', 'theorie', 'deep'],
    stationen: [
      { id: 'a-werkzeugkasten', teil: 'A', pruefbar: [] },             // nur ansehen: zählt nicht
      { id: 'a-luecken', teil: 'A', pruefbar: ['gap-1', 'gap-2'] },    // zwei prüfbare Teile
      { id: 't-1', teil: 'B', pruefbar: ['t-1'] },
      { id: 't-2', teil: 'B', pruefbar: ['t-2'] },
    ],
  },
  { nr: 'V08', quiz: null, abschnitte: ['warum'], stationen: [{ id: 't-1', teil: 'B', pruefbar: ['t-1'] }] },
];
const DOZ = 'dozentin';
const T0 = '2026-11-01T10:00:00.000Z';

/** Legt für ein Konto Eimer an: {'v07/aufg': {...}, 'v07/quiz-v07': {...}} */
async function lernstand(benutzer, eimer) {
  const eintraege = Object.entries(eimer).map(([k, wert]) => ({ pfad: 'inf-mb/' + k, wert, geaendert: T0 }));
  const r = await h.aufruf('POST', '/api/abgleich', { benutzer, body: { eintraege, seit: null } });
  assert.equal(r.status, 200);
  assert.equal(r.daten.uebernommen, eintraege.length);
}
const bild = () => { dozentFn._vergessen(); return h.aufruf('GET', '/api/dozent/uebersicht', { benutzer: DOZ }); };

const backends = {
  speicher: () => ({ be: ablageModul.speicherBackend(), protokoll: null }),
  'cosmos (Doppel)': () => {
    const d = erzeugeCosmosDoppel();
    return { be: ablageModul.cosmosBackend(d.client, 'lernapp'), protokoll: d.protokoll };
  },
};

for (const [name, fabrik] of Object.entries(backends)) {
  describe(`Dozent: Gruppenbild mit Ablage ${name}`, () => {
    let protokoll;
    beforeEach(() => {
      const f = fabrik();
      protokoll = f.protokoll;
      h.neueAblage(f.be);
      dozentFn._vergessen();
      _setzeKursstruktur(KURS);
      process.env.DOZENT_IDS = `  ${benutzerIdAus('github', DOZ).toUpperCase()}, unsinn `;
    });
    afterEach(() => { delete process.env.DOZENT_IDS; _setzeKursstruktur(undefined); });

    it('ohne Login 401', async () => {
      const r = await h.aufruf('GET', '/api/dozent/uebersicht');
      assert.equal(r.status, 401);
    });

    it('fremdes Konto: 403 ohne Daten', async () => {
      for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
      const r = await h.aufruf('GET', '/api/dozent/uebersicht', { benutzer: 'student' });
      assert.equal(r.status, 403);
      assert.equal(r.daten.fehler, 'kein-dozent');
      assert.deepEqual(Object.keys(r.daten).sort(), ['fehler', 'meldung']);
    });

    it('ohne DOZENT_IDS ist niemand Dozent', async () => {
      delete process.env.DOZENT_IDS;
      assert.equal((await h.aufruf('GET', '/api/dozent/uebersicht', { benutzer: DOZ })).status, 403);
    });

    it('/api/ich meldet dozent', async () => {
      assert.equal((await h.aufruf('GET', '/api/ich', { benutzer: DOZ })).daten.dozent, true);
      assert.equal((await h.aufruf('GET', '/api/ich', { benutzer: 'student' })).daten.dozent, false);
    });

    it('ohne Kursstruktur 503', async () => {
      _setzeKursstruktur(null);
      const r = await h.aufruf('GET', '/api/dozent/uebersicht', { benutzer: DOZ });
      assert.equal(r.status, 503);
      assert.equal(r.daten.fehler, 'nicht-eingerichtet');
    });

    it('unter fünf Konten: nur die Zahl der Konten, keine Lektionen', async () => {
      for (const u of ['s1', 's2', 's3', 's4']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
      const r = await bild();
      assert.equal(r.status, 200);
      assert.equal(r.daten.konten, 4);
      assert.equal(r.daten.genug, false);
      assert.equal(r.daten.mindest, 5);
      assert.deepEqual(r.daten.lektionen, []);
    });

    it('zählt Stationen, Teile, Abschnitte und Quiz über alle Konten', async () => {
      // s1: alles gelöst, Quiz 8/10
      await lernstand('s1', { 'v07/aufg': { 'gap-1': 1, 'gap-2': 1, 't-1': 1, 't-2': 1 }, 'v07/done': { warum: 1, theorie: 1 }, 'v07/quiz-v07': { got: 8, total: 10 } });
      // s2: Lücken halb, t-1 gelöst, t-2 angefangen, Quiz 4/10
      await lernstand('s2', { 'v07/aufg': { 'gap-1': 1, 't-1': 1 }, 'v07/begonnen': { 'gap-1': 1, 't-1': 1, 't-2': 1 }, 'v07/done': { warum: 1 }, 'v07/quiz-v07': { got: 4, total: 10 } });
      // s3: nur t-1 angefangen
      await lernstand('s3', { 'v07/begonnen': { 't-1': 1 } });
      // s4: nur einen Abschnitt abgehakt
      await lernstand('s4', { 'v07/done': { warum: 1 } });
      // s5: nur in V08
      await lernstand('s5', { 'v08/aufg': { 't-1': 1 } });
      // s6: nur Fremdes (unbekannte Schlüssel, andere Pfade, kaputtes Quiz) → zählt nirgends
      await lernstand('s6', { 'v07/aufg': { erfunden: 1 }, 'v07/code:t-1': 'print(1)', 'v07/quiz-v07': { got: 99, total: 3 }, 'v07/done': ['warum'] });

      const r = await bild();
      assert.equal(r.status, 200);
      assert.equal(r.daten.konten, 5);
      assert.equal(r.daten.genug, true);
      assert.match(r.daten.stand, /^\d{4}-\d\d-\d\dT/);
      assert.deepEqual(r.daten.lektionen.map((l) => l.nr), ['V07', 'V08']);

      const v07 = r.daten.lektionen[0];
      assert.equal(v07.konten, 4);
      assert.deepEqual(v07.stationen, [
        { id: 'a-luecken', geloest: 1, begonnen: 1 },
        { id: 't-1', geloest: 2, begonnen: 1 },
        { id: 't-2', geloest: 1, begonnen: 1 },
      ]);
      assert.deepEqual(v07.teile, { A: { stationen: 1, alle: 1, begonnen: 1 }, B: { stationen: 2, alle: 1, begonnen: 2 } });
      assert.deepEqual(v07.abschnitte, [{ id: 'warum', n: 3 }, { id: 'theorie', n: 1 }, { id: 'deep', n: 0 }]);
      assert.deepEqual(v07.quiz, { konten: 2, anteil: 0.6 });

      const v08 = r.daten.lektionen[1];
      assert.equal(v08.konten, 1);
      assert.deepEqual(v08.stationen, [{ id: 't-1', geloest: 1, begonnen: 0 }]);
      assert.equal(v08.quiz, null);
    });

    it('die Antwort enthält keine Kennungen und keinen Code', async () => {
      const nutzer = ['s1', 's2', 's3', 's4', 's5'];
      for (const u of nutzer) await lernstand(u, { 'v07/aufg': { 't-1': 1 }, 'v07/code:t-1': 'geheim = 1' });
      const text = JSON.stringify((await bild()).daten);
      for (const u of nutzer) assert.ok(!text.includes(benutzerIdAus('github', u)));
      assert.ok(!text.includes('geheim'));
      assert.ok(!text.includes('benutzerId'));
    });

    it('Bearbeitungsstände der Aufgaben (code:, luecken:, zeilen:, ablauf:, fehler:, tipp:, frage:) zählen nicht und erscheinen nie', async () => {
      const stand = {
        'v07/code:t-1': { v: 1, code: 'geheim_code = 7', eingaben: 'geheim-eingabe', ab: 1, haken: [1, 0] },
        'v07/luecken:a-luecken': { v: 1, f: 'x', w: ['geheim-luecke'] },
        'v07/zeilen:t-2': { v: 1, f: 'x', p: ['z1'], a: [['z0', 1]] },
        'v07/ablauf:t-2': { v: 1, f: 'x', n: 2, r: [], e: { x: 'geheim-wert' } },
        'v07/fehler:abc123': { v: 1, s: [2], a: 1 },
        'v07/tipp:abc123': { v: 1, t: 'geheim-tipp', g: 1 },
        'v07/frage:v07.symbol': { v: 1, f: 'x', p: 2, ok: 1, a: 'geheim-antwort' },
      };
      // Konten nur mit Bearbeitungsständen: kein aktives Konto
      for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, stand);
      const leer = (await bild()).daten;
      assert.equal(leer.konten, 0);
      assert.equal(leer.genug, false);
      assert.deepEqual(leer.lektionen, []);
      // mit echtem Lernstand daneben: Zahlen wie ohne die Bearbeitungsstände, Inhalte nie in der Antwort
      for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
      const r = await bild();
      assert.equal(r.daten.konten, 5);
      assert.deepEqual(r.daten.lektionen[0].stationen.find((x) => x.id === 't-1'), { id: 't-1', geloest: 5, begonnen: 0 });
      assert.equal(r.daten.lektionen[0].quiz, null);
      assert.ok(!JSON.stringify(r.daten).includes('geheim'));
    });

    it('gelöschte Einträge zählen nicht mehr', async () => {
      for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
      assert.equal((await bild()).daten.lektionen[0].stationen[1].geloest, 5);
      const r = await h.aufruf('DELETE', '/api/eintraege/inf-mb/v07/aufg?geaendert=2026-11-02T10:00:00.000Z', { benutzer: 's1' });
      assert.equal(r.status, 200);
      const danach = (await bild()).daten;
      assert.equal(danach.konten, 4);
      assert.equal(danach.genug, false);
    });

    it('bewahrt das Bild kurz auf (zweiter Aufruf liest nicht neu)', async () => {
      for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
      const a = await bild();
      await lernstand('s6', { 'v07/aufg': { 't-1': 1 } });
      const b = await h.aufruf('GET', '/api/dozent/uebersicht', { benutzer: DOZ });
      assert.equal(b.daten.stand, a.daten.stand);
      assert.equal(b.daten.konten, 5);
      assert.equal((await bild()).daten.konten, 6);
    });

    if (name !== 'speicher') {
      it('liest mit einer einzigen partitionsübergreifenden Abfrage', async () => {
        for (const u of ['s1', 's2', 's3', 's4', 's5']) await lernstand(u, { 'v07/aufg': { 't-1': 1 } });
        protokoll.length = 0;
        await bild();
        const abfragen = protokoll.filter((z) => z.container === 'eintraege' && z.art === 'query');
        assert.equal(abfragen.length, 1);
        assert.equal(abfragen[0].partitionKey, undefined);
        assert.match(abfragen[0].query, /ARRAY_CONTAINS\(@pfade, c\.pfad\)/);
      });
    }
  });
}

describe('Gruppenbild: Zählregeln', () => {
  it('liest genau vier Pfade je Lektion mit Quiz, drei ohne', () => {
    assert.deepEqual([...gruppenbild.pfade(KURS).keys()], [
      'inf-mb/v07/aufg', 'inf-mb/v07/begonnen', 'inf-mb/v07/done', 'inf-mb/v07/quiz-v07',
      'inf-mb/v08/aufg', 'inf-mb/v08/begonnen', 'inf-mb/v08/done',
    ]);
  });

  it('liest keinen Pfad der Bearbeitungsstände', () => {
    const gelesen = [...gruppenbild.pfade(KURS).keys()];
    for (const art of ['code:', 'luecken:', 'zeilen:', 'ablauf:', 'fehler:', 'tipp:', 'frage:']) {
      assert.ok(!gelesen.some((p) => p.includes('/' + art)), art);
    }
  });

  it('verträgt kaputte Werte und fremde Pfade', () => {
    const docs = [
      { benutzerId: 'a', pfad: 'inf-mb/v07/aufg', wert: null },
      { benutzerId: 'a', pfad: 'inf-mb/v07/begonnen', wert: 'text' },
      { benutzerId: 'a', pfad: 'inf-mb/v07/done', wert: [1, 2] },
      { benutzerId: 'a', pfad: 'inf-mb/v07/quiz-v07', wert: { got: 'x', total: 10 } },
      { benutzerId: 'a', pfad: 'inf-mb/v99/aufg', wert: { 't-1': 1 } },
      { benutzerId: 42, pfad: 'inf-mb/v07/aufg', wert: { 't-1': 1 } },
      { benutzerId: 'b', pfad: 'inf-mb/v07/aufg', wert: { 't-1': 0, 't-2': false } },
    ];
    const r = gruppenbild.berechne(KURS, docs, 1);
    assert.equal(r.konten, 0);
    assert.equal(r.genug, false);
  });

  it('Schwelle ist einstellbar; genau an der Schwelle gibt es Zahlen', () => {
    const docs = ['a', 'b', 'c'].map((b) => ({ benutzerId: b, pfad: 'inf-mb/v08/aufg', wert: { 't-1': 1 } }));
    assert.equal(gruppenbild.berechne(KURS, docs, 3).genug, true);
    assert.equal(gruppenbild.berechne(KURS, docs, 4).genug, false);
    assert.equal(gruppenbild.berechne(KURS, docs).mindest, 5);
  });
});
