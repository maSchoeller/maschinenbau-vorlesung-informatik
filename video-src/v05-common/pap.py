"""PAP-Zeichenhilfe (Programmablaufplan nach DIN 66001 / ISO 5807) fuer die Erklaervideos (V05, V06, V03).

Symbole: Grenzstelle (Start/Ende), Operation, Ein-/Ausgabe, Verzweigung (Raute mit ja/nein), Uebergangsstelle,
Unterprogramm; Ablauflinien mit Pfeil, Zusammenfuehrung (Linie muendet in Linie), Hervorhebung in DHBW-Rot,
Marke entlang eines Pfads. Gezeichnet wird mit Uebersampling (glatte Linien) in ein Teilbild (Sichtfenster).

Benutzung:
    D = Dia(fs=18)
    D.node("s", "term", "Start", 200, 20); D.node("e", "io", "spannung einlesen", 200, 80)
    D.edge("s-e", "s", "b", "e", "t")
    img = D.render((560, 400), cam=(0, 0), vis=lambda k: 1.0, hl={"e": RED}, marker=(x, y), zoom=1.0)
Dazu: Code-Panel mit farbiger Zuordnung, Hinweiskarten, Probelaeufe (run_in), Vertonung nacheinander (tts_safe)."""
import os, sys, io, builtins, contextlib, math, subprocess
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "v02-common"))
from h import *
from PIL import Image, ImageDraw

NL = chr(10)
PAL = [(37, 99, 235), (22, 163, 74), (217, 119, 6), (190, 24, 93), (109, 40, 217), (8, 145, 178)]
LINEC = (52, 58, 68)          # Strich dunkelgrau
LABC = (80, 88, 100)          # ja/nein klein an den Ausgaengen

# ---------------------------------------------------------------- Symbole und Plan
class Node:
    def __init__(s, key, kind, text, cx, cy, fs=18, minw=0, minh=0, w=None, h=None):
        s.key, s.kind, s.text, s.cx, s.cy, s.fs = key, kind, text, cx, cy, fs
        s.ls = text.split(NL) if text else []
        s.lh = int(fs * 1.25); s.sk = 14
        f = F(fs, 600); tw = max([f.getlength(l) for l in s.ls] or [0]); n = max(1, len(s.ls))
        if kind == "term": W_, H_ = max(tw + 44, 92), s.lh * n + 16
        elif kind == "proc": W_, H_ = tw + 30, s.lh * n + 18
        elif kind == "io": W_, H_ = tw + 30 + 2 * s.sk, s.lh * n + 18
        elif kind == "dec": W_, H_ = tw * 1.46 + 30, s.lh * n + 40 + (n - 1) * 14
        elif kind == "sub": W_, H_ = tw + 60, s.lh * n + 18
        else: W_ = H_ = 30                      # conn
        s.w = w if w else max(W_, minw); s.h = h if h else max(H_, minh)
    def port(s, side):
        if side == "t": return (s.cx, s.cy - s.h / 2)
        if side == "b": return (s.cx, s.cy + s.h / 2)
        k = s.sk / 2 if s.kind == "io" else 0
        if side == "l": return (s.cx - s.w / 2 + k, s.cy)
        return (s.cx + s.w / 2 - k, s.cy)
    def bbox(s): return (s.cx - s.w / 2, s.cy - s.h / 2, s.cx + s.w / 2, s.cy + s.h / 2)

class Edge:
    def __init__(s, key, pts, label=None, arrow=True, lab=None):
        s.key, s.pts, s.label, s.arrow, s.lab = key, pts, label, arrow, lab

class Dia:
    def __init__(s, fs=18): s.fs = fs; s.nodes = {}; s.edges = {}
    def node(s, key, kind, text, cx, cy, **kw):
        s.nodes[key] = Node(key, kind, text, cx, cy, kw.pop("fs", s.fs), **kw); return s.nodes[key]
    def _pt(s, a, side):
        if isinstance(a, tuple): return a
        return s.nodes[a].port(side)
    def edge(s, key, a, sa, b, sb, via=None, label=None, arrow=True, lab=None):
        """a/b: Knotenschluessel (mit Seite t/b/l/r) oder absoluter Punkt. via: Zwischenpunkte (sonst automatisch rechtwinklig).
        Die Ports werden beim Anlegen der Kante berechnet: Knoten vorher endgueltig positionieren."""
        p0, p1 = s._pt(a, sa), s._pt(b, sb); pts = [p0]
        if via is not None: pts += list(via)
        else:
            (x0, y0), (x1, y1) = p0, p1
            if abs(x0 - x1) < 0.5 or abs(y0 - y1) < 0.5: pass
            elif sa == "b" and sb in ("t", None): ym = (y0 + y1) / 2; pts += [(x0, ym), (x1, ym)]
            elif sa in ("l", "r") and sb in ("l", "r"): xm = (x0 + x1) / 2; pts += [(xm, y0), (xm, y1)]
            elif sa in ("l", "r"): pts += [(x1, y0)]
            elif sa == "b": pts += [(x0, y1)]
        pts.append(p1)
        s.edges[key] = Edge(key, pts, label, arrow, lab or (sa if label else None)); return s.edges[key]
    def stack(s, items, cx, y0, gap=28, **kw):
        """Senkrechte Folge: items = [(key, kind, text)] mit Kanten 'k1-k2' (unten -> oben). Gibt die Schluesselliste zurueck."""
        y = y0; keys = []
        for key, kind, text in items:
            n = s.node(key, kind, text, cx, 0, **kw); n.cy = y + n.h / 2; y = n.cy + n.h / 2 + gap; keys.append(key)
        for a, b in zip(keys, keys[1:]): s.edge(f"{a}-{b}", a, "b", b, "t")
        return keys
    def bbox(s):
        bs = [n.bbox() for n in s.nodes.values()]
        xs = [p[0] for e in s.edges.values() for p in e.pts]; ys = [p[1] for e in s.edges.values() for p in e.pts]
        return (min([b[0] for b in bs] + xs), min([b[1] for b in bs] + ys), max([b[2] for b in bs] + xs), max([b[3] for b in bs] + ys))
    def route(s, keys):
        """Polylinie ueber mehrere Kanten (Marke); '~key' = Kante rueckwaerts. Spruenge innerhalb eines Symbols gehen gerade durch das Symbol."""
        pts = []
        for k in keys:
            ps = s.edges[k[1:]].pts[::-1] if k.startswith("~") else s.edges[k].pts
            for p in ps:
                if not pts or math.dist(pts[-1], p) > 0.01: pts.append(p)
        return pts

    # ------------------------------------------------ Zeichnen (Uebersampling)
    def render(s, size, cam=(0, 0), vis=None, hl=None, marker=None, ss=2, bg=BG, border=False, labels=True, zoom=1.0):
        """size: (w, h) des Sichtfensters in Pixeln; cam: obere linke Ecke im Planraum; vis(key)->0..1; hl: key->Farbe;
        marker: (x, y) im Planraum oder None; zoom: Verkleinerung/Vergroesserung des Plans. Gibt ein RGB-Bild der Groesse size zurueck."""
        vis = vis or (lambda k: 1.0); hl = hl or {}; W_, H_ = size
        img = Image.new("RGB", (W_ * ss, H_ * ss), bg); d = ImageDraw.Draw(img)
        kz = ss * zoom
        P = lambda x, y: ((x - cam[0]) * kz, (y - cam[1]) * kz)
        def line(pts, col, w): d.line([P(*p) for p in pts], fill=col, width=max(2, int(w * kz)), joint="curve")
        def head(p0, p1, col, size_=13):
            a = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); x, y = p1
            pts = [(x, y), (x - size_ * math.cos(a - 0.42), y - size_ * math.sin(a - 0.42)), (x - size_ * math.cos(a + 0.42), y - size_ * math.sin(a + 0.42))]
            d.polygon([P(*p) for p in pts], fill=col)
        for e in s.edges.values():
            a = vis(e.key)
            if a <= 0.004: continue
            on = e.key in hl; col = mix(bg, hl[e.key] if on else LINEC, a); w = 5 if on else 3
            pts = list(e.pts)
            if e.arrow:   # Linie endet an der Pfeilspitze
                p0, p1 = pts[-2], pts[-1]; l = math.dist(p0, p1) or 1
                pts[-1] = (p1[0] - (p1[0] - p0[0]) / l * 8, p1[1] - (p1[1] - p0[1]) / l * 8)
            line(pts, col, w)
            if e.arrow: head(e.pts[-2], e.pts[-1], col, 15 if on else 13)
            else:
                x, y = P(*e.pts[-1]); r = (4 if on else 3) * kz
                d.ellipse((x - r, y - r, x + r, y + r), fill=col)
            if e.label and labels:
                x, y = e.pts[0]; side = e.lab if isinstance(e.lab, str) else "b"
                f = F(int(max(14, s.fs - 2) * kz), 600)
                if isinstance(e.lab, tuple): dx, dy, an = e.lab
                elif side == "b": dx, dy, an = 9, 4, "la"
                elif side == "r": dx, dy, an = 8, -5, "ls"
                else: dx, dy, an = -8, -5, "rs"
                d.text(P(x + dx, y + dy), e.label, font=f, fill=mix(bg, LABC, a), anchor=an)
        for n in s.nodes.values():
            a = vis(n.key)
            if a <= 0.004: continue
            c = hl.get(n.key); edge = mix(bg, c if c else LINEC, a); fill = mix(bg, mix(WHITE, c, 0.18) if c else WHITE, a)
            w = max(2, int((4 if c else 3) * kz))
            x0, y0, x1, y1 = n.bbox(); (X0, Y0), (X1, Y1) = P(x0, y0), P(x1, y1)
            if n.kind == "term": d.rounded_rectangle((X0, Y0, X1, Y1), (Y1 - Y0) / 2, fill=fill, outline=edge, width=w)
            elif n.kind == "proc": d.rectangle((X0, Y0, X1, Y1), fill=fill, outline=edge, width=w)
            elif n.kind == "sub":
                d.rectangle((X0, Y0, X1, Y1), fill=fill, outline=edge, width=w)
                for xx in (X0 + 10 * kz, X1 - 10 * kz): d.line((xx, Y0, xx, Y1), fill=edge, width=max(2, int(2.5 * kz)))
            elif n.kind == "io":
                sk = n.sk * kz; pts = [(X0 + sk, Y0), (X1, Y0), (X1 - sk, Y1), (X0, Y1)]
                d.polygon(pts, fill=fill); d.line(pts + [pts[0]], fill=edge, width=w, joint="curve")
            elif n.kind == "dec":
                pts = [((X0 + X1) / 2, Y0), (X1, (Y0 + Y1) / 2), ((X0 + X1) / 2, Y1), (X0, (Y0 + Y1) / 2)]
                d.polygon(pts, fill=fill); d.line(pts + [pts[0]], fill=edge, width=w, joint="curve")
            elif n.kind == "conn": d.ellipse((X0, Y0, X1, Y1), fill=fill, outline=edge, width=w)
            f = F(int(n.fs * kz), 600); tc = mix(bg, DARK, a); k = len(n.ls)
            for i, ln in enumerate(n.ls):
                d.text(P(n.cx, n.cy + (i + 0.5 - k / 2) * n.lh), ln, font=f, fill=tc, anchor="mm")
        if marker is not None:
            x, y = P(*marker); r = 11 * ss * max(0.9, zoom)
            d.ellipse((x - r, y - r, x + r, y + r), fill=RED, outline=WHITE, width=int(3 * ss))
        out = img.resize((W_, H_), Image.LANCZOS) if ss > 1 else img
        if border: ImageDraw.Draw(out).rectangle((0, 0, W_ - 1, H_ - 1), outline=LINE, width=2)
        return out

def along(pts, p):
    """Punkt bei Anteil p (0..1) der Gesamtlaenge einer Polylinie."""
    seg = [math.dist(a, b) for a, b in zip(pts, pts[1:])]; tot = sum(seg); s_ = clamp(p) * tot
    for (a, b), l in zip(zip(pts, pts[1:]), seg):
        if s_ <= l: k = s_ / l if l else 0; return (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)
        s_ -= l
    return pts[-1]

def pap_view(f, a, dia, box, cam, **kw):
    """Zeichnet den Plan als Sichtfenster box=(x, y, w, h) auf das Bild, ueberblendet mit a (und der Szenen-Blende)."""
    a = clamp(a * f.master)
    if a <= 0.004: return
    x, y, w, h = box; sub = dia.render((w, h), cam, **kw)
    region = f.img.crop((x, y, x + w, y + h)); f.img.paste(Image.blend(region, sub, a), (x, y))

# ---------------------------------------------------------------- Code-Panel mit farbiger Zuordnung
def code_c(d, x, y, w, lines, times, t, size=17, lh=None, cols=None, active=None, cps=70, title="Python", dim_others=True, off=62):
    """cols: Zeilenindex -> Farbe (Balken + Tonung); active: Menge hervorgehobener Zeilen (None = alle gleich)."""
    f = M(size); lh = lh or int(size * 1.45); top = 18 + (32 if title else 0)
    h = top + lh * len(lines) + 18
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX)
    if title: T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    cols = cols or {}
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh; n = int(max(0, t - t0) * cps)
        on = (active is None) or (i in active)
        if i in cols and n > 0:
            col = cols[i]
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=mix(BOX, col, 0.34 if on else 0.14))
            d.rectangle((x + 8, yy - 2, x + 14, yy + lh - 3), fill=col)
        dim = 1.0 if (on or not dim_others) else 0.5
        if n > 0: d.text((x + 18, yy), f"{i+1:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        draw_segs(d, x + off, yy, highlight(ln), f, n, dim)
    return h

def note(f, t, tin, x, y, w, h, big, small, col=DARK, tout=None, bsz=26):
    """Hinweiskarte, frei positionierbar."""
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    def fn(d, dy):
        card(d, x, y + dy, w, h)
        T2(d, x + 28, y + 10 + dy, big, F(bsz, 700), col)
        yy = y + 10 + int(bsz * 1.35) + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 22
            while F(sz, 400).getlength(ln) > w - 50 and sz > 15: sz -= 1
            T2(d, x + 28, yy, ln, F(sz, 400), GREY); yy += int(sz * 1.25)
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

def pill(f, t, tin, x, y, w, txt, col=RED, hgt=56, sz=28):
    def fn(d, dy):
        d.rounded_rectangle((x, y + dy, x + w, y + hgt + dy), hgt // 2, fill=col)
        T2(d, x + w / 2, y + hgt / 2 + dy, txt, F(sz, 700), WHITE, "mm")
    f.el(ap(t, tin, 0.5), fn, dy=int((1 - ap(t, tin, 0.5)) * 12))

def arrow(d, x0, y0, x1, y1, col=DARK, w=3, hs=11):
    d.line((x0, y0, x1, y1), fill=col, width=w)
    ang = math.atan2(y1 - y0, x1 - x0)
    for da in (2.55, -2.55):
        d.line((x1, y1, x1 + hs * math.cos(ang + da), y1 + hs * math.sin(ang + da)), fill=col, width=w)

def check(d, x, y, col=GREEN, s=1.0, w=5):
    d.line((x, y + 10 * s, x + 8 * s, y + 18 * s), fill=col, width=w); d.line((x + 8 * s, y + 18 * s, x + 24 * s, y), fill=col, width=w)

def reveal(t, tm, dur=0.45):
    return lambda k: ap(t, tm[k], dur) if k in tm else 1.0

# ---------------------------------------------------------------- Ausfuehren (Probelauf mit input)
def run_in(code, inputs):
    """Fuehrt Code aus, fuettert input() mit inputs (Strings) und gibt die Konsole (Prompt + Eingabe + Ausgabe) als Zeilen zurueck."""
    buf = io.StringIO(); it = iter(inputs)
    def fake(prompt=""):
        v = next(it); buf.write(f"{prompt}{v}" + NL); return v
    g = {"__builtins__": {**vars(builtins), "input": fake}}
    with contextlib.redirect_stdout(buf): exec(code, g)
    return buf.getvalue().splitlines()

def text_modus(srcs):
    """Sprechfassung + PRUEFEN-Hinweise je Satz (Modus text); nichts wird gesendet."""
    tot = 0; words = 0; secs = make_secs(srcs)
    for i, sec in enumerate(srcs, 1):
        for j, s_ in enumerate(sec, 1):
            sp = SP.sprechfassung(s_); tot += len(sp); words += len(sp.split())
            print(f"s{i}.{j}: {sp}")
            for hnt in SP.pruefen(s_): print("     PRUEFEN:", hnt)
        print(f"  [s{i}: {len(spoken(secs, i))} Zeichen]")
    print("Zeichen gesamt", tot, "Woerter", words, "ca. Minuten", round(words / 150, 2))

def fake_audio(vdir, secs, cps=13.0):
    """Platzhalter-Stille je Abschnitt (nur fuer scan/stills vor der Vertonung; wird von tts ueberschrieben)."""
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True)
    for i in range(1, len(secs) + 1):
        d_ = len(spoken(secs, i)) / cps
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{d_:.2f}", "-q:a", "9", os.path.join(ad, f"s{i}.mp3")], check=True)

def tts_safe(vdir, secs, warte=25, max_versuche=12, nur=None):
    """Vertonung strikt nacheinander (ElevenLabs ueber sprechen.tts); bei 429/Fehlern warten und wiederholen;
    Abschnitte mit unveraendertem Sprechtext werden uebersprungen. nur: Menge der Abschnittsnummern (sonst alle)."""
    import time
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True); used = 0
    for i in range(1, len(secs) + 1):
        if nur and i not in nur: continue
        txt = spoken(secs, i); mp3 = os.path.join(ad, f"s{i}.mp3"); st = os.path.join(ad, f"s{i}.sprech.txt")
        if os.path.exists(mp3) and os.path.exists(st) and open(st, encoding="utf-8").read() == txt:
            print("vorhanden", i, flush=True); continue
        for v in range(1, max_versuche + 1):
            try:
                SP.tts(txt, mp3, sprechfassung_anwenden=False); break
            except RuntimeError as e:
                print(f"Abschnitt {i} Versuch {v}: {str(e)[:120]} - warte {warte}s", flush=True)
                if v == max_versuche: raise
                time.sleep(warte)
        used += len(txt); print("erzeugt", i, len(txt), "Zeichen", flush=True)
    print("Zeichen verbraucht:", used)

def modus(vdir, src, secs, scenes, label, poster_fn, name):
    m = sys.argv[1] if len(sys.argv) > 1 else "full"
    if m == "text": text_modus(src)
    elif m == "fake": fake_audio(vdir, secs)
    elif m == "tts": tts_safe(vdir, secs)
    else: dispatch(vdir, secs, scenes, label, poster_fn, name)

# ---------------------------------------------------------------- bessere Satzgrenzen (statt core.sentence_bounds)
import re as _re, itertools as _it
import core as _core
def sentence_bounds_besser(path, n, d, weights=None):
    """Waehlt n-1 der erkannten Pausen: lange Pausen bevorzugt, nahe an der zeichenproportional erwarteten Stelle."""
    if n == 1: return [(0.05, d - 0.05)], True
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-af", "silencedetect=noise=-38dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True)
    st = [float(x) for x in _re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    en = [float(x) for x in _re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    sil = [(a, b) for a, b in zip(st, en) if a > 0.3 and b < d - 0.05]
    long_ = [s for s in sil if s[1] - s[0] >= 0.45]
    cand = long_ if len(long_) >= n - 1 else sil
    if len(cand) < n - 1: return None, False
    weights = weights or [1] * n; tot = sum(weights); cum = 0; exps = []
    for k in range(n - 1):
        cum += weights[k]; exps.append(d * cum / tot)
    best = None
    for combo in _it.combinations(cand, n - 1):
        score = sum((b - a) for a, b in combo) - 1.2 * sum(abs((a + b) / 2 - e) for (a, b), e in zip(combo, exps))
        if best is None or score > best[0]: best = (score, combo)
    chosen = best[1]
    starts = [0.05] + [b for a, b in chosen]; ends = [a for a, b in chosen] + [d - 0.05]
    res = list(zip(starts, ends))
    ok = all(0.55 <= ((b - a) / (d * w / tot)) <= 1.8 for (a, b), w in zip(res, weights))
    if not ok:
        c = 0.05; res = []
        for w in weights:
            seg = (d - 0.1) * w / tot; res.append((c, c + seg)); c += seg
    return res, True
_core.sentence_bounds = sentence_bounds_besser

# ---------------------------------------------------------------- Der Werkstoff-PAP (Code exakt briefing/v05-beispiel.py)
def werkstoff_pap(ox=40, oy=8, fs=18, gap=14):
    """Voller Plan des Werkstoffvorschlags (Planraum). Knoten: s,e1,e2,d1,meld,ende1,d2,d3,d140,d220,
    w235,w45,w42,w16,wson,aus,ende. Kanten: siehe PFAD_KEYS (Schluessel 'von-nach'; bus1..bus4 = Zusammenfuehrung)."""
    D = Dia(fs); N = D.node; Q = chr(34)
    N("s", "term", "Start", 0, 0); N("e1", "io", "spannung einlesen", 0, 0, minw=215); N("e2", "io", "temperatur einlesen", 0, 0, minw=215)
    N("d1", "dec", "Eingabe unplausibel ?", 0, 0); N("d2", "dec", "temperatur > 300 ?", 0, 0); N("d140", "dec", "spannung ≤ 140 ?", 0, 0)
    N("meld", "io", "Eingabe unplausibel -" + NL + "bitte Werte prüfen", 0, 0); N("ende1", "term", "Ende", 0, 0)
    N("d3", "dec", "spannung ≤ 200 ?", 0, 0); N("d220", "dec", "spannung ≤ 220 ?", 0, 0)
    N("w235", "proc", "werkstoff =" + NL + Q + "S235JR" + Q, 0, 0); N("w45", "proc", "werkstoff =" + NL + Q + "C45E" + Q, 0, 0)
    N("w42", "proc", "werkstoff =" + NL + Q + "42CrMo4 (vergütet)" + Q, 0, 0); N("w16", "proc", "werkstoff =" + NL + Q + "16Mo3 (warmfest)" + Q, 0, 0)
    N("wson", "proc", "werkstoff = " + Q + "Sonderwerkstoff -" + NL + "Rücksprache Konstruktion" + Q, 0, 0)
    N("aus", "io", Q + "Empfohlener Werkstoff:" + Q + NL + "und werkstoff ausgeben", 0, 0, minw=262); N("ende", "term", "Ende", 0, 0)
    n = D.nodes
    boxh = max(n[k].h for k in ("w235", "w45", "w42", "w16", "wson"))
    for k in ("w235", "w45", "w42", "w16", "wson"): n[k].h = boxh
    rows = [("s",), ("e1",), ("e2",), ("d1", "meld", "ende1"), ("d2", "d3"), ("d140", "d220"), ("w235", "w45", "w42", "w16", "wson"), ("bus",), ("aus",), ("ende",)]
    gaps = [gap, gap, gap, gap + 10, gap + 10, gap + 10, gap - 2, gap + 2, gap]
    y = oy; ys = {}
    for i, r in enumerate(rows):
        h = 14 if r[0] == "bus" else max(n[k].h for k in r)
        for k in r: ys[k] = y + h / 2
        y += h + (gaps[i] if i < len(gaps) else 0)
    for k in n: n[k].cy = ys[k]
    A_ = ox + n["d1"].w / 2
    for k in ("d1", "s", "e1", "e2", "d2", "d140", "w235"): n[k].cx = A_
    n["d220"].cx = n["d140"].bbox()[2] + 36 + n["d220"].w / 2; n["w45"].cx = n["d220"].cx
    n["w42"].cx = n["w45"].bbox()[2] + 28 + n["w42"].w / 2
    n["aus"].cx = n["ende"].cx = n["w42"].cx
    n["w16"].cx = n["w42"].bbox()[2] + 26 + n["w16"].w / 2; n["d3"].cx = n["w16"].cx
    n["wson"].cx = n["w16"].bbox()[2] + 26 + n["wson"].w / 2
    n["meld"].cx = n["d1"].bbox()[2] + 40 + n["meld"].w / 2; n["ende1"].cx = n["meld"].bbox()[2] + 36 + n["ende1"].w / 2
    bus = ys["bus"]
    E = D.edge
    E("s-e1", "s", "b", "e1", "t"); E("e1-e2", "e1", "b", "e2", "t"); E("e2-d1", "e2", "b", "d1", "t")
    E("d1-meld", "d1", "r", "meld", "l", label="ja"); E("meld-ende1", "meld", "r", "ende1", "l")
    E("d1-d2", "d1", "b", "d2", "t", label="nein")
    E("d2-d3", "d2", "r", "d3", "l", label="ja"); E("d2-d140", "d2", "b", "d140", "t", label="nein")
    E("d3-w16", "d3", "b", "w16", "t", label="ja"); E("d3-wson", "d3", "r", "wson", "t", label="nein")
    E("d140-w235", "d140", "b", "w235", "t", label="ja"); E("d140-d220", "d140", "r", "d220", "l", label="nein")
    E("d220-w45", "d220", "b", "w45", "t", label="ja"); E("d220-w42", "d220", "r", "w42", "t", label="nein")
    for k in ("w235", "w45", "w42", "w16", "wson"):
        E(k + "-bus", k, "b", (n[k].cx, bus), None, arrow=False)
    xs = [n[k].cx for k in ("w235", "w45", "w42", "w16", "wson")]
    for i in range(4): E(f"bus{i+1}", (xs[i], bus), None, (xs[i + 1], bus), None, arrow=False)
    E("bus-aus", (xs[2], bus), None, "aus", "t")
    E("aus-ende", "aus", "b", "ende", "t")
    return D

_HEAD = ["s-e1", "e1-e2", "e2-d1"]
PFAD_KEYS = {   # Kanten je Pfad (Start bis Ende), die 6 Testfaelle; ~ = Kante rueckwaerts durchlaufen
    "unplausibel": _HEAD + ["d1-meld", "meld-ende1"],
    "heiss_sonder": _HEAD + ["d1-d2", "d2-d3", "d3-wson", "wson-bus", "~bus4", "~bus3", "bus-aus", "aus-ende"],
    "heiss_16": _HEAD + ["d1-d2", "d2-d3", "d3-w16", "w16-bus", "~bus3", "bus-aus", "aus-ende"],
    "kalt_235": _HEAD + ["d1-d2", "d2-d140", "d140-w235", "w235-bus", "bus1", "bus2", "bus-aus", "aus-ende"],
    "kalt_45": _HEAD + ["d1-d2", "d2-d140", "d140-d220", "d220-w45", "w45-bus", "bus2", "bus-aus", "aus-ende"],
    "kalt_42": _HEAD + ["d1-d2", "d2-d140", "d140-d220", "d220-w42", "w42-bus", "bus-aus", "aus-ende"],
}
