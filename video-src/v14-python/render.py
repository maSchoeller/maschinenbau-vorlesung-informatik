"""V14 Python-Werkstatt: matplotlib, Achsen und Subplots. Aufruf: python render.py [text|probe|scan|zeiten|stills t1 t2..|tts|full|mux]
Ohne Audio (keine Credits): text, probe, scan. Vertonung nur nach ausdruecklicher Freigabe (tts)."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v14-common"))
from h14 import *
from texte import SRC

NAME = "v14-python"; LABEL = "DHBW · Informatik · V14 · Python-Werkstatt"
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTA = (255, 240, 214); LIGHTB = (219, 232, 252)
AMB = (176, 110, 0); BLUE = (37, 99, 235)
CPS = 55

# ---------------------------------------------------------------- Hilfen
def show(t, tin, tout=None): return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)
def win(t, t0, t1=None): return ap(t, t0, 0.3) * (1 - (ap(t, t1 - 0.1, 0.25) if t1 is not None else 0))

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def mk_times(code, *groups, start=-1):
    """Startzeiten je Zeile: Zeilen in keiner Gruppe sind sofort da (start); Gruppen: (indizes, startzeit)."""
    tm = [start] * len(code)
    for idxs, st in groups:
        sq = seq_times(code, idxs, st, CPS)
        for i in idxs: tm[i] = sq[i]
    return tm

def done(code, tm, k, extra=0.2): return tm[k] + len(code[k]) / CPS + extra

def code_h(n, size, lh=None): return 18 + 32 + (lh or int(size * 1.45)) * n + 18
def con_h(n, size): return 46 + int(size * 1.45) * n + 14

def cpage(f, t, t0, t1, code, times, outs=(), size=20, w=640, x=60, y=124, hl=None, lh=None):
    """Codefenster (Zeile fuer Zeile getippt) mit optionaler Konsole darunter; blendet zwischen t0 und t1 ein/aus."""
    fit_check(code, M(size), w - 80, "Code")
    a = win(t, t0, t1); h = code_h(len(code), size, lh)
    def fn(d, dy):
        code_panel(d, x, y + dy, w, code, times, t, size, hl=hl, lh=lh, title="Python")
        if outs:
            ents = [(tt, [(s, c)]) for tt, s, c in outs]
            console_panel(d, x, y + dy + h + 14, w, con_h(len(outs), size), ents, t, size)
    f.el(a, fn, dy=int((1 - ap(t, t0, 0.3)) * 10))

# ---------------------------------------------------------------- Diagramm-Bausteine
def axes2(d, dy, P, xt, yt, xlab="", ylab="", title="", grid=False, fs=19, lab=21, xfmt=None, yfmt=None):
    xfmt = xfmt or (lambda v: f"{v:g}"); yfmt = yfmt or (lambda v: f"{v:g}")
    d.rectangle((P.x0, P.y0 + dy, P.x1, P.y1 + dy), fill=WHITE, outline=DARK, width=2)
    for v in yt:
        y = P.py(v) + dy
        if grid: d.line((P.x0, y, P.x1, y), fill=LINE, width=1)
        d.line((P.x0 - 6, y, P.x0, y), fill=DARK, width=2); T2(d, P.x0 - 10, y, yfmt(v), F(fs, 400), GREY, "rm")
    for v in xt:
        x = P.px(v)
        if grid: d.line((x, P.y0 + dy, x, P.y1 + dy), fill=LINE, width=1)
        d.line((x, P.y1 + dy, x, P.y1 + 6 + dy), fill=DARK, width=2); T2(d, x, P.y1 + 8 + dy, xfmt(v), F(fs, 400), GREY, "ma")
    if xlab: T2(d, P.x1, P.y1 + 8 + fs + 10 + dy, xlab, F(lab, 600), GREY, "ra")
    if ylab: T2(d, P.x0, P.y0 - lab - 10 + dy, ylab, F(lab, 600), GREY, "la")
    if title: T2(d, (P.x0 + P.x1) / 2, P.y0 - lab - 14 - 30 + dy, title, F(lab + 3, 700), DARK, "ma")

def dline(d, x0, y0, x1, y1, col, w=3, on=10, off=8):
    L = math.hypot(x1 - x0, y1 - y0)
    if L == 0: return
    ux, uy = (x1 - x0) / L, (y1 - y0) / L; s = 0.0
    while s < L:
        e = min(s + on, L); d.line((x0 + ux * s, y0 + uy * s, x0 + ux * e, y0 + uy * e), fill=col, width=w); s += on + off

def clipy(x0, y0, x1, y1, lo, hi):
    if y1 == y0: return (x0, y0, x1, y1) if lo <= y0 <= hi else None
    ta = (lo - y0) / (y1 - y0); tb = (hi - y0) / (y1 - y0)
    a = max(0.0, min(ta, tb)); b = min(1.0, max(ta, tb))
    if a > b: return None
    return (x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)

def marker(d, x, y, kind, col, r=7):
    if kind == "o": d.ellipse((x - r, y - r, x + r, y + r), fill=col)
    else: d.rectangle((x - r, y - r, x + r, y + r), fill=col)

def curve(d, dy, P, xs, ys, frac=1.0, col=RED, w=4, mk=None, dash=False, msz=7):
    n = len(xs) - 1; L = frac * n; lo, hi = sorted(P.yr)
    for i in range(n):
        if L <= i: break
        s = min(1.0, L - i)
        r = clipy(xs[i], ys[i], xs[i] + (xs[i + 1] - xs[i]) * s, ys[i] + (ys[i + 1] - ys[i]) * s, lo, hi)
        if r is None: continue
        p = (P.px(r[0]), P.py(r[1]) + dy, P.px(r[2]), P.py(r[3]) + dy)
        if dash: dline(d, *p, col, w)
        else:
            d.line(p, fill=col, width=w)
            d.ellipse((p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2), fill=col)
            d.ellipse((p[2] - w / 2, p[3] - w / 2, p[2] + w / 2, p[3] + w / 2), fill=col)
    if mk:
        for i in range(n + 1):
            if L >= i and lo <= ys[i] <= hi: marker(d, P.px(xs[i]), P.py(ys[i]) + dy, mk, col, msz)

def dots(d, dy, P, xs, ys, frac=1.0, col=RED, r=7):
    for i in range(int(round(frac * len(xs)))): marker(d, P.px(xs[i]), P.py(ys[i]) + dy, "o", col, r)

def bars(d, dy, P, vals, frac=1.0, col=RED, bw=0.8, base=0.0):
    """Balken von base bis Wert; unterhalb der unteren Achsengrenze abgeschnitten."""
    ylo = P.yr[0]
    for i, v in enumerate(vals):
        top = P.py(max(ylo, base + (v - base) * frac)); bot = P.py(max(base, ylo))
        d.rectangle((P.px(i - bw / 2), top + dy, P.px(i + bw / 2), bot + dy), fill=col)

def rcard(f, t, tin, tout=None, x=740, w=490, y=124, h=540):
    f.el(show(t, tin, tout), lambda d, dy: card(d, x, y + dy, w, h), dy=dyf(t, tin))

# ---------------------------------------------------------------- Daten (identisch zum gezeigten Code)
ZEIT = [0, 1, 2, 3, 4, 5]
V = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]
XR = (-0.25, 5.25)             # automatische Achsen von matplotlib
YR = (-0.23, 4.83)
def P_main(): return Plot((820, 236, 1200, 556), XR, YR)

# ---------------------------------------------------------------- 1 Diagramm zeichnen
CODE1 = ["import matplotlib.pyplot as plt", "zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]", "plt.plot(zeit, v)"]

def sc1(f, t, ct):
    heading(f, t, "Diagramme mit matplotlib")
    tm = [ct(0) + 0.4, ct(1) + 0.3, ct(1) + 1.3, ct(2) + 0.3]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {3})])
    code_box(f, t, CODE1, 60, 124, 640, 22, 34, hl=hl, times=tm, alpha_t=0.3)
    tile(f, t, ct(0) + 1.8, 60, 350, 640, 96, "plt", "Kurzname für matplotlib.pyplot", RED)
    tile(f, t, ct(1) + 1.8, 60, 460, 640, 96, "zwei Listen", "gleich lang: sechs Zeiten, sechs Werte", DARK)
    tile(f, t, ct(2) + 1.6, 60, 570, 640, 96, "plt.plot(x, y)", "erst die x-Liste, dann die y-Liste", DARK)
    rcard(f, t, 0.4)
    f.el(show(t, 0.8, ct(2) + 0.2), lambda d, dy: T2(d, 985, 380 + dy, "Hier entsteht das Diagramm", F(26, 600), GREY, "mm"))
    P = P_main()
    f.el(show(t, ct(2) + 0.2), lambda d, dy: axes2(d, dy, P, ZEIT, [0, 1, 2, 3, 4]), dy=dyf(t, ct(2) + 0.2))
    f.el(ap(t, ct(2) + 0.5, 0.2), lambda d, dy: curve(d, dy, P, ZEIT, V, ap(t, ct(2) + 0.6, 2.4)))

# ---------------------------------------------------------------- 2 Beschriften
CODE2 = ["import matplotlib.pyplot as plt", "zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]", "plt.plot(zeit, v)",
         'plt.xlabel("Zeit t in s")', 'plt.ylabel("Geschwindigkeit v in m/s")', 'plt.title("Anfahren eines Wagens")', "plt.grid(True)", "plt.show()"]

def sc2(f, t, ct):
    heading(f, t, "Achsen, Titel, Gitter, show")
    tm = mk_times(CODE2, ([4, 5], ct(1) + 0.3), ([6, 7], ct(2) + 0.3), ([8], ct(3) + 0.3))
    hl = hl_at(t, [(0, None), (ct(1), {4, 5}), (ct(2), {6, 7}), (ct(3), {8})])
    code_box(f, t, CODE2, 60, 124, 640, 22, 34, hl=hl, times=tm, alpha_t=0.0)
    tile(f, t, ct(1) + 0.8, 60, 520, 640, 96, "xlabel · ylabel", "Größe, Formelzeichen und Einheit", DARK, tout=ct(2) + 0.5)
    tile(f, t, ct(2) + 0.8, 60, 520, 640, 96, "title · grid(True)", "Überschrift und Gitter zum Ablesen", DARK, tout=ct(3) + 0.5)
    tile(f, t, ct(3) + 0.8, 60, 520, 640, 96, "show()", "ohne show kein Bild", RED)
    rcard(f, t, 0.0)
    P = P_main(); gx = t >= done(CODE2, tm, 7)
    xl = "Zeit t in s" if t >= done(CODE2, tm, 4) else ""; yl = "Geschwindigkeit v in m/s" if t >= done(CODE2, tm, 5) else ""
    ti = "Anfahren eines Wagens" if t >= done(CODE2, tm, 6) else ""
    def fig(d, dy):
        axes2(d, dy, P, ZEIT, [0, 1, 2, 3, 4], xl, yl, ti, grid=gx); curve(d, dy, P, ZEIT, V)
    f.el(1, fig)
    ts = done(CODE2, tm, 8, 0.3)
    f.el(show(t, ts), lambda d, dy: (d.rectangle((742, 126, 1228, 160), fill=DARK), T2(d, 764, 143, "Figure 1", F(22, 600), WHITE, "lm")))
    f.el(show(t, ts + 0.3), lambda d, dy: tag(d, 860, 626 + dy, 280, 34, "Bild erscheint", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ts + 0.3))
    f.el(show(t, 0.6, ts), lambda d, dy: T2(d, 985, 636, "Fenster erst mit show()", F(22, 600), GREY, "mm"))

# ---------------------------------------------------------------- 3 Vier Arten
CODE3 = ['plt.plot([0, 1, 2, 3], [4.4, 4.0, 2.5, 0.5], marker="o")', "plt.scatter([2, 4, 6, 8], [0.8, 1.7, 2.3, 3.4])",
         'plt.bar(["D1", "D2", "F1"], [2.1, 3.4, 1.8])', "import random", "random.seed(3)", "werte = [random.gauss(20.0, 0.01) for i in range(100)]", "plt.hist(werte, bins=8)"]
HC = [1, 4, 8, 15, 36, 18, 10, 8]                                  # echte Klassenzaehlung (seed 3, 100 Werte, 8 Klassen)
HE = [19.96394, 19.97135, 19.97877, 19.98618, 19.99359, 20.001, 20.00842, 20.01583, 20.02324]
CAPS = ["Linie: Verlauf", "Punkte: Zusammenhang", "Balken: Vergleich", "Histogramm: Verteilung"]
NAMEN = ["D1", "D2", "F1"]

def sc3(f, t, ct):
    heading(f, t, "Vier Diagrammarten")
    tm = mk_times(CODE3, ([0, 1], ct(1) + 0.3), ([2], ct(2) + 0.3), ([3, 4, 5, 6], ct(3) + 0.2))
    hl = hl_at(t, [(0, None), (ct(1), {0, 1}), (ct(2), {2}), (ct(3), {3, 4, 5, 6})])
    code_box(f, t, CODE3, 60, 124, 1160, 22, 30, hl=hl, times=tm, alpha_t=0.3)
    xs = [60 + k * 295 for k in range(4)]
    tins = [done(CODE3, tm, 0), done(CODE3, tm, 1), done(CODE3, tm, 2), done(CODE3, tm, 6)]
    for k in range(4):
        fit(CAPS[k], F(21, 700), 240, "Titel")
        def shell(d, dy, k=k):
            card(d, xs[k], 420 + dy, 275, 246, stripe=False); T2(d, xs[k] + 18, 432 + dy, CAPS[k], F(21, 700), DARK)
        f.el(show(t, ct(0) + 0.6 + 0.3 * k), shell, dy=dyf(t, ct(0) + 0.6 + 0.3 * k))
    def c1(d, dy):
        P = Plot((xs[0] + 54, 476, xs[0] + 257, 612), (-0.15, 3.15), (0.305, 4.695)); axes2(d, dy, P, [0, 1, 2, 3], [1, 2, 3, 4], fs=16)
        curve(d, dy, P, [0, 1, 2, 3], [4.4, 4.0, 2.5, 0.5], ap(t, tins[0] + 0.3, 1.2), mk="o", msz=6)
    def c2(d, dy):
        P = Plot((xs[1] + 54, 476, xs[1] + 257, 612), (1.7, 8.3), (0.53, 3.67)); axes2(d, dy, P, [2, 4, 6, 8], [1, 2, 3], fs=16)
        dots(d, dy, P, [2, 4, 6, 8], [0.8, 1.7, 2.3, 3.4], ap(t, tins[1] + 0.3, 1.2), r=6)
    def c3(d, dy):
        P = Plot((xs[2] + 54, 476, xs[2] + 257, 612), (-0.54, 2.54), (0, 3.57)); axes2(d, dy, P, [0, 1, 2], [0, 1, 2, 3], fs=16, xfmt=lambda v: NAMEN[int(v)])
        bars(d, dy, P, [2.1, 3.4, 1.8], ap(t, tins[2] + 0.3, 1.0))
    def c4(d, dy):
        P = Plot((xs[3] + 54, 476, xs[3] + 257, 612), (19.9609, 20.0262), (0, 37.8)); axes2(d, dy, P, [19.97, 19.99, 20.01], [0, 10, 20, 30], fs=16, xfmt=lambda v: f"{v:.2f}")
        g = ap(t, tins[3] + 0.3, 1.2)
        for i, c in enumerate(HC):
            d.rectangle((P.px(HE[i]), P.py(c * g) + dy, P.px(HE[i + 1]), P.py(0) + dy), fill=RED, outline=WHITE, width=1)
    for fn, tin in zip((c1, c2, c3, c4), tins):
        f.el(show(t, tin), fn)

# ---------------------------------------------------------------- 4 Ehrliche Achsen
CA = ["zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]", "plt.plot(zeit, v)", "plt.ylim(0, 5)", 'plt.axhline(4.6, color="gray", linestyle=":")']
CB = CA[:3] + ["plt.ylim(0, 3)", CA[4]]
CC = ['plt.bar(["D1", "D2", "F1"], [2.1, 3.4, 1.8])', "plt.ylim(0, 4)"]

def sc4(f, t, ct):
    heading(f, t, "Ehrliche Achsen")
    tmA = mk_times(CA, ([0, 1, 2], ct(0) + 0.5), ([3, 4], ct(1) + 0.3))
    tmB = [-1, -1, -1, ct(2) + 0.3, -1]
    cpage(f, t, ct(0) - 0.1, ct(2), CA, tmA, size=22, lh=34, hl=hl_at(t, [(0, None), (ct(1), {3, 4})]))
    cpage(f, t, ct(2), ct(3), CB, tmB, size=22, lh=34, hl={3})
    cpage(f, t, ct(3), None, CC, mk_times(CC, ([0, 1], ct(3) + 0.3)), size=22, lh=34, hl={1})
    tile(f, t, ct(1) + 0.8, 60, 384, 640, 84, "ylim(unten, oben)", "Grenzen der senkrechten Achse", DARK, tout=ct(2))
    tile(f, t, ct(1) + 3.0, 60, 478, 640, 84, "axhline(y)", "waagerechte Hilfslinie, hier der Sollwert", DARK, tout=ct(2))
    tile(f, t, ct(1) + 5.6, 60, 572, 640, 84, "ax.set_ylim(0, 5)", "am Teilbild: Methode mit set_", DARK, tout=ct(2))
    tile(f, t, ct(2) + 1.6, 60, 384, 640, 84, "ohne Meldung", "Werte außerhalb werden nicht gezeichnet", RED, tout=ct(3))
    tile(f, t, ct(3) + 0.8, 60, 290, 640, 84, "Balken ab 0", "die Länge ist dann der Wert", GREEN)
    tile(f, t, ct(3) + 2.6, 60, 384, 640, 84, "abgeschnitten", "kleine Unterschiede wirken riesig", RED)
    # rechts: Linie mit Hilfslinie, die Achse schrumpft auf 3
    rcard(f, t, 0.4)
    yt = 5 - 2 * ap(t, ct(2) + 0.4, 0.9); P = Plot((820, 200, 1200, 560), XR, (0, yt)); a = win(t, ct(0) + 0.5, ct(3))
    def fig(d, dy):
        axes2(d, dy, P, ZEIT, list(range(0, int(yt + 1e-9) + 1)))
        if t >= done(CA, tmA, 4) and 4.6 <= yt:
            yy = P.py(4.6) + dy; dline(d, P.x0, yy, P.x1, yy, GREY, 3, 4, 6)
        curve(d, dy, P, ZEIT, V)
    f.el(a, fig)
    f.el(win(t, ct(2) + 1.4, ct(3)), lambda d, dy: tag(d, 800, 596 + dy, 400, 40, "Werte über 3 fehlen, ohne Meldung", LIGHTR, RED, 22, 700, outl=RED))
    f.el(win(t, ct(1) + 0.4, ct(2)), lambda d, dy: T2(d, 1200, 640 + dy, "y-Achse von 0 bis 5", F(22, 600), GREY, "ra"))
    # Balken ab 0 gegen abgeschnitten
    def bc(d, dy):
        for k, (yr, tk, col, lab, sub) in enumerate((((0, 4), [0, 1, 2, 3, 4], GREEN, "plt.ylim(0, 4)", "ehrlich"), ((1.5, 4), [2, 3, 4], RED, "plt.ylim(1.5, 4)", "täuscht"))):
            x = 770 + k * 235
            P2 = Plot((x + 44, 250, x + 200, 540), (-0.54, 2.54), yr)
            T2(d, x + 122, 160 + dy, lab, M(20, True), col, "mm"); tag(d, x + 42, 184 + dy, 160, 34, sub, mix(WHITE, col, 0.12), col, 22, 700, outl=col)
            axes2(d, dy, P2, [0, 1, 2], tk, fs=17, xfmt=lambda v: NAMEN[int(v)])
            bars(d, dy, P2, [2.1, 3.4, 1.8], ap(t, ct(3) + 0.6 + 2.0 * k, 1.0), base=0.0)
    f.el(win(t, ct(3) + 0.3), bc)

# ---------------------------------------------------------------- 5 Subplots
C5A = ["paar = (3, 4.5)", "a, b = paar", "print(a, b)"]
C5B = ["zeit = [0, 1, 2, 3, 4, 5]", "weg = [0.0, 1.1, 4.4, 9.9, 17.6, 27.5]", "v = [0.0, 2.2, 4.4, 6.6, 8.8, 11.0]",
       "fig, (oben, unten) = plt.subplots(2, 1, sharex=True)", "oben.plot(zeit, weg)", 'oben.set_ylabel("Weg s in m")', "unten.plot(zeit, v)",
       'unten.set_ylabel("Geschwindigkeit v in m/s")', 'unten.set_xlabel("Zeit t in s")', "fig.tight_layout()"]
WEG = [0.0, 1.1, 4.4, 9.9, 17.6, 27.5]; V6 = [0.0, 2.2, 4.4, 6.6, 8.8, 11.0]

def sc5(f, t, ct):
    heading(f, t, "Subplots und Tupel entpacken")
    tmA = mk_times(C5A, ([0, 1, 2], ct(0) + 0.4))
    cpage(f, t, ct(0) - 0.1, ct(1), C5A, tmA, [(done(C5A, tmA, 2, 0.1), "3 4.5", CODE_T)], size=22, lh=34, hl=hl_at(t, [(0, None), (done(C5A, tmA, 0), {1})]))
    tile(f, t, ct(0) + 4.2, 60, 440, 640, 96, "Tupel entpacken", "a bekommt 3, b bekommt 4,5", DARK, tout=ct(1))
    tmB = mk_times(C5B, ([0, 1, 2, 3], ct(1) + 0.3), ([4, 5, 6, 7, 8], ct(2) + 0.3), ([9], ct(3) + 3.0))
    hl = hl_at(t, [(0, None), (ct(1) + 0.3, {3}), (ct(2), {4, 5, 6, 7, 8}), (ct(3), {3}), (ct(3) + 3.0, {9})])
    cpage(f, t, ct(1), None, C5B, tmB, size=19, lh=29, hl=hl)
    tile(f, t, ct(1) + 2.0, 60, 504, 640, 84, "fig, (oben, unten)", "Tupel: Abbildung und zwei Teilbilder", DARK, tout=ct(2) + 0.4)
    tile(f, t, ct(2) + 0.8, 60, 504, 640, 84, "set_ylabel · set_xlabel", "am Teilbild steht set_ davor", RED, tout=ct(3) + 0.4)
    tile(f, t, ct(3) + 0.8, 60, 504, 640, 84, "sharex=True", "beide Bilder teilen die Zeitachse", DARK, tout=ct(3) + 3.0)
    tile(f, t, ct(3) + 3.4, 60, 504, 640, 84, "tight_layout()", "nichts überlappt", GREEN)
    # rechts Seite 1: Tupel -> a, b
    rcard(f, t, 0.4, ct(1))
    def tup(d, dy):
        d.rounded_rectangle((870, 190 + dy, 1100, 270 + dy), 14, fill=LIGHTB, outline=BLUE, width=3)
        T2(d, 985, 214 + dy, "paar", F(24, 700), GREY, "mm"); T2(d, 985, 248 + dy, "(3, 4.5)", M(32, True), DARK, "mm")
        a2 = ap(t, done(C5A, tmA, 1), 0.6)
        if a2 > 0:
            col = mix(WHITE, GREY, a2)
            arrow(d, 940, 280 + dy, 880, 380 + dy, col, 4, 14); arrow(d, 1030, 280 + dy, 1090, 380 + dy, col, 4, 14)
            for x, nm, val in ((780, "a", "3"), (990, "b", "4.5")):
                d.rounded_rectangle((x, 392 + dy, x + 190, 482 + dy), 14, fill=mix(WHITE, LIGHTG, a2), outline=mix(WHITE, GREEN, a2), width=3)
                T2(d, x + 95, 416 + dy, nm, F(26, 700), mix(WHITE, GREY, a2), "mm"); T2(d, x + 95, 454 + dy, val, M(34, True), mix(WHITE, DARK, a2), "mm")
    f.el(win(t, ct(0) + 0.8, ct(1)), tup)
    # rechts Seite 2: zwei Teilbilder
    rcard(f, t, ct(1) + 0.2)
    Po = Plot((830, 190, 1200, 330), XR, (-1.375, 28.875)); Pu = Plot((830, 404, 1200, 534), XR, (-0.55, 11.55))
    ta = done(C5B, tmB, 3)
    def figs(d, dy):
        axes2(d, dy, Po, [], [0, 10, 20], "", "Weg s in m" if t >= done(C5B, tmB, 5) else "", fs=18, lab=20)
        axes2(d, dy, Pu, ZEIT, [0, 5, 10], "Zeit t in s" if t >= done(C5B, tmB, 8) else "", "Geschwindigkeit v in m/s" if t >= done(C5B, tmB, 7) else "", fs=18, lab=20)
        if t >= tmB[4] + 0.3: curve(d, dy, Po, ZEIT, WEG, ap(t, tmB[4] + 0.3, 1.2))
        if t >= tmB[6] + 0.3: curve(d, dy, Pu, ZEIT, V6, ap(t, tmB[6] + 0.3, 1.2))
    f.el(show(t, ta), figs)
    tl = done(C5B, tmB, 9, 0.3)
    f.el(show(t, tl), lambda d, dy: tag(d, 800, 612 + dy, 400, 36, "Beschriftungen überlappen nicht", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, tl))

# ---------------------------------------------------------------- 6 Typische Fehler
C6 = [
 (["zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6]", "plt.plot(zeit, v)"], 20,
  [(2.4, "ValueError: x and y must have", CODE_R), (2.4, "same first dimension, but have", CODE_R), (2.4, "shapes (6,) and (3,)", CODE_R)]),
 (["zeit = [0, 1, 2, 3]", 'v = ["0,0", "2,2", "3,6", "4,2"]', "plt.plot(zeit, v)"], 20, [(2.4, "kein Fehler, aber Text-Achse", CODE_N)]),
 (["zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]", "plt.plot(v, zeit)"], 20, [(2.4, "kein Fehler, aber Zeit senkrecht", CODE_N)]),
 (["zeit = [0, 1, 2, 3, 4, 5]", "v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]", "plt.plot(zeit, v)"], 20, [(2.4, "(kein Fenster, kein Bild)", CODE_C)]),
 (["monat = [1, 2, 3, 4, 5, 6]", "a = [2.2, 2.1, 2.3, 2.2, 2.4, 2.2]", "b = [2.4, 2.5, 2.3, 2.5, 2.6, 2.4]",
   'plt.plot(monat, a, linestyle="-", marker="o", label="A")', 'plt.plot(monat, b, linestyle="--", marker="s", label="B")', "plt.legend()"], 18, []),
]
MON = [1, 2, 3, 4, 5, 6]; A6 = [2.2, 2.1, 2.3, 2.2, 2.4, 2.2]; B6 = [2.4, 2.5, 2.3, 2.5, 2.6, 2.4]

def sc6(f, t, ct):
    heading(f, t, "Typische Fehler")
    for k, (code, size, outs) in enumerate(C6):
        t0 = ct(k) - 0.1; t1 = ct(k + 1) if k < 4 else None
        if k == 4: tm = mk_times(code, ([0, 1, 2], ct(k) + 0.2), ([3, 4, 5], ct(k) + 1.8))
        else: tm = mk_times(code, (list(range(len(code))), ct(k) + 0.2))
        hl = {2} if k in (0, 2, 3) else ({1} if k == 1 else None)
        cpage(f, t, t0, t1, code, tm, [(ct(k) + o[0], o[1], o[2]) for o in outs], size=size, lh=int(size * 1.45), hl=hl, w=660 if k == 4 else 640)
        rcard(f, t, t0 + 0.1, t1)
    # Seite 1: ungleich lange Listen
    def p0(d, dy):
        T2(d, 770, 165 + dy, "zeit", F(26, 700), GREY, "lm"); T2(d, 770, 285 + dy, "v", F(26, 700), GREY, "lm")
        for i in range(6):
            x = 860 + i * 60
            d.rounded_rectangle((x, 140 + dy, x + 54, 190 + dy), 8, fill=WHITE, outline=DARK, width=2); T2(d, x + 27, 165 + dy, str(i), M(22, True), DARK, "mm")
            if i < 3:
                d.rounded_rectangle((x, 260 + dy, x + 54, 310 + dy), 8, fill=WHITE, outline=DARK, width=2); T2(d, x + 27, 285 + dy, ["0.0", "2.2", "3.6"][i], M(20, True), DARK, "mm")
            else:
                d.rounded_rectangle((x, 260 + dy, x + 54, 310 + dy), 8, fill=LIGHTR, outline=RED, width=2); T2(d, x + 27, 285 + dy, "?", F(26, 700), RED, "mm")
        tag(d, 800, 360 + dy, 160, 44, "6 Werte", WHITE, DARK, 26, 700, outl=DARK); tag(d, 1010, 360 + dy, 160, 44, "3 Werte", LIGHTR, RED, 26, 700, outl=RED)
        tag(d, 800, 450 + dy, 400, 50, "ValueError", RED, WHITE, 28)
        T2(d, 985, 560 + dy, "beide Listen gleich lang", F(24, 600), GREY, "mm")
    f.el(win(t, ct(0) + 2.6, ct(1)), p0)
    # Seite 2: Textachse
    P1 = Plot((830, 250, 1200, 540), (-0.15, 3.15), (-0.15, 3.15))
    def p1(d, dy):
        axes2(d, dy, P1, [0, 1, 2, 3], [0, 1, 2, 3], fs=19, yfmt=lambda v: ["0,0", "2,2", "3,6", "4,2"][int(v)])
        curve(d, dy, P1, [0, 1, 2, 3], [0, 1, 2, 3], ap(t, ct(1) + 3.0, 1.6), mk="o", msz=6)
        tag(d, 800, 164 + dy, 400, 44, "Achse mit Texten statt Zahlen", LIGHTA, AMB, 24, 700, outl=AMBER)
        T2(d, 1200, 590 + dy, "gleiche Abstände, egal welcher Wert", F(21, 600), GREY, "ra")
    f.el(win(t, ct(1) + 2.6, ct(2)), p1)
    # Seite 3: vertauscht
    P2 = Plot((830, 250, 1200, 540), (-0.23, 4.83), (-0.25, 5.25))
    def p2(d, dy):
        axes2(d, dy, P2, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], fs=19)
        curve(d, dy, P2, V, ZEIT, ap(t, ct(2) + 3.0, 1.8))
        tag(d, 800, 164 + dy, 400, 44, "Zeit liegt senkrecht", LIGHTR, RED, 24, 700, outl=RED)
        T2(d, 1200, 590 + dy, "x und y vertauscht", F(21, 600), GREY, "ra")
    f.el(win(t, ct(2) + 2.6, ct(3)), p2)
    # Seite 4: kein show
    def p3(d, dy):
        d.rounded_rectangle((800, 190 + dy, 1180, 470 + dy), 12, outline=GREY, width=3)
        T2(d, 990, 330 + dy, "kein Fenster", F(32, 700), GREY, "mm")
        tag(d, 800, 520 + dy, 380, 50, "plt.show() fehlt", RED, WHITE, 28)
    f.el(win(t, ct(3) + 2.6, ct(4)), p3)
    # Seite 5: nie nur Farbe
    P4 = Plot((830, 250, 1200, 540), (0.75, 6.25), (2.075, 2.625))
    def p4(d, dy):
        axes2(d, dy, P4, MON, [2.2, 2.4, 2.6], "Monat", "", fs=19)
        curve(d, dy, P4, MON, A6, ap(t, ct(4) + 3.4, 1.6), DARK, 4, mk="o")
        curve(d, dy, P4, MON, B6, ap(t, ct(4) + 5.0, 1.6), RED, 4, mk="s", dash=True)
        a = ap(t, ct(4) + 6.8, 0.5)
        if a > 0:
            col = mix(WHITE, DARK, a); d.rounded_rectangle((830, 170 + dy, 1100, 214 + dy), 8, fill=WHITE, outline=LINE, width=2)
            d.line((842, 192 + dy, 886, 192 + dy), fill=col, width=4); marker(d, 864, 192 + dy, "o", col, 6); T2(d, 896, 192 + dy, "A", F(24, 700), col, "lm")
            col2 = mix(WHITE, RED, a); dline(d, 972, 192 + dy, 1016, 192 + dy, col2, 4); marker(d, 994, 192 + dy, "s", col2, 6); T2(d, 1026, 192 + dy, "B", F(24, 700), col2, "lm")
    f.el(win(t, ct(4) + 1.0), p4)
    tile(f, t, ct(4) + 3.0, 60, 520, 640, 84, "Linienstil · Marker", "zusätzlich zur Farbe: gestrichelt, Quadrate", DARK)
    tile(f, t, ct(4) + 6.4, 60, 612, 640, 70, "label + legend()", "erklärt, welche Linie welche ist", DARK, bigsize=26)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def chip_w(txt, size, pad=22): return int(F(size, 700).getlength(txt)) + 2 * pad
def chip(d, x, y, w, h, txt, fill, col, size=30):
    fit(txt, F(size, 700), w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, F(size, 700), col, "mm")

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V14 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Python-Werkstatt", F(84, 700), DARK)
        T2(d, 90, 290, "matplotlib, Achsen und Subplots", F(44, 400), GREY)
        x = 90
        for nm in ("plot", "scatter", "bar", "hist"):
            wd = chip_w(nm, 36, 24); chip(d, x, 440, wd, 80, nm, LIGHTG, GREEN, 36); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
