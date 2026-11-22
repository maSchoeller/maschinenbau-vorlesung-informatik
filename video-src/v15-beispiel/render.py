"""V15 Vorgerechnet: Prozessfähigkeit zweier Drehmaschinen (Code exakt aus briefing/v15-beispiel.py, echte Ausgabe).
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]  (tts erst nach Freigabe der Credits)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v15-common"))
from bausteine import *
from texte import SRC

NAME = "v15-beispiel"; LABEL = "DHBW · Informatik · V15 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

assert len(CODE) == 36 and CODE[4] == "import pandas as pd" and CODE[14].startswith("kennwerte =") and CODE[22].startswith("ausschuss =") and CODE[26].startswith("d2 =") and CODE[35].startswith("print(")
def ai(prefix):
    for i, l in enumerate(AUSGABE):
        if l.startswith(prefix): return i
    raise AssertionError(prefix)
I_HEAD = 0; I_DESC = 4; I_KEN = ai("             mean"); I_AUS = ai("Teile außerhalb"); I_MITTE = ai("Mittellinie")
assert AUSGABE[I_KEN + 2].startswith("D1") and AUSGABE[I_KEN + 3].startswith("D2") and I_DESC + 9 == I_KEN

def panel_text(d, x, y, w, h, title="Ausgabe"):
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX2); T(d, x + 22, y + 12, title, F(20, 600), CODE_C)

# ---------------------------------------------------------------- 1 Aufgabe und Daten
def sc1(f, t, ct):
    heading(f, t, "Welche Maschine darf liefern?")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    f.el(show(t, 0.3), lambda d, dy: (machine_icon(d, 70, 150, "D1", BLUE, dy), machine_icon(d, 400, 150, "D2", RED, dy)), dy=dyf(t, 0.3))
    ZS = Plot((100, 330, 680, 400), (19.970, 20.030), (0, 1))
    def band(d, dy):
        a = ap(t, c0 + 0.8, 0.6)
        d.rectangle((ZS.px(USG), 330 + dy, ZS.px(OSG), 386 + dy), fill=mix(WHITE, LIGHTG, a)); d.line((ZS.x0, 386 + dy, ZS.x1, 386 + dy), fill=DARK, width=3)
        for v, lab, col in ((USG, "19,980", RED), (20.0, "20,000", DARK), (OSG, "20,020", RED)):
            x = ZS.px(v); vdash(d, x, 322 + dy, 394 + dy, mix(WHITE, col, a), 3); T2(d, x, 400 + dy, lab, F(22, 700), mix(WHITE, col, a), "ma")
        T2(d, ZS.px(20.0), 296 + dy, "Toleranz ± 0,02 mm", F(24, 700), mix(WHITE, GREEN, a), "mm")
        T2(d, ZS.x1, 436 + dy, "Durchmesser in mm", F(21, 700), GREY, "ra")
    f.el(show(t, c0 + 0.8), band, dy=dyf(t, c0 + 0.8))

    def tabelle(d, dy):
        card(d, 730, 112 + dy, 490, 244)
        T2(d, 756, 122 + dy, "wellen.csv (Ausschnitt)", F(24, 700), DARK, "la")
        w = [34, 92, 78, 60, 40, 148]
        table(d, 756, 160 + dy, w, DF_HEAD, df_rows([0, 1, 2, 125]), size=16, rh=30)
        T2(d, 756 + sum(w) / 2, 160 + 30 * 5 + 16 + dy, "…  250 Zeilen", F(20, 600), GREY, "mm")
    f.el(show(t, c1 + 0.2), tabelle, dy=dyf(t, c1 + 0.2))
    tiles = [("250", "Messwerte", c1 + 0.8), ("2", "Maschinen D1 und D2", c1 + 1.6), ("25 × 5", "Stichproben je Maschine, 5 Teile", c1 + 2.4)]
    for k, (big, small, tin) in enumerate(tiles):
        x = 730 + k * 0 ;
        def tl(d, dy, k=k, big=big, small=small):
            xx = 60 + k * 390; card(d, xx, 470 + dy, 370, 110)
            T2(d, xx + 26, 482 + dy, big, F(46, 700), RED, "la"); fit(small, F(22, 600), 320, "Kachel"); T2(d, xx + 26, 540 + dy, small, F(22, 600), GREY, "la")
        f.el(show(t, tin), tl, dy=dyf(t, tin))
    f.el(show(t, c2 + 0.1), lambda d, dy: tag(d, 300, 610 + dy, 680, 64, "Cp, Cpk, Ausschuss, Regelkarte für D2", DARK, WHITE, 34), dy=dyf(t, c2 + 0.1))

# ---------------------------------------------------------------- 2 Einlesen (Zeilen 5 bis 12)
def sc2(f, t, ct):
    heading(f, t, "Einlesen: Zeilen 5 bis 12")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    nums = list(range(5, 13)); lines = CODE[4:12]; times = [1e9] * 8
    def put(idxs, start, cps=55):
        c = start
        for i in idxs: times[i] = c; c += max(len(lines[i]), 4) / cps + 0.1
    put([0, 2, 3], c0 + 0.2); put([5, 6], c1 + 0.2); put([7], c2 + 0.2)
    hl = hl_sched(t, [(0, None), (c0, {0, 2, 3}), (c1, {5, 6}), (c2, {7})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 640, lines, nums, times, t, 18, 30, hl))
    out = AUSGABE[I_HEAD:I_KEN]; t0s = [c1 + 1.4 + 0.4 * k for k in range(4)] + [c2 + 1.0 + 0.3 * k for k in range(9)]
    cols = {5 + 4: RED}
    out_panel(f, t, c1 + 1.0, 720, 112, 500, 420, out, t0s, 15, 26, cols={I_DESC + 1: RED})
    tl = [(c0 + 0.5, "OSG = 20,020 mm und USG = 19,980 mm", "obere und untere Grenze"), (c1 + 0.5, "df: DataFrame mit 250 Zeilen", "head(3): die ersten drei"), (c2 + 0.5, "describe: Mittelwert 20,0037", "gemischt aus D1 und D2: wenig Aussage")]
    for k, (a, b, tin) in enumerate(((x[1], x[2], x[0]) for x in tl)):
        def tile_(d, dy, k=k, a=a, b=b):
            y = 440 + k * 76; card(d, 60, y + dy, 640, 66)
            fit(a, F(24, 700), 580, "Kachel"); T2(d, 86, y + 8 + dy, a, F(24, 700), DARK, "la"); T2(d, 86, y + 38 + dy, b, F(20, 600), GREY, "la")
        f.el(show(t, tin), tile_, dy=dyf(t, tin))

# ---------------------------------------------------------------- 3 Kennwerte (Zeilen 14 bis 20)
def sc3(f, t, ct):
    heading(f, t, "Cp und Cpk je Maschine: Zeilen 14 bis 20")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    lines = CODE[13:20]; nums = list(range(14, 21)); times = [1e9] * 7
    def put(idxs, start, cps=55):
        c = start
        for i in idxs: times[i] = c; c += max(len(lines[i]), 4) / cps + 0.1
    put([0, 1], c0 + 0.2); put([2, 3, 4], c1 + 0.2); put([5], c2 + 0.2); put([6], c3 + 0.2)
    hl = hl_sched(t, [(0, None), (c0, {1}), (c1, {2, 3, 4}), (c2, {5}), (c3, {6})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 106 + dy, 1160, lines, nums, times, t, 19, 28, hl))
    out = AUSGABE[I_KEN:I_KEN + 4]; t0s = [c3 + 0.9 + 0.5 * k for k in range(4)]
    out_panel(f, t, c3 + 0.7, 60, 392, 700, 190, out, t0s, 22, 34, cols={2: GREEN, 3: RED})
    def erkl(d, dy):
        card(d, 790, 392 + dy, 430, 190)
        T2(d, 816, 402 + dy, "Cp = (OSG − USG) / (6σ)", F(25, 700), DARK, "la")
        T2(d, 816, 442 + dy, "Cpk = min(OSG − μ ; μ − USG) / (3σ)", F(23, 700), DARK, "la")
        T2(d, 816, 490 + dy, "mean = μ, std = σ", F(22, 600), GREY, "la")
        T2(d, 816, 524 + dy, "min(axis=1): je Zeile der kleinere Wert", F(21, 600), GREY, "la")
    f.el(show(t, c1 + 0.3), erkl, dy=dyf(t, c1 + 0.3))
    def res(d, dy):
        for k, (m, cp, cpk, ok, fl) in enumerate((("D1", "1,5905", "1,5809", True, LIGHTG), ("D2", "1,0682", "0,6838", False, LIGHTR))):
            col = GREEN if ok else RED; x = 60 + k * 590
            d.rounded_rectangle((x, 604 + dy, x + 570, 668 + dy), 14, fill=fl, outline=col, width=2)
            T2(d, x + 24, 636 + dy, m, F(32, 700), BLUE if ok else RED, "lm"); T2(d, x + 100, 636 + dy, f"Cp {cp}   Cpk {cpk}", F(28, 700), DARK, "lm")
            T2(d, x + 548, 636 + dy, "fähig" if ok else "nicht fähig", F(28, 700), col, "rm")
    f.el(show(t, c3 + 2.6), res, dy=dyf(t, c3 + 2.6))

# ---------------------------------------------------------------- 4 Ausschuss (Zeilen 22 bis 24)
def sc4(f, t, ct):
    heading(f, t, "Ausschuss finden: Zeilen 22 bis 24")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    lines = CODE[21:24]; nums = [22, 23, 24]; times = [c0 + 0.1, c0 + 0.7, c1 + 0.2]
    hl = hl_sched(t, [(0, None), (c0, {1}), (c1, {2}), (c2, {1})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 106 + dy, 960, lines, nums, times, t, 20, 30, hl))
    def maske(d, dy):
        card(d, 60, 270 + dy, 560, 250)
        T2(d, 86, 280 + dy, "Maske aus zwei Vergleichen", F(26, 700), DARK, "la")
        chip(d, 86, 326 + dy, 500, 46, '(df["durchmesser_mm"] > OSG)', LIGHTB, BLUE, 20, mono=True)
        chip(d, 86, 384 + dy, 140, 46, "|  oder", LIGHTA, AMB, 26)
        chip(d, 86, 442 + dy, 500, 46, '(df["durchmesser_mm"] < USG)', LIGHTG, GREEN, 20, mono=True)
        T2(d, 250, 407 + dy, "Klammern um jeden Vergleich", F(22, 700), RED, "lm")
    f.el(show(t, c0 + 0.3), maske, dy=dyf(t, c0 + 0.3))
    out_panel(f, t, c1 + 1.4, 60, 540, 560, 100, [AUSGABE[I_AUS]], [c1 + 1.6], 22, 34)
    smp = AUS.index.tolist()
    def liste(d, dy):
        card(d, 650, 270 + dy, 570, 370)
        T2(d, 676, 280 + dy, "ausschuss: 6 Zeilen von df", F(26, 700), DARK, "la")
        rows = df_rows(smp); w = [44, 90, 78, 60, 40, 148]; n = int(1 + 6 * clamp((t - c2 - 0.3) / 3.0)) if t >= c2 + 0.3 else 0
        table(d, 676, 326 + dy, w, DF_HEAD, rows[:n] + [[""] * 6] * 0, size=16, rh=34, cell_col={(i, 2): RED for i in range(6)} | {(i, 5): RED for i in range(6)})
        if t >= c2 + 3.6: tag(d, 676, 326 + 34 * 7 + 14 + dy, 520, 40, "alle sechs: D2, Spätschicht", RED, WHITE, 24)
    f.el(show(t, c1 + 1.8), liste, dy=dyf(t, c1 + 1.8))

# ---------------------------------------------------------------- 5 Regelkarte: Rechnung (Zeilen 26 bis 36)
def sc5(f, t, ct):
    heading(f, t, "Regelkarte für D2: Zeilen 26 bis 36")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    lines = CODE[25:36]; nums = list(range(26, 37)); times = [1e9] * 11
    def put(idxs, start, cps=60):
        c = start
        for i in idxs: times[i] = c; c += max(len(lines[i]), 4) / cps + 0.08
    put([0, 1, 2], c0 + 0.2); put([3, 4], c1 + 0.2); put([5, 6, 7], c2 + 0.2); put([8, 9, 10], c3 + 0.2)
    hl = hl_sched(t, [(0, None), (c0, {1, 2}), (c1, {3, 4}), (c2, {5, 6, 7}), (c3, {8})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 106 + dy, 880, lines, nums, times, t, 17, 27, hl))
    def werte(d, dy):
        card(d, 960, 106 + dy, 260, 392)
        T2(d, 984, 116 + dy, "Werte", F(26, 700), RED, "la")
        items = [(c1 + 1.2, "mitte", dk(MITTE)), (c2 + 0.9, "sigma_x", dk(SIGX)), (c2 + 2.2, "oeg", dk(OEG)), (c2 + 3.0, "ueg", dk(UEG))]
        for k, (te, nm, v) in enumerate(items):
            a = ap(t, te, 0.4)
            if a > 0:
                y = 164 + k * 82
                d.rounded_rectangle((982, y + dy, 1198, y + 68 + dy), 10, fill=mix(WHITE, LIGHTB, a), outline=mix(WHITE, BLUE, a), width=2)
                T2(d, 1000, y + 20 + dy, nm, M(21, True), mix(WHITE, GREY, a), "lm"); T2(d, 1000, y + 48 + dy, f"{v} mm", F(28, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, c1 + 0.8), werte, dy=dyf(t, c1 + 0.8))
    def rech(d, dy):
        card(d, 60, 510 + dy, 1160, 170)
        rows = [(c0 + 0.8, "je Stichprobe: Mittelwert aus 5 Teilen  (Zeile 28)", DARK), (c1 + 1.4, f"Mittellinie = Mittelwert der Stichproben 1 bis 15 = {dk(MITTE)} mm", BLUE),
                (c2 + 1.0, f"σ_x = s / √5 = {dk(ANF.std())} / 2,236 = {dk(SIGX)} mm", DARK), (c2 + 2.4, f"OEG / UEG = Mittellinie ± 3 · σ_x = {dk(OEG)} / {dk(UEG)} mm", GREEN)]
        for k, (te, s, col) in enumerate(rows):
            a = ap(t, te, 0.4)
            if a > 0: fit(s, F(26, 700), 1100, "Rechnung"); T2(d, 86, 524 + k * 38 + dy, s, F(26, 700), mix(WHITE, col, a), "la")
    f.el(show(t, c0 + 0.6), rech, dy=dyf(t, c0 + 0.6))

# ---------------------------------------------------------------- 6 Ergebnis: Regelkarte und Fazit
PR = Plot((150, 170, 880, 460), (0, 33), (19.975, 20.025))
def sc6(f, t, ct):
    heading(f, t, "Ergebnis: D1 darf liefern, D2 nicht")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    def karte(d, dy):
        card(d, 60, 106 + dy, 860, 430, stripe=False)
        regelkarte(d, PR, t, c0 + 2.0, 3.5, c0 + 0.3, None, c0 + 7.0)
        if t >= c2 + 0.4:
            x, y = PR.px(20), PR.py(MITTEL2[19])
            tag(d, int(x) - 250, int(y) - 76, 230, 38, "Stichprobe 20: Alarm", RED, WHITE, 21)
    f.el(show(t, 0.3), karte, dy=dyf(t, 0.3))
    out_panel(f, t, c0 + 0.2, 60, 550, 1160, 124, AUSGABE[I_MITTE:I_MITTE + 2], [c0 + 0.6, c0 + 3.4], 20, 32, cols={1: RED})
    def fazit(d, dy):
        d.rounded_rectangle((950, 106 + dy, 1220, 232 + dy), 14, fill=LIGHTG, outline=GREEN, width=3)
        T2(d, 970, 122 + dy, "D1: fähig", F(30, 700), GREEN, "la"); T2(d, 970, 164 + dy, f"Cpk {dk(CPK1, 2)}", F(28, 700), DARK, "la"); T2(d, 970, 196 + dy, "darf liefern", F(24, 700), GREEN, "la")
    f.el(show(t, c1 + 0.2), fazit, dy=dyf(t, c1 + 0.2))
    def fazit2(d, dy):
        d.rounded_rectangle((950, 246 + dy, 1220, 372 + dy), 14, fill=LIGHTR, outline=RED, width=3)
        T2(d, 970, 262 + dy, "D2: nicht fähig", F(30, 700), RED, "la"); T2(d, 970, 304 + dy, f"Cpk {dk(CPK2, 2)}", F(28, 700), DARK, "la"); T2(d, 970, 336 + dy, "zu hoch, driftet", F(24, 700), RED, "la")
    f.el(show(t, c1 + 1.6), fazit2, dy=dyf(t, c1 + 1.6))
    def hint(d, dy):
        d.rounded_rectangle((950, 386 + dy, 1220, 536 + dy), 14, fill=LIGHTA, outline=AMB, width=3)
        T2(d, 970, 400 + dy, "Karte schlägt an", F(26, 700), AMB, "la"); T2(d, 970, 436 + dy, "bei Stichprobe 20", F(26, 700), DARK, "la")
        T2(d, 970, 476 + dy, "4 von 6 Ausschuss-", F(22, 600), DARK, "la"); T2(d, 970, 502 + dy, "teilen kamen danach", F(22, 600), DARK, "la")
    f.el(show(t, c2 + 1.0), hint, dy=dyf(t, c2 + 1.0))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V15 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Welche Maschine darf liefern?", F(48, 400), GREY)
        out = AUSGABE[I_KEN:I_KEN + 4]
        d.rounded_rectangle((90, 400, 700, 560), 14, fill=BOX2);
        for k, ln in enumerate(out): T2(d, 112, 424 + k * 34, ln, M(22), CODE_T if k in (0, 1) else (CODE_G if k == 2 else CODE_R), "lm")
        P = Plot((780, 400, 1200, 590), (0, 33), (19.975, 20.025)); d.line((P.x0, P.y1, P.x1, P.y1), fill=DARK, width=3); d.line((P.x0, P.y0, P.x0, P.y1), fill=DARK, width=3)
        pts = [(P.px(i + 1), P.py(v)) for i, v in enumerate(MITTEL2)]
        polyline(d, pts, GREY, 3); dots(d, pts, DARK, 5, WHITE)
        for k in ALARM: dots(d, [pts[k - 1]], RED, 8, RED)
        hdash(d, P.x0, P.x1, P.py(OEG), GREEN, 3); hdash(d, P.x0, P.x1, P.py(UEG), GREEN, 3)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
