/* =============================================================
   editor.js – Code-Editor (CodeMirror 6) mit IntelliSense + Befehls-Bibliothek
   Klassisches Script:  <script src="…/assets/js/editor.js" defer></script>
   - macht aus  textarea.py-editor  und  .k-runner__code  automatisch Editoren
   - fügt auf jeder Seite den Knopf „Befehls-Bibliothek“ (Seitenpanel) ein
   - lädt Bundle, Daten und Stylesheet selbst relativ zur eigenen URL
   - API:  window.KursEditor = { attach, getValue, setValue, openLibrary, lib, … }
   - Fällt das Bundle aus, bleibt die normale Textarea nutzbar.
   ============================================================= */
(function () {
  'use strict';
  if (window.KursEditor) return;   // doppelt eingebunden

  /* ── Pfade (relativ zu dieser Datei) ─────────────────────── */
  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || (function () {
    var s = document.querySelectorAll('script[src*="editor.js"]');
    return s.length ? s[s.length - 1].src : location.href;
  })();
  function rel(p) { return new URL(p, SCRIPT_URL).href; }
  var URL_BUNDLE = rel('../vendor/codemirror.bundle.js');
  var URL_DATA = rel('../data/bibliothek.json');
  var URL_CSS = rel('../css/editor.css');
  var URL_LIBPAGE = rel('../../bibliothek.html');


  /* ── Hilfsfunktionen ─────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function lessonNum(v) { var m = /(\d+)/.exec(v || ''); return m ? parseInt(m[1], 10) : null; }
  function lessonName(n) { return n == null ? '' : 'V' + (n < 10 ? '0' : '') + n; }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9_.#*/%=<>!+\- ]/g, ' ');
  }
  /* Bibliotheks-Stand über KursSpeicher (Pfad inf-mb/bibliothek/stand); null = nie gesetzt */
  function storeGet() { var v = window.KursSpeicher && window.KursSpeicher.sofort.lesen('inf-mb/bibliothek/stand'); return v === undefined ? null : v; }
  function storeSet(k, v) { if (window.KursSpeicher) window.KursSpeicher.sofort.schreiben('inf-mb/bibliothek/stand', String(v)); }
  function pageLesson() {
    var n = lessonNum(document.body && document.body.getAttribute('data-lesson'));
    return n;
  }

  /* ── Stylesheet nachladen ────────────────────────────────── */
  function ensureCss() {
    var has = $$('link[rel="stylesheet"]').some(function (l) { return /editor\.css(\?|$)/.test(l.href); });
    if (!has) document.head.appendChild(el('link', { rel: 'stylesheet', href: URL_CSS }));
  }

  /* ── Bundle laden ────────────────────────────────────────── */
  var cmPromise = null;
  function loadCM() {
    if (window.CM) return Promise.resolve(window.CM);
    if (!cmPromise) {
      cmPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = URL_BUNDLE;
        s.onload = function () { window.CM ? resolve(window.CM) : reject(new Error('window.CM fehlt')); };
        s.onerror = function () { reject(new Error('Bundle nicht ladbar: ' + URL_BUNDLE)); };
        document.head.appendChild(s);
      });
    }
    return cmPromise;
  }

  /* ── Bibliothek-Daten + Index ────────────────────────────── */
  var lib = { data: null, entries: [], byId: {}, top: {}, topCompl: {}, methods: {}, members: {}, modules: {}, ops: {} };
  var libPromise = null;
  var MODULE_MEMBERS = {
    math: ['sqrt', 'pi', 'e', 'isclose', 'ceil', 'floor', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'radians', 'degrees', 'log', 'log10', 'exp', 'hypot', 'fabs', 'pow', 'inf'],
    csv: ['reader', 'writer', 'DictReader', 'DictWriter']
  };
  var METHODS = ['append', 'extend', 'insert', 'remove', 'pop', 'sort', 'reverse', 'index', 'count', 'copy', 'clear',
    'split', 'strip', 'lstrip', 'rstrip', 'join', 'replace', 'upper', 'lower', 'startswith', 'endswith', 'find', 'isdigit', 'format',
    'get', 'items', 'keys', 'values', 'update', 'read', 'readline', 'readlines', 'write', 'close'];
  var KEYWORDS = ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'True', 'False'];
  var BUILTINS = ['abs', 'all', 'any', 'bin', 'bool', 'chr', 'dict', 'dir', 'enumerate', 'float', 'format', 'hex', 'input', 'int', 'isinstance', 'len', 'list', 'map', 'max', 'min', 'open', 'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round', 'set', 'sorted', 'str', 'sum', 'tuple', 'type', 'zip'];

  function buildIndex(d) {
    lib.data = d;
    lib.entries = d.eintraege || [];
    lib.byId = {}; lib.top = {}; lib.topCompl = {}; lib.methods = {}; lib.members = {}; lib.modules = {}; lib.ops = {};
    Object.keys(MODULE_MEMBERS).forEach(function (m) { lib.modules[m] = MODULE_MEMBERS[m].slice(); });
    lib.entries.forEach(function (e) {
      lib.byId[e.id] = e;
      (e.bezeichner || []).forEach(function (b) {
        var m;
        if (b.charAt(0) === '.' && /^\.[A-Za-z_]\w*$/.test(b)) { if (!lib.methods[b.slice(1)]) lib.methods[b.slice(1)] = e; }
        else if ((m = /^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec(b))) {
          lib.members[b] = e;
          lib.modules[m[1]] = lib.modules[m[1]] || [];
          if (lib.modules[m[1]].indexOf(m[2]) < 0) lib.modules[m[1]].push(m[2]);
        }
        else if (/^[A-Za-z_]\w*$/.test(b)) {
          if (!lib.top[b]) lib.top[b] = e;
        }
        else if (b !== '=' && b !== '#' && !/^\[|^\{|^:/.test(b)) { if (!lib.ops[b]) lib.ops[b] = e; }
      });
    });
    // Bare Namen mit Modul-Pendant (sqrt, pi, …) nicht als Vorschlag, nur für Hover
    Object.keys(lib.top).forEach(function (n) {
      var qualified = Object.keys(lib.members).some(function (q) { return lib.members[q] === lib.top[n] && q.split('.')[1] === n; });
      if (!qualified) lib.topCompl[n] = lib.top[n];
    });
  }
  function loadLib() {
    if (!libPromise) {
      libPromise = fetch(URL_DATA, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) { buildIndex(d); return lib; }).catch(function (err) {
        if (window.console) console.warn('[KursEditor] Bibliothek nicht geladen:', err.message);
        buildIndex({ eintraege: [] });
        return lib;
      });
    }
    return libPromise;
  }
  function isLater(e, cur) { return cur != null && lessonNum(e.eingefuehrt) != null && lessonNum(e.eingefuehrt) > cur; }

  /* ── Suche in der Bibliothek ─────────────────────────────── */
  function searchEntries(q, opts) {
    opts = opts || {};
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var res = [];
    lib.entries.forEach(function (e) {
      if (opts.kategorie && e.kategorie !== opts.kategorie) return;
      if (opts.ampel && e.ampel !== opts.ampel) return;
      if (opts.max != null && lessonNum(e.eingefuehrt) > opts.max) return;
      if (!terms.length) { res.push({ e: e, s: 0 }); return; }
      var name = norm(e.name), ids = norm(e.id + ' ' + (e.bezeichner || []).join(' ') + ' ' + (e.suchbegriffe || []).join(' '));
      var hay = name + ' ' + ids + ' ' + norm(e.kurz) + ' ' + norm(e.kategorie) + ' ' + norm(e.erklaerung || '');
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (hay.indexOf(t) < 0) return;
        if (name.indexOf(t) === 0 || ids.split(' ').indexOf(t) >= 0) score += 6;
        else if (name.indexOf(t) >= 0 || ids.indexOf(t) >= 0) score += 3;
        else if (norm(e.kurz).indexOf(t) >= 0) score += 2;
        else score += 1;
      }
      res.push({ e: e, s: score });
    });
    if (terms.length) res.sort(function (a, b) { return b.s - a.s; });
    return res.map(function (r) { return r.e; });
  }

  /* ── Bezeichner am Cursor → Bibliothekseintrag ───────────── */
  function lookupWord(pre, w) {
    var m = /([A-Za-z_]\w*)\s*\.\s*$/.exec(pre);
    if (m) {
      var q = m[1] + '.' + w;
      if (lib.members[q]) return lib.members[q];
      return lib.methods[w] || null;
    }
    if (/\.\s*$/.test(pre)) return lib.methods[w] || null;
    return lib.top[w] || null;
  }
  var OP_RE = /\*\*=?|\/\/=?|[+\-*\/%]=|==|!=|<=|>=|[+\-*\/%<>]/g;
  // withOps: auch Operatoren (//, %, **, +=, ==, …) erkennen (für die Kontextzeile, nicht für Hover)
  function entryAt(state, pos, withOps) {
    var r = state.wordAt(pos);
    if (r && r.to > r.from) {
      var w = state.sliceDoc(r.from, r.to);
      if (/^[A-Za-z_]\w*$/.test(w)) {
        return { entry: lookupWord(state.sliceDoc(Math.max(0, r.from - 60), r.from), w), from: r.from, to: r.to, word: w };
      }
    }
    if (withOps) {
      var line = state.doc.lineAt(pos), col = pos - line.from, m;
      OP_RE.lastIndex = 0;
      while ((m = OP_RE.exec(line.text))) {
        if (m.index <= col && col <= m.index + m[0].length && lib.ops[m[0]]) return { entry: lib.ops[m[0]], from: line.from + m.index, to: line.from + m.index + m[0].length, word: m[0] };
        if (m.index > col) break;
      }
    }
    return null;
  }

  /* ── Syntax-Highlighting für statische Codeblöcke ────────── */
  var HL = null;
  function highlighter() {
    if (HL || !window.CM) return HL;
    var T = CM.highlight.tags;
    HL = CM.highlight.tagHighlighter([
      { tag: [T.keyword, T.controlKeyword, T.operatorKeyword, T.definitionKeyword, T.moduleKeyword, T.self, T.bool, T.null, T.modifier], class: 'tok-kw' },
      { tag: [T.string, T.special(T.string)], class: 'tok-str' },
      { tag: T.escape, class: 'tok-esc' },
      { tag: [T.number, T.integer, T.float], class: 'tok-num' },
      { tag: [T.comment, T.lineComment], class: 'tok-com' },
      { tag: [T.function(T.variableName), T.function(T.propertyName), T.function(T.definition(T.variableName))], class: 'tok-fn' },
      { tag: [T.className, T.typeName, T.definition(T.className)], class: 'tok-type' },
      { tag: T.invalid, class: 'tok-bad' }
    ]);
    return HL;
  }
  function codeBlock(code, cls) {
    var pre = el('pre', { class: 'ke-code' + (cls ? ' ' + cls : '') });
    var codeEl = el('code');
    pre.appendChild(codeEl);
    if (window.CM && highlighter()) {
      try {
        var tree = CM.pythonLanguage.parser.parse(code);
        CM.highlight.highlightCode(code, tree, highlighter(), function (text, c) {
          if (c) { var s = el('span', { class: c }); s.textContent = text; codeEl.appendChild(s); }
          else codeEl.appendChild(document.createTextNode(text));
        }, function () { codeEl.appendChild(document.createTextNode('\n')); });
        return pre;
      } catch (e) { codeEl.textContent = ''; }
    }
    codeEl.textContent = code;
    return pre;
  }

  /* Codeblock, den kurs.js zum Runner macht (DESIGN.md Regel 12); bei input() mit passenden Beispiel-Eingaben vorbelegt */
  function guessStdin(code) {
    var n = (code.match(/\binput\s*\(/g) || []).length;
    if (!n) return null;
    var parts = code.split(/\binput\s*\(/), out = [];
    for (var i = 0; i < n; i++) out.push(/\b(?:int|float)\s*\(\s*$/.test(parts[i]) || /\b(?:int|float)\s*\(\s*[A-Za-z_]\w*\s*\)/.test(code) ? '12' : 'Anna');
    return out.join('\n');
  }
  function runnableBlock(code) {
    var pre = codeBlock(code);
    var g = guessStdin(code);
    if (g) pre.setAttribute('data-stdin', g);
    return pre;
  }

  /* ── „Ausprobieren“ über KursPy ──────────────────────────── */
  function tryRun(code, outEl, btn, statusEl) {
    outEl.hidden = false; outEl.textContent = '';
    if (!window.KursPy || !window.KursPy.run) {
      outEl.appendChild(el('span', { class: 'sys', text: 'Der Python-Runner ist auf dieser Seite nicht geladen.' }));
      return;
    }
    function add(t, c) { var s = el('span', c ? { class: c } : null); s.textContent = t; outEl.appendChild(s); }
    btn.disabled = true;
    statusEl.textContent = window.KursPy.worker ? 'läuft …' : 'Python wird geladen (einmalig, ca. 10 MB) …';
    var got = false;
    window.KursPy.run(code, { timeout: 8000, onOut: function (t) { got = true; add(t); }, onErr: function (t) { got = true; add(t, 'err'); } })
      .then(function (r) {
        if (r.timedOut) add('\nAbgebrochen nach 8 s.\n', 'err');
        else if (r.error) add(r.error.replace(/\s+$/, '') + '\n', 'err');
        else if (!got) add('(keine Ausgabe)', 'sys');
        statusEl.textContent = r.timedOut ? 'abgebrochen' : (r.error ? 'Fehler' : 'fertig');
      })
      .catch(function (err) { add('Python konnte nicht gestartet werden: ' + err.message + '\n', 'err'); statusEl.textContent = 'Ladefehler'; })
      .then(function () { btn.disabled = false; });
  }

  /* ── Detailansicht eines Eintrags (Panel + Übersichtsseite) ─ */
  var AMPEL = { kopf: ['Im Kopf', 'k-ampel--kopf'], lesen: ['Lesen & erkennen', 'k-ampel--lesen'], delegieren: ['Delegieren', 'k-ampel--deleg'] };
  function ampelChip(a) {
    var d = AMPEL[a] || AMPEL.kopf;
    return el('span', { class: 'kb-chip kb-chip--' + a, text: d[0] });
  }
  function codeActions(code, opts, runnable) {
    var wrap = el('div', { class: 'kb-actions' });
    var status = el('span', { class: 'kb-status', role: 'status' });
    var out = el('pre', { class: 'kb-out', hidden: '', 'aria-label': 'Ausgabe' });
    if (opts.canTake && opts.canTake()) {
      var take = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'In Editor übernehmen' });
      take.addEventListener('click', function () {
        var ok = opts.take(code);
        status.textContent = ok ? 'Im Editor eingefügt.' : 'Klicke zuerst in einen Editor.';
      });
      wrap.appendChild(take);
    }
    if (runnable) {
      var run = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Ausprobieren' });
      run.addEventListener('click', function () { tryRun(code, out, run, status); });
      wrap.appendChild(run);
    }
    wrap.appendChild(status);
    return [wrap, out];
  }

  function renderDetail(e, opts) {
    opts = opts || {};
    var root = el('article', { class: 'kb-detail' });
    var later = isLater(e, opts.lesson);
    var head = el('div', { class: 'kb-detail__head' });
    head.appendChild(el('h3', { class: 'kb-detail__title', text: e.name }));
    var chips = el('div', { class: 'kb-chips' }, [ampelChip(e.ampel), el('span', { class: 'kb-chip', text: 'ab ' + e.eingefuehrt }), el('span', { class: 'kb-chip kb-chip--cat', text: e.kategorie })]);
    if (later) chips.appendChild(el('span', { class: 'kb-chip kb-chip--later', text: 'kommt in ' + e.eingefuehrt }));
    head.appendChild(chips);
    root.appendChild(head);
    root.appendChild(el('p', { class: 'kb-lead', text: e.kurz }));
    root.appendChild(el('h4', { class: 'kb-h', text: 'Schreibweise' }));
    var synPre = codeBlock(e.syntax);
    synPre.setAttribute('data-run', 'no');   // Schreibweise mit Platzhaltern, nicht ausführbar
    root.appendChild(synPre);

    if (e.stichwort) {
      root.appendChild(el('p', { class: 'kb-note', text: 'Dieses Konzept kommt erst später im Kurs (' + e.eingefuehrt + '). Hier steht nur das Stichwort, damit du es wiedererkennst.' }));
    } else {
      if (later) root.appendChild(el('p', { class: 'kb-note', text: 'Achtung: Das lernst du erst in ' + e.eingefuehrt + '. Du kannst vorlesen, musst es aber noch nicht anwenden.' }));
      root.appendChild(el('p', { text: e.erklaerung }));
      root.appendChild(el('h4', { class: 'kb-h', text: 'Beispiel' }));
      root.appendChild(runnableBlock(e.beispiel));
      codeActions(e.beispiel, opts, false).forEach(function (n) { root.appendChild(n); });
      if (e.beispiel_ausgabe) {
        root.appendChild(el('details', { class: 'kb-details' }, [el('summary', { text: 'Erwartete Ausgabe' }), el('pre', { class: 'kb-out kb-out--static', text: e.beispiel_ausgabe })]));
      }
      root.appendChild(el('h4', { class: 'kb-h', text: 'Wann nutze ich das?' }));
      root.appendChild(el('p', { text: e.wann_nutzen }));

      if (e.transfer && e.transfer.length) {
        root.appendChild(el('h4', { class: 'kb-h', text: 'Transfer: Wo hilft es dir noch?' }));
        var ul = el('ul', { class: 'kb-transfer' });
        e.transfer.forEach(function (t) {
          var li = el('li');
          li.appendChild(el('strong', { text: t.situation }));
          li.appendChild(runnableBlock(t.code));
          codeActions(t.code, opts, false).forEach(function (n) { li.appendChild(n); });
          ul.appendChild(li);
        });
        root.appendChild(ul);
      }
      if (e.typische_fehler && e.typische_fehler.length) {
        root.appendChild(el('h4', { class: 'kb-h', text: 'Typische Fehler' }));
        e.typische_fehler.forEach(function (f) {
          var box = el('div', { class: 'kb-err' });
          box.appendChild(el('p', { class: 'kb-err__what', text: f.beschreibung }));
          box.appendChild(codeBlock(f.code));
          box.appendChild(el('pre', { class: 'kb-err__msg', text: f.meldung }));
          root.appendChild(box);
        });
      }
    }
    if (e.verwandt && e.verwandt.length) {
      root.appendChild(el('h4', { class: 'kb-h', text: 'Verwandt' }));
      var rel = el('div', { class: 'kb-related' });
      e.verwandt.forEach(function (id) {
        var o = lib.byId[id]; if (!o) return;
        var b = el('button', { type: 'button', class: 'kb-chip kb-chip--btn', text: o.name });
        b.addEventListener('click', function () { if (opts.onOpen) opts.onOpen(id); });
        rel.appendChild(b);
      });
      root.appendChild(rel);
    }
    return root;
  }

  /* ── Editor-Registry ─────────────────────────────────────── */
  var registry = new WeakMap();
  var editors = [];
  var lastEditor = null;

  function getController(ta) { return registry.get(ta) || null; }
  function isShown(c) { return !!(c.wrap && c.wrap.offsetParent !== null); }
  function activeEditors() { return editors.filter(function (c) { return c.assist && c.view && document.body.contains(c.ta) && isShown(c); }); }
  function takeCode(code) {
    var c = (lastEditor && lastEditor.assist && lastEditor.view && document.body.contains(lastEditor.ta) && isShown(lastEditor)) ? lastEditor : null;
    if (!c) { var a = activeEditors(); if (a.length === 1) c = a[0]; }
    if (!c) return false;
    var cur = c.view.state.doc.toString().replace(/\s+$/, '');
    setValue(c.ta, cur ? cur + '\n\n' + code + '\n' : code + '\n');
    c.view.focus();
    var len = c.view.state.doc.length;
    c.view.dispatch({ selection: { anchor: len }, scrollIntoView: true });
    return true;
  }
  function canTake() { return activeEditors().length > 0; }

  /* ── Jedi-Anbindung ──────────────────────────────────────── */
  function py() { return window.KursPy && window.KursPy.rpc && window.KursPy.ensureJedi ? window.KursPy : null; }
  function jediReady() { var p = py(); return !!p && p.status === 'ready'; }
  var STATUS_TEXT = {
    base: 'Vorschläge: Grundmodus',
    python: 'Python wird geladen …',
    jedi: 'Jedi wird geladen …',
    ready: 'Vorschläge: Jedi aktiv',
    error: 'Vorschläge: Grundmodus (Jedi nicht verfügbar)',
    idle: 'Vorschläge: Grundmodus'
  };
  var statusSubscribers = [];
  function startJedi() {
    var p = py();
    if (!p || p.jediFailed) return;
    if (p.status === 'idle' || p.status === 'error') { p.ensureJedi().catch(function () {}); }
  }
  function wireStatus() {
    var p = py();
    if (!p || wireStatus.done) return;
    wireStatus.done = true;
    p.onStatus(function (s) { statusSubscribers.forEach(function (f) { f(s); }); });
  }
  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  /* ── Infos in Vorschlägen / Tooltips ─────────────────────── */
  function infoNode(e, lesson) {
    var d = el('div', { class: 'ke-info' });
    d.appendChild(el('strong', { class: 'ke-info__t', text: e.name }));
    d.appendChild(el('p', { class: 'ke-info__k', text: e.kurz }));
    d.appendChild(codeBlock(e.syntax, 'ke-info__syn'));
    if (isLater(e, lesson)) d.appendChild(el('p', { class: 'ke-info__later', text: 'Kommt erst in ' + e.eingefuehrt + '.' }));
    var more = el('button', { type: 'button', class: 'ke-info__more', text: 'Mehr in der Bibliothek' });
    more.addEventListener('click', function () { openLibrary(e.id); });
    d.appendChild(more);
    d.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    return d;
  }
  function plainInfo(title, text, extra) {
    var d = el('div', { class: 'ke-info' });
    d.appendChild(el('strong', { class: 'ke-info__t', text: title }));
    if (extra) d.appendChild(el('p', { class: 'ke-info__k', text: extra }));
    if (text) d.appendChild(el('pre', { class: 'ke-info__doc', text: text }));
    d.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    return d;
  }

  /* ── Vervollständigung ───────────────────────────────────── */
  var TYPE_MAP = { function: 'function', 'class': 'class', module: 'namespace', instance: 'variable', statement: 'variable', param: 'variable', keyword: 'keyword', property: 'property', path: 'text' };

  function makeCompleter(c) {
    function lessonNow() { return c.lesson; }
    function libOption(label, e, kind, boost) {
      var later = isLater(e, lessonNow());
      return {
        label: label, type: kind, boost: (boost || 0) + (later ? -3 : 2),
        detail: later ? 'kommt in ' + e.eingefuehrt : (e.kategorie || ''),
        info: function () { return infoNode(e, lessonNow()); }
      };
    }
    function baseOptions(st, pos, ctxInfo) {
      var opts = [], seen = {};
      function add(o) { if (!seen[o.label]) { seen[o.label] = 1; opts.push(o); } }
      if (ctxInfo.module && lib.modules[ctxInfo.module]) {
        lib.modules[ctxInfo.module].forEach(function (n) {
          var e = lib.members[ctxInfo.module + '.' + n];
          add(e ? libOption(n, e, /^[A-Z_]*$|^pi$|^e$|^inf$/.test(n) ? 'constant' : 'function', 3) : { label: n, type: /^pi$|^e$|^inf$/.test(n) ? 'constant' : 'function' });
        });
        return opts;
      }
      if (ctxInfo.dot) {
        Object.keys(lib.methods).forEach(function (n) { add(libOption(n, lib.methods[n], 'method', 3)); });
        METHODS.forEach(function (n) { add({ label: n, type: 'method' }); });
        return opts;
      }
      Object.keys(lib.topCompl).forEach(function (n) {
        var e = lib.topCompl[n];
        if (KEYWORDS.indexOf(n) >= 0) add(Object.assign(libOption(n, e, 'keyword', 1), { boost: 1 }));
        else add(libOption(n, e, lib.modules[n] ? 'namespace' : (BUILTINS.indexOf(n) >= 0 ? 'function' : 'variable'), 2));
      });
      KEYWORDS.forEach(function (n) { add({ label: n, type: 'keyword', boost: -1 }); });
      BUILTINS.forEach(function (n) { add({ label: n, type: 'function' }); });
      Object.keys(lib.modules).forEach(function (m) { add({ label: m, type: 'namespace', boost: 1 }); });
      // lokale Namen aus dem Dokument
      var text = st.doc.toString(), re = /[A-Za-z_]\w{2,}/g, m, n2 = 0;
      var word = st.sliceDoc(ctxInfo.from, pos);
      while ((m = re.exec(text)) && n2 < 400) {
        n2++;
        if (m.index + m[0].length === pos && m[0] === word) continue;      // das gerade getippte Wort selbst
        add({ label: m[0], type: 'variable', boost: -2 });
      }
      // qualifizierte Namen (math.sqrt) als schwache Vorschläge
      Object.keys(lib.members).forEach(function (q) { add(Object.assign(libOption(q, lib.members[q], 'function', -1), { boost: -2 })); });
      return opts;
    }

    return function source(ctx) {
      var st = ctx.state, pos = ctx.pos;
      var node = CM.language.syntaxTree(st).resolveInner(pos, -1);
      if (/^(String|FormatString|Comment|Number)$/.test(node.name) && !(node.name === 'Number' && /[A-Za-z_]/.test(st.sliceDoc(node.from, node.to)))) return null;
      var line = st.doc.lineAt(pos), pre = line.text.slice(0, pos - line.from);
      var wm = /[A-Za-z_]\w*$|\w*$/.exec(pre), wordLen = wm ? wm[0].length : 0;
      var from = pos - wordLen;
      var before = pre.slice(0, pre.length - wordLen);
      var dm = /([A-Za-z_]\w*)\s*\.\s*$/.exec(before), dot = /\.\s*$/.test(before);
      if (!ctx.explicit && wordLen === 0 && !dot) return null;
      if (/^\s*(import|from)\s/.test(pre) && !dot) { /* in import-Zeilen trotzdem Namen anbieten */ }
      var info = { from: from, dot: dot, module: dm && lib.modules[dm[1]] ? dm[1] : null };
      var base = baseOptions(st, pos, info);
      var result = { from: from, options: base, validFor: /^\w*$/ };

      if (!jediReady()) {
        if (c.assist) startJedi();
        return result;
      }
      var lineNo = line.number, col = pos - line.from;
      return withTimeout(py().rpc('complete', { code: st.doc.toString(), line: lineNo, col: col }, 2500), 2600).then(function (r) {
        if (!r || !r.items || !r.items.length) return result;
        var tok = r.tok, seen = {}, opts = [];
        r.items.forEach(function (it) {
          var name = it[0], type = it[1], i = it[2];
          if (seen[name]) return; seen[name] = 1;
          var e = info.module ? lib.members[info.module + '.' + name] : (dot ? lib.methods[name] : lib.top[name]);
          if (e) { var o = libOption(name, e, TYPE_MAP[type] || 'variable', 4); opts.push(o); return; }
          opts.push({
            label: name, type: TYPE_MAP[type] || 'variable', boost: 0,
            info: function () {
              return py().rpc('doc', { code: '', line: 1, col: 0, extra: [tok, i] }, 2500).then(function (d) {
                if (!d || !d.doc) return null;
                return plainInfo(name, d.doc, 'Python-Dokumentation (englisch)');
              }).catch(function () { return null; });
            }
          });
        });
        // Bibliotheks-Einträge ergänzen, die Jedi nicht kennt (z. B. math ohne import)
        base.forEach(function (o) { if (!seen[o.label] && o.info && o.detail !== undefined) { seen[o.label] = 1; opts.push(o); } });
        return { from: from, options: opts, validFor: /^\w*$/ };
      }).catch(function () { return result; });
    };
  }

  /* ── Signaturhilfe ───────────────────────────────────────── */
  function findCall(st) {
    var pos = st.selection.main.head;
    var text = st.sliceDoc(Math.max(0, pos - 1500), pos);
    var depth = 0, commas = 0, i, ch, q;
    for (i = text.length - 1; i >= 0; i--) {
      ch = text.charAt(i);
      if (ch === '"' || ch === "'") {                     // Zeichenkette rückwärts überspringen (einzeilig)
        q = ch; i--;
        while (i >= 0 && text.charAt(i) !== q && text.charAt(i) !== '\n') i--;
        continue;
      }
      if (ch === ')' || ch === ']' || ch === '}') depth++;
      else if (ch === '(') { if (depth === 0) break; depth--; }
      else if (ch === '[' || ch === '{') { if (depth === 0) return null; depth--; }
      else if (ch === ',' && depth === 0) commas++;
    }
    if (i < 0) return null;
    var head = text.slice(0, i);
    var m = /([A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*)*)\s*$/.exec(head);
    if (!m) return null;
    var callee = m[1].replace(/\s+/g, '');
    if (/^(if|elif|while|and|or|not|in|is|return|for|assert|del|with|yield|lambda|else|import|from|print_)$/.test(callee)) return null;
    if (/(^|\s)def\s+[A-Za-z_]\w*\s*$/.test(head)) return null;
    return { callee: callee, index: commas, paren: pos - (text.length - i) };
  }
  function sigNode(sig) {
    var d = el('div', { class: 'ke-sig' });
    var code = el('code');
    code.appendChild(document.createTextNode(sig.name + '('));
    sig.params.forEach(function (p, i) {
      if (i) code.appendChild(document.createTextNode(', '));
      var s = el('span', { class: 'ke-sig__p' + (i === sig.index ? ' is-cur' : '') });
      s.textContent = p; code.appendChild(s);
    });
    code.appendChild(document.createTextNode(')'));
    d.appendChild(code);
    if (sig.note) d.appendChild(el('span', { class: 'ke-sig__note', text: sig.note }));
    return d;
  }
  function librarySig(callee) {
    var e = null, name = callee.split('.').pop();
    if (callee.indexOf('.') >= 0) e = lib.members[callee] || lib.methods[name];
    else e = lib.top[callee];
    if (!e || !e.syntax) return null;
    var first = e.syntax.split('\n')[0];
    var m = /^([\w.]+)\((.*)\)\s*$/.exec(first);
    if (!m) return null;
    var params = m[2] ? m[2].split(/,\s*/) : [];
    return { name: m[1], params: params, index: -1, note: 'Kurzform aus der Bibliothek' };
  }

  /* ── Panel (Drawer) ──────────────────────────────────────── */
  var panel = null;
  function buildPanel() {
    if (panel) return panel;
    var P = { open: false, current: null, query: '', kategorie: '', stand: null };
    var saved = storeGet();
    P.stand = saved === 'alle' ? null : (saved ? parseInt(saved, 10) : pageLesson());
    if (saved === null) P.stand = pageLesson();

    var toggle = el('button', { type: 'button', class: 'kb-toggle', 'aria-expanded': 'false', 'aria-controls': 'kb-panel' });
    toggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5 3h11a3 3 0 0 1 3 3v14.2a.8.8 0 0 1-1.2.7L15 19.4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1.2 4.2v1.6h8.6V7.2H6.2Zm0 3.6v1.6h8.6v-1.6H6.2Zm0 3.6V16h5.6v-1.6H6.2Z"/></svg><span>Befehls-Bibliothek</span>';
    var aside = el('aside', { id: 'kb-panel', class: 'kb', 'aria-label': 'Befehls-Bibliothek', hidden: '' });
    var closeBtn = el('button', { type: 'button', class: 'kb__close', 'aria-label': 'Bibliothek schließen', text: '×' });
    var head = el('div', { class: 'kb__head' }, [el('h2', { class: 'kb__title', text: 'Befehls-Bibliothek' }), closeBtn]);
    var searchId = 'kb-q', searchIn = el('input', { type: 'search', id: searchId, class: 'kb__search', placeholder: 'Befehl suchen, z. B. runden oder for', autocomplete: 'off', spellcheck: 'false' });
    var catSel = el('select', { id: 'kb-cat', class: 'kb__sel' });
    var standSel = el('select', { id: 'kb-stand', class: 'kb__sel' });
    var tools = el('div', { class: 'kb__tools' }, [
      el('label', { class: 'k-sr', 'for': searchId, text: 'Suche in der Befehls-Bibliothek' }), searchIn,
      el('div', { class: 'kb__row' }, [
        el('label', { class: 'kb__lab' }, ['Kategorie', catSel]),
        el('label', { class: 'kb__lab' }, ['Mein Stand', standSel])
      ])
    ]);
    var body = el('div', { class: 'kb__body', tabindex: '-1' });
    var foot = el('div', { class: 'kb__foot' }, [el('a', { href: URL_LIBPAGE, text: 'Übersicht & Spickzettel zum Drucken' })]);
    aside.appendChild(head); aside.appendChild(tools); aside.appendChild(body); aside.appendChild(foot);
    // Angedockt: Steht ein Container [data-library-dock] auf der Seite und ist das Fenster breit genug,
    // sitzt das Panel dort (Spalte, einklappbar). Sonst bleibt es ein Overlay am Seitenrand.
    var dock = $('[data-library-dock]');
    var mq = window.matchMedia ? window.matchMedia('(min-width: 1100px)') : null;
    function isDocked() { return !!dock && !!mq && mq.matches; }
    function place() {
      var docked = isDocked();
      if (docked) {
        if (aside.parentNode !== dock) dock.appendChild(aside);
        if (toggle.parentNode !== dock) dock.appendChild(toggle);
      } else {
        if (aside.parentNode !== document.body) document.body.appendChild(aside);
        if (toggle.parentNode !== document.body) document.body.appendChild(toggle);
        if (dock) dock.setAttribute('data-state', 'off');
        document.documentElement.classList.remove('kb-dock-closed');
      }
      aside.classList.toggle('kb--docked', docked);
      toggle.classList.toggle('kb-toggle--dock', docked);
      closeBtn.textContent = docked ? '›' : '×';
      closeBtn.setAttribute('aria-label', docked ? 'Bibliothek einklappen' : 'Bibliothek schließen');
      toggle.setAttribute('aria-label', docked ? 'Befehls-Bibliothek ausklappen' : 'Befehls-Bibliothek');
    }
    place();

    function fillSelects() {
      catSel.innerHTML = ''; standSel.innerHTML = '';
      catSel.appendChild(el('option', { value: '', text: 'Alle Kategorien' }));
      var cats = [];
      lib.entries.forEach(function (e) { if (cats.indexOf(e.kategorie) < 0) cats.push(e.kategorie); });
      cats.forEach(function (c) { catSel.appendChild(el('option', { value: c, text: c })); });
      standSel.appendChild(el('option', { value: 'alle', text: 'Alles anzeigen' }));
      for (var i = 1; i <= 22; i++) standSel.appendChild(el('option', { value: String(i), text: 'bis ' + lessonName(i) }));
      standSel.value = P.stand == null ? 'alle' : String(Math.min(9, P.stand));
      if (P.stand != null && P.stand > 9) standSel.value = 'alle';
    }

    function showList() {
      P.current = null;
      body.innerHTML = '';
      var items = searchEntries(P.query, { kategorie: P.kategorie });
      var info = el('p', { class: 'kb-small kb-count', role: 'status' });
      info.textContent = items.length + (items.length === 1 ? ' Eintrag' : ' Einträge') + (P.stand != null ? ' – später eingeführte Konzepte sind markiert' : '');
      body.appendChild(info);
      var ul = el('ul', { class: 'kb-list' });
      items.forEach(function (e) {
        var later = isLater(e, P.stand);
        var b = el('button', { type: 'button', class: 'kb-item' + (later ? ' is-later' : ''), 'data-id': e.id });
        b.appendChild(el('span', { class: 'kb-item__name', text: e.name }));
        b.appendChild(el('span', { class: 'kb-item__kurz', text: e.kurz }));
        var meta = el('span', { class: 'kb-item__meta' }, [ampelChip(e.ampel)]);
        meta.appendChild(el('span', { class: 'kb-chip', text: e.eingefuehrt }));
        if (later) meta.appendChild(el('span', { class: 'kb-chip kb-chip--later', text: 'kommt in ' + e.eingefuehrt }));
        b.appendChild(meta);
        b.addEventListener('click', function () { showEntry(e.id); });
        ul.appendChild(el('li', null, [b]));
      });
      body.appendChild(ul);
      if (!items.length) body.appendChild(el('p', { class: 'kb-note', text: 'Nichts gefunden. Versuche ein anderes Stichwort oder „Alle Kategorien“.' }));
    }
    function showEntry(id, fromContext) {
      var e = lib.byId[id]; if (!e) return;
      P.current = id;
      body.innerHTML = '';
      var back = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost kb-back', text: '← Alle Befehle' });
      back.addEventListener('click', function () { showList(); searchIn.focus(); });
      body.appendChild(back);
      body.appendChild(renderDetail(e, { lesson: P.stand, onOpen: function (i) { showEntry(i); body.scrollTop = 0; }, canTake: canTake, take: takeCode }));
      body.scrollTop = 0;
    }
    function open(id, opts) {
      opts = opts || {};
      P.open = true;
      aside.hidden = false; toggle.setAttribute('aria-expanded', 'true');
      if (isDocked()) { dock.setAttribute('data-state', 'open'); document.documentElement.classList.remove('kb-dock-closed'); }
      else document.documentElement.classList.add('kb-open');
      Promise.all([loadLib(), loadCM().catch(function () { return null; })]).then(function () {
        if (!catSel.options.length) fillSelects();
        if (id && lib.byId[id]) showEntry(id, opts.fromContext); else if (!body.firstChild || P.current === null) showList();
        if (!opts.keepFocus) { if (id) body.focus(); else searchIn.focus(); }
      });
    }
    function close(returnFocus) {
      P.open = false; aside.hidden = true; toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('kb-open');
      if (isDocked()) { dock.setAttribute('data-state', 'closed'); document.documentElement.classList.add('kb-dock-closed'); }
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () { P.open ? close(false) : open(); });
    closeBtn.addEventListener('click', function () { close(true); });
    aside.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !isDocked()) { ev.stopPropagation(); close(true); } });
    searchIn.addEventListener('input', function () { P.query = searchIn.value; showList(); });
    catSel.addEventListener('change', function () { P.kategorie = catSel.value; showList(); });
    standSel.addEventListener('change', function () {
      P.stand = standSel.value === 'alle' ? null : parseInt(standSel.value, 10);
      storeSet(null, standSel.value);
      if (P.current) showEntry(P.current); else showList();
    });
    P.open_ = open; P.close = close; P.toggle = toggle; P.aside = aside; P.showEntry = showEntry;
    P.isOpen = function () { return P.open; };
    P.follow = function (id) { if (P.open && id && id !== P.current && lib.byId[id]) showEntry(id, true); };
    P.docked = isDocked;
    if (mq && dock) {
      var onMode = function () { var wasOpen = P.open; place(); if (isDocked()) open(undefined, { keepFocus: true }); else if (wasOpen) close(false); };
      if (mq.addEventListener) mq.addEventListener('change', onMode); else if (mq.addListener) mq.addListener(onMode);
    }
    panel = P;
    if (isDocked()) open(undefined, { keepFocus: true });
    return P;
  }
  function openLibrary(id) { Promise.all([loadLib(), loadCM().catch(function () { return null; })]).then(function () { buildPanel().open_(id); }); }

  /* ── Editor aufbauen ─────────────────────────────────────── */
  var DE = {
    'Find': 'Suchen', 'Replace': 'Ersetzen', 'next': 'weiter', 'previous': 'zurück', 'all': 'alle', 'match case': 'Groß/Klein',
    'by word': 'ganzes Wort', 'regexp': 'RegEx', 'replace': 'ersetzen', 'replace all': 'alle ersetzen', 'close': 'schließen',
    'current match': 'aktueller Treffer', 'replaced $ matches': '$ Treffer ersetzt', 'replaced match on line $': 'Treffer in Zeile $ ersetzt',
    'on line': 'in Zeile', 'Go to line': 'Gehe zu Zeile', 'go': 'los', 'Completions': 'Vorschläge',
    'Control character': 'Steuerzeichen', 'Folded lines': 'Eingeklappte Zeilen', 'Unfolded lines': 'Ausgeklappte Zeilen',
    'to': 'bis', 'folded code': 'eingeklappter Code', 'unfold': 'ausklappen', 'Fold line': 'Zeile einklappen', 'Unfold line': 'Zeile ausklappen'
  };

  function labelFor(ta) {
    var l = ta.getAttribute('aria-label');
    if (!l && ta.id) { var lab = $('label[for="' + ta.id + '"]'); if (lab) l = lab.textContent.trim(); }
    return (l || 'Python-Code') + ' (Code-Editor)';
  }
  function wantsAssist(ta, opts) {
    if (opts && opts.assist === false) return false;
    if (opts && opts.assist === true) return true;
    var host = ta.closest('[data-assist]') || document.body;
    return !(host && host.getAttribute('data-assist') === 'off');
  }
  function lessonFor(ta, opts) {
    if (opts && opts.lesson) return lessonNum(opts.lesson);
    var host = ta.closest('[data-lesson]');
    return lessonNum(host ? host.getAttribute('data-lesson') : null);
  }

  var nativeDesc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  var hintSeq = 0;

  function build(c) {
    var ta = c.ta, CMm = window.CM;
    var S = CMm.state, V = CMm.view, CMD = CMm.commands, L = CMm.language, AC = CMm.autocomplete;
    c.assist = wantsAssist(ta, c.opts);
    c.lesson = lessonFor(ta, c.opts);
    var isRunner = ta.classList.contains('k-runner__code') || !!ta.closest('.k-runner');

    var wrap = el('div', { class: 'ke' + (isRunner ? ' ke--runner' : '') + (c.assist ? '' : ' ke--exam') });
    var host = el('div', { class: 'ke__host' });
    var hintId = 'ke-hint-' + (++hintSeq);
    var ctxBtn = el('button', { type: 'button', class: 'ke__ctx', hidden: '' });
    var hint = el('span', { class: 'ke__hint', id: hintId });
    var tabMsg = el('span', { class: 'ke__tabmsg', role: 'status', 'aria-live': 'polite' });
    var jstat = el('span', { class: 'ke__jedi', role: 'status', 'aria-live': 'polite' });
    var status = el('div', { class: 'ke__status' }, [ctxBtn, el('div', { class: 'ke__row' }, [hint, tabMsg, jstat])]);
    hint.textContent = c.assist ? 'Strg+Leertaste: Vorschläge · Esc, dann Tab: Editor verlassen' : 'Klausur-Modus: nur Farben, keine Vorschläge · Esc, dann Tab: Editor verlassen';
    wrap.appendChild(host); wrap.appendChild(status);
    ta.parentNode.insertBefore(wrap, ta);
    c.wrap = wrap; c.status = status;

    // Zeilenhöhe: mindestens so hoch wie rows der Textarea
    var rows = parseInt(ta.getAttribute('rows') || '0', 10) || Math.min(24, Math.max(4, ta.value.split('\n').length + 1));
    wrap.style.setProperty('--ke-rows', String(Math.max(3, rows)));

    var tabEscape = false;
    var compReadOnly = new S.Compartment();
    var syncing = false;

    function syncToTextarea(doc) {
      syncing = true;
      nativeDesc.set.call(ta, doc);
      syncing = false;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }

    var tabKey = function (view) {
      if (tabEscape) return false;
      if (AC.completionStatus(view.state) === 'active') return AC.acceptCompletion(view);
      var sel = view.state.selection.main;
      if (!sel.empty || view.state.selection.ranges.length > 1) return CMD.indentMore(view);
      var line = view.state.doc.lineAt(sel.head), col = sel.head - line.from, n = 4 - (col % 4);
      view.dispatch(view.state.update({ changes: { from: sel.head, insert: '    '.slice(0, n) }, selection: { anchor: sel.head + n }, userEvent: 'input' }));
      return true;
    };
    var shiftTab = function (view) { if (tabEscape) return false; return CMD.indentLess(view); };
    var escKey = function (view) {
      if (c.assist && view.state.field(sigField, false)) { view.dispatch({ effects: setSig.of(null) }); return true; }
      tabEscape = true; tabMsg.textContent = 'Tab verlässt jetzt den Editor.';
      return false;
    };
    var runKey = function () {
      ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true }));
      return true;
    };

    // Signatur-Tooltip
    var setSig = S.StateEffect.define();
    var sigField = S.StateField.define({
      create: function () { return null; },
      update: function (v, tr) { for (var i = 0; i < tr.effects.length; i++) if (tr.effects[i].is(setSig)) return tr.effects[i].value; return v; },
      provide: function (f) { return V.showTooltip.from(f, function (v) { return v; }); }
    });

    // Theme (Farben kommen aus den Tokens der Website)
    var theme = V.EditorView.theme({
      '&': { color: 'var(--code-text)', backgroundColor: 'var(--code-bg)', fontSize: 'var(--fs-sm)' },
      '.cm-content': { fontFamily: 'var(--dhbw-font-mono)', lineHeight: 'var(--lh-code)', padding: '12px 0', caretColor: '#fff' },
      '.cm-scroller': { fontFamily: 'var(--dhbw-font-mono)', lineHeight: 'var(--lh-code)' },
      '.cm-line': { padding: '0 16px 0 8px' },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#fff', borderLeftWidth: '2px' },
      '.cm-gutters': { backgroundColor: '#18222E', color: '#9CB0C2', border: 'none', borderRight: '1px solid #2C3B4B' },
      '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.05)' },
      '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,.08)', color: '#fff' },
      '.cm-selectionBackground': { backgroundColor: '#35506B' },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': { backgroundColor: '#3F6188' },
      '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: 'rgba(96,165,250,.30)', outline: '1px solid #60A5FA' },
      '.cm-nonmatchingBracket, &.cm-focused .cm-nonmatchingBracket': { backgroundColor: 'rgba(255,120,120,.35)' },
      '.cm-placeholder': { color: '#9CB0C2' },
      '.cm-searchMatch': { backgroundColor: 'rgba(249,115,22,.35)', outline: '1px solid #F97316' },
      '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'rgba(249,115,22,.6)' },
      '&.cm-focused': { outline: 'none' }
    }, { dark: true });

    var exts = [
      V.lineNumbers(), V.highlightActiveLineGutter(), V.highlightSpecialChars(), CMD.history(), V.drawSelection(),
      L.indentUnit.of('    '), S.EditorState.tabSize.of(4), L.indentOnInput(), L.bracketMatching(), AC.closeBrackets(),
      V.highlightActiveLine(), CMm.python(), L.syntaxHighlighting(highlighter()), theme,
      CMm.search.search({ top: true }), CMm.search.highlightSelectionMatches(),
      S.EditorState.phrases.of(DE),
      V.tooltips({ parent: document.body }),
      S.Prec.high(V.keymap.of([
        { key: 'Tab', run: tabKey, shift: shiftTab },
        { key: 'Escape', run: escKey },
        { key: 'Mod-Enter', run: runKey, preventDefault: true },
        { key: 'F1', run: function () { var r = entryAt(c.view.state, c.view.state.selection.main.head, true); openLibrary(r && r.entry ? r.entry.id : undefined); return true; }, preventDefault: true }
      ])),
      V.keymap.of([].concat(AC.closeBracketsKeymap, CMD.defaultKeymap, CMD.historyKeymap, CMm.search.searchKeymap)),
      V.EditorView.contentAttributes.of({ 'aria-label': labelFor(ta), 'aria-describedby': hintId, spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
      V.EditorView.domEventHandlers({
        keydown: function (ev) { if (ev.key !== 'Escape' && ev.key !== 'Tab' && ev.key !== 'Shift' && ev.key !== 'Control' && ev.key !== 'Alt' && ev.key !== 'Meta') { tabEscape = false; if (tabMsg.textContent) tabMsg.textContent = ''; } return false; },
        blur: function () { tabEscape = false; tabMsg.textContent = ''; return false; }
      }),
      compReadOnly.of([]),
      V.EditorView.updateListener.of(function (u) {
        if (u.docChanged && !syncing) syncToTextarea(u.state.doc.toString());
        if (u.docChanged || u.selectionSet) { scheduleCtx(); if (c.assist) scheduleSig(); }
        if (u.focusChanged) {
          if (u.view.hasFocus) { lastEditor = c; c.valueAtFocus = u.state.doc.toString(); if (c.assist) startJedi(); }
          else {
            if (c.assist && c.view.state.field(sigField, false)) c.view.dispatch({ effects: setSig.of(null) });
            if (c.valueAtFocus !== undefined && c.valueAtFocus !== u.state.doc.toString()) ta.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      })
    ];
    if (ta.getAttribute('placeholder')) exts.push(V.placeholder(ta.getAttribute('placeholder')));

    if (c.assist) {
      exts.push(AC.autocompletion({ override: [makeCompleter(c)], activateOnTyping: true, maxRenderedOptions: 60, icons: true, tooltipClass: function () { return 'ke-ac'; } }));
      exts.push(S.Prec.highest(V.keymap.of([{ key: 'Tab', run: function (view) { return (!tabEscape && AC.completionStatus(view.state) === 'active') ? AC.acceptCompletion(view) : false; } }])));
      exts.push(sigField);
      exts.push(V.hoverTooltip(function (view, pos) {
        var r = entryAt(view.state, pos);
        if (!r) return null;
        if (r.entry) {
          return { pos: r.from, end: r.to, above: true, create: function () { return { dom: infoNode(r.entry, c.lesson) }; } };
        }
        if (!jediReady() || !/^[A-Za-z_]\w*$/.test(r.word)) return null;
        var line = view.state.doc.lineAt(r.from);
        return withTimeout(py().rpc('help', { code: view.state.doc.toString(), line: line.number, col: r.from - line.from + 1 }, 2500), 2600).then(function (h) {
          if (!h || !h.doc) return null;
          return { pos: r.from, end: r.to, above: true, create: function () { return { dom: plainInfo(h.name + ' (' + h.type + ')', h.doc, 'Python-Dokumentation (englisch)') }; } };
        }).catch(function () { return null; });
      }, { hoverTime: 350 }));
    }

    var view = new V.EditorView({ state: S.EditorState.create({ doc: nativeDesc.get.call(ta), extensions: exts }), parent: host });
    c.view = view;
    c.compReadOnly = compReadOnly;
    editors.push(c);

    // Textarea verbergen, aber im DOM und synchron halten
    ta.classList.add('ke-source');
    ta.style.display = 'none';
    ta.setAttribute('aria-hidden', 'true');
    ta.tabIndex = -1;
    // ta.value = … von außen (z. B. „Zurücksetzen“) spiegelt in den Editor
    Object.defineProperty(ta, 'value', {
      configurable: true,
      get: function () { return nativeDesc.get.call(ta); },
      set: function (v) {
        nativeDesc.set.call(ta, v);
        if (syncing) return;
        var s = nativeDesc.get.call(ta);
        if (view.state.doc.toString() !== s) {
          syncing = true;
          view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: s }, selection: { anchor: 0 } });
          syncing = false;
        }
      }
    });
    ta.focus = function () { view.focus(); };
    // readonly / disabled der Textarea beobachten
    function applyRO() {
      var ro = ta.readOnly || ta.disabled;
      view.dispatch({ effects: compReadOnly.reconfigure(ro ? [S.EditorState.readOnly.of(true), V.EditorView.editable.of(false)] : []) });
      wrap.classList.toggle('is-readonly', ro);
    }
    applyRO();
    new MutationObserver(applyRO).observe(ta, { attributes: true, attributeFilter: ['readonly', 'disabled'] });

    // Kontextzeile (Cursor auf bekanntem Bezeichner)
    var ctxTimer = null;
    function scheduleCtx() { clearTimeout(ctxTimer); ctxTimer = setTimeout(updateCtx, 120); }
    function updateCtx() {
      if (!c.assist) return;
      var r = entryAt(view.state, view.state.selection.main.head, true);
      if (r && r.entry && view.hasFocus) {
        ctxBtn.hidden = false;
        ctxBtn.textContent = 'ⓘ ' + r.entry.name + ': ' + r.entry.kurz + ' – Mehr in der Bibliothek';
        ctxBtn.onclick = function () { openLibrary(r.entry.id); };
        if (panel && panel.isOpen()) panel.follow(r.entry.id);
      } else if (!view.hasFocus) { /* Zeile bleibt, damit der Klick auf den Knopf klappt */ }
      else { ctxBtn.hidden = true; }
    }

    // Signaturhilfe
    var sigTimer = null, sigGen = 0, sigKey = '';
    function scheduleSig() { clearTimeout(sigTimer); sigTimer = setTimeout(updateSig, 140); }
    function clearSig() { sigKey = ''; sigGen++; if (view.state.field(sigField, false)) view.dispatch({ effects: setSig.of(null) }); }
    function updateSig() {
      if (!view.hasFocus) return;
      var call = findCall(view.state);
      if (!call) { clearSig(); return; }
      var key = call.callee + '|' + call.index + '|' + call.paren;
      if (key === sigKey) return;
      sigKey = key;
      var gen = ++sigGen, fallback = librarySig(call.callee);
      function show(sig) {
        if (gen !== sigGen) return;
        if (!sig) { if (view.state.field(sigField, false)) view.dispatch({ effects: setSig.of(null) }); return; }
        view.dispatch({ effects: setSig.of({ pos: Math.max(0, call.paren), above: true, strictSide: true, arrow: false, create: function () { var d = sigNode(sig); d.classList.add('cm-tooltip-sig'); return { dom: d }; } }) });
      }
      if (jediReady()) {
        var line = view.state.doc.lineAt(view.state.selection.main.head);
        withTimeout(py().rpc('sig', { code: view.state.doc.toString(), line: line.number, col: view.state.selection.main.head - line.from }, 2500), 2600).then(function (r) {
          if (r && r.params) show({ name: r.name, params: r.params, index: r.index == null ? -1 : r.index });
          else show(fallback && Object.assign({}, fallback, { index: Math.min(call.index, 99) }));
        }).catch(function () { show(fallback); });
      } else {
        show(fallback && Object.assign({}, fallback, { index: -1 }));
      }
    }

    // Status der Vervollständigung
    function setJ(s) {
      if (!c.assist) { jstat.textContent = ''; return; }
      jstat.textContent = STATUS_TEXT[s] || STATUS_TEXT.base;
      jstat.setAttribute('data-state', s);
    }
    if (c.assist) {
      wireStatus();
      statusSubscribers.push(setJ);
      setJ(py() ? py().status : 'base');
    }
    view.dom.addEventListener('focusin', function () { if (c.assist) startJedi(); });
    return c;
  }

  /* ── Öffentliche API ─────────────────────────────────────── */
  function attach(ta, opts) {
    if (!ta || ta.tagName !== 'TEXTAREA') return null;
    var existing = registry.get(ta);
    if (existing) return existing;
    ensureCss();
    var c = { ta: ta, opts: opts || {}, view: null, assist: true, lesson: null };
    registry.set(ta, c);
    c.ready = Promise.all([loadCM(), loadLib()]).then(function () {
      if (!document.contains(ta)) { registry.delete(ta); return null; }
      return build(c);
    }).catch(function (err) {
      registry.delete(ta);
      ta.classList.remove('ke-source'); ta.style.display = '';
      if (window.console) console.warn('[KursEditor] Fallback auf einfache Textarea:', err && err.message);
      return null;
    });
    return c;
  }
  function getValue(ta) {
    var c = registry.get(ta);
    if (c && c.view) return c.view.state.doc.toString();
    return ta.value;
  }
  function setValue(ta, code) {
    var c = registry.get(ta);
    code = String(code == null ? '' : code);
    if (c && c.view) {
      c.view.dispatch({ changes: { from: 0, to: c.view.state.doc.length, insert: code }, selection: { anchor: 0 } });
      // updateListener hat Textarea + input-Event bereits bedient; falls der Text gleich blieb, trotzdem melden
    } else {
      ta.value = code;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function autoAttach(root) {
    $$('textarea.py-editor, textarea.k-runner__code, .k-runner textarea', root).forEach(function (ta) {
      if (ta.hasAttribute('data-no-editor')) return;
      attach(ta, {});
    });
  }

  function initPanelButton() {
    var body = document.body;
    if (!body) return;
    if (body.getAttribute('data-page') === 'bibliothek' || body.getAttribute('data-assist') === 'off' || body.getAttribute('data-library') === 'off') return;
    loadLib().then(function () { buildPanel(); });
  }

  function init() {
    ensureCss();
    autoAttach(document);
    initPanelButton();
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.tagName === 'TEXTAREA') { if (n.matches('.py-editor, .k-runner__code') || n.closest('.k-runner')) attach(n, {}); }
            else if (n.querySelector) autoAttach(n);
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  window.KursEditor = {
    attach: attach,
    getValue: getValue,
    setValue: setValue,
    openLibrary: openLibrary,
    hasEditor: canTake,
    controller: function (ta) { return registry.get(ta) || null; },
    lib: {
      load: loadLib,
      get entries() { return lib.entries; },
      byId: function (id) { return lib.byId[id]; },
      search: searchEntries,
      renderDetail: function (e, o) { return renderDetail(e, Object.assign({ canTake: canTake, take: takeCode }, o || {})); },
      isLater: isLater,
      codeBlock: codeBlock,
      ampelChip: ampelChip,
      lessonNum: lessonNum,
      loadBundle: loadCM
    }
  };

  // Schon beim Laden bereitstellen, damit codeBlock() in Seiten ohne Editor funktioniert
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
