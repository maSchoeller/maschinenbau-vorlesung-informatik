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
import { SITE, DIST, APP } from '../../src/lib/pfade.mjs';
import { mdxDatei, mdxSeiten } from '../../src/lib/mdx/inhalte.mjs';
import { ladeKurs } from '../../src/lib/kurs.mjs';
import { unterschied } from '../../src/lib/mdx/vergleich.mjs';

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
  /* die Werkzeug- und Klausurseiten aus site/ und alle Lektionsseiten aus kurs.yaml (Quelle: MDX) */
  for (const s of ['bibliothek.html', 'pap-editor.html']) assert.ok(seiten.includes(s), `${s} fehlt`);
  const lektionsseiten = ladeKurs().lektionen.flatMap((l) => [l.lerneinheit, l.labor]).filter(Boolean).map((d) => 'lektionen/' + d);
  assert.ok(lektionsseiten.length >= 2, 'kurs.yaml nennt keine Lektionsseiten');
  for (const s of lektionsseiten) assert.ok(seiten.includes(s), `${s} fehlt`);
  assert.deepEqual(seiten.filter((s) => s.startsWith('lektionen/')).sort(), lektionsseiten.sort(), 'unter lektionen/ steht nur, was kurs.yaml nennt');
  assert.deepEqual(mdxSeiten().sort(), lektionsseiten.sort(), 'jede Lektionsseite hat eine MDX-Quelle');
  assert.ok(!seiten.includes('werkzeuge/labor-test.html'));
  assert.ok(!seiten.includes('klausurtrainer.html'), 'der Klausurtrainer des alten Kurses ist entfernt');
  assert.ok(!seiten.includes('probeklausur-2026-27.html'), 'die Probeklausur des alten Kurses ist entfernt');
});

for (const s of seiten) {
  if (mdxDatei(s)) continue;   /* MDX-Quelle: eigene Tests weiter unten */
  test(`byte-genau: ${s}`, () => {
    const q = zerlege(s, { videoBasis: '' });
    if (q.weiterleitung) return;
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
  });
}

/* Lektionen mit MDX-Quelle: übersetzbar, mit Inhalt und Skripten. Läge unter site/lektionen/ noch eine
   Seite gleichen Namens daneben, müsste das Ergebnis für den Browser dasselbe sein (src/lib/mdx/vergleich.mjs);
   seit dem Entfernen des alten Kurses gibt es dort keine Seiten mehr. */
for (const s of mdxSeiten()) {
  test(`mdx: ${s}`, () => {
    const q = zerlege(s, { videoBasis: '' });
    assert.ok(q.mdx && q.inhalt.includes('id="inhalt"'), 'Inhalt mit id="inhalt"');
    assert.ok(q.titel && q.stylesheets.length >= 2 && q.skripte.length >= 2, 'Titel, Stylesheets und Skripte im Kopf');
    assert.ok(q.skripte.some((x) => x.src && /assets\/js\/speicher\.js$/.test(x.src)), 'speicher.js steht in der Skriptliste');
    assert.doesNotMatch(q.inhalt, /<x-[a-z]+/, 'kein Teil-Baustein außerhalb seines Bausteins (Erklaerung, Ohne)');
    const alt = path.join(SITE, s);
    if (fs.existsSync(alt)) {
      const o = zerlegeText(fs.readFileSync(alt, 'utf8'), s, { videoBasis: '' });
      assert.equal(unterschied(o.inhaltOriginal, q.inhaltOriginal), null, 'MDX weicht von der alten site/-Seite ab');
    }
  });
}

/* 3. gebautes HTML: ohne Ausgabeordner ausdrücklich übersprungen (nicht stillschweigend bestanden) */
const OHNE_DIST = distDa ? false : `kein Ausgabeordner ${path.relative(process.cwd(), DIST) || DIST}: erst bauen (npm run build bzw. KURS_AUSGABE=…)`;
for (const s of seiten) {
  test(`gebaut: ${s}`, { skip: OHNE_DIST }, () => {
    const q = zerlege(s, { videoBasis: '' });
    if (q.weiterleitung) {
      assert.equal(fs.readFileSync(path.join(DIST, s), 'utf8'), q.original, 'Weiterleitung unverändert übernommen');
      return;
    }
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
    /* Jede Seite hat eine h1 (Laborseiten: von der Hülle, nur für Screenreader) */
    assert.ok(/<h1[\s>]/.test(d), 'h1 fehlt');
  });
}

test('VIDEO_BASIS schreibt nur <source …/assets/video/X.mp4> um', () => {
  /* a) an einer echten Lektionsseite (Termin 01, Quelle MDX) */
  const rel = 'lektionen/v01-ablauf-und-erste-programme.html';
  const ohne = zerlege(rel, { videoBasis: '' });
  const mit = zerlege(rel, { videoBasis: 'https://speicher.example/video/' });
  assert.match(ohne.inhalt, /<source src="\.\.\/assets\/video\/v01-theorie\.mp4"/, 'die Seite bindet ihr Video ein');
  assert.match(mit.inhalt, /<source src="https:\/\/speicher\.example\/video\/v01-theorie\.mp4"/);
  assert.doesNotMatch(mit.inhalt, /assets\/video\/[^"]+\.mp4"/);
  assert.match(mit.inhalt, /poster="\.\.\/assets\/video\/v01-theorie-poster\.png"/, 'Poster bleibt in der App');
  const zurueck = mit.inhalt.replace(/https:\/\/speicher\.example\/video\/([^"/]+\.mp4)"/g, '../assets/video/$1"');
  assert.equal(zurueck, ohne.inhalt, 'sonst nichts verändert (Poster und Untertitel bleiben)');
  /* b) derselbe Weg für eine Seite aus site/ (zerlegeText): nur <source> wird umgeschrieben */
  const html = '<html><head><title>T</title></head><body><header class="dhbw-header"></header><main id="inhalt">'
    + '<video poster="../assets/video/x-poster.png"><source src="../assets/video/x.mp4" type="video/mp4"><track src="../assets/video/x.vtt"></video>'
    + '<a href="../assets/video/x.mp4">laden</a></main><footer class="dhbw-footer"></footer></body></html>';
  const s = zerlegeText(html, 'lektionen/x.html', { videoBasis: 'https://speicher.example/video' });
  assert.match(s.inhalt, /<source src="https:\/\/speicher\.example\/video\/x\.mp4" type="video\/mp4">/);
  assert.match(s.inhalt, /poster="\.\.\/assets\/video\/x-poster\.png"/);
  assert.match(s.inhalt, /<track src="\.\.\/assets\/video\/x\.vtt">/);
  assert.match(s.inhalt, /<a href="\.\.\/assets\/video\/x\.mp4">/, 'Verweise außerhalb von <source> bleiben');
  assert.equal(zerlegeText(html, 'lektionen/x.html', { videoBasis: '' }).inhalt, s.inhaltOriginal);
});

test('Zerlegen bricht bei unerwartetem Aufbau ab', () => {
  assert.throws(() => zerlegeText('<html><head></head><body><main id="inhalt"></main></body></html>', 'x.html'), /footer/);
});

/* CSP: nur das eine Storage-Konto aus VIDEO_BASIS, nie *.blob.core.windows.net (Befund Sicherheit) */
test('CSP: Storage-Platzhalter wird beim Build ersetzt', async () => {
  const { configMitCsp } = await import('../assets-kopieren.mjs');
  const quelle = fs.readFileSync(path.join(APP, 'staticwebapp.config.json'), 'utf8');
  const ohne = JSON.parse(configMitCsp(quelle, '')).globalHeaders['Content-Security-Policy'];
  assert.doesNotMatch(ohne, /blob\.core\.windows\.net/);
  assert.match(ohne, /connect-src 'self';/);
  const mit = JSON.parse(configMitCsp(quelle, 'https://kursvideos.blob.core.windows.net/video')).globalHeaders['Content-Security-Policy'];
  assert.match(mit, /connect-src 'self' https:\/\/kursvideos\.blob\.core\.windows\.net;/);
  assert.match(mit, /media-src 'self' blob: https:\/\/kursvideos\.blob\.core\.windows\.net;/);
  assert.doesNotMatch(mit, /\*/);
  assert.throws(() => configMitCsp(quelle, 'http://unsicher.example/video'));
});
test('CSP im Ausgabeordner ohne Platzhalter', { skip: OHNE_DIST }, () => {
  const csp = JSON.parse(fs.readFileSync(path.join(DIST, 'staticwebapp.config.json'), 'utf8')).globalHeaders['Content-Security-Policy'];
  assert.doesNotMatch(csp, /\*\./, 'kein Platzhalter mit *');
});
