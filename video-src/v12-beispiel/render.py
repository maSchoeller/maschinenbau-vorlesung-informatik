"""V12 Vorgerechnet: Testfälle für die Lagertemperatur (Code aus briefing/v12-beispiel.py).
Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v12-common"))
from h12 import *
from texte import SRC

NAME = "v12-beispiel"; LABEL = "DHBW · Informatik · V12 · Vorgerechnet: Testfälle für die Lagertemperatur"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- exakter Code und Pruefung aller Ausgaben
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v12-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 43
EXPECT = ["Alle 9 Tests bestanden", "AssertionError: Grenzwert 85 °C falsch eingeordnet"]
assert run("\n".join(CODE)) == EXPECT
# Zeilennummern, auf die der Sprechertext verweist
assert CODE[12].strip() == "elif t <= 85:" and CODE[34].strip() == "elif t < 85:"
assert CODE[8].strip() == "if t < -40 or t > 200:" and CODE[40].lstrip().startswith("assert zustand_ki(85)")
assert sum(1 for l in CODE[19:28] if l.startswith("assert ")) == 9
def seg(a, b): return CODE[a - 1:b]

CX, CW = 60, 1160

# ---------------------------------------------------------------- 1 Spezifikation (Zeilen 1 bis 4)
def sc1(f, t, ct):
    heading(f, t, "Die Spezifikation (Zeilen 1 bis 4)")
    code_box12(f, t, seg(1, 4), 1, CX, 116, CW, 22, 32, times=[ct(0) + 0.3 + 0.7 * k for k in range(4)], alpha_t=ct(0) + 0.1, cps=75)
    SY, SH = 392, 84
    f.el(show(t, ct(0) + 2.6), lambda d, dy: zonen(d, SY + dy, SH), dy=dyf(t, ct(0) + 2.6))
    f.el(show(t, ct(1) + 0.4), lambda d, dy: tag(d, 90, 540 + dy, 520, 44, "unter −40 °C: Sensorfehler", LIGHTR, RED, 26, 700, outl=RED), dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(1) + 1.4), lambda d, dy: tag(d, 670, 540 + dy, 520, 44, "über 200 °C: Sensorfehler", LIGHTR, RED, 26, 700, outl=RED), dy=dyf(t, ct(1) + 1.4))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 90, 610 + dy, 1100, 56, "Testfälle aus der Spezifikation, nicht aus dem Code", RED, WHITE, 32), dy=dyf(t, ct(2) + 0.2))

# ---------------------------------------------------------------- 2 Funktion zustand (Zeilen 7 bis 16)
def sc2(f, t, ct):
    heading(f, t, "Die Funktion zustand (Zeilen 7 bis 16)")
    hl = hl_at(t, [(0, None), (ct(0) + 0.3, {0, 1}), (ct(0) + 3.0, {2, 3}), (ct(1) + 0.2, {4, 5}), (ct(1) + 2.4, {6, 7}), (ct(1) + 4.6, {8, 9}), (ct(2) + 0.3, {6})])
    times = [ct(0) + 0.1 + 0.3 * k for k in range(10)]
    code_box12(f, t, seg(7, 16), 7, CX, 116, 730, 24, 36, hl=None if t >= ct(2) + 0.3 else hl, red={6} if t >= ct(2) + 0.3 else None, times=times, alpha_t=ct(0) + 0.1, cps=60, dim=True)
    tile2(f, t, ct(0) + 0.3, 820, 116, 400, 100, "Parameter t", "Temperatur in °C", DARK, bigsize=28)
    tile2(f, t, ct(0) + 3.0, 820, 228, 400, 100, "1. Sensorfehler", "unter −40 oder über 200", RED, bigsize=28)
    tile2(f, t, ct(1) + 0.3, 820, 340, 400, 100, "2. Drei Zweige", "normal · warnung · abschalten", BLUE, bigsize=28)
    tile2(f, t, ct(2) + 0.3, 820, 452, 400, 100, "Zeile 13: t <= 85", "85 gehört noch zur Warnung", RED, bigsize=28)

# ---------------------------------------------------------------- 3 Grenzen 70 und 85 (Zeilen 19 bis 24)
def punkte(f, t, SY, SH, items):
    """items: (wert, text, Startzeit, Farbe); Beschriftung oberhalb, Punkt im Streifen."""
    PY = SY + int(SH * 0.72)
    def fn(d, dy):
        for v, lab, tin, col in items:
            a = ap(t, tin, 0.4)
            if a <= 0: continue
            x = zx(v); zpunkt(d, x, PY + dy, mix(WHITE, col, a), 12); T2(d, x, SY - 26 + dy, lab, F(24, 700), mix(WHITE, DARK, a), "mm")
    f.el(1, fn)

def sc3(f, t, ct):
    heading(f, t, "Testfälle: Bereiche und Grenzen (Zeilen 19 bis 24)")
    hl = hl_at(t, [(0, None), (ct(0) + 0.6, {1}), (ct(1) + 0.3, {2, 3}), (ct(2) + 0.3, {4, 5})])
    times = [ct(0) + 0.1 + 0.4 * k for k in range(6)]
    code_box12(f, t, seg(19, 24), 19, CX, 116, CW, 22, 32, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=80, dim=True)
    SY, SH = 480, 84
    f.el(show(t, 0.3), lambda d, dy: zonen(d, SY + dy, SH))
    punkte(f, t, SY, SH, [(20, "20", ct(0) + 1.2, GREEN), (69.9, "69,9", ct(1) + 1.0, RED), (70, "70", ct(1) + 3.2, RED),
                          (85, "85", ct(2) + 0.8, RED), (85.1, "85,1", ct(2) + 3.0, RED)])
    f.el(show(t, ct(1) + 4.6), lambda d, dy: tag(d, 60, 612 + dy, 520, 44, "70 gehört schon zur Warnung", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, ct(1) + 4.6))
    f.el(show(t, ct(2) + 4.6), lambda d, dy: tag(d, 700, 612 + dy, 520, 44, "85 gehört noch zur Warnung", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, ct(2) + 4.6))

# ---------------------------------------------------------------- 4 Sensorfehler-Grenzen (Zeilen 25 bis 29)
def sc4(f, t, ct):
    heading(f, t, "Grenzen der Sensorfehler (Zeilen 25 bis 29)")
    hl = hl_at(t, [(0, None), (ct(0) + 0.3, {0, 1}), (ct(1) + 0.3, {2, 3}), (ct(2) + 0.3, {4})])
    times = [ct(0) + 0.1 + 0.4 * k for k in range(5)]
    code_box12(f, t, seg(25, 29), 25, CX, 116, CW, 22, 32, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=80, dim=True)
    SY, SH = 424, 84
    f.el(show(t, 0.3), lambda d, dy: zonen(d, SY + dy, SH))
    punkte(f, t, SY, SH, [(-40, "−40", ct(0) + 1.4, RED), (-40.1, "−40,1", ct(0) + 3.4, RED), (200, "200", ct(1) + 0.6, RED), (200.1, "200,1", ct(1) + 2.6, RED)])
    f.el(show(t, ct(2) + 1.2), lambda d, dy: console_panel(d, CX, 572 + dy, CW, 88, [(ct(2) + 1.4, [(EXPECT[0], CODE_G)])], t, 24, title="Ausgabe", lh=34), dy=dyf(t, ct(2) + 1.2))

# ---------------------------------------------------------------- 5 Version der KI (Zeilen 32 bis 38)
def dashed(d, x0, y0, x1, y1, col, w=3, dash=12, gap=8):
    for (ax, ay, bx, by) in ((x0, y0, x1, y0), (x0, y1, x1, y1), (x0, y0, x0, y1), (x1, y0, x1, y1)):
        L = math.hypot(bx - ax, by - ay); n = int(L // (dash + gap)) + 1
        for k in range(n):
            s0 = k * (dash + gap) / L; s1 = min(1.0, (k * (dash + gap) + dash) / L)
            d.line((ax + (bx - ax) * s0, ay + (by - ay) * s0, ax + (bx - ax) * s1, ay + (by - ay) * s1), fill=col, width=w)

def sc5(f, t, ct):
    heading(f, t, "Die Version der KI (Zeilen 32 bis 38)")
    bad = t >= ct(1) + 0.5
    times = [ct(0) + 0.1 + 0.4 * k for k in range(7)]
    code_box12(f, t, seg(32, 38), 32, CX, 116, 700, 24, 36, hl=None, red={3} if bad else None, times=times, alpha_t=ct(0) + 0.1, cps=60)
    tile2(f, t, ct(0) + 0.8, 800, 116, 420, 100, "Version der KI", "sieht fast genauso aus", DARK, bigsize=28)
    tile2(f, t, ct(1) + 0.5, 800, 228, 420, 100, "t < 85 statt t <= 85", "Zeile 35: das Gleichheitszeichen fehlt", RED, bigsize=28)
    def luecke(d, dy):
        dashed(d, 800, 340 + dy, 1220, 436 + dy, RED)
        T2(d, 1010, 374 + dy, "Sensorfehler-Zweig fehlt", F(28, 700), RED, "mm"); T2(d, 1010, 410 + dy, "(in der Funktion der KI nicht vorhanden)", F(20, 400), GREY, "mm")
    f.el(show(t, ct(1) + 2.8), luecke, dy=dyf(t, ct(1) + 2.8))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: T2(d, 60, 478 + dy, "Beim Durchlesen fällt das kaum auf. Diese Werte gehen gut:", F(26, 700), DARK, "la"))
    for k, v in enumerate(("20 °C", "75 °C", "90 °C")):
        tin = ct(2) + 1.2 + 0.9 * k; x = 60 + k * 250
        def ck(d, dy, x=x, v=v):
            d.rounded_rectangle((x, 524 + dy, x + 230, 590 + dy), 12, fill=LIGHTG, outline=GREEN, width=2)
            okmark(d, x + 34, 557 + dy, 16); T2(d, x + 66, 557 + dy, v, F(30, 700), DARK, "lm")
        f.el(show(t, tin), ck, dy=dyf(t, tin))

# ---------------------------------------------------------------- 6 Test findet den Fehler (Zeilen 40 bis 43)
def sc6(f, t, ct):
    heading(f, t, "Der Test findet den Fehler (Zeilen 40 bis 43)")
    hl = hl_at(t, [(0, None), (ct(0) + 0.3, {0, 1}), (ct(1) + 0.3, {2}), (ct(1) + 4.2, {3})])
    times = [ct(0) + 0.1 + 0.5 * k for k in range(4)]
    code_box12(f, t, seg(40, 43), 40, CX, 116, CW, 24, 36, hl=hl, times=times, alpha_t=ct(0) + 0.1, cps=60, dim=True)
    def jump(d, dy):
        a = ap(t, ct(1) + 0.4, 0.6)
        y1, y2 = 116 + 50 + 36 + 18 + dy, 116 + 50 + 72 + 18 + dy
        x1 = 60 + 62 + M(24).getlength(seg(40, 43)[1]) + 14
        d.line((x1, y1, 1196, y1), fill=mix(BOX, RED, a), width=4); d.line((1196, y1, 1196, y2), fill=mix(BOX, RED, a), width=4)
        arrow(d, 1196, y2, 1196 - int(a * 600), y2, mix(BOX, RED, a), 4, 12) if a > 0.02 else None
    f.el(show(t, ct(1) + 0.4), jump)
    f.el(show(t, ct(0) + 3.0), lambda d, dy: tag(d, 60, 352 + dy, 700, 42, "zustand_ki(85) liefert abschalten, erwartet war warnung", LIGHTA, AMB, 22, 700, outl=AMBER), dy=dyf(t, ct(0) + 3.0))
    f.el(show(t, ct(1) + 4.4), lambda d, dy: console_panel(d, CX, 420 + dy, CW, 92, [(ct(1) + 4.6, [(EXPECT[1], CODE_R)])], t, 24, title="Ausgabe", lh=34), dy=dyf(t, ct(1) + 4.4))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: T2(d, 60, 538 + dy, "Ein einziger Test an der Grenze hat den Fehler gefunden. Merke:", F(26, 700), DARK, "la"))
    for k, txt in enumerate(("Tests aus der Spezifikation", "Grenzen von beiden Seiten", "vor dem Generieren")):
        tin = ct(2) + 2.2 + 1.4 * k; x = 60 + k * 392
        def ch(d, dy, x=x, txt=txt, k=k):
            d.rounded_rectangle((x, 580 + dy, x + 372, 650 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((x + 14, 597 + dy, x + 50, 633 + dy), fill=GREEN); T2(d, x + 32, 615 + dy, str(k + 1), F(22, 700), WHITE, "mm")
            fit(txt, F(24, 700), 300, "Merke"); T2(d, x + 62, 615 + dy, txt, F(24, 700), DARK, "lm")
        f.el(show(t, tin), ch, dy=dyf(t, tin))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V12 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Testfälle für die Lagertemperatur", F(52, 400), GREY)
        zonen(d, 400, 84)
        code_seg(d, 90, 560, 1010, ['assert zustand(85) == "warnung"'], 23, 9, size=26, lh=44, title=None)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
