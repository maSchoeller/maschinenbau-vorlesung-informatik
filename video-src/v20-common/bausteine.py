"""Gemeinsame Zeichenbausteine der V20-Videos (Theorie, Python, Beispiel): Etiketten, Chips, Codefenster mit echten Zeilennummern, Flansch, Objektkarten."""
import os, sys, math
HERE_B = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_B)
from h20 import *

LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214); LIGHTK = (238, 239, 242)
BLUE = (37, 99, 235); AMB = (176, 110, 0)


def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)
def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"


def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def chip(d, x, y, w, h, txt, fill, col, size=28, outl=None, mono=False):
    font = M(size, True) if mono else F(size, 700); fit(txt, font, w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, font, col, "mm")

def chip_w(txt, size, pad=22, mono=False):
    return int((M(size, True) if mono else F(size, 700)).getlength(txt)) + 2 * pad

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def numtxt(d, x, y, txt, size, col=DARK, wt=700, anchor="la"):
    fit(txt, F(size, wt), 1256 - x, "Text"); T2(d, x, y, txt, F(size, wt), col, anchor)

def check_circle(d, x, y, r=17, fill=GREEN):
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill); tick(d, x, y, r * 1.1, WHITE, 4)


def code_n(d, x, y, w, lines, nums, times, t, size, lh, hl=None, cps=55, title="Python"):
    """Codefenster mit echten Zeilennummern (nums). Gibt die Hoehe zurueck; Zeile ausserhalb des Kastens ist ausgeschlossen (fit)."""
    f = M(size); top = 18 + 32; h = top + lh * len(lines) + 18
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
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

def code_h(n, lh): return 50 + lh * n + 18


# ---------------------------------------------------------------- Ordnerbaum
def folder_icon(d, x, y, col=AMB, fill=LIGHTA):
    d.rounded_rectangle((x, y + 4, x + 26, y + 22), 3, fill=fill, outline=col, width=2)
    d.rectangle((x, y, x + 11, y + 6), fill=fill, outline=col, width=2)

def file_icon(d, x, y, col=GREY):
    d.rectangle((x + 3, y, x + 21, y + 22), fill=WHITE, outline=col, width=2)
    d.line((x + 7, y + 8, x + 17, y + 8), fill=col, width=2); d.line((x + 7, y + 14, x + 17, y + 14), fill=col, width=2)


# ---------------------------------------------------------------- V20: Flansch, Objektkarten, Konsole
FLANSCH = dict(da=120, di=40, t=15, lk=90, n=6, db=11)         # briefing/v20-beispiel.py
ZU_GROSS = dict(da=120, di=40, t=15, lk=110, n=6, db=14)

def dashed_circle(d, cx, cy, r, col, w=2, seg=48):
    for k in range(seg):
        if k % 2: continue
        a0 = 2 * math.pi * k / seg; a1 = 2 * math.pi * (k + 1) / seg
        d.line((cx + r * math.cos(a0), cy + r * math.sin(a0), cx + r * math.cos(a1), cy + r * math.sin(a1)), fill=col, width=w)

def flange_top(d, cx, cy, s, p, bad=False, labels=False, a_lk=1.0, a_holes=1.0, a_mass=1.0):
    """Draufsicht des Flanschs; s = Pixel je mm. p: dict da, di, lk, n, db. bad: Bohrungen rot."""
    R = p["da"] / 2 * s; r = p["di"] / 2 * s
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=(214, 219, 226), outline=DARK, width=3)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=BG, outline=DARK, width=3)
    if a_lk > 0.02: dashed_circle(d, cx, cy, p["lk"] / 2 * s, mix((214, 219, 226), BLUE, a_lk), 2)
    if a_holes > 0.02:
        rb = p["db"] / 2 * s; col = RED if bad else GREEN
        for k in range(p["n"]):
            a = -math.pi / 2 + 2 * math.pi * k / p["n"]; x = cx + p["lk"] / 2 * s * math.cos(a); y = cy + p["lk"] / 2 * s * math.sin(a)
            d.ellipse((x - rb, y - rb, x + rb, y + rb), fill=BG, outline=mix((214, 219, 226), col, a_holes), width=3)

def flange_3d(d, cx, cy, s, p, ang_h=0.42, dick=None, phase=0.0, col_top=(214, 219, 226), col_side=(170, 177, 188)):
    """Schraege Ansicht (vereinfacht, kein echtes 3D): Ring mit Mittelloch und Bohrungen."""
    R = p["da"] / 2 * s; r = p["di"] / 2 * s; th = (dick if dick is not None else p["t"] * s * 1.5)
    ry = lambda v: v * ang_h
    d.ellipse((cx - R, cy + th - ry(R), cx + R, cy + th + ry(R)), fill=col_side, outline=DARK, width=3)
    d.rectangle((cx - R, cy, cx + R, cy + th), fill=col_side)
    d.line((cx - R, cy, cx - R, cy + th), fill=DARK, width=3); d.line((cx + R, cy, cx + R, cy + th), fill=DARK, width=3)
    d.ellipse((cx - R, cy - ry(R), cx + R, cy + ry(R)), fill=col_top, outline=DARK, width=3)
    d.ellipse((cx - r, cy - ry(r), cx + r, cy + ry(r)), fill=BG, outline=DARK, width=3)
    rb = p["db"] / 2 * s
    for k in range(p["n"]):
        a = phase - math.pi / 2 + 2 * math.pi * k / p["n"]; x = cx + p["lk"] / 2 * s * math.cos(a); y = cy + ry(p["lk"] / 2 * s) * math.sin(a)
        d.ellipse((x - rb, y - ry(rb), x + rb, y + ry(rb)), fill=BG, outline=DARK, width=2)

def mesh_overlay(d, cx, cy, s, p, ang_h=0.42, col=(120, 130, 146), phase=0.0):
    """Dreiecksnetz-Andeutung auf der Oberseite (Radien und Ringe)."""
    R = p["da"] / 2 * s; r = p["di"] / 2 * s; ry = lambda v: v * ang_h
    for k in range(24):
        a = phase + 2 * math.pi * k / 24
        d.line((cx + r * math.cos(a), cy + ry(r) * math.sin(a), cx + R * math.cos(a), cy + ry(R) * math.sin(a)), fill=col, width=1)
    for q in (0.45, 0.7):
        rr = r + (R - r) * q; d.ellipse((cx - rr, cy - ry(rr), cx + rr, cy + ry(rr)), outline=col, width=1)

def objcard(d, x, y, w, title, rows, hl=None, col=DARK, size=22, rh=34, fill=WHITE, vals=None):
    """Objektkarte: Titel, darunter Attribut -> Wert. hl: Menge von Zeilenindizes (rot)."""
    hl = hl or set(); h = 52 + rh * len(rows) + 12
    d.rounded_rectangle((x, y, x + w, y + h), 12, fill=fill, outline=col, width=3)
    d.rounded_rectangle((x, y, x + w, y + 44), 12, fill=col); d.rectangle((x, y + 24, x + w, y + 44), fill=col)
    T2(d, x + w / 2, y + 22, title, F(24, 700), WHITE, "mm")
    for i, (k, v) in enumerate(rows):
        yy = y + 52 + i * rh; on = i in hl
        if on: d.rounded_rectangle((x + 6, yy, x + w - 6, yy + rh - 4), 6, fill=LIGHTR)
        T2(d, x + 16, yy + rh / 2 - 2, k, M(size - 3), RED if on else GREY, "lm"); T2(d, x + w - 16, yy + rh / 2 - 2, str(v), M(size, True), RED if on else DARK, "rm")
    return h

def konsole(f, t, tin, x, y, w, zeilen, size=22, lh=34, title="Ausgabe", t_step=0.9, fail_from=None):
    """Konsole: zeilen = [(text, farbe)]; erscheinen nacheinander ab tin."""
    ents = [(tin + 0.15 + i * t_step, [(s, c)]) for i, (s, c) in enumerate(zeilen)]
    for s, c in zeilen: fit(s, M(size), w - 44, "Konsole")
    h = 46 + lh * len(zeilen) + 14
    f.el(show(t, tin), lambda d, dy: console_panel(d, x, y + dy, w, h, ents, t, size, title=title, lh=lh), dy=dyf(t, tin))
    return h
