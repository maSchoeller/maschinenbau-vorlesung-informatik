/* Selbsttest Byte-Genauigkeit (npm run selbsttest; nach npm run build auch gegen app/dist).
   Für jede veröffentlichte site/-Seite:
   1. Der Inhalt ist der Original-Ausschnitt zwischen <body…> und Fuß, nur ohne Sprunglink und Kopf,
      und unterscheidet sich davon ausschließlich durch die erlaubten Umschreibungen.
   2. Alle <script type="text/x-python">, <script type="application/json">, <pre>, <textarea> des
      Original-Inhalts sind unverändert und gleich oft enthalten.
   3. Liegt app/dist vor: Das gebaute HTML enthält den Inhalt byte-genau (Astro set:html verändert nichts;
      wurde mit VIDEO_BASIS gebaut, den Test mit derselben Variable starten),
      die Bestandsskripte in Originalreihenfolge, und speicher.js · kern.js stehen vor ihnen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { zerlege, zerlegeText, alleSeiten, umschreiben } from '../../src/lib/quelle.mjs';
import { SITE, DIST } from '../../src/lib/pfade.mjs';

const GESCHUETZT = [
  /<script\b[^>]*type="text\/x-python"[^>]*>[\s\S]*?<\/script>/g,
  /<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g,
  /<pre\b[^>]*>[\s\S]*?<\/pre>/g,
  /<textarea\b[^>]*>[\s\S]*?<\/textarea>/g,
];
const zaehle = (text, s) => text.split(s).length - 1;
const seiten = alleSeiten();
const distDa = fs.existsSync(path.join(DIST, 'lektionen'));

test('es gibt die erwarteten Seiten', () => {
  assert.ok(seiten.length >= 48, `nur ${seiten.length} Seiten`);
  assert.ok(!seiten.includes('werkzeuge/labor-test.html'));
});

for (const s of seiten) {
  test(`byte-genau: ${s}`, () => {
    const q = zerlege(s, { videoBasis: '' });
    if (q.weiterleitung) {
      if (distDa) assert.equal(fs.readFileSync(path.join(DIST, s), 'utf8'), q.original, 'Weiterleitung unverändert übernommen');
      return;
    }
    const o = q.original;
    /* 1. Ausschnitte lückenlos aus dem Original; entfernt wurden nur Sprunglink, Kopf und Fuß */
    assert.equal(q.inhaltOriginal, q.ausschnitte.map((a) => o.slice(a.von, a.bis)).join(''));
    const bodyStart = o.indexOf('>', o.search(/<body\b/)) + 1;
    assert.equal(q.ausschnitte[0].von, bodyStart, 'Inhalt beginnt direkt nach <body…>');
    for (let i = 0; i + 1 < q.ausschnitte.length; i++) {
      const weg = o.slice(q.ausschnitte[i].bis, q.ausschnitte[i + 1].von);
      assert.match(weg, /^(<a class="k-skip"[\s\S]*<\/a>|<header class="dhbw-header[\s\S]*<\/header>)$/, 'entfernt wird nur Sprunglink oder Kopf');
    }
    const fussStart = q.ausschnitte.at(-1).bis;
    assert.ok(o.startsWith('<footer class="dhbw-footer', fussStart), 'Inhalt endet direkt vor dem Fuß');
    /* nur erlaubte Umschreibungen: zurückgedreht ergibt sich exakt der Original-Ausschnitt */
    const zurueck = q.inhalt.replace(/(href="(?:\.\.\/)*)lernpfad\.html"/g, '$1index.html#lernpfad"');
    assert.equal(zurueck, q.inhaltOriginal, 'Unterschiede nur durch index.html#lernpfad -> lernpfad.html');
    assert.equal(q.inhalt, umschreiben(q.inhaltOriginal, ''));
    /* 2. geschützte Blöcke unverändert und gleich oft */
    for (const re of GESCHUETZT) {
      for (const block of q.inhaltOriginal.match(re) || []) {
        assert.equal(zaehle(q.inhalt, block), zaehle(q.inhaltOriginal, block), `geschützter Block verändert: ${block.slice(0, 80)}`);
      }
    }
    /* 3. gebautes HTML */
    if (distDa) {
      /* dist wurde ggf. mit VIDEO_BASIS gebaut: dann mit derselben Umschreibung vergleichen */
      const inhaltDist = umschreiben(q.inhaltOriginal, process.env.VIDEO_BASIS || '');
      const d = fs.readFileSync(path.join(DIST, s), 'utf8');
      assert.equal(zaehle(d, inhaltDist), 1, 'dist enthält den Inhalt genau einmal byte-genau');
      const nachInhalt = d.slice(d.indexOf(inhaltDist) + inhaltDist.length);
      let pos = 0;
      for (const sk of q.skripte.filter((x) => !(x.src && /assets\/js\/speicher\.js$/.test(x.src)))) {
        const i = nachInhalt.indexOf(sk.roh, pos);
        assert.ok(i >= 0, `Bestandsskript fehlt oder falsche Reihenfolge: ${sk.roh.slice(0, 80)}`);
        pos = i + sk.roh.length;
      }
      const iSpeicher = d.search(/<script src="(?:\.\.\/)*assets\/js\/speicher\.js"><\/script>/);
      const iKern = d.search(/<script src="(?:\.\.\/)*app\/kern\.js\?v=[0-9a-f]{12}"><\/script>/);
      const iErstes = q.skripte.find((x) => !(x.src && /speicher\.js$/.test(x.src)));
      assert.ok(iSpeicher > 0 && iKern > iSpeicher, 'speicher.js vor kern.js (mit Versions-Hash)');
      if (iErstes) assert.ok(d.indexOf(iErstes.roh) > iKern, 'kern.js vor den Bestandsskripten');
      assert.equal(zaehle(d, '__KURS_'), 0, 'keine Platzhalter mehr im HTML');
    }
  });
}

test('VIDEO_BASIS schreibt nur <source …/assets/video/X.mp4> um', () => {
  const rel = 'lektionen/v01-warum-programmieren.html';
  const text = fs.readFileSync(path.join(SITE, rel), 'utf8');
  const ohne = zerlegeText(text, rel, { videoBasis: '' });
  const mit = zerlegeText(text, rel, { videoBasis: 'https://speicher.example/video/' });
  assert.match(mit.inhalt, /<source src="https:\/\/speicher\.example\/video\/v01-theorie\.mp4"/);
  assert.doesNotMatch(mit.inhalt, /assets\/video\/[^"]+\.mp4"/);
  const zurueck = mit.inhalt.replace(/https:\/\/speicher\.example\/video\/([^"/]+\.mp4)"/g, '../assets/video/$1"');
  assert.equal(zurueck, ohne.inhalt, 'sonst nichts verändert (Poster und Untertitel bleiben)');
});

test('Zerlegen bricht bei unerwartetem Aufbau ab', () => {
  assert.throws(() => zerlegeText('<html><head></head><body><main id="inhalt"></main></body></html>', 'x.html'), /footer/);
});
