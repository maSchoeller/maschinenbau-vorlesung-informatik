"""V13 Theorie: Laufzeit-Intuition. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]
Ohne Audio (vor der Vertonung) schaetzen scan/stills/zeiten die Dauern aus der Textlaenge."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v13-common"))
from h13 import *
from texte import SRC

NAME = "v13-theorie"; LABEL = "DHBW · Informatik · V13 · Laufzeit-Intuition"
SECS = make_secs(SRC)

def pairs(n): return n * (n - 1) // 2
def pairs_f(x): return x * (x - 1) / 2

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Eine Million Messpunkte, zwei Wege")
    f.el(show(t, 0.3), lambda d, dy: (card(d, 60, 124 + dy, 700, 330), T2(d, 92, 138 + dy, "Schwinggeschwindigkeit, 10 s Messung", F(22, 700), GREY, "la")), dy=dyf(t, 0.3))
    pts = sine_pts(92, 728, 250, 70, 32, 900, noise=26); prog = ap(t, 0.8, 9.0)
    def curve(d, dy):
        k = int(len(pts) * prog)
        if k > 1: d.line([(x, y + dy) for x, y in pts[:k]], fill=RED, width=2)
        d.line((92, 352 + dy, 728, 352 + dy), fill=DARK, width=3)
        T2(d, 92, 360 + dy, "0 s", F(20, 600), GREY, "la"); T2(d, 728, 360 + dy, "10 s", F(20, 600), GREY, "ra")
    f.el(show(t, 0.8), curve)
    f.el(show(t, ct(0) + 3.0), lambda d, dy: T2(d, 410, 368 + dy, "100 000 Messpunkte pro Sekunde", F(24, 700), DARK, "ma"), dy=dyf(t, ct(0) + 3.0))
    f.el(show(t, ct(0) + 7.0), lambda d, dy: tag(d, 230, 404 + dy, 360, 38, "1 000 000 Messpunkte", RED, WHITE, 26), dy=dyf(t, ct(0) + 7.0))
    f.el(show(t, ct(1) + 0.2), lambda d, dy: card(d, 790, 124 + dy, 430, 330), dy=dyf(t, ct(1) + 0.2))
    for cx, nm, tin in ((905, "Schleife", ct(1) + 0.6), (1105, "NumPy", ct(1) + 1.6)):
        f.el(show(t, tin), lambda d, dy, cx=cx, nm=nm: stopwatch(d, cx, 290 + dy, 62, nm, qmark=True), dy=dyf(t, tin))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: T2(d, 1005, 166 + dy, "Zwei Wege, ein Ergebnis", F(24, 700), GREY, "mm"), dy=dyf(t, ct(1) + 3.0))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 500 + dy, 1160, 64, "Wie viel schneller? Erst schätzen, dann messen.", DARK, WHITE, 34), dy=dyf(t, ct(2) + 0.3))
    f.el(show(t, ct(2) + 3.0), lambda d, dy: T2(d, 640, 612 + dy, "Das zeigt nur die Stoppuhr.", F(26, 600), GREY, "mm"), dy=dyf(t, ct(2) + 3.0))

# ---------------------------------------------------------------- 2 linear gegen quadratisch
HOLES = [(60, 50), (150, 70), (240, 45), (300, 110), (90, 130), (200, 150), (280, 165), (40, 170)]

def sc2(f, t, ct):
    heading(f, t, "Schritte wachsen mit den Daten")
    P1 = Plot((130, 196, 590, 336), (0, 10), (0, 50)); P2 = Plot((730, 196, 1190, 336), (0, 10), (0, 50))
    def c1(d, dy):
        card(d, 60, 124 + dy, 560, 290); T2(d, 92, 136 + dy, "Eine Schleife: n Schritte", F(24, 700), DARK, "la")
        P1.axes(d, dy, [0, 2, 4, 6, 8, 10], [0, 10, 20, 30, 40, 50], "n (Daten)", "Schritte")
    f.el(show(t, 0.3), c1, dy=dyf(t, 0.3))
    g1 = ap(t, 0.8, 3.0)
    f.el(show(t, 0.8), lambda d, dy: d.line((P1.px(0), P1.py(0) + dy, P1.px(10 * g1), P1.py(10 * g1) + dy), fill=BLUE, width=5))
    f.el(show(t, ct(0) + 5.0), lambda d, dy: tag(d, 440, 150 + dy, 150, 34, "linear", LIGHTB, BLUE, 22, 700, outl=BLUE), dy=dyf(t, ct(0) + 5.0))
    def c2(d, dy):
        card(d, 660, 124 + dy, 560, 290); T2(d, 692, 136 + dy, "Jeder mit jedem: n(n-1)/2 Paare", F(24, 700), DARK, "la")
        P2.axes(d, dy, [0, 2, 4, 6, 8, 10], [0, 10, 20, 30, 40, 50], "n (Bohrungen)", "Paare")
    f.el(show(t, ct(1) + 0.2), c2, dy=dyf(t, ct(1) + 0.2))
    g2 = ap(t, ct(1) + 0.8, 3.0)
    def l2(d, dy):
        d.line([(P2.px(x), P2.py(pairs_f(x)) + dy) for x in [10 * g2 * k / 40 for k in range(41)]], fill=RED, width=5)
    f.el(show(t, ct(1) + 0.8), l2)
    def pl(d, dy):
        d.rounded_rectangle((60, 436 + dy, 400, 656 + dy), 14, fill=WHITE, outline=DARK, width=3)
        n = 4 + min(4, int((t - (ct(2) + 2.0)) / 0.6)) if t >= ct(2) + 2.0 else 4
        pts = [(80 + x, 450 + y + dy) for x, y in HOLES[:n]]
        for i in range(n):
            for j in range(i + 1, n): d.line((pts[i], pts[j]), fill=mix(WHITE, RED, 0.55), width=2)
        for p in pts: d.ellipse((p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11), fill=WHITE, outline=DARK, width=4)
        T2(d, 430, 470 + dy, f"n = {n}", F(32, 700), DARK, "la"); T2(d, 430, 516 + dy, f"{pairs(n)} Paare", F(32, 700), RED, "la")
        T2(d, 430, 566 + dy, "Linien = Paare", F(20, 400), GREY, "la")
    f.el(show(t, ct(1) + 5.0), pl, dy=dyf(t, ct(1) + 5.0))
    def dots(d, dy):
        for n, tin in ((4, ct(1) + 6.0), (8, ct(2) + 2.2)):
            if ap(t, tin, 0.4) > 0:
                x, y = P2.px(n), P2.py(pairs(n)) + dy
                d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=DARK)
                T2(d, x - 16, y - 8, f"{pairs(n)}", F(24, 700), DARK, "rm")
    f.el(1, dots)
    f.el(show(t, ct(2) + 4.0), lambda d, dy: tag(d, 760, 214 + dy, 300, 34, "doppelt so viele: etwa 4-fach", LIGHTR, RED, 20, 700, outl=RED), dy=dyf(t, ct(2) + 4.0))
    def big(d, dy):
        card(d, 660, 436 + dy, 560, 220)
        T2(d, 690, 454 + dy, "10 000 Bohrungen", F(36, 700), DARK, "la")
        T2(d, 690, 506 + dy, "49 995 000 Paare", F(56, 700), RED, "la")
        T2(d, 690, 590 + dy, "knapp 50 Millionen Vergleiche", F(26, 400), GREY, "la")
    f.el(show(t, ct(2) + 6.0), big, dy=dyf(t, ct(2) + 6.0))

# ---------------------------------------------------------------- 3 Groessenordnungen
def lx(v): return 90 + (v + 10) * 78.5   # v = log10(Sekunden)

def sc3(f, t, ct):
    heading(f, t, "Größenordnungen: Wie lange dauert das?")
    ay = 290
    def ax(d, dy):
        card(d, 60, 124 + dy, 1160, 300)
        d.line((lx(-10), ay + dy, lx(4), ay + dy), fill=DARK, width=4)
        for v, s in ((-9, "1 ns"), (-6, "1 µs"), (-3, "1 ms"), (0, "1 s"), (math.log10(60), "1 min"), (math.log10(3600), "1 h")):
            d.line((lx(v), ay - 10 + dy, lx(v), ay + 10 + dy), fill=DARK, width=3); T2(d, lx(v), ay + 16 + dy, s, F(22, 700), DARK, "ma")
        T2(d, 92, 136 + dy, "Zeit je Vorgang, logarithmische Achse", F(22, 700), GREY, "la")
    f.el(show(t, 0.3), ax, dy=dyf(t, 0.3))
    ex = [(-9.52, "Prozessortakt: 0,3 ns", 222, ct(0) + 1.5), (-7.0, "Python-Anweisung: etwa 0,1 µs", 170, ct(0) + 4.5),
          (-1.78, "Bild bei 60 Hz: 16,7 ms", 222, ct(0) + 6.5), (0.0, "Programmstart: etwa 1 s", 170, ct(0) + 7.5)]
    for v, txt, y, tin in ex:
        w = int(F(21, 700).getlength(txt)) + 28; x = max(70, min(1210 - w, lx(v) - w / 2))
        def e(d, dy, v=v, txt=txt, y=y, w=w, x=x):
            d.line((lx(v), y + 36 + dy, lx(v), ay + dy), fill=GREY, width=2)
            chip(d, x, y + dy, w, 36, txt, WHITE, DARK, 21, outl=LINE)
        f.el(show(t, tin), e, dy=dyf(t, tin))
    stops = [(ct(1) + 1.0, -1.0), (ct(1) + 5.0, 0.699), (ct(1) + 9.0, 2.699)]
    mv = None
    for k, (tt, v) in enumerate(stops):
        if t >= tt: mv = v if k == 0 else lerp(stops[k - 1][1], v, ap(t, tt, 0.8))
    def mk(d, dy):
        x = lx(mv); d.polygon([(x, ay + 50 + dy), (x - 11, ay + 72 + dy), (x + 11, ay + 72 + dy)], fill=RED)
    if mv is not None: f.el(1, mk)
    f.el(show(t, ct(1) + 0.4), lambda d, dy: tag(d, 90, 372 + dy, 280, 34, "Faustwerte, kein Messwert", LIGHTA, AMB, 20, 700, outl=AMBER), dy=dyf(t, ct(1) + 0.4))
    rows = [([("10", 0), ("6", 1), (" Schritte · 10", 0), ("-7", 1), (" s = 0,1 s", 0)], ct(1) + 0.8),
            ([("5 · 10", 0), ("7", 1), (" Paare · 10", 0), ("-7", 1), (" s = 5 s", 0)], ct(1) + 4.2),
            ([("5 · 10", 0), ("9", 1), (" Paare · 10", 0), ("-7", 1), (" s = 500 s, rund 8 min", 0)], ct(1) + 8.2)]
    f.el(show(t, ct(1) + 0.6), lambda d, dy: card(d, 60, 444 + dy, 760, 200), dy=dyf(t, ct(1) + 0.6))
    for k, (segs, tin) in enumerate(rows):
        f.el(show(t, tin), lambda d, dy, k=k, segs=segs: rich(d, 92, 480 + k * 58 + dy, segs, 32, RED if k == 2 else DARK), dy=dyf(t, tin))
    def tile(d, dy):
        card(d, 850, 444 + dy, 370, 200)
        T2(d, 880, 458 + dy, "10-fache Daten", F(30, 700), DARK, "la"); T2(d, 880, 498 + dy, "jeder mit jedem:", F(24, 400), GREY, "la")
        T2(d, 880, 530 + dy, "100-fache Arbeit", F(34, 700), RED, "la"); T2(d, 880, 590 + dy, "Hardware ×100 ist aufgebraucht", F(21, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.6), tile, dy=dyf(t, ct(2) + 0.6))
    f.el(show(t, ct(2) + 6.0), lambda d, dy: tag(d, 190, 654 + dy, 900, 36, "Besserer Algorithmus schlägt schnellere Hardware", RED, WHITE, 24), dy=dyf(t, ct(2) + 6.0))

# ---------------------------------------------------------------- 4 Schleife gegen Vektor
XS = [20, 150, 80, 330, 250, 440, 520, 400]; YS = [0, 34, 6, 40, 4, 30, 2, 52]

def sc4(f, t, ct):
    heading(f, t, "Warum ist NumPy schneller?")
    k = min(8, int(max(0, t - (ct(0) + 1.0)) / 0.55))
    def top(d, dy):
        card(d, 60, 124 + dy, 1160, 236)
        T2(d, 92, 136 + dy, "Python-Schleife über eine Liste", F(26, 700), DARK, "la")
        for i in range(8):
            cx = 92 + i * 62; on = (k - 1 == i) and k < 9
            d.rectangle((cx, 180 + dy, cx + 54, 218 + dy), fill=LIGHTR if on else WHITE, outline=RED if on else LINE, width=3)
            ox = 92 + XS[i] + 130; oy = 262 + YS[i]
            d.line((cx + 27, 218 + dy, ox + 29, oy + dy), fill=LINE if t < ct(2) else GREY, width=2 if t < ct(2) else 3)
            d.rounded_rectangle((ox, oy + dy, ox + 58, oy + 36 + dy), 8, fill=LIGHTR if on else WHITE, outline=RED if on else GREY, width=2)
            T2(d, ox + 29, oy + 18 + dy, str(2 * (i + 1)), F(22, 700), DARK, "mm")
        T2(d, 900, 150 + dy, "Durchläufe", F(24, 600), GREY, "la"); T2(d, 900, 184 + dy, str(k), F(60, 700), RED, "la")
    f.el(show(t, 0.3), top, dy=dyf(t, 0.3))
    f.el(show(t, ct(1) + 0.4), lambda d, dy: tag(d, 830, 278 + dy, 360, 34, "Interpreter prüft jedes Element", LIGHTR, RED, 20, 700, outl=RED), dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(2) + 0.4), lambda d, dy: tag(d, 830, 318 + dy, 360, 34, "Liste: Verweise auf Objekte", LIGHTA, AMB, 20, 700, outl=AMBER), dy=dyf(t, ct(2) + 0.4))
    lit = ap(t, ct(0) + 6.5, 0.4)
    def bot(d, dy):
        card(d, 60, 380 + dy, 1160, 236)
        T2(d, 92, 392 + dy, "NumPy: ein Befehl", F(26, 700), DARK, "la")
        monobox(d, 92, 450 + dy, 170, 48, "a * 2", 30, CODE_T)
        for i in range(8):
            x = 300 + i * 70
            d.rectangle((x, 450 + dy, x + 70, 510 + dy), fill=mix(WHITE, LIGHTG, lit), outline=mix(LINE, GREEN, lit), width=3)
            T2(d, x + 35, 480 + dy, str(2 * (i + 1) * (2 if lit > 0.5 else 1)), F(24, 700), DARK, "mm")
        T2(d, 300, 526 + dy, "alle Zahlen vom gleichen Typ, lückenlos im Speicher", F(22, 600), GREY, "la")
        T2(d, 900, 410 + dy, "Aufrufe", F(24, 600), GREY, "la"); T2(d, 900, 444 + dy, "1", F(80, 700), GREEN, "la")
    f.el(show(t, ct(0) + 4.5), bot, dy=dyf(t, ct(0) + 4.5))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: tag(d, 700, 568 + dy, 470, 36, "vorübersetzter C-Code erledigt die Schleife", LIGHTG, GREEN, 20, 700, outl=GREEN), dy=dyf(t, ct(1) + 3.0))
    f.el(show(t, ct(3) + 0.4), lambda d, dy: tag(d, 60, 632 + dy, 1160, 44, "Gleiche Rechenoperationen, weniger Verwaltungsarbeit je Element", DARK, WHITE, 26), dy=dyf(t, ct(3) + 0.4))

# ---------------------------------------------------------------- 5 Zeit messen
MESS = [1.02, 1.00, 1.05, 1.01, 1.90, 1.03, 1.04, 1.00, 2.40, 1.06]

def sc5(f, t, ct):
    heading(f, t, "Zeit messen mit perf_counter")
    CODE = ["start = time.perf_counter()", "# hier nur die Rechnung", "dauer = time.perf_counter() - start"]
    code_box(f, t, CODE, 60, 124, 640, 24, 36, hl=hl_at(t, [(0, None), (ct(0) + 1.0, {0}), (ct(0) + 3.5, {2})]), times=[0.5, 1.2, 2.0], alpha_t=0.2)
    f.el(show(t, ct(0) + 5.0), lambda d, dy: tag(d, 60, 312 + dy, 640, 38, "Differenz = Dauer des Codes dazwischen", LIGHTB, BLUE, 24, 700, outl=BLUE), dy=dyf(t, ct(0) + 5.0))
    P = Plot((830, 190, 1180, 380), (0, 11), (0.8, 2.6))
    def pl(d, dy):
        card(d, 760, 124 + dy, 460, 400); T2(d, 790, 136 + dy, "Zehn Messungen (Beispiel)", F(24, 700), DARK, "la")
        P.axes(d, dy, [1, 5, 10], [], "Messung", "Dauer")
    f.el(show(t, ct(1) + 0.2), pl, dy=dyf(t, ct(1) + 0.2))
    def pts(d, dy):
        for i, v in enumerate(MESS):
            if t >= ct(1) + 0.8 + 0.5 * i:
                x, y = P.px(i + 1), P.py(v) + dy
                d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=RED if v > 1.5 else DARK)
    f.el(1, pts)
    srt = sorted(MESS); mn = srt[0]; med = (srt[4] + srt[5]) / 2; mean = sum(MESS) / len(MESS)
    for tin, v, col in ((ct(2) + 0.6, mn, GREEN), (ct(2) + 2.4, med, BLUE), (ct(2) + 4.2, mean, RED)):
        f.el(show(t, tin), lambda d, dy, v=v, col=col: P.hline(d, dy, v, col))
    def leg(d, dy):
        for k, (nm, col) in enumerate((("Minimum", GREEN), ("Median", BLUE), ("Mittelwert", RED))):
            x = 790 + k * 140; d.rectangle((x, 458 + dy, x + 22, 480 + dy), fill=col); T2(d, x + 30, 469 + dy, nm, F(21, 700), DARK, "lm")
    f.el(show(t, ct(2) + 0.4), leg)
    f.el(show(t, ct(1) + 5.2), lambda d, dy: tag(d, 60, 360 + dy, 640, 38, "Störungen machen länger, nie kürzer", LIGHTR, RED, 24, 700, outl=RED), dy=dyf(t, ct(1) + 5.2))
    for k, (txt, tin) in enumerate((("mehrfach messen", ct(2) + 0.5), ("Minimum oder Median, nicht Mittelwert", ct(2) + 3.0),
                                    ("nur die Rechnung im Messbereich", ct(2) + 6.0), ("Zeit = Messwert, keine Naturkonstante", ct(2) + 8.5))):
        def ck(d, dy, k=k, txt=txt):
            y = 416 + k * 58
            d.rounded_rectangle((60, y + dy, 700, y + 48 + dy), 12, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((72, y + 8 + dy, 104, y + 40 + dy), fill=GREEN); tick(d, 88, y + 24 + dy, 18, WHITE, 4)
            fit(txt, F(26, 700), 560, "Regel"); T2(d, 118, y + 24 + dy, txt, F(26, 700), DARK, "lm")
        f.el(show(t, tin), ck, dy=dyf(t, tin))

# ---------------------------------------------------------------- 6 Merke
def sc6(f, t, ct):
    heading(f, t, "Merke")
    def kard(x, tin, num, title, lines, body):
        def fn(d, dy):
            card(d, x, 130 + dy, 370, 400)
            d.ellipse((x + 26, 148 + dy, x + 70, 192 + dy), fill=RED); T2(d, x + 48, 170 + dy, num, F(28, 700), WHITE, "mm")
            fit(title, F(30, 700), 270, "Titel"); T2(d, x + 86, 170 + dy, title, F(30, 700), DARK, "lm")
            body(d, x, dy)
            for k, ln in enumerate(lines):
                fit(ln, F(24, 600), 320, "Zeile"); T2(d, x + 28, 420 + k * 34 + dy, ln, F(24, 600), DARK, "la")
        f.el(show(t, tin), fn, dy=dyf(t, tin))
    def b1(d, x, dy):
        pl = Plot((x + 50, 230, x + 340, 380), (0, 10), (0, 50))
        d.line((pl.x0, pl.y1 + dy, pl.x1, pl.y1 + dy), fill=DARK, width=3); d.line((pl.x0, pl.y0 + dy, pl.x0, pl.y1 + dy), fill=DARK, width=3)
        d.line((pl.px(0), pl.py(0) + dy, pl.px(10), pl.py(10) + dy), fill=BLUE, width=5)
        d.line([(pl.px(v / 4), pl.py(pairs_f(v / 4)) + dy) for v in range(0, 41)], fill=RED, width=5)
    def b2(d, x, dy):
        monobox(d, x + 28, 220 + dy, 314, 50, "a * 2", 30); monobox(d, x + 28, 284 + dy, 314, 50, "np.mean(v ** 2)", 28)
        tag(d, x + 28, 348 + dy, 314, 36, "ein Befehl, ganzes Array", LIGHTG, GREEN, 20, 700, outl=GREEN)
    def b3(d, x, dy):
        for k, v in enumerate(MESS):
            xx = x + 40 + k * 29; yy = 380 - (v - 0.8) / 1.8 * 140
            d.ellipse((xx - 7, yy - 7 + dy, xx + 7, yy + 7 + dy), fill=RED if v > 1.5 else DARK)
        d.line((x + 40, 372 + dy, x + 330, 372 + dy), fill=GREEN, width=3)
    kard(60, ct(0) + 0.3, "1", "Schrittzahl", ["Schleife: linear", "jeder mit jedem: quadratisch"], b1)
    kard(455, ct(1) + 0.3, "2", "Vektor", ["Array statt Schleife", "Liste oder Array?", "erst quadrieren, dann mitteln"], b2)
    kard(850, ct(2) + 0.3, "3", "Messen", ["mehrfach messen", "Minimum oder Median"], b3)
    f.el(show(t, ct(2) + 3.0), lambda d, dy: tag(d, 360, 580 + dy, 560, 60, "Weiter ins Labor: du misst selbst", RED, WHITE, 30), dy=dyf(t, ct(2) + 3.0))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V13 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Laufzeit-Intuition", F(84, 700), DARK)
        T2(d, 90, 290, "Schleife oder Vektor? Schätzen, messen, vergleichen", F(44, 400), GREY)
        x = 90
        for nm, (fill, col) in (("Schritte zählen", (LIGHTB, BLUE)), ("NumPy", (LIGHTG, GREEN)), ("Zeit messen", (LIGHTR, RED))):
            wd = int(F(36, 700).getlength(nm)) + 48; chip(d, x, 440, wd, 80, nm, fill, col, 36); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
