/* =============================================================
   explorables-v05.js – interaktive Bausteine für V05 (reines JS, kein Framework)
   (A) Struktogramm-Baukasten: Blöcke zusammenstecken, daneben entsteht der Python-Code;
       umgekehrt wird getippter Code zum Struktogramm. Farbe und Nummer verbinden Block und Codezeile.
   (B) Ablauf-Animation: ein Werkstoff-Struktogramm mit Eingabewerten Schritt für Schritt durchlaufen.
   Der Rechenkern (Baum, Code, Parser, Ablaufschritte) ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern: Baum ──────────────────────────────────────────── */
  var uid = 0;
  function nid() { uid += 1; return 'b' + uid; }
  function stmt(text) { return { id: nid(), t: 'stmt', text: text }; }
  function iff(cond, yes, no) { return { id: nid(), t: 'if', cond: cond, yes: yes || [], no: no || [] }; }

  /* Baum -> Python-Zeilen {ind, text, id, role} */
  function ifLines(n, level, out, kw) {
    out.push({ ind: level, text: kw + ' ' + (String(n.cond).trim() || 'True') + ':', id: n.id, role: kw });
    if (n.yes.length) toLines(n.yes, level + 1, out); else out.push({ ind: level + 1, text: 'pass', id: n.id, role: 'pass' });
    if (n.no.length === 1 && n.no[0].t === 'if') ifLines(n.no[0], level, out, 'elif');
    else if (n.no.length) { out.push({ ind: level, text: 'else:', id: n.id, role: 'else' }); toLines(n.no, level + 1, out); }
  }
  function toLines(nodes, level, out) {
    out = out || [];
    nodes.forEach(function (n) {
      if (n.t === 'stmt') out.push({ ind: level, text: String(n.text).trim() || 'pass', id: n.id, role: 'stmt' });
      else if (n.t === 'if') ifLines(n, level, out, 'if');
    });
    return out;
  }
  function toText(nodes) {
    return toLines(nodes, 0, []).map(function (l) { return new Array(l.ind * 4 + 1).join(' ') + l.text; }).join('\n');
  }
  /* Nummern in Baumreihenfolge: if, dann Ja-Zweig, dann Nein-Zweig */
  function numberTree(nodes, counter) {
    counter = counter || { n: 0 };
    nodes.forEach(function (n) {
      counter.n += 1; n.num = counter.n;
      if (n.t === 'if') { numberTree(n.yes, counter); numberTree(n.no, counter); }
      else if (n.t === 'case') n.cases.forEach(function (c) { numberTree(c.body, counter); });
    });
    return counter.n;
  }
  function findInfo(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.id === id) return { arr: nodes, i: i, node: n };
      if (n.t === 'if') { var r = findInfo(n.yes, id) || findInfo(n.no, id); if (r) return r; }
    }
    return null;
  }
  /* Breite der Zweige nach Inhalt: tiefere Zweige bekommen mehr Platz (höchstens 1 : 3) */
  function leafCount(nodes) {
    if (!nodes.length) return 1;
    var c = 0;
    nodes.forEach(function (n) { c += n.t === 'if' ? leafCount(n.yes) + leafCount(n.no) : 1; });
    return c;
  }
  function autoCols(n) {
    var a = leafCount(n.yes), b = leafCount(n.no), lo = Math.min(a, b), hi = Math.max(a, b);
    var r = Math.min(3, Math.max(1, Math.round(hi / lo)));
    return a <= b ? [1, r] : [r, 1];
  }
  function countBlocks(nodes) {
    var c = 0;
    nodes.forEach(function (n) { c += 1; if (n.t === 'if') c += countBlocks(n.yes) + countBlocks(n.no); });
    return c;
  }

  /* ── Kern: Python -> Baum (nur Anweisungen, if, elif, else) ── */
  function parseCode(src) {
    var raw = String(src).replace(/\t/g, '    ').split('\n');
    var lines = [];
    raw.forEach(function (l, k) {
      if (!l.trim() || /^\s*#/.test(l)) return;
      var tx = l.trim();
      if (!/["']/.test(tx)) tx = tx.replace(/\s+#.*$/, '');
      lines.push({ no: k + 1, ind: l.match(/^ */)[0].length, text: tx });
    });
    var pos = 0;
    function fail(l, msg) { var e = new Error('Zeile ' + l.no + ': ' + msg); e.line = l.no; throw e; }
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
          out.push(stmt(l.text)); pos += 1;
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
      if (!m) {
        if (!/:$/.test(l.text)) fail(l, 'Nach der Bedingung fehlt der Doppelpunkt.');
        fail(l, 'Hinter ' + kw + ' fehlt die Bedingung.');
      }
      if (!m[1]) fail(l, 'Hinter ' + kw + ' fehlt die Bedingung.');
      pos += 1;
      var n = { id: nid(), t: 'if', cond: m[1], yes: [], no: [] };
      n.yes = parseBody(ind, l);
      var nx = lines[pos];
      if (nx && nx.ind === ind && /^elif\b/.test(nx.text)) { n.no = [parseIf(nx, ind, 'elif')]; }
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

  /* ── Kern: Werkstoff-Struktogramm (Ablauf-Animation) ──────── */
  var W_CODE = [
    'spannung = float(input("Maximale Spannung in MPa: "))',
    'temperatur = float(input("Betriebstemperatur in °C: "))',
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
  function wTree() {
    return [
      { id: 'n1', t: 'stmt', text: 'spannung einlesen (MPa)' },
      { id: 'n2', t: 'stmt', text: 'temperatur einlesen (°C)' },
      { id: 'n3', t: 'if', cond: 'spannung ≤ 0 oder temperatur < −50 oder temperatur > 600', cols: [1, 3],
        yes: [{ id: 'n4', t: 'stmt', text: 'Ausgabe: Eingabe unplausibel – bitte Werte prüfen' }],
        no: [
          { id: 'n5', t: 'if', cond: 'temperatur > 300', cols: [1, 1],
            yes: [{ id: 'n6', t: 'if', cond: 'spannung ≤ 200', cols: [1, 1],
              yes: [{ id: 'n7', t: 'stmt', text: 'werkstoff = 16Mo3 (warmfest)' }],
              no: [{ id: 'n8', t: 'stmt', text: 'werkstoff = Sonderwerkstoff, Rücksprache Konstruktion' }] }],
            no: [{ id: 'n9', t: 'case', expr: 'spannung', cases: [
              { id: 'n9a', label: '≤ 140', body: [{ id: 'n10', t: 'stmt', text: 'werkstoff = S235JR' }] },
              { id: 'n9b', label: '≤ 220', body: [{ id: 'n11', t: 'stmt', text: 'werkstoff = C45E' }] },
              { id: 'n9c', label: 'sonst', body: [{ id: 'n12', t: 'stmt', text: 'werkstoff = 42CrMo4 (vergütet)' }] }] }] },
          { id: 'n13', t: 'stmt', text: 'Ausgabe: Empfohlener Werkstoff: werkstoff' }
        ] }
    ];
  }
  function pyFloat(x) { return Number.isInteger(x) && Math.abs(x) < 1e16 ? x.toFixed(1) : String(x); }
  function fm(x) { return pyFloat(x).replace('-', '−'); }
  /* Gibt {werkstoff|null, text, steps} zurück. Steps: {ids, lines, msg, vars, out, taken} */
  function wRun(sp, te) {
    var steps = [], taken = {}, vars = {}, out = [];
    function push(ids, lines, msg, newVars, o) {
      if (newVars) Object.keys(newVars).forEach(function (k) { vars[k] = newVars[k]; });
      if (o) out.push(o);
      var t = {}; Object.keys(taken).forEach(function (k) { t[k] = taken[k]; });
      var v = {}; Object.keys(vars).forEach(function (k) { v[k] = vars[k]; });
      steps.push({ ids: ids, lines: lines, msg: msg, vars: v, out: out.slice(), taken: t, changed: newVars ? Object.keys(newVars) : [] });
    }
    push(['n1'], [1], 'Die Eingabe für die Spannung wird gelesen und mit float() in eine Zahl verwandelt: spannung = ' + fm(sp) + '.', { spannung: fm(sp) });
    push(['n2'], [2], 'Die Eingabe für die Temperatur wird gelesen: temperatur = ' + fm(te) + '.', { temperatur: fm(te) });
    var a = sp <= 0, b = te < -50, c = te > 600, bad = a || b || c;
    taken.n3 = bad ? 'ja' : 'nein';
    push(['n3'], [3],
      'Bedingung: ' + fm(sp) + ' ≤ 0 ist ' + (a ? 'wahr' : 'falsch') + ', ' + fm(te) + ' < −50 ist ' + (b ? 'wahr' : 'falsch') + ', ' + fm(te) + ' > 600 ist ' + (c ? 'wahr' : 'falsch') +
      '. Mit „oder“ verknüpft: ' + (bad ? 'wahr, also Ja-Zweig.' : 'falsch, also Nein-Zweig.'));
    if (bad) {
      push(['n4'], [4], 'Ja-Zweig: Python gibt die Warnung aus. Der Nein-Zweig wird übersprungen, das Programm ist zu Ende.', null, 'Eingabe unplausibel - bitte Werte prüfen');
      return { werkstoff: null, text: 'Eingabe unplausibel - bitte Werte prüfen', steps: steps };
    }
    var heiss = te > 300;
    taken.n5 = heiss ? 'ja' : 'nein';
    push(['n5'], [6], 'Bedingung: ' + fm(te) + ' > 300 ist ' + (heiss ? 'wahr, also Ja-Zweig (warmer Bereich).' : 'falsch, also Nein-Zweig (bis 300 °C).'));
    var w;
    if (heiss) {
      var okS = sp <= 200;
      taken.n6 = okS ? 'ja' : 'nein';
      push(['n6'], [7], 'Bedingung: ' + fm(sp) + ' ≤ 200 ist ' + (okS ? 'wahr, also Ja-Zweig.' : 'falsch, also Nein-Zweig.'));
      w = okS ? '16Mo3 (warmfest)' : 'Sonderwerkstoff - Rücksprache Konstruktion';
      push([okS ? 'n7' : 'n8'], [okS ? 8 : 10], 'Der Werkstoff wird festgelegt: werkstoff = ' + w + '.', { werkstoff: w });
    } else {
      var k = sp <= 140 ? 0 : (sp <= 220 ? 1 : 2);
      taken.n9 = k;
      var why = k === 0 ? fm(sp) + ' ≤ 140 ist wahr: erster Fall.' : (k === 1 ? fm(sp) + ' ≤ 140 ist falsch, ' + fm(sp) + ' ≤ 220 ist wahr: zweiter Fall.' : fm(sp) + ' ≤ 140 und ' + fm(sp) + ' ≤ 220 sind beide falsch: der Rest („sonst“).');
      push(['n9'], [[12], [12, 14], [12, 14, 16]][k], 'Mehrfachverzweigung auf spannung (in Python if, elif, else): ' + why);
      w = ['S235JR', 'C45E', '42CrMo4 (vergütet)'][k];
      push([['n10', 'n11', 'n12'][k]], [[13, 15, 17][k]], 'Der Werkstoff wird festgelegt: werkstoff = ' + w + '.', { werkstoff: w });
    }
    push(['n13'], [18], 'Nach der Verzweigung geht es für alle Wege im Nein-Zweig der Plausibilitätsprüfung weiter: Ausgabe des Ergebnisses.', null, 'Empfohlener Werkstoff: ' + w);
    return { werkstoff: w, text: 'Empfohlener Werkstoff: ' + w, steps: steps };
  }

  var api = { toLines: toLines, toText: toText, parseCode: parseCode, wRun: wRun, wTree: wTree, W_CODE: W_CODE, numberTree: numberTree, stmt: stmt, iff: iff, pyFloat: pyFloat };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ──────────────────────────────────────────── */
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
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hl(text) {
    var re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(if|elif|else|and|or|not|True|False|pass)\b|\b(print|input|float|int|str|abs|round)\b|(\b\d+(?:\.\d+)?\b)/g;
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
  function colorOf(n) { return 'c' + ((n - 1) % 6); }
  function splitStyle(cols) {
    if (!cols) return '';
    var s = cols[0] + cols[1];
    return '--cols:' + cols[0] + 'fr ' + cols[1] + 'fr;--split:' + (100 * cols[0] / s).toFixed(2) + '%';
  }

  /* ── Struktogramm zeichnen (gleiches Markup wie die statischen Bilder der Lektion) ── */
  function drawSeq(nodes, o, ctxArr) {
    var seq = el('div', { class: 'sg-seq' + (nodes.length || o.edit ? '' : ' sg-seq--empty') });
    if (!nodes.length && !o.edit) seq.appendChild(el('span', { class: 'k-sr', text: '(leer)' }));
    if (o.edit) seq.appendChild(drawSlot(nodes, 0, o));
    nodes.forEach(function (n, i) {
      seq.appendChild(drawNode(n, o, nodes, i));
      if (o.edit) seq.appendChild(drawSlot(nodes, i + 1, o));
    });
    return seq;
  }
  function tools(o, arr, i, n) {
    var wrap = el('span', { class: 'sg-tools' });
    var up = el('button', { type: 'button', class: 'sg-tb', 'aria-label': 'Block ' + n.num + ' nach oben', title: 'Nach oben' }, [icon('chevron-up')]);
    var dn = el('button', { type: 'button', class: 'sg-tb', 'aria-label': 'Block ' + n.num + ' nach unten', title: 'Nach unten' }, [icon('chevron-down')]);
    var rm = el('button', { type: 'button', class: 'sg-tb', 'aria-label': 'Block ' + n.num + ' löschen', title: 'Löschen' }, [icon('x')]);
    if (i === 0) up.disabled = true;
    if (i === arr.length - 1) dn.disabled = true;
    up.addEventListener('click', function () { o.ops.move(arr, i, -1); });
    dn.addEventListener('click', function () { o.ops.move(arr, i, 1); });
    rm.addEventListener('click', function () { o.ops.del(arr, i); });
    [up, dn, rm].forEach(function (b) { wrap.appendChild(b); });
    return wrap;
  }
  function drawSlot(arr, idx, o) {
    var slot = el('div', { class: 'sg-slot' });
    var add = el('button', { type: 'button', class: 'sg-add', text: '+ Block einfügen', 'aria-label': 'Block einfügen an Position ' + (idx + 1) });
    slot.appendChild(add);
    add.addEventListener('click', function () {
      slot.innerHTML = '';
      var a = el('button', { type: 'button', class: 'sg-pick', text: 'Anweisung' });
      var v = el('button', { type: 'button', class: 'sg-pick', text: 'Verzweigung' });
      var x = el('button', { type: 'button', class: 'sg-pick sg-pick--x', text: 'Abbrechen' });
      [a, v, x].forEach(function (b) { slot.appendChild(b); });
      a.addEventListener('click', function () { o.ops.add(arr, idx, 'stmt'); });
      v.addEventListener('click', function () { o.ops.add(arr, idx, 'if'); });
      x.addEventListener('click', function () { slot.innerHTML = ''; slot.appendChild(add); add.focus(); });
      a.focus();
    });
    return slot;
  }
  function drawNode(n, o, arr, i) {
    var cc = o.edit || o.mapColors ? ' ' + colorOf(n.num || 1) : '';
    var chip = function () { return o.num && n.num ? el('span', { class: 'sg-num', text: String(n.num) }) : null; };
    if (n.t === 'stmt') {
      var d = el('div', { class: 'sg-stmt' + cc, 'data-bid': n.id });
      var ch1 = chip(); if (ch1) d.appendChild(ch1);
      if (o.edit) {
        var inp = el('input', { type: 'text', class: 'sg-in', value: n.text, 'aria-label': 'Anweisung, Block ' + n.num, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
        inp.addEventListener('input', function () { n.text = inp.value; o.ops.text(); });
        d.appendChild(inp); d.appendChild(tools(o, arr, i, n));
      } else d.appendChild(el('span', { class: 'sg-t', text: n.text }));
      return d;
    }
    if (n.t === 'if') {
      var wrap = el('div', { class: 'sg-if', 'data-nid': n.id });
      var cc3 = n.cols || autoCols(n);
      var head = el('div', { class: 'sg-head' + cc, 'data-bid': n.id });
      head.setAttribute('style', splitStyle(cc3));
      var ch2 = chip(); if (ch2) head.appendChild(ch2);
      if (o.edit) {
        var ci = el('input', { type: 'text', class: 'sg-in', value: n.cond, 'aria-label': 'Bedingung, Block ' + n.num, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
        ci.addEventListener('input', function () { n.cond = ci.value; o.ops.text(); });
        var cw = el('span', { class: 'sg-t', style: 'display:block' }, [ci]);
        head.appendChild(cw); head.appendChild(tools(o, arr, i, n));
      } else head.appendChild(el('span', { class: 'sg-t', text: n.cond + '?' }));
      head.appendChild(el('span', { class: 'sg-j', text: 'Ja' }));
      head.appendChild(el('span', { class: 'sg-n', text: 'Nein' }));
      wrap.appendChild(head);
      var br = el('div', { class: 'sg-branches', style: '--cols:' + cc3[0] + 'fr ' + cc3[1] + 'fr' });
      br.appendChild(drawSeq(n.yes, o)); br.appendChild(drawSeq(n.no, o));
      wrap.appendChild(br);
      return wrap;
    }
    /* Mehrfachverzweigung */
    var cw2 = el('div', { class: 'sg-case', 'data-nid': n.id });
    var h2 = el('div', { class: 'sg-head sg-head--case', 'data-bid': n.id }, [el('span', { class: 'sg-t', text: n.expr })]);
    h2.style.setProperty('--split', '50%');
    cw2.appendChild(h2);
    var cols = el('div', { class: 'sg-cols', style: '--n:' + n.cases.length });
    n.cases.forEach(function (c) {
      var col = el('div', { class: 'sg-col', 'data-cid': c.id }, [el('span', { class: 'sg-lab', text: c.label }), drawSeq(c.body, o)]);
      cols.appendChild(col);
    });
    cw2.appendChild(cols);
    return cw2;
  }
  function drawStruktogramm(nodes, o) {
    var sg = el('div', { class: 'sg' + (o.wide ? ' sg--wide' : '') + (o.edit ? ' sg--edit' : ''), role: 'group', 'aria-label': o.label || 'Struktogramm' });
    sg.appendChild(drawSeq(nodes, o));
    return el('div', { class: 'sg-wrap' }, [sg]);
  }

  /* ── Code-Anzeige mit Zeilennummern und Zuordnung ─────────── */
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

  /* ── (A) Struktogramm-Baukasten ──────────────────────────── */
  var PRESETS = {
    'Sequenz': function () { return [stmt('x = float(input("x: "))'), stmt('y = 2 * x + 1'), stmt('print("y =", y)')]; },
    'Einfache Verzweigung': function () { return [stmt('x = float(input("x: "))'), iff('x < 0', [stmt('print("x ist negativ")')], []), stmt('print("fertig")')]; },
    'Zweiseitige Verzweigung': function () { return [stmt('x = float(input("x: "))'), iff('x < 0', [stmt('betrag = -x')], [stmt('betrag = x')]), stmt('print("Betrag:", betrag)')]; },
    'Verschachtelt': function () { return [stmt('t = float(input("Temperatur in °C: "))'), iff('t > 100', [iff('t > 300', [stmt('print("Sonderwerkstoff")')], [stmt('print("warmfest")')])], [stmt('print("Standardwerkstoff")')])]; },
    'Mehrfach (elif)': function () { return [stmt('s = float(input("Sicherheitsfaktor: "))'), iff('s >= 1.5', [stmt('print("sicher")')], [iff('s >= 1.0', [stmt('print("knapp")')], [stmt('print("Versagen")')])])]; }
  };

  function initBaukasten(host) {
    var tree = PRESETS['Zweiseitige Verzweigung']();
    var mode = 0;                 // 0 = Struktogramm -> Code, 1 = Code -> Struktogramm
    var focusId = null, pinned = null, codeErr = null;
    var segHost = el('div', { class: 'v05-bar' });
    var presetBar = el('div', { class: 'v05-chips' });
    presetBar.appendChild(el('span', { class: 'v05-label', text: 'Beispiel laden:' }));
    Object.keys(PRESETS).forEach(function (k) {
      var c = el('button', { type: 'button', class: 'k-chip', text: k });
      c.addEventListener('click', function () { tree = PRESETS[k](); codeErr = null; pinned = null; full(); announce('Beispiel „' + k + '“ geladen.'); });
      presetBar.appendChild(c);
    });
    var clr = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Alles leeren' });
    clr.addEventListener('click', function () { tree = []; codeErr = null; full(); announce('Der Baukasten ist leer.'); });
    presetBar.appendChild(clr);

    var seg = segment(['Struktogramm baut Code', 'Code baut Struktogramm'], 'Richtung', 0, function (i) {
      mode = i; codeErr = null; if (mode === 1) ta.value = toText(tree); full();
    });
    segHost.appendChild(seg);

    var left = el('div'), right = el('div');
    var leftH = el('h4', { class: 'v05-h', text: 'Struktogramm' });
    var sgHost = el('div');
    var hint = el('p', { class: 'k-small k-muted' });
    left.appendChild(leftH); left.appendChild(sgHost); left.appendChild(hint);

    var rightH = el('h4', { class: 'v05-h', text: 'Python-Code' });
    var ta = el('textarea', { class: 'v05-ta', spellcheck: 'false', 'aria-label': 'Python-Code eintippen, daraus entsteht das Struktogramm', rows: '10', hidden: '' });
    var codeHost = el('div');
    var copyHost = el('div');
    var runHost = el('div', { class: 'v05-run' });
    var tryBtn = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Code im Editor ausprobieren' });
    var acts = el('div', { class: 'v05-ctrl', style: 'margin-top:12px' }, [tryBtn]);
    right.appendChild(rightH); right.appendChild(ta); right.appendChild(codeHost); right.appendChild(acts); right.appendChild(runHost);
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite' });
    var live = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var cols = el('div', { class: 'v05-cols v05-cols--sg' }, [left, right]);
    host.appendChild(el('div', { class: 'v05-ex' }, [segHost, presetBar, cols, msg, live]));

    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 20); }
    function setHot(id) {
      Array.prototype.forEach.call(host.querySelectorAll('.is-hot'), function (n) { n.classList.remove('is-hot'); });
      if (id) Array.prototype.forEach.call(host.querySelectorAll('[data-bid="' + id + '"]'), function (n) { n.classList.add('is-hot'); });
    }
    var ops = {
      text: function () { renderCode(); },
      add: function (arr, idx, type) {
        var n = type === 'if' ? iff('x > 0', [stmt('print("ja")')], []) : stmt('print("Text")');
        arr.splice(idx, 0, n); focusId = n.id; codeErr = null; full();
        announce((type === 'if' ? 'Verzweigung' : 'Anweisung') + ' eingefügt.');
      },
      del: function (arr, i) { arr.splice(i, 1); focusId = null; full(); announce('Block gelöscht.'); },
      move: function (arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; focusId = t.id; full(); announce('Block verschoben.'); }
    };
    function renderSg() {
      numberTree(tree);
      sgHost.innerHTML = '';
      var edit = mode === 0;
      sgHost.appendChild(drawStruktogramm(tree, { edit: edit, num: true, mapColors: true, ops: ops, label: 'Struktogramm aus ' + countBlocks(tree) + ' Blöcken' }));
      if (!tree.length && !edit) sgHost.appendChild(el('p', { class: 'k-small k-muted', text: 'Noch kein gültiger Code: Das Struktogramm erscheint, sobald der Code stimmt.' }));
      hint.textContent = edit
        ? 'Klick auf „+ Block einfügen“, tippe in die Felder, verschiebe oder lösche Blöcke. Fährst du über einen Block, leuchten seine Codezeilen auf (und umgekehrt).'
        : 'Das Struktogramm ist hier nur zum Ansehen: Es entsteht aus deinem Code. Fährst du über einen Block oder eine Zeile, siehst du die Zuordnung.';
    }
    function renderCode() {
      numberTree(tree);
      var lines = toLines(tree, 0, []);
      var byId = {};
      (function walk(a) { a.forEach(function (n) { byId[n.id] = n.num; if (n.t === 'if') { walk(n.yes); walk(n.no); } }); })(tree);
      codeHost.innerHTML = '';
      var cw = drawCode(lines.length ? lines : [{ ind: 0, text: '# leer: füge links einen Block ein', id: null }], function (l) { return l.id ? byId[l.id] : ''; }, { colorOf: colorOf, click: true, label: 'Erzeugter Python-Code' });
      var parts = copyButton(function () { return toText(tree); });
      cw.appendChild(parts[0]); cw.appendChild(parts[1]);
      codeHost.appendChild(cw);
      if (pinned) setHot(pinned);
    }
    function full() {
      leftH.textContent = mode === 0 ? 'Struktogramm (hier baust du)' : 'Struktogramm (entsteht aus dem Code)';
      rightH.textContent = mode === 0 ? 'Python-Code (entsteht live)' : 'Python-Code (hier tippst du)';
      ta.hidden = mode === 0;
      renderSg(); renderCode();
      msg.className = 'v05-msg' + (codeErr ? ' is-bad' : '');
      msg.textContent = codeErr ? codeErr : (mode === 0
        ? 'Ein if direkt im Nein-Zweig schreibt Python als elif. Die Einrückung (4 Leerzeichen) zeigt, welche Zeilen zu welchem Zweig gehören.'
        : 'Tippe oder ändere den Code. Erlaubt sind Anweisungen, if, elif und else (Einrückung: 4 Leerzeichen).');
      if (focusId) {
        var f = sgHost.querySelector('[data-bid="' + focusId + '"] input');
        if (f) f.focus();
        focusId = null;
      }
    }
    ta.addEventListener('input', function () {
      try {
        var r = parseCode(ta.value);
        tree = r.nodes; codeErr = null;
        msg.className = 'v05-msg is-ok'; msg.textContent = r.nodes.length ? 'Gelesen: ' + countBlocks(tree) + ' Blöcke. Das Struktogramm zeigt, wie dein Code verzweigt.' : 'Noch kein Code.';
      } catch (e) {
        codeErr = e.message; msg.className = 'v05-msg is-bad'; msg.textContent = e.message + ' Das Struktogramm zeigt den letzten gültigen Stand.';
      }
      renderSg(); renderCode();
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
      var inp = mode === 0 ? sgHost.querySelector('[data-bid="' + id + '"] input') : null;
      if (inp) inp.focus();
    });
    tryBtn.addEventListener('click', function () {
      var pre = el('pre'); pre.setAttribute('data-stdin', '5'); pre.appendChild(el('code', { text: toText(tree) || '# leer' }));
      runHost.innerHTML = ''; runHost.appendChild(pre);
      if (window.KursRunner && window.KursRunner.enhance) window.KursRunner.enhance(pre);
    });
    ta.value = toText(tree);
    full();
  }

  /* ── (B) Ablauf-Animation ────────────────────────────────── */
  function initAblauf(host) {
    var tree = wTree();
    var NUM = /^[-+]?(\d+(\.\d*)?|\.\d+)$/;
    var presets = [['180 / 20', '180', '20'], ['150 / 400', '150', '400'], ['250 / 400', '250', '400'], ['100 / 100', '100', '100'], ['250 / 20', '250', '20'], ['−5 / 20', '-5', '20'], ['140 / 20', '140', '20']];
    var run = null, idx = -1, timer = null;
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
    var sgHost = el('div');
    var codeHost = el('div');
    var state = el('dl', { class: 'v05-state' });
    var outBox = el('pre', { class: 'v05-out', 'aria-label': 'Ausgabe des Programms' });
    var msg = el('p', { class: 'v05-msg', role: 'status', 'aria-live': 'polite', id: 'ab-hint' });
    var stateWrap = el('div', {}, [el('h4', { class: 'v05-h', text: 'Variablen' }), state, el('h4', { class: 'v05-h', style: 'margin-top:16px', text: 'Ausgabe' }), outBox]);
    var lower = el('div', { class: 'v05-cols v05-cols--eq' }, [el('div', {}, [el('h4', { class: 'v05-h', text: 'Python-Code' }), codeHost]), stateWrap]);
    host.appendChild(el('div', { class: 'v05-ex' }, [inputs, chips, ctrl, msg, sgHost, lower]));

    function parse() {
      var a = inS.value.trim(), b = inT.value.trim();
      if (!NUM.test(a) || !NUM.test(b)) {
        var comma = /,/.test(a + b);
        return { err: comma ? 'Python erwartet den Dezimalpunkt: schreibe 2.5 statt 2,5.' : 'Bitte zwei Zahlen eingeben. Ohne Prüfung bricht das echte Programm bei Text wie „abc“ mit einem ValueError ab. Das Abfangen lernst du in V09.' };
      }
      return { sp: parseFloat(a), te: parseFloat(b) };
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; }
    function start() {
      stop();
      var p = parse();
      if (p.err) { run = null; idx = -1; msg.className = 'v05-msg is-bad'; msg.textContent = p.err; [bBack, bNext, bPlay].forEach(function (b) { b.disabled = true; }); draw(); return; }
      run = wRun(p.sp, p.te); idx = -1;
      msg.className = 'v05-msg'; msg.textContent = 'Eingaben: Spannung ' + fm(p.sp) + ' MPa, Temperatur ' + fm(p.te) + ' °C. Drück „Nächster Schritt“ oder „Abspielen“.';
      draw();
    }
    function takenTo(i) { return i >= 0 && run ? run.steps[i].taken : {}; }
    function draw() {
      var st = run && idx >= 0 ? run.steps[idx] : null;
      var taken = takenTo(idx);
      numberTree(tree);
      sgHost.innerHTML = '';
      sgHost.appendChild(drawStruktogramm(tree, { num: false, wide: true, label: 'Werkstoff-Struktogramm' }));
      var activeIds = st ? st.ids : [];
      var visited = {};
      if (run) for (var k = 0; k <= idx; k++) run.steps[k].ids.forEach(function (id) { visited[id] = true; });
      Array.prototype.forEach.call(sgHost.querySelectorAll('[data-bid]'), function (n) {
        var id = n.getAttribute('data-bid');
        if (activeIds.indexOf(id) >= 0) n.classList.add('is-active'); else if (visited[id]) n.classList.add('is-done');
      });
      /* Zweige: genommen hervorheben, übrige ausgrauen (erst ab der Entscheidung) */
      Array.prototype.forEach.call(sgHost.querySelectorAll('.sg-if'), function (w) {
        var id = w.getAttribute('data-nid');
        if (!taken[id]) return;
        var kids = w.querySelector('.sg-branches').children;
        kids[taken[id] === 'ja' ? 1 : 0].classList.add('is-skipped');
        w.querySelector(taken[id] === 'ja' ? '.sg-j' : '.sg-n').classList.add('is-taken');
      });
      Array.prototype.forEach.call(sgHost.querySelectorAll('.sg-case'), function (w) {
        var id = w.getAttribute('data-nid');
        if (taken[id] === undefined) return;
        Array.prototype.forEach.call(w.querySelectorAll('.sg-cols > .sg-col'), function (c, ci) {
          if (ci !== taken[id]) c.classList.add('is-skipped'); else c.querySelector('.sg-lab').classList.add('is-taken');
        });
      });
      /* Code */
      codeHost.innerHTML = '';
      var lines = W_CODE.map(function (t) { var ind = t.match(/^ */)[0].length / 4; return { ind: ind, text: t.trim() }; });
      var cw = drawCode(lines, function (l, k) { return k + 1; }, { label: 'Python-Code des Werkstoff-Programms' });
      var parts = copyButton(function () { return W_CODE.join('\n'); });
      cw.appendChild(parts[0]); cw.appendChild(parts[1]);
      codeHost.appendChild(cw);
      if (st) st.lines.forEach(function (ln) { var r = cw.querySelector('.v05-line[data-ln="' + ln + '"]'); if (r) r.classList.add('is-active'); });
      /* Zustand */
      state.innerHTML = '';
      ['spannung', 'temperatur', 'werkstoff'].forEach(function (v) {
        var val = st && st.vars[v] !== undefined ? st.vars[v] : null;
        var shown = val === null ? '–' : (v === 'werkstoff' ? '"' + val + '"' : val);
        state.appendChild(el('dt', { text: v }));
        state.appendChild(el('dd', { class: st && st.changed.indexOf(v) >= 0 ? 'is-new' : '', text: shown }));
      });
      outBox.textContent = st && st.out.length ? st.out.join('\n') : '';
      if (st) { msg.className = 'v05-msg' + (idx === run.steps.length - 1 ? ' is-ok' : ''); msg.textContent = 'Schritt ' + (idx + 1) + ' von ' + run.steps.length + ': ' + st.msg; }
      var total = run ? run.steps.length : 0;
      count.textContent = run ? (idx + 1) + ' / ' + total : '';
      bBack.disabled = !run || idx < 0;
      bNext.disabled = !run || idx >= total - 1;
      bPlay.disabled = !run || idx >= total - 1;
      if (st) { var a = cw.querySelector('.is-active'); if (a && a.scrollIntoView) { /* Code ist kurz: kein Scrollen nötig */ } }
    }
    function next() { if (run && idx < run.steps.length - 1) { idx += 1; draw(); if (idx >= run.steps.length - 1) stop(); } }
    bNext.addEventListener('click', function () { stop(); next(); });
    bBack.addEventListener('click', function () { stop(); if (idx >= 0) { idx -= 1; if (idx < 0) { msg.className = 'v05-msg'; msg.textContent = 'Am Anfang. Drück „Nächster Schritt“.'; } draw(); } });
    bReset.addEventListener('click', function () { start(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (run && idx >= run.steps.length - 1) { idx = -1; }
      bPlay.textContent = 'Pause';
      next();
      timer = setInterval(function () { if (!run || idx >= run.steps.length - 1) { stop(); draw(); return; } next(); }, 1700);
    });
    [inS, inT].forEach(function (i) { i.addEventListener('input', function () { start(); }); });
    start();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="baukasten"]'), initBaukasten);
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="ablauf"]'), initAblauf);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
