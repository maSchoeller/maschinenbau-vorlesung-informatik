'use strict';
// Benutzer aus dem Header x-ms-client-principal (von Static Web Apps gesetzt, Base64-JSON).
// Nur der Anbieter 'github' wird akzeptiert. Gespeichert wird nur die pseudonyme
// benutzerId = HMAC-SHA256(identityProvider + ':' + userId, BENUTZER_SALT), Hex, 32 Zeichen.
// userDetails (GitHub-Name) wird weder gespeichert noch geloggt.

const crypto = require('node:crypto');
const { wirf } = require('./antwort');
const { istLokal } = require('./umgebung');

const ERLAUBTE_ANBIETER = new Set(['github']);
const LOKALER_SALT = 'lokal-entwicklung-nicht-fuer-produktion';

/** Rohes Principal-Objekt oder null (fehlend/kaputt). */
function principal(request) {
  const roh = request && request.headers && request.headers.get('x-ms-client-principal');
  if (!roh || roh.length > 8192) return null;
  try {
    const obj = JSON.parse(Buffer.from(roh, 'base64').toString('utf8'));
    if (!obj || typeof obj !== 'object') return null;
    if (typeof obj.userId !== 'string' || !obj.userId) return null;
    if (typeof obj.identityProvider !== 'string' || !obj.identityProvider) return null;
    return obj;
  } catch {
    return null;
  }
}

function salt() {
  const s = process.env.BENUTZER_SALT;
  if (s && s.length >= 8) return s;
  if (istLokal()) return LOKALER_SALT;
  wirf(503, 'nicht-eingerichtet', 'Der Server ist noch nicht vollständig eingerichtet (BENUTZER_SALT fehlt).');
}

function benutzerIdAus(anbieter, userId) {
  return crypto.createHmac('sha256', salt()).update(anbieter + ':' + userId, 'utf8').digest('hex').slice(0, 32);
}

/**
 * Angemeldeter Benutzer oder null.
 * null bei fehlendem/kaputtem Principal UND bei nicht erlaubtem Anbieter.
 * Wirft 503, wenn in Produktion BENUTZER_SALT fehlt.
 * @returns {{benutzerId: string, anbieter: string} | null}
 */
function benutzerOderNull(request) {
  const p = principal(request);
  if (!p) return null;
  const anbieter = p.identityProvider.toLowerCase();
  if (!ERLAUBTE_ANBIETER.has(anbieter)) return null;
  return { benutzerId: benutzerIdAus(anbieter, p.userId), anbieter };
}

/**
 * Wie benutzerOderNull, wirft aber 401 (nicht angemeldet) bzw. 403 (fremder Anbieter).
 * @returns {{benutzerId: string, anbieter: string}}
 */
function verlangeBenutzer(request) {
  const p = principal(request);
  if (!p) wirf(401, 'nicht-angemeldet', 'Dafür musst du dich mit GitHub anmelden.');
  if (!ERLAUBTE_ANBIETER.has(p.identityProvider.toLowerCase())) {
    wirf(403, 'anbieter-nicht-erlaubt', 'Die Anmeldung ist nur über GitHub möglich.');
  }
  return benutzerOderNull(request);
}

module.exports = { benutzerOderNull, verlangeBenutzer, principal, benutzerIdAus };
