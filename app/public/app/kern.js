/* =============================================================
   app/kern.js – window.KursApp (Architektur-Vertrag, Abschnitt 4.4)
   Läuft als zweites Skript jeder Seite (nach assets/js/speicher.js), vor dem Bestand.
   Kein Framework, keine Module. Die Platzhalter __KURS_…__ ersetzt skripte/nach-build.mjs.
   ============================================================= */
(function () {
  'use strict';
  if (window.KursApp) return;

  var BUILD = { version: '__KURS_VERSION__', pyodide: '__KURS_PYODIDE__' };
  function gesetzt(w) { return !!w && w.indexOf('__KURS_') !== 0; }
  var VERSION = gesetzt(BUILD.version) ? BUILD.version : 'dev';

  /* Wurzel der App aus der eigenen Skript-URL: …/app/kern.js?v=… -> …/ */
  var skript = document.currentScript;
  var WURZEL = (skript && skript.src) ? skript.src.replace(/app\/kern\.js(\?.*)?$/, '') : (location.origin + '/');

  /* Vor allem anderen: lokale Pyodide-Basis, wenn der Build sie mitliefert (absolute URL, weil der
     Python-Worker aus einer blob:-URL läuft und relative Pfade dort nicht auflösen kann) */
  if (gesetzt(BUILD.pyodide) && !window.KURS_PYODIDE_BASIS) window.KURS_PYODIDE_BASIS = WURZEL + BUILD.pyodide;

  /* ── Python-Worker eingrenzen (Sicherheit) ─────────────────
     Python läuft im Worker derselben Herkunft (kurs.js). Dort läuft auch fremder Code (geteilte
     Programme); ohne Grenze könnte er mit der Sitzung der Person /api/ und /.auth/ aufrufen oder den
     Cache des Service Workers vergiften. Jeder klassische Worker der Seite startet deshalb mit diesem
     Vorspiel: Netz nur noch zu Kursdateien derselben Herkunft (assets/, pyodide/; fremde Ziele sperrt
     die CSP), keine Speicher der Herkunft (Cache Storage, IndexedDB), keine weiteren Worker, Kanäle
     oder Verbindungen zum Service Worker. Alle benutzten Eingebauten werden vorher festgehalten,
     damit Python sie nicht umbiegen kann. */
  function workerVorspiel(wurzel, erlaubt) {
    var g = self, ruf = Reflect.apply, NURL = URL, NRequest = Request, Zk = String, dekodiere = decodeURIComponent;
    var get = function (proto, name) { return Object.getOwnPropertyDescriptor(proto, name).get; };
    var urlOrigin = get(NURL.prototype, 'origin'), urlProto = get(NURL.prototype, 'protocol'), urlPfad = get(NURL.prototype, 'pathname');
    var reqUrl = get(NRequest.prototype, 'url');
    var finde = String.prototype.indexOf, nFetch = g.fetch, nOpen = g.XMLHttpRequest && g.XMLHttpRequest.prototype.open, nImport = g.importScripts;
    var herkunft = g.location.origin;
    var definiere = Object.defineProperty, beschreibung = Object.getOwnPropertyDescriptor, proto = Object.getPrototypeOf;
    /* Eigenschaft überall in der Prototypkette entfernen und fest durch wert ersetzen (Standard: undefined) */
    function weg(obj, name, wert) {
      for (var o = obj; o; o = proto(o)) { try { if (beschreibung(o, name)) delete o[name]; } catch (e) {} }
      try { definiere(obj, name, { value: wert, writable: false, configurable: false }); } catch (e) {}
    }
    function frei(u) {
      var x;
      try { x = new NURL(Zk(u), wurzel); } catch (e) { return false; }
      var pr = ruf(urlProto, x, []);
      if (pr === 'blob:' || pr === 'data:') return true;
      if (ruf(urlOrigin, x, []) !== herkunft) return true;   /* fremde Ziele: entscheidet die CSP */
      var p;
      try { p = dekodiere(ruf(urlPfad, x, [])); } catch (e) { return false; }
      if (ruf(finde, p, ['..']) >= 0 || ruf(finde, p, ['//']) >= 0 || ruf(finde, p, ['\\']) >= 0) return false;
      for (var i = 0; i < erlaubt.length; i++) if (ruf(finde, p, [erlaubt[i]]) === 0) return true;
      return false;
    }
    function gesperrt(u) { return new TypeError('Aus Python sind nur Kursdateien erreichbar (gesperrt: ' + Zk(u).slice(0, 120) + ')'); }
    var fetchNeu = function (eingabe, init) {
      var r;
      try { r = new NRequest(eingabe, init); } catch (e) { return Promise.reject(e); }
      var u = ruf(reqUrl, r, []);
      if (!frei(u)) return Promise.reject(gesperrt(u));
      return ruf(nFetch, g, [r]);
    };
    weg(g, 'fetch', fetchNeu);
    if (nOpen) {
      var openNeu = function (methode, u, asynchron, nutzer, kennwort) {
        var s = Zk(u);
        if (!frei(s)) throw gesperrt(s);
        return ruf(nOpen, this, arguments.length > 2 ? [Zk(methode), s, asynchron, nutzer, kennwort] : [Zk(methode), s]);
      };
      definiere(g.XMLHttpRequest.prototype, 'open', { value: openNeu, writable: false, configurable: false });
    }
    if (nImport) {
      var importNeu = function () {
        var liste = [];
        for (var i = 0; i < arguments.length; i++) {
          var s = Zk(arguments[i]);
          if (!frei(s)) throw gesperrt(s);
          definiere(liste, i, { value: s, writable: true, enumerable: true, configurable: true });
        }
        return ruf(nImport, g, liste);
      };
      weg(g, 'importScripts', importNeu);
    }
    ['caches', 'indexedDB', 'Worker', 'SharedWorker', 'BroadcastChannel', 'EventSource', 'WebSocket', 'WebTransport', 'cookieStore'].forEach(function (n) { weg(g, n); });
    if (g.navigator) { weg(g.navigator, 'serviceWorker'); weg(g.navigator, 'locks'); }
    /* Hat etwas nicht gegriffen, startet Python lieber gar nicht als ohne Grenze */
    var dicht = g.fetch === fetchNeu && (!nImport || g.importScripts === importNeu) && (!nOpen || g.XMLHttpRequest.prototype.open === openNeu) &&
      !g.caches && !g.indexedDB && !g.Worker && !g.SharedWorker && !g.BroadcastChannel && !(g.navigator && g.navigator.serviceWorker);
    if (!dicht) throw new Error('Python-Umgebung konnte nicht abgesichert werden');
  }
  (function () {
    var NWorker = window.Worker;
    if (!NWorker || !window.Blob || !window.URL || !URL.createObjectURL) return;
    var wurzelPfad;
    try { wurzelPfad = new URL(WURZEL).pathname; } catch (e) { wurzelPfad = '/'; }
    var erlaubt = [wurzelPfad + 'assets/', wurzelPfad + (gesetzt(BUILD.pyodide) ? BUILD.pyodide : 'pyodide/')];
    var vorspiel = '(' + workerVorspiel.toString() + ')(' + JSON.stringify(location.origin + '/') + ',' + JSON.stringify(erlaubt) + ');\n';
    function KursWorker(skript, optionen) {
      if (!(this instanceof KursWorker)) throw new TypeError("Failed to construct 'Worker': Please use the 'new' operator.");
      if (optionen && optionen.type === 'module') return new NWorker(skript, optionen);
      var ziel = new URL(String(skript), location.href).href;
      var blob = new Blob([vorspiel + 'importScripts(' + JSON.stringify(ziel) + ');\n'], { type: 'text/javascript' });
      return new NWorker(URL.createObjectURL(blob), optionen);
    }
    KursWorker.prototype = NWorker.prototype;
    window.Worker = KursWorker;
  })();

  var body = document.body;
  var KS = window.KursSpeicher;

  /* Relativer Weg von der aktuellen Seite zur Wurzel: './' oder '../' */
  function basisBerechnen() {
    try {
      var w = new URL(WURZEL).pathname, s = location.pathname;
      if (s.indexOf(w) !== 0) return './';
      var tiefe = s.slice(w.length).split('/').length - 1;
      return tiefe > 0 ? new Array(tiefe + 1).join('../') : './';
    } catch (e) { return './'; }
  }
  var basis = basisBerechnen();
  var lektionAttr = body ? (body.getAttribute('data-lesson') || '') : '';

  var seite = {
    art: body ? (body.getAttribute('data-page') || null) : null,
    bereich: body ? (body.getAttribute('data-bereich') || null) : null,
    lektion: /^V\d\d$/.test(lektionAttr) ? lektionAttr : null,
    basis: basis,
    version: VERSION
  };

  function url(p) {
    p = String(p || '');
    if (/^[a-z]+:|^\/\//i.test(p)) return p;
    if (p.charAt(0) === '/') p = p.slice(1);
    return (basis === './' ? '' : basis) + p;
  }

  /* ── Ereignisse ─────────────────────────────────────────── */
  var hoerer = {};
  function an(name, fn) {
    (hoerer[name] = hoerer[name] || []).push(fn);
    return function () { var l = hoerer[name] || [], i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); };
  }
  /* -> Anzahl der Empfänger (0 = niemand hört zu) */
  function sende(name, daten) {
    var l = (hoerer[name] || []).slice();
    l.forEach(function (fn) { try { fn(daten); } catch (e) { if (window.console) console.error('KursApp-Ereignis ' + name + ':', e); } });
    return l.length;
  }

  /* ── API ─────────────────────────────────────────────────── */
  function api(pfad, opt) {
    opt = opt || {};
    var p = String(pfad || '').replace(/^\/+/, '').replace(/^api\//, '');
    var kopf = { 'X-Kurs-App': '1', 'Accept': 'application/json' };
    var init = { method: (opt.method || 'GET').toUpperCase(), headers: kopf, credentials: 'same-origin', cache: 'no-store' };
    if (opt.headers) Object.keys(opt.headers).forEach(function (k) { kopf[k] = opt.headers[k]; });
    if (opt.body !== undefined) { init.body = typeof opt.body === 'string' ? opt.body : JSON.stringify(opt.body); kopf['Content-Type'] = 'application/json'; }
    /* Die API verlangt bei allen ändernden Anfragen content-type JSON, auch ohne Body (DELETE) */
    else if (init.method !== 'GET' && init.method !== 'HEAD') kopf['Content-Type'] = 'application/json';
    if (opt.signal) init.signal = opt.signal;
    /* keepalive: die Anfrage überlebt das Schließen der Seite (Browser-Grenze: 64 KB Body) */
    if (opt.keepalive) init.keepalive = true;
    return fetch(WURZEL + 'api/' + p, init).then(function (r) {
      var typ = r.headers.get('content-type') || '';
      var lesen = typ.indexOf('application/json') >= 0 ? r.json().catch(function () { return null; }) : r.text().then(function () { return null; }, function () { return null; });
      return lesen.then(function (daten) {
        if (r.ok) return daten;
        var f = new Error((daten && daten.meldung) || ('Anfrage fehlgeschlagen (' + r.status + ')'));
        f.status = r.status; f.daten = daten; f.offline = false;
        throw f;
      });
    }, function (e) {
      if (e && e.name === 'AbortError') throw e;
      var f = new Error('Keine Verbindung zum Server.');
      f.status = 0; f.daten = null; f.offline = true;
      throw f;
    });
  }

  /* ── Konto ───────────────────────────────────────────────── */
  var KONTO_SCHLUESSEL = 'inf-mb-app:konto';   /* nur dieses Gerät, nicht im Abgleich */
  var NICHT_ANGEMELDET = { angemeldet: false, anzeigename: null, benutzerId: null };
  function kontoGemerkt() {
    try { var r = JSON.parse(localStorage.getItem(KONTO_SCHLUESSEL) || 'null'); if (r && typeof r.angemeldet === 'boolean') return r; } catch (e) {}
    return null;
  }
  function kontoMerken(s) { try { localStorage.setItem(KONTO_SCHLUESSEL, JSON.stringify(s)); } catch (e) {} }
  var kontoStand = kontoGemerkt();
  var kontoAnfrage = null;

  /* Gäste sparsam: Hat /api/ich in diesem Tab „nicht angemeldet“ gemeldet, fragt die nächste Seite
     nicht erneut – aber nur beim Weiterklicken innerhalb der App. Frisch gefragt wird immer: auf
     konto.html, nach Neuladen, beim Kommen von außen oder von /.auth/ (Rückkehr vom Login), nach
     Klick auf Anmelden (auch in einem anderen Tab), wenn ein anderer Tab angemeldet ist, und nach 30 Minuten. */
  var GAST_SCHLUESSEL = 'inf-mb-app:gast';           /* sessionStorage: Zeit der letzten Gast-Antwort */
  var ANMELDUNG_SCHLUESSEL = 'inf-mb-app:anmeldung'; /* localStorage: Zeit des letzten Klicks auf Anmelden */
  var GAST_DAUER = 30 * 60000;
  function zahl(speicher, k) { try { return Number(speicher.getItem(k)) || 0; } catch (e) { return 0; } }
  function gastVergessen() { try { sessionStorage.removeItem(GAST_SCHLUESSEL); } catch (e) {} }
  function gastMerken() { try { sessionStorage.setItem(GAST_SCHLUESSEL, String(Date.now())); } catch (e) {} }
  function innerhalbDerApp() {
    var r = document.referrer || '';
    if (!r) return false;
    try {
      var u = new URL(r);
      if (u.origin !== location.origin) return false;
      if (u.pathname.indexOf('/.auth/') >= 0 || /^\/(login|logout)(\/|$)/.test(u.pathname)) return false;
    } catch (e) { return false; }
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') return false;
    } catch (e) {}
    return true;
  }
  function gastBekannt() {
    var t = zahl(sessionStorage, GAST_SCHLUESSEL);
    if (!t || Date.now() - t > GAST_DAUER) return false;
    if (zahl(localStorage, ANMELDUNG_SCHLUESSEL) >= t) return false;
    var g = kontoGemerkt();
    if (g && g.angemeldet) return false;
    if (body && body.getAttribute('data-page') === 'konto') return false;
    return innerhalbDerApp();
  }
  function kontoSetzen(s) {
    var alt = kontoStand;
    kontoStand = s; kontoMerken(s);
    if (!alt || alt.angemeldet !== s.angemeldet || alt.benutzerId !== s.benutzerId || alt.anzeigename !== s.anzeigename || !!alt.dozent !== !!s.dozent) sende('konto', s);
    return s;
  }
  var konto = {
    status: function (neu) {
      if (kontoAnfrage && !neu) return kontoAnfrage;
      if (!neu && gastBekannt()) { kontoAnfrage = Promise.resolve(kontoSetzen(NICHT_ANGEMELDET)); return kontoAnfrage; }
      kontoAnfrage = api('ich').then(function (d) {
        if (!d || !d.angemeldet) { gastMerken(); return kontoSetzen(NICHT_ANGEMELDET); }
        gastVergessen();
        return kontoSetzen({ angemeldet: true, anzeigename: d.anzeigename || null, benutzerId: d.benutzerId || null, neu: !!d.neu, dozent: !!d.dozent });
      }, function (e) {
        if (e && e.offline) { kontoAnfrage = null; return kontoStand || NICHT_ANGEMELDET; }
        return kontoSetzen(NICHT_ANGEMELDET);   /* 401, 404 (API fehlt), 5xx: als nicht angemeldet behandeln */
      });
      return kontoAnfrage;
    },
    anmelden: function () {
      gastVergessen();
      try { localStorage.setItem(ANMELDUNG_SCHLUESSEL, String(Date.now())); } catch (e) {}
      location.href = WURZEL + '.auth/login/github?post_login_redirect_uri=' + encodeURIComponent(eigenerPfad() + location.search + location.hash);
    },
    abmelden: function () {
      gastVergessen();
      sitzungsdatenWeg();
      kontoSetzen(NICHT_ANGEMELDET);
      location.href = WURZEL + '.auth/logout?post_logout_redirect_uri=' + encodeURIComponent(eigenerPfad());
    }
  };
  /* Rücksprungziel nach Login/Logout: immer ein Pfad dieser Herkunft. Ein Aufruf wie //fremd.example/x
     (die 404-Seite antwortet auf jeden Pfad) würde sonst als protokollrelative fremde Adresse weitergereicht. */
  function eigenerPfad() { return '/' + String(location.pathname || '').replace(/^[\/\\]+/, ''); }
  /* Beim Abmelden (auch nach „Konto löschen“): Tutor-Verlauf und -Kontingent dieses Tabs entfernen,
     damit sie weder ein Gast noch das nächste Konto im selben Tab sieht oder mitschickt. */
  function sitzungsdatenWeg() {
    try {
      for (var i = sessionStorage.length - 1; i >= 0; i--) {
        var k = sessionStorage.key(i);
        if (k && k.indexOf('inf-mb-app:tutor:') === 0) sessionStorage.removeItem(k);
      }
    } catch (e) {}
  }

  /* ── Kursdaten ───────────────────────────────────────────── */
  var kursAnfrage = null;
  function kurs() {
    if (kursAnfrage) return kursAnfrage;
    var schluessel = 'inf-mb-app:kurs:' + VERSION;
    try { var s = sessionStorage.getItem(schluessel); if (s) { kursAnfrage = Promise.resolve(JSON.parse(s)); return kursAnfrage; } } catch (e) {}
    kursAnfrage = fetch(WURZEL + 'app/daten/kurs.json?v=' + VERSION).then(function (r) {
      if (!r.ok) throw new Error('kurs.json nicht ladbar (' + r.status + ')');
      return r.json();
    }).then(function (d) {
      try { sessionStorage.setItem(schluessel, JSON.stringify(d)); } catch (e) {}
      return d;
    });
    kursAnfrage.catch(function () { kursAnfrage = null; });
    return kursAnfrage;
  }

  /* ── Fortschritt ─────────────────────────────────────────
     Die eine Regel für alle Anzeigen (Lektionswähler, Heute, Lernpfad; stand.js baut darauf auf):
     - Abschnitte: Pflichtabschnitte der Lerneinheit; „Deep Dive (freiwillig)“ zählt nirgends mit.
     - Aufgaben: je prüfbarem Teil (data-id) des Labors, wie labor.js zählt.
     - fertig: alle Pflichtabschnitte und alle prüfbaren Teile; begonnen: irgendein Eintrag in
       done, aufg, begonnen oder gesehen; sonst offen.
     - Knobelaufgaben (freiwillig; in kurs.json a.knobel = ihre Kennungen, pruefbar leer) zählen nirgends: weder bei
       „gelöst“ noch bei „begonnen“. Ihr Status liegt trotzdem in aufg und begonnen (Anzeige im Labor). */
  function lesen(lektion, k) { try { return (KS && KS.sofort.lesen(KS.pfad(lektion, k))) || {}; } catch (e) { return {}; } }
  function istFreiwillig(a) { return /freiwillig/i.test((a && a.titel) || ''); }
  function anzahl(o) { return Object.keys(o || {}).length; }
  /* Kennungen der Knobelaufgaben eines Termins (aus kurs.json) */
  function knobelIds(t) {
    var ids = [];
    (t.aufgaben || []).forEach(function (a) { (a.knobel || []).forEach(function (i) { ids.push(i); }); });
    return ids;
  }
  /* Eimer ohne die Knobelaufgaben (Kopie) */
  function ohneKnobel(t, eimer) {
    var k = knobelIds(t), r = {};
    Object.keys(eimer || {}).forEach(function (i) { if (k.indexOf(i) < 0) r[i] = eimer[i]; });
    return r;
  }
  /* Eimer nur mit den prüfbaren Teilen des Labors (Kopie). Übungen in der Lerneinheit (Aufgabe mit eigener Kennung,
     nicht in kurs.json) und Knobelaufgaben gehören nicht dazu: Wer nur die Lerneinheit bearbeitet hat, hat das Labor nicht begonnen. */
  function nurPruefbare(t, eimer) {
    var ids = [], r = {};
    (t.aufgaben || []).forEach(function (a) { (a.pruefbar || []).forEach(function (i) { ids.push(i); }); });
    Object.keys(eimer || {}).forEach(function (i) { if (ids.indexOf(i) >= 0) r[i] = eimer[i]; });
    return r;
  }
  /* Stationen mit prüfbaren Teilen, die noch nicht ganz gelöst sind */
  function offeneAufgaben(t, aufg, beg) {
    aufg = aufg || lesen(t.nr, 'aufg'); beg = beg || lesen(t.nr, 'begonnen');
    return (t.aufgaben || []).filter(function (a) {
      return !a.knobel && (a.pruefbar || []).length && !a.pruefbar.every(function (i) { return !!aufg[i]; });
    }).map(function (a) {
      var angefangen = a.pruefbar.some(function (i) { return !!aufg[i] || !!beg[i]; });
      return { id: a.id, titel: a.titel, teil: a.teil, sterne: a.sterne, minuten: a.minuten, angefangen: angefangen };
    });
  }
  /* Termin aus kurs.json -> Stand (synchron) */
  function terminStand(t) {
    var done = lesen(t.nr, 'done'), aufg = lesen(t.nr, 'aufg'), beg = lesen(t.nr, 'begonnen'), ges = lesen(t.nr, 'gesehen');
    var pflicht = (t.abschnitte || []).filter(function (a) { return !istFreiwillig(a); });
    var fertigA = pflicht.filter(function (a) { return !!done[a.id]; }).length;
    var offenA = pflicht.filter(function (a) { return !done[a.id]; })[0];
    var stationen = offeneAufgaben(t, aufg, beg);
    var ids = [];
    (t.aufgaben || []).forEach(function (a) { (a.pruefbar || []).forEach(function (i) { if (ids.indexOf(i) < 0) ids.push(i); }); });
    var geloest = ids.filter(function (i) { return !!aufg[i]; }).length;
    var hatLabor = !!t.labor && ids.length > 0;
    var verstehenFertig = pflicht.length === 0 || fertigA === pflicht.length;
    var laborFertig = !hatLabor || geloest === ids.length;
    var gearbeitet = anzahl(done) + anzahl(ohneKnobel(t, aufg)) + anzahl(ohneKnobel(t, beg)) > 0;
    var begonnen = gearbeitet || anzahl(ges) > 0;
    var status = (verstehenFertig && laborFertig && (pflicht.length || hatLabor)) ? 'fertig' : (begonnen ? 'begonnen' : 'offen');
    return {
      nr: t.nr,
      abschnitte: { fertig: fertigA, gesamt: pflicht.length },
      aufgaben: { geloest: geloest, gesamt: ids.length },
      verstehen: { fertig: fertigA, gesamt: pflicht.length, offenAnker: offenA ? (offenA.anker || offenA.id) : null, ganz: verstehenFertig },
      labor: { geloest: geloest, gesamt: ids.length, offenAnker: stationen.length ? stationen[0].id : null, ganz: laborFertig, vorhanden: hatLabor },
      begonnen: begonnen,
      gearbeitet: gearbeitet,
      status: status
    };
  }
  var fortschritt = {
    /* Promise<Stand> (Vertrag 4.4: abschnitte {fertig, gesamt}, aufgaben {geloest, gesamt}; dazu status u. a.) */
    lektion: function (nr) {
      return kurs().then(function (d) {
        var t = null;
        (d.lektionen || []).forEach(function (x) { if (x.nr === nr) t = x; });
        if (!t) throw new Error('Unbekannte Lektion ' + nr);
        return terminStand(t);
      });
    },
    termin: terminStand,
    offeneAufgaben: offeneAufgaben,
    knobelIds: knobelIds,
    ohneKnobel: ohneKnobel,
    nurPruefbare: nurPruefbare,
    freiwillig: istFreiwillig
  };

  /* ── Meldungen ───────────────────────────────────────────── */
  function slot(n) { return document.querySelector('[data-app-slot="' + n + '"]'); }
  function melde(text, o) {
    o = o || {};
    var ziel = slot('meldungen');
    if (!ziel) return null;
    var m = document.createElement('div');
    m.className = 'app-meldung app-meldung--' + (o.art || 'info');
    m.setAttribute('role', o.art === 'fehler' ? 'alert' : 'status');
    var t = document.createElement('span');
    t.className = 'app-meldung__text';
    t.textContent = String(text);
    m.appendChild(t);
    function weg() { if (m.parentNode) m.parentNode.removeChild(m); }
    if (o.aktion && o.aktion.text) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'app-meldung__aktion'; b.textContent = o.aktion.text;
      b.addEventListener('click', function () { weg(); if (typeof o.aktion.fn === 'function') o.aktion.fn(); });
      m.appendChild(b);
    }
    var zu = document.createElement('button');
    zu.type = 'button'; zu.className = 'app-meldung__zu'; zu.setAttribute('aria-label', 'Meldung schließen');
    zu.appendChild(icon('x'));
    zu.addEventListener('click', weg);
    m.appendChild(zu);
    ziel.appendChild(m);
    if (!o.aktion && o.dauer !== 0) setTimeout(weg, o.dauer || 6000);
    return { schliessen: weg };
  }

  /* ── Panel (rechts; Inhalt kommt von der jeweiligen Rolle, z. B. Tutor) ── */
  var panelId = null, panelVorher = null;
  var panel = {
    oeffnen: function (id) {
      var el = slot('panel');
      if (!el) return;
      id = id || 'tutor';
      if (panelId === id && !el.hidden) return;
      var a = document.activeElement;
      if (panelId === null && a && a !== document.body && !el.contains(a)) panelVorher = a;
      panelId = id;
      el.hidden = false;
      el.setAttribute('data-panel', id);
      body.classList.add('app--panel');
      var inhalt = slot('panel-inhalt');
      sende('panel', { id: id, offen: true, element: inhalt });
      var fokus = el.querySelector('[autofocus], textarea, input, select') || el;
      try { fokus.focus({ preventScroll: true }); } catch (e) { fokus.focus(); }
    },
    schliessen: function () {
      var el = slot('panel');
      if (!el || panelId === null) return;
      var id = panelId;
      panelId = null;
      el.hidden = true;
      el.removeAttribute('data-panel');
      body.classList.remove('app--panel');
      sende('panel', { id: id, offen: false, element: slot('panel-inhalt') });
      if (panelVorher && document.contains(panelVorher)) { try { panelVorher.focus(); } catch (e) {} }
      panelVorher = null;
    },
    istOffen: function () { return panelId !== null; },
    id: function () { return panelId; },
    element: function () { return slot('panel-inhalt'); }
  };

  /* ── Panelbreite: ziehbar (Zeiger und Tastatur), je Gerät in localStorage ──
     Mindestens 320 px, höchstens der ganze Platz neben der Leiste. Gemerkt wird der Wunsch;
     angezeigt wird er auf das aktuelle Fenster begrenzt (wächst das Fenster, kommt er zurück). */
  var INHALT_MIN = 520, PANEL_MIN = 320, PANEL_STANDARD = 380, PANEL_SCHLUESSEL = 'inf-mb-app:panelbreite';
  var panelWunsch = PANEL_STANDARD, panelIst = PANEL_STANDARD;
  function panelMax() {
    var wurzel = document.documentElement, rail = 76;   /* = --app-rail-w in shell.css */
    var breit = (wurzel && wurzel.clientWidth) || 10000;
    /* ab 1100 px steht das Panel neben dem Inhalt: dem Inhalt bleibt mindestens INHALT_MIN; darunter liegt es darüber */
    return Math.max(PANEL_MIN, Math.floor(breit - rail - (breit >= 1100 ? INHALT_MIN : 0)));
  }
  function panelBegrenzt(b) { return Math.min(panelMax(), Math.max(PANEL_MIN, Math.round(b))); }
  function panelGriffNachziehen() {
    var g = slot('panel-griff');
    if (!g) return;
    g.setAttribute('aria-valuemin', String(PANEL_MIN));
    g.setAttribute('aria-valuemax', String(panelMax()));
    g.setAttribute('aria-valuenow', String(panelIst));
    g.setAttribute('aria-valuetext', panelIst + ' Pixel');
  }
  function panelBreiteSetzen(b, merken) {
    panelIst = panelBegrenzt(b);
    if (merken) {
      panelWunsch = panelIst;
      try { if (panelWunsch === PANEL_STANDARD) localStorage.removeItem(PANEL_SCHLUESSEL); else localStorage.setItem(PANEL_SCHLUESSEL, String(panelWunsch)); } catch (e) { /* gesperrt: gilt nur für diese Seite */ }
    }
    if (document.documentElement && document.documentElement.style) document.documentElement.style.setProperty('--app-panel-w', panelIst + 'px');
    panelGriffNachziehen();
  }
  try { var gemerkt = parseInt(localStorage.getItem(PANEL_SCHLUESSEL), 10); if (gemerkt > 0) panelWunsch = gemerkt; } catch (e) { /* ohne Speicher: Standard */ }
  panelBreiteSetzen(panelWunsch, false);
  window.addEventListener('resize', function () { panelBreiteSetzen(panelWunsch, false); });
  /* Wird der Inhalt schmal (breites Panel), schalten die Seiten auf eine Spalte: html.app-eng (Regeln in kurs.css, v01.css) */
  (function () {
    var inh = document.querySelector('.app-inhalt');
    if (!inh || typeof ResizeObserver === 'undefined') return;
    function pruefen() { document.documentElement.classList.toggle('app-eng', inh.clientWidth > 0 && inh.clientWidth < 860); }
    new ResizeObserver(pruefen).observe(inh);
    pruefen();
  })();
  (function () {
    var g = slot('panel-griff');
    if (!g) return;
    var zieht = false, rahmen = 0, ziel = 0;
    function anwenden() { rahmen = 0; panelBreiteSetzen(ziel, false); }
    g.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button > 0) return;
      e.preventDefault();
      zieht = true;
      try { g.focus({ preventScroll: true }); } catch (x) {}
      try { g.setPointerCapture(e.pointerId); } catch (x) {}
      body.classList.add('app--ziehen');
    });
    g.addEventListener('pointermove', function (e) {
      if (!zieht) return;
      ziel = document.documentElement.clientWidth - e.clientX;
      if (!rahmen) rahmen = requestAnimationFrame(anwenden);
    });
    function ende() {
      if (!zieht) return;
      zieht = false;
      if (rahmen) { cancelAnimationFrame(rahmen); rahmen = 0; panelBreiteSetzen(ziel, false); }
      body.classList.remove('app--ziehen');
      panelBreiteSetzen(panelIst, true);
    }
    g.addEventListener('pointerup', ende);
    g.addEventListener('pointercancel', ende);
    g.addEventListener('lostpointercapture', ende);
    g.addEventListener('dblclick', function () { panelBreiteSetzen(PANEL_STANDARD, true); });
    g.addEventListener('keydown', function (e) {
      var schritt = e.shiftKey ? 96 : 24, b = null;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') b = panelIst + schritt;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') b = panelIst - schritt;
      else if (e.key === 'Home') b = PANEL_MIN;
      else if (e.key === 'End') b = panelMax();
      else if (e.key === 'Enter') b = PANEL_STANDARD;
      if (b === null) return;
      e.preventDefault();
      panelBreiteSetzen(b, true);
    });
  })();

  /* ── Symbole ─────────────────────────────────────────────── */
  var NS = 'http://www.w3.org/2000/svg';
  function icon(id) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'k-ic');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    var u = document.createElementNS(NS, 'use');
    u.setAttribute('href', WURZEL + 'assets/img/icons.svg#i-' + id);
    s.appendChild(u);
    return s;
  }

  /* Netzstatus für alle, die zuhören (pwa.js darf zusätzlich senden) */
  window.addEventListener('online', function () { sende('netz', { online: true }); });
  window.addEventListener('offline', function () { sende('netz', { online: false }); });

  window.KursApp = {
    seite: seite,
    url: url,
    wurzel: WURZEL,
    kurs: kurs,
    api: api,
    konto: konto,
    an: an,
    sende: sende,
    melde: melde,
    panel: panel,
    fortschritt: fortschritt,
    icon: icon
  };
})();
