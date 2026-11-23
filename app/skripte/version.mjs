/* Build-Version: SHA-256 über die Ausgabe (Pfade und Inhalte), 12 Zeichen.
   Ersetzt __KURS_VERSION__ in allen HTML-Seiten und app/*.js, setzt die lokale Pyodide-Basis in
   app/kern.js (nur wenn dist/pyodide/ existiert) und schreibt dist/app/daten/build.json. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DIST, PLATZHALTER_VERSION, PLATZHALTER_PYODIDE } from '../src/lib/pfade.mjs';

function alle(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? alle(p) : [p];
  });
}

export function versionSetzen() {
  const dateien = alle(DIST).filter((p) => !p.endsWith(path.join('app', 'daten', 'build.json')) && !p.endsWith(path.sep + 'sw.js')).sort();
  const h = createHash('sha256');
  for (const p of dateien) { h.update(path.relative(DIST, p).split(path.sep).join('/')); h.update('\0'); h.update(fs.readFileSync(p)); h.update('\0'); }
  const version = h.digest('hex').slice(0, 12);
  const pyodide = fs.existsSync(path.join(DIST, 'pyodide', 'pyodide.js')) ? 'pyodide/' : '';

  let n = 0;
  for (const p of dateien) {
    const rel = path.relative(DIST, p).split(path.sep).join('/');
    const istHtml = rel.endsWith('.html');
    const istApp = /^app\/[^/]+\.js$/.test(rel);
    if (!istHtml && !istApp) continue;
    const alt = fs.readFileSync(p, 'utf8');
    let neu = alt.split(PLATZHALTER_VERSION).join(version);
    if (rel === 'app/kern.js') neu = neu.split(PLATZHALTER_PYODIDE).join(pyodide);
    if (neu !== alt) { fs.writeFileSync(p, neu); n++; }
  }
  fs.mkdirSync(path.join(DIST, 'app', 'daten'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'app', 'daten', 'build.json'), JSON.stringify({ version, erstellt: new Date().toISOString(), pyodide: pyodide || null }) + '\n');
  return { version, pyodide, dateien: n };
}
