"""Termin 08, Video 3: Vorgerechnet: Fingerspiel (Aufgabe, Hauptplan und Plan von ist_gerade mit Raute, Plan von sieger fehlt,
Code, Probe mit 3 und 5, Auftrag zu Hause: return durch print ersetzen, ohne das Ergebnis zu verraten).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v08/labor/w-vorgemacht.vorlage.py)."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v08-beispiel"; LABEL = "DHBW · Informatik · Termin 08 · Vorgerechnet: Fingerspiel"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echter Programmlauf
CODE = ["# Fingerspiel: Ist die Summe gerade, gewinnt Anna, sonst Ben",
        "def ist_gerade(n):", "    if n % 2 == 0:", "        return True", "    else:", "        return False", "",
        "def sieger(summe):", "    if ist_gerade(summe):", '        return "Anna"', "    else:", '        return "Ben"', "",
        'anna = int(input("Finger von Anna: "))', 'ben = int(input("Finger von Ben: "))', "wer = sieger(anna + ben)", 'print("Sieger:", wer)']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v08", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE) and open(_SEITE, encoding="utf-8").read().splitlines() != CODE:
    raise AssertionError("Code weicht von app/inhalte/v08/labor/w-vorgemacht.vorlage.py ab")
QUELLE = NL.join(CODE)
LAUF = run(QUELLE, ["3", "5"])
assert LAUF == ["Finger von Anna: 3", "Finger von Ben: 5", "Sieger: Anna"], LAUF
assert 3 + 5 == 8 and 8 % 2 == 0
for _a, _b, _erg in (("2", "3", "Sieger: Ben"), ("1", "1", "Sieger: Anna"), ("5", "4", "Sieger: Ben")):
    assert run(QUELLE, [_a, _b])[-1] == _erg, (_a, _b)
# Der Auftrag zu Hause (das Ergebnis wird im Video nicht gezeigt): return "Ben" durch print("Ben") ersetzt
_FALSCH = QUELLE.replace('        return "Ben"', '        print("Ben")')
assert run(_FALSCH, ["2", "3"])[-2:] == ["Ben", "Sieger: None"], run(_FALSCH, ["2", "3"])


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- Plaene (sieger fehlt absichtlich)
HAUPT = plan_zweig([("s", "term", "Start"), ("e1", "io", "Eingabe: anna"), ("e2", "io", "Eingabe: ben"), ("u", "sub", "wer = sieger(anna + ben)"),
                    ("o", "io", 'Ausgabe: "Sieger:", wer'), ("end", "term", "Ende")], fs=20, gap=24)
FUNK = plan_zweig([("fs", "term", "ist_gerade(n)"),
                   ("d", "dec", "n % 2 == 0?", [("j", "proc", "antwort = True")], [("n", "proc", "antwort = False")]),
                   ("r", "term", "Rückgabe: antwort")], fs=20, gap=26)
assert HAUPT.reihenfolge == ["s", "s-e1", "e1", "e1-e2", "e2", "e2-u", "u", "u-o", "o", "o-end", "end"], HAUPT.reihenfolge
assert FUNK.reihenfolge == ["fs", "fs-d", "d", "d-ja", "j", "d-nein", "n", "d-ja-z", "d-nein-z", "d-r", "r"], FUNK.reihenfolge


def zeiten_plan(D, tn):
    """Einblendzeit je Schluessel: Symbole nach tn, Kanten kurz vor ihrem Ziel (tn: Zeit je Symbol; Kanten ohne Ziel erben)."""
    tm = {}
    for k in D.reihenfolge:
        if k in D.nodes: tm[k] = tn[k]
        else:
            ziel = k.split("-")[1]
            tm[k] = (tn[ziel] if ziel in tn else tn[tn["_ende"][k]]) - 0.2
    return tm


PB1 = (40, 110, 360, 540)
PB2 = (430, 110, 440, 540)


# ---------------------------------------------------------------- 1 Die Aufgabe
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Fingerspiel")
    def hand(d, dy, x, name, n, col, fill):
        d.rounded_rectangle((x, 150 + dy, x + 250, 290 + dy), 18, fill=fill, outline=col, width=3)
        TB(d, x + 125, 190 + dy, name, F(30, 700), col, 230, "mm", "Name")
        TB(d, x + 125, 250 + dy, f"{n} Finger", F(40, 700), DARK, 230, "mm", "Finger")
    E(f, t, a(0, 0.05), lambda d, dy: (hand(d, dy, 60, "Anna", 3, BLUE, LIGHTB), hand(d, dy, 340, "Ben", 5, RED, LIGHTR)))
    E(f, t, a(0, pos(1, 0, "Ist die")), lambda d, dy: (tag(d, 660, 150 + dy, 560, 60, "Summe gerade: Anna gewinnt", LIGHTB, BLUE, 28, 700, outl=BLUE),
                                                       tag(d, 660, 230 + dy, 560, 60, "Summe ungerade: Ben gewinnt", LIGHTR, RED, 28, 700, outl=RED)))
    schritte = [("zwei Zahlen einlesen", a(1, pos(1, 1, "Zwei"))), ("Summe bilden", a(1, pos(1, 1, "die Summe"))),
                ("fragen, wer gewinnt", a(1, pos(1, 1, "fragen"))), ("Sieger ausgeben", a(1, pos(1, 1, "den Sieger")))]
    for j, (txt, tin) in enumerate(schritte):
        def schritt(d, dy, j=j, txt=txt):
            y = 360 + j * 66 + dy
            num_circle(d, 86, y, 22, j + 1, RED); TB(d, 130, y, txt, F(30, 600), DARK, 440, "lm", "Schritt")
        E(f, t, tin, schritt)
    def kasten_(d, dy, y, h, titel):
        card(d, 700, y + dy, 520, h, stripe=False); TB(d, 730, y + 34 + dy, titel, F(28, 700), DARK, 460, "lm", "Kasten")
    t_was = a(2, 0.0)
    E(f, t, t_was, lambda d, dy: kasten_(d, dy, 340, 120, "Funktion ist_gerade"))
    E(f, t, a(2, pos(1, 2, "Eine Funktion")), lambda d, dy: tag(d, 730, 400 + dy, 460, 44, "gerade oder nicht?", LIGHTA, AMB, 26, 700, outl=AMB))
    E(f, t, a(2, pos(1, 2, "Eine zweite")), lambda d, dy: (kasten_(d, dy, 480, 100, "Funktion sieger"), tag(d, 730, 530 + dy, 460, 40, "macht daraus einen Namen", LIGHTG, GREEN, 24, 700, outl=GREEN)))
    E(f, t, a(2, pos(1, 2, "Eingabe und")), lambda d, dy: tag(d, 700, 610 + dy, 520, 56, "Eingabe und Ausgabe: Hauptprogramm", LIGHTK, DARK, 26, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Die Plaene
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Zwei Pläne: Hauptplan und ist_gerade")
    tn = {"s": a(0, 0.03), "e1": a(0, pos(2, 0, "liest")), "e2": a(0, pos(2, 0, "ben") + 0.0), "u": a(0, pos(2, 0, "Dann")), "o": a(0, pos(2, 0, "Danach")), "end": a(0, 0.97)}
    tf = {"fs": a(1, pos(2, 1, "Im Start")), "d": a(1, pos(2, 1, "Raute")), "j": a(2, pos(2, 2, "Rest")), "n": a(2, pos(2, 2, "Sonst")), "r": a(2, pos(2, 2, "Am Ende"))}
    tmh = zeiten_plan(HAUPT, {**tn, "_ende": {}})
    tf["_ende"] = {"d-ja-z": "j", "d-nein-z": "n"}
    tmf = {}
    for k in FUNK.reihenfolge:
        if k in FUNK.nodes: tmf[k] = tf[k]
        elif k in ("d-ja-z",): tmf[k] = tf["j"] + 0.5
        elif k in ("d-nein-z",): tmf[k] = tf["n"] + 0.5
        else: tmf[k] = tf[k.split("-")[1] if k.split("-")[1] in tf else {"ja": "j", "nein": "n"}[k.split("-")[1]]] - 0.2
    tmf["d-r"] = tf["r"] - 0.2
    schedh = [(tn["e1"], ["s-e1", "e1"]), (tn["e2"], ["e1-e2", "e2"]), (tn["u"], ["e2-u", "u"]), (tn["o"], ["u-o", "o"]), (tn["end"], []), (tf["fs"] - 0.1, [])]
    schedf = [(tf["fs"], ["fs"]), (tf["d"], ["fs-d", "d"]), (tf["j"], ["d-ja", "j"]), (tf["n"], ["d-nein", "n"]), (tf["r"], ["d-ja-z", "d-nein-z", "d-r", "r"])]
    zh, camh = plan_draw(f, 1.0, HAUPT, PB1, vis=reveal(t, tmh), hl={k: RED for k in (aktuell(t, schedh) or [])})
    zf, camf = plan_draw(f, 1.0, FUNK, PB2, vis=reveal(t, tmf), hl={k: RED for k in (aktuell(t, schedf) or [])})
    nu, nf = HAUPT.nodes["u"], FUNK.nodes["fs"]
    xu, yu = plan_xy(PB1, zh, camh, nu.cx + nu.w / 2, nu.cy); xf, yf = plan_xy(PB2, zf, camf, nf.cx - nf.w / 2, nf.cy)
    t_con = tf["fs"]
    def verbindung(d, dy):
        xm = xu + 22
        pts = [(xu + 6, yu + dy), (xm, yu + dy), (xm, yf + dy), (xf - 30, yf + dy)]
        for p0, p1 in zip(pts, pts[1:]):
            if abs(p0[0] - p1[0]) + abs(p0[1] - p1[1]) > 1: gestrichelt(d, [p0, p1], AMB, 4)
        pfeil(d, xf - 30, yf + dy, xf - 4, yf + dy, AMB, 4, 13)
    E(f, t, t_con, verbindung)
    E(f, t, tf["fs"], lambda d, dy: tag(d, 900, 120 + dy, 320, 48, "Funktion: eigener Plan", LIGHTK, DARK, 24, 700, outl=LINE))
    E(f, t, tf["d"], lambda d, dy: tag(d, 900, 190 + dy, 320, 56, "Raute: Rest 0?", LIGHTA, AMB, 26, 700, outl=AMB))
    E(f, t, tf["r"], lambda d, dy: tag(d, 900, 266 + dy, 320, 56, "Antwort geht zurück", LIGHTG, GREEN, 26, 700, outl=GREEN))
    # der fehlende Plan
    def fehlt(d, dy):
        imbild(380 + dy, 620 + dy, "fehlender Plan")
        gestrichelt(d, [(900, 380 + dy), (1220, 380 + dy), (1220, 600 + dy), (900, 600 + dy)], GREYL, 3)
        TB(d, 1060, 460 + dy, "Plan von sieger", F(30, 700), GREY, 300, "mm", "Platz")
        TB(d, 1060, 520 + dy, "fehlt hier mit Absicht", F(26, 600), GREY, 300, "mm", "Platz")
    E(f, t, a(3, 0.0), fehlt)
    E(f, t, a(3, pos(2, 3, "gleich")), lambda d, dy: tag(d, 900, 624 + dy, 320, 52, "du zeichnest ihn selbst", RED, WHITE, 24))


# ---------------------------------------------------------------- 3 Vom Plan zum Code
CX3, CY3, CW3, CS3, CLH3 = 40, 100, 840, 21, 30
G3 = CodeGeo(CX3, CY3, CW3, CS3, CLH3, len(CODE))
assert all(G3.cx(len(z)) + 16 <= CX3 + CW3 for z in CODE) and CY3 + G3.h <= 690, (CY3 + G3.h)
NX3, NW3 = 910, 320


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code")
    t0 = [a(0, 0.05), a(1, 0.0), a(2, 0.0)]
    tm = [t0[0]] + [t0[0] + 0.2 + 0.25 * j for j in range(5)] + [0.0] + [t0[1] + 0.05 * j for j in range(5)] + [0.0] + [t0[2] + 0.25 * j for j in range(4)]
    tm[6] = tm[5]; tm[12] = tm[11]
    aktiv = aktuell(t, [(a(0, 0.05), {1, 2, 3, 4, 5}), (a(1, 0.0), {7, 8, 9, 10, 11}), (a(2, 0.0), {13, 14, 15, 16}), (a(3, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX3, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=tm, aktiv=aktiv, cps=70))
    geo = lambda dy: CodeGeo(CX3, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    n = lambda i, txt, fill, col, tin, tout=None: E(f, t, tin, lambda d, dy: zeilen_notiz(d, geo(dy), i, NX3, NW3, txt, fill, col, size=20, h=28, outl=col), tout=tout)
    n(1, "Kopf: def, Name, Parameter", LIGHTR, RED, a(0, pos(3, 0, "Zuerst")), a(1, 0.0))
    n(2, "Raute wird if", LIGHTA, AMB, a(0, pos(3, 0, "Die Raute")), a(1, 0.0))
    n(3, "return im Zweig", LIGHTG, GREEN, a(0, pos(3, 0, "und in")), a(1, 0.0))
    n(5, "return im anderen Zweig", LIGHTG, GREEN, a(0, pos(3, 0, "und in")), a(1, 0.0))
    n(8, "Aufruf in der Bedingung", LIGHTB, BLUE, a(1, pos(3, 1, "direkt")), a(2, 0.0))
    n(9, "Name als Antwort", LIGHTG, GREEN, a(1, pos(3, 1, "Ist die")), a(2, 0.0))
    n(13, "input liefert Text", LIGHTB, BLUE, a(2, pos(3, 2, "int von")), a(3, 0.0))
    n(15, "Aufruf, Ergebnis in wer", LIGHTA, AMB, a(2, pos(3, 2, "ruft")), a(3, 0.0))
    n(16, "Sieger ausgeben", LIGHTK, DARK, a(2, pos(3, 2, "Dann gibt")), a(3, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: code_fluchtlinie(d, geo(dy), 13, 16, 0, RED), tout=a(3, 0.0))
    E(f, t, a(3, 0.0), lambda d, dy: (code_markiere(d, geo(dy), 1, 0, 3, RED), code_markiere(d, geo(dy), 7, 0, 3, RED), code_markiere(d, geo(dy), 15, 0, 3, RED)))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, NX3, 420 + dy, NW3, 64, "Erst definieren, dann aufrufen", RED, WHITE, 22))


# ---------------------------------------------------------------- 4 Die Probe mit 3 und 5
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Probe: 3 und 5")
    E(f, t, a(0, 0.0), lambda d, dy: tag(d, 60, 130 + dy, 360, 70, "3 + 5 = 8", LIGHTK, DARK, 40, 700, outl=LINE))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 460, 130 + dy, 360, 70, "8 % 2 = 0", LIGHTA, AMB, 40, 700, outl=AMB))
    E(f, t, a(1, pos(4, 1, "Also")), lambda d, dy: tag(d, 860, 130 + dy, 360, 70, "True: Anna", LIGHTG, GREEN, 40, 700, outl=GREEN))
    weg = [("summe = 8", a(3, 0.0), BLUE, LIGHTB, 230), ("n = 8", a(3, pos(4, 3, "nach")), BLUE, LIGHTB, 160), ("True", a(3, pos(4, 3, "als truh")), GREEN, LIGHTG, 140),
           ('"Anna"', a(3, pos(4, 3, "als Name")), GREEN, LIGHTG, 160), ('wer = "Anna"', a(3, pos(4, 3, "landet")), AMB, LIGHTA, 280)]
    x = 60
    for k, (txt, tin, col, fill, wd) in enumerate(weg):
        E(f, t, tin, lambda d, dy, x=x, txt=txt, col=col, fill=fill, wd=wd, k=k: (chip(d, x, 260 + dy, wd, 64, txt, fill, col, 26, outl=col, mono=True),
                                                                             pfeil(d, x - 36, 292 + dy, x - 4, 292 + dy, GREY, 4, 12) if k else None))
        x += wd + 40
    E(f, t, a(3, 0.0), lambda d, dy: TB(d, 60, 232 + dy, "so geht der Wert durch das Programm", F(24, 600), GREY, 700, "lm", "Hinweis"))
    zl = [(a(2, 0.0) - 1.4, LAUF[0][:-1], a(2, 0.0) - 1.0, "3"), (a(2, 0.0) - 0.6, LAUF[1][:-1], a(2, 0.0) - 0.2, "5"), (a(2, 0.0) + 0.2, LAUF[2], None, None)]
    E(f, t, a(2, 0.0) - 1.5, lambda d, dy: lauf_panel(d, 60, 400 + dy, 1160, zl, t, 28, 46, "Programmlauf"))


# ---------------------------------------------------------------- 5 Auftrag zu Hause
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Jetzt du: return gegen print tauschen")
    aktiv = aktuell(t, [(a(0, pos(5, 0, "Ersetze")), {11}), (a(1, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, CX3, CY3 + dy, CW3, CODE, t, CS3, CLH3, aktiv=aktiv))
    geo = lambda dy: CodeGeo(CX3, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    E(f, t, a(0, pos(5, 0, "Ersetze")), lambda d, dy: (code_markiere(d, geo(dy), 11, *spalte(CODE[11], 'return "Ben"'), RED),
                                                       zeilen_notiz(d, geo(dy), 11, NX3, NW3, 'diese Zeile: print("Ben")', LIGHTR, RED, size=20, h=28, outl=RED)))
    for k, (txt, tin) in enumerate((("1 Vermuten", a(1, pos(5, 1, "Überlege"))), ("2 Laufen lassen", a(1, pos(5, 1, "Lass"))), ("3 Ausgabe lesen", a(2, 0.0)))):
        E(f, t, tin, lambda d, dy, k=k, txt=txt: tag(d, NX3, 250 + k * 80 + dy, NW3, 60, txt, LIGHTK if k < 2 else LIGHTR, DARK if k < 2 else RED, 28, 700, outl=LINE if k < 2 else RED))
    E(f, t, a(1, pos(5, 1, "Lass")), lambda d, dy: tag(d, NX3, 190 + dy, NW3, 44, "Eingabe: 2 und 3", LIGHTB, BLUE, 24, 700, outl=BLUE))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 08 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet:", F(58, 700), DARK)
        T2(d, 90, 170, "Fingerspiel", F(58, 700), DARK)
        T2(d, 90, 290, "Funktionen, die antworten", F(40, 700), DARK)
        T2(d, 90, 350, "ist_gerade(n)", M(34, True), RED)
        T2(d, 90, 410, "Zwei Funktionen, ein", F(32, 600), GREY)
        T2(d, 90, 452, "Aufruf in der Bedingung", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        chip(d, 90, 540, 360, 70, "3 + 5 → Anna", BOX, CODE_K, 34, outl=BOX, mono=True)
    f.el(1, fn)
    plan_draw(f, 1.0, FUNK, (780, 70, 440, 600))
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
