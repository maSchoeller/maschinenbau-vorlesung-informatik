/* =============================================================
   pruefe-abgleich.mjs – wiederholbare Beweise für Konto und Abgleich (Rolle Konto und Abgleich)
   Aufruf:  node skripte/pruefe-abgleich.mjs [http://localhost:4324] [--nur t1,t6] [--ohne-messung]
   Voraussetzung: gebauter Stand läuft mit echter lokaler API unter der Basis-URL:
     KURS_AUSGABE=dist-konto npm run build
     ABLAGE=datei ABLAGE_DATEI=<Wurzel>/api/.daten/konto/ablage.json BENUTZER_SALT=lokal-test \
       swa start app/dist-konto --api-location api --port 4324 --api-port 7334
   Jedes „Gerät“ ist ein eigener Browser-Kontext (eigener localStorage und eigene Cookies); die Testidentität
   kommt über /.auth/login/github des Emulators. Jeder Test benutzt eigene Benutzer-IDs. Der Service Worker ist blockiert.
   Tests:
     t1  Gerät A löst Aufgabe, hakt Abschnitt ab -> Gerät B sieht es nach Fokus, im Abonnenten und nach Neuladen
     t2  gleichzeitige Änderungen an verschiedenen Einträgen gehen nicht verloren
     t3  gleicher Eintrag: neuester gewinnt (auch wenn der ältere später ankommt)
     t4  offline schreiben, online gehen: wird nachgereicht; Statusanzeige; Server nicht erreichbar + Neuladen
     t5  Löschung wandert mit (Löschmarke), Abonnent bekommt „geloescht“
     t6  erster Login mit lokalem Stand: Ja (hochladen) und Nein (getrennt halten, kommt nach Abmelden zurück)
     t7  Benutzerwechsel auf demselben Gerät: Stand des anderen Kontos wandert nicht ins neue Konto
     t8  abgelaufene Sitzung: Abgleich pausiert, Anzeige, nach neuem Anmelden wird nachgereicht
     t9  zwei Tabs desselben Browsers: keine doppelten Übertragungen, nichts geht verloren
     t10 Zeitstempel in der Zukunft, abgelehnte Einträge und Taktabfrage (60 s) im sichtbaren Tab
     t12 Konto-Seite: Anzeigename (freundliche Fehler), Daten herunterladen, Sichern/Laden, Konto löschen in zwei Stufen
     t13 Bündelgröße: 600 Einträge à 1 KB und ein Programm über 256 KB blockieren nichts; Änderungen als Gast nach
         „Stand hier behalten“ und bei gestörter Anmeldeabfrage werden nachgereicht; Kontoseite ohne Leerräume
     t11 Messung: API-Aufrufe in einer Stunde Leerlauf, in einer aktiven Stunde und in einer Lernsitzung
   ============================================================= */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const BASIS = (args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:4324').replace(/\/+$/, '');
const nur = args.includes('--nur') ? args[args.indexOf('--nur') + 1].split(',') : null;
const ohneMessung = args.includes('--ohne-messung');
const LAUF = Date.now().toString(36);

let fehler = 0, anzahl = 0;
function pruefe(name, ok, detail) {
  anzahl++; if (!ok) fehler++;
  console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${name}${detail !== undefined && detail !== '' ? ' – ' + detail : ''}`);
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function bis(fn, ms = 15000, schritt = 150) {
  const ende = Date.now() + ms;
  for (;;) {
    let r; try { r = await fn(); } catch { r = false; }
    if (r) return r;
    if (Date.now() > ende) return false;
    await warte(schritt);
  }
}
let zaehlerNr = 0;
const uid = (t) => `${t}-${LAUF}-${++zaehlerNr}`;

let browser;
const geraete = [];

/* ── Gerät = Browser-Kontext, optional angemeldet ──────────── */
async function anmelden(page, userId) {
  await page.goto(BASIS + '/.auth/login/github', { waitUntil: 'domcontentloaded' });
  /* Das Formular des Emulators liest seine Werte aus dem Speicher, den erst keyup-Ereignisse füllen */
  for (const [sel, wert] of [['#userId', userId], ['#userDetails', 'Test ' + userId]]) {
    const f = page.locator(sel); await f.fill(wert); await f.dispatchEvent('keyup');
  }
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith('/.auth/login'), { timeout: 15000 }),
    page.locator('#submit').click()
  ]);
}
async function geraet(userId, { seite = 'lernpfad.html', warteAufAbgleich = true, ctxOpt = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', ...ctxOpt });
  const g = { ctx, userId, aufrufe: [], konsole: [], seiten: [] };
  ctx.on('request', (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith('/api/')) g.aufrufe.push({ t: Date.now(), m: r.method(), pfad: u.pathname });
  });
  g.antworten = [];
  ctx.on('response', (r) => { const u = new URL(r.url()); if (u.pathname === '/api/abgleich') g.antworten.push(r.status()); });
  const page = await ctx.newPage();
  await beobachte(g, page);
  await page.clock.install();
  g.page = page;
  if (userId) await anmelden(page, userId);
  await oeffne(g, page, seite, warteAufAbgleich && !!userId);
  geraete.push(g);
  return g;
}
async function beobachte(g, page) {
  /* Playwright blockiert den Service Worker; pwa.js liest dann registration.waiting (Befund der PWA-Rolle, nicht dieser Prüfung) */
  page.on('pageerror', (e) => { if (!/reading 'waiting'/.test(e.message)) g.konsole.push('pageerror: ' + e.message); });
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) g.konsole.push(m.text()); });
  g.seiten.push(page);
}
async function oeffne(g, page, seite, warten = true) {
  await page.goto(BASIS + '/' + seite, { waitUntil: 'domcontentloaded' });
  if (warten) await bereit(page);
}
async function bereit(page) {
  return page.waitForFunction(() => window.KursAbgleich && window.KursAbgleich.status().aktiv && window.KursAbgleich.status().letzter && window.KursAbgleich.status().zustand !== 'laeuft', null, { timeout: 20000 }).then(() => true, () => false);
}
const schreibe = (g, pfad, wert, page = g.page) => page.evaluate(([p, w]) => window.KursSpeicher.sofort.schreiben(p, w), [pfad, wert]);
const loesche = (g, pfad, page = g.page) => page.evaluate((p) => window.KursSpeicher.sofort.loeschen(p), pfad);
const lies = (g, pfad, page = g.page) => page.evaluate((p) => window.KursSpeicher.sofort.lesen(p), pfad);
const status = (g, page = g.page) => page.evaluate(() => window.KursAbgleich && window.KursAbgleich.status());
const fokus = async (g, vorspulen = 15000, page = g.page) => { await page.clock.fastForward(vorspulen); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); };
async function server(g) {
  const r = await g.ctx.request.get(BASIS + '/api/eintraege');
  const d = r.ok() ? await r.json() : { eintraege: [] };
  const o = {};
  (d.eintraege || []).forEach((e) => { if (!e.geloescht) o[e.pfad] = e; });
  return o;
}
const posts = (g, seit = 0) => g.aufrufe.filter((a) => a.m === 'POST' && a.pfad === '/api/abgleich' && a.t >= seit).length;
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function ende(g) { try { await g.ctx.close(); } catch {} }

/* ── t1 ────────────────────────────────────────────────────── */
async function t1() {
  const id = uid('t1');
  const A = await geraet(id), B = await geraet(id);
  await B.page.evaluate(() => { window.__ev = []; window.KursSpeicher.abonnieren('inf-mb/v07/', (e) => window.__ev.push(e)); });
  const vorher = posts(A);
  await schreibe(A, 'inf-mb/v07/done', { 's1': true, 's2': true });
  await schreibe(A, 'inf-mb/v07/aufg', { 't-1': true });
  pruefe('t1 A schreibt sofort lokal (synchron lesbar)', gleich(await lies(A, 'inf-mb/v07/aufg'), { 't-1': true }));
  const aufServer = await bis(async () => { const s = await server(A); return s['inf-mb/v07/done'] && s['inf-mb/v07/aufg']; });
  pruefe('t1 Änderung kommt gebündelt beim Server an', !!aufServer, `${posts(A) - vorher} POST für 2 Schreibvorgänge`);
  pruefe('t1 gebündelt: höchstens 1 POST für zwei Schreibvorgänge', posts(A) - vorher <= 1, posts(A) - vorher);
  await fokus(B);
  const sieht = await bis(async () => gleich(await lies(B, 'inf-mb/v07/done'), { s1: true, s2: true }), 8000);
  pruefe('t1 B sieht den Stand nach Fokus (ohne Neuladen)', !!sieht);
  const ev = await B.page.evaluate(() => window.__ev.map((e) => e.pfad));
  pruefe('t1 Abonnent auf B wurde benachrichtigt', ev.includes('inf-mb/v07/done') && ev.includes('inf-mb/v07/aufg'), ev.join(', '));
  await B.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  const nachNeuladen = await B.page.evaluate(() => window.KursSpeicher.sofort.lesen('inf-mb/v07/aufg'));
  pruefe('t1 nach Neuladen sofort (synchron aus dem lokalen Speicher) da', gleich(nachNeuladen, { 't-1': true }));
  await bereit(B.page);
  await bis(async () => (await status(B)).offen === 0, 6000);
  const st = await status(B);
  pruefe('t1 Zustand ok, nichts offen', st.zustand === 'ok' || st.zustand === 'laeuft', JSON.stringify({ z: st.zustand, offen: st.offen }));
  pruefe('t1 keine Konsolenfehler', A.konsole.length + B.konsole.length === 0, [...A.konsole, ...B.konsole].join(' | '));
  await ende(A); await ende(B);
}

/* ── t2 ────────────────────────────────────────────────────── */
async function t2() {
  const id = uid('t2');
  const A = await geraet(id), B = await geraet(id);
  await Promise.all([schreibe(A, 'inf-mb/v02/done', { a: 1 }), schreibe(B, 'inf-mb/v03/done', { b: 1 })]);
  const beide = await bis(async () => { const s = await server(A); return s['inf-mb/v02/done'] && s['inf-mb/v03/done']; });
  pruefe('t2 beide Änderungen auf dem Server', !!beide);
  await Promise.all([fokus(A), fokus(B)]);
  const ok = await bis(async () => gleich(await lies(A, 'inf-mb/v03/done'), { b: 1 }) && gleich(await lies(B, 'inf-mb/v02/done'), { a: 1 }), 10000);
  pruefe('t2 beide Geräte sehen beide Einträge', !!ok);
  pruefe('t2 eigene Einträge unverändert', gleich(await lies(A, 'inf-mb/v02/done'), { a: 1 }) && gleich(await lies(B, 'inf-mb/v03/done'), { b: 1 }));
  await ende(A); await ende(B);
}

/* ── t3 ────────────────────────────────────────────────────── */
async function t3() {
  const id = uid('t3');
  const A = await geraet(id), B = await geraet(id);
  const pfad = 'inf-mb/v04/code:t-1';
  await schreibe(A, pfad, 'erster');
  await warte(30);
  await schreibe(B, pfad, 'zweiter');   /* später, also neuer */
  await bis(async () => (await server(A))[pfad], 8000);
  await Promise.all([fokus(A), fokus(B)]);
  const ok = await bis(async () => (await lies(A, pfad)) === 'zweiter' && (await lies(B, pfad)) === 'zweiter', 10000);
  pruefe('t3 neuester Stand gewinnt auf beiden Geräten', !!ok, `A=${await lies(A, pfad)} B=${await lies(B, pfad)}`);
  /* Älteres kommt später an: B schreibt offline "alt", A danach "neu" und gleicht ab, dann geht B online */
  const p2 = 'inf-mb/v04/code:t-2';
  await B.ctx.setOffline(true);
  await schreibe(B, p2, 'alt');
  await warte(40);
  await schreibe(A, p2, 'neu');
  await bis(async () => (await server(A))[p2] && (await server(A))[p2].wert === 'neu', 8000);
  await B.ctx.setOffline(false);
  const ok2 = await bis(async () => (await lies(B, p2)) === 'neu', 12000);
  const s = await server(A);
  pruefe('t3 älterer, später eintreffender Stand verliert (Server und B behalten „neu“)', !!ok2 && s[p2].wert === 'neu', `B=${await lies(B, p2)} Server=${s[p2] && s[p2].wert}`);
  await ende(A); await ende(B);
}

/* ── t4 ────────────────────────────────────────────────────── */
async function t4() {
  const id = uid('t4');
  const A = await geraet(id), B = await geraet(id);
  await B.ctx.setOffline(true);
  await B.page.waitForFunction(() => navigator.onLine === false);
  await schreibe(B, 'inf-mb/v05/done', { x: 1 });
  await schreibe(B, 'inf-mb/v05/aufg', { 't-1': true });
  await warte(2200);
  const st = await status(B);
  const text = await B.page.locator('[data-abgleich-status]').innerText();
  pruefe('t4 offline: zwei Änderungen als offen gezählt', st.offen === 2 && st.grund === 'offline', JSON.stringify({ offen: st.offen, grund: st.grund }));
  pruefe('t4 offline: Kopfzeile nennt die wartenden Änderungen', /2 Änderungen warten auf Abgleich/.test(text), text);
  pruefe('t4 offline: lokal sofort lesbar', gleich(await lies(B, 'inf-mb/v05/done'), { x: 1 }));
  const vor = posts(B);
  await warte(1500);
  pruefe('t4 offline: kein Hämmern auf das Netz', posts(B) === vor);
  await B.ctx.setOffline(false);
  const drauf = await bis(async () => { const s = await server(A); return s['inf-mb/v05/done'] && s['inf-mb/v05/aufg']; }, 15000);
  pruefe('t4 online: wird nachgereicht (online-Ereignis)', !!drauf);
  const st2 = await status(B);
  pruefe('t4 danach nichts mehr offen, Anzeige leer', st2.offen === 0 && (await B.page.locator('[data-abgleich-status]').innerText()) === '', JSON.stringify(st2.offen));
  await fokus(A);
  pruefe('t4 A bekommt den nachgereichten Stand', !!(await bis(async () => gleich(await lies(A, 'inf-mb/v05/done'), { x: 1 }), 8000)));

  /* Server nicht erreichbar (online, aber Anfrage scheitert) + Neuladen: Warteschlange überlebt */
  await B.ctx.route('**/api/abgleich', (r) => r.abort());
  await schreibe(B, 'inf-mb/v05/code:t-9', 'bleibt');
  await warte(2500);
  const st3 = await status(B);
  pruefe('t4 Server weg: Änderung bleibt offen, Zustand „fehler“', st3.offen === 1 && st3.zustand === 'fehler', JSON.stringify({ offen: st3.offen, z: st3.zustand, grund: st3.grund }));
  const n1 = posts(B); await warte(1500);
  pruefe('t4 Server weg: wachsender Abstand (kein sofortiger Wiederholungslauf)', posts(B) === n1);
  await B.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  const ueberlebt = await B.page.evaluate(() => Object.keys(localStorage).filter((k) => k.indexOf('inf-mb-app:offen:') === 0));
  pruefe('t4 offene Änderung überlebt das Neuladen', ueberlebt.length === 1 && ueberlebt[0].endsWith('inf-mb/v05/code:t-9'), ueberlebt.join(','));
  await B.ctx.unroute('**/api/abgleich');
  await B.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  const nach = await bis(async () => (await server(A))['inf-mb/v05/code:t-9'], 15000);
  pruefe('t4 nach Neuladen beim Start nachgereicht', !!nach);
  await ende(A); await ende(B);
}

/* ── t5 ────────────────────────────────────────────────────── */
async function t5() {
  const id = uid('t5');
  const A = await geraet(id), B = await geraet(id);
  const pfad = 'inf-mb/werkbank/prog:t5';
  await schreibe(A, pfad, { titel: 'x' });
  await bis(async () => (await server(A))[pfad], 8000);
  await fokus(B);
  await bis(async () => (await lies(B, pfad)) !== undefined, 8000);
  await B.page.evaluate(() => { window.__ev = []; window.KursSpeicher.abonnieren('inf-mb/werkbank/', (e) => window.__ev.push(e)); });
  await loesche(A, pfad);
  pruefe('t5 A: lokal sofort weg', (await lies(A, pfad)) === undefined);
  const weg = await bis(async () => !(await server(A))[pfad], 8000);
  pruefe('t5 Löschmarke beim Server', !!weg);
  await fokus(B);
  const bw = await bis(async () => (await lies(B, pfad)) === undefined, 8000);
  const ev = await B.page.evaluate(() => window.__ev.filter((e) => e.geloescht).map((e) => e.pfad));
  pruefe('t5 B: Eintrag verschwindet ohne Neuladen', !!bw);
  pruefe('t5 B: Abonnent bekommt „geloescht“', ev.includes(pfad), ev.join(','));
  await B.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  pruefe('t5 B: nach Neuladen weiterhin weg', (await lies(B, pfad)) === undefined);
  await ende(A); await ende(B);
}

/* ── Dialoge und Konto-Seite ───────────────────────────────── */
async function dialog(page) { const d = page.locator('dialog.ka-dialog[open]'); await d.waitFor({ timeout: 10000 }); return d; }
async function speicherSchluessel(page) { return page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('dhbw-inf-mb:speicher:v2') || '{}')).filter((p) => p.indexOf('inf-mb/app/') !== 0).sort()); }

async function t6() {
  const id = uid('t6');
  /* Gerät 1: Gast mit drei Einträgen, dann anmelden, „Ja“ */
  const g1 = await geraet(null);
  await schreibe(g1, 'inf-mb/v01/done', { a: 1 });
  await schreibe(g1, 'inf-mb/v01/aufg', { 't-1': true });
  await schreibe(g1, 'inf-mb/v02/done', { b: 1 });
  await anmelden(g1.page, id);
  await oeffne(g1, g1.page, 'konto.html', false);
  let d = await dialog(g1.page);
  const text = await d.innerText();
  pruefe('t6 erster Login: Dialog nennt die Anzahl (3 Einträge)', /3 Einträge/.test(text) && /übernehmen/.test(text), text.split('\n').slice(0, 3).join(' / '));
  await g1.page.locator('dialog.ka-dialog button:has-text("Ja, übernehmen")').click();
  await bereit(g1.page);
  const s1 = await server(g1);
  pruefe('t6 „Ja“: lokaler Stand liegt im Konto', ['inf-mb/v01/done', 'inf-mb/v01/aufg', 'inf-mb/v02/done'].every((p) => s1[p]));
  /* Gerät 2: Gast mit zwei anderen Einträgen, „Nein“ */
  const g2 = await geraet(null);
  await schreibe(g2, 'inf-mb/v09/done', { z: 1 });
  await schreibe(g2, 'inf-mb/v09/aufg', { 't-2': true });
  await anmelden(g2.page, id);
  await oeffne(g2, g2.page, 'konto.html', false);
  d = await dialog(g2.page);
  await g2.page.locator('dialog.ka-dialog button:has-text("Nein, getrennt halten")').click();
  await bereit(g2.page);
  const s2 = await server(g2);
  pruefe('t6 „Nein“: lokaler Stand wird nicht hochgeladen', !s2['inf-mb/v09/done'] && !s2['inf-mb/v09/aufg']);
  const lok = await speicherSchluessel(g2.page);
  pruefe('t6 „Nein“: Kontostand wurde geladen, Gaststand ist getrennt', lok.includes('inf-mb/v01/done') && !lok.includes('inf-mb/v09/done'), lok.join(','));
  await g2.page.waitForTimeout(1800);
  pruefe('t6 „Nein“: auch nach Abgleich nichts hochgeladen', !(await server(g2))['inf-mb/v09/done']);
  /* Entscheidung gemerkt: neu laden, kein Dialog */
  await oeffne(g2, g2.page, 'konto.html', true);
  pruefe('t6 Entscheidung je Benutzer und Gerät gemerkt (kein zweiter Dialog)', (await g2.page.locator('dialog.ka-dialog[open]').count()) === 0);
  /* Abmelden mit „entfernen“ -> Gaststand kommt zurück */
  await g2.page.locator('[data-konto-aktion="abmelden"]').click();
  d = await dialog(g2.page);
  await g2.page.locator('dialog.ka-dialog button:has-text("Stand von diesem Gerät entfernen")').click();
  /* Abmelden führt über /.auth/logout zurück auf die Kontoseite: warten, bis der Emulator meldet, dass niemand mehr angemeldet ist */
  const abgemeldet = await bis(async () => { const r = await g2.ctx.request.get(BASIS + '/.auth/me').then((x) => x.json()); return !r || !r.clientPrincipal; }, 15000);
  pruefe('t6 Abmelden: Sitzung beendet (/.auth/me ohne Benutzer)', !!abgemeldet);
  await g2.page.waitForLoadState('domcontentloaded');
  await g2.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  const nachAbmelden = await speicherSchluessel(g2.page);
  pruefe('t6 Abmelden+entfernen: Kontostand weg, Gaststand wieder da', !nachAbmelden.includes('inf-mb/v01/done') && nachAbmelden.includes('inf-mb/v09/done'), nachAbmelden.join(','));
  const me = await g2.ctx.request.get(BASIS + '/api/ich').then((r) => r.json());
  pruefe('t6 Abmelden: Sitzung beendet', me.angemeldet === false);
  pruefe('t6 keine Konsolenfehler', g1.konsole.length + g2.konsole.length === 0, [...g1.konsole, ...g2.konsole].join(' | '));
  await ende(g1); await ende(g2);
}

async function t7() {
  const X = uid('t7x'), Y = uid('t7y');
  const g = await geraet(X);
  await schreibe(g, 'inf-mb/v06/done', { x: 1 });
  await bis(async () => (await server(g))['inf-mb/v06/done'], 8000);
  /* Abmelden, Stand behalten */
  await oeffne(g, g.page, 'konto.html', true);
  await g.page.locator('[data-konto-aktion="abmelden"]').click();
  await dialog(g.page);
  await g.page.locator('dialog.ka-dialog button:has-text("Stand hier behalten")').click();
  await g.page.waitForLoadState('domcontentloaded');
  await warte(600);
  await g.page.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  pruefe('t7 Abmelden+behalten: Stand bleibt auf dem Gerät', (await speicherSchluessel(g.page)).includes('inf-mb/v06/done'));
  /* anderes Konto meldet sich an */
  await anmelden(g.page, Y);
  await oeffne(g, g.page, 'konto.html', false);
  const d = await dialog(g.page);
  const text = await d.innerText();
  pruefe('t7 anderes Konto: Dialog warnt, Stand wird nicht übernommen', /anderen Konto/.test(text) && /nicht in dein Konto/.test(text), text.split('\n')[0]);
  await warte(1800);
  const sY = await server(g);
  pruefe('t7 solange der Dialog offen ist, wandert nichts ins neue Konto', !sY['inf-mb/v06/done']);
  await g.page.locator('dialog.ka-dialog button:has-text("Entfernen und mit meinem Konto weiter")').click();
  await bereit(g.page);
  await warte(1800);
  const sY2 = await server(g);
  pruefe('t7 nach „Entfernen“: neues Konto ohne fremden Stand', !sY2['inf-mb/v06/done'] && !(await speicherSchluessel(g.page)).includes('inf-mb/v06/done'));
  await schreibe(g, 'inf-mb/v06/aufg', { y: 1 });
  pruefe('t7 neues Konto synchronisiert danach normal', !!(await bis(async () => (await server(g))['inf-mb/v06/aufg'], 8000)));
  /* X ist unverändert */
  const g2 = await geraet(X);
  const sX = await server(g2);
  pruefe('t7 Konto X auf dem Server unverändert (nur sein Eintrag)', !!sX['inf-mb/v06/done'] && !sX['inf-mb/v06/aufg']);
  await ende(g); await ende(g2);
}

/* ── t8 ────────────────────────────────────────────────────── */
async function t8() {
  const id = uid('t8');
  const A = await geraet(id);
  await A.page.evaluate(() => { window.__abg = []; window.KursApp.an('abgleich', (e) => window.__abg.push(e)); });
  await A.ctx.clearCookies();   /* Sitzung abgelaufen */
  await schreibe(A, 'inf-mb/v08/done', { s: 1 });
  const text = await bis(async () => { const t = await A.page.locator('[data-abgleich-status]').innerText(); return /Sitzung abgelaufen/.test(t) ? t : false; }, 12000);
  pruefe('t8 401: Kopfzeile zeigt „Sitzung abgelaufen“ mit Knopf zum Anmelden', !!text && (await A.page.locator('[data-abgleich-status] button:has-text("Neu anmelden")').count()) === 1, text || '');
  const st = await status(A);
  pruefe('t8 Abgleich pausiert, Änderung bleibt offen', st.grund === 'sitzung' && st.offen === 1 && st.zustand === 'fehler', JSON.stringify({ g: st.grund, o: st.offen, z: st.zustand }));
  const n = posts(A); await fokus(A, 70000); await warte(500);
  pruefe('t8 pausiert: keine weiteren Abgleich-Anfragen bei Fokus', posts(A) === n);
  pruefe('t8 lokal weiterhin lesbar', gleich(await lies(A, 'inf-mb/v08/done'), { s: 1 }));
  const ev = await A.page.evaluate(() => window.__abg.map((e) => e.zustand + ':' + e.grund));
  pruefe('t8 Ereignis „abgleich“ meldet fehler/sitzung', ev.some((e) => e === 'fehler:sitzung'), ev.slice(-3).join(' '));
  const leiste = await A.page.locator('[data-app-konto] .app-rail__text').innerText();
  pruefe('t8 Leiste zeigt „Anmelden“ statt Konto', /Anmelden/.test(leiste), leiste);
  /* neu anmelden: dieselbe Identität */
  await anmelden(A.page, id);
  await oeffne(A, A.page, 'lernpfad.html', true);
  const ok = await bis(async () => (await server(A))['inf-mb/v08/done'], 12000);
  pruefe('t8 nach erneutem Anmelden wird die offene Änderung übertragen', !!ok);
  await ende(A);
}

/* ── t9 ────────────────────────────────────────────────────── */
async function t9() {
  const id = uid('t9');
  const g = await geraet(id);
  const tab2 = await g.ctx.newPage(); await beobachte(g, tab2); await tab2.clock.install();
  await oeffne(g, tab2, 'lernpfad.html', true);
  await warte(300);
  const vor = posts(g);
  await schreibe(g, 'inf-mb/v10/done', { t: 1 }, g.page);
  const s2 = await bis(async () => gleich(await lies(g, 'inf-mb/v10/done', tab2), { t: 1 }), 2000);
  pruefe('t9 Tab 2 sieht die Änderung von Tab 1 sofort (storage-Ereignis, ohne Netz)', !!s2);
  /* gleichzeitig in beiden Tabs andere Einträge */
  await Promise.all([schreibe(g, 'inf-mb/v10/aufg', { a: 1 }, g.page), schreibe(g, 'inf-mb/v11/aufg', { b: 1 }, tab2)]);
  const alle = await bis(async () => { const s = await server(g); return s['inf-mb/v10/done'] && s['inf-mb/v10/aufg'] && s['inf-mb/v11/aufg']; }, 12000);
  pruefe('t9 gleichzeitige Schreibvorgänge in zwei Tabs: nichts verloren', !!alle);
  await warte(2500);
  const n = posts(g) - vor;
  pruefe('t9 keine doppelten Übertragungen in Schleife (höchstens 4 POST für 3 Änderungen in 2 Tabs)', n <= 4, n + ' POST');
  const s1 = await status(g, g.page), s2s = await status(g, tab2);
  pruefe('t9 in beiden Tabs nichts mehr offen', s1.offen === 0 && s2s.offen === 0, `${s1.offen}/${s2s.offen}`);
  const a = await lies(g, 'inf-mb/v11/aufg', g.page), b = await lies(g, 'inf-mb/v10/aufg', tab2);
  pruefe('t9 beide Tabs haben beide Stände', gleich(a, { b: 1 }) && gleich(b, { a: 1 }));
  /* Stress: 25 abwechselnde Schreibvorgänge in beiden Tabs gleichzeitig */
  await Promise.all([0, 1].map((k) => (k ? tab2 : g.page).evaluate(async (k) => {
    for (let i = 0; i < 25; i++) { window.KursSpeicher.sofort.schreiben('inf-mb/v13/code:s' + k + '-' + i, 'w' + i); if (i % 5 === 0) await new Promise((r) => setTimeout(r, 1)); }
  }, k)));
  const stress = await bis(async () => { const s = await server(g); return Object.keys(s).filter((p) => p.indexOf('inf-mb/v13/') === 0).length === 50; }, 15000);
  const lokal = await g.page.evaluate(() => Object.keys(window.KursSpeicher.exportieren().eintraege).filter((p) => p.indexOf('inf-mb/v13/') === 0).length);
  const lokal2 = await tab2.evaluate(() => Object.keys(window.KursSpeicher.exportieren().eintraege).filter((p) => p.indexOf('inf-mb/v13/') === 0).length);
  pruefe('t9 Stress: 50 gleichzeitige Schreibvorgänge aus zwei Tabs, keiner geht verloren', !!stress && lokal === 50 && lokal2 === 50, `Server ${(await server(g)) && Object.keys(await server(g)).filter((p) => p.indexOf('inf-mb/v13/') === 0).length}, Tab1 ${lokal}, Tab2 ${lokal2}`);
  /* Takt: beide Tabs sichtbar, 60 s später höchstens eine Abfrage */
  await warte(300);
  const vorTakt = posts(g);
  await Promise.all([g.page.clock.runFor(61000), tab2.clock.runFor(61000)]);
  await warte(1500);
  const takt = posts(g) - vorTakt;
  pruefe('t9 Taktabfrage nach 60 s: zwei sichtbare Tabs erzeugen höchstens 2, im Normalfall 1 Anfrage', takt >= 1 && takt <= 2, takt + ' POST');
  pruefe('t9 keine Konsolenfehler', g.konsole.length === 0, g.konsole.join(' | '));
  await ende(g);
}

/* ── t10 ───────────────────────────────────────────────────── */
async function t10() {
  const id = uid('t10');
  const A = await geraet(id), B = await geraet(id);
  /* Uhr von A läuft 2 Stunden vor: der Server ersetzt den Zeitstempel, A übernimmt ihn */
  await A.page.clock.fastForward(2 * 3600 * 1000);
  await schreibe(A, 'inf-mb/v12/done', { z: 1 });
  const geaendertVorher = await A.page.evaluate(() => window.KursSpeicher.exportieren().eintraege['inf-mb/v12/done'].geaendert);
  const ok = await bis(async () => (await server(A))['inf-mb/v12/done'], 10000);
  const serverTs = ok && ok.geaendert;
  pruefe('t10 Zukunftszeit: Server speichert mit eigener Zeit', !!ok && serverTs < geaendertVorher, `${serverTs} < ${geaendertVorher}`);
  const lokalTs = await bis(async () => (await A.page.evaluate(() => window.KursSpeicher.exportieren().eintraege['inf-mb/v12/done'].geaendert)) === serverTs, 6000);
  pruefe('t10 Gerät mit falscher Uhr übernimmt den Server-Zeitstempel', !!lokalTs);
  /* B schreibt danach (echte Zeit) und muss gewinnen */
  await schreibe(B, 'inf-mb/v12/done', { z: 2 });
  await bis(async () => (await server(A))['inf-mb/v12/done'].wert.z === 2, 8000);
  await fokus(A, 20000);
  pruefe('t10 neuere Änderung eines korrekten Geräts gewinnt gegen die falsche Uhr', !!(await bis(async () => (await lies(A, 'inf-mb/v12/done')).z === 2, 8000)));
  /* abgelehnter Eintrag (zu groß) wird nicht ewig wiederholt, Meldung einmal */
  const gross = 'x'.repeat(70 * 1024);
  await schreibe(B, 'inf-mb/v12/code:zu-gross', gross);
  await bis(async () => (await status(B)).offen === 0, 10000);
  const n = posts(B); await warte(2500);
  const meldungen = await B.page.locator('.app-meldung').count();
  pruefe('t10 abgelehnter Eintrag verlässt „offen“ und wird nicht wiederholt', (await status(B)).offen === 0 && posts(B) === n);
  pruefe('t10 abgelehnt: Meldung wird einmal angezeigt, lokaler Stand bleibt', meldungen === 1 && (await lies(B, 'inf-mb/v12/code:zu-gross')).length === gross.length, meldungen + ' Meldung');
  await ende(A); await ende(B);
}


/* ── t12: Konto-Seite ──────────────────────────────────────── */
async function t12() {
  const id = uid('t12');
  const g = await geraet(id, { seite: 'konto.html' });
  const p = g.page;
  await p.locator('[data-konto-block="konto"]').waitFor({ state: 'visible', timeout: 10000 });
  pruefe('t12 angemeldet: Kontobereich und Datenbereich sichtbar, Gastbereich verborgen', (await p.locator('[data-konto-block="gast"]').isHidden()) && (await p.locator('[data-konto-block="daten"]').isVisible()));
  pruefe('t12 Abschnitt „Offline nutzen“ der PWA-Rolle vorhanden', (await p.locator('[data-pwa-einstellungen]').count()) === 1 && /offline/i.test(await p.locator('main').innerText()));
  const sag = async () => p.locator('[data-konto-name-status]').innerText();
  await p.fill('#k-name', 'A'); await p.click('[data-konto-name-form] button[type=submit]');
  pruefe('t12 zu kurzer Name: freundliche Meldung, nichts gesendet', /2 bis 30 Zeichen/.test(await sag()), await sag());
  await p.fill('#k-name', 'Prof Meier'); await p.click('[data-konto-name-form] button[type=submit]');
  await bis(async () => /Rollen|vorbehalten/.test(await sag()), 6000);
  pruefe('t12 reserviertes Wort: erklärende Meldung', /Rollen vorbehalten/.test(await sag()), await sag());
  await p.fill('#k-name', 'Maria K.'); await p.click('[data-konto-name-form] button[type=submit]');
  await bis(async () => /Gespeichert/.test(await sag()), 6000);
  pruefe('t12 gültiger Name wird gespeichert und angezeigt', /Gespeichert/.test(await sag()) && /Maria K\./.test(await p.locator('[data-konto-kennung]').innerText()), await p.locator('[data-konto-kennung]').innerText());
  const leiste = await p.locator('[data-app-konto]').getAttribute('title');
  pruefe('t12 Leiste: Konto-Ziel zeigt „angemeldet als Maria K.“', /angemeldet als Maria K\./.test(leiste || ''), leiste || '');
  await schreibe(g, 'inf-mb/v03/done', { k: 1 });
  await bis(async () => (await server(g))['inf-mb/v03/done'], 8000);
  await p.waitForFunction(() => /Alles abgeglichen/.test(document.querySelector('[data-konto-abgleich]').textContent), null, { timeout: 8000 });
  pruefe('t12 Abgleich-Status: „Alles abgeglichen“ mit Zeitpunkt', /Alles abgeglichen, zuletzt/.test(await p.locator('[data-konto-abgleich]').innerText()), await p.locator('[data-konto-abgleich]').innerText());
  /* Daten herunterladen */
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-konto-aktion="export"]')]);
  const inhalt = JSON.parse(await (await import('node:fs')).promises.readFile(await dl.path(), 'utf8'));
  pruefe('t12 „Meine Daten herunterladen“ liefert JSON mit den Einträgen', JSON.stringify(inhalt).includes('inf-mb/v03/done'), dl.suggestedFilename());
  /* Arbeitsstand sichern und laden (ohne Konto geht das ebenfalls; hier mit Konto: Import wird abgeglichen) */
  const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('[data-konto-aktion="sichern"]')]);
  const sicherung = JSON.parse(await (await import('node:fs')).promises.readFile(await dl2.path(), 'utf8'));
  pruefe('t12 „Arbeitsstand sichern“ liefert die Sicherungsdatei des Kerns', sicherung.format === 'dhbw-inf-mb-arbeitsstand' && !!sicherung.eintraege['inf-mb/v03/done'], dl2.suggestedFilename());
  sicherung.eintraege['inf-mb/v14/aufg'] = { wert: { 'x-1': true }, geaendert: new Date().toISOString(), benutzer: 'lokal' };
  const tmp = (await import('node:path')).join((await import('node:os')).tmpdir(), 'abgleich-sicherung-' + LAUF + '.json');
  await (await import('node:fs')).promises.writeFile(tmp, JSON.stringify(sicherung));
  await p.setInputFiles('[data-konto-datei]', tmp);
  await bis(async () => /übernommen/.test(await p.locator('[data-konto-datei-status]').innerText()), 6000);
  pruefe('t12 „Arbeitsstand laden“ übernimmt, Rückmeldung per Statuszeile', /1 Eintrag übernommen/.test(await p.locator('[data-konto-datei-status]').innerText()), await p.locator('[data-konto-datei-status]').innerText());
  pruefe('t12 geladener Eintrag wird mit dem Konto abgeglichen', !!(await bis(async () => (await server(g))['inf-mb/v14/aufg'], 10000)));
  await (await import('node:fs')).promises.rm(tmp, { force: true });
  /* Löschen in zwei Stufen */
  await p.click('[data-konto-aktion="loeschen"]');
  await dialog(p);
  pruefe('t12 Löschen, Stufe 1: Erklärung, noch nichts gelöscht', /nicht rückgängig/.test(await p.locator('dialog.ka-dialog').innerText()) && !!(await server(g))['inf-mb/v03/done']);
  await p.locator('dialog.ka-dialog button:has-text("Weiter")').click();
  await p.locator('#k-bestaetigung').waitFor();
  const endgueltig = p.locator('dialog.ka-dialog button:has-text("Endgültig löschen")');
  pruefe('t12 Löschen, Stufe 2: Knopf gesperrt, bis „LÖSCHEN“ getippt wird', await endgueltig.isDisabled());
  await p.fill('#k-bestaetigung', 'loeschen');
  pruefe('t12 Löschen, Stufe 2: falsche Eingabe lässt den Knopf gesperrt', await endgueltig.isDisabled());
  await p.fill('#k-bestaetigung', 'LÖSCHEN');
  pruefe('t12 Löschen, Stufe 2: richtige Eingabe schaltet frei', await endgueltig.isEnabled());
  await endgueltig.click();
  await p.waitForLoadState('domcontentloaded');
  const weg = await bis(async () => { const r = await g.ctx.request.get(BASIS + '/api/ich').then((x) => x.json()); return r.angemeldet === false; }, 10000);
  pruefe('t12 danach abgemeldet', !!weg);
  const zweiter = await geraet(id);   /* dieselbe Identität, frisches Gerät */
  const leer = Object.keys(await server(zweiter)).filter((q) => q.indexOf('inf-mb/v03') === 0 || q.indexOf('inf-mb/v14') === 0);
  pruefe('t12 Konto ist leer (Einträge vom Server gelöscht)', leer.length === 0, leer.join(','));
  await p.goto(BASIS + '/lernpfad.html', { waitUntil: 'domcontentloaded' });
  pruefe('t12 Stand auf diesem Gerät bleibt (Kästchen nicht angehakt)', (await speicherSchluessel(p)).includes('inf-mb/v03/done'));
  pruefe('t12 keine Konsolenfehler', g.konsole.length === 0, g.konsole.join(' | '));
  await ende(g); await ende(zweiter);
}

/* ── t11: Messung ──────────────────────────────────────────── */
async function schritte(g, minuten, proMinute) {
  for (let m = 0; m < minuten; m++) {
    if (proMinute) await proMinute(m);
    await g.page.clock.runFor(60000);
    await warte(260);
  }
}
async function t11() {
  const rep = {};
  /* a) Leerlauf: sichtbarer Tab, keine Eingaben, 60 Minuten */
  {
    const g = await geraet(uid('t11a'));
    await warte(500);
    const t0 = g.aufrufe.length;
    await schritte(g, 60);
    const a = g.aufrufe.slice(t0);
    rep.leerlauf = { gesamt: a.length, abgleich: a.filter((x) => x.pfad === '/api/abgleich').length, andere: a.filter((x) => x.pfad !== '/api/abgleich').map((x) => x.pfad) };
    await ende(g);
  }
  /* b) aktive Stunde: Tab sichtbar, alle 5 Minuten eine Eingabe (z. B. Lesen mit Scrollen), nichts geändert */
  {
    const g = await geraet(uid('t11b'));
    await warte(500);
    const t0 = g.aufrufe.length;
    await schritte(g, 60, async (m) => { if (m % 5 === 0) await g.page.mouse.wheel(0, 40); });
    const a = g.aufrufe.slice(t0);
    rep.aktiveStundeOhneAenderung = { gesamt: a.length, abgleich: a.filter((x) => x.pfad === '/api/abgleich').length };
    await ende(g);
  }
  /* c) Lernsitzung 45 Minuten: alle 2 Minuten eine Änderung (Abschnitt abhaken, Aufgabe lösen, Code speichern), ständig aktiv */
  {
    const g = await geraet(uid('t11c'));
    await warte(500);
    const t0 = g.aufrufe.length;
    let schreib = 0, seiten = 0;
    await schritte(g, 45, async (m) => {
      await g.page.mouse.wheel(0, 30);
      if (m % 5 === 4) { await g.page.goto(BASIS + '/' + (m % 2 ? 'lernpfad.html' : 'lektionen/v07-labor.html'), { waitUntil: 'domcontentloaded' }); seiten++; }
      if (m % 2 === 0) { schreib++; await schreibe(g, 'inf-mb/v07/done', { ['s' + m]: true }); if (m % 6 === 0) await schreibe(g, 'inf-mb/v07/code:t-' + m, 'x = ' + m); }
    });
    const a = g.aufrufe.slice(t0);
    rep.lernsitzung45min = { gesamt: a.length, abgleich: a.filter((x) => x.pfad === '/api/abgleich').length, aenderungen: schreib, seitenwechsel: seiten };
    /* d) wie c, aber mit Tab im Hintergrund (nicht sichtbar): nur Schreib-Abgleiche */
    await ende(g);
  }
  console.log('  MESSUNG ' + JSON.stringify(rep));
  pruefe('t11 Leerlauf-Stunde: höchstens 15 API-Aufrufe (danach pausiert der Takt ohne Eingabe)', rep.leerlauf.gesamt <= 15, rep.leerlauf.gesamt);
  pruefe('t11 aktive Stunde ohne Änderung: höchstens 62 Aufrufe', rep.aktiveStundeOhneAenderung.gesamt <= 62, rep.aktiveStundeOhneAenderung.gesamt);
  pruefe('t11 Lernsitzung 45 Min: höchstens 70 Aufrufe', rep.lernsitzung45min.gesamt <= 70, rep.lernsitzung45min.gesamt);
}

/* ── t13 ───────────────────────────────────────────────────── */
async function t13() {
  /* a) 600 Einträge à 1 KB (zusammen über 256 KB): mehrere Bündel, nie 413 */
  const id = uid('t13a');
  const g = await geraet(null);
  await g.page.evaluate(() => { const k = 'x'.repeat(1000); for (let i = 0; i < 600; i++) window.KursSpeicher.sofort.schreiben('inf-mb/v01/code:t-' + i, k + i); });
  await anmelden(g.page, id);
  await oeffne(g, g.page, 'konto.html', false);
  await dialog(g.page);
  await g.page.locator('dialog.ka-dialog button:has-text("Ja, übernehmen")').click();
  await bereit(g.page);
  const ok = await bis(async () => { const s = await server(g); return Object.keys(s).filter((p) => p.startsWith('inf-mb/v01/code:t-')).length === 600; }, 25000, 400);
  pruefe('t13 600 Einträge à 1 KB kommen vollständig im Konto an', !!ok);
  await bis(async () => (await status(g)).offen === 0, 8000);
  pruefe('t13 nichts bleibt offen', (await status(g)).offen === 0);
  pruefe('t13 kein Aufruf mit 413', !g.antworten.includes(413), JSON.stringify(g.antworten));
  pruefe('t13 mehrere Bündel (Bytegrenze greift)', g.antworten.filter((c) => c === 200).length >= 3, g.antworten.length + ' Antworten');
  await ende(g);
  /* b) ein Programm über 256 KB blockiert die übrigen Einträge nicht */
  const h = await geraet(uid('t13b'));
  const vor = h.antworten.length;
  await schreibe(h, 'inf-mb/werkbank/prog:gross', 'x'.repeat(300 * 1024));
  await schreibe(h, 'inf-mb/v01/done', { a: 1 });
  await warte(2200);
  await schreibe(h, 'inf-mb/v02/done', { b: 1 });
  const sb = await bis(async () => { const s = await server(h); return s['inf-mb/v01/done'] && s['inf-mb/v02/done']; }, 12000);
  pruefe('t13 großes Programm: übrige Einträge kommen an', !!sb);
  const stb = await status(h);
  pruefe('t13 großes Programm: nichts bleibt ewig offen', stb.offen === 0, JSON.stringify({ offen: stb.offen, z: stb.zustand }));
  pruefe('t13 großes Programm: nicht auf dem Server, lokal erhalten', !(await server(h))['inf-mb/werkbank/prog:gross'] && (await lies(h, 'inf-mb/werkbank/prog:gross')).length === 300 * 1024);
  pruefe('t13 großes Programm: kein Aufruf mit 413', !h.antworten.slice(vor).includes(413), JSON.stringify(h.antworten.slice(vor)));
  const meldung = await h.page.evaluate(() => document.body.innerText.includes('zu groß für den Abgleich'));
  pruefe('t13 großes Programm: einmal gemeldet', meldung);
  await ende(h);
  /* c) Gast-Änderungen nach „Stand hier behalten“ werden beim nächsten Anmelden nachgereicht */
  const X = uid('t13c');
  const c = await geraet(X);
  await schreibe(c, 'inf-mb/v01/done', { a: 1 });
  await bis(async () => (await server(c))['inf-mb/v01/done'], 8000);
  await oeffne(c, c.page, 'konto.html', true);
  await c.page.locator('[data-konto-aktion="abmelden"]').click();
  await dialog(c.page);
  await c.page.locator('dialog.ka-dialog button:has-text("Stand hier behalten")').click();
  await c.page.waitForLoadState('domcontentloaded');
  await warte(600);
  await oeffne(c, c.page, 'lernpfad.html', false);
  await schreibe(c, 'inf-mb/v02/done', { b: 1 });
  await oeffne(c, c.page, 'konto.html', false);
  await schreibe(c, 'inf-mb/v03/done', { c: 1 });
  await anmelden(c.page, X);
  await oeffne(c, c.page, 'lernpfad.html', true);
  pruefe('t13 Gast-Änderungen: kein Dialog bei demselben Konto', (await c.page.locator('dialog.ka-dialog[open]').count()) === 0);
  const sc = await bis(async () => { const s = await server(c); return s['inf-mb/v02/done'] && s['inf-mb/v03/done']; }, 10000);
  pruefe('t13 Gast-Änderungen nach „Stand hier behalten“ kommen im Konto an', !!sc);
  /* d) Anmeldeabfrage gestört: Schreiben auf einer Seite ohne Anschluss geht nicht verloren */
  await c.page.route('**/api/ich', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await c.page.evaluate(() => { try { localStorage.removeItem('inf-mb-app:konto'); } catch (e) {} });
  await oeffne(c, c.page, 'glossar.html', false);
  await warte(500);
  pruefe('t13 /api/ich gestört: Seite ohne Anschluss', !(await status(c)).aktiv);
  await schreibe(c, 'inf-mb/v05/done', { e: 1 });
  await c.page.unroute('**/api/ich');
  await oeffne(c, c.page, 'lernpfad.html', true);
  const sd = await bis(async () => (await server(c))['inf-mb/v05/done'], 10000);
  pruefe('t13 /api/ich gestört: Schreibvorgang kommt später im Konto an', !!sd);
  /* e) Kontoseite: leere Statuszeilen ohne Höhe, Datenschutztext ehrlich */
  await oeffne(c, c.page, 'konto.html', false);
  const hoehen = await c.page.evaluate(() => [...document.querySelectorAll('.konto-status')].filter((e) => !e.textContent.trim()).map((e) => { const cs = getComputedStyle(e); return e.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }));
  pruefe('t13 leere Statuszeilen nehmen keinen Platz ein', hoehen.length > 0 && hoehen.every((x) => x === 0), JSON.stringify(hoehen));
  const text = await c.page.evaluate(() => document.body.innerText);
  pruefe('t13 Datenschutztext nennt die Anmeldeabfrage', /nach, ob du angemeldet bist/.test(text) && !/keine Verbindung zu einem Server/.test(text));
  pruefe('t13 keine Konsolenfehler', g.konsole.length + h.konsole.length + c.konsole.length === 0, [...g.konsole, ...h.konsole, ...c.konsole].join(' | '));
  await ende(c);
}

/* ── Lauf ──────────────────────────────────────────────────── */
const tests = { t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t12, t13, t11 };
browser = await chromium.launch();
try {
  const st = await fetch(BASIS + '/api/status').then((r) => r.json()).catch(() => null);
  if (!st || !st.ok) { console.error('API nicht erreichbar unter ' + BASIS + '/api/status'); process.exit(2); }
  console.log(`Abgleich-Prüfung gegen ${BASIS} (Ablage: ${st.ablage}, Lauf ${LAUF})`);
  for (const [name, fn] of Object.entries(tests)) {
    if (nur && !nur.includes(name)) continue;
    if (name === 't11' && ohneMessung) continue;
    console.log(`\n${name}`);
    try { await fn(); } catch (e) { pruefe(name + ' ohne Ausnahme', false, (e && e.stack || e).toString().split('\n').slice(0, 4).join(' | ')); }
    for (const g of geraete.splice(0)) await ende(g);
  }
} finally {
  await browser.close();
}
console.log(`\n${anzahl - fehler} von ${anzahl} Prüfungen bestanden.`);
process.exit(fehler ? 1 : 0);
