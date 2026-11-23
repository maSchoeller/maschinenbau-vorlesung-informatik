'use strict';
const { app } = require('@azure/functions');
const { ok, sicher } = require('../lib/antwort');
const { benutzerOderNull, verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage } = require('../lib/ablage');
const { gebremst } = require('../lib/limits');

// GET /api/ich: ohne Login {angemeldet:false}; mit Login {angemeldet:true, benutzerId, anzeigename, neu}
async function ichLesen(request) {
  const b = benutzerOderNull(request);
  if (!b) return ok({ angemeldet: false });
  return gebremst(b.benutzerId, request, async () => {
    const { profil, neu } = await ablage().benutzerHolenOderAnlegen(b.benutzerId);
    return ok({ angemeldet: true, benutzerId: b.benutzerId, anzeigename: profil.anzeigename || '', neu });
  });
}

// PUT /api/ich {anzeigename}
async function ichAendern(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const body = await pruefen.body(request);
    const name = pruefen.anzeigename(body.anzeigename);
    const profil = await ablage().anzeigenameSetzen(b.benutzerId, name);
    return ok({ angemeldet: true, benutzerId: b.benutzerId, anzeigename: profil.anzeigename });
  });
}

async function ich(request, context) {
  return request.method === 'PUT' ? ichAendern(request, context) : ichLesen(request, context);
}

app.http('ich', { methods: ['GET', 'PUT'], authLevel: 'anonymous', route: 'ich', handler: sicher(ich) });

module.exports = { ich };
