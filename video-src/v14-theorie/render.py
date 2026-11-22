"""V14 Theorie: Visualisierung, Diagramme die stimmen. Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v14-common"))
from h14 import *
from texte import SRC

NAME = "v14-theorie"; LABEL = "DHBW · Informatik · V14 · Visualisierung"
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTK = (238, 239, 242)

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def polyline(d, pts, col, w=4, frac=1.0, dash=False):
    """Linienzug; nur der Anteil frac (0..1) der Gesamtlaenge wird gezeichnet."""
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L); lim = tot * frac; acc = 0
    for i, l in enumerate(L):
        if acc >= lim: break
        r = min(1.0, (lim - acc) / l) if l else 1; (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        xe, ye = x0 + (x1 - x0) * r, y0 + (y1 - y0) * r
        if dash:
            n = max(1, int(math.dist((x0, y0), (xe, ye)) / 16))
            for k in range(n):
                a = k / n; b = (k + 0.55) / n
                d.line((x0 + (xe - x0) * a, y0 + (ye - y0) * a, x0 + (xe - x0) * b, y0 + (ye - y0) * b), fill=col, width=w)
        else:
            d.line((x0, y0, xe, ye), fill=col, width=w)
        acc += l

def dots(d, pts, col, r=6, fill=None):
    for x, y in pts: d.ellipse((x - r, y - r, x + r, y + r), fill=fill or col, outline=col, width=2)

def bar(d, p, x0, x1, val, col, g=1.0, base=None, dy=0):
    base = p.yr[0] if base is None else base
    top = p.py(base + (val - base) * g) + dy
    d.rectangle((p.px(x0), top, p.px(x1), p.py(base) + dy), fill=col)

def mini_axes(d, x0, y0, x1, y1, dy=0):
    d.line((x0, y1 + dy, x1, y1 + dy), fill=DARK, width=3); d.line((x0, y0 + dy, x0, y1 + dy), fill=DARK, width=3)

def komma(v): return f"{v:.1f}".replace(".", ",")

# ---------------------------------------------------------------- 1 Hook: dieselben Zahlen
def sc1(f, t, ct):
    heading(f, t, "Dieselben Zahlen, ein anderer Eindruck")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    L = Plot((150, 220, 570, 540), (0, 2), (2.0, 2.6)); R = Plot((730, 220, 1150, 540), (0, 2), (0, 3.0))

    def names(d, P, dy):
        T2(d, P.px(0.5), P.y1 + 12 + dy, "Maschine A", F(24, 700), DARK, "ma"); T2(d, P.px(1.5), P.y1 + 12 + dy, "Maschine B", F(24, 700), DARK, "ma")

    def left(d, dy):
        T2(d, 360, 150 + dy, "Diagramm der Runde", F(28, 700), DARK, "mm")
        L.axes(d, dy, [], [2.0, 2.2, 2.4, 2.6], "", "", yfmt=komma)
        g = ap(t, c0 + 1.2, 1.0)
        bar(d, L, 0.25, 0.75, 2.25, GREY, g, dy=dy); bar(d, L, 1.25, 1.75, 2.50, RED, g, dy=dy)
        names(d, L, dy)
    f.el(show(t, 0.3), left, dy=dyf(t, 0.3))

    def vals(d, dy):
        for P, xv, v, col in ((L, 0.5, 2.25, DARK), (L, 1.5, 2.50, RED)):
            d.rounded_rectangle((P.px(xv) - 50, P.py(v) - 40, P.px(xv) + 50, P.py(v) - 6), 8, fill=WHITE, outline=LINE)
            T2(d, P.px(xv), P.py(v) - 23, f"{v:.2f} %".replace(".", ","), F(24, 700), col, "mm")
    f.el(show(t, c2 + 0.2), vals)
    f.el(show(t, c0 + 2.8), lambda d, dy: tag(d, 190, 600 + dy, 340, 46, "B wirkt 2-mal so hoch", RED, WHITE, 26), dy=dyf(t, c0 + 2.8))
    f.el(show(t, c1 + 0.1), lambda d, dy: tag(d, 582, 376 + dy, 136, 40, "stilllegen?", WHITE, RED, 22, 700, outl=RED), dy=dyf(t, c1 + 0.1))

    # Hinweise zur Achse
    def hints(d, dy):
        a = ap(t, c3 + 0.1, 0.5)
        if a > 0:
            d.line((L.x0 - 12, L.y1 - 8, L.x0 + 12, L.y1 + 4), fill=RED, width=5); d.line((L.x0 - 12, L.y1 - 22, L.x0 + 12, L.y1 - 10), fill=RED, width=5)
            tag(d, L.x0 + 14, 262, 220, 34, "Achse beginnt bei 2", WHITE, RED, 20, 700, outl=RED); tag(d, L.x0 + 14, 306, 220, 34, "kein Achsentitel", WHITE, RED, 20, 700, outl=RED)
    f.el(show(t, c3 + 0.1), hints)

    def right(d, dy):
        T2(d, 940, 150 + dy, "Dieselben Zahlen, Achse ab 0", F(28, 700), DARK, "mm")
        R.axes(d, dy, [], [0, 1, 2, 3], "", "Ausschussquote in %")
        g = ap(t, c3 + 1.0, 1.0)
        bar(d, R, 0.25, 0.75, 2.25, GREY, g, dy=dy); bar(d, R, 1.25, 1.75, 2.50, RED, g, dy=dy)
        names(d, R, dy)
        if g > 0.95:
            T2(d, R.px(0.5), R.py(2.25) - 23 + dy, "2,25 %", F(24, 700), DARK, "mm"); T2(d, R.px(1.5), R.py(2.5) - 23 + dy, "2,50 %", F(24, 700), RED, "mm")
    f.el(show(t, c3 + 0.3), right, dy=dyf(t, c3 + 0.3))
    f.el(show(t, c3 + 2.8), lambda d, dy: tag(d, 770, 600 + dy, 340, 46, "B nur 1,1-mal so hoch", GREEN, WHITE, 26), dy=dyf(t, c3 + 2.8))
    f.el(show(t, c3 + 0.3), lambda d, dy: arrow(d, 590, 450, 690, 450, GREY, 4, 12))

# ---------------------------------------------------------------- 2 Diagrammarten
LINE_DATA = [3, 4.2, 3.6, 5.5, 6.2, 5.8, 7.4, 8.4]
SCAT = [(1.0, 1.4), (1.6, 2.2), (2.2, 2.0), (2.9, 3.4), (3.4, 3.1), (4.0, 4.4), (4.6, 4.9), (5.2, 5.0), (5.8, 6.2), (6.4, 6.0), (7.1, 7.3), (7.6, 7.2)]
HIST = [1, 3, 6, 11, 17, 21, 18, 12, 7, 3, 1]
BARV = [4.2, 6.8, 3.1]

def sc2(f, t, ct):
    heading(f, t, "Welche Diagrammart wofür?")
    W_, G_ = 270, 26
    titles = [("Linie", ["Verlauf", "über der Zeit"]), ("Punkte", ["Zusammenhang", "zweier Größen"]), ("Balken", ["Kategorien", "vergleichen"]), ("Histogramm", ["Verteilung", "der Werte"])]
    sub = ["Messwert über t", "unabhängige Proben", "A, B, C", "200 Wellendurchmesser"]
    tins = [ct(0) + 0.1, ct(1) + 0.1, ct(2) + 0.1, ct(2) + 3.6]
    for k, (nm, q) in enumerate(titles):
        x = 60 + k * (W_ + G_); y = 130; tin = tins[k]
        def card_fn(d, dy, k=k, nm=nm, q=q, x=x, tin=tin):
            card(d, x, y + dy, W_, 400)
            T2(d, x + 28, y + 14 + dy, nm, F(32, 700), DARK)
            for j, ln in enumerate(q): T2(d, x + 28, y + 56 + j * 26 + dy, ln, F(22, 600), GREY)
            fit(sub[k], F(21, 700), W_ - 44, "Kachel"); T2(d, x + 28, y + 114 + dy, sub[k], F(21, 700), RED)
            ax0, ax1, ay0, ay1 = x + 38, x + W_ - 26, y + 160, y + 360
            mini_axes(d, ax0, ay0, ax1, ay1, dy)
            g = ap(t, tin + 0.4, 1.4)
            P = Plot((ax0, ay0, ax1, ay1), (0, 7), (0, 10))
            if k == 0:
                pts = [(P.px(i), P.py(v) + dy) for i, v in enumerate(LINE_DATA)]
                polyline(d, pts, RED, 4, g); dots(d, [p for j, p in enumerate(pts) if j / 7 <= g], RED, 6, WHITE)
            elif k == 1:
                P = Plot((ax0, ay0, ax1, ay1), (0, 8.5), (0, 8.5)); n = int(len(SCAT) * g + 0.001)
                dots(d, [(P.px(a), P.py(b) + dy) for a, b in SCAT[:n]], RED, 7)
            elif k == 2:
                P = Plot((ax0, ay0, ax1, ay1), (0, 3), (0, 8))
                for j, v in enumerate(BARV):
                    bar(d, P, j + 0.2, j + 0.8, v, RED if j == 1 else GREY, g, 0, dy)
                    T2(d, P.px(j + 0.5), ay1 + 6 + dy, "ABC"[j], F(20, 700), GREY, "ma")
            else:
                P = Plot((ax0, ay0, ax1, ay1), (0, len(HIST)), (0, 24))
                for j, v in enumerate(HIST): bar(d, P, j + 0.04, j + 0.96, v, RED, g, 0, dy)
        f.el(show(t, tin), card_fn, dy=dyf(t, tin))
    c3 = ct(3)

    def hint(d, dy):
        P = Plot((60 + 38, 130 + 160, 60 + W_ - 26, 130 + 360), (0, 7), (0, 10))
        p1 = (P.px(3), P.py(LINE_DATA[3])); p2 = (P.px(4), P.py(LINE_DATA[4]))
        d.line((*p1, *p2), fill=DARK, width=7)
        for p in (p1, p2): d.ellipse((p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8), fill=WHITE, outline=DARK, width=3)
        T2(d, (p1[0] + p2[0]) / 2 + 12, (p1[1] + p2[1]) / 2 + 30, "?", F(30, 700), DARK, "mm")
        tag(d, 60, 568 + dy, 1160, 56, "Die Linie behauptet: Reihenfolge und stetiger Verlauf dazwischen", RED, WHITE, 30)
    f.el(show(t, c3 + 0.3), hint, dy=dyf(t, c3 + 0.3))

# ---------------------------------------------------------------- 3 Achsen
def sc3(f, t, ct):
    heading(f, t, "Achsen beschriften")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    P = Plot((130, 250, 760, 530), (0, 10), (0, 14))
    meas = [(1, 4.1), (2, 6.9), (3, 8.4), (4, 9.6), (5, 10.4), (6, 11.2), (7, 11.5), (8, 11.8), (9, 11.9)]
    model = [(i / 2, 12 * (1 - math.exp(-i / 6))) for i in range(0, 21)]

    def plot(d, dy):
        lab = t > c0 + 1.4
        P.axes(d, dy, [0, 2, 4, 6, 8, 10], [0, 4, 8, 12], "Zeit t in s" if lab else "", "Geschwindigkeit v in m/s" if lab else "")
        g = ap(t, 0.5, 1.6)
        polyline(d, [(P.px(a), P.py(b)) for a, b in model], DARK, 4, g)
        if g > 0.9: dots(d, [(P.px(a), P.py(b)) for a, b in meas], RED, 7)
    f.el(show(t, 0.3), plot, dy=dyf(t, 0.3))

    def ring(d, dy):
        a = ap(t, c0 + 1.6, 0.4) * (1 - ap(t, c1, 0.4))
        if a <= 0: return
        col = mix(WHITE, RED, a)
        d.rounded_rectangle((P.x0 - 8, P.y0 - 34, P.x0 + 292, P.y0 - 2), 8, outline=col, width=3)
        d.rounded_rectangle((P.x1 - 150, P.y1 + 30, P.x1 + 6, P.y1 + 66), 8, outline=col, width=3)
    f.el(1, ring)
    f.el(show(t, c1 + 0.2), lambda d, dy: T2(d, P.x0, 150 + dy, "Anfahrversuch eines Wagens", F(30, 700), DARK, "la"), dy=dyf(t, c1 + 0.2))

    def legend(d, dy):
        x, y = 540, 410 + dy
        d.rounded_rectangle((x, y, x + 210, y + 84), 10, fill=WHITE, outline=LINE, width=2)
        d.ellipse((x + 16, y + 16, x + 30, y + 30), fill=RED); T2(d, x + 44, y + 23, "Messung", F(22, 600), DARK, "lm")
        d.line((x + 14, y + 60, x + 34, y + 60), fill=DARK, width=4); T2(d, x + 44, y + 60, "Rechnung", F(22, 600), DARK, "lm")
    f.el(show(t, c1 + 1.2), legend, dy=dyf(t, c1 + 1.2))

    def panel(d, dy):
        card(d, 810, 140 + dy, 410, 270)
        T2(d, 840, 156 + dy, "Jede Achse braucht", F(26, 700), GREY)
    f.el(show(t, c0 + 0.8), panel, dy=dyf(t, c0 + 0.8))
    for k, (a, b) in enumerate((("Größe", "Geschwindigkeit"), ("Formelzeichen", "v"), ("Einheit", "m/s"))):
        tin = c0 + 2.2 + 1.4 * k
        def row(d, dy, k=k, a=a, b=b):
            y = 206 + k * 66 + dy
            d.rounded_rectangle((840, y, 1190, y + 54), 12, fill=LIGHTK, outline=LINE, width=2)
            T2(d, 858, y + 27, a, F(24, 700), GREY, "lm"); T2(d, 1172, y + 27, b, F(28, 700), RED, "rm")
        f.el(show(t, tin), row, dy=dyf(t, tin))

    def noun(d, dy):
        card(d, 810, 440 + dy, 410, 190, fill=LIGHTR)
        T2(d, 1015, 480 + dy, "5", F(60, 700), DARK, "mm")
        T2(d, 1015, 540 + dy, "5 mm? 5 m? 5 s?", F(30, 700), RED, "mm")
        T2(d, 1015, 592 + dy, "Zahl ohne Einheit: keine Information", F(22, 700), GREY, "mm")
    f.el(show(t, c2 + 0.2), noun, dy=dyf(t, c2 + 0.2))

# ---------------------------------------------------------------- 4 Datenpunkt zu Pixel
def sc4(f, t, ct):
    heading(f, t, "Vom Datenpunkt zum Pixel")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    X0, X1 = 150, 700; yD, yP = 190, 290
    def dx(v): return X0 + v / 10 * (X1 - X0)

    def lines(d, dy):
        T2(d, 60, yD - 56 + dy, "Daten: t in s", F(24, 700), GREY, "la"); T2(d, 60, yP + 44 + dy, "Pixel (x)", F(24, 700), GREY, "la")
        for y in (yD, yP): d.line((X0, y + dy, X1, y + dy), fill=DARK, width=4)
        for v in range(0, 11, 2):
            x = dx(v)
            d.line((x, yD + dy - 8, x, yD + dy + 8), fill=DARK, width=3); T2(d, x, yD - 14 + dy, f"{v}", F(22, 600), DARK, "ms")
            d.line((x, yP + dy - 8, x, yP + dy + 8), fill=DARK, width=3); T2(d, x, yP + 14 + dy, f"{50 + v * 40}", F(22, 600), DARK, "ma")
    f.el(show(t, c0 + 0.2), lines, dy=dyf(t, c0 + 0.2))

    def conn(d, dy):
        a = ap(t, c0 + 2.0, 0.8); col = mix(WHITE, GREY, a)
        for v in (0, 10): d.line((dx(v), yD + 10, dx(v), yP - 10), fill=col, width=3)
        b = ap(t, c1 + 0.6, 0.6); col = mix(WHITE, RED, b); x = dx(4)
        d.line((x, yD + 6, x, yP - 6), fill=col, width=4)
        for y in (yD, yP): d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=col)
    f.el(1, conn)

    def formula(d, dy):
        card(d, 760, 130 + dy, 460, 250)
        T2(d, 790, 146 + dy, "Lineare Umrechnung", F(26, 700), GREY)
        T2(d, 790, 190 + dy, "Pixel = 50 + t / 10 · 400", F(30, 700), DARK)
    f.el(show(t, c1 + 0.2), formula, dy=dyf(t, c1 + 0.2))
    f.el(show(t, c1 + 2.4), lambda d, dy: T2(d, 790, 244 + dy, "= 50 + 4 / 10 · 400", F(30, 700), DARK), dy=dyf(t, c1 + 2.4))
    f.el(show(t, c1 + 4.2), lambda d, dy: tag(d, 790, 300 + dy, 400, 50, "t = 4 s liegt bei Pixel 210", RED, WHITE, 28), dy=dyf(t, c1 + 4.2))

    def yflip(d, dy):
        card(d, 60, 410 + dy, 480, 250)
        T2(d, 90, 424 + dy, "Pixel-y zählt von oben", F(26, 700), DARK)
        d.rectangle((160, 480 + dy, 300, 640 + dy), fill=LIGHTK, outline=DARK, width=3)
        arrow(d, 140, 484 + dy, 140, 636 + dy, RED, 4, 12); T2(d, 128, 560 + dy, "Pixel", F(20, 700), RED, "rm")
        arrow(d, 320, 636 + dy, 320, 484 + dy, GREEN, 4, 12); T2(d, 334, 560 + dy, "Wert y", F(20, 700), GREEN, "lm")
        T2(d, 440, 500 + dy, "oben: Pixel 0", F(22, 600), GREY, "mm"); T2(d, 440, 620 + dy, "unten: y = 0", F(22, 600), GREY, "mm")
    f.el(show(t, c2 + 0.2), yflip, dy=dyf(t, c2 + 0.2))

    A = Plot((620, 500, 880, 620), (0, 10), (0, 10)); B = Plot((960, 500, 1190, 620), (0, 5), (0, 10))
    pts = [(1, 2), (2.5, 4), (4, 5), (6, 7), (8, 8), (9.5, 9)]
    def other(d, dy):
        card(d, 580, 410 + dy, 640, 250)
        T2(d, 610, 424 + dy, "Andere Grenzen, dieselben Zahlen", F(26, 700), DARK)
        for P, ttl in ((A, "x: 0 bis 10"), (B, "x: 0 bis 5")):
            mini_axes(d, P.x0, P.y0, P.x1, P.y1, dy)
            T2(d, (P.x0 + P.x1) / 2, P.y1 + 12 + dy, ttl, F(21, 700), GREY, "ma")
        dots(d, [(A.px(a), A.py(b) + dy) for a, b in pts], RED, 6)
        dots(d, [(B.px(a), B.py(b) + dy) for a, b in pts if a <= 5], RED, 6)
        if t > c3 + 2.4: tag(d, 910, 462 + dy, 290, 34, "3 Punkte fehlen, keine Meldung", WHITE, RED, 17, 700, outl=RED)
    f.el(show(t, c3 + 0.0), other, dy=dyf(t, c3 + 0.0))

# ---------------------------------------------------------------- 5 Checkliste und Farbe
CHECK = ["Achse abgeschnitten?", "Einheit fehlt?", "Seitenverhältnis gestreckt?", "Nur ein Ausschnitt?",
         "Gleiche Skala beim Vergleich?", "Passende Diagrammart?", "Quelle und Menge der Daten?"]

def sc5(f, t, ct):
    heading(f, t, "Diagramme, die täuschen")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    f.el(show(t, 0.3), lambda d, dy: card(d, 60, 126 + dy, 620, 540), dy=dyf(t, 0.3))
    tins = [c0 + 1.8 + 1.6 * k for k in range(4)] + [c1 + 0.2, c1 + 2.4, c1 + 4.6]
    for k, txt in enumerate(CHECK):
        tin = tins[k]
        def row(d, dy, k=k, txt=txt):
            y = 146 + k * 74 + dy
            d.ellipse((92, y + 8, 132, y + 48), fill=GREEN); tick(d, 112, y + 28, 24, WHITE, 5)
            fit(txt, F(31, 700), 520, "Checkliste"); T2(d, 152, y + 28, txt, F(31, 700), DARK, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))
    P = Plot((780, 270, 1190, 520), (0, 10), (0, 10))
    la = [(0, 2), (2, 4), (4, 4.5), (6, 7), (8, 7.5), (10, 9)]; lb = [(0, 8), (2, 6.5), (4, 6), (6, 4), (8, 3), (10, 1.5)]
    pa = [(P.px(a), P.py(b)) for a, b in la]; pb = [(P.px(a), P.py(b)) for a, b in lb]
    grey_a = ap(t, c2 + 1.8, 0.8); styled = t > c2 + 3.8

    def plot(d, dy):
        card(d, 720, 126, 500, 540)
        mini_axes(d, P.x0, P.y0, P.x1, P.y1)
        ca = mix(RED, (120, 120, 120), grey_a); cb = mix(GREEN, (120, 120, 120), grey_a)
        if styled: ca = RED; cb = DARK
        polyline(d, pa, ca, 5); polyline(d, pb, cb, 5, dash=styled)
        if styled:
            dots(d, pa, RED, 6, WHITE); dots(d, pb, DARK, 6)
            T2(d, pa[-1][0] - 10, pa[-1][1] - 26, "A", F(26, 700), RED, "mm"); T2(d, pb[-1][0] - 10, pb[-1][1] + 28, "B", F(26, 700), DARK, "mm")
    f.el(show(t, c2 + 0.0), plot)
    f.el(show(t, c2 + 0.1) * (1 - ap(t, c2 + 1.8, 0.4)), lambda d, dy: T2(d, 970, 170 + dy, "Nur Farbe: Rot und Grün", F(28, 700), DARK, "mm"), dy=dyf(t, c2 + 0.1))

    def cap2(d, dy):
        T2(d, 970, 170 + dy, "Rot-Grün-Schwäche: kaum zu trennen", F(26, 700), RED, "mm")
        tag(d, 780, 566 + dy, 380, 48, "etwa jeder zwölfte Mann", RED, WHITE, 28)
    f.el(show(t, c2 + 1.8) * (1 - ap(t, c2 + 3.8, 0.4)), cap2, dy=dyf(t, c2 + 1.8))

    def cap3(d, dy):
        T2(d, 970, 170 + dy, "Besser: Linienstil und Beschriftung", F(26, 700), GREEN, "mm")
        tag(d, 780, 566 + dy, 380, 48, "Ohne Farbe lesbar", GREEN, WHITE, 28)
    f.el(show(t, c2 + 3.8), cap3, dy=dyf(t, c2 + 3.8))

# ---------------------------------------------------------------- 6 Ausblick
def sc6(f, t, ct):
    heading(f, t, "Dein Diagramm, deine Aussage")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    xs = [60, 450, 840]; W_ = 380

    def k1(d, dy):
        card(d, xs[0], 130 + dy, W_, 420)
        T2(d, xs[0] + 28, 146 + dy, "Ein Diagramm", F(32, 700), DARK); T2(d, xs[0] + 28, 186 + dy, "ist eine Aussage", F(32, 700), RED)
        P = Plot((xs[0] + 50, 270, xs[0] + 340, 440), (0, 2), (0, 10)); mini_axes(d, P.x0, P.y0, P.x1, P.y1, dy)
        bar(d, P, 0.25, 0.75, 4, GREY, 1, 0, dy); bar(d, P, 1.25, 1.75, 7, RED, 1, 0, dy)
        tag(d, xs[0] + 28, 480 + dy, W_ - 56, 46, "Du verantwortest sie", DARK, WHITE, 26)
    f.el(show(t, c0 + 0.3), k1, dy=dyf(t, c0 + 0.3))

    def k2(d, dy):
        card(d, xs[1], 130 + dy, W_, 420)
        T2(d, xs[1] + 28, 146 + dy, "Die KI zeichnet", F(32, 700), DARK); T2(d, xs[1] + 28, 186 + dy, "gern schön", F(32, 700), RED)
        P = Plot((xs[1] + 50, 270, xs[1] + 340, 440), (0, 2), (4.0, 7.2)); mini_axes(d, P.x0, P.y0, P.x1, P.y1, dy)
        bar(d, P, 0.25, 0.75, 4.2, GREY, 1, None, dy); bar(d, P, 1.25, 1.75, 6.9, RED, 1, None, dy)
        d.line((P.x0 - 12, P.y1 - 24 + dy, P.x0 + 12, P.y1 - 14 + dy), fill=RED, width=5)
        T2(d, xs[1] + 190, 462 + dy, "Achse ab 4, ohne Titel", F(21, 600), GREY, "mm")
        tag(d, xs[1] + 28, 480 + dy, W_ - 56, 46, "Prüfen mit der Checkliste", GREEN, WHITE, 24)
    f.el(show(t, c1 + 0.2), k2, dy=dyf(t, c1 + 0.2))

    def k3(d, dy):
        card(d, xs[2], 130 + dy, W_, 420)
        T2(d, xs[2] + 28, 146 + dy, "Ab heute:", F(32, 700), DARK); T2(d, xs[2] + 28, 186 + dy, "dein Projekt", F(32, 700), RED)
        for cx in (xs[2] + 130, xs[2] + 250):
            d.ellipse((cx - 26, 252 + dy, cx + 26, 304 + dy), fill=LIGHTK, outline=DARK, width=3)
            d.rounded_rectangle((cx - 40, 312 + dy, cx + 40, 370 + dy), 16, fill=LIGHTK, outline=DARK, width=3)
        T2(d, xs[2] + 190, 400 + dy, "Zweiergruppen", F(26, 700), DARK, "mm")
        d.rounded_rectangle((xs[2] + 28, 436 + dy, xs[2] + W_ - 28, 460 + dy), 8, fill=LIGHTK, outline=LINE, width=2)
        wx = xs[2] + 28 + (W_ - 56) * 2 / 3
        d.rounded_rectangle((wx, 436 + dy, xs[2] + W_ - 28, 460 + dy), 8, fill=RED)
        T2(d, xs[2] + 190, 494 + dy, "letzte 30 Minuten je Termin", F(22, 700), GREY, "mm")
        T2(d, xs[2] + 190, 522 + dy, "mit Copilot", F(22, 700), GREY, "mm")
    f.el(show(t, c2 + 0.2), k3, dy=dyf(t, c2 + 0.2))
    f.el(show(t, c3 + 0.2), lambda d, dy: tag(d, 340, 590 + dy, 600, 60, "Präsentation in V22", RED, WHITE, 34), dy=dyf(t, c3 + 0.2))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V14 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Visualisierung", F(84, 700), DARK)
        T2(d, 90, 290, "Diagramme, die stimmen", F(44, 400), GREY)
        P = Plot((100, 400, 560, 640), (0, 3), (0, 10)); mini_axes(d, P.x0, P.y0, P.x1, P.y1)
        for j, (v, c) in enumerate(((4, GREY), (7, RED), (5.5, GREY))): bar(d, P, j + 0.2, j + 0.8, v, c, 1, 0)
        Q = Plot((700, 400, 1160, 640), (0, 10), (0, 10)); mini_axes(d, Q.x0, Q.y0, Q.x1, Q.y1)
        pts = [(Q.px(a), Q.py(b)) for a, b in [(0, 1), (2, 3), (4, 4), (6, 6.5), (8, 7), (10, 9)]]
        polyline(d, pts, RED, 5); dots(d, pts, RED, 7, WHITE)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
