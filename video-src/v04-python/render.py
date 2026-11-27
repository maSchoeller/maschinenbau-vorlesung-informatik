"""Termin 04, Video 2: Python-Werkzeugkasten: while, !=, not (Karte 1 Raketenstart mit while, Lauf mit Zähler 3 bis 0,
Karte 2 mit != und not).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) startet nur der Orchestrator; die Töne liegen schon in audio/.
Code und Ausgaben wie im Labor (app/inhalte/v04/labor.mdx, Syntaxkarten sk-while und sk-ungleich-not); alles nachgerechnet."""
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v04-python"; LABEL = "DHBW · Informatik · Termin 04 · Python-Werkzeugkasten: while, !=, not"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Syntaxkarten im Labor)
CODE_W = ["zaehler = 3", "while zaehler > 0:", "    print(zaehler)", "    zaehler = zaehler - 1", 'print("Start")']
CODE_N = ["preis = 0", "print(preis != 0)", "print(not (preis >= 1 and preis <= 6))"]

_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v04", "labor.mdx")
if os.path.exists(_SEITE):
    _mdx = open(_SEITE, encoding="utf-8").read()
    for _id, _code in (("sk-while", CODE_W), ("sk-ungleich-not", CODE_N)):
        _m = re.search(r'id="' + _id + r'".*?```python\n(.*?)```', _mdx, re.S)
        assert _m and _m.group(1).splitlines() == _code, f"Code weicht von der Syntaxkarte {_id} ab"

OUT_W = run(NL.join(CODE_W)); assert OUT_W == ["3", "2", "1", "Start"], OUT_W
OUT_N = run(NL.join(CODE_N)); assert OUT_N == ["False", "True"], OUT_N

# Lauf der Schleife von Hand nachverfolgt: (Zähler vor der Prüfung, Bedingung)
PRUEF = []; _z = 3
while True:
    PRUEF.append((_z, _z > 0))
    if not _z > 0: break
    _z -= 1
assert PRUEF == [(3, True), (2, True), (1, True), (0, False)]
assert [str(z) for z, ok in PRUEF if ok] + ["Start"] == OUT_W

preis = 0
assert (preis != 0) is False and (0 != 0) is False
assert (preis >= 1) is False and (preis <= 6) is True and ((preis >= 1) and (preis <= 6)) is False
assert (not (preis >= 1 and preis <= 6)) is True
for _p in range(-5, 12):                                   # De Morgan: dasselbe wie preis < 1 or preis > 6
    assert (not (_p >= 1 and _p <= 6)) == (_p < 1 or _p > 6)

# Lage der Code-Kästen
G2 = dict(x=60, y=116, w=560, size=28, lh=48)              # Szene 2 und 3 (Raketenstart)
NOTE_X, NOTE_W = 690, 530
G4 = dict(x=60, y=116, w=800, size=28, lh=48)              # Szene 4 und 5 (Preis)


# ---------------------------------------------------------------- 1 Zwei neue Karten
ALT = ["if", "elif", "and", "or"]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zwei neue Karten im Werkzeugkasten")
    # die vier Wörter aus Termin 02 und 03: blass, hinten (oben)
    E(f, t, a(1, 0.05), lambda d, dy: TB(d, 60, 112 + dy, "Aus Termin 02 und 03, gilt weiter:", F(26, 600), GREY, 700))
    for k, wort in enumerate(ALT):
        fr = 0.3 + 0.2 * k
        def alt(d, dy, k=k, wort=wort):
            chip(d, 60 + k * 190, 154 + dy, 170, 80, wort, BOX, CODE_K, 42, outl=BOX, mono=True)
        f.el(0.55 * show(t, a(1, fr)), alt, dy=dyf(t, a(1, fr)))
    # die zwei neuen Karten: vorn, groß
    neu = [(1, ["while"], "wiederholen, solange"), (2, ["!=", "not"], "das Gegenteil")]
    t_wort = iter([a(2, 0.12), a(3, 0.3), a(3, 0.62)])
    for (nr, woerter, unter), t_k, t_u in zip(neu, (a(0, 0.3), a(0, 0.65)), (a(2, 0.55), a(3, 0.05))):
        x = 60 + (nr - 1) * 600; y = 310; w = 560; h = 300
        def karte(d, dy, x=x, nr=nr):
            card(d, x, y + dy, w, h, stripe=False); d.rounded_rectangle((x, y + dy, x + w, y + 10 + dy), 5, fill=RED)
            num_circle(d, x + 44, y + 58 + dy, 22, nr, RED)
            TB(d, x + 80, y + 58 + dy, f"Karte {nr}", F(34, 700), DARK, 300, "lm")
        E(f, t, t_k, karte)
        bw = 200 if len(woerter) == 2 else 240; gap = 40
        x0 = x + (w - (bw * len(woerter) + gap * (len(woerter) - 1))) / 2
        for j, wort in enumerate(woerter):
            def box(d, dy, xb=x0 + j * (bw + gap), wort=wort):
                d.rounded_rectangle((xb, y + 104 + dy, xb + bw, y + 200 + dy), 14, fill=BOX)
                TB(d, xb + bw / 2, y + 152 + dy, wort, M(60, True), CODE_K, bw - 24, "mm")
            E(f, t, next(t_wort), box)
        E(f, t, t_u, lambda d, dy, x=x, unter=unter: TB(d, x + w / 2, y + 250 + dy, unter, F(34, 700), DARK, w - 40, "mm"))


# ---------------------------------------------------------------- 2 Karte 1: while
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: while, wiederholen solange")
    x, y, w, size, lh = G2["x"], G2["y"], G2["w"], G2["size"], G2["lh"]
    tm = [a(0, 0.45), a(1, 0.0), a(2, 0.0), a(2, 0.2), a(3, 0.0)]
    aktiv = None
    def code(d, dy):
        return code_lauf(d, x, y + dy, w, CODE_W, t, size, lh, times=tm, aktiv=aktiv)
    f.el(ap(t, 0.2, 0.4), code)
    g = CodeGeo(x, y, w, size, lh, 5)
    # Zähler: eine Schachtel
    E(f, t, a(0, 0.6), lambda d, dy: schachtel(d, 700, 470 + dy, 220, 130, "zaehler", "3", BLUE, DARK, 56))
    E(f, t, a(0, 0.75), lambda d, dy: TB(d, 940, 535 + dy, "beginnt bei 3", F(30, 700), DARK, 280, "lm"))
    # Zeile 2: Bedingung und Doppelpunkt
    def mark_while(d, dy):
        code_markiere(d, g, 1, *spalte(CODE_W[1], "zaehler > 0"), BLUE)
        code_markiere(d, g, 1, *spalte(CODE_W[1], ":", True), RED)
    f.el(show(t, a(1, 0.35), a(2, 0.0)), mark_while)
    E(f, t, a(1, 0.4), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "Bedingung und Doppelpunkt", LIGHTR, RED, outl=RED), tout=a(2, 0.0))
    E(f, t, a(1, 0.78), lambda d, dy: zeilen_notiz(d, g, 1, NOTE_X, NOTE_W, "wahr: der Rumpf läuft", LIGHTG, GREEN, outl=GREEN), tout=a(2, 0.0))
    # Rumpf: Zeilen 3 und 4, eingerückt
    def rumpf(d, dy):
        d.rounded_rectangle((g.x + 8, g.zy(2) - 4, g.x + g.w - 8, g.zy(3) + g.lh - 5), 8, outline=AMBER, width=3)
        d.rectangle((g.x + 8, g.zy(2) - 4, g.x + 14, g.zy(3) + g.lh - 5), fill=AMBER)
    f.el(show(t, a(2, 0.12)), rumpf)
    f.el(show(t, a(2, 0.12), a(3, 0.0)), lambda d, dy: (code_einrueckung(d, g, 2), code_einrueckung(d, g, 3)))
    E(f, t, a(2, 0.12), lambda d, dy: zeilen_notiz(d, g, 2, NOTE_X, NOTE_W, "Rumpf: alles Eingerückte", LIGHTA, AMB, 24, outl=AMB))
    E(f, t, a(2, 0.55), lambda d, dy: zeilen_notiz(d, g, 3, NOTE_X, NOTE_W, "ein Zähler weniger je Durchlauf", LIGHTK, DARK, 24, outl=GREY))
    # print("Start"): nicht eingerückt
    f.el(show(t, a(3, 0.15)), lambda d, dy: code_markiere(d, g, 4, 0, 5, RED))
    E(f, t, a(3, 0.15), lambda d, dy: zeilen_notiz(d, g, 4, NOTE_X, NOTE_W, "nicht eingerückt: erst nach der Schleife", LIGHTR, RED, 24, outl=RED))
    E(f, t, a(3, 0.5), lambda d, dy: pfeil_ende(d, g))


def pfeil_ende(d, g):
    """Pfeil aus dem Rumpf hinaus nach unten zur ersten Zeile ohne Einrückung."""
    xa = g.x + g.w + 34; y1 = g.zmitte(3); y2 = g.zmitte(4)
    d.line((g.x + g.w, y1, xa, y1, xa, y2 - 10), fill=RED, width=4, joint="curve")
    pfeil(d, xa, y2 - 10, xa, y2, RED, 4, 12); d.line((xa, y2, g.x + g.w + 2, y2), fill=RED, width=4)


# ---------------------------------------------------------------- 3 Lauf mit Zähler 3 bis 0
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Ein Lauf: while fragt vor jedem Durchlauf")
    x, y, w, size, lh = G2["x"], G2["y"], G2["w"], G2["size"], G2["lh"]
    chk = [a(1, 0.1), a(2, 0.0), a(2, 0.35), a(2, 0.7)]       # while prüft
    ausg = [a(1, 0.45), a(2, 0.12), a(2, 0.47)]               # print im Rumpf
    dec = [a(1, 0.75), a(2, 0.25), a(2, 0.6)]                 # Zähler ein weniger
    t_start = a(3, 0.3)
    sched = [(0.3, set())]
    for k in range(3): sched += [(chk[k], {1}), (ausg[k], {2}), (dec[k], {3})]
    sched += [(chk[3], {1}), (t_start, {4})]
    aktiv = aktuell(t, sched)
    def code(d, dy):
        return code_lauf(d, x, y + dy, w, CODE_W, t, size, lh, aktiv=aktiv)
    f.el(1.0, code)
    g = CodeGeo(x, y, w, size, lh, 5)
    # Rücksprung: Pfeil vom Rumpf zurück zur while-Zeile, kurz nach jedem Durchlauf
    xa = g.x + g.w + 34; y3 = g.zmitte(3); y1 = g.zmitte(1)
    for k in range(3):
        def zurueck(d, dy):
            d.line((g.x + g.w + 2, y3, xa, y3, xa, y1 + 12), fill=RED, width=4, joint="curve")
            pfeil(d, xa, y1 + 12, xa, y1, RED, 4, 12); d.line((xa, y1, g.x + g.w + 2, y1), fill=RED, width=4)
        f.el(show(t, dec[k] + 0.05, dec[k] + 1.1), zurueck)
    # Prüfliste rechts
    E(f, t, a(0, 0.45), lambda d, dy: TB(d, NOTE_X, 140 + dy, "Vor jedem Durchlauf: zaehler > 0 ?", F(28, 700), DARK, NOTE_W, "lm"))
    for k, (z, ok) in enumerate(PRUEF):
        assert ok == (z > 0)
        txt = f"{z} > 0: " + ("Ja" if ok else "Nein")
        fill, col = (LIGHTG, GREEN) if ok else (LIGHTR, RED)
        E(f, t, chk[k], lambda d, dy, k=k, txt=txt, fill=fill, col=col: tag(d, NOTE_X, 176 + k * 56 + dy, 250, 48, txt, fill, col, 28, outl=col))
    # Zähler als Schachtel, ändert sich nach jedem Durchlauf
    def zaehler_wert(tt): return 3 - sum(1 for z in dec if tt >= z)
    def schacht(d, dy):
        schachtel(d, NOTE_X + 330, 190 + dy, 190, 130, "zaehler", str(zaehler_wert(t)), BLUE, DARK, 56)
    E(f, t, a(0, 0.7), schacht)
    # Ausgabe
    def konsole(d, dy):
        zl = [(ausg[k], str(PRUEF[k][0]), None, None) for k in range(3)] + [(t_start, "Start", None, None)]
        assert [z[1] for z in zl] == OUT_W
        lauf_panel(d, x, 450 + dy, w, zl, t, 28, 40, "Ausgabe")
    E(f, t, ausg[0] - 0.2, konsole)
    E(f, t, a(4, 0.12), lambda d, dy: tag(d, NOTE_X, 590 + dy, NOTE_W, 76, "Die Bedingung muss sich im Rumpf ändern", RED, WHITE, 26))


# ---------------------------------------------------------------- 4 Karte 2: !=
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 2: != fragt nach dem Gegenteil")
    x, y, w, size, lh = G4["x"], G4["y"], G4["w"], G4["size"], G4["lh"]
    lines = CODE_N[:2]
    tm = [a(0, 0.45), a(1, 0.0)]
    f.el(ap(t, 0.2, 0.4), lambda d, dy: code_lauf(d, x, y + dy, w, lines, t, size, lh, times=tm))
    g = CodeGeo(x, y, w, size, lh, 2)
    f.el(show(t, a(1, 0.45), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 1, *spalte(CODE_N[1], "!="), RED))
    # darunter: eingesetzt und Ergebnis
    E(f, t, a(2, 0.0), lambda d, dy: zeilen_notiz(d, g, 1, 880, 340, "0 != 0 ist falsch", LIGHTR, RED, 26, outl=RED))
    f.el(show(t, a(1, 0.8), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 1, *spalte(CODE_N[1], "preis"), BLUE))
    t_out = a(2, 0.55)
    E(f, t, t_out - 0.2, lambda d, dy: lauf_panel(d, x, 330 + dy, 420, [(t_out, OUT_N[0], None, None)], t, 28, 44, "Ausgabe"))
    # die beiden Zeichen
    def zeichen(d, dy):
        for cx, zch, name in ((620, "!", "Ausrufezeichen"), (880, "=", "Gleichheitszeichen")):
            d.rounded_rectangle((cx - 75, 360 + dy, cx + 75, 510 + dy), 14, fill=BOX)
            TB(d, cx, 435 + dy, zch, M(96, True), CODE_K, 120, "mm")
            TB(d, cx, 540 + dy, name, F(24, 700), DARK, 250, "mm")
        TB(d, 750, 435 + dy, "+", F(60, 700), GREY, 60, "mm")
        pfeil(d, 975, 435 + dy, 1035, 435 + dy, GREY, 6, 18)
        d.rounded_rectangle((1050, 360 + dy, 1200, 510 + dy), 14, fill=LIGHTR, outline=RED, width=3)
        TB(d, 1125, 435 + dy, "!=", M(80, True), RED, 130, "mm")
        TB(d, 1125, 540 + dy, "ungleich", F(24, 700), DARK, 250, "mm")
    E(f, t, a(1, 0.15), zeichen)
    E(f, t, a(3, 0.2), lambda d, dy: tag(d, 60, 612 + dy, 1160, 64, "Gleich bei Schleifen: Sie enden, wenn eine Eingabe 0 ist", RED, WHITE, 30))


# ---------------------------------------------------------------- 5 not
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "not dreht wahr und falsch um")
    x, y, w, size, lh = G4["x"], G4["y"], G4["w"], G4["size"], G4["lh"]
    tm = [-1, -1, a(0, 0.25)]
    f.el(1.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE_N, t, size, lh, times=tm))
    g = CodeGeo(x, y, w, size, lh, 3)
    zl = CODE_N[2]; kl = spalte(zl, "(preis >= 1 and preis <= 6)")
    # not und die Klammer
    f.el(show(t, a(0, 0.55), a(1, 0.0)), lambda d, dy: code_markiere(d, g, 2, *spalte(zl, "not"), RED))
    def kl_mark(d, dy):
        code_markiere(d, g, 2, *kl, BLUE)
    f.el(show(t, a(1, 0.0)), kl_mark)
    f.el(show(t, a(2, 0.0)), lambda d, dy: code_markiere(d, g, 2, *spalte(zl, "not"), RED))
    yb = g.y + g.h + 12
    def klammer(d, dy):
        xa, xb = g.cx(kl[0]), g.cx(kl[1]); yy = yb + dy
        d.line((xa, yy, xa, yy + 10, xb, yy + 10, xb, yy), fill=BLUE, width=4, joint="curve")
    E(f, t, a(1, 0.1), klammer)
    # eingesetzt: 0 >= 1 and 0 <= 6
    yr = yb + 36; hc = 64
    txt = f"{preis} >= 1 and {preis} <= 6"
    assert eval(txt) is False
    E(f, t, a(1, 0.35), lambda d, dy: TB(d, 60, yr + hc / 2 + dy, txt, M(36, True), DARK, 480, "lm"))
    xe = 60 + M(36, True).getlength(txt)
    def erg1(d, dy):
        pfeil(d, xe + 20, yr + hc / 2 + dy, xe + 76, yr + hc / 2 + dy, GREY, 6, 18)
        wert_chip(d, xe + 90, yr + dy, "False", hc)
    E(f, t, a(1, 0.8), erg1)
    xc = xe + 90 + F(int(hc * 0.6), 700).getlength("False") + hc * 0.9      # rechte Kante des ersten Chips
    def erg2(d, dy):
        pfeil(d, xc + 20, yr + hc / 2 + dy, xc + 76, yr + hc / 2 + dy, RED, 6, 18)
        TB(d, xc + 48, yr + hc / 2 - 30 + dy, "not", M(30, True), RED, 90, "mm")
        x_end = wert_chip(d, xc + 90, yr + dy, "True", hc)
        assert x_end <= 1180, x_end
    E(f, t, a(2, 0.35), erg2)
    # Ausgabe: beide Zeilen untereinander
    zl_out = [(-1, OUT_N[0], None, None), (a(2, 0.7), OUT_N[1], None, None)]
    E(f, t, 0.3, lambda d, dy: lauf_panel(d, 60, 472 + dy, 420, zl_out, t, 28, 44, "Ausgabe", hl={1} if t >= a(2, 0.7) else None))
    # De Morgan
    def morgan(d, dy):
        card(d, 540, 472 + dy, 680, 146, stripe=False)
        TB(d, 570, 506 + dy, "Nach De Morgan dasselbe:", F(28, 700), DARK, 620, "lm")
        d.rounded_rectangle((570, 538 + dy, 1190, 598 + dy), 10, fill=BOX)
        TB(d, 880, 568 + dy, "preis < 1 or preis > 6", M(32), CODE_T, 580, "mm")
    E(f, t, a(3, 0.05), morgan)
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, 60, 634 + dy, 1160, 54, "Probier beide Karten aus und ändere die Werte", RED, WHITE, 30))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "wiederholen und das Gegenteil bilden", F(34, 400), GREY)
        for k, wort in enumerate(("while", "!=", "not")):
            chip(d, 90 + k * 186, 470, 170, 70, wort, BOX, CODE_K, 40, outl=BOX, mono=True)
        code_n(d, 800, 150, 420, CODE_W, list(range(1, 6)), [-1] * 5, 0, 22, 38)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
