"""Termin 09, Video 2: Python-Werkzeugkasten: random und Programme gliedern (Karte 1 import random und random.randint, Karte 2 frage, melde und das Hauptprogramm).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code wie im Labor (Syntaxkarten 1 und 2 des Termins 09); alles nachgerechnet."""
import os, sys, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v09-python"; LABEL = "DHBW · Informatik · Termin 09 · Python-Werkzeugkasten: random und Programme gliedern"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
CODE_K1 = ["import random", "", "zahl = random.randint(1, 100)", "print(zahl)"]
# Zufall: der Lauf bekommt einen festen Wert (random.randint ersetzt), so ist die Ausgabe nachpruefbar
_echt = random.randint
try:
    random.randint = lambda a, b: 42
    OUT_K1 = run(NL.join(CODE_K1))
finally:
    random.randint = _echt
assert OUT_K1 == ["42"], OUT_K1
_ziehungen = {random.randint(1, 100) for _ in range(20000)}
assert min(_ziehungen) == 1 and max(_ziehungen) == 100          # beide Grenzen gehoeren dazu
OHNE = CODE_K1[2:]                                              # ohne import: zahl = ..., print(zahl)
try:
    run(NL.join(OHNE)); raise AssertionError("ohne import muss ein NameError kommen")
except NameError as _e:
    FEHLER = f"NameError: {_e}"
assert FEHLER == "NameError: name 'random' is not defined", FEHLER

CODE_K2 = ["def frage(text):", "    return int(input(text))", "", "def melde(x):", '    print(f"Ergebnis: {x}")', "",
           'a = frage("Erste Zahl: ")', 'b = frage("Zweite Zahl: ")', "melde(a + b)"]
OUT_K2 = run(NL.join(CODE_K2), ["3", "4"]); assert OUT_K2 == ["Erste Zahl: 3", "Zweite Zahl: 4", "Ergebnis: 7"], OUT_K2
assert 3 + 4 == 7


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


def kasten(d, x, y, w, h, nr, titel, code, untertitel, col=RED):
    """Karte des Werkzeugkastens, flach (Zahl, Titel, Beispielcode, Untertitel)."""
    imbild(y, y + h, "Werkzeugkarte")
    card(d, x, y, w, h, stripe=False); d.rounded_rectangle((x, y, x + w, y + 10), 5, fill=col)
    num_circle(d, x + 44, y + 58, 22, nr, col)
    TB(d, x + 80, y + 58, titel, F(32, 700), DARK, w - 100, "lm", "Kartentitel")
    d.rounded_rectangle((x + 20, y + 100, x + w - 20, y + 156), 10, fill=BOX)
    TB(d, x + w / 2, y + 128, code, M(26), CODE_T, w - 64, "mm", "Kartencode")
    TB(d, x + 24, y + 176, untertitel, F(26, 600), GREY, w - 48, "la", "Karten-Untertitel")


# ---------------------------------------------------------------- 1 Zwei Karten
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zwei Karten im Werkzeugkasten")
    karten = [(1, "random: Zufall", "random.randint(1, 100)", "eine Zufallszahl ziehen", a(1, pos(1, 1, "Karte eins"))),
              (2, "Programm in Funktionen", "def frage(text):", "oben Funktionen, unten Hauptprogramm", a(1, pos(1, 1, "Karte zwei")))]
    for k, (nr, titel, code, unter, tin) in enumerate(karten):
        x = 60 + k * 590
        E(f, t, tin, lambda d, dy, x=x, nr=nr, titel=titel, code=code, unter=unter: kasten(d, x, 170 + dy, 570, 230, nr, titel, code, unter))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 470 + dy, 1160, 56, "Alles aus Termin 02 bis 08 gilt weiter", LIGHTK, DARK, 30, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Karte 1: random
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: random")
    x, y, w, size, lh = 60, 116, 560, 28, 48
    tm = [a(0, 0.05), a(0, 0.35), a(1, 0.0), a(2, 0.0)]
    aktiv = aktuell(t, [(a(0, 0.05), {0}), (a(1, 0.0), {2}), (a(2, 0.0), {3}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K1, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 4)
    E(f, t, a(0, 0.15), lambda d, dy: code_markiere(d, g(dy), 0, 0, len(CODE_K1[0]), RED), tout=a(1, 0.0))
    E(f, t, a(1, pos(2, 1, "zieht")), lambda d, dy: code_markiere(d, g(dy), 2, *spalte(CODE_K1[2], "random.randint(1, 100)"), GREEN), tout=a(2, 0.0))
    E(f, t, a(0, 0.15), lambda d, dy: tag(d, 660, 130 + dy, 560, 56, "import: ganz oben", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 660, 210 + dy, 560, 56, "1 bis 100, beide Grenzen gehören dazu", LIGHTG, GREEN, 26, 700, outl=GREEN))
    # Ausgabe: ein Beispiel
    t_o = a(2, 0.0)
    E(f, t, t_o, lambda d, dy: lauf_panel(d, x, 400 + dy, w, [(t_o + 0.2, OUT_K1[0], None, None)], t, size, lh, "Ausgabe (ein Beispiel)"))
    E(f, t, a(2, pos(2, 2, "Bei jedem")), lambda d, dy: tag(d, 660, 290 + dy, 560, 56, "bei jedem Lauf eine andere Zahl", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(1, pos(2, 1, "Bei rehndsch")), lambda d, dy: tag(d, 60, 540 + dy, 560, 52, "bei range gehört die letzte Zahl nicht dazu", LIGHTK, DARK, 24, 700, outl=LINE))
    E(f, t, a(4, 0.0), lambda d, dy: tag(d, 60, 612 + dy, 560, 56, "Klausur: ohne Vorlage", RED, WHITE, 30))
    # ohne import
    t_f = a(3, 0.0)
    E(f, t, t_f, lambda d, dy: code_lauf(d, 660, 370 + dy, 560, OHNE, t, 24, 40, times=[-1] * len(OHNE), aktiv=set(), title="ohne import", nums=[3, 4]))
    E(f, t, t_f + 0.3, lambda d, dy: lauf_panel(d, 660, 520 + dy, 560, [(t_f + 0.3, FEHLER, None, None, CODE_R)], t, 20, 40, "Fehlermeldung"))


# ---------------------------------------------------------------- 3 Karte 2: Programm in Funktionen
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Karte 2: Programm in Funktionen")
    x, y, w, size, lh = 60, 112, 640, 22, 36
    t_m = a(0, pos(3, 0, "melde", "frage"))
    tm = [a(0, 0.02), a(0, 0.1), a(0, 0.2), t_m, t_m + 0.3, t_m + 0.6, a(1, 0.0), a(1, 0.25), a(1, pos(3, 1, "gibt die"))]
    aktiv = aktuell(t, [(a(2, 0.0), {6, 7, 8}), (a(2, 0.9), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K2, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, len(CODE_K2))
    NX, NW = 740, 480
    E(f, t, a(0, pos(3, 0, "Oben")), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "Funktion frage: liest ein", LIGHTA, AMB, size=22, h=36, outl=AMB), tout=a(2, 0.0))
    E(f, t, t_m, lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "Funktion melde: zeigt an", LIGHTA, AMB, size=22, h=36, outl=AMB), tout=a(2, 0.0))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 6, NX, NW, "Hauptprogramm: ruft frage auf", LIGHTB, BLUE, size=22, h=36, outl=BLUE), tout=a(2, 0.0))
    E(f, t, a(1, pos(3, 1, "gibt die")), lambda d, dy: zeilen_notiz(d, g(dy), 8, NX, NW, "gibt die Summe weiter", LIGHTB, BLUE, size=22, h=36, outl=BLUE), tout=a(2, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, NX, 150 + dy, NW, 56, "Eingaben 3 und 4", LIGHTK, DARK, 28, 700, outl=LINE))
    zl = [(a(2, 0.05), OUT_K2[0][:-1], a(2, 0.15), "3"), (a(2, 0.3), OUT_K2[1][:-1], a(2, 0.4), "4"), (a(2, 0.6), OUT_K2[2], None, None)]
    E(f, t, a(2, 0.0), lambda d, dy: lauf_panel(d, x, 516 + dy, w, zl, t, 22, 34, "Programmlauf"))
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, NX, 250 + dy, NW, 56, "3 + 4 = 7", RED, WHITE, 34))


# ---------------------------------------------------------------- 4 Wie die Werte wandern
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Wie die Werte wandern")
    zeilen = [(CODE_K2[6], "a = 3", a(0, 0.05), a(0, pos(4, 0, "und ")), BLUE, LIGHTB),
              (CODE_K2[7], "b = 4", a(0, pos(4, 0, "Der zweite")), a(0, pos(4, 0, "liefert vier")), BLUE, LIGHTB),
              (CODE_K2[8], "melde(7)", a(1, 0.0), a(1, pos(4, 1, "die Summe")), GREEN, LIGHTG)]
    for k, (code, wert, t_c, t_w, col, fill) in enumerate(zeilen):
        yy = 150 + k * 110
        E(f, t, t_c, lambda d, dy, code=code, yy=yy: chip(d, 60, yy + dy, 600, 68, code, BOX, CODE_K, 28, outl=BOX, mono=True))
        E(f, t, t_w, lambda d, dy, wert=wert, yy=yy, col=col, fill=fill: (pfeil(d, 680, yy + 34 + dy, 760, yy + 34 + dy, GREY, 5, 15),
                                                                             chip(d, 780, yy + dy, 280, 68, wert, fill, col, 28, outl=col, mono=True)))
    E(f, t, a(1, pos(4, 1, "und ", "Summe")), lambda d, dy: tag(d, 1080, 150 + 220 + dy, 140, 68, "7", GREEN, WHITE, 40))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 520 + dy, 1000, 64, "Eine Funktion, eine Aufgabe", RED, WHITE, 38))
    E(f, t, a(2, pos(4, 2, "Funktionen oben")), lambda d, dy: tag(d, 60, 604 + dy, 1000, 56, "Funktionen oben, Hauptprogramm unten", LIGHTK, DARK, 30, 700, outl=LINE))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4}
assert len(SRC) == len(SCENES) == 4


def poster(path):
    f = Frame()

    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 09 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(72, 700), DARK)
        T2(d, 90, 244, "Werkzeugkasten", F(72, 700), DARK)
        T2(d, 90, 384, "random und Programme gliedern", F(34, 400), GREY)
        for k, wort in enumerate(("random", "def", "return")):
            chip(d, 90 + k * 230, 470, 215, 70, wort, BOX, CODE_K, 32, outl=BOX, mono=True)
        code_n(d, 780, 150, 440, CODE_K2[:5], [1, 2, 3, 4, 5], [-1] * 5, 0, 22, 40)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
