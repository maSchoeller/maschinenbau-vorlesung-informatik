'use strict';
const { app } = require('@azure/functions');
const { ok, sicher, wirf } = require('../lib/antwort');
const { benutzerOderNull, verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const { ablage } = require('../lib/ablage');
const limits = require('../lib/limits');
const { gebremst } = limits;
const zugang = require('../lib/zugang');

// GET /api/ich: ohne Login {angemeldet:false}; mit Login {angemeldet:true, benutzerId, anzeigename, neu}
async function ichLesen(request) {
  const b = benutzerOderNull(request);
  if (!b) return ok({ angemeldet: false });
  return gebremst(b.benutzerId, request, async () => {
    const { profil, neu } = await ablage().benutzerHolenOderAnlegen(b.benutzerId);
    return ok({ angemeldet: true, benutzerId: b.benutzerId, anzeigename: profil.anzeigename || '', neu, freigeschaltet: zugang.freigeschaltet(profil) });
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

// POST /api/ich/freischalten {code}: Tutor mit dem Kurscode freischalten (lib/zugang.js).
// 200 {freigeschaltet:true} · 403 code-falsch · 429 zu-viele-versuche. Ohne KURS_CODE immer 200.
async function freischalten(request) {
  const b = verlangeBenutzer(request);
  return gebremst(b.benutzerId, request, async () => {
    const body = await pruefen.body(request);
    if (!zugang.freischaltungNoetig()) return ok({ freigeschaltet: true });
    const v = await limits.pruefeUndZaehle({ benutzerId: b.benutzerId, art: 'freischalten', limitNutzer: zugang.FREISCHALTEN_VERSUCHE, limitKurs: 1e9 });
    if (!v.erlaubt) wirf(429, 'zu-viele-versuche', 'Zu viele Versuche für heute. Frag in der Vorlesung nach dem Kurscode und versuche es morgen wieder.');
    if (!zugang.codePasst(body.code)) wirf(403, 'code-falsch', 'Dieser Kurscode stimmt nicht. Du findest ihn in den Unterlagen der Vorlesung.');
    await ablage().freischalten(b.benutzerId);
    return ok({ freigeschaltet: true });
  });
}

async function ich(request, context) {
  return request.method === 'PUT' ? ichAendern(request, context) : ichLesen(request, context);
}

app.http('ich', { methods: ['GET', 'PUT'], authLevel: 'anonymous', route: 'ich', handler: sicher(ich) });
app.http('ichFreischalten', { methods: ['POST'], authLevel: 'anonymous', route: 'ich/freischalten', handler: sicher(freischalten) });

module.exports = { ich, freischalten };
