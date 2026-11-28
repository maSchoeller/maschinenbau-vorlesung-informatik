/* =============================================================
   labor.js – Arbeitsumgebung „Programmierlabor“
   - zeigt immer genau eine Aufgabe (.l-task) an, Navigation über Hash-Anker
   - Aufgabenliste links mit Status offen · begonnen · gelöst (SVG-Symbole)
   - Zurück/Weiter, Auswahlmenü (mobil), Werkzeugkasten als aufklappbare Schublade
   Braucht aufgaben.js (Fortschritts-Speicher). Die Bibliothek dockt editor.js an.
   ============================================================= */
(function () {
  'use strict';
  var lab = document.querySelector('[data-lab]');
  if (!lab) return;

  var LESSON = document.body.getAttribute('data-lesson') || 'V03';
  var BASE_TITLE = 'Programmierlabor ' + (window.KursTermine ? window.KursTermine.lang(LESSON) : LESSON) + ' · Informatik Maschinenbau';   // sichtbar „Termin 01“, die Kennung bleibt Schlüssel
  var MARK = { open: 'circle', part: 'half', done: 'done' };  // Icon-IDs im Sprite
  var MARK_TXT = { open: 'offen', part: 'begonnen', done: 'gelöst' };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ── Speicher (gleicher Schlüssel wie kurs.js/aufgaben.js) ── */
  var KS = window.KursSpeicher;
  function bucket(name) { return KS.sofort.lesen(KS.pfad(LESSON, name)) || {}; }
  function markSeen(id) {
    var g = bucket('gesehen');
    if (g[id]) return false;
    g[id] = 1; KS.sofort.schreiben(KS.pfad(LESSON, 'gesehen'), g); return true;
  }

  /* ── Aufgaben (Stationen) einsammeln ─────────────────────── */
  var tasks = $$('.l-task', lab);
  var index = {};
  tasks.forEach(function (t, i) { index[t.id] = i; });
  var current = -1;

  /* Knobelaufgaben (data-knobel, Teil K) sind freiwillig: Status und Bearbeitung wie bei jeder Aufgabe, aber sie
     zählen nirgends mit. countable() ist die Menge, die zählt („x/11“, Fortschritt); statusNodes() die, deren
     Status die Liste zeigt (mit Knobelaufgaben). */
  function statusNodes(sec) { return $$('[data-a][data-id]:not([data-count="0"])', sec); }
  function countable(sec) { return $$('[data-a][data-id]:not([data-count="0"]):not([data-knobel]):not([data-freiwillig])', sec); }
  function istKnobel(sec) { return sec.hasAttribute('data-knobel'); }
  function stars(n) { n = parseInt(n, 10) || 0; if (!n) return null; return window.KStars(n, 4); }
  function setMark(node, s) { node.textContent = ''; node.appendChild(window.KIcon(MARK[s])); }
  function minText(m) { if (!m) return ''; return /^\d+$/.test(m) ? 'ca. ' + m + ' Min' : m; }
  function starLabel(n) { n = parseInt(n, 10) || 0; return n ? 'Schwierigkeit ' + n + ' von 4' : ''; }

  function statusOf(sec) {
    var nodes = statusNodes(sec);
    if (!nodes.length) return bucket('gesehen')[sec.id] ? 'done' : 'open';
    var sv = bucket('aufg'), st = bucket('begonnen');
    var solved = nodes.filter(function (n) { return sv[n.getAttribute('data-id')]; }).length;
    if (solved === nodes.length) return 'done';
    if (solved > 0 || nodes.some(function (n) { return st[n.getAttribute('data-id')]; })) return 'part';
    return 'open';
  }

  /* ── Kopf jeder Station, Liste, Auswahlmenü ──────────────── */
  var partName = { A: 'Teil A · Im Labor', B: 'Teil B · Training zu Hause', K: 'Knobelaufgaben (freiwillig)' };
  var partNo = { A: 0, B: 0, K: 0 }, partTotal = { A: 0, B: 0, K: 0 };
  tasks.forEach(function (t) { if (!t.hasAttribute('data-nonumber')) partTotal[t.getAttribute('data-part')]++; });
  var listBox = $('[data-lab-items]', lab);
  var select = $('#lab-select');
  var items = {};

  ['A', 'B', 'K'].forEach(function (part) {
    var inPart = tasks.filter(function (t) { return t.getAttribute('data-part') === part; });
    if (!inPart.length) return;
    var kn = part === 'K';
    var h = el('h2', { class: 'lab__group' + (kn ? ' lab__group--knobel' : ''), text: kn ? partName.K : partName[part] + (part === 'A' ? ' (im Termin)' : ' (' + (function () { var z = lab.getAttribute('data-zuhause') || '', min = /^\d+$/.test(z) ? z + ' Min' : ''; if (lab.getAttribute('data-training') === 'freiwillig') { /* zuhause nennt die Pflichtminuten (Teil A); hier zählt die Dauer des Trainings selbst */ var tm = inPart.reduce(function (s, t) { var m = t.getAttribute('data-min') || ''; return s + (/^\d+$/.test(m) ? parseInt(m, 10) : 0); }, 0); return 'freiwillig' + (tm ? ', ' + tm + ' Min' : ''); } return (min ? min + ', ' : '') + 'Pflicht'; })() + ')') });
    var ol = el('ol', { class: 'lab__items' + (kn ? ' lab__items--knobel' : '') });
    var og = el('optgroup', { label: partName[part] });
    inPart.forEach(function (t) {
      var nonum = t.hasAttribute('data-nonumber');
      if (!nonum) partNo[part]++;
      var n = partNo[part];
      var title = t.getAttribute('data-title');
      var st = stars(t.getAttribute('data-stars'));
      var metaMin = minText(t.getAttribute('data-min'));
      var meta = !!(st || metaMin);
      // Kopf der Station
      var kick = $('.l-task__kicker', t);
      if (kick) kick.textContent = kn ? 'Knobelaufgabe · freiwillig' : partName[part] + ' · ' + (nonum ? 'Zum Schluss' : (part === 'B' ? 'Aufgabe ' : 'Station ') + n + ' von ' + partTotal[part]);
      var mt = $('.l-task__meta', t);
      if (mt) {
        var bits = [];
        if (st) { var sp = el('span', {}, [stars(t.getAttribute('data-stars')), el('span', { class: 'k-sr', text: starLabel(t.getAttribute('data-stars')) })]); bits.push(sp); }
        var m = minText(t.getAttribute('data-min')); if (m) bits.push(m);
        var ex = t.getAttribute('data-extra'); if (ex) bits.push(ex);
        bits.forEach(function (b, i) { if (i) mt.appendChild(document.createTextNode(' · ')); if (typeof b === 'string') mt.appendChild(document.createTextNode(b)); else mt.appendChild(b); });
        mt.hidden = !bits.length;
        var stat = el('span', { class: 'l-task__status', 'aria-live': 'polite' });
        mt.appendChild(stat); t._stat = stat;
      }
      // Eintrag in der Liste
      var mark = el('span', { class: 'lab__mark', 'aria-hidden': 'true' });
      if (kn) mark.setAttribute('data-frei', ''); else setMark(mark, 'open');
      var sr = el('span', { class: 'k-sr', text: kn ? ' (freiwillig)' : ' (offen)' });
      var name = el('span', { class: 'lab__name' }, [el('span', { class: 'lab__nm', text: title })]);
      if (meta) {
        var metaEl = el('span', { class: 'lab__meta' });
        if (st) { metaEl.appendChild(stars(t.getAttribute('data-stars'))); metaEl.appendChild(el('span', { class: 'k-sr', text: starLabel(t.getAttribute('data-stars')) + (metaMin ? ', ' : '') })); }
        if (metaMin) metaEl.appendChild(document.createTextNode(metaMin));
        name.appendChild(metaEl);
      }
      var a = el('a', { class: 'lab__item', href: '#' + t.id }, [mark, name, sr]);
      ol.appendChild(el('li', null, [a]));
      items[t.id] = { a: a, mark: mark, sr: sr };
      var opt = el('option', { value: t.id, text: (part === 'B' ? 'Training ' : '') + n + ' · ' + title });
      og.appendChild(opt);
    });
    listBox.appendChild(h); listBox.appendChild(ol);
    if (select) select.appendChild(og);
  });

  function refreshStatus() {
    tasks.forEach(function (t) {
      var s = statusOf(t), it = items[t.id];
      if (!it) return;
      if (istKnobel(t) && s !== 'done') {
        /* Freiwillige Knobelaufgabe, noch nicht gelöst: kein Status in der Liste (nichts soll nach offener Pflicht aussehen) */
        it.mark.textContent = '';
        it.a.setAttribute('data-status', 'frei');
        it.sr.textContent = ' (freiwillig)';
      } else {
        setMark(it.mark, s);
        it.a.setAttribute('data-status', s);
        it.sr.textContent = ' (' + (istKnobel(t) ? 'freiwillig, ' : '') + (statusNodes(t).length ? MARK_TXT[s] : (s === 'done' ? 'angesehen' : 'offen')) + ')';
      }
      if (t._stat) {
        t._stat.textContent = '';
        if (s === 'done' && statusNodes(t).length) { t._stat.appendChild(document.createTextNode(' · gelöst')); t._stat.appendChild(window.KIcon('check')); }
        else if (s === 'part') t._stat.textContent = ' · begonnen';
      }
    });
    // Kompakte Fortschrittsangabe für die eingeklappte Leiste („3/11“)
    if (countEl) {
      var zaehl = countable(lab), geloest = bucket('aufg');
      var fertig = zaehl.filter(function (n) { return geloest[n.getAttribute('data-id')]; }).length;
      countEl.textContent = '';
      countEl.appendChild(el('span', { 'aria-hidden': 'true', text: fertig + '/' + zaehl.length }));
      countEl.appendChild(el('span', { class: 'k-sr', text: fertig + ' von ' + zaehl.length + ' Aufgaben gelöst' }));
    }
  }

  /* ── Aufgabenliste ein- und ausklappen (je Gerät gemerkt, kein Abgleich mit dem Konto) ── */
  var LISTE_KEY = 'inf-mb-app:aufgabenleiste';
  var listNav = $('.lab__list', lab), foldBtn = $('[data-lab-fold]', lab), countEl = $('[data-lab-count]', lab);
  function setFold(zu, merken) {
    if (!listNav || !foldBtn) return;
    document.documentElement.classList.toggle('lab-liste-zu', zu);
    if (zu) listNav.setAttribute('data-zu', ''); else listNav.removeAttribute('data-zu');
    foldBtn.setAttribute('aria-expanded', zu ? 'false' : 'true');
    foldBtn.setAttribute('aria-label', zu ? 'Aufgabenliste ausklappen' : 'Aufgabenliste einklappen');
    if (merken) { try { if (zu) localStorage.setItem(LISTE_KEY, 'zu'); else localStorage.removeItem(LISTE_KEY); } catch (e) { /* gesperrt: gilt nur für diese Seite */ } }
  }
  if (foldBtn) {
    foldBtn.addEventListener('click', function () { setFold(foldBtn.getAttribute('aria-expanded') === 'true', true); });
    var gemerkt = null;
    try { gemerkt = localStorage.getItem(LISTE_KEY); } catch (e) { /* ohne Speicher: ausgeklappt */ }
    setFold(gemerkt === 'zu', false);
  }

  /* ── Werkzeugkasten: Schublade ───────────────────────────── */
  var toolbox = $('#lab-toolbox');
  var toolboxHome = toolbox ? toolbox.parentNode : null;
  var drawer = $('#lab-drawer');
  var toolBtn = $('#lab-toolbox-btn');
  var drawerClose = null;
  if (drawer && toolbox) {
    drawerClose = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Werkzeugkasten schließen' });
    drawerClose.addEventListener('click', function () { setToolbox(false, true); });
  }
  function setToolbox(open, focusBtn) {
    if (!drawer || !toolbox || !toolBtn) return;
    var onFirst = current === 0;
    if (onFirst) { toolboxHome.appendChild(toolbox); drawer.hidden = true; toolBtn.hidden = true; toolBtn.setAttribute('aria-expanded', 'false'); return; }
    toolBtn.hidden = false;
    if (open) {
      drawer.innerHTML = '';
      drawer.appendChild(toolbox);
      drawer.appendChild(el('p', { class: 'lab__drawerfoot' }, [drawerClose]));
      drawer.hidden = false;
    } else {
      drawer.hidden = true;
      toolboxHome.appendChild(toolbox);
    }
    toolBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (focusBtn && !open) toolBtn.focus();
  }
  if (toolBtn) toolBtn.addEventListener('click', function () { setToolbox(toolBtn.getAttribute('aria-expanded') !== 'true'); });

  /* ── Anzeigen ────────────────────────────────────────────── */
  var prev = $('#lab-prev'), next = $('#lab-next');
  var ersteKnobel = null;
  tasks.forEach(function (t) { if (!ersteKnobel && istKnobel(t)) ersteKnobel = t; });
  var knobelHinweis = null;
  if (ersteKnobel && next && next.parentNode) {
    var knobelLink = el('a', { href: '#' + ersteKnobel.id, text: 'Knobelaufgaben ansehen' });
    knobelHinweis = el('p', { class: 'lab__knobelhint', id: 'lab-knobelhint' }, ['Das war die letzte Pflichtaufgabe. Wenn du Lust auf mehr hast, gibt es noch Knobelaufgaben (freiwillig). ', knobelLink]);
    knobelHinweis.hidden = true;
    next.parentNode.appendChild(knobelHinweis);
  }
  function show(id, initial) {
    var i = index[id];
    if (i === undefined) i = 0;
    if (i === current) return;
    current = i;
    tasks.forEach(function (t, k) { t.hidden = k !== i; });
    var t = tasks[i];
    Object.keys(items).forEach(function (k) {
      var it = items[k];
      if (k === t.id) it.a.setAttribute('aria-current', 'page'); else it.a.removeAttribute('aria-current');
    });
    if (select) select.value = t.id;
    setToolbox(false);
    // Zurück / Weiter
    function setLink(a, k, dir) {
      if (!a) return;
      if (k < 0 || k >= tasks.length) { a.hidden = true; return; }
      a.hidden = false;
      a.setAttribute('href', '#' + tasks[k].id);
      a.textContent = '';
      a.appendChild(el('span', { class: 'lab__pagerdir', text: dir < 0 ? '← Zurück' : 'Weiter →' }));
      a.appendChild(el('span', { class: 'lab__pagerto', text: tasks[k].getAttribute('data-title') }));
    }
    setLink(prev, i - 1, -1); setLink(next, i + 1, 1);
    // Nach der letzten Pflichtstation führt „Weiter“ nicht stillschweigend in die freiwilligen Knobelaufgaben
    var vorKnobel = !istKnobel(t) && !!tasks[i + 1] && istKnobel(tasks[i + 1]);
    if (vorKnobel && next) next.hidden = true;
    if (knobelHinweis) knobelHinweis.hidden = !vorKnobel;
    document.title = t.getAttribute('data-title') + ' · ' + BASE_TITLE;
    if (!statusNodes(t).length && t.getAttribute('data-seen') !== 'manual' && markSeen(t.id)) refreshStatus();
    // Editoren in der jetzt sichtbaren Station neu vermessen
    requestAnimationFrame(function () {
      $$('textarea.ke-source', t).forEach(function (ta) {
        var c = window.KursEditor && window.KursEditor.controller(ta);
        if (c && c.view && c.view.requestMeasure) c.view.requestMeasure();
      });
    });
    if (!initial) {
      var top = lab.getBoundingClientRect().top + window.pageYOffset;
      if (window.pageYOffset > top) window.scrollTo(0, Math.max(0, top - 8));
      var h = $('.l-task__title', t);
      if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    }
  }

  function fromHash(initial) {
    var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    show(index[id] !== undefined ? id : tasks[0].id, initial);
  }
  window.addEventListener('hashchange', function () { fromHash(false); });
  if (select) select.addEventListener('change', function () { location.hash = '#' + select.value; });
  document.addEventListener('kurs:progress', refreshStatus);
  // Code-Review gilt erst nach „Auflösen“ als erledigt
  $$('[data-seen="manual"] [data-mirror-check]', lab).forEach(function (b) {
    b.addEventListener('click', function () { var sec = b.closest('.l-task'); if (sec && markSeen(sec.id)) refreshStatus(); });
  });

  refreshStatus();
  fromHash(true);
  // Deep-Link: nicht mitten in die Seite springen, damit Aufgabenliste bzw. Auswahlmenü sichtbar bleiben
  if (location.hash) {
    window.addEventListener('load', function () { setTimeout(function () { window.scrollTo(0, 0); }, 30); });
  }
  if (!location.hash) { /* Standardstart ohne Hash: Adresse sauber lassen */ }
  window.KursLabor = { show: function (id) { location.hash = '#' + id; }, status: statusOf, refresh: refreshStatus };
})();
