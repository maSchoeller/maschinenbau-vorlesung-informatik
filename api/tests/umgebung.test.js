'use strict';
// Produktionserkennung: ohne Datenbank bzw. ohne Salt antwortet die API mit 503,
// statt still in den Arbeitsspeicher zu schreiben.

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./hilfe');
const ablageModul = require('../src/lib/ablage');
const { erzeugeCosmosDoppel } = require('./cosmos-doppel');

h.lade(['status', 'ich', 'eintraege', 'geteilt']);
const sicherung = { ...process.env };
afterEach(() => { process.env = { ...sicherung }; ablageModul._setzeBackend(null); });

describe('Produktion ohne Einrichtung', () => {
  it('ohne ABLAGE und ohne COSMOS_VERBINDUNG: status ok=false, Routen 503 ablage-fehlt', async () => {
    delete process.env.ABLAGE;
    ablageModul._setzeBackend(null);
    const s = await h.aufruf('GET', '/api/status');
    assert.equal(s.status, 200);
    assert.equal(s.daten.ok, false);
    assert.equal(s.daten.ablage, 'fehlt');
    const r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
    assert.equal(r.status, 503);
    assert.equal(r.daten.fehler, 'ablage-fehlt');
    assert.equal((await h.aufruf('GET', '/api/geteilt/AAAAAAAAAA')).status, 503);
    // ohne Login bleibt /api/ich beantwortbar
    assert.deepEqual((await h.aufruf('GET', '/api/ich')).daten, { angemeldet: false });
  });

  it('ABLAGE=speicher wird auf der Azure-Plattform (WEBSITE_INSTANCE_ID) ignoriert', async () => {
    process.env.ABLAGE = 'speicher';
    process.env.WEBSITE_INSTANCE_ID = 'abc';
    ablageModul._setzeBackend(null);
    const r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
    assert.equal(r.status, 503);
    assert.equal(r.daten.fehler, 'ablage-fehlt');
  });

  it('Produktion ohne BENUTZER_SALT: 503 für angemeldete Anfragen, status ok=false', async () => {
    delete process.env.ABLAGE;
    delete process.env.BENUTZER_SALT;
    ablageModul._setzeBackend(ablageModul.cosmosBackend(erzeugeCosmosDoppel().client));
    const r = await h.aufruf('GET', '/api/ich', { benutzer: 'u1' });
    assert.equal(r.status, 503);
    assert.equal(r.daten.fehler, 'nicht-eingerichtet');
    assert.equal((await h.aufruf('GET', '/api/status')).daten.ok, false);
  });

  it('lokal ohne Salt: fester Entwicklungs-Salt', async () => {
    process.env.ABLAGE = 'speicher';
    delete process.env.BENUTZER_SALT;
    ablageModul._setzeBackend(null);
    const r = await h.aufruf('GET', '/api/ich', { benutzer: 'u1' });
    assert.equal(r.status, 200);
    assert.equal(r.daten.angemeldet, true);
  });

  it('Salt bestimmt die benutzerId', async () => {
    process.env.ABLAGE = 'speicher';
    ablageModul._setzeBackend(null);
    process.env.BENUTZER_SALT = 'salt-eins-12345';
    const a = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
    process.env.BENUTZER_SALT = 'salt-zwei-12345';
    const b = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
    assert.notEqual(a, b);
    const crypto = require('node:crypto');
    assert.equal(b, crypto.createHmac('sha256', 'salt-zwei-12345').update('github:u1').digest('hex').slice(0, 32));
  });

  it('Datei-Ablage überlebt einen Neustart', async () => {
    const os = require('node:os');
    const path = require('node:path');
    const fs = require('node:fs');
    const datei = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lernapp-')), 'ablage.json');
    process.env.ABLAGE = 'datei';
    process.env.ABLAGE_DATEI = datei;
    ablageModul._setzeBackend(null);
    const r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/x', { benutzer: 'u1', body: { wert: 42, geaendert: '2026-11-01T00:00:00Z' } });
    assert.equal(r.status, 200);
    assert.equal((await h.aufruf('GET', '/api/status')).daten.ablage, 'datei');
    ablageModul._setzeBackend(null); // "Neustart"
    const g = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
    assert.equal(g.daten.eintraege[0].wert, 42);
    fs.rmSync(path.dirname(datei), { recursive: true, force: true });
  });
});
