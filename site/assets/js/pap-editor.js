/* =============================================================
   pap-editor.js – strukturierter PAP-Editor (blockbasiert, immer gültiger PAP)
   Braucht pap-engine.js (window.KursPAP). Optional: kurs.js/editor.js (Runner), aufgaben.js (Tests),
   speicher.js (KursSpeicher; ohne ihn Fallback in localStorage/Arbeitsspeicher).

   (1) window.KursPAPEditor.create(host, opts)   Editor-Baustein (PAP-Fläche + Symbol-Bedienfeld + Rückgängig)
   (2) Seite  site/pap-editor.html               [data-pap-editor-app]: Dateien, Vorlagen, Code, Export
   (3) Aufgabentyp „PAP zeichnen“                 .k-pap-aufgabe (siehe docs/PAP-EDITOR.md)
   ============================================================= */
(function (root) {
  'use strict';
  var K = root.KursPAP;
  if (!K || typeof document === 'undefined') return;
  var doc = document;

  /* ── DOM-Hilfen ──────────────────────────────────────────── */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c); });
    return n;
  }
  function icon(id) { return root.KIcon ? root.KIcon(id) : doc.createTextNode(''); }
  var esc = K.esc, uidN = 0;
  function uid(p) { uidN += 1; return (p || 'ped') + '-' + uidN; }
  function f1(v) { return (Math.round(v * 10) / 10).toString(); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function lessonKey() { return doc.body.getAttribute('data-lesson') || 'V03'; }

  /* ── Symbolarten ─────────────────────────────────────────── */
  var KIND = {
    in:     { name: 'Eingabe', form: 'Parallelogramm', label: 'Variable', ph: 'z. B. spannung', def: 'x' },
    out:    { name: 'Ausgabe', form: 'Parallelogramm', label: 'Ausgabe (Argumente von print)', ph: 'z. B. "ok" oder "Wert:", x', def: '"Hallo"' },
    op:     { name: 'Operation', form: 'Rechteck', label: 'Anweisung', ph: 'z. B. y = 2 * x', def: 'y = 0' },
    if:     { name: 'Verzweigung', form: 'Raute mit ja/nein', label: 'Bedingung', ph: 'z. B. x < 0', def: 'x > 0' },
    while:  { name: 'Schleife, kopfgesteuert', form: 'Raute vor dem Rumpf', label: 'Schleife läuft, solange gilt', ph: 'z. B. x < 10', def: 'x < 10' },
    repeat: { name: 'Schleife, fußgesteuert', form: 'Raute nach dem Rumpf', label: 'Schleife wiederholt, solange gilt', ph: 'z. B. x < 10', def: 'x < 10' },
    for:    { name: 'Zählschleife', form: 'Raute vor dem Rumpf', label: 'Zählschleife (Python: for …)', ph: 'z. B. i in range(1, 6)', def: 'i in range(1, 6)' },
    call:   { name: 'Unterprogramm', form: 'Rechteck mit Doppellinien', label: 'Aufruf', ph: 'z. B. abs(-3)', def: 'abs(-3)' },
    def:    { name: 'Funktion', form: 'Start mit Namen, Ende mit Rückgabe', label: 'Funktionskopf', ph: 'z. B. umrechnen(x)', def: 'umrechnen(x)' }
  };
  var ORDER = ['in', 'out', 'op', 'if', 'while', 'repeat', 'for', 'call', 'def'];
  var SIMPLE = ['in', 'out', 'op', 'call'];
  function makeNode(k) {
    var d = KIND[k].def;
    if (k === 'in') return K.nIn(d);
    if (k === 'out') return K.nOut(d);
    if (k === 'op') return K.nOp(d);
    if (k === 'call') return K.nCall(d);
    if (k === 'def') return K.nDef(d, [], '');
    if (k === 'if') return K.nIf(d, [], []);
    if (k === 'while') return K.nWhile(d, []);
    if (k === 'repeat') return K.nRepeat(d, []);
    return K.nFor(d, []);
  }
  function slotArr(parent, slot) { return slot === 'yes' ? parent.yes : (slot === 'no' ? parent.no : parent.body); }

  /* ══════════════════════════════════════════════════════════
     (1) Editor-Baustein
     ══════════════════════════════════════════════════════════ */
  function create(host, opts) {
    opts = opts || {};
    var allowed = (opts.allowed && opts.allowed.length ? opts.allowed : ORDER).filter(function (k) { return KIND[k]; });
    var tree = opts.json ? K.fromJson(opts.json) : [];
    var sel = null, marksList = [], zoom = 1, lastKey = null, listeners = [];
    var hist = [JSON.stringify(tree)], pos = 0, menu = null, menuOpener = null;
    var id = uid('ped');

    /* Bedienelemente */
    var bUndo = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Rückgängig' });
    var bRedo = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Wiederholen' });
    var bZout = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small ped-zoom', 'aria-label': 'Plan verkleinern', text: '−' });
    var bZin = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small ped-zoom', 'aria-label': 'Plan vergrößern', text: '+' });
    var zLab = el('span', { class: 'ped-zoomlab', 'aria-hidden': 'true', text: '100 %' });
    var bar = el('div', { class: 'ped-bar', role: 'toolbar', 'aria-label': 'Rückgängig, Wiederholen, Zoom' }, [bUndo, bRedo, el('span', { class: 'ped-bar__sp' }), bZout, zLab, bZin]);
    var wrap = el('div', { class: 'ped-pap', role: 'region', 'aria-label': 'Programmablaufplan bearbeiten', 'aria-describedby': id + '-desc' });
    var desc = el('p', { class: 'k-sr', id: id + '-desc' });
    var panel = el('div', { class: 'ped-panel' });
    var live = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var rootEl = el('div', { class: 'ped' }, [bar, wrap, desc, panel, live]);
    host.appendChild(rootEl);

    function snap() { return JSON.stringify(tree); }
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 20); }
    function fire(src) { updateButtons(); listeners.forEach(function (fn) { fn(tree, src || 'user'); }); }
    function updateButtons() {
      bUndo.disabled = pos <= 0; bRedo.disabled = pos >= hist.length - 1;
      zLab.textContent = Math.round(zoom * 100) + ' %';
      bZout.disabled = zoom <= 0.55; bZin.disabled = zoom >= 1.6;
    }
    /* Änderung festhalten. key: gleiche Schlüssel hintereinander (Tippen in einem Feld) werden ein Schritt */
    function change(key) {
      var s = snap();
      if (key && key === lastKey && pos >= 0) hist[pos] = s;
      else { hist.length = pos + 1; hist.push(s); pos += 1; if (hist.length > 200) { hist.shift(); pos -= 1; } }
      lastKey = key || null;
      fire('user');
    }
    function loadSnap(s) { tree = JSON.parse(s); if (sel && !K.find(tree, sel)) sel = null; lastKey = null; renderAll(); fire('user'); }
    function undo() { closeMenu(); if (pos <= 0) return; pos -= 1; loadSnap(hist[pos]); announce('Rückgängig gemacht.'); }
    function redo() { closeMenu(); if (pos >= hist.length - 1) return; pos += 1; loadSnap(hist[pos]); announce('Wiederholt.'); }

    function walk(arr, fn) { arr.forEach(function (n) { fn(n); K.kids(n).forEach(function (kd) { walk(kd.arr, fn); }); }); }
    function isEmpty(n) { return !String(n.v).trim(); }
    function prep() {
      K.numberTree(tree);
      walk(tree, function (n) { n.cls = (sel === n.id ? 'is-sel' : '') + (isEmpty(n) ? ' is-gap' : ''); });
    }
    function nodeLabel(n) { return 'Symbol ' + n.num + ': ' + KIND[n.k].name + (isEmpty(n) ? ', noch leer' : ', ' + n.v); }

    function targetLabel(t) {
      var parent = t.parent ? K.find(tree, t.parent) : null, arr = parent ? slotArr(parent.node, t.slot) : tree;
      if (!parent) {
        /* oberste Ebene: Symbole des Hauptplans zuerst, Funktionen als eigene Pläne */
        var cur = arr[t.idx], prv = arr[t.idx - 1];
        if (cur && !K.isDef(cur)) return 'vor Symbol ' + cur.num;
        if (prv && !K.isDef(prv)) return 'nach Symbol ' + prv.num;
        if (cur) return 'vor Funktion ' + cur.num;
        if (prv) return 'nach Funktion ' + prv.num;
        return 'zwischen Start und Ende';
      }
      if (!arr.length) {
        if (parent.node.k === 'def') return 'in die Funktion ' + parent.node.num;
        return t.slot === 'yes' ? 'in den Zweig „ja“ von Symbol ' + parent.node.num : (t.slot === 'no' ? 'in den Zweig „nein“ von Symbol ' + parent.node.num : 'in die Schleife von Symbol ' + parent.node.num);
      }
      if (t.idx < arr.length) return 'vor Symbol ' + arr[t.idx].num;
      return 'nach Symbol ' + arr[t.idx - 1].num;
    }

    /* ── PAP zeichnen ── */
    function nodeEl(nid) { return wrap.querySelector('.pap-n[data-id="' + nid + '"]'); }
    function svgEls() { return $$('svg.pap', wrap); }
    function renderPap(focusNode) {
      var hadFocus = wrap.contains(doc.activeElement);
      prep();
      var plans = K.marksAll(tree), html = '', mi = 0, nMain = K.countBlocks(tree.filter(function (n) { return !K.isDef(n); }));
      marksList = [];
      plans.forEach(function (m) {
        var mk = '', head = m.def ? String(m.def.v).trim() || 'ohne Namen' : '';
        m.marks.forEach(function (mm) {
          marksList.push(mm);
          mk += '<g class="ped-mark" data-m="' + mi + '" transform="translate(' + f1(mm.x) + ' ' + f1(mm.y) + ')" role="button" tabindex="-1" aria-label="' + esc('Symbol einfügen ' + targetLabel(mm.targets[0])) + '"><circle class="ped-mark-hit" r="20"/><circle class="ped-mark-dot" r="9.5"/><path class="ped-mark-plus" d="M-4.5 0H4.5M0 -4.5V4.5"/></g>';
          mi += 1;
        });
        var one = K.svg(m.spec, { cls: 'pap--edit', label: m.def ? 'Funktion ' + head : 'Programmablaufplan', minw: 1 }).replace(/<\/svg>$/, mk + '</svg>');
        one = one.replace('role="img"', 'role="group" data-plan="' + (m.def ? esc(m.def.id) : 'main') + '" ');
        one = one.replace(/aria-label="[^"]*"/, 'aria-label="' + esc(m.def ? 'Funktion ' + head + ', ' + plural(K.countBlocks(m.def.body), 'Symbol', 'Symbole') + ' im Rumpf' : 'Programmablaufplan, ' + plural(nMain, 'Symbol', 'Symbole') + ' zwischen Start und Ende') + '"');
        html += plans.length > 1 ? '<div class="ped-plan"><p class="ped-plan__title" aria-hidden="true">' + (m.def ? 'Funktion ' + esc(head) : 'Hauptprogramm') + '</p>' + one + '</div>' : one;
      });
      wrap.innerHTML = html;
      svgEls().forEach(function (e) { e.style.setProperty('--ped-zoom', String(zoom)); });
      var fl = K.flat(tree), first = fl.length ? fl[0].id : null, tabbed = sel && K.find(tree, sel) ? sel : first;
      $$('.pap-n', wrap).forEach(function (g) {
        var gid = g.getAttribute('data-id'), isEnd = /^end-/.test(gid) && K.find(tree, gid.slice(4)), f = K.find(tree, isEnd ? gid.slice(4) : gid);
        if (!f) { g.setAttribute('aria-hidden', 'true'); return; }
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', isEnd ? 'Rückgabe von Funktion ' + f.node.v + (String(f.node.ret || '').trim() ? ': ' + f.node.ret : ': keine') : nodeLabel(f.node));
        g.setAttribute('aria-pressed', f.node.id === sel ? 'true' : 'false');
        g.setAttribute('tabindex', !isEnd && f.node.id === tabbed ? '0' : '-1');
      });
      desc.textContent = K.describeAll(tree);
      if (focusNode || (hadFocus && sel)) { var g = nodeEl(sel); if (g) { g.focus({ preventScroll: true }); keepVisible(g); } }
    }
    function keepVisible(g) {
      try {
        var r = g.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        if (r.top < w.top + 8) wrap.scrollTop -= (w.top + 8 - r.top);
        else if (r.bottom > w.bottom - 8) wrap.scrollTop += (r.bottom - w.bottom + 8);
        if (r.left < w.left + 8) wrap.scrollLeft -= (w.left + 8 - r.left);
        else if (r.right > w.right - 8) wrap.scrollLeft += (r.right - w.right + 8);
      } catch (e) { /* ohne Scrollen weiter */ }
    }

    /* ── Bedienfeld für das gewählte Symbol ── */
    function btn(text, fn, cls, aria) {
      var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || 'k-btn--ghost'), text: text, 'aria-label': aria || null });
      b.addEventListener('click', fn); return b;
    }
    function textField(label, value, ph, onInput, aria, ctl) {
      var inp = el('input', { type: 'text', value: value, placeholder: ph || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': aria || label });
      inp.addEventListener('input', function () { onInput(inp.value); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); focusNode(); } });
      return el('label', { class: 'k-field ped-field' }, [el('span', { text: label }), inp]);
    }
    function renderPanel() {
      panel.innerHTML = '';
      var f = sel ? K.find(tree, sel) : null;
      if (!f) {
        panel.appendChild(el('p', { class: 'ped-hint', text: tree.length ? 'Klicke ein Symbol an, um Text und Reihenfolge zu ändern. Mit dem + im Plan fügst du ein Symbol ein.' : 'Der Plan ist noch leer. Klicke das + zwischen Start und Ende, um das erste Symbol einzufügen.' }));
        var add = btn('Symbol am Ende einfügen', function () { openMenu(add, [{ parent: null, slot: 'root', idx: tree.length, label: 'am Ende' }]); }, 'k-btn--ghost');
        panel.appendChild(el('div', { class: 'ped-actions' }, [add]));
        return;
      }
      var n = f.node, meta = KIND[n.k], fields = el('div', { class: 'ped-fields' });
      prep();
      panel.appendChild(el('h3', { class: 'ped-ptitle', text: 'Symbol ' + n.num + ': ' + meta.name + ' (' + meta.form + ')' }));
      if (n.k === 'in') {
        fields.appendChild(textField('Variable', n.v, KIND.in.ph, function (v) { n.v = v; change('v:' + n.id); renderPap(); }, 'Variable zum Einlesen, Symbol ' + n.num));
        var typ = el('select', { 'aria-label': 'Datentyp der Eingabe, Symbol ' + n.num }, [
          el('option', { value: 'float', text: 'Zahl mit Komma (float)' }), el('option', { value: 'int', text: 'ganze Zahl (int)' }), el('option', { value: 'str', text: 'Text (str)' })]);
        typ.value = n.typ || 'float';
        typ.addEventListener('change', function () { n.typ = typ.value === 'float' ? undefined : typ.value; change(); renderPap(); });
        fields.appendChild(el('label', { class: 'k-field ped-field' }, [el('span', { text: 'Datentyp' }), typ]));
        fields.appendChild(textField('Eingabeaufforderung (leer = Standard)', n.prompt === undefined ? '' : n.prompt, (n.v || 'x') + ': ', function (v) { n.prompt = v === '' ? undefined : v; change('p:' + n.id); renderPap(); }, 'Eingabeaufforderung, Symbol ' + n.num));
      } else {
        fields.appendChild(textField(meta.label, n.v, meta.ph, function (v) { n.v = v; change('v:' + n.id); renderPap(); }, meta.label + ', Symbol ' + n.num));
        if (n.k === 'def') fields.appendChild(textField('Rückgabe (leer = kein return)', n.ret || '', 'z. B. wert', function (v) { n.ret = v; change('r:' + n.id); renderPap(); }, 'Rückgabewert der Funktion, Symbol ' + n.num));
      }
      panel.appendChild(fields);
      var act = el('div', { class: 'ped-actions' });
      if (SIMPLE.indexOf(n.k) >= 0) {
        var kindSel = el('select', { 'aria-label': 'Symbolart von Symbol ' + n.num });
        SIMPLE.filter(function (k) { return allowed.indexOf(k) >= 0 || k === n.k; }).forEach(function (k) { kindSel.appendChild(el('option', { value: k, text: KIND[k].name })); });
        kindSel.value = n.k;
        kindSel.addEventListener('change', function () { n.k = kindSel.value; if (n.k !== 'in') { delete n.typ; delete n.prompt; } change(); renderAll(); announce('Symbolart geändert: ' + KIND[n.k].name + '.'); });
        act.appendChild(el('label', { class: 'k-field ped-field ped-field--kind' }, [el('span', { text: 'Symbolart' }), kindSel]));
      }
      var up = btn('Nach oben', function () { moveNode(n.id, -1); }, 'k-btn--ghost', 'Symbol ' + n.num + ' nach oben');
      var dn = btn('Nach unten', function () { moveNode(n.id, 1); }, 'k-btn--ghost', 'Symbol ' + n.num + ' nach unten');
      var before = btn('Davor einfügen', function () { openMenu(before, [{ parent: f.parent ? f.parent.id : null, slot: f.slot, idx: f.idx }]); });
      var after = btn('Danach einfügen', function () { openMenu(after, [{ parent: f.parent ? f.parent.id : null, slot: f.slot, idx: f.idx + 1 }]); });
      [up, dn, before, after].forEach(function (b) { act.appendChild(b); });
      if (n.k === 'if') {
        var iy = btn('In „ja“ einfügen', function () { openMenu(iy, [{ parent: n.id, slot: 'yes', idx: n.yes.length }]); });
        var inn = btn('In „nein“ einfügen', function () { openMenu(inn, [{ parent: n.id, slot: 'no', idx: n.no.length }]); });
        act.appendChild(iy); act.appendChild(inn);
      } else if (n.k === 'def') {
        var idf = btn('In die Funktion einfügen', function () { openMenu(idf, [{ parent: n.id, slot: 'body', idx: n.body.length }]); });
        act.appendChild(idf);
      } else if (K.isLoop(n)) {
        var ib = btn('In die Schleife einfügen', function () { openMenu(ib, [{ parent: n.id, slot: 'body', idx: n.body.length }]); });
        act.appendChild(ib);
      }
      act.appendChild(btn('Löschen', function () { deleteNode(n.id); }, 'k-btn--link', 'Symbol ' + n.num + ' löschen'));
      panel.appendChild(act);
    }
    function renderAll(o) {
      renderPap(o && o.focusNode);
      renderPanel();
      if (o && o.focusText) { var inp = $('input', panel); if (inp) { inp.focus(); try { inp.select(); } catch (e) { /* ohne Markieren */ } } }
      updateButtons();
    }
    function focusNode() { var g = sel ? nodeEl(sel) : null; if (g) { g.focus(); keepVisible(g); } }

    /* ── Operationen ── */
    function select(nid, focus) {
      if (sel === nid) { if (focus) focusNode(); return; }
      sel = nid; lastKey = null; renderPap(focus); renderPanel();
    }
    function insertAt(t, kind) {
      var parent = t.parent ? K.find(tree, t.parent) : null, arr = parent ? slotArr(parent.node, t.slot) : tree, n = makeNode(kind), where = targetLabel(t);
      arr.splice(Math.min(t.idx, arr.length), 0, n); sel = n.id;
      change(); renderAll({ focusText: true });
      announce(KIND[kind].name + ' eingefügt (' + where + '). Du kannst jetzt den Text bearbeiten.');
    }
    function deleteNode(nid) {
      var f = K.find(tree, nid); if (!f) return;
      var inner = K.countBlocks([f.node]) - 1, nxt = f.arr[f.idx + 1] || f.arr[f.idx - 1] || f.parent;
      f.arr.splice(f.idx, 1); sel = nxt ? nxt.id : null;
      change(); renderAll({ focusNode: !!sel });
      announce('Symbol gelöscht' + (inner ? ' (mit ' + plural(inner, 'enthaltenem Symbol', 'enthaltenen Symbolen') + ')' : '') + '. Rückgängig mit Strg+Z.');
    }
    function compound(n) { return n.k === 'if' || K.isLoop(n); }
    /* Verschieben in Leserichtung: an Verzweigungen und Schleifen vorbei geht es hinein und wieder hinaus */
    function moveNode(nid, d) {
      var f = K.find(tree, nid); if (!f) return;
      var arr = f.arr, i = f.idx, n = f.node, nb = arr[i + d], moved = false;
      if (!f.parent) {
        /* oberste Ebene: Funktionen sortieren sich nur untereinander, Symbole des Hauptplans nur untereinander */
        var j = i + d;
        while (arr[j] && K.isDef(arr[j]) !== K.isDef(n)) j += d;
        nb = arr[j];
        if (nb && !(compound(nb) && !K.isDef(n))) { arr[i] = nb; arr[j] = n; moved = true; }
        else if (!nb) { announce(d > 0 ? 'Das Symbol steht schon ganz unten.' : 'Das Symbol steht schon ganz oben.'); return; }
      }
      if (moved) { /* oberste Ebene schon erledigt */ }
      else if (nb && compound(nb)) {
        var kids = K.kids(nb), kd = d > 0 ? kids[0] : kids[kids.length - 1];
        arr.splice(i, 1); kd.arr.splice(d > 0 ? 0 : kd.arr.length, 0, n); moved = true;
      } else if (nb) { arr[i] = nb; arr[i + d] = n; moved = true; }
      else if (f.parent && f.parent.k !== 'def') {
        var pf = K.find(tree, f.parent.id);
        arr.splice(i, 1); pf.arr.splice(d > 0 ? pf.idx + 1 : pf.idx, 0, n); moved = true;
      }
      if (!moved) { announce(d > 0 ? 'Das Symbol steht schon ganz unten.' : 'Das Symbol steht schon ganz oben.'); return; }
      sel = n.id; change(); renderAll({ focusNode: true });
      announce('Symbol ' + K.find(tree, n.id).node.num + ' verschoben.');
    }
    function stepSel(d) {
      var fl = K.flat(tree); if (!fl.length) return;
      var i = fl.map(function (n) { return n.id; }).indexOf(sel);
      i = i < 0 ? (d > 0 ? 0 : fl.length - 1) : Math.max(0, Math.min(fl.length - 1, i + d));
      select(fl[i].id, true);
    }

    /* ── Einfügemenü ── */
    function closeMenu(back) {
      if (!menu) return;
      menu.remove(); menu = null;
      doc.removeEventListener('mousedown', onDocDown, true);
      if (back && menuOpener && doc.contains(menuOpener)) { try { menuOpener.focus({ preventScroll: true }); } catch (e) { /* weiter */ } }
    }
    function onDocDown(e) { if (menu && !menu.contains(e.target)) closeMenu(); }
    function openMenu(anchor, targets) {
      closeMenu(); menuOpener = anchor;
      var tIdx = 0;
      menu = el('div', { class: 'ped-menu', role: 'menu', 'aria-label': 'Symbol einfügen' });
      menu.appendChild(el('p', { class: 'ped-menu__title', text: 'Symbol einfügen' }));
      if (targets.length > 1) {
        var seg = el('div', { class: 'k-seg ped-menu__seg', role: 'group', 'aria-label': 'Wohin' });
        targets.forEach(function (t, k) {
          var b = el('button', { type: 'button', 'aria-pressed': k === 0 ? 'true' : 'false', text: k === 0 ? 'Vor der Schleife' : 'In der Schleife' });
          b.addEventListener('click', function () { tIdx = k; $$('button', seg).forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); });
          seg.appendChild(b);
        });
        menu.appendChild(seg);
      }
      var items = [];
      allowed.forEach(function (k) {
        if (k === 'def' && targets.some(function (t) { return t.parent !== null || t.slot !== 'root'; })) return;
        var b = el('button', { type: 'button', role: 'menuitem', class: 'ped-menu__item' }, [el('strong', { text: KIND[k].name }), el('span', { text: KIND[k].form })]);
        b.addEventListener('click', function () { var t = targets[tIdx]; closeMenu(); insertAt(t, k); });
        menu.appendChild(b); items.push(b);
      });
      menu.appendChild(btn('Abbrechen', function () { closeMenu(true); }, 'k-btn--link'));
      menu.addEventListener('keydown', function (e) {
        var i = items.indexOf(doc.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Tab' && !menu.contains(doc.activeElement)) closeMenu();
      });
      doc.body.appendChild(menu);
      var r = anchor.getBoundingClientRect(), narrow = root.innerWidth < 640;
      if (!narrow) {
        var mw = 280, mh = menu.offsetHeight;
        var left = Math.min(root.innerWidth - mw - 8, Math.max(8, r.right + 10)), top = Math.min(root.innerHeight - mh - 8, Math.max(8, r.top - 12));
        if (left < r.right + 10 && r.left - mw - 10 > 8 && r.right + 10 + mw > root.innerWidth - 8) left = r.left - mw - 10;
        menu.style.left = left + 'px'; menu.style.top = top + 'px';
      }
      doc.addEventListener('mousedown', onDocDown, true);
      if (items[0]) items[0].focus();
    }

    /* ── Ereignisse ── */
    wrap.addEventListener('click', function (e) {
      var m = e.target.closest ? e.target.closest('.ped-mark') : null;
      if (m) { openMenu(m, marksList[parseInt(m.getAttribute('data-m'), 10)].targets); return; }
      var g = e.target.closest ? e.target.closest('.pap-n') : null, gid = g ? g.getAttribute('data-id') : '';
      if (/^end-/.test(gid)) gid = gid.slice(4);
      if (g && K.find(tree, gid)) select(gid, true);
    });
    wrap.addEventListener('keydown', function (e) {
      var m = e.target.closest ? e.target.closest('.ped-mark') : null;
      if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openMenu(m, marksList[parseInt(m.getAttribute('data-m'), 10)].targets); return; }
      var g = e.target.closest ? e.target.closest('.pap-n') : null;
      if (!g || !sel) return;
      var f = K.find(tree, sel); if (!f) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (e.altKey) moveNode(sel, e.key === 'ArrowDown' ? 1 : -1); else stepSel(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteNode(sel); }
      else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); var inp = $('input', panel); if (inp) { inp.focus(); try { inp.select(); } catch (x) { /* weiter */ } } }
      else if (e.key === '+' || e.key === 'Insert') { e.preventDefault(); var t = { parent: f.parent ? f.parent.id : null, slot: f.slot, idx: e.shiftKey ? f.idx : f.idx + 1 }; openMenu(g, [t]); }
    });
    rootEl.addEventListener('keydown', function (e) {
      var tg = e.target, inField = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT');
      if ((e.ctrlKey || e.metaKey) && !inField) {
        var k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
      }
    });
    wrap.addEventListener('focusin', function (e) {
      var g = e.target.closest ? e.target.closest('.pap-n') : null;
      if (g && K.find(tree, g.getAttribute('data-id')) && g.getAttribute('data-id') !== sel) select(g.getAttribute('data-id'), false);
    });
    root.addEventListener('resize', function () { if (menu) closeMenu(); });
    bUndo.addEventListener('click', undo); bRedo.addEventListener('click', redo);
    function setZoom(z) { zoom = Math.max(0.5, Math.min(1.6, Math.round(z * 100) / 100)); svgEls().forEach(function (e) { e.style.setProperty('--ped-zoom', String(zoom)); }); updateButtons(); }
    bZout.addEventListener('click', function () { setZoom(zoom - 0.2); });
    bZin.addEventListener('click', function () { setZoom(zoom + 0.2); });

    /* ── Austausch ── */
    function cleanTree() { return K.fromJson(K.toJson(tree)); }
    function hasGaps() { var g = false; walk(tree, function (n) { if (isEmpty(n)) g = true; }); return g; }
    function svgText(title, scale) { return K.exportSvgAll(cleanTree(), { title: title || 'Programmablaufplan', scale: scale || 1 }); }
    function pngBlob(scale) {
      scale = scale || 2;
      return new Promise(function (resolve, reject) {
        var txt = svgText('Programmablaufplan', scale), img = new Image();
        img.onload = function () {
          var c = doc.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
          var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (b) { if (b) resolve(b); else reject(new Error('PNG konnte nicht erzeugt werden.')); }, 'image/png');
        };
        img.onerror = function () { reject(new Error('PNG konnte nicht erzeugt werden.')); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
      });
    }
    var ctl = {
      el: rootEl,
      getTree: function () { return tree; },
      getJson: function () { return K.toJson(tree); },
      /* json ersetzt den Plan; o.history=false: Verlauf neu beginnen (Laden), sonst als Schritt festhalten */
      setJson: function (json, o) {
        o = o || {}; closeMenu();
        tree = K.fromJson(json); sel = null;
        if (o.history === false) { hist = [snap()]; pos = 0; lastKey = null; renderAll(); fire('load'); }
        else { change(); renderAll(); }
      },
      replaceTree: function (nodes) { closeMenu(); tree = nodes; sel = null; change(); renderAll(); },
      undo: undo, redo: redo, select: function (nid) { select(nid, true); },
      canUndo: function () { return pos > 0; }, canRedo: function () { return pos < hist.length - 1; },
      hasGaps: hasGaps, svgText: svgText, pngBlob: pngBlob, announce: announce,
      codeText: function () { return K.toText(cleanTree()); },
      onChange: function (fn) { listeners.push(fn); },
      focus: function () { var g = sel ? nodeEl(sel) : $('.pap-n[tabindex="0"]', wrap); if (g) g.focus(); else bUndo.focus(); },
      zoom: setZoom
    };
    renderAll(); updateButtons();
    return ctl;
  }

  /* ══════════════════════════════════════════════════════════
     Speicher-Adapter: KursSpeicher, sonst localStorage, sonst Arbeitsspeicher
     ══════════════════════════════════════════════════════════ */
  var Spei = (function () {
    var LS = 'dhbw-inf-mb:pap-editor', mem = {};
    function ks() { return root.KursSpeicher && typeof root.KursSpeicher.speichern === 'function' ? root.KursSpeicher : null; }
    function lsRead() { try { var r = root.localStorage.getItem(LS); if (r) return JSON.parse(r) || {}; } catch (e) { /* weiter */ } return mem; }
    function lsWrite(o) { mem = o; try { root.localStorage.setItem(LS, JSON.stringify(o)); } catch (e) { /* weiter */ } }
    return {
      art: function () { return ks() ? 'Speicher' : 'Browser'; },
      save: function (pfad, wert) {
        if (ks()) return ks().speichern(pfad, wert);
        var o = lsRead(); o[pfad] = { wert: wert, geaendert: new Date().toISOString() }; lsWrite(o); return Promise.resolve();
      },
      load: function (pfad) {
        if (ks()) return ks().laden(pfad);
        var e = lsRead()[pfad]; return Promise.resolve(e ? e.wert : undefined);
      },
      list: function (prefix) {
        if (ks()) return ks().liste(prefix).then(function (l) { return (l || []).map(function (x) { return { pfad: x.pfad, geaendert: x.geaendert }; }); });
        var o = lsRead();
        return Promise.resolve(Object.keys(o).filter(function (k) { return k.indexOf(prefix) === 0; }).map(function (k) { return { pfad: k, geaendert: o[k].geaendert }; }));
      },
      remove: function (pfad) {
        if (ks()) return ks().loeschen(pfad);
        var o = lsRead(); delete o[pfad]; lsWrite(o); return Promise.resolve();
      }
    };
  })();

  /* ── Datei speichern/Download ── */
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = el('a', { href: url, download: name });
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function fileName(n) { return String(n || 'pap').trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '-').slice(0, 60) || 'pap'; }

  /* ── Python-Panel: Editor + Runner wie in den Lektionen ── */
  function codePanel(host, o) {
    o = o || {};
    var pre = el('pre', { 'data-run': 'ja' }, [el('code', { text: '# Hier erscheint der Python-Code' })]);
    host.appendChild(pre);
    if (root.KursRunner && root.KursRunner.enhance) root.KursRunner.enhance(pre);
    var box = $('.k-runner', host), ta = box ? $('.k-runner__code', box) : null;
    if (!ta) { ta = el('textarea', { class: 'ped-plain', rows: '12', spellcheck: 'false', 'aria-label': 'Python-Code' }); host.innerHTML = ''; host.appendChild(ta); }
    box = box || host;
    box.classList.add('ped-code');
    var lastSet = '', autoStdin = null, handlers = [];
    function get() { return root.KursEditor && root.KursEditor.getValue ? root.KursEditor.getValue(ta) : ta.value; }
    function setStdin(code) {
      var rn = box._kRunner;
      if (!rn || !rn.stdinTa) return;
      var n = (code.match(/\binput\s*\(/g) || []).length;
      if (!n) return;
      var want = new Array(n + 1).join('5\n').replace(/\n$/, '');
      if (!rn.stdinTa.value.trim() || rn.stdinTa.value === autoStdin) { rn.stdinTa.value = want; autoStdin = want; try { rn.stdinTa.dispatchEvent(new Event('input')); } catch (e) { /* weiter */ } }
    }
    function set(code) {
      lastSet = code;
      if (get() !== code) {
        if (root.KursEditor && root.KursEditor.setValue) root.KursEditor.setValue(ta, code); else { ta.value = code; ta.dispatchEvent(new Event('input')); }
      }
      setStdin(code);
    }
    ta.addEventListener('input', function () { handlers.forEach(function (fn) { fn(get() !== lastSet); }); });
    return { ta: ta, box: box, get: get, set: set, onDirty: function (fn) { handlers.push(fn); }, dirty: function () { return get() !== lastSet; } };
  }

  /* ══════════════════════════════════════════════════════════
     Vorlagen (als Python-Text, die Engine macht daraus den Plan)
     ══════════════════════════════════════════════════════════ */
  var TEMPLATES = [
    { name: 'Werkstoffvorschlag', code: [
      'spannung = float(input("Maximale Spannung in MPa: "))', 'temperatur = float(input("Betriebstemperatur in °C: "))',
      'if spannung <= 0 or temperatur < -50 or temperatur > 600:', '    print("Eingabe unplausibel - bitte Werte prüfen")', 'else:',
      '    if temperatur > 300:', '        if spannung <= 200:', '            werkstoff = "16Mo3 (warmfest)"', '        else:', '            werkstoff = "Sonderwerkstoff - Rücksprache Konstruktion"',
      '    else:', '        if spannung <= 140:', '            werkstoff = "S235JR"', '        elif spannung <= 220:', '            werkstoff = "C45E"', '        else:', '            werkstoff = "42CrMo4 (vergütet)"',
      '    print("Empfohlener Werkstoff:", werkstoff)'].join('\n') },
    { name: 'Abkühlkurve', code: [
      'temperatur = 850.0', 'umgebung = 20.0', 'k = 0.08', 'ziel = 60.0', 'minuten = 0', 'while temperatur > ziel:',
      '    temperatur = temperatur - k * (temperatur - umgebung)', '    minuten = minuten + 1', 'print(f"Nach {minuten} Minuten: {temperatur:.1f} °C")'].join('\n') },
    { name: 'Mittelwert der ersten 5 Minuten (Zählschleife)', code: [
      'k = 0.08', 'umgebung = 20.0', 't = 850.0', 'summe = 0.0', 'for minute in range(1, 6):', '    t = t - k * (t - umgebung)', '    summe = summe + t',
      '    print(f"Minute {minute}: {t:6.1f} °C")', 'print(f"Mittelwert: {summe / 5:.1f} °C")'].join('\n') },
    { name: 'Eingabe prüfen (fußgesteuerte Schleife)', code: [
      'while True:', '    wert = float(input("Messwert (größer 0): "))', '    if not wert <= 0:', '        break', 'print("Messwert:", wert)'].join('\n') },
    { name: 'Betrag einer Zahl (Verzweigung)', code: [
      'x = float(input("x: "))', 'if x < 0:', '    betrag = -x', 'else:', '    betrag = x', 'print("Betrag:", betrag)'].join('\n') }
  ];

  /* ══════════════════════════════════════════════════════════
     (2) Seite pap-editor.html
     ══════════════════════════════════════════════════════════ */
  function initPage(app) {
    var PRE = 'inf-mb/pap-editor/', FILE = PRE + 'datei:', DRAFT = PRE + 'entwurf';
    var edHost = $('[data-ped="editor"]', app), codeHost = $('[data-ped="code"]', app), filesHost = $('[data-ped="files"]', app), exportHost = $('[data-ped="export"]', app), codeBar = $('[data-ped="codebar"]', app);
    var ctl = create(edHost, { allowed: ORDER });
    var cp = codePanel(codeHost);
    var name = '', dirty = false, saveTimer = null;

    /* Kopf: Name, Neu, Speichern, Vorlage, Gespeicherte */
    var nameIn = el('input', { type: 'text', id: 'ped-name', placeholder: 'z. B. Werkstoffwahl', maxlength: '60', autocomplete: 'off', spellcheck: 'false' });
    var bNew = el('button', { type: 'button', class: 'k-btn k-btn--ghost', text: 'Neu' });
    var bSave = el('button', { type: 'button', class: 'k-btn', text: 'Speichern' });
    var tplSel = el('select', { id: 'ped-tpl' }, [el('option', { value: '', text: 'Vorlage laden …' })]);
    TEMPLATES.forEach(function (t, i) { tplSel.appendChild(el('option', { value: String(i), text: t.name })); });
    var status = el('p', { class: 'ped-status', role: 'status', 'aria-live': 'polite' });
    var openList = el('ul', { class: 'ped-files' });
    var details = el('details', { class: 'ped-open' }, [el('summary', { text: 'Gespeicherte PAPs' }), openList]);
    filesHost.appendChild(el('div', { class: 'ped-filebar' }, [
      el('label', { class: 'k-field ped-name', for: 'ped-name' }, [el('span', { text: 'Name des PAP' }), nameIn]),
      el('div', { class: 'ped-filebtns' }, [bSave, bNew]),
      el('label', { class: 'k-field ped-tpl', for: 'ped-tpl' }, [el('span', { text: 'Vorlage' }), tplSel])
    ]));
    filesHost.appendChild(details); filesHost.appendChild(status);

    function say(t, bad) { status.className = 'ped-status' + (bad ? ' is-bad' : ''); status.textContent = t; }
    function codeHint() { return $('[data-ped="codehint"]', app); }

    /* Plan <-> Code */
    function syncCode() { var t = ctl.codeText(); cp.set(t); var h = codeHint(); if (h) { h.textContent = t ? 'Der Code entsteht live aus dem Plan. Du kannst ihn ausführen, kopieren oder von Hand ändern.' : 'Noch kein Code: Füge Symbole in den Plan ein.'; h.className = 'k-small k-muted'; } }
    cp.onDirty(function (d) { var h = codeHint(); if (!h) return; if (d) { h.textContent = 'Der Code wurde von Hand geändert. Mit „Code → PAP“ übernimmst du ihn in den Plan. Jede Änderung am Plan ersetzt den Code wieder.'; h.className = 'k-small ped-warn'; } else { h.className = 'k-small k-muted'; } });
    var bCode = el('button', { type: 'button', class: 'k-btn', text: 'Code → PAP' });
    var codeMsg = el('p', { class: 'ped-status', role: 'status', 'aria-live': 'polite' });
    codeBar.appendChild(bCode); codeBar.appendChild(codeMsg);
    bCode.addEventListener('click', function () {
      var src = cp.get();
      try {
        var r = K.parseCode(src, { erweitert: true });
        ctl.replaceTree(r.nodes);
        syncCode();
        codeMsg.className = 'ped-status is-ok';
        codeMsg.textContent = r.nodes.length ? 'Gelesen: ' + plural(K.countBlocks(r.nodes), 'Symbol', 'Symbole') + '. Der Plan zeigt jetzt den Ablauf deines Codes.' : 'Der Code ist leer, der Plan auch.';
      } catch (e) {
        codeMsg.className = 'ped-status is-bad';
        codeMsg.textContent = e.message + ' Der Plan bleibt wie er war.';
      }
    });

    /* Änderungen: Code nachführen, Entwurf sichern */
    ctl.onChange(function (tree, src) {
      syncCode();
      if (src === 'user') { dirty = true; showDirty(); }
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { Spei.save(DRAFT, { name: name, baum: ctl.getJson(), dirty: dirty }); }, 500);
    });
    function showDirty() { if (dirty) say('Ungespeicherte Änderungen. Der Entwurf bleibt in diesem Browser erhalten.'); }
    nameIn.addEventListener('input', function () { name = nameIn.value; dirty = true; });

    function loadInto(json, nm, msg) {
      ctl.setJson(json, { history: true });
      name = nm || ''; nameIn.value = name; dirty = false; syncCode(); say(msg);
    }
    bNew.addEventListener('click', function () { loadInto([], '', 'Neuer, leerer Plan. „Rückgängig“ holt den vorigen Plan zurück.'); ctl.focus(); });
    tplSel.addEventListener('change', function () {
      if (tplSel.value === '') return;
      var t = TEMPLATES[parseInt(tplSel.value, 10)];
      try { var r = K.parseCode(t.code, { erweitert: true }); ctl.replaceTree(r.nodes); name = ''; nameIn.value = ''; dirty = true; syncCode(); say('Vorlage „' + t.name + '“ geladen. „Rückgängig“ holt den vorigen Plan zurück.'); }
      catch (e) { say('Vorlage konnte nicht gelesen werden: ' + e.message, true); }
      tplSel.value = '';
    });
    bSave.addEventListener('click', function () {
      var nm = nameIn.value.trim();
      if (!nm) { say('Gib dem PAP zuerst einen Namen.', true); nameIn.focus(); return; }
      name = nm;
      Spei.save(FILE + nm, { name: nm, baum: ctl.getJson(), version: 1 }).then(function () {
        dirty = false; say('Gespeichert als „' + nm + '“ (' + (Spei.art() === 'Speicher' ? 'im Kursspeicher' : 'in diesem Browser') + ').'); refreshList();
      }, function (e) { say('Speichern fehlgeschlagen: ' + (e && e.message ? e.message : e), true); });
    });
    function fmtDate(iso) { try { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return ''; } }
    function refreshList() {
      Spei.list(FILE).then(function (l) {
        l.sort(function (a, b) { return String(b.geaendert).localeCompare(String(a.geaendert)); });
        openList.innerHTML = '';
        details.querySelector('summary').textContent = 'Gespeicherte PAPs (' + l.length + ')';
        if (!l.length) openList.appendChild(el('li', { class: 'k-muted k-small', text: 'Noch nichts gespeichert.' }));
        l.forEach(function (x) {
          var nm = x.pfad.slice(FILE.length);
          var bo = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: 'Öffnen', 'aria-label': 'PAP „' + nm + '“ öffnen' });
          var bd = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', text: 'Löschen', 'aria-label': 'PAP „' + nm + '“ löschen' });
          var armed = false;
          bo.addEventListener('click', function () {
            Spei.load(x.pfad).then(function (v) { if (v && v.baum) loadInto(v.baum, nm, '„' + nm + '“ geöffnet.'); else say('Diese Datei ist leer oder beschädigt.', true); });
          });
          bd.addEventListener('click', function () {
            if (!armed) { armed = true; bd.textContent = 'Wirklich löschen?'; setTimeout(function () { armed = false; bd.textContent = 'Löschen'; }, 3500); return; }
            Spei.remove(x.pfad).then(function () { say('„' + nm + '“ gelöscht.'); refreshList(); });
          });
          openList.appendChild(el('li', null, [el('span', { class: 'ped-files__name' }, [nm, el('small', { text: ' ' + fmtDate(x.geaendert) })]), bo, bd]));
        });
      });
    }
    details.addEventListener('toggle', function () { if (details.open) refreshList(); });
    refreshList();

    /* Export */
    var bSvg = el('button', { type: 'button', class: 'k-btn k-btn--ghost', text: 'Als SVG speichern' });
    var bPng = el('button', { type: 'button', class: 'k-btn k-btn--ghost', text: 'Als PNG speichern' });
    var expMsg = el('p', { class: 'ped-status', role: 'status', 'aria-live': 'polite' });
    exportHost.appendChild(el('div', { class: 'ped-exp' }, [bSvg, bPng]));
    exportHost.appendChild(expMsg);
    bSvg.addEventListener('click', function () {
      if (!ctl.getTree().length) { expMsg.textContent = 'Der Plan ist noch leer.'; return; }
      saveBlob(new Blob([ctl.svgText(name || 'PAP')], { type: 'image/svg+xml' }), fileName(name) + '.svg');
      expMsg.textContent = 'SVG-Datei erzeugt (' + fileName(name) + '.svg).';
    });
    bPng.addEventListener('click', function () {
      if (!ctl.getTree().length) { expMsg.textContent = 'Der Plan ist noch leer.'; return; }
      ctl.pngBlob(2).then(function (b) { saveBlob(b, fileName(name) + '.png'); expMsg.textContent = 'PNG-Datei erzeugt (' + fileName(name) + '.png).'; }, function (e) { expMsg.textContent = e.message; });
    });

    /* Start: Entwurf wiederherstellen, sonst leer */
    Spei.load(DRAFT).then(function (d) {
      if (d && d.baum && d.baum.length) { ctl.setJson(d.baum, { history: false }); name = d.name || ''; nameIn.value = name; dirty = !!d.dirty; syncCode(); say('Dein letzter Entwurf wurde wiederhergestellt.'); }
      else syncCode();
    }, syncCode);
    syncCode();
    app._ped = { ctl: ctl, code: cp, store: Spei, templates: TEMPLATES };
    root.KursPAPEditorPage = app._ped;
  }

  /* ══════════════════════════════════════════════════════════
     (3) Aufgabentyp „PAP zeichnen“
     ══════════════════════════════════════════════════════════ */
  function readScript(box, role) { var s = $('script[data-role="' + role + '"]', box); return s ? s.textContent.replace(/^\s+/, '').replace(/\s+$/, '') : ''; }
  function readJson(box, role) { var t = readScript(box, role); if (!t) return null; try { return JSON.parse(t); } catch (e) { return null; } }

  function mountTask(box) {
    if (box._pedInit) return; box._pedInit = true;
    var tid = box.getAttribute('data-id') || uid('pap-aufgabe');
    var timeout = parseInt(box.getAttribute('data-timeout') || '8000', 10);
    var erlaubt = (box.getAttribute('data-erlaubt') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var tests = readScript(box, 'tests'), startJson = readJson(box, 'start'), solJson = readJson(box, 'solution');
    var lesson = lessonKey(), pfad = 'inf-mb/' + lesson.toLowerCase() + '/pap:' + tid;
    var hintsList = $('.a-hints', box);
    var edHost = el('div', { class: 'ped-task' });
    var bCheck = el('button', { type: 'button', class: 'k-btn', text: 'Prüfen' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--link', text: 'Zurücksetzen' });
    var status = el('span', { class: 'a-status', role: 'status', 'aria-live': 'polite' });
    var bar = el('div', { class: 'a-bar' }, [bCheck, bReset]);
    var results = el('div', { class: 'a-results', 'aria-live': 'polite' });
    var hintBox = el('div', { class: 'a-hintbox' }), solBox = null, bHint = null, bSol = null;
    var codeDet = el('details', { class: 'ped-details' }, [el('summary', { text: 'Erzeugten Python-Code ansehen und ausführen' })]);
    var codeHost = el('div'); codeDet.appendChild(codeHost);
    var attempted = false, running = false, cp = null;

    box.appendChild(edHost); box.appendChild(bar); box.appendChild(results); box.appendChild(hintBox);
    /* data-ohne-code: der erzeugte Code bleibt verborgen (die Aufgabe liefert ihn nicht vorab, z. B. wenn er die nächste Station löst) */
    if (!box.hasAttribute('data-ohne-code')) box.appendChild(codeDet);
    var ctl = create(edHost, { allowed: erlaubt.length ? erlaubt : ORDER, json: startJson || [] });
    bar.appendChild(status);

    if (hintsList) {
      var items = $$('li', hintsList), shown = 0;
      hintsList.hidden = true;
      bHint = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Tipp 1 von ' + items.length });
      bHint.addEventListener('click', function () {
        if (shown >= items.length) return;
        var b = el('div', { class: 'a-hint' }, [el('strong', { text: 'Tipp ' + (shown + 1) + ': ' })]);
        var sp = el('span'); sp.innerHTML = items[shown].innerHTML; b.appendChild(sp); hintBox.appendChild(b); shown++;
        bHint.textContent = shown >= items.length ? 'Keine weiteren Tipps' : 'Tipp ' + (shown + 1) + ' von ' + items.length;
        if (shown >= items.length) bHint.disabled = true;
      });
      bar.insertBefore(bHint, status);
    }
    if (solJson) {
      var solTree = K.fromJson(solJson);
      solBox = el('div', { class: 'a-solution', hidden: true }, [el('strong', { text: 'Musterlösung' })]);
      var fig = el('div'); fig.innerHTML = '<div class="pap-wrap">' + K.svgAll(solTree, { label: 'Musterlösung: ' + K.describeAll(solTree), minw: 1 }) + '</div>';
      solBox.appendChild(fig);
      solBox.appendChild(el('pre', { class: 'k-code', 'data-run': 'no', text: K.toText(solTree) }));
      bSol = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Musterlösung ansehen', 'aria-disabled': 'true', title: 'Erst einen Versuch prüfen, dann kannst du die Musterlösung aufdecken.' });
      bSol.addEventListener('click', function () {
        if (!attempted) { status.textContent = 'Erst einen eigenen Versuch prüfen, dann die Musterlösung.'; return; }
        solBox.hidden = !solBox.hidden; bSol.textContent = solBox.hidden ? 'Musterlösung ansehen' : 'Musterlösung verbergen';
      });
      bar.insertBefore(bSol, status); box.appendChild(solBox);
    }
    function unlock() { attempted = true; if (bSol) { bSol.setAttribute('aria-disabled', 'false'); bSol.title = ''; } }

    /* Code anzeigen (läuft erst beim Öffnen, spart Editor-Aufbau) */
    function syncCode() { if (cp) cp.set(ctl.codeText()); }
    codeDet.addEventListener('toggle', function () { if (codeDet.open) { if (!cp) cp = codePanel(codeHost); syncCode(); } });

    function A() { return root.KursAufgaben; }
    function markStarted() { var a = A(); if (a && a.store && a.store.setStarted) { try { if (a.store.setStarted(lessonKey(), tid) && a.update) a.update(); } catch (e) { /* weiter */ } } }
    function markSolved() {
      var a = A();
      if (a && a.store && a.store.setSolved) { try { a.store.setSolved(lessonKey(), tid); } catch (e) { /* weiter */ } }
      box.classList.add('is-solved');
      var head = $('.a-task__head', box);
      if (head && !$('.a-badge', head)) head.appendChild(el('span', { class: 'a-badge' }, [icon('check'), 'gelöst']));
      if (a && a.update) a.update();
    }
    function persist(solved) { Spei.save(pfad, { baum: ctl.getJson(), geloest: !!solved, stand: new Date().toISOString() }); }
    var persistTimer = null;
    ctl.onChange(function (tree, src) {
      syncCode();
      if (src !== 'user') return;
      markStarted();
      clearTimeout(persistTimer); persistTimer = setTimeout(function () { persist(box.classList.contains('is-solved')); }, 600);
    });
    Spei.load(pfad).then(function (v) { if (v && v.baum && v.baum.length) { ctl.setJson(v.baum, { history: false }); status.textContent = 'Dein letzter Stand wurde geladen.'; } });
    var done = A() && A().store ? (A().store.solved(lessonKey()) || {})[tid] : false;
    if (done) { box.classList.add('is-solved'); var h0 = $('.a-task__head', box); if (h0 && !$('.a-badge', h0)) h0.appendChild(el('span', { class: 'a-badge' }, [icon('check'), 'gelöst'])); }

    function banner(ok, text, extra) { results.innerHTML = ''; var b = el('div', { class: 'a-banner ' + (ok ? 'is-ok' : 'is-bad') }, [text]); if (extra) b.appendChild(extra); results.appendChild(b); }
    function showResults(r) {
      results.innerHTML = '';
      if (r.loadError) { banner(false, 'Python konnte nicht gestartet werden. Bist du online? (' + r.loadError + ')'); return false; }
      if (r.timedOut) { banner(false, 'Abgebrochen nach ' + (timeout / 1000) + ' s. Läuft in deinem Plan eine Schleife endlos? Prüfe, ob sich die Schleifenbedingung irgendwann ändert.'); return false; }
      if (r.jsError) { banner(false, 'Interner Fehler beim Prüfen: ' + r.jsError.split('\n').slice(-2).join(' ')); return false; }
      if (r.fatal) { var pre = el('pre', { class: 'a-trace-text', text: r.fatal }), ex = el('div', null, [pre]); if (r.hint) ex.appendChild(el('p', { class: 'a-hinttext', text: 'Hinweis: ' + r.hint })); banner(false, 'Der aus deinem Plan erzeugte Code läuft noch nicht: ', ex); return false; }
      var ok = 0, list = el('ul', { class: 'a-tests' });
      r.results.forEach(function (t) {
        if (t.ok) ok++;
        var li = el('li', { class: t.ok ? 'is-ok' : 'is-bad' }, [
          el('span', { class: 'a-tests__mark', 'aria-hidden': 'true' }, [icon(t.ok ? 'check' : 'x')]),
          el('span', { class: 'k-sr', text: t.ok ? 'Bestanden: ' : 'Nicht bestanden: ' }), el('span', { class: 'a-tests__title', text: t.t })]);
        if (!t.ok && t.m) li.appendChild(el('div', { class: 'a-tests__msg', text: t.m }));
        list.appendChild(li);
      });
      var total = r.results.length, all = total > 0 && ok === total;
      results.appendChild(el('div', { class: 'a-banner ' + (all ? 'is-ok' : 'is-bad'), text: total === 0 ? 'Keine Tests gefunden.' : (all ? 'Alle ' + total + ' Tests bestanden. Aufgabe gelöst.' : ok + ' von ' + total + ' Tests bestanden. Lies die Meldungen bei den nicht bestandenen Einträgen.') }));
      results.appendChild(list);
      return all;
    }
    function check() {
      if (running) return;
      var tr = ctl.getTree();
      if (!tr.length) { banner(false, 'Der Plan ist noch leer. Füge mit dem + Symbole zwischen Start und Ende ein.'); return; }
      if (ctl.hasGaps()) { banner(false, 'Ein Symbol hat noch keinen Text (gestrichelt im Plan). Fülle es aus, dann prüft der Test deinen Ablauf.'); return; }
      var a = A();
      if (!a || !a.runPython) { banner(false, 'Die Prüfung braucht aufgaben.js und kurs.js auf dieser Seite.'); return; }
      if (!tests) { banner(false, 'Für diese Aufgabe sind keine Tests hinterlegt.'); return; }
      running = true; bCheck.disabled = true; status.textContent = '';
      status.appendChild(el('span', { class: 'k-spinner', 'aria-hidden': 'true' })); status.appendChild(doc.createTextNode(root.KursPy && !root.KursPy.worker ? 'Python wird geladen (einmalig, ca. 10 MB) …' : 'läuft …'));
      a.runPython('test', ctl.codeText(), [], tests, 'programm', timeout).then(function (r) {
        running = false; bCheck.disabled = false; status.textContent = '';
        var all = showResults(r);
        if (!r.loadError && !r.timedOut) unlock();
        status.textContent = all ? 'bestanden' : 'geprüft';
        if (all) { markSolved(); persist(true); }
      });
    }
    bCheck.addEventListener('click', check);
    bReset.addEventListener('click', function () { ctl.setJson(startJson || [], { history: true }); results.innerHTML = ''; status.textContent = 'zurückgesetzt'; });
    box._ped = ctl;
  }

  function initAll() {
    $$('[data-pap-editor-app]').forEach(initPage);
    $$('.k-pap-aufgabe').forEach(mountTask);
  }
  root.KursPAPEditor = { create: create, mountTask: mountTask, templates: TEMPLATES, kinds: KIND, speicher: Spei };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', initAll); else initAll();
})(window);
