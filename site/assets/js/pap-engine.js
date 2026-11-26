/* =============================================================
   pap-engine.js – Programmablaufplan (PAP) nach DIN 66001 / ISO 5807 als inline-SVG
   window.KursPAP  (reines JS, ohne DOM per node nutzbar: module.exports)

   Zwei Datenformen:
   (1) SPEC  – Zeichenbeschreibung. Eine Folge (Array) läuft von oben nach unten.
       Knotenarten: start | end | io | op | sub | conn | if | while | repeat
       if     hat yes (links, "ja") und no (rechts, "nein"); enden beide nicht in einem Ende, laufen sie zusammen.
       while  kopfgesteuerte Schleife: Raute oben, ja -> body nach unten zurück vor die Raute, nein -> rechts hinaus.
       repeat fußgesteuerte Schleife: erst body, dann Raute; ja -> Rückführung links vor den body, nein -> weiter.
       API: P.*, layout(spec), svg(spec, opts), figure(spec, opts), exportSvg(spec, opts), describe(spec)
   (2) BAUM  – Bearbeitungsmodell (Editor, Baukasten). Knoten {id, k, v, ...}
       k: in | out | op | call | if | while | for | repeat   (if: yes/no, Schleifen: body)
       API: nIn/nOut/nOp/nCall/nIf/nWhile/nFor/nRepeat, toPap(baum) -> SPEC, toText(baum) -> Python,
            parseCode(python, {erweitert:true}) -> {nodes}, marks(baum) -> Einfügestellen für den Editor,
            toJson/fromJson, clone, kids, find, numberTree, countBlocks
   Ohne Option {erweitert:true} verhält sich parseCode wie im V05-Baukasten (nur if/elif/else).
   ============================================================= */
(function (root) {
  'use strict';

  var CH = 6.3, LH = 17, VG = 28, COLG = 22, SK = 14, ARW = 9, PAD = 14, RET = 30, EMPTY = 46;
  var uidN = 0;
  function autoId() { uidN += 1; return 'p' + uidN; }
  function mk(t, text, extra) { var n = { id: autoId(), t: t, text: text }; if (extra) Object.keys(extra).forEach(function (k) { n[k] = extra[k]; }); return n; }
  var P = {
    start: function (id) { return mk('start', 'Start', { id: id || 'start' }); },
    end: function (id, text, extra) { var n = mk('end', text || 'Ende', extra); if (id) n.id = id; return n; },
    io: function (text, id, extra) { var n = mk('io', text, extra); if (id) n.id = id; return n; },
    op: function (text, id, extra) { var n = mk('op', text, extra); if (id) n.id = id; return n; },
    sub: function (text, id, extra) { var n = mk('sub', text, extra); if (id) n.id = id; return n; },
    conn: function (text, id) { var n = mk('conn', String(text)); if (id) n.id = id; return n; },
    iff: function (text, yes, no, id, extra) { var n = mk('if', text, extra); n.yes = yes || []; n.no = no || []; if (id) n.id = id; return n; },
    whil: function (text, body, id, extra) { var n = mk('while', text, extra); n.body = body || []; if (id) n.id = id; return n; },
    repeat: function (text, body, id, extra) { var n = mk('repeat', text, extra); n.body = body || []; if (id) n.id = id; return n; }
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
  function isDia(n) { return n.t === 'if' || n.t === 'while' || n.t === 'repeat'; }

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
    var hw = n._s.w / 2;
    if (n.t === 'if') {
      var y = measureSeq(n.yes), no = measureSeq(n.no);
      var a = Math.max(hw, y.r + COLG / 2), b = Math.max(hw, no.l + COLG / 2);
      return (n._m = { l: Math.max(a + y.l, hw), r: Math.max(b + no.r, hw), a: a, b: b });
    }
    if (n.t === 'while' || n.t === 'repeat') {
      var bm = measureSeq(n.body), L = Math.max(bm.l, hw) + RET;
      /* while: rechts läuft die Linie "nein" hinaus, repeat: rechts nichts */
      var R = n.t === 'while' ? Math.max(hw + 46, bm.r + COLG) : Math.max(bm.r, hw);
      return (n._m = { l: L, r: R });
    }
    return (n._m = { l: hw, r: hw });
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
  function maxExitY(exits) { var m = -1e9; exits.forEach(function (e) { m = Math.max(m, lastPt(e)[1]); }); return m; }

  /* Knoten n unter die offenen Ausgänge exits setzen und die Linien dorthin ziehen. Gibt die Oberkante zurück. */
  function attach(n, x, exits, y0, ctx) {
    var top;
    if (!exits.length) top = y0;
    else {
      var maxY = maxExitY(exits);
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
        var ed = { from: e.id, to: n.id, label: e.label || '', show: e.show, side: e.side, pts: simplify(pts), noArrow: !!n.noArrow };
        if (e.lab) ed.lab = e.lab;
        ctx.edges.push(ed);
      });
    }
    n._x = x; n._y = top; ctx.nodes.push(n);
    if (!ctx.ft) ctx.ft = { y: top, id: n.id };
    return top;
  }

  function placeSeq(seq, x, exits, y0, ctx) {
    (seq || []).forEach(function (n) { exits = placeOne(n, x, exits, y0, ctx); });
    return exits;
  }
  function placeOne(n, x, exits, y0, ctx) {
    var s, top, hw, hh, yc, m;
    if (n.t === 'repeat') {
      /* fußgesteuert: erst der Rumpf, dann die Raute; "ja" führt links zurück vor den Rumpf */
      var saved = ctx.ft; ctx.ft = null;
      if (n.body.length) exits = placeSeq(n.body, x, exits, y0, ctx);
      top = attach(n, x, exits, y0, ctx);
      var ft = ctx.ft; ctx.ft = saved || ft;
      s = n._s; m = n._m; hw = s.w / 2; hh = s.h / 2; yc = top + hh;
      var ey = ft.y - 12;
      n._yc = yc; n._ey = ey; n._retX = x - m.l;
      ctx.edges.push({ from: n.id, to: ft.id, label: 'ja', show: n.yesLabel !== '', side: -1, pts: simplify([[x - hw, yc], [x - m.l, yc], [x - m.l, ey], [x, ey]]) });
      n._exitY = yc + hh;
      return [{ id: n.id, label: 'nein', show: n.noLabel !== '', side: 1, lab: [x + 12, yc + hh + 13, 'start'], pts: [[x, yc + hh]] }];
    }
    top = attach(n, x, exits, y0, ctx);
    s = n._s; hw = s.w / 2; hh = s.h / 2; yc = top + hh; m = n._m;
    if (n.t === 'if') {
      var dia = { cx: x, yc: yc, hw: hw, hh: hh };
      var yes0 = [{ id: n.id, label: 'ja', show: n.yesLabel !== '', side: -1, dia: dia, pts: [[x - hw, yc], [x - m.a, yc]] }];
      var no0 = [{ id: n.id, label: 'nein', show: n.noLabel !== '', side: 1, dia: dia, pts: [[x + hw, yc], [x + m.b, yc]] }];
      n._yc = yc; n._yesX = x - m.a; n._noX = x + m.b;
      var ye = placeSeq(n.yes, x - m.a, yes0, yc, ctx), ne = placeSeq(n.no, x + m.b, no0, yc, ctx);
      exits = ye.concat(ne);
      n._exitY = maxExitY(exits);
      return exits;
    }
    if (n.t === 'while') {
      /* kopfgesteuert: ja nach unten durch den Rumpf, Rückführung links in die Linie über der Raute, nein rechts hinaus */
      var ey2 = top - 12;
      var ja = { id: n.id, label: 'ja', show: n.yesLabel !== '', side: 1, lab: [x + 12, yc + hh + 13, 'start'], pts: [[x, yc + hh]] };
      var bex;
      n._yc = yc; n._ey = ey2; n._retX = x - m.l;
      if (n.body.length) bex = placeSeq(n.body, x, [ja], yc, ctx);
      else { ja.pts.push([x, yc + hh + EMPTY]); bex = [ja]; n._emptyY = yc + hh + 32; }
      var retY = maxExitY(bex) + VG * 0.55;
      bex.forEach(function (e) {
        var pts = e.pts.slice(), p = lastPt(e);
        pts.push([p[0], retY]); pts.push([x - m.l, retY]); pts.push([x - m.l, ey2]); pts.push([x, ey2]);
        var ed = { from: e.id, to: n.id, label: e.label || '', show: e.show, side: e.side, pts: simplify(pts) };
        if (e.lab) ed.lab = e.lab;
        ctx.edges.push(ed);
      });
      n._exitY = retY;
      var rx = x + m.r;
      return [{ id: n.id, label: 'nein', show: n.noLabel !== '', side: 1, pts: [[x + hw, yc], [rx, yc], [rx, retY]] }];
    }
    n._exitY = top + s.h;
    if (n.t === 'end' || n.open) return [];
    return [{ id: n.id, label: '', pts: [[x, top + s.h]] }];
  }

  function layout(spec) {
    var seq = Array.isArray(spec) ? spec : spec.nodes;
    measureSeq(seq);
    var ctx = { nodes: [], edges: [], ft: null };
    placeSeq(seq, 0, [], 0, ctx);
    var x0 = 1e9, x1 = -1e9, y1 = -1e9;
    ctx.nodes.forEach(function (n) { x0 = Math.min(x0, n._x - n._s.w / 2); x1 = Math.max(x1, n._x + n._s.w / 2); y1 = Math.max(y1, n._y + n._s.h); });
    ctx.edges.forEach(function (e) { e.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }); });
    ctx.edges.forEach(function (e) { if (e.show && e.label && !e.lab) { var p = e.pts[0]; if (e.side < 0) x0 = Math.min(x0, p[0] - 36); else x1 = Math.max(x1, p[0] + 40); } else if (e.show && e.label && e.lab) x1 = Math.max(x1, e.lab[0] + 36); });
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
      var bx = n._x - s.w / 2 + (isDia(n) ? s.w * 0.12 : 4), by = n._y + (isDia(n) ? s.h * 0.2 : 2);
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
      if (e.lab) out += '<text class="pap-lab" x="' + f1(e.lab[0]) + '" y="' + f1(e.lab[1]) + '" text-anchor="' + (e.lab[2] || 'start') + '">' + esc(e.label) + '</text>';
      else out += '<text class="pap-lab" x="' + f1(p[0] + e.side * 6) + '" y="' + f1(p[1] - 6) + '" text-anchor="' + (e.side < 0 ? 'end' : 'start') + '">' + esc(e.label) + '</text>';
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
      } else if (n.t === 'while') {
        parts.push('Schleife, solange „' + n.text + '“ mit ja beantwortet wird: ' + (describeSeq(n.body) || 'nichts') + ', dann zurück vor die Raute; bei nein weiter');
      } else if (n.t === 'repeat') {
        parts.push('Schleife: ' + (describeSeq(n.body) || 'nichts') + ', dann Verzweigung „' + n.text + '“: bei ja zurück an den Anfang der Schleife, bei nein weiter');
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

  /* Eigenständiges SVG (Export/PNG): Stile eingebettet, feste Größe, weißer Hintergrund, keine Nummernmarken */
  var EXPORT_CSS = '.pap-shape{fill:#fff;stroke:#1a1a1a;stroke-width:1.8;stroke-linejoin:round}.pap-line{fill:none;stroke:#1a1a1a;stroke-width:1.8;stroke-linejoin:round}' +
    '.pap-line--in{stroke-width:1.5}.pap-ah{fill:#1a1a1a;stroke:none}.pap-hit{display:none}.pap-badge{display:none}' +
    'text{font-family:Arial,Helvetica,sans-serif;font-size:13.5px;fill:#1a1a1a}.pap-lab{font-size:12.5px;font-weight:700}';
  function exportSvg(spec, o) {
    o = o || {};
    var lay = layout(spec), out = '', sc = o.scale || 1;
    var W = Math.round(lay.w), H = Math.round(lay.h);
    lay.edges.forEach(function (e) { out += edgeSvg(e); });
    lay.nodes.forEach(function (n) { var c = n.num; n.num = 0; out += nodeSvg(n, { badges: false }); n.num = c; });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(W * sc) + '" height="' + Math.round(H * sc) + '" viewBox="' + f1(lay.x0) + ' ' + f1(lay.y0) + ' ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || describe(spec)) + '"><title>' + esc(o.title || 'Programmablaufplan') + '</title><style>' + EXPORT_CSS + '</style>' +
      '<rect x="' + f1(lay.x0) + '" y="' + f1(lay.y0) + '" width="' + W + '" height="' + H + '" fill="#fff"/>' + out + '</svg>';
  }

  /* ══════════════════════════════════════════════════════════
     BAUM (Bearbeitungsmodell)
     ══════════════════════════════════════════════════════════ */
  var uid = 0;
  function nid() { uid += 1; return 'b' + uid; }
  function nIn(v, typ, prompt) { var n = { id: nid(), k: 'in', v: v }; if (typ) n.typ = typ; if (prompt !== undefined) n.prompt = prompt; return n; }
  function nOut(v) { return { id: nid(), k: 'out', v: v }; }
  function nOp(v) { return { id: nid(), k: 'op', v: v }; }
  function nCall(v) { return { id: nid(), k: 'call', v: v }; }
  function nIf(v, yes, no) { return { id: nid(), k: 'if', v: v, yes: yes || [], no: no || [] }; }
  function nWhile(v, body) { return { id: nid(), k: 'while', v: v, body: body || [] }; }
  function nFor(v, body) { return { id: nid(), k: 'for', v: v, body: body || [] }; }
  function nRepeat(v, body) { return { id: nid(), k: 'repeat', v: v, body: body || [] }; }
  function isLoop(n) { return n.k === 'while' || n.k === 'for' || n.k === 'repeat'; }
  /* Unterfolgen eines Knotens als [{slot, arr}] */
  function kids(n) {
    if (n.k === 'if') return [{ slot: 'yes', arr: n.yes }, { slot: 'no', arr: n.no }];
    if (isLoop(n)) return [{ slot: 'body', arr: n.body }];
    return [];
  }

  /* ≤ ≥ ≠ − · × -> Python-Schreibweise (außerhalb von Zeichenketten) */
  function toPy(s) {
    var map = { '≤': '<=', '≥': '>=', '≠': '!=', '−': '-', '·': '*', '×': '*' };
    return String(s).replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([≤≥≠−·×])/g, function (m, str, ch) { return str ? str : map[ch]; });
  }
  function pyStr(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function condOf(n, dflt) { return toPy(String(n.v).trim().replace(/\s*\?+$/, '')) || dflt; }   /* ein Fragezeichen am Ende der Raute gehört nicht in den Code */
  function lineOf(n) {
    var v = String(n.v).trim();
    if (n.k === 'in') {
      if (!v) return 'pass  # Lücke: Variable eintragen';
      var typ = n.typ || 'float', call;
      if (n.prompt === undefined) call = 'input("' + v + ': ")';
      else call = 'input(' + (n.prompt === '' ? '' : pyStr(n.prompt)) + ')';
      return v + ' = ' + (typ === 'str' ? call : typ + '(' + call + ')');
    }
    if (n.k === 'out') return 'print(' + toPy(v) + ')';
    if (n.k === 'call') return toPy(v) || 'pass  # Lücke: Aufruf eintragen';
    return toPy(v) || 'pass  # Lücke: Anweisung eintragen';
  }
  function ifLines(n, level, out, kw) {
    out.push({ ind: level, text: kw + ' ' + condOf(n, 'True') + ':', id: n.id, role: kw });
    if (n.yes.length) toLines(n.yes, level + 1, out); else out.push({ ind: level + 1, text: 'pass', id: n.id, role: 'pass' });
    if (n.no.length === 1 && n.no[0].k === 'if') ifLines(n.no[0], level, out, 'elif');
    else if (n.no.length) { out.push({ ind: level, text: 'else:', id: n.id, role: 'else' }); toLines(n.no, level + 1, out); }
  }
  function negate(c) { return /\b(and|or)\b|\bif\b|\belse\b/.test(c) ? 'not (' + c + ')' : 'not ' + c; }
  function toLines(nodes, level, out) {
    out = out || [];
    nodes.forEach(function (n) {
      if (n.k === 'if') ifLines(n, level, out, 'if');
      else if (n.k === 'while') {
        out.push({ ind: level, text: 'while ' + condOf(n, 'False') + ':', id: n.id, role: 'while' });
        if (n.body.length) toLines(n.body, level + 1, out); else out.push({ ind: level + 1, text: 'pass', id: n.id, role: 'pass' });
      } else if (n.k === 'for') {
        out.push({ ind: level, text: 'for ' + (condOf(n, 'i in range(1, 6)')) + ':', id: n.id, role: 'for' });
        if (n.body.length) toLines(n.body, level + 1, out); else out.push({ ind: level + 1, text: 'pass', id: n.id, role: 'pass' });
      } else if (n.k === 'repeat') {
        out.push({ ind: level, text: 'while True:', id: n.id, role: 'while' });
        if (n.body.length) toLines(n.body, level + 1, out);
        out.push({ ind: level + 1, text: 'if ' + negate(condOf(n, 'False')) + ':', id: n.id, role: 'if' });
        out.push({ ind: level + 2, text: 'break', id: n.id, role: 'break' });
      } else out.push({ ind: level, text: lineOf(n), id: n.id, role: n.k });
    });
    return out;
  }
  function toText(nodes) { return toLines(nodes, 0, []).map(function (l) { return new Array(l.ind * 4 + 1).join(' ') + l.text; }).join('\n'); }
  function numberTree(nodes, c) {
    c = c || { n: 0 };
    nodes.forEach(function (n) {
      if (n.k === 'repeat') { numberTree(n.body, c); c.n += 1; n.num = c.n; return; }
      c.n += 1; n.num = c.n;
      kids(n).forEach(function (kd) { numberTree(kd.arr, c); });
    });
    return c.n;
  }
  function countBlocks(nodes) { var c = 0; nodes.forEach(function (n) { c += 1; kids(n).forEach(function (kd) { c += countBlocks(kd.arr); }); }); return c; }
  /* Python-Schreibweise -> PAP-Schreibweise */
  function nice(s) {
    return String(s).replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/!=/g, '≠').replace(/==/g, '=')
      .replace(/\band\b/g, 'und').replace(/\bor\b/g, 'oder').replace(/\bnot\b/g, 'nicht');
  }
  /* Raute einer Zählschleife: „i in range(1, 11)“ -> „i von 1 bis 10“. Alles, was nicht so aussieht, bleibt wie es ist (nice). */
  function forText(v) {
    var s = toPy(String(v).trim().replace(/\s*\?+$/, '')), m = /^(\w+)\s+in\s+range\((.*)\)$/.exec(s);
    if (!m) return nice(s || '…');
    var args = [], depth = 0, cur = '', i, ch;
    for (i = 0; i < m[2].length; i++) {
      ch = m[2][i];
      if (ch === '(' || ch === '[') depth++; else if (ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; } else cur += ch;
    }
    args.push(cur.trim());
    if (args.length > 2 || args.some(function (a) { return !a; })) return nice(s);
    var a = args.length === 2 ? args[0] : '0', b = args[args.length - 1], bis, pl = /^(.+?)\s*\+\s*1$/.exec(b);
    if (/^-?\d+$/.test(b)) bis = String(parseInt(b, 10) - 1);
    else if (pl) bis = pl[1];
    else bis = (/[+\-*\/ ]/.test(b.replace(/^-/, '')) ? '(' + b + ')' : b) + ' − 1';
    return m[1] + ' von ' + nice(a) + ' bis ' + nice(bis);
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
        var c = { num: n.num, cls: n.cls }, t = nice(String(n.v).trim() || '…');
        if (n.k === 'in') return P.io((String(n.v).trim() || '…') + ' einlesen', n.id, c);
        if (n.k === 'out') return P.io(outText(n.v), n.id, c);
        if (n.k === 'op') return P.op(t, n.id, c);
        if (n.k === 'call') return P.sub(String(n.v).trim() || '…', n.id, c);
        /* Die Anzeige hängt das Fragezeichen selbst an; wer es schon getippt hat, sieht keines doppelt (wie condOf im Code) */
        var f = t.replace(/\s*\?+$/, '') + '?';
        if (n.k === 'for') return P.whil(forText(n.v) + '?', conv(n.body), n.id, c);
        if (n.k === 'while') return P.whil(f, conv(n.body), n.id, c);
        if (n.k === 'repeat') return P.repeat(f, conv(n.body), n.id, c);
        return P.iff(f, conv(n.yes), conv(n.no), n.id, c);
      });
    }
    return [P.start('start')].concat(conv(tree), [P.end('end')]);
  }

  /* Python-Text -> Baum. Ohne o.erweitert wie im V05-Baukasten (nur Zuweisung/Aufruf, if, elif, else). */
  function parseCode(src, o) {
    o = o || {};
    var ext = !!o.erweitert;
    var raw = String(src).replace(/\t/g, '    ').split('\n'), lines = [];
    raw.forEach(function (l, k) {
      if (!l.trim() || /^\s*#/.test(l)) return;
      var tx = l.trim();
      if (!/["']/.test(tx)) tx = tx.replace(/\s+#.*$/, '');
      lines.push({ no: k + 1, ind: l.match(/^ */)[0].length, text: tx });
    });
    var pos = 0;
    function fail(l, msg) { var e = new Error('Zeile ' + l.no + ': ' + msg); e.line = l.no; throw e; }
    function litStr(a) {
      a = String(a).trim();
      if (!a) return '';
      var m = /^"((?:[^"\\]|\\.)*)"$|^'((?:[^'\\]|\\.)*)'$/.exec(a);
      if (!m) return undefined;
      return (m[1] !== undefined ? m[1] : m[2]).replace(/\\(["'\\])/g, '$1');
    }
    function simple(text) {
      var m;
      if (ext) {
        m = /^([A-Za-z_]\w*)\s*=\s*(?:(float|int)\(\s*input\((.*)\)\s*\)|input\((.*)\))$/.exec(text);
        if (m) {
          var typ = m[2] || 'str', arg = m[2] ? m[3] : m[4];
          var pr = litStr(arg);
          return nIn(m[1], typ === 'float' ? '' : typ, pr);
        }
      } else {
        m = /^([A-Za-z_]\w*)\s*=\s*float\(\s*input\(.*\)\s*\)$/.exec(text);
        if (m) return nIn(m[1]);
      }
      m = /^print\((.*)\)$/.exec(text);
      if (m) return nOut(m[1]);
      if (ext && /^[A-Za-z_][\w.]*\(.*\)$/.test(text) && !/^input\(/.test(text)) return nCall(text);
      return nOp(text);
    }
    var HEAD_ERR = ext
      ? 'Dieser Editor kennt nur if, elif, else, while und for mit Doppelpunkt. Andere Blockköpfe (def, try, with …) kommen später im Kurs.'
      : 'Dieser Baukasten kennt nur if, elif und else mit Doppelpunkt. Andere Blockköpfe (while, for, def …) kommen später im Kurs.';
    function parseBlock(ind) {
      var out = [];
      while (pos < lines.length) {
        var l = lines[pos];
        if (l.ind < ind) break;
        if (l.ind > ind) fail(l, 'Diese Zeile ist weiter eingerückt als die Zeile davor. Eine Einrückung ist nur nach einem Doppelpunkt erlaubt.');
        if (/^(elif\b|else\b)/.test(l.text)) fail(l, l.text.split(/[\s:]/)[0] + ' steht ohne passendes if auf derselben Einrückungsstufe.');
        if (/^if\b/.test(l.text)) out.push(parseIf(l, ind, 'if'));
        else if (ext && /^while\b/.test(l.text)) out.push(parseWhile(l, ind));
        else if (ext && /^for\b/.test(l.text)) out.push(parseFor(l, ind));
        else {
          if (/:$/.test(l.text)) fail(l, HEAD_ERR);
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
    function unparen(c) {
      c = c.trim();
      if (c.charAt(0) === '(' && c.charAt(c.length - 1) === ')') {
        var d = 0, k;
        for (k = 0; k < c.length; k++) { if (c.charAt(k) === '(') d++; else if (c.charAt(k) === ')') { d--; if (d === 0 && k < c.length - 1) return c; } }
        return c.slice(1, -1).trim();
      }
      return c;
    }
    function parseWhile(l, ind) {
      var m = /^while\s+(.*?)\s*:$/.exec(l.text);
      if (!m) { if (!/:$/.test(l.text)) fail(l, 'Nach der Bedingung fehlt der Doppelpunkt.'); fail(l, 'Hinter while fehlt die Bedingung.'); }
      pos += 1;
      var body = parseBody(ind, l);
      if (m[1] === 'True') {
        /* while True: ... if not bedingung: break  ->  fußgesteuerte Schleife */
        var last = body[body.length - 1];
        if (last && last.k === 'if' && !last.no.length && last.yes.length === 1 && last.yes[0].k === 'op' && last.yes[0].v === 'break' && /^not\s+\S/.test(last.v)) {
          return nRepeat(unparen(last.v.replace(/^not\s+/, '')), body.slice(0, -1));
        }
      }
      return nWhile(m[1], body);
    }
    function parseFor(l, ind) {
      var m = /^for\s+(.*?)\s*:$/.exec(l.text);
      if (!m) { if (!/:$/.test(l.text)) fail(l, 'Nach der Schleifenvorgabe fehlt der Doppelpunkt.'); fail(l, 'Hinter for fehlt die Vorgabe, z. B. for i in range(1, 6):'); }
      if (!/^\w+(\s*,\s*\w+)*\s+in\s+\S/.test(m[1])) fail(l, 'Nach for erwartet Python „variable in …“, z. B. for i in range(1, 6):');
      pos += 1;
      return nFor(m[1], parseBody(ind, l));
    }
    if (!lines.length) return { nodes: [] };
    if (lines[0].ind !== 0) fail(lines[0], 'Das Programm beginnt ganz links, ohne Einrückung.');
    var nodes = parseBlock(0);
    if (pos < lines.length) fail(lines[pos], 'Die Einrückung passt zu keiner Zeile davor.');
    return { nodes: nodes };
  }

  /* ── Baum-Hilfen: Kopie, JSON, Suche ── */
  function clone(tree) { return JSON.parse(JSON.stringify(tree)); }
  function toJson(tree) {
    function strip(arr) {
      return arr.map(function (n) {
        var o = { k: n.k, v: n.v };
        if (n.typ) o.typ = n.typ;
        if (n.prompt !== undefined) o.prompt = n.prompt;
        kids(n).forEach(function (kd) { o[kd.slot] = strip(kd.arr); });
        return o;
      });
    }
    return strip(tree);
  }
  /* JSON -> Baum mit frischen Ids; akzeptiert auch {baum:[...]} */
  function fromJson(json) {
    if (json && !Array.isArray(json) && json.baum) json = json.baum;
    function build(arr) {
      return (arr || []).map(function (j) {
        var n = { id: nid(), k: j.k, v: j.v === undefined ? '' : String(j.v) };
        if (j.typ) n.typ = j.typ;
        if (j.prompt !== undefined) n.prompt = j.prompt;
        if (j.k === 'if') { n.yes = build(j.yes); n.no = build(j.no); }
        else if (j.k === 'while' || j.k === 'for' || j.k === 'repeat') n.body = build(j.body);
        return n;
      });
    }
    return build(json);
  }
  /* Suche nach id: {node, arr, idx, parent, slot} */
  function find(tree, id) {
    var res = null;
    (function walk(arr, parent, slot) {
      for (var i = 0; i < arr.length && !res; i++) {
        if (arr[i].id === id) { res = { node: arr[i], arr: arr, idx: i, parent: parent, slot: slot }; return; }
        kids(arr[i]).forEach(function (kd) { if (!res) walk(kd.arr, arr[i], kd.slot); });
      }
    })(tree, null, 'root');
    return res;
  }
  /* alle Knoten in Lese-/Codereihenfolge (Vorreihenfolge, bei repeat: Rumpf zuerst) */
  function flat(tree) {
    var out = [];
    (function walk(arr) {
      arr.forEach(function (n) {
        if (n.k === 'repeat') { walk(n.body); out.push(n); return; }
        out.push(n); kids(n).forEach(function (kd) { walk(kd.arr); });
      });
    })(tree);
    return out;
  }

  /* ══════════════════════════════════════════════════════════
     Einfügestellen für den Editor
     Gibt das SPEC samt Layout und die Stellen zurück, an denen ein neues Symbol eingefügt werden kann.
     marks[k] = { x, y, targets: [{ parent: id|null, slot: 'root'|'yes'|'no'|'body', idx, label }] }
     ══════════════════════════════════════════════════════════ */
  function marks(tree) {
    var spec = toPap(tree), lay = layout(spec), byId = {}, out = [], seen = {};
    lay.nodes.forEach(function (n) { byId[n.id] = n; });
    function firstTop(n) { var b = byId[n.id]; return n.k === 'repeat' && n.body.length ? firstTop(n.body[0]) : b._y; }
    function add(x, y, target) {
      var key = Math.round(x) + ',' + Math.round(y), m = seen[key];
      if (m) { m.targets.push(target); return; }
      m = { x: x, y: y, targets: [target] }; seen[key] = m; out.push(m);
    }
    function seqMarks(arr, parent, slot, ex, ey) {
      var i, n, last, b, y;
      for (i = 0; i <= arr.length; i++) {
        if (i < arr.length) {
          n = arr[i]; b = byId[n.id];
          add(b._x, firstTop(n) - 14, { parent: parent, slot: slot, idx: i, label: slot === 'root' || !parent ? 'davor' : 'davor' });
        } else if (arr.length) {
          last = arr[arr.length - 1]; b = byId[last.id];
          y = (last.k === 'if' || last.k === 'while' || last.k === 'for') ? b._exitY + VG * 0.55 : b._exitY + 14;
          add(b._x, y, { parent: parent, slot: slot, idx: i, label: 'danach' });
        } else add(ex, ey, { parent: parent, slot: slot, idx: 0, label: 'hinein' });
      }
      arr.forEach(function (n) {
        var b2 = byId[n.id];
        if (n.k === 'if') {
          seqMarks(n.yes, n.id, 'yes', b2._yesX, b2._yc + 14);
          seqMarks(n.no, n.id, 'no', b2._noX, b2._yc + 14);
        } else if (n.k === 'while' || n.k === 'for') seqMarks(n.body, n.id, 'body', b2._x, b2._emptyY || b2._yc + b2._s.h / 2 + 32);
        else if (n.k === 'repeat') seqMarks(n.body, n.id, 'body', b2._retX, (b2._ey + b2._yc) / 2);
      });
    }
    seqMarks(tree, null, 'root', 0, byId.start._y + byId.start._s.h + 14);
    return { spec: spec, lay: lay, marks: out };
  }

  var api = {
    P: P, layout: layout, svg: svg, figure: figure, describe: describe, exportSvg: exportSvg,
    toLines: toLines, toText: toText, toPap: toPap, parseCode: parseCode, numberTree: numberTree, countBlocks: countBlocks,
    nIn: nIn, nOut: nOut, nOp: nOp, nCall: nCall, nIf: nIf, nWhile: nWhile, nFor: nFor, nRepeat: nRepeat,
    forText: forText, nice: nice, toPy: toPy, kids: kids, isLoop: isLoop, find: find, flat: flat, clone: clone, toJson: toJson, fromJson: fromJson, marks: marks,
    esc: esc, version: 2
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;
  root.KursPAP = api;
})(typeof window !== 'undefined' ? window : globalThis);
