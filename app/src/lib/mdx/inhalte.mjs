/* =============================================================
   inhalte.mjs – wo liegt die MDX-Quelle einer Lektionsseite?
     lektionen/v01-ablauf-und-erste-programme.html  ->  app/inhalte/v01/lerneinheit.mdx
     lektionen/v01-labor.html                       ->  app/inhalte/v01/labor.mdx
   Dateinamen der Seiten stehen weiter in kurs.yaml; die Adressen ändern sich nicht.
   Gibt es die MDX-Datei, ist sie die Quelle. Alle Lektionen sind MDX; unter site/lektionen/ liegt nichts mehr.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { APP } from '../pfade.mjs';
import { ladeKurs, terminZuDatei } from '../kurs.mjs';
import { kompiliere } from './kompilieren.mjs';

export const INHALTE = path.join(APP, 'inhalte');

/** Pfad der MDX-Datei zu einer Seite (relativ zu site/) oder null. */
export function mdxDatei(relPfad) {
  const m = /^lektionen\/([^/]+)$/.exec(relPfad);
  const zu = m ? terminZuDatei(m[1]) : null;
  if (!zu) return null;
  const p = path.join(INHALTE, zu.termin.nr.toLowerCase(), zu.art + '.mdx');
  return fs.existsSync(p) ? p : null;
}

/** Alle Lektionsseiten (relativ zu site/), deren Quelle MDX ist. */
export function mdxSeiten() {
  return ladeKurs().lektionen.flatMap((t) => [t.lerneinheit, t.labor]).filter(Boolean).map((d) => 'lektionen/' + d).filter((r) => mdxDatei(r));
}

/* Übersetzen ist teuer genug, um es je Datei und Änderungszeit nur einmal zu tun */
const gemerkt = new Map();
export function ladeMdx(relPfad) {
  const datei = mdxDatei(relPfad);
  if (!datei) return null;
  const zeit = fs.statSync(datei).mtimeMs;
  const g = gemerkt.get(datei);
  if (g && g.zeit === zeit) return g.q;
  const q = kompiliere(datei, relPfad);
  gemerkt.set(datei, { zeit, q });
  return q;
}
