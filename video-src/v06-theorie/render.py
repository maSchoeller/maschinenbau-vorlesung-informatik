"""V06 Theorie: Immer wieder: Schleifen und Iteration. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v06-common"))
from h6 import *
from texte import SRC

NAME = "v06-theorie"; LABEL = "DHBW · Informatik · V06 · Schleifen und Iteration"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Pruefung der Zahlen (alles vorher mit Python rechnen)
K, UMG, ZIEL = 0.08, 20.0, 60.0
TEMPS = [850.0]
while len(TEMPS) < 61: TEMPS.append(TEMPS[-1] - K * (TEMPS[-1] - UMG))
MIN_ZIEL = next(i for i, v in enumerate(TEMPS) if v <= ZIEL)
assert MIN_ZIEL == 37 and f"{TEMPS[37]:.1f}" == "58.0"
FIVE = [TEMPS[i] for i in range(1, 6)]
assert [f"{v:.1f}" for v in FIVE] == ["783.6", "722.5", "666.3", "614.6", "567.0"]
SUM5 = sum(FIVE); assert f"{SUM5 / 5:.1f}" == "670.8" and f"{SUM5:.2f}" == "3354.07"
def de(x, n): return f"{x:.{n}f}".replace(".", ",")
NEWTON = [2.0]
for _ in range(5): NEWTON.append((NEWTON[-1] + 2 / NEWTON[-1]) / 2)
CHG = [abs(NEWTON[i + 1] - NEWTON[i]) for i in range(5)]
assert NEWTON[1] == 1.5 and f"{NEWTON[2]:.4f}" == "1.4167" and f"{NEWTON[3]:.5f}" == "1.41422"
assert CHG[3] > 1e-6 and CHG[4] < 1e-6 and f"{CHG[4]:.13f}" == "0.0000000000016"   # Abbruch nach dem 5. Schritt
assert [f"{c:.7f}" for c in CHG[:4]] == ["0.5000000", "0.0833333", "0.0024510", "0.0000021"]
assert abs(NEWTON[5] - math.sqrt(2)) < 1e-12

# ---------------------------------------------------------------- 1 Hook: Abkuehlkurve
def sc1(f, t, ct):
    heading(f, t, "Wann ist das Werkstück kühl genug?")
    P = Plot((130, 150, 1200, 585), (0, 40), (0, 900))
    def ax(d, dy): P.axes(d, dy, range(0, 41, 5), range(0, 901, 300), "Zeit in Minuten", "Temperatur in °C")
    f.el(ap(t, 0.2, 0.5), ax)
    f.el(ap(t, ct(1) + 1.0, 0.5), lambda d, dy: P.hline(d, dy, ZIEL, RED, "Ziel 60 °C", lx=700))
    t0 = ct(2) + 1.0; n = int(max(0, t - t0) / 0.11); n = min(n, 37) if t >= t0 else -1
    def pts(d, dy):
        for i in range(0, n):
            d.line((P.px(i), P.py(TEMPS[i]), P.px(i + 1), P.py(TEMPS[i + 1])), fill=(150, 156, 168), width=2)
        for i in range(0, n + 1):
            x, y = P.px(i), P.py(TEMPS[i]); d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=RED)
    if n >= 0: f.el(1, pts)
    f.el(ap(t, ct(0) + 0.8, 0.5), lambda d, dy: T2(d, P.px(0) + 20, P.py(850) - 14, "850 °C", F(26, 700), DARK))
    if n >= 37:
        f.el(ap(t, t0 + 37 * 0.11 + 0.1, 0.5), lambda d, dy: (T2(d, P.px(37), P.py(TEMPS[37]) - 70, "Minute 37: 58 °C", F(24, 700), RED, "mm"),
                                                              d.line((P.px(37), P.py(TEMPS[37]) - 50, P.px(37), P.py(TEMPS[37]) - 14), fill=RED, width=3)))
    def card2(d, dy):
        card(d, 640, 170 + dy, 560, 120)
        T2(d, 672, 182 + dy, "Jede Minute dieselbe Rechnung:", F(26, 700), DARK)
        T2(d, 672, 220 + dy, "neue Temperatur = alte Temperatur", F(26, 400), DARK)
        T2(d, 672, 252 + dy, "− 8 % des Unterschieds zur Halle (20 °C)", F(26, 400), DARK)
    f.el(ap(t, ct(2) + 0.2, 0.5), card2, dy=int((1 - ap(t, ct(2) + 0.2, 0.5)) * 12))
    pill(f, t, ct(4) + 0.2, 130, 648, 640, 46, "Immer wieder anwenden = Iteration = Schleife", size=26)

# ---------------------------------------------------------------- 2 Schleifen im Programmablaufplan
import core as _c0
_orig_sb = _c0.sentence_bounds
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, NL
_c0.sentence_bounds = _orig_sb          # Satzgrenzen wie bisher (V06 unveraendert)

def loop_dia(kind):
    """PAP der drei Schleifenarten (Planraum ca. 360 breit). Rueckfuehrlinie muendet mit Pfeil vor die Raute (bzw. vor den Block)."""
    D = Dia(18); N_ = D.node; cx = 200; xl = 40; xr = 350
    def blocks(keys_txt, y):
        ks = []
        for k, tx in keys_txt:
            n = N_(k, "proc", tx, cx, 0, minw=250); n.cy = y + n.h / 2; y = n.cy + n.h / 2 + 18; ks.append(k)
        for a, b in zip(ks, ks[1:]): D.edge(f"{a}-{b}", a, "b", b, "t")
        return ks, y
    if kind == "head":
        jy = 26; d = N_("d", "dec", "Temperatur > 60 °C ?", cx, 0); d.cy = jy + 20 + d.h / 2
        ks, y = blocks([("b1", "Temperatur neu berechnen"), ("b2", "Minuten um 1 erhöhen")], d.cy + d.h / 2 + 24)
        w = N_("w", "term", "weiter", xr, y + 30)
        D.edge("in", (cx, 0), None, "d", "t"); D.edge("d-b1", "d", "b", "b1", "t", label="ja")
        D.edge("back", "b2", "l", (cx, jy), None, via=[(xl, D.nodes["b2"].cy), (xl, jy)])
        D.edge("d-w", "d", "r", "w", "t", label="nein", via=[(xr, d.cy)])
    elif kind == "foot":
        jy = 26; ks, y = blocks([("b1", "Temperatur neu berechnen"), ("b2", "Minuten um 1 erhöhen")], jy + 22)
        d = N_("d", "dec", "Temperatur ≤ 60 °C ?", cx, 0); d.cy = y + 4 + d.h / 2
        w = N_("w", "term", "weiter", cx, d.cy + d.h / 2 + 52)
        D.edge("in", (cx, 0), None, "b1", "t"); D.edge("b2-d", "b2", "b", "d", "t")
        D.edge("back", "d", "l", (cx, jy), None, via=[(xl, d.cy), (xl, jy)], label="nein", lab=(-8, -5, "rs") if False else None)
        D.edge("d-w", "d", "b", "w", "t", label="ja")
    else:
        p = N_("p", "proc", "minute = 1", cx, 0, minw=250); p.cy = 20 + p.h / 2
        d = N_("d", "dec", "minute ≤ 5 ?", cx, 0); d.cy = p.cy + p.h / 2 + 46 + d.h / 2; jy = p.cy + p.h / 2 + 22
        ks, y = blocks([("b1", "Temperatur neu berechnen"), ("b2", "Wert zur Summe addieren"), ("b3", "minute = minute + 1")], d.cy + d.h / 2 + 24)
        w = N_("w", "term", "weiter", xr, y + 30)
        D.edge("in", (cx, 0), None, "p", "t"); D.edge("p-d", "p", "b", "d", "t"); D.edge("d-b1", "d", "b", "b1", "t", label="ja")
        D.edge("back", "b3", "l", (cx, jy), None, via=[(xl, D.nodes["b3"].cy), (xl, jy)])
        D.edge("d-w", "d", "r", "w", "t", label="nein", via=[(xr, d.cy)])
    return D
LOOPS = {k: loop_dia(k) for k in ("head", "foot", "count")}
CAP = {"head": ("kopfgesteuert", "Bedingung oben: erst prüfen, dann ausführen"), "foot": ("fußgesteuert", "Bedingung unten: mindestens ein Durchlauf"),
       "count": ("Zählschleife", "feste Anzahl von Durchläufen")}

def sc2(f, t, ct):
    heading(f, t, "Wiederholung im Programmablaufplan")
    xs = {"head": 70, "foot": 460, "count": 850}
    for kind, tin, tid in (("head", ct(1) + 0.3, ct(2) + 0.3), ("foot", ct(1) + 0.6, ct(3) + 0.3), ("count", ct(1) + 0.9, ct(4) + 0.3)):
        hl_on = ap(t, tid, 0.4) * (1 - ap(t, tid + 5.5, 0.5)) > 0.5
        D = LOOPS[kind]
        hl = {"d": (226, 0, 26)} if hl_on else {}
        if hl_on and kind != "count": hl["back"] = (226, 0, 26)
        pap_view(f, ap(t, tin, 0.5), D, (xs[kind], 214, 380, 420), (0, -4), hl=hl, zoom=0.92)
        def cap(d, dy, kind=kind):
            T2(d, xs[kind] + 180, 140 + dy, CAP[kind][0], F(30, 700), DARK, "ma")
            sz = 22
            while F(sz, 400).getlength(CAP[kind][1]) > 350 and sz > 16: sz -= 1
            T2(d, xs[kind] + 180, 178 + dy, CAP[kind][1], F(sz, 400), GREY, "ma")
        f.el(ap(t, tid, 0.4), cap)
    def idea(d, dy):
        T2(d, 640, 300 + dy, "Eine Schleife = eine Linie, die zurück vor die Bedingung führt", F(30, 600), DARK, "ma")
    f.el(ap(t, ct(0) + 0.5, 0.5) * (1 - ap(t, ct(1) + 0.2, 0.4)), idea)
    pill(f, t, ct(5) + 0.4, 170, 650, 160, 44, "while", fill=DARK, size=28)
    pill(f, t, ct(5) + 1.0, 950, 650, 160, 44, "for", fill=DARK, size=28)

# ---------------------------------------------------------------- 3 Abbruch, Endlosschleife, Watchdog
def path_pos(pts, dist):
    L = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)); dist %= L
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if dist <= seg:
            r = dist / seg; return (lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r))
        dist -= seg
    return pts[0]

def sc3(f, t, ct):
    heading(f, t, "Abbruchbedingung und Endlosschleife")
    endless = ap(t, ct(3), 0.5)
    ax, ay, bx, by = 110, 160, 110, 330
    loop = [(260, ay + 80), (260, by), (260, by + 100), (520, by + 50), (520, 124), (260, 124)]
    def flow(d, dy):
        d.polygon([(ax + 150, ay + dy), (ax + 300, ay + 40 + dy), (ax + 150, ay + 80 + dy), (ax, ay + 40 + dy)], fill=WHITE, outline=DARK, width=3)
        T2(d, ax + 150, ay + 40 + dy, "Bedingung wahr?", F(21, 700), DARK, "mm")
        bcol = mix((230, 247, 238), (255, 226, 230), endless)
        d.rounded_rectangle((bx, by + dy, bx + 300, by + 100 + dy), 14, fill=bcol, outline=DARK, width=3)
        T2(d, bx + 150, by + 28 + dy, "Block ausführen", F(28, 700), DARK, "mm")
        d.rounded_rectangle((110, 500 + dy, 410, 570 + dy), 14, fill=WHITE, outline=DARK, width=3)
        T2(d, 260, 535 + dy, "Ende", F(28, 700), DARK, "mm")
        arrow(d, 260, ay + 80 + dy, 260, by + dy, DARK, 4); T2(d, 275, ay + 118 + dy, "ja", F(22, 700), GREEN, "lm")
        d.line((410, by + 50 + dy, 520, by + 50 + dy), fill=DARK, width=4); d.line((520, by + 50 + dy, 520, 124 + dy), fill=DARK, width=4)
        d.line((260, 108 + dy, 260, ay + dy - 4), fill=DARK, width=4); arrow(d, 520, 124 + dy, 262, 124 + dy, DARK, 4)
        d.line((110, ay + 40 + dy, 80, ay + 40 + dy), fill=DARK, width=4); d.line((80, ay + 40 + dy, 80, 535 + dy), fill=DARK, width=4)
        arrow(d, 80, 535 + dy, 110, 535 + dy, DARK, 4); T2(d, 72, 360 + dy, "nein", F(22, 700), RED, "rm")
    f.el(ap(t, ct(0) + 0.2, 0.5), flow)
    # Wanderpunkt
    P = [(ax + 150, ay + 80), (ax + 150, by), (ax + 150, by + 50), (520, by + 50), (520, 124), (260, 124), (260, ay + 40), (ax + 150, ay + 80)]
    speed = lerp(150, 330, endless); dist = (t - ct(0)) * speed
    lap = int(max(0, t - ct(0)) * 150 / sum(math.dist(P[i], P[i + 1]) for i in range(len(P) - 1)))
    x, y = path_pos(P, dist)
    if t > ct(0) + 0.4 and not (110 < x < 410 and by < y < by + 100):
        f.el(ap(t, ct(0) + 0.4, 0.3), lambda d, dy: d.ellipse((x - 10, y - 10 + dy, x + 10, y + 10 + dy), fill=mix(RED, (140, 0, 0), endless)))
    # Zusatztexte im Block
    def sub(d, dy):
        txt = "Wert ändert sich" if endless < 0.5 else "nichts ändert sich"
        col = GREEN if endless < 0.5 else RED
        T2(d, bx + 150, by + 68 + dy, txt, F(24, 700), col, "mm")
    f.el(ap(t, ct(1) + 1.0, 0.5), sub)
    temps = ["850,0", "783,6", "722,5", "666,3", "614,6", "567,0"]
    def tcard(d, dy):
        k = min(5, int(max(0, t - (ct(2) + 0.8)) / 0.8))
        d.rounded_rectangle((560, 330 + dy, 640, 430 + dy), 0, fill=BG)
        card(d, 560, 440 + dy, 90, 10, False)
    # Temperaturanzeige unter dem Block
    def tshow(d, dy):
        k = min(5, int(max(0, t - (ct(2) + 0.8)) / 0.8))
        d.rounded_rectangle((330, 600 + dy, 600, 670 + dy), 12, fill=WHITE, outline=LINE, width=2)
        T2(d, 345, 612 + dy, "Temperatur", F(20, 600), GREY, "la"); T2(d, 585, 640 + dy, temps[k] + " °C", F(32, 700), DARK, "rm")
    f.el(ap(t, ct(2) + 0.2, 0.5) * (1 - ap(t, ct(3), 0.4)), tshow)
    def tshow2(d, dy):
        d.rounded_rectangle((330, 600 + dy, 600, 670 + dy), 12, fill=WHITE, outline=RED, width=3)
        T2(d, 345, 612 + dy, "Temperatur", F(20, 600), GREY, "la"); T2(d, 585, 640 + dy, "850,0 °C", F(32, 700), RED, "rm")
    f.el(ap(t, ct(3) + 0.3, 0.4), tshow2)
    f.el(ap(t, ct(3) + 0.6, 0.5), lambda d, dy: (d.rounded_rectangle((120, 590 + dy, 320, 640 + dy), 25, fill=RED), T2(d, 220, 615 + dy, "Endlosschleife", F(26, 700), WHITE, "mm")))
    # Watchdog
    def wd(d, dy):
        card(d, 700, 150 + dy, 536, 430)
        T2(d, 736, 168 + dy, "Watchdog (Zeitüberwachung)", F(28, 700), DARK)
        T2(d, 736, 214 + dy, "Programm meldet sich regelmäßig", F(23, 400), GREY)
    f.el(ap(t, ct(4) + 0.2, 0.5), wd, dy=int((1 - ap(t, ct(4) + 0.2, 0.5)) * 12))
    ticks = [ct(4) + 0.9 + 0.9 * k for k in range(4)]
    last = ticks[-1]; TO = 4.8
    def wbar(d, dy):
        for k, tk in enumerate(ticks):
            if t >= tk:
                x = 760 + k * 100; d.ellipse((x - 16, 280 + dy, x + 16, 312 + dy), fill=GREEN); T2(d, x, 296 + dy, "OK", F(16, 700), WHITE, "mm")
        # Balken: Zeit seit letztem Lebenszeichen
        since = 0.0
        for tk in ticks:
            if t >= tk: since = t - tk
        fill = clamp(since / TO)
        d.rounded_rectangle((736, 380 + dy, 1200, 420 + dy), 10, fill=(236, 238, 242), outline=LINE, width=2)
        if fill > 0.01: d.rounded_rectangle((736, 380 + dy, 736 + int(464 * fill), 420 + dy), 10, fill=mix(GREEN, AMBER, clamp(fill / 0.6)) if fill < 0.6 else mix(AMBER, RED, clamp((fill - 0.6) / 0.4)))
        T2(d, 736, 345 + dy, "Zeit seit dem letzten Lebenszeichen", F(22, 600), DARK)
        T2(d, 1200, 430 + dy, "Zeitlimit", F(20, 600), RED, "ra"); d.line((1200, 374 + dy, 1200, 426 + dy), fill=RED, width=4)
        if fill >= 0.999:
            d.rounded_rectangle((736, 480 + dy, 1200, 546 + dy), 14, fill=RED)
            T2(d, 968, 513 + dy, "Neustart oder Not-Halt", F(30, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 0.5, 0.4), wbar)

# ---------------------------------------------------------------- 4 Newton
def sc4(f, t, ct):
    heading(f, t, "Newton-Verfahren: Wurzel aus 2")
    P = Plot((100, 150, 780, 580), (0.4, 2.4), (-2.0, 3.6))
    def ax(d, dy):
        for v in (0.5, 1.0, 1.5, 2.0):
            x = P.px(v); d.line((x, P.y0 + dy, x, P.y1 + dy), fill=LINE, width=1); T2(d, x, P.py(0) + 6 + dy, de(v, 1), F(19, 400), GREY, "ma")
        d.line((P.x0, P.py(0) + dy, P.x1, P.py(0) + dy), fill=DARK, width=3)
        d.line((P.x0, P.y0 + dy, P.x0, P.y1 + dy), fill=DARK, width=2)
        T2(d, P.x1, P.py(0) - 30 + dy, "x", F(24, 700), DARK, "ra")
        pts = [(P.px(0.4 + i * 0.01), P.py((0.4 + i * 0.01) ** 2 - 2) + dy) for i in range(201)]
        d.line(pts, fill=(60, 90, 160), width=4)
        T2(d, P.px(0.55), P.py(-0.6) + dy, "x² − 2", F(26, 700), (60, 90, 160), "la")
    f.el(ap(t, ct(1) + 0.2, 0.5), ax)
    steps = [(ct(2) + 0.5, 0), (ct(3) + 0.6, 1), (ct(4) + 0.5, 2), (ct(4) + 3.5, 3)]
    def stairs(d, dy):
        for tt, i in steps:
            if t < tt: continue
            x = NEWTON[i]; y = x * x - 2; xn = NEWTON[i + 1]
            a = ap(t, tt, 0.6)
            d.line((P.px(x), P.py(0) + dy, P.px(x), P.py(y) + dy), fill=GREY, width=2)
            d.ellipse((P.px(x) - 6, P.py(y) - 6 + dy, P.px(x) + 6, P.py(y) + 6 + dy), fill=DARK)
            if t >= tt + 0.5:
                dd = (0.3, 0.2, 0.1, 0.05)[i]; ex = lerp(x + dd, xn, ap(t, tt + 0.5, 0.7))
                d.line((P.px(x + dd), P.py(y + 2 * x * dd) + dy, P.px(ex), P.py(y + 2 * x * (ex - x)) + dy), fill=RED, width=4)
            if t >= tt + 1.2:
                d.ellipse((P.px(xn) - 7, P.py(0) - 7 + dy, P.px(xn) + 7, P.py(0) + 7 + dy), fill=RED)
    f.el(1, stairs)
    f.el(ap(t, ct(2), 0.5), lambda d, dy: (T2(d, P.px(2.0) + 12, P.py(1.0) + dy, "Start 2", F(22, 700), DARK, "la")))
    root = lambda d, dy: (d.ellipse((P.px(math.sqrt(2)) - 9, P.py(0) - 9 + dy, P.px(math.sqrt(2)) + 9, P.py(0) + 9 + dy), outline=GREEN, width=4),
                          T2(d, P.px(math.sqrt(2)) - 14, P.py(0) - 24 + dy, "Wurzel aus 2", F(24, 700), GREEN, "rs"))
    f.el(ap(t, ct(1) + 1.0, 0.5), root)
    # Tabelle rechts
    rows = [["0", "2"], ["1", "1,5"], ["2", "1,4167"], ["3", "1,41422"]]
    rt = [ct(2) + 0.6, ct(3) + 1.4, ct(4) + 1.2, ct(4) + 4.2]
    f.el(ap(t, ct(2), 0.4), lambda d, dy: grid(d, 840, 170 + dy, [110, 270], ["Schritt", "Schätzwert"], rows, t, rt, size=26, rh=48))
    def how(d, dy):
        card(d, 840, 450 + dy, 396, 130)
        T2(d, 868, 462 + dy, "Neuer Schätzwert:", F(26, 700), DARK)
        T2(d, 868, 498 + dy, "Stelle, an der die Tangente", F(24, 400), GREY)
        T2(d, 868, 528 + dy, "die x-Achse schneidet", F(24, 400), GREY)
    f.el(ap(t, ct(3) + 0.2, 0.5), how, dy=int((1 - ap(t, ct(3) + 0.2, 0.5)) * 12))
    pill(f, t, ct(5) + 0.3, 100, 625, 680, 48, "Tangenten-Treppe: jeder Schritt wiederholt die Rechnung", size=24)

# ---------------------------------------------------------------- 5 Toleranz
def sc5(f, t, ct):
    heading(f, t, "Toleranz als Abbruchbedingung")
    rows = [[str(i + 1), de(NEWTON[i + 1], 7), de(CHG[i], 7) if i < 4 else "0,0000000000016"] for i in range(5)]
    rt = [ct(3) + 0.8 + 0.9 * i for i in range(5)]
    cols = {(4, 2): GREEN}
    f.el(ap(t, ct(1), 0.4), lambda d, dy: grid(d, 70, 150 + dy, [110, 250, 330], ["Schritt", "Schätzwert", "Änderung"], rows, t, rt, size=26, rh=52, colors=cols))
    def tol(d, dy):
        card(d, 800, 150 + dy, 436, 120)
        T2(d, 828, 162 + dy, "Toleranz", F(28, 700), DARK); T2(d, 828, 204 + dy, "0,000001", F(46, 700), RED)
    f.el(ap(t, ct(2) + 0.2, 0.5), tol, dy=int((1 - ap(t, ct(2) + 0.2, 0.5)) * 12))
    def rule(d, dy):
        card(d, 800, 290 + dy, 436, 130)
        T2(d, 828, 302 + dy, "Abbruch, wenn", F(28, 700), DARK); T2(d, 828, 342 + dy, "Änderung < Toleranz", F(30, 700), GREEN)
        T2(d, 828, 382 + dy, "sonst: noch ein Schritt", F(23, 400), GREY)
    f.el(ap(t, ct(3) + 0.2, 0.5), rule, dy=int((1 - ap(t, ct(3) + 0.2, 0.5)) * 12))
    def stop(d, dy):
        d.rounded_rectangle((70, 480 + dy, 760, 536 + dy), 28, fill=GREEN)
        T2(d, 415, 508 + dy, "Schritt 5: Änderung kleiner als die Toleranz: Ende", F(26, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 3.2, 0.5), stop, dy=int((1 - ap(t, ct(4) + 3.2, 0.5)) * 12))
    def kuehl(d, dy):
        card(d, 70, 570 + dy, 1166, 90)
        T2(d, 98, 584 + dy, "Auch bei der Abkühlung: kein genauer Treffer, sondern", F(28, 700), DARK)
        T2(d, 98, 620 + dy, "die Frage „Ziel 60 °C unterschritten?“", F(28, 700), RED)
    f.el(ap(t, ct(5) + 0.2, 0.5), kuehl, dy=int((1 - ap(t, ct(5) + 0.2, 0.5)) * 12))

# ---------------------------------------------------------------- 6 Zaehler und Akkumulator
def sc6(f, t, ct):
    heading(f, t, "Zähler und Akkumulator")
    rows = [["vor der Schleife", "-", "0", "0,00"]]
    s = 0.0
    for i in range(5):
        s += FIVE[i]; rows.append([str(i + 1), de(FIVE[i], 2), str(i + 1), de(s, 2)])
    assert rows[-1][3] == "3354,07"
    rt = [ct(3) + 0.3] + [ct(4) + 0.5 + 0.8 * i for i in range(5)]
    colors = {}
    for i in range(6): colors[(i, 2)] = RED; colors[(i, 3)] = GREEN
    def tb(d, dy):
        yb = grid(d, 70, 150 + dy, [210, 170, 120, 170], ["Durchlauf", "Temperatur", "Zähler", "Summe"], rows, t, rt, size=26, rh=52, colors=colors)
    f.el(ap(t, ct(0) + 0.5, 0.5), tb)
    def z(d, dy):
        card(d, 800, 150 + dy, 436, 130)
        T2(d, 828, 162 + dy, "Zähler", F(28, 700), RED); T2(d, 828, 204 + dy, "wird in jedem Durchlauf", F(24, 400), GREY); T2(d, 828, 234 + dy, "um 1 größer", F(24, 400), GREY)
    def a(d, dy):
        card(d, 800, 296 + dy, 436, 130)
        T2(d, 828, 308 + dy, "Akkumulator", F(28, 700), GREEN); T2(d, 828, 350 + dy, "sammelt die Werte auf:", F(24, 400), GREY); T2(d, 828, 380 + dy, "Summe + neuer Wert", F(24, 400), GREY)
    f.el(ap(t, ct(1) + 0.3, 0.5), z, dy=int((1 - ap(t, ct(1) + 0.3, 0.5)) * 12))
    f.el(ap(t, ct(2) + 0.3, 0.5), a, dy=int((1 - ap(t, ct(2) + 0.3, 0.5)) * 12))
    def st(d, dy):
        d.rounded_rectangle((800, 442 + dy, 1236, 502 + dy), 30, fill=DARK)
        T2(d, 1018, 472 + dy, "Startwert vor der Schleife: meist 0", F(24, 700), WHITE, "mm")
    f.el(ap(t, ct(3) + 0.3, 0.5), st)
    def mw(d, dy):
        card(d, 70, 560 + dy, 1166, 100)
        T2(d, 98, 572 + dy, "Mittelwert = Summe : Anzahl", F(28, 700), DARK)
        T2(d, 98, 612 + dy, "3354,07 : 5 ≈ 670,8 °C", F(34, 700), RED)
    f.el(ap(t, ct(4) + 4.6, 0.5), mw, dy=int((1 - ap(t, ct(4) + 4.6, 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Immer wieder", F(104, 700), DARK)
        T2(d, 90, 300, "Schleifen und Iteration", F(52, 400), GREY)
        P = Plot((110, 440, 760, 650), (0, 40), (0, 900))
        d.line((P.x0, P.y1, P.x1, P.y1), fill=DARK, width=3); d.line((P.x0, P.y0, P.x0, P.y1), fill=DARK, width=3)
        d.line([(P.px(i), P.py(TEMPS[i])) for i in range(41)], fill=(150, 156, 168), width=3)
        for i in range(0, 41, 2): d.ellipse((P.px(i) - 5, P.py(TEMPS[i]) - 5, P.px(i) + 5, P.py(TEMPS[i]) + 5), fill=RED)
        P.hline(d, 0, ZIEL, RED, "Ziel 60 °C", lx=560)
        for i in range(4):
            x = 900 + i * 0; y = 450 + i * 50
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.paste(LOOPS['head'].render((380, 330), (0, -4), zoom=0.92), (840, 380)); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
