/* =============================================================
   app/shell.js – Verhalten der Hülle (mit defer geladen)
   Lektionswähler, Fortschritt im Wähler, Panel-Knöpfe, Esc, Strg+K, zuletzt besuchte Seite.
   Suche und Tutor hängen sich über KursApp-Ereignisse an:
     KursApp.an('suche', fn)   – Suche öffnen (Knopf oder Strg+K)
     KursApp.an('panel', fn)   – Panel geöffnet/geschlossen ({id, offen, element})
   Hört niemand zu, zeigt die Hülle einen kurzen Hinweis.
   ============================================================= */
(function () {
  'use strict';
  var A = window.KursApp;
  if (!A) return;
  var KS = window.KursSpeicher;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ── Lektionswähler ──────────────────────────────────────── */
  var knopf = $('[data-app-waehler]');
  var liste = knopf ? document.getElementById(knopf.getAttribute('aria-controls')) : null;
  var standGeladen = false;

  function standText(f) {
    var t = [];
    if (f.abschnitte.gesamt) t.push(f.abschnitte.fertig + '/' + f.abschnitte.gesamt + ' Abschnitte');
    if (f.aufgaben.gesamt) t.push(f.aufgaben.geloest + '/' + f.aufgaben.gesamt + ' Aufgaben');
    return t.join(' · ');
  }
  function standZustand(f) { return f.status; }   /* eine Regel: KursApp.fortschritt (kern.js) */
  function standFuellen() {
    if (!liste) return;
    $$('[data-app-stand]', liste).forEach(function (n) {
      var nr = n.getAttribute('data-app-stand');
      A.fortschritt.lektion(nr).then(function (f) {
        n.textContent = standText(f);
        n.parentNode.setAttribute('data-stand', standZustand(f));
      }, function () { n.textContent = ''; });
    });
    standGeladen = true;
  }
  function waehlerAuf() {
    if (!liste) return;
    liste.hidden = false;
    knopf.setAttribute('aria-expanded', 'true');
    standFuellen();
    var akt = $('[aria-current="page"]', liste) || $('a', liste);
    if (akt) { try { akt.scrollIntoView({ block: 'center' }); } catch (e) {} akt.focus(); }
  }
  function waehlerZu(fokusZurueck) {
    if (!liste || liste.hidden) return;
    liste.hidden = true;
    knopf.setAttribute('aria-expanded', 'false');
    if (fokusZurueck) knopf.focus();
  }
  if (knopf && liste) {
    knopf.addEventListener('click', function () { if (liste.hidden) waehlerAuf(); else waehlerZu(false); });
    document.addEventListener('click', function (e) {
      if (!liste.hidden && !liste.contains(e.target) && !knopf.contains(e.target)) waehlerZu(false);
    });
    liste.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var l = $$('a', liste), i = l.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var n = l[Math.max(0, Math.min(l.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      if (n) n.focus();
    });
    liste.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !liste.contains(e.relatedTarget) && e.relatedTarget !== knopf) waehlerZu(false);
    });
    /* Fortschritt ändert sich auf der Seite (Quiz, Aufgabe gelöst): Anzeige im Wähler aktuell halten */
    if (KS && A.seite.lektion) {
      KS.abonnieren('inf-mb/' + A.seite.lektion.toLowerCase() + '/', function () { if (standGeladen) standFuellen(); });
    }
  }

  /* ── Panel ───────────────────────────────────────────────── */
  var panelEl = $('[data-app-slot="panel"]');
  var tutorKnopf = $('[data-app-aktion="tutor"]');
  A.an('panel', function (e) {
    if (tutorKnopf) tutorKnopf.setAttribute('aria-expanded', e.offen && e.id === 'tutor' ? 'true' : 'false');
  });
  /* Unter 1100 px liegen Panel und Befehls-Bibliothek beide über dem Inhalt und würden sich überdecken:
     Wer zuletzt geöffnet wird, bleibt, der andere schließt sich (einfacher und robuster als zwei Spalten, die nicht passen). */
  function bibliothekOffen() { return document.documentElement.classList.contains('kb-open'); }
  function nurEines() { return window.innerWidth < 1100; }
  A.an('panel', function (e) {
    if (!e.offen || !nurEines() || !bibliothekOffen()) return;
    var zu = document.querySelector('#kb-panel .kb__close');
    if (zu) zu.click();
  });
  if (window.MutationObserver) {
    var bibliothekWarOffen = bibliothekOffen();
    new MutationObserver(function () {
      var jetzt = bibliothekOffen();
      if (jetzt && !bibliothekWarOffen && nurEines() && A.panel.istOffen()) A.panel.schliessen();
      bibliothekWarOffen = jetzt;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  function panelHinweisFallsLeer(id) {
    /* Platzhalter, solange keine Rolle den Inhalt liefert (tutor.js fehlt noch) */
    var inhalt = A.panel.element();
    if (inhalt && !inhalt.firstChild) {
      var p = document.createElement('p');
      p.className = 'app-panel__hinweis';
      p.textContent = id === 'tutor'
        ? 'Der Tutor-Chat kommt in Kürze. Er hilft dir mit Fragen und Denkanstößen, ohne dir die Lösung zu verraten.'
        : 'Dieser Bereich kommt in Kürze.';
      inhalt.appendChild(p);
    }
  }
  if (tutorKnopf) {
    tutorKnopf.addEventListener('click', function () {
      if (A.panel.istOffen() && A.panel.id() === 'tutor') { A.panel.schliessen(); return; }
      A.panel.oeffnen('tutor');
      panelHinweisFallsLeer('tutor');
    });
  }
  var zuKnopf = $('[data-app-aktion="panel-zu"]');
  if (zuKnopf) zuKnopf.addEventListener('click', function () { A.panel.schliessen(); });

  /* ── Suche ───────────────────────────────────────────────── */
  function sucheOeffnen() {
    if (!A.sende('suche', {})) A.melde('Die Suche kommt in Kürze. Bis dahin hilft die Bibliothek oder der Lernpfad.');
  }
  var sucheKnopf = $('[data-app-aktion="suche"]');
  if (sucheKnopf) sucheKnopf.addEventListener('click', sucheOeffnen);

  /* ── Tastatur: Strg+K, Esc ───────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      sucheOeffnen();
      return;
    }
    if (e.key === 'Escape') {
      if (liste && !liste.hidden) { waehlerZu(true); e.stopPropagation(); return; }
      if (A.panel.istOffen() && !document.querySelector('dialog[open]')) {
        /* Esc in einem Bestands-Overlay (z. B. Bibliothek) gehört dem Bestand */
        var bestandOffen = document.documentElement.classList.contains('kb-open') || !!document.querySelector('.kv');
        if (panelEl && (panelEl.contains(document.activeElement) || !bestandOffen)) A.panel.schliessen();
      }
    }
  });

  /* ── Labor: „Nächster Schritt“ (nächste Lektion) erst auf der letzten Station ──
     labor.js zeigt immer genau eine Station (.l-task) und blendet die anderen per hidden aus. Der
     Block der Hülle stünde sonst auf jeder Station unter dem Stations-Knopf „Weiter“ und führte
     am Training vorbei aus dem Labor heraus. */
  var weiterNav = $('.app-weiter');
  var stationen = A.seite.art === 'labor' ? $$('.l-task') : [];
  if (weiterNav && stationen.length > 1) {
    /* Knobelaufgaben (data-knobel, freiwillig) stehen nach der letzten Pflichtstation: der Block erscheint dort und auf den Knobelaufgaben */
    var pflicht = stationen.filter(function (s) { return !s.hasAttribute('data-knobel'); });
    var knobel = stationen.filter(function (s) { return s.hasAttribute('data-knobel'); });
    var letzte = pflicht[pflicht.length - 1];
    var weiterSetzen = function () { weiterNav.hidden = letzte.hidden && knobel.every(function (s) { return s.hidden; }); };
    weiterSetzen();
    if (window.MutationObserver) {
      var beobachter = new MutationObserver(weiterSetzen);
      [letzte].concat(knobel).forEach(function (s) { beobachter.observe(s, { attributes: true, attributeFilter: ['hidden'] }); });
    }
  }

  /* ── Zuletzt besuchte Seite (für „Heute“ und andere Geräte) ── */
  var OHNE = { heute: 1, offline: 1, '404': 1 };
  function zuletztMerken() {
    if (!KS || OHNE[A.seite.art]) return;
    try {
      var w = new URL(A.wurzel).pathname;
      var pfad = location.pathname.indexOf(w) === 0 ? location.pathname.slice(w.length) : location.pathname.replace(/^\//, '');
      if (!pfad) return;
      var titel = (document.querySelector('h1') || {}).textContent || document.title;
      KS.sofort.schreiben('inf-mb/app/zuletzt', {
        url: pfad + (location.hash || ''),
        titel: String(titel).replace(/\s+/g, ' ').trim().slice(0, 160),
        art: A.seite.art,
        lektion: A.seite.lektion,
        zeit: new Date().toISOString()
      });
    } catch (e) { /* Speicher gesperrt: egal */ }
  }
  zuletztMerken();
  var merkenZeit = null;
  window.addEventListener('hashchange', function () { clearTimeout(merkenZeit); merkenZeit = setTimeout(zuletztMerken, 800); });
})();
