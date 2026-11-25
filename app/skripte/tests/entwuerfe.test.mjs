/* Selbsttest Entwürfe (npm run selbsttest nach npm run build): Lektionen mit aktiv: false (zurzeit V02 und V03) werden gebaut,
   tauchen aber nirgends im Angebot auf: nicht im Lernpfad, nicht in kurs.json unter lektionen, nicht in der Suche, nicht im
   Precache des Service Workers (docs/app/ARCHITEKTUR.md, Abschnitt 16). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DIST, SITE } from '../../src/lib/pfade.mjs';
import { ladeKurs } from '../../src/lib/kurs.mjs';

const OHNE_DIST = fs.existsSync(path.join(DIST, 'app', 'daten', 'kurs.json')) ? false : 'kein Ausgabeordner: erst bauen (KURS_AUSGABE=… npm run build)';
const lies = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8');
const entwuerfe = ladeKurs().lektionen.filter((l) => !l.aktiv);
const dateien = entwuerfe.flatMap((l) => [l.lerneinheit, l.labor]);

test('Entwürfe: die Seiten werden gebaut und bleiben unter ihrer Adresse aufrufbar', { skip: OHNE_DIST }, () => {
  assert.ok(entwuerfe.length >= 1);
  for (const d of dateien) assert.ok(fs.existsSync(path.join(DIST, 'lektionen', d)), `lektionen/${d} fehlt im Ausgabeordner`);
});

test('Entwürfe: kurs.json nennt sie nur unter entwuerfe', { skip: OHNE_DIST }, () => {
  const k = JSON.parse(lies('app/daten/kurs.json'));
  for (const l of entwuerfe) {
    assert.ok(!k.lektionen.some((x) => x.nr === l.nr), `${l.nr} steht unter lektionen`);
    assert.ok(k.entwuerfe.some((x) => x.nr === l.nr), `${l.nr} fehlt unter entwuerfe`);
  }
  for (const t of k.termine) assert.ok(!entwuerfe.some((l) => l.nr === t.lektion), `Termin ${t.nr} verweist auf einen Entwurf`);
});

test('Entwürfe: nicht in Suche, Glossar und Lernpfad', { skip: OHNE_DIST }, () => {
  const nummern = entwuerfe.map((l) => l.nr);
  const suche = JSON.parse(lies('app/daten/suche.json')).eintraege;
  for (const e of suche) {
    assert.ok(!nummern.includes(e.lektion), `Sucheintrag „${e.titel}“ hat die Lektion ${e.lektion}`);
    assert.ok(!dateien.some((d) => String(e.url || '').includes(d)), `Sucheintrag „${e.titel}“ verweist auf einen Entwurf`);
  }
  for (const g of JSON.parse(lies('app/daten/glossar.json')).begriffe) assert.ok(!nummern.includes(g.lektion), `Glossar „${g.begriff}“`);
  for (const d of dateien) assert.ok(!lies('lernpfad.html').includes(d), `lernpfad.html verweist auf ${d}`);
});

test('Entwürfe: nicht im Precache des Service Workers', { skip: OHNE_DIST }, () => {
  const sw = lies('sw.js');
  for (const d of dateien) assert.ok(!sw.includes('lektionen/' + d), `Precache enthält lektionen/${d}`);
});

test('Entwürfe: jedes Video hat entweder Datei und Spieler oder den Platzhalter, nie beides', { skip: OHNE_DIST }, () => {
  let anzahl = 0;
  for (const d of dateien) {
    const html = lies('lektionen/' + d);
    for (const m of html.matchAll(/<figure class="k-video"[\s\S]*?<\/figure>/g)) {
      anzahl++;
      const name = /data-video="([\w-]+)"/.exec(m[0])[1];
      /* Maßgeblich ist die Quelle site/assets/video (danach entscheidet der Baustein <Video>). Im Ausgabeordner
         fehlen die .mp4, wenn mit VIDEO_BASIS gebaut wird: Dann kommen die Videos aus dem Storage. */
      const quelle = path.join(SITE, 'assets', 'video');
      const vorhanden = fs.existsSync(path.join(quelle, name + '.mp4'));
      if (vorhanden) {
        assert.match(m[0], /<video/, `${d}: ${name}.mp4 liegt vor, also gehört ein Spieler auf die Seite`);
        for (const endung of ['.vtt', '-poster.png']) {
          assert.ok(fs.existsSync(path.join(quelle, name + endung)), `${name}${endung} fehlt neben ${name}.mp4`);
          assert.ok(fs.existsSync(path.join(DIST, 'assets', 'video', name + endung)), `${name}${endung} fehlt im Ausgabeordner`);
        }
      } else {
        assert.ok(!/<video|<source|<track/.test(m[0]), `${d}: ${name} ohne Datei darf kein <video>, <source> oder <track> haben (sonst 404 und Konsolenfehler)`);
        assert.match(m[0], /<div class="k-video__missing"(?![^>]*hidden)[^>]*>Video folgt\./, `${d}: Platzhalter „Video folgt.“ für ${name}`);
      }
    }
  }
  assert.ok(anzahl >= 6, 'die Entwürfe enthalten alle sechs Videoplätze: ' + anzahl);
});
