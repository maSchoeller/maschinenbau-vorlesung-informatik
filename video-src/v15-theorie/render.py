"""V15 Theorie: Daten auswerten, Cp/Cpk, Regelkarte. Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v15-common"))
from bausteine import *
from texte import SRC

NAME = "v15-theorie"; LABEL = "DHBW · Informatik · V15 · Datenanalyse"
SECS = make_secs(SRC)

def machine(d, x, y, name, col, dy=0):
    """Einfache Drehmaschine: Bett, Spindelstock mit Spannfutter, Werkstueck, Reitstock."""
    d.rounded_rectangle((x, y + 90 + dy, x + 250, y + 112 + dy), 6, fill=DARK)
    d.rounded_rectangle((x, y + 30 + dy, x + 70, y + 92 + dy), 8, fill=LIGHTK, outline=DARK, width=3)
    d.rectangle((x + 70, y + 44 + dy, x + 84, y + 78 + dy), fill=DARK)
    d.rectangle((x + 84, y + 54 + dy, x + 190, y + 68 + dy), fill=(190, 196, 206), outline=DARK, width=2)
    d.rounded_rectangle((x + 190, y + 40 + dy, x + 230, y + 92 + dy), 6, fill=LIGHTK, outline=DARK, width=3)
    d.polygon([(x + 128, y + 54 + dy), (x + 142, y + 54 + dy), (x + 135, y + 36 + dy)], fill=col)
    T2(d, x + 125, y - 18 + dy, name, F(34, 700), col, "mm")

# ---------------------------------------------------------------- 1 Hook
ZS = Plot((100, 360, 1180, 460), (19.970, 20.030), (0, 1))
def sc1(f, t, ct):
    heading(f, t, "Zwei Maschinen, eine Toleranz")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    f.el(show(t, 0.3), lambda d, dy: (machine(d, 70, 150, "D1", BLUE, dy), machine(d, 400, 150, "D2", RED, dy)), dy=dyf(t, 0.3))

    def tabelle(d, dy):
        card(d, 730, 112 + dy, 490, 244)
        T2(d, 756, 122 + dy, "wellen.csv (Ausschnitt)", F(24, 700), DARK, "la")
        w = [34, 92, 78, 60, 40, 148]
        table(d, 756, 160 + dy, w, DF_HEAD, df_rows([0, 1, 2, 125]), size=16, rh=30)
        T2(d, 756 + sum(w) / 2, 160 + 30 * 5 + 16 + dy, "…  250 Zeilen", F(20, 600), GREY, "mm")
    f.el(show(t, c2 + 0.2), tabelle, dy=dyf(t, c2 + 0.2))

    def band(d, dy):
        a = ap(t, c1 + 0.2, 0.6)
        T2(d, ZS.x1, 500 + dy, "Durchmesser in mm", F(22, 700), GREY, "ra")
        d.rectangle((ZS.px(USG), 376 + dy, ZS.px(OSG), 446 + dy), fill=mix(WHITE, LIGHTG, a))
        d.line((ZS.x0, 446 + dy, ZS.x1, 446 + dy), fill=DARK, width=3)
        for v, lab, col in ((USG, "USG 19,980", RED), (20.0, "Soll 20,000", DARK), (OSG, "OSG 20,020", RED)):
            x = ZS.px(v); vdash(d, x, 368 + dy, 454 + dy, mix(WHITE, col, a), 3)
            T2(d, x, 462 + dy, lab, F(24, 700), mix(WHITE, col, a), "ma")
        T2(d, ZS.px(USG) + 10, 338 + dy, "erlaubt: ± 0,02 mm", F(24, 700), mix(WHITE, GREEN, a), "la")
    f.el(show(t, c1 + 0.2), band, dy=dyf(t, c1 + 0.2))

    def punkte(d, dy):
        g = clamp((t - c2 - 0.6) / 3.0)
        for k, (m, y, col) in enumerate((("D1", 400, BLUE), ("D2", 428, RED))):
            vals = DF[DF["maschine"] == m]["durchmesser_mm"].tolist(); n = int(len(vals) * g)
            T2(d, 60, y + dy, m, F(22, 700), col, "mm")
            for j, v in enumerate(vals[:n]):
                x = ZS.px(v); bad = v > OSG or v < USG
                d.ellipse((x - 4, y - 4 + dy + (j % 3 - 1) * 3, x + 4, y + 4 + dy + (j % 3 - 1) * 3), fill=RED if bad else col)
    f.el(show(t, c2 + 0.5), punkte)
    f.el(show(t, c3 + 0.1), lambda d, dy: tag(d, 300, 560 + dy, 680, 70, "Welche Maschine darf liefern?", DARK, WHITE, 38), dy=dyf(t, c3 + 0.1))

# ---------------------------------------------------------------- 2 Mittelwert, Sigma, Normalverteilung
def sc2(f, t, ct):
    heading(f, t, "Mittelwert, Standardabweichung, Glocke")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    def kachel(x, y, name, col, mu, sg, tin, zusatz):
        def fn(d, dy):
            card(d, x, y + dy, 420, 220)
            T2(d, x + 28, y + 12 + dy, name, F(36, 700), col, "la")
            T2(d, x + 28, y + 66 + dy, "Mittelwert", F(22, 600), GREY, "la"); T2(d, x + 392, y + 62 + dy, f"{dk(mu)} mm", F(32, 700), DARK, "ra")
            T2(d, x + 28, y + 116 + dy, "Streuung σ", F(22, 600), GREY, "la"); T2(d, x + 392, y + 112 + dy, f"{dk(sg)} mm", F(32, 700), DARK, "ra")
            T2(d, x + 28, y + 170 + dy, zusatz, F(22, 700), col, "la")
        f.el(show(t, tin), fn, dy=dyf(t, tin))
    kachel(60, 120, "D1", BLUE, MU1, SG1, c1 + 0.1, "liegt fast mittig")
    kachel(60, 360, "D2", RED, MU2, SG2, c1 + 1.6, "etwa 7 µm höher, streut mehr")
    P = Plot((560, 200, 1190, 540), (-4.5, 4.5), (0, 0.45))

    def glocke(d, dy):
        card(d, 520, 112 + dy, 700, 560)
        T2(d, 548, 124 + dy, "Normalverteilung", F(26, 700), DARK, "la")
        d.line((P.x0, P.y1, P.x1, P.y1), fill=DARK, width=3)
        pts = [(P.px(-4.5 + 9 * k / 120), P.py(pdf(-4.5 + 9 * k / 120, 0, 1))) for k in range(121)]
        a = ap(t, c2 + 1.0, 0.8)
        if a > 0:
            sel = [(P.px(x / 10), P.py(pdf(x / 10, 0, 1))) for x in range(-30, 31)]
            d.polygon([(sel[0][0], P.y1)] + sel + [(sel[-1][0], P.y1)], fill=mix(WHITE, LIGHTR, a))
        polyline(d, pts, DARK, 4, ap(t, c0 + 4.0, 3.0) if t < c2 else 1.0)
        for v, lab in ((-3, "−3σ"), (0, "μ"), (3, "+3σ")):
            x = P.px(v); d.line((x, P.y1, x, P.y1 + 10), fill=DARK, width=3); T2(d, x, P.y1 + 14, lab, F(24, 700), DARK, "ma")
        if t >= c2 + 1.4:
            T2(d, P.px(0), P.py(0.12) , "99,7 %", F(40, 700), RED, "mm"); T2(d, P.px(0), P.py(0.12) + 40, "aller Teile", F(22, 600), GREY, "mm")
        if t >= c3 + 0.1:
            a3 = ap(t, c3 + 0.1, 0.5); darrow(d, P.px(-3), P.px(3), P.y0 + 10, mix(WHITE, RED, a3), 4, 12)
            T2(d, P.px(0), P.y0 - 24, "Prozessbreite 6σ", F(26, 700), mix(WHITE, RED, a3), "mm")
    f.el(show(t, c0 + 3.5), glocke, dy=dyf(t, c0 + 3.5))

# ---------------------------------------------------------------- 3 Cp und Cpk
PB = Plot((90, 250, 740, 560), (19.968, 20.032), (0, 1.0))
def sc3(f, t, ct):
    heading(f, t, "Cp und Cpk: passt die Glocke in die Toleranz?")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    ymax = pdf(0, 0, SG1)
    def sc_(sg): return 0.82 / (ymax)    # Skalierung auf 0.82 der Plot-Hoehe (D1 als Referenz)
    K = 0.82 / pdf(0, 0, SG1)
    def bell_d(d, mu, sg, col, upto=1.0, fillc=None):
        xs = [mu - 4.5 * sg + 9 * sg * k / 160 for k in range(161)]
        pts = [(PB.px(x), PB.py(K * pdf(x, mu, sg))) for x in xs]
        if fillc is not None:
            d.polygon([(pts[0][0], PB.py(0))] + pts + [(pts[-1][0], PB.py(0))], fill=fillc)
        polyline(d, pts, col, 4, upto)

    def base(d, dy):
        card(d, 60, 112 + dy, 720, 560)
        d.line((PB.x0, PB.y1, PB.x1, PB.y1), fill=DARK, width=3)
        for v, lab in ((USG, "USG"), (OSG, "OSG")):
            x = PB.px(v); vdash(d, x, PB.py(1.0) + 6, PB.y1, RED, 4); T2(d, x, PB.y1 + 8, lab, F(24, 700), RED, "ma"); T2(d, x, PB.y1 + 36, dk(v, 3), F(20, 600), GREY, "ma")
        x = PB.px(20.0); d.line((x, PB.y1, x, PB.y1 + 8), fill=DARK, width=3); T2(d, x, PB.y1 + 8, "Soll", F(22, 600), GREY, "ma")
        a = ap(t, c0 + 2.0, 0.6)
        if a > 0:
            y = PB.py(0.97); darrow(d, PB.px(USG), PB.px(OSG), y, mix(WHITE, DARK, a), 3, 11)
            T2(d, PB.px(20.0), y - 6, "Toleranzbreite  OSG − USG = 0,040 mm", F(23, 700), mix(WHITE, DARK, a), "ms")
        fil = mix(WHITE, LIGHTB, ap(t, c0 + 0.6, 0.6))
        bell_d(d, MU1, SG1, BLUE, ap(t, c0 + 0.5, 1.6), fil if t > c0 + 2.0 else None)
        T2(d, PB.px(MU1) - 150, PB.py(0.40), "D1", F(30, 700), BLUE, "mm") if t > c0 + 2.2 else None
        if t >= c1 + 0.3:
            a1 = ap(t, c1 + 0.3, 0.5); col = mix(WHITE, BLUE, a1); y = PB.py(0.11)
            darrow(d, PB.px(MU1 - 3 * SG1), PB.px(MU1 + 3 * SG1), y, col, 3, 11)
            tag(d, int(PB.px(MU1)) - 85, int(y) + 10, 170, 34, f"6σ = {dk(6 * SG1, 3)} mm", WHITE, BLUE, 21, 700, outl=BLUE)
        if c2 + 0.3 <= t < c3 + 0.2 or (t >= c2 + 0.3 and t < c3 + 0.2):
            a2 = ap(t, c2 + 0.3, 0.5) * (1 - ap(t, c3 + 0.0, 0.3)); col = mix(WHITE, GREEN, a2)
            y1 = PB.py(0.62)
            darrow(d, PB.px(MU1), PB.px(OSG), y1, col, 3, 10); T2(d, (PB.px(MU1) + PB.px(OSG)) / 2, y1 - 6, f"{dk(OSG - MU1, 4)}", F(21, 700), col, "ms")
            y2 = PB.py(0.52)
            darrow(d, PB.px(USG), PB.px(MU1), y2, col, 3, 10); T2(d, (PB.px(USG) + PB.px(MU1)) / 2, y2 + 6, f"{dk(MU1 - USG, 4)}", F(21, 700), col, "ma")
        if t >= c3 + 0.2:
            a3 = ap(t, c3 + 0.2, 0.8)
            bell_d(d, MU2, SG2, RED, a3)
            T2(d, PB.px(MU2) + 120, PB.py(0.40), "D2", F(30, 700), RED, "mm") if a3 > 0.9 else None
            if a3 > 0.9:
                y = PB.py(0.30); darrow(d, PB.px(MU2), PB.px(OSG), y, RED, 4, 11)
                T2(d, PB.px(MU2) + 8, y - 8, f"nur {dk(OSG - MU2, 4)} mm", F(22, 700), RED, "ma") if False else None
                tag(d, int(PB.px(OSG)) + 8, int(y) - 17, 156, 34, f"nur {dk(OSG - MU2, 4)} mm", WHITE, RED, 21, 700, outl=RED)
    f.el(show(t, 0.3), base, dy=dyf(t, 0.3))

    def fcp(d, dy):
        card(d, 810, 112 + dy, 410, 118)
        T2(d, 836, 124 + dy, "Cp: passt die Breite?", F(24, 700), GREY, "la")
        T2(d, 836, 160 + dy, "Cp = (OSG − USG) / 6σ", F(30, 700), DARK, "la")
        if t >= c1 + 1.6: T2(d, 1196, 200 + dy, "D1: 0,040 / 0,0252", F(20, 600), GREY, "ra")
    f.el(show(t, c0 + 1.8), fcp, dy=dyf(t, c0 + 1.8))
    def fcpk(d, dy):
        card(d, 810, 244 + dy, 410, 160)
        T2(d, 836, 256 + dy, "Cpk: und die Lage?", F(24, 700), GREY, "la")
        T2(d, 836, 292 + dy, "Cpk = min(OSG − μ ; μ − USG)", F(26, 700), DARK, "la")
        T2(d, 836, 332 + dy, "          / 3σ", F(30, 700), DARK, "la")
        T2(d, 1196, 372 + dy, "der kleinere Abstand zählt", F(20, 600), GREY, "ra")
    f.el(show(t, c2 + 0.1), fcpk, dy=dyf(t, c2 + 0.1))
    f.el(show(t, c2 + 3.6), lambda d, dy: tag(d, 836, 416 + dy, 360, 44, "Richtwert: Cpk ≥ 1,33", AMB, WHITE, 26), dy=dyf(t, c2 + 3.6))

    def ergebnis(d, dy):
        card(d, 810, 480 + dy, 410, 192)
        T2(d, 836, 490 + dy, "", F(20, 600), GREY, "la")
        xs = [836, 960, 1070]
        for x, h in zip(xs, ("", "Cp", "Cpk")): T2(d, x + (0 if x == 836 else 40), 494 + dy, h, F(22, 700), GREY, "ma" if x != 836 else "la")
        rows = [("D1", BLUE, f"{(OSG-USG)/(6*SG1):.2f}", f"{CPK1:.2f}", GREEN, "fähig"), ("D2", RED, f"{(OSG-USG)/(6*SG2):.2f}", f"{CPK2:.2f}", RED, "nicht fähig")]
        for k, (m, mc, cp, cpk, cc, txt) in enumerate(rows):
            y = 530 + k * 66
            d.rounded_rectangle((830, y + dy, 1204, y + 56 + dy), 10, fill=LIGHTG if cc == GREEN else LIGHTR, outline=cc, width=2)
            T2(d, 850, y + 28 + dy, m, F(30, 700), mc, "lm"); T2(d, 1000, y + 28 + dy, cp.replace(".", ","), F(30, 700), DARK, "mm")
            T2(d, 1100, y + 28 + dy, cpk.replace(".", ","), F(30, 700), cc, "mm"); T2(d, 1196, y + 28 + dy, "", F(20, 700), cc, "rm")
            T2(d, 1190, y + 28 + dy, "✓" if cc == GREEN else "✗", F(30, 700), cc, "rm")
    f.el(show(t, c3 + 0.5), ergebnis, dy=dyf(t, c3 + 0.5))

# ---------------------------------------------------------------- 4 faehig und beherrscht
def sc4(f, t, ct):
    heading(f, t, "Fähig oder beherrscht? Zwei Fragen")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    X0, CW, Y0, RH = 290, 450, 190, 190
    cols = ["beherrscht (stabil)", "nicht beherrscht (driftet)"]; rows = ["fähig", "nicht fähig"]
    cells = [[("Ziel: liefern und", "mit der Regelkarte überwachen"), ("Heute gut, hält aber nicht:", "Ursache suchen, bevor es kippt")],
             [("Stabil, aber zu breit oder", "nicht mittig: Prozess verbessern"), ("Erst Ursache beheben,", "dann neu messen")]]
    cfill = [[LIGHTG, LIGHTA], [LIGHTA, LIGHTR]]; cstroke = [[GREEN, AMB], [AMB, RED]]

    def heads(d, dy):
        a = ap(t, c0 + 0.8, 0.5)
        for j, c in enumerate(cols):
            x = X0 + j * CW; d.rounded_rectangle((x + 6, 116 + dy, x + CW - 6, 168 + dy), 10, fill=DARK); T2(d, x + CW / 2, 142 + dy, c, F(26, 700), WHITE, "mm")
        for i, r in enumerate(rows):
            y = Y0 + i * RH; d.rounded_rectangle((60, y + 6 + dy, X0 - 10, y + RH - 6 + dy), 10, fill=DARK); T2(d, 60 + (X0 - 70) / 2, y + RH / 2 + dy, r, F(28, 700), WHITE, "mm")
    f.el(show(t, 0.3), heads, dy=dyf(t, 0.3))
    tins = [c1 + 0.1, c2 + 0.3, c2 + 3.0, c2 + 4.6]
    order = [(0, 0), (0, 1), (1, 0), (1, 1)]
    for (i, j), tin in zip(order, tins):
        def cell(d, dy, i=i, j=j):
            x = X0 + j * CW; y = Y0 + i * RH
            d.rounded_rectangle((x + 6, y + 6 + dy, x + CW - 6, y + RH - 6 + dy), 14, fill=cfill[i][j], outline=cstroke[i][j], width=3)
            T2(d, x + CW / 2, y + 74 + dy, cells[i][j][0], F(25, 700), DARK, "mm"); T2(d, x + CW / 2, y + 108 + dy, cells[i][j][1], F(25, 700), DARK, "mm")
        f.el(show(t, tin), cell, dy=dyf(t, tin))
    f.el(show(t, c1 + 0.9), lambda d, dy: tag(d, X0 - 230, 580 + dy, 440, 44, "Cpk misst: fähig? (rückblickend)", WHITE, RED, 22, 700, outl=RED), dy=dyf(t, c1 + 0.9))
    f.el(show(t, c2 + 0.9), lambda d, dy: tag(d, X0 + 250, 580 + dy, 470, 44, "Gleiche Lage und Streuung über die Zeit", WHITE, RED, 22, 700, outl=RED), dy=dyf(t, c2 + 0.9))
    f.el(show(t, c3 + 0.2), lambda d, dy: tag(d, 340, 636 + dy, 600, 46, "Das zeigt die Regelkarte", RED, WHITE, 30), dy=dyf(t, c3 + 0.2))
    def mark(d, dy):
        a = ap(t, c2 + 5.4, 0.6)
        if a > 0:
            for (i, j, m, col) in ((0, 0, "D1", BLUE), (1, 1, "D2", RED)):
                x = X0 + j * CW + CW - 70; y = Y0 + i * RH + 26
                d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=mix(WHITE, col, a)); T2(d, x, y, m, F(26, 700), WHITE, "mm")
    f.el(1, mark)

# ---------------------------------------------------------------- 5 Regelkarte
PR = Plot((150, 190, 880, 540), (0, 33), (19.975, 20.025))
def sc5(f, t, ct):
    heading(f, t, "Regelkarte: Mittelwerte von D2")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    def karte(d, dy):
        card(d, 60, 112 + dy, 860, 560, stripe=False)
        regelkarte(d, PR, t, c0 + 0.8, 4.5, c1 + 0.2, c2 + 3.0, c3 + 0.6)
        if t >= c3 + 0.9:
            a = ap(t, c3 + 0.9, 0.5)
            x, y = PR.px(20), PR.py(MITTEL2[19])
            tag(d, int(x) - 250, int(y) - 76, 230, 38, "Stichprobe 20: Alarm", RED, WHITE, 21)
    f.el(show(t, 0.3), karte, dy=dyf(t, 0.3))

    def formel(d, dy):
        card(d, 950, 112 + dy, 270, 190)
        T2(d, 970, 124 + dy, "Eingriffsgrenzen", F(24, 700), GREEN, "la")
        T2(d, 970, 164 + dy, "Mittellinie ± 3σ/√n", F(25, 700), DARK, "la")
        T2(d, 970, 204 + dy, "n = 5 Teile", F(22, 600), GREY, "la")
        T2(d, 970, 236 + dy, "aus dem Prozess", F(22, 600), GREY, "la")
    f.el(show(t, c1 + 0.3), formel, dy=dyf(t, c1 + 0.3))
    def tol(d, dy):
        card(d, 950, 316 + dy, 270, 120)
        T2(d, 970, 328 + dy, "Toleranzgrenzen", F(24, 700), RED, "la")
        T2(d, 970, 368 + dy, "vom Kunden", F(25, 700), DARK, "la")
        T2(d, 970, 402 + dy, "andere Linien", F(22, 600), GREY, "la")
    f.el(show(t, c2 + 3.0), tol, dy=dyf(t, c2 + 3.0))
    def aus(d, dy):
        card(d, 950, 450 + dy, 270, 222)
        T2(d, 970, 462 + dy, "6 Ausschussteile", F(24, 700), DARK, "la")
        # Stichproben der Ausschussteile: 17, 20, 24, 24, 25, 25
        smp = [int(v) for v in AUS["stichprobe"].tolist()]
        for k, s in enumerate(smp):
            x = 972 + (k % 3) * 82; y = 496 + (k // 3) * 62; spaeter = s > 20
            d.rounded_rectangle((x, y + dy, x + 70, y + 52 + dy), 8, fill=LIGHTR if spaeter else LIGHTK, outline=RED if spaeter else GREY, width=2)
            T2(d, x + 35, y + 26 + dy, f"Nr. {s}", F(22, 700), RED if spaeter else GREY, "mm")
        T2(d, 1085, 654 + dy, "4 davon nach dem Alarm", F(20, 700), RED, "mm") if False else None
        T2(d, 970, 626 + dy, "rot: nach dem Alarm", F(20, 700), RED, "la")
    f.el(show(t, c3 + 2.0), aus, dy=dyf(t, c3 + 2.0))

# ---------------------------------------------------------------- 6 Werkzeug rechnet, Ingenieur bewertet
def sc6(f, t, ct):
    heading(f, t, "Das Werkzeug rechnet, du bewertest")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    def spalte(x, titel, col, items, tin, t0s):
        def kopf(d, dy):
            card(d, x, 120 + dy, 540, 440); d.rounded_rectangle((x + 24, 140 + dy, x + 516, 196 + dy), 14, fill=col)
            T2(d, x + 270, 168 + dy, titel, F(32, 700), WHITE, "mm")
        f.el(show(t, tin), kopf, dy=dyf(t, tin))
        for k, (s, te) in enumerate(zip(items, t0s)):
            def row(d, dy, k=k, s=s):
                y = 216 + k * 84 + dy
                d.rounded_rectangle((x + 24, y, x + 516, y + 66), 12, fill=LIGHTK, outline=LINE, width=2)
                d.ellipse((x + 40, y + 16, x + 74, y + 50), fill=col); tick(d, x + 57, y + 33, 20, WHITE, 4)
                fit(s, F(27, 700), 430, "Zeile"); T2(d, x + 92, y + 33, s, F(27, 700), DARK, "lm")
            f.el(show(t, te), row, dy=dyf(t, te))
    spalte(60, "Werkzeug (pandas)", BLUE, ["Mittelwert und σ", "Cp und Cpk", "Regelkarte und Alarm", "in einer Sekunde"], c0 + 0.1, [c0 + 1.0, c0 + 2.2, c0 + 3.4, c0 + 4.6])
    spalte(680, "Ingenieur (du)", RED, ["Stimmen die Grenzen?", "Sind die Daten repräsentativ?", "Ursache: Werkzeugverschleiß?", "Entscheidung treffen"], c1 + 0.1, [c1 + 0.8, c1 + 2.6, c1 + 4.4, c2 + 0.1])
    f.el(show(t, c2 + 1.0), lambda d, dy: tag(d, 240, 600 + dy, 800, 64, "Im Labor rechnest du es selbst", DARK, WHITE, 36), dy=dyf(t, c2 + 1.0))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V15 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Datenanalyse", F(84, 700), DARK)
        T2(d, 90, 290, "Cp, Cpk und die Regelkarte", F(44, 400), GREY)
        P = Plot((100, 400, 560, 640), (19.97, 20.03), (0, 1))
        d.line((P.x0, P.y1, P.x1, P.y1), fill=DARK, width=3)
        for v in (USG, OSG): vdash(d, P.px(v), P.py(1.0), P.y1, RED, 4)
        for mu, sg, col in ((MU1, SG1, BLUE), (MU2, SG2, RED)):
            k = 0.85 / pdf(0, 0, SG1); xs = [mu - 4.5 * sg + 9 * sg * i / 120 for i in range(121)]
            polyline(d, [(P.px(x), P.py(k * pdf(x, mu, sg))) for x in xs], col, 5)
        Q = Plot((700, 400, 1160, 640), (0, 26), (19.975, 20.025)); d.line((Q.x0, Q.y1, Q.x1, Q.y1), fill=DARK, width=3)
        pts = [(Q.px(i + 1), Q.py(v)) for i, v in enumerate(MITTEL2)]
        polyline(d, pts, GREY, 3); dots(d, pts, DARK, 5, WHITE)
        for k in ALARM: dots(d, [pts[k - 1]], RED, 8, RED)
        hdash(d, Q.x0, Q.x1, Q.py(OEG), GREEN, 3); hdash(d, Q.x0, Q.x1, Q.py(UEG), GREEN, 3)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
