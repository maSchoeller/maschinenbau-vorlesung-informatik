"""Termin 06, Video 2: Python-Werkzeugkasten: range mit Schrittweite (Karte 1), Schleife in Schleife (Karte 2), Hex und Bits zum Nachpruefen (Karte 3).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie im Labor (app/inhalte/v06/labor.mdx, Syntaxkarten); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v06-python"; LABEL = "DHBW · Informatik · Termin 06 · Python-Werkzeugkasten: Schrittweite, Schleife in Schleife, Nachprüfen"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Syntaxkarten im Labor)
CODE_K1 = ["for i in range(0, 11, 5):", "    print(i)", 'print("fertig")']
OUT_K1 = run(NL.join(CODE_K1)); assert OUT_K1 == ["0", "5", "10", "fertig"]
assert list(range(0, 11, 5)) == [0, 5, 10] and 11 not in range(0, 11, 5) and len(range(0, 11, 5)) == 3
assert list(range(5, 0, -1)) == [5, 4, 3, 2, 1] and 0 not in range(5, 0, -1)
assert list(range(10, 0, -3)) == [10, 7, 4, 1]
assert list(range(5, 0)) == [] and list(range(1, 6, -1)) == []
try:
    list(range(0, 5, 0)); raise AssertionError("Schritt 0 muss einen Fehler geben")
except ValueError as _e:
    FEHLER0 = f"{type(_e).__name__}: {_e}"
assert FEHLER0 == "ValueError: range() arg 3 must not be zero", FEHLER0

CODE_K2 = ["for i in range(1, 3):", "    for j in range(1, 4):", '        print(f"{i} und {j}")', 'print("fertig")']
OUT_K2 = run(NL.join(CODE_K2))
assert OUT_K2 == ["1 und 1", "1 und 2", "1 und 3", "2 und 1", "2 und 2", "2 und 3", "fertig"], OUT_K2
assert len(range(1, 3)) * len(range(1, 4)) == 6

CODE_K3 = ["print(0xE2)               # 226, die Hexzahl E2",
           "print(0b11100010)         # 226, dasselbe Byte in binär",
           "print(hex(226))           # 0xe2, Python schreibt klein",
           "print(bin(37))            # 0b100101, ohne führende Nullen",
           'print(int("E2", 16))      # 226, den Text E2 als Hexzahl lesen',
           "a = 0b1100",
           "b = 0b1010",
           "print(a & b)              # 8, UND bitweise",
           "print(a | b)              # 14, ODER bitweise",
           "print(a ^ b)              # 6, XOR bitweise",
           "print(bin(a ^ b))         # 0b110"]
OUT_K3 = run(NL.join(CODE_K3))
assert OUT_K3 == ["226", "226", "0xe2", "0b100101", "226", "8", "14", "6", "0b110"], OUT_K3
for _z in CODE_K3:                                                       # die Kommentare sagen das, was Python ausgibt
    if "#" in _z and _z.startswith("print"):
        _k = _z.split("#")[1].strip().split(",")[0]; assert _k in OUT_K3, _z
assert 0xE2 == 226 == 0b11100010 == int("E2", 16) and hex(226) == "0xe2" and bin(37) == "0b100101" and 0b1100 ^ 0b1010 == 6 == 0b110

STOPP_ROT = (255, 120, 130)


# ---------------------------------------------------------------- eigene Bausteine (nur dieses Video)
def zbox(d, x, y, txt, mode="n", w=100, h=100, strike=False, size=52):
    """Ein Wert der Zahlenreihe. mode: n = normal, a = gerade dran (rot), s = Stoppwert (gestrichelt, gehoert nicht dazu)."""
    imbild(y, y + h, "Zahlenfeld")
    if mode == "s":
        d.rounded_rectangle((x, y, x + w, y + h), 12, fill=BG)
        gestrichelt(d, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], GREYL, 3)
        TB(d, x + w / 2, y + h / 2, txt, F(size, 700), GREYL, w - 12, "mm", "Zahl")
        if strike: durchstreichen(d, x + 12, y + 12, x + w - 12, y + h - 12)
    else:
        col = RED if mode == "a" else LINE
        d.rounded_rectangle((x, y, x + w, y + h), 12, fill=LIGHTR if mode == "a" else WHITE, outline=col, width=4 if mode == "a" else 2)
        TB(d, x + w / 2, y + h / 2, txt, F(size, 700), RED if mode == "a" else DARK, w - 12, "mm", "Zahl")


def range_label(d, x, y, code, w=330, h=70, size=30):
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX)
    TB(d, x + w / 2, y + h / 2, code, M(size, True), CODE_K, w - 24, "mm", "range")
    pfeil(d, x + w + 12, y + h / 2, x + w + 60, y + h / 2, GREY, 6, 18)


def karte_neu(d, x, y, w, h, nr, titel, code, untertitel, col=RED):
    """Karte aus dem Werkzeugkasten (wie werkzeugkarte in b02, mit kleinerer Titelschrift fuer lange Titel)."""
    imbild(y, y + h, "Werkzeugkarte")
    card(d, x, y, w, h, stripe=False); d.rounded_rectangle((x, y, x + w, y + 10), 5, fill=col)
    num_circle(d, x + 44, y + 58, 22, nr, col)
    TB(d, x + 80, y + 58, titel, F(30, 700), DARK, w - 100, "lm", "Kartentitel")
    d.rounded_rectangle((x + 20, y + 100, x + w - 20, y + 160), 10, fill=BOX)
    TB(d, x + w / 2, y + 130, code, M(26), CODE_T, w - 64, "mm", "Kartencode")
    TB(d, x + 24, y + 180, untertitel, F(26, 600), GREY, w - 48, "la", "Karten-Untertitel")


# ---------------------------------------------------------------- 1 Drei neue Karten
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Drei neue Karten im Werkzeugkasten")
    E(f, t, a(0, 0.05), lambda d, dy: TB(d, 60, 116 + dy, "Aus Termin 05, gilt weiter: for und range, if ohne else", F(26, 600), GREY, 1000))
    neu = [(1, "Schrittweite", "range(0, 11, 5)", "Sprünge und rückwärts", a(1, 0.0)),
           (2, "Schleife in Schleife", "for i … for j …", "eine in der anderen", a(2, 0.0)),
           (3, "Nachprüfen", 'int("E2", 16)', "Hex und Bits in Python", a(3, 0.0))]
    for k, (nr, titel, code, unter, tin) in enumerate(neu):
        E(f, t, tin, lambda d, dy, k=k, nr=nr, titel=titel, code=code, unter=unter: karte_neu(d, 60 + k * 400, 190 + dy, 360, 250, nr, titel, code, unter))
    E(f, t, a(3, 0.5), lambda d, dy: tag(d, 60, 500 + dy, 1160, 64, "Alles aus Termin 02 bis 05 gilt weiter", LIGHTK, DARK, 30, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Karte 1: range mit Start, Stopp, Schritt
G = dict(x=60, y=116, w=520, size=28, lh=48)

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: Sprünge mit range")
    x, y, w, size, lh = G["x"], G["y"], G["w"], G["size"], G["lh"]
    tm = [a(0, 0.04), a(0, 0.5), a(2, 0.5)]
    aktiv = aktuell(t, [(a(1, 0.0), {0}), (a(1, 0.3), {1}), (a(2, 0.55), {2}), (a(2, 0.95), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K1, t, size, lh, times=tm, aktiv=aktiv))
    g = CodeGeo(x, y, w, size, lh, 3)
    zahlen = [("0", a(0, 0.3), BLUE, LIGHTB, "Start"), ("11", a(0, 0.6), RED, LIGHTR, "Stopp"), ("5", a(0, 0.85), AMB, LIGHTA, "Schritt")]
    k0 = CODE_K1[0].index("(") + 1
    cols = [(k0, k0 + 1), spalte(CODE_K1[0], "11"), (CODE_K1[0].index("5)"), CODE_K1[0].index("5)") + 1)]
    assert CODE_K1[0][k0] == "0" and CODE_K1[0][cols[2][0]] == "5"
    for k, ((zahl, tin, col, fill, wort), (c0, c1)) in enumerate(zip(zahlen, cols)):
        E(f, t, tin, lambda d, dy, k=k, zahl=zahl, col=col, fill=fill, wort=wort, c0=c0, c1=c1: (
            code_markiere(d, CodeGeo(x, y + dy, w, size, lh, 3), 0, c0, c1, col),
            tag(d, 620 + k * 200, 128 + dy, 180, 56, f"{wort} {zahl}", fill, col, 28, 700, outl=col)))
    # Zahlenreihe: i springt um 5, die 11 gehoert nicht dazu
    X0, Y0, DX = 620, 300, 150
    E(f, t, a(1, 0.0), lambda d, dy: TB(d, 620, 262 + dy, "i nimmt der Reihe nach an:", F(28, 600), GREY, 560, "lm"))
    for k, v in enumerate((0, 5, 10)):
        tk = a(1, 0.3 + 0.3 * k)
        def feld(d, dy, k=k, v=v, tk=tk):
            nxt = a(1, 0.3 + 0.3 * (k + 1)) if k < 2 else a(2, 0.0)
            zbox(d, X0 + k * DX, Y0 + dy, str(v), "a" if tk <= t < nxt else "n")
        E(f, t, tk, feld)
        if k < 2:
            E(f, t, tk + 0.4, lambda d, dy, k=k: (pfeil(d, X0 + k * DX + 106, Y0 + 50 + dy, X0 + (k + 1) * DX - 8, Y0 + 50 + dy, AMB, 4, 12),
                                                   TB(d, X0 + k * DX + DX / 2 + 48, Y0 + 24 + dy, "+ 5", F(26, 700), AMB, 80, "mm")))
    E(f, t, a(2, 0.05), lambda d, dy: zbox(d, X0 + 3 * DX, Y0 + dy, "11", "s", strike=True))
    E(f, t, a(2, 0.15), lambda d, dy: TB(d, X0 + 3 * DX + 50, Y0 + 124 + dy, "Stoppwert: nicht dabei", F(26, 700), RED, 300, "ma"))
    # Ausgabe aus einem echten Lauf
    zl = [(a(2, 0.55 + 0.1 * k), s, None, None) for k, s in enumerate(OUT_K1[:3])] + [(a(2, 0.9), OUT_K1[3], None, None)]
    E(f, t, a(2, 0.5), lambda d, dy: lauf_panel(d, x, 352 + dy, w, zl, t, 28, 40, "Ausgabe"))
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, 620, 560 + dy, 600, 64, "3 Durchläufe: 0, 5 und 10", RED, WHITE, 32))


# ---------------------------------------------------------------- 3 Rueckwaerts, nur lesen, gegen den Schritt, Schritt 0
def reihe_zeile(f, t, y, code, vals, t_code, t_vals, stopp=None, t_stopp=None, notiz=None, t_notiz=None, col=DARK):
    X0, DX = 450, 118
    E(f, t, t_code, lambda d, dy: range_label(d, 60, y + dy, code, 330))
    for v, tk in zip(vals, t_vals):
        k = vals.index(v)
        E(f, t, tk, lambda d, dy, v=v, k=k: zbox(d, X0 + k * DX, y + dy + 0, str(v), "n", 100, 70, size=40))
    if stopp is not None:
        E(f, t, t_stopp, lambda d, dy: zbox(d, X0 + len(vals) * DX, y + dy, str(stopp), "s", 100, 70, strike=True, size=40))
    if notiz: E(f, t, t_notiz, lambda d, dy: notiz(d, y + dy))


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Rückwärts zählen und Grenzen")
    Y = [130, 250, 370, 490]
    # Countdown
    reihe_zeile(f, t, Y[0], "range(5, 0, -1)", [5, 4, 3, 2, 1], a(0, 0.05), [a(0, 0.3 + 0.12 * k) for k in range(5)], 0, a(0, 0.7))
    # nur lesen
    reihe_zeile(f, t, Y[1], "range(10, 0, -3)", [10, 7, 4, 1], a(1, 0.1), [a(1, 0.35 + 0.1 * k) for k in range(4)])
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, 1010, Y[1] + 7 + dy, 210, 56, "nur lesen", LIGHTA, AMB, 28, 700, outl=AMB))
    # gegen den Schritt
    E(f, t, a(2, 0.05), lambda d, dy: range_label(d, 60, Y[2] + dy, "range(5, 0)", 330))
    E(f, t, a(2, 0.3), lambda d, dy: (d.rounded_rectangle((450, Y[2] + dy, 1220, Y[2] + 70 + dy), 12, fill=WHITE, outline=RED, width=3),
                                      TB(d, 835, Y[2] + 35 + dy, "keine Zahl: der Rumpf läuft nie, Python schweigt", F(30, 700), RED, 740, "mm", "Hinweis")))
    # Schritt 0
    E(f, t, a(3, 0.05), lambda d, dy: range_label(d, 60, Y[3] + dy, "range(0, 5, 0)", 330))
    E(f, t, a(3, 0.3), lambda d, dy: monobox(d, 450, Y[3] + dy, 770, 70, FEHLER0, 28, STOPP_ROT))
    E(f, t, a(3, 0.55), lambda d, dy: tag(d, 450, Y[3] + 90 + dy, 770, 56, "Der Schritt darf nie 0 sein", LIGHTR, RED, 28, 700, outl=RED))


# ---------------------------------------------------------------- 4 Karte 2: Schleife in Schleife
G2 = dict(x=60, y=116, w=640, size=26, lh=46)
RX, RY, RW, RH = 720, 190, 130, 90        # Raster rechts

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 2: Schleife in Schleife")
    x, y, w, size, lh = G2["x"], G2["y"], G2["w"], G2["size"], G2["lh"]
    tm = [a(0, 0.05), a(0, 0.32), a(0, 0.5), a(0, 0.9)]
    paare = [a(2, pos(4, 2, nm)) for nm in ("eins und eins", "eins und zwei", "eins und drei", "zwei und eins", "zwei und zwei", "zwei und drei")]
    t_fertig = a(3, 0.0)
    nr = -1
    for q in range(6):
        if t >= paare[q]: nr = q
    aktiv = aktuell(t, [(a(0, 0.3), {0}), (a(0, 0.5), {1}), (paare[0], {2}), (t_fertig, {3}), (a(3, 0.8), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K2, t, size, lh, times=tm, aktiv=aktiv))
    # Satz 1: aeussere und innere Schleife
    E(f, t, a(0, 0.12), lambda d, dy: code_markiere(d, CodeGeo(x, y + dy, w, size, lh, 4), 0, 4, 5, RED), tout=a(0, 0.5))
    E(f, t, a(0, 0.55), lambda d, dy: code_einrueckung(d, CodeGeo(x, y + dy, w, size, lh, 4), 1), tout=a(1, 0.0))
    E(f, t, a(0, 0.58), lambda d, dy: zeilen_notiz(d, CodeGeo(x, y + dy, w, size, lh, 4), 1, 720, 360, "innen: im Rumpf der äußeren", LIGHTA, AMB, size=22, outl=AMB), tout=a(1, 0.0))
    E(f, t, a(0, 0.18), lambda d, dy: zeilen_notiz(d, CodeGeo(x, y + dy, w, size, lh, 4), 0, 720, 360, "außen: i von 1 bis 2", LIGHTR, RED, size=22, outl=RED), tout=a(1, 0.0))
    # Raster: Zeilen = i, Spalten = j
    def raster(d, dy):
        for j in range(3): TB(d, RX + 100 + j * RW + RW / 2, RY - 24 + dy, f"j = {j + 1}", F(26, 700), BLUE, RW - 10, "mm", "Spalte")
        for i in range(2): TB(d, RX, RY + i * RH + RH / 2 + dy, f"i = {i + 1}", F(26, 700), RED, 110, "lm", "Zeile")
        for i in range(2):
            for j in range(3):
                q = 3 * i + j; xx = RX + 100 + j * RW; yy = RY + i * RH + dy
                da = t >= paare[q]; cur = (q == nr and t < t_fertig)
                d.rounded_rectangle((xx + 6, yy + 6, xx + RW - 6, yy + RH - 6), 12, fill=LIGHTR if cur else (WHITE if da else BG), outline=RED if cur else LINE, width=4 if cur else 2)
                if da: TB(d, xx + RW / 2, yy + RH / 2, f"{i + 1} und {j + 1}", M(26, True), RED if cur else DARK, RW - 24, "mm", "Paar")
    E(f, t, a(1, 0.0), raster)
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 720, 410 + dy, 500, 54, "für jedes i: j von vorn", LIGHTA, AMB, 28, 700, outl=AMB), tout=a(2, 0.0))
    E(f, t, a(2, 0.78), lambda d, dy: tag(d, 720, 410 + dy, 500, 54, "2 · 3 = 6 Durchläufe", RED, WHITE, 30, 700))
    # Ausgabe
    zl = [(paare[q], OUT_K2[q], None, None) for q in range(6)] + [(t_fertig + 0.2, OUT_K2[6], None, None)]
    E(f, t, a(2, 0.0), lambda d, dy: lauf_panel(d, x, 386 + dy, 640, zl, t, 22, 30, "Ausgabe"))
    E(f, t, t_fertig, lambda d, dy: tag(d, 720, 500 + dy, 500, 56, "fertig: ganz links, läuft einmal", LIGHTK, DARK, 28, 700, outl=GREY))


# ---------------------------------------------------------------- 5 Karte 3: Hex und Bits zum Nachpruefen
G3 = dict(x=60, y=112, w=840, size=22, lh=38)
NX, NW = 920, 300

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Karte 3: zum Nachprüfen")
    x, y, w, size, lh = G3["x"], G3["y"], G3["w"], G3["size"], G3["lh"]
    n = len(CODE_K3)
    tm = [a(1, 0.02), a(1, 0.45), a(2, 0.02), a(2, 0.08), a(2, 0.55), a(3, 0.05), a(3, 0.15), a(3, 0.3), a(3, 0.4), a(3, 0.5), a(3, 0.7)]
    tm[0] = min(tm[0], a(0, 0.5)); tm[1] = min(tm[1], a(0, 0.7)); tm[2] = min(tm[2], a(0, 0.8)); tm[3] = min(tm[3], a(0, 0.9))
    aktiv = aktuell(t, [(a(1, 0.0), {0}), (a(1, 0.45), {1}), (a(2, 0.0), {2}), (a(2, 0.55), {4}), (a(3, 0.0), {5, 6, 9}), (a(3, 0.85), None)])
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_K3, t, size, lh, times=tm, aktiv=aktiv, title="Python (Karte 3)"))
    geo = lambda dy: CodeGeo(x, y + dy, w, size, lh, n)
    E(f, t, a(1, 0.02), lambda d, dy: code_markiere(d, geo(dy), 0, 6, 10, RED), tout=a(1, 0.45))
    E(f, t, a(1, 0.02), lambda d, dy: zeilen_notiz(d, geo(dy), 0, NX, NW, "0x: Hexzahl", LIGHTR, RED, size=22, h=34, outl=RED))
    E(f, t, a(1, 0.45), lambda d, dy: code_markiere(d, geo(dy), 1, 6, 16, BLUE))
    E(f, t, a(1, 0.45), lambda d, dy: zeilen_notiz(d, geo(dy), 1, NX, NW, "0b: Binärzahl", LIGHTB, BLUE, size=22, h=34, outl=BLUE))
    E(f, t, a(2, 0.02), lambda d, dy: zeilen_notiz(d, geo(dy), 2, NX, NW, "Python: klein", LIGHTA, AMB, size=22, h=34, outl=AMB))
    E(f, t, a(2, 0.55), lambda d, dy: (code_markiere(d, geo(dy), 4, *spalte(CODE_K3[4], 'int("E2", 16)'), GREEN),
                                        zeilen_notiz(d, geo(dy), 4, NX, NW, "E2 als Hexzahl lesen", LIGHTG, GREEN, size=22, h=34, outl=GREEN)))
    E(f, t, a(3, 0.05), lambda d, dy: zeilen_notiz(d, geo(dy), 5, NX, NW, "a = 12, b = 10", LIGHTK, DARK, size=22, h=34, outl=GREY))
    E(f, t, a(3, 0.5), lambda d, dy: (code_markiere(d, geo(dy), 9, 6, 11, RED), zeilen_notiz(d, geo(dy), 9, NX, NW, "^ ist XOR, nicht hoch", LIGHTR, RED, size=22, h=34, outl=RED)))
    E(f, t, a(0, 0.2), lambda d, dy: tag(d, 60, 612 + dy, 840, 56, "nur zum Nachprüfen, nicht in Aufgaben", RED, WHITE, 30), tout=a(3, 0.9))
    E(f, t, a(3, 0.9), lambda d, dy: tag(d, 60, 612 + dy, 840, 56, "Rechne zuerst auf Papier, dann vergleichst du", LIGHTK, DARK, 28, 700, outl=LINE))


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "in Sprüngen, ineinander, nachgeprüft", F(34, 400), GREY)
        for k, wort in enumerate(("range", "for … for", "0xE2")):
            chip(d, 90 + k * 230, 470, 215, 70, wort, BOX, CODE_K, 32, outl=BOX, mono=True)
        code_n(d, 760, 150, 460, CODE_K1, [1, 2, 3], [-1] * 3, 0, 26, 44)
        code_n(d, 760, 330, 460, CODE_K2, [1, 2, 3, 4], [-1] * 4, 0, 24, 44)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
