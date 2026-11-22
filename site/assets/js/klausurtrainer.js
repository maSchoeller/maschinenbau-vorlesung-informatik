/* =============================================================
   klausurtrainer.js – Seite klausurtrainer.html
   - eine Aufgabe im Blick, Aufgabenliste mit Filter (Lektion, Typ), Zufall, Deep-Links #k-NN
   - Papier-Aufgaben (data-a="papier"): Antwortfeld, Aufdecken, Musterlösung, Punkteschema, Selbstbewertung
   - Code-Aufgaben (data-a="klausur") und PAP-Aufgaben (data-a="pap-zeichnen") arbeiten über
     aufgaben.js bzw. pap-editor.js; der Fortschritt landet im selben Namensraum
     (KursSpeicher, Lektion „klausurtrainer“, Schlüssel aufg / begonnen / papier:<id>).
   Braucht: speicher.js, icons.js, aufgaben.js (KursAufgaben.store/update). Optional: pap-engine.js, kurs.js.
   ============================================================= */
(function () {
  'use strict';

  var LESSON = 'klausurtrainer';
  var TYPEN = {
    'code': 'Code schreiben',
    'pap-code': 'PAP gegeben, Code schreiben',
    'pap-zeichnen': 'Code gegeben, PAP zeichnen',
    'ausgabe': 'Ausgabe bestimmen',
    'fehler': 'Fehler finden',
    'theorie': 'Theorie und Rechnen'
  };
  var TYP_KURZ = {
    'code': 'Code schreiben', 'pap-code': 'PAP zu Code', 'pap-zeichnen': 'Code zu PAP',
    'ausgabe': 'Ausgabe', 'fehler': 'Fehler finden', 'theorie': 'Theorie'
  };
  var GRUPPEN = [
    { id: 'g1', name: 'Fundament', von: 1, bis: 9 },
    { id: 'g2', name: 'Werkzeug', von: 10, bis: 13 },
    { id: 'g3', name: 'Projekt', von: 14, bis: 20 }
  ];
  var LABOR_BIS = 18;   // Labor-Seiten gibt es bis V18

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function ic(name) { return window.KIcon ? window.KIcon(name) : document.createTextNode(''); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function lessonNr(s) { return parseInt(String(s).replace(/\D/g, ''), 10) || 0; }
  function punkte(n) { return n + (n === 1 ? ' Punkt' : ' Punkte'); }
  function gruppeVon(nr) { for (var i = 0; i < GRUPPEN.length; i++) if (nr >= GRUPPEN[i].von && nr <= GRUPPEN[i].bis) return GRUPPEN[i]; return GRUPPEN[GRUPPEN.length - 1]; }
  function gruppenName(g) { return 'V' + pad2(g.von) + ' bis V' + pad2(g.bis) + ' · ' + g.name; }

  /* ── Speicher ─────────────────────────────────────────────── */
  var KS = window.KursSpeicher || null;
  var KA = window.KursAufgaben || null;
  function pfad(name) { return KS && KS.pfad ? KS.pfad(LESSON, name) : null; }
  function lesen(name) { var p = pfad(name); if (!p) return undefined; try { return KS.sofort.lesen(p); } catch (e) { return undefined; } }
  function schreiben(name, v) { var p = pfad(name); if (p) { try { KS.sofort.schreiben(p, v); } catch (e) { /* ohne Speicher weiter */ } } }
  function loeschen(name) { var p = pfad(name); if (p) { try { KS.sofort.loeschen(p); } catch (e) { /* ohne Speicher weiter */ } } }
  function solvedMap() { try { return (KA && KA.store.solved(LESSON)) || {}; } catch (e) { return {}; } }
  function startedMap() { try { return (KA && KA.store.started(LESSON)) || {}; } catch (e) { return {}; } }
  function setSolved(id) {
    if (KA && KA.store) { try { KA.store.setSolved(LESSON, id); } catch (e) { /* weiter */ } }
    if (KA && KA.update) KA.update(); else refresh();
  }
  function setStarted(id) {
    if (KA && KA.store && KA.store.setStarted) { try { if (KA.store.setStarted(LESSON, id) && KA.update) KA.update(); } catch (e) { /* weiter */ } }
  }

  /* ── Aufgaben einlesen ────────────────────────────────────── */
  var tasks = [];     // {id, art, nr, lektion, typ, punkte, min, titel, item}
  var byId = {};
  var cur = null;     // aktuell angezeigte Aufgaben-ID

  function readTasks() {
    $$('article.kt-task').forEach(function (a) {
      var t = {
        id: a.id, art: a,
        lektion: a.getAttribute('data-lektion'), nr: lessonNr(a.getAttribute('data-lektion')),
        typ: a.getAttribute('data-typ'), punkte: parseInt(a.getAttribute('data-punkte'), 10) || 0,
        min: parseInt(a.getAttribute('data-minuten'), 10) || 0,
        titel: ($('h2', a) || {}).textContent || a.id
      };
      tasks.push(t); byId[t.id] = t;
    });
  }

  function buildKicker(t) {
    var k = $('.kt-task__kicker', t.art);
    if (!k) return;
    k.textContent = '';
    var l;
    if (t.nr >= 1 && t.nr <= LABOR_BIS) {
      l = el('a', { href: 'lektionen/v' + pad2(t.nr) + '-labor.html', text: t.lektion });
      l.setAttribute('aria-label', 'Lektion ' + t.lektion + ', Programmierlabor öffnen');
    } else l = document.createTextNode(t.lektion);
    k.appendChild(document.createTextNode('aus '));
    k.appendChild(l);
    k.appendChild(document.createTextNode(' · ' + TYPEN[t.typ] + ' · ' + punkte(t.punkte) + ' · Richtzeit ' + t.min + ' Min'));
  }

  /* ── PAP-Abbildungen und Code-Anzeige in der Aufgabenstellung ─ */
  function renderPap(t) {
    $$('script[data-role="pap"]', t.art).forEach(function (s) {
      var host = el('div', { class: 'kt-pap' });
      s.insertAdjacentElement('afterend', host);
      try {
        var K = window.KursPAP;
        var pap = K.toPap(K.fromJson(JSON.parse(s.textContent)));
        host.innerHTML = K.figure(pap, { label: K.describe(pap), minw: 1 });
      } catch (e) {
        host.appendChild(el('p', { class: 'a-banner is-bad', text: 'Der Programmablaufplan konnte nicht gezeichnet werden.' }));
      }
    });
  }
  function codeBlock(text, run) {
    var code = el('code'); code.textContent = text;
    var pre = el('pre', { class: 'k-code' }, [code]);
    if (!run) pre.setAttribute('data-run', 'no');
    return pre;
  }
  function renderCode(t) {
    $$('.kt-papier script[data-role="code"]', t.art).forEach(function (s) {
      s.insertAdjacentElement('afterend', codeBlock(s.textContent.replace(/^\n/, '').replace(/\s+$/, ''), false));
    });
  }

  /* ── Papier-Aufgabe ───────────────────────────────────────── */
  function normZeile(s) { return String(s).replace(/\r/g, '').replace(/\s+/g, ' ').trim(); }
  function zeilenListe(s) { return String(s).replace(/\r/g, '').split('\n').map(normZeile).filter(Boolean); }
  function jsonRole(root, role) {
    var s = $('script[data-role="' + role + '"]', root);
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  }
  function textRole(root, role) {
    var s = $('script[data-role="' + role + '"]', root);
    return s ? s.textContent.replace(/^\n/, '').replace(/\s+$/, '') : '';
  }

  function initPapier(t) {
    var root = $('.kt-papier', t.art);
    if (!root) return;
    var id = root.getAttribute('data-id');
    var minutes = parseInt(root.getAttribute('data-minutes') || '0', 10);
    var schema = jsonRole(root, 'scheme') || [];
    var maxPts = schema.reduce(function (s, x) { return s + (x.p || 0); }, 0);
    var erwartet = zeilenListe(textRole(root, 'ausgabe'));
    var istAusgabe = t.typ === 'ausgabe';
    var tpl = $('template[data-role="loesung"]', root);
    var name = 'papier:' + id;
    var taId = 'kt-ta-' + id;

    var wrap = el('div', { class: 'kt-antwort' });
    wrap.appendChild(el('label', { for: taId, class: 'kt-antwort__label', text: istAusgabe ? 'Deine Ausgabe (eine Zeile pro Bildschirmzeile)' : 'Deine Antwort (Rechenweg, Stichpunkte oder Code)' }));
    wrap.appendChild(el('p', { class: 'k-small k-muted', id: taId + '-hint', text: 'Du kannst auf Papier schreiben und hier nur kurz notieren. Der Text bleibt auf diesem Gerät gespeichert.' }));
    var ta = el('textarea', { id: taId, class: 'kt-antwort__ta' + (istAusgabe ? ' is-mono' : ''), rows: istAusgabe ? String(Math.max(6, erwartet.length + 2)) : '9', spellcheck: 'false', autocomplete: 'off', 'aria-describedby': taId + '-hint' });
    wrap.appendChild(ta);

    var bar = el('div', { class: 'a-bar' });
    var timerEl = el('span', { class: 'a-timer', 'aria-live': 'off' });
    var btnAuf = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Aufdecken', 'aria-disabled': 'true' });
    var btnNeu = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu versuchen', hidden: '' });
    var status = el('span', { class: 'a-status', role: 'status', 'aria-live': 'polite' });
    [timerEl, btnAuf, btnNeu, status].forEach(function (n) { bar.appendChild(n); });
    var reveal = el('div', { class: 'kt-reveal', hidden: '' });
    root.appendChild(wrap); root.appendChild(bar); root.appendChild(reveal);

    var started = 0, tick = null, revealed = false;
    function fmt(ms) { var s = Math.floor(ms / 1000); return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }
    function showTimer() { timerEl.textContent = 'Zeit ' + (started ? fmt(Date.now() - started) : '00:00') + (minutes ? ' · Richtzeit ' + minutes + ' Min' : ''); }
    showTimer();
    function startTimer() { if (started || revealed) return; started = Date.now(); tick = setInterval(showTimer, 1000); }

    var state = { text: '', aufgedeckt: false, haken: [] };
    function save() { state.stand = new Date().toISOString(); schreiben(name, state); }

    function updateBtn() {
      var leer = !ta.value.trim();
      btnAuf.setAttribute('aria-disabled', leer ? 'true' : 'false');
      btnAuf.title = leer ? 'Schreib erst etwas auf, dann kannst du aufdecken.' : '';
    }
    var saveTimer = null;
    ta.addEventListener('input', function () {
      startTimer(); updateBtn(); state.text = ta.value;
      clearTimeout(saveTimer); saveTimer = setTimeout(save, 400);
    });

    function badge() {
      var head = $('.kt-task__head', t.art);
      if (head && !$('.a-badge', head)) head.appendChild(el('span', { class: 'a-badge' }, [ic('check'), 'gelöst']));
    }

    function buildReveal(restore) {
      revealed = true; if (tick) clearInterval(tick);
      ta.readOnly = true; ta.setAttribute('aria-readonly', 'true');
      root.classList.add('is-revealed');
      btnAuf.hidden = true; btnNeu.hidden = false;
      reveal.innerHTML = ''; reveal.hidden = false;
      var matched = [];

      // 1) Zeilenvergleich bei „Ausgabe bestimmen“
      if (istAusgabe && erwartet.length) {
        var meine = zeilenListe(ta.value);
        var n = Math.max(meine.length, erwartet.length), ok = 0;
        var tb = el('table', { class: 'kt-cmp' });
        tb.appendChild(el('caption', { class: 'k-sr', text: 'Vergleich deiner Ausgabe mit der richtigen Ausgabe, Zeile für Zeile' }));
        tb.appendChild(el('thead', null, [el('tr', null, [el('th', { scope: 'col', text: 'Zeile' }), el('th', { scope: 'col', text: 'Deine Ausgabe' }), el('th', { scope: 'col', text: 'Richtig' }), el('th', { scope: 'col', text: 'Ergebnis' })])]));
        var body = el('tbody');
        for (var i = 0; i < n; i++) {
          var a = i < meine.length ? meine[i] : null, b = i < erwartet.length ? erwartet[i] : null;
          var gut = a !== null && b !== null && a === b;
          if (gut) ok++;
          matched[i] = gut;
          var txt = gut ? 'stimmt' : (a === null ? 'fehlt' : (b === null ? 'zu viel' : 'weicht ab'));
          var td = el('td', { class: 'kt-cmp__res' }, [el('span', { class: 'kt-cmp__mark', 'aria-hidden': 'true' }, [ic(gut ? 'check' : 'x')]), txt]);
          var tr = el('tr', { class: gut ? 'is-ok' : 'is-bad' }, [
            el('td', { text: String(i + 1) }),
            el('td', { class: 'kt-cmp__code', text: a === null ? '(nichts)' : a }),
            el('td', { class: 'kt-cmp__code', text: b === null ? '(keine Zeile)' : b }),
            td
          ]);
          body.appendChild(tr);
        }
        tb.appendChild(body);
        reveal.appendChild(el('div', { class: 'a-banner ' + (ok === erwartet.length && meine.length === erwartet.length ? 'is-ok' : 'is-bad'), role: 'status', text: ok + ' von ' + erwartet.length + ' Zeilen stimmen' + (meine.length > erwartet.length ? ' (du hast ' + (meine.length - erwartet.length) + ' Zeile(n) zu viel)' : '') + '. Der Vergleich ignoriert überzählige Leerzeichen und Leerzeilen.' }));
        reveal.appendChild(el('div', { class: 'kt-cmp__wrap' }, [tb]));
      }

      // 2) Musterlösung
      var sol = el('div', { class: 'kt-loesung' });
      sol.appendChild(el('h3', { text: 'Musterlösung' }));
      if (istAusgabe) {
        sol.appendChild(el('p', { text: 'Richtige Ausgabe:' }));
        sol.appendChild(codeBlock(erwartet.join('\n'), false));
      }
      if (tpl) sol.appendChild(document.importNode(tpl.content, true));
      reveal.appendChild(sol);
      if (istAusgabe) {
        var code = textRole(root, 'code');
        if (code) {
          reveal.appendChild(el('p', { class: 'k-small k-muted', text: 'Zum Nachprüfen: der Code zur Aufgabe, ausführbar.' }));
          reveal.appendChild(codeBlock(code, true));
        }
      }

      // 3) Punkteschema
      var fs = el('fieldset', { class: 'a-scheme__fs' }, [el('legend', { text: 'Selbstbewertung nach Punkteschema (' + maxPts + ' Punkte)' })]);
      fs.appendChild(el('p', { class: 'k-small k-muted', text: 'Setze ein Häkchen nur dort, wo deine Antwort die Anforderung wirklich enthält. Ab 50 % gilt die Aufgabe als gelöst.' }));
      var score = el('p', { class: 'a-scheme__score', role: 'status', 'aria-live': 'polite' });
      var boxes = [];
      schema.forEach(function (it, i) {
        var cid = 'kt-s-' + id + '-' + i;
        var cb = el('input', { type: 'checkbox', id: cid });
        var vorgabe = restore && restore.haken && restore.haken.length === schema.length ? !!restore.haken[i] : (istAusgabe && typeof it.z === 'number' && matched[it.z] === true);
        cb.checked = vorgabe;
        cb.addEventListener('change', function () { rechne(true); });
        boxes.push({ cb: cb, p: it.p });
        fs.appendChild(el('label', { class: 'a-scheme__item', for: cid }, [cb, el('span', { text: it.t }), el('span', { class: 'a-scheme__pts', text: punkte(it.p) })]));
      });
      function rechne(speichern) {
        var got = boxes.reduce(function (s, b) { return s + (b.cb.checked ? b.p : 0); }, 0);
        var pct = maxPts ? Math.round(100 * got / maxPts) : 0;
        score.textContent = 'Du gibst dir ' + got + ' von ' + maxPts + ' Punkten (' + pct + ' %). ' + (pct >= 50 ? 'Das wäre bestanden.' : 'Unter 50 %: Lies die Musterlösung noch einmal und versuche es morgen neu.');
        state.haken = boxes.map(function (b) { return b.cb.checked ? 1 : 0; });
        state.punkte = got;
        if (speichern) save();
        if (maxPts && got * 2 >= maxPts) { setSolved(id); badge(); }
      }
      reveal.appendChild(fs); reveal.appendChild(score);
      if (istAusgabe && !(restore && restore.haken && restore.haken.length)) rechne(true); else rechne(false);
      if (istAusgabe && !restore) status.textContent = 'Die Häkchen sind nach dem Zeilenvergleich vorbelegt. Prüfe sie.';
    }

    btnAuf.addEventListener('click', function () {
      if (btnAuf.getAttribute('aria-disabled') === 'true') { status.textContent = 'Schreib erst etwas auf, dann kannst du aufdecken.'; ta.focus(); return; }
      state.text = ta.value; state.aufgedeckt = true; state.haken = [];
      buildReveal(null);
      save();
      setStarted(id);
    });
    btnNeu.addEventListener('click', function () {
      revealed = false; started = 0; if (tick) clearInterval(tick); showTimer();
      ta.readOnly = false; ta.removeAttribute('aria-readonly'); ta.value = '';
      root.classList.remove('is-revealed');
      reveal.hidden = true; reveal.innerHTML = '';
      btnAuf.hidden = false; btnNeu.hidden = true; updateBtn();
      state = { text: '', aufgedeckt: false, haken: [] };
      loeschen(name);
      status.textContent = 'Neu starten: schreibe deine Antwort noch einmal.';
      ta.focus();
    });

    // gespeicherten Stand laden
    var alt = lesen(name);
    if (alt && typeof alt === 'object' && alt.text) {
      ta.value = alt.text; state.text = alt.text; updateBtn();
      if (alt.aufgedeckt) { state.aufgedeckt = true; state.haken = alt.haken || []; buildReveal(alt); }
      else status.textContent = 'Dein letzter Stand wurde geladen.';
    }
    if (solvedMap()[id]) { root.classList.add('is-solved'); badge(); }
  }

  /* ── Liste, Filter, Fortschritt ───────────────────────────── */
  var ui = {};
  var filter = { lektion: '', typ: '' };

  function statusVon(id, sv, st) { return sv[id] ? 'done' : (st[id] ? 'part' : 'open'); }
  var STATUS_TEXT = { done: 'gelöst', part: 'begonnen', open: 'offen' };
  var STATUS_ICON = { done: 'done', part: 'half', open: 'circle' };

  function buildFilter() {
    var sl = ui.fLektion, sty = ui.fTyp;
    sl.appendChild(el('option', { value: '', text: 'Alle Lektionen (V01 bis V20)' }));
    var nrs = {};
    tasks.forEach(function (t) { nrs[t.nr] = (nrs[t.nr] || 0) + 1; });
    Object.keys(nrs).map(Number).sort(function (a, b) { return a - b; }).forEach(function (n) {
      sl.appendChild(el('option', { value: 'V' + pad2(n), text: 'V' + pad2(n) + ' (' + nrs[n] + (nrs[n] === 1 ? ' Aufgabe)' : ' Aufgaben)') }));
    });
    sty.appendChild(el('option', { value: '', text: 'Alle Aufgabentypen' }));
    Object.keys(TYPEN).forEach(function (k) {
      var n = tasks.filter(function (t) { return t.typ === k; }).length;
      if (n) sty.appendChild(el('option', { value: k, text: TYPEN[k] + ' (' + n + ')' }));
    });
  }

  function buildList() {
    ui.liste.innerHTML = '';
    GRUPPEN.forEach(function (g) {
      var sec = el('section', { class: 'kt-list__sec', 'data-gruppe': g.id });
      var h = el('h3', { class: 'kt-list__group' }, [el('span', { text: gruppenName(g) }), el('span', { class: 'kt-list__count', 'data-count': g.id })]);
      var ul = el('ul', { class: 'kt-list__items' });
      tasks.filter(function (t) { return t.nr >= g.von && t.nr <= g.bis; }).forEach(function (t) {
        var a = el('a', { class: 'kt-item', href: '#' + t.id, 'data-id': t.id });
        a.appendChild(el('span', { class: 'kt-item__mark', 'aria-hidden': 'true' }));
        var body = el('span', { class: 'kt-item__body' }, [
          el('span', { class: 'kt-item__name', text: t.titel }),
          el('span', { class: 'kt-item__meta', text: t.lektion + ' · ' + TYP_KURZ[t.typ] + ' · ' + t.punkte + ' P.' }),
          el('span', { class: 'k-sr', 'data-sr': '' })
        ]);
        a.appendChild(body);
        a.addEventListener('click', function (e) { e.preventDefault(); go(t.id, true); });
        var li = el('li', { 'data-id': t.id }, [a]);
        t.item = a; t.li = li;
        ul.appendChild(li);
      });
      sec.appendChild(h); sec.appendChild(ul);
      ui.liste.appendChild(sec);
    });
  }

  function sichtbar(t) {
    return (!filter.lektion || t.lektion === filter.lektion) && (!filter.typ || t.typ === filter.typ);
  }
  function sichtbareTasks() { return tasks.filter(sichtbar); }

  function applyFilter() {
    var n = 0;
    tasks.forEach(function (t) { var s = sichtbar(t); t.li.hidden = !s; if (s) n++; });
    $$('.kt-list__sec', ui.liste).forEach(function (sec) { sec.hidden = !$$('li', sec).some(function (li) { return !li.hidden; }); });
    var aktiv = filter.lektion || filter.typ;
    ui.fStatus.textContent = aktiv ? n + ' von ' + tasks.length + ' Aufgaben passen zum Filter.' : '';
    ui.fReset.hidden = !aktiv;
    ui.leer.hidden = n > 0;
    updateNav();
  }

  function refresh() {
    var sv = solvedMap(), st = startedMap();
    var gesamt = 0, begonnen = 0, pts = 0, ptsMax = 0;
    var grp = {};
    GRUPPEN.forEach(function (g) { grp[g.id] = { n: 0, ok: 0 }; });
    tasks.forEach(function (t) {
      var s = statusVon(t.id, sv, st);
      var g = gruppeVon(t.nr);
      grp[g.id].n++;
      if (s === 'done') { gesamt++; grp[g.id].ok++; }
      else if (s === 'part') begonnen++;
      t.status = s;
      t.art.classList.toggle('is-solved', s === 'done');
      if (t.item) {
        t.item.setAttribute('data-status', s);
        var mk = $('.kt-item__mark', t.item); mk.innerHTML = ''; mk.appendChild(ic(STATUS_ICON[s]));
        $('[data-sr]', t.item).textContent = ', ' + STATUS_TEXT[s];
      }
      var head = $('.kt-task__head', t.art);
      if (head) {
        var b = $('.kt-task__badge', head);
        if (s === 'done' && !b) head.appendChild(el('span', { class: 'a-badge kt-task__badge' }, [ic('check'), 'gelöst']));
        if (s !== 'done' && b) b.remove();
        $$('.a-badge:not(.kt-task__badge)', head).forEach(function (x) { if (s === 'done') x.remove(); });
      }
    });
    GRUPPEN.forEach(function (g) {
      var c = $('[data-count="' + g.id + '"]', ui.liste);
      if (c) c.textContent = grp[g.id].ok + ' von ' + grp[g.id].n;
    });
    renderSummary(gesamt, begonnen, grp);
    updateNav();
  }

  function balken(n, max, label) {
    var pct = max ? Math.round(100 * n / max) : 0;
    var bar = el('div', { class: 'k-progress__bar kt-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': label }, [el('div', { class: 'kt-bar__fill' })]);
    bar.firstChild.style.width = pct + '%';
    return bar;
  }
  function renderSummary(ok, teil, grp) {
    var s = ui.summary; if (!s) return;
    s.innerHTML = '';
    s.appendChild(el('p', { class: 'kt-sum__main' }, [el('strong', { text: ok + ' von ' + tasks.length + ' Aufgaben gelöst' }), teil ? ' · ' + teil + ' begonnen' : '']));
    s.appendChild(balken(ok, tasks.length, 'Gesamtfortschritt im Klausurtrainer'));
    var ul = el('ul', { class: 'kt-sum__groups' });
    GRUPPEN.forEach(function (g) {
      var d = grp[g.id];
      ul.appendChild(el('li', null, [el('span', { class: 'kt-sum__gname', text: gruppenName(g) }), balken(d.ok, d.n, 'Fortschritt ' + gruppenName(g)), el('span', { class: 'kt-sum__gtxt', text: d.ok + ' von ' + d.n })]));
    });
    s.appendChild(ul);
  }

  /* ── Anzeigen und Navigieren ──────────────────────────────── */
  function show(id, fokus, scrollen) {
    var t = byId[id]; if (!t) return;
    cur = id;
    tasks.forEach(function (x) { x.art.hidden = x.id !== id; if (x.item) { if (x.id === id) x.item.setAttribute('aria-current', 'page'); else x.item.removeAttribute('aria-current'); } });
    ui.leer.hidden = true;
    ui.toggle.textContent = 'Aufgabenliste · jetzt ' + t.lektion + ', Aufgabe ' + (tasks.indexOf(t) + 1) + ' von ' + tasks.length;
    updateNav();
    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) setListOpen(false);
    if (scrollen) {
      var r = ui.app.getBoundingClientRect();
      if (r.top < 0 || r.top > 120) window.scrollTo(0, Math.max(0, window.scrollY + r.top - 8));
    }
    if (fokus) { var h = $('h2', t.art); if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } } }
  }
  function go(id, fokus) {
    if (location.hash === '#' + id) { show(id, fokus, true); return; }
    try { history.pushState(null, '', '#' + id); } catch (e) { location.hash = id; }
    show(id, fokus, true);
  }
  function updateNav() {
    var nav = ui.navBar; if (!nav) return;
    var liste = sichtbareTasks();
    var i = liste.map(function (t) { return t.id; }).indexOf(cur);
    var prev = i > 0 ? liste[i - 1] : null, next = i >= 0 && i < liste.length - 1 ? liste[i + 1] : (i < 0 && liste.length ? liste[0] : null);
    ui.prev.disabled = !prev; ui.next.disabled = !next;
    ui.prev.setAttribute('data-ziel', prev ? prev.id : ''); ui.next.setAttribute('data-ziel', next ? next.id : '');
    ui.pos.textContent = i >= 0 ? 'Aufgabe ' + (i + 1) + ' von ' + liste.length + (liste.length < tasks.length ? ' (gefiltert)' : '') : (liste.length ? liste.length + ' Aufgaben im Filter' : '');
  }
  function zufall() {
    var sv = solvedMap();
    var kand = sichtbareTasks().filter(function (t) { return !sv[t.id] && t.id !== cur; });
    if (!kand.length) {
      var offen = sichtbareTasks().filter(function (t) { return !sv[t.id]; });
      ui.fStatus.textContent = offen.length ? 'Das ist die einzige offene Aufgabe in diesem Filter.' : 'Alle Aufgaben in diesem Filter sind gelöst. Wähle einen anderen Filter oder wiederhole eine Aufgabe.';
      if (offen.length) go(offen[0].id, true);
      return;
    }
    var t = kand[Math.floor(Math.random() * kand.length)];
    ui.fStatus.textContent = 'Zufällig gewählt: ' + t.lektion + ', ' + t.titel + '.';
    go(t.id, true);
  }
  function setListOpen(open) {
    ui.liste_wrap.classList.toggle('is-open', open);
    ui.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function fromHash() {
    var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (byId[id]) { show(id, false, !!id && document.readyState === 'complete'); return true; }
    return false;
  }

  /* ── Start ────────────────────────────────────────────────── */
  function init() {
    var app = $('[data-kt="app"]'); if (!app) return;
    ui.app = app;
    ui.summary = $('[data-kt="summary"]');
    ui.liste = $('[data-kt="liste"]');
    ui.liste_wrap = $('[data-kt="liste-wrap"]');
    ui.toggle = $('[data-kt="toggle"]');
    ui.fLektion = $('[data-kt="f-lektion"]'); ui.fTyp = $('[data-kt="f-typ"]');
    ui.fStatus = $('[data-kt="f-status"]'); ui.fReset = $('[data-kt="f-reset"]');
    ui.leer = $('[data-kt="leer"]'); ui.main = $('[data-kt="main"]');

    readTasks();
    tasks.forEach(function (t) { buildKicker(t); renderPap(t); renderCode(t); initPapier(t); });

    // Navigation unter der Aufgabe
    ui.navBar = el('div', { class: 'kt-nav' });
    ui.prev = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Vorherige' });
    ui.next = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Nächste' });
    ui.pos = el('span', { class: 'kt-nav__pos k-small k-muted', role: 'status', 'aria-live': 'polite' });
    ui.navBar.appendChild(ui.prev); ui.navBar.appendChild(ui.pos); ui.navBar.appendChild(ui.next);
    ui.main.appendChild(ui.navBar);
    ui.prev.addEventListener('click', function () { var z = ui.prev.getAttribute('data-ziel'); if (z) go(z, true); });
    ui.next.addEventListener('click', function () { var z = ui.next.getAttribute('data-ziel'); if (z) go(z, true); });

    buildFilter(); buildList();
    ui.fLektion.addEventListener('change', function () { filter.lektion = ui.fLektion.value; applyFilter(); });
    ui.fTyp.addEventListener('change', function () { filter.typ = ui.fTyp.value; applyFilter(); });
    ui.fReset.addEventListener('click', function () { filter.lektion = ''; filter.typ = ''; ui.fLektion.value = ''; ui.fTyp.value = ''; applyFilter(); ui.fLektion.focus(); });
    $('[data-kt="zufall"]').addEventListener('click', zufall);
    ui.toggle.addEventListener('click', function () { setListOpen(ui.toggle.getAttribute('aria-expanded') !== 'true'); });

    document.addEventListener('kurs:progress', refresh);
    window.addEventListener('hashchange', function () { fromHash(); });
    window.addEventListener('storage', refresh);

    refresh(); applyFilter();
    if (!fromHash()) {
      var sv = solvedMap();
      var erste = tasks.filter(function (t) { return !sv[t.id]; })[0] || tasks[0];
      show(erste.id, false, false);   // ohne Anker setzen, sonst springt der Browser beim Laden zur Aufgabe
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
