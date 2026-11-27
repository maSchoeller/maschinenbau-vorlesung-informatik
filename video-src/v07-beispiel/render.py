"""Termin 07, Video 3: Vorgerechnet: Fahrenheit (Aufgabe, Hauptplan mit Unterprogramm und Plan der Funktion, Code mit def und return,
Probe mit 20, Auftrag zu Hause: return durch print ersetzen, ohne das Ergebnis zu verraten).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v07/labor/w-vorgemacht.vorlage.py)."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v07-beispiel"; LABEL = "DHBW · Informatik · Termin 07 · Vorgerechnet: Fahrenheit"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echter Programmlauf
CODE = ["# Fahrenheit: Die Umrechnung steht in einer Funktion",
        "def fahrenheit(c):",
        "    grad = c * 9 / 5 + 32",
        "    return grad",
        "",
        'celsius = float(input("Grad Celsius: "))',
        "fahr = fahrenheit(celsius)",
        'print(f"{celsius:.1f} Grad Celsius sind {fahr:.1f} Grad Fahrenheit")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v07", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE) and open(_SEITE, encoding="utf-8").read().splitlines() != CODE:
    raise AssertionError("Code weicht von app/inhalte/v07/labor/w-vorgemacht.vorlage.py ab")
QUELLE = NL.join(CODE)
LAUF = run(QUELLE, ["20"])
assert LAUF == ["Grad Celsius: 20", "20.0 Grad Celsius sind 68.0 Grad Fahrenheit"], LAUF
assert 20 * 9 / 5 == 36.0 and 20 * 9 / 5 + 32 == 68.0
for _c, _erg in (("37", "37.0 Grad Celsius sind 98.6 Grad Fahrenheit"), ("0", "0.0 Grad Celsius sind 32.0 Grad Fahrenheit"), ("-10", "-10.0 Grad Celsius sind 14.0 Grad Fahrenheit")):
    assert run(QUELLE, [_c])[-1] == _erg, (_c, run(QUELLE, [_c]))
# Der Auftrag zu Hause (Fehlerbild wird im Video nicht gezeigt): return durch print ersetzt
_FALSCH = QUELLE.replace("    return grad", "    print(grad)")
try:
    run(_FALSCH, ["20"]); raise AssertionError("print statt return muss abbrechen")
except TypeError as _e:
    assert "NoneType" in str(_e)


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- Plaene
HAUPT = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: celsius"), ("u", "sub", "fahr = fahrenheit(celsius)"),
                    ("o", "io", "Ausgabe: celsius, fahr"), ("end", "term", "Ende")], fs=20, gap=26)
FUNK = plan_zweig([("fs", "term", "fahrenheit(c)"), ("p", "proc", "grad = c * 9 / 5 + 32"), ("r", "term", "Rückgabe: grad")], fs=20, gap=28)
assert HAUPT.reihenfolge == ["s", "s-e", "e", "e-u", "u", "u-o", "o", "o-end", "end"], HAUPT.reihenfolge
assert FUNK.reihenfolge == ["fs", "fs-p", "p", "p-r", "r"], FUNK.reihenfolge


def zeiten_plan(D, tn):
    """Einblendzeit je Schluessel: Symbole nach tn, Kanten kurz vor ihrem Ziel."""
    tm = {}
    for k in D.reihenfolge:
        if "-" in k and k not in D.nodes: tm[k] = tn[k.split("-")[1]] - 0.2
        else: tm[k] = tn[k]
    return tm


PB1 = (40, 110, 440, 540)
PB2 = (800, 130, 400, 330)


# ---------------------------------------------------------------- 1 Die Aufgabe
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Celsius in Fahrenheit")
    schritte = [("Temperatur in Celsius einlesen", a(0, pos(1, 0, "liest"))), ("in Fahrenheit umrechnen", a(0, pos(1, 0, "gibt"))),
                ("Fahrenheit ausgeben", a(1, pos(1, 1, "ausgeben")))]
    for j, (txt, tin) in enumerate(schritte):
        def schritt(d, dy, j=j, txt=txt):
            y = 160 + j * 84 + dy
            num_circle(d, 86, y, 24, j + 1, RED); TB(d, 130, y, txt, F(32, 600), DARK, 520, "lm", "Schritt")
        E(f, t, tin, schritt)
    E(f, t, a(0, 0.1), lambda d, dy: (tag(d, 60, 440 + dy, 270, 64, "Celsius: 20", LIGHTB, BLUE, 32, 700, outl=BLUE),
                                      pfeil(d, 346, 472 + dy, 404, 472 + dy, GREY, 5, 15),
                                      tag(d, 420, 440 + dy, 270, 64, "Fahrenheit: ?", LIGHTK, GREY, 32, 700, outl=LINE)))
    # rechts: was gehoert in die Funktion
    def haupt(d, dy):
        card(d, 760, 130 + dy, 460, 200, stripe=False)
        TB(d, 790, 166 + dy, "Hauptprogramm", F(30, 700), DARK, 400, "lm", "Kasten")
    def funk(d, dy):
        card(d, 760, 370 + dy, 460, 150, stripe=False)
        TB(d, 790, 406 + dy, "Funktion", F(30, 700), DARK, 400, "lm", "Kasten")
    E(f, t, a(1, pos(1, 1, "Was gehört")), haupt)
    E(f, t, a(1, pos(1, 1, "Was gehört")), funk)
    E(f, t, a(1, pos(1, 1, "Die Umrechnung")), lambda d, dy: tag(d, 790, 440 + dy, 400, 56, "Umrechnung", LIGHTA, AMB, 30, 700, outl=AMB))
    E(f, t, a(1, pos(1, 1, "Eingabe und")), lambda d, dy: (tag(d, 790, 190 + dy, 190, 56, "Eingabe", LIGHTB, BLUE, 28, 700, outl=BLUE),
                                                           tag(d, 1000, 190 + dy, 190, 56, "Ausgabe", LIGHTG, GREEN, 28, 700, outl=GREEN),
                                                           TB(d, 990, 280 + dy, "und der Aufruf der Funktion", F(24, 600), GREY, 400, "mm", "Kasten")))
    E(f, t, a(1, pos(1, 1, "weil man")), lambda d, dy: TB(d, 990, 540 + dy, "man braucht sie öfter", F(26, 600), GREY, 420, "mm", "Grund"))


# ---------------------------------------------------------------- 2 Die Plaene
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Zwei Pläne: Hauptplan und Funktion")
    tn = {"s": a(0, 0.05), "e": a(0, pos(2, 0, "liest")), "u": a(0, pos(2, 0, "Rechteck")), "o": a(0, pos(2, 0, "Danach")), "end": a(0, 0.97)}
    tf = {"fs": a(1, pos(2, 1, "Im Start")), "p": a(1, pos(2, 1, "Darunter")), "r": a(2, 0.15)}
    tmh, tmf = zeiten_plan(HAUPT, tn), zeiten_plan(FUNK, tf)
    schedh = [(tn["e"], ["s-e", "e"]), (tn["u"], ["e-u", "u"]), (tn["o"], ["u-o", "o"]), (tn["end"], []), (tf["fs"] - 0.1, [])]
    schedf = [(tf["fs"], ["fs"]), (tf["p"], ["fs-p", "p"]), (tf["r"], ["p-r", "r"])]
    zh, camh = plan_draw(f, 1.0, HAUPT, PB1, vis=reveal(t, tmh), hl={k: RED for k in (aktuell(t, schedh) or [])})
    zf, camf = plan_draw(f, 1.0, FUNK, PB2, vis=reveal(t, tmf), hl={k: RED for k in (aktuell(t, schedf) or [])})
    # Verbindung vom Aufruf zum Start der Funktion
    nu, nf = HAUPT.nodes["u"], FUNK.nodes["fs"]
    xu, yu = plan_xy(PB1, zh, camh, nu.cx + nu.w / 2, nu.cy); xf, yf = plan_xy(PB2, zf, camf, nf.cx - nf.w / 2, nf.cy)
    t_con = tf["fs"]
    def verbindung(d, dy):
        xm = (xu + xf) / 2 + 40
        pts = [(xu + 6, yu + dy), (xm, yu + dy), (xm, yf + dy), (xf - 34, yf + dy)]
        for p0, p1 in zip(pts, pts[1:]): gestrichelt(d, [p0, p1], AMB, 4)
        pfeil(d, xf - 30, yf + dy, xf - 4, yf + dy, AMB, 4, 13)
    E(f, t, t_con, verbindung)
    E(f, t, t_con, lambda d, dy: TB(d, (xu + xf) / 2 + 48, yu - 38 + dy, "ruft auf", F(26, 700), AMB, 200, "lm", "Beschriftung"))
    E(f, t, tn["u"], lambda d, dy: tag(d, 530, yu - 28 + dy, 230, 56, "Unterprogramm", LIGHTA, AMB, 26, 700, outl=AMB), tout=t_con)
    ye = plan_xy(PB1, zh, camh, 0, HAUPT.nodes["e"].cy)[1]
    E(f, t, tn["e"], lambda d, dy: tag(d, 530, ye - 28 + dy, 230, 56, "einlesen", LIGHTB, BLUE, 26, 700, outl=BLUE), tout=tn["u"])
    E(f, t, tf["fs"], lambda d, dy: tag(d, 800, 100 + dy, 400, 48, "Funktion: eigener Plan", LIGHTK, DARK, 26, 700, outl=LINE))
    yr = plan_xy(PB2, zf, camf, 0, FUNK.nodes["r"].cy)[1]
    E(f, t, tf["r"], lambda d, dy: tag(d, 800, yr + 50 + dy, 400, 52, "geht zurück an den Aufruf", LIGHTG, GREEN, 26, 700, outl=GREEN))
    E(f, t, tf["p"], lambda d, dy: tag(d, 800, 480 + dy, 400, 48, "Kopf im Start-Symbol", LIGHTR, RED, 26, 700, outl=RED), tout=tf["r"])


# ---------------------------------------------------------------- 3 Vom Plan zum Code
CX3, CY3, CW3, CS3, CLH3 = 60, 112, 1160, 22, 40
G3 = CodeGeo(CX3, CY3, CW3, CS3, CLH3, len(CODE))
assert all(G3.cx(len(z)) + 16 <= CX3 + CW3 for z in CODE), max(G3.cx(len(z)) for z in CODE)

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code")
    tm = [0.3, a(0, 0.2), a(1, 0.0), a(1, pos(3, 1, "Die letzte")), a(1, pos(3, 1, "Die letzte")) + 0.4, a(2, pos(3, 2, "Es liest")), a(2, pos(3, 2, "ruft")), a(2, pos(3, 2, "Dann gibt"))]
    aktiv = aktuell(t, [(tm[1], {1}), (tm[2], {2}), (tm[3], {3}), (tm[5], {5}), (tm[6], {6}), (tm[7], {7}), (a(3, 0.0), None)])
    E(f, t, 0.2, lambda d, dy: code_lauf(d, CX3, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=tm, aktiv=aktiv, cps=70))
    geo = lambda dy: CodeGeo(CX3, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    # Satz 1: der Kopf
    c0, c1 = spalte(CODE[1], "fahrenheit"); p0, p1 = spalte(CODE[1], "(c)"); d0, d1 = spalte(CODE[1], ":", True)
    E(f, t, a(0, pos(3, 0, "Zuerst")), lambda d, dy: code_markiere(d, geo(dy), 1, 0, 3, RED), tout=a(1, 0.0))
    E(f, t, a(0, pos(3, 0, "Der Name")), lambda d, dy: code_markiere(d, geo(dy), 1, c0, c1, BLUE), tout=a(1, 0.0))
    E(f, t, a(0, pos(3, 0, "Klammer")), lambda d, dy: code_markiere(d, geo(dy), 1, p0 + 1, p1 - 1, AMB), tout=a(1, 0.0))
    E(f, t, a(0, pos(3, 0, "Doppelpunkt")), lambda d, dy: code_markiere(d, geo(dy), 1, d0, d1, GREEN), tout=a(1, 0.0))
    E(f, t, a(0, pos(3, 0, "Der Name")), lambda d, dy: zeilen_notiz(d, geo(dy), 1, 760, 440, "Start-Symbol: der Kopf der Funktion", LIGHTR, RED, size=22, h=34, outl=RED), tout=a(1, 0.0))
    # Satz 2: Rumpf und return
    E(f, t, a(1, 0.0), lambda d, dy: (code_einrueckung(d, geo(dy), 2), zeilen_notiz(d, geo(dy), 2, 760, 440, "Operation: die Rechnung im Rumpf", LIGHTA, AMB, size=22, h=34, outl=AMB)))
    E(f, t, a(1, pos(3, 1, "Die letzte")), lambda d, dy: (code_markiere(d, geo(dy), 3, 4, 10, RED),
                                                           zeilen_notiz(d, geo(dy), 3, 760, 440, "Ende: die Rückgabe", LIGHTG, GREEN, size=22, h=34, outl=GREEN)))
    # Satz 3: das Hauptprogramm
    E(f, t, a(2, pos(3, 2, "ganz links")), lambda d, dy: zeilen_notiz(d, geo(dy), 5, 760, 440, "Hauptprogramm: ganz links, Eingabe", LIGHTB, BLUE, size=22, h=34, outl=BLUE))
    E(f, t, a(2, pos(3, 2, "ruft")), lambda d, dy: (code_markiere(d, geo(dy), 6, *spalte(CODE[6], "fahrenheit(celsius)"), RED),
                                                     zeilen_notiz(d, geo(dy), 6, 760, 440, "Unterprogramm: der Aufruf", LIGHTA, AMB, size=22, h=34, outl=AMB)))
    # Satz 4: Reihenfolge
    E(f, t, a(3, 0.0), lambda d, dy: (code_markiere(d, geo(dy), 1, 0, 3, RED), code_markiere(d, geo(dy), 6, 0, 4, RED)))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 560 + dy, 1160, 64, "Erst definieren, dann aufrufen", RED, WHITE, 38))


# ---------------------------------------------------------------- 4 Die Probe mit 20
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Probe: 20 Grad Celsius")
    E(f, t, a(0, pos(4, 0, "Du rechnest")), lambda d, dy: tag(d, 60, 130 + dy, 560, 70, "20 · 9 / 5 = 36", LIGHTK, DARK, 38, 700, outl=LINE))
    E(f, t, a(0, pos(4, 0, "Dazu")), lambda d, dy: tag(d, 660, 130 + dy, 560, 70, "36 + 32 = 68", LIGHTA, AMB, 38, 700, outl=AMB))
    # der Weg des Werts
    weg = [("celsius = 20.0", a(2, 0.0), BLUE, LIGHTB), ("c = 20.0", a(2, pos(4, 2, "Parameter")), BLUE, LIGHTB),
           ("grad = 68.0", a(2, pos(4, 2, "Parameter") + 0.3), AMB, LIGHTA), ("fahr = 68.0", a(2, pos(4, 2, "landet")), GREEN, LIGHTG)]
    for k, (txt, tin, col, fill) in enumerate(weg):
        x = 60 + k * 300
        E(f, t, tin, lambda d, dy, x=x, txt=txt, col=col, fill=fill: chip(d, x, 250 + dy, 250, 64, txt, fill, col, 26, outl=col, mono=True))
        if k: E(f, t, tin, lambda d, dy, x=x: pfeil(d, x - 46, 282 + dy, x - 6, 282 + dy, GREY, 4, 13))
    E(f, t, a(2, 0.0), lambda d, dy: TB(d, 60, 340 + dy, "so geht der Wert durch das Programm", F(24, 600), GREY, 700, "lm", "Hinweis"))
    zl = [(a(1, 0.0) - 0.2, LAUF[0][:-2], a(1, 0.0) + 0.3, "20"), (a(1, 0.0) + 1.2, LAUF[1], None, None)]
    E(f, t, a(1, 0.0) - 0.3, lambda d, dy: lauf_panel(d, 60, 400 + dy, 1160, zl, t, 28, 44, "Programmlauf"))
    E(f, t, a(1, pos(4, 1, "dasselbe") + 0.1), lambda d, dy: tag(d, 60, 580 + dy, 1160, 60, "68 stimmt mit der Rechnung überein", RED, WHITE, 34))


# ---------------------------------------------------------------- 5 Auftrag zu Hause
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Jetzt du: return gegen print tauschen")
    aktiv = aktuell(t, [(a(0, pos(5, 0, "Ersetze")), {3}), (a(1, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX3, CY3 + dy, CW3, CODE, t, CS3, CLH3, aktiv=aktiv))
    geo = lambda dy: CodeGeo(CX3, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    E(f, t, a(0, pos(5, 0, "Ersetze")), lambda d, dy: (code_markiere(d, geo(dy), 3, *spalte(CODE[3], "return grad"), RED),
                                                       zeilen_notiz(d, geo(dy), 3, 760, 440, "diese Zeile ersetzt du durch print(grad)", LIGHTR, RED, size=22, h=34, outl=RED)))
    for k, (txt, tin) in enumerate((("1 Vermuten", a(1, pos(5, 1, "Überlege"))), ("2 Ausprobieren", a(1, pos(5, 1, "Probiere"))), ("3 Meldung lesen", a(1, pos(5, 1, "Lies"))))):
        E(f, t, tin, lambda d, dy, k=k, txt=txt: tag(d, 60 + k * 400, 536 + dy, 360, 60, txt, LIGHTK if k < 2 else LIGHTR, DARK if k < 2 else RED, 30, 700, outl=LINE if k < 2 else RED))
    E(f, t, a(2, pos(5, 2, "Wenn du")), lambda d, dy: tag(d, 60, 624 + dy, 1160, 56, "Wenn du magst: zusätzlich print(fahr) unter den Aufruf", LIGHTB, BLUE, 28, 700, outl=BLUE))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 07 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet: Fahrenheit", F(58, 700), DARK)
        T2(d, 90, 250, "Eine Funktion mit return", F(48, 700), DARK)
        T2(d, 90, 318, "def fahrenheit(c):", M(34, True), RED)
        T2(d, 90, 420, "Hauptplan und", F(32, 600), GREY)
        T2(d, 90, 462, "Plan der Funktion", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        chip(d, 90, 540, 300, 70, "20 → 68", BOX, CODE_K, 36, outl=BOX, mono=True)
    f.el(1, fn)
    plan_draw(f, 1.0, HAUPT, (780, 70, 440, 330))
    plan_draw(f, 1.0, FUNK, (780, 420, 440, 250))
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
