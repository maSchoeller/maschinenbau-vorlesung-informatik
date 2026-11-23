/* =============================================================
   app/speicher-azure.js – Konto-Adapter für KursSpeicher (Vertrag Abschnitt 7, Rolle Konto und Abgleich)
   Lokal zuerst: localStorage bleibt die synchrone Quelle (Kern-Schlüssel dhbw-inf-mb:speicher:v2).
   Der Adapter reicht Änderungen gebündelt per POST /api/abgleich nach und holt Änderungen anderer Geräte.

   Zusammenspiel mit site/assets/js/speicher.js (unverändert):
   - setzeAdapter() ruft zuerst abonnieren(fn): dort stoße ich ein Neuladen des Kern-Caches an,
     dann alleSync() (= localStorage), dann alle() (= Abgleich, Rückgabe: der lokale Gesamtstand).
   - Änderungen vom Server schreibe ich selbst in localStorage und melde fn({__neuLaden:true});
     der Kern vergleicht Cache und Speicher und benachrichtigt die Abonnenten. Andere Tabs bekommen
     dasselbe über das storage-Ereignis.
   - Der Kern ruft speichern(eintrag) und loeschen(pfad) bei jedem Schreiben. Ich schreibe lokal (gebündelt)
     und merke den Pfad als „offen“ (ein localStorage-Schlüssel je Pfad, damit Tabs sich nicht überschreiben).

   Eigene Schlüssel (nur dieses Gerät, nicht im Abgleich):
     inf-mb-app:abgleich        Meta: besitzer, seit, letzter, problem, naechster, fehler, entscheidung{id:'ja'|'nein'}
     inf-mb-app:offen:<pfad>    {geaendert, geloescht?}   offene Änderung (Wert steht im Kern-Speicher)
     inf-mb-app:gast-stand      geparkter Stand ohne Konto, wenn der Nutzer „nein“ gewählt hat

   Globales Objekt: window.KursAbgleich (status, jetzt, beenden, frage, …). Texte nur per textContent.
   ============================================================= */
(function () {
  'use strict';
  var KS = window.KursSpeicher, KA = window.KursApp;
  if (!KS || !KA || window.KursAbgleich) return;

  var SPEICHER = 'dhbw-inf-mb:speicher:v2';
  var META = 'inf-mb-app:abgleich';
  var OFFEN = 'inf-mb-app:offen:';
  var GAST = 'inf-mb-app:gast-stand';
  var KONTO = 'inf-mb-app:konto';
  var SPERRE = 'inf-mb-abgleich';
  var TAKT = 60000;          /* Abfrage im sichtbaren Tab */
  var TAKT_MIN = 45000;      /* ein anderer Tab hat gerade abgeglichen: überspringen */
  var START_MIN = 20000;     /* Seitenwechsel innerhalb von 20 s: kein neuer Abruf beim Start */
  var FOKUS_MIN = 10000;     /* Fokus-Wechsel höchstens alle 10 s */
  var PAUSE = 1500, PAUSE_MAX = 10000;   /* Schreibpause, spätestens nach 10 s */
  var LEERLAUF = 10 * 60000; /* ohne Eingabe keine Taktabfragen (Kosten) */
  var BATCH = 500;

  /* ── localStorage, immer abgesichert ─────────────────────── */
  var ls = null;
  try { ls = window.localStorage; ls.setItem('__a', '1'); ls.removeItem('__a'); } catch (e) { ls = null; }
  function lsLies(k) { try { return ls.getItem(k); } catch (e) { return null; } }
  function lsSchreib(k, v) { try { ls.setItem(k, v); return true; } catch (e) { return false; } }
  function lsWeg(k) { try { ls.removeItem(k); } catch (e) {} }
  function json(k, vorgabe) {
    var r = lsLies(k);
    if (!r) return vorgabe;
    try { var o = JSON.parse(r); return o && typeof o === 'object' ? o : vorgabe; } catch (e) { return vorgabe; }
  }
  function jetzt() { return new Date().toISOString(); }
  function kopie(w) { return w === undefined ? undefined : JSON.parse(JSON.stringify(w)); }
  function schluesselMit(praefix) {
    var r = [];
    try { for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (k && k.indexOf(praefix) === 0) r.push(k); } } catch (e) {}
    return r;
  }

  /* ── Meta ────────────────────────────────────────────────── */
  function leseMeta() {
    var m = json(META, {});
    return {
      besitzer: m.besitzer || null, seit: m.seit || null, letzter: +m.letzter || 0, problem: m.problem || null,
      naechster: +m.naechster || 0, fehler: +m.fehler || 0,
      entscheidung: m.entscheidung && typeof m.entscheidung === 'object' ? m.entscheidung : {}
    };
  }
  function schreibeMeta(patch) {
    var m = leseMeta();
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    lsSchreib(META, JSON.stringify(m));
    return m;
  }

  /* ── Kern-Speicher (gebündelt) ───────────────────────────── */
  var patch = {}, patchGeplant = false;
  function rohLies() { var d = json(SPEICHER, {}); return Array.isArray(d) ? {} : d; }
  function leere() {
    var ks = Object.keys(patch);
    if (!ks.length) return;
    var d = rohLies(), p = patch;
    patch = {};
    ks.forEach(function (k) { if (p[k] === null) delete d[k]; else d[k] = p[k]; });
    lsSchreib(SPEICHER, JSON.stringify(d));
  }
  function lies() { leere(); return rohLies(); }
  function schreibGanz(d) { patch = {}; return lsSchreib(SPEICHER, JSON.stringify(d)); }
  function patchen(pfad, wert) {
    patch[pfad] = wert;
    if (!patchGeplant) { patchGeplant = true; Promise.resolve().then(function () { patchGeplant = false; leere(); }); }
  }

  /* ── Offene Änderungen (je Pfad ein Schlüssel) ───────────── */
  function markiere(pfad, geaendert, geloescht) {
    lsSchreib(OFFEN + pfad, JSON.stringify(geloescht ? { geaendert: geaendert, geloescht: true } : { geaendert: geaendert }));
  }
  function entmarkiere(pfad, geaendert) {
    var v = json(OFFEN + pfad, null);
    if (v && v.geaendert === geaendert) lsWeg(OFFEN + pfad);
  }
  function offenListe() {
    return schluesselMit(OFFEN).map(function (k) {
      var v = json(k, null) || {};
      return { pfad: k.slice(OFFEN.length), geaendert: String(v.geaendert || ''), geloescht: !!v.geloescht };
    });
  }
  function offenAnzahl() { return schluesselMit(OFFEN).length; }
  function offenLeeren() { schluesselMit(OFFEN).forEach(lsWeg); }
  function zaehle(d) { return Object.keys(d).filter(function (p) { return p.indexOf('inf-mb/app/') !== 0; }).length; }

  /* ── Zustand ─────────────────────────────────────────────── */
  var an = false, benutzerId = null, melde = null;
  var laeuft = false, wartet = false, nochmal = false;
  var takt = null, planT = null, planErst = 0;
  var letzteAktivitaet = Date.now(), schlief = false;
  var vorAnschluss = {};
  var gemeldetAbgelehnt = {};

  /* ── Adapter ─────────────────────────────────────────────── */
  var adapter = {
    name: 'azure-api',
    alleSync: function () { return lies(); },
    alle: function () {
      var m = leseMeta();
      if (navigator.onLine === false) { zeigen(); return Promise.resolve(lies()); }
      if (Date.now() - m.letzter < START_MIN && !offenAnzahl()) return Promise.resolve(lies());   /* gerade erst abgeglichen (Seitenwechsel, anderer Tab) */
      return abgleichen('start', { ohneWartezeit: true }).then(function () { return lies(); }, function () { return lies(); });
    },
    speichern: function (e) {
      letzteAktivitaet = Date.now();
      patchen(e.pfad, { wert: e.wert, geaendert: e.geaendert, benutzer: e.benutzer });
      merkeJung(e.pfad, { wert: e.wert, geaendert: e.geaendert, benutzer: e.benutzer });
      if (an) { markiere(e.pfad, e.geaendert, false); planen(); zeigen(); }
      return Promise.resolve();
    },
    loeschen: function (pfad) {
      var alt = lies()[pfad];
      var ts = jetzt();
      if (alt && alt.geaendert >= ts) ts = new Date(Date.parse(alt.geaendert) + 1).toISOString();
      patchen(pfad, null);
      merkeJung(pfad, { geloescht: true, geaendert: ts });
      if (an) { markiere(pfad, ts, true); planen(); zeigen(); }
      return Promise.resolve();
    },
    abonnieren: function (fn) {
      melde = fn;
      function bei(ev) {
        if (ev.key === null || ev.key === SPEICHER) { heile(); fn({ __neuLaden: true }); }
        if (ev.key === null || ev.key === META || (ev.key && ev.key.indexOf(OFFEN) === 0)) zeigen();
      }
      window.addEventListener('storage', bei);
      try { fn({ __neuLaden: true }); } catch (e) {}   /* Kern-Cache auf den vorbereiteten Speicher bringen */
      return function () { window.removeEventListener('storage', bei); if (melde === fn) melde = null; };
    }
  };
  /* Zwei Tabs schreiben den gemeinsamen Kern-Speicher (ein JSON) „lesen, ändern, schreiben“ und können einander
     im selben Augenblick überschreiben. Eigene junge Schreibvorgänge werden deshalb bei Fremdänderung geprüft und nötigenfalls erneuert. */
  var jung = {};
  function merkeJung(pfad, e) {
    e.t = Date.now(); jung[pfad] = e;
    if (Object.keys(jung).length > 3000) heile();
  }
  function heile() {
    var t = Date.now(), d = null, aend = false;
    Object.keys(jung).forEach(function (p) {
      var j = jung[p];
      if (t - j.t > 10000) { delete jung[p]; return; }
      if (!d) d = lies();
      var e = d[p];
      if (j.geloescht) { if (e && e.geaendert <= j.geaendert) { delete d[p]; aend = true; } }
      else if (!e || e.geaendert < j.geaendert) { d[p] = { wert: j.wert, geaendert: j.geaendert, benutzer: j.benutzer }; aend = true; }
    });
    if (aend) schreibGanz(d);
  }
  function neuLaden() { if (melde) { try { melde({ __neuLaden: true }); } catch (e) {} } }

  /* ── Auslöser ────────────────────────────────────────────── */
  function planen() {
    if (!an) return;
    var t = Date.now();
    if (!planErst) planErst = t;
    clearTimeout(planT);
    planT = setTimeout(function () { planT = null; planErst = 0; abgleichen('schreiben'); }, Math.min(PAUSE, Math.max(0, planErst + PAUSE_MAX - t)));
  }
  function mitSperre(nurWennFrei, fn) {
    var L = navigator.locks;
    if (!L || !L.request) return fn();
    return L.request(SPERRE, nurWennFrei ? { ifAvailable: true } : {}, function (lock) { return lock ? fn() : false; });
  }
  function abgleichen(grund, opt) {
    opt = opt || {};
    if (!an) return Promise.resolve(false);
    if (laeuft || wartet) { if (grund === 'schreiben') nochmal = true; return Promise.resolve(false); }
    var m = leseMeta(), t = Date.now();
    if (!opt.erzwingen) {
      if (m.problem === 'sitzung') { if (grund === 'fokus') sitzungPruefen(); return Promise.resolve(false); }
      if (navigator.onLine === false) { zeigen(); return Promise.resolve(false); }
      if (!opt.ohneWartezeit && t < m.naechster) { zeigen(); return Promise.resolve(false); }
      if (opt.ohneWartezeit && m.problem === 'bremse' && t < m.naechster) return Promise.resolve(false);
      if (grund === 'takt' && t - m.letzter < TAKT_MIN) return Promise.resolve(false);
      if (grund === 'fokus' && t - m.letzter < FOKUS_MIN) return Promise.resolve(false);
    }
    var frei = grund === 'takt' || grund === 'fokus';
    wartet = true;
    return Promise.resolve(mitSperre(frei, function () { return lauf(grund); })).then(function (r) { wartet = false; return r !== false; }, function (e) { wartet = false; throw e; });
  }

  /* Ein vollständiger Abgleich (mehrere Runden, wenn mehr offen ist, als in ein Bündel passt).
     Bündel werden nach Anzahl UND Bytes begrenzt (Server: Body höchstens 256 KB, Eintragswert höchstens 64 KB). */
  var BUENDEL_BYTES = 200 * 1024, EINZEL_BYTES = 64 * 1024;
  function bytes(t) { try { return new TextEncoder().encode(t).length; } catch (e) { return t.length * 3; } }
  var zuGrossGemeldet = false;
  function zuGrossMelden(n) {
    if (!n || zuGrossGemeldet) return;
    zuGrossGemeldet = true;
    KA.melde((n === 1 ? 'Ein Eintrag ist' : n + ' Einträge sind') + ' zu groß für den Abgleich (über 64 KB) und ' + (n === 1 ? 'bleibt' : 'bleiben') + ' nur auf diesem Gerät.', { art: 'fehler', dauer: 12000 });
  }
  function lauf() {
    laeuft = true; zeigen();
    var maxBytes = BUENDEL_BYTES, maxAnzahl = BATCH;
    function runde() {
      heile();
      var m = leseMeta();
      var liste = offenListe().sort(function (a, b) { return a.geaendert < b.geaendert ? -1 : a.geaendert > b.geaendert ? 1 : 0; });
      var d = lies(), senden = [], marke = {}, ts = {}, groesse = 200, abgeschnitten = false, zuGross = 0;
      for (var i = 0; i < liste.length; i++) {
        var o = liste[i], item, e = null;
        if (senden.length >= maxAnzahl) { abgeschnitten = true; break; }
        if (o.geloescht) item = { pfad: o.pfad, geaendert: o.geaendert, geloescht: true };
        else {
          e = d[o.pfad];
          if (!e) { entmarkiere(o.pfad, o.geaendert); continue; }
          var wertText = JSON.stringify(e.wert);
          if (bytes(wertText === undefined ? 'null' : wertText) > EINZEL_BYTES) { entmarkiere(o.pfad, o.geaendert); zuGross++; continue; }
          item = { pfad: o.pfad, wert: e.wert, geaendert: e.geaendert };
        }
        var b = bytes(JSON.stringify(item)) + 1;
        if (senden.length && groesse + b > maxBytes) { abgeschnitten = true; break; }
        senden.push(item); groesse += b; marke[o.pfad] = o.geaendert; ts[o.pfad] = o.geloescht ? o.geaendert : e.geaendert;
      }
      zuGrossMelden(zuGross);
      var body = { eintraege: senden };
      if (m.seit) body.seit = m.seit;
      return KA.api('abgleich', { method: 'POST', body: body }).then(function (antwort) {
        antwort = antwort || {};
        Object.keys(marke).forEach(function (p) { entmarkiere(p, marke[p]); });
        abgelehntMelden(antwort.abgelehnt, marke);
        wendeAn(antwort.eintraege || [], ts);
        schreibeMeta({ seit: antwort.serverzeit || m.seit, letzter: Date.now(), problem: null, fehler: 0, naechster: 0 });
        return abgeschnitten && offenAnzahl() > 0 ? runde() : true;
      }, function (err) {
        /* 413: das Bündel war dem Server zu groß. Halbieren statt dasselbe zu wiederholen; ein einzelner Eintrag wird aufgegeben. */
        if (err && err.status === 413) {
          if (senden.length > 1) { maxBytes = Math.max(2048, Math.floor(groesse / 2)); maxAnzahl = Math.max(1, Math.floor(senden.length / 2)); return runde(); }
          Object.keys(marke).forEach(function (p) { entmarkiere(p, marke[p]); });
          zuGrossMelden(Math.max(1, Object.keys(marke).length));
          return offenAnzahl() > 0 ? runde() : true;
        }
        throw err;
      });
    }
    return runde().then(function () { fertig(); return true; }, function (e) { fertig(); fehlerBehandeln(e); return false; });
    function fertig() {
      laeuft = false;
      if (nochmal) { nochmal = false; planen(); }
      zeigen();
    }
  }

  /* Abgelehnte Einträge: aus „offen“ nehmen (sonst ewige Wiederholung), Meldung einmal anzeigen */
  function abgelehntMelden(liste, marke) {
    if (!liste || !liste.length) return;
    var neu = [];
    liste.forEach(function (a) {
      if (a && a.pfad && marke[a.pfad] !== undefined) entmarkiere(a.pfad, marke[a.pfad]);
      var code = (a && a.fehler) || 'abgelehnt';
      if (!gemeldetAbgelehnt[code]) { gemeldetAbgelehnt[code] = 1; neu.push(a && a.meldung ? a.meldung : 'Ein Eintrag wurde vom Server nicht angenommen.'); }
    });
    if (neu.length) KA.melde(liste.length + (liste.length === 1 ? ' Eintrag' : ' Einträge') + ' nicht abgeglichen: ' + neu[0] + ' Der Stand auf diesem Gerät bleibt.', { art: 'fehler', dauer: 12000 });
  }

  /* Server-Stand in den lokalen Speicher übernehmen (neuester gewinnt); dann Kern und Tabs benachrichtigen */
  function wendeAn(remote, gesendet) {
    if (!remote.length) return;
    var d = lies(), geaendert = false;
    remote.forEach(function (e) {
      if (!e || typeof e.pfad !== 'string' || typeof e.geaendert !== 'string') return;
      var lokal = d[e.pfad];
      var marke = json(OFFEN + e.pfad, null);
      var eigene = gesendet[e.pfad] !== undefined && (!marke || marke.geaendert === gesendet[e.pfad]);
      var lokalZeit = lokal ? lokal.geaendert : '';
      if (marke && marke.geaendert > lokalZeit) lokalZeit = marke.geaendert;
      /* Was ich gerade gesendet habe und seither nicht änderte, gilt so, wie der Server es gespeichert hat */
      if (!eigene && lokalZeit && e.geaendert <= lokalZeit) return;
      if (e.geloescht) {
        if (!lokal) return;
        delete d[e.pfad]; geaendert = true;
      } else {
        if (lokal && lokal.geaendert === e.geaendert && JSON.stringify(lokal.wert) === JSON.stringify(e.wert)) return;
        d[e.pfad] = { wert: e.wert, geaendert: e.geaendert, benutzer: benutzerId || 'lokal' }; geaendert = true;
      }
      if (marke) lsWeg(OFFEN + e.pfad);   /* der Server-Stand ist neuer als die offene Änderung */
      delete jung[e.pfad];
    });
    if (!geaendert) return;
    if (!schreibGanz(d)) throw Object.assign(new Error('Speicher voll'), { speicherVoll: true });
    neuLaden();
  }

  function fehlerBehandeln(e) {
    var s = e && e.status, t = Date.now(), m = leseMeta();
    if (s === 401) { schreibeMeta({ problem: 'sitzung' }); sitzungPruefen(); }
    else if (e && e.offline && navigator.onLine === false) { /* offline: auf das online-Ereignis warten */ }
    else if (s === 429) schreibeMeta({ problem: 'bremse', naechster: t + 15 * 60000 });
    else {
      var n = m.fehler + 1;
      schreibeMeta({ problem: 'server', fehler: n, naechster: t + Math.min(5 * 60000, 15000 * Math.pow(2, n - 1)) });
    }
    zeigen();
  }
  var sitzungGeprueft = 0;
  function sitzungPruefen() {
    if (Date.now() - sitzungGeprueft < 60000) return;
    sitzungGeprueft = Date.now();
    KA.konto.status(true).then(function (st) {
      if (st && st.angemeldet && st.benutzerId === benutzerId) { schreibeMeta({ problem: null, naechster: 0 }); abgleichen('fokus', { erzwingen: true }); }
    });
  }

  /* ── Anzeige: Statusfeld in der Kopfzeile, Ereignis „abgleich“ ───────── */
  var feld = null, letzterText = null;
  function plural(n) { return n + (n === 1 ? ' Änderung wartet' : ' Änderungen warten') + ' auf Abgleich'; }
  function statusDaten() {
    var m = leseMeta(), offen = offenAnzahl(), online = navigator.onLine !== false;
    var z = laeuft ? 'laeuft' : (an && m.problem) ? 'fehler' : offen > 0 ? 'offen' : 'ok';
    return { zustand: an ? z : 'aus', offen: offen, grund: !an ? null : m.problem ? m.problem : !online ? 'offline' : null, online: online,
      letzter: m.letzter ? new Date(m.letzter).toISOString() : null, aktiv: an, benutzerId: benutzerId, besitzer: m.besitzer };
  }
  function zeigen() {
    var s = statusDaten();
    var text = '', knopf = false;
    if (an) {
      if (s.grund === 'sitzung') { text = 'Sitzung abgelaufen'; knopf = true; }
      else if (s.grund === 'bremse') text = 'Abgleich pausiert (Tageslimit)';
      else if (s.offen > 0 && (s.grund === 'offline' || s.grund === 'server')) text = plural(s.offen);
      else if (s.grund === 'server' && leseMeta().fehler >= 3) text = 'Abgleich gestört';
    }
    var schluessel = text + '|' + knopf;
    if (feld && schluessel !== letzterText) {
      letzterText = schluessel;
      feld.textContent = '';
      if (text) {
        var t = document.createElement('span'); t.textContent = text; feld.appendChild(t);
        if (knopf) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'ka-statusknopf'; b.textContent = 'Neu anmelden';
          b.addEventListener('click', function () { KA.konto.anmelden(); });
          feld.appendChild(b);
        }
      }
    }
    try { KA.sende('abgleich', { zustand: s.zustand === 'aus' ? 'ok' : s.zustand, offen: s.offen, grund: s.grund, letzter: s.letzter, aktiv: s.aktiv }); } catch (e) {}
  }

  /* ── Erster Login, Benutzerwechsel ───────────────────────── */
  function vorbereiten(st) {
    var U = st.benutzerId, m = leseMeta(), d = lies(), n = zaehle(d);
    if (m.besitzer === U) return Promise.resolve({ weiter: true, normal: true });
    function ausgang() { return Promise.resolve({ weiter: true, normal: false }); }
    function annehmen() {
      var e = {}; Object.keys(m.entscheidung).forEach(function (k) { e[k] = m.entscheidung[k]; }); e[U] = 'ja';
      schreibeMeta({ besitzer: U, seit: null, problem: null, naechster: 0, fehler: 0, entscheidung: e });
      offenLeeren();
      Object.keys(lies()).forEach(function (p) { markiere(p, lies()[p].geaendert, false); });
      return ausgang();
    }
    function trennen() {
      var e = {}; Object.keys(m.entscheidung).forEach(function (k) { e[k] = m.entscheidung[k]; }); e[U] = 'nein';
      var park = json(GAST, {}), voll = lies();
      Object.keys(voll).forEach(function (p) { if (!park[p] || park[p].geaendert < voll[p].geaendert) park[p] = voll[p]; });
      lsSchreib(GAST, JSON.stringify(park));
      schreibGanz({}); offenLeeren();
      schreibeMeta({ besitzer: U, seit: null, problem: null, naechster: 0, fehler: 0, entscheidung: e });
      return ausgang();
    }
    if (m.besitzer && m.besitzer !== U) {
      var rest = offenAnzahl();
      return frage({
        titel: 'Auf diesem Gerät liegt der Stand eines anderen Kontos',
        absaetze: ['Dieser Browser enthält noch Lernstand (' + n + (n === 1 ? ' Eintrag' : ' Einträge') + ') aus einem anderen Konto. Er wird nicht in dein Konto übernommen.' +
          (rest ? ' ' + rest + (rest === 1 ? ' Änderung davon ist' : ' Änderungen davon sind') + ' noch nicht abgeglichen und gehen beim Entfernen verloren.' : ''),
          'Du kannst den Stand vorher als Datei sichern.'],
        knoepfe: [
          { text: 'Als Datei sichern', wert: 'sichern', art: 'leise', bleibt: true },
          { text: 'Entfernen und mit meinem Konto weiter', wert: 'entfernen', art: 'primaer' },
          { text: 'Abbrechen und abmelden', wert: 'abbruch', art: 'leise' }],
        beiKnopf: function (w) { if (w === 'sichern') dateiSichern(); }
      }).then(function (w) {
        if (w === 'entfernen') { schreibGanz({}); offenLeeren(); schreibeMeta({ besitzer: null, seit: null }); neuLaden(); m = leseMeta(); return annehmen(); }
        if (w === 'abbruch') { KA.konto.abmelden(); }
        return { weiter: false };
      });
    }
    if (n === 0) return annehmen();
    var ent = m.entscheidung[U];
    if (ent === 'ja') return annehmen();
    if (ent === 'nein') return trennen();
    return frage({
      titel: 'Bisherigen Arbeitsstand übernehmen?',
      absaetze: ['Deinen bisherigen Arbeitsstand aus diesem Browser in dein Konto übernehmen?',
        'In diesem Browser liegen ' + n + (n === 1 ? ' Eintrag' : ' Einträge') + ' (abgehakte Abschnitte, gelöste Aufgaben, eigene Programme). ' +
        'Bei „Ja“ wird er mit dem Stand in deinem Konto zusammengeführt, je Eintrag gewinnt der neueste. ' +
        'Bei „Nein“ bleibt er nur auf diesem Gerät, wird nicht hochgeladen und kommt nach dem Abmelden wieder zurück.'],
      knoepfe: [{ text: 'Ja, übernehmen', wert: 'ja', art: 'primaer' }, { text: 'Nein, getrennt halten', wert: 'nein', art: 'leise' }]
    }).then(function (w) {
      if (w === 'ja') return annehmen();
      if (w === 'nein') return trennen();
      return { weiter: false };   /* Esc: später entscheiden, diese Seite bleibt lokal */
    });
  }

  function anheften(st, normal) {
    benutzerId = st.benutzerId;
    adapter.benutzer = benutzerId;
    an = true;
    schreibeMeta({ problem: null, naechster: 0 });
    if (normal) {
      var d = lies(), seit0 = leseMeta().letzter;
      /* Alles, was seit dem letzten Abgleich lokal entstand (z. B. als Gast nach „Stand hier behalten“ oder bei
         gestörter Anmeldeabfrage), gilt als offen; der Server führt je Eintrag zusammen (neuester gewinnt). */
      Object.keys(d).forEach(function (p) {
        var z = Date.parse(d[p].geaendert);
        if (z > seit0 && !json(OFFEN + p, null)) markiere(p, d[p].geaendert, false);
      });
      Object.keys(vorAnschluss).forEach(function (p) {
        var v = vorAnschluss[p];
        if (v.geloescht) markiere(p, v.geaendert, true);
        else if (d[p]) markiere(p, d[p].geaendert, false);
      });
    }
    vorAnschluss = {};
    starteAusloeser();
    return KS.setzeAdapter(adapter).then(function () { zeigen(); }, function () { zeigen(); });
  }

  function starteAusloeser() {
    clearInterval(takt);
    takt = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - letzteAktivitaet > LEERLAUF) { schlief = true; return; }
      abgleichen('takt');
    }, TAKT);
  }
  window.addEventListener('online', function () { zeigen(); abgleichen('online', { ohneWartezeit: true }); });
  window.addEventListener('offline', function () { zeigen(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') abgleichen('fokus');
    else if (offenAnzahl()) abgleichen('schreiben');
  });
  window.addEventListener('focus', function () { abgleichen('fokus'); });
  var aktT = 0;
  function aktiv() {
    var t = Date.now();
    if (t - aktT < 1000) return;
    aktT = t; letzteAktivitaet = t;
    if (schlief) { schlief = false; abgleichen('fokus'); }
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (n) { window.addEventListener(n, aktiv, { passive: true, capture: true }); });

  /* Schreibzugriffe vor dem Anschluss merken (die Anmeldung wird erst per Netz geklärt) */
  KS.abonnieren('', function (e) {
    if (an || !e || !e.pfad) return;
    vorAnschluss[e.pfad] = { geaendert: e.geaendert, geloescht: !!e.geloescht };
  });

  /* ── Beenden (Abmelden, Konto gelöscht) ──────────────────── */
  function beenden(opt) {
    opt = opt || {};
    var vorher = an && !opt.ohneAbgleich && navigator.onLine !== false ? abgleichen('abmelden', { erzwingen: true }).catch(function () {}) : Promise.resolve();
    return vorher.then(function () {
      an = false; clearInterval(takt); clearTimeout(planT);
      leere();
      var verworfen = offenAnzahl();
      if (opt.behalten) {
        if (opt.kontoGeloescht) { offenLeeren(); schreibeMeta({ besitzer: null, seit: null, problem: null }); }
      } else {
        var gast = json(GAST, null);
        schreibGanz(gast || {}); lsWeg(GAST);
        offenLeeren();
        schreibeMeta({ besitzer: null, seit: null, problem: null, naechster: 0, fehler: 0 });
      }
      neuLaden(); zeigen();
      return { offenVerworfen: opt.behalten && !opt.kontoGeloescht ? 0 : verworfen };
    });
  }

  /* ── Datei sichern (für Dialoge) ─────────────────────────── */
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  function dateiname(vorne) { var d = new Date(); return vorne + '-' + d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()) + '.json'; }
  function herunterladen(obj, name) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function dateiSichern() { herunterladen(KS.exportieren(), dateiname('informatik-arbeitsstand')); }

  /* ── Dialog ──────────────────────────────────────────────── */
  var cssDa = false;
  function dialogCss() {
    if (cssDa) return; cssDa = true;
    var s = document.createElement('style');
    s.textContent =
      'dialog.ka-dialog{margin:auto;border:0;border-top:3px solid var(--red,#E2001A);border-radius:var(--r-card,8px);padding:24px 28px;width:min(34rem,calc(100vw - 48px));box-sizing:border-box;color:var(--text,#1A1A1A);background:#fff;box-shadow:0 10px 36px rgba(0,0,0,.28)}' +
      'dialog.ka-dialog::backdrop{background:rgba(0,0,0,.45)}' +
      '.ka-dialog h2{margin:0 0 12px;font-size:1.25rem}.ka-dialog p{margin:0 0 12px;max-width:none}' +
      '.ka-dialog__knoepfe{display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-end;margin-top:20px}' +
      '.ka-statusknopf{font:inherit;font-weight:700;color:var(--red-dark,#B50016);background:none;border:1px solid var(--red-dark,#B50016);border-radius:4px;min-height:32px;padding:0 10px;margin-left:8px;cursor:pointer}' +
      '.ka-statusknopf:hover{background:var(--red-tint,#FAE5E8)}' +
      '.ka-punkt{position:absolute;top:8px;left:calc(50% + 7px);width:9px;height:9px;border-radius:50%;background:var(--k-ok,#1B7F3B);border:2px solid #fff;box-sizing:content-box}' +
      '.ka-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
    document.head.appendChild(s);
  }
  /* o: {titel, absaetze[], inhalt?:Node, knoepfe:[{text, wert, art:'primaer'|'leise', bleibt?, braucht?}], pruefen?:fn, beiKnopf?:fn}
     -> Promise<wert | null>  (Esc und Klick daneben: null) */
  var dialogNr = 0;
  function frage(o) {
    dialogCss();
    return new Promise(function (aufloesen) {
      var id = 'ka-dlg-' + (++dialogNr);
      var vorher = document.activeElement;
      var dlg = document.createElement('dialog');
      dlg.className = 'ka-dialog'; dlg.setAttribute('aria-labelledby', id);
      var h = document.createElement('h2'); h.id = id; h.textContent = o.titel; dlg.appendChild(h);
      (o.absaetze || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; dlg.appendChild(p); });
      if (o.inhalt) dlg.appendChild(o.inhalt);
      var zeile = document.createElement('div'); zeile.className = 'ka-dialog__knoepfe';
      var knoepfe = (o.knoepfe || []).map(function (k) {
        var b = document.createElement('button'); b.type = 'button';
        b.className = 'k-btn' + (k.art === 'primaer' ? '' : ' k-btn--ghost');
        b.textContent = k.text;
        b.addEventListener('click', function () {
          if (typeof o.beiKnopf === 'function') o.beiKnopf(k.wert);
          if (!k.bleibt) dlg.close(String(k.wert === null ? '' : k.wert));
        });
        zeile.appendChild(b);
        return { el: b, def: k };
      });
      function pruefenNeu() {
        var ok = typeof o.pruefen === 'function' ? !!o.pruefen() : true;
        knoepfe.forEach(function (k) { if (k.def.braucht) k.el.disabled = !ok; });
      }
      dlg.addEventListener('input', pruefenNeu);
      dlg.appendChild(zeile);
      var fertig = false;
      dlg.addEventListener('close', function () {
        if (fertig) return; fertig = true;
        var rv = dlg.returnValue;
        var treffer = knoepfe.filter(function (k) { return String(k.def.wert === null ? '' : k.def.wert) === rv; })[0];
        dlg.remove();
        if (vorher && document.contains(vorher)) { try { vorher.focus(); } catch (e) {} }
        aufloesen(treffer ? treffer.def.wert : null);
      });
      document.body.appendChild(dlg);
      pruefenNeu();
      dlg.showModal();
      var ziel = o.fokus !== undefined && knoepfe[o.fokus] ? knoepfe[o.fokus].el : dlg.querySelector('input, textarea') || (knoepfe[0] && knoepfe[0].el);
      if (ziel) ziel.focus();
    });
  }

  /* ── Leiste: Anmeldestatus beim Konto-Ziel ───────────────── */
  function leiste(s) {
    var a = document.querySelector('[data-app-konto]');
    if (!a) return;
    var t = a.querySelector('.app-rail__text');
    var drin = !!(s && s.angemeldet);
    if (t) t.textContent = drin ? 'Konto' : 'Anmelden';
    var punkt = a.querySelector('.ka-punkt'), sr = a.querySelector('.ka-sr');
    if (drin) {
      dialogCss();
      if (!punkt) { punkt = document.createElement('span'); punkt.className = 'ka-punkt'; punkt.setAttribute('aria-hidden', 'true'); a.appendChild(punkt); }
      if (!sr) { sr = document.createElement('span'); sr.className = 'ka-sr'; a.appendChild(sr); }
      sr.textContent = ', angemeldet' + (s.anzeigename ? ' als ' + s.anzeigename : '');
      a.title = 'Konto: angemeldet' + (s.anzeigename ? ' als ' + s.anzeigename : '');
    } else {
      if (punkt) punkt.remove();
      if (sr) sr.remove();
      a.title = 'Konto: nicht angemeldet';
    }
  }
  function ui() {
    var slot = document.querySelector('[data-app-slot="status"]');
    if (slot) {
      feld = document.createElement('span'); feld.setAttribute('data-abgleich-status', ''); feld.className = 'ka-status';
      slot.appendChild(feld);
      letzterText = null; zeigen();
    }
    var gemerkt = json(KONTO, null);
    leiste(gemerkt && gemerkt.angemeldet ? gemerkt : null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();

  KA.an('konto', function (s) {
    leiste(s);
    if (an && s && !s.angemeldet) { schreibeMeta({ problem: 'sitzung' }); zeigen(); }
  });
  KA.an('netz', function () { zeigen(); });

  /* ── Öffentlich ──────────────────────────────────────────── */
  window.KursAbgleich = {
    status: statusDaten,
    jetzt: function () { return abgleichen('manuell', { erzwingen: true }); },
    beenden: beenden,
    frage: frage,
    herunterladen: herunterladen,
    dateiname: dateiname,
    anzahlLokal: function () { return zaehle(lies()); },
    gastStandDa: function () { return !!lsLies(GAST); }
  };

  /* ── Start ───────────────────────────────────────────────── */
  if (ls) {
    /* Bekanntes, frisch abgeglichenes Konto: kein /api/ich bei jedem Seitenwechsel; der Abgleich selbst merkt eine abgelaufene Sitzung (401) */
    var gem = json(KONTO, null), m0 = leseMeta();
    var bekannt = gem && gem.angemeldet && gem.benutzerId && gem.benutzerId === m0.besitzer && !m0.problem && Date.now() - m0.letzter < 5 * 60000;
    (bekannt ? Promise.resolve(gem) : KA.konto.status()).then(function (st) {
      if (!st || !st.angemeldet || !st.benutzerId) return;
      return vorbereiten(st).then(function (r) { if (r && r.weiter) return anheften(st, r.normal); });
    }).catch(function (e) { if (window.console) console.error('Abgleich:', e); });
  }
})();
