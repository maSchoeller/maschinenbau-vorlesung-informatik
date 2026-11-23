/* kurs.yaml lesen und prüfen. Eine Quelle für die 22 Termine. */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { APP, SITE } from './pfade.mjs';

let zwischen = null;

function fehler(t) { throw new Error('kurs.yaml: ' + t); }

export function ladeKurs() {
  if (zwischen) return zwischen;
  const roh = YAML.parse(fs.readFileSync(path.join(APP, 'kurs.yaml'), 'utf8'));
  if (!roh || !Array.isArray(roh.termine) || !Array.isArray(roh.phasen)) fehler('phasen und termine fehlen');
  const phasen = roh.phasen.map((p) => ({ nr: p.nr, name: String(p.name), bereich: String(p.bereich || ''), leitsatz: String(p.leitsatz || '') }));
  const termine = roh.termine.map((t, i) => {
    const nr = String(t.nr || '');
    if (!/^V\d\d$/.test(nr)) fehler(`Termin ${i + 1}: nr "${nr}" ist ungültig`);
    for (const k of ['titel', 'kurz', 'hook', 'lerneinheit']) if (!t[k]) fehler(`${nr}: Feld ${k} fehlt`);
    if (!phasen.some((p) => p.nr === t.phase)) fehler(`${nr}: Phase ${t.phase} unbekannt`);
    const pruefe = (ordner, datei, feld) => {
      if (datei == null) return null;
      const p = path.join(SITE, ordner, datei);
      if (!fs.existsSync(p)) fehler(`${nr}: ${feld} "${ordner}/${datei}" existiert nicht`);
      return String(datei);
    };
    let freigabe = t.freigabe == null ? null : t.freigabe;
    if (freigabe instanceof Date) freigabe = freigabe.toISOString().slice(0, 10);
    if (freigabe != null && !/^\d{4}-\d\d-\d\d$/.test(String(freigabe))) fehler(`${nr}: freigabe "${freigabe}" ist kein Datum JJJJ-MM-TT`);
    return {
      nr,
      titel: String(t.titel),
      kurz: String(t.kurz),
      hook: String(t.hook),
      python: Array.isArray(t.python) ? t.python.map(String) : [],
      phase: t.phase,
      lerneinheit: pruefe('lektionen', t.lerneinheit, 'lerneinheit'),
      labor: pruefe('lektionen', t.labor, 'labor'),
      notebook: pruefe('notebooks', t.notebook, 'notebook'),
      freigabe: freigabe == null ? null : String(freigabe),
    };
  });
  if (termine.length !== 22) fehler(`erwartet 22 Termine, gefunden ${termine.length}`);
  const doppelt = termine.map((t) => t.nr).filter((n, i, a) => a.indexOf(n) !== i);
  if (doppelt.length) fehler('doppelte Nummern: ' + doppelt.join(', '));
  zwischen = { phasen, termine };
  return zwischen;
}

/* Termin zu einer Lektionsdatei (z. B. 'v07-labor.html') -> {termin, art: 'lerneinheit'|'labor'} */
export function terminZuDatei(datei) {
  const { termine } = ladeKurs();
  for (const t of termine) {
    if (t.lerneinheit === datei) return { termin: t, art: 'lerneinheit' };
    if (t.labor === datei) return { termin: t, art: 'labor' };
  }
  return null;
}

/* Nachbar in derselben Ansicht: Labor -> Labor der Nachbarlektion, sonst deren Lerneinheit */
export function nachbar(nr, richtung, art) {
  const { termine } = ladeKurs();
  const i = termine.findIndex((t) => t.nr === nr);
  const n = termine[i + richtung];
  if (!n) return null;
  const datei = art === 'labor' && n.labor ? n.labor : n.lerneinheit;
  return { termin: n, datei, art: datei === n.labor ? 'labor' : 'lerneinheit' };
}
