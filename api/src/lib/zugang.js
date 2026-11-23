'use strict';
// Freischaltung für Kursteilnehmende (Tutor).
//
// Jedes GitHub-Konto kann sich anmelden. Damit Wegwerf-Konten das kursweite Tageskontingent des
// Tutors nicht aufbrauchen können, verlangt der Tutor eine einmalige Freischaltung mit dem Kurscode
// aus der Vorlesung, sobald die Einstellung KURS_CODE gesetzt ist (ohne KURS_CODE: keine Freischaltung
// nötig, wie bisher). Der Code wird nur verglichen, nie gespeichert; im Profil steht nur
// freigeschaltet: true. Rateversuche: höchstens FREISCHALTEN_VERSUCHE je Konto und Tag.

const crypto = require('node:crypto');

const FREISCHALTEN_VERSUCHE = 10;

function normal(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

function kurscode() { return normal(process.env.KURS_CODE); }

/** true, wenn der Tutor eine Freischaltung verlangt (KURS_CODE gesetzt). */
function freischaltungNoetig() { return kurscode().length > 0; }

/** Vergleich in konstanter Zeit (über Hashwerte gleicher Länge). */
function codePasst(eingabe) {
  const soll = kurscode();
  if (!soll || typeof eingabe !== 'string' || eingabe.length > 200) return false;
  const a = crypto.createHash('sha256').update(normal(eingabe)).digest();
  const b = crypto.createHash('sha256').update(soll).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Darf dieses Profil den Tutor nutzen? */
function freigeschaltet(profil) { return !freischaltungNoetig() || Boolean(profil && profil.freigeschaltet); }

module.exports = { freischaltungNoetig, codePasst, freigeschaltet, FREISCHALTEN_VERSUCHE };
