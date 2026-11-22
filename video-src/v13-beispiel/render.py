"""V13 Vorgerechnet: Effektivwert von einer Million Messpunkten, Schleife gegen NumPy (Code exakt briefing/v13-beispiel.py).
Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]
Ohne Audio (vor der Vertonung) schaetzen scan/stills/zeiten die Dauern aus der Textlaenge."""
import os, sys, math, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v13-common"))
from h13 import *
from texte import SRC

NAME = "v13-beispiel"; LABEL = "DHBW · Informatik · V13 · Effektivwert: Schleife gegen NumPy"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- exakter Code und Pruefung der Ausgaben (Zeiten werden bewusst nicht gezeigt)
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v13-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 34
for no, frag in ((4, "import math"), (5, "import time"), (6, "import numpy as np"), (8, "N = 1_000_000"), (9, "f = 50.0"), (10, "A = 2.0"), (13, "start = time.perf_counter()"),
                 (15, "for i in range(N):"), (17, "werte.append"), (18, "summe = 0.0"), (19, "for v in werte:"), (21, "rms_schleife"), (22, "dauer_schleife"),
                 (25, "start = time.perf_counter()"), (26, "t = np.arange(N)"), (27, "v = A * np.sin"), (28, "rms_numpy"), (29, "dauer_numpy"), (31, "print("), (34, "print(")):
    assert frag in CODE[no - 1], (no, CODE[no - 1])
RAW = run("\n".join(CODE))
EXPECT = ["Effektivwert Schleife: 1.4142 mm/s in x.xxx s", "Effektivwert NumPy:    1.4142 mm/s in x.xxx s", "Theorie A/sqrt(2):     1.4142 mm/s", "NumPy ist etwa x-mal schneller"]
assert [re.sub(r"\d+\.\d{3} s", "x.xxx s", re.sub(r"etwa \d+-mal", "etwa x-mal", l)) for l in RAW] == EXPECT, RAW
SUMME = sum((2.0 * math.sin(2 * math.pi * 50.0 * (i / 100_000))) ** 2 for i in range(1_000_000)); assert round(SUMME / 1000) * 1000 == 2_000_000, SUMME

CW = 720
def sub(first, last): return CODE[first - 1:last]

# ---------------------------------------------------------------- 1 Aufgabe und Vorbereitung
def sc1(f, t, ct):
    heading(f, t, "Effektivwert aus einer Million Messpunkten")
    pts = sine_pts(92, 800, 218, 52, 24, 700, noise=10); prog = ap(t, 0.8, 8.0)
    def top(d, dy):
        card(d, 60, 124 + dy, 1160, 170)
        T2(d, 92, 136 + dy, "Schwinggeschwindigkeit, 10 s", F(22, 700), GREY, "la")
        k = int(len(pts) * prog)
        if k > 1: d.line([(x, y + dy) for x, y in pts[:k]], fill=RED, width=2)
    f.el(show(t, 0.3), top, dy=dyf(t, 0.3))
    f.el(show(t, 1.0), lambda d, dy: (T2(d, 1020, 140 + dy, "1 000 000", F(60, 700), RED, "ma"), T2(d, 1020, 212 + dy, "Messpunkte", F(30, 700), DARK, "ma")), dy=dyf(t, 1.0))
    f.el(show(t, ct(0) + 6.0), lambda d, dy: (tag(d, 846, 256 + dy, 148, 30, "Schleife", LIGHTB, BLUE, 20, 700, outl=BLUE), tag(d, 1046, 256 + dy, 148, 30, "NumPy", LIGHTG, GREEN, 20, 700, outl=GREEN)), dy=dyf(t, ct(0) + 6.0))
    code_range(f, t, CODE, 4, 10, 60, 314, 1160, 22, 32, hl=hl_at(t, [(0, None), (ct(1) + 0.4, {4, 5, 6}), (ct(1) + 6.5, {8, 9, 10})]), start=1.0, cps=60, alpha_t=0.6, dim=False)
    f.el(show(t, ct(1) + 1.0), lambda d, dy: tag(d, 780, 330 + dy, 400, 34, "importieren: math, time, numpy", LIGHTA, AMB, 20, 700, outl=AMBER), dy=dyf(t, ct(1) + 1.0))

# ---------------------------------------------------------------- 2 Variante 1: Schleife
STEPS2 = [("Uhr", 13, 13), ("Liste füllen", 14, 17), ("Quadrate summieren", 18, 20), ("Wurzel", 21, 21), ("Uhr", 22, 22)]

def sc2(f, t, ct):
    heading(f, t, "Variante 1: die Schleife")
    sched = [(0, None), (ct(0) + 0.3, {13}), (ct(0) + 2.4, {14, 15, 16, 17}), (ct(1) + 0.3, {18, 19, 20}), (ct(1) + 5.0, {21}), (ct(1) + 9.0, {22})]
    cur = hl_at(t, sched)
    code_range(f, t, CODE, 12, 22, 60, 124, CW, 18, 28, hl=cur, start=0.5, cps=90, alpha_t=0.2)
    # Schritt-Chips unter dem Code
    x = 60
    for nm, a, b in STEPS2:
        w = int(F(20, 700).getlength(nm)) + 30; on = cur is not None and a in cur or (cur is not None and b in cur)
        f.el(show(t, ct(0) + 0.5), lambda d, dy, x=x, nm=nm, w=w, on=on: chip(d, x, 520 + dy, w, 38, nm, LIGHTR if on else WHITE, RED if on else GREY, 20, outl=RED if on else LINE))
        x += w + 8
    assert x <= 800
    # werte als Balkenreihe
    n = max(0, min(46, int((t - (ct(0) + 2.4)) / 0.2)))
    def bars(d, dy):
        card(d, 810, 124 + dy, 410, 190)
        T2(d, 836, 136 + dy, "werte", M(22, True), DARK, "la"); T2(d, 1196, 138 + dy, "wächst mit jedem Durchlauf", F(18, 400), GREY, "ra")
        for k in range(n):
            h = 40 + 34 * math.sin(k * 0.55) + 30; d.rectangle((836 + k * 7.6, 300 - h + dy, 836 + k * 7.6 + 5, 300 + dy), fill=BLUE)
    f.el(show(t, ct(0) + 2.2), bars, dy=dyf(t, ct(0) + 2.2))
    def sm(d, dy):
        card(d, 810, 330 + dy, 410, 126)
        T2(d, 836, 340 + dy, "summe (Quadrate addiert)", F(20, 600), GREY, "la")
        T2(d, 836, 372 + dy, "etwa 2 000 000", F(44, 700), DARK, "la")
        T2(d, 836, 428 + dy, "Wurzel(summe / N) = 1.4142", F(20, 700), RED, "la")
    f.el(show(t, ct(1) + 0.6), sm, dy=dyf(t, ct(1) + 0.6))
    def sw(d, dy):
        card(d, 810, 464 + dy, 410, 190)
        stopwatch(d, 900, 540 + dy, 34); stopwatch(d, 1020, 540 + dy, 34, hand=40)
        T2(d, 900, 596 + dy, "Zeile 13", F(20, 700), DARK, "mm"); T2(d, 1020, 596 + dy, "Zeile 22", F(20, 700), DARK, "mm")
        T2(d, 1120, 520 + dy, "nachher", F(20, 600), GREY, "la"); T2(d, 1120, 544 + dy, "minus", F(20, 600), GREY, "la"); T2(d, 1120, 568 + dy, "vorher", F(20, 600), GREY, "la")
        T2(d, 1015, 634 + dy, "= Dauer", F(22, 700), RED, "mm")
    f.el(show(t, ct(0) + 0.6), lambda d, dy: (card(d, 810, 464 + dy, 410, 190), stopwatch(d, 900, 540 + dy, 34), T2(d, 900, 596 + dy, "Zeile 13", F(20, 700), DARK, "mm")), dy=dyf(t, ct(0) + 0.6))
    f.el(show(t, ct(1) + 9.0), sw, dy=dyf(t, ct(1) + 9.0))

# ---------------------------------------------------------------- 3 Variante 2: NumPy
def sc3(f, t, ct):
    heading(f, t, "Variante 2: NumPy")
    sched = [(0, None), (ct(0) + 0.3, {25}), (ct(0) + 2.6, {26}), (ct(1) + 0.3, {27}), (ct(2) + 0.3, {28}), (ct(2) + 8.5, {29})]
    code_range(f, t, CODE, 24, 29, 60, 124, CW, 20, 30, hl=hl_at(t, sched), start=0.5, cps=90, alpha_t=0.2)
    def sw(d, dy):
        card(d, 810, 124 + dy, 410, 248)
        stopwatch(d, 900, 214 + dy, 40); stopwatch(d, 1100, 214 + dy, 40, hand=15)
        T2(d, 900, 278 + dy, "Zeile 25", F(22, 700), DARK, "mm"); T2(d, 1100, 278 + dy, "Zeile 29", F(22, 700), DARK, "mm")
        T2(d, 1015, 330 + dy, "Dauer = nachher minus vorher", F(22, 600), GREY, "mm")
    f.el(show(t, ct(0) + 0.5), lambda d, dy: (card(d, 810, 124 + dy, 410, 248), stopwatch(d, 900, 214 + dy, 40), T2(d, 900, 278 + dy, "Zeile 25", F(22, 700), DARK, "mm")), dy=dyf(t, ct(0) + 0.5))
    f.el(show(t, ct(2) + 8.5), sw, dy=dyf(t, ct(2) + 8.5))
    rows = [("t", "Zeile 26", BLUE, LIGHTB, ct(0) + 3.0), ("v", "Zeile 27", GREEN, LIGHTG, ct(1) + 3.0), ("v ** 2", "Zeile 28", AMB, LIGHTA, ct(2) + 3.0)]
    for k, (nm, zl, col, fill, tin) in enumerate(rows):
        lit = ap(t, tin, 0.3)
        def row(d, dy, k=k, nm=nm, zl=zl, col=col, fill=fill, lit=lit):
            y = 410 + k * 82
            T2(d, 60, y + 30 + dy, nm, M(26, True), DARK, "lm")
            for c in range(28):
                x = 200 + c * 31; d.rectangle((x, y + 6 + dy, x + 30, y + 56 + dy), fill=mix(WHITE, fill, lit), outline=mix(LINE, col, lit), width=2)
            tag(d, 1090, y + 14 + dy, 130, 34, "1 Schritt", WHITE if lit < 0.5 else col, GREY if lit < 0.5 else WHITE, 20, 700, outl=LINE)
        f.el(show(t, tin - 0.4), row, dy=dyf(t, tin - 0.4))
    f.el(show(t, ct(0) + 4.5), lambda d, dy: T2(d, 640, 392 + dy, "ganze Arrays mit je einer Million Werten", F(22, 600), GREY, "mm"), dy=dyf(t, ct(0) + 4.5))
    f.el(show(t, ct(2) + 6.0), lambda d, dy: tag(d, 60, 650 + dy, 1160, 36, "Effektivwert: quadrieren, mitteln, Wurzel ziehen", RED, WHITE, 24), dy=dyf(t, ct(2) + 6.0))

# ---------------------------------------------------------------- 4 Ausgabe
def con(f, t, entries, y, h, size=22):
    f.el(ap(t, 0.0, 0.3) * (1.0), lambda d, dy: console_panel(d, 60, y + dy, 1160, h, entries, t, size, title="Ausgabe", lh=int(size * 1.45)))

def sc4(f, t, ct):
    heading(f, t, "Die Ausgabe")
    code_range(f, t, CODE, 31, 34, 60, 124, 1160, 18, 28, hl=hl_at(t, [(0, None), (ct(0) + 1.0, {31, 32}), (ct(1) + 0.3, {33})]), start=0.4, cps=120, alpha_t=0.2)
    ents = [(ct(0) + 2.0, [(EXPECT[0], CODE_T)]), (ct(0) + 4.0, [(EXPECT[1], CODE_T)]), (ct(1) + 1.0, [(EXPECT[2], CODE_T)]), (ct(1) + 30, [(EXPECT[3], CODE_T)])]
    ents = ents[:3]
    f.el(show(t, ct(0) + 1.8), lambda d, dy: console_panel(d, 60, 324 + dy, 1160, 46 + 32 * 3 + 16, ents, t, 22, title="Ausgabe (Zeiten ändern sich bei jedem Lauf)", lh=32), dy=dyf(t, ct(0) + 1.8))
    vals = [("Schleife", ct(0) + 4.5), ("NumPy", ct(0) + 5.5), ("Theorie A/sqrt(2)", ct(1) + 1.5)]
    for k, (nm, tin) in enumerate(vals):
        x = 60 + k * 400
        def tile(d, dy, x=x, nm=nm):
            card(d, x, 520 + dy, 360, 130); T2(d, x + 28, 534 + dy, nm, F(24, 600), GREY, "la"); T2(d, x + 28, 570 + dy, "1.4142", F(54, 700), DARK, "la"); T2(d, x + 232, 596 + dy, "mm/s", F(26, 600), GREY, "la")
        f.el(show(t, tin), tile, dy=dyf(t, tin))
    for k, tin in ((0, ct(0) + 6.0), (1, ct(1) + 2.5)):
        def eq(d, dy, k=k):
            cx = 60 + k * 400 + 380; d.ellipse((cx - 20, 563 + dy, cx + 20, 603 + dy), fill=GREEN); d.line((cx - 10, 577 + dy, cx + 10, 577 + dy), fill=WHITE, width=5); d.line((cx - 10, 589 + dy, cx + 10, 589 + dy), fill=WHITE, width=5)
        f.el(show(t, tin), eq, dy=dyf(t, tin))

# ---------------------------------------------------------------- 5 Zeiten sind Messwerte
def sc5(f, t, ct):
    heading(f, t, "Die Zeiten sind Messwerte")
    ents = [(ct(0) + 0.8, [(EXPECT[0], CODE_T)]), (ct(0) + 2.0, [(EXPECT[1], CODE_T)]), (ct(0) + 3.2, [(EXPECT[2], CODE_T)]), (ct(1) + 0.6, [(EXPECT[3], CODE_N)])]
    f.el(ap(t, 0.2, 0.4), lambda d, dy: console_panel(d, 60, 124 + dy, 1160, 46 + 32 * 4 + 16, ents, t, 22, title="Ausgabe", lh=32))
    f.el(show(t, ct(0) + 4.5), lambda d, dy: (tag(d, 890, 190 + dy, 300, 30, "x.xxx: variiert bei jedem Lauf", LIGHTA, AMB, 18, 700, outl=AMBER)), dy=dyf(t, ct(0) + 4.5))
    # Laeufe als Balken ohne Zahlen
    def runs(d, dy):
        card(d, 60, 340 + dy, 560, 210); T2(d, 90, 352 + dy, "fünf Läufe, fünf verschiedene Zeiten (schematisch)", F(22, 700), DARK, "la")
        for k, w in enumerate((300, 340, 270, 410, 315)):
            y = 396 + k * 30; T2(d, 90, y + 11 + dy, f"Lauf {k + 1}", F(18, 600), GREY, "lm")
            d.rectangle((170, y + dy, 170 + w, y + 22 + dy), fill=(190, 198, 210) if w != 270 else GREEN)
    f.el(show(t, ct(0) + 5.5), runs, dy=dyf(t, ct(0) + 5.5))
    f.el(show(t, ct(1) + 2.5), lambda d, dy: tag(d, 90, 566 + dy, 530, 40, "Faktor = Messwert, keine Naturkonstante", LIGHTR, RED, 22, 700, outl=RED), dy=dyf(t, ct(1) + 2.5))
    f.el(show(t, ct(1) + 5.5), lambda d, dy: tag(d, 90, 616 + dy, 530, 40, "mehrfach ausführen, Minimum berichten", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ct(1) + 5.5))
    for k, (num, txt, tin) in enumerate((("1", "Beide Wege gleicher Effektivwert?", ct(2) + 0.4), ("2", "Erst dann zählt der Zeitvergleich", ct(2) + 4.5))):
        def st(d, dy, k=k, num=num, txt=txt):
            y = 340 + k * 110; card(d, 650, y + dy, 570, 96)
            d.ellipse((676, y + 24 + dy, 724, y + 72 + dy), fill=RED); T2(d, 700, y + 48 + dy, num, F(30, 700), WHITE, "mm")
            fit(txt, F(24, 700), 460, "Schritt"); T2(d, 740, y + 48 + dy, txt, F(24, 700), DARK, "lm")
        f.el(show(t, tin), st, dy=dyf(t, tin))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V13 · Vorgerechnetes Beispiel", F(34, 600), GREY)
        T2(d, 90, 170, "Eine Million Messpunkte", F(84, 700), DARK)
        T2(d, 90, 290, "Effektivwert: Schleife gegen NumPy", F(44, 400), GREY)
        for k, (nm, fill, col) in enumerate((("Schleife", LIGHTB, BLUE), ("NumPy", LIGHTG, GREEN))):
            chip(d, 90 + k * 250, 440, 230, 80, nm, fill, col, 36)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
