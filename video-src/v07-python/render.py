"""Termin 07, Video 2: Python-Werkzeugkasten: ** nur lesen (Karte 1), def (Karte 2), return (Karte 3), type und round (Karte 4).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie im Labor (app/inhalte/v07/labor.mdx, Syntaxkarten); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v07-python"; LABEL = "DHBW · Informatik · Termin 07 · Python-Werkzeugkasten: hoch, def, return, type und round"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Syntaxkarten im Labor)
CODE_K1 = ["print(2 ** 8)", "print(2 ** 16)", "print(2 ** 64 + 1)"]
OUT_K1 = run(NL.join(CODE_K1)); assert OUT_K1 == ["256", "65536", "18446744073709551617"], OUT_K1
assert len(OUT_K1[2]) == 20 and 2 ** 8 == 256 and 2 ** 16 == 65536 and 2 ** 64 + 1 > 2 ** 64 - 1

CODE_K2 = ["def begruessen(name):", '    print(f"Hallo {name}!")', "", 'begruessen("Lea")', 'begruessen("Tom")']
OUT_K2 = run(NL.join(CODE_K2)); assert OUT_K2 == ["Hallo Lea!", "Hallo Tom!"], OUT_K2

CODE_K3 = ["def quadrat(x):", "    return x * x", "", "ergebnis = quadrat(4)", "print(ergebnis)"]
OUT_K3 = run(NL.join(CODE_K3)); assert OUT_K3 == ["16"], OUT_K3
CODE_K3B = ["def quadrat(x):", "    print(x * x)", "", "ergebnis = quadrat(4)", "print(ergebnis)"]
OUT_K3B = run(NL.join(CODE_K3B)); assert OUT_K3B == ["16", "None"], OUT_K3B

CODE_K4 = ["print(type(42))", "print(type(7 / 2))", "print(round(0.1 + 0.2, 2) == 0.3)"]
OUT_K4 = run(NL.join(CODE_K4)); assert OUT_K4 == ["<class 'int'>", "<class 'float'>", "True"], OUT_K4
assert round(0.1 + 0.2, 2) == 0.3 and 0.1 + 0.2 != 0.3


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


def ausgabe(f, t, x, y, w, zeiten_, texte, lh=40, size=28):
    E(f, t, zeiten_[0] - 0.1, lambda d, dy: lauf_panel(d, x, y + dy, w, [(tt, s, None, None) for tt, s in zip(zeiten_, texte)], t, size, lh, "Ausgabe"))


# ---------------------------------------------------------------- 1 Vier Karten
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Vier Karten im Werkzeugkasten")
    karten = [(1, "hoch: nur lesen", "2 ** 8", "die Zahl der Werte eines Bytes", a(1, pos(1, 1, "Karte eins"))),
              (2, "def: eigene Funktion", "def begruessen(name):", "zuerst definieren, dann aufrufen", a(1, pos(1, 1, "Karte zwei"))),
              (3, "return: Wert zurückgeben", "return x * x", "print zeigt an, return gibt zurück", a(1, pos(1, 1, "Karte drei"))),
              (4, "type und round", "round(0.1 + 0.2, 2)", "Datentyp nennen, Kommazahl runden", a(2, pos(1, 2, "Karte vier")))]
    for k, (nr, titel, code, unter, tin) in enumerate(karten):
        x = 60 + (k % 2) * 590; y = 150 + (k // 2) * 240
        E(f, t, tin, lambda d, dy, x=x, y=y, nr=nr, titel=titel, code=code, unter=unter: kasten(d, x, y + dy, 570, 215, nr, titel, code, unter))
    E(f, t, a(2, pos(1, 2, "Alles aus")), lambda d, dy: tag(d, 60, 630 + dy, 1160, 56, "Alles aus Termin 02 bis 06 gilt weiter", LIGHTK, DARK, 30, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Karte 1: hoch, nur lesen
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: hoch, nur lesen")
    x, y, w, size, lh = 60, 116, 560, 28, 48
    tm = [a(0, 0.35), a(1, 0.0), a(2, 0.0)]
    aktiv = aktuell(t, [(a(0, 0.3), {0}), (a(1, 0.0), {1}), (a(2, 0.0), {2}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K1, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 3)
    E(f, t, a(0, pos(2, 0, "Zwei Sterne")), lambda d, dy: code_markiere(d, g(dy), 0, *spalte(CODE_K1[0], "**"), RED), tout=a(1, 0.0))
    E(f, t, a(0, pos(2, 0, "Zwei Sterne")), lambda d, dy: tag(d, 700, 130 + dy, 520, 56, "** heißt hoch", LIGHTR, RED, 30, 700, outl=RED))
    ausgabe(f, t, x, 336, w, [a(0, 0.7), a(1, 0.4), a(2, 0.5)], OUT_K1)
    E(f, t, a(0, pos(2, 0, "Das ist die Zahl")), lambda d, dy: tag(d, 700, 210 + dy, 520, 56, "2 ** 8: Werte eines Bytes", LIGHTK, DARK, 28, 700, outl=LINE))
    E(f, t, a(2, 0.2), lambda d, dy: tag(d, 700, 290 + dy, 520, 56, "64 Bit passen hier nicht", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(2, 0.5), lambda d, dy: tag(d, 700, 370 + dy, 520, 56, "Python rechnet trotzdem richtig", LIGHTG, GREEN, 28, 700, outl=GREEN))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 700, 470 + dy, 520, 72, "nur lesen, nicht schreiben", RED, WHITE, 34))


# ---------------------------------------------------------------- 3 Karte 2: def und Aufruf
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Karte 2: def und Aufruf")
    x, y, w, size, lh = 60, 116, 640, 26, 46
    tm = [a(0, 0.25), a(0, 0.25) + 0.9, 0.0, a(2, 0.0), a(2, 0.35)]
    tm[2] = tm[1] + 0.5
    n = len(CODE_K2)
    aktiv = aktuell(t, [(a(0, 0.2), {0}), (a(1, 0.0), {1}), (a(2, 0.0), {3}), (a(2, 0.35), {4}), (a(2, 0.9), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K2, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, n)
    z0 = CODE_K2[0]
    for snip, col, tin, txt in (("def", RED, a(0, pos(3, 0, "Mit")), "Wort def"), ("name", BLUE, a(0, pos(3, 0, "Klammer")), "Parameter"), (":", AMB, a(0, pos(3, 0, "Doppelpunkt")), "Doppelpunkt")):
        c0, c1 = spalte(z0, snip, snip == ":")
        E(f, t, tin, lambda d, dy, c0=c0, c1=c1, col=col: code_markiere(d, g(dy), 0, c0, c1, col), tout=a(1, 0.0))
    NX, NW = 740, 480
    E(f, t, a(0, 0.3), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "Kopf: def, Name, Parameter, :", LIGHTR, RED, size=24, h=40, outl=RED))
    E(f, t, a(1, 0.0), lambda d, dy: (code_einrueckung(d, g(dy), 1), zeilen_notiz(d, g(dy), 1, NX, NW, "Rumpf: eingerückt", LIGHTA, AMB, size=24, h=40, outl=AMB)))
    E(f, t, a(1, pos(3, 1, "In der Zeile")), lambda d, dy: tag(d, NX, 340 + dy, NW, 56, "def legt nur an: es läuft nichts", LIGHTK, DARK, 26, 700, outl=LINE), tout=a(2, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "Aufruf 1: name ist Lea", LIGHTG, GREEN, size=24, h=40, outl=GREEN), tout=a(2, 0.4))
    E(f, t, a(2, 0.4), lambda d, dy: zeilen_notiz(d, g(dy), 4, NX, NW, "Aufruf 2: name ist Tom", LIGHTG, GREEN, size=24, h=40, outl=GREEN))
    ausgabe(f, t, x, 450, w, [a(2, 0.2), a(2, 0.6)], OUT_K2)
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, NX, 480 + dy, NW, 56, "erst definieren, dann aufrufen", RED, WHITE, 28))
    E(f, t, a(3, pos(3, 3, "Und beim")), lambda d, dy: tag(d, NX, 556 + dy, NW, 56, "beim Aufruf stehen Klammern", LIGHTA, AMB, 28, 700, outl=AMB))


# ---------------------------------------------------------------- 4 Karte 3: return
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 3: return gibt zurück")
    x, y, w, size, lh = 60, 116, 560, 26, 46
    tm = [a(0, 0.05), a(0, 0.3), 0.0, a(1, 0.0), a(1, 0.55)]; tm[2] = tm[1] + 0.5
    aktiv = aktuell(t, [(a(0, 0.3), {1}), (a(1, 0.0), {3}), (a(1, 0.55), {4}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K3, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 5)
    E(f, t, a(0, pos(4, 0, "rechnet")), lambda d, dy: code_markiere(d, g(dy), 1, 4, 10, GREEN), tout=a(1, 0.0))
    NX, NW = 640, 300
    E(f, t, a(0, 0.5), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "return: gibt zurück", LIGHTG, GREEN, size=22, h=34, outl=GREEN), tout=a(1, 0.0))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "quadrat(4) wird 16", LIGHTR, RED, size=22, h=34, outl=RED), tout=a(2, 0.0))
    ausgabe(f, t, x, 430, 560, [a(1, 0.8)], OUT_K3)
    # die Variante mit print: Code und Ausgabe rechts
    t_var = a(2, 0.0)
    aktiv_b = aktuell(t, [(a(2, pos(4, 2, "zeigt sie")), {1}), (a(2, pos(4, 2, "In ergebnis")), {4}), (a(3, 0.0), None)])
    E(f, t, t_var, lambda d, dy: code_lauf(d, 660, y + dy, 560, CODE_K3B, t, size, lh, times=[-1] * 5, aktiv=aktiv_b, title="Variante mit print"))
    ausgabe(f, t, 660, 430, 560, [a(2, pos(4, 2, "zeigt sie")), a(2, pos(4, 2, "In ergebnis"))], OUT_K3B)
    E(f, t, a(2, pos(4, 2, "In ergebnis")), lambda d, dy: tag(d, 660, 580 + dy, 560, 44, "None heißt: nichts zurückgegeben", LIGHTR, RED, 26, 700, outl=RED))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 636 + dy, 560, 50, "Anzeigen: print", LIGHTK, DARK, 30, 700, outl=LINE))
    E(f, t, a(3, 0.5), lambda d, dy: tag(d, 660, 636 + dy, 560, 50, "Weitergeben: return", RED, WHITE, 30))


# ---------------------------------------------------------------- 5 Karte 4: type und round
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Karte 4: type und round")
    x, y, w, size, lh = 60, 116, 840, 26, 46
    tm = [a(0, 0.3), a(1, 0.0), a(2, 0.0)]
    aktiv = aktuell(t, [(a(0, 0.25), {0}), (a(1, 0.0), {1}), (a(2, 0.0), {2}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K4, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 3)
    NX, NW = 920, 300
    E(f, t, a(0, 0.5), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "42: ganze Zahl, int", LIGHTB, BLUE, size=22, h=34, outl=BLUE))
    E(f, t, a(1, 0.1), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "/ gibt float", LIGHTA, AMB, size=22, h=34, outl=AMB))
    E(f, t, a(2, pos(5, 2, "rundet auf")), lambda d, dy: code_markiere(d, g(dy), 2, *spalte(CODE_K4[2], "round(0.1 + 0.2, 2)"), GREEN), tout=a(3, 0.0))
    E(f, t, a(2, 0.1), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "erst runden", LIGHTG, GREEN, size=22, h=34, outl=GREEN))
    ausgabe(f, t, x, 340, w, [a(0, 0.7), a(1, 0.4), a(2, 0.9)], OUT_K4)
    E(f, t, a(2, pos(5, 2, "Der Vergleich")), lambda d, dy: tag(d, 60, 540 + dy, 840, 56, "gerundet gleich 0.3: True", LIGHTG, GREEN, 30, 700, outl=GREEN))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 620 + dy, 840, 60, "Kommazahlen: erst runden, dann vergleichen", RED, WHITE, 32))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 07 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "hoch, def, return, type und round", F(34, 400), GREY)
        for k, wort in enumerate(("def", "return", "round")):
            chip(d, 90 + k * 230, 470, 215, 70, wort, BOX, CODE_K, 32, outl=BOX, mono=True)
        code_n(d, 760, 150, 460, CODE_K3, [1, 2, 3, 4, 5], [-1] * 5, 0, 26, 44)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
