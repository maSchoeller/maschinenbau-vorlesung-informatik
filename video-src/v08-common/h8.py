"""V08-Hilfen: baut auf common/core.py auf. Vertonung strikt nacheinander (nur sprechen.tts), PRUEFEN-Bericht, Pruefung, Tabellen."""
import os, sys, io, contextlib, time
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "common"))
from core import *
from pages import page_scene, O
import sprechen as SP

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
