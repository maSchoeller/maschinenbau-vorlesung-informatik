/* =============================================================
   speicher.js – Speicherschicht der Vorlesungs-Website  →  window.KursSpeicher
   Wird als ERSTES Skript jeder Seite geladen. Kein Framework, kein Build.

   ÖFFENTLICHE API (siehe auch SCHNITTSTELLEN.md, Abschnitt 1)
     KursSpeicher.benutzer                      'lokal' (später: pseudonyme Benutzer-ID)
     KursSpeicher.pfad(lektion, schluessel)     -> 'inf-mb/<lektion klein>/<schluessel>'
     KursSpeicher.laden(pfad)                   -> Promise<wert | undefined>
     KursSpeicher.speichern(pfad, wert)         -> Promise<{pfad, wert, geaendert, benutzer}>
     KursSpeicher.liste(praefix)                -> Promise<[{pfad, geaendert}]>
     KursSpeicher.loeschen(pfad)                -> Promise<void>
     KursSpeicher.abonnieren(praefix, fn)       -> abbestellen()
         fn(eintrag) feuert bei jeder Änderung unterhalb von praefix, auch bei eigenen
         Schreibzugriffen und bei Änderungen aus anderen Tabs (storage-Ereignis).
         Gelöschte Einträge kommen als {pfad, wert: undefined, geloescht: true}.
     KursSpeicher.sofort.lesen(pfad) / .schreiben(pfad, wert) / .loeschen(pfad)
         synchron über den Zwischenspeicher (Cache), für bestehenden synchronen Code.
         Schreiben geht sofort in den Cache und wird im Hintergrund an den Adapter gegeben.
     KursSpeicher.exportieren()                 -> Objekt (JSON-serialisierbar)
     KursSpeicher.importieren(obj)              -> Promise<{neu, aktualisiert, unveraendert}>
         Zusammenführen: je Eintrag gewinnt der neueste Zeitstempel (Gleichstand: lokal bleibt).
     KursSpeicher.setzeAdapter(adapter)         -> Promise (fertig, wenn der Abgleich durch ist)
     KursSpeicher.adapterName                   Name des aktiven Adapters

   PFADE UND WERTE
     Pfad  = 'inf-mb/<lektion>/<schluessel>', z. B. 'inf-mb/v05/code:t-3',
             'inf-mb/v01/done', 'inf-mb/bibliothek/stand'.
     Wert  = beliebig JSON-serialisierbar (Zahl, Text, Objekt).
     Eintrag = {wert, geaendert (ISO-8601 UTC), benutzer}; mit Pfad: {pfad, wert, geaendert, benutzer}.

   ADAPTER-SCHNITTSTELLE (was ein Azure-API-Adapter liefern muss)
     Ein Adapter ist ein Objekt mit diesen Mitgliedern. Alle Methoden außer alleSync
     geben ein Promise zurück. Fehler (z. B. offline) dürfen als abgelehntes Promise kommen;
     der Cache bleibt führend, ein späterer Abgleich holt das Versäumte nach.
       name                       Text, z. B. 'localStorage' oder 'azure-api'
       benutzer                   (optional) Benutzer-ID, überschreibt KursSpeicher.benutzer
       alleSync()                 (optional) -> {pfad: {wert, geaendert, benutzer}} synchron.
                                  Nur für Adapter, die schon beim Seitenstart synchron lesen
                                  können (localStorage). Ein Netz-Adapter lässt es weg.
       alle()                     -> Promise<{pfad: {wert, geaendert, benutzer}}>
                                  Vollabzug des Benutzers (GET /api/eintraege). Beim Anstecken
                                  wird er mit dem Cache zusammengeführt (neuester Stand je
                                  Pfad), lokal Neueres wird per speichern() nachgereicht.
       speichern(eintrag)         eintrag = {pfad, wert, geaendert, benutzer}  (PUT)
       loeschen(pfad)             (DELETE)
       abonnieren(fn)             (optional) fn({pfad, wert, geaendert, benutzer, geloescht?})
                                  bei Änderungen von außen (anderer Tab, anderes Gerät, Polling);
                                  gibt eine Abbestell-Funktion zurück.
     Der Kern hält den Cache, übernimmt Migration, Konfliktregel („neuester Stand gewinnt je
     Pfad“), Abonnenten, Export und Import. Der Adapter speichert nur.

   ZUSÄTZLICH IN DIESER DATEI
     Migration des alten Standes (dhbw-inf-mb:v1 und dhbw-inf-mb:bib-stand) beim ersten Laden,
     Oberfläche „Arbeitsstand sichern / laden“ (Seitenfuß jeder Seite, Startseite gut sichtbar).
   ============================================================= */
(function () {
  'use strict';
  if (window.KursSpeicher) return;

  var SCHLUESSEL = 'dhbw-inf-mb:speicher:v2';
  var MIGRATION_MARKE = 'dhbw-inf-mb:speicher:v2:migriert';
  var ALT_V1 = 'dhbw-inf-mb:v1';
  var ALT_STAND = 'dhbw-inf-mb:bib-stand';
  var EXPORT_FORMAT = 'dhbw-inf-mb-arbeitsstand';
  var EPOCHE = '1970-01-01T00:00:00.000Z';   /* Zeitstempel für übernommene Altdaten */

  function jetzt() { return new Date().toISOString(); }
  function kopie(w) { return w === undefined ? undefined : JSON.parse(JSON.stringify(w)); }
  function istObjekt(x) { return x && typeof x === 'object' && !Array.isArray(x); }

  /* ── Zugriff auf localStorage, immer abgesichert ─────────── */
  var ls = null;
  try {
    ls = window.localStorage;
    var probe = '__dhbw_probe__';
    ls.setItem(probe, '1'); ls.removeItem(probe);
  } catch (e) { ls = null; }          /* privates Fenster, gesperrt, voll … */

  /* ── Lokaler Adapter ─────────────────────────────────────── */
  var speicherImRam = {};              /* Rückfall ohne localStorage */
  var lokalerAdapter = {
    name: ls ? 'localStorage' : 'arbeitsspeicher',
    alleSync: function () {
      if (!ls) return kopie(speicherImRam);
      try {
        var raw = ls.getItem(SCHLUESSEL);
        var d = raw ? JSON.parse(raw) : {};
        return istObjekt(d) ? d : {};
      } catch (e) { return kopie(speicherImRam); }
    },
    alle: function () { return Promise.resolve(lokalerAdapter.alleSync()); },
    /* schreibt immer den aktuellen Gesamtstand: erst frisch lesen (andere Tabs!), dann ändern */
    speichern: function (eintrag) {
      var d = lokalerAdapter.alleSync();
      d[eintrag.pfad] = { wert: eintrag.wert, geaendert: eintrag.geaendert, benutzer: eintrag.benutzer };
      return schreibeAlles(d);
    },
    loeschen: function (pfad) {
      var d = lokalerAdapter.alleSync();
      delete d[pfad];
      return schreibeAlles(d);
    },
    abonnieren: function (fn) {
      /* storage-Ereignisse kommen nur aus ANDEREN Tabs derselben Herkunft */
      function bei(ev) {
        if (ev.key !== SCHLUESSEL && ev.key !== null) return;
        fn({ __neuLaden: true });
      }
      window.addEventListener('storage', bei);
      return function () { window.removeEventListener('storage', bei); };
    }
  };
  function schreibeAlles(d) {
    speicherImRam = kopie(d);
    if (ls) { try { ls.setItem(SCHLUESSEL, JSON.stringify(d)); } catch (e) { /* voll: Cache bleibt */ } }
    return Promise.resolve();
  }

  /* ── Kern: Cache, Abonnenten, Konfliktregel ──────────────── */
  var adapter = lokalerAdapter;
  var cache = {};                      /* pfad -> {wert, geaendert, benutzer} */
  var abonnenten = [];                 /* {praefix, fn} */
  var abbestellAdapter = null;
  var benutzer = 'lokal';

  function melden(eintrag) {
    abonnenten.slice().forEach(function (a) {
      if (eintrag.pfad.indexOf(a.praefix) === 0) { try { a.fn(eintrag); } catch (e) { /* Abonnent kaputt */ } }
    });
  }
  function neuer(a, b) { return String(a) > String(b); }   /* ISO-Zeitstempel sind lexikografisch ordenbar */

  /* Übernimmt einen fremden Eintrag in den Cache, wenn er neuer ist. -> 'neu' | 'aktualisiert' | null */
  function uebernehme(pfad, e) {
    if (!e || typeof e.geaendert !== 'string') return null;
    var alt = cache[pfad];
    if (alt && !neuer(e.geaendert, alt.geaendert)) return null;
    cache[pfad] = { wert: kopie(e.wert), geaendert: e.geaendert, benutzer: e.benutzer || benutzer };
    return alt ? 'aktualisiert' : 'neu';
  }

  /* Lokalen Adapter neu einlesen (nach storage-Ereignis) und Unterschiede melden */
  function ausAdapterNeuLaden() {
    var neu = adapter.alleSync ? adapter.alleSync() : null;
    if (!neu) return;
    Object.keys(neu).forEach(function (p) {
      var alt = cache[p], n = neu[p];
      if (!alt || alt.geaendert !== n.geaendert || JSON.stringify(alt.wert) !== JSON.stringify(n.wert)) {
        cache[p] = { wert: kopie(n.wert), geaendert: n.geaendert, benutzer: n.benutzer || benutzer };
        melden({ pfad: p, wert: kopie(n.wert), geaendert: n.geaendert, benutzer: cache[p].benutzer });
      }
    });
    Object.keys(cache).forEach(function (p) {
      if (!neu[p]) { delete cache[p]; melden({ pfad: p, wert: undefined, geaendert: jetzt(), benutzer: benutzer, geloescht: true }); }
    });
  }

  function verbindeAdapter() {
    if (abbestellAdapter) { try { abbestellAdapter(); } catch (e) {} abbestellAdapter = null; }
    if (typeof adapter.abonnieren === 'function') {
      abbestellAdapter = adapter.abonnieren(function (ev) {
        if (ev && ev.__neuLaden) { ausAdapterNeuLaden(); return; }
        if (ev && ev.geloescht && ev.pfad) { delete cache[ev.pfad]; melden(ev); return; }
        if (ev && ev.pfad && uebernehme(ev.pfad, ev)) melden({ pfad: ev.pfad, wert: kopie(cache[ev.pfad].wert), geaendert: cache[ev.pfad].geaendert, benutzer: cache[ev.pfad].benutzer });
      });
    }
  }

  function schreibe(pfad, wert) {
    var e = { wert: kopie(wert), geaendert: jetzt(), benutzer: benutzer };
    var alt = cache[pfad];
    if (alt && alt.geaendert >= e.geaendert) {          /* gleiche Millisekunde: Reihenfolge wahren */
      e.geaendert = new Date(Date.parse(alt.geaendert) + 1).toISOString();
    }
    cache[pfad] = e;
    var voll = { pfad: pfad, wert: kopie(wert), geaendert: e.geaendert, benutzer: benutzer };
    var p;
    try { p = Promise.resolve(adapter.speichern(voll)); } catch (err) { p = Promise.reject(err); }
    p.catch(function () { /* offline o. Ä.: Cache bleibt, Abgleich später */ });
    melden(voll);
    return { eintrag: voll, versprechen: p };
  }
  function entferne(pfad) {
    if (!(pfad in cache)) return Promise.resolve();
    delete cache[pfad];
    var p;
    try { p = Promise.resolve(adapter.loeschen(pfad)); } catch (err) { p = Promise.reject(err); }
    p.catch(function () {});
    melden({ pfad: pfad, wert: undefined, geaendert: jetzt(), benutzer: benutzer, geloescht: true });
    return p.then(function () {}, function () {});
  }

  /* ── Migration aus dem alten Stand ───────────────────────── */
  function migriere() {
    if (!ls) {
      /* ohne localStorage gibt es nichts Altes zu holen */
      return;
    }
    var marke = null;
    try { marke = ls.getItem(MIGRATION_MARKE); } catch (e) {}
    if (marke) return;                                   /* schon erledigt */
    var geaendert = false;
    try {
      var raw = ls.getItem(ALT_V1);
      if (raw) {
        var alt = JSON.parse(raw);
        if (istObjekt(alt)) {
          Object.keys(alt).forEach(function (lektion) {
            if (!istObjekt(alt[lektion])) return;
            Object.keys(alt[lektion]).forEach(function (k) {
              var p = pfadVon(lektion, k);
              if (!cache[p]) { cache[p] = { wert: kopie(alt[lektion][k]), geaendert: EPOCHE, benutzer: benutzer }; geaendert = true; }
            });
          });
        }
      }
    } catch (e) { /* kaputter Altstand: ignorieren, Sicherung bleibt liegen */ }
    try {
      var st = ls.getItem(ALT_STAND);
      if (st !== null && st !== undefined) {
        var ps = 'inf-mb/bibliothek/stand';
        if (!cache[ps]) { cache[ps] = { wert: st, geaendert: EPOCHE, benutzer: benutzer }; geaendert = true; }
      }
    } catch (e) {}
    try {
      if (geaendert) ls.setItem(SCHLUESSEL, JSON.stringify(cache));
      ls.setItem(MIGRATION_MARKE, jetzt());              /* alter Schlüssel bleibt als Sicherung */
    } catch (e) { /* Speicher voll: nächster Seitenaufruf versucht es erneut */ }
  }

  function pfadVon(lektion, schluessel) {
    return 'inf-mb/' + String(lektion).toLowerCase() + '/' + schluessel;
  }

  /* ── Öffentliche API ─────────────────────────────────────── */
  var KS = {
    benutzer: benutzer,
    adapterName: adapter.name,
    pfad: pfadVon,

    laden: function (pfad) {
      return Promise.resolve(cache[pfad] ? kopie(cache[pfad].wert) : undefined);
    },
    speichern: function (pfad, wert) {
      var r = schreibe(pfad, wert);
      return r.versprechen.then(function () { return r.eintrag; }, function () { return r.eintrag; });
    },
    liste: function (praefix) {
      praefix = praefix || '';
      return Promise.resolve(Object.keys(cache).filter(function (p) { return p.indexOf(praefix) === 0; })
        .sort().map(function (p) { return { pfad: p, geaendert: cache[p].geaendert }; }));
    },
    loeschen: function (pfad) { return entferne(pfad); },
    abonnieren: function (praefix, fn) {
      var a = { praefix: praefix || '', fn: fn };
      abonnenten.push(a);
      return function () { var i = abonnenten.indexOf(a); if (i >= 0) abonnenten.splice(i, 1); };
    },
    sofort: {
      lesen: function (pfad) { return cache[pfad] ? kopie(cache[pfad].wert) : undefined; },
      schreiben: function (pfad, wert) {
        if (wert === undefined || wert === null) { entferne(pfad); return; }
        schreibe(pfad, wert);
      },
      loeschen: function (pfad) { entferne(pfad); }
    },

    exportieren: function () {
      var eintraege = {};
      Object.keys(cache).sort().forEach(function (p) {
        eintraege[p] = { wert: kopie(cache[p].wert), geaendert: cache[p].geaendert, benutzer: cache[p].benutzer };
      });
      return { format: EXPORT_FORMAT, version: 2, exportiert: jetzt(), benutzer: benutzer, eintraege: eintraege };
    },
    importieren: function (obj) {
      var quelle = obj && obj.format === EXPORT_FORMAT && istObjekt(obj.eintraege) ? obj.eintraege : null;
      if (!quelle) return Promise.reject(new Error('Das ist keine Arbeitsstand-Datei dieser Website.'));
      var z = { neu: 0, aktualisiert: 0, unveraendert: 0 };
      var warten = [];
      Object.keys(quelle).forEach(function (p) {
        if (p.indexOf('inf-mb/') !== 0) return;          /* nur eigene Pfade zulassen */
        var erg = uebernehme(p, quelle[p]);
        if (!erg) { z.unveraendert++; return; }
        z[erg === 'neu' ? 'neu' : 'aktualisiert']++;
        var voll = { pfad: p, wert: kopie(cache[p].wert), geaendert: cache[p].geaendert, benutzer: cache[p].benutzer };
        try { warten.push(Promise.resolve(adapter.speichern(voll)).catch(function () {})); } catch (e) {}
        melden(voll);
      });
      return Promise.all(warten).then(function () { return z; });
    },

    setzeAdapter: function (neuerAdapter) {
      if (!neuerAdapter || typeof neuerAdapter.speichern !== 'function' || typeof neuerAdapter.alle !== 'function') {
        return Promise.reject(new Error('Adapter braucht mindestens alle() und speichern().'));
      }
      adapter = neuerAdapter;
      KS.adapterName = adapter.name || 'unbekannt';
      if (adapter.benutzer) { benutzer = adapter.benutzer; KS.benutzer = benutzer; }
      verbindeAdapter();
      var vorher = kopie(cache);
      var sync = adapter.alleSync ? adapter.alleSync() : null;
      if (sync) Object.keys(sync).forEach(function (p) { uebernehme(p, sync[p]); });
      return Promise.resolve(adapter.alle()).then(function (fern) {
        fern = fern || {};
        var hoch = [];
        Object.keys(fern).forEach(function (p) {
          if (uebernehme(p, fern[p])) melden({ pfad: p, wert: kopie(cache[p].wert), geaendert: cache[p].geaendert, benutzer: cache[p].benutzer });
        });
        /* lokal Neueres bzw. nur lokal Vorhandenes nachreichen */
        Object.keys(cache).forEach(function (p) {
          var f = fern[p];
          if (!f || neuer(cache[p].geaendert, f.geaendert)) {
            hoch.push(Promise.resolve(adapter.speichern({ pfad: p, wert: kopie(cache[p].wert), geaendert: cache[p].geaendert, benutzer: benutzer })).catch(function () {}));
          }
        });
        return Promise.all(hoch).then(function () { return { vorher: Object.keys(vorher).length, jetzt: Object.keys(cache).length }; });
      });
    }
  };
  window.KursSpeicher = KS;

  /* Start: Cache aus dem lokalen Adapter füllen, dann migrieren, dann abonnieren */
  cache = lokalerAdapter.alleSync() || {};
  migriere();
  verbindeAdapter();

  /* ============================================================
     Oberfläche „Arbeitsstand sichern / laden“
     ============================================================ */
  function ui() {
    var css = document.createElement('style');
    css.textContent =
      '.ks-link{background:none;border:0;padding:0;margin:0;font:inherit;color:#fff;text-decoration:underline;cursor:pointer;min-height:44px}' +
      '.ks-link:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
      '.ks-box{max-width:60rem}' +
      '.ks-box p{margin:0 0 12px}' +
      '.ks-aktionen{display:flex;flex-wrap:wrap;gap:12px;margin:16px 0}' +
      '.ks-btn{font:inherit;font-weight:600;min-height:44px;padding:0 20px;border-radius:4px;border:2px solid #E2001A;background:#fff;color:#B50016;cursor:pointer}' +
      '.ks-btn:hover{background:#FAE5E8}.ks-btn:focus-visible{outline:3px solid #1A1A1A;outline-offset:2px}' +
      '.ks-status{min-height:1.5em;margin:8px 0 0;font-weight:600}.ks-status.ks-fehler{color:#B50016}' +
      '.ks-hinweis{color:#6B7280;font-size:.9375rem}' +
      'dialog.ks-dialog{margin:auto;border:0;border-top:3px solid #E2001A;border-radius:4px;padding:24px;max-width:min(36rem,calc(100vw - 32px));width:100%;color:#1A1A1A;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.25)}' +
      'dialog.ks-dialog::backdrop{background:rgba(0,0,0,.45)}' +
      'dialog.ks-dialog h2{font-size:1.25rem;margin:0 0 12px}';
    document.head.appendChild(css);

    function el(tag, attrs, text) {
      var n = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text) n.textContent = text;
      return n;
    }

    var datei = el('input', { type: 'file', accept: 'application/json,.json', hidden: '', 'aria-label': 'Arbeitsstand-Datei auswählen' });
    document.body.appendChild(datei);
    var statusNodes = [];
    function status(text, fehler) {
      statusNodes.forEach(function (n) { n.textContent = text; n.className = 'ks-status' + (fehler ? ' ks-fehler' : ''); });
    }
    function zwei(n) { return (n < 10 ? '0' : '') + n; }
    function sichern() {
      var obj = KS.exportieren(), n = Object.keys(obj.eintraege).length;
      var d = new Date();
      var name = 'informatik-arbeitsstand-' + d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()) + '.json';
      var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      var a = el('a', { href: URL.createObjectURL(blob), download: name });
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      status(n + (n === 1 ? ' Eintrag' : ' Einträge') + ' gesichert in ' + name + '.');
    }
    function laden() { datei.value = ''; datei.click(); }
    datei.addEventListener('change', function () {
      var f = datei.files && datei.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var obj;
        try { obj = JSON.parse(String(r.result)); } catch (e) { status('Die Datei konnte nicht gelesen werden (kein gültiges JSON).', true); return; }
        KS.importieren(obj).then(function (z) {
          status(z.neu + z.aktualisiert + ' Einträge übernommen, ' + z.aktualisiert + ' aktualisiert' +
            (z.unveraendert ? ' (' + z.unveraendert + ' bereits auf dem neuesten Stand)' : '') +
            '. Seite neu laden, um den Stand überall zu sehen.');
        }, function (err) { status(err.message || 'Import fehlgeschlagen.', true); });
      };
      r.onerror = function () { status('Die Datei konnte nicht gelesen werden.', true); };
      r.readAsText(f);
    });

    var HINWEIS = 'Dein Arbeitsstand bleibt nur in diesem Browser. Es wird nichts hochgeladen. ' +
      'Mit einer Sicherung kannst du ihn auf ein anderes Gerät mitnehmen oder nach dem Löschen der Browserdaten wiederherstellen.';

    function bedienfeld(mitUeberschrift) {
      var w = el('div', { class: 'ks-box' });
      var s = el('p', { class: 'ks-status', role: 'status', 'aria-live': 'polite' });
      statusNodes.push(s);
      var akt = el('div', { class: 'ks-aktionen' });
      var b1 = el('button', { type: 'button', class: 'ks-btn' }, 'Arbeitsstand sichern');
      var b2 = el('button', { type: 'button', class: 'ks-btn' }, 'Arbeitsstand laden');
      b1.addEventListener('click', sichern); b2.addEventListener('click', laden);
      akt.appendChild(b1); akt.appendChild(b2);
      w.appendChild(el('p', { class: 'ks-hinweis' }, HINWEIS));
      w.appendChild(akt); w.appendChild(s);
      return w;
    }

    /* Startseite: gut sichtbarer Abschnitt am Ende des Inhalts */
    var main = document.querySelector('main');
    if (document.body.getAttribute('data-page') === 'start' && main) {
      var sec = el('section', { class: 'k-section', id: 'arbeitsstand', 'aria-labelledby': 'h-arbeitsstand' });
      var h = el('h2', { class: 'k-section__title', id: 'h-arbeitsstand' }, 'Arbeitsstand sichern oder laden');
      sec.appendChild(h); sec.appendChild(bedienfeld());
      main.appendChild(sec);
    }

    /* Seitenfuß: unauffälliger Link, öffnet einen Dialog */
    var fuss = document.querySelector('.dhbw-footer__inner');
    if (fuss && typeof HTMLDialogElement !== 'undefined') {
      var dlg = el('dialog', { class: 'ks-dialog', 'aria-labelledby': 'ks-dlg-titel' });
      dlg.appendChild(el('h2', { id: 'ks-dlg-titel' }, 'Arbeitsstand sichern oder laden'));
      dlg.appendChild(bedienfeld());
      var zu = el('button', { type: 'button', class: 'ks-btn' }, 'Schließen');
      zu.addEventListener('click', function () { dlg.close(); });
      dlg.appendChild(zu);
      document.body.appendChild(dlg);
      var auf = el('button', { type: 'button', class: 'ks-link' }, 'Arbeitsstand sichern / laden');
      auf.addEventListener('click', function () { status('', false); dlg.showModal(); });
      var wrap = el('span');
      wrap.appendChild(auf);
      fuss.appendChild(wrap);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
