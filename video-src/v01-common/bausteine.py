"""Gemeinsame Zeichenbausteine der Termin-01-Videos (Theorie, Python, Beispiel): Etiketten, Chips, Codefenster mit Zeilennummern,
Programmlauf mit getippten Antworten, Schachteln (Variablen), Programmablaufplan (pap.py wie auf der Website), EVA-Spalten.
Jeder Text wird gegen seinen Kasten (fit) und gegen den Bildrand (T2) geprueft; ein Ueberlauf bricht den Lauf ab."""
import os, sys, math
HERE_B = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_B)
from h01 import *
sys.path.insert(0, os.path.join(HERE_B, "..", "v05-common"))
from pap import Dia, pap_view, reveal

LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214); LIGHTK = (238, 239, 242)
BLUE = (37, 99, 235); AMB = (176, 110, 0)


# ---------------------------------------------------------------- Zeit und Einblenden
def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)
def E(f, t, tin, fn, tout=None):
    """Element fn(d, dy) ab tin einblenden (bis tout)."""
    f.el(show(t, tin, tout), fn, dy=dyf(t, tin))

def zeiten(secs, i):
    """at(ct, k, anteil): Zeitpunkt im Satz k der Szene i; anteil 0..1 zwischen Satzanfang und naechstem Satz
    (beim letzten Satz geschaetzt aus der Laenge der Sprechfassung)."""
    sents = secs[i - 1]; n = len(sents)
    def at(ct, k, anteil=0.0):
        a = ct(k); b = ct(k + 1) if k + 1 < n else a + len(sents[k][1]) / ZEICHEN_JE_S
        return a + (b - a) * anteil
    return at

def kopf(f, t, txt):
    assert F(40, 700).getlength(txt) <= 1120, f"Ueberschrift zu lang: {txt}"
    heading(f, t, txt)


# ---------------------------------------------------------------- Text mit Pruefung
def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w:.0f}): {txt}"

def TB(d, x, y, txt, font, col, maxw, anchor="la", what="Text"):
    """Text, der hoechstens maxw breit sein darf (Kasten) und im Bild bleiben muss."""
    fit(txt, font, maxw, what); T2(d, x, y, txt, font, col, anchor)

def umbruch(txt, font, maxw):
    zeilen = []; cur = ""
    for w in txt.split():
        neu = (cur + " " + w).strip()
        if font.getlength(neu) <= maxw: cur = neu
        else:
            assert cur, f"Wort zu breit: {w}"
            zeilen.append(cur); cur = w
    if cur: zeilen.append(cur)
    return zeilen

def absatz(d, x, y, txt, font, col, maxw, lh, maxzeilen, anchor="la"):
    zs = umbruch(txt, font, maxw); assert len(zs) <= maxzeilen, f"Absatz hat {len(zs)} Zeilen, erlaubt {maxzeilen}: {txt}"
    for i, z in enumerate(zs): TB(d, x, y + i * lh, z, font, col, maxw, anchor, "Absatz")
    return y + len(zs) * lh


# ---------------------------------------------------------------- Etiketten, Chips
def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 24, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def chip(d, x, y, w, h, txt, fill, col, size=28, outl=None, mono=False):
    font = M(size, True) if mono else F(size, 700); fit(txt, font, w - 16, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, font, col, "mm")

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def check_circle(d, x, y, r=17, fill=GREEN):
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill); tick(d, x, y, r * 1.1, WHITE, 4)

def num_circle(d, x, y, r, n, fill=RED, size=None):
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill); T(d, x, y, str(n), F(size or int(r * 1.15), 700), WHITE, "mm")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 28, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def pfeil(d, x0, y0, x1, y1, col=DARK, w=5, head=15):
    """Pfeil mit gefuellter Spitze (Linie endet vor der Spitze)."""
    a = math.atan2(y1 - y0, x1 - x0); l = math.dist((x0, y0), (x1, y1))
    k = max(0.0, (l - head * 0.8) / l) if l else 0
    d.line((x0, y0, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k), fill=col, width=w)
    d.polygon([(x1, y1), (x1 - head * math.cos(a - 0.45), y1 - head * math.sin(a - 0.45)), (x1 - head * math.cos(a + 0.45), y1 - head * math.sin(a + 0.45))], fill=col)

def gestrichelt(d, pts, col, w=3, strich=11, luecke=8):
    """Geschlossener gestrichelter Linienzug."""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        l = math.dist((x0, y0), (x1, y1)); n = max(1, int((l + luecke) // (strich + luecke))); step = l / n
        for k in range(n):
            a = k * step; b = min(l, a + step * strich / (strich + luecke))
            d.line((x0 + (x1 - x0) * a / l, y0 + (y1 - y0) * a / l, x0 + (x1 - x0) * b / l, y0 + (y1 - y0) * b / l), fill=col, width=w)


# ---------------------------------------------------------------- Code und Programmlauf
def code_n(d, x, y, w, lines, nums, times, t, size, lh, hl=None, cps=55, title="Python"):
    """Codefenster mit Zeilennummern (nums). Gibt die Hoehe zurueck; eine Zeile ausserhalb des Kastens ist ausgeschlossen (fit)."""
    f = M(size); top = 18 + 32; h = top + lh * len(lines) + 18; off = code_off(size)
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    hl = hl or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        fit(ln, f, w - off - 16, f"Code Zeile {nums[i]}")
        if i in hl and n > 0:
            d.rounded_rectangle((x + 8, yy - 4, x + w - 8, yy + lh - 5), 6, fill=HLBG); d.rectangle((x + 8, yy - 4, x + 13, yy + lh - 5), fill=RED)
        dim = 0.4 if (hl and i not in hl) else 1.0
        if n > 0: d.text((x + 20, yy), f"{nums[i]:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        draw_segs(d, x + off, yy, highlight(ln), f, n, dim)
    return h

def code_h(n, lh): return 50 + lh * n + 18
def code_off(size):
    """Abstand des Codes vom linken Kastenrand (Platz fuer zweistellige Zeilennummern)."""
    return max(62, int(20 + M(size).getlength("00") + size * 0.45))

def cpanel(f, t, lines, x, y, w, size, lh, hl=None, times=None, alpha_t=0.0, title="Python", nums=None):
    times = times if times is not None else [-1] * len(lines)
    nums = nums or list(range(1, len(lines) + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl, title=title))
    return code_h(len(lines), lh)

def lauf_h(n, lh): return 46 + lh * n + 16

def lauf_panel(d, x, y, w, zeilen, t, size=26, lh=42, title="Programmlauf", hl=None):
    """Konsole mit Eingaben. zeilen: (t0, text, t_antwort, antwort[, farbe]); antwort None = reine Ausgabezeile.
    Bis t_antwort blinkt hinter der Frage ein Cursor (das Programm wartet), danach steht die getippte Antwort da.
    hl: Menge markierter Zeilen. Gibt die Hoehe zurueck."""
    f = M(size); h = lauf_h(len(zeilen), lh); hl = hl or set()
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX2); T(d, x + 22, y + 12, title, F(20, 600), CODE_C)
    for i, z in enumerate(zeilen):
        t0, txt, t1, ans = z[:4]; col = z[4] if len(z) > 4 else CODE_T
        roh = "".join(s for s, _ in txt) if isinstance(txt, list) else txt
        fit(roh + (ans or ""), f, w - 44 - size * 0.6, "Programmlauf")
        if t < t0: continue
        yy = y + 46 + i * lh
        if i in hl:
            d.rounded_rectangle((x + 8, yy - 5, x + w - 8, yy + lh - 9), 6, fill=HLBG); d.rectangle((x + 8, yy - 5, x + 13, yy + lh - 9), fill=RED)
        n = int((t - t0) * 80) + 1
        if isinstance(txt, list): draw_segs(d, x + 22, yy, txt, f, n, 1.0, BOX2); voll = True; breite = sum(f.getlength(s) for s, _ in txt)
        else: d.text((x + 22, yy), txt[:n], font=f, fill=col); voll = n >= len(txt); breite = f.getlength(txt)
        if ans is not None and voll:
            cx = x + 22 + breite
            if t < t1:
                if int(t * 2) % 2 == 0: d.rectangle((cx + 2, yy + 1, cx + size * 0.5, yy + size - 2), fill=CODE_T)
            else: d.text((cx, yy), ans[:int((t - t1) * 12) + 1], font=f, fill=CODE_N)
    return h


# ---------------------------------------------------------------- Schachtel (Variable)
def schachtel(d, x, y, w, h, name, wert, col=BLUE, vcol=DARK, vsize=46, fill=WHITE):
    """Beschriftete Schachtel: offener Karton, aussen das Etikett mit dem Namen, innen der Wert (None = leer)."""
    d.line((x, y + 22, x - 16, y + 2), fill=col, width=4); d.line((x + w, y + 22, x + w + 16, y + 2), fill=col, width=4)
    d.rounded_rectangle((x, y + 22, x + w, y + h), 8, fill=fill, outline=col, width=4)
    fn = M(26, True); lw = fn.getlength(name) + 32; fit(name, fn, w - 8, "Schachtel-Name")
    d.rounded_rectangle((x + w / 2 - lw / 2, y + h - 22, x + w / 2 + lw / 2, y + h + 22), 8, fill=col)
    T2(d, x + w / 2, y + h, name, fn, WHITE, "mm")
    if wert is not None:
        fv = M(vsize, True); fit(wert, fv, w - 24, "Schachtel-Wert"); T2(d, x + w / 2, y + 22 + (h - 44) / 2, wert, fv, vcol, "mm")


# ---------------------------------------------------------------- Programmablaufplan (Symbole wie auf der Website: pap.py)
def plan(items, fs=20, gap=24):
    """Senkrechter Plan: items = [(schluessel, art, text[, {minw: ..}])], art: term (Start/Ende), io (Ein-/Ausgabe), proc (Verarbeitung).
    Kanten heissen 'a-b' (von oben nach unten)."""
    D = Dia(fs); y = 0; keys = []
    for it in items:
        n = D.node(it[0], it[1], it[2], 0, 0, **(it[3] if len(it) > 3 else {})); n.cy = y + n.h / 2; y = n.cy + n.h / 2 + gap; keys.append(it[0])
    for a, b in zip(keys, keys[1:]): D.edge(f"{a}-{b}", a, "b", b, "t")
    return D

def plan_kasten(box, z, cam, n):
    """Bildschirm-Rechteck (x0, y0, x1, y1) eines Knotens."""
    x0, y0 = plan_xy(box, z, cam, n.cx - n.w / 2, n.cy - n.h / 2); x1, y1 = plan_xy(box, z, cam, n.cx + n.w / 2, n.cy + n.h / 2)
    return x0, y0, x1, y1

def symbol_gestrichelt(d, box, z, cam, n, col=RED, text="?"):
    """Zeichnet einen (im Plan unsichtbar gehaltenen) Knoten als gestricheltes Symbol: 'noch zu ergaenzen'."""
    x0, y0, x1, y1 = plan_kasten(box, z, cam, n); sk = n.sk * z if n.kind == "io" else 0
    pts = [(x0 + sk, y0), (x1, y0), (x1 - sk, y1), (x0, y1)]
    d.polygon(pts, fill=WHITE); gestrichelt(d, pts, col, 3)
    T2(d, (x0 + x1) / 2, (y0 + y1) / 2, text, F(int(n.fs * z * 1.1), 700), col, "mm")

def plan_fit(D, box, maxzoom=1.4, pad=12):
    x, y, w, h = box; bb = D.bbox(); pw, ph = bb[2] - bb[0], bb[3] - bb[1]
    z = min(maxzoom, (w - 2 * pad) / pw, (h - 2 * pad) / ph)
    assert z * D.fs >= 17, f"Plan wird zu klein (Schrift {z * D.fs:.1f} px)"
    return z, (bb[0] - (w / z - pw) / 2, bb[1] - (h / z - ph) / 2)

def plan_xy(box, z, cam, px, py): return (box[0] + (px - cam[0]) * z, box[1] + (py - cam[1]) * z)

def plan_draw(f, a, D, box, vis=None, hl=None, maxzoom=1.4, bg=BG):
    """Zeichnet den Plan mittig in box=(x, y, w, h). Uebermalt die Flaeche der box: zuerst zeichnen. Gibt (zoom, cam) zurueck."""
    z, cam = plan_fit(D, box, maxzoom); pap_view(f, a, D, box, cam, vis=vis, hl=hl or {}, zoom=z, bg=bg); return z, cam

def plan_bild(D, size, hl=None, maxzoom=1.4, bg=BG):
    """Plan als Bild (fuer das Poster)."""
    z, cam = plan_fit(D, (0, 0) + tuple(size), maxzoom); return D.render(size, cam, hl=hl or {}, zoom=z, bg=bg)

def symbol(f, a, art, text, box, bg=WHITE, hl=None, fs=20, maxzoom=1.4, **kw):
    """Ein einzelnes Plan-Symbol mittig in box."""
    D = Dia(fs); D.node("n", art, text, 0, 0, **kw)
    return plan_draw(f, a, D, box, hl={"n": hl} if hl else None, maxzoom=maxzoom, bg=bg)

def aktuell(t, sched):
    """sched: [(zeit, wert)] aufsteigend -> Wert des letzten erreichten Eintrags (None vor dem ersten)."""
    cur = None
    for z, v in sched:
        if t >= z: cur = v
    return cur


# ---------------------------------------------------------------- Eingabe, Verarbeitung, Ausgabe als drei Spalten
EVA = [("Eingabe", BLUE, LIGHTB), ("Verarbeitung", AMB, LIGHTA), ("Ausgabe", GREEN, LIGHTG)]

def eva_spalten(f, t, spalten, y=128, h=330):
    """spalten: drei dicts mit t_karte, frage, t_frage, t_titel, punkte=[(text, zeit)], optional fuss=(text, zeit)."""
    xs = [60, 470, 880]; w = 340
    for k, sp in enumerate(spalten):
        name, col, fill = EVA[k]; x = xs[k]
        def karte(d, dy, x=x, k=k):
            d.rounded_rectangle((x, y + dy, x + w, y + h + dy), 14, fill=WHITE, outline=LINE, width=2)
            d.rounded_rectangle((x, y + dy, x + w, y + 10 + dy), 5, fill=col)
        E(f, t, sp["t_karte"], karte)
        E(f, t, sp["t_frage"], lambda d, dy, x=x, sp=sp: TB(d, x + w / 2, y + 50 + dy, sp["frage"], F(28, 600), DARK, w - 24, "mm", "Frage"))
        E(f, t, sp["t_titel"], lambda d, dy, x=x, name=name, col=col: tag(d, x + 20, y + 92 + dy, w - 40, 58, name, col, WHITE, 32))
        for j, (txt, tin) in enumerate(sp["punkte"]):
            E(f, t, tin, lambda d, dy, x=x, j=j, txt=txt, col=col, fill=fill: chip(d, x + 20, y + 172 + j * 70 + dy, w - 40, 56, txt, fill, col, 26))
        if sp.get("fuss"):
            txt, tin = sp["fuss"]
            E(f, t, tin, lambda d, dy, x=x, txt=txt, col=col: TB(d, x + w / 2, y + h - 34 + dy, txt, F(28, 700), col, w - 30, "mm", "Fuss"))
        if k:
            E(f, t, sp["t_karte"], lambda d, dy, x=x: pfeil(d, x - 60, y + h / 2 + dy, x - 10, y + h / 2 + dy, GREY, 6, 18))
