/* =============================================================
   viz.js – Schritt-für-Schritt-Visualisierer (DESIGN.md Regel 14)
   Wird von kurs.js beim ersten Öffnen nachgeladen.
   API:  window.KursViz.open(code, { stdin: 'a\nb', opener: element, timeout: ms })  -> Promise
   Ablauf: Der Code läuft im Pyodide-Worker (KursPy) unter sys.settrace und wird Schritt für Schritt
   aufgezeichnet (max. 1000 Schritte, 5 s). Die Wiedergabe ist reines JavaScript und braucht Python nicht mehr.
   Pro Schritt: aktuelle Zeile, Aufrufstapel, Variablen je Frame (mit Parametern), Objekte mit Identität
   (gleiches Objekt = gleicher Kasten, Pfeile von den Namen), bisherige Ausgabe, außerdem für die nächste
   Zeile die eingesetzten Werte und bei if/elif/while das Ergebnis der Bedingung.
   Ansicht (Vollbild): links Code mit Markierungen, Haltepunkten und Ausführungszähler, darunter die
   Erklärung in Klartext („Was ist passiert?“ / „Als Nächstes“) und die Ausgabe; rechts der Speicher
   (Namen je Frame | Objekte) und die Ablauftabelle, die sich Schritt für Schritt füllt.
   ============================================================= */
(function () {
  'use strict';
  if (window.KursViz && window.KursViz._real) return;

  var MAX_STEPS = 1000;
  var NS = 'http://www.w3.org/2000/svg';
  var PREF_KEY = 'inf-mb/viz/objektmodus';
  var MODE_KEY = 'inf-mb/viz/modus';
  /* Ansichten: Einfach (Standard) – Speicher – Experte. Was wo zu sehen ist, steuert viz.css über data-mode. */
  var MODES = [
    { id: 'einfach', label: 'Einfach', text: 'Nur das Wichtigste: welche Zeile läuft und was sie bewirkt.' },
    { id: 'speicher', label: 'Speicher', text: 'Was im Speicher passiert: Namen, Objekte und Pfeile. Kopie oder dasselbe Objekt?' },
    { id: 'experte', label: 'Experte', text: 'Alles wie im Debugger: Haltepunkte, Schritt über, Ablauftabelle, Details zu jedem Schritt.' }
  ];

  /* ── Python-Seite: zeichnet den Ablauf auf (läuft im Worker, Code kommt als _kc_src) ── */
  var TRACE_PY = String.raw`
import sys, builtins, json, time, types, tokenize, io, keyword
_MAXS = int(_kc_max)
if _kc_inputs:
    # Eingaben aus dem Terminal-Dialog (Liste, auch leere Eingaben bleiben erhalten)
    _lines = [str(x) for x in json.loads(_kc_inputs)]
else:
    _lines = _kc_stdin.split("\n") if _kc_stdin else []
    if _lines and _lines[-1] == "":
        _lines.pop()
_pos = 0
_out = []
_olen = [0]
_srcl = _kc_src.split("\n")
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
        if _kc_inputs:
            raise EOFError("input() braucht eine weitere Eingabe, aber im letzten Lauf wurden nicht mehr getippt. Führe das Programm mit „Ausführen“ aus und tippe alle Eingaben.")
        raise EOFError("input() braucht eine Eingabe, aber im Feld „Eingaben“ steht keine Zeile mehr. Trage dort für jedes input() eine Zeile ein.")
    v = _lines[_pos]
    _pos += 1
    sys.stdout.write(v + "\n")
    return v
_ids = {}
_keep = []
_SC = (bool, int, float, complex, str, type(None))
_SCAL = (bool, int, float, str, type(None))
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
        return ["v", _short(repr(v), 60), t.__name__, _idof(v)]
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
            elif hasattr(v, "__dict__") and getattr(t, "__module__", "") == "__main__":
                items = list(vars(v).items())[:24]
                heap[n] = {"t": t.__name__, "k": "obj", "v": [[a, _enc(b, heap)] for a, b in items], "more": 0}
            else:
                heap[n] = {"t": t.__name__, "k": "other", "r": _safe_repr(v, 80)}
        except Exception:
            heap[n] = {"t": t.__name__, "k": "other", "r": _safe_repr(v, 80)}
    return ["r", n]

# ── Zeile verstehen: Werte einsetzen, Bedingungen auswerten ──
_SAFE = {"len", "abs", "min", "max", "round", "int", "float", "str", "bool", "isinstance", "sum", "type", "sorted", "range"}
_AUG = {"+=", "-=", "*=", "/=", "//=", "%=", "**=", "@=", "&=", "|=", "^=", ">>=", "<<="}
_NOSUB = {"def", "class", "import", "from", "global", "nonlocal", "else", "try", "finally", "with", "pass", "break", "continue", "except"}
_OPEN = ("(", "[", "{")
_CLOSE = (")", "]", "}")
_tokc = {}
def _toks(ln):
    if ln in _tokc:
        return _tokc[ln]
    r = None
    if 0 < ln <= len(_srcl):
        s = _srcl[ln - 1].strip()
        try:
            tk = []
            for t in tokenize.generate_tokens(io.StringIO(s).readline):
                if t.type == tokenize.COMMENT:
                    s = s[:t.start[1]].rstrip()
                    break
                if t.type in (tokenize.NEWLINE, tokenize.NL, tokenize.ENDMARKER, tokenize.INDENT, tokenize.DEDENT):
                    continue
                if t.start[0] != 1:
                    break
                tk.append(t)
            if tk:
                r = (s, tk)
        except Exception:
            r = None
    _tokc[ln] = r
    return r
def _get(frame, n):
    loc = frame.f_locals
    if n in loc:
        return True, loc[n]
    g = frame.f_globals
    if n in g:
        return True, g[n]
    return False, None
def _subst(frame, s, tk, i0, i1):
    if i0 >= i1:
        return None
    a = tk[i0].start[1]
    b = tk[i1 - 1].end[1]
    reps = []
    for i in range(i0, i1):
        t = tk[i]
        if t.type != tokenize.NAME or keyword.iskeyword(t.string):
            continue
        if i > 0 and tk[i - 1].string == ".":
            continue
        nx = tk[i + 1].string if i + 1 < len(tk) else ""
        if nx == "(" or nx == "=":
            continue
        ok, v = _get(frame, t.string)
        if not ok or type(v) not in _SCAL:
            continue
        r = repr(v)
        if len(r) > 30:
            continue
        reps.append((t.start[1] - a, t.end[1] - a, r))
    if not reps:
        return None
    out = s[a:b]
    for x, y, r in reversed(reps):
        out = out[:x] + r + out[y:]
    return out
def _lineinfo(frame, st):
    r = _toks(frame.f_lineno)
    if r is None:
        return
    s, tk = r
    first = tk[0].string
    if first in _NOSUB:
        return
    if first in ("if", "elif", "while"):
        depth = 0
        col = None
        for i, t in enumerate(tk):
            if t.type == tokenize.OP:
                if t.string in _OPEN:
                    depth += 1
                elif t.string in _CLOSE:
                    depth -= 1
                elif t.string == ":" and depth == 0 and i > 0:
                    col = i
                    break
        if col is None or col < 2:
            return
        expr = s[tk[0].end[1]:tk[col].start[1]].strip()
        ok = True
        for i in range(1, col):
            t = tk[i]
            if t.string in (":=", "lambda", "await", "yield"):
                ok = False
                break
            if t.type == tokenize.NAME and i + 1 < col and tk[i + 1].string == "(":
                if tk[i - 1].string == "." or t.string not in _SAFE or t.string in frame.f_locals or t.string in frame.f_globals:
                    ok = False
                    break
        if ok:
            try:
                v = eval(expr, frame.f_globals, frame.f_locals)
                st["c"] = [expr, _subst(frame, s, tk, 1, col), _safe_repr(v, 40), bool(v)]
            except Exception:
                pass
        return
    start = 0
    depth = 0
    for i, t in enumerate(tk):
        if t.type == tokenize.OP:
            if t.string in _OPEN:
                depth += 1
            elif t.string in _CLOSE:
                depth -= 1
            elif depth == 0 and (t.string == "=" or t.string in _AUG):
                start = i + 1
        elif first == "for" and start == 0 and depth == 0 and t.string == "in":
            start = i + 1
    if first == "for" and start == 0:
        return
    if start == 2 and tk[0].type == tokenize.NAME and tk[1].string in _AUG:
        ok, v = _get(frame, tk[0].string)
        if ok and type(v) in _SCAL and len(repr(v)) <= 30:
            rhs = _subst(frame, s, tk, start, len(tk)) or s[tk[start].start[1]:tk[-1].end[1]]
            if len(tk) - start > 1:
                rhs = "(" + rhs + ")"
            st["s"] = tk[0].string + " = " + repr(v) + " " + tk[1].string[:-1] + " " + rhs
        return
    sub = _subst(frame, s, tk, start, len(tk))
    if sub is None:
        return
    full = s[:tk[start].start[1]] + sub + s[tk[-1].end[1]:] if start > 0 else sub + s[tk[-1].end[1]:]
    if full != s:
        st["s"] = full

_steps = []
_deadline = [0.0]
_exc = [None]
_pend = [False]
def _isclassbody(c):
    return c.co_name != "<module>" and not (c.co_flags & 1)
def _frames(frame):
    chain = []
    f = frame
    while f is not None:
        if f.f_code.co_filename == "<viz>" and not _isclassbody(f.f_code):
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
        if isg:
            params = []
        else:
            c = f.f_code
            params = list(c.co_varnames[:c.co_argcount + c.co_kwonlyargcount])
        fl.append(["Globale Variablen" if isg else f.f_code.co_name, f.f_lineno, vs, params])
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
        if event == "line":
            try:
                _lineinfo(frame, st)
            except Exception:
                pass
        if event == "return":
            st["rv"] = _enc(arg, st["h"])
            if frame.f_code.co_name == "<module>":
                st["end"] = True
                del st["rv"]
        if event == "exception":
            st["err"] = type(arg[1]).__name__ + ": " + str(arg[1])
        _steps.append(st)
    return _local
def _global(frame, event, arg):
    if frame.f_code.co_filename != "<viz>" or _isclassbody(frame.f_code):
        return None
    return _local
_res = {"err": None, "errline": None, "trunc": False}
_orig_input = builtins.input
_orig_out = sys.stdout
try:
    co = compile(_kc_src, "<viz>", "exec")
except SyntaxError as e:
    co = None
    _res["err"] = type(e).__name__ + ": " + str(e.msg)
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
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(id) { return window.KIcon ? window.KIcon(id) : document.createElement('span'); }
  function btn(label, iconId, cls, showText, tip) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || '') });
    if (iconId) b.appendChild(icon(iconId));
    if (showText) b.appendChild(document.createTextNode(label));
    else b.setAttribute('aria-label', label);
    b.setAttribute('data-tip', tip || label);
    return b;
  }
  function cut(s, n) { s = String(s); return s.length <= n ? s : s.slice(0, n - 1) + '…'; }

  /* Text mit Code-Stellen: C(x) markiert x als Code, rich() baut daraus Knoten */
  var MARK = '\u0001';
  function C(s) { return MARK + String(s) + MARK; }
  function rich(parent, text) {
    String(text).split(MARK).forEach(function (part, i) {
      if (part === '') return;
      if (i % 2) parent.appendChild(el('code', { class: 'kv-c', text: part }));
      else parent.appendChild(document.createTextNode(part));
    });
    return parent;
  }
  function plain(text) { return String(text).split(MARK).join(''); }
  function list(names) {
    var c = names.map(C);
    if (c.length < 2) return c.join('');
    return c.slice(0, -1).join(', ') + ' und ' + c[c.length - 1];
  }

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

  /* ── Wörter für Typen und Fehler ─────────────────────────── */
  var TYP = { list: 'Liste', tuple: 'Tupel', dict: 'Dictionary', set: 'Menge', frozenset: 'Menge', str: 'Text', int: 'Ganzzahl', float: 'Kommazahl', bool: 'Wahrheitswert', NoneType: 'None', complex: 'komplexe Zahl' };
  var NEU = { list: 'eine neue Liste', tuple: 'ein neues Tupel', dict: 'ein neues Dictionary', set: 'eine neue Menge', frozenset: 'eine neue Menge' };
  var MUT = { list: 1, dict: 1, set: 1 };
  var IMMUT = { tuple: 1, frozenset: 1, str: 1, int: 1, float: 1, bool: 1, NoneType: 1, complex: 1 };
  function typDe(t) { return TYP[t] || ('Objekt vom Typ ' + t); }
  function neuDe(h) { return NEU[h.t] || (h.k === 'obj' ? 'ein neues Objekt der Klasse ' + h.t : 'ein neues Objekt vom Typ ' + h.t); }
  function mutDe(t, k) { return MUT[t] || k === 'obj' ? 'veränderbar' : (IMMUT[t] ? 'unveränderbar' : ''); }
  var HINTS = {
    NameError: 'Python kennt diesen Namen an dieser Stelle nicht. Tippfehler oder Groß-/Kleinschreibung? Bekommt die Variable vorher schon einen Wert?',
    UnboundLocalError: 'Die Funktion benutzt eine lokale Variable, bevor sie ihr einen Wert gegeben hat.',
    TypeError: 'Der Datentyp passt nicht zur Operation, zum Beispiel Text + Zahl, oder beim Aufruf stimmt die Zahl der Argumente nicht.',
    ValueError: 'Der Datentyp stimmt, aber der Wert passt nicht, zum Beispiel int("abc").',
    ZeroDivisionError: 'Division durch null ist nicht definiert. Prüfe den Nenner, bevor du teilst.',
    IndexError: 'Diesen Index gibt es nicht. Gültig sind 0 bis len(...) - 1.',
    KeyError: 'Diesen Schlüssel gibt es im Dictionary nicht. Prüfe vorher mit in oder nutze get().',
    AttributeError: 'Dieses Objekt hat das Attribut oder die Methode nicht. Hat der Wert den Datentyp, den du erwartest?',
    RecursionError: 'Die Funktion ruft sich ohne Ende selbst auf. Fehlt der Abbruchfall?',
    AssertionError: 'Eine assert-Prüfung ist fehlgeschlagen: Die Bedingung war False.',
    EOFError: 'input() wollte eine Eingabe lesen, aber es gibt keine mehr.',
    FileNotFoundError: 'Diese Datei gibt es im Arbeitsverzeichnis nicht. Stimmt der Name?',
    ModuleNotFoundError: 'Dieses Modul gibt es nicht. Ist der Name richtig geschrieben?',
    IndentationError: 'Die Einrückung passt nicht: Gleich tief eingerückte Zeilen gehören zum selben Block.',
    SyntaxError: 'Python versteht diese Zeile nicht. Fehlt eine Klammer, ein Doppelpunkt oder ein Anführungszeichen?'
  };
  function hintFor(err) { var m = /^(\w+)/.exec(err || ''); return m && HINTS[m[1]] ? HINTS[m[1]] : ''; }
  function frameTitle(n) {
    if (n === 'Globale Variablen') return 'Hauptprogramm';
    if (n === '<listcomp>' || n === '<dictcomp>' || n === '<setcomp>') return 'Abstraktion (Comprehension)';
    if (n === '<genexpr>') return 'Generator-Ausdruck';
    if (n === '<lambda>') return 'lambda';
    return n + '()';
  }

  /* ── Werte ───────────────────────────────────────────────── */
  function isScalar(enc) { return enc && enc[0] === 'v' && enc.length === 4; }
  function isCodeVal(enc) { return enc && enc[0] === 'v' && enc.length === 3; }   // Funktion, Modul, Klasse …
  function sig(enc, withId) {
    if (!enc) return '';
    if (enc[0] === 'v') return 'v|' + enc[1] + '|' + enc[2] + (withId && enc.length === 4 ? '|' + enc[3] : '');
    return 'r|' + enc[1];
  }
  function heapSig(h) { return JSON.stringify(h, function (k, v) { return Array.isArray(v) && v[0] === 'v' && v.length === 4 ? v.slice(0, 3) : v; }); }
  function shortRepr(enc, heap, d) {
    d = d || 0;
    if (!enc) return '';
    if (enc[0] === 'v') return enc[1];
    var h = heap && heap[enc[1]];
    if (!h) return '…';
    if (d > 2) return h.k === 'seq' ? (h.t === 'tuple' ? '(…)' : '[…]') : '{…}';
    var s;
    if (h.k === 'seq') {
      var inner = h.v.map(function (x) { return shortRepr(x, heap, d + 1); }).join(', ') + (h.more > 0 ? ', …' : '');
      if (h.t === 'tuple') s = '(' + inner + (h.v.length === 1 ? ',' : '') + ')';
      else if (h.t === 'list') s = '[' + inner + ']';
      else s = h.v.length ? '{' + inner + '}' : 'set()';
    } else if (h.k === 'dict') {
      s = '{' + h.v.map(function (p) { return shortRepr(p[0], heap, d + 1) + ': ' + shortRepr(p[1], heap, d + 1); }).join(', ') + (h.more > 0 ? ', …' : '') + '}';
    } else if (h.k === 'obj') {
      s = h.t + '(' + h.v.map(function (p) { return p[0] + '=' + shortRepr(p[1], heap, d + 1); }).join(', ') + ')';
    } else s = h.r;
    return cut(s, 56);
  }
  function findVar(fr, name) {
    for (var i = 0; i < fr[2].length; i++) if (fr[2][i][0] === name) return fr[2][i][1];
    return null;
  }
  /* Welche Namen zeigen direkt auf welches Objekt? Schlüssel: Objekt-ID (Zahl) bzw. 'p' + ID im Objektmodus */
  function namesTo(st) {
    var m = {}, multi = st.f.length > 1;
    st.f.forEach(function (fr, fi) {
      fr[2].forEach(function (p) {
        var e = p[1], key = e[0] === 'r' ? String(e[1]) : (isScalar(e) ? 'p' + e[3] : null);
        if (!key) return;
        (m[key] = m[key] || []).push(multi && fi > 0 ? p[0] + ' (in ' + fr[0] + ')' : p[0]);
      });
    });
    return m;
  }

  /* ── Aufzeichnen ─────────────────────────────────────────── */
  function record(code, o) {
    if (!window.KursPy) return Promise.reject(new Error('Python-Runner (kurs.js) nicht geladen'));
    return window.KursPy.run(code, {
      timeout: o.timeout ? Math.max(o.timeout, 12000) : 15000,
      harness: TRACE_PY,
      vars: { _kc_stdin: o.stdin || '', _kc_inputs: o.inputs ? JSON.stringify(o.inputs) : '', _kc_max: MAX_STEPS },
      onOut: function () {}, onErr: function () {}
    }).then(function (r) {
      if (r.timedOut) throw new Error('Das Programm braucht zu lange (Endlosschleife?). Die Aufzeichnung wurde abgebrochen.');
      if (r.error) throw new Error(r.error);
      return JSON.parse(r.result);
    });
  }

  function loadPref(key) {
    try {
      if (window.KursSpeicher && window.KursSpeicher.sofort) return window.KursSpeicher.sofort.lesen(key);
      var v = window.localStorage.getItem(key);
      return v == null ? undefined : JSON.parse(v);
    } catch (e) { return undefined; }
  }
  function savePref(key, v) {
    try {
      if (window.KursSpeicher && window.KursSpeicher.sofort) window.KursSpeicher.sofort.schreiben(key, v);
      else window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { /* egal */ }
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
    var data = null, idx = 0, playing = false, timer = null, N = 0;
    var primPref = !!loadPref(PREF_KEY);
    var mode = o.modus || loadPref(MODE_KEY);
    if (!MODES.some(function (m) { return m.id === mode; })) mode = 'einfach';
    var primMode = mode !== 'einfach' && primPref;
    var modeBtns = [], modeText;
    var bps = {};               // Haltepunkte: Zeilennummer -> true
    var arrivedBy = '';         // 'bp' wenn per „Bis Haltepunkt“ angekommen
    var uid = 'kv' + Math.random().toString(36).slice(2, 7);

    var back = el('div', { class: 'kv' });
    var panel = el('div', { class: 'kv__panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': uid + '-t', tabindex: '-1' });
    var closeBtn = el('button', { type: 'button', class: 'kv__close k-btn k-btn--small k-btn--link' });
    closeBtn.appendChild(icon('x')); closeBtn.appendChild(document.createTextNode('Schließen'));
    var head = el('div', { class: 'kv__head' }, [
      el('h2', { class: 'kv__title', id: uid + '-t', text: 'Schritt für Schritt' }),
      buildModes(),
      closeBtn
    ]);
    var body = el('div', { class: 'kv__body' });
    panel.setAttribute('data-mode', mode);
    function buildModes() {
      var wrap = el('div', { class: 'kv__modes' });
      var grp = el('div', { class: 'kv__seg', role: 'group', 'aria-label': 'Ansicht' });
      MODES.forEach(function (m) {
        var b = el('button', { type: 'button', class: 'kv__segbtn', 'aria-pressed': m.id === mode ? 'true' : 'false', 'data-tip': m.text, text: m.label });
        b.addEventListener('click', function () { setMode(m.id); });
        modeBtns.push({ id: m.id, b: b }); grp.appendChild(b);
      });
      modeText = el('p', { class: 'kv__sub' });
      wrap.appendChild(grp); wrap.appendChild(modeText);
      setModeText();
      return wrap;
    }
    function setModeText() { MODES.forEach(function (m) { if (m.id === mode) modeText.textContent = m.text; }); }
    function setMode(id) {
      mode = id; savePref(MODE_KEY, id);
      panel.setAttribute('data-mode', id);
      modeBtns.forEach(function (x) { x.b.setAttribute('aria-pressed', x.id === id ? 'true' : 'false'); });
      setModeText();
      primMode = mode !== 'einfach' && primPref;
      bpEls.forEach(function (b) { b.tabIndex = mode === 'experte' ? 0 : -1; });
      if (data && N) render();
    }
    panel.appendChild(head); panel.appendChild(body);
    back.appendChild(panel);

    function src(n) { return (srcLines[n - 1] || '').trim(); }

    // Ladezustand
    var loadMsg = el('p', { class: 'kv__load', role: 'status' }, [el('span', { class: 'k-spinner', 'aria-hidden': 'true' }), document.createTextNode(window.KursPy && !window.KursPy.worker ? 'Python wird geladen (einmalig, ca. 10 MB), danach wird das Programm aufgezeichnet …' : 'Programm wird aufgezeichnet …')]);
    body.appendChild(loadMsg);

    document.body.appendChild(back);
    document.documentElement.classList.add('kv-open');
    panel.focus();

    /* Bausteine der Ansicht (nach der Aufzeichnung) */
    var codeBox, lineEls = [], cntEls = [], bpEls = [], memBox, framesBox, heapBox, heapCol, svg, outPre, errBox, note, hintEl, live,
      exNow, exNext, slider, counter, playBtn, firstBtn, prevBtn, nextBtn, lastBtn, overBtn, outBtn, bpBtn, tempoSel, primBox,
      tableBody, tableRows = [], tableWrap, hasCalls = false, hl = null;

    function hasCallsInit() { return data.steps.some(function (s) { return s.f.length > 1; }); }

    function buildView() {
      body.textContent = '';
      hasCalls = hasCallsInit();

      /* Steuerung */
      firstBtn = btn('Zum Anfang', 'skip-start', 'k-btn--ghost', false, 'Zum Anfang (Pos1)');
      prevBtn = btn('Zurück', 'chevron-left', 'k-btn--ghost', true, 'Einen Schritt zurück (Pfeil links)');
      nextBtn = btn('Weiter', 'chevron-right', '', true, 'Nächste Zeile ausführen (Pfeil rechts). Springt auch in aufgerufene Funktionen hinein.');
      nextBtn.appendChild(nextBtn.firstChild);   // Icon nach dem Text
      lastBtn = btn('Zum Ende', 'skip-end', 'k-btn--ghost', false, 'Zum Ende (Ende)');
      overBtn = btn('Schritt über', 'indent-less', 'k-btn--ghost', true, 'Die Zeile ganz ausführen, ohne in aufgerufene Funktionen hineinzuspringen');
      outBtn = btn('Heraus', 'chevron-up', 'k-btn--ghost', true, 'Die aktuelle Funktion zu Ende laufen lassen und zum Aufrufer zurückkehren');
      bpBtn = btn('Bis Haltepunkt', 'skip-end', 'k-btn--ghost', true, 'Weiterlaufen bis zur nächsten Zeile mit Haltepunkt. Haltepunkt setzen: links im Code auf die Zeilennummer klicken.');
      playBtn = btn('Abspielen', 'play', 'k-btn--ghost', true, 'Automatisch abspielen (Leertaste)');
      tempoSel = el('select', { class: 'kv__tempo', 'aria-label': 'Tempo beim Abspielen' });
      [['2000', 'langsam'], ['1000', 'mittel'], ['450', 'schnell']].forEach(function (t) {
        var op = el('option', { value: t[0], text: t[1] }); if (t[0] === '1000') op.selected = true; tempoSel.appendChild(op);
      });
      slider = el('input', { type: 'range', class: 'kv__slider', min: '0', max: String(N - 1), value: '0', step: '1', 'aria-label': 'Schritt wählen' });
      counter = el('span', { class: 'kv__counter' });
      hintEl = el('p', { class: 'kv__hint', 'aria-live': 'polite' });
      var groupStep = el('div', { class: 'kv__btns', role: 'group', 'aria-label': 'Schritte' }, [firstBtn, prevBtn, nextBtn, lastBtn]);
      var groupDbg = el('div', { class: 'kv__btns kv-x', role: 'group', 'aria-label': 'Wie ein Debugger' }, hasCalls ? [overBtn, outBtn, bpBtn] : [bpBtn]);
      var groupPlay = el('div', { class: 'kv__btns', role: 'group', 'aria-label': 'Abspielen' }, [playBtn, el('label', { class: 'kv__tempolabel kv-x' }, ['Tempo ', tempoSel])]);
      var ctr = el('div', { class: 'kv__ctrl' }, [
        groupStep, groupDbg, groupPlay,
        el('div', { class: 'kv__scrub' }, [slider, counter])
      ]);

      /* Code */
      codeBox = el('ol', { class: 'kv__code', 'aria-label': 'Programmcode' });
      srcLines.forEach(function (l, i) {
        var n = i + 1;
        var li = el('li', { class: 'kv-line' });
        var bp = el('button', { type: 'button', class: 'kv-ln', tabindex: mode === 'experte' ? '0' : '-1', 'aria-pressed': 'false', 'aria-label': 'Haltepunkt in Zeile ' + n, 'data-tip': 'Haltepunkt setzen oder entfernen', text: String(n) });
        bp.addEventListener('click', function () { toggleBp(n); });
        var mark = el('span', { class: 'kv-mark', 'aria-hidden': 'true' });
        var t = el('span', { class: 'kv-line__t' });
        if (l === '') t.appendChild(document.createTextNode('​')); else highlight(l, t);
        var cnt = el('span', { class: 'kv-cnt' });
        li.appendChild(bp); li.appendChild(mark); li.appendChild(t); li.appendChild(cnt);
        codeBox.appendChild(li); lineEls.push(li); cntEls.push(cnt); bpEls.push(bp);
      });
      var legend = el('p', { class: 'kv-legend' }, [
        el('span', { class: 'kv-legend__i kv-legend__i--next' }, ['als Nächstes']),
        el('span', { class: 'kv-legend__i kv-legend__i--prev' }, ['gerade ausgeführt']),
        hasCallsInit() ? el('span', { class: 'kv-legend__i kv-legend__i--wait' }, ['Aufruf wartet auf Rückgabe']) : null,
        el('span', { class: 'kv-legend__i kv-legend__i--cnt kv-x' }, ['3× = so oft schon gelaufen']),
        el('span', { class: 'kv-legend__i kv-legend__i--bp kv-x' }, ['Haltepunkt: Zeilennummer anklicken'])
      ]);
      var codeWrap = el('div', { class: 'kv__pane kv__pane--code' }, [el('h3', { class: 'kv__h kv__h--dark', text: 'Code' }), codeBox, legend]);

      /* Erklärung */
      exNow = el('div', { class: 'kv-ex__part' });
      exNext = el('div', { class: 'kv-ex__part kv-ex__part--next kv-x' });
      var exBox = el('section', { class: 'kv-ex', 'aria-label': 'Erklärung zum Schritt' }, [exNow, exNext]);
      errBox = el('div', { class: 'kv__err', hidden: '', role: 'alert' });
      note = el('p', { class: 'kv__note', hidden: '' });

      /* Ausgabe */
      outPre = el('pre', { class: 'kv__out', 'aria-label': 'Ausgabe bis zu diesem Schritt' });
      var outWrap = el('div', { class: 'kv__outwrap' }, [el('h3', { class: 'kv__h', text: 'Ausgabe (Terminal)' }), outPre]);

      /* Speicher */
      framesBox = el('div', { class: 'kv__frames' });
      heapBox = el('div', { class: 'kv__heap' });
      heapCol = el('div', { class: 'kv__col kv__col--heap' }, [
        el('h4', { class: 'kv__colh' }, ['Objekte ', el('span', { class: 'kv__colsub', text: 'die Werte selbst' })]), heapBox]);
      var frameCol = el('div', { class: 'kv__col' }, [
        el('h4', { class: 'kv__colh' }, ['Namen ', el('span', { class: 'kv__colsub', text: hasCalls ? 'je Frame, oben der aktuelle Aufruf' : 'die Variablen' })]), framesBox]);
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'kv__arrows'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      memBox = el('div', { class: 'kv__mem' }, [frameCol, heapCol, svg]);
      primBox = el('input', { type: 'checkbox', id: uid + '-prim' });
      primBox.checked = primPref;
      primBox.addEventListener('change', function () { primPref = primBox.checked; savePref(PREF_KEY, primPref); primMode = mode !== 'einfach' && primPref; render(); });
      var memHead = el('div', { class: 'kv__memhead' }, [
        el('h3', { class: 'kv__h', text: 'Speicher' }),
        el('label', { class: 'kv__prim kv-ns', 'for': uid + '-prim' }, [primBox, ' Auch Zahlen und Texte als Objekte zeigen'])
      ]);
      var memHelp = el('p', { class: 'kv__help kv-s' });
      rich(memHelp, 'Jeder Name zeigt mit einem Pfeil auf seinen Wert im Speicher. Zeigen zwei Namen auf denselben Kasten, ist es dasselbe Objekt, keine Kopie.');
      var memWrap = el('section', { class: 'kv__pane kv__pane--mem', 'aria-label': 'Speicher' }, [memHead, memHelp, memBox]);

      /* Ablauftabelle */
      tableWrap = el('details', { class: 'kv-tab kv-x', open: '' });
      tableWrap.appendChild(el('summary', { class: 'kv__h kv-tab__sum', text: 'Ablauftabelle' }));
      tableWrap.appendChild(el('p', { class: 'kv__help', text: 'So würdest du den Ablauf auf Papier verfolgen: eine Zeile je Schritt, eingetragen wird nur, was sich ändert. Klick auf eine Zeile springt zu diesem Schritt.' }));
      buildTable();

      var left = el('div', { class: 'kv__left' }, [codeWrap, outWrap]);
      var right = el('div', { class: 'kv__right' }, [exBox, errBox, note, memWrap, tableWrap]);
      var main = el('div', { class: 'kv__main' }, [left, right]);
      live = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
      var keys = el('p', { class: 'kv__keys kv-x', text: 'Tastatur: Pfeil rechts/links = Schritt vor/zurück, Pos1/Ende = Anfang/Ende, Leertaste = Abspielen, Esc = Schließen.' });
      body.appendChild(ctr); body.appendChild(hintEl); body.appendChild(main); body.appendChild(keys); body.appendChild(live);

      firstBtn.addEventListener('click', function () { stop(); go(0); });
      lastBtn.addEventListener('click', function () { stop(); go(N - 1); });
      prevBtn.addEventListener('click', function () { stop(); go(idx - 1); });
      nextBtn.addEventListener('click', function () { stop(); go(idx + 1); });
      overBtn.addEventListener('click', function () { stop(); stepOver(); });
      outBtn.addEventListener('click', function () { stop(); stepOut(); });
      bpBtn.addEventListener('click', function () { stop(); runToBp(); });
      playBtn.addEventListener('click', function () { playing ? stop() : play(); });
      tempoSel.addEventListener('change', function () { if (playing) { stop(); play(); } });
      slider.addEventListener('input', function () { stop(); go(parseInt(slider.value, 10)); });
      memBox.addEventListener('mouseover', function (e) {
        var t = e.target.closest ? e.target.closest('[data-to],[data-oid]') : null;
        setHl(t ? (t.getAttribute('data-oid') || t.getAttribute('data-to')) : null);
      });
      memBox.addEventListener('mouseleave', function () { setHl(null); });
      window.addEventListener('resize', drawArrows);
    }

    /* Haltepunkte und Debugger-Sprünge */
    function toggleBp(n) {
      bps[n] = !bps[n];
      bpEls[n - 1].setAttribute('aria-pressed', bps[n] ? 'true' : 'false');
      lineEls[n - 1].classList.toggle('has-bp', !!bps[n]);
      hintEl.textContent = bps[n] ? 'Haltepunkt in Zeile ' + n + ' gesetzt. „Bis Haltepunkt“ läuft bis dorthin.' : 'Haltepunkt in Zeile ' + n + ' entfernt.';
    }
    function stepOver() {
      var d = data.steps[idx].f.length;
      for (var j = idx + 1; j < N; j++) { var s = data.steps[j]; if (s.f.length <= d || s.ev === 'exception') { go(j); return; } }
      go(N - 1);
    }
    function stepOut() {
      var d = data.steps[idx].f.length;
      if (d <= 1) { go(N - 1); return; }
      for (var j = idx + 1; j < N; j++) { if (data.steps[j].f.length < d || data.steps[j].ev === 'exception') { go(j); return; } }
      go(N - 1);
    }
    function runToBp() {
      if (!Object.keys(bps).some(function (k) { return bps[k]; })) {
        hintEl.textContent = 'Noch kein Haltepunkt gesetzt: Klicke links im Code auf eine Zeilennummer.';
        return;
      }
      for (var j = idx + 1; j < N; j++) {
        var s = data.steps[j];
        if (s.ev === 'line' && bps[s.l]) { arrivedBy = 'bp'; go(j); return; }
        if (s.ev === 'exception') { go(j); return; }
      }
      hintEl.textContent = 'Kein Haltepunkt mehr erreicht: Das Programm ist bis zum Ende gelaufen.';
      go(N - 1, true);
    }

    /* Wiedergabe */
    function play() {
      if (idx >= N - 1) go(0);
      playing = true; setPlayBtn();
      timer = setInterval(function () {
        if (idx >= N - 1) { stop(); return; }
        go(idx + 1);
      }, parseInt(tempoSel.value, 10) || 1000);
    }
    function stop() { playing = false; clearInterval(timer); timer = null; setPlayBtn(); }
    function setPlayBtn() {
      if (!playBtn) return;
      playBtn.textContent = '';
      playBtn.appendChild(icon(playing ? 'pause' : 'play'));
      playBtn.appendChild(document.createTextNode(playing ? 'Pause' : 'Abspielen'));
    }

    /* Wert-Darstellung: inFrame = Wert steht direkt an einem Namen (im Objektmodus dann Pfeil statt Kasten) */
    function valNode(enc, inFrame) {
      if (enc[0] === 'v' && !(inFrame && primMode && isScalar(enc))) {
        var s = el('span', { class: 'kv-val kv-val--' + enc[2] });
        s.appendChild(el('span', { class: 'kv-val__v', text: enc[1] }));
        s.appendChild(el('span', { class: 'kv-type', text: enc[2] }));
        return s;
      }
      var key = enc[0] === 'r' ? String(enc[1]) : 'p' + enc[3];
      return el('span', { class: 'kv-ref', 'data-to': key, title: 'zeigt auf Objekt ' + key.replace('p', '') }, [el('span', { class: 'k-sr', text: 'zeigt auf Objekt ' + key.replace('p', '') })]);
    }
    function refKey(enc, inFrame) {
      if (enc[0] === 'r') return String(enc[1]);
      if (inFrame && primMode && isScalar(enc)) return 'p' + enc[3];
      return null;
    }

    /* ── Klartext: was hat der letzte Schritt bewirkt, was kommt als Nächstes? ── */
    function happened(i) {
      var st = data.steps[i], prev = i > 0 ? data.steps[i - 1] : null, items = [];
      if (!prev) return { title: 'Start', code: null, items: ['Noch ist keine Zeile ausgeführt, der Speicher ist leer. Mit „Weiter“ führt Python die erste Zeile aus.'] };
      var title, codeTxt = null, handled = {};
      if (prev.ev === 'return') { title = 'Rückkehr aus ' + frameTitle(prev.f[prev.f.length - 1][0]); }
      else { title = 'Zeile ' + prev.l + ' wurde ausgeführt'; codeTxt = src(prev.l); }
      if (st.ev === 'exception') title = 'Fehler in Zeile ' + st.l;

      var prevTop = prev.f.length - 1;
      var sameFrames = st.f.length === prev.f.length;

      // 1. eingesetzte Werte
      if (prev.ev === 'line' && prev.s) items.push('Python setzt zuerst die aktuellen Werte ein: ' + C(prev.s));

      // 2. Bedingung
      if (prev.ev === 'line' && prev.c) {
        var kw = /^(\w+)/.exec(src(prev.l))[1], c = prev.c, truth = c[3];
        var res = 'Die Bedingung ' + C(c[0]) + (c[1] ? ', also ' + C(c[1]) + ',' : '') + ' ergibt ' + C(c[2]) +
          (c[2] === 'True' || c[2] === 'False' ? '' : ' (das zählt als ' + (truth ? 'wahr' : 'falsch') + ')') + '.';
        if (kw === 'while') res += truth ? ' Deshalb läuft der eingerückte Schleifenrumpf (noch) einmal.' : ' Deshalb endet die Schleife: Es geht nach dem eingerückten Block weiter.';
        else res += truth ? ' Deshalb wird der eingerückte Block darunter ausgeführt.' : ' Deshalb wird der eingerückte Block übersprungen' + (kw === 'if' || kw === 'elif' ? ' – gibt es ein elif oder else, ist das als Nächstes dran.' : '.');
        items.push(res);
      }

      // 3. for-Schleife
      var fm = prev.ev === 'line' ? /^for\s+(.+?)\s+in\s/.exec(src(prev.l)) : null;
      if (fm && sameFrames) {
        var lv = fm[1].replace(/[()\[\]]/g, '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        var pf = prev.f[prevTop], sf = st.f[prevTop], got = [];
        lv.forEach(function (n) {
          var a = findVar(pf, n), b = findVar(sf, n);
          if (b && (!a || sig(a, true) !== sig(b, true))) got.push(n + ' = ' + shortRepr(b, st.h));
        });
        if (got.length) {
          items.push('Die for-Schleife holt das ' + (lv.some(function (n) { return findVar(pf, n); }) ? 'nächste' : 'erste') + ' Element: ' + got.map(C).join(', ') + '. Dann läuft der eingerückte Rumpf damit.');
          lv.forEach(function (n) { handled[n] = 1; });
        } else items.push('Es sind keine Elemente mehr übrig: Die for-Schleife ist fertig. Es geht nach dem eingerückten Block weiter.');
      }

      // 4. Funktionsaufrufe
      if (st.f.length > prev.f.length) {
        for (var fi = prev.f.length; fi < st.f.length; fi++) {
          var fr = st.f[fi], params = fr[3] || [];
          var t = 'Aufruf: ' + C(frameTitle(fr[0])) + ' startet.';
          if (params.length) t += ' Die Parameter bekommen die übergebenen Werte: ' + params.map(function (p) { var v = findVar(fr, p); return C(p + ' = ' + (v ? shortRepr(v, st.h) : '?')); }).join(', ') + '.';
          items.push(t);
          items.push({ t: 'Python legt dafür einen neuen Frame (Bereich für die lokalen Variablen) oben auf den Aufrufstapel.', lv: 2 });
        }
      }

      // 5. Rückgabe
      if (st.ev === 'return' && !st.end) {
        var fname = st.f[st.f.length - 1][0];
        var rv = st.rv ? shortRepr(st.rv, st.h) : 'None';
        var noRet = !/^return\b/.test(src(prev.l)) && rv === 'None';
        items.push(C(frameTitle(fname)) + ' ist fertig und gibt ' + C(rv) + ' zurück.' + (noRet ? ' Ohne return gibt eine Funktion automatisch None zurück.' : ''));
      }
      if (prev.ev === 'return' && st.f.length < prev.f.length) {
        var gone = prev.f[prev.f.length - 1];
        var locs = gone[2].map(function (p) { return p[0]; });
        var callLine = prev.f.length > 1 ? prev.f[prev.f.length - 2][1] : null;
        if (callLine) items.push('Zurück in Zeile ' + callLine + ': Dort wird das Ergebnis ' + C(prev.rv ? shortRepr(prev.rv, prev.h) : 'None') + ' eingesetzt.');
        items.push({ t: 'Der Frame von ' + C(frameTitle(gone[0])) + ' wird vom Stapel genommen' + (locs.length ? ': Die lokalen Variablen ' + list(locs) + ' gibt es danach nicht mehr.' : '.'), lv: 2 });
      }

      // 6. Namen: neu, geändert, gelöscht (nur Frames, die vorher schon da waren)
      var common = Math.min(prev.f.length, st.f.length), prevNames = namesTo(prev), curNames = namesTo(st);
      for (var k = 0; k < common; k++) {
        var a = prev.f[k], b = st.f[k];
        if (a[0] !== b[0]) break;
        var fnIn = common > 1 && k > 0 ? ' (in ' + frameTitle(b[0]) + ')' : '';
        b[2].forEach(function (p) {
          var name = p[0], enc = p[1], old = findVar(a, name);
          if (handled[name] && k === prevTop) return;
          if (!old) {
            if (isCodeVal(enc)) {
              if (enc[2] === 'function') items.push('Die Funktion ' + C(name) + ' ist jetzt definiert. Ihr Rumpf läuft erst, wenn sie aufgerufen wird.');
              else if (enc[2] === 'class') items.push('Die Klasse ' + C(name) + ' ist jetzt definiert, ein Bauplan für Objekte.');
              else if (enc[2] === 'module') items.push('Das Modul ' + C(name) + ' ist jetzt importiert und kann benutzt werden.');
              else items.push('Der Name ' + C(name) + ' ist jetzt bekannt.');
              return;
            }
            if (enc[0] === 'r') {
              var h = st.h[enc[1]], others = (prevNames[String(enc[1])] || []);
              if (prev.h[enc[1]] && others.length) {
                items.push('Neuer Name ' + C(name) + fnIn + ': Er zeigt auf dasselbe Objekt wie ' + list(others) + ' (' + typDe(h ? h.t : '') + ' #' + enc[1] + '). Es wird nichts kopiert – zwei Namen, ein Objekt.');
              } else if (h) {
                items.push('Python legt ' + neuDe(h) + ' im Speicher an: ' + C(shortRepr(enc, st.h)) + ' (Objekt #' + enc[1] + '). Der Name ' + C(name) + fnIn + ' zeigt darauf.');
              }
            } else {
              items.push((primMode ? 'Neuer Name ' + C(name) + fnIn + ', er zeigt auf das Objekt ' : 'Neue Variable ' + C(name) + fnIn + ' mit dem Wert ') + C(enc[1]) + ' (' + enc[2] + (TYP[enc[2]] ? ', ' + TYP[enc[2]] : '') + ').');
            }
          } else if (sig(old, primMode) !== sig(enc, primMode)) {
            if (isScalar(old) && isScalar(enc)) {
              var tt = C(name) + fnIn + ' bekommt einen neuen Wert: ' + C(old[1]) + ' wird zu ' + C(enc[1]) + '.';
              if (primMode) tt += ' Der Name zeigt jetzt auf ein anderes Objekt. Das alte Objekt ' + C(old[1]) + ' selbst ändert sich nicht – Zahlen und Texte sind unveränderbar.';
              items.push(tt);
            } else if (enc[0] === 'r') {
              var nh = st.h[enc[1]];
              items.push(C(name) + fnIn + ' zeigt jetzt auf ' + (prev.h[enc[1]] ? 'ein anderes, schon vorhandenes Objekt' : neuDe(nh || { t: '?' })) + ': ' + C(shortRepr(enc, st.h)) + ' (#' + enc[1] + ').');
            } else if (old[0] === 'r') {
              var oh = prev.h[old[1]], still = (curNames[String(old[1])] || []);
              var tx = C(name) + fnIn + ' zeigt nicht mehr auf ' + typDe(oh ? oh.t : '') + ' #' + old[1] + ', sondern auf den Wert ' + C(enc[1]) + '.';
              if (st.h[old[1]] && still.length) tx += ' Das Objekt #' + old[1] + ' bleibt erhalten, weil noch ' + list(still) + ' darauf ' + (still.length > 1 ? 'zeigen' : 'zeigt') + '.';
              items.push(tx);
            } else {
              items.push(C(name) + fnIn + ' bekommt einen neuen Wert: ' + C(enc[1]) + '.');
            }
          }
        });
        a[2].forEach(function (p) {
          if (!findVar(b, p[0]) && prev.ev === 'line') items.push('Der Name ' + C(p[0]) + ' wurde gelöscht.');
        });
      }

      // 7. Objekte verändert / weggeräumt
      Object.keys(st.h).forEach(function (id) {
        var ph = prev.h[id], h = st.h[id];
        if (!ph || !h || heapSig(ph) === heapSig(h)) return;
        var names = curNames[id] || [];
        var tm = 'Das Objekt #' + id + ' (' + typDe(h.t) + ') wird verändert: ' + C(shortRepr(['r', +id], prev.h)) + ' wird zu ' + C(shortRepr(['r', +id], st.h)) + '.';
        if (names.length > 1) tm += ' Es entsteht kein neues Objekt. Deshalb sehen alle Namen, die darauf zeigen, die Änderung: ' + list(names) + '.';
        else if (names.length === 1) tm += ' Der Name ' + C(names[0]) + ' zeigt weiter auf dasselbe Objekt.';
        items.push(tm);
      });
      var freed = Object.keys(prev.h).filter(function (id) { return !st.h[id] && prev.h[id]; });
      freed.slice(0, 3).forEach(function (id) {
        var h = prev.h[id];
        items.push({ t: 'Auf ' + typDe(h.t) + ' #' + id + ' ' + C(shortRepr(['r', +id], prev.h)) + ' zeigt nichts mehr. Python räumt das Objekt weg und gibt den Speicher frei (Garbage Collection).', lv: 2 });
      });

      // 8. Ausgabe, Eingabe
      if (st.o > prev.o) {
        var txt = data.out.slice(prev.o, st.o).replace(/\n$/, '');
        if (prev.ev === 'line' && /\binput\s*\(/.test(src(prev.l))) items.push(o.inputs ? 'input() liest die nächste Eingabe, die du im Terminal getippt hast. Das Ergebnis ist immer Text (str), auch wenn Ziffern darin stehen.' : 'input() liest die nächste Zeile aus dem Feld „Eingaben“. Das Ergebnis ist immer Text (str), auch wenn Ziffern darin stehen.');
        items.push('Ausgabe im Terminal: ' + C(cut(txt, 90)));
      }

      // 9. Fehler
      if (st.ev === 'exception' && st.err) items.push('Dabei tritt ein Fehler auf: ' + C(st.err) + '.');

      if (!items.some(function (x) { return typeof x === 'string' || x.lv <= 1; })) items.push('Diese Zeile ändert nichts an den Variablen und erzeugt keine Ausgabe.');
      return { title: title, code: codeTxt, items: items };
    }

    function upcoming(i) {
      var st = data.steps[i], items = [];
      if (st.end) return { title: 'Programmende', code: null, items: ['Das Programm ist zu Ende. Alle Variablen des Hauptprogramms bleiben bis zum Schluss erhalten.'] };
      if (st.ev === 'exception') {
        if (i === N - 1) return { title: 'Abbruch', code: null, items: ['Das Programm bricht hier mit dem Fehler ab. Alles danach wird nicht mehr ausgeführt.'] };
        return { title: 'Fehlerbehandlung', code: null, items: ['Python sucht jetzt einen passenden except-Block. Gibt es keinen, bricht das Programm ab.'] };
      }
      if (st.ev === 'return') {
        var callLine = st.f.length > 1 ? st.f[st.f.length - 2][1] : null;
        return { title: callLine ? 'Zurück zu Zeile ' + callLine : 'Rückkehr', code: callLine ? src(callLine) : null, items: ['Der Rückgabewert wird dort eingesetzt, wo die Funktion aufgerufen wurde.'] };
      }
      var line = src(st.l);
      if (arrivedBy === 'bp' && bps[st.l]) items.push('Haltepunkt erreicht: Das Programm hält vor dieser Zeile an.');
      if (st.s) items.push('Mit den aktuellen Werten heißt das: ' + C(st.s));
      if (st.c) items.push('Hier wird die Bedingung ' + C(st.c[0]) + (st.c[1] ? ' geprüft, also ' + C(st.c[1]) : ' geprüft') + '. Überleg vorher: True oder False?');
      if (/^def\s/.test(line)) items.push('def führt die Funktion noch nicht aus. Python merkt sich nur, was sie tun soll.');
      if (/^class\s/.test(line)) items.push('class beschreibt nur den Bauplan. Objekte entstehen erst, wenn die Klasse aufgerufen wird.');
      return { title: 'Als Nächstes: Zeile ' + st.l, code: line, items: items };
    }

    /* Stufe 1 = für alle, Stufe 2 = Speicher-Details (Speicher, Experte). Einfach: höchstens 3 Punkte. */
    function visibleItems(part) {
      var max = mode === 'einfach' ? 1 : 2;
      var list = part.items.map(function (x) { return typeof x === 'string' ? { t: x, lv: 1 } : x; }).filter(function (x) { return x.lv <= max; });
      return mode === 'einfach' ? list.slice(0, 3) : list;
    }
    function fillPart(box, part, kind) {
      box.textContent = '';
      var h = el('h3', { class: 'kv-ex__h' }, [el('span', { class: 'kv-ex__tag kv-ex__tag--' + kind, text: kind === 'now' ? 'Was ist passiert?' : 'Als Nächstes' }), document.createTextNode(' ' + (kind === 'now' ? part.title : part.title.replace(/^Als Nächstes: /, '')))]);
      box.appendChild(h);
      if (part.code && mode === 'experte') { var pre = el('pre', { class: 'kv-ex__code' }); highlight(part.code, pre); box.appendChild(pre); }
      var vis = visibleItems(part);
      if (vis.length) {
        var ul = el('ul', { class: 'kv-ex__list' });
        vis.forEach(function (x) { ul.appendChild(rich(el('li'), x.t)); });
        box.appendChild(ul);
      }
    }

    /* ── Ablauftabelle ───────────────────────────────────────── */
    function buildTable() {
      var cols = [], colIdx = {};
      data.steps.forEach(function (st) {
        st.f.forEach(function (fr) {
          fr[2].forEach(function (p) {
            if (isCodeVal(p[1])) return;
            var k = fr[0] + '\u0000' + p[0];
            if (!(k in colIdx)) { colIdx[k] = cols.length; cols.push({ frame: fr[0], name: p[0] }); }
          });
        });
      });
      var table = el('table', { class: 'kv-tab__t' });
      var hr = el('tr', null, [el('th', { scope: 'col', text: 'Schritt' }), el('th', { scope: 'col', text: 'nach Zeile' })]);
      cols.forEach(function (c) {
        var th = el('th', { scope: 'col' }, [el('code', { text: c.name })]);
        if (c.frame !== 'Globale Variablen') th.appendChild(el('span', { class: 'kv-tab__fn', text: 'in ' + c.frame }));
        hr.appendChild(th);
      });
      hr.appendChild(el('th', { scope: 'col', text: 'Ausgabe' }));
      table.appendChild(el('thead', null, [hr]));
      tableBody = el('tbody');
      var last = cols.map(function () { return null; });
      data.steps.forEach(function (st, i) {
        var prev = i > 0 ? data.steps[i - 1] : null;
        var vals = cols.map(function () { return null; });
        st.f.forEach(function (fr) {
          fr[2].forEach(function (p) {
            var k = fr[0] + '\u0000' + p[0];
            if (k in colIdx) vals[colIdx[k]] = shortRepr(p[1], st.h);
          });
        });
        var lab = !prev ? 'Start' : (prev.ev === 'return' ? 'Rückkehr' : String(prev.l));
        var tr = el('tr', { class: st.ev === 'exception' ? 'is-err' : (st.ev === 'return' ? 'is-ret' : '') }, [el('td', { text: String(i + 1) }), el('td', { text: lab })]);
        vals.forEach(function (v, ci) {
          var td = el('td');
          if (v !== null && v !== last[ci]) { td.appendChild(el('code', { text: cut(v, 28) })); td.className = 'is-set'; }
          else if (v === null && last[ci] !== null) { td.textContent = '–'; td.className = 'is-gone'; td.title = 'Name gibt es nicht mehr'; }
          last[ci] = v;
          tr.appendChild(td);
        });
        var o = prev && st.o > prev.o ? data.out.slice(prev.o, st.o).replace(/\n$/, '') : '';
        tr.appendChild(el('td', { class: 'kv-tab__out' }, o ? [el('code', { text: cut(o, 40) })] : []));
        tr.addEventListener('click', function () { stop(); go(i); });
        tableBody.appendChild(tr); tableRows.push(tr);
      });
      table.appendChild(tableBody);
      tableWrap.appendChild(el('div', { class: 'kv-tab__scroll' }, [table]));
    }

    /* ── Darstellung eines Schritts ──────────────────────────── */
    function render() {
      var st = data.steps[idx];
      var prev = idx > 0 ? data.steps[idx - 1] : null;
      var atEnd = !!st.end;

      // Zeilenmarkierung: gerade ausgeführt (hell), als Nächstes (kräftig), Zähler
      var prevLine = null, nextLine = null, isRet = st.ev === 'return' && !st.end;
      if (st.ev === 'line' || st.ev === 'exception') nextLine = st.l;
      if (prev && prev.ev !== 'return') prevLine = prev.l;
      if (atEnd || isRet) prevLine = st.l;
      var waiting = {};
      st.f.forEach(function (fr, fi) { if (fi < st.f.length - 1) waiting[fr[1]] = 1; });
      var counts = {};
      for (var j = 0; j < idx; j++) if (data.steps[j].ev === 'line') counts[data.steps[j].l] = (counts[data.steps[j].l] || 0) + 1;
      lineEls.forEach(function (li, i) {
        var n = i + 1;
        li.classList.toggle('is-next', n === nextLine);
        li.classList.toggle('is-prev', n === prevLine && n !== nextLine);
        li.classList.toggle('is-err', n === nextLine && st.ev === 'exception');
        li.classList.toggle('is-run', !!counts[n]);
        li.classList.toggle('is-wait', !!waiting[n] && n !== nextLine);
        if (n === nextLine) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        cntEls[i].textContent = counts[n] > 1 ? counts[n] + '×' : '';
      });
      if (nextLine && lineEls[nextLine - 1]) scrollInto(codeBox, lineEls[nextLine - 1]);
      else if (prevLine && lineEls[prevLine - 1]) scrollInto(codeBox, lineEls[prevLine - 1]);

      // Frames: oben der aktuelle Aufruf
      framesBox.textContent = '';
      var primObjs = {}, order = [], seen = {};
      function visit(enc, inFrame) {
        var key = refKey(enc, inFrame);
        if (!key || seen[key]) return;
        seen[key] = 1; order.push(key);
        if (key.charAt(0) === 'p') { primObjs[key] = enc; return; }
        var h = st.h[key]; if (!h) return;
        if (h.k === 'seq') h.v.forEach(function (x) { visit(x); });
        else if (h.k === 'dict') h.v.forEach(function (p) { visit(p[0]); visit(p[1]); });
        else if (h.k === 'obj') h.v.forEach(function (p) { visit(p[1]); });
      }
      for (var fi = st.f.length - 1; fi >= 0; fi--) {
        var fr = st.f[fi];
        var pf = prev && prev.f[fi] && prev.f[fi][0] === fr[0] ? prev.f[fi] : null;
        var top = fi === st.f.length - 1;
        var isG = fr[0] === 'Globale Variablen';
        var meta;
        if (mode === 'einfach') meta = top ? '' : 'wartet in Zeile ' + fr[1];
        else {
          meta = isG ? 'globale Variablen' : 'lokale Variablen';
          if (top) meta += atEnd ? ' · beendet' : (isRet ? ' · gibt gerade zurück' : (st.f.length > 1 ? ' · läuft gerade' : ''));
          else meta += ' · wartet in Zeile ' + fr[1];
          if (!isG && fi > 0) meta += ' · aufgerufen in Zeile ' + st.f[fi - 1][1];
        }
        var fe = el('section', { class: 'kv-frame' + (top ? ' is-top' : '') + (pf ? '' : ' is-new') + (isG ? ' is-global' : ''), 'aria-label': 'Frame ' + frameTitle(fr[0]) });
        fe.appendChild(el('header', { class: 'kv-frame__h' }, [el('strong', { text: frameTitle(fr[0]) }), el('span', { class: 'kv-frame__meta', text: meta })]));
        if (!fr[2].length) fe.appendChild(el('p', { class: 'kv-frame__empty', text: 'noch keine Variablen' }));
        var params = fr[3] || [];
        fr[2].forEach(function (pair) {
          var old = pf ? findVar(pf, pair[0]) : null;
          var changed = prev && (!old || sig(old, primMode) !== sig(pair[1], primMode));
          var rk = refKey(pair[1], true);
          var row = el('div', { class: 'kv-row' + (changed ? ' is-changed' : '') + (isCodeVal(pair[1]) ? ' is-code' : '') });
          if (rk) row.setAttribute('data-to', rk);
          var nm = el('span', { class: 'kv-name' }, [el('span', { text: pair[0] })]);
          if (params.indexOf(pair[0]) >= 0) nm.appendChild(el('span', { class: 'kv-tag', text: 'Parameter' }));
          row.appendChild(nm);
          var cell = el('span', { class: 'kv-cell' });
          cell.appendChild(valNode(pair[1], true));
          row.appendChild(cell);
          fe.appendChild(row);
        });
        if (top && st.ev === 'return' && st.rv) {
          var rr = el('div', { class: 'kv-row kv-row--ret is-changed' });
          var rrk = refKey(st.rv, true); if (rrk) rr.setAttribute('data-to', rrk);
          rr.appendChild(el('span', { class: 'kv-name', text: 'Rückgabewert' }));
          var rc = el('span', { class: 'kv-cell' }); rc.appendChild(valNode(st.rv, true)); rr.appendChild(rc);
          fe.appendChild(rr);
          visit(st.rv, true);
        }
        fr[2].forEach(function (pair) { visit(pair[1], true); });
        framesBox.appendChild(fe);
      }
      Object.keys(st.h).forEach(function (id) { if (!seen[id] && st.h[id]) { seen[id] = 1; order.push(id); } });

      // Objekte (gleiche Objekte = gleicher Kasten), dazu weggeräumte als Schatten
      heapBox.textContent = '';
      var names = namesTo(st);
      var prevPrims = {};
      if (prev && primMode) prev.f.forEach(function (fr) { fr[2].forEach(function (p) { if (isScalar(p[1])) prevPrims['p' + p[1][3]] = 1; }); });
      order.forEach(function (key) { heapBox.appendChild(objBox(key, st, prev, names, primObjs, false, prevPrims)); });
      if (prev && mode !== 'einfach') Object.keys(prev.h).forEach(function (id) {
        if (!st.h[id] && prev.h[id]) heapBox.appendChild(objBox(id, prev, null, namesTo(prev), {}, true));
      });
      var anyObj = heapBox.childNodes.length > 0;
      heapCol.hidden = !anyObj;
      memBox.classList.toggle('has-heap', anyObj);

      // Ausgabe: neuer Teil markiert
      outPre.textContent = '';
      var po = prev ? prev.o : 0;
      outPre.appendChild(document.createTextNode(data.out.slice(0, Math.min(po, st.o))));
      if (st.o > po) outPre.appendChild(el('mark', { class: 'kv-out-new', text: data.out.slice(po, st.o) }));
      outPre.scrollTop = outPre.scrollHeight;

      // Erklärung
      var hp = happened(idx), up = upcoming(idx);
      fillPart(exNow, hp, 'now');
      fillPart(exNext, up, 'next');

      // Fehler / Abbruch
      var last = idx === N - 1;
      errBox.hidden = st.ev !== 'exception' || !st.err;
      errBox.textContent = '';
      if (!errBox.hidden) {
        var eh = el('p', { class: 'kv__errmsg' }, [icon('x'), document.createTextNode(' Fehler in Zeile ' + st.l + ': ' + st.err)]);
        errBox.appendChild(eh);
        var hint = hintFor(st.err);
        if (hint) errBox.appendChild(el('p', { class: 'kv__errhint', text: 'Was das meistens heißt: ' + hint }));
      }
      note.hidden = !(last && data.trunc);
      if (last && data.trunc) note.textContent = 'Die Aufzeichnung endet nach ' + N + ' Schritten, das Programm läuft aber weiter. Läuft da eine Endlosschleife?';

      // Ablauftabelle
      tableRows.forEach(function (tr, j) { tr.hidden = j > idx; tr.classList.toggle('is-cur', j === idx); });
      var sc = tableWrap.querySelector('.kv-tab__scroll');
      if (sc && tableRows[idx]) { var tr = tableRows[idx]; if (tr.offsetTop + tr.offsetHeight > sc.scrollTop + sc.clientHeight || tr.offsetTop < sc.scrollTop + 30) sc.scrollTop = Math.max(0, tr.offsetTop + tr.offsetHeight - sc.clientHeight); }

      // Steuerung + Ansage
      slider.value = String(idx);
      slider.setAttribute('aria-valuetext', 'Schritt ' + (idx + 1) + ' von ' + N);
      counter.textContent = 'Schritt ' + (idx + 1) + ' von ' + N;
      firstBtn.disabled = prevBtn.disabled = idx === 0;
      lastBtn.disabled = nextBtn.disabled = overBtn.disabled = bpBtn.disabled = last;
      outBtn.disabled = last || st.f.length < 2;
      live.textContent = plain(hp.title + '. ' + visibleItems(hp).map(function (x) { return x.t; }).join(' ') + (mode === 'experte' ? ' ' + up.title + '.' : ''));
      arrivedBy = '';
      drawArrows();
      if (hl) setHl(hl);
    }

    function objBox(key, st, prev, names, primObjs, ghost, prevPrims) {
      var isP = key.charAt(0) === 'p';
      var box;
      if (isP) {
        var enc = primObjs[key];
        box = el('section', { class: 'kv-obj kv-obj--prim' + (prev && prevPrims && !prevPrims[key] ? ' is-changed' : ''), 'data-oid': key, 'aria-label': enc[2] + ' ' + enc[1] });
        box.appendChild(el('header', { class: 'kv-obj__h' }, [el('span', { class: 'kv-type' }, [enc[2], el('span', { class: 'kv-obj__mut', text: ' · unveränderbar' })]), el('span', { class: 'kv-obj__id', text: '#' + enc[3] })]));
        box.appendChild(el('p', { class: 'kv-obj__prim', text: enc[1] }));
      } else {
        var h = st.h[key];
        var ph = prev && prev.h[key];
        var changed = !ghost && prev && (!ph || heapSig(ph) !== heapSig(h));
        box = el('section', { class: 'kv-obj' + (changed ? ' is-changed' : '') + (ghost ? ' is-freed' : ''), 'data-oid': ghost ? 'x' + key : key, 'aria-label': h.t + ' ' + key });
        var mut = mutDe(h.t, h.k);
        box.appendChild(el('header', { class: 'kv-obj__h' }, [
          el('span', { class: 'kv-type' }, [h.t, el('span', { class: 'kv-obj__mut', text: [TYP[h.t], mut].filter(Boolean).map(function (x) { return ' · ' + x; }).join('') })]),
          el('span', { class: 'kv-obj__id', text: '#' + key })
        ]));
        if (ghost) box.appendChild(el('p', { class: 'kv-obj__freed', text: 'kein Name zeigt mehr darauf: wird weggeräumt' }));
        if (h.k === 'other') box.appendChild(el('p', { class: 'kv-obj__repr', text: h.r }));
        else if (h.k === 'seq') {
          var lst = el('div', { class: 'kv-items' + (h.t === 'list' || h.t === 'tuple' ? ' kv-items--idx' : '') });
          if (!h.v.length) lst.appendChild(el('span', { class: 'kv-obj__repr', text: 'leer' }));
          var pv = ph && ph.k === 'seq' ? ph.v : null;
          h.v.forEach(function (it, i) {
            var ch = !ghost && prev && pv && (!pv[i] || sig(pv[i]) !== sig(it));
            var c = el('span', { class: 'kv-item' + (ch ? ' is-changed' : '') });
            if (h.t === 'list' || h.t === 'tuple') c.appendChild(el('span', { class: 'kv-item__i', text: String(i) }));
            c.appendChild(valNode(it)); lst.appendChild(c);
          });
          if (h.more > 0) lst.appendChild(el('span', { class: 'kv-obj__repr', text: '… +' + h.more }));
          box.appendChild(lst);
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
      }
      var nm = names[key] || [];
      if (!ghost && (nm.length > 1 || (nm.length && mode !== 'einfach'))) box.appendChild(el('p', { class: 'kv-obj__names' + (nm.length > 1 ? ' is-multi' : '') }, [nm.length > 1 ? 'Namen: ' : 'Name: ', el('code', { text: nm.join(', ') })]));
      return box;
    }

    function scrollInto(box, li) {
      var top = li.offsetTop, h = li.offsetHeight;
      if (top < box.scrollTop + 8) box.scrollTop = Math.max(0, top - 8);
      else if (top + h > box.scrollTop + box.clientHeight - 8) box.scrollTop = top + h - box.clientHeight + 8;
    }

    /* Hervorheben: nur die Pfeile zum Objekt unter der Maus werden kräftiger, die übrigen treten zurück */
    function setHl(key) {
      hl = key;
      if (!memBox) return;
      Array.prototype.forEach.call(memBox.querySelectorAll('.is-hl'), function (n) { n.classList.remove('is-hl'); n.setAttribute('marker-end', 'url(#' + uid + '-ah)'); });
      memBox.classList.toggle('has-hl', !!key && !!memBox.querySelector('[data-arrow="' + key + '"]'));
      if (!key) return;
      Array.prototype.forEach.call(memBox.querySelectorAll('[data-arrow="' + key + '"]'), function (n) {
        n.classList.add('is-hl');
        if (n.hasAttribute('data-arrow')) n.setAttribute('marker-end', 'url(#' + uid + '-ah-hl)');
      });
    }

    /* Pfeile von Verweisen zu Objektkästen */
    function drawArrows() {
      if (!svg || !memBox) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var base = memBox.getBoundingClientRect();
      svg.setAttribute('width', String(memBox.scrollWidth)); svg.setAttribute('height', String(memBox.scrollHeight));
      var defs = document.createElementNS(NS, 'defs');
      defs.innerHTML = ['', '-hl'].map(function (suf) {
        return '<marker id="' + uid + '-ah' + suf + '" class="kv-ah' + suf + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>';
      }).join('');
      svg.appendChild(defs);
      var boxes = {};
      Array.prototype.forEach.call(memBox.querySelectorAll('.kv-obj'), function (b) { boxes[b.getAttribute('data-oid')] = b; });
      Array.prototype.forEach.call(memBox.querySelectorAll('.kv-ref'), function (d) {
        var key = d.getAttribute('data-to'), tb = boxes[key]; if (!tb) return;
        if (d.closest('.kv-obj') === tb || d.closest('.is-freed')) return;
        var a = d.getBoundingClientRect(), b = tb.getBoundingClientRect();
        var x1 = a.left + a.width / 2 - base.left, y1 = a.top + a.height / 2 - base.top;
        var x2, y2, c1x, c1y, c2x, c2y;
        if (b.left > a.right + 10) {
          x2 = b.left - base.left - 2; y2 = Math.min(Math.max(y1, b.top - base.top + 14), b.bottom - base.top - 10);
          var dx = Math.max(24, (x2 - x1) / 2);
          c1x = x1 + dx; c1y = y1; c2x = x2 - dx; c2y = y2;
        } else {
          // Verweis aus einem Objekt auf ein anderes Objekt in derselben Spalte: Bogen rechts herum
          x2 = b.right - base.left + 2; y2 = b.top - base.top + Math.min(18, b.height / 2);
          var bulge = Math.max(x1, x2) + 36;
          c1x = bulge; c1y = y1; c2x = bulge; c2y = y2;
        }
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x2 + ' ' + y2);
        p.setAttribute('class', 'kv-arrow' + (d.closest('.kv-obj') ? ' kv-arrow--inner' : ''));
        p.setAttribute('data-arrow', key);
        p.setAttribute('marker-end', 'url(#' + uid + '-ah)');
        svg.appendChild(p);
      });
    }

    function go(i, keepHint) {
      i = Math.max(0, Math.min(N - 1, i));
      if (!keepHint) hintEl.textContent = '';
      idx = i; render();
    }

    /* Tastatur, Fokusfalle */
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]), input, select, summary, [href], [tabindex="0"]')).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) { e.preventDefault(); panel.focus(); return; }
        var first = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
        return;
      }
      if (!data || !N) return;
      var t = e.target;
      if (t && t.tagName === 'INPUT' && t.type === 'range') return;     // Schieberegler bedient sich selbst
      if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stop(); go(idx + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stop(); go(idx - 1); }
      else if (e.key === 'Home') { e.preventDefault(); stop(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); stop(); go(N - 1); }
      else if (e.key === ' ' && !(t && (t.tagName === 'BUTTON' || t.tagName === 'SUMMARY' || (t.tagName === 'INPUT' && t.type === 'checkbox')))) { e.preventDefault(); playing ? stop() : play(); }
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

    function showError(msg) {
      body.textContent = '';
      var box = el('div', { class: 'kv__err', role: 'alert' }, [el('p', { class: 'kv__errmsg' }, [icon('x'), document.createTextNode(' ' + msg)])]);
      var hint = hintFor(msg.replace(/^Zeile \d+: /, ''));
      if (hint) box.appendChild(el('p', { class: 'kv__errhint', text: 'Was das meistens heißt: ' + hint }));
      body.appendChild(box);
    }

    record(code, o).then(function (d) {
      if (!back.parentNode) return;
      data = d; N = data.steps.length;
      if (!N) {
        showError(data.err ? (data.errline ? 'Zeile ' + data.errline + ': ' : '') + data.err : 'Der Code enthält nichts, was Schritt für Schritt ausgeführt werden kann.');
        return;
      }
      buildView();
      setPlayBtn();
      go(0);
      nextBtn.focus();
    }).catch(function (err) {
      if (!back.parentNode) return;
      showError(err && err.message ? err.message : String(err));
    });
    return view;
  }

  window.KursViz = { _real: true, open: open, maxSteps: MAX_STEPS };
})();
