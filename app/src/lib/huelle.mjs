/* Build-Hilfen für die Hülle: welche App-Dateien existieren, Skript-Listen, Lektionskontext. */
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC, PUBLIC_APP, PLATZHALTER_VERSION } from './pfade.mjs';
import { ladeKurs, nachbar } from './kurs.mjs';

/* Globale Skripte laut Vertrag 4.3; eingebunden nur, wenn die Datei beim Build existiert. */
export const GLOBAL_FRUEH = ['speicher-azure'];                                   /* nach kern.js, vor dem Bestand */
export const GLOBAL_DEFER = ['shell', 'suche', 'tutor', 'pwa', 'werkbank-knopf']; /* mit defer, nach dem Bestand */

export function gibtApp(datei) { return fs.existsSync(path.join(PUBLIC_APP, datei)); }
export function gibtPublic(datei) { return fs.existsSync(path.join(PUBLIC, datei)); }

/* app/<name>.js|.css -> relative URL mit Versionsparameter */
export function appUrl(basis, datei) { return `${basis}app/${datei}?v=${PLATZHALTER_VERSION}`; }

/**
 * Listen der App-Dateien einer Seite.
 * art: Seitenkennung (data-page); bei neuen Seiten werden app/<art>.js und app/<art>.css automatisch eingebunden.
 * skripte/css: zusätzliche Namen aus der Seite (ohne Endung).
 */
export function appDateien({ art, neu, skripte = [], css = [] }) {
  const eindeutig = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const seitenJs = eindeutig([...(neu && art ? [art] : []), ...skripte]).filter((n) => !GLOBAL_DEFER.includes(n) && !GLOBAL_FRUEH.includes(n));
  const seitenCss = eindeutig([...(neu && art ? [art] : []), ...css]).filter((n) => !GLOBAL_DEFER.includes(n));
  for (const n of [...skripte]) if (!gibtApp(n + '.js')) throw new Error(`Seite verlangt app/${n}.js, die Datei fehlt in public/app/.`);
  for (const n of [...css]) if (!gibtApp(n + '.css')) throw new Error(`Seite verlangt app/${n}.css, die Datei fehlt in public/app/.`);
  return {
    frueh: GLOBAL_FRUEH.filter((n) => gibtApp(n + '.js')).map((n) => n + '.js'),
    defer: [...GLOBAL_DEFER, ...seitenJs].filter((n) => gibtApp(n + '.js')).map((n) => n + '.js'),
    css: eindeutig([...GLOBAL_DEFER, ...seitenCss]).filter((n) => gibtApp(n + '.css')).map((n) => n + '.css'),
  };
}

/* Kontext einer Lektionsseite für Kopfzeile und nächsten Schritt */
export function lektionsKontext(termin, art) {
  const { phasen, termine } = ladeKurs();
  const vor = nachbar(termin.nr, -1, art);
  const nach = nachbar(termin.nr, 1, art);
  let weiter = null;
  if (art === 'lerneinheit' && termin.labor) weiter = { datei: termin.labor, text: `Weiter ins Programmierlabor ${termin.nr}` };
  else {
    const n = nachbar(termin.nr, 1, 'lerneinheit');
    if (n) weiter = { datei: n.termin.lerneinheit, text: `Weiter mit ${n.termin.nr} · ${n.termin.kurz}` };
  }
  return { termin, art, vor, nach, weiter, phasen, termine };
}
