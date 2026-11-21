"""V08 Theorie: Datenstrukturen (Liste, Tupel, Dictionary). Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v08-common"))
from h8 import *
from texte import SRC

NAME = "v08-theorie"; LABEL = "DHBW · Informatik · V08 · Datenstrukturen"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Zahlen vorab pruefen
def de(x, n): return f"{x:.{n}f}".replace(".", ",")
VALS8 = [12.004, 12.011, 11.998, 12.007, 12.019, 12.002, 12.015, 12.009]
LO, HI = 12.000, 12.018
OUT8 = [i for i, v in enumerate(VALS8) if v < LO or v > HI]
assert OUT8 == [2, 4] and [VALS8[i] for i in OUT8] == [11.998, 12.019]
VALS5 = VALS8[:5]
assert VALS5[1:4] == [12.011, 11.998, 12.007] and VALS5[-1] == 12.019 and VALS5[0] == 12.004
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); BLUE = (37, 99, 235)

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))

def lcell(d, x, y, w, h, txt, fill=WHITE, outl=DARK, tc=DARK, size=28, ow=3, wt=700):
    d.rounded_rectangle((x, y, x + w, y + h), 8, fill=fill, outline=outl, width=ow)
    if txt:
        fit(txt, F(size, wt), w - 8, "Zelle"); T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def codebox(f, a, x, y, w, lines, times, t, size=20, hl=None, dy0=0, lineno=False, title=None):
    f.el(a, lambda d, dy: code_panel(d, x, y + dy, w, lines, times, t, size, 60, hl=hl, dim_others=bool(hl), lineno=lineno, title=title, pad_bottom=14),
         dy=int((1 - a) * 10) + dy0)

# ---------------------------------------------------------------- 1 Hook: viele Werte, ein Name
def sc1(f, t, ct):
    heading(f, t, "Viele Werte unter einem Namen")
    x0, x1, yb = 100, 740, 330; lo, hi = 11.990, 12.030
    px = lambda v: x0 + (v - lo) / (hi - lo) * (x1 - x0)
    def panel(d, dy):
        card(d, 60, 130 + dy, 720, 330)
        T2(d, 92, 146 + dy, "Bohrung 12 mm, Toleranzklasse H7", F(26, 700), DARK)
        d.rectangle((px(LO), yb - 55 + dy, px(HI), yb + 55 + dy), fill=LIGHTG)
        for v in (LO, HI): d.line((px(v), yb - 62 + dy, px(v), yb + 62 + dy), fill=GREEN, width=3)
        d.line((x0, yb + dy, x1, yb + dy), fill=GREY, width=2)
        T2(d, px(LO), yb + 72 + dy, "12,000", F(22, 700), GREEN, "ma"); T2(d, px(HI) + 14, yb + 72 + dy, "12,018", F(22, 700), GREEN, "ma")
        T2(d, (px(LO) + px(HI)) / 2, yb - 100 + dy, "Toleranzfeld", F(22, 600), GREEN, "mm")
        T2(d, 92, 420 + dy, "Maß in mm", F(20, 600), GREY)
    f.el(ap(t, 0.2, 0.5), panel)
    for i, v in enumerate(VALS8):
        tin = ct(0) + 1.2 + 0.75 * i
        def dot(d, dy, i=i, v=v):
            x, y = px(v), yb + dy; col = RED if (v < LO or v > HI) else DARK
            d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=col)
            T2(d, x, y - 26 - (14 if i % 2 else 0), str(i + 1), F(19, 600), GREY, "mm")
        f.el(show(t, tin), dot)
    def fr(d, dy):
        card(d, 820, 130 + dy, 416, 330)
        T2(d, 850, 146 + dy, "Gesucht", F(28, 700), DARK)
    f.el(show(t, ct(1) + 0.2), fr, dy=int((1 - show(t, ct(1) + 0.2)) * 12))
    for k, (txt, dt) in enumerate((("Mittelwert", 0.8), ("Spannweite", 1.9), ("Anzahl der Werte außerhalb", 3.0))):
        def row(d, dy, k=k, txt=txt):
            y = 200 + k * 80 + dy
            d.ellipse((852, y + 8, 876, y + 32), fill=RED); fit(txt, F(26, 600), 330, "Frage")
            T2(d, 892, y + 20, txt, F(26, 600), DARK, "lm")
        f.el(show(t, ct(1) + dt), row)
    # acht Variablen -> ein Kasten
    cw, ch, ry = 118, 80, 540
    mv = ap(t, ct(3) + 0.2, 1.1)
    for i, v in enumerate(VALS8):
        xs = 60 + 140 * i; xm = 168 + 118 * i
        x = lerp(xs, xm, mv)
        def cell(d, dy, i=i, v=v, x=x):
            lcell(d, int(x), ry + dy, cw, ch, de(v, 3), WHITE, DARK, DARK, 26, 3)
            if mv < 0.5: T2(d, int(x) + cw / 2, ry - 22 + dy, f"m{i + 1}", F(26, 700), RED if mv < 0.2 else GREY, "mm")
        f.el(show(t, ct(2) + 0.3 + 0.35 * i), cell, dy=int((1 - show(t, ct(2) + 0.3 + 0.35 * i)) * 10))
    def note(d, dy): T2(d, 640, 650 + dy, "Bei 80 Werten: 80 Variablen?", F(26, 700), GREY, "mm")
    f.el(show(t, ct(2) + 3.0, ct(3) + 0.1), note)
    def box(d, dy):
        d.rounded_rectangle((162, ry - 6 + dy, 168 + 8 * 118 + 6, ry + ch + 6 + dy), 12, outline=RED, width=4)
        T2(d, 168 + 4 * 118, ry - 40 + dy, "messungen", F(34, 700), RED, "mm")
    f.el(ap(t, ct(3) + 1.0, 0.5), box)

# ---------------------------------------------------------------- 2 Liste: Index, negativ, Slice, append
CW, CH, CG = 140, 92, 12
LX0 = (1280 - (6 * CW + 5 * (CG))) // 2 + 0
def cx_(i): return LX0 + i * (CW + CG)
LY = 330

def sc2(f, t, ct):
    heading(f, t, "Die Liste: Kästchenreihe mit Index")
    t_app = ct(5) + 0.8
    n = 5 + (1 if t >= t_app else 0)
    app = ap(t, t_app, 0.7)
    def name(d, dy):
        T2(d, cx_(0), 170 + dy, "messungen", F(36, 700), RED, "la")
        T2(d, cx_(0) + 205, 182 + dy, "= ein Name für die ganze Reihe", F(24, 400), GREY, "la")
    f.el(show(t, ct(1) + 0.3), name)
    for i in range(6):
        v = VALS5[i] if i < 5 else 12.012
        if i < 5: tin = ct(1) + 1.0 + 0.4 * i; a = show(t, tin)
        else: tin = t_app; a = app
        sl = ap(t, ct(4) + 4.0, 0.4) * (1 - ap(t, ct(5) + 0.2, 0.4)) if 1 <= i <= 3 else 0
        def cell(d, dy, i=i, v=v, sl=sl):
            x = cx_(i) + (int((1 - app) * 60) if i == 5 else 0)
            lcell(d, x, LY + dy, CW, CH, de(v, 3), mix(WHITE, LIGHTB, sl), mix(DARK, BLUE, sl), DARK, 30, 3)
        f.el(a, cell, dy=int((1 - a) * 10))
    # Indizes unten
    for i in range(6):
        a = show(t, ct(2) + 0.3 + 0.3 * i) if i < 5 else app
        f.el(a, lambda d, dy, i=i: T2(d, cx_(i) + CW / 2, LY + CH + 14 + dy, str(i), F(30, 700), DARK, "ma"))
    f.el(show(t, ct(2) + 0.1), lambda d, dy: T2(d, cx_(0) - 14, LY + CH + 28 + dy, "Index", F(22, 600), GREY, "ra"))
    # negative Indizes oben
    for i in range(6):
        if i >= n: continue
        k = n - i; a = show(t, ct(3) + 0.3 + 0.3 * (4 - min(i, 4))) if i < 5 else app
        f.el(a, lambda d, dy, i=i, k=k: T2(d, cx_(i) + CW / 2, LY - 14 + dy, f"−{k}", F(26, 600), GREY, "ms"))
    f.el(show(t, ct(3) + 0.1), lambda d, dy: T2(d, cx_(0) - 14, LY - 38 + dy, "von hinten", F(22, 600), GREY, "ra"))
    # Marker [0] und [-1]
    def m0(d, dy):
        fit("messungen[0]", F(26, 700), 200, "m0")
        arrow(d, cx_(0) + CW / 2, LY + CH + 96 + dy, cx_(0) + CW / 2, LY + CH + 62 + dy, RED, 4)
        tag(d, cx_(0) + CW / 2 - 110, LY + CH + 100 + dy, 220, 46, "messungen[0]", RED, WHITE, 26)
    f.el(show(t, ct(2) + 2.4, ct(3) - 0.3), m0)
    xm1 = lambda: cx_(4) + CW / 2
    def mm1(d, dy):
        arrow(d, xm1(), LY - 92 + dy, xm1(), LY - 56 + dy, RED, 4)
        tag(d, xm1() - 120, LY - 140 + dy, 240, 46, "messungen[-1]", RED, WHITE, 26)
    f.el(show(t, ct(3) + 3.0, ct(4) + 0.1), mm1)
    # IndexError: Phantom-Kaestchen rechts
    def err(d, dy):
        x = cx_(5)
        for k in range(0, CW, 16): d.line((x + k, LY + dy, x + min(k + 8, CW), LY + dy), fill=RED, width=3); d.line((x + k, LY + CH + dy, x + min(k + 8, CW), LY + CH + dy), fill=RED, width=3)
        d.line((x, LY + dy, x, LY + CH + dy), fill=RED, width=3); d.line((x + CW, LY + dy, x + CW, LY + CH + dy), fill=RED, width=3)
        T2(d, x + CW / 2, LY + CH / 2 + dy, "?", F(40, 700), RED, "mm")
        tag(d, x - 80, LY + CH + 100 + dy, 300, 46, "messungen[5]: IndexError", RED, WHITE, 24)
    f.el(show(t, ct(4) + 0.5, ct(4) + 3.6), err)
    # Slice
    def sl(d, dy):
        xa, xb = cx_(1), cx_(3) + CW
        yb2 = LY + CH + 66
        d.line((xa, yb2 + dy, xb, yb2 + dy), fill=BLUE, width=4); d.line((xa, yb2 - 10 + dy, xa, yb2 + dy), fill=BLUE, width=4); d.line((xb, yb2 - 10 + dy, xb, yb2 + dy), fill=BLUE, width=4)
        tag(d, (xa + xb) / 2 - 130, yb2 + 20 + dy, 260, 46, "messungen[1:4]", BLUE, WHITE, 26)
        x4 = cx_(4)
        d.rounded_rectangle((x4 - 3, LY - 3 + dy, x4 + CW + 3, LY + CH + 3 + dy), 10, outline=GREY, width=3)
        T2(d, x4 + CW / 2, yb2 + 20 + dy, "Endwert 4:", F(24, 700), GREY, "ma"); T2(d, x4 + CW / 2, yb2 + 50 + dy, "nicht dabei", F(24, 700), GREY, "ma")
    f.el(show(t, ct(4) + 4.0, ct(5) + 0.2), sl)
    # append
    def ap_(d, dy):
        tag(d, cx_(5) - 20, 570 + dy, 180, 46, "append", DARK, WHITE, 26)
        arrow(d, cx_(5) + CW / 2, 570 + dy, cx_(5) + CW / 2, LY + CH + 52 + dy, DARK, 4)
        T2(d, cx_(0), 580 + dy, "Die Liste wächst: aus 5 Kästchen werden 6.", F(26, 600), DARK, "la")
    f.el(show(t, ct(5) + 0.4), ap_)

# ---------------------------------------------------------------- 3 Schleife ueber die Liste im PAP
PX = 270
def pnode(d, kind, cx, cy, w, h, txt, hl, fs=18, dy=0):
    col = RED if hl else DARK; fill = (255, 236, 238) if hl else WHITE; lw = 5 if hl else 3
    cy += dy
    if kind == "dec":
        fit(txt, F(fs, 600), w * 0.62, "PAP-Raute")
        d.polygon([(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)], fill=fill, outline=col, width=lw)
    elif kind == "term":
        fit(txt, F(fs, 600), w - 20, "PAP-Terminal"); d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), h // 2, fill=fill, outline=col, width=lw)
    else:
        fit(txt, F(fs, 600), w - 20, "PAP-Block"); d.rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=fill, outline=col, width=lw)
    T2(d, cx, cy, txt, F(fs, 600), RED if hl else DARK, "mm")

def sc3(f, t, ct):
    heading(f, t, "Schleife über eine Liste")
    ls = ct(2) + 2.0; per = 0.95
    k = (t - ls) / per
    ph = 0.0; cur = -1; node = None
    if k >= 0:
        cur = int(k); ph = (k - cur)
        if cur >= 8:
            node = "A" if (t - ls - 8 * per) < 0.4 else "E"
        else:
            out = cur in OUT8
            node = "A" if ph < 0.2 else "B" if ph < 0.4 else "C" if ph < 0.65 else ("D" if (ph < 1.0 and out) else None)
    # Liste der Messwerte (2 Zeilen a 4)
    f.el(show(t, ct(0) + 0.2), lambda d, dy: T2(d, 690, 136 + dy, "messungen", F(26, 700), RED, "la"))
    def cpos(i): return 690 + (i % 4) * 132, 176 + (i // 4) * 72
    for i, v in enumerate(VALS8):
        done = k >= 0 and (cur > i or (cur == i and ph >= 0.65)) if cur < 8 else (k >= 0)
        active = (k >= 0 and cur == i and ph >= 0.2 and cur < 8)
        out = i in OUT8
        fill = WHITE; outl = DARK; ow = 3
        if done: fill = LIGHTR if out else LIGHTG
        if active: outl = RED; ow = 5
        def cell(d, dy, i=i, v=v, fill=fill, outl=outl, ow=ow, out=out):
            x, y = cpos(i); lcell(d, x, y + dy, 122, 58, de(v, 3), fill, outl, RED if (out and fill == LIGHTR) else DARK, 24, ow)
        f.el(show(t, ct(0) + 0.3 + 0.12 * i), cell)
    # zweite Liste
    f.el(show(t, ct(2) + 0.6), lambda d, dy: T2(d, 690, 336 + dy, "ausserhalb", F(26, 700), RED, "la"))
    f.el(show(t, ct(2) + 0.6), lambda d, dy: d.rounded_rectangle((690, 372 + dy, 690 + 2 * 160 + 4, 372 + 62 + dy), 8, outline=LINE, width=2))
    for j, i in enumerate(OUT8):
        tin = ls + i * per + 0.65
        f.el(show(t, tin), lambda d, dy, j=j, i=i: lcell(d, 692 + j * 160, 374 + dy, 156, 58, de(VALS8[i], 3), LIGHTR, RED, RED, 26, 3))
    # Code
    cl = ["for d in messungen:", "    if d < 12.000 or d > 12.018:", "        ausserhalb.append(d)"]
    tm = [ct(0) + 1.2, ct(2) + 0.5, ct(2) + 1.3]
    hs = {"A": {0}, "B": {0}, "C": {1}, "D": {2}}.get(node)
    codebox(f, show(t, ct(0) + 1.0), 690, 470, 540, cl, tm, t, 20, hl=hs)
    # PAP
    def grpA(d, dy):
        arrow(d, PX, 128 + dy, PX, 134 + dy, DARK, 4, 10) if False else None
        d.line((PX, 118 + dy, PX, 134 + dy), fill=DARK, width=4)
        pnode(d, "dec", PX, 170, 300, 72, "noch ein Wert übrig?", node == "A", 19, dy)
        d.line((PX + 150, 170 + dy, 430, 170 + dy), fill=DARK, width=4); T2(d, PX + 168, 148 + dy, "nein", F(19, 700), RED, "la")
        pnode(d, "term", 480, 170, 90, 44, "Ende", node == "E", 20, dy)
        # Rueckfuehrlinie mit Pfeil vor die Raute
        arrow(d, 70, 170 + dy, PX - 150 - 2, 170 + dy, DARK, 4, 12)
    f.el(show(t, ct(1) + 0.3), grpA, dy=int((1 - show(t, ct(1) + 0.3)) * 10))
    def grpB(d, dy):
        arrow(d, PX, 206 + dy, PX, 252 + dy, DARK, 4); T2(d, PX + 12, 214 + dy, "ja", F(19, 700), GREEN, "la")
        pnode(d, "proc", PX, 275, 240, 46, "d = nächster Wert", node == "B", 19, dy)
    f.el(show(t, ct(1) + 3.6), grpB, dy=int((1 - show(t, ct(1) + 3.6)) * 10))
    def ph_(d, dy):
        for x in range(100, 440, 16):
            d.line((x, 345 + dy, x + 8, 345 + dy), fill=GREY, width=3); d.line((x, 560 + dy, x + 8, 560 + dy), fill=GREY, width=3)
        for y in range(345, 560, 16):
            d.line((100, y + dy, 100, y + 8 + dy), fill=GREY, width=3); d.line((440, y + dy, 440, y + 8 + dy), fill=GREY, width=3)
        T2(d, PX, 452 + dy, "Rumpf", F(30, 700), GREY, "mm")
    f.el(show(t, ct(1) + 5.2, ct(2) + 0.3), ph_)
    def ret(d, dy):
        d.line((PX, 560 + dy, PX, 590 + dy), fill=DARK, width=4); d.line((PX, 590 + dy, 70, 590 + dy), fill=DARK, width=4); d.line((70, 590 + dy, 70, 170 + dy), fill=DARK, width=4)
        T2(d, 84, 600 + dy, "Rückführlinie", F(20, 600), GREY, "la")
    f.el(show(t, ct(1) + 8.0), ret)
    def grpCD(d, dy):
        d.line((PX, 298 + dy, PX, 345 + dy), fill=DARK, width=4)
        pnode(d, "dec", PX, 400, 380, 84, "d < 12,000 oder d > 12,018 ?", node == "C", 17, dy)
        arrow(d, PX, 442 + dy, PX, 485 + dy, DARK, 4); T2(d, PX + 12, 450 + dy, "ja", F(19, 700), GREEN, "la")
        pnode(d, "proc", PX, 508, 280, 46, "d an ausserhalb anhängen", node == "D", 18, dy)
        d.line((PX, 531 + dy, PX, 590 + dy), fill=DARK, width=4)
        d.line((PX + 190, 400 + dy, 500, 400 + dy), fill=DARK, width=4); d.line((500, 400 + dy, 500, 590 + dy), fill=DARK, width=4); d.line((500, 590 + dy, PX, 590 + dy), fill=DARK, width=4)
        T2(d, PX + 200, 372 + dy, "nein", F(19, 700), RED, "la")
    f.el(show(t, ct(2) + 0.3), grpCD, dy=int((1 - show(t, ct(2) + 0.3)) * 10))
    pill(f, t, ct(3) + 0.5, 690, 640, 540, 44, "2 Werte außerhalb: 11,998 und 12,019", size=24)

# ---------------------------------------------------------------- 4 Aliasing
A3 = [20.5, 21.0, 19.8]
def sc4(f, t, ct):
    heading(f, t, "Zwei Namen, eine Liste: Aliasing")
    LX, LYa, LYb, cw, ch = 360, 190, 470, 104, 70
    def listbox(d, y, vals, dy, name_col=DARK, shade=WHITE, slots=4):
        n = len(vals)
        d.rounded_rectangle((LX - 14, y - 14 + dy, LX + 14 + slots * (cw + 8) - 8, y + ch + 14 + dy), 14, fill=BG, outline=DARK, width=3)
        for i, v in enumerate(vals):
            lcell(d, LX + i * (cw + 8), y + dy, cw, ch, de(v, 1), shade, DARK, DARK, 28, 2)
    t_ap = ct(2) + 1.2; t_cp = ct(3) + 2.4
    # Liste 1
    def l1(d, dy):
        listbox(d, LYa, A3, dy)
        a = ap(t, t_ap, 0.6)
        if a > 0.02:
            x = LX + 3 * (cw + 8); lcell(d, x, LYa + dy, cw, ch, "22,4", mix(WHITE, LIGHTR, a), RED, RED, 28, 4)
    f.el(show(t, ct(0) + 0.5), l1, dy=int((1 - show(t, ct(0) + 0.5)) * 10))
    def grow1(d, dy):  # 4. Platz erscheint erst mit dem append: Container waechst sichtbar
        pass
    # Tag a
    f.el(show(t, ct(0) + 2.0), lambda d, dy: (tag(d, 90, LYa + 14 + dy, 120, 46, "a", DARK, WHITE, 30), arrow(d, 214, LYa + 37 + dy, LX - 18, LYa + 37 + dy, DARK, 4, 13)))
    # Tag b: zeigt erst auf Liste 1, dann auf Liste 2
    mv = ap(t, t_cp - 0.4, 1.0)
    by = lerp(LYa + 150, LYb + 14, mv)
    def tb(d, dy):
        tag(d, 90, int(by) + dy, 120, 46, "b", RED, WHITE, 30)
        yt = lerp(LYa + 56, LYb + 37, mv)
        arrow(d, 214, int(by) + 23 + dy, LX - 18, int(yt) + dy, RED, 4, 13)
    f.el(show(t, ct(1) + 0.8), tb)
    # Liste 2 (Kopie)
    A4 = A3 + [22.4]
    def l2(d, dy):
        listbox(d, LYb, A4, dy, slots=5)
        a = ap(t, t_cp + 2.0, 0.6)
        if a > 0.02:
            lcell(d, LX + 4 * (cw + 8) - 0, LYb + dy, cw, ch, "25,0", mix(WHITE, LIGHTR, a), RED, RED, 28, 4) if False else None
    f.el(show(t, t_cp - 0.2), l2, dy=int((1 - show(t, t_cp - 0.2)) * 10))
    # Code (Seitenwechsel)
    c1 = ["a = [20.5, 21.0, 19.8]", "b = a", "b.append(22.4)", "print(a)"]
    tm1 = [ct(0) + 1.0, ct(1) + 0.6, ct(2) + 0.4, ct(2) + 3.2]
    codebox(f, show(t, ct(0) + 0.8, ct(3) + 0.2), 850, 140, 390, c1, tm1, t, 20, lineno=False, title="Python")
    c2 = ["b = a[:]", "b.append(25.0)", "print(a)"]
    tm2 = [ct(3) + 0.6, ct(3) + 4.2, ct(3) + 6.0]
    codebox(f, show(t, ct(3) + 0.4), 850, 140, 390, c2, tm2, t, 20, lineno=False, title="Python")
    # Ausgabe
    def out1(d, dy):
        tag(d, 850, 340 + dy, 390, 46, "a ist jetzt [20.5, 21.0, 19.8, 22.4]", WHITE, RED, 21, 700, outl=RED)
    f.el(show(t, ct(2) + 3.4, ct(3) + 0.2), out1)
    def out2(d, dy):
        tag(d, 850, 340 + dy, 390, 46, "a bleibt [20.5, 21.0, 19.8, 22.4]", WHITE, GREEN, 21, 700, outl=GREEN)
    f.el(show(t, ct(3) + 6.4), out2)
    # b.append zweiter Zeitpunkt: 25,0 nur in Liste 2
    def nb(d, dy):
        lcell(d, LX + 4 * (cw + 8), LYb + dy, cw, ch, "25,0", LIGHTR, RED, RED, 28, 4)
    f.el(show(t, ct(3) + 4.6), nb)
    # Beschriftungen
    f.el(show(t, ct(1) + 3.5, ct(2) + 0.2), lambda d, dy: T2(d, 90, 640 + dy, "b = a legt keine neue Liste an: nur ein zweites Schild.", F(26, 600), DARK, "la"))
    f.el(show(t, ct(2) + 0.2, ct(3) + 0.2), lambda d, dy: T2(d, 90, 640 + dy, "Eine Liste, zwei Namen: Das append über b zeigt sich bei a.", F(26, 600), RED, "la"))
    f.el(show(t, ct(3) + 0.4, ct(4) + 0.2), lambda d, dy: T2(d, 90, 640 + dy, "a[:] kopiert: zwei getrennte Listen, das append betrifft nur b.", F(26, 600), DARK, "la"))
    def stille(d, dy):
        d.rounded_rectangle((90, 626 + dy, 1190, 676 + dy), 25, fill=RED)
        T2(d, 640, 651 + dy, "Keine Fehlermeldung, aber still verfälschte Daten.", F(28, 700), WHITE, "mm")
    f.el(show(t, ct(4) + 0.6), stille, dy=int((1 - show(t, ct(4) + 0.6)) * 10))

# ---------------------------------------------------------------- 5 Tupel und Dictionary
STL = [["W-100", "1", "2,40"], ["L-6205", "2", "0,13"], ["D-35", "2", "0,02"]]
def sc5(f, t, ct):
    heading(f, t, "Tupel und Dictionary")
    # links: Tupel
    def tup(d, dy):
        T2(d, 90, 140 + dy, "Tupel: runde Klammern", F(30, 700), DARK, "la")
        T2(d, 80, 232 + dy, "(", F(110, 300), DARK, "lm"); T2(d, 590, 232 + dy, ")", F(110, 300), DARK, "rm")
        lcell(d, 140, 190 + dy, 190, 84, "12,000", WHITE, DARK, DARK, 34, 3); lcell(d, 350, 190 + dy, 190, 84, "12,018", WHITE, DARK, DARK, 34, 3)
        T2(d, 235, 288 + dy, "0", F(26, 700), GREY, "ma"); T2(d, 445, 288 + dy, "1", F(26, 700), GREY, "ma")
    f.el(show(t, ct(0) + 0.3), tup, dy=int((1 - show(t, ct(0) + 0.3)) * 10))
    def lab(d, dy):
        T2(d, 235, 328 + dy, "untere Grenze", F(24, 700), GREEN, "ma"); T2(d, 445, 328 + dy, "obere Grenze", F(24, 700), GREEN, "ma")
        tag(d, 140, 370 + dy, 400, 42, "auch fest: ein Punkt aus x und y", WHITE, DARK, 22, 600, outl=LINE)
    f.el(show(t, ct(1) + 0.5), lab)
    cl = ["toleranz = (12.000, 12.018)", "toleranz[1] = 12.020"]
    codebox(f, show(t, ct(0) + 1.6), 90, 440, 500, cl, [ct(0) + 1.8, ct(0) + 3.0], t, 20, lineno=False, title="Python")
    def te(d, dy):
        d.line((405, 190 + dy, 485, 274 + dy), fill=RED, width=5); d.line((485, 190 + dy, 405, 274 + dy), fill=RED, width=5)
        tag(d, 90, 610 + dy, 500, 44, "TypeError: Tupel lassen sich nicht ändern", RED, WHITE, 22)
    f.el(show(t, ct(0) + 3.8), te)
    # rechts: Dictionary
    TX, TY, RH = 680, 150, 52; wd = [150, 140, 170]
    def head(d, dy):
        T2(d, TX, 140 + dy - 0, "", F(10, 400), DARK)
    f.el(show(t, ct(2) + 0.2), lambda d, dy: T2(d, TX, 108 + dy, "Dictionary: Schlüssel → Wert", F(30, 700), DARK, "la") if False else None)
    def tab(d, dy):
        T2(d, TX, 122 + dy, "Dictionary: Stückliste", F(30, 700), DARK, "la")
        hdr = ["Schlüssel", "Menge", "Gewicht in kg"]; xx = TX
        for w, h in zip(wd, hdr):
            d.rectangle((xx, TY + 20 + dy, xx + w, TY + 20 + RH + dy), fill=DARK); fit(h, F(22, 700), w - 8, "Kopf"); T2(d, xx + w / 2, TY + 20 + RH / 2 + dy, h, F(22, 700), WHITE, "mm"); xx += w
        hl = 1 if (ct(3) + 2.2 <= t < ct(4) + 1.0) else -1
        for r, row in enumerate(STL):
            xx = TX; yy = TY + 20 + RH * (r + 1) + dy
            for c, (w, v) in enumerate(zip(wd, row)):
                fill = (255, 232, 235) if r == hl else WHITE
                d.rectangle((xx, yy, xx + w, yy + RH), fill=fill, outline=LINE)
                T2(d, xx + w / 2, yy + RH / 2, v, F(26, 700 if c == 0 else 600), RED if (c == 0) else DARK, "mm"); xx += w
    f.el(show(t, ct(2) + 0.6), tab, dy=int((1 - show(t, ct(2) + 0.6)) * 10))
    def pos(d, dy):
        tag(d, TX, 390 + dy, 460, 40, "nicht die Position zählt, sondern der Schlüssel", WHITE, GREY, 21, 600, outl=LINE)
    f.el(show(t, ct(2) + 3.0, ct(3) + 0.1), pos)
    def schl(d, dy):
        d.line((TX, TY + 20 + 4 * RH + 14 + dy, TX + wd[0], TY + 20 + 4 * RH + 14 + dy), fill=RED, width=4)
        T2(d, TX + wd[0] / 2, TY + 20 + 4 * RH + 20 + dy, "Schlüssel", F(22, 700), RED, "ma")
        d.line((TX + wd[0] + 4, TY + 20 + 4 * RH + 14 + dy, TX + sum(wd), TY + 20 + 4 * RH + 14 + dy), fill=GREEN, width=4)
        T2(d, TX + wd[0] + (wd[1] + wd[2]) / 2, TY + 20 + 4 * RH + 20 + dy, "Wert", F(22, 700), GREEN, "ma")
    f.el(show(t, ct(3) + 0.3), schl)
    cl = ['stueckliste["L-6205"]      # (2, 0.13)', 'stueckliste["X-1"]         # KeyError', '"X-1" in stueckliste       # False']
    codebox(f, show(t, ct(3) + 1.8), 680, 470, 560, cl, [ct(3) + 2.0, ct(4) + 0.8, ct(4) + 3.8], t, 18, lineno=False, title="Python")
    def ke(d, dy):
        tag(d, 680, 640 + dy, 560, 40, "KeyError: den Schlüssel gibt es nicht", RED, WHITE, 22)
    f.el(show(t, ct(4) + 1.8), ke)

# ---------------------------------------------------------------- 6 Faustregel
def sc6(f, t, ct):
    heading(f, t, "Faustregel: welche Struktur wofür?")
    cards = [("Liste", "[ ]", "wächst, nach Position geordnet", "Messreihe", 'messungen = [12.004, 12.011]', ct(1) + 0.3),
             ("Tupel", "( )", "fest, zusammengehörig", "Toleranz, Punkt", "toleranz = (12.000, 12.018)", ct(2) + 0.2),
             ("Dictionary", "{ }", "Zugriff über einen Namen", "Stückliste", 'stueckliste = {"L-6205": 2}', ct(3) + 0.3)]
    for k, (ti, br, key, ex, code, tin) in enumerate(cards):
        x = 60 + k * 395
        def cd(d, dy, x=x, ti=ti, br=br, key=key, ex=ex):
            card(d, x, 130 + dy, 370, 290)
            T2(d, x + 30, 144 + dy, ti, F(36, 700), DARK, "la"); T2(d, x + 340, 140 + dy, br, F(54, 700), RED, "ra")
            fit(key, F(24, 400), 320, "Stichwort"); T2(d, x + 30, 204 + dy, key, F(24, 400), GREY, "la")
            T2(d, x + 30, 242 + dy, "Beispiel: " + ex, F(26, 700), DARK, "la")
        f.el(show(t, tin), cd, dy=int((1 - show(t, tin)) * 12))
        fit(code, M(18), 370 - 30 - 24 - 8, "Code")
        codebox(f, show(t, tin + 0.5), x + 20, 308, 330, [code], [tin + 0.6], t, 18, lineno=False)
    rows = [("Index um eins daneben", "messungen[len(messungen)]", ct(4) + 3.6), ("Kopie, die keine ist", "b = a", ct(4) + 5.4), ("Schlüssel, den es nicht gibt", 'stueckliste["X-1"]', ct(4) + 7.4)]
    f.el(show(t, ct(4) + 0.2), lambda d, dy: T2(d, 70, 440 + dy, "Beim Prüfen von KI-Code achten auf:", F(30, 700), RED, "la"))
    for k, (lbl, code, tin) in enumerate(rows):
        y = 484 + k * 66
        def rw(d, dy, y=y, lbl=lbl):
            fit(lbl, F(26, 700), 440, "Zeile"); d.ellipse((72, y + 12 + dy, 96, y + 36 + dy), fill=RED)
            T2(d, 112, y + 24 + dy, lbl, F(26, 700), DARK, "lm")
        f.el(show(t, tin), rw, dy=int((1 - show(t, tin)) * 10))
        codebox(f, show(t, tin + 0.2), 620, y, 560, [code], [tin + 0.3], t, 20, lineno=False)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V08 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Datenstrukturen", F(104, 700), DARK)
        T2(d, 90, 300, "Liste, Tupel, Dictionary", F(52, 400), GREY)
        for i, v in enumerate(VALS5):
            x = 110 + i * 150
            lcell(d, x, 470, 138, 90, de(v, 3), WHITE, DARK, DARK, 30, 3)
            T2(d, x + 69, 574, str(i), F(28, 700), DARK, "ma"); T2(d, x + 69, 436, f"−{5 - i}", F(26, 600), GREY, "ms")
        T2(d, 110, 380, "messungen", F(40, 700), RED, "la")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
