"""V05-Hilfen: Struktogramm-Zeichner (Nassi-Shneiderman), Code-Panel mit farbiger Zuordnung, Probelaeufe mit input()."""
import os, sys, io, builtins, contextlib, math, subprocess
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "v02-common"))
from h import *

PAL = [(37, 99, 235), (22, 163, 74), (217, 119, 6), (190, 24, 93), (109, 40, 217), (8, 145, 178)]

# ---------------------------------------------------------------- Knoten
def _seq(x):
    if isinstance(x, dict): return x
    return dict(t="seq", ch=[_seq(c) if isinstance(c, list) else c for c in x])
def A(text, key=None): return dict(t="a", text=text, key=key)
def IF(cond, yes, no, key=None, split=0.5, ylab="ja", nlab="nein"):
    return dict(t="if", cond=cond, yes=_seq(yes), no=_seq(no), key=key, split=split, ylab=ylab, nlab=nlab)
def SW(expr, cases, key=None, wts=None):
    """cases: [(label, body, lkey)] (lkey optional)"""
    cs = [(c[0], _seq(c[1]), c[2] if len(c) > 2 else None) for c in cases]
    return dict(t="sw", expr=expr, cases=cs, key=key, wts=wts or [1] * len(cs))
def LOOP(text, body, key=None): return dict(t="loop", text=text, body=_seq(body), key=key)

def hl_fill(hl):
    """hl: Schluessel -> Farbe; liefert (Fuellung, Kante) fuer NS.fill"""
    def f(k):
        c = hl.get(k)
        return (mix(WHITE, c, 0.2), c) if c else None
    return f

def reveal(t, tm, dur=0.45):
    return lambda k: ap(t, tm[k], dur) if k in tm else 1.0

class NS:
    def __init__(s, fs=17, pv=7, vis=None, fill=None):
        s.fs = fs; s.f = F(fs, 400); s.fb = F(fs, 600); s.fl = F(max(12, fs - 2), 600)
        s.lh = int(fs * 1.28); s.pv = pv
        s.vis = vis or (lambda k: 1.0); s.fill = fill or (lambda k: None)
    def nl(s, txt): return len(txt.split("\n"))
    # ------------------------------------------------ Hoehen
    def hh_if(s, n): return s.nl(n["cond"]) * s.lh + 2 * s.pv + 30
    def hh_sw(s, n): return s.nl(n["expr"]) * s.lh + 2 * s.pv + 20
    def lr(s): return s.lh + 10
    def mh(s, n):
        if isinstance(n, list): n = _seq(n)
        t = n["t"]
        if t == "a": return s.nl(n["text"]) * s.lh + 2 * s.pv
        if t == "seq": return sum(s.mh(c) for c in n["ch"]) if n["ch"] else s.lh + 2 * s.pv
        if t == "if": return s.hh_if(n) + max(s.mh(n["yes"]), s.mh(n["no"]))
        if t == "sw": return s.hh_sw(n) + s.lr() + max(s.mh(c[1]) for c in n["cases"])
        if t == "loop": return s.nl(n["text"]) * s.lh + 2 * s.pv + s.mh(n["body"])
    height = mh
    # ------------------------------------------------ Zeichnen
    def _txt(s, d, cx, y, txt, font, col, maxw):
        w = font.getlength(txt)
        assert w <= maxw, f"Struktogramm-Text zu breit ({w:.0f} > {maxw:.0f}): {txt!r}"
        d.text((cx, y), txt, font=font, fill=col, anchor="mt")
    def draw(s, d, n, x, y, w, h=None, a=1.0):
        if isinstance(n, list): n = _seq(n)
        h = h if h is not None else s.mh(n)
        k = n.get("key"); t = n["t"]
        if k: a = a * s.vis(k)
        if a <= 0.004: return
        c = lambda col: mix(BG, col, a)
        fl = s.fill(k) if k else None
        tint, edge = fl if fl else (WHITE, DARK)
        ew = 3 if fl else 2
        x, y, w, h = int(x), int(y), int(w), int(h)
        if t == "a":
            d.rectangle((x, y, x + w, y + h), fill=c(tint), outline=c(edge), width=ew)
            ls = n["text"].split("\n"); y0 = y + (h - len(ls) * s.lh) / 2
            for i, ln in enumerate(ls): s._txt(d, x + w / 2, y0 + i * s.lh, ln, s.f, c(DARK), w - 10)
        elif t == "seq":
            if not n["ch"]:
                d.rectangle((x, y, x + w, y + h), fill=c(WHITE), outline=c(DARK), width=2); return
            hs = [s.mh(ch) for ch in n["ch"]]; hs[-1] += h - sum(hs); yy = y
            for ch, hc in zip(n["ch"], hs): s.draw(d, ch, x, yy, w, hc, a); yy += hc
        elif t == "if":
            hh = s.hh_if(n); w1 = int(w * n["split"])
            d.rectangle((x, y, x + w, y + h), fill=c(WHITE), outline=c(DARK), width=2)
            d.rectangle((x + 1, y + 1, x + w - 1, y + hh), fill=c(tint))
            d.line((x, y, x + w1, y + hh), fill=c(DARK), width=2); d.line((x + w, y, x + w1, y + hh), fill=c(DARK), width=2)
            d.line((x, y + hh, x + w, y + hh), fill=c(edge if fl else DARK), width=ew)
            d.line((x + w1, y + hh, x + w1, y + h), fill=c(DARK), width=2)
            d.rectangle((x, y, x + w, y + h), outline=c(DARK), width=2)
            ls = n["cond"].split("\n"); f_ = (s.pv + len(ls) * s.lh) / hh
            lo = x + f_ * w1; hi = x + w - f_ * (w - w1); cx = (lo + hi) / 2
            for i, ln in enumerate(ls): s._txt(d, cx, y + s.pv + i * s.lh, ln, s.f, c(DARK), hi - lo - 8)
            d.text((x + 6, y + hh - s.lh + 1), n["ylab"], font=s.fl, fill=c(GREY))
            d.text((x + w - 6, y + hh - s.lh + 1), n["nlab"], font=s.fl, fill=c(GREY), anchor="ra")
            bh = h - hh
            s.draw(d, n["yes"], x, y + hh, w1, bh, a); s.draw(d, n["no"], x + w1, y + hh, w - w1, bh, a)
        elif t == "sw":
            hh = s.hh_sw(n); lr = s.lr(); tot = sum(n["wts"]); cws = [int(w * q / tot) for q in n["wts"]]; cws[-1] = w - sum(cws[:-1])
            d.rectangle((x, y, x + w, y + h), fill=c(WHITE), outline=c(DARK), width=2)
            d.rectangle((x + 1, y + 1, x + w - 1, y + hh), fill=c(tint))
            d.line((x, y, x + cws[0], y + hh), fill=c(DARK), width=2); d.line((x + w, y, x + w - cws[-1], y + hh), fill=c(DARK), width=2)
            d.line((x, y + hh, x + w, y + hh), fill=c(edge if fl else DARK), width=ew)
            ls = n["expr"].split("\n"); f_ = (s.pv + len(ls) * s.lh) / hh
            lo = x + f_ * cws[0]; hi = x + w - f_ * cws[-1]
            for i, ln in enumerate(ls): s._txt(d, (lo + hi) / 2, y + s.pv + i * s.lh, ln, s.f, c(DARK), hi - lo - 8)
            cx = x; by = y + hh + lr; bh = h - hh - lr
            for (lab, body, lk), cw in zip(n["cases"], cws):
                lf = s.fill(lk) if lk else None
                d.rectangle((cx, y + hh, cx + cw, by), fill=c(lf[0] if lf else WHITE), outline=c(lf[1] if lf else DARK), width=3 if lf else 2)
                s._txt(d, cx + cw / 2, y + hh + 5, lab, s.fl, c(DARK), cw - 8)
                s.draw(d, body, cx, by, cw, bh, a); cx += cw
            d.rectangle((x, y, x + w, y + h), outline=c(DARK), width=2)
        elif t == "loop":
            hh = s.nl(n["text"]) * s.lh + 2 * s.pv; ind = 26
            d.rectangle((x, y, x + w, y + h), fill=c(WHITE), outline=c(DARK), width=2)
            d.rectangle((x, y, x + w, y + hh), fill=c(tint), outline=c(edge), width=ew)
            for i, ln in enumerate(n["text"].split("\n")): s._txt(d, x + w / 2, y + s.pv + i * s.lh, ln, s.f, c(DARK), w - 10)
            d.rectangle((x, y + hh, x + ind, y + h), fill=c(mix(WHITE, DARK, 0.1)), outline=c(DARK), width=2)
            s.draw(d, n["body"], x + ind, y + hh, w - ind, h - hh, a)

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
    """Hinweiskarte (wie side_card in V02), frei positionierbar."""
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

# ---------------------------------------------------------------- Ausfuehren (Probelauf mit input)
def run_in(code, inputs):
    """Fuehrt Code aus, fuettert input() mit inputs (Strings) und gibt die Konsole (Prompt + Eingabe + Ausgabe) als Zeilen zurueck."""
    buf = io.StringIO(); it = iter(inputs)
    def fake(prompt=""):
        v = next(it); buf.write(f"{prompt}{v}\n"); return v
    g = {"__builtins__": {**vars(builtins), "input": fake}}
    with contextlib.redirect_stdout(buf): exec(code, g)
    return buf.getvalue().splitlines()

def text_modus(srcs):
    """Sprechfassung + PRUEFEN-Hinweise je Satz (Modus text)."""
    tot = 0; words = 0; secs = make_secs(srcs)
    for i, sec in enumerate(srcs, 1):
        for j, s_ in enumerate(sec, 1):
            sp = SP.sprechfassung(s_); tot += len(sp); words += len(sp.split())
            print(f"s{i}.{j}: {sp}")
            for hnt in SP.pruefen(s_): print("     PRUEFEN:", hnt)
        print(f"  [s{i}: {len(spoken(secs, i))} Zeichen]")
    print("Zeichen gesamt", tot, "Woerter", words)

def fake_audio(vdir, secs, cps=13.0):
    """Platzhalter-Stille je Abschnitt (nur fuer scan vor der Vertonung; wird von tts ueberschrieben)."""
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True)
    for i in range(1, len(secs) + 1):
        d_ = len(spoken(secs, i)) / cps
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{d_:.2f}", "-q:a", "9", os.path.join(ad, f"s{i}.mp3")], check=True)

def tts_safe(vdir, secs, warte=25, max_versuche=12):
    """Vertonung strikt nacheinander; bei 429/Fehlern warten und wiederholen; unveraenderte Abschnitte werden uebersprungen."""
    import time
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True); used = 0
    for i in range(1, len(secs) + 1):
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

# ---------------------------------------------------------------- bessere Satzgrenzen (statt core.sentence_bounds, nur fuer V05)
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
    for combo in _it.combinations(cand, n - 1):   # bereits nach Zeit sortiert
        score = sum((b - a) for a, b in combo) - 1.2 * sum(abs((a + b) / 2 - e) for (a, b), e in zip(combo, exps))
        if best is None or score > best[0]: best = (score, combo)
    chosen = best[1]
    starts = [0.05] + [b for a, b in chosen]; ends = [a for a, b in chosen] + [d - 0.05]
    res = list(zip(starts, ends))
    # Plausibilitaet: Satzdauern muessen grob zur Zeichenzahl passen, sonst proportional
    ok = all(0.55 <= ((b - a) / (d * w / tot)) <= 1.8 for (a, b), w in zip(res, weights))
    if not ok:
        c = 0.05; res = []
        for w in weights:
            seg = (d - 0.1) * w / tot; res.append((c, c + seg)); c += seg
    return res, True
_core.sentence_bounds = sentence_bounds_besser
