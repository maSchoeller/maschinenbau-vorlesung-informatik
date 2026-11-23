/* =============================================================
   navigation.mjs – eine Quelle für Bereiche (Leiste) und Reiter (Kopfzeile).
   Architektur-Vertrag, Abschnitt 4.1. Pfade relativ zur Wurzel der App.
   Neuen Reiter anlegen: Eintrag in reiter[] des Bereichs und die Seite in SEITEN eintragen.
   ============================================================= */

export const BEREICHE = [
  { id: 'heute', name: 'Heute', icon: 'home', ziel: 'index.html', reiter: [] },
  {
    id: 'kurs', name: 'Kurs', icon: 'route', ziel: 'lernpfad.html', label: 'Kurs',
    reiter: [
      { id: 'lernpfad', name: 'Lernpfad', ziel: 'lernpfad.html' },
      { id: 'glossar', name: 'Glossar', ziel: 'glossar.html' },
      { id: 'kurs', name: 'Über den Kurs', ziel: 'kurs.html' },
    ],
  },
  {
    id: 'werkbank', name: 'Werkbank', icon: 'code', ziel: 'werkbank.html', label: 'Werkbank',
    reiter: [
      { id: 'werkbank', name: 'Programme', ziel: 'werkbank.html' },
      { id: 'pap-editor', name: 'PAP-Editor', ziel: 'pap-editor.html' },
      { id: '3d-vorschau', name: '3D-Vorschau', ziel: 'werkzeuge/3d-vorschau.html' },
    ],
  },
  { id: 'bibliothek', name: 'Bibliothek', icon: 'book', ziel: 'bibliothek.html', reiter: [] },
  {
    id: 'klausur', name: 'Klausur', icon: 'exam', ziel: 'klausurtrainer.html', label: 'Klausur',
    reiter: [
      { id: 'klausurtrainer', name: 'Klausurtrainer', ziel: 'klausurtrainer.html' },
      { id: 'probeklausur', name: 'Probeklausur', ziel: 'probeklausur-2026-27.html' },
    ],
  },
];

/* Unten in der Leiste */
export const UNTEN = [
  { id: 'tutor', name: 'Tutor', icon: 'chat', aktion: 'tutor' },
  { id: 'konto', name: 'Konto', icon: 'user', ziel: 'konto.html' },
];

/* Seite (Pfad relativ zur Wurzel) -> Bereich und aktiver Reiter.
   Lektionsseiten (lektionen/*.html) gehören zum Bereich Kurs ohne Reiter (Lektionsleiste). */
export const SEITEN = {
  'index.html': { bereich: 'heute', reiter: null, titel: 'Heute' },
  'lernpfad.html': { bereich: 'kurs', reiter: 'lernpfad', titel: 'Lernpfad' },
  'glossar.html': { bereich: 'kurs', reiter: 'glossar', titel: 'Glossar' },
  'kurs.html': { bereich: 'kurs', reiter: 'kurs', titel: 'Über den Kurs' },
  'werkbank.html': { bereich: 'werkbank', reiter: 'werkbank', titel: 'Werkbank' },
  'geteilt.html': { bereich: 'werkbank', reiter: null, titel: 'Geteiltes Programm' },
  'pap-editor.html': { bereich: 'werkbank', reiter: 'pap-editor', titel: 'PAP-Editor' },
  'werkzeuge/3d-vorschau.html': { bereich: 'werkbank', reiter: '3d-vorschau', titel: '3D-Vorschau' },
  'bibliothek.html': { bereich: 'bibliothek', reiter: null, titel: 'Bibliothek' },
  'klausurtrainer.html': { bereich: 'klausur', reiter: 'klausurtrainer', titel: 'Klausurtrainer' },
  'probeklausur-2026-27.html': { bereich: 'klausur', reiter: 'probeklausur', titel: 'Probeklausur' },
  'konto.html': { bereich: 'konto', reiter: null, titel: 'Konto' },
  'dozent.html': { bereich: 'konto', reiter: null, titel: 'Kursübersicht' },
  'offline.html': { bereich: null, reiter: null, titel: 'Offline' },
  '404.html': { bereich: null, reiter: null, titel: 'Seite nicht gefunden' },
};

export function seiteInfo(pfad) {
  if (/^lektionen\//.test(pfad)) return { bereich: 'kurs', reiter: null, titel: null, lektion: true };
  const s = SEITEN[pfad];
  if (!s) throw new Error(`navigation.mjs: Seite "${pfad}" ist nicht eingetragen (SEITEN ergänzen).`);
  return { ...s, lektion: false };
}

export function bereich(id) { return BEREICHE.find((b) => b.id === id) || null; }

/* Relativer Verweis von einer Seite (Pfad relativ zur Wurzel) zur Wurzel: '' | '../' */
export function basisVon(pfad) {
  const tiefe = pfad.split('/').length - 1;
  return tiefe ? '../'.repeat(tiefe) : '';
}
