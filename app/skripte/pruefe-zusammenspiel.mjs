/* =============================================================
   pruefe-zusammenspiel.mjs – Abläufe über alle Rollen hinweg (Rolle Integration)
   Aufruf:  node skripte/pruefe-zusammenspiel.mjs [http://localhost:4340] [--nur gast,konto,teilen,tutor,offline]
   Voraussetzung: Emulator mit API und Modell-Doppel, z. B. über npm run pruefen:alles, oder
     TUTOR_DOPPEL=1 ABLAGE=datei ABLAGE_DATEI=<eigene Datei> BENUTZER_SALT=lokal-test \
       swa start app/dist-int --api-location api --port 4340 --api-port 7340
   Chromium, 1440×900. Anmeldung über das Formular des Emulators (feste Kennung je Lauf).
   Szenarien:
     gast      Heute → V01 Lerneinheit (Abschnitt abhaken, Python ausführen, erster Klick zählt)
               → Labor (Aufgabe lösen, erster Klick in der Knopfleiste) → Heute zeigt Stand und „Weiter“;
               Lektionswähler, Heute und Lernpfad zählen gleich; Suche findet und springt; „Werkbank“ aus der Lerneinheit
     konto     Anmelden mit Gaststand → Dialog → Stand im Konto; zweites Gerät sieht Fortschritt und Programm;
               Änderung am zweiten Gerät erreicht das erste
     teilen    Anzeigename auf der Kontoseite, Teilen, Link als Gast öffnen, ausführen, Kopie
     tutor     Labor: Panel, Frage mit Code, Antwort, Restkontingent sinkt, Esc, Labor bleibt bedienbar; Gast: Anmelde-Hinweis
     offline   Service Worker + „Python offline bereit machen“, offline: Lektion, Python, Werkbank lokal, Abgleich wartet,
               online: nachgereicht; /.auth, /login, /logout nie aus dem Cache; nach Abmelden Gastzustand
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { DIST, SITE } from '../src/lib/pfade.mjs';

const args = process.argv.slice(2);
const BASIS = (args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:4340').replace(/\/+$/, '');
const NUR = (() => { const i = args.indexOf('--nur'); return i >= 0 ? args[i + 1].split(',') : null; })();
const LAUF = Date.now().toString(36);
const NUTZER = 'zs-' + LAUF;

const ok = [], fehler = [];
function pruefe(bedingung, text, info) {
  const z = text + (info !== undefined && info !== '' ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '');
  (bedingung ? ok : fehler).push(z);
  console.log((bedingung ? '  ok      ' : '  FEHLER  ') + z);
  return !!bedingung;
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function bis(fn, ms = 15000, schritt = 200) {
  const ende = Date.now() + ms;
  for (;;) {
    let r; try { r = await fn(); } catch { r = false; }
    if (r) return r;
    if (Date.now() > ende) return false;
    await warte(schritt);
  }
}

/* Bekannte Bestandsmängel (fundament.md): Dateien, die schon in site/ fehlen (Poster, Untertitel) */
function bestandFehlt(u) {
  const p = decodeURIComponent(new URL(u).pathname).replace(/^\/+/, '');
  if (!/^(assets|notebooks)\//.test(p)) return false;
  return !fs.existsSync(path.join(SITE, p)) && !fs.existsSync(path.join(DIST, p));
}

let browser;
/* Kontext mit Beobachtung: Konsolenfehler, Skriptfehler, fehlgeschlagene Anfragen */
async function kontext(name, opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', serviceWorkers: opt.sw ? 'allow' : 'block', permissions: ['clipboard-read', 'clipboard-write'] });
  const k = { name, ctx, probleme: [], offline: false };
  ctx.on('page', (p) => beobachte(k, p));
  k.page = await ctx.newPage();
  return k;
}
function beobachte(k, page) {
  page.on('pageerror', (e) => k.probleme.push('Skriptfehler: ' + String(e.message || e).slice(0, 160) + ' (' + page.url().replace(BASIS, '') + ')'));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const loc = (m.location() && m.location().url) || '';
    if (/^Failed to load resource/.test(m.text()) && (bestandFehlt(new URL(loc || BASIS, BASIS).href) || k.offline || k.erlaubt?.(loc, m.text()))) return;
    k.probleme.push('Konsole: ' + m.text().slice(0, 160) + (loc ? ' (' + loc.replace(BASIS, '') + ')' : ''));
  });
  page.on('requestfailed', (r) => {
    const f = r.failure() ? r.failure().errorText : '';
    if (k.offline) return;                                                     /* offline gewollt */
    /* ERR_ABORTED: vom Browser selbst abgebrochen (Seitenwechsel, Video-Vorladen), kein Fehler der Seite */
    if (f === 'net::ERR_ABORTED') return;
    k.probleme.push(`Anfrage fehlgeschlagen: ${r.url().replace(BASIS, '')} ${f}`);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    if (r.status() === 404 && bestandFehlt(r.url())) return;
    if (k.erlaubt && k.erlaubt(r.url(), r.status())) return;
    k.probleme.push(`HTTP ${r.status()}: ${r.url().replace(BASIS, '')}`);
  });
}
function sauber(k, wo) {
  const p = k.probleme.splice(0);
  pruefe(p.length === 0, `${k.name}: keine Konsolenfehler und keine fehlgeschlagenen Anfragen (${wo})`, p.slice(0, 4).join(' | '));
}

async function anmelden(page, userId = NUTZER) {
  await page.waitForURL(/\.auth\/login\/github/, { timeout: 15000 }).catch(() => page.goto(BASIS + '/.auth/login/github'));
  for (const [sel, w] of [['#userId', userId], ['#userDetails', 'Test ' + userId]]) { const f = page.locator(sel); await f.fill(w); await f.dispatchEvent('keyup'); }
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/.auth/'), { timeout: 20000 }), page.locator('#submit').click()]);
}
async function dialogJa(page) {
  const da = await page.waitForSelector('dialog.ka-dialog[open]', { timeout: 8000 }).then(() => true, () => false);
  if (da) {
    await page.locator('dialog.ka-dialog[open] button', { hasText: 'Ja, übernehmen' }).click();
    await page.waitForSelector('dialog.ka-dialog[open]', { state: 'detached', timeout: 5000 }).catch(() => {});
  }
  return da;
}
const lies = (page, pfad) => page.evaluate((p) => window.KursSpeicher.sofort.lesen(p), pfad);
const abgleichFertig = (page, ms = 20000) => page.waitForFunction(() => {
  const s = window.KursAbgleich && window.KursAbgleich.status();
  return s && s.aktiv && s.letzter && s.zustand !== 'laeuft' && !s.offen;
}, null, { timeout: ms }).then(() => true, () => false);
async function serverStand(k) {
  const r = await k.ctx.request.get(BASIS + '/api/eintraege');
  const d = r.ok() ? await r.json() : { eintraege: [] };
  const o = {};
  for (const e of d.eintraege || []) if (!e.geloescht) o[e.pfad] = e;
  return o;
}

/* Erster Klick auf „Ausführen“ nach einem Klick in den Editor: muss sofort wirken (Befund Werkbank, behoben in shell.css) */
async function ersterKlickAusfuehren(page, runner, wo, { ohneEditor = false } = {}) {
  await runner.scrollIntoViewIfNeeded();
  if (!ohneEditor) await runner.locator('.cm-content').first().click();
  const knopf = runner.locator('.k-runner__bar button', { hasText: 'Ausführen' }).first();
  const vorher = await knopf.boundingBox();
  await knopf.click();
  const nachher = await knopf.boundingBox();
  const lief = await bis(() => runner.evaluate((r) => {
    const o = r.querySelector('.k-runner__out'), s = r.querySelector('.k-runner__status');
    return (o && !o.hidden && o.textContent.trim().length > 0) || (s && /läuft|lädt|fertig|Python wird/i.test(s.textContent));
  }), 3000, 100);
  pruefe(lief && Math.abs(nachher.y - vorher.y) < 1, `${wo}: erster Klick auf „Ausführen“${ohneEditor ? ' (Editor ohne Fokus)' : ' nach Klick in den Editor'} startet das Programm, Leiste bleibt stehen`, `Knopf y ${Math.round(vorher.y)} → ${Math.round(nachher.y)}`);
  const ausgabe = await bis(() => runner.evaluate((r) => { const o = r.querySelector('.k-runner__out'); return o && !o.hidden && o.textContent.trim(); }), 120000, 300);
  pruefe(!!ausgabe && !/konnte nicht gestartet|Ladefehler|Traceback/.test(ausgabe), `${wo}: Python läuft, Ausgabe erscheint`, String(ausgabe || '').slice(0, 50));
}

/* Zahlen (fertig, gesamt) aus einem Text wie „1 von 4 Abschnitten“ oder „1/4 Abschnitte“ */
function zahlen(text) { return [...String(text).matchAll(/(\d+)\s*(?:von|\/)\s*(\d+)/g)].map((m) => m[1] + '/' + m[2]).join(' '); }

/* ─────────────────────────────────────────────────────────── gast */
let A = null;   /* erstes Gerät (Gast, später angemeldet) */
let programmId = null;
async function gast() {
  console.log('\n== Gast: Heute → Lerneinheit → Labor → Heute, Suche');
  A = await kontext('Gerät A');
  const p = A.page;
  await p.goto(BASIS + '/index.html');
  pruefe(await p.locator('main h1').count() === 1, 'Heute lädt');
  await p.goto(BASIS + '/lektionen/v01-ablauf-und-erste-programme.html');
  await p.waitForSelector('.k-done button');
  await p.locator('.k-done button').first().click();
  const done = await lies(p, 'inf-mb/v01/done');
  pruefe(done && Object.keys(done).length === 1, 'Lerneinheit: Abschnitt abgehakt', done);

  const runner = p.locator('.k-runner').first();
  await p.waitForSelector('.k-runner .cm-content', { timeout: 20000 });
  await ersterKlickAusfuehren(p, runner, 'Lerneinheit V01');

  /* „Werkbank“ am Codeblock legt ein Programm an und öffnet die Werkbank */
  const wb = runner.locator('a, button', { hasText: 'Werkbank' }).first();
  pruefe(await wb.count() === 1, 'Lerneinheit: Knopf „Werkbank“ am Codeblock');
  await wb.click();
  await p.waitForURL(/werkbank\.html#p[a-z0-9]{6}/, { timeout: 10000 });
  programmId = new URL(p.url()).hash.slice(1);
  await p.waitForSelector('#wb-liste a');
  pruefe(/^V01 · /.test(await p.inputValue('#wb-titel')), 'Werkbank: Programm aus der Lerneinheit angelegt', await p.inputValue('#wb-titel'));
  sauber(A, 'Lerneinheit, Werkbank');

  /* Automatisch erzeugte Runner (aus Codeblöcken) in einer Lerneinheit: dort trat der Fehler auf (V07) */
  await p.goto(BASIS + '/lektionen/v07-funktionen.html');
  await p.waitForSelector('.k-runner--auto .cm-content', { timeout: 20000 });
  await ersterKlickAusfuehren(p, p.locator('.k-runner.k-runner--auto').nth(1), 'Lerneinheit V07 (automatischer Runner)');
  await ersterKlickAusfuehren(p, p.locator('.k-runner.k-runner--auto').nth(2), 'Lerneinheit V07 (automatischer Runner)', { ohneEditor: true });

  /* Labor: Aufgabe tr-1 in Station t-1 */
  await p.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  const aufgabe = p.locator('.a-task[data-id="tr-1"]');
  await aufgabe.locator('.cm-content').waitFor({ timeout: 20000 });
  await p.evaluate(() => {
    const ta = document.querySelector('.a-task[data-id="tr-1"] textarea');
    window.KursEditor.setValue(ta, 'karten = 3\npreis = 9.5\ngesamt = karten * preis\nprint("Gesamt:", gesamt)\n');
  });
  await aufgabe.locator('.cm-content').click();
  await aufgabe.locator('button', { hasText: 'Prüfen' }).first().click();
  const geloest = await bis(async () => { const a = await lies(p, 'inf-mb/v01/aufg'); return a && a['tr-1']; }, 120000, 400);
  pruefe(!!geloest, 'Labor: Aufgabe tr-1 gelöst (erster Klick auf „Prüfen“ nach Klick in den Editor)');

  /* Labor, Werkzeugkasten: automatischer Runner (Bestandsfehler „erster Klick geht verloren“) */
  await p.goto(BASIS + '/lektionen/v01-labor.html#a-werkzeugkasten');
  await p.waitForSelector('#a-werkzeugkasten .k-runner--auto .cm-content', { timeout: 20000 });
  await ersterKlickAusfuehren(p, p.locator('#a-werkzeugkasten .k-runner--auto').first(), 'Labor V01 (Werkzeugkasten)');
  sauber(A, 'Labor');

  /* Heute: Stand und „Weiter“ */
  await p.goto(BASIS + '/index.html');
  await p.waitForSelector('.np-schritte');
  const heute = await p.locator('.np-schritte').innerText();
  const weiter = await p.locator('a.np-gross').getAttribute('href').catch(() => null);
  pruefe(/1 von 5 Abschnitten/.test(heute) && /1 von \d+ Aufgaben gelöst/.test(heute), 'Heute: V01 mit Stand', zahlen(heute));
  pruefe(/v01-labor\.html/.test(weiter || ''), 'Heute: „Weiter, wo du warst“ führt ins Labor', weiter);

  /* Eine Zählung für Lektionswähler, Heute und Lernpfad (Deep Dive zählt nicht) */
  await p.goto(BASIS + '/lernpfad.html');
  await p.waitForFunction(() => document.querySelector('#v01 [data-zahlen]') && document.querySelector('#v01 [data-zahlen]').textContent.trim());
  const lernpfad = await p.locator('#v01 [data-zahlen]').innerText();
  await p.goto(BASIS + '/lektionen/v01-ablauf-und-erste-programme.html');
  await p.click('[data-app-waehler]');
  await p.waitForFunction(() => { const n = document.querySelector('[data-app-stand="V01"]'); return n && n.textContent.trim(); });
  const waehler = await p.locator('[data-app-stand="V01"]').innerText();
  pruefe(zahlen(heute) === zahlen(lernpfad) && zahlen(lernpfad) === zahlen(waehler), 'Lektionswähler, Heute und Lernpfad zählen gleich', { heute: zahlen(heute), lernpfad: zahlen(lernpfad), waehler: zahlen(waehler) });
  await p.keyboard.press('Escape');

  /* Suche: Strg+K, Begriff, Enter springt */
  await p.goto(BASIS + '/index.html');
  await p.keyboard.press('Control+k');
  await p.waitForSelector('dialog[open] input');
  await p.keyboard.type('Zuweisung');
  await p.waitForFunction(() => document.querySelectorAll('dialog[open] [role="option"]').length > 0, null, { timeout: 8000 });
  const treffer = await p.locator('dialog[open] [role="option"]').allInnerTexts();
  pruefe(treffer.some((t) => /Zuweisung/.test(t)), 'Suche findet „Zuweisung“', treffer.slice(0, 3).map((t) => t.split('\n')[0]).join(' | '));
  await p.keyboard.press('Enter');
  await p.waitForURL((u) => !/index\.html$/.test(u.pathname), { timeout: 8000 }).catch(() => {});
  const ziel = new URL(p.url());
  const zielDa = ziel.hash ? await p.evaluate((h) => !!document.getElementById(decodeURIComponent(h.slice(1))), ziel.hash) : true;
  pruefe(!/index\.html$/.test(ziel.pathname) && zielDa, 'Suche: Enter springt zum Treffer, Anker existiert', ziel.pathname + ziel.hash);
  /* Glossar: alte Pluralanker bleiben gültig, Singular/Plural sind zusammengeführt */
  await p.goto(BASIS + '/glossar.html#g-zuweisung');
  const glossar = await p.evaluate(() => ({ alt: !!document.getElementById('g-dateien'), haupt: !!document.getElementById('g-datei'), dt: [...document.querySelectorAll('.gl-eintrag dt')].filter((d) => /^Datei(en)?\b/.test(d.textContent)).length }));
  pruefe(await p.evaluate(() => !!document.getElementById('g-zuweisung') && document.querySelectorAll('.gl-eintrag').length >= 5), 'Glossar: Begriffe aus Termin 01 mit Anker (#g-zuweisung)', glossar);
  sauber(A, 'Heute, Lernpfad, Suche, Glossar');

  /* Content-Security-Policy: fremde Verbindungsziele sind gesperrt (zur Sicherheit verlässt ohnehin nichts den Rechner) */
  await p.route('https://cdn.jsdelivr.net/**', (r) => r.abort());
  const csp = await p.evaluate(async () => {
    let verletzt = null;
    document.addEventListener('securitypolicyviolation', (e) => { verletzt = e.violatedDirective; });
    try { await fetch('https://cdn.jsdelivr.net/npm/pyodide@0.26.4/full/pyodide.js'); return 'erreicht'; } catch (e) { await new Promise((r) => setTimeout(r, 200)); return verletzt || 'abgebrochen ohne CSP'; }
  });
  pruefe(/connect-src/.test(csp), 'CSP sperrt fremde Verbindungsziele (connect-src)', csp);
  /* Storage: nur das Konto aus VIDEO_BASIS (hier ohne VIDEO_BASIS gebaut: keines). Geprüft am Kopf der Seite */
  const kopfCsp = (await (await p.request.get(BASIS + '/index.html')).headers())['content-security-policy'] || '';
  const verbinden = (/connect-src([^;]*)/.exec(kopfCsp) || [])[1] || '';
  /* Lokal ohne VIDEO_BASIS: kein Storage-Konto. Gegen die bereitgestellte App: genau das eine Konto aus VIDEO_BASIS. Nie ein Platzhalter. */
  const speicherKonten = verbinden.match(/https:\/\/\S*blob\.core\.windows\.net/g) || [];
  pruefe(kopfCsp && !/\*/.test(verbinden) && speicherKonten.length <= 1, 'CSP: connect-src ohne Platzhalter und höchstens mit dem einen Storage-Konto aus VIDEO_BASIS', 'connect-src' + verbinden);
  A.probleme.length = 0;   /* die gewollte CSP-Meldung in der Konsole */
}

/* ─────────────────────────────────────────────────────────── konto */
let B = null;
async function konto() {
  console.log('\n== Konto: Anmelden mit Gaststand, zweites Gerät');
  if (!A) await gast();
  const p = A.page;
  await p.goto(BASIS + '/konto.html');
  await p.click('[data-konto-aktion="anmelden"]');
  await anmelden(p);
  pruefe(/konto\.html/.test(p.url()), 'Nach der Anmeldung zurück auf der Kontoseite');
  pruefe(await dialogJa(p), 'Dialog „Bisherigen Arbeitsstand übernehmen?“ erscheint und wird bestätigt');
  pruefe(await abgleichFertig(p), 'Abgleich nach der Übernahme abgeschlossen');
  const server = await serverStand(A);
  pruefe(server['inf-mb/v01/done'] && server['inf-mb/v01/aufg'] && server['inf-mb/werkbank/prog:' + programmId], 'Gaststand liegt im Konto (Abschnitt, Aufgabe, Programm)', Object.keys(server).filter((k) => !k.startsWith('inf-mb/app/')).length + ' Einträge');
  pruefe(/angemeldet|Dein Konto/i.test(await p.locator('main').innerText()), 'Kontoseite zeigt den angemeldeten Zustand');
  sauber(A, 'Anmelden');

  /* Zweites Gerät: gleiche Identität */
  B = await kontext('Gerät B');
  await B.page.goto(BASIS + '/konto.html');
  await B.page.click('[data-konto-aktion="anmelden"]');
  await anmelden(B.page);
  await abgleichFertig(B.page);
  await B.page.goto(BASIS + '/index.html');
  await B.page.waitForSelector('.np-schritte');
  pruefe(/1 von 5 Abschnitten/.test(await B.page.locator('.np-schritte').innerText()), 'Gerät B: Heute zeigt den Fortschritt aus Gerät A');
  await B.page.goto(BASIS + '/werkbank.html#' + programmId);
  await B.page.waitForSelector('#wb-liste a');
  pruefe(/^V01 · /.test(await B.page.inputValue('#wb-titel')), 'Gerät B: Werkbank-Programm aus Gerät A ist da');
  /* Programm auf B ändern */
  await B.page.locator('#wb-runner .cm-content').first().click();
  await B.page.keyboard.press('Control+End');
  await B.page.keyboard.insertText('\nprint("von Gerät B")\n');
  await B.page.keyboard.press('Control+s');
  await B.page.waitForFunction(() => /^Gespeichert/.test(document.getElementById('wb-status').textContent), null, { timeout: 6000 }).catch(() => {});
  await B.page.evaluate(() => window.KursAbgleich.jetzt());
  pruefe(await abgleichFertig(B.page), 'Gerät B: Änderung abgeglichen');
  /* Gerät A sieht die Änderung (Abgleich bei Fokus bzw. Neuladen) */
  await p.goto(BASIS + '/werkbank.html#' + programmId);
  await p.waitForSelector('#wb-liste a');
  await p.evaluate(() => window.KursAbgleich.jetzt());
  const angekommen = await bis(() => p.evaluate(() => window.KursEditor.getValue(document.getElementById('wb-code')).includes('von Gerät B')), 15000);
  pruefe(angekommen, 'Gerät A: Änderung von Gerät B ist im offenen Programm angekommen');
  sauber(A, 'Werkbank A'); sauber(B, 'Gerät B');
}

/* ─────────────────────────────────────────────────────────── teilen */
async function teilen() {
  console.log('\n== Werkbank teilen');
  if (!A) await konto();
  const p = A.page;
  await p.goto(BASIS + '/konto.html');
  await p.waitForSelector('#k-name');
  await p.fill('#k-name', 'Ada Integration');
  await p.locator('[data-konto-name-form] button[type="submit"], [data-konto-name-form] button').first().click();
  const gesetzt = await bis(async () => (await p.evaluate(() => window.KursApp.konto.status())).anzeigename === 'Ada Integration', 8000);
  pruefe(gesetzt, 'Anzeigename auf der Kontoseite gesetzt', await p.locator('[data-konto-name-status]').innerText());
  await p.goto(BASIS + '/werkbank.html#' + programmId);
  await p.waitForSelector('#wb-liste a');
  await p.click('[data-wb="teilen"]');
  await p.waitForFunction(() => /Link erstellen/.test(document.getElementById('wb-teilen-koerper').textContent), null, { timeout: 8000 });
  await p.click('#wb-teilen-koerper button:has-text("Link erstellen")');
  await p.waitForSelector('#wb-linkfeld');
  const link = await p.inputValue('#wb-linkfeld');
  pruefe(/geteilt\.html\?id=[A-Za-z0-9_-]{10}$/.test(link), 'Teilen: Link erzeugt', link.replace(BASIS, ''));
  await p.keyboard.press('Escape');
  sauber(A, 'Teilen');

  const C = await kontext('Gast C');
  await C.page.goto(link);
  await C.page.waitForSelector('#gt-inhalt:not([hidden])');
  pruefe(/geteilt von Ada Integration/.test(await C.page.textContent('#gt-wer')), 'Gast: geteiltes Programm mit Autor');
  await C.page.waitForSelector('#gt-runner .cm-content', { timeout: 20000 });
  await ersterKlickAusfuehren(C.page, C.page.locator('#gt-runner'), 'Geteilte Seite');
  await C.page.click('#gt-kopie');
  await C.page.waitForURL(/werkbank\.html#p/, { timeout: 8000 }).catch(() => {});
  const kopien = await C.page.evaluate(async () => (await window.KursSpeicher.liste('inf-mb/werkbank/')).length);
  pruefe(kopien === 1, 'Gast: „Kopie in meine Werkbank“ legt ein Programm an', kopien);
  sauber(C, 'geteilte Seite');

  /* Eingaben für input() reisen mit: das Beispielprogramm der Werkbank läuft beim Empfänger */
  const kreisId = await p.evaluate(() => window.KursWerkbank.anlegen({ titel: 'Kreis mit Eingabe', code: 'r = float(input("Radius in mm: "))\nprint("Fläche:", round(3.14159 * r * r, 1), "mm²")\n', eingaben: '25' }));
  await p.goto(BASIS + '/werkbank.html#' + kreisId);
  await p.waitForSelector('#wb-runner .cm-content', { timeout: 20000 });
  await p.click('[data-wb="teilen"]');
  await p.waitForFunction(() => /Link erstellen/.test(document.getElementById('wb-teilen-koerper').textContent), null, { timeout: 8000 });
  await p.click('#wb-teilen-koerper button:has-text("Link erstellen")');
  await p.waitForSelector('#wb-linkfeld');
  const kreisLink = await p.inputValue('#wb-linkfeld');
  await p.keyboard.press('Escape');
  await C.page.goto(kreisLink);
  await C.page.waitForSelector('#gt-runner .cm-content', { timeout: 20000 });
  await C.page.click('#gt-runner .k-runner__bar button:has-text("Ausführen")');
  const kreisAus = await bis(() => C.page.evaluate(() => { const o = document.querySelector('#gt-runner .k-runner__out'); return o && !o.hidden && /Fläche|Error/.test(o.textContent) && o.textContent; }), 60000, 300);
  pruefe(/Fläche: 1963\.5/.test(kreisAus || '') && !/EOFError/.test(kreisAus || ''), 'Geteiltes Programm mit input(): Eingaben kommen mit, kein EOFError', String(kreisAus || '').trim().slice(0, 60));
  sauber(C, 'geteilt mit Eingaben');
  await C.ctx.close();

  /* Sicherheit: fremder Code im Python-Worker erreicht weder /api/ noch /.auth/ noch Cache oder IndexedDB
     (Befund: geteiltes Programm las mit der Sitzung des Opfers Daten aus und löschte das Konto) */
  const vorher = Object.keys(await serverStand(A)).length;
  const angriff = [
    'import js',
    'def probe(m, u):',
    '    x = js.XMLHttpRequest.new()',
    '    try:',
    '        x.open(m, js.location.origin + u, False)',
    '        x.setRequestHeader("X-Kurs-App", "1")',
    '        x.setRequestHeader("content-type", "application/json")',
    '        x.send()',
    '        return str(x.status)',
    '    except Exception:',
    '        return "gesperrt"',
    'for m, u in [("GET", "/api/ich"), ("GET", "/api/konto/export"), ("GET", "/.auth/me"), ("GET", "/API/ich"), ("GET", "/assets/%2e%2e/api/ich"), ("DELETE", "/api/konto"), ("GET", "/assets/data/v17/api/D2.json")]:',
    '    print("PROBE", m, u, probe(m, u))',
    'print("PROBE caches", getattr(js, "caches", None) is None, "indexedDB", getattr(js, "indexedDB", None) is None, "Worker", getattr(js, "Worker", None) is None)',
    'try:',
    '    js.importScripts(js.location.origin + "/api/ich")',
    '    print("PROBE import erreicht")',
    'except Exception:',
    '    print("PROBE import gesperrt")',
  ].join('\n');
  const angriffId = await p.evaluate(async (code) => (await window.KursApp.api('geteilt', { method: 'POST', body: { titel: 'Mittelwert', code } })).id, angriff);
  await p.goto(BASIS + '/geteilt.html?id=' + angriffId);
  await p.waitForSelector('#gt-runner .cm-content', { timeout: 20000 });
  await p.click('#gt-runner .k-runner__bar button:has-text("Ausführen")');
  const aus = await bis(() => p.evaluate(() => { const o = document.querySelector('#gt-runner .k-runner__out'); return o && /PROBE import/.test(o.textContent) && o.textContent; }), 90000, 300) || '';
  const zeile = (u) => { const z = aus.split('\n').map((l) => l.trim().split(' ')).find((t) => t[0] === 'PROBE' && t[2] === u); return z ? z[3] : undefined; };
  pruefe(['/api/ich', '/api/konto/export', '/.auth/me', '/API/ich', '/assets/%2e%2e/api/ich', '/api/konto'].every((u) => zeile(u) === 'gesperrt'), 'Python-Worker: /api/ und /.auth/ gesperrt (auch Groß-/Kleinschreibung, %2e%2e)', aus.replace(/\s+/g, ' ').slice(0, 260));
  pruefe(zeile('/assets/data/v17/api/D2.json') === '200', 'Python-Worker: Kursdateien unter assets/ weiter erreichbar (V17 requests)', zeile('/assets/data/v17/api/D2.json'));
  pruefe(/PROBE caches True indexedDB True Worker True/.test(aus) && /PROBE import gesperrt/.test(aus), 'Python-Worker: kein Cache Storage, kein IndexedDB, keine weiteren Worker, importScripts nur Kursdateien', (/PROBE caches.*|PROBE import.*/g.exec(aus) || [''])[0]);
  const nachher = Object.keys(await serverStand(A)).length;
  pruefe(nachher === vorher && nachher > 0 && (await p.evaluate(() => window.KursApp.konto.status(true))).angemeldet, 'Python-Worker: Konto und Einträge unverändert', `${vorher} → ${nachher}`);
  sauber(A, 'geteilter Angriffscode');
}

/* ─────────────────────────────────────────────────────────── tutor */
async function tutor() {
  console.log('\n== Tutor (Modell-Doppel)');
  if (!A) await konto();
  const p = A.page;
  const anfragen = [];
  const hoer = (r) => { if (r.url().endsWith('/api/tutor') && r.method() === 'POST') anfragen.push(r.postDataJSON()); };
  p.on('request', hoer);
  await p.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  await p.waitForSelector('.a-task[data-id="tr-1"] .cm-content', { timeout: 20000 });
  await p.click('[data-app-aktion="tutor"]');
  await p.waitForSelector('#tutor-frage');
  pruefe(await p.evaluate(() => document.activeElement && document.activeElement.id === 'tutor-frage'), 'Tutor: Panel offen, Fokus im Eingabefeld');
  const schalter = p.locator('#tutor-code-schalter');
  if (await schalter.count() && !(await schalter.isChecked())) await schalter.check();
  await p.fill('#tutor-frage', 'Warum brauche ich Anführungszeichen bei Gesamt?');
  await p.click('.tutor-senden');
  const antwort = await p.waitForSelector('.tutor-verlauf .tutor-beitrag--tutor', { timeout: 20000 }).then(() => true, () => false);
  pruefe(antwort, 'Tutor: Antwort erscheint');
  const gesendet = anfragen[0] || {};
  pruefe(gesendet.kontext && /Kinoabend|karten/.test(gesendet.kontext.code || '') && gesendet.kontext.lektion === 'V01', 'Tutor: Code der Aufgabe wurde mitgeschickt', gesendet.kontext ? { lektion: gesendet.kontext.lektion, aufgabe: gesendet.kontext.aufgabe, code: (gesendet.kontext.code || '').length + ' Zeichen' } : 'keine Anfrage');
  const rest1 = await p.locator('.tutor-rest').innerText();
  await p.fill('#tutor-frage', 'Und was macht print?');
  await p.click('.tutor-senden');
  await p.waitForFunction(() => document.querySelectorAll('.tutor-verlauf .tutor-beitrag--tutor').length >= 2, null, { timeout: 20000 }).catch(() => {});
  const rest2 = await p.locator('.tutor-rest').innerText();
  const n1 = Number((/\d+/.exec(rest1) || [NaN])[0]), n2 = Number((/\d+/.exec(rest2) || [NaN])[0]);
  pruefe(n1 > 0 && n2 === n1 - 1, 'Tutor: Restkontingent sinkt', `${rest1} → ${rest2}`);
  await p.keyboard.press('Escape');
  pruefe(await p.evaluate(() => document.querySelector('[data-app-slot="panel"]').hidden && !window.KursApp.panel.istOffen()), 'Tutor: Esc schließt das Panel');
  /* Labor bleibt bedienbar: Ausführen in der Aufgabe */
  const aufgabe = p.locator('.a-task[data-id="tr-1"]');
  await p.evaluate(() => window.KursEditor.setValue(document.querySelector('.a-task[data-id="tr-1"] textarea'), 'print("Kinoabend läuft")
'));
  await aufgabe.locator('.cm-content').click();
  await aufgabe.locator('button', { hasText: 'Ausführen' }).first().click();
  const lief = await bis(() => aufgabe.evaluate((a) => /Kinoabend läuft/.test(a.textContent.replace(a.querySelector('.a-editor') ? a.querySelector('.a-editor').textContent : '', ''))), 60000, 300);
  pruefe(lief, 'Labor nach dem Tutor bedienbar (Ausführen liefert Ausgabe)');
  /* Werkbank: das offene Programm geht mit (Befund: dort ging nur die Frage mit) */
  anfragen.length = 0;
  await p.goto(BASIS + '/werkbank.html#' + programmId);
  await p.waitForSelector('#wb-runner .cm-content', { timeout: 20000 });
  await p.click('[data-app-aktion="tutor"]');
  await p.waitForSelector('#tutor-frage');
  await p.focus('#tutor-frage');
  pruefe(/Programm und die letzte Ausgabe/.test(await p.locator('[data-app-slot="panel"]').innerText()), 'Tutor in der Werkbank: Hinweis „Dein Programm … wird mitgeschickt“');
  await p.fill('#tutor-frage', 'Warum kommt EOFError?');
  await p.click('.tutor-senden');
  await bis(() => anfragen.length > 0, 15000);
  const wb = (anfragen[0] || {}).kontext || {};
  pruefe(typeof wb.code === 'string' && wb.code.length > 0, 'Tutor in der Werkbank: Code des offenen Programms wird mitgeschickt', (wb.code || '').length + ' Zeichen');
  await p.waitForFunction(() => !document.querySelector('.tutor-status--laeuft'), null, { timeout: 20000 }).catch(() => {});
  await p.keyboard.press('Escape');
  p.off('request', hoer);
  sauber(A, 'Tutor');

  /* Freischaltung mit Kurscode (Server mit KURS_CODE): Hier antwortet der Server ohne Code mit 403 nur gespielt;
     die Freischaltung selbst läuft gegen die echte API (ohne KURS_CODE immer erfolgreich). */
  await p.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  let einmal = true;
  await p.route('**/api/tutor', (r) => {
    if (einmal && r.request().method() === 'POST') { einmal = false; return r.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ fehler: 'freischaltung', meldung: 'Der Tutor ist für Teilnehmende des Kurses.' }) }); }
    return r.continue();
  });
  A.erlaubt = (u, st) => /\/api\/tutor$/.test(u) && /403/.test(String(st));
  await p.click('[data-app-aktion="tutor"]');
  await p.fill('#tutor-frage', 'Was ist eine Variable?');
  await p.click('.tutor-senden');
  const feld = await p.waitForSelector('#tutor-kurscode', { timeout: 8000 }).then(() => true, () => false);
  pruefe(feld && (await p.inputValue('#tutor-frage')) === 'Was ist eine Variable?', 'Tutor: ohne Freischaltung Feld „Kurscode“, die Frage bleibt erhalten');
  if (feld) {
    const vorAntwort = await p.locator('.tutor-verlauf .tutor-beitrag--tutor').count();
    await p.fill('#tutor-kurscode', 'Kurscode');
    await p.click('.tutor-freischalten button[type="submit"]');
    await p.waitForSelector('#tutor-frage', { state: 'visible', timeout: 8000 }).catch(() => {});
    await p.click('.tutor-senden');
    pruefe(await p.waitForFunction((n) => document.querySelectorAll('.tutor-verlauf .tutor-beitrag--tutor').length > n, vorAntwort, { timeout: 20000 }).then(() => true, () => false), 'Tutor: nach der Freischaltung kommt die Antwort');
  }
  await p.unroute('**/api/tutor');
  A.erlaubt = null;
  await p.keyboard.press('Escape');
  sauber(A, 'Tutor-Freischaltung');

  /* Verlauf gehört einem Konto: nach Abmelden weder für Gäste sichtbar noch beim nächsten Konto im Body (Befund Sicherheit) */
  const T = await kontext('Tutor-Gerät');
  await T.page.goto(BASIS + '/konto.html');
  await T.page.click('[data-konto-aktion="anmelden"]');
  await anmelden(T.page, NUTZER + '-ta');
  await T.page.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  await T.page.click('[data-app-aktion="tutor"]');
  await T.page.fill('#tutor-frage', 'Ich heiße Anna Beispiel');
  await T.page.click('.tutor-senden');
  await T.page.waitForSelector('.tutor-verlauf .tutor-beitrag--tutor', { timeout: 20000 }).catch(() => {});
  await T.page.goto(BASIS + '/konto.html');
  await T.page.click('[data-konto-aktion="abmelden"]');
  const dlg = await T.page.waitForSelector('dialog.ka-dialog[open]', { timeout: 8000 }).then(() => true, () => false);
  if (dlg) await T.page.locator('dialog.ka-dialog[open] button', { hasText: 'entfernen' }).first().click();
  await bis(async () => { const r = await T.ctx.request.get(BASIS + '/.auth/me').then((x) => x.json()); return !r.clientPrincipal; }, 15000);
  await T.page.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  const reste = await T.page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('inf-mb-app:tutor:') && /Anna/.test(sessionStorage.getItem(k))));
  await T.page.click('[data-app-aktion="tutor"]');
  await T.page.waitForSelector('.tutor-anmelden', { timeout: 8000 }).catch(() => {});
  const sichtbar = /Anna/.test(await T.page.locator('[data-app-slot="panel"]').innerText());
  pruefe(reste.length === 0 && !sichtbar, 'Tutor: nach Abmelden kein Verlauf mehr im Tab (Gast sieht nichts)', { reste, sichtbar });
  const tb = [];
  T.page.on('request', (r) => { if (r.url().endsWith('/api/tutor') && r.method() === 'POST') tb.push(r.postDataJSON()); });
  await T.page.click('.tutor-anmelden');
  await anmelden(T.page, NUTZER + '-tb');
  await dialogJa(T.page);
  await T.page.click('[data-app-aktion="tutor"]');
  await T.page.fill('#tutor-frage', 'Frage von B');
  await T.page.click('.tutor-senden');
  await bis(() => tb.length > 0, 15000);
  const verlaufB = (tb[0] || {}).verlauf || [];
  pruefe(verlaufB.length === 1 && !/Anna/.test(JSON.stringify(verlaufB)), 'Tutor: nächstes Konto im selben Tab schickt keinen fremden Verlauf', verlaufB.length + ' Beiträge');
  sauber(T, 'Tutor-Verlauf nach Kontowechsel');
  await T.ctx.close();

  const G = await kontext('Gast D');
  await G.page.goto(BASIS + '/lektionen/v01-labor.html#t-1');
  await G.page.click('[data-app-aktion="tutor"]');
  pruefe(await G.page.waitForSelector('.tutor-anmelden', { timeout: 8000 }).then(() => true, () => false), 'Tutor als Gast: Hinweis mit „Mit GitHub anmelden“');
  await G.page.keyboard.press('Escape');
  sauber(G, 'Tutor Gast');
  await G.ctx.close();
}

/* ─────────────────────────────────────────────────────────── offline */
async function offline() {
  console.log('\n== Offline mit Service Worker');
  const O = await kontext('Gerät O', { sw: true });
  const p = O.page;
  const nutzer = NUTZER + '-o';
  await p.goto(BASIS + '/konto.html');
  await p.click('[data-konto-aktion="anmelden"]');
  await anmelden(p, nutzer);
  await dialogJa(p);
  await abgleichFertig(p);
  await p.evaluate(() => navigator.serviceWorker.ready.then(() => 1));
  const sw = await bis(async () => {
    const st = await p.evaluate(async () => (window.KursPwa ? await window.KursPwa.status() : null)).catch(() => null);
    return st && st.meta && st.meta.anzahl > 0 && st.meta.fehlend.length === 0 ? st.meta.anzahl : false;
  }, 120000, 500);
  pruefe(sw > 0, 'Service Worker installiert, Precache vollständig', sw + ' Dateien');
  await p.reload();
  pruefe(await p.evaluate(() => !!navigator.serviceWorker.controller), 'Seite steht unter Kontrolle des Service Workers');
  await p.waitForSelector('[data-pwa-einstellungen] button');
  await p.waitForTimeout(1500);   /* pwa.js zeichnet den Bereich nach „ready“ noch einmal */
  const knopf = p.locator('[data-pwa-einstellungen] button', { hasText: /Python offline bereit machen/ });
  pruefe(await knopf.count() === 1, '„Python offline bereit machen“ auf der Kontoseite');
  await knopf.click();
  const fertig = await p.waitForFunction(() => /Fertig|fehlgeschlagen/.test((document.querySelector('.pwa-block [aria-live="polite"][role="status"]:not(.pwa-status)') || {}).textContent || ''), null, { timeout: 300000, polling: 1000 }).then(() => true, () => false);
  const pyText = (await p.locator('.pwa-block p[role="status"]').first().textContent().catch(() => '')) || '';
  pruefe(fertig && /Fertig/.test(pyText), 'Python offline bereit', pyText.slice(0, 90) || (await p.locator('[data-pwa-einstellungen]').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  sauber(O, 'Vorbereitung');

  /* Lektion einmal online öffnen (Seite im Cache), dann offline */
  O.offline = true;
  await O.ctx.setOffline(true);
  await p.goto(BASIS + '/lektionen/v01-ablauf-und-erste-programme.html');
  pruefe(/Termin 01/.test(await p.title()), 'offline: Lerneinheit V01 lädt', await p.title());
  await p.waitForSelector('.k-runner .cm-content', { timeout: 20000 });
  await ersterKlickAusfuehren(p, p.locator('.k-runner').first(), 'offline');
  await p.goto(BASIS + '/werkbank.html');
  await p.waitForSelector('#wb-leer:not([hidden]), #wb-liste a');
  if (await p.locator('#wb-beispiel').isVisible()) await p.click('#wb-beispiel'); else await p.click('[data-wb="neu"]');
  await p.locator('#wb-runner .cm-content').first().click();
  await p.keyboard.press('Control+a'); await p.keyboard.press('Delete');
  await p.keyboard.insertText('print("offline geschrieben")\n');
  await p.keyboard.press('Control+s');
  const id = await bis(() => p.evaluate(() => (location.hash || '').slice(1)), 4000);
  const lokal = await lies(p, 'inf-mb/werkbank/prog:' + id);
  pruefe(lokal && /offline geschrieben/.test(lokal.code), 'offline: Werkbank speichert lokal', id);
  const wartet = await bis(() => p.evaluate(() => { const s = window.KursAbgleich.status(); const t = (document.querySelector('[data-app-slot="status"]') || {}).textContent || ''; return s.offen > 0 && /warte|Offline/i.test(t) ? t.trim() : false; }), 8000);
  pruefe(!!wartet, 'offline: Abgleich meldet „warten“', wartet);
  const cacheAuth = await p.evaluate(async () => {
    const treffer = [];
    for (const n of await caches.keys()) for (const r of await (await caches.open(n)).keys()) { const u = new URL(r.url); if (/^\/(\.auth|login|logout)(\/|$)/.test(u.pathname) || u.pathname.startsWith('/api/')) treffer.push(u.pathname); }
    return treffer;
  });
  pruefe(cacheAuth.length === 0, 'Kein /.auth-, /login-, /logout- oder /api-Eintrag in einem Cache', cacheAuth.join(', '));
  for (const z of ['/logout', '/login', '/.auth/me']) {
    const r = await p.evaluate(async (u) => { try { const x = await fetch(u, { redirect: 'manual' }); return 'Antwort ' + x.status + ' ' + x.type; } catch (e) { return 'Netzfehler'; } }, z);
    pruefe(r === 'Netzfehler', `offline: ${z} kommt nicht aus dem Cache`, r);
  }
  /* wieder online: wird nachgereicht */
  O.offline = false;
  await O.ctx.setOffline(false);
  await p.evaluate(() => window.dispatchEvent(new Event('online')));
  pruefe(await abgleichFertig(p, 30000), 'online: offene Änderungen werden nachgereicht');
  const server = await serverStand(O);
  pruefe(server['inf-mb/werkbank/prog:' + id] && /offline geschrieben/.test(server['inf-mb/werkbank/prog:' + id].wert.code), 'online: offline geschriebenes Programm liegt auf dem Server');
  /* Weiterleitungen mit Service Worker gehen ins Netz */
  const nav = await p.evaluate(async () => { const r = await fetch('/logout', { redirect: 'manual' }); return r.type + ' ' + r.status; });
  pruefe(/opaqueredirect/.test(nav), 'online: /logout liefert die Weiterleitung des Servers (nicht aus dem Cache)', nav);
  /* Abmelden über die Kontoseite: danach Gastzustand, auch mit Service Worker */
  await p.goto(BASIS + '/konto.html');
  await p.click('[data-konto-aktion="abmelden"]');
  const frage = await p.waitForSelector('dialog.ka-dialog[open]', { timeout: 8000 }).then(() => true, () => false);
  if (frage) await p.locator('dialog.ka-dialog[open] button').first().click();
  await p.waitForURL((u) => /konto\.html/.test(u.pathname) && !u.pathname.startsWith('/.auth'), { timeout: 20000 }).catch(() => {});
  await p.waitForLoadState('load');
  const gastText = await bis(async () => { const t = await p.locator('main').innerText(); return /Mit GitHub anmelden/.test(t) && !(await p.locator('[data-konto-aktion="abmelden"]').isVisible()) ? true : false; }, 10000);
  const me = await p.evaluate(async () => (await (await fetch('/.auth/me')).json()).clientPrincipal);
  pruefe(gastText && !me, 'Nach dem Abmelden: Kontoseite im Gastzustand, /.auth/me ohne Identität', { kontrolliert: await p.evaluate(() => !!navigator.serviceWorker.controller) });
  await p.goto(BASIS + '/index.html');
  const st = await p.evaluate(() => window.KursApp.konto.status());
  pruefe(st && !st.angemeldet, 'Nach dem Abmelden: Heute meldet nicht angemeldet');
  sauber(O, 'offline/online');
  await O.ctx.close();
}

/* ─────────────────────────────────────────────────────────── alle Seiten */
async function seitenAngemeldet() {
  /* Jede Seite als Gast lädt pruefe-seiten.mjs (114 Prüfungen); hier jede Seite einmal angemeldet */
  console.log('\n== Alle Seiten angemeldet');
  const k = await kontext('Seiten angemeldet');
  await k.page.goto(BASIS + '/konto.html');
  await k.page.click('[data-konto-aktion="anmelden"]');
  await anmelden(k.page, NUTZER + '-s');
  await abgleichFertig(k.page);
  const seiten = [];
  (function lauf(rel) {
    for (const e of fs.readdirSync(path.join(DIST, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { if (!['assets', 'app', 'pyodide', 'notebooks'].includes(e.name)) lauf(r); }
      else if (e.name.endsWith('.html') && r !== 'lektionen/v03-training.html') seiten.push(r);
    }
  })('');
  let schlecht = 0;
  for (const s of seiten.sort()) {
    const p = await k.ctx.newPage();
    try { await p.goto(BASIS + '/' + s, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(400); } catch (e) { k.probleme.push('Laden ' + s + ': ' + String(e.message).split('\n')[0]); }
    const angemeldet = await p.evaluate(() => { const a = document.querySelector('[data-app-konto]'); return a ? a.getAttribute('aria-label') || a.textContent : ''; }).catch(() => '');
    if (k.probleme.length) { schlecht++; console.log('  FEHLER  ' + s + ': ' + k.probleme.join(' | ')); k.probleme.length = 0; }
    void angemeldet;
    await p.close();
  }
  pruefe(schlecht === 0, `Alle ${seiten.length} Seiten angemeldet ohne Konsolenfehler und fehlgeschlagene Anfragen`, schlecht ? schlecht + ' mit Fehlern' : '');
  await k.ctx.close();
}

async function main() {
  const st = await fetch(BASIS + '/api/status').then((r) => r.json()).catch(() => null);
  if (!st || !st.ok) { console.error('API nicht erreichbar unter ' + BASIS + '/api/status'); process.exit(2); }
  if (!st.tutor) console.log('Hinweis: /api/status meldet tutor:false (Emulator ohne TUTOR_DOPPEL=1?)');
  browser = await chromium.launch();
  const plan = [['gast', gast], ['konto', konto], ['teilen', teilen], ['tutor', tutor], ['offline', offline], ['seiten', seitenAngemeldet]];
  try {
    for (const [id, fn] of plan) {
      if (NUR && !NUR.includes(id)) continue;
      try { await fn(); } catch (e) { pruefe(false, `Abbruch in „${id}“`, String(e && e.message || e).split('\n')[0]); }
    }
  } finally { await browser.close(); }
  console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
  process.exit(fehler.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
