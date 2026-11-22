"""V12 Theorie: Testen & Debuggen. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v12-common"))
from h12 import *
from texte import SRC

NAME = "v12-theorie"; LABEL = "DHBW · Informatik · V12 · Testen & Debuggen"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung der gezeigten Ausgaben
CODE_KI = ["def zustand(t):", "    if t < 70:", '        return "normal"', "    elif t < 85:", '        return "warnung"',
           "    else:", '        return "abschalten"']
_ns = {}; exec("\n".join(CODE_KI), _ns)
assert [_ns["zustand"](v) for v in (20, 75, 90, 85)] == ["normal", "warnung", "abschalten", "abschalten"]
TEST_LINE = 'assert zustand(85) == "warnung", "Grenzwert 85 °C falsch eingeordnet"'
assert run("def zustand(t):\n    return 'abschalten'\ntry:\n    " + TEST_LINE + "\nexcept AssertionError as e:\n    print('AssertionError:', e)") == \
    ["AssertionError: Grenzwert 85 °C falsch eingeordnet"]
assert run('print(zustand_ki(85))'.replace("zustand_ki", "(lambda t: 'abschalten')")) == ["abschalten"]
try: 10 / 0
except ZeroDivisionError as _e: assert str(_e) == "division by zero"

def state_of(v): return "normal" if v < 70 else ("warnung" if v < 85 else "abschalten")
STATE_COL = {"normal": GREEN, "warnung": AMB, "abschalten": RED}

# ---------------------------------------------------------------- 1 Hook: alle Tests gruen, trotzdem Fehler
def thermo_value(t, ct):
    """(Temperatur, Fehlerfall) laut Zeitplan: erst 20, 75, 90 Grad, dann der Sprung auf 85."""
    a = ct(1)
    if t < a + 1.2: return 20.0
    if t < a + 2.6: return 75.0
    if t < ct(2) + 0.2: return 90.0
    k = ap(t, ct(2) + 0.2, 0.6)
    return lerp(90.0, 85.0, k)

def sc1(f, t, ct):
    heading(f, t, "Alle Tests grün – und doch ein Fehler")
    v = thermo_value(t, ct)
    shown = int(round(v)) if t < ct(2) + 0.2 + 0.6 else 85
    shown = 20 if t < ct(1) + 0.3 else shown
    st = state_of(shown); fail = t >= ct(2) + 0.9
    def lager(d, dy):
        card(d, 60, 124 + dy, 440, 540)
        # Lagerbock
        d.rectangle((290, 300 + dy, 410, 322 + dy), fill=(120, 128, 142), outline=DARK, width=3)
        d.rectangle((330, 270 + dy, 370, 300 + dy), fill=(150, 156, 168), outline=DARK, width=3)
        d.ellipse((298, 183 + dy, 402, 287 + dy), fill=(150, 156, 168), outline=DARK, width=4)
        d.ellipse((322, 207 + dy, 378, 263 + dy), fill=WHITE, outline=DARK, width=3)
        d.ellipse((339, 224 + dy, 361, 246 + dy), fill=DARK)
        for bx in (300, 400): d.ellipse((bx - 6, 304 + dy, bx + 6, 316 + dy), fill=DARK)
        T2(d, 350, 148 + dy, "Lager in der Förderanlage", F(22, 700), GREY, "mm")
        # Thermometer
        d.rounded_rectangle((130, 180 + dy, 170, 566 + dy), 20, fill=WHITE, outline=DARK, width=3)
        d.ellipse((118, 544 + dy, 182, 608 + dy), fill=WHITE, outline=DARK, width=3)
        col = STATE_COL[st] if t >= ct(1) + 0.3 else GREEN
        top = 566 - v / 100.0 * (566 - 200)
        d.ellipse((126, 552 + dy, 174, 600 + dy), fill=col); d.rectangle((140, top + dy, 160, 570 + dy), fill=col)
        for val, lab in ((70, "70"), (85, "85")):
            yy = 566 - val / 100.0 * (566 - 200)
            d.line((172, yy + dy, 192, yy + dy), fill=DARK, width=3); T2(d, 198, yy + dy, lab, F(22, 700), GREY, "lm")
        T2(d, 350, 370 + dy, f"{shown} °C", F(66, 700), DARK, "mm")
        T2(d, 350, 428 + dy, st, F(34, 700), STATE_COL[st], "mm")
        for k, ln in enumerate(("unter 70 °C: normal", "bis 85 °C: warnung", "darüber: abschalten")):
            T2(d, 236, 492 + k * 34 + dy, ln, F(22, 400), GREY, "lm")
        T2(d, 236, 466 + dy, "Lastenheft", F(22, 700), DARK, "lm")
    f.el(show(t, 0.3), lager, dy=dyf(t, 0.3))
    code_box12(f, t, CODE_KI, 1, 530, 124, 690, 24, 36, hl={3} if fail else None, red={3} if fail else None, times=[ct(0) + 1.0 + 0.45 * k for k in range(7)], alpha_t=ct(0) + 0.8)
    for k, (v_, txt) in enumerate(((20, "20 °C → normal"), (75, "75 °C → warnung"), (90, "90 °C → abschalten"))):
        tin = ct(1) + 0.4 + 1.3 * k; x = 530 + k * 232
        def ck(d, dy, x=x, txt=txt):
            d.rounded_rectangle((x, 450 + dy, x + 226, 506 + dy), 12, fill=LIGHTG, outline=GREEN, width=2)
            okmark(d, x + 24, 478 + dy, 14)
            fit(txt, F(20, 700), 172, "Haken"); T2(d, x + 46, 478 + dy, txt, F(20, 700), DARK, "lm")
        f.el(show(t, tin), ck, dy=dyf(t, tin))
    f.el(show(t, ct(2) + 0.9), lambda d, dy: tag(d, 530, 540 + dy, 690, 52, "Genau 85 °C: abschalten statt warnung", RED, WHITE, 28), dy=dyf(t, ct(2) + 0.9))
    f.el(show(t, ct(2) + 2.8), lambda d, dy: tag(d, 530, 606 + dy, 690, 44, "kleiner statt kleiner gleich: der Test fehlte", LIGHTR, RED, 24, 700, outl=RED), dy=dyf(t, ct(2) + 2.8))

# ---------------------------------------------------------------- 2 assert
def sc2(f, t, ct):
    heading(f, t, "Ein Test: erwartet gegen tatsächlich")
    bad = t >= ct(1) + 4.6
    def ex(d, dy):
        card(d, 60, 124 + dy, 500, 150)
        T2(d, 90, 142 + dy, "erwartet", F(26, 700), GREEN, "la"); T2(d, 90, 176 + dy, "von Hand aus der Spezifikation", F(21, 400), GREY, "la")
        T2(d, 90, 232 + dy, "warnung", F(52, 700), DARK, "lm")
    f.el(show(t, 0.3), ex, dy=dyf(t, 0.3))
    def ac(d, dy):
        card(d, 720, 124 + dy, 500, 150)
        T2(d, 750, 142 + dy, "tatsächlich", F(26, 700), RED, "la"); T2(d, 750, 176 + dy, "liefert das Programm", F(21, 400), GREY, "la")
        T2(d, 750, 232 + dy, "abschalten", F(52, 700), DARK, "lm")
    f.el(show(t, ct(0) + 2.4), ac, dy=dyf(t, ct(0) + 2.4))
    f.el(show(t, ct(0) + 2.4), lambda d, dy: T2(d, 640, 200 + dy, "≠" if bad else "=", F(90, 700), RED if bad else GREY, "mm"))
    code_box12(f, t, [TEST_LINE], 1, 60, 296, 1160, 24, 38, times=[ct(1) + 0.3], alpha_t=ct(1) + 0.1, cps=45)
    f.el(show(t, ct(1) + 2.0), lambda d, dy: tag(d, 60, 426 + dy, 480, 38, "Behauptung stimmt", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(1) + 2.0))
    f.el(show(t, ct(1) + 2.0), lambda d, dy: console_panel(d, 60, 472 + dy, 480, 96, [(ct(1) + 2.2, [("(keine Ausgabe)", CODE_C)])], t, 22, title="Ausgabe", lh=30))
    f.el(show(t, ct(1) + 4.6), lambda d, dy: tag(d, 570, 426 + dy, 650, 38, "Behauptung falsch", LIGHTR, RED, 24, 700, outl=RED), dy=dyf(t, ct(1) + 4.6))
    f.el(show(t, ct(1) + 4.6), lambda d, dy: console_panel(d, 570, 472 + dy, 650, 96, [(ct(1) + 4.8, [("AssertionError: Grenzwert 85 °C falsch eingeordnet", CODE_R)])], t, 22, title="Ausgabe", lh=30))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 596 + dy, 1160, 56, "Bestanden heißt nicht richtig: Es kommt auf die getesteten Werte an", AMB, WHITE, 28), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 3 Welche Werte? Zahlenstrahl und Mutanten
MUT = [("t < 85   statt t <= 85", "Test 85 °C scheitert"), ("t <= 70  statt t < 70", "Test 70 °C scheitert"),
       ("t <= -40 statt t < -40", "Test -40 °C scheitert"), ("t >= 200 statt t > 200", "Test 200 °C scheitert")]
TYP = [(-60, "−60"), (20, "20"), (75, "75"), (120, "120"), (250, "250")]
TYPX = [(ZB[0] + ZB[1]) // 2, (ZB[1] + ZB[2]) // 2, (ZB[2] + ZB[3]) // 2, (ZB[3] + ZB[4]) // 2, (ZB[4] + ZB[5]) // 2]
PAARE = [(-40.1, "−40,1", ZB[1] - 30), (-40, "−40", ZB[1] + 30), (69.9, "69,9", ZB[2] - 30), (70, "70", ZB[2] + 30),
         (85, "85", ZB[3] - 30), (85.1, "85,1", ZB[3] + 30), (200, "200", ZB[4] - 30), (200.1, "200,1", ZB[4] + 30)]

def sc3(f, t, ct):
    heading(f, t, "Welche Werte testen?")
    SY, SH = 212, 84; PY = SY + int(SH * 0.72)
    f.el(show(t, 0.3), lambda d, dy: zonen(d, SY + dy, SH))
    # Legende
    def leg(d, dy):
        if t >= ct(0) + 0.4: zpunkt(d, 90, 114 + dy, GREEN, 9); T2(d, 110, 114 + dy, "typischer Wert je Bereich", F(22, 700), DARK, "lm")
        if t >= ct(1) + 0.4: zpunkt(d, 460, 114 + dy, RED, 9); T2(d, 480, 114 + dy, "Grenzwert: von beiden Seiten", F(22, 700), DARK, "lm")
    f.el(1, leg)
    def typ(d, dy):
        for k, ((v, lab), x) in enumerate(zip(TYP, TYPX)):
            a = ap(t, ct(0) + 0.9 + 0.55 * k, 0.4)
            if a <= 0: continue
            zpunkt(d, x, PY + dy, mix(WHITE, GREEN, a)); T2(d, x, SY + SH + 14 + dy, lab, F(24, 700), mix(WHITE, GREEN, a), "ma")
    f.el(1, typ)
    def gr(d, dy):
        for k, (v, lab, x) in enumerate(PAARE):
            a = ap(t, ct(1) + 1.2 + 0.7 * k, 0.4)
            if a <= 0: continue
            zpunkt(d, x, PY + dy, mix(WHITE, RED, a)); T2(d, x, SY - 24 + dy, lab, F(22, 700), mix(WHITE, DARK, a), "mm")
    f.el(1, gr)
    # Mutanten
    def card_m(d, dy):
        card(d, 60, 372 + dy, 1160, 290)
        T2(d, 90, 384 + dy, "Fehlerhafte Varianten (Mutanten)", F(26, 700), DARK, "la")
        T2(d, 560, 388 + dy, "ein guter Test scheitert bei jeder von ihnen", F(22, 400), GREY, "la")
    f.el(show(t, ct(2) + 0.3), card_m, dy=dyf(t, ct(2) + 0.3))
    for k, (m, res) in enumerate(MUT):
        tin = ct(2) + 1.2 + 1.3 * k; yy = 432 + k * 56
        def row(d, dy, m=m, res=res, yy=yy):
            monobox(d, 90, yy + dy, 400, 46, m, 24, CODE_T)
            arrow(d, 506, yy + 23 + dy, 546, yy + 23 + dy, GREY, 3, 10)
            d.rounded_rectangle((560, yy + dy, 960, yy + 46 + dy), 10, fill=LIGHTG, outline=GREEN, width=2)
            okmark(d, 586, yy + 23 + dy, 14); T2(d, 612, yy + 23 + dy, res, F(24, 700), DARK, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))

# ---------------------------------------------------------------- 4 Drei Arten von Fehlern
def sc4(f, t, ct):
    heading(f, t, "Drei Arten von Fehlern")
    rows = [("Syntaxfehler", ["Meldung vor", "dem Start"], "if t < 70", [("SyntaxError: expected ':'", CODE_R)], ct(0)),
            ("Laufzeitfehler", ["Abbruch mit", "Traceback"], "rate = 100 / n",
             [("Traceback (most recent call last):", CODE_C), ('  File "test.py", line 3, in <module>', CODE_C), ("ZeroDivisionError: division by zero", CODE_R)], ct(1)),
            ("Logikfehler", ["keine Meldung,", "falsches Ergebnis"], "print(zustand_ki(85))", [("abschalten", CODE_T)], ct(2))]
    for k, (nm, sub, code, out, tin) in enumerate(rows):
        y = 118 + k * 174; tin = tin + 0.2
        def kard(d, dy, k=k, nm=nm, sub=sub, y=y):
            card(d, 60, y + dy, 1160, 160)
            T2(d, 90, y + 22 + dy, nm, F(32, 700), RED if k < 2 else AMB, "la")
            for j, s in enumerate(sub): T2(d, 90, y + 74 + 30 * j + dy, s, F(24, 400), GREY, "la")
        f.el(show(t, tin), kard, dy=dyf(t, tin))
        def cd(d, dy, code=code, y=y, k=k):
            monobox(d, 330, y + 54 + dy, 330 if k else 330, 52, code, 24, CODE_T)
        f.el(show(t, tin + 0.4), cd, dy=dyf(t, tin + 0.4))
        ts = tin + (2.6 if k != 1 else 2.0)
        n = len(out)
        def cons(d, dy, y=y, out=out, ts=ts, n=n, k=k):
            ents = [(ts + 0.1 * j, [o]) for j, o in enumerate(out)]
            ch = 46 + 27 * n + 10
            console_panel(d, 690, y + 10 + dy, 506, ch, ents, t, 20, title="Ausgabe", lh=27)
        f.el(show(t, ts), cons, dy=dyf(t, ts))
    f.el(show(t, ct(0) + 5.2), lambda d, dy: tag(d, 330, 118 + 112 + dy, 330, 36, "Python meldet ihn sofort", LIGHTR, RED, 20, 700, outl=RED))
    f.el(show(t, ct(2) + 3.4), lambda d, dy: tag(d, 800, 118 + 348 + 106 + dy, 396, 38, "erwartet war: warnung", RED, WHITE, 24))
    f.el(show(t, ct(2) + 6.6), lambda d, dy: tag(d, 330, 118 + 348 + 112 + dy, 330, 36, "nur ein Test findet ihn", LIGHTA, AMB, 20, 700, outl=AMBER))

# ---------------------------------------------------------------- 5 Traceback lesen
TB = [("Traceback (most recent call last):", CODE_C), ('  File "anlage.py", line 14, in <module>', CODE_C), ("    meldung = bericht(0)", CODE_T),
      ('  File "anlage.py", line 10, in bericht', CODE_C), ("    return rate(n)", CODE_T), ('  File "anlage.py", line 5, in rate', CODE_C),
      ("    return 100 / n", CODE_T), ("ZeroDivisionError: division by zero", CODE_R)]
GRP = [({7}, (96, 36, 44), RED, "Was ist passiert?", "ganz unten: Fehlerart und Meldung"),
       ({5, 6}, (30, 58, 110), BLUE, "Wo ist es passiert?", "die Zeile darüber: Datei, Zeile, Funktion"),
       ({0, 1, 2, 3, 4}, (24, 80, 52), GREEN, "Wie kam es dazu?", "darüber: die Aufrufer")]

def sc5(f, t, ct):
    heading(f, t, "Den Traceback liest du von unten nach oben")
    times = [ct(0) + 0.3 + 0.12 * k for k in range(len(TB))]
    tg = [ct(0) + 0.6, ct(1) + 0.6, ct(1) + 3.6]
    def pan(d, dy):
        x, y, w, sz, lh = 60, 124 + dy, 660, 22, 32
        h = 52 + lh * len(TB) + 16
        d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX2); T(d, x + 22, y + 12, "Ausgabe", F(20, 600), CODE_C)
        for gi, (idx, fillc, colc, _, _) in enumerate(GRP):
            if t < tg[gi]: continue
            a = ap(t, tg[gi], 0.4)
            for i in idx:
                yy = y + 52 + i * lh
                d.rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 4), fill=mix(BOX2, fillc, a)); d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 4), fill=mix(BOX2, colc, a))
        fm = M(sz)
        for i, ((ln, col), t0) in enumerate(zip(TB, times)):
            if t < t0: continue
            fit(ln, fm, w - 44, "Traceback")
            draw_segs(d, x + 24, y + 52 + i * lh, [(ln, col)], fm, int((t - t0) * 90), 1.0, BOX2)
    f.el(show(t, 0.3), pan, dy=dyf(t, 0.3))
    def up(d, dy): arrow(d, 40, 418 + dy, 40, 160 + dy, RED, 5, 14)
    f.el(show(t, ct(0) + 0.4), up)
    for k, (idx, fillc, colc, title, sub) in enumerate(GRP):
        y = 124 + k * 104
        def kard(d, dy, k=k, colc=colc, title=title, sub=sub, y=y):
            card(d, 760, y + dy, 460, 92)
            d.ellipse((780, y + 24 + dy, 828, y + 72 + dy), fill=colc); T2(d, 804, y + 48 + dy, str(k + 1), F(30, 700), WHITE, "mm")
            T2(d, 846, y + 28 + dy, title, F(28, 700), DARK, "lm")
            fit(sub, F(21, 400), 360, "Karte"); T2(d, 846, y + 62 + dy, sub, F(21, 400), GREY, "lm")
        f.el(show(t, tg[k]), kard, dy=dyf(t, tg[k]))
    # Gescheiterter Test
    def t1(d, dy):
        card(d, 60, 500 + dy, 540, 118)
        T2(d, 90, 516 + dy, "Test scheitert", F(28, 700), RED, "la"); T2(d, 90, 560 + dy, "Traceback zeigt die Stelle des Tests", F(22, 400), GREY, "la")
        T2(d, 90, 586 + dy, "nicht die Stelle des Fehlers", F(22, 400), GREY, "la")
    f.el(show(t, ct(2) + 0.2), t1, dy=dyf(t, ct(2) + 0.2))
    f.el(show(t, ct(2) + 2.6), lambda d, dy: arrow(d, 612, 559 + dy, 680, 559 + dy, GREY, 5, 14))
    def t2(d, dy):
        card(d, 692, 500 + dy, 528, 118)
        T2(d, 722, 516 + dy, "Ursache", F(28, 700), AMB, "la"); T2(d, 722, 560 + dy, "steckt woanders im Programm:", F(22, 400), GREY, "la")
        T2(d, 722, 586 + dy, "die suchst du selbst", F(22, 700), DARK, "la")
    f.el(show(t, ct(2) + 3.0), t2, dy=dyf(t, ct(2) + 3.0))

# ---------------------------------------------------------------- 6 Kreislauf und Debugger
STAT = [("Test scheitert", "ein Fall ist rot", 60, 140, RED, LIGHTR), ("Hypothese", "Grenze falsch?", 330, 140, AMB, LIGHTA),
        ("Beobachten", "print, Visualisierer", 330, 320, BLUE, LIGHTB), ("Korrigieren", "nur eine Sache", 60, 320, GREEN, LIGHTG)]
DBG = ["def zustand_ki(t):", "    if t < 70:", '        return "normal"', "    elif t < 85:", '        return "warnung"']

def sc6(f, t, ct):
    heading(f, t, "Fehler suchen: Kreislauf und Debugger")
    c0 = ct(0)
    for k, (nm, sub, x, y, col, bg) in enumerate(STAT):
        tin = c0 + 1.0 + 1.9 * k
        def st(d, dy, nm=nm, sub=sub, x=x, y=y, col=col, bg=bg, k=k):
            d.rounded_rectangle((x, y + dy, x + 230, y + 110 + dy), 14, fill=bg, outline=col, width=3)
            fit(nm, F(28, 700), 210, "Station"); T2(d, x + 115, y + 38 + dy, nm, F(28, 700), DARK, "mm")
            fit(sub, F(21, 400), 210, "Station"); T2(d, x + 115, y + 78 + dy, sub, F(21, 400), GREY, "mm")
            d.ellipse((x - 14, y - 14 + dy, x + 22, y + 22 + dy), fill=col); T2(d, x + 4, y + 4 + dy, str(k + 1), F(22, 700), WHITE, "mm")
        f.el(show(t, tin), st, dy=dyf(t, tin))
    f.el(show(t, c0 + 2.9), lambda d, dy: arrow(d, 296, 195 + dy, 326, 195 + dy, GREY, 4, 11))
    f.el(show(t, c0 + 4.8), lambda d, dy: arrow(d, 445, 254 + dy, 445, 316 + dy, GREY, 4, 11))
    f.el(show(t, c0 + 6.7), lambda d, dy: arrow(d, 326, 375 + dy, 296, 375 + dy, GREY, 4, 11))
    f.el(show(t, c0 + 7.4), lambda d, dy: arrow(d, 175, 316 + dy, 175, 254 + dy, RED, 4, 11))
    f.el(show(t, c0 + 7.4), lambda d, dy: tag(d, 60, 450 + dy, 500, 44, "Dann laufen alle Tests noch einmal", LIGHTR, RED, 24, 700, outl=RED))
    # VS-Code-Fenster
    c1 = ct(1)
    def win(d, dy):
        d.rounded_rectangle((600, 124 + dy, 1220, 564 + dy), 14, fill=BOX2)
        d.rounded_rectangle((600, 124 + dy, 1220, 160 + dy), 14, fill=(8, 12, 18)); d.rectangle((600, 146 + dy, 1220, 160 + dy), fill=(8, 12, 18))
        T2(d, 620, 142 + dy, "VS Code · Debugger", F(20, 600), CODE_C, "lm")
        for x0, w0, s in ((620, 150, "Schritt über"), (782, 168, "Schritt hinein")):
            d.rounded_rectangle((x0, 172 + dy, x0 + w0, 206 + dy), 8, fill=(52, 64, 80)); T2(d, x0 + w0 / 2, 189 + dy, s, F(20, 700), WHITE, "mm")
    f.el(show(t, c1 + 0.1), win, dy=dyf(t, c1 + 0.1))
    hold = t >= c1 + 2.2
    code_box12(f, t, DBG, 1, 616, 220, 400, 22, 34, hl={3} if hold else None, hlfill=(110, 92, 20), hlbar=AMBER, alpha_t=c1 + 0.3, title=None)
    def bp(d, dy):
        a = ap(t, c1 + 1.0, 0.4)
        if a > 0: d.ellipse((616 + 4, 220 + 18 + 3 * 34 + 8 + dy, 616 + 18, 220 + 18 + 3 * 34 + 22 + dy), fill=mix(BOX, RED, a))
    f.el(show(t, c1 + 0.3), bp)
    def vars_(d, dy):
        d.rounded_rectangle((1030, 220 + dy, 1206, 330 + dy), 10, fill=BOX); T2(d, 1046, 232 + dy, "Variablen", F(19, 700), CODE_C, "la")
        T2(d, 1046, 282 + dy, "t = 85", M(22), CODE_T, "lm")
    f.el(show(t, c1 + 3.4), vars_, dy=dyf(t, c1 + 3.4))
    def calls(d, dy):
        d.rounded_rectangle((1030, 344 + dy, 1206, 454 + dy), 10, fill=BOX); T2(d, 1046, 356 + dy, "Aufrufliste", F(19, 700), CODE_C, "la")
        T2(d, 1046, 394 + dy, "zustand_ki", M(20), CODE_T, "lm"); T2(d, 1046, 424 + dy, "<module>", M(20), CODE_C, "lm")
    f.el(show(t, c1 + 4.0), calls, dy=dyf(t, c1 + 4.0))
    def legend(d, dy):
        d.ellipse((620, 484 + dy, 640, 504 + dy), fill=RED); T2(d, 650, 494 + dy, "Haltepunkt am Zeilenrand", F(21, 400), CODE_T, "lm")
        d.rectangle((620, 520 + dy, 640, 540 + dy), fill=(110, 92, 20), outline=AMBER); T2(d, 650, 530 + dy, "gelb: hier hält das Programm an", F(21, 400), CODE_T, "lm")
    f.el(show(t, c1 + 1.4), legend, dy=dyf(t, c1 + 1.4))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 160, 598 + dy, 960, 58, "Die KI erzeugt, du prüfst", RED, WHITE, 36), dy=dyf(t, ct(2) + 0.2))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V12 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Testen & Debuggen", F(96, 700), DARK)
        T2(d, 90, 306, "Grenzwerte testen, Traceback lesen, Fehler finden", F(44, 400), GREY)
        zonen(d, 400, 84)
        x = 90
        for nm, (fill, col) in (("assert", (LIGHTG, GREEN)), ("Grenzwerte", (LIGHTR, RED)), ("Traceback", (LIGHTA, AMB)), ("Debugger", (LIGHTB, BLUE))):
            wd = chip_w(nm, 34, 24); chip(d, x, 585, wd, 76, nm, fill, col, 34); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
