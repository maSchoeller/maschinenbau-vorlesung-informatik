'use strict';
// Routentests. Die ganze Folge läuft zweimal: gegen die Arbeitsspeicher-Ablage und gegen die
// Cosmos-Umsetzung mit nachgebildetem Client (tests/cosmos-doppel.js).

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./hilfe');
const ablageModul = require('../src/lib/ablage');
const limits = require('../src/lib/limits');
const { erzeugeCosmosDoppel } = require('./cosmos-doppel');

h.lade(['status', 'ich', 'eintraege', 'abgleich', 'konto', 'geteilt']);

const P = 'inf-mb/v07/code:t-3';
const iso = (ms) => new Date(ms).toISOString();
const T0 = Date.parse('2026-11-01T10:00:00.000Z');

const backends = {
  speicher: () => ({ be: ablageModul.speicherBackend(), protokoll: null }),
  'cosmos (Doppel)': () => {
    const d = erzeugeCosmosDoppel();
    return { be: ablageModul.cosmosBackend(d.client, 'lernapp'), protokoll: d.protokoll };
  },
};

for (const [name, fabrik] of Object.entries(backends)) {
  describe(`API mit Ablage ${name}`, () => {
    let protokoll;
    let be;
    beforeEach(() => {
      const f = fabrik();
      protokoll = f.protokoll;
      be = f.be;
      h.neueAblage(f.be);
    });

    async function anzeigename(benutzer, n) {
      const r = await h.aufruf('PUT', '/api/ich', { benutzer, body: { anzeigename: n } });
      assert.equal(r.status, 200);
    }

    // ------------------------------------------------------------ status
    describe('status', () => {
      it('liefert ok, version, tutor, ablage ohne Login', async () => {
        const r = await h.aufruf('GET', '/api/status');
        assert.equal(r.status, 200);
        assert.equal(r.daten.ok, true);
        assert.equal(typeof r.daten.version, 'string');
        assert.equal(typeof r.daten.tutor, 'boolean');
        assert.equal(r.daten.ablage, name === 'speicher' ? 'speicher' : 'cosmos');
        assert.equal(r.headers['cache-control'], 'no-store');
        assert.match(r.headers['content-type'], /^application\/json; charset=utf-8$/);
      });
    });

    // ------------------------------------------------------------ ich
    describe('ich', () => {
      it('ohne Login: angemeldet false', async () => {
        const r = await h.aufruf('GET', '/api/ich');
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten, { angemeldet: false });
      });
      it('fremder Anbieter gilt als nicht angemeldet; PUT wird abgelehnt', async () => {
        const fremd = { userId: 'x1', provider: 'aad' };
        assert.deepEqual((await h.aufruf('GET', '/api/ich', { benutzer: fremd })).daten, { angemeldet: false });
        const r = await h.aufruf('PUT', '/api/ich', { benutzer: fremd, body: { anzeigename: 'Anna' } });
        assert.equal(r.status, 403);
        assert.equal(r.daten.fehler, 'anbieter-nicht-erlaubt');
      });
      it('kaputter Principal gilt als nicht angemeldet', async () => {
        const r = await h.aufruf('GET', '/api/eintraege', { headers: { 'x-ms-client-principal': 'kein-base64-json' } });
        assert.equal(r.status, 401);
      });
      it('mit Login: legt Profil einmal an, benutzerId pseudonym (32 hex)', async () => {
        const r1 = await h.aufruf('GET', '/api/ich', { benutzer: 'u1' });
        assert.equal(r1.status, 200);
        assert.equal(r1.daten.angemeldet, true);
        assert.equal(r1.daten.neu, true);
        assert.equal(r1.daten.anzeigename, '');
        assert.match(r1.daten.benutzerId, /^[0-9a-f]{32}$/);
        assert.ok(!JSON.stringify(r1.daten).includes('test-u1'), 'userDetails darf nicht erscheinen');
        const r2 = await h.aufruf('GET', '/api/ich', { benutzer: 'u1' });
        assert.equal(r2.daten.neu, false);
        assert.equal(r2.daten.benutzerId, r1.daten.benutzerId);
        const r3 = await h.aufruf('GET', '/api/ich', { benutzer: 'u2' });
        assert.notEqual(r3.daten.benutzerId, r1.daten.benutzerId);
      });
      it('PUT setzt Anzeigenamen und prüft ihn', async () => {
        assert.equal((await h.aufruf('PUT', '/api/ich', { body: { anzeigename: 'Anna' } })).status, 401);
        await anzeigename('u1', '  Anna  Müller ');
        assert.equal((await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.anzeigename, 'Anna Müller');
        for (const schlecht of ['A', 'x'.repeat(31), '<script>', 'a/b', 42, 'Anna\u202E']) {
          const r = await h.aufruf('PUT', '/api/ich', { benutzer: 'u1', body: { anzeigename: schlecht } });
          assert.equal(r.status, 400, String(schlecht));
          assert.equal(r.daten.fehler, 'anzeigename-ungueltig');
        }
        for (const rolle of ['Prof Schoeller', 'prof. schoeller', 'Dozent', 'Der Tutor', 'admin', 'DHBW Team']) {
          const r = await h.aufruf('PUT', '/api/ich', { benutzer: 'u1', body: { anzeigename: rolle } });
          assert.equal(r.status, 400, rolle);
          assert.equal(r.daten.fehler, 'anzeigename-reserviert');
        }
        for (const ok of ['Profi Paul', 'Tutorialfan', 'Systemo']) await anzeigename('u1', ok);
      });
    });

    // ------------------------------------------------------------ Kopfzeilen und Body
    describe('Kopfzeilen und Größen', () => {
      it('ändernde Anfragen ohne X-Kurs-App → 400', async () => {
        const r = await h.aufruf('PUT', `/api/eintraege/${P}`, {
          benutzer: 'u1', ohneAppKopf: true, headers: { 'content-type': 'application/json' }, body: { wert: 1, geaendert: iso(T0) },
        });
        assert.equal(r.status, 400);
        assert.equal(r.daten.fehler, 'kopfzeile-fehlt');
      });
      it('ändernde Anfragen mit falschem content-type → 400', async () => {
        for (const m of ['PUT', 'DELETE']) {
          const r = await h.aufruf(m, `/api/eintraege/${P}`, {
            benutzer: 'u1', ohneAppKopf: true, headers: { 'x-kurs-app': '1', 'content-type': 'text/plain' }, body: { wert: 1, geaendert: iso(T0) },
          });
          assert.equal(r.status, 400, m);
          assert.equal(r.daten.fehler, 'content-type');
        }
        const r = await h.aufruf('DELETE', '/api/konto', { benutzer: 'u1', ohneAppKopf: true });
        assert.equal(r.status, 400);
      });
      it('Body über 256 KB → 413, kaputtes JSON → 400', async () => {
        const gross = JSON.stringify({ eintraege: [], x: 'a'.repeat(257 * 1024) });
        assert.equal((await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: gross })).status, 413);
        const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: '{kaputt' });
        assert.equal(r.status, 400);
        assert.equal(r.daten.fehler, 'json-ungueltig');
        assert.equal((await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: '[1,2]' })).status, 400);
      });
      it('Fehlerantworten haben fehler und meldung, keinen Stacktrace', async () => {
        const r = await h.aufruf('GET', '/api/eintraege');
        assert.equal(r.status, 401);
        assert.equal(r.daten.fehler, 'nicht-angemeldet');
        assert.equal(typeof r.daten.meldung, 'string');
        assert.ok(!('stack' in r.daten));
      });
    });

    // ------------------------------------------------------------ eintraege
    describe('eintraege', () => {
      it('ohne Login 401 auf allen Routen', async () => {
        assert.equal((await h.aufruf('GET', '/api/eintraege')).status, 401);
        assert.equal((await h.aufruf('PUT', `/api/eintraege/${P}`, { body: { wert: 1, geaendert: iso(T0) } })).status, 401);
        assert.equal((await h.aufruf('DELETE', `/api/eintraege/${P}`)).status, 401);
        assert.equal((await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: { userId: 'a', provider: 'twitter' }, body: { wert: 1, geaendert: iso(T0) } })).status, 403);
      });
      it('PUT legt an, GET liefert, Pfad mit Doppelpunkt und Punkt', async () => {
        const p2 = 'inf-mb/werkbank/prog:abc.1_x-y';
        let r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'x = 5\nprint(x)', geaendert: iso(T0) } });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten.eintrag, { pfad: P, wert: 'x = 5\nprint(x)', geaendert: iso(T0), geloescht: false });
        r = await h.aufruf('PUT', `/api/eintraege/${p2}`, { benutzer: 'u1', body: { wert: { titel: 'T', code: 'c' }, geaendert: iso(T0) } });
        assert.equal(r.status, 200);
        r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.equal(r.daten.eintraege.length, 2);
        assert.ok(!Number.isNaN(Date.parse(r.daten.serverzeit)));
        const e = r.daten.eintraege.find((x) => x.pfad === p2);
        assert.deepEqual(e.wert, { titel: 'T', code: 'c' });
        assert.ok(!('benutzerId' in e) && !('geschrieben' in e) && !('id' in e));
      });
      it('Pfad wird geprüft', async () => {
        for (const p of ['falsch/v07/x', 'inf-mb/V07/x', 'inf-mb/v07/a b', 'inf-mb/v07/' + 'x'.repeat(121), 'inf-mb/v07', 'inf-mb/v07/x/y', 'inf-mb/v07/x%3Fy']) {
          const r = await h.aufruf('PUT', `/api/eintraege/${p}`, { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
          assert.equal(r.status, r.keineRoute ? 404 : 400, p);
        }
        // URL-kodierter Doppelpunkt wird dekodiert und akzeptiert
        const r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v07/code%3At-9', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 200);
        assert.equal(r.daten.eintrag.pfad, 'inf-mb/v07/code:t-9');
      });
      it('Wert über 64 KB → 413, fehlender Wert/Zeitstempel → 400', async () => {
        let r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'a'.repeat(65 * 1024), geaendert: iso(T0) } });
        assert.equal(r.status, 413);
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { geaendert: iso(T0) } });
        assert.equal(r.status, 400);
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 1, geaendert: 'gestern' } });
        assert.equal(r.status, 400);
        assert.equal(r.daten.fehler, 'zeit-ungueltig');
      });
      it('Konfliktregel: älter verliert (409 mit Serverstand), neuer gewinnt, Gleichstand → Server bleibt', async () => {
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'B', geaendert: iso(T0 + 1000) } });
        let r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'A', geaendert: iso(T0) } });
        assert.equal(r.status, 409);
        assert.equal(r.daten.fehler, 'server-neuer');
        assert.deepEqual(r.daten.eintrag, { pfad: P, wert: 'B', geaendert: iso(T0 + 1000), geloescht: false });
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'C', geaendert: iso(T0 + 1000) } });
        assert.equal(r.status, 409, 'Gleichstand mit anderem Wert: Server bleibt');
        assert.equal(r.daten.eintrag.wert, 'B');
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'B', geaendert: iso(T0 + 1000) } });
        assert.equal(r.status, 200, 'Gleichstand mit gleichem Wert: idempotent');
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'D', geaendert: iso(T0 + 2000) } });
        assert.equal(r.status, 200);
        assert.equal(r.daten.eintrag.wert, 'D');
      });
      it('Zeitstempel weit in der Zukunft → Serverzeit', async () => {
        const vorher = Date.now();
        const r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 1, geaendert: iso(Date.now() + 3600e3) } });
        assert.equal(r.status, 200);
        const g = Date.parse(r.daten.eintrag.geaendert);
        assert.ok(g >= vorher && g <= Date.now() + 1000, 'auf Serverzeit gesetzt');
        // 4 Minuten Vorlauf bleiben erlaubt
        const in4 = iso(Date.now() + 4 * 60e3);
        const r2 = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 2, geaendert: in4 } });
        assert.equal(r2.daten.eintrag.geaendert, in4);
      });
      it('gleichzeitige Schreiber überschreiben sich nicht (neuester gewinnt)', async () => {
        for (let runde = 0; runde < 5; runde++) {
          const p = `inf-mb/v07/gleichzeitig-${runde}`;
          const zeiten = [3, 1, 4, 1.5, 2].map((x) => T0 + x * 1000 + runde);
          await Promise.all(zeiten.map((t) => h.aufruf('PUT', `/api/eintraege/${p}`, { benutzer: 'u1', body: { wert: t, geaendert: iso(t) } })));
          const r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
          const e = r.daten.eintraege.find((x) => x.pfad === p);
          assert.equal(e.wert, Math.max(...zeiten));
        }
      });
      it('DELETE setzt Löschmarke (Pfad und geaendert bleiben, wert entfällt); ältere Löschung verliert', async () => {
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'B', geaendert: iso(T0 + 1000) } });
        let r = await h.aufruf('DELETE', `/api/eintraege/${P}?geaendert=${iso(T0)}`, { benutzer: 'u1' });
        assert.equal(r.status, 409);
        r = await h.aufruf('DELETE', `/api/eintraege/${P}?geaendert=${iso(T0 + 2000)}`, { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten.eintrag, { pfad: P, geaendert: iso(T0 + 2000), geloescht: true });
        r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
        assert.deepEqual(r.daten.eintraege, [{ pfad: P, geaendert: iso(T0 + 2000), geloescht: true }]);
        // neuer Wert nach Löschung gewinnt wieder
        r = await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'E', geaendert: iso(T0 + 3000) } });
        assert.equal(r.status, 200);
        assert.equal(r.daten.eintrag.geloescht, false);
        // DELETE ohne geaendert: Serverzeit
        r = await h.aufruf('DELETE', '/api/eintraege/inf-mb/v07/neu', { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.ok(Math.abs(Date.parse(r.daten.eintrag.geaendert) - Date.now()) < 5000);
      });
      it('seit: nur nach Server-Schreibzeit Geänderte', async () => {
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/a', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        let r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
        // serverzeit liegt bewusst etwas zurück (Sicherheitsabstand), nie in der Zukunft
        assert.ok(Date.parse(r.daten.serverzeit) <= Date.now() - 2000);
        r = await h.aufruf('GET', `/api/eintraege?seit=${encodeURIComponent(iso(Date.now() + 1000))}`, { benutzer: 'u1' });
        assert.deepEqual(r.daten.eintraege, [], 'nichts nach der Zukunft');
        // Filter nach Commit-Zeit in Sekunden (_ts): in die nächste Sekunde warten
        await new Promise((res) => setTimeout(res, 1100));
        const seit = iso(Date.now());
        // alter Zeitstempel 'geaendert', aber jetzt geschrieben → erscheint trotzdem
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/b', { benutzer: 'u1', body: { wert: 2, geaendert: iso(T0 - 1e6) } });
        r = await h.aufruf('GET', `/api/eintraege?seit=${encodeURIComponent(seit)}`, { benutzer: 'u1' });
        assert.deepEqual(r.daten.eintraege.map((e) => e.pfad), ['inf-mb/v01/b']);
        assert.equal((await h.aufruf('GET', '/api/eintraege?seit=morgen', { benutzer: 'u1' })).status, 400);
      });
      it('Daten anderer Benutzer sind nie sichtbar', async () => {
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'geheim', geaendert: iso(T0) } });
        let r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u2' });
        assert.deepEqual(r.daten.eintraege, []);
        // u2 schreibt denselben Pfad, u1 bleibt unberührt
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u2', body: { wert: 'anders', geaendert: iso(T0 - 5000) } });
        r = await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' });
        assert.equal(r.daten.eintraege[0].wert, 'geheim');
        // gleicher userId bei anderem Anbieter ist nicht derselbe Benutzer
        assert.equal((await h.aufruf('GET', '/api/eintraege', { benutzer: { userId: 'u1', provider: 'aad' } })).status, 403);
        r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u2', body: { eintraege: [] } });
        assert.ok(!r.daten.eintraege.some((e) => e.wert === 'geheim'));
      });
      it('Grenze 5000 Einträge je Benutzer; Löschmarken zählen nicht mit', async () => {
        const a = ablageModul.ablage();
        // 4999 vorhandene Einträge über den Abgleich in Blöcken zu 500 anlegen
        for (let block = 0; block < 10; block++) {
          const n = block === 9 ? 499 : 500;
          const liste = Array.from({ length: n }, (_, i) => ({ pfad: `inf-mb/v01/e${block}-${i}`, wert: i, geaendert: iso(T0) }));
          const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } });
          assert.equal(r.status, 200);
        }
        assert.equal(a.MAX_EINTRAEGE, 5000);
        let r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/letzter', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 200);
        r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/zuviel', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 403);
        assert.equal(r.daten.fehler, 'grenze-erreicht');
        // vorhandene dürfen weiter geändert werden
        r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/letzter', { benutzer: 'u1', body: { wert: 2, geaendert: iso(T0 + 1) } });
        assert.equal(r.status, 200);
        r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [{ pfad: 'inf-mb/v01/zuviel2', wert: 1, geaendert: iso(T0) }], seit: iso(Date.now() + 60e3) } });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten.abgelehnt.map((x) => [x.pfad, x.fehler]), [['inf-mb/v01/zuviel2', 'grenze-erreicht']]);
        assert.equal(r.daten.uebernommen, 0);
        // alle löschen (Löschmarken) → danach sind wieder neue Einträge möglich
        for (let block = 0; block < 10; block++) {
          const n = block === 9 ? 499 : 500;
          const liste = Array.from({ length: n }, (_, i) => ({ pfad: `inf-mb/v01/e${block}-${i}`, geloescht: true, geaendert: iso(T0 + 5) }));
          assert.equal((await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } })).status, 200);
        }
        r = await h.aufruf('PUT', '/api/eintraege/inf-mb/werkbank/prog:neu', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 200, 'nach dem Löschen ist wieder Platz');
      });
      it('parallele Abgleiche umgehen die Grenze von 5000 nicht', async () => {
        for (let block = 0; block < 9; block++) {
          const liste = Array.from({ length: 500 }, (_, i) => ({ pfad: `inf-mb/v01/a${block}-${i}`, wert: i, geaendert: iso(T0) }));
          assert.equal((await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } })).status, 200);
        }
        // 4500 vorhanden, 6 x 500 neue gleichzeitig
        const antworten = await Promise.all(Array.from({ length: 6 }, (_, p) => h.aufruf('POST', '/api/abgleich', {
          benutzer: 'u1',
          body: { eintraege: Array.from({ length: 500 }, (_, i) => ({ pfad: `inf-mb/v02/p${p}-${i}`, wert: i, geaendert: iso(T0) })), seit: iso(Date.now() + 60e3) },
        })));
        assert.ok(antworten.every((x) => x.status === 200));
        const uebernommen = antworten.reduce((s, x) => s + x.daten.uebernommen, 0);
        const abgelehnt = antworten.reduce((s, x) => s + (x.daten.abgelehnt || []).length, 0);
        assert.equal(uebernommen, 500);
        assert.equal(abgelehnt, 2500);
        const alle = (await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege;
        assert.equal(alle.length, 5000);
      });
      it('Grenze 10 MB je Konto; Löschen gibt Platz frei', async () => {
        const gross = 'x'.repeat(60 * 1024);
        let angenommen = 0;
        for (let block = 0; block < 45; block++) {
          const liste = Array.from({ length: 4 }, (_, i) => ({ pfad: `inf-mb/werkbank/prog:${block}-${i}`, wert: gross, geaendert: iso(T0) }));
          const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } });
          assert.equal(r.status, 200);
          angenommen += r.daten.uebernommen;
        }
        const max = Math.floor(ablageModul.MAX_KONTO_BYTES / (gross.length + 2));
        assert.equal(angenommen, max, 'genau so viele, wie in 10 MB passen');
        let r = await h.aufruf('PUT', '/api/eintraege/inf-mb/werkbank/prog:x', { benutzer: 'u1', body: { wert: gross, geaendert: iso(T0) } });
        assert.equal(r.status, 403);
        // ein vorhandenes Programm verkleinern bzw. löschen schafft Platz
        r = await h.aufruf('DELETE', `/api/eintraege/inf-mb/werkbank/prog:0-0?geaendert=${iso(T0 + 1)}`, { benutzer: 'u1' });
        assert.equal(r.status, 200);
        r = await h.aufruf('PUT', '/api/eintraege/inf-mb/werkbank/prog:x', { benutzer: 'u1', body: { wert: gross, geaendert: iso(T0) } });
        assert.equal(r.status, 200);
      });
      it('Kontozähler heilt sich: falscher Stand wird nachgezählt', async () => {
        const bid = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/a', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        // Zähler steht (z. B. nach einem Abbruch) fälschlich auf voll
        await be.kUeberschreiben({ id: `konto:${bid}`, n: 5000, b: 0, g: 0, geprueft: iso(Date.now() - 3600e3), ttl: -1 });
        const r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/b', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 200);
        const k = await ablageModul.ablage().kontoStand(bid);
        assert.equal(k.n, 2);
        // gerade nachgezählt: kein erneutes Nachzählen, die (echte) Grenze greift
        await be.kUeberschreiben({ ...k, n: 5000 });
        assert.equal((await h.aufruf('PUT', '/api/eintraege/inf-mb/v01/c', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } })).status, 403);
      });
      it('DELETE auf unbekannten Pfad legt keine Löschmarke an; Löschmarken verfallen (ttl)', async () => {
        let r = await h.aufruf('DELETE', `/api/eintraege/inf-mb/v07/nie-da?geaendert=${iso(T0)}`, { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.deepEqual((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege, []);
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        r = await h.aufruf('DELETE', `/api/eintraege/${P}?geaendert=${iso(T0 + 1)}`, { benutzer: 'u1' });
        assert.equal(r.status, 200);
        const bid = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
        const d = (await be.eLesenViele(bid, [P])).get(P).doc;
        assert.equal(d.geloescht, true);
        assert.equal(d.ttl, ablageModul.LOESCHMARKE_TTL_S);
        // wiederbelebt: keine ttl mehr
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 2, geaendert: iso(T0 + 2) } });
        assert.equal((await be.eLesenViele(bid, [P])).get(P).doc.ttl, undefined);
      });
    });

    // ------------------------------------------------------------ abgleich
    describe('abgleich', () => {
      it('ohne Login 401', async () => {
        assert.equal((await h.aufruf('POST', '/api/abgleich', { body: { eintraege: [] } })).status, 401);
      });
      it('gemischt neu/alt/gelöscht und Rückgabe des Neueren', async () => {
        // Serverstand: a (neu auf Server), b (alt auf Server), c (wird gelöscht)
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v02/a', { benutzer: 'u1', body: { wert: 'server-a', geaendert: iso(T0 + 5000) } });
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v02/b', { benutzer: 'u1', body: { wert: 'server-b', geaendert: iso(T0) } });
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v02/c', { benutzer: 'u1', body: { wert: 'server-c', geaendert: iso(T0) } });
        const r = await h.aufruf('POST', '/api/abgleich', {
          benutzer: 'u1',
          body: {
            seit: iso(Date.now() + 60e3), // nichts zusätzlich über 'seit'
            eintraege: [
              { pfad: 'inf-mb/v02/a', wert: 'client-a', geaendert: iso(T0 + 1000) },      // älter → Server gewinnt
              { pfad: 'inf-mb/v02/b', wert: 'client-b', geaendert: iso(T0 + 1000) },      // neuer → übernommen
              { pfad: 'inf-mb/v02/c', geloescht: true, geaendert: iso(T0 + 1000) },       // Löschmarke
              { pfad: 'inf-mb/v02/d', wert: { x: [1, 2] }, geaendert: iso(T0) },          // neu
              { pfad: 'inf-mb/v02/d', wert: 'aelter-doppelt', geaendert: iso(T0 - 1) },   // doppelt, älter → ignoriert
            ],
          },
        });
        assert.equal(r.status, 200);
        assert.equal(r.daten.uebernommen, 3);
        assert.deepEqual(r.daten.eintraege, [{ pfad: 'inf-mb/v02/a', wert: 'server-a', geaendert: iso(T0 + 5000), geloescht: false }]);
        assert.ok(!('abgelehnt' in r.daten));
        const alle = (await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege;
        const nach = Object.fromEntries(alle.map((e) => [e.pfad, e]));
        assert.equal(nach['inf-mb/v02/b'].wert, 'client-b');
        assert.deepEqual(nach['inf-mb/v02/c'], { pfad: 'inf-mb/v02/c', geaendert: iso(T0 + 1000), geloescht: true });
        assert.deepEqual(nach['inf-mb/v02/d'].wert, { x: [1, 2] });
      });
      it('ohne seit: liefert den ganzen Serverstand außer dem gerade Übernommenen', async () => {
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v03/x', { benutzer: 'u1', body: { wert: 'x', geaendert: iso(T0) } });
        const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [{ pfad: 'inf-mb/v03/y', wert: 'y', geaendert: iso(T0) }] } });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten.eintraege.map((e) => e.pfad), ['inf-mb/v03/x']);
        assert.ok(Date.parse(r.daten.serverzeit) <= Date.now());
      });
      it('seit: liefert Änderungen anderer Geräte', async () => {
        const r0 = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [] } });
        await new Promise((res) => setTimeout(res, 5));
        const seit = iso(Date.now() - 1);
        await h.aufruf('PUT', '/api/eintraege/inf-mb/v04/anderes-geraet', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [], seit } });
        assert.deepEqual(r.daten.eintraege.map((e) => e.pfad), ['inf-mb/v04/anderes-geraet']);
        assert.equal(r0.status, 200);
      });
      it('500er-Grenze, Idempotenz und effizientes Lesen', async () => {
        const liste = Array.from({ length: 500 }, (_, i) => ({ pfad: `inf-mb/v05/k${i}`, wert: { i, t: 'x'.repeat(100) }, geaendert: iso(T0 + i) }));
        const vor = protokoll ? protokoll.length : 0;
        const r1 = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } });
        assert.equal(r1.status, 200);
        assert.equal(r1.daten.uebernommen, 500);
        assert.deepEqual(r1.daten.eintraege, []);
        if (protokoll) {
          const neu = protokoll.slice(vor);
          const lese = neu.filter((x) => x.art === 'query' && x.container === 'eintraege' && x.query.includes('ARRAY_CONTAINS'));
          assert.equal(lese.length, 1, 'eine Leseabfrage für alle 500');
          assert.ok(lese.every((x) => x.partitionKey), 'Abfrage in der Partition des Benutzers');
          assert.equal(neu.filter((x) => x.art === 'read' && x.container === 'eintraege').length, 0, 'keine Einzel-Lesevorgänge');
          assert.ok(neu.filter((x) => x.art === 'patch' && x.container === 'zaehler').length <= 3, 'Kontozähler gebündelt');
          assert.equal(neu.filter((x) => x.art === 'create' && x.container === 'eintraege').length, 500);
        }
        const vor2 = protokoll ? protokoll.length : 0;
        const r2 = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: liste, seit: iso(Date.now() + 60e3) } });
        assert.deepEqual(r2.daten, { ...r1.daten, serverzeit: r2.daten.serverzeit }, 'gleiche Antwort bei Wiederholung');
        if (protokoll) {
          const neu = protokoll.slice(vor2);
          assert.equal(neu.filter((x) => ['create', 'replace'].includes(x.art)).length, 0, 'Wiederholung schreibt nichts');
        }
        const zuViel = [...liste, { pfad: 'inf-mb/v05/k500', wert: 1, geaendert: iso(T0) }];
        const r3 = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: zuViel } });
        assert.equal(r3.status, 413);
        assert.equal(r3.daten.fehler, 'zu-viele');
      });
      it('Form der Anfrage falsch → 400', async () => {
        for (const b of [{ eintraege: 'nein' }, { eintraege: [], seit: 'gestern' }]) {
          const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: b });
          assert.equal(r.status, 400, JSON.stringify(b));
        }
      });
      it('ungültige Einträge werden einzeln abgelehnt, der Rest wird gespeichert', async () => {
        const r = await h.aufruf('POST', '/api/abgleich', {
          benutzer: 'u1',
          body: {
            eintraege: [
              { pfad: 'inf-mb/v01/ok', wert: 1, geaendert: iso(T0) },
              null,
              { pfad: 'inf-mb/v01/mit leerzeichen', wert: 1, geaendert: iso(T0) },
              { pfad: 'inf-mb/v01/ohne-zeit', wert: 1 },
              { pfad: 'inf-mb/v01/ohne-wert', geaendert: iso(T0) },
              { pfad: 'inf-mb/v01/geloescht-ja', wert: 1, geaendert: iso(T0), geloescht: 'ja' },
              { pfad: 'inf-mb/v01/zu-gross', wert: 'a'.repeat(65 * 1024), geaendert: iso(T0) },
              { pfad: 'inf-mb/v01/ok2', wert: 2, geaendert: iso(T0) },
            ],
          },
        });
        assert.equal(r.status, 200);
        assert.equal(r.daten.uebernommen, 2);
        assert.deepEqual(r.daten.abgelehnt.map((x) => [x.pfad, x.fehler]), [
          [null, 'eintrag-ungueltig'],
          ['inf-mb/v01/mit leerzeichen', 'pfad-ungueltig'],
          ['inf-mb/v01/ohne-zeit', 'zeit-ungueltig'],
          ['inf-mb/v01/ohne-wert', 'wert-fehlt'],
          ['inf-mb/v01/geloescht-ja', 'eintrag-ungueltig'],
          ['inf-mb/v01/zu-gross', 'eintrag-zu-gross'],
        ]);
        assert.ok(r.daten.abgelehnt.every((x) => typeof x.meldung === 'string'));
        const alle = (await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege.map((e) => e.pfad).sort();
        assert.deepEqual(alle, ['inf-mb/v01/ok', 'inf-mb/v01/ok2']);
      });
      it('ersetzter Zukunfts-Zeitstempel wird zurückgemeldet', async () => {
        const zukunft = iso(Date.now() + 10 * 60e3);
        const r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [{ pfad: P, wert: 'x', geaendert: zukunft }], seit: iso(Date.now() + 60e3) } });
        assert.equal(r.daten.uebernommen, 1);
        assert.equal(r.daten.eintraege.length, 1);
        assert.equal(r.daten.eintraege[0].pfad, P);
        assert.notEqual(r.daten.eintraege[0].geaendert, zukunft);
        assert.ok(Math.abs(Date.parse(r.daten.eintraege[0].geaendert) - Date.now()) < 5000);
        // ohne Ersetzung: nicht zurückgemeldet
        const r2 = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [{ pfad: P, wert: 'y', geaendert: iso(Date.now() + 1000) }], seit: iso(Date.now() + 60e3) } });
        assert.deepEqual(r2.daten.eintraege, []);
      });
    });

    // ------------------------------------------------------------ geteilt
    describe('geteilt', () => {
      it('Anlegen verlangt Login und Anzeigenamen', async () => {
        assert.equal((await h.aufruf('POST', '/api/geteilt', { body: { titel: 'T', code: 'print(1)' } })).status, 401);
        const r = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T', code: 'print(1)' } });
        assert.equal(r.status, 409);
        assert.equal(r.daten.fehler, 'anzeigename-fehlt');
      });
      it('Anlegen, Abruf ohne Login, Liste eigener, Löschen nur eigene', async () => {
        await anzeigename('u1', 'Anna');
        const r = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: '  Mein Programm ', code: 'print("<b>hallo</b>")', lektion: 'V07' } });
        assert.equal(r.status, 201);
        assert.match(r.daten.id, /^[A-Za-z0-9_-]{10}$/);
        const id = r.daten.id;
        const g = await h.aufruf('GET', `/api/geteilt/${id}`);
        assert.equal(g.status, 200);
        assert.deepEqual(g.daten, { id, titel: 'Mein Programm', code: 'print("<b>hallo</b>")', lektion: 'V07', autor: 'Anna', erstellt: r.daten.erstellt });
        assert.ok(!('benutzerId' in g.daten));
        // späterer Namenswechsel ändert den Schnappschuss nicht
        await anzeigename('u1', 'Anna B');
        assert.equal((await h.aufruf('GET', `/api/geteilt/${id}`)).daten.autor, 'Anna');
        // Liste
        const l = await h.aufruf('GET', '/api/geteilt', { benutzer: 'u1' });
        assert.deepEqual(l.daten.eintraege.map((e) => e.id), [id]);
        assert.deepEqual(Object.keys(l.daten.eintraege[0]).sort(), ['erstellt', 'id', 'lektion', 'titel']);
        assert.deepEqual((await h.aufruf('GET', '/api/geteilt', { benutzer: 'u2' })).daten.eintraege, []);
        assert.equal((await h.aufruf('GET', '/api/geteilt')).status, 401);
        // fremdes Löschen
        const f = await h.aufruf('DELETE', `/api/geteilt/${id}`, { benutzer: 'u2' });
        assert.equal(f.status, 403);
        assert.equal((await h.aufruf('DELETE', `/api/geteilt/${id}`)).status, 401);
        assert.equal((await h.aufruf('DELETE', `/api/geteilt/${id}`, { benutzer: 'u1' })).status, 200);
        assert.equal((await h.aufruf('GET', `/api/geteilt/${id}`)).status, 404);
        assert.equal((await h.aufruf('DELETE', `/api/geteilt/${id}`, { benutzer: 'u1' })).status, 404);
      });
      it('unbekannte oder ungültige id → 404', async () => {
        for (const id of ['unbekannt', 'AAAAAAAAAA', 'a'.repeat(11), '..%2F..%2Fx']) {
          const r = await h.aufruf('GET', `/api/geteilt/${id}`);
          assert.equal(r.status, 404, id);
          if (!r.keineRoute) assert.equal(r.daten.fehler, 'nicht-gefunden');
        }
      });
      it('Titel, Code und Lektion werden geprüft', async () => {
        await anzeigename('u1', 'Anna');
        const faelle = [
          [{ titel: '', code: 'x' }, 400],
          [{ titel: 'x'.repeat(81), code: 'x' }, 400],
          [{ titel: 'a\nb', code: 'x' }, 400],
          [{ titel: 5, code: 'x' }, 400],
          [{ titel: 'T', code: 7 }, 400],
          [{ titel: 'T', code: 'x'.repeat(64 * 1024 + 1) }, 413],
          [{ titel: 'T', code: 'x', lektion: '<V07>' }, 400],
          [{ titel: 'abc\u202Edef', code: 'x' }, 400],
          [{ titel: 'a\u200Bb', code: 'x' }, 400],
          [{ titel: 'x'.repeat(80), code: 'x'.repeat(64 * 1024) }, 201],
        ];
        for (const [b, s] of faelle) {
          assert.equal((await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: b })).status, s, JSON.stringify(b).slice(0, 60));
        }
      });
      it('ids sind zufällig und eindeutig; höchstens 50 je Benutzer', async () => {
        await anzeigename('u1', 'Anna');
        const ids = new Set();
        for (let i = 0; i < 50; i++) {
          const r = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T' + i, code: 'x' } });
          assert.equal(r.status, 201);
          ids.add(r.daten.id);
        }
        assert.equal(ids.size, 50);
        // grobe Zufallsprüfung: kein gemeinsamer Präfix über alle
        assert.ok(new Set([...ids].map((x) => x.slice(0, 2))).size > 20);
        const r = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'zu viel', code: 'x' } });
        assert.equal(r.status, 403);
        assert.equal(r.daten.fehler, 'grenze-erreicht');
        // Löschen gibt einen Platz frei
        assert.equal((await h.aufruf('DELETE', `/api/geteilt/${[...ids][0]}`, { benutzer: 'u1' })).status, 200);
        assert.equal((await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'wieder', code: 'x' } })).status, 201);
      });
      it('80 gleichzeitige Anfragen ergeben höchstens 50 geteilte Programme', async () => {
        await anzeigename('u1', 'Anna');
        const erg = await Promise.all(Array.from({ length: 80 }, (_, i) => h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T' + i, code: 'x' } })));
        assert.equal(erg.filter((x) => x.status === 201).length, 50);
        assert.equal(erg.filter((x) => x.status === 403).length, 30);
        assert.equal((await h.aufruf('GET', '/api/geteilt', { benutzer: 'u1' })).daten.eintraege.length, 50);
      });
      it('gleichzeitiges doppeltes Löschen gibt nur einen Platz frei', async () => {
        await anzeigename('u1', 'Anna');
        const ids = [];
        for (let i = 0; i < 50; i++) ids.push((await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T' + i, code: 'x' } })).daten.id);
        // jedes Programm mit drei gleichzeitigen DELETE löschen
        for (const id of ids.slice(0, 10)) {
          await Promise.all([1, 2, 3].map(() => h.aufruf('DELETE', `/api/geteilt/${id}`, { benutzer: 'u1' })));
        }
        const erg = await Promise.all(Array.from({ length: 40 }, (_, i) => h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'N' + i, code: 'x' } })));
        assert.equal(erg.filter((x) => x.status === 201).length, 10);
        assert.equal((await h.aufruf('GET', '/api/geteilt', { benutzer: 'u1' })).daten.eintraege.length, 50);
      });
    });

    // ------------------------------------------------------------ konto
    describe('konto', () => {
      it('ohne Login 401', async () => {
        assert.equal((await h.aufruf('GET', '/api/konto/export')).status, 401);
        assert.equal((await h.aufruf('DELETE', '/api/konto')).status, 401);
      });
      it('Export enthält Profil, Einträge und geteilte Programme – nur eigene', async () => {
        await anzeigename('u1', 'Anna');
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'code', geaendert: iso(T0) } });
        const g = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T', code: 'print(1)' } });
        await anzeigename('u2', 'Bert');
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u2', body: { wert: 'fremd', geaendert: iso(T0) } });
        const r = await h.aufruf('GET', '/api/konto/export', { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.equal(r.daten.profil.anzeigename, 'Anna');
        assert.deepEqual(r.daten.eintraege, [{ pfad: P, wert: 'code', geaendert: iso(T0), geloescht: false }]);
        assert.equal(r.daten.geteilt.length, 1);
        assert.equal(r.daten.geteilt[0].id, g.daten.id);
        assert.equal(r.daten.geteilt[0].code, 'print(1)');
        assert.ok(!JSON.stringify(r.daten).includes('fremd'));
      });
      it('Löschen entfernt wirklich alles des Benutzers, andere bleiben', async () => {
        await anzeigename('u1', 'Anna');
        await anzeigename('u2', 'Bert');
        for (const b of ['u1', 'u2']) {
          await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: b, body: { wert: b, geaendert: iso(T0) } });
          await h.aufruf('DELETE', '/api/eintraege/inf-mb/v07/weg', { benutzer: b });
        }
        const g1 = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u1', body: { titel: 'T', code: 'x' } });
        const g2 = await h.aufruf('POST', '/api/geteilt', { benutzer: 'u2', body: { titel: 'T', code: 'y' } });
        const ich1 = (await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.benutzerId;
        const ich2 = (await h.aufruf('GET', '/api/ich', { benutzer: 'u2' })).daten.benutzerId;
        await limits.pruefeUndZaehle({ benutzerId: ich1, art: 'tutor', limitNutzer: 5, limitKurs: 100 });
        await limits.pruefeUndZaehle({ benutzerId: ich2, art: 'tutor', limitNutzer: 5, limitKurs: 100 });

        const r = await h.aufruf('DELETE', '/api/konto', { benutzer: 'u1' });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten, { geloescht: true, eintraege: 1, geteilt: 1 });

        assert.deepEqual((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege, []);
        assert.equal((await h.aufruf('GET', `/api/geteilt/${g1.daten.id}`)).status, 404);
        assert.equal((await limits.stand({ benutzerId: ich1, art: 'tutor', limitNutzer: 5 })).restNutzer, 4,
          'Tageszähler bleiben (verfallen nach 8 Tagen), sonst setzt Löschen das Kontingent zurück');
        const ex = await h.aufruf('GET', '/api/konto/export', { benutzer: 'u1' });
        assert.deepEqual(ex.daten.eintraege, []);
        assert.deepEqual(ex.daten.geteilt, []);
        assert.equal(ex.daten.profil.anzeigename, undefined, 'Profil gelöscht');
        // u2 unberührt
        assert.equal((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u2' })).daten.eintraege.length, 1);
        assert.equal((await h.aufruf('GET', `/api/geteilt/${g2.daten.id}`)).status, 200);
        assert.equal((await limits.stand({ benutzerId: ich2, art: 'tutor', limitNutzer: 5 })).restNutzer, 4);
        // nach erneutem Login wieder "neu"
        assert.equal((await h.aufruf('GET', '/api/ich', { benutzer: 'u1' })).daten.neu, true);
      });
      it('nach dem Löschen laden alte Geräte ihren Stand nicht wieder hoch', async () => {
        await h.aufruf('PUT', `/api/eintraege/${P}`, { benutzer: 'u1', body: { wert: 'alt', geaendert: iso(T0) } });
        assert.equal((await h.aufruf('DELETE', '/api/konto', { benutzer: 'u1' })).status, 200);
        await new Promise((res) => setTimeout(res, 5));
        // anderes Gerät reicht seinen alten Stand nach
        let r = await h.aufruf('POST', '/api/abgleich', { benutzer: 'u1', body: { eintraege: [
          { pfad: P, wert: 'alt', geaendert: iso(T0) },
          { pfad: 'inf-mb/v07/neu', wert: 'neu', geaendert: iso(Date.now()) },
        ] } });
        assert.equal(r.status, 200);
        assert.deepEqual(r.daten.abgelehnt.map((x) => [x.pfad, x.fehler]), [[P, 'konto-geloescht']]);
        assert.equal(r.daten.uebernommen, 1);
        r = await h.aufruf('PUT', '/api/eintraege/inf-mb/v07/alt2', { benutzer: 'u1', body: { wert: 1, geaendert: iso(T0) } });
        assert.equal(r.status, 410);
        assert.equal(r.daten.fehler, 'konto-geloescht');
        assert.deepEqual((await h.aufruf('GET', '/api/eintraege', { benutzer: 'u1' })).daten.eintraege.map((e) => e.pfad), ['inf-mb/v07/neu']);
      });
    });

    // ------------------------------------------------------------ limits
    describe('limits (Schnittstelle für den Tutor)', () => {
      it('zählt je Benutzer bis zum Tageslimit, dann tageslimit', async () => {
        const b = 'a'.repeat(32);
        for (let i = 1; i <= 3; i++) {
          assert.deepEqual(await limits.pruefeUndZaehle({ benutzerId: b, art: 'tutor', limitNutzer: 3, limitKurs: 100 }),
            { erlaubt: true, grund: null, restNutzer: 3 - i });
        }
        assert.deepEqual(await limits.pruefeUndZaehle({ benutzerId: b, art: 'tutor', limitNutzer: 3, limitKurs: 100 }),
          { erlaubt: false, grund: 'tageslimit', restNutzer: 0 });
        assert.deepEqual(await limits.stand({ benutzerId: b, art: 'tutor', limitNutzer: 3 }), { restNutzer: 0 });
        await limits.erstatte({ benutzerId: b, art: 'tutor' });
        assert.deepEqual(await limits.stand({ benutzerId: b, art: 'tutor', limitNutzer: 3 }), { restNutzer: 1 });
      });
      it('kursweites Budget greift über Benutzer hinweg und verbraucht dann nichts', async () => {
        const r = [];
        for (const b of ['b1', 'b2', 'b3']) r.push(await limits.pruefeUndZaehle({ benutzerId: b.padEnd(32, '0'), art: 'tutor', limitNutzer: 10, limitKurs: 2 }));
        assert.deepEqual(r.map((x) => x.grund), [null, null, 'kursbudget']);
        assert.equal(r[2].restNutzer, 10);
        assert.deepEqual(await limits.stand({ benutzerId: 'b3'.padEnd(32, '0'), art: 'tutor', limitNutzer: 10 }), { restNutzer: 10 });
      });
      it('gleichzeitige Anfragen überschreiten das Limit nicht', async () => {
        const b = 'c'.repeat(32);
        const erg = await Promise.all(Array.from({ length: 25 }, () => limits.pruefeUndZaehle({ benutzerId: b, art: 'tutor', limitNutzer: 10, limitKurs: 1000 })));
        assert.equal(erg.filter((x) => x.erlaubt).length, 10);
        const erg2 = await Promise.all(Array.from({ length: 20 }, (_, i) => limits.pruefeUndZaehle({ benutzerId: ('d' + i).padEnd(32, '0'), art: 'kurs-test', limitNutzer: 5, limitKurs: 7 })));
        assert.equal(erg2.filter((x) => x.erlaubt).length, 7);
      });
      it('erstatte geht nie unter 0; Standardwerte der Tutor-Limits', async () => {
        await limits.erstatte({ benutzerId: 'e'.repeat(32), art: 'tutor' });
        assert.deepEqual(await limits.stand({ benutzerId: 'e'.repeat(32), art: 'tutor', limitNutzer: 4 }), { restNutzer: 4 });
        const alt = { ...process.env };
        delete process.env.TUTOR_LIMIT_NUTZER_TAG; delete process.env.TUTOR_LIMIT_KURS_TAG;
        assert.deepEqual(limits.tutorLimits(), { limitNutzer: 40, limitKurs: 1500 });
        process.env.TUTOR_LIMIT_NUTZER_TAG = '12';
        assert.equal(limits.tutorLimits().limitNutzer, 12);
        process.env = alt;
        assert.match(limits.tag(new Date('2026-11-22T23:30:00Z')), /^2026-11-23$/, 'Tag nach deutscher Zeit');
      });
    });
  });
}
