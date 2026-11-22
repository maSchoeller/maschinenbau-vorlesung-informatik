"""V21 Theorie: Projektwerkstatt, Fertig ist, was frisch laeuft.
Aufruf: python render.py [text|fake|tts|zeiten|scan|stills t1 t2..|full|mux]
Trockenlauf ohne Audio im Repo: V21_VDIR=<Ordner unter %TEMP%> python render.py fake  (Stille-Platzhalter), dann stills/scan."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v11-common"))
from h11 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL, code_c, fake_audio
from texte import SRC

NAME = "v21-theorie"; LABEL = "DHBW · Informatik · V21 · Projektwerkstatt"
VD = os.environ.get("V21_VDIR") or HERE          # Audio-/Ausgabeordner (Trockenlauf: ausserhalb des Repos)
SECS = make_secs(SRC)
LIGHTG = (230, 247, 238); LIGHTR = (255, 226, 230); LIGHTB = (219, 232, 252); LIGHTA = (255, 240, 214)
BLUE = (37, 99, 235); AMB = (176, 110, 0)
LEIT = "Fertig ist, was frisch läuft"
ABS = r"C:\Users\...\messung.csv"

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

def chip(d, x, y, w, h, txt, fill, col, size=26, outl=None, mono=False):
    fo = M(size, True) if mono else F(size, 700)
    fit(txt, fo, w - 12, "Chip")
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, fo, col, "mm")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def folder(d, x, y, w, h, fill=LIGHTA, outl=AMB, wd=3, dash=False):
    d.rounded_rectangle((x, y, x + w * 0.42, y + 16), 5, fill=fill, outline=outl, width=wd)
    if not dash:
        d.rounded_rectangle((x, y + 10, x + w, y + h), 10, fill=fill, outline=outl, width=wd)
    else:
        xx = x
        while xx < x + w:
            d.line((xx, y + 10, min(xx + 12, x + w), y + 10), fill=outl, width=wd); d.line((xx, y + h, min(xx + 12, x + w), y + h), fill=outl, width=wd); xx += 22
        yy = y + 10
        while yy < y + h:
            d.line((x, yy, x, min(yy + 12, y + h)), fill=outl, width=wd); d.line((x + w, yy, x + w, min(yy + 12, y + h)), fill=outl, width=wd); yy += 22

def screen(d, x, y, w, h, fill=BOX2, base=True):
    d.rounded_rectangle((x - 10, y - 10, x + w + 10, y + h + 10), 16, fill=(70, 78, 90))
    d.rectangle((x, y, x + w, y + h), fill=fill)
    if base:
        d.polygon([(x - 40, y + h + 10), (x + w + 40, y + h + 10), (x + w + 20, y + h + 30), (x - 20, y + h + 30)], fill=(150, 158, 170), outline=(70, 78, 90))

def person(d, cx, y, col=BLUE, dy=0):
    d.ellipse((cx - 22, y + dy, cx + 22, y + 44 + dy), fill=(255, 224, 189), outline=DARK, width=3)
    d.rounded_rectangle((cx - 34, y + 52 + dy, cx + 34, y + 118 + dy), 16, fill=col, outline=DARK, width=3)

# ---------------------------------------------------------------- 1 Hook: es laeuft nur bei dir
def sc1(f, t, ct):
    heading(f, t, "Es läuft nur auf deinem Rechner")
    def lap(d, dy):
        screen(d, 100, 130 + dy, 380, 220)
        folder(d, 130, 180 + dy, 110, 80, fill=LIGHTA, outl=AMB)
        T2(d, 185, 280 + dy, "messung.csv", M(20), CODE_T, "ma")
        T2(d, 270, 190 + dy, "werkzeug.py", M(20), CODE_T, "la"); T2(d, 270, 224 + dy, "läuft ...", M(20), CODE_G, "la")
        T2(d, 290, 400 + dy, "Dein Laptop", F(26, 700), GREY, "mm")
    f.el(show(t, 0.3), lap, dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 0.4), lambda d, dy: (d.ellipse((410, 296 + dy, 470, 356 + dy), fill=GREEN, outline=WHITE, width=4), tick(d, 440, 326 + dy, 38, WHITE, 6)), dy=dyf(t, ct(0) + 0.4))
    f.el(show(t, ct(0) + 1.2), lambda d, dy: (screen(d, 800, 130 + dy, 380, 220), T2(d, 990, 400 + dy, "Beamer-Rechner", F(26, 700), GREY, "mm")), dy=dyf(t, ct(0) + 1.2))
    f.el(show(t, ct(0) + 2.4), lambda d, dy: (T2(d, 822, 170 + dy, "FileNotFoundError", M(24, True), CODE_R, "la"),
                                              T2(d, 822, 210 + dy, "Datei nicht gefunden", M(20), CODE_R, "la")), dy=dyf(t, ct(0) + 2.4))
    def path(d, dy):
        T2(d, 160, 446 + dy, "Pfad im Programm", F(22, 700), GREY, "la")
        monobox(d, 160, 474 + dy, 960, 64, ABS, 34, CODE_T)
    f.el(show(t, ct(1) + 0.3), path, dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(1) + 4.0), lambda d, dy: d.line((176, 506 + dy, 176 + M(34).getlength(ABS), 506 + dy), fill=RED, width=5))
    # ct2: Ordner nur links
    def nof(d, dy):
        folder(d, 880, 262 + dy, 90, 64, fill=BOX2, outl=RED, wd=3, dash=True)
        cross(d, 925, 298 + dy, 50, RED, 6)
    f.el(show(t, ct(2) + 0.4), nof)
    f.el(show(t, ct(2) + 1.2), lambda d, dy: tag(d, 400, 560 + dy, 480, 44, "Diesen Ordner gibt es hier nicht", LIGHTR, RED, 24, outl=RED), dy=dyf(t, ct(2) + 1.2))
    f.el(show(t, ct(3) + 0.4), lambda d, dy: tag(d, 300, 622 + dy, 680, 62, LEIT, RED, WHITE, 40), dy=dyf(t, ct(3) + 0.4))

# ---------------------------------------------------------------- 2 Frischer Start
def sc2(f, t, ct):
    heading(f, t, "Test 1: der frische Start")
    c0 = ct(0)
    def card0(d, dy):
        card(d, 60, 124 + dy, 400, 380)
        folder(d, 90, 150 + dy, 120, 78, fill=LIGHTA, outl=AMB)
        T2(d, 226, 190 + dy, "neuer Ordner", F(26, 700), DARK, "lm")
        if t < c0 + 2.0: T2(d, 90, 252 + dy, "leer", F(22, 400), GREY, "la")
    f.el(show(t, 0.3), card0, dy=dyf(t, 0.3))
    for k, (nm, col, fl) in enumerate((("werkzeug.py", BLUE, LIGHTB), ("messung.csv", GREEN, LIGHTG), ("README.md", AMB, LIGHTA), ("Pakete: notiert", GREY, WHITE))):
        tin = c0 + 2.0 + 0.9 * k
        f.el(show(t, tin), lambda d, dy, nm=nm, col=col, fl=fl, k=k: chip(d, 90, 268 + k * 56 + dy, 340, 46, nm, fl, col, 26), dy=dyf(t, tin))
    # ct1: absolut vs relativ
    def pa(d, dy):
        card(d, 500, 124 + dy, 720, 150)
        T2(d, 530, 140 + dy, "Pfad in open( ... )", F(24, 700), GREY, "la")
        chip(d, 530, 176 + dy, 600, 44, ABS, LIGHTR, RED, 26, outl=RED, mono=True)
        if t > ct(1) + 1.8:
            d.line((540, 198 + dy, 540 + M(26, True).getlength(ABS) + 14, 198 + dy), fill=RED, width=4)
            cross(d, 1170, 198 + dy, 36, RED, 6)
        chip(d, 530, 230 + dy, 330, 36, "messung.csv", LIGHTG, GREEN, 24, outl=GREEN, mono=True)
        d.ellipse((880, 230 + dy, 916, 266 + dy), fill=GREEN); tick(d, 898, 248 + dy, 22, WHITE, 4)
        T2(d, 930, 248 + dy, "relativ", F(24, 700), GREEN, "lm")
    f.el(show(t, ct(1) + 0.3), pa, dy=dyf(t, ct(1) + 0.3))
    # ct2: von oben starten
    cl = ["import csv", 'datei = "messung.csv"', "daten = lesen(datei)"]
    code_box(f, t, cl, 500, 300, 720, 22, 32, times=[ct(2) + 0.3 + 0.5 * k for k in range(3)], alpha_t=ct(2) + 0.1, dim=False)
    def st(d, dy):
        d.polygon([(470, 372 + dy - 14), (470, 372 + dy + 14), (494, 372 + dy)], fill=GREEN)
        tag(d, 900, 366 + dy, 300, 36, "Start: von oben", LIGHTG, GREEN, 22, outl=GREEN)
    f.el(show(t, ct(2) + 1.8), st, dy=dyf(t, ct(2) + 1.8))
    f.el(show(t, ct(2) + 3.8), lambda d, dy: tag(d, 500, 470 + dy, 720, 38, "keine Werte aus einem alten Lauf", LIGHTA, AMB, 22, outl=AMBER), dy=dyf(t, ct(2) + 3.8))
    # ct3: Pakete
    def zettel(d, dy):
        card(d, 500, 530 + dy, 720, 140, fill=(255, 250, 225))
        T2(d, 530, 544 + dy, "Zettel: diese Pakete brauche ich", F(24, 700), DARK, "la")
        for k, nm in enumerate(("numpy", "pandas", "matplotlib")):
            a = ap(t, ct(3) + 1.0 + 0.8 * k, 0.4)
            if a > 0:
                x = 530 + k * 220
                d.ellipse((x, 592 + dy, x + 30, 622 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 15, 607 + dy, 17, WHITE, 3)
                T2(d, x + 40, 607 + dy, nm, M(24, True), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.3), zettel, dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 3 Regressionstest
RT_HEAD = ["Nr.", "Testfall (von Hand gerechnet)", "erwartet", "Programm"]
RT_ROWS = [["1", "25 H7/g6", "Spielpassung"], ["2", "25 H7/r6", "Übermaßpassung"],
           ["3", "25 H7/k6", "Übergangspassung"], ["4", "25 H7/h6   (Grenzfall)", "Spielpassung"]]

def sc3(f, t, ct):
    heading(f, t, "Regressionstest: alle Tests, jedes Mal")
    broken = ct(2) + 3.0; fixed = ct(3) + 3.6
    def status(i):
        if i < 3 or t < broken or t >= fixed: return "ok", GREEN
        return "FEHLER", RED
    rt = [ct(0) + 0.5 + 0.7 * k for k in range(4)]
    def tb(d, dy):
        rows = [r + [status(i)[0]] for i, r in enumerate(RT_ROWS)]
        colors = {(i, 3): status(i)[1] for i in range(4)}
        if t >= ct(1) + 0.5: colors[(3, 1)] = RED
        grid(d, 60, 124 + dy, [100, 560, 320, 180], RT_HEAD, rows, t, rt, size=26, rh=56, new_hl=False, colors=colors)
    f.el(show(t, 0.3), tb, dy=dyf(t, 0.3))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: tag(d, 60, 430 + dy, 560, 40, "aus Vorlesung 11 und 12, von Hand", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(1) + 0.5), lambda d, dy: tag(d, 700, 430 + dy, 520, 40, "Grenzfall: Spiel gleich null", LIGHTR, RED, 24, outl=RED), dy=dyf(t, ct(1) + 0.5))
    def chg(d, dy):
        card(d, 60, 500 + dy, 520, 70, fill=LIGHTA)
        T2(d, 90, 535 + dy, "kleine Verschönerung: Rundung geändert", F(24, 700), AMB, "lm")
        arrow(d, 590, 535 + dy, 650, 535 + dy, GREY, 4, 12)
    f.el(show(t, ct(2) + 0.4), chg, dy=dyf(t, ct(2) + 0.4))
    f.el(show(t, broken), lambda d, dy: tag(d, 660, 508 + dy, 560, 54, "Test 4 kippt: Grenzfall rot", RED, WHITE, 28), dy=dyf(t, broken))
    def back(d, dy):
        ok = t >= fixed; col = GREEN if ok else GREY
        d.line((590, 626 + dy, 40, 626 + dy), fill=col, width=4); d.line((40, 626 + dy, 40, 150 + dy), fill=col, width=4); arrow(d, 40, 150 + dy, 58, 150 + dy, col, 4, 12)
        tag(d, 590, 604 + dy, 630, 44, "Alle Tests erneut: 4 von 4 grün" if ok else "Alle Tests erneut", LIGHTG if ok else WHITE, GREEN if ok else GREY, 26, outl=col)
    f.el(show(t, ct(3) + 0.4), back, dy=dyf(t, ct(3) + 0.4))

# ---------------------------------------------------------------- 4 PAP und Code
CODE4 = ['d = float(input("Durchmesser: "))', "while d <= 0:", '    print("Fehler: d muss > 0 sein")', '    d = float(input("Durchmesser: "))',
         "flaeche = 3.14159 * d**2 / 4", "print(flaeche)"]
CODE4_BAD = [CODE4[0], "while d < 0:"] + CODE4[2:]

def build_pap4():
    D = Dia(19); N = D.node
    N("s", "term", "Start", 0, 0); N("e", "io", "d einlesen", 0, 0, minw=190); N("d", "dec", "d ≤ 0 ?", 0, 0, minw=190)
    N("m", "io", "Meldung ausgeben", 0, 0); N("r", "proc", "flaeche berechnen", 0, 0, minw=190); N("a", "io", "flaeche ausgeben", 0, 0, minw=190); N("x", "term", "Ende", 0, 0)
    n = D.nodes; cx = 120; y = 0
    for k in ("s", "e", "d", "r", "a", "x"):
        n[k].cx = cx; n[k].cy = y + n[k].h / 2; y = n[k].cy + n[k].h / 2 + 30
    n["m"].cx = 380; n["m"].cy = n["d"].cy
    E = D.edge
    E("s-e", "s", "b", "e", "t"); E("e-d", "e", "b", "d", "t")
    E("d-m", "d", "r", "m", "l", label="ja"); E("m-e", "m", "t", "e", "r", via=[(n["m"].cx, n["e"].cy)])
    E("d-r", "d", "b", "r", "t", label="nein"); E("r-a", "r", "b", "a", "t"); E("a-x", "a", "b", "x", "t")
    return D
PAP = build_pap4()
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 116, 410, 470); PZOOM = min(1.1, (PBOX[2] - 24) / PW, (PBOX[3] - 24) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)
# Zuordnung Plan-Teil -> Codezeilen
G4 = [(["e", "s-e", "e-d"], [0]), (["d", "d-m", "m", "m-e"], [1, 2, 3]), (["d-r", "r"], [4]), (["r-a", "a", "a-x", "x"], [5])]
ALLK = ["s", "s-e", "e", "e-d", "d", "d-m", "m", "m-e", "d-r", "r", "r-a", "a", "a-x", "x"]

def sc4(f, t, ct):
    heading(f, t, "Plan und Code müssen passen")
    c2 = ct(2); starts = [c2 + 0.3, c2 + 2.0, c2 + 7.2, c2 + 8.8]   # Richtwerte, nach der Vertonung an die Satzzeiten anpassen
    full = {k: 0.8 + 0.12 * i for i, k in enumerate(ALLK)}
    cur = max([g for g in range(4) if t >= starts[g]] or [-1])
    hl = {k: PAL[g] for g in range(cur + 1) for k in G4[g][0]}
    bad = t >= ct(3) + 2.0
    if bad: hl["d"] = RED; hl["d-m"] = RED
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, full), zoom=PZOOM, hl=hl)
    code = CODE4_BAD if bad else CODE4
    cols = {ln: PAL[g] for g in range(cur + 1) for ln in G4[g][1]}; act = set(cols) if cols else None
    if bad: cols[1] = RED
    f.el(show(t, 0.5), lambda d, dy: code_c(d, 520, 124 + dy, 700, code, [0.9 + 0.35 * i for i in range(6)], t, size=22, cols=cols, active=act, title="Python", off=58), dy=dyf(t, 0.5))
    # ct1: drei Pruefpunkte
    if t < c2 + 6:
        for k, nm in enumerate(("Reihenfolge der Schritte", "jede Verzweigung", "Eingabe-Prüfschleife")):
            tin = ct(1) + 0.4 + 1.6 * k
            f.el(show(t, tin, c2 + 5.5), lambda d, dy, k=k, nm=nm: (d.ellipse((520, 442 + k * 52 + dy, 556, 478 + k * 52 + dy), fill=GREEN), tick(d, 538, 460 + k * 52 + dy, 22, WHITE, 4),
                                                                   T2(d, 572, 460 + k * 52 + dy, nm, F(28, 700), DARK, "lm")), dy=dyf(t, tin))
    # ct3: Abweichung
    f.el(show(t, ct(3) + 2.2), lambda d, dy: (d.line((450, 195 + dy, 490, 235 + dy), fill=RED, width=7), d.line((450, 235 + dy, 490, 195 + dy), fill=RED, width=7)))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 60, 600 + dy, 410, 54, "Code ändern = Plan mit ändern", LIGHTA, AMB, 24, outl=AMBER), dy=dyf(t, ct(3) + 0.3))
    f.el(show(t, ct(3) + 3.0), lambda d, dy: tag(d, 520, 600 + dy, 700, 54, "Stimmen beide nicht mehr überein: Plan wertlos", RED, WHITE, 26), dy=dyf(t, ct(3) + 3.0))

# ---------------------------------------------------------------- 5 README und KI-Protokoll
def doc(d, dy, x, w, title, col):
    card(d, x, 124 + dy, w, 430)
    d.rectangle((x + 8, 126 + dy, x + w - 2, 170 + dy), fill=mix(WHITE, col, 0.16))
    T2(d, x + 30, 148 + dy, title, F(30, 700), col, "lm")

def sc5(f, t, ct):
    heading(f, t, "README und KI-Protokoll")
    f.el(show(t, 0.3), lambda d, dy: doc(d, dy, 60, 560, "README", BLUE), dy=dyf(t, 0.3))
    items = [("Zweck", ct(0) + 0.6), ("Bedienung", ct(0) + 2.6), ("Eingaben und Ausgaben mit Einheiten", ct(0) + 4.2), ("Grenzen des Modells", ct(1) + 0.4)]
    for k, (nm, tin) in enumerate(items):
        def row(d, dy, k=k, nm=nm):
            y = 196 + k * 54; hot = (k == 3 and t >= ct(1) + 0.4)
            d.rounded_rectangle((84, y + dy, 596, y + 44 + dy), 10, fill=LIGHTA if hot else LIGHTB, outline=AMBER if hot else BLUE, width=2)
            fit(nm, F(24, 700), 480, "README"); T2(d, 104, y + 22 + dy, nm, F(24, 700), DARK, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))
    f.el(show(t, ct(1) + 1.6), lambda d, dy: (T2(d, 84, 430 + dy, "Beispiel für eine Grenze:", F(22, 400), GREY, "la"), tag(d, 84, 466 + dy, 512, 44, "gerechnet nur im elastischen Bereich", LIGHTA, AMB, 22, outl=AMBER)), dy=dyf(t, ct(1) + 1.6))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: doc(d, dy, 660, 560, "KI-Protokoll", GREEN), dy=dyf(t, ct(2) + 0.2))
    rows = [("Frage", "Schreib mir eine Flächenfunktion", ct(2) + 1.0, LIGHTB, BLUE), ("Antwort", "Funktion mit d ** 3", ct(2) + 2.6, LIGHTG, GREEN), ("Fehler", "Exponent falsch: es muss 2 sein", ct(2) + 4.6, LIGHTR, RED)]
    for k, (lab, txt, tin, fl, col) in enumerate(rows):
        def row(d, dy, k=k, lab=lab, txt=txt, fl=fl, col=col):
            y = 196 + k * 80
            d.rounded_rectangle((684, y + dy, 1196, y + 68 + dy), 10, fill=fl, outline=col, width=2)
            T2(d, 704, y + 16 + dy, lab, F(22, 700), col, "la"); fit(txt, F(24, 600), 470, "Protokoll"); T2(d, 704, y + 50 + dy, txt, F(24, 600), DARK, "lm")
        f.el(show(t, tin), row, dy=dyf(t, tin))
    f.el(show(t, ct(2) + 6.0), lambda d, dy: tag(d, 684, 450 + dy, 512, 40, "mindestens ein gefundener Fehler", LIGHTR, RED, 22, outl=RED), dy=dyf(t, ct(2) + 6.0))
    def verant(d, dy):
        card(d, 60, 580 + dy, 1160, 84, fill=LIGHTA)
        T2(d, 90, 622 + dy, "Die KI verantwortet nichts. Du verantwortest das Ergebnis.", F(32, 700), DARK, "lm")
    f.el(show(t, ct(3) + 0.3), verant, dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 6 Praesentation
STATIONS = ["Problem", "PAP", "Live-Demo", "Handrechnung", "KI-Fehler"]

def sc6(f, t, ct):
    heading(f, t, "Die Präsentation: fünf Minuten")
    def clock(d, dy):
        cx, cy, r = 150, 250 + dy, 80
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE, outline=DARK, width=5)
        frac = ap(t, 0.5, 14.0)
        if frac > 0.01: d.pieslice((cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10), -90, -90 + 360 * frac, fill=LIGHTR, outline=RED, width=2)
        for k in range(12):
            a = k * math.pi / 6; d.line((cx + (r - 14) * math.sin(a), cy - (r - 14) * math.cos(a), cx + (r - 4) * math.sin(a), cy - (r - 4) * math.cos(a)), fill=DARK, width=3)
        T2(d, cx, cy, "5 min", F(32, 700), DARK, "mm")
    f.el(show(t, 0.3), clock, dy=dyf(t, 0.3))
    xs = [380, 570, 760, 950, 1130]
    f.el(show(t, 0.5), lambda d, dy: d.line((300, 250 + dy, 1190, 250 + dy), fill=GREY, width=5))
    tins = [ct(0) + 1.2, ct(0) + 3.2, ct(0) + 5.8, ct(1) + 0.4, ct(1) + 2.4]
    for k, nm in enumerate(STATIONS):
        def stn(d, dy, k=k, nm=nm):
            d.ellipse((xs[k] - 26, 224 + dy, xs[k] + 26, 276 + dy), fill=RED, outline=WHITE, width=4)
            T2(d, xs[k], 250 + dy, str(k + 1), F(28, 700), WHITE, "mm")
            chip(d, xs[k] - 88, 292 + dy, 176, 46, nm, WHITE, DARK, 24, outl=LINE)
        f.el(show(t, tins[k]), stn, dy=dyf(t, tins[k]))
    f.el(show(t, ct(2) + 0.4), lambda d, dy: tag(d, 640, 364 + dy, 270, 40, "Fehleingabe: Schleife greift", LIGHTR, RED, 20, outl=RED), dy=dyf(t, ct(2) + 0.4))
    f.el(show(t, ct(2) + 2.8), lambda d, dy: tag(d, 930, 364 + dy, 250, 40, "Ergebnis stimmt", LIGHTG, GREEN, 22, outl=GREEN), dy=dyf(t, ct(2) + 2.8))
    def duo(d, dy):
        person(d, 130, 430 + dy, BLUE); person(d, 230, 430 + dy, AMB)
        T2(d, 130, 556 + dy, "Person A", F(22, 700), BLUE, "ma"); T2(d, 230, 556 + dy, "Person B", F(22, 700), AMB, "ma")
        d.rounded_rectangle((xs[0] - 88, 444 + dy, xs[2] + 88, 480 + dy), 10, fill=mix(WHITE, BLUE, 0.2), outline=BLUE, width=2)
        d.rounded_rectangle((xs[3] - 88, 444 + dy, xs[4] + 88, 480 + dy), 10, fill=mix(WHITE, AMB, 0.2), outline=AMB, width=2)
        T2(d, (xs[0] + xs[2]) / 2, 462 + dy, "spricht", F(22, 700), BLUE, "mm"); T2(d, (xs[3] + xs[4]) / 2, 462 + dy, "spricht", F(22, 700), AMB, "mm")
    f.el(show(t, ct(3) + 0.4), duo, dy=dyf(t, ct(3) + 0.4))
    f.el(show(t, ct(3) + 2.6), lambda d, dy: tag(d, 300, 600 + dy, 680, 62, LEIT, RED, WHITE, 40), dy=dyf(t, ct(3) + 2.6))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V21 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Projektwerkstatt", F(84, 700), DARK)
        T2(d, 90, 290, LEIT, F(52, 600), GREY)
        x = 90
        for nm, (fill, col) in (("frischer Start", (LIGHTG, GREEN)), ("Regressionstest", (LIGHTG, GREEN)), ("Plan = Code", (LIGHTB, BLUE)), ("README + KI-Protokoll", (LIGHTA, AMB))):
            wd = int(F(30, 700).getlength(nm)) + 44; chip(d, x, 440, wd, 72, nm, fill, col, 30); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "fake": fake_audio(VD, SECS)
    else: dispatch(VD, SRC, SECS, SCENES, LABEL, poster, NAME)
