"""V13 Python: Syntax-Karten zu NumPy und Zeitmessung. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]
Ohne Audio (vor der Vertonung) schaetzen scan/stills/zeiten die Dauern aus der Textlaenge."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v13-common"))
from h13 import *
from texte import SRC

NAME = "v13-python"; LABEL = "DHBW · Informatik · V13 · NumPy und Zeitmessung"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Codebeispiele (Ausgaben werden wirklich berechnet)
IMP = "import numpy as np"
C1 = [IMP, "liste = [2, 4, 6]", "a = np.array(liste)", "print(a.shape, len(a))", "print(a)", "print(liste * 2)", "print(a * 2)"]
O1 = run("\n".join(C1)); assert O1 == ["(3,) 3", "[2 4 6]", "[2, 4, 6, 2, 4, 6]", "[ 4  8 12]"], O1
C2 = [IMP, "print(np.arange(5))", "print(np.arange(0, 1, 0.25))", "print(np.linspace(0, 1, 5))", "fs = 4", "N = 8", "t = np.arange(N) / fs", "print(t)"]
O2 = run("\n".join(C2)); assert O2[0] == "[0 1 2 3 4]" and len(O2) == 4, O2
C3 = [IMP, "a = np.array([1.0, 2.0, 3.0])", "b = np.array([10.0, 20.0, 30.0])", "print(a + b)", "print(a ** 2)", "print(np.sqrt(a))",
      "c = np.array([10.0, 20.0, 30.0, 40.0])", "print(a + c)"]
O3 = run("\n".join(C3[:-1])); assert O3[0] == "[11. 22. 33.]", O3
try: run("\n".join(C3)); raise SystemExit("ValueError erwartet")
except ValueError as e: assert str(e).strip() == "operands could not be broadcast together with shapes (3,) (4,)", str(e)
ERR3 = ["ValueError: operands could not be broadcast", "together with shapes (3,) (4,)"]
C4 = [IMP, "v = np.array([3.0, -4.0, 5.0])", "print(np.mean(v), np.max(v), np.min(v), np.sum(v))", "print(np.sqrt(np.mean(v ** 2)))", "print(np.sqrt(np.mean(v) ** 2))"]
O4 = run("\n".join(C4)); assert O4[1].startswith("4.08248") and O4[2].startswith("1.3333"), O4
C5 = [IMP, "a = np.array([1, 5, 2, 8, 3])", "print(a > 3)", "print(a[a > 3])", "print(len(a[a > 3]) / len(a))", "print(a[(a > 1) & (a < 8)])"]
O5 = run("\n".join(C5)); assert O5 == ["[False  True False  True False]", "[5 8]", "0.4", "[5 2 3]"], O5
C5B = [IMP, 'a = np.loadtxt("waschmaschine.csv", delimiter=",",', "               skiprows=1, usecols=4)"]
C6 = ["import time", IMP, "zeiten = []", "for versuch in range(7):", "    start = time.perf_counter()", "    summe = np.sum(np.arange(100_000) ** 2)",
      "    zeiten.append(time.perf_counter() - start)", "print(min(zeiten), np.median(zeiten))"]
run("\n".join(C6[:-1]))   # Code laeuft; Zeitwerte werden bewusst NICHT angezeigt

# ---------------------------------------------------------------- Bausteine
CW = 660
def left(f, t, code, outs, t0, out_t, size=22, lh=32, hl=None, title="Ausgabe", tout=None, alpha_out=None):
    """Code links (Schreibmaschine ab t0) und darunter die Konsole; outs: [(text, farbe)], out_t: Startzeiten."""
    times = seq_times(code, range(len(code)), t0, 45)
    code_box(f, t, code, 60, 124, CW, size, lh, hl=hl, times=times, alpha_t=max(0.0, t0 - 0.3), dim=False)
    h = 50 + lh * len(code) + 18; y = 124 + h + 14; clh = int((size - 2) * 1.45)
    ents = [(tt, [(txt, col)]) for (txt, col), tt in zip(outs, out_t)]; ch = 46 + clh * len(outs) + 16
    f.el(ap(t, out_t[0] - 0.3, 0.3) * (1 - (ap(t, tout, 0.3) if tout else 0)), lambda d, dy: console_panel(d, 60, y + dy, CW, ch, ents, t, size - 2, title=title, lh=clh))

def cells(d, x, y, vals, cw=60, ch=46, fill=WHITE, outl=LINE, col=DARK, size=24, w=3):
    for k, v in enumerate(vals):
        d.rectangle((x + k * cw, y, x + (k + 1) * cw, y + ch), fill=fill, outline=outl, width=w)
        T2(d, x + k * cw + cw / 2, y + ch / 2, str(v), F(size, 700), col, "mm")

def rcard(f, t, tin, y, h, title, body, tout=None, mono=True):
    def fn(d, dy):
        card(d, 730, y + dy, 490, h)
        if mono: fit(title, M(22, True), 450, "Kartentitel"); T2(d, 756, y + 16 + dy, title, M(22, True), DARK, "la")
        else: fit(title, F(24, 700), 450, "Kartentitel"); T2(d, 756, y + 14 + dy, title, F(24, 700), DARK, "la")
        body(d, dy)
    f.el(show(t, tin, tout), fn, dy=dyf(t, tin))

# ---------------------------------------------------------------- 1 Array und Liste
def sc1(f, t, ct):
    heading(f, t, "NumPy: das Array")
    left(f, t, C1, [(l, CODE_T) for l in O1], 0.6, [ct(1) + 1.0, ct(1) + 3.2, ct(2) + 1.0, ct(2) + 5.0],
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {0}), (ct(0) + 5.0, {2}), (ct(1) + 0.3, {3, 4}), (ct(2) + 0.3, {5}), (ct(2) + 3.8, {6})]))
    def b1(d, dy):
        cells(d, 756, 176 + dy, [2, 4, 6]); d.line((950, 199 + dy, 990, 199 + dy), fill=GREY, width=3)
        chip(d, 1000, 176 + dy, 190, 46, "shape (3,)", LIGHTB, BLUE, 24)
    rcard(f, t, ct(0) + 4.5, 124, 124 + 40, "a = np.array(liste)", b1)
    def b2(d, dy):
        cells(d, 756, 354 + dy, [2, 4, 6, 2, 4, 6], 62, 44, LIGHTR, RED, RED)
        T2(d, 756, 410 + dy, "6 Elemente: Liste zweimal angehängt", F(22, 600), RED, "la")
    rcard(f, t, ct(2) + 0.4, 304, 140, "liste * 2", b2)
    def b3(d, dy):
        cells(d, 756, 536 + dy, [4, 8, 12], 62, 44, LIGHTG, GREEN, DARK)
        T2(d, 756, 590 + dy, "jeder Wert verdoppelt", F(22, 600), GREEN, "la")
    rcard(f, t, ct(2) + 3.8, 484, 140, "a * 2", b3)

# ---------------------------------------------------------------- 2 arange, linspace
def numline(d, x0, y, scale, pts, open_pts=(), labels=True, size=20):
    d.line((x0 - 10, y, x0 + (max(list(pts) + list(open_pts)) + 0.08) * scale, y), fill=DARK, width=3)
    for v in pts:
        x = x0 + v * scale; d.ellipse((x - 11, y - 11, x + 11, y + 11), fill=GREEN, outline=DARK, width=2)
        if labels: T2(d, x, y + 22, f"{v:g}", F(size, 600), GREY, "ma")
    for v in open_pts:
        x = x0 + v * scale; d.ellipse((x - 11, y - 11, x + 11, y + 11), fill=WHITE, outline=RED, width=4)
        T2(d, x, y + 22, f"{v:g}", F(size, 700), RED, "ma")

def sc2(f, t, ct):
    heading(f, t, "Zahlenreihen: arange und linspace")
    left(f, t, C2, [(l, CODE_T) for l in O2], 0.6, [ct(0) + 1.5, ct(0) + 4.5, ct(1) + 1.5, ct(2) + 3.0], size=20, lh=30,
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {1, 2}), (ct(1) + 0.3, {3}), (ct(2) + 0.3, {4, 5, 6, 7})]))
    def b1(d, dy):
        numline(d, 770, 232 + dy, 320, [0, 0.25, 0.5, 0.75], [1])
        tag(d, 1010, 180 + dy, 190, 30, "Stopp: nicht dabei", LIGHTR, RED, 18, 700, outl=RED)
    rcard(f, t, ct(0) + 0.5, 124, 148, "np.arange(0, 1, 0.25)", b1)
    def b2(d, dy):
        numline(d, 770, 396 + dy, 320, [0, 0.25, 0.5, 0.75, 1.0])
        tag(d, 990, 344 + dy, 210, 30, "Ende: eingeschlossen", LIGHTG, GREEN, 18, 700, outl=GREEN)
    rcard(f, t, ct(1) + 0.3, 288, 148, "np.linspace(0, 1, 5)", b2)
    def b3(d, dy):
        numline(d, 770, 552 + dy, 240, [k / 4 for k in range(8)], labels=False)
        T2(d, 770, 580 + dy, "Abstand 1 / fs = 0.25 s", F(22, 700), BLUE, "la")
        T2(d, 1190, 580 + dy, "N = 8 Punkte", F(22, 600), GREY, "ra")
    rcard(f, t, ct(2) + 0.3, 452, 160, "t = np.arange(N) / fs", b3)

# ---------------------------------------------------------------- 3 elementweise
def sc3(f, t, ct):
    heading(f, t, "Elementweise rechnen")
    outs = [(l, CODE_T) for l in O3] + [(l, CODE_R) for l in ERR3]
    left(f, t, C3, outs, 0.6, [ct(0) + 2.0, ct(0) + 4.5, ct(0) + 6.5, ct(1) + 1.5, ct(1) + 1.5], size=20, lh=30,
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {3, 4, 5}), (ct(1) + 0.3, {1, 6, 7})]))
    def b1(d, dy):
        cells(d, 840, 168 + dy, [1, 2, 3], 80, 44); cells(d, 840, 232 + dy, [10, 20, 30], 80, 44)
        for k in range(3): arrow(d, 880 + k * 80, 278 + dy, 880 + k * 80, 306 + dy, DARK, 3, 9)
        cells(d, 840, 310 + dy, [11, 22, 33], 80, 44, LIGHTG, GREEN)
        T2(d, 820, 190 + dy, "a", F(26, 700), GREY, "rm"); T2(d, 820, 254 + dy, "b", F(26, 700), GREY, "rm"); T2(d, 826, 332 + dy, "a+b", F(24, 700), GREEN, "rm")
    rcard(f, t, ct(0) + 0.5, 124, 256, "paarweise: a + b", b1, mono=True)
    def b2(d, dy):
        cells(d, 780, 450 + dy, [1, 2, 3], 70, 44); cells(d, 780, 506 + dy, [10, 20, 30, 40], 70, 44, LIGHTR, RED, RED)
        T2(d, 1090, 472 + dy, "(3,)", M(24, True), DARK, "la"); T2(d, 1090, 528 + dy, "(4,)", M(24, True), RED, "la")
        tag(d, 756, 566 + dy, 440, 34, "verschieden lang: ValueError", RED, WHITE, 22)
    rcard(f, t, ct(1) + 0.5, 400, 220, "a + c", b2, mono=True)

# ---------------------------------------------------------------- 4 Kennwerte, Effektivwert
def sc4(f, t, ct):
    heading(f, t, "Kennwerte und Effektivwert")
    left(f, t, C4, [(l, CODE_T) for l in O4], 0.6, [ct(0) + 4.5, ct(1) + 3.0, ct(1) + 12.0], size=20, lh=30,
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {2}), (ct(1) + 0.3, {3}), (ct(1) + 8.5, {4})]))
    def row(y, tin, lab, col, steps, last):
        def fn(d, dy):
            card(d, 730, y + dy, 490, 200)
            T2(d, 756, y + 14 + dy, lab, F(26, 700), col, "la")
            for k, (a, b) in enumerate(steps):
                x = 756 + k * 156
                d.rounded_rectangle((x, y + 76 + dy, x + 134, y + 168 + dy), 12, fill=WHITE, outline=col, width=3)
                T2(d, x + 67, y + 96 + dy, a, M(20), GREY, "mm"); T2(d, x + 67, y + 138 + dy, b, F(30 if len(b) < 9 else 24, 700), DARK if k < 2 else last, "mm")
                if k < 2: arrow(d, x + 136, y + 122 + dy, x + 154, y + 122 + dy, col, 3, 9)
        f.el(show(t, tin), fn, dy=dyf(t, tin))
    row(124, ct(1) + 3.0, "richtig: erst quadrieren", GREEN, [("v ** 2", "9 16 25"), ("mean", "16.67"), ("sqrt", "4.08")], GREEN)
    row(344, ct(1) + 8.5, "falsch: erst mitteln", RED, [("mean(v)", "1.33"), ("** 2", "1.78"), ("sqrt", "1.33")], RED)
    f.el(show(t, ct(1) + 12.5), lambda d, dy: tag(d, 730, 564 + dy, 490, 44, "bei Schwingungen: fast null", RED, WHITE, 26), dy=dyf(t, ct(1) + 12.5))
    f.el(show(t, ct(0) + 5.5), lambda d, dy: tag(d, 60, 560 + dy, 660, 40, "fasst ein Array zu einer Zahl zusammen", LIGHTB, BLUE, 24, 700, outl=BLUE), dy=dyf(t, ct(0) + 5.5))

# ---------------------------------------------------------------- 5 Masken und loadtxt
def sc5(f, t, ct):
    heading(f, t, "Masken und Messdaten laden")
    tsw = ct(2) - 0.2
    # Code A samt Konsole (blendet bei Seitenwechsel aus)
    ca = 1 - ap(t, tsw, 0.3)
    saved = f.master; f.master = saved * ca
    left(f, t, C5, [(l, CODE_T) for l in O5], 0.6, [ct(0) + 4.0, ct(0) + 6.0, ct(1) + 1.5, ct(1) + 5.0], size=20, lh=30,
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {2, 3}), (ct(1) + 0.3, {4, 5})]))
    def bA(d, dy):
        card(d, 730, 124 + dy, 490, 400)
        arr = [1, 5, 2, 8, 3]; mk = [v > 3 for v in arr]
        T2(d, 756, 138 + dy, "a", M(24, True), DARK, "la")
        cells(d, 780, 138 + dy, arr, 64, 46)
        T2(d, 756, 232 + dy, "a > 3", M(22, True), DARK, "la")
        if t >= ct(0) + 3.5:
            for k, m in enumerate(mk):
                x = 780 + k * 64; d.rectangle((x, 258 + dy, x + 64, 304 + dy), fill=LIGHTG if m else LIGHTR, outline=GREEN if m else RED, width=3)
                T2(d, x + 32, 281 + dy, "Wahr" if m else "Falsch", F(20, 700), GREEN if m else RED, "mm")
        if t >= ct(0) + 5.5:
            T2(d, 756, 336 + dy, "a[a > 3]", M(22, True), DARK, "la"); cells(d, 780, 364 + dy, [5, 8], 64, 46, LIGHTG, GREEN)
            T2(d, 920, 388 + dy, "nur die passenden", F(22, 600), GREEN, "la")
        if t >= ct(1) + 2.0:
            tag(d, 756, 436 + dy, 440, 36, "len(a[a > 3]) / len(a) = 2 / 5", LIGHTB, BLUE, 22, 700, outl=BLUE)
        if t >= ct(1) + 4.5:
            tag(d, 756, 482 + dy, 440, 32, "zwei Bedingungen: & oder |, je in Klammern", LIGHTA, AMB, 18, 700, outl=AMBER)
    f.el(show(t, ct(0) + 0.3, tsw), bA, dy=dyf(t, ct(0) + 0.3))
    f.master = saved
    # Seite B: loadtxt
    tb = tsw + 0.3
    code_range(f, t, C5B, 1, 3, 60, 124, CW, 20, 30, hl=hl_at(t, [(0, None), (ct(2) + 0.4, {2}), (ct(2) + 2.0, {2, 3})]), start=tb, cps=40, alpha_t=tb, dim=False)
    for k, (nm, col, tin) in enumerate((('delimiter=","  Trennzeichen', BLUE, ct(2) + 1.5), ("skiprows=1  Kopfzeile überspringen", RED, ct(2) + 3.0), ("usecols=4  nur diese Spalte", GREEN, ct(2) + 4.5))):
        def tg(d, dy, k=k, nm=nm, col=col):
            fit(nm, M(20, True), 600, "Parameter"); d.rounded_rectangle((60, 300 + k * 56 + dy, 700, 346 + k * 56 + dy), 10, fill=WHITE, outline=col, width=3)
            T2(d, 80, 323 + k * 56 + dy, nm, M(20, True), col, "lm")
        f.el(show(t, tin), tg, dy=dyf(t, tin))
    def tb_(d, dy):
        card(d, 730, 124 + dy, 490, 300)
        T2(d, 756, 138 + dy, "Datei (schematisch)", F(22, 700), GREY, "la")
        for c in range(5):
            x = 756 + c * 88; hot = c == 4 and t >= ct(2) + 4.5
            d.rectangle((x, 180 + dy, x + 88, 224 + dy), fill=(236, 236, 238), outline=LINE, width=2)
            T2(d, x + 44, 202 + dy, f"Spalte {c}", F(18, 700), GREY, "mm")
            for r in range(3):
                d.rectangle((x, 224 + r * 44 + dy, x + 88, 268 + r * 44 + dy), fill=LIGHTG if hot else WHITE, outline=GREEN if hot else LINE, width=3 if hot else 2)
                d.line((x + 20, 246 + r * 44 + dy, x + 68, 246 + r * 44 + dy), fill=GREEN if hot else LINE, width=6)
        if t >= ct(2) + 3.0:
            d.rectangle((756, 180 + dy, 756 + 440, 224 + dy), outline=RED, width=4)
            tag(d, 756, 364 + dy, 440, 36, "Kopfzeile: wird übersprungen", LIGHTR, RED, 20, 700, outl=RED)
    f.el(show(t, tb), tb_, dy=dyf(t, tb))

# ---------------------------------------------------------------- 6 Zeit messen
ZW = [1.03, 1.00, 1.40, 1.01, 1.02, 1.80, 1.04]

def sc6(f, t, ct):
    heading(f, t, "Zeit messen")
    left(f, t, C6, [("Zwei Zeiten in Sekunden, bei jedem Lauf anders", CODE_C)], 0.6, [ct(1) + 3.0], size=20, lh=30, title="Ausgabe (Zahlen hängen vom Rechner ab)",
         hl=hl_at(t, [(0, None), (ct(0) + 0.3, {4, 6}), (ct(1) + 0.3, {3, 7}), (ct(1) + 5.0, {5})]))
    P = Plot((790, 190, 1190, 380), (0, 8), (0.8, 2.0))
    def pl(d, dy):
        card(d, 730, 124 + dy, 490, 400); T2(d, 756, 136 + dy, "Sieben Messungen (Beispiel)", F(24, 700), DARK, "la")
        P.axes(d, dy, [1, 4, 7], [], "Messung", "Dauer")
    f.el(show(t, ct(1) + 0.3), pl, dy=dyf(t, ct(1) + 0.3))
    def pts(d, dy):
        for i, v in enumerate(ZW):
            if t >= ct(1) + 0.8 + 0.6 * i:
                x, y = P.px(i + 1), P.py(v) + dy; d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=RED if v > 1.3 else DARK)
    f.el(1, pts)
    srt = sorted(ZW)
    for tin, v, col in ((ct(1) + 5.2, srt[0], GREEN), (ct(1) + 7.0, srt[3], BLUE)):
        f.el(show(t, tin), lambda d, dy, v=v, col=col: P.hline(d, dy, v, col))
    def leg(d, dy):
        for k, (nm, col) in enumerate((("min", GREEN), ("np.median", BLUE))):
            x = 770 + k * 150; d.rectangle((x, 452 + dy, x + 22, 474 + dy), fill=col); T2(d, x + 30, 463 + dy, nm, M(20, True), DARK, "lm")
        T2(d, 756, 490 + dy, "Beispielwerte, keine echte Messung", F(20, 400), GREY, "la")
    f.el(show(t, ct(1) + 5.0), leg)
    f.el(show(t, ct(1) + 8.5), lambda d, dy: tag(d, 60, 552 + dy, 660, 40, "zwischen den Aufrufen: nur die Rechnung, kein print", LIGHTB, BLUE, 22, 700, outl=BLUE), dy=dyf(t, ct(1) + 8.5))
    f.el(show(t, ct(2) + 0.4), lambda d, dy: tag(d, 60, 612 + dy, 1160, 56, "Zeiten sind Messwerte: sie hängen von deinem Rechner ab", RED, WHITE, 30), dy=dyf(t, ct(2) + 0.4))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V13 · Python-Werkzeugkasten", F(34, 600), GREY)
        T2(d, 90, 170, "NumPy und Zeitmessung", F(84, 700), DARK)
        T2(d, 90, 290, "Array, elementweise Rechnung, Masken, perf_counter", F(44, 400), GREY)
        monobox(d, 90, 440, 620, 80, "v = np.array([3.0, -4.0, 5.0])", 32, CODE_T)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
