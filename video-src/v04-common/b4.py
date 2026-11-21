"""V04-Hilfen: Schalter-/Stromkreisbilder, Wahrheitstabellen, Vertonung mit Wiederholung bei 429 (nur nacheinander),
Passgenauigkeits-Checks. Baut auf v02-common/h.py und common/ auf (dort nichts veraendert)."""
import os, sys, math, time, io, contextlib
HERE4 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE4, "..", "v02-common"))
from h import *
from pages import page_scene, O

GREY2 = (160, 168, 180)
LIGHT_G = (222, 244, 231); LIGHT_R = (255, 226, 229); LIGHT_A = (253, 241, 214)


# ---------------------------------------------------------------- Vertonung (strikt nacheinander, bei 429 warten)
def tts4(vdir, secs, neu=False):
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True); used = 0
    for i in range(1, len(secs) + 1):
        p = os.path.join(ad, f"s{i}.mp3"); txt = spoken(secs, i)
        if os.path.exists(p) and not neu:
            print("vorhanden", i, flush=True); continue
        for versuch in range(1, 13):
            try:
                SP.tts(txt, p, sprechfassung_anwenden=False, versuche=1); break
            except RuntimeError as e:
                if ("429" in str(e) or "HTTP 5" in str(e) or "nicht erreichbar" in str(e)) and versuch < 12:
                    print("Wartezeit (", str(e)[:60], ") Versuch", versuch, flush=True); time.sleep(20 + 10 * versuch); continue
                raise
        used += len(txt); print("erzeugt", i, len(txt), "Zeichen", flush=True)
        time.sleep(1.0)
    print("Zeichen verbraucht:", used)

def dispatch4(vdir, secs, scenes, label, poster_fn, name):
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "text": text_report(vdir, secs)
    elif mode == "tts": tts4(vdir, secs)
    elif mode == "tts-neu": tts4(vdir, secs, neu=True)
    elif mode == "scan": scan(vdir, secs, scenes, label)
    else: main(vdir, secs, scenes, label, poster_fn, name)


# ---------------------------------------------------------------- Kleinteile
def pill(d, x, y, w, h, txt, fill, tcol=WHITE, size=26, wt=700, mono=False):
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill)
    fnt = M(size, True) if mono else F(size, wt)
    T2(d, x + w / 2, y + h / 2, txt, fnt, tcol, "mm")

def cell4(d, x, y, w, h, txt, font, tcol=DARK, fill=WHITE, ol=LINE, r=8, ow=2):
    d.rounded_rectangle((x, y, x + w, y + h), r, fill=fill, outline=ol, width=ow)
    T2(d, x + w / 2, y + h / 2, txt, font, tcol, "mm")

def bit(v): return "1" if v else "0"
def bitcol(v): return GREEN if v else GREY2


# ---------------------------------------------------------------- Schalter und Stromkreise
def switch(d, x, y, closed, label=None, lcol=DARK, dy=0, w=90, nc=False):
    """Schalter mit Kontakten bei (x,y) und (x+w,y); closed: Blatt liegt auf."""
    y += dy
    if closed: d.line((x, y, x + w, y), fill=DARK, width=7)
    else: d.line((x, y, x + w - 14, y - 40), fill=DARK, width=7)
    for cx in (x, x + w): d.ellipse((cx - 7, y - 7, cx + 7, y + 7), fill=DARK, outline=WHITE, width=2)
    if label: T2(d, x + w / 2, y + 28, label, F(26, 700), lcol, "ma")

def lamp(d, cx, cy, on, r=30):
    if on:
        for k in range(8):
            a = k * math.pi / 4 + math.pi / 8
            d.line((cx + (r + 8) * math.cos(a), cy + (r + 8) * math.sin(a), cx + (r + 22) * math.cos(a), cy + (r + 22) * math.sin(a)), fill=AMBER, width=5)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 214, 90) if on else WHITE, outline=DARK, width=4)
    k = r * 0.7071
    for s in (1, -1): d.line((cx - k, cy - s * k, cx + k, cy + s * k), fill=DARK, width=4)

def source(d, cx, cy):
    d.line((cx - 26, cy - 8, cx + 26, cy - 8), fill=DARK, width=6)
    d.line((cx - 14, cy + 10, cx + 14, cy + 10), fill=DARK, width=6)
    T2(d, cx + 40, cy - 2, "Spannung", F(22, 600), GREY, "lm")

def circuit(d, kind, A, B, ox, oy, labA="A", labB="B", dy=0):
    """kind: and (Reihe), or (parallel), not (Oeffner). Rahmen 560 x 220 ab (ox, oy). Gibt lit zurueck."""
    L, R = ox, ox + 560; oy += dy; ym = oy + 70; bot = oy + 230
    lit = {"and": A and B, "or": A or B, "not": not A}[kind]
    on = GREEN if lit else GREY2; line = lambda p, c, w=6: d.line(p, fill=c, width=w)
    if kind == "and":
        sa, sb = L + 130, L + 340
        line((L, ym, sa, ym), on); line((sa + 90, ym, sb, ym), on); line((sb + 90, ym, R, ym), on)
        switch(d, sa, ym, A, f"{labA} = {bit(A)}", bitcol(A)); switch(d, sb, ym, B, f"{labB} = {bit(B)}", bitcol(B))
    elif kind == "or":
        ya, yb = oy + 10, oy + 130; j0, j1 = L + 70, R - 70; sa = L + 235
        line((L, ym, j0, ym), on); line((j1, ym, R, ym), on)
        line((j0, ya, j0, yb), on); line((j1, ya, j1, yb), on)
        line((j0, ya, sa, ya), on if A else GREY2); line((sa + 90, ya, j1, ya), on if A else GREY2)
        line((j0, yb, sa, yb), on if B else GREY2); line((sa + 90, yb, j1, yb), on if B else GREY2)
        switch(d, sa, ya, A, None); switch(d, sa, yb, B, None)
        T2(d, sa + 45, ya - 62, f"{labA} = {bit(A)}", F(26, 700), bitcol(A), "mm"); T2(d, sa + 45, yb + 32, f"{labB} = {bit(B)}", F(26, 700), bitcol(B), "ma")
    else:
        sa = L + 235
        line((L, ym, sa, ym), on); line((sa + 90, ym, R, ym), on)
        switch(d, sa, ym, not A, f"{labA} = {bit(A)}", bitcol(A))
        T2(d, sa + 45, ym - 64, "Öffner", F(24, 600), GREY, "mm")
    line((L, ym, L, bot), on); line((R, ym, R, bot), on); line((L, bot, R, bot), on)
    # Quelle und Lampe auf den senkrechten Leitungen
    d.rectangle((L - 34, bot - 100, L + 34, bot - 56), fill=BG)
    source(d, L, bot - 78)
    d.rectangle((R - 34, bot - 120, R + 34, bot - 52), fill=BG)
    lamp(d, R, bot - 86, lit)
    T2(d, R - 48, bot - 86, "Lampe", F(22, 600), GREY, "rm")
    return lit

def ttable(d, x, y, heads, rows, nshow, active=None, cw=100, rh=46, widths=None, res_cols=1, hfill=DARK, size=28):
    """Wahrheitstabelle: heads Kopfzeile, rows Werte (0/1), nshow = sichtbare Zeilen, active = markierte Zeile."""
    widths = widths or [cw] * len(heads)
    xs = [x]
    for w in widths[:-1]: xs.append(xs[-1] + w + 6)
    for j, hd in enumerate(heads):
        res = j >= len(heads) - res_cols
        cell4(d, xs[j], y, widths[j], rh, hd, F(24, 700), WHITE, RED if res else hfill, RED if res else hfill, r=8)
    for i, row in enumerate(rows[:nshow]):
        yy = y + (rh + 6) * (i + 1)
        if active == i:
            d.rounded_rectangle((x - 8, yy - 4, xs[-1] + widths[-1] + 8, yy + rh + 4), 10, outline=RED, width=4)
        for j, v in enumerate(row):
            res = j >= len(heads) - res_cols
            cell4(d, xs[j], yy, widths[j], rh, str(v), M(size, True), bitcol(v) if not res else (WHITE if v else DARK),
                  (GREEN if v else WHITE) if res else WHITE, ol=LINE)
    return y + (rh + 6) * (len(rows) + 1)

def arrow(d, p0, p1, col=DARK, w=4, head=12):
    d.line((p0, p1), fill=col, width=w)
    a = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    pts = [p1, (p1[0] - head * math.cos(a - 0.45), p1[1] - head * math.sin(a - 0.45)), (p1[0] - head * math.cos(a + 0.45), p1[1] - head * math.sin(a + 0.45))]
    d.polygon(pts, fill=col)

def press(d, ox, oy, ram, L, R, status=None):
    """Zweihandpresse. ram 0..140 (Hubweg), L/R: Taster gedrueckt."""
    def rect(a, b, c, e, fill, ol=None): d.rectangle((ox + a, oy + b, ox + c, oy + e), fill=fill, outline=ol)
    steel = (96, 106, 120); dark = (60, 68, 80)
    rect(40, 330, 520, 366, dark)
    rect(70, 50, 108, 330, steel); rect(452, 50, 490, 330, steel)
    rect(40, 30, 520, 76, dark)
    rect(180, 76, 380, 120 + ram, (150, 160, 174), dark)
    rect(210, 120 + ram, 350, 150 + ram, dark)
    rect(200, 296, 360, 330, (214, 168, 90), dark)
    for cx, on, lab in ((130, L, "Taster links"), (430, R, "Taster rechts")):
        d.ellipse((ox + cx - 40, oy + 396, ox + cx + 40, oy + 476), fill=GREEN if on else WHITE, outline=DARK, width=5)
        d.ellipse((ox + cx - 26, oy + 410, ox + cx + 26, oy + 462), fill=(30, 130, 70) if on else LINE)
        T2(d, ox + cx, oy + 486, lab, F(24, 600), GREEN if on else GREY, "ma")
    if status: T2(d, ox + 280, oy + 8, status[0], F(26, 700), status[1], "mm")

def poly_pos(pts, p):
    seg = [math.dist(a, b) for a, b in zip(pts, pts[1:])]; tot = sum(seg); s = clamp(p) * tot
    for (a, b), l in zip(zip(pts, pts[1:]), seg):
        if s <= l: k = s / l if l else 0; return (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)
        s -= l
    return pts[-1]

def gauge(d, cx, cy, R, val, lo=150, hi=210, vmax=300):
    d.arc((cx - R, cy - R, cx + R, cy + R), 180, 360, fill=LINE, width=30)
    d.arc((cx - R, cy - R, cx + R, cy + R), 180 + lo / vmax * 180, 180 + hi / vmax * 180, fill=GREEN, width=30)
    for v in range(0, vmax + 1, 50):
        a = math.radians(180 + v / vmax * 180)
        d.line((cx + (R - 38) * math.cos(a), cy + (R - 38) * math.sin(a), cx + (R - 52) * math.cos(a), cy + (R - 52) * math.sin(a)), fill=DARK, width=3)
        T2(d, cx + (R - 74) * math.cos(a), cy + (R - 74) * math.sin(a), str(v), F(20, 600), GREY, "mm")
    a = math.radians(180 + val / vmax * 180)
    d.line((cx, cy, cx + (R - 30) * math.cos(a), cy + (R - 30) * math.sin(a)), fill=RED, width=7)
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=DARK)

def run_inputs(code_lines, answers):
    """Fuehrt den Code mit vorgegebenen input()-Antworten aus: (Eingabezeilen, Ausgabezeilen, Namensraum)."""
    it = iter(answers); log = []
    def fake(prompt=""):
        a = next(it); log.append((prompt, a)); return a
    ns = {"input": fake}; buf = io.StringIO()
    with contextlib.redirect_stdout(buf): exec("\n".join(code_lines), ns)
    return log, buf.getvalue().splitlines(), ns


def show(f, t, t0, fn, dur=0.5, out=None):
    """Element blendet ab t0 ein (leichtes Aufsteigen); optional ab out wieder aus."""
    a = ap(t, t0, dur) * (1 - (ap(t, out, 0.3) if out is not None else 0))
    f.el(a, fn, dy=int((1 - ap(t, t0, dur)) * 12))
