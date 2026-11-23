/* Glossar-Daten für glossar.astro (Rolle Navigation).
   Gleiche Sammelregeln wie skripte/index-bauen.mjs (Begriff = erste Fundstelle in Kursreihenfolge,
   id = 'g-' + slug), weil die Suche auf glossar.html#<id> verlinkt. Beim Build der Seite gibt es
   dist/app/daten/glossar.json noch nicht, deshalb wird hier noch einmal gelesen. */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { SITE } from '../../lib/pfade.mjs';
import { ladeKurs } from '../../lib/kurs.mjs';
import { alleSeiten } from '../../lib/quelle.mjs';

const leer = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const lies = (rel) => parse(fs.readFileSync(path.join(SITE, rel), 'utf8'), { comment: false, blockTextElements: { script: true, style: true, pre: true, textarea: true } });
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'begriff';

export function glossarDaten() {
  const { termine } = ladeKurs();
  const sammlung = new Map();
  const sammle = (dom, rel, lektion) => {
    dom.querySelectorAll('abbr.k-begriff[data-erklaerung]').forEach((a) => {
      const begriff = leer(a.textContent);
      if (!begriff) return;
      const k = begriff.toLowerCase();
      if (sammlung.has(k)) return;
      sammlung.set(k, { begriff, erklaerung: leer(a.getAttribute('data-erklaerung')), lektion, url: rel });
    });
  };
  for (const t of termine) {
    sammle(lies(`lektionen/${t.lerneinheit}`), `lektionen/${t.lerneinheit}`, t.nr);
    if (t.labor) sammle(lies(`lektionen/${t.labor}`), `lektionen/${t.labor}`, t.nr);
  }
  for (const rel of alleSeiten().filter((r) => !r.startsWith('lektionen/'))) sammle(lies(rel), rel, null);

  const vergeben = new Set();
  const liste = [...sammlung.values()].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de')).map((g) => {
    let id = 'g-' + slug(g.begriff), i = 2;
    while (vergeben.has(id)) id = 'g-' + slug(g.begriff) + '-' + i++;
    vergeben.add(id);
    return { id, ...g };
  });

  /* Sortierschlüssel und Buchstabe: erstes Zeichen, das Buchstabe oder Ziffer ist; Zahlen und Sonderfälle unter '#' */
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
  const buchstabe = (b) => {
    const m = /[A-Za-z0-9]/.exec(norm(b));
    const c = m ? m[0].toUpperCase() : '#';
    return /[A-Z]/.test(c) ? c : '#';
  };
  const sortKey = (b) => norm(b).replace(/^[^A-Za-z0-9]+/, '').toLowerCase();
  liste.sort((a, b) => sortKey(a.begriff).localeCompare(sortKey(b.begriff), 'de'));
  const gruppen = new Map();
  for (const g of liste) {
    const b = buchstabe(g.begriff);
    if (!gruppen.has(b)) gruppen.set(b, []);
    gruppen.get(b).push(g);
  }
  const reihenfolge = [...gruppen.keys()].sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)));
  return { gesamt: liste.length, gruppen: reihenfolge.map((b) => ({ buchstabe: b, eintraege: gruppen.get(b) })) };
}
