"""V18-Hilfen: baut auf common/core.py auf. Vertonung strikt nacheinander (nur sprechen.tts), PRUEFEN-Bericht, Pruefung, Tabellen."""
import os, sys, io, contextlib, time
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "common"))
from core import *
from pages import page_scene, O
import sprechen as SP
import core as _core
_core.KW |= {"try", "except", "raise", "with", "as", "break"}

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

# ------------------------------------------------------------ Ohne Audio pruefen (V18: nicht vertont, keine Credits)
# Fehlt audio/sN.mp3, schaetzt die Zeitleiste die Dauer aus der Sprechfassung (ca. 14 Zeichen je Sekunde)
# und verteilt die Saetze proportional. So lassen sich Standbilder und der Bild-Scan schon vor der Vertonung pruefen.
ZEICHEN_JE_S = 14.0
_bt_audio = _core.build_timeline
def build_timeline(vdir, secs):
    if all(os.path.exists(os.path.join(vdir, "audio", f"s{i}.mp3")) for i in range(1, len(secs) + 1)):
        return _bt_audio(vdir, secs)
    tl = {}; cur = 0.0
    for i, sents in enumerate(secs, 1):
        ws = [len(sp) for _, sp in sents]; d = sum(ws) / ZEICHEN_JE_S + 0.3 * (len(ws) - 1)
        L = LEAD + d + (TAIL if i == len(secs) else GAP); c = 0.05; b = []
        for w in ws:
            seg = (d - 0.1) * w / sum(ws); b.append((c, c + seg)); c += seg
        tl[i] = dict(start=cur, len=L, audio=cur + LEAD, d=d, chunks=[(LEAD + a, LEAD + e) for a, e in b])
        cur += L
    tl["total"] = cur; tl["n"] = len(secs); tl["geschaetzt"] = True
    return tl
_core.build_timeline = build_timeline

def probe(vdir, secs, scenes, label, poster_fn):
    """Ohne Audio: Poster, je Szene drei Standbilder (Anfang, Mitte, Ende) nach out/ und Scan aller 0,5 s (prueft, dass kein Text aus dem Bild laeuft)."""
    O_ = os.path.join(vdir, "out"); os.makedirs(O_, exist_ok=True)
    tl = build_timeline(vdir, secs)
    poster_fn(os.path.join(O_, "poster.png"))
    for i in range(1, tl["n"] + 1):
        s = tl[i]
        for k, frac in enumerate((0.25, 0.6, 0.97)):
            render_frame(s["start"] + s["len"] * frac, tl, scenes, label).save(os.path.join(O_, f"probe_s{i}_{k}.png"))
    scan(vdir, secs, scenes, label)
    print("probe ok, geschaetzte Dauer", round(tl["total"], 1), "s" if tl.get("geschaetzt") else "s (mit Audio)")

def dispatch(vdir, src, secs, scenes, label, poster_fn, name):
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "text": text_report(src)
    elif mode == "tts": tts_all(vdir, src)
    elif mode == "zeiten": timeline(vdir, secs)
    elif mode == "scan": scan(vdir, secs, scenes, label)
    elif mode == "probe": probe(vdir, secs, scenes, label, poster_fn)
    else:
        if not all(os.path.exists(os.path.join(vdir, "audio", f"s{i}.mp3")) for i in range(1, len(secs) + 1)) and mode in ("full", "mux"):
            raise SystemExit("Audio fehlt: erst 'python render.py tts' (Credits pruefen!), dann 'full'.")
        main(vdir, secs, scenes, label, poster_fn, name)

# ------------------------------------------------------------ V18-Zusaetze (Lexikon, gemeinsame Bausteine)
SP.lexikon_ergaenzen({
    "HTTP": "H T T P", "HTTPS": "H T T P S", "JSON": "Jason", "IP": "I P", "OT": "O T", "IT": "I T", "CRA": "C R A",
    "FZ-3": "F Z drei", "SBOM": "S Bomm", "CAD": "Kät", "NC": "E N C", "DSGVO": "D S G V O", "CSIRT": "Sie Sört", "ENISA": "Enisa",
    "BSI": "B S I", "SHA-256": "S H A zweihundertsechsundfünfzig", "SHA-1": "S H A eins", "MD5": "M D fünf", "CRC": "C R C",
    "D2": "D zwei", "F1": "F eins", "R1": "R eins", "M1": "M eins", "SPS": "S P S", "OK": "Okay",
})
_core.BI |= {"hashlib", "open", "bytes", "len", "print", "type"}
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214); LIGHTK = (238, 239, 242)
BLUE = (37, 99, 235); AMB = (176, 110, 0)
from sprech18 import hexsp

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
def cross(d, cx, cy, r, col=WHITE, w=4):
    d.line((cx - r * 0.45, cy - r * 0.45, cx + r * 0.45, cy + r * 0.45), fill=col, width=w); d.line((cx - r * 0.45, cy + r * 0.45, cx + r * 0.45, cy - r * 0.45), fill=col, width=w)
def badge(d, cx, cy, r, ok):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=GREEN if ok else RED)
    (tick if ok else cross)(d, cx, cy, r * 1.1, WHITE, 4)

def devbox(d, x, y, w, h, title, sub, col=DARK, fill=WHITE, outl=LINE, tsize=26, ssize=22, lw=2, subfont=None):
    """Geraetekasten: Titel fett, darunter Untertitel (z. B. IP)."""
    d.rounded_rectangle((x, y, x + w, y + h), 12, fill=fill, outline=outl, width=lw)
    T2(d, x + w / 2, y + h * 0.33, title, F(tsize, 700), col, "mm")
    T2(d, x + w / 2, y + h * 0.7, sub, subfont or M(ssize), GREY if col == DARK else col, "mm")

def code_n(d, x, y, w, lines, nums, times, t, size, lh, hl=None, cps=55, title="Python"):
    """Code-Panel mit echten Zeilennummern (nums; None = keine). Gibt die Hoehe zurueck."""
    f = M(size); top = 18 + 32; h = top + lh * len(lines) + 18; off = 62 if nums else 24
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    hl = hl or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        if i in hl:
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=HLBG); d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 3), fill=RED)
        dim = 0.4 if (hl and i not in hl) else 1.0
        if n > 0 and nums: d.text((x + 20, yy), f"{nums[i]:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        fit(ln, f, w - off - 12, f"Code Zeile {nums[i] if nums else i + 1}")
        draw_segs(d, x + off, yy, highlight(ln), f, n, dim)
    return h

def seq(n, start, step=0.45, first=0.0):
    """Startzeiten fuer n Zeilen: nacheinander ab start."""
    return [start + first + k * step for k in range(n)]

def run_code(code, mods=None):
    """Fuehrt Code aus (mit optional untergeschobenen Modulen) und liefert die Ausgabezeilen."""
    import io as _io, contextlib as _cl
    old = {}
    for k, v in (mods or {}).items(): old[k] = sys.modules.get(k); sys.modules[k] = v
    buf = _io.StringIO()
    try:
        with _cl.redirect_stdout(buf): exec(code, {"__name__": "__main__"})
    finally:
        for k, v in old.items():
            if v is None: sys.modules.pop(k, None)
            else: sys.modules[k] = v
    return buf.getvalue().splitlines()

