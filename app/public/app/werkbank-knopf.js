/* =============================================================
   app/werkbank-knopf.js – globale Werkbank-Helfer und der Knopf „In der Werkbank öffnen“ (Rolle Werkbank)

   1. window.KursWerkbank: gemeinsame Helfer für werkbank.js, geteilt.js und diesen Knopf
        .anlegen({titel, code, eingaben?, quelle?}) -> id   legt ein Programm an (KursSpeicher, sofort)
        .url(id)       relative URL der Werkbank mit Deep-Link
        .neueId() / .pfad(id) / .merkeAktuell(id) / .aktuell() / .titel(text)
   2. Knopf in der Knopfleiste des Runners an Codeblöcken der Lerneinheiten und der Bibliothek.
      Bewusst NICHT im Labor, bei Aufgaben-Editoren ([data-a], [data-id], .a-task) und in Quizfragen:
      Dort entstehen Trainingslösungen, die nicht versehentlich als „Programme“ in der Werkbank landen
      und über „Teilen“ weitergegeben werden sollen. Wer eine Lösung aufbewahren will, kopiert sie bewusst.
   Wartet nicht auf kurs.js: ein MutationObserver (gebündelt über requestAnimationFrame) ergänzt Runner,
   sobald kurs.js ihre Knopfleiste gebaut hat. Doppelknöpfe verhindert die Marke data-wb-knopf.
   ============================================================= */
(function () {
  'use strict';
  var KS = window.KursSpeicher;
  var PRAEFIX = 'inf-mb/werkbank/';
  var AKTUELL = 'inf-mb-app:werkbank:aktuell';   /* nur dieses Gerät */

  function lsLesen(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSchreiben(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } }

  function neueId() {
    var b = new Uint8Array(6), s = '';
    try { crypto.getRandomValues(b); } catch (e) { for (var i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256); }
    for (var j = 0; j < b.length; j++) s += (b[j] % 36).toString(36);
    return 'p' + s;
  }
  function pfad(id) { return PRAEFIX + 'prog:' + id; }
  function titel(t) {
    var s = String(t == null ? '' : t).replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim();
    var z = Array.from(s);
    return z.length > 80 ? z.slice(0, 79).join('') + '…' : s;
  }
  function anlegen(o) {
    if (!KS) return null;
    var id = neueId();
    while (KS.sofort.lesen(pfad(id)) !== undefined) id = neueId();
    var jetzt = new Date().toISOString();
    var wert = { titel: titel(o.titel) || 'Ohne Titel', code: String(o.code == null ? '' : o.code), erstellt: jetzt, geaendert: jetzt };
    if (o.eingaben) wert.eingaben = String(o.eingaben);
    if (o.quelle) wert.quelle = o.quelle;
    KS.sofort.schreiben(pfad(id), wert);
    return id;
  }
  function url(id) {
    var u = window.KursApp ? window.KursApp.url('werkbank.html') : 'werkbank.html';
    return id ? u + '#' + encodeURIComponent(id) : u;
  }

  window.KursWerkbank = {
    PRAEFIX: PRAEFIX, neueId: neueId, pfad: pfad, titel: titel, anlegen: anlegen, url: url,
    merkeAktuell: function (id) { lsSchreiben(AKTUELL, id); },
    aktuell: function () { return lsLesen(AKTUELL); }
  };

  /* ── Knopf ───────────────────────────────────────────────── */
  var art = document.body && document.body.getAttribute('data-page');
  if (art !== 'lerneinheit' && art !== 'bibliothek') return;
  var APP = window.KursApp;
  var AUSGENOMMEN = '[data-a], [data-id], .a-task, .a-spec, .lab, .l-task, .k-q, .k-quiz';

  function ueberschriftDavor(box) {
    var n = box;
    while (n && n !== document.body) {
      var s = n.previousElementSibling;
      while (s) {
        if (/^H[2-4]$/.test(s.tagName)) return s;
        s = s.previousElementSibling;
      }
      n = n.parentElement;
    }
    return null;
  }
  function ueberschriftText(h) {
    if (!h) return '';
    var c = h.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.k-section__num, .k-muted, .k-sr, [aria-hidden="true"]'), function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function titelFuer(box) {
    var lek = APP && APP.seite && APP.seite.lektion;
    var h = ueberschriftText(ueberschriftDavor(box));
    if (lek) return lek + ' · ' + (h || 'Beispiel');
    return 'Bibliothek · ' + (h && h !== 'Spielwiese' ? h : 'Spielwiese');
  }

  function oeffnen(box) {
    var r = box._kRunner;
    if (!r) return;
    var code = window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(r.ta) : r.ta.value;
    if (!code || !code.trim()) {
      if (APP) APP.melde('Hier steht noch kein Code, den du übernehmen könntest.', { art: 'info' });
      return;
    }
    var lek = APP && APP.seite && APP.seite.lektion;
    var quelle = { seite: location.pathname.replace(/^.*\//, '') };
    if (lek) quelle.lektion = lek;
    var id = anlegen({
      titel: titelFuer(box), code: code,
      eingaben: r.stdinTa && !r.stdinTa.closest('[hidden]') ? r.stdinTa.value : '',
      quelle: quelle
    });
    if (!id) return;
    window.KursWerkbank.merkeAktuell(id);
    location.href = url(id);
  }

  function ergaenze(box) {
    if (box.hasAttribute('data-wb-knopf') || !box._kRunner) return;
    var bar = box.querySelector('.k-runner__bar');
    if (!bar) return;
    if (box.closest(AUSGENOMMEN)) { box.setAttribute('data-wb-knopf', 'nein'); return; }
    box.setAttribute('data-wb-knopf', 'ja');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'k-btn k-btn--small k-btn--link wb-knopf';
    if (APP && APP.icon) { try { b.appendChild(APP.icon('code')); } catch (e) { /* ohne Symbol */ } }
    /* Kurzer sichtbarer Text, damit die Knopfleiste in schmalen Lektionsspalten nicht umbricht; Name und Hinweis nennen die ganze Handlung. */
    b.appendChild(document.createTextNode('Werkbank'));
    b.setAttribute('aria-label', 'In der Werkbank öffnen');
    b.title = 'In der Werkbank öffnen: legt eine Kopie als eigenes Programm an';
    b.addEventListener('click', function () { oeffnen(box); });
    var status = bar.querySelector('.k-runner__status');
    bar.insertBefore(b, status || null);
  }

  function suche() {
    var l = document.querySelectorAll('.k-runner:not([data-wb-knopf])');
    for (var i = 0; i < l.length; i++) ergaenze(l[i]);
  }

  var geplant = false;
  function planen() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { geplant = false; suche(); });
  }
  function start() {
    suche();
    if (!window.MutationObserver) return;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var add = muts[i].addedNodes;
        for (var j = 0; j < add.length; j++) {
          var n = add[j];
          if (n.nodeType !== 1) continue;
          /* Editor- und Ausgabeknoten (viele, laufend) und eigene Knöpfe überspringen */
          if (n.closest && n.closest('.ke, .cm-editor, .k-runner__out, .k-runner__stdinbox')) continue;
          if (n.classList.contains('k-runner') || n.classList.contains('k-runner__bar') || (n.querySelector && n.querySelector('.k-runner__bar')) || (n.closest && n.closest('.k-runner'))) { planen(); return; }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  /* kurs.js baut die Runner im DOMContentLoaded-Handler, der vor diesem Skript registriert wurde */
  if (document.readyState === 'complete') start(); else document.addEventListener('DOMContentLoaded', start);
})();
