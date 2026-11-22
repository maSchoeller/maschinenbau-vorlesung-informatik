/* =============================================================
   explorables-v20.js – interaktive Bausteine für V20 „Objekte & CAD-Automatisierung“ (reines JS, kein Framework)
   (A) Bauplan und Teile: Objekte im Speicher, getrennte Attribute, Aliasing, self beim Methodenaufruf (Schritt für Schritt).
   (B) Parametrischer Flansch: Eingaben, SVG-Draufsicht und Schnitt, ist_gueltig, Volumen und Masse, 3D-Vorschau per KursPy.
   (C) PAP: Baureihe prüfen mit Unterprogramm-Symbol.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM): gleiche Formeln wie briefing/v20-beispiel.py ───────── */
  function volumen(p) {
    var ring = Math.PI / 4 * (p.d_aussen * p.d_aussen - p.d_innen * p.d_innen) * p.dicke;
    var loecher = p.n * Math.PI / 4 * p.d_bohrung * p.d_bohrung * p.dicke;
    return { ring: ring, loecher: loecher, gesamt: ring - loecher };
  }
  function masse(p, dichte) { return volumen(p).gesamt / 1000 * (dichte === undefined ? 7.85 : dichte) / 1000; }
  function pruefung(p) {
    var aussen = (p.lochkreis + p.d_bohrung) / 2, innen = (p.lochkreis - p.d_bohrung) / 2;
    return {
      rand_aussen: aussen < p.d_aussen / 2, rand_innen: innen > p.d_innen / 2,
      aussen: aussen, innen: innen, gueltig: aussen < p.d_aussen / 2 && innen > p.d_innen / 2
    };
  }
  function de(x, k) { return (k === undefined ? 1 : k) === 0 ? String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : x.toFixed(k === undefined ? 1 : k).replace('.', ','); }
  function zahl(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  function pyAufruf(p) { return 'Flansch(' + [p.d_aussen, p.d_innen, p.dicke, p.lochkreis, p.n, p.d_bohrung].join(', ') + ')'; }
  var core = { volumen: volumen, masse: masse, pruefung: pruefung, pyAufruf: pyAufruf };

  if (typeof document === 'undefined') { if (typeof module !== 'undefined' && module.exports) module.exports = core; return; }

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
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function btn(text, cls, fn) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || ''), text: text });
    b.addEventListener('click', fn); return b;
  }
  var uid = 0;
  function nextId(p) { uid++; return p + uid; }

  /* ══════════════════════════════════════════════════════════
     (A) Bauplan und Teile
     ══════════════════════════════════════════════════════════ */
  var KLASSE = [
    'class Flansch:',
    '    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):',
    '        self.d_aussen = d_aussen',
    '        self.d_innen = d_innen',
    '        self.dicke = dicke',
    '        self.lochkreis = lochkreis',
    '        self.n = n',
    '        self.d_bohrung = d_bohrung',
    '',
    '    def masse(self):',
    '        ring = math.pi / 4 * (self.d_aussen**2 - self.d_innen**2) * self.dicke',
    '        loecher = self.n * math.pi / 4 * self.d_bohrung**2 * self.dicke',
    '        return (ring - loecher) / 1e6 * 7.85'
  ];
  var VORLAGEN = [
    { t: 'DN25', p: { d_aussen: 100, d_innen: 30, dicke: 14, lochkreis: 75, n: 4, d_bohrung: 11 } },
    { t: 'DN40', p: { d_aussen: 120, d_innen: 40, dicke: 15, lochkreis: 90, n: 6, d_bohrung: 11 } },
    { t: 'DN50', p: { d_aussen: 140, d_innen: 50, dicke: 16, lochkreis: 110, n: 8, d_bohrung: 13 } }
  ];
  var ATTR = ['d_aussen', 'd_innen', 'dicke', 'lochkreis', 'n', 'd_bohrung'];
  var NAMEN = ['f1', 'f2', 'f3'];

  function initBauplan(host) {
    var st = { objs: [], names: {}, zaehler: 0, vorlage: 1, hl: [], prog: [], msg: 'Noch kein Objekt: Die Klasse ist nur der Bauplan. Erzeuge ein Teil.', step: -1, aufruf: null };

    var codeBox = el('div', { class: 'v20-codecol' });
    var classPre = el('pre', { class: 'v20-class', 'data-run': 'no', 'aria-label': 'Klasse Flansch' });
    codeBox.appendChild(el('p', { class: 'v20-ptitle', text: 'Der Bauplan (Klasse)' }));
    codeBox.appendChild(classPre);
    var progTitle = el('p', { class: 'v20-ptitle', text: 'Dein Programm bisher' });
    var progPre = el('pre', { class: 'v20-prog', 'data-run': 'no', 'aria-label': 'Bisherige Aufrufe' });
    codeBox.appendChild(progTitle); codeBox.appendChild(progPre);

    var memBox = el('div', { class: 'v20-memcol' });
    memBox.appendChild(el('p', { class: 'v20-ptitle', text: 'Der Speicher' }));
    var mem = el('div', { class: 'v20-mem' });
    var arrows = sv('svg', { class: 'v20-arrows', 'aria-hidden': 'true', focusable: 'false' });
    var namesCol = el('div', { class: 'v20-names' });
    var objsCol = el('div', { class: 'v20-objs' });
    mem.appendChild(arrows); mem.appendChild(namesCol); mem.appendChild(objsCol);
    memBox.appendChild(mem);
    var frame = el('div', { class: 'v20-frame', hidden: '' });
    memBox.appendChild(frame);

    var grid = el('div', { class: 'v20-grid2' }, [codeBox, memBox]);

    /* Bedienung */
    var ctl = el('div', { class: 'v20-ctl' });
    var vSeg = el('div', { class: 'k-seg v20-seg', role: 'group', 'aria-label': 'Maße für das neue Teil' });
    VORLAGEN.forEach(function (v, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === st.vorlage ? 'true' : 'false', text: v.t });
      b.addEventListener('click', function () { st.vorlage = i; Array.prototype.forEach.call(vSeg.children, function (c, j) { c.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); });
      vSeg.appendChild(b);
    });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('span', { class: 'v20-lbl', text: 'Maße' }), vSeg]));
    var bNeu = btn('Objekt erzeugen', '', erzeuge);
    var bN = btn('f1.n = 8 setzen', 'k-btn--ghost', setzeN);
    var bAlias = btn('f2 = f1', 'k-btn--ghost', alias);
    var bReset = btn('Zurücksetzen', 'k-btn--link', zurueck);
    var row1 = el('div', { class: 'v20-btnrow' }, [bNeu, bN, bAlias, bReset]);
    var callBox = el('div', { class: 'v20-btnrow' });
    var live = el('p', { class: 'v20-live', role: 'status', 'aria-live': 'polite' });

    host.appendChild(ctl); host.appendChild(row1); host.appendChild(callBox); host.appendChild(live); host.appendChild(grid);

    function freierName() {
      for (var i = 0; i < NAMEN.length; i++) if (!(NAMEN[i] in st.names)) return NAMEN[i];
      return null;
    }
    function objVon(n) { for (var i = 0; i < st.objs.length; i++) if (st.objs[i].id === st.names[n]) return st.objs[i]; return null; }
    function aufraeumen() {
      var weg = [];
      st.objs = st.objs.filter(function (o) {
        var da = Object.keys(st.names).some(function (n) { return st.names[n] === o.id; });
        if (!da) weg.push(o.id);
        return da;
      });
      return weg;
    }
    function erzeuge() {
      var n = freierName();
      if (!n) return;
      st.aufruf = null; st.step = -1;
      st.zaehler++;
      var p = {}; var v = VORLAGEN[st.vorlage].p;
      ATTR.forEach(function (k) { p[k] = v[k]; });
      st.objs.push({ id: st.zaehler, p: p });
      st.names[n] = st.zaehler;
      st.hl = [1, 2, 3, 4, 5, 6, 7];
      st.prog.push(n + ' = ' + pyAufruf(p));
      st.msg = 'Python legt ein neues Objekt Nr. ' + st.zaehler + ' im Speicher an, führt __init__ aus (die markierten Zeilen) und lässt den Namen ' + n + ' darauf zeigen. Jedes Objekt hat seine eigenen Attribute.';
      render();
    }
    function setzeN() {
      var o = objVon('f1');
      if (!o) return;
      st.aufruf = null; st.step = -1; st.hl = [];
      var neu = o.p.n === 8 ? VORLAGEN[1].p.n : 8;
      o.p.n = neu;
      st.prog.push('f1.n = ' + neu);
      var weitere = Object.keys(st.names).filter(function (k) { return k !== 'f1' && st.names[k] === o.id; });
      st.msg = 'f1.n = ' + neu + ' ändert das Attribut n des Objekts Nr. ' + o.id + '.' + (weitere.length
        ? ' Auch ' + weitere.join(' und ') + ' zeigt darauf und sieht jetzt n = ' + neu + ': Es gibt nur dieses eine Objekt.'
        : ' Andere Objekte bleiben unverändert.');
      render();
    }
    function alias() {
      var o = objVon('f1');
      if (!o) return;
      st.aufruf = null; st.step = -1; st.hl = [];
      var alt = 'f2' in st.names ? st.names.f2 : null;
      if (alt === o.id) return;
      st.names.f2 = o.id;
      st.prog.push('f2 = f1');
      var weg = aufraeumen();
      st.msg = 'f2 = f1 kopiert nichts: Der Name f2 zeigt jetzt auf dasselbe Objekt Nr. ' + o.id + ' wie f1 (Aliasing, wie bei Listen in V08).' + (weg.length ? ' Auf das alte Objekt Nr. ' + weg.join(', ') + ' zeigt kein Name mehr, Python räumt es weg.' : '');
      render();
    }
    function zurueck() {
      st.objs = []; st.names = {}; st.zaehler = 0; st.hl = []; st.prog = []; st.step = -1; st.aufruf = null;
      st.msg = 'Zurückgesetzt. Noch kein Objekt: Die Klasse ist nur der Bauplan.';
      render();
    }
    function schritte(n) {
      var o = objVon(n); if (!o) return [];
      var p = o.p, v = volumen(p);
      return [
        { hl: [], t: 'Du schreibst ' + n + '.masse(). Der Name vor dem Punkt sagt, mit welchem Objekt die Methode arbeitet; die Klammern bleiben leer.', locals: [], self: false },
        { hl: [9], t: 'Python springt in die Methode masse der Klasse Flansch. Es setzt self auf dasselbe Objekt, auf das ' + n + ' zeigt (Nr. ' + o.id + '). Du übergibst self nicht selbst.', locals: [], self: true },
        { hl: [10], t: 'self.d_aussen ist ' + p.d_aussen + ', self.d_innen ist ' + p.d_innen + ', self.dicke ist ' + p.dicke + ': ring = ' + de(v.ring, 0) + ' mm³.', locals: [['ring', de(v.ring, 0) + ' mm³']], self: true },
        { hl: [11], t: 'self.n ist ' + p.n + ', self.d_bohrung ist ' + p.d_bohrung + ': loecher = ' + de(v.loecher, 0) + ' mm³.', locals: [['ring', de(v.ring, 0) + ' mm³'], ['loecher', de(v.loecher, 0) + ' mm³']], self: true },
        { hl: [12], t: 'return liefert (ring − loecher) / 1e6 · 7,85 = ' + de(masse(p), 2) + ' kg an die Aufrufstelle. self und die lokalen Variablen verschwinden, das Objekt bleibt unverändert.', locals: [['ring', de(v.ring, 0) + ' mm³'], ['loecher', de(v.loecher, 0) + ' mm³']], self: true, ret: de(masse(p), 2) + ' kg' }
      ];
    }
    function starteAufruf(n) { st.aufruf = n; st.step = 0; st.hl = []; st.prog.push('print(' + n + '.masse())'); progMerk(); render(); }
    function progMerk() { /* Platzhalter: der Aufruf steht schon im Programm */ }

    function render() {
      /* Klasse */
      clear(classPre);
      KLASSE.forEach(function (z, i) {
        var s = el('span', { class: 'v20-line' + (st.hl.indexOf(i) >= 0 ? ' is-hl' : ''), text: z.length ? z : ' ' });
        classPre.appendChild(s);
      });
      progPre.textContent = st.prog.length ? st.prog.join('\n') : '(noch leer)';
      /* Namen */
      clear(namesCol); clear(objsCol);
      var steps = st.aufruf ? schritte(st.aufruf) : [];
      var cur = st.step >= 0 && steps[st.step] ? steps[st.step] : null;
      NAMEN.forEach(function (n) {
        if (!(n in st.names)) return;
        namesCol.appendChild(el('div', { class: 'v20-name', 'data-name': n, text: n }));
      });
      if (cur && cur.self) {
        var o2 = objVon(st.aufruf);
        namesCol.appendChild(el('div', { class: 'v20-name v20-name--self', 'data-name': 'self', 'data-ziel': String(o2.id), text: 'self' }));
      }
      st.objs.forEach(function (o) {
        var card = el('div', { class: 'v20-obj', 'data-obj': String(o.id) });
        card.appendChild(el('div', { class: 'v20-obj__head', text: 'Objekt Nr. ' + o.id + ' · Flansch' }));
        var dl = el('dl', { class: 'v20-attrs' });
        ATTR.forEach(function (k) {
          dl.appendChild(el('dt', { text: k }));
          var dd = el('dd', { text: String(o.p[k]) });
          dl.appendChild(dd);
        });
        card.appendChild(dl);
        objsCol.appendChild(card);
      });
      if (!st.objs.length) objsCol.appendChild(el('p', { class: 'v20-empty k-small k-muted', text: 'Hier erscheinen die Objekte.' }));
      /* Aufruf-Bereich */
      clear(callBox);
      var namen = NAMEN.filter(function (n) { return n in st.names; });
      namen.forEach(function (n) { callBox.appendChild(btn(n + '.masse() Schritt für Schritt', 'k-btn--ghost', function () { starteAufruf(n); })); });
      if (st.aufruf) {
        callBox.appendChild(btn('Zurück', 'k-btn--ghost', function () { if (st.step > 0) { st.step--; st.hl = schritte(st.aufruf)[st.step].hl; render(); } }));
        var weiter = btn(st.step >= 4 ? 'Beenden' : 'Nächster Schritt', '', function () {
          if (st.step >= 4) { st.msg = 'Der Aufruf ist beendet: ' + st.aufruf + '.masse() lieferte ' + de(masse(objVon(st.aufruf).p), 2) + ' kg.'; st.aufruf = null; st.step = -1; st.hl = []; }
          else { st.step++; st.hl = schritte(st.aufruf)[st.step].hl; }
          render();
        });
        callBox.appendChild(weiter);
      }
      /* Frame */
      if (cur) {
        frame.hidden = false; clear(frame);
        frame.appendChild(el('p', { class: 'v20-ptitle', text: 'Methode masse läuft (Schritt ' + (st.step + 1) + ' von 5)' }));
        var dl2 = el('dl', { class: 'v20-attrs' });
        if (cur.self) { dl2.appendChild(el('dt', { text: 'self' })); dl2.appendChild(el('dd', { text: 'Objekt Nr. ' + objVon(st.aufruf).id })); }
        cur.locals.forEach(function (l) { dl2.appendChild(el('dt', { text: l[0] })); dl2.appendChild(el('dd', { text: l[1] })); });
        if (cur.ret) { dl2.appendChild(el('dt', { text: 'Rückgabe' })); dl2.appendChild(el('dd', { text: cur.ret })); }
        frame.appendChild(dl2);
        live.textContent = cur.t;
      } else { frame.hidden = true; live.textContent = st.msg; }
      /* Knöpfe */
      bNeu.disabled = !freierName();
      bN.disabled = !objVon('f1'); bN.textContent = 'f1.n = ' + (objVon('f1') && objVon('f1').p.n === 8 ? VORLAGEN[1].p.n : 8) + ' setzen';
      bAlias.disabled = !objVon('f1') || (('f2' in st.names) && st.names.f2 === st.names.f1);
      zeichnePfeile();
    }
    function zeichnePfeile() {
      clear(arrows);
      var defs = sv('defs'); var m = sv('marker', { id: 'v20-pfeil-' + hostId, markerWidth: '8', markerHeight: '8', refX: '7', refY: '4', orient: 'auto' });
      m.appendChild(sv('path', { d: 'M0,0 L8,4 L0,8 z', fill: '#1A1A1A' })); defs.appendChild(m); arrows.appendChild(defs);
      var box = mem.getBoundingClientRect();
      arrows.setAttribute('width', box.width); arrows.setAttribute('height', box.height);
      Array.prototype.forEach.call(namesCol.children, function (nm) {
        var id = nm.getAttribute('data-ziel') || st.names[nm.getAttribute('data-name')];
        var card = objsCol.querySelector('[data-obj="' + id + '"]');
        if (!card) return;
        var a = nm.getBoundingClientRect(), b = card.getBoundingClientRect();
        var x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top, x2 = b.left - box.left - 2;
        var y2 = Math.min(Math.max(y1, b.top - box.top + 14), b.bottom - box.top - 14);
        var self = nm.classList.contains('v20-name--self');
        arrows.appendChild(sv('path', { d: 'M' + x1 + ',' + y1 + ' C' + (x1 + (x2 - x1) * 0.5) + ',' + y1 + ' ' + (x1 + (x2 - x1) * 0.5) + ',' + y2 + ' ' + x2 + ',' + y2, fill: 'none', stroke: '#1A1A1A', 'stroke-width': '2', 'stroke-dasharray': self ? '5 4' : '0', 'marker-end': 'url(#v20-pfeil-' + hostId + ')' }));
      });
    }
    var hostId = nextId('a');
    render();
    window.addEventListener('resize', zeichnePfeile);
  }

  /* ══════════════════════════════════════════════════════════
     (B) Parametrischer Flansch
     ══════════════════════════════════════════════════════════ */
  var PARAM = [
    { k: 'd_aussen', t: 'd_aussen (Außendurchmesser)', min: 60, max: 200, step: 1, u: 'mm' },
    { k: 'd_innen', t: 'd_innen (Mittelloch)', min: 10, max: 80, step: 1, u: 'mm' },
    { k: 'dicke', t: 'dicke', min: 5, max: 40, step: 1, u: 'mm' },
    { k: 'lochkreis', t: 'lochkreis (Durchmesser)', min: 40, max: 180, step: 1, u: 'mm' },
    { k: 'n', t: 'n (Zahl der Bohrungen)', min: 0, max: 12, step: 1, u: '' },
    { k: 'd_bohrung', t: 'd_bohrung', min: 4, max: 30, step: 1, u: 'mm' }
  ];
  var PRESETS_B = [
    { t: 'DN40 (Beispiel)', p: { d_aussen: 120, d_innen: 40, dicke: 15, lochkreis: 90, n: 6, d_bohrung: 11 } },
    { t: 'Acht Bohrungen', p: { d_aussen: 120, d_innen: 40, dicke: 15, lochkreis: 90, n: 8, d_bohrung: 11 } },
    { t: 'Zu großer Lochkreis', p: { d_aussen: 120, d_innen: 40, dicke: 15, lochkreis: 110, n: 6, d_bohrung: 14 } },
    { t: 'Bohrung im Mittelloch', p: { d_aussen: 120, d_innen: 60, dicke: 15, lochkreis: 70, n: 6, d_bohrung: 14 } }
  ];
  var KLASSE_PY = [
    'import math',
    'import bauteil3d',
    '',
    '',
    'class Flansch:',
    '    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):',
    '        self.d_aussen = d_aussen',
    '        self.d_innen = d_innen',
    '        self.dicke = dicke',
    '        self.lochkreis = lochkreis',
    '        self.n = n',
    '        self.d_bohrung = d_bohrung',
    '',
    '    def ist_gueltig(self):',
    '        rand_aussen = (self.lochkreis + self.d_bohrung) / 2 < self.d_aussen / 2',
    '        rand_innen = (self.lochkreis - self.d_bohrung) / 2 > self.d_innen / 2',
    '        return rand_aussen and rand_innen',
    '',
    '    def volumen(self):',
    '        ring = math.pi / 4 * (self.d_aussen ** 2 - self.d_innen ** 2) * self.dicke',
    '        bohrungen = self.n * math.pi / 4 * self.d_bohrung ** 2 * self.dicke',
    '        return ring - bohrungen',
    '',
    '    def masse(self, dichte=7.85):',
    '        return self.volumen() / 1000 * dichte / 1000',
    '',
    '    def mesh(self):',
    '        return bauteil3d.flansch(self.d_aussen, self.d_innen, self.dicke,',
    '                                 self.lochkreis, self.n, self.d_bohrung)',
    '',
    ''
  ].join('\n');

  function initFlansch(host) {
    var p = {}; PRESETS_B[0].p && ATTR.forEach(function (k) { p[k] = PRESETS_B[0].p[k]; });
    var dichte = 7.85, werkstoff = 0;
    var inputs = {};

    var form = el('div', { class: 'v20-form' });
    PARAM.forEach(function (d) {
      var id = nextId('v20-in');
      var num = el('input', { type: 'number', class: 'v20-num', id: id, min: d.min, max: d.max, step: d.step, value: p[d.k], inputmode: 'decimal' });
      var rng = el('input', { type: 'range', class: 'v20-range', min: d.min, max: d.max, step: d.step, value: p[d.k], 'aria-label': d.t + ' als Schieberegler' });
      var lab = el('label', { class: 'v20-lbl', for: id, text: d.t + (d.u ? ' in ' + d.u : '') });
      num.addEventListener('input', function () { var v = parseFloat(num.value.replace(',', '.')); if (!isNaN(v)) { p[d.k] = v; rng.value = v; } aktualisiere(); });
      rng.addEventListener('input', function () { p[d.k] = parseFloat(rng.value); num.value = rng.value; aktualisiere(); });
      inputs[d.k] = { num: num, rng: rng };
      form.appendChild(el('div', { class: 'v20-fld' }, [lab, el('div', { class: 'v20-rangewrap' }, [rng, num])]));
    });

    var pre = el('div', { class: 'v20-btnrow' });
    PRESETS_B.forEach(function (v) {
      pre.appendChild(btn(v.t, 'k-btn--ghost', function () { ATTR.forEach(function (k) { p[k] = v.p[k]; inputs[k].num.value = v.p[k]; inputs[k].rng.value = v.p[k]; }); aktualisiere(); }));
    });
    var wSeg = el('div', { class: 'k-seg v20-seg', role: 'group', 'aria-label': 'Werkstoff' });
    [['Stahl 7,85 g/cm³', 7.85], ['Aluminium 2,70 g/cm³', 2.7]].forEach(function (w, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: w[0] });
      b.addEventListener('click', function () { dichte = w[1]; werkstoff = i; Array.prototype.forEach.call(wSeg.children, function (c, j) { c.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); aktualisiere(); });
      wSeg.appendChild(b);
    });

    var svgTop = sv('svg', { class: 'v20-svg', viewBox: '0 0 300 320', role: 'img' });
    var svgSide = sv('svg', { class: 'v20-svg v20-svg--side', viewBox: '0 0 300 110', role: 'img' });
    var views = el('div', { class: 'v20-views' }, [
      el('figure', { class: 'v20-fig' }, [svgTop, el('figcaption', { class: 'k-small k-muted', text: 'Draufsicht' })]),
      el('figure', { class: 'v20-fig' }, [svgSide, el('figcaption', { class: 'k-small k-muted', text: 'Schnitt durch die Achse (Bohrung auf der +x-Seite)' })])
    ]);

    var call = el('pre', { class: 'v20-call', 'data-run': 'no', 'aria-label': 'Erzeugter Python-Aufruf' });
    var verdict = el('div', { class: 'v20-verdict', role: 'status', 'aria-live': 'polite' });
    var res = el('dl', { class: 'v20-res' });

    var b3d = btn('In 3D ansehen', '', run3d);
    var out = el('pre', { class: 'v20-out', 'aria-live': 'polite', hidden: '' });
    var kopf = el('div', { class: 'v20-btnrow' }, [b3d]);

    var left = el('div', { class: 'v20-col' }, [form, pre, el('div', { class: 'k-field' }, [el('span', { class: 'v20-lbl', text: 'Werkstoff' }), wSeg])]);
    var right = el('div', { class: 'v20-col' }, [views]);
    host.appendChild(el('div', { class: 'v20-grid2 v20-grid2--b' }, [left, right]));
    host.appendChild(el('p', { class: 'v20-ptitle', text: 'Der Aufruf, den Python daraus macht' }));
    host.appendChild(call); host.appendChild(verdict); host.appendChild(res);
    host.appendChild(kopf); host.appendChild(out);

    function marker(txt, x, y, anchor) { return sv('text', { x: x, y: y, 'text-anchor': anchor || 'middle', class: 'v20-svt' }, txt); }
    function zeichne() {
      var s = 1.3, cx = 150, cy = 150, v = pruefung(p), ok = v.gueltig;
      clear(svgTop); clear(svgSide);
      var ra = p.d_aussen / 2 * s, ri = p.d_innen / 2 * s, rl = p.lochkreis / 2 * s, rb = p.d_bohrung / 2 * s;
      svgTop.setAttribute('aria-label', 'Draufsicht: Flansch mit ' + zahl(p.d_aussen) + ' mm Außendurchmesser, ' + p.n + ' Bohrungen auf dem Lochkreis ' + zahl(p.lochkreis) + ' mm. ' + (ok ? 'Maße gültig.' : 'Maße ungültig.'));
      svgTop.appendChild(sv('circle', { cx: cx, cy: cy, r: ra, class: 'v20-body' }));
      svgTop.appendChild(sv('circle', { cx: cx, cy: cy, r: ri, class: 'v20-hole' }));
      svgTop.appendChild(sv('circle', { cx: cx, cy: cy, r: rl, class: 'v20-pcd' }));
      for (var k = 0; k < p.n; k++) {
        var w = 2 * Math.PI * k / p.n;
        svgTop.appendChild(sv('circle', { cx: cx + rl * Math.cos(w), cy: cy - rl * Math.sin(w), r: rb, class: 'v20-bore' + (ok ? '' : ' is-bad') }));
      }
      svgTop.appendChild(sv('line', { x1: cx - 6, y1: cy, x2: cx + 6, y2: cy, class: 'v20-axis' }));
      svgTop.appendChild(sv('line', { x1: cx, y1: cy - 6, x2: cx, y2: cy + 6, class: 'v20-axis' }));
      svgTop.appendChild(sv('line', { x1: cx - ra, y1: 306, x2: cx + ra, y2: 306, class: 'v20-dim' }));
      svgTop.appendChild(sv('line', { x1: cx - ra, y1: 300, x2: cx - ra, y2: 312, class: 'v20-dim' }));
      svgTop.appendChild(sv('line', { x1: cx + ra, y1: 300, x2: cx + ra, y2: 312, class: 'v20-dim' }));
      svgTop.appendChild(marker('Ø ' + zahl(p.d_aussen) + ' mm', cx, 297));
      if (!ok) svgTop.appendChild(marker('ungültig', 150, 14));
      /* Schnitt */
      var t = p.dicke * s, y0 = 28, c2 = 150;
      svgSide.setAttribute('aria-label', 'Schnitt durch die Achse: Dicke ' + zahl(p.dicke) + ' mm, Mittelloch ' + zahl(p.d_innen) + ' mm.');
      function wand(xa, xb) { svgSide.appendChild(sv('rect', { x: xa, y: y0, width: Math.max(0, xb - xa), height: t, class: 'v20-cut' })); }
      var bohrR = c2 + rl, bohrL = c2 - rl;
      function wandMitLoch(xa, xb, xm) {
        var a = Math.max(xa, xm - rb), b = Math.min(xb, xm + rb);
        if (p.n < 1 || b <= a) { wand(xa, xb); return; }
        wand(xa, a); wand(b, xb);
        svgSide.appendChild(sv('rect', { x: a, y: y0, width: b - a, height: t, class: 'v20-gap' + (ok ? '' : ' is-bad') }));
      }
      if (p.d_innen < p.d_aussen) {
        wandMitLoch(c2 + ri, c2 + ra, bohrR);
        if (p.n % 2 === 0 && p.n > 0) wandMitLoch(c2 - ra, c2 - ri, bohrL); else wand(c2 - ra, c2 - ri);
      }
      svgSide.appendChild(sv('line', { x1: c2, y1: y0 - 10, x2: c2, y2: y0 + t + 10, class: 'v20-axis' }));
      svgSide.appendChild(sv('line', { x1: c2 + ra + 8, y1: y0, x2: c2 + ra + 8, y2: y0 + t, class: 'v20-dim' }));
      svgSide.appendChild(marker('t = ' + zahl(p.dicke), c2 + ra + 12, y0 + t / 2 + 4, 'start'));
      svgSide.appendChild(marker('Ø ' + zahl(p.d_innen) + ' mm', c2, y0 + t + 28));
    }
    function aktualisiere() {
      var ok = ATTR.every(function (k) { return isFinite(p[k]); });
      if (!ok) return;
      zeichne();
      var v = pruefung(p), vol = volumen(p), m = vol.gesamt / 1000 * dichte / 1000;
      call.textContent = 'f = ' + pyAufruf(p) + '\nprint(f.ist_gueltig())   # ' + (v.gueltig ? 'True' : 'False') + '\nprint(f.masse(' + (werkstoff ? 'dichte=2.7' : '') + '))   # ' + de(m, 2) + ' kg';
      verdict.className = 'v20-verdict ' + (v.gueltig ? 'is-ok' : 'is-bad');
      clear(verdict);
      var msgs = [];
      if (v.gueltig) msgs.push('Gültig: Alle Bohrungen liegen zwischen Mittelloch und Außenrand (von ' + zahl(v.innen) + ' mm bis ' + zahl(v.aussen) + ' mm Radius, erlaubt sind mehr als ' + zahl(p.d_innen / 2) + ' mm und weniger als ' + zahl(p.d_aussen / 2) + ' mm).');
      else {
        if (!v.rand_aussen) msgs.push('Ungültig: Die Bohrung ragt über den Rand. (lochkreis + d_bohrung) / 2 = ' + zahl(v.aussen) + ' mm ist nicht kleiner als d_aussen / 2 = ' + zahl(p.d_aussen / 2) + ' mm.');
        if (!v.rand_innen) msgs.push('Ungültig: Die Bohrung ragt ins Mittelloch. (lochkreis − d_bohrung) / 2 = ' + zahl(v.innen) + ' mm ist nicht größer als d_innen / 2 = ' + zahl(p.d_innen / 2) + ' mm.');
      }
      var svg = verdict.appendChild(sv('svg', { class: 'v20-ic', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }));
      svg.appendChild(sv('path', { d: v.gueltig ? 'M5 12.5l4.5 4.5L19 7' : 'M6 6l12 12M18 6L6 18', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      var wrap = el('div'); msgs.forEach(function (t) { wrap.appendChild(el('p', { text: t })); }); verdict.appendChild(wrap);
      clear(res);
      [['Volumen', de(vol.gesamt / 1000, 1) + ' cm³ (Ring ' + de(vol.ring / 1000, 1) + ' cm³ minus ' + p.n + ' Bohrungen ' + de(vol.loecher / 1000, 1) + ' cm³)'], ['Masse', de(m, 2) + ' kg (' + (werkstoff ? 'Aluminium' : 'Stahl') + ', ' + String(dichte).replace('.', ',') + ' g/cm³)']].forEach(function (r) {
        res.appendChild(el('dt', { text: r[0] })); res.appendChild(el('dd', { text: r[1] }));
      });
      b3d.disabled = running;
    }
    var running = false;
    function run3d() {
      var KP = root.KursPy;
      out.hidden = false; out.textContent = '';
      if (!KP || !KP.run) { out.textContent = 'Der Python-Läufer ist nicht verfügbar (kurs.js fehlt).'; return; }
      if (running) return;
      running = true; b3d.disabled = true;
      var code = KLASSE_PY + 'f = ' + pyAufruf(p) + '\n' +
        'print("Gültig:", f.ist_gueltig())\n' +
        'print(f"Volumen: {f.volumen() / 1000:.1f} cm³, Masse: {f.masse(' + (werkstoff ? 'dichte=2.7' : '') + '):.2f} kg")\n' +
        'bauteil3d.zeige(f.mesh(), "Flansch")\n';
      var ro = KP.mix({
        timeout: 20000,
        onOut: function (t) { out.textContent += t; },
        onErr: function (t) { out.textContent += t; }
      }, KP.ui(out, { files: ['../assets/py/bauteil3d.py'], scan: code }));
      out.textContent = KP.worker ? 'läuft …\n' : 'Python wird geladen (einmalig, ca. 10 MB) …\n';
      var first = true;
      var onOut = ro.onOut; ro.onOut = function (t) { if (first) { out.textContent = ''; first = false; } onOut(t); };
      var onErr = ro.onErr; ro.onErr = function (t) { if (first) { out.textContent = ''; first = false; } onErr(t); };
      KP.run(code, ro).then(function (r) {
        ro.finish();
        if (first) out.textContent = '';
        if (r && r.timedOut) out.textContent += '\nAbgebrochen nach 20 s.\n';
        else if (r && r.error) out.textContent += (out.textContent && !/\n$/.test(out.textContent) ? '\n' : '') + String(r.error).replace(/\s+$/, '') + '\nDas Hilfsmodul meldet ungültige Maße mit einem ValueError, bevor es ein Netz baut.\n';
      }).catch(function (e) { ro.finish(); out.textContent = 'Python konnte nicht gestartet werden: ' + e.message; })
        .then(function () { running = false; b3d.disabled = false; });
    }
    aktualisiere();
  }

  /* ══════════════════════════════════════════════════════════
     (C) PAP: Baureihe prüfen
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(), P.op('Baureihe = Liste der Nennweiten'),
      P.whil('weitere Nennweite?', [
        P.op('f = Flansch(Maße der Nennweite)'),
        P.sub('f.ist_gueltig()'),
        P.iff('gültig?', [P.io('Masse ausgeben: f.masse()')], [P.io('Warnung ausgeben')])
      ]),
      P.end()
    ];
    var d = el('div', { class: 'v20-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan Baureihe prüfen: Für jede Nennweite einen Flansch erzeugen, im Unterprogramm ist_gueltig prüfen, bei gültig die Masse ausgeben, sonst eine Warnung.' });
    host.appendChild(d);
  }

  function init() {
    var map = { bauplan: initBauplan, flansch: initFlansch, 'pap-baureihe': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
