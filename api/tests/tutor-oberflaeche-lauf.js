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

async function lauf(browser, breite, hoehe) {
  const g = `${breite}×${hoehe}`;
  const context = await browser.newContext({ viewport: { width: breite, height: hoehe }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const gesendet = [];
  const stand = { rest: 30 };
  await apiNachbilden(page, gesendet, stand);
  const basis = URL_ARG || `http://127.0.0.1:${PORT}/`;

  // ---- Labor: langer Verlauf, dann Fehler
  await page.goto(basis + 'lektionen/v04-labor.html#a-eigene');
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
  await page.goto(basis + 'lektionen/v04-logik-und-verzweigungen.html');
  await panelOeffnen(page);
  pruefe(/Heute noch 0 Fragen/.test(await page.locator('.tutor-rest').textContent()), `${g} Lerneinheit: Rest seitenübergreifend sichtbar`);
  pruefe(await page.locator('.tutor-senden').isDisabled(), `${g} Lerneinheit: Senden bleibt aus`);
  await foto(page, `lerneinheit-kontingent-${breite}`);
  // neuer Tag simuliert: Kontingent zurücksetzen, dann Aufgabe der Lerneinheit fokussieren
  await page.evaluate(() => sessionStorage.removeItem('inf-mb-app:tutor:rest'));
  await page.reload();
  const did = await page.evaluate(() => { const t = document.querySelector('.a-task[data-id] textarea.py-editor'); return t ? t.closest('.a-task').getAttribute('data-id') : null; });
  if (did) {
    await page.evaluate(() => { const t = document.querySelector('.a-task[data-id] textarea.py-editor'); t.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); });
    await panelOeffnen(page);
    await fragen(page, 'Wie fange ich hier an?');
    const b = gesendet[gesendet.length - 1];
    pruefe(b.kontext.aufgabe === did && b.kontext.seite === 'lerneinheit', `${g} Lerneinheit schickt data-id ${did} mit (${b.kontext.aufgabe})`);
    pruefe(/zuletzt bearbeitete Aufgabe/.test(await page.locator('#tutor-kontext').textContent()), `${g} Lerneinheit: Kontextzeile nennt die Aufgabe`);
  } else {
    await panelOeffnen(page);
    await fragen(page, 'Was ist ein PAP?');
    pruefe(!gesendet[gesendet.length - 1].kontext.aufgabe, `${g} Lerneinheit ohne Aufgabe: nur Lektion`);
  }
  await foto(page, `lerneinheit-${breite}`);
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
