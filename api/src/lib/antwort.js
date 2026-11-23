'use strict';
// Einheitliche JSON-Antworten und Fehler der API.
// Fehler haben immer die Form {fehler: 'kurzcode', meldung: 'deutscher Satz'} (plus optionale Zusatzfelder).
// Nach außen geht nie ein Stacktrace; in Logs nur Fehlerart und Meldung, keine Inhalte.

const KOPF = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

/** Erwarteter Fehler mit HTTP-Status. `extra` wird in den Body gemischt (z. B. {eintrag}). */
class ApiFehler extends Error {
  constructor(status, fehler, meldung, extra) {
    super(meldung);
    this.name = 'ApiFehler';
    this.status = status;
    this.fehler = fehler;
    this.extra = extra || null;
  }
}

/** JSON-Antwort. */
function json(status, body, kopf) {
  return {
    status,
    headers: { ...KOPF, ...(kopf || {}) },
    body: JSON.stringify(body === undefined ? null : body),
  };
}

function ok(body, kopf) {
  return json(200, body, kopf);
}

function fehler(status, code, meldung, extra) {
  return json(status, { fehler: code, meldung, ...(extra || {}) });
}

/** Wirft einen ApiFehler (Kurzform). */
function wirf(status, code, meldung, extra) {
  throw new ApiFehler(status, code, meldung, extra);
}

/** Cosmos-Statuscode aus einem SDK-Fehler (code oder statusCode). */
function cosmosStatus(err) {
  if (!err || typeof err !== 'object') return 0;
  const c = Number(err.code ?? err.statusCode);
  return Number.isFinite(c) ? c : 0;
}

/**
 * Umhüllt einen Handler: fängt ApiFehler (→ ihre Antwort) und alle anderen
 * Fehler (→ 500 bzw. 503 bei Überlast der Datenbank). Loggt ohne Inhalte.
 */
function sicher(handler) {
  return async function (request, context) {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof ApiFehler) {
        return fehler(err.status, err.fehler, err.message, err.extra);
      }
      const status = cosmosStatus(err);
      const log = context && typeof context.error === 'function' ? context.error.bind(context) : () => {};
      log(`Unerwarteter Fehler (${err && err.name ? err.name : 'Fehler'}${status ? ', Status ' + status : ''})`);
      if (status === 429 || status === 503 || status === 408) {
        return fehler(503, 'ueberlastet', 'Der Dienst ist gerade überlastet. Bitte versuche es gleich noch einmal.');
      }
      return fehler(500, 'intern', 'Auf dem Server ist ein Fehler aufgetreten.');
    }
  };
}

module.exports = { ApiFehler, json, ok, fehler, wirf, sicher, cosmosStatus, KOPF };
