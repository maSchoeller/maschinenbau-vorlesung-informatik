/* =============================================================
   pruefe-offline.mjs – wiederholbare Beweise für PWA und Offline (Rolle PWA)
   Aufruf:  node skripte/pruefe-offline.mjs [http://localhost:4322] [--nur t1,t4] [--ohne-update]
   Voraussetzung: gebauter Stand läuft unter der Basis-URL (swa start app/dist-pwa --api-location api --port 4322 --api-port 7332),
   KURS_AUSGABE zeigt auf denselben Ausgabeordner wie der Build (Standard dist). Jeder Test bekommt einen eigenen Browser-Kontext.
   Tests:
     t1  Schriften selbst gehostet, keine Anfrage an fremde Hosts
     t2  Python mit gesperrtem Fremdnetz: print, Jedi, numpy, pandas, matplotlib (V14), requests (V17), sqlite3 (V19)
     t3  nach erstem Besuch ohne Netz: Heute, Lernpfad, Lerneinheit, Labor, Bibliothek, Suche, Rückfallseite
     t4  „Python offline bereit machen“, dann ohne Netz alles aus t2
     t5  Videos offline speichern (gleiche und fremde Herkunft), Range-Anfragen mit 206, Wiedergabe soweit der Browser den Codec hat
     t6  /api und /.auth werden nie aus dem Cache beantwortet
     t7  Update: neuer Build -> Hinweis „Neue Version verfügbar“ -> nach Neuladen neue Version (baut selbst neu, stellt danach wieder her)
     t8  Manifest, Symbole, Meta-Angaben
     t9  fehlt das Symbol-Sprite beim Installieren, scheitert die Installation
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { DIST, APP } from '../src/lib/pfade.mjs';

const args = process.argv.slice(2);
const BASIS = (args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:4322').replace(/\/+$/, '');
const ORIGIN = new URL(BASIS).origin;
const nur = args.includes('--nur') ? args[args.indexOf('--nur') + 1].split(',') : null;
const ohneUpdate = args.includes('--ohne-update');

const ergebnisse = [];
let fehler = 0;
function pruefe(name, ok, detail) {
  ergebnisse.push({ name, ok, detail });
  if (!ok) fehler++;
  console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${name}${detail ? ' – ' + detail : ''}`);
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

let browser;
async function kontext(opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const fremd = [];
  if (!opt.fremdErlauben) {
    await ctx.route((u) => /^https?:$/.test(u.protocol) && u.origin !== ORIGIN, (route) => { fremd.push(route.request().url()); route.abort(); });
  }
  ctx.fremd = fremd;
  return ctx;
}
function beobachte(page) {
  const o = { konsole: [], fehlgeschlagen: [] };
  page.on('console', (m) => { if (m.type() === 'error') o.konsole.push(m.text()); });
  page.on('pageerror', (e) => o.konsole.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => o.fehlgeschlagen.push(r.url() + ' ' + (r.failure() && r.failure().errorText)));
  return o;
}
/* Anfragen, die offline scheitern dürfen: API, Anmeldung, und Dateien, die es schon im Bestand nicht gibt (Poster/Untertitel ungedrehter Videos) */
function erlaubtFehlgeschlagen(url) {
  const u = new URL(url);
  if (u.origin !== ORIGIN) return false;
  if (/^\/(api|\.auth)\//.test(u.pathname)) return true;
  if (/\.mp4$/i.test(u.pathname)) return true;   /* Videos sind absichtlich nicht im Precache */
  const p = decodeURIComponent(u.pathname).replace(/^\/+/, '');
  return !fs.existsSync(path.join(DIST, p));
}
async function swBereit(page, ms = 60000) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => 1));
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await page.evaluate(async () => (window.KursPwa ? await window.KursPwa.status() : null)).catch(() => null);
    if (st && st.meta) return st;
    await warte(400);
  }
  throw new Error('Service Worker nicht bereit (Precache nicht abgeschlossen)');
}

/* Python-Läufe über denselben Weg wie die Seiten (KursPy aus kurs.js) */
const PY_FAELLE = [
  { name: 'print', code: 'print("Hallo", 6 * 7)', erwarte: /Hallo 42/ },
  { name: 'numpy', code: 'import numpy as np\nprint("np", int(np.arange(5).sum()))', erwarte: /np 10/ },
  { name: 'pandas', code: 'import pandas as pd\nprint("pd", int(pd.DataFrame({"a": [1, 2, 3]})["a"].sum()))', erwarte: /pd 6/ },
  { name: 'matplotlib (V14)', code: 'import matplotlib.pyplot as plt\nzeit = [0, 1, 2, 3, 4, 5]\nv = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]\nplt.plot(zeit, v)\nplt.xlabel("Zeit t in s")\nplt.grid(True)\nplt.show()\nprint("plot ok")', erwarte: /plot ok/, bild: true },
  { name: 'requests (V17)', code: 'import requests\nr = requests.get("../assets/data/v17/api/D2.json")\nprint("http", r.status_code, sorted(r.json().keys())[:1])', erwarte: /http 200/ },
  { name: 'sqlite3 (V19)', code: 'import sqlite3\ndb = sqlite3.connect("fz3.db")\nprint("zeilen", db.execute("SELECT COUNT(*) FROM auftraege").fetchone()[0] > 0)', erwarte: /zeilen True/, dateien: ['../assets/data/v19/fz3.db'] },
];
async function pythonFaelle(page, vorsatz) {
  for (const f of PY_FAELLE) {
    const r = await page.evaluate(async (f) => {
      const out = []; let bild = false;
      const res = await window.KursPy.run(f.code, { timeout: 120000, onOut: (t) => out.push(t), onErr: (t) => out.push('ERR ' + t), onRich: () => { bild = true; }, files: f.dateien || [] });
      return { out: out.join(''), error: res.error || null, timedOut: !!res.timedOut, bild };
    }, f);
    const ok = !r.error && !r.timedOut && f.erwarte.test(r.out) && (!f.bild || r.bild);
    pruefe(`${vorsatz}${f.name}`, ok, ok ? (f.bild ? 'Diagramm erzeugt' : r.out.trim().slice(0, 60)) : (r.error || (r.timedOut ? 'Zeitüberschreitung' : r.out)).toString().slice(0, 200));
  }
  /* Jedi: Vervollständigung und Hilfe im Editor */
  const j = await page.evaluate(async () => {
    try {
      await window.KursPy.ensureJedi();
      const c = await window.KursPy.rpc('complete', { code: 'import math\nmath.sq', line: 2, col: 7 });
      const h = await window.KursPy.rpc('help', { code: 'print', line: 1, col: 3 });
      return { namen: (c.items || []).map((x) => x[0]), hilfe: !!(h && h.doc) };
    } catch (e) { return { fehler: String(e && e.message || e) }; }
  });
  pruefe(`${vorsatz}Jedi (Autovervollständigung, Hilfe)`, !j.fehler && j.namen.includes('sqrt') && j.hilfe, j.fehler || `sqrt gefunden, Hilfe: ${j.hilfe}`);
}

/* ── t1 ──────────────────────────────────────────────────────── */
async function t1() {
  console.log('t1 Schriften selbst gehostet');
  const ctx = await kontext(); const page = await ctx.newPage(); const b = beobachte(page);
  const woff = [];
  page.on('response', (r) => { if (/\.woff2(\?|$)/.test(r.url())) woff.push(r.url().split('/').pop() + ' ' + r.status()); });
  await page.goto(`${BASIS}/lektionen/v07-funktionen.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const f = await page.evaluate(() => [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family.replace(/"/g, '') + ' ' + x.weight));
  pruefe('Source Sans 3 aus eigener Datei geladen', f.some((x) => /Source Sans 3/.test(x)), `${f.join(', ')}; ${woff.join(', ')}`);
  const aktiv = await page.evaluate(() => getComputedStyle(document.body).fontFamily + '|' + document.fonts.check('16px "Source Sans 3"'));
  pruefe('Schrift im Text aktiv', /Source Sans 3/.test(aktiv) && aktiv.endsWith('true'), aktiv);
  pruefe('keine Anfrage an fremde Hosts (fonts.googleapis.com, gstatic …)', ctx.fremd.length === 0, ctx.fremd.slice(0, 3).join(', '));
  pruefe('keine Konsolenfehler', b.konsole.filter((t) => !/404|ERR_/.test(t)).length === 0, b.konsole.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ── t2 ──────────────────────────────────────────────────────── */
async function t2() {
  console.log('t2 Python mit gesperrtem Fremdnetz');
  const ctx = await kontext(); const page = await ctx.newPage(); const b = beobachte(page);
  await page.goto(`${BASIS}/lektionen/v17-labor.html`);
  await pythonFaelle(page, '');
  pruefe('keine Anfrage an fremde Hosts (jsDelivr, PyPI, pythonhosted …)', ctx.fremd.length === 0, ctx.fremd.slice(0, 3).join(', '));
  await ctx.close();
}

/* ── t3 ──────────────────────────────────────────────────────── */
async function t3() {
  console.log('t3 Seiten ohne Netz nach erstem Besuch');
  const ctx = await kontext(); const page = await ctx.newPage(); const b = beobachte(page);
  await page.goto(`${BASIS}/index.html`);
  const st = await swBereit(page);
  pruefe('Precache vollständig', st.meta.fehlend.length === 0, `${st.meta.anzahl} Dateien, ${(st.meta.bytes / 1048576).toFixed(2)} MB, Version ${st.version}`);
  pruefe('Seite steht unter Kontrolle des Service Workers', await page.evaluate(() => !!navigator.serviceWorker.controller));
  await ctx.setOffline(true);
  b.fehlgeschlagen.length = 0; b.konsole.length = 0;
  const seiten = [['Heute', 'index.html'], ['Lernpfad', 'lernpfad.html'], ['Lerneinheit V07', 'lektionen/v07-funktionen.html'], ['Labor V14', 'lektionen/v14-labor.html'], ['Bibliothek', 'bibliothek.html'], ['Glossar', 'glossar.html']];
  for (const [name, p] of seiten) {
    await page.goto(`${BASIS}/${p}`, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({ rail: !!document.querySelector('.app-rail'), h1: (document.querySelector('h1') || {}).textContent || document.title, offlineSeite: /offline nicht da/.test(document.body.textContent), onl: navigator.onLine }));
    pruefe(`offline: ${name}`, r.rail && r.h1.length > 0 && !r.offlineSeite, r.h1.slice(0, 40));
  }
  /* Suche (Strg+K) */
  await page.goto(`${BASIS}/index.html`);
  await page.keyboard.press('Control+k');
  await warte(600);
  const dlg = await page.evaluate(() => { const d = document.querySelector('[role="dialog"], dialog[open], .suche'); return !!d && d.getBoundingClientRect().width > 0; });
  if (dlg) {
    await page.keyboard.type('Schleife');
    await warte(800);
    const treffer = await page.evaluate(() => document.querySelectorAll('[role="dialog"] a, dialog a, .suche a').length);
    pruefe('offline: Suche liefert Treffer für „Schleife“', treffer > 0, treffer + ' Treffer');
  } else {
    const idx = await page.evaluate(async () => { try { const r = await fetch('app/daten/suche.json'); return (await r.json()).eintraege.length; } catch (e) { return -1; } });
    pruefe('offline: Suchindex lesbar (Suchdialog in diesem Build nicht gefunden)', idx > 0, idx + ' Einträge');
  }
  /* Rückfallseite für Unbekanntes */
  await page.goto(`${BASIS}/lektionen/v99-gibt-es-nicht.html`);
  const rf = await page.evaluate(() => ({ h1: (document.querySelector('h1') || {}).textContent, rail: getComputedStyle(document.querySelector('.app-rail') || document.body).position, link: (document.querySelector('.pwa-offline a') || {}).href }));
  pruefe('offline: unbekannte Seite zeigt Rückfallseite mit Stil und richtigen Verweisen', /offline nicht da/.test(rf.h1 || '') && rf.rail === 'fixed' && rf.link === `${BASIS}/index.html`, JSON.stringify(rf));
  const echte = b.fehlgeschlagen.filter((u) => !erlaubtFehlgeschlagen(u.split(' ')[0]));
  pruefe('offline: keine fehlgeschlagene Anfrage an vorhandene Dateien', echte.length === 0, echte.slice(0, 4).join(' | '));
  const konsole = b.konsole.filter((t) => !/ERR_INTERNET_DISCONNECTED|Failed to load resource|Keine Verbindung/.test(t));
  pruefe('offline: keine Skriptfehler', konsole.length === 0, konsole.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ── t4 ──────────────────────────────────────────────────────── */
async function t4() {
  console.log('t4 „Python offline bereit machen“, dann ohne Netz');
  const ctx = await kontext(); const page = await ctx.newPage(); const b = beobachte(page);
  await page.goto(`${BASIS}/konto.html`);
  await swBereit(page);
  const knopf = page.getByRole('button', { name: /Python offline bereit machen/ });
  await knopf.waitFor({ timeout: 15000 });
  const beschriftung = await knopf.textContent();
  pruefe('Knopf nennt die Größe', /\d+ MB/.test(beschriftung), beschriftung.trim());
  const gruppen = await page.locator('.pwa-gruppe').allTextContents();
  const flaeche = await page.evaluate(() => { const b = getComputedStyle(document.querySelector('.pwa-box')), l = getComputedStyle(document.querySelector('.pwa-liste')); return { box: b.borderTopWidth + '/' + b.backgroundColor, liste: l.borderLeftWidth + '/' + l.borderRightWidth }; });
  pruefe('Offline-Bereich ohne Kartenrahmen, Liste ohne umlaufenden Rahmen (DESIGN Regel 1 und 2)', /^0px\//.test(flaeche.box) && flaeche.liste === '0px/0px', JSON.stringify(flaeche));
  pruefe('Gruppen mit Größe angezeigt', gruppen.length >= 4, gruppen.map((g) => g.replace(/\s+/g, ' ')).join(' | ').slice(0, 220));
  await knopf.click();
  await page.waitForFunction(() => /Fertig|fehlgeschlagen/.test((document.querySelector('.pwa-block [aria-live="polite"][role="status"]:not(.pwa-status)') || {}).textContent || document.body.textContent), null, { timeout: 240000 });
  const meld = await page.locator('.pwa-block p[role="status"]').first().textContent();
  pruefe('Download abgeschlossen', /Fertig/.test(meld), meld.slice(0, 120));
  const anzahl = await page.evaluate(async () => { const c = await caches.open('kurs-pyodide-0.26.4'); return (await c.keys()).length; });
  pruefe('28 Pyodide-Dateien im Cache', anzahl === 28, String(anzahl));
  const spei = await page.locator('.pwa-block p.pwa-text').filter({ hasText: 'Belegt' }).first().textContent().catch(() => '');
  pruefe('Speicherbelegung wird angezeigt', /Belegt/.test(spei), spei.slice(0, 100));
  await page.waitForFunction(() => { const m = /Belegt: (\d+) MB/.exec(document.body.textContent); return m && +m[1] >= 60; }, null, { timeout: 15000 }).then(
    () => pruefe('Speicherbelegung wird nach dem Download neu gemessen (>= 60 MB)', true),
    async () => pruefe('Speicherbelegung wird nach dem Download neu gemessen (>= 60 MB)', false, (await page.locator('.pwa-block p.pwa-text').filter({ hasText: 'Belegt' }).first().textContent()).slice(0, 60)));
  await page.goto(`${BASIS}/lektionen/v17-labor.html`);
  await swBereit(page);
  await ctx.setOffline(true);
  await page.goto(`${BASIS}/lektionen/v17-labor.html`);
  await pythonFaelle(page, 'offline: ');
  pruefe('offline: keine Anfrage an fremde Hosts', ctx.fremd.length === 0, ctx.fremd.slice(0, 3).join(', '));
  await ctx.close();
}

/* ── t5 ──────────────────────────────────────────────────────── */
function videoSeite() {
  const dir = path.join(DIST, 'lektionen');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html')).sort()) {
    const h = fs.readFileSync(path.join(dir, f), 'utf8');
    if (!/id="videos"/.test(h)) continue;
    const m = [...h.matchAll(/<source src="\.\.\/assets\/video\/([^"]+\.mp4)"/g)].map((x) => x[1]).filter((v) => fs.existsSync(path.join(DIST, 'assets', 'video', v)));
    if (m.length) return { seite: 'lektionen/' + f, videos: m };
  }
  return null;
}
async function videoPruefen(page, urls, vorsatz) {
  for (const u of urls.slice(0, 1)) {
    const r = await page.evaluate(async (u) => {
      const a = await fetch(u, { headers: { Range: 'bytes=100-199' } });
      const buf = await a.arrayBuffer();
      const b = await fetch(u, { headers: { Range: 'bytes=-50' } });
      const voll = await fetch(u);
      return { s: a.status, cr: a.headers.get('content-range'), n: buf.byteLength, s2: b.status, n2: (await b.arrayBuffer()).byteLength, sv: voll.status, typ: voll.headers.get('content-type'), len: (await voll.arrayBuffer()).byteLength };
    }, u);
    pruefe(`${vorsatz}Range bytes=100-199 -> 206 mit 100 Bytes`, r.s === 206 && r.n === 100 && /^bytes 100-199\/\d+$/.test(r.cr || ''), `${r.s} ${r.cr} ${r.n} Bytes`);
    pruefe(`${vorsatz}Range bytes=-50 -> 206 mit 50 Bytes, ohne Range 200 mit voller Länge`, r.s2 === 206 && r.n2 === 50 && r.sv === 200 && r.len > 1000 && /video\/mp4/.test(r.typ || ''), `${r.s2}/${r.n2}; ${r.sv} ${r.typ} ${r.len}`);
    const el = await page.evaluate(async (u) => {
      const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = u; document.body.appendChild(v);
      const kann = v.canPlayType('video/mp4; codecs="avc1.42E01E"');
      if (!kann) return { kann: '' };
      await new Promise((ok, nein) => { v.onloadedmetadata = ok; v.onerror = () => nein(new Error('Videofehler ' + (v.error && v.error.code))); setTimeout(() => nein(new Error('Zeitüberschreitung')), 10000); });
      const d = v.duration; v.currentTime = d / 2;
      await new Promise((ok) => { v.onseeked = ok; setTimeout(ok, 5000); });
      return { kann, d, t: v.currentTime };
    }, u).catch((e) => ({ fehler: String(e.message || e) }));
    if (el.kann === '') pruefe(`${vorsatz}Wiedergabe im Test-Browser`, true, 'Chromium dieses Tests hat keinen H.264-Codec: nur die Range-Antworten geprüft (siehe oben)');
    else pruefe(`${vorsatz}Video lädt und lässt sich in die Mitte spulen`, !el.fehler && Math.abs(el.t - el.d / 2) < 1, JSON.stringify(el));
  }
}
async function t5() {
  console.log('t5 Videos offline speichern');
  const info = videoSeite();
  if (!info) { pruefe('Lektion mit vorhandenem Video gefunden', false, 'keine'); return; }
  /* a) gleiche Herkunft */
  let ctx = await kontext(); let page = await ctx.newPage();
  await page.goto(`${BASIS}/${info.seite}`);
  await swBereit(page);
  const box = page.locator('.pwa-video');
  await box.scrollIntoViewIfNeeded();
  const txt = await box.textContent();
  pruefe('Bereich „Videos dieser Lektion offline speichern“ mit Größe', /offline speichern/i.test(txt) && /\d+ MB|\d+ KB/.test(txt), txt.replace(/\s+/g, ' ').trim().slice(0, 140));
  const vs = await box.evaluate((e) => { const c = getComputedStyle(e); return c.borderLeftWidth + '/' + c.backgroundColor; });
  pruefe('Videoblock ist schlichte Zeile, kein Hinweiskasten (DESIGN Regel 3)', /^0px\//.test(vs) && /rgba\(0, 0, 0, 0\)|transparent/.test(vs), vs);
  await box.getByRole('button', { name: /Offline speichern/ }).click();
  await page.waitForFunction(() => /offline gespeichert/.test((document.querySelector('.pwa-video') || {}).textContent || ''), null, { timeout: 120000 });
  pruefe('Videos gespeichert, „Wieder entfernen“ sichtbar', await box.getByRole('button', { name: /Wieder entfernen/ }).isVisible());
  const urls = info.videos.map((v) => `${BASIS}/assets/video/${v}`);
  await ctx.setOffline(true);
  await page.goto(`${BASIS}/${info.seite}`);
  await videoPruefen(page, urls, 'offline (gleiche Herkunft): ');
  await ctx.setOffline(false);
  await box.getByRole('button', { name: /Wieder entfernen/ }).click();
  await page.waitForFunction(() => /Offline speichern/.test((document.querySelector('.pwa-video') || {}).textContent || ''));
  const n = await page.evaluate(async () => (await (await caches.open('kurs-videos-v1')).keys()).length);
  pruefe('Entfernen leert den Video-Cache', n === 0, String(n));
  await ctx.close();

  /* b) fremde Herkunft (wie VIDEO_BASIS in Produktion): gleicher Server unter 127.0.0.1, mit CORS-Kopf */
  const fremdBasis = BASIS.replace('localhost', '127.0.0.1');
  if (fremdBasis === BASIS) { pruefe('fremde Herkunft', true, 'Basis ist nicht localhost, Teilprüfung übersprungen'); return; }
  const mitFremd = (csp) => csp.replace(/(media-src|connect-src) 'self'/g, `$1 'self' ${fremdBasis}`);
  ctx = await kontext({ fremdErlauben: true });
  await ctx.route(`${fremdBasis}/assets/video/**`, async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, headers: { ...r.headers(), 'access-control-allow-origin': '*' } });
  });
  await ctx.route(`${BASIS}/${info.seite}`, async (route) => {
    const r = await route.fetch(); let body = await r.text();
    body = body.split('../assets/video/').join(`${fremdBasis}/assets/video/`);
    /* Die CSP erlaubt in Produktion genau das Storage-Konto aus VIDEO_BASIS; hier steht die Ersatz-Herkunft an seiner Stelle */
    const kopf = { ...r.headers() };
    if (kopf['content-security-policy']) kopf['content-security-policy'] = mitFremd(kopf['content-security-policy']);
    await route.fulfill({ response: r, body, headers: kopf });
  });
  /* gleiche Ersetzung für den Service Worker (seine Abrufe unterliegen der CSP von sw.js) */
  await ctx.route(`${BASIS}/sw.js*`, async (route) => {
    const r = await route.fetch();
    const kopf = { ...r.headers() };
    if (kopf['content-security-policy']) kopf['content-security-policy'] = mitFremd(kopf['content-security-policy']);
    await route.fulfill({ response: r, headers: kopf });
  });
  page = await ctx.newPage();
  await page.goto(`${BASIS}/${info.seite}`);
  await swBereit(page);
  const box2 = page.locator('.pwa-video');
  await box2.getByRole('button', { name: /Offline speichern/ }).click();
  await page.waitForFunction(() => /offline gespeichert/.test((document.querySelector('.pwa-video') || {}).textContent || ''), null, { timeout: 120000 });
  pruefe('fremde Herkunft: Videos gespeichert', true, fremdBasis);
  await ctx.setOffline(true);
  const urls2 = info.videos.map((v) => `${fremdBasis}/assets/video/${v}`);
  await videoPruefen(page, urls2, 'offline (fremde Herkunft): ');
  await ctx.close();
}

/* ── t6 ──────────────────────────────────────────────────────── */
async function t6() {
  console.log('t6 API und Anmeldung nie aus dem Cache');
  const ctx = await kontext(); const page = await ctx.newPage();
  await page.goto(`${BASIS}/index.html`);
  await swBereit(page);
  const on = await page.evaluate(async () => { const r = await fetch('/api/status'); const j = await r.json(); const a = await fetch('/api/ich'); const me = await fetch('/.auth/me'); return { s: r.status, j, a: a.status, me: me.status }; });
  pruefe('online: /api/status wird vom Server beantwortet', on.s === 200 && on.j.ok === true, JSON.stringify(on));
  const inCache = await page.evaluate(async () => {
    const treffer = [];
    for (const n of await caches.keys()) for (const r of await (await caches.open(n)).keys()) if (/^\/(api|\.auth)\//.test(new URL(r.url).pathname)) treffer.push(r.url);
    return { namen: await caches.keys(), treffer };
  });
  pruefe('in keinem Cache liegt eine /api- oder /.auth-Antwort', inCache.treffer.length === 0, inCache.treffer.join(', ') || inCache.namen.join(', '));
  await ctx.setOffline(true);
  const off = await page.evaluate(async () => { const o = {}; for (const u of ['/api/status', '/api/ich', '/.auth/me']) { try { o[u] = (await fetch(u)).status; } catch (e) { o[u] = 'Netzfehler'; } } return o; });
  pruefe('offline: /api und /.auth schlagen mit Netzfehler fehl statt aus dem Cache zu antworten', Object.values(off).every((v) => v === 'Netzfehler'), JSON.stringify(off));
  await ctx.close();
}

/* ── t7 ──────────────────────────────────────────────────────── */
function bauen() {
  const r = spawnSync('npm', ['run', 'build'], { cwd: APP, shell: true, env: { ...process.env, KURS_AUSGABE: path.basename(DIST) }, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('Build fehlgeschlagen: ' + (r.stderr || r.stdout).slice(-400));
}
async function t7() {
  console.log('t7 Update-Hinweis nach neuem Build');
  if (ohneUpdate) { console.log('  übersprungen (--ohne-update)'); return; }
  const css = path.join(APP, 'public', 'app', 'pwa.css');
  const original = fs.readFileSync(css, 'utf8');
  const ctx = await kontext(); const page = await ctx.newPage();
  try {
    await page.goto(`${BASIS}/lernpfad.html`);
    const alt = await swBereit(page);
    const zweit = await ctx.newPage();
    await zweit.goto(`${BASIS}/bibliothek.html`);
    await swBereit(zweit);
    fs.writeFileSync(css, original + `\n/* update-test ${Date.now()} */\n`);
    bauen();
    const neu = JSON.parse(await (await fetch(`${BASIS}/app/daten/build.json`)).text()).version;
    pruefe('neuer Build hat andere Version', neu !== alt.version, `${alt.version} -> ${neu}`);
    await page.evaluate(() => window.KursPwa.registrierung().update());
    await page.waitForFunction(() => /Neue Version verfügbar – neu laden/.test((document.querySelector('.app-meldungen') || {}).textContent || ''), null, { timeout: 90000 });
    pruefe('Hinweis „Neue Version verfügbar – neu laden“ erscheint, ohne dass die Seite sich selbst ersetzt', await page.evaluate((v) => window.KursApp.seite.version === v, alt.version));
    await page.locator('.app-meldung__aktion').click();
    await page.waitForFunction((v) => window.KursApp && window.KursApp.seite.version === v, neu, { timeout: 30000 });
    await zweit.waitForFunction(() => /Neue Version aktiv/.test((document.querySelector('.app-meldungen') || {}).textContent || ''), null, { timeout: 20000 }).then(
      () => pruefe('weiterer offener Tab erhält Hinweis, statt still übernommen zu werden', true),
      () => pruefe('weiterer offener Tab erhält Hinweis, statt still übernommen zu werden', false));
    const st = await swBereit(page);
    pruefe('nach Neuladen läuft die neue Version (Seite und Service Worker)', st.version === neu, `Service Worker ${st.version}`);
    const caches_ = await page.evaluate(async () => (await caches.keys()).filter((k) => k.startsWith('kurs-shell-')));
    pruefe('alter Cache wurde beim Aktivieren entfernt', caches_.length === 1 && caches_[0] === 'kurs-shell-' + neu, caches_.join(', '));
    await ctx.setOffline(true);
    await page.goto(`${BASIS}/lektionen/v07-funktionen.html`);
    pruefe('neue Version funktioniert offline', await page.evaluate(() => !!document.querySelector('.app-rail') && !/offline nicht da/.test(document.body.textContent)));
  } finally {
    fs.writeFileSync(css, original);
    await ctx.close();
    bauen();   /* dist wieder auf den Stand der Quellen bringen */
  }
}

/* ── t8 ──────────────────────────────────────────────────────── */
async function t8() {
  console.log('t8 Manifest, Symbole, Meta-Angaben');
  const ctx = await kontext(); const page = await ctx.newPage();
  await page.goto(`${BASIS}/index.html`);
  const m = await page.evaluate(async () => {
    const l = document.querySelector('link[rel="manifest"]');
    const j = l ? await (await fetch(l.href)).json() : null;
    return { href: l && l.getAttribute('href'), j, touch: !!document.querySelector('link[rel="apple-touch-icon"]'), theme: (document.querySelector('meta[name="theme-color"]') || {}).content, apple: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]') };
  });
  pruefe('Manifest verlinkt, Name und Standalone', !!m.j && m.j.name === 'Informatik Maschinenbau' && m.j.display === 'standalone' && m.j.short_name === 'Informatik', m.href);
  pruefe('theme-color, apple-touch-icon, apple-mobile-web-app-capable', !!m.theme && m.touch && m.apple, m.theme);
  const gr = async (p) => { const b = Buffer.from(await (await fetch(`${BASIS}/${p}`)).arrayBuffer()); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
  const soll = { 'app/icons/icon-192.png': '192x192', 'app/icons/icon-512.png': '512x512', 'app/icons/icon-maskable-512.png': '512x512', 'app/icons/apple-touch-icon.png': '180x180' };
  for (const [p, g] of Object.entries(soll)) pruefe(`Symbol ${p}`, (await gr(p)) === g, g);
  pruefe('Manifest verweist auf 192, 512 und maskable', ['192x192', '512x512'].every((s) => m.j.icons.some((i) => i.sizes === s)) && m.j.icons.some((i) => i.purpose === 'maskable'));
  await ctx.close();
}

async function t9() {
  console.log('t9 Installation scheitert, wenn das Symbol-Sprite fehlt (kritische Datei)');
  const ctx = await kontext(); const page = await ctx.newPage();
  await ctx.route('**/assets/img/icons.svg*', (r) => r.abort());
  await page.goto(`${BASIS}/index.html`);
  await warte(20000);
  const z = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r ? { aktiv: !!r.active, installiert: !!r.waiting } : null; });
  pruefe('ohne icons.svg wird der Service Worker nicht aktiv', !z || (!z.aktiv && !z.installiert), JSON.stringify(z));
  await ctx.close();
}

const TESTS = { t1, t2, t3, t4, t5, t6, t7, t8, t9 };
try {
  const r = await fetch(`${BASIS}/api/status`).catch(() => null);
  if (!r) { console.error(`Kein Server unter ${BASIS}. Zuerst: swa start app/${path.basename(DIST)} --api-location api --port 4322 --api-port 7332`); process.exit(2); }
  browser = await chromium.launch();
  for (const [name, fn] of Object.entries(TESTS)) {
    if (nur && !nur.includes(name)) continue;
    try { await fn(); } catch (e) { pruefe(`${name} lief ohne Ausnahme`, false, String(e && e.message || e).slice(0, 300)); }
  }
} finally {
  if (browser) await browser.close();
}
console.log(`\n${ergebnisse.length - fehler} von ${ergebnisse.length} Prüfungen bestanden${fehler ? `, ${fehler} FEHLER` : ''}.`);
process.exit(fehler ? 1 : 0);
