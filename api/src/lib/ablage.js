'use strict';
// Ablage: EINE Schnittstelle, zwei Umsetzungen.
//
//   ablage()  → Objekt mit den fachlichen Operationen (unten "Fachliche Schnittstelle").
//               Wählt beim ersten Aufruf die Umsetzung:
//               - COSMOS_VERBINDUNG gesetzt          → Cosmos DB (Datenbank COSMOS_DATENBANK, Standard 'lernapp')
//               - sonst lokal (siehe umgebung.js) und ABLAGE=datei|speicher → Datei bzw. Arbeitsspeicher
//               - sonst                               → wirft 503 'ablage-fehlt' (nie stiller Arbeitsspeicher)
//
// Die Umsetzungen ("Backends") bieten nur wenige primitive Operationen mit optimistischer
// Sperre (ETag) bzw. atomarem, bedingtem Patch. Die Regel "neuester gewinnt" und die
// Obergrenzen stecken einmal hier oben und gelten für beide.
//
// Dokumente:
//   eintraege  (Partition /benutzerId)  {id: pfad mit '/'→'|', benutzerId, pfad, wert?, groesse, geaendert,
//                                        geschrieben, geloescht, ttl?}   Löschmarken verfallen nach 180 Tagen (ttl)
//   benutzer   (Partition /id)          {id: benutzerId, anzeigename, angelegt, letzterZugriff}
//   geteilt    (Partition /id)          {id, benutzerId, titel, code, lektion, autor, erstellt}
//   zaehler    (Partition /id)          Tageszähler {id, benutzerId|null, n}  (verfallen über die Container-TTL, 8 Tage)
//                                       Kontozähler {id: 'konto:<benutzerId>', n, b, g, geprueft, ttl: -1, geloeschtAm?}
//
// Kontozähler: n = lebende Einträge (ohne Löschmarken), b = Bytes aller Eintragswerte, g = geteilte
// Programme. Grenzen werden VOR dem Schreiben atomar reserviert (bedingtes Patch mit incr), bei
// Misserfolg des Schreibens zurückgegeben und beim Löschen freigegeben. Weicht der Zähler durch einen
// Abbruch zwischen beiden Schritten ab, zählt der Server höchstens alle 10 Minuten nach, sobald die
// Grenze erreicht scheint. Nach dem Löschen eines Kontos bleibt der Kontozähler 30 Tage als
// Löschvermerk (geloeschtAm) stehen: Einträge, die vor dem Löschen geändert wurden (alte Geräte),
// werden abgelehnt statt das Konto neu zu füllen.
//
// Abgleich 'seit': gefiltert wird nach _ts (Zeitpunkt des Commits in Cosmos, Sekunden), nicht nach
// einer vor dem Schreiben gesetzten Zeit. serverzeit liegt SEIT_SICHERHEIT_MS zurück (Replikatverzug,
// Uhrenabweichung zwischen Function und Datenbank); Doppelte sind möglich und harmlos.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { wirf, cosmosStatus } = require('./antwort');
const { istLokal, ablageWunsch } = require('./umgebung');
const { GRENZEN, bytes } = require('./pruefen');

const MAX_EINTRAEGE = 5000;
const MAX_GETEILT = 50;
const MAX_KONTO_BYTES = GRENZEN.KONTO_BYTES;
const PARALLEL = 10;                         // gleichzeitige Schreibvorgänge je Anfrage
const LOESCHMARKE_TTL_S = 180 * 24 * 3600;   // Löschmarken verfallen nach 180 Tagen
const KONTO_VERMERK_TTL_S = 30 * 24 * 3600;  // Löschvermerk eines gelöschten Kontos
const NACHZAEHLEN_MS = 10 * 60 * 1000;
const FEHLT = Symbol('fehlt');

function seitSicherheitMs() {
  const n = Number.parseInt(process.env.ABGLEICH_SICHERHEIT_MS, 10);
  return Number.isFinite(n) && n >= 0 ? n : 5000;
}

class Konflikt extends Error {
  constructor() { super('Konflikt'); this.name = 'Konflikt'; }
}

// ---------------------------------------------------------------- Hilfen

function idAusPfad(p) { return p.replace(/\//g, '|'); }
function kontoId(bid) { return `konto:${bid}`; }

function ohneSystemfelder(doc) {
  if (!doc) return doc;
  const o = {};
  for (const k of Object.keys(doc)) if (!k.startsWith('_')) o[k] = doc[k];
  return o;
}

function kopie(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
const sekunden = (ms) => Math.floor(ms / 1000);

async function parallel(liste, n, fn) {
  const erg = new Array(liste.length);
  let i = 0;
  async function arbeiter() {
    while (i < liste.length) { const k = i++; erg[k] = await fn(liste[k], k); }
  }
  await Promise.all(Array.from({ length: Math.min(n, liste.length) }, arbeiter));
  return erg;
}

/** Eintrag für Antworten: {pfad, wert, geaendert, geloescht}; Löschmarken ohne wert. */
function eintragAusgabe(doc) {
  if (doc.geloescht) return { pfad: doc.pfad, geaendert: doc.geaendert, geloescht: true };
  return { pfad: doc.pfad, wert: doc.wert, geaendert: doc.geaendert, geloescht: false };
}

function wertGroesse(wert) { return bytes(JSON.stringify(wert)); }
function docGroesse(doc) {
  if (!doc || doc.geloescht) return 0;
  return Number.isFinite(doc.groesse) ? doc.groesse : wertGroesse(doc.wert);
}

function neueGeteiltId() {
  // 8 Byte Zufall → base64url (11 Zeichen) → erste 10 Zeichen = 60 Bit, URL-sicher
  return crypto.randomBytes(8).toString('base64url').slice(0, 10);
}

/** Bedingung und Operationen für eine Kontozähler-Änderung (gemeinsam für beide Backends). */
function kontoPatch(aend, grenzen) {
  const felder = Object.entries(aend).filter(([, v]) => v !== 0);
  const plus = felder.filter(([, v]) => v > 0);
  const bedingung = plus.length
    ? 'FROM c WHERE ' + plus.map(([k, v]) => `c.${k} <= ${Math.trunc(grenzen[k] - v)}`).join(' AND ')
    : null;
  const operationen = felder.map(([k, v]) => ({ op: 'incr', path: '/' + k, value: Math.trunc(v) }));
  return { bedingung, operationen, plus };
}

// ---------------------------------------------------------------- Backend: Arbeitsspeicher / Datei

function speicherBackend({ datei = null } = {}) {
  let stand = { eintraege: {}, benutzer: {}, geteilt: {}, zaehler: {} };
  let etagZaehler = 0;
  if (datei && fs.existsSync(datei)) {
    try { stand = JSON.parse(fs.readFileSync(datei, 'utf8')); } catch { /* kaputte Datei: neu beginnen */ }
    for (const k of ['eintraege', 'benutzer', 'geteilt', 'zaehler']) stand[k] = stand[k] || {};
  }
  function sichern() {
    if (!datei) return;
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    const tmp = datei + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(stand));
    fs.renameSync(tmp, datei);
  }
  const neuesEtag = () => `"e${++etagZaehler}-${Date.now()}"`;
  const mitSystem = (doc) => ({ ...kopie(doc), _etag: neuesEtag(), _ts: sekunden(Date.now()) });
  const part = (bid) => (stand.eintraege[bid] = stand.eintraege[bid] || {});

  return {
    art: datei ? 'datei' : 'speicher',

    async eLesenViele(bid, pfade) {
      const p = stand.eintraege[bid] || {};
      const m = new Map();
      for (const pf of pfade) {
        const d = p[idAusPfad(pf)];
        if (d) m.set(pf, { doc: kopie(ohneSystemfelder(d)), etag: d._etag });
      }
      return m;
    },
    async eSeit(bid, seitMs) {
      const p = stand.eintraege[bid] || {};
      const ab = seitMs === null ? null : sekunden(seitMs);
      return Object.values(p).filter((d) => ab === null || d._ts >= ab).map((d) => kopie(ohneSystemfelder(d)));
    },
    async eSchreiben(bid, doc, etag) {
      const p = part(bid);
      const cur = p[doc.id];
      if (etag === null ? cur : !cur || cur._etag !== etag) throw new Konflikt();
      p[doc.id] = mitSystem(doc);
      sichern();
    },
    async eZaehlen(bid) {
      const leb = Object.values(stand.eintraege[bid] || {}).filter((d) => !d.geloescht);
      return { n: leb.length, b: leb.reduce((s, d) => s + (Number(d.groesse) || 0), 0) };
    },
    async eAlleLoeschen(bid) {
      const n = Object.keys(stand.eintraege[bid] || {}).length;
      delete stand.eintraege[bid];
      sichern();
      return n;
    },

    async bLesen(id) {
      const d = stand.benutzer[id];
      return d ? { doc: kopie(ohneSystemfelder(d)), etag: d._etag } : null;
    },
    async bAnlegen(doc) {
      if (stand.benutzer[doc.id]) throw new Konflikt();
      stand.benutzer[doc.id] = mitSystem(doc);
      sichern();
    },
    async bErsetzen(doc, etag) {
      const cur = stand.benutzer[doc.id];
      if (!cur || cur._etag !== etag) throw new Konflikt();
      stand.benutzer[doc.id] = mitSystem(doc);
      sichern();
    },
    async bLoeschen(id) { delete stand.benutzer[id]; sichern(); },

    async gAnlegen(doc) {
      if (stand.geteilt[doc.id]) throw new Konflikt();
      stand.geteilt[doc.id] = kopie(doc);
      sichern();
    },
    async gLesen(id) { const d = stand.geteilt[id]; return d ? kopie(d) : null; },
    async gVonBenutzer(bid) { return Object.values(stand.geteilt).filter((d) => d.benutzerId === bid).map(kopie); },
    async gLoeschen(id) {
      if (!stand.geteilt[id]) return false;
      delete stand.geteilt[id];
      sichern();
      return true;
    },

    async zAendern(id, benutzerId, delta, grenze) {
      const cur = stand.zaehler[id];
      const n = cur ? cur.n : 0;
      if (delta > 0 && n + delta > grenze) return null;
      if (delta < 0 && (!cur || n + delta < 0)) return null;
      stand.zaehler[id] = { id, benutzerId, n: n + delta };
      sichern();
      return n + delta;
    },
    async zLesen(id) { const d = stand.zaehler[id]; return d ? d.n : 0; },

    async kLesen(bid) {
      const d = stand.zaehler[kontoId(bid)];
      return d ? { doc: kopie(ohneSystemfelder(d)), etag: d._etag } : null;
    },
    async kAendern(bid, aend, grenzen) {
      const id = kontoId(bid);
      const cur = stand.zaehler[id];
      if (!cur) return FEHLT;
      const { plus, operationen } = kontoPatch(aend, grenzen);
      for (const [k, v] of plus) if (!(cur[k] <= grenzen[k] - v)) return null;
      const neu = kopie(ohneSystemfelder(cur));
      for (const op of operationen) {
        const f = op.path.slice(1);
        neu[f] = op.op === 'incr' ? (neu[f] || 0) + op.value : op.value;
      }
      stand.zaehler[id] = mitSystem(neu);
      sichern();
      return kopie(neu);
    },
    async kSetzen(doc, etag) {
      const cur = stand.zaehler[doc.id];
      if (etag === null ? cur : !cur || cur._etag !== etag) throw new Konflikt();
      stand.zaehler[doc.id] = mitSystem(doc);
      sichern();
    },
    async kUeberschreiben(doc) { stand.zaehler[doc.id] = mitSystem(doc); sichern(); },
    async kDauerhaft(bid) {
      const cur = stand.zaehler[kontoId(bid)];
      if (cur) { stand.zaehler[kontoId(bid)] = mitSystem({ ...ohneSystemfelder(cur), ttl: -1 }); sichern(); }
    },

    // nur für Tests
    _stand: () => stand,
  };
}

// ---------------------------------------------------------------- Backend: Cosmos DB

/**
 * @param {import('@azure/cosmos').CosmosClient} client
 * @param {string} datenbank
 */
function cosmosBackend(client, datenbank = 'lernapp') {
  const db = client.database(datenbank);
  const cE = db.container('eintraege');
  const cB = db.container('benutzer');
  const cG = db.container('geteilt');
  const cZ = db.container('zaehler');

  const istKonflikt = (err) => { const s = cosmosStatus(err); return s === 409 || s === 412; };

  async function punktLesen(container, id, pk) {
    try {
      const r = await container.item(id, pk).read();
      if (!r || !r.resource || r.statusCode === 404) return null;
      return r.resource;
    } catch (err) {
      if (cosmosStatus(err) === 404) return null;
      throw err;
    }
  }
  /** → true, wenn dieser Aufruf das Dokument gelöscht hat (404: schon weg → false). */
  async function punktLoeschen(container, id, pk) {
    try { await container.item(id, pk).delete(); return true; } catch (err) { if (cosmosStatus(err) !== 404) throw err; return false; }
  }
  async function abfrage(container, query, parameters, partitionKey) {
    const opt = partitionKey === undefined ? {} : { partitionKey };
    const { resources } = await container.items.query({ query, parameters: parameters || [] }, opt).fetchAll();
    return resources || [];
  }
  async function ersetzenOderAnlegen(container, doc, etag, pk) {
    try {
      if (etag === null) await container.items.create(doc);
      else await container.item(doc.id, pk).replace(doc, { accessCondition: { type: 'IfMatch', condition: etag } });
    } catch (err) {
      if (istKonflikt(err) || (etag !== null && cosmosStatus(err) === 404)) throw new Konflikt();
      throw err;
    }
  }

  return {
    art: 'cosmos',

    async eLesenViele(bid, pfade) {
      const m = new Map();
      if (pfade.length === 0) return m;
      if (pfade.length === 1) {
        const d = await punktLesen(cE, idAusPfad(pfade[0]), bid);       // 1 RU
        if (d) m.set(d.pfad, { doc: ohneSystemfelder(d), etag: d._etag });
        return m;
      }
      // eine Abfrage in der Partition des Benutzers (id ist immer indiziert)
      const docs = await abfrage(cE, 'SELECT * FROM c WHERE ARRAY_CONTAINS(@ids, c.id)',
        [{ name: '@ids', value: pfade.map(idAusPfad) }], bid);
      for (const d of docs) m.set(d.pfad, { doc: ohneSystemfelder(d), etag: d._etag });
      return m;
    },
    async eSeit(bid, seitMs) {
      // _ts ist immer indiziert und wird beim Commit gesetzt
      const docs = seitMs !== null
        ? await abfrage(cE, 'SELECT * FROM c WHERE c._ts >= @s', [{ name: '@s', value: sekunden(seitMs) }], bid)
        : await abfrage(cE, 'SELECT * FROM c', [], bid);
      return docs.map(ohneSystemfelder);
    },
    async eSchreiben(bid, doc, etag) { await ersetzenOderAnlegen(cE, doc, etag, bid); },
    async eZaehlen(bid) {
      const r = await abfrage(cE, 'SELECT c.groesse FROM c WHERE c.geloescht = false', [], bid);
      return { n: r.length, b: r.reduce((s, d) => s + (Number(d.groesse) || 0), 0) };
    },
    async eAlleLoeschen(bid) {
      const ids = await abfrage(cE, 'SELECT VALUE c.id FROM c', [], bid);
      await parallel(ids, 20, (id) => punktLoeschen(cE, id, bid));
      return ids.length;
    },

    async bLesen(id) {
      const d = await punktLesen(cB, id, id);
      return d ? { doc: ohneSystemfelder(d), etag: d._etag } : null;
    },
    async bAnlegen(doc) { await ersetzenOderAnlegen(cB, doc, null, doc.id); },
    async bErsetzen(doc, etag) { await ersetzenOderAnlegen(cB, doc, etag, doc.id); },
    async bLoeschen(id) { await punktLoeschen(cB, id, id); },

    async gAnlegen(doc) {
      try { await cG.items.create(doc); } catch (err) { if (istKonflikt(err)) throw new Konflikt(); throw err; }
    },
    async gLesen(id) { const d = await punktLesen(cG, id, id); return d ? ohneSystemfelder(d) : null; },
    async gVonBenutzer(bid) {
      // partitionsübergreifend, aber klein (höchstens 50 Treffer); /benutzerId ist indiziert
      const docs = await abfrage(cG, 'SELECT * FROM c WHERE c.benutzerId = @b', [{ name: '@b', value: bid }]);
      return docs.map(ohneSystemfelder);
    },
    async gLoeschen(id) { return punktLoeschen(cG, id, id); },

    async zAendern(id, benutzerId, delta, grenze) {
      const d = Math.trunc(delta);
      const g = Math.trunc(grenze);
      if (!Number.isFinite(d) || !Number.isFinite(g) || d === 0) throw new Error('zAendern: ungültige Zahl');
      // atomar: bedingtes Patch (Filter-Prädikat) mit incr; schlägt die Bedingung fehl → 412
      const bedingung = d > 0 ? `FROM c WHERE c.n <= ${g - d}` : `FROM c WHERE c.n >= ${-d}`;
      for (let versuch = 0; versuch < 5; versuch++) {
        try {
          const r = await cZ.item(id, id).patch({ condition: bedingung, operations: [{ op: 'incr', path: '/n', value: d }] });
          return Number(r.resource && r.resource.n);
        } catch (err) {
          const s = cosmosStatus(err);
          if (s === 412) return null;
          if (s !== 404) throw err;
        }
        // Dokument fehlt noch
        if (d < 0 || d > g) return null;
        try {
          await cZ.items.create({ id, benutzerId, n: d });
          return d;
        } catch (err) {
          if (cosmosStatus(err) !== 409) throw err; // gleichzeitig angelegt → erneut patchen
        }
      }
      wirf(503, 'ueberlastet', 'Der Zähler konnte nicht aktualisiert werden. Bitte versuche es gleich noch einmal.');
    },
    async zLesen(id) { const d = await punktLesen(cZ, id, id); return d ? Number(d.n) || 0 : 0; },

    async kLesen(bid) {
      const d = await punktLesen(cZ, kontoId(bid), kontoId(bid));
      return d ? { doc: ohneSystemfelder(d), etag: d._etag } : null;
    },
    async kAendern(bid, aend, grenzen) {
      const id = kontoId(bid);
      const { bedingung, operationen } = kontoPatch(aend, grenzen);
      try {
        const body = bedingung ? { condition: bedingung, operations: operationen } : { operations: operationen };
        const r = await cZ.item(id, id).patch(body);
        return ohneSystemfelder(r.resource) || {};
      } catch (err) {
        const s = cosmosStatus(err);
        if (s === 412) return null;
        if (s === 404) return FEHLT;
        throw err;
      }
    },
    async kSetzen(doc, etag) { await ersetzenOderAnlegen(cZ, doc, etag, doc.id); },
    async kUeberschreiben(doc) { await cZ.items.upsert(doc); },
    async kDauerhaft(bid) {
      try { await cZ.item(kontoId(bid), kontoId(bid)).patch({ operations: [{ op: 'set', path: '/ttl', value: -1 }] }); } catch (err) {
        if (cosmosStatus(err) !== 404) throw err;
      }
    },
  };
}

// ---------------------------------------------------------------- Fachliche Schnittstelle

function fachlich(be) {
  const KGRENZEN = { n: MAX_EINTRAEGE, b: MAX_KONTO_BYTES, g: MAX_GETEILT };

  // ---- Kontozähler

  /** Zählt lebende Einträge, Bytes und geteilte Programme neu (höchstens alle 10 Minuten). → geändert? */
  async function nachzaehlen(bid) {
    const cur = await be.kLesen(bid);
    if (cur && Date.now() - Date.parse(cur.doc.geprueft || 0) < NACHZAEHLEN_MS) return false;
    const e = await be.eZaehlen(bid);
    const g = (await be.gVonBenutzer(bid)).length;
    const basis = cur ? cur.doc : { id: kontoId(bid) };
    const doc = { ...basis, n: e.n, b: e.b, g, geprueft: new Date().toISOString(), ttl: -1 };
    try { await be.kSetzen(doc, cur ? cur.etag : null); return true; } catch (err) {
      if (!(err instanceof Konflikt)) throw err;
      return Boolean(!cur); // gleichzeitig angelegt: erneut versuchen
    }
  }

  /** Reserviert {n, b, g} (nicht negativ) atomar. → Kontozähler-Dokument oder null (Grenze). */
  async function reservieren(bid, bedarf) {
    let nachgezaehlt = false;
    for (let versuch = 0; versuch < 4; versuch++) {
      const r = await be.kAendern(bid, bedarf, KGRENZEN);
      if (r === FEHLT) { await nachzaehlen(bid); continue; }
      if (r === null) {
        if (!nachgezaehlt) { nachgezaehlt = true; if (await nachzaehlen(bid)) continue; }
        return null;
      }
      return r;
    }
    return null;
  }

  async function freigeben(bid, menge) {
    const neg = {};
    for (const [k, v] of Object.entries(menge)) if (v > 0) neg[k] = -v;
    if (!Object.keys(neg).length) return;
    try { await be.kAendern(bid, neg, KGRENZEN); } catch { /* Abweichung heilt das Nachzählen */ }
  }

  const leer = () => ({ n: 0, b: 0, g: 0 });
  const istLeer = (x) => !x.n && !x.b && !x.g;
  const plus = (a, x) => { for (const k of Object.keys(a)) a[k] += x[k] || 0; };

  /** Kontingent einer Anfrage: Vorab-Reservierung, Entnahme je Eintrag, Abschluss gibt Unbenutztes frei. */
  function kontingent(bid) {
    const pool = leer();
    const frei = leer();
    let geloeschtAm = null;
    let verfaellt = false;      // Kontozähler ist noch ein Löschvermerk mit TTL
    let geschrieben = false;
    const merke = (d) => {
      if (d && d.geloeschtAm) geloeschtAm = d.geloeschtAm;
      if (d && d.ttl > 0) verfaellt = true;
    };
    return {
      get geloeschtAm() { return geloeschtAm; },
      geschrieben() { geschrieben = true; },
      async vorab(bedarf) {
        if (istLeer(bedarf)) return;
        const d = await reservieren(bid, bedarf);
        if (d) { plus(pool, bedarf); merke(d); }
      },
      async nehmen(bedarf) {
        if (Object.keys(bedarf).every((k) => pool[k] >= (bedarf[k] || 0))) {
          for (const k of Object.keys(bedarf)) pool[k] -= bedarf[k] || 0;
          return true;
        }
        const d = await reservieren(bid, { n: 0, b: 0, g: 0, ...bedarf });
        if (!d) return false;
        merke(d);
        return true;
      },
      zurueck(bedarf) { plus(pool, bedarf); },
      freigeben(menge) { plus(frei, menge); },
      async abschliessen() {
        plus(frei, pool);
        await freigeben(bid, frei);
        // nach einem gelöschten Konto wieder Daten: Vermerk darf nicht mehr verfallen (Zähler bleiben gültig)
        if (verfaellt && geschrieben) { try { await be.kDauerhaft(bid); } catch { /* nächstes Mal */ } }
      },
    };
  }

  /** Änderung der Kontozähler, wenn 'ein' über 'cur' geschrieben wird. */
  function bedarf(cur, ein) {
    const alt = cur && !cur.doc.geloescht;
    const neu = !ein.geloescht;
    return {
      n: (neu ? 1 : 0) - (alt ? 1 : 0),
      b: (neu ? wertGroesse(ein.wert) : 0) - (alt ? docGroesse(cur.doc) : 0),
    };
  }
  const positiv = (x) => ({ n: Math.max(x.n, 0), b: Math.max(x.b, 0) });
  const negativ = (x) => ({ n: Math.max(-x.n, 0), b: Math.max(-x.b, 0) });

  /** Würde 'ein' gegenüber 'cur' geschrieben? (ohne Löschmarken für Unbekanntes) */
  function wuerdeSchreiben(cur, ein) {
    if (!cur) return !ein.geloescht;
    return Date.parse(ein.geaendert) > Date.parse(cur.doc.geaendert);
  }

  /**
   * Wendet einen Eintrag nach "neuester gewinnt" an, konfliktsicher über ETag.
   * @param {string} bid
   * @param {{pfad, wert?, geaendert, geloescht}} ein  bereits geprüft und normalisiert
   * @param {{doc, etag}|null|undefined} vorhanden     bekannter Serverstand (undefined = selbst lesen)
   * @param {ReturnType<kontingent>} k                 Kontingent der Anfrage
   * @returns {Promise<{status: 'uebernommen'|'gleich'|'server-neuer'|'grenze'|'konto-geloescht', eintrag: object|null}>}
   */
  async function eintragAnwenden(bid, ein, vorhanden, k) {
    for (let versuch = 0; versuch < 6; versuch++) {
      const cur = vorhanden !== undefined ? vorhanden : (await be.eLesenViele(bid, [ein.pfad])).get(ein.pfad) || null;
      vorhanden = undefined;
      if (cur) {
        const neu = Date.parse(ein.geaendert);
        const alt = Date.parse(cur.doc.geaendert);
        if (neu < alt) return { status: 'server-neuer', eintrag: cur.doc };
        if (neu === alt) {
          const gleich = Boolean(cur.doc.geloescht) === Boolean(ein.geloescht)
            && (ein.geloescht || JSON.stringify(cur.doc.wert) === JSON.stringify(ein.wert));
          return { status: gleich ? 'gleich' : 'server-neuer', eintrag: cur.doc };
        }
      } else if (ein.geloescht) {
        // Löschung eines Pfads, den der Server nicht kennt: nichts zu speichern (keine Löschmarke)
        return { status: 'gleich', eintrag: { pfad: ein.pfad, geaendert: ein.geaendert, geloescht: true } };
      }
      const bed = bedarf(cur, ein);
      const noetig = positiv(bed);
      if (noetig.n || noetig.b) {
        if (!(await k.nehmen(noetig))) return { status: 'grenze', eintrag: null };
        if (k.geloeschtAm && Date.parse(ein.geaendert) <= Date.parse(k.geloeschtAm)) {
          k.zurueck(noetig);
          return { status: 'konto-geloescht', eintrag: null };
        }
      }
      const doc = {
        id: idAusPfad(ein.pfad),
        benutzerId: bid,
        pfad: ein.pfad,
        geaendert: ein.geaendert,
        geschrieben: new Date().toISOString(),
        geloescht: Boolean(ein.geloescht),
      };
      if (ein.geloescht) { doc.groesse = 0; doc.ttl = LOESCHMARKE_TTL_S; } else { doc.wert = ein.wert; doc.groesse = wertGroesse(ein.wert); }
      try {
        await be.eSchreiben(bid, doc, cur ? cur.etag : null);
        k.freigeben(negativ(bed));
        if (noetig.n || noetig.b) k.geschrieben();
        return { status: 'uebernommen', eintrag: doc };
      } catch (err) {
        k.zurueck(noetig);
        if (!(err instanceof Konflikt)) throw err;
        // jemand anderes hat gleichzeitig geschrieben → neu lesen und Regel erneut anwenden
      }
    }
    wirf(503, 'konflikt', 'Der Eintrag wird gerade gleichzeitig geändert. Bitte versuche es noch einmal.');
  }

  function serverzeitJetzt() {
    return new Date(Date.now() - seitSicherheitMs()).toISOString();
  }
  const seitMs = (seit) => (seit ? Date.parse(seit) : null);

  return {
    art: be.art,
    MAX_EINTRAEGE,
    MAX_GETEILT,
    MAX_KONTO_BYTES,
    eintragAusgabe,

    /** Ein Eintrag anwenden (PUT/DELETE). */
    async eintragSetzen(bid, ein) {
      const k = kontingent(bid);
      try {
        return await eintragAnwenden(bid, ein, undefined, k);
      } finally {
        await k.abschliessen();
      }
    },

    /** Alle Einträge bzw. die seit 'seit' (Commit-Zeit auf dem Server) geänderten. */
    async eintraegeSeit(bid, seit) {
      const serverzeit = serverzeitJetzt();
      const docs = await be.eSeit(bid, seitMs(seit));
      return { eintraege: docs.map(eintragAusgabe), serverzeit };
    },

    /**
     * Abgleich: wendet bis zu 500 Einträge an (eine Leseabfrage, begrenzt parallele Schreibvorgänge)
     * und liefert, was auf dem Server neuer ist bzw. seit 'seit' geändert wurde.
     * Idempotent: Wiederholung derselben Liste ändert nichts und meldet dieselbe Zahl 'uebernommen'.
     * @param {Array<{pfad, wert?, geaendert, geloescht, ersetzt?}>} liste  geprüfte Einträge
     * @param {string|null} seit
     * @param {Array<{pfad, fehler, meldung}>} [abgelehntVorab]  bei der Prüfung abgelehnte Einträge
     */
    async abgleich(bid, liste, seit, abgelehntVorab = []) {
      // doppelte Pfade: neuester gewinnt schon in der Anfrage
      const proPfad = new Map();
      for (const e of liste) {
        const v = proPfad.get(e.pfad);
        if (!v || Date.parse(e.geaendert) > Date.parse(v.geaendert)) proPfad.set(e.pfad, e);
      }
      const eintraege = [...proPfad.values()];
      const vorhanden = await be.eLesenViele(bid, eintraege.map((e) => e.pfad));

      const k = kontingent(bid);
      let ergebnisse;
      try {
        const vorabBedarf = { n: 0, b: 0, g: 0 };
        for (const e of eintraege) {
          const cur = vorhanden.get(e.pfad) || null;
          if (wuerdeSchreiben(cur, e)) plus(vorabBedarf, positiv(bedarf(cur, e)));
        }
        await k.vorab(vorabBedarf);
        ergebnisse = await parallel(eintraege, PARALLEL, (e) => eintragAnwenden(bid, e, vorhanden.get(e.pfad) || null, k));
      } finally {
        await k.abschliessen();
      }

      let uebernommen = 0;
      const abgelehnt = [...abgelehntVorab];
      const zurueck = new Map();        // pfad → doc (Serverstand, den der Client übernehmen soll)
      const erledigt = new Set();       // Pfade, deren Serverstand jetzt dem Client entspricht
      ergebnisse.forEach((r, i) => {
        const e = eintraege[i];
        if (r.status === 'uebernommen' || r.status === 'gleich') {
          uebernommen++;
          // vom Server ersetzter Zeitstempel (Zukunft): gespeicherten Stand zurückmelden
          if (e.ersetzt) zurueck.set(e.pfad, r.eintrag); else erledigt.add(e.pfad);
        } else if (r.status === 'server-neuer') zurueck.set(e.pfad, r.eintrag);
        else if (r.status === 'konto-geloescht') {
          abgelehnt.push({ pfad: e.pfad, fehler: 'konto-geloescht', meldung: 'Das Konto wurde gelöscht; ältere Stände werden nicht wieder aufgenommen.' });
        } else {
          abgelehnt.push({ pfad: e.pfad, fehler: 'grenze-erreicht', meldung: `Je Konto sind höchstens ${MAX_EINTRAEGE} Einträge und 10 MB möglich.` });
        }
      });

      const serverzeit = serverzeitJetzt();
      for (const d of await be.eSeit(bid, seitMs(seit))) {
        if (erledigt.has(d.pfad)) {
          // nur zurückgeben, wenn inzwischen jemand anderes Neueres geschrieben hat
          const gesendet = proPfad.get(d.pfad);
          if (Date.parse(d.geaendert) <= Date.parse(gesendet.geaendert)) continue;
        }
        zurueck.set(d.pfad, d);
      }
      const antwort = { uebernommen, eintraege: [...zurueck.values()].map(eintragAusgabe), serverzeit };
      if (abgelehnt.length) antwort.abgelehnt = abgelehnt;
      return antwort;
    },

    // ---- Benutzer

    /** Profil holen, beim ersten Aufruf anlegen. → {profil, neu} */
    async benutzerHolenOderAnlegen(bid) {
      for (let versuch = 0; versuch < 4; versuch++) {
        const cur = await be.bLesen(bid);
        const jetzt = new Date().toISOString();
        if (!cur) {
          const doc = { id: bid, anzeigename: '', angelegt: jetzt, letzterZugriff: jetzt };
          try { await be.bAnlegen(doc); return { profil: doc, neu: true }; } catch (err) {
            if (!(err instanceof Konflikt)) throw err;
            continue;
          }
        }
        // letzten Zugriff höchstens einmal am Tag schreiben (spart Schreibvorgänge)
        if (Date.now() - Date.parse(cur.doc.letzterZugriff || 0) > 24 * 3600 * 1000) {
          const doc = { ...cur.doc, letzterZugriff: jetzt };
          try { await be.bErsetzen(doc, cur.etag); return { profil: doc, neu: false }; } catch (err) {
            if (!(err instanceof Konflikt)) throw err;
          }
        }
        return { profil: cur.doc, neu: false };
      }
      return { profil: (await be.bLesen(bid)).doc, neu: false };
    },

    async benutzerLesen(bid) {
      const cur = await be.bLesen(bid);
      return cur ? cur.doc : null;
    },

    async anzeigenameSetzen(bid, name) {
      for (let versuch = 0; versuch < 5; versuch++) {
        const cur = await be.bLesen(bid);
        if (!cur) { await this.benutzerHolenOderAnlegen(bid); continue; }
        const doc = { ...cur.doc, anzeigename: name, letzterZugriff: new Date().toISOString() };
        try { await be.bErsetzen(doc, cur.etag); return doc; } catch (err) {
          if (!(err instanceof Konflikt)) throw err;
        }
      }
      wirf(503, 'konflikt', 'Das Profil wird gerade gleichzeitig geändert. Bitte versuche es noch einmal.');
    },

    // ---- Geteilt

    /** Legt einen unveränderlichen Schnappschuss an (Grenze 50 atomar). → {id, erstellt} oder null (Grenze) */
    async geteiltAnlegen(bid, { titel, code, lektion, autor }) {
      if (!(await reservieren(bid, { n: 0, b: 0, g: 1 }))) return null;
      try {
        for (let versuch = 0; versuch < 5; versuch++) {
          const doc = { id: neueGeteiltId(), benutzerId: bid, titel, code, lektion: lektion || null, autor, erstellt: new Date().toISOString() };
          try { await be.gAnlegen(doc); return doc; } catch (err) {
            if (!(err instanceof Konflikt)) throw err;
          }
        }
        wirf(503, 'ueberlastet', 'Es konnte keine neue Kennung erzeugt werden. Bitte versuche es noch einmal.');
      } catch (err) {
        await freigeben(bid, { g: 1 });
        throw err;
      }
    },
    async geteiltLesen(id) { return be.gLesen(id); },
    async geteiltVonBenutzer(bid) { return be.gVonBenutzer(bid); },
    async geteiltLoeschen(id, bid) {
      // nur freigeben, wenn DIESER Aufruf gelöscht hat: zwei gleichzeitige DELETE dürfen den Zähler
      // nicht zweimal senken (sonst ließe sich die Grenze von 50 durch Löschen in Paaren aushebeln)
      const geloescht = await be.gLoeschen(id);
      if (bid && geloescht) await freigeben(bid, { g: 1 });
    },

    // ---- Zähler (für limits.js)

    zaehlerAendern: (id, benutzerId, delta, grenze) => be.zAendern(id, benutzerId, delta, grenze),
    zaehlerLesen: (id) => be.zLesen(id),
    kontoStand: async (bid) => { const c = await be.kLesen(bid); return c ? c.doc : null; },

    // ---- Konto

    async kontoExport(bid) {
      const profil = await this.benutzerLesen(bid);
      const docs = await be.eSeit(bid, null);
      const geteilt = (await be.gVonBenutzer(bid)).map((g) => ({
        id: g.id, titel: g.titel, code: g.code, lektion: g.lektion, autor: g.autor, erstellt: g.erstellt,
      }));
      return {
        exportiert: new Date().toISOString(),
        profil: profil ? { benutzerId: bid, anzeigename: profil.anzeigename, angelegt: profil.angelegt, letzterZugriff: profil.letzterZugriff } : { benutzerId: bid },
        eintraege: docs.map(eintragAusgabe),
        geteilt,
      };
    },

    /**
     * Löscht alle Daten des Benutzers (Einträge, geteilte Programme, Profil). Es bleiben nur:
     * der Kontozähler als Löschvermerk (Zeitpunkt, verfällt nach 30 Tagen) und die Tageszähler der
     * Kontingente (Anzahlen, verfallen nach 8 Tagen), damit Löschen kein Kontingent zurücksetzt.
     */
    async kontoLoeschen(bid) {
      const anzahl = await be.eAlleLoeschen(bid);
      const geteilt = await be.gVonBenutzer(bid);
      await parallel(geteilt, 10, (g) => be.gLoeschen(g.id));
      await be.bLoeschen(bid);
      const jetzt = new Date().toISOString();
      await be.kUeberschreiben({ id: kontoId(bid), n: 0, b: 0, g: 0, geprueft: jetzt, geloeschtAm: jetzt, ttl: KONTO_VERMERK_TTL_S });
      return { eintraege: anzahl, geteilt: geteilt.length };
    },
  };
}

// ---------------------------------------------------------------- Auswahl (Modul-Singleton)

let aktuell = null;

function erzeuge() {
  const verbindung = process.env.COSMOS_VERBINDUNG;
  if (verbindung) {
    const { CosmosClient } = require('@azure/cosmos');
    // kurze Wiederholungen bei 429: die Anfrage soll vor dem 45-s-Limit von SWA antworten (dann 503)
    const client = new CosmosClient({
      connectionString: verbindung,
      connectionPolicy: { requestTimeout: 10000, retryOptions: { maxRetryAttemptCount: 5, fixedRetryIntervalInMilliseconds: 0, maxWaitTimeInSeconds: 8 } },
    });
    return fachlich(cosmosBackend(client, process.env.COSMOS_DATENBANK || 'lernapp'));
  }
  const wunsch = ablageWunsch();
  if (wunsch && istLokal()) {
    if (wunsch === 'speicher') return fachlich(speicherBackend());
    const datei = process.env.ABLAGE_DATEI || path.join(__dirname, '..', '..', '.daten', 'ablage.json');
    return fachlich(speicherBackend({ datei }));
  }
  return null;
}

/** Die Ablage; wirft 503, wenn keine eingerichtet ist. */
function ablage() {
  if (!aktuell) aktuell = erzeuge();
  if (!aktuell) wirf(503, 'ablage-fehlt', 'Der Server ist noch nicht vollständig eingerichtet (Datenbank fehlt).');
  return aktuell;
}

/** Art der Ablage oder null (für /api/status), ohne zu werfen. */
function ablageArt() {
  try { return ablage().art; } catch { return null; }
}

/** Nur für Tests: eigenes Backend setzen (null = neu aus der Umgebung wählen). */
function _setzeBackend(be) { aktuell = be ? fachlich(be) : null; }

module.exports = {
  ablage, ablageArt, speicherBackend, cosmosBackend, Konflikt, idAusPfad, eintragAusgabe,
  MAX_EINTRAEGE, MAX_GETEILT, MAX_KONTO_BYTES, LOESCHMARKE_TTL_S, _setzeBackend,
};
