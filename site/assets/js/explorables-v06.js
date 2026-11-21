/* =============================================================
   explorables-v06.js – interaktive Bausteine für V06 (reines JS, kein Framework)
   (A) Abkühlkurve live: eine while-Schleife läuft Schritt für Schritt (Zähler, Temperatur,
       Bedingung), Parameter k und Ziel veränderbar; Ziel = Umgebung zeigt die Endlosschleife
       und den Watchdog.
   (B) Newton-Treppe: Tangenten-Schritte zur Wurzel, Anzahl Iterationen bis zur Toleranz.
   Der Rechenkern ist ohne DOM per node testbar (siehe module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern ────────────────────────────────────────────────── */
  /* Abkühlung wie im Code: while temperatur > ziel: temperatur = temperatur - k * (temperatur - umgebung) */
  function coolingSeries(t0, tu, k, ziel, maxN) {
    var temps = [t0], t = t0, n = 0;
    while (t > ziel && n < maxN) { t = t - k * (t - tu); n++; temps.push(t); }
    var reached = !(t > ziel);
    return { temps: temps, n: n, reached: reached, watchdog: !reached };
  }
  /* Newton für f(x) = x² − a. Abbruch, sobald |x² − a| <= tol (oder nach maxN Schritten). */
  function newtonSeries(a, x0, tol, maxN) {
    var xs = [x0], x = x0, n = 0;
    while (Math.abs(x * x - a) > tol && n < maxN) { x = (x + a / x) / 2; n++; xs.push(x); }
    return { xs: xs, n: n, converged: Math.abs(x * x - a) <= tol };
  }
  /* Zahl so schreiben, wie Python sie druckt (Punkt, e-Schreibweise mit zweistelligem Exponenten) */
  function py(x) {
    if (x === 0) return '0.0';
    var ax = Math.abs(x), s;
    if (ax < 1e-4 || ax >= 1e16) { s = x.toExponential().replace(/e([+-])(\d)$/, 'e$10$2'); return s; }
    s = String(x);
    return /^-?\d+$/.test(s) ? s + '.0' : s;
  }
  function de(x, d) { return x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−'); }
  function niceMax(n) {
    var c = [10, 20, 30, 40, 50, 60, 80, 100, 150, 200, 300];
    for (var i = 0; i < c.length; i++) if (n <= c[i]) return c[i];
    return Math.ceil(n / 100) * 100;
  }

  var api = { coolingSeries: coolingSeries, newtonSeries: newtonSeries, py: py, niceMax: niceMax };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ──────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var svgNS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, text) { var n = document.createElementNS(svgNS, tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text) n.textContent = text; return n; }
  var uid = 0;
  function slider(host, label, min, max, step, value, fmt, onInput) {
    var id = 'v06r' + (++uid);
    var inp = el('input', { type: 'range', id: id, min: String(min), max: String(max), step: String(step), value: String(value) });
    var out = el('output', { 'for': id, text: fmt(value) });
    var field = el('div', { class: 'k-field' }, [el('label', { 'for': id }, [label + ' ', out]), inp]);
    inp.addEventListener('input', function () { var v = parseFloat(inp.value); out.textContent = fmt(v); onInput(v); });
    host.appendChild(field);
    return inp;
  }
  function segment(labels, label, activeIdx, onPick) {
    var btns = labels.map(function (t, i) { return el('button', { type: 'button', 'aria-pressed': i === activeIdx ? 'true' : 'false', text: t }); });
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': label }, btns);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        onPick(i);
      });
    });
    return seg;
  }
  function player(host, onStep, onReset, onEnd, isDone, getIntervalMs) {
    /* Knopfleiste: Schritt · Abspielen/Pause · Zum Ende · Zurücksetzen */
    var bStep = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen' });
    var bEnd = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zum Ende' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var bar = el('div', { class: 'k-presets v06-bar', role: 'group', 'aria-label': 'Ablauf steuern' }, [bStep, bPlay, bEnd, bReset]);
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    function play() {
      if (isDone()) onReset();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { onStep(true); if (isDone()) stop(); }, getIntervalMs());
    }
    bStep.addEventListener('click', function () { stop(); onStep(false); });
    bPlay.addEventListener('click', function () { if (timer) stop(); else play(); });
    bEnd.addEventListener('click', function () { stop(); onEnd(); });
    bReset.addEventListener('click', function () { stop(); onReset(); });
    host.appendChild(bar);
    return { stop: stop };
  }
  /* Auf schmalen Bildschirmen wird das SVG verkleinert dargestellt: Schrift dann größer setzen */
  function FS(n) { return (typeof window !== 'undefined' && window.innerWidth < 560) ? Math.round(n * 1.55) : n; }
  function axisText(svg, x, y, txt, anchor, size, fill) { svg.appendChild(S('text', { x: x, y: y, 'text-anchor': anchor || 'start', 'font-size': FS(size || 11), fill: fill || '#4B5563' }, txt)); }

  /* ── (A) Abkühlkurve live ────────────────────────────────── */
  function initCooling(host) {
    var T0 = 850, TU = 20, MAXN = 300;
    var k = 0.08, ziel = 60;
    var s = 0, ser, total, pl;

    var ctr = el('div', { class: 'k-controls' });
    host.appendChild(ctr);
    slider(ctr, 'Abkühlkonstante k =', 0.02, 0.2, 0.01, k, function (v) { return de(v, 2) + ' je Minute'; }, function (v) { k = v; recompute(); });
    slider(ctr, 'Ziel =', 20, 300, 1, ziel, function (v) { return de(v, 0) + ' °C'; }, function (v) { ziel = v; recompute(); });

    var barHost = el('div');
    host.appendChild(barHost);
    var grid = el('div', { class: 'v06-grid' });
    var nsd = el('div', { class: 'nsd v06-nsd', role: 'group', 'aria-label': 'Ablauf der Schleife als Struktogramm' });
    var rowInit = el('div', { class: 'nsd__row' });
    var head = el('div', { class: 'nsd__head' });
    var b1 = el('div', { class: 'nsd__row' });
    var b2 = el('div', { class: 'nsd__row' });
    var rowOut = el('div', { class: 'nsd__row' });
    var body = el('div', { class: 'nsd__body' }, [b1, b2]);
    nsd.appendChild(rowInit);
    nsd.appendChild(el('div', { class: 'nsd__loop' }, [head, body]));
    nsd.appendChild(rowOut);
    var verdict = el('p', { class: 'v06-verdict', 'aria-hidden': 'true' });
    var left = el('div', { class: 'v06-left' }, [nsd, verdict]);
    var svg = S('svg', { viewBox: '0 0 640 310', class: 'k-chart', role: 'img' });
    grid.appendChild(left); grid.appendChild(el('div', { class: 'v06-right' }, [svg]));
    host.appendChild(grid);

    var msg = el('p', { class: 'v06-msg', role: 'status', 'aria-live': 'polite' });
    var out = el('div', { class: 'k-readout' });
    host.insertBefore(msg, grid);
    host.appendChild(el('div', { class: 'k-legend' }, [
      el('span', {}, [Object.assign(el('i'), { style: 'background:#B50016' }), 'bisherige Durchläufe']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#C9CDD3' }), 'noch nicht berechnet']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#164B8C' }), 'Ziel'])
    ]));
    host.appendChild(out);

    pl = player(barHost,
      function (auto) { if (s < total - 1) s++; draw(!auto); },
      function () { s = 0; draw(true); },
      function () { s = total - 1; draw(true); },
      function () { return s >= total - 1; },
      function () { return Math.max(15, Math.min(260, Math.round(6000 / total))); });

    function recompute() {
      pl.stop();
      ser = api.coolingSeries(T0, TU, k, ziel, MAXN);
      total = 2 * ser.n + 1;
      s = 0;
      draw(true);
    }

    function draw(announce) {
      var c = Math.ceil(s / 2), phase = s % 2 === 0 ? 'check' : 'body', t = ser.temps[c];
      var last = s === total - 1;
      var cond = t > ziel;
      rowInit.textContent = 'temperatur = ' + py(T0) + ';  umgebung = ' + py(TU) + ';  minuten = 0';
      head.textContent = 'solange temperatur > ziel   (ziel = ' + py(ziel) + ')';
      b1.textContent = 'temperatur = temperatur − ' + de(k, 2) + ' · (temperatur − umgebung)';
      b2.textContent = 'minuten = minuten + 1';
      rowOut.textContent = 'Ausgabe: minuten und temperatur';
      head.className = 'nsd__head' + (phase === 'check' ? ' is-cur' : '');
      b1.className = 'nsd__row' + (phase === 'body' ? ' is-cur' : '');
      b2.className = 'nsd__row' + (phase === 'body' ? ' is-cur' : '');
      rowOut.className = 'nsd__row' + (last && ser.reached ? ' is-cur' : '');
      var vtxt;
      if (phase === 'check') vtxt = 'Bedingung prüfen: ' + t.toFixed(1) + ' > ' + py(ziel) + ' ist ' + (cond ? 'wahr' : 'falsch') + (last ? (ser.reached ? '  →  Schleife endet' : '  →  Watchdog greift') : '  →  Rumpf läuft');
      else vtxt = 'Rumpf ausgeführt: Durchlauf ' + c + ' ist fertig';
      verdict.textContent = vtxt;
      verdict.className = 'v06-verdict' + (phase === 'check' ? (last ? (ser.reached ? ' is-end' : ' is-bad') : ' is-go') : '');

      if (last) {
        msg.className = 'v06-msg is-on' + (ser.reached ? ' is-ok' : ' is-bad');
        msg.textContent = ser.reached
          ? 'Fertig: Nach ' + c + ' Minuten sind es ' + de(t, 1) + ' °C und damit nicht mehr über ' + de(ziel, 0) + ' °C. Die Bedingung ist falsch geworden, die Schleife endet. Der Zähler minuten steht auf ' + c + '.'
          : 'Endlosschleife: Das Teil kühlt immer langsamer und erreicht ' + de(TU, 0) + ' °C nie ganz. Die Bedingung temperatur > ziel bleibt wahr. Hier greift der Watchdog nach ' + MAXN + ' Durchläufen ein und bricht ab. In einer Steuerung würde er die Anlage in einen sicheren Zustand fahren.';
      } else if (announce) {
        msg.className = 'v06-msg';
        msg.textContent = phase === 'check' ? 'Schritt ' + (s + 1) + ' von ' + total + ': die Bedingung wird geprüft.' : 'Schritt ' + (s + 1) + ' von ' + total + ': der Schleifenrumpf rechnet einen Durchlauf.';
      } else { msg.className = 'v06-msg'; msg.textContent = ''; }

      // Diagramm
      var W = 640, H = 310, L = 58, R = 16, T = 14, B = 42, pw = W - L - R, ph = H - T - B;
      var xmax = niceMax(Math.max(ser.n, 10)), ymax = 900;
      var X = function (v) { return L + pw * v / xmax; };
      var Y = function (v) { return T + ph * (1 - v / ymax); };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      [0, 200, 400, 600, 800].forEach(function (v) {
        svg.appendChild(S('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: v === 0 ? '#6B7280' : '#E5E7EB' }));
        axisText(svg, L - 6, Y(v) + 4, String(v), 'end');
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
        axisText(svg, L + pw * f, H - B + 16, String(Math.round(xmax * f)), f === 0 ? 'start' : (f === 1 ? 'end' : 'middle'));
      });
      svg.appendChild(S('line', { x1: L, x2: L, y1: T, y2: H - B, stroke: '#6B7280' }));
      axisText(svg, L + pw / 2, H - 4, 'Minuten (Zähler minuten)', 'middle', 12, '#1A1A1A');
      svg.appendChild(S('text', { x: 14, y: T + ph / 2, 'text-anchor': 'middle', 'font-size': FS(12), fill: '#1A1A1A', transform: 'rotate(-90 14 ' + (T + ph / 2) + ')' }, 'Temperatur in °C'));
      // Umgebung und Ziel
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: Y(TU), y2: Y(TU), stroke: '#9CA3AF', 'stroke-dasharray': '2 3' }));
      axisText(svg, L + 6, Y(TU) + 15, 'Umgebung ' + TU + ' °C', 'start', 11, '#4B5563');
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: Y(ziel), y2: Y(ziel), stroke: '#164B8C', 'stroke-width': 1.75, 'stroke-dasharray': '6 4' }));
      axisText(svg, W - R - 4, Y(ziel) - 6, 'Ziel ' + de(ziel, 0) + ' °C', 'end', 11, '#164B8C');
      // Geisterkurve (komplett) und bisheriger Weg
      var ghost = ser.temps.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
      svg.appendChild(S('polyline', { points: ghost, fill: 'none', stroke: '#C9CDD3', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
      var done = ser.temps.slice(0, c + 1).map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
      svg.appendChild(S('polyline', { points: done, fill: 'none', stroke: '#B50016', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
      if (ser.n <= 60) for (var i = 0; i < c; i++) svg.appendChild(S('circle', { cx: X(i), cy: Y(ser.temps[i]), r: 3, fill: '#B50016' }));
      svg.appendChild(S('circle', { cx: X(c), cy: Y(t), r: 6, fill: phase === 'body' ? '#B50016' : '#fff', stroke: '#B50016', 'stroke-width': 2.5 }));
      svg.setAttribute('aria-label', 'Diagramm: Temperatur über den Minuten, k = ' + de(k, 2) + ', Ziel ' + de(ziel, 0) + ' °C. Aktuell Durchlauf ' + c + ', Temperatur ' + de(t, 1) + ' °C.' + (last ? (ser.reached ? ' Ziel erreicht.' : ' Ziel nie erreicht, Watchdog bricht ab.') : ''));

      var dl = el('dl');
      function r(key, val, big) { dl.appendChild(el('dt', { text: key })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: val })); }
      r('Zähler minuten', String(c), true);
      r('Temperatur', t.toFixed(1) + ' °C', true);
      r('Bedingung temperatur > ziel', phase === 'check' ? (cond ? 'wahr: weiter' : 'falsch: Ende') : '(wurde vor diesem Durchlauf geprüft)');
      r('Halbierung des Abstands', 'etwa alle ' + Math.max(1, Math.round(Math.log(0.5) / Math.log(1 - k))) + ' Minuten');
      out.innerHTML = ''; out.appendChild(dl);
    }
    recompute();
  }

  /* ── (B) Newton-Treppe ───────────────────────────────────── */
  function initNewton(host) {
    var a = 2, x0 = 4, tol = 1e-9, MAXN = 40;
    var s = 0, ser, pl;
    var ctr = el('div', { class: 'k-controls' });
    host.appendChild(ctr);
    slider(ctr, 'Gesucht: Wurzel aus a, a =', 2, 50, 1, a, function (v) { return String(v); }, function (v) { a = v; recompute(); });
    slider(ctr, 'Startwert x₀ =', 1, 10, 0.5, x0, function (v) { return de(v, 1); }, function (v) { x0 = v; recompute(); });
    var tols = [[1e-1, '0.1'], [1e-3, '0.001'], [1e-6, '1e-06'], [1e-9, '1e-09']];
    ctr.appendChild(el('div', { class: 'k-field' }, [el('span', { text: 'Toleranz (Abbruch bei |x² − a| ≤ Toleranz)' }),
      segment(tols.map(function (t) { return t[1]; }), 'Toleranz', 3, function (i) { tol = tols[i][0]; recompute(); })]));

    var barHost = el('div');
    host.appendChild(barHost);
    var msg = el('p', { class: 'v06-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var svg = S('svg', { viewBox: '0 0 640 320', class: 'k-chart', role: 'img' });
    host.appendChild(svg);
    host.appendChild(el('div', { class: 'k-legend' }, [
      el('span', {}, [Object.assign(el('i'), { style: 'background:#6B7280' }), 'Kurve f(x) = x² − a']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#B50016' }), 'Tangente und neue Schätzung']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#164B8C' }), 'Nullstelle (gesuchte Wurzel)'])
    ]));
    var tw = el('div', { class: 'k-tablewrap' });
    host.appendChild(tw);
    var tip = el('p', { class: 'k-small k-muted', text: 'Tipp: Setz die Toleranz auf 1e-09 und schau in die Spalte „Abweichung“: Die Zahl der richtigen Stellen verdoppelt sich ungefähr in jedem Schritt.' });
    host.appendChild(tip);

    pl = player(barHost,
      function (auto) { if (s < ser.n) s++; draw(!auto); },
      function () { s = 0; draw(true); },
      function () { s = ser.n; draw(true); },
      function () { return s >= ser.n; },
      function () { return 650; });

    function recompute() { pl.stop(); ser = api.newtonSeries(a, x0, tol, MAXN); s = 0; draw(true); }

    function draw(announce) {
      var root2 = Math.sqrt(a), xs = ser.xs;
      var xmax = Math.max(x0, root2) * 1.12;
      var f = function (x) { return x * x - a; };
      var ymin = -a * 1.15, ymax = Math.max(f(xmax), 1) * 1.05;
      var W = 640, H = 320, L = 52, R = 16, T = 12, B = 38, pw = W - L - R, ph = H - T - B;
      var X = function (x) { return L + pw * x / xmax; };
      var Y = function (y) { return T + ph * (1 - (y - ymin) / (ymax - ymin)); };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: '#6B7280' }));
      svg.appendChild(S('line', { x1: X(0), x2: X(0), y1: T, y2: H - B, stroke: '#E5E7EB' }));
      [0, 0.25, 0.5, 0.75, 1].forEach(function (fr) { axisText(svg, L + pw * fr, Y(0) + (ymin < -ymax * 0.05 ? 16 : 16), de(xmax * fr, 1), fr === 0 ? 'start' : (fr === 1 ? 'end' : 'middle')); });
      axisText(svg, L + pw / 2, H - 4, 'x', 'middle', 12, '#1A1A1A');
      axisText(svg, L - 6, Y(0) + 4, '0', 'end');
      axisText(svg, L - 6, Y(ymax * 0.95) + 4, de(ymax * 0.95, 0), 'end');
      axisText(svg, L - 6, Y(ymin * 0.95) + 4, de(ymin * 0.95, 0), 'end');
      var pts = [];
      for (var i = 0; i <= 120; i++) { var x = xmax * i / 120; pts.push(X(x).toFixed(1) + ',' + Y(f(x)).toFixed(1)); }
      svg.appendChild(S('polyline', { points: pts.join(' '), fill: 'none', stroke: '#6B7280', 'stroke-width': 2 }));
      svg.appendChild(S('circle', { cx: X(root2), cy: Y(0), r: 5, fill: '#164B8C', stroke: '#fff', 'stroke-width': 2 }));
      axisText(svg, X(root2), Y(0) - 10, '√' + a + ' ≈ ' + de(root2, 4), 'middle', 11, '#164B8C');
      for (var j = 0; j < s; j++) {
        var cur = j === s - 1, col = '#B50016', xa = xs[j], xb = xs[j + 1];
        svg.appendChild(S('line', { x1: X(xa), y1: Y(0), x2: X(xa), y2: Y(f(xa)), stroke: col, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: cur ? 1 : 0.55 }));
        svg.appendChild(S('line', { x1: X(xa), y1: Y(f(xa)), x2: X(xb), y2: Y(0), stroke: col, 'stroke-width': cur ? 2.5 : 1.5, opacity: cur ? 1 : 0.7 }));
        svg.appendChild(S('circle', { cx: X(xa), cy: Y(f(xa)), r: cur ? 4.5 : 3, fill: col }));
      }
      svg.appendChild(S('circle', { cx: X(xs[s]), cy: Y(0), r: 6, fill: '#fff', stroke: '#B50016', 'stroke-width': 2.5 }));
      axisText(svg, X(xs[s]), Y(0) + 30, 'x' + s, 'middle', 11, '#B50016');
      var fin = s === ser.n;
      svg.setAttribute('aria-label', 'Diagramm: Parabel f(x) = x² − ' + a + ' mit ' + s + ' Tangenten-Schritten. Aktuelle Schätzung x = ' + py(xs[s]) + '.');

      var tab = el('table', { class: 'k-types v06-tab' });
      tab.appendChild(el('thead', {}, [el('tr', {}, ['Schritt n', 'Schätzung x', 'x² − a', 'Abweichung |x − √a|', '|x² − a| ≤ Toleranz?'].map(function (h) { return el('th', { scope: 'col', text: h }); }))]));
      var tb = el('tbody');
      for (var q = 0; q <= s; q++) {
        var res = f(xs[q]), ok = Math.abs(res) <= tol;
        var tr = el('tr', { class: q === s ? 'is-cur' : '' }, [
          el('th', { scope: 'row', text: String(q) }), el('td', { text: py(xs[q]) }), el('td', { text: py(res) }), el('td', { text: py(Math.abs(xs[q] - root2)) }),
          el('td', { text: ok ? 'ja: Abbruch' : 'nein: weiter' })]);
        tb.appendChild(tr);
      }
      tab.appendChild(tb);
      tw.innerHTML = ''; tw.appendChild(tab);

      if (fin) {
        msg.className = 'v06-msg is-on is-ok';
        msg.textContent = ser.n === 0
          ? 'Schon der Startwert genügt der Toleranz: 0 Iterationen.'
          : 'Fertig nach ' + ser.n + ' Iterationen: |x² − a| = ' + py(Math.abs(f(xs[s]))) + ' liegt unter der Toleranz. Die Schleife endet mit x = ' + py(xs[s]) + '.';
        if (!ser.converged) { msg.className = 'v06-msg is-on is-bad'; msg.textContent = 'Nach ' + MAXN + ' Schritten nicht konvergiert: Abbruch durch den Sicherheitszähler.'; }
      } else if (announce) {
        msg.className = 'v06-msg';
        msg.textContent = s === 0 ? 'Startwert x₀ = ' + py(xs[0]) + '. Noch nicht genau genug: Klick „Schritt“ für die erste Tangente.' : 'Schritt ' + s + ': neue Schätzung x = ' + py(xs[s]) + '. Noch nicht genau genug, weiter.';
      } else { msg.className = 'v06-msg'; msg.textContent = ''; }
    }
    recompute();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="abkuehlung"]'), initCooling);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="newton"]'), initNewton);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
