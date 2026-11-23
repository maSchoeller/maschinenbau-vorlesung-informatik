/* Glossar-Daten für glossar.astro (Rolle Navigation).
   Die Sammlung kommt aus derselben Funktion wie glossar.json und suche.json (skripte/index-bauen.mjs,
   sammleGlossar), damit die Anker glossar.html#<id> der Suche stimmen. Hier nur Gruppierung A bis Z. */
import { sammleGlossar } from '../../../skripte/index-bauen.mjs';

export function glossarDaten() {
  const liste = sammleGlossar();

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
