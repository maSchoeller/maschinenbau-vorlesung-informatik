'use strict';
// Gruppenbild für Dozierende: verdichtet den Lernstand ALLER Konten zu Anzahlen je Lektion,
// Abschnitt und Labor-Station. Es verlassen nur Anzahlen den Server, nie Kennungen, nie Code.
//
// Regeln:
//   - Gezählt wird, wer mit Konto lernt (Gäste haben keinen Stand auf dem Server).
//   - Unter MINDEST Konten mit Lernstand gibt es keine Zahlen je Lektion (genug: false),
//     damit aus Anteilen nicht auf einzelne Personen geschlossen werden kann.
//   - Zählregel wie in der App (app/public/app/kern.js, Abschnitt Fortschritt): eine Station gilt
//     als gelöst, wenn alle ihre prüfbaren Teile gelöst sind; als begonnen, wenn mindestens ein Teil
//     gelöst oder angefangen ist, aber nicht alle gelöst sind.
//   - Die Eimer (aufg, begonnen, done, quiz-<id>) schreibt der Browser der Studierenden. Sie werden
//     hier nur gegen die Kursstruktur gelesen: fremde Schlüssel zählen nirgends mit.
//
// Kursstruktur (lib/kursstruktur.js): [{nr:'V07', quiz:'v07'|null, abschnitte:[id], stationen:[{id, teil, pruefbar:[id]}]}]

const MINDEST = 5;
const MAX_SCHLUESSEL = 500;   // je Eimer; mehr ist kein echter Lernstand

const klein = (nr) => String(nr).toLowerCase();
const pfad = (nr, schluessel) => `inf-mb/${klein(nr)}/${schluessel}`;

/** Alle Pfade, die das Gruppenbild liest: pfad → {nr, art: 'aufg'|'begonnen'|'done'|'quiz'}. */
function pfade(kurs) {
  const m = new Map();
  for (const t of kurs) {
    m.set(pfad(t.nr, 'aufg'), { nr: t.nr, art: 'aufg' });
    m.set(pfad(t.nr, 'begonnen'), { nr: t.nr, art: 'begonnen' });
    m.set(pfad(t.nr, 'done'), { nr: t.nr, art: 'done' });
    if (t.quiz) m.set(pfad(t.nr, 'quiz-' + t.quiz), { nr: t.nr, art: 'quiz' });
  }
  return m;
}

/** Eimer {id: 1, …} → Menge der gesetzten Schlüssel (nur schlichte Objekte, begrenzt). */
function menge(wert) {
  const s = new Set();
  if (!wert || typeof wert !== 'object' || Array.isArray(wert)) return s;
  let n = 0;
  for (const k of Object.keys(wert)) {
    if (++n > MAX_SCHLUESSEL) break;
    if (wert[k]) s.add(k);
  }
  return s;
}

/** Quiz-Ergebnis {got, total} → Anteil 0..1 oder null. */
function quizAnteil(wert) {
  if (!wert || typeof wert !== 'object') return null;
  const got = Number(wert.got);
  const total = Number(wert.total);
  if (!Number.isFinite(got) || !Number.isFinite(total) || total <= 0 || total > 200 || got < 0 || got > total) return null;
  return got / total;
}

/**
 * @param {Array} kurs      Kursstruktur
 * @param {Array<{benutzerId: string, pfad: string, wert: any}>} docs  Einträge aller Konten zu pfade(kurs)
 * @param {number} [mindest]
 * @returns {{mindest: number, konten: number, genug: boolean, lektionen: Array}}
 */
function berechne(kurs, docs, mindest = MINDEST) {
  const bekannt = pfade(kurs);
  // nr → benutzerId → {aufg, begonnen, done, quiz}
  const jeLektion = new Map(kurs.map((t) => [t.nr, new Map()]));
  for (const d of docs) {
    const ziel = bekannt.get(d.pfad);
    if (!ziel || typeof d.benutzerId !== 'string') continue;
    const konten = jeLektion.get(ziel.nr);
    if (!konten.has(d.benutzerId)) konten.set(d.benutzerId, { aufg: new Set(), begonnen: new Set(), done: new Set(), quiz: null });
    const k = konten.get(d.benutzerId);
    if (ziel.art === 'quiz') k.quiz = quizAnteil(d.wert); else k[ziel.art] = menge(d.wert);
  }

  const alle = new Set();
  const lektionen = kurs.map((t) => {
    const stationen = t.stationen.filter((s) => s.pruefbar.length > 0);
    const gueltig = new Set(stationen.flatMap((s) => s.pruefbar));
    const abschnittIds = new Set(t.abschnitte);
    const zs = stationen.map((s) => ({ id: s.id, geloest: 0, begonnen: 0 }));
    const za = t.abschnitte.map((id) => ({ id, n: 0 }));
    const teile = {};
    for (const s of stationen) if (s.teil && !teile[s.teil]) teile[s.teil] = { stationen: 0, alle: 0, begonnen: 0 };
    for (const s of stationen) if (s.teil) teile[s.teil].stationen++;
    let aktiv = 0;
    let quizN = 0;
    let quizSumme = 0;

    for (const [bid, k] of jeLektion.get(t.nr)) {
      // nur, was zur Kursstruktur gehört, macht ein Konto „aktiv“
      const hatAufg = [...k.aufg, ...k.begonnen].some((id) => gueltig.has(id));
      const hatDone = [...k.done].some((id) => abschnittIds.has(id));
      if (!hatAufg && !hatDone && k.quiz === null) continue;
      aktiv++;
      alle.add(bid);
      const jeTeil = {};
      stationen.forEach((s, i) => {
        const geloest = s.pruefbar.every((id) => k.aufg.has(id));
        const angefangen = s.pruefbar.some((id) => k.aufg.has(id) || k.begonnen.has(id));
        if (geloest) zs[i].geloest++; else if (angefangen) zs[i].begonnen++;
        if (s.teil) {
          const j = (jeTeil[s.teil] = jeTeil[s.teil] || { geloest: 0, angefangen: 0 });
          if (geloest) j.geloest++;
          if (angefangen) j.angefangen++;
        }
      });
      for (const [teil, j] of Object.entries(jeTeil)) {
        if (j.geloest === teile[teil].stationen) teile[teil].alle++;
        else if (j.angefangen > 0) teile[teil].begonnen++;
      }
      t.abschnitte.forEach((id, i) => { if (k.done.has(id)) za[i].n++; });
      if (k.quiz !== null) { quizN++; quizSumme += k.quiz; }
    }

    return {
      nr: t.nr,
      konten: aktiv,
      abschnitte: za,
      stationen: zs,
      teile,
      quiz: quizN ? { konten: quizN, anteil: Math.round((quizSumme / quizN) * 1000) / 1000 } : null,
    };
  });

  const konten = alle.size;
  const genug = konten >= mindest;
  return { mindest, konten, genug, lektionen: genug ? lektionen : [] };
}

module.exports = { berechne, pfade, MINDEST };
