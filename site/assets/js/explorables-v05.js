/* =============================================================
   explorables-v05.js – interaktive Bausteine für V05 (reines JS, kein Framework)
   Programmablaufplan (PAP) nach DIN 66001 / ISO 5807 als inline-SVG.
   (A) PAP-Engine: Baum -> Layout -> SVG-Text (auch ohne DOM, per node nutzbar)
   (B) Symbol-Lexikon, (C) PAP läuft ab (Marke wandert, Codezeile leuchtet),
   (D) PAP-Baukasten (PAP <-> Python live), (E) Fehler im PAP finden,
   (F) PAP ergänzen (Code gegeben), (G) Selbstcheck-Haken für Papieraufgaben.
   Rechenkern und Engine sind ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     (A) PAP-Engine
     Knotenarten: start | end | io | op | if | conn | sub
     Eine Folge (Array) läuft von oben nach unten. Eine Raute (if) hat zwei
     Folgen: yes (links, "ja") und no (rechts, "nein"). Enden beide Zweige
     nicht in einem Ende, laufen sie unter der Raute wieder zusammen.
     ══════════════════════════════════════════════════════════ */
  var CH = 6.3, LH = 17, VG = 28, COLG = 22, SK = 14, ARW = 9, PAD = 14;
  var uidN = 0;
  function autoId() { uidN += 1; return 'p' + uidN; }
  function mk(t, text, extra) { var n = { id: autoId(), t: t, text: text }; if (extra) Object.keys(extra).forEach(function (k) { n[k] = extra[k]; }); return n; }
  var P = {
    start: function (id) { return mk('start', 'Start', { id: id || 'start' }); },
    end: function (id, text, extra) { var n = mk('end', text || 'Ende', extra); if (id) n.id = id; return n; },
    io: function (text, id, extra) { var n = mk('io', text, extra); if (id) n.id = id; return n; },
    op: function (text, id, extra) { var n = mk('op', text, extra); if (id) n.id = id; return n; },
    iff: function (text, yes, no, id, extra) { var n = mk('if', text, extra); n.yes = yes || []; n.no = no || []; if (id) n.id = id; return n; }
  };

  function textW(s) { return s.length * CH; }
  function wrap(text, max) {
    var out = [];
    String(text).split('\n').forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean), line = '';
      if (!words.length) { out.push(''); return; }
      words.forEach(function (w) {
        if (!line) line = w;
        else if ((line + ' ' + w).length <= max) line += ' ' + w;
        else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }
  function maxLine(lines) { var m = 0; lines.forEach(function (l) { m = Math.max(m, textW(l)); }); return m; }

  function sizeOf(n) {
    var t = n.t, L, tx;
    if (t === 'start' || t === 'end') { tx = n.text || (t === 'start' ? 'Start' : 'Ende'); n.lines = [tx]; return { w: Math.max(96, textW(tx) + 44), h: 34 }; }
    if (t === 'conn') { n.lines = [String(n.text)]; return { w: 32, h: 32 }; }
    if (t === 'op' || t === 'io' || t === 'sub') {
      n.lines = wrap(n.text, n.wrapAt || 22); L = maxLine(n.lines);
      var w = L + 28 + (t === 'io' && n.shape !== 'op' ? 2 * SK : 0) + (t === 'sub' ? 16 : 0);
      return { w: Math.max(t === 'io' ? 120 : 98, Math.ceil(w)), h: Math.max(38, n.lines.length * LH + 18) };
    }
    n.lines = wrap(n.text, n.wrapAt || 20); L = maxLine(n.lines);
    var H = n.lines.length * LH;
    return { w: Math.max(136, Math.ceil(L / 0.54 + 10)), h: Math.max(78, Math.ceil(H / 0.44 + 10)) };
  }

  function measureSeq(seq) {
    var l = 0, r = 0;
    (seq || []).forEach(function (n) { var m = measureNode(n); l = Math.max(l, m.l); r = Math.max(r, m.r); });
    return { l: l, r: r };
  }
  function measureNode(n) {
    n._s = sizeOf(n);
    if (n.t !== 'if') return (n._m = { l: n._s.w / 2, r: n._s.w / 2 });
    var y = measureSeq(n.yes), no = measureSeq(n.no);
    var a = Math.max(n._s.w / 2, y.r + COLG / 2), b = Math.max(n._s.w / 2, no.l + COLG / 2);
    return (n._m = { l: Math.max(a + y.l, n._s.w / 2), r: Math.max(b + no.r, n._s.w / 2), a: a, b: b });
  }
  function lastPt(e) { return e.pts[e.pts.length - 1]; }
  function simplify(pts) {
    var out = [];
    pts.forEach(function (p) {
      var q = out[out.length - 1];
      if (q && Math.abs(q[0] - p[0]) < 0.01 && Math.abs(q[1] - p[1]) < 0.01) return;
      out.push([p[0], p[1]]);
    });
    for (var i = out.length - 2; i > 0; i--) {
      var a = out[i - 1], b = out[i], c = out[i + 1];
      if ((Math.abs(a[0] - b[0]) < 0.01 && Math.abs(b[0] - c[0]) < 0.01) || (Math.abs(a[1] - b[1]) < 0.01 && Math.abs(b[1] - c[1]) < 0.01)) out.splice(i, 1);
    }
    return out;
  }

  function placeSeq(seq, x, exits, y0, ctx) {
    (seq || []).forEach(function (n) {
      var s = n._s, top;
      if (!exits.length) top = y0;
      else {
        var maxY = -1e9;
        exits.forEach(function (e) { maxY = Math.max(maxY, lastPt(e)[1]); });
        var need = exits.length > 1 || exits.some(function (e) { return Math.abs(lastPt(e)[0] - x) > 0.5; });
        var mergeY = maxY + VG * 0.55;
        top = need ? maxY + VG + 12 : maxY + VG;
        /* erster Knoten eines Zweigs darf die Raute nicht berühren */
        exits.forEach(function (e) {
          if (!e.dia) return;
          var d = e.dia, rel = e.side < 0 ? (x + n._s.w / 2) - d.cx : d.cx - (x - n._s.w / 2);
          if (rel + 10 > -d.hw) top = Math.max(top, d.yc + d.hh * (1 + (rel + 10) / d.hw));
        });
        exits.forEach(function (e) {
          var pts = e.pts.slice(), p = lastPt(e);
          if (need) { pts.push([p[0], mergeY]); pts.push([x, mergeY]); }
          pts.push([x, top]);
          ctx.edges.push({ from: e.id, to: n.id, label: e.label || '', show: e.show, side: e.side, pts: simplify(pts), noArrow: !!n.noArrow });
        });
      }
      n._x = x; n._y = top; ctx.nodes.push(n);
      if (n.t === 'if') {
        var yc = top + s.h / 2, m = n._m, hw = s.w / 2;
        var yes0 = [{ id: n.id, label: 'ja', show: n.yesLabel !== '', side: -1, dia: { cx: x, yc: yc, hw: hw, hh: s.h / 2 }, pts: [[x - hw, yc], [x - m.a, yc]] }];
        var no0 = [{ id: n.id, label: 'nein', show: n.noLabel !== '', side: 1, dia: { cx: x, yc: yc, hw: hw, hh: s.h / 2 }, pts: [[x + hw, yc], [x + m.b, yc]] }];
        var ye = placeSeq(n.yes, x - m.a, yes0, yc, ctx), ne = placeSeq(n.no, x + m.b, no0, yc, ctx);
        exits = ye.concat(ne);
      } else if (n.t === 'end' || n.open) exits = [];
      else exits = [{ id: n.id, label: '', pts: [[x, top + s.h]] }];
    });
    return exits;
  }

  function layout(spec) {
    var seq = Array.isArray(spec) ? spec : spec.nodes;
    measureSeq(seq);
    var ctx = { nodes: [], edges: [] };
    placeSeq(seq, 0, [], 0, ctx);
    var x0 = 1e9, x1 = -1e9, y1 = -1e9;
    ctx.nodes.forEach(function (n) { x0 = Math.min(x0, n._x - n._s.w / 2); x1 = Math.max(x1, n._x + n._s.w / 2); y1 = Math.max(y1, n._y + n._s.h); });
    ctx.edges.forEach(function (e) { e.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }); });
    ctx.edges.forEach(function (e) { if (e.show && e.label) { var p = e.pts[0]; if (e.side < 0) x0 = Math.min(x0, p[0] - 36); else x1 = Math.max(x1, p[0] + 40); } });
    return { nodes: ctx.nodes, edges: ctx.edges, x0: x0 - PAD, y0: -PAD, w: x1 - x0 + 2 * PAD, h: y1 + 2 * PAD };
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function f1(v) { return (Math.round(v * 10) / 10).toString(); }

  function shapeSvg(n) {
    var s = n._s, x = n._x, y = n._y, w = s.w, h = s.h, cx = x, cy = y + h / 2, d, cls = 'pap-shape';
    if (n.t === 'start' || n.t === 'end') return '<rect class="' + cls + '" x="' + f1(x - w / 2) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + h + '" rx="' + h / 2 + '"/>';
    if (n.t === 'conn') return '<circle class="' + cls + '" cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + w / 2 + '"/>';
    if (n.t === 'op' || (n.t === 'io' && n.shape === 'op')) return '<rect class="' + cls + '" x="' + f1(x - w / 2) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + h + '"/>';
    if (n.t === 'sub') return '<rect class="' + cls + '" x="' + f1(x - w / 2) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + h + '"/><path class="pap-line pap-line--in" d="M' + f1(x - w / 2 + 9) + ' ' + f1(y) + 'V' + f1(y + h) + 'M' + f1(x + w / 2 - 9) + ' ' + f1(y) + 'V' + f1(y + h) + '"/>';
    if (n.t === 'io') { d = 'M' + f1(x - w / 2 + SK) + ' ' + f1(y) + 'H' + f1(x + w / 2) + 'L' + f1(x + w / 2 - SK) + ' ' + f1(y + h) + 'H' + f1(x - w / 2) + 'Z'; return '<path class="' + cls + '" d="' + d + '"/>'; }
    d = 'M' + f1(x) + ' ' + f1(y) + 'L' + f1(x + w / 2) + ' ' + f1(cy) + 'L' + f1(x) + ' ' + f1(y + h) + 'L' + f1(x - w / 2) + ' ' + f1(cy) + 'Z';
    return '<path class="' + cls + '" d="' + d + '"/>';
  }
  function nodeSvg(n, o) {
    var s = n._s, cy = n._y + s.h / 2, lines = n.lines, k, out = '';
    var cls = 'pap-n pap-n--' + n.t + (n.cls ? ' ' + n.cls : '');
    out += '<g class="' + cls + '" data-id="' + esc(n.id) + '" data-bid="' + esc(n.id) + '">' + shapeSvg(n);
    for (k = 0; k < lines.length; k++) {
      out += '<text class="pap-t" x="' + f1(n._x) + '" y="' + f1(cy - (lines.length - 1) * LH / 2 + k * LH + 4.6) + '" text-anchor="middle">' + esc(lines[k]) + '</text>';
    }
    if (n.num && o.badges !== false) {
      var bx = n._x - s.w / 2 + (n.t === 'if' ? s.w * 0.12 : 4), by = n._y + (n.t === 'if' ? s.h * 0.2 : 2);
      out += '<g class="pap-badge"><circle cx="' + f1(bx) + '" cy="' + f1(by) + '" r="9"/><text x="' + f1(bx) + '" y="' + f1(by + 3.8) + '" text-anchor="middle">' + n.num + '</text></g>';
    }
    return out + '</g>';
  }
  function edgeSvg(e) {
    var pts = e.pts, d = 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L'), out;
    out = '<g class="pap-e" data-from="' + esc(e.from) + '" data-to="' + esc(e.to) + '" data-lab="' + esc(e.label) + '"><path class="pap-hit" d="' + d + '"/><path class="pap-line" d="' + d + '"/>';
    if (!e.noArrow && pts.length > 1) {
      var a = pts[pts.length - 2], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= len; dy /= len;
      var bx = b[0] - dx * ARW, by = b[1] - dy * ARW, px = -dy * 4.6, py = dx * 4.6;
      out += '<path class="pap-ah" d="M' + f1(b[0]) + ' ' + f1(b[1]) + 'L' + f1(bx + px) + ' ' + f1(by + py) + 'L' + f1(bx - px) + ' ' + f1(by - py) + 'Z"/>';
    }
    if (e.show && e.label) {
      var p = pts[0];
      out += '<text class="pap-lab" x="' + f1(p[0] + e.side * 6) + '" y="' + f1(p[1] - 6) + '" text-anchor="' + (e.side < 0 ? 'end' : 'start') + '">' + esc(e.label) + '</text>';
    }
    return out + '</g>';
  }

  /* Ablauf in Worten (aria-label) */
  function describeSeq(seq) {
    var parts = [];
    (seq || []).forEach(function (n) {
      if (n.t === 'if') {
        var y = describeSeq(n.yes), no = describeSeq(n.no);
        parts.push('Verzweigung „' + n.text + '“: bei ja ' + (y || 'weiter') + '; bei nein ' + (no || 'weiter'));
      } else if (n.t === 'start' || n.t === 'end') parts.push(n.text || (n.t === 'start' ? 'Start' : 'Ende'));
      else if (n.t === 'io') parts.push(n.shape === 'op' ? 'Rechteck „' + n.text + '“' : n.text);
      else if (n.t === 'op') parts.push(n.text);
      else if (n.t === 'conn') parts.push('Übergangsstelle ' + n.text);
      else if (n.t === 'sub') parts.push('Unterprogramm ' + n.text);
    });
    return parts.join(', dann ');
  }
  function describe(spec) { return 'Programmablaufplan: ' + describeSeq(Array.isArray(spec) ? spec : spec.nodes) + '.'; }

  /* spec -> SVG-Text. opts: label, cls, minw (Anteil der Breite, ab dem gescrollt wird), badges */
  function svg(spec, o) {
    o = o || {};
    var lay = layout(spec), out = '';
    var W = Math.round(lay.w), H = Math.round(lay.h);
    var label = o.label || describe(spec);
    lay.edges.forEach(function (e) { out += edgeSvg(e); });
    lay.nodes.forEach(function (n) { out += nodeSvg(n, o); });
    var minw = Math.round(W * (o.minw || 0.78));
    return '<svg class="pap' + (o.cls ? ' ' + o.cls : '') + '" xmlns="http://www.w3.org/2000/svg" viewBox="' + f1(lay.x0) + ' ' + f1(lay.y0) + ' ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '" style="--pap-min:' + minw + 'px;--pap-max:' + W + 'px">' + out + '</svg>';
  }
  function figure(spec, o) { return '<div class="pap-wrap">' + svg(spec, o) + '</div>'; }

  /* ══════════════════════════════════════════════════════════
     Werkstoff-PAP (Beispiel V05) und Rechenkern für die Ablauf-Animation
     ══════════════════════════════════════════════════════════ */
  var W_CODE = [
    '# Werkstoffvorschlag für eine Welle nach einem Programmablaufplan (PAP)',
    '# (vereinfachte Lehr-Regel, keine Normauslegung)',
    '# (V05: PAP -> Code, verschachtelte Verzweigungen, Eingabe prüfen)',
    '',
    'spannung = float(input("Maximale Spannung in MPa: "))',
    'temperatur = float(input("Betriebstemperatur in °C: "))',
    '',
    'if spannung <= 0 or temperatur < -50 or temperatur > 600:',
    '    print("Eingabe unplausibel - bitte Werte prüfen")',
    'else:',
    '    if temperatur > 300:',
    '        if spannung <= 200:',
    '            werkstoff = "16Mo3 (warmfest)"',
    '        else:',
    '            werkstoff = "Sonderwerkstoff - Rücksprache Konstruktion"',
    '    else:',
    '        if spannung <= 140:',
    '            werkstoff = "S235JR"',
    '        elif spannung <= 220:',
    '            werkstoff = "C45E"',
    '        else:',
    '            werkstoff = "42CrMo4 (vergütet)"',
    '    print("Empfohlener Werkstoff:", werkstoff)'
  ];
  function wSpec() {
    return [
      P.start('n0'),
      P.io('spannung einlesen (MPa)', 'n1'),
      P.io('temperatur einlesen (°C)', 'n2'),
      P.iff('spannung ≤ 0 oder temperatur < −50 oder temperatur > 600?', [
        P.io('Ausgabe: Eingabe unplausibel – bitte Werte prüfen', 'n4'),
        P.end('n4e')
      ], [
        P.iff('temperatur > 300?', [
          P.iff('spannung ≤ 200?',
            [P.op('werkstoff = "16Mo3 (warmfest)"', 'n7')],
            [P.op('werkstoff = "Sonderwerkstoff – Rücksprache Konstruktion"', 'n8')], 'n6')
        ], [
          P.iff('spannung ≤ 140?',
            [P.op('werkstoff = "S235JR"', 'n10')],
            [P.iff('spannung ≤ 220?',
              [P.op('werkstoff = "C45E"', 'n11')],
              [P.op('werkstoff = "42CrMo4 (vergütet)"', 'n12')], 'n9b')], 'n9')
        ], 'n5'),
        P.io('Ausgabe: "Empfohlener Werkstoff:", werkstoff', 'n13'),
        P.end('n13e')
      ], 'n3')
    ];
  }
  function pyFloat(x) { return Number.isInteger(x) && Math.abs(x) < 1e16 ? x.toFixed(1) : String(x); }
  function fm(x) { return pyFloat(x).replace('-', '−'); }
  /* Gibt {werkstoff|null, text, steps} zurück. Step: {id, from, lab, lines, msg, vars, out, changed, dec} */
  function wRun(sp, te) {
    var steps = [], vars = {}, out = [], prev = null, prevDec = '';
    function push(id, lines, msg, newVars, o, dec) {
      if (newVars) Object.keys(newVars).forEach(function (k) { vars[k] = newVars[k]; });
      if (o) out.push(o);
      var v = {}; Object.keys(vars).forEach(function (k) { v[k] = vars[k]; });
      steps.push({ id: id, from: prev, lab: prev ? prevDec : '', lines: lines, msg: msg, vars: v, out: out.slice(), changed: newVars ? Object.keys(newVars) : [], dec: dec || '' });
      prev = id; prevDec = dec || '';
    }
    push('n0', [], 'Der Ablauf beginnt am Start: Das Programm läuft los, die erste Zeile wird gelesen.');
    push('n1', [5], 'Parallelogramm „spannung einlesen“: Python liest die Eingabe und macht sie mit float() zur Zahl: spannung = ' + fm(sp) + '.', { spannung: fm(sp) });
    push('n2', [6], 'Parallelogramm „temperatur einlesen“: temperatur = ' + fm(te) + '.', { temperatur: fm(te) });
    var a = sp <= 0, b = te < -50, c = te > 600, bad = a || b || c;
    push('n3', [8],
      'Raute (Plausibilitätsprüfung): ' + fm(sp) + ' ≤ 0 ist ' + (a ? 'wahr' : 'falsch') + ', ' + fm(te) + ' < −50 ist ' + (b ? 'wahr' : 'falsch') + ', ' + fm(te) + ' > 600 ist ' + (c ? 'wahr' : 'falsch') +
      '. Mit „oder“ verknüpft: ' + (bad ? 'wahr, der Weg „ja“ wird genommen.' : 'falsch, der Weg „nein“ wird genommen.'), null, null, bad ? 'ja' : 'nein');
    if (bad) {
      push('n4', [9], 'Der „ja“-Weg führt zur Ausgabe der Warnung. Der „nein“-Zweig (else) wird übersprungen.', null, 'Eingabe unplausibel - bitte Werte prüfen');
      push('n4e', [], 'Ende: Das Programm ist fertig.');
      return { werkstoff: null, text: 'Eingabe unplausibel - bitte Werte prüfen', steps: steps };
    }
    var heiss = te > 300, w;
    push('n5', [11], 'Raute: ' + fm(te) + ' > 300 ist ' + (heiss ? 'wahr, Weg „ja“ (warmer Bereich).' : 'falsch, Weg „nein“ (bis 300 °C).'), null, null, heiss ? 'ja' : 'nein');
    if (heiss) {
      var okS = sp <= 200;
      push('n6', [12], 'Raute: ' + fm(sp) + ' ≤ 200 ist ' + (okS ? 'wahr, Weg „ja“.' : 'falsch, Weg „nein“.'), null, null, okS ? 'ja' : 'nein');
      w = okS ? '16Mo3 (warmfest)' : 'Sonderwerkstoff - Rücksprache Konstruktion';
      push(okS ? 'n7' : 'n8', [okS ? 13 : 15], 'Rechteck: Der Werkstoff wird festgelegt: werkstoff = "' + w + '".', { werkstoff: w });
    } else {
      var k = sp <= 140 ? 0 : (sp <= 220 ? 1 : 2);
      push('n9', [17], 'Raute: ' + fm(sp) + ' ≤ 140 ist ' + (k === 0 ? 'wahr, Weg „ja“.' : 'falsch, Weg „nein“: Die nächste Raute folgt (in Python ein elif).'), null, null, k === 0 ? 'ja' : 'nein');
      if (k > 0) push('n9b', [19], 'Raute: ' + fm(sp) + ' ≤ 220 ist ' + (k === 1 ? 'wahr, Weg „ja“.' : 'falsch, Weg „nein“ (in Python das else).'), null, null, k === 1 ? 'ja' : 'nein');
      w = ['S235JR', 'C45E', '42CrMo4 (vergütet)'][k];
      push(['n10', 'n11', 'n12'][k], [[18], [20], [22]][k], 'Rechteck: Der Werkstoff wird festgelegt: werkstoff = "' + w + '".', { werkstoff: w });
    }
    push('n13', [23], 'Alle Wege laufen wieder zusammen. Das Parallelogramm gibt das Ergebnis aus.', null, 'Empfohlener Werkstoff: ' + w);
    push('n13e', [], 'Ende: Das Programm ist fertig.');
    return { werkstoff: w, text: 'Empfohlener Werkstoff: ' + w, steps: steps };
  }

  /* ── Baukasten-Kern: Baum {in,out,op,if} -> Python und PAP ── */
  var uid = 0;
  function nid() { uid += 1; return 'b' + uid; }
  function nIn(v) { return { id: nid(), k: 'in', v: v }; }
  function nOut(v) { return { id: nid(), k: 'out', v: v }; }
  function nOp(v) { return { id: nid(), k: 'op', v: v }; }
  function nIf(v, yes, no) { return { id: nid(), k: 'if', v: v, yes: yes || [], no: no || [] }; }
  function lineOf(n) {
    var v = String(n.v).trim();
    if (n.k === 'in') return v ? v + ' = float(input("' + v + ': "))' : 'pass  # Lücke: Variable eintragen';
    if (n.k === 'out') return 'print(' + v + ')';
    return v || 'pass  # Lücke: Anweisung eintragen';
  }
  function ifLines(n, level, out, kw) {
    out.push({ ind: level, text: kw + ' ' + (String(n.v).trim() || 'True') + ':', id: n.id, role: kw });
    if (n.yes.length) toLines(n.yes, level + 1, out); else out.push({ ind: level + 1, text: 'pass', id: n.id, role: 'pass' });
    if (n.no.length === 1 && n.no[0].k === 'if') ifLines(n.no[0], level, out, 'elif');
    else if (n.no.length) { out.push({ ind: level, text: 'else:', id: n.id, role: 'else' }); toLines(n.no, level + 1, out); }
  }
  function toLines(nodes, level, out) {
    out = out || [];
    nodes.forEach(function (n) {
      if (n.k === 'if') ifLines(n, level, out, 'if');
      else out.push({ ind: level, text: lineOf(n), id: n.id, role: n.k });
    });
    return out;
  }
  function toText(nodes) { return toLines(nodes, 0, []).map(function (l) { return new Array(l.ind * 4 + 1).join(' ') + l.text; }).join('\n'); }
  function numberTree(nodes, c) { c = c || { n: 0 }; nodes.forEach(function (n) { c.n += 1; n.num = c.n; if (n.k === 'if') { numberTree(n.yes, c); numberTree(n.no, c); } }); return c.n; }
  function countBlocks(nodes) { var c = 0; nodes.forEach(function (n) { c += 1; if (n.k === 'if') c += countBlocks(n.yes) + countBlocks(n.no); }); return c; }
  /* Python-Schreibweise -> PAP-Schreibweise */
  function nice(s) {
    return String(s).replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/!=/g, '≠').replace(/==/g, '=')
      .replace(/\band\b/g, 'und').replace(/\bor\b/g, 'oder').replace(/\bnot\b/g, 'nicht');
  }
  function outText(v) {
    var s = String(v).trim();
    if (!s) return 'Ausgabe: …';
    var m = /^"([^"]*)"$|^'([^']*)'$/.exec(s);
    return 'Ausgabe: ' + (m ? (m[1] !== undefined ? m[1] : m[2]) : s);
  }
  function toPap(tree) {
    function conv(arr) {
      return arr.map(function (n) {
        var c = { num: n.num, cls: n.cls };
        if (n.k === 'in') return P.io((String(n.v).trim() || '…') + ' einlesen', n.id, c);
        if (n.k === 'out') return P.io(outText(n.v), n.id, c);
        if (n.k === 'op') return P.op(nice(String(n.v).trim() || '…'), n.id, c);
        return P.iff(nice(String(n.v).trim() || '…') + '?', conv(n.yes), conv(n.no), n.id, c);
      });
    }
    return [P.start('start')].concat(conv(tree), [P.end('end')]);
  }
  /* Python-Text -> Baum (nur Zuweisung/Aufruf, if, elif, else) */
  function parseCode(src) {
    var raw = String(src).replace(/\t/g, '    ').split('\n'), lines = [];
    raw.forEach(function (l, k) {
      if (!l.trim() || /^\s*#/.test(l)) return;
      var tx = l.trim();
      if (!/["']/.test(tx)) tx = tx.replace(/\s+#.*$/, '');
      lines.push({ no: k + 1, ind: l.match(/^ */)[0].length, text: tx });
    });
    var pos = 0;
    function fail(l, msg) { var e = new Error('Zeile ' + l.no + ': ' + msg); e.line = l.no; throw e; }
    function simple(text) {
      var m = /^([A-Za-z_]\w*)\s*=\s*float\(\s*input\(.*\)\s*\)$/.exec(text);
      if (m) return nIn(m[1]);
      m = /^print\((.*)\)$/.exec(text);
      if (m) return nOut(m[1]);
      return nOp(text);
    }
    function parseBlock(ind) {
      var out = [];
      while (pos < lines.length) {
        var l = lines[pos];
        if (l.ind < ind) break;
        if (l.ind > ind) fail(l, 'Diese Zeile ist weiter eingerückt als die Zeile davor. Eine Einrückung ist nur nach einem Doppelpunkt erlaubt.');
        if (/^(elif\b|else\b)/.test(l.text)) fail(l, l.text.split(/[\s:]/)[0] + ' steht ohne passendes if auf derselben Einrückungsstufe.');
        if (/^if\b/.test(l.text)) out.push(parseIf(l, ind, 'if'));
        else {
          if (/:$/.test(l.text)) fail(l, 'Dieser Baukasten kennt nur if, elif und else mit Doppelpunkt. Andere Blockköpfe (while, for, def …) kommen später im Kurs.');
          out.push(simple(l.text)); pos += 1;
        }
      }
      return out;
    }
    function parseBody(ind, head) {
      var next = lines[pos];
      if (!next || next.ind <= ind) fail(head, 'Nach dem Doppelpunkt muss eine eingerückte Zeile folgen.');
      return parseBlock(next.ind);
    }
    function parseIf(l, ind, kw) {
      var m = new RegExp('^' + kw + '\\s+(.*?)\\s*:$').exec(l.text);
      if (!m) { if (!/:$/.test(l.text)) fail(l, 'Nach der Bedingung fehlt der Doppelpunkt.'); fail(l, 'Hinter ' + kw + ' fehlt die Bedingung.'); }
      if (!m[1]) fail(l, 'Hinter ' + kw + ' fehlt die Bedingung.');
      pos += 1;
      var n = nIf(m[1], [], []);
      n.yes = parseBody(ind, l);
      var nx = lines[pos];
      if (nx && nx.ind === ind && /^elif\b/.test(nx.text)) n.no = [parseIf(nx, ind, 'elif')];
      else if (nx && nx.ind === ind && /^else\b/.test(nx.text)) {
        if (!/^else\s*:$/.test(nx.text)) fail(nx, 'else hat keine Bedingung, nur den Doppelpunkt: else:');
        pos += 1; n.no = parseBody(ind, nx);
      }
      return n;
    }
    if (!lines.length) return { nodes: [] };
    if (lines[0].ind !== 0) fail(lines[0], 'Das Programm beginnt ganz links, ohne Einrückung.');
    var nodes = parseBlock(0);
    if (pos < lines.length) fail(lines[pos], 'Die Einrückung passt zu keiner Zeile davor.');
    return { nodes: nodes };
  }

  /* ── Fehler-im-PAP: Beispiel mit vier eingebauten Fehlern ── */
  function fehlerSpec() {
    return [
      P.start('s'),
      P.io('drehzahl einlesen', 'i1', { shape: 'op' }),
      P.iff('drehzahl > 12000?', [
        P.io('Ausgabe: Drehzahl zu hoch', 'o1', { open: true })
      ], [
        P.io('Ausgabe: Drehzahl ok', 'o2')
      ], 'd1', { noLabel: '' }),
      P.end('e1', 'Ende', { noArrow: true })
    ];
  }
  var api = {
    P: P, layout: layout, svg: svg, figure: figure, describe: describe,
    wSpec: wSpec, wRun: wRun, W_CODE: W_CODE, fehlerSpec: fehlerSpec,
    toLines: toLines, toText: toText, toPap: toPap, parseCode: parseCode, numberTree: numberTree,
    nIn: nIn, nOut: nOut, nOp: nOp, nIf: nIf, pyFloat: pyFloat, nice: nice
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;
  root.KursPAP = api;

  /* ══════════════════════════════════════════════════════════
     DOM-Hilfen
     ══════════════════════════════════════════════════════════ */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
      if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(id) { return window.KIcon ? window.KIcon(id) : document.createTextNode(''); }
  function hl(text) {
    var re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(if|elif|else|and|or|not|True|False|pass)\b|\b(print|input|float|int|str|abs|round)\b|(\b\d+(?:\.\d+)?\b)/g;
    var out = '', last = 0, m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index)).replace(/&quot;/g, '"');
      var cls = m[1] ? 'cm' : (m[2] ? 'st' : (m[3] ? 'kw' : (m[4] ? 'fn' : 'nu')));
      out += '<span class="v05-' + cls + '">' + esc(m[0]).replace(/&quot;/g, '"') + '</span>';
      last = re.lastIndex;
    }
    return out + esc(text.slice(last)).replace(/&quot;/g, '"');
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
  function colorOf(n) { return 'c' + ((n - 1) % 6); }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function mountSvg(host, spec, o) {
    var wrap = el('div', { class: 'pap-wrap' });
    wrap.innerHTML = svg(spec, o);
    host.innerHTML = ''; host.appendChild(wrap);
    return wrap.querySelector('svg');
  }
  function markSolved(task) {
    var A = window.KursAufgaben;
    if (!A || !task) return;
    var id = task.getAttribute('data-id');
    if (!id) return;
    A.store.setSolved(document.body.getAttribute('data-lesson') || 'V05', id);
    task.classList.add('is-solved');
    A.update();
  }

  /* ── Code-Anzeige mit Zeilennummern ──────────────────────── */
  function drawCode(lines, numOf, opts) {
    opts = opts || {};
    var box = el('div', { class: 'v05-codewrap' });
    var code = el('div', { class: 'v05-code', role: 'region', 'aria-label': opts.label || 'Python-Code', tabindex: '0' });
    lines.forEach(function (l, k) {
      var num = numOf ? numOf(l, k) : (k + 1);
      var cls = 'v05-line' + (opts.colorOf && num ? ' ' + opts.colorOf(num) : '') + (opts.click ? ' is-click' : '');
      var row = el('div', { class: cls });
      if (l.id) row.setAttribute('data-bid', l.id);
      row.setAttribute('data-ln', String(k + 1));
      row.appendChild(el('span', { class: 'v05-ln', 'aria-hidden': 'true', text: String(num != null ? num : '') }));
      var tx = el('span', { class: 'v05-tx' });
      tx.innerHTML = hl(new Array((l.ind || 0) * 4 + 1).join(' ') + l.text);
      row.appendChild(tx);
      code.appendChild(row);
    });
    box.appendChild(code);
    return box;
  }
  function copyButton(getText) {
    var b = el('button', { type: 'button', class: 'v05-copy', text: 'Kopieren' });
    var live = el('span', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    b.addEventListener('click', function () {
      var t = getText();
      function ok() { b.textContent = 'Kopiert'; live.textContent = 'Code kopiert'; setTimeout(function () { b.textContent = 'Kopieren'; live.textContent = ''; }, 1600); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { /* ohne Zwischenablage weiter */ });
      else { var ta = el('textarea', { 'aria-hidden': 'true' }); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* ohne Kopie weiter */ } document.body.removeChild(ta); }
    });
    return [b, live];
  }
  function runnable(host, code, stdin) {
    var pre = el('pre'); if (stdin) pre.setAttribute('data-stdin', stdin);
    pre.appendChild(el('code', { text: code }));
    host.innerHTML = ''; host.appendChild(pre);
    if (window.KursRunner && window.KursRunner.enhance) window.KursRunner.enhance(pre);
  }

  /* ══════════════════════════════════════════════════════════
     (B) Symbol-Lexikon
     ══════════════════════════════════════════════════════════ */
  var LEX = [
    { key: 'grenz', name: 'Grenzstelle', form: 'Oval (Rechteck mit Halbkreis-Enden)',
      small: function () { return [P.start('a')]; },
      big: function () { return [[P.start('a'), P.end('b')]]; },
      text: 'Hier beginnt oder endet der Ablauf. Jeder PAP hat genau einen Start und mindestens ein Ende.',
      py: null, pyNote: 'Kein eigener Code: Das Programm beginnt bei der ersten Zeile und endet nach der letzten (oder wenn kein Weg mehr weiterführt).' },
    { key: 'op', name: 'Operation', form: 'Rechteck',
      small: function () { return [P.op('x = 2 · y', 'a')]; },
      big: function () { return [[P.op('werkstoff = "C45E"', 'a')], [P.op('A = π · d² / 4', 'b')]]; },
      text: 'Eine Verarbeitung: rechnen oder einer Variablen einen Wert zuweisen. Im Symbol steht, was passiert.',
      py: 'werkstoff = "C45E"\nflaeche = 3.14 * 10 ** 2 / 4\nprint(werkstoff, flaeche)', hot: [0, 1], stdin: '' },
    { key: 'io', name: 'Ein-/Ausgabe', form: 'Parallelogramm',
      small: function () { return [P.io('x einlesen', 'a')]; },
      big: function () { return [[P.io('spannung einlesen', 'a')], [P.io('Ausgabe: werkstoff', 'b')]]; },
      text: 'Daten kommen herein (Tastatur, Sensor, Datei) oder gehen heraus (Bildschirm, Anzeige). Lesen und Schreiben haben dasselbe Symbol.',
      py: 'spannung = float(input("Spannung in MPa: "))\nwerkstoff = "C45E"\nprint("Werkstoff:", werkstoff)', hot: [0, 2], stdin: '180' },
    { key: 'if', name: 'Verzweigung', form: 'Raute mit Frage',
      small: function () { return [P.iff('x ≤ 5?', [], [], 'a')]; },
      big: function () { return [[P.iff('spannung ≤ 140?', [P.op('werkstoff = "S235JR"', 'y')], [P.op('werkstoff = "C45E"', 'n')], 'a')]]; },
      text: 'Eine Ja/Nein-Frage. Genau ein Eingang, zwei beschriftete Ausgänge „ja“ und „nein“. Es läuft immer nur ein Weg.',
      py: 'spannung = float(input("Spannung in MPa: "))\nif spannung <= 140:\n    werkstoff = "S235JR"\nelse:\n    werkstoff = "C45E"\nprint(werkstoff)', hot: [1, 2, 3, 4], stdin: '180' },
    { key: 'linie', name: 'Ablauflinie', form: 'Linie mit Pfeilspitze',
      small: function () { return [P.op('A', 'a'), P.op('B', 'b')]; },
      big: function () { return [[P.op('Schritt 1', 'a'), P.op('Schritt 2', 'b'), P.op('Schritt 3', 'c')]]; },
      text: 'Sie legt die Reihenfolge fest. Vorzugsrichtung: von oben nach unten und von links nach rechts. Pfeile zeichnest du immer.',
      py: null, pyNote: 'In Python ist die Ablauflinie die Zeilenfolge von oben nach unten. Laufen zwei Linien zusammen, endet die Einrückung des Zweigs.' },
    { key: 'conn', name: 'Übergangsstelle', form: 'kleiner Kreis mit Nummer',
      small: function () { return [{ id: 'a', t: 'conn', text: '1' }]; },
      big: function () { return [[P.op('… Seite 1', 'a'), { id: 'b', t: 'conn', text: '1' }], [{ id: 'c', t: 'conn', text: '1' }, P.op('Seite 2 …', 'd')]]; },
      text: 'Die Linie wird an anderer Stelle (zum Beispiel auf der nächsten Seite) beim Kreis mit derselben Nummer fortgesetzt. So vermeidest du Linienkreuzungen.',
      py: null, pyNote: 'Dafür gibt es keinen Python-Code. Die Übergangsstelle ist nur eine Zeichenhilfe.' }
  ];
  function initLexikon(host) {
    var cur = 0;
    var bar = el('div', { class: 'v05-lex', role: 'group', 'aria-label': 'Symbole des Programmablaufplans' });
    var detail = el('div', { class: 'v05-lexdetail', 'aria-live': 'polite' });
    var btns = LEX.map(function (it, i) {
      var b = el('button', { type: 'button', class: 'v05-lexbtn', 'aria-pressed': i === 0 ? 'true' : 'false' });
      var holder = el('div');
      holder.innerHTML = '<div class="pap-wrap">' + svg(it.small(), { label: it.name + ': ' + it.form, minw: 0 }) + '</div>';
      b.appendChild(holder); b.appendChild(el('span', { text: it.name }));
      b.addEventListener('click', function () { cur = i; btns.forEach(function (o, k) { o.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); show(); });
      bar.appendChild(b);
      return b;
    });
    var note = el('p', { class: 'k-small k-muted', text: 'Ein siebtes Symbol, das Unterprogramm (Rechteck mit doppelten senkrechten Seitenlinien), erwähnen wir nur: Es gehört zu V07, wenn du eigene Funktionen mit def baust.' });
    host.appendChild(el('div', { class: 'v05-ex' }, [bar, detail, note]));
    function show() {
      var it = LEX[cur];
      detail.innerHTML = '';
      var left = el('div', { class: 'v05-lexbig' });
      it.big().forEach(function (spec) { var h = el('div'); h.innerHTML = svg(spec, { label: it.name + ': ' + it.form, minw: 0, cls: 'pap--lexi' }); var w = el('div', { class: 'pap-wrap' }); w.appendChild(h.firstChild); left.appendChild(w); });
      var right = el('div');
      right.appendChild(el('h4', { text: it.name + ' (' + it.form + ')' }));
      right.appendChild(el('p', { text: it.text }));
      if (it.py) {
        var lines = it.py.split('\n').map(function (t) { return { ind: 0, text: t }; });
        var cw = drawCode(lines, function (l, k) { return k + 1; }, { label: 'Passender Python-Code' });
        (it.hot || []).forEach(function (h) { var r = cw.querySelector('.v05-line[data-ln="' + (h + 1) + '"]'); if (r) r.classList.add('is-active'); });
        var parts = copyButton(function () { return it.py; });
        cw.appendChild(parts[0]); cw.appendChild(parts[1]);
        right.appendChild(el('p', { class: 'v05-h', text: 'Passende Python-Zeilen (hervorgehoben)' }));
        right.appendChild(cw);
        var tryBtn = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Im Editor ausprobieren', style: 'margin-top:12px' });
        var runHost = el('div', { class: 'v05-run' });
        tryBtn.addEventListener('click', function () { runnable(runHost, it.py, it.stdin); });
        right.appendChild(tryBtn); right.appendChild(runHost);
      } else right.appendChild(el('p', { class: 'v05-msg', text: it.pyNote }));
      detail.appendChild(left); detail.appendChild(right);
    }
    show();
  }

  /* ══════════════════════════════════════════════════════════
     (C) PAP läuft ab
     ══════════════════════════════════════════════════════════ */
  function initAblauf(host) {
    var NUM = /^[-+]?(\d+(\.\d*)?|\.\d+)$/;
    var presets = [['180 / 20', '180', '20'], ['150 / 400', '150', '400'], ['250 / 400', '250', '400'], ['100 / 100', '100', '100'], ['250 / 20', '250', '20'], ['−5 / 20', '-5', '20'], ['140 / 20', '140', '20']];
    var spec = wSpec(), run = null, idx = -1, timer = null, anim = 0, nodeText = {};
    var inS = el('input', { type: 'text', inputmode: 'decimal', value: '180', autocomplete: 'off', 'aria-describedby': 'ab-hint' });
    var inT = el('input', { type: 'text', inputmode: 'decimal', value: '20', autocomplete: 'off', 'aria-describedby': 'ab-hint' });
    var fS = el('label', { class: 'k-field' }, [el('span', { text: 'Spannung in MPa' }), inS]);
    var fT = el('label', { class: 'k-field' }, [el('span', { text: 'Temperatur in °C' }), inT]);
    var chips = el('div', { class: 'v05-chips' }, [el('span', { class: 'v05-label', text: 'Beispiele (Spannung / Temperatur):' })]);
    presets.forEach(function (p) {
      var c = el('button', { type: 'button', class: 'k-chip', text: p[0] });
      c.addEventListener('click', function () { inS.value = p[1]; inT.value = p[2]; start(); });
      chips.appendChild(c);
    });
    var inputs = el('div', { class: 'v05-inputs' }, [fS, fT]);
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Abspielen' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Von vorn' });
    var count = el('span', { class: 'v05-count', 'aria-hidden': 'true' });
    var ctrl = el('div', { class: 'v05-ctrl' }, [bBack, bNext, bPlay, bReset, count]);
    var papHost = el('div');
    var codeHost = el('div');
    var dockCode = el('div', { class: 'v05-dockcode', 'aria-hidden': 'true' });
    var dockState = el('div', { class: 'v05-dockstate', 'aria-hidden': 'true' });
    var state = el('dl', { class: 'v05-state' });
    var outBox = el('pre', { class: 'v05-out', 'aria-label': 'Ausgabe des Programms' });
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite', id: 'ab-hint' });
    var dock = el('div', { class: 'v05-dock' }, [ctrl, msg, el('div', { class: 'v05-dockrow' }, [dockCode, dockState])]);
    var stateWrap = el('div', {}, [el('h4', { class: 'v05-h', text: 'Variablen' }), state, el('h4', { class: 'v05-h', style: 'margin-top:16px', text: 'Ausgabe' }), outBox]);
    var lower = el('div', { class: 'v05-cols v05-cols--eq' }, [el('div', {}, [el('h4', { class: 'v05-h', text: 'Python-Code' }), codeHost]), stateWrap]);
    host.appendChild(el('div', { class: 'v05-ex' }, [inputs, chips, papHost, dock, lower]));

    var svgEl = mountSvg(papHost, spec, { cls: 'pap--run', label: describe(spec), minw: 0.8 });
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('class', 'pap-marker'); marker.setAttribute('r', '8'); marker.setAttribute('visibility', 'hidden');
    svgEl.appendChild(marker);
    var lines = W_CODE.map(function (t) { var ind = t.match(/^ */)[0].length / 4; return { ind: ind, text: t.trim() }; });
    var cw = drawCode(lines, function (l, k) { return k + 1; }, { label: 'Python-Code des Werkstoff-Programms' });
    var parts = copyButton(function () { return W_CODE.join('\n'); });
    cw.appendChild(parts[0]); cw.appendChild(parts[1]);
    codeHost.appendChild(cw);

    function nodeEl(id) { return svgEl.querySelector('.pap-n[data-id="' + id + '"]'); }
    function edgeEl(from, to, lab) {
      var es = svgEl.querySelectorAll('.pap-e'), k;
      for (k = 0; k < es.length; k++) if (es[k].getAttribute('data-from') === from && es[k].getAttribute('data-to') === to && es[k].getAttribute('data-lab') === (lab || '')) return es[k];
      return null;
    }
    function parse() {
      var a = inS.value.trim(), b = inT.value.trim();
      if (!NUM.test(a) || !NUM.test(b)) {
        var comma = /,/.test(a + b);
        return { err: comma ? 'Python erwartet den Dezimalpunkt: schreibe 2.5 statt 2,5.' : 'Bitte zwei Zahlen eingeben. Ohne Prüfung bricht das echte Programm bei Text wie „abc“ mit einem ValueError ab. Das Abfangen lernst du in V09.' };
      }
      return { sp: parseFloat(a), te: parseFloat(b) };
    }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } anim += 1; marker.setAttribute('visibility', 'hidden'); bPlay.textContent = 'Abspielen'; }
    function start() {
      stop();
      var p = parse();
      if (p.err) { run = null; idx = -1; msg.className = 'v05-msg is-bad'; msg.textContent = p.err; [bBack, bNext, bPlay].forEach(function (b) { b.disabled = true; }); paint(); return; }
      run = wRun(p.sp, p.te); idx = -1;
      msg.className = 'v05-msg'; msg.textContent = 'Eingaben: Spannung ' + fm(p.sp) + ' MPa, Temperatur ' + fm(p.te) + ' °C. Drück „Nächster Schritt“ oder „Abspielen“. Eine rote Marke läuft dann den Weg durch den Plan.';
      paint();
    }
    /* Zustand bei Schritt i zeichnen. onEdge: die Linie zu Schritt i ist gerade unterwegs */
    function paint(onEdge) {
      var k, st = run && idx >= 0 ? run.steps[idx] : null;
      Array.prototype.forEach.call(svgEl.querySelectorAll('.is-active, .is-done, .is-on, .is-past'), function (n) { n.classList.remove('is-active', 'is-done', 'is-on', 'is-past'); });
      if (run) for (k = 0; k <= idx; k++) {
        var s = run.steps[k], ne = nodeEl(s.id);
        if (ne && !(k === idx && onEdge)) ne.classList.add(k === idx ? 'is-active' : 'is-done');
        if (k > 0) { var ee = edgeEl(s.from, s.id, s.lab); if (ee) ee.classList.add(k === idx && onEdge ? 'is-on' : 'is-past'); }
      }
      Array.prototype.forEach.call(cw.querySelectorAll('.is-active'), function (r) { r.classList.remove('is-active'); });
      if (st && !onEdge) st.lines.forEach(function (ln) { var r = cw.querySelector('.v05-line[data-ln="' + ln + '"]'); if (r) r.classList.add('is-active'); });
      state.innerHTML = '';
      ['spannung', 'temperatur', 'werkstoff'].forEach(function (v) {
        var val = st && st.vars[v] !== undefined ? st.vars[v] : null;
        var shown = val === null ? '–' : (v === 'werkstoff' ? '"' + val + '"' : val);
        state.appendChild(el('dt', { text: v }));
        state.appendChild(el('dd', { class: st && st.changed.indexOf(v) >= 0 && !onEdge ? 'is-new' : '', text: shown }));
      });
      outBox.textContent = st && st.out.length ? st.out.join('\n') : '';
      var al = st && !onEdge && st.lines.length ? st.lines[st.lines.length - 1] : 0;
      dockCode.innerHTML = al ? '<span class="v05-dockln">Zeile ' + al + '</span> ' + hl(W_CODE[al - 1]) : '<span class="v05-dockln">Python</span> ' + (st && !onEdge ? '(keine Codezeile: Start und Ende gehören zu keiner Zeile)' : '…');
      dockState.textContent = st ? ['spannung', 'temperatur', 'werkstoff'].map(function (v) { return v + ' = ' + (st.vars[v] === undefined ? '–' : (v === 'werkstoff' ? '"' + st.vars[v] + '"' : st.vars[v])); }).join('   ') + (st.out.length ? '   Ausgabe: ' + st.out[st.out.length - 1] : '') : '';
      var total = run ? run.steps.length : 0;
      if (st) { msg.className = 'v05-msg' + (idx === total - 1 && !onEdge ? ' is-ok' : ''); msg.textContent = 'Schritt ' + (idx + 1) + ' von ' + total + ': ' + st.msg; }
      count.textContent = run ? (idx + 1) + ' / ' + total : '';
      bBack.disabled = !run || idx < 0;
      bNext.disabled = !run || idx >= total - 1;
      bPlay.disabled = !run || (idx >= total - 1 && !timer);
    }
    /* Marke entlang der Linie zum nächsten Schritt schicken, dann Schritt anzeigen */
    function advance(done) {
      if (!run || idx >= run.steps.length - 1) { if (done) done(); return; }
      var s = run.steps[idx + 1], e = edgeEl(s.from, s.id, s.lab), token = ++anim;
      idx += 1;
      var path = e ? e.querySelector('.pap-line') : null;
      if (!path || !path.getTotalLength || reduced()) { paint(); if (done) done(); return; }
      paint(true);
      var len = path.getTotalLength(), dur = Math.min(1000, 260 + len * 2.4), t0 = null;
      marker.setAttribute('visibility', 'visible');
      function frame(ts) {
        if (token !== anim) return;
        if (t0 === null) t0 = ts;
        var u = Math.min(1, (ts - t0) / dur), pt = path.getPointAtLength(len * (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2));
        marker.setAttribute('cx', pt.x); marker.setAttribute('cy', pt.y);
        if (u < 1) requestAnimationFrame(frame);
        else { marker.setAttribute('visibility', 'hidden'); paint(); if (done) done(); }
      }
      requestAnimationFrame(frame);
    }
    bNext.addEventListener('click', function () { stop(); advance(); });
    bBack.addEventListener('click', function () { stop(); if (idx >= 0) { idx -= 1; if (idx < 0) { msg.className = 'v05-msg'; msg.textContent = 'Am Anfang. Drück „Nächster Schritt“.'; } paint(); } });
    bReset.addEventListener('click', function () { start(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); paint(); return; }
      if (run && idx >= run.steps.length - 1) { idx = -1; paint(); }
      bPlay.textContent = 'Pause';
      timer = true;
      (function loop() {
        advance(function () {
          if (!timer) return;
          if (!run || idx >= run.steps.length - 1) { timer = null; bPlay.textContent = 'Abspielen'; paint(); return; }
          timer = setTimeout(loop, 650);
        });
      })();
    });
    [inS, inT].forEach(function (i) { i.addEventListener('input', function () { start(); }); });
    start();
  }

  /* ══════════════════════════════════════════════════════════
     (D) PAP-Baukasten
     ══════════════════════════════════════════════════════════ */
  var KINDS = [['in', 'Eingabe (Parallelogramm)'], ['out', 'Ausgabe (Parallelogramm)'], ['op', 'Operation (Rechteck)'], ['if', 'Verzweigung (Raute)']];
  var PRESETS = {
    'Gerüst mit Lücken': function () { return [nIn(''), nIf('', [nOut('')], [nOut('')])]; },
    'Sequenz': function () { return [nIn('x'), nOp('y = 2 * x + 1'), nOut('"y =", y')]; },
    'ja/nein': function () { return [nIn('x'), nIf('x < 0', [nOp('betrag = -x')], [nOp('betrag = x')]), nOut('"Betrag:", betrag')]; },
    'Verschachtelt': function () { return [nIn('t'), nIf('t > 100', [nIf('t > 300', [nOut('"Sonderwerkstoff"')], [nOut('"warmfest"')])], [nOut('"Standardwerkstoff"')])]; },
    'Kette (elif)': function () { return [nIn('s'), nIf('s >= 1.5', [nOut('"sicher"')], [nIf('s >= 1.0', [nOut('"knapp"')], [nOut('"Versagen"')])])]; },
    'Eingabe prüfen': function () { return [nIn('spannung'), nIf('spannung <= 0 or spannung > 1000', [nOut('"unplausibel"')], [nOut('"ok"')])]; }
  };
  function placeholderOf(k) { return k === 'in' ? 'Variable, z. B. spannung' : (k === 'out' ? 'z. B. "ok" oder "Wert:", x' : (k === 'op' ? 'z. B. y = 2 * x' : 'Bedingung, z. B. x < 0')); }
  function ariaOf(k) { return k === 'in' ? 'Variable zum Einlesen' : (k === 'out' ? 'Ausgabe (Argumente von print)' : (k === 'op' ? 'Anweisung' : 'Bedingung')); }

  function initBaukasten(host) {
    var tree = PRESETS['Gerüst mit Lücken']();
    var mode = 0, focusId = null, pinned = null, codeErr = null;
    var segHost = el('div', { class: 'v05-bar' });
    var presetBar = el('div', { class: 'v05-chips' });
    presetBar.appendChild(el('span', { class: 'v05-label', text: 'Beispiel laden:' }));
    Object.keys(PRESETS).forEach(function (k) {
      var c = el('button', { type: 'button', class: 'k-chip', text: k });
      c.addEventListener('click', function () { tree = PRESETS[k](); codeErr = null; pinned = null; if (mode === 1) ta.value = toText(tree); full(); announce('Beispiel „' + k + '“ geladen.'); });
      presetBar.appendChild(c);
    });
    var clr = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Alles leeren' });
    clr.addEventListener('click', function () { tree = []; codeErr = null; if (mode === 1) ta.value = ''; full(); announce('Der Baukasten ist leer.'); });
    presetBar.appendChild(clr);
    segHost.appendChild(segment(['PAP baut Code', 'Code baut PAP'], 'Richtung', 0, function (i) { mode = i; codeErr = null; if (mode === 1) ta.value = toText(tree); full(); }));

    var left = el('div'), right = el('div');
    var leftH = el('h4', { class: 'v05-h', text: 'Programmablaufplan' });
    var papHost = el('div');
    var edit = el('div', { class: 'v05-edit' });
    var hint = el('p', { class: 'k-small k-muted' });
    left.appendChild(leftH); left.appendChild(papHost); left.appendChild(edit); left.appendChild(hint);
    var rightH = el('h4', { class: 'v05-h', text: 'Python-Code' });
    var ta = el('textarea', { class: 'v05-ta', spellcheck: 'false', 'aria-label': 'Python-Code eintippen, daraus entsteht der Programmablaufplan', rows: '10', hidden: '' });
    var codeHost = el('div');
    var runHost = el('div', { class: 'v05-run' });
    var tryBtn = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Code im Editor ausprobieren' });
    right.appendChild(rightH); right.appendChild(ta); right.appendChild(codeHost); right.appendChild(el('div', { class: 'v05-ctrl', style: 'margin-top:12px' }, [tryBtn])); right.appendChild(runHost);
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var live = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    host.appendChild(el('div', { class: 'v05-ex' }, [segHost, presetBar, el('div', { class: 'v05-cols v05-cols--pap' }, [left, right]), msg, live]));

    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 20); }
    function setHot(id) {
      Array.prototype.forEach.call(host.querySelectorAll('.is-hot'), function (n) { n.classList.remove('is-hot'); });
      if (id) Array.prototype.forEach.call(host.querySelectorAll('[data-bid="' + id + '"]'), function (n) { n.classList.add('is-hot'); });
    }
    function colorize(nodes) { nodes.forEach(function (n) { n.cls = colorOf(n.num); if (n.k === 'if') { colorize(n.yes); colorize(n.no); } }); }
    function convertKind(n, k) {
      n.k = k;
      if (k === 'if') { n.yes = n.yes || []; n.no = n.no || []; } else { delete n.yes; delete n.no; }
    }
    var ops = {
      add: function (arr, k) { var n = k === 'in' ? nIn('') : (k === 'out' ? nOut('') : (k === 'op' ? nOp('') : nIf('', [], []))); arr.push(n); focusId = n.id; codeErr = null; full(); announce('Symbol eingefügt.'); },
      del: function (arr, i) { arr.splice(i, 1); full(); announce('Symbol gelöscht.'); },
      move: function (arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; focusId = t.id; full(); announce('Symbol verschoben.'); }
    };
    function addSelect(arr) {
      var s = el('select', { 'aria-label': 'Symbol am Ende dieser Liste einfügen' }, [el('option', { value: '', text: '+ Symbol einfügen …' })]);
      KINDS.forEach(function (k) { s.appendChild(el('option', { value: k[0], text: k[1] })); });
      s.addEventListener('change', function () { if (s.value) ops.add(arr, s.value); });
      return el('div', { class: 'v05-add' }, [s]);
    }
    function row(n, arr, i) {
      var r = el('div', { class: 'v05-row ' + (n.cls || ''), 'data-bid': n.id });
      r.appendChild(el('span', { class: 'v05-ln', 'aria-hidden': 'true', text: String(n.num) }));
      var sel = el('select', { 'aria-label': 'Symbolart von Symbol ' + n.num });
      KINDS.forEach(function (k) { sel.appendChild(el('option', { value: k[0], text: k[1] })); });
      sel.value = n.k;
      sel.addEventListener('change', function () { convertKind(n, sel.value); focusId = n.id; full(); });
      var inp = el('input', { type: 'text', value: n.v, placeholder: placeholderOf(n.k), 'aria-label': ariaOf(n.k) + ', Symbol ' + n.num, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      inp.addEventListener('input', function () { n.v = inp.value; codeErr = null; renderPap(); renderCode(); });
      var up = el('button', { type: 'button', class: 'v05-tb', 'aria-label': 'Symbol ' + n.num + ' nach oben', title: 'Nach oben' }, [icon('chevron-up')]);
      var dn = el('button', { type: 'button', class: 'v05-tb', 'aria-label': 'Symbol ' + n.num + ' nach unten', title: 'Nach unten' }, [icon('chevron-down')]);
      var rm = el('button', { type: 'button', class: 'v05-tb', 'aria-label': 'Symbol ' + n.num + ' löschen', title: 'Löschen' }, [icon('x')]);
      if (i === 0) up.disabled = true;
      if (i === arr.length - 1) dn.disabled = true;
      up.addEventListener('click', function () { ops.move(arr, i, -1); });
      dn.addEventListener('click', function () { ops.move(arr, i, 1); });
      rm.addEventListener('click', function () { ops.del(arr, i); });
      [sel, inp, up, dn, rm].forEach(function (c) { r.appendChild(c); });
      r._inp = inp;
      return r;
    }
    function list(arr) {
      var box = el('div', { class: 'v05-list' });
      arr.forEach(function (n, i) {
        var r = row(n, arr, i); box.appendChild(r);
        if (n.k === 'if') {
          var ys = el('div', { class: 'v05-sub' }, [el('h5', { text: 'Weg „ja“' }), list(n.yes), addSelect(n.yes)]);
          var ns = el('div', { class: 'v05-sub' }, [el('h5', { text: 'Weg „nein“' }), list(n.no), addSelect(n.no)]);
          box.appendChild(ys); box.appendChild(ns);
        }
      });
      return box;
    }
    function prep() { numberTree(tree); colorize(tree); }
    function renderEdit() {
      prep();
      edit.innerHTML = '';
      if (mode !== 0) return;
      edit.appendChild(el('p', { class: 'v05-label', text: 'Gerüst bearbeiten (Start und Ende stehen fest):' }));
      edit.appendChild(list(tree)); edit.appendChild(addSelect(tree));
    }
    function renderPap() {
      prep();
      var sp = toPap(tree);
      mountSvg(papHost, sp, { label: describe(sp), minw: 0.7 });
      if (pinned) setHot(pinned);
    }
    function renderCode() {
      prep();
      var lines = toLines(tree, 0, []), byId = {};
      (function walk(a) { a.forEach(function (n) { byId[n.id] = n.num; if (n.k === 'if') { walk(n.yes); walk(n.no); } }); })(tree);
      codeHost.innerHTML = '';
      var cw = drawCode(lines.length ? lines : [{ ind: 0, text: '# leer: füge ein Symbol ein', id: null }], function (l) { return l.id ? byId[l.id] : ''; }, { colorOf: colorOf, click: true, label: 'Erzeugter Python-Code' });
      var parts = copyButton(function () { return toText(tree); });
      cw.appendChild(parts[0]); cw.appendChild(parts[1]);
      codeHost.appendChild(cw);
      if (pinned) setHot(pinned);
    }
    function full() {
      leftH.textContent = mode === 0 ? 'Programmablaufplan (entsteht live)' : 'Programmablaufplan (entsteht aus dem Code)';
      rightH.textContent = mode === 0 ? 'Python-Code (entsteht live)' : 'Python-Code (hier tippst du)';
      ta.hidden = mode === 0;
      renderEdit(); renderPap(); renderCode();
      var empty = tree.some(function f(n) { return String(n.v).trim() === '' || (n.k === 'if' && (n.yes.some(f) || n.no.some(f))); });
      msg.className = 'v05-msg' + (codeErr ? ' is-bad' : '');
      msg.textContent = codeErr ? codeErr : (mode === 0
        ? (empty ? 'Die gestrichelten Felder sind noch Lücken: Wähle die Symbolart und trage den Text ein. Rechts entsteht der Code, sobald alles ausgefüllt ist. Ein if direkt im Nein-Weg einer Raute schreibt Python als elif.' : 'Ein if direkt im Nein-Weg einer Raute schreibt Python als elif. Die Einrückung (4 Leerzeichen) zeigt, welche Zeilen zu welchem Weg gehören.')
        : 'Tippe oder ändere den Code. Erlaubt sind Zuweisungen, print, input, if, elif und else (Einrückung: 4 Leerzeichen).');
      if (focusId) {
        var f = edit.querySelector('[data-bid="' + focusId + '"] input');
        if (f) f.focus();
        focusId = null;
      }
    }
    ta.addEventListener('input', function () {
      try {
        var r = parseCode(ta.value);
        tree = r.nodes; codeErr = null;
        msg.className = 'v05-msg is-ok'; msg.textContent = r.nodes.length ? 'Gelesen: ' + countBlocks(tree) + ' Symbole. Der PAP zeigt, wie dein Code verzweigt.' : 'Noch kein Code.';
      } catch (e) {
        codeErr = e.message; msg.className = 'v05-msg is-bad'; msg.textContent = e.message + ' Der PAP zeigt den letzten gültigen Stand.';
      }
      renderPap(); renderCode();
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; ta.dispatchEvent(new Event('input')); }
    });
    host.addEventListener('mouseover', function (e) { var b = e.target.closest ? e.target.closest('[data-bid]') : null; setHot(b ? b.getAttribute('data-bid') : pinned); });
    host.addEventListener('mouseout', function (e) { if (!e.relatedTarget || !host.contains(e.relatedTarget)) setHot(pinned); });
    host.addEventListener('focusin', function (e) { var b = e.target.closest ? e.target.closest('[data-bid]') : null; if (b) setHot(b.getAttribute('data-bid')); });
    host.addEventListener('focusout', function () { setHot(pinned); });
    host.addEventListener('click', function (e) {
      var row = e.target.closest ? e.target.closest('.v05-line[data-bid]') : null;
      if (!row) return;
      var id = row.getAttribute('data-bid'); pinned = pinned === id ? null : id; setHot(pinned);
      var inp = mode === 0 ? edit.querySelector('[data-bid="' + id + '"] input') : null;
      if (inp) inp.focus();
    });
    tryBtn.addEventListener('click', function () {
      var n = 0; (function c(a) { a.forEach(function (x) { if (x.k === 'in') n += 1; if (x.k === 'if') { c(x.yes); c(x.no); } }); })(tree);
      var stdin = []; for (var q = 0; q < Math.max(1, n); q++) stdin.push('5');
      runnable(runHost, toText(tree) || '# leer', stdin.join('\n'));
    });
    ta.value = toText(tree);
    full();
  }

  /* ══════════════════════════════════════════════════════════
     (E) Fehler im PAP finden
     ══════════════════════════════════════════════════════════ */
  var FEHLER = [
    { key: 'node:i1', name: 'Eingabe im Rechteck', msg: '„drehzahl einlesen“ ist eine Eingabe. Sie gehört in ein Parallelogramm, nicht in ein Rechteck (Operation).' },
    { key: 'edge:d1>o2', name: 'Ausgang ohne Beschriftung', msg: 'Der Ausgang „nein“ der Raute ist nicht beschriftet. Jede Raute hat zwei Ausgänge, und beide tragen „ja“ oder „nein“.' },
    { key: 'node:o1', name: 'Zweig ohne Ziel', msg: 'Dieser Zweig endet im Nichts: Von hier führt keine Linie weiter. Jeder Weg muss zur Zusammenführung oder zu einem Ende laufen.' },
    { key: 'edge:o2>e1', name: 'Pfeilspitze fehlt', msg: 'Am Pfeil zum Ende fehlt die Pfeilspitze. Pfeile zeichnest du immer, sonst ist die Richtung nicht eindeutig.' }
  ];
  function initFehler(host) {
    var spec = fehlerSpec(), lay = layout(spec), texts = {};
    lay.nodes.forEach(function (n) { texts[n.id] = n.text; });
    var found = {}, revealed = false;
    var score = el('span', { class: 'v05-score', 'aria-hidden': 'true' });
    var bReveal = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Auflösen' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Neu anfangen' });
    var ctrl = el('div', { class: 'v05-ctrl' }, [score, bReveal, bReset]);
    var papHost = el('div');
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var listEl = el('ul', { class: 'v05-foundlist' });
    host.appendChild(el('div', { class: 'v05-ex' }, [ctrl, papHost, msg, listEl]));
    var svgEl = mountSvg(papHost, spec, { cls: 'pap--find', label: describe(spec) + ' Dieser Plan enthält vier Zeichenfehler. Klicke die Symbole und Linien an, die du für falsch hältst.', minw: 0.9 });
    function keyOf(g) { return g.classList.contains('pap-n') ? 'node:' + g.getAttribute('data-id') : 'edge:' + g.getAttribute('data-from') + '>' + g.getAttribute('data-to'); }
    function labelOf(g) {
      if (g.classList.contains('pap-n')) return 'Symbol: ' + texts[g.getAttribute('data-id')];
      var f = g.getAttribute('data-from'), t = g.getAttribute('data-to'), l = g.getAttribute('data-lab');
      return 'Linie von „' + texts[f] + '“ nach „' + texts[t] + '“' + (l ? ' (Ausgang ' + l + ')' : '');
    }
    var groups = Array.prototype.slice.call(svgEl.querySelectorAll('.pap-n, .pap-e'));
    groups.forEach(function (g) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', labelOf(g)); });
    function nFound() { return Object.keys(found).length; }
    function refresh() {
      score.textContent = 'Gefunden: ' + nFound() + ' von ' + FEHLER.length;
      listEl.innerHTML = '';
      FEHLER.forEach(function (f) {
        if (found[f.key] || revealed) listEl.appendChild(el('li', { class: found[f.key] ? '' : 'is-missed-li' }, [el('strong', { text: f.name + (found[f.key] ? '' : ' (nicht gefunden)') + ': ' }), f.msg]));
      });
      groups.forEach(function (g) {
        var k = keyOf(g), isErr = FEHLER.some(function (f) { return f.key === k; });
        g.classList.toggle('is-found', !!found[k]);
        g.classList.toggle('is-missed', revealed && isErr && !found[k]);
      });
    }
    function pick(g) {
      var k = keyOf(g), f = FEHLER.filter(function (x) { return x.key === k; })[0];
      if (f) {
        if (found[k]) { msg.className = 'v05-msg'; msg.textContent = 'Den hast du schon gefunden: ' + f.msg; return; }
        found[k] = true; refresh();
        msg.className = 'v05-msg is-ok';
        msg.textContent = 'Richtig, Fehler ' + nFound() + ' von ' + FEHLER.length + ': ' + f.msg + (nFound() === FEHLER.length ? ' Alle vier gefunden.' : '');
      } else {
        g.classList.add('is-ok');
        msg.className = 'v05-msg';
        msg.textContent = (g.classList.contains('pap-e') ? 'Diese Linie ist richtig gezeichnet: eindeutige Richtung mit Pfeilspitze. ' : 'Dieses Symbol ist richtig: Form und Text passen zusammen. ') + 'Suche weiter.';
      }
    }
    svgEl.addEventListener('click', function (e) { var g = e.target.closest ? e.target.closest('.pap-n, .pap-e') : null; if (g && !revealed) pick(g); });
    svgEl.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !revealed) { var g = e.target.closest ? e.target.closest('.pap-n, .pap-e') : null; if (g) { e.preventDefault(); pick(g); } } });
    bReveal.addEventListener('click', function () { revealed = true; msg.className = 'v05-msg'; msg.textContent = 'So sieht die Auflösung aus: Gefundene Fehler sind grün, die übrigen rot gestrichelt markiert.'; refresh(); });
    bReset.addEventListener('click', function () { found = {}; revealed = false; groups.forEach(function (g) { g.classList.remove('is-ok'); }); msg.className = 'v05-msg'; msg.textContent = 'Klicke ein Symbol oder eine Linie an, die du für falsch hältst. Vier Fehler sind eingebaut.'; refresh(); });
    msg.textContent = 'Klicke ein Symbol oder eine Linie an, die du für falsch hältst. Vier Fehler sind eingebaut. Das Programm dahinter: Eine Drehzahl wird eingelesen; über 12000 gibt es „zu hoch“, sonst „ok“.';
    refresh();
  }

  /* ══════════════════════════════════════════════════════════
     (F) PAP ergänzen: Code gegeben, Symbole und Texte fehlen
     ══════════════════════════════════════════════════════════ */
  function normText(s) {
    return String(s).toLowerCase().replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=').replace(/[·×]/g, '*').replace(/−/g, '-')
      .replace(/\boder\b/g, 'or').replace(/\bund\b/g, 'and').replace(/\bnicht\b/g, 'not').replace(/[„“"'?]/g, '').replace(/\s+/g, '');
  }
  var LUECKEN = {
    anlage: {
      code: 'temperatur = float(input("Temperatur in °C: "))\ndruck = float(input("Druck in bar: "))\nif temperatur > 90 or druck > 6:\n    print("Anlage abschalten")\nelse:\n    leistung = druck * 10\n    print("Leistung:", leistung)',
      build: function (g) {
        return [P.start('s'),
          P.io('temperatur einlesen', 'i1'),
          g(1, P.io('', 'i2')),
          g(2, P.iff('', [P.io('Ausgabe: Anlage abschalten', 'o1')], [g(3, P.op('', 'o2')), g(4, P.io('', 'o3'))], 'd1')),
          P.end('e')];
      },
      gaps: [
        { kind: 'io', ok: ['^druck(einlesen|eingeben|lesen|eingabe)$', '^(einlesen|eingabe)druck$', '^druck$'], solution: 'druck einlesen', hint: 'Die zweite Zeile des Codes liest eine Variable ein. Schreibe, welche Variable.' },
        { kind: 'if', ok: ['^temperatur>90(or|oder)druck>6$', '^druck>6(or|oder)temperatur>90$'], solution: 'temperatur > 90 oder druck > 6?', hint: 'Bedingung aus der if-Zeile, als Frage. Mit „oder“ verknüpft, weil eine der beiden Grenzen genügt.' },
        { kind: 'op', ok: ['^leistung=druck\\*10$', '^leistung=10\\*druck$'], solution: 'leistung = druck * 10', hint: 'Im else-Zweig steht zuerst eine Rechnung, keine Ausgabe.' },
        { kind: 'io', ok: ['^ausgabe:?leistung:?,?leistung$', '^ausgabe:?leistung:?$', '^ausgabe:?leistung[:,]?leistung$', '^ausgabe:?leistung$'], solution: 'Ausgabe: Leistung: leistung', hint: 'Die letzte print-Zeile gibt „Leistung:“ und den Wert aus. Beginne mit „Ausgabe:“.' }
      ]
    },
    kuehl: {
      code: 'stand = float(input("Kühlmittelstand in %: "))\nif stand < 0 or stand > 100:\n    print("Eingabe unplausibel")\nelif stand < 25:\n    print("Nachfüllen")\nelse:\n    print("Stand ok")',
      build: function (g) {
        return [P.start('s'),
          g(1, P.io('', 'i1')),
          P.iff('stand < 0 oder stand > 100?', [P.io('Ausgabe: Eingabe unplausibel', 'o1')], [
            g(2, P.iff('', [g(3, P.io('', 'o2'))], [P.io('Ausgabe: Stand ok', 'o3')], 'd2'))
          ], 'd1'),
          P.end('e')];
      },
      gaps: [
        { kind: 'io', ok: ['^stand(einlesen|eingeben|lesen|eingabe)$', '^(einlesen|eingabe)stand$', '^stand$'], solution: 'stand einlesen', hint: 'Die erste Zeile des Codes liest den Kühlmittelstand ein.' },
        { kind: 'if', ok: ['^stand<25$'], solution: 'stand < 25?', hint: 'Das ist das elif: eine Raute im Nein-Weg der ersten Raute. Die Bedingung steht in der elif-Zeile.' },
        { kind: 'io', ok: ['^ausgabe:?nachf(ü|u|ue)llen$'], solution: 'Ausgabe: Nachfüllen', hint: 'Im Ja-Weg der zweiten Raute gibt print etwas aus. Beginne mit „Ausgabe:“.' }
      ]
    }
  };
  var KIND_OPTS = [['', 'Symbolart wählen …'], ['io', 'Parallelogramm (Ein-/Ausgabe)'], ['op', 'Rechteck (Operation)'], ['if', 'Raute (Verzweigung)']];
  function initLuecke(host) {
    var cfg = LUECKEN[host.getAttribute('data-paplueck')], task = host.closest('[data-a]');
    if (!cfg) return;
    var state = cfg.gaps.map(function () { return { kind: '', text: '', status: '' }; });
    function spec() {
      return cfg.build(function (n, node) {
        var gp = state[n - 1], g = cfg.gaps[n - 1];
        node.gap = n;
        if (gp.status === 'ok') { node.cls = 'is-filled'; node.text = g.solution; node.t = g.kind; return node; }
        node.cls = 'is-gap' + (gp.status === 'bad' ? ' is-wrong' : '');
        node.text = 'Lücke ' + n; node.num = n;
        if (g.kind === 'if') { node.t = 'if'; } else { node.t = 'op'; }
        return node;
      });
    }
    var codeBox = el('div');
    var lines = cfg.code.split('\n').map(function (l) { return { ind: l.match(/^ */)[0].length / 4, text: l.trim() }; });
    var cw = drawCode(lines, function (l, k) { return k + 1; }, { label: 'Gegebener Python-Code' });
    var parts = copyButton(function () { return cfg.code; });
    cw.appendChild(parts[0]); cw.appendChild(parts[1]); codeBox.appendChild(cw);
    var papHost = el('div');
    var listEl = el('div', { class: 'v05-gaplist' });
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var bCheck = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Prüfen' });
    var bShow = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Lösung zeigen' });
    var gapEls = cfg.gaps.map(function (g, i) {
      var sel = el('select', { 'aria-label': 'Symbolart für Lücke ' + (i + 1) }); KIND_OPTS.forEach(function (o) { sel.appendChild(el('option', { value: o[0], text: o[1] })); });
      var inp = el('input', { type: 'text', placeholder: 'Text im Symbol', 'aria-label': 'Text im Symbol für Lücke ' + (i + 1), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      var hintEl = el('p', { class: 'v05-gaphint' });
      var box = el('div', { class: 'v05-gap' }, [el('span', { class: 'v05-ln', 'aria-hidden': 'true', text: String(i + 1) }), sel, inp, hintEl]);
      sel.addEventListener('change', function () { state[i].kind = sel.value; });
      inp.addEventListener('input', function () { state[i].text = inp.value; });
      return { box: box, sel: sel, inp: inp, hint: hintEl };
    });
    gapEls.forEach(function (g) { listEl.appendChild(g.box); });
    host.appendChild(el('div', { class: 'v05-ex' }, [el('div', { class: 'v05-cols v05-cols--eq' }, [el('div', {}, [el('h4', { class: 'v05-h', text: 'Gegebener Python-Code' }), codeBox]), el('div', {}, [el('h4', { class: 'v05-h', text: 'Programmablaufplan mit Lücken' }), papHost])]), listEl, el('div', { class: 'v05-ctrl' }, [bCheck, bShow]), msg]));
    function render() {
      var sp = spec();
      mountSvg(papHost, sp, { label: 'Programmablaufplan mit ' + cfg.gaps.length + ' Lücken zum Ausfüllen', minw: 0.8 });
    }
    function check() {
      var good = 0;
      cfg.gaps.forEach(function (g, i) {
        var s = state[i], t = normText(s.text), ok = s.kind === g.kind && g.ok.some(function (re) { return new RegExp(re).test(t); });
        s.status = ok ? 'ok' : 'bad';
        if (ok) good += 1;
        var ge = gapEls[i];
        ge.box.className = 'v05-gap ' + (ok ? 'is-ok' : 'is-bad');
        ge.hint.textContent = ok ? 'Richtig.' : (!s.kind ? 'Wähle zuerst die Symbolart.' : (s.kind !== g.kind ? 'Die Symbolart passt nicht: Eingabe und Ausgabe sind Parallelogramme, Rechnungen Rechtecke, Fragen Rauten.' : g.hint));
        if (ok) { ge.sel.disabled = true; ge.inp.disabled = true; }
      });
      render();
      var all = good === cfg.gaps.length;
      msg.className = 'v05-msg ' + (all ? 'is-ok' : 'is-bad');
      msg.textContent = all ? 'Alle Lücken stimmen. So sieht der fertige Plan aus.' : good + ' von ' + cfg.gaps.length + ' Lücken stimmen. Lies die Hinweise bei den roten Feldern.';
      if (all && task) markSolved(task);
    }
    function solve() {
      cfg.gaps.forEach(function (g, i) { state[i] = { kind: g.kind, text: g.solution, status: 'ok' }; gapEls[i].sel.value = g.kind; gapEls[i].inp.value = g.solution; gapEls[i].box.className = 'v05-gap is-ok'; gapEls[i].hint.textContent = 'Lösung.'; gapEls[i].sel.disabled = true; gapEls[i].inp.disabled = true; });
      render(); msg.className = 'v05-msg'; msg.textContent = 'Die Lösung steht im Plan. Vergleiche sie mit dem Code und versuche es danach mit der nächsten Aufgabe allein.';
    }
    bCheck.addEventListener('click', check); bShow.addEventListener('click', solve);
    render();
  }

  /* ── (G) Selbstcheck-Haken für Papieraufgaben ──────────────── */
  function initCheck(host) {
    var cb = host.querySelector('input[type="checkbox"]'), task = host.closest('[data-a]');
    if (!cb || !task) return;
    var sv = window.KursAufgaben ? window.KursAufgaben.store.solved(document.body.getAttribute('data-lesson') || 'V05') : {};
    if (sv[task.getAttribute('data-id')]) cb.checked = true;
    cb.addEventListener('change', function () { if (cb.checked) markSolved(task); });
  }

  function init() {
    var map = { lexikon: initLexikon, ablauf: initAblauf, baukasten: initBaukasten, fehler: initFehler, check: initCheck };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-paplueck]'), initLuecke);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
