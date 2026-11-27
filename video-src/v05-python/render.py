"""Termin 05, Video 2: Python-Werkzeugkasten: for, range, if ohne else (Karte 1 for und range, Karte 2 if ohne else).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) startet nur der Orchestrator; die Toene liegen schon in audio/.
Code und Ausgaben wie im Labor (app/inhalte/v05/labor.mdx, Syntaxkarten sk-for-range und sk-if-ohne-else); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v05-python"; LABEL = "DHBW · Informatik · Termin 05 · Python-Werkzeugkasten: for, range, if ohne else"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Syntaxkarten im Labor)
CODE_FOR = ["for i in range(1, 4):", "    print(i)", 'print("fertig")']
OUT_FOR = run(NL.join(CODE_FOR)); assert OUT_FOR == ["1", "2", "3", "fertig"]
assert list(range(1, 4)) == [1, 2, 3] and 4 not in range(1, 4) and len(range(1, 4)) == 4 - 1 == 3
assert list(range(4)) == [0, 1, 2, 3] and len(range(4)) == 4 and list(range(4)) == list(range(0, 4))

CODE_IF9 = ["punkte = 9", "if punkte >= 8:", '    print("gut")', 'print("weiter")']
CODE_IF5 = ["punkte = 5"] + CODE_IF9[1:]
OUT_IF9 = run(NL.join(CODE_IF9)); assert OUT_IF9 == ["gut", "weiter"]
OUT_IF5 = run(NL.join(CODE_IF5)); assert OUT_IF5 == ["weiter"]
assert (9 >= 8) is True and (5 >= 8) is False

G = dict(x=60, y=116, w=520, size=28, lh=48)      # Code-Kasten in Szene 2, 4 und 5
NOTE_X, NOTE_W = 600, 520
GREYL2 = GREYL


# ---------------------------------------------------------------- eigene Bausteine (nur dieses Video)
def zbox(d, x, y, txt, mode="n", w=100, h=100, strike=False):
    """Ein Wert der Zahlenreihe. mode: n = normal, a = gerade dran (rot), s = Stoppwert (gestrichelt, gehoert nicht dazu)."""
    imbild(y, y + h, "Zahlenfeld")
    if mode == "s":
        d.rounded_rectangle((x, y, x + w, y + h), 12, fill=BG)
        gestrichelt(d, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], GREYL, 3)
        TB(d, x + w / 2, y + h / 2, txt, F(52, 700), GREYL, w - 12, "mm", "Zahl")
        if strike: durchstreichen(d, x + 12, y + 12, x + w - 12, y + h - 12)
    else:
        col = RED if mode == "a" else LINE
        d.rounded_rectangle((x, y, x + w, y + h), 12, fill=LIGHTR if mode == "a" else WHITE, outline=col, width=4 if mode == "a" else 2)
        TB(d, x + w / 2, y + h / 2, txt, F(52, 700), RED if mode == "a" else DARK, w - 12, "mm", "Zahl")


def lauf_h2(n, lh): return lauf_h(n, lh)


def karte_alt(d, x, y, titel, code):
    card(d, x, y, 360, 120, stripe=False); d.rounded_rectangle((x, y, x + 360, y + 8), 4, fill=GREY)
    TB(d, x + 24, y + 38, titel, F(28, 700), DARK, 310, "lm")
    d.rounded_rectangle((x + 16, y + 66, x + 344, y + 106), 8, fill=BOX)
    TB(d, x + 180, y + 86, code, M(22), CODE_T, 310, "mm")


# ---------------------------------------------------------------- 1 Zwei neue Karten
ALT = [("while", "while zaehler > 0:"), ("!= und not", "print(preis != 0)")]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zwei neue Karten im Werkzeugkasten")
    E(f, t, a(0, 0.05), lambda d, dy: TB(d, 60, 112 + dy, "Aus Termin 04, gilt weiter:", F(26, 600), GREY, 600))
    for k, ((titel, code), fr) in enumerate(zip(ALT, (0.45, 0.7))):
        f.el(0.4 * show(t, a(0, fr)), lambda d, dy, k=k, titel=titel, code=code: karte_alt(d, 60 + k * 400, 150 + dy, titel, code), dy=dyf(t, a(0, fr)))
    neu = [(1, ["for", "range"], "genau so oft", False), (2, ["if", "else"], "nur wenn", True)]
    for (nr, woerter, unter, ohne), sk in zip(neu, (1, 2)):
        x = 60 + (nr - 1) * 600; y = 310; w = 560; h = 300
        def karte(d, dy, x=x, nr=nr):
            card(d, x, y + dy, w, h, stripe=False); d.rounded_rectangle((x, y + dy, x + w, y + 10 + dy), 5, fill=RED)
            num_circle(d, x + 44, y + 58 + dy, 22, nr, RED)
            TB(d, x + 80, y + 58 + dy, f"Karte {nr}", F(34, 700), DARK, 300, "lm")
        E(f, t, a(sk, 0.0), karte)
        bw = 200; gap = 40; x0 = x + (w - (bw * 2 + gap)) / 2
        for j, wort in enumerate(woerter):
            def box(d, dy, xb=x0 + j * (bw + gap), wort=wort, tot=(ohne and j == 1)):
                d.rounded_rectangle((xb, y + 104 + dy, xb + bw, y + 200 + dy), 14, fill=BOX)
                TB(d, xb + bw / 2, y + 152 + dy, wort, M(60, True), mix(BOX, CODE_K, 0.35) if tot else CODE_K, bw - 24, "mm")
                if tot: durchstreichen(d, xb + 24, y + 116 + dy, xb + bw - 24, y + 188 + dy)
            E(f, t, a(sk, 0.3 + 0.2 * j), box)
        E(f, t, a(sk, 0.75), lambda d, dy, x=x, unter=unter: TB(d, x + w / 2, y + 250 + dy, unter, F(34, 700), DARK, w - 40, "mm"))


# ---------------------------------------------------------------- 2 Karte 1: for und range
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: for und range")
    x, y, w, size, lh = G["x"], G["y"], G["w"], G["size"], G["lh"]
    tm = [a(0, 0.04), a(0, 0.5), a(0, 0.82)]
    aktiv = aktuell(t, [(a(0, 0.5), {1}), (a(2, 0.0), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_FOR, t, size, lh, times=tm, aktiv=aktiv))
    g = CodeGeo(x, y, w, size, lh, 3)
    dp = spalte(CODE_FOR[0], ":", True)
    f.el(show(t, a(0, 0.3), a(1, 0.0)), lambda d, dy: code_markiere(d, g, 0, *dp, RED))
    E(f, t, a(0, 0.32), lambda d, dy: zeilen_notiz(d, g, 0, NOTE_X, NOTE_W, "Doppelpunkt am Ende", LIGHTR, RED, size=24, outl=RED), tout=a(1, 0.0))
    E(f, t, a(0, 0.62), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "Rumpf: eingerückt", LIGHTA, AMB, size=24, outl=AMB), tout=a(1, 0.55))
    f.el(show(t, a(0, 0.62), a(1, 0.0)), lambda d, dy: code_einrueckung(d, g, 1))
    E(f, t, a(1, 0.55), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "läuft einmal je Wert", LIGHTK, DARK, size=24, outl=GREY))
    # Zahlenreihe: i nimmt nacheinander 1, 2, 3 an, der Stoppwert 4 fehlt
    X0, Y0, DX = 620, 430, 124
    E(f, t, a(1, 0.0), lambda d, dy: TB(d, 620, 392 + dy, "i nimmt der Reihe nach an:", F(28, 600), GREY, 560, "lm"))
    for k, v in enumerate((1, 2, 3)):
        tk = a(1, 0.2 + 0.25 * k)
        def feld(d, dy, k=k, v=v, tk=tk):
            nxt = a(1, 0.2 + 0.25 * (k + 1)) if k < 2 else a(2, 0.0)
            zbox(d, X0 + k * DX, Y0 + dy, str(v), "a" if tk <= t < nxt else "n")
        E(f, t, tk, feld)
    E(f, t, a(2, 0.15), lambda d, dy: zbox(d, X0 + 3 * DX, Y0 + dy, "4", "s", strike=True))
    E(f, t, a(2, 0.4), lambda d, dy: TB(d, X0 + 3 * DX + 50, Y0 + 124 + dy, "Stoppwert: nicht dabei", F(26, 700), RED, 330, "ma"))
    # Ausgabe aus einem echten Lauf
    zl = [(a(3, 0.05 + 0.15 * k), s, None, None) for k, s in enumerate(OUT_FOR[:3])] + [(a(3, 0.8), OUT_FOR[3], None, None)]
    E(f, t, a(3, 0.0), lambda d, dy: lauf_panel(d, x, 352 + dy, w, zl, t, 28, 40, "Ausgabe", hl={0, 1, 2} if t >= a(3, 0.5) else None))
    E(f, t, a(3, 0.5), lambda d, dy: tag(d, 620, 596 + dy, 560, 64, "3 Durchläufe: 4 − 1 = 3", RED, WHITE, 32))


# ---------------------------------------------------------------- 3 range mit einem und mit zwei Werten
def zeile_range(f, t, y, code, vals, stopp, t_code, t_felder, t_chip, chip_txt):
    X0, DX = 430, 120
    def lab(d, dy):
        d.rounded_rectangle((60, y + dy, 340, y + 100 + dy), 14, fill=BOX)
        TB(d, 200, y + 50 + dy, code, M(40, True), CODE_K, 256, "mm", "range")
        pfeil(d, 352, y + 50 + dy, 410, y + 50 + dy, GREY, 6, 18)
    E(f, t, t_code, lab)
    for v, tk in zip(vals, t_felder):
        E(f, t, tk, lambda d, dy, v=v: zbox(d, X0 + v * DX, y + dy, str(v)))
    E(f, t, t_felder[-1] + 0.5, lambda d, dy: zbox(d, X0 + stopp * DX, y + dy, str(stopp), "s", strike=True))
    E(f, t, t_chip, lambda d, dy: tag(d, 1030, y + 22 + dy, 190, 56, chip_txt, RED, WHITE, 24))


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "range mit einem und mit zwei Werten")
    zeile_range(f, t, 130, "range(4)", [0, 1, 2, 3], 4, a(0, 0.05), [a(0, 0.35 + 0.12 * k) for k in range(4)], a(1, 0.15), "4 Durchläufe")
    E(f, t, a(2, 0.0), lambda d, dy: TB(d, 430, 250 + dy, "Ein Wert: Start immer bei 0", F(26, 700), GREY, 560, "lm"))
    zeile_range(f, t, 320, "range(1, 4)", [1, 2, 3], 4, a(2, 0.2), [a(2, 0.35 + 0.1 * k) for k in range(3)], a(2, 0.7), "3 Durchläufe")
    E(f, t, a(2, 0.55), lambda d, dy: TB(d, 430, 440 + dy, "Zwei Werte: Start legst du selbst fest", F(26, 700), GREY, 640, "lm"))
    for k, (wort, text, col, tin) in enumerate((("for", "Zahl steht vorher fest", RED, a(3, 0.15)),
                                                ("while", "hängt von etwas ab", BLUE, a(3, 0.55)))):
        def regel(d, dy, k=k, wort=wort, text=text, col=col):
            x = 60 + k * 600; yy = 500 + dy; imbild(yy, yy + 150, "Faustregel")
            card(d, x, yy, 560, 150, stripe=False); d.rounded_rectangle((x, yy, x + 560, yy + 10), 5, fill=col)
            d.rounded_rectangle((x + 24, yy + 34, x + 184, yy + 100), 12, fill=BOX)
            TB(d, x + 104, yy + 67, wort, M(40, True), CODE_K, 140, "mm")
            TB(d, x + 204, yy + 67, text, F(26, 600), DARK, 340, "lm")
        E(f, t, tin, regel)
    E(f, t, a(3, 0.0), lambda d, dy: TB(d, 60, 478 + dy, "Faustregel", F(26, 700), RED, 300, "lm"))


# ---------------------------------------------------------------- 4 Karte 2: if ohne else
def lauf2(f, t, lines, aktiv, grau, tm=None):
    x, y, w, size, lh = G["x"], G["y"], G["w"], G["size"], G["lh"]
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, lines, t, size, lh, times=tm, aktiv=aktiv, grau=grau))
    return CodeGeo(x, y, w, size, lh, 4)


def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 2: if ohne else")
    tm = [a(0, 0.3), a(1, 0.0), a(1, 0.6), a(2, 0.0)]
    aktiv = aktuell(t, [(a(1, 0.55), {2}), (a(2, 0.2), {3})])
    grau = set()
    g = lauf2(f, t, CODE_IF9, aktiv, grau, tm)
    cond = spalte(CODE_IF9[1], "punkte >= 8")
    f.el(show(t, a(1, 0.2)), lambda d, dy: code_markiere(d, g, 1, *cond, GREEN))
    E(f, t, a(1, 0.3), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "9 >= 8 ist wahr: ja", LIGHTG, GREEN, size=24, outl=GREEN))
    E(f, t, a(1, 0.62), lambda d, dy: zeilen_notiz(d, g, 2, NOTE_X, NOTE_W, "Rumpf läuft", LIGHTG, GREEN, size=24, outl=GREEN))
    f.el(show(t, a(1, 0.62)), lambda d, dy: code_einrueckung(d, g, 2))
    E(f, t, a(2, 0.2), lambda d, dy: zeilen_notiz(d, g, 3, NOTE_X, NOTE_W, "keine Einrückung: läuft immer", LIGHTK, DARK, size=24, outl=GREY))
    zl = [(a(1, 0.85), OUT_IF9[0], None, None), (a(2, 0.55), OUT_IF9[1], None, None)]
    E(f, t, a(1, 0.8), lambda d, dy: lauf_panel(d, 60, 410 + dy, 520, zl, t, 28, 44, "Ausgabe"))
    E(f, t, a(2, 0.5), lambda d, dy: tag(d, 600, 430 + dy, 620, 64, "weiter läuft in jedem Fall", RED, WHITE, 30))


# ---------------------------------------------------------------- 5 Dieselbe Karte mit 5 Punkten
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Dieselbe Karte mit 5 Punkten")
    x, y, w, size, lh = G["x"], G["y"], G["w"], G["size"], G["lh"]
    t5 = a(1, 0.0)
    lines = CODE_IF9 if t < t5 else CODE_IF5
    aktiv = aktuell(t, [(a(0, 0.2), {2}), (a(0, 0.6), {3}), (t5, None), (a(1, 0.65), {3})])
    grau = {2} if t >= a(1, 0.45) else set()
    g = lauf2(f, t, lines, aktiv, grau)
    f.el(show(t, t5, t5 + 1.2), lambda d, dy: code_markiere(d, g, 0, *spalte(CODE_IF5[0], "5"), AMBER))
    cond = spalte(CODE_IF9[1], "punkte >= 8")
    f.el(show(t, a(0, 0.1), t5), lambda d, dy: code_markiere(d, g, 1, *cond, GREEN))
    f.el(show(t, a(1, 0.25)), lambda d, dy: code_markiere(d, g, 1, *cond, RED))
    E(f, t, a(0, 0.1), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "9 >= 8 ist wahr: ja", LIGHTG, GREEN, size=24, outl=GREEN), tout=t5)
    E(f, t, a(1, 0.3), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "5 >= 8 ist falsch: nein", LIGHTR, RED, size=24, outl=RED))
    E(f, t, a(1, 0.5), lambda d, dy: zeilen_notiz(d, g, 2, NOTE_X, NOTE_W, "übersprungen", LIGHTK, GREY, size=24, outl=LINE))
    # Ausgaben: links mit 9 (aus Szene 4), rechts mit 5
    E(f, t, a(0, 0.15), lambda d, dy: lauf_panel(d, 60, 410 + dy, 250, [(a(0, 0.25), OUT_IF9[0], None, None), (a(0, 0.65), OUT_IF9[1], None, None)],
                                                 t, 28, 44, "Ausgabe mit 9"))
    E(f, t, a(1, 0.7), lambda d, dy: lauf_panel(d, 330, 410 + dy, 250, [(a(1, 0.75), OUT_IF5[0], None, None)], t, 28, 44, "Ausgabe mit 5"))
    E(f, t, a(2, 0.15), lambda d, dy: tag(d, 600, 440 + dy, 620, 64, "Kein else: bei falsch passiert nichts", RED, WHITE, 30), tout=a(3, 0.0))
    E(f, t, a(3, 0.1), lambda d, dy: tag(d, 600, 440 + dy, 620, 64, "Probier beide Karten aus", RED, WHITE, 30))
    E(f, t, a(3, 0.3), lambda d, dy: TB(d, 600, 540 + dy, "und ändere die Werte", F(32, 700), DARK, 620, "lm"))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "genau so oft, und nur wenn", F(34, 400), GREY)
        for k, wort in enumerate(("for", "range", "if")):
            chip(d, 90 + k * 186, 470, 170, 70, wort, BOX, CODE_K, 40, outl=BOX, mono=True)
        code_n(d, 760, 150, 460, CODE_FOR, [1, 2, 3], [-1] * 3, 0, 26, 44)
        code_n(d, 760, 330, 460, CODE_IF9, [1, 2, 3, 4], [-1] * 4, 0, 26, 44)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
