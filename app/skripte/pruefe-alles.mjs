/* =============================================================
   pruefe-alles.mjs – Gesamtprüfung der Lern-App mit einem Befehl (Rolle Integration)

   Aufruf (Node 22 aus .werkzeuge, siehe docs/app/WERKZEUGE.md):
     cd app && npm run pruefen:alles -- [--ausgabe dist-int] [--port 4340] [--api-port 7340]
                                        [--ohne-build] [--nur seiten,offline] [--ohne <teil>]
   Ablauf:
     1. bauen         KURS_AUSGABE=<ausgabe> npm run build
     2. api           npm test in api/
     3. selbsttest    Byte-Genauigkeit site/ -> dist
     4. Emulator      swa start app/<ausgabe> --swa-config-location app/<ausgabe> --api-location api (TUTOR_DOPPEL=1, eigene Datei-Ablage
                      api/.daten/<ausgabe>/ablage.json, frisch je Lauf; ANTHROPIC_API_KEY wird entfernt;
                      DOZENT_IDS = Testidentität „pruef-dozent“ aus pruefe-dozent.mjs)
     5. dozent (zuerst: braucht die frische Ablage), loesungen (Musterlösungen der neuen Terminseiten), seiten, navigation, offline, abgleich, werkbank,
                      tutor-oberflaeche, zusammenspiel (Browser)
     6. tutor-angriffe  Trockenlauf mit Modell-Doppel
   Am Ende: Tabelle je Teil (bestanden/Fehler, Zahl der Prüfungen, Dauer). Alle gestarteten Prozesse
   werden beendet, auch bei Fehlern und Strg+C. Exit-Code 1, wenn ein Teil scheitert.
   ============================================================= */
import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WURZEL = path.resolve(APP, '..');
const API = path.join(WURZEL, 'api');

const args = process.argv.slice(2);
const wert = (n, std) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : std; };
const AUSGABE = wert('ausgabe', process.env.KURS_AUSGABE || 'dist-int');
const PORT = Number(wert('port', 4340));
const API_PORT = Number(wert('api-port', 7340));
const NUR = wert('nur', '') ? wert('nur', '').split(',') : null;
const OHNE = wert('ohne', '') ? wert('ohne', '').split(',') : [];
const OHNE_BUILD = args.includes('--ohne-build');
const BASIS = `http://localhost:${PORT}`;
if (AUSGABE === 'dist' && !args.includes('--dist-erlaubt')) { console.error('Bitte nicht nach app/dist prüfen (parallel genutzt). --ausgabe dist-<name> verwenden.'); process.exit(2); }

/* Node 22 und Werkzeuge vorn im PATH (auch für Kindprozesse) */
const sep = process.platform === 'win32' ? ';' : ':';
const PFAD = [path.join(WURZEL, '.werkzeuge', 'node22'), path.join(WURZEL, '.werkzeuge', 'node_modules', '.bin'), process.env.PATH].join(sep);
const ABLAGE_DATEI = path.join(API, '.daten', AUSGABE, 'ablage.json');
/* Testidentität der Dozenten-Prüfung (pruefe-dozent.mjs): Kennung wie api/src/lib/auth.js sie berechnet */
const SALT = 'lokal-test';
const DOZENT_IDS = crypto.createHmac('sha256', SALT).update('github:pruef-dozent', 'utf8').digest('hex').slice(0, 32);
const UMGEBUNG = { ...process.env, PATH: PFAD, Path: PFAD, KURS_AUSGABE: AUSGABE, FORCE_COLOR: '0' };
delete UMGEBUNG.ANTHROPIC_API_KEY;   // Tutor nur mit Doppel / Trockenlauf
delete UMGEBUNG.ANTHROPIC_BASE_URL;

const prozesse = new Set();
function toeten(kind) {
  if (!kind || kind.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(kind.pid), '/T', '/F'], { stdio: 'ignore' });
  else { try { process.kill(-kind.pid, 'SIGKILL'); } catch (e) { try { kind.kill('SIGKILL'); } catch (_) {} } }
}
/* Prozesse auf den eigenen Ports (falls ein Emulator-Kind übrig bleibt) */
function portsFreigeben() {
  if (process.platform !== 'win32') return;
  const ps = `foreach ($p in ${PORT},${API_PORT}) { Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }`;
  spawnSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'ignore' });
}
function aufraeumen() { for (const k of prozesse) toeten(k); prozesse.clear(); portsFreigeben(); }
process.on('SIGINT', () => { aufraeumen(); process.exit(130); });
process.on('SIGTERM', () => { aufraeumen(); process.exit(143); });
process.on('exit', () => { for (const k of prozesse) toeten(k); });

/* Befehl ausführen, Ausgabe durchreichen und sammeln */
function lauf(befehl, argumente, opt = {}) {
  return new Promise((ok) => {
    const kind = spawn(befehl, argumente, { cwd: opt.cwd || APP, env: { ...UMGEBUNG, ...(opt.env || {}) }, shell: true, windowsHide: true });
    prozesse.add(kind);
    let text = '';
    const zeit = opt.zeitlimit ? setTimeout(() => { text += '\n[pruefe-alles] Zeitlimit erreicht, abgebrochen.\n'; toeten(kind); }, opt.zeitlimit) : null;
    const mit = (d) => { const s = d.toString(); text += s; if (!opt.still) process.stdout.write(s); };
    kind.stdout.on('data', mit); kind.stderr.on('data', mit);
    kind.on('close', (code) => { clearTimeout(zeit); prozesse.delete(kind); ok({ code, text }); });
    kind.on('error', (e) => { clearTimeout(zeit); prozesse.delete(kind); ok({ code: 1, text: text + String(e) }); });
  });
}

/* Zahl der Prüfungen aus der Ausgabe eines Teils */
const zaehler = {
  api: (t) => { const p = /# pass (\d+)/.exec(t), f = /# fail (\d+)/.exec(t); return p ? `${p[1]} bestanden, ${f ? f[1] : 0} fehlgeschlagen` : null; },
  selbsttest: (t) => { const p = /# pass (\d+)/.exec(t), f = /# fail (\d+)/.exec(t); return p ? `${p[1]} bestanden, ${f ? f[1] : 0} fehlgeschlagen` : null; },
  seiten: (t) => { const m = /(\d+) Prüfungen \(([^)]+)\), (\d+) mit Fehlern/.exec(t); return m ? `${m[1]} (${m[2]}), ${m[3]} Fehler` : null; },
  allgemein: (t) => {
    const m = [...t.matchAll(/(\d+) von (\d+) (?:Prüfungen )?bestanden/g)].pop() || [...t.matchAll(/Alle (\d+) Prüfungen bestanden/g)].pop();
    if (m) return m[2] ? `${m[1]} von ${m[2]}` : `${m[1]} von ${m[1]}`;
    const ok = (t.match(/^\s*ok\b/gm) || []).length, f = (t.match(/^\s*FEHLER\b/gm) || []).length;
    return ok + f ? `${ok} bestanden, ${f} fehlgeschlagen` : null;
  },
  angriffe: (t) => { const m = /(\d+) Fälle?[^\n]*/.exec(t); const z = t.trim().split('\n').filter((l) => /abgewehrt|Summe|Trockenlauf|Fälle/.test(l)).pop(); return z ? z.trim().slice(0, 90) : (m ? m[0] : null); },
};

const TEILE = [
  { id: 'api', name: 'api npm test', fn: () => lauf('npm', ['test'], { cwd: API, zeitlimit: 10 * 60000 }), zahl: zaehler.api },
  { id: 'selbsttest', name: 'selbsttest', fn: () => lauf('npm', ['run', 'selbsttest'], { zeitlimit: 5 * 60000 }), zahl: zaehler.selbsttest },
  { id: 'dozent', name: 'pruefe-dozent', emulator: true, fn: () => lauf('node', ['skripte/pruefe-dozent.mjs', BASIS], { zeitlimit: 10 * 60000 }), zahl: zaehler.allgemein },
  { id: 'loesungen', name: 'pruefe-loesungen', emulator: true, fn: () => lauf('node', ['skripte/pruefe-loesungen.mjs', BASIS], { zeitlimit: 15 * 60000 }), zahl: zaehler.allgemein },
  { id: 'seiten', name: 'pruefe-seiten', emulator: true, fn: () => lauf('node', ['skripte/pruefe-seiten.mjs', BASIS, '--ohne-fotos'], { zeitlimit: 15 * 60000 }), zahl: zaehler.seiten },
  { id: 'navigation', name: 'pruefe-navigation', emulator: true, fn: () => lauf('node', ['skripte/pruefe-navigation.mjs', BASIS], { zeitlimit: 10 * 60000 }), zahl: zaehler.allgemein },
  { id: 'offline', name: 'pruefe-offline', emulator: true, fn: () => lauf('node', ['skripte/pruefe-offline.mjs', BASIS], { zeitlimit: 30 * 60000 }), zahl: zaehler.allgemein },
  { id: 'abgleich', name: 'pruefe-abgleich', emulator: true, fn: () => lauf('node', ['skripte/pruefe-abgleich.mjs', BASIS], { zeitlimit: 20 * 60000 }), zahl: zaehler.allgemein },
  { id: 'werkbank', name: 'pruefe-werkbank', emulator: true, fn: () => lauf('node', ['skripte/pruefe-werkbank.mjs', BASIS], { zeitlimit: 20 * 60000 }), zahl: zaehler.allgemein },
  { id: 'tutor', name: 'Tutor-Oberfläche', emulator: true, fn: () => lauf('node', ['tests/tutor-oberflaeche-lauf.js', BASIS], { cwd: API, zeitlimit: 10 * 60000 }), zahl: zaehler.allgemein },
  { id: 'zusammenspiel', name: 'pruefe-zusammenspiel', emulator: true, fn: () => lauf('node', ['skripte/pruefe-zusammenspiel.mjs', BASIS], { zeitlimit: 20 * 60000 }), zahl: zaehler.allgemein },
  { id: 'angriffe', name: 'Tutor-Angriffe (Trockenlauf)', fn: () => lauf('node', ['tests/tutor-angriffe-lauf.js', '--bericht', path.join(API, '.daten', AUSGABE, 'angriffe-bericht.json')], { cwd: API, zeitlimit: 10 * 60000 }), zahl: zaehler.angriffe },
].filter((t) => (!NUR || NUR.includes(t.id)) && !OHNE.includes(t.id));

async function warteAufApi(ms) {
  const ende = Date.now() + ms;
  while (Date.now() < ende) {
    try {
      const r = await fetch(BASIS + '/api/status', { signal: AbortSignal.timeout(3000) });
      if (r.ok) { const j = await r.json(); if (j.ok) return j; }
    } catch (e) { /* noch nicht da */ }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

let emulator = null;
async function emulatorStarten() {
  portsFreigeben();
  fs.rmSync(path.dirname(ABLAGE_DATEI), { recursive: true, force: true });
  fs.mkdirSync(path.dirname(ABLAGE_DATEI), { recursive: true });
  const log = fs.createWriteStream(path.join(APP, '.cache', `emulator-${AUSGABE}.log`));
  emulator = spawn('swa', ['start', `app/${AUSGABE}`, '--swa-config-location', `app/${AUSGABE}`, '--api-location', 'api', '--port', String(PORT), '--api-port', String(API_PORT)], {
    cwd: WURZEL, shell: true, windowsHide: true,
    env: { ...UMGEBUNG, TUTOR_DOPPEL: '1', ABLAGE: 'datei', ABLAGE_DATEI, BENUTZER_SALT: SALT, DOZENT_IDS },
  });
  prozesse.add(emulator);
  emulator.stdout.pipe(log); emulator.stderr.pipe(log);
  const st = await warteAufApi(150000);
  if (!st) throw new Error(`Emulator antwortet nicht unter ${BASIS}/api/status (Log: app/.cache/emulator-${AUSGABE}.log)`);
  if (!st.tutor) throw new Error('/api/status meldet tutor:false trotz TUTOR_DOPPEL=1');
  console.log(`\n[pruefe-alles] Emulator bereit: ${BASIS} (Ablage ${path.relative(WURZEL, ABLAGE_DATEI)}, tutor:${st.tutor})`);
}

const ergebnisse = [];
function dauer(ms) { const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`; }

async function main() {
  fs.mkdirSync(path.join(APP, '.cache'), { recursive: true });
  const start = Date.now();
  if (!OHNE_BUILD) {
    console.log(`\n=== bauen (KURS_AUSGABE=${AUSGABE}) ===`);
    const t0 = Date.now();
    const r = await lauf('npm', ['run', 'build'], { zeitlimit: 15 * 60000, still: true });
    const zeile = (r.text.match(/^sw-bauen:.*$/m) || [''])[0];
    ergebnisse.push({ name: 'bauen', ok: r.code === 0, zahl: zeile.replace(/^sw-bauen: /, '').slice(0, 90), ms: Date.now() - t0 });
    if (r.code !== 0) { console.log(r.text.slice(-3000)); throw new Error('Build fehlgeschlagen'); }
    console.log(zeile);
  }
  if (!fs.existsSync(path.join(APP, AUSGABE, 'index.html'))) throw new Error(`app/${AUSGABE} fehlt (ohne --ohne-build bauen)`);
  for (const teil of TEILE) {
    if (teil.emulator && !emulator) await emulatorStarten();
    console.log(`\n=== ${teil.name} ===`);
    const t0 = Date.now();
    const r = await teil.fn();
    const ok = r.code === 0;
    ergebnisse.push({ name: teil.name, ok, zahl: teil.zahl(r.text) || '', ms: Date.now() - t0 });
  }
  return Date.now() - start;
}

let gesamt = 0, abbruch = null;
try { gesamt = await main(); } catch (e) { abbruch = e; } finally { aufraeumen(); }

console.log('\n================ Gesamtprüfung ================');
const breite = Math.max(...ergebnisse.map((e) => e.name.length), 10);
for (const e of ergebnisse) console.log(`${e.ok ? 'bestanden' : 'FEHLER   '}  ${e.name.padEnd(breite)}  ${dauer(e.ms).padStart(10)}  ${e.zahl}`);
if (abbruch) console.log(`ABBRUCH: ${abbruch.message}`);
const fehlerhaft = ergebnisse.filter((e) => !e.ok).length + (abbruch ? 1 : 0);
console.log(`${ergebnisse.length - ergebnisse.filter((e) => !e.ok).length} von ${ergebnisse.length} Teilen bestanden${gesamt ? ', Dauer ' + dauer(gesamt) : ''}.`);
process.exit(fehlerhaft ? 1 : 0);
