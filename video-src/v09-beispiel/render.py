"""Termin 09, Video 3: Vorgerechnet: Getraenkeautomat zerlegen (das lange Programm, Aufgaben in Worten, was wird eine Funktion, Hauptplan mit zwei
Unterprogrammen, Plaene der Funktionen, Code, Probe mit 1 und 3 in beiden Fassungen, Auftrag zu Hause ohne Verraten des Ergebnisses).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der zerlegte Code muss zeichengleich mit der Seite sein (app/inhalte/v09/labor/w-vorgemacht.vorlage.py), das lange Programm mit labor.mdx."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v09-beispiel"; LABEL = "DHBW · Informatik · Termin 09 · Vorgerechnet: Getränkeautomat zerlegen"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echter Programmlauf
LANG = ["# Getränkeautomat: 1 = Cola, 2 = Wasser, 3 = Saft",
        'wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))',
        'geld = float(input("Geld in Euro: "))',
        "if wahl == 1:", "    preis = 2.5", "elif wahl == 2:", "    preis = 1.0", "else:", "    preis = 2.0",
        "if geld >= preis:", "    rest = geld - preis", '    print(f"Bitte sehr. Wechselgeld: {rest:.2f} Euro")',
        "else:", "    fehlt = preis - geld", '    print(f"Es fehlen {fehlt:.2f} Euro")']
ZERL = ["# Getränkeautomat: 1 = Cola, 2 = Wasser, 3 = Saft",
        "def preis_von(nr):", "    if nr == 1:", "        return 2.5", "    elif nr == 2:", "        return 1.0", "    else:", "        return 2.0", "",
        "def antwort(geld, preis):", "    if geld >= preis:", "        rest = geld - preis", '        return f"Bitte sehr. Wechselgeld: {rest:.2f} Euro"',
        "    else:", "        fehlt = preis - geld", '        return f"Es fehlen {fehlt:.2f} Euro"', "",
        'wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))', 'geld = float(input("Geld in Euro: "))', "preis = preis_von(wahl)", "print(antwort(geld, preis))"]
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v09", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE) and open(_SEITE, encoding="utf-8").read().splitlines() != ZERL:
    raise AssertionError("Code weicht von app/inhalte/v09/labor/w-vorgemacht.vorlage.py ab")
assert len(LANG) - 1 == 14 and len(ZERL) == 21
Q_LANG, Q_ZERL = NL.join(LANG), NL.join(ZERL)
for _ein, _erg in ((["1", "3"], "Bitte sehr. Wechselgeld: 0.50 Euro"), (["3", "1.5"], "Es fehlen 0.50 Euro"), (["2", "1"], "Bitte sehr. Wechselgeld: 0.00 Euro")):
    _a, _b = run(Q_LANG, _ein), run(Q_ZERL, _ein)
    assert _a == _b and _a[-1] == _erg and len(_a) == 3, (_ein, _a, _b)
LAUF_L = run(Q_LANG, ["1", "3"]); LAUF_Z = run(Q_ZERL, ["1", "3"])
assert LAUF_L == LAUF_Z == ["Getränk (1 Cola, 2 Wasser, 3 Saft): 1", "Geld in Euro: 3", "Bitte sehr. Wechselgeld: 0.50 Euro"], LAUF_L
assert 3 - 2.5 == 0.5
# der Auftrag (Ergebnis wird im Video nicht gezeigt): Cola auf 3.0 aendert nur preis_von, das Hauptprogramm bleibt
_NEU = Q_ZERL.replace("        return 2.5", "        return 3.0")
assert _NEU != Q_ZERL and run(_NEU, ["1", "3"])[-1] == "Bitte sehr. Wechselgeld: 0.00 Euro"
assert [z for z in ZERL[17:]] == [z for z in _NEU.split(NL)[17:]]


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- Plaene
HAUPT = plan_zweig([("s", "term", "Start"), ("e1", "io", "Eingabe: wahl"), ("e2", "io", "Eingabe: geld"),
                    ("u1", "sub", "preis = preis_von(wahl)"), ("u2", "sub", "text = antwort(geld, preis)"),
                    ("o", "io", "Ausgabe: text"), ("end", "term", "Ende")], fs=20, gap=24)
PREIS = plan_zweig([("fs", "term", "preis_von(nr)"),
                    ("d1", "dec", "nr == 1?", [("p1", "proc", "preis = 2.5")],
                     [("d2", "dec", "nr == 2?", [("p2", "proc", "preis = 1.0")], [("p3", "proc", "preis = 2.0")])]),
                    ("r", "term", "Rückgabe: preis")], fs=20, gap=24)
ANTW = plan_zweig([("fs", "term", "antwort(geld, preis)"),
                   ("d", "dec", "geld >= preis?", [("a1", "proc", "rest = geld - preis"), ("a2", "proc", 'text = "Bitte sehr…"')],
                    [("b1", "proc", "fehlt = preis - geld"), ("b2", "proc", 'text = "Es fehlen…"')]),
                   ("r", "term", "Rückgabe: text")], fs=20, gap=24)
assert HAUPT.reihenfolge[:3] == ["s", "s-e1", "e1"], HAUPT.reihenfolge


def zeiten_plan(D, tn):
    """Einblendzeit je Schluessel: Symbole nach tn (sonst gleich dem vorigen Symbol), Kanten kurz vor ihrem Ziel."""
    tm = {}; last = 0.0
    for k in D.reihenfolge:
        if "-" in k and k not in D.nodes:
            ziel = k.split("-")[1]
            tm[k] = tn.get(ziel, last) - 0.2 if ziel in tn else last
        else:
            last = tn.get(k, last); tm[k] = last
    return tm


# ---------------------------------------------------------------- 1 Die Aufgabe
CX1, CY1, CW1, CS1, CLH1 = 60, 104, 800, 20, 34
G1 = CodeGeo(CX1, CY1, CW1, CS1, CLH1, len(LANG)); assert CY1 + G1.h <= 690, G1.h


def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Getränkeautomat")
    E(f, t, 0.1, lambda d, dy: code_lauf(d, CX1, CY1 + dy, CW1, LANG, t, CS1, CLH1, title="Python: langes Programm"))
    E(f, t, a(0, pos(1, 0, "Das Programm hat")), lambda d, dy: tag(d, 900, 120 + dy, 320, 56, "14 Zeilen hintereinander", LIGHTA, AMB, 24, 700, outl=AMB))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 900, 200 + dy, 320, 72, "zerlegen: gleiche Ausgabe", LIGHTK, DARK, 24, 700, outl=LINE))
    schritte = [("Eingabe lesen", a(2, pos(1, 2, "Getränk"))), ("Preis bestimmen", a(2, pos(1, 2, "Den Preis"))),
                ("Antwort bilden", a(2, pos(1, 2, "Die Antwort"))), ("ausgeben", a(2, pos(1, 2, "Ausgeben")))]
    for j, (txt, tin) in enumerate(schritte):
        def schritt(d, dy, j=j, txt=txt):
            y = 360 + j * 70 + dy
            num_circle(d, 930, y, 22, j + 1, RED); TB(d, 972, y, txt, F(28, 600), DARK, 250, "lm", "Schritt")
        E(f, t, tin, schritt)
    E(f, t, a(2, 0.0), lambda d, dy: TB(d, 900, 316 + dy, "Der Ablauf in Worten", F(26, 700), GREY, 320, "lm", "Titel"))


# ---------------------------------------------------------------- 2 Was wird eine Funktion
def klammer(d, g, i0, i1, x, col, fill, text):
    """Senkrechte Klammer rechts neben dem Code (Zeilen i0..i1) mit Etikett."""
    y0, y1 = g.zy(i0) - 4, g.zy(i1) + g.lh - 8
    d.rounded_rectangle((x, y0, x + 12, y1), 6, fill=col)
    ym = (y0 + y1) / 2
    tag(d, x + 28, ym - 28, 290, 56, text, fill, col, 24, 700, outl=col)


def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Was wird eine Funktion?")
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX1, CY1 + dy, CW1, LANG, t, CS1, CLH1, title="Python: langes Programm"))
    g = lambda dy: CodeGeo(CX1, CY1 + dy, CW1, CS1, CLH1, len(LANG))
    X = CX1 + CW1 + 22
    E(f, t, a(1, 0.0), lambda d, dy: klammer(d, g(dy), 3, 8, X, AMB, LIGHTA, "preis_von(nr)"))
    E(f, t, a(1, pos(2, 1, "Es geht")), lambda d, dy: TB(d, X + 28, g(dy).zy(8) + 40, "Nummer hinein, Preis heraus", F(22, 600), GREY, 300, "lm", "Beschriftung"))
    E(f, t, a(2, 0.0), lambda d, dy: klammer(d, g(dy), 9, 14, X, GREEN, LIGHTG, "antwort(geld, preis)"))
    E(f, t, a(2, pos(2, 2, "Es gehen")), lambda d, dy: TB(d, X + 28, g(dy).zy(14) + 40, "Geld und Preis hinein, Text heraus", F(22, 600), GREY, 330, "lm", "Beschriftung"))
    E(f, t, a(3, 0.0), lambda d, dy: (klammer(d, g(dy), 1, 2, X, BLUE, LIGHTB, "bleibt: Eingaben"),
                                      TB(d, X + 28, g(dy).zy(2) + 40, "und die Ausgabe", F(22, 600), GREY, 300, "lm", "Beschriftung")))


# ---------------------------------------------------------------- 3 Der Hauptplan
PB1 = (60, 104, 500, 580)


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Der Hauptplan")
    tn = {"s": a(0, 0.02), "e1": a(0, pos(3, 0, "liest")), "e2": a(0, pos(3, 0, "und geld")), "u1": a(1, pos(3, 1, "Das erste")),
          "u2": a(1, pos(3, 1, "das zweite")), "o": a(2, 0.0), "end": a(2, pos(3, 2, "Er zeigt"))}
    tmh = zeiten_plan(HAUPT, tn)
    schedh = [(tn["e1"], ["s-e1", "e1"]), (tn["e2"], ["e1-e2", "e2"]), (tn["u1"], ["e2-u1", "u1"]), (tn["u2"], ["u1-u2", "u2"]), (tn["o"], ["u2-o", "o"]), (tn["end"], [])]
    zh, camh = plan_draw(f, 1.0, HAUPT, PB1, vis=reveal(t, tmh), hl={k: RED for k in (aktuell(t, schedh) or [])})
    yy = lambda k: plan_xy(PB1, zh, camh, 0, HAUPT.nodes[k].cy)[1]
    X = PB1[0] + PB1[2] + 30
    E(f, t, tn["e2"], lambda d, dy: tag(d, X, (yy("e1") + yy("e2")) / 2 - 28 + dy, 330, 56, "zwei Eingaben", LIGHTB, BLUE, 26, 700, outl=BLUE), tout=tn["u1"])
    E(f, t, tn["u1"], lambda d, dy: tag(d, X, yy("u1") - 28 + dy, 420, 56, "ruft preis_von auf", LIGHTA, AMB, 26, 700, outl=AMB))
    E(f, t, tn["u2"], lambda d, dy: tag(d, X, yy("u2") - 28 + dy, 420, 56, "ruft antwort auf", LIGHTA, AMB, 26, 700, outl=AMB))
    E(f, t, tn["o"], lambda d, dy: tag(d, X, yy("o") - 28 + dy, 330, 56, "gibt den Text aus", LIGHTG, GREEN, 26, 700, outl=GREEN))
    E(f, t, tn["end"], lambda d, dy: tag(d, X, 500 + dy, 600, 56, "Hauptplan: was passiert, nicht wie", RED, WHITE, 30))
    E(f, t, tn["end"] + 1.5, lambda d, dy: tag(d, X, 580 + dy, 600, 56, "das Wie steht in den Funktionsplänen", LIGHTK, DARK, 26, 700, outl=LINE))


# ---------------------------------------------------------------- 4 Die Plaene der Funktionen
PB2 = (40, 120, 560, 560)
PB3 = (660, 120, 580, 560)


def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Pläne der Funktionen")
    t1, t2 = a(1, 0.0), a(2, 0.0)
    # preis_von: Schluessel in Reihenfolge, gleichmaessig ueber den Satz verteilt
    def verteilt(D, t0, t1_):
        n = len(D.reihenfolge); return {k: t0 + (t1_ - t0) * i / max(1, n - 1) for i, k in enumerate(D.reihenfolge)}
    tmp = verteilt(PREIS, a(0, pos(4, 0, "Im Start")), a(1, 0.97))
    tma = verteilt(ANTW, t2, a(2, 0.97))
    tmp["fs"] = a(0, 0.02)
    zp, cp = plan_draw(f, 1.0, PREIS, PB2, vis=reveal(t, tmp))
    za, ca = plan_draw(f, 1.0, ANTW, PB3, vis=reveal(t, tma))
    E(f, t, a(0, 0.02), lambda d, dy: tag(d, PB2[0], 104 + dy, 330, 44, "Funktion preis_von", LIGHTA, AMB, 24, 700, outl=AMB))
    E(f, t, t2, lambda d, dy: tag(d, PB3[0], 104 + dy, 330, 44, "Funktion antwort", LIGHTG, GREEN, 24, 700, outl=GREEN))
    E(f, t, a(1, pos(4, 1, "Am Ende")), lambda d, dy: tag(d, PB2[0], 640 + dy, 330, 40, "Rückgabe: preis", LIGHTR, RED, 24, 700, outl=RED))
    E(f, t, a(2, pos(4, 2, "Am Ende")), lambda d, dy: tag(d, PB3[0], 640 + dy, 330, 40, "Rückgabe: text", LIGHTR, RED, 24, 700, outl=RED))


# ---------------------------------------------------------------- 5 Der Code der Funktionen
CX5, CY5, CW5, CS5, CLH5 = 60, 104, 880, 22, 30
N5 = 16
assert CY5 + CodeGeo(CX5, CY5, CW5, CS5, CLH5, N5).h <= 690


def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Der Code: erst die Funktionen")
    t0 = a(0, 0.05); t_p = a(0, pos(5, 0, "Zuerst")); t_a = a(1, 0.0)
    tm = [t0, t0 + 0.2, t0 + 0.8, t0 + 1.4, t0 + 2.0, t0 + 2.6, t0 + 3.2, t0 + 3.8, t0 + 4.2,
          t_a, t_a + 0.6, t_a + 1.2, t_a + 1.8, t_a + 2.4, t_a + 3.0, t_a + 3.6]
    aktiv = aktuell(t, [(a(1, pos(5, 1, "gibt mit")), {3}), (a(1, pos(5, 1, "den Text")), {12}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX5, CY5 + dy, CW5, ZERL[:N5], t, CS5, CLH5, times=tm, aktiv=aktiv))
    g = lambda dy: CodeGeo(CX5, CY5 + dy, CW5, CS5, CLH5, N5)
    NX, NW = 960, 270
    E(f, t, a(0, pos(5, 0, "Zuerst")), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "Kopf: preis_von", LIGHTA, AMB, size=22, h=36, outl=AMB), tout=a(2, 0.0))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 9, NX, NW, "Kopf: antwort", LIGHTG, GREEN, size=22, h=36, outl=GREEN), tout=a(2, 0.0))
    E(f, t, a(1, pos(5, 1, "Im Code")), lambda d, dy: (code_markiere(d, g(dy), 3, *spalte(ZERL[3], "return"), RED), code_markiere(d, g(dy), 5, *spalte(ZERL[5], "return"), RED),
                                                       code_markiere(d, g(dy), 7, *spalte(ZERL[7], "return"), RED), code_markiere(d, g(dy), 12, *spalte(ZERL[12], "return"), RED),
                                                       code_markiere(d, g(dy), 15, *spalte(ZERL[15], "return"), RED)), tout=a(2, 0.0))
    E(f, t, a(1, pos(5, 1, "Im Code")), lambda d, dy: tag(d, NX, 520 + dy, NW, 56, "return in jedem Zweig", LIGHTR, RED, 22, 700, outl=RED), tout=a(2, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, NX, 300 + dy, NW, 100, "nur neue Stelle", LIGHTK, DARK, 24, 700, outl=LINE))


# ---------------------------------------------------------------- 6 Das Hauptprogramm
CX6, CY6, CW6, CS6, CLH6 = 60, 330, 860, 22, 38


def sc6(f, t, ct):
    a = lambda k, fr=0.0: AT[6](ct, k, fr)
    kopf(f, t, "Das Hauptprogramm")
    E(f, t, 0.0, lambda d, dy: (chip(d, 60, 130 + dy, 540, 70, "def preis_von(nr): …", BOX, CODE_K, 26, outl=BOX, mono=True),
                                chip(d, 640, 130 + dy, 580, 70, "def antwort(geld, preis): …", BOX, CODE_K, 26, outl=BOX, mono=True)))
    E(f, t, 0.1, lambda d, dy: TB(d, 640, 240 + dy, "die Funktionen stehen darüber", F(24, 600), GREY, 600, "mm", "Beschriftung"))
    HP = ZERL[17:]
    t_c = a(0, 0.15)
    tm = [t_c, t_c + 0.8, t_c + 1.6, t_c + 2.4]
    aktiv = aktuell(t, [(a(1, 0.0), {0, 1}), (a(1, pos(6, 1, "der Aufruf")), {2}), (a(1, pos(6, 1, "die Ausgabe")), {3}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX6, CY6 + dy, CW6, HP, t, CS6, CLH6, times=tm, aktiv=aktiv, nums=[18, 19, 20, 21], title="Hauptprogramm"))
    g = lambda dy: CodeGeo(CX6, CY6 + dy, CW6, CS6, CLH6, 4)
    NX, NW = 940, 290
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 0, NX, NW, "Eingabe: wahl", LIGHTB, BLUE, size=22, h=36, outl=BLUE))
    E(f, t, a(1, 0.0), lambda d, dy: zeilen_notiz(d, g(dy), 1, NX, NW, "Eingabe: geld", LIGHTB, BLUE, size=22, h=36, outl=BLUE))
    E(f, t, a(1, pos(6, 1, "der Aufruf")), lambda d, dy: zeilen_notiz(d, g(dy), 2, NX, NW, "ruft preis_von auf", LIGHTA, AMB, size=22, h=36, outl=AMB))
    E(f, t, a(1, pos(6, 1, "die Ausgabe")), lambda d, dy: zeilen_notiz(d, g(dy), 3, NX, NW, "ruft antwort auf, gibt aus", LIGHTG, GREEN, size=22, h=36, outl=GREEN))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 580 + dy, 860, 60, "Funktionen stehen vor dem Aufruf", RED, WHITE, 34))


# ---------------------------------------------------------------- 7 Die Probe
def sc7(f, t, ct):
    a = lambda k, fr=0.0: AT[7](ct, k, fr)
    kopf(f, t, "Die Probe: Eingabe 1 und 3")
    t_e = a(0, 0.1); t_r = a(1, 0.0)
    E(f, t, t_e, lambda d, dy: (tag(d, 60, 130 + dy, 560, 52, "langes Programm", LIGHTK, DARK, 26, 700, outl=LINE),
                                tag(d, 660, 130 + dy, 560, 52, "zerlegtes Programm", LIGHTA, AMB, 26, 700, outl=AMB)))
    for x, lauf, dt in ((60, LAUF_L, 0.0), (660, LAUF_Z, 0.5)):
        zl = [(t_e + dt, lauf[0][:-1], t_e + dt + 0.3, "1"), (t_e + dt + 1.0, lauf[1][:-1], t_e + dt + 1.3, "3"), (t_r + dt, lauf[2], None, None)]
        E(f, t, t_e + dt, lambda d, dy, x=x, zl=zl: lauf_panel(d, x, 200 + dy, 560, zl, t, 20, 40, "Programmlauf"))
    E(f, t, a(1, pos(7, 1, "Die Cola")), lambda d, dy: (chip(d, 60, 440 + dy, 240, 64, "Cola: 2.5", LIGHTA, AMB, 28, outl=AMB),
                                                       chip(d, 330, 440 + dy, 240, 64, "3 − 2.5 = 0.5", LIGHTK, DARK, 28, outl=LINE)))
    E(f, t, a(1, pos(7, 1, "Beide")), lambda d, dy: tag(d, 660, 440 + dy, 560, 64, "dieselbe Ausgabe", GREEN, WHITE, 34))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 560 + dy, 1160, 64, "Zerlegen ändert nur, wo etwas steht", RED, WHITE, 36))


# ---------------------------------------------------------------- 8 Auftrag zu Hause
def sc8(f, t, ct):
    a = lambda k, fr=0.0: AT[8](ct, k, fr)
    kopf(f, t, "Jetzt du: den Preis der Cola ändern")
    N = 9
    aktiv = aktuell(t, [(a(0, pos(8, 0, "Ändere")), {3}), (a(1, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, 60, 112 + dy, 860, ZERL[:N], t, 22, 34, aktiv=aktiv, title="preis_von"))
    g = lambda dy: CodeGeo(60, 112 + dy, 860, 22, 34, N)
    E(f, t, a(0, pos(8, 0, "Ändere")), lambda d, dy: (code_markiere(d, g(dy), 3, *spalte(ZERL[3], "2.5"), RED),
                                                     zeilen_notiz(d, g(dy), 3, 960, 270, "hier: 3.0 statt 2.5", LIGHTR, RED, size=22, h=36, outl=RED)))
    E(f, t, a(0, pos(8, 0, "und lass")), lambda d, dy: tag(d, 60, 460 + dy, 860, 56, "dann das Programm mit 1 und 3 laufen lassen", LIGHTK, DARK, 28, 700, outl=LINE))
    for k, (txt, tin) in enumerate((("1 Vermuten", a(1, 0.0)), ("2 Ausprobieren", a(1, pos(8, 1, "Probiere"))), ("3 Auflösung lesen", a(2, 0.0)))):
        E(f, t, tin, lambda d, dy, k=k, txt=txt: tag(d, 60 + k * 300, 560 + dy, 280, 60, txt, LIGHTK, DARK, 26, 700, outl=LINE))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 60, 640 + dy, 860, 40, "Wo musst du etwas ändern, wo nicht?", LIGHTR, RED, 24, 700, outl=RED))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7, 8: sc8}
assert len(SRC) == 8 == len(SCENES)


def poster(path):
    f = Frame()

    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 09 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet:", F(58, 700), DARK)
        T2(d, 90, 170, "Getränkeautomat", F(58, 700), DARK)
        T2(d, 90, 280, "Ein Programm zerlegen", F(44, 700), DARK)
        T2(d, 90, 350, "def preis_von(nr):", M(30, True), RED)
        T2(d, 90, 396, "def antwort(geld, preis):", M(30, True), RED)
        T2(d, 90, 500, "Hauptplan und", F(32, 600), GREY)
        T2(d, 90, 542, "Pläne der Funktionen", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        chip(d, 90, 610, 340, 64, "14 Zeilen → 4 Zeilen", BOX, CODE_K, 28, outl=BOX, mono=True)
    f.el(1, fn)
    plan_draw(f, 1.0, HAUPT, (780, 60, 440, 620))
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
