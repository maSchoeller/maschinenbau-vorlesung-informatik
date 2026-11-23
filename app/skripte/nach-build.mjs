/* =============================================================
   nach-build.mjs – läuft nach `astro build` (Architektur-Vertrag, Abschnitt 3)
   Reihenfolge: assets-kopieren · index-bauen · pyodide-holen (PWA) · Version setzen · sw-bauen (PWA)
   Fehlende Skripte anderer Rollen werden mit Hinweis übersprungen.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { APP } from '../src/lib/pfade.mjs';
import { versionSetzen } from './version.mjs';

const SKRIPTE = path.join(APP, 'skripte');

async function lauf(name, pflicht) {
  const datei = path.join(SKRIPTE, name);
  if (!fs.existsSync(datei)) {
    if (pflicht) throw new Error(`nach-build: ${name} fehlt`);
    console.log(`nach-build: ${name} fehlt noch, übersprungen.`);
    return;
  }
  const t0 = Date.now();
  const mod = await import(pathToFileURL(datei).href);
  if (typeof mod.default === 'function') await mod.default();
  console.log(`nach-build: ${name} fertig (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

await lauf('assets-kopieren.mjs', true);
await lauf('index-bauen.mjs', true);
await lauf('pyodide-holen.mjs', false);
const v = versionSetzen();
console.log(`nach-build: Version ${v.version}${v.pyodide ? ', Pyodide lokal unter ' + v.pyodide : ', Pyodide vom CDN'}`);
await lauf('sw-bauen.mjs', false);
