"""V18 Python-Werkzeugkasten: bytes, encode, hashlib, Dateien binaer lesen, Pruefsummen vergleichen (Code wird echt ausgefuehrt, Ausgaben stammen daraus).
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]  (tts/full erst nach Freigabe der Credits; ohne Audio nur text/probe/scan/zeiten)"""
import os, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v18-common"))
from h18 import *
from texte import SRC

NAME = "v18-python"; LABEL = "DHBW · Informatik · V18 · Python-Werkzeugkasten"
SECS = make_secs(SRC)
ROOT = os.path.join(HERE, "..", "..")
DATA = os.path.abspath(os.path.join(ROOT, "site", "assets", "data", "v18"))

def ausfuehren(code, cwd=None):
    old = os.getcwd(); os.chdir(cwd or DATA)
    try: return run_code(code)
    finally: os.chdir(old)

H1450 = hashlib.sha256(b"Drehzahl 1450").hexdigest()
FW = open(os.path.join(DATA, "R1_fw_3.2.1.bin"), "rb").read()
SOLL = open(os.path.join(DATA, "R1_fw_3.2.1.bin.sha256"), encoding="utf-8").read().split()[0]
assert H1450.startswith("23f2ab28ad6cc6b5") and SOLL.startswith("f457673f9e3b31fd") and hashlib.sha256(FW).hexdigest() == SOLL

# ---------------------------------------------------------------- echte Ausfuehrung
C1 = ['text = "Drehzahl 1450"', 'daten = text.encode("utf-8")', 'print(type(daten), len(daten))', 'print(len("Ä"), len("Ä".encode("utf-8")))']
O1 = ausfuehren("\n".join(C1)); assert O1 == ["<class 'bytes'> 13", "1 2"], O1
try: hashlib.sha256("Drehzahl 1450")
except TypeError as e: ERR1 = "TypeError: " + str(e)
assert "encoded" in ERR1, ERR1

C2 = ['import hashlib', 'daten = "Drehzahl 1450".encode("utf-8")', 'h = hashlib.sha256(daten)', 'print(h.hexdigest())', 'print(len(h.hexdigest()))']
O2 = ausfuehren("\n".join(C2)); assert O2 == [H1450, "64"], O2

C3 = ['h = hashlib.sha256()', 'with open(pfad, "rb") as datei:', '    while True:', '        block = datei.read(4096)', '        if not block:', '            break', '        h.update(block)', 'print(h.hexdigest())']
O3 = ausfuehren('import hashlib\npfad = "R1_fw_3.2.1.bin"\n' + "\n".join(C3)); assert O3 == [SOLL], O3
NBLOCK = (len(FW) + 4095) // 4096; assert NBLOCK == 16

C4 = ['with open("R1_fw_3.2.1.bin.sha256", encoding="utf-8") as f:', '    text = f.read()', 'teile = text.split()', 'print(len(teile))', 'print(teile[0][:16])']
O4 = ausfuehren("\n".join(C4)); assert O4 == ["2", SOLL[:16]], O4

C5 = ['roh = " F457673F9E3B31FD \\n"', 'print(roh == "f457673f9e3b31fd")', 'ist = roh.strip().lower()', 'print(ist == "f457673f9e3b31fd")']
O5 = ausfuehren("\n".join(C5)); assert O5 == ["False", "True"], O5

def codeblock(f, t, x, y, w, lines, t0, size, lh, hl=None, cps=45, a0=None):
    times = [t0 + sum(len(l) / cps + 0.12 for l in lines[:k]) for k in range(len(lines))]
    f.el(ap(t, a0 if a0 is not None else t0 - 0.2, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, None, times, t, size, lh, hl, cps))
    return 50 + lh * len(lines) + 18
def outpanel(f, t, x, y, w, ents, t0, size=22, lh=34):
    """ents: Liste von (Segmente-Liste oder Text); erscheinen ab t0 gestaffelt."""
    h = 46 + lh * len(ents) + 14
    es = [(t0 + k * 0.6, e if isinstance(e, list) else [(e, CODE_T)]) for k, e in enumerate(ents)]
    f.el(show(t, t0 - 0.2), lambda d, dy: console_panel(d, x, y + dy, w, h, es, t, size, title="Ausgabe", lh=lh), dy=dyf(t, t0 - 0.2))
    return h
def hlsel(t, sched): return hl_at(t, [(0, None)] + sched)

# ---------------------------------------------------------------- 1 bytes und encode
def sc1(f, t, ct):
    heading(f, t, "bytes und str: erst encode, dann Hash")
    codeblock(f, t, 60, 112, 700, C1, ct(1) + 0.2, 22, 34, hlsel(t, [(ct(1), {0, 1}), (ct(1) + 3.0, {2}), (ct(2), {3})]))
    outpanel(f, t, 60, 330, 700, O1, ct(1) + 2.5)
    def kachel(d, dy, x, y, titel, sub, bsp, fill, col):
        card(d, x, y + dy, 210, 150, stripe=False); T2(d, x + 105, y + 14 + dy, titel, F(32, 700), col, "ma"); T2(d, x + 105, y + 60 + dy, sub, F(22, 600), GREY, "ma")
        chip(d, x + 14, y + 94 + dy, 182, 44, bsp, fill, col, 20, mono=True)
    f.el(show(t, 0.3), lambda d, dy: kachel(d, dy, 790, 112, "str", "Text", '"Drehzahl"', LIGHTB, BLUE), dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 1.5), lambda d, dy: kachel(d, dy, 1010, 112, "bytes", "rohe Bytes", 'b"Drehzahl"', LIGHTA, AMB), dy=dyf(t, ct(0) + 1.5))
    def aekachel(d, dy):
        card(d, 790, 290 + dy, 430, 150); T2(d, 820, 302 + dy, "Ä = ein Zeichen", F(28, 700), DARK, "la")
        chip(d, 820, 350 + dy, 60, 56, "Ä", LIGHTB, BLUE, 30)
        a = ap(t, ct(2) + 0.8, 0.4)
        if a > 0:
            arrow(d, 892, 378 + dy, 940, 378 + dy, GREY, 4, 12)
            chip(d, 950, 350 + dy, 80, 56, "C3", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 26, mono=True); chip(d, 1040, 350 + dy, 80, 56, "84", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 26, mono=True)
            T2(d, 1132, 378 + dy, "2 Bytes", F(22, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(2) + 0.2), aekachel, dy=dyf(t, ct(2) + 0.2))
    def fehler(d, dy):
        d.rounded_rectangle((60, 520 + dy, 1220, 640 + dy), 14, fill=BOX2); T(d, 82, 532 + dy, "Ohne encode", F(20, 600), CODE_C)
        T2(d, 82, 568 + dy, 'hashlib.sha256("Drehzahl 1450")', M(24), CODE_T, "la")
        T2(d, 82, 602 + dy, ERR1, M(22), CODE_R, "la")
    f.el(show(t, ct(3) + 0.2), fehler, dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 2 sha256 und hexdigest
def sc2(f, t, ct):
    heading(f, t, "hashlib: der Fingerabdruck als Text")
    codeblock(f, t, 60, 112, 700, C2, ct(0) + 0.2, 22, 34, hlsel(t, [(ct(0), {0, 2}), (ct(1), {3, 4})]))
    outpanel(f, t, 60, 372, 1160, [[(O2[0][:8], CODE_N), (O2[0][8:], CODE_T)], O2[1]], ct(1) + 0.8)
    def tile64(d, dy):
        card(d, 790, 112 + dy, 430, 218); T2(d, 820, 124 + dy, "Länge des Hash", F(26, 700), DARK, "la")
        T2(d, 820, 168 + dy, "64", F(64, 700), RED, "la"); T2(d, 920, 196 + dy, "Hex-Zeichen", F(28, 700), DARK, "la")
        T2(d, 820, 250 + dy, "× 4 bit = 256 bit", F(30, 700), GREEN, "la")
    f.el(show(t, ct(1) + 0.3), tile64, dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 528 + dy, 1160, 46, "Der Anfang 23f2ab28 gehört zu „Drehzahl 1450“", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(2) + 0.3))
    def alt(d, dy):
        card(d, 60, 590 + dy, 1160, 90, stripe=False); badge(d, 104, 635 + dy, 22, False)
        T2(d, 146, 635 + dy, "md5 und sha1: gebrochen, nicht mehr für Sicherheit", F(30, 700), RED, "lm")
    f.el(show(t, ct(3) + 0.2), alt, dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 3 Datei blockweise
def sc3(f, t, ct):
    heading(f, t, "Datei binär, Block für Block")
    codeblock(f, t, 60, 112, 700, C3, ct(0) + 0.2, 20, 31, hlsel(t, [(ct(0), {1}), (ct(1), {2, 3, 4, 5}), (ct(2), {6, 0}), (ct(3), {7})]), cps=40)
    outpanel(f, t, 60, 444, 1160, [O3[0]], ct(3) + 0.3)
    t0 = ct(2) + 0.3; n = int(max(0.0, t - t0) * 2.2) if t >= t0 else 0; n = min(n, NBLOCK)
    def grid16(d, dy):
        card(d, 790, 112 + dy, 430, 310); T2(d, 820, 124 + dy, "R1_fw_3.2.1.bin: 65 536 Bytes", F(24, 700), DARK, "la")
        for k in range(NBLOCK):
            x = 820 + (k % 8) * 48; y = 168 + (k // 8) * 56
            on = k < n; d.rounded_rectangle((x, y + dy, x + 42, y + 48 + dy), 6, fill=GREEN if on else LIGHTK, outline=LINE)
            T2(d, x + 21, y + 24 + dy, str(k + 1), F(20, 700), WHITE if on else GREY, "mm")
        T2(d, 820, 290 + dy, f"{max(n, 0)} von {NBLOCK} Blöcken (je 4096 Bytes)", F(24, 600), GREY, "la")
        chip(d, 820, 340 + dy, 370, 56, "h.update(block)", LIGHTG if n else LIGHTK, GREEN if n else GREY, 24, mono=True)
    f.el(show(t, ct(0) + 0.3), grid16, dy=dyf(t, ct(0) + 0.3))
    f.el(show(t, ct(3) + 1.2), lambda d, dy: tag(d, 60, 560 + dy, 760, 50, "= SHA-256-Prüfsumme der ganzen Datei", LIGHTG, GREEN, 26, outl=GREEN), dy=dyf(t, ct(3) + 1.2))

# ---------------------------------------------------------------- 4 Pruefsummendatei und split
def sc4(f, t, ct):
    heading(f, t, "Prüfsummendatei lesen: split")
    def zeile(d, dy):
        card(d, 60, 112 + dy, 1160, 120); T2(d, 90, 122 + dy, "Inhalt von R1_fw_3.2.1.bin.sha256", F(24, 700), DARK, "la")
        chip(d, 90, 166 + dy, 560, 50, SOLL[:14] + "…" + SOLL[-4:] + " (64 Zeichen)", LIGHTG, GREEN, 22, mono=True)
        chip(d, 690, 166 + dy, 330, 50, "R1_fw_3.2.1.bin", LIGHTK, GREY, 22, mono=True)
        T2(d, 670, 150 + dy, "2 Leerzeichen", F(16, 600), GREY, "mm")
    f.el(show(t, 0.3), zeile, dy=dyf(t, 0.3))
    h = codeblock(f, t, 60, 264, 780, C4, ct(1) + 0.2, 20, 32, hlsel(t, [(ct(1), {0, 1}), (ct(1) + 3.0, {2}), (ct(2), {4})]), a0=ct(0) + 0.2)
    outpanel(f, t, 60, 264 + h + 20, 780, O4, ct(2) + 0.3)
    def lst(d, dy):
        card(d, 870, 264 + dy, 350, 250); T2(d, 896, 276 + dy, "teile = text.split()", M(20, True), DARK, "la")
        chip(d, 896, 330 + dy, 298, 50, "[0]  " + SOLL[:10] + "…", LIGHTG, GREEN, 20, mono=True)
        chip(d, 896, 396 + dy, 298, 50, "[1]  R1_fw_3.2.1.bin", LIGHTK, GREY, 18, mono=True)
        a = ap(t, ct(2) + 0.2, 0.4)
        if a > 0: T2(d, 1045, 470 + dy, "Index 0 = der Hash", F(22, 700), mix(WHITE, RED, a), "mm")
    f.el(show(t, ct(1) + 0.8), lst, dy=dyf(t, ct(1) + 0.8))

# ---------------------------------------------------------------- 5 strip, lower, Vergleich
def sc5(f, t, ct):
    heading(f, t, "Vor dem Vergleich säubern")
    codeblock(f, t, 60, 112, 760, C5, ct(0) + 0.2, 22, 34, hlsel(t, [(ct(0), {0, 1}), (ct(1), {2}), (ct(2), {3})]))
    outpanel(f, t, 60, 340, 760, [[(O5[0], CODE_R)], [(O5[1], CODE_G)]], ct(1) + 1.0)
    def kette(d, dy):
        card(d, 850, 112 + dy, 370, 356); T2(d, 876, 124 + dy, "roh → sauber", F(26, 700), DARK, "la")
        chip(d, 876, 170 + dy, 318, 52, '" F457673F9E3B31FD \\n"', LIGHTR, RED, 20, mono=True)
        a = ap(t, ct(1) + 0.4, 0.4)
        if a > 0:
            T2(d, 1035, 252 + dy, "strip()", M(22, True), mix(WHITE, RED, a), "mm"); chip(d, 876, 276 + dy, 318, 52, "F457673F9E3B31FD", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 20, mono=True)
        b = ap(t, ct(1) + 1.6, 0.4)
        if b > 0:
            T2(d, 1035, 358 + dy, "lower()", M(22, True), mix(WHITE, RED, b), "mm"); chip(d, 876, 382 + dy, 318, 52, "f457673f9e3b31fd", mix(WHITE, LIGHTG, b), mix(WHITE, GREEN, b), 20, mono=True)
    f.el(show(t, ct(0) + 0.8), kette, dy=dyf(t, ct(0) + 0.8))
    def entsch(d, dy):
        chip(d, 60, 494 + dy, 560, 54, "ist == soll  →  einspielen", LIGHTG, GREEN, 26, outl=GREEN); chip(d, 660, 494 + dy, 560, 54, "ist != soll  →  nicht einspielen", LIGHTR, RED, 26, outl=RED)
    f.el(show(t, ct(2) + 0.3), entsch, dy=dyf(t, ct(2) + 0.3))
    def merk(d, dy):
        card(d, 60, 566 + dy, 1160, 116); T2(d, 90, 574 + dy, "Merke", F(24, 700), RED, "la")
        items = ["bytes für Hashes", "binär lesen", "blockweise", "vor dem Vergleich säubern"]; xs = [90, 380, 640, 880]
        for k, s in enumerate(items):
            a = ap(t, ct(3) + 0.3 + 0.9 * k, 0.4)
            if a > 0:
                x = [90, 90, 650, 650][k]; y = [616, 646, 616, 646][k]
                d.ellipse((x, y + dy, x + 26, y + 26 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 13, y + 13 + dy, 15, WHITE, 3)
                T2(d, x + 38, y + 13 + dy, s, F(24, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.1), merk, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V18 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-Werkzeugkasten", F(80, 700), DARK)
        T2(d, 90, 270, "hashlib und Dateien binär lesen", F(48, 400), GREY)
        code_n(d, 90, 370, 760, C3[:8], None, [-1] * 8, 9, 20, 31, {6}, title="Python")
        chip(d, 900, 392, 300, 56, "sha256", LIGHTB, BLUE, 28, outl=BLUE, mono=True); chip(d, 900, 464, 300, 56, "hexdigest()", LIGHTG, GREEN, 28, outl=GREEN, mono=True)
        chip(d, 900, 536, 300, 56, "read(4096)", LIGHTA, AMB, 28, outl=AMB, mono=True)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
