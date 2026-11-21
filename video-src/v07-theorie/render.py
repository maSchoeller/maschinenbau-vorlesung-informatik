"""V07 Theorie: Zerlegung & Funktionen. Aufruf: python render.py [text|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v07-common"))
from h7 import *
from texte import SRC

NAME = "v07-theorie"; LABEL = "DHBW · Informatik · V07 · Zerlegung & Funktionen"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Zahlen vorab pruefen
def de(x, n): return f"{x:.{n}f}".replace(".", ",")
def T_of(P, n): return P * 1000 / (2 * math.pi * n / 60)
def W_of(d): return math.pi * d ** 3 / 16
def tau_of(P, n, d): return T_of(P, n) * 1000 / W_of(d)
WELLEN = [(15.0, 1450, 30), (7.5, 960, 35), (22.0, 1450, 40)]
TAU = [tau_of(*w) for w in WELLEN]
BUG = T_of(22.0, 1450) * 1000 / (math.pi * 40 ** 2 / 16)
assert [round(x, 1) for x in TAU] == [18.6, 8.9, 11.5] and round(BUG) == 461
assert round(T_of(22.0, 1450), 1) == 144.9 and round(W_of(40)) == 12566 and round(T_of(15.0, 1450), 1) == 98.8
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235); BLOCK = [BLUE, GREEN, AMBER]

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def box(d, x, y, w, h, txt, fill=WHITE, outl=DARK, tc=DARK, size=24, wt=700, ow=3, mono=False, r=10):
    d.rounded_rectangle((x, y, x + w, y + h), r, fill=fill, outline=outl, width=ow)
    fnt = M(size, True) if mono else F(size, wt)
    fit(txt, fnt, w - 12, "Box"); T2(d, x + w / 2, y + h / 2, txt, fnt, tc, "mm")

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def dashed(d, x0, y0, x1, y1, col, w=3, seg=10):
    L = math.hypot(x1 - x0, y1 - y0); n = int(L // (2 * seg)) + 1
    for k in range(n):
        a = k * 2 * seg / L; b = min((k * 2 + 1) * seg / L, 1)
        d.line((x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b), fill=col, width=w)

def codeline(d, x, y, s, size, nchars=10**9, bg=BOX):
    draw_segs(d, x, y, highlight(s), M(size), nchars, 1.0, bg)

# ---------------------------------------------------------------- 1 Hook: Skript mit Tippfehler
BLK = [("# Welle 1: 15 kW, 1450 1/min, d = 30 mm", "omega1 = 2 * math.pi * 1450 / 60", "T1 = 15.0 * 1000 / omega1", "W1 = math.pi * d1 ** 3 / 16", "tau1 = T1 * 1000 / W1"),
       ("# Welle 2: 7.5 kW, 960 1/min, d = 35 mm", "omega2 = 2 * math.pi * 960 / 60", "T2 = 7.5 * 1000 / omega2", "W2 = math.pi * d2 ** 3 / 16", "tau2 = T2 * 1000 / W2"),
       ("# Welle 3: 22 kW, 1450 1/min, d = 40 mm", "omega3 = 2 * math.pi * 1450 / 60", "T3 = 22.0 * 1000 / omega3", "W3 = math.pi * d3 ** 2 / 16", "tau3 = T3 * 1000 / W3")]
LINES1 = [l for b in BLK for l in b]
assert "d3 ** 2" in LINES1[13]

def sc1(f, t, ct):
    heading(f, t, "Ein Skript, drei Kopien, ein Tippfehler")
    px, py, pw, size, lh = 60, 120, 700, 18, 26
    top = 54; ph = top + lh * 15 + 16
    # Tippzeiten je Zeile
    times = []; c = ct(0) + 0.3
    for l in LINES1: times.append(c); c += len(l) / 90 + 0.05
    def panel(d, dy):
        d.rounded_rectangle((px, py + dy, px + pw, py + ph + dy), 14, fill=BOX)
        T(d, px + 22, py + 14 + dy, "wellen.py  (44 Zeilen, hier die drei Blöcke)", F(20, 600), CODE_C)
        for i, ln in enumerate(LINES1):
            blk = i // 5; yy = py + top + i * lh + dy
            if t < times[i]: continue
            d.rectangle((px + 10, yy - 2, px + pw - 10, yy + lh - 4), fill=mix(BOX, BLOCK[blk], 0.20))
            d.rectangle((px + 10, yy - 2, px + 16, yy + lh - 4), fill=BLOCK[blk])
            codeline(d, px + 30, yy, ln, size, int((t - times[i]) * 90))
    f.el(ap(t, 0.2, 0.4), panel)
    # roter Fehler
    xs = px + 30 + M(size).getlength("W3 = math.pi * "); xe = xs + M(size).getlength("d3 ** 2"); yy = py + top + 13 * lh
    a = ap(t, ct(1) + 0.8, 0.4)
    def bug(d, dy):
        d.rounded_rectangle((xs - 4, yy - 3, xe + 4, yy + lh - 3), 5, outline=RED, width=3)
        d.line((xe + 8, yy + lh / 2 - 2, 800, 330), fill=RED, width=3)
        tag(d, 800, 306, 410, 48, "Tippfehler: d ** 2 statt d ** 3", RED, WHITE, 25)
    f.el(a, bug)
    f.el(show(t, ct(1) + 0.2), lambda d, dy: tag(d, 800, 150 + dy, 410, 48, "Formel 3 Mal kopiert", WHITE, DARK, 25, 700, outl=LINE))
    # Konsole
    ent = [(ct(2) + 0.2, [("Welle 1: 18.6 MPa -> ok", CODE_T)]), (ct(2) + 1.2, [("Welle 2: 8.9 MPa -> ok", CODE_T)]),
           (ct(2) + 2.2, [("Welle 3: 461 MPa -> zu hoch", CODE_R)])]
    for _, sg in ent: fit(sg[0][0], M(20), 370, "Konsole")
    a2 = ap(t, ct(2), 0.4)
    f.el(a2, lambda d, dy: console_panel(d, 800, 380 + dy, 420, 150, ent, t, 20, "Ausgabe", 30))
    f.el(show(t, ct(2) + 3.2), lambda d, dy: tag(d, 800, 548 + dy, 420, 44, "Richtig wären 11,5 MPa: Welle 3 hält", LIGHTG, GREEN, 22, 700, outl=GREEN))
    # keine Fehlermeldung
    def noerr(d, dy):
        d.ellipse((800, 620 + dy, 836, 656 + dy), fill=GREEN)
        d.line((808, 638 + dy, 816, 646 + dy), fill=WHITE, width=5); d.line((816, 646 + dy, 829, 629 + dy), fill=WHITE, width=5)
        T2(d, 850, 638 + dy, "läuft ohne Fehlermeldung", F(26, 700), DARK, "lm")
    f.el(show(t, ct(3) + 0.5), noerr, dy=int((1 - show(t, ct(3) + 0.5)) * 10))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: tag(d, 60, 640 + dy, 700, 52, "Lösung: in Bausteine zerlegen", RED, WHITE, 30))

# ---------------------------------------------------------------- 2 Baum
LEAVES = [("torsionsmoment(P, n)", ["Moment aus Leistung", "und Drehzahl"]),
          ("widerstandsmoment(d)", ["Widerstandsmoment", "aus dem Durchmesser"]),
          ("tau(T, d)", ["Spannung aus Moment", "und Durchmesser"]),
          ("pruefe(tau_vorh)", ["Ergebnis: ok oder", "zu hoch"])]
LCX = [190, 480, 770, 1060]; LW = 260
L1 = [("1  Moment bestimmen", 190, [0]), ("2  Spannung berechnen", 625, [1, 2]), ("3  Ergebnis bewerten", 1060, [3])]

def sc2(f, t, ct):
    heading(f, t, "Top-down-Zerlegung")
    RY, RH_ = 130, 70; Y1, H1 = 290, 66; Y2, H2 = 450, 128
    def rootbox(d, dy): box(d, 340, RY + dy, 600, RH_, "Hält die Welle das Moment aus?", RED, RED, WHITE, 30, 700, 3, False, 14)
    f.el(show(t, ct(1) + 0.1), rootbox, dy=int((1 - show(t, ct(1) + 0.1)) * 12))
    f.el(show(t, ct(0) + 0.8, ct(1) + 0.1), lambda d, dy: tag(d, 340, RY + 12 + dy, 600, 46, "oben: das ganze Problem", WHITE, GREY, 26, 600, outl=LINE))
    for k, (txt, cx, kids) in enumerate(L1):
        tin = ct(2) + 0.3 + 0.9 * k; a = show(t, tin)
        def l1(d, dy, txt=txt, cx=cx):
            box(d, cx - 145, Y1 + dy, 290, H1, txt, WHITE, DARK, DARK, 24, 700, 3)
        f.el(a, l1, dy=int((1 - a) * 12))
        f.el(ap(t, tin - 0.1, 0.5), lambda d, dy, cx=cx: d.line((640, RY + RH_, 640, RY + RH_ + 24, ), fill=DARK, width=3) or d.line((cx, RY + RH_ + 24, cx, Y1), fill=DARK, width=3)
             or d.line((min(cx, 640), RY + RH_ + 24, max(cx, 640), RY + RH_ + 24), fill=DARK, width=3))
    for k, (name, desc) in enumerate(LEAVES):
        tin = ct(3) + 0.3 + 0.7 * k; a = show(t, tin); cx = LCX[k]
        par = [i for i, (_, _, kids) in enumerate(L1) if k in kids][0]; pcx = L1[par][1]
        def leaf(d, dy, name=name, desc=desc, cx=cx):
            hot = ap(t, ct(4) + 0.3, 0.5)
            d.rounded_rectangle((cx - LW // 2, Y2 + dy, cx + LW // 2, Y2 + H2 + dy), 12, fill=mix(WHITE, LIGHTR, hot), outline=mix(LINE, RED, hot), width=3)
            fit(name, M(19, True), LW - 16, "Leaf"); T2(d, cx, Y2 + 30 + dy, name, M(19, True), RED, "mm")
            for j, ln in enumerate(desc): fit(ln, F(21, 500), LW - 16, "Leaf2"); T2(d, cx, Y2 + 70 + 26 * j + dy, ln, F(21, 500), DARK, "mm")
        f.el(a, leaf, dy=int((1 - a) * 12))
        f.el(ap(t, tin - 0.1, 0.5), lambda d, dy, cx=cx, pcx=pcx: (d.line((pcx, Y1 + H1, pcx, Y1 + H1 + 30), fill=DARK, width=3), d.line((min(cx, pcx), Y1 + H1 + 30, max(cx, pcx), Y1 + H1 + 30), fill=DARK, width=3), d.line((cx, Y1 + H1 + 30, cx, Y2), fill=DARK, width=3)))
    f.el(show(t, ct(3) + 3.4, ct(4) + 0.2), lambda d, dy: tag(d, 340, 618 + dy, 600, 48, "Ein Satz genügt, um jeden Baustein zu beschreiben", WHITE, DARK, 24, 600, outl=LINE))
    f.el(show(t, ct(4) + 0.5), lambda d, dy: tag(d, 340, 618 + dy, 600, 52, "Baustein = Funktion  (def)", RED, WHITE, 30))

# ---------------------------------------------------------------- 3 DRY / SRP / KISS
def sc3(f, t, ct):
    heading(f, t, "Drei Regeln zum Zerlegen")
    tiles = [("DRY", "Jede Formel nur einmal.", "eine Stelle für Fehler", ct(1)),
             ("SRP", "Eine Funktion, eine Aufgabe.", "zum Beispiel nur das Moment", ct(2)),
             ("KISS", "Jeder Baustein auf einen Blick.", "klein halten und prüfen", ct(3))]
    for k, (big, l1, l2, tin) in enumerate(tiles):
        x = 60 + k * 395; a = show(t, tin - 0.2)
        act = ap(t, tin, 0.3) * (1 - ap(t, tiles[k + 1][3] if k < 2 else ct(4), 0.3))
        def tl(d, dy, x=x, big=big, l1=l1, l2=l2, act=act):
            d.rounded_rectangle((x, 120 + dy, x + 370, 250 + dy), 14, fill=mix(WHITE, LIGHTR, act), outline=mix(LINE, RED, act), width=3)
            T2(d, x + 24, 128 + dy, big, F(40, 700), RED, "la")
            fit(l1, F(23, 700), 340, "Kachel"); T2(d, x + 24, 182 + dy, l1, F(23, 700), DARK, "la")
            fit(l2, F(21, 400), 330, "Kachel2"); T2(d, x + 24, 214 + dy, l2, F(21, 400), GREY, "la")
        f.el(a, tl, dy=int((1 - a) * 12))
    # links: Original mit Kopien
    def left(d, dy):
        card(d, 60, 290 + dy, 560, 380)
        T2(d, 92, 304 + dy, "Vorher: 44 Zeilen", F(28, 700), DARK, "la")
    f.el(show(t, ct(0) + 0.6), left, dy=int((1 - show(t, ct(0) + 0.6)) * 12))
    for k in range(3):
        tin = ct(0) + 1.4 + 0.5 * k
        gone = ap(t, ct(1) + 1.8, 0.5) if k > 0 else 0
        def blk(d, dy, k=k, gone=gone):
            y = 358 + k * 100
            fill = mix(mix(WHITE, BLOCK[k], 0.18), WHITE, gone); ol = mix(BLOCK[k], LINE, gone)
            d.rounded_rectangle((100, y + dy, 580, y + 84 + dy), 10, fill=fill, outline=ol, width=3)
            tc = mix(DARK, WHITE, gone * 0.85); T2(d, 120, y + 12 + dy, f"Welle {k + 1}", F(24, 700), tc, "la")
            T2(d, 120, y + 46 + dy, "omega, T, W, tau", M(22), mix(GREY, WHITE, gone * 0.85), "la")
            if k == 0 and t >= ct(1) + 1.8: tag(d, 400, y + 24 + dy, 160, 38, "nur 1 Mal", GREEN, WHITE, 22)
            if k == 2 and gone < 0.5 and t >= ct(1) + 0.6:
                T2(d, 560, y + 42 + dy, "Tippfehler", F(22, 700), RED, "rm")
        f.el(show(t, tin), blk, dy=int((1 - show(t, tin)) * 10))
    # rechts: vier Funktionen
    def right(d, dy):
        card(d, 660, 290 + dy, 560, 380)
        T2(d, 692, 304 + dy, "Nachher: vier Funktionen", F(28, 700), DARK, "la")
    f.el(show(t, ct(2) + 0.3), right, dy=int((1 - show(t, ct(2) + 0.3)) * 12))
    fn = [("torsionsmoment", "nur das Moment", "2 Zeilen"), ("widerstandsmoment", "nur W", "1 Zeile"), ("tau", "nur die Spannung", "1 Zeile"), ("pruefe", "nur ok / zu hoch", "4 Zeilen")]
    for k, (nm, job, zl) in enumerate(fn):
        tin = ct(2) + 1.0 + 0.7 * k; a = show(t, tin)
        def fcard(d, dy, k=k, nm=nm, job=job, zl=zl):
            x = 692 + (k % 2) * 264; y = 352 + (k // 2) * 108
            d.rounded_rectangle((x, y + dy, x + 252, y + 96 + dy), 10, fill=WHITE, outline=DARK, width=3)
            fit(nm, M(19, True), 236, "fn"); T2(d, x + 14, y + 12 + dy, nm, M(19, True), RED, "la")
            T2(d, x + 14, y + 40 + dy, job, F(21, 500), DARK, "la")
            if t >= ct(3) + 0.8: T2(d, x + 14, y + 68 + dy, zl, F(19, 700), GREEN, "la")
        f.el(a, fcard, dy=int((1 - a) * 10))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: tag(d, 692, 584 + dy, 496, 56, "44 Zeilen  ->  4 kurze Funktionen", RED, WHITE, 26))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: arrow(d, 622, 480 + dy, 656, 480 + dy, RED, 4))

# ---------------------------------------------------------------- 4 Blackbox + PAP
def pap_oval(d, cx, y, w, h, txt, fill=WHITE):
    d.rounded_rectangle((cx - w // 2, y, cx + w // 2, y + h), h // 2, fill=fill, outline=DARK, width=3)
    fit(txt, F(21, 700), w - 20, "Oval"); T2(d, cx, y + h / 2, txt, F(21, 700), DARK, "mm")

def pap_proc(d, cx, y, w, h, txt, mono=False, fill=WHITE, col=DARK, size=21):
    d.rectangle((cx - w // 2, y, cx + w // 2, y + h), fill=fill, outline=DARK, width=3)
    fnt = M(size - 3, True) if mono else F(size, 700); fit(txt, fnt, w - 16, "Proc"); T2(d, cx, y + h / 2, txt, fnt, col, "mm")

def pap_sub(d, cx, y, w, h, txt, fill=WHITE, col=DARK):
    d.rectangle((cx - w // 2, y, cx + w // 2, y + h), fill=fill, outline=DARK, width=3)
    d.line((cx - w // 2 + 14, y, cx - w // 2 + 14, y + h), fill=DARK, width=3); d.line((cx + w // 2 - 14, y, cx + w // 2 - 14, y + h), fill=DARK, width=3)
    fit(txt, M(18, True), w - 48, "Sub"); T2(d, cx, y + h / 2, txt, M(18, True), col, "mm")

def pap_io(d, cx, y, w, h, txt):
    sk = 16
    d.polygon([(cx - w // 2 + sk, y), (cx + w // 2, y), (cx + w // 2 - sk, y + h), (cx - w // 2, y + h)], fill=WHITE, outline=DARK, width=3)
    fit(txt, F(21, 700), w - 50, "IO"); T2(d, cx, y + h / 2, txt, F(21, 700), DARK, "mm")

def sc4(f, t, ct):
    heading(f, t, "Funktion = Blackbox, im PAP ein Unterprogramm")
    bx, by, bw, bh = 220, 250, 240, 170
    f.el(ap(t, 0.4, 0.5), lambda d, dy: (d.rounded_rectangle((bx, by + dy, bx + bw, by + bh + dy), 14, fill=(52, 58, 70)),
                                         T2(d, bx + bw / 2, by + 56 + dy, "tau(T, d)", M(30, True), WHITE, "mm")))
    inner = ap(t, ct(2) + 0.2, 0.5)
    f.el(inner, lambda d, dy: (T2(d, bx + bw / 2, by + 116 + dy, "innen: egal", F(24, 600), (190, 196, 206), "mm")))
    for k, (lbl, val, x) in enumerate((("T", "144,9", 290), ("d", "40", 390))):
        tin = ct(0) + 1.0 + 1.2 * k; a = show(t, tin)
        def par(d, dy, lbl=lbl, val=val, x=x, a=a):
            yo = 130 + int((1 - a) * -20)
            T2(d, x, 140 + dy, f"{lbl} = {val}", F(26, 700), DARK, "mm"); arrow(d, x, 166 + dy, x, by - 2 + dy, RED, 4, 13)
        f.el(a, par)
    f.el(show(t, ct(0) + 0.6), lambda d, dy: tag(d, 60, 186 + dy, 150, 44, "Parameter", WHITE, RED, 24, 700, outl=RED))
    a1 = show(t, ct(1) + 0.4)
    def ret(d, dy):
        arrow(d, 340, by + bh + 2 + dy, 340, by + bh + 90 + dy, GREEN, 5, 14)
        T2(d, 340, by + bh + 112 + dy, "11,5 MPa", F(30, 700), GREEN, "mm")
    f.el(a1, ret)
    f.el(show(t, ct(1) + 0.1), lambda d, dy: tag(d, 60, by + bh + 52 + dy, 170, 44, "Rückgabewert", WHITE, GREEN, 22, 700, outl=GREEN))
    f.el(show(t, ct(2) + 1.0), lambda d, dy: T2(d, 340, 620 + dy, "Aufrufer kennt nur: was hinein, was heraus", F(22, 600), GREY, "mm"))
    # rechts: PAP
    cm, cs = 790, 1095
    f.el(show(t, ct(3) + 0.1), lambda d, dy: T2(d, cm, 128 + dy, "Hauptprogramm", F(24, 700), RED, "mm"))
    shapes = [(pap_oval, 160, 40, "Start"), (pap_proc, 240, 50, "T bestimmen"), (pap_sub, 325, 60, "tau(T, d)"), (pap_io, 425, 50, "Ausgabe tau"), (pap_oval, 515, 40, "Ende")]
    for k, (fn_, y, h, txt) in enumerate(shapes):
        tin = ct(3) + 0.5 + 0.55 * k
        def shp(d, dy, fn_=fn_, y=y, h=h, txt=txt, k=k):
            hot = ap(t, ct(3) + 3.2, 0.4) if k == 2 else 0
            if fn_ is pap_sub: pap_sub(d, cm, y + dy, 210, h, txt, mix(WHITE, LIGHTR, hot), RED if hot > 0.5 else DARK)
            elif fn_ is pap_oval: pap_oval(d, cm, y + dy, 150, h, txt)
            elif fn_ is pap_io: pap_io(d, cm, y + dy, 210, h, txt)
            else: pap_proc(d, cm, y + dy, 210, h, txt)
            if k < 4: arrow(d, cm, y + h + dy, cm, shapes[k + 1][1] + dy, DARK, 3, 10)
        f.el(show(t, tin), shp)
    f.el(show(t, ct(3) + 3.4), lambda d, dy: tag(d, 940, 232 + dy, 280, 40, "Doppelte Seitenlinien", WHITE, RED, 20, 700, outl=RED) if False else None)
    f.el(show(t, ct(4) + 0.1), lambda d, dy: T2(d, cs, 128 + dy, "Unterprogramm tau", F(24, 700), RED, "mm"))
    sub = [(pap_oval, 335, 40, "tau(T, d)"), (pap_proc, 415, 50, "return T * 1000 / W"), (pap_oval, 505, 40, "Ende")]
    for k, (fn_, y, h, txt) in enumerate(sub):
        tin = ct(4) + 0.6 + 0.6 * k
        def shp2(d, dy, fn_=fn_, y=y, h=h, txt=txt, k=k):
            if fn_ is pap_oval: pap_oval(d, cs, y + dy, 170, h, txt)
            else: pap_proc(d, cs, y + dy, 230, h, txt, True, WHITE, DARK, 20)
            if k < 2: arrow(d, cs, y + h + dy, cs, sub[k + 1][1] + dy, DARK, 3, 10)
        f.el(show(t, tin), shp2)
    f.el(show(t, ct(4) + 0.3), lambda d, dy: (dashed(d, 895, 355 + dy, 1005, 355 + dy, RED, 3), arrow(d, 985, 355 + dy, 1008, 355 + dy, RED, 3, 11)))

# ---------------------------------------------------------------- 5 Aufrufstapel
CODE5 = ["def widerstandsmoment(d):", "    return math.pi * d ** 3 / 16", "def tau(T, d):", "    return T * 1000 / widerstandsmoment(d)", "print(tau(144.9, 40))"]
SX, SW, SH = 700, 500, 108
def frame_y(k): return 536 - k * (SH + 12)   # k = 0 unten

def sc5(f, t, ct):
    heading(f, t, "Der Aufrufstapel")
    ta, tb, tc_ = ct(4) + 1.1, ct(4) + 3.9, ct(4) + 5.6
    sched = [(0, {4}), (ct(1), {4}), (ct(2), {2, 3}), (ct(3) + 0.2, {3}), (ct(3) + 2.4, {0, 1}), (ta, {1}), (ta + 1.4, {3}), (tb, {3}), (tb + 1.4, {4})]
    hl = hl_at(t, sched)
    code_box(f, t, CODE5, 60, 130, 600, 20, 34, hl, [0.5, 0.9, 1.3, 1.7, 2.2], True, 60, 0.2)
    f.el(show(t, 0.5), lambda d, dy: (T2(d, SX, 128 + dy, "Aufrufstapel", F(26, 700), DARK, "la"), T2(d, SX + SW, 134 + dy, "wächst nach oben", F(20, 600), GREY, "ra")))
    def fr(d, dy, k, title, lines, a_hot=0.0, out=None):
        y = frame_y(k) + dy
        d.rounded_rectangle((SX, y, SX + SW, y + SH), 12, fill=mix(WHITE, LIGHTR, a_hot), outline=mix(DARK, RED, a_hot), width=3)
        d.rectangle((SX, y, SX + 8, y + SH), fill=RED) if k > 0 else None
        T2(d, SX + 26, y + 12, title, F(26, 700), DARK, "la")
        for j, ln in enumerate(lines): fit(ln, M(22), SW - 40, "Frame"); T2(d, SX + 26, y + 50 + 28 * j, ln, M(22), DARK, "la")
        if out: tag(d, SX + SW - 190, y + 10, 180, 40, out, GREEN, WHITE, 22)
    # Hauptprogramm
    state_main = t >= tb + 1.4
    f.el(show(t, 0.9), lambda d, dy: fr(d, dy, 0, "Hauptprogramm", ["print(...)  wartet" if not state_main else "Ausgabe: 11.5"], 0.0, None))
    # tau-Frame
    life1 = show(t, ct(1) + 0.2, tb + 0.6)
    ink = ap(t, ct(2) + 0.3, 0.5) * (1 - ap(t, ct(3), 0.3))
    f.el(life1, lambda d, dy: fr(d, dy, 1, "tau", ["T = 144.9", "d = 40"], ink, "-> 11.5" if tb <= t < tb + 1.4 else None), dy=int((1 - life1) * -20) if t < tb else int(ap(t, tb, 0.6) * -20))
    f.el(show(t, ct(2) + 0.5, ct(3) + 0.2), lambda d, dy: tag(d, SX, 180 + dy, SW, 44, "lokal: von außen unsichtbar", LIGHTR, RED, 22, 700, outl=RED))
    # widerstandsmoment-Frame
    life2 = show(t, ct(3) + 2.4, ta + 0.6)
    f.el(life2, lambda d, dy: fr(d, dy, 2, "widerstandsmoment", ["d = 40"], 0.0, "-> 12566.4" if ta <= t < ta + 1.4 else None), dy=int((1 - life2) * -20) if t < ta else int(ap(t, ta, 0.6) * -20))
    f.el(show(t, ct(3) + 3.0, ta), lambda d, dy: tag(d, SX + 120, 120 + 28 + dy, 300, 40, "zweiter Frame obendrauf", RED, WHITE, 22) if False else None)
    # return-Etiketten
    f.el(show(t, ta - 0.2, ta + 1.4), lambda d, dy: tag(d, 940, 130 + dy, 280, 46, "return: Frame weg", RED, WHITE, 24) if False else None)
    f.el(show(t, ct(4) + 0.2), lambda d, dy: tag(d, 60, 530 + dy, 600, 48, "return: oberster Frame verschwindet, Wert geht zurück", WHITE, DARK, 22, 600, outl=LINE))

# ---------------------------------------------------------------- 6 Typische Fehler
ERR = [("print statt return", "print(T * 1000 / W)", "Rückgabe: None", RED),
       ("Zweig ohne return", 'if t <= 40: return "ok"', "sonst: None", AMBER),
       ("falsche Einheit", "return P / omega  # P in kW", "Ergebnis um Faktor 1000 daneben", AMBER)]

def sc6(f, t, ct):
    heading(f, t, "Typische Fehler in KI-Code")
    tins = [ct(0) + 2.2, ct(1) + 0.3, ct(1) + 4.2]
    for k, (ti, code, wrong, col) in enumerate(ERR):
        y = 130 + k * 118; a = show(t, tins[k])
        def row(d, dy, k=k, ti=ti, code=code, wrong=wrong, col=col, y=y):
            card(d, 60, y + dy, 1160, 100)
            d.ellipse((92, y + 34 + dy, 124, y + 66 + dy), fill=col)
            T2(d, 150, y + 14 + dy, ti, F(28, 700), DARK, "la")
            T2(d, 150, y + 56 + dy, wrong, F(24, 400), GREY, "la")
            d.rounded_rectangle((600, y + 16 + dy, 1190, y + 84 + dy), 10, fill=BOX)
            fit(code, M(24), 560, "Fehlercode"); codeline(d, 620, y + 36 + dy, code, 24)
        f.el(a, row, dy=int((1 - a) * 12))
    # Pruefen von Hand
    def chk(d, dy):
        card(d, 60, 500 + dy, 1160, 96)
        T2(d, 92, 514 + dy, "Jede Funktion einzeln prüfen", F(28, 700), DARK, "la")
        T2(d, 92, 554 + dy, "Handrechnung: 15 000 W / 151,8 1/s = 98,8 N·m", F(24, 400), GREY, "la")
        d.rounded_rectangle((690, 514 + dy, 1190, 582 + dy), 10, fill=BOX)
        codeline(d, 710, 534 + dy, "torsionsmoment(15.0, 1450)", 22)
    f.el(show(t, ct(2) + 0.3), chk, dy=int((1 - show(t, ct(2) + 0.3)) * 12))
    def res(d, dy):
        d.ellipse((1036, 524 + dy, 1066, 554 + dy), fill=GREEN)
        d.line((1043, 540 + dy, 1049, 546 + dy), fill=WHITE, width=4); d.line((1049, 546 + dy, 1060, 532 + dy), fill=WHITE, width=4)
        T2(d, 1100, 539 + dy, "98.8", M(24, True), CODE_G, "lm") if False else None
    f.el(show(t, ct(2) + 2.5), res)
    f.el(show(t, ct(2) + 2.5), lambda d, dy: T2(d, 1078, 539 + dy, "98.8", M(24, True), CODE_G, "lm"))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 60, 626 + dy, 560, 54, "Lesen und prüfen: hier in der Vorlesung", WHITE, DARK, 26, 700, outl=LINE))
    f.el(show(t, ct(3) + 2.4), lambda d, dy: tag(d, 660, 626 + dy, 560, 54, "Schreiben: im Labor", RED, WHITE, 26))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V07 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Zerlegung & Funktionen", F(88, 700), DARK)
        T2(d, 90, 290, "Aus 44 Zeilen werden Bausteine", F(48, 400), GREY)
        d.rounded_rectangle((300, 430, 580, 580), 14, fill=(52, 58, 70))
        T2(d, 440, 505, "tau(T, d)", M(34, True), WHITE, "mm")
        arrow(d, 370, 340, 370, 428, RED, 5, 14); arrow(d, 510, 340, 510, 428, RED, 5, 14); arrow(d, 440, 582, 440, 650, GREEN, 5, 14)
        T2(d, 370, 322, "T", F(30, 700), DARK, "mm"); T2(d, 510, 322, "d", F(30, 700), DARK, "mm"); T2(d, 440, 672, "11,5 MPa", F(30, 700), GREEN, "mm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
