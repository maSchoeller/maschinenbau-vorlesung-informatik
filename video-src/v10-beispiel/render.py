"""Termin 10, Video 3: Dein Spiel Schritt für Schritt (Tipp mit Hinweis, Schleife, die Falle mit der Zufallszahl, Zähler, Funktion spiel(),
ein Lauf des fertigen Spiels mit Versuche-Zahl am Ende).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der fertige Code (Stufe 4) muss zeichengleich mit der Musterlösung der Station 5 im Zuschnitt sein
(briefing/termin-10-zuschnitt.md, Abschnitt F, Station 5) und mit der vorgerechneten Seite, sobald es sie gibt
(app/inhalte/v10/labor/w-vorgemacht.vorlage.py)."""
import os, sys, math, io, contextlib, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v10-beispiel"; LABEL = "DHBW · Informatik · Termin 10 · Dein Spiel Schritt für Schritt"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie die Musterlösungen im Zuschnitt)
KOPF = ["import random", "",
        "def hinweis(geraten, geheim):", "    if geraten < geheim:", '        return "Zu klein"', "    elif geraten > geheim:",
        '        return "Zu groß"', "    else:", '        return "Richtig!"', ""]
EING = '    geraten = int(input("Dein Tipp (1 bis 100): "))'
ZIEHEN = "geheim = random.randint(1, 100)"
A_MAIN = [ZIEHEN, 'geraten = int(input("Dein Tipp (1 bis 100): "))', "print(hinweis(geraten, geheim))"]
B_MAIN = [ZIEHEN, "geraten = 0", "while geraten != geheim:", EING, "    print(hinweis(geraten, geheim))"]
FALLE = [ZIEHEN, "geraten = 0", "while geraten != geheim:", "    " + ZIEHEN, EING, "    print(hinweis(geraten, geheim))"]
C_MAIN = [ZIEHEN, "geraten = 0", "versuche = 0", "while geraten != geheim:", EING, "    versuche = versuche + 1",
          "    print(hinweis(geraten, geheim))", 'print(f"Versuche: {versuche}")']
D_MAIN = ["def spiel():", "    geheim = random.randint(1, 100)", "    geraten = 0", "    versuche = 0", "    while geraten != geheim:",
          "    " + EING, "        versuche = versuche + 1", "        print(hinweis(geraten, geheim))", "    return versuche", "",
          "anzahl = spiel()", 'print(f"Versuche: {anzahl}")']
KOPFZ = NL.join(KOPF)
CODE_A = KOPFZ + NL + NL.join(A_MAIN)
CODE_B = KOPFZ + NL + NL.join(B_MAIN)
CODE_FALLE = KOPFZ + NL + NL.join(FALLE)
CODE_C = KOPFZ + NL + NL.join(C_MAIN)
CODE_D = KOPFZ + NL + NL.join(D_MAIN)
# Die Musterloesung der Stufe 4 aus dem Zuschnitt, Zeile fuer Zeile
MUSTER4 = ['import random', '', 'def hinweis(geraten, geheim):', '    if geraten < geheim:', '        return "Zu klein"', '    elif geraten > geheim:',
           '        return "Zu groß"', '    else:', '        return "Richtig!"', '', 'def spiel():', '    geheim = random.randint(1, 100)',
           '    geraten = 0', '    versuche = 0', '    while geraten != geheim:', '        geraten = int(input("Dein Tipp (1 bis 100): "))',
           '        versuche = versuche + 1', '        print(hinweis(geraten, geheim))', '    return versuche', '', 'anzahl = spiel()',
           'print(f"Versuche: {anzahl}")']
assert CODE_D.splitlines() == MUSTER4, "Code weicht von der Musterloesung der Stufe 4 ab"
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v10", "labor", "w-vorgemacht.vorlage.py")
SEITE_GLEICH = None
if os.path.exists(_SEITE):
    SEITE_GLEICH = open(_SEITE, encoding="utf-8").read().splitlines() == MUSTER4
    if not SEITE_GLEICH:
        print("HINWEIS: w-vorgemacht.vorlage.py weicht vom Videocode (Musterloesung Stufe 4) ab", file=sys.stderr)


def spiellauf(code, werte, eingaben):
    """Fuehrt das Spiel mit festem Zufall und festen Eingaben aus. Gibt (Zeilen, Aufrufe von randint, Fehlername oder None) zurueck."""
    buf = io.StringIO(); feed = iter(eingaben); aufrufe = []; zufall = iter(werte)
    def fake_input(p=""):
        v = next(feed); print(p + v); return v
    def fake_randint(a, b):
        aufrufe.append((a, b)); return next(zufall)
    orig = random.randint; random.randint = fake_randint; fehler = None
    try:
        with contextlib.redirect_stdout(buf): exec(code, {"input": fake_input})
    except Exception as e:
        fehler = type(e).__name__
    finally:
        random.randint = orig
    return buf.getvalue().splitlines(), aufrufe, fehler


P = "Dein Tipp (1 bis 100): "
LAUF_A, AUF_A, FEH_A = spiellauf(CODE_A, [30], ["50"])
assert LAUF_A == [P + "50", "Zu groß"] and AUF_A == [(1, 100)] and FEH_A is None, LAUF_A
LAUF_B, AUF_B, FEH_B = spiellauf(CODE_B, [30], ["50", "20", "30"])
assert LAUF_B == [P + "50", "Zu groß", P + "20", "Zu klein", P + "30", "Richtig!"] and AUF_B == [(1, 100)] and FEH_B is None, LAUF_B
LAUF_F, AUF_F, FEH_F = spiellauf(CODE_FALLE, [30, 99, 5, 5, 5, 5], ["50", "20", "30"])
assert [z for z in LAUF_F if not z.startswith(P)] == ["Zu klein", "Zu groß", "Zu groß"] and FEH_F == "StopIteration" and len(AUF_F) > 1, (LAUF_F, FEH_F)
assert "Richtig!" not in LAUF_F
LAUF_C, AUF_C, FEH_C = spiellauf(CODE_C, [30], ["50", "20", "30"])
LAUF_D, AUF_D, FEH_D = spiellauf(CODE_D, [30], ["50", "20", "30"])
SOLL = [P + "50", "Zu groß", P + "20", "Zu klein", P + "30", "Richtig!", "Versuche: 3"]
assert LAUF_C == SOLL and LAUF_D == SOLL and AUF_C == AUF_D == [(1, 100)] and FEH_C is None and FEH_D is None, (LAUF_C, LAUF_D)
# Grenzfaelle der fertigen Stufe 4 (wie die Tests im Zuschnitt)
assert spiellauf(CODE_D, [30], ["30"])[0] == [P + "30", "Richtig!", "Versuche: 1"]
assert spiellauf(CODE_D, [1], ["100", "1"])[0][-1] == "Versuche: 2"
assert spiellauf(CODE_D, [7], ["50", "25", "12", "6", "9", "8", "7"])[0][-1] == "Versuche: 7"


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


def lauf_zeilen(lauf, zeiten_, eingaben):
    """Zeilen fuer lauf_panel: Aufforderungen mit getippter Antwort, Ausgaben als reine Zeilen. zeiten_: je Zeile (Start, Antwortzeit)."""
    out = []; it = iter(eingaben)
    for ln, (t0, t1) in zip(lauf, zeiten_):
        if ln.startswith(P):
            ant = next(it); assert ln.endswith(ant); out.append((t0, P, t1, ant))
        else:
            out.append((t0, ln, None, None))
    return out


CX, CY, CW, CS, CLH = 60, 176, 760, 20, 34
NX, NW = 860, 360


def kopfhinweis(f, t, tin):
    E(f, t, tin, lambda d, dy: tag(d, CX, 118 + dy, CW, 44, "darüber: import random und hinweis(geraten, geheim)", LIGHTK, GREY, 22, 700, outl=LINE))


def geo(dy, n): return CodeGeo(CX, CY + dy, CW, CS, CLH, n)


def codefenster(f, t, lines, tm, aktiv):
    n = len(lines)
    assert CY + code_h(n, CLH) <= 690, (n, CY + code_h(n, CLH))
    assert all(CodeGeo(CX, CY, CW, CS, CLH, n).cx(len(z)) + 16 <= CX + CW for z in lines)
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX, CY + dy, CW, lines, t, CS, CLH, times=tm, aktiv=aktiv))


# ---------------------------------------------------------------- 1 Der Tipp mit Hinweis
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Schritt 1: ein Tipp mit Hinweis")
    kopfhinweis(f, t, a(0, pos(1, 0, "steht schon")))
    tm = [a(1, pos(1, 1, "Zahl ziehen")), a(1, pos(1, 1, "Tipp einlesen")), a(1, pos(1, 1, "Hinweis"))]
    aktiv = aktuell(t, [(tm[0], {0}), (tm[1], {1}), (tm[2], {2}), (a(2, 0.0), None)])
    codefenster(f, t, A_MAIN, [x - 0.1 for x in tm], aktiv)
    for k, txt in enumerate(("Zahl ziehen", "Tipp einlesen", "Hinweis zeigen")):
        E(f, t, tm[k], lambda d, dy, k=k, txt=txt: zeilen_notiz(d, geo(dy, 3), k, NX, NW, txt, (LIGHTA, LIGHTB, LIGHTG)[k], (AMB, BLUE, GREEN)[k], size=22, h=36, outl=(AMB, BLUE, GREEN)[k]))
    zl = lauf_zeilen(LAUF_A, [(a(1, 0.8), a(1, 0.85)), (a(1, 0.95), None)], ["50"])
    E(f, t, a(1, 0.75), lambda d, dy: lauf_panel(d, CX, 330 + dy, 560, zl, t, 22, 36, "Ein Versuch"))
    E(f, t, a(1, pos(1, 1, "ein einziger")), lambda d, dy: tag(d, 660, 350 + dy, 560, 52, "ein einziger Versuch, dann ist Schluss", LIGHTK, DARK, 24, 700, outl=LINE))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 520 + dy, 1160, 64, "Es soll fragen, bis der Tipp stimmt", RED, WHITE, 38))


# ---------------------------------------------------------------- 2 Die Schleife
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Schritt 2: die Schleife")
    kopfhinweis(f, t, 0.1)
    n = len(B_MAIN)
    tm = [0.2, 0.4, a(0, 0.0), a(0, 0.25), a(0, 0.45)]
    aktiv = aktuell(t, [(a(0, pos(2, 0, "wiederholt")), {3, 4}), (a(1, 0.0), {1}), (a(2, 0.0), {0}), (a(2, 0.9), None)])
    codefenster(f, t, B_MAIN, tm, aktiv)
    c0, c1 = spalte(B_MAIN[2], "geraten != geheim")
    E(f, t, a(0, pos(2, 0, "solange")), lambda d, dy: code_markiere(d, geo(dy, n), 2, c0, c1, RED), tout=a(1, 0.0))
    E(f, t, a(0, pos(2, 0, "Aus dem Tipp")), lambda d, dy: (code_einrueckung(d, geo(dy, n), 3), code_einrueckung(d, geo(dy, n), 4)), tout=a(1, 0.0))
    E(f, t, a(0, pos(2, 0, "wiederholt")), lambda d, dy: zeilen_notiz(d, geo(dy, n), 3, NX, NW, "Rumpf: wird wiederholt", LIGHTA, AMB, size=22, h=36, outl=AMB), tout=a(1, 0.0))
    E(f, t, a(0, pos(2, 0, "solange")), lambda d, dy: zeilen_notiz(d, geo(dy, n), 2, NX, NW, "läuft, solange der Tipp falsch ist", LIGHTR, RED, size=22, h=36, outl=RED), tout=a(1, 0.0))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, geo(dy, n), 1, NX, NW, "Startwert, damit es losgeht", LIGHTB, BLUE, size=22, h=36, outl=BLUE))
    E(f, t, a(2, 0.0), lambda d, dy: zeilen_notiz(d, geo(dy, n), 0, NX, NW, "einmal ziehen, vor der Schleife", LIGHTG, GREEN, size=22, h=36, outl=GREEN))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 470 + dy, 1160, 64, "Zufallszahl: einmal, vor der Schleife", RED, WHITE, 38))


# ---------------------------------------------------------------- 3 Die Falle
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Die Falle: Zufallszahl in der Schleife")
    kopfhinweis(f, t, 0.1)
    n = len(FALLE)
    aktiv = aktuell(t, [(a(0, pos(3, 0, "Dann würfelt")), {3}), (a(1, pos(3, 1, "Die Zeile")), {0}), (a(1, 0.99), None)])
    codefenster(f, t, FALLE, [0.1, 0.2, 0.3, a(0, 0.05), a(0, 0.15), a(0, 0.25)], aktiv)
    E(f, t, a(0, 0.0), lambda d, dy: code_markiere(d, geo(dy, n), 3, 4, len(FALLE[3]), RED, 4))
    E(f, t, a(0, 0.0), lambda d, dy: zeilen_notiz(d, geo(dy, n), 3, NX, NW, "falsch: neue Zahl bei jedem Tipp", LIGHTR, RED, size=22, h=36, outl=RED))
    E(f, t, a(1, pos(3, 1, "Die Zeile")), lambda d, dy: zeilen_notiz(d, geo(dy, n), 0, NX, NW, "richtig: nur hier", LIGHTG, GREEN, size=22, h=36, outl=GREEN))
    zl = lauf_zeilen(LAUF_F, [(a(0, 0.5 + 0.08 * k), a(0, 0.54 + 0.08 * k)) for k in range(len(LAUF_F))], ["50", "20", "30"])
    E(f, t, a(0, 0.4), lambda d, dy: lauf_panel(d, CX, 462 + dy, 560, zl, t, 18, 26, "Tipps 50, 20, 30"))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 660, 500 + dy, 560, 52, "Die Zahl ändert sich, bevor du sie triffst", LIGHTA, AMB, 24, 700, outl=AMB))


# ---------------------------------------------------------------- 4 Der Zaehler
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Schritt 3: der Zähler")
    kopfhinweis(f, t, 0.1)
    n = len(C_MAIN)
    aktiv = aktuell(t, [(a(0, 0.0), {2}), (a(0, pos(4, 0, "In jeder")), {5}), (a(1, 0.0), {7}), (a(1, 0.99), None)])
    codefenster(f, t, C_MAIN, [0.1] * 8, aktiv)
    E(f, t, a(0, 0.0), lambda d, dy: (code_markiere(d, geo(dy, n), 2, 0, len(C_MAIN[2]), GREEN, 4), zeilen_notiz(d, geo(dy, n), 2, NX, NW, "Zähler beginnt bei 0", LIGHTG, GREEN, size=22, h=36, outl=GREEN)))
    E(f, t, a(0, pos(4, 0, "In jeder")), lambda d, dy: (code_markiere(d, geo(dy, n), 5, 4, len(C_MAIN[5]), RED, 4), zeilen_notiz(d, geo(dy, n), 5, NX, NW, "pro Runde plus 1", LIGHTR, RED, size=22, h=36, outl=RED)))
    E(f, t, a(1, 0.0), lambda d, dy: (code_markiere(d, geo(dy, n), 7, 0, len(C_MAIN[7]), BLUE, 4), zeilen_notiz(d, geo(dy, n), 7, NX, NW, "nach der Schleife: kein Einrücken", LIGHTB, BLUE, size=22, h=36, outl=BLUE)))
    E(f, t, a(1, pos(4, 1, "ohne Einrückung")), lambda d, dy: tag(d, 60, 540 + dy, 1160, 64, "print ohne Einrückung: erst nach dem Treffer", RED, WHITE, 36))


# ---------------------------------------------------------------- 5 Die Funktion spiel()
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Schritt 4: die Funktion spiel()")
    kopfhinweis(f, t, 0.1)
    n = len(D_MAIN)
    aktiv = aktuell(t, [(a(0, pos(5, 0, "Zum Schluss")), {0, 1, 2, 3, 4, 5, 6, 7}), (a(0, pos(5, 0, "Am Ende")), {8}), (a(1, 0.0), {10, 11}), (a(1, 0.99), None)])
    codefenster(f, t, D_MAIN, [0.1] * n, aktiv)
    E(f, t, a(0, pos(5, 0, "Zum Schluss")), lambda d, dy: zeilen_notiz(d, geo(dy, n), 0, NX, NW, "alles wandert in die Funktion", LIGHTA, AMB, size=22, h=36, outl=AMB))
    E(f, t, a(0, pos(5, 0, "Am Ende")), lambda d, dy: (code_markiere(d, geo(dy, n), 8, 4, len(D_MAIN[8]), RED, 4), zeilen_notiz(d, geo(dy, n), 8, NX, NW, "gibt die Zahl zurück", LIGHTR, RED, size=22, h=36, outl=RED)))
    E(f, t, a(1, 0.0), lambda d, dy: (code_markiere(d, geo(dy, n), 10, 0, len(D_MAIN[10]), BLUE, 4), zeilen_notiz(d, geo(dy, n), 10, NX, NW, "Hauptprogramm: der Aufruf", LIGHTB, BLUE, size=22, h=36, outl=BLUE)))
    E(f, t, a(1, pos(5, 1, "Dann zeigt")), lambda d, dy: zeilen_notiz(d, geo(dy, n), 11, NX, NW, "zeigt die Zahl an", LIGHTG, GREEN, size=22, h=36, outl=GREEN))


# ---------------------------------------------------------------- 6 Ein Lauf
def sc6(f, t, ct):
    a = lambda k, fr=0.0: AT[6](ct, k, fr)
    kopf(f, t, "Ein Lauf des fertigen Spiels")
    E(f, t, 0.1, lambda d, dy: tag(d, 60, 128 + dy, 720, 52, "geheime Zahl für diesen Lauf: 30", LIGHTK, DARK, 28, 700, outl=LINE))
    tz = [(a(0, pos(6, 0, "Du tippst fünfzig")), a(0, pos(6, 0, "Du tippst fünfzig")) + 0.5), (a(0, pos(6, 0, "das ist zu groß")), None),
          (a(0, pos(6, 0, "Dann zwanzig")), a(0, pos(6, 0, "Dann zwanzig")) + 0.5), (a(0, pos(6, 0, "das ist zu klein")), None),
          (a(0, pos(6, 0, "Dann dreißig")), a(0, pos(6, 0, "Dann dreißig")) + 0.5), (a(0, pos(6, 0, "Richtig da")), None), (a(1, 0.0), None)]
    zl = lauf_zeilen(LAUF_D, tz, ["50", "20", "30"])
    E(f, t, 0.2, lambda d, dy: lauf_panel(d, 60, 200 + dy, 720, zl, t, 28, 44, "Programmlauf"))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 60, 590 + dy, 720, 64, "Versuche: 3", RED, WHITE, 42))
    E(f, t, a(1, pos(6, 1, "Das ist dein")), lambda d, dy: tag(d, 840, 590 + dy, 380, 64, "Das ist dein Spiel", LIGHTG, GREEN, 30, 700, outl=GREEN))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}
assert len(SRC) == len(SCENES) == 6


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 10 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Dein Spiel", F(96, 700), DARK)
        T2(d, 90, 270, "Schritt für Schritt", F(70, 700), DARK)
        T2(d, 90, 380, "Zahlenraten: Schleife, Zähler, spiel()", F(34, 400), GREY)
        tag(d, 90, 600, 420, 70, "Versuche: 3", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        code_n(d, 640, 130, 580, D_MAIN[:5] + ["        ..."], list(range(1, 7)), [-1] * 6, 0, 22, 44)
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
