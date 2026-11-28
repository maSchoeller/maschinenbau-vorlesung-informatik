"""Termin 06, Video 1: Vierergruppen und Hex-Ziffern (die 16 Zeilen der Wahrheitstabelle werden 16 Ziffern, Byte in zwei
Vierergruppen zu Hex, E2 mit den Stellenwerten 16 und 1 zu 226, die Farbe #E2001A als drei Bytes).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v06-theorie"; LABEL = "DHBW · Informatik · Termin 06 · Vierergruppen und Hex-Ziffern"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
HEXZ = "0123456789ABCDEF"
VIER = [f"{n:04b}" for n in range(16)]
assert VIER[0] == "0000" and VIER[15] == "1111" and VIER[14] == "1110" and VIER[2] == "0010" and len(set(VIER)) == 16 == 2 ** 4
assert [int(h, 16) for h in HEXZ] == list(range(16)) and HEXZ[10] == "A" and HEXZ[15] == "F"
def zu_hex(byte):
    g = byte.split(); return "".join(HEXZ[int(x, 2)] for x in g)
def zu_bin(hx):
    return " ".join(VIER[HEXZ.index(c)] for c in hx)
assert zu_hex("1110 0010") == "E2" and zu_hex("0011 1100") == "3C" and zu_bin("A7") == "1010 0111"
assert int("E2", 16) == 226 and 14 * 16 + 2 * 1 == 224 + 2 == 226 and 14 * 16 == 224
BYTE = "11100010"; WERTE = [128, 64, 32, 16, 8, 4, 2, 1]
assert int(BYTE, 2) == 226 and [w for w, b in zip(WERTE, BYTE) if b == "1"] == [128, 64, 32, 2] and 128 + 64 + 32 + 2 == 226
FARBE = "E2001A"; RGB = [int(FARBE[k:k + 2], 16) for k in (0, 2, 4)]
assert RGB == [226, 0, 26] and int("1A", 16) == 16 + 10 == 26 and int("00", 16) == 0
DHBW = tuple(RGB)


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
def feld(d, x, y, w, h, txt, size, col=DARK, fill=WHITE, outl=LINE, wd=2, mono=True, what="Feld"):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl, width=wd)
    TB(d, x + w / 2, y + h / 2, txt, M(size, True) if mono else F(size, 700), col, w - 8, "mm", what)


def gruppe(d, x, y, bits, cw=70, h=80, gap=8, col=DARK, fill=WHITE, outl=LINE):
    """Vierergruppe: vier Bitfelder nebeneinander. Gibt die Breite zurueck."""
    for i, b in enumerate(bits):
        feld(d, x + i * (cw + gap), y, cw, h, b, 44, GREEN if b == "1" else GREY, fill, outl, 2, what="Bit")
    return 4 * cw + 3 * gap


def digit(d, x, y, c, w=100, h=100, col=RED, fill=LIGHTR):
    feld(d, x, y, w, h, c, 60, col, fill, col, 4, what="Hex-Ziffer")


# ---------------------------------------------------------------- 1 Von 16 Zeilen zu 16 Ziffern
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "16 Werte, 16 Ziffern")
    x0, y0, rh = 80, 112, 33
    cw = [("binär", 200), ("dezimal", 190), ("hex", 150)]
    xs = [x0, x0 + 200, x0 + 390]; wt = 540
    t_tab = a(0, 0.05)
    def kopfzeile(d, dy):
        for (nm, w), x in zip(cw, xs):
            d.rectangle((x, y0 + dy, x + w, y0 + rh + dy), fill=DARK, outline=DARK)
            TB(d, x + w / 2, y0 + rh / 2 + dy, nm, F(24, 700), WHITE, w - 12, "mm", "Spaltenkopf")
    E(f, t, t_tab, kopfzeile)
    t_bin = [t_tab + 0.12 + 0.11 * n for n in range(16)]
    t_dez = [a(1, 0.0) + 0.05 * n for n in range(16)]
    t_hex = [a(1, 0.12) + 0.05 * n for n in range(10)]
    t_buch = [a(1, pos(1, 1, nm)) for nm in ("ah ist", "beh ist", "zeh ist", "deh ist", "eh ist vierzehn", "eff ist")]
    t_hex += t_buch; assert len(t_hex) == 16
    t_hl = a(2, 0.0)
    for n in range(16):
        yy0 = y0 + rh * (n + 1)
        def zeile(d, dy, n=n, yy0=yy0):
            buch = n >= 10
            hl = buch and t >= t_hex[n]
            for (nm, w), x in zip(cw, xs):
                d.rectangle((x, yy0 + dy, x + w, yy0 + rh + dy), fill=LIGHTA if hl else (WHITE if n % 2 == 0 else LIGHTK), outline=LINE, width=1)
        E(f, t, t_bin[n] - 0.05, zeile)
        E(f, t, t_bin[n], lambda d, dy, n=n, yy0=yy0: TB(d, xs[0] + 100, yy0 + rh / 2 + dy, VIER[n], M(26, True), DARK, 180, "mm", "Bits"))
        E(f, t, t_dez[n], lambda d, dy, n=n, yy0=yy0: TB(d, xs[1] + 95, yy0 + rh / 2 + dy, str(n), F(26, 700), BLUE, 170, "mm", "Dezimal"))
        E(f, t, t_hex[n], lambda d, dy, n=n, yy0=yy0: TB(d, xs[2] + 75, yy0 + rh / 2 + dy, HEXZ[n], F(28, 700), AMB if n >= 10 else RED, 130, "mm", "Hex"))
    # rechts: der Begriff
    rx, rw = 700, 520
    def hexsys(d, dy):
        card(d, rx, 130 + dy, rw, 170)
        TB(d, rx + 36, 176 + dy, "Hexadezimalsystem", F(40, 700), DARK, rw - 70, "lm", "Begriff")
        TB(d, rx + 36, 230 + dy, "16 Ziffern: 0 bis 9 und A bis F", F(30, 400), GREY, rw - 70, "lm", "Begriff")
    E(f, t, a(2, 0.05), hexsys)
    def gr(d, dy):
        card(d, rx, 330 + dy, rw, 150, stripe=False)
        gruppe(d, rx + 30, 350 + dy, "1110", cw=56, h=64, gap=8)
        pfeil(d, rx + 30 + 4 * 56 + 3 * 8 + 18, 382 + dy, rx + 30 + 4 * 56 + 3 * 8 + 70, 382 + dy, GREY, 5, 15)
        digit(d, rx + 30 + 4 * 56 + 3 * 8 + 90, 350 + dy, "E", 64, 64)
        TB(d, rx + 36, 442 + dy, "jede Ziffer = eine Vierergruppe", F(28, 600), DARK, rw - 70, "lm", "Hinweis")
    E(f, t, a(2, 0.55), gr)


# ---------------------------------------------------------------- 2 Binaer in hex: Gruppe fuer Gruppe
def zeile_bh(f, t, y, bits, hx, richtung, tin_links, tin_gr, tin_pf, tin_rechts, notiz=None, t_notiz=None):
    """Eine Umrechnungszeile: links zwei Vierergruppen, in der Mitte ein Pfeil, rechts zwei Hex-Ziffern. richtung 'bh' oder 'hb'."""
    g1, g2 = bits.split()
    x1, x2 = 80, 80 + 304 + 34
    xp0, xp1 = 740, 840
    xh = [880, 1010]
    bh = richtung == "bh"
    E(f, t, tin_links[0], lambda d, dy: gruppe(d, x1, y + dy, g1) if bh else digit(d, xh[0], y + dy, hx[0]))
    E(f, t, tin_links[1], lambda d, dy: gruppe(d, x2, y + dy, g2) if bh else digit(d, xh[1], y + dy, hx[1]))
    pfeil_ = (lambda d, dy: pfeil(d, xp0, y + 40 + dy, xp1, y + 40 + dy, DARK, 6, 18)) if bh else (lambda d, dy: pfeil(d, xp1, y + 40 + dy, xp0, y + 40 + dy, DARK, 6, 18))
    E(f, t, tin_pf, pfeil_)
    E(f, t, tin_rechts[0], lambda d, dy: digit(d, xh[0], y + dy, hx[0]) if bh else gruppe(d, x1, y + dy, g1))
    E(f, t, tin_rechts[1], lambda d, dy: digit(d, xh[1], y + dy, hx[1]) if bh else gruppe(d, x2, y + dy, g2))


def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Binär in hex: Gruppe für Gruppe")
    # Zeile 1: 1110 0010 -> E2, mit Nachschlagen je Gruppe
    y1 = 130; g1, g2 = "1110", "0010"
    zeile_bh(f, t, y1, "1110 0010", "E2", "bh", (a(0, 0.05), a(0, 0.05)), None, a(1, pos(2, 1, "Die linke")), (a(1, pos(2, 1, "Die linke")), a(1, pos(2, 1, "die rechte"))))
    E(f, t, a(1, pos(2, 1, "Die linke")), lambda d, dy: TB(d, 80 + 152, y1 + 108 + dy, "= 14 = E", F(28, 700), RED, 280, "mm", "Nachschlagen"))
    E(f, t, a(1, pos(2, 1, "die rechte")), lambda d, dy: TB(d, 80 + 304 + 34 + 152, y1 + 108 + dy, "= 2", F(28, 700), RED, 280, "mm", "Nachschlagen"))
    E(f, t, a(1, pos(2, 1, "Das Byte ist")), lambda d, dy: tag(d, 1126, y1 + 22 + dy, 94, 56, "E2", RED, WHITE, 34, 700))
    # Zeile 2: 0011 1100 -> 3C
    y2 = 340
    zeile_bh(f, t, y2, "0011 1100", "3C", "bh", (a(2, 0.05), a(2, 0.05)), None, a(2, pos(2, 2, "ergibt")), (a(2, pos(2, 2, "ergibt")), a(2, pos(2, 2, "ergibt")) + 0.3))
    # Zeile 3: A7 -> 1010 0111
    y3 = 520
    zeile_bh(f, t, y3, "1010 0111", "A7", "hb", (a(3, 0.05), a(3, 0.05)), None, a(3, pos(2, 3, "wird zu")), (a(3, pos(2, 3, "wird zu")), a(3, pos(2, 3, "wird zu")) + 0.3))


# ---------------------------------------------------------------- 3 Hex in dezimal: E2
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Hex in dezimal: E2")
    xe, xz, w, h, y = 100, 280, 150, 130, 210
    E(f, t, a(0, 0.02), lambda d, dy: (digit(d, xe, y + dy, "E", w, h), digit(d, xz, y + dy, "2", w, h)))
    E(f, t, a(0, pos(3, 0, "Die linke")), lambda d, dy: (tag(d, xe, 140 + dy, w, 50, "16", LIGHTB, BLUE, 32, 700, outl=BLUE), tag(d, xz, 140 + dy, w, 50, "1", LIGHTB, BLUE, 32, 700, outl=BLUE)))
    E(f, t, a(0, pos(3, 0, "Die linke")), lambda d, dy: TB(d, xe, 118 + dy, "Stellenwert", F(24, 600), GREY, 340, "lm", "Beschriftung"))
    # E = 14
    t_e = a(1, 0.0)
    E(f, t, t_e, lambda d, dy: tag(d, xe, 366 + dy, w, 50, "E = 14", LIGHTA, AMB, 30, 700, outl=AMB))
    t_p1, t_p2, t_s = a(1, pos(3, 1, "Du rechnest")), a(1, pos(3, 1, "plus")), a(1, pos(3, 1, "Das ergibt"))
    E(f, t, t_p1, lambda d, dy: TB(d, xe + w / 2, 478 + dy, "14 · 16 = 224", F(32, 700), DARK, 300, "mm", "Produkt"))
    E(f, t, t_p2, lambda d, dy: TB(d, xz + w / 2, 478 + dy, "2 · 1 = 2", F(32, 700), DARK, 300, "mm", "Produkt"))
    E(f, t, t_p1, lambda d, dy: (pfeil(d, xe + w / 2, 424 + dy, xe + w / 2, 452 + dy, GREYL, 3, 11)))
    E(f, t, t_p2, lambda d, dy: pfeil(d, xz + w / 2, y + h + 8 + dy, xz + w / 2, 452 + dy, GREYL, 3, 11))
    E(f, t, t_s, lambda d, dy: tag(d, 100, 586 + dy, 340, 70, "224 + 2 = 226", RED, WHITE, 42, 700))
    # rechts: die Probe ueber binaer
    px, cwid, gap = 640, 62, 10
    xs = [px + i * (cwid + gap) + (24 if i >= 4 else 0) for i in range(8)]
    t_pr = a(2, 0.0)
    def probe_kopf(d, dy): TB(d, px, 140 + dy, "Probe über binär", F(28, 700), GREY, 400, "lm", "Titel")
    E(f, t, t_pr, probe_kopf)
    def reihe(d, dy):
        for i in range(8):
            b = BYTE[i]; an = b == "1"
            feld(d, xs[i], 210 + dy, cwid, 56, str(WERTE[i]), 26, GREEN if an else GREY, LIGHTG if an else LIGHTK, GREEN if an else LINE, 2, mono=False, what="Wert")
            feld(d, xs[i], 276 + dy, cwid, 70, b, 44, GREEN if an else GREY, WHITE, GREEN if an else LINE, 2, what="Bit")
    E(f, t, t_pr, reihe)
    E(f, t, a(2, pos(3, 2, "hundertachtundzwanzig plus")), lambda d, dy: tag(d, 640, 400 + dy, 560, 70, "128 + 64 + 32 + 2", LIGHTG, GREEN, 38, 700, outl=GREEN))
    E(f, t, a(2, pos(3, 2, "ergibt ebenfalls")), lambda d, dy: tag(d, 640, 490 + dy, 560, 80, "= 226", RED, WHITE, 52, 700))


# ---------------------------------------------------------------- 4 Farben im Web
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Farben im Web: #E2001A")
    def swatch(d, dy):
        d.rounded_rectangle((80, 140 + dy, 520, 440 + dy), 24, fill=DHBW, outline=DARK, width=3)
        TB(d, 300, 290 + dy, "#E2001A", M(56, True), WHITE, 400, "mm", "Farbcode")
        TB(d, 300, 480 + dy, "das Rot der DHBW", F(30, 700), DARK, 440, "mm", "Beschriftung")
    E(f, t, a(0, 0.5), swatch)
    # drei Bytes
    namen = [("Rot", RED, LIGHTR), ("Grün", GREEN, LIGHTG), ("Blau", BLUE, LIGHTB)]
    hexe = [FARBE[k:k + 2] for k in (0, 2, 4)]
    t_b = [a(1, pos(4, 1, "für Rot")), a(1, pos(4, 1, "für Grün")), a(1, pos(4, 1, "für Blau"))]
    t_d = [a(2, pos(4, 2, "ist zweihundert")), a(2, pos(4, 2, "null null ist")), a(2, pos(4, 2, "eins ah ist"))]
    for k, ((nm, col, fill), hx, tb, td) in enumerate(zip(namen, hexe, t_b, t_d)):
        y = 140 + k * 130
        def karte(d, dy, k=k, nm=nm, col=col, fill=fill, hx=hx, y=y):
            card(d, 600, y + dy, 620, 110, stripe=False)
            d.rounded_rectangle((616, y + 16 + dy, 740, y + 62 + dy), 23, fill=col)
            TB(d, 678, y + 39 + dy, nm, F(28, 700), WHITE, 110, "mm", "Farbname")
            feld(d, 760, y + 12 + dy, 100, 56, hx, 40, col, fill, col, 3, what="Hex")
        E(f, t, tb, karte)
        E(f, t, td, lambda d, dy, k=k, y=y: (pfeil(d, 872, y + 40 + dy, 930, y + 40 + dy, GREY, 4, 13),
                                              TB(d, 1050, y + 40 + dy, str(RGB[k]), F(44, 700), DARK, 160, "mm", "Dezimal")))
        E(f, t, td + 0.2, lambda d, dy, k=k, col=col, y=y: (d.rounded_rectangle((620, y + 82 + dy, 1200, y + 96 + dy), 7, fill=LIGHTK),
                                                             d.rounded_rectangle((620, y + 82 + dy, 620 + max(8, int(580 * RGB[k] / 255)), y + 96 + dy), 7, fill=col)))
    E(f, t, a(2, pos(4, 2, "Viel Rot")), lambda d, dy: tag(d, 600, 536 + dy, 620, 56, "viel Rot, kein Grün, wenig Blau", LIGHTK, DARK, 28, 700, outl=LINE))
    E(f, t, a(3, 0.05), lambda d, dy: tag(d, 80, 618 + dy, 1140, 64, "Gleich ausprobieren: Baustein „Hex-Farbmischer“", RED, WHITE, 36))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4}
assert len(SRC) == 4 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Hex-Ziffern", F(96, 700), DARK)
        T2(d, 90, 300, "Vierergruppen und das Rot der DHBW", F(40, 400), GREY)
        tag(d, 90, 600, 500, 70, "1110 0010 = E2 = 226", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        gruppe(d, 640, 380, "1110", cw=74, h=84); gruppe(d, 960, 380, "0010", cw=74, h=84)
        digit(d, 700, 520, "E", 120, 120); digit(d, 1020, 520, "2", 120, 120)
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
