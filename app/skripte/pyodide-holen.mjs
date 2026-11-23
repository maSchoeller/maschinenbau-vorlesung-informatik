/* =============================================================
   pyodide-holen.mjs – Pyodide selbst hosten (Architektur-Vertrag 3 und 9; Rolle PWA)
   1. Lädt den Kern (5 Dateien) und alle Pakete des Kurses einmalig nach app/.cache/pyodide/
      (wiederaufnehmbar; Pakete werden gegen die sha256 der pyodide-lock.json geprüft,
      Kern-Dateien gegen die Größe aus Content-Length bzw. docs/app/recherche/03-pyodide-dateien.json).
   2. Kopiert sie nach <Ausgabe>/pyodide/ und schreibt dort gruppen.json (für „Python offline bereit machen“).
   Die Paketliste wird aus der echten pyodide-lock.json abgeleitet (Abhängigkeiten rekursiv), nicht von Hand gepflegt.
   Umgebungsvariable OHNE_PYODIDE=1 überspringt alles (andere Agenten, schnelle Builds).
   Fremder Host: nur cdn.jsdelivr.net/pyodide/ (dokumentierte Fremddatei, siehe WERKZEUGE.md).
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DIST, CACHE, WURZEL } from '../src/lib/pfade.mjs';

export const VERSION = '0.26.4';
const BASIS = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
const KERN = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

/* Was der Kurs nutzt (grep über site/: matplotlib.pyplot, numpy, pandas, requests+pyodide_http, sqlite3, jedi im Editor, micropip).
   Reihenfolge = Zuordnung gemeinsamer Abhängigkeiten (erste Gruppe gewinnt). */
const GRUPPEN = [
  { id: 'daten', titel: 'Rechnen und Diagramme', hilfe: 'numpy, pandas, matplotlib', wurzeln: ['numpy', 'pandas', 'matplotlib'] },
  { id: 'netz', titel: 'Netzwerk', hilfe: 'requests', wurzeln: ['requests', 'pyodide-http'] },
  { id: 'extras', titel: 'Editor-Hilfe und SQL', hilfe: 'Autovervollständigung (Jedi), sqlite3, micropip', wurzeln: ['jedi', 'sqlite3', 'micropip'] },
];

const ORDNER = path.join(CACHE, 'pyodide');

function sha256Datei(p) {
  const h = createHash('sha256');
  h.update(fs.readFileSync(p));
  return h.digest('hex');
}

/* Datei laden: wiederaufnehmbar über <name>.part und Range; atomar umbenennen erst nach der Prüfung */
async function laden(name, pruefe) {
  const ziel = path.join(ORDNER, name);
  if (fs.existsSync(ziel)) {
    const fehler = await pruefe(ziel);
    if (!fehler) return false;
    console.log(`pyodide-holen: ${name} unbrauchbar im Cache (${fehler}), lade neu.`);
    fs.rmSync(ziel);
  }
  const teil = ziel + '.part';
  for (let versuch = 1; versuch <= 4; versuch++) {
    try {
      let start = fs.existsSync(teil) ? fs.statSync(teil).size : 0;
      const kopf = start > 0 ? { Range: `bytes=${start}-` } : {};
      const r = await fetch(BASIS + name, { headers: kopf });
      if (r.status === 416) { fs.rmSync(teil, { force: true }); start = 0; continue; }
      if (!(r.status === 200 || r.status === 206)) throw new Error(`HTTP ${r.status}`);
      if (r.status === 200 && start > 0) { fs.rmSync(teil, { force: true }); start = 0; }
      const aus = fs.createWriteStream(teil, { flags: start > 0 ? 'a' : 'w' });
      const reader = r.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!aus.write(value)) await new Promise((ok) => aus.once('drain', ok));
      }
      await new Promise((ok, nein) => { aus.end(); aus.once('finish', ok); aus.once('error', nein); });
      const fehler = await pruefe(teil);
      if (fehler) { fs.rmSync(teil, { force: true }); throw new Error(fehler); }
      fs.renameSync(teil, ziel);
      return true;
    } catch (e) {
      if (versuch === 4) throw new Error(`pyodide-holen: ${name} nicht ladbar: ${e.message}`);
      console.log(`pyodide-holen: ${name} Versuch ${versuch} fehlgeschlagen (${e.message}), neuer Versuch.`);
      await new Promise((ok) => setTimeout(ok, 1500 * versuch));
    }
  }
  return false;
}

function bekannteGroessen() {
  /* Richtwerte der Recherche, nur für die Prüfung der Kern-Dateien */
  const p = path.join(WURZEL, 'docs', 'app', 'recherche', '03-pyodide-dateien.json');
  const m = new Map();
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const g of j.gruppen.kern || []) m.set(g.datei, g.bytes);
  } catch { /* ohne Richtwerte nur Download-Länge */ }
  return m;
}

function norm(n) { return String(n).toLowerCase().replace(/_/g, '-'); }

export function paketHuelle(lock, wurzeln, schon) {
  const P = lock.packages;
  const aus = [];
  const gehe = (n) => {
    n = norm(n);
    if (schon.has(n)) return;
    const p = P[n];
    if (!p) throw new Error(`pyodide-holen: Paket "${n}" fehlt in der Lock-Datei`);
    schon.add(n);
    aus.push(p);
    for (const d of p.depends || []) gehe(d);
  };
  wurzeln.forEach(gehe);
  return aus;
}

export default async function pyodideHolen() {
  if (process.env.OHNE_PYODIDE === '1') { console.log('pyodide-holen: OHNE_PYODIDE=1, übersprungen.'); return; }
  fs.mkdirSync(ORDNER, { recursive: true });
  const richt = bekannteGroessen();

  /* 1. Kern */
  let neu = 0;
  for (const n of KERN) {
    const soll = richt.get(n);
    const hat = await laden(n, async (p) => {
      const b = fs.statSync(p).size;
      if (soll && b !== soll) return `Größe ${b} statt ${soll}`;
      if (b < 1000) return 'zu klein';
      return null;
    });
    if (hat) neu++;
  }
  const lock = JSON.parse(fs.readFileSync(path.join(ORDNER, 'pyodide-lock.json'), 'utf8'));
  if (lock.info?.version !== VERSION) throw new Error(`pyodide-holen: Lock-Datei ist Version ${lock.info?.version}, erwartet ${VERSION}`);

  /* 2. Pakete laut Lock, gruppiert */
  const gruppen = [{ id: 'kern', titel: 'Python-Kern', hilfe: 'Python selbst', dateien: KERN.map((n) => ({ datei: n, bytes: fs.statSync(path.join(ORDNER, n)).size })) }];
  const schon = new Set();
  for (const g of GRUPPEN) {
    const pakete = paketHuelle(lock, g.wurzeln, schon);
    const dateien = [];
    for (const p of pakete) {
      const hat = await laden(p.file_name, async (pf) => {
        const h = sha256Datei(pf);
        return h === p.sha256 ? null : `sha256 ${h.slice(0, 12)} statt ${p.sha256.slice(0, 12)}`;
      });
      if (hat) neu++;
      dateien.push({ datei: p.file_name, bytes: fs.statSync(path.join(ORDNER, p.file_name)).size });
    }
    gruppen.push({ id: g.id, titel: g.titel, hilfe: g.hilfe, dateien });
  }
  for (const g of gruppen) g.bytes = g.dateien.reduce((s, d) => s + d.bytes, 0);

  /* 3. Nach <Ausgabe>/pyodide/ kopieren */
  const ziel = path.join(DIST, 'pyodide');
  fs.rmSync(ziel, { recursive: true, force: true });
  fs.mkdirSync(ziel, { recursive: true });
  for (const g of gruppen) for (const d of g.dateien) fs.copyFileSync(path.join(ORDNER, d.datei), path.join(ziel, d.datei));
  const gesamt = gruppen.reduce((s, g) => s + g.bytes, 0);
  fs.writeFileSync(path.join(ziel, 'gruppen.json'), JSON.stringify({ version: VERSION, gesamt, gruppen }) + '\n');
  console.log(`pyodide-holen: ${gruppen.reduce((s, g) => s + g.dateien.length, 0)} Dateien, ${(gesamt / 1048576).toFixed(1)} MB (${neu} neu geladen) -> ${path.relative(WURZEL, ziel)}`);
}
