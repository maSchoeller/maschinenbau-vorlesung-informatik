"""Termin 07, Video 1: Ein Byte, zwei Lesarten (Kilometerzaehler laeuft ueber, Byte 255 + 1 wird 0, Zahlenkreis mit Vorzeichen,
Python-Ganzzahlen wachsen mit).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v07-theorie"; LABEL = "DHBW · Informatik · Termin 07 · Ein Byte, zwei Lesarten"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
assert 99999 + 1 == 100000 and (99999 + 1) % 10 ** 5 == 0 and len(str(99999)) == 5
assert 2 ** 8 == 256 and int("11111111", 2) == 255 and (255 + 1) % 256 == 0 and f"{255 + 1:b}" == "100000000" and len(f"{256:b}") == 9
WERTE = [128, 64, 32, 16, 8, 4, 2, 1]
assert sum(WERTE) == 255
def vorz(bits):
    """Wert eines Bytes mit Vorzeichen: oberstes Bit zaehlt minus 128."""
    b = [int(c) for c in bits]; return -128 * b[0] + sum(w * x for w, x in zip(WERTE[1:], b[1:]))
assert vorz("11111111") == -128 + 127 == -1 and vorz("10000000") == -128 and vorz("01111111") == 127 and vorz("11111110") == -2
assert vorz("00000000") == 0 and (127 + 1 - 256) == -128 and vorz("10000000") == (128 - 256)
TABELLE = [("0000 0000", 0), ("0111 1111", 127), ("1000 0000", 128), ("1111 1110", 254), ("1111 1111", 255)]
for _b, _u in TABELLE:
    assert int(_b.replace(" ", ""), 2) == _u
TAB_VZ = [vorz(b.replace(" ", "")) for b, _ in TABELLE]
assert TAB_VZ == [0, 127, -128, -2, -1], TAB_VZ
MIN8, MAX8 = -128, 127
assert MIN8 == -2 ** 7 and MAX8 == 2 ** 7 - 1
CODE = ["print(4294967295 + 1)", "print(2 ** 64 + 1)"]
OUT = run(NL.join(CODE))
assert OUT == ["4294967296", "18446744073709551617"], OUT
assert len(OUT[1]) == 20 and 2 ** 64 + 1 > 18446744073709551615 == 2 ** 64 - 1 and 4294967295 == 2 ** 32 - 1
MINUS = "−"
def zahl(n): return str(n).replace("-", MINUS)


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
def feld(d, x, y, w, h, txt, size, col=DARK, fill=WHITE, outl=LINE, wd=2, mono=True, what="Feld"):
    imbild(y, y + h, what)
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl, width=wd)
    TB(d, x + w / 2, y + h / 2, txt, M(size, True) if mono else F(size, 700), col, w - 8, "mm", what)


def leer(d, x, y, w, h, txt=None, size=40, col=GREYL):
    """Gestrichelte, leere Stelle (gibt es nicht)."""
    imbild(y, y + h, "leere Stelle")
    gestrichelt(d, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], GREYL, 3)
    if txt: TB(d, x + w / 2, y + h / 2, txt, F(size, 700), col, w - 8, "mm", "leere Stelle")


# ---------------------------------------------------------------- 1 Der Kilometerzaehler
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Der Kilometerzähler läuft über")
    t_spr = a(1, pos(1, 1, "springt"))
    cw, ch, gap, x0, y0 = 120, 170, 14, 360, 170
    E(f, t, a(0, 0.15), lambda d, dy: TB(d, x0 + (5 * (cw + gap) - gap) / 2, y0 - 22 + dy, "Kilometerzähler mit fünf Rädern", F(28, 600), GREY, 700, "mm", "Beschriftung"))
    def raeder(d, dy):
        vor = t < t_spr
        for k in range(5):
            if vor: feld(d, x0 + k * (cw + gap), y0 + dy, cw, ch, "9", 100, AMB, LIGHTA, AMB, 3, what="Rad")
            else: feld(d, x0 + k * (cw + gap), y0 + dy, cw, ch, "0", 100, RED, LIGHTR, RED, 3, what="Rad")
    E(f, t, a(0, 0.1), raeder)
    E(f, t, a(1, 0.0), lambda d, dy: (tag(d, 40, y0 + 30 + dy, 250, 56, "+ 1 Kilometer", LIGHTK, DARK, 28, 700, outl=LINE),
                                      pfeil(d, 300, y0 + 58 + dy, 352, y0 + 58 + dy, GREY, 5, 15)), tout=t_spr)
    # ein sechstes Rad gibt es nicht
    t_sechs = a(1, pos(1, 1, "Ein sechstes"))
    E(f, t, t_sechs, lambda d, dy: (leer(d, x0 - 150, y0 + dy, cw, ch, "6.", 60),
                                    TB(d, x0 - 90, y0 + ch + 40 + dy, "gibt es nicht", F(28, 700), GREY, 260, "mm", "Beschriftung")))
    E(f, t, t_spr, lambda d, dy: tag(d, 360, 420 + dy, 670, 76, "Überlauf: zurück auf 0", RED, WHITE, 42))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 160, 560 + dy, 960, 70, "Im Rechner läuft ein Zähler genauso über", LIGHTK, DARK, 36, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Ein Byte: 255 + 1
BX0, BW, BH, BGAP, BY = 330, 92, 120, 10, 250

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Ein Byte: aus 255 plus 1 wird 0")
    t_voll = a(1, 0.0); t_plus = a(1, pos(2, 1, "Zählst du")); t_neun = a(1, pos(2, 1, "eine neunte")); t_null = a(2, pos(2, 2, "Übrig"))
    t_streich = a(2, 0.0)
    def bits():
        return "00000000" if t < t_voll else ("11111111" if t < t_null else "00000000")
    def schalter(d, dy):
        b = bits()
        for k in range(8):
            x = BX0 + k * (BW + BGAP); an = b[k] == "1"
            TB(d, x + BW / 2, BY - 26 + dy, str(WERTE[k]), F(24, 600), GREY, BW, "mm", "Gewicht")
            feld(d, x, BY + dy, BW, BH, b[k], 70, GREEN if an else GREY, LIGHTG if an else WHITE, GREEN if an else LINE, 3 if an else 2, what="Schalter")
    E(f, t, a(0, 0.2), schalter)
    E(f, t, a(0, 0.2), lambda d, dy: TB(d, BX0 + (8 * (BW + BGAP) - BGAP) / 2, 164 + dy, "acht Schalter, jeder 0 oder 1", F(30, 700), DARK, 800, "mm", "Beschriftung"))
    # Wert rechts unten
    def wert(d, dy):
        b = bits(); n = int(b, 2)
        TB(d, BX0, 430 + dy, "Wert:", F(32, 600), GREY, 120, "lm", "Wert")
        TB(d, BX0 + 120, 430 + dy, str(n), F(60, 700), RED if n == 255 else DARK, 200, "lm", "Wert")
    E(f, t, a(0, 0.5), wert)
    E(f, t, a(0, pos(2, 0, "zweihundertsechs")), lambda d, dy: tag(d, 700, 408 + dy, 436, 56, "256 Werte: 0 bis 255", LIGHTK, DARK, 30, 700, outl=LINE))
    # + 1 und neunte Stelle
    E(f, t, t_plus, lambda d, dy: tag(d, 120, BY + 30 + dy, 150, 60, "+ 1", AMB, WHITE, 38), tout=t_null)
    def neunte(d, dy):
        x = BX0 - (BW + BGAP)
        feld(d, x, BY + dy, BW, BH, "1", 70, AMB, LIGHTA, AMB, 3, what="neunte Stelle")
        if t >= t_streich: durchstreichen(d, x + 8, BY + 10 + dy, x + BW - 8, BY + BH - 10 + dy)
    E(f, t, t_neun, neunte)
    E(f, t, t_neun + 0.3, lambda d, dy: TB(d, BX0 - (BW + BGAP) / 2 - 10, BY + BH + 36 + dy, "9. Stelle", F(26, 700), AMB, 160, "mm", "Beschriftung"), tout=t_null)
    E(f, t, t_streich, lambda d, dy: tag(d, 120, 520 + dy, 470, 56, "diese Stelle gibt es nicht", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 330, 520 + dy, 830, 64, "255 + 1 = 0, ohne Fehlermeldung", RED, WHITE, 38))
    E(f, t, a(3, pos(2, 3, "Ein Werkst")), lambda d, dy: tag(d, 330, 604 + dy, 830, 56, "z. B. ein Werkstückzähler: von 255 auf 0", LIGHTK, DARK, 28, 700, outl=LINE))


# ---------------------------------------------------------------- 3 Zahlenkreis und Vorzeichen
CX, CY, CR = 300, 395, 170

def winkel(v): return -90 + 360 * v / 256
def kreispunkt(v, r=CR):
    w = math.radians(winkel(v)); return (CX + r * math.cos(w), CY + r * math.sin(w))
TX, TY, TRH = 620, 150, 52
TABW = [("Byte", 200), ("ohne Vorzeichen", 200), ("mit Vorzeichen", 190)]

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Zahlenkreis und Vorzeichen")
    t_sig = a(1, 0.0); t_rech = a(2, 0.0); t_tab = a(3, 0.0)
    box = (CX - CR, CY - CR, CX + CR, CY + CR)
    def ring(d, dy):
        b = (box[0], box[1] + dy, box[2], box[3] + dy)
        if t < t_sig: d.arc(b, 0, 360, fill=BLUE, width=18)
        else:
            d.arc(b, winkel(0), winkel(128), fill=GREEN, width=18); d.arc(b, winkel(128), winkel(256), fill=RED, width=18)
        for v, col in ((0, DARK), (255, DARK)) + (((127, GREEN), (128, RED)) if t >= t_sig else ()):
            x, y = kreispunkt(v); d.ellipse((x - 11, y - 11 + dy, x + 11, y + 11 + dy), fill=col)
    E(f, t, 0.3, ring)
    def beschr(d, dy):
        TB(d, CX + 24, CY - CR - 36 + dy, "0", F(30, 700), DARK, 80, "lm", "Marke")
        TB(d, CX - 24, CY - CR - 36 + dy, "255", F(30, 700), DARK, 100, "rm", "Marke")
    E(f, t, a(0, 0.3), beschr)
    E(f, t, t_sig, lambda d, dy: (TB(d, CX + 24, CY + CR + 36 + dy, "127", F(30, 700), GREEN, 100, "lm", "Marke"),
                                  TB(d, CX - 24, CY + CR + 36 + dy, "128", F(30, 700), RED, 100, "rm", "Marke")))
    # Mitte: der Sprung
    E(f, t, a(0, pos(3, 0, "Nach der")), lambda d, dy: TB(d, CX, CY + dy, "255 + 1 → 0", F(38, 700), DARK, 230, "mm", "Mitte"), tout=t_tab)
    E(f, t, t_tab + 0.2, lambda d, dy: TB(d, CX, CY + dy, f"127 + 1 → {zahl(-128)}", F(34, 700), RED, 250, "mm", "Mitte"))
    # Gewichte der Schalter
    wx0, wcw, wg, wy = 620, 68, 6, 160
    bt = "10000000"
    def gewichte(d, dy):
        TB(d, wx0, wy - 36 + dy, "Gewicht der Schalter", F(28, 700), GREY, 500, "lm", "Titel")
        for k in range(8):
            x = wx0 + k * (wcw + wg); neg = k == 0
            txt = zahl(-128) if neg else str(WERTE[k])
            feld(d, x, wy + dy, wcw, 64, txt, 24, RED if neg else DARK, LIGHTR if neg else WHITE, RED if neg else LINE, 3 if neg else 2, mono=False, what="Gewicht")
    E(f, t, t_sig, gewichte, tout=t_tab)
    E(f, t, a(1, pos(3, 1, "Der oberste")), lambda d, dy: tag(d, wx0, wy + 90 + dy, 586, 52, "oberster Schalter: minus 128 statt plus 128", LIGHTR, RED, 24, 700, outl=RED), tout=t_tab)
    # Rechnung
    def rechnung(d, dy):
        for j, (bs, txt, col) in enumerate((("1111 1111", f"{zahl(-128)} + 127 = {zahl(-1)}", RED), ("1000 0000", f"nur {zahl(-128)}", RED))):
            y = 330 + j * 90
            feld(d, wx0, y + dy, 280, 64, bs, 38, DARK, WHITE, LINE, 2, what="Byte")
            pfeil(d, wx0 + 296, y + 32 + dy, wx0 + 346, y + 32 + dy, GREY, 5, 15)
            TB(d, wx0 + 362, y + 32 + dy, txt, F(36, 700), col, 330, "lm", "Rechnung")
    E(f, t, a(2, pos(3, 2, "Ich rechne")), rechnung, tout=t_tab)
    # Tabelle und Bereich
    def tab(d, dy):
        wges = sum(w for _, w in TABW); y = TY + dy
        d.rounded_rectangle((TX, y, TX + wges, y + TRH * 6), 14, fill=WHITE, outline=LINE, width=2)
        d.rounded_rectangle((TX, y, TX + wges, y + TRH), 14, fill=LIGHTK); d.rectangle((TX, y + TRH - 14, TX + wges, y + TRH), fill=LIGHTK)
        x = TX
        for nm, w in TABW:
            TB(d, x + w / 2, y + TRH / 2, nm, F(22, 700), GREY, w - 10, "mm", "Spalte"); x += w
        for r, ((bs, u), v) in enumerate(zip(TABELLE, TAB_VZ), 1):
            d.line((TX, y + r * TRH, TX + wges, y + r * TRH), fill=LINE, width=2)
            neg = v < 0
            TB(d, TX + TABW[0][1] / 2, y + r * TRH + TRH / 2, bs, M(28, True), DARK, TABW[0][1] - 10, "mm", "Zelle")
            TB(d, TX + TABW[0][1] + TABW[1][1] / 2, y + r * TRH + TRH / 2, str(u), F(30, 700), BLUE, TABW[1][1] - 10, "mm", "Zelle")
            TB(d, TX + TABW[0][1] + TABW[1][1] + TABW[2][1] / 2, y + r * TRH + TRH / 2, zahl(v), F(30, 700), RED if neg else GREEN, TABW[2][1] - 10, "mm", "Zelle")
    E(f, t, t_tab, tab)
    E(f, t, a(3, pos(3, 3, "Der Bereich")), lambda d, dy: tag(d, TX, 500 + dy, 590, 60, f"Bereich: {zahl(-128)} bis 127", RED, WHITE, 36))
    E(f, t, a(3, pos(3, 3, "Ist der oberste")), lambda d, dy: tag(d, TX, 580 + dy, 590, 56, "oberster Schalter 1: negativ", LIGHTR, RED, 28, 700, outl=RED))


# ---------------------------------------------------------------- 4 Python waechst mit
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "In Python wachsen ganze Zahlen mit")
    tm = [a(0, 0.05), a(1, 0.05)]
    aktiv = aktuell(t, [(a(0, 0.0), {0}), (a(1, 0.0), {1}), (a(2, 0.0), None)])
    E(f, t, 0.2, lambda d, dy: code_lauf(d, 60, 130 + dy, 600, CODE, t, 28, 46, times=tm, aktiv=aktiv))
    zl = [(a(0, 0.5), OUT[0], None, None), (a(1, 0.5), OUT[1], None, None)]
    E(f, t, a(0, 0.4), lambda d, dy: lauf_panel(d, 60, 330 + dy, 600, zl, t, 28, 46, "Ausgabe"))
    E(f, t, a(1, pos(4, 1, "Das Ergebnis")), lambda d, dy: tag(d, 60, 520 + dy, 600, 56, "20 Stellen, kein Feld mit 64 Bit reicht", LIGHTA, AMB, 26, 700, outl=AMB))
    def karte(d, dy, y, titel, zeile, col, fill):
        card(d, 720, y + dy, 500, 190, stripe=False)
        d.rounded_rectangle((720, y + dy, 1220, y + 12 + dy), 6, fill=col)
        TB(d, 750, y + 52 + dy, titel, F(28, 700), DARK, 440, "lm", "Kartentitel")
        d.rounded_rectangle((750, y + 90 + dy, 1190, y + 150 + dy), 12, fill=fill)
        TB(d, 970, y + 120 + dy, zeile, M(24, True), col, 430, "mm", "Kartenzeile")
    E(f, t, a(2, 0.0), lambda d, dy: karte(d, dy, 140, "Zähler in einer Steuerung (8 Bit)", "255 + 1 ergibt 0", RED, LIGHTR))
    E(f, t, a(2, pos(4, 2, "Bei ganzen")), lambda d, dy: karte(d, dy, 350, "Ganze Zahl in Python", "4294967295 + 1 ergibt 4294967296", GREEN, LIGHTG))
    E(f, t, a(2, pos(4, 2, "Bei ganzen")), lambda d, dy: tag(d, 720, 570 + dy, 500, 56, "Python: kein Überlauf", GREEN, WHITE, 30))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4}
assert len(SRC) == 4 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 07 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Ein Byte,", F(96, 700), DARK)
        T2(d, 90, 270, "zwei Lesarten", F(96, 700), DARK)
        T2(d, 90, 400, "Überlauf und Vorzeichen", F(40, 400), GREY)
        tag(d, 90, 600, 560, 70, f"255 + 1 = 0   und   {zahl(-128)} bis 127", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        for k in range(8):
            feld(d, 700 + k * 62, 200, 54, 80, "1" if k < 1 else "0", 36, GREEN if k < 1 else GREY, LIGHTG if k < 1 else WHITE, GREEN if k < 1 else LINE, 2, what="Bit")
        d.arc((780, 340, 1100, 660), 0, 360, fill=BLUE, width=18)
        d.arc((780, 340, 1100, 660), 90, 270, fill=RED, width=18)
        d.arc((780, 340, 1100, 660), -90, 90, fill=GREEN, width=18)
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
