'use strict';
// Robustheit: langsame Schreiber und der 'seit'-Abgleich, Fehlerabbildung bei Überlast der
// Datenbank, Mengenbremse. Läuft gegen die Cosmos-Umsetzung mit gestörtem Doppel.

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./hilfe');
const ablageModul = require('../src/lib/ablage');
const limits = require('../src/lib/limits');
const { erzeugeCosmosDoppel } = require('./cosmos-doppel');

h.lade(['status', 'ich', 'eintraege', 'abgleich', 'konto', 'geteilt']);

const iso = (ms) => new Date(ms).toISOString();
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

let doppel;
const envAlt = { ...process.env };
beforeEach(() => {
  doppel = erzeugeCosmosDoppel();
  h.neueAblage(ablageModul.cosmosBackend(doppel.client, 'lernapp'));
});
afterEach(() => {
  for (const k of ['ABGLEICH_SICHERHEIT_MS', 'MENGE_LIMIT_NUTZER_TAG', 'MENGE_LIMIT_KURS_TAG', 'MENGE_LIMIT_ANONYM_TAG']) {
    if (envAlt[k] === undefined) delete process.env[k]; else process.env[k] = envAlt[k];
  }
});

describe('seit-Abgleich mit langsamen Schreibern', () => {
  it('ein Eintrag, dessen Commit länger dauert als der Sicherheitsabstand, geht nicht verloren', async () => {
    process.env.ABGLEICH_SICHERHEIT_MS = '200';
    // Gerät B holt einmal den Stand
    let b = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [] } });
    let seit = b.daten.serverzeit;
    // Gerät A schreibt; der Commit verzögert sich um 2,5 s (z. B. 429-Wiederholungen im SDK)
    doppel.stoerung.verzoegerung = (c, art) => (c === 'eintraege' && art === 'create' ? 2500 : 0);
    const a = h.aufruf('PUT', '/api/eintraege/inf-mb/v01/langsam', { benutzer: 'u1', body: { wert: 'A', geaendert: iso(Date.now()) } });
    await warte(1200);
    // B gleicht ab, während A noch schreibt
    b = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [], seit } });
    assert.deepEqual(b.daten.eintraege, []);
    seit = b.daten.serverzeit;
    assert.equal((await a).status, 200);
    doppel.stoerung.verzoegerung = null;
    // danach mit der erhaltenen serverzeit: der Eintrag von A muss kommen
    b = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [], seit } });
    assert.deepEqual(b.daten.eintraege.map((e) => e.pfad), ['inf-mb/v01/langsam']);
  });
});

describe('Überlast der Datenbank', () => {
  for (const code of [429, 408, 503]) {
    it(`Cosmos ${code} (Wiederholungen erschöpft) → 503 ueberlastet ohne Details`, async () => {
      doppel.stoerung.fehler = (c, art) => (c === 'eintraege' && art === 'query' ? code : null);
      const r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
      assert.equal(r.status, 503);
      assert.equal(r.daten.fehler, 'ueberlastet');
      assert.ok(!JSON.stringify(r.daten).includes('Cosmos'));
    });
  }
  it('fehlgeschlagenes Schreiben gibt die Reservierung im Kontozähler zurück', async () => {
    const bid = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
    await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/a', { benutzer: 'u1', body: { wert: 1, geaendert: iso(Date.now()) } });
    doppel.stoerung.fehler = (c, art) => (c === 'eintraege' && art === 'create' ? 503 : null);
    const r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/b', { benutzer: 'u1', body: { wert: 1, geaendert: iso(Date.now()) } });
    assert.equal(r.status, 503);
    doppel.stoerung.fehler = null;
    const k = await ablageModul.ablage().kontoStand(bid);
    assert.equal(k.n, 1);
    assert.equal(k.b, 1);
  });
});

describe('Mengenbremse', () => {
  it('begrenzt Anfragen je Benutzer und Tag (429), andere Benutzer bleiben frei', async () => {
    process.env.MENGE_LIMIT_NUTZER_TAG = '120';
    let erste429 = null;
    for (let i = 0; i < 300 && erste429 === null; i++) {
      const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [] } });
      if (r.status === 429) { erste429 = i; assert.equal(r.daten.fehler, 'mengenbremse'); }
      else assert.equal(r.status, 200);
    }
    assert.ok(erste429 !== null, 'Bremse greift');
    assert.ok(erste429 >= 100 && erste429 <= 120 + limits.BREMSE_SAMMELN, `nach ${erste429} Anfragen`);
    assert.equal((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).status, 429, 'gilt für alle Routen');
    assert.equal((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u2' })).status, 200);
  });
  it('große Antworten zählen nach Bytes', async () => {
    process.env.MENGE_LIMIT_NUTZER_TAG = '400';
    const gross = 'x'.repeat(60 * 1024);
    for (let i = 0; i < 4; i++) {
      const liste = Array.from({ length: 4 }, (_, j) => ({ pfad: `inf-mb/werkbank/prog:${i}-${j}`, wert: gross, geaendert: iso(Date.now()) }));
      assert.equal((await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste } })).status, 200);
    }
    // jede volle Abfrage liefert ca. 1 MB ≈ 61 Punkte → nach wenigen Abrufen gesperrt
    let n = 0;
    while (n < 40 && (await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).status === 200) n++;
    assert.ok(n < 12, `gesperrt nach ${n} vollen Abrufen`);
  });
  it('kursweite Grenze für anonyme Abrufe geteilter Programme', async () => {
    process.env.MENGE_LIMIT_ANONYM_TAG = '100';
    let erste429 = null;
    for (let i = 0; i < 300 && erste429 === null; i++) {
      const r = await h.aufruf('GET', '/api/geteilt/AAAAAAAAAA');
      if (r.status === 429) erste429 = i; else assert.equal(r.status, 404);
    }
    assert.ok(erste429 !== null && erste429 <= 100 + limits.BREMSE_SAMMELN);
  });
  it('kursweite Grenze greift über viele Konten', async () => {
    process.env.MENGE_LIMIT_KURS_TAG = '200';
    let gesperrt = 0;
    for (let i = 0; i < 400; i++) {
      const r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'k' + (i % 40) });
      if (r.status === 429) gesperrt++;
    }
    assert.ok(gesperrt > 100, `${gesperrt} gesperrt`);
  });
});
