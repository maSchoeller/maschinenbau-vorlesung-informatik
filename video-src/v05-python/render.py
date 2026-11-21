"""V05 Python: Vom Programmablaufplan zum Code (Symbol fuer Symbol uebersetzen, if/else, elif, Plausibilitaet, Testfaelle je Weg).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-python"; LABEL = "DHBW · Informatik · V05 · Vom Programmablaufplan zum Code"

SRC = [
 ["Ein Programmablaufplan lässt sich fast mechanisch in Python übersetzen: Symbol für Symbol.",
  "Links der Code, rechts der Plan, und gleiche Farbe heißt: gehört zusammen.",
  "Ein Parallelogramm für die Eingabe wird eine Zeile mit `input`, und `float` macht daraus eine Kommazahl.",
  "Das Rechteck wird zur Rechnung: Die Sicherheit ist die Streckgrenze geteilt durch die Spannung.",
  "Das Parallelogramm für die Ausgabe wird `print`. Die Namen der Variablen übernimmst du aus dem Plan."],
 ["Die Raute wird zu `if` und `else`.",
  "Die Bedingung aus der Raute steht hinter `if`, gefolgt von einem Doppelpunkt.",
  "Der ja-Zweig steht eingerückt darunter, der nein-Zweig eingerückt unter `else`.",
  "Einrückung heißt: vier Leerzeichen weiter rechts. Sie bestimmt, was zu welchem Zweig gehört.",
  "Fehlt der Doppelpunkt, meldet Python einen Fehler."],
 ["Steckt im nein-Zweig eine weitere Verzweigung, steckt im Code ein `if` im `else`.",
  "Hier prüft die erste Raute die Eingabe, und erst im nein-Zweig kommt die zweite Frage.",
  "Jede Ebene im Plan ergibt eine Einrückebene mehr.",
  "Das `else` steht genau unter seinem `if`, sonst gehört es zu einem anderen Block.",
  "Zähle die Ebenen im Plan, dann stimmt auch die Einrückung."],
 ["Warum prüfen wir die Eingabe zuerst? Bei einer Spannung von 0 bricht die Division ab.",
  "Python meldet einen [[ZeroDivisionError|Zero Division Error]], und danach kommt keine Ausgabe mehr.",
  "Ein `if` vor der Rechnung fängt solche Werte ab: Plausibel heißt, der Wert ist physikalisch möglich.",
  "Weder Spannung noch Streckgrenze dürfen null oder negativ sein, also prüfen wir beide und verbinden sie mit `or`.",
  "Eine wahre Bedingung genügt, dann folgt die Meldung."],
 ["Bei drei Ausgängen hast du zwei Möglichkeiten.",
  "Links verschachtelt, ein `if` im `else`, rechts mit `elif`, der Kurzform für `else` und gleich wieder `if`.",
  "Beide liefern dasselbe. Eine Raute direkt im nein-Zweig einer Raute wird zum `elif`.",
  "Nimm `elif` für gleichrangige Bereiche, die der Reihe nach geprüft werden: Der erste Treffer gewinnt.",
  "Verschachtle, wenn die zweite Frage nur in einem Zweig Sinn ergibt."],
 ["Ob der Code stimmt, zeigen Testfälle, die du aus dem Plan ableitest.",
  "Die Regel: Jeder Weg vom Start bis zum Ende wird mindestens einmal durchlaufen.",
  "Unser Plan hat drei Wege, also drei Tests, dazu ein Grenzfall: Bei genau 1,5 gilt noch ausreichend.",
  "Du sagst das Ergebnis vorher und vergleichst es mit der Ausgabe von Python.",
  "Stimmt ein Test nicht, weißt du sofort, in welchem Zweig du suchen musst."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung (alles vorab ausgefuehrt)
SEQ = ['spannung = float(input("Spannung in MPa: "))', 'streckgrenze = float(input("Streckgrenze in MPa: "))',
       'sicherheit = streckgrenze / spannung', 'print("Sicherheit:", sicherheit)']
IFE = ['if sicherheit >= 1.5:', '    urteil = "ausreichend"', 'else:', '    urteil = "zu gering"', 'print("Sicherheit:", sicherheit, urteil)']
FULL = ['spannung = float(input("Spannung in MPa: "))', 'streckgrenze = float(input("Streckgrenze in MPa: "))', '',
        'if spannung <= 0 or streckgrenze <= 0:', '    print("Eingabe unplausibel")', 'else:', '    sicherheit = streckgrenze / spannung',
        '    if sicherheit >= 1.5:', '        urteil = "ausreichend"', '    else:', '        urteil = "zu gering"',
        '    print("Sicherheit:", sicherheit, urteil)']
NEST = ['if spannung <= 140:', '    werkstoff = "S235JR"', 'else:', '    if spannung <= 220:', '        werkstoff = "C45E"', '    else:', '        werkstoff = "42CrMo4"']
ELIF = ['if spannung <= 140:', '    werkstoff = "S235JR"', 'elif spannung <= 220:', '    werkstoff = "C45E"', 'else:', '    werkstoff = "42CrMo4"']
TESTS = [("unplausibel", ("0", "240"), "Eingabe unplausibel"), ("ausreichend", ("100", "240"), "Sicherheit: 2.4 ausreichend"),
         ("zu gering", ("200", "240"), "Sicherheit: 1.2 zu gering"), ("Grenzfall", ("160", "240"), "Sicherheit: 1.5 ausreichend")]
FULLTXT = "\n".join(FULL)
for _, ein, erw in TESTS:
    out = run_in(FULLTXT, ein); assert len(out) == 3 and out[2] == erw, out
assert run_in("\n".join(SEQ), ("100", "240")) == ["Spannung in MPa: 100", "Streckgrenze in MPa: 240", "Sicherheit: 2.4"]
for sp, erw in ((100, "ausreichend"), (200, "zu gering"), (160, "ausreichend")):
    assert run_in("sicherheit = 240 / %d\n" % sp + "\n".join(IFE), ())[0].endswith(erw), sp
assert 240 / 100 == 2.4 and 240 / 200 == 1.2 and 240 / 160 == 1.5
# Fehlerfall ohne Pruefung: genau die Meldung, die das Video zeigt (danach keine Ausgabe mehr)
try:
    run_in("\n".join(SEQ), ("0", "240")); raise AssertionError("kein Fehler")
except ZeroDivisionError as e:
    ZDE = f"{type(e).__name__}: {e}"
assert ZDE == "ZeroDivisionError: float division by zero", ZDE
for w, sp in (("S235JR", 100), ("C45E", 180), ("42CrMo4", 250)):
    for code in (NEST, ELIF):
        g = {"spannung": sp}; exec("\n".join(code), g); assert g["werkstoff"] == w, (code, sp)
CSZ = 18; CW = 590
for L_ in (SEQ, IFE, FULL, NEST, ELIF): fit_check(L_, M(CSZ), CW - 50 - 14, "Code")

# ---------------------------------------------------------------- Plaene
def pap_seq():
    D = Dia(21); Q = chr(34)
    D.stack([("s", "term", "Start"), ("e1", "io", "spannung einlesen"), ("e2", "io", "streckgrenze einlesen"),
             ("p", "proc", "sicherheit =" + NL + "streckgrenze / spannung"), ("a", "io", Q + "Sicherheit:" + Q + ", sicherheit" + NL + "ausgeben"), ("z", "term", "Ende")],
            300, 6, gap=24, minw=330)
    return D
SEQD = pap_seq()

def pap_full(ox=10, oy=6, gap=14):
    """Plan der Sicherheitspruefung (FULL). Knoten: s,e1,e2,d1,meld,ende1,p,d2,u1,u2,a,z."""
    D = Dia(18); N = D.node; Q = chr(34)
    N("s", "term", "Start", 0, 0); N("e1", "io", "spannung einlesen", 0, 0, minw=250); N("e2", "io", "streckgrenze einlesen", 0, 0, minw=250)
    N("d1", "dec", "spannung ≤ 0 oder" + NL + "streckgrenze ≤ 0 ?", 0, 0)
    N("meld", "io", Q + "Eingabe unplausibel" + Q + NL + "ausgeben", 0, 0); N("ende1", "term", "Ende", 0, 0)
    N("p", "proc", "sicherheit =" + NL + "streckgrenze / spannung", 0, 0); N("d2", "dec", "sicherheit ≥ 1.5 ?", 0, 0)
    N("u1", "proc", "urteil =" + NL + Q + "ausreichend" + Q, 0, 0); N("u2", "proc", "urteil =" + NL + Q + "zu gering" + Q, 0, 0)
    N("a", "io", Q + "Sicherheit:" + Q + ", sicherheit," + NL + "urteil ausgeben", 0, 0, minw=270); N("z", "term", "Ende", 0, 0)
    n = D.nodes
    rows = [("s",), ("e1",), ("e2",), ("d1", "meld"), ("p", "ende1"), ("d2",), ("u1", "u2"), ("bus",), ("a",), ("z",)]
    gaps = [gap, gap, gap, gap + 12, gap + 10, gap + 12, gap, gap, gap]
    y = oy; ys = {}
    for i, r in enumerate(rows):
        h = 14 if r[0] == "bus" else max(n[k].h for k in r)
        for k in r: ys[k] = y + h / 2
        y += h + (gaps[i] if i < len(gaps) else 0)
    for k in n: n[k].cy = ys[k]
    A_ = ox + 222
    for k in ("s", "e1", "e2", "d1", "p", "d2", "a", "z"): n[k].cx = A_
    n["u1"].cx = A_ - 150; n["u2"].cx = A_ + 150
    n["meld"].cx = n["d1"].bbox()[2] + 38 + n["meld"].w / 2; n["ende1"].cx = n["meld"].cx
    bus = ys["bus"]; E = D.edge
    E("s-e1", "s", "b", "e1", "t"); E("e1-e2", "e1", "b", "e2", "t"); E("e2-d1", "e2", "b", "d1", "t")
    E("d1-meld", "d1", "r", "meld", "l", label="ja"); E("meld-ende1", "meld", "b", "ende1", "t")
    E("d1-p", "d1", "b", "p", "t", label="nein"); E("p-d2", "p", "b", "d2", "t")
    E("d2-u1", "d2", "l", "u1", "t", label="ja"); E("d2-u2", "d2", "r", "u2", "t", label="nein")
    E("u1-bus", "u1", "b", (n["u1"].cx, bus), None, arrow=False); E("u2-bus", "u2", "b", (n["u2"].cx, bus), None, arrow=False)
    E("bus-l", (n["u1"].cx, bus), None, (A_, bus), None, arrow=False); E("bus-r", (A_, bus), None, (n["u2"].cx, bus), None, arrow=False)
    E("bus-a", (A_, bus), None, "a", "t"); E("a-z", "a", "b", "z", "t")
    return D
FD = pap_full()
HEAD = ["s-e1", "e1-e2", "e2-d1"]
PATHS = [HEAD + ["d1-meld", "meld-ende1"],
         HEAD + ["d1-p", "p-d2", "d2-u1", "u1-bus", "bus-l", "bus-a", "a-z"],
         HEAD + ["d1-p", "p-d2", "d2-u2", "u2-bus", "~bus-r", "bus-a", "a-z"],
         HEAD + ["d1-p", "p-d2", "d2-u1", "u1-bus", "bus-l", "bus-a", "a-z"]]
FB = FD.bbox(); FZ = 0.86
assert (FB[3] - FB[1]) * FZ <= 585 and (FB[2] - FB[0]) * FZ <= 600, (FB, FZ)
FBOX = (640, 100, 610, 590)

def pap_elif():
    D = Dia(19); N = D.node; Q = chr(34)
    N("d1", "dec", "spannung ≤ 140 ?", 0, 0); N("d2", "dec", "spannung ≤ 220 ?", 0, 0)
    N("w1", "proc", "werkstoff =" + NL + Q + "S235JR" + Q, 0, 0); N("w2", "proc", "werkstoff =" + NL + Q + "C45E" + Q, 0, 0); N("w3", "proc", "werkstoff =" + NL + Q + "42CrMo4" + Q, 0, 0)
    n = D.nodes; n["d1"].cx = 130; n["d1"].cy = 40; n["d2"].cx = n["d1"].bbox()[2] + 40 + n["d2"].w / 2; n["d2"].cy = 40
    by = 40 + 32 + 36 + 31
    n["w1"].cx = n["d1"].cx; n["w2"].cx = n["d2"].cx; n["w3"].cx = n["d2"].bbox()[2] + 30 + n["w3"].w / 2
    for k in ("w1", "w2", "w3"): n[k].cy = by
    E = D.edge
    E("d1-w1", "d1", "b", "w1", "t", label="ja"); E("d1-d2", "d1", "r", "d2", "l", label="nein")
    E("d2-w2", "d2", "b", "w2", "t", label="ja"); E("d2-w3", "d2", "r", "w3", "t", label="nein")
    return D
ED = pap_elif()

# ---------------------------------------------------------------- Hilfen fuer Zuordnung Code <-> Plan
def code_view(f, t, lines, cols, active, x=40, y=110, times=None, size=CSZ, lh=25, a=0.3):
    times = times or [-1] * len(lines)
    f.el(ap(t, 0.0, a), lambda d, dy: code_c(d, x, y + dy, CW, lines, times, t, size, lh, cols, active, off=50))

def cols_of(names, binds):
    keys = {}; lines = {}
    for nm in names:
        ks, ls, col = binds[nm]
        for k in ks: keys[k] = col
        for l in ls: lines[l] = col
    return keys, lines

# ---------------------------------------------------------------- 1 Symbol fuer Symbol
B1 = {"ein": (["e1", "e2"], [0, 1], PAL[0]), "rech": (["p"], [2], PAL[1]), "aus": (["a"], [3], PAL[2])}
def sc1(f, t, ct):
    heading(f, t, "Vom Plan zum Code: Symbol für Symbol")
    tm = {"s": 0.4, "z": 0.4}
    for k, tt in (("s-e1", 0.6), ("e1", 0.6), ("e1-e2", 0.8), ("e2", 0.8)): tm[k] = tt
    tm.update({"e2-p": 1.0, "p": 1.0, "p-a": 1.2, "a": 1.2, "a-z": 1.4})
    names = []
    if t > ct(2): names.append("ein")
    if t > ct(3): names.append("rech")
    if t > ct(4): names.append("aus")
    keys, lines = cols_of(names, B1)
    act = set()
    if ct(2) < t < ct(3): act = {0, 1}
    elif ct(3) < t < ct(4): act = {2}
    elif t > ct(4): act = {3}
    times = [ct(2) + 1.0, ct(2) + 2.6, ct(3) + 1.0, ct(4) + 0.4]
    code_view(f, t, SEQ, lines, act if act else None, times=times)
    pap_view(f, ap(t, 0.2, 0.3), SEQD, (660, 108, 590, 570), (30, 0), vis=reveal(t, tm), hl=keys, zoom=1.08)
    ents = [(ct(4) + 3.0, [("Spannung in MPa: 100", CODE_T)]), (ct(4) + 3.6, [("Streckgrenze in MPa: 240", CODE_T)]), (ct(4) + 4.2, [("Sicherheit: 2.4", CODE_G)])]
    f.el(ap(t, ct(4) + 2.8, 0.4), lambda d, dy: console_panel(d, 40, 330 + dy, CW, 130, ents, t, 18, lh=28))
    note(f, t, ct(1) + 0.5, 40, 490, CW, 100, "Gleiche Farbe, gleiche Stelle", ["Eingabe: input und float", "Rechnung: Zuweisung   Ausgabe: print"], DARK, bsz=24)

# ---------------------------------------------------------------- 2 Raute = if / else
B2 = {"if": (["d2"], [0], PAL[0]), "ja": (["u1", "d2-u1"], [1], PAL[1]), "else": ([], [2], PAL[4]), "nein": (["u2", "d2-u2"], [3], PAL[3]), "weiter": (["a", "bus-a"], [4], PAL[5])}
def sc2(f, t, ct):
    heading(f, t, "Die Raute wird zu if und else")
    names = []
    if t > ct(0) + 0.5: names.append("if")
    if t > ct(2) - 0.2: names += ["ja", "else", "nein"]
    if t > ct(3) + 2.0: names.append("weiter")
    keys, lines = cols_of(names, B2)
    act = {0, 2} if (ct(0) < t < ct(2) - 0.2) else None
    if ct(1) < t < ct(2) - 0.2: act = {0}
    if ct(2) < t < ct(3): act = {1, 3}
    if ct(4) - 0.2 < t: act = {0, 2}
    times = [ct(0) + 0.4, ct(2) + 0.4, ct(2) + 1.0, ct(2) + 1.4, ct(3) + 2.4]
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_c(d, 40, 110 + dy, CW, IFE, times, t, 20, 30, lines, act, off=50, cps=70))
    pap_view(f, ap(t, 0.2, 0.3), FD, (640, 100, 610, 580), (FD.nodes["u1"].bbox()[0] - 40, FD.nodes["d2"].cy - 52), hl=keys, zoom=1.2)
    note(f, t, ct(1) + 0.5, 40, 330, CW, 96, "Doppelpunkt nicht vergessen", ["hinter if, else und elif steht immer ein :"], PAL[0], bsz=24)
    note(f, t, ct(3) + 0.4, 40, 442, CW, 96, "Einrückung", ["4 Leerzeichen weiter rechts = im Zweig"], PAL[1], bsz=24)
    pill(f, t, ct(4) + 0.4, 40, 560, CW, "ohne Doppelpunkt: Fehlermeldung", RED, 52, 24)

# ---------------------------------------------------------------- 3 Verschachtelung
B3 = {"in": (["e1", "e2"], [0, 1], PAL[0]), "d1": (["d1", "d1-meld", "meld"], [3, 4], PAL[1]), "else1": (["d1-p"], [5], PAL[4]), "p": (["p"], [6], PAL[2]),
      "d2": (["d2"], [7], PAL[5]), "u": (["u1", "u2", "d2-u1", "d2-u2"], [8, 9, 10], PAL[3]), "aus": (["a", "bus-a"], [11], PAL[0])}
def sc3(f, t, ct):
    heading(f, t, "Verschachtelt: ein if im else")
    names = ["in"]
    if t > ct(1): names += ["d1", "else1"]
    if t > ct(1) + 3.0: names += ["p", "d2"]
    if t > ct(2) - 0.2: names += ["u", "aus"]
    keys, lines = cols_of(names, B3)
    act = None
    if ct(1) < t < ct(1) + 3.0: act = {3, 4, 5}
    elif ct(1) + 3.0 < t < ct(2) - 0.2: act = {6, 7}
    elif ct(2) - 0.2 < t < ct(3): act = set(range(7, 12))
    elif t > ct(3): act = {5, 9}
    times = [ct(0) + 0.2, ct(0) + 0.8, 1e9, ct(0) + 1.6, ct(0) + 2.4, ct(1) + 0.4, ct(1) + 3.2, ct(1) + 4.4, ct(2) + 0.4, ct(2) + 1.0, ct(2) + 1.6, ct(2) + 2.2]
    code_view(f, t, FULL, lines, act, times=times, lh=26)
    pap_view(f, ap(t, 0.2, 0.3), FD, FBOX, (0, 0), hl=keys, zoom=FZ)
    note(f, t, ct(2) + 0.4, 40, 484, CW, 84, "Ebene = Einrückschritt", ["Raute im Zweig: eine Stufe tiefer eingerückt"], PAL[5], bsz=24)
    note(f, t, ct(3) + 0.4, 40, 580, CW, 84, "else unter seinem if", ["gleiche Einrückung, gleiche Ebene"], PAL[4], bsz=24)

# ---------------------------------------------------------------- 4 Plausibilitaet
def sc4(f, t, ct):
    heading(f, t, "Eingabe prüfen: plausibel?")
    if t < ct(2) - 0.2:
        code_view(f, t, SEQ, {2: PAL[3]}, {2}, times=[-1] * 4)
        ents = [(ct(0) + 4.0, [("Spannung in MPa: 0", CODE_T)]), (ct(0) + 4.8, [("Streckgrenze in MPa: 240", CODE_T)]), (ct(1) + 0.6, [(ZDE, CODE_R)])]
        f.el(ap(t, ct(0) + 3.8, 0.4), lambda d, dy: console_panel(d, 40, 330 + dy, CW, 130, ents, t, 18, lh=28))
        keys = {"p": PAL[3]} if t > ct(1) else {}
        pap_view(f, ap(t, 0.2, 0.3), SEQD, (660, 108, 590, 570), (30, 0), hl=keys, zoom=1.08)
        note(f, t, ct(1) + 1.6, 40, 490, CW, 96, "Abbruch", ["nach dem Fehler läuft nichts mehr:", "auch print wird nicht ausgeführt"], RED, bsz=24)
    else:
        names = ["d1"]
        keys = {"d1": PAL[1], "d1-meld": PAL[1], "meld": PAL[2]}
        lines = {3: PAL[1], 4: PAL[2]}
        act = {3} if t < ct(3) else {3, 4}
        if t > ct(4) - 0.2: act = {3, 4}
        times = [-1] * 12
        code_view(f, t, FULL, lines, act, times=times, lh=26)
        pap_view(f, ap(t, ct(2), 0.3), FD, FBOX, (0, 0), hl=keys, zoom=FZ)
        note(f, t, ct(2) + 0.6, 40, 484, CW, 84, "Plausibel", ["der Wert ist physikalisch möglich"], GREEN, bsz=24, tout=ct(3) - 0.2)
        note(f, t, ct(3) + 0.4, 40, 484, CW, 84, "or: eine wahre Bedingung genügt", ["spannung <= 0  oder  streckgrenze <= 0"], PAL[1], bsz=24)
        note(f, t, ct(4) + 0.3, 40, 580, CW, 84, "Dann", ["nur die Meldung, keine Rechnung"], PAL[2], bsz=24)

# ---------------------------------------------------------------- 5 elif
def sc5(f, t, ct):
    heading(f, t, "Drei Ausgänge: verschachtelt oder elif")
    cols1 = {}; cols2 = {}
    if t > ct(1): cols1 = {0: PAL[0], 1: PAL[1], 2: PAL[4], 3: PAL[0], 4: PAL[1], 5: PAL[4], 6: PAL[3]}
    if t > ct(1) + 3.0: cols2 = {0: PAL[0], 1: PAL[1], 2: PAL[0], 3: PAL[1], 4: PAL[4], 5: PAL[3]}
    def panels(d, dy):
        code_c(d, 40, 108 + dy, 560, NEST, [-1] * 7, t, 17, 25, cols1, None, off=50, title="verschachtelt")
        code_c(d, 640, 108 + dy, 600, ELIF, [-1] * 6, t, 17, 25, cols2, None, off=50, title="mit elif")
    f.el(ap(t, ct(0) + 0.4, 0.4), panels)
    keys = {}
    if ct(2) < t < ct(3): keys = {"d2": RED, "d1-d2": RED}
    pap_view(f, ap(t, ct(0) + 0.6, 0.4), ED, (40, 350, 1210, 220), (0, 0), hl=keys, zoom=1.25)
    note(f, t, ct(2) + 0.6, 40, 584, 560, 100, "elif", ["Raute direkt im nein-Zweig", "einer Raute"], PAL[0], bsz=24, tout=ct(3) - 0.2)
    note(f, t, ct(3) + 0.4, 40, 584, 560, 100, "Der erste Treffer gewinnt", ["Bereiche der Reihe nach prüfen"], GREEN, bsz=24, tout=ct(4) - 0.2)
    note(f, t, ct(4) + 0.4, 640, 584, 600, 100, "Verschachteln", ["wenn die zweite Frage nur in", "einem Zweig sinnvoll ist"], PAL[4], bsz=24)

# ---------------------------------------------------------------- 6 Testfaelle
def sc6(f, t, ct):
    heading(f, t, "Testfälle: ein Test je Weg")
    X0 = 40; cw = [170, 140, 270]
    rt = [ct(2) + 0.4 + i * 3.6 for i in range(4)]
    def table(d, dy):
        y = 112 + dy
        for j, (hd, w_, x_) in enumerate(zip(["Test", "Eingaben", "Erwartung"], cw, [X0, X0 + cw[0], X0 + cw[0] + cw[1]])):
            d.rectangle((x_, y, x_ + w_ - 4, y + 42), fill=DARK); T2(d, x_ + 12, y + 8, hd, F(22, 700), WHITE)
        for i, (name, ein, erw) in enumerate(TESTS):
            a = ap(t, rt[i], 0.4)
            if a <= 0: continue
            yy = y + 50 + i * 62; col = mix(BG, PAL[i], a)
            d.rounded_rectangle((X0, yy, X0 + 580, yy + 54), 8, fill=mix(BG, WHITE, a), outline=col, width=3)
            d.rectangle((X0, yy, X0 + 8, yy + 54), fill=col)
            T2(d, X0 + 22, yy + 13, f"{i+1}  {name}", F(22, 600), mix(BG, DARK, a))
            T2(d, X0 + cw[0] + 8, yy + 13, f"{ein[0]} / {ein[1]}", F(22, 400), mix(BG, DARK, a))
            sz = 22
            while F(sz, 400).getlength(erw) > 250 and sz > 15: sz -= 1
            if t >= rt[i] + 2.4: T2(d, X0 + cw[0] + cw[1] + 8, yy + 13, erw, F(sz, 400), DARK)
    f.el(ap(t, ct(1) + 0.3, 0.4), table)
    # aktueller Weg im Plan
    cur = None
    for i in range(4):
        if rt[i] <= t < rt[i] + 3.6: cur = i
    hl = {}; mk = None
    if cur is not None:
        keys = PATHS[cur]; poly = FD.route(keys); ph = clamp((t - rt[cur]) / 2.4)
        done = ph * sum(math.dist(a, b) for a, b in zip(poly, poly[1:])); acc = 0.0
        for k in keys:
            pts = FD.edges[k[1:]].pts[::-1] if k.startswith("~") else FD.edges[k].pts
            l = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
            if acc + l <= done + 0.5: hl[k] = PAL[cur]
            acc += l
        mx, my = along(poly, ph)
        for k, nd in FD.nodes.items():
            x0, y0, x1, y1 = nd.bbox(); hit = x0 - 6 <= mx <= x1 + 6 and y0 - 6 <= my <= y1 + 6
            for ek in list(hl):
                if ek in FD.edges:
                    ex, ey = FD.edges[ek].pts[-1]
                    if x0 - 3 <= ex <= x1 + 3 and y0 - 3 <= ey <= y1 + 3: hit = True
            if k == "s" or hit: hl[k] = PAL[cur]
        mk = (mx, my)
    pap_view(f, ap(t, ct(0) + 0.4, 0.4), FD, FBOX, (0, 0), hl=hl, marker=mk, zoom=FZ)
    note(f, t, ct(1) + 1.0, 40, 440, 580, 96, "Überdeckung", ["jeder Weg mindestens einmal durchlaufen"], PAL[1], tout=ct(2) - 0.2, bsz=24)
    note(f, t, ct(2) + 14.0, 40, 440, 580, 96, "Vorhersagen, dann vergleichen", ["erst das erwartete Ergebnis aufschreiben,", "dann Python laufen lassen"], GREEN, bsz=24)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vom PAP", F(100, 700), DARK)
        T2(d, 90, 272, "zum Code", F(100, 700), DARK)
        T2(d, 90, 410, "Symbol für Symbol übersetzen", F(46, 400), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        code_c(d, 90, 490, 560, IFE[:4], [-1] * 4, 9, 20, 30, {0: PAL[0], 1: PAL[1], 2: PAL[4], 3: PAL[3]}, None, title=None, off=50)
    f.el(1, fn)
    f.img.paste(FD.render((470, 330), (FB[0] - 6, 252), hl={"d2": PAL[0], "u1": PAL[1], "u2": PAL[3], "d2-u1": PAL[1], "d2-u2": PAL[3]}, zoom=0.95), (740, 330)); f.img.save(path)

if __name__ == "__main__":
    modus(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
