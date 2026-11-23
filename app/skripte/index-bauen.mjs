/* =============================================================
   index-bauen.mjs – Daten aus kurs.yaml und den site/-Seiten (Vertrag, Abschnitt 3)
     dist/app/daten/kurs.json     Termine mit Abschnitten und Aufgaben
     dist/app/daten/suche.json    Lektionen, Abschnitte, Aufgaben, Bibliothek, Glossar
     dist/app/daten/glossar.json  alle abbr.k-begriff[data-erklaerung], je Begriff die erste Lektion
     api/daten/aufgaben.json      Aufgabentexte und Musterlösungen für den Tutor (nicht öffentlich!)
                                  und die Kursstruktur (Feld kurs) für das Gruppenbild der Dozierenden
   Parser (node-html-parser) nur zum Lesen; Inhalte werden hier nicht neu geschrieben.
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { SITE, DIST, API_DATEN } from '../src/lib/pfade.mjs';
import { ladeKurs } from '../src/lib/kurs.mjs';
import { alleSeiten, seitenHtml } from '../src/lib/quelle.mjs';

const leer = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const kuerzen = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …' : s);
const zahl = (s) => (/^\d+$/.test(String(s || '')) ? parseInt(s, 10) : null);

function lies(rel) { return parse(seitenHtml(rel), { comment: false, blockTextElements: { script: true, style: true, pre: true, textarea: true } }); }

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

/* ── Glossar: eine Quelle für glossar.json, suche.json und glossar.astro ─────────────
   Sammlung: alle abbr.k-begriff[data-erklaerung] in Kursreihenfolge (je Termin Lerneinheit vor
   Labor), danach die übrigen Seiten; je Begriff (ohne Groß/Klein) gilt die erste Fundstelle.
   Singular/Plural-Dubletten (Datei/Dateien, Argument/Argumente) werden zusammengeführt, wenn die
   eine Form die andere plus Endung -e, -n, -en, -s oder -es ist (außer NIE_ZUSAMMEN: gleiche
   Schreibweise, andere Bedeutung). Es bleibt die kürzere Form mit der Erklärung der früheren
   Fundstelle; die anderen Formen stehen in `formen` und behalten ihren Anker in `aliase`. */
const ENDUNGEN = ['e', 'n', 'en', 's', 'es'];
const NIE_ZUSAMMEN = new Set(['schlüssel']);   /* Schlüssel (dict, V08) und Schlüsseln (Kryptografie, V18) */
export const glossarSlug = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'begriff';

export function glossarSammler() {
  const sammlung = new Map();
  let nr = 0;
  return {
    sammle(dom, rel, lektion) {
      dom.querySelectorAll('abbr.k-begriff[data-erklaerung]').forEach((a) => {
        const begriff = leer(a.textContent);
        if (!begriff) return;
        const k = begriff.toLowerCase();
        if (sammlung.has(k)) return;
        sammlung.set(k, { begriff, erklaerung: leer(a.getAttribute('data-erklaerung')), lektion, url: rel, _nr: nr++ });
      });
    },
    liste() {
      /* Dubletten: Grundform suchen (kürzeste Form, von der die anderen per Endung abgeleitet sind) */
      const grund = new Map();
      for (const k of sammlung.keys()) {
        let g = k;
        for (const e of ENDUNGEN) {
          const kurz = k.slice(0, -e.length);
          if (k.endsWith(e) && kurz.length >= 3 && sammlung.has(kurz) && !NIE_ZUSAMMEN.has(kurz) && kurz.length < g.length) g = kurz;
        }
        grund.set(k, g);
      }
      const gruppen = new Map();
      for (const [k, g] of grund) { if (!gruppen.has(g)) gruppen.set(g, []); gruppen.get(g).push(sammlung.get(k)); }
      const vergeben = new Set();
      const id = (b) => { let x = 'g-' + glossarSlug(b), i = 2; while (vergeben.has(x)) x = 'g-' + glossarSlug(b) + '-' + i++; vergeben.add(x); return x; };
      return [...gruppen.entries()].map(([g, formen]) => {
        formen.sort((a, b) => a._nr - b._nr);
        const erste = formen[0], haupt = sammlung.get(g);
        return { begriff: haupt.begriff, erklaerung: erste.erklaerung, lektion: erste.lektion, url: erste.url, formen: formen.filter((f) => f !== haupt).map((f) => f.begriff) };
      }).sort((a, b) => a.begriff.localeCompare(b.begriff, 'de')).map((g) => ({ id: id(g.begriff), ...g }))
        .map((g) => ({ ...g, aliase: g.formen.map((f) => 'g-' + glossarSlug(f)).filter((a) => !vergeben.has(a) && vergeben.add(a)) }))
        .map(({ formen, aliase, ...g }) => (formen.length ? { ...g, formen, aliase } : g));
    },
  };
}

/* Glossar ohne den übrigen Index (für glossar.astro, das beim Astro-Build vor index-bauen läuft) */
export function sammleGlossar() {
  const { termine } = ladeKurs();
  const g = glossarSammler();
  for (const t of termine) {
    g.sammle(lies(`lektionen/${t.lerneinheit}`), `lektionen/${t.lerneinheit}`, t.nr);
    if (t.labor) g.sammle(lies(`lektionen/${t.labor}`), `lektionen/${t.labor}`, t.nr);
  }
  for (const rel of alleSeiten().filter((r) => !r.startsWith('lektionen/'))) g.sammle(lies(rel), rel, null);
  return g.liste();
}

export default function indexBauen() {
  const { phasen, termine } = ladeKurs();
  const suche = [];
  const glossar = glossarSammler();
  const aufgabenApi = [];
  const kursApi = [];
  const erlaubtBis = [];

  const begriffe = (dom, rel, lektion) => glossar.sammle(dom, rel, lektion);

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
    /* Kursstruktur für das Gruppenbild der Dozierenden (api/src/lib/kursstruktur.js) */
    const quiz = le.querySelector('[data-quiz]');
    kursApi.push({ nr: t.nr, quiz: quiz ? quiz.getAttribute('data-quiz') : null, abschnitte: abschnitte.map((a) => a.id), stationen: aufgaben.map((a) => ({ id: a.id, teil: a.teil, pruefbar: a.pruefbar })) });
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

  const glossarListe = glossar.liste();
  for (const g of glossarListe) suche.push({ typ: 'glossar', titel: g.begriff, text: (g.formen ? 'Auch: ' + g.formen.join(', ') + '. ' : '') + kuerzen(g.erklaerung, 140), url: `glossar.html#${g.id}`, lektion: g.lektion });

  const daten = path.join(DIST, 'app', 'daten');
  schreibe(path.join(daten, 'kurs.json'), { phasen, termine: kursTermine });
  schreibe(path.join(daten, 'suche.json'), { eintraege: suche });
  schreibe(path.join(daten, 'glossar.json'), { begriffe: glossarListe });
  schreibe(path.join(API_DATEN, 'aufgaben.json'), { erstellt: new Date().toISOString(), aufgaben: aufgabenApi, kurs: kursApi });
  const nA = kursTermine.reduce((s, t) => s + t.aufgaben.length, 0);
  console.log(`index-bauen: ${kursTermine.length} Termine, ${nA} Labor-Aufgaben, ${suche.length} Sucheinträge, ${glossarListe.length} Begriffe, ${aufgabenApi.length} Aufgaben mit Lösung für den Tutor`);
}
