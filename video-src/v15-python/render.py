"""V15 Python: pandas als Werkzeugkasten (read_csv, Series, Maske, groupby, neue Spalte). Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v15-common"))
from bausteine import *
from texte import SRC

NAME = "v15-python"; LABEL = "DHBW · Informatik · V15 · pandas"
SECS = make_secs(SRC)

# echte Ausgaben
HEAD = real('import pandas as pd\ndf = pd.read_csv("wellen.csv")\nprint(df.head(3))')
DESC = real('import pandas as pd\ndf = pd.read_csv("wellen.csv")\nprint(df["durchmesser_mm"].describe().round(4))')
SER = real('import pandas as pd\ndf = pd.read_csv("wellen.csv")\nprint(df["durchmesser_mm"].head(4))')
AGG = real('import pandas as pd\ndf = pd.read_csv("wellen.csv")\nprint(df.groupby("maschine")["durchmesser_mm"].agg(["mean", "std", "count"]).round(4))')
FEHLER = real_fehler('import pandas as pd\ndf = pd.read_csv("wellen.csv")\ndf[(df["durchmesser_mm"] > 20.02) or (df["durchmesser_mm"] < 19.98)]')
assert HEAD[0].split()[-1] == "durchmesser_mm" and len(HEAD) == 4 and DESC[0].startswith("count") and len(DESC) == 9 and AGG[2].startswith("D1"), (HEAD, DESC, AGG)
assert FEHLER and FEHLER.startswith("ValueError: The truth value of a Series is ambiguous"), FEHLER

def mini_code(f, t, x, y, w, lines, times, size=22, lh=34, hl=None, title="Python"):
    f.el(show(t, min(times) - 0.1 if min(times) < 1e8 else 1e9), lambda d, dy: code_n(d, x, y + dy, w, lines, [i + 1 for i in range(len(lines))], times, t, size, lh, hl, title=title))

# ---------------------------------------------------------------- 1 import, read_csv, head
def sc1(f, t, ct):
    heading(f, t, "pandas: Tabellen einlesen")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    CODE1 = ["import pandas as pd", "", 'df = pd.read_csv("wellen.csv")', "print(df.head(3))"]
    times = [c1 + 0.2, 1e9, c2 + 0.2, c3 + 0.2]
    hl = hl_sched(t, [(0, None), (c1, {0}), (c2, {2}), (c3, {3})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 640, CODE1, [1, 2, 3, 4], times, t, 24, 36, hl, title="Python"))
    out_panel(f, t, c3 + 0.9, 60, 330, 640, 180, HEAD, [c3 + 1.0 + 0.4 * k for k in range(4)], 20, 30)

    def csv(d, dy):
        card(d, 740, 112 + dy, 480, 150)
        T2(d, 766, 122 + dy, "wellen.csv (Textdatei)", F(24, 700), DARK, "la")
        raw = open(os.path.join(DATA, "wellen.csv"), encoding="utf-8").read().splitlines()[:4]
        d.rounded_rectangle((762, 160 + dy, 1198, 250 + dy), 10, fill=BOX)
        for k, ln in enumerate(raw): T2(d, 776, 172 + dy + k * 22, ln, M(15), CODE_T if k else CODE_K, "lm")
    f.el(show(t, c0 + 0.4), csv, dy=dyf(t, c0 + 0.4))

    def dfc(d, dy):
        card(d, 740, 280 + dy, 480, 292)
        T2(d, 766, 290 + dy, "DataFrame df", F(26, 700), RED, "la")
        w = [34, 92, 78, 60, 40, 148]
        table(d, 764, 340 + dy, w, DF_HEAD, df_rows([0, 1, 2]), size=16, rh=34, hl_rows=set())
        T2(d, 764 + sum(w) / 2, 340 + 34 * 4 + 12 + dy, "…  250 Zeilen", F(20, 600), GREY, "mm")
        chip(d, 766, 520 + dy, 200, 34, "Spaltennamen", LIGHTR, RED, 20)
        chip(d, 986, 520 + dy, 200, 34, "Index (Zeile)", LIGHTK, GREY, 20)
    f.el(show(t, c2 + 0.9), dfc, dy=dyf(t, c2 + 0.9))
    f.el(show(t, c1 + 0.2), lambda d, dy: tag(d, 60, 560 + dy, 640, 50, "pd ist die übliche Abkürzung für pandas", LIGHTB, BLUE, 24, 700, outl=BLUE), dy=dyf(t, c1 + 0.2))

# ---------------------------------------------------------------- 2 Series und describe
def sc2(f, t, ct):
    heading(f, t, "Eine Spalte ist eine Series")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    def left(d, dy):
        card(d, 60, 112 + dy, 520, 230)
        T2(d, 86, 122 + dy, "df", F(26, 700), RED, "la")
        w = [34, 92, 78, 60, 40, 148]
        hlc = {5} if t >= c0 + 0.4 else set()
        table(d, 86, 160 + dy, w, DF_HEAD, df_rows([0, 1, 2]), size=16, rh=34, hl_cols=hlc)
    f.el(show(t, 0.3), left, dy=dyf(t, 0.3))
    def ser(d, dy):
        card(d, 60, 362 + dy, 520, 310)
        d.rounded_rectangle((84, 378 + dy, 556, 420 + dy), 8, fill=BOX); T2(d, 100, 399 + dy, 'df["durchmesser_mm"]', M(22), CODE_T, "lm")
        T2(d, 86, 436 + dy, "Series: eine Spalte mit Index", F(24, 700), DARK, "la")
        for k, ln in enumerate(SER):
            fit(ln, M(21), 460, "Series"); T2(d, 100, 482 + k * 30 + dy, ln, M(21), DARK if k < 4 else GREY, "lm")
        T2(d, 100, 482 + 5 * 30 + dy, "…", M(21), GREY, "lm")
    f.el(show(t, c0 + 0.5), ser, dy=dyf(t, c0 + 0.5))
    CODE2 = ['print(df["durchmesser_mm"].describe().round(4))']
    f.el(show(t, c1 + 0.1), lambda d, dy: code_n(d, 620, 112 + dy, 600, CODE2, [1], [c1 + 0.2], t, 19, 34, {0}, title="Python"), dy=dyf(t, c1 + 0.1))
    cols = {1: RED, 2: RED}
    out_panel(f, t, c1 + 0.7, 620, 220, 600, 330, DESC, [c1 + 1.0 + 0.35 * k for k in range(len(DESC))], 21, 30, cols=cols)
    f.el(show(t, c2 + 0.2), lambda d, dy: tag(d, 620, 580 + dy, 600, 46, "gemischt aus D1 und D2: hilft noch nicht", LIGHTA, AMB, 22, 700, outl=AMB), dy=dyf(t, c2 + 0.2))

# ---------------------------------------------------------------- 3 Maske
def sc3(f, t, ct):
    heading(f, t, "Filtern: Maske und Bedingungen")
    c0, c1, c2, c3 = ct(0), ct(1), ct(2), ct(3)
    first = int((DF["schicht"] == "Spät").idxmax()); idx = list(range(first - 3, first + 3))
    rows = df_rows(idx); rows = [[r[0], r[1], r[2], r[3], r[5]] for r in rows]
    mask = [DF.at[i, "schicht"] == "Spät" for i in idx]
    w = [44, 96, 82, 70, 150, 84]
    def a(d, dy):
        card(d, 60, 112 + dy, 640, 340)
        T2(d, 86, 122 + dy, 'df["schicht"] == "Spät"', M(24, True), RED, "la")
        hdr = ["", "stichprobe", "maschine", "schicht", "durchmesser_mm"]
        showmask = t >= c0 + 0.9; filt = t >= c1 + 0.2
        rr = [r + (["Wahr" if m else "Falsch"] if showmask else [""]) for r, m in zip(rows, mask)]
        header = hdr + (["Maske"] if showmask else [""])
        cc = {(k, 5): (GREEN if m else GREY) for k, m in enumerate(mask)}
        table(d, 86, 164 + dy, w, header, rr, size=17, rh=36, dim_rows=({k for k, m in enumerate(mask) if not m} if filt else set()),
              hl_rows=({k for k, m in enumerate(mask) if m} if filt else set()), cell_col=cc)
        if filt: T2(d, 86, 164 + 36 * 7 + 12 + dy, "df[maske]: nur die Zeilen mit Wahr bleiben", F(21, 700), GREEN, "la")
    f.el(show(t, 0.3), a, dy=dyf(t, 0.3))

    def b(d, dy):
        card(d, 730, 112 + dy, 490, 340)
        T2(d, 756, 122 + dy, "Mehrere Bedingungen", F(26, 700), DARK, "la")
        chip(d, 756, 170 + dy, 440, 46, '(df["durchmesser_mm"] > OSG)', LIGHTB, BLUE, 20, mono=True)
        if t >= c2 + 1.0:
            chip(d, 756, 234 + dy, 200, 50, "|  oder", LIGHTA, AMB, 28); chip(d, 976, 234 + dy, 220, 50, "&  und", LIGHTA, AMB, 28)
        chip(d, 756, 302 + dy, 440, 46, '(df["durchmesser_mm"] < USG)', LIGHTG, GREEN, 20, mono=True)
        if t >= c2 + 2.2: tag(d, 756, 372 + dy, 440, 44, "jeder Vergleich in runden Klammern", RED, WHITE, 24)
    f.el(show(t, c2 + 0.1), b, dy=dyf(t, c2 + 0.1))

    def e(d, dy):
        card(d, 60, 468 + dy, 1160, 204)
        T2(d, 86, 476 + dy, "Nicht so:", F(24, 700), RED, "la")
        code_n(d, 190, 472 + dy, 1010, ['df[(df["durchmesser_mm"] > OSG) or (df["durchmesser_mm"] < USG)]'], [None], [c3 + 0.2], t, 21, 34, {0}, title="Python: and und or gehen nicht")
        a_ = ap(t, c3 + 1.8, 0.5)
        d.rounded_rectangle((86, 598 + dy, 1194, 658 + dy), 10, fill=mix(WHITE, LIGHTR, a_), outline=mix(WHITE, RED, a_), width=2)
        ln1 = FEHLER; font = M(18)
        if font.getlength(ln1) > 1080:
            cut = ln1.rfind(" ", 0, 100); l1, l2 = ln1[:cut], ln1[cut + 1:]
        else: l1, l2 = ln1, ""
        T2(d, 100, 614 + dy, l1, font, mix(WHITE, RED, a_), "lm")
        if l2: T2(d, 100, 642 + dy, l2, font, mix(WHITE, RED, a_), "lm")
    f.el(show(t, c3 + 0.0), e, dy=dyf(t, c3 + 0.0))

# ---------------------------------------------------------------- 4 groupby
def sc4(f, t, ct):
    heading(f, t, "groupby: aufteilen, anwenden, zusammenführen")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    CODE4 = ['df.groupby("maschine")["durchmesser_mm"].mean()', 'df.groupby("maschine")["durchmesser_mm"].agg(["mean", "std", "count"])']
    times = [c1 + 0.2, c2 + 0.2]
    hl = hl_sched(t, [(0, None), (c1, {0}), (c2, {1})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 106 + dy, 1160, CODE4, [1, 2], times, t, 20, 30, hl, title="Python"))
    XS = [60, 470, 880]; YC = 250; HC = 264
    heads = ["1  aufteilen", "2  anwenden: mean", "3  zusammenführen"]
    tins = [c0 + 0.9, c0 + 2.2, c0 + 3.6]
    for k, (x, h, tin) in enumerate(zip(XS, heads, tins)):
        def card_(d, dy, x=x, h=h, k=k):
            card(d, x, YC + dy, 340, HC); T2(d, x + 24, YC + 10 + dy, h, F(26, 700), RED, "la")
        f.el(show(t, tin), card_, dy=dyf(t, tin))
    def s1(d, dy):
        idx = [0, 1, 2, 125, 126, 127]; rows = [[r[0], r[2], r[5]] for r in df_rows(idx)]
        fills = {(i, j): (LIGHTB if i < 3 else LIGHTR) for i in range(6) for j in range(3)}
        table(d, 60 + 20, YC + 52 + dy, [40, 100, 160], ["", "maschine", "durchmesser_mm"], rows, size=16, rh=28, cell_fill=fills)
    f.el(show(t, c0 + 1.0), s1, dy=dyf(t, c0 + 1.0))
    def s2(d, dy):
        for k, (m, col, fl, mu) in enumerate((("D1", BLUE, LIGHTB, MU1), ("D2", RED, LIGHTR, MU2))):
            y = YC + 56 + k * 100
            d.rounded_rectangle((494, y + dy, 786, y + 84 + dy), 12, fill=fl, outline=col, width=2)
            T2(d, 512, y + 24 + dy, f"Gruppe {m}", F(24, 700), col, "lm"); T2(d, 512, y + 58 + dy, f"mean = {dk(mu)}", M(24, True), DARK, "lm")
    f.el(show(t, c1 + 0.3), s2, dy=dyf(t, c1 + 0.3))
    def s3(d, dy):
        lines = ["maschine", f"D1    {MU1:.6f}", f"D2    {MU2:.6f}", "(Series mit zwei Werten)"]
        d.rounded_rectangle((904, YC + 56 + dy, 1196, YC + 220 + dy), 10, fill=BOX2)
        fs = M(17)
        for k, ln in enumerate(lines):
            fit(ln, fs, 270, "Ergebnis"); T2(d, 916, YC + 76 + k * 30 + dy, ln, fs, CODE_T if k in (1, 2) else CODE_C, "lm")
    f.el(show(t, c1 + 1.4), s3, dy=dyf(t, c1 + 1.4))
    for k, tin in enumerate((c0 + 2.2, c0 + 3.6)):
        f.el(show(t, tin), lambda d, dy, k=k: arrow(d, XS[k] + 346, YC + 135, XS[k + 1] - 6, YC + 135, GREY, 5, 14))
    out_panel(f, t, c2 + 0.3, 60, 526, 620, 150, AGG, [c2 + 0.8 + 0.35 * k for k in range(len(AGG))], 20, 26)
    def kz(d, dy):
        T2(d, 700, 546 + dy, "agg mit Liste: mehrere Kennzahlen", F(24, 700), DARK, "la")
        for k, (s, col) in enumerate((("mean", BLUE), ("std", GREEN), ("count", AMB))):
            chip(d, 700 + k * 170, 590 + dy, 150, 46, s, LIGHTK, col, 26, mono=True)
    f.el(show(t, c2 + 1.4), kz, dy=dyf(t, c2 + 1.4))

# ---------------------------------------------------------------- 5 neue Spalte
KEN = DF.groupby("maschine")["durchmesser_mm"].agg(["mean", "std", "count"])
CP = {m: (OSG - USG) / (6 * KEN.at[m, "std"]) for m in ("D1", "D2")}
def sc5(f, t, ct):
    heading(f, t, "Neue Spalte: eine Formel, alle Zeilen")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    lines = CODE[15:19]; nums = list(range(16, 20))
    times = [c0 + 0.2, c2 + 0.2, c2 + 0.2 + len(lines[1]) / 55 + 0.2, c2 + 0.2 + (len(lines[1]) + len(lines[2])) / 55 + 0.4]
    hl = hl_sched(t, [(0, None), (c0, {0}), (c1, {0}), (c2, {1, 2, 3})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 106 + dy, 1160, lines, nums, times, t, 20, 30, hl))
    def left(d, dy):
        card(d, 60, 316 + dy, 560, 356)
        T2(d, 86, 326 + dy, "kennwerte", F(26, 700), RED, "la")
        cpshow = t >= c0 + 1.8
        hdr = ["maschine", "mean", "std", "count"] + (["Cp"] if cpshow else [""])
        rows = [[m, f"{KEN.at[m, 'mean']:.4f}", f"{KEN.at[m, 'std']:.4f}", str(int(KEN.at[m, 'count']))] + ([f"{CP[m]:.4f}"] if cpshow else [""]) for m in ("D1", "D2")]
        hlc = {2} if (c1 <= t < c2) else ({4} if cpshow else set())
        w = [96, 104, 96, 80, 100]
        table(d, 86, 372 + dy, w, hdr, rows, size=20, rh=40, hl_cols=hlc, idx_col=False)
        if cpshow:
            T2(d, 86, 372 + 40 * 3 + 20 + dy, "Cp = (OSG − USG) / (6 · std)", F(24, 700), DARK, "la")
            T2(d, 86, 372 + 40 * 3 + 56 + dy, "für beide Zeilen in einem Schritt", F(22, 600), GREY, "la")
        if c1 <= t < c2: tag(d, 86, 372 + 40 * 3 + 100 + dy, 400, 40, "kennwerte[\"std\"]: ganze Spalte", LIGHTR, RED, 21, 700, outl=RED)
    f.el(show(t, c0 + 0.5), left, dy=dyf(t, c0 + 0.5))
    def right(d, dy):
        card(d, 650, 316 + dy, 570, 356)
        T2(d, 676, 326 + dy, "min mit axis=1", F(26, 700), RED, "la")
        ob = {m: OSG - KEN.at[m, "mean"] for m in ("D1", "D2")}; un = {m: KEN.at[m, "mean"] - USG for m in ("D1", "D2")}
        rows = [[m, f"{ob[m]:.4f}", f"{un[m]:.4f}", f"{min(ob[m], un[m]):.4f}"] for m in ("D1", "D2")]
        w = [76, 140, 140, 130]
        table(d, 676, 372 + dy, w, ["", "bis_oben", "bis_unten", "min"], rows, size=20, rh=40, hl_cols={3}, idx_col=False)
        a = ap(t, c2 + 2.2, 0.5)
        if a > 0:
            for k in range(2):
                y = 372 + 40 * (k + 1) + 20 + dy
                arrow(d, 676 + 76 + 24, y + 0, 676 + 76 + 140 + 140 - 12, y, mix(WHITE, GREEN, a), 4, 12) if False else None
            T2(d, 676, 372 + 40 * 3 + 20 + dy, "axis=1: je Zeile über die Spalten", F(23, 700), mix(WHITE, GREEN, a), "la")
            T2(d, 676, 372 + 40 * 3 + 56 + dy, "(axis=0 wäre: je Spalte)", F(21, 600), mix(WHITE, GREY, a), "la")
            T2(d, 676, 372 + 40 * 3 + 100 + dy, "dann geteilt durch 3 · std ergibt Cpk", F(23, 700), mix(WHITE, DARK, a), "la")
    f.el(show(t, c2 + 1.2), right, dy=dyf(t, c2 + 1.2))
    def pf(d, dy):
        for k in range(2):
            y = 372 + 40 * (k + 1) + 20 + dy
            arrow(d, 676 + 76 + 200 - 90, y, 676 + 76 + 140 + 140 + 20, y, GREEN, 4, 12) if False else None
    f.el(1, pf)

# ---------------------------------------------------------------- 6 Merkkarte
def sc6(f, t, ct):
    heading(f, t, "Merkkarte pandas")
    c0, c1, c2 = ct(0), ct(1), ct(2)
    cards = [("1  Spalte = Series", 'df["durchmesser_mm"]', LIGHTB, BLUE, c0 + 0.2, "eine Spalte mit Index, nicht die ganze Tabelle"),
             ("2  Filter = Maske", 'df[df["schicht"] == "Spät"]', LIGHTG, GREEN, c0 + 2.6, "Maske: Wahr oder Falsch je Zeile"),
             ("3  Bedingungen: & und |", '(a > 1) & (b < 2)', LIGHTA, AMB, c1 + 0.2, "Jede Bedingung in Klammern, nie and oder or"),
             ("4  groupby", 'df.groupby("maschine")["x"].mean()', LIGHTR, RED, c1 + 4.0, "aufteilen, Spalte wählen, rechnen")]
    for k, (ttl, code, fl, col, tin, note) in enumerate(cards):
        x = 60 + (k % 2) * 590; y = 112 + (k // 2) * 232
        def cd(d, dy, x=x, y=y, ttl=ttl, code=code, fl=fl, col=col, note=note):
            card(d, x, y + dy, 570, 214); T2(d, x + 26, y + 12 + dy, ttl, F(30, 700), col, "la")
            fit(code, M(20, True), 510, "Merkkarte"); chip(d, x + 26, y + 70 + dy, 520, 50, code, fl, col, 20, mono=True)
            if note: T2(d, x + 26, y + 140 + dy, note, F(22, 700), DARK, "la")
        f.el(show(t, tin), cd, dy=dyf(t, tin))
    f.el(show(t, c2 + 0.2), lambda d, dy: tag(d, 60, 590 + dy, 780, 56, "Erst die Daten ansehen, dann rechnen", RED, WHITE, 30), dy=dyf(t, c2 + 0.2))
    f.el(show(t, c2 + 3.4), lambda d, dy: tag(d, 870, 590 + dy, 350, 56, "Im Labor ausprobieren", DARK, WHITE, 26), dy=dyf(t, c2 + 3.4))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V15 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "pandas", F(104, 700), DARK)
        T2(d, 90, 300, "Der Werkzeugkasten für Messdaten", F(44, 400), GREY)
        code_n(d, 90, 400, 600, ['df = pd.read_csv("wellen.csv")', 'df.groupby("maschine")["durchmesser_mm"]', '  .mean()'], [1, 2, 3], [-1] * 3, 9, 22, 36, {0}, title="Python")
        table(d, 730, 410, [34, 92, 78, 60, 40, 148], DF_HEAD, df_rows([0, 1, 2]), size=16, rh=34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
