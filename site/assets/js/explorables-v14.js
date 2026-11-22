/* =============================================================
   explorables-v14.js – interaktive Bausteine für V14 „Visualisierung“ (reines JS, kein Framework)
   (A) Diagramme, die täuschen: dieselben Daten (Ausschussquote zweier Maschinen), Schalter für Achsenanfang,
       Einheit/Achsentitel und Seitenverhältnis; die Zeichnung entsteht live als SVG, daneben die Messzahlen.
   (B) Von der Liste zum Pixel: wie ein Diagramm-Programm Datenkoordinaten (t, v) in Bildpunkte umrechnet.
   (C) Welche Diagrammart wofür: sechs Fragen aus dem Maschinenbau, Antwort wählen, passendes Diagramm sehen.
   (D) Subplots: Raster wählen, Python-Zeile mit den Namen der Teilbilder sehen (Tupel-Entpacken).
   (E) PAP: Messdaten einlesen, Geschwindigkeit aufsummieren, plotten.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  var MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var QUOTE_A = [2.2, 2.1, 2.3, 2.2, 2.4, 2.2, 2.3, 2.1, 2.2, 2.3, 2.3, 2.4];
  var QUOTE_B = [2.4, 2.5, 2.3, 2.5, 2.6, 2.4, 2.5, 2.6, 2.4, 2.5, 2.7, 2.6];

  function mittel(a) { var t = 0; a.forEach(function (x) { t += x; }); return t / a.length; }
  /* Steigung der Ausgleichsgeraden y = m·i + c über den Index i (Einheit: y je Schritt) */
  function steigung(a) {
    var n = a.length, mx = (n - 1) / 2, my = mittel(a), zz = 0, nn = 0, i;
    for (i = 0; i < n; i++) { zz += (i - mx) * (a[i] - my); nn += (i - mx) * (i - mx); }
    return zz / nn;
  }
  /* Datenwert -> Pixel (Pixel-y zählt von oben nach unten) */
  function nachPixel(wert, min, max, pix0, pix1) { return pix0 + (wert - min) / (max - min) * (pix1 - pix0); }
  function fmt(x, st) {
    try { return Number(x).toLocaleString('de-DE', { minimumFractionDigits: st, maximumFractionDigits: st }); }
    catch (e) { return String(x); }
  }
  /* Wie hoch wirkt B im Verhältnis zu A, wenn die y-Achse bei ymin beginnt? */
  function wirkung(a, b, ymin) { return (mittel(b) - ymin) / (mittel(a) - ymin); }
  /* Winkel (Grad) der Ausgleichsgeraden im Bild: dx Pixel je Index, dy Pixel je Dateneinheit */
  function winkel(werte, pxProIndex, pxProEinheit) {
    return Math.atan(steigung(werte) * pxProEinheit / pxProIndex) * 180 / Math.PI;
  }
  var core = {
    MONATE: MONATE, QUOTE_A: QUOTE_A, QUOTE_B: QUOTE_B, mittel: mittel, steigung: steigung,
    nachPixel: nachPixel, wirkung: wirkung, winkel: winkel, fmt: fmt
  };

  /* ── DOM-Helfer ──────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  var uid = 0;
  function nextId(p) { uid++; return p + uid; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function checkbox(host, label, checked, onchange) {
    var id = nextId('v14-c-');
    var inp = el('input', { type: 'checkbox', id: id });
    inp.checked = !!checked;
    inp.addEventListener('change', function () { onchange(inp.checked); });
    host.appendChild(el('label', { class: 'v14-check', for: id }, [inp, el('span', { text: label })]));
    return inp;
  }
  function segment(host, label, opts, startIdx, onchange) {
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v14-lbl', text: label })]);
    var seg = el('div', { class: 'k-seg v14-seg', role: 'group', 'aria-label': label });
    var btns = opts.map(function (o, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === startIdx ? 'true' : 'false', text: o.t });
      b.addEventListener('click', function () { set(i); onchange(i); });
      seg.appendChild(b); return b;
    });
    function set(i) { btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    wrap.appendChild(seg); host.appendChild(wrap);
    return { set: set };
  }

  /* ══════════════════════════════════════════════════════════
     (A) Diagramme, die täuschen
     ══════════════════════════════════════════════════════════ */
  var ASPEKTE = [{ t: 'breit und flach', h: 110 }, { t: 'ausgewogen', h: 240 }, { t: 'schmal und hoch', h: 420 }];
  function initTaeuschung(host) {
    var z = { ab0: false, einheit: false, asp: 2 };
    var ctl = el('div', { class: 'k-controls v14-ctl' });
    var cb0 = checkbox(ctl, 'y-Achse beginnt bei 0', z.ab0, function (v) { z.ab0 = v; zeichne(); });
    var cbE = checkbox(ctl, 'Achsentitel mit Einheit', z.einheit, function (v) { z.einheit = v; zeichne(); });
    var seg = segment(ctl, 'Seitenverhältnis', ASPEKTE, z.asp, function (i) { z.asp = i; zeichne(); });
    host.appendChild(ctl);
    var presets = el('div', { class: 'k-presets v14-ctl' });
    var bT = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'So täuscht das Diagramm' });
    var bE = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'So ist es ehrlich' });
    bT.addEventListener('click', function () { setze(false, false, 2); });
    bE.addEventListener('click', function () { setze(true, true, 1); });
    presets.appendChild(bT); presets.appendChild(bE); host.appendChild(presets);
    function setze(a, e, s) { z.ab0 = a; z.einheit = e; z.asp = s; cb0.checked = a; cbE.checked = e; seg.set(s); zeichne(); }

    var svgWrap = el('div', { class: 'v14-chartwrap' });
    host.appendChild(svgWrap);
    var msg = el('div', { class: 'v14-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var dl = el('dl', { class: 'v13-dl v14-dl' });
    host.appendChild(dl);

    function zeichne() {
      var ymin = z.ab0 ? 0 : 2.0, ymax = z.ab0 ? 3 : 2.8, tickStep = z.ab0 ? 1 : 0.2;
      var h = ASPEKTE[z.asp].h;
      var ml = z.einheit ? 64 : 40, mr = 80, mt = 30, mb = z.einheit ? 52 : 30;
      var pw = 520, W = ml + pw + mr, H = mt + h + mb;
      var s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'v14-svg', role: 'img', 'aria-label': 'Liniendiagramm: Ausschussquote der Maschinen A und B über zwölf Monate. ' + (z.ab0 ? 'y-Achse ab null.' : 'y-Achse von 2,0 bis 2,8.') + (z.einheit ? ' Achsentitel mit Einheit.' : ' Ohne Achsentitel und Einheit.') });
      s.appendChild(sv('rect', { x: ml, y: mt, width: pw, height: h, fill: '#fff', stroke: '#9CA3AF' }));
      var py = function (v) { return nachPixel(v, ymin, ymax, mt + h, mt); };
      var px = function (i) { return nachPixel(i, 0, 11, ml + 14, ml + pw - 14); };
      var t, i;
      for (t = ymin; t <= ymax + 1e-9; t += tickStep) {
        var yy = py(t);
        s.appendChild(sv('line', { x1: ml, x2: ml + pw, y1: yy, y2: yy, stroke: '#E5E7EB' }));
        s.appendChild(sv('text', { x: ml - 6, y: yy + 4, 'text-anchor': 'end', class: 'v14-tick' }, fmt(t, tickStep < 1 ? 1 : 0)));
      }
      MONATE.forEach(function (m, k) { s.appendChild(sv('text', { x: px(k), y: mt + h + 16, 'text-anchor': 'middle', class: 'v14-tick' }, m)); });
      function linie(w, cls, name) {
        var pts = w.map(function (v, k) { return px(k) + ',' + py(v); }).join(' ');
        s.appendChild(sv('polyline', { points: pts, class: 'v14-line ' + cls, fill: 'none' }));
        s.appendChild(sv('text', { x: px(11) + 8, y: py(w[11]) + 4, class: 'v14-name ' + cls }, name));
      }
      linie(QUOTE_A, 'v14-a', 'Maschine A');
      linie(QUOTE_B, 'v14-b', 'Maschine B');
      s.appendChild(sv('text', { x: ml, y: 16, class: 'v14-head' }, 'Ausschuss der Maschinen A und B'));
      if (z.einheit) {
        s.appendChild(sv('text', { x: ml + pw / 2, y: H - 8, 'text-anchor': 'middle', class: 'v14-axt' }, 'Monat des Jahres'));
        var yt = sv('text', { transform: 'translate(14 ' + (mt + h / 2) + ') rotate(-90)', 'text-anchor': 'middle', class: 'v14-axt' }, 'Ausschussquote in %');
        s.appendChild(yt);
      }
      clear(svgWrap); svgWrap.appendChild(s);

      var mA = mittel(QUOTE_A), mB = mittel(QUOTE_B);
      var wv = wirkung(QUOTE_A, QUOTE_B, ymin), real = mB / mA;
      var pxEinh = h / (ymax - ymin), pxIdx = (pw - 28) / 11;
      var ang = winkel(QUOTE_B, pxIdx, pxEinh);
      var probleme = [];
      if (!z.ab0) probleme.push('Die y-Achse beginnt bei 2,0 statt bei 0: Maschine B wirkt fast doppelt so schlecht, ist es aber nicht.');
      if (!z.einheit) probleme.push('Ohne Achsentitel weiß niemand, was die Zahlen bedeuten (Anteil in %? Stück?).');
      if (z.asp !== 1) probleme.push(z.asp === 2 ? 'Das schmale, hohe Format macht aus einem leichten Anstieg eine steile Kurve.' : 'Das breite, flache Format lässt sogar einen echten Anstieg verschwinden.');
      clear(msg);
      msg.className = 'v14-verdict ' + (probleme.length ? 'is-bad' : 'is-ok');
      if (probleme.length) {
        msg.appendChild(el('strong', { text: 'Dieses Diagramm täuscht oder ist unvollständig:' }));
        var ul = el('ul'); probleme.forEach(function (p) { ul.appendChild(el('li', { text: p })); }); msg.appendChild(ul);
      } else {
        msg.appendChild(el('strong', { text: 'Ehrlich: ' }));
        msg.appendChild(document.createTextNode('Achse ab 0, Achsentitel mit Einheit, ausgewogenes Format. Man sieht: Beide Maschinen liegen eng beieinander, B etwas höher.'));
      }
      clear(dl);
      [['Im Bild: B im Verhältnis zu A', fmt(wv, 2) + '-fach'], ['Tatsächlich: 2,50 % zu 2,25 %', fmt(real, 2) + '-fach'], ['Anstieg von B im Bild', fmt(ang, 0) + ' Grad']].forEach(function (p) {
        dl.appendChild(el('div', {}, [el('dt', { text: p[0] }), el('dd', { text: p[1] })]));
      });
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Von der Liste zum Pixel
     ══════════════════════════════════════════════════════════ */
  var T = [0, 1, 2, 3, 4], V = [0.0, 2.2, 3.6, 4.2, 4.5];
  var YGRENZEN = [{ t: 'ylim(0, 5)', a: 0, b: 5 }, { t: 'ylim(0, 10)', a: 0, b: 10 }, { t: 'ylim(4, 5)', a: 4, b: 5 }];
  function initKoordinaten(host) {
    var X0 = 70, X1 = 590, Y0 = 290, Y1 = 30, XMIN = 0, XMAX = 4.5;   // Y0 ist unten (großer Pixelwert)
    var st = { n: 0, yg: 0 };
    host.appendChild(el('p', { class: 'v14-code', text: 't = [0, 1, 2, 3, 4]      v = [0.0, 2.2, 3.6, 4.2, 4.5]      plt.plot(t, v)' }));
    var ctl = el('div', { class: 'k-controls v14-ctl' });
    segment(ctl, 'Grenzen der y-Achse', YGRENZEN, 0, function (i) { st.yg = i; zeichne(); });
    host.appendChild(ctl);
    var bar = el('div', { class: 'k-presets v14-ctl' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Punkt' });
    var bAll = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Alle Punkte' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Zurück zum Anfang' });
    bNext.addEventListener('click', function () { if (st.n < T.length) st.n++; zeichne(); });
    bAll.addEventListener('click', function () { st.n = T.length; zeichne(); });
    bReset.addEventListener('click', function () { st.n = 0; zeichne(); });
    [bNext, bAll, bReset].forEach(function (b) { bar.appendChild(b); });
    host.appendChild(bar);
    var wrap = el('div', { class: 'v14-two' });
    var svgWrap = el('div', { class: 'v14-chartwrap' });
    var calc = el('div', { class: 'v14-calc', role: 'status', 'aria-live': 'polite' });
    wrap.appendChild(svgWrap); wrap.appendChild(calc); host.appendChild(wrap);

    function zeichne() {
      var g = YGRENZEN[st.yg];
      var s = sv('svg', { viewBox: '0 0 640 340', class: 'v14-svg', role: 'img', 'aria-label': 'Koordinatensystem mit Zeit t in s waagerecht und Geschwindigkeit v in m/s senkrecht, ' + st.n + ' von 5 Punkten sind eingezeichnet.' });
      s.appendChild(sv('rect', { x: X0, y: Y1, width: X1 - X0, height: Y0 - Y1, fill: '#fff', stroke: '#9CA3AF' }));
      var k, tx, ty;
      for (k = 0; k <= 4; k++) {
        tx = nachPixel(k, XMIN, XMAX, X0, X1);
        s.appendChild(sv('line', { x1: tx, x2: tx, y1: Y0, y2: Y1, stroke: '#E5E7EB' }));
        s.appendChild(sv('text', { x: tx, y: Y0 + 16, 'text-anchor': 'middle', class: 'v14-tick' }, String(k)));
      }
      var ticks = g.b - g.a > 5 ? [0, 5, 10] : (g.b - g.a < 2 ? [4, 4.5, 5] : [0, 1, 2, 3, 4, 5]);
      ticks.forEach(function (v) {
        ty = nachPixel(v, g.a, g.b, Y0, Y1);
        s.appendChild(sv('line', { x1: X0, x2: X1, y1: ty, y2: ty, stroke: '#E5E7EB' }));
        s.appendChild(sv('text', { x: X0 - 6, y: ty + 4, 'text-anchor': 'end', class: 'v14-tick' }, fmt(v, v % 1 ? 1 : 0)));
      });
      s.appendChild(sv('text', { x: (X0 + X1) / 2, y: 330, 'text-anchor': 'middle', class: 'v14-axt' }, 'Zeit t in s'));
      s.appendChild(sv('text', { transform: 'translate(16 ' + ((Y0 + Y1) / 2) + ') rotate(-90)', 'text-anchor': 'middle', class: 'v14-axt' }, 'Geschwindigkeit v in m/s'));
      var pts = [], i;
      for (i = 0; i < st.n; i++) {
        var X = nachPixel(T[i], XMIN, XMAX, X0, X1), Y = nachPixel(V[i], g.a, g.b, Y0, Y1);
        var drin = V[i] >= g.a && V[i] <= g.b;
        pts.push({ X: X, Y: Y, drin: drin });
      }
      var seen = pts.filter(function (p) { return p.drin; });
      if (pts.length > 1) {
        var path = pts.filter(function (p) { return p.drin; }).map(function (p) { return p.X + ',' + p.Y; }).join(' ');
        if (seen.length > 1) s.appendChild(sv('polyline', { points: path, fill: 'none', class: 'v14-line v14-b' }));
      }
      pts.forEach(function (p, j) {
        if (p.drin) s.appendChild(sv('circle', { cx: p.X, cy: p.Y, r: j === st.n - 1 ? 7 : 5, class: j === st.n - 1 ? 'v14-dot v14-dot--cur' : 'v14-dot' }));
        else s.appendChild(sv('text', { x: p.X, y: Y1 + 14, 'text-anchor': 'middle', class: 'v14-out' }, '↑ außerhalb'));
      });
      clear(svgWrap); svgWrap.appendChild(s);

      clear(calc);
      if (st.n === 0) {
        calc.appendChild(el('p', { text: 'Noch kein Punkt gezeichnet. „Nächster Punkt“ nimmt das nächste Paar aus den beiden Listen und rechnet es in Bildpunkte um.' }));
        calc.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Zeichenfläche ist 520 Pixel breit (von Pixel 70 bis 590) und 260 Pixel hoch (von 30 bis 290). Pixel-y zählt von oben nach unten.' }));
      } else {
        var j = st.n - 1, p = pts[j];
        calc.appendChild(el('p', { class: 'v14-calc__t', text: 'Punkt ' + (j + 1) + ': t = ' + fmt(T[j], 0) + ' s, v = ' + fmt(V[j], 1) + ' m/s' }));
        calc.appendChild(el('p', { class: 'v14-calc__f', text: 'x-Pixel = 70 + (t − 0) / (4,5 − 0) · 520 = ' + fmt(p.X, 0) }));
        calc.appendChild(el('p', { class: 'v14-calc__f', text: 'y-Pixel = 290 − (v − ' + fmt(g.a, 0) + ') / (' + fmt(g.b, 0) + ' − ' + fmt(g.a, 0) + ') · 260 = ' + fmt(p.Y, 0) }));
        if (!p.drin) calc.appendChild(el('p', { class: 'v14-calc__bad', text: 'Dieser Wert liegt außerhalb der gewählten y-Grenzen. Das Programm zeichnet ihn nicht, und es gibt keine Fehlermeldung.' }));
        else if (g.b - g.a > 5) calc.appendChild(el('p', { class: 'k-small k-muted', text: 'Mit größerem Bereich rücken alle Punkte zusammen: Dieselben Zahlen sind nur halb so hoch im Bild.' }));
        else if (g.a > 0) calc.appendChild(el('p', { class: 'k-small k-muted', text: 'Mit abgeschnittener Achse füllt ein Unterschied von 0,5 m/s plötzlich die halbe Höhe.' }));
        else calc.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Rechenweg ist für alle Punkte gleich: Wert minus Achsenanfang, geteilt durch die Achsenlänge, mal Pixelzahl.' }));
      }
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Welche Diagrammart wofür
     ══════════════════════════════════════════════════════════ */
  var ARTEN = ['Linie', 'Punkte', 'Balken', 'Histogramm'];
  var FRAGEN = [
    { q: 'Die Lagertemperatur wird eine Stunde lang jede Minute gemessen. Wie verläuft sie?', a: 0, xl: 'Zeit t in min', yl: 'Temperatur in °C', fn: function (x) { return 40 + 18 * (1 - Math.exp(-x / 18)); }, why: 'Eine Größe über der Zeit: Die Messpunkte hängen zusammen, die Linie zeigt den Verlauf.' },
    { q: 'Zugkraft und Dehnung von zwölf Proben: Hängt die Dehnung von der Kraft ab?', a: 1, xl: 'Zugkraft F in kN', yl: 'Dehnung in mm', fn: function (x, i) { return 0.4 * x + [0.2, -0.3, 0.1, 0.4, -0.2, 0.3, -0.1, 0.2, -0.4, 0.1, 0.3, -0.2][i]; }, why: 'Zwei gemessene Größen, jede Probe ein eigener Punkt. Eine Linie würde eine Reihenfolge vortäuschen, die es nicht gibt.' },
    { q: 'Die Ausschussquote von fünf Maschinen im selben Monat soll verglichen werden.', a: 2, xl: 'Maschine', yl: 'Ausschussquote in %', cats: ['D1', 'D2', 'F1', 'F2', 'R1'], vals: [2.1, 3.4, 1.8, 2.6, 4.0], why: 'Getrennte Kategorien nebeneinander vergleichen: Balken, mit Achse ab 0.' },
    { q: 'Wie streuen die Durchmesser von 200 gefertigten Wellen um das Sollmaß?', a: 3, xl: 'Durchmesser in mm', yl: 'Anzahl Wellen', bins: [3, 8, 22, 41, 52, 38, 21, 10, 5], lo: 19.97, why: 'Viele Messwerte einer Größe, gefragt ist die Verteilung: Das Histogramm zählt, wie viele in jede Klasse fallen.' },
    { q: 'Die Beschleunigung eines Fahrrads beim Bremsen wird 8 Sekunden lang mit dem Handy aufgezeichnet.', a: 0, xl: 'Zeit t in s', yl: 'Beschleunigung a in m/s²', fn: function (x) { return x < 3 ? 0.1 : (x < 6 ? -3.4 + 0.3 * Math.sin(x * 4) : 0.05); }, why: 'Wieder eine Größe über der Zeit: Linie. Das ist der Fall aus dem vorgerechneten Beispiel im Labor.' },
    { q: 'Wie viele Ausschussteile gibt es je Fehlerart (Grat, Maßfehler, Kratzer, Rissprüfung)?', a: 2, xl: 'Fehlerart', yl: 'Anzahl Teile', cats: ['Grat', 'Maß', 'Kratzer', 'Riss'], vals: [34, 21, 12, 3], why: 'Kategorien mit je einer Zahl: Balken. Reihenfolge nach Größe erleichtert das Lesen.' }
  ];
  function miniChart(f, art) {
    var W = 360, H = 220, L = 54, R = 12, T0 = 14, B = 42, pw = W - L - R, ph = H - T0 - B;
    var s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'v14-svg v14-svg--mini', role: 'img', 'aria-label': art + '-Diagramm: ' + f.yl + ' über ' + f.xl });
    s.appendChild(sv('rect', { x: L, y: T0, width: pw, height: ph, fill: '#fff', stroke: '#9CA3AF' }));
    var i, xs = [], ys = [];
    if (art === 'Linie' || art === 'Punkte') {
      var n = art === 'Linie' ? 40 : 12;
      for (i = 0; i < n; i++) { xs.push(art === 'Linie' ? i * (f.xl.indexOf('min') > 0 ? 1.5 : 0.2) : 1 + i * 0.8); }
      ys = xs.map(function (x, k) { return f.fn(x, k); });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), pad = (y1 - y0) * 0.1 || 1;
      var P = xs.map(function (x, k) { return [nachPixel(x, x0, x1, L + 8, L + pw - 8), nachPixel(ys[k], y0 - pad, y1 + pad, T0 + ph, T0)]; });
      if (art === 'Linie') s.appendChild(sv('polyline', { points: P.map(function (p) { return p.join(','); }).join(' '), fill: 'none', class: 'v14-line v14-b' }));
      else P.forEach(function (p) { s.appendChild(sv('circle', { cx: p[0], cy: p[1], r: 4, class: 'v14-dot' })); });
    } else {
      var vals = f.vals || f.bins, cnt = vals.length, mx = Math.max.apply(null, vals) * 1.15, gap = art === 'Histogramm' ? 0 : 10, bw = pw / cnt;
      vals.forEach(function (v, k) {
        var h = v / mx * ph;
        s.appendChild(sv('rect', { x: L + k * bw + gap / 2, y: T0 + ph - h, width: bw - gap, height: h, class: 'v14-bar' }));
        if (f.cats) s.appendChild(sv('text', { x: L + k * bw + bw / 2, y: T0 + ph + 14, 'text-anchor': 'middle', class: 'v14-tick' }, f.cats[k]));
      });
      if (art === 'Histogramm') { s.appendChild(sv('text', { x: L, y: T0 + ph + 14, class: 'v14-tick' }, '19,97')); s.appendChild(sv('text', { x: L + pw, y: T0 + ph + 14, 'text-anchor': 'end', class: 'v14-tick' }, '20,03')); }
    }
    s.appendChild(sv('text', { x: L + pw / 2, y: H - 6, 'text-anchor': 'middle', class: 'v14-axt' }, f.xl));
    s.appendChild(sv('text', { transform: 'translate(12 ' + (T0 + ph / 2) + ') rotate(-90)', 'text-anchor': 'middle', class: 'v14-axt' }, f.yl));
    return s;
  }
  function initDiagrammart(host) {
    var st = { i: 0, punkte: 0, beantwortet: false };
    var q = el('p', { class: 'v14-q' });
    var opts = el('div', { class: 'k-predict__opts' });
    var fb = el('div', { class: 'v14-fb', role: 'status', 'aria-live': 'polite' });
    var fig = el('div', { class: 'v14-figbox' });
    var nav = el('div', { class: 'k-presets v14-ctl' });
    var next = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Nächste Frage' });
    var score = el('span', { class: 'k-small k-muted v14-score' });
    next.addEventListener('click', function () { st.i = (st.i + 1) % FRAGEN.length; zeige(); });
    nav.appendChild(next); nav.appendChild(score);
    [q, opts, fb, fig, nav].forEach(function (n) { host.appendChild(n); });
    ARTEN.forEach(function (a, k) {
      var b = el('button', { type: 'button', text: a });
      b.addEventListener('click', function () { antwort(k, b); });
      opts.appendChild(b);
    });
    function zeige() {
      var f = FRAGEN[st.i]; st.beantwortet = false;
      q.textContent = 'Frage ' + (st.i + 1) + ' von ' + FRAGEN.length + ': ' + f.q;
      Array.prototype.forEach.call(opts.children, function (b) { b.removeAttribute('aria-pressed'); b.classList.remove('is-right', 'is-wrong'); });
      clear(fb); clear(fig); next.hidden = true;
      score.textContent = 'Richtig im ersten Versuch: ' + st.punkte;
    }
    function antwort(k, btn) {
      var f = FRAGEN[st.i];
      if (st.beantwortet) return;
      clear(fb);
      if (k === f.a) {
        st.beantwortet = true; if (!btn.dataset.falsch) st.punkte++;
        btn.classList.add('is-right'); btn.setAttribute('aria-pressed', 'true');
        fb.className = 'v14-fb is-ok';
        fb.appendChild(el('strong', { text: 'Richtig: ' + ARTEN[f.a] + '. ' }));
        fb.appendChild(document.createTextNode(f.why));
        fig.appendChild(miniChart(f, ARTEN[f.a]));
        next.hidden = false; score.textContent = 'Richtig im ersten Versuch: ' + st.punkte;
        Array.prototype.forEach.call(opts.children, function (b) { delete b.dataset.falsch; });
      } else {
        btn.classList.add('is-wrong'); btn.dataset.falsch = '1';
        fb.className = 'v14-fb is-bad';
        var tipp = { 0: 'Eine Linie verbindet die Punkte und behauptet damit: Dazwischen verläuft der Wert stetig, und die Reihenfolge zählt. Passt das hier?', 1: 'Punkte zeigen jede Messung einzeln und den Zusammenhang zweier Größen. Ist hier eine Größe die Zeit, oder gibt es zwei Messgrößen je Teil?', 2: 'Balken vergleichen getrennte Kategorien. Gibt es hier Kategorien mit je einem Wert?', 3: 'Ein Histogramm zählt, wie viele Messwerte in jede Klasse fallen. Geht es hier um die Verteilung vieler Werte?' }[k];
        fb.appendChild(el('strong', { text: 'Noch nicht. ' })); fb.appendChild(document.createTextNode(tipp));
      }
    }
    zeige();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Subplots
     ══════════════════════════════════════════════════════════ */
  var NAMEN = { '1x1': ['ax'], '2x1': ['oben', 'unten'], '1x2': ['links', 'rechts'], '3x1': ['a', 'b', 'c'], '2x2': null };
  function initSubplots(host) {
    var st = { z: 2, s: 1 };
    var ctl = el('div', { class: 'k-controls v14-ctl' });
    segment(ctl, 'Zeilen', [{ t: '1' }, { t: '2' }, { t: '3' }], 1, function (i) { st.z = i + 1; zeichne(); });
    segment(ctl, 'Spalten', [{ t: '1' }, { t: '2' }], 0, function (i) { st.s = i + 1; zeichne(); });
    host.appendChild(ctl);
    var code = el('pre', { class: 'v14-codeline', 'aria-live': 'polite' });
    host.appendChild(code);
    var wrap = el('div', { class: 'v14-chartwrap' });
    host.appendChild(wrap);
    var note = el('p', { class: 'k-small k-muted' });
    host.appendChild(note);
    function zeichne() {
      var key = st.z + 'x' + st.s, namen = NAMEN[key], i, r, c;
      var aufruf = key === '1x1' ? 'plt.subplots()' : 'plt.subplots(' + st.z + ', ' + st.s + ')';
      var tx;
      if (key === '1x1') tx = 'fig, ax = ' + aufruf;
      else if (namen) tx = 'fig, (' + namen.join(', ') + ') = ' + aufruf;
      else tx = 'fig, axs = ' + aufruf + '      # Raster: axs[zeile, spalte]';
      code.textContent = tx;
      var W = 420, H = 80 + st.z * 70, s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'v14-svg v14-svg--mini', role: 'img', 'aria-label': 'Raster mit ' + st.z + ' Zeilen und ' + st.s + ' Spalten' });
      s.appendChild(sv('rect', { x: 4, y: 4, width: W - 8, height: H - 8, fill: '#F7F8FA', stroke: '#6B7280' }));
      s.appendChild(sv('text', { x: 14, y: 22, class: 'v14-tick' }, 'fig  (die ganze Abbildung)'));
      var cw = (W - 40) / st.s, ch = (H - 50) / st.z;
      for (r = 0; r < st.z; r++) for (c = 0; c < st.s; c++) {
        var idx = r * st.s + c;
        s.appendChild(sv('rect', { x: 20 + c * cw + 4, y: 32 + r * ch + 4, width: cw - 8, height: ch - 8, fill: '#fff', stroke: '#E2001A', 'stroke-width': 2 }));
        var nm = namen ? namen[idx] : 'axs[' + r + ', ' + c + ']';
        s.appendChild(sv('text', { x: 20 + c * cw + cw / 2, y: 32 + r * ch + ch / 2 + 5, 'text-anchor': 'middle', class: 'v14-axt' }, nm));
      }
      clear(wrap); wrap.appendChild(s);
      note.textContent = key === '1x1' ? 'Ein einzelnes Teilbild: Die Funktion gibt zwei Dinge zurück, die Abbildung und das Teilbild.' : (namen ? 'Die Funktion gibt zwei Dinge zurück: die Abbildung und eine Gruppe aus ' + namen.length + ' Teilbildern. Die Klammer in „fig, (' + namen.join(', ') + ')“ packt diese Gruppe sofort in ' + namen.length + ' eigene Namen aus.' : 'Bei einem Raster bleibt die Gruppe zusammen (axs) und du greifst mit Zeile und Spalte auf ein Teilbild zu: axs[0, 1] ist oben rechts.');
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (E) PAP: Messdaten einlesen, aufsummieren, plotten
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(), P.op('zeit = [ ], a_y = [ ]'), P.op('Datei öffnen, Kopfzeile überspringen'),
      P.whil('weitere Zeile in der Datei?', [P.op('zeit und a_y um den Wert der Zeile ergänzen')]),
      P.op('dt = zeit[1] − zeit[0]'), P.op('v = [4,4]'),
      P.whil('weiterer Beschleunigungswert?', [P.op('v neu = v letzter + a · dt'), P.op('v um den neuen Wert ergänzen')]),
      P.io('Diagramm: oben a über t, unten v über t'), P.end()
    ];
    var d = el('div', { class: 'v14-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan: Listen anlegen, Datei zeilenweise einlesen, Zeitschritt bestimmen, Geschwindigkeit in einer Schleife aufsummieren, zwei Diagramme ausgeben.' });
    host.appendChild(d);
  }

  function init() {
    var map = { taeuschung: initTaeuschung, koordinaten: initKoordinaten, diagrammart: initDiagrammart, subplots: initSubplots, 'pap-messdaten': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
