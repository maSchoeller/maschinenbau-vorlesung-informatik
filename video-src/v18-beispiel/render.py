"""V18 Vorgerechnet: Firmware von Roboter R1 vor dem Einspielen pruefen (Code exakt aus briefing/v18-beispiel.py, Ausgabe wird echt berechnet).
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]  (tts/full erst nach Freigabe der Credits; ohne Audio nur text/probe/scan/zeiten)"""
import os, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v18-common"))
from h18 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v18-beispiel"; LABEL = "DHBW · Informatik · V18 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echte Ausgabe
ROOT = os.path.join(HERE, "..", "..")
CODE = open(os.path.join(ROOT, "briefing", "v18-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 33 and CODE[4] == "import hashlib" and CODE[7].startswith("def sha256_datei") and CODE[19].startswith("with open(") \
    and CODE[23].startswith("for name") and CODE[32].startswith('print(hashlib.sha256(b"Drehzahl 1451")'), "briefing/v18-beispiel.py hat sich geaendert"
DATA = os.path.abspath(os.path.join(ROOT, "site", "assets", "data", "v18"))
_cwd = os.getcwd(); os.chdir(DATA)
try: OUT = run_code("\n".join(CODE))
finally: os.chdir(_cwd)
ERWARTET = ["Soll (Hersteller): f457673f9e3b31fd ...", "R1_fw_3.2.1.bin: OK - darf eingespielt werden",
            "R1_fw_3.2.1_usb.bin: ABWEICHUNG - nicht einspielen! (c01a88afebff47f1 ...)", "23f2ab28ad6cc6b5", "2318b47cd742ca40"]
assert OUT == ERWARTET, OUT
A = open(os.path.join(DATA, "R1_fw_3.2.1.bin"), "rb").read(); B = open(os.path.join(DATA, "R1_fw_3.2.1_usb.bin"), "rb").read()
DIFF = [i for i in range(len(A)) if A[i] != B[i]]
assert DIFF == [40000] and bin(A[40000] ^ B[40000]).count("1") == 1, DIFF       # genau ein Bit an Byte 40000
SOLL, USB = OUT[0].split()[2], OUT[2].split("(")[1].split()[0]
H1450, H1451 = OUT[3], OUT[4]
BITS = bin(int(hashlib.sha256(b"Drehzahl 1450").hexdigest(), 16) ^ int(hashlib.sha256(b"Drehzahl 1451").hexdigest(), 16)).count("1")
PROG = "Python (briefing/v18-beispiel.py)"

def nums(a, b): return list(range(a, b + 1))
def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums(a, b), times, t, size, lh, hl, title=PROG))
def put(times, idxs, start, a, cps=55, gap=0.1):
    c = start
    for i in idxs:
        times[i] = c; c += max(len(CODE[a - 1 + i]), 4) / cps + gap
    return c
def hexdiff(d, x, y, s1, s2, size, col, t0, t):
    """Zwei Hex-Zeichenketten untereinander, abweichende Zeichen werden rot."""
    fm = M(size, True); cw = fm.getlength("0")
    for k, s in enumerate((s1, s2)):
        for i, ch in enumerate(s):
            c = RED if (s1[i] != s2[i] and ap(t, t0, 0.5) > 0.5) else col
            T2(d, x + i * cw, y + k * 40, ch, fm, c, "la")

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Firmware prüfen: stimmt die Datei vom Stick?")
    def r1(d, dy):
        card(d, 60, 128 + dy, 340, 190); T2(d, 88, 142 + dy, "Zelle FZ-3", F(30, 700), DARK); T2(d, 88, 184 + dy, "Roboter R1", F(26, 600), GREY)
        chip(d, 88, 232 + dy, 284, 56, "R1: Firmware 3.2.1?", LIGHTR, RED, 26, outl=RED)
    f.el(show(t, 0.3), r1, dy=dyf(t, 0.3))
    def usb(d, dy):
        card(d, 430, 128 + dy, 380, 190); T2(d, 458, 142 + dy, "USB-Stick", F(30, 700), DARK); T2(d, 458, 184 + dy, "vom Servicetechniker", F(24, 600), GREY)
        chip(d, 458, 232 + dy, 324, 56, "R1_fw_3.2.1_usb.bin", LIGHTA, AMB, 22, mono=True)
    f.el(show(t, 0.9), usb, dy=dyf(t, 0.9))
    def web(d, dy):
        card(d, 840, 128 + dy, 380, 190); T2(d, 868, 142 + dy, "Download-Seite", F(30, 700), DARK); T2(d, 868, 184 + dy, "des Herstellers", F(24, 600), GREY)
        chip(d, 868, 226 + dy, 324, 40, "R1_fw_3.2.1.bin", LIGHTB, BLUE, 20, mono=True)
        a = ap(t, ct(0) + 2.0, 0.5)
        if a > 0: chip(d, 868, 272 + dy, 324, 40, "….bin.sha256 (SHA-256)", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 18, mono=True)
    f.el(show(t, 1.5), web, dy=dyf(t, 1.5))
    tasks = [(ct(1) + 0.2, "Soll-Prüfsumme aus der Herstellerdatei lesen"), (ct(1) + 1.6, "Von jeder Datei die Prüfsumme berechnen"), (ct(1) + 3.0, "Vergleichen: OK oder Abweichung")]
    def prog(d, dy):
        card(d, 60, 348 + dy, 1160, 290, stripe=False)
        T2(d, 90, 362 + dy, "Das Programm soll …", F(32, 700), DARK, "la")
        for k, (te, s) in enumerate(tasks):
            a = ap(t, te, 0.4)
            if a > 0:
                y = 428 + k * 66
                d.ellipse((90, y + dy, 130, y + 40 + dy), fill=mix(WHITE, RED, a)); T2(d, 110, y + 20 + dy, str(k + 1), F(26, 700), WHITE, "mm")
                T2(d, 150, y + 20 + dy, s, F(30, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(1) + 0.1), prog, dy=dyf(t, ct(1) + 0.1))

# ---------------------------------------------------------------- 2 Programmablaufplan
def build_pap():
    D = Dia(19); N = D.node
    N("s", "term", "Start", 0, 0); N("sl", "io", "Soll-Prüfsumme lesen", 0, 0); N("fe", "dec", "weitere Datei?", 0, 0)
    N("calc", "sub", "ist = sha256_datei(datei)", 0, 0); N("cmp", "dec", "ist == soll?", 0, 0)
    N("okm", "proc", "ergebnis = OK", 0, 0); N("badm", "proc", "ergebnis = ABWEICHUNG", 0, 0); N("out", "io", "Ergebnis ausgeben", 0, 0); N("end", "term", "Ende", 0, 0)
    n = D.nodes; Y0, Y1, Y1b, Y2 = 44, 176, 288, 410
    n["s"].cy = n["sl"].cy = Y0; n["s"].cx = 30 + n["s"].w / 2; n["sl"].cx = n["s"].bbox()[2] + 50 + n["sl"].w / 2
    n["fe"].cx = 30 + n["fe"].w / 2; n["fe"].cy = Y1
    for a, b, g in (("fe", "calc", 64), ("calc", "cmp", 56), ("cmp", "okm", 64), ("okm", "out", 52)):
        n[b].cy = Y1; n[b].cx = n[a].bbox()[2] + g + n[b].w / 2
    n["badm"].cx = n["cmp"].cx; n["badm"].cy = Y1b
    n["end"].cx = n["fe"].cx; n["end"].cy = Y2
    E = D.edge
    E("s-sl", "s", "r", "sl", "l"); E("sl-fe", "sl", "b", "fe", "t")
    E("fe-calc", "fe", "r", "calc", "l", label="ja"); E("calc-cmp", "calc", "r", "cmp", "l")
    E("cmp-okm", "cmp", "r", "okm", "l", label="ja"); E("cmp-badm", "cmp", "b", "badm", "t", label="nein")
    E("okm-out", "okm", "r", "out", "l"); E("badm-out", "badm", "r", n["out"].port("b"), None, via=[(n["out"].cx, Y1b)])
    yb = n["fe"].bbox()[1] - 12
    E("out-fe", "out", "t", (n["fe"].cx, yb), None, via=[(n["out"].cx, yb)])
    E("fe-end", "fe", "b", "end", "t", label="nein")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-sl", "sl", "sl-fe"],
           ["fe", "fe-calc", "calc", "calc-cmp", "cmp"],
           ["cmp-okm", "okm", "cmp-badm", "badm", "okm-out", "badm-out", "out", "out-fe", "fe-end", "end"]]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 500); PZOOM = min(1.12, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan: lesen, berechnen, vergleichen")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * 0.5
    cur = max([g for g in range(3) if t >= ct(g)] or [0])
    hl = {k: PAL[cur] for k in PGROUPS[cur]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)
    f.el(show(t, ct(2) + 1.0), lambda d, dy: tag(d, 60, 624 + dy, 760, 44, "bei Abweichung nie einspielen, sondern melden", LIGHTR, RED, 24, outl=RED), dy=dyf(t, ct(2) + 1.0))

# ---------------------------------------------------------------- 3 Zeilen 5 bis 17
def sc3(f, t, ct):
    heading(f, t, "Die Funktion: Zeilen 5 bis 17")
    times = [1e9] * 13
    put(times, (0, 3, 4), ct(0) + 0.2, 5); put(times, (5, 6), ct(1) + 0.2, 5); put(times, (7, 8, 9, 10), ct(2) + 0.2, 5); put(times, (11, 12), ct(3) + 0.2, 5)
    hl = hl_at(t, [(0, None), (ct(0), {0, 3, 4}), (ct(1), {5, 6}), (ct(2), {7, 8, 9, 10}), (ct(3), {11, 12})])
    code_scene(f, t, 5, 17, 18, 28, 60, 112, 1160, hl, times)
    W_ = 275; items = [(ct(0) + 0.3, "import hashlib", "Modul für Hashes", LIGHTB, BLUE), (ct(1) + 0.3, '"rb"', "Bytes, nicht Text", LIGHTA, AMB),
                       (ct(2) + 0.3, "read(4096)", "Block für Block", LIGHTK, DARK), (ct(3) + 0.3, "update + hexdigest", "64 Hex-Zeichen", LIGHTG, GREEN)]
    for k, (te, big, small, fill, col) in enumerate(items):
        def fn(d, dy, k=k, big=big, small=small, fill=fill, col=col):
            x = 60 + k * (W_ + 20); card(d, x, 560 + dy, W_, 112, stripe=False)
            chip(d, x + 14, 572 + dy, W_ - 28, 46, big, fill, col, 22, mono=True); T2(d, x + W_ / 2, 644 + dy, small, F(24, 700), GREY, "mm")
        f.el(show(t, te), fn, dy=dyf(t, te))

# ---------------------------------------------------------------- 4 Zeilen 20 bis 22
def sc4(f, t, ct):
    heading(f, t, "Soll-Wert lesen: Zeilen 20 bis 22")
    times = [1e9] * 3; put(times, (0,), ct(0) + 0.2, 20); put(times, (1, 2), ct(0) + 1.4, 20)
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {2})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 1160, CODE[19:22], [20, 21, 22], times, t, 20, 32, hl, title=PROG))
    def zeile(d, dy):
        card(d, 60, 300 + dy, 1160, 200); T2(d, 90, 312 + dy, "Eine Zeile der Datei R1_fw_3.2.1.bin.sha256", F(26, 700), DARK, "la")
        chip(d, 90, 364 + dy, 600, 52, SOLL[:12] + "…" + SOLL[-4:] + "  (64 Zeichen)", LIGHTG, GREEN, 24, mono=True)
        chip(d, 720, 364 + dy, 330, 52, "R1_fw_3.2.1.bin", LIGHTK, GREY, 24, mono=True)
        T2(d, 705, 442 + dy, "zwei Leerzeichen", F(18, 600), GREY, "mm")
        a = ap(t, ct(0) + 1.8, 0.4)
        if a > 0:
            T2(d, 390, 442 + dy, "split()[0]: erster Teil", M(22, True), mix(WHITE, RED, a), "mm")
            d.rounded_rectangle((86, 358 + dy, 696, 422 + dy), 10, outline=mix(WHITE, GREEN, a), width=4)
    f.el(show(t, ct(0) + 0.3), zeile, dy=dyf(t, ct(0) + 0.3))
    ents = [(ct(1) + 0.6, [(OUT[0], CODE_T)])]
    f.el(show(t, ct(1) + 0.1), lambda d, dy: console_panel(d, 60, 526 + dy, 1160, 96, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(1) + 0.1))
    f.el(show(t, ct(1) + 1.8), lambda d, dy: tag(d, 60, 636 + dy, 700, 44, "Die ersten 16 von 64 Zeichen genügen zum Anschauen", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(1) + 1.8))

# ---------------------------------------------------------------- 5 Zeilen 24 bis 29
def sc5(f, t, ct):
    heading(f, t, "Jede Datei prüfen: Zeilen 24 bis 29")
    times = [1e9] * 6; put(times, (0, 1), ct(0) + 0.2, 24); put(times, (2, 3), ct(1) + 0.2, 24); put(times, (4, 5), ct(2) + 0.2, 24)
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {2, 3}), (ct(2), {4, 5}), (ct(3), {5})])
    code_scene(f, t, 24, 29, 18, 30, 60, 112, 1160, hl, times)
    ents = [(ct(0) + 0.4, [(OUT[0], CODE_T)]), (ct(1) + 1.2, [(OUT[1], CODE_G)]), (ct(2) + 1.4, [(OUT[2], CODE_R)])]
    f.el(show(t, ct(0) + 0.2), lambda d, dy: console_panel(d, 60, 376 + dy, 1160, 160, ents, t, 22, title="Ausgabe", lh=34), dy=dyf(t, ct(0) + 0.2))
    f.el(show(t, ct(2) + 0.6), lambda d, dy: (chip(d, 60, 566 + dy, 400, 56, "Soll  " + SOLL, LIGHTG, GREEN, 24, mono=True), chip(d, 480, 566 + dy, 400, 56, "USB   " + USB, LIGHTR, RED, 24, mono=True)), dy=dyf(t, ct(2) + 0.6))
    f.el(show(t, ct(3) + 0.2), lambda d, dy: tag(d, 900, 566 + dy, 320, 56, "1 Bit an Byte 40000", LIGHTR, RED, 24, outl=RED), dy=dyf(t, ct(3) + 0.2))
    f.el(show(t, ct(3) + 1.4), lambda d, dy: T2(d, 60, 636 + dy, "Nicht einspielen, melden!", F(30, 700), RED, "la"), dy=dyf(t, ct(3) + 1.4))

# ---------------------------------------------------------------- 6 Zeilen 31 bis 33
def sc6(f, t, ct):
    heading(f, t, "Lawineneffekt: Zeilen 31 bis 33")
    times = [1e9] * 3; put(times, (0, 1, 2), ct(0) + 0.2, 31)
    hl = hl_at(t, [(0, None), (ct(0), {1, 2})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 1160, CODE[30:33], [31, 32, 33], times, t, 20, 32, hl, title=PROG))
    ents = [(ct(0) + 1.8, [(H1450, CODE_T)]), (ct(0) + 2.6, [(H1451, CODE_T)])]
    f.el(show(t, ct(0) + 1.5), lambda d, dy: console_panel(d, 60, 296 + dy, 560, 120, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(0) + 1.5))
    def av(d, dy):
        card(d, 650, 296 + dy, 570, 190); T2(d, 676, 308 + dy, "Eine Ziffer anders", F(26, 700), DARK, "la")
        T2(d, 676, 350 + dy, "1450", M(24, True), GREY, "la"); T2(d, 676, 390 + dy, "1451", M(24, True), GREY, "la")
        hexdiff(d, 770, 350 + dy, H1450, H1451, 24, DARK, ct(0) + 3.2, t)
        a = ap(t, ct(0) + 3.6, 0.5)
        if a > 0: T2(d, 676, 436 + dy, f"{BITS} von 256 Bit anders", F(30, 700), mix(WHITE, RED, a), "la")
    f.el(show(t, ct(0) + 1.5), av, dy=dyf(t, ct(0) + 1.5))
    def merk(d, dy):
        card(d, 60, 508 + dy, 1160, 160); T2(d, 90, 520 + dy, "Merke", F(26, 700), RED, "la")
        items = ["Soll-Wert über zweiten Weg", "Datei hashen", "vergleichen", "bei Abweichung nicht einspielen"]
        for k, s in enumerate(items):
            a = ap(t, ct(1) + 0.3 + 1.1 * k, 0.4)
            if a > 0:
                x = 90 + (k % 2) * 560; y = 566 + (k // 2) * 50
                d.ellipse((x, y + dy, x + 30, y + 30 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 15, y + 15 + dy, 17, WHITE, 4)
                T2(d, x + 42, y + 15 + dy, s, F(26, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(1) + 0.1), merk, dy=dyf(t, ct(1) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V18 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Firmware von R1 prüfen, bevor sie eingespielt wird", F(46, 400), GREY)
        code_n(d, 90, 380, 700, CODE[23:27], nums(24, 27), [-1] * 4, 9, 17, 30, {2})
        chip(d, 840, 392, 360, 56, "R1_fw_3.2.1.bin: OK", LIGHTG, GREEN, 22, outl=GREEN, mono=True)
        chip(d, 840, 464, 360, 56, "…_usb.bin: ABWEICHUNG", LIGHTR, RED, 22, outl=RED, mono=True)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
