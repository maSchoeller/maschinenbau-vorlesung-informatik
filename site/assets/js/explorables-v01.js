/* =============================================================
   explorables-v01.js – Explorables der Lerneinheit V01 (reines JS, kein Framework)
   (A) Ampel-Sortierspiel: Fähigkeiten in Im Kopf / Lesen & erkennen / Delegieren einordnen
   (B) Variablen als Etiketten: Zuweisungen Schritt für Schritt, Namen zeigen auf Werte
   Daten stehen als <script type="application/json"> im Host-Element.
   Der Rechenkern von (B) (stateAt) ist ohne DOM testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(name) {
    if (typeof window !== 'undefined' && typeof window.KIcon === 'function') return window.KIcon(name);
    return document.createTextNode('');
  }
  function readJson(host) {
    var s = host.querySelector('script[type="application/json"]');
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  }

  /* ── (A) Ampel-Sortierspiel ──────────────────────────────── */
  var STUFEN = {
    kopf:  { label: 'Im Kopf', icon: 'head' },
    lesen: { label: 'Lesen & erkennen', icon: 'book' },
    deleg: { label: 'Delegieren', icon: 'handover' }
  };

  function initAmpel(host) {
    var cards = readJson(host);
    if (!cards || !cards.length) return;
    host.textContent = '';
    var placed = 0, right = 0;
    var score = el('p', { class: 'ak-score', role: 'status', 'aria-live': 'polite' });
    var list = el('ol', { class: 'ak-list' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Nochmal von vorn' });
    var bar = el('div', { class: 'ak-bar' }, [score, resetBtn]);
    host.appendChild(bar);
    host.appendChild(list);

    function updateScore() {
      if (!placed) { score.textContent = 'Noch nichts eingeordnet. ' + cards.length + ' Karten warten.'; return; }
      var s = placed + ' von ' + cards.length + ' eingeordnet, davon ' + right + ' passend zur Musterlösung.';
      if (placed === cards.length) s += right === cards.length ? ' Volle Übereinstimmung.' : ' Lies die Begründungen bei den Abweichungen. Manche Karten sind Ermessenssache, die Begründung zählt.';
      score.textContent = s;
    }

    function build() {
      list.textContent = '';
      placed = 0; right = 0;
      cards.forEach(function (c, i) {
        var id = 'ak' + (++uid);
        var li = el('li', { class: 'ak-card' });
        li.appendChild(el('p', { class: 'ak-card__text', id: id + '-t', text: c.t }));
        var group = el('div', { class: 'ak-choices', role: 'group', 'aria-labelledby': id + '-t' });
        var fb = el('div', { class: 'ak-fb', hidden: '' });
        var btns = [];
        Object.keys(STUFEN).forEach(function (k) {
          var b = el('button', { type: 'button', class: 'ak-choice ak-choice--' + k, 'aria-pressed': 'false' }, [icon(STUFEN[k].icon), ' ' + STUFEN[k].label]);
          b.addEventListener('click', function () { choose(k); });
          btns.push({ k: k, b: b });
          group.appendChild(b);
        });
        function choose(k) {
          var ok = k === c.k;
          placed++; if (ok) right++;
          btns.forEach(function (o) {
            o.b.disabled = true;
            o.b.setAttribute('aria-pressed', o.k === k ? 'true' : 'false');
            if (o.k === k) o.b.classList.add('is-chosen');
            if (o.k === c.k) o.b.classList.add('is-model');
          });
          fb.hidden = false;
          fb.className = 'ak-fb ' + (ok ? 'is-ok' : 'is-diff');
          fb.textContent = '';
          fb.appendChild(el('strong', {}, [icon(ok ? 'check' : 'x'), ' ' + (ok ? 'Passt.' : 'Wir ordnen das anders ein: ' + STUFEN[c.k].label + '.')]));
          fb.appendChild(document.createTextNode(' ' + c.w));
          updateScore();
        }
        li.appendChild(group); li.appendChild(fb);
        list.appendChild(li);
      });
      updateScore();
    }
    resetBtn.addEventListener('click', function () { build(); var f = list.querySelector('button'); if (f) f.focus(); });
    build();
  }

  /* ── (B) Variablen als Etiketten ─────────────────────────── */
  /* Zustand nach Schritt n (0 = vor dem ersten Schritt).
     steps[i].set: { name: {v:'250', t:'Zahl'} | {ref:'anderer_name'} }  */
  function stateAt(steps, n) {
    var values = [], bind = {}, names = [], out = [];
    for (var i = 0; i < n && i < steps.length; i++) {
      var s = steps[i], set = s.set || {};
      // erst alle Referenzen auf den Stand VOR dem Schritt auflösen
      var resolved = {};
      Object.keys(set).forEach(function (nm) {
        var d = set[nm];
        if (d.ref !== undefined) resolved[nm] = bind[d.ref];
        else { values.push({ id: values.length, v: d.v, t: d.t }); resolved[nm] = values.length - 1; }
      });
      Object.keys(resolved).forEach(function (nm) {
        if (names.indexOf(nm) < 0) names.push(nm);
        bind[nm] = resolved[nm];
      });
      if (s.out !== undefined) out.push(s.out);
    }
    var used = {};
    names.forEach(function (nm) { used[bind[nm]] = true; });
    return { values: values, bind: bind, names: names, out: out, used: used, step: n > 0 ? steps[Math.min(n, steps.length) - 1] : null };
  }

  function initEtiketten(host) {
    var cfg = readJson(host);
    if (!cfg || !cfg.programs || !cfg.programs.length) return;
    host.textContent = '';
    var pid = 'ek' + (++uid);
    var cur = 0, n = 0;
    var prog = cfg.programs[0];

    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Programm wählen' });
    var segBtns = cfg.programs.map(function (p, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: p.title });
      b.addEventListener('click', function () { select(i); });
      seg.appendChild(b); return b;
    });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { text: 'Beispielprogramm' }), seg])]));

    var codeOl = el('ol', { class: 'ek-code', 'aria-label': 'Programmzeilen' });
    var mem = el('div', { class: 'ek-mem' });
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'ek-arrows'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    var namesCol = el('div', { class: 'ek-col ek-col--names' });
    var valsCol = el('div', { class: 'ek-col ek-col--vals' });
    mem.appendChild(svg);
    mem.appendChild(el('div', { class: 'ek-cols' }, [
      el('div', { class: 'ek-colwrap' }, [el('p', { class: 'ek-head', text: 'Namen (Etiketten)' }), namesCol]),
      el('div', { class: 'ek-colwrap' }, [el('p', { class: 'ek-head', text: 'Werte im Speicher' }), valsCol])
    ]));
    host.appendChild(el('div', { class: 'ek' }, [
      el('div', { class: 'ek-left' }, [el('p', { class: 'ek-head', text: 'Programm' }), codeOl]),
      el('div', { class: 'ek-right' }, [mem])
    ]));

    var note = el('p', { class: 'ek-note', id: pid + '-note', role: 'status', 'aria-live': 'polite' });
    var outBox = el('pre', { class: 'ek-out', 'aria-label': 'Ausgabe von print' });
    var backBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: '← Zurück' });
    var nextBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt →' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Von vorn' });
    host.appendChild(el('div', { class: 'a-bar ek-bar' }, [backBtn, nextBtn, resetBtn]));
    host.appendChild(note);
    host.appendChild(el('p', { class: 'ek-head', text: 'Ausgabe' }));
    host.appendChild(outBox);
    var read = el('div', { class: 'k-readout ek-read', 'aria-live': 'off' });
    host.appendChild(read);

    function select(i) {
      cur = i; prog = cfg.programs[i]; n = 0;
      segBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      codeOl.textContent = '';
      prog.code.forEach(function (l, k) {
        var li = el('li', { 'data-line': String(k + 1) });
        li.appendChild(el('code', { text: l.length ? l : ' ' }));
        codeOl.appendChild(li);
      });
      render();
    }

    function render() {
      var st = stateAt(prog.steps, n);
      var line = st.step ? st.step.line : 0;
      Array.prototype.forEach.call(codeOl.children, function (li) {
        var on = parseInt(li.getAttribute('data-line'), 10) === line;
        li.classList.toggle('is-cur', on);
        if (on) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      var changed = st.step && st.step.set ? Object.keys(st.step.set) : [];
      namesCol.textContent = ''; valsCol.textContent = '';
      var nameEls = {}, valEls = {};
      st.names.forEach(function (nm) {
        var c = el('div', { class: 'ek-name' + (changed.indexOf(nm) >= 0 ? ' is-new' : ''), 'data-name': nm }, [el('code', { text: nm })]);
        nameEls[nm] = c; namesCol.appendChild(c);
      });
      st.values.forEach(function (v) {
        var orphan = !st.used[v.id];
        var isNew = st.step && st.step.set && Object.keys(st.step.set).some(function (nm) { return st.bind[nm] === v.id && st.step.set[nm].ref === undefined; });
        var c = el('div', { class: 'ek-val' + (orphan ? ' is-orphan' : '') + (isNew ? ' is-new' : ''), 'data-val': String(v.id) }, [
          el('code', { class: 'ek-val__v', text: v.v }),
          el('span', { class: 'ek-val__t', text: v.t + (orphan ? ', ohne Namen' : '') })
        ]);
        valEls[v.id] = c; valsCol.appendChild(c);
      });
      if (!st.names.length) namesCol.appendChild(el('p', { class: 'ek-empty', text: 'Noch kein Name vergeben.' }));
      if (!st.values.length) valsCol.appendChild(el('p', { class: 'ek-empty', text: 'Noch kein Wert im Speicher.' }));
      note.textContent = n === 0
        ? 'Noch läuft nichts. Mit „Nächster Schritt“ führst du die erste Zeile aus. Achte darauf, was rechts vom Gleichheitszeichen passiert, bevor links etwas geschieht.'
        : (st.step.note || '');
      outBox.textContent = st.out.join('\n');
      backBtn.disabled = n === 0;
      nextBtn.disabled = n >= prog.steps.length;
      nextBtn.textContent = n >= prog.steps.length ? 'Fertig' : 'Nächster Schritt →';
      read.textContent = '';
      var dl = el('dl');
      st.names.forEach(function (nm) {
        var v = st.values[st.bind[nm]];
        dl.appendChild(el('dt', { text: nm })); dl.appendChild(el('dd', { text: 'zeigt auf ' + v.v + ' (' + v.t + ')' }));
      });
      if (st.names.length) { read.appendChild(el('p', { class: 'k-small k-muted', text: 'Stand als Text:' })); read.appendChild(dl); }
      // Pfeile nach dem Layout zeichnen
      draw(st, nameEls, valEls, changed);
    }

    function draw(st, nameEls, valEls, changed) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var box = mem.getBoundingClientRect();
      if (!box.width) return;
      svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      var defs = document.createElementNS(SVGNS, 'defs');
      ['a', 'b'].forEach(function (k) {
        var m = document.createElementNS(SVGNS, 'marker');
        m.setAttribute('id', pid + '-ah-' + k); m.setAttribute('viewBox', '0 0 10 10'); m.setAttribute('refX', '9'); m.setAttribute('refY', '5');
        m.setAttribute('markerWidth', '7'); m.setAttribute('markerHeight', '7'); m.setAttribute('orient', 'auto-start-reverse');
        var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', 'M0 0 L10 5 L0 10 z'); p.setAttribute('fill', k === 'a' ? '#B50016' : '#6B7280');
        m.appendChild(p); defs.appendChild(m);
      });
      svg.appendChild(defs);
      st.names.forEach(function (nm) {
        var a = nameEls[nm], b = valEls[st.bind[nm]];
        if (!a || !b) return;
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        var x1 = ra.right - box.left, y1 = ra.top + ra.height / 2 - box.top;
        var x2 = rb.left - box.left - 2, y2 = rb.top + rb.height / 2 - box.top;
        var dx = Math.max(24, (x2 - x1) / 2);
        var hot = changed.indexOf(nm) >= 0;
        var path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + (x1 + dx) + ' ' + y1 + ' ' + (x2 - dx) + ' ' + y2 + ' ' + x2 + ' ' + y2);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', hot ? '#B50016' : '#6B7280');
        path.setAttribute('stroke-width', hot ? '2.5' : '1.75');
        path.setAttribute('marker-end', 'url(#' + pid + '-ah-' + (hot ? 'a' : 'b') + ')');
        svg.appendChild(path);
      });
    }

    nextBtn.addEventListener('click', function () { if (n < prog.steps.length) { n++; render(); } });
    backBtn.addEventListener('click', function () { if (n > 0) { n--; render(); } });
    resetBtn.addEventListener('click', function () { n = 0; render(); });
    var rt = null;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 80); });
    select(0);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="ampel"]'), initAmpel);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="etiketten"]'), initEtiketten);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { stateAt: stateAt };
})(typeof window !== 'undefined' ? window : globalThis);
