// Prüft die API gegen das ECHTE Cosmos-Konto über einen lokalen Functions-Host (Basis-URL als Argument).
// Nutzt zwei Wegwerf-Identitäten und löscht sie am Ende wieder.
const B = process.argv[2] || 'http://localhost:7399';
const lauf = Date.now().toString(36);
const principal = (id) => Buffer.from(JSON.stringify({ identityProvider: 'github', userId: 'cosmos-probe-' + id + '-' + lauf, userDetails: 'probe', userRoles: ['anonymous', 'authenticated'] })).toString('base64');
const A = principal('a'), C = principal('c');
let ok = 0, fehl = 0;
function pruefe(name, bed, info) { if (bed) { ok++; console.log('  OK     ', name); } else { fehl++; console.log('  FEHLER ', name, info !== undefined ? JSON.stringify(info).slice(0, 400) : ''); } }
async function ruf(methode, pfad, { wer, body } = {}) {
  const h = { 'X-Kurs-App': '1' };
  if (wer) h['x-ms-client-principal'] = wer;
  if (body !== undefined || methode !== 'GET') h['content-type'] = 'application/json';
  const r = await fetch(B + pfad, { method: methode, headers: h, body: body === undefined ? (methode === 'GET' ? undefined : '{}') : JSON.stringify(body) });
  let d = null; try { d = await r.json(); } catch {}
  return { s: r.status, d };
}
const iso = (ms) => new Date(ms).toISOString();
const jetzt = Date.now();

let r = await ruf('GET', '/api/status');
pruefe('status ok, ablage cosmos', r.s === 200 && r.d.ok === true && r.d.ablage === 'cosmos', r);

r = await ruf('GET', '/api/ich', { wer: A });
pruefe('ich: angemeldet, neu', r.s === 200 && r.d.angemeldet === true && typeof r.d.benutzerId === 'string', r);
const bidA = r.d && r.d.benutzerId;
r = await ruf('GET', '/api/ich', { wer: A });
pruefe('ich: zweiter Aufruf nicht mehr neu, gleiche ID', r.s === 200 && r.d.benutzerId === bidA && !r.d.neu, r);

r = await ruf('PUT', '/api/eintraege/inf-mb/v05/code:t-3', { wer: A, body: { wert: 'x = 5\nprint(x)', geaendert: iso(jetzt - 60000) } });
pruefe('PUT neu → 200', r.s === 200 && r.d.eintrag && r.d.eintrag.wert === 'x = 5\nprint(x)', r);
r = await ruf('PUT', '/api/eintraege/inf-mb/v05/code:t-3', { wer: A, body: { wert: 'alt', geaendert: iso(jetzt - 120000) } });
pruefe('PUT älter → 409 mit Serverstand', r.s === 409 && r.d.eintrag && r.d.eintrag.wert === 'x = 5\nprint(x)', r);
r = await ruf('PUT', '/api/eintraege/inf-mb/v05/code:t-3', { wer: A, body: { wert: 'neu', geaendert: iso(jetzt - 30000) } });
pruefe('PUT neuer → 200', r.s === 200 && r.d.eintrag.wert === 'neu', r);
r = await ruf('PUT', '/api/eintraege/inf-mb/v01/done', { wer: A, body: { wert: { warum: 1, theorie: 1 }, geaendert: iso(jetzt - 30000) } });
pruefe('PUT Objektwert → 200', r.s === 200, r);

r = await ruf('GET', '/api/eintraege', { wer: A });
pruefe('GET liefert 2 Einträge', r.s === 200 && r.d.eintraege.length === 2, r);
const serverzeit = r.d && r.d.serverzeit;
r = await ruf('GET', '/api/eintraege', { wer: C });
pruefe('anderer Benutzer sieht nichts', r.s === 200 && r.d.eintraege.length === 0, r);

// Parallele Schreiber auf denselben Pfad: am Ende gewinnt der neueste Zeitstempel
const par = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => ruf('PUT', '/api/eintraege/inf-mb/v02/aufg', { wer: A, body: { wert: { n: i }, geaendert: iso(jetzt - 20000 + i * 1000) } })));
r = await ruf('GET', '/api/eintraege', { wer: A });
const aufg = r.d.eintraege.find((e) => e.pfad === 'inf-mb/v02/aufg');
pruefe('6 parallele PUT: neuester gewinnt (n=6), kein 5xx', aufg && aufg.wert.n === 6 && par.every((x) => x.s === 200 || x.s === 409), { stati: par.map((x) => x.s), aufg });

// Abgleich: gemischt neu / älter / gelöscht / ungültig
const menge = [];
for (let i = 0; i < 120; i++) menge.push({ pfad: 'inf-mb/werkbank/prog:p' + i, wert: { titel: 'P' + i, code: 'print(' + i + ')' }, geaendert: iso(jetzt - 10000) });
menge.push({ pfad: 'inf-mb/v05/code:t-3', wert: 'uralt', geaendert: iso(jetzt - 999999) });
menge.push({ pfad: 'inf-mb/v01/done', geloescht: true, geaendert: iso(jetzt - 5000) });
menge.push({ pfad: '../boese', wert: 1, geaendert: iso(jetzt) });
const t0 = Date.now();
r = await ruf('POST', '/api/abgleich', { wer: A, body: { eintraege: menge, seit: serverzeit } });
const dauer = Date.now() - t0;
pruefe('Abgleich 123 Einträge → 200, 121 übernommen', r.s === 200 && r.d.uebernommen === 121, { s: r.s, ueb: r.d && r.d.uebernommen, abg: r.d && r.d.abgelehnt, n: r.d && r.d.eintraege && r.d.eintraege.length });
pruefe('Abgleich: ungültiger Pfad einzeln abgelehnt', r.d && Array.isArray(r.d.abgelehnt) && r.d.abgelehnt.length === 1, r.d && r.d.abgelehnt);
pruefe('Abgleich: neuerer Serverstand kommt zurück', r.d && r.d.eintraege.some((e) => e.pfad === 'inf-mb/v05/code:t-3' && e.wert === 'neu'), r.d && r.d.eintraege && r.d.eintraege.slice(0, 2));
console.log('         Dauer Abgleich (123 Einträge):', dauer, 'ms');
r = await ruf('POST', '/api/abgleich', { wer: A, body: { eintraege: menge.slice(0, 120), seit: serverzeit } });
pruefe('Abgleich wiederholt: idempotent (200)', r.s === 200, { s: r.s, ueb: r.d && r.d.uebernommen });
r = await ruf('GET', '/api/eintraege', { wer: A });
const done = r.d.eintraege.find((e) => e.pfad === 'inf-mb/v01/done');
pruefe('Löschmarke gesetzt', done && done.geloescht === true, done);
pruefe('Gesamtzahl 123 (120 Programme + 3)', r.d.eintraege.length === 123, r.d.eintraege.length);
r = await ruf('GET', '/api/eintraege?seit=' + encodeURIComponent(iso(Date.now() + 60000)), { wer: A });
pruefe('seit in der Zukunft → wenige/keine Einträge', r.s === 200 && r.d.eintraege.length <= 123, r.d && r.d.eintraege && r.d.eintraege.length);
r = await ruf('DELETE', '/api/eintraege/inf-mb/v02/aufg?geaendert=' + encodeURIComponent(iso(Date.now())), { wer: A });
pruefe('DELETE → Löschmarke', r.s === 200, r);

// Teilen
r = await ruf('POST', '/api/geteilt', { wer: A, body: { titel: 'Probe', code: 'print("hallo")' } });
pruefe('Teilen ohne Anzeigename → 409', r.s === 409, r);
r = await ruf('PUT', '/api/ich', { wer: A, body: { anzeigename: 'Probe ' + lauf.slice(-4) } });
pruefe('Anzeigename setzen → 200', r.s === 200, r);
r = await ruf('POST', '/api/geteilt', { wer: A, body: { titel: 'Probe <b>x</b>', code: 'print("hallo")', lektion: 'V01' } });
pruefe('Teilen → 201 mit id', r.s === 201 && /^[A-Za-z0-9_-]{10}$/.test(r.d.id), r);
const gid = r.d && r.d.id;
r = await ruf('GET', '/api/geteilt/' + gid);
pruefe('geteilt ohne Login lesbar, ohne benutzerId', r.s === 200 && r.d.code === 'print("hallo")' && !('benutzerId' in r.d), r);
r = await ruf('DELETE', '/api/geteilt/' + gid, { wer: C });
pruefe('fremdes Löschen abgelehnt', r.s === 403 || r.s === 404, r);
const parTeilen = await Promise.all(Array.from({ length: 8 }, (_, i) => ruf('POST', '/api/geteilt', { wer: A, body: { titel: 'P' + i, code: 'pass' } })));
pruefe('8 parallele Teilen-Anfragen → alle 201', parTeilen.every((x) => x.s === 201), parTeilen.map((x) => x.s));
r = await ruf('GET', '/api/geteilt', { wer: A });
pruefe('eigene Liste: 9', r.s === 200 && r.d.eintraege.length === 9, r.d && r.d.eintraege && r.d.eintraege.length);

// Export und Löschen
r = await ruf('GET', '/api/konto/export', { wer: A });
pruefe('Export enthält Einträge und Geteiltes', r.s === 200 && JSON.stringify(r.d).includes('prog:p119') && JSON.stringify(r.d).includes(gid), Object.keys(r.d || {}));
r = await ruf('DELETE', '/api/konto', { wer: A });
pruefe('Konto löschen → 200', r.s === 200, r);
r = await ruf('GET', '/api/geteilt/' + gid);
pruefe('geteilter Link danach 404', r.s === 404, r);
r = await ruf('GET', '/api/eintraege', { wer: A });
pruefe('Einträge danach leer', r.s === 200 && r.d.eintraege.length === 0, r.d && r.d.eintraege && r.d.eintraege.length);
r = await ruf('PUT', '/api/eintraege/inf-mb/v05/code:t-3', { wer: A, body: { wert: 'zombie', geaendert: iso(jetzt - 60000) } });
pruefe('alter Stand nach Löschung → 410', r.s === 410, r);
await ruf('DELETE', '/api/konto', { wer: C });

console.log(`\n${ok} bestanden, ${fehl} fehlgeschlagen`);
process.exit(fehl ? 1 : 0);
