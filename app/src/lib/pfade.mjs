/* Feste Pfade des Projekts. Gilt im Astro-Build (cwd = app/) und in den Node-Skripten.
   Nicht über import.meta.url auflösen: Astro bündelt src/ beim Build in einen anderen Ordner. */
import fs from 'node:fs';
import path from 'node:path';

function findeApp() {
  let d = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(d, 'kurs.yaml')) && fs.existsSync(path.join(d, 'astro.config.mjs'))) return d;
    if (fs.existsSync(path.join(d, 'app', 'kurs.yaml'))) return path.join(d, 'app');
    d = path.dirname(d);
  }
  throw new Error('app/ nicht gefunden (kurs.yaml fehlt). Build bitte in app/ starten.');
}

export const APP = findeApp();
export const WURZEL = path.dirname(APP);
export const SITE = path.join(WURZEL, 'site');
export const PUBLIC = path.join(APP, 'public');
export const PUBLIC_APP = path.join(PUBLIC, 'app');
/* Ausgabeordner: Standard app/dist. Mit KURS_AUSGABE=<ordnername> (z. B. dist-nav) baut ein Agent in einen eigenen
   Ordner unter app/, damit parallele Builds sich nicht überschreiben. Nur einfache Namen, die mit "dist" beginnen. */
const AUSGABE = process.env.KURS_AUSGABE || 'dist';
if (!/^dist[a-z0-9-]*$/.test(AUSGABE)) throw new Error('KURS_AUSGABE muss mit "dist" beginnen und darf nur a-z, 0-9, - enthalten: ' + AUSGABE);
export const DIST = path.join(APP, AUSGABE);
export const API_DATEN = path.join(WURZEL, 'api', 'daten');
export const CACHE = path.join(APP, '.cache');

/* Platzhalter, die skripte/nach-build.mjs nach dem Build ersetzt */
export const PLATZHALTER_VERSION = '__KURS_VERSION__';
export const PLATZHALTER_PYODIDE = '__KURS_PYODIDE__';
