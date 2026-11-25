/* =============================================================
   app/geteilt.js – geteiltes Programm ansehen (Rolle Werkbank, Vertrag Abschnitt 8)
   geteilt.html?id=<id>: Titel, „geteilt von <Name>“, Datum, Code ausführbar, „Kopie in meine Werkbank“.
   Geht ohne Login. Alles aus dem Netz (Titel, Autor, Code, Lektion) wird ausschließlich als Text eingesetzt
   (textContent, value, document.title); es gibt kein innerHTML in dieser Datei.
   ============================================================= */
(function () {
  'use strict';
  var App = window.KursApp, WB = window.KursWerkbank;
  if (!App) return;

  function $(s) { return document.querySelector(s); }
  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text != null) n.textContent = text;
    return n;
  }

  var meldung = $('#gt-meldung'), inhalt = $('#gt-inhalt');
  if (!meldung || !inhalt) return;

  function zeigeMeldung(titel, text, erneut) {
    inhalt.hidden = true;
    meldung.textContent = '';
    meldung.className = 'wb-meldung wb-meldung--hinweis';
    meldung.appendChild(el('h1', 'wb-h1', titel));
    meldung.appendChild(el('p', '', text));
    var zeile = el('div', 'wb-fuss');
    if (erneut) {
      var b = el('button', 'k-btn', 'Erneut versuchen');
      b.type = 'button';
      b.addEventListener('click', laden);
      zeile.appendChild(b);
    }
    var a = el('a', erneut ? 'k-btn k-btn--ghost' : 'k-btn', 'Zur Werkbank');
    a.href = App.url('werkbank.html');
    zeile.appendChild(a);
    meldung.appendChild(zeile);
    document.title = titel + ' · Informatik Maschinenbau';
    var h = meldung.querySelector('h1');
    if (h) { h.tabIndex = -1; }
  }

  function datum(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function idAusUrl() {
    try { return new URLSearchParams(location.search).get('id') || ''; } catch (e) { return ''; }
  }

  var daten = null;

  function zeigeProgramm(d) {
    daten = d;
    meldung.textContent = '';
    meldung.className = 'wb-meldung';
    meldung.hidden = true;
    inhalt.hidden = false;
    $('#gt-titel').textContent = d.titel;
    document.title = d.titel + ' · Geteiltes Programm · Informatik Maschinenbau';

    var wer = $('#gt-wer');
    wer.textContent = '';
    var teile = [];
    if (d.autor) teile.push('geteilt von ' + d.autor);
    var dat = datum(d.erstellt);
    if (dat) teile.push(dat);
    wer.appendChild(document.createTextNode(teile.join(' · ')));
    if (d.lektion) {
      wer.appendChild(document.createTextNode(' · aus ' + window.KursApp.termin.lang(d.lektion)));
    }

    var ziel = $('#gt-runner');
    ziel.textContent = '';
    var runner = window.KursRunner;
    if (runner && runner.make) {
      var box = runner.make(d.code, { label: 'Python-Code von ' + (d.autor || 'unbekannt') + ', ausführbar und änderbar', timeout: 10000 });
      box.classList.add('wb-runner');
      /* Eingaben für input() reisen mit (sonst bricht ein Programm mit input() beim Empfänger mit EOFError ab) */
      if (typeof d.eingaben === 'string' && d.eingaben) box.setAttribute('data-stdin', d.eingaben);
      ziel.appendChild(box);
      runner.init(box);
      if (window.KursEditor && window.KursEditor.attach) window.KursEditor.attach(box.querySelector('textarea'), {});
    } else {
      var ta = el('textarea', 'wb-nur-text');
      ta.value = d.code; ta.readOnly = true; ta.rows = 12; ta.setAttribute('aria-label', 'Python-Code');
      ziel.appendChild(ta);
    }
    var h = $('#gt-titel');
    h.tabIndex = -1;
  }

  function laden() {
    var id = idAusUrl();
    if (!id) {
      zeigeMeldung('Kein Programm angegeben', 'Dieser Link ist unvollständig. Frage die Person, die ihn dir geschickt hat, nach dem ganzen Link.');
      return;
    }
    meldung.hidden = false;
    meldung.className = 'wb-meldung';
    meldung.textContent = '';
    meldung.appendChild(el('p', 'k-muted', 'Programm wird geladen …'));
    App.api('geteilt/' + encodeURIComponent(id)).then(function (d) {
      if (!d || typeof d.code !== 'string' || typeof d.titel !== 'string') {
        zeigeMeldung('Programm nicht lesbar', 'Die Antwort des Servers war unvollständig. Versuche es später noch einmal.', true);
        return;
      }
      zeigeProgramm(d);
    }, function (e) {
      if (e && e.offline) zeigeMeldung('Keine Verbindung', 'Geteilte Programme laden nur mit Internet. Prüfe deine Verbindung und versuche es noch einmal.', true);
      else if (e && e.status === 404) zeigeMeldung('Programm nicht gefunden', 'Dieses geteilte Programm gibt es nicht (mehr). Vielleicht hat die Person den Link gelöscht oder er enthält einen Tippfehler.');
      else if (e && e.status === 429) zeigeMeldung('Gerade zu viel los', 'Es sind im Moment zu viele Anfragen unterwegs. Versuche es in einer Weile noch einmal.', true);
      else zeigeMeldung('Programm nicht erreichbar', 'Der Server antwortet gerade nicht. Versuche es später noch einmal.', true);
    });
  }

  /* ── Kopie in die eigene Werkbank ─────────────────────────── */
  var kopie = $('#gt-kopie'), kopieStatus = $('#gt-status');
  kopie.addEventListener('click', function () {
    if (!daten || !WB) return;
    var ta = document.querySelector('#gt-runner textarea');
    var code = ta && window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(ta) : (ta ? ta.value : daten.code);
    var quelle = { seite: 'geteilt.html' };
    if (daten.lektion) quelle.lektion = daten.lektion;
    var stdin = document.querySelector('#gt-runner .k-runner__stdin');
    var eingaben = stdin ? (window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(stdin) : stdin.value) : (daten.eingaben || '');
    var id = WB.anlegen({ titel: daten.titel, code: code, eingaben: eingaben || undefined, quelle: quelle });
    if (!id) { kopieStatus.textContent = 'Das Programm konnte nicht gespeichert werden.'; return; }
    WB.merkeAktuell(id);
    location.href = WB.url(id);
  });

  if (document.readyState === "complete") laden(); else document.addEventListener("DOMContentLoaded", laden);
})();
