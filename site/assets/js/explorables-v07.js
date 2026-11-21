/* =============================================================
   explorables-v07.js – interaktive Bausteine für V07 (Zerlegung und Funktionen), reines JS
   Braucht pap-engine.js (window.KursPAP) und v05.css (Code-Anzeige, PAP-Stile) sowie v07.css.
   (A) zerlegung   Wellen-Rechner in drei Schritten zerlegen (Original · DRY · SRP und KISS)
   (B) baum        Top-down-Zerlegung: Problem, Teilprobleme, Bausteine (Ebene für Ebene)
   (C) blackbox    Funktion als Blackbox: Parameter hinein, Rückgabewert heraus (print statt return sichtbar)
   (D) stapel      Aufrufstapel Schritt für Schritt: tau(T, d) ruft widerstandsmoment(d)
   (E) pap         PAP-Abbildungen (Hauptprogramm, pruefe, tau, Schnittgeschwindigkeit) aus der Engine
   (F) papzeichnen PAP auf Papier zeichnen, dann Musterlösung zeigen (Selbstcheck)
   (G) data-paplueck  PAP ergänzen: Code gegeben, Unterprogramm-Symbole und Texte fehlen
   Der Rechenkern (Formeln) ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Rechenkern: dieselben Formeln wie in briefing/v07-beispiel.py ─────────── */
  function torsionsmoment(P, n) { var omega = 2 * Math.PI * n / 60; return P * 1000 / omega; }
  function widerstandsmoment(d) { return Math.PI * Math.pow(d, 3) / 16; }
  function tau(T, d) { return T * 1000 / widerstandsmoment(d); }
  function pruefe(t, zul) { if (zul === undefined) zul = 40.0; return t <= zul ? 'ok' : 'zu hoch'; }
  /* Zahl so schreiben, wie Python sie druckt (genug Stellen, ohne Rauschen) */
  function py(x) {
    if (typeof x === 'string') return x;
    if (x === null || x === undefined) return 'None';
    if (typeof x === 'boolean') return x ? 'True' : 'False';
    var r = Math.round(x * 1e4) / 1e4, s = String(r);
    return /^-?\d+$/.test(s) ? s + '.0' : s;
  }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }

  var api = { torsionsmoment: torsionsmoment, widerstandsmoment: widerstandsmoment, tau: tau, pruefe: pruefe, py: py };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  var P = root.KursPAP ? root.KursPAP.P : null;

  /* ── DOM-Hilfen ───────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
      if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function hl(text) {
    var re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|return|import|if|elif|else|and|or|not|for|in|while|True|False|None|pass)\b|\b(print|input|float|int|str|abs|round|range|math)\b|(\b\d+(?:\.\d+)?\b)/g;
    var out = '', last = 0, m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      var cls = m[1] ? 'cm' : (m[2] ? 'st' : (m[3] ? 'kw' : (m[4] ? 'fn' : 'nu')));
      out += '<span class="v05-' + cls + '">' + esc(m[0]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(text.slice(last));
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
  function markSolved(task) {
    var A = window.KursAufgaben;
    if (!A || !task) return;
    var id = task.getAttribute('data-id');
    if (!id) return;
    A.store.setSolved(document.body.getAttribute('data-lesson') || 'V07', id);
    task.classList.add('is-solved');
    A.update();
  }
  /* Code-Anzeige mit Zeilennummern; lines: [{text, ind, cls}] */
  function drawCode(lines, opts) {
    opts = opts || {};
    var box = el('div', { class: 'v05-codewrap' });
    var code = el('div', { class: 'v05-code', role: 'region', 'aria-label': opts.label || 'Python-Code', tabindex: '0' });
    lines.forEach(function (l, k) {
      var num = String(k + 1);
      var row = el('div', { class: 'v05-line' + (l.cls ? ' ' + l.cls : '') });
      row.setAttribute('data-ln', String(k + 1));
      row.appendChild(el('span', { class: 'v05-ln', 'aria-hidden': 'true', text: num }));
      var tx = el('span', { class: 'v05-tx' });
      tx.innerHTML = hl(new Array((l.ind || 0) * 4 + 1).join(' ') + l.text);
      row.appendChild(tx);
      code.appendChild(row);
    });
    box.appendChild(code);
    if (opts.copy) {
      var b = el('button', { type: 'button', class: 'v05-copy', text: 'Kopieren' });
      var live = el('span', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
      b.addEventListener('click', function () {
        var t = lines.map(function (l) { return new Array((l.ind || 0) * 4 + 1).join(' ') + l.text; }).join('\n');
        function ok() { b.textContent = 'Kopiert'; live.textContent = 'Code kopiert'; setTimeout(function () { b.textContent = 'Kopieren'; live.textContent = ''; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { /* ohne Zwischenablage weiter */ });
      });
      box.appendChild(b); box.appendChild(live);
    }
    return box;
  }
  function runnable(host, code) {
    var pre = el('pre'); pre.appendChild(el('code', { text: code }));
    host.innerHTML = ''; host.appendChild(pre);
    if (window.KursRunner && window.KursRunner.enhance) window.KursRunner.enhance(pre);
  }
  function textOf(lines) { return lines.map(function (l) { return new Array((l.ind || 0) * 4 + 1).join(' ') + l.text; }).join('\n'); }

  /* ══════════════════════════════════════════════════════════
     (A) Wellen-Rechner zerlegen
     ══════════════════════════════════════════════════════════ */
  var WELLEN = [
    { P: '15.0', n: '1450', d: '30.0', kw: '15 kW bei 1450 1/min, Durchmesser 30 mm' },
    { P: '7.5', n: '960', d: '35.0', kw: '7.5 kW bei 960 1/min, Durchmesser 35 mm' },
    { P: '22.0', n: '1450', d: '40.0', kw: '22 kW bei 1450 1/min, Durchmesser 40 mm' }
  ];
  function origLines(withBug) {
    var L = [{ text: '# Wellen-Rechner (KI-Entwurf): Torsionsspannung für drei Getriebewellen' }, { text: 'import math' }, { text: '' }];
    WELLEN.forEach(function (w, i) {
      var k = i + 1, c = 'c' + i;
      L.push({ text: '# --- Welle ' + k + ': Motor ' + w.kw + ' ---' });
      L.push({ text: 'P' + k + ' = ' + w.P, cls: c });
      L.push({ text: 'n' + k + ' = ' + w.n, cls: c });
      L.push({ text: 'd' + k + ' = ' + w.d, cls: c });
      L.push({ text: 'omega' + k + ' = 2 * math.pi * n' + k + ' / 60', cls: c });
      L.push({ text: 'T' + k + ' = P' + k + ' * 1000 / omega' + k, cls: c });
      var bug = (k === 3);
      L.push({ text: 'Wp' + k + ' = math.pi * d' + k + ' ** ' + (bug ? '2' : '3') + ' / 16', cls: c + (bug && withBug ? ' v07-bug' : '') });
      L.push({ text: 'tau' + k + ' = T' + k + ' * 1000 / Wp' + k, cls: c });
      L.push({ text: 'print("Welle ' + k + ': T =", round(T' + k + ', 1), "N·m, tau =", round(tau' + k + ', 1), "MPa")', cls: c });
      L.push({ text: 'if tau' + k + ' <= 40:', cls: c });
      L.push({ text: 'print("Welle ' + k + ': ok")', ind: 1, cls: c });
      L.push({ text: 'else:', cls: c });
      L.push({ text: 'print("Welle ' + k + ': zu hoch")', ind: 1, cls: c });
      if (k < 3) L.push({ text: '' });
    });
    return L;
  }
  var DRY_LINES = [
    { text: '# Wellen-Rechner, Schritt 1: die Formel steht nur noch einmal da' },
    { text: 'import math' }, { text: '' },
    { text: 'def welle_pruefen(P, n, d):' },
    { text: 'omega = 2 * math.pi * n / 60', ind: 1 },
    { text: 'T = P * 1000 / omega', ind: 1 },
    { text: 'Wp = math.pi * d ** 3 / 16', ind: 1 },
    { text: 'tau = T * 1000 / Wp', ind: 1 },
    { text: 'print("T =", round(T, 1), "N·m, tau =", round(tau, 1), "MPa")', ind: 1 },
    { text: 'if tau <= 40:', ind: 1 },
    { text: 'print("ok")', ind: 2 },
    { text: 'else:', ind: 1 },
    { text: 'print("zu hoch")', ind: 2 },
    { text: '' },
    { text: 'welle_pruefen(15.0, 1450, 30.0)' },
    { text: 'welle_pruefen(7.5, 960, 35.0)' },
    { text: 'welle_pruefen(22.0, 1450, 40.0)' }
  ];
  var SRP_LINES = [
    { text: '# Wellen-Rechner, Schritt 2: vier Bausteine, je eine Aufgabe' },
    { text: 'import math' }, { text: '' },
    { text: 'def torsionsmoment(P, n):' },
    { text: '"""Moment in N·m aus Leistung in kW und Drehzahl in 1/min."""', ind: 1 },
    { text: 'return P * 1000 / (2 * math.pi * n / 60)', ind: 1 },
    { text: '' },
    { text: 'def widerstandsmoment(d):' },
    { text: '"""Polares Widerstandsmoment in mm³ einer Vollwelle."""', ind: 1 },
    { text: 'return math.pi * d ** 3 / 16', ind: 1 },
    { text: '' },
    { text: 'def tau(T, d):' },
    { text: '"""Torsionsspannung in MPa aus Moment in N·m und d in mm."""', ind: 1 },
    { text: 'return T * 1000 / widerstandsmoment(d)', ind: 1 },
    { text: '' },
    { text: 'def pruefe(tau_vorh, tau_zul=40.0):' },
    { text: '"""Gibt \'ok\' oder \'zu hoch\' zurück."""', ind: 1 },
    { text: 'if tau_vorh <= tau_zul:', ind: 1 },
    { text: 'return "ok"', ind: 2 },
    { text: 'else:', ind: 1 },
    { text: 'return "zu hoch"', ind: 2 },
    { text: '' },
    { text: 't1 = tau(torsionsmoment(15.0, 1450), 30.0)' },
    { text: 'print("Welle 1:", round(t1, 1), "MPa", pruefe(t1))' },
    { text: 't2 = tau(torsionsmoment(7.5, 960), 35.0)' },
    { text: 'print("Welle 2:", round(t2, 1), "MPa", pruefe(t2))' },
    { text: 't3 = tau(torsionsmoment(22.0, 1450), 40.0)' },
    { text: 'print("Welle 3:", round(t3, 1), "MPa", pruefe(t3))' }
  ];
  function countCode(lines) { return lines.filter(function (l) { return l.text !== '' && l.text.charAt(0) !== '#'; }).length; }

  function initZerlegung(host) {
    var step = 0, showBug = false, editing = false;
    var STEPS = [
      { name: '1 Original', lines: function () { return origLines(showBug); }, label: 'Original: 44 Zeilen, die Formel dreimal kopiert',
        tags: [], stellen: 3, wert: 'KI-Entwurf: läuft ohne Fehlermeldung durch',
        msg: 'Dieselben fünf Rechenzeilen stehen dreimal da (blau, grün, orange). Drück „Fehler zeigen“: In der dritten Kopie steht d ** 2 statt d ** 3, das Skript läuft trotzdem durch und meldet Welle 3 fälschlich als überlastet (461 MPa).' },
      { name: '2 DRY', lines: function () { return DRY_LINES; }, label: 'Schritt 1: eine Funktion, drei Aufrufe',
        tags: ['DRY'], stellen: 1, wert: 'Formel nur einmal: ein Tippfehler fällt bei allen drei Wellen sofort auf',
        msg: 'DRY (don’t repeat yourself): Die Rechnung steht nur noch einmal in der Funktion welle_pruefen. Die drei Wellen unterscheiden sich nur durch Leistung, Drehzahl und Durchmesser: Das sind die Parameter. Aber die Funktion rechnet, gibt aus und bewertet in einem: Das sind drei Aufgaben.' },
      { name: '3 SRP und KISS', lines: function () { return SRP_LINES; }, label: 'Schritt 2: vier Bausteine mit je einer Aufgabe',
        tags: ['SRP', 'KISS'], stellen: 1, wert: 'jede Funktion einzeln mit einem Wert von Hand prüfbar',
        msg: 'SRP (single responsibility): jede Funktion hat genau eine Aufgabe. KISS (keep it simple): jede ist nur eine bis drei Zeilen lang und lässt sich mit einem Rechenbeispiel von Hand prüfen. Dazu kommt: Das Hauptprogramm liest sich wie der Plan der Aufgabe.' }
    ];
    var bar = el('div', { class: 'v05-bar' });
    var seg = segment(STEPS.map(function (s) { return s.name; }), 'Zerlegungsschritt', 0, function (i) { step = i; editing = false; render(); });
    var bBug = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', 'aria-pressed': 'false', text: 'Fehler zeigen' });
    var bEdit = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Im Editor ausprobieren' });
    bar.appendChild(seg); bar.appendChild(bBug); bar.appendChild(bEdit);
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var codeBox = el('div');
    var stats = el('dl', { class: 'v05-state' });
    var tags = el('p', { class: 'v07-tags' });
    var side = el('div', {}, [el('h4', { class: 'v05-h', text: 'Bilanz' }), stats, tags]);
    var cols = el('div', { class: 'v05-cols' }, [codeBox, side]);
    host.appendChild(el('div', { class: 'v05-ex' }, [bar, msg, cols]));
    bBug.addEventListener('click', function () { showBug = !showBug; bBug.setAttribute('aria-pressed', showBug ? 'true' : 'false'); render(); });
    bEdit.addEventListener('click', function () { editing = !editing; render(); });
    function render() {
      var s = STEPS[step], lines = s.lines();
      bBug.hidden = step !== 0; bBug.textContent = showBug ? 'Fehler ausblenden' : 'Fehler zeigen';
      bEdit.textContent = editing ? 'Zurück zur Ansicht' : 'Im Editor ausprobieren';
      codeBox.innerHTML = '';
      if (editing) runnable(codeBox, textOf(lines).replace(/\n$/, ''));
      else codeBox.appendChild(drawCode(lines, { label: s.label, copy: true }));
      var bugNo = 0;
      lines.forEach(function (l, k) { if (l.cls && l.cls.indexOf('v07-bug') >= 0) bugNo = k + 1; });
      msg.textContent = (showBug && step === 0 ? 'Der Fehler steckt in Zeile ' + bugNo + ' (rot): ' : '') + s.msg;
      stats.innerHTML = '';
      [['Zeilen', lines.length + ' (davon ' + countCode(lines) + ' mit Code)'],
       ['Stellen mit der Formel', String(s.stellen)],
       ['Änderung: Hohlwelle statt Vollwelle', s.stellen + (s.stellen === 1 ? ' Stelle ändern' : ' Stellen ändern')],
       ['Bewertung', s.wert]].forEach(function (r) { stats.appendChild(el('dt', { text: r[0] })); stats.appendChild(el('dd', { text: r[1] })); });
      tags.innerHTML = '';
      s.tags.forEach(function (t) { tags.appendChild(el('span', { class: 'v07-tag', text: t })); });
    }
    render();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Top-down-Zerlegung als Baum
     ══════════════════════════════════════════════════════════ */
  var BAUM = { lab: 'Hält die Welle das Moment aus?', sub: 'Problem', d: 'Das ganze Problem in einem Satz. Es ist zu groß, um es auf einmal zu programmieren. Jetzt zerlegst du es in Teilprobleme.',
    kids: [
      { lab: 'Moment bestimmen', sub: 'Teilproblem 1', d: 'Aus Motorleistung und Drehzahl folgt das Torsionsmoment an der Welle. Noch eine Rechnung mit zwei Eingaben: das lässt sich als Baustein schreiben.',
        kids: [{ lab: 'torsionsmoment(P, n)', sub: 'Baustein', code: true, d: 'Eingabe: P in kW, n in 1/min. Rückgabe: Moment T in N·m. Ein Satz genügt als Beschreibung, also ist die Zerlegung fertig.' }] },
      { lab: 'Spannung berechnen', sub: 'Teilproblem 2', d: 'Aus Moment und Durchmesser folgt die Torsionsspannung. Dafür braucht man das Widerstandsmoment der Welle: ein weiterer Baustein, den man auch einzeln prüfen und wiederverwenden kann.',
        kids: [{ lab: 'widerstandsmoment(d)', sub: 'Baustein', code: true, d: 'Eingabe: Durchmesser d in mm. Rückgabe: polares Widerstandsmoment in mm³.' },
               { lab: 'tau(T, d)', sub: 'Baustein', code: true, d: 'Eingabe: Moment T in N·m, Durchmesser d in mm. Rückgabe: Spannung in MPa. Dieser Baustein ruft widerstandsmoment(d) auf.' }] },
      { lab: 'Ergebnis bewerten', sub: 'Teilproblem 3', d: 'Die berechnete Spannung wird mit dem zulässigen Wert verglichen. Eine einzige Entscheidung: ok oder zu hoch.',
        kids: [{ lab: 'pruefe(tau_vorh, tau_zul=40.0)', sub: 'Baustein', code: true, d: 'Eingabe: vorhandene und zulässige Spannung in MPa. Rückgabe: der Text "ok" oder "zu hoch".' }] }
    ] };
  function initBaum(host) {
    var level = 0, sel = null;
    var maxLevel = 2;
    var bMore = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Eine Ebene tiefer zerlegen' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var tree = el('div', { class: 'v07-tree' });
    host.appendChild(el('div', { class: 'v05-ex' }, [el('div', { class: 'v05-bar' }, [bMore, bReset]), msg, tree]));
    var lastShown = 0;
    function build(node, depth) {
      var li = el('li', { class: 'v07-tn v07-tn--' + depth + (depth > level ? ' is-hidden' : '') + (depth === level && depth > 0 && depth > lastShown - 1 ? ' is-new' : '') });
      var b = el('button', { type: 'button', class: 'v07-nodebtn' + (node.code ? ' is-code' : '') + (sel === node ? ' is-sel' : ''), 'aria-pressed': sel === node ? 'true' : 'false' }, [
        el('span', { class: 'v07-nodesub', text: node.sub }), el('span', { class: 'v07-nodelab', text: node.lab })]);
      b.addEventListener('click', function () { sel = node; msg.textContent = node.sub + ' „' + node.lab + '“: ' + node.d; render(false); });
      li.appendChild(b);
      if (node.kids) {
        var ul = el('ul', { class: 'v07-tl' });
        node.kids.forEach(function (k) { ul.appendChild(build(k, depth + 1)); });
        li.appendChild(ul);
      }
      return li;
    }
    function render(grow) {
      tree.innerHTML = '';
      var ul = el('ul', { class: 'v07-tl v07-tl--root' }, [build(BAUM, 0)]);
      tree.appendChild(ul);
      bMore.disabled = level >= maxLevel;
      bMore.textContent = level === 0 ? 'In Teilprobleme zerlegen' : (level === 1 ? 'In Bausteine zerlegen' : 'Fertig zerlegt');
      if (grow) lastShown = level;
    }
    bMore.addEventListener('click', function () {
      lastShown = level; level = Math.min(maxLevel, level + 1);
      msg.textContent = level === 1 ? 'Ebene 2: Das Problem ist in drei Teilprobleme zerlegt. Klick ein Kästchen an, um zu sehen, was es tut. Aber die Teilprobleme sind noch keine fertigen Bausteine.'
        : 'Ebene 3: Jedes Teilproblem ist jetzt in Bausteine zerlegt, die du in einem Satz beschreiben kannst (Eingabe, Rückgabe). Aus jedem Baustein wird eine Funktion. Die dunklen Kästchen sind die Funktionen aus dem Skript.';
      render(true);
    });
    bReset.addEventListener('click', function () { level = 0; sel = null; lastShown = 0; msg.textContent = 'Klick „In Teilprobleme zerlegen“. Immer weiter zerlegen, bis du jeden Baustein in einem Satz beschreiben kannst.'; render(true); });
    msg.textContent = 'Klick „In Teilprobleme zerlegen“. Immer weiter zerlegen, bis du jeden Baustein in einem Satz beschreiben kannst.';
    render(true);
  }

  /* ══════════════════════════════════════════════════════════
     (C) Blackbox: Parameter hinein, Rückgabewert heraus
     ══════════════════════════════════════════════════════════ */
  var BB = [
    { name: 'torsionsmoment', sig: 'torsionsmoment(P, n)', par: [['P', 'kW', 15, 1, 100, 0.5], ['n', '1/min', 1450, 100, 3000, 10]], unit: 'N·m',
      run: function (v) { return torsionsmoment(v.P, v.n); },
      code: ['def torsionsmoment(P, n):', '    """Moment in N·m aus P in kW und n in 1/min."""', '    omega = 2 * math.pi * n / 60', '    return P * 1000 / omega'] },
    { name: 'widerstandsmoment', sig: 'widerstandsmoment(d)', par: [['d', 'mm', 30, 10, 80, 1]], unit: 'mm³',
      run: function (v) { return widerstandsmoment(v.d); },
      code: ['def widerstandsmoment(d):', '    """Polares Widerstandsmoment in mm³."""', '    return math.pi * d ** 3 / 16'] },
    { name: 'tau', sig: 'tau(T, d)', par: [['T', 'N·m', 98.8, 10, 400, 0.1], ['d', 'mm', 30, 10, 80, 1]], unit: 'MPa',
      run: function (v) { return tau(v.T, v.d); },
      code: ['def tau(T, d):', '    """Torsionsspannung in MPa."""', '    return T * 1000 / widerstandsmoment(d)'] },
    { name: 'pruefe', sig: 'pruefe(tau_vorh, tau_zul=40.0)', par: [['tau_vorh', 'MPa', 18.6, 1, 100, 0.1], ['tau_zul', 'MPa', 40, 10, 100, 1]], unit: '',
      run: function (v) { return pruefe(v.tau_vorh, v.tau_zul); },
      code: ['def pruefe(tau_vorh, tau_zul=40.0):', '    """Gibt \'ok\' oder \'zu hoch\' zurück."""', '    if tau_vorh <= tau_zul:', '        return "ok"', '    else:', '        return "zu hoch"'] }
  ];
  var uidB = 0;
  function initBlackbox(host) {
    var cur = 0, open = false, wrong = false, vals = {};
    function resetVals() { vals = {}; BB[cur].par.forEach(function (p) { vals[p[0]] = p[2]; }); }
    resetVals();
    var bar = el('div', { class: 'v05-bar' });
    var seg = segment(BB.map(function (b) { return b.name; }), 'Funktion wählen', 0, function (i) { cur = i; resetVals(); render(); });
    var bOpen = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', 'aria-pressed': 'false', text: 'Deckel öffnen' });
    var chkId = 'v07bb' + (++uidB);
    var chk = el('input', { type: 'checkbox', id: chkId });
    var chkLab = el('label', { class: 'v05-check', 'for': chkId }, [chk, 'Variante mit print statt return (Anfängerfehler)']);
    bar.appendChild(seg); bar.appendChild(bOpen);
    var inputs = el('div', { class: 'v07-bb__in' });
    var box = el('div', { class: 'v07-bb__box' });
    var outBox = el('div', { class: 'v07-bb__out' });
    var arrow = function (cls) { var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 40 24'); s.setAttribute('class', 'v07-arrow ' + cls); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false'); s.innerHTML = '<path d="M2 12H32M24 4L34 12L24 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'; return s; };
    var a1 = arrow('v07-arrow--in'), a2 = arrow('v07-arrow--out');
    var grid = el('div', { class: 'v07-bb' }, [inputs, a1, box, a2, outBox]);
    var codeHost = el('div');
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(el('div', { class: 'v05-ex' }, [bar, chkLab, grid, msg, codeHost]));
    bOpen.addEventListener('click', function () { open = !open; render(); });
    chk.addEventListener('change', function () { wrong = chk.checked; render(); });
    function fmt(p, v) { return p[5] < 1 ? v.toFixed(1) : String(Math.round(v)); }
    function render() {
      var b = BB[cur];
      bOpen.setAttribute('aria-pressed', open ? 'true' : 'false'); bOpen.textContent = open ? 'Deckel schließen' : 'Deckel öffnen';
      inputs.innerHTML = '';
      inputs.appendChild(el('p', { class: 'v07-bb__h', text: 'Parameter (Eingabe)' }));
      b.par.forEach(function (p) {
        var id = 'v07bbi' + (++uidB);
        var out = el('output', { 'for': id, text: fmt(p, vals[p[0]]) + ' ' + p[1] });
        var inp = el('input', { type: 'range', id: id, min: String(p[3]), max: String(p[4]), step: String(p[5]), value: String(vals[p[0]]) });
        inp.addEventListener('input', function () { vals[p[0]] = parseFloat(inp.value); out.textContent = fmt(p, vals[p[0]]) + ' ' + p[1]; update(); });
        inputs.appendChild(el('div', { class: 'k-field' }, [el('label', { 'for': id }, [p[0] + ' = ', out]), inp]));
      });
      box.innerHTML = '';
      box.className = 'v07-bb__box' + (open ? ' is-open' : '');
      box.appendChild(el('p', { class: 'v07-bb__name', text: b.sig }));
      if (open) {
        var codeLines = b.code.slice();
        if (wrong) codeLines[codeLines.length - 1] = codeLines[codeLines.length - 1].replace('return ', 'print(') + ')';
        var pre = el('pre', { class: 'v07-bb__code', 'data-run': 'no' }); pre.innerHTML = codeLines.map(function (l) { return hl(l); }).join('\n');
        box.appendChild(pre);
      } else box.appendChild(el('p', { class: 'v07-bb__lid', text: 'Wie sie rechnet, siehst du von außen nicht.' }));
      codeHost.innerHTML = '';
      update();
    }
    function update() {
      var b = BB[cur], r = b.run(vals);
      var show = typeof r === 'string' ? '"' + r + '"' : py(r) + (b.unit ? ' ' + b.unit : '');
      var call = b.name + '(' + b.par.map(function (p) { return (b.par.length > 1 && p[0] === 'tau_zul' ? 'tau_zul=' : '') + py(vals[p[0]]); }).join(', ') + ')';
      outBox.innerHTML = '';
      outBox.appendChild(el('p', { class: 'v07-bb__h', text: 'Rückgabewert (Ausgabe)' }));
      if (wrong) {
        outBox.appendChild(el('p', { class: 'v07-bb__val is-none', text: 'None' }));
        outBox.appendChild(el('p', { class: 'v07-bb__con', text: 'Konsole: ' + (typeof r === 'string' ? r : py(r)) }));
        msg.className = 'v05-msg is-bad';
        msg.textContent = 'Mit print statt return erscheint der Wert nur auf dem Bildschirm. Die Funktion gibt nichts zurück: x = ' + call + ' macht x zu None, und jede Rechnung damit scheitert mit einem TypeError.';
      } else {
        outBox.appendChild(el('p', { class: 'v07-bb__val', text: show }));
        outBox.appendChild(el('p', { class: 'v07-bb__con', text: 'x = ' + call }));
        msg.className = 'v05-msg';
        msg.textContent = 'Schieb die Regler: Der Aufrufer liefert die Parameter und bekommt genau einen Rückgabewert. Öffne den Deckel, um zu sehen, wie die Funktion rechnet. Das müsste der Aufrufer nicht wissen. Aktiviere die print-Variante, um den häufigsten Anfängerfehler zu sehen.';
      }
    }
    render();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Aufrufstapel Schritt für Schritt
     ══════════════════════════════════════════════════════════ */
  var STAPEL_CODE = [
    { text: 'import math' },
    { text: '' },
    { text: 'def widerstandsmoment(d):' },
    { text: 'return math.pi * d ** 3 / 16', ind: 1 },
    { text: '' },
    { text: 'def tau(T, d):' },
    { text: 'return T * 1000 / widerstandsmoment(d)', ind: 1 },
    { text: '' },
    { text: 'T = 98.8' },
    { text: 'spannung = tau(T, 30)' },
    { text: 'print(f"{spannung:.1f} MPa")' }
  ];
  function stapelSteps() {
    var Wp = widerstandsmoment(30), ta = tau(98.8, 30);
    var mod = function (vars) { return { name: '<module>', vars: vars, note: 'Hauptprogramm' }; };
    return [
      { ln: 1, msg: 'Start: Der Stapel enthält nur das Hauptprogramm (<module>). Hier leben die Variablen ohne Funktion.', st: [mod([])] },
      { ln: 3, msg: 'def widerstandsmoment legt nur den Namen an. Der Rumpf (Zeile 4) läuft jetzt noch nicht.', st: [mod([['widerstandsmoment', 'Funktion']])] },
      { ln: 6, msg: 'def tau: ebenfalls nur bekannt gemacht. Noch kein Rechenschritt.', st: [mod([['widerstandsmoment', 'Funktion'], ['tau', 'Funktion']])] },
      { ln: 9, msg: 'Das Hauptprogramm legt T an.', st: [mod([['widerstandsmoment', 'Funktion'], ['tau', 'Funktion'], ['T', '98.8']])] },
      { ln: 10, msg: 'Aufruf tau(T, 30): Für den Aufruf kommt ein neuer Frame auf den Stapel. Die Argumente 98.8 und 30 landen in den Parametern T und d.', push: 1,
        st: [mod([['T', '98.8']]), { name: 'tau', vars: [['T', '98.8'], ['d', '30']], note: 'wartet auf Ergebnis' }] },
      { ln: 7, msg: 'In tau muss erst widerstandsmoment(d) berechnet werden. Dieser Aufruf legt einen zweiten Frame obendrauf: Der Stapel wächst. Auch dort heißt der Parameter d, es ist aber ein eigenes d.', push: 2,
        st: [mod([['T', '98.8']]), { name: 'tau', vars: [['T', '98.8'], ['d', '30']], note: 'wartet auf widerstandsmoment' }, { name: 'widerstandsmoment', vars: [['d', '30']], note: 'aktuell' }] },
      { ln: 4, msg: 'return: widerstandsmoment liefert ' + py(Wp) + ' zurück. Der oberste Frame verschwindet, mit ihm sein d. Der Wert geht an die Aufrufstelle in tau.', pop: 2,
        st: [mod([['T', '98.8']]), { name: 'tau', vars: [['T', '98.8'], ['d', '30']], note: 'bekommt ' + py(Wp) }] },
      { ln: 7, msg: 'tau rechnet 98.8 · 1000 / ' + py(Wp) + ' = ' + py(ta) + ' und gibt den Wert mit return zurück. Auch dieser Frame wird abgebaut.', pop: 1,
        st: [mod([['T', '98.8']])], ret: py(ta) },
      { ln: 10, msg: 'Zurück im Hauptprogramm: Der Rückgabewert ' + py(ta) + ' wird der Variablen spannung zugewiesen. Der Stapel hat wieder nur eine Ebene.',
        st: [mod([['T', '98.8'], ['spannung', py(ta)]])] },
      { ln: 11, msg: 'print gibt das Ergebnis mit einer Nachkommastelle aus: ' + f1(ta) + ' MPa. Das Programm ist zu Ende.', out: f1(ta) + ' MPa',
        st: [mod([['T', '98.8'], ['spannung', py(ta)]])] }
    ];
  }
  function initStapel(host) {
    var steps = stapelSteps(), s = 0;
    var codeCol = el('div'), stackCol = el('div', { class: 'v07-stack', 'aria-label': 'Aufrufstapel' });
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var out = el('pre', { class: 'v05-out', 'aria-label': 'Ausgabe', 'data-run': 'no' });
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Schritt' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var count = el('span', { class: 'v05-count', 'aria-hidden': 'true' });
    var bar = el('div', { class: 'v05-bar', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bBack, bReset, count]);
    host.appendChild(el('div', { class: 'v05-ex' }, [bar, msg, el('div', { class: 'v05-cols v05-cols--eq' }, [el('div', {}, [el('h4', { class: 'v05-h', text: 'Python-Code' }), codeCol, out]), el('div', {}, [el('h4', { class: 'v05-h', text: 'Aufrufstapel (oben = aktuell)' }), stackCol])])]));
    var prevLen = 1;
    function render() {
      var st = steps[s];
      var lines = STAPEL_CODE.map(function (l, i) { return { text: l.text, ind: l.ind, cls: (i + 1) === st.ln ? 'is-active' : '' }; });
      codeCol.innerHTML = ''; codeCol.appendChild(drawCode(lines, { label: 'Code des Aufrufstapel-Beispiels', copy: true }));
      stackCol.innerHTML = '';
      st.st.forEach(function (fr, i) {
        var top = i === st.st.length - 1;
        var f = el('section', { class: 'v07-frame' + (top ? ' is-top' : '') + (i >= prevLen && !reduced() ? ' is-new' : ''), 'aria-label': 'Frame ' + fr.name }, [
          el('header', { class: 'v07-frame__h' }, [el('strong', { text: fr.name }), el('span', { class: 'k-muted', text: fr.note })])]);
        if (!fr.vars.length) f.appendChild(el('p', { class: 'v07-frame__v k-muted', text: 'noch keine Variablen' }));
        fr.vars.forEach(function (v) { f.appendChild(el('p', { class: 'v07-frame__v' }, [el('span', { class: 'v07-var', text: v[0] }), ' = ' + v[1]])); });
        stackCol.insertBefore(f, stackCol.firstChild);   // oberster Frame oben
      });
      if (st.ret) stackCol.appendChild(el('p', { class: 'v07-ret', text: 'Rückgabewert unterwegs: ' + st.ret }));
      prevLen = st.st.length;
      out.textContent = st.out || '';
      msg.textContent = 'Schritt ' + (s + 1) + ' von ' + steps.length + ' · Zeile ' + st.ln + ': ' + st.msg;
      count.textContent = (s + 1) + ' / ' + steps.length;
      bBack.disabled = s === 0; bNext.disabled = s === steps.length - 1;
    }
    bNext.addEventListener('click', function () { if (s < steps.length - 1) { s++; render(); } });
    bBack.addEventListener('click', function () { if (s > 0) { s--; prevLen = 99; render(); } });
    bReset.addEventListener('click', function () { s = 0; prevLen = 1; render(); });
    render();
  }

  /* ══════════════════════════════════════════════════════════
     (E) PAP-Abbildungen
     ══════════════════════════════════════════════════════════ */
  function startN(text, id) { var n = P.start(id || 's'); n.text = text; return n; }
  var PAPS = null;
  function papSpecs() {
    if (PAPS) return PAPS;
    PAPS = {
      haupt: { label: 'Haupt-PAP: Start, Daten einlesen, dann drei Unterprogramm-Aufrufe (torsionsmoment, tau, pruefe), Ausgabe, Ende.',
        spec: function () { return [P.start('s'), P.io('P, n und d einlesen', 'i1'), P.sub('T = torsionsmoment(P, n)', 'u1', { wrapAt: 34 }), P.sub('t = tau(T, d)', 'u2', { wrapAt: 34 }), P.sub('urteil = pruefe(t)', 'u3', { wrapAt: 34 }), P.io('Ausgabe: t und urteil', 'o1'), P.end('e')]; } },
      pruefe: { label: 'PAP des Unterprogramms pruefe: Start mit Funktionsname, Verzweigung tau_vorh kleiner gleich tau_zul, zwei Enden mit Rückgabe ok oder zu hoch.',
        spec: function () { return [startN('pruefe(tau_vorh, tau_zul)'), P.iff('tau_vorh ≤ tau_zul?', [P.end('e1', 'Rückgabe: "ok"')], [P.end('e2', 'Rückgabe: "zu hoch"')], 'd1')]; } },
      tau: { label: 'PAP des Unterprogramms tau: Start mit Funktionsname, Aufruf des Unterprogramms widerstandsmoment, eine Rechnung, Ende mit Rückgabe.',
        spec: function () { return [startN('tau(T, d)'), P.sub('Wp = widerstandsmoment(d)', 'u1', { wrapAt: 34 }), P.op('ergebnis = T · 1000 / Wp', 'o1'), P.end('e', 'Rückgabe: ergebnis')]; } },
      vc: { label: 'Haupt-PAP: d und n einlesen, Unterprogramm schnittgeschwindigkeit aufrufen, Verzweigung vc größer 250, Ausgabe zu schnell oder vc, Ende.',
        spec: function () { return [P.start('s'), P.io('d einlesen', 'i1'), P.io('n einlesen', 'i2'), P.sub('vc = schnittgeschwindigkeit(d, n)', 'u1', { wrapAt: 34 }),
          P.iff('vc > 250?', [P.io('Ausgabe: "zu schnell"', 'o1')], [P.io('Ausgabe: vc', 'o2')], 'd1'), P.end('e')]; } },
      bewerte: { label: 'PAP des Unterprogramms bewerte_vc: Start mit Funktionsname, Verzweigung vc kleiner 80, bei ja Rückgabe zu langsam, bei nein Verzweigung vc größer 250, bei ja Rückgabe zu schnell, bei nein Rückgabe ok.',
        spec: function () { return [startN('bewerte_vc(vc)'), P.iff('vc < 80?', [P.end('e1', 'Rückgabe: "zu langsam"')], [P.iff('vc > 250?', [P.end('e2', 'Rückgabe: "zu schnell"')], [P.end('e3', 'Rückgabe: "ok"')], 'd2')], 'd1')]; } }
    };
    return PAPS;
  }
  function paperSvg(name, extra) {
    var d = papSpecs()[name];
    if (!d || !root.KursPAP) return null;
    var wrap = el('div', { class: 'pap-wrap' });
    wrap.innerHTML = root.KursPAP.svg(d.spec(), { label: d.label, minw: 0.85 });
    return wrap;
  }
  function initPap(host) {
    var w = paperSvg(host.getAttribute('data-pap'));
    if (w) host.appendChild(w);
  }

  /* ══════════════════════════════════════════════════════════
     (F) PAP zeichnen (Papier), danach Lösung zeigen
     ══════════════════════════════════════════════════════════ */
  function initPapZeichnen(host) {
    var name = host.getAttribute('data-pap'), task = host.closest('[data-a]');
    var sol = el('div', { class: 'v05-papdraw' });
    var bShow = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', 'aria-expanded': 'false', text: 'Musterlösung zeigen' });
    var cbId = 'v07cb' + (++uidB);
    var cb = el('input', { type: 'checkbox', id: cbId });
    var lab = el('label', { class: 'v05-check', 'for': cbId }, [cb, 'Mein Plan stimmt mit der Musterlösung überein (Symbole, Beschriftung der Ausgänge, Ende mit Rückgabe)']);
    var live = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite', hidden: 'hidden' });
    host.appendChild(el('div', { class: 'v05-ex' }, [bShow, sol, lab, live]));
    lab.hidden = true;
    var sv = window.KursAufgaben ? window.KursAufgaben.store.solved(document.body.getAttribute('data-lesson') || 'V07') : {};
    if (task && sv[task.getAttribute('data-id')]) cb.checked = true;
    bShow.addEventListener('click', function () {
      var shown = sol.childNodes.length > 0;
      sol.innerHTML = '';
      if (!shown) { var w = paperSvg(name); if (w) sol.appendChild(w); }
      bShow.setAttribute('aria-expanded', shown ? 'false' : 'true'); bShow.textContent = shown ? 'Musterlösung zeigen' : 'Musterlösung ausblenden';
      lab.hidden = shown;
      live.hidden = shown;
      live.textContent = shown ? '' : 'Vergleiche Symbol für Symbol: Rechteck mit Doppellinien nur für den Aufruf eines Unterprogramms, Raute mit „ja“ und „nein“, jeder Ausgang mit Pfeil.';
    });
    cb.addEventListener('change', function () { if (cb.checked) markSolved(task); });
  }

  /* ══════════════════════════════════════════════════════════
     (G) PAP ergänzen: Unterprogramm-Symbole
     ══════════════════════════════════════════════════════════ */
  function normText(s) {
    return String(s).toLowerCase().replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=').replace(/[·×]/g, '*').replace(/−/g, '-')
      .replace(/\boder\b/g, 'or').replace(/\bund\b/g, 'and').replace(/\bnicht\b/g, 'not').replace(/[„“"'?]/g, '').replace(/\s+/g, '');
  }
  var LUECKEN = {
    welle: {
      code: 'P = float(input("P in kW: "))\nn = float(input("n in 1/min: "))\nd = float(input("d in mm: "))\nT = torsionsmoment(P, n)\nspannung = tau(T, d)\nurteil = pruefe(spannung)\nprint("Urteil:", urteil)',
      note: 'Die drei Funktionen torsionsmoment, tau und pruefe sind wie im Vorgerechneten Beispiel schon definiert. Hier zählt nur das Hauptprogramm.',
      build: function (g) {
        return [P.start('s'), P.io('P einlesen', 'i1'), P.io('n einlesen', 'i2'), P.io('d einlesen', 'i3'),
          g(1, P.sub('', 'u1', { wrapAt: 34 })), g(2, P.sub('', 'u2', { wrapAt: 34 })), g(3, P.sub('', 'u3', { wrapAt: 34 })), g(4, P.io('', 'o1')), P.end('e')];
      },
      gaps: [
        { kind: 'sub', ok: ['^t=torsionsmoment\\(p,?n\\)$'], solution: 'T = torsionsmoment(P, n)', hint: 'Die vierte Zeile ruft eine selbst geschriebene Funktion auf. Aufrufe von Funktionen zeichnest du als Unterprogramm. Schreibe die Zuweisung samt Aufruf in das Symbol.' },
        { kind: 'sub', ok: ['^spannung=tau\\(t,?d\\)$'], solution: 'spannung = tau(T, d)', hint: 'Wieder ein Funktionsaufruf, diesmal mit zwei Argumenten T und d.' },
        { kind: 'sub', ok: ['^urteil=pruefe\\(spannung\\)$'], solution: 'urteil = pruefe(spannung)', hint: 'Der Aufruf von pruefe mit dem Argument spannung, das Ergebnis geht an urteil.' },
        { kind: 'io', ok: ['^ausgabe:?urteil:?,?urteil$', '^ausgabe:?urteil$'], solution: 'Ausgabe: Urteil: urteil', hint: 'Die letzte Zeile gibt aus: Parallelogramm, kein Unterprogramm. print selbst ist eine eingebaute Funktion, die als Ausgabe gezeichnet wird.' }
      ]
    },
    pruefe: {
      code: 'def pruefe(tau_vorh, tau_zul=40.0):\n    if tau_vorh <= tau_zul:\n        return "ok"\n    else:\n        return "zu hoch"',
      note: 'Ein Unterprogramm bekommt einen eigenen Plan. Der Start trägt den Funktionsnamen, und jedes return endet in einer Grenzstelle (Ende) mit der Rückgabe.',
      build: function (g) {
        var s = P.start('s'); s.text = 'pruefe(tau_vorh, tau_zul)';
        return [s, g(1, P.iff('', [g(2, P.end('e1'))], [g(3, P.end('e2'))], 'd1'))];
      },
      gaps: [
        { kind: 'if', ok: ['^tau_vorh<=tau_zul$'], solution: 'tau_vorh ≤ tau_zul?', hint: 'Die Bedingung steht in der if-Zeile. Schreibe sie als Frage.' },
        { kind: 'end', ok: ['^r(ü|u|ue)ckgabe:?ok$', '^return:?ok$', '^ok$'], solution: 'Rückgabe: "ok"', hint: 'Der Weg „ja“ führt zu return "ok". Das return beendet die Funktion: ein Ende mit der Rückgabe.' },
        { kind: 'end', ok: ['^r(ü|u|ue)ckgabe:?zuhoch$', '^return:?zuhoch$', '^zuhoch$'], solution: 'Rückgabe: "zu hoch"', hint: 'Der Weg „nein“ (else) führt zu return "zu hoch".' }
      ]
    }
  };
  var KIND_OPTS = [['', 'Symbolart wählen …'], ['io', 'Parallelogramm (Ein-/Ausgabe)'], ['op', 'Rechteck (Operation)'], ['sub', 'Rechteck mit Doppellinien (Unterprogramm-Aufruf)'], ['if', 'Raute (Verzweigung)'], ['end', 'Oval (Start/Ende)']];
  function initLuecke(host) {
    var cfg = LUECKEN[host.getAttribute('data-paplueck')], task = host.closest('[data-a]');
    if (!cfg || !root.KursPAP) return;
    var state = cfg.gaps.map(function () { return { kind: '', text: '', status: '' }; });
    function spec() {
      return cfg.build(function (n, node) {
        var gp = state[n - 1], g = cfg.gaps[n - 1];
        node.gap = n;
        if (gp.status === 'ok') { node.cls = 'is-filled'; node.text = g.solution; node.t = g.kind; return node; }
        node.cls = 'is-gap' + (gp.status === 'bad' ? ' is-wrong' : '');
        node.text = 'Lücke ' + n; node.num = n;
        node.t = g.kind === 'if' ? 'if' : (g.kind === 'end' ? 'end' : 'op');
        return node;
      });
    }
    var lines = cfg.code.split('\n').map(function (l) { return { ind: l.match(/^ */)[0].length / 4, text: l.trim() }; });
    var codeBox = el('div'); codeBox.appendChild(drawCode(lines, { label: 'Gegebener Python-Code', copy: true }));
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
    host.appendChild(el('div', { class: 'v05-ex' }, [
      el('p', { class: 'k-small k-muted', text: cfg.note }),
      el('div', { class: 'v05-cols v05-cols--eq' }, [
        el('div', {}, [el('h4', { class: 'v05-h', text: 'Gegebener Python-Code' }), codeBox]),
        el('div', {}, [el('h4', { class: 'v05-h', text: 'Programmablaufplan mit Lücken' }), papHost])]),
      el('h4', { class: 'v05-h', text: 'Lücken ausfüllen: Symbolart und Text' }), listEl,
      el('div', { class: 'v05-bar' }, [bCheck, bShow]), msg]));
    function render() {
      papHost.innerHTML = '<div class="pap-wrap">' + root.KursPAP.svg(spec(), { label: 'Programmablaufplan mit ' + cfg.gaps.length + ' Lücken zum Ausfüllen', minw: 0.8 }) + '</div>';
    }
    function check() {
      var good = 0;
      cfg.gaps.forEach(function (g, i) {
        var s = state[i], t = normText(s.text), ok = s.kind === g.kind && g.ok.some(function (re) { return new RegExp(re).test(t); });
        s.status = ok ? 'ok' : 'bad';
        if (ok) good += 1;
        var ge = gapEls[i];
        ge.box.className = 'v05-gap ' + (ok ? 'is-ok' : 'is-bad');
        ge.hint.textContent = ok ? 'Richtig.' : (!s.kind ? 'Wähle zuerst die Symbolart.' : (s.kind !== g.kind ? 'Die Symbolart passt nicht: Eingabe und Ausgabe sind Parallelogramme, Rechnungen Rechtecke, Aufrufe eigener Funktionen Rechtecke mit Doppellinien, Fragen Rauten, Start und Ende Ovale.' : g.hint));
        if (ok) { ge.sel.disabled = true; ge.inp.disabled = true; }
      });
      render();
      var all = good === cfg.gaps.length;
      msg.className = 'v05-msg ' + (all ? 'is-ok' : 'is-bad');
      msg.textContent = all ? 'Alle Lücken stimmen. So sieht der fertige Plan aus.' : good + ' von ' + cfg.gaps.length + ' Lücken stimmen. Lies die Hinweise bei den roten Feldern.';
      if (all && task) markSolved(task);
    }
    function solve() {
      cfg.gaps.forEach(function (g, i) {
        state[i] = { kind: g.kind, text: g.solution, status: 'ok' };
        gapEls[i].sel.value = g.kind; gapEls[i].inp.value = g.solution; gapEls[i].box.className = 'v05-gap is-ok'; gapEls[i].hint.textContent = 'Lösung.';
        gapEls[i].sel.disabled = true; gapEls[i].inp.disabled = true;
      });
      render(); msg.className = 'v05-msg'; msg.textContent = 'Die Lösung steht im Plan. Vergleiche sie mit dem Code und versuche es danach mit der nächsten Aufgabe allein.';
    }
    bCheck.addEventListener('click', check); bShow.addEventListener('click', solve);
    render();
  }

  function init() {
    var map = { zerlegung: initZerlegung, baum: initBaum, blackbox: initBlackbox, stapel: initStapel, pap: initPap, papzeichnen: initPapZeichnen };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-paplueck]'), initLuecke);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
