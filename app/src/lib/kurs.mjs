/* kurs.yaml lesen und prüfen. Eine Quelle für den Kurs (Vertrag, Abschnitt 16):
     semester   die zwei Semester
     einheiten  der Stoff (P1–P11, T1–T11) mit Blöcken; optional stoff: Lektionen, die bis zum Neubau als Material
                zu den Terminen der Einheit gehören (seit dem Entfernen des alten Kurses nennt keine Einheit welche)
     termine    die 20 Termine des Plans, je 4 Blöcke
     lektionen  Seiten, die es gibt (Lerneinheit, Labor, Notebook): je fertigem Termin NN die Lektion VNN.
                aktiv: false = gebaut, aber nirgends angeboten (zurzeit bei keiner Lektion gesetzt); ein Termin darf
                trotzdem darauf zeigen: Er hat dann lektion: null und entwurf: 'VNN' (Entwurf, siehe terminLektion)
   In der Hülle heißt eine Lektion mit Seiten an vielen Stellen noch „termin“ (terminZuDatei, App.astro):
   gemeint ist dort immer ein Eintrag aus lektionen. */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { APP, SITE } from './pfade.mjs';

export const TERMINE = 20;
export const BLOECKE_JE_TERMIN = 4;

let zwischen = null;

function fehler(t) { throw new Error('kurs.yaml: ' + t); }
const zwei = (n) => String(n).padStart(2, '0');

/* Wohin zeigt „lektion: VNN“ an einem Termin? Aktive Lektion: lektion; abgeschaltete (aktiv: false): Entwurf,
   der Termin hat dann noch keine Seiten im Angebot. Nur diese Zuordnung, ohne Dateien (testbar mit Testdaten). */
export function terminLektion(nr, lektionen) {
  if (nr == null || nr === '') return { lektion: null, entwurf: null };
  const l = lektionen.find((x) => x.nr === String(nr));
  if (!l) return { lektion: null, entwurf: null, fehlt: true };
  return l.aktiv ? { lektion: l.nr, entwurf: null } : { lektion: null, entwurf: l.nr };
}

export function ladeKurs() {
  if (zwischen) return zwischen;
  const roh = YAML.parse(fs.readFileSync(path.join(APP, 'kurs.yaml'), 'utf8'));
  for (const k of ['semester', 'einheiten', 'termine', 'lektionen']) if (!roh || roh[k] == null) fehler(`Abschnitt ${k} fehlt`);

  const semester = roh.semester.map((s) => ({ nr: s.nr, name: String(s.name), bereich: String(s.bereich || ''), leitsatz: String(s.leitsatz || '') }));

  /* ── Lektionen: Seiten, die es gibt ── */
  const lektionen = roh.lektionen.map((t, i) => {
    const nr = String(t.nr || '');
    if (!/^V\d\d$/.test(nr)) fehler(`Lektion ${i + 1}: nr "${nr}" ist ungültig`);
    for (const k of ['titel', 'kurz', 'hook', 'lerneinheit']) if (!t[k]) fehler(`${nr}: Feld ${k} fehlt`);
    if (!semester.some((s) => s.nr === t.semester)) fehler(`${nr}: Semester ${t.semester} unbekannt`);
    /* Quelle einer Lektionsseite: app/inhalte/vNN/<feld>.mdx; eine Seite unter site/lektionen/<datei> würde auch gelten
       (so kam der alte Kurs in die App; dort liegt nichts mehr) */
    const pruefe = (ordner, datei, feld) => {
      if (datei == null) return null;
      const p = path.join(SITE, ordner, datei);
      const mdx = ordner === 'lektionen' ? path.join(APP, 'inhalte', nr.toLowerCase(), feld + '.mdx') : null;
      if (!fs.existsSync(p) && !(mdx && fs.existsSync(mdx))) fehler(`${nr}: ${feld} "${ordner}/${datei}" existiert nicht (auch nicht als inhalte/${nr.toLowerCase()}/${feld}.mdx)`);
      return String(datei);
    };
    let freigabe = t.freigabe == null ? null : t.freigabe;
    if (freigabe instanceof Date) freigabe = freigabe.toISOString().slice(0, 10);
    if (freigabe != null && !/^\d{4}-\d\d-\d\d$/.test(String(freigabe))) fehler(`${nr}: freigabe "${freigabe}" ist kein Datum JJJJ-MM-TT`);
    return {
      nr,
      titel: String(t.titel),
      kurz: String(t.kurz),
      hook: String(t.hook),
      python: Array.isArray(t.python) ? t.python.map(String) : [],
      semester: t.semester,
      aktiv: t.aktiv !== false,
      lerneinheit: pruefe('lektionen', t.lerneinheit, 'lerneinheit'),
      labor: pruefe('lektionen', t.labor, 'labor'),
      notebook: pruefe('notebooks', t.notebook, 'notebook'),
      freigabe: freigabe == null ? null : String(freigabe),
    };
  });
  const doppelt = lektionen.map((t) => t.nr).filter((n, i, a) => a.indexOf(n) !== i);
  if (doppelt.length) fehler('doppelte Lektionen: ' + doppelt.join(', '));
  const gibtLektion = (nr) => lektionen.some((l) => l.nr === nr);

  /* ── Einheiten ── */
  const einheiten = Object.entries(roh.einheiten).map(([id, e]) => {
    if (!/^[PT]\d{1,2}$/.test(id)) fehler(`Einheit "${id}": Kennung muss P1…P11 oder T1…T11 sein`);
    if (!e || !e.name || !Number.isInteger(e.bloecke) || e.bloecke < 1) fehler(`${id}: name und bloecke (ganze Zahl) sind Pflicht`);
    const stoff = Array.isArray(e.stoff) ? e.stoff.map(String) : [];
    for (const nr of stoff) if (!gibtLektion(nr)) fehler(`${id}: stoff nennt ${nr}, diese Lektion gibt es nicht`);
    return { id, strang: id[0] === 'P' ? 'programmieren' : 'theorie', name: String(e.name), kurz: String(e.kurz || e.name), bloecke: e.bloecke, stoff };
  });
  const einheit = (id) => einheiten.find((e) => e.id === id);

  /* ── Termine: der Plan ── */
  if (roh.termine.length !== TERMINE) fehler(`erwartet ${TERMINE} Termine, gefunden ${roh.termine.length}`);
  const verplant = new Map(einheiten.map((e) => [e.id, 0]));
  const termine = roh.termine.map((t, i) => {
    if (t.nr !== i + 1) fehler(`Termin an Stelle ${i + 1} hat nr ${t.nr}; die Termine stehen in Reihenfolge 1 bis ${TERMINE}`);
    const wo = `Termin ${zwei(t.nr)}`;
    const teile = [];
    for (const strang of ['theorie', 'programmieren']) {
      for (const [id, bloecke] of Object.entries(t[strang] || {})) {
        const e = einheit(id);
        if (!e) fehler(`${wo}: Einheit ${id} gibt es nicht`);
        if (e.strang !== strang) fehler(`${wo}: ${id} steht unter ${strang}, gehört aber zu ${e.strang}`);
        if (!Number.isInteger(bloecke) || bloecke < 1) fehler(`${wo}: ${id} braucht eine Zahl von Blöcken`);
        verplant.set(id, verplant.get(id) + bloecke);
        teile.push({ einheit: id, strang, name: e.name, kurz: e.kurz, bloecke });
      }
    }
    const puffer = t.puffer == null ? 0 : t.puffer;
    const summe = teile.reduce((s, x) => s + x.bloecke, 0) + puffer;
    if (summe !== BLOECKE_JE_TERMIN) fehler(`${wo}: ${summe} Blöcke statt ${BLOECKE_JE_TERMIN}`);
    const zuordnung = terminLektion(t.lektion, lektionen);
    if (zuordnung.fehlt) fehler(`${wo}: lektion ${t.lektion} gibt es nicht`);
    const { lektion, entwurf } = zuordnung;
    let freigabe = t.freigabe == null ? null : t.freigabe;
    if (freigabe instanceof Date) freigabe = freigabe.toISOString().slice(0, 10);
    if (freigabe != null && !/^\d{4}-\d\d-\d\d$/.test(String(freigabe))) fehler(`${wo}: freigabe "${freigabe}" ist kein Datum JJJJ-MM-TT`);
    /* Material aus stoff: die Lektionen, die die Einheiten des Termins nennen (ohne Doppelte, ohne abgeschaltete).
       Zurzeit immer leer, weil keine Einheit stoff angibt. */
    const stoff = [];
    for (const x of teile) for (const nr of einheit(x.einheit).stoff) if (!stoff.includes(nr) && lektionen.find((l) => l.nr === nr).aktiv) stoff.push(nr);
    return { nr: t.nr, kennung: zwei(t.nr), semester: t.nr <= TERMINE / 2 ? 1 : 2, teile, puffer, lektion, entwurf, stoff: lektion || entwurf ? [] : stoff, freigabe: freigabe == null ? null : String(freigabe) };
  });
  for (const e of einheiten) if (verplant.get(e.id) !== e.bloecke) fehler(`${e.id}: ${verplant.get(e.id)} Blöcke in den Terminen, laut Einheit ${e.bloecke}`);
  /* Teil x von y, wenn eine Einheit über mehrere Termine läuft */
  for (const e of einheiten) {
    const stellen = termine.flatMap((t) => t.teile.filter((x) => x.einheit === e.id));
    stellen.forEach((x, i) => { x.teil = i + 1; x.vonTeilen = stellen.length; });
  }

  zwischen = { semester, einheiten, termine, lektionen };
  return zwischen;
}

/* Lektion zu einer Seitendatei (z. B. 'v01-labor.html') -> {termin: Lektion, art: 'lerneinheit'|'labor'} */
export function terminZuDatei(datei) {
  const { lektionen } = ladeKurs();
  for (const t of lektionen) {
    if (t.lerneinheit === datei) return { termin: t, art: 'lerneinheit' };
    if (t.labor === datei) return { termin: t, art: 'labor' };
  }
  return null;
}

/* Nachbar in derselben Ansicht: Labor -> Labor der Nachbarlektion, sonst deren Lerneinheit */
export function nachbar(nr, richtung, art) {
  /* Nachbarn nur unter Lektionen mit demselben Zustand: von einer aktiven Lektion führt kein Pfeil zu einer abgeschalteten */
  const alle = ladeKurs().lektionen;
  const selbst = alle.find((t) => t.nr === nr);
  const lektionen = alle.filter((t) => t.aktiv === (selbst ? selbst.aktiv : true));
  const i = lektionen.findIndex((t) => t.nr === nr);
  const n = lektionen[i + richtung];
  if (!n) return null;
  const datei = art === 'labor' && n.labor ? n.labor : n.lerneinheit;
  return { termin: n, datei, art: datei === n.labor ? 'labor' : 'lerneinheit' };
}
