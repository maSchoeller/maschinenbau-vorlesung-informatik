/* =============================================================
   explorables-v06.js – interaktive Bausteine für V06 (reines JS, kein Framework)
   (A) Abkühlkurve live: eine while-Schleife läuft als Programmablaufplan Schritt für Schritt (Marke auf der
       Ablauflinie, aktive Symbole rot; Zähler, Temperatur, Bedingung), Parameter k und Ziel veränderbar; Ziel = Umgebung zeigt die Endlosschleife
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

  /* ── Programmablaufplan (DIN 66001) als SVG-Text ───────────────
     Eine Funktion zeichnet die PAPs der Lerneinheit (statisch, per Node erzeugt und eingefügt)
     und den PAP im Explorable (zur Laufzeit, mit Marke und roten aktiven Elementen).
     Knoten: oval (Grenzstelle), rect (Operation), para (Ein-/Ausgabe), dia (Verzweigung/Raute).
     Kanten: Linienzug mit Pfeilspitze am letzten Punkt. Farben und Strichstärken stehen in v06.css. */
  var PAPW = 420, PAPCX = 200;
  function xesc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function papNode(n) {
    var cx = PAPCX, x = cx - n.w / 2, y = n.y, w = n.w, h = n.h, shape;
    if (n.t === 'oval') shape = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + h / 2 + '"/>';
    else if (n.t === 'rect') shape = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>';
    else if (n.t === 'para') { var sk = 14; shape = '<polygon points="' + [x + sk, y, x + w, y, x + w - sk, y + h, x, y + h].join(' ') + '"/>'; }
    else shape = '<polygon points="' + [cx, y, cx + w / 2, y + h / 2, cx, y + h, cx - w / 2, y + h / 2].join(' ') + '"/>';
    var lines = n.lines, lh = 16, y0 = y + h / 2 - (lines.length - 1) * lh / 2 + 4.5;
    var txt = '<text x="' + cx + '" y="' + y0 + '" text-anchor="middle">' + lines.map(function (l, i) { return '<tspan x="' + cx + '" dy="' + (i ? lh : 0) + '">' + xesc(l) + '</tspan>'; }).join('') + '</text>';
    return '<g class="pap-n" data-n="' + n.id + '">' + shape + txt + '</g>';
  }
  function papEdge(e) {
    var p = e.pts, a = p[p.length - 2], b = p[p.length - 1];
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy); dx /= d; dy /= d;
    var bx = b[0] - 9 * dx, by = b[1] - 9 * dy, qx = -dy * 4.5, qy = dx * 4.5;
    var head = [b[0], b[1], bx + qx, by + qy, bx - qx, by - qy].map(function (v) { return Math.round(v * 10) / 10; }).join(' ');
    var out = '<g class="pap-e" data-e="' + e.id + '"><polyline points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/><polygon points="' + head + '"/></g>';
    if (e.label) out += '<text class="pap-lbl" x="' + e.label[1] + '" y="' + e.label[2] + '">' + xesc(e.label[0]) + '</text>';
    return out;
  }
  function papSvg(spec) {
    return '<svg class="pap" viewBox="0 0 ' + PAPW + ' ' + spec.h + '" role="img" aria-label="' + xesc(spec.aria) + '" focusable="false">' +
      spec.edges.map(papEdge).join('') + spec.nodes.map(papNode).join('') + '</svg>';
  }
  /* Kopfgesteuerte Schleife (Abkühlung). v = { aria, init: [2 Zeilen], cond, rechne: [2 Zeilen] } */
  function papKopf(v) {
    return { h: 534, aria: v.aria, nodes: [
      { id: 'start', t: 'oval', y: 8, h: 32, w: 100, lines: ['Start'] },
      { id: 'init', t: 'rect', y: 62, h: 46, w: 272, lines: v.init },
      { id: 'dia', t: 'dia', y: 144, h: 84, w: 232, lines: [v.cond] },
      { id: 'op1', t: 'rect', y: 258, h: 46, w: 272, lines: v.rechne },
      { id: 'op2', t: 'rect', y: 326, h: 32, w: 200, lines: ['minuten = minuten + 1'] },
      { id: 'out', t: 'para', y: 436, h: 36, w: 272, lines: ['Ausgabe: minuten, temperatur'] },
      { id: 'ende', t: 'oval', y: 494, h: 32, w: 100, lines: ['Ende'] }
    ], edges: [
      { id: 'start', pts: [[200, 40], [200, 62]] },
      { id: 'init', pts: [[200, 108], [200, 144]] },
      { id: 'ja', pts: [[200, 228], [200, 258]], label: ['ja', 208, 247] },
      { id: 'e12', pts: [[200, 304], [200, 326]] },
      { id: 'loop', pts: [[200, 358], [200, 376], [16, 376], [16, 126], [200, 126]] },
      { id: 'nein', pts: [[316, 186], [392, 186], [392, 414], [200, 414], [200, 436]], label: ['nein', 324, 178] },
      { id: 'eout', pts: [[200, 472], [200, 494]] }
    ] };
  }
  var PAPK = { dC: 186, op1C: 281, mid: 315, op2C: 342, outC: 454, endC: 489 };
  /* Fußgesteuerte Schleife: erst Rumpf (Eingabe), dann die Raute, bei „nein“ zurück vor den Rumpf */
  function papFuss() {
    return { h: 404, aria: 'Programmablaufplan fußgesteuerte Schleife: Start; Ausgabe Messwert eingeben; Eingabe wert einlesen; Verzweigung wert größer null; bei nein zurück vor das Einlesen, bei ja weiterrechnen mit wert; Ende', nodes: [
      { id: 'start', t: 'oval', y: 8, h: 32, w: 100, lines: ['Start'] },
      { id: 'a', t: 'para', y: 62, h: 36, w: 272, lines: ['Ausgabe: Messwert eingeben'] },
      { id: 'b', t: 'para', y: 140, h: 36, w: 200, lines: ['wert einlesen'] },
      { id: 'dia', t: 'dia', y: 198, h: 80, w: 232, lines: ['wert > 0?'] },
      { id: 'c', t: 'rect', y: 308, h: 36, w: 240, lines: ['weiterrechnen mit wert'] },
      { id: 'ende', t: 'oval', y: 364, h: 32, w: 100, lines: ['Ende'] }
    ], edges: [
      { id: 's1', pts: [[200, 40], [200, 62]] },
      { id: 's2', pts: [[200, 98], [200, 140]] },
      { id: 's3', pts: [[200, 176], [200, 198]] },
      { id: 'ja', pts: [[200, 278], [200, 308]], label: ['ja', 208, 298] },
      { id: 's4', pts: [[200, 344], [200, 364]] },
      { id: 'nein', pts: [[316, 238], [392, 238], [392, 120], [200, 120]], label: ['nein', 324, 230] }
    ] };
  }
  /* Zählschleife: Initialisierung, Raute (Zähler ≤ Ende?), Rumpf, Zähler erhöhen, Rückführung */
  function papZaehl() {
    return { h: 530, aria: 'Programmablaufplan Zählschleife: Start; summe gleich null und minute gleich eins setzen; Verzweigung minute kleiner gleich fünf; bei ja temperatur neu berechnen, zur summe addieren, minute um eins erhöhen und zurück vor die Verzweigung; bei nein Ausgabe summe geteilt durch fünf; Ende', nodes: [
      { id: 'start', t: 'oval', y: 8, h: 32, w: 100, lines: ['Start'] },
      { id: 'init', t: 'rect', y: 62, h: 32, w: 240, lines: ['summe = 0; minute = 1'] },
      { id: 'dia', t: 'dia', y: 134, h: 80, w: 232, lines: ['minute ≤ 5?'] },
      { id: 'op1', t: 'rect', y: 242, h: 32, w: 240, lines: ['temperatur neu berechnen'] },
      { id: 'op2', t: 'rect', y: 292, h: 32, w: 272, lines: ['summe = summe + temperatur'] },
      { id: 'op3', t: 'rect', y: 342, h: 32, w: 220, lines: ['minute = minute + 1'] },
      { id: 'out', t: 'para', y: 436, h: 36, w: 240, lines: ['Ausgabe: summe / 5'] },
      { id: 'ende', t: 'oval', y: 490, h: 32, w: 100, lines: ['Ende'] }
    ], edges: [
      { id: 's1', pts: [[200, 40], [200, 62]] },
      { id: 's2', pts: [[200, 94], [200, 134]] },
      { id: 'ja', pts: [[200, 214], [200, 242]], label: ['ja', 208, 233] },
      { id: 'e12', pts: [[200, 274], [200, 292]] },
      { id: 'e23', pts: [[200, 324], [200, 342]] },
      { id: 'loop', pts: [[200, 374], [200, 392], [16, 392], [16, 116], [200, 116]] },
      { id: 'nein', pts: [[316, 174], [392, 174], [392, 414], [200, 414], [200, 436]], label: ['nein', 324, 166] },
      { id: 'eout', pts: [[200, 472], [200, 490]] }
    ] };
  }
  var PAPKOPF_STATIC = papKopf({ aria: 'Programmablaufplan kopfgesteuerte Schleife: Start; temperatur, umgebung und minuten vorbelegen; Verzweigung temperatur größer ziel; bei ja temperatur neu berechnen, minuten um eins erhöhen und zurück vor die Verzweigung; bei nein Ausgabe minuten und temperatur; Ende',
    init: ['temperatur = 850.0; minuten = 0', 'umgebung = 20.0'], cond: 'temperatur > ziel?', rechne: ['temperatur = temperatur −', 'k · (temperatur − umgebung)'] });


  var api = { papSvg: papSvg, papKopf: papKopf, papFuss: papFuss, papZaehl: papZaehl, papStaticKopf: PAPKOPF_STATIC, coolingSeries: coolingSeries, newtonSeries: newtonSeries, py: py, niceMax: niceMax };
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
    var papHost = el('div', { class: 'v06-pap' });
    var marker = null, anim = 0, mpos = [200, PAPK.dC];
    var verdict = el('p', { class: 'v06-verdict', 'aria-hidden': 'true' });
    var left = el('div', { class: 'v06-left' }, [papHost, verdict]);
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
      function (auto) { if (s < total - 1) s++; draw(!auto, auto); },
      function () { s = 0; draw(true); },
      function () { s = total - 1; draw(true); },
      function () { return s >= total - 1; },
      function () { return Math.max(15, Math.min(260, Math.round(6000 / total))); });

    var lastS = 0, lastAuto = false;
    function buildPap() {
      var spec = api.papKopf({
        aria: 'Programmablaufplan der Schleife',
        init: ['temperatur = ' + py(T0) + '; minuten = 0', 'umgebung = ' + py(TU)],
        cond: 'temperatur > ' + py(ziel) + '?',
        rechne: ['temperatur = temperatur −', de(k, 2) + ' · (temperatur − umgebung)']
      });
      papHost.innerHTML = api.papSvg(spec);
      var svgEl = papHost.firstChild;
      marker = S('circle', { r: 8, class: 'pap-marker', cx: mpos[0], cy: mpos[1] });
      svgEl.appendChild(marker);
      lastS = 0;
    }
    function setActive(nodes, edges) {
      Array.prototype.forEach.call(papHost.querySelectorAll('.pap-n'), function (g) { g.classList.toggle('is-cur', nodes.indexOf(g.getAttribute('data-n')) >= 0); });
      Array.prototype.forEach.call(papHost.querySelectorAll('.pap-e'), function (g) { g.classList.toggle('is-cur', edges.indexOf(g.getAttribute('data-e')) >= 0); });
    }
    /* Marke: entlang der Ablauflinie laufen (route) oder direkt springen */
    function moveMarker(target, route, auto) {
      var myAnim = ++anim;
      function put(p) { mpos = p; marker.setAttribute('cx', p[0]); marker.setAttribute('cy', p[1]); }
      var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var interval = auto ? Math.max(15, Math.min(260, Math.round(6000 / total))) : 0;
      if (!route || reduce || (auto && interval < 70)) { put(target); return; }
      var lens = [0], tot = 0, i;
      for (i = 1; i < route.length; i++) { tot += Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); lens.push(tot); }
      var dur = auto ? Math.min(interval * 0.85, 600) : Math.min(1100, 250 + tot * 2.2), t0 = null;
      put(route[0]);
      function frame(ts) {
        if (myAnim !== anim) return;
        if (t0 === null) t0 = ts;
        var f = Math.min(1, (ts - t0) / dur), d = f * tot, j = 1;
        while (j < lens.length - 1 && lens[j] < d) j++;
        var seg = lens[j] - lens[j - 1] || 1, u = (d - lens[j - 1]) / seg;
        put([route[j - 1][0] + (route[j][0] - route[j - 1][0]) * u, route[j - 1][1] + (route[j][1] - route[j - 1][1]) * u]);
        if (f < 1) requestAnimationFrame(frame); else put(target);
      }
      requestAnimationFrame(frame);
    }

    function recompute() {
      pl.stop();
      ser = api.coolingSeries(T0, TU, k, ziel, MAXN);
      total = 2 * ser.n + 1;
      s = 0;
      buildPap();
      draw(true);
    }

    function draw(announce, auto) {
      lastAuto = !!auto;
      var c = Math.ceil(s / 2), phase = s % 2 === 0 ? 'check' : 'body', t = ser.temps[c];
      var last = s === total - 1;
      var cond = t > ziel;
      var prev = lastS; lastS = s;
      var reachedEnd = last && ser.reached;
      var nodes = [], edges = [], target, route = null;
      if (phase === 'check') {
        nodes = ['dia']; target = [200, PAPK.dC];
        edges = c === 0 ? ['start', 'init'] : ['loop'];
        if (reachedEnd) { nodes = ['dia', 'out', 'ende']; edges = ['nein', 'eout']; target = [200, PAPK.endC]; }
        if (prev === s - 1 && s > 0) {
          route = reachedEnd
            ? [[200, PAPK.op2C], [200, 358], [200, 376], [16, 376], [16, 126], [200, 126], [200, PAPK.dC], [316, PAPK.dC], [392, PAPK.dC], [392, 414], [200, 414], [200, PAPK.outC], [200, PAPK.endC]]
            : [[200, PAPK.mid], [200, PAPK.op2C], [200, 358], [200, 376], [16, 376], [16, 126], [200, 126], [200, PAPK.dC]];
        }
      } else {
        nodes = ['op1', 'op2']; edges = ['ja', 'e12']; target = [200, PAPK.mid];
        if (prev === s - 1) route = [[200, PAPK.dC], [200, PAPK.op1C], [200, PAPK.mid]];
      }
      setActive(nodes, edges);
      moveMarker(target, route, lastAuto);
      papHost.firstChild.setAttribute('aria-label', 'Programmablaufplan der Schleife. ' + (phase === 'check' ? 'Aktiv: die Raute, die Bedingung temperatur größer ziel wird geprüft.' : 'Aktiv: der Schleifenrumpf mit der Berechnung der Temperatur und dem Zähler.') + (last ? (ser.reached ? ' Die Schleife ist verlassen, die Ausgabe ist erreicht.' : ' Watchdog: Die Raute antwortet immer ja.') : ''));
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
