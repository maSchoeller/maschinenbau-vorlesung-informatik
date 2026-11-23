/* Selbsttest app/public/app/kern.js ohne Browser (node:vm mit nachgebildetem window/document):
   - Gäste-Abfrage /api/ich sparsam: „nicht angemeldet“ gilt im Tab weiter, aber nie nach Rückkehr
     von /.auth/, auf konto.html, nach Klick auf Anmelden, nach Neuladen, beim Kommen von außen,
     wenn ein anderer Tab angemeldet ist, nach 30 Minuten oder mit status(true).
   - KursApp.api: DELETE ohne Body mit content-type JSON, keepalive wird durchgereicht.
   - KursApp.fortschritt: Deep Dive (freiwillig) zählt nicht, Zählung je prüfbarem Teil.
   - Anmelden/Abmelden: Rücksprungziel bleibt auf dieser Herkunft (kein //fremd.example);
     Abmelden entfernt Tutor-Verlauf und -Kontingent aus dem sessionStorage. */
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
  const aufrufe = [];
  const attr = { 'data-page': art };
  const body = { getAttribute: (n) => (n in attr ? attr[n] : null), classList: { add() {}, remove() {} } };
  const ctx = {
    addEventListener() {},
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
  return { KA: ctx.KursApp, ctx, aufrufe, ichAufrufe: () => aufrufe.filter((a) => a.url.endsWith('/api/ich')).length };
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
