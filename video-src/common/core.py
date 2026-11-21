"""Gemeinsame Bausteine fuer die DHBW-Erklaervideos (Stil wie v03): Pillow-Einzelbilder, VTT, ffmpeg-Mux.
Neue Videos nutzen dieses Modul; video-src/v03 bleibt unveraendert."""
import os, re, sys, json, shutil, subprocess
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1280, 720, 25
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_SANS = os.path.join(HERE, "..", "fonts", "SourceSans3.ttf")
SITE_VIDEO = os.path.abspath(os.path.join(HERE, "..", "..", "site", "assets", "video"))

RED = (226, 0, 26); DARK = (26, 26, 26); GREY = (107, 114, 128)
BG = (247, 247, 248); WHITE = (255, 255, 255); LINE = (221, 224, 229)
BOX = (30, 41, 54); BOX2 = (18, 26, 36); CODE_T = (226, 232, 240); CODE_C = (148, 163, 184)
CODE_R = (255, 120, 120); CODE_G = (74, 222, 128); CODE_K = (125, 211, 252); CODE_N = (252, 211, 77)
AMBER = (232, 163, 23); GREEN = (46, 158, 91); MANT = (140, 148, 160)
HLBG = (62, 52, 70)

_fc = {}
def F(size, wt=400):
    k = (size, wt)
    if k not in _fc:
        f = ImageFont.truetype(FONT_SANS, size); f.set_variation_by_axes([wt]); _fc[k] = f
    return _fc[k]
def M(size, bold=False):
    k = ("m", size, bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf", size)
    return _fc[k]

def clamp(x): return max(0.0, min(1.0, x))
def ap(t, t0, dur=0.5):
    x = clamp((t - t0) / dur); return x * x * (3 - 2 * x)
def lerp(a, b, x): return a + (b - a) * x
def mix(c1, c2, x): return tuple(int(lerp(a, b, x)) for a, b in zip(c1, c2))

class Frame:
    def __init__(s, master=1.0):
        s.img = Image.new("RGB", (W, H), BG); s.master = master
    def el(s, a, fn, dy=0):
        a = a * s.master
        if a <= 0.004: return
        if a >= 0.996:
            fn(ImageDraw.Draw(s.img), dy); return
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        fn(ImageDraw.Draw(layer), dy)
        al = layer.getchannel("A").point(lambda v: int(v * a))
        layer.putalpha(al)
        s.img.paste(layer, (0, 0), layer)

def T(d, x, y, s, font, fill=DARK, anchor="la"):
    d.text((x, y), s, font=font, fill=fill, anchor=anchor)

def card(d, x, y, w, h, stripe=True, fill=WHITE):
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=fill, outline=LINE, width=2)
    if stripe: d.rounded_rectangle((x, y, x + 8, y + h), 4, fill=RED)

def heading(f, t, txt):
    def fn(d, dy):
        d.rounded_rectangle((60, 44 + dy, 68, 92 + dy), 4, fill=RED)
        T(d, 86, 42 + dy, txt, F(40, 700), DARK)
    f.el(ap(t, 0.2, 0.5), fn, dy=int((1 - ap(t, 0.2, 0.5)) * 10))

def chrome(f, gt, total, label):
    def foot(d, dy): T(d, 1220, 694, label, F(16, 400), GREY, "ra")
    saved = f.master; f.master = 1.0; f.el(1, foot); f.master = saved
    f.img.paste(RED, (0, 0, int(W * clamp(gt / total)), 5))

# ---------------------------------------------------------------- Python-Syntax einfaerben
KW = {"import", "from", "def", "if", "else", "elif", "for", "in", "return", "while", "and", "or", "not", "True", "False", "None"}
BI = {"print", "input", "float", "int", "str", "type", "round", "abs", "range", "len", "math"}
_tok = re.compile(r"(#.*$)|(f?\"[^\"]*\"|f?'[^']*')|(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_]\w*)|(\s+)|(.)")
def highlight(line):
    segs = []
    for m in _tok.finditer(line):
        txt = m.group(0)
        if m.group(1): col = CODE_C
        elif m.group(2): col = CODE_G
        elif m.group(3): col = CODE_N
        elif m.group(4): col = CODE_K if (txt in KW or txt in BI) else CODE_T
        else: col = CODE_T
        segs.append((txt, col))
    return segs

def draw_segs(d, x, y, segs, f, nchars=10**9, dim=1.0, bg=BOX):
    n = nchars; cx = x
    for text, col in segs:
        if n <= 0: break
        part = text[:n]; n -= len(text)
        if dim < 1: col = mix(bg, col, dim)
        d.text((cx, y), part, font=f, fill=col); cx += f.getlength(part)

def code_panel(d, x, y, w, lines, times, t, size=24, cps=60, hl=None, dim_others=False, lineno=True, title=None, pad_bottom=18, lh=None):
    """lines: Strings; times: Startzeit je Zeile (Schreibmaschine). hl: Menge von Zeilenindizes mit Markierung. Gibt Hoehe zurueck."""
    f = M(size); lh = lh or int(size * 1.45); top = 18 + (32 if title else 0)
    h = top + lh * len(lines) + pad_bottom
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX)
    if title: T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    hl = hl or set()
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = y + top + i * lh
        n = int(max(0, t - t0) * cps)
        if i in hl:
            d.rounded_rectangle((x + 8, yy - 2, x + w - 8, yy + lh - 3), 6, fill=HLBG)
            d.rectangle((x + 8, yy - 2, x + 13, yy + lh - 3), fill=RED)
        dim = 0.4 if (dim_others and hl and i not in hl) else 1.0
        off = 24
        if lineno:
            if n > 0: d.text((x + 20, yy), f"{i+1:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
            off = 62
        draw_segs(d, x + off, yy, highlight(ln), f, n, dim)
    return h

def console_panel(d, x, y, w, h, entries, t, size=24, title="Ausgabe", lh=None):
    """entries: (t0, segs[(text,color)]) erscheinen ab t0 untereinander."""
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX2)
    T(d, x + 22, y + 12, title, F(20, 600), CODE_C)
    f = M(size); lh = lh or int(size * 1.45); yy = y + 46
    for t0, segs in entries:
        if t < t0: continue
        draw_segs(d, x + 22, yy, segs, f, int((t - t0) * 80), 1.0, BOX2); yy += lh

# ---------------------------------------------------------------- Zeitleiste
LEAD, GAP, TAIL = 0.35, 0.6, 1.6

def dur(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout.strip())

def sentence_bounds(path, n, d, weights=None):
    """Satzgrenzen: Pausen per silencedetect; je Grenze die Pause, die der erwarteten (zeichenproportionalen) Position am naechsten liegt."""
    if n == 1: return [(0.05, d - 0.05)], True
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-af", "silencedetect=noise=-38dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True)
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    sil = [(a, b) for a, b in zip(st, en) if a > 0.3 and b < d - 0.05]
    weights = weights or [1] * n; tot = sum(weights); cum = 0; chosen = []
    for k in range(n - 1):
        cum += weights[k]; exp = d * cum / tot
        cand = [s for s in sil if s not in chosen and (not chosen or s[0] > chosen[-1][1])]
        if not cand: return None, False
        chosen.append(min(cand, key=lambda s: abs((s[0] + s[1]) / 2 - exp) - 3.0 * (s[1] - s[0])))
    starts = [0.05] + [b for a, b in chosen]; ends = [a for a, b in chosen] + [d - 0.05]
    return list(zip(starts, ends)), True

def build_timeline(vdir, secs):
    tl = {}; cur = 0.0; warn = []
    for i, sents in enumerate(secs, 1):
        p = os.path.join(vdir, "audio", f"s{i}.mp3"); d = dur(p)
        L = LEAD + d + (TAIL if i == len(secs) else GAP)
        b, ok = sentence_bounds(p, len(sents), d, [len(sp) for _, sp in sents])
        if not ok:
            warn.append(i); ws = [len(sp) for _, sp in sents]; tot = sum(ws); c = 0.05; b = []
            for w in ws:
                seg = (d - 0.1) * w / tot; b.append((c, c + seg)); c += seg
        tl[i] = dict(start=cur, len=L, audio=cur + LEAD, d=d, chunks=[(LEAD + a, LEAD + e) for a, e in b])
        cur += L
    tl["total"] = cur; tl["n"] = len(secs)
    if warn: print("WARNUNG: proportionale Satzzeiten in Abschnitt", warn)
    return tl

def vtt_ts(s):
    return f"{int(s//3600):02d}:{int(s%3600//60):02d}:{s%60:06.3f}"

def write_vtt(tl, secs, path):
    out = ["WEBVTT", ""]; n = 1
    for i, sents in enumerate(secs, 1):
        for (txt, _), (a, b) in zip(sents, tl[i]["chunks"]):
            s0 = tl[i]["start"] + a; s1 = tl[i]["start"] + b + 0.15
            out += [str(n), f"{vtt_ts(s0)} --> {vtt_ts(s1)}", txt, ""]; n += 1
    open(path, "w", encoding="utf-8").write("\n".join(out))

def render_frame(gt, tl, scenes, label):
    total = tl["total"]; n = tl["n"]; sec = n
    for i in range(1, n + 1):
        if gt < tl[i]["start"] + tl[i]["len"]: sec = i; break
    s = tl[sec]; t = gt - s["start"]; chunks = s["chunks"]
    ct = lambda k: chunks[min(k, len(chunks) - 1)][0]
    fd = 0.6 if sec == n else 0.4
    m = ap(t, 0.0, 0.4) if sec > 1 else 1.0
    m *= 1 - ap(t, s["len"] - fd, fd)
    fr = Frame(m); scenes[sec](fr, t, ct); chrome(fr, gt, total, label)
    return fr.img

def encode(tl, scenes, label, outfile):
    n = int(tl["total"] * FPS) + 1
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", outfile], stdin=subprocess.PIPE)
    for k in range(n):
        p.stdin.write(render_frame(k / FPS, tl, scenes, label).tobytes())
        if k % 500 == 0: print(k, n, flush=True)
    p.stdin.close(); p.wait()

def mux(vdir, name, tl, silent="silent.mp4"):
    O = os.path.join(vdir, "out"); os.makedirs(SITE_VIDEO, exist_ok=True)
    n = tl["n"]; cmd = ["ffmpeg", "-y", "-v", "error", "-i", os.path.join(O, silent)]
    for i in range(1, n + 1): cmd += ["-i", os.path.join(vdir, "audio", f"s{i}.mp3")]
    fc = "".join(f"[{i}:a]adelay={int(tl[i]['audio']*1000)}|{int(tl[i]['audio']*1000)},aresample=44100[a{i}];" for i in range(1, n + 1))
    fc += "".join(f"[a{i}]" for i in range(1, n + 1)) + f"amix=inputs={n}:normalize=0,loudnorm=I=-16:TP=-1.5[aout]"
    cmd += ["-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
            "-t", str(tl["total"]), "-movflags", "+faststart", os.path.join(SITE_VIDEO, name + ".mp4")]
    subprocess.run(cmd, check=True)
    shutil.copy(os.path.join(O, "vtt.vtt"), os.path.join(SITE_VIDEO, name + ".vtt"))
    shutil.copy(os.path.join(O, "poster.png"), os.path.join(SITE_VIDEO, name + "-poster.png"))

def main(vdir, secs, scenes, label, poster_fn, name):
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    O = os.path.join(vdir, "out"); os.makedirs(O, exist_ok=True)
    tl = build_timeline(vdir, secs)
    json.dump({str(k): v for k, v in tl.items()}, open(os.path.join(O, "timeline.json"), "w"), indent=1)
    write_vtt(tl, secs, os.path.join(O, "vtt.vtt"))
    print("Gesamtdauer", round(tl["total"], 1))
    poster_fn(os.path.join(O, "poster.png"))
    if mode == "stills":
        for gt in map(float, sys.argv[2:]):
            render_frame(gt, tl, scenes, label).save(os.path.join(O, f"still_{gt:07.2f}.png"))
    elif mode == "full":
        encode(tl, scenes, label, os.path.join(O, "silent.mp4")); mux(vdir, name, tl)
    elif mode == "mux":
        mux(vdir, name, tl)
