"""Termin 08, Video 2: Python-Werkzeugkasten: Text und bool (Karte 1), Umwandeln (Karte 2), Namen in der Funktion (Karte 3),
Rest mit % und True oder False zurueckgeben (Karte 4).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie auf den Karten im Labor (briefing/termin-08-zuschnitt.md, Station 1); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v08-python"; LABEL = "DHBW · Informatik · Termin 08 · Python-Werkzeugkasten"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}


def lauf(code):
    """Ausgabezeilen bis zum Abbruch und die Meldung (Art: Text) wie Python 3.13 sie meldet (None, wenn nichts abbricht)."""
    import io, contextlib
    buf = io.StringIO(); meld = None
    try:
        with contextlib.redirect_stdout(buf): exec(NL.join(code), {})
    except Exception as e:
        meld = f"{type(e).__name__}: {e}"
    return buf.getvalue().splitlines(), meld


# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Karten im Labor)
K1 = ['name = "Lea"', 'print("Hallo " + name)', "print(type(name))", "print(type(5 > 3))", 'print(name == "Lea")']
O1, M1 = lauf(K1); assert O1 == ["Hallo Lea", "<class 'str'>", "<class 'bool'>", "True"] and M1 is None, O1
K2 = ['zahl = int("5")', "print(zahl + 3)", 'print(float("2.5") * 2)', 'print("Punkte: " + str(12))', "print(int(3.7))"]
O2, M2 = lauf(K2); assert O2 == ["8", "5.0", "Punkte: 12", "3"] and M2 is None, O2
K3 = ["def quadrat(x):", "    ergebnis = x * x", "    return ergebnis", "", "zahl = quadrat(4)", "print(zahl)", "print(ergebnis)"]
O3, M3 = lauf(K3); assert O3 == ["16"] and M3 == "NameError: name 'ergebnis' is not defined", (O3, M3)
K4 = ["print(7 % 2)", "print(8 % 2)", "", "def ist_gerade(n):", "    if n % 2 == 0:", "        return True", "    else:", "        return False", "",
      "print(ist_gerade(8))", "print(ist_gerade(7))", "if ist_gerade(10):", '    print("gerade")']
O4, M4 = lauf(K4); assert O4 == ["1", "0", "True", "False", "gerade"] and M4 is None, O4


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
    TB(d, x + 80, y + 58, titel, F(30, 700), DARK, w - 100, "lm", "Kartentitel")
    d.rounded_rectangle((x + 20, y + 100, x + w - 20, y + 156), 10, fill=BOX)
    TB(d, x + w / 2, y + 128, code, M(26), CODE_T, w - 64, "mm", "Kartencode")
    TB(d, x + 24, y + 176, untertitel, F(26, 600), GREY, w - 48, "la", "Karten-Untertitel")


def ausgabe(f, t, x, y, w, zeiten_, zeilen, lh=40, size=26, farben=None):
    """Konsole, deren Zeilen zu den Zeiten erscheinen; farben: {Zeilenindex: Farbe}."""
    farben = farben or {}
    E(f, t, zeiten_[0] - 0.1, lambda d, dy: lauf_panel(d, x, y + dy, w, [(tt, s, None, None) + ((farben[i],) if i in farben else ()) for i, (tt, s) in enumerate(zip(zeiten_, zeilen))], t, size, lh, "Ausgabe"))


# ---------------------------------------------------------------- 1 Vier Karten
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Vier Karten im Werkzeugkasten")
    karten = [(1, "Text und bool", '"Hallo " + name', "Text zusammensetzen, True und False", a(1, pos(1, 1, "Karte eins"))),
              (2, "Umwandeln", 'int("5")', "int, float und str", a(1, pos(1, 1, "Karte zwei"))),
              (3, "Namen in der Funktion", "return ergebnis", "drinnen angelegt, draußen unbekannt", a(1, pos(1, 1, "Karte drei"))),
              (4, "Rest und True oder False", "n % 2 == 0", "return in beiden Zweigen", a(2, pos(1, 2, "Karte vier")))]
    for k, (nr, titel, code, unter, tin) in enumerate(karten):
        x = 60 + (k % 2) * 590; y = 150 + (k // 2) * 240
        E(f, t, tin, lambda d, dy, x=x, y=y, nr=nr, titel=titel, code=code, unter=unter: kasten(d, x, y + dy, 570, 215, nr, titel, code, unter))
    E(f, t, a(2, pos(1, 2, "Alles aus")), lambda d, dy: tag(d, 60, 630 + dy, 1160, 56, "Alles aus Termin 02 bis 07 gilt weiter", LIGHTK, DARK, 30, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Karte 1
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: Text und bool")
    x, y, w, size, lh = 60, 116, 640, 28, 46
    tm = [a(0, 0.0), a(0, pos(2, 0, "Mit")), a(1, 0.0), a(1, pos(2, 1, "Ein Vergleich")), a(2, 0.15)]
    aktiv = aktuell(t, [(a(0, 0.0), {0, 1}), (a(1, 0.0), {2}), (a(1, pos(2, 1, "Ein Vergleich")), {3}), (a(2, 0.15), {4}), (a(2, 0.99), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, K1, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 5)
    NX, NW = 740, 480
    E(f, t, a(0, pos(2, 0, "Mit")), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "plus hängt Text aneinander", LIGHTA, AMB, size=24, h=40, outl=AMB))
    E(f, t, a(0, pos(2, 0, "Das Leer")), lambda d, dy: code_markiere(d, g(dy), 1, *spalte(K1[1], '"Hallo "'), AMB), tout=a(1, 0.0))
    E(f, t, a(1, 0.2), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "str: Text", LIGHTA, AMB, size=24, h=40, outl=AMB))
    E(f, t, a(1, pos(2, 1, "Ein Vergleich")), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "bool: True oder False", LIGHTG, GREEN, size=24, h=40, outl=GREEN))
    E(f, t, a(2, 0.1), lambda d, dy: zeilen_notiz(d, g(dy), 4, NX, NW, "== vergleicht Text mit Text", LIGHTB, BLUE, size=24, h=40, outl=BLUE))
    ausgabe(f, t, x, 410, w, [a(0, 0.7), a(1, 0.4), a(1, 0.85), a(2, 0.6)], O1, lh=40, size=26)


# ---------------------------------------------------------------- 3 Karte 2
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Karte 2: Umwandeln")
    x, y, w, size, lh = 60, 116, 640, 28, 46
    tm = [a(0, 0.0), a(0, pos(3, 0, "Danach")), a(1, 0.0), a(2, 0.0), a(2, pos(3, 2, "int von drei"))]
    aktiv = aktuell(t, [(a(0, 0.0), {0}), (a(0, pos(3, 0, "Danach")), {1}), (a(1, 0.0), {2}), (a(2, 0.0), {3}), (a(2, pos(3, 2, "int von drei")), {4}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, K2, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 5)
    NX, NW = 740, 480
    E(f, t, a(0, 0.2), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "int: Text wird Zahl", LIGHTG, GREEN, size=24, h=40, outl=GREEN))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "float: Kommazahl", LIGHTB, BLUE, size=24, h=40, outl=BLUE))
    E(f, t, a(2, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "str: Zahl wird Text", LIGHTA, AMB, size=24, h=40, outl=AMB))
    E(f, t, a(2, pos(3, 2, "int von drei")), lambda d, dy: zeilen_notiz(d, g(dy), 4, NX, NW, "int schneidet ab", LIGHTR, RED, size=24, h=40, outl=RED))
    ausgabe(f, t, x, 410, w, [a(0, pos(3, 0, "Danach") + 0.2), a(1, 0.6), a(2, 0.4), a(2, pos(3, 2, "int von drei") + 0.3)], O2, lh=40, size=26)
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 740, 470 + dy, 480, 64, "erst umwandeln, dann rechnen", RED, WHITE, 28))


# ---------------------------------------------------------------- 4 Karte 3
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 3: Namen in der Funktion")
    x, y, w, size, lh = 60, 116, 560, 26, 38
    tm = [a(0, 0.0), a(0, 0.2), a(0, 0.4), a(0, 0.5), a(1, 0.0), a(1, 0.5), a(2, 0.0)]
    aktiv = aktuell(t, [(a(0, 0.0), {0, 1, 2}), (a(1, 0.0), {4, 5}), (a(2, 0.0), {6}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, K3, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 7)
    NX, NW = 660, 560
    E(f, t, a(0, pos(4, 0, "gibt es")), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "return: gibt den Wert zurück", LIGHTG, GREEN, size=24, h=38, outl=GREEN), tout=a(1, 0.0))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 4, NX, NW, "draußen gespeichert in zahl", LIGHTB, BLUE, size=24, h=38, outl=BLUE), tout=a(2, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: (code_markiere(d, g(dy), 6, *spalte(K3[6], "ergebnis"), RED), zeilen_notiz(d, g(dy), 6, NX, NW, "draußen unbekannt", LIGHTR, RED, size=24, h=38, outl=RED)))
    segs = [("NameError", CODE_R), (": name 'ergebnis' is not defined", CODE_T)]
    assert "".join(s for s, _ in segs) == M3
    zl = [(a(1, 0.6), O3[0], None, None), (a(2, pos(4, 2, "Python meldet")), segs, None, None)]
    E(f, t, a(1, 0.5), lambda d, dy: lauf_panel(d, 60, 470 + dy, 560, zl, t, 22, 44, "Programmlauf"))
    E(f, t, a(3, 0.0), lambda d, dy: (tag(d, 660, 470 + dy, 270, 76, "hinein: Parameter", LIGHTB, BLUE, 26, 700, outl=BLUE),
                                     tag(d, 950, 470 + dy, 270, 76, "heraus: return", LIGHTG, GREEN, 26, 700, outl=GREEN)))
    E(f, t, a(3, 0.2), lambda d, dy: tag(d, 660, 570 + dy, 560, 60, "x und ergebnis gibt es nur drinnen", RED, WHITE, 28))


# ---------------------------------------------------------------- 5 Karte 4
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Karte 4: Rest und True oder False")
    x, y, w, size, lh = 60, 112, 620, 24, 34
    t_rest = a(0, 0.0); t_def = a(1, 0.0); t_ret = a(2, 0.0); t_if = a(3, 0.0)
    tm = [t_rest, t_rest + 0.3, 0.0, t_def, t_def + 0.2, t_def + 0.4, t_def + 0.6, t_def + 0.8, 0.0, t_ret + 0.5, t_ret + 0.9, t_if, t_if + 0.3]
    tm[2] = tm[1]; tm[8] = tm[7]
    aktiv = aktuell(t, [(t_rest, {0, 1}), (t_def, {3, 4}), (t_ret, {5, 7}), (t_ret + 0.5, {9, 10}), (t_if, {11, 12}), (a(3, 0.99), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, K4, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 13)
    NX, NW = 720, 500
    E(f, t, t_rest, lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "7 % 2: Rest 1", LIGHTA, AMB, size=22, h=32, outl=AMB), tout=t_def)
    E(f, t, a(0, pos(5, 0, "acht")), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "8 % 2: Rest 0", LIGHTA, AMB, size=22, h=32, outl=AMB), tout=t_def)
    E(f, t, t_def, lambda d, dy: zeilen_notiz(d, g(dy), 4, NX, NW, "gerade heißt: Rest 0", LIGHTG, GREEN, size=22, h=32, outl=GREEN), tout=t_ret)
    E(f, t, t_ret, lambda d, dy: (zeilen_notiz(d, g(dy), 5, NX, NW, "return True", LIGHTG, GREEN, size=22, h=32, outl=GREEN),
                                  zeilen_notiz(d, g(dy), 7, NX, NW, "return False", LIGHTR, RED, size=22, h=32, outl=RED)), tout=t_if)
    E(f, t, a(2, pos(5, 2, "Es läuft")), lambda d, dy: tag(d, NX, 250 + dy, NW, 52, "nur eines von beiden läuft", LIGHTK, DARK, 24, 700, outl=LINE), tout=t_if)
    E(f, t, t_if, lambda d, dy: tag(d, NX, 390 + dy, NW, 44, "Aufruf in der Bedingung", LIGHTB, BLUE, 24, 700, outl=BLUE))
    ausgabe(f, t, NX, 450, NW, [t_rest + 0.5, t_rest + 1.2, t_ret + 0.8, t_ret + 1.3, t_if + 0.6], O4, lh=32, size=22)


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 08 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "Text, umwandeln, lokal, True und False", F(34, 400), GREY)
        for k, wort in enumerate(("int", "str", "%")):
            chip(d, 90 + k * 230, 470, 215, 70, wort, BOX, CODE_K, 32, outl=BOX, mono=True)
        code_n(d, 840, 130, 380, K4[3:8], [4, 5, 6, 7, 8], [-1] * 5, 0, 26, 44)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
