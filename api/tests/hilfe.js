'use strict';
// Test-Hilfe: lädt Function-Dateien, ohne den Functions-Host zu brauchen, und ruft sie über
// ihre registrierte Route auf (damit werden Route, Methoden und Registrierung mitgeprüft).
//
//   const h = require('./hilfe');
//   h.lade(['status', 'ich']);                 // Dateien aus src/functions (ohne .js)
//   h.neueAblage();                            // frische Ablage im Arbeitsspeicher
//   const r = await h.aufruf('GET', '/api/ich', { benutzer: 'u1' });
//   r.status, r.daten (geparstes JSON), r.headers
//
// Optionen von aufruf():
//   benutzer: 'u1' | { userId, provider='github', userDetails }   → Header x-ms-client-principal
//   body:     Objekt (wird JSON) oder Zeichenkette (roh)
//   headers:  zusätzliche/überschreibende Kopfzeilen
//   ohneAppKopf: true → bei POST/PUT/DELETE NICHT automatisch X-Kurs-App und content-type setzen

process.env.ABLAGE = process.env.ABLAGE || 'speicher';
process.env.BENUTZER_SALT = process.env.BENUTZER_SALT || 'test-salt-123456';
delete process.env.COSMOS_VERBINDUNG;
delete process.env.WEBSITE_INSTANCE_ID;

const path = require('node:path');
const functions = require('@azure/functions');
const ablageModul = require('../src/lib/ablage');

const registriert = [];
functions.app.http = (name, opt) => {
  if (registriert.some((r) => r.name === name)) throw new Error(`Function-Name doppelt: ${name}`);
  registriert.push({ name, ...opt });
};

const geladen = new Set();
function lade(namen) {
  for (const n of namen) {
    if (geladen.has(n)) continue;
    require(path.join(__dirname, '..', 'src', 'functions', n + '.js'));
    geladen.add(n);
  }
}

/** Frische Ablage: Arbeitsspeicher (Standard) oder ein übergebenes Backend (z. B. Cosmos mit Doppel). */
function neueAblage(backend) {
  ablageModul._setzeBackend(backend || ablageModul.speicherBackend());
  require('../src/lib/limits')._bremseZuruecksetzen();
}

function principal(benutzer) {
  const b = typeof benutzer === 'string' ? { userId: benutzer } : benutzer;
  const obj = {
    identityProvider: b.provider || 'github',
    userId: b.userId,
    userDetails: b.userDetails || 'test-' + b.userId,
    userRoles: ['anonymous', 'authenticated'],
  };
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

function passt(vorlage, rest) {
  const v = vorlage.split('/');
  const t = rest.split('/');
  const params = {};
  for (let i = 0; i < v.length; i++) {
    const s = v[i];
    const m = /^\{(\*?)([A-Za-z0-9_]+)\}$/.exec(s);
    if (m && m[1] === '*') {
      const wert = t.slice(i).join('/');
      if (!wert) return null;
      params[m[2]] = wert;
      return params;
    }
    if (i >= t.length) return null;
    if (m) { if (!t[i]) return null; params[m[2]] = decodeURIComponent(t[i]); }
    else if (s.toLowerCase() !== t[i].toLowerCase()) return null;
  }
  return v.length === t.length ? params : null;
}

function finde(methode, pfadname) {
  const rest = pfadname.replace(/^\/api\//, '');
  for (const r of registriert) {
    const params = passt(r.route || r.name, rest);
    if (params && (r.methods || ['GET', 'POST']).includes(methode)) return { r, params };
  }
  return null;
}

const kontext = {
  log() {}, info() {}, warn() {}, debug() {}, trace() {},
  error(...a) { kontext.fehler.push(a.join(' ')); },
  fehler: [],
};

async function aufruf(methode, url, { benutzer, body, headers, ohneAppKopf } = {}) {
  const u = new URL(url, 'http://localhost');
  const treffer = finde(methode, u.pathname);
  if (!treffer) return { status: 404, daten: null, headers: {}, keineRoute: true };
  const kopf = {};
  if (!ohneAppKopf && ['POST', 'PUT', 'DELETE'].includes(methode)) {
    kopf['x-kurs-app'] = '1';
    kopf['content-type'] = 'application/json';
  }
  if (benutzer) kopf['x-ms-client-principal'] = principal(benutzer);
  Object.assign(kopf, headers || {});
  const init = { method: methode, url: u.toString(), headers: kopf, params: treffer.params, query: Object.fromEntries(u.searchParams) };
  if (body !== undefined) init.body = { string: typeof body === 'string' ? body : JSON.stringify(body) };
  const req = new functions.HttpRequest(init);
  const res = await treffer.r.handler(req, kontext);
  let daten = null;
  if (res.body !== undefined && res.body !== null) daten = JSON.parse(res.body);
  else if (res.jsonBody !== undefined) daten = res.jsonBody;
  return { status: res.status || 200, daten, headers: res.headers || {} };
}

module.exports = { lade, neueAblage, aufruf, principal, registriert, kontext };
