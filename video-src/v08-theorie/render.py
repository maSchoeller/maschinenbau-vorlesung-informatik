"""Termin 08, Video 1: Zahl oder Text? (input liefert Text, Text plus Zahl ist ein TypeError, int/str/int(3.7), bool).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie in der Lerneinheit und auf den Karten im Labor (app/inhalte/v08); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v08-theorie"; LABEL = "DHBW · Informatik · Termin 08 · Zahl oder Text?"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}


def lauf(code, stdin=None):
    """Ausgabezeilen und, falls das Programm abbricht, die letzte Zeile der Meldung (Art: Text) wie Python 3.13 sie meldet."""
    try:
        return run(NL.join(code), stdin), None
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
CODE1 = ["alter = input(\"Alter: \")", "print(type(alter))"]
OUT1 = run(NL.join(CODE1), ["17"]); assert OUT1 == ["Alter: 17", "<class 'str'>"], OUT1

CODE2 = ["name = \"Lea\"", "print(\"Hallo \" + name)", "alter = input(\"Alter: \")", "print(alter + 1)"]
_o, MELDUNG = lauf(CODE2, ["17"])
assert MELDUNG == 'TypeError: can only concatenate str (not "int") to str', MELDUNG
OUT2 = run(NL.join(CODE2[:3]), ["17"]); assert OUT2 == ["Hallo Lea", "Alter: 17"], OUT2

CODE3 = ["alter = int(input(\"Alter: \"))", "print(alter + 1)", "print(\"Punkte: \" + str(12))", "print(int(3.7))"]
OUT3 = run(NL.join(CODE3), ["17"]); assert OUT3 == ["Alter: 17", "18", "Punkte: 12", "3"], OUT3

CODE4 = ["print(5 > 3)", "print(5 < 3)", "print(type(5 > 3))"]
OUT4 = run(NL.join(CODE4)); assert OUT4 == ["True", "False", "<class 'bool'>"], OUT4
assert int(3.7) == 3 and int("17") + 1 == 18 and "Punkte: " + str(12) == "Punkte: 12"


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- 1 input liefert Text
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Was input liefert, ist Text")
    t17 = a(0, pos(1, 0, "siebzehn")); t_var = a(0, pos(1, 0, "Aber"))
    def eingabe(d, dy):
        TB(d, 60, 128 + dy, "Eingabefeld", F(26, 600), GREY, 300, "lm", "Beschriftung")
        d.rounded_rectangle((60, 152 + dy, 460, 228 + dy), 12, fill=WHITE, outline=LINE, width=3)
        TB(d, 84, 190 + dy, "Alter:", F(34, 600), GREY, 130, "lm", "Feld")
        if t >= t17: TB(d, 214, 190 + dy, "17", M(40, True), DARK, 200, "lm", "Feld")
    E(f, t, a(0, 0.05), eingabe)
    E(f, t, t_var, lambda d, dy: (pfeil(d, 484, 190 + dy, 586, 190 + dy, GREY, 5, 15), schachtel(d, 620, 140 + dy, 300, 104, "alter", '"17"', AMB, AMB, 52, LIGHTA)))
    E(f, t, t_var + 0.3, lambda d, dy: tag(d, 960, 164 + dy, 260, 56, "kein int", LIGHTR, RED, 28, 700, outl=RED))
    x, y, w, size, lh = 60, 316, 600, 28, 46
    aktiv = aktuell(t, [(a(1, 0.0), {0}), (a(1, pos(1, 1, "teip")), {1}), (a(2, 0.0), None)])
    E(f, t, a(0, 0.1), lambda d, dy: code_lauf(d, x, y + dy, w, CODE1, t, size, lh, times=[a(0, 0.15), a(1, 0.3)], aktiv=aktiv))
    zl = [(a(1, 0.0), "Alter: ", a(1, 0.15), "17"), (a(1, pos(1, 1, "zeigt")), OUT1[1], None, None)]
    E(f, t, a(1, 0.0), lambda d, dy: lauf_panel(d, x, 500 + dy, w, zl, t, size, lh, "Programmlauf"))
    E(f, t, a(1, pos(1, 1, "Das steht")), lambda d, dy: tag(d, 720, 330 + dy, 500, 60, "str: Text", LIGHTA, AMB, 34, 700, outl=AMB))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 720, 410 + dy, 500, 60, "Text steht in Anführungszeichen", LIGHTK, DARK, 26, 700, outl=LINE))
    for k, (nm, wert, col, fill) in enumerate((("int", "17", BLUE, LIGHTB), ("float", "17.5", BLUE, LIGHTB), ("str", '"17"', AMB, LIGHTA))):
        E(f, t, a(3, 0.05 + 0.25 * k), lambda d, dy, k=k, nm=nm, wert=wert, col=col, fill=fill: (
            chip(d, 720 + k * 170, 500 + dy, 150, 56, nm, fill, col, 28, outl=col, mono=True),
            TB(d, 795 + k * 170, 586 + dy, wert, M(30, True), col, 150, "mm", "Beispiel")))
    E(f, t, a(3, pos(1, 3, "Der Typ")), lambda d, dy: TB(d, 720, 640 + dy, "Der Typ sagt Python, wie der Wert gilt", F(24, 600), GREY, 500, "lm", "Hinweis"))


# ---------------------------------------------------------------- 2 Text plus Zahl
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Text plus Zahl: der TypeError")
    x, y, w, size, lh = 60, 116, 640, 28, 46
    tm = [a(0, 0.05), a(0, pos(2, 0, "Mit")) + 0.6, a(1, 0.0), a(1, pos(2, 1, "Zählst"))]
    aktiv = aktuell(t, [(a(0, 0.0), {0, 1}), (a(1, 0.0), {2}), (a(1, pos(2, 1, "Zählst")), {3}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE2, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 4)
    NX, NW = 740, 480
    E(f, t, a(0, pos(2, 0, "Mit")), lambda d, dy: code_markiere(d, g(dy), 1, *spalte(CODE2[1], '"Hallo "'), AMB), tout=a(1, 0.0))
    E(f, t, a(0, pos(2, 0, "Mit")), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "plus hängt Text aneinander", LIGHTA, AMB, size=24, h=40, outl=AMB), tout=a(1, 0.0))
    E(f, t, a(1, pos(2, 1, "Zählst")), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "Text plus Zahl: bricht ab", LIGHTR, RED, size=24, h=40, outl=RED))
    # Konsole
    t_m = a(1, pos(2, 1, "meldet"))
    segs = [("TypeError", CODE_R), (": can only concatenate ", CODE_T), ("str", CODE_K), (" (not \"", CODE_T), ("int", CODE_K), ("\") to ", CODE_T), ("str", CODE_K)]
    assert "".join(s for s, _ in segs) == MELDUNG
    zl = [(a(0, 0.5), OUT2[0], None, None), (a(1, 0.0), "Alter: ", a(1, 0.2), "17"), (t_m, segs, None, None)]
    hl = {2} if t >= a(2, 0.0) else set()
    E(f, t, a(0, 0.4), lambda d, dy: lauf_panel(d, 60, 380 + dy, 1160, zl, t, 28, 46, "Programmlauf", hl=hl))
    # von unten lesen
    E(f, t, a(2, 0.0), lambda d, dy: (pfeil(d, 1190, 560 + dy, 1190, 440 + dy, RED, 6, 18), TB(d, 1140, 580 + dy, "von unten lesen", F(26, 700), RED, 300, "ra", "Hinweis")))
    E(f, t, a(2, pos(2, 2, "teip-error heißt")), lambda d, dy: tag(d, 60, 584 + dy, 520, 60, "TypeError: die Typen passen nicht", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(2, pos(2, 2, "ess-tee-er")), lambda d, dy: (tag(d, 610, 584 + dy, 110, 60, "str", LIGHTA, AMB, 32, 700, outl=AMB),
                                                           TB(d, 767, 614 + dy, "und", F(28, 600), GREY, 80, "mm", "und"),
                                                           tag(d, 815, 584 + dy, 110, 60, "int", LIGHTB, BLUE, 32, 700, outl=BLUE)))
    E(f, t, a(3, 0.0), lambda d, dy: TB(d, 60, 664 + dy, "Die Meldung sagt dir genau, was nicht passt.", F(26, 600), GREY, 800, "lm", "Hinweis"))


# ---------------------------------------------------------------- 3 Umwandeln
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Umwandeln mit int und str")
    x, y, w, size, lh = 60, 116, 700, 28, 46
    tm = [a(0, 0.05), a(1, 0.0), a(2, 0.0), a(3, 0.0)]
    aktiv = aktuell(t, [(a(0, 0.3), {0}), (a(1, 0.0), {1}), (a(2, pos(3, 2, "ess-tee-er geht") + 0.1), {2}), (a(3, 0.0), {3}), (a(3, 0.99), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE3, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 4)
    NX, NW = 800, 420
    E(f, t, a(0, pos(3, 0, "Willst")), lambda d, dy: code_markiere(d, g(dy), 0, *spalte(CODE3[0], "int"), GREEN), tout=a(1, 0.0))
    E(f, t, a(0, pos(3, 0, "Willst")), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "int: Text wird Zahl", LIGHTG, GREEN, size=24, h=40, outl=GREEN))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "Zahl plus 1: 18", LIGHTB, BLUE, size=24, h=40, outl=BLUE))
    E(f, t, a(2, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "str: Zahl wird Text", LIGHTA, AMB, size=24, h=40, outl=AMB))
    E(f, t, a(2, 0.0), lambda d, dy: code_markiere(d, g(dy), 2, *spalte(CODE3[2], "str"), AMB), tout=a(3, 0.0))
    E(f, t, a(3, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "schneidet ab, rundet nicht", LIGHTR, RED, size=24, h=40, outl=RED))
    zl = [(a(0, 0.35), "Alter: ", a(0, 0.5), "17"), (a(1, 0.3), OUT3[1], None, None), (a(2, 0.5), OUT3[2], None, None), (a(3, 0.3), OUT3[3], None, None)]
    E(f, t, a(0, 0.3), lambda d, dy: lauf_panel(d, 60, 390 + dy, 700, zl, t, 28, 46, "Programmlauf"))
    E(f, t, a(3, pos(3, 3, "schneidet")), lambda d, dy: tag(d, 800, 420 + dy, 420, 64, "3,7 wird zu 3", RED, WHITE, 34))
    E(f, t, a(3, pos(3, 3, "schneidet")), lambda d, dy: TB(d, 800, 510 + dy, "die Nachkommastellen fallen weg", F(24, 600), GREY, 420, "lm", "Hinweis"))


# ---------------------------------------------------------------- 4 bool und Merke
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "bool: True oder False")
    x, y, w, size, lh = 60, 116, 560, 28, 46
    tm = [a(0, pos(4, 0, "Ein Vergleich")), a(0, pos(4, 0, "Ein Vergleich")) + 0.8, a(0, 0.99)]
    aktiv = aktuell(t, [(tm[0], {0}), (tm[1], {1}), (a(1, 0.0), {2}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE4, t, size, lh, times=tm, aktiv=aktiv))
    zl = [(tm[0] + 0.3, OUT4[0], None, None), (tm[1] + 0.3, OUT4[1], None, None), (a(1, 0.3), OUT4[2], None, None)]
    E(f, t, a(0, 0.4), lambda d, dy: lauf_panel(d, 60, 350 + dy, 560, zl, t, 28, 46, "Programmlauf"))
    E(f, t, a(0, pos(4, 0, "Er kennt")), lambda d, dy: (tag(d, 700, 140 + dy, 240, 76, "True", LIGHTG, GREEN, 40, 700, outl=GREEN), tag(d, 980, 140 + dy, 240, 76, "False", LIGHTR, RED, 40, 700, outl=RED)))
    E(f, t, a(0, pos(4, 0, "Er kennt")), lambda d, dy: TB(d, 960, 240 + dy, "nur zwei Werte", F(26, 600), GREY, 520, "mm", "Hinweis"))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 700, 290 + dy, 520, 60, "Bedingung in if: wahr oder falsch", LIGHTK, DARK, 26, 700, outl=LINE))
    typen = [("int", "17", BLUE, LIGHTB), ("float", "3.7", BLUE, LIGHTB), ("str", '"17"', AMB, LIGHTA), ("bool", "True", GREEN, LIGHTG)]
    for k, (nm, wert, col, fill) in enumerate(typen):
        E(f, t, a(2, 0.05 + 0.2 * k), lambda d, dy, k=k, nm=nm, wert=wert, col=col, fill=fill: (
            card(d, 60 + k * 295, 560 + dy, 275, 108, stripe=False), d.rounded_rectangle((60 + k * 295, 560 + dy, 335 + k * 295, 570 + dy), 5, fill=col),
            TB(d, 90 + k * 295, 610 + dy, nm, M(30, True), col, 100, "lm", "Typ"), TB(d, 305 + k * 295, 624 + dy, wert, M(30, True), DARK, 120, "rm", "Beispiel")))
    E(f, t, a(2, pos(4, 2, "Python rechnet")), lambda d, dy: tag(d, 700, 380 + dy, 520, 64, "Die Typen müssen passen", RED, WHITE, 32))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4}
assert len(SRC) == 4 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 08 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Zahl", F(96, 700), DARK)
        T2(d, 90, 270, "oder Text?", F(96, 700), DARK)
        T2(d, 90, 400, "int, str, float und bool", F(40, 400), GREY)
        tag(d, 90, 600, 560, 70, 'input liefert "17", nicht 17', RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        schachtel(d, 760, 190, 360, 130, "alter", '"17"', AMB, AMB, 64, LIGHTA)
        for k, (nm, col, fill) in enumerate((("int", BLUE, LIGHTB), ("str", AMB, LIGHTA), ("bool", GREEN, LIGHTG))):
            chip(d, 700 + k * 170, 420, 150, 64, nm, fill, col, 30, outl=col, mono=True)
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
