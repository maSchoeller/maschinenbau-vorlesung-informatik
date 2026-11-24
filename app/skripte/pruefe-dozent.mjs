/* =============================================================
   pruefe-dozent.mjs – Kursübersicht für Dozierende im Browser (Vertrag Abschnitt 14)
   Aufruf:  node skripte/pruefe-dozent.mjs [http://localhost:4340]
   Voraussetzung: gebauter Stand läuft mit lokaler API, und die Testidentität DOZENT ist eingetragen:
     DOZENT_IDS=<Kennung> BENUTZER_SALT=lokal-test ABLAGE=datei … swa start app/<ausgabe> --api-location api …
     Kennung für den Salt „lokal-test“:  node skripte/pruefe-dozent.mjs --kennung
   pruefe-alles.mjs setzt das selbst. Jedes Konto ist ein eigener Browser-Kontext mit Testidentität des Emulators.
   Tests:
     t1  Gast: Hinweis und Anmelde-Knopf, keine Anfrage an /api/dozent
     t2  fremdes Konto: eigene Kennung zum Eintragen, keine Anfrage an /api/dozent, kein Verweis auf der Kontoseite
     t3  unter fünf Konten: nur die Zahl der Konten (nur bei frischer Ablage prüfbar)
     t4  Gruppenbild: Kennzahlen, Aufgabentabelle, Hänger, Selbstcheck stimmen mit der API und dem Lernstand überein
     t5  Tablet: kein seitliches Scrollen; Lektion wechseln; Verweis auf der Kontoseite
   ============================================================= */
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const DOZENT = 'pruef-dozent';
function dozentKennung(salt = 'lokal-test') {
  return crypto.createHmac('sha256', salt).update('github:' + DOZENT, 'utf8').digest('hex').slice(0, 32);
}

const args = process.argv.slice(2);
if (args.includes('--kennung')) { console.log(dozentKennung()); process.exit(0); }
const BASIS = (args.find((a) => /^https?:\/\//.test(a)) || 'http://localhost:4340').replace(/\/+$/, '');
const LAUF = Date.now().toString(36);

let fehler = 0, anzahl = 0;
function pruefe(name, ok, detail) {
  anzahl++; if (!ok) fehler++;
  console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${name}${detail !== undefined && detail !== '' ? ' – ' + detail : ''}`);
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

let browser;
async function geraet(userId, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const g = { ctx, page, konsole: [], dozentAufrufe: 0 };
  page.on('console', (m) => { if (m.type() === 'error') g.konsole.push(m.text()); });
  page.on('pageerror', (e) => g.konsole.push(String(e)));
  page.on('request', (r) => { if (/\/api\/dozent\//.test(r.url())) g.dozentAufrufe++; });
  if (userId) {
    await page.goto(BASIS + '/.auth/login/github', { waitUntil: 'domcontentloaded' });
    for (const [sel, wert] of [['#userId', userId], ['#userDetails', 'Test ' + userId]]) {
      const f = page.locator(sel); await f.fill(wert); await f.dispatchEvent('keyup');
    }
    await Promise.all([
      page.waitForURL((u) => !u.pathname.startsWith('/.auth/login'), { timeout: 15000 }),
      page.locator('#submit').click(),
    ]);
  }
  return g;
}
async function oeffne(g, pfad) {
  await g.page.goto(BASIS + '/' + pfad, { waitUntil: 'load' });
  await g.page.waitForFunction(() => { const n = document.querySelector('[data-dz-laedt]'); return !n || n.hidden; }, null, { timeout: 15000 });
}
const sichtbar = (g) => g.page.evaluate(() => [...document.querySelectorAll('[data-dz-block]')].filter((n) => !n.hidden).map((n) => n.getAttribute('data-dz-block')).join(','));
const api = (g, pfad, init) => g.page.evaluate(async ([p, i]) => {
  const r = await fetch(p, i ? { method: 'POST', headers: { 'content-type': 'application/json', 'x-kurs-app': '1' }, body: JSON.stringify(i) } : undefined);
  return { status: r.status, daten: await r.json().catch(() => null) };
}, [pfad, init || null]);

/** Ein Konto mit Lernstand: {'v01/aufg': {...}} */
async function lernstand(userId, eimer) {
  const g = await geraet(userId);
  await g.page.goto(BASIS + '/offline.html', { waitUntil: 'domcontentloaded' });
  const eintraege = Object.entries(eimer).map(([k, wert]) => ({ pfad: 'inf-mb/' + k, wert, geaendert: new Date().toISOString() }));
  const r = await api(g, '/api/abgleich', { eintraege, seit: null });
  await g.ctx.close();
  if (r.status !== 200 || r.daten.uebernommen !== eintraege.length) throw new Error('Lernstand für ' + userId + ' nicht angelegt: ' + JSON.stringify(r));
}

browser = await chromium.launch();
try {
  const kurs = await fetch(BASIS + '/app/daten/kurs.json').then((r) => r.json());
  const v01 = kurs.lektionen[0];
  const mitTeilen = v01.aufgaben.filter((a) => a.pruefbar.length > 0);
  const [b1, b2] = mitTeilen.filter((a) => a.teil === 'B');
  const eimer = (ids) => Object.fromEntries(ids.map((i) => [i, 1]));
  /* Knobelaufgaben (freiwillig): zählen weder im Nenner noch im Zähler. Gibt es welche, bekommen s5 und s6 sie zusätzlich
     als gelöst, und ein Konto nur mit Knobelaufgaben kommt dazu; alle Zahlen unten müssen trotzdem stimmen. */
  const knobelIds = kurs.lektionen.flatMap((x) => x.nr === 'V01' ? x.aufgaben.flatMap((a) => a.knobel || []) : []);
  const knobelTitel = v01.aufgaben.filter((a) => a.knobel).map((a) => a.titel);
  if (knobelIds.length) console.log(`  (Knobelaufgaben in V01: ${knobelIds.join(', ')})`);
  console.log(`Dozenten-Prüfung gegen ${BASIS} (Lauf ${LAUF}; Stationen ${b1.id}, ${b2.id})`);

  console.log('\nt1 Gast');
  const gast = await geraet(null);
  await oeffne(gast, 'dozent.html');
  pruefe('t1 Gast sieht den Hinweis zum Anmelden', await sichtbar(gast) === 'gast');
  pruefe('t1 keine Anfrage an /api/dozent, keine Konsolenfehler', gast.dozentAufrufe === 0 && gast.konsole.length === 0, gast.konsole.join(' | '));
  await gast.ctx.close();

  console.log('\nt2 fremdes Konto');
  const fremd = await geraet('fremd-' + LAUF);
  await oeffne(fremd, 'dozent.html');
  const kennung = await fremd.page.locator('[data-dz-kennung]').textContent();
  pruefe('t2 zeigt die eigene Kennung zum Eintragen', await sichtbar(fremd) === 'fremd' && /^[0-9a-f]{32}$/.test(kennung), kennung);
  pruefe('t2 Kennung ist die aus /api/ich', kennung === (await api(fremd, '/api/ich')).daten.benutzerId);
  pruefe('t2 keine Anfrage an /api/dozent, keine Konsolenfehler', fremd.dozentAufrufe === 0 && fremd.konsole.length === 0, fremd.konsole.join(' | '));
  pruefe('t2 direkter Aufruf der API: 403 ohne Daten', await api(fremd, '/api/dozent/uebersicht').then((r) => r.status === 403 && Object.keys(r.daten).sort().join() === 'fehler,meldung'));
  await fremd.page.goto(BASIS + '/konto.html', { waitUntil: 'load' });
  await fremd.page.waitForFunction(() => { const n = document.querySelector('[data-konto-laedt]'); return n && n.hidden; });
  pruefe('t2 Kontoseite ohne Verweis auf die Kursübersicht', await fremd.page.locator('[data-konto-dozent]').isHidden());
  await fremd.ctx.close();

  const doz = await geraet(DOZENT);
  await doz.page.goto(BASIS + '/offline.html', { waitUntil: 'domcontentloaded' });
  const ich = (await api(doz, '/api/ich')).daten;
  if (!ich.dozent) {
    console.error(`\nDie Testidentität „${DOZENT}“ ist nicht als Dozent eingetragen. Emulator mit DOZENT_IDS=${ich.benutzerId} starten.`);
    process.exit(2);
  }

  console.log('\nt3 unter fünf Konten');
  for (let i = 1; i <= 4; i++) await lernstand(`s${i}-${LAUF}`, { 'v01/aufg': eimer(b1.pruefbar), ...(i <= 3 ? { 'v01/begonnen': eimer([b2.pruefbar[0]]) } : {}), ...(i <= 2 ? { 'v01/quiz-v01': { got: 4 + 2 * i, total: 10 } } : {}), ...(i === 1 ? { 'v01/done': eimer([v01.abschnitte[0].id]) } : {}) });
  await oeffne(doz, 'dozent.html#v01');
  const frisch = (await api(doz, '/api/dozent/uebersicht')).daten;
  if (frisch.genug) console.log(`  (übersprungen: Ablage enthält schon ${frisch.konten} Konten)`);
  else {
    const wenig = await doz.page.locator('[data-dz-wenig]').textContent();
    pruefe('t3 nennt nur die Zahl der Konten', await sichtbar(doz) === 'bild' && wenig.includes(frisch.konten + ' Konten') && wenig.includes('ab 5'), wenig);
    pruefe('t3 keine Tabellen, keine Lektionswahl', await doz.page.locator('[data-dz-inhalt]').isHidden() && await doz.page.locator('.dz-wahl').isHidden());
  }

  console.log('\nt4 Gruppenbild');
  for (let i = 5; i <= 6; i++) await lernstand(`s${i}-${LAUF}`, { 'v01/aufg': eimer([...b1.pruefbar, ...knobelIds]), ...(knobelIds.length ? { 'v01/begonnen': eimer(knobelIds) } : {}) });
  if (knobelIds.length) await lernstand(`nurknobel-${LAUF}`, { 'v01/aufg': eimer(knobelIds), 'v01/begonnen': eimer(knobelIds) });
  await warte(31000);   /* der Server bewahrt das Bild 30 s auf */
  await doz.page.locator('[data-dz-block="bild"] [data-dz-aktion="neu"]').click();
  await doz.page.waitForFunction(() => { const n = document.querySelector('[data-dz-inhalt]'); return n && !n.hidden && document.querySelector('[data-dz-aufgaben] tr'); }, null, { timeout: 15000 });
  const bild = (await api(doz, '/api/dozent/uebersicht')).daten;
  const l = bild.lektionen.find((x) => x.nr === 'V01');
  const N = bild.konten;
  const s1 = l.stationen.find((s) => s.id === b1.id), s2 = l.stationen.find((s) => s.id === b2.id);
  pruefe('t4 API zählt den angelegten Lernstand', N >= 6 && s1.geloest >= 6 && s2.begonnen >= 3 && l.quiz && l.quiz.konten >= 2, JSON.stringify({ N, s1, s2, quiz: l.quiz }));
  if (frisch.konten === 4) pruefe('t4 frische Ablage: genau 6 Konten, 6 gelöst, 3 begonnen, Selbstcheck 70 %', N === 6 && s1.geloest === 6 && s1.begonnen === 0 && s2.geloest === 0 && s2.begonnen === 3 && l.quiz.anteil === 0.7 && l.teile.B.alle === 0 && l.teile.B.begonnen === 6, JSON.stringify(l.teile));
  const text = JSON.stringify(bild);
  if (knobelIds.length) {
    pruefe('t4 Knobelaufgaben: keine Station und kein Teil für sie in der Antwort', l.stationen.every((x) => !knobelIds.includes(x.id) && x.id.indexOf('kn-') !== 0) && Object.keys(l.teile).sort().join() === 'A,B', JSON.stringify(l.teile));
    pruefe('t4 Knobelaufgaben: ein Konto nur mit Knobelaufgaben zählt nicht (Konten wie ohne)', frisch.konten !== 4 || N === 6, 'Konten ' + N);
  }
  pruefe('t4 Antwort ohne Kennungen', !/[0-9a-f]{32}/.test(text) && !text.includes('benutzerId'));

  const zeilen = await doz.page.evaluate(() => [...document.querySelectorAll('[data-dz-aufgaben] tr')].map((tr) => [...tr.children].map((c) => c.textContent.trim())));
  const zeile = (a) => zeilen.find((z) => z[0] === a.titel);
  pruefe('t4 Tabelle: eine Zeile je Station mit prüfbaren Teilen', zeilen.length === mitTeilen.length, zeilen.length + ' von ' + mitTeilen.length);
  if (knobelTitel.length) pruefe('t4 Tabelle: keine Zeile für Knobelaufgaben', zeilen.every((z) => !knobelTitel.includes(z[0])), knobelTitel.join(', '));
  pruefe('t4 Zeile „' + b1.titel + '“ zeigt gelöst und begonnen wie die API', zeile(b1) && zeile(b1)[2] === `${s1.geloest} von ${N}` && zeile(b1)[3] === String(s1.begonnen), JSON.stringify(zeile(b1)));
  pruefe('t4 Zeile „' + b2.titel + '“ zeigt gelöst und begonnen wie die API', zeile(b2) && zeile(b2)[2] === `${s2.geloest} von ${N}` && zeile(b2)[3] === String(s2.begonnen), JSON.stringify(zeile(b2)));
  const breite = await doz.page.evaluate((id) => { const a = [...document.querySelectorAll('[data-dz-aufgaben] a')].find((x) => x.hash === '#' + id); return a.closest('tr').querySelector('.dz-balken__wert').style.width; }, b1.id);
  pruefe('t4 Balken entspricht dem Anteil', breite === Math.round((s1.geloest / N) * 100) + '%', breite);
  const haenger = await doz.page.locator('[data-dz-haenger]').textContent();
  pruefe('t4 Hänger nennt die begonnene Aufgabe mit Zahl', haenger.includes(`${b2.titel} (${s2.begonnen})`), haenger);
  const zahlen = await doz.page.evaluate(() => [...document.querySelectorAll('.dz-kennzahl')].map((k) => k.querySelector('dt').textContent + ': ' + k.querySelector('.dz-kennzahl__wert').textContent));
  pruefe('t4 Kennzahlen: aktiv, Teile, Selbstcheck', zahlen.includes(`In dieser Lektion aktiv: ${l.konten} von ${N}`) && zahlen.includes(`Training (Teil B) vollständig: ${l.teile.B.alle}`) && zahlen.includes(`Selbstcheck im Schnitt: ${Math.round(l.quiz.anteil * 100)} %`), zahlen.join(' | '));
  const abschnitt = await doz.page.evaluate(() => [...document.querySelectorAll('[data-dz-abschnitte] tr')].map((tr) => tr.children[0].textContent + ': ' + tr.children[1].textContent.trim()));
  pruefe('t4 Abschnitte der Lerneinheit mit Zahl', abschnitt[0] === `${v01.abschnitte[0].titel}: ${l.abschnitte[0].n} von ${N}` && abschnitt.length === v01.abschnitte.length, abschnitt[0]);
  const ziel = await doz.page.evaluate((id) => [...document.querySelectorAll('[data-dz-aufgaben] a')].find((x) => x.hash === '#' + id).getAttribute('href'), b1.id);
  pruefe('t4 Aufgabe verlinkt ins Labor', ziel === `${v01.labor}#${b1.id}`, ziel);
  pruefe('t4 Lektionswahl: alle Termine, V01 gewählt', await doz.page.locator('[data-dz-lektion] option').count() === kurs.lektionen.length && await doz.page.locator('[data-dz-lektion]').inputValue() === 'V01');

  console.log('\nt5 Tablet, Lektionswechsel, Kontoseite');
  await doz.page.setViewportSize({ width: 768, height: 1024 });
  const ueber = await doz.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  pruefe('t5 Tablet hochkant: kein seitliches Scrollen', ueber <= 0, ueber + ' px');
  const spalten = await doz.page.evaluate(() => getComputedStyle(document.querySelector('.dz-zahlen')).gridTemplateColumns.split(' ').length);
  pruefe('t5 Tablet: Kennzahlen in zwei Spalten', spalten === 2, String(spalten));
  await doz.page.setViewportSize({ width: 1440, height: 900 });
  const v02 = kurs.lektionen[1];
  if (v02) {
    await doz.page.locator('[data-dz-lektion]').selectOption(v02.nr);
    const zeilen2 = await doz.page.locator('[data-dz-aufgaben] tr').count();
    pruefe('t5 Wechsel auf ' + v02.nr + ': Tabelle und Adresse folgen', zeilen2 === v02.aufgaben.filter((a) => a.pruefbar.length > 0).length && new URL(doz.page.url()).hash === '#' + v02.nr.toLowerCase(), zeilen2 + ' Zeilen, ' + doz.page.url());
  } else console.log('  (nur eine Lektion freigeschaltet: Lektionswechsel übersprungen)');
  pruefe('t5 keine Konsolenfehler', doz.konsole.length === 0, doz.konsole.join(' | '));
  await doz.page.goto(BASIS + '/konto.html', { waitUntil: 'load' });
  await doz.page.waitForFunction(() => { const n = document.querySelector('[data-konto-laedt]'); return n && n.hidden; });
  const verweis = doz.page.locator('[data-konto-dozent] a');
  pruefe('t5 Kontoseite verweist auf die Kursübersicht', await verweis.isVisible() && await verweis.getAttribute('href') === 'dozent.html');
  await doz.ctx.close();
} catch (e) {
  pruefe('Lauf ohne Ausnahme', false, (e && e.stack || e).toString().split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${anzahl - fehler} von ${anzahl} Prüfungen bestanden.`);
process.exit(fehler ? 1 : 0);
