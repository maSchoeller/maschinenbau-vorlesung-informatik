"""V04 Python: if, elif, else, Entscheidungen in Python.
Aufruf: python render.py [text|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
from b4 import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v04-python"; LABEL = "DHBW · Informatik · V04 · if, elif, else"

SRC = [
 ["In Python gibt es einen eigenen Datentyp für Wahrheitswerte: `bool`.",
  "Er hat genau zwei Werte, `True` und `False`, beide mit großem Anfangsbuchstaben.",
  "Meist entsteht ein `bool` durch einen Vergleich: `druck > 150` ist bei einem Druck von 180 wahr.",
  "Mit `type()` siehst du: Das Ergebnis ist ein `bool`, kein Text."],
 ["Python kennt sechs Vergleichsoperatoren: gleich, ungleich, kleiner, größer, kleiner gleich und größer gleich.",
  "Beachte das doppelte Gleichheitszeichen: Ein einzelnes steht für die Zuweisung, ein doppeltes für den Vergleich.",
  "`druck = 180` legt den Wert fest, `druck == 180` fragt, ob er gleich 180 ist.",
  "Ungleich schreibst du mit Ausrufezeichen und Gleichheitszeichen."],
 ["Mehrere Bedingungen verknüpfst du mit `and`, `or` und `not`: und, oder, nicht.",
  "`and` ist wahr, wenn beide Seiten wahr sind, `or`, wenn eine genügt, und `not` kehrt den Wert um.",
  "Einen Bereich schreibst du so: `150 <= druck <= 210` prüft, ob der Druck zwischen 150 und 210 liegt.",
  "Das ist dasselbe wie `druck >= 150 and druck <= 210`, nur kürzer.",
  "Es gilt: `not` vor `and` vor `or`; im Zweifel setzt du Klammern."],
 ["Mit `if` entscheidet das Programm: Nur wenn die Bedingung wahr ist, läuft der eingerückte Block darunter.",
  "Mit `elif`, kurz für else if, folgt eine weitere Prüfung, aber nur, wenn die erste falsch war.",
  "`else` fängt alles ab, was übrig bleibt, und braucht keine Bedingung.",
  "Bei einem Druck von 180 sind die ersten beiden Bedingungen falsch, also läuft der Block unter `else`.",
  "Es läuft nur der erste Zweig mit wahrer Bedingung."],
 ["Zwei Dinge sind Pflicht: der Doppelpunkt am Zeilenende und die Einrückung.",
  "Der Doppelpunkt sagt Python: Jetzt folgt ein Block. Die Einrückung, üblich sind vier Leerzeichen, sagt, welche Zeilen dazugehören.",
  "Anders als in vielen anderen Sprachen gibt es keine geschweiften Klammern: Die Einrückung ist die Struktur."],
 ["Jetzt die häufigsten Fehler. Erstens: ein einzelnes Gleichheitszeichen in der Bedingung. Python meldet einen `SyntaxError`.",
  "Zweitens: der vergessene Doppelpunkt, wieder ein `SyntaxError`.",
  "Drittens: fehlt die Einrückung, kommt ein `IndentationError`.",
  "Lies eine Fehlermeldung immer von unten: Die letzte Zeile nennt Art und Ursache."],
 ["Zum Schluss eine Falle aus der letzten Lektion: Vergleiche Kommazahlen nie mit `==`.",
  "[[0.1 + 0.2 == 0.3|null Komma eins plus null Komma zwei gleich gleich null Komma drei]] ergibt `False`, weil Floats nur angenähert gespeichert werden.",
  "Nimm stattdessen `math.isclose` nach `import math`: Das vergleicht mit einer kleinen Toleranz und liefert `True`.",
  "Prüfe Messwerte also mit Toleranz oder mit Bereichen.",
  "Probier alles selbst aus!"],
]
SECS = make_secs(SRC)   # Untertitel = anzeige(text), Audio = sprechfassung(text)

# SCENES-FOLGEN
import traceback

def OUT(lines):
    """Echte Ausgabe des Codes (Zeilenliste) fuer die Konsole."""
    return run("\n".join(lines))

def pg(t0, code, ctimes, outs, otimes, hl=None, tiles=(), ocols=None):
    ocols = ocols or [CODE_T] * len(outs)
    assert len(outs) == len(otimes)
    return dict(t0=t0, code=[(ctimes[i], c) for i, c in enumerate(code)], out=[(otimes[i], O(o, ocols[i])) for i, o in enumerate(outs)],
                tiles=list(tiles), hl=hl)

# ---------------------------------------------------------------- 1 bool
C1 = ["print(True)", "print(False)", "druck = 180", "print(druck > 150)", "print(type(druck > 150))"]
O1 = OUT(C1)
assert O1 == ["True", "False", "True", "<class 'bool'>"]
CT1 = [(1, 0.5), (1, 2.2), (2, 0.5), (2, 2.0), (3, 0.4)]
def sc1(f, t, ct):
    heading(f, t, "1 · Der Datentyp bool")
    NT = [(9, 0)] * 5
    page_scene(f, t, ct, [
      dict(t0=(0, 0.3), code=[((9, 0), c) for c in C1], out=[], tiles=[((0, 0.8), "bool", "Datentyp für Wahrheitswerte", DARK)]),
      pg((1, -0.2), C1, CT1, O1[:2], [(1, 1.3), (1, 3.0)], tiles=[((1, 0.6), "True", "wahr", GREEN), ((1, 2.3), "False", "falsch", DARK)]),
      pg((2, -0.2), C1, CT1, O1[:3], [(1, 1.3), (1, 3.0), (2, 3.0)], tiles=[((2, 0.6), "druck > 150", "Vergleich liefert True", DARK)]),
      pg((3, -0.2), C1, CT1, O1, [(1, 1.3), (1, 3.0), (2, 3.0), (3, 1.8)], tiles=[((3, 0.6), "type()", "zeigt bool, keinen Text", GREEN)]),
    ], code_size=26, con_size=24)

# ---------------------------------------------------------------- 2 Vergleichsoperatoren
OPS = [("==", "gleich", "druck == 180"), ("!=", "ungleich", "druck != 180"), ("<", "kleiner", "druck < 150"),
       (">", "größer", "druck > 150"), ("<=", "kleiner gleich", "druck <= 210"), (">=", "größer gleich", "druck >= 210")]
RES2 = [eval(ex, {"druck": 180}) for _, _, ex in OPS]
assert RES2 == [True, False, False, True, True, False]
def sc2(f, t, ct):
    heading(f, t, "2 · Vergleichsoperatoren")
    cols = [(60, 150), (216, 270), (492, 300), (798, 170)]
    def tb(d, dy):
        for (x, w), hd in zip(cols, ["Operator", "Bedeutung", "Beispiel mit druck = 180", "Ergebnis"]):
            if hd == "Beispiel mit druck = 180" or hd == "Ergebnis":
                if t < ct(2) + 0.3: continue
            cell4(d, x, 130 + dy, w, 48, hd, F(23, 700), WHITE, DARK, DARK)
        for k, (op, nm, ex) in enumerate(OPS):
            if t < ct(0) + 0.8 + k * 1.05: continue
            y = 186 + k * 58 + dy
            hl = (k == 0 and ct(1) <= t < ct(3)) or (k == 1 and t >= ct(3))
            if hl: d.rounded_rectangle((52, y - 4, 976, y + 54), 12, outline=RED, width=4)
            cell4(d, cols[0][0], y, cols[0][1], 50, op, M(30, True), RED if hl else DARK)
            cell4(d, cols[1][0], y, cols[1][1], 50, nm, F(28, 600), DARK)
            if t >= ct(2) + 0.3:
                cell4(d, cols[2][0], y, cols[2][1], 50, ex, M(26, True), DARK)
                cell4(d, cols[3][0], y, cols[3][1], 50, str(RES2[k]), M(26, True), WHITE, GREEN if RES2[k] else GREY2, ol=GREEN if RES2[k] else GREY2)
    f.el(ap(t, ct(0) + 0.3, 0.4), tb)
    def eq(d, dy):
        cell4(d, 60, 572 + dy, 460, 80, "", F(26, 600), fill=WHITE)
        T2(d, 84, 612 + dy, "=", M(34, True), RED, "lm"); T2(d, 130, 612 + dy, "Zuweisung:", F(26, 600), GREY, "lm"); T2(d, 290, 612 + dy, "druck = 180", M(26, True), DARK, "lm")
        cell4(d, 540, 572 + dy, 460, 80, "", F(26, 600), fill=WHITE)
        T2(d, 564, 612 + dy, "==", M(34, True), RED, "lm"); T2(d, 630, 612 + dy, "Vergleich:", F(26, 600), GREY, "lm"); T2(d, 790, 612 + dy, "druck == 180", M(26, True), DARK, "lm")
    show(f, t, ct(1) + 0.4, eq)

# ---------------------------------------------------------------- 3 and / or / not / Bereich
C3 = ["druck = 180", "tuer_zu = True", "print(tuer_zu and druck > 200)", "print(tuer_zu or druck > 200)", "print(not tuer_zu)",
      "print(150 <= druck <= 210)", "print(druck >= 150 and druck <= 210)"]
O3 = OUT(C3)
assert O3 == ["False", "True", "False", "True", "True"]
CT3 = [(0, 0.6), (0, 1.8), (1, 0.5), (1, 3.4), (1, 6.4), (2, 0.4), (3, 0.4)]
OT3 = [(1, 1.8), (1, 4.7), (1, 7.4), (2, 3.4), (3, 3.2)]
OC3 = [CODE_R, CODE_G, CODE_R, CODE_G, CODE_G]
def sc3(f, t, ct):
    heading(f, t, "3 · and, or, not und Bereiche")
    pgs = [dict(t0=(0, 0.3), code=[(CT3[i], c) for i, c in enumerate(C3)], out=[], hl=None, tiles=[((0, 1.2), "and · or · not", "und, oder, nicht", DARK)])]
    pgs.append(pg((1, -0.2), C3, CT3, O3[:3], OT3[:3], tiles=[((1, 0.8), "and", "beide Seiten wahr", DARK), ((1, 3.7), "or", "mindestens eine Seite wahr", DARK), ((1, 6.7), "not", "kehrt den Wert um", DARK)], ocols=OC3))
    pgs.append(pg((2, -0.2), C3, CT3, O3[:4], OT3[:4], hl={5}, tiles=[((2, 0.6), "Bereich", "150 <= druck <= 210", GREEN)], ocols=OC3))
    pgs.append(pg((3, -0.2), C3, CT3, O3, OT3, hl={6}, tiles=[((3, 0.6), "gleichwertig", "and verknüpft zwei Vergleiche", DARK)], ocols=OC3))
    pgs.append(pg((4, -0.2), C3, CT3, O3, OT3, tiles=[((4, 0.4), "not, and, or", "Rangfolge; im Zweifel Klammern", RED)], ocols=OC3))
    page_scene(f, t, ct, pgs, code_size=22, con_size=20)

# ---------------------------------------------------------------- 4 if / elif / else
C4 = ["druck = 180", "if druck < 150:", '    print("Druck zu niedrig")', "elif druck > 210:", '    print("Druck zu hoch")', "else:", '    print("Druck im Bereich")']
O4 = OUT(C4); assert O4 == ["Druck im Bereich"]
CT4 = [(0, 0.2), (0, 0.8), (0, 2.0), (1, 0.5), (1, 1.7), (2, 0.4), (2, 1.5)]
def sc4(f, t, ct):
    heading(f, t, "4 · if, elif, else")
    o = [(3, 5.2)]
    page_scene(f, t, ct, [
      pg((0, 0.3), C4, CT4, [], [], hl={1, 2}, tiles=[((0, 3.0), "if", "Block nur bei wahrer Bedingung", DARK)]),
      pg((1, -0.2), C4, CT4, [], [], hl={3, 4}, tiles=[((1, 0.8), "elif", "weitere Prüfung, nur falls vorher falsch", DARK)]),
      pg((2, -0.2), C4, CT4, [], [], hl={5, 6}, tiles=[((2, 0.6), "else", "alles Übrige, ohne Bedingung", DARK)]),
      pg((3, -0.2), C4, CT4, [], [], hl={1}, tiles=[((3, 0.3), "180 < 150", "False: nächste Prüfung", RED)]),
      pg((3, 2.6), C4, CT4, [], [], hl={3}, tiles=[((3, 0.3), "180 < 150", "False", RED), ((3, 2.8), "180 > 210", "False: weiter zu else", RED)]),
      pg((3, 4.8), C4, CT4, O4, o, hl={5, 6}, tiles=[((3, 0.3), "180 < 150", "False", RED), ((3, 2.8), "180 > 210", "False", RED), ((3, 5.0), "else", "läuft: Druck im Bereich", GREEN)], ocols=[CODE_G]),
      pg((4, -0.2), C4, CT4, O4, o, tiles=[((4, 0.5), "ein Zweig", "nur der erste mit wahrer Bedingung", GREEN)], ocols=[CODE_G]),
    ], code_size=26, con_size=24)

# ---------------------------------------------------------------- 5 Doppelpunkt und Einrueckung
C5 = ["if druck > 210:", '    print("Druck zu hoch")', 'print("Prüfung beendet")']
def sc5(f, t, ct):
    heading(f, t, "5 · Doppelpunkt und Einrückung")
    CS = 30; fm = M(CS); cw = fm.getlength("x"); lh = int(CS * 1.45); PX, PY, PW = 60, 130, 760; top = 18 + 32
    times = [ct(0) + 0.5, ct(0) + 2.2, ct(1) + 7.2]
    show(f, t, 0.1, lambda d, dy: code_panel(d, PX, PY + dy, PW, C5, times, t, CS, hl=None, title="Python", lh=lh), dur=0.3)
    def ann(d, dy):
        x0 = PX + 62
        if t >= ct(1) + 0.3:
            xc = x0 + 14 * cw; yc = PY + top + dy
            d.rounded_rectangle((xc - 6, yc - 4, xc + cw + 6, yc + lh - 8), 6, outline=CODE_R, width=4)
        if t >= ct(1) + 4.6:
            yi = PY + top + lh + dy
            d.rounded_rectangle((x0 - 4, yi - 4, x0 + 4 * cw + 4, yi + lh - 8), 6, outline=CODE_R, width=4)
            for k in range(4): d.ellipse((x0 + k * cw + cw / 2 - 2, yi + lh / 2 - 6, x0 + k * cw + cw / 2 + 2, yi + lh / 2 - 2), fill=CODE_R)
    f.el(1.0, ann)
    def tile(y, big, small, col, t0):
        def fn(d, dy):
            card(d, 850, y + dy, 370, 124)
            T2(d, 880, y + 12 + dy, big, F(34, 700), col)
            for i, ln in enumerate(small): T2(d, 880, y + 62 + i * 28 + dy, ln, F(23, 400), GREY)
        show(f, t, t0, fn)
    tile(130, "Doppelpunkt", ["am Zeilenende:", "jetzt folgt ein Block"], RED, ct(1) + 0.4)
    tile(266, "Einrückung", ["4 Leerzeichen: diese Zeile", "gehört zum if"], RED, ct(1) + 4.8)
    tile(402, "Nicht eingerückt", ["gehört nicht mehr zum", "if und läuft immer"], DARK, ct(1) + 8.6)
    show(f, t, ct(2) + 0.3, lambda d, dy: pill(d, 60, 560 + dy, 760, 64, "Keine { }: Die Einrückung ist die Struktur", DARK, size=30))

# ---------------------------------------------------------------- 6 Fehlermeldungen (echt)
def errlines(code):
    try: compile(code, "main.py", "exec")
    except SyntaxError as e:
        txt = "".join(traceback.format_exception_only(type(e), e))
        return [l.rstrip() for l in txt.splitlines() if l.strip()], type(e).__name__
    raise AssertionError("kein Fehler")
E1 = ["druck = 180", "if druck = 180:", '    print("Druck ok")']
E2 = ["druck = 180", "if druck == 180", '    print("Druck ok")']
E3 = ["druck = 180", "if druck == 180:", 'print("Druck ok")']
EL1, EN1 = errlines("\n".join(E1)); EL2, EN2 = errlines("\n".join(E2)); EL3, EN3 = errlines("\n".join(E3))
assert (EN1, EN2, EN3) == ("SyntaxError", "SyntaxError", "IndentationError")
assert EL1[-1].startswith("SyntaxError: invalid syntax") and EL2[-1] == "SyntaxError: expected ':'" and EL3[-1].startswith("IndentationError: expected an indented block after 'if' statement")
for el in (EL1, EL2, EL3): fit_check(el, M(17), 760 - 44 - 6, "Fehlermeldung")
def errpage(t0, code, el, hlidx, tiles, ctimes, base):
    ents = []
    for i, ln in enumerate(el):
        col = CODE_R if i == len(el) - 1 else (CODE_C if i == 0 else CODE_T)
        ents.append(((base[0], base[1] + 0.5 + i * 0.45), O(ln, col)))
    return dict(t0=t0, code=list(zip(ctimes, code)), out=ents, hl={hlidx}, tiles=tiles)
def sc6(f, t, ct):
    heading(f, t, "6 · Typische Fehler lesen")
    page_scene(f, t, ct, [
      errpage((0, 0.3), E1, EL1, 1, [((0, 8.0), "SyntaxError", "= statt == in der Bedingung", RED)], [(0, 3.0), (0, 3.6), (0, 4.2)], (0, 6.4)),
      errpage((1, -0.2), E2, EL2, 1, [((1, 3.6), "SyntaxError", "Doppelpunkt fehlt", RED)], [(1, 0.1), (1, 0.6), (1, 1.1)], (1, 1.8)),
      errpage((2, -0.2), E3, EL3, 2, [((2, 3.2), "IndentationError", "Einrückung fehlt", RED), ((3, 0.8), "Letzte Zeile", "nennt Art und Ursache", GREEN)], [(2, 0.1), (2, 0.6), (2, 1.1)], (2, 1.6)),
    ], code_size=26, con_size=17)

# ---------------------------------------------------------------- 7 Floats nicht mit ==
C7 = ["import math", "print(0.1 + 0.2 == 0.3)", "print(math.isclose(0.1 + 0.2, 0.3))"]
O7 = OUT(C7); assert O7 == ["False", "True"]
CT7 = [(0, 2.0), (1, 0.5), (2, 0.4)]
def sc7(f, t, ct):
    heading(f, t, "7 · Floats nie mit == vergleichen")
    page_scene(f, t, ct, [
      pg((0, 0.3), C7, CT7, [], [], tiles=[((0, 1.5), "float == float", "unsicher", RED)]),
      pg((1, -0.2), C7, CT7, O7[:1], [(1, 4.5)], hl={1}, tiles=[((1, 0.8), "0.1 + 0.2", "ist nicht exakt 0.3", RED)], ocols=[CODE_R]),
      pg((2, -0.2), C7, CT7, O7, [(1, 4.5), (2, 5.5)], hl={2}, tiles=[((2, 0.8), "math.isclose", "vergleicht mit Toleranz", GREEN)], ocols=[CODE_R, CODE_G]),
      pg((3, -0.2), C7, CT7, O7, [(1, 4.5), (2, 5.5)], tiles=[((3, 0.6), "Messwerte", "mit Toleranz oder Bereich prüfen", DARK)], ocols=[CODE_R, CODE_G]),
    ], code_size=26, con_size=24)
    def end(d, dy):
        d.rounded_rectangle((60, 590 + dy, 820, 660 + dy), 35, fill=RED)
        T2(d, 440, 625 + dy, "Probier alles selbst aus!", F(40, 700), WHITE, "mm")
    show(f, t, ct(4) + 0.2, end)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "if, elif, else", F(104, 700), DARK)
        T2(d, 90, 300, "Entscheidungen in Python", F(52, 400), GREY)
        code_panel(d, 90, 400, 700, C4, [0] * len(C4), 9, 24, lineno=False, lh=34)
        for i, (lab, c) in enumerate((("True", GREEN), ("False", DARK), ("and", DARK), ("or", DARK))):
            pill(d, 900, 400 + i * 62, 220, 50, lab, c, size=30, mono=True)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch4(HERE, SECS, SCENES, LABEL, poster, NAME)
