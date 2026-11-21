/* =============================================================
   aufgaben.js – wiederverwendbare Aufgabentypen für die Python-Werkstatt
   Typen (data-a): trace | parsons | gap | code | run | klausur
   Braucht kurs.js (window.KursPy) nur für Aufgaben mit Ausführung.
   Speicher über KursSpeicher (speicher.js), funktioniert auch ohne editor.js.
   Python-Seite der Prüfung: siehe PY_PRELUDE (zwischen den Markern).
   ============================================================= */
(function () {
  'use strict';


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
  function lessonId() { return document.body.getAttribute('data-lesson') || 'V03'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* ── Speicher (Muster wie kurs.js, mit try/catch) ────────── */
  var KS = window.KursSpeicher;
  function bucketGet(lesson, name) { return KS.sofort.lesen(KS.pfad(lesson, name)) || {}; }
  function bucketMark(lesson, name, id) {
    var b = bucketGet(lesson, name);
    if (b[id]) return false;
    b[id] = 1; KS.sofort.schreiben(KS.pfad(lesson, name), b); return true;
  }
  var Store = {
    solved: function (lesson) { return bucketGet(lesson, 'aufg'); },
    setSolved: function (lesson, id) { bucketMark(lesson, 'aufg', id); },
    started: function (lesson) { return bucketGet(lesson, 'begonnen'); },
    setStarted: function (lesson, id) { return bucketMark(lesson, 'begonnen', id); }
  };

  /* ── Fortschritt „x von y gelöst“ ────────────────────────── */
  function taskNodes() { return $$('[data-a][data-id]:not([data-count="0"])'); }
  function updateProgress() {
    var lesson = lessonId(), sv = Store.solved(lesson);
    var nodes = taskNodes(), n = 0;
    nodes.forEach(function (t) { var ok = !!sv[t.getAttribute('data-id')]; if (ok) n++; t.classList.toggle('is-solved', ok); });
    $$('[data-a-progress]').forEach(function (p) {
      var pct = nodes.length ? Math.round(100 * n / nodes.length) : 0;
      var fill = $('.a-progress__fill', p), txt = $('.a-progress__text', p), bar = $('.a-progress__bar', p);
      if (fill) fill.style.width = pct + '%';
      if (txt) txt.textContent = n + ' von ' + nodes.length + ' Aufgaben gelöst';
      if (bar) { bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-valuenow', String(pct)); bar.setAttribute('aria-label', 'Aufgabenfortschritt'); }
    });
    try { document.dispatchEvent(new CustomEvent('kurs:progress', { detail: { lesson: lesson, solved: n, total: nodes.length } })); } catch (e) { /* ältere Browser */ }
  }
  function markStarted(root) {
    var id = root.getAttribute('data-id');
    if (!id || root.getAttribute('data-count') === '0' || root.classList.contains('is-solved')) return;
    if (Store.setStarted(lessonId(), id)) updateProgress();
  }
  function markSolved(root) {
    var id = root.getAttribute('data-id');
    if (!id) return;
    Store.setSolved(lessonId(), id);
    root.classList.add('is-solved');
    updateProgress();
  }
  function addBadge(root) {
    var head = $('.a-task__head', root);
    if (head && !$('.a-badge', head)) head.appendChild(el('span', { class: 'a-badge' }, [window.KIcon('check'), 'gelöst']));
  }

  /* ── Python-Seite der Prüfung (wird als Text an KursPy.run übergeben) ── */
  /*PY-BEGIN*/
  var PY_PRELUDE = String.raw`
import builtins, io, sys, json, math, re, contextlib, traceback

_FILE = "<dein Code>"

def _hint(e):
    m = str(e)
    if isinstance(e, IndentationError):
        return "Einrückung prüfen: Zeilen im selben Block stehen gleich weit eingerückt (4 Leerzeichen), nach einem Doppelpunkt eine Stufe tiefer."
    if isinstance(e, SyntaxError):
        return "Syntaxfehler: Klammern, Anführungszeichen und Doppelpunkte prüfen. Dezimalzahlen schreibt Python mit Punkt, nicht mit Komma."
    if isinstance(e, NameError):
        return "Dieser Name ist unbekannt. Tippfehler? Groß-/Kleinschreibung? Oder die Variable wird erst weiter unten definiert?"
    if isinstance(e, TypeError) and ("positional argument" in m or "unexpected keyword" in m):
        return "Anzahl oder Namen der Argumente beim Aufruf prüfen: Passen sie zu den Parametern im def?"
    if isinstance(e, TypeError) and "NoneType" in m:
        return "Ein Wert ist None (nichts). Fehlt in der Funktion ein return? print() zeigt nur an, gibt aber nichts zurück."
    if isinstance(e, TypeError) and "not subscriptable" in m:
        return "Mit [ ] kann man nur in Listen, Tupel, Strings oder Dictionaries greifen. Welcher Wert ist hier gar keine Sammlung?"
    if isinstance(e, KeyError):
        return "Diesen Schlüssel gibt es im Dictionary nicht. Tippfehler? Mit  if schluessel in d:  vorher prüfen."
    if isinstance(e, IndexError):
        return "Index außerhalb der Liste. Eine Liste mit n Elementen hat die Indizes 0 bis n-1."
    if isinstance(e, FileNotFoundError):
        return "Datei nicht gefunden. Stimmen Name, Endung und Ordner? Groß-/Kleinschreibung beachten."
    if isinstance(e, TypeError):
        return "Die Typen passen nicht zusammen. input() liefert immer Text (str): mit float() oder int() in eine Zahl umwandeln, bevor du rechnest."
    if isinstance(e, ValueError):
        return "Dieser Text passt nicht zur Umwandlung. Prüfe Komma statt Punkt und das Zahlensystem: int('2.5') geht nicht, int('102', 2) auch nicht (2 ist keine Binärziffer)."
    if isinstance(e, EOFError):
        return "Das Programm wollte mehr Eingaben lesen, als vorgesehen sind. Zählt dein Programm die input()-Aufrufe richtig?"
    if isinstance(e, ZeroDivisionError):
        return "Division durch null. Welcher Nenner ist null?"
    if isinstance(e, AttributeError) or isinstance(e, ModuleNotFoundError):
        return "Name im Modul falsch geschrieben, oder import vergessen? Beispiel: import math, dann math.pi."
    return ""

def _format_exc(e, src):
    lines = src.split("\n")
    out = []
    lineno = None
    if isinstance(e, SyntaxError) and e.filename == _FILE:
        lineno = e.lineno
        out.append('  File "%s", line %s' % (_FILE, e.lineno))
        if e.lineno and 1 <= e.lineno <= len(lines):
            out.append("    " + lines[e.lineno - 1].strip())
        out.append("%s: %s" % (type(e).__name__, e.msg))
    else:
        frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == _FILE]
        if frames:
            out.append("Traceback (most recent call last):")
        for f in frames:
            lineno = f.lineno
            out.append('  File "%s", line %s, in %s' % (_FILE, f.lineno, f.name))
            if 1 <= f.lineno <= len(lines):
                out.append("    " + lines[f.lineno - 1].strip())
        out.append("%s: %s" % (type(e).__name__, e))
    return "\n".join(out), _hint(e), lineno

def _run_user(src, inputs, capture, echo):
    buf = io.StringIO()
    ns = {"__name__": "__main__"}
    queue = list(inputs or [])
    real_input = builtins.input
    def fake_input(prompt=""):
        o = buf if capture else sys.stdout
        o.write(str(prompt))
        if not queue:
            raise EOFError("input() wurde aufgerufen, aber es gibt keine Eingabe mehr")
        v = str(queue.pop(0))
        if echo:
            o.write(v + "\n")
        elif capture:
            o.write("\n")
        return v
    err = None
    builtins.input = fake_input
    try:
        try:
            code = compile(src, _FILE, "exec")
        except SyntaxError as e:
            err = _format_exc(e, src)
        else:
            try:
                if capture:
                    with contextlib.redirect_stdout(buf):
                        exec(code, ns)
                else:
                    exec(code, ns)
            except SystemExit:
                pass
            except BaseException as e:
                err = _format_exc(e, src)
    finally:
        builtins.input = real_input
    return ns, buf.getvalue(), err

def _emit(obj):
    sys.stdout.write("\x1e" + json.dumps(obj, ensure_ascii=False) + "\n")

def zeilen(text):
    return [l.strip() for l in str(text).split("\n") if l.strip()]

def zahlen(text):
    return [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?", str(text))]

def _main(kind, src, inputs, tests_src, mode):
    if kind == "run":
        ns, text, err = _run_user(src, inputs, False, True)
        if err:
            sys.stderr.write(err[0] + ("\nHinweis: " + err[1] if err[1] else "") + "\n")
        return
    if mode == "programm":
        ns = {"__name__": "__main__"}
        try:
            compile(src, _FILE, "exec")
        except SyntaxError as e:
            t, h, n = _format_exc(e, src)
            _emit({"fatal": t, "hint": h})
            return
    else:
        ns, text, err = _run_user(src, [], True, False)
        if err:
            _emit({"fatal": err[0], "hint": err[1]})
            return
        ns["AUSGABE"] = text
    def run_program(eingaben=()):
        n2, out, err = _run_user(src, list(eingaben), True, False)
        if err:
            raise AssertionError("Dein Programm bricht bei den Eingaben %s ab:\n%s%s" % (list(eingaben), err[0], ("\nHinweis: " + err[1]) if err[1] else ""))
        return out
    # Hilfsfunktionen für Tests: immer unter _zeilen/_zahlen/_run_program; die kurzen Namen nur,
    # wenn der Studierendencode sie nicht selbst belegt (sonst würde z. B. eine Liste "zahlen" überschrieben)
    ns.update(_run_program=run_program, _zeilen=zeilen, _zahlen=zahlen)
    ns.setdefault("run_program", run_program)
    ns.setdefault("zeilen", zeilen)
    ns.setdefault("zahlen", zahlen)
    ns.setdefault("math", math)
    before = set(ns)
    exec(compile(tests_src, "<tests>", "exec"), ns)
    n = 0
    for name, f in list(ns.items()):
        if name.startswith("test_") and name not in before and callable(f):
            n += 1
            doc = (f.__doc__ or name).strip().split("\n")[0]
            try:
                f()
                _emit({"t": doc, "ok": True})
            except AssertionError as e:
                _emit({"t": doc, "ok": False, "m": str(e) or "Die Prüfung ist fehlgeschlagen."})
            except BaseException as e:
                h = _hint(e)
                _emit({"t": doc, "ok": False, "m": "%s: %s" % (type(e).__name__, e) + (("\nHinweis: " + h) if h else "")})
    _emit({"done": n})
`;
  /*PY-END*/

  function jq(v) { return JSON.stringify(v).split(String.fromCharCode(8232)).join('\u2028').split(String.fromCharCode(8233)).join('\u2029'); }
  function pyProgram(kind, src, inputs, tests, mode) {
    return PY_PRELUDE + '\n_main(' + [kind, src, inputs, tests, mode].map(jq).join(', ') + ')\n';
  }

  /* Führt kind=run|test über KursPy aus. Ergebnis: Promise {results, fatal, hint, done, timedOut, loadError, jsError} */
  function runPython(kind, src, inputs, tests, mode, timeout, hooks) {
    hooks = hooks || {};
    var res = { results: [], fatal: null, hint: '', done: false, timedOut: false, loadError: null, jsError: null };
    if (!window.KursPy) { res.loadError = 'kurs.js nicht geladen'; return Promise.resolve(res); }
    var buf = '';
    function line(l) {
      if (l.charAt(0) === '\u001e') {
        try {
          var o = JSON.parse(l.slice(1));
          if (o.fatal) { res.fatal = o.fatal; res.hint = o.hint || ''; }
          else if (o.done !== undefined) res.done = true;
          else res.results.push(o);
        } catch (e) { /* ignorieren */ }
      } else if (hooks.onLine) hooks.onLine(l + '\n');
    }
    var ro = {
      timeout: timeout, scan: src, files: hooks.files || null,
      onOut: function (t) { buf += t; var parts = buf.split('\n'); buf = parts.pop(); parts.forEach(line); },
      onErr: function (t) { if (hooks.onErr) hooks.onErr(t); }
    };
    if (hooks.py && window.KursPy.mix) window.KursPy.mix(ro, hooks.py);
    return window.KursPy.run(pyProgram(kind, src, inputs, tests, mode), ro).then(function (r) {
      if (hooks.py && hooks.py.finish) hooks.py.finish();
      if (buf) { line(buf); buf = ''; }
      if (r.timedOut) res.timedOut = true;
      else if (r.error) res.jsError = r.error;
      return res;
    }, function (err) { res.loadError = err && err.message ? err.message : String(err); return res; });
  }

  function readScript(root, role) {
    var s = $('script[data-role="' + role + '"]', root);
    return s ? s.textContent.replace(/^\n/, '').replace(/\s+$/, '') : '';
  }
  function setValue(ta, v) {
    ta.value = v;
    try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { /* ältere Browser */ }
  }

  /* ── gemeinsame Bedienelemente der Code-Aufgaben ─────────── */
  function buildCommon(root, opts) {
    var ui = {};
    ui.bar = el('div', { class: 'a-bar' });
    ui.status = el('span', { class: 'a-status', role: 'status', 'aria-live': 'polite' });
    ui.out = null;
    ui.results = el('div', { class: 'a-results', 'aria-live': 'polite' });
    ui.attempted = false;

    // Hinweise (gestuft)
    var hintsList = $('.a-hints', root);
    ui.hintBtn = null;
    if (hintsList) {
      var items = $$('li', hintsList);
      hintsList.hidden = true;
      var shown = 0;
      var hintBox = el('div', { class: 'a-hintbox' });
      ui.hintBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Tipp 1 von ' + items.length });
      ui.hintBtn.addEventListener('click', function () {
        if (shown >= items.length) return;
        var box = el('div', { class: 'a-hint' }, [el('strong', { text: 'Tipp ' + (shown + 1) + ': ' })]);
        var span = el('span'); span.innerHTML = items[shown].innerHTML; box.appendChild(span);
        hintBox.appendChild(box);
        shown++;
        ui.hintBtn.textContent = shown >= items.length ? 'Keine weiteren Tipps' : 'Tipp ' + (shown + 1) + ' von ' + items.length;
        if (shown >= items.length) ui.hintBtn.disabled = true;
      });
      ui.hintBox = hintBox;
      ui.hintsEl = hintsList;
    }

    // Musterlösung erst nach Versuch
    ui.solBtn = null; ui.solBox = null;
    var sol = opts.solution;
    if (sol) {
      ui.solBox = el('div', { class: 'a-solution', hidden: '' }, [el('strong', { text: 'Musterlösung' }), el('pre', { class: 'k-code', text: sol })]);
      ui.solBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Musterlösung ansehen', 'aria-disabled': 'true', title: 'Erst einen Versuch prüfen, dann kannst du die Musterlösung aufdecken.' });
      ui.solBtn.addEventListener('click', function () {
        if (!ui.attempted) { ui.status.textContent = 'Erst einen eigenen Versuch prüfen, dann die Musterlösung.'; return; }
        var open = ui.solBox.hidden;
        ui.solBox.hidden = !open;
        ui.solBtn.textContent = open ? 'Musterlösung verbergen' : 'Musterlösung ansehen';
      });
    }
    ui.unlockSolution = function () {
      ui.attempted = true;
      if (ui.solBtn) { ui.solBtn.setAttribute('aria-disabled', 'false'); ui.solBtn.title = ''; }
    };
    return ui;
  }

  function renderResults(ui, r, root, timeout) {
    ui.results.innerHTML = '';
    if (r.loadError) {
      ui.results.appendChild(el('div', { class: 'a-banner is-bad', text: 'Python konnte nicht gestartet werden. Bist du online? (' + r.loadError + ')' }));
      return false;
    }
    if (r.timedOut) {
      ui.results.appendChild(el('div', { class: 'a-banner is-bad', text: 'Abgebrochen nach ' + (timeout / 1000) + ' s. Läuft irgendwo eine Endlosschleife? Bei Floats trifft ein while-Vergleich mit != oder == den Zielwert oft nie.' }));
      return false;
    }
    if (r.jsError) {
      ui.results.appendChild(el('div', { class: 'a-banner is-bad', text: 'Interner Fehler beim Prüfen: ' + r.jsError.split('\n').slice(-2).join(' ') }));
      return false;
    }
    if (r.fatal) {
      var b = el('div', { class: 'a-banner is-bad' }, [el('strong', { text: 'Dein Code läuft noch nicht: ' }), el('pre', { class: 'a-trace-text', text: r.fatal })]);
      if (r.hint) b.appendChild(el('p', { class: 'a-hinttext', text: 'Hinweis: ' + r.hint }));
      ui.results.appendChild(b);
      return false;
    }
    var ok = 0, list = el('ul', { class: 'a-tests' });
    r.results.forEach(function (t) {
      if (t.ok) ok++;
      var li = el('li', { class: t.ok ? 'is-ok' : 'is-bad' }, [
        el('span', { class: 'a-tests__mark', 'aria-hidden': 'true' }, [window.KIcon(t.ok ? 'check' : 'x')]),
        el('span', { class: 'k-sr', text: t.ok ? 'Bestanden: ' : 'Nicht bestanden: ' }),
        el('span', { class: 'a-tests__title', text: t.t })
      ]);
      if (!t.ok && t.m) li.appendChild(el('div', { class: 'a-tests__msg', text: t.m }));
      list.appendChild(li);
    });
    var total = r.results.length;
    var all = total > 0 && ok === total;
    ui.results.appendChild(el('div', { class: 'a-banner ' + (all ? 'is-ok' : 'is-bad'), text: total === 0 ? 'Keine Tests gefunden.' : (all ? 'Alle ' + total + ' Tests bestanden. Aufgabe gelöst.' : ok + ' von ' + total + ' Tests bestanden. Lies die Meldungen bei den nicht bestandenen Einträgen.') }));
    ui.results.appendChild(list);
    return all;
  }

  /* ── Typ: run / code / klausur ───────────────────────────── */
  function initCode(root) {
    var kind = root.getAttribute('data-a');
    var mode = root.getAttribute('data-mode') || 'programm';
    var timeout = parseInt(root.getAttribute('data-timeout') || '8000', 10);
    var editorBox = $('.a-editor', root);
    var ta = $('textarea', root);
    if (!ta || !editorBox) return;
    var original = ta.value;
    ta.setAttribute('spellcheck', 'false'); ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocomplete', 'off');
    if (!ta.getAttribute('aria-label')) ta.setAttribute('aria-label', 'Python-Code, editierbar');
    ta.rows = Math.min(22, Math.max(5, original.split('\n').length + 1));
    var tests = readScript(root, 'tests');
    var solution = readScript(root, 'solution');
    var ui = buildCommon(root, { solution: solution });
    var inputsAttr = root.getAttribute('data-inputs');
    var running = false;

    // Eingaben für Ausführen
    var inputsTa = null;
    if (inputsAttr !== null && kind !== 'klausur') {
      inputsTa = el('textarea', { class: 'a-inputs', rows: String(Math.max(1, inputsAttr.split('|').length)), 'aria-label': 'Eingaben für input(), eine Zeile pro Aufruf', spellcheck: 'false' });
      inputsTa.value = inputsAttr.replace(/\|/g, '\n');
      var ib = el('div', { class: 'a-inputbox' }, [el('label', { class: 'a-inputbox__label', text: 'Eingaben für input() (eine Zeile pro Aufruf)' }), inputsTa]);
      editorBox.insertAdjacentElement('afterend', ib);
      ui.inputBox = ib;
    }

    var runBtn = null, checkBtn = null, resetBtn, submitBtn = null;
    if (kind !== 'klausur') runBtn = el('button', { type: 'button', class: 'k-btn k-btn--small' + (kind === 'code' ? ' k-btn--ghost' : ''), text: 'Ausführen' });
    var stepBtn = null;
    if (kind !== 'klausur') {
      stepBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Schritt für Schritt' });
      stepBtn.addEventListener('click', function () {
        if (window.KursViz) window.KursViz.open(ta.value, { stdin: currentInputs().join(String.fromCharCode(10)), opener: stepBtn }).catch(function () { /* Fehler zeigt der Visualisierer */ });
      });
    }
    if (kind === 'code') checkBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Prüfen' });
    if (kind === 'klausur') submitBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Abgeben und prüfen' });
    resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: kind === 'klausur' ? 'Neu schreiben' : 'Zurücksetzen' });
    [runBtn, stepBtn, checkBtn, submitBtn, resetBtn, ui.hintBtn, ui.solBtn].forEach(function (b) { if (b) ui.bar.appendChild(b); });
    ui.bar.appendChild(ui.status);

    var anchor = ui.inputBox || editorBox;
    anchor.insertAdjacentElement('afterend', ui.bar);
    var cursor = ui.bar;
    var dataFiles = window.KursPy && window.KursPy.parseFiles ? window.KursPy.parseFiles(root.getAttribute('data-files')) : [];
    var uploader = root.hasAttribute('data-upload') && window.KursPy && window.KursPy.uploadUI ? window.KursPy.uploadUI('a-' + Math.random().toString(36).slice(2, 7)) : null;
    if (uploader) { cursor.insertAdjacentElement('afterend', uploader.el); cursor = uploader.el; }
    if (kind !== 'klausur') {
      ui.out = el('pre', { class: 'k-runner__out a-out', 'aria-live': 'polite', 'aria-label': 'Ausgabe', hidden: '' });
      cursor.insertAdjacentElement('afterend', ui.out); cursor = ui.out;
    }
    cursor.insertAdjacentElement('afterend', ui.results); cursor = ui.results;
    if (ui.hintBox) { cursor.insertAdjacentElement('afterend', ui.hintBox); cursor = ui.hintBox; }
    if (ui.solBox) { cursor.insertAdjacentElement('afterend', ui.solBox); cursor = ui.solBox; }

    function busy(on, text) {
      running = on;
      [runBtn, checkBtn, submitBtn].forEach(function (b) { if (b) b.disabled = on; });
      ui.status.innerHTML = '';
      if (on) { ui.status.appendChild(el('span', { class: 'k-spinner', 'aria-hidden': 'true' })); ui.status.appendChild(document.createTextNode(text)); }
    }
    function loadingText() { return window.KursPy && !window.KursPy.worker ? 'Python wird geladen (einmalig, ca. 10 MB) …' : 'läuft …'; }
    function currentInputs() { return inputsTa ? inputsTa.value.replace(/\r/g, '').split('\n').filter(function (l, i, a) { return !(i === a.length - 1 && l === ''); }) : []; }

    function doRun() {
      if (running) return;
      busy(true, loadingText());
      ui.out.hidden = false; ui.out.textContent = '';
      function app(t, cls) { var s = el('span', cls ? { class: cls } : null); s.textContent = t; ui.out.appendChild(s); ui.out.scrollTop = ui.out.scrollHeight; }
      var got = false;
      var rich = window.KursPy && window.KursPy.ui ? window.KursPy.ui(ui.out, { files: dataFiles, upload: uploader ? uploader.get : null, scan: ta.value }) : null;
      runPython('run', ta.value, currentInputs(), '', mode, timeout, { py: rich, files: dataFiles, onLine: function (t) { got = true; app(t); }, onErr: function (t) { got = true; app(t, 'err'); } }).then(function (r) {
        if (r.loadError) app('Python konnte nicht gestartet werden. Bist du online? (' + r.loadError + ')\n', 'err');
        else if (r.timedOut) app('\nAbgebrochen nach ' + (timeout / 1000) + ' s. Läuft da eine Endlosschleife?\n', 'err');
        else if (r.jsError) app(r.jsError + '\n', 'err');
        else if (!got) app('(keine Ausgabe – hast du print() benutzt?)', 'sys');
        busy(false);
        ui.status.textContent = r.timedOut ? 'abgebrochen' : (r.loadError ? 'Ladefehler – erneut versuchen' : 'fertig');
      });
    }

    function doCheck(afterwards) {
      if (running) return;
      if (!tests) return;
      busy(true, loadingText());
      runPython('test', ta.value, [], tests, mode, timeout, { files: dataFiles }).then(function (r) {
        busy(false);
        var all = renderResults(ui, r, root, timeout);
        if (!r.loadError && !r.timedOut) ui.unlockSolution();
        ui.status.textContent = all ? 'bestanden' : 'geprüft';
        if (all) { markSolved(root); addBadge(root); }
        if (afterwards) afterwards(all, r);
      });
    }

    if (runBtn) runBtn.addEventListener('click', doRun);
    if (checkBtn) checkBtn.addEventListener('click', function () { doCheck(); });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && kind !== 'klausur') { e.preventDefault(); doRun(); }
    });

    resetBtn.addEventListener('click', function () {
      if (kind === 'klausur') return;
      setValue(ta, original);
      if (inputsTa && inputsAttr !== null) inputsTa.value = inputsAttr.replace(/\|/g, '\n');
      if (ui.out) { ui.out.textContent = ''; ui.out.hidden = true; }
      ui.results.innerHTML = '';
      ui.status.textContent = 'zurückgesetzt';
    });

    if (kind === 'klausur') initKlausur(root, ta, ui, { submitBtn: submitBtn, resetBtn: resetBtn, doCheck: doCheck, original: original, solution: solution, cursor: cursor });
  }

  /* ── Klausur-Modus ───────────────────────────────────────── */
  function initKlausur(root, ta, ui, o) {
    var minutes = parseInt(root.getAttribute('data-minutes') || '0', 10);
    var schemeEl = $('script[data-role="scheme"]', root);
    var scheme = [];
    try { scheme = schemeEl ? JSON.parse(schemeEl.textContent) : []; } catch (e) { scheme = []; }
    var maxPts = scheme.reduce(function (s, x) { return s + (x.p || 0); }, 0);
    var timerEl = el('span', { class: 'a-timer', 'aria-live': 'off' });
    var started = 0, tick = null, submitted = false;
    function fmt(ms) { var s = Math.floor(ms / 1000); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2); }
    function showTimer() {
      var t = started ? fmt(Date.now() - started) : '00:00';
      timerEl.textContent = 'Zeit ' + t + (minutes ? ' · Richtzeit ' + minutes + ' Min' : '');
    }
    showTimer();
    ui.bar.insertBefore(timerEl, ui.status);
    function startTimer() {
      if (started || submitted) return;
      started = Date.now(); tick = setInterval(showTimer, 1000);
    }
    ta.addEventListener('input', startTimer);
    ta.addEventListener('keydown', startTimer);

    var schemeBox = el('div', { class: 'a-scheme', hidden: '' });
    o.cursor.insertAdjacentElement('afterend', schemeBox);
    var scoreEl = el('p', { class: 'a-scheme__score', role: 'status', 'aria-live': 'polite' });
    function buildScheme(testsPassed) {
      schemeBox.innerHTML = '';
      var fs = el('fieldset', { class: 'a-scheme__fs' }, [el('legend', { text: 'Selbstbewertung nach Punkteschema (' + maxPts + ' Punkte)' })]);
      fs.appendChild(el('p', { class: 'k-small k-muted', text: 'Lies deinen Code und die Musterlösung. Setze ein Häkchen nur dort, wo dein Code die Anforderung wirklich erfüllt. Die Tests oben zeigen, ob es läuft; in der Klausur zählt der Code auf Papier.' }));
      var boxes = [];
      scheme.forEach(function (it, i) {
        var id = (root.getAttribute('data-id') || 'k') + '-s' + i;
        var cb = el('input', { type: 'checkbox', id: id });
        var lab = el('label', { class: 'a-scheme__item', 'for': id }, [cb, el('span', { text: it.t }), el('span', { class: 'a-scheme__pts', text: it.p + (it.p === 1 ? ' Punkt' : ' Punkte') })]);
        cb.addEventListener('change', update);
        boxes.push({ cb: cb, p: it.p });
        fs.appendChild(lab);
      });
      function update() {
        var got = boxes.reduce(function (s, b) { return s + (b.cb.checked ? b.p : 0); }, 0);
        var pct = maxPts ? Math.round(100 * got / maxPts) : 0;
        scoreEl.textContent = 'Du gibst dir ' + got + ' von ' + maxPts + ' Punkten (' + pct + ' %). ' + (pct >= 50 ? 'Das wäre bestanden.' : 'Unter 50 %: Schau dir die Musterlösung an und schreib den Code morgen nochmal.');
        if (got * 2 >= maxPts && maxPts) { markSolved(root); addBadge(root); }
      }
      schemeBox.appendChild(fs); schemeBox.appendChild(scoreEl);
      scoreEl.textContent = 'Noch nichts angekreuzt.';
      schemeBox.hidden = false;
    }

    o.submitBtn.addEventListener('click', function () {
      if (!ta.value.trim()) { ui.status.textContent = 'Schreib erst etwas, dann abgeben.'; return; }
      submitted = true; if (tick) clearInterval(tick);
      ta.readOnly = true; ta.setAttribute('aria-readonly', 'true');
      root.classList.add('is-submitted');
      o.doCheck(function (all) {
        ui.unlockSolution();
        if (ui.solBox) { ui.solBox.hidden = false; if (ui.solBtn) ui.solBtn.textContent = 'Musterlösung verbergen'; }
        buildScheme(all);
        if (all) { markSolved(root); addBadge(root); }
      });
      o.submitBtn.hidden = true; o.resetBtn.hidden = false;
    });
    o.resetBtn.hidden = true;
    o.resetBtn.addEventListener('click', function () {
      submitted = false; started = 0; if (tick) clearInterval(tick); showTimer();
      ta.readOnly = false; ta.removeAttribute('aria-readonly');
      setValue(ta, '');
      root.classList.remove('is-submitted');
      ui.results.innerHTML = ''; schemeBox.hidden = true; schemeBox.innerHTML = '';
      if (ui.solBox) { ui.solBox.hidden = true; if (ui.solBtn) ui.solBtn.textContent = 'Musterlösung ansehen'; }
      o.submitBtn.hidden = false; o.resetBtn.hidden = true;
      ui.status.textContent = 'Neu starten: schreibe deinen Code ohne Ausführen.';
      ta.focus();
    });
  }

  /* ── Typ: gap (Lückencode) ───────────────────────────────── */
  function initGap(root) {
    var src = $('.a-gap__src', root);
    if (!src) return;
    var mode = root.getAttribute('data-mode') || 'programm';
    var timeout = parseInt(root.getAttribute('data-timeout') || '8000', 10);
    var tests = readScript(root, 'tests');
    var raw = src.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    var parts = raw.split('@@');   // gerade Indizes: Text, ungerade: Lücke
    var pre = el('pre', { class: 'a-gap__code' });
    var gaps = [], filled = '';
    parts.forEach(function (p, i) {
      if (i % 2 === 0) { pre.appendChild(document.createTextNode(p)); filled += p; return; }
      var answers = p.split('|');
      var inp = el('input', { type: 'text', class: 'a-gap__in', size: String(Math.max(3, answers[0].length + 1)), 'aria-label': 'Lücke ' + ((i + 1) / 2), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      inp.style.width = Math.max(3.2, answers[0].length * 0.62 + 1.6) + 'em';
      gaps.push({ inp: inp, answers: answers });
      pre.appendChild(inp);
      filled += answers[0];
    });
    var solution = filled;
    src.replaceWith(pre);
    var ui = buildCommon(root, { solution: solution });
    var checkBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Prüfen' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Zurücksetzen' });
    [checkBtn, resetBtn, ui.hintBtn, ui.solBtn].forEach(function (b) { if (b) ui.bar.appendChild(b); });
    ui.bar.appendChild(ui.status);
    pre.insertAdjacentElement('afterend', ui.bar);
    var cursor = ui.bar;
    cursor.insertAdjacentElement('afterend', ui.results); cursor = ui.results;
    if (ui.hintBox) { cursor.insertAdjacentElement('afterend', ui.hintBox); cursor = ui.hintBox; }
    if (ui.solBox) { cursor.insertAdjacentElement('afterend', ui.solBox); }

    function assemble() {
      var k = 0, out = '';
      parts.forEach(function (p, i) { if (i % 2 === 0) out += p; else out += gaps[k++].inp.value.trim(); });
      return out;
    }
    gaps.forEach(function (g) { g.inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkBtn.click(); } }); });
    var running = false;
    checkBtn.addEventListener('click', function () {
      if (running) return;
      if (gaps.some(function (g) { return !g.inp.value.trim(); })) { ui.status.textContent = 'Fülle erst alle Lücken.'; return; }
      running = true; checkBtn.disabled = true; ui.status.innerHTML = '';
      ui.status.appendChild(el('span', { class: 'k-spinner', 'aria-hidden': 'true' }));
      ui.status.appendChild(document.createTextNode(window.KursPy && !window.KursPy.worker ? 'Python wird geladen (einmalig, ca. 10 MB) …' : 'läuft …'));
      gaps.forEach(function (g) { g.inp.classList.remove('is-ok', 'is-bad'); });
      runPython('test', assemble(), [], tests, mode, timeout, { files: window.KursPy && window.KursPy.parseFiles ? window.KursPy.parseFiles(root.getAttribute('data-files')) : [] }).then(function (r) {
        running = false; checkBtn.disabled = false; ui.status.textContent = '';
        var all = renderResults(ui, r, root, timeout);
        if (!r.loadError && !r.timedOut) ui.unlockSolution();
        gaps.forEach(function (g) {
          var match = g.answers.indexOf(g.inp.value.trim()) >= 0;
          if (all) g.inp.classList.add('is-ok'); else if (!match) g.inp.classList.add('is-bad');
        });
        if (!all && !r.loadError && !r.timedOut && !r.fatal) ui.results.appendChild(el('p', { class: 'k-small k-muted', text: 'Rot umrandete Lücken weichen von der erwarteten Lösung ab. Fang dort an.' }));
        if (all) { markSolved(root); addBadge(root); }
      });
    });
    resetBtn.addEventListener('click', function () {
      gaps.forEach(function (g) { g.inp.value = ''; g.inp.classList.remove('is-ok', 'is-bad'); });
      ui.results.innerHTML = ''; ui.status.textContent = 'zurückgesetzt';
      if (gaps[0]) gaps[0].inp.focus();
    });
  }

  /* ── Typ: trace (Ablaufverfolgung) ───────────────────────── */
  function normVal(s) { return String(s).trim().replace(/"/g, "'").replace(/\s+/g, ' '); }
  function normOut(s) { return String(s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean).join('\n'); }

  function initTrace(root) {
    var cfgEl = $('script[type="application/json"]', root);
    if (!cfgEl) return;
    var cfg = JSON.parse(cfgEl.textContent);
    var code = cfg.code, vars = cfg.vars, steps = cfg.steps;
    var cur = 0, revealedCount = 0;
    var state = {};
    var wrap = el('div', { class: 'a-trace' });
    var codeOl = el('ol', { class: 'a-trace__code', 'aria-label': 'Programmzeilen' });
    code.forEach(function (l, i) {
      var li = el('li', { 'data-line': String(i + 1) }); li.appendChild(el('code', { text: l.length ? l : ' ' }));
      codeOl.appendChild(li);
    });
    var table = el('table', { class: 'a-trace__table' });
    var thead = el('thead'), htr = el('tr');
    htr.appendChild(el('th', { scope: 'col', text: 'Schritt' }));
    htr.appendChild(el('th', { scope: 'col', text: 'Zeile' }));
    vars.forEach(function (v) { htr.appendChild(el('th', { scope: 'col' }, [el('code', { text: v })])); });
    htr.appendChild(el('th', { scope: 'col', text: 'Ausgabe' }));
    thead.appendChild(htr); table.appendChild(thead);
    var tbody = el('tbody'); table.appendChild(tbody);
    var tw = el('div', { class: 'k-tablewrap a-trace__tw' }, [table]);
    var msg = el('div', { class: 'a-trace__msg', role: 'status', 'aria-live': 'polite' });
    var ctrl = el('div', { class: 'a-bar' });
    var checkBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Zeile prüfen' });
    var showBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Lösung dieser Zeile zeigen', hidden: '' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Von vorn' });
    ctrl.appendChild(checkBtn); ctrl.appendChild(showBtn); ctrl.appendChild(resetBtn);
    wrap.appendChild(el('div', { class: 'a-trace__left' }, [codeOl]));
    wrap.appendChild(el('div', { class: 'a-trace__right' }, [tw, ctrl, msg]));
    root.appendChild(wrap);

    var tries = 0, inputs = [], outInput = null, rowEl = null;

    function highlight(line, done) {
      $$('li', codeOl).forEach(function (li) {
        var n = parseInt(li.getAttribute('data-line'), 10);
        li.classList.toggle('is-cur', n === line);
        if (n === line) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
    }
    function addRow() {
      var s = steps[cur];
      var tr = el('tr', { class: 'is-active' });
      tr.appendChild(el('th', { scope: 'row', text: String(cur + 1) }));
      tr.appendChild(el('td', { class: 'a-trace__line', text: String(s.line) }));
      inputs = [];
      vars.forEach(function (v) {
        var td = el('td');
        if (s.set && Object.prototype.hasOwnProperty.call(s.set, v)) {
          var inp = el('input', { type: 'text', class: 'a-trace__in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Wert von ' + v + ' nach Zeile ' + s.line });
          inp.setAttribute('data-var', v);
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkBtn.click(); } });
          inputs.push(inp); td.appendChild(inp);
        } else {
          td.appendChild(el('span', { class: state[v] !== undefined ? 'a-trace__val' : 'a-trace__undef', text: state[v] !== undefined ? state[v] : '–' }));
        }
        tr.appendChild(td);
      });
      var tdo = el('td');
      outInput = null;
      if (s.out !== undefined) {
        outInput = el('input', { type: 'text', class: 'a-trace__in a-trace__in--out', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Ausgabe von print() in Zeile ' + s.line });
        outInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkBtn.click(); } });
        tdo.appendChild(outInput);
      } else tdo.appendChild(el('span', { class: 'a-trace__undef', text: '' }));
      tr.appendChild(tdo);
      tbody.appendChild(tr); rowEl = tr;
      highlight(s.line);
      tries = 0; showBtn.hidden = true;
      msg.className = 'a-trace__msg';
      msg.textContent = 'Zeile ' + s.line + ' wird ausgeführt. Was steht danach in den markierten Feldern' + (s.out !== undefined ? ' und in der Ausgabe?' : '?') + ' Typen beachten: Text steht in Anführungszeichen.';
      var first = (inputs[0] || outInput); if (first && cur > 0) first.focus();
    }
    function lockRow(revealed) {
      var s = steps[cur];
      inputs.forEach(function (inp) {
        var v = inp.getAttribute('data-var');
        state[v] = s.set[v];
        var td = inp.parentNode; td.innerHTML = '';
        td.appendChild(el('span', { class: 'a-trace__val is-new' + (revealed ? ' is-revealed' : ''), text: s.set[v] }));
      });
      if (outInput) { var td2 = outInput.parentNode; td2.innerHTML = ''; td2.appendChild(el('span', { class: 'a-trace__val is-new' + (revealed ? ' is-revealed' : ''), text: s.out })); }
      rowEl.classList.remove('is-active'); rowEl.classList.add('is-done');
      if (revealed) revealedCount++;
    }
    function advance(revealed) {
      lockRow(revealed);
      cur++;
      if (cur >= steps.length) {
        highlight(0);
        checkBtn.hidden = true; showBtn.hidden = true;
        msg.className = 'a-trace__msg is-ok';
        msg.textContent = revealedCount === 0 ? 'Geschafft: alle ' + steps.length + ' Schritte richtig verfolgt.' : 'Fertig. ' + revealedCount + ' von ' + steps.length + ' Schritten hast du dir zeigen lassen. Versuch es von vorn ohne Hilfe.';
        if (revealedCount === 0) { markSolved(root); addBadge(root); }
        return;
      }
      addRow();
    }
    checkBtn.addEventListener('click', function () {
      if (cur >= steps.length) return;
      var s = steps[cur], ok = true, empty = false;
      inputs.forEach(function (inp) {
        var v = inp.getAttribute('data-var');
        if (!inp.value.trim()) { empty = true; inp.classList.add('is-bad'); return; }
        var good = normVal(inp.value) === normVal(s.set[v]);
        inp.classList.toggle('is-bad', !good); inp.classList.toggle('is-good', good);
        inp.setAttribute('aria-invalid', good ? 'false' : 'true');
        if (!good) ok = false;
      });
      if (outInput) {
        if (!outInput.value.trim()) { empty = true; outInput.classList.add('is-bad'); }
        else {
          var goodO = normOut(outInput.value) === normOut(s.out);
          outInput.classList.toggle('is-bad', !goodO); outInput.classList.toggle('is-good', goodO);
          if (!goodO) ok = false;
        }
      }
      if (empty) { msg.className = 'a-trace__msg is-bad'; msg.textContent = 'Fülle alle markierten Felder aus.'; return; }
      if (ok) { advance(false); return; }
      tries++;
      msg.className = 'a-trace__msg is-bad';
      msg.textContent = 'Noch nicht richtig. ' + (s.hint ? s.hint : 'Geh die Zeile nochmal durch: Welcher Typ kommt heraus (Text mit Anführungszeichen, int ohne Punkt, float mit Punkt)?');
      if (tries >= 2) showBtn.hidden = false;
    });
    showBtn.addEventListener('click', function () { advance(true); });
    resetBtn.addEventListener('click', function () {
      tbody.innerHTML = ''; cur = 0; revealedCount = 0; state = {};
      checkBtn.hidden = false; addRow(); highlight(steps[0].line);
      (inputs[0] || outInput).focus();
    });
    addRow();
  }

  /* ── Typ: parsons ────────────────────────────────────────── */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function initParsons(root) {
    var cfgEl = $('script[type="application/json"]', root);
    if (!cfgEl) return;
    var cfg = JSON.parse(cfgEl.textContent);
    var INDENT = 4, MAXLVL = 4;
    var sol = cfg.solution, alts = [sol].concat(cfg.alts || []);
    var items = [];
    sol.forEach(function (l, i) { items.push({ id: 'z' + i, text: l.trim(), level: 0, bad: false, inAns: false }); });
    (cfg.distractors || []).forEach(function (l, i) { items.push({ id: 'd' + i, text: l.trim(), level: 0, bad: true, inAns: false }); });
    var poolArr, ansArr;
    (function init() {
      var tries = 0, order;
      do { order = shuffle(items.slice()); tries++; }
      while (tries < 20 && order.filter(function (x) { return !x.bad; }).every(function (x, i) { return x.id === 'z' + i; }) && sol.length > 1);
      poolArr = order; ansArr = [];
    })();

    var help = el('p', { class: 'a-help k-small k-muted' });
    help.innerHTML = '<strong>So geht\'s:</strong> Klick oder Enter auf eine Zeile im Vorrat legt sie in dein Programm. Dort ziehst du Zeilen mit der Maus. Mit der Tastatur: Enter greift eine Zeile, dann ↑ ↓ verschieben, → ← einrücken, Entf zurück in den Vorrat, Enter lässt los.';
    var poolUl = el('ul', { class: 'a-p-list a-p-pool', 'aria-label': 'Vorrat an Codezeilen' });
    var ansUl = el('ul', { class: 'a-p-list a-p-ans', 'aria-label': 'Dein Programm' });
    var poolBox = el('div', { class: 'a-p-col' }, [el('div', { class: 'a-p-title', text: 'Vorrat (gemischt)' }), poolUl]);
    var ansBox = el('div', { class: 'a-p-col' }, [el('div', { class: 'a-p-title', text: 'Dein Programm' }), ansUl]);
    var cols = el('div', { class: 'a-p-cols' }, [poolBox, ansBox]);
    var live = el('div', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var bar = el('div', { class: 'a-bar' });
    var checkBtn = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Prüfen' });
    var resetBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu mischen' });
    var fb = el('div', { class: 'a-p-fb', role: 'status', 'aria-live': 'polite' });
    bar.appendChild(checkBtn); bar.appendChild(resetBtn);
    root.appendChild(help); root.appendChild(cols); root.appendChild(bar); root.appendChild(fb); root.appendChild(live);

    var grabbed = null, focusId = null, dragId = null;
    function find(id) { return items.filter(function (x) { return x.id === id; })[0]; }
    function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 20); }
    function clearMarks() { $$('.is-right,.is-wrong', ansUl).forEach(function (n) { n.classList.remove('is-right', 'is-wrong'); }); fb.className = 'a-p-fb'; fb.textContent = ''; }

    function toolBtn(icon, aria, fn) {
      var b = el('button', { type: 'button', class: 'a-p-tool', 'aria-label': aria, title: aria, tabindex: '-1' }, [window.KIcon(icon)]);
      b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
      return b;
    }
    function mk(it, inAns, idx) {
      var li = el('li', { class: 'a-p-item' + (inAns ? ' in-ans' : ''), tabindex: '0', draggable: 'true', 'data-id': it.id });
      var codeEl = el('span', { class: 'a-p-code' }); codeEl.appendChild(el('code', { text: it.text }));
      if (inAns) codeEl.style.marginLeft = (it.level * 2.4) + 'ch';
      li.appendChild(codeEl);
      li.setAttribute('aria-label', (inAns ? 'Zeile ' + (idx + 1) + (it.level ? ', Einrückung ' + it.level : '') + ': ' : 'Vorrat: ') + it.text);
      if (grabbed === it.id) { li.classList.add('is-grabbed'); li.setAttribute('aria-grabbed', 'true'); }
      if (inAns) {
        var tools = el('span', { class: 'a-p-tools' });
        tools.appendChild(toolBtn('chevron-up', 'Nach oben', function () { move(it, -1); }));
        tools.appendChild(toolBtn('chevron-down', 'Nach unten', function () { move(it, 1); }));
        tools.appendChild(toolBtn('indent-less', 'Weniger einrücken', function () { indent(it, -1); }));
        tools.appendChild(toolBtn('indent-more', 'Weiter einrücken', function () { indent(it, 1); }));
        tools.appendChild(toolBtn('×', 'Zurück in den Vorrat', function () { toPool(it); }));
        li.appendChild(tools);
        li.addEventListener('click', function () { li.classList.toggle('is-sel'); });
      } else {
        li.addEventListener('click', function () { toAns(it); });
      }
      li.addEventListener('keydown', function (e) { onKey(e, it, inAns); });
      li.addEventListener('dragstart', function (e) { dragId = it.id; li.classList.add('is-drag'); try { e.dataTransfer.setData('text/plain', it.id); e.dataTransfer.effectAllowed = 'move'; } catch (x) { /* IE */ } });
      li.addEventListener('dragend', function () { dragId = null; li.classList.remove('is-drag'); $$('.is-over', root).forEach(function (n) { n.classList.remove('is-over'); }); $$('.a-p-drop', root).forEach(function (n) { n.remove(); }); });
      return li;
    }
    function render() {
      poolUl.innerHTML = ''; ansUl.innerHTML = '';
      poolArr.forEach(function (it, i) { poolUl.appendChild(mk(it, false, i)); });
      ansArr.forEach(function (it, i) { ansUl.appendChild(mk(it, true, i)); });
      if (!poolArr.length) poolUl.appendChild(el('li', { class: 'a-p-empty', text: 'Vorrat leer.' }));
      if (!ansArr.length) ansUl.appendChild(el('li', { class: 'a-p-empty', text: 'Noch leer. Zeilen aus dem Vorrat hierher legen oder ziehen.' }));
      if (focusId) { var n = $('[data-id="' + focusId + '"]', root); if (n) n.focus(); focusId = null; }
    }
    function remove(it) { var i = poolArr.indexOf(it); if (i >= 0) poolArr.splice(i, 1); i = ansArr.indexOf(it); if (i >= 0) ansArr.splice(i, 1); }
    function toAns(it, at) {
      var pi = poolArr.indexOf(it);
      remove(it); it.level = 0;
      var nextPool = pi >= 0 ? (poolArr[Math.min(pi, poolArr.length - 1)]) : null;
      if (at === undefined || at > ansArr.length) at = ansArr.length;
      ansArr.splice(at, 0, it); clearMarks();
      focusId = nextPool ? nextPool.id : it.id;
      render(); say('Zeile in dein Programm gelegt, Position ' + (ansArr.indexOf(it) + 1) + ' von ' + ansArr.length);
    }
    function toPool(it, at) {
      var i = ansArr.indexOf(it); var neighbour = ansArr[i + 1] || ansArr[i - 1];
      remove(it); it.level = 0;
      if (at === undefined || at > poolArr.length) at = poolArr.length;
      poolArr.splice(at, 0, it); grabbed = null; clearMarks();
      focusId = neighbour ? neighbour.id : it.id;
      render(); say('Zeile zurück in den Vorrat');
    }
    function move(it, d) {
      var i = ansArr.indexOf(it), j = i + d;
      if (j < 0 || j >= ansArr.length) return;
      ansArr.splice(i, 1); ansArr.splice(j, 0, it); clearMarks(); focusId = it.id; render();
      say('Position ' + (j + 1) + ' von ' + ansArr.length);
    }
    function indent(it, d) {
      var l = Math.max(0, Math.min(MAXLVL, it.level + d));
      if (l === it.level) return;
      it.level = l; clearMarks(); focusId = it.id; render(); say('Einrückung ' + l);
    }
    function onKey(e, it, inAns) {
      var k = e.key;
      if (e.target !== e.currentTarget) return;
      if (!inAns) {
        if (k === 'Enter' || k === ' ') { e.preventDefault(); toAns(it); }
        else if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); var li = e.currentTarget[k === 'ArrowDown' ? 'nextElementSibling' : 'previousElementSibling']; if (li && li.focus) li.focus(); }
        return;
      }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); grabbed = grabbed === it.id ? null : it.id; focusId = it.id; render(); say(grabbed ? 'Zeile gegriffen. Pfeiltasten zum Verschieben und Einrücken.' : 'Zeile losgelassen.'); return; }
      if (k === 'Escape' && grabbed) { grabbed = null; focusId = it.id; render(); return; }
      if (k === 'ArrowUp') { e.preventDefault(); if (grabbed === it.id) move(it, -1); else { var p = e.currentTarget.previousElementSibling; if (p && p.focus) p.focus(); } }
      else if (k === 'ArrowDown') { e.preventDefault(); if (grabbed === it.id) move(it, 1); else { var n = e.currentTarget.nextElementSibling; if (n && n.focus) n.focus(); } }
      else if (k === 'ArrowRight') { e.preventDefault(); indent(it, 1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); indent(it, -1); }
      else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); toPool(it); }
    }

    // Drag & Drop (Maus; Touch-Geräte nutzen Klick und die Pfeil-Knöpfe)
    function dropIndex(ul, y) {
      var kids = $$('.a-p-item', ul).filter(function (n) { return n.getAttribute('data-id') !== dragId; });
      for (var i = 0; i < kids.length; i++) { var r = kids[i].getBoundingClientRect(); if (y < r.top + r.height / 2) return i; }
      return kids.length;
    }
    [poolUl, ansUl].forEach(function (ul) {
      ul.addEventListener('dragover', function (e) {
        if (!dragId) return; e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch (x) { /* ignorieren */ }
        ul.classList.add('is-over');
        $$('.a-p-drop', ul).forEach(function (n) { n.remove(); });
        var idx = dropIndex(ul, e.clientY), kids = $$('.a-p-item', ul).filter(function (n) { return n.getAttribute('data-id') !== dragId; });
        var mark = el('li', { class: 'a-p-drop', 'aria-hidden': 'true' });
        if (kids[idx]) ul.insertBefore(mark, kids[idx]); else ul.appendChild(mark);
      });
      ul.addEventListener('dragleave', function (e) { if (!ul.contains(e.relatedTarget)) { ul.classList.remove('is-over'); $$('.a-p-drop', ul).forEach(function (n) { n.remove(); }); } });
      ul.addEventListener('drop', function (e) {
        if (!dragId) return; e.preventDefault();
        var it = find(dragId), idx = dropIndex(ul, e.clientY);
        dragId = null; ul.classList.remove('is-over');
        var before = ansArr.slice(), lvl = it.level;
        if (ul === ansUl) {
          remove(it); if (before.indexOf(it) < 0) it.level = 0; else it.level = lvl;
          ansArr.splice(Math.min(idx, ansArr.length), 0, it);
        } else { remove(it); it.level = 0; poolArr.splice(Math.min(idx, poolArr.length), 0, it); }
        clearMarks(); focusId = it.id; render();
      });
    });

    checkBtn.addEventListener('click', function () {
      var user = ansArr.map(function (it) { return new Array(it.level * INDENT + 1).join(' ') + it.text; });
      var best = alts[0], bestM = -1, exact = false;
      alts.forEach(function (a) {
        if (a.length === user.length && a.every(function (l, i) { return l === user[i]; })) exact = true;
        var m = 0; user.forEach(function (l, i) { if (a[i] === l) m++; });
        if (m > bestM) { bestM = m; best = a; }
      });
      var lis = $$('.a-p-item', ansUl);
      lis.forEach(function (li, i) { li.classList.remove('is-right', 'is-wrong'); li.classList.add(best[i] === user[i] ? 'is-right' : 'is-wrong'); });
      if (exact) {
        fb.className = 'a-p-fb is-ok';
        fb.textContent = 'Richtig. Reihenfolge und Einrückung stimmen' + (cfg.ok ? ' – ' + cfg.ok : '.');
        markSolved(root); addBadge(root); return;
      }
      var msgs = [];
      var nBad = ansArr.filter(function (x) { return x.bad; }).length;
      if (!ansArr.length) msgs.push('Du hast noch keine Zeile gelegt.');
      if (ansArr.length < sol.length) msgs.push('Es fehlen noch Zeilen (' + (sol.length - ansArr.filter(function (x) { return !x.bad; }).length) + ').');
      if (nBad) msgs.push(plural(nBad, 'Zeile gehört', 'Zeilen gehören') + ' gar nicht ins Programm (Ablenker): Sie sind rot markiert. Wo kracht es, wenn du sie ausführst?');
      var textOrder = user.map(function (l) { return l.trim(); }), solOrder = best.map(function (l) { return l.trim(); });
      if (!nBad && textOrder.length === solOrder.length && textOrder.every(function (l, i) { return l === solOrder[i]; })) msgs.push('Die Reihenfolge stimmt, aber die Einrückung nicht überall. Was gehört in den Block unter dem Doppelpunkt?');
      else msgs.push(bestM + ' von ' + best.length + ' Zeilen stehen schon an der richtigen Stelle (grün). Rot markierte Zeilen sind falsch platziert oder falsch eingerückt.');
      fb.className = 'a-p-fb is-bad'; fb.textContent = msgs.join(' ');
    });
    resetBtn.addEventListener('click', function () {
      items.forEach(function (x) { x.level = 0; });
      poolArr = shuffle(items.slice()); ansArr = []; grabbed = null; clearMarks(); render();
      say('Zeilen neu gemischt');
    });
    render();
  }

  /* ── Start ───────────────────────────────────────────────── */
  function init() {
    $$('[data-a="parsons"]').forEach(initParsons);
    $$('[data-a="trace"]').forEach(initTrace);
    $$('[data-a="gap"]').forEach(initGap);
    $$('[data-a="code"],[data-a="run"],[data-a="klausur"]').forEach(initCode);
    var sv = Store.solved(lessonId());
    taskNodes().forEach(function (t) { if (sv[t.getAttribute('data-id')]) addBadge(t); });
    updateProgress();
    // „begonnen“: erste Eingabe oder Bedienung in einer Aufgabe
    function startedFrom(e) { var t = e.target && e.target.closest ? e.target.closest('[data-a][data-id]') : null; if (t) markStarted(t); }
    document.addEventListener('input', startedFrom);
    document.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('.a-p-item, .a-bar button, .a-trace button')) startedFrom(e);
    });
    // Startseite: Trainingsfortschritt
    $$('[data-a-index]').forEach(function (n) {
      var lesson = n.getAttribute('data-a-index'), prefix = n.getAttribute('data-prefix') || 'tr-';
      var total = parseInt(n.getAttribute('data-total') || '0', 10), s = Store.solved(lesson);
      var c = Object.keys(s).filter(function (k) { return k.indexOf(prefix) === 0; }).length;
      if (c > 0) { n.textContent = 'Labor Teil B: ' + c + ' von ' + total + ' Aufgaben gelöst'; n.hidden = false; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.KursAufgaben = { pyProgram: pyProgram, runPython: runPython, prelude: PY_PRELUDE, store: Store, update: updateProgress };
})();
