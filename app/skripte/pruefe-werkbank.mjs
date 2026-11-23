/* =============================================================
   pruefe-werkbank.mjs – wiederholbare Prüfung von Werkbank, „In der Werkbank öffnen“ und Teilen (Rolle Werkbank)
   Läuft mit Playwright/Chromium gegen den SWA-Emulator MIT lokaler API (Programme teilen braucht sie):
     KURS_AUSGABE=dist-werkbank npm run build
     ABLAGE=datei ABLAGE_DATEI=<wurzel>/api/.daten/werkbank/ablage.json \
       swa start app/dist-werkbank --api-location api --port 4325 --api-port 7335
     node skripte/pruefe-werkbank.mjs [basis-url=http://localhost:4325]
   Prüft 1440×900 (Desktop) und 1024×768 (Tablet): Anlegen, Tippen, Neuladen, Ausführen (print, input, Traceback),
   Umbenennen, Duplizieren, Löschen mit Rückgängig, Herunterladen, Deep-Link, Änderungen aus anderem Tab, Tastatur,
   „In der Werkbank öffnen“ (Lerneinheit, Bibliothek, nicht im Labor), Teilen (ohne Login, ohne Anzeigenamen, angemeldet),
   geteilte Seite in frischem Kontext (ausführen, Kopie), gelöschte und unbekannte id, Offline, XSS-Probe.
   Fotos landen in app/.cache/pruefung-werkbank/. Exit-Code 1, wenn etwas fehlschlägt.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOTOS = path.join(APP, '.cache', 'pruefung-werkbank');
fs.mkdirSync(FOTOS, { recursive: true });
const BASIS = (process.argv[2] || 'http://localhost:4325').replace(/\/+$/, '') + '/';

const fehler = [];
function pruefe(ok, text) { if (!ok) fehler.push(text); console.log((ok ? '  ok  ' : '  FEHLER  ') + text); }
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

const GERAETE = [{ n: 'desktop', width: 1440, height: 900 }, { n: 'tablet', width: 1024, height: 768 }];
const SONDER = '<img src=x onerror="window.__xss=1"> & "Anführung" <script>window.__xss=2<\/script>';

function konsole(page, liste) {
  page.on('pageerror', (e) => liste.push('pageerror: ' + e));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource/.test(t)) return;      /* 404/401 einzelner Dateien prüft requestfailed unten genauer */
    liste.push(t);
  });
}

async function codeLesen(page) {
  return page.evaluate(() => window.KursEditor.getValue(document.getElementById('wb-code')));
}
async function codeSetzen(page, text) {
  await page.locator('#wb-runner .cm-content').first().click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(text);
}
/* Seltene Aktionen liegen hinter „Mehr“: Menü öffnen, Aktion wählen; das Menü schließt sich danach */
async function mehr(page, aktion) {
  await page.click('.wb-mehr > summary');
  await page.click(`.wb-mehr [data-wb="${aktion}"]`);
  pruefe(await page.evaluate(() => !document.querySelector('.wb-mehr').open), `„Mehr“ schließt sich nach „${aktion}“`);
}
async function listenTitel(page) { return page.locator('#wb-liste .wb-prog__titel').allTextContents(); }
async function listeEnthaelt(page, titel, ms = 3000) {
  return page.waitForFunction((t) => Array.from(document.querySelectorAll('#wb-liste .wb-prog__titel')).some((e) => e.textContent === t), titel, { timeout: ms }).then(() => true, () => false);
}
/* Nach der Anmeldung fragt das Konto beim ersten Mal, ob der lokale Stand übernommen werden soll (Rolle Konto) */
async function kontoDialogBeantworten(page) {
  try {
    await page.waitForSelector('dialog.ka-dialog[open]', { timeout: 6000 });
    await page.locator('dialog.ka-dialog[open] button', { hasText: 'Ja, übernehmen' }).click();
    await page.waitForSelector('dialog.ka-dialog[open]', { state: 'detached', timeout: 5000 }).catch(() => {});
  } catch (e) { /* kein Dialog */ }
}
async function speicherWarten(page) {
  await page.waitForFunction(() => /^Gespeichert/.test(document.getElementById('wb-status').textContent), null, { timeout: 5000 });
}
async function ausfuehren(page, erwartet, name, dauer = 90000) {
  await page.locator('#wb-runner .k-runner__bar button', { hasText: 'Ausführen' }).click();
  try {
    await page.waitForFunction(() => /fertig|Fehler|abgebrochen|Ladefehler/.test(document.querySelector('#wb-runner .k-runner__status').textContent), null, { timeout: dauer });
  } catch (e) { /* Zeitüberschreitung wird unten über die Ausgabe gemeldet */ }
  const aus = await page.locator('#wb-runner .k-runner__out').innerText();
  pruefe(erwartet.test(aus), name + ' (Ausgabe: ' + aus.replace(/\s+/g, ' ').slice(0, 120) + ')');
  return aus;
}

async function anmelden(context, userId, name) {
  const p = await context.newPage();
  await p.goto(BASIS + '.auth/login/github');
  await p.fill('#userId', userId);
  await p.fill('#userDetails', name);
  await p.click('#submit');
  await p.waitForLoadState('load');
  await p.close();
}

async function main() {
  const browser = await chromium.launch();
  const zeigeStand = {};
  try {
    for (const g of GERAETE) {
      console.log('== ' + g.n + ' ' + g.width + '×' + g.height);
      const fk = [];
      const ctx = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE', acceptDownloads: true });
      await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASIS).origin }).catch(() => {});
      const page = await ctx.newPage();
      konsole(page, fk);

      /* ── 1. Leerer Zustand und Beispiel ───────────────────── */
      await page.goto(BASIS + 'werkbank.html');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector('#wb-leer:not([hidden])');
      pruefe(await page.locator('#wb-arbeit').isHidden(), 'Leerer Zustand: Arbeitsfläche ausgeblendet');
      const leerKnoepfe = await page.locator('#wb-leer button').count();
      pruefe(leerKnoepfe === 1, 'Leerer Zustand: genau ein Knopf (' + leerKnoepfe + ')');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-leer.png') });
      await page.click('#wb-beispiel');
      await page.waitForSelector('#wb-arbeit:not([hidden])');
      await page.waitForFunction(() => document.querySelectorAll('#wb-runner .cm-content').length >= 2, null, { timeout: 20000 });
      await warte(400);   /* beide Editoren (Code, Eingaben) stehen, die Knopfleiste bewegt sich nicht mehr */
      pruefe((await codeLesen(page)).includes('math.pi'), 'Beispielprogramm im Editor');
      pruefe((await listenTitel(page)).join() === 'Kreisfläche', 'Beispiel steht in der Liste');
      pruefe(/#p[a-z0-9]{6,}$/.test(page.url()), 'Adresse trägt die Programm-ID (' + page.url().replace(BASIS, '') + ')');
      pruefe(await page.locator('#wb-liste a[aria-current="true"]').count() === 1, 'Aktuelles Programm ist in der Liste markiert');
      const stdinSichtbar = await page.locator('#wb-runner .k-runner__stdinbox').isVisible();
      pruefe(stdinSichtbar && await page.locator('#wb-runner .k-runner__stdin').inputValue() === '25', 'Eingabefeld bei input() sichtbar, Beispieleingabe 25');

      /* ── 2. Ausführen: input und print ────────────────────── */
      await ausfuehren(page, /Fläche: 1963\.5 mm²/, 'Beispiel läuft mit Eingabe (input, print)');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-beispiel-ausgabe.png') });

      /* ── 3. Tippen, Neuladen, Traceback ───────────────────── */
      await codeSetzen(page, 'print("Hallo Werkbank")\nprint(1 / 0)\n');
      await speicherWarten(page);
      await page.reload();
      await page.waitForFunction(() => document.querySelector('#wb-runner .cm-content'), null, { timeout: 20000 });
      pruefe((await codeLesen(page)).startsWith('print("Hallo Werkbank")'), 'Nach dem Neuladen ist der Code noch da');
      await ausfuehren(page, /Hallo Werkbank[\s\S]*ZeroDivisionError/, 'Fehler zeigt Traceback mit ZeroDivisionError');

      /* ── 4. Umbenennen ────────────────────────────────────── */
      await page.fill('#wb-titel', 'Mein Test');
      await speicherWarten(page);
      pruefe(await listeEnthaelt(page, 'Mein Test'), 'Umbenennen aktualisiert die Liste');
      await page.reload();
      await page.waitForSelector('#wb-liste a');
      pruefe(await page.inputValue('#wb-titel') === 'Mein Test', 'Titel bleibt nach dem Neuladen');

      /* ── 5. Duplizieren, Neu ──────────────────────────────── */
      await mehr(page, 'duplizieren');
      await page.waitForFunction(() => document.querySelectorAll('#wb-liste li').length === 2);
      pruefe(await page.inputValue('#wb-titel') === 'Mein Test (Kopie)', 'Duplizieren: Kopie mit Titelzusatz geöffnet');
      pruefe((await codeLesen(page)).startsWith('print("Hallo Werkbank")'), 'Duplizieren: Code kopiert');
      pruefe(await page.evaluate(() => document.activeElement && document.activeElement.id) === 'wb-titel', 'Duplizieren: Fokus im Titelfeld');
      await page.click('[data-wb="neu"]');
      await page.waitForFunction(() => document.querySelectorAll('#wb-liste li').length === 3);
      await page.waitForFunction(() => document.getElementById('wb-titel').value === 'Neues Programm');
      pruefe((await codeLesen(page)) === '', 'Neu: leerer Editor');
      pruefe(await page.evaluate(() => !!document.activeElement.closest('#wb-runner')), 'Neu: Fokus im Editor');
      pruefe((await listenTitel(page))[0] === 'Neues Programm', 'Neueste oben in der Liste');

      /* ── 6. Löschen mit Rückgängig ────────────────────────── */
      const vorher = (await listenTitel(page)).length;
      await mehr(page, 'loeschen');
      await page.waitForFunction((n) => document.querySelectorAll('#wb-liste li').length === n - 1, vorher);
      const meldungText = await page.locator('.app-meldungen').innerText();
      pruefe(/gelöscht/.test(meldungText) && /Rückgängig/.test(meldungText), 'Löschen: Meldung mit „Rückgängig“ statt Rückfrage');
      pruefe(await page.locator('dialog[open]').count() === 0, 'Löschen: kein Dialog');
      await page.locator('.app-meldungen button', { hasText: 'Rückgängig' }).click();
      await page.waitForFunction((n) => document.querySelectorAll('#wb-liste li').length === n, vorher);
      pruefe((await listenTitel(page)).includes('Neues Programm'), 'Rückgängig stellt das Programm wieder her');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-liste.png') });

      /* ── 7. Herunterladen ─────────────────────────────────── */
      await page.locator('#wb-liste a', { hasText: /^Mein Test/ }).first().click();
      await page.waitForFunction(() => document.getElementById('wb-titel').value.startsWith('Mein Test'));
      const titelJetzt = await page.inputValue('#wb-titel');
      const [dl] = await Promise.all([page.waitForEvent('download'), mehr(page, 'herunterladen')]);
      const dname = dl.suggestedFilename();
      const dinhalt = fs.readFileSync(await dl.path(), 'utf8');
      pruefe(dname === (titelJetzt === 'Mein Test' ? 'mein_test.py' : 'mein_test_kopie.py'), 'Download heißt ' + dname);
      pruefe(dinhalt.startsWith('print("Hallo Werkbank")') && /\n$/.test(dinhalt), 'Download enthält den Code mit Zeilenende');

      /* ── 7b. Zu großes Programm, Strg+S ───────────────────── */
      await page.evaluate(() => window.KursEditor.setValue(document.getElementById('wb-code'), '# ' + 'x'.repeat(70000) + '\n'));
      await page.waitForFunction(() => !document.getElementById('wb-gross').hidden, null, { timeout: 4000 }).then(
        () => pruefe(true, 'Programm über 64 KB: freundlicher Hinweis, dass es nicht abgeglichen wird'),
        () => pruefe(false, 'Programm über 64 KB: freundlicher Hinweis, dass es nicht abgeglichen wird'));
      pruefe(/zu groß für den Abgleich/.test(await page.locator('#wb-gross').innerText()), 'Hinweistext nennt die Grenze');
      await page.evaluate(() => window.KursEditor.setValue(document.getElementById('wb-code'), 'print("Hallo Werkbank")\nprint(1 / 0)\n'));
      await page.keyboard.press('Control+s');
      pruefe(/^Gespeichert/.test(await page.locator('#wb-status').textContent()), 'Strg+S speichert sofort');
      await page.waitForFunction(() => document.getElementById('wb-gross').hidden, null, { timeout: 4000 }).then(() => pruefe(true, 'Hinweis verschwindet, wenn das Programm wieder klein ist'), () => pruefe(false, 'Hinweis verschwindet, wenn das Programm wieder klein ist'));

      /* ── 7c. Voller Browser-Speicher wird ehrlich gemeldet ─── */
      await page.evaluate(() => {
        window.__origSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { if (String(k).indexOf('speicher:v2') >= 0) throw new DOMException('voll', 'QuotaExceededError'); return window.__origSetItem.call(this, k, v); };
      });
      await page.evaluate(() => window.KursEditor.setValue(document.getElementById('wb-code'), 'print("voller Speicher")\n'));
      await page.keyboard.press('Control+s');
      await page.waitForFunction(() => /Speicher ist voll/.test(document.getElementById('wb-status').textContent), null, { timeout: 4000 }).then(
        () => pruefe(true, 'Voller Browser-Speicher: Statuszeile warnt statt „Gespeichert“ zu behaupten'),
        () => pruefe(false, 'Voller Browser-Speicher: Statuszeile warnt statt „Gespeichert“ zu behaupten'));
      await page.evaluate(() => { Storage.prototype.setItem = window.__origSetItem; });
      await page.evaluate(() => window.KursEditor.setValue(document.getElementById('wb-code'), 'print("Hallo Werkbank")\nprint(1 / 0)\n'));
      await page.keyboard.press('Control+s');
      await warte(900);
      pruefe(/^Gespeichert/.test(await page.locator('#wb-status').textContent()), 'Normaler Speicher: keine falsche Warnung (' + await page.locator('#wb-status').textContent() + ')');

      /* ── 8. Deep-Link und unbekannte ID ───────────────────── */
      const ids = await page.evaluate(() => Array.from(document.querySelectorAll('#wb-liste a')).map((a) => a.getAttribute('data-id')));
      await page.goto(BASIS + 'werkbank.html#' + ids[ids.length - 1]);
      await page.reload();
      await page.waitForFunction((id) => document.querySelector('#wb-liste a[aria-current="true"]')?.getAttribute('data-id') === id, ids[ids.length - 1]);
      pruefe(true, 'Deep-Link öffnet das genannte Programm');
      await page.goto(BASIS + 'werkbank.html#gibtesnicht');
      await page.reload();
      await page.waitForSelector('.app-meldungen .app-meldung');
      pruefe(/gibt es auf diesem Gerät nicht/.test(await page.locator('.app-meldungen').innerText()), 'Unbekannte ID: freundliche Meldung');
      pruefe(await page.locator('#wb-liste a[aria-current="true"]').count() === 1, 'Unbekannte ID: trotzdem ein Programm offen');

      /* ── 9. Änderung aus anderem Tab erscheint hier ───────── */
      const zweit = await ctx.newPage();
      await zweit.goto(BASIS + 'werkbank.html#' + ids[0]);
      await zweit.waitForFunction(() => document.querySelector('#wb-runner .cm-content'));
      await page.goto(BASIS + 'werkbank.html#' + ids[0]);
      await page.reload();
      await page.waitForFunction(() => document.querySelector('#wb-runner .cm-content'));
      await zweit.evaluate(async (id) => {
        const p = 'inf-mb/werkbank/prog:' + id;
        const w = window.KursSpeicher.sofort.lesen(p);
        w.code = '# aus dem zweiten Tab\n'; w.titel = 'Vom zweiten Tab';
        window.KursSpeicher.sofort.schreiben(p, w);
      }, ids[0]);
      await page.waitForFunction(() => document.getElementById('wb-titel').value === 'Vom zweiten Tab', null, { timeout: 5000 });
      pruefe((await codeLesen(page)).startsWith('# aus dem zweiten Tab'), 'Änderung aus anderem Tab erscheint im Editor');
      pruefe(await listeEnthaelt(page, 'Vom zweiten Tab'), 'Änderung aus anderem Tab erscheint in der Liste');
      /* Die verdrängte eigene Fassung bleibt einen Klick weit zurückholbar */
      const zurueck = page.locator('.app-meldungen button', { hasText: 'Meine Fassung wiederherstellen' });
      pruefe(await zurueck.count() === 1, 'Fremdstand ersetzt eigenen Text: Meldung mit „Meine Fassung wiederherstellen“');
      if (await zurueck.count()) {
        await zurueck.click();
        await page.waitForFunction(() => !/# aus dem zweiten Tab/.test(window.KursEditor.getValue(document.getElementById('wb-code'))), null, { timeout: 3000 }).catch(() => {});
        const wieder = await codeLesen(page);
        pruefe(!wieder.startsWith('# aus dem zweiten Tab') && wieder.trim().length > 0, '„Meine Fassung wiederherstellen“ setzt den eigenen Text zurück und speichert ihn', wieder.slice(0, 40));
        await zweit.waitForFunction(() => !/# aus dem zweiten Tab/.test(window.KursEditor.getValue(document.getElementById('wb-code'))), null, { timeout: 5000 }).then(() => pruefe(true, 'Wiederhergestellte Fassung erreicht den anderen Tab'), () => pruefe(false, 'Wiederhergestellte Fassung erreicht den anderen Tab'));
      }
      /* ungespeicherte lokale Eingabe wird nicht überschrieben */
      await page.locator('#wb-runner .cm-content').first().click();
      await page.keyboard.press('End');
      await page.keyboard.insertText('# lokal getippt');
      await zweit.evaluate((id) => {
        const p = 'inf-mb/werkbank/prog:' + id;
        const w = window.KursSpeicher.sofort.lesen(p);
        w.code = '# fremd, wenn zu früh\n';
        window.KursSpeicher.sofort.schreiben(p, w);
      }, ids[0]);
      await warte(300);
      pruefe((await codeLesen(page)).includes('# lokal getippt'), 'Ungespeicherte Eingabe wird nicht von außen überschrieben');
      await speicherWarten(page);
      /* Löschen in anderem Tab: das offene Programm verschwindet mit Hinweis */
      const wegId = await zweit.evaluate(() => window.KursWerkbank.anlegen({ titel: 'Wird gleich gelöscht', code: 'print(1)\n' }));
      await page.waitForFunction((id) => !!document.querySelector('#wb-liste a[data-id="' + id + '"]'), wegId, { timeout: 5000 });
      await page.click('#wb-liste a[data-id="' + wegId + '"]');
      await page.waitForFunction((id) => document.querySelector('#wb-liste a[aria-current="true"]')?.getAttribute('data-id') === id, wegId);
      await zweit.evaluate((id) => window.KursSpeicher.sofort.loeschen('inf-mb/werkbank/prog:' + id), wegId);
      await page.waitForFunction((id) => !document.querySelector('#wb-liste a[data-id="' + id + '"]'), wegId, { timeout: 5000 });
      pruefe(/auf einem anderen Gerät gelöscht/.test(await page.locator('.app-meldungen').innerText()), 'Im anderen Tab gelöscht: Hinweis, Eintrag aus der Liste');
      await page.waitForFunction(() => document.querySelector('#wb-liste a[aria-current="true"]'), null, { timeout: 3000 }).catch(() => {});
      await zweit.close();

      /* ── 10. Tastatur ─────────────────────────────────────── */
      await page.goto(BASIS + 'werkbank.html');
      await page.waitForSelector('#wb-liste a');
      await page.locator('#wb-liste a').nth(1).focus();
      const fokusUmriss = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
      pruefe(fokusUmriss, 'Listeneintrag zeigt bei Tastaturfokus einen sichtbaren Umriss');
      const zweiteId = await page.evaluate(() => document.activeElement.getAttribute('data-id'));
      await page.keyboard.press('Enter');
      await page.waitForFunction((id) => document.querySelector('#wb-liste a[aria-current="true"]')?.getAttribute('data-id') === id, zweiteId);
      pruefe(await page.evaluate((id) => document.activeElement?.getAttribute('data-id') === id, zweiteId), 'Enter öffnet das Programm, Fokus bleibt auf dem Listeneintrag');
      await page.focus('#wb-titel');
      await page.keyboard.press('Tab');
      pruefe(await page.evaluate(() => document.activeElement?.getAttribute('data-wb')) === 'neu', 'Tab vom Titel führt zu den Aktionen');
      const knopfNamen = await page.evaluate(() => Array.from(document.querySelectorAll('[data-wb]')).map((b) => b.textContent.trim()));
      pruefe(knopfNamen.length === 5, 'Fünf beschriftete Aktionen: ' + knopfNamen.join(', '));
      const ohneName = await page.evaluate(() => Array.from(document.querySelectorAll('#inhalt button, #inhalt input, #inhalt a')).filter((e) => !e.hidden && e.offsetParent && !(e.textContent.trim() || e.getAttribute('aria-label') || (e.labels && e.labels.length))).map((e) => e.outerHTML.slice(0, 80)));
      pruefe(ohneName.length === 0, 'Alle bedienbaren Elemente haben einen Namen' + (ohneName.length ? ': ' + ohneName.join(' | ') : ''));

      /* ── 11. Layout ───────────────────────────────────────── */
      const layout = await page.evaluate(() => ({
        ueberlauf: document.documentElement.scrollWidth - window.innerWidth,
        editorBreite: Math.round(document.querySelector('#wb-runner').getBoundingClientRect().width),
        listeLinks: Math.round(document.querySelector('#wb-liste').getBoundingClientRect().left),
        editorLinks: Math.round(document.querySelector('#wb-runner').getBoundingClientRect().left),
      }));
      pruefe(layout.ueberlauf <= 0, 'Kein waagerechtes Scrollen (Überlauf ' + layout.ueberlauf + ' px)');
      pruefe(layout.editorBreite >= 560, 'Editor ist breit genug (' + layout.editorBreite + ' px)');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-werkbank.png') });

      /* ── 12. „In der Werkbank öffnen“ ─────────────────────── */
      const lek = await ctx.newPage(); konsole(lek, fk);
      await lek.goto(BASIS + 'lektionen/v07-funktionen.html');
      await lek.waitForSelector('.k-runner .k-runner__bar');
      await lek.waitForSelector('.wb-knopf');
      const stat = await lek.evaluate(() => {
        const boxen = Array.from(document.querySelectorAll('.k-runner'));
        return {
          boxen: boxen.length,
          mitKnopf: boxen.filter((b) => b.querySelector('.wb-knopf')).length,
          doppelt: boxen.filter((b) => b.querySelectorAll('.wb-knopf').length > 1).length,
          inAufgabe: boxen.filter((b) => b.closest('[data-a], [data-id], .a-task') && b.querySelector('.wb-knopf')).length,
          gesamtKnoepfe: document.querySelectorAll('.wb-knopf').length,
        };
      });
      pruefe(stat.mitKnopf >= 3 && stat.doppelt === 0 && stat.inAufgabe === 0 && stat.gesamtKnoepfe === stat.mitKnopf, 'Lerneinheit: Knopf an ' + stat.mitKnopf + ' von ' + stat.boxen + ' Runnern, keine Doppelknöpfe, keiner bei Aufgaben');
      await lek.evaluate(() => { const b = document.querySelector('.k-runner .wb-knopf'); b.scrollIntoView({ block: 'center' }); });
      const leiste = await lek.evaluate(() => {
        const bar = document.querySelector('.k-runner .wb-knopf').closest('.k-runner__bar');
        const tops = Array.from(bar.querySelectorAll('button, a')).filter((e) => e.offsetParent).map((e) => Math.round(e.getBoundingClientRect().top / 4));
        return { zeilen: new Set(tops).size, name: document.querySelector('.k-runner .wb-knopf').getAttribute('aria-label') };
      });
      pruefe(leiste.zeilen === 1, 'Knopfleiste des Runners bleibt einzeilig (' + leiste.zeilen + ' Zeile/n)');
      pruefe(leiste.name === 'In der Werkbank öffnen', 'Knopf hat den vollen Namen „In der Werkbank öffnen“');
      await lek.screenshot({ path: path.join(FOTOS, g.n + '-lerneinheit-knopf.png') });
      const ersterCode = await lek.evaluate(() => { const b = document.querySelector('.k-runner .wb-knopf').closest('.k-runner'); return window.KursEditor.getValue(b._kRunner.ta); });
      const anzahlVor = await lek.evaluate(() => window.KursSpeicher.sofort ? Object.keys(window.KursSpeicher.exportieren().eintraege).filter((k) => k.startsWith('inf-mb/werkbank/prog:')).length : -1);
      await Promise.all([lek.waitForURL(/werkbank\.html#p/), lek.locator('.k-runner .wb-knopf').first().click()]);
      await lek.waitForSelector('#wb-arbeit:not([hidden])');
      await lek.waitForFunction(() => document.querySelector('#wb-runner .cm-content'));
      const t = await lek.inputValue('#wb-titel');
      pruefe(/^V07 · .+/.test(t), 'Kopie heißt „' + t + '“');
      pruefe((await codeLesen(lek)).trim() === ersterCode.trim(), 'Kopie enthält den Code des Blocks');
      const anzahlNach = await lek.evaluate(() => document.querySelectorAll('#wb-liste li').length);
      pruefe(anzahlNach === anzahlVor + 1, 'Genau ein Programm mehr (' + anzahlVor + ' → ' + anzahlNach + ')');
      await lek.close();

      const labor = await ctx.newPage(); konsole(labor, fk);
      await labor.goto(BASIS + 'lektionen/v07-labor.html');
      await labor.waitForSelector('.k-runner .k-runner__bar', { timeout: 20000 }).catch(() => {});
      await warte(1200);
      pruefe(await labor.locator('.wb-knopf').count() === 0, 'Labor: kein „In der Werkbank öffnen“ (Trainingsaufgaben)');
      await labor.close();

      const bib = await ctx.newPage(); konsole(bib, fk);
      await bib.goto(BASIS + 'bibliothek.html');
      await bib.waitForSelector('.bib-playground .wb-knopf');
      pruefe(await bib.locator('.bib-playground .wb-knopf').count() === 1, 'Bibliothek: Spielwiese hat den Knopf');
      await bib.locator('.bib-playground .wb-knopf').click();
      pruefe(/noch kein Code/.test(await bib.locator('.app-meldungen').innerText()), 'Bibliothek: leere Spielwiese legt nichts an, sondern sagt es');
      await bib.close();

      /* ── 13. Teilen ohne Login ────────────────────────────── */
      await page.goto(BASIS + 'werkbank.html');
      await page.waitForSelector('#wb-liste a');
      await page.click('[data-wb="teilen"]');
      await page.waitForSelector('#wb-teilen[open]');
      await page.waitForFunction(() => /GitHub/.test(document.getElementById('wb-teilen-koerper').textContent));
      pruefe(await page.locator('#wb-teilen-koerper button', { hasText: 'Mit GitHub anmelden' }).count() === 1, 'Teilen ohne Login: freundlicher Weg zum Konto');
      pruefe(await page.evaluate(() => document.activeElement.textContent) === 'Mit GitHub anmelden', 'Fokus liegt im Dialog auf dem Knopf');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-teilen-ohne-login.png') });
      await page.keyboard.press('Escape');
      pruefe(await page.locator('#wb-teilen[open]').count() === 0, 'Esc schließt den Dialog');
      pruefe(await page.evaluate(() => document.activeElement.getAttribute('data-wb')) === 'teilen', 'Fokus kehrt zum Teilen-Knopf zurück');

      /* ── 14. Teilen angemeldet: erst ohne, dann mit Anzeigenamen ── */
      const nutzer = 'wb-' + g.n + '-' + Date.now().toString(36);
      await page.goto(BASIS + 'werkbank.html');
      await page.waitForSelector('#wb-liste a');
      const titelVorLogin = await page.inputValue('#wb-titel');
      await page.click('[data-wb="teilen"]');
      await page.click('#wb-teilen-koerper button:has-text("Mit GitHub anmelden")');
      await page.waitForURL(/\.auth\/login\/github/);
      await page.fill('#userId', nutzer);
      await page.fill('#userDetails', 'Testperson');
      await page.click('#submit');
      await page.waitForURL(/werkbank\.html/);
      await page.waitForSelector('#wb-liste a');
      pruefe(await page.inputValue('#wb-titel') === titelVorLogin, 'Nach der Anmeldung zurück in der Werkbank, dasselbe Programm offen');
      await kontoDialogBeantworten(page);
      await page.fill('#wb-titel', 'Teilen ' + SONDER.slice(0, 30));
      await codeSetzen(page, '# Titel enthält Sonderzeichen\nname = input("Name: ")\nprint("Hallo", name)\nprint("</textarea><script>window.__xss=3</script>")\n');
      await page.evaluate(() => window.KursEditor.setValue(document.querySelector('#wb-runner .k-runner__stdin'), 'Ada'));
      await speicherWarten(page);
      await page.click('[data-wb="teilen"]');
      await page.waitForFunction(() => /Anzeigenamen/.test(document.getElementById('wb-teilen-koerper').textContent));
      const kontoLink = await page.locator('#wb-teilen-koerper a', { hasText: 'Zum Konto' }).getAttribute('href');
      pruefe(/konto\.html$/.test(kontoLink), 'Teilen ohne Anzeigenamen: Weg zum Konto (' + kontoLink + ')');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-teilen-ohne-name.png') });
      await page.keyboard.press('Escape');
      const antwort = await page.evaluate(async (name) => window.KursApp.api('ich', { method: 'PUT', body: { anzeigename: name } }), 'Mia Muster');
      pruefe(antwort && antwort.anzeigename === 'Mia Muster', 'Anzeigename gesetzt');
      await page.click('[data-wb="teilen"]');
      await page.waitForFunction(() => /Link erstellen/.test(document.getElementById('wb-teilen-koerper').textContent));
      pruefe(/Lösungen von Trainingsaufgaben/.test(await page.locator('#wb-teilen-koerper').innerText()), 'Hinweis zu Trainingslösungen steht im Dialog');
      await page.click('#wb-teilen-koerper button:has-text("Link erstellen")');
      await page.waitForSelector('#wb-linkfeld');
      const link = await page.inputValue('#wb-linkfeld');
      pruefe(/geteilt\.html\?id=[A-Za-z0-9_-]{10}$/.test(link), 'Link erzeugt: ' + link.replace(BASIS, ''));
      await page.waitForFunction(() => /kopiert/.test(document.getElementById('wb-teilen-status').textContent), null, { timeout: 4000 }).catch(() => {});
      const zwischen = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
      pruefe(zwischen === link, 'Link liegt in der Zwischenablage');
      await page.waitForSelector('.wb-eigener');
      pruefe(await page.locator('.wb-eigener').count() === 1, 'Liste eigener Links zeigt den neuen Link');
      await page.screenshot({ path: path.join(FOTOS, g.n + '-teilen-link.png') });
      await page.keyboard.press('Escape');

      /* ── 15. Geteilte Seite in frischem, nicht angemeldetem Kontext ── */
      const frisch = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE' });
      const gp = await frisch.newPage(); konsole(gp, fk);
      await gp.goto(link);
      await gp.waitForSelector('#gt-inhalt:not([hidden])');
      pruefe((await gp.textContent('#gt-titel')).startsWith('Teilen <img src=x'), 'Geteilte Seite: Titel mit Sonderzeichen wird als Text gezeigt');
      pruefe(/geteilt von Mia Muster/.test(await gp.textContent('#gt-wer')), 'Geteilte Seite: „geteilt von Mia Muster“ und Datum');
      pruefe(await gp.evaluate(() => !document.querySelector('#gt-inhalt img, #gt-inhalt script, #inhalt img[src="x"]') && window.__xss === undefined), 'XSS-Probe: kein img-/script-Element, kein ausgeführter Code');
      pruefe(await gp.evaluate(() => document.title.includes('<img src=x')), 'Seitentitel enthält den Titel als Text');
      await gp.waitForFunction(() => document.querySelector('#gt-runner .cm-content'), null, { timeout: 20000 });
      pruefe((await gp.evaluate(() => window.KursEditor.getValue(document.querySelector('#gt-runner textarea')))).includes('</textarea><script>window.__xss=3</script>'), 'Code mit </textarea>-Falle bleibt Text im Editor');
      /* Ausführen ohne Login; Eingabe tippt die lesende Person selbst */
      await gp.evaluate(() => window.KursEditor.setValue(document.querySelector('#gt-runner .k-runner__stdin'), 'Grace'));
      await gp.locator('#gt-runner .k-runner__bar button', { hasText: 'Ausführen' }).click();
      await gp.waitForFunction(() => /fertig|Fehler|Ladefehler/.test(document.querySelector('#gt-runner .k-runner__status').textContent), null, { timeout: 90000 });
      const gAus = await gp.locator('#gt-runner .k-runner__out').innerText();
      pruefe(/Hallo Grace/.test(gAus) && /<\/textarea><script>window\.__xss=3<\/script>/.test(gAus), 'Geteiltes Programm läuft ohne Anmeldung (Ausgabe: ' + gAus.replace(/\s+/g, ' ').slice(0, 80) + ')');
      pruefe(await gp.evaluate(() => window.__xss === undefined), 'XSS-Probe: auch die Ausgabe führt nichts aus');
      await gp.screenshot({ path: path.join(FOTOS, g.n + '-geteilt.png') });
      /* Kopie in meine Werkbank */
      await gp.evaluate(() => localStorage.clear());
      await Promise.all([gp.waitForURL(/werkbank\.html#p/), gp.click('#gt-kopie')]);
      await gp.waitForFunction(() => document.querySelector('#wb-runner .cm-content'));
      pruefe((await gp.inputValue('#wb-titel')).startsWith('Teilen <img'), 'Kopie in meine Werkbank: Titel übernommen');
      pruefe((await codeLesen(gp)).includes('input("Name: ")'), 'Kopie in meine Werkbank: Code übernommen');
      pruefe(await gp.evaluate(() => !document.querySelector('#wb-liste img') && window.__xss === undefined), 'XSS-Probe: Werkbank-Liste zeigt den Titel nur als Text');

      /* Unbekannte id, Offline, serverseitig fremde Werte (Autor mit Skript-Tags) */
      await gp.goto(BASIS + 'geteilt.html?id=AAAAAAAAAA');
      await gp.waitForSelector('#gt-meldung h1');
      pruefe(/nicht gefunden/.test(await gp.textContent('#gt-meldung h1')) && await gp.locator('#gt-inhalt').isHidden(), 'Unbekannte id: klare Meldung');
      await gp.goto(BASIS + 'geteilt.html');
      await gp.waitForSelector('#gt-meldung h1');
      pruefe(/Kein Programm/.test(await gp.textContent('#gt-meldung h1')), 'Link ohne id: klare Meldung');
      await gp.route('**/api/geteilt/*', (r) => r.abort('connectionrefused'));
      await gp.goto(link);
      await gp.waitForSelector('#gt-meldung h1');
      pruefe(/Keine Verbindung/.test(await gp.textContent('#gt-meldung h1')) && await gp.locator('#gt-meldung button', { hasText: 'Erneut versuchen' }).count() === 1, 'Offline: Meldung mit „Erneut versuchen“');
      await gp.unroute('**/api/geteilt/*');
      await gp.route('**/api/geteilt/*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'x', titel: SONDER, code: '</textarea><img src=x onerror="window.__xss=4">', lektion: '<b>V1</b>', autor: SONDER, erstellt: '2026-01-02T03:04:05Z' }) }));
      await gp.goto(BASIS + 'geteilt.html?id=1234567890');
      await gp.waitForSelector('#gt-inhalt:not([hidden])');
      await warte(300);
      pruefe(await gp.evaluate((s) => document.getElementById('gt-titel').textContent === s && document.getElementById('gt-wer').textContent.includes(s) && !document.querySelector('#inhalt img, #inhalt script, #inhalt b') && window.__xss === undefined, SONDER), 'XSS-Probe: Titel, Autor, Lektion und Code mit Skript-Tags nur als Text');
      await gp.unroute('**/api/geteilt/*');
      await gp.close();

      /* ── 16. Eigenen Link löschen ─────────────────────────── */
      await page.goto(BASIS + 'werkbank.html');
      await page.waitForSelector('#wb-liste a');
      await kontoDialogBeantworten(page);
      await page.click('[data-wb="teilen"]');
      await page.waitForSelector('.wb-eigener');
      const loeschKnopf = page.locator('.wb-eigener button', { hasText: 'Löschen' });
      await loeschKnopf.click();
      pruefe(/Wirklich löschen/.test(await loeschKnopf.textContent()), 'Link löschen verlangt eine zweite Bestätigung im Dialog');
      await loeschKnopf.click();
      await page.waitForFunction(() => document.querySelectorAll('.wb-eigener').length === 0);
      pruefe(true, 'Eigener Link ist aus der Liste gelöscht');
      await page.keyboard.press('Escape');
      const nachLoeschen = await frisch.newPage();
      await nachLoeschen.goto(link);
      await nachLoeschen.waitForSelector('#gt-meldung h1');
      pruefe(/nicht gefunden/.test(await nachLoeschen.textContent('#gt-meldung h1')), 'Gelöschter Link: „nicht gefunden“');
      await frisch.close();

      /* ── 17. Zweites Gerät mit demselben Konto: Programme kommen über den Abgleich ── */
      await page.evaluate(() => window.KursAbgleich && window.KursAbgleich.jetzt());
      const ctx2 = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE' });
      /* Der Emulator vergibt bei jeder Anmeldung eine neue Kennung; dasselbe Konto auf einem zweiten Gerät = dasselbe Anmelde-Cookie */
      await ctx2.addCookies(await ctx.cookies());
      const p2 = await ctx2.newPage(); konsole(p2, fk);
      await p2.goto(BASIS + 'werkbank.html');
      await kontoDialogBeantworten(p2);
      pruefe(await listeEnthaelt(p2, 'Vom zweiten Tab', 15000), 'Zweites Gerät: Programme erscheinen nach der Anmeldung über den Abgleich');
      await p2.waitForSelector('#wb-arbeit:not([hidden])');
      pruefe(await p2.locator('#wb-leer').isHidden(), 'Zweites Gerät: leerer Zustand verschwindet, sobald Programme eintreffen');
      await p2.waitForFunction(() => document.querySelector('#wb-runner .cm-content'));
      await p2.fill('#wb-titel', 'Von Gerät zwei');
      await speicherWarten(p2);
      await p2.evaluate(() => window.KursAbgleich.jetzt());
      await page.evaluate(() => window.KursAbgleich.jetzt());
      await page.waitForFunction(() => document.getElementById('wb-titel').value === 'Von Gerät zwei', null, { timeout: 10000 }).then(
        () => pruefe(true, 'Erstes Gerät: Umbenennung vom zweiten Gerät erscheint im offenen Programm'),
        () => pruefe(false, 'Erstes Gerät: Umbenennung vom zweiten Gerät erscheint im offenen Programm (Titel: ' + 'unverändert' + ')'));
      pruefe(await listeEnthaelt(page, 'Von Gerät zwei'), 'Erstes Gerät: Liste zeigt den neuen Titel');
      await ctx2.close();

      pruefe(fk.length === 0, 'Keine Konsolenfehler und keine Seitenfehler' + (fk.length ? ': ' + fk.slice(0, 4).join(' | ') : ''));
      await ctx.close();
      zeigeStand[g.n] = true;
    }
  } finally {
    await browser.close();
  }
  console.log(fehler.length ? '\n' + fehler.length + ' Fehler:\n- ' + fehler.join('\n- ') : '\nAlles in Ordnung.');
  process.exit(fehler.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
