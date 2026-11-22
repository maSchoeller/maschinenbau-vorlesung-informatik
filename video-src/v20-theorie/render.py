"""V20 Theorie: Objekte und CAD-Automatisierung (Hook Flansch-Baureihe, Klasse/Objekt, __init__ und self, parametrisches Modell, PAP, KI-Leitidee).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v20-common/tts_run.py v20-theorie)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v20-common"))
from bausteine import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v20-theorie"; LABEL = "DHBW · Informatik · V20 · Objekte und CAD-Automatisierung"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
class _F:
    def __init__(s, da, di, t, lk, n, db): s.da, s.di, s.t, s.lk, s.n, s.db = da, di, t, lk, n, db
    def gueltig(s): return (s.lk + s.db) / 2 < s.da / 2 and (s.lk - s.db) / 2 > s.di / 2
    def vol(s): return math.pi / 4 * (s.da ** 2 - s.di ** 2) * s.t - s.n * math.pi / 4 * s.db ** 2 * s.t
    def masse(s, dichte=7.85): return s.vol() / 1000 * dichte / 1000
REIHE = [(120, 40, 15, 90, 6, 11), (140, 50, 16, 105, 6, 13), (160, 60, 18, 120, 8, 13), (180, 70, 18, 135, 8, 15), (200, 80, 20, 150, 8, 17), (220, 90, 22, 165, 10, 17)]
assert all(_F(*r).gueltig() for r in REIHE)
M1 = _F(120, 40, 15, 90, 6, 11); M2 = _F(160, 60, 18, 120, 6, 13)
assert M1.gueltig() and M2.gueltig() and f"{M1.masse():.2f}" == "1.12" and f"{M1.vol() / 1000:.1f}" == "142.2"
MASSE2 = f"{M2.masse():.2f}"
assert not _F(120, 40, 15, 110, 6, 14).gueltig() and not _F(120, 40, 15, 50, 6, 14).gueltig()
assert "m10".upper() == "M10" and (lambda l: (l.append("Welle"), l)[1])([]) == ["Welle"]

def cpanel(f, t, lines, x, y, w, size, lh, hl=None, times=None, alpha_t=0.0, title="Python", nums=None):
    times = times if times is not None else [-1] * len(lines)
    nums = nums or list(range(1, len(lines) + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl, title=title))

def mono_arrow_label(d, x, y, txt, col, size=22):
    T2(d, x, y, txt, F(size, 700), col, "la")

# ---------------------------------------------------------------- 1 Hook: Baureihe
def sc1(f, t, ct):
    heading(f, t, "Baureihe: sechs Flansche, sechs Varianten")
    xs = [60 + 100 + k * 195 for k in range(6)]
    for k, r in enumerate(REIHE):
        tin = ct(0) + 0.2 + 0.35 * k; p = dict(da=r[0], di=r[1], t=r[2], lk=r[3], n=r[4], db=r[5])
        def fl(d, dy, k=k, p=p):
            flange_top(d, xs[k], 218 + dy, 0.55, p); T2(d, xs[k], 292 + dy, f"Variante {k + 1}", F(22, 700), GREY, "ma")
        f.el(show(t, tin), fl, dy=dyf(t, tin))
    # links: von Hand
    def hand(d, dy):
        card(d, 60, 340 + dy, 560, 300, fill=WHITE)
        T2(d, 90, 354 + dy, "Von Hand im CAD", F(32, 700), RED, "la")
    f.el(show(t, ct(0) + 1.5), hand, dy=dyf(t, ct(0) + 1.5))
    for k, (txt, col, fill) in enumerate((("6 Zeichnungen, Stunden Arbeit", RED, LIGHTR), ("jedes Maß neu eintippen", RED, LIGHTR), ("Tippfehler schleichen sich ein", RED, LIGHTR))):
        tin = ct(0) + 2.6 + 1.2 * k
        f.el(show(t, tin), lambda d, dy, txt=txt, col=col, fill=fill, k=k: tag(d, 90, 410 + k * 66 + dy, 500, 52, txt, fill, col, 25, 700, outl=col), dy=dyf(t, tin))
    # rechts: Skript
    def skr(d, dy):
        card(d, 660, 340 + dy, 560, 300, fill=WHITE)
        T2(d, 690, 354 + dy, "Per Skript", F(32, 700), GREEN, "la")
    f.el(show(t, ct(1) + 0.2), skr, dy=dyf(t, ct(1) + 0.2))
    code = ["f1 = Flansch(120, 40, 15, 90, 6, 11)", "f2 = Flansch(140, 50, 16, 105, 6, 13)", "f3 = Flansch(160, 60, 18, 120, 8, 13)", "...  # eine Zeile je Variante"]
    tm = [ct(1) + 0.8, ct(1) + 1.8, ct(1) + 2.8, ct(1) + 3.8]
    cpanel(f, t, code, 690, 398, 500, 17, 30, None, tm, alpha_t=ct(1) + 0.6, title="Python", nums=[1, 2, 3, 4])
    f.el(show(t, ct(1) + 5.0), lambda d, dy: tag(d, 690, 596 + dy, 500, 36, "prüft die Maße gleich mit", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(1) + 5.0))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 440, 650 + dy, 400, 40, "Dafür brauchst du Objekte", RED, WHITE, 26), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 Objekte seit V01
def sc2(f, t, ct):
    heading(f, t, "Objekte benutzt du seit Vorlesung 1")
    # links Text
    code1 = ['text = "m10"', "print(text.upper())"]
    cpanel(f, t, code1, 60, 130, 540, 24, 40, hl_at(t, [(0, None), (ct(0), {1})]), [ct(0) + 0.3, ct(0) + 1.4], alpha_t=ct(0), title="Python")
    f.el(show(t, ct(0) + 2.8), lambda d, dy: console_panel(d, 60, 330 + dy, 540, 100, [(ct(0) + 3.0, [("M10", CODE_T)])], t, 26, title="Ausgabe", lh=36), dy=dyf(t, ct(0) + 2.8))
    code2 = ["teile = []", 'teile.append("Welle")', "print(teile)"]
    cpanel(f, t, code2, 680, 130, 540, 24, 40, hl_at(t, [(0, None), (ct(0) + 4.0, {1}), (ct(1), None)]), [ct(0) + 4.0, ct(0) + 5.0, ct(0) + 6.4], alpha_t=ct(0) + 3.8, title="Python")
    f.el(show(t, ct(0) + 7.4), lambda d, dy: console_panel(d, 680, 370 + dy, 540, 100, [(ct(0) + 7.6, [("['Welle']", CODE_T)])], t, 26, title="Ausgabe", lh=36), dy=dyf(t, ct(0) + 7.4))
    # Objekt / Methode
    def lab1(d, dy):
        chip(d, 60, 460 + dy, 250, 56, "Objekt: Text", LIGHTB, BLUE, 28); chip(d, 340, 460 + dy, 260, 56, "Methode: upper", LIGHTR, RED, 28)
    f.el(show(t, ct(1) + 0.2), lab1, dy=dyf(t, ct(1) + 0.2))
    def lab2(d, dy):
        chip(d, 680, 520 + dy, 250, 56, "Objekt: Liste", LIGHTB, BLUE, 28); chip(d, 960, 520 + dy, 260, 56, "Methode: append", LIGHTR, RED, 28)
    f.el(show(t, ct(1) + 0.8), lab2, dy=dyf(t, ct(1) + 0.8))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: tag(d, 60, 626 + dy, 1160, 54, "Jetzt bauen wir eigene Objekte: mit eigenen Maßen und eigenen Methoden", LIGHTG, GREEN, 30, 700, outl=GREEN), dy=dyf(t, ct(1) + 3.0))

# ---------------------------------------------------------------- 3 Klasse = Bauplan, Objekt = Teil
def sc3(f, t, ct):
    heading(f, t, "Klasse = Bauplan, Objekt = konkretes Teil")
    bp = ["class Flansch:", "    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):", "    def masse(self, dichte=7.85):"]
    cpanel(f, t, bp, 60, 112, 900, 19, 32, hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2})]), [ct(0) + 0.2, ct(0) + 1.0, ct(0) + 2.4], title="Bauplan: die Klasse Flansch", nums=[9, 12, 32])
    ob = ["f1 = Flansch(120, 40, 15, 90, 6, 11)", "f2 = Flansch(160, 60, 18, 120, 6, 13)", "f1.n = 8"]
    cpanel(f, t, ob, 60, 300, 900, 19, 32, hl_at(t, [(0, None), (ct(1), {0}), (ct(1) + 2.0, {1}), (ct(2), {2})]), [ct(1) + 0.2, ct(1) + 2.2, ct(2) + 0.4], alpha_t=ct(1), title="Teile: zwei Objekte", nums=[1, 2, 3])
    n1 = 8 if t >= ct(2) + 1.2 else 6
    f.el(show(t, ct(1) + 0.6), lambda d, dy: objcard(d, 990, 112 + dy, 230, "f1: Flansch", [("d_aussen", 120), ("n", n1), ("d_bohrung", 11)], {1} if n1 == 8 else None, BLUE, 20, 34), dy=dyf(t, ct(1) + 0.6))
    f.el(show(t, ct(1) + 2.6), lambda d, dy: objcard(d, 990, 300 + dy, 230, "f2: Flansch", [("d_aussen", 160), ("n", 6), ("d_bohrung", 13)], None, AMB, 20, 34), dy=dyf(t, ct(1) + 2.6))
    f.el(show(t, ct(2) + 2.0), lambda d, dy: T2(d, 1105, 478 + dy, "f2 bleibt unberührt", F(22, 700), GREEN, "ma"), dy=dyf(t, ct(2) + 2.0))
    tags = [("Klasse = Bauplan", RED, LIGHTR, ct(0) + 0.8, 60), ("Objekt = konkretes Teil", BLUE, LIGHTB, ct(1) + 0.4, 310),
            ("Attribute = Maße", GREEN, LIGHTG, ct(1) + 3.2, 620), ("Methoden = Rechnungen", AMB, LIGHTA, ct(1) + 4.6, 870)]
    for txt, col, fill, tin, x in tags:
        w = {60: 230, 310: 290, 620: 230, 870: 290}[x]
        f.el(show(t, tin), lambda d, dy, txt=txt, col=col, fill=fill, x=x, w=w: tag(d, x, 520 + dy, w, 52, txt, fill, col, 22, 700, outl=col), dy=dyf(t, tin))
    f.el(show(t, ct(3) + 0.2), lambda d, dy: T2(d, 60, 606 + dy, "Der Bauplan steht einmal da, die Teile entstehen beliebig oft daraus.", F(28, 700), DARK, "la"), dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 4 __init__ und self
def sc4(f, t, ct):
    heading(f, t, "__init__ und self")
    code = ["    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):", "        self.d_aussen = d_aussen", "    def masse(self, dichte=7.85):", "        return self.volumen() / 1000 * dichte / 1000"]
    tm = [ct(0) + 0.2, ct(0) + 2.4, ct(1) + 0.2, ct(1) + 1.6]
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {2, 3}), (ct(2), None)])
    cpanel(f, t, code, 60, 112, 900, 19, 32, hl, tm, title="Python (in der Klasse Flansch)", nums=[12, 13, 32, 34])
    f.el(show(t, ct(0) + 0.8), lambda d, dy: objcard(d, 960, 112 + dy, 260, "f1", [("d_aussen", 120), ("n", 6)], {0} if (t > ct(0) + 2.4 and t < ct(1)) else None, BLUE, 20, 34), dy=dyf(t, ct(0) + 0.8))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: objcard(d, 960, 270 + dy, 260, "f2", [("d_aussen", 160), ("n", 6)], None, AMB, 20, 34), dy=dyf(t, ct(1) + 3.0))
    f.el(show(t, ct(0) + 2.4, ct(1) + 0.3), lambda d, dy: tag(d, 60, 340 + dy, 600, 44, "self.d_aussen: das Maß dieses Objekts", LIGHTR, RED, 24, 700, outl=RED), dy=dyf(t, ct(0) + 2.4))
    # Aufruf und self-Pfeil
    second = t >= ct(1) + 4.6
    call = "f2.masse()" if second else "f1.masse()"; col = AMB if second else BLUE
    def aufruf(d, dy):
        y0 = 390
        monobox(d, 60, y0 + dy, 250, 60, call, 28, CODE_T)
        arrow(d, 314, y0 + 30 + dy, 372, y0 + 30 + dy, DARK, 4, 12)
        d.rounded_rectangle((376, y0 - 10 + dy, 656, y0 + 70 + dy), 12, fill=WHITE, outline=DARK, width=3)
        T2(d, 400, y0 + 30 + dy, "masse(", M(26, True), DARK, "lm"); d.rounded_rectangle((482, y0 + 6 + dy, 568, y0 + 54 + dy), 10, fill=LIGHTR, outline=RED, width=2)
        T2(d, 525, y0 + 30 + dy, "self", M(26, True), RED, "mm"); T2(d, 580, y0 + 30 + dy, ")", M(26, True), DARK, "lm")
        ty = (112 + 78) if not second else (270 + 78)
        pts = [(525, y0 + 6 + dy), (525, 346 + dy), (720, 346 + dy), (720, ty + dy), (950, ty + dy)]
        d.line(pts, fill=col, width=5, joint="curve"); arrow(d, 930, ty + dy, 950, ty + dy, col, 5, 14)
        T2(d, 540, 316 + dy, "self zeigt auf " + ("f2" if second else "f1"), F(24, 700), col, "la")
    f.el(show(t, ct(1) + 0.8), aufruf, dy=dyf(t, ct(1) + 0.8))
    res = ("1.12 kg" if not second else MASSE2 + " kg")
    f.el(show(t, ct(1) + 2.6), lambda d, dy: T2(d, 60, 486 + dy, "Ergebnis: " + (res if not second else res), F(30, 700), col, "la"), dy=0)
    f.el(show(t, ct(1) + 3.0), lambda d, dy: T2(d, 60, 530 + dy, "rechnet mit self.d_aussen = " + ("160" if second else "120"), M(22, True), col, "la"), dy=0)
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 600 + dy, 900, 56, "dieselbe Methode, jedes Mal die richtigen Maße", LIGHTG, GREEN, 30, 700, outl=GREEN), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 5 parametrisches Modell, Regel, STL
def sc5(f, t, ct):
    heading(f, t, "Parametrisches Modell: Parameter plus Regeln")
    states = [(dict(FLANSCH), False, "gültig"), (dict(da=120, di=40, t=15, lk=110, n=6, db=14), True, "ungültig: Bohrung ragt über den Rand"), (dict(da=120, di=40, t=15, lk=50, n=6, db=14), True, "ungültig: Bohrung ragt ins Mittelloch")]
    k = 0 if t < ct(1) + 0.5 else (1 if int((t - ct(1) - 0.5) / 4.0) % 2 == 0 else 2)
    if t < ct(1) + 0.5: k = 0
    p, bad, txt = states[k]
    f.el(show(t, 0.3), lambda d, dy: flange_top(d, 300, 290 + dy, 2.2, p, bad), dy=dyf(t, 0.3))
    colr = RED if bad else GREEN
    f.el(show(t, ct(1) + 0.3) if k else show(t, ct(1) + 3.0), lambda d, dy: tag(d, 60, 440 + dy, 480, 48, txt, LIGHTR if bad else LIGHTG, colr, 22 if bad else 28, 700, outl=colr), dy=0)
    # Karte Parameter + Regeln
    def kp(d, dy):
        card(d, 620, 112 + dy, 600, 130)
        T2(d, 650, 124 + dy, "Bauteil = Satz Parameter + Regeln", F(28, 700), DARK, "la")
        chip(d, 650, 172 + dy, 250, 52, "6 Parameter (Maße)", LIGHTB, BLUE, 24); chip(d, 920, 172 + dy, 270, 52, "Regeln (ist_gueltig)", LIGHTR, RED, 24)
    f.el(show(t, ct(0) + 0.3), kp, dy=dyf(t, ct(0) + 0.3))
    def kr(d, dy):
        card(d, 620, 262 + dy, 600, 112)
        T2(d, 650, 274 + dy, "Regel ist_gueltig prüft:", F(26, 700), DARK, "la")
        T2(d, 650, 312 + dy, "Bohrung nicht über den Rand,", F(24, 400), DARK, "la"); T2(d, 650, 340 + dy, "Bohrung nicht ins Mittelloch", F(24, 400), DARK, "la")
    f.el(show(t, ct(1) + 0.3), kr, dy=dyf(t, ct(1) + 0.3))
    # 3D-Netz
    def tri(d, dy):
        flange_3d(d, 800, 492 + dy, 1.4, FLANSCH, dick=30); mesh_overlay(d, 800, 492 + dy, 1.4, FLANSCH)
        T2(d, 800, 408 + dy, "Dreiecksnetz", F(24, 700), GREY, "ma")
        chip(d, 980, 440 + dy, 240, 48, "STL: Dreiecksnetz", LIGHTB, BLUE, 22); chip(d, 980, 500 + dy, 240, 48, "STEP: exakte Geometrie", LIGHTA, AMB, 20)
    f.el(show(t, ct(2) + 0.3), tri, dy=dyf(t, ct(2) + 0.3))
    # Programme
    for j, (txt, col, fill) in enumerate((("FreeCAD", GREEN, LIGHTG), ("CadQuery", BLUE, LIGHTB), ("steuerbar per Python", RED, LIGHTR))):
        tin = ct(3) + 0.3 + 1.2 * j; x = [60, 280, 520][j]; w = [200, 220, 330][j]
        f.el(show(t, tin), lambda d, dy, txt=txt, col=col, fill=fill, x=x, w=w: tag(d, x, 620 + dy, w, 50, txt, fill, col, 26, 700, outl=col), dy=dyf(t, tin))

# ---------------------------------------------------------------- 6 PAP der Baureihe
def build_pap():
    D = Dia(20); N = D.node
    N("s", "term", "Start", 0, 0); N("w1", "dec", "weitere\nVariante?", 0, 0); N("e", "proc", "Flansch\nerzeugen", 0, 0); N("u", "sub", "ist_gueltig()\naufrufen", 0, 0)
    N("g", "dec", "gültig?", 0, 0); N("m", "io", "Masse\nausgeben", 0, 0); N("w", "io", "Warnung\nausgeben", 0, 0); N("end", "term", "Ende", 0, 0)
    n = D.nodes; A = 330; B = 640; C = 960
    n["end"].cx, n["end"].cy = A, 40; n["s"].cx, n["s"].cy = 100, 150; n["w1"].cx, n["w1"].cy = A, 150; n["e"].cx, n["e"].cy = B, 150; n["u"].cx, n["u"].cy = C, 150
    n["g"].cx, n["g"].cy = C, 290; n["m"].cx, n["m"].cy = B, 290; n["w"].cx, n["w"].cy = C, 420
    E = D.edge
    E("s-w1", "s", "r", "w1", "l"); E("w1-e", "w1", "r", "e", "l", label="ja"); E("e-u", "e", "r", "u", "l"); E("u-g", "u", "b", "g", "t")
    E("g-m", "g", "l", "m", "r", label="ja"); E("g-w", "g", "b", "w", "t", label="nein")
    E("m-back", "m", "l", "w1", "b", via=[(A, 290)])
    E("w-back", "w", "l", (A, 290), None, via=[(A, 420)])
    E("w1-end", "w1", "t", "end", "b", label="nein")
    return D
PAP = build_pap(); _bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 530); PZOOM = min(1.1, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)
PGROUPS = [["s", "s-w1", "w1", "w1-e", "e", "e-u"], ["u", "u-g"], ["g", "g-m", "m", "g-w", "w", "m-back", "w-back", "w1-end", "end"]]

def sc6(f, t, ct):
    heading(f, t, "Im Ablaufplan: Unterprogramm ist_gueltig")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * 0.5
    cur = max([g for g in range(3) if t >= ct(g)] or [0])
    hl = {0: {k: PAL[0] for k in PGROUPS[0]}, 1: {"u": PAL[3], "u-g": PAL[3]}, 2: {k: PAL[1] for k in ("g", "g-m", "m", "g-w", "w")}}[cur]
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)
    f.el(show(t, ct(1) + 0.4), lambda d, dy: tag(d, 700, 112 + dy, 520, 46, "Die Regel steht einmal in der Klasse", LIGHTR, RED, 26, 700, outl=RED), dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(2) + 3.0), lambda d, dy: tag(d, 60, 648 + dy, 640, 40, "eine Schleife, ein Unterprogramm, eine Verzweigung", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(2) + 3.0))

# ---------------------------------------------------------------- 7 KI und Prüfen
def sc7(f, t, ct):
    heading(f, t, "KI schreibt das Skript, du prüfst es")
    def ki(d, dy):
        card(d, 60, 116 + dy, 330, 220, fill=WHITE)
        T2(d, 90, 130 + dy, "KI schreibt", F(34, 700), BLUE, "la")
        d.rounded_rectangle((90, 190 + dy, 360, 296 + dy), 10, fill=BOX)
        for j, ln in enumerate(("class Flansch:", "    def masse(self):", "        ...")): T2(d, 106, 214 + dy + j * 28, ln, M(20), CODE_T, "lm")
    f.el(show(t, ct(0) + 0.2), ki, dy=dyf(t, ct(0) + 0.2))
    f.el(show(t, ct(0) + 1.0), lambda d, dy: arrow(d, 400, 226 + dy, 470, 226 + dy, DARK, 5, 14), dy=0)
    def du(d, dy):
        card(d, 480, 116 + dy, 740, 330, fill=WHITE)
        T2(d, 510, 130 + dy, "Du prüfst Klasse und Regeln", F(34, 700), GREEN, "la")
    f.el(show(t, ct(0) + 1.2), du, dy=dyf(t, ct(0) + 1.2))
    for j, txt in enumerate(("Stimmen die Maße?", "Stimmen die Einheiten?", "Ist die Regel vollständig?")):
        tin = ct(0) + 2.2 + 1.8 * j
        def row(d, dy, j=j, txt=txt):
            y = 190 + j * 82
            d.rounded_rectangle((510, y + dy, 1190, y + 66 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            check_circle(d, 548, y + 33 + dy, 18); fit(txt, F(30, 700), 580, "Prüfpunkt"); T2(d, 584, y + 33 + dy, txt, F(30, 700), DARK, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))
    # Einheitenfehler
    def fehler(d, dy):
        card(d, 60, 470 + dy, 1160, 130, fill=WHITE)
        T2(d, 90, 482 + dy, "Eine falsche Einheit, und die Masse stimmt nicht", F(26, 700), DARK, "la")
        chip(d, 90, 528 + dy, 440, 54, "dichte = 7.85  ->  1.12 kg", LIGHTG, GREEN, 26, mono=True)
        chip(d, 570, 528 + dy, 440, 54, "dichte = 7850  ->  1116.6 kg", LIGHTR, RED, 26, mono=True)
        T2(d, 1030, 555 + dy, "Faktor 1000", F(28, 700), RED, "lm")
    f.el(show(t, ct(1) + 0.3), fehler, dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 624 + dy, 1160, 60, "Die KI schreibt das Skript, du prüfst Klasse und Regeln.", RED, WHITE, 34), dy=dyf(t, ct(2) + 0.3))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}
assert len(SRC) == 7

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V20 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Objekte und CAD", F(100, 700), DARK)
        T2(d, 90, 290, "Eine Klasse als Bauplan, Teile per Skript", F(46, 400), GREY)
        for k, r in enumerate(REIHE[:4]):
            flange_top(d, 190 + k * 200, 480, 0.6, dict(da=r[0], di=r[1], t=r[2], lk=r[3], n=r[4], db=r[5]))
        flange_3d(d, 1060, 470, 1.6, FLANSCH, dick=36); mesh_overlay(d, 1060, 470, 1.6, FLANSCH)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
