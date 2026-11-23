/* =============================================================
   app/werkbank.js – Werkbank (Rolle Werkbank, Vertrag Abschnitt 8)
   Programme liegen in KursSpeicher unter inf-mb/werkbank/prog:<id> = {titel, code, erstellt, geaendert, quelle?, eingaben?}.
   Ausführen, Eingaben, Diagramme und Schritt für Schritt kommen vom Bestands-Runner (kurs.js), der Editor von editor.js.
   Lokal zuerst: Tippen speichert entprellt in den Speicher; das Konto gleicht im Hintergrund ab (speicher-azure.js).
   ============================================================= */
(function () {
  'use strict';
  var KS = window.KursSpeicher, WB = window.KursWerkbank, App = window.KursApp;
  if (!KS || !WB || !App) return;

  var PROG_RE = /^inf-mb\/werkbank\/prog:([A-Za-z0-9._-]{1,100})$/;
  var VERZOEGERUNG = 700;          /* ms nach dem letzten Tastendruck */
  var ABGLEICH_GRENZE = 64 * 1024; /* Eintrag höchstens 64 KB (API) */

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text != null) n.textContent = text;
    return n;
  }
  function jetzt() { return new Date().toISOString(); }

  var liste = $('#wb-liste'), zahl = $('#wb-zahl'), leer = $('#wb-leer'), arbeit = $('#wb-arbeit');
  var titelFeld = $('#wb-titel'), status = $('#wb-status'), gross = $('#wb-gross');
  var ta = $('#wb-code'), box = $('#wb-runner');
  if (!liste || !arbeit || !ta || !box) return;

  var programme = [];        /* [{id, titel, geaendert}] neueste zuerst */
  var aktuellId = null;
  var geaendert = false;     /* ungespeicherte Eingaben im Editor */
  var laedt = false;         /* wir setzen gerade selbst Werte ein: keine Änderung melden */
  var timer = null, listeTimer = null, wartetAuf = null;
  var selbstGeloescht = {};

  /* ── Zugriff auf Speicher und Runner ──────────────────────── */
  function lies(id) {
    var w = KS.sofort.lesen(WB.pfad(id));
    return w && typeof w === 'object' && typeof w.code === 'string' ? w : null;
  }
  function runner() { return box._kRunner || null; }
  function editorHolen() {
    return window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(ta) : ta.value;
  }
  function editorSetzen(code) {
    if (window.KursEditor && window.KursEditor.setValue) window.KursEditor.setValue(ta, code);
    else { ta.value = code; ta.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  function eingabenSetzen(text) {
    var r = runner();
    if (!r || !r.stdinTa) return;
    /* auch das Eingabefeld ist ein CodeMirror-Editor (editor.js hängt sich an jedes Textfeld im Runner) */
    if (window.KursEditor && window.KursEditor.setValue) window.KursEditor.setValue(r.stdinTa, text || '');
    else { r.stdinTa.value = text || ''; r.stdinTa.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  function ausgabeLeeren() {
    var r = runner();
    if (!r) return;
    r.out.textContent = ''; r.out.hidden = true;
    if (r.out._kRich) r.out._kRich.textContent = '';
    var st = box.querySelector('.k-runner__status');
    if (st) st.textContent = '';
  }
  function editorFokus() {
    var c = window.KursEditor && window.KursEditor.controller ? window.KursEditor.controller(ta) : null;
    if (c && c.view) c.view.focus(); else ta.focus();
  }

  /* ── Anzeige ──────────────────────────────────────────────── */
  function zeitText(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var h = new Date(), tag = function (x) { return x.getFullYear() * 10000 + x.getMonth() * 100 + x.getDate(); };
    var uhr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (tag(d) === tag(h)) return 'heute ' + uhr;
    var g = new Date(h); g.setDate(h.getDate() - 1);
    if (tag(d) === tag(g)) return 'gestern ' + uhr;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function statusSagen(text) { status.textContent = text; }

  function zeigeAnsicht() {
    var hat = programme.length > 0;
    leer.hidden = hat || !!aktuellId;
    arbeit.hidden = !aktuellId;
  }

  function listeZeichnen() {
    var fokusId = document.activeElement && document.activeElement.getAttribute && liste.contains(document.activeElement)
      ? document.activeElement.getAttribute('data-id') : null;
    liste.textContent = '';
    programme.forEach(function (p) {
      var li = el('li');
      var a = el('a', 'wb-prog');
      a.href = '#' + encodeURIComponent(p.id);
      a.setAttribute('data-id', p.id);
      if (p.id === aktuellId) a.setAttribute('aria-current', 'true');
      a.appendChild(el('span', 'wb-prog__titel', p.titel));
      var t = el('time', 'wb-prog__zeit', zeitText(p.geaendert));
      t.setAttribute('datetime', p.geaendert);
      a.appendChild(t);
      li.appendChild(a);
      liste.appendChild(li);
    });
    zahl.textContent = programme.length ? '(' + programme.length + ')' : '';
    if (fokusId) { var f = liste.querySelector('a[data-id="' + (window.CSS && CSS.escape ? CSS.escape(fokusId) : fokusId) + '"]'); if (f) f.focus(); }
  }

  function listeLaden() {
    return KS.liste(WB.PRAEFIX).then(function (eintraege) {
      var neu = [];
      eintraege.forEach(function (e) {
        var m = PROG_RE.exec(e.pfad);
        if (!m) return;
        var w = lies(m[1]);
        if (!w) return;
        neu.push({ id: m[1], titel: String(w.titel || '').trim() || 'Ohne Titel', geaendert: e.geaendert });
      });
      neu.sort(function (a, b) { return a.geaendert < b.geaendert ? 1 : a.geaendert > b.geaendert ? -1 : 0; });
      programme = neu;
      if (aktuellId && !programme.some(function (p) { return p.id === aktuellId; })) aktuellId = null;
      listeZeichnen();
      zeigeAnsicht();
    });
  }
  function listePlanen() {
    clearTimeout(listeTimer);
    listeTimer = setTimeout(function () { listeLaden().then(auswahlPruefen); }, 150);
  }

  /* ── Auswahl ──────────────────────────────────────────────── */
  function groessenHinweis(wert) {
    var n = 0;
    try { n = new Blob([JSON.stringify(wert)]).size; } catch (e) { n = JSON.stringify(wert).length; }
    if (n > ABGLEICH_GRENZE) {
      gross.textContent = 'Dieses Programm ist zu groß für den Abgleich (über 64 KB). Es bleibt auf diesem Gerät gespeichert, wird aber nicht in dein Konto übertragen. Teilen geht ebenfalls nicht.';
      gross.hidden = false;
    } else gross.hidden = true;
  }

  function oeffne(id, opt) {
    opt = opt || {};
    var w = lies(id);
    if (!w) return false;
    if (aktuellId && aktuellId !== id) speichern();
    aktuellId = id;
    wartetAuf = null;
    laedt = true;
    try {
      titelFeld.value = String(w.titel || '');
      editorSetzen(w.code);
      eingabenSetzen(w.eingaben || '');
    } finally { laedt = false; }
    geaendert = false;
    ausgabeLeeren();
    WB.merkeAktuell(id);
    statusSagen('Zuletzt gespeichert: ' + zeitText(w.geaendert || jetzt()));
    groessenHinweis(w);
    zeigeAnsicht();
    listeLaden().then(function () { if (opt.fokus === 'titel') { titelFeld.focus(); titelFeld.select(); } else if (opt.fokus === 'editor') editorFokus(); });
    return true;
  }

  function hashId() {
    var h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* roh lassen */ }
    return h;
  }
  function hashSetzen(id) {
    var soll = '#' + encodeURIComponent(id);
    if (location.hash !== soll) location.hash = soll;
  }
  /* Nach jeder Listenänderung: ist noch etwas offen, was offen sein sollte? */
  function auswahlPruefen() {
    if (aktuellId) return;
    if (!programme.length) { zeigeAnsicht(); return; }
    var ziel = null;
    if (wartetAuf && lies(wartetAuf)) ziel = wartetAuf;
    else {
      var h = hashId();
      if (h && lies(h)) ziel = h;
      else {
        var m = WB.aktuell();
        ziel = !wartetAuf && m && lies(m) ? m : programme[0].id;
      }
    }
    oeffne(ziel);
    hashSetzen(ziel);
  }
  function ausHash() {
    var h = hashId();
    if (!h || h === aktuellId) return;
    if (lies(h)) oeffne(h);
    else {
      wartetAuf = h;
      App.melde('Dieses Programm gibt es auf diesem Gerät nicht. Wenn du es woanders angelegt hast, melde dich im Konto an; dann erscheint es nach dem Abgleich.', { art: 'info', dauer: 9000 });
    }
  }

  /* ── Speichern ────────────────────────────────────────────── */
  function speichern() {
    clearTimeout(timer);
    if (!aktuellId || !geaendert) return;
    var alt = lies(aktuellId) || {};
    var r = runner();
    var wert = {
      titel: WB.titel(titelFeld.value) || 'Ohne Titel',
      code: editorHolen(),
      erstellt: alt.erstellt || jetzt(),
      geaendert: jetzt()
    };
    var eing = r && r.stdinTa && !r.stdinTa.closest('[hidden]') ? r.stdinTa.value : (alt.eingaben || '');
    if (eing) wert.eingaben = eing;
    if (alt.quelle) wert.quelle = alt.quelle;
    geaendert = false;
    KS.sofort.schreiben(WB.pfad(aktuellId), wert);
    statusSagen('Gespeichert um ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr');
    groessenHinweis(wert);
    pruefeAblage(wert);
  }
  /* KursSpeicher meldet einen vollen Browser-Speicher nicht zurück (Cache behält den Wert). Deshalb nach kurzer Zeit nachsehen,
     ob der Stand wirklich im localStorage liegt, und sonst ehrlich warnen. */
  var speicherNr = 0;
  var ablageSchluessel = 'dhbw-inf-mb:speicher:v2';
  function pruefeAblage(wert) {
    var marke = '"geaendert":' + JSON.stringify(wert.geaendert), nr = ++speicherNr, id = aktuellId;
    setTimeout(function () {
      var roh;
      try { roh = localStorage.getItem(ablageSchluessel); } catch (e) { return; }
      if (roh === null || roh.indexOf(marke) >= 0) return;
      if (nr !== speicherNr || id !== aktuellId) return;   /* inzwischen neuer gespeichert oder Programm gewechselt: die neuere Prüfung zählt */
      statusSagen('Konnte nicht dauerhaft gespeichert werden: Der Browser-Speicher ist voll. Lade das Programm als .py herunter, damit nichts verloren geht.');
    }, 400);
  }
  function aenderung() {
    if (laedt || !aktuellId) return;
    geaendert = true;
    statusSagen('Änderungen werden gespeichert …');
    clearTimeout(timer);
    timer = setTimeout(speichern, VERZOEGERUNG);
  }

  ta.addEventListener('input', aenderung);
  titelFeld.addEventListener('input', aenderung);
  titelFeld.addEventListener('blur', function () {
    if (!titelFeld.value.trim() && aktuellId) { titelFeld.value = 'Ohne Titel'; aenderung(); }
  });
  titelFeld.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); speichern(); editorFokus(); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); speichern(); }
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') speichern(); });
  window.addEventListener('pagehide', speichern);

  /* ── Aktionen ─────────────────────────────────────────────── */
  function neu(opt) {
    speichern();
    var id = WB.anlegen({ titel: opt.titel, code: opt.code, eingaben: opt.eingaben, quelle: opt.quelle });
    listeLaden().then(function () {
      oeffne(id, { fokus: opt.fokus || 'editor' });
      hashSetzen(id);
    });
    return id;
  }
  function neuesProgramm() { neu({ titel: 'Neues Programm', code: '', fokus: 'editor' }); }
  function duplizieren() {
    if (!aktuellId) return;
    speichern();
    var w = lies(aktuellId); if (!w) return;
    neu({ titel: WB.titel((w.titel || 'Programm') + ' (Kopie)'), code: w.code, eingaben: w.eingaben, quelle: w.quelle, fokus: 'titel' });
    statusSagen('Kopie angelegt.');
  }
  function beispiel() {
    neu({
      titel: 'Kreisfläche',
      code: '# Kreisfläche aus dem Radius\nimport math\n\nr = float(input("Radius in mm: "))\nflaeche = math.pi * r ** 2\nprint("Fläche:", round(flaeche, 1), "mm²")\n',
      eingaben: '25', fokus: 'editor'
    });
  }
  function loeschen() {
    if (!aktuellId) return;
    speichern();
    var id = aktuellId, w = lies(id);
    if (!w) return;
    selbstGeloescht[id] = true;
    aktuellId = null;
    clearTimeout(timer); geaendert = false;
    KS.loeschen(WB.pfad(id));
    var h = App.melde('„' + (w.titel || 'Programm') + '“ wurde gelöscht.', {
      art: 'info',
      aktion: { text: 'Rückgängig', fn: function () {
        delete selbstGeloescht[id];
        KS.speichern(WB.pfad(id), w).then(function () { return listeLaden(); }).then(function () { oeffne(id); hashSetzen(id); });
      } }
    });
    if (h && h.schliessen) setTimeout(h.schliessen, 20000);
    listeLaden().then(function () {
      if (programme.length) { oeffne(programme[0].id); hashSetzen(programme[0].id); titelFeld.focus(); }
      else { if (location.hash) history.replaceState(null, '', location.pathname + location.search); zeigeAnsicht(); var b = $('#wb-beispiel'); if (b) b.focus(); }
    });
  }
  function dateiname(t) {
    var s = String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
    return (s || 'programm') + '.py';
  }
  function herunterladen() {
    if (!aktuellId) return;
    speichern();
    var code = editorHolen();
    if (code && !/\n$/.test(code)) code += '\n';
    var name = dateiname(titelFeld.value);
    var url = URL.createObjectURL(new Blob([code], { type: 'text/x-python;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = name; a.hidden = true;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    statusSagen('Als ' + name + ' heruntergeladen.');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-wb]');
    if (!b) return;
    var a = b.getAttribute('data-wb');
    var mehr = b.closest('details');
    if (mehr) mehr.open = false;   /* Menü „Mehr“ nach der Wahl schließen */
    if (a === 'neu') neuesProgramm();
    else if (a === 'duplizieren') duplizieren();
    else if (a === 'loeschen') loeschen();
    else if (a === 'herunterladen') herunterladen();
    else if (a === 'teilen') teilenOeffnen(b);
  });
  $('#wb-beispiel').addEventListener('click', beispiel);
  /* Menü „Mehr“: Esc und Klick daneben schließen es */
  var mehrMenue = $('.wb-mehr');
  if (mehrMenue) {
    document.addEventListener('click', function (e) { if (mehrMenue.open && !mehrMenue.contains(e.target)) mehrMenue.open = false; });
    mehrMenue.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mehrMenue.open) { e.stopPropagation(); mehrMenue.open = false; mehrMenue.querySelector('summary').focus(); } });
  }
  /* Hinweis unter der Liste je nach Konto */
  App.konto.status().then(function (k) {
    var h = $('.wb-liste__hinweis');
    if (h && k && k.angemeldet) h.textContent = 'Gespeichert in diesem Browser und in deinem Konto.';
  }, function () {});

  /* ── Teilen ───────────────────────────────────────────────── */
  var dlg = $('#wb-teilen'), dlgKoerper = $('#wb-teilen-koerper'), dlgStatus = $('#wb-teilen-status');
  var dlgAusloeser = null;
  var HINWEIS = 'Teile keine Lösungen von Trainingsaufgaben, bevor andere sie selbst versucht haben.';
  (function () { var z = $('#wb-teilen-zu'); z.appendChild(App.icon('x')); z.addEventListener('click', function () { dlg.close(); }); })();
  dlg.addEventListener('close', function () { if (dlgAusloeser && dlgAusloeser.focus) dlgAusloeser.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  function fehlerText(e) {
    if (e && e.offline) return 'Keine Verbindung zum Server. Zum Teilen brauchst du Internet.';
    if (e && e.status === 429) return 'Gerade sind zu viele Anfragen unterwegs. Versuche es in einer Weile noch einmal.';
    if (e && e.message) return e.message;
    return 'Das hat nicht geklappt. Versuche es noch einmal.';
  }
  function absolutLink(id) {
    return new URL(App.url('geteilt.html') + '?id=' + encodeURIComponent(id), location.href).href;
  }
  function kopiere(text, feld) {
    function ausweichen() {
      try { feld.focus(); feld.select(); return document.execCommand('copy'); } catch (e) { return false; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return ausweichen(); });
    }
    return Promise.resolve(ausweichen());
  }
  function absatz(text, klasse) { return el('p', klasse || '', text); }

  function teilenOeffnen(ausloeser) {
    if (!aktuellId) return;
    speichern();
    dlgAusloeser = ausloeser;
    dlgKoerper.textContent = ''; dlgStatus.textContent = '';
    dlgKoerper.appendChild(absatz('Einen Moment …', 'k-muted'));
    if (!dlg.open) dlg.showModal();
    App.konto.status(true).then(function (k) {
      dlgKoerper.textContent = '';
      if (!k || !k.angemeldet) return teilenOhneKonto(k);
      if (!k.anzeigename) return teilenOhneName();
      return teilenBereit();
    });
  }
  function dialogKnopfFokus(b) { setTimeout(function () { if (b && b.focus) b.focus(); }, 0); }

  function teilenOhneKonto() {
    dlgKoerper.appendChild(absatz('Zum Teilen brauchst du ein Konto. Mit der Anmeldung über GitHub bekommst du außerdem deine Programme auf all deinen Geräten.'));
    dlgKoerper.appendChild(absatz('Dein Stand in diesem Browser bleibt dabei erhalten. Eine Anmeldung ist nur zum Teilen nötig.', 'k-small k-muted'));
    var b = el('button', 'k-btn', 'Mit GitHub anmelden');
    b.type = 'button';
    b.addEventListener('click', function () { speichern(); App.konto.anmelden(); });
    dlgKoerper.appendChild(b);
    dialogKnopfFokus(b);
  }
  function teilenOhneName() {
    dlgKoerper.appendChild(absatz('Lege zuerst in deinem Konto einen Anzeigenamen fest. Er steht auf der Seite deines geteilten Programms (kein echter Name nötig).'));
    var a = el('a', 'k-btn', 'Zum Konto');
    a.href = App.url('konto.html');
    dlgKoerper.appendChild(a);
    dialogKnopfFokus(a);
  }

  function teilenBereit() {
    dlgKoerper.appendChild(absatz(HINWEIS, 'wb-hinweis-satz'));
    dlgKoerper.appendChild(absatz('Der Link zeigt den Stand von jetzt. Jede Person mit dem Link kann das Programm ansehen, ausführen und kopieren; spätere Änderungen erscheinen dort nicht.', 'k-small k-muted'));
    var bereich = el('div', 'wb-neuerlink');
    var erstellen = el('button', 'k-btn', 'Link erstellen');
    erstellen.type = 'button';
    bereich.appendChild(erstellen);
    dlgKoerper.appendChild(bereich);
    var listeBox = el('div', 'wb-eigene');
    dlgKoerper.appendChild(listeBox);
    dialogKnopfFokus(erstellen);
    eigeneLaden(listeBox);

    erstellen.addEventListener('click', function () {
      speichern();
      var w = lies(aktuellId);
      if (!w) return;
      erstellen.disabled = true; dlgStatus.textContent = 'Link wird erstellt …';
      var daten = { titel: WB.titel(w.titel) || 'Programm', code: editorHolen() };
      if (w.eingaben && /input\s*\(/.test(daten.code)) daten.eingaben = String(w.eingaben).slice(0, 1000);   /* Server: höchstens 4 KB */
      if (w.quelle && w.quelle.lektion && /^[A-Za-z0-9-]{1,20}$/.test(w.quelle.lektion)) daten.lektion = w.quelle.lektion;
      App.api('geteilt', { method: 'POST', body: daten }).then(function (r) {
        var link = absolutLink(r.id);
        bereich.textContent = '';
        var zeile = el('div', 'wb-linkzeile');
        var lab = el('label', 'wb-linkzeile__label', 'Dein Link');
        var feld = el('input', 'wb-linkfeld');
        feld.type = 'text'; feld.readOnly = true; feld.value = link; feld.id = 'wb-linkfeld'; lab.setAttribute('for', 'wb-linkfeld');
        feld.addEventListener('focus', function () { feld.select(); });
        var kopieren = el('button', 'k-btn k-btn--small', 'Link kopieren');
        kopieren.type = 'button';
        function los() { return kopiere(link, feld).then(function (ok) { dlgStatus.textContent = ok ? 'Link kopiert.' : 'Kopieren hat nicht geklappt. Markiere den Link und drücke Strg+C.'; }); }
        kopieren.addEventListener('click', los);
        zeile.appendChild(lab); zeile.appendChild(feld); zeile.appendChild(kopieren);
        bereich.appendChild(zeile);
        var neuer = el('button', 'k-btn k-btn--small k-btn--link', 'Neuen Link erstellen');
        neuer.type = 'button';
        neuer.addEventListener('click', function () { dlgKoerper.textContent = ''; teilenBereit(); });
        bereich.appendChild(neuer);
        feld.focus(); feld.select();
        dlgStatus.textContent = 'Link erstellt.';
        los();
        eigeneLaden(listeBox);
      }, function (e) {
        erstellen.disabled = false;
        if (e && e.status === 409 && e.daten && e.daten.fehler === 'anzeigename-fehlt') { dlgKoerper.textContent = ''; dlgStatus.textContent = ''; teilenOhneName(); return; }
        if (e && e.status === 401) { dlgKoerper.textContent = ''; dlgStatus.textContent = ''; teilenOhneKonto(); return; }
        dlgStatus.textContent = fehlerText(e);
      });
    });
  }

  function eigeneLaden(ziel) {
    App.api('geteilt').then(function (r) {
      var l = (r && r.eintraege) || [];
      ziel.textContent = '';
      if (!l.length) return;
      ziel.appendChild(el('h3', 'wb-eigene__h', 'Deine geteilten Links (' + l.length + ')'));
      var ul = el('ul', 'wb-eigene__ul');
      l.forEach(function (g) {
        var li = el('li', 'wb-eigener');
        var text = el('div', 'wb-eigener__text');
        var a = el('a', 'wb-eigener__titel', g.titel || 'Programm');
        a.href = App.url('geteilt.html') + '?id=' + encodeURIComponent(g.id);
        a.target = '_blank'; a.rel = 'noopener';
        text.appendChild(a);
        text.appendChild(el('span', 'wb-eigener__zeit k-small k-muted', zeitText(g.erstellt)));
        var kop = el('button', 'k-btn k-btn--small k-btn--link', 'Kopieren'); kop.type = 'button';
        kop.setAttribute('aria-label', 'Link zu „' + (g.titel || 'Programm') + '“ kopieren');
        var feld = document.createElement('input'); feld.type = 'text'; feld.hidden = true;
        kop.addEventListener('click', function () {
          var link = absolutLink(g.id);
          document.body.appendChild(feld); feld.hidden = false; feld.value = link;
          kopiere(link, feld).then(function (ok) { feld.remove(); dlgStatus.textContent = ok ? 'Link kopiert.' : 'Kopieren hat nicht geklappt.'; });
        });
        var weg = el('button', 'k-btn k-btn--small k-btn--link', 'Löschen'); weg.type = 'button';
        weg.setAttribute('aria-label', 'Link zu „' + (g.titel || 'Programm') + '“ löschen');
        var sicher = false, sicherTimer = null;
        weg.addEventListener('click', function () {
          if (!sicher) {
            sicher = true; weg.textContent = 'Wirklich löschen?';
            dlgStatus.textContent = 'Der Link funktioniert danach nicht mehr. Zum Bestätigen noch einmal „Löschen“ wählen.';
            sicherTimer = setTimeout(function () { sicher = false; weg.textContent = 'Löschen'; dlgStatus.textContent = ''; }, 6000);
            return;
          }
          clearTimeout(sicherTimer); weg.disabled = true;
          App.api('geteilt/' + encodeURIComponent(g.id), { method: 'DELETE' }).then(function () {
            dlgStatus.textContent = 'Link gelöscht.';
            eigeneLaden(ziel);
          }, function (e) {
            if (e && e.status === 404) { eigeneLaden(ziel); return; }
            weg.disabled = false; sicher = false; weg.textContent = 'Löschen'; dlgStatus.textContent = fehlerText(e);
          });
        });
        var akt = el('div', 'wb-eigener__aktionen'); akt.appendChild(kop); akt.appendChild(weg);
        li.appendChild(text); li.appendChild(akt);
        ul.appendChild(li);
      });
      ziel.appendChild(ul);
    }, function () { /* offline oder Fehler: Liste einfach weglassen */ });
  }

  /* ── Änderungen von außen (anderer Tab, anderes Gerät) ───── */
  KS.abonnieren(WB.PRAEFIX, function (ev) {
    var m = PROG_RE.exec(ev.pfad || '');
    if (!m) return;
    var id = m[1];
    if (ev.geloescht) {
      if (selbstGeloescht[id]) { return; }
      if (id === aktuellId) {
        aktuellId = null; geaendert = false; clearTimeout(timer);
        App.melde('Dieses Programm wurde auf einem anderen Gerät gelöscht.', { art: 'info' });
      }
      listePlanen();
      return;
    }
    if (id === aktuellId && ev.wert && typeof ev.wert.code === 'string') {
      var w = ev.wert;
      var gleich = w.code === editorHolen() && String(w.titel || '') === titelFeld.value;
      if (!gleich && !geaendert) {
        var vorher = editorHolen();
        laedt = true;
        try {
          if (w.code !== editorHolen()) editorSetzen(w.code);
          if (String(w.titel || '') !== titelFeld.value && document.activeElement !== titelFeld) titelFeld.value = String(w.titel || '');
          var r = runner();
          if (r && r.stdinTa && (w.eingaben || '') !== r.stdinTa.value && !r.stdinTa.matches(':focus')) eingabenSetzen(w.eingaben || '');
        } finally { laedt = false; }
        statusSagen('Von einem anderen Gerät aktualisiert.');
        groessenHinweis(w);
        /* „Neuester gewinnt“ gilt je ganzem Programm: Hat das andere Gerät zeitgleich am selben Programm
           getippt, verschwindet dabei eigener, schon gespeicherter Text. Er bleibt einen Klick weit zurückholbar. */
        if (w.code !== vorher && vorher.trim()) {
          App.melde('Dieses Programm wurde auf einem anderen Gerät geändert.', { art: 'info', aktion: { text: 'Meine Fassung wiederherstellen', fn: function () {
            if (aktuellId !== id) return;
            editorSetzen(vorher); geaendert = true; speichern();
            statusSagen('Deine Fassung ist wiederhergestellt.');
          } } });
        }
      }
    }
    if (id === wartetAuf && lies(id)) { listeLaden().then(function () { if (lies(id)) { oeffne(id); } }); return; }
    listePlanen();
  });

  /* ── Start ────────────────────────────────────────────────── */
  window.addEventListener('hashchange', ausHash);
  function start() {
    listeLaden().then(function () {
      var h = hashId();
      if (h && !lies(h)) {
        wartetAuf = h;
        App.melde('Dieses Programm gibt es auf diesem Gerät nicht. Wenn du es woanders angelegt hast, melde dich im Konto an; dann erscheint es nach dem Abgleich.', { art: 'info', dauer: 9000 });
        if (programme.length) { wartetAuf = h; var m = WB.aktuell(); oeffne(m && lies(m) ? m : programme[0].id); }
        return;
      }
      auswahlPruefen();
    });
  }
  /* Der Runner (kurs.js) und der Editor (editor.js) starten im DOMContentLoaded-Handler; danach erst ist box._kRunner da. */
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', function () { (function () { var r = runner(); if (r && r.stdinTa) r.stdinTa.addEventListener('input', aenderung); })(); start(); });
})();
