"""V09 Theorie: Dateien & Fehler. Aufruf: python render.py [text|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v09-common"))
from h9 import *
from texte import SRC

NAME = "v09-theorie"; LABEL = "DHBW · Informatik · V09 · Dateien & Fehler"
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235)

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def codeline(d, x, y, s, size, nchars=10**9, bg=BOX):
    draw_segs(d, x, y, highlight(s), M(size), nchars, 1.0, bg)

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

# ---------------------------------------------------------------- 1 Hook
def accel(tt):
    """Beschleunigung in m/s2 ueber 8 s: Ruhe, Bremsung ab 3 s mit Spitze bei 4,2 s."""
    base = 0.25 * math.sin(tt * 7.3) + 0.15 * math.sin(tt * 17.1)
    dip = -4.2 * math.exp(-((tt - 4.2) / 0.55) ** 2) if tt > 2.8 else 0
    return base * 0.6 + dip

def sc1(f, t, ct):
    heading(f, t, "Eine Bremsung als Datei")
    # Lenker mit Handy
    def bike(d, dy):
        card(d, 60, 130 + dy, 400, 330)
        d.ellipse((130, 310 + dy, 270, 450 + dy), outline=DARK, width=6); d.ellipse((194, 374 + dy, 206, 386 + dy), fill=DARK)
        d.line((200, 380 + dy, 200, 270 + dy), fill=DARK, width=8)                   # Gabel
        d.line((200, 270 + dy, 330, 250 + dy), fill=DARK, width=8)                   # Lenkerstange
        d.line((330, 250 + dy, 360, 290 + dy), fill=DARK, width=8)                   # Griff
        d.rounded_rectangle((250, 150 + dy, 340, 250 + dy), 10, fill=BOX, outline=DARK, width=3)  # Handy
        d.rounded_rectangle((258, 160 + dy, 332, 238 + dy), 4, fill=BOX2)
        d.line((262, 215 + dy, 282, 200 + dy), fill=CODE_G, width=3); d.line((282, 200 + dy, 296, 222 + dy), fill=CODE_G, width=3)
        d.line((296, 222 + dy, 306, 178 + dy), fill=CODE_G, width=3); d.line((306, 178 + dy, 328, 196 + dy), fill=CODE_G, width=3)
        T2(d, 260, 428 + dy, "Handy am Lenker", F(24, 700), DARK, "mm") if False else None
        T2(d, 260, 478 + dy, "Handy am Lenker", F(24, 700), GREY, "mm")
    f.el(show(t, 0.3), bike, dy=int((1 - show(t, 0.3)) * 12))
    # Kurve
    px0, py0, px1, py1 = 560, 160, 1200, 420
    def curve(d, dy):
        card(d, 500, 130 + dy, 720, 330)
        for v in (0, -2, -4):
            y = py0 + (py1 - py0) * (0 - v) / 5.0 * 1.0 + 40
            d.line((px0, y + dy, px1, y + dy), fill=LINE, width=1); T2(d, px0 - 6, y + dy, f"{v}".replace("-", "−"), F(18, 400), GREY, "rm")
        T2(d, px1, 428 + dy, "Zeit in s", F(20, 600), GREY, "ra"); T2(d, px0, 142 + dy, "Beschleunigung in m/s²", F(20, 600), GREY, "la")
        prog = ap(t, ct(1) + 0.3, 3.5)
        pts = []
        for k in range(0, 401):
            tt = 8 * k / 400
            if k / 400 > prog: break
            y = py0 + 40 + (py1 - py0) * (0 - accel(tt)) / 5.0
            pts.append((px0 + (px1 - px0) * tt / 8, y + dy))
        if len(pts) > 1: d.line(pts, fill=RED, width=3)
    f.el(show(t, ct(1) - 0.1), curve)
    # Kacheln
    def tl(d, dy, x, big, small):
        card(d, x, 490 + dy, 330, 100)
        T2(d, x + 28, 500 + dy, big, F(40, 700), RED); T2(d, x + 28, 552 + dy, small, F(24, 400), GREY)
    f.el(show(t, ct(1) + 2.5), lambda d, dy: tl(d, dy, 500, "400 Zeilen", "eine Zeile je Messung"), dy=int((1 - show(t, ct(1) + 2.5)) * 10))
    f.el(show(t, ct(1) + 4.7), lambda d, dy: tl(d, dy, 890, "50 Hz", "50 Messungen pro Sekunde"), dy=int((1 - show(t, ct(1) + 4.7)) * 10))
    # Spitze markieren
    def peak(d, dy):
        x = px0 + (px1 - px0) * 4.2 / 8; y = py0 + 40 + (py1 - py0) * 4.2 / 5.0
        d.ellipse((x - 14, y - 14 + dy, x + 14, y + 14 + dy), outline=RED, width=4)
        tag(d, x + 40, y - 20 + dy, 190, 40, "Spitze gesucht", WHITE, RED, 22, 700, outl=RED)
    f.el(show(t, ct(2) + 0.4), peak)
    # kaputte Zeile
    def row(d, dy):
        card(d, 60, 616 + dy, 1160, 60)
        T2(d, 90, 646 + dy, "bremsen.csv", F(22, 700), GREY, "lm")
        T2(d, 260, 646 + dy, "2,10E+00;", M(22), DARK, "lm")
        T2(d, 420, 646 + dy, "n/a", M(22, True), WHITE, "lm") if False else None
        d.rounded_rectangle((420, 626 + dy, 560, 666 + dy), 8, fill=LIGHTR, outline=RED, width=3)
        T2(d, 490, 646 + dy, "n/a", M(24, True), RED, "mm")
        T2(d, 575, 646 + dy, ";-3,78", M(22), DARK, "lm")
        tag(d, 840, 626 + dy, 340, 40, "kaputte Zeile: kein Messwert", RED, WHITE, 22)
    f.el(show(t, ct(2) + 5.2), row, dy=int((1 - show(t, ct(2) + 5.2)) * 10))

# ---------------------------------------------------------------- 2 Datei und Pfad
TREE = [(0, "C:\\", False), (1, "Users", False), (2, "informatik", False), (3, "auswerten.py", True), (3, "daten", False), (4, "bremsen.csv", True)]

def sc2(f, t, ct):
    heading(f, t, "Datei und Pfad")
    RH = 66; x0, y0 = 70, 140
    for k, (lev, nm, isf) in enumerate(TREE):
        tin = ct(0) + 0.3 + 1.0 * k; a = show(t, tin)
        def node(d, dy, k=k, lev=lev, nm=nm, isf=isf):
            x = x0 + 44 * lev; y = y0 + k * RH + dy
            hot = ap(t, ct(0) + 6.8, 0.4) if nm == "bremsen.csv" else 0
            d.rounded_rectangle((x, y, x + 250, y + 50), 10, fill=mix(WHITE, LIGHTB, hot) if isf else WHITE, outline=BLUE if isf else DARK, width=3)
            T2(d, x + 16, y + 25, ("Datei  " if False else "") + nm, M(22, True), BLUE if isf else DARK, "lm")
            if k > 0 and lev > 0:
                par = max(j for j in range(k) if TREE[j][0] == lev - 1)
                yy = y0 + par * RH + 50
                d.line((x0 + 44 * (lev - 1) + 18, yy + dy, x0 + 44 * (lev - 1) + 18, y + 25 + dy), fill=GREY, width=3)
                d.line((x0 + 44 * (lev - 1) + 18, y + 25 + dy, x, y + 25 + dy), fill=GREY, width=3)
        f.el(a, node, dy=int((1 - a) * 10))
    f.el(show(t, ct(0) + 4.0), lambda d, dy: tag(d, 520, y0 + 3 * RH + 4 + dy, 150, 42, "Programm", WHITE, BLUE, 22, 700, outl=BLUE))
    f.el(show(t, ct(0) + 6.6), lambda d, dy: tag(d, 520, y0 + 5 * RH + 4 + dy, 150, 42, "Datei", WHITE, BLUE, 22, 700, outl=BLUE))
    f.el(show(t, ct(0) + 4.8), lambda d, dy: tag(d, 460, y0 + 1 * RH + 4 + dy, 220, 42, "Ordner", WHITE, GREY, 22, 700, outl=LINE))
    # Pfade rechts
    def pathcard(d, dy, y, title, txt, col, fill):
        card(d, 690, y + dy, 530, 130, fill=fill)
        T2(d, 722, y + 14 + dy, title, F(26, 700), col, "la")
        sz = 24
        while M(sz).getlength(txt) > 470 and sz > 14: sz -= 1
        d.rounded_rectangle((716, y + 62 + dy, 1196, y + 112 + dy), 8, fill=BOX)
        T2(d, 732, y + 87 + dy, txt, M(sz), CODE_T, "lm")
    a1 = show(t, ct(1) + 0.3); a2 = show(t, ct(1) + 3.8)
    f.el(a1, lambda d, dy: pathcard(d, dy, 140, "absoluter Pfad: von ganz oben", "C:\\Users\\informatik\\daten\\bremsen.csv", RED, WHITE), dy=int((1 - a1) * 10))
    f.el(a2, lambda d, dy: pathcard(d, dy, 290, "relativer Pfad: ab dem Programm", "daten\\bremsen.csv", BLUE, WHITE), dy=int((1 - a2) * 10))
    # Fehler
    def err(d, dy):
        card(d, 690, 450 + dy, 530, 190, fill=LIGHTR)
        d.rounded_rectangle((716, 470 + dy, 1196, 520 + dy), 8, fill=BOX2)
        T2(d, 732, 495 + dy, "open(\"daten\\bremsen.cvs\")", M(22), CODE_T, "lm")
        d.line((972, 512 + dy, 1048, 512 + dy), fill=CODE_R, width=3)
        T2(d, 722, 540 + dy, "FileNotFoundError", M(28, True), RED, "la")
        T2(d, 722, 584 + dy, "Datei unter diesem Namen nicht gefunden", F(24, 600), DARK, "la")
    f.el(show(t, ct(2) + 3.0), err, dy=int((1 - show(t, ct(2) + 3.0)) * 10))
    f.el(show(t, ct(2) + 7.0), lambda d, dy: tag(d, 70, 580 + dy, 520, 50, "Meist: Tippfehler oder falscher Ordner", WHITE, DARK, 24, 700, outl=LINE))

# ---------------------------------------------------------------- 3 Kodierung
CH = [("L", "4C", 0), ("ä", "C3 A4", 1), ("n", "6E", 0), ("g", "67", 0), ("e", "65", 0)]
LAT = ["L", "Ã¤", "n", "g", "e"]

def sc3(f, t, ct):
    heading(f, t, "Textkodierung: Bytes werden Buchstaben")
    x0, y0, cw = 120, 170, 200
    def row(d, dy):
        card(d, 60, 130 + dy, 1160, 250)
        T2(d, 92, 144 + dy, "Datei  =  Bytes (hexadezimal)", F(26, 700), DARK, "la")
        for k, (ch, hx, umlaut) in enumerate(CH):
            x = 100 + k * 215
            hot = ap(t, ct(1) + 1.0, 0.5) if umlaut else 0
            fill = mix(WHITE, LIGHTB, hot)
            wd = 190 if umlaut else 150
            d.rounded_rectangle((x, 200 + dy, x + wd, 270 + dy), 10, fill=fill, outline=mix(DARK, BLUE, hot), width=3)
            T2(d, x + wd / 2, 235 + dy, hx, M(32, True), mix(DARK, BLUE, hot), "mm")
            # Buchstabe darunter
            rd = ap(t, ct(0) + 4.2, 0.5)
            if rd > 0:
                T2(d, x + wd / 2, 316 + dy, ch, F(52, 700), mix(WHITE, mix(DARK, BLUE, hot), rd), "mm")
    f.el(show(t, ct(0) + 0.2), row, dy=int((1 - show(t, ct(0) + 0.2)) * 10))
    f.el(show(t, ct(0) + 4.0), lambda d, dy: T2(d, 1190, 150 + dy, "die Textkodierung ordnet Bytes Buchstaben zu", F(22, 600), GREY, "ra"))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: tag(d, 60, 410 + dy, 330, 52, "UTF-8: Umlaut = 2 Bytes", BLUE, WHITE, 26))
    # falsch lesen
    def wrong(d, dy):
        card(d, 420, 400 + dy, 800, 130, fill=LIGHTR)
        T2(d, 450, 412 + dy, "gelesen mit falscher Tabelle (Latin-1)", F(24, 700), RED, "la")
        for k, s in enumerate(LAT):
            x = 450 + k * 100
            d.rounded_rectangle((x, 450 + dy, x + 84, 510 + dy), 8, fill=WHITE, outline=RED if k == 1 else LINE, width=3)
            T2(d, x + 42, 480 + dy, s, F(40, 700), RED if k == 1 else DARK, "mm")
        arrow(d, 990, 480 + dy, 1050, 480 + dy, RED, 4)
        T2(d, 1066, 480 + dy, "Müll", F(34, 700), RED, "lm") if False else None
        T2(d, 1066, 480 + dy, "LÃ¤nge", F(34, 700), RED, "lm")
    f.el(show(t, ct(2) + 0.6), wrong, dy=int((1 - show(t, ct(2) + 0.6)) * 10))
    f.el(show(t, ct(2) + 7.8), lambda d, dy: code_panel(d, 220, 560 + dy, 840, ['open("bremsen.csv", encoding="utf-8")'], [ct(2) + 8.0], t, 26, 50, lineno=False, title=None, pad_bottom=14))

# ---------------------------------------------------------------- 4 CSV
def csvline(d, x, y, s, size, sep, dec=None, mark=1.0):
    """Zeichenweise: Trennzeichen rot, Dezimalzeichen blau."""
    f_ = M(size, True); cx = x
    for ch in s:
        col = CODE_T
        if ch == sep: col = mix(CODE_T, CODE_R, mark)
        elif dec and ch == dec: col = mix(CODE_T, CODE_K, mark)
        d.text((cx, y), ch, font=f_, fill=col); cx += f_.getlength(ch)

HEAD = '"Time (s)";"a_x (m/s^2)";"a_y (m/s^2)"'
ROWA = "0,02;-1,86;0,08"; ROWB = "0.02,-1.86,0.08"

def sc4(f, t, ct):
    heading(f, t, "CSV: Trennzeichen und Dezimalzeichen")
    def head(d, dy):
        card(d, 60, 130 + dy, 1160, 190)
        T2(d, 92, 142 + dy, "bremsen.csv", F(26, 700), DARK, "la")
        d.rounded_rectangle((92, 184 + dy, 1188, 304 + dy), 10, fill=BOX)
        csvline(d, 112, 194 + dy, HEAD, 24, ";", None, ap(t, ct(0) + 5.0, 0.4))
        T2(d, 112, 232 + dy, "0,00;0,10;-0,06", M(24, True), CODE_T, "la") if False else None
        csvline(d, 112, 232 + dy, "0,00;0,10;-0,06", 24, ";", None, ap(t, ct(0) + 5.0, 0.4))
        csvline(d, 112, 266 + dy, "0,02;-1,86;0,08", 24, ";", None, ap(t, ct(0) + 5.0, 0.4))
        T2(d, 820, 232 + dy, "eine Zeile je Messung", F(22, 600), GREEN, "la") if t > ct(0) + 2.5 else None
        if t > ct(0) + 1.0:
            T2(d, 820, 194 + dy, "Kopfzeile", F(22, 600), RED, "la")
    f.el(show(t, ct(0) + 0.2), head, dy=int((1 - show(t, ct(0) + 0.2)) * 10))
    # zwei Dialekte
    def dial(d, dy, y, title, txt, sep, dec, col):
        card(d, 60, y + dy, 1160, 140)
        T2(d, 92, y + 12 + dy, title, F(26, 700), col, "la")
        d.rounded_rectangle((92, y + 56 + dy, 560, y + 112 + dy), 10, fill=BOX)
        csvline(d, 112, y + 70 + dy, txt, 28, sep, dec)
        d.rounded_rectangle((600, y + 62 + dy, 620, y + 82 + dy), 4, fill=CODE_R)
        T2(d, 634, y + 72 + dy, "Trennzeichen" + ("  ;" if sep == ";" else "  ,"), F(24, 700), RED, "lm")
        d.rounded_rectangle((600, y + 94 + dy, 620, y + 114 + dy), 4, fill=CODE_K)
        T2(d, 634, y + 104 + dy, "Dezimalzeichen" + ("  ," if dec == "," else "  ."), F(24, 700), BLUE, "lm")
    a1 = show(t, ct(1) + 0.3); a2 = show(t, ct(1) + 6.3)
    f.el(a1, lambda d, dy: dial(d, dy, 345, "Deutsches Excel", ROWA, ";", ",", DARK), dy=int((1 - a1) * 10))
    f.el(a2, lambda d, dy: dial(d, dy, 500, "Andere Programme", ROWB, ",", ".", DARK), dy=int((1 - a2) * 10))
    f.el(show(t, ct(2) + 2.9), lambda d, dy: tag(d, 780, 640 + dy, 440, 50, "Python: als Dezimalzeichen nur der Punkt", RED, WHITE, 22))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 60, 640 + dy, 400, 50, "Beides siehst du erst in der Datei", WHITE, DARK, 22, 700, outl=LINE))

# ---------------------------------------------------------------- 5 Zeile zerlegen
Z0 = "'1,84;0,12;-3,78;0,31;3,81\\n'"
STEPS = [("zeile = datei.readline()", "roh"), ("zeile = zeile.strip()", "strip"), ('teile = zeile.split(";")', "split"),
         ('text = teile[2].replace(",", ".")', "replace"), ("wert = float(text)", "float")]

def sc5(f, t, ct):
    heading(f, t, "Aus einer Zeile wird eine Zahl")
    tins = [ct(0) + 0.3, ct(1) + 0.4, ct(1) + 3.8, ct(2) + 0.3, ct(2) + 2.8]
    y0, RH = 128, 106
    for k, (code, nm) in enumerate(STEPS):
        a = show(t, tins[k]); y = y0 + k * RH
        def step(d, dy, k=k, code=code, y=y):
            d.rounded_rectangle((60, y + dy, 600, y + 86 + dy), 12, fill=BOX)
            codeline(d, 84, y + 28 + dy, code, 24)
            arrow(d, 612, y + 43 + dy, 650, y + 43 + dy, RED, 4, 11)
            # Ergebnis
            card(d, 664, y + dy, 556, 86)
            if k == 0:
                T2(d, 690, y + 43 + dy, Z0, M(25, True), DARK, "lm")
            elif k == 1:
                T2(d, 690, y + 43 + dy, "'1,84;0,12;-3,78;0,31;3,81'", M(25, True), DARK, "lm")
            elif k == 2:
                vals = ["'1,84'", "'0,12'", "'-3,78'", "'0,31'", "'3,81'"]; xx = 680
                T2(d, xx, y + 43 + dy, "[", M(25, True), GREY, "lm"); xx += 18
                for j, v in enumerate(vals):
                    w = int(M(20, True).getlength(v)) + 14; hot = ap(t, tins[3] - 0.5, 0.4) if j == 2 else 0
                    d.rounded_rectangle((xx, y + 24 + dy, xx + w, y + 62 + dy), 8, fill=mix(LIGHTG if False else WHITE, LIGHTA, hot), outline=AMBER if j == 2 else LINE, width=3 if j == 2 else 2)
                    T2(d, xx + w / 2, y + 43 + dy, v, M(20, True), DARK, "mm"); xx += w + 6
                T2(d, xx, y + 43 + dy, "]", M(25, True), GREY, "lm")
            elif k == 3:
                T2(d, 690, y + 43 + dy, "'-3.78'", M(25, True), DARK, "lm")
                T2(d, 880, y + 43 + dy, "Text", F(24, 700), RED, "lm")
            else:
                T2(d, 690, y + 43 + dy, "-3.78", M(25, True), GREEN, "lm")
                T2(d, 880, y + 43 + dy, "endlich eine Zahl", F(24, 700), GREEN, "lm")
        f.el(a, step, dy=int((1 - a) * 12))
    # Tags Text
    def txt_tags(d, dy):
        hot = 1
        for k in range(4):
            y = y0 + k * RH
            if k == 3: continue
            tag(d, 1120, y + 4 + dy, 90, 34, "Text", LIGHTR, RED, 20, 700, outl=RED)
    f.el(show(t, ct(3) + 1.2), lambda d, dy: tag(d, 664, y0 + 5 * RH - 8 + dy, 556, 44, "Bis zum letzten Schritt ist alles nur Text", WHITE, DARK, 24, 700, outl=LINE))

# ---------------------------------------------------------------- 6 Fehler und try/except
CODE6 = ["for zeile in zeilen:", "    teile = zeile.strip().split(\";\")", "    try:", "        wert = float(teile[2].replace(\",\", \".\"))", "    except ValueError:", "        fehler = fehler + 1"]
TB = ["Traceback (most recent call last):", "  File \"auswerten.py\", line 7, in <module>", "    wert = float(teile[2])", "ValueError: could not convert string", "to float: 'n/a'"]

def pap_box(d, cx, y, w, h, txt, fill=WHITE, outl=DARK, tc=DARK, size=22):
    d.rectangle((cx - w // 2, y, cx + w // 2, y + h), fill=fill, outline=outl, width=3)
    fit(txt, F(size, 700), w - 14, "PAP"); T2(d, cx, y + h / 2, txt, F(size, 700), tc, "mm")

def sc6(f, t, ct):
    heading(f, t, "Fehler abfangen: try und except")
    # links PAP
    cx = 290
    def pap(d, dy):
        card(d, 60, 120 + dy, 480, 560)
        pap_box(d, cx, 150 + dy, 280, 46, "für jede Zeile")
        arrow(d, cx, 196 + dy, cx, 232 + dy, DARK, 3, 10)
        hot = ap(t, ct(2) + 0.5, 0.4)
        # Raute
        d.polygon([(cx, 234 + dy), (cx + 130, 290 + dy), (cx, 346 + dy), (cx - 130, 290 + dy)], fill=mix(WHITE, LIGHTA, hot), outline=DARK)
        d.line([(cx, 234 + dy), (cx + 130, 290 + dy), (cx, 346 + dy), (cx - 130, 290 + dy), (cx, 234 + dy)], fill=DARK, width=3)
        T2(d, cx, 290 + dy, "Umwandlung", F(20, 700), DARK, "mm") if False else None
        T2(d, cx, 282 + dy, "Umwandlung", F(20, 700), DARK, "mm"); T2(d, cx, 304 + dy, "gelingt?", F(20, 700), DARK, "mm")
        # Zweige
        arrow(d, cx - 130, 290 + dy, 170, 290 + dy, DARK, 3, 10) if False else None
        d.line((cx - 130, 290 + dy, 170, 290 + dy), fill=DARK, width=3); arrow(d, 170, 290 + dy, 170, 380 + dy, GREEN, 3, 10)
        d.line((cx + 130, 290 + dy, 410, 290 + dy), fill=DARK, width=3); arrow(d, 410, 290 + dy, 410, 380 + dy, RED, 3, 10)
        T2(d, 150, 270 + dy, "ja", F(22, 700), GREEN, "mm"); T2(d, 430, 270 + dy, "nein", F(22, 700), RED, "mm")
        pap_box(d, 170, 382 + dy, 190, 54, "Wert merken", WHITE, GREEN)
        pap_box(d, 410, 382 + dy, 190, 54, "Zähler + 1", mix(WHITE, LIGHTR, hot), RED, DARK)
        d.line((170, 436 + dy, 170, 476 + dy), fill=DARK, width=3); d.line((410, 436 + dy, 410, 476 + dy), fill=DARK, width=3)
        d.line((170, 476 + dy, 410, 476 + dy), fill=DARK, width=3)
        arrow(d, cx, 476 + dy, cx, 520 + dy, DARK, 3, 10)
        T2(d, cx, 548 + dy, "zurück vor die Schleife", F(22, 600), GREY, "mm")
    f.el(show(t, ct(0) + 0.3), pap, dy=int((1 - show(t, ct(0) + 0.3)) * 10))
    # Ausnahme -> Abbruch
    f.el(show(t, ct(0) + 2.6, ct(1) - 0.2), lambda d, dy: tag(d, 590, 140 + dy, 630, 52, "Ausnahme: das Programm bricht ab", RED, WHITE, 28))
    # Traceback
    def tb(d, dy):
        card(d, 590, 130 + dy, 630, 224, fill=WHITE)
        d.rounded_rectangle((606, 144 + dy, 1204, 340 + dy), 10, fill=BOX2)
        T2(d, 622, 156 + dy, "Traceback", F(20, 600), CODE_C, "la")
        colr = [CODE_C, CODE_T, CODE_T, CODE_R, CODE_R]
        for k, ln in enumerate(TB):
            fit(ln, M(20), 560, "Traceback"); T2(d, 622, 188 + 28 * k + dy, ln, M(20, k >= 3), colr[k], "la")
        # nummern von unten nach oben
        for n, (yy, tin) in enumerate([(188 + 28 * 3 + 12, ct(1) + 1.8), (188 + 28 * 2 + 12, ct(1) + 3.2), (188 + 28 * 1 + 12, ct(1) + 4.0)], 1):
            a = ap(t, tin, 0.3)
            if a > 0.5:
                d.ellipse((1160, yy - 14 + dy, 1190, yy + 16 + dy), fill=RED); T2(d, 1175, yy + 1 + dy, str(n), F(22, 700), WHITE, "mm")
        if t > ct(1) + 1.8:
            d.rounded_rectangle((612, 184 + 28 * 3 + dy, 1148, 186 + 28 * 5 + dy), 6, outline=RED, width=3)
    f.el(show(t, ct(1) - 0.2), tb, dy=int((1 - show(t, ct(1) - 0.2)) * 10))
    f.el(show(t, ct(1) + 1.8, ct(2)), lambda d, dy: tag(d, 590, 396 + dy, 630, 44, "zuerst: letzte Zeile = Fehlerart", WHITE, RED, 24, 700, outl=RED))
    f.el(show(t, ct(1) + 4.0, ct(2)), lambda d, dy: tag(d, 590, 450 + dy, 630, 44, "dann nach oben: wo im Programm?", WHITE, DARK, 24, 700, outl=LINE))
    # Code
    hlset = lambda: ({4, 5} if t >= ct(2) + 5.5 else ({2, 3} if t >= ct(2) + 0.3 else {2, 3, 4, 5}))
    times = [ct(2) + 0.0 + 0.3 * i for i in range(6)]
    def code(d, dy):
        hl = hlset()
        code_panel(d, 590, 130 + dy if False else 390 + dy if t >= ct(2) else 390 + dy, 630, CODE6, times, t, 20, 60, hl=hl if t >= ct(2) + 0.3 else None, dim_others=True, lineno=False, title="Python", lh=30)
    f.el(show(t, ct(2) + 0.2), code, dy=int((1 - show(t, ct(2) + 0.2)) * 10))
    f.el(show(t, ct(2) + 5.6, ct(3) + 0.1), lambda d, dy: tag(d, 590, 646 + dy, 630, 40, "Sprung in den except-Block, du zählst mit", RED, WHITE, 22))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 590, 646 + dy, 630, 40, "Nur ValueError fangen und Übersprungenes melden", WHITE, RED, 22, 700, outl=RED))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V09 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Dateien & Fehler", F(88, 700), DARK)
        T2(d, 90, 290, "Eine CSV-Datei lesen, ohne abzustürzen", F(48, 400), GREY)
        d.rounded_rectangle((90, 420, 1000, 520), 14, fill=BOX)
        T2(d, 120, 470, "0,02;-1,86;0,08;n/a", M(40, True), CODE_T, "lm")
        d.rounded_rectangle((560, 436, 676, 504), 8, outline=RED, width=4)
        T2(d, 90, 580, "ValueError", M(44, True), RED, "lm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
