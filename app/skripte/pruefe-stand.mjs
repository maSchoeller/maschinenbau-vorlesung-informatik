/* =============================================================
   pruefe-stand.mjs – Bearbeitungen der Aufgaben speichern und wiederherstellen
   Aufruf:  node skripte/pruefe-stand.mjs [http://localhost:4340] [--nur code,klausur,luecken,zeilen,ablauf,schalter,fehler,tipp,quiz,knobel,konto]
   Voraussetzung: Emulator mit API (wie bei pruefe-zusammenspiel.mjs). Chromium, 1440×900.
   Je Aufgabenart: bearbeiten, neu laden, Stand ist wieder da; Zurücksetzen, neu laden, Vorlage ist da;
   unpassende Stände werden verworfen; „gelöst“ bleibt vom Zurücksetzen unberührt.
   Angemeldet: ein neuer Browser-Kontext (anderes Gerät) mit derselben Testidentität bekommt den Stand aus dem Konto.
   Schlüssel: docs/app/ARCHITEKTUR.md, Abschnitt 4.4a.
   ============================================================= */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const BASIS = (args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:4340').replace(/\/+$/, '');
const NUR = (() => { const i = args.indexOf('--nur'); return i >= 0 ? args[i + 1].split(',') : null; })();
const LAUF = Date.now().toString(36);
const NUTZER = 'st-' + LAUF;
const LABOR = BASIS + (process.env.STAND_LABOR || '/lektionen/v01-labor.html');   /* STAND_LABOR: eine Probe-Seite statt des echten Labors */
const LERN = BASIS + '/lektionen/v01-ablauf-und-erste-programme.html';

const ok = [], fehler = [];
function pruefe(bedingung, text, info) {
  const z = text + (info !== undefined && info !== '' ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '');
  (bedingung ? ok : fehler).push(z);
  console.log((bedingung ? '  ok      ' : '  FEHLER  ') + z);
  return !!bedingung;
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

let browser;
async function kontext(name) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', serviceWorkers: 'block' });
  const k = { name, ctx, probleme: [] };
  const beobachte = (page) => {
    page.on('pageerror', (e) => k.probleme.push('Skriptfehler: ' + String(e.message || e).slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) k.probleme.push('Konsole: ' + m.text().slice(0, 160)); });
  };
  ctx.on('page', beobachte);
  k.page = await ctx.newPage();
  return k;
}
function sauber(k, wo) {
  const p = k.probleme.splice(0);
  pruefe(p.length === 0, `${k.name}: keine Konsolenfehler (${wo})`, p.slice(0, 3).join(' | '));
}

/* ── Zugriff auf den Speicher der Seite ── */
const pf = (s) => 'inf-mb/v01/' + s;
const lies = (p, s) => p.evaluate((x) => window.KursSpeicher.sofort.lesen(x), pf(s));
const setze = (p, s, w) => p.evaluate(([x, v]) => window.KursSpeicher.sofort.schreiben(x, v), [pf(s), w]);
const schluessel = (p, vorsilbe) => p.evaluate(async (x) => (await window.KursSpeicher.liste(x)).map((e) => e.pfad.replace('inf-mb/v01/', '')), pf(vorsilbe));
/* wartet (entprellt: ca. 600 ms), bis der Eintrag da ist und die Bedingung erfüllt */
const warteStand = (p, s, fn = () => true, ms = 6000) => bis(async () => { const v = await lies(p, s); return v !== undefined && fn(v) ? v : false; }, ms, 100);
const warteWeg = (p, s, ms = 4000) => bis(async () => (await lies(p, s)) === undefined, ms, 100);

async function laborOeffnen(p, station, aufgabe) {
  await p.goto(LABOR + '#' + station);
  await p.reload();                                   /* Hash allein lädt die Seite nicht neu */
  await p.waitForSelector(`.a-task[data-id="${aufgabe}"], .k-mirror`, { timeout: 30000, state: 'attached' });
  await p.locator(`#${station}`).waitFor({ state: 'visible', timeout: 15000 });
}
const editorText = (p, aufgabe) => p.evaluate((id) => window.KursEditor.getValue(document.querySelector(`.a-task[data-id="${id}"] textarea`)), aufgabe);
async function anhaengen(p, aufgabe, text) {
  const e = p.locator(`.a-task[data-id="${aufgabe}"] .cm-content`).first();
  await e.waitFor({ timeout: 30000 });
  await e.click();
  await p.keyboard.press('Control+End');
  await p.keyboard.insertText(text);
}

/* ─────────────────────────────────────────────────────────── code */
async function code(k) {
  console.log('\n== Code-Aufgabe (code:<aufgabe>), Eingaben vorab');
  const p = k.page;
  await laborOeffnen(p, 'a-eigene', 'w-eigene');
  const vorlage = await editorText(p, 'w-eigene');
  pruefe((await schluessel(p, 'code:')).length === 0, 'Ohne Änderung entsteht kein Eintrag');
  await anhaengen(p, 'w-eigene', '\n# mein Zusatz 42\n');
  const v = await warteStand(p, 'code:w-eigene', (x) => x.code.includes('mein Zusatz 42'));
  pruefe(!!v && v.v === 1 && v.code.startsWith(vorlage.slice(0, 20)) && v.eingaben === undefined, 'Tippen im Editor speichert code:w-eigene', v ? Object.keys(v) : '');
  await p.reload();
  await p.locator('.a-task[data-id="w-eigene"] .cm-content').waitFor({ timeout: 30000 });
  pruefe((await editorText(p, 'w-eigene')).includes('mein Zusatz 42'), 'Nach dem Neuladen steht der Code wieder im Editor');
  pruefe(await p.locator('.a-task[data-id="w-eigene"] .cm-content').innerText().then((t) => t.includes('mein Zusatz 42')), 'Der Editor zeigt den wiederhergestellten Code an');
  /* Zurücksetzen löscht den Stand, „gelöst“ bleibt */
  await p.evaluate(() => window.KursAufgaben.store.setSolved('V01', 'w-eigene'));
  await p.locator('.a-task[data-id="w-eigene"] button', { hasText: 'Zurücksetzen' }).click();
  pruefe(await warteWeg(p, 'code:w-eigene'), 'Zurücksetzen löscht den gespeicherten Stand');
  await warte(900);
  pruefe((await lies(p, 'code:w-eigene')) === undefined, 'Der gelöschte Stand wird nicht nachträglich neu geschrieben');
  pruefe(await p.evaluate(() => window.KursAufgaben.store.solved('V01')['w-eigene'] === 1), 'Der Status „gelöst“ bleibt nach dem Zurücksetzen');
  await p.reload();
  await p.locator('.a-task[data-id="w-eigene"] .cm-content').waitFor({ timeout: 30000 });
  pruefe((await editorText(p, 'w-eigene')) === vorlage, 'Nach Zurücksetzen und Neuladen steht die Vorlage da');

  /* Eingaben vorab */
  await laborOeffnen(p, 't-5', 'tr-5');
  const t = p.locator('.a-task[data-id="tr-5"]');
  await t.locator('.k-imodus__btn[data-modus="vorab"]').click();
  await t.locator('textarea.a-inputs').fill('77\n3');
  const v2 = await warteStand(p, 'code:tr-5', (x) => x.eingaben === '77\n3');
  pruefe(!!v2 && typeof v2.code === 'string', 'Modus „vorab“: das Feld „Eingaben“ wird mitgespeichert', v2 ? { eingaben: v2.eingaben } : '');
  await p.reload();
  await p.locator('.a-task[data-id="tr-5"] .cm-content').waitFor({ timeout: 30000 });
  pruefe(await p.locator('.a-task[data-id="tr-5"] textarea.a-inputs').inputValue() === '77\n3', 'Nach dem Neuladen steht das Eingabefeld wieder da');
  await t.locator('button', { hasText: 'Zurücksetzen' }).click();
  pruefe(await warteWeg(p, 'code:tr-5') && await t.locator('textarea.a-inputs').inputValue() === '40\n1.8', 'Zurücksetzen: Stand weg, Eingaben wieder aus der Aufgabe (40, 1.8)');
  await t.locator('.k-imodus__btn[data-modus="terminal"]').click();

  /* Der Dozenten-Übersicht und dem Abgleich fremde Schlüssel bleiben getrennt */
  const alle = await p.evaluate(async () => (await window.KursSpeicher.liste('inf-mb/v01/')).map((e) => e.pfad.replace('inf-mb/v01/', '')));
  pruefe(alle.every((s) => /^(aufg|begonnen|done|gesehen|quiz-[\w-]+|pap:[\w-]+|code:[\w-]+|luecken:[\w-]+|zeilen:[\w-]+|ablauf:[\w-]+|fehler:[\w-]+|tipp:[\w-]+|frage:[\w.-]+)$/.test(s)), 'Alle Schlüssel dieser Lektion folgen dem dokumentierten Muster', alle.join(' '));
  sauber(k, 'Code');
}

/* ─────────────────────────────────────────────────────────── knobel */
/* Knobelaufgaben (freiwillig): Bearbeitung und Status werden gespeichert wie bei jeder Aufgabe, ändern aber keinen Stand
   des Termins (Fortschritt, begonnen, Zähler). Ohne Knobelaufgaben im Labor von Termin 01 nichts zu prüfen. */
async function knobel(k) {
  const p = k.page;
  await p.goto(LABOR);
  await p.waitForSelector('.l-task', { state: 'attached', timeout: 30000 });
  const kn = await p.evaluate(() => [...document.querySelectorAll('.l-task[data-knobel]')].map((s) => ({ station: s.id, aufgabe: s.querySelector('[data-a][data-id]').getAttribute('data-id'), art: s.querySelector('[data-a][data-id]').getAttribute('data-a') })));
  if (!kn.length) { console.log('\n== Knobelaufgaben: im Labor von Termin 01 gibt es noch keine (nichts zu prüfen)'); return; }
  console.log('\n== Knobelaufgaben (' + kn.map((x) => x.aufgabe).join(', ') + '): speichern wie andere Aufgaben, zählen nirgends');
  const stand = () => p.evaluate(() => window.KursApp.fortschritt.lektion('V01').then((x) => JSON.stringify(x)));
  const zaehler = () => p.evaluate(() => [(document.querySelector('[data-lab-count]') || {}).textContent, (document.querySelector('.a-progress__text') || {}).textContent]);
  const vorher = await stand(), zVorher = await zaehler();
  const ersteCode = kn.find((x) => x.art === 'code' || x.art === 'run' || x.art === 'klausur');
  if (ersteCode) {
    await laborOeffnen(p, ersteCode.station, ersteCode.aufgabe);
    await anhaengen(p, ersteCode.aufgabe, '\n# mein Knobel-Zusatz 7\n');
    const v = await warteStand(p, 'code:' + ersteCode.aufgabe, (x) => x.code.includes('mein Knobel-Zusatz 7'));
    pruefe(!!v, 'Tippen speichert code:' + ersteCode.aufgabe + ' wie bei anderen Aufgaben');
    await p.reload();
    await p.locator('.a-task[data-id="' + ersteCode.aufgabe + '"] .cm-content').waitFor({ timeout: 30000 });
    pruefe((await editorText(p, ersteCode.aufgabe)).includes('mein Knobel-Zusatz 7'), 'Nach dem Neuladen steht der Code der Knobelaufgabe wieder im Editor');
  }
  const k0 = kn[0];
  pruefe(await bis(async () => (await lies(p, 'begonnen')) && (await lies(p, 'begonnen'))[k0.aufgabe] === 1, 4000, 100) || !ersteCode, 'Beginn der Knobelaufgabe steht in begonnen');
  await p.evaluate((i) => window.KursAufgaben.store.setSolved('V01', i), k0.aufgabe);
  await p.goto(LABOR + '#' + k0.station);
  await p.reload();
  await p.waitForSelector('.lab__item', { timeout: 30000 });
  const status = await p.locator('.lab__item[href="#' + k0.station + '"]').getAttribute('data-status');
  pruefe(status === 'done', 'Die Liste zeigt die gelöste Knobelaufgabe als gelöst', status);
  pruefe((await lies(p, 'aufg'))[k0.aufgabe] === 1, 'aufg enthält die Knobel-Kennung (kein neues Speicherformat)');
  pruefe(JSON.stringify(await zaehler()) === JSON.stringify(zVorher), 'Zähler im Labor („x/y“, „x von y gelöst“) unverändert', JSON.stringify([zVorher, await zaehler()]));
  pruefe(await stand() === vorher, 'Fortschritt des Termins (KursApp.fortschritt) unverändert durch gelöste und begonnene Knobelaufgabe');
  const alle = await schluessel(p, 'code:');
  pruefe(alle.every((x) => /^code:[\w-]+$/.test(x)), 'Schlüssel folgen dem dokumentierten Muster', alle.join(' '));
  sauber(k, 'Knobelaufgaben');
}

/* ─────────────────────────────────────────────────────────── klausur */
async function klausur(k) {
  console.log('\n== Klausuraufgabe: Code, Abgabe, Selbstbewertung');
  const p = k.page;
  await laborOeffnen(p, 't-4', 'tr-4');
  const t = p.locator('.a-task[data-id="tr-4"]');
  await anhaengen(p, 'tr-4', 'stunden = float(input())\nlohn = float(input())\nverdienst = stunden * lohn\nprint(verdienst)\n');
  const v = await warteStand(p, 'code:tr-4', (x) => x.code.includes('verdienst'));
  pruefe(!!v && !v.ab, 'Klausur: Code gespeichert, noch nicht abgegeben', v ? { ab: v.ab } : '');
  await t.locator('button', { hasText: 'Abgeben und prüfen' }).click();
  await t.locator('.a-scheme__item input').first().waitFor({ timeout: 120000 });
  const boxen = t.locator('.a-scheme__item input');
  const n = await boxen.count();
  await boxen.first().check();
  const v2 = await warteStand(p, 'code:tr-4', (x) => x.ab === 1 && Array.isArray(x.haken) && x.haken.length === n && x.haken[0] === 1);
  pruefe(!!v2, 'Abgabe und Haken der Selbstbewertung werden gespeichert (ohne Zeit)', v2 ? { ab: v2.ab, haken: v2.haken, felder: Object.keys(v2) } : '');
  pruefe(!!v2 && !('zeit' in v2) && !('t' in v2), 'Die Zeit steht nicht im Eintrag');
  await p.reload();
  await t.locator('.a-scheme__item input').first().waitFor({ timeout: 30000 });
  const zustand = await t.evaluate((a) => ({
    abgegeben: a.classList.contains('is-submitted'),
    gesperrt: a.querySelector('textarea').readOnly,
    haken: [...a.querySelectorAll('.a-scheme__item input')].map((c) => (c.checked ? 1 : 0)),
    abgabeKnopf: [...a.querySelectorAll('button')].filter((b) => /Abgeben/.test(b.textContent)).every((b) => b.hidden),
    neu: [...a.querySelectorAll('button')].some((b) => /Neu schreiben/.test(b.textContent) && !b.hidden),
    text: a.querySelector('.a-scheme__score').textContent
  }));
  pruefe(zustand.abgegeben && zustand.gesperrt && zustand.abgabeKnopf && zustand.neu, 'Nach dem Neuladen: abgegeben, Code gesperrt, „Neu schreiben“ da', zustand);
  pruefe(zustand.haken[0] === 1 && zustand.haken.slice(1).every((h) => h === 0) && /Du gibst dir \d+ von \d+ Punkten/.test(zustand.text), 'Haken und Punktestand sind wieder da', zustand.haken.join(','));
  pruefe(/verdienst/.test(await editorText(p, 'tr-4')), 'Der abgegebene Code ist wieder da');
  await t.locator('button', { hasText: 'Neu schreiben' }).click();
  pruefe(await warteWeg(p, 'code:tr-4'), 'Neu schreiben löscht den Stand');
  await p.reload();
  await p.locator('.a-task[data-id="tr-4"] .cm-content').waitFor({ timeout: 30000 });
  pruefe((await editorText(p, 'tr-4')) === '' && !(await t.evaluate((a) => a.classList.contains('is-submitted'))), 'Nach Neuladen: leer und nicht abgegeben');
  sauber(k, 'Klausur');
}

/* ─────────────────────────────────────────────────────────── luecken */
async function luecken(k) {
  console.log('\n== Lückentext (luecken:<aufgabe>)');
  const p = k.page;
  await laborOeffnen(p, 'a-luecken', 'w-luecken');
  const felder = p.locator('.a-task[data-id="w-luecken"] .a-gap__in');
  const n = await felder.count();
  pruefe(n === 5, 'Lückentext hat fünf Lücken', n);
  await felder.nth(0).fill('float');
  await felder.nth(2).fill('/');
  const v = await warteStand(p, 'luecken:w-luecken', (x) => x.w && x.w[0] === 'float' && x.w[2] === '/');
  pruefe(!!v && v.w.length === 5 && v.w[1] === '' && typeof v.f === 'string', 'Ausgefüllte Lücken gespeichert, leere bleiben leer', v ? v.w : '');
  await p.reload();
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  const werte = await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').evaluateAll((l) => l.map((i) => i.value));
  pruefe(werte.join('|') === 'float||/||', 'Nach dem Neuladen stehen die Lücken wieder da', werte);

  /* Vorlage geändert: anderer Fingerabdruck oder andere Zahl der Lücken → verwerfen */
  await setze(p, 'luecken:w-luecken', { v: 1, f: 'alt', w: ['a', 'b', 'c', 'd', 'e'] });
  await p.reload();
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  pruefe((await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').evaluateAll((l) => l.map((i) => i.value).join(''))) === '', 'Stand einer anderen Vorlage (anderer Fingerabdruck) wird verworfen');
  await setze(p, 'luecken:w-luecken', { v: 1, f: v.f, w: ['a', 'b', 'c'] });
  await p.reload();
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  pruefe((await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').evaluateAll((l) => l.map((i) => i.value).join(''))) === '', 'Stand mit falscher Zahl von Lücken wird verworfen');
  await setze(p, 'luecken:w-luecken', { v: 1, f: v.f, w: ['float', 'input', '/', '+', 'print'] });
  await p.reload();
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  await p.locator('.a-task[data-id="w-luecken"] button', { hasText: 'Zurücksetzen' }).click();
  pruefe(await warteWeg(p, 'luecken:w-luecken') && (await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').evaluateAll((l) => l.map((i) => i.value).join(''))) === '', 'Zurücksetzen leert die Lücken und löscht den Stand');
  await p.reload();
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  pruefe((await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').evaluateAll((l) => l.map((i) => i.value).join(''))) === '', 'Nach Neuladen sind die Lücken leer');
  sauber(k, 'Lücken');
}

/* ─────────────────────────────────────────────────────────── zeilen */
const zeilenZustand = (p) => p.evaluate(() => {
  const b = document.querySelector('.a-task[data-id="w-parsons"]');
  return {
    ans: [...b.querySelectorAll('.a-p-ans .a-p-item')].map((li) => li.getAttribute('aria-label')),
    pool: [...b.querySelectorAll('.a-p-pool .a-p-item')].map((li) => li.getAttribute('aria-label'))
  };
});
async function zeilen(k) {
  console.log('\n== Zeilen ordnen (zeilen:<aufgabe>)');
  const p = k.page;
  await laborOeffnen(p, 'a-zeilen', 'w-parsons');
  const b = p.locator('.a-task[data-id="w-parsons"]');
  await b.locator('.a-p-pool .a-p-item').nth(1).click();
  await b.locator('.a-p-pool .a-p-item').nth(0).click();
  await b.locator('.a-p-ans .a-p-item').nth(1).locator('.a-p-tool[aria-label="Weiter einrücken"]').dispatchEvent('click');
  const vorher = await zeilenZustand(p);
  const v = await warteStand(p, 'zeilen:w-parsons', (x) => x.a && x.a.length === 2 && x.a[1][1] === 1);
  pruefe(!!v && vorher.ans.length === 2 && /Einrückung 1/.test(vorher.ans[1]), 'Gelegte Zeilen, Reihenfolge und Einrückung gespeichert', v ? { p: v.p.length, a: v.a } : '');
  let gleich = true;
  for (let i = 0; i < 3; i++) {
    await p.reload();
    await b.locator('.a-p-item').first().waitFor({ timeout: 30000 });
    const nachher = await zeilenZustand(p);
    if (JSON.stringify(nachher) !== JSON.stringify(vorher)) gleich = false;
  }
  pruefe(gleich, 'Nach dreimal Neuladen: gleiche Zeilen im Programm, gleiche Einrückung, Vorrat nicht neu gemischt');

  /* Vorlage geändert: unbekannte Zeile, doppelte Zeile, falsche Zahl */
  for (const [name, w] of [
    ['falscher Fingerabdruck', { v: 1, f: 'alt', p: v.p, a: v.a }],
    ['unbekannte Zeile', { v: 1, f: v.f, p: v.p, a: [['z99', 0], ...v.a.slice(1)] }],
    ['doppelte Zeile', { v: 1, f: v.f, p: v.p, a: [v.a[0], v.a[0]] }],
    ['fehlende Zeilen', { v: 1, f: v.f, p: [], a: v.a }]
  ]) {
    await setze(p, 'zeilen:w-parsons', w);
    await p.reload();
    await b.locator('.a-p-item').first().waitFor({ timeout: 30000 });
    const z = await zeilenZustand(p);
    pruefe(z.ans.length === 0 && z.pool.length === 5, `Unpassender Stand (${name}) wird verworfen: Programm leer, Vorrat voll`, z.ans.length + '/' + z.pool.length);
  }
  await setze(p, 'zeilen:w-parsons', { v: 1, f: v.f, p: v.p, a: v.a });
  await p.reload();
  await b.locator('.a-p-item').first().waitFor({ timeout: 30000 });
  await b.locator('button', { hasText: 'Neu mischen' }).click();
  pruefe(await warteWeg(p, 'zeilen:w-parsons') && (await zeilenZustand(p)).ans.length === 0, '„Neu mischen“ löscht den Stand und leert das Programm');
  await p.reload();
  await b.locator('.a-p-item').first().waitFor({ timeout: 30000 });
  pruefe((await zeilenZustand(p)).ans.length === 0, 'Nach Neuladen ist das Programm leer');
  sauber(k, 'Zeilen ordnen');
}

/* ─────────────────────────────────────────────────────────── ablauf */
const ablaufConfig = (p, id) => p.evaluate((i) => JSON.parse(document.querySelector(`.a-task[data-id="${i}"] script[type="application/json"]`).textContent), id);
async function ablaufSchritt(p, id, s, { absenden = true, nur = null } = {}) {
  const t = p.locator(`.a-task[data-id="${id}"]`);
  for (const [v, w] of Object.entries(s.set || {})) {
    if (nur && !nur.includes(v)) continue;
    await t.locator(`tr.is-active input[data-var="${v}"]`).fill(w);
  }
  if (s.out !== undefined && (!nur || nur.includes('#out'))) await t.locator('tr.is-active .a-trace__in--out').fill(s.out);
  if (absenden) await t.locator('button', { hasText: 'Zeile prüfen' }).click();
}
const ablaufZustand = (p, id) => p.evaluate((i) => {
  const t = document.querySelector(`.a-task[data-id="${i}"]`);
  return {
    fertigeZeilen: t.querySelectorAll('tbody tr.is-done').length,
    aufgedeckt: t.querySelectorAll('tbody .is-revealed').length,
    offen: [...t.querySelectorAll('tbody tr.is-active input')].map((x) => x.value),
    meldung: t.querySelector('.a-trace__msg').textContent
  };
}, id);
async function ablauf(k) {
  console.log('\n== Ablauf verfolgen (ablauf:<aufgabe>)');
  const p = k.page;
  await laborOeffnen(p, 'a-ablauf', 'w-trace');
  const cfg = await ablaufConfig(p, 'w-trace');
  const t = p.locator('.a-task[data-id="w-trace"]');
  pruefe(cfg.steps.length >= 4, 'Aufgabe hat mindestens vier Schritte', cfg.steps.length);
  const mitWert = cfg.steps.findIndex((s, i) => i >= 3 && s.set && Object.keys(s.set).length);
  for (let i = 0; i < 3; i++) await ablaufSchritt(p, 'w-trace', cfg.steps[i]);
  const var0 = Object.keys(cfg.steps[3].set || {})[0];
  if (var0) await ablaufSchritt(p, 'w-trace', cfg.steps[3], { absenden: false, nur: [var0] });
  const v = await warteStand(p, 'ablauf:w-trace', (x) => x.n === 3 && (!var0 || (x.e && x.e[var0] === cfg.steps[3].set[var0])));
  pruefe(!!v && Array.isArray(v.r) && v.r.length === 0, 'Erreichter Schritt und angefangener Eintrag gespeichert', v ? { n: v.n, e: v.e } : '');
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  let z = await ablaufZustand(p, 'w-trace');
  pruefe(z.fertigeZeilen === 3 && (!var0 || z.offen.includes(cfg.steps[3].set[var0])), 'Nach dem Neuladen: drei Zeilen erledigt, der angefangene Eintrag steht im offenen Schritt', z);
  pruefe(await p.evaluate(() => !document.activeElement || !document.activeElement.classList.contains('a-trace__in')), 'Das Wiederherstellen nimmt dem Rest der Seite nicht den Fokus');

  /* Aufdecken: zweimal falsch, dann „Lösung dieser Zeile zeigen“ */
  const s3 = cfg.steps[3];
  for (const x of await t.locator('tr.is-active input').all()) await x.fill('xyz');
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  await t.locator('button', { hasText: 'Lösung dieser Zeile zeigen' }).click();
  for (let i = 4; i < cfg.steps.length; i++) await ablaufSchritt(p, 'w-trace', cfg.steps[i]);
  const v2 = await warteStand(p, 'ablauf:w-trace', (x) => x.n === cfg.steps.length && x.r.length === 1 && x.r[0] === 3);
  pruefe(!!v2, 'Aufgedeckter Schritt wird gemerkt', v2 ? { n: v2.n, r: v2.r } : '');
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  z = await ablaufZustand(p, 'w-trace');
  pruefe(z.fertigeZeilen === cfg.steps.length && z.aufgedeckt >= 1 && /Fertig\. 1 von/.test(z.meldung), 'Nach dem Neuladen: alle Zeilen, aufgedeckte Zeile markiert, Meldung „Fertig. 1 von …“', z);
  pruefe(await p.evaluate(() => !window.KursAufgaben.store.solved('V01')['w-trace']) && await t.locator('button', { hasText: 'Zeile prüfen' }).isHidden(), 'Mit Aufdecken bleibt die Aufgabe ungelöst (auch nach dem Wiederherstellen)');

  /* Von vorn: Stand weg; dann ohne Aufdecken lösen */
  await t.locator('button', { hasText: 'Von vorn' }).click();
  pruefe(await warteWeg(p, 'ablauf:w-trace'), '„Von vorn“ löscht den Stand');
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  z = await ablaufZustand(p, 'w-trace');
  pruefe(z.fertigeZeilen === 0, 'Nach Neuladen beginnt die Aufgabe von vorn', z);
  for (let i = 0; i < cfg.steps.length; i++) await ablaufSchritt(p, 'w-trace', cfg.steps[i]);
  pruefe(await bis(() => p.evaluate(() => window.KursAufgaben.store.solved('V01')['w-trace'] === 1), 5000), 'Ohne Aufdecken: gelöst');
  await warteStand(p, 'ablauf:w-trace', (x) => x.n === cfg.steps.length && x.r.length === 0);
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  z = await ablaufZustand(p, 'w-trace');
  pruefe(z.fertigeZeilen === cfg.steps.length && /Geschafft/.test(z.meldung), 'Nach dem Neuladen: „Geschafft“ steht wieder da', z.meldung.slice(0, 50));
  await t.locator('button', { hasText: 'Von vorn' }).click();
  pruefe(await p.evaluate(() => window.KursAufgaben.store.solved('V01')['w-trace'] === 1), 'Der Status „gelöst“ bleibt nach „Von vorn“');

  /* Vorlage geändert */
  await setze(p, 'ablauf:w-trace', { v: 1, f: 'alt', n: 2, r: [] });
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  pruefe((await ablaufZustand(p, 'w-trace')).fertigeZeilen === 0, 'Stand einer anderen Vorlage wird verworfen');
  await setze(p, 'ablauf:w-trace', { v: 1, f: v.f, n: 999, r: [] });
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  pruefe((await ablaufZustand(p, 'w-trace')).fertigeZeilen === 0, 'Stand mit unmöglichem Schritt wird verworfen');
  await t.locator('button', { hasText: 'Von vorn' }).click();
  sauber(k, 'Ablauf verfolgen');
}

/* ─────────────────────────────────────────────────────────── ablauf mit Schaltern */
/* Die Schalter von trace (frage je Schritt, ausgabe: false) sind für Termin 02 und 03 gebaut; solange keine echte Aufgabe sie benutzt,
   wird eine Probeaufgabe mit denselben Daten in die Laborseite eingeschoben, bevor die Skripte laufen. */
const PROBE_LEER = {
  code: ['zahl = 45'],
  vars: ['Binär'],
  ausgabe: false,
  leerzeichen: false,
  steps: [{ line: 1, set: { 'Binär': '0010 1101' }, frage: 'Trag zahl als Binärzahl ein.' }]
};
const PROBE_GROSS = {
  code: ['farbe = 226', 'print(hex(farbe))'],
  vars: ['Hex'],
  ausgabe: false,
  gross: false,
  steps: [{ line: 1, set: { Hex: 'E2' }, frage: 'Trag farbe als Hexzahl ein.' }]
};
const PROBE = {
  code: ['geld = 2.0', 'if geld >= 1.5:', '    print("Cola")'],
  vars: ['geld', 'Bedingung', 'Weg'],
  ausgabe: false,
  steps: [
    { line: 1, set: { geld: '2.0' }, frage: 'Zeile 1 wird ausgeführt. Trag den Wert von geld ein.' },
    { line: 2, set: { Bedingung: 'True' }, frage: 'Zeile 2: Wie lautet die Bedingung? Trag True oder False ein, ohne Anführungszeichen.', hint: 'Ohne Anführungszeichen, und True mit großem T.' },
    { line: 3, set: { Weg: 'ja' }, frage: 'Welchen Weg nimmt der Plan? Trag ja oder nein ein, ohne Anführungszeichen.' }
  ]
};
async function ablaufSchalter(k) {
  console.log('\n== Ablauf verfolgen mit Schaltern (frage, ausgabe: false)');
  const p = k.page;
  const einschub = `<div id="probe-schalter"><div class="a-task" data-a="trace" data-id="probe-schalter"><script type="application/json">${JSON.stringify(PROBE)}</script></div><div class="a-task" data-a="trace" data-id="probe-leer"><script type="application/json">${JSON.stringify(PROBE_LEER)}</script></div><div class="a-task" data-a="trace" data-id="probe-gross"><script type="application/json">${JSON.stringify(PROBE_GROSS)}</script></div></div>`;
  await p.route('**/lektionen/v01-labor.html*', async (route) => {
    const r = await route.fetch();
    const text = await r.text();
    await route.fulfill({ response: r, body: text.replace(/(<body\b[^>]*>)/, '$1' + einschub) });
  });
  const t = p.locator('.a-task[data-id="probe-schalter"]');
  await p.goto(LABOR);
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  const kopf = await t.locator('thead th').allInnerTexts();
  pruefe(JSON.stringify(kopf) === JSON.stringify(['Schritt', 'Zeile', 'geld', 'Bedingung', 'Weg']), 'ausgabe: false: keine Spalte „Ausgabe“', kopf);
  pruefe(await t.locator('.a-trace__in--out').count() === 0 && await t.locator('tbody tr:first-child td').count() === 4, 'ausgabe: false: kein Ausgabefeld in der Zeile');
  const meldung = () => t.locator('.a-trace__msg').innerText();
  pruefe(await meldung() === PROBE.steps[0].frage, 'frage ersetzt den festen Starttext des Schritts', await meldung());
  pruefe(!/Typen beachten/.test(await meldung()), 'Der feste Hinweis „Typen beachten: Text steht in Anführungszeichen“ erscheint nicht');
  /* falsch ohne eigenen Hinweis: neutraler Satz statt Typ-Hinweis */
  await t.locator('tr.is-active input[data-var="geld"]').fill('3.0');
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe(/^Noch nicht richtig\. Geh die Zeile nochmal durch\.$/.test(await meldung()), 'Fehlversuch ohne eigenen Hinweis: neutraler Satz statt Typ-Hinweis', await meldung());
  await t.locator('tr.is-active input[data-var="geld"]').fill('2.0');
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe(await meldung() === PROBE.steps[1].frage, 'Nächster Schritt zeigt seine eigene frage', await meldung());
  /* Anführungszeichen werden nicht entfernt: "True", 'True' und true sind falsch */
  for (const falsch of ['"True"', 'true', "'True'"]) {
    await t.locator('tr.is-active input[data-var="Bedingung"]').fill(falsch);
    await t.locator('button', { hasText: 'Zeile prüfen' }).click();
    pruefe((await meldung()).startsWith('Noch nicht richtig. Ohne Anführungszeichen') && await t.locator('tbody tr.is-done').count() === 1, `Eintrag ${falsch} ist falsch, der Hinweis des Schritts erscheint`);
  }
  await t.locator('tr.is-active input[data-var="Bedingung"]').fill('True');
  /* Stand mit frage und ohne Ausgabe: speichern und wiederherstellen (mitten im Schritt) */
  const v = await warteStand(p, 'ablauf:probe-schalter', (x) => x.n === 1 && x.e && x.e.Bedingung === 'True' && !('#out' in x.e));
  pruefe(!!v && v.v === 1 && typeof v.f === 'string', 'Stand ablauf:probe-schalter: erreichter Schritt und Eintrag, kein Ausgabefeld', v ? { n: v.n, e: v.e } : '');
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  let z = await ablaufZustand(p, 'probe-schalter');
  pruefe(z.fertigeZeilen === 1 && z.offen.includes('True') && z.meldung === PROBE.steps[1].frage, 'Nach dem Neuladen: Zeile 1 erledigt, Eintrag und frage des offenen Schritts sind wieder da', z);
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  await t.locator('tr.is-active input[data-var="Weg"]').fill('nein');
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe((await meldung()).startsWith('Noch nicht richtig.') && await t.locator('tbody tr.is-done').count() === 2, 'Falscher Weg „nein“ wird nicht angenommen');
  await t.locator('tr.is-active input[data-var="Weg"]').fill('ja');
  await t.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe(/Geschafft: alle 3 Schritte/.test(await meldung()) && await p.evaluate(() => window.KursAufgaben.store.solved('V01')['probe-schalter'] === 1), 'Ohne Aufdecken: Meldung „Geschafft“ und gelöst');
  const v2 = await warteStand(p, 'ablauf:probe-schalter', (x) => x.n === 3 && x.r.length === 0);
  pruefe(!!v2, 'Fertiger Stand wird gespeichert', v2 ? { n: v2.n } : '');
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  z = await ablaufZustand(p, 'probe-schalter');
  pruefe(z.fertigeZeilen === 3 && /Geschafft/.test(z.meldung), 'Nach dem Neuladen: alle drei Zeilen und „Geschafft“', z.meldung.slice(0, 40));
  await setze(p, 'ablauf:probe-schalter', { v: 1, f: 'alt', n: 2, r: [] });
  await p.reload();
  await t.locator('tbody tr').first().waitFor({ timeout: 30000 });
  pruefe((await ablaufZustand(p, 'probe-schalter')).fertigeZeilen === 0, 'Stand mit fremdem Fingerabdruck wird verworfen');
  await t.locator('button', { hasText: 'Von vorn' }).click();
  pruefe(await warteWeg(p, 'ablauf:probe-schalter'), '„Von vorn“ löscht den Stand');
  /* leerzeichen: false: Leerraum zählt beim Vergleich nicht */
  const tl = p.locator('.a-task[data-id="probe-leer"]');
  for (const eingabe of ['00101101', '0010  1101', ' 0010 1101 ', '0 0 1 0 1 1 0 1']) {
    await tl.locator('tr.is-active input[data-var="Binär"]').fill(eingabe);
    await tl.locator('button', { hasText: 'Zeile prüfen' }).click();
    const fertig = /Geschafft/.test(await tl.locator('.a-trace__msg').innerText());
    pruefe(fertig, `leerzeichen: false: „${eingabe}“ wird angenommen`);
    if (fertig) await tl.locator('button', { hasText: 'Von vorn' }).click();
  }
  await tl.locator('tr.is-active input[data-var="Binär"]').fill('0010 1100');
  await tl.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe(/^Noch nicht richtig/.test(await tl.locator('.a-trace__msg').innerText()), 'leerzeichen: false: andere Ziffern bleiben falsch');
  /* gross: false: Groß- und Kleinschreibung zählt beim Vergleich nicht */
  const tg = p.locator('.a-task[data-id="probe-gross"]');
  for (const eingabe of ['E2', 'e2', ' e2 ']) {
    await tg.locator('tr.is-active input[data-var="Hex"]').fill(eingabe);
    await tg.locator('button', { hasText: 'Zeile prüfen' }).click();
    const fertig = /Geschafft/.test(await tg.locator('.a-trace__msg').innerText());
    pruefe(fertig, `gross: false: „${eingabe}“ wird angenommen`);
    if (fertig) await tg.locator('button', { hasText: 'Von vorn' }).click();
  }
  await tg.locator('tr.is-active input[data-var="Hex"]').fill('E3');
  await tg.locator('button', { hasText: 'Zeile prüfen' }).click();
  pruefe(/^Noch nicht richtig/.test(await tg.locator('.a-trace__msg').innerText()), 'gross: false: anderer Wert bleibt falsch');
  /* bestehende Aufgabe ohne Schalter: unverändert */
  await p.unroute('**/lektionen/v01-labor.html*');
  await laborOeffnen(p, 'a-ablauf', 'w-trace');
  const w = p.locator('.a-task[data-id="w-trace"]');
  const kopf2 = await w.locator('thead th').allInnerTexts();
  pruefe(kopf2[kopf2.length - 1] === 'Ausgabe', 'w-trace (ohne Schalter): Spalte „Ausgabe“ ist da', kopf2);
  pruefe(/^Zeile 1 wird ausgeführt\. Was steht danach in den markierten Feldern\? Typen beachten: Text steht in Anführungszeichen\.$/.test(await w.locator('.a-trace__msg').innerText()), 'w-trace (ohne Schalter): fester Starttext wie bisher');
  sauber(k, 'Ablauf mit Schaltern');
}

/* ─────────────────────────────────────────────────────────── fehler */
async function fehlersuche(k) {
  console.log('\n== Fehlersuche (fehler:<Kennung des Inhalts>)');
  const p = k.page;
  await laborOeffnen(p, 'a-fehler', 'w-xyz');
  const m = p.locator('.k-mirror').first();
  await m.locator('.k-line').nth(2).click();
  await m.locator('.k-line').nth(3).click();
  const schl = await bis(async () => { const l = await schluessel(p, 'fehler:'); return l.length ? l[0] : false; }, 6000, 100);
  const v = schl ? await warteStand(p, schl, (x) => x.s && x.s.length === 2) : null;
  pruefe(!!v && v.s.join() === '2,3' && !v.a, 'Markierte Zeilen gespeichert', v ? v : schl);
  await p.reload();
  await m.locator('.k-line').first().waitFor({ timeout: 30000 });
  pruefe(await m.locator('.k-line[aria-pressed="true"]').count() === 2 && await m.locator('.k-line').nth(2).getAttribute('aria-pressed') === 'true', 'Nach dem Neuladen sind die Zeilen wieder markiert');
  await m.locator('[data-mirror-check]').click();
  await warteStand(p, schl, (x) => x.a === 1);
  await p.reload();
  await m.locator('.k-line').first().waitFor({ timeout: 30000 });
  const z = await m.evaluate((e) => ({ verdict: e.querySelector('.k-verdict').textContent, treffer: e.querySelectorAll('.k-line.is-hit').length, gesperrt: e.querySelectorAll('.k-line[data-locked]').length, pruefKnopf: e.querySelector('[data-mirror-check]').hidden }));
  pruefe(/2 von 2 Fehlern gefunden/.test(z.verdict) && z.treffer === 2 && z.gesperrt === 4 && z.pruefKnopf, 'Nach dem Neuladen ist aufgelöst: Urteil, Treffer, gesperrte Zeilen', z);
  await m.locator('button', { hasText: 'Von vorn beginnen' }).click();
  pruefe(await warteWeg(p, schl) && await m.locator('.k-line[aria-pressed="true"]').count() === 0 && await m.locator('[data-mirror-check]').isVisible(), '„Von vorn beginnen“ löscht den Stand und setzt die Aufgabe zurück');
  await p.reload();
  await m.locator('.k-line').first().waitFor({ timeout: 30000 });
  pruefe(await m.locator('.k-line[aria-pressed="true"]').count() === 0 && await m.locator('.k-line.is-hit').count() === 0, 'Nach Neuladen: unberührt');
  await setze(p, schl, { v: 1, s: [0, 99], a: 1 });
  await p.reload();
  await m.locator('.k-line').first().waitFor({ timeout: 30000 });
  pruefe(await m.locator('.k-line[aria-pressed="true"]').count() === 0 && await m.locator('.k-line[data-locked]').count() === 0, 'Stand mit nicht vorhandener Zeile wird verworfen');
  await setze(p, schl, undefined);
  sauber(k, 'Fehlersuche');
}

/* ─────────────────────────────────────────────────────────── tipp */
async function vorhersage(k) {
  console.log('\n== Vorhersage der Lerneinheit (tipp:<Kennung des Inhalts>)');
  const p = k.page;
  await p.goto(LERN);
  await p.reload();
  const feld = p.locator('.k-try', { has: p.locator('.k-predict') }).first();
  await feld.locator('.k-runner .cm-content').first().waitFor({ timeout: 30000 });
  const lauf = feld.locator('.k-runner__bar button', { hasText: 'Ausführen' });
  pruefe(await lauf.isDisabled(), 'Ohne Tipp ist „Ausführen“ gesperrt');
  const opt = feld.locator('.k-predict__opts button').nth(1);
  const text = (await opt.textContent()).trim();
  await opt.click();
  const schl = await bis(async () => { const l = await schluessel(p, 'tipp:'); return l.length ? l[0] : false; }, 6000, 100);
  const v = schl ? await warteStand(p, schl, (x) => x.t === text) : null;
  pruefe(!!v && v.g === 0, 'Gewählter Tipp gespeichert', v);
  await p.reload();
  const feld2 = p.locator('.k-try', { has: p.locator('.k-predict') }).first();
  await feld2.locator('.k-runner .cm-content').first().waitFor({ timeout: 30000 });
  pruefe(await feld2.locator('.k-predict__opts button[aria-pressed="true"]').textContent().then((t) => t.trim() === text, () => false) && await feld2.locator('.k-runner__bar button', { hasText: 'Ausführen' }).isEnabled(), 'Nach dem Neuladen: Tipp gewählt, „Ausführen“ freigeschaltet');
  await feld2.locator('.k-runner__bar button', { hasText: 'Ausführen' }).click();
  await warteStand(p, schl, (x) => x.g === 1, 120000);
  pruefe(/Dein Tipp/.test(await feld2.locator('.k-predict__result').textContent()), 'Nach dem Ausführen erscheint die Auswertung');
  await p.reload();
  const feld3 = p.locator('.k-try', { has: p.locator('.k-predict') }).first();
  await feld3.locator('.k-runner .cm-content').first().waitFor({ timeout: 30000 });
  pruefe(/Dein Tipp/.test(await feld3.locator('.k-predict__result').textContent()) && await feld3.locator('.k-runner__bar button', { hasText: 'Ausführen' }).isEnabled(), 'Nach dem Neuladen steht die Auswertung wieder da');
  await feld3.locator('.k-runner__bar button', { hasText: 'Zurücksetzen' }).click();
  pruefe(await warteWeg(p, schl) && await feld3.locator('.k-runner__bar button', { hasText: 'Ausführen' }).isDisabled() && (await feld3.locator('.k-predict__result').textContent()).trim() === '', '„Zurücksetzen“ löscht den Tipp und sperrt „Ausführen“ wieder');
  await p.reload();
  const feld4 = p.locator('.k-try', { has: p.locator('.k-predict') }).first();
  await feld4.locator('.k-runner .cm-content').first().waitFor({ timeout: 30000 });
  pruefe(await feld4.locator('.k-predict__opts button[aria-pressed="true"]').count() === 0 && await feld4.locator('.k-runner__bar button', { hasText: 'Ausführen' }).isDisabled(), 'Nach Neuladen: kein Tipp');
  await setze(p, schl, { v: 1, t: 'Antwort, die es nicht gibt', g: 1 });
  await p.reload();
  const feld5 = p.locator('.k-try', { has: p.locator('.k-predict') }).first();
  await feld5.locator('.k-runner .cm-content').first().waitFor({ timeout: 30000 });
  pruefe(await feld5.locator('.k-predict__opts button[aria-pressed="true"]').count() === 0, 'Tipp, der nicht zu den Antworten passt, wird verworfen');
  await setze(p, schl, undefined);
  sauber(k, 'Vorhersage');
}

/* ─────────────────────────────────────────────────────────── quiz */
const quizZustand = (p) => p.evaluate(() => {
  const o = {};
  document.querySelectorAll('.k-quiz .k-q').forEach((q) => {
    const fb = q.querySelector('.k-q__fb');
    o[q.getAttribute('data-id')] = {
      kopf: fb && !fb.hidden ? (fb.querySelector('strong') || fb).textContent.replace(/\s*[+]?\d+(\.\d+)?\s*P\..*$|\s*0 von.*$/, '').trim() : '',
      gesperrt: [...q.querySelectorAll('input')].every((i) => i.disabled || i.readOnly),
      gewaehlt: [...q.querySelectorAll('.k-q__opt')].filter((l) => l.querySelector('input').checked).map((l) => l.textContent.trim()).sort().join('|') || (q.querySelector('.k-q__input') ? q.querySelector('.k-q__input').value : '')
    };
  });
  return Object.fromEntries(Object.entries(o).sort((x, y) => (x[0] < y[0] ? -1 : 1)));
});
const punkte = (p) => p.evaluate(() => { const s = document.querySelector('.k-quiz [data-score]'); return s ? s.textContent : ''; });
async function antworte(p, id, richtig) {
  const q = p.locator(`.k-quiz .k-q[data-id="${id}"]`);
  await q.scrollIntoViewIfNeeded();
  const typ = await q.getAttribute('data-type');
  if (typ === 'mc') {
    const wahl = await q.evaluate((e, r) => [...e.querySelectorAll('.k-q__opt')].map((l, i) => ({ i, c: !!l._correct })).filter((x) => (r ? x.c : !x.c)).map((x) => x.i), richtig);
    const mehrere = await q.evaluate((e) => e.querySelector('input').type === 'checkbox');
    for (const i of (richtig || mehrere ? wahl : wahl.slice(0, 1))) await q.locator('.k-q__opt').nth(i).click();
  } else {
    const ans = (await q.getAttribute('data-answer')).split('|')[0];
    await q.locator('.k-q__input').fill(richtig ? ans : '-123');
  }
  await q.locator('button', { hasText: 'Prüfen' }).click();
}
async function quiz(k) {
  console.log('\n== Quiz (frage:<quiz>.<frage>, Gesamtergebnis quiz-<id> bleibt)');
  const p = k.page;
  await p.goto(LERN);
  await p.reload();
  await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  const ids = await p.locator('.k-quiz .k-q').evaluateAll((l) => l.map((q) => q.getAttribute('data-id')));
  pruefe(ids.length === 6, 'Quiz hat sechs Fragen', ids);
  const plan = { symbol: true, ausgabe: false, wert: true };
  for (const [id, r] of Object.entries(plan)) await antworte(p, id, r);
  await warteStand(p, 'frage:v01.wert', (x) => x.p === 3);
  const eintraege = await schluessel(p, 'frage:');
  pruefe(eintraege.length === 3, 'Je beantworteter Frage ein Eintrag', eintraege);
  const sym = await lies(p, 'frage:v01.symbol'), aus = await lies(p, 'frage:v01.ausgabe');
  pruefe(sym.p === 2 && sym.ok === 1 && Array.isArray(sym.a) && aus.p === 0 && aus.ok === 0 && aus.a === '-123', 'Punkte im ersten Versuch und Antwort stehen im Eintrag', { sym, aus });
  pruefe((await lies(p, 'quiz-v01')) === undefined, 'Gesamtergebnis quiz-v01 gibt es erst, wenn alle Fragen beantwortet sind');
  const vorher = await quizZustand(p), pVorher = await punkte(p);
  /* Reihenfolge mischt bei jedem Laden: mehrfach laden, Zuordnung nach Kennung bleibt */
  const reihen = new Set();
  let gleich = true;
  for (let i = 0; i < 3; i++) {
    await p.reload();
    await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
    reihen.add((await p.locator('.k-quiz .k-q').evaluateAll((l) => l.map((q) => q.getAttribute('data-id')))).join());
    const nachher = await quizZustand(p);
    if (JSON.stringify(nachher) !== JSON.stringify(vorher) || (await punkte(p)) !== pVorher) { gleich = false; console.log('   vorher ', JSON.stringify(vorher), pVorher, '\n   nachher', JSON.stringify(nachher), await punkte(p)); }
  }
  pruefe(gleich, 'Nach Neuladen (3×): Auswertung, gewählte Antworten, Sperre je Frage und Punkte wie vorher', { richtig: vorher.symbol.kopf, falsch: vorher.ausgabe.kopf, punkte: pVorher.slice(0, 30) });
  pruefe(reihen.size >= 2, 'Die Fragen stehen weiterhin in zufälliger Reihenfolge', reihen.size + ' verschiedene Reihenfolgen');
  pruefe(vorher.symbol.kopf === 'Richtig.' && vorher.ausgabe.kopf === 'Nicht ganz.' && vorher.ausgabe.gesperrt, 'Richtig und „Nicht ganz.“ sind unterschieden und gesperrt', vorher);

  /* Nochmal versuchen (offen), dann alle Fragen beantworten */
  const q = p.locator('.k-quiz .k-q[data-id="ausgabe"]');
  await q.locator('button', { hasText: 'Nochmal versuchen' }).click();
  await warteStand(p, 'frage:v01.ausgabe', (x) => x.o === 1);
  await p.reload();
  await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  const offen = await p.locator('.k-quiz .k-q[data-id="ausgabe"]').evaluate((e) => ({ feld: e.querySelector('.k-q__input').readOnly, pruef: !e.querySelector('button').hidden, fb: e.querySelector('.k-q__fb').hidden }));
  pruefe(!offen.feld && offen.pruef && offen.fb, 'Zum Nochmal-Versuch geöffnete Frage bleibt offen (Punkte aus dem ersten Versuch zählen weiter)', offen);
  await antworte(p, 'ausgabe', true);
  for (const [id, r] of Object.entries({ aussagen: false, plan: true, fehler: true })) await antworte(p, id, r);
  const gesamt = await warteStand(p, 'quiz-v01', (x) => x.total > 0);
  pruefe(!!gesamt && gesamt.got === 2 + 0 + 3 + 0 + 3 + 3 && gesamt.total === 2 + 3 + 3 + 4 + 3 + 3, 'Gesamtergebnis quiz-v01 wie bisher ({got,total}), Nochmal-Versuch bringt keine Punkte', gesamt);
  const z1 = await quizZustand(p), p1 = await punkte(p);
  await p.reload();
  await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  const z2 = await quizZustand(p), p2 = await punkte(p);
  pruefe(JSON.stringify(z1) === JSON.stringify(z2) && p1 === p2 && /Punkte/.test(p2) && /Bestanden|Noch unter 50/.test(p2), 'Nach Neuladen zeigt die Seite alle Antworten und das Ergebnis wieder', p2);
  pruefe(JSON.stringify(await lies(p, 'quiz-v01')) === JSON.stringify(gesamt), 'quiz-v01 unverändert durch das Wiederherstellen');

  /* geänderte Frage: Fingerabdruck passt nicht */
  const alt = await lies(p, 'frage:v01.wert');
  await setze(p, 'frage:v01.wert', { ...alt, f: 'alt' });
  await p.reload();
  await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  pruefe((await quizZustand(p)).wert.kopf === '' && (await quizZustand(p)).symbol.kopf === 'Richtig.', 'Stand einer geänderten Frage wird verworfen, die übrigen bleiben');
  sauber(k, 'Quiz');
}

/* ─────────────────────────────────────────────────────────── konto */
async function anmelden(page, userId) {
  await page.goto(BASIS + '/konto.html');
  await page.click('[data-konto-aktion="anmelden"]');
  await page.waitForURL(/\.auth\/login\/github/, { timeout: 15000 }).catch(() => page.goto(BASIS + '/.auth/login/github'));
  for (const [sel, w] of [['#userId', userId], ['#userDetails', 'Test ' + userId]]) { const f = page.locator(sel); await f.fill(w); await f.dispatchEvent('keyup'); }
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/.auth/'), { timeout: 20000 }), page.locator('#submit').click()]);
  const da = await page.waitForSelector('dialog.ka-dialog[open]', { timeout: 6000 }).then(() => true, () => false);
  if (da) { await page.locator('dialog.ka-dialog[open] button', { hasText: 'Ja, übernehmen' }).click(); await page.waitForSelector('dialog.ka-dialog[open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
}
const abgleichFertig = (page, ms = 20000) => page.waitForFunction(() => {
  const s = window.KursAbgleich && window.KursAbgleich.status();
  return s && s.aktiv && s.letzter && s.zustand !== 'laeuft' && !s.offen;
}, null, { timeout: ms }).then(() => true, () => false);
async function konto() {
  console.log('\n== Angemeldet: Gerätewechsel (neuer Browser-Kontext, gleiche Testidentität)');
  const A = await kontext('Gerät A');
  const p = A.page;
  await anmelden(p, NUTZER);
  await abgleichFertig(p);
  await laborOeffnen(p, 'a-eigene', 'w-eigene');
  await anhaengen(p, 'w-eigene', '\n# Stand von Gerät A\n');
  await warteStand(p, 'code:w-eigene', (x) => x.code.includes('Gerät A'));
  await laborOeffnen(p, 'a-luecken', 'w-luecken');
  await p.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(1).fill('input');
  await warteStand(p, 'luecken:w-luecken');
  await laborOeffnen(p, 'a-zeilen', 'w-parsons');
  await p.locator('.a-task[data-id="w-parsons"] .a-p-pool .a-p-item').nth(0).click();
  await warteStand(p, 'zeilen:w-parsons');
  await p.goto(LERN);
  await p.reload();
  await p.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  await antworte(p, 'symbol', true);
  await warteStand(p, 'frage:v01.symbol');
  await p.evaluate(() => window.KursAbgleich.jetzt());
  pruefe(await abgleichFertig(p), 'Gerät A: Abgleich abgeschlossen');
  const server = await (async () => {
    const r = await A.ctx.request.get(BASIS + '/api/eintraege');
    const d = r.ok() ? await r.json() : { eintraege: [] };
    const o = {};
    for (const e of d.eintraege || []) if (!e.geloescht) o[e.pfad] = e;
    return o;
  })();
  for (const s of ['code:w-eigene', 'luecken:w-luecken', 'zeilen:w-parsons', 'frage:v01.symbol']) pruefe(!!server[pf(s)], `Im Konto liegt ${s}`);

  const B = await kontext('Gerät B');
  const q = B.page;
  await anmelden(q, NUTZER);
  await abgleichFertig(q);
  await q.goto(LABOR + '#a-eigene');
  await q.reload();
  await q.locator('.a-task[data-id="w-eigene"] .cm-content').waitFor({ timeout: 30000 });
  pruefe(await bis(async () => (await editorText(q, 'w-eigene')).includes('Stand von Gerät A'), 20000), 'Gerät B: Code aus Gerät A steht im Editor');
  await q.goto(LABOR + '#a-luecken');
  await q.reload();
  await q.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(4).waitFor({ timeout: 30000 });
  pruefe(await bis(async () => (await q.locator('.a-task[data-id="w-luecken"] .a-gap__in').nth(1).inputValue()) === 'input', 20000), 'Gerät B: Lücke aus Gerät A ist da');
  await q.goto(LABOR + '#a-zeilen');
  await q.reload();
  await q.locator('.a-task[data-id="w-parsons"] .a-p-item').first().waitFor({ timeout: 30000 });
  pruefe(await bis(async () => (await q.locator('.a-task[data-id="w-parsons"] .a-p-ans .a-p-item').count()) === 1, 20000), 'Gerät B: gelegte Zeile aus Gerät A ist da');
  await q.goto(LERN);
  await q.reload();
  await q.locator('.k-quiz .k-q').first().waitFor({ state: 'attached', timeout: 30000 });
  pruefe(await bis(async () => (await quizZustand(q)).symbol.kopf === 'Richtig.', 20000), 'Gerät B: beantwortete Quizfrage aus Gerät A ist da');

  /* Zurücksetzen auf B erreicht A */
  await q.goto(LABOR + '#a-eigene');
  await q.reload();
  await q.locator('.a-task[data-id="w-eigene"] .cm-content').waitFor({ timeout: 30000 });
  await bis(async () => (await editorText(q, 'w-eigene')).includes('Gerät A'), 20000);
  await q.locator('.a-task[data-id="w-eigene"] button', { hasText: 'Zurücksetzen' }).click();
  await warteWeg(q, 'code:w-eigene');
  await q.evaluate(() => window.KursAbgleich.jetzt());
  await abgleichFertig(q);
  const r = await B.ctx.request.get(BASIS + '/api/eintraege');
  const d = r.ok() ? await r.json() : { eintraege: [] };
  const e = (d.eintraege || []).find((x) => x.pfad === pf('code:w-eigene'));
  pruefe(!e || e.geloescht, 'Zurücksetzen auf Gerät B löscht den Stand auch im Konto', e ? { geloescht: e.geloescht } : 'weg');
  sauber(A, 'Gerät A'); sauber(B, 'Gerät B');
  await A.ctx.close(); await B.ctx.close();
}

/* ───────────────────────────────────────────────────────────── */
const PLAN = [['code', code], ['klausur', klausur], ['luecken', luecken], ['zeilen', zeilen], ['ablauf', ablauf], ['schalter', ablaufSchalter], ['fehler', fehlersuche], ['tipp', vorhersage], ['quiz', quiz], ['knobel', knobel]];
async function main() {
  const st = await fetch(BASIS + '/api/status').then((r) => r.json()).catch(() => null);
  if (!st || !st.ok) { console.error('API nicht erreichbar unter ' + BASIS + '/api/status'); process.exit(2); }
  browser = await chromium.launch();
  try {
    const k = await kontext('Gast');
    for (const [id, fn] of PLAN) {
      if (NUR && !NUR.includes(id)) continue;
      try { await fn(id === 'schalter' ? await kontext('Schalter') : k); } catch (e) { pruefe(false, `Abbruch in „${id}“`, String(e && e.message || e).split('\n')[0]); }
    }
    await k.ctx.close();
    if (!NUR || NUR.includes('konto')) { try { await konto(); } catch (e) { pruefe(false, 'Abbruch in „konto“', String(e && e.message || e).split('\n')[0]); } }
  } finally { await browser.close(); }
  console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
  process.exit(fehler.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
