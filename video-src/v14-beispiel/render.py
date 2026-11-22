"""V14 Vorgerechnet: Bremsmessung als ehrliches Diagramm (Code exakt aus briefing/v14-beispiel.py, Diagramme mit echten Daten aus bremsen.csv).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts erst nach Freigabe der Credits)"""
import os, sys, math, csv
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v14-common"))
from h14 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v14-beispiel"; LABEL = "DHBW · Informatik · V14 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235); AMB = (176, 110, 0)

# ---------------------------------------------------------------- Code und echte Daten
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v14-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 45 and CODE[4] == "import csv" and CODE[22].startswith("dt =") and CODE[27].startswith("fig, (oben") and CODE[44].startswith("print(")
CSV_PATH = os.path.join(HERE, "..", "..", "site", "assets", "data", "v09", "bremsen.csv")
RAW = open(CSV_PATH, encoding="utf-8").read().splitlines()
def zahl(text): return float(text.replace(",", "."))
ZEIT, AY = [], []
with open(CSV_PATH, encoding="utf-8") as datei:
    leser = csv.reader(datei, delimiter=";"); next(leser)
    for zeile in leser: ZEIT.append(zahl(zeile[0])); AY.append(zahl(zeile[2]))
DT = ZEIT[1] - ZEIT[0]; V = [4.4]
for a in AY[1:]: V.append(V[-1] + a * DT)
assert len(ZEIT) == 400 and abs(DT - 0.02) < 1e-9 and f"{min(AY):.2f}" == "-3.78" and f"{V[-1]:.2f}" == "0.05"
XR = (0, 8)

def show(t, tin, tout=None): return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)
def fit(txt, font, w, what=""): assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")
def chip(d, x, y, w, h, txt, fill, col, size=28, outl=None, mono=False):
    font = M(size, True) if mono else F(size, 700); fit(txt, font, w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, font, col, "mm")
def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def code_n(d, x, y, w, lines, nums, times, t, size, lh, hl=None, cps=55):
    """Code-Panel mit echten Zeilennummern (nums). Gibt die Hoehe zurueck."""
    f = M(size); top = 18 + 32; h = top + lh * len(lines) + 18
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, "Python (briefing/v14-beispiel.py)", F(20, 600), CODE_C)
    hl = hl or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        if i in hl:
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=HLBG); d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 3), fill=RED)
        dim = 0.4 if (hl and i not in hl) else 1.0
        if n > 0: d.text((x + 20, yy), f"{nums[i]:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        fit(ln, f, w - 62 - 12, f"Code Zeile {nums[i]}")
        draw_segs(d, x + 62, yy, highlight(ln), f, n, dim)
    return h

def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]; nums = list(range(a, b + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl))

def curve(d, P, xs, ys, upto, col, w=2):
    """Linienzug mit echten Daten; was ausserhalb der y-Achse liegt, wird abgeschnitten (wie bei set_ylim)."""
    lo, hi = P.yr; n = max(0, min(len(xs), int(len(xs) * upto)))
    def cl(xa, ya, xb, yb):
        if ya < lo: return xa + (xb - xa) * (lo - ya) / (yb - ya), lo
        if ya > hi: return xa + (xb - xa) * (hi - ya) / (yb - ya), hi
        return xa, ya
    for i in range(1, n):
        x0, y0, x1, y1 = xs[i - 1], ys[i - 1], xs[i], ys[i]
        if (y0 < lo and y1 < lo) or (y0 > hi and y1 > hi): continue
        xa, ya = cl(x0, y0, x1, y1); xb, yb = cl(x1, y1, x0, y0)
        d.line((P.px(xa), P.py(ya), P.px(xb), P.py(yb)), fill=col, width=w)

def draw_a_plot(d, P, t, t0, dur, ylab="Beschleunigung a in m/s²", xlab="", xlabels=True, zero=True):
    P.axes(d, 0, [0, 2, 4, 6, 8], [-4, -3, -2, -1, 0, 1], xlab, ylab, xfmt=(lambda v: f"{v:g}") if xlabels else (lambda v: ""))
    if zero: d.line((P.x0, P.py(0), P.x1, P.py(0)), fill=GREY, width=2)
    curve(d, P, ZEIT, AY, clamp((t - t0) / dur), RED, 2)

def draw_v_plot(d, P, t, t0, dur, ylab="Geschwindigkeit v in m/s", xlab="Zeit t in s", yticks=(0, 1, 2, 3, 4, 5), col=DARK):
    P.axes(d, 0, [0, 2, 4, 6, 8], list(yticks), xlab, ylab)
    curve(d, P, ZEIT, V, clamp((t - t0) / dur), col, 3)

# ---------------------------------------------------------------- 1 Aufgabe und Daten
def sc1(f, t, ct):
    heading(f, t, "Bremsmessung mit dem Fahrrad")
    def bike(d, dy):
        for cx in (150, 390):
            d.ellipse((cx - 56, 290 + dy - 56, cx + 56, 290 + dy + 56), outline=DARK, width=6)
            d.ellipse((cx - 6, 290 + dy - 6, cx + 6, 290 + dy + 6), fill=DARK)
        pts = lambda *p: [(x, y + dy) for x, y in p]
        d.line(pts((150, 290), (232, 290), (205, 205), (362, 205), (232, 290)), fill=DARK, width=6, joint="curve")
        d.line(pts((205, 205), (150, 290)), fill=DARK, width=6); d.line(pts((362, 205), (390, 290)), fill=DARK, width=6)
        d.line(pts((362, 205), (356, 172), (392, 168)), fill=DARK, width=6, joint="curve")
        d.line(pts((196, 190), (226, 190)), fill=DARK, width=8)
        d.rounded_rectangle((372, 118 + dy, 424, 176 + dy), 8, fill=BOX, outline=DARK, width=3)
        d.rounded_rectangle((378, 126 + dy, 418, 160 + dy), 4, fill=LIGHTB)
        T2(d, 398, 143 + dy, "a", F(24, 700), RED, "mm")
        T2(d, 398, 106 + dy, "Handy mit phyphox", F(22, 700), GREY, "mm")
        arrow(d, 470, 290 + dy, 540, 290 + dy, RED, 5, 16); T2(d, 505, 262 + dy, "Fahrt", F(22, 700), RED, "mm")
    f.el(show(t, 0.3), bike, dy=dyf(t, 0.3))
    def csvcard(d, dy):
        card(d, 590, 128 + dy, 630, 236)
        T2(d, 620, 140 + dy, "bremsen.csv (Ausschnitt)", F(26, 700), DARK, "la")
        mono = M(18)
        head = RAW[0].split(";"); hl = ";".join(head[:3]) + ";…"
        row = lambda k: ";".join(RAW[k].split(";")[:3]) + ";…"
        lines = [(hl, CODE_C), (row(1), CODE_T), (row(2), CODE_T), (row(3), CODE_T)]
        d.rounded_rectangle((612, 182 + dy, 1198, 296 + dy), 10, fill=BOX)
        for k, (ln, col) in enumerate(lines):
            s = ln
            while mono.getlength(s) > 560: s = s[:-2] + "…"
            T2(d, 626, 196 + dy + k * 26, s, mono, col, "lm")
        a = ap(t, ct(1) + 1.6, 0.4)
        if a > 0:
            chip(d, 612, 308 + dy, 280, 42, "Trennzeichen ;", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 24)
            chip(d, 906, 308 + dy, 292, 42, "Dezimalkomma ,", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 24)
    f.el(show(t, ct(1) + 0.2), csvcard, dy=dyf(t, ct(1) + 0.2))
    P1 = Plot((110, 440, 590, 610), XR, (-4, 1)); P2 = Plot((730, 440, 1190, 610), XR, (0, 5))
    def pl(d, dy):
        draw_a_plot(d, P1, t, ct(2) + 0.6, 2.4, xlab="Zeit t in s")
        P2.axes(d, 0, [0, 2, 4, 6, 8], [0, 1, 2, 3, 4, 5], "Zeit t in s", "Geschwindigkeit v in m/s")
        T2(d, 108, 378 + dy, "oben", F(20, 700), GREY, "la"); T2(d, 728, 378 + dy, "unten", F(20, 700), GREY, "la")
    f.el(show(t, ct(2) + 0.1), pl, dy=dyf(t, ct(2) + 0.1))
    f.el(show(t, ct(3) + 0.2), lambda d, dy: T2(d, 960, 530 + dy, "v = ?", F(56, 700), RED, "mm"), dy=dyf(t, ct(3) + 0.2))
    f.el(show(t, ct(3) + 0.2), lambda d, dy: arrow(d, 612, 525 + dy, 712, 525 + dy, RED, 5, 16))

# ---------------------------------------------------------------- 2 Programmablaufplan
def build_pap():
    D = Dia(19); N = D.node
    N("s", "term", "Start", 0, 0); N("ini", "proc", "zeit = [ ], a_y = [ ]", 0, 0); N("opn", "proc", "Datei öffnen, Kopfzeile überspringen", 0, 0)
    N("w1", "dec", "weitere Zeile in der Datei?", 0, 0); N("b1", "proc", "zeit und a_y um den Wert" + chr(10) + "der Zeile ergänzen", 0, 0)
    N("dt", "proc", "dt = zeit[1] − zeit[0]", 0, 0); N("v0", "proc", "v = [4,4]", 0, 0)
    N("w2", "dec", "weiterer Beschleunigungswert?", 0, 0); N("b2a", "proc", "v neu = v letzter + a · dt", 0, 0); N("b2b", "proc", "v um den neuen Wert ergänzen", 0, 0)
    N("plt", "io", "Diagramm: oben a über t, unten v über t", 0, 0); N("ken", "io", "Kennwerte ausgeben", 0, 0); N("end", "term", "Ende", 0, 0)
    n = D.nodes; Y = [44, 168, 292, 414, 540]; CX = 270
    x = 30
    for k in ("s", "ini", "opn"):
        n[k].cy = Y[0]; n[k].cx = x + n[k].w / 2; x += n[k].w + 46
    n["w1"].cx = n["w2"].cx = CX; n["w1"].cy = Y[1]; n["w2"].cy = Y[3]
    n["b1"].cy = Y[1]; n["b1"].cx = n["w1"].bbox()[2] + 64 + n["b1"].w / 2
    n["dt"].cy = n["v0"].cy = Y[2]; n["dt"].cx = CX; n["v0"].cx = n["dt"].bbox()[2] + 60 + n["v0"].w / 2
    n["b2a"].cy = n["b2b"].cy = Y[3]; n["b2a"].cx = n["w2"].bbox()[2] + 64 + n["b2a"].w / 2; n["b2b"].cx = n["b2a"].bbox()[2] + 54 + n["b2b"].w / 2
    n["plt"].cy = n["ken"].cy = n["end"].cy = Y[4]; n["plt"].cx = CX
    n["ken"].cx = n["plt"].bbox()[2] + 50 + n["ken"].w / 2; n["end"].cx = n["ken"].bbox()[2] + 50 + n["end"].w / 2
    E = D.edge
    E("s-ini", "s", "r", "ini", "l"); E("ini-opn", "ini", "r", "opn", "l"); E("opn-w1", "opn", "b", "w1", "t")
    yb1 = n["w1"].bbox()[1] - 9; yb2 = n["w2"].bbox()[1] - 9
    E("w1-b1", "w1", "r", "b1", "l", label="ja"); E("b1-w1", "b1", "t", (CX, yb1), None, via=[(n["b1"].cx, yb1)])
    E("w1-dt", "w1", "b", "dt", "t", label="nein"); E("dt-v0", "dt", "r", "v0", "l"); E("v0-w2", "v0", "b", "w2", "t")
    E("w2-b2a", "w2", "r", "b2a", "l", label="ja"); E("b2a-b2b", "b2a", "r", "b2b", "l"); E("b2b-w2", "b2b", "t", (CX, yb2), None, via=[(n["b2b"].cx, yb2)])
    E("w2-plt", "w2", "b", "plt", "t", label="nein"); E("plt-ken", "plt", "r", "ken", "l"); E("ken-end", "ken", "r", "end", "l")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-ini", "ini", "ini-opn", "opn"],
           ["opn-w1", "w1", "w1-b1", "b1", "b1-w1"],
           ["w1-dt", "dt", "dt-v0", "v0"],
           ["v0-w2", "w2", "w2-b2a", "b2a", "b2a-b2b", "b2b", "b2b-w2", "w2-plt", "plt", "plt-ken", "ken", "ken-end", "end"]]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 580); PZOOM = min(1.12, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan: lesen, aufsummieren, zeichnen")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        step = 0.5 if g == 0 else (0.6 if g < 3 else 0.62)
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * step
    cur = max([g for g in range(4) if t >= ct(g)] or [0])
    hl = {k: PAL[cur] for k in PGROUPS[cur]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)

# ---------------------------------------------------------------- 3 Einlesen (Zeilen 5 bis 20)
def sc3(f, t, ct):
    heading(f, t, "Einlesen: Zeilen 5 bis 20")
    n = 16; times = [1e9] * n
    def put(idxs, start, cps=55):
        c = start
        for i in idxs:
            times[i] = c; c += max(len(CODE[4 + i]), 4) / cps + 0.1
    put(range(0, 4), ct(0) + 0.2); put(range(4, 8), ct(1) + 0.2); put(range(8, 16), ct(2) + 0.2)
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {4, 5}), (ct(2), set(range(8, 16))), (ct(3), {14, 15})])
    code_scene(f, t, 5, 20, 21, 30, 60, 112, 700, hl, times)
    X = 800; W_ = 420
    def tA(d, dy):
        card(d, X, 112 + dy, W_, 100); T2(d, X + 28, 122 + dy, "Zwei Bausteine", F(26, 700), DARK, "la")
        chip(d, X + 28, 160 + dy, 170, 40, "csv liest", LIGHTB, BLUE, 24); chip(d, X + 214, 160 + dy, 180, 40, "plt zeichnet", LIGHTB, BLUE, 24)
    f.el(show(t, ct(0) + 0.3), tA, dy=dyf(t, ct(0) + 0.3))
    def tB(d, dy):
        card(d, X, 224 + dy, W_, 130); T2(d, X + 28, 234 + dy, "zahl(text)", M(26, True), DARK, "la")
        chip(d, X + 28, 286 + dy, 150, 52, "„-3,78“", LIGHTA, AMB, 28)
        a = ap(t, ct(1) + 1.6, 0.4)
        if a > 0:
            arrow(d, X + 190, 312 + dy, X + 236, 312 + dy, GREY, 4, 12); T2(d, X + 213, 280 + dy, "float", M(20, True), GREY, "mm")
            chip(d, X + 246, 286 + dy, 150, 52, "-3.78", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 28)
    f.el(show(t, ct(1) + 0.3), tB, dy=dyf(t, ct(1) + 0.3))
    def tC(d, dy):
        card(d, X, 366 + dy, W_, 170); T2(d, X + 28, 376 + dy, "Zeile für Zeile", F(26, 700), DARK, "la")
        T2(d, X + 150, 416 + dy, "zeit", M(22, True), GREY, "mm"); T2(d, X + 290, 416 + dy, "a_y", M(22, True), GREY, "mm")
        for k in range(3):
            a = ap(t, ct(2) + 1.0 + 0.9 * k, 0.35)
            if a > 0:
                col = mix(WHITE, DARK, a)
                T2(d, X + 150, 450 + k * 28 + dy, f"{ZEIT[k]:.2f}", M(22), col, "mm"); T2(d, X + 290, 450 + k * 28 + dy, f"{AY[k]:.3f}", M(22), col, "mm")
        a = ap(t, ct(2) + 0.3, 0.4)
        if a > 0: chip(d, X + 300, 372 + dy, 104, 30, "next", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 18, mono=True)
    f.el(show(t, ct(2) + 0.2), tC, dy=dyf(t, ct(2) + 0.2))
    def tD(d, dy):
        card(d, X, 548 + dy, W_, 124); T2(d, X + 28, 556 + dy, "Eine Zeile = fünf Spalten", F(24, 700), DARK, "la")
        for k in range(5):
            on = k in (0, 2); x = X + 28 + k * 76
            d.rounded_rectangle((x, 592 + dy, x + 64, 634 + dy), 8, fill=LIGHTR if on else WHITE, outline=RED if on else LINE, width=2)
            T2(d, x + 32, 613 + dy, str(k), F(26, 700), RED if on else GREY, "mm")
        T2(d, X + 28 + 0 * 76 + 32, 652 + dy, "Zeit", F(20, 700), RED, "mm"); T2(d, X + 28 + 2 * 76 + 32, 652 + dy, "a_y", F(20, 700), RED, "mm")
    f.el(show(t, ct(3) + 0.2), tD, dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 4 Aufsummieren (Zeilen 23 bis 26)
def sc4(f, t, ct):
    heading(f, t, "Aufsummieren: Zeilen 23 bis 26")
    times = [1e9] * 4
    times[0] = ct(0) + 0.2; times[1] = ct(1) + 0.2; times[2] = ct(2) + 0.2; times[3] = ct(2) + 0.2 + len(CODE[24]) / 55 + 0.3
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(2), {2, 3}), (ct(3), {2, 3})])
    code_scene(f, t, 23, 26, 22, 32, 60, 112, 720, hl, times)
    def calc(d, dy):
        card(d, 60, 326 + dy, 720, 350)
        if t >= ct(0) + 1.0: T2(d, 90, 342 + dy, "dt = 0,02 − 0,00 = 0,02 s", F(28, 700), DARK, "la")
        if t >= ct(1) + 1.0: T2(d, 90, 384 + dy, "Start: v = 4,4 m/s  (etwa 16 km/h)", F(28, 700), DARK, "la")
        if t >= ct(2) + 0.3:
            d.line((90, 430 + dy, 750, 430 + dy), fill=LINE, width=2)
            T2(d, 90, 442 + dy, "Rechenbeispiel mit a = −3 m/s²", F(26, 700), GREY, "la")
        rows = [("v neu = v alt + a · dt", DARK, 0.8), ("= 4,4 + (−3) · 0,02", DARK, 2.4), ("= 4,4 − 0,06", DARK, 3.8), ("= 4,34 m/s", GREEN, 5.2)]
        for k, (s, col, off) in enumerate(rows):
            if t >= ct(2) + off:
                a = ap(t, ct(2) + off, 0.35); T2(d, 90, 482 + k * 46 + dy, s, F(32, 700), mix(WHITE, col, a), "la")
    f.el(show(t, 0.3), calc, dy=dyf(t, 0.3))
    def lst(d, dy):
        card(d, 820, 112 + dy, 400, 564)
        T2(d, 850, 124 + dy, "Liste v", F(30, 700), DARK, "la")
        ents = [(ct(1) + 1.0, "v[0]", "4.4", "Start"), (ct(2) + 5.6, "v[1]", "4.34", "Beispiel")]
        for k, (te, nm, val, lab) in enumerate(ents):
            a = ap(t, te, 0.4)
            if a > 0:
                y = 176 + k * 62
                d.rounded_rectangle((850, y + dy, 1190, y + 50 + dy), 10, fill=mix(WHITE, LIGHTB, a), outline=mix(WHITE, BLUE, a), width=2)
                T2(d, 868, y + 25 + dy, nm, M(22, True), mix(WHITE, GREY, a), "lm"); T2(d, 960, y + 25 + dy, val, M(26, True), mix(WHITE, DARK, a), "lm")
                T2(d, 1172, y + 25 + dy, lab, F(20, 600), mix(WHITE, GREY, a), "rm")
        a = ap(t, ct(3) + 0.2, 0.4)
        if a > 0:
            T2(d, 850, 318 + dy, "Die Schleife läuft 399-mal:", F(24, 700), mix(WHITE, GREY, a), "la")
            fr = clamp((t - ct(3) - 0.8) / 6.0); cnt = 1 + int(399 * fr)
            d.rounded_rectangle((850, 362 + dy, 1190, 394 + dy), 8, fill=WHITE, outline=LINE, width=2)
            if fr > 0: d.rounded_rectangle((850, 362 + dy, 850 + max(14, 340 * fr), 394 + dy), 8, fill=GREEN)
            T2(d, 1020, 452 + dy, f"len(v) = {cnt}", M(40, True), GREEN, "mm")
            T2(d, 1020, 506 + dy, "ein Wert mehr je Schritt", F(24, 400), GREY, "mm")
            if fr >= 1: T2(d, 1020, 560 + dy, "so viele wie zeit und a_y", F(24, 700), DARK, "mm")
    f.el(show(t, ct(1) + 0.2), lst, dy=dyf(t, ct(1) + 0.2))

# ---------------------------------------------------------------- 5 Zwei Teilbilder (Zeilen 28 bis 42)
PT = Plot((810, 196, 1190, 336), XR, (-4, 1)); PB = Plot((810, 432, 1190, 566), XR, (0, 5))
def sc5(f, t, ct):
    heading(f, t, "Zwei Teilbilder: Zeilen 28 bis 42")
    times = [ct(0) + 0.1] + [ct(1) + 0.2 + 0.4 * k for k in range(5)] + [ct(1) + 2.4] + [ct(2) + 0.2 + 0.4 * k for k in range(5)] + [ct(2) + 2.4] + [ct(3) + 0.2, ct(3) + 0.7]
    assert len(times) == 15
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2, 3, 4, 5}), (ct(2), {7, 8, 9, 10, 11}), (ct(3), {13, 14})])
    code_scene(f, t, 28, 42, 15, 23, 60, 112, 640, hl, times)
    # Erklaerkarte unter dem Code
    notes = [(ct(0), "fig, (oben, unten)", "liefert Abbildung und zwei Teilbilder"), (ct(1), "oben", "Beschleunigung in Rot, Titel, Einheit, Nulllinie"),
             (ct(2), "unten", "Geschwindigkeit in Schwarz, y von 0 bis 5"), (ct(3), "show()", "zeigt das Bild")]
    cur = max([k for k, (tt, _, _) in enumerate(notes) if t >= tt] or [0])
    def nt(d, dy):
        card(d, 60, 540 + dy, 640, 130); T2(d, 90, 554 + dy, notes[cur][1], M(28, True), RED, "la")
        T2(d, 90, 596 + dy, notes[cur][2], F(28, 600), DARK, "la")
        if cur == 2: T2(d, 90, 634 + dy, "gemeinsame Zeitachse: beschriftet nur unten", F(22, 400), GREY, "la")
    f.el(show(t, ct(0) + 0.3), nt)
    # Diagramm rechts
    def dia(d, dy):
        card(d, 740, 112 + dy, 480, 560, stripe=False)
        if t >= ct(0) + 0.6:
            PT.axes(d, 0, [0, 2, 4, 6, 8], [-4, -3, -2, -1, 0, 1], "", "", xfmt=lambda v: "")
            PB.axes(d, 0, [0, 2, 4, 6, 8], [0, 1, 2, 3, 4, 5], "", "")
            T2(d, 1190, 164, "oben", F(20, 700), GREY, "ra"); T2(d, 1190, 400, "unten", F(20, 700), GREY, "ra")
        if t >= ct(1) + 0.5:
            T2(d, 970, 132, "Bremsen mit dem Fahrrad (phyphox)", F(22, 700), DARK, "mm")
            T2(d, 760, 164, "a in m/s²", F(20, 600), GREY, "la")
            d.line((PT.x0, PT.py(0), PT.x1, PT.py(0)), fill=GREY, width=2)
            curve(d, PT, ZEIT, AY, clamp((t - ct(1) - 0.6) / 3.0), RED, 2)
        if t >= ct(2) + 0.5:
            T2(d, 760, 400, "v in m/s", F(20, 600), GREY, "la"); T2(d, 1190, 600, "t in s", F(20, 600), GREY, "ra")
            curve(d, PB, ZEIT, V, clamp((t - ct(2) - 0.6) / 3.0), DARK, 3)
            if t >= ct(2) + 3.8: tag(d, 830, 500, 170, 30, "ehrlich: ab 0", LIGHTG, GREEN, 18, 700, outl=GREEN)
    f.el(show(t, 0.3), dia)

# ---------------------------------------------------------------- 6 Ehrliche Achse gegen Taeuschung
P6a = Plot((100, 206, 590, 396), XR, (0, 5)); P6b = Plot((730, 206, 1200, 396), XR, (4.0, 5.0))
def sc6(f, t, ct):
    heading(f, t, "Ehrliche Achse oder Täuschung")
    def ha(d, dy):
        tag(d, 100, 126 + dy, 300, 40, "unten.set_ylim(0, 5)", LIGHTG, GREEN, 22, 700, outl=GREEN)
        draw_v_plot(d, P6a, t, ct(0) + 0.6, 2.6, yticks=(0, 1, 2, 3, 4, 5))
    f.el(show(t, 0.3), ha, dy=dyf(t, 0.3))
    def hb(d, dy):
        tag(d, 730, 126 + dy, 340, 40, "unten.set_ylim(4.0, 5.0)", LIGHTR, RED, 22, 700, outl=RED)
        draw_v_plot(d, P6b, t, ct(1) + 0.6, 2.6, yticks=(4.0, 4.25, 4.5, 4.75, 5.0), col=RED)
    f.el(show(t, ct(1) + 0.1), hb, dy=dyf(t, ct(1) + 0.1))
    f.el(show(t, ct(0) + 3.6), lambda d, dy: T2(d, 245, 340 + dy, "das Rad bremst bis fast 0", F(22, 700), GREEN, "mm"))
    f.el(show(t, ct(1) + 3.6), lambda d, dy: (T2(d, 850, 342 + dy, "Kurve läuft", F(22, 700), RED, "mm"), T2(d, 850, 370 + dy, "unten aus dem Bild", F(22, 700), RED, "mm")))
    # Ausgabe
    ents = [(ct(2) + 0.4, [("Größte Verzögerung: -3.78 m/s²", CODE_T)]), (ct(2) + 1.8, [("Geschwindigkeit am Ende: 0.05 m/s", CODE_T)])]
    f.el(show(t, ct(2) + 0.1), lambda d, dy: console_panel(d, 60, 484 + dy, 640, 136, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(2) + 0.1))
    f.el(show(t, ct(2) + 0.1), lambda d, dy: T2(d, 380, 640 + dy, "min(a_y) und v[-1]", M(22), GREY, "mm"))
    def merk(d, dy):
        card(d, 740, 468 + dy, 480, 204)
        T2(d, 770, 478 + dy, "Merke", F(28, 700), RED, "la")
        items = ["Einheit in jedem Achsentitel", "Bezugslinie bei 0", "y-Achse bei 0 beginnen"]
        for k, s in enumerate(items):
            a = ap(t, ct(3) + 0.4 + 1.5 * k, 0.4)
            if a > 0:
                y = 520 + k * 46
                d.ellipse((770, y + dy, 802, y + 32 + dy), fill=mix(WHITE, GREEN, a)); tick(d, 786, y + 16 + dy, 18, WHITE, 4)
                T2(d, 818, y + 16 + dy, s, F(26, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.1), merk, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V14 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Bremsmessung als ehrliches Diagramm", F(48, 400), GREY)
        code_n(d, 90, 380, 660, CODE[34:39], list(range(35, 40)), [-1] * 5, 9, 17, 27, {3})
        P = Plot((860, 400, 1200, 590), XR, (0, 5))
        P.axes(d, 0, [0, 2, 4, 6, 8], [0, 1, 2, 3, 4, 5], "Zeit t in s", "Geschwindigkeit v in m/s")
        curve(d, P, ZEIT, V, 1.0, DARK, 4)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
