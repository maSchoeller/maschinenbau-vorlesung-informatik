/* =============================================================
   explorables-v08.js – interaktive Bausteine für V08 „Datenstrukturen“ (reines JS, kein Framework)
   (A) Liste im Speicher: Kästchenreihe mit Index und negativem Index, Slicing, append, in, len.
   (B) Schleife über eine Liste: Programmablaufplan (KursPAP) + Code + Kästchen, Schritt für Schritt.
   (C) Zwei Namen, eine Liste (Aliasing): Namen zeigen per Pfeil auf Objekte im Speicher, Kopie mit a[:].
   (D) Dictionary als Schlüssel-Wert-Tabelle: nachschlagen, in, eintragen, KeyError.
   (E) Selbstcheck-Haken für Papieraufgaben (PAP zeichnen, Hausauftrag).
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  /* Zahl so schreiben, wie Python sie druckt */
  function py(x) {
    if (typeof x === 'string') return "'" + x + "'";
    if (Array.isArray(x)) return '[' + x.map(py).join(', ') + ']';
    if (x && x.tuple) return '(' + x.tuple.map(py).join(', ') + (x.tuple.length === 1 ? ',' : '') + ')';
    var s = String(x);
    return /^-?\d+$/.test(s) ? s + '.0' : s;
  }
  function pyi(x) { return String(x); }
  /* Python-Slicing: liste[a:b], a und b dürfen null (leer) oder negativ sein; Rückgabe [start, ende) */
  function sliceRange(n, a, b) {
    function norm(x, d) { if (x === null) return d; if (x < 0) x += n; return Math.max(0, Math.min(n, x)); }
    var s = norm(a, 0), e = norm(b, n);
    return [s, Math.max(s, e)];
  }
  /* Index lesen: liefert { ok, i (normiert) } oder { ok: false } (IndexError) */
  function indexOf(n, i) {
    if (i < -n || i >= n) return { ok: false };
    return { ok: true, i: i < 0 ? i + n : i };
  }
  /* Schritte der Schleife aus dem Lehrbeispiel (Messreihe, Toleranz) */
  var MESS = [12.004, 12.011, 11.998, 12.007, 12.019, 12.002, 12.015, 12.009];
  function loopSteps(werte, lo, hi) {
    var st = [], out = [], prevEdge = ['init', 'loop', ''], i;
    st.push({ nodes: ['init'], edges: [['start', 'init', '']], line: 1, i: -1, d: null, out: [], msg: 'Zuerst wird eine leere Liste angelegt: ausserhalb = []. Noch hat kein Messwert die Prüfung durchlaufen.' });
    for (i = 0; i < werte.length; i++) {
      var d = werte[i], bad = d < lo || d > hi;
      st.push({ nodes: ['loop', 'nxt'], edges: [prevEdge, ['loop', 'nxt', 'ja']], line: 2, i: i, d: d, out: out.slice(), msg: 'Es ist noch ein Wert übrig: d ist jetzt ' + py(d) + ' (Index ' + i + ', Position ' + (i + 1) + ' von ' + werte.length + ').' });
      st.push({ nodes: ['chk'], edges: [['nxt', 'chk', '']], line: 3, i: i, d: d, out: out.slice(), bad: bad, msg: 'Prüfung: ' + py(d) + ' < ' + py(lo) + ' oder ' + py(d) + ' > ' + py(hi) + '? ' + (bad ? 'Ja, der Wert liegt außerhalb der Toleranz.' : 'Nein, der Wert liegt in der Toleranz.') });
      if (bad) {
        out.push(d);
        st.push({ nodes: ['app'], edges: [['chk', 'app', 'ja']], line: 4, i: i, d: d, out: out.slice(), bad: true, msg: 'ausserhalb.append(d): ' + py(d) + ' kommt hinten in die Liste ausserhalb. Sie hat jetzt ' + out.length + (out.length === 1 ? ' Element.' : ' Elemente.') });
        prevEdge = ['app', 'loop', ''];
      } else prevEdge = ['chk', 'loop', 'nein'];
    }
    st.push({ nodes: ['loop', 'out', 'end'], edges: [prevEdge, ['loop', 'out', 'nein'], ['out', 'end', '']], line: 5, i: werte.length, d: null, out: out.slice(), done: true, msg: 'Kein Wert mehr übrig: Die Schleife endet. print(len(ausserhalb)) gibt ' + out.length + ' aus.' });
    return st;
  }
  var core = { py: py, sliceRange: sliceRange, indexOf: indexOf, loopSteps: loopSteps, MESS: MESS };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  /* ── Hilfen (DOM) ────────────────────────────────────────── */
  var NS = 'http://www.w3.org/2000/svg', uid = 0;
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function S(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function code(t) { return el('code', { class: 'k-i', text: t }); }
  function num(s) {
    s = String(s).trim().replace(',', '.');
    if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function intOrNull(s) {
    s = String(s).trim();
    if (s === '') return { v: null, ok: true };
    return /^[-+]?\d+$/.test(s) ? { v: parseInt(s, 10), ok: true } : { ok: false };
  }
  function field(label, input) { var id = 'v08f' + (++uid); input.id = id; return el('div', { class: 'k-field' }, [el('label', { 'for': id, text: label }), input]); }
  function reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function setRes(p, text, cls) { p.className = 'v08-res' + (cls ? ' ' + cls : ''); p.textContent = text; }
  function player(host, o) {
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    var count = el('span', { class: 'v08-count k-small k-muted', 'aria-hidden': 'true' });
    host.appendChild(el('div', { class: 'k-presets v08-bar', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bBack, bPlay, bReset, count]));
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    bNext.addEventListener('click', function () { stop(); o.next(); });
    bBack.addEventListener('click', function () { stop(); o.back(); });
    bReset.addEventListener('click', function () { stop(); o.reset(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (o.done()) o.reset();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { o.next(); if (o.done()) stop(); }, o.interval || 1100);
    });
    return { stop: stop, count: count, bBack: bBack, bNext: bNext, bPlay: bPlay };
  }

  /* ══════════════════════════════════════════════════════════
     (A) Liste im Speicher
     ══════════════════════════════════════════════════════════ */
  function initListe(host) {
    var START = [12.004, 12.011, 11.998, 12.007, 12.019], MAXN = 10;
    var items = START.slice();
    var row = el('div', { class: 'v08-row', role: 'list', 'aria-label': 'Die Liste messungen, ein Kästchen je Element' });
    var lenOut = el('p', { class: 'v08-len' });
    var legend = el('p', { class: 'v08-legend k-small k-muted', 'aria-hidden': 'true' }, [
      el('span', {}, ['grau oben: negativer Index (von hinten)']), el('span', {}, ['schwarz unten: Index (von vorn, ab 0)'])]);
    var iIn = el('input', { type: 'number', step: '1', value: '-1', 'aria-describedby': 'v08-res-i' });
    var aIn = el('input', { type: 'text', inputmode: 'numeric', value: '1', placeholder: 'leer', size: '4', autocomplete: 'off' });
    var bIn = el('input', { type: 'text', inputmode: 'numeric', value: '4', placeholder: 'leer', size: '4', autocomplete: 'off' });
    var apIn = el('input', { type: 'text', inputmode: 'decimal', value: '12.012', size: '8', autocomplete: 'off' });
    var apBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'append ausführen' });
    var rsBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Liste zurücksetzen' });
    var inIn = el('input', { type: 'text', inputmode: 'decimal', value: '11.998', size: '8', autocomplete: 'off' });
    var rI = el('p', { class: 'v08-res', id: 'v08-res-i', role: 'status', 'aria-live': 'polite' });
    var rS = el('p', { class: 'v08-res', role: 'status', 'aria-live': 'polite' });
    var rA = el('p', { class: 'v08-res', role: 'status', 'aria-live': 'polite' });
    var rN = el('p', { class: 'v08-res', role: 'status', 'aria-live': 'polite' });

    function op(title, kids, res) { return el('div', { class: 'v08-op' }, [el('p', { class: 'v08-op__t', text: title }), el('div', { class: 'v08-op__in' }, kids), res]); }
    var grid = el('div', { class: 'v08-ops' }, [
      op('1. Ein Element lesen', [code('messungen['), field('Index', iIn), code(']')], rI),
      op('2. Ausschnitt (Slicing)', [code('messungen['), field('von', aIn), code(':'), field('bis (nicht mehr dabei)', bIn), code(']')], rS),
      op('3. Hinten anhängen', [code('messungen.append('), field('Wert', apIn), code(')'), apBtn, rsBtn], rA),
      op('4. Ist ein Wert enthalten?', [field('Wert', inIn), code('in messungen')], rN)
    ]);
    host.appendChild(el('div', { class: 'v08-list' }, [el('p', { class: 'v08-name' }, [code('messungen'), ' im Speicher: ein Name, ein Kästchen je Wert']), row, legend, lenOut, grid]));

    var selIdx = [], sliceIdx = [], hitIdx = [], fresh = -1;
    function render() {
      row.textContent = '';
      var n = items.length;
      items.forEach(function (v, k) {
        var c = el('div', { class: 'v08-cell', role: 'listitem' }, [
          el('span', { class: 'v08-cell__neg', text: String(k - n) }),
          el('span', { class: 'v08-cell__val', text: py(v) }),
          el('span', { class: 'v08-cell__pos', text: String(k) })]);
        if (selIdx.indexOf(k) >= 0) c.classList.add('is-sel');
        if (sliceIdx.indexOf(k) >= 0) c.classList.add('is-slice');
        if (hitIdx.indexOf(k) >= 0) c.classList.add('is-hit');
        if (k === fresh) c.classList.add('is-new');
        row.appendChild(c);
      });
      lenOut.textContent = '';
      lenOut.appendChild(code('len(messungen)'));
      lenOut.appendChild(document.createTextNode(' ist ' + n + '. Das letzte Element hat den Index ' + (n - 1) + ' und den negativen Index −1.'));
    }
    function doIndex() {
      var s = iIn.value.trim();
      selIdx = [];
      if (s === '' || !/^[-+]?\d+$/.test(s)) { setRes(rI, 'Gib eine ganze Zahl ein, zum Beispiel 0 oder -1.', 'is-bad'); return; }
      var i = parseInt(s, 10), r = indexOf(items.length, i);
      if (!r.ok) setRes(rI, 'IndexError: list index out of range (die Liste hat nur ' + items.length + ' Elemente)', 'is-bad');
      else { selIdx = [r.i]; setRes(rI, 'messungen[' + i + '] ergibt ' + py(items[r.i]), 'is-ok'); }
    }
    function doSlice() {
      var a = intOrNull(aIn.value), b = intOrNull(bIn.value);
      sliceIdx = [];
      if (!a.ok || !b.ok) { setRes(rS, 'Gib ganze Zahlen ein (oder lass das Feld leer).', 'is-bad'); return; }
      var r = sliceRange(items.length, a.v, b.v), out = items.slice(r[0], r[1]);
      for (var k = r[0]; k < r[1]; k++) sliceIdx.push(k);
      var txt = 'messungen[' + (a.v === null ? '' : a.v) + ':' + (b.v === null ? '' : b.v) + '] ergibt ' + py(out);
      setRes(rS, out.length ? txt : txt + ' (leere Liste: kein Fehler)', 'is-ok');
    }
    function doIn() {
      var v = num(inIn.value);
      hitIdx = [];
      if (isNaN(v)) { setRes(rN, 'Gib eine Zahl ein, zum Beispiel 12.004.', 'is-bad'); return; }
      items.forEach(function (x, k) { if (x === v) hitIdx.push(k); });
      setRes(rN, py(v) + ' in messungen ergibt ' + (hitIdx.length ? 'True' : 'False') + (hitIdx.length ? '' : ' (Python vergleicht Kommazahlen genau, siehe V03)'), hitIdx.length ? 'is-ok' : 'is-bad');
    }
    function all() { doIndex(); doSlice(); doIn(); render(); }
    [iIn].forEach(function (i) { i.addEventListener('input', all); });
    [aIn, bIn, inIn].forEach(function (i) { i.addEventListener('input', all); });
    apBtn.addEventListener('click', function () {
      var v = num(apIn.value);
      if (isNaN(v)) { setRes(rA, 'Gib eine Zahl ein, zum Beispiel 12.012. Komma oder Punkt geht hier.', 'is-bad'); return; }
      if (items.length >= MAXN) { setRes(rA, 'Dieses Modell zeigt höchstens ' + MAXN + ' Kästchen. Setz die Liste zurück.', 'is-bad'); return; }
      items.push(v); fresh = items.length - 1;
      all();
      setRes(rA, 'messungen.append(' + py(v) + ') hängt hinten an: Die Liste wächst auf ' + items.length + ' Elemente. append gibt nichts zurück, es verändert die Liste selbst.', 'is-ok');
      if (!reduced()) setTimeout(function () { fresh = -1; render(); }, 1400);
    });
    rsBtn.addEventListener('click', function () { items = START.slice(); fresh = -1; all(); setRes(rA, 'Die Liste hat wieder die fünf Startwerte.', 'is-ok'); });
    all();
    setRes(rA, 'Noch nichts angehängt. Drück auf „append ausführen“ und beobachte das neue Kästchen.');
  }

  /* ══════════════════════════════════════════════════════════
     (B) Schleife über eine Liste, Programmablaufplan live
     ══════════════════════════════════════════════════════════ */
  var LOOP_CODE = ['ausserhalb = []', 'for d in messungen:', '    if d < toleranz[0] or d > toleranz[1]:', '        ausserhalb.append(d)', 'print(len(ausserhalb))'];
  function loopSpec() {
    var P = root.KursPAP && root.KursPAP.P;
    return [P.start('start'), P.op('ausserhalb = [ ]  (leere Liste)', 'init'),
      P.whil('noch ein Wert\nin messungen übrig?', [
        P.op('d = nächster Wert\naus messungen', 'nxt'),
        P.iff('d < untere Grenze\noder d > obere Grenze?', [P.op('d an ausserhalb\nanhängen', 'app')], [], 'chk')], 'loop'),
      P.io('Ausgabe: Anzahl der\nElemente in ausserhalb', 'out'), P.end('end', 'Ende')];
  }
  function initSchleife(host) {
    if (!root.KursPAP || !root.KursPAP.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var hi = 12.018, lo = 12.0, steps = loopSteps(MESS, lo, hi), s = 0;
    var hiIn = el('input', { type: 'number', step: '0.001', min: '12.000', max: '12.030', value: '12.018' });
    host.appendChild(el('div', { class: 'k-controls' }, [field('obere Grenze in mm (Toleranz 12 H7: 12,018)', hiIn)]));
    var msg = el('p', { class: 'v08-msg', role: 'status', 'aria-live': 'polite' });
    var papHost = el('div', { class: 'pap-wrap v08-pap' });
    var cells = el('div', { class: 'v08-row v08-row--small', role: 'list', 'aria-label': 'Die Messwerte' });
    var codeBox = el('ol', { class: 'v08-code', 'aria-label': 'Python-Code der Schleife' });
    LOOP_CODE.forEach(function (l, i) { codeBox.appendChild(el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l })])); });
    var vars = el('dl', { class: 'v08-vars' });
    var right = el('div', { class: 'v08-right' }, [cells, codeBox, vars]);
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; }, interval: 1100 });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v08-grid' }, [papHost, right]));
    papHost.innerHTML = root.KursPAP.svg(loopSpec(), { cls: 'pap--run', label: 'Programmablaufplan der Schleife über die Liste messungen: leere Liste anlegen, solange ein Wert übrig ist den nächsten holen, prüfen, bei Überschreitung anhängen, am Ende die Anzahl ausgeben.' });

    function edgeEl(f, t, l) { return papHost.querySelector('.pap-e[data-from="' + f + '"][data-to="' + t + '"][data-lab="' + l + '"]'); }
    function nodeEl(id) { return papHost.querySelector('.pap-n[data-id="' + id + '"]'); }
    function paint() {
      var st = steps[s], k;
      Array.prototype.forEach.call(papHost.querySelectorAll('.is-active, .is-on, .is-done, .is-past'), function (n) { n.classList.remove('is-active', 'is-on', 'is-done', 'is-past'); });
      for (k = 0; k <= s; k++) {
        steps[k].nodes.forEach(function (id) { var n = nodeEl(id); if (n && k < s) n.classList.add('is-done'); });
        steps[k].edges.forEach(function (e) { var x = edgeEl(e[0], e[1], e[2]); if (x && k < s) x.classList.add('is-past'); });
      }
      st.nodes.forEach(function (id) { var n = nodeEl(id); if (n) { n.classList.remove('is-done'); n.classList.add('is-active'); } });
      st.edges.forEach(function (e) { var x = edgeEl(e[0], e[1], e[2]); if (x) { x.classList.remove('is-past'); x.classList.add('is-on'); } });
      cells.textContent = '';
      MESS.forEach(function (v, i) {
        var c = el('div', { class: 'v08-cell v08-cell--small', role: 'listitem' }, [el('span', { class: 'v08-cell__val', text: py(v) }), el('span', { class: 'v08-cell__pos', text: String(i) })]);
        if (i === st.i) c.classList.add('is-sel');
        else if (i < st.i || st.done) { c.classList.add('is-past'); if (v < lo || v > hi) c.classList.add('is-bad'); }
        if (i === st.i && st.bad && st.line >= 3) c.classList.add('is-bad');
        cells.appendChild(c);
      });
      Array.prototype.forEach.call(codeBox.children, function (li) { li.classList.toggle('is-active', li.getAttribute('data-ln') === String(st.line)); });
      vars.textContent = '';
      [['d', st.d === null ? '–' : py(st.d)], ['ausserhalb', py(st.out)], ['len(ausserhalb)', String(st.out.length)]].forEach(function (p) { vars.appendChild(el('dt', { text: p[0] })); vars.appendChild(el('dd', { text: p[1] })); });
      msg.textContent = 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st.msg;
      msg.className = 'v08-msg is-on' + (st.done ? ' is-ok' : '');
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    hiIn.addEventListener('input', function () {
      var v = num(hiIn.value);
      if (isNaN(v)) return;
      hi = v; steps = loopSteps(MESS, lo, hi); s = 0; pl.stop(); paint();
    });
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Zwei Namen, eine Liste (Aliasing)
     ══════════════════════════════════════════════════════════ */
  function initAlias(host) {
    var variant = 0, s = 0, BASE = [20.5, 21.0, 19.8], NEWV = 22.4;
    var codeBox = el('ol', { class: 'v08-code', 'aria-label': 'Python-Code' });
    var msg = el('p', { class: 'v08-msg', role: 'status', 'aria-live': 'polite' });
    var svg = S('svg', { viewBox: '0 0 680 250', class: 'v08-alias', role: 'img', 'aria-label': 'Namen und Listen im Speicher' });
    var outBox = el('p', { class: 'v08-aliasout', role: 'status', 'aria-live': 'polite' });
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Zeile 2 wählen' });
    var bAlias = el('button', { type: 'button', 'aria-pressed': 'true', text: 'b = a' });
    var bCopy = el('button', { type: 'button', 'aria-pressed': 'false', text: 'b = a[:]' });
    seg.appendChild(bAlias); seg.appendChild(bCopy);
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { class: 'v08-lbl', text: 'Zeile 2 lautet:' }), seg])]));
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= 4; }, interval: 1500 });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v08-grid v08-grid--alias' }, [el('div', {}, [codeBox, outBox]), el('div', { class: 'v08-aliaswrap' }, [svg])]));

    function lines() { return ['a = [20.5, 21.0, 19.8]', variant ? 'b = a[:]' : 'b = a', 'b.append(22.4)', 'print(a)']; }
    function tag(name, x, y, show) {
      if (!show) return;
      var g = S('g', { class: 'v08-tag' });
      g.appendChild(S('rect', { x: x, y: y, width: 56, height: 36, rx: 18 }));
      g.appendChild(S('text', { x: x + 28, y: y + 24, 'text-anchor': 'middle' }, name));
      svg.appendChild(g);
    }
    function listObj(x, y, vals, title, hot) {
      svg.appendChild(S('text', { x: x, y: y - 8, class: 'v08-objt' }, title));
      vals.forEach(function (v, k) {
        var g = S('g', { class: 'v08-ocell' + (hot && k === vals.length - 1 ? ' is-new' : '') });
        g.appendChild(S('rect', { x: x + k * 78, y: y, width: 74, height: 44 }));
        g.appendChild(S('text', { x: x + k * 78 + 37, y: y + 27, 'text-anchor': 'middle' }, py(v)));
        g.appendChild(S('text', { x: x + k * 78 + 37, y: y + 60, 'text-anchor': 'middle', class: 'v08-oidx' }, String(k)));
        svg.appendChild(g);
      });
    }
    function arrow(x1, y1, x2, y2, isNew) {
      var cx = (x1 + x2) / 2, d = 'M' + x1 + ' ' + y1 + ' C' + cx + ' ' + y1 + ' ' + cx + ' ' + y2 + ' ' + (x2 - 9) + ' ' + y2;
      svg.appendChild(S('path', { d: d, class: 'v08-arrow' + (isNew && !reduced() ? ' is-new' : ''), fill: 'none', pathLength: '100' }));
      svg.appendChild(S('polygon', { points: x2 + ',' + y2 + ' ' + (x2 - 10) + ',' + (y2 - 5) + ' ' + (x2 - 10) + ',' + (y2 + 5), class: 'v08-arrowhead' }));
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var l1 = BASE.slice(), l2 = null;
      if (s >= 2 && variant) l2 = BASE.slice();
      if (s >= 3) { if (variant) l2.push(NEWV); else l1.push(NEWV); }
      tag('a', 20, 22, s >= 1); tag('b', 20, variant ? 160 : 110, s >= 2);
      if (s >= 1) listObj(250, 20, l1, 'Liste im Speicher (Objekt 1)', s === 3 && !variant);
      if (l2) listObj(250, 158, l2, 'neue Liste im Speicher (Objekt 2)', s === 3 && variant);
      if (s >= 1) arrow(76, 40, 246, 42, s === 1);
      if (s >= 2) { if (variant) arrow(76, 178, 246, 180, s === 2); else arrow(76, 128, 246, 56, s === 2); }
      Array.prototype.forEach.call(codeBox.children, function (li) { li.classList.remove('is-active'); });
      codeBox.textContent = '';
      lines().forEach(function (l, i) {
        var li = el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l })]);
        if (i + 1 === s) li.classList.add('is-active');
        else if (i + 1 < s) li.classList.add('is-past');
        codeBox.appendChild(li);
      });
      var m = [
        'Noch nichts ausgeführt. Drück „Nächster Schritt“ und beobachte die Pfeile: Sie zeigen, welcher Name auf welche Liste im Speicher zeigt.',
        'a = [20.5, 21.0, 19.8] legt eine Liste im Speicher an. Der Name a ist nur ein Schild mit einem Pfeil auf diese Liste.',
        variant ? 'b = a[:] schneidet alle Elemente aus a heraus und baut daraus eine neue Liste: ein Duplikat. Der Name b zeigt auf die neue Liste. Es gibt jetzt zwei Objekte.'
                : 'b = a kopiert nichts. Es hängt nur ein zweites Schild an dieselbe Liste: Zwei Namen, ein Objekt.',
        variant ? 'b.append(22.4) verändert die Liste, auf die b zeigt, also die Kopie. Die Liste von a bleibt, wie sie war.'
                : 'b.append(22.4) verändert die Liste, auf die b zeigt. Und das ist dieselbe Liste wie die von a: a ändert sich mit.',
        variant ? 'print(a) zeigt die unveränderte Liste. Mit a[:] sind a und b unabhängig.'
                : 'print(a) zeigt die 22.4, obwohl nur b verändert wurde. Das ist Aliasing: kein Fehler von Python, sondern die Regel „Namen zeigen auf Objekte“.'][s];
      msg.textContent = (s ? 'Schritt ' + s + ' von 4: ' : '') + m;
      msg.className = 'v08-msg is-on' + (s === 4 ? (variant ? ' is-ok' : ' is-bad') : '');
      outBox.textContent = '';
      if (s === 4) { outBox.appendChild(document.createTextNode('Ausgabe: ')); outBox.appendChild(code(py(l1))); outBox.className = 'v08-aliasout ' + (variant ? 'is-ok' : 'is-bad'); } else outBox.className = 'v08-aliasout';
      pl.count.textContent = s + ' / 4';
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= 4;
    }
    function next() { if (s < 4) { s++; draw(); } }
    function back() { if (s > 0) { s--; draw(); } }
    function reset() { s = 0; draw(); }
    function pick(v) { variant = v; bAlias.setAttribute('aria-pressed', v ? 'false' : 'true'); bCopy.setAttribute('aria-pressed', v ? 'true' : 'false'); pl.stop(); s = Math.min(s, 4); draw(); }
    bAlias.addEventListener('click', function () { pick(0); });
    bCopy.addEventListener('click', function () { pick(1); });
    draw();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Dictionary als Schlüssel-Wert-Tabelle
     ══════════════════════════════════════════════════════════ */
  function tup(v) { return '(' + v[0] + ', ' + py(v[1]) + ')'; }
  function initDict(host) {
    var START = [['W-100', [1, 2.4]], ['L-6205', [2, 0.13]], ['D-35', [2, 0.02]]];
    var rows = START.map(function (r) { return [r[0], r[1].slice()]; }), sel = -1, fresh = -1;
    var kIn = el('input', { type: 'text', value: 'L-6205', size: '9', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    var mIn = el('input', { type: 'text', inputmode: 'numeric', value: '2', size: '4', autocomplete: 'off' });
    var gIn = el('input', { type: 'text', inputmode: 'decimal', value: '0.13', size: '6', autocomplete: 'off' });
    var bGet = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nachschlagen' });
    var bIn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'in prüfen' });
    var bSet = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Eintragen' });
    var bRs = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var tok = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Schlüssel L-6205 einsetzen' });
    var typo = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Tippfehler L-6025 einsetzen' });
    var res = el('p', { class: 'v08-res', role: 'status', 'aria-live': 'polite' });
    var tbody = el('tbody');
    var table = el('table', { class: 'v08-tab' }, [
      el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Schlüssel (Teilenummer)' }), el('th', { scope: 'col', text: 'Wert (Menge, Gewicht je Stück in kg)' })])]), tbody]);
    var lenOut = el('p', { class: 'v08-len' });
    host.appendChild(el('div', { class: 'v08-dict' }, [
      el('p', { class: 'v08-name' }, [code('stueckliste'), ' als Tabelle: links der Schlüssel, rechts der Wert']),
      el('div', { class: 'pap-wrap' }, [table]), lenOut,
      el('div', { class: 'k-controls' }, [field('Schlüssel', kIn), field('Menge', mIn), field('Gewicht in kg', gIn)]),
      el('div', { class: 'k-presets' }, [bGet, bIn, bSet, bRs, tok, typo]),
      res]));

    function render() {
      tbody.textContent = '';
      rows.forEach(function (r, i) {
        var tr = el('tr', {}, [el('td', {}, [code("'" + r[0] + "'")]), el('td', {}, [code(tup(r[1]))])]);
        if (i === sel) tr.classList.add('is-sel');
        if (i === fresh) tr.classList.add('is-new');
        tbody.appendChild(tr);
      });
      lenOut.textContent = '';
      lenOut.appendChild(code('len(stueckliste)'));
      lenOut.appendChild(document.createTextNode(' ist ' + rows.length + '. Gesucht wird nach dem Schlüssel, nie nach der Position: Es gibt keinen Index 0.'));
    }
    function find(k) { for (var i = 0; i < rows.length; i++) if (rows[i][0] === k) return i; return -1; }
    function show(msg, cls) { setRes(res, msg, cls); }
    bGet.addEventListener('click', function () {
      var k = kIn.value, i = find(k); fresh = -1; sel = i; render();
      if (i < 0) show("stueckliste['" + k + "']  →  KeyError: '" + k + "'  (diesen Schlüssel gibt es nicht; Python rät nicht und gibt auch keine 0 zurück)", 'is-bad');
      else show("stueckliste['" + k + "']  →  " + tup(rows[i][1]) + '  (Menge ' + rows[i][1][0] + ', Gewicht ' + py(rows[i][1][1]) + ' kg)', 'is-ok');
    });
    bIn.addEventListener('click', function () {
      var k = kIn.value, i = find(k); fresh = -1; sel = i; render();
      show("'" + k + "' in stueckliste  →  " + (i >= 0 ? 'True' : 'False') + (i < 0 ? '  (so prüfst du vorher, ob der Schlüssel existiert, und vermeidest den KeyError)' : ''), i >= 0 ? 'is-ok' : 'is-bad');
    });
    bSet.addEventListener('click', function () {
      var k = kIn.value, m = mIn.value.trim(), g = num(gIn.value);
      if (k === '') { show('Der Schlüssel darf nicht leer sein.', 'is-bad'); return; }
      if (!/^\d+$/.test(m) || isNaN(g)) { show('Menge: ganze Zahl, Gewicht: Kommazahl mit Punkt (zum Beispiel 0.13).', 'is-bad'); return; }
      var i = find(k), val = [parseInt(m, 10), g];
      if (i >= 0) { rows[i][1] = val; show("stueckliste['" + k + "'] = " + tup(val) + '  →  der vorhandene Eintrag wurde geändert (die Tabelle hat weiter ' + rows.length + ' Zeilen)', 'is-ok'); sel = -1; fresh = i; }
      else { rows.push([k, val]); show("stueckliste['" + k + "'] = " + tup(val) + '  →  neuer Schlüssel: Der Eintrag wurde hinten eingefügt (jetzt ' + rows.length + ' Zeilen)', 'is-ok'); sel = -1; fresh = rows.length - 1; }
      render();
      if (!reduced()) setTimeout(function () { fresh = -1; render(); }, 1400);
    });
    bRs.addEventListener('click', function () { rows = START.map(function (r) { return [r[0], r[1].slice()]; }); sel = -1; fresh = -1; render(); show('Die Tabelle hat wieder die drei Startzeilen.', 'is-ok'); });
    tok.addEventListener('click', function () { kIn.value = 'L-6205'; kIn.focus(); });
    typo.addEventListener('click', function () { kIn.value = 'L-6025'; kIn.focus(); });
    render();
  }

  /* ── (E) Selbstcheck-Haken für Papieraufgaben ─────────────── */
  function initCheck(host) {
    var cb = host.querySelector('input[type="checkbox"]'), task = host.closest('[data-a]');
    var A = root.KursAufgaben, lesson = document.body.getAttribute('data-lesson') || 'V08';
    if (!cb || !task) return;
    var sv = A ? A.store.solved(lesson) : {};
    if (sv[task.getAttribute('data-id')]) cb.checked = true;
    cb.addEventListener('change', function () {
      if (!cb.checked || !A) return;
      A.store.setSolved(lesson, task.getAttribute('data-id'));
      task.classList.add('is-solved');
      A.update();
    });
  }

  function init() {
    var map = { liste: initListe, listenschleife: initSchleife, alias: initAlias, dict: initDict, check: initCheck };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
