/* =============================================================
   index-bauen.mjs – Daten aus kurs.yaml und den site/-Seiten (Vertrag, Abschnitt 3)
     dist/app/daten/kurs.json     Termine mit Abschnitten und Aufgaben
     dist/app/daten/suche.json    Lektionen, Abschnitte, Aufgaben, Bibliothek, Glossar
     dist/app/daten/glossar.json  alle abbr.k-begriff[data-erklaerung], je Begriff die erste Lektion
     api/daten/aufgaben.json      Aufgabentexte und Musterlösungen für den Tutor (nicht öffentlich!)
   Parser (node-html-parser) nur zum Lesen; Inhalte werden hier nicht neu geschrieben.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { SITE, DIST, API_DATEN } from '../src/lib/pfade.mjs';
import { ladeKurs } from '../src/lib/kurs.mjs';
import { alleSeiten } from '../src/lib/quelle.mjs';

const leer = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const kuerzen = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …' : s);
const zahl = (s) => (/^\d+$/.test(String(s || '')) ? parseInt(s, 10) : null);

function lies(rel) { return parse(fs.readFileSync(path.join(SITE, rel), 'utf8'), { comment: false, blockTextElements: { script: true, style: true, pre: true, textarea: true } }); }

/* Klartext eines Elements ohne Skripte, Editoren und Steuerknöpfe */
function klartext(el) {
  if (!el) return '';
  const k = parse(el.toString(), { blockTextElements: { script: true, style: true, pre: true, textarea: true } });
  k.querySelectorAll('script, style, button, .a-hints, textarea').forEach((n) => n.remove());
  return leer(k.textContent);
}

function schreibe(datei, daten) {
  fs.mkdirSync(path.dirname(datei), { recursive: true });
  fs.writeFileSync(datei, JSON.stringify(daten) + '\n');
}

export default function indexBauen() {
  const { phasen, termine } = ladeKurs();
  const suche = [];
  const glossar = new Map();
  const aufgabenApi = [];
  const erlaubtBis = [];

  /* Glossar: Begriffe in Kursreihenfolge sammeln (Lerneinheit vor Labor), danach die übrigen Seiten */
  function begriffe(dom, rel, lektion) {
    dom.querySelectorAll('abbr.k-begriff[data-erklaerung]').forEach((a) => {
      const begriff = leer(a.textContent);
      if (!begriff) return;
      const schluessel = begriff.toLowerCase();
      if (glossar.has(schluessel)) return;
      glossar.set(schluessel, { begriff, erklaerung: leer(a.getAttribute('data-erklaerung')), lektion, url: rel });
    });
  }

  const kursTermine = termine.map((t) => {
    erlaubtBis.push(...t.python);
    const erlaubt = [...erlaubtBis];
    const le = lies(`lektionen/${t.lerneinheit}`);
    const abschnitte = le.querySelectorAll('.k-section[data-section]').map((s) => {
      const h = s.querySelector('h2');
      const titel = h ? leer(h.textContent.replace(/^\s*\d+\s*/, '')) : s.getAttribute('data-section');
      return { id: s.getAttribute('data-section'), anker: s.getAttribute('id') || null, titel };
    });
    const leUrl = `lektionen/${t.lerneinheit}`;
    suche.push({ typ: 'lektion', titel: `${t.nr} · ${t.kurz}`, text: t.hook, url: leUrl, lektion: t.nr });
    abschnitte.forEach((a) => { if (a.anker) suche.push({ typ: 'abschnitt', titel: a.titel, text: `${t.nr} · ${t.kurz}`, url: `${leUrl}#${a.anker}`, lektion: t.nr }); });
    begriffe(le, leUrl, t.nr);

    /* Aufgaben der Lerneinheit mit Musterlösung (z. B. Code im Selbstcheck) nur für den Tutor */
    le.querySelectorAll('[data-a][data-id]').forEach((a) => {
      const sol = a.querySelectorAll('script[data-role="solution"]').map((s) => s.textContent.replace(/^\n+|\s+$/g, ''));
      if (!sol.length) return;
      aufgabenApi.push({ lektion: t.nr, seite: 'lerneinheit', id: a.getAttribute('data-id'), ids: [a.getAttribute('data-id')], titel: kuerzen(klartext(a.querySelector('.a-task__text, .k-q__text')) || a.getAttribute('data-id'), 120), text: klartext(a.querySelector('.a-task__text') || a), loesung: sol.join('\n\n'), erlaubt });
    });

    let aufgaben = [];
    if (t.labor) {
      const lab = lies(`lektionen/${t.labor}`);
      const labUrl = `lektionen/${t.labor}`;
      begriffe(lab, labUrl, t.nr);
      aufgaben = lab.querySelectorAll('section.l-task').map((s) => {
        const pruefbar = s.querySelectorAll('[data-a][data-id]').filter((n) => n.getAttribute('data-count') !== '0').map((n) => n.getAttribute('data-id'));
        const a = { id: s.getAttribute('id'), titel: leer(s.getAttribute('data-title')), teil: s.getAttribute('data-part') || null, sterne: zahl(s.getAttribute('data-stars')), minuten: zahl(s.getAttribute('data-min')), extra: leer(s.getAttribute('data-extra')) || null, pruefbar };
        suche.push({ typ: 'aufgabe', titel: a.titel, text: `${t.nr} Labor${a.teil === 'B' ? ' · Training' : ''}`, url: `${labUrl}#${a.id}`, lektion: t.nr });
        const sol = s.querySelectorAll('script[data-role="solution"]').map((x) => x.textContent.replace(/^\n+|\s+$/g, ''));
        if (sol.length) {
          const text = [klartext(s.querySelector('.l-task__intro')), ...s.querySelectorAll('.a-task__text').map(klartext)].filter(Boolean).join('\n\n');
          aufgabenApi.push({ lektion: t.nr, seite: 'labor', id: a.id, ids: pruefbar, titel: a.titel, text, loesung: sol.join('\n\n'), erlaubt });
        }
        return a;
      });
    }
    return {
      nr: t.nr, titel: t.titel, kurz: t.kurz, hook: t.hook, python: t.python, phase: t.phase, freigabe: t.freigabe,
      lerneinheit: leUrl, labor: t.labor ? `lektionen/${t.labor}` : null, notebook: t.notebook ? `notebooks/${t.notebook}` : null,
      abschnitte, aufgaben,
    };
  });

  /* Übrige Seiten: Begriffe ohne Lektion */
  for (const rel of alleSeiten().filter((r) => !r.startsWith('lektionen/'))) begriffe(lies(rel), rel, null);

  /* Bibliothek */
  const bib = JSON.parse(fs.readFileSync(path.join(SITE, 'assets/data/bibliothek.json'), 'utf8'));
  for (const e of bib.eintraege || []) suche.push({ typ: 'bibliothek', titel: e.name, text: kuerzen(leer(e.kurz), 140), url: `bibliothek.html#${encodeURIComponent(e.id)}`, lektion: e.eingefuehrt || null });

  /* id: Anker auf glossar.html (klein, Leerzeichen und Sonderzeichen -> '-') */
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'begriff';
  const vergeben = new Set();
  const glossarListe = [...glossar.values()].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de')).map((g) => {
    let id = 'g-' + slug(g.begriff), i = 2;
    while (vergeben.has(id)) id = 'g-' + slug(g.begriff) + '-' + i++;
    vergeben.add(id);
    return { id, ...g };
  });
  for (const g of glossarListe) suche.push({ typ: 'glossar', titel: g.begriff, text: kuerzen(g.erklaerung, 140), url: `glossar.html#${g.id}`, lektion: g.lektion });

  const daten = path.join(DIST, 'app', 'daten');
  schreibe(path.join(daten, 'kurs.json'), { phasen, termine: kursTermine });
  schreibe(path.join(daten, 'suche.json'), { eintraege: suche });
  schreibe(path.join(daten, 'glossar.json'), { begriffe: glossarListe });
  schreibe(path.join(API_DATEN, 'aufgaben.json'), { erstellt: new Date().toISOString(), aufgaben: aufgabenApi });
  const nA = kursTermine.reduce((s, t) => s + t.aufgaben.length, 0);
  console.log(`index-bauen: ${kursTermine.length} Termine, ${nA} Labor-Aufgaben, ${suche.length} Sucheinträge, ${glossarListe.length} Begriffe, ${aufgabenApi.length} Aufgaben mit Lösung für den Tutor`);
}
