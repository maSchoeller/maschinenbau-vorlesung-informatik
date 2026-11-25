/* =============================================================
   sw-bauen.mjs – schreibt <Ausgabe>/sw.js aus sw-vorlage.js (Architektur-Vertrag 3 und 9; Rolle PWA)
   Precache: alle HTML-Seiten, assets/{css,js,vendor,data,py,fonts}, Bilder (webp, svg; png nur ohne webp-Zwilling),
   Poster und Untertitel in assets/video (png, vtt), app/** (mit ?v=<Version>), Manifest.
   Nicht im Precache: Videos (*.mp4), Pyodide, Notebooks, sw.js selbst und die Seiten abgeschalteter Lektionen
   (kurs.json: entwuerfe; sie bleiben unter ihrer Adresse direkt aufrufbar).
   Die Version liest dieses Skript aus <Ausgabe>/app/daten/build.json (schreibt version.mjs vor diesem Schritt).
   Ruft man es allein auf (nach einem Build): node skripte/sw-bauen.mjs
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DIST } from '../src/lib/pfade.mjs';

function alle(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? alle(p) : [p];
  });
}

/* Gehört die Datei (Pfad relativ zur Wurzel, mit /) in den Precache? */
export function gehoertInPrecache(rel, vorhanden, entwurfsseiten = new Set()) {
  if (entwurfsseiten.has(rel)) return false;
  if (rel === 'sw.js' || rel === '404.html') return rel === '404.html';
  if (rel.startsWith('pyodide/') || rel.startsWith('notebooks/')) return false;
  if (rel.endsWith('.html')) return true;
  if (rel === 'manifest.webmanifest') return true;
  if (rel.startsWith('app/')) return true;
  const m = /^assets\/([^/]+)\/(.+)$/.exec(rel);
  if (!m) return false;
  const [, ordner, rest] = m;
  if (['css', 'js', 'vendor', 'data', 'py', 'fonts'].includes(ordner)) return true;
  if (ordner === 'img') {
    if (/\.(webp|svg)$/i.test(rest)) return true;
    if (/\.png$/i.test(rest)) return !vorhanden.has(rel.replace(/\.png$/i, '.webp'));   /* png nur, wenn kein webp existiert */
    return false;
  }
  if (ordner === 'video') return /\.(png|vtt)$/i.test(rest);   /* Poster und Untertitel, nie die Videos */
  return false;
}

export default async function swBauen() {
  const buildJson = path.join(DIST, 'app', 'daten', 'build.json');
  if (!fs.existsSync(buildJson)) throw new Error('sw-bauen: build.json fehlt (version.mjs muss vorher laufen)');
  const { version } = JSON.parse(fs.readFileSync(buildJson, 'utf8'));
  if (!/^[0-9a-f]{12}$/.test(version)) throw new Error('sw-bauen: Version unbrauchbar: ' + version);

  const dateien = alle(DIST).map((p) => path.relative(DIST, p).split(path.sep).join('/'));
  const vorhanden = new Set(dateien);
  const kursJson = path.join(DIST, 'app', 'daten', 'kurs.json');
  const entwuerfe = fs.existsSync(kursJson) ? (JSON.parse(fs.readFileSync(kursJson, 'utf8')).entwuerfe || []) : [];
  const entwurfsseiten = new Set(entwuerfe.flatMap((e) => [e.lerneinheit, e.labor]).filter(Boolean));
  let pyVersion = '0';
  const gj = path.join(DIST, 'pyodide', 'gruppen.json');
  if (fs.existsSync(gj)) pyVersion = JSON.parse(fs.readFileSync(gj, 'utf8')).version;

  const liste = [];
  let bytes = 0;
  const teile = {};
  for (const rel of dateien.sort()) {
    if (!gehoertInPrecache(rel, vorhanden, entwurfsseiten)) continue;
    const inhalt = fs.readFileSync(path.join(DIST, rel));
    const hash = createHash('sha256').update(inhalt).digest('hex').slice(0, 12);
    const istApp = /^app\/.*\.(js|css)$/.test(rel);
    liste.push({ u: istApp ? `${rel}?v=${version}` : rel, h: hash });
    bytes += inhalt.length;
    const gruppe = rel.startsWith('assets/') ? rel.split('/')[1] : rel.startsWith('app/') ? 'app' : 'seiten';
    teile[gruppe] = (teile[gruppe] || 0) + inhalt.length;
  }
  const vorlage = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'sw-vorlage.js'), 'utf8');
  const sw = vorlage
    .split('__VERSION__').join(version)
    .split('__PYODIDE_VERSION__').join(pyVersion)
    .split('__BYTES__').join(String(bytes))
    .split('__PRECACHE__').join(JSON.stringify(liste));
  fs.writeFileSync(path.join(DIST, 'sw.js'), sw);
  const mb = (b) => (b / 1048576).toFixed(2) + ' MB';
  console.log(`sw-bauen: sw.js, Version ${version}, Precache ${liste.length} Dateien, ${mb(bytes)} (${Object.entries(teile).map(([k, v]) => k + ' ' + mb(v)).join(', ')})`);
}

/* Einzelaufruf */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await swBauen();
