/* Selbsttest app/public/app/kern.js ohne Browser (node:vm mit nachgebildetem window/document):
   - Gäste-Abfrage /api/ich sparsam: „nicht angemeldet“ gilt im Tab weiter, aber nie nach Rückkehr
     von /.auth/, auf konto.html, nach Klick auf Anmelden, nach Neuladen, beim Kommen von außen,
     wenn ein anderer Tab angemeldet ist, nach 30 Minuten oder mit status(true).
   - KursApp.api: DELETE ohne Body mit content-type JSON, keepalive wird durchgereicht.
   - KursApp.fortschritt: Deep Dive (freiwillig) zählt nicht, Zählung je prüfbarem Teil.
   - Anmelden/Abmelden: Rücksprungziel bleibt auf dieser Herkunft (kein //fremd.example);
     Abmelden entfernt Tutor-Verlauf und -Kontingent aus dem sessionStorage.
   - Angemeldet bleiben: abgelaufene Sitzung wird beim Seitenaufruf still über GitHub erneuert,
     nicht nach Abmelden, nicht mitten in der Arbeit, nur ein Versuch ohne Erfolg. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { APP } from '../../src/lib/pfade.mjs';

const QUELLE = fs.readFileSync(path.join(APP, 'public', 'app', 'kern.js'), 'utf8');
const URSPRUNG = 'http://localhost:4340';

function ablage(start = {}) {
  const d = { ...start };
  return {
    d, getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; },
    key: (i) => Object.keys(d)[i] ?? null, get length() { return Object.keys(d).length; },
  };
}

/* Ein Seitenaufruf: frisches window, gemeinsamer sessionStorage/localStorage (wie derselbe Tab) */
function seite({ pfad = '/lernpfad.html', referrer = '', art = 'lernpfad', navTyp = 'navigate', session, lokal, ich = { angemeldet: false }, jetzt = Date.now(), speicher = {} }) {
  const aufrufe = [], hoerer = {};
  const attr = { 'data-page': art };
  const body = { getAttribute: (n) => (n in attr ? attr[n] : null), classList: { add() {}, remove() {} } };
  const ctx = {
    addEventListener: (typ, fn) => { (hoerer[typ] ||= []).push(fn); },
    KursSpeicher: { pfad: (l, k) => 'inf-mb/' + l.toLowerCase() + '/' + k, sofort: { lesen: (p) => speicher[p] || null } },
    document: { body, currentScript: { src: URSPRUNG + '/app/kern.js?v=1' }, referrer, querySelector: () => null, contains: () => false },
    location: { origin: URSPRUNG, pathname: pfad, search: '', hash: '', href: URSPRUNG + pfad },
    sessionStorage: session, localStorage: lokal,
    performance: { getEntriesByType: () => [{ type: navTyp }] },
    URL, Date: { now: () => jetzt }, setTimeout, console,
    fetch: (url, init) => {
      aufrufe.push({ url, init });
      const daten = url.includes('/api/ich') ? ich : {};
      return Promise.resolve({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: () => Promise.resolve(daten), text: () => Promise.resolve('') });
    },
  };
  ctx.window = ctx;   /* window ist das globale Objekt, wie im Browser */
  vm.createContext(ctx);
  vm.runInContext(QUELLE, ctx);
  const ausloesen = (typ) => (hoerer[typ] || []).forEach((fn) => fn({}));
  return { KA: ctx.KursApp, ctx, aufrufe, ausloesen, ichAufrufe: () => aufrufe.filter((a) => a.url.endsWith('/api/ich')).length };
}

test('Gast: zweite Seite im selben Tab fragt /api/ich nicht erneut', async () => {
  const session = ablage(), lokal = ablage();
  const s1 = seite({ session, lokal });
  assert.equal((await s1.KA.konto.status()).angemeldet, false);
  assert.equal(s1.ichAufrufe(), 1);
  const s2 = seite({ session, lokal, referrer: URSPRUNG + '/lernpfad.html', pfad: '/index.html', art: 'heute' });
  assert.equal((await s2.KA.konto.status()).angemeldet, false);
  assert.equal(s2.ichAufrufe(), 0, 'innerhalb der App kein erneuter Aufruf');
});

test('Gast: frisch gefragt nach Rückkehr von /.auth/, auf konto.html, nach Neuladen, von außen', async () => {
  const faelle = [
    ['Rückkehr vom Login', { referrer: URSPRUNG + '/.auth/login/github' }],
    ['Weiterleitung /login', { referrer: URSPRUNG + '/login' }],
    ['Kontoseite', { referrer: URSPRUNG + '/index.html', pfad: '/konto.html', art: 'konto' }],
    ['Neuladen', { referrer: URSPRUNG + '/index.html', navTyp: 'reload' }],
    ['ohne Referrer (Lesezeichen, neue Adresse)', { referrer: '' }],
    ['von außen (GitHub)', { referrer: 'https://github.com/' }],
  ];
  for (const [name, opt] of faelle) {
    const session = ablage(), lokal = ablage();
    await seite({ session, lokal }).KA.konto.status();
    const s = seite({ session, lokal, ich: { angemeldet: true, benutzerId: 'b1', anzeigename: 'Ada' }, ...opt });
    const st = await s.KA.konto.status();
    assert.equal(s.ichAufrufe(), 1, name + ': /api/ich wird gefragt');
    assert.equal(st.angemeldet, true, name + ': frische Anmeldung wird erkannt');
  }
});

test('Gast: Klick auf Anmelden (auch in anderem Tab) und angemeldeter Nachbar-Tab erzwingen frische Abfrage', async () => {
  const session = ablage(), lokal = ablage();
  const s1 = seite({ session, lokal, jetzt: 1000 });
  await s1.KA.konto.status();
  /* anderer Tab: Klick auf Anmelden schreibt die Marke in localStorage */
  lokal.setItem('inf-mb-app:anmeldung', '2000');
  const s2 = seite({ session, lokal, referrer: URSPRUNG + '/index.html', jetzt: 3000, ich: { angemeldet: true, benutzerId: 'b1' } });
  assert.equal((await s2.KA.konto.status()).angemeldet, true);
  assert.equal(s2.ichAufrufe(), 1);

  const session2 = ablage(), lokal2 = ablage();
  await seite({ session: session2, lokal: lokal2 }).KA.konto.status();
  lokal2.setItem('inf-mb-app:konto', JSON.stringify({ angemeldet: true, benutzerId: 'b1', anzeigename: null }));
  const s3 = seite({ session: session2, lokal: lokal2, referrer: URSPRUNG + '/index.html' });
  await s3.KA.konto.status();
  assert.equal(s3.ichAufrufe(), 1, 'anderer Tab ist angemeldet');

  /* anmelden() selbst vergisst die Gast-Marke */
  const session3 = ablage(), lokal3 = ablage();
  const s4 = seite({ session: session3, lokal: lokal3 });
  await s4.KA.konto.status();
  assert.ok(session3.getItem('inf-mb-app:gast'));
  s4.KA.konto.anmelden();
  assert.equal(session3.getItem('inf-mb-app:gast'), null);
  assert.ok(lokal3.getItem('inf-mb-app:anmeldung'));
});

test('Gast: nach 30 Minuten und mit status(true) wird wieder gefragt', async () => {
  const session = ablage(), lokal = ablage();
  await seite({ session, lokal, jetzt: 0 }).KA.konto.status();
  const spaet = seite({ session, lokal, referrer: URSPRUNG + '/index.html', jetzt: 31 * 60000 });
  await spaet.KA.konto.status();
  assert.equal(spaet.ichAufrufe(), 1);
  const s = seite({ session, lokal, referrer: URSPRUNG + '/index.html', jetzt: 31 * 60000 + 1 });
  await s.KA.konto.status(true);
  assert.equal(s.ichAufrufe(), 1);
});

test('KursApp.api: DELETE ohne Body sendet content-type JSON; keepalive wird durchgereicht; GET ohne content-type', async () => {
  const s = seite({ session: ablage(), lokal: ablage() });
  await s.KA.api('geteilt/abc', { method: 'DELETE' });
  await s.KA.api('abgleich', { method: 'POST', body: { eintraege: [] }, keepalive: true });
  await s.KA.api('status');
  const [del, post, get] = s.aufrufe;
  assert.equal(del.init.headers['Content-Type'], 'application/json');
  assert.equal(del.init.headers['X-Kurs-App'], '1');
  assert.equal(del.init.body, undefined);
  assert.equal(post.init.keepalive, true);
  assert.equal(get.init.headers['Content-Type'], undefined);
  assert.equal(get.init.keepalive, undefined);
});

test('KursApp.fortschritt: Deep Dive zählt nicht, Aufgaben je prüfbarem Teil, Status', () => {
  const t = {
    nr: 'V07', labor: 'lektionen/v07-labor.html',
    abschnitte: [{ id: 'a', titel: 'Warum' }, { id: 'b', titel: 'Theorie' }, { id: 'd', titel: 'Deep Dive (freiwillig)' }],
    aufgaben: [{ id: 't-1', pruefbar: ['x1', 'x2'] }, { id: 't-2', pruefbar: ['x3'] }, { id: 't-3', pruefbar: [] }],
  };
  const speicher = { 'inf-mb/v07/done': { a: 1, d: 1 }, 'inf-mb/v07/aufg': { x1: 1 } };
  const KA = seite({ session: ablage(), lokal: ablage(), speicher }).KA;
  const s = KA.fortschritt.termin(t);
  assert.equal(JSON.stringify(s.abschnitte), JSON.stringify({ fertig: 1, gesamt: 2 }));   /* andere vm-Welt: über JSON vergleichen */
  assert.equal(JSON.stringify(s.aufgaben), JSON.stringify({ geloest: 1, gesamt: 3 }));
  assert.equal(s.status, 'begonnen');
  const fertig = seite({ session: ablage(), lokal: ablage(), speicher: { 'inf-mb/v07/done': { a: 1, b: 1 }, 'inf-mb/v07/aufg': { x1: 1, x2: 1, x3: 1 } } }).KA.fortschritt.termin(t);
  assert.equal(fertig.status, 'fertig', 'fertig ohne den freiwilligen Deep Dive');
  assert.equal(seite({ session: ablage(), lokal: ablage() }).KA.fortschritt.termin(t).status, 'offen');
});

test('Anmelden/Abmelden: Rücksprungziel ist immer ein Pfad dieser Herkunft', () => {
  for (const pfad of ['//evil.example/x.html', '///evil.example/x.html', '/\\evil.example/x.html']) {
    const s = seite({ session: ablage(), lokal: ablage(), pfad });
    s.KA.konto.anmelden();
    const ziel = new URL(s.ctx.location.href).searchParams.get('post_login_redirect_uri');
    assert.equal(ziel, '/evil.example/x.html', pfad);
    assert.equal(new URL(ziel, URSPRUNG).origin, URSPRUNG);
    s.KA.konto.abmelden();
    assert.equal(new URL(s.ctx.location.href).searchParams.get('post_logout_redirect_uri'), '/evil.example/x.html');
  }
  const n = seite({ session: ablage(), lokal: ablage(), pfad: '/lektionen/v01-labor.html' });
  n.KA.konto.anmelden();
  assert.equal(new URL(n.ctx.location.href).searchParams.get('post_login_redirect_uri'), '/lektionen/v01-labor.html');
});

test('Abmelden entfernt Tutor-Verlauf und -Kontingent des Tabs, sonst nichts', () => {
  const session = ablage({ 'inf-mb-app:tutor:/lektionen/v01-labor.html': '{"verlauf":[{"rolle":"nutzer","text":"Ich heiße Anna"}]}', 'inf-mb-app:tutor:rest': '{"heute":3}', 'inf-mb-app:kurs': '{}' });
  const s = seite({ session, lokal: ablage() });
  s.KA.konto.abmelden();
  assert.deepEqual(Object.keys(session.d), ['inf-mb-app:kurs']);
});

const ADA = { angemeldet: true, benutzerId: 'b1', anzeigename: 'Ada' };
const zielVon = (s) => s.ctx.location.href;

test('Angemeldet bleiben: abgelaufene Sitzung wird beim Seitenaufruf still erneuert', async () => {
  const session = ablage(), lokal = ablage();
  await seite({ session, lokal, ich: ADA }).KA.konto.status();
  assert.equal(lokal.getItem('inf-mb-app:angemeldet-bleiben'), '1');
  /* Stunden später: Sitzung weg, auch innerhalb der App (Gast-Marke im Tab zählt nicht) */
  const s = seite({ session, lokal, pfad: '/lektionen/v05-labor.html', referrer: URSPRUNG + '/index.html' });
  assert.equal((await s.KA.konto.status()).angemeldet, false);
  assert.equal(s.ichAufrufe(), 1);
  const ziel = new URL(zielVon(s));
  assert.equal(ziel.pathname, '/.auth/login/github');
  assert.equal(ziel.searchParams.get('post_login_redirect_uri'), '/lektionen/v05-labor.html');
  assert.ok(lokal.getItem('inf-mb-app:erneuert'));
  /* Rückkehr mit Sitzung: Marke weg, bleibt gewünscht */
  await seite({ session, lokal, referrer: 'https://github.com/', ich: ADA }).KA.konto.status();
  assert.equal(lokal.getItem('inf-mb-app:erneuert'), null);
  assert.equal(lokal.getItem('inf-mb-app:angemeldet-bleiben'), '1');
  /* nächstes Ablaufen: wieder still erneuert */
  const s2 = seite({ session, lokal });
  await s2.KA.konto.status();
  assert.equal(new URL(zielVon(s2)).pathname, '/.auth/login/github');
});

test('Angemeldet bleiben: Versuch ohne Erfolg wird nicht wiederholt', async () => {
  const session = ablage(), lokal = ablage();
  await seite({ session, lokal, ich: ADA }).KA.konto.status();
  await seite({ session, lokal }).KA.konto.status();               /* erster Versuch */
  const zurueck = seite({ session, lokal, referrer: URSPRUNG + '/.auth/login/github/callback' });
  await zurueck.KA.konto.status();                                  /* ohne Sitzung zurück */
  assert.equal(zielVon(zurueck), URSPRUNG + '/lernpfad.html', 'kein zweiter Sprung');
  assert.equal(lokal.getItem('inf-mb-app:angemeldet-bleiben'), '0');
  const spaeter = seite({ session: ablage(), lokal });
  await spaeter.KA.konto.status();
  assert.equal(zielVon(spaeter), URSPRUNG + '/lernpfad.html');
  /* selbst angemeldet: gilt wieder */
  await seite({ session, lokal, ich: ADA }).KA.konto.status();
  assert.equal(lokal.getItem('inf-mb-app:angemeldet-bleiben'), '1');
});

test('Angemeldet bleiben: nicht nach Abmelden, nicht als Gast, nicht mitten in der Arbeit', async () => {
  /* Abmelden */
  const session = ablage(), lokal = ablage();
  const a = seite({ session, lokal, ich: ADA });
  await a.KA.konto.status();
  a.KA.konto.abmelden();
  const nachher = seite({ session, lokal });
  await nachher.KA.konto.status();
  assert.equal(zielVon(nachher), URSPRUNG + '/lernpfad.html');
  assert.equal(lokal.getItem('inf-mb-app:angemeldet-bleiben'), '0');
  /* nie angemeldet */
  const gast = seite({ session: ablage(), lokal: ablage() });
  await gast.KA.konto.status();
  assert.equal(zielVon(gast), URSPRUNG + '/lernpfad.html');
  /* Eingabe auf der Seite: kein Sprung, beim nächsten Seitenaufruf aber schon */
  const session2 = ablage(), lokal2 = ablage();
  await seite({ session: session2, lokal: lokal2, ich: ADA }).KA.konto.status();
  const arbeit = seite({ session: session2, lokal: lokal2 });
  arbeit.ausloesen('keydown');
  await arbeit.KA.konto.status(true);
  assert.equal(zielVon(arbeit), URSPRUNG + '/lernpfad.html', 'mitten in der Arbeit kein Sprung');
  assert.equal(lokal2.getItem('inf-mb-app:erneuert'), null);
  const naechste = seite({ session: session2, lokal: lokal2, referrer: URSPRUNG + '/lernpfad.html', pfad: '/index.html' });
  await naechste.KA.konto.status();
  assert.equal(new URL(zielVon(naechste)).pathname, '/.auth/login/github');
  /* lange nach dem Laden (Tab blieb offen): kein Sprung */
  const session3 = ablage(), lokal3 = ablage();
  await seite({ session: session3, lokal: lokal3, ich: ADA }).KA.konto.status();
  const t0 = 1e12, lang = seite({ session: session3, lokal: lokal3, jetzt: t0 });
  lang.ctx.Date.now = () => t0 + 60000;
  await lang.KA.konto.status(true);
  assert.equal(zielVon(lang), URSPRUNG + '/lernpfad.html');
});

test('Angemeldet bleiben: wer vorher angemeldet war, bleibt es (Bestand)', async () => {
  const lokal = ablage({ 'inf-mb-app:konto': JSON.stringify({ angemeldet: true, benutzerId: 'b1', anzeigename: null }) });
  const s = seite({ session: ablage(), lokal });
  await s.KA.konto.status();
  assert.equal(new URL(zielVon(s)).pathname, '/.auth/login/github');
});

test('Angemeldet bleiben: 5xx oder fehlende API lösen keinen Sprung aus', async () => {
  const session = ablage(), lokal = ablage();
  await seite({ session, lokal, ich: ADA }).KA.konto.status();
  const s = seite({ session, lokal });
  s.ctx.fetch = () => Promise.resolve({ ok: false, status: 503, headers: { get: () => 'application/json' }, json: () => Promise.resolve({}), text: () => Promise.resolve('') });
  await s.KA.konto.status(true);
  assert.equal(zielVon(s), URSPRUNG + '/lernpfad.html');
});
