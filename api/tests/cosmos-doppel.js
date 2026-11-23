'use strict';
// Nachgebildeter Cosmos-Client (Teilmenge von @azure/cosmos 4.x), genau für die Aufrufe in
// src/lib/ablage.js. Verhält sich wie das SDK: read() liefert bei 404 resource undefined,
// create() wirft 409, replace() mit IfMatch wirft 412, patch() mit Bedingung wirft 412,
// fehlende Dokumente 404. _ts wird beim Commit in Sekunden gesetzt (wie Cosmos).
// Jede Operation ist asynchron (Zwischenschritt über setImmediate), damit gleichzeitige Anfragen
// sich wirklich verschränken. Unbekannte Abfragen werfen – so fällt auf, wenn ablage.js eine neue
// Abfrage benutzt.
//
// Störungen für Tests (veränderbar zur Laufzeit):
//   d.stoerung.verzoegerung = (container, art) => ms   // Wartezeit VOR dem Commit (langsamer Schreiber)
//   d.stoerung.fehler       = (container, art) => code  // z. B. 429, 408, 503 → Fehler mit .code
//                                                        // (wie nach erschöpften SDK-Wiederholungen)

const PK = { eintraege: 'benutzerId', benutzer: 'id', geteilt: 'id', zaehler: 'id' };

function fehler(code) { const e = new Error('Cosmos ' + code); e.code = code; return e; }
const pause = (ms) => new Promise((r) => (ms ? setTimeout(r, ms) : setImmediate(r)));
const kopie = (x) => JSON.parse(JSON.stringify(x));

const ABFRAGEN = {
  'SELECT * FROM c WHERE ARRAY_CONTAINS(@ids, c.id)': (docs, p) => docs.filter((d) => p['@ids'].includes(d.id)),
  'SELECT * FROM c WHERE c._ts >= @s': (docs, p) => docs.filter((d) => d._ts >= p['@s']),
  'SELECT * FROM c': (docs) => docs,
  'SELECT c.groesse FROM c WHERE c.geloescht = false': (docs) => docs.filter((d) => d.geloescht === false)
    .map((d) => (d.groesse === undefined ? {} : { groesse: d.groesse })),
  'SELECT VALUE c.id FROM c': (docs) => docs.map((d) => d.id),
  'SELECT * FROM c WHERE c.benutzerId = @b': (docs, p) => docs.filter((d) => d.benutzerId === p['@b']),
  'SELECT c.benutzerId, c.pfad, c.wert FROM c WHERE c.geloescht = false AND ARRAY_CONTAINS(@pfade, c.pfad)': (docs, p) => docs
    .filter((d) => d.geloescht === false && p['@pfade'].includes(d.pfad)).map((d) => ({ benutzerId: d.benutzerId, pfad: d.pfad, wert: d.wert })),
  'SELECT VALUE c.id FROM c WHERE c.benutzerId = @b': (docs, p) => docs.filter((d) => d.benutzerId === p['@b']).map((d) => d.id),
};

/** Bedingung 'FROM c WHERE c.a <= 5 AND c.b >= -3' → Prüffunktion. */
function bedingungPruefer(text) {
  const m = /^FROM c WHERE (.+)$/.exec(text);
  if (!m) throw new Error('Doppel kennt die Bedingung nicht: ' + text);
  const teile = m[1].split(' AND ').map((t) => {
    const b = /^c\.([a-zA-Z]+) (<=|>=) (-?\d+)$/.exec(t);
    if (!b) throw new Error('Doppel kennt die Bedingung nicht: ' + text);
    return { feld: b[1], op: b[2], g: Number(b[3]) };
  });
  // wie Cosmos: Vergleich mit undefined ist nicht wahr
  return (d) => teile.every(({ feld, op, g }) => typeof d[feld] === 'number' && (op === '<=' ? d[feld] <= g : d[feld] >= g));
}

function erzeugeCosmosDoppel() {
  const daten = {};      // container → Map(schluessel → doc)
  const protokoll = [];  // {container, art, query?, partitionKey?}
  const stoerung = { verzoegerung: null, fehler: null };
  let etagN = 0;

  async function schritt(name, art, zeile) {
    protokoll.push(zeile || { container: name, art });
    const ms = stoerung.verzoegerung ? stoerung.verzoegerung(name, art) || 0 : 0;
    await pause(ms);
    const code = stoerung.fehler ? stoerung.fehler(name, art) : null;
    if (code) throw fehler(code);
  }

  function container(name) {
    const pkFeld = PK[name];
    if (!pkFeld) throw new Error('unbekannter Container ' + name);
    const m = (daten[name] = daten[name] || new Map());
    const schl = (id, pk) => JSON.stringify([pk, id]);
    const speichern = (doc) => {
      const d = { ...kopie(doc), _etag: `"${++etagN}"`, _ts: Math.floor(Date.now() / 1000) };
      m.set(schl(d.id, d[pkFeld]), d);
      return d;
    };

    return {
      items: {
        async create(doc) {
          await schritt(name, 'create');
          if (!doc.id || doc[pkFeld] === undefined) throw fehler(400);
          if (m.has(schl(doc.id, doc[pkFeld]))) throw fehler(409);
          return { resource: kopie(speichern(doc)), statusCode: 201 };
        },
        async upsert(doc) {
          await schritt(name, 'upsert');
          if (!doc.id || doc[pkFeld] === undefined) throw fehler(400);
          return { resource: kopie(speichern(doc)), statusCode: 200 };
        },
        query(spec, opt = {}) {
          return {
            async fetchAll() {
              await schritt(name, 'query', { container: name, art: 'query', query: spec.query, partitionKey: opt.partitionKey });
              const f = ABFRAGEN[spec.query];
              if (!f) throw new Error('Doppel kennt die Abfrage nicht: ' + spec.query);
              const p = Object.fromEntries((spec.parameters || []).map((x) => [x.name, x.value]));
              let docs = [...m.values()];
              if (opt.partitionKey !== undefined) docs = docs.filter((d) => d[pkFeld] === opt.partitionKey);
              return { resources: kopie(f(docs, p)) };
            },
          };
        },
      },
      item(id, pk) {
        const k = schl(id, pk);
        return {
          async read() {
            await schritt(name, 'read');
            const d = m.get(k);
            return d ? { resource: kopie(d), statusCode: 200 } : { resource: undefined, statusCode: 404 };
          },
          async replace(doc, opt = {}) {
            await schritt(name, 'replace');
            const d = m.get(k);
            if (!d) throw fehler(404);
            const ac = opt.accessCondition;
            if (ac && ac.type === 'IfMatch' && ac.condition !== d._etag) throw fehler(412);
            return { resource: kopie(speichern(doc)), statusCode: 200 };
          },
          async delete() {
            await schritt(name, 'delete');
            if (!m.has(k)) throw fehler(404);
            m.delete(k);
            return { statusCode: 204 };
          },
          async patch(body) {
            await schritt(name, 'patch', { container: name, art: 'patch', condition: body.condition });
            const d = m.get(k);
            if (!d) throw fehler(404);
            if (body.operations.length > 10) throw fehler(400);
            if (body.condition && !bedingungPruefer(body.condition)(d)) throw fehler(412);
            const neu = kopie(d);
            for (const op of body.operations) {
              const feld = op.path.slice(1);
              if (feld.startsWith('_')) throw fehler(400);
              if (op.op === 'incr') {
                if (neu[feld] !== undefined && typeof neu[feld] !== 'number') throw fehler(400);
                neu[feld] = (neu[feld] || 0) + op.value;        // fehlendes Feld wird angelegt (wie Cosmos)
              } else if (op.op === 'set') neu[feld] = op.value;
              else throw new Error('Doppel kennt nur incr und set');
            }
            return { resource: kopie(speichern(neu)), statusCode: 200 };
          },
        };
      },
    };
  }

  const client = {
    database(dbName) {
      client.datenbank = dbName;
      return { container };
    },
  };
  return { client, daten, protokoll, stoerung };
}

module.exports = { erzeugeCosmosDoppel };
