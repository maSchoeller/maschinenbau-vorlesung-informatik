/* =============================================================
   pruefe-seiten.mjs – Bestandsprüfung aller veröffentlichten Seiten (npm run pruefen -- <basis-url>)
   Startet nichts selbst. Prüft mit Playwright/Chromium bei 1440×900 und 1024×768:
   keine Konsolenfehler, keine fehlgeschlagenen Anfragen, Hülle vorhanden (Leiste, Kopfzeile, #inhalt),
   kein horizontales Scrollen, in Lerneinheiten ist das Quiz initialisiert, im Labor die Aufgabenliste.
   Knobelaufgaben (freiwillig, docs/app/INHALTE.md): Stehen in einem Labor <Knobel>-Stationen, gelten die Regeln unten
   (knobelRegeln); ohne Knobelaufgaben prüft das Skript dazu nichts. kurs.json: Knobel-Stationen ohne prüfbare Teile.
   Bildschirmfotos nach app/.cache/pruefung/.
   Ausnahme (eng): Liefert GET /api/status 404 (Azure) bzw. 502 (Emulator ohne API), gilt die API als noch nicht
   vorhanden; dann ist genau dieser Status auf /api/* (samt Chromium-Konsolenmeldung) erlaubt. Alles andere bleibt Fehler.
   Fehlt eine angefragte Datei unter assets/ oder notebooks/ schon in site/, ist das ein Bestandsmangel: gemeldet, nicht gezählt.
   Aufruf: node skripte/pruefe-seiten.mjs http://localhost:4301 [--nur lektionen/v01] [--ohne-fotos]
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { DIST, CACHE, SITE } from '../src/lib/pfade.mjs';

const args = process.argv.slice(2);
const basis = (args.find((a) => /^https?:\/\//.test(a)) || process.env.PRUEF_BASIS || 'http://localhost:4301').replace(/\/+$/, '');
const nur = args.includes('--nur') ? args[args.indexOf('--nur') + 1] : null;
const ohneFotos = args.includes('--ohne-fotos');
const FOTOS = path.join(CACHE, 'pruefung');

/* Datei fehlt schon in site/ (Mangel des Bestands, kein Fehler der Hülle): nur melden, nicht scheitern */
function bestandFehlt(u) {
  const p = decodeURIComponent(new URL(u).pathname).replace(/^\/+/, '');
  if (!/^(assets|notebooks)\//.test(p)) return false;
  /* Videos, Poster und Untertitel fehlen nie „im Bestand“: Ohne Datei baut der Build nur den Platzhalter, ohne Anfrage (bausteine.mjs, Video) */
  if (/^assets\/video\//.test(p)) return false;
  return !fs.existsSync(path.join(SITE, p)) && !fs.existsSync(path.join(DIST, p));
}

const GROESSEN = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 1024, height: 768 }];

/* Alle HTML-Seiten der Ausgabe (reine Weiterleitungen gibt es seit dem Entfernen des alten Kurses nicht mehr) */
function seiten() {
  const liste = [];
  const lauf = (rel) => {
    for (const e of fs.readdirSync(path.join(DIST, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (!['assets', 'notebooks', 'app', 'pyodide', '_astro'].includes(e.name)) lauf(r); }
      else if (e.name.endsWith('.html')) liste.push(r);
    }
  };
  lauf('');
  return liste.filter((s) => !nur || s.includes(nur)).sort();
}

/* Knobelaufgaben im Labor (nur wenn es welche gibt). Läuft in der Seite, danach ist die Seite verändert (Adresse #…). */
async function knobelRegeln(page) {
  return page.evaluate(async () => {
    const r = [];
    const kn = [...document.querySelectorAll('.l-task[data-knobel]')];
    if (!kn.length) return r;
    const warte = (ms) => new Promise((x) => setTimeout(x, ms));
    const alle = [...document.querySelectorAll('.l-task')];
    const pflicht = alle.filter((s) => !s.hasAttribute('data-knobel'));
    if (kn.length > 2) r.push('Knobel: mehr als 2 Aufgaben');
    if (alle.slice(pflicht.length).some((s) => !s.hasAttribute('data-knobel'))) r.push('Knobel: nicht die letzte Gruppe');
    const gruppen = [...document.querySelectorAll('[data-lab-items] .lab__group')];
    if (!gruppen.length || gruppen[gruppen.length - 1].textContent.trim() !== 'Knobelaufgaben (freiwillig)') r.push('Knobel: letzte Gruppe der Liste heißt nicht „Knobelaufgaben (freiwillig)“');
    if (gruppen.filter((g) => /Knobel/.test(g.textContent)).length !== 1) r.push('Knobel: Gruppe der Liste fehlt oder doppelt');
    const kg = gruppen[gruppen.length - 1], kl = kg && kg.nextElementSibling;
    if (!kg || !kg.classList.contains('lab__group--knobel') || !kl || kl.tagName !== 'OL' || kl.children.length !== kn.length || kl.nextElementSibling) r.push('Knobel: die Gruppe am Ende der Liste enthält nicht genau die Knobel-Einträge');
    for (const s of kn) {
      const nr = s.id;
      if (!/^kn-[12]$/.test(nr)) r.push('Knobel: Station ' + nr + ' heißt nicht kn-1 oder kn-2');
      const a = s.querySelectorAll('[data-a][data-id]');
      if (a.length !== 1 || !/^k-[12]$/.test(a[0].getAttribute('data-id')) || !a[0].hasAttribute('data-knobel')) r.push('Knobel: ' + nr + ' braucht genau eine Aufgabe k-1/k-2 mit data-knobel');
      if (s.getAttribute('data-min') || s.getAttribute('data-stars') || s.getAttribute('data-extra')) r.push('Knobel: ' + nr + ' trägt Minuten, Sterne oder Zusatz');
      if (!/freiwillig/.test((s.querySelector('.l-task__kicker') || {}).textContent || '')) r.push('Knobel: ' + nr + ' ohne Kennzeichnung „Knobelaufgabe · freiwillig“');
      const satz = (s.querySelector('.l-task__knobel') || {}).textContent || '';
      if (!/Zugabe/.test(satz) || !/nicht zu deinem Fortschritt/.test(satz) || !/Klausur/.test(satz) || /!/.test(satz)) r.push('Knobel: ' + nr + ' ohne den festen Einleitungssatz');
      if (!document.querySelector('[data-lab-items] a[href="#' + nr + '"]')) r.push('Knobel: ' + nr + ' fehlt in der Liste');
    }
    /* Zähler: nur Pflichtaufgaben */
    const n = document.querySelectorAll('[data-a][data-id]:not([data-count="0"]):not([data-knobel])').length;
    const zaehler = (document.querySelector('[data-lab-count] [aria-hidden]') || {}).textContent;
    if (zaehler !== '0/' + n) r.push('Knobel: eingeklappter Zähler ist ' + zaehler + ', erwartet 0/' + n);
    const text = (document.querySelector('.a-progress__text') || {}).textContent;
    if (text !== '0 von ' + n + ' Aufgaben gelöst') r.push('Knobel: Fortschrittstext ist „' + text + '“, erwartet „0 von ' + n + ' Aufgaben gelöst“');
    /* Weiter: nach der letzten Pflichtstation kein Weiter in die Knobelaufgaben, sondern ein Hinweis */
    location.hash = '#' + pflicht[pflicht.length - 1].id; await warte(250);
    const next = document.getElementById('lab-next'), hint = document.getElementById('lab-knobelhint');
    if (next && next.offsetParent !== null) r.push('Knobel: „Weiter“ steht nach der letzten Pflichtstation');
    if (!hint || hint.hidden || !/Knobelaufgaben/.test(hint.textContent)) r.push('Knobel: Hinweis auf die Knobelaufgaben fehlt nach der letzten Pflichtstation');
    /* gelöst gesetzt: Liste zeigt es, Zähler und Fortschritt bleiben */
    const KS = window.KursSpeicher, ids = kn.map((s) => s.querySelector('[data-a][data-id]').getAttribute('data-id'));
    const alt = KS.sofort.lesen(KS.pfad(document.body.getAttribute('data-lesson'), 'aufg'));
    const lek = document.body.getAttribute('data-lesson');
    const neu = {}; ids.forEach((i) => { neu[i] = 1; });
    KS.sofort.schreiben(KS.pfad(lek, 'aufg'), neu);
    document.dispatchEvent(new CustomEvent('kurs:progress')); await warte(150);
    if (kn.some((s) => document.querySelector('[data-lab-items] a[href="#' + s.id + '"]').getAttribute('data-status') !== 'done')) r.push('Knobel: gelöste Knobelaufgabe wird in der Liste nicht als gelöst gezeigt');
    if ((document.querySelector('[data-lab-count] [aria-hidden]') || {}).textContent !== '0/' + n || (document.querySelector('.a-progress__text') || {}).textContent !== '0 von ' + n + ' Aufgaben gelöst') r.push('Knobel: gelöste Knobelaufgaben verändern „x von y gelöst“');
    if (alt) KS.sofort.schreiben(KS.pfad(lek, 'aufg'), alt); else KS.sofort.loeschen(KS.pfad(lek, 'aufg'));
    return r;
  });
}

/* Zeilen ordnen: Eine Zeile mit Fokus zeigt ihre Werkzeugleiste; beim Mausdruck auf „Prüfen“ verliert sie den Fokus. Die Liste darf dabei ihre Höhe
   nicht ändern, sonst trifft der erste Klick ins Leere. Echte Mausereignisse; danach ist der Stand der Seite verändert. */
async function zeilenOrdnenErsterKlick(page) {
  const fehler = [];
  const ids = await page.evaluate(() => [...document.querySelectorAll('.l-task')].filter((t) => t.querySelector('.a-p-pool')).map((t) => t.id));
  for (const id of ids) {
    try {
      await page.evaluate((id) => { location.hash = id; }, id);
      const root = page.locator('#' + id);
      await root.locator('.a-p-pool .a-p-item').first().waitFor({ state: 'visible', timeout: 5000 });
      for (let i = 0; i < 2; i++) await root.locator('.a-p-pool .a-p-item').first().click();
      const zeile = () => root.locator('.a-p-ans .a-p-item').nth(1);
      await zeile().focus();
      await zeile().locator('[aria-label="Weiter einrücken"]').click();
      await zeile().focus();
      const hoehe = () => root.locator('.a-p-ans').evaluate((e) => Math.round(e.getBoundingClientRect().height));
      const vorher = await hoehe();
      const knopf = root.getByRole('button', { name: 'Prüfen' });
      await knopf.scrollIntoViewIfNeeded();
      await knopf.hover();
      await page.mouse.down();
      const waehrend = await hoehe();
      await page.mouse.up();
      await page.waitForTimeout(200);
      const rueckmeldung = (await root.locator('.a-p-fb').innerText()).trim();
      if (vorher !== waehrend) fehler.push('Zeilen ordnen „' + id + '“: Die Liste ändert beim Fokuswechsel ihre Höhe (' + vorher + ' → ' + waehrend + ' px)');
      if (!rueckmeldung) fehler.push('Zeilen ordnen „' + id + '“: Der erste Klick auf „Prüfen“ liefert keine Rückmeldung');
    } catch (e) {
      fehler.push('Zeilen ordnen „' + id + '“: ' + String(e.message || e).split('\n')[0]);
    }
  }
  return fehler;
}

/* Vorhersage ohne Code (nur ein Plan zum Lesen, kein Runner im Kasten): Der Klick löst auf, markiert die Antwort und der Stand
   überlebt das Neuladen. Lief früher ins Leere (kurs.js verband eine Vorhersage nur mit einem Runner). Danach ist der Stand der Seite verändert. */
async function vorhersageOhneRunner(page) {
  const fehler = [];
  const n = await page.evaluate(() => [...document.querySelectorAll('.k-predict')].filter((x) => !x.closest('.k-try') || !x.closest('.k-try').querySelector('.k-runner')).length);
  for (let i = 0; i < n; i++) {
    const gewaehlt = await page.evaluate(async (i) => {
      const x = [...document.querySelectorAll('.k-predict')].filter((y) => !y.closest('.k-try') || !y.closest('.k-try').querySelector('.k-runner'))[i];
      x.scrollIntoView();
      const falsch = [...x.querySelectorAll('.k-predict__opts button')].find((b) => !b.hasAttribute('data-correct'));
      falsch.click();
      const res = x.querySelector('.k-predict__result').textContent;
      return { t: falsch.textContent, pressed: falsch.getAttribute('aria-pressed'), res: res.slice(0, 40) + '…', erkl: res.length > 80, stimmtNicht: /stimmt nicht/.test(res) };
    }, i);
    if (gewaehlt.pressed !== 'true') fehler.push(`Vorhersage ${i + 1} ohne Code: Klick markiert die Antwort nicht`);
    if (!gewaehlt.stimmtNicht || !gewaehlt.erkl) fehler.push(`Vorhersage ${i + 1} ohne Code: keine Auflösung nach dem Klick („${gewaehlt.res}“)`);
    await page.waitForTimeout(900);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(600);
    const danach = await page.evaluate((i) => {
      const x = [...document.querySelectorAll('.k-predict')].filter((y) => !y.closest('.k-try') || !y.closest('.k-try').querySelector('.k-runner'))[i];
      const b = x.querySelector('button[aria-pressed="true"]');
      return { t: b && b.textContent, res: x.querySelector('.k-predict__result').textContent.length };
    }, i);
    if (danach.t !== gewaehlt.t || !danach.res) fehler.push(`Vorhersage ${i + 1} ohne Code: der Stand kommt nach dem Neuladen nicht zurück`);
  }
  return fehler;
}

/* kurs.json: Knobel-Stationen ohne prüfbare Teile, ohne Zeiten; ihre Kennungen stehen in keiner prüfbaren Liste */
async function knobelKurs() {
  const kurs = await fetch(basis + '/app/daten/kurs.json').then((r) => r.json());
  const r = [];
  let anzahl = 0;
  for (const l of kurs.lektionen || []) {
    const kn = (l.aufgaben || []).filter((a) => a.teil === 'K' || a.knobel);
    anzahl += kn.length;
    const pruefbar = new Set((l.aufgaben || []).flatMap((a) => a.pruefbar));
    for (const a of kn) {
      if (a.teil !== 'K' || !Array.isArray(a.knobel) || !a.knobel.length) r.push(`${l.nr} ${a.id}: Knobel-Station ohne Teil K oder ohne knobel-Kennungen`);
      if (a.pruefbar.length) r.push(`${l.nr} ${a.id}: Knobel-Station hat prüfbare Teile`);
      if (a.minuten !== null || a.sterne !== null) r.push(`${l.nr} ${a.id}: Knobel-Station mit Minuten oder Sternen`);
      for (const i of a.knobel || []) if (pruefbar.has(i)) r.push(`${l.nr}: ${i} steht auch in einer prüfbaren Liste`);
    }
  }
  return { r, anzahl };
}

async function main() {
  if (!fs.existsSync(DIST)) throw new Error('app/dist fehlt: erst npm run build');
  /* API fehlt: Azure liefert dann 404, der SWA-Emulator ohne --api-location 502 */
  let apiFehlt = 0;
  try { const r = await fetch(basis + '/api/status'); if (r.status === 404 || r.status === 502) apiFehlt = r.status; } catch (e) { throw new Error(`${basis} ist nicht erreichbar. Läuft der Emulator?`); }
  if (apiFehlt) console.log(`Hinweis: /api/status liefert ${apiFehlt}, die API fehlt noch. ${apiFehlt} auf /api/* wird toleriert.`);
  if (!ohneFotos) fs.mkdirSync(FOTOS, { recursive: true });

  const browser = await chromium.launch();
  const liste = seiten();
  const fehler = [];
  const kk = await knobelKurs();
  if (kk.r.length) { fehler.push({ seite: 'app/daten/kurs.json', groesse: '-', eigene: kk.r }); console.log(`FEHLER kurs.json (Knobelaufgaben)\n  - ${kk.r.join('\n  - ')}`); }
  else console.log(`ok     kurs.json: ${kk.anzahl ? kk.anzahl + ' Knobel-Stationen ohne prüfbare Teile' : 'keine Knobelaufgaben'}`);
  const bestandsmaengel = new Set();
  let geprueft = 0;
  for (const g of GROESSEN) {
    const ctx = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE' });
    for (const s of liste) {
      const page = await ctx.newPage();
      const eigene = [];
      const apiErlaubt = (u, status) => !!apiFehlt && status === apiFehlt && new URL(u).pathname.startsWith('/api/');
      page.on('console', (m) => {
        if (m.type() !== 'error') return;
        const loc = m.location() && m.location().url;
        const st = /^Failed to load resource: the server responded with a status of (\d+)/.exec(m.text());
        if (st && loc && ((st[1] === '404' && bestandFehlt(new URL(loc, basis).href)) || apiErlaubt(new URL(loc, basis).href, +st[1]))) return;
        eigene.push('Konsole: ' + m.text().slice(0, 200) + (loc ? ` (${loc})` : ''));
      });
      page.on('pageerror', (e) => eigene.push('Skriptfehler: ' + String(e.message || e).slice(0, 200)));
      page.on('requestfailed', (r) => {
        const f = r.failure() ? r.failure().errorText : '';
        /* Video- und Untertitel-Vorladen bricht der Browser selbst ab; fehlende Bestandsdateien zählen dort mit */
        if (f === 'net::ERR_ABORTED' && (['media', 'texttrack'].includes(r.resourceType()) || bestandFehlt(r.url()))) return;
        eigene.push(`Anfrage fehlgeschlagen: ${r.url()} ${f}`);
      });
      page.on('response', (r) => {
        if (r.status() === 404 && bestandFehlt(r.url())) { bestandsmaengel.add(`${new URL(r.url()).pathname} (verlangt von ${s})`); return; }
        if (r.status() >= 400 && !apiErlaubt(r.url(), r.status())) eigene.push(`HTTP ${r.status()}: ${r.url()}`);
      });
      try {
        await page.goto(`${basis}/${s}`, { waitUntil: 'load', timeout: 45000 });
        await page.waitForTimeout(600);
        /* Explorables brauchen ihr Skript (explorables-vXX.js); bis zu 5 s warten, bis alle etwas zeigen */
        await page.waitForFunction(() => [...document.querySelectorAll('[data-explorable]')].every((x) => x.childElementCount > 0), null, { timeout: 5000 }).catch(() => {});
        const befund = await page.evaluate((tablet) => {
          const r = [];
          /* Tablet: Bedienelemente der Hülle mindestens 44 × 44 px */
          if (tablet) {
            /* Alle bedienbaren Elemente der Seite (Knöpfe, Felder, Auswahl, anklickbare Zeilen); Radios und Kästchen zählen mit ihrer Beschriftung.
               Ausgenommen: Begriffe im Fließtext (abbr.k-begriff) und der Editor selbst. */
            const bedien = [...document.querySelectorAll('button, input:not([type=hidden]), select, textarea, summary, .k-line')]
              .filter((x) => x.offsetParent !== null && !x.closest('.cm-editor, .app-rail, .app-bar') && !x.classList.contains('k-sr'))
              .map((x) => { const t = x.matches('input[type=radio], input[type=checkbox]') ? (x.closest('label') || x) : x; return [x, t, t.getBoundingClientRect()]; })
              .filter(([, , b]) => b.width > 0 && b.height > 0 && b.height < 43.5)
              .map(([x, , b]) => `${x.tagName.toLowerCase()}.${String(x.className).split(' ')[0]} ${Math.round(b.width)}×${Math.round(b.height)}`);
            if (bedien.length) r.push('Bedienelemente unter 44 px Höhe: ' + [...new Set(bedien)].slice(0, 6).join(', '));
            const klein = [...document.querySelectorAll('.app-ansicht a, .app-lektion__pfeil, .app-bar__suche, .app-bar__link, .app-waehler__knopf, .app-panel__zu, .app-panel__griff, .lab__fold, .gl-buchstaben a, .k-btn--small')]
              .filter((x) => x.offsetParent !== null).map((x) => [x, x.getBoundingClientRect()]).filter(([, b]) => b.width < 43.5 || b.height < 43.5)
              .map(([x, b]) => `${x.className || x.tagName} ${Math.round(b.width)}×${Math.round(b.height)}`);
            if (klein.length) r.push('Ziele unter 44 px: ' + [...new Set(klein)].slice(0, 4).join(', '));
          }
          const q = (x) => document.querySelector(x);
          if (!q('body.app')) r.push('body.app fehlt');
          if (!q('nav.app-rail [data-app-ziel="heute"]')) r.push('Leiste fehlt');
          if (!q('header.app-bar [data-app-slot="kontext"]')) r.push('Kopfzeile fehlt');
          if (!q('.app-inhalt #inhalt')) r.push('#inhalt fehlt in .app-inhalt');
          if (document.querySelectorAll('header.dhbw-header, footer.dhbw-footer').length) r.push('Bestands-Kopf/Fuß noch vorhanden');
          if (!window.KursApp) r.push('KursApp fehlt');
          const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
          if (sw > cw + 1) r.push(`horizontales Scrollen (${sw} > ${cw})`);
          const art = document.body.getAttribute('data-page');
          if (art === 'lerneinheit') {
            const quiz = document.querySelectorAll('.k-quiz, [data-quiz]').length;
            const opts = document.querySelectorAll('.k-q__opt').length;
            if (quiz && document.querySelector('.k-q__options') && !opts) r.push('Quiz nicht initialisiert (keine .k-q__opt)');
          }
          if (art === 'labor' && !document.querySelectorAll('[data-lab-items] a, [data-lab-items] .lab__item').length) r.push('Aufgabenliste des Labors leer');
          /* Explorables: jedes zeigt nach dem Laden etwas (fehlt explorables-vXX.js, bleiben sie leer) */
          const leer = [...document.querySelectorAll('[data-explorable]')].filter((x) => x.childElementCount === 0).map((x) => x.getAttribute('data-explorable'));
          if (leer.length) r.push('Explorables nicht initialisiert: ' + leer.join(', '));
          /* Begriffe (abbr.k-begriff, begriff.js): erweitert und Klick öffnet die Erklärung */
          const begriffe = [...document.querySelectorAll('abbr.k-begriff[data-erklaerung]')];
          if (begriffe.length) {
            const b = begriffe[0];
            if (b.getAttribute('role') !== 'button' || !b.getAttribute('aria-describedby')) r.push(`Begriffe nicht erweitert (${begriffe.length} abbr.k-begriff ohne begriff.js)`);
            else {
              b.click();
              const offen = b.getAttribute('aria-expanded') === 'true';
              b.click();
              if (!offen) r.push('Klick auf einen Begriff öffnet keine Erklärung');
            }
          }
          /* Labor: „Nächster Schritt“ der Hülle (nächste Lektion) erst auf der letzten Station */
          const weiter = document.querySelector('.app-weiter');
          const stationen = document.querySelectorAll('.l-task');
          if (art === 'labor' && weiter && stationen.length > 1 && stationen[stationen.length - 1].hidden && getComputedStyle(weiter).display !== 'none') r.push('Labor: „Nächster Schritt“ steht schon vor der letzten Station');
          if (!document.querySelector('h1')) r.push('keine h1');
          /* Schrift: Fira Code ohne Ligaturen. Sonst zeigt >= ein ≥ und == einen Doppelstrich, Zeichen, die man so nicht tippen kann. */
          const lig = [...document.querySelectorAll('body *')].filter((x) => {
            if (x.offsetParent === null || !/Fira Code/.test(getComputedStyle(x).fontFamily)) return false;
            if (![...x.childNodes].some((n) => n.nodeType === 3 && n.data.trim()) && x.tagName !== 'TEXTAREA' && x.tagName !== 'INPUT') return false;
            const cs = getComputedStyle(x);
            return cs.fontVariantLigatures !== 'none' || !/"liga" 0/.test(cs.fontFeatureSettings);
          }).map((x) => `${x.tagName.toLowerCase()}.${String(x.className).split(' ')[0]}`);
          if (lig.length) r.push('Code mit Schrift-Ligaturen (≥ statt >=): ' + [...new Set(lig)].slice(0, 4).join(', '));
          /* Videos: entweder Spieler mit Datei oder sichtbarer Platzhalter, nie ein Spieler ohne Datei */
          for (const f of document.querySelectorAll('figure.k-video')) {
            const v = f.querySelector('video'), m = f.querySelector('.k-video__missing');
            if (!v && (!m || m.hidden)) r.push('Video ohne Spieler und ohne sichtbaren Platzhalter: ' + (f.getAttribute('data-video') || f.id));
          }
          /* Pläne und Tabellen im Ablauf-Block sind kein Python: Überschrift „Plan“ bzw. „Tabelle“, kein Kopieren-Knopf */
          for (const o of document.querySelectorAll('.a-trace__code[data-sprache]')) {
            const bar = o.closest('.k-copy'), spr = o.getAttribute('data-sprache');
            const soll = spr === 'plan' ? 'Plan' : 'Tabelle';
            if (bar && (!bar.querySelector('.k-copy__lang') || bar.querySelector('.k-copy__lang').textContent !== soll || bar.querySelector('.k-copy__btn'))) r.push('Ablauf-Block „' + spr + '“ hat falsche Überschrift oder einen Kopieren-Knopf');
          }
          /* Wahrheitstabelle als Ablauf-Aufgabe: Spalten A, B statt Schritt und Zeile, nichts zum seitlichen Scrollen (auch das nicht im .a-trace__tw, das die Abschneide-Prüfung oben ausnimmt) */
          for (const o of document.querySelectorAll('.a-trace--tabelle')) {
            const id = (o.closest('[data-id]') || o).getAttribute('data-id');
            const koepfe = [...o.querySelectorAll('thead th')].map((t) => t.textContent.trim());
            if (koepfe.includes('Schritt') || koepfe.includes('Zeile')) r.push('Tabelle „' + id + '“: Kopf zeigt Schritt/Zeile statt der Spalten der Wahrheitstabelle (' + koepfe.join(' | ') + ')');
            const tw = o.querySelector('.a-trace__tw');
            if (tw && tw.scrollWidth > tw.clientWidth + 1) r.push('Tabelle „' + id + '“ muss seitlich gescrollt werden (' + tw.scrollWidth + ' > ' + tw.clientWidth + ')');
            const ol = o.querySelector('.a-trace__code'), b = ol && ol.getBoundingClientRect(), tb = tw && tw.getBoundingClientRect();
            if (b && tb && b.bottom > tb.top + 1) r.push('Tabelle „' + id + '“: Zeilenliste und Tabelle stehen nicht untereinander');
          }
          /* Der feste Satz „Typen beachten: Text steht in Anführungszeichen.“ passt nur, wo Text vorkommt (ein Wert mit Anführungszeichen) */
          for (const t of document.querySelectorAll('.a-task[data-a="trace"]')) {
            const sc = t.querySelector('script[type="application/json"]'), msg = t.querySelector('.a-trace__msg');
            if (!sc || !msg || !/Typen beachten/.test(msg.textContent) || document.body.getAttribute('data-lesson') === 'V01') continue;   // Termin 01 behält den festen Satz (pruefe-stand.mjs prüft ihn)
            const d = JSON.parse(sc.textContent);
            const text = (d.steps || []).some((st) => Object.values(st.set || {}).concat([st.out]).some((v) => /["']/.test(String(v || ''))));
            if (!text || d.sprache) r.push('Ablauf „' + t.getAttribute('data-id') + '“: der Satz „Typen beachten: Text steht in Anführungszeichen“ passt nicht (kein Text in den Werten)');
          }
          return r;
        }, g.name === 'tablet');
        eigene.push(...befund);
        if (!ohneFotos) await page.screenshot({ path: path.join(FOTOS, `${s.replace(/\//g, '_').replace(/\.html$/, '')}-${g.name}.png`) });
        const seitenart = await page.evaluate(() => document.body.getAttribute('data-page') || '');
        if (/\blabor\b/.test(seitenart)) eigene.push(...(await knobelRegeln(page)));
        if (/\blabor\b/.test(seitenart)) eigene.push(...(await zeilenOrdnenErsterKlick(page)));
        if (seitenart === 'lerneinheit') eigene.push(...(await vorhersageOhneRunner(page)));
      } catch (e) {
        eigene.push('Laden: ' + String(e.message || e).split('\n')[0]);
      }
      await page.close();
      geprueft++;
      if (eigene.length) { fehler.push({ seite: s, groesse: g.name, eigene }); console.log(`FEHLER ${g.name} ${s}\n  - ${eigene.join('\n  - ')}`); }
      else console.log(`ok     ${g.name} ${s}`);
    }
    await ctx.close();
  }
  await browser.close();
  if (bestandsmaengel.size) {
    const liste = [...bestandsmaengel].sort();
    fs.mkdirSync(FOTOS, { recursive: true });
    fs.writeFileSync(path.join(FOTOS, 'bestandsmaengel.txt'), liste.join('\n') + '\n');
    console.log(`\nBestandsmängel: ${liste.length} Dateien fehlen schon in site/ (nicht als Fehler gezählt), z. B.\n  - ${liste.slice(0, 3).join('\n  - ')}\n  Liste: ${path.join(FOTOS, 'bestandsmaengel.txt')}`);
  }
  console.log(`\n${geprueft} Prüfungen (${liste.length} Seiten × ${GROESSEN.length} Größen), ${fehler.length} mit Fehlern.${ohneFotos ? '' : ' Fotos: ' + FOTOS}`);
  process.exitCode = fehler.length ? 1 : 0;
}

main().catch((e) => { console.error(e.message || e); process.exitCode = 2; });
