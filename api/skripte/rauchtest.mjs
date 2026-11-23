#!/usr/bin/env node
// Rauchtest gegen eine laufende Bereitstellung (nur öffentliche Endpunkte, schreibt nichts).
//   node api/skripte/rauchtest.mjs https://<name>.azurestaticapps.net
//   node api/skripte/rauchtest.mjs http://localhost:7321      (Functions-Host direkt)
// Optional: --erwarte-ablage=cosmos  --erwarte-tutor  --versuche=10 (Wartezeit bei frischer Bereitstellung)
// Exit-Code 0 = alles in Ordnung, 1 = mindestens eine Prüfung fehlgeschlagen.

const args = process.argv.slice(2);
const basis = (args.find((a) => !a.startsWith('--')) || process.env.RAUCHTEST_BASIS || '').replace(/\/+$/, '');
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => {
  const [k, v] = a.slice(2).split('=');
  return [k, v === undefined ? true : v];
}));
if (!/^https?:\/\/[^/]+/.test(basis)) {
  console.error('Aufruf: node rauchtest.mjs <Basis-URL> [--erwarte-ablage=cosmos] [--erwarte-tutor] [--versuche=N]');
  process.exit(2);
}
const versuche = Math.max(1, Number(opt.versuche || 1));

async function holen(pfad) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(basis + pfad, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    const text = await r.text();
    let daten = null;
    try { daten = JSON.parse(text); } catch { /* kein JSON */ }
    return { status: r.status, daten, ct: r.headers.get('content-type') || '', cache: r.headers.get('cache-control') || '' };
  } finally {
    clearTimeout(t);
  }
}

const pruefungen = [
  ['GET /api/status liefert ok', async () => {
    const r = await holen('/api/status');
    if (r.status !== 200) return `Status ${r.status}`;
    if (!r.ct.includes('application/json')) return `content-type ${r.ct}`;
    if (!r.daten || r.daten.ok !== true) return `ok=${r.daten && r.daten.ok}, ablage=${r.daten && r.daten.ablage}`;
    if (opt['erwarte-ablage'] && r.daten.ablage !== opt['erwarte-ablage']) return `ablage=${r.daten.ablage}`;
    if (opt['erwarte-tutor'] && r.daten.tutor !== true) return 'tutor=false (ANTHROPIC_API_KEY fehlt?)';
    if (!r.cache.includes('no-store')) return `cache-control ${r.cache}`;
    return null;
  }],
  ['GET /api/ich ohne Login → angemeldet:false', async () => {
    const r = await holen('/api/ich');
    if (r.status !== 200) return `Status ${r.status}`;
    return r.daten && r.daten.angemeldet === false ? null : `Antwort ${JSON.stringify(r.daten)}`;
  }],
  ['GET /api/eintraege ohne Login → 401', async () => {
    const r = await holen('/api/eintraege');
    return r.status === 401 ? null : `Status ${r.status}`;
  }],
  ['GET /api/geteilt/unbekannt → 404', async () => {
    const r = await holen('/api/geteilt/unbekannt');
    if (r.status !== 404) return `Status ${r.status}`;
    return r.daten && r.daten.fehler === 'nicht-gefunden' ? null : `Antwort ${JSON.stringify(r.daten)}`;
  }],
  ['GET /api/geteilt/AAAAAAAAAA (gültiges Format, unbekannt) → 404', async () => {
    const r = await holen('/api/geteilt/AAAAAAAAAA');
    return r.status === 404 ? null : `Status ${r.status} (Datenbank erreichbar?)`;
  }],
];

let fehler = 0;
console.log(`Rauchtest gegen ${basis}`);
for (const [name, fn] of pruefungen) {
  let ergebnis = 'unbekannt';
  for (let v = 1; v <= versuche; v++) {
    try { ergebnis = await fn(); } catch (err) { ergebnis = `Ausnahme: ${err.message}`; }
    if (ergebnis === null || v === versuche) break;
    await new Promise((r) => setTimeout(r, 10000));
  }
  if (ergebnis === null) console.log(`  OK      ${name}`);
  else { fehler++; console.log(`  FEHLER  ${name}: ${ergebnis}`); }
}
console.log(fehler ? `${fehler} Prüfung(en) fehlgeschlagen.` : 'Alle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
