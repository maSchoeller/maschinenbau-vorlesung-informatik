"""V12-Hilfen: baut auf common/core.py auf. Vertonung strikt nacheinander (nur sprechen.tts), PRUEFEN-Bericht, Pruefung, Tabellen."""
import os, sys, io, contextlib, time
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "common"))
from core import *
from pages import page_scene, O
import sprechen as SP
import core as _core
_core.KW |= {"try", "except", "raise", "assert", "as"}

# Manuelle Satzgrenzen (Sekunden im Audio), wo die Pausenerkennung daneben liegt
MANUAL = {}
_orig_bt = _core.build_timeline
def build_timeline(vdir, secs):
    tl = _orig_bt(vdir, secs)
    for i, ch in MANUAL.items():
        if i in tl and len(ch) == len(secs[i - 1]): tl[i]["chunks"] = [(LEAD + a, LEAD + b) for a, b in ch]
    return tl
_core.build_timeline = build_timeline

def make_secs(src):
    return [[(SP.anzeige(s), SP.sprechfassung(s)) for s in sents] for sents in src]
def spoken(secs, i): return " ".join(sp for _, sp in secs[i - 1])

def text_report(src):
    tot = 0; ph = 0
    for i, sec in enumerate(src, 1):
        roh = " ".join(sec); sp = SP.sprechfassung(roh); tot += len(sp)
        print(f"s{i} ({len(sp)} Z., {len(sp.split())} W.): {sp}")
        for h in SP.pruefen(roh): print("  PRUEFEN:", h); ph += 1
        print()
    print("Zeichen gesamt", tot, "PRUEFEN-Hinweise", ph)

def tts_all(vdir, src):
    """Strikt nacheinander; bei 429/Fehlern warten und wiederholen; vorhandene, textgleiche Audios werden uebersprungen."""
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True)
    for i, sec in enumerate(src, 1):
        roh = " ".join(sec); ziel = os.path.join(ad, f"s{i}.mp3"); st = os.path.join(ad, f"s{i}.sprech.txt")
        if os.path.exists(ziel) and os.path.exists(st) and open(st, encoding="utf-8").read() == SP.sprechfassung(roh):
            print("vorhanden", i, flush=True); continue
        try:
            SP.tts(roh, ziel); print("erzeugt", i, len(SP.sprechfassung(roh)), "Zeichen", flush=True)
        except RuntimeError as e:   # Credits knapp: nie wiederholen, sofort abbrechen
            raise SystemExit(f"TTS Abbruch bei Szene {i}: {str(e)[:200]}")

def run(code, stdin=None):
    buf = io.StringIO(); feed = iter(stdin or [])
    def fake_input(p=""):
        v = next(feed); print(p + v); return v
    with contextlib.redirect_stdout(buf): exec(code, {"input": fake_input})
    return buf.getvalue().splitlines()

def fit_check(lines, font, maxw, what=""):
    for ln in lines:
        w = font.getlength(ln); assert w <= maxw, f"{what}: zu breit ({w:.0f} > {maxw}): {ln}"

def T2(d, x, y, s, font, fill=DARK, anchor="la"):
    w = font.getlength(s); a = anchor[0]
    left = x if a == "l" else (x - w / 2 if a == "m" else x - w)
    assert 24 <= left and left + w <= 1256, f"Text laeuft aus dem Bild: {s!r} ({left:.0f}..{left+w:.0f})"
    T(d, x, y, s, font, fill, anchor)

def scan(vdir, secs, scenes, label, step=0.5):
    tl = build_timeline(vdir, secs); n = 0; gt = 0.0
    while gt < tl["total"]:
        render_frame(gt, tl, scenes, label); gt += step; n += 1
    print("scan ok:", n, "Bilder, Gesamtdauer", round(tl["total"], 1))

def timeline(vdir, secs):
    tl = build_timeline(vdir, secs)
    for i in range(1, tl["n"] + 1):
        print(i, "start", round(tl[i]["start"], 1), "len", round(tl[i]["len"], 1), "Saetze", [(round(a, 1), round(b, 1)) for a, b in tl[i]["chunks"]])
    print("gesamt", round(tl["total"], 1))

def dispatch(vdir, src, secs, scenes, label, poster_fn, name):
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "text": text_report(src)
    elif mode == "tts": tts_all(vdir, src)
    elif mode == "zeiten": timeline(vdir, secs)
    elif mode == "scan": scan(vdir, secs, scenes, label)
    else: main(vdir, secs, scenes, label, poster_fn, name)

# ------------------------------------------------------------ Bausteine
def arrow(d, x0, y0, x1, y1, col=DARK, w=4, head=12):
    import math
    d.line((x0, y0, x1, y1), fill=col, width=w)
    a = math.atan2(y1 - y0, x1 - x0)
    d.polygon([(x1, y1), (x1 - head * math.cos(a - 0.45), y1 - head * math.sin(a - 0.45)), (x1 - head * math.cos(a + 0.45), y1 - head * math.sin(a + 0.45))], fill=col)

def grid(d, x, y, widths, header, rows, t, row_t, size=22, rh=40, new_hl=True, colors=None):
    """Tabelle: Kopfzeile + Zeilen, die ab row_t[i] erscheinen; die neueste Zeile ist hervorgehoben. colors: {(zeile, spalte): Farbe}."""
    colors = colors or {}; f = F(size, 600); fb = F(size, 700)
    xx = x
    for w, h in zip(widths, header):
        d.rectangle((xx, y, xx + w, y + rh), fill=DARK); T2(d, xx + w / 2, y + rh / 2, h, fb, WHITE, "mm"); xx += w
    vis = [i for i, r in enumerate(rows) if t >= row_t[i]]; last = vis[-1] if vis else -1
    for i in vis:
        yy = y + rh * (i + 1); xx = x
        for j, (w, c) in enumerate(zip(widths, rows[i])):
            fill = (255, 232, 235) if (new_hl and i == last) else WHITE
            d.rectangle((xx, yy, xx + w, yy + rh), fill=fill, outline=LINE)
            T2(d, xx + w / 2, yy + rh / 2, c, f, colors.get((i, j), DARK), "mm"); xx += w
    return y + rh * (len(rows) + 1)

def hl_at(t, sched):
    """sched: [(zeit, set_oder_None)] aufsteigend -> aktuelle Markierung."""
    cur = None
    for z, h in sched:
        if t >= z: cur = h
    return cur

def code_box(f, t, code, x, y, w, size, lh, hl=None, times=None, dim=True, cps=55, alpha_t=0.0):
    times = times if times is not None else [-1] * len(code)
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_panel(d, x, y + dy, w, code, times, t, size, cps, hl=hl, dim_others=dim, lh=lh, title="Python"))

def seq_times(code, idxs, start, cps=55, gap=0.15):
    tm = [1e9] * len(code); c = start
    for i in idxs:
        tm[i] = c; c += len(code[i]) / cps + gap
    return tm

def tile(f, t, tin, x, y, w, h, big, small, col=DARK, tout=None, bigsize=28):
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    def fn(d, dy):
        card(d, x, y + dy, w, h)
        T2(d, x + 28, y + 10 + dy, big, F(bigsize, 700), col)
        yy = y + 10 + bigsize + 14 + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 23
            while F(sz, 400).getlength(ln) > w - 50 and sz > 16: sz -= 1
            T2(d, x + 28, yy, ln, F(sz, 400), GREY); yy += 28
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

# ------------------------------------------------------------ Diagramm
class Plot:
    def __init__(s, box, xr, yr): s.x0, s.y0, s.x1, s.y1 = box; s.xr = xr; s.yr = yr
    def px(s, x): return s.x0 + (x - s.xr[0]) / (s.xr[1] - s.xr[0]) * (s.x1 - s.x0)
    def py(s, y): return s.y1 - (y - s.yr[0]) / (s.yr[1] - s.yr[0]) * (s.y1 - s.y0)
    def axes(s, d, dy, xticks, yticks, xlab, ylab, xfmt=lambda v: f"{v:g}", yfmt=lambda v: f"{v:g}", zero_x=None):
        for v in yticks:
            y = s.py(v) + dy; d.line((s.x0, y, s.x1, y), fill=LINE, width=1); T2(d, s.x0 - 10, y, yfmt(v), F(19, 400), GREY, "rm")
        for v in xticks:
            x = s.px(v); d.line((x, s.y0 + dy, x, s.y1 + dy), fill=LINE, width=1); T2(d, x, s.y1 + 8 + dy, xfmt(v), F(19, 400), GREY, "ma")
        d.line((s.x0, s.y1 + dy, s.x1, s.y1 + dy), fill=DARK, width=3)
        d.line((s.x0, s.y0 + dy, s.x0, s.y1 + dy), fill=DARK, width=3)
        T2(d, s.x1, s.y1 + 34 + dy, xlab, F(21, 600), GREY, "ra"); T2(d, s.x0, s.y0 - 26 + dy, ylab, F(21, 600), GREY, "la")
    def hline(s, d, dy, y, col, label=None, dash=True, lx=None, w=3):
        yy = s.py(y) + dy; x = s.x0
        while x < s.x1:
            d.line((x, yy, min(x + (12 if dash else 9999), s.x1), yy), fill=col, width=w); x += 20 if dash else 9999
        if label: T2(d, lx if lx is not None else s.x1, yy - 30, label, F(22, 700), col, "ra")

def box_cell(d, x, y, w, h, label, value, col=DARK, vsize=40, fill=WHITE):
    d.rounded_rectangle((x, y, x + w, y + h), 12, fill=fill, outline=LINE, width=2)
    T2(d, x + w / 2, y + 8, label, F(21, 600), GREY, "ma")
    T2(d, x + w / 2, y + h - 12, value, F(vsize, 700), col, "ms")

def pill(f, t, tin, x, y, w, h, text, fill=RED, size=28, col=WHITE):
    def fn(d, dy):
        d.rounded_rectangle((x, y + dy, x + w, y + h + dy), h // 2, fill=fill)
        T2(d, x + w / 2, y + h / 2 + dy, text, F(size, 700), col, "mm")
    f.el(ap(t, tin, 0.5), fn, dy=int((1 - ap(t, tin, 0.5)) * 12))

def numline(d, x, y, vals, selected, cw=50, gap=4, stop=None, start=None, size=24):
    for k, v in enumerate(vals):
        xx = x + k * (cw + gap); sel = v in selected
        fill = GREEN if sel else WHITE; tc = WHITE if sel else DARK
        outl = LINE
        if stop is not None and v == stop: outl = RED
        d.rounded_rectangle((xx, y, xx + cw, y + cw), 8, fill=fill, outline=outl, width=4 if outl == RED else 2)
        T2(d, xx + cw / 2, y + cw / 2, str(v), F(size, 700), tc if outl != RED else RED, "mm")

# ------------------------------------------------------------ V12: gemeinsame Bausteine der drei Videos
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
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

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def cross(d, cx, cy, r, col=RED, w=4):
    d.line((cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5), fill=col, width=w)
    d.line((cx - r * 0.5, cy + r * 0.5, cx + r * 0.5, cy - r * 0.5), fill=col, width=w)

def chip_w(txt, size, pad=22): return int(F(size, 700).getlength(txt)) + 2 * pad
def chip(d, x, y, w, h, txt, fill, col, size=30, outl=None):
    fit(txt, F(size, 700), w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, F(size, 700), col, "mm")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def okmark(d, cx, cy, r=17, col=GREEN):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col); tick(d, cx, cy, r * 1.1, WHITE, 4)
def nomark(d, cx, cy, r=17, col=RED):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col); cross(d, cx, cy, r * 1.2, WHITE, 4)

def tile2(f, t, tin, x, y, w, h, big, small, col=DARK, tout=None, bigsize=28):
    """Wie tile(), aber die grosse Zeile wird bei Bedarf verkleinert (Mindestgroesse 20)."""
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    bs = bigsize
    while F(bs, 700).getlength(big) > w - 50 and bs > 20: bs -= 1
    fit(big, F(bs, 700), w - 50, "Kachel")
    def fn(d, dy):
        card(d, x, y + dy, w, h)
        T2(d, x + 28, y + 10 + dy, big, F(bs, 700), col)
        yy = y + 10 + bs + 14 + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 23
            while F(sz, 400).getlength(ln) > w - 50 and sz > 18: sz -= 1
            fit(ln, F(sz, 400), w - 50, "Kachel")
            T2(d, x + 28, yy, ln, F(sz, 400), GREY); yy += 28
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

def code_seg(d, x, y, w, lines, first, t, times=None, size=24, lh=None, hl=None, dim=False, cps=60, title="Python", red=None, hlfill=None, hlbar=None):
    """Code-Kasten mit Zeilennummern ab 'first' (tatsaechliche Dateizeilen). red: Menge von Indizes mit roter Markierung. Gibt die Hoehe zurueck."""
    f = M(size); lh = lh or int(size * 1.45); top = 18 + (32 if title else 0)
    times = times if times is not None else [-1] * len(lines)
    h = top + lh * len(lines) + 18
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX)
    if title: T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    hl = hl or set(); red = red or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        assert x + 62 + f.getlength(ln) <= x + w - 8, f"Code zu breit: {ln}"
        if i in hl or i in red:
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=(96, 36, 44) if i in red else (hlfill or HLBG))
            d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 3), fill=(hlbar or RED))
        dm = 0.4 if (dim and (hl or red) and i not in hl and i not in red) else 1.0
        if n > 0: d.text((x + 20, yy), f"{first + i:>2}", font=f, fill=mix(BOX, CODE_C, dm * 0.8))
        draw_segs(d, x + 62, yy, highlight(ln), f, n, dm)
    return h

def code_box12(f, t, lines, first, x, y, w, size, lh, hl=None, red=None, times=None, dim=False, cps=60, alpha_t=0.0, title="Python", hlfill=None, hlbar=None):
    times = times if times is not None else [-1] * len(lines)
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_seg(d, x, y + dy, w, lines, first, t, times, size, lh, hl, dim, cps, title, red, hlfill, hlbar))
    return 18 + (32 if title else 0) + lh * len(lines) + 18

def seq(n, start, step, first_idx=0):
    """Schreibzeiten: Zeile k erscheint ab start + k*step."""
    return [start + step * k for k in range(n)]

# Zahlenstrahl mit den Bereichen der Lagertemperatur (nicht massstaeblich: die vier Grenzen sind gleich weit auseinander)
ZB = [90, 240, 560, 720, 1040, 1190]       # Zonengrenzen in Pixeln (x)
ZNAMEN = ["Sensorfehler", "normal", "Warnung", "abschalten", "Sensorfehler"]
ZCOL = [(LIGHTR, RED), (LIGHTG, GREEN), (LIGHTA, AMB), (LIGHTR, RED), (LIGHTR, RED)]
GRENZ = {-40: ZB[1], 70: ZB[2], 85: ZB[3], 200: ZB[4]}
def zx(v):
    """x-Position eines Testwerts auf dem (nicht massstaeblichen) Zahlenstrahl: Grenzwerte +/- 30 px, typische Werte mittig im Bereich."""
    if v == 20: return (ZB[1] + ZB[2]) // 2
    if v == 69.9: return GRENZ[70] - 30
    if v == -40.1: return GRENZ[-40] - 30
    if v == 85.1: return GRENZ[85] + 30
    if v == 200.1: return GRENZ[200] + 30
    if v == 85: return GRENZ[85] - 30
    if v == 200: return GRENZ[200] - 30
    if v == 70: return GRENZ[70] + 30
    if v == -40: return GRENZ[-40] + 30
    raise KeyError(v)

def zonen(d, y, h=64, nsize=24, grenzen_y=None, alpha=1.0):
    for k, nm in enumerate(ZNAMEN):
        x0, x1 = ZB[k], ZB[k + 1]; fill, col = ZCOL[k]
        d.rectangle((x0, y, x1, y + h), fill=fill, outline=mix(WHITE, col, 0.6), width=2)
        fit(nm, F(nsize, 700), x1 - x0 - 8, "Zone"); T2(d, (x0 + x1) / 2, y + int(h * 0.3), nm, F(nsize, 700), col, "mm")
    for g in (1, 2, 3, 4):
        d.line((ZB[g], y - 8, ZB[g], y + h + 8), fill=DARK, width=3)
    labs = {1: "−40", 2: "70", 3: "85", 4: "200"}
    for g, s in labs.items():
        T2(d, ZB[g], y + h + 14, s, F(26, 700), DARK, "ma")

def zpunkt(d, x, y, col=GREEN, r=11):
    d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=WHITE, width=3)

def zlabel(d, x, y, s, col=DARK, size=22, anchor="mm"):
    T2(d, x, y, s, F(size, 700), col, anchor)
