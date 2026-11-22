"""V12 Python: assert, Testfunktionen, Toleranz, try/except as. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v12-common"))
from h12 import *
from texte import SRC

NAME = "v12-python"; LABEL = "DHBW · Informatik · V12 · Testen in Python"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung der gezeigten Ausgaben
KMH = "def kmh_in_ms(v):\n    return v / 3.6\n"
A1 = 'assert kmh_in_ms(36) == 10.0, "36 km/h müssen 10 m/s sein"'
assert run(KMH + "try:\n    assert kmh_in_ms(36) == 11.0, '36 km/h müssen 10 m/s sein'\nexcept AssertionError as e:\n    print('AssertionError:', e)") == ["AssertionError: 36 km/h müssen 10 m/s sein"]
assert run(KMH + A1 + "\nprint('ok')") == ["ok"]
C2 = ["def test_kmh_in_ms():", '    assert kmh_in_ms(36) == 10.0, "36 km/h falsch"', '    assert kmh_in_ms(0) == 0.0, "0 km/h falsch"',
      '    assert kmh_in_ms(72) == 20.0, "72 km/h falsch"', "", "test_kmh_in_ms()", 'print("bestanden")']
assert run(KMH + "\n".join(C2)) == ["bestanden"]
ZUSTAND = 'def zustand(t):\n    if t < 70:\n        return "normal"\n    elif t < 85:\n        return "warnung"\n    else:\n        return "abschalten"\n'
C3 = ['faelle = [(20, "normal"),', '          (70, "warnung"),', '          (85, "warnung")]', "for t, erwartet in faelle:", "    ist = zustand(t)",
      '    assert ist == erwartet, f"{t} °C: erwartet {erwartet}, bekommen {ist}"']
assert run(ZUSTAND + "try:\n" + "\n".join("    " + l for l in C3) + "\nexcept AssertionError as e:\n    print('AssertionError:', e)") == ["AssertionError: 85 °C: erwartet warnung, bekommen abschalten"]
C4 = ["import math", "print(0.1 + 0.2 == 0.3)", "print(math.isclose(0.1 + 0.2, 0.3))"]
assert run("\n".join(C4)) == ["False", "True"]
assert 0.1 + 0.2 == 0.30000000000000004 and math.isclose(0.1 + 0.2, 0.3) and abs(0.1 + 0.2 - 0.3) < 1e-9
C5 = ["for t, erwartet in faelle:", "    try:", '        assert zustand(t) == erwartet, f"{t} °C falsch"', "    except AssertionError as fehler:", "        print(fehler)"]
assert run(ZUSTAND.replace("t < 70", "t <= 70").replace("t < 85", "t < 85") + 'faelle = [(20, "normal"), (70, "warnung"), (85, "warnung")]\n' + "\n".join(C5)) == ["70 °C falsch", "85 °C falsch"]
C6 = ["def zustand_ki(t):", "    print(t, t < 85)", "    if t < 85:", '        return "warnung"']
assert run("\n".join(C6) + "\nzustand_ki(85)") == ["85 False"]
C6B = 'assert (zustand(85) == "warnung", "Grenzwert 85 °C falsch")'
import warnings
with warnings.catch_warnings():
    warnings.simplefilter("ignore", SyntaxWarning)
    assert run(ZUSTAND + C6B + "\nprint('kein Fehler')") == ["kein Fehler"]   # Tupel ist immer wahr: nichts wird geprueft

fit_check(["AssertionError: 85 °C: erwartet warnung, bekommen abschalten"], M(20), 740 - 44 - 10, "Konsole")

# ---------------------------------------------------------------- 1 assert
def sc1(f, t, ct):
    heading(f, t, "assert: eine Behauptung prüfen")
    code_box12(f, t, [A1], 1, 60, 124, 1160, 26, 40, times=[ct(0) + 0.3], alpha_t=ct(0) + 0.1, cps=45)
    x0 = 60 + 62; fm = M(26)
    segs = [(7, 28, CODE_K, "Bedingung", GREY, ct(0) + 3.2), (28, 29, RED, "Komma", RED, ct(1) + 0.4), (30, len(A1), CODE_G, "Meldung", GREEN, ct(1) + 1.6)]
    for a, b, col, lab, lc, tin in segs:
        xa = x0 + fm.getlength(A1[:a]); xb = x0 + fm.getlength(A1[:b])
        def bar(d, dy, xa=xa, xb=xb, col=col, lab=lab, lc=lc):
            d.line((xa, 206 + dy, xb, 206 + dy), fill=col, width=5)
            T2(d, (xa + xb) / 2, 244 + dy, lab, F(24, 700), lc, "mm")
        f.el(show(t, tin), bar, dy=dyf(t, tin))
    # wahr / falsch
    def ok(d, dy):
        card(d, 60, 290 + dy, 480, 238)
        okmark(d, 100, 326 + dy, 20); T2(d, 134, 326 + dy, "Bedingung wahr", F(30, 700), GREEN, "lm")
        T2(d, 90, 372 + dy, "Python macht nichts weiter", F(23, 400), GREY, "la")
        d.rounded_rectangle((84, 414 + dy, 516, 506 + dy), 12, fill=BOX2); T(d, 104, 424 + dy, "Ausgabe", F(20, 600), CODE_C); T(d, 104, 460 + dy, "(keine Ausgabe)", M(22), CODE_C)
    f.el(show(t, ct(0) + 1.2), ok, dy=dyf(t, ct(0) + 1.2))
    def bad(d, dy):
        card(d, 580, 290 + dy, 640, 238)
        nomark(d, 620, 326 + dy, 20); T2(d, 654, 326 + dy, "Bedingung falsch", F(30, 700), RED, "lm")
        T2(d, 610, 372 + dy, "Python löst einen AssertionError aus", F(23, 400), GREY, "la")
    f.el(show(t, ct(0) + 2.2), bad, dy=dyf(t, ct(0) + 2.2))
    f.el(show(t, ct(0) + 2.4), lambda d, dy: console_panel(d, 604, 414 + dy, 592, 92, [(ct(0) + 2.6, [("AssertionError: 36 km/h müssen 10 m/s sein", CODE_R)])], t, 22, title="Ausgabe", lh=30))
    def erw(d, dy):
        card(d, 60, 556 + dy, 1160, 100)
        okmark(d, 100, 590 + dy, 18); T2(d, 130, 590 + dy, "von Hand gerechnet: 36 km/h : 3,6 = 10 m/s", F(28, 700), DARK, "lm")
        nomark(d, 100, 628 + dy, 18); T2(d, 130, 628 + dy, "nie aus der Funktion selbst: Der Test würde sich selbst bestätigen", F(28, 700), DARK, "lm")
    f.el(show(t, ct(2) + 0.3), erw, dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 Testfunktion
def sc2(f, t, ct):
    heading(f, t, "Mehrere Tests in einer Funktion")
    hl = hl_at(t, [(0, None), (ct(0) + 1.5, {0, 1, 2, 3}), (ct(1) + 0.4, {5}), (ct(1) + 2.6, {6}), (ct(2), {1, 2, 3})])
    times = [ct(0) + 0.2 + 0.55 * k for k in range(4)] + [1e9, ct(1) + 0.2, ct(1) + 2.4]
    code_box12(f, t, C2, 1, 60, 124, 780, 24, 36, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=55)
    f.el(show(t, ct(1) + 3.6), lambda d, dy: console_panel(d, 60, 470 + dy, 780, 92, [(ct(1) + 3.8, [("bestanden", CODE_G)])], t, 24, title="Ausgabe", lh=34))
    tile2(f, t, ct(0) + 1.5, 870, 124, 350, 112, "Testfunktion", ["Name beginnt mit test_", "mehrere assert-Zeilen"], DARK, bigsize=28)
    tile2(f, t, ct(1) + 0.4, 870, 250, 350, 112, "Aufruf nötig", ["Sie läuft erst,", "wenn du sie aufrufst"], BLUE, bigsize=28)
    tile2(f, t, ct(1) + 2.8, 870, 376, 350, 96, "print am Ende", ["bei Erfolg schweigt assert"], GREEN, bigsize=28)
    tile2(f, t, ct(2) + 0.3, 870, 486, 350, 112, "Erster Fehlschlag", ["beendet die Testfunktion"], RED, bigsize=28)

# ---------------------------------------------------------------- 3 Tabelle von Testfaellen
def sc3(f, t, ct):
    heading(f, t, "Testfälle als Liste von Tupeln")
    hl = hl_at(t, [(0, None), (ct(0) + 0.5, {0, 1, 2}), (ct(1) + 0.3, {3}), (ct(2) + 0.3, {5})])
    times = [ct(0) + 0.2 + 0.6 * k for k in range(3)] + [ct(0) + 3.0, ct(1) + 0.2, ct(2) + 0.2]
    code_box12(f, t, C3, 1, 60, 124, 1160, 24, 36, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=60)
    def unp(d, dy):
        T2(d, 60, 428 + dy, "ein Tupel aus der Liste", F(22, 700), GREY, "la")
        monobox(d, 60, 458 + dy, 280, 48, '(70, "warnung")', 24, CODE_T)
        arrow(d, 135, 510 + dy, 135, 546 + dy, RED, 4, 11); arrow(d, 265, 510 + dy, 295, 546 + dy, RED, 4, 11)
        box_cell(d, 60, 552 + dy, 150, 100, "t", "70", RED, 40); box_cell(d, 225, 552 + dy, 200, 100, "erwartet", "warnung", GREEN, 36)
    f.el(show(t, ct(1) + 1.0), unp, dy=dyf(t, ct(1) + 1.0))
    f.el(show(t, ct(2) + 1.2), lambda d, dy: console_panel(d, 480, 440 + dy, 740, 104, [(ct(2) + 1.4, [("AssertionError: 85 °C: erwartet warnung, bekommen abschalten", CODE_R)])], t, 20, title="Ausgabe", lh=30))
    f.el(show(t, ct(2) + 3.2), lambda d, dy: tag(d, 480, 566 + dy, 740, 46, "Die Meldung nennt den gescheiterten Fall", LIGHTA, AMB, 26, 700, outl=AMBER), dy=dyf(t, ct(2) + 3.2))

# ---------------------------------------------------------------- 4 Kommazahlen und Toleranz
def sc4(f, t, ct):
    heading(f, t, "Kommazahlen: mit Toleranz vergleichen")
    hl = hl_at(t, [(0, None), (ct(0) + 0.6, {1}), (ct(1) + 0.4, {2})])
    times = [ct(0) + 0.1, ct(0) + 0.5, ct(1) + 0.3]
    code_box12(f, t, C4, 1, 60, 124, 780, 26, 40, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=50)
    ents = [(ct(0) + 2.6, [("False", CODE_R)]), (ct(1) + 1.6, [("True", CODE_G)])]
    f.el(show(t, ct(0) + 2.4), lambda d, dy: console_panel(d, 60, 322 + dy, 780, 136, ents, t, 26, title="Ausgabe", lh=38))
    # Toleranzband
    CX0 = 1040
    def band(d, dy):
        card(d, 880, 124 + dy, 340, 340)
        T2(d, 908, 138 + dy, "Sollwert 0.3", F(26, 700), DARK, "la"); T2(d, 908, 172 + dy, "mit Toleranzband", F(22, 400), GREY, "la")
        d.rectangle((CX0 - 60, 270 + dy, CX0 + 60, 330 + dy), fill=LIGHTG, outline=GREEN, width=2)
        T2(d, CX0 + 68, 300 + dy, "Toleranz", F(20, 700), GREEN, "lm")
        d.line((900, 330 + dy, 1200, 330 + dy), fill=DARK, width=3); d.line((CX0, 262 + dy, CX0, 340 + dy), fill=DARK, width=3)
        T2(d, CX0, 360 + dy, "0.3", F(24, 700), DARK, "ma")
    f.el(show(t, ct(0) + 0.4), band, dy=dyf(t, ct(0) + 0.4))
    def pt(d, dy):
        x = CX0 + 8
        d.ellipse((x - 9, 288 + dy - 9, x + 9, 288 + dy + 9), fill=RED, outline=WHITE, width=2)
        T2(d, x - 20, 222 + dy, "0.1 + 0.2", F(22, 700), RED, "ma"); d.line((x, 246 + dy, x, 277 + dy), fill=RED, width=2)
        T2(d, 1050, 400 + dy, "0.30000000000000004", F(20, 700), RED, "ma")
    f.el(show(t, ct(0) + 1.6), pt, dy=dyf(t, ct(0) + 1.6))
    # Methoden
    f.el(show(t, ct(1) + 0.3), lambda d, dy: monobox(d, 60, 490 + dy, 470, 50, "math.isclose(a, b, rel_tol=1e-9)", 24, CODE_T), dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(1) + 0.9), lambda d, dy: monobox(d, 550, 490 + dy, 290, 50, "abs(a - b) < 1e-9", 24, CODE_T), dy=dyf(t, ct(1) + 0.9))
    f.el(show(t, ct(1) + 0.9), lambda d, dy: T2(d, 60, 552 + dy, "zwei Wege: relative Toleranz oder Differenz", F(22, 400), GREY, "la"))
    def eq(d, dy):
        card(d, 60, 590 + dy, 1160, 70, fill=LIGHTG)
        okmark(d, 100, 625 + dy, 18); T2(d, 134, 625 + dy, "Texte, ganze Zahlen und Wahrheitswerte: weiter mit ==", F(30, 700), DARK, "lm")
    f.el(show(t, ct(2) + 0.3), eq, dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 5 try / except as
def sc5(f, t, ct):
    heading(f, t, "Gescheiterte Tests sammeln: try und except as")
    hl = hl_at(t, [(0, None), (ct(0) + 0.8, {1, 2, 3, 4})])
    times = [ct(0) + 0.1 + 0.5 * k for k in range(5)]
    code_box12(f, t, C5, 1, 60, 124, 820, 24, 38, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=60)
    def jump(d, dy):
        y2, y3 = 124 + 50 + 38 * 2 + 19, 124 + 50 + 38 * 3 + 19
        d.line((884, y2 + dy, 930, y2 + dy), fill=RED, width=4); d.line((930, y2 + dy, 930, y3 + dy), fill=RED, width=4)
        arrow(d, 930, y3 + dy, 886, y3 + dy, RED, 4, 12)
        T2(d, 946, (y2 + y3) / 2 + dy, "springt in except", F(22, 700), RED, "lm")
    f.el(show(t, ct(0) + 3.6), jump)
    fm = M(24); xa = 60 + 62 + fm.getlength(C5[3][:26]); xb = 60 + 62 + fm.getlength(C5[3][:35]); ly = 124 + 50 + 38 * 3
    def asbox(d, dy):
        a = ap(t, ct(1) + 0.4, 0.4); col = mix(BOX, RED, a)
        d.rounded_rectangle((xa - 5, ly - 3 + dy, xb + 5, ly + 33 + dy), 6, outline=col, width=3)
    f.el(show(t, ct(1) + 0.4), asbox)
    f.el(show(t, ct(1) + 1.0), lambda d, dy: tag(d, 900, 330 + dy, 320, 40, "as: Name für die Ausnahme", LIGHTR, RED, 20, 700, outl=RED), dy=dyf(t, ct(1) + 1.0))
    ents = [(ct(1) + 3.2, [("70 °C falsch", CODE_R)]), (ct(1) + 3.9, [("85 °C falsch", CODE_R)])]
    f.el(show(t, ct(1) + 3.0), lambda d, dy: console_panel(d, 60, 400 + dy, 820, 130, ents, t, 22, title="Ausgabe", lh=34))
    def only(d, dy):
        card(d, 60, 556 + dy, 1160, 100, fill=LIGHTA)
        T2(d, 90, 574 + dy, "Fang nur AssertionError", F(30, 700), AMB, "la")
        T2(d, 90, 614 + dy, "Ein Tippfehler im Test (zum Beispiel NameError) bricht weiter ab und fällt auf.", F(25, 400), DARK, "la")
    f.el(show(t, ct(2) + 0.3), only, dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 6 print, Visualisierer, Klammer-Falle
def sc6(f, t, ct):
    heading(f, t, "Beobachten und eine Falle")
    code_box12(f, t, C6, 1, 60, 124, 540, 24, 36, hl=hl_at(t, [(0, None), (ct(0) + 0.8, {1})]), times=[ct(0) + 0.1 + 0.45 * k for k in range(4)], alpha_t=ct(0) + 0.1)
    f.el(show(t, ct(0) + 2.6), lambda d, dy: console_panel(d, 60, 350 + dy, 540, 90, [(ct(0) + 2.8, [("85 False", CODE_T)])], t, 24, title="Ausgabe", lh=34))
    f.el(show(t, ct(0) + 2.8), lambda d, dy: T2(d, 60, 452 + dy, "die Bedingung selbst mit ausgeben", F(22, 700), GREY, "la"))
    # Visualisierer
    c1 = ct(1)
    def vis(d, dy):
        card(d, 640, 124 + dy, 580, 330)
        d.rounded_rectangle((664, 142 + dy, 904, 184 + dy), 21, fill=RED); T2(d, 784, 163 + dy, "Schritt für Schritt", F(24, 700), WHITE, "mm")
    f.el(show(t, c1 + 0.2), vis, dy=dyf(t, c1 + 0.2))
    cur = 1 if t < c1 + 3.0 else (2 if t < c1 + 4.2 else 3)
    code_box12(f, t, C6, 1, 664, 200, 370, 22, 34, hl={cur}, hlfill=(110, 92, 20), hlbar=AMBER, alpha_t=c1 + 0.4, title=None)
    def vv(d, dy):
        d.rounded_rectangle((1050, 200 + dy, 1200, 330 + dy), 10, fill=BOX); T2(d, 1066, 212 + dy, "Variablen", F(19, 700), CODE_C, "la")
        T2(d, 1066, 266 + dy, "t = 85", M(22), CODE_T, "lm")
    f.el(show(t, c1 + 1.4), vv, dy=dyf(t, c1 + 1.4))
    f.el(show(t, c1 + 2.0), lambda d, dy: T2(d, 664, 390 + dy, "Zeile für Zeile: welche Variable ändert sich?", F(22, 400), GREY, "la"))
    # Klammer-Falle
    c2 = ct(2)
    code_box12(f, t, [C6B], 1, 60, 480, 1160, 24, 38, times=[c2 + 0.2], alpha_t=c2 + 0.1, title=None, cps=55)
    def strike(d, dy):
        a = ap(t, c2 + 2.0, 0.5)
        if a > 0: d.line((100, 509 + dy, 100 + a * 1060, 509 + dy), fill=RED, width=5)
    f.el(show(t, c2 + 2.0), strike)
    f.el(show(t, c2 + 2.6), lambda d, dy: tag(d, 160, 574 + dy, 960, 56, "Ein Tupel: immer wahr, der Test prüft nichts", RED, WHITE, 30), dy=dyf(t, c2 + 2.6))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V12 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Testen in Python", F(104, 700), DARK)
        T2(d, 90, 306, "assert, Testfunktionen, Toleranz", F(48, 400), GREY)
        code_seg(d, 90, 410, 1050, [A1], 1, 9, size=28, lh=44, title=None)
        x = 90
        for nm, (fill, col) in (("assert", (LIGHTG, GREEN)), ("Tupel", (LIGHTB, BLUE)), ("isclose", (LIGHTA, AMB)), ("try/except", (LIGHTR, RED))):
            wd = chip_w(nm, 34, 24); chip(d, x, 560, wd, 76, nm, fill, col, 34); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
