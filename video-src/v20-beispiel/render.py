"""V20 Vorgerechnet: parametrischer Flansch als Klasse (Code exakt aus briefing/v20-beispiel.py, Ausgabe durch echten Lauf geprueft).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v20-common/tts_run.py v20-beispiel)"""
import os, sys, math, types, io, contextlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v20-common"))
from bausteine import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v20-beispiel"; LABEL = "DHBW · Informatik · V20 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echter Lauf (bauteil3d durch Attrappe ersetzt)
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v20-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 51 and CODE[8] == "class Flansch:" and CODE[19].startswith("    def ist_gueltig") and CODE[40].startswith("f = Flansch(120") and CODE[44].startswith("f.n = 8") and CODE[50].startswith("bauteil3d.zeige")
_fake = types.ModuleType("bauteil3d"); _fake.flansch = lambda *a: None; _fake.zeige = lambda *a: None
sys.modules["bauteil3d"] = _fake
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf): exec("\n".join(CODE), {"__name__": "__main__"})
OUT = _buf.getvalue().splitlines()
assert OUT == ["Gültig: True", "Volumen: 142.2 cm³, Masse: 1.12 kg", "Mit 8 Bohrungen: 1.09 kg", "Lochkreis 110 mm, Bohrung 14 mm gültig? False"], OUT
_pi4 = math.pi / 4
RING = _pi4 * (120 ** 2 - 40 ** 2) * 15; BOHR = 6 * _pi4 * 11 ** 2 * 15
assert round(RING) == 150796 and round(BOHR) == 8553 and round(RING - BOHR) == 142243 and f"{(RING - BOHR) / 1000 * 7.85:.1f}" == "1116.6"

def Lz(a, b):                                  # Codezeilen a..b (1-basiert)
    return CODE[a - 1:b]

def put(times, idxs, start, a, cps=55):
    c = start
    for i in idxs:
        if CODE[i - 1].strip() == "": continue
        times[i - a] = c; c += max(len(CODE[i - 1]), 4) / cps + 0.1
    return c

def blank_times(a, b): return [-1 if CODE[i - 1].strip() == "" else 1e9 for i in range(a, b + 1)]

def cscene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = Lz(a, b)
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, list(range(a, b + 1)), times, t, size, lh, hl, title="Python (briefing/v20-beispiel.py)"))

def cond(t, t0): return t >= t0

# ---------------------------------------------------------------- 1 Aufgabe: Draufsicht
def sc1(f, t, ct):
    heading(f, t, "Aufgabe: Flansch als Klasse")
    rows = [("d_aussen", 120), ("d_innen", 40), ("dicke", 15), ("lochkreis", 90), ("n", 6), ("d_bohrung", 11)]
    f.el(show(t, 0.3), lambda d, dy: objcard(d, 60, 116 + dy, 440, "Flansch (Maße in mm)", rows, None, DARK, 24, 40), dy=dyf(t, 0.3))
    cx, cy, s = 800, 395, 3.6; p = FLANSCH
    a_lk = show(t, ct(1) + 0.3); a_h = show(t, ct(1) + 1.2)
    f.el(show(t, ct(0) + 0.2), lambda d, dy: flange_top(d, cx, cy + dy, s, p, False, a_lk=a_lk, a_holes=a_h), dy=dyf(t, ct(0) + 0.2))
    R = p["da"] / 2 * s; r = p["di"] / 2 * s; rl = p["lk"] / 2 * s
    items = [("Ø 120 außen", DARK, -150, lambda y: cx + math.sqrt(R * R - y * y), ct(0) + 0.8),
             ("Lochkreis Ø 90", BLUE, -70, lambda y: cx + math.sqrt(rl * rl - y * y), ct(1) + 0.6),
             ("Mittelloch Ø 40", DARK, 0, lambda y: cx + r, ct(0) + 1.6),
             ("6 × Ø 11", GREEN, 81, lambda y: cx + rl * math.cos(math.pi / 6), ct(1) + 1.4)]
    for txt, col, oy, xf, tin in items:
        def lab(d, dy, txt=txt, col=col, oy=oy, xf=xf):
            y = cy + oy; xt = xf(oy); d.line((xt, y + dy, 1040, y + dy), fill=col, width=2)
            d.ellipse((xt - 5, y - 5 + dy, xt + 5, y + 5 + dy), fill=col)
            fit(txt, F(22, 700), 185 - 16, "Maß"); d.rounded_rectangle((1040, y - 24 + dy, 1225, y + 24 + dy), 24, fill=WHITE, outline=col, width=2)
            T2(d, 1132, y + dy, txt, F(22, 700), col, "mm")
        f.el(show(t, tin), lab, dy=dyf(t, tin))
    f.el(show(t, ct(0) + 2.2), lambda d, dy: T2(d, 800, cy + R + 14 + dy, "Draufsicht, Dicke 15 mm", F(24, 600), GREY, "ma"), dy=0)
    for k, (txt, col, fill) in enumerate((("gültig?", GREEN, LIGHTG), ("Volumen, Masse", BLUE, LIGHTB), ("3D-Modell", AMB, LIGHTA))):
        tin = ct(2) + 0.4 + 1.4 * k
        f.el(show(t, tin), lambda d, dy, txt=txt, col=col, fill=fill, k=k: tag(d, 60, 480 + k * 62 + dy, 440, 50, txt, fill, col, 28, 700, outl=col), dy=dyf(t, tin))

# ---------------------------------------------------------------- 2 Zeilen 5 bis 18
def sc2(f, t, ct):
    heading(f, t, "Import, Klasse und __init__: Zeilen 5 bis 18")
    # oberer Kasten Zeilen 5 und 6
    ta = blank_times(5, 6); put(ta, [5, 6], ct(0) + 0.2, 5)
    hla = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(0) + 4.4, None)])
    cscene(f, t, 5, 6, 20, 32, 60, 112, 560, hla, ta)
    f.el(show(t, ct(0) + 1.4), lambda d, dy: (chip(d, 660, 124 + dy, 150, 52, "math", LIGHTB, BLUE, 26, mono=True), chip(d, 826, 124 + dy, 190, 52, "bauteil3d", LIGHTA, AMB, 26, mono=True), T2(d, 1030, 150 + dy, "Module", F(24, 600), GREY, "lm")), dy=dyf(t, ct(0) + 1.4))
    # unterer Kasten Zeilen 9 bis 18
    tb = blank_times(9, 18); put(tb, [9, 10], ct(0) + 4.6, 9); put(tb, [12], ct(1) + 0.2, 9); put(tb, [13, 14, 15, 16, 17, 18], ct(1) + 2.6, 9, 60)
    hlb = hl_at(t, [(0, None), (ct(0) + 4.4, {0, 1}), (ct(1), {3}), (ct(1) + 2.4, {4, 5, 6, 7, 8, 9}), (ct(2), None)])
    cscene(f, t, 9, 18, 20, 30, 60, 262, 1160, hlb, tb, alpha_t=ct(0) + 4.4)
    def anno(d, dy):
        a = ap(t, ct(1) + 3.0, 0.5)
        if a > 0:
            col = mix(BOX, CODE_G, a); arrow(d, 560, 262 + 50 + 4 * 30 + 15 + dy, 600, 262 + 50 + 4 * 30 + 15 + dy, col, 3, 10)
            T2(d, 612, 262 + 50 + 4 * 30 + 15 + dy, "jeder Parameter wird zum Attribut", F(22, 600), col, "lm")
    f.el(1, anno)
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 648 + dy, 640, 40, "Jedes Flansch-Objekt trägt seine Maße selbst", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 3 ist_gueltig mit PAP
def build_pap():
    D = Dia(19); N = D.node
    N("s", "term", "Start\nist_gueltig()", 0, 0); N("d1", "dec", "Bohrung ragt nicht\nüber den Rand?", 0, 0)
    N("d2", "dec", "Bohrung ragt nicht\nins Mittelloch?", 0, 0); N("t", "term", "return True", 0, 0); N("fa", "term", "return False", 0, 0)
    n = D.nodes
    n["s"].cx, n["s"].cy = 100, 80; n["d1"].cx, n["d1"].cy = 370, 80; n["d2"].cx, n["d2"].cy = 790, 80; n["t"].cx, n["t"].cy = 1060, 80; n["fa"].cx, n["fa"].cy = 580, 230
    E = D.edge
    E("s-d1", "s", "r", "d1", "l"); E("d1-d2", "d1", "r", "d2", "l", label="ja"); E("d2-t", "d2", "r", "t", "l", label="ja")
    E("d1-fa", "d1", "b", "fa", "l", label="nein"); E("d2-fa", "d2", "b", "fa", "r", label="nein")
    return D
PAP = build_pap(); _bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 392, 1160, 290); PZOOM = min(1.1, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc3(f, t, ct):
    heading(f, t, "Die Regel ist_gueltig: Zeilen 20 bis 24")
    tt = blank_times(20, 24); put(tt, [20, 21], ct(0) + 0.2, 20); put(tt, [22], ct(0) + 2.0, 20); put(tt, [23], ct(1) + 0.2, 20); put(tt, [24], ct(2) + 0.4, 20)
    hl = hl_at(t, [(0, None), (ct(0), {2}), (ct(1), {3}), (ct(2), {4})])
    cscene(f, t, 20, 24, 20, 34, 60, 112, 960, hl, tt)
    # Rechenzeilen als zwei Zeilen je Kachel (Text passt in 185 px)
    def kachel(d, dy):
        data = [(ct(0) + 4.6, GREEN, 112, ["(90 + 11) / 2", "50,5 < 60"]), (ct(1) + 2.0, GREEN, 190, ["(90 − 11) / 2", "39,5 > 20"]), (ct(2) + 2.6, BLUE, 268, ["beide wahr:", "True"])]
        for tin, col, y, ls in data:
            a = ap(t, tin, 0.45)
            if a <= 0: continue
            d.rounded_rectangle((1040, y + dy, 1225, y + 68 + dy), 12, fill=mix(WHITE, LIGHTG if col == GREEN else LIGHTB, a), outline=mix(WHITE, col, a), width=2)
            T2(d, 1132, y + 20 + dy, ls[0], M(20), mix(WHITE, DARK, a), "mm"); T2(d, 1132, y + 47 + dy, ls[1], M(22, True), mix(WHITE, col, a), "mm")
    f.el(1, kachel)
    tm = {"s": ct(0) + 0.2, "s-d1": ct(0) + 0.5, "d1": ct(0) + 0.8, "d1-d2": ct(1) + 0.2, "d2": ct(1) + 0.4, "d2-t": ct(2) + 0.2, "t": ct(2) + 0.4, "d1-fa": ct(0) + 5.0, "d2-fa": ct(1) + 3.0, "fa": ct(0) + 5.0}
    cur = max([g for g in range(3) if t >= ct(g)] or [0])
    hl = {0: {"d1": PAL[0], "s-d1": PAL[0]}, 1: {"d2": PAL[1], "d1-d2": PAL[1]}, 2: {"t": PAL[2], "d2-t": PAL[2]}}[cur]
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)

# ---------------------------------------------------------------- 4 volumen und masse
def sc4(f, t, ct):
    heading(f, t, "Volumen und Masse: Zeilen 26 bis 34")
    tt = blank_times(26, 34); put(tt, [26, 27, 28, 29, 30], ct(0) + 0.2, 26, 70); put(tt, [32, 33, 34], ct(1) + 0.2, 26, 70)
    hl = hl_at(t, [(0, None), (ct(0), {2, 3, 4}), (ct(1), {7, 8}), (ct(2), {6})])
    cscene(f, t, 26, 34, 20, 32, 60, 112, 1160, hl, tt)
    ys = [492, 566]
    cells = [("Ring", "150 796 mm³", DARK, ct(0) + 1.0), ("− Bohrungen", "8 553 mm³", RED, ct(0) + 2.8), ("= Volumen", "142 243 mm³", BLUE, ct(0) + 4.6),
             ("÷ 1000", "142,2 cm³", GREY, ct(1) + 0.8), ("× 7,85 g/cm³", "1116,6 g", GREY, ct(1) + 3.2), ("÷ 1000", "1,12 kg", GREEN, ct(1) + 5.0)]
    for k, (a_, b_, col, tin) in enumerate(cells):
        x = 60 + (k % 3) * 396; y = ys[k // 3]
        def ce(d, dy, a_=a_, b_=b_, col=col, x=x, y=y):
            d.rounded_rectangle((x, y + dy, x + 376, y + 62 + dy), 12, fill=WHITE, outline=col if col != GREY else LINE, width=2)
            T2(d, x + 16, y + 31 + dy, a_, F(22, 600), GREY, "lm"); T2(d, x + 360, y + 31 + dy, b_, F(28, 700), col, "rm")
        f.el(show(t, tin), ce, dy=dyf(t, tin))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 646 + dy, 560, 40, "Standard: Stahl 7,85 g/cm³ (Default)", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 5 Benutzen: Zeilen 41 bis 49
def sc5(f, t, ct):
    heading(f, t, "Die Klasse benutzen: Zeilen 41 bis 49")
    tt = blank_times(41, 49); put(tt, [41], ct(0) + 0.2, 41); put(tt, [42, 43], ct(1) + 0.2, 41); put(tt, [45, 46], ct(2) + 0.2, 41); put(tt, [48, 49], ct(3) + 0.2, 41)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {4, 5}), (ct(3), {7, 8})])
    cscene(f, t, 41, 49, 20, 32, 60, 112, 1160, hl, tt)
    ents = [(ct(1) + 1.4, [(OUT[0], CODE_T)]), (ct(1) + 2.4, [(OUT[1], CODE_T)]), (ct(2) + 1.8, [(OUT[2], CODE_T)]), (ct(3) + 1.8, [(OUT[3], CODE_R)])]
    for e in ents: fit(e[1][0][0], M(20), 700 - 44, "Konsole")
    f.el(show(t, ct(1) + 1.0), lambda d, dy: console_panel(d, 60, 492 + dy, 700, 186, ents, t, 20, title="Ausgabe", lh=31), dy=dyf(t, ct(1) + 1.0))
    # Draufsichten
    n_f = 8 if t >= ct(2) + 0.6 else 6
    f.el(show(t, ct(0) + 1.0), lambda d, dy: (flange_top(d, 880, 584 + dy, 1.2, dict(FLANSCH, n=n_f), False), T2(d, 880, 500 + dy, f"f  (n = {n_f})", M(22, True), BLUE, "mm")), dy=dyf(t, ct(0) + 1.0))
    f.el(show(t, ct(3) + 0.4), lambda d, dy: (flange_top(d, 1100, 584 + dy, 1.2, ZU_GROSS, True), T2(d, 1100, 500 + dy, "zu_gross", M(22, True), RED, "mm")), dy=dyf(t, ct(3) + 0.4))
    f.el(show(t, ct(3) + 2.4), lambda d, dy: tag(d, 960, 660 + dy, 260, 26, "Bohrung ragt über den Rand", LIGHTR, RED, 18, 700, outl=RED), dy=0)

# ---------------------------------------------------------------- 6 3D-Ansicht und STL
def sc6(f, t, ct):
    heading(f, t, "Zum Schluss: 3D-Ansicht und STL")
    ta = blank_times(36, 38); put(ta, [36, 37, 38], ct(0) + 0.2, 36, 70)
    cscene(f, t, 36, 38, 20, 32, 60, 112, 900, hl_at(t, [(0, None), (ct(0), {0, 1, 2})]), ta)
    tb = [ct(0) + 2.4]
    f.el(ap(t, ct(0) + 2.0, 0.3), lambda d, dy: code_n(d, 60, 290 + dy, 900, Lz(51, 51), [51], tb, t, 20, 32, {0}, title="Python (briefing/v20-beispiel.py)"))
    def meshcard(d, dy):
        card(d, 990, 112 + dy, 230, 270)
        T2(d, 1105, 126 + dy, "mesh()", M(26, True), RED, "ma"); T2(d, 1105, 166 + dy, "Dreiecksnetz", F(24, 700), DARK, "ma")
        for k in range(3): d.polygon([(1015 + 60 * k, 260 + dy), (1045 + 60 * k, 210 + dy), (1075 + 60 * k, 260 + dy)], outline=DARK, fill=LIGHTB if k % 2 else LIGHTA)
        for k in range(2): d.polygon([(1045 + 60 * k, 210 + dy), (1105 + 60 * k, 210 + dy), (1075 + 60 * k, 260 + dy)], outline=DARK, fill=LIGHTG if k % 2 == 0 else LIGHTK)
        T2(d, 1105, 296 + dy, "aus vielen kleinen", F(22, 400), GREY, "ma"); T2(d, 1105, 324 + dy, "Dreiecken", F(22, 400), GREY, "ma")
    f.el(show(t, ct(0) + 1.4), meshcard, dy=dyf(t, ct(0) + 1.4))
    # Browser-Fenster mit drehbarem Flansch
    def win(d, dy):
        d.rounded_rectangle((60, 416 + dy, 800, 684 + dy), 14, fill=WHITE, outline=DARK, width=3)
        d.rounded_rectangle((60, 416 + dy, 800, 454 + dy), 14, fill=DARK); d.rectangle((60, 436 + dy, 800, 454 + dy), fill=DARK)
        T2(d, 84, 435 + dy, "3D-Vorschau: Flansch DN40", F(22, 700), WHITE, "lm")
        ph = t * 0.9; a_mesh = ap(t, ct(0) + 4.0, 0.6)
        flange_3d(d, 430, 540 + dy, 2.2, FLANSCH, phase=ph, dick=40)
        if a_mesh > 0: mesh_overlay(d, 430, 540 + dy, 2.2, FLANSCH, col=mix(BG, (120, 130, 146), a_mesh), phase=ph)
        T2(d, 780, 652 + dy, "mit der Maus drehen", F(20, 600), GREY, "ra")
    f.el(show(t, ct(0) + 2.6), win, dy=dyf(t, ct(0) + 2.6))
    def stl(d, dy):
        card(d, 840, 416 + dy, 380, 268)
        file_icon(d, 870, 440 + dy, GREY); T2(d, 906, 452 + dy, "Flansch_DN40.stl", M(24, True), DARK, "lm")
        d.rounded_rectangle((870, 500 + dy, 1190, 560 + dy), 14, fill=RED); T2(d, 1030, 530 + dy, "STL herunterladen", F(28, 700), WHITE, "mm")
        T2(d, 870, 584 + dy, "3D-Druck oder CAD-Programm", F(24, 600), GREY, "la")
        T2(d, 870, 618 + dy, "Format: Dreiecksnetz (STL)", F(22, 400), GREY, "la")
    f.el(show(t, ct(1) + 0.3), stl, dy=dyf(t, ct(1) + 0.3))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V20 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Parametrischer Flansch als Klasse", F(46, 400), GREY)
        code_n(d, 90, 380, 900, CODE[19:24], list(range(20, 25)), [-1] * 5, 9, 18, 32, {2}, title="Python")
        flange_top(d, 1125, 470, 1.3, FLANSCH)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
