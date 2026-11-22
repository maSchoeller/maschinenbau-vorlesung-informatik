"""Gemeinsame Zeichenbausteine der V16-Videos (Theorie, Python, Beispiel): Etiketten, Chips, Codefenster mit echten Zeilennummern,
Task-Manager-Ausschnitt, Ordnerbaum."""
import os, sys, math
HERE_B = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_B)
from h16 import *

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


# ---------------------------------------------------------------- Task-Manager
KERNE_HOOK = [100, 1, 0, 2, 0, 1, 0, 0]

def bar(d, x, y, w, h, frac, col, bg=LIGHTK):
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=bg)
    if frac > 0: d.rounded_rectangle((x, y, x + max(h, w * frac), y + h), h // 2, fill=col)

def taskmgr(f, t, x, y, w, h, tm, hot=None, kerne=KERNE_HOOK, titel="Task-Manager (Leistung)"):
    """Ausschnitt des Task-Managers. tm: Einblendzeiten {'frame','cpu','kerne','ram','net'}; hot: {'kern','ram','net': 0..1} rote Markierung."""
    hot = hot or {}
    sec = 56; tw = (w - 56 - 30) // 4; th = 50
    ycpu = y + 58; ykern = ycpu + 92; yram = ykern + 34 + 2 * th + 10 + 16; ynet = yram + 84
    assert ynet + 50 <= y + h, f"Task-Manager zu niedrig: {ynet + 50} > {y + h}"
    def frame(d, dy):
        card(d, x, y + dy, w, h)
        T2(d, x + 28, y + 14 + dy, titel, F(26, 700), DARK, "la")
    f.el(show(t, tm["frame"]), frame, dy=dyf(t, tm["frame"]))
    def cpu(d, dy):
        T2(d, x + 28, ycpu + dy, "CPU gesamt", F(22, 600), GREY, "la")
        T2(d, x + 28, ycpu + 28 + dy, "13 %", F(46, 700), DARK, "la")
        bar(d, x + 190, ycpu + 40 + dy, w - 190 - 28, 26, 0.13, BLUE)
    f.el(show(t, tm["cpu"]), cpu, dy=dyf(t, tm["cpu"]))
    def kern(d, dy):
        T2(d, x + 28, ykern + dy, "Einzelne Kerne (8)", F(22, 600), GREY, "la")
        for k, v in enumerate(kerne):
            cx = x + 28 + (k % 4) * (tw + 10); cy = ykern + 34 + (k // 4) * (th + 10) + dy
            d.rounded_rectangle((cx, cy, cx + tw, cy + th), 8, fill=WHITE, outline=LINE, width=2)
            if v > 0: d.rounded_rectangle((cx + 3, cy + th - 3 - (th - 6) * v / 100, cx + tw - 3, cy + th - 3), 5, fill=RED if v >= 90 else LIGHTB)
            T2(d, cx + tw / 2, cy + th / 2, f"{v} %", F(22, 700), WHITE if v >= 90 else DARK, "mm")
    f.el(show(t, tm["kerne"]), kern, dy=dyf(t, tm["kerne"]))
    def ram(d, dy):
        T2(d, x + 28, yram + dy, "Arbeitsspeicher", F(22, 600), GREY, "la")
        T2(d, x + w - 28, yram + dy, "15,2 von 16 GB", F(26, 700), DARK, "ra")
        bar(d, x + 28, yram + 36 + dy, w - 56, 26, 15.2 / 16, AMBER)
    f.el(show(t, tm["ram"]), ram, dy=dyf(t, tm["ram"]))
    def net(d, dy):
        chip(d, x + 28, ynet + dy, w - 56, 46, "Datei liegt auf dem Netzlaufwerk", LIGHTA, AMB, 24)
    f.el(show(t, tm["net"]), net, dy=dyf(t, tm["net"]))
    def marks(d, dy):
        for key, box in (("kern", (x + 28 - 5, ykern + 34 - 5, x + 28 + tw + 5, ykern + 34 + th + 5)),
                         ("ram", (x + 22, yram + 30, x + w - 22, yram + 68)),
                         ("net", (x + 22, ynet - 5, x + w - 22, ynet + 51))):
            a = hot.get(key, 0)
            if a > 0.01:
                col = mix(WHITE, RED, a); d.rounded_rectangle(box, 12, outline=col, width=5)
    f.el(1, marks)


# ---------------------------------------------------------------- Zahnraeder (Baugruppe)
def gear(d, cx, cy, r, z, ang, col=DARK, fill=WHITE, w=4):
    pts = []
    for k in range(z * 4):
        a = ang + k * 2 * math.pi / (z * 4); rr = r * (1.0 if k % 4 in (0, 1) else 0.84)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill, outline=col); d.line(pts + [pts[0]], fill=col, width=w)
    d.ellipse((cx - r * 0.25, cy - r * 0.25, cx + r * 0.25, cy + r * 0.25), outline=col, width=w)


# ---------------------------------------------------------------- Ordnerbaum
def folder_icon(d, x, y, col=AMB, fill=LIGHTA):
    d.rounded_rectangle((x, y + 4, x + 26, y + 22), 3, fill=fill, outline=col, width=2)
    d.rectangle((x, y, x + 11, y + 6), fill=fill, outline=col, width=2)

def file_icon(d, x, y, col=GREY):
    d.rectangle((x + 3, y, x + 21, y + 22), fill=WHITE, outline=col, width=2)
    d.line((x + 7, y + 8, x + 17, y + 8), fill=col, width=2); d.line((x + 7, y + 14, x + 17, y + 14), fill=col, width=2)
