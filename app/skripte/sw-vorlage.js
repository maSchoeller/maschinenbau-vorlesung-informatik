/* =============================================================
   sw.js – Service Worker der Lern-App (Architektur-Vertrag, Abschnitt 9). Rolle PWA.
   Erzeugt aus app/skripte/sw-vorlage.js durch sw-bauen.mjs (Platzhalter __…__).
   Caches:  kurs-shell-<Version>   Precache + zur Laufzeit ergänzte App-Dateien (wird je Version ersetzt)
            kurs-pyodide-<Ver>     /pyodide/**, Cache zuerst
            kurs-videos-v1         nur ausdrücklich gespeicherte Videos (bleibt über Versionen erhalten)
   Nie gecacht: /api/**, /.auth/**, /login, /logout (der Service Worker fasst diese Anfragen gar nicht an).
   Kein stilles skipWaiting: eine neue Version wartet, bis die Seite es per Nachricht erlaubt.
   ============================================================= */
'use strict';

const VERSION = '__VERSION__';
const PYODIDE_VERSION = '__PYODIDE_VERSION__';
const PRECACHE = __PRECACHE__;          /* [{u: 'pfad/relativ/zur/Wurzel[?v=…]', h: 'sha256-12'}] */
const PRECACHE_BYTES = __BYTES__;

const CACHE_SHELL = 'kurs-shell-' + VERSION;
const CACHE_PYODIDE = 'kurs-pyodide-' + PYODIDE_VERSION;
const CACHE_VIDEO = 'kurs-videos-v1';
const WURZEL = new URL('./', self.location.href);                 /* Geltungsbereich, z. B. http://host/ */
const PFAD = WURZEL.pathname;                                      /* '/' */
const META = new URL('__kurs-meta.json', WURZEL).href;
const BLOCK = 8;                                                   /* parallele Ladevorgänge beim Precache */
const VERSUCHE = 3;
const KRITISCH = ['index.html', 'offline.html', 'app/kern.js', 'app/shell.js', 'assets/img/icons.svg', 'assets/css/dhbw-base.css', 'assets/css/kurs.css', 'assets/js/kurs.js', 'assets/js/speicher.js'];

const abs = (u) => new URL(u, WURZEL).href;
const ohneQuery = (u) => { const x = new URL(u); x.search = ''; x.hash = ''; return x.href; };
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
const pfadVon = (u) => u.split('?')[0];

/* ── Installation: Precache in Blöcken, mit Wiederholung, nicht alles-oder-nichts ─────────── */
async function vorherigeCache() {
  const namen = (await caches.keys()).filter((n) => n.startsWith('kurs-shell-') && n !== CACHE_SHELL);
  return namen.length ? caches.open(namen[namen.length - 1]) : null;
}

async function mitHash(antwort, hash) {
  const kopf = new Headers(antwort.headers);
  kopf.set('x-kurs-hash', hash);
  return new Response(await antwort.blob(), { status: 200, statusText: 'OK', headers: kopf });
}

async function holen(cache, alt, eintrag) {
  const schluessel = abs(eintrag.u);
  /* Datei unverändert seit der letzten Version: aus dem alten Cache übernehmen (spart Übertragung) */
  if (alt) {
    try {
      const vorher = await alt.match(abs(pfadVon(eintrag.u)), { ignoreSearch: true });
      if (vorher && vorher.headers.get('x-kurs-hash') === eintrag.h) { await cache.put(schluessel, vorher); return true; }
    } catch (e) { /* neu laden */ }
  }
  for (let i = 1; i <= VERSUCHE; i++) {
    try {
      const r = await fetch(abs(pfadVon(eintrag.u)), { cache: 'reload', credentials: 'same-origin' });
      if (r.ok && r.status === 200) { await cache.put(schluessel, await mitHash(r, eintrag.h)); return true; }
      if (r.status === 404) return false;            /* gibt es nicht: nicht wiederholen */
    } catch (e) { /* Netz */ }
    await pause(400 * i);
  }
  return false;
}

async function installieren() {
  const cache = await caches.open(CACHE_SHELL);
  const alt = await vorherigeCache();
  const fehlend = [];
  for (let i = 0; i < PRECACHE.length; i += BLOCK) {
    await Promise.all(PRECACHE.slice(i, i + BLOCK).map(async (e) => { if (!(await holen(cache, alt, e))) fehlend.push(pfadVon(e.u)); }));
  }
  /* Zu viele oder wichtige Lücken: Installation scheitern lassen; der Browser versucht es beim nächsten Aufruf erneut */
  const kritischFehlt = fehlend.some((p) => KRITISCH.includes(p));
  if (kritischFehlt || fehlend.length > PRECACHE.length * 0.1) throw new Error('Precache unvollständig: ' + fehlend.slice(0, 5).join(', ') + ' (' + fehlend.length + ')');
  await cache.put(META, new Response(JSON.stringify({ version: VERSION, anzahl: PRECACHE.length, bytes: PRECACHE_BYTES, fehlend, pyodide: PYODIDE_VERSION })));
}

self.addEventListener('install', (e) => { e.waitUntil(installieren()); });   /* bewusst kein skipWaiting */

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) {
      if (n.startsWith('kurs-') && n !== CACHE_SHELL && n !== CACHE_PYODIDE && n !== CACHE_VIDEO) await caches.delete(n);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
  else if (d.type === 'STATUS' && e.ports && e.ports[0]) {
    caches.open(CACHE_SHELL).then((c) => c.match(META)).then((r) => r ? r.json() : null).then((meta) => {
      e.ports[0].postMessage({ version: VERSION, meta, pyodide: PYODIDE_VERSION });
    }, () => e.ports[0].postMessage({ version: VERSION, meta: null, pyodide: PYODIDE_VERSION }));
  }
});

/* ── Anfragen ───────────────────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const gleich = url.origin === WURZEL.origin;

  /* API und Anmeldung: immer direkt ins Netz, nie in einen Cache (auch nicht als Rückfall bei Fehlern).
     /login und /logout sind Weiterleitungen der Static Web App auf /.auth/… (staticwebapp.config.json). */
  if (gleich && (url.pathname.startsWith(PFAD + 'api/') || url.pathname.startsWith(PFAD + '.auth/') || url.pathname === PFAD + 'api' ||
      /^(login|logout)(\/|$)/.test(url.pathname.slice(PFAD.length)))) return;

  /* Videos: eigene oder fremde Herkunft; nur aus dem Video-Cache, sonst Netz */
  if (/\.mp4$/i.test(url.pathname) || req.destination === 'video') { e.respondWith(video(req)); return; }

  if (!gleich) return;                                    /* sonstige Fremdherkunft: Netz */
  if (url.pathname.startsWith(PFAD + 'pyodide/')) { e.respondWith(pyodide(req)); return; }
  if (req.mode === 'navigate') { e.respondWith(seite(e)); return; }
  e.respondWith(datei(req));
});

/* /pyodide/**: Cache zuerst (versionierter eigener Cache), sonst Netz und ablegen */
async function pyodide(req) {
  const cache = await caches.open(CACHE_PYODIDE);
  const treffer = await cache.match(req.url);
  if (treffer) return treffer;
  const r = await fetch(req);
  if (r.ok && r.status === 200) { try { await cache.put(req.url, r.clone()); } catch (e) { /* Speicher voll: ohne Ablage weiter */ } }
  return r;
}

/* Statische Dateien: Precache (mit ?v=), sonst Netz und ergänzen */
async function datei(req) {
  const cache = await caches.open(CACHE_SHELL);
  let treffer = await cache.match(req.url);
  if (!treffer) treffer = await cache.match(req.url, { ignoreSearch: true });
  if (treffer) return treffer;
  const r = await fetch(req);
  if (r.ok && r.status === 200 && r.type === 'basic' && !req.headers.has('range')) {
    try { await cache.put(req.url, r.clone()); } catch (e) { /* ignorieren */ }
  }
  return r;
}

/* Seitenaufrufe: aus dem Cache, im Hintergrund auffrischen; ohne Cache und Netz offline.html */
function pfadZuSeite(url) {
  let p = url.pathname;
  if (p.endsWith('/')) p += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(p)) p += '.html';
  return new URL(p, url.origin).href;
}

async function seite(e) {
  const req = e.request;
  const url = new URL(req.url);
  const cache = await caches.open(CACHE_SHELL);
  const schluessel = pfadZuSeite(url);
  const treffer = await cache.match(schluessel);
  if (treffer) { e.waitUntil(auffrischen(cache, schluessel)); return treffer; }
  try {
    const r = await fetch(req);
    if (r.ok && r.status === 200 && r.type === 'basic' && /\.html$/.test(schluessel)) {
      try { await cache.put(schluessel, r.clone()); } catch (x) { /* ignorieren */ }
    }
    return r;
  } catch (fehler) {
    const aus = await cache.match(abs('offline.html'));
    if (!aus) return new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    /* Die Seite erscheint unter dem verlangten Pfad: <base> setzen, damit Stile, Skripte und Verweise (relativ zur Wurzel) stimmen */
    let html = await aus.text();
    html = html.replace('<head>', '<head><base href="' + WURZEL.href + '">').split('href="#inhalt"').join('href="' + url.pathname + '#inhalt"');
    return new Response(html, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}

/* Hintergrund-Aktualisierung einer Seite. Übernommen wird sie nur, wenn sie zu dieser Version gehört
   (gleiche ?v=-Kennung), sonst würde eine Seite der Folgeversion auf Dateien zeigen, die dieser Cache nicht hat;
   die neue Version kommt über den Update-Weg (neuer Service Worker). So heilt der Schritt vor allem Lücken im Precache. */
async function auffrischen(cache, schluessel) {
  try {
    const r = await fetch(schluessel, { cache: 'no-cache', credentials: 'same-origin' });
    if (!r.ok || r.status !== 200) return;
    const text = await r.clone().text();
    const hatKennung = /\?v=[0-9a-f]{12}/.test(text);
    if (hatKennung && text.indexOf('?v=' + VERSION) < 0) return;
    await cache.put(schluessel, r);
  } catch (e) { /* offline: nichts zu tun */ }
}

/* ── Videos: Range-Anfragen aus der vollständig gespeicherten Datei mit 206 beantworten ──── */
async function video(req) {
  let treffer = null;
  try {
    const cache = await caches.open(CACHE_VIDEO);
    treffer = await cache.match(ohneQuery(req.url)) || await cache.match(req.url);
  } catch (e) { /* kein Cache: Netz */ }
  if (!treffer) return fetch(req);
  const blob = await treffer.blob();
  const gesamt = blob.size;
  const ct = treffer.headers.get('content-type') || '';
  const typ = /^video\//i.test(ct) ? ct : 'video/mp4';   /* manche Server liefern mp4 als octet-stream aus */
  const range = req.headers.get('range');
  if (!range) {
    return new Response(blob, { status: 200, headers: { 'content-type': typ, 'content-length': String(gesamt), 'accept-ranges': 'bytes' } });
  }
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '')) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + gesamt } });
  let start, ende;
  if (m[1] === '') { const n = Math.min(parseInt(m[2], 10), gesamt); start = gesamt - n; ende = gesamt - 1; }   /* letzte n Bytes */
  else { start = parseInt(m[1], 10); ende = m[2] === '' ? gesamt - 1 : Math.min(parseInt(m[2], 10), gesamt - 1); }
  if (start >= gesamt || start > ende) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + gesamt } });
  return new Response(blob.slice(start, ende + 1), {
    status: 206,
    headers: { 'content-type': typ, 'content-length': String(ende - start + 1), 'content-range': 'bytes ' + start + '-' + ende + '/' + gesamt, 'accept-ranges': 'bytes' },
  });
}
