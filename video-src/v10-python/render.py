"""Termin 10, Video 2: Python-Werkzeugkasten: Mehr als ein Grund zum Aufhören (while mit and, Text einlesen, die Mitte mit int).
Karte 4 (ord und chr, nur lesen) kommt im Video nicht vor.
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie im Labor, Station 1 (Zuschnitt briefing/termin-10-zuschnitt.md); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v10-python"; LABEL = "DHBW · Informatik · Termin 10 · Python-Werkzeugkasten: Mehr als ein Grund zum Aufhören"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Karten im Labor)
CODE_K1 = ["versuche = 0", "geraten = 0", "while geraten != 5 and versuche < 3:", '    geraten = int(input("Tipp: "))', "    versuche = versuche + 1", "print(versuche)"]
LAUF_K1A = run(NL.join(CODE_K1), ["1", "2", "3"]); assert LAUF_K1A == ["Tipp: 1", "Tipp: 2", "Tipp: 3", "3"], LAUF_K1A
LAUF_K1B = run(NL.join(CODE_K1), ["5"]); assert LAUF_K1B == ["Tipp: 5", "1"], LAUF_K1B

CODE_K2 = ['weiter = "ja"', 'while weiter == "ja":', '    print("Runde")', '    weiter = input("Noch einmal? (ja/nein) ")']
LAUF_K2 = run(NL.join(CODE_K2), ["ja", "ja", "nein"])
assert LAUF_K2 == ["Runde", "Noch einmal? (ja/nein) ja", "Runde", "Noch einmal? (ja/nein) ja", "Runde", "Noch einmal? (ja/nein) nein"], LAUF_K2
assert LAUF_K2.count("Runde") == 3

CODE_K3 = ["print(int((1 + 100) / 2))", "print(int((51 + 100) / 2))", "print(int((3 + 4) / 2))"]
OUT_K3 = run(NL.join(CODE_K3)); assert OUT_K3 == ["50", "75", "3"], OUT_K3
assert (1 + 100) / 2 == 50.5 and (51 + 100) / 2 == 75.5 and (3 + 4) / 2 == 3.5


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
    TB(d, x + w / 2, y + 128, code, M(22), CODE_T, w - 64, "mm", "Kartencode")
    TB(d, x + 24, y + 176, untertitel, F(26, 600), GREY, w - 48, "la", "Karten-Untertitel")


def lauf_zeilen(lauf, zeiten_, eingaben, prompt_len):
    """Zeilen fuer lauf_panel: Eingabezeilen (Aufforderung + getippte Antwort) und Ausgabezeilen.
    zeiten_: je Zeile (Start, Antwortzeit); eingaben: die Antworten in Reihenfolge."""
    out = []; it = iter(eingaben)
    for ln, (t0, t1) in zip(lauf, zeiten_):
        if ln.startswith("Tipp: ") or ln.startswith("Noch einmal? "):
            ant = next(it); assert ln.endswith(ant)
            out.append((t0, ln[: len(ln) - len(ant)], t1, ant))
        else:
            out.append((t0, ln, None, None))
    return out


# ---------------------------------------------------------------- 1 Drei Karten
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Drei Karten im Werkzeugkasten")
    karten = [(1, "Schleife mit and", "while a != 5 and b < 3:", "zwei Gründe zum Aufhören", a(1, pos(1, 1, "Karte eins"))),
              (2, "Text einlesen", 'while weiter == "ja":', "input liefert Text", a(1, pos(1, 1, "Karte zwei"))),
              (3, "Die Mitte", "int((1 + 100) / 2)", "für die Knobelaufgabe", a(1, pos(1, 1, "Karte drei")))]
    for k, (nr, titel, code, unter, tin) in enumerate(karten):
        x = 60 + k * 395
        E(f, t, tin, lambda d, dy, x=x, nr=nr, titel=titel, code=code, unter=unter: kasten(d, x, 170 + dy, 375, 230, nr, titel, code, unter))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 470 + dy, 1160, 60, "Alles aus Termin 02 bis 09 gilt weiter", LIGHTK, DARK, 32, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Karte 1: while mit and
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: Schleife mit and")
    x, y, w, size, lh = 60, 116, 660, 24, 42
    t_a, t_b = a(2, 0.0), a(2, pos(2, 2, "Du tippst gleich"))
    tm = [a(0, 0.0), a(0, 0.1), a(0, 0.2), a(0, 0.3), a(0, 0.4), a(0, 0.5)]
    aktiv = aktuell(t, [(a(1, 0.0), {2}), (t_a, {3, 4}), (t_b, {3, 4}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K1, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, len(CODE_K1))
    c0, c1 = spalte(CODE_K1[2], "geraten != 5"); e0, e1 = spalte(CODE_K1[2], "versuche < 3"); u0, u1 = spalte(CODE_K1[2], "and")
    E(f, t, a(1, pos(2, 1, "geraten ungleich")), lambda d, dy: code_markiere(d, g(dy), 2, c0, c1, BLUE), tout=t_a)
    E(f, t, a(1, pos(2, 1, "versuche kleiner")), lambda d, dy: code_markiere(d, g(dy), 2, e0, e1, GREEN), tout=t_a)
    E(f, t, a(1, pos(2, 1, "änd")), lambda d, dy: code_markiere(d, g(dy), 2, u0, u1, RED, 4), tout=t_a)
    E(f, t, a(0, pos(2, 0, "bis der Tipp")), lambda d, dy: tag(d, 60, 440 + dy, 320, 52, "Grund 1: der Tipp stimmt", LIGHTB, BLUE, 24, 700, outl=BLUE), tout=None)
    E(f, t, a(0, pos(2, 0, "Nach drei")), lambda d, dy: tag(d, 400, 440 + dy, 320, 52, "Grund 2: 3 Versuche vorbei", LIGHTG, GREEN, 24, 700, outl=GREEN))
    # die zwei Laeufe
    zl_a = lauf_zeilen(LAUF_K1A, [(a(2, 0.05 + 0.12 * k), a(2, 0.09 + 0.12 * k)) for k in range(4)], ["1", "2", "3"], 6)
    zl_b = lauf_zeilen(LAUF_K1B, [(t_b + 0.1, t_b + 0.6), (t_b + 1.2, None)], ["5"], 6)
    E(f, t, a(2, 0.0), lambda d, dy: lauf_panel(d, 760, 116 + dy, 460, zl_a, t, 24, 40, "Lauf mit 1, 2, 3"), tout=t_b)
    E(f, t, t_b, lambda d, dy: lauf_panel(d, 760, 116 + dy, 460, zl_b, t, 24, 40, "Lauf mit 5"))
    E(f, t, a(2, pos(2, 2, "Dann ist")), lambda d, dy: tag(d, 760, 352 + dy, 460, 52, "3 Versuche: Schleife endet", LIGHTG, GREEN, 24, 700, outl=GREEN), tout=t_b)
    E(f, t, t_b + 1.0, lambda d, dy: tag(d, 760, 280 + dy, 460, 52, "Tipp stimmt: nach 1 Versuch", LIGHTB, BLUE, 24, 700, outl=BLUE))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 560 + dy, 1160, 64, "and: beide Bedingungen müssen stimmen", RED, WHITE, 38))


# ---------------------------------------------------------------- 3 Karte 2: Text einlesen
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Karte 2: Text einlesen")
    x, y, w, size, lh = 60, 116, 760, 24, 42
    tm = [a(0, 0.3), a(1, 0.0), a(1, 0.5), a(1, 0.7)]
    aktiv = aktuell(t, [(a(1, 0.0), {0}), (a(1, 0.5), {1}), (a(2, 0.0), {1, 2, 3}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K2, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, len(CODE_K2))
    j0, j1 = spalte(CODE_K2[0], '"ja"')
    E(f, t, a(1, pos(3, 1, "beginnt")), lambda d, dy: code_markiere(d, g(dy), 0, j0, j1, BLUE))
    E(f, t, a(1, pos(3, 1, "Die Schleife läuft")), lambda d, dy: code_markiere(d, g(dy), 1, *spalte(CODE_K2[1], 'weiter == "ja"'), RED))
    E(f, t, a(0, pos(3, 0, "Ein Tipp")), lambda d, dy: zeilen_notiz(d, g(dy), 3, 860, 360, "Text, kein int", LIGHTA, AMB, size=22, h=36, outl=AMB))
    # Lauf: drei Runden
    zeitl = [(a(2, 0.02), None), (a(2, 0.2), a(2, 0.3)), (a(2, 0.4), None), (a(2, 0.55), a(2, 0.62)), (a(2, 0.7), None), (a(2, 0.8), a(2, 0.88))]
    zl = lauf_zeilen(LAUF_K2, zeitl, ["ja", "ja", "nein"], 0)
    E(f, t, a(2, 0.0), lambda d, dy: lauf_panel(d, 60, 372 + dy, 720, zl, t, 24, 36, "Programmlauf"))
    E(f, t, a(2, pos(3, 2, "Dreimal")), lambda d, dy: tag(d, 840, 420 + dy, 380, 56, "dreimal Runde", LIGHTG, GREEN, 30, 700, outl=GREEN))
    E(f, t, a(2, pos(3, 2, "beim Wort nein")), lambda d, dy: tag(d, 840, 500 + dy, 380, 56, "bei nein: Schluss", LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 840, 580 + dy, 380, 64, "Text mit Text vergleichen", RED, WHITE, 26))


# ---------------------------------------------------------------- 4 Karte 3: die Mitte
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 3: die Mitte")
    x, y, w, size, lh = 60, 116, 640, 26, 46
    tm = [a(0, 0.3), a(1, 0.0), a(2, 0.0)]
    aktiv = aktuell(t, [(a(1, 0.0), {0}), (a(2, 0.0), {1, 2}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K3, t, size, lh, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(x, y + dy, w, size, lh, 3)
    zl = [(a(1, 0.8), "50", None, None), (a(2, 0.3), "75", None, None), (a(2, 0.7), "3", None, None)]
    E(f, t, a(1, 0.6), lambda d, dy: lauf_panel(d, 60, 340 + dy, 640, zl, t, 28, 44, "Ausgabe"))
    NX, NW = 740, 480
    rech = [("(1 + 100) / 2 = 50.5, int: 50", a(1, pos(4, 1, "Die Mitte")), LIGHTB, BLUE), ("(51 + 100) / 2 = 75.5, int: 75", a(2, 0.0), LIGHTG, GREEN), ("(3 + 4) / 2 = 3.5, int: 3", a(2, pos(4, 2, "mit drei und vier")), LIGHTA, AMB)]
    for k, (txt, tin, fill, col) in enumerate(rech):
        E(f, t, tin, lambda d, dy, k=k, txt=txt, fill=fill, col=col: zeilen_notiz(d, g(dy), k, NX, NW, txt, fill, col, size=22, h=36, outl=col))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 560 + dy, 1160, 64, "Schrägstrich: Kommazahl, int: abschneiden", RED, WHITE, 36))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4}
assert len(SRC) == len(SCENES) == 4


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 10 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "Mehr als ein Grund zum Aufhören", F(34, 400), GREY)
        for k, wort in enumerate(("and", "input", "int")):
            chip(d, 90 + k * 230, 470, 215, 70, wort, BOX, CODE_K, 32, outl=BOX, mono=True)
        code_n(d, 700, 150, 520, CODE_K1, [1, 2, 3, 4, 5, 6], [-1] * 6, 0, 22, 44)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
