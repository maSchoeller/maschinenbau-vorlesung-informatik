/* =============================================================
   viz.js – Schritt-für-Schritt-Visualisierer (DESIGN.md Regel 14)
   Wird von kurs.js beim ersten Öffnen nachgeladen.
   API:  window.KursViz.open(code, { stdin: 'a\nb', opener: element, timeout: ms })  -> Promise
   Ablauf: Der Code läuft im Pyodide-Worker (KursPy) unter sys.settrace und wird Schritt für Schritt
   aufgezeichnet (max. 1000 Schritte, 5 s). Die Wiedergabe ist reines JavaScript und braucht Python nicht mehr.
   Pro Schritt: aktuelle Zeile, Aufrufstapel, Variablen je Frame, Objekte mit Identität (gleiches Objekt
   = gleicher Kasten, Pfeile von den Namen), bisherige Ausgabe.
   ============================================================= */
(function () {
  'use strict';
  if (window.KursViz && window.KursViz._real) return;

  var MAX_STEPS = 1000;
  var NS = 'http://www.w3.org/2000/svg';

  /* ── Python-Seite: zeichnet den Ablauf auf (läuft im Worker, Code kommt als _kc_src) ── */
  var TRACE_PY = String.raw`
import sys, builtins, json, time, types
_MAXS = int(_kc_max)
_lines = _kc_stdin.split("\n") if _kc_stdin else []
if _lines and _lines[-1] == "":
    _lines.pop()
_pos = 0
_out = []
_olen = [0]
class _W:
    def write(self, s):
        s = str(s)
        _out.append(s)
        _olen[0] += len(s)
        return len(s)
    def flush(self):
        pass
    def isatty(self):
        return False
class _Stop(BaseException):
    pass
def _kc_input(prompt=""):
    global _pos
    sys.stdout.write(str(prompt))
    if _pos >= len(_lines):
        sys.stdout.write("\n")
        raise EOFError("input() braucht eine Eingabe, aber im Feld „Eingaben“ steht keine Zeile mehr. Trage dort für jedes input() eine Zeile ein.")
    v = _lines[_pos]
    _pos += 1
    sys.stdout.write(v + "\n")
    return v
_ids = {}
_keep = []
_SC = (bool, int, float, complex, str, type(None))
def _short(r, n=48):
    return r if len(r) <= n else r[:n - 1] + "…"
def _idof(o):
    k = id(o)
    n = _ids.get(k)
    if n is None:
        n = len(_ids) + 1
        _ids[k] = n
        _keep.append(o)
    return n
def _safe_repr(v, n=70):
    try:
        return _short(repr(v), n)
    except Exception:
        return "<" + type(v).__name__ + ">"
def _enc(v, heap):
    t = type(v)
    if t in _SC:
        return ["v", _short(repr(v), 60), t.__name__]
    if isinstance(v, types.FunctionType):
        return ["v", "Funktion " + v.__name__, "function"]
    if isinstance(v, types.ModuleType):
        return ["v", "Modul " + v.__name__, "module"]
    if isinstance(v, type):
        return ["v", "Klasse " + v.__name__, "class"]
    if isinstance(v, (types.BuiltinFunctionType, types.MethodType, types.BuiltinMethodType)):
        return ["v", _safe_repr(v, 40), t.__name__]
    n = _idof(v)
    if n not in heap:
        heap[n] = None
        try:
            if t is list or t is tuple or t is set or t is frozenset:
                items = list(v)[:24]
                heap[n] = {"t": t.__name__, "k": "seq", "v": [_enc(x, heap) for x in items], "more": len(v) - len(items)}
            elif t is dict:
                items = list(v.items())[:24]
                heap[n] = {"t": "dict", "k": "dict", "v": [[_enc(a, heap), _enc(b, heap)] for a, b in items], "more": len(v) - len(items)}
            elif hasattr(v, "__dict__"):
                items = list(vars(v).items())[:24]
                heap[n] = {"t": t.__name__, "k": "obj", "v": [[a, _enc(b, heap)] for a, b in items], "more": 0}
            else:
                heap[n] = {"t": t.__name__, "k": "other", "r": _safe_repr(v, 80)}
        except Exception:
            heap[n] = {"t": t.__name__, "k": "other", "r": _safe_repr(v, 80)}
    return ["r", n]
_steps = []
_deadline = [0.0]
_exc = [None]
_pend = [False]
def _frames(frame):
    chain = []
    f = frame
    while f is not None:
        if f.f_code.co_filename == "<viz>":
            chain.append(f)
        f = f.f_back
    chain.reverse()
    return chain
def _snap(frame, event, arg):
    heap = {}
    fl = []
    for f in _frames(frame):
        isg = f.f_code.co_name == "<module>"
        d = f.f_globals if isg else f.f_locals
        vs = []
        for k, v in list(d.items()):
            if k.startswith("__"):
                continue
            vs.append([k, _enc(v, heap)])
        fl.append(["Globale Variablen" if isg else f.f_code.co_name, f.f_lineno, vs])
    st = {"l": frame.f_lineno, "ev": event, "f": fl, "h": heap, "o": _olen[0]}
    return st
def _local(frame, event, arg):
    if event == "line" or event == "return" or event == "exception":
        if len(_steps) >= _MAXS or time.perf_counter() > _deadline[0]:
            raise _Stop()
        if event == "exception":
            if arg[1] is _exc[0]:
                return _local
            _exc[0] = arg[1]
            _pend[0] = True
        elif event == "line":
            _pend[0] = False
        elif event == "return" and _pend[0] and arg is None:
            return _local
        st = _snap(frame, event, arg)
        if event == "return":
            st["rv"] = _enc(arg, {})
            if frame.f_code.co_name == "<module>":
                st["end"] = True
                del st["rv"]
        if event == "exception":
            st["err"] = type(arg[1]).__name__ + ": " + str(arg[1])
        _steps.append(st)
    return _local
def _global(frame, event, arg):
    if frame.f_code.co_filename != "<viz>":
        return None
    return _local
_res = {"err": None, "errline": None, "trunc": False}
_orig_input = builtins.input
_orig_out = sys.stdout
try:
    co = compile(_kc_src, "<viz>", "exec")
except SyntaxError as e:
    co = None
    _res["err"] = "SyntaxError: " + str(e.msg)
    _res["errline"] = e.lineno
if co is not None:
    builtins.input = _kc_input
    sys.stdout = _W()
    _deadline[0] = time.perf_counter() + 5.0
    _g = {"__name__": "__main__", "__builtins__": builtins}
    sys.settrace(_global)
    try:
        exec(co, _g)
    except _Stop:
        _res["trunc"] = True
    except SystemExit:
        pass
    except BaseException as e:
        _res["err"] = type(e).__name__ + ": " + str(e) if str(e) else type(e).__name__
        if _exc[0] is not e and _steps:
            last = dict(_steps[-1])
            last["ev"] = "exception"
            last["err"] = _res["err"]
            _steps.append(last)
    finally:
        sys.settrace(None)
        sys.stdout = _orig_out
        builtins.input = _orig_input
_res["steps"] = _steps
_res["out"] = "".join(_out)
json.dumps(_res)
`;

  /* ── Hilfsfunktionen ─────────────────────────────────────── */
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
  function icon(id) { return window.KIcon ? window.KIcon(id) : document.createElement('span'); }
  function btn(label, iconId, cls, showText) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || '') });
    if (iconId) b.appendChild(icon(iconId));
    if (showText) b.appendChild(document.createTextNode(label));
    else b.setAttribute('aria-label', label);
    b.setAttribute('data-tip', label);
    return b;
  }
  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* kleiner Python-Färber für die Codeansicht */
  var KW = /^(and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False)$/;
  var BI = /^(print|input|int|float|str|len|range|list|dict|set|tuple|bool|abs|min|max|sum|round|type|sorted|enumerate|zip|isinstance)$/;
  function highlight(line, parent) {
    var re = /(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?\b)|([A-Za-z_]\w*)|(\s+|.)/g, m;
    function span(c, t) { var s = el('span', c ? { class: c } : null); s.textContent = t; parent.appendChild(s); }
    while ((m = re.exec(line))) {
      if (m[1]) span('kv-t-com', m[1]);
      else if (m[2]) span('kv-t-str', m[2]);
      else if (m[3]) span('kv-t-num', m[3]);
      else if (m[4]) span(KW.test(m[4]) ? 'kv-t-kw' : (BI.test(m[4]) ? 'kv-t-fn' : ''), m[4]);
      else span('', m[5]);
    }
  }

  /* ── Aufzeichnen ─────────────────────────────────────────── */
  function record(code, o) {
    if (!window.KursPy) return Promise.reject(new Error('Python-Runner (kurs.js) nicht geladen'));
    return window.KursPy.run(code, {
      timeout: o.timeout ? Math.max(o.timeout, 12000) : 15000,
      harness: TRACE_PY,
      vars: { _kc_stdin: o.stdin || '', _kc_max: MAX_STEPS },
      onOut: function () {}, onErr: function () {}
    }).then(function (r) {
      if (r.timedOut) throw new Error('Das Programm braucht zu lange (Endlosschleife?). Die Aufzeichnung wurde abgebrochen.');
      if (r.error) throw new Error(r.error);
      return JSON.parse(r.result);
    });
  }

  /* ── Dialog ──────────────────────────────────────────────── */
  var current = null;

  function open(code, o) {
    o = o || {};
    code = String(code == null ? '' : code).replace(/\s+$/, '');
    if (current) current.close();
    return new Promise(function (resolve) {
      var v = createView(code, o, resolve);
      current = v;
    });
  }

  function createView(code, o, done) {
    var srcLines = code.split('\n');
    var opener = o.opener || document.activeElement;
    var data = null, idx = 0, playing = false, timer = null, prevStep = null;
    var uid = 'kv' + Math.random().toString(36).slice(2, 7);

    var back = el('div', { class: 'kv' });
    var panel = el('div', { class: 'kv__panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': uid + '-t', tabindex: '-1' });
    var closeBtn = el('button', { type: 'button', class: 'kv__close k-btn k-btn--small k-btn--link' });
    closeBtn.appendChild(icon('x')); closeBtn.appendChild(document.createTextNode('Schließen'));
    var head = el('div', { class: 'kv__head' }, [el('h2', { class: 'kv__title', id: uid + '-t', text: 'Schritt für Schritt' }), closeBtn]);
    var body = el('div', { class: 'kv__body' });
    panel.appendChild(head); panel.appendChild(body);
    back.appendChild(panel);

    // Ladezustand
    var loadMsg = el('p', { class: 'kv__load', role: 'status' }, [el('span', { class: 'k-spinner', 'aria-hidden': 'true' }), document.createTextNode(window.KursPy && !window.KursPy.worker ? 'Python wird geladen (einmalig, ca. 10 MB), danach wird das Programm aufgezeichnet …' : 'Programm wird aufgezeichnet …')]);
    body.appendChild(loadMsg);

    document.body.appendChild(back);
    document.documentElement.classList.add('kv-open');
    panel.focus();

    /* Bausteine der Ansicht (nach der Aufzeichnung) */
    var codeBox, lineEls = [], memBox, framesBox, heapBox, heapCol, svg, outPre, errBox, statusEl, slider, counter, playBtn, firstBtn, prevBtn, nextBtn, lastBtn, note;

    function buildView() {
      body.textContent = '';
      codeBox = el('ol', { class: 'kv__code', 'aria-label': 'Programmcode' });
      srcLines.forEach(function (l, i) {
        var li = el('li', { class: 'kv-line', value: String(i + 1) });
        var t = el('span', { class: 'kv-line__t' });
        if (l === '') t.appendChild(document.createTextNode('​')); else highlight(l, t);
        li.appendChild(t);
        codeBox.appendChild(li); lineEls.push(li);
      });
      framesBox = el('div', { class: 'kv__frames' });
      heapBox = el('div', { class: 'kv__heap' });
      heapCol = el('div', { class: 'kv__col kv__col--heap' }, [el('h3', { class: 'kv__h', text: 'Objekte' }), heapBox]);
      var frameCol = el('div', { class: 'kv__col' }, [el('h3', { class: 'kv__h', text: 'Aufrufstapel und Variablen' }), framesBox]);
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'kv__arrows'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      memBox = el('div', { class: 'kv__mem' }, [frameCol, heapCol, svg]);
      var codeWrap = el('div', { class: 'kv__pane kv__pane--code' }, [el('h3', { class: 'kv__h kv__h--dark', text: 'Code' }), codeBox]);
      var memWrap = el('div', { class: 'kv__pane kv__pane--mem' }, [el('h3', { class: 'kv__h', text: 'Speicher' }), memBox]);
      var grid = el('div', { class: 'kv__grid' }, [codeWrap, memWrap]);

      outPre = el('pre', { class: 'kv__out', 'aria-label': 'Ausgabe bis zu diesem Schritt' });
      var outWrap = el('div', { class: 'kv__outwrap' }, [el('h3', { class: 'kv__h', text: 'Ausgabe' }), outPre]);
      errBox = el('p', { class: 'kv__err', hidden: '', role: 'alert' });
      note = el('p', { class: 'kv__note', hidden: '' });
      statusEl = el('p', { class: 'kv__status', role: 'status', 'aria-live': 'polite' });

      firstBtn = btn('Zum Anfang', 'skip-start', 'k-btn--ghost');
      prevBtn = btn('Zurück', 'chevron-left', 'k-btn--ghost', true);
      nextBtn = btn('Weiter', 'chevron-right', '', true);
      nextBtn.appendChild(nextBtn.firstChild);   // Icon nach dem Text
      lastBtn = btn('Zum Ende', 'skip-end', 'k-btn--ghost');
      playBtn = btn('Abspielen', 'play', 'k-btn--ghost', true);
      slider = el('input', { type: 'range', class: 'kv__slider', min: '0', max: String(data.steps.length - 1), value: '0', step: '1', 'aria-label': 'Schritt wählen' });
      counter = el('span', { class: 'kv__counter' });
      var ctr = el('div', { class: 'kv__ctrl' }, [
        el('div', { class: 'kv__btns' }, [firstBtn, prevBtn, nextBtn, lastBtn, playBtn]),
        el('div', { class: 'kv__scrub' }, [slider, counter])
      ]);
      body.appendChild(ctr); body.appendChild(statusEl); body.appendChild(grid); body.appendChild(outWrap); body.appendChild(errBox); body.appendChild(note);

      firstBtn.addEventListener('click', function () { stop(); go(0); });
      lastBtn.addEventListener('click', function () { stop(); go(data.steps.length - 1); });
      prevBtn.addEventListener('click', function () { stop(); go(idx - 1); });
      nextBtn.addEventListener('click', function () { stop(); go(idx + 1); });
      playBtn.addEventListener('click', function () { playing ? stop() : play(); });
      slider.addEventListener('input', function () { stop(); go(parseInt(slider.value, 10)); });
      window.addEventListener('resize', drawArrows);
    }

    /* Wiedergabe */
    function play() {
      if (idx >= data.steps.length - 1) go(0);
      playing = true; setPlayBtn();
      timer = setInterval(function () {
        if (idx >= data.steps.length - 1) { stop(); return; }
        go(idx + 1);
      }, 1000);
    }
    function stop() { playing = false; clearInterval(timer); timer = null; setPlayBtn(); }
    function setPlayBtn() {
      if (!playBtn) return;
      playBtn.textContent = '';
      playBtn.appendChild(icon(playing ? 'pause' : 'play'));
      playBtn.appendChild(document.createTextNode(playing ? 'Pause' : 'Abspielen'));
    }

    /* Wert-Darstellung */
    function valNode(enc, refs) {
      if (enc[0] === 'v') {
        var cls = 'kv-val kv-val--' + enc[2];
        var s = el('span', { class: cls });
        s.appendChild(el('span', { class: 'kv-val__v', text: enc[1] }));
        s.appendChild(el('span', { class: 'kv-type', text: enc[2] }));
        return s;
      }
      var dot = el('span', { class: 'kv-ref', 'data-to': String(enc[1]), title: 'Verweis auf Objekt ' + enc[1] }, [el('span', { class: 'k-sr', text: 'Verweis auf Objekt ' + enc[1] })]);
      return dot;
    }
    function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

    /* Darstellung eines Schritts */
    function render() {
      var st = data.steps[idx];
      var prev = idx > 0 ? data.steps[idx - 1] : null;
      var total = data.steps.length;

      // Zeilenmarkierung: vorherige Zeile hell, nächste kräftig
      var prevLine = null, nextLine = null, atEnd = !!st.end, isRet = st.ev === 'return' && !st.end;
      if (st.ev === 'line' || st.ev === 'exception') nextLine = st.l;
      if (prev) prevLine = prev.l;
      if (atEnd || isRet) prevLine = st.l;
      lineEls.forEach(function (li, i) {
        var n = i + 1;
        li.classList.toggle('is-next', n === nextLine);
        li.classList.toggle('is-prev', n === prevLine && n !== nextLine);
        li.classList.toggle('is-err', n === nextLine && st.ev === 'exception');
        if (n === nextLine) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      if (nextLine && lineEls[nextLine - 1]) scrollInto(codeBox, lineEls[nextLine - 1]);

      // Frames
      framesBox.textContent = '';
      st.f.forEach(function (fr, fi) {
        var pf = prev && prev.f[fi] && prev.f[fi][0] === fr[0] ? prev.f[fi] : null;
        var top = fi === st.f.length - 1;
        var fe = el('section', { class: 'kv-frame' + (top ? ' is-top' : '') + (pf ? '' : ' is-new'), 'aria-label': 'Frame ' + fr[0] });
        var title = fr[0] === 'Globale Variablen' ? fr[0] : fr[0] + '()';
        fe.appendChild(el('header', { class: 'kv-frame__h' }, [
          el('strong', { text: title }),
          el('span', { class: 'kv-frame__meta', text: top ? (atEnd ? 'beendet' : 'aktuell') : 'wartet in Zeile ' + fr[1] })
        ]));
        if (!fr[2].length) fe.appendChild(el('p', { class: 'kv-frame__empty', text: 'noch keine Variablen' }));
        fr[2].forEach(function (pair) {
          var old = null;
          if (pf) pf[2].some(function (p) { if (p[0] === pair[0]) { old = p; return true; } return false; });
          var changed = !old || !same(old[1], pair[1]);
          var row = el('div', { class: 'kv-row' + (changed && prev ? ' is-changed' : '') });
          row.appendChild(el('span', { class: 'kv-name', text: pair[0] }));
          var cell = el('span', { class: 'kv-cell' });
          cell.appendChild(valNode(pair[1]));
          row.appendChild(cell);
          fe.appendChild(row);
        });
        if (top && st.ev === 'return' && st.rv) {
          var rr = el('div', { class: 'kv-row kv-row--ret is-changed' });
          rr.appendChild(el('span', { class: 'kv-name', text: 'Rückgabe' }));
          var rc = el('span', { class: 'kv-cell' }); rc.appendChild(valNode(st.rv)); rr.appendChild(rc);
          fe.appendChild(rr);
        }
        framesBox.appendChild(fe);
      });

      // Objekte (gleiche Objekte = gleicher Kasten)
      heapBox.textContent = '';
      var ids = Object.keys(st.h).map(Number).sort(function (a, b) { return a - b; });
      heapCol.hidden = !ids.length;
      memBox.classList.toggle('has-heap', ids.length > 0);
      ids.forEach(function (id) {
        var h = st.h[id]; if (!h) return;
        var ph = prev && prev.h[id];
        var changed = prev && (!ph || !same(ph, h));
        var box = el('section', { class: 'kv-obj' + (changed ? ' is-changed' : ''), 'data-oid': String(id), 'aria-label': h.t + ' ' + id });
        box.appendChild(el('header', { class: 'kv-obj__h' }, [el('span', { class: 'kv-type', text: h.t }), el('span', { class: 'kv-obj__id', text: '#' + id })]));
        if (h.k === 'other') box.appendChild(el('p', { class: 'kv-obj__repr', text: h.r }));
        else if (h.k === 'seq') {
          var list = el('div', { class: 'kv-items' + (h.t === 'list' || h.t === 'tuple' ? ' kv-items--idx' : '') });
          if (!h.v.length) list.appendChild(el('span', { class: 'kv-obj__repr', text: 'leer' }));
          h.v.forEach(function (it, i) {
            var c = el('span', { class: 'kv-item' });
            if (h.t === 'list' || h.t === 'tuple') c.appendChild(el('span', { class: 'kv-item__i', text: String(i) }));
            c.appendChild(valNode(it)); list.appendChild(c);
          });
          if (h.more > 0) list.appendChild(el('span', { class: 'kv-obj__repr', text: '… +' + h.more }));
          box.appendChild(list);
        } else {
          var kv = el('div', { class: 'kv-kv' });
          if (!h.v.length) kv.appendChild(el('span', { class: 'kv-obj__repr', text: 'leer' }));
          h.v.forEach(function (pr) {
            var row = el('div', { class: 'kv-row' });
            if (h.k === 'dict') { var k = el('span', { class: 'kv-name kv-name--key' }); k.appendChild(valNode(pr[0])); row.appendChild(k); var cc = el('span', { class: 'kv-cell' }); cc.appendChild(valNode(pr[1])); row.appendChild(cc); }
            else { row.appendChild(el('span', { class: 'kv-name', text: pr[0] })); var c2 = el('span', { class: 'kv-cell' }); c2.appendChild(valNode(pr[1])); row.appendChild(c2); }
            kv.appendChild(row);
          });
          if (h.more > 0) kv.appendChild(el('span', { class: 'kv-obj__repr', text: '… +' + h.more }));
          box.appendChild(kv);
        }
        heapBox.appendChild(box);
      });

      // Ausgabe
      outPre.textContent = data.out.slice(0, st.o);

      // Fehler / Abbruch am letzten Schritt
      var last = idx === total - 1;
      var msg = '';
      if (st.ev === 'exception' && st.err) msg = 'Fehler in Zeile ' + st.l + ': ' + st.err;
      errBox.hidden = !msg;
      errBox.textContent = '';
      if (msg) { errBox.appendChild(icon('x')); errBox.appendChild(document.createTextNode(' ' + msg)); }
      note.hidden = !(last && data.trunc);
      if (last && data.trunc) note.textContent = 'Die Aufzeichnung endet nach ' + total + ' Schritten, das Programm läuft aber weiter. Läuft da eine Endlosschleife?';

      // Steuerung + Ansage
      slider.value = String(idx);
      slider.setAttribute('aria-valuetext', 'Schritt ' + (idx + 1) + ' von ' + total);
      counter.textContent = 'Schritt ' + (idx + 1) + ' von ' + total;
      firstBtn.disabled = prevBtn.disabled = idx === 0;
      lastBtn.disabled = nextBtn.disabled = idx === total - 1;
      statusEl.textContent = describe(st, last);
      drawArrows();
      prevStep = st;
    }

    function describe(st, last) {
      if (st.end) return 'Das Programm ist zu Ende.';
      if (st.ev === 'exception') return 'In Zeile ' + st.l + ' tritt ein Fehler auf.';
      if (st.ev === 'return') return 'Die Funktion ' + st.f[st.f.length - 1][0] + ' kehrt zurück' + (st.rv && st.rv[0] === 'v' ? ' mit ' + st.rv[1] : '') + '.';
      return 'Als Nächstes wird Zeile ' + st.l + ' ausgeführt.';
    }
    function scrollInto(box, li) {
      var top = li.offsetTop, h = li.offsetHeight;
      if (top < box.scrollTop + 8) box.scrollTop = Math.max(0, top - 8);
      else if (top + h > box.scrollTop + box.clientHeight - 8) box.scrollTop = top + h - box.clientHeight + 8;
    }

    /* Pfeile von Verweisen zu Objektkästen */
    function drawArrows() {
      if (!svg || !memBox) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var base = memBox.getBoundingClientRect();
      svg.setAttribute('width', String(memBox.scrollWidth)); svg.setAttribute('height', String(memBox.scrollHeight));
      var defs = document.createElementNS(NS, 'defs');
      defs.innerHTML = '<marker id="' + uid + '-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>';
      svg.appendChild(defs);
      var boxes = {};
      Array.prototype.forEach.call(memBox.querySelectorAll('.kv-obj'), function (b) { boxes[b.getAttribute('data-oid')] = b; });
      Array.prototype.forEach.call(memBox.querySelectorAll('.kv-ref'), function (d) {
        var tb = boxes[d.getAttribute('data-to')]; if (!tb) return;
        var a = d.getBoundingClientRect(), b = tb.getBoundingClientRect();
        var x1 = a.left + a.width / 2 - base.left + memBox.scrollLeft, y1 = a.top + a.height / 2 - base.top + memBox.scrollTop;
        var x2, y2, c1x, c1y, c2x, c2y;
        if (d.closest('.kv-obj') === tb) return;
        if (b.left > a.right + 10) {
          x2 = b.left - base.left + memBox.scrollLeft - 2; y2 = Math.min(Math.max(y1, b.top - base.top + memBox.scrollTop + 14), b.bottom - base.top + memBox.scrollTop - 10);
          var dx = Math.max(24, (x2 - x1) / 2);
          c1x = x1 + dx; c1y = y1; c2x = x2 - dx; c2y = y2;
        } else {
          x2 = b.left - base.left + memBox.scrollLeft + Math.min(24, b.width / 2); y2 = b.top - base.top + memBox.scrollTop - 2;
          c1x = x1; c1y = y1 + 28; c2x = x2; c2y = y2 - 28;
          if (y2 < y1) { y2 = b.bottom - base.top + memBox.scrollTop + 2; c2y = y2 + 28; }
        }
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x2 + ' ' + y2);
        p.setAttribute('class', 'kv-arrow'); p.setAttribute('marker-end', 'url(#' + uid + '-ah)');
        svg.appendChild(p);
      });
    }

    function go(i) {
      i = Math.max(0, Math.min(data.steps.length - 1, i));
      idx = i; render();
    }

    /* Tastatur, Fokusfalle */
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]), input, [href], [tabindex="0"]')).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) { e.preventDefault(); panel.focus(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (!data) return;
      var t = e.target;
      if (t && t.tagName === 'INPUT' && t.type === 'range') return;     // Schieberegler bedient sich selbst
      if (t && (t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stop(); go(idx + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stop(); go(idx - 1); }
      else if (e.key === 'Home') { e.preventDefault(); stop(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); stop(); go(data.steps.length - 1); }
      else if (e.key === ' ' && !(t && t.tagName === 'BUTTON')) { e.preventDefault(); playing ? stop() : play(); }
    }
    document.addEventListener('keydown', onKey, true);
    back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
    closeBtn.addEventListener('click', close);

    function close() {
      stop();
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', drawArrows);
      if (back.parentNode) back.parentNode.removeChild(back);
      document.documentElement.classList.remove('kv-open');
      if (current === view) current = null;
      if (opener && opener.focus && document.contains(opener)) { try { opener.focus(); } catch (x) { /* egal */ } }
      done();
    }
    var view = { close: close };

    record(code, o).then(function (d) {
      if (!back.parentNode) return;
      data = d;
      if (!data.steps.length) {
        body.textContent = '';
        var msg = data.err ? (data.errline ? 'Zeile ' + data.errline + ': ' : '') + data.err : 'Der Code enthält nichts, was Schritt für Schritt ausgeführt werden kann.';
        var p = el('p', { class: 'kv__err', role: 'alert' }); p.appendChild(icon('x')); p.appendChild(document.createTextNode(' ' + msg));
        body.appendChild(p);
        return;
      }
      buildView();
      setPlayBtn();
      go(0);
      nextBtn.focus();
    }).catch(function (err) {
      if (!back.parentNode) return;
      body.textContent = '';
      var p = el('p', { class: 'kv__err', role: 'alert' }); p.appendChild(icon('x')); p.appendChild(document.createTextNode(' ' + (err && err.message ? err.message : String(err))));
      body.appendChild(p);
    });
    return view;
  }

  window.KursViz = { _real: true, open: open, maxSteps: MAX_STEPS };
})();
