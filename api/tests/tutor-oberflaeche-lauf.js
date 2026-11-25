'use strict';
/* tutor-oberflaeche-lauf.js – wiederholbare Prüfung des Tutor-Panels im Browser (Rolle Tutor)
 *
 * Playwright/Chromium bei 1440×900 und 1024×768 gegen einen eigenen kleinen Dateiserver über der
 * gebauten App. Die API wird im Browser nachgebildet (page.route), damit Fehlerfälle gezielt
 * auslösbar sind; den Server-Ablauf prüfen tutor.test.js und tutor-pruefer.test.js.
 *
 * Aufruf (aus api/):  node tests/tutor-oberflaeche-lauf.js [ausgabeordner=../app/dist-tutor] [port=4323]
 * Vorher die App bauen:  cd app && KURS_AUSGABE=dist-tutor npm run build
 * Optional --fotos <ordner>: Bildschirmfotos der Zustände ablegen.
 *
 * Fängt unter anderem (Befunde der Abnahme, Korrekturrunde 1):
 *   - Fehlermeldung und „Nochmal versuchen“ bei langem Verlauf sichtbar und nicht vom Formular verdeckt
 *   - 429: Frage zurück im Feld, Senden aus, „Heute noch 0 Fragen“ auch auf einer anderen Seite
 *   - Lerneinheit schickt die data-id der zuletzt bearbeiteten Aufgabe mit
 *   - Hinweiskasten neutral (keine rote Kante, kein Rot-Ton)
 *   - Enter sendet, Fokus im Feld, Kontextzeile nennt, was mitgeht
 *   - Panelbreite: Zieh-Griff (Maus, Tastatur, Doppelklick), Grenzen 320 px bis ganze Breite, Merken, kein Quer-Scrollen
 *   - Labor: Aufgabenleiste ein- und ausklappen (Zustand, Tab, Breite der Aufgabe)
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createRequire } = require('node:module');

const WURZEL = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const fotoIdx = args.indexOf('--fotos');
const FOTOS = fotoIdx >= 0 ? path.resolve(args.splice(fotoIdx, 2)[1]) : null;
// Erstes Argument: Ausgabeordner (eigener Dateiserver) oder Basis-URL eines laufenden Servers (z. B. Emulator)
const URL_ARG = /^https?:\/\//.test(args[0] || '') ? args[0].replace(/\/+$/, '') + '/' : null;
const ORDNER = path.resolve(__dirname, '..', URL_ARG ? '../app/dist' : (args[0] || '../app/dist-tutor'));
const PORT = Number(args[1] || 4323);

function ladePlaywright() {
  for (const basis of [path.join(WURZEL, 'app', 'package.json'), path.join(WURZEL, '.werkzeuge', 'package.json'), __filename]) {
    try { return createRequire(basis)('playwright'); } catch (e) { /* nächster Ort */ }
  }
  console.error('Playwright nicht gefunden (app/node_modules oder .werkzeuge/node_modules).');
  process.exit(2);
}

if (!URL_ARG && !fs.existsSync(path.join(ORDNER, 'index.html'))) {
  console.error(`Kein Build in ${ORDNER}. Zuerst: cd app && KURS_AUSGABE=dist-tutor npm run build`);
  process.exit(2);
}

const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.mjs': 'text/javascript', '.zip': 'application/zip', '.whl': 'application/zip' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const f = path.join(ORDNER, p);
  if (!f.startsWith(ORDNER) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYP[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const fehler = [];
const ok = [];
function pruefe(bed, text) { (bed ? ok : fehler).push(text); }

/** Nachgebildete API: Antworten je nach Frage; zeichnet gesendete Bodies auf. */
function apiNachbilden(page, gesendet, stand) {
  return page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (status, daten) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(daten) });
    if (url.pathname.endsWith('/api/ich')) return json(200, { angemeldet: true, anzeigename: 'Test', benutzerId: 'u-test' });
    if (url.pathname.endsWith('/api/tutor')) {
      const body = JSON.parse(route.request().postData() || '{}');
      gesendet.push(body);
      const frage = body.verlauf[body.verlauf.length - 1].text;
      if (/testfall:fehler/.test(frage)) return json(502, { fehler: 'modell-fehler', meldung: 'Der Tutor ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal.' });
      if (/testfall:kontingent/.test(frage)) return json(429, { fehler: 'tageslimit', meldung: 'Für heute hast du alle Fragen verbraucht. Morgen geht es weiter.', rest: { heute: 0 } });
      stand.rest -= 1;
      return json(200, { antwort: 'Gute Frage. Ein Beispiel an einem anderen Problem:\n\n```python\nlaenge = 120\nprint(laenge)\n```\n\nWas soll dein Programm am Ende ausgeben? Und welche Werte liest es dafür ein? Schreib mir, was du schon hast.', rest: { heute: stand.rest } });
    }
    return route.fulfill({ status: 404, body: '' });
  });
}

async function panelOeffnen(page) {
  await page.waitForFunction(() => window.KursApp && document.readyState === 'complete');
  await page.locator('[data-app-aktion="tutor"]').first().click();
  await page.locator('#tutor-frage').waitFor({ state: 'visible' });
}
async function fragen(page, text) {
  await page.locator('#tutor-frage').fill(text);
  await page.locator('#tutor-frage').press('Enter');
  await page.waitForFunction(() => !document.querySelector('.tutor[aria-busy]'));
}

/** Liegt das Element sichtbar im Panel und ist es nicht verdeckt? */
async function sichtbarImPanel(page, selektor) {
  return page.evaluate((sel) => {
    const e = document.querySelector(sel);
    if (!e) return 'fehlt';
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) return 'ohne Größe';
    const panel = e.closest('.app-panel') || document.body;
    const scroller = window.KursApp.panel.element() || panel;
    const p = scroller.getBoundingClientRect();
    if (r.top < p.top - 1 || r.bottom > p.bottom + 1) return `außerhalb (${Math.round(r.top)}–${Math.round(r.bottom)} statt ${Math.round(p.top)}–${Math.round(p.bottom)})`;
    const x = r.left + Math.min(r.width / 2, 20), y = r.top + r.height / 2;
    const oben = document.elementFromPoint(x, y);
    if (!oben || !(oben === e || e.contains(oben))) return 'verdeckt von ' + (oben ? oben.className || oben.tagName : 'nichts');
    return 'ok';
  }, selektor);
}

async function foto(page, name) {
  if (!FOTOS) return;
  fs.mkdirSync(FOTOS, { recursive: true });
  await page.screenshot({ path: path.join(FOTOS, name + '.png') });
}

/** Panelbreite (Zieh-Griff, Tastatur, Merken, Grenzen) und einklappbare Aufgabenleiste im Labor */
async function breiteUndLeiste(page, g, basis, breite) {
  const SCHL = 'inf-mb-app:panelbreite', LISTE = 'inf-mb-app:aufgabenleiste';
  const tablet = breite < 1100;
  const hoehe = breite === 1440 ? 900 : 768;
  const maxFuer = (b) => b - 76 - (b >= 1100 ? 520 : 0);   /* ab 1100 px bleibt dem Inhalt mindestens 520 px */
  const max = maxFuer(breite);
  const pw = () => page.evaluate(() => Math.round(document.querySelector('.app-panel').getBoundingClientRect().width));
  const quer = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const wert = () => page.evaluate((k) => localStorage.getItem(k), SCHL);
  async function frisch(url, vorbereitung) {
    await page.goto(basis + url);
    await page.evaluate(([a, b, v]) => { localStorage.removeItem(a); localStorage.removeItem(b); if (v) localStorage.setItem(v[0], v[1]); }, [SCHL, LISTE, vorbereitung || null]);
    await page.reload();
  }
  const griff = page.locator('[data-app-slot="panel-griff"]');
  async function ziehen(vonX, nachX) {
    const b = await griff.boundingBox();
    const y = b.y + b.height / 2;
    await page.mouse.move(vonX, y);
    await page.mouse.down();
    await page.mouse.move((vonX + nachX) / 2, y, { steps: 3 });
    await page.mouse.move(nachX, y, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(80);
  }

  // ---- Griff: Aufbau und Standardbreite
  await frisch('lektionen/v01-labor.html#a-eigene');
  await panelOeffnen(page);
  const rolle = await griff.evaluate((e) => ({ r: e.getAttribute('role'), o: e.getAttribute('aria-orientation'), l: e.getAttribute('aria-label'), n: e.getAttribute('aria-valuenow'), lo: e.getAttribute('aria-valuemin'), hi: e.getAttribute('aria-valuemax'), t: e.tabIndex }));
  pruefe(rolle.r === 'separator' && rolle.o === 'vertical' && rolle.l && rolle.t === 0, `${g} Griff: separator, senkrecht, beschriftet, per Tab erreichbar`);
  pruefe(rolle.n === '380' && rolle.lo === '320' && Number(rolle.hi) === max, `${g} Griff: aria-valuenow ${rolle.n}, min ${rolle.lo}, max ${rolle.hi} (erwartet 380/320/${max})`);
  pruefe(await pw() === 380, `${g} Panel ist zunächst 380 px breit (${await pw()})`);
  const gb = await griff.boundingBox();
  if (tablet) pruefe(gb.width >= 43.5 && gb.height >= 43.5, `${g} Griff mindestens 44 px (${Math.round(gb.width)}×${Math.round(gb.height)})`);

  // ---- Ziehen mit der Maus
  const p0 = await page.locator('.app-panel').boundingBox();
  await ziehen(p0.x, p0.x - 200);
  const w1 = await pw();
  pruefe(Math.abs(w1 - 580) <= 3, `${g} Ziehen nach links macht das Panel breiter (${w1}, erwartet 580)`);
  pruefe(await wert() === String(w1), `${g} gezogene Breite wird gemerkt (${await wert()})`);
  pruefe(await page.evaluate(() => document.body.classList.contains('app--ziehen')) === false, `${g} nach dem Ziehen ist der Ziehzustand beendet`);
  pruefe(await page.evaluate(() => String(getSelection())) === '', `${g} beim Ziehen wird kein Text markiert`);
  pruefe(await quer() <= 1, `${g} 580 px: kein Quer-Scrollen (${await quer()})`);
  // Grenzen
  const p1 = await page.locator('.app-panel').boundingBox();
  await ziehen(p1.x, 3);
  pruefe(await pw() === max, `${g} Ziehen bis zum Rand: größte Breite ${max} (${await pw()})`);
  const p2 = await page.locator('.app-panel').boundingBox();
  await ziehen(p2.x, breite - 3);
  pruefe(await pw() === 320, `${g} Ziehen nach rechts: Mindestbreite 320 (${await pw()})`);

  // ---- Tastatur
  await griff.focus();
  await page.keyboard.press('ArrowLeft');
  pruefe(await pw() === 344, `${g} Pfeil links: +24 px (${await pw()})`);
  await page.keyboard.press('Shift+ArrowLeft');
  pruefe(await pw() === 440, `${g} Umschalt+Pfeil links: +96 px (${await pw()})`);
  await page.keyboard.press('ArrowRight');
  pruefe(await pw() === 416 && await griff.getAttribute('aria-valuenow') === '416', `${g} Pfeil rechts: -24 px, aria-valuenow folgt (${await pw()})`);
  await page.keyboard.press('End');
  pruefe(await pw() === max, `${g} Ende: größte Breite (${await pw()})`);
  await page.keyboard.press('ArrowLeft');
  pruefe(await pw() === max, `${g} Pfeil links an der Obergrenze bleibt bei ${max} (${await pw()})`);
  await page.keyboard.press('Home');
  pruefe(await pw() === 320, `${g} Pos1: Mindestbreite (${await pw()})`);
  await page.keyboard.press('ArrowRight');
  pruefe(await pw() === 320, `${g} Pfeil rechts an der Untergrenze bleibt bei 320 (${await pw()})`);
  pruefe(await quer() <= 1, `${g} 320 px: kein Quer-Scrollen (${await quer()})`);

  // ---- Merken nach dem Neuladen, Doppelklick
  await page.keyboard.press('Shift+ArrowLeft'); await page.keyboard.press('Shift+ArrowLeft');
  const gemerkt = await pw();
  await page.reload();
  await panelOeffnen(page);
  pruefe(await pw() === gemerkt && gemerkt === 512, `${g} Breite bleibt nach dem Neuladen (${await pw()}, erwartet 512)`);
  await griff.dblclick();
  pruefe(await pw() === 380 && await griff.getAttribute('aria-valuenow') === '380', `${g} Doppelklick stellt 380 px wieder her (${await pw()})`);
  pruefe(await wert() === null, `${g} Standardbreite braucht keinen gemerkten Wert`);
  // Fenster wird kleiner: gemerkte Breite wird begrenzt
  await griff.focus();
  await page.keyboard.press('End');
  await page.setViewportSize({ width: breite - 200, height: 700 });
  await page.waitForTimeout(150);
  pruefe(await pw() === maxFuer(breite - 200) && await quer() <= 1, `${g} kleineres Fenster begrenzt die Breite (${await pw()}, Quer ${await quer()})`);
  await page.setViewportSize({ width: breite, height: hoehe });
  await page.waitForTimeout(150);

  // ---- Kein Quer-Scrollen: Labor, Lerneinheit, Werkbank mit schmaler, mittlerer und größter Breite
  for (const [name, url] of [['Labor', 'lektionen/v01-labor.html'], ['Lerneinheit', 'lektionen/v01-ablauf-und-erste-programme.html'], ['Werkbank', 'werkbank.html']]) {
    for (const b of [320, 700, 99999]) {
      await frisch(url, [SCHL, String(b)]);
      await panelOeffnen(page);
      await page.waitForTimeout(150);
      const q = await quer();
      pruefe(q <= 1, `${g} ${name} mit Panel ${await pw()} px: kein Quer-Scrollen (${q})`);
      if (name === 'Labor' && b === 99999) await foto(page, `panel-breit-${breite}`);
    }
  }
  // ---- Nichts abgeschnitten: sichtbare Bedienelemente liegen rechts innerhalb von .app-inhalt (Lerneinheit, Abschnitt Eingabe)
  for (const b of [700, 99999]) {
    await frisch('lektionen/v01-ablauf-und-erste-programme.html#eingabe', [SCHL, String(b)]);
    await panelOeffnen(page);
    await page.waitForTimeout(300);
    const ab = await page.evaluate(() => {
      const inh = document.querySelector('.app-inhalt').getBoundingClientRect();
      const bad = [...document.querySelectorAll('.app-inhalt button, .app-inhalt select, .app-inhalt textarea, .app-inhalt .cm-editor')]
        .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0)
        .filter((e) => e.getBoundingClientRect().right > inh.right + 1)
        .map((e) => (e.textContent || e.className || e.tagName).trim().slice(0, 24));
      return { bad: [...new Set(bad)].slice(0, 5), breite: Math.round(inh.width) };
    });
    pruefe(ab.bad.length === 0 && (tablet || ab.breite >= 500), `${g} Panel ${b}: Inhalt ${ab.breite} px, nichts abgeschnitten (${ab.bad.join(', ') || 'ok'})`);
  }
  await page.evaluate((k) => localStorage.removeItem(k), SCHL);

  // ---- Aufgabenleiste einklappen (Labor)
  await frisch('lektionen/v01-labor.html');
  const knopf = page.locator('[data-lab-fold]');
  const liste = page.locator('.lab__list');
  const listeBreit = async () => Math.round((await liste.boundingBox()).width);
  const hauptBreite = () => page.evaluate(() => Math.round(document.querySelector('.lab__main').getBoundingClientRect().width));
  const bedienbar = () => page.evaluate(() => [...document.querySelectorAll('.lab__list a, .lab__list button, .lab__list select')].filter((e) => e.offsetParent !== null).length);
  pruefe(await knopf.getAttribute('aria-expanded') === 'true' && /einklappen/.test(await knopf.getAttribute('aria-label')), `${g} Leiste ist zunächst ausgeklappt, Knopf „Aufgabenliste einklappen“`);
  const kb = await knopf.boundingBox();
  pruefe(kb.width >= 43.5 && kb.height >= 43.5, `${g} Einklapp-Knopf mindestens 44 px (${Math.round(kb.width)}×${Math.round(kb.height)})`);
  const offen = await hauptBreite(), listeOffen = await listeBreit(), vorherPunkte = await bedienbar();
  await knopf.click();
  pruefe(await knopf.getAttribute('aria-expanded') === 'false' && /ausklappen/.test(await knopf.getAttribute('aria-label')), `${g} eingeklappt: aria-expanded=false, Beschriftung „ausklappen“`);
  const zuBreit = await listeBreit();
  pruefe(zuBreit <= 56 && zuBreit >= 48, `${g} eingeklappte Leiste ist ein schmaler Streifen (${zuBreit} px, vorher ${listeOffen})`);
  pruefe(await hauptBreite() > offen + 100, `${g} die Aufgabe wird breiter (${offen} -> ${await hauptBreite()} px)`);
  pruefe(await bedienbar() === 1 && vorherPunkte > 5, `${g} eingeklappt ist nur der Knopf bedienbar (${await bedienbar()} statt ${vorherPunkte})`);
  const zaehler = (await page.locator('[data-lab-count] > span').first().textContent()).trim();
  pruefe(/^\d+\/\d+$/.test(zaehler) && await page.locator('[data-lab-count]').isVisible(), `${g} eingeklappt: kompakte Fortschrittsangabe „${zaehler}“ sichtbar`);
  pruefe(/^\d+ von \d+ Aufgaben gelöst$/.test(await page.locator('[data-lab-count] .k-sr').textContent()), `${g} Fortschrittsangabe hat eine vollständige Lesefassung`);
  await knopf.focus();
  await page.keyboard.press('Tab');
  pruefe(await page.evaluate(() => !document.activeElement.closest('.lab__list')), `${g} Tab vom Knopf aus bleibt nicht in der Liste`);
  pruefe(await page.evaluate((k) => localStorage.getItem(k), LISTE) === 'zu', `${g} eingeklappter Zustand wird gemerkt`);
  // Weiter funktioniert wie zuvor
  const t0 = await page.evaluate(() => document.querySelector('.l-task:not([hidden])').id);
  await page.locator('#lab-next').click();
  await page.waitForFunction((id) => document.querySelector('.l-task:not([hidden])').id !== id, t0);
  const t1 = await page.evaluate(() => document.querySelector('.l-task:not([hidden])').id);
  pruefe(await page.evaluate((id) => location.hash === '#' + id && document.querySelector('.lab__item[aria-current="page"]').getAttribute('href') === '#' + id, t1), `${g} „Weiter“ wechselt die Station bei eingeklappter Leiste (${t0} -> ${t1})`);
  // Neuladen: bleibt eingeklappt
  await page.reload();
  pruefe(await knopf.getAttribute('aria-expanded') === 'false' && await listeBreit() <= 56, `${g} nach dem Neuladen bleibt die Leiste eingeklappt`);
  pruefe(await quer() <= 1, `${g} eingeklappt: kein Quer-Scrollen (${await quer()})`);
  await foto(page, `leiste-zu-${breite}`);
  // mit offenem Tutor bleibt das Raster heil
  await panelOeffnen(page);
  pruefe(await listeBreit() <= 56 && await quer() <= 1, `${g} eingeklappt mit offenem Tutor: Streifen ${await listeBreit()} px, Quer ${await quer()}`);
  await page.keyboard.press('Escape');
  // wieder ausklappen
  await knopf.click();
  pruefe(await knopf.getAttribute('aria-expanded') === 'true' && await listeBreit() >= 200 && await page.evaluate((k) => localStorage.getItem(k), LISTE) === null, `${g} Ausklappen stellt die Liste wieder her und löscht den gemerkten Wert`);
  pruefe(await bedienbar() > 5, `${g} ausgeklappt sind die Listeneinträge wieder bedienbar`);
}

async function lauf(browser, breite, hoehe) {
  const g = `${breite}×${hoehe}`;
  const context = await browser.newContext({ viewport: { width: breite, height: hoehe }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const gesendet = [];
  const stand = { rest: 30 };
  await apiNachbilden(page, gesendet, stand);
  const basis = URL_ARG || `http://127.0.0.1:${PORT}/`;

  // ---- Labor: langer Verlauf, dann Fehler
  await page.goto(basis + 'lektionen/v01-labor.html#a-eigene');
  await panelOeffnen(page);
  pruefe(await page.evaluate(() => document.activeElement && document.activeElement.id === 'tutor-frage'), `${g} Fokus im Eingabefeld nach dem Öffnen`);
  const hinweis = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.tutor-hinweis')); return { kante: s.borderLeftWidth, farbe: s.backgroundColor }; });
  const rot = /rgb\((\d+), (\d+), (\d+)\)/.exec(hinweis.farbe);
  pruefe(parseFloat(hinweis.kante) === 0 && !(rot && Number(rot[1]) > Number(rot[3]) + 12), `${g} Hinweiskasten neutral (Kante ${hinweis.kante}, Fläche ${hinweis.farbe})`);
  const kontextText = await page.locator('#tutor-kontext').textContent();
  pruefe(/a-eigene/.test(kontextText), `${g} Kontextzeile nennt die Aufgabe: „${kontextText}“`);
  for (let i = 0; i < 5; i++) await fragen(page, 'Wie fange ich an? Frage ' + (i + 1));
  pruefe(gesendet.length === 5 && gesendet[0].kontext.aufgabe === 'a-eigene', `${g} Labor schickt die Aufgabe mit (${gesendet[0] && gesendet[0].kontext.aufgabe})`);
  pruefe(await page.evaluate(() => /Heute noch 25 Fragen/.test(document.querySelector('.tutor-rest').textContent)), `${g} Restkontingent angezeigt`);
  await fragen(page, 'testfall:fehler');
  await page.waitForTimeout(100);
  const sStatus = await sichtbarImPanel(page, '.tutor-status--fehler span');
  const sKnopf = await sichtbarImPanel(page, '.tutor-status--fehler button');
  pruefe(sStatus === 'ok', `${g} 502: Meldung sichtbar (${sStatus})`);
  pruefe(sKnopf === 'ok', `${g} 502: „Nochmal versuchen“ sichtbar und klickbar (${sKnopf})`);
  await foto(page, `labor-fehler-${breite}`);
  await page.locator('.tutor-status--fehler button').click();
  await page.waitForFunction(() => !document.querySelector('.tutor[aria-busy]'));
  pruefe(gesendet.length === 7 && gesendet[6].verlauf.slice(-1)[0].text === 'testfall:fehler', `${g} Nochmal versuchen sendet dieselbe Frage erneut`);

  // ---- Kontingent erschöpft
  await fragen(page, 'testfall:kontingent bitte');
  await page.waitForTimeout(100);
  const feld = await page.locator('#tutor-frage').inputValue();
  pruefe(feld === 'testfall:kontingent bitte', `${g} 429: Frage steht wieder im Feld („${feld}“)`);
  pruefe(await page.locator('.tutor-senden').isDisabled(), `${g} 429: Senden ist aus`);
  pruefe(!(await page.locator('.tutor-beitrag--offen').count()), `${g} 429: keine offene Fragen-Blase`);
  const sK = await sichtbarImPanel(page, '.tutor-status--kontingent span');
  pruefe(sK === 'ok', `${g} 429: Meldung sichtbar (${sK})`);
  pruefe(/Heute noch 0 Fragen/.test(await page.locator('.tutor-rest').textContent()), `${g} 429: „Heute noch 0 Fragen“`);
  const vorher = gesendet.length;
  await page.locator('#tutor-frage').press('Enter');
  await page.waitForTimeout(100);
  pruefe(gesendet.length === vorher, `${g} 429: Enter sendet nicht mehr`);
  await foto(page, `labor-kontingent-${breite}`);

  // ---- Lerneinheit: Rest seitenübergreifend, Aufgabe der Lerneinheit
  await page.goto(basis + 'lektionen/v01-ablauf-und-erste-programme.html');
  await panelOeffnen(page);
  pruefe(/Heute noch 0 Fragen/.test(await page.locator('.tutor-rest').textContent()), `${g} Lerneinheit: Rest seitenübergreifend sichtbar`);
  pruefe(await page.locator('.tutor-senden').isDisabled(), `${g} Lerneinheit: Senden bleibt aus`);
  await foto(page, `lerneinheit-kontingent-${breite}`);
  // neuer Tag simuliert: Kontingent zurücksetzen.
  await page.evaluate(() => sessionStorage.removeItem('inf-mb-app:tutor:rest'));
  await page.reload();
  // a) Ohne bearbeitete Aufgabe geht nur die Lektion mit.
  await panelOeffnen(page);
  await fragen(page, 'Was ist ein PAP?');
  const b0 = gesendet[gesendet.length - 1];
  pruefe(!b0.kontext.aufgabe && b0.kontext.lektion === 'V01' && b0.kontext.seite === 'lerneinheit', `${g} Lerneinheit ohne Aufgabe: nur Lektion (${b0.kontext.lektion}, ${b0.kontext.seite})`);
  // b) Aufgabe der Lerneinheit als Kontext. Die Lerneinheit von Termin 01 hat keine Code-Aufgabe; deshalb wird sie nachgebildet
  //    (gleicher Aufbau wie bei den Aufgaben im Labor: .a-task[data-id] mit textarea.py-editor) und der Fokus wirklich gesetzt.
  //    Sobald eine Lerneinheit eine echte Aufgabe hat, läuft derselbe Weg mit ihrer data-id.
  const echt = await page.evaluate(() => { const t = document.querySelector('.a-task[data-id] textarea.py-editor'); return t ? t.closest('.a-task').getAttribute('data-id') : null; });
  const did = echt || 'nachbau-1';
  if (!echt) await page.evaluate((id) => {
    const d = document.createElement('div'); d.className = 'a-task'; d.setAttribute('data-id', id);
    d.innerHTML = '<textarea class="py-editor" aria-label="Nachbau"></textarea>';
    (document.querySelector('main') || document.body).appendChild(d);
  }, did);
  await page.evaluate(() => { const t = document.querySelector('.a-task[data-id] textarea.py-editor'); t.focus(); t.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); });
  await page.evaluate(() => sessionStorage.removeItem('inf-mb-app:tutor:rest'));
  await fragen(page, 'Wie fange ich hier an?');
  const b = gesendet[gesendet.length - 1];
  pruefe(b.kontext.aufgabe === did && b.kontext.seite === 'lerneinheit', `${g} Lerneinheit schickt data-id ${did} mit (${b.kontext.aufgabe}${echt ? '' : ', nachgebildete Aufgabe'})`);
  pruefe(/zuletzt bearbeitete Aufgabe/.test(await page.locator('#tutor-kontext').textContent()), `${g} Lerneinheit: Kontextzeile nennt die Aufgabe`);
  await foto(page, `lerneinheit-${breite}`);

  // ---- Panelbreite und Aufgabenleiste
  await breiteUndLeiste(page, g, basis, breite);
  await context.close();
}

(async () => {
  if (!URL_ARG) await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  const { chromium } = ladePlaywright();
  const browser = await chromium.launch();
  try {
    await lauf(browser, 1440, 900);
    await lauf(browser, 1024, 768);
  } catch (e) {
    fehler.push('Abbruch: ' + (e && e.message ? e.message.split('\n')[0] : e));
  } finally {
    await browser.close();
    if (!URL_ARG) server.close();
  }
  for (const t of ok) console.log('  ok      ' + t);
  for (const t of fehler) console.log('  FEHLER  ' + t);
  console.log(fehler.length ? `${fehler.length} Prüfung(en) fehlgeschlagen.` : `Alle ${ok.length} Prüfungen bestanden.`);
  process.exit(fehler.length ? 1 : 0);
})();
