"""V06 Vorgerechnet: Wie lange kühlt das Werkstück ab? (Code aus briefing/v06-beispiel.py).
Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v06-common"))
from h6 import *
from texte import SRC

NAME = "v06-beispiel"; LABEL = "DHBW · Informatik · V06 · Wie lange kühlt das Werkstück ab?"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- exakter Code und Pruefung aller Ausgaben
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v06-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 23
EXPECT = ["Nach 37 Minuten: 58.0 °C", "Minute 1:  783.6 °C", "Minute 2:  722.5 °C", "Minute 3:  666.3 °C", "Minute 4:  614.6 °C", "Minute 5:  567.0 °C",
          "Mittelwert der ersten 5 Minuten: 670.8 °C"]
assert run("\n".join(CODE)) == EXPECT
K, UMG, ZIEL = 0.08, 20.0, 60.0
TEMPS = [850.0]
while len(TEMPS) < 61: TEMPS.append(TEMPS[-1] - K * (TEMPS[-1] - UMG))
assert next(i for i, v in enumerate(TEMPS) if v <= ZIEL) == 37 and f"{TEMPS[37]:.1f}" == "58.0" and TEMPS[36] > ZIEL
assert [f"{TEMPS[i]:.1f}" for i in range(1, 6)] == ["783.6", "722.5", "666.3", "614.6", "567.0"]
SUMS = [sum(TEMPS[1:i + 1]) for i in range(1, 6)]
assert f"{SUMS[-1] / 5:.1f}" == "670.8" and f"{SUMS[-1]:.2f}" == "3354.07"
assert abs(TEMPS[37] - (20 + 830 * 0.92 ** 37)) < 1e-9 and f"{TEMPS[37]:.4f}" == "57.9514"
assert f"{850 - TEMPS[1]:.1f}" == "66.4" and f"{TEMPS[4] - TEMPS[5]:.1f}" == "47.6" and f"{830 * 0.92:.1f}" == "763.6"
assert [f"{830 * 0.92 ** n:.1f}" for n in (1, 2, 3)] == ["763.6", "702.5", "646.3"]
def de(x, n): return f"{x:.{n}f}".replace(".", ",")

CX, CW, CSZ, CLH, CY = 30, 765, 16, 23, 100
RX, RW = 815, 421
fit_check(CODE, M(CSZ), CW - 62 - 10, "Code"); fit_check(EXPECT, M(16), RW - 44 - 6, "Konsole")
FULL = lambda n: [-1 if i < n else 1e9 for i in range(len(CODE))]

def draw_code(f, t, times, hl):
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_panel(d, CX, CY + dy, CW, CODE, times, t, CSZ, 55, hl=hl, dim_others=True, lh=CLH))
def typed(times, idx, start, cps=55, gap=0.12):
    c = start
    for i in idx:
        times[i] = c; c += len(CODE[i]) / cps + gap
    return times
def state_cells(f, t, temp_txt, min_txt, cond, y=100, a=1.0):
    cw = [130, 150, 125]
    def fn(d, dy):
        x = RX
        box_cell(d, x, y + dy, cw[0], 96, "minuten", min_txt, DARK, 38); x += cw[0] + 8
        box_cell(d, x, y + dy, cw[1], 96, "temperatur", temp_txt, RED, 38); x += cw[1] + 8
        ok = cond == "wahr"
        box_cell(d, x, y + dy, cw[2], 96, "Bedingung", cond, GREEN if ok else RED, 32)
    f.el(a, fn)
def console(f, t, entries, y, h):
    f.el(ap(t, 0.0, 0.4), lambda d, dy: console_panel(d, RX, y + dy, RW, h, entries, t, 16, lh=24))

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Abkühlung nach dem Härten")
    cool = ap(t, ct(0) + 1.0, 10.0)
    def piece(d, dy):
        col = mix((255, 92, 24), (150, 156, 168), cool)
        d.rounded_rectangle((90, 220 + dy, 400, 360 + dy), 18, fill=col, outline=DARK, width=4)
        T2(d, 245, 290 + dy, "Werkstück", F(30, 700), WHITE, "mm")
        T2(d, 245, 190 + dy, "850 °C direkt nach dem Ofen", F(26, 700), DARK, "mm")
        d.rounded_rectangle((470, 220 + dy, 760, 360 + dy), 18, fill=WHITE, outline=LINE, width=3)
        T2(d, 615, 262 + dy, "Halle", F(28, 700), GREY, "mm"); T2(d, 615, 318 + dy, "20 °C", F(46, 700), DARK, "mm")
        arrow(d, 410, 290 + dy, 460, 290 + dy, RED, 5)
    f.el(ap(t, ct(0) + 0.2, 0.5), piece, dy=int((1 - ap(t, ct(0) + 0.2, 0.5)) * 12))
    def law(d, dy):
        card(d, 800, 160 + dy, 436, 210)
        T2(d, 828, 172 + dy, "Pro Minute gehen 8 %", F(28, 700), DARK); T2(d, 828, 206 + dy, "des Unterschieds verloren", F(28, 700), DARK)
        T2(d, 828, 256 + dy, "Unterschied zur Halle:", F(24, 400), GREY)
        T2(d, 828, 294 + dy, "830 °C", F(34, 700), DARK); arrow(d, 960, 312 + dy, 1020, 312 + dy, RED, 4); T2(d, 1034, 294 + dy, "763,6 °C", F(34, 700), RED)
        T2(d, 828, 336 + dy, "nach 1 Minute: 92 % bleiben", F(22, 400), GREY)
    f.el(ap(t, ct(1) + 0.8, 0.5), law, dy=int((1 - ap(t, ct(1) + 0.8, 0.5)) * 12))
    pill(f, t, ct(2) + 0.2, 90, 430, 670, 54, "Newtonsches Abkühlungsgesetz", fill=DARK, size=30)
    def q(d, dy):
        card(d, 90, 520 + dy, 540, 120); card(d, 660, 520 + dy, 576, 120)
        T2(d, 118, 534 + dy, "Frage 1", F(26, 700), RED); T2(d, 118, 572 + dy, "Nach wie vielen Minuten sind", F(24, 400), DARK); T2(d, 118, 600 + dy, "es höchstens 60 °C?", F(24, 400), DARK)
        T2(d, 688, 534 + dy, "Frage 2", F(26, 700), RED); T2(d, 688, 572 + dy, "Wie sehen die ersten", F(24, 400), DARK); T2(d, 688, 600 + dy, "fünf Minuten aus?", F(24, 400), DARK)
    f.el(ap(t, ct(3) + 0.3, 0.5), q, dy=int((1 - ap(t, ct(3) + 0.3, 0.5)) * 12))
    pill(f, t, ct(4) + 0.2, 800, 400, 436, 54, "Abschnitt für Abschnitt", size=26)

# ---------------------------------------------------------------- 2 Eingangsdaten (Zeilen 4 bis 7)
def sc2(f, t, ct):
    heading(f, t, "Abschnitt 1: Eingangsdaten (Zeilen 4 bis 7)")
    tm = [1e9] * len(CODE)
    typed(tm, [0, 1, 3, 4, 5, 6], ct(0) + 0.2, cps=90, gap=0.05)
    hl = hl_at(t, [(0, None), (ct(1), {3, 4}), (ct(2), {5}), (ct(3), {6}), (ct(4), {0, 1, 3, 4, 5, 6})])
    draw_code(f, t, tm, hl)
    def cells(d, dy):
        for (lab, val, tin, col, x, y) in (("temperatur", "850.0", ct(1) + 0.3, RED, 0, 100), ("umgebung", "20.0", ct(1) + 4.4, DARK, 216, 100),
                                           ("k", "0.08", ct(2) + 0.8, DARK, 0, 226), ("ziel", "60.0", ct(3) + 0.6, GREEN, 216, 226)):
            if t < tin: continue
            a = ap(t, tin, 0.45)
            yy = y + int((1 - a) * 10)
            lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(lay)
            box_cell(dd, RX + x, yy + dy, 205, 112, lab, val, col, 46)
            lay.putalpha(lay.getchannel("A").point(lambda v: int(v * a))); f.img.paste(lay, (0, 0), lay)
    cells(None, 0)
    tile(f, t, ct(2) + 3.5, RX, 360, RW, 96, "0,08 pro Minute = 8 %", "Abkühlkonstante k", DARK, bigsize=26)
    tile(f, t, ct(3) + 3.4, RX, 468, RW, 96, "ab 60 °C weiterbearbeiten", "Ziel der Abkühlung", GREEN, bigsize=26)
    tile(f, t, ct(4) + 0.3, RX, 576, RW, 96, "Kommentare nach dem #", "nennen die Einheiten (°C, pro Minute)", DARK, bigsize=26)

# ---------------------------------------------------------------- 3 while-Schleife (Zeilen 9 bis 12)
def n_of(t, ct):
    """Anzahl der Durchlaeufe (Minuten), die gerade angezeigt wird."""
    t0 = ct(5) + 3.6
    if t >= t0: return min(37, 1 + int((t - t0) / 0.035))
    return 1 if t >= ct(4) + 0.3 else 0
def sc3(f, t, ct):
    heading(f, t, "Abschnitt 2: die while-Schleife (Zeilen 9 bis 12)")
    tm = [(-1 if i < 7 else 1e9) for i in range(len(CODE))]
    typed(tm, [8], ct(0) + 0.3); typed(tm, [9], ct(1) + 0.2); typed(tm, [10], ct(2) + 0.3); typed(tm, [11], ct(4) + 0.1)
    hl = hl_at(t, [(0, None), (ct(0), {8}), (ct(1), {9}), (ct(2), {10}), (ct(4), {11}), (ct(5), {9, 10, 11})])
    draw_code(f, t, tm, hl)
    n = n_of(t, ct)
    if n >= 1: shown_T = TEMPS[n]
    elif t >= ct(3) + 0.2: shown_T = TEMPS[1]      # Zeile 11 rechnet zuerst, Zeile 12 zaehlt danach
    else: shown_T = TEMPS[0]
    cond = "wahr" if shown_T > ZIEL else "falsch"
    state_cells(f, t, f"{shown_T:.1f}", str(n), cond, a=ap(t, ct(0) + 0.5, 0.4))
    P = Plot((880, 250, 1220, 580), (0, 40), (0, 900))
    def ax(d, dy): P.axes(d, dy, range(0, 41, 10), range(0, 901, 300), "Minuten", "°C")
    f.el(ap(t, ct(3) + 0.2, 0.5), ax)
    def pts(d, dy):
        for i in range(0, n): d.line((P.px(i), P.py(TEMPS[i]), P.px(i + 1), P.py(TEMPS[i + 1])), fill=(150, 156, 168), width=2)
        for i in range(0, n + 1):
            x, y = P.px(i), P.py(TEMPS[i]); d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=RED)
        P.hline(d, 0, ZIEL, GREEN, None)
    if t >= ct(3) + 0.2: f.el(1, pts)

# ---------------------------------------------------------------- 4 Ausgabe (Zeile 14)
def sc4(f, t, ct):
    heading(f, t, "Abschnitt 3: Ausgabe (Zeile 14)")
    tm = [(-1 if i < 12 else 1e9) for i in range(len(CODE))]
    typed(tm, [13], ct(1) + 0.2)
    hl = hl_at(t, [(0, {9, 10, 11}), (ct(1), {13}), (ct(3), {9, 10, 11, 13})])
    draw_code(f, t, tm, hl)
    state_cells(f, t, "58.0", "37", "falsch")
    console(f, t, [(ct(1) + 2.8, [(EXPECT[0], CODE_G)])], 216, 90)
    tile(f, t, ct(2) + 0.3, RX, 322, RW, 100, "Eine Nachkommastelle", "statt 57,9514 steht 58.0 da", DARK, bigsize=26)
    tile(f, t, ct(3) + 0.4, RX, 438, RW, 130, "58,0 ist kleiner als 60", ["Ziel unterschritten,", "aber nicht genau getroffen"], RED, bigsize=26)

# ---------------------------------------------------------------- 5 for-Schleife (Zeilen 16 bis 23)
def sc5(f, t, ct):
    heading(f, t, "Abschnitt 4: for und range (Zeilen 16 bis 23)")
    tm = [(-1 if i < 14 else 1e9) for i in range(len(CODE))]
    typed(tm, [15, 16, 17], ct(0) + 0.3, cps=90, gap=0.05); typed(tm, [18], ct(1) + 0.2)
    typed(tm, [19, 20, 21], ct(2) + 0.2, cps=70); typed(tm, [22], ct(4) + 0.2)
    hl = hl_at(t, [(0, None), (ct(0), {15, 16, 17}), (ct(1), {18}), (ct(2), {19, 20, 21}), (ct(3), {21}), (ct(4), {22})])
    draw_code(f, t, tm, hl)
    def strip(d, dy):
        T2(d, RX, 100 + dy, "Minute:", F(24, 700), GREY)
        numline(d, RX + 100, 94 + dy, [1, 2, 3, 4, 5, 6], {1, 2, 3, 4, 5}, cw=44, stop=6, size=24)
        T2(d, RX + RW, 144 + dy, "6: nicht mehr dabei", F(20, 700), RED, "ra")
    f.el(ap(t, ct(1) + 1.2, 0.5), strip)
    rows = [[str(i + 1), f"{TEMPS[i + 1]:.2f}", f"{SUMS[i]:.2f}"] for i in range(5)]
    rt = [ct(2) + 0.5 + 0.9 * i for i in range(5)]
    f.el(ap(t, ct(2) + 0.2, 0.4), lambda d, dy: grid(d, RX, 190 + dy, [90, 150, 181], ["minute", "t", "summe"], rows, t, rt, size=22, rh=36, colors={(i, 2): GREEN for i in range(5)}))
    ents = [(rt[i] + 0.3, [(EXPECT[1 + i], CODE_T)]) for i in range(5)] + [(ct(4) + 2.2, [(EXPECT[6], CODE_G)])]
    console(f, t, ents, 420, 196)
    tile(f, t, ct(3) + 0.3, RX, 628, RW, 56, "Feldbreite 6, eine Nachkommastelle", "", DARK, bigsize=22)

# ---------------------------------------------------------------- 6 Plausibilitaet
def sc6(f, t, ct):
    heading(f, t, "Plausibel? Exponentielles Abklingen")
    P = Plot((120, 160, 740, 570), (0, 60), (0, 900))
    def ax(d, dy):
        P.axes(d, dy, range(0, 61, 10), range(0, 901, 300), "Zeit in Minuten", "Temperatur in °C")
        d.line([(P.px(i), P.py(TEMPS[i]) + dy) for i in range(61)], fill=(150, 156, 168), width=3)
    f.el(ap(t, 0.1, 0.5), ax)
    def a1(d, dy):
        for i in range(1, 6):
            x, y = P.px(i), P.py(TEMPS[i]); d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=RED)
        yy = P.py(670.8); d.line((P.px(1), yy, P.px(5), yy), fill=GREEN, width=4)
        T2(d, P.px(5) + 18, yy - 14, "Mittelwert 670,8 °C", F(24, 700), GREEN, "la")
    f.el(ap(t, ct(0) + 2.5, 0.5), a1)
    def a2(d, dy):
        T2(d, P.px(1) + 14, P.py(850) - 4, "−66,4", F(22, 700), RED, "la"); T2(d, P.px(5) + 12, P.py(TEMPS[5]) + 6, "−47,6", F(22, 700), RED, "la")
    f.el(ap(t, ct(1) + 0.5, 0.5), a2)
    f.el(ap(t, ct(3) + 0.3, 0.5), lambda d, dy: (P.hline(d, dy, ZIEL, GREEN, "Ziel: 60 °C", lx=330), P.hline(d, dy, UMG, GREY, None), d.rectangle((P.x1 - 160, P.py(UMG) - 36, P.x1, P.py(UMG) - 6), fill=BG), T2(d, P.x1, P.py(UMG) - 32, "Halle: 20 °C", F(22, 700), GREY, "ra")))
    def a3(d, dy):
        x, y = P.px(37), P.py(TEMPS[37]); d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=GREEN)
        T2(d, x - 12, y - 78, "Minute 37", F(22, 700), GREEN, "ma"); d.line((x, y - 52, x, y - 14), fill=GREEN, width=3)
    f.el(ap(t, ct(3) + 3.0, 0.5), a3)
    def c1(d, dy):
        card(d, 790, 150 + dy, 446, 120)
        T2(d, 818, 162 + dy, "Die Abnahme wird kleiner", F(26, 700), DARK); T2(d, 818, 202 + dy, "1. Minute: 66 °C weniger", F(24, 400), GREY); T2(d, 818, 232 + dy, "5. Minute: nur 48 °C weniger", F(24, 400), GREY)
    f.el(ap(t, ct(1) + 0.3, 0.5), c1, dy=int((1 - ap(t, ct(1) + 0.3, 0.5)) * 12))
    def c2(d, dy):
        card(d, 790, 290 + dy, 446, 150)
        T2(d, 818, 302 + dy, "92 % bleiben pro Minute", F(26, 700), RED); T2(d, 818, 342 + dy, "Unterschied zur Halle:", F(23, 400), GREY)
        T2(d, 818, 372 + dy, "830 → 763,6 → 702,5 → 646,3 …", F(25, 700), DARK); T2(d, 818, 408 + dy, "exponentielles Abklingen", F(23, 400), GREY)
    f.el(ap(t, ct(2) + 0.3, 0.5), c2, dy=int((1 - ap(t, ct(2) + 0.3, 0.5)) * 12))
    def c3(d, dy):
        card(d, 790, 460 + dy, 446, 120)
        T2(d, 818, 472 + dy, "Nie genau null, nie genau 60", F(26, 700), DARK); T2(d, 818, 512 + dy, "Die Schleife fragt nur:", F(24, 400), GREY); T2(d, 818, 542 + dy, "Ziel unterschritten?", F(24, 700), GREEN)
    f.el(ap(t, ct(3) + 0.3, 0.5), c3, dy=int((1 - ap(t, ct(3) + 0.3, 0.5)) * 12))
    pill(f, t, ct(4) + 0.2, 120, 626, 1000, 54, "Ändere k oder ziel und sage vorher, was herauskommt", size=28)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Wie lange kühlt das Werkstück ab?", F(52, 400), GREY)
        code_panel(d, 90, 400, 780, CODE[8:12], [0, 0, 0, 0], 9, 22, lineno=False, lh=36)
        P = Plot((920, 410, 1200, 600), (0, 60), (0, 900))
        d.line((P.x0, P.y1, P.x1, P.y1), fill=DARK, width=3); d.line((P.x0, P.y0, P.x0, P.y1), fill=DARK, width=3)
        d.line([(P.px(i), P.py(TEMPS[i])) for i in range(61)], fill=RED, width=4)
        P.hline(d, 0, ZIEL, GREEN, None)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
