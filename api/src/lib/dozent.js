'use strict';
// Wer ist Dozent? Die Einstellung DOZENT_IDS nennt die pseudonymen Kennungen (benutzerId, 32 Hex-Zeichen),
// getrennt durch Komma, Semikolon oder Leerzeichen. Die eigene Kennung zeigt die Seite dozent.html an,
// solange das Konto nicht eingetragen ist. Ohne DOZENT_IDS ist niemand Dozent.

const ID_RE = /^[0-9a-f]{32}$/;

function dozentIds() {
  return new Set(String(process.env.DOZENT_IDS || '').toLowerCase().split(/[\s,;]+/).filter((x) => ID_RE.test(x)));
}

function istDozent(benutzerId) {
  return typeof benutzerId === 'string' && dozentIds().has(benutzerId.toLowerCase());
}

module.exports = { istDozent, dozentIds };
