"""V05 Python: Vom Struktogramm zum Code (Block-fuer-Block-Uebersetzung, if/elif, Plausibilisieren, Testfaelle).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from ns import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-python"; LABEL = "DHBW · Informatik · V05 · Vom Struktogramm zum Code"

SRC = [
 ["Ein Struktogramm lässt sich fast mechanisch in Python übersetzen: Block für Block.",
  "Links das Struktogramm, rechts der Code, und gleiche Farbe heißt: gehört zusammen.",
  "Aus jeder Eingabe wird eine Zeile: `float(input(...))` liest eine Kommazahl ein.",
  "Die Namen der Variablen übernimmst du aus dem Struktogramm, dann findet jeder die Stelle wieder.",
  "Dieses Muster wendest du ab jetzt bei jeder Aufgabe an."],
 ["Die Verzweigung wird zu `if` und `else`.",
  "Die Bedingung aus dem Dreieck steht hinter `if`, gefolgt von einem Doppelpunkt.",
  "Der ja-Zweig steht eingerückt darunter, der nein-Zweig eingerückt unter `else`.",
  "Einrückung heißt: vier Leerzeichen weiter rechts. Sie ist kein Schmuck, sie bestimmt, was zu welchem Zweig gehört.",
  "Der Doppelpunkt darf nicht fehlen, sonst meldet Python einen Fehler."],
 ["Steckt im nein-Zweig eine weitere Verzweigung, steckt im Code ein `if` im `else`.",
  "Jede Ebene im Struktogramm ergibt eine Einrückebene mehr.",
  "Das `else` steht genau unter seinem `if`, sonst gehört es zu einem anderen Block.",
  "Zähle die Ebenen im Struktogramm, dann stimmt auch die Einrückung im Code."],
 ["Wir prüfen die Eingabe zuerst, denn bei einer Spannung von 0 bricht die Division ab.",
  "Python meldet einen [[ZeroDivisionError|Zero Division Error]], und danach kommt keine Ausgabe mehr.",
  "Ein `if` vor der Rechnung fängt solche Werte ab: Plausibel heißt, der Wert ist physikalisch möglich.",
  "Auch eine negative Spannung ergibt keinen Sinn, deshalb prüfen wir `spannung <= 0`.",
  "So schützt ein einziges `if` das ganze Programm vor unsinnigen Werten."],
 ["Bei drei Ausgängen hast du zwei Möglichkeiten.",
  "Links verschachtelt, ein `if` im `else`, rechts mit `elif`, der Kurzform für `else` und gleich wieder `if`.",
  "Beide liefern dasselbe.",
  "Nimm `elif` für gleichrangige Bereiche, die der Reihe nach geprüft werden: Der erste Treffer gewinnt.",
  "Verschachtle, wenn die zweite Frage nur in einem Zweig Sinn ergibt, wie die Rechnung nach der Prüfung.",
  "Bei vielen Bereichen bleibt `elif` übersichtlich, tiefe Verschachtelung wird schnell unlesbar.",
  "Entscheidend ist, dass du beim Lesen sofort siehst, welche Fälle zusammengehören."],
 ["Ob der Code stimmt, zeigen Testfälle, die du aus dem Struktogramm ableitest.",
  "Die Regel: Jeder Zweig wird mindestens einmal durchlaufen.",
  "Unser Struktogramm hat drei Wege, also drei Tests, dazu ein Grenzfall: Bei genau 1,5 gilt noch ausreichend.",
  "Du sagst das Ergebnis vorher und vergleichst es mit der Ausgabe von Python.",
  "Stimmt ein Test nicht, weißt du sofort, in welchem Zweig du suchen musst."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung
CODE = ['spannung = float(input("Vorhandene Spannung in MPa: "))',
        'streckgrenze = float(input("Streckgrenze in MPa: "))',
        '',
        'if spannung <= 0 or streckgrenze <= 0:',
        '    print("Eingabe unplausibel")',
        'else:',
        '    sicherheit = streckgrenze / spannung',
        '    if sicherheit >= 1.5:',
        '        print("Sicherheit ausreichend:", round(sicherheit, 2))',
        '    else:',
        '        print("Sicherheit zu gering:", round(sicherheit, 2))']
SRCTEXT = "\n".join(CODE)
TESTS = [("unplausibel", ("0", "235"), "Eingabe unplausibel"), ("ausreichend", ("100", "235"), "Sicherheit ausreichend: 2.35"),
         ("zu gering", ("180", "235"), "Sicherheit zu gering: 1.31"), ("Grenzfall", ("100", "150"), "Sicherheit ausreichend: 1.5")]
for _, ein, erw in TESTS:
    out = run_in(SRCTEXT, ein); assert len(out) == 3 and out[2] == erw, out
assert 235 / 100 == 2.35 and round(235 / 180, 2) == 1.31 and 150 / 100 == 1.5
# Fehlerfall ohne Pruefung (nur zur Kontrolle der angezeigten Meldung)
try:
    run_in('s = float(input("a"))\nk = float(input("b"))\nx = k / s\nprint(round(x, 2))', ("0", "235")); raise AssertionError("kein Fehler")
except ZeroDivisionError as e:
    ZDE = f"{type(e).__name__}: {e}"
assert ZDE == "ZeroDivisionError: float division by zero", ZDE
NEST = ['if spannung <= 140:', '    werkstoff = "S235JR"', 'else:', '    if spannung <= 220:', '        werkstoff = "C45E"', '    else:', '        werkstoff = "42CrMo4"']
ELIF = ['if spannung <= 140:', '    werkstoff = "S235JR"', 'elif spannung <= 220:', '    werkstoff = "C45E"', 'else:', '    werkstoff = "42CrMo4"']
for sp in (1, 100, 140, 141, 200, 220, 221, 300):
    g1 = {"spannung": sp}; g2 = {"spannung": sp}; exec("\n".join(NEST), g1); exec("\n".join(ELIF), g2)
    assert g1["werkstoff"] == g2["werkstoff"]
assert [(lambda g: (exec("\n".join(ELIF), g), g["werkstoff"])[1])({"spannung": v}) for v in (140, 220, 221)] == ["S235JR", "C45E", "42CrMo4"]
fit_check(CODE, M(18), 690 - 56 - 14, "Code")

# ---------------------------------------------------------------- Struktogramm
def DIAG():
    return [A("Eingabe: spannung in MPa", "ein1"), A("Eingabe: streckgrenze in MPa", "ein2"),
            IF("spannung ≤ 0 oder\nstreckgrenze ≤ 0", [A("Ausgabe:\nEingabe unplausibel", "meld")],
               [A("sicherheit =\nstreckgrenze / spannung", "rech"),
                IF("sicherheit ≥ 1,5 ?", [A("Ausgabe:\nausreichend", "ok")], [A("Ausgabe:\nzu gering", "zu")], key="if2")],
               key="if1", split=0.32)]

BIND = {
    "ein": (["ein1", "ein2"], [0, 1], PAL[0]),
    "if1": (["if1"], [3], PAL[1]), "meld": (["meld"], [4], PAL[2]), "nein": (["rech", "if2", "ok", "zu"], [5, 6, 7, 8, 9, 10], PAL[4]),
    "rech": (["rech"], [6], PAL[5]), "if2": (["if2"], [7], PAL[1]), "ok": (["ok"], [8], PAL[2]), "zu": (["zu"], [10], PAL[3]),
    "else2": ([], [9], PAL[4]),
}
def binds(names):
    keys = {}; lines = {}
    for n in names:
        ks, ls, col = BIND[n]
        for k in ks: keys[k] = col
        for l in ls: lines[l] = col
    return keys, lines

CX, CW, CSZ, CLH, CY = 560, 690, 18, 27, 110
DX, DW = 30, 510
NSX = lambda **kw: NS(fs=18, pv=7, **kw)
def code_view(f, t, cols, active=None, times=None, y=CY):
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_c(d, CX, y + dy, CW, CODE, times or [-1] * len(CODE), t, CSZ, CLH, cols, active, off=56))
def diag_view(f, t, hl=None, vis=None):
    ns = NSX(fill=hl_fill(hl or {}), vis=vis)
    f.el(ap(t, 0.0, 0.3), lambda d, dy: ns.draw(d, DIAG(), DX, CY + dy, DW))
NY = 500   # Hinweiskarten unter dem Diagramm

# ---------------------------------------------------------------- 1 Block fuer Block
def sc1(f, t, ct):
    heading(f, t, "Block für Block übersetzen")
    if t > ct(0) + 0.3: diag_view(f, t, binds(["ein"])[0] if t > ct(1) + 3.0 else {})
    if t > ct(1) + 0.2:
        cols = binds(["ein"])[1] if t > ct(1) + 3.0 else {}
        tm = [ct(1) + 0.2 + i * 0.35 for i in range(len(CODE))]
        code_view(f, t, cols, None, tm)
    note(f, t, ct(2) + 0.6, DX, NY, DW, 110, "Ein Block, eine Zeile", ["Eingabe-Block: eine Zeile mit float(input(...))", "Die Reihenfolge von oben nach unten bleibt."], PAL[0])

# ---------------------------------------------------------------- 2 Verzweigung
def sc2(f, t, ct):
    heading(f, t, "Verzweigung wird if und else")
    if t < ct(2) - 0.2: names = ["if1"]
    else: names = ["if1", "meld", "nein"]
    keys, lines = binds(names)
    if t < ct(2) - 0.2: act = {3}
    elif t < ct(3) - 0.2: act = {3, 4, 5, 6, 7, 8, 9, 10}
    else: act = {4, 5, 6, 7, 8, 9, 10}
    if t < ct(2) - 0.2: lines = {3: PAL[1]}
    code_view(f, t, lines, act)
    diag_view(f, t, keys)
    note(f, t, ct(1) + 0.4, DX, NY, DW, 110, "Bedingung hinter if", ["die Frage aus dem Dreieck,", "danach ein Doppelpunkt"], PAL[1], tout=ct(2) - 0.2)
    note(f, t, ct(2) + 0.4, DX, NY, DW, 110, "ja oben, nein unter else", ["jeder Zweig: eingerückt darunter", "sonst wüsste Python nicht, was dazugehört"], PAL[2], tout=ct(3) - 0.2)
    note(f, t, ct(3) + 0.4, DX, NY, DW, 110, "Einrückung = vier Leerzeichen", ["gleiche Einrückung, gleicher Block", "ein Fehler hier ändert die Bedeutung"], PAL[4])

# ---------------------------------------------------------------- 3 Verschachtelung
def sc3(f, t, ct):
    heading(f, t, "Verschachtelte Verzweigung")
    names = ["rech"] + (["if2"] if t > ct(0) + 2.5 else []) + (["ok"] if t > ct(0) + 5.5 else []) + (["zu"] if t > ct(0) + 7.5 else [])
    keys, lines = binds(names)
    if t > ct(0) + 7.5: lines[9] = PAL[4]
    act = {6} if t < ct(0) + 2.5 else ({7} if t < ct(0) + 5.5 else ({8} if t < ct(0) + 7.5 else {9, 10}))
    if t > ct(1) - 0.1: act = set(range(5, 11))
    code_view(f, t, lines, act)
    diag_view(f, t, keys)
    note(f, t, ct(1) + 0.4, DX, NY, DW, 130, "Eine Ebene tiefer, vier Leerzeichen mehr",
         ["Ebene 1: if und else der Prüfung", "Ebene 2: if und else der Bewertung"], PAL[5])

# ---------------------------------------------------------------- 4 Eingabe plausibilisieren
BARE = ['spannung = float(input("Spannung in MPa: "))', 'streckgrenze = float(input("Streckgrenze in MPa: "))', 'sicherheit = streckgrenze / spannung', 'print(round(sicherheit, 2))']
def sc4(f, t, ct):
    heading(f, t, "Eingabe plausibilisieren")
    CXA, CWA = 40, 700
    if t < ct(2) - 0.2:
        f.el(ap(t, 0.0, 0.3), lambda d, dy: code_panel(d, CXA, 120 + dy, CWA, BARE, [-1] * 4, t, 20, lineno=True, hl={2} if t > ct(0) + 4 else None, title="Ohne Prüfung"))
        ents = [(ct(0) + 2.5, [("Spannung in MPa: 0", CODE_T)]), (ct(0) + 3.2, [("Streckgrenze in MPa: 235", CODE_T)]), (ct(1) + 0.6, [(ZDE, CODE_R)])]
        f.el(ap(t, ct(0) + 2.0, 0.3), lambda d, dy: console_panel(d, CXA, 340 + dy, CWA, 150, ents, t, 20, lh=30))
        note(f, t, ct(0) + 5.0, 780, 120, 460, 120, "Division durch 0", ["ist nicht definiert:", "Python bricht ab"], RED, tout=ct(2) - 0.3)
        note(f, t, ct(1) + 2.5, 780, 270, 460, 120, "Programmabbruch", ["danach läuft nichts mehr:", "keine Ausgabe, kein Ergebnis"], RED, tout=ct(2) - 0.3)
    else:
        keys, lines = binds(["if1", "meld"])
        a = ap(t, ct(2) - 0.1, 0.4)
        code_view(f, t, lines, {3, 4, 5} if True else None)
        ents = [(ct(2) + 1.8, [("Vorhandene Spannung in MPa: 0", CODE_T)]), (ct(2) + 2.6, [("Streckgrenze in MPa: 235", CODE_T)]), (ct(2) + 3.6, [("Eingabe unplausibel", CODE_G)])]
        f.el(a, lambda d, dy: console_panel(d, CX, CY + 50 + CLH * len(CODE) + 18 + 16 + dy, CW, 150, ents, t, 18, lh=28))
        diag_view(f, t, keys)
        note(f, t, ct(2) + 5.0, DX, NY, DW, 110, "Plausibel", ["physikalisch möglich: hier Spannung und", "Streckgrenze größer als 0"], PAL[1])
    if t < ct(2) - 0.2:
        pass

# ---------------------------------------------------------------- 5 verschachtelt oder elif
def sc5(f, t, ct):
    heading(f, t, "Verschachtelt oder elif?")
    lw = 560
    f.el(ap(t, ct(0) + 0.2, 0.4), lambda d, dy: code_panel(d, 40, 106 + dy, lw, NEST, [-1] * len(NEST), t, 20, lineno=False, title="Verschachtelt", lh=28))
    f.el(ap(t, ct(1) + 0.2, 0.4), lambda d, dy: code_panel(d, 640, 106 + dy, lw, ELIF, [-1] * len(ELIF), t, 20, lineno=False, title="Mit elif", lh=28))
    ns = NS(fs=18, pv=7)
    nest = [IF("spannung ≤ 140 ?", [A("S235JR")], [IF("spannung ≤ 220 ?", [A("C45E")], [A("42CrMo4")])], split=0.35)]
    el = [SW("spannung", [("≤ 140", [A("S235JR")]), ("≤ 220", [A("C45E")]), ("sonst", [A("42CrMo4")])])]
    f.el(ap(t, ct(1) + 3.0, 0.5), lambda d, dy: ns.draw(d, nest, 40, 396 + dy, lw))
    f.el(ap(t, ct(1) + 3.0, 0.5), lambda d, dy: ns.draw(d, el, 640, 396 + dy, lw))
    note(f, t, ct(2) + 0.2, 40, 596, lw, 84, "Zwei Ebenen", ["die Fälle stehen schräg gestaffelt"], PAL[4], tout=ct(3) - 0.3, bsz=24)
    note(f, t, ct(2) + 0.2, 640, 596, lw, 84, "Eine Ebene", ["die Fälle stehen flach untereinander"], PAL[1], tout=ct(3) - 0.3, bsz=24)
    note(f, t, ct(3) + 0.3, 640, 596, lw, 84, "elif: gleichrangige Bereiche", ["der erste Treffer gewinnt"], PAL[1], tout=ct(4) - 0.3, bsz=24)
    note(f, t, ct(4) + 0.3, 40, 596, lw, 84, "Verschachteln: Frage nur im Zweig", ["die Rechnung nach der Prüfung"], PAL[4], bsz=24)

# ---------------------------------------------------------------- 6 Testfaelle
def sc6(f, t, ct):
    heading(f, t, "Testfälle aus dem Struktogramm")
    PATHS = [["ein1", "ein2", "if1", "meld"], ["ein1", "ein2", "if1", "rech", "if2", "ok"], ["ein1", "ein2", "if1", "rech", "if2", "zu"], ["ein1", "ein2", "if1", "rech", "if2", "ok"]]
    rt = [ct(2) + 0.8, ct(2) + 3.0, ct(2) + 5.2, ct(2) + 8.0]
    hl = {}
    for i, p in enumerate(PATHS):
        if t >= rt[i]:
            if i == 3: hl = {k: PAL[3] for k in p}
            else: hl = {k: PAL[i] for k in p}
        if i < 3 and t >= rt[i]: pass
    if t >= ct(1) and t < rt[0]: hl = {}
    diag_view(f, t, hl)
    X0 = 590; cw = [160, 150, 340]
    def table(d, dy):
        y = 120 + dy
        d.rounded_rectangle((X0, y, X0 + 650, y + 44), 8, fill=DARK)
        T2(d, X0 + 14, y + 8, "Test", F(24, 700), WHITE); T2(d, X0 + cw[0] + 14, y + 8, "Eingaben", F(24, 700), WHITE); T2(d, X0 + cw[0] + cw[1] + 14, y + 8, "Ausgabe von Python", F(24, 700), WHITE)
        for i, (name, ein, erw) in enumerate(TESTS):
            a = ap(t, rt[i], 0.4)
            if a <= 0: continue
            yy = y + 56 + i * 64
            col = mix(BG, PAL[i], a)
            d.rounded_rectangle((X0, yy, X0 + 650, yy + 56), 8, fill=mix(BG, WHITE, a), outline=col, width=3)
            d.rectangle((X0, yy, X0 + 8, yy + 56), fill=col)
            T2(d, X0 + 22, yy + 14, f"{i+1}  {name}", F(24, 600), mix(BG, DARK, a))
            T2(d, X0 + cw[0] + 14, yy + 14, f"{ein[0]} / {ein[1]}", F(24, 400), mix(BG, DARK, a))
            if t >= ct(3) + 0.2 + i * 0.5:
                T2(d, X0 + cw[0] + cw[1] + 14, yy + 14, erw, F(24, 400), DARK)
                check(d, X0 + 650 - 44, yy + 14, GREEN, 1.1)
    f.el(ap(t, ct(2) + 0.3, 0.4), table)
    note(f, t, ct(1) + 0.4, DX, NY, DW, 110, "Überdeckung", ["jeder Zweig mindestens einmal", "durchlaufen"], PAL[1], tout=ct(2) + 0.2)
    note(f, t, ct(2) + 0.6, DX, NY, DW, 110, "Spalte Eingaben", ["spannung / streckgrenze in MPa", "bei 100 / 150 genau 1,5: Grenzfall"], PAL[3], tout=ct(3) - 0.2)
    note(f, t, ct(3) + 0.4, DX, NY, DW, 110, "Vorhersagen, dann vergleichen", ["erst das erwartete Ergebnis aufschreiben,", "dann Python laufen lassen"], GREEN)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vom Struktogramm", F(88, 700), DARK)
        T2(d, 90, 262, "zum Code", F(88, 700), DARK)
        T2(d, 90, 380, "Block für Block übersetzen", F(48, 400), GREY)
        ns = NS(fs=16, pv=6)
        ns.draw(d, [A("Eingabe: spannung in MPa"), IF("spannung ≤ 0 ?", [A("Meldung")], [A("rechnen")])], 90, 460, 420)
        code_c(d, 560, 456, 560, ['spannung = float(input("..."))', 'if spannung <= 0:', '    print("unplausibel")', 'else:', '    ...'], [-1] * 5, 9, 17, 27,
               {0: PAL[0], 1: PAL[1], 2: PAL[2]}, None, title="Python", off=56)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else "full"
    if m == "text": text_modus(SRC)
    elif m == "fake": fake_audio(HERE, SECS)
    elif m == "tts": tts_safe(HERE, SECS)
    else: dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
