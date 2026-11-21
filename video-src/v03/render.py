"""V03 Erklaervideo: Pillow-Renderer. Aufruf: python render.py [poster|frames N|full]
Liest audio/s1..s6.mp3 (Dauer per ffprobe), erzeugt Timeline, VTT, Video (ohne Ton) -> out/v03_silent.mp4
"""
import os, sys, subprocess, struct, json, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "common"))
from sprechen import tts, anzeige, sprechfassung, pruefen
from PIL import Image, ImageDraw, ImageFont, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
FONT_SANS = os.path.join(HERE, "..", "fonts", "SourceSans3.ttf")
W, H, FPS = 1280, 720, 25

RED = (226, 0, 26); DARK = (26, 26, 26); GREY = (107, 114, 128)
BG = (247, 247, 248); WHITE = (255, 255, 255); LINE = (221, 224, 229)
BOX = (30, 41, 54); CODE_T = (226, 232, 240); CODE_C = (148, 163, 184)
CODE_R = (255, 120, 120); CODE_G = (74, 222, 128); CODE_K = (125, 211, 252)
AMBER = (232, 163, 23); GREEN = (46, 158, 91)
MANT = (140, 148, 160)

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

# ---------------------------------------------------------------- Canvas
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

def code_box(d, x, y, w, h, lines, t, size=26, cps=45, hl=None):
    """lines: [(t0, [(text,color),...])]; Typewriter pro Zeile."""
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX)
    f = M(size); lh = int(size * 1.5); cy = y + 22
    for t0, segs in lines:
        n = int(max(0, (t - t0)) * cps); cx = x + 24
        for text, col in segs:
            if n <= 0: break
            part = text[:n]; n -= len(text)
            if hl and text in hl and n >= 0:
                tw = f.getlength(part)
                d.rounded_rectangle((cx - 3, cy - 2, cx + tw + 3, cy + lh - 6), 6, fill=(120, 30, 40))
            d.text((cx, cy), part, font=f, fill=col); cx += f.getlength(part)
        cy += lh

def heading(f, t, txt):
    def fn(d, dy):
        d.rounded_rectangle((60, 44 + dy, 68, 92 + dy), 4, fill=RED)
        T(d, 86, 42 + dy, txt, F(40, 700), DARK)
    f.el(ap(t, 0.2, 0.5), fn, dy=int((1 - ap(t, 0.2, 0.5)) * 10))

def chrome(f, gt, total):
    def foot(d, dy):
        T(d, 1220, 694, "DHBW · Informatik · V03", F(16, 400), GREY, "ra")
    saved = f.master; f.master = 1.0; f.el(1, foot); f.master = saved
    f.img.paste(RED, (0, 0, int(W * clamp(gt / total)), 5))

def bits_cells(d, x, y, bits, groups, cw, ch, n_show, dy=0, gap=2, fsize=12):
    """groups: [(count,color)]"""
    i = 0
    for cnt, col in groups:
        for _ in range(cnt):
            if i >= n_show or i >= len(bits): return
            d.rounded_rectangle((x + i * cw, y + dy, x + i * cw + cw - gap, y + dy + ch), 3, fill=col)
            T(d, x + i * cw + (cw - gap) / 2, y + dy + ch / 2, bits[i], M(fsize, True), WHITE, "mm")
            i += 1

BITS64 = bin(int.from_bytes(struct.pack(">d", 0.1), "big"))[2:].zfill(64)
BITS32 = bin(int.from_bytes(struct.pack(">f", 0.1), "big"))[2:].zfill(32)

# ---------------------------------------------------------------- Sektionen (Sprech-Chunks)
# EIN Quelltext mit Markup je Chunk: Untertitel = anzeige(), Audio = tts() ueber den ganzen Absatz,
# Gewichtung der Chunkzeiten = Laenge der Sprechfassung.
SRC = {
 1: ["Stell dir vor, du addierst in einer Toleranzkette 0,1 mm und 0,2 mm.",
     "Python antwortet: 0,30000000000000004.",
     "Ist das Ergebnis gleich 0,3? Python sagt: Falsch.",
     "Noch ein Beispiel: Eine SPS mit dem Datentyp REAL (32 Bit) kann die Zahl",
     "[[16 777 217|sechzehn Millionen siebenhundertsiebenundsiebzigtausend zweihundertsiebzehn]] gar nicht darstellen.",
     "Was ist da los?"],
 2: ["Computer speichern Zahlen binär, also mit Nullen und Einsen.",
     "Im Dezimalsystem kannst du [[1/3|ein Drittel]] nicht exakt aufschreiben: 0,333…, ewig weiter.",
     "Genauso ist 0,1 im Binärsystem periodisch: [[0,0001100110011…|null Komma null null null eins eins, null null eins eins]], und so weiter.",
     "Der Speicher hat aber nur endlich viele Stellen, also wird abgeschnitten.",
     "Schon die einzelne Zahl 0,1 ist im Rechner minimal falsch."],
 3: ["Gespeichert wird nach dem Standard IEEE 754.",
     "Das ist die wissenschaftliche Schreibweise, nur binär: Vorzeichen, Exponent und Mantisse.",
     "Beim `float64`, dem normalen Python-Float, sind das [[1|ein]], 11 und 52 Bit.",
     "Beim `float32`, dem REAL der SPS: [[1|ein]], 8 und 23 Bit.",
     "Weil die Mantisse begrenzt ist, liegen die darstellbaren Zahlen nicht gleichmäßig:",
     "Nahe null sind sie dicht, bei großen Zahlen wachsen die Lücken.",
     "Bei `float32` liegen ab 16 Millionen schon zwei Einheiten zwischen zwei Nachbarn.",
     "Deshalb fehlt die 17."],
 4: ["Was heißt das für dich als Ingenieur?",
     "Erstens: Vergleiche Floats nie mit dem doppelten Gleichheitszeichen.",
     "Nimm `math.isclose`, oder prüfe, ob der Betrag der Differenz kleiner ist als deine Toleranz.",
     "Zweitens: Fehler summieren sich.",
     "Addierst du zehnmal 0,1, kommst du nicht genau auf 1.",
     "Und drittens: In Steuerungen mit `float32` sind die Lücken noch viel größer, etwa bei Zählern oder Zeitstempeln."],
 5: ["Jetzt der Bezug zur KI.",
     "KI-generierter Code vergleicht Floats erstaunlich oft mit dem doppelten Gleichheitszeichen.",
     "Das sieht richtig aus, läuft durch, und scheitert erst im Betrieb.",
     "Genau das musst du beim Prüfen erkennen.",
     "In unserer Wissens-Ampel heißt das: Im Kopf haben musst du, dass das passiert und warum.",
     "Ein Bitmuster von Hand umzurechnen darfst du nachschlagen, oder der KI überlassen."],
 6: ["Auf der Seite kannst du das gleich selbst erkunden:",
     "In den Explorables schiebst du Bits hin und her und siehst, wie die Lücken auf dem Zahlenstrahl wachsen.",
     "Probier es aus!"],
}
SEC = {i: [(anzeige(s), sprechfassung(s)) for s in v] for i, v in SRC.items()}
LEAD, GAP, TAIL = 0.35, 0.6, 1.6

def audio_dur(i):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                        os.path.join(HERE, "audio", f"s{i}.mp3")], capture_output=True, text=True)
    return float(r.stdout.strip())

def build_timeline():
    tl = {}; cur = 0.0
    for i in range(1, 7):
        d = audio_dur(i); L = LEAD + d + (TAIL if i == 6 else GAP)
        ws = [len(sp) for _, sp in SEC[i]]; tot = sum(ws)
        a0 = LEAD + 0.12; a1 = LEAD + d - 0.08; cs = []; c = a0
        for w in ws:
            seg = (a1 - a0) * w / tot; cs.append((c, c + seg)); c += seg
        tl[i] = dict(start=cur, len=L, audio=cur + LEAD, d=d, chunks=cs)
        cur += L
    tl["total"] = cur
    return tl

def vtt_ts(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return f"{h:02d}:{m:02d}:{sec:06.3f}"

def write_vtt(tl, path):
    out = ["WEBVTT", ""]; n = 1
    for i in range(1, 7):
        for (txt, _), (a, b) in zip(SEC[i], tl[i]["chunks"]):
            s0 = tl[i]["start"] + a; s1 = tl[i]["start"] + b
            out += [str(n), f"{vtt_ts(s0)} --> {vtt_ts(s1)}", txt, ""]; n += 1
    open(path, "w", encoding="utf-8").write("\n".join(out))

# ---------------------------------------------------------------- Szenen
def scene1(f, t, ct):
    # Titel
    ta = ap(t, 0.1, 0.7) * (1 - ap(t, 2.9, 0.5))
    def title(d, dy):
        T(d, 640, 270 + dy, "Fließkommazahlen", F(84, 700), DARK, "mm")
        d.rectangle((560, 330 + dy, 720, 336 + dy), fill=RED)
        T(d, 640, 385 + dy, "Warum 0.1 + 0.2 nicht 0.3 ist", F(40, 400), GREY, "mm")
    f.el(ta, title, dy=int((1 - ap(t, 0.1, 0.7)) * 14))
    if t < 2.9: return
    heading(f, t - 2.4, "Das Problem")
    x0 = 470
    # Toleranzkette
    def chain(d, dy):
        d.rectangle((x0, 150 + dy, x0 + 120, 190 + dy), fill=RED)
        d.rectangle((x0 + 120, 150 + dy, x0 + 360, 190 + dy), fill=DARK)
        T(d, x0 + 60, 170 + dy, "0,1 mm", F(24, 700), WHITE, "mm")
        T(d, x0 + 240, 170 + dy, "0,2 mm", F(24, 700), WHITE, "mm")
        T(d, x0 - 24, 170 + dy, "Toleranzkette:", F(26, 600), GREY, "rm")
        T(d, x0 + 384, 170 + dy, "= 0,3 mm ?", F(30, 700), DARK, "lm")
    a = ap(t, 3.0, 0.6) * (1 - ap(t, ct(3) - 0.5, 0.5))
    f.el(a, chain, dy=int((1 - ap(t, 3.0, 0.6)) * 12))
    # Code Python
    def code(d, dy):
        code_box(d, 300, 250 + dy, 680, 230,
                 [(ct(1) + 0.3, [(">>> ", CODE_C), ("0.1 + 0.2", CODE_T)]),
                  (ct(1) + 1.2, [("0.30000000000000004", CODE_R)]),
                  (ct(2) + 0.2, [(">>> ", CODE_C), ("0.1 + 0.2 == 0.3", CODE_T)]),
                  (ct(2) + 2.8, [("False", CODE_R)])], t, 30)
    a = ap(t, ct(1), 0.4) * (1 - ap(t, ct(3) - 0.4, 0.5))
    f.el(a, code)
    # SPS
    def sps(d, dy):
        card(d, 280, 170 + dy, 720, 360)
        T(d, 320, 190 + dy, "SPS · Datentyp REAL (32 Bit)", F(30, 700), DARK)
        T(d, 320, 270 + dy, "gewünscht", F(24, 400), GREY)
        T(d, 320, 305 + dy, "16 777 217", F(64, 700), DARK)
        k = ap(t, ct(4) + 1.0, 0.6)
        T(d, 320, 395 + dy, "gespeichert", F(24, 400), GREY)
        T(d, 320, 428 + dy, "16 777 216", F(64, 700), mix(WHITE, RED, k) if k < 1 else RED)
        if k > 0.9:
            d.line((315, 352 + dy, 622, 352 + dy), fill=RED, width=6)
    a = ap(t, ct(3), 0.5) * (1 - ap(t, ct(5) - 0.3, 0.5))
    f.el(a, sps, dy=int((1 - ap(t, ct(3), 0.5)) * 12))
    def q(d, dy):
        T(d, 640, 340 + dy, "Was ist da los?", F(90, 700), RED, "mm")
    f.el(ap(t, ct(5), 0.6), q, dy=int((1 - ap(t, ct(5), 0.6)) * 14))

def scene2(f, t, ct):
    heading(f, t, "Warum? Computer rechnen binär")
    # Bitreihe als Deko (Chunk 0)
    pat = "01001101"
    def deco(d, dy):
        for i, ch in enumerate("0110100101001101"):
            x = 330 + i * 38
            d.rounded_rectangle((x, 130 + dy, x + 34, 172 + dy), 5, fill=BOX)
            T(d, x + 17, 151 + dy, ch, M(26, True), CODE_T, "mm")
    f.el(ap(t, 0.5, 0.5) * (1 - ap(t, ct(1) - 0.3, 0.5)), deco)
    # Dezimal links
    def dec(d, dy):
        card(d, 60, 130 + dy, 560, 210)
        T(d, 92, 146 + dy, "Dezimal", F(30, 700), DARK)
        T(d, 92, 205 + dy, "1/3 =", F(44, 700), DARK)
        n = int(max(0, t - (ct(1) + 1.5)) * 3.0); n = min(n, 9)
        s = "0," + "3" * n + ("…" if n >= 9 else "")
        T(d, 230, 205 + dy, s, M(44, True), RED)
        if n >= 9: T(d, 92, 285 + dy, "periodisch: 3 wiederholt sich ewig", F(24, 400), GREY)
    f.el(ap(t, ct(1), 0.5), dec, dy=int((1 - ap(t, ct(1), 0.5)) * 12))
    # Binaer rechts
    def binr(d, dy):
        card(d, 660, 130 + dy, 560, 210)
        T(d, 692, 146 + dy, "Binär", F(30, 700), DARK)
        T(d, 692, 205 + dy, "0,1 =", F(44, 700), DARK)
        n = int(max(0, t - (ct(2) + 1.8)) * 4.0); n = min(n, 17)
        digits = "0" + "0011" * 4
        x = 810; f_ = M(32, True)
        T(d, x, 213 + dy, "0,", f_, DARK); x += f_.getlength("0,")
        for i in range(min(n, 17)):
            ch = digits[i]; col = DARK if i == 0 else (RED if (i - 1) // 4 % 2 == 0 else (150, 0, 18))
            T(d, x, 213 + dy, ch, f_, col); x += f_.getlength(ch)
            if i >= 1 and (i - 1) % 4 == 3 and i < 16: x += 5
        if n >= 17:
            T(d, x + 6, 213 + dy, "…", f_, RED)
            T(d, 692, 285 + dy, "periodisch: 0011 wiederholt sich ewig", F(24, 400), GREY)
    f.el(ap(t, ct(2), 0.5), binr, dy=int((1 - ap(t, ct(2), 0.5)) * 12))
    # Abschneiden
    def cut(d, dy):
        T(d, 60, 372 + dy, "Speicher: endlich viele Stellen", F(28, 700), DARK)
        digs = "0001100110011001100110011001100110011001100110011010" + "0110011001100110"
        cw = 19; x0 = 60; y0 = 420 + dy
        k = clamp((t - (ct(3) + 0.3)) / 2.5)
        shown = int(k * len(digs))
        for i, ch in enumerate(digs[:shown]):
            kept = i < 52
            d.rounded_rectangle((x0 + i * cw, y0, x0 + i * cw + cw - 2, y0 + 40), 3, fill=BOX if kept else (225, 228, 233))
            T(d, x0 + i * cw + (cw - 2) / 2, y0 + 20, ch, M(16, True), CODE_T if kept else (170, 175, 185), "mm")
        if shown >= 52:
            xc = x0 + 52 * cw - 1
            d.line((xc, y0 - 22, xc, y0 + 62), fill=RED, width=4)
            T(d, xc - 8, y0 - 26, "hier ist Schluss (52 Bit)", F(22, 700), RED, "rd")
            T(d, xc + 10, y0 + 66, "wird abgeschnitten", F(22, 400), GREY, "la")
    f.el(ap(t, ct(3), 0.5), cut)
    def res(d, dy):
        d.rounded_rectangle((60, 560 + dy, 1220, 630 + dy), 35, fill=WHITE, outline=RED, width=3)
        T(d, 640, 595 + dy, "0,1 gespeichert =", F(30, 400), GREY, "rm")
        T(d, 640 + 14, 596 + dy, "0,1000000000000000055511…", M(34, True), RED, "lm")
    f.el(ap(t, ct(4), 0.5), res, dy=int((1 - ap(t, ct(4), 0.5)) * 12))

def scene3(f, t, ct):
    heading(f, t, "IEEE 754: Bits als Zahl")
    def big(d, dy):
        T(d, 640, 215 + dy, "IEEE 754", F(110, 700), DARK, "mm")
        T(d, 640, 300 + dy, "Standard für Gleitkommazahlen", F(36, 400), GREY, "mm")
    f.el(ap(t, 0.4, 0.6) * (1 - ap(t, ct(1) - 0.3, 0.5)), big)
    # Formel
    def formel(d, dy):
        T(d, 60, 135 + dy, "Dezimal:", F(28, 400), GREY)
        T(d, 230, 128 + dy, "− 6,02 × 10", F(44, 700), DARK); T(d, 230 + F(44, 700).getlength("− 6,02 × 10"), 122 + dy, "23", F(28, 700), DARK)
        T(d, 60, 205 + dy, "Binär:", F(28, 400), GREY)
        x = 230; ff = F(44, 700)
        parts = [("±", RED, "Vorzeichen"), (" 1,", DARK, None), ("Mantisse", MANT, "Mantisse"), (" × 2", DARK, None)]
        for s, c, _ in parts:
            T(d, x, 198 + dy, s, ff, c); x += ff.getlength(s)
        T(d, x, 190 + dy, "Exponent", F(28, 700), DARK)
        # Labels
        T(d, 230 + 8, 255 + dy, "Vorzeichen", F(22, 700), RED)
    f.el(ap(t, ct(1) + 0.4, 0.6) * (1 - ap(t, ct(4) - 0.3, 0.5)), formel, dy=int((1 - ap(t, ct(1) + 0.4, 0.6)) * 12))
    # Bitleisten
    def bars(d, dy):
        T(d, 60, 315 + dy, "float64 (Python)", F(28, 700), DARK)
        n = int(clamp((t - ct(2)) / 3.0) * 64)
        bits_cells(d, 60, 355, BITS64, [(1, RED), (11, DARK), (52, MANT)], 18, 38, n, dy, 2, 14)
        if n >= 64:
            T(d, 60 + 9, 400 + dy, "1", F(22, 700), RED, "ma"); T(d, 60 + 18 * 1 + 11 * 9, 400 + dy, "11 Bit Exponent", F(22, 700), DARK, "ma")
            T(d, 60 + 18 * 12 + 26 * 9, 400 + dy, "52 Bit Mantisse", F(22, 700), MANT, "ma")
    f.el(ap(t, ct(2), 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), bars)
    def bars32(d, dy):
        T(d, 60, 450 + dy, "float32 (REAL der SPS)", F(28, 700), DARK)
        n = int(clamp((t - ct(3)) / 2.5) * 32)
        bits_cells(d, 60, 490, BITS32, [(1, RED), (8, DARK), (23, MANT)], 36, 44, n, dy, 3, 20)
        if n >= 32:
            T(d, 60 + 18, 540 + dy, "1", F(22, 700), RED, "ma"); T(d, 60 + 36 * 1 + 36 * 4, 540 + dy, "8 Bit Exponent", F(22, 700), DARK, "ma")
            T(d, 60 + 36 * 9 + 36 * 11.5, 540 + dy, "23 Bit Mantisse", F(22, 700), MANT, "ma")
        if t > ct(3) + 3:
            T(d, 1220, 495 + dy, "", F(20, 400), GREY, "ra")
    f.el(ap(t, ct(3), 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), bars32)
    def hint(d, dy):
        T(d, 640, 600 + dy, "Beispiel: die Zahl 0,1 als Bitmuster", F(24, 400), GREY, "mm")
    f.el(ap(t, ct(3) + 3.0, 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), hint)
    # Zahlenstrahl
    a_line = ap(t, ct(4) + 0.2, 0.6)
    def nline(d, dy):
        x0, y0, sc = 80, 400 + dy, 70.0
        reveal = clamp((t - (ct(4) + 0.6)) / (ct(6) - ct(4) - 1.4)) * 16.0
        d.line((x0 - 10, y0, x0 + 16 * sc + 10, y0), fill=GREY, width=3)
        ticks = [0.0]
        for k in range(-4, 4):
            for j in range(8):
                ticks.append(2.0 ** k * (1 + j / 8.0))
        for v in ticks:
            if v > reveal: continue
            x = x0 + v * sc
            hgt = (22 + min(50, v * 6)) if v >= 1 else 20
            d.line((x, y0 - hgt, x, y0 + 4), fill=RED if v >= 8 else DARK, width=3 if v >= 4 else 2)
        for v in (0, 1, 2, 4, 8, 16):
            if v <= reveal + 0.01:
                T(d, x0 + v * sc, y0 + 18, str(v), F(24, 600), GREY, "ma")
        T(d, 640, 215 + dy, "darstellbare Zahlen (vereinfacht: 3 Mantissenbits)", F(26, 600), GREY, "mm")
        if reveal > 1.5:
            ka = ap(t, ct(5), 0.5)
            T(d, x0 + 1.0 * sc, y0 - 90 + dy, "dicht", F(30, 700), DARK, "mm") if ka > 0 else None
        if reveal > 15:
            x1, x2 = x0 + 8 * sc, x0 + 9 * sc
            d.line((x1, y0 - 56, x2, y0 - 56), fill=RED, width=4)
            d.polygon([(x1, y0 - 56), (x1 + 9, y0 - 62), (x1 + 9, y0 - 50)], fill=RED)
            d.polygon([(x2, y0 - 56), (x2 - 9, y0 - 62), (x2 - 9, y0 - 50)], fill=RED)
            T(d, x1 + 35, y0 - 100, "große Lücke", F(30, 700), RED, "mm")
    f.el(a_line * (1 - ap(t, ct(6) - 0.3, 0.5)), nline)
    # float32 Zoom
    def zoom(d, dy):
        card(d, 140, 170 + dy, 1000, 330)
        T(d, 180, 188 + dy, "float32 ab 2²⁴ = 16 777 216: Abstand zwischen Nachbarn = 2", F(30, 700), DARK)
        y = 340 + dy
        d.line((200, y, 1080, y), fill=GREY, width=3)
        for x, lab in ((320, "16 777 216"), (960, "16 777 218")):
            d.line((x, y - 22, x, y + 14), fill=DARK, width=4)
            T(d, x, y + 28, lab, F(32, 700), DARK, "ma")
        xm = 640
        k = ap(t, ct(7) - 0.3, 0.5)
        if k > 0:
            d.ellipse((xm - 14, y - 14, xm + 14, y + 14), outline=RED, width=4)
            T(d, xm, y - 70, "16 777 217", F(32, 700), RED, "mm")
            T(d, xm, y - 40, "nicht darstellbar", F(22, 400), GREY, "mm")
            d.line((xm - 12, y - 12, xm + 12, y + 12), fill=RED, width=4); d.line((xm - 12, y + 12, xm + 12, y - 12), fill=RED, width=4)
        T(d, 640, 440 + dy, "wird gerundet", F(24, 400), GREY, "mm")
    f.el(ap(t, ct(6), 0.6), zoom, dy=int((1 - ap(t, ct(6), 0.6)) * 12))

def scene4(f, t, ct):
    heading(f, t, "Was das für dich heißt")
    def mkcard(i, x, title, t_in, body):
        def fn(d, dy):
            card(d, x, 140 + dy, 370, 470)
            d.ellipse((x + 28, 162 + dy, x + 80, 214 + dy), fill=RED)
            T(d, x + 54, 188 + dy, str(i), F(34, 700), WHITE, "mm")
            T(d, x + 96, 188 + dy, title, F(25, 700), DARK, "lm")
            body(d, x, dy)
        f.el(ap(t, t_in, 0.5), fn, dy=int((1 - ap(t, t_in, 0.5)) * 14))
    def b1(d, x, dy):
        code_box(d, x + 20, 240 + dy, 330, 170,
                 [(ct(1) + 0.4, [("0.1+0.2 == 0.3", CODE_T)]),
                  (ct(1) + 1.6, [("# False", CODE_R)])], t, 22)
        code_box(d, x + 20, 430 + dy, 330, 160,
                 [(ct(2) + 0.4, [("math.isclose(", CODE_K)]),
                  (ct(2) + 0.9, [("  0.1+0.2, 0.3)", CODE_T)]),
                  (ct(2) + 2.2, [("# True", CODE_G)])], t, 22)
    mkcard(1, 60, "Nie mit ==", ct(1), b1)
    def b2(d, x, dy):
        code_box(d, x + 20, 240 + dy, 330, 350,
                 [(ct(3) + 0.3, [("s = 0.0", CODE_T)]),
                  (ct(3) + 0.8, [("for _ in range(10):", CODE_K)]),
                  (ct(3) + 1.4, [("    s += 0.1", CODE_T)]),
                  (ct(4) + 0.3, [("print(s)", CODE_T)]),
                  (ct(4) + 1.2, [("0.9999999999999999", CODE_R)])], t, 21)
        a = ap(t, ct(4) + 2.4, 0.5)
        def ex(d2, dy2): T(d2, x + 185, 560 + dy2, "nicht 1.0", F(26, 700), RED, "mm")
        f.el(a, ex)
    mkcard(2, 455, "Fehler summieren sich", ct(3), b2)
    def b3(d, x, dy):
        code_box(d, x + 20, 240 + dy, 330, 350,
                 [(ct(5) + 0.4, [("# float32 (REAL)", CODE_C)]),
                  (ct(5) + 1.2, [("Lücke bei 1 000 000:", CODE_T)]),
                  (ct(5) + 2.0, [("0.0625", CODE_R)]),
                  (ct(5) + 3.0, [("Lücke ab 16 777 216:", CODE_T)]),
                  (ct(5) + 4.0, [("2.0", CODE_R)])], t, 21)
    mkcard(3, 850, "float32 in Steuerungen", ct(5), b3)

def scene5(f, t, ct):
    heading(f, t, "KI-Spiegel: Würdest du das freigeben?")
    def code(d, dy):
        code_box(d, 60, 140 + dy, 640, 320,
                 [(ct(1) + 0.2, [("# von der KI erzeugt", CODE_C)]),
                  (ct(1) + 0.7, [("def pruefe(a, b):", CODE_K)]),
                  (ct(1) + 1.3, [("    summe = a + b", CODE_T)]),
                  (ct(1) + 2.0, [("    if summe ", CODE_K), ("== 0.3", CODE_R), (":", CODE_K)]),
                  (ct(1) + 3.0, [("        return ", CODE_K), ("\"OK\"", CODE_G)]),
                  (ct(1) + 3.6, [("    return ", CODE_K), ("\"Fehler\"", CODE_R)])], t, 28, hl=("== 0.3",))
    f.el(ap(t, ct(1) - 0.2, 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), code)
    def run(d, dy):
        card(d, 740, 140 + dy, 480, 320)
        d.ellipse((765, 168 + dy, 801, 204 + dy), fill=GREEN)
        T(d, 815, 186 + dy, "läuft ohne Fehlermeldung", F(26, 600), DARK, "lm")
        T(d, 770, 245 + dy, "pruefe(0.1, 0.2)", M(26, True), DARK)
        if ap(t, ct(2) + 1.5, 0.3) > 0.5:
            T(d, 770, 290 + dy, "→ \"Fehler\"", M(30, True), RED)
            T(d, 770, 345 + dy, "Erwartet: \"OK\"", F(26, 400), GREY)
            T(d, 770, 385 + dy, "scheitert erst im Betrieb", F(26, 700), RED)
    f.el(ap(t, ct(2), 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), run, dy=int((1 - ap(t, ct(2), 0.5)) * 12))
    def eye(d, dy):
        d.rounded_rectangle((60, 500 + dy, 1220, 580 + dy), 40, fill=WHITE, outline=RED, width=3)
        T(d, 640, 540 + dy, "Genau hier musst du hinschauen: ein Float-Vergleich mit ==", F(32, 700), RED, "mm")
    f.el(ap(t, ct(3), 0.5) * (1 - ap(t, ct(4) - 0.3, 0.5)), eye, dy=int((1 - ap(t, ct(3), 0.5)) * 12))
    # Ampel
    rows = [(RED, "Im Kopf", "Dass es passiert und warum", 4, 1.0),
            (AMBER, "Lesen & erkennen", "Code verstehen, nicht zwingend selbst schreiben", 4, 0.45),
            (GREEN, "Delegieren", "Bitmuster von Hand umrechnen: nachschlagen oder KI", 5, 1.0)]
    for r, (col, ti, de, ci, dim) in enumerate(rows):
        def fn(d, dy, col=col, ti=ti, de=de, r=r, ci=ci):
            y = 150 + r * 135 + dy
            hot = (r == 0 and ct(4) <= t < ct(5)) or (r == 2 and t >= ct(5))
            card(d, 140, y, 1000, 110, stripe=False, fill=WHITE)
            if hot: d.rounded_rectangle((140, y, 1140, y + 110), 14, outline=col, width=4)
            d.ellipse((170, y + 25, 230, y + 85), fill=col)
            T(d, 270, y + 22, ti, F(36, 700), DARK)
            T(d, 270, y + 66, de, F(26, 400), GREY)
        a = ap(t, ct(4) + 0.1 + r * 0.25, 0.5) * dim
        f.el(a, fn, dy=int((1 - ap(t, ct(4) + 0.1 + r * 0.25, 0.5)) * 12))

def scene6(f, t, ct):
    heading(f, t, "Jetzt du: die Explorables")
    def c1(d, dy):
        card(d, 60, 150 + dy, 560, 320)
        T(d, 92, 170 + dy, "Bits kippen", F(36, 700), DARK)
        T(d, 92, 220 + dy, "Klick auf ein Bit, sieh die Zahl sich ändern", F(24, 400), GREY)
        base = "0011111110111001"
        for i, ch in enumerate(base):
            flip = (int(t * 1.2) % 16 == i)
            c = ch if not flip else ("1" if ch == "0" else "0")
            col = RED if flip else (RED if i == 0 else (DARK if i < 12 else MANT))
            x = 92 + i * 31
            d.rounded_rectangle((x, 290 + dy, x + 28, 340 + dy), 4, fill=col)
            T(d, x + 14, 315 + dy, c, M(24, True), WHITE, "mm")
        T(d, 92, 380 + dy, "Vorzeichen · Exponent · Mantisse", F(24, 600), GREY)
    f.el(ap(t, ct(1), 0.5), c1, dy=int((1 - ap(t, ct(1), 0.5)) * 14))
    def c2(d, dy):
        card(d, 660, 150 + dy, 560, 320)
        T(d, 692, 170 + dy, "Zahlenstrahl mit Lücken", F(36, 700), DARK)
        T(d, 692, 220 + dy, "Zoome rein und sieh, wo Zahlen fehlen", F(24, 400), GREY)
        y0 = 360 + dy; d.line((692, y0, 1190, y0), fill=GREY, width=3)
        grow = 0.6 + 0.4 * math.sin(t * 1.5)
        x = 692.0; gap = 4.0 * (0.8 + grow * 0.4)
        while x < 1190:
            d.line((x, y0 - 18, x, y0 + 4), fill=RED if gap > 14 else DARK, width=2); x += gap; gap *= 1.12
    f.el(ap(t, ct(1) + 0.6, 0.5), c2, dy=int((1 - ap(t, ct(1) + 0.6, 0.5)) * 14))
    def end(d, dy):
        d.rounded_rectangle((260, 520 + dy, 1020, 620 + dy), 50, fill=RED)
        T(d, 640, 570 + dy, "Probier es aus!", F(56, 700), WHITE, "mm")
    f.el(ap(t, ct(2), 0.5), end, dy=int((1 - ap(t, ct(2), 0.5)) * 14))

SCENES = {1: scene1, 2: scene2, 3: scene3, 4: scene4, 5: scene5, 6: scene6}

def render_frame(gt, tl):
    total = tl["total"]
    sec = 6
    for i in range(1, 7):
        if gt < tl[i]["start"] + tl[i]["len"]: sec = i; break
    s = tl[sec]; t = gt - s["start"]
    chunks = s["chunks"]
    ct = lambda k: chunks[k][0]
    # Master-Fade
    m = ap(t, 0.0, 0.4) if sec > 1 else 1.0
    if sec < 6: m *= 1 - ap(t, s["len"] - 0.4, 0.4)
    else: m *= 1 - ap(t, s["len"] - 0.6, 0.6)
    fr = Frame(m)
    SCENES[sec](fr, t, ct)
    chrome(fr, gt, total)
    return fr.img

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 150, "V03 · Informatik", F(34, 600), GREY)
        T(d, 90, 200, "Fließkommazahlen", F(104, 700), DARK)
        T(d, 90, 330, "Warum 0.1 + 0.2 nicht 0.3 ist", F(48, 400), GREY)
        code_box(d, 90, 430, 760, 130, [(0, [(">>> ", CODE_C), ("0.1 + 0.2", CODE_T)]), (0, [("0.30000000000000004", CODE_R)])], 9, 34)
        for i, ch in enumerate(BITS64[:32]):
            pass
        for (bx, bw, bc, bl) in ((900, 50, RED, "V"), (955, 110, DARK, "Exponent"), (1070, 150, MANT, "Mantisse")):
            d.rounded_rectangle((bx, 470, bx + bw, 520), 6, fill=bc); T(d, bx + bw / 2, 495, bl, F(20, 700), WHITE, "mm")
        T(d, 1220, 694, "DHBW · Informatik · V03", F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.save(path)

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "text":   # Vorschau ohne Kosten
        for i, v in SRC.items():
            roh = " ".join(v); print(f"s{i} ({len(sprechfassung(roh))} Z.): {sprechfassung(roh)}")
            for h in pruefen(roh): print("  PRUEFEN:", h)
            print()
        sys.exit()
    if mode == "vertonen":   # je Absatz eine Datei audio/sN.mp3 (+ sN.sprech.txt)
        gesamt = 0
        for i, v in SRC.items():
            roh = " ".join(v); tts(roh, os.path.join(HERE, "audio", f"s{i}.mp3")); gesamt += len(sprechfassung(roh))
        print("Zeichen gesendet", gesamt); sys.exit()
    tl = build_timeline()
    json.dump(tl, open(os.path.join(OUT, "timeline.json"), "w"), indent=1)
    write_vtt(tl, os.path.join(OUT, "v03.vtt"))
    print("Gesamtdauer", tl["total"])
    if mode == "poster":
        poster(os.path.join(OUT, "v03-poster.png"))
    elif mode == "stills":
        for gt in map(float, sys.argv[2:]):
            render_frame(gt, tl).save(os.path.join(OUT, f"still_{gt:07.2f}.png"))
    else:
        n = int(tl["total"] * FPS) + 1
        p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                              "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
                              os.path.join(OUT, "v03_silent.mp4")], stdin=subprocess.PIPE)
        for k in range(n):
            p.stdin.write(render_frame(k / FPS, tl).tobytes())
            if k % 500 == 0: print(k, n, flush=True)
        p.stdin.close(); p.wait()
