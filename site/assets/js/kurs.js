/* =============================================================
   kurs.js – Fortschritt, Quiz-Engine, Python-Runner (Pyodide), Aufdecken
   Kein Framework, kein Build. Seite funktioniert auch ohne localStorage.
   ============================================================= */
(function () {
  'use strict';

  var PYODIDE_VERSION = 'v0.26.4';
  /* Selbst gehostet (Lern-App): window.KURS_PYODIDE_BASIS (absolute URL, Schrägstrich am Ende); sonst CDN wie bisher */
  var PYODIDE_LOKAL = !!window.KURS_PYODIDE_BASIS;
  var PYODIDE_BASE = window.KURS_PYODIDE_BASIS || ('https://cdn.jsdelivr.net/pyodide/' + PYODIDE_VERSION + '/full/');

  /* ── Hilfsfunktionen ─────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ── (a) Speicher über KursSpeicher (speicher.js) ───────── */
  var Store = {
    /* über KursSpeicher (speicher.js): Pfad inf-mb/<lektion>/<schluessel> */
    get: function (lesson, key) {
      return window.KursSpeicher.sofort.lesen(window.KursSpeicher.pfad(lesson, key));
    },
    set: function (lesson, key, value) {
      var p = window.KursSpeicher.pfad(lesson, key);
      if (value === null || value === undefined) window.KursSpeicher.sofort.loeschen(p);
      else window.KursSpeicher.sofort.schreiben(p, value);
    }
  };

  /* ── Fortschritt pro Abschnitt ───────────────────────────── */
  function doneSections(lesson) { return Store.get(lesson, 'done') || {}; }

  function updateProgress(lesson) {
    var sections = $$('.k-section[data-section]');
    var done = doneSections(lesson);
    var n = 0;
    sections.forEach(function (s) {
      var id = s.getAttribute('data-section');
      if (done[id]) n++;
      var link = $('.k-toc a[href="#' + id + '"]');
      if (link) link.classList.toggle('is-done', !!done[id]);
    });
    var pct = sections.length ? Math.round(100 * n / sections.length) : 0;
    $$('[data-progress-for="' + lesson + '"]').forEach(function (p) {
      var fill = $('.k-progress__fill', p);
      var txt = $('.k-progress__text', p);
      var bar = $('.k-progress__bar', p);
      if (fill) fill.style.width = pct + '%';
      if (txt) txt.textContent = n + ' von ' + sections.length + ' Abschnitten';
      if (bar) { bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-valuenow', String(pct)); bar.setAttribute('aria-label', 'Fortschritt ' + lesson.toUpperCase()); }
    });
  }

  function initProgress() {
    var lesson = document.body.getAttribute('data-lesson');
    if (!lesson) return;
    var done = doneSections(lesson);
    $$('.k-section[data-section]').forEach(function (sec) {
      var id = sec.getAttribute('data-section');
      var inner = $('.k-section__inner', sec) || sec;
      var btn = el('button', { type: 'button', class: 'k-btn k-btn--link k-btn--small', 'aria-pressed': done[id] ? 'true' : 'false' });
      function label() {
        btn.textContent = '';
        if (btn.getAttribute('aria-pressed') === 'true') { btn.appendChild(window.KIcon('check')); btn.appendChild(document.createTextNode('Abschnitt erledigt (rückgängig)')); }
        else btn.textContent = 'Abschnitt als erledigt markieren';
      }
      label();
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        var d = doneSections(lesson); if (on) d[id] = 1; else delete d[id];
        Store.set(lesson, 'done', d);
        label(); updateProgress(lesson);
      });
      sec._markDone = function () {
        if (btn.getAttribute('aria-pressed') !== 'true') btn.click();
      };
      inner.appendChild(el('div', { class: 'k-done' }, [btn]));
    });
    updateProgress(lesson);

    // aktive Sprungmarke
    if ('IntersectionObserver' in window) {
      var links = $$('.k-toc a[href^="#"]');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
            links.forEach(function (a) { if (a.classList.contains('is-active')) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
          }
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      $$('.k-section[id]').forEach(function (s) { io.observe(s); });
    }
  }

  function initIndexProgress() {
    $$('[data-lesson-progress]').forEach(function (n) {
      var lesson = n.getAttribute('data-lesson-progress');
      var total = parseInt(n.getAttribute('data-total') || '7', 10);
      var c = Object.keys(doneSections(lesson)).length;
      if (c > 0) { n.textContent = 'Lerneinheit: ' + c + ' von ' + total + ' Abschnitten erledigt'; n.hidden = false; }
    });
  }

  /* ── (d) Aufdeck-Knöpfe ──────────────────────────────────── */
  function initReveal() {
    $$('[data-reveal]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('data-reveal'));
      if (!target) return;
      var showTxt = btn.getAttribute('data-label-show') || btn.textContent.trim();
      var hideTxt = btn.getAttribute('data-label-hide') || 'Lösung verbergen';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', target.id);
      target.hidden = true;
      btn.addEventListener('click', function () {
        var open = target.hidden;
        target.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? hideTxt : showTxt;
      });
    });
  }

  /* ── (b) Quiz-Engine ─────────────────────────────────────── */
  function parseNum(s) {
    s = String(s).replace(/[\s '’]/g, '').replace(/,/g, '.');
    if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
    if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  }
  function normOut(s) {
    return String(s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean).join('\n');
  }

  function initQuiz(quiz) {
    var qs = $$('.k-q', quiz);
    var scoreBox = $('[data-score]', quiz);
    var lesson = document.body.getAttribute('data-lesson');
    var quizId = quiz.getAttribute('data-quiz') || 'quiz';
    var state = {}; // id -> {answered, pts}
    var total = 0;
    qs.forEach(function (q) { total += parseFloat(q.getAttribute('data-points') || '1'); });

    function renderScore() {
      var got = 0, answered = 0;
      Object.keys(state).forEach(function (k) { if (state[k].answered) { answered++; got += state[k].pts; } });
      if (scoreBox) {
        scoreBox.innerHTML = '';
        scoreBox.appendChild(el('span', { class: 'k-score__val', text: got + ' / ' + total + ' Punkte' }));
        var pct = total ? Math.round(100 * got / total) : 0;
        var msg = answered < qs.length
          ? answered + ' von ' + qs.length + ' Aufgaben bearbeitet. Punkte gibt es nur für den ersten Versuch.'
          : (pct >= 50 ? 'Bestanden (' + pct + ' %). ' : 'Noch unter 50 % (' + pct + ' %). ') + (got < total ? 'Schau dir die Erklärungen zu den Aufgaben ohne volle Punktzahl nochmal an.' : 'Volle Punktzahl.');
        scoreBox.appendChild(el('span', { text: msg, role: 'status' }));
      }
      if (lesson && answered === qs.length && qs.length) {
        Store.set(lesson, 'quiz-' + quizId, { got: got, total: total });
        var sec = quiz.closest('.k-section');
        if (sec && sec._markDone) sec._markDone();
      }
    }

    qs.forEach(function (q, idx) {
      var type = q.getAttribute('data-type');
      var pts = parseFloat(q.getAttribute('data-points') || '1');
      var id = q.getAttribute('data-id') || ('q' + idx);
      state[id] = { answered: false, pts: 0, tries: 0 };
      var explSrc = $('.k-q__expl', q);
      var explHTML = explSrc ? explSrc.innerHTML : '';
      if (explSrc) explSrc.hidden = true;
      var fb = el('div', { class: 'k-q__fb', role: 'status', 'aria-live': 'polite', hidden: '' });
      var actions = el('div', { class: 'k-q__actions' });
      var checkBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Prüfen' });
      var retryBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Nochmal versuchen', hidden: '' });
      actions.appendChild(checkBtn); actions.appendChild(retryBtn);
      var getAnswer, markOptions, lockInputs;

      if (type === 'mc') {
        var list = $('.k-q__options', q);
        var items = $$('li', list);
        var multi = items.filter(function (li) { return li.hasAttribute('data-correct'); }).length > 1;
        var fs = el('fieldset');
        fs.appendChild(el('legend', { class: 'k-sr', text: 'Antwortmöglichkeiten' }));
        var inputs = [];
        items.forEach(function (li, i) {
          var inp = el('input', { type: multi ? 'checkbox' : 'radio', name: quizId + '-' + id, id: quizId + '-' + id + '-' + i });
          var lab = el('label', { class: 'k-q__opt', 'for': inp.id });
          lab.appendChild(inp);
          var span = el('span'); span.innerHTML = li.innerHTML; lab.appendChild(span);
          lab._correct = li.hasAttribute('data-correct');
          inputs.push({ inp: inp, lab: lab });
          fs.appendChild(lab);
        });
        list.replaceWith(fs);
        getAnswer = function () {
          var sel = inputs.filter(function (o) { return o.inp.checked; });
          if (!sel.length) return null;
          var ok = inputs.every(function (o) { return o.inp.checked === o.lab._correct; });
          return { ok: ok };
        };
        markOptions = function () { inputs.forEach(function (o) { o.lab.classList.toggle('is-right', o.lab._correct); o.lab.classList.toggle('is-wrong', o.inp.checked && !o.lab._correct); }); };
        lockInputs = function (lock) { inputs.forEach(function (o) { o.inp.disabled = lock; if (!lock) { o.lab.classList.remove('is-right', 'is-wrong'); } }); };
        q.appendChild(fs); // ensure position
        q.appendChild(actions); q.appendChild(fb);
      } else {
        var input = el('input', { type: 'text', class: 'k-q__input', id: quizId + '-' + id + '-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
        var label = el('label', { 'for': input.id, class: 'k-sr', text: 'Deine Antwort' });
        var row = el('div'); row.appendChild(label); row.appendChild(input);
        q.appendChild(row); q.appendChild(actions); q.appendChild(fb);
        var ans = q.getAttribute('data-answer') || '';
        if (type === 'num') {
          input.setAttribute('inputmode', 'decimal');
          input.setAttribute('placeholder', q.getAttribute('data-unit') ? 'Zahl in ' + q.getAttribute('data-unit') : 'Zahl');
        } else {
          input.setAttribute('placeholder', 'Ausgabe, genau wie Python sie druckt');
        }
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkBtn.click(); } });
        getAnswer = function () {
          var v = input.value;
          if (!v.trim()) return null;
          if (type === 'num') {
            var x = parseNum(v), target = parseFloat(ans);
            var tol = parseFloat(q.getAttribute('data-tol') || '0');
            var rel = parseFloat(q.getAttribute('data-tol-rel') || '0');
            if (isNaN(x)) return { ok: false, invalid: true };
            return { ok: Math.abs(x - target) <= Math.max(tol, Math.abs(target) * rel) + 1e-12 };
          }
          var mine = normOut(v);
          return { ok: ans.split('|').some(function (a) { return normOut(a.replace(/\\n/g, '\n')) === mine; }) };
        };
        markOptions = function (ok) { input.style.borderColor = ok ? 'var(--k-ok)' : 'var(--k-bad)'; };
        lockInputs = function (lock) { input.readOnly = lock; if (!lock) input.style.borderColor = ''; };
      }

      function show(res) {
        var ok = res.ok;
        fb.hidden = false;
        fb.className = 'k-q__fb ' + (ok ? 'is-right' : 'is-wrong');
        var head;
        if (res.invalid) head = 'Das ist keine Zahl. Beispiel: 3,5 oder 1e-3.';
        else head = ok ? 'Richtig.' : 'Nicht ganz.';
        var pointsTxt = '';
        if (!state[id].answered && !res.invalid) {
          state[id].answered = true; state[id].pts = ok ? pts : 0;
          setTimeout(function () { releasePres(q); }, 0);
          pointsTxt = ok ? ' +' + pts + ' P.' : ' 0 von ' + pts + ' P. (erster Versuch).';
        }
        fb.innerHTML = '';
        var fbHead = el('strong');
        if (!res.invalid) fbHead.appendChild(window.KIcon(ok ? 'check' : 'x'));
        fbHead.appendChild(document.createTextNode((res.invalid ? '' : ' ') + head + pointsTxt));
        fb.appendChild(fbHead);
        if (!res.invalid && explHTML) { var d = el('div'); d.innerHTML = explHTML; fb.appendChild(d); }
        if (!res.invalid) {
          markOptions(ok);
          if (ok) { lockInputs(true); checkBtn.hidden = true; retryBtn.hidden = true; }
          else { lockInputs(true); checkBtn.hidden = true; retryBtn.hidden = false; }
          renderScore();
        }
      }
      checkBtn.addEventListener('click', function () {
        var res = getAnswer();
        if (!res) { fb.hidden = false; fb.className = 'k-q__fb is-wrong'; fb.textContent = 'Wähle oder tippe erst eine Antwort.'; return; }
        state[id].tries++;
        show(res);
      });
      retryBtn.addEventListener('click', function () {
        lockInputs(false); fb.hidden = true; retryBtn.hidden = true; checkBtn.hidden = false;
      });
    });
    renderScore();
  }

  /* ── (c) Python im Browser (Pyodide im Web Worker) ───────── */
  function workerMain() {
    var pyodide = null;
    var lokal = false;   // true: Pakete aus dem eigenen Ordner, nichts von PyPI
    // Python-Hilfsfunktionen für die Code-Vervollständigung im Editor (editor.js)
    var JEDI_PY = [
      'import jedi, json',
      '_kc_last = {"tok": 0, "comps": []}',
      'def _kc_complete(code, line, col, extra=None):',
      '    try:',
      '        comps = jedi.Script(code).complete(line, col)',
      '    except Exception:',
      '        return json.dumps({"tok": 0, "items": []})',
      '    _kc_last["tok"] += 1',
      '    _kc_last["comps"] = comps',
      '    return json.dumps({"tok": _kc_last["tok"], "items": [[c.name, c.type, i] for i, c in enumerate(comps[:150])]})',
      'def _kc_doc(code, line, col, extra=None):',
      '    tok, i = json.loads(extra)',
      '    if tok != _kc_last["tok"]:',
      '        return "null"',
      '    try:',
      '        return json.dumps({"doc": (_kc_last["comps"][i].docstring(raw=False) or "")[:700]})',
      '    except Exception:',
      '        return "null"',
      'def _kc_sig(code, line, col, extra=None):',
      '    try:',
      '        sigs = jedi.Script(code).get_signatures(line, col)',
      '        if not sigs:',
      '            return "null"',
      '        s = sigs[0]',
      '        return json.dumps({"name": s.name, "index": s.index, "params": [p.to_string() for p in s.params]})',
      '    except Exception:',
      '        return "null"',
      'def _kc_help(code, line, col, extra=None):',
      '    try:',
      '        names = jedi.Script(code).help(line, col)',
      '        if not names:',
      '            return "null"',
      '        n = names[0]',
      '        return json.dumps({"name": n.name, "type": n.type, "full": n.full_name, "doc": (n.docstring(raw=False) or "")[:700]})',
      '    except Exception:',
      '        return "null"'
    ];
    function clean(msg) {
      var i = msg.indexOf('File "<exec>"');
      if (i >= 0) {
        var start = msg.lastIndexOf('\n', i);
        return 'Traceback (most recent call last):\n' + msg.slice(start + 1);
      }
      return msg;
    }
    /* ── Labor-Erweiterungen im Worker: Dateien, Pakete, reiche Ausgaben, HTTP ── */
    var curId = 0, fileCache = {}, loadedPk = {}, mplReady = false, httpReady = false, kaReady = false;
    var PK_INFO = { numpy: ['NumPy', 8], pandas: ['pandas', 16], matplotlib: ['matplotlib', 22], scipy: ['SciPy', 30] };
    self._kc_rich = function (art, daten) { self.postMessage({ type: 'rich', id: curId, art: art, daten: daten }); };
    var KURSAUSGABE_PY = [
      'import sys, types, json, js',
      '_m = types.ModuleType("kursausgabe")',
      '_m.__doc__ = "Reiche Ausgaben (Bild, 3D) an die Kursseite senden."',
      'def zeige(art, daten):',
      '    if not isinstance(daten, str):',
      '        daten = json.dumps(daten)',
      '    js._kc_rich(art, daten)',
      '_m.zeige = zeige',
      'sys.modules["kursausgabe"] = _m',
      'del _m',
      // Konsolen-Echo: Rückgabewerte von plt.plot(...) und con.execute(...) nicht als Zeile ausgeben
      '_dh = sys.displayhook',
      'def _kc_dh(v):',
      '    xs = v if isinstance(v, (list, tuple)) and v else [v]',
      '    if all(type(x).__module__.split(".")[0] in ("matplotlib", "sqlite3") for x in xs):',
      '        return',
      '    _dh(v)',
      'sys.displayhook = _kc_dh'
    ].join('\n');
    var MPL_PY = [
      'import io, base64, matplotlib',
      'matplotlib.use("Agg")',
      'import matplotlib.pyplot as _plt, kursausgabe',
      'def _kc_show(*args, **kwargs):',
      '    for num in _plt.get_fignums():',
      '        fig = _plt.figure(num)',
      '        alt = "Diagramm"',
      '        if fig.axes and fig.axes[0].get_title():',
      '            alt = "Diagramm: " + fig.axes[0].get_title()',
      '        elif fig._suptitle is not None:',
      '            alt = "Diagramm: " + fig._suptitle.get_text()',
      '        buf = io.BytesIO()',
      '        fig.savefig(buf, format="png", dpi=100, bbox_inches="tight")',
      '        kursausgabe.zeige("bild", {"png": base64.b64encode(buf.getvalue()).decode("ascii"), "alt": alt})',
      '    _plt.close("all")',
      '_plt.show = _kc_show',
      'del _kc_show',
      '_f = _plt.figure()',
      '_f.add_subplot(111).plot([0, 1])',
      '_f.savefig(io.BytesIO(), format="png")',
      '_plt.close("all")'
    ].join('\n');
    // requests: echtes requests-Paket + pyodide-http (synchrones XMLHttpRequest im Worker); relative URLs gegen die Seite auflösen
    var HTTP_PY = [
      'import js, pyodide_http, requests, urllib.parse',
      'pyodide_http.patch_all()',
      '_orig_request = requests.sessions.Session.request',
      'def _kc_request(self, method, url, *args, **kwargs):',
      '    url = urllib.parse.urljoin(str(js._kc_page), str(url))',
      '    return _orig_request(self, method, url, *args, **kwargs)',
      'requests.sessions.Session.request = _kc_request'
    ].join('\n');
    function listFiles() {
      var FS = pyodide.FS, out = {};
      FS.readdir(FS.cwd()).forEach(function (n) {
        if (n === '.' || n === '..') return;
        try {
          var st = FS.stat(n);
          if (!FS.isDir(st.mode)) out[n] = st.size + ':' + (+st.mtime);
        } catch (e) { /* ignorieren */ }
      });
      return out;
    }
    function fetchFile(u) {
      if (!fileCache[u]) {
        fileCache[u] = fetch(u).then(function (r) {
          if (!r.ok) throw new Error('Beispieldatei ' + decodeURIComponent(u.split('?')[0].split('/').pop()) + ' nicht ladbar (HTTP ' + r.status + ')');
          return r.arrayBuffer();
        }).then(function (b) { return new Uint8Array(b); });
        fileCache[u].catch(function () { delete fileCache[u]; });
      }
      return fileCache[u];
    }
    var WIPE_PY = ['import os, shutil', 'for _n in os.listdir("."):', '    _p = os.path.join(".", _n)', '    if os.path.isdir(_p) and not os.path.islink(_p):', '        shutil.rmtree(_p, ignore_errors=True)', '    else:', '        os.remove(_p)'].join(String.fromCharCode(10));
    var ZIP_PY = ['import zipfile, os', 'zipfile.ZipFile(_kc_zip).extractall(".")', 'os.remove(_kc_zip)'].join(String.fromCharCode(10));
    var PATH_PY = ['import sys, os, importlib', 'if os.getcwd() not in sys.path:', '    sys.path.insert(0, os.getcwd())', 'importlib.invalidate_caches()'].join(String.fromCharCode(10));
    function prepareFiles(m) {
      var FS = pyodide.FS;
      // frisches Arbeitsverzeichnis: Dateien und Ordner früherer Läufe entfernen
      pyodide.runPython(WIPE_PY);
      return Promise.all((m.files || []).map(function (u) {
        return fetchFile(u).then(function (data) { return { name: decodeURIComponent(u.split('?')[0].split('/').pop()), data: data }; });
      })).then(function (list) {
        list.forEach(function (f) { FS.writeFile(f.name, f.data); });
        (m.upload || []).forEach(function (f) { FS.writeFile(f.name, f.data); });
        // ZIP-Dateien entpacken (Ordnerstruktur bleibt erhalten), das ZIP selbst verschwindet
        list.concat(m.upload || []).forEach(function (f) {
          if (!/\.zip$/i.test(f.name)) return;
          pyodide.globals.set('_kc_zip', f.name);
          pyodide.runPython(ZIP_PY);
        });
        pyodide.runPython(PATH_PY);
      });
    }
    function importsOf(text) {
      var found = {};
      ['numpy', 'pandas', 'matplotlib', 'scipy', 'requests'].forEach(function (k) {
        if (new RegExp('^[ \\t]*(?:import|from)[ \\t][^\\n#]*\\b' + k + '\\b', 'm').test(text || '')) found[k] = true;
      });
      return found;
    }
    function loadPackages(m) {
      var texts = [m.code]; if (m.scan) texts.push(m.scan);
      var imp = {};
      texts.forEach(function (t) { var f = importsOf(t); Object.keys(f).forEach(function (k) { imp[k] = true; }); });
      var need = Object.keys(PK_INFO).filter(function (k) { return imp[k] && !loadedPk[k]; });
      if ((imp.pandas || imp.matplotlib || imp.scipy) && !loadedPk.numpy && need.indexOf('numpy') < 0) need.unshift('numpy');
      if (need.length) {
        var mb = need.reduce(function (s, k) { return s + PK_INFO[k][1]; }, 0);
        self.postMessage({ type: 'status', id: m.id, text: need.map(function (k) { return PK_INFO[k][0]; }).join(', ') + ' wird geladen … nur beim ersten Mal, ca. ' + mb + ' MB' });
      }
      var quiet = { messageCallback: function () {}, errorCallback: function () {} };
      var p = Promise.resolve();
      texts.forEach(function (t) { p = p.then(function () { return pyodide.loadPackagesFromImports(t, quiet); }); });
      if (imp.requests && !httpReady) {
        self._kc_page = m.page || '';
        p = p.then(function () { return pyodide.loadPackage(['requests', 'pyodide-http'], quiet); })
          .then(function () { pyodide.runPython(HTTP_PY); httpReady = true; });
      }
      // Importe vorwärmen, damit sie nicht auf die Laufzeitgrenze des Programms zählen
      var warm = [];
      if (imp.numpy || imp.pandas || imp.matplotlib || imp.scipy) warm.push('import numpy');
      if (imp.pandas) warm.push('import warnings', 'warnings.filterwarnings("ignore", message="(?s).*Pyarrow")', 'import pandas', 'pandas.set_option("display.width", 110)', 'pandas.set_option("display.max_columns", 20)');
      if (imp.scipy) warm.push('import scipy');
      if (warm.length) p = p.then(function () { pyodide.runPython(warm.join(String.fromCharCode(10))); });
      if ((imp.matplotlib || imp.pylab) && !mplReady) {
        p = p.then(function () { pyodide.runPython(MPL_PY); mplReady = true; });
      }
      return p.then(function () {
        need.forEach(function (k) { loadedPk[k] = true; });
        self._kc_page = m.page || self._kc_page || '';
        if (need.length) self.postMessage({ type: 'status', id: m.id, text: '' });
      });
    }
    function sendNewFiles(m, before) {
      var FS = pyodide.FS, after = listFiles(), list = [], tr = [];
      Object.keys(after).forEach(function (n) {
        if (before[n] === after[n] || /\.pyc$/.test(n) || list.length >= 12) return;
        var data = FS.readFile(n);
        list.push({ name: n, data: data }); tr.push(data.buffer);
      });
      if (list.length) self.postMessage({ type: 'files', id: m.id, files: list }, tr);
    }
    function runJob(m) {
      curId = m.id;
      pyodide.setStdout({ batched: function (s) { self.postMessage({ type: 'out', id: m.id, text: s + '\n' }); } });
      pyodide.setStderr({ batched: function (s) { self.postMessage({ type: 'err', id: m.id, text: s + '\n' }); } });
      pyodide.setStdin({ stdin: function () { return undefined; } });
      var before = {};
      Promise.resolve().then(function () {
        if (!kaReady) { pyodide.runPython(KURSAUSGABE_PY); kaReady = true; }
        return prepareFiles(m);
      }).then(function () { return loadPackages(m); }).then(function () {
        before = listFiles();
        self.postMessage({ type: 'started', id: m.id });
        var g = pyodide.globals.get('dict')();
        if (m.harness) {
          // Harness-Modus (Konsolen-Echo, Visualisierer): Python-Hilfsprogramm statt des Codes selbst; Code kommt als _kc_src
          var v = m.vars || {};
          Object.keys(v).forEach(function (k) { g.set(k, v[k]); });
          g.set('_kc_src', m.code);
          return pyodide.runPythonAsync(m.harness, { globals: g }).then(function (r) { try { g.destroy(); } catch (x) {} return r == null ? '' : String(r); });
        }
        return pyodide.runPythonAsync(m.code, { globals: g }).then(function () { try { g.destroy(); } catch (x) {} return undefined; });
      }).then(function (result) {
        try { sendNewFiles(m, before); } catch (e) { /* ignorieren */ }
        self.postMessage({ type: 'done', id: m.id, result: result });
      }).catch(function (err) {
        try { sendNewFiles(m, before); } catch (e) { /* ignorieren */ }
        self.postMessage({ type: 'done', id: m.id, error: clean(String(err && err.message ? err.message : err)) });
      });
    }
    self.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'init') {
        lokal = !!m.lokal;
        try {
          importScripts(m.base + 'pyodide.js');
          self.loadPyodide({ indexURL: m.base }).then(function (p) {
            pyodide = p;
            self.postMessage({ type: 'ready' });
          }).catch(function (err) { self.postMessage({ type: 'initerror', message: String(err) }); });
        } catch (err) { self.postMessage({ type: 'initerror', message: String(err) }); }
      } else if (m.type === 'jedi-init') {
        // Editor-Integration: Jedi per micropip nachladen und Hilfsfunktionen in den Haupt-Namensraum legen
        // Selbst gehostet: jedi und parso kommen per loadPackage aus dem eigenen Ordner, nichts von PyPI
        (lokal ? pyodide.loadPackage(['jedi']).then(function () {
          return pyodide.runPythonAsync(JEDI_PY.join('\n'));
        }) : pyodide.loadPackage('micropip').then(function () {
          return pyodide.runPythonAsync(['import micropip', "await micropip.install('jedi')"].concat(JEDI_PY).join('\n'));
        })).then(function () {
          self.postMessage({ type: 'rpc', rid: m.rid, ok: true, result: 'ok' });
        }).catch(function (err) {
          self.postMessage({ type: 'rpc', rid: m.rid, ok: false, error: String(err && err.message ? err.message : err) });
        });
      } else if (m.type === 'rpc') {
        var fn = null;
        try {
          fn = pyodide.globals.get('_kc_' + m.fn);
          if (!fn) throw new Error('Jedi nicht bereit');
          var res = fn(m.code, m.line, m.col, m.extra);
          self.postMessage({ type: 'rpc', rid: m.rid, ok: true, result: String(res) });
        } catch (err) {
          self.postMessage({ type: 'rpc', rid: m.rid, ok: false, error: String(err && err.message ? err.message : err) });
        } finally { try { if (fn) fn.destroy(); } catch (x) {} }
      } else if (m.type === 'run') {
        runJob(m);
      }
    };
  }

  /* ── Konsolen-Echo: Python-Hilfsprogramm (läuft im Worker, Code kommt als _kc_src) ──
     Oberste Ausdrucks-Anweisungen werden im 'single'-Modus kompiliert und geben so ihren repr aus
     (None bleibt still, Zuweisungen geben nichts aus). Eine Exception beendet den Lauf mit Kurz-Traceback. */
  var CONSOLE_PY = String.raw`
import ast, sys, builtins, traceback
_lines = _kc_stdin.split("\n") if _kc_stdin else []
if _lines and _lines[-1] == "":
    _lines.pop()
_pos = 0
def _kc_input(prompt=""):
    global _pos
    sys.stdout.write(str(prompt))
    if _pos >= len(_lines):
        sys.stdout.write("\n")
        raise EOFError("input() braucht eine Eingabe, aber im Feld \u201eEingaben\u201c steht keine Zeile mehr. Trage dort f\u00fcr jedes input() eine Zeile ein.")
    v = _lines[_pos]
    _pos += 1
    sys.stdout.write(v + "\n")
    return v
_orig_input = builtins.input
builtins.input = _kc_input
_result = ""
try:
    try:
        _tree = ast.parse(_kc_src, "<code>")
    except SyntaxError as e:
        _tree = None
        _result = "Traceback (most recent call last):\n  Zeile %s\nSyntaxError: %s" % (e.lineno, e.msg)
    if _tree is not None:
        _g = {"__name__": "__main__"}
        for _node in _tree.body:
            try:
                if isinstance(_node, ast.Expr):
                    _co = compile(ast.Interactive(body=[_node]), "<code>", "single")
                else:
                    _co = compile(ast.Module(body=[_node], type_ignores=[]), "<code>", "exec")
                exec(_co, _g)
            except SystemExit:
                break
            except BaseException as e:
                _fr = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "<code>"]
                _ln = _fr[-1].lineno if _fr else _node.lineno
                _all = _kc_src.split("\n")
                _txt = _all[_ln - 1].strip() if 0 < _ln <= len(_all) else ""
                _msg = ("%s: %s" % (type(e).__name__, e)) if str(e) else type(e).__name__
                _result = "Traceback (most recent call last):\n  Zeile %d: %s\n%s" % (_ln, _txt, _msg)
                break
finally:
    builtins.input = _orig_input
    sys.stdout.flush()
_result
`;

  var Py = {
    worker: null, ready: null, chain: Promise.resolve(), seq: 0, handler: null, statusCb: [],
    // Editor-Integration (editor.js): Jedi-Vervollständigung über denselben Worker
    status: 'idle',          // idle | python | jedi | ready | error
    jediP: null, jediFailed: false, rpcSeq: 0, rpcs: {},
    setStatus: function (s) {
      Py.status = s;
      Py.statusCb.forEach(function (cb) { try { cb(s); } catch (e) {} });
    },
    onStatus: function (cb) { Py.statusCb.push(cb); },
    rpcRaw: function (msg, timeout) {
      return new Promise(function (resolve, reject) {
        if (!Py.worker) { reject(new Error('Python nicht bereit')); return; }
        var rid = ++Py.rpcSeq;
        var t = setTimeout(function () { delete Py.rpcs[rid]; reject(new Error('Zeitüberschreitung')); }, timeout || 3000);
        Py.rpcs[rid] = { resolve: resolve, reject: reject, t: t };
        msg.rid = rid;
        Py.worker.postMessage(msg);
      });
    },
    // fn: 'complete' | 'doc' | 'sig' | 'help'; liefert geparstes JSON
    rpc: function (fn, args, timeout) {
      if (Py.status !== 'ready') return Promise.reject(new Error('Jedi nicht bereit'));
      return Py.rpcRaw({ type: 'rpc', fn: fn, code: args.code, line: args.line, col: args.col, extra: JSON.stringify(args.extra || null) }, timeout)
        .then(function (r) { return JSON.parse(r); });
    },
    ensureJedi: function () {
      if (Py.jediP) return Py.jediP;
      if (Py.jediFailed) return Promise.reject(new Error('Jedi nicht verfügbar'));
      Py.setStatus('python');
      var p = Py.ensure().then(function () {
        Py.setStatus('jedi');
        return Py.rpcRaw({ type: 'jedi-init' }, 120000);
      }).then(function () {
        Py.setStatus('ready');
      }).catch(function (err) {
        Py.jediP = null;
        if (Py.status === 'jedi') Py.jediFailed = true;   // Jedi selbst scheiterte: nicht erneut versuchen
        Py.setStatus(Py.jediFailed ? 'error' : 'idle');
        throw err;
      });
      Py.jediP = p;
      p.catch(function () {});
      return p;
    },
    ensure: function () {
      if (Py.ready) return Py.ready;
      Py.ready = new Promise(function (resolve, reject) {
        var w;
        try {
          var blob = new Blob(['(' + workerMain.toString() + ')()'], { type: 'text/javascript' });
          w = new Worker(URL.createObjectURL(blob));
        } catch (e) { reject(new Error('Web Worker nicht verfügbar: ' + e.message)); return; }
        Py.worker = w;
        w.onmessage = function (ev) {
          var m = ev.data;
          if (m.type === 'rpc') {
            var q = Py.rpcs[m.rid];
            if (q) { clearTimeout(q.t); delete Py.rpcs[m.rid]; if (m.ok) q.resolve(m.result); else q.reject(new Error(m.error || 'Fehler')); }
          }
          else if (m.type === 'ready') resolve();
          else if (m.type === 'initerror') { Py.reset(); reject(new Error(m.message)); }
          else if (Py.handler) Py.handler(m);
        };
        w.onerror = function (ev) { Py.reset(); reject(new Error(ev.message || 'Worker-Fehler')); };
        w.postMessage({ type: 'init', base: PYODIDE_BASE, lokal: PYODIDE_LOKAL });
      });
      Py.ready.catch(function () { /* wird beim Aufrufer behandelt */ });
      return Py.ready;
    },
    reset: function () {
      if (Py.worker) { try { Py.worker.terminate(); } catch (e) {} }
      Py.worker = null; Py.ready = null; Py.handler = null;
      Object.keys(Py.rpcs).forEach(function (k) { var q = Py.rpcs[k]; clearTimeout(q.t); q.reject(new Error('Python neu gestartet')); });
      Py.rpcs = {}; Py.jediP = null;
      if (Py.status !== 'error') Py.setStatus('idle');
    },
    run: function (code, opts) {
      // serialisiert: immer nur ein Lauf gleichzeitig
      var p = Py.chain.then(function () {
        return Py.ensure().then(function () {
          return new Promise(function (resolve) {
            var id = ++Py.seq, timer = null;
            var loadLimit = Math.max(opts.timeout, 240000);   // Paket-/Dateiladen zählt nicht zur Laufzeitgrenze
            function startTimer(ms) { clearTimeout(timer); timer = setTimeout(function () { Py.reset(); resolve({ timedOut: true }); }, ms); }
            Py.handler = function (m) {
              if (m.id !== id) return;
              if (m.type === 'out') opts.onOut(m.text);
              else if (m.type === 'err') opts.onErr(m.text);
              else if (m.type === 'started') startTimer(opts.timeout);
              else if (m.type === 'status') { if (opts.onStatus) opts.onStatus(m.text); }
              else if (m.type === 'rich') { if (opts.onRich) opts.onRich(m.art, m.daten); }
              else if (m.type === 'files') { if (opts.onFiles) opts.onFiles(m.files); }
              else if (m.type === 'done') { clearTimeout(timer); Py.handler = null; resolve({ error: m.error, result: m.result }); }
            };
            startTimer(loadLimit);
            Py.worker.postMessage({
              type: 'run', id: id, code: code, harness: opts.harness || null, vars: opts.vars || null,
              files: (opts.files || []).map(function (u) { return new URL(u, opts.baseUrl || location.href).href; }),
              upload: opts.upload || null, scan: opts.scan || null, page: location.href.split('#')[0]
            });
          });
        });
      });
      Py.chain = p.catch(function () {});
      return p;
    }
  };

  /* Lauf mit Konsolen-Echo und input()-Eingaben; Ergebnis wie Py.run, Fehler-Kurzform in r.error */
  Py.console = function (code, stdin, opts) {
    opts = opts || {};
    opts.harness = CONSOLE_PY;
    opts.vars = { _kc_stdin: stdin || '' };
    return Py.run(code, opts).then(function (r) {
      if (!r.error && r.result) r.error = r.result;
      return r;
    });
  };

  /* ── Nachladen von Zusatzdateien (relativ zu kurs.js) ────── */
  var SELF = (document.currentScript && document.currentScript.src) || (function () {
    var s = $$('script[src*="kurs.js"]'); return s.length ? s[s.length - 1].src : location.href;
  })();
  function rel(p) { return new URL(p, SELF).href; }
  function ensureCss(path) {
    var url = rel(path), name = path.split('/').pop();
    var has = $$('link[rel="stylesheet"]').some(function (l) { return l.href.split('?')[0].split('/').pop() === name; });
    if (!has) document.head.appendChild(el('link', { rel: 'stylesheet', href: url }));
  }
  var scriptP = {};
  function loadScript(path) {
    if (!scriptP[path]) {
      scriptP[path] = new Promise(function (resolve, reject) {
        var s = el('script', { src: rel(path) });
        s.onload = function () { resolve(); };
        s.onerror = function () { delete scriptP[path]; reject(new Error(path + ' nicht ladbar')); };
        document.head.appendChild(s);
      });
    }
    return scriptP[path];
  }
  /* ── Labor-Erweiterungen (Hauptseite): Beispieldateien, Upload, reiche Ausgaben, erzeugte Dateien ── */
  // data-files="a.csv b.py" -> Liste der Einträge (relativ zur Seite, Py.run macht absolute URLs daraus)
  Py.parseFiles = function (str) {
    return (str || '').split(/[\s,]+/).filter(Boolean);
  };
  function fmtSize(n) { return n < 1024 ? n + ' B' : (n < 1048576 ? Math.round(n / 102.4) / 10 + ' kB' : Math.round(n / 104857.6) / 10 + ' MB'); }
  var IMG_EXT = /\.(png|jpg|jpeg|gif|svg)$/i;
  function isBinary(bytes) {
    var n = Math.min(bytes.length, 512);
    for (var i = 0; i < n; i++) if (bytes[i] === 0) return true;
    return false;
  }
  function renderFiles(holder, list) {
    var box = holder._kFiles;
    if (!box) {
      box = el('div', { class: 'k-files', role: 'group', 'aria-label': 'Erzeugte Dateien' }, [el('p', { class: 'k-files__title', text: 'Erzeugte Dateien' })]);
      holder._kFiles = box; holder.appendChild(box);
    }
    var ul = el('ul', { class: 'k-files__list' });
    box.appendChild(ul);
    list.forEach(function (f) {
      var name = f.name, bytes = f.data;
      var li = el('li', { class: 'k-files__item' });
      var head = el('div', { class: 'k-files__row' }, [el('code', { class: 'k-files__name', text: name }), el('span', { class: 'k-small k-muted', text: fmtSize(bytes.length) })]);
      var show = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Anzeigen', 'aria-expanded': 'false' });
      var ext = name.split('.').pop().toLowerCase();
      var mime = IMG_EXT.test(name) ? (ext === 'svg' ? 'image/svg+xml' : 'image/' + (ext === 'jpg' ? 'jpeg' : ext)) : 'application/octet-stream';
      var url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      var dl = el('a', { class: 'k-btn k-btn--small k-btn--link', href: url, download: name, text: 'Herunterladen' });
      var view = null;
      show.addEventListener('click', function () {
        if (view) { view.hidden = !view.hidden; show.setAttribute('aria-expanded', String(!view.hidden)); show.textContent = view.hidden ? 'Anzeigen' : 'Ausblenden'; return; }
        if (IMG_EXT.test(name) && ext !== 'svg') {
          view = el('img', { class: 'k-rich__img', src: url, alt: 'Erzeugte Datei ' + name });
        } else if (!isBinary(bytes)) {
          view = el('pre', { class: 'k-files__view', tabindex: '0', 'aria-label': 'Inhalt von ' + name });
          view.textContent = new TextDecoder().decode(bytes.subarray(0, 20000)) + (bytes.length > 20000 ? '\n… (gekürzt, vollständig über „Herunterladen“)' : '');
        } else {
          view = el('p', { class: 'k-small k-muted', text: 'Binärdatei, nur zum Herunterladen.' });
        }
        li.appendChild(view); show.setAttribute('aria-expanded', 'true'); show.textContent = 'Ausblenden';
      });
      head.appendChild(show); head.appendChild(dl);
      li.appendChild(head); ul.appendChild(li);
    });
  }
  function renderRich(holder, art, daten) {
    var d;
    try { d = typeof daten === 'string' ? JSON.parse(daten) : daten; } catch (e) { return; }
    if (art === 'bild') {
      var fig = el('figure', { class: 'k-rich__fig' }, [el('img', { class: 'k-rich__img', src: 'data:image/png;base64,' + d.png, alt: d.alt || 'Abbildung aus dem Programm' })]);
      holder.insertBefore(fig, holder._kFiles || null);
    } else if (art === '3d') {
      var c = el('div', { class: 'k-rich__3d' });
      holder.insertBefore(c, holder._kFiles || null);
      var go = function () {
        try { window.Vorschau3D.zeige(c, d); }
        catch (e) { c.appendChild(el('p', { class: 'k-small', text: '3D-Vorschau nicht möglich: ' + e.message })); }
      };
      if (window.Vorschau3D) go();
      else {
        ensureCss('../css/vorschau3d.css');
        loadScript('vorschau3d.js').then(go, function () { c.appendChild(el('p', { class: 'k-small', text: '3D-Vorschau konnte nicht geladen werden.' })); });
      }
    }
  }
  /* Ausgabe-Hooks für einen Lauf. Aufruf: Py.run(code, mix({timeout, onOut, onErr}, Py.ui(outEl, {files, upload, scan}))).
     Legt unter outEl einen Bereich für Bilder, 3D und erzeugte Dateien an (wird bei jedem Lauf geleert).
     files: Liste von URLs/Pfaden; upload: Funktion oder Array [{name, data}]; scan: Quelltext für die Paket-Erkennung. */
  Py.ui = function (out, o) {
    o = o || {};
    ensureCss('../css/runner.css');
    var holder = out._kRich;
    if (!holder) { holder = el('div', { class: 'k-rich' }); out.insertAdjacentElement('afterend', holder); out._kRich = holder; }
    holder.textContent = ''; holder._kFiles = null;
    var load = null;
    function status(t) {
      if (!t) { if (load && load.parentNode) load.parentNode.removeChild(load); load = null; return; }
      if (!load) { load = el('span', { class: 'sys k-loadmsg' }); out.insertBefore(load, out.firstChild); }
      load.textContent = t + '\n'; out.hidden = false;
    }
    return {
      files: o.files || null, scan: o.scan || null,
      upload: typeof o.upload === 'function' ? o.upload() : (o.upload || null),
      onStatus: status,
      onRich: function (art, daten) { renderRich(holder, art, daten); },
      onFiles: function (list) { renderFiles(holder, list); },
      finish: function () { status(''); }
    };
  };
  Py.mix = function (a, b) { Object.keys(b || {}).forEach(function (k) { a[k] = b[k]; }); return a; };
  /* Knopf „Eigene CSV laden“: gibt {el, get()} zurück; get() liefert [{name, data}] für opts.upload */
  Py.uploadUI = function (idBase) {
    var store = {};
    var input = el('input', { type: 'file', class: 'k-upload__input', id: idBase + '-file', accept: '.csv,.tsv,.txt,.json,text/csv,text/plain', multiple: '', hidden: '' });
    var btn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost' });
    btn.appendChild(document.createTextNode('Eigene CSV laden'));
    var list = el('span', { class: 'k-upload__names k-small', role: 'status', 'aria-live': 'polite' });
    var note = el('p', { class: 'k-upload__note k-small k-muted', text: 'Die Datei bleibt in deinem Browser, nichts wird hochgeladen.' });
    var wrap = el('div', { class: 'k-upload' }, [el('div', { class: 'k-upload__row' }, [btn, list]), note, input]);
    btn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      Array.prototype.slice.call(input.files || []).forEach(function (f) {
        if (f.size > 20 * 1048576) { list.textContent = f.name + ' ist größer als 20 MB und wird nicht geladen.'; return; }
        var name = f.name.replace(/[\\/]/g, '_');
        f.arrayBuffer().then(function (b) {
          store[name] = new Uint8Array(b);
          list.textContent = 'Im Arbeitsverzeichnis: ' + Object.keys(store).map(function (n) { return n + ' (' + fmtSize(store[n].length) + ')'; }).join(', ');
        });
      });
      input.value = '';
    });
    return { el: wrap, get: function () { return Object.keys(store).map(function (n) { return { name: n, data: store[n] }; }); } };
  };

  /* Schritt-für-Schritt-Visualisierer: Platzhalter, lädt viz.js erst beim ersten Öffnen (viz.js ersetzt window.KursViz) */
  window.KursViz = {
    open: function (code, opts) {
      ensureCss('../css/viz.css');
      return loadScript('viz.js').then(function () {
        if (!window.KursViz || !window.KursViz._real) throw new Error('viz.js fehlerhaft');
        return window.KursViz.open(code, opts);
      });
    }
  };

  /* ── Runner (Python-Code ausführen, Konsolen-Echo, input(), Schritt für Schritt) ── */
  var INPUT_RE = /\binput\s*\(/;

  function initRunner(box) {
    var ta = $('.k-runner__code', box);
    if (!ta || box._kInit) return;
    box._kInit = true;
    var auto = box.classList.contains('k-runner--auto');
    var original = ta.value;
    var timeout = parseInt(box.getAttribute('data-timeout') || '8000', 10);
    if (!auto) {
      var rows = Math.min(24, Math.max(4, original.split('\n').length + 1));
      ta.rows = rows;
    }
    ta.setAttribute('spellcheck', 'false'); ta.setAttribute('autocapitalize', 'off');
    if (!ta.id) ta.id = 'runner-' + Math.random().toString(36).slice(2, 8);
    if (!ta.getAttribute('aria-label')) ta.setAttribute('aria-label', 'Python-Code, editierbar');

    var runBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Ausführen' });
    var stepBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost' });
    stepBtn.appendChild(window.KIcon('steps')); stepBtn.appendChild(document.createTextNode('Schritt für Schritt'));
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var status = el('span', { class: 'k-runner__status', role: 'status', 'aria-live': 'polite' });
    var bar = el('div', { class: 'k-runner__bar' }, [runBtn, stepBtn, resetBtn, status]);
    var out = el('pre', { class: 'k-runner__out', 'aria-live': 'polite', 'aria-label': 'Ausgabe', hidden: '' });

    // Eingabefeld für input()
    var stdinOrig = (box.getAttribute('data-stdin') || ta.getAttribute('data-stdin') || '').replace(/\n$/, '');
    var stdinTa = el('textarea', { class: 'k-runner__stdin', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', id: ta.id + '-stdin' });
    stdinTa.value = stdinOrig;
    var stdinBox = el('div', { class: 'k-runner__stdinbox', hidden: '' }, [
      el('label', { class: 'k-runner__stdinlabel', 'for': stdinTa.id, text: 'Eingaben (eine pro Zeile)' }), stdinTa
    ]);
    function fitStdin() { stdinTa.rows = Math.min(8, Math.max(1, stdinTa.value.split('\n').length)); }
    function curCode() { return window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(ta) : ta.value; }
    function syncStdinBox() { stdinBox.hidden = !INPUT_RE.test(ta.value); }
    stdinTa.addEventListener('input', fitStdin);
    ta.addEventListener('input', syncStdinBox);
    fitStdin(); syncStdinBox();

    ta.insertAdjacentElement('afterend', stdinBox);
    stdinBox.insertAdjacentElement('afterend', bar);
    bar.insertAdjacentElement('afterend', out);
    // Labor: Beispieldateien (data-files) und eigener Upload (data-upload)
    var dataFiles = Py.parseFiles(box.getAttribute('data-files') || ta.getAttribute('data-files'));
    var uploader = (box.hasAttribute('data-upload') || ta.hasAttribute('data-upload')) ? Py.uploadUI(ta.id) : null;
    if (uploader) bar.insertAdjacentElement('afterend', uploader.el);

    var tryBox = box.closest('.k-try');
    var predict = !auto && tryBox && $('.k-predict', tryBox);
    var predicted = null;
    if (predict) {
      runBtn.disabled = true;
      status.textContent = 'Erst tippen, dann ausführen.';
      var expl = $('.k-predict__expl', predict);
      if (expl) expl.hidden = true;
      var result = $('.k-predict__result', predict) || el('div', { class: 'k-predict__result' });
      if (!result.parentNode) predict.appendChild(result);
      var opts = $$('.k-predict__opts button', predict);
      opts.forEach(function (b) {
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          opts.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          predicted = b;
          runBtn.disabled = false;
          status.textContent = 'Tipp gespeichert. Jetzt ausführen.';
        });
      });
    }

    function append(text, cls) {
      var s = el('span', cls ? { class: cls } : null); s.textContent = text; out.appendChild(s); out.scrollTop = out.scrollHeight;
    }

    var running = false;
    function run() {
      if (running || runBtn.disabled) return;
      running = true; runBtn.disabled = true; out.textContent = ''; out.hidden = false;
      var first = !Py.worker;
      status.innerHTML = '';
      status.appendChild(el('span', { class: 'k-spinner', 'aria-hidden': 'true' }));
      status.appendChild(document.createTextNode(first ? 'Python wird geladen (einmalig, ca. 10 MB) …' : 'läuft …'));
      var gotOutput = false;
      var rich = Py.ui(out, { files: dataFiles, upload: uploader ? uploader.get : null, scan: curCode() });
      Py.console(curCode(), stdinTa.value, Py.mix({
        timeout: timeout,
        onOut: function (t) { gotOutput = true; append(t); },
        onErr: function (t) { gotOutput = true; append(t, 'err'); }
      }, rich)).then(function (r) {
        rich.finish();
        if (r.timedOut) append('\nAbgebrochen nach ' + (timeout / 1000) + ' s. Läuft da eine Endlosschleife?\n', 'err');
        else if (r.error) append((out.textContent && !/\n$/.test(out.textContent) ? '\n' : '') + r.error.replace(/\s+$/, '') + '\n', 'err');
        else if (!gotOutput) append('(keine Ausgabe – hast du print() benutzt?)', 'sys');
        status.textContent = r.timedOut ? 'abgebrochen' : (r.error ? 'Fehler' : 'fertig');
        if (predict && predicted) {
          var good = predicted.hasAttribute('data-correct');
          var res = $('.k-predict__result', predict);
          res.innerHTML = '';
          res.appendChild(el('strong', { text: good ? 'Dein Tipp „' + predicted.textContent + '“ stimmt. ' : 'Dein Tipp war „' + predicted.textContent + '“ – die Ausgabe sieht anders aus. ' }));
          var ex = $('.k-predict__expl', predict);
          if (ex) { var c = el('span'); c.innerHTML = ex.innerHTML; res.appendChild(c); }
        }
      }).catch(function (err) {
        rich.finish();
        append('Python konnte nicht gestartet werden. Bist du online? (' + err.message + ')\n', 'err');
        status.textContent = 'Ladefehler – erneut versuchen';
      }).then(function () { running = false; runBtn.disabled = false; });
    }
    runBtn.addEventListener('click', run);
    stepBtn.addEventListener('click', function () {
      status.textContent = '';
      window.KursViz.open(curCode(), { stdin: stdinTa.value, opener: stepBtn, timeout: timeout }).catch(function (err) {
        status.textContent = 'Visualisierer nicht ladbar: ' + err.message;
      });
    });
    ta.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
    resetBtn.addEventListener('click', function () {
      ta.value = original; stdinTa.value = stdinOrig; fitStdin(); syncStdinBox();
      out.textContent = ''; out.hidden = true; status.textContent = 'zurückgesetzt';
      if (out._kRich) out._kRich.textContent = '';
    });
    box._kRunner = { run: run, ta: ta, stdinTa: stdinTa, out: out };
  }

  /* ── Jeder Python-Codeblock (pre > code) wird ein Runner ──── */
  // Ausnahmen: data-run="no" am pre, code oder einem Vorfahren; Ausgaben, Tracebacks, Quizfragen (Lösung stünde sonst direkt daneben)
  var NORUN = '[data-run="no"], .k-runner, .ke, .cm-editor, .k-q, .k-quiz, .a-spec, .a-banner, .a-out, .a-gap, .a-trace, .a-hint, .a-solution, .kb-out, .kb-err__msg, .ke-info, .k-runner__out, .k-sr, svg, textarea';
  var editorLoading = false;
  function attachEditor(ta) {
    if (window.KursEditor) { window.KursEditor.attach(ta, {}); return; }
    if (editorLoading || $('script[src*="editor.js"]')) return;   // vorhandenes editor.js hängt sich selbst an
    editorLoading = true;
    loadScript('editor.js').then(function () { if (window.KursEditor) window.KursEditor.attach(ta, {}); }, function () { /* einfache Textarea bleibt */ });
  }
  function makeRunner(code, o) {
    o = o || {};
    var lines = code.split('\n').length;
    var ta = el('textarea', { class: 'k-runner__code py-editor', rows: String(Math.max(1, lines)), 'aria-label': o.label || 'Python-Code, ausführbar' });
    ta.value = code;
    var box = el('div', { class: 'k-runner k-runner--auto' }, [ta]);
    if (o.stdin != null && o.stdin !== '') box.setAttribute('data-stdin', o.stdin);
    if (o.timeout) box.setAttribute('data-timeout', o.timeout);
    if (o.files) box.setAttribute('data-files', o.files);
    if (o.upload) box.setAttribute('data-upload', '');
    return box;
  }
  var NORUN_LATE = NORUN.replace('.k-q, .k-quiz, ', '');
  function runnableText(pre, late) {
    var code = pre.querySelector(':scope > code');
    if (!code) return null;
    var sel = late ? NORUN_LATE : NORUN;
    if (pre.closest(sel) || code.closest(sel)) return null;
    if (/\blanguage-(?!py)/.test(code.className + ' ' + pre.className)) return null;
    var t = code.textContent.replace(/^\n+/, '').replace(/\s+$/, '');
    if (!t.trim() || /^\s*Traceback\b/.test(t)) return null;
    return t;
  }
  // data-run="nach-antwort": erst nur Highlighting, wird nach der Antwort auf die Quizfrage zum Runner
  function holdPre(pre) {
    if (pre._kHold) return;
    pre._kHold = true;
    var hint = el('p', { class: 'k-runhint k-small k-muted', text: 'Nach deiner Antwort kannst du den Code ausführen.' });
    pre._kHint = hint;
    pre.parentNode.insertBefore(hint, pre.nextSibling);
    if (window.KursEditor && window.KursEditor.lib && window.KursEditor.lib.loadBundle) {
      window.KursEditor.lib.loadBundle().then(function () {
        var code = pre.querySelector(':scope > code');
        var hl = window.KursEditor.lib.codeBlock(code.textContent.replace(/\s+$/, ''));
        code.innerHTML = hl.firstChild.innerHTML;
      }).catch(function () { /* ohne Farben weiter */ });
    }
  }
  function releasePres(q) {
    $$('pre[data-run="nach-antwort"]', q).forEach(function (pre) {
      if (pre._kHint && pre._kHint.parentNode) pre._kHint.parentNode.removeChild(pre._kHint);
      pre._kRelease = true;
      convertPre(pre);
    });
  }
  function convertPre(pre) {
    if (pre._kDone || !pre.parentNode) return;
    var late = pre.getAttribute('data-run') === 'nach-antwort';
    if (late && !pre._kRelease) { if (runnableText(pre, true) != null) holdPre(pre); return; }
    var text = runnableText(pre, late);
    if (text == null) return;
    pre._kDone = true;
    var target = pre.parentNode.classList && pre.parentNode.classList.contains('k-copy') ? pre.parentNode : pre;
    var code = pre.querySelector(':scope > code');
    var box = makeRunner(text, {
      stdin: pre.getAttribute('data-stdin') != null ? pre.getAttribute('data-stdin') : code.getAttribute('data-stdin'),
      timeout: pre.getAttribute('data-timeout'),
      files: pre.getAttribute('data-files') || code.getAttribute('data-files'),
      upload: pre.hasAttribute('data-upload') || code.hasAttribute('data-upload'),
      label: pre.getAttribute('aria-label')
    });
    target.parentNode.replaceChild(box, target);
    initRunner(box);
    attachEditor($('.k-runner__code', box));
  }
  function enhanceRunners(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === 'PRE') convertPre(root);
    else if (root.querySelectorAll) $$('pre', root).forEach(convertPre);
  }

  /* ── Lazy: Begriffs-Hinweise (abbr.k-begriff) ────────────── */
  function lazyFeatures(root) {
    if (!root || root.nodeType !== 1) return;
    if ((root.matches && root.matches('abbr.k-begriff')) || (root.querySelector && root.querySelector('abbr.k-begriff'))) {
      ensureCss('../css/begriff.css');
      loadScript('begriff.js').then(function () { if (window.KursBegriff) window.KursBegriff.scan(root); }, function () { /* ohne Popover weiter */ });
    }
  }

  /* ── KI-Spiegel: Fehler markieren ────────────────────────── */
  function initMirror(m) {
    var lines = $$('.k-line', m);
    var btn = $('[data-mirror-check]', m);
    var verdict = $('.k-verdict', m);
    if (!btn) return;
    lines.forEach(function (l) {
      l.setAttribute('aria-pressed', 'false');
      l.addEventListener('click', function () {
        if (l.hasAttribute('data-locked')) return;
        l.setAttribute('aria-pressed', l.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    });
    btn.addEventListener('click', function () {
      var bugs = {}, found = {}, falseAlarms = 0;
      lines.forEach(function (l) {
        var b = l.getAttribute('data-bug');
        var sel = l.getAttribute('aria-pressed') === 'true';
        l.setAttribute('data-locked', '1');
        if (b) { bugs[b] = true; if (sel) { found[b] = true; l.classList.add('is-hit'); } else l.classList.add('is-miss'); }
        else if (sel) { falseAlarms++; l.classList.add('is-false'); }
        l.removeAttribute('aria-pressed');
        if (b) l.setAttribute('aria-label', 'Fehlerzeile: ' + l.textContent.trim());
      });
      var nb = Object.keys(bugs).length, nf = Object.keys(found).length;
      if (verdict) {
        verdict.textContent = nf + ' von ' + nb + ' Fehlern gefunden' + (falseAlarms ? ', ' + falseAlarms + ' Fehlalarm' + (falseAlarms > 1 ? 'e' : '') + ' (durchgestrichen)' : '') + '. ' +
          (nf === nb && !falseAlarms ? 'Sauber geprüft.' : 'Grün = gefunden, gelb = übersehen.');
        verdict.hidden = false;
      }
      $$('[data-mirror-after]', m).forEach(function (n) { n.hidden = false; });
      btn.hidden = true;
    });
  }

  /* ── Video-Fallback ──────────────────────────────────────── */
  function initVideo() {
    $$('.k-video video').forEach(function (v) {
      var miss = $('.k-video__missing', v.parentNode);
      function fail() { if (miss) { miss.hidden = false; v.hidden = true; } }
      v.addEventListener('error', fail);
      var src = $$('source', v);
      src.forEach(function (s) { s.addEventListener('error', fail); });
      if (v.error || v.networkState === 3) fail();
      setTimeout(function () { if (v.networkState === 3 || v.error) fail(); }, 1500);
    });
  }

  /* ── Kopieren-Knopf für Codeblöcke und Editoren ──────────── */
  var COPY_SEL = 'pre.k-code, pre.ke-code, .a-syntax pre, .a-solution pre, .a-gap__code, .a-trace__code, .k-codelines';
  var COPY_SKIP = '.a-spec, .a-banner, .k-runner__out, .a-out, .kb-out, .kb-err__msg, .cm-editor, .a-hint';
  var COPY_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 3h9a2 2 0 0 1 2 2v11h-2V5H8V3Zm-3 4h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h9V9H5Z"/></svg>';
  var liveEl = null;
  function announce(msg) {
    if (!liveEl) {
      liveEl = el('div', { class: 'k-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', id: 'k-copy-live' });
      document.body.appendChild(liveEl);
    }
    liveEl.textContent = '';
    setTimeout(function () { liveEl.textContent = msg; }, 30);
  }
  function fallbackCopy(text) {
    var prev = document.activeElement;
    var ta = el('textarea', { readonly: '', 'aria-hidden': 'true', tabindex: '-1' });
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta);
    var ok = false;
    try { ta.select(); ta.setSelectionRange(0, text.length); ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.parentNode.removeChild(ta);
    if (prev && prev.focus) { try { prev.focus({ preventScroll: true }); } catch (e) { /* ignorieren */ } }
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function blockText(node) {
    var t;
    if (node.matches('.k-codelines, .a-trace__code')) {
      t = $$('li', node).map(function (li) { return li.textContent.replace(/\s+$/, ''); }).join('\n');
    } else if (node.matches('.a-gap__code')) {
      t = Array.prototype.map.call(node.childNodes, function (c) { return c.nodeType === 3 ? c.data : (c.tagName === 'INPUT' ? c.value : c.textContent); }).join('');
    } else t = node.textContent;
    return t.replace(/\s+$/, '') + '\n';
  }
  function copyBar(getText) {
    var btn = el('button', { type: 'button', class: 'k-copy__btn', 'aria-label': 'Code kopieren' });
    btn.innerHTML = COPY_ICON + '<span class="k-copy__label">Kopieren</span>';
    var label = btn.querySelector('.k-copy__label');
    var timer = null;
    btn.addEventListener('click', function () {
      copyText(getText()).then(function (ok) {
        clearTimeout(timer);
        label.textContent = ok ? 'Kopiert' : 'Nicht möglich';
        if (ok && window.KIcon) label.appendChild(window.KIcon('check'));
        btn.setAttribute('data-state', ok ? 'done' : 'fail');
        announce(ok ? 'Code in die Zwischenablage kopiert.' : 'Kopieren nicht möglich. Bitte den Code markieren und mit Strg plus C kopieren.');
        timer = setTimeout(function () { label.textContent = 'Kopieren'; btn.removeAttribute('data-state'); }, 2000);
      });
    });
    return el('div', { class: 'k-copy__bar' }, [el('span', { class: 'k-copy__lang', text: 'Python' }), btn]);
  }
  function enhanceBlock(node) {
    if (node.hasAttribute('data-copy') || node.closest('.k-copy') || node.closest(COPY_SKIP)) return;
    node.setAttribute('data-copy', '1');
    var wrap = el('div', { class: 'k-copy' });
    node.parentNode.insertBefore(wrap, node);
    wrap.appendChild(copyBar(function () { return blockText(node); }));
    wrap.appendChild(node);
  }
  function enhanceEditor(ke) {
    if (ke.hasAttribute('data-copy')) return;
    var ta = ke.nextElementSibling;
    if (!ta || ta.tagName !== 'TEXTAREA') return;
    ke.setAttribute('data-copy', '1');
    ke.insertBefore(copyBar(function () {
      var v = window.KursEditor && window.KursEditor.getValue ? window.KursEditor.getValue(ta) : ta.value;
      return String(v).replace(/\s+$/, '') + '\n';
    }), ke.firstChild);
  }
  function enhanceCopy(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches('.ke')) enhanceEditor(root);
    else if (root.matches && root.matches(COPY_SEL)) enhanceBlock(root);
    if (root.querySelectorAll) {
      $$('.ke', root).forEach(enhanceEditor);
      $$(COPY_SEL, root).forEach(enhanceBlock);
    }
  }
  function initCopy() {
    enhanceCopy(document.body);
    if (!window.MutationObserver) return;
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1 || (n.closest && n.closest('.cm-editor'))) return;
          enhanceCopy(n);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ── Start ───────────────────────────────────────────────── */
  function init() {
    initProgress();
    initIndexProgress();
    initReveal();
    $$('.k-quiz').forEach(initQuiz);
    ensureCss('../css/runner.css');
    $$('.k-runner').forEach(initRunner);
    enhanceRunners(document.body);      // vor initCopy: Codeblöcke werden Runner, nicht erst Kopier-Blöcke
    $$('.k-mirror').forEach(initMirror);
    initVideo();
    initCopy();
    lazyFeatures(document.body);
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.closest && n.closest('.cm-editor')) return;
            enhanceRunners(n); lazyFeatures(n);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.KursPy = Py; // für Tests/Debug
  window.KursRunner = { make: makeRunner, init: initRunner, enhance: enhanceRunners };
  window.KursCopy = { enhance: enhanceCopy, copyText: copyText };
})();
