"""V15-Bausteine fuer alle drei Videos: Daten, echte Ausgaben, Code-Kasten, Tabellen, Glocke, Regelkarte."""
import os, sys, math
HERE_B = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_B)
from h15 import *
import pandas as pd

ROOT = os.path.abspath(os.path.join(HERE_B, "..", ".."))
DATA = os.path.join(ROOT, "site", "assets", "data", "v15")
BEISPIEL = os.path.join(ROOT, "briefing", "v15-beispiel.py")
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTK = (238, 239, 242); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235); AMB = (176, 110, 0)
OSG, USG = 20.020, 19.980

# ---------------------------------------------------------------- Daten (echte Messwerte)
DF = pd.read_csv(os.path.join(DATA, "wellen.csv"))
CODE = open(BEISPIEL, encoding="utf-8").read().rstrip("\n").split("\n")

def echte_ausgabe():
    """Fuehrt briefing/v15-beispiel.py im Datenordner aus und liefert die Ausgabezeilen (wie im Browser)."""
    old = os.getcwd(); os.chdir(DATA)
    try: return run(open(BEISPIEL, encoding="utf-8").read())
    finally: os.chdir(old)
AUSGABE = echte_ausgabe()

def kenn(m):
    x = DF[DF["maschine"] == m]["durchmesser_mm"]
    return float(x.mean()), float(x.std())
MU1, SG1 = kenn("D1"); MU2, SG2 = kenn("D2")
MITTEL2 = [float(v) for v in DF[DF["maschine"] == "D2"].groupby("stichprobe")["durchmesser_mm"].mean()]
_anf = DF[(DF["maschine"] == "D2") & (DF["stichprobe"] <= 15)]["durchmesser_mm"]
ANF = _anf
MITTE = float(_anf.mean()); SIGX = float(_anf.std() / 5 ** 0.5); OEG = MITTE + 3 * SIGX; UEG = MITTE - 3 * SIGX
AUS = DF[(DF["durchmesser_mm"] > OSG) | (DF["durchmesser_mm"] < USG)]
ALARM = [i + 1 for i, v in enumerate(MITTEL2) if v > OEG or v < UEG]
assert f"{MU1:.4f}" == "20.0001" and f"{SG2:.4f}" == "0.0062" and f"{MU2:.4f}" == "20.0072"
assert ALARM == [20, 24, 25] and len(AUS) == 6 and f"{OEG:.4f}" == "20.0118" and f"{UEG:.4f}" == "19.9989"
assert f"{(OSG-USG)/(6*SG1):.2f}" == "1.59" and f"{(OSG-USG)/(6*SG2):.2f}" == "1.07"
CPK1 = min(OSG - MU1, MU1 - USG) / (3 * SG1); CPK2 = min(OSG - MU2, MU2 - USG) / (3 * SG2)
assert f"{CPK1:.2f}" == "1.58" and f"{CPK2:.2f}" == "0.68"

def dk(v, n=4): return f"{v:.{n}f}".replace(".", ",")      # deutsche Dezimalzahl

# ---------------------------------------------------------------- allgemeine Zeichenhilfen
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

def polyline(d, pts, col, w=4, frac=1.0):
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L); lim = tot * frac; acc = 0
    for i, l in enumerate(L):
        if acc >= lim: break
        r = min(1.0, (lim - acc) / l) if l else 1; (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        d.line((x0, y0, x0 + (x1 - x0) * r, y0 + (y1 - y0) * r), fill=col, width=w); acc += l

def dots(d, pts, col, r=6, fill=None, w=2):
    for x, y in pts: d.ellipse((x - r, y - r, x + r, y + r), fill=fill or col, outline=col, width=w)

def vdash(d, x, y0, y1, col, w=3, on=12, off=8):
    y = y0
    while y < y1: d.line((x, y, x, min(y + on, y1)), fill=col, width=w); y += on + off

def hdash(d, x0, x1, y, col, w=3, on=12, off=8):
    x = x0
    while x < x1: d.line((x, y, min(x + on, x1), y), fill=col, width=w); x += on + off

def darrow(d, x0, x1, y, col=DARK, w=3, head=10):
    """Doppelpfeil horizontal."""
    d.line((x0, y, x1, y), fill=col, width=w)
    for xx, s in ((x0, 1), (x1, -1)): d.polygon([(xx, y), (xx + s * head, y - head * 0.55), (xx + s * head, y + head * 0.55)], fill=col)

# ---------------------------------------------------------------- Code und Ausgabe
def code_n(d, x, y, w, lines, nums, times, t, size, lh, hl=None, cps=55, title="Python (briefing/v15-beispiel.py)", err=None):
    """Code-Kasten mit echten Zeilennummern; nichts laeuft aus dem Kasten (fit). Gibt die Hoehe zurueck."""
    f = M(size); top = 18 + 32; h = top + lh * len(lines) + 18
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    hl = hl or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        if i in hl:
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=HLBG); d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 3), fill=RED)
        dim = 0.4 if (hl and i not in hl) else 1.0
        if n > 0 and nums[i] is not None: d.text((x + 20, yy), f"{nums[i]:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        fit(ln, f, w - 62 - 12, f"Code Zeile {nums[i]}: {ln}")
        draw_segs(d, x + 62, yy, highlight(ln), f, n, dim)
    return h

def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]; nums = list(range(a, b + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl))

def type_times(a, b, start, cps=55, gap=0.1, only=None):
    """Startzeiten je Codezeile a..b (1-basiert); Zeilen nacheinander getippt."""
    tm = []; c = start
    for k in range(a, b + 1):
        tm.append(c); c += max(len(CODE[k - 1]), 4) / cps + gap
    return tm

def out_panel(f, t, tin, x, y, w, h, lines, t0s, size=20, lh=None, title="Ausgabe", cols=None):
    """Konsole mit echten Ausgabezeilen; Zeile k erscheint ab t0s[k]."""
    fn_ = M(size)
    for ln in lines: fit(ln, fn_, w - 44, "Ausgabe")
    cols = cols or {}
    entries = [(t0, [(ln, cols.get(k, CODE_T))]) for k, (ln, t0) in enumerate(zip(lines, t0s))]
    f.el(show(t, tin), lambda d, dy: console_panel(d, x, y + dy, w, h, entries, t, size, title=title, lh=lh), dy=dyf(t, tin))

def hl_sched(t, sched):
    cur = None
    for z, h in sched:
        if t >= z: cur = h
    return cur

# ---------------------------------------------------------------- Tabelle (DataFrame)
def table(d, x, y, widths, header, rows, size=18, rh=34, hl_cols=(), hl_rows=(), dim_rows=(), cell_fill=None, cell_col=None, hcol=DARK, idx_col=True):
    """Tabelle; hl_cols/hl_rows hervorgehoben, dim_rows blass. cell_fill/cell_col: {(zeile, spalte): Farbe}. Gibt die untere Kante zurueck."""
    fb = F(size, 700); f = F(size, 600); xx = x; cell_fill = cell_fill or {}; cell_col = cell_col or {}
    for j, (w, h) in enumerate(zip(widths, header)):
        fit(h, fb, w - 4, "Tabellenkopf")
        d.rectangle((xx, y, xx + w, y + rh), fill=(RED if j in hl_cols else hcol)); T2(d, xx + w / 2, y + rh / 2, h, fb, WHITE, "mm"); xx += w
    for i, r in enumerate(rows):
        yy = y + rh * (i + 1); xx = x
        for j, (w, c) in enumerate(zip(widths, r)):
            fill = cell_fill.get((i, j), LIGHTR if j in hl_cols else (LIGHTG if i in hl_rows else WHITE))
            d.rectangle((xx, yy, xx + w, yy + rh), fill=fill, outline=LINE)
            col = cell_col.get((i, j), GREY if (i in dim_rows or (idx_col and j == 0)) else DARK)
            if i in dim_rows: col = mix(WHITE, col, 0.45)
            fit(str(c), f, w - 6, "Tabellenzelle"); T2(d, xx + w / 2, yy + rh / 2, str(c), f, col, "mm"); xx += w
    return y + rh * (len(rows) + 1)

def df_rows(idx):
    return [[str(i), str(DF.at[i, "stichprobe"]), DF.at[i, "maschine"], DF.at[i, "schicht"], str(DF.at[i, "teil"]), f"{DF.at[i, 'durchmesser_mm']:.4f}"] for i in idx]
DF_HEAD = ["", "stichprobe", "maschine", "schicht", "teil", "durchmesser_mm"]

# ---------------------------------------------------------------- Glocke (Normalverteilung)
def pdf(x, mu, sg): return math.exp(-0.5 * ((x - mu) / sg) ** 2) / (sg * math.sqrt(2 * math.pi))

def bell(d, P, mu, sg, col, fill=None, upto=1.0, w=4, lo=None, hi=None, fillcol=None, n=160):
    """Glockenkurve ueber der Plot-Flaeche P (x in mm, y = Dichte, yr = (0, ymax)); fillcol faerbt den Bereich lo..hi."""
    xs = [mu - 4.5 * sg + 9 * sg * k / n for k in range(n + 1)]
    pts = [(P.px(x), P.py(pdf(x, mu, sg))) for x in xs]
    if fillcol is not None:
        sel = [(P.px(x), P.py(pdf(x, mu, sg))) for x in xs if lo <= x <= hi]
        if sel: d.polygon([(sel[0][0], P.py(0))] + sel + [(sel[-1][0], P.py(0))], fill=fillcol)
    polyline(d, pts, col, w, upto)

# ---------------------------------------------------------------- Regelkarte
def regelkarte(d, P, t, t_pts, dur, t_lines, t_tol, t_alarm, labels=True):
    """Mittelwertkarte von D2 mit echten Daten; Punkte bauen sich auf, dann Mittellinie/Eingriffsgrenzen, Toleranzgrenzen, Alarmpunkte."""
    P.axes(d, 0, [1, 5, 10, 15, 20, 25], [19.98, 19.99, 20.0, 20.01, 20.02], "Stichprobe", "Stichprobenmittel in mm", yfmt=lambda v: dk(v, 3))
    n = int(25 * clamp((t - t_pts) / dur) + 0.001)
    pts = [(P.px(i + 1), P.py(v)) for i, v in enumerate(MITTEL2)]
    if n >= 2: polyline(d, pts[:n], GREY, 3)
    if t >= t_lines:
        a = ap(t, t_lines, 0.5); col = mix(WHITE, GREEN, a); colr = mix(WHITE, BLUE, a)
        d.line((P.x0, P.py(MITTE), P.px(26.3), P.py(MITTE)), fill=colr, width=3)
        hdash(d, P.x0, P.px(26.3), P.py(OEG), col, 3); hdash(d, P.x0, P.px(26.3), P.py(UEG), col, 3)
        if labels:
            T2(d, P.px(26.6), P.py(OEG) - 12, f"OEG {dk(OEG)}", F(20, 700), mix(WHITE, GREEN, a), "la")
            T2(d, P.px(26.6), P.py(UEG) - 12, f"UEG {dk(UEG)}", F(20, 700), mix(WHITE, GREEN, a), "la")
            T2(d, P.px(26.6), P.py(MITTE) - 12, f"Mittellinie {dk(MITTE)}", F(19, 700), mix(WHITE, BLUE, a), "la")
    if t_tol is not None and t >= t_tol:
        a = ap(t, t_tol, 0.5); col = mix(WHITE, RED, a)
        hdash(d, P.x0, P.px(26.3), P.py(OSG), col, 3, 6, 8); hdash(d, P.x0, P.px(26.3), P.py(USG), col, 3, 6, 8)
        T2(d, P.px(26.6), P.py(OSG) - 12, "OSG 20,020", F(20, 700), col, "la"); T2(d, P.px(26.6), P.py(USG) - 12, "USG 19,980", F(20, 700), col, "la")
    for i, (x, y) in enumerate(pts):
        if i >= n: break
        bad = (i + 1) in ALARM and t_alarm is not None and t >= t_alarm
        dots(d, [(x, y)], RED if bad else DARK, 9 if bad else 6, RED if bad else WHITE, 3)
    return pts

# ---------------------------------------------------------------- echte Ausgabe beliebiger Schnipsel (pandas laeuft wirklich)
def real(code):
    """Fuehrt code im Datenordner aus (cwd) und liefert die Ausgabezeilen; Exceptions werden als 'ValueError: ...' zurueckgegeben."""
    old = os.getcwd(); os.chdir(DATA)
    try:
        try: return run(code)
        except Exception as e: return [f"{type(e).__name__}: {e}"]
    finally: os.chdir(old)

def real_fehler(code):
    old = os.getcwd(); os.chdir(DATA)
    try:
        try: run(code)
        except Exception as e: return f"{type(e).__name__}: {e}"
        return None
    finally: os.chdir(old)

def machine_icon(d, x, y, name, col, dy=0):
    """Einfache Drehmaschine: Bett, Spindelstock mit Spannfutter, Werkstueck, Reitstock."""
    d.rounded_rectangle((x, y + 90 + dy, x + 250, y + 112 + dy), 6, fill=DARK)
    d.rounded_rectangle((x, y + 30 + dy, x + 70, y + 92 + dy), 8, fill=LIGHTK, outline=DARK, width=3)
    d.rectangle((x + 70, y + 44 + dy, x + 84, y + 78 + dy), fill=DARK)
    d.rectangle((x + 84, y + 54 + dy, x + 190, y + 68 + dy), fill=(190, 196, 206), outline=DARK, width=2)
    d.rounded_rectangle((x + 190, y + 40 + dy, x + 230, y + 92 + dy), 6, fill=LIGHTK, outline=DARK, width=3)
    d.polygon([(x + 128, y + 54 + dy), (x + 142, y + 54 + dy), (x + 135, y + 36 + dy)], fill=col)
    T2(d, x + 125, y - 18 + dy, name, F(34, 700), col, "mm")
