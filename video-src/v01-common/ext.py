"""Erweiterungen fuer die V01-Videos (eigener Ordner; common/ bleibt unveraendert)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "common"))
from core import *
from pages import page_scene, O

def wrap(s, size, wt, maxw):
    words = s.split(); lines = []; cur = ""
    for w in words:
        t = (cur + " " + w).strip()
        if F(size, wt).getlength(t) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def TW(d, x, y, s, size, wt, maxw, fill=DARK, lh=None, anchor="la"):
    """Text mit Umbruch in Breite maxw; gibt naechstes y zurueck."""
    lh = lh or int(size * 1.25)
    for ln in wrap(s, size, wt, maxw):
        assert F(size, wt).getlength(ln) <= maxw + 1, ln
        d.text((x, y), ln, font=F(size, wt), fill=fill, anchor=anchor); y += lh
    return y

def fits_mono(txt, size, maxw):
    return M(size).getlength(txt) <= maxw

def check_pages(pages, code_size, con_size, left_w):
    """Alle Code-/Konsolenzeilen muessen in den Kasten passen (Code-Rand 62+20, Konsole 22+22)."""
    for pg in pages:
        off = 62 if pg.get("lineno", True) else 24
        for _, l in pg["code"]:
            assert fits_mono(l, code_size, left_w - off - 20), ("Code zu breit", l)
        for _, segs in pg["out"]:
            tx = "".join(s for s, _ in segs)
            assert fits_mono(tx, con_size, left_w - 44), ("Ausgabe zu breit", tx)

def pages_scene(f, t, ct, pages, code_size=24, con_size=22, **kw):
    check_pages(pages, code_size, con_size, kw.get("left_w", 760))
    page_scene(f, t, ct, pages, code_size=code_size, con_size=con_size, **kw)

def pill(d, x, y, w, h, txt, size, fill=RED, col=WHITE):
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill)
    assert F(size, 700).getlength(txt) <= w - 30, txt
    T(d, x + w / 2, y + h / 2, txt, F(size, 700), col, "mm")

def icon_head(d, cx, cy, col):
    d.ellipse((cx - 38, cy - 70, cx + 38, cy + 6), outline=col, width=7)
    d.arc((cx - 78, cy + 4, cx + 78, cy + 150), 180, 360, fill=col, width=7)
    d.line((cx - 16, cy - 36, cx - 4, cy - 22), fill=col, width=7); d.line((cx - 4, cy - 22, cx + 18, cy - 52), fill=col, width=7)
def icon_book(d, cx, cy, col):
    L = [(cx - 4, cy - 50), (cx - 70, cy - 36), (cx - 70, cy + 40), (cx - 4, cy + 54)]
    R = [(cx + 4, cy - 50), (cx + 70, cy - 36), (cx + 70, cy + 40), (cx + 4, cy + 54)]
    d.polygon(L, outline=col, width=6); d.polygon(R, outline=col, width=6)
    for k in range(4):
        y = cy - 24 + k * 16
        d.line((cx - 58, y - 2, cx - 16, y + 4), fill=col, width=4); d.line((cx + 16, y + 4, cx + 58, y - 2), fill=col, width=4)
def icon_delegate(d, cx, cy, col):
    d.line((cx - 60, cy - 10, cx - 60, cy + 54, cx + 40, cy + 54, cx + 40, cy + 14), fill=col, width=7, joint="curve")
    d.line((cx - 60, cy - 10, cx - 36, cy - 10), fill=col, width=7)
    d.line((cx - 10, cy + 20, cx + 62, cy - 52), fill=col, width=8)
    d.polygon([(cx + 70, cy - 60), (cx + 28, cy - 54), (cx + 64, cy - 18)], fill=col)
def check(d, x, y, col=GREEN, s=1.0):
    d.line((x, y + 12 * s, x + 10 * s, y + 24 * s), fill=col, width=int(6 * s)); d.line((x + 10 * s, y + 24 * s, x + 30 * s, y - 2 * s), fill=col, width=int(6 * s))
def cross(d, x, y, col=RED, s=1.0):
    d.line((x, y, x + 26 * s, y + 26 * s), fill=col, width=int(6 * s)); d.line((x + 26 * s, y, x, y + 26 * s), fill=col, width=int(6 * s))
def arrow(d, x0, y0, x1, y1, col=DARK, w=5, head=14):
    import math
    d.line((x0, y0, x1, y1), fill=col, width=w); a = math.atan2(y1 - y0, x1 - x0)
    p = [(x1, y1), (x1 - head * math.cos(a - 0.45), y1 - head * math.sin(a - 0.45)), (x1 - head * math.cos(a + 0.45), y1 - head * math.sin(a + 0.45))]
    d.polygon(p, fill=col)
