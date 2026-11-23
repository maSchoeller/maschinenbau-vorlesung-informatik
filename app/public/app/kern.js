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
    if (opt.signal) init.signal = opt.signal;
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
  function kontoSetzen(s) {
    var alt = kontoStand;
    kontoStand = s; kontoMerken(s);
    if (!alt || alt.angemeldet !== s.angemeldet || alt.benutzerId !== s.benutzerId || alt.anzeigename !== s.anzeigename) sende('konto', s);
    return s;
  }
  var konto = {
    status: function (neu) {
      if (kontoAnfrage && !neu) return kontoAnfrage;
      kontoAnfrage = api('ich').then(function (d) {
        if (!d || !d.angemeldet) return kontoSetzen(NICHT_ANGEMELDET);
        return kontoSetzen({ angemeldet: true, anzeigename: d.anzeigename || null, benutzerId: d.benutzerId || null, neu: !!d.neu });
      }, function (e) {
        if (e && e.offline) { kontoAnfrage = null; return kontoStand || NICHT_ANGEMELDET; }
        return kontoSetzen(NICHT_ANGEMELDET);   /* 401, 404 (API fehlt), 5xx: als nicht angemeldet behandeln */
      });
      return kontoAnfrage;
    },
    anmelden: function () {
      location.href = WURZEL + '.auth/login/github?post_login_redirect_uri=' + encodeURIComponent(location.pathname + location.search + location.hash);
    },
    abmelden: function () {
      kontoSetzen(NICHT_ANGEMELDET);
      location.href = WURZEL + '.auth/logout?post_logout_redirect_uri=' + encodeURIComponent(location.pathname);
    }
  };

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

  /* ── Fortschritt ─────────────────────────────────────────── */
  function lesen(lektion, k) { try { return (KS && KS.sofort.lesen(KS.pfad(lektion, k))) || {}; } catch (e) { return {}; } }
  var fortschritt = {
    lektion: function (nr) {
      return kurs().then(function (d) {
        var t = null;
        (d.termine || []).forEach(function (x) { if (x.nr === nr) t = x; });
        if (!t) throw new Error('Unbekannte Lektion ' + nr);
        var done = lesen(nr, 'done'), aufg = lesen(nr, 'aufg');
        var ab = (t.abschnitte || []).map(function (a) { return a.id; });
        var ids = [];
        (t.aufgaben || []).forEach(function (a) { (a.pruefbar || []).forEach(function (i) { if (ids.indexOf(i) < 0) ids.push(i); }); });
        return {
          abschnitte: { fertig: ab.filter(function (i) { return !!done[i]; }).length, gesamt: ab.length },
          aufgaben: { geloest: ids.filter(function (i) { return !!aufg[i]; }).length, gesamt: ids.length }
        };
      });
    }
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
