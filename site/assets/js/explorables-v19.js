/* =============================================================
   explorables-v19.js – interaktive Bausteine für V19 „Datenbanken & SQL“ (reines JS, kein Framework)
   (A) Tabelle auftraege: Tabelle, Zeile, Spalte, Primärschlüssel, Datentyp per Auswahl hervorheben.
   (B) Abfrage-Baukasten: SELECT / WHERE / ORDER BY zusammenstellen, Auswertung FROM -> WHERE -> SELECT -> ORDER BY Schritt für Schritt.
   (C) GROUP BY: Zeilen wandern in Fächer, je Fach wird gerechnet.
   (D) Ablauf in Python: connect -> cursor -> execute -> fetchall -> commit -> close.
   (E) SQL-Injection: f-String gegen Platzhalter, mit kleinem SQL-Leser für die WHERE-Bedingung.
   (F) PAP: offene Aufträge einer Maschine ausgeben.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Daten: die zwölf Aufträge aus fz3.db ────────────────── */
  var SPALTEN = ['nr', 'teil', 'maschine', 'menge', 'status'];
  var TYPEN = ['INTEGER', 'TEXT', 'TEXT', 'INTEGER', 'TEXT'];
  var AUFTRAEGE = [
    [4711, 'WELLE_20H6', 'D2', 500, 'in Arbeit'], [4712, 'FLANSCH_80', 'F1', 120, 'offen'],
    [4713, 'WELLE_20H6', 'D2', 300, 'offen'], [4714, 'BUCHSE_30', 'D2', 800, 'fertig'],
    [4715, 'FLANSCH_80', 'F1', 60, 'fertig'], [4716, 'DECKEL_80', 'F1', 200, 'offen'],
    [4717, 'BOLZEN_12', 'D2', 1500, 'offen'], [4718, 'FLANSCH_80', 'F1', 240, 'in Arbeit'],
    [4719, 'WELLE_25K6', 'D2', 150, 'offen'], [4720, 'BUCHSE_30', 'D2', 400, 'offen'],
    [4721, 'DECKEL_80', 'F1', 90, 'fertig'], [4722, 'WELLE_20H6', 'D2', 250, 'fertig']
  ].map(function (a) { return { nr: a[0], teil: a[1], maschine: a[2], menge: a[3], status: a[4] }; });

  /* ── Python-Darstellung ───────────────────────────────────── */
  function pyStr(s) {
    s = String(s);
    if (s.indexOf("'") >= 0 && s.indexOf('"') < 0) return '"' + s.replace(/\\/g, '\\\\') + '"';
    return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }
  function pyRepr(v) { return typeof v === 'number' ? String(v) : pyStr(v); }
  function pyTupel(a) { return '(' + a.map(pyRepr).join(', ') + (a.length === 1 ? ',' : '') + ')'; }

  /* ── (B) Abfrage-Baukasten: Kern ──────────────────────────── */
  function abfrage(o) {
    var sp = SPALTEN.filter(function (c) { return (o.spalten || []).indexOf(c) >= 0; });
    if (!sp.length) sp = SPALTEN.slice();
    var bed = [];
    if (o.maschine) bed.push("maschine = '" + o.maschine + "'");
    if (o.status) bed.push("status = '" + o.status + "'");
    if (o.minMenge > 0) bed.push('menge > ' + o.minMenge);
    var bleibt = [], weg = [];
    AUFTRAEGE.forEach(function (r) {
      var ok = (!o.maschine || r.maschine === o.maschine) && (!o.status || r.status === o.status) && (!(o.minMenge > 0) || r.menge > o.minMenge);
      (ok ? bleibt : weg).push(r);
    });
    var sortiert = bleibt.slice();
    if (o.order === 'asc') sortiert.sort(function (a, b) { return a.menge - b.menge; });
    if (o.order === 'desc') sortiert.sort(function (a, b) { return b.menge - a.menge; });
    var selText = sp.length === SPALTEN.length ? '*' : sp.join(', ');
    var zeilen = [
      { k: 'SELECT', text: 'SELECT ' + selText, stufe: 3 },
      { k: 'FROM', text: 'FROM auftraege', stufe: 1 }
    ];
    if (bed.length) zeilen.push({ k: 'WHERE', text: 'WHERE ' + bed.join(' AND '), stufe: 2 });
    if (o.order) zeilen.push({ k: 'ORDER BY', text: 'ORDER BY menge' + (o.order === 'desc' ? ' DESC' : ''), stufe: 4 });
    return {
      spalten: sp, bedingungen: bed, bleibt: bleibt, weg: weg, sortiert: sortiert, zeilen: zeilen,
      sql: zeilen.map(function (z) { return z.text; }).join('\n'),
      tupel: sortiert.map(function (r) { return sp.map(function (c) { return r[c]; }); })
    };
  }

  /* ── (C) GROUP BY: Kern ───────────────────────────────────── */
  function gruppiere(rows, spalte, agg) {
    var map = {}, keys = [];
    rows.forEach(function (r) {
      var k = r[spalte];
      if (!map.hasOwnProperty(k)) { map[k] = []; keys.push(k); }
      map[k].push(r);
    });
    keys.sort();
    return keys.map(function (k) {
      var g = map[k], summe = 0;
      g.forEach(function (r) { summe += r.menge; });
      var wert = agg === 'sum' ? summe : g.length;
      var formel = agg === 'sum' ? g.map(function (r) { return r.menge; }).join(' + ') + ' = ' + summe : g.length + (g.length === 1 ? ' Zeile' : ' Zeilen');
      return { key: k, rows: g, wert: wert, formel: formel };
    });
  }

  /* ── (E) SQL-Leser für die WHERE-Bedingung ────────────────── */
  var KW = { AND: 1, OR: 1, NOT: 1, SELECT: 1, FROM: 1, WHERE: 1, UNION: 1, ORDER: 1, GROUP: 1, LIMIT: 1, HAVING: 1, NULL: 1, IS: 1, IN: 1, LIKE: 1, BETWEEN: 1, DELETE: 1, DROP: 1, INSERT: 1, UPDATE: 1, CASE: 1, EXISTS: 1, BY: 1, AS: 1 };

  function sqlTokens(s) {
    var toks = [], i = 0, n = s.length, c, m, fehler = null;
    function push(t, v, a, b) { toks.push({ t: t, v: v, raw: s.slice(a, b), pos: a, end: b }); }
    while (i < n) {
      c = s.charAt(i);
      if (/\s/.test(c)) { i++; continue; }
      if (c === '-' && s.charAt(i + 1) === '-') { while (i < n && s.charAt(i) !== '\n') i++; continue; }
      if (c === '/' && s.charAt(i + 1) === '*') { var e = s.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === "'" || c === '"') {
        var q = c, j = i + 1, val = '', zu = false;
        while (j < n) {
          if (s.charAt(j) === q) {
            if (s.charAt(j + 1) === q) { val += q; j += 2; continue; }
            zu = true; break;
          }
          val += s.charAt(j); j++;
        }
        if (!zu) { fehler = { msg: 'unrecognized token: "' + s.slice(i) + '"', pos: i }; break; }
        push(q === "'" ? 'str' : 'dq', val, i, j + 1); i = j + 1; continue;
      }
      if (/[0-9]/.test(c)) {
        m = /^[0-9]+(\.[0-9]+)?/.exec(s.slice(i));
        push('num', Number(m[0]), i, i + m[0].length); i += m[0].length; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
        var up = m[0].toUpperCase();
        push(KW.hasOwnProperty(up) ? 'kw' : 'id', KW.hasOwnProperty(up) ? up : m[0], i, i + m[0].length); i += m[0].length; continue;
      }
      m = /^(<=|>=|<>|!=|==|=|<|>|\(|\)|;|,|\*|\+|-)/.exec(s.slice(i));
      if (m) { push('sym', m[0], i, i + m[0].length); i += m[0].length; continue; }
      fehler = { msg: 'unrecognized token: "' + s.slice(i) + '"', pos: i }; break;
    }
    return { tokens: toks, fehler: fehler };
  }

  /* Parser: Bedingung nach "WHERE", Tokens ab Index start. Wirft {syntax}, {lex}, {incomplete}, {unsupported}, {spaeter}. */
  function parseBedingung(tokens, lexErr, start, quelle) {
    var i = start;
    function peek() { return tokens[i] || null; }
    function fail() {
      var t = peek();
      if (t) throw { syntax: t.raw };
      if (lexErr) throw { lex: lexErr.msg };
      throw { incomplete: true };
    }
    function isKw(t, w) { return !!t && t.t === 'kw' && t.v === w; }
    function primary() {
      var t = peek();
      if (!t) fail();
      if (t.t === 'str' || t.t === 'num' || t.t === 'id' || t.t === 'dq') { i++; return { t: 'prim', tok: t, a: t.pos, b: t.end }; }
      if (t.t === 'sym' && t.v === '-' && tokens[i + 1] && tokens[i + 1].t === 'num') { var z = tokens[i + 1]; i += 2; return { t: 'prim', tok: { t: 'num', v: -z.v, raw: '-' + z.raw }, a: t.pos, b: z.end }; }
      if (t.t === 'sym' && t.v === '(') {
        var a = t.pos; i++;
        var e = orExpr();
        var c = peek();
        if (!(c && c.t === 'sym' && c.v === ')')) fail();
        i++;
        return { t: 'par', e: e, a: a, b: c.end };
      }
      if (t.t === 'kw' && (t.v === 'NULL' || t.v === 'SELECT' || t.v === 'CASE' || t.v === 'EXISTS')) throw { unsupported: true };
      fail();
    }
    function cmp() {
      var l = primary(), t = peek();
      if (t && t.t === 'sym' && /^(=|==|!=|<>|<|>|<=|>=)$/.test(t.v)) {
        i++;
        var r = primary();
        return { t: 'cmp', op: t.v, l: l, r: r, a: l.a, b: r.b };
      }
      if (t && t.t === 'kw' && (t.v === 'LIKE' || t.v === 'IS' || t.v === 'IN' || t.v === 'BETWEEN')) throw { unsupported: true };
      return l;
    }
    function notExpr() {
      var t = peek();
      if (isKw(t, 'NOT')) { i++; var e = notExpr(); return { t: 'not', e: e, a: t.pos, b: e.b }; }
      return cmp();
    }
    function andExpr() {
      var parts = [notExpr()];
      while (isKw(peek(), 'AND')) { i++; parts.push(notExpr()); }
      return parts.length === 1 ? parts[0] : { t: 'and', parts: parts, a: parts[0].a, b: parts[parts.length - 1].b };
    }
    function orExpr() {
      var parts = [andExpr()];
      while (isKw(peek(), 'OR')) { i++; parts.push(andExpr()); }
      return parts.length === 1 ? parts[0] : { t: 'or', parts: parts, a: parts[0].a, b: parts[parts.length - 1].b };
    }
    var baum = orExpr();
    var t = peek();
    if (t && t.t === 'sym' && t.v === ';') {
      i++;
      if (peek()) throw { spaeter: true };
      return baum;
    }
    if (t) {
      if (t.t === 'kw' && (t.v === 'UNION' || t.v === 'ORDER' || t.v === 'GROUP' || t.v === 'LIMIT' || t.v === 'HAVING')) throw { unsupported: true };
      throw { syntax: t.raw };
    }
    if (lexErr) throw { lex: lexErr.msg };
    return baum;
  }

  function numerisch(v) { return typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v); }
  function wertVon(p, row) {
    var t = p.tok;
    if (t.t === 'str' || t.t === 'num') return { v: t.v };
    var name = t.t === 'dq' ? t.v : t.v;
    var col = SPALTEN.indexOf(name) >= 0 ? name : (SPALTEN.indexOf(String(name).toLowerCase()) >= 0 ? String(name).toLowerCase() : null);
    if (!col) {
      if (t.t === 'dq') return { v: t.v };
      throw { spalte: t.raw };
    }
    return { v: row[col], col: col };
  }
  function vergleiche(op, a, b) {
    var x = a.v, y = b.v;
    if (a.col && TYPEN[SPALTEN.indexOf(a.col)] === 'INTEGER' && numerisch(y)) y = Number(y);
    else if (b.col && TYPEN[SPALTEN.indexOf(b.col)] === 'INTEGER' && numerisch(x)) x = Number(x);
    else if (a.col && TYPEN[SPALTEN.indexOf(a.col)] === 'TEXT' && typeof y === 'number') y = String(y);
    else if (b.col && TYPEN[SPALTEN.indexOf(b.col)] === 'TEXT' && typeof x === 'number') x = String(x);
    var c;
    if (typeof x === typeof y) c = x < y ? -1 : (x > y ? 1 : 0);
    else c = typeof x === 'number' ? -1 : 1;
    switch (op) {
      case '=': case '==': return c === 0;
      case '!=': case '<>': return c !== 0;
      case '<': return c < 0;
      case '>': return c > 0;
      case '<=': return c <= 0;
      default: return c >= 0;
    }
  }
  function wahrheit(v) {
    if (typeof v === 'number') return v !== 0;
    var m = /^\s*(-?\d+(\.\d+)?)/.exec(String(v));
    return m ? Number(m[1]) !== 0 : false;
  }
  function wertet(n, row) {
    switch (n.t) {
      case 'cmp': return vergleiche(n.op, wertVon(n.l, row), wertVon(n.r, row));
      case 'prim': return wahrheit(wertVon(n, row).v);
      case 'par': return wertet(n.e, row);
      case 'not': return !wertet(n.e, row);
      case 'and': return n.parts.every(function (p) { return wertet(p, row); });
      default: return n.parts.some(function (p) { return wertet(p, row); });
    }
  }
  /* Segmente für die Anzeige: ohne row die Bedingung zerlegt (Atome als Quelltext), mit row je Atom wahr/falsch */
  function segmente(n, row, quelle) {
    function atom(x) { return row ? [{ k: wertet(x, row) ? 'wahr' : 'falsch', t: wertet(x, row) ? 'wahr' : 'falsch' }] : [{ k: 'atom', t: quelle.slice(x.a, x.b) }]; }
    function wort(t) { return { k: 'op', t: ' ' + t + ' ' }; }
    function rec(x) {
      switch (x.t) {
        case 'cmp': case 'prim': return atom(x);
        case 'par': return [{ k: 'par', t: '(' }].concat(rec(x.e), [{ k: 'par', t: ')' }]);
        case 'not': return [{ k: 'op', t: 'NICHT ' }].concat(rec(x.e));
        default:
          var out = [], w = x.t === 'and' ? 'UND' : 'ODER';
          x.parts.forEach(function (p, j) { if (j) out.push(wort(w)); out = out.concat(rec(p)); });
          return out;
      }
    }
    return rec(n);
  }

  var PREFIX = 'SELECT nr, teil FROM auftraege WHERE ';
  /* Was passiert, wenn der f-String-SQL-Text an sqlite3 geht? */
  function pruefeFstring(eingabe) {
    var sql = PREFIX + "teil = '" + eingabe + "'";
    var lex = sqlTokens(sql), res = { sql: sql, eingabe: eingabe, tokens: lex.tokens, kind: 'ok', zeilen: [], treffer: 0 };
    var baum;
    try {
      baum = parseBedingung(lex.tokens, lex.fehler, 7, sql);
      res.baum = baum;
      res.ausdruck = segmente(baum, null, sql);
      res.zeilen = AUFTRAEGE.map(function (r) { var h = wertet(baum, r); return { row: r, segs: segmente(baum, r, sql), hit: h }; });
      res.treffer = res.zeilen.filter(function (z) { return z.hit; }).length;
    } catch (e) {
      if (e.syntax !== undefined) { res.kind = 'fehler'; res.cls = 'sqlite3.OperationalError'; res.msg = 'near "' + e.syntax + '": syntax error'; }
      else if (e.lex) { res.kind = 'fehler'; res.cls = 'sqlite3.OperationalError'; res.msg = e.lex; }
      else if (e.incomplete) { res.kind = 'fehler'; res.cls = 'sqlite3.OperationalError'; res.msg = 'incomplete input'; }
      else if (e.spalte !== undefined) { res.kind = 'fehler'; res.cls = 'sqlite3.OperationalError'; res.msg = 'no such column: ' + e.spalte; }
      else if (e.spaeter) { res.kind = 'fehler'; res.cls = 'sqlite3.ProgrammingError'; res.msg = 'You can only execute one statement at a time.'; }
      else if (e.unsupported) { res.kind = 'unbekannt'; }
      else throw e;
    }
    return res;
  }
  function pruefePlatzhalter(eingabe) {
    var zeilen = AUFTRAEGE.map(function (r) { var h = r.teil === eingabe; return { row: r, segs: [{ k: h ? 'wahr' : 'falsch', t: h ? 'wahr' : 'falsch' }], hit: h }; });
    return { sql: 'SELECT nr, teil FROM auftraege WHERE teil = ?', eingabe: eingabe, zeilen: zeilen, treffer: zeilen.filter(function (z) { return z.hit; }).length };
  }

  var core = {
    AUFTRAEGE: AUFTRAEGE, SPALTEN: SPALTEN, abfrage: abfrage, gruppiere: gruppiere, pyStr: pyStr, pyRepr: pyRepr, pyTupel: pyTupel,
    sqlTokens: sqlTokens, pruefeFstring: pruefeFstring, pruefePlatzhalter: pruefePlatzhalter
  };

  /* ── DOM-Helfer ──────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  var uid = 0;
  function nextId(p) { uid++; return p + uid; }
  function btn(text, cls, fn) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || ''), text: text });
    b.addEventListener('click', fn); return b;
  }
  /* Segment-Auswahl (Gruppe von Umschaltknöpfen). opts: [{t, v}] */
  function segment(host, label, opts, startIdx, onchange) {
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v19-lbl', text: label })]);
    var seg = el('div', { class: 'k-seg v19-seg', role: 'group', 'aria-label': label });
    var btns = opts.map(function (o, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === startIdx ? 'true' : 'false', text: o.t });
      b.addEventListener('click', function () { set(i); onchange(o.v, i); });
      seg.appendChild(b); return b;
    });
    function set(i) { btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    wrap.appendChild(seg); host.appendChild(wrap);
    return { set: set };
  }
  function zl(n) { return n + (n === 1 ? ' Zeile' : ' Zeilen'); }
  function pre(text, cls) { return el('pre', { class: cls || 'v19-py', 'data-run': 'no', text: text }); }
  function tabelle(spaltenKoepfe, zeilenZellen, cls) {
    var t = el('table', { class: 'v19-grid ' + (cls || '') });
    var thead = el('thead'), tr = el('tr');
    spaltenKoepfe.forEach(function (h) { tr.appendChild(h); });
    thead.appendChild(tr); t.appendChild(thead);
    var tb = el('tbody');
    zeilenZellen.forEach(function (z) { tb.appendChild(z); });
    t.appendChild(tb);
    return t;
  }

  /* ══════════════════════════════════════════════════════════
     (A) Tabelle auftraege
     ══════════════════════════════════════════════════════════ */
  var BEGRIFFE = [
    { id: 'tabelle', t: 'Tabelle' }, { id: 'zeile', t: 'Zeile (Datensatz)' }, { id: 'spalte', t: 'Spalte' },
    { id: 'pk', t: 'Primärschlüssel' }, { id: 'typ', t: 'Datentyp' }
  ];
  function initTabelle(host) {
    var st = { b: 'tabelle', zeile: 2, spalte: 3 };
    var ctl = el('div', { class: 'k-controls v19-ctl' });
    var segBtns = [];
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v19-lbl', text: 'Begriff' })]);
    var seg = el('div', { class: 'k-seg v19-seg', role: 'group', 'aria-label': 'Begriff wählen' });
    BEGRIFFE.forEach(function (b, i) {
      var bt = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: b.t });
      bt.addEventListener('click', function () { st.b = b.id; zeichne(); });
      seg.appendChild(bt); segBtns.push(bt);
    });
    wrap.appendChild(seg); ctl.appendChild(wrap);
    var idZ = nextId('v19-zeile-'), idS = nextId('v19-spalte-');
    var selZ = el('select', { id: idZ });
    AUFTRAEGE.forEach(function (r, i) { selZ.appendChild(el('option', { value: String(i), text: 'Auftrag ' + r.nr })); });
    selZ.value = String(st.zeile);
    var fz = el('div', { class: 'k-field' }, [el('label', { class: 'v19-lbl', for: idZ, text: 'Zeile' }), selZ]);
    var selS = el('select', { id: idS });
    SPALTEN.forEach(function (c, i) { selS.appendChild(el('option', { value: String(i), text: c })); });
    selS.value = String(st.spalte);
    var fs = el('div', { class: 'k-field' }, [el('label', { class: 'v19-lbl', for: idS, text: 'Spalte' }), selS]);
    ctl.appendChild(fz); ctl.appendChild(fs);
    host.appendChild(ctl);
    selZ.addEventListener('change', function () { st.zeile = +selZ.value; zeichne(); });
    selS.addEventListener('change', function () { st.spalte = +selS.value; zeichne(); });
    var tw = el('div', { class: 'k-tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Tabelle auftraege, bei schmalem Bildschirm seitlich scrollbar' });
    host.appendChild(tw);
    var info = el('p', { class: 'v19-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(info);

    function zeichne() {
      segBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', BEGRIFFE[i].id === st.b ? 'true' : 'false'); });
      fz.hidden = st.b !== 'zeile'; fs.hidden = st.b !== 'spalte';
      var koepfe = SPALTEN.map(function (c, j) {
        var th = el('th', { scope: 'col' });
        th.appendChild(el('span', { text: c }));
        if (st.b === 'typ') th.appendChild(el('span', { class: 'v19-typ', text: TYPEN[j] }));
        if (st.b === 'pk' && j === 0) th.appendChild(el('span', { class: 'v19-typ', text: 'PRIMARY KEY' }));
        th.className = (st.b === 'spalte' && j === st.spalte) || (st.b === 'pk' && j === 0) || st.b === 'typ' ? 'is-hit' : '';
        return th;
      });
      var zellen = AUFTRAEGE.map(function (r, i) {
        var tr = el('tr', { class: st.b === 'zeile' && i === st.zeile ? 'is-hit' : '' });
        SPALTEN.forEach(function (c, j) {
          var td = el('td', { text: String(r[c]) });
          var hit = (st.b === 'spalte' && j === st.spalte) || (st.b === 'pk' && j === 0) || st.b === 'tabelle' || (st.b === 'zeile' && i === st.zeile);
          if (hit) td.className = 'is-hit';
          if (st.b === 'typ') td.className = TYPEN[j] === 'INTEGER' ? 'is-num' : '';
          tr.appendChild(td);
        });
        return tr;
      });
      clear(tw);
      var t = tabelle(koepfe, zellen, st.b === 'tabelle' ? 'is-alle' : '');
      t.setAttribute('aria-label', 'Tabelle auftraege mit zwölf Zeilen und fünf Spalten');
      tw.appendChild(t);
      var r = AUFTRAEGE[st.zeile], c = SPALTEN[st.spalte];
      var text = {
        tabelle: 'Die Tabelle heißt auftraege. Sie sammelt alle Aufträge der Zelle unter einem Namen, wie ein Tabellenblatt in Excel: hier zwölf Zeilen und fünf Spalten.',
        zeile: 'Eine Zeile (Datensatz) ist ein einzelner Auftrag: Nr. ' + r.nr + ', ' + r.teil + ', Maschine ' + r.maschine + ', ' + r.menge + ' Stück, Status „' + r.status + '“. Die fünf Werte gehören zusammen. Python liefert sie als Tupel: ' + pyTupel(SPALTEN.map(function (s) { return r[s]; })) + '.',
        spalte: 'Die Spalte ' + c + ' hat für alle Zeilen denselben Namen und denselben Datentyp (' + TYPEN[st.spalte] + '): ' + (TYPEN[st.spalte] === 'INTEGER' ? 'nur ganze Zahlen.' : 'Text.') + ' Die Spaltennamen schreibst du später in SELECT.',
        pk: 'Die Spalte nr ist der Primärschlüssel: Jeder Wert kommt genau einmal vor, wie eine Seriennummer. Damit ist jede Zeile eindeutig ansprechbar („Auftrag 4713“). Ein zweiter Auftrag 4711 wird abgelehnt: sqlite3.IntegrityError: UNIQUE constraint failed: auftraege.nr.',
        typ: 'Jede Spalte hat einen Datentyp: INTEGER (ganze Zahl), TEXT (Zeichenkette) oder REAL (Gleitkommazahl). Zahlen sind rechts ausgerichtet. nr und menge sind INTEGER, teil, maschine und status sind TEXT.'
      }[st.b];
      info.textContent = text;
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Abfrage-Baukasten
     ══════════════════════════════════════════════════════════ */
  var STUFEN = ['', 'FROM', 'WHERE', 'SELECT', 'ORDER BY'];
  function initAbfrage(host) {
    var st = { spalten: ['nr', 'teil', 'menge'], maschine: '', status: '', minMenge: 0, order: '', stufe: 4, ganz: true };

    var ctl = el('div', { class: 'k-controls v19-ctl' });
    var fsSp = el('fieldset', { class: 'v19-fs' }, [el('legend', { class: 'v19-lbl', text: 'Spalten (SELECT)' })]);
    var cbs = SPALTEN.map(function (c) {
      var id = nextId('v19-sp-');
      var cb = el('input', { type: 'checkbox', id: id });
      cb.checked = st.spalten.indexOf(c) >= 0;
      cb.addEventListener('change', function () {
        var neu = SPALTEN.filter(function (x, i) { return cbs[i].checked; });
        if (!neu.length) { cb.checked = true; meldung.textContent = 'Mindestens eine Spalte muss gewählt bleiben.'; return; }
        meldung.textContent = '';
        st.spalten = neu; zeichne();
      });
      fsSp.appendChild(el('label', { class: 'v19-cb', for: id }, [cb, el('span', { text: c })]));
      return cb;
    });
    ctl.appendChild(fsSp);
    segment(ctl, 'WHERE maschine', [{ t: 'alle', v: '' }, { t: 'D2', v: 'D2' }, { t: 'F1', v: 'F1' }], 0, function (v) { st.maschine = v; zeichne(); });
    segment(ctl, 'WHERE status', [{ t: 'alle', v: '' }, { t: 'offen', v: 'offen' }, { t: 'in Arbeit', v: 'in Arbeit' }, { t: 'fertig', v: 'fertig' }], 0, function (v) { st.status = v; zeichne(); });
    var idM = nextId('v19-menge-');
    var rng = el('input', { type: 'range', id: idM, class: 'v19-range', min: '0', max: '1500', step: '50', value: '0' });
    var mOut = el('output', { class: 'v19-out', for: idM, text: 'aus' });
    rng.addEventListener('input', function () { st.minMenge = +rng.value; zeichne(); });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { class: 'v19-lbl', for: idM, text: 'WHERE menge größer als (0 = aus)' }), el('div', { class: 'v19-rangewrap' }, [rng, mOut])]));
    segment(ctl, 'ORDER BY', [{ t: 'keine', v: '' }, { t: 'menge aufsteigend', v: 'asc' }, { t: 'menge absteigend', v: 'desc' }], 0, function (v) { st.order = v; zeichne(); });
    host.appendChild(ctl);
    var meldung = el('p', { class: 'v19-err k-small', role: 'status', 'aria-live': 'polite' });
    host.appendChild(meldung);

    var bar = el('div', { class: 'k-presets v19-ctl' });
    var bStep = btn('Schritt für Schritt starten', '', function () {
      if (st.ganz || st.stufe >= 4) { st.ganz = false; st.stufe = 1; } else st.stufe++;
      zeichne();
    });
    var bGanz = btn('Ganz anzeigen', 'k-btn--ghost', function () { st.ganz = true; st.stufe = 4; zeichne(); });
    bar.appendChild(bStep); bar.appendChild(bGanz);
    host.appendChild(bar);

    var sqlBox = el('pre', { class: 'v19-sql', 'data-run': 'no', 'aria-label': 'Der entstehende SQL-Text' });
    host.appendChild(sqlBox);
    var cap = el('p', { class: 'v19-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(cap);
    var tw = el('div', { class: 'k-tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Zwischenergebnis der Abfrage, bei schmalem Bildschirm seitlich scrollbar' });
    host.appendChild(tw);
    host.appendChild(el('p', { class: 'v19-lbl', text: 'So sieht Python das Ergebnis (cur.fetchall()):' }));
    var pyBox = el('pre', { class: 'v19-py', 'data-run': 'no', 'aria-label': 'Ergebnis als Liste von Tupeln' });
    host.appendChild(pyBox);

    function zeichne() {
      var q = abfrage(st);
      mOut.textContent = st.minMenge > 0 ? '> ' + st.minMenge : 'aus';
      rng.setAttribute('aria-valuetext', st.minMenge > 0 ? 'menge größer als ' + st.minMenge : 'aus');
      var stufe = st.stufe;
      bStep.textContent = st.ganz ? 'Schritt für Schritt starten' : (stufe >= 4 ? 'Noch einmal von vorn' : 'Weiter: ' + STUFEN[stufe + 1]);
      // SQL-Text: Zeilen in geschriebener Reihenfolge, Auswertungsschritt dahinter
      clear(sqlBox);
      q.zeilen.forEach(function (z) {
        var cur = !st.ganz && z.stufe === stufe;
        var l = el('span', { class: 'v19-sqlline' + (cur ? ' is-cur' : '') + (!st.ganz && z.stufe > stufe ? ' is-spaeter' : '') });
        if (cur) l.setAttribute('aria-current', 'step');
        l.appendChild(document.createTextNode(z.text));
        l.appendChild(el('span', { class: 'v19-nr', text: '   Schritt ' + z.stufe }));
        sqlBox.appendChild(l);
      });
      // Tabelle je Stufe
      var zeigeAlleZeilen = stufe <= 2;
      var zeigeSpaltenWeg = stufe === 3;
      var nurGewaehlt = stufe >= 4;
      var rows = stufe <= 1 ? AUFTRAEGE : (stufe === 2 ? AUFTRAEGE : (stufe === 3 ? q.bleibt : q.sortiert));
      var hatWhere = q.bedingungen.length > 0;
      var koepfe = [];
      SPALTEN.forEach(function (c) {
        var gew = q.spalten.indexOf(c) >= 0;
        if (nurGewaehlt && !gew) return;
        var th = el('th', { scope: 'col', class: zeigeSpaltenWeg && !gew ? 'is-weg' : '' });
        th.appendChild(el('span', { text: c }));
        if (zeigeSpaltenWeg && !gew) th.appendChild(el('span', { class: 'v19-typ', text: 'fällt weg' }));
        if (nurGewaehlt && c === 'menge' && st.order) th.appendChild(el('span', { class: 'v19-typ', text: st.order === 'asc' ? 'aufsteigend' : 'absteigend' }));
        koepfe.push(th);
      });
      if (stufe === 2) koepfe.push(el('th', { scope: 'col', text: 'WHERE' }));
      var zellen = rows.map(function (r) {
        var ok = q.bleibt.indexOf(r) >= 0;
        var tr = el('tr', { class: stufe === 2 && !ok ? 'is-weg' : '' });
        SPALTEN.forEach(function (c) {
          var gew = q.spalten.indexOf(c) >= 0;
          if (nurGewaehlt && !gew) return;
          tr.appendChild(el('td', { class: (zeigeSpaltenWeg && !gew ? 'is-weg ' : '') + (typeof r[c] === 'number' ? 'is-num' : ''), text: String(r[c]) }));
        });
        if (stufe === 2) tr.appendChild(el('td', { text: ok ? 'bleibt' : 'fällt weg' }));
        return tr;
      });
      clear(tw);
      var tb = tabelle(koepfe, zellen);
      tb.setAttribute('aria-label', 'Zwischenergebnis nach Schritt ' + stufe);
      tw.appendChild(tb);
      if (!zellen.length) tw.appendChild(el('p', { class: 'v19-leer', text: 'Keine Zeile erfüllt die Bedingung: Das Ergebnis ist eine leere Liste.' }));
      // Beschriftung
      var n = AUFTRAEGE.length, k = q.bleibt.length, txt;
      if (stufe <= 1) txt = 'FROM auftraege: Die Datenbank beginnt mit der ganzen Tabelle, ' + n + ' Zeilen und 5 Spalten.';
      else if (stufe === 2) txt = hatWhere ? 'WHERE ' + q.bedingungen.join(' AND ') + ': Jede Zeile wird geprüft. ' + (k === 1 ? 'Eine Zeile bleibt, ' : k + ' Zeilen bleiben, ') + (n - k === 1 ? 'eine fällt weg' : (n - k) + ' fallen weg') + ' (durchgestrichen).' : 'Ohne WHERE fällt keine Zeile weg: Alle ' + n + ' Zeilen bleiben.';
      else if (stufe === 3) txt = q.spalten.length === SPALTEN.length ? 'SELECT *: Alle fünf Spalten bleiben erhalten, es fällt nichts weg.' : 'SELECT ' + q.spalten.join(', ') + ': Von den verbleibenden ' + zl(k) + ' werden nur diese Spalten behalten. Die anderen fallen weg.';
      else txt = (st.order ? 'ORDER BY menge' + (st.order === 'desc' ? ' DESC' : '') + ': Die Zeilen werden nach der Menge sortiert.' : 'Ohne ORDER BY bleibt die Reihenfolge, wie die Datenbank sie liefert. Sie ist nicht garantiert: Wenn die Reihenfolge wichtig ist, schreib ORDER BY.') + ' Ergebnis: ' + k + (k === 1 ? ' Zeile' : ' Zeilen') + ', ' + q.spalten.length + (q.spalten.length === 1 ? ' Spalte.' : ' Spalten.');
      cap.textContent = st.ganz ? 'Ergebnis der ganzen Abfrage: ' + k + (k === 1 ? ' Zeile' : ' Zeilen') + ', ' + q.spalten.length + (q.spalten.length === 1 ? ' Spalte.' : ' Spalten.') + ' Mit „Schritt für Schritt“ siehst du, in welcher Reihenfolge die Datenbank rechnet.' : txt;
      // Python-Sicht
      if (st.ganz || stufe >= 4) {
        pyBox.textContent = q.tupel.length ? '[' + q.tupel.map(pyTupel).join(',\n ') + ']' : '[]';
      } else pyBox.textContent = '(erst nach dem letzten Schritt)';
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (C) GROUP BY
     ══════════════════════════════════════════════════════════ */
  function initGruppe(host) {
    var st = { menge: 5, spalte: 'maschine', agg: 'sum', stufe: 4, ganz: true };
    var ctl = el('div', { class: 'k-controls v19-ctl' });
    segment(ctl, 'Aufträge', [{ t: 'die 5 aus dem Beispiel', v: 5 }, { t: 'alle 12', v: 12 }], 0, function (v) { st.menge = v; zeichne(); });
    segment(ctl, 'GROUP BY', [{ t: 'maschine', v: 'maschine' }, { t: 'status', v: 'status' }], 0, function (v) { st.spalte = v; zeichne(); });
    segment(ctl, 'Rechnen je Fach', [{ t: 'SUM(menge)', v: 'sum' }, { t: 'COUNT(*)', v: 'count' }], 0, function (v) { st.agg = v; zeichne(); });
    host.appendChild(ctl);
    var bar = el('div', { class: 'k-presets v19-ctl' });
    var bStep = btn('Schritt für Schritt starten', '', function () {
      if (st.ganz || st.stufe >= 4) { st.ganz = false; st.stufe = 1; } else st.stufe++;
      zeichne();
    });
    bar.appendChild(bStep);
    bar.appendChild(btn('Ganz anzeigen', 'k-btn--ghost', function () { st.ganz = true; st.stufe = 4; zeichne(); }));
    host.appendChild(bar);
    var sqlBox = el('pre', { class: 'v19-sql', 'data-run': 'no', 'aria-label': 'Der SQL-Text' });
    host.appendChild(sqlBox);
    var cap = el('p', { class: 'v19-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(cap);
    var zone = el('div', { class: 'v19-zone' });
    host.appendChild(zone);
    host.appendChild(el('p', { class: 'v19-lbl', text: 'So sieht Python das Ergebnis (cur.fetchall()):' }));
    var pyBox = el('pre', { class: 'v19-py', 'data-run': 'no', 'aria-label': 'Ergebnis als Liste von Tupeln' });
    host.appendChild(pyBox);
    var NEXT = ['', 'FROM', 'GROUP BY', 'SELECT', 'Ergebnis'];

    function zeichne() {
      var rows = AUFTRAEGE.slice(0, st.menge);
      var gr = gruppiere(rows, st.spalte, st.agg);
      var stufe = st.stufe;
      var aggTxt = st.agg === 'sum' ? 'SUM(menge)' : 'COUNT(*)';
      bStep.textContent = st.ganz ? 'Schritt für Schritt starten' : (stufe >= 4 ? 'Noch einmal von vorn' : 'Weiter: ' + NEXT[stufe + 1]);
      var zeilen = [
        { t: 'SELECT ' + st.spalte + ', ' + aggTxt, s: 3 }, { t: 'FROM auftraege', s: 1 }, { t: 'GROUP BY ' + st.spalte, s: 2 }
      ];
      clear(sqlBox);
      zeilen.forEach(function (z) {
        var cur = !st.ganz && z.s === stufe;
        var l = el('span', { class: 'v19-sqlline' + (cur ? ' is-cur' : '') + (!st.ganz && z.s > stufe ? ' is-spaeter' : '') });
        if (cur) l.setAttribute('aria-current', 'step');
        l.appendChild(document.createTextNode(z.t));
        l.appendChild(el('span', { class: 'v19-nr', text: '   Schritt ' + z.s }));
        sqlBox.appendChild(l);
      });
      clear(zone);
      // Ausgangsliste
      var quelle = el('div', { class: 'v19-quelle' });
      quelle.appendChild(el('p', { class: 'v19-lbl', text: 'Tabelle auftraege (' + rows.length + ' Zeilen: nr · ' + st.spalte + ' · menge)' }));
      var chips = el('div', { class: 'v19-chips' });
      rows.forEach(function (r) {
        chips.appendChild(el('span', { class: 'v19-chip' + (stufe >= 2 && !st.ganz ? ' is-leer' : '') + (st.ganz ? ' is-leer' : ''), text: r.nr + ' · ' + r[st.spalte] + ' · ' + r.menge }));
      });
      quelle.appendChild(chips);
      if (st.ganz || stufe >= 2) quelle.appendChild(el('p', { class: 'k-small k-muted', text: 'Diese Zeilen sind jetzt in die Fächer unten sortiert.' }));
      zone.appendChild(quelle);
      if (st.ganz || stufe >= 2) {
        var bins = el('div', { class: 'v19-bins', role: 'list', 'aria-label': 'Fächer, eines je Wert von ' + st.spalte });
        gr.forEach(function (g) {
          var bin = el('div', { class: 'v19-bin', role: 'listitem' });
          bin.appendChild(el('p', { class: 'v19-bin__h', text: st.spalte + ' = ' + g.key + ' (' + g.rows.length + (g.rows.length === 1 ? ' Zeile' : ' Zeilen') + ')' }));
          var cs = el('div', { class: 'v19-chips' });
          g.rows.forEach(function (r) { cs.appendChild(el('span', { class: 'v19-chip', text: r.nr + ' · ' + r.menge })); });
          bin.appendChild(cs);
          if (st.ganz || stufe >= 3) bin.appendChild(el('p', { class: 'v19-bin__f', text: aggTxt + ': ' + g.formel }));
          bins.appendChild(bin);
        });
        zone.appendChild(bins);
      }
      var tup = gr.map(function (g) { return [g.key, g.wert]; });
      var txt;
      if (stufe <= 1) txt = 'FROM auftraege: Die Datenbank liest alle ' + rows.length + ' Zeilen.';
      else if (stufe === 2) txt = 'GROUP BY ' + st.spalte + ': Für jeden vorkommenden Wert entsteht ein Fach (hier ' + gr.length + '), und jede Zeile wandert in das Fach ihres Werts. Es gehen keine Zeilen verloren.';
      else if (stufe === 3) txt = 'SELECT ' + st.spalte + ', ' + aggTxt + ': Jedes Fach wird zu einer einzigen Zeile zusammengerechnet. Eine solche Funktion, die viele Werte zu einem macht, heißt Aggregatfunktion.';
      else txt = 'Ergebnis: eine Zeile je Fach, also ' + gr.length + ' Zeilen statt ' + rows.length + '. Die Reihenfolge der Fächer ist nicht garantiert; wenn sie wichtig ist, schreib ORDER BY.';
      cap.textContent = st.ganz ? 'Ergebnis: ' + gr.length + ' Zeilen: ' + tup.map(pyTupel).join(', ') + '.' : txt;
      pyBox.textContent = (st.ganz || stufe >= 4) ? '[' + tup.map(pyTupel).join(', ') + ']' : '(erst nach dem letzten Schritt)';
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Ablauf in Python
     ══════════════════════════════════════════════════════════ */
  var ABLAUF_CODE = [
    'db = sqlite3.connect("fz3.db")',
    'cur = db.cursor()',
    'cur.execute("SELECT nr, teil FROM auftraege WHERE maschine = ? AND status = ?", ("F1", "offen"))',
    'zeilen = cur.fetchall()',
    'cur.execute("UPDATE auftraege SET status = ? WHERE nr = ?", ("in Arbeit", 4712))',
    'db.commit()',
    'db.close()'
  ];
  var ABLAUF = [
    { v: 'zu', c: 'noch keiner', a: 'nichts', t: 'Noch passiert nichts. Python und die Datenbankdatei kennen einander nicht. „Weiter“ führt die erste Zeile aus.' },
    { v: 'offen (Datei fz3.db)', c: 'noch keiner', a: 'nichts', t: 'connect öffnet die Datenbankdatei und gibt ein Verbindungsobjekt zurück (hier db). Gibt es die Datei nicht, legt SQLite sie an. Mit ":memory:" statt eines Dateinamens liegt die Datenbank nur im Arbeitsspeicher.' },
    { v: 'offen (Datei fz3.db)', c: 'bereit', a: 'nichts', t: 'Der Cursor ist dein Zeiger in der Datenbank: Über ihn schickst du Befehle und holst Ergebnisse ab. Er entsteht aus der Verbindung.' },
    { v: 'offen (Datei fz3.db)', c: 'Abfrage gesendet, Ergebnis wartet', a: 'nichts', t: 'execute schickt den SQL-Text an die Datenbank. Die Platzhalter ? werden mit dem Tupel getrennt davon gefüllt. Die Datenbank findet zwei Zeilen (4712 und 4716), liefert sie aber noch nicht aus.' },
    { v: 'offen (Datei fz3.db)', c: 'Ergebnis abgeholt', a: 'nichts', t: 'fetchall holt alle Zeilen ab und gibt sie als Liste von Tupeln zurück: [(4712, \'FLANSCH_80\'), (4716, \'DECKEL_80\')]. Gelesen wurde nur, die Datenbank hat sich nicht verändert.' },
    { v: 'offen (Datei fz3.db)', c: 'Änderung gesendet', a: 'vorgemerkt, noch nicht gespeichert', t: 'Das UPDATE ändert die Zeile von Auftrag 4712, aber zunächst nur vorläufig: Eine Transaktion hat begonnen. Andere sehen die Änderung noch nicht, und bei einem Absturz wäre sie weg.' },
    { v: 'offen (Datei fz3.db)', c: 'bereit', a: 'dauerhaft gespeichert', t: 'commit macht die vorgemerkte Änderung endgültig. Erst jetzt steht in der Datei, dass 4712 „in Arbeit“ ist. Ohne commit wäre die Änderung nach close() verloren.' },
    { v: 'geschlossen', c: 'nicht mehr nutzbar', a: 'dauerhaft gespeichert', t: 'close beendet die Verbindung. Danach funktionieren db und cur nicht mehr. Wer die Änderung vorher nicht per commit bestätigt hat, verliert sie.' }
  ];
  function initAblauf(host) {
    var st = { i: 0 };
    var two = el('div', { class: 'v19-two' });
    var codeBox = el('pre', { class: 'v19-py v19-ablauf', 'data-run': 'no', 'aria-label': 'Die sieben Zeilen des Ablaufs' });
    var right = el('div', { class: 'v19-panel' });
    two.appendChild(codeBox); two.appendChild(right);
    host.appendChild(two);
    var bar = el('div', { class: 'k-presets v19-ctl' });
    var bZ = btn('Zurück', 'k-btn--ghost', function () { if (st.i > 0) { st.i--; zeichne(); } });
    var bW = btn('Weiter', '', function () { if (st.i < ABLAUF.length - 1) { st.i++; zeichne(); } });
    var bV = btn('Von vorn', 'k-btn--ghost', function () { st.i = 0; zeichne(); });
    bar.appendChild(bZ); bar.appendChild(bW); bar.appendChild(bV);
    host.appendChild(bar);

    function zeichne() {
      var a = ABLAUF[st.i];
      clear(codeBox);
      ABLAUF_CODE.forEach(function (z, j) {
        var l = el('span', { class: 'v19-sqlline' + (j === st.i - 1 ? ' is-cur' : '') + (j > st.i - 1 ? ' is-spaeter' : '') });
        if (j === st.i - 1) l.setAttribute('aria-current', 'step');
        l.appendChild(document.createTextNode(z));
        codeBox.appendChild(l);
      });
      clear(right);
      right.appendChild(el('p', { class: 'v19-ptitle', text: st.i === 0 ? 'Start' : 'Schritt ' + st.i + ' von ' + (ABLAUF.length - 1) }));
      var dl = el('dl', { class: 'v19-dl' });
      [['Verbindung', a.v], ['Cursor', a.c], ['Änderungen', a.a]].forEach(function (p) {
        dl.appendChild(el('dt', { text: p[0] })); dl.appendChild(el('dd', { text: p[1] }));
      });
      right.appendChild(dl);
      right.appendChild(el('p', { class: 'v19-verdict', role: 'status', 'aria-live': 'polite', text: a.t }));
      bZ.disabled = st.i === 0; bW.disabled = st.i === ABLAUF.length - 1;
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (E) SQL-Injection
     ══════════════════════════════════════════════════════════ */
  var VORSCHLAEGE = [
    { t: 'FLANSCH_80', v: 'FLANSCH_80' }, { t: "x' OR '1'='1", v: "x' OR '1'='1" },
    { t: "O'Brien", v: "O'Brien" }, { t: "'; DELETE FROM auftraege; --", v: "'; DELETE FROM auftraege; --" }
  ];
  function segFragment(segs) {
    var f = document.createDocumentFragment();
    segs.forEach(function (s) { f.appendChild(el('span', { class: 'v19-sg v19-sg--' + s.k, text: s.t })); });
    return f;
  }
  function initInjektion(host) {
    var st = { eingabe: 'FLANSCH_80', stufe: 3, ganz: true };
    var id = nextId('v19-inj-');
    var inp = el('input', { type: 'text', id: id, class: 'v19-text', value: st.eingabe, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    var ctl = el('div', { class: 'k-controls v19-ctl' });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { class: 'v19-lbl', for: id, text: 'Suchfeld „Teil suchen“' }), inp]));
    host.appendChild(ctl);
    host.appendChild(el('p', { class: 'v19-lbl', text: 'Vorschläge zum Einsetzen:' }));
    var pres = el('div', { class: 'k-presets v19-ctl' });
    VORSCHLAEGE.forEach(function (v) {
      var b = el('button', { type: 'button', class: 'k-chip', text: v.t });
      b.addEventListener('click', function () { st.eingabe = v.v; inp.value = v.v; zeichne(); });
      pres.appendChild(b);
    });
    host.appendChild(pres);
    inp.addEventListener('input', function () { st.eingabe = inp.value; zeichne(); });
    var bar = el('div', { class: 'k-presets v19-ctl' });
    var bStep = btn('Schritt für Schritt starten', '', function () {
      if (st.ganz || st.stufe >= 3) { st.ganz = false; st.stufe = 1; } else st.stufe++;
      zeichne();
    });
    bar.appendChild(bStep);
    bar.appendChild(btn('Ganz anzeigen', 'k-btn--ghost', function () { st.ganz = true; st.stufe = 3; zeichne(); }));
    host.appendChild(bar);
    var cap = el('p', { class: 'v19-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(cap);
    var two = el('div', { class: 'v19-two' });
    var links = el('div', { class: 'v19-panel' }), rechts = el('div', { class: 'v19-panel' });
    two.appendChild(links); two.appendChild(rechts);
    host.appendChild(two);
    var NEXT = ['', 'Text zusammenbauen', 'SQL-Text lesen', 'Zeilen prüfen'];
    var STEPTXT = [
      '',
      'Schritt 1: Beide Seiten bauen ihre Abfrage. Links wird die Eingabe mit f"…" direkt in den SQL-Text geklebt, rechts bleibt der SQL-Text fest und hat nur die Lücke ?.',
      'Schritt 2: Die Datenbank liest den Text. Links entscheidet sie bei jedem Anführungszeichen neu, wo Text (Daten) endet und SQL-Befehl beginnt. Rechts ist der Wert nie Teil des Textes.',
      'Schritt 3: Für jede der zwölf Zeilen wird die Bedingung ausgewertet.'
    ];

    function zeichne() {
      var stufe = st.stufe, e = st.eingabe;
      bStep.textContent = st.ganz ? 'Schritt für Schritt starten' : (stufe >= 3 ? 'Noch einmal von vorn' : 'Weiter: ' + NEXT[stufe + 1]);
      var f = pruefeFstring(e), p = pruefePlatzhalter(e);
      var zeigeText = st.ganz || stufe >= 1, zeigeTok = st.ganz || stufe >= 2, zeigeRows = st.ganz || stufe >= 3;

      // ─ links: f-String
      clear(links);
      links.appendChild(el('h4', { class: 'v19-h4', text: 'f-String (unsicher)' }));
      links.appendChild(pre('eingabe = ' + pyStr(e) + '\nsql = f"SELECT nr, teil FROM auftraege WHERE teil = \'{eingabe}\'"\ncur.execute(sql)'));
      if (zeigeText) {
        links.appendChild(el('p', { class: 'v19-lbl', text: 'Der SQL-Text, den die Datenbank bekommt (deine Eingabe ist unterstrichen):' }));
        var sq = el('pre', { class: 'v19-sql', 'data-run': 'no' });
        sq.appendChild(document.createTextNode(PREFIX + "teil = '"));
        sq.appendChild(el('mark', { class: 'v19-eingabe', text: e }));
        sq.appendChild(document.createTextNode("'"));
        links.appendChild(sq);
      }
      if (zeigeTok) {
        if (f.kind === 'unbekannt') {
          links.appendChild(el('p', { class: 'v19-lbl', text: 'Diese kleine Simulation versteht nur Bedingungen mit =, <, >, AND, OR, NOT und Klammern. Probiere einen der Vorschläge.' }));
        } else {
          links.appendChild(el('p', { class: 'v19-lbl', text: 'So liest die Datenbank den Text: umrandet = Text (Daten), fett = SQL-Befehl.' }));
          var tk = el('p', { class: 'v19-toks' });
          var lex = f.tokens;
          lex.forEach(function (t, j) {
            if (j < 7) return;
            var istText = t.t === 'str' || t.t === 'num';
            tk.appendChild(el('span', { class: 'v19-tk ' + (istText ? 'v19-tk--text' : 'v19-tk--code'), text: t.raw }));
            tk.appendChild(document.createTextNode(' '));
          });
          links.appendChild(tk);
          if (f.kind === 'ok') {
            links.appendChild(el('p', { class: 'v19-lbl', text: 'Die Bedingung, so wie sie jetzt dasteht (jede Teilbedingung in eckigen Klammern):' }));
            var ausd = el('p', { class: 'v19-expr' });
            ausd.appendChild(segFragment(f.ausdruck.map(function (s) { return s.k === 'atom' ? { k: 'atom', t: '[' + s.t + ']' } : s; })));
            links.appendChild(ausd);
          }
        }
      }
      if (f.kind === 'fehler' && (st.ganz || stufe >= 2)) {
        var fe = el('p', { class: 'v19-verdict is-bad' });
        fe.appendChild(el('strong', { text: 'Fehler: ' }));
        fe.appendChild(document.createTextNode(f.cls + ': ' + f.msg.replace(/\.$/, '') + '. ' + (f.cls === 'sqlite3.ProgrammingError' ? 'sqlite3.execute führt nur eine Anweisung aus, deshalb scheitert dieser Angriff hier. Andere Schnittstellen und Datenbanken erlauben mehrere Anweisungen: Verlass dich nicht darauf.' : 'Das Anführungszeichen in den Daten beendet den Text mitten im Namen: Der Rest steht als SQL-Code da und ergibt Unsinn.')));
        links.appendChild(fe);
      }
      if (f.kind === 'ok' && zeigeRows) links.appendChild(zeilenTabelle(f.zeilen, 'Bedingung je Zeile (links)'));
      if (f.kind === 'ok' && (st.ganz || stufe >= 3)) {
        var vl = el('p', { class: 'v19-verdict ' + (f.treffer === AUFTRAEGE.length ? 'is-bad' : 'is-info') });
        vl.appendChild(el('strong', { text: f.treffer + ' Treffer' }));
        vl.appendChild(document.createTextNode(f.treffer === AUFTRAEGE.length ? ': alle Aufträge, obwohl niemand ein Teil mit diesem Namen gesucht hat.' : '.'));
        links.appendChild(vl);
      }

      // ─ rechts: Platzhalter
      clear(rechts);
      rechts.appendChild(el('h4', { class: 'v19-h4', text: 'Platzhalter ? (sicher)' }));
      rechts.appendChild(pre('eingabe = ' + pyStr(e) + '\ncur.execute("SELECT nr, teil FROM auftraege WHERE teil = ?", (eingabe,))'));
      if (zeigeText) {
        rechts.appendChild(el('p', { class: 'v19-lbl', text: 'Der SQL-Text bleibt fest. Der Wert geht getrennt mit (als Daten):' }));
        var sq2 = el('pre', { class: 'v19-sql', 'data-run': 'no' });
        sq2.appendChild(document.createTextNode(p.sql + '\nWert: '));
        sq2.appendChild(el('mark', { class: 'v19-eingabe', text: pyTupel([e]) }));
        rechts.appendChild(sq2);
      }
      if (zeigeTok) {
        rechts.appendChild(el('p', { class: 'v19-lbl', text: 'So liest die Datenbank: Der Text enthält nur ein ? als Lücke. Dein Wert wird nie als SQL gelesen, egal welche Zeichen er enthält.' }));
        var tk2 = el('p', { class: 'v19-toks' });
        ['teil', '=', '?'].forEach(function (w) { tk2.appendChild(el('span', { class: 'v19-tk v19-tk--code', text: w })); tk2.appendChild(document.createTextNode(' ')); });
        tk2.appendChild(el('span', { class: 'v19-tk v19-tk--text', text: '→ Wert ' + pyStr(e) }));
        rechts.appendChild(tk2);
      }
      if (zeigeRows) rechts.appendChild(zeilenTabelle(p.zeilen, 'Bedingung je Zeile (rechts)'));
      if (st.ganz || stufe >= 3) {
        var vr = el('p', { class: 'v19-verdict is-ok' });
        vr.appendChild(el('strong', { text: p.treffer + (p.treffer === 1 ? ' Treffer' : ' Treffer') }));
        vr.appendChild(document.createTextNode(p.treffer === 0 ? ': Kein Teil heißt genau so. Das ist die richtige Antwort.' : ': genau die Zeilen mit diesem Teil.'));
        rechts.appendChild(vr);
      }

      // Ansage
      var a = 'f-String: ' + (f.kind === 'ok' ? f.treffer + ' Treffer' + (f.treffer === AUFTRAEGE.length ? ', alle Aufträge' : '') : f.kind === 'fehler' ? 'Fehler ' + f.cls + ' ' + f.msg.replace(/\.$/, '') : 'nicht auswertbar') + '. Platzhalter: ' + p.treffer + ' Treffer.';
      cap.textContent = st.ganz ? a : STEPTXT[stufe];
    }
    function zeilenTabelle(zeilen, label) {
      var tw = el('div', { class: 'k-tablewrap', tabindex: '0', role: 'region', 'aria-label': label + ', bei schmalem Bildschirm seitlich scrollbar' });
      var rows = zeilen.map(function (z) {
        var tr = el('tr', { class: z.hit ? 'is-treffer' : '' });
        tr.appendChild(el('td', { class: 'is-num', text: String(z.row.nr) }));
        tr.appendChild(el('td', { text: z.row.teil }));
        var td = el('td', { class: 'v19-expr' }); td.appendChild(segFragment(z.segs)); tr.appendChild(td);
        tr.appendChild(el('td', { text: z.hit ? 'Treffer' : 'kein Treffer' }));
        return tr;
      });
      var t = tabelle([el('th', { scope: 'col', text: 'nr' }), el('th', { scope: 'col', text: 'teil' }), el('th', { scope: 'col', text: 'Bedingung' }), el('th', { scope: 'col', text: 'Ergebnis' })], rows, 'v19-klein');
      t.setAttribute('aria-label', label);
      tw.appendChild(t);
      return tw;
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (F) PAP: offene Aufträge einer Maschine
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(), P.io('Eingabe: maschine'), P.sub('Verbindung öffnen'),
      P.op('SELECT … WHERE maschine = ? ausführen'),
      P.iff('Treffer vorhanden?', [
        P.whil('weiterer Treffer?', [P.io('Ausgabe: Auftrag, Menge, Teil')])
      ], [P.io('Ausgabe: keine offenen Aufträge')]),
      P.sub('Verbindung schließen'), P.end()
    ];
    var d = el('div', { class: 'v19-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan offene Aufträge einer Maschine: Eingabe der Maschine, Unterprogramm Verbindung öffnen, SELECT mit Platzhalter ausführen, Verzweigung Treffer vorhanden. Bei ja Schleife über die Treffer mit Ausgabe, bei nein die Ausgabe keine offenen Aufträge. Danach Unterprogramm Verbindung schließen und Ende.' });
    host.appendChild(d);
  }

  function init() {
    var map = { tabelle: initTabelle, abfrage: initAbfrage, gruppe: initGruppe, ablauf: initAblauf, injektion: initInjektion, 'pap-offene': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
