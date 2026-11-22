/* =============================================================
   explorables-v13.js – interaktive Bausteine für V13 „Laufzeit-Intuition“ (reines JS, kein Framework)
   (A) Schrittzahl: einfache Schleife gegen „jeder mit jedem“ (Kollisionsprüfung von Bohrungen), Schieberegler n.
   (B) Schleife gegen Vektor: Animation, wie eine Python-Schleife jedes Element einzeln holt und NumPy den ganzen Block bearbeitet.
   (C) Überschlagsrechner: Schrittzahl und Tempo-Annahme ergeben eine Dauer auf der Größenordnungs-Leiter (ns bis Tage).
   (D) Messreihe: warum Messungen schwanken, Minimum / Median / Mittelwert (simulierte Ausreißer).
   (E) PAP-Vergleich: Schleife (Summe der Quadrate) gegen den einzeiligen NumPy-Ausdruck.
   Der Rechenkern ist ohne DOM per node testbar (module.exports). Alle Tempo-Angaben sind Annahmen zum Überschlagen, keine Messwerte.
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  function paare(n) { return n * (n - 1) / 2; }
  function zahl(x, stellen) {
    var o = stellen === undefined ? { maximumFractionDigits: 0 } : { maximumSignificantDigits: stellen };
    try { return Number(x).toLocaleString('de-DE', o); } catch (e) { return String(x); }
  }
  /* Sekunden in lesbare Einheit: ns, µs, ms, s, min, h, Tage */
  function fmtZeit(s) {
    var u = [[1e-6, 1e-9, 'ns'], [1e-3, 1e-6, 'µs'], [1, 1e-3, 'ms'], [60, 1, 's'], [3600, 60, 'min'], [86400, 3600, 'h'], [Infinity, 86400, 'Tage']], i;
    for (i = 0; i < u.length; i++) if (s < u[i][0]) return zahl(s / u[i][1], 3) + ' ' + u[i][2];
    return '';
  }
  function sortiert(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function median(a) { var s = sortiert(a), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function minimum(a) { return Math.min.apply(null, a); }
  function maximum(a) { return Math.max.apply(null, a); }
  function mittel(a) { var t = 0; a.forEach(function (x) { t += x; }); return t / a.length; }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Eine simulierte Messung in ms: Grundzeit plus kleines Rauschen, selten ein großer Ausreißer */
  function simuliereMessung(rnd, basis) {
    var r = rnd(), rauschen = (rnd() + rnd() + rnd() - 1.5) * 0.6, ausr = r < 0.14 ? 8 + rnd() * 70 : 0;
    return Math.round((basis + Math.abs(rauschen) + ausr) * 10) / 10;
  }
  var core = { paare: paare, fmtZeit: fmtZeit, median: median, minimum: minimum, maximum: maximum, mittel: mittel, simuliereMessung: simuliereMessung, mulberry32: mulberry32 };

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

  /* ══════════════════════════════════════════════════════════
     (A) Schrittzahl: einfache Schleife gegen „jeder mit jedem“
     ══════════════════════════════════════════════════════════ */
  var NSTOPS = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  function initSchritte(host) {
    var sid = nextId('v13-s-');
    var slider = el('input', { type: 'range', id: sid, min: '0', max: String(NSTOPS.length - 1), step: '1', value: '3', 'aria-describedby': sid + '-o' });
    var out = el('output', { id: sid + '-o', class: 'v13-out', 'aria-live': 'polite' });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('label', { for: sid, text: 'Anzahl Bohrungen n im Bauteil' }), slider, out])]));

    var msg = el('p', { class: 'v13-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);

    var rowA = el('div', { class: 'v13-bar' });
    var rowB = el('div', { class: 'v13-bar' });
    var fillA = el('span', { class: 'v13-bar__fill' }), fillB = el('span', { class: 'v13-bar__fill v13-bar__fill--b' });
    var valA = el('span', { class: 'v13-bar__val' }), valB = el('span', { class: 'v13-bar__val' });
    rowA.appendChild(el('p', { class: 'v13-bar__lbl' }, [el('strong', { text: 'Eine Schleife' }), ' (jede Bohrung einmal prüfen, z. B. Durchmesser in der Toleranz?)']));
    rowA.appendChild(el('div', { class: 'v13-bar__track' }, [fillA])); rowA.appendChild(valA);
    rowB.appendChild(el('p', { class: 'v13-bar__lbl' }, [el('strong', { text: 'Doppelte Schleife' }), ' (jede Bohrung mit jeder anderen vergleichen, z. B. Kollisionsprüfung)']));
    rowB.appendChild(el('div', { class: 'v13-bar__track' }, [fillB])); rowB.appendChild(valB);
    var chart = sv('svg', { class: 'v13-chart', viewBox: '0 0 420 220', role: 'img', 'aria-label': 'Diagramm: Schrittzahl über der Anzahl Bohrungen. Die einfache Schleife wächst als Gerade, die doppelte Schleife als nach oben gekrümmte Kurve.' });
    host.appendChild(el('div', { class: 'v13-two' }, [el('div', {}, [rowA, rowB]), el('div', { class: 'v13-chartwrap' }, [chart])]));
    var verdopp = el('p', { class: 'v13-note k-small' });
    host.appendChild(verdopp);

    function paintChart(n) {
      var W = 420, H = 220, L = 44, R = 12, T = 12, B = 34, pw = W - L - R, ph = H - T - B, ymax = Math.max(paare(n), n), k, i, pts, x, y;
      while (chart.firstChild) chart.removeChild(chart.firstChild);
      chart.appendChild(sv('line', { x1: L, y1: T, x2: L, y2: H - B, class: 'v13-axis' }));
      chart.appendChild(sv('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, class: 'v13-axis' }));
      chart.appendChild(sv('text', { x: L - 6, y: T + 6, 'text-anchor': 'end', class: 'v13-tick' }, zahl(ymax)));
      chart.appendChild(sv('text', { x: L - 6, y: H - B + 4, 'text-anchor': 'end', class: 'v13-tick' }, '0'));
      chart.appendChild(sv('text', { x: W - R, y: H - B + 18, 'text-anchor': 'end', class: 'v13-tick' }, 'n = ' + zahl(n)));
      chart.appendChild(sv('text', { x: L, y: H - B + 18, 'text-anchor': 'start', class: 'v13-tick' }, '0'));
      chart.appendChild(sv('text', { x: 12, y: T + ph / 2, 'text-anchor': 'middle', class: 'v13-tick', transform: 'rotate(-90 12 ' + (T + ph / 2) + ')' }, 'Schritte'));
      [['v13-line v13-line--a', function (m) { return m; }], ['v13-line v13-line--b', paare]].forEach(function (c) {
        pts = [];
        for (i = 0; i <= 40; i++) { k = n * i / 40; x = L + pw * i / 40; y = T + ph - ph * c[1](k) / ymax; pts.push(x.toFixed(1) + ',' + y.toFixed(1)); }
        chart.appendChild(sv('polyline', { points: pts.join(' '), class: c[0], fill: 'none' }));
      });
      /* halbe Datenmenge als gestrichelte Marke */
      x = L + pw / 2;
      chart.appendChild(sv('line', { x1: x, y1: T, x2: x, y2: H - B, class: 'v13-half' }));
      chart.appendChild(sv('text', { x: x + 4, y: T + 12, class: 'v13-tick' }, 'halbe Menge'));
      chart.appendChild(sv('circle', { cx: L + pw, cy: T + ph - ph * paare(n) / ymax, r: 4, class: 'v13-dot v13-dot--b' }));
      chart.appendChild(sv('circle', { cx: L + pw, cy: T + ph - ph * n / ymax, r: 4, class: 'v13-dot v13-dot--a' }));
    }
    function paint() {
      var n = NSTOPS[parseInt(slider.value, 10)], a = n, b = paare(n), r = paare(2 * n) / b;
      out.textContent = 'n = ' + zahl(n) + ' Bohrungen';
      fillA.style.width = Math.max(0.6, 100 * a / b) + '%';
      fillB.style.width = '100%';
      valA.textContent = zahl(a) + ' Schritte';
      valB.textContent = zahl(b) + ' Schritte (n·(n−1)/2 Paare)';
      msg.textContent = 'Bei n = ' + zahl(n) + ' braucht die doppelte Schleife ' + zahl(b / a, 3) + '-mal so viele Schritte wie die einfache.';
      verdopp.textContent = 'Verdoppelst du die Datenmenge auf ' + zahl(2 * n) + ': Die einfache Schleife braucht doppelt so viele Schritte (' + zahl(a) + ' → ' + zahl(2 * a) + '), die doppelte etwa ' + zahl(r, 3) + '-mal so viele (' + zahl(b) + ' → ' + zahl(paare(2 * n)) + '). Wie lange das dauert, überschlägst du im Rechner weiter unten.';
      paintChart(n);
    }
    slider.addEventListener('input', paint);
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Schleife gegen Vektor
     ══════════════════════════════════════════════════════════ */
  function initVektor(host) {
    var N = 10, step = 0, timer = null;
    var VALS = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    var OFF = [0, 9, 3, 12, 1, 10, 5, 14, 2, 8];
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    host.appendChild(el('div', { class: 'k-presets v13-ctl', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bPlay, bReset]));
    var msg = el('p', { class: 'v13-msg is-on', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);

    function lane(titel, code, memo, spread) {
      var ul = el('ul', { class: 'v13-cells' + (spread ? ' v13-cells--list' : ' v13-cells--arr'), 'aria-label': titel });
      var cells = VALS.map(function (v, i) {
        var li = el('li', { class: 'v13-cell' }, [el('span', { class: 'v13-cell__v', text: String(v) })]);
        if (spread) { li.style.marginLeft = OFF[i] + 'px'; li.style.marginTop = (i % 2 ? 6 : 0) + 'px'; }
        ul.appendChild(li); return li;
      });
      var cnt = el('p', { class: 'v13-count', 'aria-hidden': 'true' });
      var box = el('div', { class: 'v13-lane' }, [el('p', { class: 'v13-lane__t' }, [el('strong', { text: titel })]), el('pre', { class: 'v13-lane__code', 'data-run': 'no' }, [el('code', { text: code })]), ul, cnt, el('p', { class: 'v13-lane__memo k-small k-muted', text: memo })]);
      host.appendChild(box);
      return { cells: cells, cnt: cnt };
    }
    var L1 = lane('Python-Schleife über eine Liste', 'for x in liste:\n    ergebnis.append(x * 2)', 'Im Speicher: Die Liste merkt sich nur Verweise. Jeder Wert ist ein eigenes Python-Objekt, verstreut im Speicher.', true);
    var L2 = lane('NumPy: ein Befehl für das ganze Array', 'ergebnis = a * 2', 'Im Speicher: Alle Werte liegen lückenlos nebeneinander, alle vom gleichen Typ (z. B. float64, 8 Byte je Zahl).', false);

    function paint() {
      var i;
      L1.cells.forEach(function (c, j) {
        var done = j < step, cur = j === step - 1;
        c.className = 'v13-cell' + (done ? ' is-done' : '') + (cur ? ' is-cur' : '');
        c.firstChild.textContent = String(done ? VALS[j] * 2 : VALS[j]);
      });
      L2.cells.forEach(function (c, j) {
        c.className = 'v13-cell' + (step >= 1 ? ' is-done is-all' : '');
        c.firstChild.textContent = String(step >= 1 ? VALS[j] * 2 : VALS[j]);
      });
      L1.cnt.textContent = 'Durchläufe der Schleife: ' + step + ' von ' + N;
      L2.cnt.textContent = 'Aufrufe: ' + (step >= 1 ? 1 : 0) + ' von 1';
      if (step === 0) msg.textContent = 'Ausgangslage: Zehn Werte sollen verdoppelt werden. Oben holt eine Python-Schleife jedes Element einzeln, unten bekommt NumPy einen einzigen Befehl für den ganzen Block. Drück „Nächster Schritt“.';
      else if (step === 1) msg.textContent = 'Schritt 1: Die Schleife hat erst ein Element bearbeitet. NumPy ist schon fertig: ein Aufruf, der ganze Block ist verdoppelt. Die Rechnung selbst läuft in vorübersetztem C-Code.';
      else if (step < N) msg.textContent = 'Schritt ' + step + ': Die Schleife ist beim Element ' + step + '. Jeder Durchlauf kostet Interpreter-Arbeit: Element holen, Typ prüfen, rechnen, ein neues Ergebnisobjekt anlegen, anhängen. NumPy wartet längst.';
      else msg.textContent = 'Schritt ' + N + ': Auch die Schleife ist fertig, mit demselben Ergebnis, aber ' + N + ' Durchläufen statt 1 Aufruf. Bei einer Million Elementen sind das eine Million Durchläufe gegen einen Aufruf. Der C-Code rechnet übrigens auch Element für Element (oder in kleinen Gruppen), nur ohne die Interpreter-Arbeit je Element.';
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    function next() { if (step < N) { step++; paint(); } }
    bNext.addEventListener('click', function () { stop(); next(); });
    bReset.addEventListener('click', function () { stop(); step = 0; paint(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (step >= N) step = 0;
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { next(); if (step >= N) stop(); }, reduced() ? 400 : 750);
    });
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Überschlagsrechner mit Größenordnungs-Leiter
     ══════════════════════════════════════════════════════════ */
  var TEMPI = [
    { id: 'py', text: 'Python-Schleife (Faustwert: 10 Mio. Durchläufe je Sekunde)', rate: 1e7 },
    { id: 'np', text: 'NumPy-Operation (Faustwert: 200 Mio. Elemente je Sekunde)', rate: 2e8 },
    { id: 'c', text: 'reiner C-Code (Faustwert: 1 Mrd. Schritte je Sekunde)', rate: 1e9 }
  ];
  var NWERTE = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
  var MARKEN = [[-9, '1 ns'], [-6, '1 µs'], [-3, '1 ms'], [0, '1 s'], [Math.log10(60), '1 min'], [Math.log10(3600), '1 h'], [Math.log10(86400), '1 Tag']];
  function einordnung(s) {
    if (s < 1e-3) return 'Unmerklich kurz.';
    if (s < 0.1) return 'Fühlt sich sofort an.';
    if (s < 2) return 'Eine kurze Gedenksekunde.';
    if (s < 60) return 'Du wartest, aber es ist noch zumutbar.';
    if (s < 3600) return 'Kaffeepause. Da lohnt sich ein anderer Ansatz.';
    if (s < 86400) return 'Über Stunden: so nicht, ein anderer Algorithmus ist fällig.';
    return 'Tage und mehr: unbrauchbar. Nur ein anderer Ansatz hilft.';
  }
  function initUeberschlag(host) {
    var id = nextId('v13-u-');
    var selArt = el('select', { id: id + 'a' }, [el('option', { value: 'ein', text: 'eine Schleife: n Schritte' }), el('option', { value: 'paar', text: 'jeder mit jedem: n·(n−1)/2 Schritte' })]);
    var selN = el('select', { id: id + 'n' }, NWERTE.map(function (n) { return el('option', { value: String(n), text: zahl(n) }); }));
    selN.value = '1000000';
    var selT = el('select', { id: id + 't' }, TEMPI.map(function (t) { return el('option', { value: t.id, text: t.text }); }));
    host.appendChild(el('div', { class: 'k-controls' }, [
      el('div', { class: 'k-field' }, [el('label', { for: id + 'a', text: 'Aufgabe' }), selArt]),
      el('div', { class: 'k-field' }, [el('label', { for: id + 'n', text: 'Anzahl Elemente n' }), selN]),
      el('div', { class: 'k-field' }, [el('label', { for: id + 't', text: 'Tempo-Annahme' }), selT])
    ]));
    var msg = el('p', { class: 'v13-msg is-on', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var svg = sv('svg', { class: 'v13-ladder', viewBox: '0 0 560 92', role: 'img', 'aria-label': 'Größenordnungs-Leiter von einer Nanosekunde bis zu einem Tag mit dem Ergebnis als roter Marke.' });
    host.appendChild(el('div', { class: 'v13-chartwrap' }, [svg]));
    host.appendChild(el('p', { class: 'v13-note k-small k-muted', text: 'Die Tempo-Angaben sind grobe Faustwerte zum Überschlagen, keine Messwerte. Dein Rechner und besonders der Browser weichen ab (oft um einen Faktor 2 bis 5). Was auf deinem Rechner gilt, zeigt nur die Messung.' }));
    var LO = -9.5, HI = 5.3, X0 = 20, X1 = 540;
    function px(s) { var l = Math.log10(Math.max(s, 1e-10)); return X0 + (X1 - X0) * (Math.min(HI, Math.max(LO, l)) - LO) / (HI - LO); }
    function paint() {
      var n = parseInt(selN.value, 10), art = selArt.value, t = TEMPI.filter(function (x) { return x.id === selT.value; })[0];
      var steps = art === 'ein' ? n : paare(n), s = steps / t.rate;
      msg.textContent = zahl(steps) + ' Schritte bei ' + zahl(t.rate / 1e6) + ' Mio. je Sekunde ergeben etwa ' + fmtZeit(s) + '. ' + einordnung(s);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(sv('line', { x1: X0, y1: 52, x2: X1, y2: 52, class: 'v13-axis' }));
      MARKEN.forEach(function (m, i) {
        var x = X0 + (X1 - X0) * (m[0] - LO) / (HI - LO);
        svg.appendChild(sv('line', { x1: x, y1: 46, x2: x, y2: 58, class: 'v13-axis' }));
        svg.appendChild(sv('text', { x: x, y: 76 + (i % 2) * 0, 'text-anchor': 'middle', class: 'v13-tick' }, m[1]));
      });
      var xr = px(s);
      svg.appendChild(sv('line', { x1: xr, y1: 14, x2: xr, y2: 52, class: 'v13-mark' }));
      svg.appendChild(sv('circle', { cx: xr, cy: 52, r: 6, class: 'v13-dot v13-dot--b' }));
      svg.appendChild(sv('text', { x: Math.min(Math.max(xr, 60), 500), y: 10, 'text-anchor': 'middle', class: 'v13-tick v13-tick--b' }, fmtZeit(s)));
    }
    [selArt, selN, selT].forEach(function (s) { s.addEventListener('change', paint); });
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Messreihe: Messungen schwanken
     ══════════════════════════════════════════════════════════ */
  var START_MESSUNGEN = [52.4, 51.8, 53.1, 51.7, 88.6, 52.3, 51.9, 52.6, 119.3, 52.0];
  function initMessreihe(host) {
    var werte = START_MESSUNGEN.slice(), rnd = mulberry32(13), show = { min: true, med: true, avg: true };
    var bMore = el('button', { type: 'button', class: 'k-btn k-btn--small', text: '10 weitere Messungen simulieren' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    host.appendChild(el('div', { class: 'k-presets v13-ctl', role: 'group', 'aria-label': 'Messreihe steuern' }, [bMore, bReset]));
    var checks = el('div', { class: 'v13-checks', role: 'group', 'aria-label': 'Kennwerte einblenden' });
    [['min', 'Minimum'], ['med', 'Median'], ['avg', 'Mittelwert']].forEach(function (c) {
      var cid = nextId('v13-c-');
      var cb = el('input', { type: 'checkbox', id: cid, checked: 'checked' });
      cb.addEventListener('change', function () { show[c[0]] = cb.checked; paint(); });
      checks.appendChild(el('label', { class: 'v13-check v13-check--' + c[0], for: cid }, [cb, ' ' + c[1]]));
    });
    host.appendChild(checks);
    var msg = el('p', { class: 'v13-msg is-on', role: 'status', 'aria-live': 'polite' });
    var svg = sv('svg', { class: 'v13-dots', viewBox: '0 0 560 150', role: 'img', 'aria-label': 'Punktdiagramm der gemessenen Zeiten in Millisekunden mit Minimum, Median und Mittelwert.' });
    var tbl = el('div', { class: 'v13-stats' });
    host.appendChild(msg); host.appendChild(el('div', { class: 'v13-chartwrap' }, [svg])); host.appendChild(tbl);
    host.appendChild(el('p', { class: 'v13-note k-small k-muted', text: 'Die Startreihe ist ein erfundenes, aber typisches Beispiel: dieselbe Rechnung zehnmal gemessen. Die weiteren Messungen sind simuliert (Grundzeit etwa 52 ms, gelegentlich ein Ausreißer). Auf deinem Rechner siehst du das Muster selbst, wenn du den Messblock im Abschnitt „Ausprobieren“ mehrfach ausführst.' }));
    function paint() {
      var mn = minimum(werte), md = median(werte), av = mittel(werte), mx = maximum(werte), X0 = 24, X1 = 536, lo = Math.floor(mn - 5), hi = Math.ceil(mx + 5);
      function x(v) { return X0 + (X1 - X0) * (v - lo) / (hi - lo); }
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(sv('line', { x1: X0, y1: 112, x2: X1, y2: 112, class: 'v13-axis' }));
      var step = hi - lo > 100 ? 20 : 10, v;
      for (v = Math.ceil(lo / step) * step; v <= hi; v += step) {
        svg.appendChild(sv('line', { x1: x(v), y1: 108, x2: x(v), y2: 116, class: 'v13-axis' }));
        svg.appendChild(sv('text', { x: x(v), y: 132, 'text-anchor': 'middle', class: 'v13-tick' }, String(v)));
      }
      svg.appendChild(sv('text', { x: X1, y: 148, 'text-anchor': 'end', class: 'v13-tick' }, 'gemessene Zeit in ms'));
      var seen = {};
      werte.forEach(function (w) {
        var key = Math.round(w), k = seen[key] || 0; seen[key] = k + 1;
        svg.appendChild(sv('circle', { cx: x(w), cy: 100 - (k % 6) * 11, r: 4.5, class: 'v13-pt' }));
      });
      [['min', mn, 'Min'], ['med', md, 'Median'], ['avg', av, 'Mittel']].forEach(function (m, i) {
        if (!show[m[0]]) return;
        svg.appendChild(sv('line', { x1: x(m[1]), y1: 14, x2: x(m[1]), y2: 112, class: 'v13-ref v13-ref--' + m[0] }));
        svg.appendChild(sv('text', { x: x(m[1]) + 4, y: 20 + i * 12, class: 'v13-tick v13-tick--' + m[0] }, m[2]));
      });
      tbl.innerHTML = '';
      tbl.appendChild(el('dl', { class: 'v13-dl' }, [
        el('div', {}, [el('dt', { text: 'Messungen' }), el('dd', { text: String(werte.length) })]),
        el('div', {}, [el('dt', { text: 'Minimum' }), el('dd', { text: zahl(mn, 4) + ' ms' })]),
        el('div', {}, [el('dt', { text: 'Median' }), el('dd', { text: zahl(md, 4) + ' ms' })]),
        el('div', {}, [el('dt', { text: 'Mittelwert' }), el('dd', { text: zahl(av, 4) + ' ms' })]),
        el('div', {}, [el('dt', { text: 'Maximum' }), el('dd', { text: zahl(mx, 4) + ' ms' })])
      ]));
      msg.textContent = 'Dieselbe Rechnung, ' + werte.length + ' Messungen: von ' + zahl(mn, 4) + ' bis ' + zahl(mx, 4) + ' ms. Der Mittelwert liegt ' + zahl(av - mn, 2) + ' ms über dem Minimum, weil einzelne Ausreißer (andere Programme, kalter Zwischenspeicher, Taktänderung der CPU) mitzählen. Der Median ignoriert sie fast, das Minimum zeigt, was der Rechner bei Ruhe kann.';
    }
    bMore.addEventListener('click', function () { var i; for (i = 0; i < 10; i++) werte.push(simuliereMessung(rnd, 52)); paint(); });
    bReset.addEventListener('click', function () { werte = START_MESSUNGEN.slice(); rnd = mulberry32(13); paint(); });
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (E) PAP-Vergleich: Schleife gegen einzeiligen Ausdruck
     ══════════════════════════════════════════════════════════ */
  function initPapVergleich(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var schleife = [
      P.start(), P.op('summe = 0'), P.op('i = 0'),
      P.whil('i < N?', [P.op('v = A · sin(2π · f · i / fs)'), P.op('summe = summe + v · v'), P.op('i = i + 1')]),
      P.op('rms = Wurzel(summe / N)'), P.io('Ausgabe: rms'), P.end()
    ];
    var vektor = [
      P.start(), P.op('t = np.arange(N) / fs'), P.op('v = A * np.sin(2π * f * t)'),
      P.op('rms = np.sqrt(np.mean(v ** 2))'), P.io('Ausgabe: rms'), P.end()
    ];
    var a = el('div', { class: 'v13-papbox' }, [el('p', { class: 'v13-lane__t' }, [el('strong', { text: 'Schleifen-Variante (Zählschleife über alle Messpunkte)' })])]);
    var b = el('div', { class: 'v13-papbox' }, [el('p', { class: 'v13-lane__t' }, [el('strong', { text: 'NumPy-Variante (drei Rechtecke, keine Schleife im Plan)' })])]);
    var fa = el('div', {}), fb = el('div', {});
    fa.innerHTML = K.figure(schleife, { label: 'Programmablaufplan der Schleifen-Variante: Summe und Zähler auf null setzen, solange der Zähler kleiner als N ist den Messwert berechnen, sein Quadrat aufsummieren und den Zähler erhöhen, danach die Wurzel aus Summe durch N bilden und ausgeben.' });
    fb.innerHTML = K.figure(vektor, { label: 'Programmablaufplan der NumPy-Variante: Zeitachse und Schwingung als Arrays berechnen, den Effektivwert mit einem Ausdruck bestimmen und ausgeben.' });
    a.appendChild(fa); b.appendChild(fb);
    host.appendChild(el('div', { class: 'v13-papgrid' }, [a, b]));
  }

  function init() {
    var map = { schritte: initSchritte, vektor: initVektor, ueberschlag: initUeberschlag, messreihe: initMessreihe, 'pap-vergleich': initPapVergleich };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
