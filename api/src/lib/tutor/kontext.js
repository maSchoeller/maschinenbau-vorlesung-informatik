'use strict';
// Kontext einer Tutor-Anfrage: Eingaben des Browsers begrenzen und prüfen, Aufgabe vom Server holen.
//
// Vertrauensgrenze: Vom Browser kommen nur Kennungen (Lektion, Seite, Aufgaben-id) und Texte der
// Studierenden (Frage, Verlauf, Code, Ausgabe). Aufgabentext, erlaubte Konstrukte und Musterlösung
// kommen ausschließlich aus api/daten/aufgaben.json (vom Build erzeugt). Die Musterlösung verlässt
// dieses Modul nur in Richtung der deterministischen Nachprüfung (pruefer.js), nie zum Modell.

const fs = require('node:fs');
const path = require('node:path');
const { wirf } = require('../antwort');

const GRENZEN = Object.freeze({
  frage: 1500,      // letzte Frage
  beitrag: 1500,    // jeder frühere Beitrag im Verlauf
  code: 6000,
  ausgabe: 2000,
  verlauf: 8,       // höchstens die letzten 8 Beiträge (einschließlich der aktuellen Frage)
});

const LEKTION_RE = /^V\d\d$/;
const AUFGABE_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const SEITEN = new Set(['labor', 'lerneinheit']);

// Steuerzeichen (außer Tab und Zeilenumbruch) und Unicode-Formatzeichen (Bidi, unsichtbare Trenner)
// entfernen: Sie können Text für Menschen anders aussehen lassen, als das Modell ihn liest.
const UNSICHTBAR_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F­؜᠎​-‏‪-‮⁠-⁤⁦-⁯﻿]/g;

function saeubern(text) {
  return String(text).replace(/\r\n?/g, '\n').replace(UNSICHTBAR_RE, '');
}

// ---------------------------------------------------------------- Aufgaben (Server-Daten)

const DATEI = path.join(__dirname, '..', '..', '..', 'daten', 'aufgaben.json');
let cache = null;

function ladeAufgaben() {
  if (cache) return cache;
  let liste = [];
  let vorhanden = false;
  let termine = {};
  try {
    const roh = JSON.parse(fs.readFileSync(DATEI, 'utf8'));
    if (roh && Array.isArray(roh.aufgaben)) { liste = roh.aufgaben; vorhanden = true; }
    if (roh && roh.termine && typeof roh.termine === 'object') termine = roh.termine;
  } catch (e) {
    vorhanden = false; // ohne Datei arbeitet der Tutor nur mit der Lektion (Zeilengrenzen gelten weiter)
  }
  const lektionen = new Map();
  for (const a of liste) {
    if (!a || !LEKTION_RE.test(a.lektion)) continue;
    if (!lektionen.has(a.lektion)) lektionen.set(a.lektion, { erlaubt: Array.isArray(a.erlaubt) ? a.erlaubt.slice() : [], aufgaben: [] });
    lektionen.get(a.lektion).aufgaben.push(a);
  }
  cache = { vorhanden, lektionen, termine };
  return cache;
}

/** Nur für Tests: eigene Aufgabenliste setzen (null = wieder aus der Datei lesen). */
function _setzeAufgaben(aufgaben) {
  cache = null;
  if (aufgaben) {
    const lektionen = new Map();
    for (const a of aufgaben) {
      if (!lektionen.has(a.lektion)) lektionen.set(a.lektion, { erlaubt: a.erlaubt || [], aufgaben: [] });
      lektionen.get(a.lektion).aufgaben.push(a);
    }
    cache = { vorhanden: true, lektionen, termine: {} };
  }
}

/** Anzeigename einer Lektionskennung („V01“ → „Termin 01“). Die Kennung bleibt intern; Studierende hören nur den Termin.
 *  Die Zuordnung steht in aufgaben.json (termine, vom Build aus kurs.yaml); ohne Eintrag gilt „VNN“ = „Termin NN“. */
function terminLang(lektion) {
  if (!lektion) return null;
  const t = ladeAufgaben().termine || {};
  if (t[lektion]) return String(t[lektion]);
  const m = /^V(\d\d)$/.exec(lektion);
  return m ? 'Termin ' + m[1] : 'Termin';
}

/** Alle Aufgaben mit Musterlösung (für den Abgleich ohne oder neben der aktuellen Aufgabe). */
function alleAufgaben() {
  const d = ladeAufgaben();
  if (!d.alle) d.alle = [...d.lektionen.values()].flatMap((l) => l.aufgaben).filter((a) => a && a.loesung);
  return d.alle;
}

function findeAufgabe(lektion, seite, id) {
  if (!lektion || !id) return null;
  const l = ladeAufgaben().lektionen.get(lektion);
  if (!l) return null;
  const passend = l.aufgaben.filter((a) => a.id === id || (Array.isArray(a.ids) && a.ids.includes(id)));
  if (!passend.length) return null;
  return passend.find((a) => a.seite === seite) || passend[0];
}

// ---------------------------------------------------------------- Eingaben des Browsers

function kuerzeAnfang(text, max) {
  return text.length > max ? text.slice(0, max) + '\n[… gekürzt]' : text;
}
function kuerzeEnde(text, max) {
  return text.length > max ? '[… gekürzt]\n' + text.slice(text.length - max) : text;
}

/**
 * Prüft den Body von POST /api/tutor und liefert die bereinigte Anfrage.
 * @returns {{frage: string, verlauf: {rolle:'nutzer'|'tutor', text:string}[], lektion: string|null,
 *            seite: string|null, aufgabe: object|null, aufgabeId: string|null, code: string, ausgabe: string,
 *            erlaubt: string[]}}
 */
function anfrageAusBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) wirf(400, 'eingabe-ungueltig', 'Die Anfrage hat nicht die erwartete Form.');
  const roh = body.verlauf;
  if (!Array.isArray(roh) || roh.length === 0) wirf(400, 'frage-fehlt', 'Bitte stelle eine Frage.');
  if (roh.length > 200) wirf(400, 'eingabe-ungueltig', 'Der Verlauf ist zu lang. Starte ein neues Gespräch.');

  // Nur bekannte Rollen und Zeichenketten; alles andere wird verworfen (nicht vertrauenswürdig).
  const beitraege = [];
  for (const b of roh) {
    if (!b || typeof b !== 'object') continue;
    if (b.rolle !== 'nutzer' && b.rolle !== 'tutor') continue;
    if (typeof b.text !== 'string') continue;
    const text = saeubern(b.text).trim();
    if (!text) continue;
    beitraege.push({ rolle: b.rolle, text });
  }
  const letzte = beitraege[beitraege.length - 1];
  if (!letzte || letzte.rolle !== 'nutzer') wirf(400, 'frage-fehlt', 'Bitte stelle eine Frage.');
  if (letzte.text.length > GRENZEN.frage) {
    wirf(400, 'frage-zu-lang', `Deine Frage ist zu lang (höchstens ${GRENZEN.frage} Zeichen). Kürze sie oder teile sie auf.`);
  }
  const verlauf = beitraege.slice(-GRENZEN.verlauf).map((b, i, arr) => (
    i === arr.length - 1 ? b : { rolle: b.rolle, text: kuerzeAnfang(b.text, GRENZEN.beitrag) }
  ));

  const k = body.kontext && typeof body.kontext === 'object' && !Array.isArray(body.kontext) ? body.kontext : {};
  const lektion = typeof k.lektion === 'string' && LEKTION_RE.test(k.lektion) ? k.lektion : null;
  const seite = typeof k.seite === 'string' && SEITEN.has(k.seite) ? k.seite : null;
  const aufgabeId = lektion && typeof k.aufgabe === 'string' && AUFGABE_RE.test(k.aufgabe) ? k.aufgabe : null;
  const aufgabe = findeAufgabe(lektion, seite, aufgabeId);
  const code = typeof k.code === 'string' ? kuerzeAnfang(saeubern(k.code), GRENZEN.code) : '';
  const ausgabe = typeof k.ausgabe === 'string' ? kuerzeEnde(saeubern(k.ausgabe), GRENZEN.ausgabe) : '';

  let erlaubt = [];
  if (aufgabe && Array.isArray(aufgabe.erlaubt)) erlaubt = aufgabe.erlaubt;
  else if (lektion && ladeAufgaben().lektionen.has(lektion)) erlaubt = ladeAufgaben().lektionen.get(lektion).erlaubt;

  return {
    frage: letzte.text,
    verlauf,
    lektion,
    terminLang: terminLang(lektion),
    seite,
    aufgabe,
    aufgabeId: aufgabe ? aufgabeId : null,
    code: code.trim() ? code : '',
    ausgabe: ausgabe.trim() ? ausgabe : '',
    erlaubt,
  };
}

module.exports = { terminLang, anfrageAusBody, findeAufgabe, ladeAufgaben, alleAufgaben, saeubern, GRENZEN, _setzeAufgaben, DATEI };
