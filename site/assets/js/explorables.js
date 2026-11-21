/* =============================================================
   explorables.js – interaktive Bausteine für V03 (reines JS, kein Framework)
   (A) Float-Lupe: Bits <-> exakter Wert, float64/float32
   (B) Fehler-Akkumulator: n-mal 0.1 addieren, float32 vs float64
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
    ['0.1', '0.5', '0.3', '1/3', '16777217', '100.1', '1e-320', '1e308*10'].forEach(function (p) {
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

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="lupe"]'), initLupe);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="akku"]'), initAkku);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
