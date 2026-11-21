/* =============================================================
   kurs.js – Fortschritt, Quiz-Engine, Python-Runner (Pyodide), Aufdecken
   Kein Framework, kein Build. Seite funktioniert auch ohne localStorage.
   ============================================================= */
(function () {
  'use strict';

  var PYODIDE_VERSION = 'v0.26.4';
  var PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/' + PYODIDE_VERSION + '/full/';
  var STORE_KEY = 'dhbw-inf-mb:v1';

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

  /* ── (a) Speicher mit try/catch ──────────────────────────── */
  var Store = {
    mem: {},
    read: function () {
      try {
        var raw = window.localStorage.getItem(STORE_KEY);
        if (raw) return JSON.parse(raw) || {};
      } catch (e) { /* ohne Speicher weiter */ }
      return Store.mem;
    },
    write: function (data) {
      Store.mem = data;
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* ignorieren */ }
    },
    get: function (lesson, key) {
      var d = Store.read();
      return d[lesson] && d[lesson][key];
    },
    set: function (lesson, key, value) {
      var d = Store.read();
      d[lesson] = d[lesson] || {};
      if (value === null || value === undefined) delete d[lesson][key]; else d[lesson][key] = value;
      Store.write(d);
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
    self.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'init') {
        try {
          importScripts(m.base + 'pyodide.js');
          self.loadPyodide({ indexURL: m.base }).then(function (p) {
            pyodide = p;
            self.postMessage({ type: 'ready' });
          }).catch(function (err) { self.postMessage({ type: 'initerror', message: String(err) }); });
        } catch (err) { self.postMessage({ type: 'initerror', message: String(err) }); }
      } else if (m.type === 'jedi-init') {
        // Editor-Integration: Jedi per micropip nachladen und Hilfsfunktionen in den Haupt-Namensraum legen
        pyodide.loadPackage('micropip').then(function () {
          return pyodide.runPythonAsync(['import micropip', "await micropip.install('jedi')"].concat(JEDI_PY).join('\n'));
        }).then(function () {
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
        pyodide.setStdout({ batched: function (s) { self.postMessage({ type: 'out', id: m.id, text: s + '\n' }); } });
        pyodide.setStderr({ batched: function (s) { self.postMessage({ type: 'err', id: m.id, text: s + '\n' }); } });
        pyodide.setStdin({ stdin: function () { return undefined; } });
        pyodide.loadPackagesFromImports(m.code).then(function () {
          var g = pyodide.globals.get('dict')();
          return pyodide.runPythonAsync(m.code, { globals: g }).then(function () { try { g.destroy(); } catch (x) {} });
        }).then(function () {
          self.postMessage({ type: 'done', id: m.id });
        }).catch(function (err) {
          self.postMessage({ type: 'done', id: m.id, error: clean(String(err && err.message ? err.message : err)) });
        });
      }
    };
  }

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
        w.postMessage({ type: 'init', base: PYODIDE_BASE });
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
            Py.handler = function (m) {
              if (m.id !== id) return;
              if (m.type === 'out') opts.onOut(m.text);
              else if (m.type === 'err') opts.onErr(m.text);
              else if (m.type === 'done') { clearTimeout(timer); Py.handler = null; resolve({ error: m.error }); }
            };
            timer = setTimeout(function () { Py.reset(); resolve({ timedOut: true }); }, opts.timeout);
            Py.worker.postMessage({ type: 'run', id: id, code: code });
          });
        });
      });
      Py.chain = p.catch(function () {});
      return p;
    }
  };

  function initRunner(box) {
    var ta = $('.k-runner__code', box);
    if (!ta) return;
    var original = ta.value;
    var timeout = parseInt(box.getAttribute('data-timeout') || '8000', 10);
    var rows = Math.min(24, Math.max(4, original.split('\n').length + 1));
    ta.rows = rows; ta.setAttribute('spellcheck', 'false'); ta.setAttribute('autocapitalize', 'off');
    if (!ta.id) ta.id = 'runner-' + Math.random().toString(36).slice(2, 8);
    if (!ta.getAttribute('aria-label')) ta.setAttribute('aria-label', 'Python-Code, editierbar');

    var runBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Ausführen' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    var status = el('span', { class: 'k-runner__status', role: 'status', 'aria-live': 'polite' });
    var bar = el('div', { class: 'k-runner__bar' }, [runBtn, resetBtn, status]);
    var out = el('pre', { class: 'k-runner__out', 'aria-live': 'polite', 'aria-label': 'Ausgabe' });
    ta.insertAdjacentElement('afterend', bar);
    bar.insertAdjacentElement('afterend', out);

    var tryBox = box.closest('.k-try');
    var predict = tryBox && $('.k-predict', tryBox);
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
      running = true; runBtn.disabled = true; out.textContent = '';
      var first = !Py.worker;
      status.innerHTML = '';
      status.appendChild(el('span', { class: 'k-spinner', 'aria-hidden': 'true' }));
      status.appendChild(document.createTextNode(first ? 'Python wird geladen (einmalig, ca. 10 MB) …' : 'läuft …'));
      var gotOutput = false;
      Py.run(ta.value, {
        timeout: timeout,
        onOut: function (t) { gotOutput = true; append(t); },
        onErr: function (t) { gotOutput = true; append(t, 'err'); }
      }).then(function (r) {
        if (r.timedOut) append('\nAbgebrochen nach ' + (timeout / 1000) + ' s. Läuft da eine Endlosschleife?\n', 'err');
        else if (r.error) append(r.error.replace(/\s+$/, '') + '\n', 'err');
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
        append('Python konnte nicht gestartet werden. Bist du online? (' + err.message + ')\n', 'err');
        status.textContent = 'Ladefehler – erneut versuchen';
      }).then(function () { running = false; runBtn.disabled = false; });
    }
    runBtn.addEventListener('click', run);
    ta.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
    resetBtn.addEventListener('click', function () { ta.value = original; out.textContent = ''; status.textContent = 'zurückgesetzt'; });
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
    $$('.k-runner').forEach(initRunner);
    $$('.k-mirror').forEach(initMirror);
    initVideo();
    initCopy();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.KursPy = Py; // für Tests/Debug
  window.KursCopy = { enhance: enhanceCopy, copyText: copyText };
})();
