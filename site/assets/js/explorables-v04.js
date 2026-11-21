/* =============================================================
   explorables-v04.js – interaktive Bausteine für V04 (reines JS, kein Framework)
   (A) Logik-Baukasten: vier Schalter, drei Gatter hintereinander (UND/ODER, je mit NICHT-Option),
       Lampe „Hub frei“, Wahrheitstabelle füllt sich beim Schalten
   (B) De-Morgan-Prüfer: beide Seiten eines Gesetzes für alle Eingaben nebeneinander
   (C) Weichen-Animation: ein Ball läuft durch if / elif / else, der genommene Zweig leuchtet
   Der Rechenkern ist ohne DOM per node testbar (siehe module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern ────────────────────────────────────────────────── */
  var INPUTS = [
    { id: 'L', name: 'Taster links', short: 'links' },
    { id: 'R', name: 'Taster rechts', short: 'rechts' },
    { id: 'T', name: 'Schutztür zu', short: 'Tür zu' },
    { id: 'D', name: 'Druck im Bereich', short: 'Druck ok' }
  ];
  function bin(b) { return b ? 1 : 0; }
  function applyOp(o, a, b) { return o === 'and' ? (a && b) : (a || b); }
  function operand(o, v) { var x = !!v[o.in]; return o.not ? !x : x; }
  /* Kette aus drei Gattern: g1 = a op b, g2 = g1 op c, g3 = g2 op d */
  function evalChain(cfg, v) {
    var g1 = applyOp(cfg.g1.op, operand(cfg.g1.a, v), operand(cfg.g1.b, v));
    var g2 = applyOp(cfg.g2.op, g1, operand(cfg.g2.b, v));
    var g3 = applyOp(cfg.g3.op, g2, operand(cfg.g3.b, v));
    return { g1: g1, g2: g2, g3: g3 };
  }
  function soll(v) { return !!(v.L && v.R && v.T && v.D); }
  function combo(i) { return { L: !!(i & 8), R: !!(i & 4), T: !!(i & 2), D: !!(i & 1) }; }
  function comboIndex(v) { return (v.L ? 8 : 0) + (v.R ? 4 : 0) + (v.T ? 2 : 0) + (v.D ? 1 : 0); }
  function mk(op, i, n) { return { in: i, not: !!n }; }
  var PRESETS = {
    und:   { label: 'Zweihandschaltung: alles UND', cfg: { g1: { a: mk(0, 'L'), op: 'and', b: mk(0, 'R') }, g2: { op: 'and', b: mk(0, 'T') }, g3: { op: 'and', b: mk(0, 'D') } } },
    oder:  { label: 'Falsch: Taster mit ODER', cfg: { g1: { a: mk(0, 'L'), op: 'or', b: mk(0, 'R') }, g2: { op: 'and', b: mk(0, 'T') }, g3: { op: 'and', b: mk(0, 'D') } } },
    tuer:  { label: 'Falsch: Tür vergessen', cfg: { g1: { a: mk(0, 'L'), op: 'and', b: mk(0, 'R') }, g2: { op: 'and', b: mk(0, 'D') }, g3: { op: 'and', b: mk(0, 'D') } } },
    nicht: { label: 'Falsch: NICHT an der Tür', cfg: { g1: { a: mk(0, 'L'), op: 'and', b: mk(0, 'R') }, g2: { op: 'and', b: mk(0, 'T', true) }, g3: { op: 'and', b: mk(0, 'D') } } }
  };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  /* Bewertung gegen die Sicherheitsvorgabe: alle 16 Fälle */
  function rate(cfg) {
    var danger = 0, miss = 0, i, v, out;
    for (i = 0; i < 16; i++) {
      v = combo(i); out = evalChain(cfg, v).g3;
      if (out && !soll(v)) danger++;
      if (!out && soll(v)) miss++;
    }
    return { danger: danger, miss: miss, ok: danger === 0 && miss === 0 };
  }
  /* De Morgan: zwei Gesetze, je zwei Seiten */
  var DM = [
    { title: 'NICHT (A UND B) = (NICHT A) ODER (NICHT B)', left: 'NICHT (A UND B)', right: '(NICHT A) ODER (NICHT B)',
      f: function (a, b) { return !(a && b); }, g: function (a, b) { return (!a) || (!b); } },
    { title: 'NICHT (A ODER B) = (NICHT A) UND (NICHT B)', left: 'NICHT (A ODER B)', right: '(NICHT A) UND (NICHT B)',
      f: function (a, b) { return !(a || b); }, g: function (a, b) { return (!a) && (!b); } }
  ];
  /* Weiche: das Pressenprogramm aus dem Labor */
  var WROWS = [
    { cond: 'if freigabe:', res: 'print("Hub freigegeben")', msg: 'Hub freigegeben' },
    { cond: 'elif not tuer_zu:', res: 'print("Stopp: Schutztür offen")', msg: 'Stopp: Schutztür offen' },
    { cond: 'elif not druck_ok:', res: 'print(f"Stopp: Druck {druck_bar:.1f} bar außerhalb von 150 bis 210 bar")', msg: null },
    { cond: 'else:', res: 'print("Warten: bitte beide Taster drücken")', msg: 'Warten: bitte beide Taster drücken' }
  ];
  function weiche(s) {
    var druckOk = 150 <= s.druck && s.druck <= 210;
    var freigabe = !!(s.links && s.rechts && s.tuer && druckOk);
    var conds = [freigabe, !s.tuer, !druckOk, true];
    var steps = [], taken = -1, i;
    for (i = 0; i < 4; i++) {
      steps.push({ row: i, val: conds[i] });
      if (conds[i]) { taken = i; break; }
    }
    var msg = WROWS[taken].msg || ('Stopp: Druck ' + s.druck.toFixed(1) + ' bar außerhalb von 150 bis 210 bar');
    return { druckOk: druckOk, freigabe: freigabe, conds: conds, steps: steps, taken: taken, msg: msg };
  }

  var api = { INPUTS: INPUTS, evalChain: evalChain, soll: soll, combo: combo, comboIndex: comboIndex, PRESETS: PRESETS, rate: rate, DM: DM, weiche: weiche, WROWS: WROWS };
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
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function tf(b) { return b ? 'True' : 'False'; }

  function switchButton(label, onToggle) {
    var knob = el('span', { class: 'v04-sw__knob', 'aria-hidden': 'true' });
    var val = el('span', { class: 'v04-sw__val', 'aria-hidden': 'true' });
    var b = el('button', { type: 'button', class: 'v04-sw', 'aria-pressed': 'false' }, [knob, el('span', { text: label }), val]);
    b.setValue = function (on) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); val.textContent = on ? 'True' : 'False'; };
    b.addEventListener('click', function () { onToggle(); });
    b.setValue(false);
    return b;
  }

  /* ── (A) Logik-Baukasten ─────────────────────────────────── */
  function initBaukasten(host) {
    var v = { L: false, R: false, T: false, D: false };
    var cfg = clone(PRESETS.und.cfg);
    var seen = {};
    var timer = null;
    var allShown = false;

    var sws = el('div', { class: 'v04-switches', role: 'group', 'aria-label': 'Eingänge der Schaltung' });
    var swBtn = {};
    INPUTS.forEach(function (inp) {
      var b = switchButton(inp.name, function () { stopAuto(); v[inp.id] = !v[inp.id]; update(); });
      swBtn[inp.id] = b; sws.appendChild(b);
    });
    host.appendChild(sws);

    var presetBar = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Fertige Schaltungen laden' });
    Object.keys(PRESETS).forEach(function (k) {
      var b = el('button', { type: 'button', class: 'k-chip', text: PRESETS[k].label });
      b.addEventListener('click', function () { cfg = clone(PRESETS[k].cfg); syncControls(); seen = {}; update(); });
      presetBar.appendChild(b);
    });
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Schaltung laden oder selbst bauen:' }));
    host.appendChild(presetBar);

    var build = el('div', { class: 'v04-build' });
    var ctrl = {};   // gate controls
    function selectInput(id, onChange) {
      var s = el('select', { 'aria-label': id });
      INPUTS.forEach(function (i) { s.appendChild(el('option', { value: i.id, text: i.name })); });
      s.addEventListener('change', function () { onChange(s.value); });
      return s;
    }
    function selectOp(label, onChange) {
      var s = el('select', { class: 'v04-op', 'aria-label': label });
      s.appendChild(el('option', { value: 'and', text: 'UND' }));
      s.appendChild(el('option', { value: 'or', text: 'ODER' }));
      s.addEventListener('change', function () { onChange(s.value); });
      return s;
    }
    function notBtn(label, onToggle) {
      var b = el('button', { type: 'button', class: 'v04-not', 'aria-pressed': 'false', 'aria-label': label, text: 'NICHT' });
      b.addEventListener('click', function () { onToggle(); });
      b.setPressed = function (p) { b.setAttribute('aria-pressed', p ? 'true' : 'false'); };
      return b;
    }
    function gateRow(n) {
      var row = el('div', { class: 'v04-gate' });
      row.appendChild(el('span', { class: 'v04-gate__name', text: 'Gatter ' + n }));
      var c = {};
      if (n === 1) {
        c.aNot = notBtn('Gatter 1, erster Eingang: NICHT', function () { cfg.g1.a.not = !cfg.g1.a.not; update(); });
        c.aIn = selectInput('Gatter 1, erster Eingang', function (x) { cfg.g1.a.in = x; update(); });
        c.aIn.setAttribute('aria-label', 'Gatter 1, erster Eingang');
        row.appendChild(c.aNot); row.appendChild(c.aIn);
      } else {
        c.prev = el('span', { class: 'v04-prev', text: 'Ergebnis Gatter ' + (n - 1) });
        row.appendChild(c.prev);
      }
      var key = 'g' + n;
      c.op = selectOp('Gatter ' + n + ', Verknüpfung', function (x) { cfg[key].op = x; update(); });
      c.bNot = notBtn('Gatter ' + n + ', zweiter Eingang: NICHT', function () { cfg[key].b.not = !cfg[key].b.not; update(); });
      c.bIn = selectInput('', function (x) { cfg[key].b.in = x; update(); });
      c.bIn.setAttribute('aria-label', 'Gatter ' + n + ', zweiter Eingang');
      c.res = el('span', { class: 'v04-res', 'aria-live': 'off' });
      row.appendChild(c.op); row.appendChild(c.bNot); row.appendChild(c.bIn); row.appendChild(c.res);
      build.appendChild(row);
      ctrl[n] = c;
    }
    gateRow(1); gateRow(2); gateRow(3);
    host.appendChild(build);

    var lamp = el('div', { class: 'v04-lamp' });
    var bulb = el('span', { class: 'v04-lamp__bulb', 'aria-hidden': 'true' });
    var lampTxt = el('span', { class: 'v04-lamp__txt' });
    lamp.appendChild(bulb); lamp.appendChild(lampTxt);
    host.appendChild(lamp);

    var acts = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Wahrheitstabelle' });
    var bAuto = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Alle 16 Fälle durchspielen' });
    var bAll = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Ganze Tabelle zeigen' });
    var bClr = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Tabelle leeren' });
    acts.appendChild(bAuto); acts.appendChild(bAll); acts.appendChild(bClr);
    host.appendChild(acts);

    var wrap = el('div', { class: 'k-tablewrap' });
    var table = el('table', { class: 'v04-truth' });
    var cap = el('caption', { class: 'k-sr', text: 'Wahrheitstabelle der gebauten Schaltung. 1 steht für wahr, 0 für falsch.' });
    var thead = el('thead');
    var htr = el('tr');
    INPUTS.forEach(function (i) { htr.appendChild(el('th', { scope: 'col', text: i.short })); });
    htr.appendChild(el('th', { scope: 'col', text: 'Soll' }));
    htr.appendChild(el('th', { scope: 'col', text: 'Deine Schaltung' }));
    htr.appendChild(el('th', { scope: 'col', text: 'Bewertung' }));
    thead.appendChild(htr);
    var tbody = el('tbody');
    table.appendChild(cap); table.appendChild(thead); table.appendChild(tbody);
    wrap.appendChild(table);
    host.appendChild(wrap);
    var sum = el('p', { class: 'v04-sum', role: 'status', 'aria-live': 'polite' });
    host.appendChild(sum);
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Soll: Hub nur, wenn beide Taster gedrückt, die Tür zu und der Druck im Bereich ist (1 = wahr, 0 = falsch). „Gefährlich“ heißt: Die Schaltung gibt den Hub frei, obwohl sie ihn sperren müsste.' }));

    var rows = [];
    for (var i = 0; i < 16; i++) {
      var tr = el('tr'); var cells = [];
      var c = combo(i);
      INPUTS.forEach(function (inp) { tr.appendChild(el('td', { text: String(bin(c[inp.id])) })); });
      var tSoll = el('td'), tMine = el('td'), tRate = el('td');
      tr.appendChild(tSoll); tr.appendChild(tMine); tr.appendChild(tRate);
      tbody.appendChild(tr);
      rows.push({ tr: tr, tSoll: tSoll, tMine: tMine, tRate: tRate, c: c });
    }

    function syncControls() {
      ctrl[1].aNot.setPressed(cfg.g1.a.not); ctrl[1].aIn.value = cfg.g1.a.in;
      [1, 2, 3].forEach(function (n) {
        var g = cfg['g' + n];
        ctrl[n].op.value = g.op; ctrl[n].bNot.setPressed(g.b.not); ctrl[n].bIn.value = g.b.in;
      });
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; bAuto.textContent = 'Alle 16 Fälle durchspielen'; } }
    function update() {
      INPUTS.forEach(function (inp) { swBtn[inp.id].setValue(v[inp.id]); });
      var r = evalChain(cfg, v);
      seen[comboIndex(v)] = true;
      [1, 2, 3].forEach(function (n) {
        var val = r['g' + n];
        ctrl[n].res.textContent = 'Gatter ' + n + ' = ' + tf(val);
        ctrl[n].res.className = 'v04-res is-' + bin(val);
        if (n > 1) ctrl[n].prev.textContent = 'Ergebnis Gatter ' + (n - 1) + ' (' + tf(r['g' + (n - 1)]) + ')';
      });
      var on = r.g3, so = soll(v);
      lamp.className = 'v04-lamp' + (on ? ' is-on' : '');
      lampTxt.innerHTML = '';
      lampTxt.appendChild(document.createTextNode(on ? 'Hub frei: Lampe an' : 'Hub gesperrt: Lampe aus'));
      lampTxt.appendChild(el('span', { class: 'v04-lamp__sub', text: on && !so ? 'Achtung: Das ist bei dieser Schalterstellung gefährlich, die Vorgabe sagt: sperren.' : (so && !on ? 'Hier müsste der Hub frei sein, die Schaltung sperrt ihn.' : 'Entspricht der Vorgabe.') }));
      var cur = comboIndex(v);
      rows.forEach(function (row, idx) {
        var vis = allShown || seen[idx];
        var out = evalChain(cfg, row.c).g3, s = soll(row.c);
        row.tr.className = idx === cur ? 'is-cur' : '';
        if (idx === cur) row.tr.setAttribute('aria-current', 'true'); else row.tr.removeAttribute('aria-current');
        row.tSoll.textContent = vis ? String(bin(s)) : '·';
        row.tMine.textContent = vis ? String(bin(out)) : '·';
        row.tSoll.className = vis ? '' : 'is-unseen'; row.tMine.className = vis ? (out ? 'v04-t1' : '') : 'is-unseen';
        var txt = '', cls = '';
        if (vis) {
          if (out && !s) { txt = 'gefährlich'; cls = 'v04-bad'; }
          else if (!out && s) { txt = 'Hub fehlt'; cls = 'v04-warn'; }
          else txt = 'richtig';
        }
        row.tRate.textContent = txt; row.tRate.className = cls;
      });
      var rt = rate(cfg);
      var n = 0; rows.forEach(function (row, idx) { if (allShown || seen[idx]) n++; });
      sum.className = 'v04-sum' + (rt.ok ? ' is-ok' : (rt.danger ? ' is-bad' : ''));
      sum.textContent = (rt.ok ? 'Diese Schaltung entspricht der Vorgabe in allen 16 Fällen.' : 'Diese Schaltung weicht in ' + (rt.danger + rt.miss) + ' von 16 Fällen von der Vorgabe ab' + (rt.danger ? ', davon ' + rt.danger + ' gefährlich.' : '.')) +
        ' Tabelle: ' + n + ' von 16 Zeilen gefüllt.';
    }
    bAuto.addEventListener('click', function () {
      if (timer) { stopAuto(); return; }
      if (reduce) { allShown = true; update(); return; }
      var k = 0; bAuto.textContent = 'Anhalten';
      timer = setInterval(function () {
        if (k >= 16) { stopAuto(); return; }
        v = combo(k++); update();
      }, 500);
    });
    bAll.addEventListener('click', function () { stopAuto(); allShown = true; update(); });
    bClr.addEventListener('click', function () { stopAuto(); allShown = false; seen = {}; update(); });
    syncControls(); update();
  }

  /* ── (B) De-Morgan-Prüfer ────────────────────────────────── */
  function initDeMorgan(host) {
    var law = 0, A = false, B = false;
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Gesetz wählen' });
    var sb = DM.map(function (d, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: 'Gesetz ' + (i + 1) });
      b.addEventListener('click', function () { law = i; sb.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); render(); });
      seg.appendChild(b); return b;
    });
    var sA = switchButton('A', function () { A = !A; render(); });
    var sB = switchButton('B', function () { B = !B; render(); });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { text: 'Gesetz' }), seg])]));
    host.appendChild(el('div', { class: 'v04-switches', role: 'group', 'aria-label': 'Eingänge A und B' }, [sA, sB]));
    var title = el('p', { class: 'k-formula' });
    var cmp = el('div', { class: 'v04-dm' });
    var verdict = el('p', { class: 'v04-sum', role: 'status', 'aria-live': 'polite' });
    var wrap = el('div', { class: 'k-tablewrap' });
    var table = el('table', { class: 'v04-truth' });
    table.appendChild(el('caption', { class: 'k-sr', text: 'Alle vier Kombinationen von A und B, linke und rechte Seite des Gesetzes' }));
    var th = el('thead'), htr = el('tr');
    ['A', 'B', 'linke Seite', 'rechte Seite', 'gleich?'].forEach(function (t) { htr.appendChild(el('th', { scope: 'col', text: t })); });
    th.appendChild(htr); table.appendChild(th);
    var tb = el('tbody'); table.appendChild(tb); wrap.appendChild(table);
    [title, cmp, verdict, wrap].forEach(function (n) { host.appendChild(n); });
    function render() {
      sA.setValue(A); sB.setValue(B);
      var d = DM[law];
      title.textContent = d.title;
      cmp.innerHTML = '';
      [[d.left, d.f(A, B)], [d.right, d.g(A, B)]].forEach(function (p) {
        cmp.appendChild(el('div', { class: 'v04-dm__side' + (p[1] ? ' is-1' : '') }, [el('span', { class: 'v04-dm__expr', text: p[0] }), el('span', { class: 'v04-dm__val', text: tf(p[1]) })]));
      });
      verdict.className = 'v04-sum is-ok';
      verdict.textContent = 'Bei A = ' + tf(A) + ' und B = ' + tf(B) + ' liefern beide Seiten ' + tf(d.f(A, B)) + '. Sie sind in jeder der vier Zeilen gleich.';
      tb.innerHTML = '';
      [[false, false], [false, true], [true, false], [true, true]].forEach(function (r) {
        var tr = el('tr', { class: (r[0] === A && r[1] === B) ? 'is-cur' : '' });
        tr.appendChild(el('td', { text: String(bin(r[0])) })); tr.appendChild(el('td', { text: String(bin(r[1])) }));
        tr.appendChild(el('td', { text: String(bin(d.f(r[0], r[1]))) })); tr.appendChild(el('td', { text: String(bin(d.g(r[0], r[1]))) }));
        tr.appendChild(el('td', { class: 'v04-t1', text: d.f(r[0], r[1]) === d.g(r[0], r[1]) ? 'ja' : 'nein' }));
        tb.appendChild(tr);
      });
    }
    render();
  }

  /* ── (C) Weichen-Animation ───────────────────────────────── */
  function initWeiche(host) {
    var st = { links: true, rechts: true, tuer: true, druck: 180 };
    var run = null;       // { steps, i, timer }
    var id = 'weiche' + (++uid);

    var sws = el('div', { class: 'v04-switches', role: 'group', 'aria-label': 'Eingaben des Programms' });
    var bL = switchButton('Taster links gedrückt', function () { st.links = !st.links; changed(); });
    var bR = switchButton('Taster rechts gedrückt', function () { st.rechts = !st.rechts; changed(); });
    var bT = switchButton('Schutztür geschlossen', function () { st.tuer = !st.tuer; changed(); });
    [bL, bR, bT].forEach(function (b) { sws.appendChild(b); });
    var range = el('input', { type: 'range', id: id + '-p', min: '100', max: '260', step: '1', value: String(st.druck) });
    var pval = el('output', { for: id + '-p', class: 'k-small' });
    var field = el('div', { class: 'k-field' }, [el('label', { 'for': id + '-p', text: 'Hydraulikdruck in bar' }), range, pval]);
    range.addEventListener('input', function () { st.druck = parseFloat(range.value); changed(); });
    host.appendChild(sws);
    host.appendChild(el('div', { class: 'k-controls' }, [field]));

    var vars = el('div', { class: 'v04-vars', 'aria-label': 'Variablen des Programms' });
    host.appendChild(vars);

    var ctl = el('div', { class: 'v04-ctl' });
    var bGo = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Ball starten' });
    var bStep = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Ein Schritt weiter' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    ctl.appendChild(bGo); ctl.appendChild(bStep); ctl.appendChild(bReset);
    host.appendChild(ctl);

    var track = el('div', { class: 'v04-track' });
    var ball = el('div', { class: 'v04-ball', 'aria-hidden': 'true' });
    track.appendChild(ball);
    track.appendChild(el('div', { class: 'v04-start', text: 'Start: Eingaben lesen, druck_ok und freigabe berechnen' }));
    var wrows = WROWS.map(function (r) {
      var val = el('span', { class: 'v04-wval', 'aria-hidden': 'true' });
      var cond = el('div', { class: 'v04-wcond' }, [el('code', { text: r.cond }), val]);
      var res = el('div', { class: 'v04-wres' }, [el('code', { text: r.res })]);
      var row = el('div', { class: 'v04-wrow' }, [cond, res]);
      track.appendChild(row);
      return { row: row, cond: cond, res: res, val: val };
    });
    track.appendChild(el('div', { class: 'v04-end', text: 'Ende: das Programm macht nach dem if-Block weiter' }));
    host.appendChild(track);
    var out = el('div', { class: 'v04-out', role: 'status', 'aria-live': 'polite' });
    host.appendChild(out);

    function pos(node, side) {
      var tr = track.getBoundingClientRect(), r = node.getBoundingClientRect();
      return { x: (side === 'rail' ? 22 : (r.left - tr.left + 4)), y: r.top - tr.top + r.height / 2 };
    }
    function moveBall(p) { ball.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; }
    function home() { var s = track.querySelector('.v04-start'); moveBall(pos(s, 'rail')); }
    function clearMarks() {
      wrows.forEach(function (w) { w.row.classList.remove('is-taken', 'is-skipped'); w.cond.classList.remove('is-cur'); w.val.textContent = ''; w.val.className = 'v04-wval'; var sk = w.cond.querySelector('.v04-skiptxt'); if (sk) sk.remove(); });
      out.innerHTML = '<b>Ausgabe</b>noch nichts ausgegeben';
    }
    function stop() { if (run && run.timer) clearTimeout(run.timer); run = null; bGo.textContent = 'Ball starten'; }
    function changed() { stop(); clearMarks(); render(); home(); }
    function render() {
      var w = weiche(st);
      bL.setValue(st.links); bR.setValue(st.rechts); bT.setValue(st.tuer);
      pval.textContent = st.druck + ' bar';
      vars.innerHTML = '';
      [['taster_links', tf(st.links)], ['taster_rechts', tf(st.rechts)], ['tuer_zu', tf(st.tuer)], ['druck_bar', st.druck.toFixed(1)], ['druck_ok', tf(w.druckOk)], ['freigabe', tf(w.freigabe)]].forEach(function (p) {
        var s = el('span'); s.appendChild(document.createTextNode(p[0] + ' = ')); s.appendChild(el('b', { text: p[1] })); vars.appendChild(s);
      });
    }
    function buildSteps() {
      var w = weiche(st), seq = [];
      w.steps.forEach(function (s) { seq.push({ type: 'check', row: s.row, val: s.val }); if (s.val) seq.push({ type: 'take', row: s.row }); });
      seq.push({ type: 'end', msg: w.msg, taken: w.taken });
      return seq;
    }
    function doStep(s) {
      if (s.type === 'check') {
        var w = wrows[s.row];
        w.cond.classList.add('is-cur');
        w.val.textContent = s.row === 3 ? 'sonst' : tf(s.val);
        w.val.className = 'v04-wval ' + (s.val ? 'is-t' : 'is-f');
        moveBall(pos(w.cond, 'rail'));
        out.innerHTML = '<b>Ausgabe</b>noch nichts ausgegeben';
        wrows.forEach(function (o, k) { if (k !== s.row) o.cond.classList.remove('is-cur'); });
        out.setAttribute('aria-label', 'Zeile ' + w.cond.textContent + ' ist ' + (s.val ? 'wahr' : 'falsch'));
      } else if (s.type === 'take') {
        var w2 = wrows[s.row];
        w2.cond.classList.remove('is-cur');
        w2.row.classList.add('is-taken');
        moveBall(pos(w2.res, 'res'));
      } else {
        for (var k = s.taken + 1; k < 4; k++) {
          wrows[k].row.classList.add('is-skipped');
          wrows[k].cond.appendChild(el('span', { class: 'v04-skiptxt', text: 'nicht geprüft' }));
        }
        out.innerHTML = '';
        out.appendChild(el('b', { text: 'Ausgabe' }));
        out.appendChild(document.createTextNode(s.msg));
        out.removeAttribute('aria-label');
        var e = track.querySelector('.v04-end'); moveBall(pos(e, 'rail'));
      }
    }
    function nextStep() {
      if (!run) { clearMarks(); run = { steps: buildSteps(), i: 0, timer: null }; }
      if (run.i >= run.steps.length) return false;
      doStep(run.steps[run.i++]);
      return run.i < run.steps.length;
    }
    bStep.addEventListener('click', function () {
      if (run && run.timer) { clearTimeout(run.timer); run.timer = null; bGo.textContent = 'Ball starten'; }
      if (run && run.i >= run.steps.length) { changed(); }
      nextStep();
    });
    bGo.addEventListener('click', function () {
      if (run && run.timer) { clearTimeout(run.timer); run.timer = null; bGo.textContent = 'Ball starten'; return; }
      if (run && run.i >= run.steps.length) { changed(); }
      if (reduce) { clearMarks(); run = { steps: buildSteps(), i: 0, timer: null }; while (nextStep()) { /* sofort */ } return; }
      bGo.textContent = 'Anhalten';
      if (!run) { clearMarks(); run = { steps: buildSteps(), i: 0, timer: null }; }
      var tick = function () {
        var more = nextStep();
        if (more) { run.timer = setTimeout(tick, 900); } else { if (run) run.timer = null; bGo.textContent = 'Ball starten'; }
      };
      tick();
    });
    bReset.addEventListener('click', function () { changed(); });
    window.addEventListener('resize', function () { if (!run) home(); });
    changed();
    setTimeout(home, 300);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="baukasten"]'), initBaukasten);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="demorgan"]'), initDeMorgan);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="weiche"]'), initWeiche);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
