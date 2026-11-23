'use strict';
const { app } = require('@azure/functions');
const { ok, sicher } = require('../lib/antwort');
const { ablageArt } = require('../lib/ablage');
const { istLokal } = require('../lib/umgebung');
const paket = require('../../package.json');
const modell = require('../lib/tutor/modell');

// GET /api/status (ohne Login): {ok, version, tutor, ablage}
async function status() {
  const ablage = ablageArt();
  const saltOk = Boolean(process.env.BENUTZER_SALT) || istLokal();
  return ok({
    ok: Boolean(ablage) && saltOk,
    version: process.env.APP_VERSION || paket.version,
    // true, wenn ein Modell-Client bereitsteht: Schlüssel und SDK, lokal auch das Modell-Doppel (TUTOR_DOPPEL=1).
    tutor: Boolean(modell.client()),
    ablage: ablage || 'fehlt',
  });
}

app.http('status', { methods: ['GET'], authLevel: 'anonymous', route: 'status', handler: sicher(status) });

module.exports = { status };
