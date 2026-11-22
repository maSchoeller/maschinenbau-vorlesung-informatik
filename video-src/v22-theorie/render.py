"""V22 Theorie: Code erklaeren (Walkthrough-Methode) und Klausurstrategie.
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]
Ohne Audio (Trockenlauf): python render.py probe  (Poster, Standbilder je Szene, Scan aller 0,5 s; Ausgabe nach out/, nicht im Repo).
tts/full erst nach Freigabe der ElevenLabs-Credits (strikt nacheinander ueber sprechen.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v18-common"))
from h18 import *
from texte import SRC

NAME = "v22-theorie"; LABEL = "DHBW · Informatik · V22 · Code-Walkthroughs und Klausurtraining"
SECS = make_secs(SRC)
LEIT = "KI schreibt Code. Ingenieure prüfen und verantworten."

# Beispiel-Code (Auszug aus briefing/v22-beispiel.py), Zeilen 18 bis 23
ROOT = os.path.join(HERE, "..", "..")
CODE = open(os.path.join(ROOT, "briefing", "v22-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert CODE[6].startswith("def bewerte") and CODE[19].startswith("for d in messwerte") and CODE[17].startswith("messwerte"), "briefing/v22-beispiel.py hat sich geaendert"
MESS = [20.01, 20.03, 19.97, 20.00, 20.02]

def bewerte(d, nenn=20.0, tol=0.02):
    a = d - nenn
    return "gut" if abs(a) <= tol else ("nacharbeit" if a > 0 else "ausschuss")
ROWS = []; Z = {"gut": 0, "nacharbeit": 0, "ausschuss": 0}
for k, d in enumerate(MESS, 1):
    e = bewerte(d); Z[e] += 1
    ROWS.append([str(k), f"{d:.2f}", e, str(Z["gut"]), str(Z["nacharbeit"]), str(Z["ausschuss"])])
assert ROWS[-1][3:] == ["3", "1", "1"]
assert 25.1 - 25.0 > 0.1 and repr(25.1 - 25.0) == "0.10000000000000142" and bewerte(25.1, 25.0, 0.1) == "nacharbeit"
ECOL = {"gut": GREEN, "nacharbeit": AMB, "ausschuss": RED}

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Erklär mir deinen Code")
    cards = [("Präsentation", "„Was macht diese Zeile?“", ct(0) + 0.3), ("Code-Review", "„Warum so, und nicht anders?“", ct(0) + 2.6), ("Klausur", "„Was gibt das Programm aus?“", ct(0) + 4.6)]
    for k, (ti, q, tin) in enumerate(cards):
        def fn(d, dy, k=k, ti=ti, q=q):
            x = 60 + k * 390; card(d, x, 130 + dy, 370, 250)
            T2(d, x + 28, 150 + dy, ti, F(34, 700), DARK, "la")
            for j, w in enumerate((200, 260, 150)):
                d.rounded_rectangle((x + 28 + (24 if j == 2 else 0), 214 + j * 30 + dy, x + 28 + (24 if j == 2 else 0) + w, 230 + j * 30 + dy), 6, fill=(60, 72, 88) if j != 1 else RED)
            chip(d, x + 22, 318 + dy, 326, 46, q, LIGHTK, DARK, 22)
        f.el(show(t, tin), fn, dy=dyf(t, tin))
    f.el(show(t, ct(1) + 0.2), lambda d, dy: tag(d, 60, 420 + dy, 820, 56, "Wer Code nicht erklären kann, kann ihn nicht verantworten", LIGHTR, RED, 28, outl=RED), dy=dyf(t, ct(1) + 0.2))
    f.el(show(t, ct(1) + 3.2), lambda d, dy: T2(d, 60, 500 + dy, "Das gilt auch für Code von Copilot.", F(30, 600), GREY, "la"), dy=dyf(t, ct(1) + 3.2))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 560 + dy, 900, 64, LEIT, RED, WHITE, 36), dy=dyf(t, ct(2) + 0.3))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: T2(d, 60, 646 + dy, "Erklären ist Handwerk: fünf feste Schritte", F(30, 700), DARK, "la"), dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 2 Fuenf Schritte
STEPS = [("Zweck in einem Satz", "Was löst der Code, und für wen?"), ("Eingaben und Ausgaben", "mit Einheiten und Datentyp"),
         ("Ablauf mit Variablentabelle", "Zeile für Zeile, so wie der Rechner"), ("Grenzfälle und Testfälle", "auf der Grenze, bei null, leere Liste"),
         ("Was würdest du verbessern?", "Namen, Prüfungen, feste Zahlen")]
def sc2(f, t, ct):
    heading(f, t, "Die Methode in fünf Schritten")
    tins = [ct(0) + 0.3, ct(1) + 0.3, ct(2) + 0.3, ct(3) + 0.3, ct(3) + 3.2]
    cols = [(37, 99, 235), (22, 163, 74), (217, 119, 6), (190, 24, 93), (109, 40, 217)]
    for k, (ti, sub) in enumerate(STEPS):
        def fn(d, dy, k=k, ti=ti, sub=sub):
            y = 116 + k * 112; card(d, 60, y + dy, 1160, 96, stripe=False)
            d.ellipse((84, y + 20 + dy, 140, y + 76 + dy), fill=cols[k]); T2(d, 112, y + 48 + dy, str(k + 1), F(34, 700), WHITE, "mm")
            T2(d, 170, y + 22 + dy, ti, F(34, 700), DARK, "la"); T2(d, 170, y + 62 + dy, sub, F(24, 400), GREY, "la")
        f.el(show(t, tins[k]), fn, dy=dyf(t, tins[k]))

# ---------------------------------------------------------------- 3 Variablentabelle
def sc3(f, t, ct):
    heading(f, t, "Schritt 3: die Variablentabelle")
    f.el(show(t, ct(0) + 0.3), lambda d, dy: tag(d, 60, 116 + dy, 500, 44, "Nennmaß 20 mm, Toleranz ± 0,02 mm", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(0) + 0.3))
    lines = CODE[17:23]
    times = [ct(0) + 1.0 + 0.5 * k for k in range(6)]
    hl = hl_at(t, [(0, None), (ct(2), {2, 3, 4}), (ct(3), {2, 3, 4, 5})])
    f.el(ap(t, ct(0) + 0.8, 0.3), lambda d, dy: code_n(d, 60, 176 + dy, 620, lines, nums(18, 23), times, t, 18, 30, hl, title="Python (Hauptprogramm)"))
    for k, (nm, col, fill) in enumerate((("gut", GREEN, LIGHTG), ("nacharbeit", AMB, LIGHTA), ("ausschuss", RED, LIGHTR))):
        tin = ct(0) + 3.0 + 0.7 * k
        f.el(show(t, tin), lambda d, dy, k=k, nm=nm, col=col, fill=fill: chip(d, 60 + k * 200, 436 + dy, 190, 44, nm, fill, col, 24, outl=col), dy=dyf(t, tin))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: T2(d, 60, 500 + dy, "eine Spalte je Variable, eine Zeile je Durchlauf", F(26, 600), GREY, "la"), dy=dyf(t, ct(1) + 0.3))
    rt = [ct(2) + 0.3, ct(2) + 3.6, ct(3) + 0.3, ct(3) + 2.4, ct(3) + 3.4]
    colors = {(i, 2): ECOL[ROWS[i][2]] for i in range(5)}
    f.el(show(t, ct(1) + 0.6), lambda d, dy: grid(d, 700, 116 + dy, [56, 84, 140, 80, 80, 80], ["Nr", "d", "ergebnis", "gut", "nach.", "aus."], ROWS, t, rt, size=24, rh=48, colors=colors), dy=dyf(t, ct(1) + 0.6))
    f.el(show(t, ct(3) + 4.2), lambda d, dy: tag(d, 700, 480 + dy, 520, 48, "Zähler am Ende: gut 3, nacharbeit 1, ausschuss 1", LIGHTG, GREEN, 22, outl=GREEN), dy=dyf(t, ct(3) + 4.2))

# ---------------------------------------------------------------- 4 Grenzfall
def sc4(f, t, ct):
    heading(f, t, "Schritt 4: der Grenzfall")
    f.el(show(t, ct(0) + 0.3), lambda d, dy: (chip(d, 60, 116 + dy, 800, 50, "bewerte(25.1, nenn=25.0, tol=0.1)", LIGHTK, DARK, 28, mono=True),
                                              T2(d, 880, 141 + dy, "Grenze gehört dazu: <=", F(24, 600), GREY, "lm")), dy=dyf(t, ct(0) + 0.3))
    def rech(d, dy):
        card(d, 60, 196 + dy, 1160, 120, stripe=False)
        T2(d, 90, 214 + dy, "25.1 - 25.0", M(34, True), DARK, "la")
        T2(d, 410, 214 + dy, "=", M(34, True), GREY, "la")
        T2(d, 470, 214 + dy, "0.10000000000000142", M(34, True), RED, "la")
        a = ap(t, ct(1) + 2.8, 0.4)
        if a > 0: T2(d, 90, 266 + dy, "0.10000000000000142  >  0.1  ist wahr", F(28, 700), mix(WHITE, RED, a), "la")
    f.el(show(t, ct(1) + 0.3), rech, dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: (tag(d, 60, 340 + dy, 440, 56, "erwartet: gut", LIGHTG, GREEN, 30, outl=GREEN),
                                              tag(d, 540, 340 + dy, 680, 56, "Ergebnis: nacharbeit (Binärbruch)", LIGHTR, RED, 30, outl=RED)), dy=dyf(t, ct(2) + 0.3))
    f.el(show(t, ct(2) + 3.2), lambda d, dy: T2(d, 60, 414 + dy, "Grund: Kommazahlen sind Binärbrüche (V03)", F(26, 600), GREY, "la"), dy=dyf(t, ct(2) + 3.2))
    def lsg(d, dy):
        card(d, 60, 480 + dy, 560, 150); T2(d, 88, 494 + dy, "Als Testfall aufschreiben", F(28, 700), BLUE, "la")
        monobox(d, 88, 546 + dy, 504, 52, 'assert bewerte(25.1, 25.0, 0.1) == ...', 22, CODE_T)
        card(d, 660, 480 + dy, 560, 150); T2(d, 688, 494 + dy, "Kommazahlen vergleichen", F(28, 700), GREEN, "la")
        monobox(d, 688, 546 + dy, 504, 52, "math.isclose(a, b)", 26, CODE_T)
    f.el(show(t, ct(3) + 0.3), lsg, dy=dyf(t, ct(3) + 0.3))

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

# ---------------------------------------------------------------- 5 Klausur
def sc5(f, t, ct):
    heading(f, t, "Die Klausur: Zeit nach Punkten")
    def bar(d, dy):
        wa = int(1160 * 35 / 90)
        d.rounded_rectangle((60, 126 + dy, 60 + wa, 196 + dy), 10, fill=LIGHTB, outline=BLUE, width=3)
        d.rounded_rectangle((60 + wa + 6, 126 + dy, 1220, 196 + dy), 10, fill=LIGHTA, outline=AMB, width=3)
        T2(d, 60 + wa / 2, 148 + dy, "Teil A: Theorie", F(28, 700), BLUE, "mm"); T2(d, 60 + wa / 2, 176 + dy, "35 Punkte", F(22, 600), GREY, "mm")
        T2(d, 60 + wa + 6 + (1160 - wa - 6) / 2, 148 + dy, "Teil B: Programmieren", F(28, 700), AMB, "mm"); T2(d, 60 + wa + 6 + (1160 - wa - 6) / 2, 176 + dy, "55 Punkte", F(22, 600), GREY, "mm")
    f.el(show(t, ct(0) + 0.3), bar, dy=dyf(t, ct(0) + 0.3))
    f.el(show(t, ct(0) + 1.2), lambda d, dy: T2(d, 60, 212 + dy, "90 Minuten, 90 Punkte, keine Hilfsmittel", F(26, 600), GREY, "la"), dy=dyf(t, ct(0) + 1.2))
    f.el(show(t, ct(0) + 4.0), lambda d, dy: tag(d, 60, 254 + dy, 760, 44, "Code von Hand schreiben, die Einrückung zählt", LIGHTR, RED, 24, outl=RED), dy=dyf(t, ct(0) + 4.0))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: (chip(d, 60, 322 + dy, 360, 48, "1 Punkt ≈ 1 Minute", LIGHTG, GREEN, 26, outl=GREEN), chip(d, 440, 322 + dy, 360, 48, "10 Minuten Puffer", LIGHTK, DARK, 26)), dy=dyf(t, ct(1) + 0.3))
    cards = [(60, 394, "Sichere Aufgaben zuerst", ct(2) + 0.3, GREEN), (660, 394, "Halbe Aufgabe: Teilpunkte", ct(2) + 3.2, GREEN),
             (60, 500, "Vorher skizzieren", ct(3) + 0.3, BLUE), (660, 500, "Grenzfall von Hand prüfen", ct(3) + 3.0, BLUE)]
    for (x, y, txt, tin, col) in cards:
        def fn(d, dy, x=x, y=y, txt=txt, col=col):
            card(d, x, y + dy, 560, 84, stripe=False)
            d.ellipse((x + 20, y + 22 + dy, x + 60, y + 62 + dy), fill=col); tick(d, x + 40, y + 42 + dy, 24, WHITE, 5)
            T2(d, x + 80, y + 42 + dy, txt, F(30, 700), DARK, "lm")
        f.el(show(t, tin), fn, dy=dyf(t, tin))

# ---------------------------------------------------------------- 6 Punktverluste
FEHLER = [("print statt return", "print(flaeche)", "return flaeche"), ("Typumwandlung fehlt", "d = input()", "d = float(input())"),
          ("Zähler im falschen Block", "in der Schleife: z = 0", "vor der Schleife: z = 0"), ("== bei Kommazahlen", "a == b", "math.isclose(a, b)"),
          ("falsche Einrückung", "print(s)  (links außen)", "    print(s)  (im Block)")]
def sc6(f, t, ct):
    heading(f, t, "Fünf typische Punktverluste")
    tins = [ct(0) + 0.3, ct(1) + 0.3, ct(2) + 0.3, ct(3) + 0.3, ct(3) + 2.8]
    for k, (ti, bad, good) in enumerate(FEHLER):
        def fn(d, dy, k=k, ti=ti, bad=bad, good=good):
            y = 112 + k * 100; card(d, 60, y + dy, 1160, 88, stripe=False)
            d.ellipse((78, y + 24 + dy, 118, y + 64 + dy), fill=RED); T2(d, 98, y + 44 + dy, str(k + 1), F(26, 700), WHITE, "mm")
            fit(ti, F(24, 700), 276, "Fehler"); T2(d, 134, y + 44 + dy, ti, F(24, 700), DARK, "lm")
            monobox(d, 420, y + 16 + dy, 360, 56, bad, 20, CODE_R); monobox(d, 810, y + 16 + dy, 390, 56, good, 20, CODE_G)
            arrow(d, 784, y + 44 + dy, 806, y + 44 + dy, GREY, 3, 9)
        f.el(show(t, tins[k]), fn, dy=dyf(t, tins[k]))
    f.el(show(t, ct(4) + 0.3), lambda d, dy: tag(d, 60, 624 + dy, 1000, 56, "Ein guter Walkthrough nennt Zahlen", RED, WHITE, 34), dy=dyf(t, ct(4) + 0.3))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def nums(a, b): return list(range(a, b + 1))

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V22 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Code erklären", F(92, 700), DARK)
        T2(d, 90, 290, "und die Klausur schaffen", F(52, 600), GREY)
        x = 90
        for nm, (fill, col) in (("5 Schritte", (LIGHTB, BLUE)), ("Variablentabelle", (LIGHTG, GREEN)), ("Grenzfälle", (LIGHTR, RED)), ("Zeitplan", (LIGHTA, AMB))):
            wd = int(F(30, 700).getlength(nm)) + 44; chip(d, x, 440, wd, 72, nm, fill, col, 30); x += wd + 14
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
