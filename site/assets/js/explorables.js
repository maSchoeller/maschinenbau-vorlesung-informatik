/* =============================================================
   explorables.js – interaktive Bausteine für V03 (reines JS, kein Framework)
   (A) Float-Lupe: Bits <-> exakter Wert, float64/float32
   (B) Fehler-Akkumulator: n-mal 0.1 addieren, float32 vs float64
   (C) Float-Lineal: Abstand benachbarter Zahlen wächst mit der Größe (Portalachse in µm)
   (D) Toleranzband: Messwert gegen Nennmaß ± Abmaß, Lupe auf die Grenze
   Der Rechenkern ist ohne DOM per node testbar (siehe module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  var FMT = {
    float64: { name: 'float64', width: 64, e: 11, m: 52, bias: 1023 },
    float32: { name: 'float32', width: 32, e: 8, m: 23, bias: 127 }
  };

  /* ── Kern: Bits <-> Wert ─────────────────────────────────── */
  function toBits(x, fmt) {
    var dv = new DataView(new ArrayBuffer(8));
    if (fmt.width === 64) { dv.setFloat64(0, x); return dv.getBigUint64(0); }
    dv.setFloat32(0, x); return BigInt(dv.getUint32(0));
  }
  function fromBits(bits, fmt) {
    var dv = new DataView(new ArrayBuffer(8));
    if (fmt.width === 64) { dv.setBigUint64(0, bits); return dv.getFloat64(0); }
    dv.setUint32(0, Number(bits)); return dv.getFloat32(0);
  }
  /* Zerlegt ein Bitmuster. value = (-1)^sign * M * 2^E (exakt, ganzzahliges M) */
  function decompose(bits, fmt) {
    var mBits = BigInt(fmt.m), eBits = BigInt(fmt.e);
    var mant = bits & ((1n << mBits) - 1n);
    var expo = (bits >> mBits) & ((1n << eBits) - 1n);
    var sign = Number(bits >> (mBits + eBits)) & 1;
    var expMax = (1n << eBits) - 1n;
    var out = { sign: sign, expRaw: Number(expo), mant: mant, bias: fmt.bias };
    if (expo === expMax) {
      out.kind = mant === 0n ? 'inf' : 'nan';
    } else if (expo === 0n) {
      out.kind = mant === 0n ? 'zero' : 'subnormal';
      out.M = mant; out.E = 1 - fmt.bias - fmt.m;
    } else {
      out.kind = 'normal';
      out.M = mant | (1n << mBits); out.E = Number(expo) - fmt.bias - fmt.m;
    }
    return out;
  }

  /* Exakte Dezimaldarstellung von M * 2^E als Ziffernstring (ohne Vorzeichen) */
  function exactDigits(M, E) {
    if (M === 0n) return { int: '0', frac: '' };
    if (E >= 0) return { int: (M << BigInt(E)).toString(), frac: '' };
    var k = BigInt(-E);
    var mask = (1n << k) - 1n;
    var ip = M >> k, fp = M & mask, frac = '';
    while (fp > 0n) { fp *= 10n; frac += (fp >> k).toString(); fp &= mask; }
    return { int: ip.toString(), frac: frac };
  }

  /* Anzeige: normal bis 60 Nachkommastellen, sehr große/kleine Werte wissenschaftlich */
  function exactString(d, maxFrac) {
    maxFrac = maxFrac || 60;
    if (d.kind === 'nan') return 'NaN (keine Zahl)';
    if (d.kind === 'inf') return (d.sign ? '−' : '+') + '∞ (Infinity)';
    var sgn = d.sign ? '−' : '';
    if (d.kind === 'zero') return sgn + '0';
    var dg = exactDigits(d.M, d.E);
    var lead = 0;
    if (dg.int === '0') { while (lead < dg.frac.length && dg.frac[lead] === '0') lead++; }
    if (dg.int.length > 22 || lead > 8) {
      var all = (dg.int === '0' ? '' : dg.int) + dg.frac;
      var firstNz = 0; while (all[firstNz] === '0') firstNz++;
      var sig = all.slice(firstNz).replace(/0+$/, '') || '0';
      var exp10 = dg.int === '0' ? -(lead + 1) : dg.int.length - 1;
      var shown = sig.slice(0, 40);
      return sgn + shown[0] + (shown.length > 1 ? '.' + shown.slice(1) : '') + (sig.length > 40 ? '…' : '') + ' × 10^' + exp10;
    }
    var frac = dg.frac, cut = false;
    if (frac.length > maxFrac) { frac = frac.slice(0, maxFrac); cut = true; }
    return sgn + dg.int + (frac ? '.' + frac : '') + (cut ? '…' : '');
  }

  /* Dezimal-Eingabe als exakter Bruch P / 10^q (oder null) */
  function parseDecimal(str) {
    var s = String(str).trim().replace(',', '.');
    var m = /^([-+]?)(\d*)\.?(\d*)(?:e([-+]?\d+))?$/i.exec(s);
    if (!m || (m[2] === '' && m[3] === '')) return null;
    var ex = m[4] ? parseInt(m[4], 10) : 0;
    if (Math.abs(ex) > 400) return null;
    var P = BigInt((m[2] || '0') + (m[3] || ''));
    var q = (m[3] || '').length - ex;
    if (q < 0) { P *= 10n ** BigInt(-q); q = 0; }
    return { neg: m[1] === '-', P: P, q: q };
  }

  /* Abweichung gespeichert − eingegeben, als String in Wissenschaftsnotation */
  function errorString(inputStr, d) {
    if (d.kind === 'nan' || d.kind === 'inf') return '–';
    var inp = parseDecimal(inputStr);
    if (!inp) return '–';
    var sM = (d.M === undefined ? 0n : d.M) * (d.sign ? -1n : 1n);
    var P = inp.neg ? -inp.P : inp.P;
    var ten = 10n ** BigInt(inp.q), num, den;
    if (d.kind === 'zero') { sM = 0n; }
    var E = d.E === undefined ? 0 : d.E;
    if (E >= 0) { num = (sM << BigInt(E)) * ten - P; den = ten; }
    else { var two = 1n << BigInt(-E); num = sM * ten - P * two; den = ten * two; }
    if (num === 0n) return '0 (exakt gespeichert)';
    var neg = num < 0n; if (neg) num = -num;
    var s = 0;
    var dl = num.toString().length - den.toString().length;
    if (dl < 8) s = 8 - dl;
    var r = (num * 10n ** BigInt(s)) / den;
    var rs = r.toString();
    var exp10 = rs.length - 1 - s;
    var mant = rs[0] + '.' + rs.slice(1, 5);
    return (neg ? '−' : '+') + mant + ' × 10^' + exp10;
  }

  function bitString(bits, fmt) {
    var s = bits.toString(2);
    while (s.length < fmt.width) s = '0' + s;
    return s;
  }
  function hexString(bits, fmt) {
    var h = bits.toString(16).toUpperCase();
    while (h.length < fmt.width / 4) h = '0' + h;
    return '0x' + h;
  }
  function shortest(x, fmt) {
    if (fmt.width === 32) {
      // kürzeste Dezimaldarstellung, die in float32 zurückführt
      for (var p = 1; p <= 9; p++) { var t = Number(x.toPrecision(p)); if (Math.fround(t) === x) return String(t); }
    }
    return String(x);
  }

  /* ── (B) Akkumulator ─────────────────────────────────────── */
  function accumulate(nmax) {
    var s32 = 0, s64 = 0, step32 = Math.fround(0.1);
    var e32 = new Float64Array(nmax + 1), e64 = new Float64Array(nmax + 1);
    var f32 = new Float64Array(nmax + 1), f64 = new Float64Array(nmax + 1);
    for (var i = 1; i <= nmax; i++) {
      s32 = Math.fround(s32 + step32);   // Summe zweier float32 in double + Rundung = korrekte float32-Addition
      s64 = s64 + 0.1;
      f32[i] = s32; f64[i] = s64;
      e32[i] = s32 - i / 10; e64[i] = s64 - i / 10;
    }
    return { e32: e32, e64: e64, s32: f32, s64: f64 };
  }

  var api = { FMT: FMT, toBits: toBits, fromBits: fromBits, decompose: decompose, exactDigits: exactDigits, exactString: exactString,
    parseDecimal: parseDecimal, errorString: errorString, bitString: bitString, hexString: hexString, shortest: shortest, accumulate: accumulate };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ──────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var uid = 0;

  /* ── (A) Float-Lupe ──────────────────────────────────────── */
  function initLupe(host) {
    var id = 'lupe' + (++uid);
    var fmt = FMT.float64;
    var bits = toBits(0.1, fmt);
    var input = el('input', { type: 'text', id: id + '-in', value: '0.1', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
    var segBtns = ['float64', 'float32'].map(function (n) { return el('button', { type: 'button', 'aria-pressed': n === 'float64' ? 'true' : 'false', 'data-fmt': n, text: n }); });
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Zahlenformat' }, segBtns);
    var presets = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispielwerte' });
    ['0.1', '0.5', '6.5', '0.3', '1/3', '16777217', '100.1', '1e-320', '1e308*10'].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p === '1e308*10' ? '1e309' : p, 'data-v': p === '1/3' ? '0.3333333333333333' : (p === '1e308*10' ? '1e309' : p) });
      presets.appendChild(b);
    });
    var cells = el('div', { class: 'k-bits' });
    var out = el('div', { class: 'k-readout', 'aria-live': 'polite' });
    var hint = el('p', { class: 'k-small k-muted', text: 'Tipp: Klick auf ein Bit kippt es. Ändere z. B. das letzte Mantissen-Bit und sieh, wie klein der Sprung zur nächsten Zahl ist.' });
    var fieldWrap = el('div', { class: 'k-field' }, [el('label', { 'for': input.id, text: 'Zahl eingeben' }), input]);
    host.appendChild(el('div', { class: 'k-controls' }, [fieldWrap, el('div', { class: 'k-field' }, [el('span', { text: 'Format' }), seg])]));
    host.appendChild(presets); host.appendChild(cells); host.appendChild(out); host.appendChild(hint);

    function parseInput(txt) {
      var t = txt.trim().replace(',', '.');
      if (/^[-+]?inf(inity)?$/i.test(t)) return t[0] === '-' ? -Infinity : Infinity;
      if (/^nan$/i.test(t)) return NaN;
      var frac = /^([-+]?[\d.]+)\s*\/\s*([\d.]+)$/.exec(t);
      if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
      if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return null;
      return Number(t);
    }
    function render(fromInputText) {
      var d = decompose(bits, fmt);
      var x = fromBits(bits, fmt);
      cells.innerHTML = '';
      var bs = bitString(bits, fmt);
      var groups = [
        { cls: 's', label: 'Vorzeichen', from: 0, to: 1 },
        { cls: 'e', label: 'Exponent (' + fmt.e + ' Bit)', from: 1, to: 1 + fmt.e },
        { cls: 'm', label: 'Mantisse (' + fmt.m + ' Bit)', from: 1 + fmt.e, to: fmt.width }
      ];
      groups.forEach(function (g) {
        var wrap = el('div', { class: 'k-bitgroup k-bitgroup--' + g.cls });
        wrap.appendChild(el('span', { class: 'k-bitgroup__label', text: g.label }));
        var row = el('div', { class: 'k-bitgroup__cells' });
        for (var i = g.from; i < g.to; i++) {
          (function (i) {
            var pos = fmt.width - 1 - i; // Bit-Nummer von rechts
            var on = bs[i] === '1';
            var b = el('button', { type: 'button', class: 'k-bit k-bit--' + g.cls, 'aria-pressed': on ? 'true' : 'false', 'aria-label': g.label.split(' ')[0] + ' Bit ' + pos + ', Wert ' + (on ? 1 : 0), text: on ? '1' : '0' });
            b.addEventListener('click', function () {
              bits ^= (1n << BigInt(pos));
              var v = fromBits(bits, fmt);
              input.value = isNaN(v) ? 'NaN' : (isFinite(v) ? shortest(v, fmt) : (v < 0 ? '-inf' : 'inf'));
              render(false);
              var again = cells.querySelectorAll('button')[i];
              if (again) again.focus();
            });
            row.appendChild(b);
          })(i);
        }
        wrap.appendChild(row); cells.appendChild(wrap);
      });

      var mantStr = bs.slice(1 + fmt.e);
      var dl = el('dl');
      function row(k, v, big) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: v })); }
      row('Gespeichert (exakt)', exactString(d, 60), true);
      row('Abweichung zur Eingabe', errorString(input.value, d));
      row('Vorzeichen s', d.sign + (d.sign ? ' (negativ)' : ' (positiv)'));
      if (d.kind === 'normal') {
        row('Exponent e', d.expRaw + '  →  e − ' + fmt.bias + ' = ' + (d.expRaw - fmt.bias));
        row('Mantisse', '1.' + mantStr + '  (die führende 1 ist „versteckt“)');
        row('Formel', '(−1)^' + d.sign + ' × 1.m × 2^' + (d.expRaw - fmt.bias));
      } else if (d.kind === 'subnormal') {
        row('Sonderfall', 'subnormal (Exponent 0): 0.' + mantStr + ' × 2^' + (1 - fmt.bias));
      } else if (d.kind === 'zero') { row('Sonderfall', 'Null (alle Bits 0, mit Vorzeichen: +0 und −0)'); }
      else if (d.kind === 'inf') { row('Sonderfall', 'Exponent nur Einsen, Mantisse 0 → Unendlich'); }
      else { row('Sonderfall', 'Exponent nur Einsen, Mantisse ≠ 0 → NaN'); }
      row('Hex', hexString(bits, fmt));
      if (d.kind === 'normal') {
        var ulp = Math.pow(2, d.expRaw - fmt.bias - fmt.m);
        row('Abstand zur nächsten Zahl', (isFinite(ulp) && ulp > 0 ? ulp.toExponential(3).replace('e', ' × 10^').replace('+', '') : '–') + '  (1 Mantissen-Bit)');
      }
      out.innerHTML = ''; out.appendChild(dl);
    }
    function applyText() {
      var v = parseInput(input.value);
      if (v === null) { out.innerHTML = ''; out.appendChild(el('p', { text: 'Das lese ich nicht als Zahl. Probier 0.1, 1e-3, 1/3 oder inf.' })); return; }
      bits = toBits(v, fmt); render(true);
    }
    input.addEventListener('input', applyText);
    segBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        fmt = FMT[b.getAttribute('data-fmt')];
        segBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        applyText();
      });
    });
    presets.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      input.value = b.getAttribute('data-v'); applyText();
    });
    render(true);
  }

  /* ── (B) Fehler-Akkumulator ──────────────────────────────── */
  function initAkku(host) {
    var NMAX = 10000, data = accumulate(NMAX);
    var id = 'akku' + (++uid);
    var slider = el('input', { type: 'range', id: id + '-n', min: '1', max: String(NMAX), step: '1', value: '1000' });
    var nOut = el('output', { 'for': slider.id, text: '1000' });
    var field = el('div', { class: 'k-field' }, [el('label', { 'for': slider.id }, ['Anzahl Additionen n = ', nOut]), slider]);
    var scaleBtn = el('button', { type: 'button', 'aria-pressed': 'true', text: 'logarithmisch' });
    var scaleLin = el('button', { type: 'button', 'aria-pressed': 'false', text: 'linear (mit Vorzeichen)' });
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Achsenart' }, [scaleBtn, scaleLin]);
    host.appendChild(el('div', { class: 'k-controls' }, [field, el('div', { class: 'k-field' }, [el('span', { text: 'Fehler-Achse' }), seg])]));
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 640 300'); svg.setAttribute('class', 'k-chart'); svg.setAttribute('role', 'img');
    host.appendChild(svg);
    host.appendChild(el('div', { class: 'k-legend' }, [
      el('span', {}, [Object.assign(el('i'), { style: 'background:#B50016' }), 'float32 (wie SPS-REAL)']),
      el('span', {}, [Object.assign(el('i'), { style: 'background:#1D4ED8' }), 'float64 (Python-float)'])
    ]));
    var readout = el('div', { class: 'k-readout', 'aria-live': 'polite' });
    host.appendChild(readout);
    var logMode = true;

    function S(tag, attrs, text) { var n = document.createElementNS(svgNS, tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text) n.textContent = text; return n; }
    function draw() {
      var n = parseInt(slider.value, 10);
      nOut.textContent = String(n);
      var W = 640, H = 300, L = 58, R = 12, T = 12, B = 36;
      var pw = W - L - R, ph = H - T - B;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var X = function (i) { return L + pw * (i / n); };
      var yMin, yMax, Y;
      if (logMode) {
        yMin = -17; yMax = 0;
        Y = function (e) { var a = Math.abs(e); var l = a > 0 ? Math.log10(a) : yMin; if (l < yMin) l = yMin; return T + ph * (1 - (l - yMin) / (yMax - yMin)); };
        for (var k = yMin; k <= yMax; k += 2) {
          var yy = T + ph * (1 - (k - yMin) / (yMax - yMin));
          svg.appendChild(S('line', { x1: L, x2: W - R, y1: yy, y2: yy, stroke: '#E5E7EB' }));
          svg.appendChild(S('text', { x: L - 6, y: yy + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#4B5563' }, '10^' + k));
        }
      } else {
        var m = 0; for (var i = 1; i <= n; i++) { m = Math.max(m, Math.abs(data.e32[i]), Math.abs(data.e64[i])); }
        m = m || 1e-16; var mag = Math.pow(10, Math.ceil(Math.log10(m)));
        if (m / mag < 0.35) mag /= 2;
        Y = function (e) { return T + ph * (0.5 - e / (2 * mag)); };
        [-1, -0.5, 0, 0.5, 1].forEach(function (f) {
          var yy = Y(f * mag);
          svg.appendChild(S('line', { x1: L, x2: W - R, y1: yy, y2: yy, stroke: f === 0 ? '#6B7280' : '#E5E7EB' }));
          svg.appendChild(S('text', { x: L - 6, y: yy + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#4B5563' }, (f * mag).toExponential(1).replace('+', '')));
        });
      }
      var step = Math.max(1, Math.floor(n / 320));
      function poly(arr, col) {
        var pts = [];
        for (var i = 1; i <= n; i += step) pts.push(X(i).toFixed(1) + ',' + Y(arr[i]).toFixed(1));
        pts.push(X(n).toFixed(1) + ',' + Y(arr[n]).toFixed(1));
        svg.appendChild(S('polyline', { points: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
      }
      poly(data.e64, '#1D4ED8'); poly(data.e32, '#B50016');
      svg.appendChild(S('line', { x1: L, x2: L, y1: T, y2: H - B, stroke: '#6B7280' }));
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, stroke: '#6B7280' }));
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
        svg.appendChild(S('text', { x: L + pw * f, y: H - B + 16, 'text-anchor': f === 0 ? 'start' : (f === 1 ? 'end' : 'middle'), 'font-size': 11, fill: '#4B5563' }, String(Math.round(n * f))));
      });
      svg.appendChild(S('text', { x: L + pw / 2, y: H - 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#1A1A1A' }, 'Anzahl Additionen n'));
      svg.appendChild(S('text', { x: 12, y: T + ph / 2, 'text-anchor': 'middle', 'font-size': 12, fill: '#1A1A1A', transform: 'rotate(-90 12 ' + (T + ph / 2) + ')' }, logMode ? '|Abweichung| zu n/10' : 'Abweichung zu n/10'));
      var e32 = data.e32[n], e64 = data.e64[n];
      svg.setAttribute('aria-label', 'Diagramm: Abweichung der Summe von n mal 0,1 zum exakten Wert n durch 10. Bei n = ' + n + ' beträgt sie in float32 ' + e32.toExponential(2) + ' und in float64 ' + e64.toExponential(2) + '.');
      var dl = el('dl');
      function row(k, v) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { text: v })); }
      row('Erwartet', (n / 10).toString());
      row('float32-Summe', String(data.s32[n]) + '   (Abweichung ' + e32.toExponential(3).replace('e', ' × 10^').replace('+', '') + ')');
      row('float64-Summe', String(data.s64[n]) + '   (Abweichung ' + e64.toExponential(3).replace('e', ' × 10^').replace('+', '') + ')');
      row('Verhältnis', e64 === 0 ? 'float64 trifft exakt' : (Math.abs(e32 / e64) < 1e-3 ? 'float32 hier zufällig besser' : 'float32-Fehler ≈ ' + (Math.abs(e32 / e64)).toExponential(1).replace('e+', ' × 10^') + '-mal so groß'));
      readout.innerHTML = ''; readout.appendChild(dl);
    }
    slider.addEventListener('input', draw);
    scaleBtn.addEventListener('click', function () { logMode = true; scaleBtn.setAttribute('aria-pressed', 'true'); scaleLin.setAttribute('aria-pressed', 'false'); draw(); });
    scaleLin.addEventListener('click', function () { logMode = false; scaleLin.setAttribute('aria-pressed', 'true'); scaleBtn.setAttribute('aria-pressed', 'false'); draw(); });
    draw();
  }

  /* ── gemeinsame Helfer für (C) und (D) ───────────────────── */
  var svgNS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, text) { var n = document.createElementNS(svgNS, tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text !== undefined) n.textContent = text; return n; }
  function segment(labels, label, activeIdx, onPick) {
    var btns = labels.map(function (t, i) { return el('button', { type: 'button', 'aria-pressed': i === activeIdx ? 'true' : 'false', text: t }); });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); onPick(i); });
    });
    return el('div', { class: 'k-seg', role: 'group', 'aria-label': label }, btns);
  }
  /* Zahl im deutschen Format: Tausender mit schmalem Abstand, Dezimalkomma, Minus als Zeichen */
  function deNum(v) {
    if (Math.abs(v) >= 1 || v === 0) {
      var p = String(Math.round(v * 1e6) / 1e6).split('.');
      return (p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '')).replace('-', '−');
    }
    var digits = Math.min(20, Math.ceil(-Math.log10(Math.abs(v))) + 2);
    return v.toFixed(digits).replace(/0+$/, '').replace('.', ',').replace('-', '−');
  }
  /* Wie Python eine Kommazahl ausgibt (repr): 25.0 statt 25, 1e-07 statt 1e-7 */
  function pyRepr(x) {
    var s = String(x);
    if (/^-?\d+$/.test(s)) return s + '.0';
    return s.replace(/e([+-])(\d)$/, 'e$10$2');
  }
  function pyBool(b) { return b ? 'True' : 'False'; }

  /* ── (C) Float-Lineal: Abstand benachbarter Zahlen wächst mit der Größe ─ */
  function spacing(x, fmt) {
    var a = Math.abs(x);
    if (a === 0) return Math.pow(2, 1 - fmt.bias - fmt.m);
    var e = Math.floor(Math.log2(a));
    if (Math.pow(2, e) > a) e--;
    if (Math.pow(2, e + 1) <= a) e++;
    return Math.pow(2, e - fmt.m);
  }
  function store(x, fmt) { return fmt.width === 32 ? Math.fround(x) : x; }

  function initLineal(host) {
    var fmt = FMT.float32, start = 16777214, soll = start, ist = store(start, fmt), last = '';
    host.textContent = '';
    var seg = segment(['float32 (SPS REAL)', 'float64 (Python float)'], 'Zahlenformat', 0, function (i) { fmt = i ? FMT.float64 : FMT.float32; reset(start); });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { text: 'Format' }), seg])]));
    var chips = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Startposition der Achse' });
    [['1 mm', 1000], ['1 m', 1000000], ['8,4 m', 8388608], ['kurz vor 16,8 m', 16777214], ['33,6 m', 33554432]].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p[0] });
      b.addEventListener('click', function () { reset(p[1]); });
      chips.appendChild(b);
    });
    host.appendChild(el('div', { class: 'k-field v03-lineal__start' }, [el('span', { text: 'Startposition der Achse' }), chips]));
    var bStep = el('button', { type: 'button', class: 'k-btn k-btn--small', text: '+ 1 µm fahren' });
    var bStep5 = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: '+ 5 µm fahren' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Zurück auf Start' });
    host.appendChild(el('div', { class: 'k-presets v03-acts' }, [bStep, bStep5, bReset]));
    var msg = el('p', { class: 'v03-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(msg);
    var svg = S('svg', { viewBox: '0 0 640 170', class: 'k-chart v03-lineal__svg', role: 'img' });
    host.appendChild(svg);
    host.appendChild(el('div', { class: 'k-legend' }, [
      el('span', {}, [el('i', { class: 'v03-sw v03-sw--tick' }), 'Teilstrich: Zahl, die das Format speichern kann']),
      el('span', {}, [el('i', { class: 'v03-sw v03-sw--soll' }), 'gewünschte Position']),
      el('span', {}, [el('i', { class: 'v03-sw v03-sw--ist' }), 'gespeicherte Position'])
    ]));
    var out = el('div', { class: 'k-readout' });
    host.appendChild(out);

    function reset(v) { start = v; soll = v; ist = store(v, fmt); last = ''; draw(); }
    function step(k) {
      var before = ist;
      for (var i = 0; i < k; i++) { soll += 1; ist = store(ist + 1, fmt); }
      if (ist === before) last = 'Die Achse meldet + ' + k + ' µm, die gespeicherte Position bleibt bei ' + deNum(ist) + ' µm: Der nächste Teilstrich liegt ' + deNum(spacing(ist, fmt)) + ' µm weiter, ' + deNum(before) + ' + 1 wird auf ' + deNum(ist) + ' zurückgerundet.';
      else if (soll !== ist) last = 'Die Position bewegt sich, aber nicht mehr genau: Abweichung ' + deNum(soll - ist) + ' µm.';
      else last = '';
      draw();
    }
    function draw() {
      var W = 640, L = 30, R = 30, AY = 108;
      var half = Math.max(6, Math.abs(soll - ist) + 3);
      var lo = ist - half, hi = ist + half;
      var X = function (x) { return L + (W - L - R) * (x - lo) / (hi - lo); };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var sp = spacing(ist, fmt), count = (hi - lo) / sp;
      if (count > 140) {
        svg.appendChild(S('rect', { x: L, y: AY - 30, width: W - L - R, height: 30, class: 'v03-lineal__dense' }));
        svg.appendChild(S('text', { x: W / 2, y: AY - 10, 'text-anchor': 'middle', class: 'v03-lineal__densetxt' }, 'Teilstriche lückenlos dicht: Abstand ' + deNum(sp) + ' µm'));
      } else {
        var v = store(lo, fmt); if (v < lo) v += spacing(v, fmt);
        var guard = 0;
        while (v <= hi && guard++ < 400) { svg.appendChild(S('line', { x1: X(v), x2: X(v), y1: AY - 30, y2: AY, class: 'v03-lineal__tick' })); v += spacing(v, fmt); }
      }
      svg.appendChild(S('line', { x1: L, x2: W - R, y1: AY, y2: AY, class: 'v03-lineal__axis' }));
      for (var k = Math.ceil(lo); k <= Math.floor(hi); k++) svg.appendChild(S('line', { x1: X(k), x2: X(k), y1: AY, y2: AY + 8, class: 'v03-lineal__int' }));
      svg.appendChild(S('text', { x: L, y: AY + 26, 'text-anchor': 'start', class: 'v03-lineal__lbl' }, deNum(Math.ceil(lo)) + ' µm'));
      svg.appendChild(S('text', { x: W - R, y: AY + 26, 'text-anchor': 'end', class: 'v03-lineal__lbl' }, deNum(Math.floor(hi)) + ' µm'));
      svg.appendChild(S('text', { x: W / 2, y: AY + 50, 'text-anchor': 'middle', class: 'v03-lineal__lbl v03-lineal__lbl--muted' }, 'kleine graue Striche: ganze µm'));
      var xs = X(soll), xi = X(ist);
      svg.appendChild(S('path', { d: 'M' + (xs - 9) + ' 46L' + (xs + 9) + ' 46L' + xs + ' 62Z', class: 'v03-lineal__soll' }));
      svg.appendChild(S('circle', { cx: xi, cy: AY, r: 7, class: 'v03-lineal__ist' }));
      if (soll !== ist) {
        svg.appendChild(S('line', { x1: xi, x2: xs, y1: 30, y2: 30, class: 'v03-lineal__err' }));
        svg.appendChild(S('text', { x: (xi + xs) / 2, y: 22, 'text-anchor': 'middle', class: 'v03-lineal__errtxt' }, 'Abweichung ' + deNum(soll - ist) + ' µm'));
      }
      svg.setAttribute('aria-label', 'Float-Lineal ' + fmt.name + ' um ' + deNum(ist) + ' Mikrometer. Abstand der Teilstriche ' + deNum(sp) + ' Mikrometer. Gewünscht ' + deNum(soll) + ', gespeichert ' + deNum(ist) + '.');
      var dl = el('dl');
      function r(k2, val, big) { dl.appendChild(el('dt', { text: k2 })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: val })); }
      r('Abstand der Teilstriche hier', deNum(sp) + ' µm', true);
      r('gewünschte Position', deNum(soll) + ' µm (' + deNum(soll / 1e6) + ' m)');
      r('gespeicherte Position', deNum(ist) + ' µm');
      r('Abweichung', deNum(soll - ist) + ' µm');
      out.innerHTML = ''; out.appendChild(dl);
      msg.textContent = last;
      msg.className = 'v03-msg' + (last ? ' is-on' : '');
    }
    bStep.addEventListener('click', function () { step(1); });
    bStep5.addEventListener('click', function () { step(5); });
    bReset.addEventListener('click', function () { reset(start); });
    draw();
  }

  /* ── (D) Toleranzband: Prüfen wie auf der Zeichnung, mit Lupe auf die Grenze ─ */
  function initToleranz(host) {
    var id = 'tol' + (++uid), lupe = false;
    host.textContent = '';
    function field(label, val, key) {
      var inp = el('input', { type: 'text', id: id + key, value: val, inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', size: '7' });
      inp.addEventListener('input', draw);
      return { inp: inp, wrap: el('div', { class: 'k-field' }, [el('label', { 'for': inp.id, text: label }), inp]) };
    }
    var fN = field('Nennmaß in mm', '25.0', 'n'), fA = field('Abmaß ± in mm', '0.05', 'a'), fM = field('Messwert in mm', '25.05', 'm');
    var seg = segment(['Gesamtansicht', 'Lupe auf die Grenze'], 'Ansicht', 0, function (i) { lupe = i === 1; draw(); });
    host.appendChild(el('div', { class: 'k-controls' }, [fN.wrap, fA.wrap, fM.wrap, el('div', { class: 'k-field' }, [el('span', { text: 'Ansicht' }), seg])]));
    var chips = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispiel-Messwerte' });
    ['24.95', '25.0', '25.03', '25.05', '25.06'].forEach(function (p) {
      var b = el('button', { type: 'button', class: 'k-chip', text: p });
      b.addEventListener('click', function () { fM.inp.value = p; draw(); });
      chips.appendChild(b);
    });
    host.appendChild(el('div', { class: 'k-field' }, [el('span', { text: 'Messwert wählen' }), chips]));
    var svg = S('svg', { viewBox: '0 0 640 170', class: 'k-chart v03-tol__svg', role: 'img' });
    host.appendChild(svg);
    var note = el('p', { class: 'k-small k-muted v03-tol__note' });
    host.appendChild(note);
    var out = el('div', { class: 'k-readout v03-tol__out', 'aria-live': 'polite' });
    host.appendChild(out);

    function num(inp) { var t = inp.value.trim().replace(',', '.'); return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null; }
    function draw() {
      var n = num(fN.inp), a = num(fA.inp), m = num(fM.inp);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      out.innerHTML = ''; note.textContent = '';
      if (n === null || a === null || m === null || a <= 0) { note.textContent = 'Bitte drei Zahlen mit Dezimalpunkt eingeben, das Abmaß größer als 0.'; return; }
      var d = Math.abs(m - n), naiv = d <= a, gut = d <= a + 1e-9;
      var W = 640, L = 40, R = 40, AY = 100;
      if (!lupe) {
        var lo = Math.min(n - 2 * a, m - a * 0.4), hi = Math.max(n + 2 * a, m + a * 0.4);
        var X = function (x) { return L + (W - L - R) * (x - lo) / (hi - lo); };
        svg.appendChild(S('rect', { x: X(n - a), y: 50, width: X(n + a) - X(n - a), height: AY - 50, class: 'v03-tol__band' }));
        svg.appendChild(S('line', { x1: L, x2: W - R, y1: AY, y2: AY, class: 'v03-lineal__axis' }));
        svg.appendChild(S('line', { x1: X(n), x2: X(n), y1: 50, y2: AY + 6, class: 'v03-tol__nenn' }));
        svg.appendChild(S('text', { x: X(n), y: AY + 44, 'text-anchor': 'middle', class: 'v03-lineal__lbl' }, 'Nennmaß ' + deNum(n)));
        svg.appendChild(S('text', { x: X(n - a), y: AY + 22, 'text-anchor': 'middle', class: 'v03-lineal__lbl' }, 'Untermaß ' + deNum(n - a)));
        svg.appendChild(S('text', { x: X(n + a), y: AY + 22, 'text-anchor': 'middle', class: 'v03-lineal__lbl' }, 'Obermaß ' + deNum(n + a)));
        var xm = X(m), cls = gut ? 'is-ok' : 'is-bad';
        svg.appendChild(S('line', { x1: xm, x2: xm, y1: 40, y2: AY, class: 'v03-tol__mess ' + cls }));
        svg.appendChild(S('path', { d: 'M' + (xm - 8) + ' 30L' + (xm + 8) + ' 30L' + xm + ' 44Z', class: 'v03-tol__pin ' + cls }));
        var tx = Math.max(L + 60, Math.min(W - R - 60, xm));
        svg.appendChild(S('text', { x: tx, y: 22, 'text-anchor': 'middle', class: 'v03-tol__messtxt ' + cls }, 'Messwert ' + deNum(m) + (gut ? ' (in Toleranz)' : ' (außerhalb)')));
        svg.setAttribute('aria-label', 'Toleranzband von ' + deNum(n - a) + ' bis ' + deNum(n + a) + ' Millimeter. Messwert ' + deNum(m) + (gut ? ' liegt im Band.' : ' liegt außerhalb.'));
        if (Math.abs(d - a) < 1e-9 && naiv !== gut) note.textContent = 'Der Messwert liegt genau auf der Grenze. Auf der Zeichnung ist das in Ordnung, aber der einfache Vergleich mit <= sagt False. Schalte auf „Lupe auf die Grenze“.';
      } else {
        var delta = Math.abs(d - a);
        if (delta > 1e-6) {
          svg.appendChild(S('text', { x: W / 2, y: 90, 'text-anchor': 'middle', class: 'v03-lineal__lbl' }, 'Die Lupe lohnt sich nur genau an der Grenze. Wähle 25.05 oder 24.95.'));
          svg.setAttribute('aria-label', 'Lupe: Der Messwert liegt nicht auf der Grenze.');
        } else {
          var w = Math.max(delta * 2.5, 8 * spacing(a, FMT.float64));
          var lo2 = a - w, hi2 = a + w;
          var X2 = function (x) { return L + (W - L - R) * (x - lo2) / (hi2 - lo2); };
          svg.appendChild(S('rect', { x: L, y: 40, width: X2(a) - L, height: 22, class: 'v03-tol__okstrip' }));
          svg.appendChild(S('rect', { x: X2(a), y: 40, width: W - R - X2(a), height: 22, class: 'v03-tol__badstrip' }));
          svg.appendChild(S('text', { x: L + 6, y: 56, class: 'v03-tol__striptxt' }, 'Abstand <= Abmaß: True'));
          svg.appendChild(S('text', { x: W - R - 6, y: 56, 'text-anchor': 'end', class: 'v03-tol__striptxt' }, 'False'));
          svg.appendChild(S('rect', { x: L, y: 70, width: W - L - R, height: 22, class: 'v03-tol__okstrip' }));
          svg.appendChild(S('text', { x: L + 6, y: 86, class: 'v03-tol__striptxt' }, 'Abstand <= Abmaß + 1e-9: überall True →'));
          svg.appendChild(S('line', { x1: L, x2: W - R, y1: AY + 10, y2: AY + 10, class: 'v03-lineal__axis' }));
          svg.appendChild(S('line', { x1: X2(a), x2: X2(a), y1: 34, y2: AY + 18, class: 'v03-tol__nenn' }));
          svg.appendChild(S('text', { x: X2(a), y: AY + 36, 'text-anchor': 'middle', class: 'v03-lineal__lbl' }, 'Grenze: Abmaß ' + pyRepr(a)));
          var xd = X2(d);
          svg.appendChild(S('circle', { cx: xd, cy: AY + 10, r: 7, class: 'v03-tol__dot' }));
          svg.appendChild(S('text', { x: Math.max(L + 90, Math.min(W - R - 90, xd)), y: AY + 58, 'text-anchor': 'middle', class: 'v03-tol__messtxt is-bad' }, 'berechneter Abstand ' + pyRepr(d)));
          svg.setAttribute('aria-label', 'Lupe auf die Grenze: Die Grenze liegt bei ' + pyRepr(a) + ', der berechnete Abstand bei ' + pyRepr(d) + '. Mit der Rechentoleranz 1e-9 gilt der Wert trotzdem als in Toleranz.');
          note.textContent = d > a
            ? 'Die Lupe zeigt nur ein winziges Stück um die Grenze. Der Rechner hat 25.05 − 25.0 nicht als genau 0.05 gespeichert, sondern ' + pyRepr(d) + '. Das liegt knapp rechts der Grenze. Die Rechentoleranz 1e-9 schiebt die Grenze ein gutes Stück nach rechts, weit über diesen Ausschnitt hinaus, aber immer noch eine Million Mal feiner als jede Messung.'
            : 'Hier liegt der berechnete Abstand zufällig nicht über der Grenze. Probier den anderen Grenzwert.';
        }
      }
      var dl = el('dl');
      function r(k, v, big) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', { class: big ? 'k-big' : '', text: v })); }
      r('abs(messwert - nennmass)', pyRepr(d));
      r('… <= abmass', pyBool(naiv));
      r('… <= abmass + 1e-9', pyBool(gut));
      r('math.isclose(messwert, nennmass, rel_tol=0.0, abs_tol=abmass + 1e-9)', pyBool(gut));
      out.appendChild(dl);
    }
    draw();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="lupe"]'), initLupe);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="akku"]'), initAkku);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="lineal"]'), initLineal);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="toleranz"]'), initToleranz);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
