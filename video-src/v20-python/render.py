"""V20 Python-Werkstatt: Klassen, Attribute, Methoden (durchgehend die Klasse Welle(d, l)).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v20-common/tts_run.py v20-python)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v20-common"))
from bausteine import *
from texte import SRC

NAME = "v20-python"; LABEL = "DHBW · Informatik · V20 · Python-Werkstatt"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- echte Werte (Probelauf der Klasse)
class Welle:
    def __init__(self, d, l):
        self.d = d; self.l = l
    def volumen(self): return math.pi / 4 * self.d ** 2 * self.l
    def masse(self, dichte=7.85): return self.volumen() / 1000 * dichte / 1000
_w = Welle(20, 100)
assert f"{_w.volumen():.0f}" == "31416" and f"{_w.masse():.2f}" == "0.25" and f"{_w.masse(2.70):.2f}" == "0.08"
_reihe = [Welle(20, 100), Welle(30, 150), Welle(40, 200)]
assert [f"{x.masse():.2f}" for x in _reihe] == ["0.25", "0.83", "1.97"]
_w.l = 200; assert f"{_w.masse():.2f}" == "0.49"

def cpanel(f, t, lines, x, y, w, size, lh, hl=None, times=None, alpha_t=0.0, title="Python", nums=None):
    times = times if times is not None else [-1] * len(lines)
    nums = nums or list(range(1, len(lines) + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl, title=title))

def kon(f, t, tin, x, y, w, zeilen, size=22, lh=32, title="Ausgabe", step=0.9):
    return konsole(f, t, tin, x, y, w, zeilen, size, lh, title, step)

def chiprow(d, x, y, items, size=24, h=48, gap=14):
    for txt, fill, col in items:
        w = chip_w(txt, size, 16, True); chip(d, x, y, w, h, txt, fill, col, size, mono=True); x += w + gap

# ---------------------------------------------------------------- 1 class, __init__, self
def sc1(f, t, ct):
    heading(f, t, "Eine Klasse schreiben")
    code = ["class Welle:", "    def __init__(self, d, l):", "        self.d = d", "        self.l = l"]
    tm = seq_times(code, [0], ct(0) + 0.3) ; tm[1] = ct(1) + 0.2; tm[2] = ct(2) + 0.2; tm[3] = ct(2) + 1.4
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(2), {2, 3})])
    cpanel(f, t, code, 60, 116, 640, 26, 42, hl, tm)
    X = 740
    def k0(d, dy):
        card(d, X, 116 + dy, 480, 160)
        T2(d, X + 28, 128 + dy, "Klasse = Bauplan", F(30, 700), DARK, "la")
        chiprow(d, X + 28, 180 + dy, [("class", LIGHTB, BLUE), ("Welle", LIGHTR, RED), (":", WHITE, GREY)], 28, 54)
        T2(d, X + 28, 242 + dy, "Name groß, Doppelpunkt am Ende", F(22, 400), GREY, "la")
    f.el(show(t, ct(0) + 0.5), k0, dy=dyf(t, ct(0) + 0.5))
    def k1(d, dy):
        card(d, X, 300 + dy, 480, 130)
        T2(d, X + 28, 312 + dy, "Erster Parameter: immer self", F(28, 700), DARK, "la")
        chiprow(d, X + 28, 360 + dy, [("self", LIGHTR, RED), ("d", LIGHTK, DARK), ("l", LIGHTK, DARK)], 28, 54)
        T2(d, X + 330, 386 + dy, "dann die Maße", F(22, 400), GREY, "lm")
    f.el(show(t, ct(1) + 0.5), k1, dy=dyf(t, ct(1) + 0.5))
    def k2(d, dy):
        card(d, 60, 450 + dy, 1160, 200)
        T2(d, 90, 462 + dy, "Parameter speichern als Attribut", F(28, 700), DARK, "la")
        for k, nm in enumerate(("d", "l")):
            y = 516 + k * 66; a = ap(t, ct(2) + 0.6 + 1.2 * k, 0.4)
            if a <= 0: continue
            chip(d, 90, y + dy, 150, 54, nm, mix(WHITE, LIGHTK, a), mix(WHITE, DARK, a), 28, mono=True)
            T2(d, 252, y + 27 + dy, "Parameter", F(20, 600), mix(WHITE, GREY, a), "lm")
            arrow(d, 380, y + 27 + dy, 520, y + 27 + dy, mix(WHITE, DARK, a), 4, 12)
            chip(d, 540, y + dy, 190, 54, "self." + nm, mix(WHITE, LIGHTR, a), mix(WHITE, RED, a), 28, mono=True)
            T2(d, 744, y + 27 + dy, "Attribut im Objekt", F(20, 600), mix(WHITE, GREY, a), "lm")
    f.el(show(t, ct(2) + 0.3), k2, dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 Objekt erzeugen, Attribut lesen/ändern
def sc2(f, t, ct):
    heading(f, t, "Objekt erzeugen, Attribut lesen und ändern")
    code = ["w = Welle(20, 100)", "print(w.d)", "w.l = 200", "v = Welle(30, 150)"]
    tm = [ct(0) + 0.3, ct(1) + 0.2, ct(1) + 2.8, ct(2) + 0.5]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(1) + 2.6, {2}), (ct(2), {2, 3})])
    cpanel(f, t, code, 60, 116, 620, 26, 42, hl, tm)
    ents = [("20", ct(1) + 1.2)]
    kon(f, t, ct(1) + 1.0, 60, 352, 620, [("20", CODE_T)], 26, 40)
    # Objektkarten
    def oc(d, dy):
        a = ap(t, ct(0) + 1.0, 0.45)
        if a > 0:
            l_val = 200 if t >= ct(1) + 3.2 else 100
            hlset = {1} if (t >= ct(1) + 3.2 and t < ct(2) + 1.0) else set()
            d.rounded_rectangle((740, 134 + dy, 880, 184 + dy), 10, fill=LIGHTB, outline=BLUE, width=2); T2(d, 810, 159 + dy, "w", M(30, True), BLUE, "mm")
            arrow(d, 880, 159 + dy, 930, 159 + dy, BLUE, 4, 12)
            objcard(d, 940, 116 + dy, 280, "Welle", [("d", 20), ("l", l_val)], hlset, DARK, 24, 40)
    f.el(show(t, ct(0) + 0.8), oc, dy=dyf(t, ct(0) + 0.8))
    def oc2(d, dy):
        d.rounded_rectangle((740, 330 + dy, 880, 380 + dy), 10, fill=LIGHTA, outline=AMB, width=2); T2(d, 810, 355 + dy, "v", M(30, True), AMB, "mm")
        arrow(d, 880, 355 + dy, 930, 355 + dy, AMB, 4, 12)
        objcard(d, 940, 312 + dy, 280, "Welle", [("d", 30), ("l", 150)], None, DARK, 24, 40)
        T2(d, 940, 466 + dy, "eigene Maße, unverändert", F(22, 600), GREEN, "la")
    f.el(show(t, ct(2) + 0.6), oc2, dy=dyf(t, ct(2) + 0.6))
    f.el(show(t, ct(0) + 1.8), lambda d, dy: tag(d, 60, 470 + dy, 620, 44, "Objekt erzeugen: Klassenname mit Klammern", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(0) + 1.8))
    f.el(show(t, ct(1) + 0.4), lambda d, dy: tag(d, 60, 530 + dy, 620, 44, "Attribut lesen: Objekt, Punkt, Name", LIGHTB, BLUE, 24, 700, outl=BLUE), dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(1) + 3.2), lambda d, dy: tag(d, 60, 590 + dy, 620, 44, "Attribut ändern: Zuweisung mit Punkt", LIGHTR, RED, 24, 700, outl=RED), dy=dyf(t, ct(1) + 3.2))

# ---------------------------------------------------------------- 3 Methoden, Default-Parameter
def sc3(f, t, ct):
    heading(f, t, "Methoden mit self, Default-Parameter")
    code = ["    def volumen(self):", "        return math.pi / 4 * self.d ** 2 * self.l", "    def masse(self, dichte=7.85):", "        return self.volumen() / 1000 * dichte / 1000"]
    tm = seq_times(code, [0, 1], ct(0) + 0.3); tm[2] = ct(2) + 0.3; tm[3] = ct(2) + 1.6
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), None), (ct(2), {2, 3})])
    cpanel(f, t, code, 60, 112, 760, 21, 32, hl, tm, title="Python (in der Klasse Welle)", nums=[8, 9, 11, 12])
    calls = ["w = Welle(20, 100)", "print(f\"{w.volumen():.0f} mm³\")", "print(f\"{w.masse():.2f} kg\")", "print(f\"{w.masse(2.70):.2f} kg\")"]
    tm2 = [ct(1) + 0.2, ct(1) + 0.9, ct(2) + 3.2, ct(2) + 5.6]
    hl2 = hl_at(t, [(0, None), (ct(1), {0, 1}), (ct(2) + 2.8, {2}), (ct(2) + 5.2, {3})])
    cpanel(f, t, calls, 60, 320, 760, 21, 32, hl2, tm2, title="Python (Aufrufe)", nums=[20, 21, 22, 23])
    ents = [(ct(1) + 2.0, [("31416 mm³", CODE_T)]), (ct(2) + 3.6, [("0.25 kg", CODE_T)]), (ct(2) + 6.0, [("0.08 kg", CODE_T)])]
    f.el(show(t, ct(1) + 1.8), lambda d, dy: console_panel(d, 60, 530 + dy, 760, 146, ents, t, 22, title="Ausgabe", lh=32), dy=dyf(t, ct(1) + 1.8))
    X = 860
    def kk(d, dy):
        card(d, X, 112 + dy, 360, 190)
        T2(d, X + 26, 124 + dy, "Methode = Funktion", F(26, 700), DARK, "la")
        T2(d, X + 26, 160 + dy, "in der Klasse,", F(24, 400), DARK, "la")
        chiprow(d, X + 26, 200 + dy, [("self", LIGHTR, RED)], 26, 50)
        T2(d, X + 128, 225 + dy, "zuerst", F(24, 400), GREY, "lm")
        T2(d, X + 26, 262 + dy, "Aufruf: Punkt und Klammern", F(22, 600), GREY, "la")
    f.el(show(t, ct(0) + 0.4), kk, dy=dyf(t, ct(0) + 0.4))
    def dd(d, dy):
        card(d, X, 330 + dy, 360, 170)
        T2(d, X + 26, 342 + dy, "Default-Parameter", F(26, 700), DARK, "la")
        chiprow(d, X + 26, 384 + dy, [("dichte=7.85", LIGHTA, AMB)], 24, 48)
        T2(d, X + 26, 446 + dy, "Stahl, g/cm³; ohne Angabe", F(21, 400), GREY, "la")
        T2(d, X + 26, 472 + dy, "gilt der Standardwert", F(21, 400), GREY, "la")
    f.el(show(t, ct(2) + 0.5), dd, dy=dyf(t, ct(2) + 0.5))
    f.el(show(t, ct(2) + 5.4), lambda d, dy: tag(d, X, 530 + dy, 360, 46, "2.70: Aluminium", LIGHTB, BLUE, 26, 700, outl=BLUE), dy=dyf(t, ct(2) + 5.4))

# ---------------------------------------------------------------- 4 Objekte in einer Liste
def sc4(f, t, ct):
    heading(f, t, "Objekte in einer Liste")
    code = ["wellen = [Welle(20, 100), Welle(30, 150), Welle(40, 200)]", "for w in wellen:", "    print(w.d, f\"{w.masse():.2f} kg\")"]
    tm = [ct(0) + 0.3, ct(1) + 0.2, ct(1) + 1.2]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {2})])
    cpanel(f, t, code, 60, 112, 1160, 24, 38, hl, tm)
    ents = [(ct(2) + 0.4 + 0.9 * k, [(s, CODE_T)]) for k, s in enumerate(("20 0.25 kg", "30 0.83 kg", "40 1.97 kg"))]
    f.el(show(t, ct(2)), lambda d, dy: console_panel(d, 60, 330 + dy, 500, 170, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(2)))
    for k, (d_, l_) in enumerate(((20, 100), (30, 150), (40, 200))):
        tin = ct(0) + 1.0 + 0.8 * k; hh = k == min(2, int(max(0, t - ct(2) - 0.4) / 0.9)) and t > ct(2) + 0.4
        def oc(d, dy, k=k, d_=d_, l_=l_, hh=hh):
            objcard(d, 620 + k * 205, 330 + dy, 190, "Welle", [("d", d_), ("l", l_)], None, RED if hh else DARK, 22, 38)
        f.el(show(t, tin), oc, dy=dyf(t, tin))
    f.el(show(t, ct(1) + 0.6), lambda d, dy: T2(d, 620, 486 + dy, "dieselbe Methode, jedes Objekt mit eigenen Maßen", F(23, 600), GREY, "la"), dy=dyf(t, ct(1) + 0.6))
    f.el(show(t, ct(2) + 3.2), lambda d, dy: tag(d, 60, 560 + dy, 540, 46, "eine Baureihe, drei Teile", LIGHTG, GREEN, 28, 700, outl=GREEN), dy=dyf(t, ct(2) + 3.2))

# ---------------------------------------------------------------- 5 Fehler: self vergessen, d statt self.d
def sc5(f, t, ct):
    heading(f, t, "Typische Fehler (1): self")
    c1 = ["    def volumen():", "        return math.pi / 4 * self.d ** 2 * self.l", "print(w.volumen())"]
    cpanel(f, t, c1, 60, 104, 1160, 21, 30, hl_at(t, [(0, None), (ct(0), {0}), (ct(0) + 4.0, {2})]), [ct(0) + 0.2, ct(0) + 0.9, ct(0) + 2.2], title="Fehler 1: self fehlt")
    kon(f, t, ct(0) + 4.0, 60, 268, 1160, [("TypeError: Welle.volumen() takes 0 positional arguments but 1 was given", CODE_R)], 21, 30, "Fehlermeldung")
    f.el(show(t, ct(0) + 1.8), lambda d, dy: tag(d, 880, 150 + dy, 320, 40, "Parameterliste ohne self", LIGHTR, RED, 21, 700, outl=RED), dy=0)
    c2 = ["    def volumen(self):", "        return math.pi / 4 * d ** 2 * l", "print(w.volumen())"]
    cpanel(f, t, c2, 60, 380, 1160, 21, 30, hl_at(t, [(0, None), (ct(1), {1}), (ct(1) + 4.0, {2})]), [ct(1) + 0.2, ct(1) + 0.9, ct(1) + 2.2], alpha_t=ct(1), title="Fehler 2: d statt self.d")
    kon(f, t, ct(1) + 4.0, 60, 546, 1160, [("NameError: name 'd' is not defined", CODE_R)], 21, 30, "Fehlermeldung")
    f.el(show(t, ct(1) + 1.8), lambda d, dy: tag(d, 880, 440 + dy, 320, 40, "richtig: self.d und self.l", LIGHTG, GREEN, 21, 700, outl=GREEN), dy=0)

# ---------------------------------------------------------------- 6 Fehler: Klammern; Merke
def sc6(f, t, ct):
    heading(f, t, "Typische Fehler (2): Klammern")
    code = ["print(w.volumen)", "print(w.volumen())"]
    cpanel(f, t, code, 60, 112, 1160, 24, 38, hl_at(t, [(0, None), (ct(0), {0}), (ct(0) + 5.0, {1})]), [ct(0) + 0.3, ct(0) + 5.0], title="Python")
    ents = [(ct(0) + 2.2, [("<bound method Welle.volumen of <__main__.Welle object at 0x0000013D358A6CF0>>", CODE_R)]), (ct(0) + 6.0, [("31415.926535897932", CODE_T)])]
    for s, c in [e[1][0] for e in ents]: fit(s, M(21), 1160 - 44, "Konsole")
    f.el(show(t, ct(0) + 2.0), lambda d, dy: console_panel(d, 60, 262 + dy, 1160, 124, ents, t, 21, title="Ausgabe", lh=34), dy=dyf(t, ct(0) + 2.0))
    f.el(show(t, ct(0) + 3.4), lambda d, dy: T2(d, 60, 402 + dy, "Die Methode selbst, nicht ihr Ergebnis. Die Adresse (0x...) ist bei jedem Lauf anders.", F(22, 600), GREY, "la"), dy=0)
    f.el(show(t, ct(0) + 6.4), lambda d, dy: T2(d, 60, 436 + dy, "Mit Klammern wird die Methode ausgeführt und liefert die Zahl.", F(22, 600), GREEN, "la"), dy=0)
    for k, (txt, w) in enumerate((("self in die Definition", 350), ("self. vor jedes Attribut", 380), ("Klammern beim Aufruf", 350))):
        tin = ct(1) + 0.4 + 1.8 * k; x = [60, 430, 830][k]
        def mk(d, dy, x=x, w=w, txt=txt):
            d.rounded_rectangle((x, 510 + dy, x + w, 576 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((x + 12, 527 + dy, x + 44, 559 + dy), fill=GREEN); tick(d, x + 28, 543 + dy, 18, WHITE, 3)
            fit(txt, F(24, 700), w - 66, "Merke"); T2(d, x + 56, 543 + dy, txt, F(24, 700), DARK, "lm")
        f.el(show(t, tin), mk, dy=dyf(t, tin))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V20 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-Werkstatt", F(104, 700), DARK)
        T2(d, 90, 290, "Klassen, Attribute, Methoden", F(46, 400), GREY)
        code_n(d, 90, 380, 760, ["class Welle:", "    def __init__(self, d, l):", "        self.d = d", "        self.l = l"], [1, 2, 3, 4], [-1] * 4, 9, 26, 38, {0}, title="Python")
        objcard(d, 930, 380, 290, "Welle", [("d", 20), ("l", 100)], None, DARK, 26, 40)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
