"""V11 Theorie: Programmieren mit Copilot. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v11-common"))
from h11 import *
from texte import SRC

NAME = "v11-theorie"; LABEL = "DHBW · Informatik · V11 · Programmieren mit Copilot"
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235); AMB = (176, 110, 0)
SUGG = (112, 128, 150)   # grauer Copilot-Vorschlag

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))
def dyf(t, tin): return int((1 - show(t, tin)) * 10)

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def cross(d, cx, cy, r, col=RED, w=4):
    d.line((cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5), fill=col, width=w)
    d.line((cx - r * 0.5, cy + r * 0.5, cx + r * 0.5, cy - r * 0.5), fill=col, width=w)

def chip_w(txt, size, pad=22): return int(F(size, 700).getlength(txt)) + 2 * pad
def chip(d, x, y, w, h, txt, fill, col, size=30, outl=None):
    fit(txt, F(size, 700), w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, F(size, 700), col, "mm")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def bubble(d, x, y, w, h, tipx, tipy, fill=WHITE, outl=LINE):
    d.rounded_rectangle((x, y, x + w, y + h), 18, fill=fill, outline=outl, width=3)
    side = x + w if tipx > x + w else x; yc = y + h / 2
    d.polygon([(side, yc - 14), (side, yc + 14), (tipx, yc)], fill=fill, outline=outl)
    d.line((side, yc - 12, side, yc + 12), fill=fill, width=5)

def diamond(d, cx, cy, w, h, txt, size=18, fill=LIGHTA, col=AMB):
    d.polygon([(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)], fill=fill, outline=col)
    d.line([(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy), (cx, cy - h / 2)], fill=col, width=3)
    fit(txt, F(size, 700), w * 0.62, "Raute"); T2(d, cx, cy, txt, F(size, 700), col, "mm")

def person(d, cx, y, dy=0):
    d.ellipse((cx - 24, y + dy, cx + 24, y + 48 + dy), fill=(255, 224, 189), outline=DARK, width=3)
    d.rounded_rectangle((cx - 36, y + 56 + dy, cx + 36, y + 130 + dy), 16, fill=BLUE, outline=DARK, width=3)
    d.rectangle((cx - 100, y + 124 + dy, cx + 100, y + 138 + dy), fill=(150, 120, 90))

def keycap(d, x, y, w, h, txt, glow=0.0, size=26):
    if glow > 0: d.rounded_rectangle((x - 6, y - 6, x + w + 6, y + h + 6), 14, outline=mix(WHITE, RED, glow), width=5)
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=WHITE, outline=DARK, width=3)
    T2(d, x + w / 2, y + h / 2, txt, F(size, 700), DARK, "mm")

# ---------------------------------------------------------------- 1 Hook
CODE_A = ["def passungsart(bmin, bmax, wmin, wmax):", "    if bmin > wmax:", '        return "Spielpassung"',
          "    elif bmax <= wmin:", '        return "Übermaßpassung"']
CODE_B = [c.replace(">", ">=") if "bmin >" in c else c for c in CODE_A]

def sc1(f, t, ct):
    heading(f, t, "Zwei Prompts, zwei Antworten")
    f.el(show(t, 0.4), lambda d, dy: (person(d, 640, 124, dy), T2(d, 640, 276 + dy, "Konstrukteurin", F(22, 700), GREY, "ma")), dy=dyf(t, 0.4))
    def bl(d, dy):
        bubble(d, 60, 140 + dy, 470, 96, 560, 200 + dy)
        T2(d, 295, 188 + dy, "Schreib mir was für Passungen.", F(28, 600), DARK, "mm")
    f.el(show(t, ct(1) + 0.2), bl, dy=dyf(t, ct(1) + 0.2))
    def br(d, dy):
        bubble(d, 750, 130 + dy, 470, 150, 720, 200 + dy)
        diamond(d, 850, 190 + dy, 150, 78, "Spiel?"); diamond(d, 1050, 190 + dy, 170, 78, "Übermaß?")
        arrow(d, 926, 190 + dy, 962, 190 + dy, GREY, 3, 9)
        for x, txt in ((780, "Spiel"), (940, "Übermaß"), (1100, "Übergang")):
            chip(d, x, 238 + dy, 110 if txt != "Übergang" else 112, 32, txt, WHITE, DARK, 18)
    f.el(show(t, ct(2) + 0.2), br, dy=dyf(t, ct(2) + 0.2))
    for x, nm, code, tin in ((60, "Antwort A", CODE_A, ct(1) + 2.0), (660, "Antwort B", CODE_B, ct(2) + 3.0)):
        a = show(t, tin)
        f.el(a, lambda d, dy, x=x, nm=nm: tag(d, x, 324 + dy, 170, 38, nm, WHITE, DARK, 22, 700, outl=LINE), dy=int((1 - a) * 10))
        code_box(f, t, code, x, 372, 560, 20, 30, times=[tin + 0.2 + 0.5 * k for k in range(len(code))], alpha_t=tin)
    # Blinkendes Fragezeichen am Vergleichszeichen von A
    cw = M(20).getlength("a"); qx = 60 + 62 + cw * 12.5
    qy = 372 + 50 + 30 + 10
    blink = 0.55 + 0.45 * math.sin((t - ct(3)) * 7)
    def q(d, dy):
        col = mix(WHITE, RED, blink)
        d.ellipse((qx - 17, qy - 17 + dy, qx + 17, qy + 17 + dy), outline=col, width=4)
        d.ellipse((qx + 100, qy - 17 + dy, qx + 134, qy + 17 + dy), fill=col)
        T2(d, qx + 117, qy + dy, "?", F(26, 700), WHITE, "mm")
    f.el(show(t, ct(3) + 2.4), q)
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 330, 600 + dy, 620, 50, "Beide sehen gut aus. Welche stimmt?", RED, WHITE, 28), dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 2 Prompt A gegen Prompt B
QS = ["Maße?", "Einheit?", "Gleichheit?", "Ausgabe?", "Beispiel?"]
PROMPT_B = ["Eingabe: Bohrung und Welle, je min und max, in mm",
            "Raute 1: Bohrung min ≥ Welle max?  Ja: Spielpassung",
            "Raute 2: Bohrung max ≤ Welle min?  Ja: Übermaß",
            "Sonst: Übergangspassung",
            "Beispiel: 25 H7/g6 → Spielpassung"]
CHECKS = ["Eingaben", "Ausgaben", "Einheiten", "Grenzfälle", "Beispiele"]

def sc2(f, t, ct):
    heading(f, t, "Prompt A gegen Prompt B")
    # links: vager Prompt
    def a(d, dy):
        card(d, 60, 128 + dy, 560, 400)
        tag(d, 84, 146 + dy, 220, 38, "Prompt A: ein Satz", WHITE, DARK, 22, 700, outl=LINE)
        d.rounded_rectangle((84, 198 + dy, 596, 254 + dy), 14, fill=LIGHTB, outline=BLUE, width=2)
        T2(d, 340, 226 + dy, "Schreib mir was für Passungen.", F(28, 600), DARK, "mm")
    f.el(show(t, 0.3), a, dy=dyf(t, 0.3))
    for k, q in enumerate(QS):
        tin = ct(0) + 1.2 + 0.7 * k; x = 84 + (k % 2) * 256; y = 270 + (k // 2) * 50
        f.el(show(t, tin), lambda d, dy, x=x, y=y, q=q, tin=tin: chip(d, x, y + dy, 240, 44, q, LIGHTR if t < ct(1) + 0.3 else LIGHTA, RED if t < ct(1) + 0.3 else AMB, 26), dy=dyf(t, tin))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: tag(d, 84, 430 + dy, 512, 40, "KI rät: das Häufigste wird eingesetzt", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: tag(d, 84, 478 + dy, 512, 40, "erfundene Toleranzwerte", RED, WHITE, 24), dy=dyf(t, ct(1) + 3.0))
    # rechts: PAP als Prompt
    def b(d, dy):
        card(d, 660, 128 + dy, 560, 400)
        tag(d, 684, 146 + dy, 280, 38, "Prompt B: PAP in Sätzen", WHITE, DARK, 22, 700, outl=LINE)
        d.rounded_rectangle((684, 198 + dy, 1196, 512 + dy), 14, fill=BOX)
    f.el(show(t, ct(2) + 0.2), b, dy=dyf(t, ct(2) + 0.2))
    for k, ln in enumerate(PROMPT_B):
        tin = ct(2) + 0.8 + 1.0 * k
        def row(d, dy, ln=ln, k=k, tin=tin):
            sz = 22
            while F(sz, 600).getlength(ln) > 486 and sz > 14: sz -= 1
            col = CODE_T if k != 1 and k != 2 else CODE_K
            T2(d, 700, 232 + k * 54 + dy, ln, F(sz, 600), col, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))
    # Raute-Marker
    for k, nm in ((1, "Raute 1"), (2, "Raute 2")): pass
    # unten: fuenf Fragen
    f.el(show(t, ct(3) + 0.1), lambda d, dy: T2(d, 60, 548 + dy, "Fünf Fragen vor dem Abschicken", F(24, 700), GREY, "la"))
    for k, c in enumerate(CHECKS):
        tin = ct(3) + 0.9 + 0.9 * k; x = 60 + k * 236
        def ck(d, dy, x=x, c=c):
            d.rounded_rectangle((x, 586 + dy, x + 220, 646 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((x + 12, 600 + dy, x + 44, 632 + dy), fill=GREEN); tick(d, x + 28, 616 + dy, 18, WHITE, 4)
            fit(c, F(26, 700), 160, "Frage"); T2(d, x + 56, 616 + dy, c, F(26, 700), DARK, "lm")
        f.el(show(t, tin), ck, dy=dyf(t, tin))

# ---------------------------------------------------------------- 3 Testfaelle vorher
TEST_HEAD = ["Passung", "Bohrung min – max in mm", "Welle min – max in mm", "erwartet"]
TEST_ROWS = [["25 H7/g6", "25,000 – 25,021", "24,980 – 24,993", "Spielpassung"],
             ["25 H7/r6", "25,000 – 25,021", "25,028 – 25,041", "Übermaßpassung"],
             ["25 H7/k6", "25,000 – 25,021", "25,002 – 25,015", "Übergangspassung"],
             ["25 H7/h6", "25,000 – 25,021", "24,987 – 25,000", "Spielpassung"]]
CODE_FIX = ["def passungsart(bmin, bmax, wmin, wmax):", "    if bmin > wmax:", '        return "Spielpassung"', "    ..."]

def sc3(f, t, ct):
    heading(f, t, "Erst die Testfälle, dann der Code")
    c1 = ct(1)
    rt = [c1 + 0.3, c1 + 1.5, c1 + 2.7, c1 + 4.2]
    def tb(d, dy):
        grid(d, 60, 124 + dy, [180, 340, 340, 300], TEST_HEAD, TEST_ROWS, t, rt, size=21, rh=40, new_hl=False,
             colors={(3, 3): RED, (3, 0): RED})
    f.el(show(t, 0.3), tb, dy=dyf(t, 0.3))
    f.el(show(t, rt[3] + 0.4), lambda d, dy: tag(d, 920, 124 + 40 * 5 + 8 + dy, 300, 38, "Grenzfall: Spiel = 0 mm", RED, WHITE, 22), dy=dyf(t, rt[3] + 0.4))
    f.el(show(t, 0.9), lambda d, dy: tag(d, 60, 124 + 40 * 5 + 8 + dy, 340, 38, "von Hand, vor dem Prompt", LIGHTB, BLUE, 22, 700, outl=BLUE))
    # Code A + Konsole
    c2 = ct(2)
    fix = t >= ct(3) + 3.6
    code = [c.replace("> wmax", ">= wmax") if fix else c for c in CODE_FIX]
    hl = {1} if t >= ct(3) + 0.2 else None
    f.el(show(t, c2 + 0.1), lambda d, dy: tag(d, 60, 380 + dy, 230, 36, "Antwort A der KI", WHITE, DARK, 22, 700, outl=LINE))
    code_box(f, t, code, 60, 424, 640, 22, 32, hl=hl, times=[c2 + 0.5 + 0.5 * k for k in range(4)], alpha_t=c2 + 0.1)
    ent = [(c2 + 2.0, [("ok     Spielpassung", CODE_G)]), (c2 + 2.6, [("ok     Übermaßpassung", CODE_G)]),
           (c2 + 3.2, [("ok     Übergangspassung", CODE_G)])]
    if not fix: ent.append((ct(3) + 0.2, [("FEHLER 25 H7/h6 -> Übergangspassung", CODE_R)]))
    else:
        ent = [(c2 + 2.0, [("ok     Spielpassung", CODE_G)]), (c2 + 2.6, [("ok     Übermaßpassung", CODE_G)]),
               (c2 + 3.2, [("ok     Übergangspassung", CODE_G)]), (ct(3) + 3.8, [("ok     Spielpassung", CODE_G)]), (ct(3) + 4.2, [("Fehlgeschlagene Tests: 0", CODE_K)])]
    f.el(show(t, c2 + 1.6), lambda d, dy: console_panel(d, 740, 424 + dy, 480, 200, ent, t, 20, title="Ausgabe", lh=30), dy=dyf(t, c2 + 1.6))
    # roter Kreis um > und Hinweis
    cw = M(22).getlength("a"); ox = 60 + 62 + cw * 12.5  # Position des Zeichens ">" in Zeile 2
    oy = 424 + 50 + 32 * 1 + 16
    def circ(d, dy):
        if not fix: d.ellipse((ox - 22, oy - 20 + dy, ox + 22, oy + 20 + dy), outline=RED, width=4)
    f.el(show(t, ct(3) + 1.6), circ)
    f.el(show(t, ct(3) + 2.4), lambda d, dy: tag(d, 60, 640 + dy, 640, 36, "größer statt größer-gleich", LIGHTR, RED, 24, 700, outl=RED) if not fix else tag(d, 60, 640 + dy, 640, 36, "größer-gleich: alle vier Tests grün", LIGHTG, GREEN, 24, 700, outl=GREEN))
    f.el(show(t, ct(3) + 5.8), lambda d, dy: tag(d, 740, 640 + dy, 480, 36, "ohne Test nie aufgefallen", RED, WHITE, 24))

# ---------------------------------------------------------------- 4 Module
def sc4(f, t, ct):
    heading(f, t, "Module: fertige Bausteine")
    # ct0: Werkzeugkiste
    def box0(d, dy):
        card(d, 60, 124 + dy, 1160, 150)
        d.rounded_rectangle((90, 152 + dy, 330, 246 + dy), 14, fill=(150, 120, 90), outline=DARK, width=3)
        d.rounded_rectangle((150, 134 + dy, 270, 160 + dy), 8, outline=DARK, width=3)
        T2(d, 210, 199 + dy, "math", M(40, True), WHITE, "mm")
        for k, (nm, tin) in enumerate((("sqrt", 2.0), ("pi", 2.6), ("sin", 3.2), ("isclose", 3.8))):
            a = ap(t, ct(0) + tin, 0.4)
            if a > 0: chip(d, 370 + k * 150, 152 + dy, 136 if nm != "isclose" else 156, 50, nm, mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 26)
        T2(d, 370, 226 + dy, "Modul = Python-Datei mit Funktionen", F(24, 700), GREY, "la")
    f.el(show(t, 0.3, ct(4) - 0.1), box0, dy=dyf(t, 0.3))
    # drei Karten
    specs = [("import math", "math.sqrt(16)", ["math.sqrt", "mit Modulnamen"], 60),
             ("from math import sqrt", "sqrt(16)", ["sqrt", "ohne Modulnamen"], 455),
             ("import math as m", "m.sqrt(16)", ["m.sqrt", "Kurzname m"], 850)]
    for k, (imp, use, lab, x) in enumerate(specs):
        tin = ct(k + 1) + 0.2
        def kard(d, dy, imp=imp, use=use, lab=lab, x=x, k=k, tin=tin):
            card(d, x, 296 + dy, 370, 240)
            monobox(d, x + 22, 316 + dy, 326, 50, imp, 22, CODE_T)
            arrow(d, x + 185, 372 + dy, x + 185, 404 + dy, GREY, 3, 10)
            chip(d, x + 22, 410 + dy, 326, 54, use, LIGHTB, BLUE, 28)
            T2(d, x + 185, 504 + dy, lab[1], F(24, 700), GREY, "mm")
        f.el(show(t, tin), kard, dy=dyf(t, tin))
    # Karte 3: math gestrichen
    def strike(d, dy):
        x = 850
        d.rounded_rectangle((x + 22, 410 + dy, x + 348, 464 + dy), 10, fill=LIGHTR, outline=RED, width=2)
        T2(d, x + 185, 437 + dy, "math.sqrt(16)", F(28, 700), RED, "mm")
        d.line((x + 70, 437 + dy, x + 300, 437 + dy), fill=RED, width=4)
    f.el(show(t, ct(3) + 3.0), strike)
    f.el(show(t, ct(3) + 3.6), lambda d, dy: tag(d, 850, 548 + dy, 370, 40, "NameError: math", RED, WHITE, 24), dy=dyf(t, ct(3) + 3.6))
    # ct4: Standardbibliothek und eigenes Modul
    def lib(d, dy):
        card(d, 60, 124 + dy, 1160, 150)
        T2(d, 90, 136 + dy, "Standardbibliothek", F(26, 700), GREEN, "la")
        for k, nm in enumerate(("math", "statistics", "random")):
            a = ap(t, ct(4) + 1.2 + 0.6 * k, 0.4)
            if a > 0:
                x = 90 + k * 230; d.rounded_rectangle((x, 180, x + 210, 250), 12, fill=mix(WHITE, LIGHTG, a), outline=mix(WHITE, GREEN, a), width=3)
                T2(d, x + 105, 215, nm, F(28, 700), mix(WHITE, DARK, a), "mm")
        a = ap(t, ct(4) + 4.6, 0.4)
        if a > 0:
            d.rounded_rectangle((830, 160, 1190, 250), 12, fill=mix(WHITE, LIGHTB, a), outline=mix(WHITE, BLUE, a), width=3)
            T2(d, 1010, 186, "passungen.py", M(30, True), mix(WHITE, BLUE, a), "mm"); T2(d, 1010, 225, "eigenes Modul = eigene Datei", F(20, 700), mix(WHITE, GREY, a), "mm")
    f.el(show(t, ct(4) + 0.2), lib, dy=dyf(t, ct(4) + 0.2))
    f.el(show(t, ct(4) + 5.2), lambda d, dy: monobox(d, 60, 570 + dy, 390, 50, "import passungen", 24, CODE_T), dy=dyf(t, ct(4) + 5.2))

# ---------------------------------------------------------------- 5 Pakete und pip
def sc5(f, t, ct):
    heading(f, t, "Pakete und pip")
    def std(d, dy):
        card(d, 60, 124 + dy, 400, 170)
        T2(d, 92, 138 + dy, "Standardbibliothek", F(26, 700), GREEN, "la"); T2(d, 92, 172 + dy, "kommt mit Python", F(22, 400), GREY, "la")
        for k, nm in enumerate(("math", "statistics", "random")):
            chip(d, 92 + (k % 2) * 160, 212 + (k // 2) * 44, 146 if k != 1 else 150, 38, nm, LIGHTG, GREEN, 20)
    f.el(show(t, 0.3), std, dy=dyf(t, 0.3))
    def idx(d, dy):
        card(d, 820, 124 + dy, 400, 170)
        T2(d, 852, 138 + dy, "Paketindex (PyPI)", F(26, 700), BLUE, "la"); T2(d, 852, 172 + dy, "Pakete von anderen", F(22, 400), GREY, "la")
        for k, nm in enumerate(("numpy", "pandas", "matplotlib")):
            chip(d, 852 + (k % 2) * 160, 212 + (k // 2) * 44, 146 if k != 2 else 156, 38, nm, LIGHTB, BLUE, 20)
    f.el(show(t, ct(0) + 1.8), idx, dy=dyf(t, ct(0) + 1.8))
    def pip(d, dy):
        tag(d, 548, 190 + dy, 184, 44, "pip", BLUE, WHITE, 28)
        arrow(d, 810, 262 + dy, 470, 262 + dy, BLUE, 5, 14)
    f.el(show(t, ct(0) + 3.6), pip, dy=dyf(t, ct(0) + 3.6))
    f.el(show(t, ct(0) + 4.4), lambda d, dy: tag(d, 480, 130 + dy, 320, 38, "ein Paket gehört nicht dazu", WHITE, GREY, 20, 700, outl=LINE), dy=dyf(t, ct(0) + 4.4))
    # Programm + Fehler
    c1 = ct(1)
    f.el(show(t, c1 + 0.1), lambda d, dy: tag(d, 60, 324 + dy, 200, 36, "Dein Programm", WHITE, DARK, 22, 700, outl=LINE))
    code_box(f, t, ["import numpy"], 60, 368, 540, 24, 34, times=[c1 + 0.3], alpha_t=c1 + 0.1)
    f.el(show(t, c1 + 1.4), lambda d, dy: console_panel(d, 60, 484 + dy, 540, 100, [(c1 + 1.5, [("ModuleNotFoundError:", CODE_R)]), (c1 + 1.5, [("No module named 'numpy'", CODE_R)])], t, 20, title="Ausgabe", lh=28), dy=dyf(t, c1 + 1.4))
    f.el(show(t, c1 + 3.4), lambda d, dy: tag(d, 640, 324 + dy, 200, 36, "Terminal", WHITE, DARK, 22, 700, outl=LINE))
    f.el(show(t, c1 + 3.4), lambda d, dy: console_panel(d, 640, 368 + dy, 580, 100, [(c1 + 3.8, [("pip install numpy", CODE_T)])], t, 24, title="Terminal", lh=34))
    f.el(show(t, c1 + 5.4), lambda d, dy: tag(d, 640, 484 + dy, 580, 44, "im Terminal, nicht im Programm", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, c1 + 5.4))
    # Warnung
    def warn(d, dy):
        card(d, 60, 596 + dy, 1160, 70, fill=LIGHTR)
        d.polygon([(100, 646 + dy), (130, 606 + dy), (160, 646 + dy)], outline=RED, fill=WHITE); d.line((100, 646 + dy, 160, 646 + dy, 130, 606 + dy, 100, 646 + dy), fill=RED, width=5)
        T2(d, 130, 632 + dy, "!", F(28, 700), RED, "mm")
        T2(d, 190, 631 + dy, "pip install  numpy-ki-helfer", M(26, True), RED, "lm")
        T2(d, 700, 631 + dy, "Paketname von der KI erfunden: Schadpaket?", F(26, 700), RED, "lm")
    f.el(show(t, ct(2) + 0.6, ct(3) + 0.4), warn, dy=dyf(t, ct(2) + 0.6))
    for k, txt in enumerate(("gibt es das Paket?", "wie bekannt ist es?", "wer pflegt es?")):
        tin = ct(3) + 0.8 + 1.3 * k; x = 60 + k * 396
        def ck(d, dy, x=x, txt=txt):
            d.rounded_rectangle((x, 596 + dy, x + 376, 666 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((x + 14, 614 + dy, x + 48, 648 + dy), fill=GREEN); tick(d, x + 31, 631 + dy, 20, WHITE, 4)
            T2(d, x + 64, 631 + dy, txt, F(28, 700), DARK, "lm")
        f.el(show(t, tin), ck, dy=dyf(t, tin))

# ---------------------------------------------------------------- 6 Copilot im Editor
STEPS = [("Spezifizieren", "Du"), ("Testfälle", "Du"), ("Generieren", "KI"), ("Prüfen", "Du"), ("Verantworten", "Du")]

def sc6(f, t, ct):
    heading(f, t, "Mit Copilot arbeiten")
    c0 = ct(0)
    accept = t >= c0 + 3.4
    def ed(d, dy):
        d.rounded_rectangle((60, 124 + dy, 760, 384 + dy), 14, fill=BOX)
        T2(d, 82, 138 + dy, "Editor", F(20, 600), CODE_C, "la")
        lines = [("def passungsart(bmin, bmax, wmin, wmax):", CODE_T), ("    if bmin >= wmax:", CODE_T if accept else SUGG), ('        return "Spielpassung"', CODE_T if accept else SUGG)]
        for k, (ln, col) in enumerate(lines):
            if k > 0 and t < c0 + 1.2: break
            fit(ln, M(24), 660, "Editor"); T2(d, 82, 190 + dy + k * 40, ln, M(24), col, "lm")
        if not accept and t >= c0 + 1.2:
            T2(d, 82, 330 + dy, "grauer Vorschlag von Copilot", F(20, 700), SUGG, "lm")
    f.el(show(t, 0.3), ed, dy=dyf(t, 0.3))
    gl_tab = ap(t, c0 + 2.4, 0.3) * (1 - ap(t, c0 + 3.8, 0.4)); gl_esc = ap(t, c0 + 4.8, 0.3) * (1 - ap(t, c0 + 6.0, 0.4))
    def keys(d, dy):
        keycap(d, 480, 322 + dy, 110, 46, "Tab", gl_tab); keycap(d, 620, 322 + dy, 110, 46, "Esc", gl_esc)
    f.el(show(t, c0 + 1.8), keys)
    f.el(show(t, c0 + 3.6), lambda d, dy: tag(d, 480, 280 + dy, 110, 30, "annehmen", GREEN, WHITE, 18), dy=0)
    f.el(show(t, c0 + 5.0), lambda d, dy: tag(d, 620, 280 + dy, 110, 30, "ablehnen", RED, WHITE, 18), dy=0)
    def chat(d, dy):
        card(d, 800, 124 + dy, 420, 260)
        T2(d, 832, 140 + dy, "Chat", F(24, 700), GREY, "la"); d.line((832, 176 + dy, 1190, 176 + dy), fill=LINE, width=2)
        d.rounded_rectangle((900, 192 + dy, 1190, 248 + dy), 14, fill=LIGHTB, outline=BLUE, width=2)
        T2(d, 1045, 220 + dy, "Erkläre diese Funktion", F(22, 600), DARK, "mm")
        d.rounded_rectangle((832, 266 + dy, 1100, 358 + dy), 14, fill=WHITE, outline=LINE, width=2)
        for k in range(3): d.line((852, 288 + dy + k * 26, 1080 - k * 40, 288 + dy + k * 26), fill=LINE, width=8)
    f.el(show(t, c0 + 5.8), chat, dy=dyf(t, c0 + 5.8))
    # Schritte
    c1 = ct(1); c3 = ct(3)
    xs = [60 + k * 236 for k in range(5)]
    for k, (nm, wer) in enumerate(STEPS):
        tin = c1 + 0.2 + 0.0 * k
        lit = ap(t, c3 + 0.4 + 1.1 * k, 0.3) * (1 - ap(t, c3 + 1.5 + 1.1 * k, 0.3)) if k < 4 else ap(t, c3 + 0.4 + 1.1 * k, 0.3)
        def st(d, dy, k=k, nm=nm, wer=wer, lit=lit):
            ki = wer == "KI"
            base = LIGHTB if ki else LIGHTG; col = BLUE if ki else GREEN
            d.rounded_rectangle((xs[k], 470 + dy, xs[k] + 220, 540 + dy), 14, fill=mix(base, LIGHTA, lit), outline=mix(col, AMB, lit), width=3)
            fit(nm, F(26, 700), 200, "Schritt"); T2(d, xs[k] + 110, 505 + dy, nm, F(26, 700), DARK, "mm")
            chip(d, xs[k] + 70, 440 + dy, 80, 28, "KI" if ki else "Du", col, WHITE, 18, outl=col)
            if k < 4: arrow(d, xs[k] + 222, 505 + dy, xs[k] + 234, 505 + dy, GREY, 3, 8)
        f.el(show(t, tin), st, dy=dyf(t, tin))
    f.el(show(t, c1 + 1.0), lambda d, dy: T2(d, 640, 408 + dy, "Das Tippen übernimmt die KI, den Rest machst du", F(24, 700), GREY, "mm"))
    # Datenschutz
    def ds(d, dy):
        card(d, 60, 598 + dy, 1160, 64, fill=LIGHTR)
        d.ellipse((84, 606 + dy, 132, 654 + dy), outline=RED, width=6); d.line((93, 645 + dy, 123, 615 + dy), fill=RED, width=6)
        T2(d, 156, 630 + dy, "Keine Firmen- oder Kundendaten in Prompts", F(34, 700), RED, "lm")
    f.el(show(t, ct(2) + 0.2), ds, dy=dyf(t, ct(2) + 0.2))
    # Ruecksprung bei roten Tests
    def back(d, dy):
        a = ap(t, c3 + 4.0, 0.8)
        if a <= 0: return
        col = mix(WHITE, RED, a)
        x3 = xs[3] + 110; x2 = xs[2] + 110
        d.line((x3, 544 + dy, x3, 558 + dy), fill=col, width=4); d.line((x3, 558 + dy, x2, 558 + dy), fill=col, width=4); arrow(d, x2, 558 + dy, x2, 543 + dy, col, 4, 10)
        T2(d, (x2 + x3) / 2, 560 + dy, "Tests rot: zurück", F(20, 700), col, "ma")
    f.el(1, back)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V11 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Programmieren mit Copilot", F(84, 700), DARK)
        T2(d, 90, 290, "Spezifizieren, Testfälle, generieren, prüfen", F(44, 400), GREY)
        x = 90
        for nm, (fill, col) in (("Spezifizieren", (LIGHTG, GREEN)), ("Testfälle", (LIGHTG, GREEN)), ("Generieren", (LIGHTB, BLUE)), ("Prüfen", (LIGHTG, GREEN))):
            wd = chip_w(nm, 36, 24); chip(d, x, 440, wd, 80, nm, fill, col, 36); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
