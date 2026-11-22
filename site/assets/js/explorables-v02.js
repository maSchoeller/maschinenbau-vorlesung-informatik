/* =============================================================
   explorables-v02.js – interaktive Bausteine für V02 (reines JS, kein Framework)
   (A) Bit-Schalter: 8/16 Bit anklickbar, Anzeige dezimal (ohne/mit Vorzeichen) und hex
   (B) Überlauf-Zähler: 16-Bit-Zähler, Impulse addieren, Wrap-around sichtbar
   (C) Divisionsrestverfahren: Zerlegung Schritt für Schritt, Reste von unten nach oben lesen
   (D) Zahlenkreis: 4-Bit-Register als Uhr, außen ohne, innen mit Vorzeichen
   Der Rechenkern ist ohne DOM per node testbar (siehe module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern ────────────────────────────────────────────────── */
  function size(n) { return Math.pow(2, n); }
  function toUnsigned(v, n) { var m = size(n); return ((v % m) + m) % m; }
  function toSigned(u, n) { return u >= size(n - 1) ? u - size(n) : u; }
  function interpret(u, n, signed) { return signed ? toSigned(u, n) : u; }
  function pad(s, len) { while (s.length < len) s = '0' + s; return s; }
  function hexString(u, n) { return '0x' + pad(u.toString(16).toUpperCase(), n / 4); }
  function binString(u, n) { return pad(u.toString(2), n).replace(/(.{4})(?=.)/g, '$1 '); }
  function range(n, signed) { return signed ? { min: -size(n - 1), max: size(n - 1) - 1 } : { min: 0, max: size(n) - 1 }; }
  /* Rechnung der Stellenwerte als Text, z. B. "128 + 32 + 4 + 1 = 165" */
  function sumText(u, n, signed) {
    var parts = [], total = 0;
    for (var i = n - 1; i >= 0; i--) {
      if (Math.floor(u / size(i)) % 2 === 1) {
        var w = (signed && i === n - 1) ? -size(i) : size(i);
        parts.push(w); total += w;
      }
    }
    if (!parts.length) return '0';
    var txt = parts.map(function (w, k) { return k === 0 ? String(w) : (w < 0 ? '− ' + (-w) : '+ ' + w); }).join(' ').replace(/^-/, '−');
    if (parts.length === 1) return txt;
    return txt + ' = ' + String(total).replace('-', '−');
  }
  /* Wie viele Grenzübergänge (Überläufe) hat ein Zähler mit wahrem Stand t schon hinter sich? */
  function wraps(t, n, signed) { return Math.floor((t + (signed ? size(n - 1) : 0)) / size(n)); }
  /* Stellen, an denen die Anzeige springt, im Intervall (a, b] */
  function wrapPoints(a, b, n, signed) {
    var off = signed ? size(n - 1) : 0, out = [];
    var k = Math.floor((a + off) / size(n)) + 1;
    for (var p = k * size(n) - off; p <= b; p += size(n)) out.push(p);
    return out;
  }
  /* Eingabe einlesen: ganze Zahl (dezimal), 0x.. (hex), 0b.. (binär). null bei Unsinn. */
  function parseInt2(txt) {
    var t = String(txt).trim().replace(/[\s_]/g, '');
    if (/^[-+]?0x[0-9a-f]+$/i.test(t)) return parseInt(t.replace(/0x/i, ''), 16);
    if (/^[-+]?0b[01]+$/i.test(t)) return parseInt(t.replace(/0b/i, ''), 2);
    if (!/^[-+]?\d+$/.test(t)) return null;
    var v = parseInt(t, 10);
    return isFinite(v) ? v : null;
  }
  function fmtMm(v) { return (Math.round(v * 100) / 100).toLocaleString('de-DE', { maximumFractionDigits: 2 }).replace('-', '−'); }
  function fmt(v) { return String(v).replace('-', '−').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  var api = { fmtMm: fmtMm, size: size, toUnsigned: toUnsigned, toSigned: toSigned, interpret: interpret, hexString: hexString, binString: binString,
    range: range, sumText: sumText, wraps: wraps, wrapPoints: wrapPoints, parseInt2: parseInt2, fmt: fmt };
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

  /* ── (A) Bit-Schalter ────────────────────────────────────── */
  function initBits(host) {
    var id = 'bits' + (++uid);
    var n = 8, signed = false, u = 0, note = '';
    var seg1 = segment(['8 Bit', '16 Bit'], 'Breite', 0, function (i) { n = i ? 16 : 8; u = toUnsigned(u, n); note = ''; input.value = String(interpret(u, n, signed)); render(); });
    var seg2 = segment(['ohne Vorzeichen', 'mit Vorzeichen'], 'Deutung der Bits', 0, function (i) { signed = i === 1; note = ''; input.value = String(interpret(u, n, signed)); render(); });
    var input = el('input', { type: 'text', id: id + '-in', value: '0', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false' });
    var field = el('div', { class: 'k-field' }, [el('label', { 'for': input.id, text: 'Zahl eingeben (dezimal, 0x.. oder 0b..)' }), input]);
    host.appendChild(el('div', { class: 'k-controls' }, [
      el('div', { class: 'k-field' }, [el('span', { text: 'Breite' }), seg1]),
      el('div', { class: 'k-field' }, [el('span', { text: 'Deutung der Bits' }), seg2]),
      field
    ]));
    var presets = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispielwerte' });
    ['0', '1', '5', '-5', '127', '128', '255', '-1', '300', '32767', '65535'].forEach(function (p) { presets.appendChild(el('button', { type: 'button', class: 'k-chip', 'data-v': p, text: p.replace('-', '−') })); });
    host.appendChild(presets);
    var acts = el('div', { class: 'k-presets v02-acts', role: 'group', 'aria-label': 'Aktionen auf alle Bits' });
    var bInv = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Alle Bits invertieren' });
    var bInc = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: '+ 1' });
    var bClr = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Auf 0 setzen' });
    [bInv, bInc, bClr].forEach(function (b) { acts.appendChild(b); });
    host.appendChild(acts);
    var cells = el('div', { class: 'v02-nibbles' });
    var out = el('div', { class: 'k-readout' });
    var live = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var hint = el('p', { class: 'k-small k-muted', text: 'Tipp: Stell eine kleine positive Zahl ein (z. B. 5), klick „Alle Bits invertieren“ und dann „+ 1“. Du hast gerade das Zweierkomplement gebildet: Welche Zahl steht jetzt mit Vorzeichen da?' });
    host.appendChild(cells); host.appendChild(out); host.appendChild(live); host.appendChild(hint);

    function setU(v, keepFocusIdx) { u = toUnsigned(v, n); note = ''; input.value = String(interpret(u, n, signed)); render(keepFocusIdx); }
    function render(focusIdx) {
      cells.innerHTML = '';
      var nib = n / 4;
      for (var g = 0; g < nib; g++) {
        var hexDigit = Math.floor(u / size(4 * (nib - 1 - g))) % 16;
        var grp = el('div', { class: 'v02-nib' });
        grp.appendChild(el('span', { class: 'v02-nib__hex', 'aria-hidden': 'true', text: hexDigit.toString(16).toUpperCase() }));
        var row = el('div', { class: 'v02-nib__bits' });
        for (var k = 3; k >= 0; k--) {
          (function (pos) {
            var on = Math.floor(u / size(pos)) % 2 === 1;
            var isSign = signed && pos === n - 1;
            var w = isSign ? -size(pos) : size(pos);
            var cell = el('div', { class: 'v02-bit' });
            var b = el('button', { type: 'button', class: 'k-bit ' + (isSign ? 'k-bit--e' : 'k-bit--m'), 'aria-pressed': on ? 'true' : 'false',
              'aria-label': 'Bit ' + pos + ', Stellenwert ' + String(w).replace('-', 'minus ') + ', Wert ' + (on ? 1 : 0), 'data-pos': String(pos), text: on ? '1' : '0' });
            b.addEventListener('click', function () {
              setU(on ? u - size(pos) : u + size(pos), pos);
            });
            cell.appendChild(b);
            cell.appendChild(el('span', { class: 'v02-bit__w', 'aria-hidden': 'true', text: String(w).replace('-', '−') }));
            row.appendChild(cell);
          })(4 * (nib - 1 - g) + k);
        }
        grp.appendChild(row);
        cells.appendChild(grp);
      }
      if (typeof focusIdx === 'number') { var again = cells.querySelector('button[data-pos="' + focusIdx + '"]'); if (again) again.focus(); }

      var dl = el('dl');
      function r(k, v, big) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: v })); }
      var us = u, sg = toSigned(u, n);
      r('Dezimal, ohne Vorzeichen', fmt(us), !signed);
      r('Dezimal, mit Vorzeichen', fmt(sg), signed);
      r('Hex', hexString(u, n));
      r('Rechnung', sumText(u, n, signed));
      var rg = range(n, signed);
      r('Wertebereich', fmt(rg.min) + ' bis ' + fmt(rg.max) + '  (2^' + n + ' = ' + fmt(size(n)) + ' Werte)');
      if (note) r('Hinweis', note);
      out.innerHTML = ''; out.appendChild(dl);
      live.textContent = 'Dezimal ' + (signed ? sg : us) + ', Hex ' + hexString(u, n) + (note ? '. ' + note : '');
    }
    function apply() {
      var v = parseInt2(input.value);
      if (v === null) { out.innerHTML = ''; out.appendChild(el('p', { text: 'Das lese ich nicht als ganze Zahl. Probier 5, −5, 0xFF oder 0b1010.' })); return; }
      var rg = range(n, signed);
      u = toUnsigned(v, n);
      note = (v < rg.min || v > rg.max) ? fmt(v) + ' passt nicht in ' + n + ' Bit (' + (signed ? 'mit' : 'ohne') + ' Vorzeichen). Es bleibt der Rest nach Modulo 2^' + n + ': Überlauf, gespeichert wird ' + fmt(interpret(u, n, signed)) + '.' : '';
      render();
    }
    input.addEventListener('input', apply);
    presets.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; input.value = b.getAttribute('data-v'); apply(); });
    bInv.addEventListener('click', function () { setU(size(n) - 1 - u); });
    bInc.addEventListener('click', function () {
      var before = u;
      setU(u + 1);
      if (before === size(n) - 1) { note = 'Überlauf: alle Bits waren 1, + 1 ergibt wieder 0 (der Übertrag fällt heraus).'; render(); }
      else if (signed && before === size(n - 1) - 1) { note = 'Überlauf: größte positive Zahl + 1 ergibt die kleinste negative.'; render(); }
    });
    bClr.addEventListener('click', function () { setU(0); });
    render();
  }

  /* ── (B) Überlauf-Zähler ─────────────────────────────────── */
  function initCounter(host) {
    var N = 16, IMP = 1024, PITCH = 5;   // Impulse pro Umdrehung, Spindelsteigung in mm
    var signed = false, t = size(N) - 6, last = '';
    var seg = segment(['ohne Vorzeichen (0 … 65 535)', 'mit Vorzeichen (−32 768 … 32 767)'], 'Zählertyp', 0, function (i) {
      signed = i === 1; t = signed ? size(N - 1) - 6 : size(N) - 6; last = ''; draw();
    });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { text: 'Zählertyp der SPS' }), seg])]));
    var adds = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Impulse hinzufügen' });
    [['+ 1', 1], ['+ 10', 10], ['+ 1 000', 1000], ['+ 10 000', 10000], ['− 1', -1]].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p[0].replace('-', '−') });
      b.addEventListener('click', function () { add(p[1]); });
      adds.appendChild(b);
    });
    var reset = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Kurz vor die Grenze setzen' });
    reset.addEventListener('click', function () { t = signed ? size(N - 1) - 6 : size(N) - 6; last = ''; draw(); });
    adds.appendChild(reset);
    host.appendChild(adds);
    var msg = el('p', { class: 'v02-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var big = el('div', { class: 'v02-counter', 'aria-hidden': 'true' });
    host.appendChild(big);
    var svg = S('svg', { viewBox: '0 0 640 280', class: 'k-chart', role: 'img' });
    host.appendChild(svg);
    host.appendChild(el('div', { class: 'k-legend' }, [
      el('span', {}, [Object.assign(el('i'), { style: 'background:#B50016' }), 'Anzeige der SPS']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#6B7280' }), 'wahre Impulszahl'])
    ]));
    var out = el('div', { class: 'k-readout' });
    host.appendChild(out);

    function shown(tt) { return interpret(toUnsigned(tt, N), N, signed); }
    function pos(v) { return v / IMP * PITCH; }
    function add(k) {
      var before = shown(t), w0 = wraps(t, N, signed);
      t += k;
      var after = shown(t), w1 = wraps(t, N, signed);
      if (w1 !== w0) {
        last = (k > 0 ? 'Überlauf' : 'Unterlauf') + ': Die Anzeige springt von ' + fmt(before) + ' auf ' + fmt(after) + '. Die berechnete Position springt um ' + fmtMm(pos(after) - pos(before)) + ' mm.';
      } else { last = ''; }
      draw();
    }
    function draw() {
      var v = shown(t), rg = range(N, signed);
      var w = wraps(t, N, signed);
      msg.textContent = last;
      msg.className = 'v02-msg' + (last ? ' is-on' : '');
      big.textContent = fmt(v);
      // Diagramm
      var W = 640, H = 280, L = 70, R = 14, T0 = 14, B = 34, pw = W - L - R, ph = H - T0 - B;
      var lo = Math.min(0, t) - (t < 0 ? size(N) * 0.05 : 0), hi = Math.max(t, size(N)) * 1.03;
      if (signed) { lo = Math.min(-size(N - 1), t); hi = Math.max(t, size(N)) * 1.03; }
      var X = function (x) { return L + pw * (x - lo) / (hi - lo); };
      var yTop = rg.max + (rg.max - rg.min) * 0.05, yBot = rg.min - (rg.max - rg.min) * 0.05;
      var Y = function (y) { return T0 + ph * (1 - (y - yBot) / (yTop - yBot)); };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var clip = S('clipPath', { id: 'v02clip' }); clip.appendChild(S('rect', { x: L, y: T0, width: pw, height: ph })); svg.appendChild(clip);
      [rg.min, rg.max, 0].forEach(function (yy) {
        svg.appendChild(S('line', { x1: L, x2: W - R, y1: Y(yy), y2: Y(yy), stroke: yy === 0 ? '#6B7280' : '#E5E7EB' }));
        svg.appendChild(S('text', { x: L - 6, y: Y(yy) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#4B5563' }, fmt(yy)));
      });
      var g = S('g', { 'clip-path': 'url(#v02clip)' });
      g.appendChild(S('line', { x1: X(lo), y1: Y(lo), x2: X(hi), y2: Y(hi), stroke: '#6B7280', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
      var pts = [[lo, shown(lo)]];
      wrapPoints(lo, hi, N, signed).forEach(function (p) { pts.push([p - 0.001, shown(p - 1)]); pts.push([p, shown(p)]); });
      pts.push([hi, shown(hi)]);
      g.appendChild(S('polyline', { points: pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '), fill: 'none', stroke: '#B50016', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
      svg.appendChild(g);
      svg.appendChild(S('circle', { cx: X(t), cy: Y(v), r: 6, fill: '#B50016', stroke: '#fff', 'stroke-width': 2 }));
      svg.appendChild(S('line', { x1: L, x2: L, y1: T0, y2: H - B, stroke: '#6B7280' }));
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, stroke: '#6B7280' }));
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
        var xv = lo + (hi - lo) * f;
        svg.appendChild(S('text', { x: L + pw * f, y: H - B + 16, 'text-anchor': f === 0 ? 'start' : (f === 1 ? 'end' : 'middle'), 'font-size': 11, fill: '#4B5563' }, fmt(Math.round(xv / 1000) * 1000)));
      });
      svg.appendChild(S('text', { x: L + pw / 2, y: H - 3, 'text-anchor': 'middle', 'font-size': 12, fill: '#1A1A1A' }, 'wahre Impulszahl seit dem Start'));
      svg.appendChild(S('text', { x: 12, y: T0 + ph / 2, 'text-anchor': 'middle', 'font-size': 12, fill: '#1A1A1A', transform: 'rotate(-90 12 ' + (T0 + ph / 2) + ')' }, 'Anzeige'));
      svg.setAttribute('aria-label', 'Diagramm: Die Anzeige des ' + (signed ? '16-Bit-Zählers mit' : '16-Bit-Zählers ohne') + ' Vorzeichen als Sägezahn über der wahren Impulszahl. Aktuell wahre Impulszahl ' + t + ', Anzeige ' + v + '.');
      // Anzeige in Zahlen
      var dl = el('dl');
      function r(k, val, bg) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { class: bg ? 'k-big' : '', text: val })); }
      r('Anzeige der SPS', fmt(v), true);
      r('Wahre Impulszahl', fmt(t));
      r('Binär / Hex', binString(toUnsigned(t, N), N) + '  /  ' + hexString(toUnsigned(t, N), N));
      r('Überläufe bisher', String(w).replace('-', '−') + (w < 0 ? ' (Unterläufe)' : ''));
      r('Berechnete Position', fmtMm(pos(v)) + ' mm  (Anzeige / ' + IMP + ' × ' + PITCH + ' mm)');
      r('Wahre Position', fmtMm(pos(t)) + ' mm');
      var err = Math.round((pos(v) - pos(t)) * 100) / 100;
      r('Positionsfehler', err === 0 ? '0 mm' : fmtMm(err) + ' mm  (' + Math.abs(w) + ' × ' + fmtMm(pos(size(N))) + ' mm)');
      out.innerHTML = ''; out.appendChild(dl);
    }
    draw();
  }

  /* ── (C) Divisionsrestverfahren Schritt für Schritt ──────── */
  /* Schritte der Zerlegung: [{q, next, r}], die Reste von unten nach oben ergeben die Ziffern */
  function restSteps(n, base) {
    var st = [], q = n;
    if (q === 0) return [{ q: 0, next: 0, r: 0 }];
    while (q > 0) { st.push({ q: q, next: Math.floor(q / base), r: q % base }); q = Math.floor(q / base); }
    return st;
  }
  function digitChar(r) { return r.toString(16).toUpperCase(); }

  function initRest(host) {
    var id = 'rest' + (++uid);
    var base = 2, n = 37, st = restSteps(n, base), shown = 0;
    host.textContent = '';
    var input = el('input', { type: 'text', id: id + '-in', value: '37', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false', size: '8' });
    var seg = segment(['nach Binär (Basis 2)', 'nach Hex (Basis 16)'], 'Zielsystem', 0, function (i) { base = i ? 16 : 2; restart(); });
    host.appendChild(el('div', { class: 'k-controls' }, [
      el('div', { class: 'k-field' }, [el('label', { 'for': input.id, text: 'Dezimalzahl (0 bis 65 535)' }), input]),
      el('div', { class: 'k-field' }, [el('span', { text: 'Umrechnen' }), seg])
    ]));
    var presets = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispielzahlen' });
    ['37', '165', '255', '500', '1000'].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p });
      b.addEventListener('click', function () { input.value = p; restart(); });
      presets.appendChild(b);
    });
    host.appendChild(presets);
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bAll = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Alle Schritte' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Von vorn' });
    host.appendChild(el('div', { class: 'k-presets v02-rest__acts' }, [bNext, bAll, bReset]));
    var msg = el('p', { class: 'v02-rest__msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var tableWrap = el('div', { class: 'k-tablewrap' });
    host.appendChild(tableWrap);
    var result = el('div', { class: 'v02-rest__result', 'aria-live': 'polite' });
    host.appendChild(result);

    function restart() {
      var v = parseInt(String(input.value).replace(/\s/g, ''), 10);
      if (isNaN(v) || v < 0 || v > 65535 || !/^\s*\d[\d\s]*$/.test(input.value)) {
        st = []; shown = 0; msg.textContent = 'Bitte eine ganze Zahl von 0 bis 65 535 eingeben.'; tableWrap.innerHTML = ''; result.innerHTML = ''; syncButtons(); return;
      }
      n = v; st = restSteps(n, base); shown = 0; render();
    }
    function syncButtons() {
      var done = !st.length || shown >= st.length;
      bNext.disabled = done; bAll.disabled = done;
    }
    function render() {
      var b = base;
      var tbl = el('table', { class: 'k-types v02-rest__table' });
      tbl.appendChild(el('caption', { class: 'k-sr', text: 'Divisionsrestverfahren für ' + n + ' zur Basis ' + b }));
      var head = el('tr', {}, [el('th', { scope: 'col', text: 'Rechnung' }), el('th', { scope: 'col', text: 'Ergebnis' }), el('th', { scope: 'col', text: 'Rest' }), el('th', { scope: 'col', text: 'wird zur Ziffer' })]);
      var done = shown >= st.length;
      if (done) head.appendChild(el('th', { scope: 'col', class: 'v02-rest__readhead', text: 'lesen' }));
      tbl.appendChild(el('thead', {}, [head]));
      var body = el('tbody');
      for (var i = 0; i < shown; i++) {
        var s = st[i];
        var place = 'Stelle ' + i + (i === 0 ? ' (ganz rechts)' : '') + (i === st.length - 1 && i > 0 ? ' (ganz links)' : '');
        var rest = b === 16 && s.r > 9 ? s.r + ' (' + digitChar(s.r) + ')' : String(s.r);
        var tr = el('tr', { class: i === shown - 1 && !done ? 'is-cur' : '' }, [
          el('td', { text: s.q + ' : ' + b }), el('td', { text: String(s.next) }), el('td', { class: 'v02-rest__r', text: rest }), el('td', { class: 'k-muted', text: place })
        ]);
        if (done && i === 0) {
          var arrowCell = el('td', { class: 'v02-rest__arrow', rowspan: String(st.length), 'aria-label': 'von unten nach oben lesen' });
          arrowCell.appendChild(el('span', { 'aria-hidden': 'true' }));
          tr.appendChild(arrowCell);
        }
        body.appendChild(tr);
      }
      tbl.appendChild(body);
      tableWrap.innerHTML = '';
      if (shown > 0) tableWrap.appendChild(tbl);
      result.innerHTML = '';
      if (shown === 0) {
        msg.textContent = 'Drück „Nächster Schritt“: Teile ' + n + ' ganzzahlig durch ' + b + ' und notiere den Rest.';
      } else if (!done) {
        var c = st[shown - 1];
        msg.textContent = c.q + ' : ' + b + ' = ' + c.next + ' Rest ' + c.r + '. In Python: ' + c.q + ' // ' + b + ' ergibt ' + c.next + ', ' + c.q + ' % ' + b + ' ergibt ' + c.r + '. Weiter mit ' + c.next + '.';
      } else {
        msg.textContent = 'Das Ergebnis ist 0, fertig. Jetzt die Reste von unten nach oben lesen.';
        var digits = st.slice().reverse().map(function (s) { return digitChar(s.r); });
        var word = digits.join('');
        var chips = el('span', { class: 'v02-rest__digits' }, digits.map(function (d) { return el('b', { text: d }); }));
        var pre = b === 2 ? '0b' : '0x';
        var terms = [];
        st.forEach(function (s, i) { if (s.r) terms.unshift((b === 2 ? '' : s.r + ' · ') + Math.pow(b, i)); });
        var probe = (terms.length ? terms.join(' + ') : '0') + ' = ' + n;
        result.appendChild(el('p', {}, [el('strong', { text: 'Ergebnis: ' }), chips, el('span', { class: 'v02-rest__py', text: ' also ' + pre + word.toLowerCase() + ' in Python-Schreibweise' })]));
        result.appendChild(el('p', { class: 'k-small' }, [el('strong', { text: 'Probe: ' }), probe]));
      }
      syncButtons();
    }
    bNext.addEventListener('click', function () { if (shown < st.length) { shown++; render(); } });
    bAll.addEventListener('click', function () { shown = st.length; render(); });
    bReset.addEventListener('click', function () { shown = 0; render(); });
    input.addEventListener('change', restart);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); restart(); } });
    render();
  }

  /* ── (D) Zahlenkreis: 4-Bit-Register als Uhr ─────────────── */
  function initKreis(host) {
    var N = 4, M = size(N), STEP = 360 / M;
    var C = 220, R1 = 150, R2 = 198, R3 = 98, R4 = 146;
    var pos = 11, turn = pos * STEP, last = '';
    host.textContent = '';
    var acts = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Zähler bewegen' });
    [['− 1', -1], ['+ 1', 1], ['+ 5', 5]].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p[0] });
      b.addEventListener('click', function () { move(p[1]); });
      acts.appendChild(b);
    });
    var jumps = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Zahl einstellen' });
    [['0', 0], ['7', 7], ['8', 8], ['15', 15], ['−5', -5], ['−1', -1]].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p[0] });
      b.addEventListener('click', function () { var u = toUnsigned(p[1], N); var d = u - pos; turn += d * STEP; pos = u; last = ''; draw(); });
      jumps.appendChild(b);
    });
    host.appendChild(el('div', { class: 'k-controls' }, [
      el('div', { class: 'k-field' }, [el('span', { text: 'Zähler bewegen' }), acts]),
      el('div', { class: 'k-field' }, [el('span', { text: 'Zahl einstellen' }), jumps])
    ]));
    var wrap = el('div', { class: 'v02-kreis' });
    var svg = S('svg', { viewBox: '0 0 440 440', class: 'v02-kreis__svg', role: 'img' });
    wrap.appendChild(svg);
    var side = el('div', { class: 'v02-kreis__side' });
    var msg = el('p', { class: 'v02-msg', role: 'status', 'aria-live': 'polite' });
    var out = el('div', { class: 'k-readout' });
    side.appendChild(out); side.appendChild(msg);
    side.appendChild(el('ul', { class: 'v02-kreis__legend k-small' }, [
      el('li', {}, [el('i', { class: 'v02-kreis__sw v02-kreis__sw--out' }), 'Außen: ohne Vorzeichen, 0 bis 15']),
      el('li', {}, [el('i', { class: 'v02-kreis__sw v02-kreis__sw--in' }), 'Innen: mit Vorzeichen, −8 bis 7 (unten negativ)']),
      el('li', {}, [el('i', { class: 'v02-kreis__sw v02-kreis__sw--seam' }), 'Rote Nahtstellen: Hier läuft der Zähler über'])
    ]));
    wrap.appendChild(side);
    host.appendChild(wrap);

    function pt(r, deg) { var a = (deg - 90) * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
    function sector(rIn, rOut, k) {
      var a0 = (k - 0.5) * STEP, a1 = (k + 0.5) * STEP;
      var p0 = pt(rOut, a0), p1 = pt(rOut, a1), p2 = pt(rIn, a1), p3 = pt(rIn, a0);
      return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + rOut + ' ' + rOut + ' 0 0 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
        'L' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) + 'A' + rIn + ' ' + rIn + ' 0 0 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + 'Z';
    }
    function seam(rIn, rOut, deg) { var a = pt(rIn - 6, deg), b = pt(rOut + 6, deg); return S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'v02-kreis__seam' }); }
    function move(d) {
      var u0 = pos, s0 = toSigned(pos, N), msgs = [];
      var rawU = u0 + d, rawS = s0 + d;
      if (rawU > M - 1 || rawU < 0) msgs.push('Überlauf ohne Vorzeichen: ' + u0 + (d < 0 ? ' − ' + (-d) : ' + ' + d) + ' springt auf ' + toUnsigned(rawU, N) + '.');
      if (rawS > M / 2 - 1 || rawS < -M / 2) msgs.push('Überlauf mit Vorzeichen: ' + fmt(s0) + (d < 0 ? ' − ' + (-d) : ' + ' + d) + ' springt auf ' + fmt(toSigned(toUnsigned(rawS, N), N)) + '.');
      pos = toUnsigned(rawU, N); turn += d * STEP; last = msgs.join(' ');
      draw();
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      for (var k = 0; k < M; k++) {
        var cur = k === pos, neg = k >= M / 2;
        svg.appendChild(S('path', { d: sector(R1, R2, k), class: 'v02-kreis__seg' + (cur ? ' is-cur' : '') }));
        svg.appendChild(S('path', { d: sector(R3, R4, k), class: 'v02-kreis__seg v02-kreis__seg--in' + (neg ? ' is-neg' : '') + (cur ? ' is-cur' : '') }));
        var po = pt((R1 + R2) / 2, k * STEP), pi = pt((R3 + R4) / 2, k * STEP);
        svg.appendChild(S('text', { x: po[0], y: po[1] + 6, 'text-anchor': 'middle', class: 'v02-kreis__num' + (cur ? ' is-cur' : '') }, String(k)));
        svg.appendChild(S('text', { x: pi[0], y: pi[1] + 6, 'text-anchor': 'middle', class: 'v02-kreis__num v02-kreis__num--in' + (cur ? ' is-cur' : '') }, fmt(toSigned(k, N))));
      }
      svg.appendChild(seam(R1, R2, -STEP / 2));
      svg.appendChild(seam(R3, R4, (M / 2 - 0.5) * STEP));
      var l1 = pt(R2 + 16, -STEP / 2);
      svg.appendChild(S('text', { x: l1[0] - 4, y: l1[1] - 2, 'text-anchor': 'end', class: 'v02-kreis__note' }, '15 → 0'));
      var l2 = pt(R3 - 22, (M / 2 - 0.5) * STEP);
      svg.appendChild(S('text', { x: l2[0] + 4, y: l2[1] - 2, 'text-anchor': 'start', class: 'v02-kreis__note' }, '7 → −8'));
      var hand = S('g', { class: 'v02-kreis__hand' });
      hand.style.transform = 'rotate(' + turn + 'deg)';
      hand.appendChild(S('line', { x1: C, y1: C - 38, x2: C, y2: C - R3 + 8, class: 'v02-kreis__handline' }));
      hand.appendChild(S('path', { d: 'M' + (C - 7) + ' ' + (C - R3 + 16) + 'L' + C + ' ' + (C - R3 + 4) + 'L' + (C + 7) + ' ' + (C - R3 + 16) + 'Z', class: 'v02-kreis__handtip' }));
      svg.appendChild(hand);
      svg.appendChild(S('text', { x: C, y: C + 4, 'text-anchor': 'middle', class: 'v02-kreis__bits' }, pad(pos.toString(2), N)));
      svg.appendChild(S('text', { x: C, y: C + 26, 'text-anchor': 'middle', class: 'v02-kreis__bitslbl' }, 'Bitmuster'));
      svg.setAttribute('aria-label', 'Zahlenkreis für 4 Bit. Der Zeiger steht auf dem Bitmuster ' + pad(pos.toString(2), N) + ': ohne Vorzeichen ' + pos + ', mit Vorzeichen ' + fmt(toSigned(pos, N)) + '.');
      var dl = el('dl');
      function r(k, v, big) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: v })); }
      r('Bitmuster', pad(pos.toString(2), N), true);
      r('ohne Vorzeichen (außen)', String(pos));
      r('mit Vorzeichen (innen)', fmt(toSigned(pos, N)));
      if (pos >= M / 2) r('Zweierkomplement', fmt(toSigned(pos, N)) + ' liegt dort, wo außen ' + M + ' − ' + (M - pos) + ' = ' + pos + ' steht');
      out.innerHTML = ''; out.appendChild(dl);
      msg.textContent = last;
      msg.className = 'v02-msg' + (last ? ' is-on' : '');
    }
    draw();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="bitschalter"]'), initBits);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="ueberlauf"]'), initCounter);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="restverfahren"]'), initRest);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="zahlenkreis"]'), initKreis);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
