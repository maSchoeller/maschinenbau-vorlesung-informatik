"""Termin 10, Video 1: Schnell, groß, Zahlen (Speicher-Treppe in Zeitlupe, KB bis GB, Zeichen als Zahlen mit Bits).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v10-theorie"; LABEL = "DHBW · Informatik · Termin 10 · Schnell, groß, Zahlen"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
# Zeitlupe: Arbeitsspeicher 100 ns gleich 1 Sekunde
ZUGRIFF_NS = {"cpu": 1, "ram": 100, "ssd": 100_000, "hdd": 10_000_000}
ZEITLUPE_S = {k: v / ZUGRIFF_NS["ram"] for k, v in ZUGRIFF_NS.items()}
assert ZEITLUPE_S == {"cpu": 0.01, "ram": 1.0, "ssd": 1000.0, "hdd": 100000.0}, ZEITLUPE_S
assert round(ZEITLUPE_S["ssd"] / 60) == 17 and round(ZEITLUPE_S["hdd"] / 3600) == 28 and ZEITLUPE_S["hdd"] / 3600 > 24
STUFEN = [("Speicher im Prozessor", "einige KB bis MB", "0,01 Sekunden", 90),
          ("Arbeitsspeicher", "8 bis 32 GB", "1 Sekunde", 200),
          ("SSD", "0,5 bis 2 TB", "17 Minuten", 290),
          ("Festplatte", "1 bis 4 TB", "28 Stunden", 360)]
assert 8 == 2 ** 3 and 2 ** 8 - 1 == 255 and 1000 * 1000 == 10 ** 6 and 2 * 1000 == 2000
EINHEITEN = ["Byte", "KB", "MB", "GB"]
assert [1000 ** k for k in range(4)] == [1, 1000, 1000000, 1000000000] and 2 ** 10 == 1024
# Zeichen: ASCII mit 7 Bit
assert 2 ** 7 == 128 and ord("A") == 65 and ord("B") == 66 and ord("C") == 67 and ord("a") == 97 and ord("a") - ord("A") == 32
BITS_A, BITS_a = f"{65:07b}", f"{97:07b}"
assert BITS_A == "1000001" and BITS_a == "1100001" and len(BITS_A) == 7
GEW = [64, 32, 16, 8, 4, 2, 1]
assert sum(w * int(b) for w, b in zip(GEW, BITS_A)) == 65 and sum(w * int(b) for w, b in zip(GEW, BITS_a)) == 97


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


def feld(d, x, y, w, h, txt, size, col=DARK, fill=WHITE, outl=LINE, wd=2, mono=True, what="Feld"):
    imbild(y, y + h, what)
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl, width=wd)
    TB(d, x + w / 2, y + h / 2, txt, M(size, True) if mono else F(size, 700), col, w - 8, "mm", what)


# ---------------------------------------------------------------- 1 Die Speicher-Treppe
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Speicher-Treppe in Zeitlupe")
    RH, Y0, BX = 100, 130, 400
    zeit_t = [a(1, pos(1, 1, "Der Speicher im")), a(1, pos(1, 1, "Der Arbeitsspeicher")), a(2, pos(1, 2, "ess ess dee")), a(2, pos(1, 2, "Die Festplatte"))]
    name_t = [a(0, pos(1, 0, "Ganz oben")), a(0, pos(1, 0, "Dann kommt")), a(0, pos(1, 0, "dann die ess")), a(0, pos(1, 0, "ganz unten"))]
    for k, (nm, gr, zt, bl) in enumerate(STUFEN):
        y = Y0 + k * (RH + 6)
        col = (BLUE, GREEN, AMB, RED)[k]; fill = (LIGHTB, LIGHTG, LIGHTA, LIGHTR)[k]
        def zeile(d, dy, y=y, nm=nm, gr=gr, bl=bl, col=col, fill=fill, k=k):
            imbild(y, y + RH, "Stufe")
            TB(d, 60, y + RH / 2 + dy, nm, F(28, 700), DARK, 300, "lm", "Stufe")
            d.rounded_rectangle((BX, y + 18 + dy, BX + bl, y + RH - 18 + dy), 12, fill=fill, outline=col, width=3)
            TB(d, BX + bl + 16, y + RH / 2 + dy, "ca. " + gr, F(24, 600), GREY, 330, "lm", "Größe")
        E(f, t, name_t[k], zeile)
        E(f, t, zeit_t[k], lambda d, dy, y=y, zt=zt, col=col, fill=fill: tag(d, 960, y + 20 + dy, 260, 60, zt, col, WHITE, 30))
    E(f, t, name_t[0], lambda d, dy: TB(d, 960, 108 + dy, "Zeitlupe", F(24, 700), GREY, 260, "lm", "Spaltenkopf"))
    E(f, t, name_t[0], lambda d, dy: TB(d, BX, 108 + dy, "Größe (ungefähr)", F(24, 700), GREY, 400, "lm", "Spaltenkopf"))
    E(f, t, a(1, 0.0), lambda d, dy: (TB(d, 960, 584 + dy, "Maßstab: Arbeitsspeicher", F(22, 600), GREY, 260, "lm", "Maßstab"), TB(d, 960, 612 + dy, "gleich 1 Sekunde", F(22, 600), GREY, 260, "lm", "Maßstab")))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, 60, 616 + dy, 880, 60, "schnell heißt klein und teuer", RED, WHITE, 34))
    E(f, t, a(3, pos(1, 3, "Darum liegt")), lambda d, dy: tag(d, 60, 548 + dy, 880, 52, "oben liegt, was jetzt gebraucht wird", LIGHTK, DARK, 28, 700, outl=LINE))


# ---------------------------------------------------------------- 2 Byte, KB, MB, GB
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Byte, KB, MB und GB")
    cw, gap, x0, y0 = 230, 70, 60, 150
    zt = [a(0, 0.05), a(1, pos(2, 1, "Kilobyte")), a(1, pos(2, 1, "Megabyte")), a(1, pos(2, 1, "Gigabyte"))]
    txt = ["1 Byte", "1 KB", "1 MB", "1 GB"]; unter = ["8 Bit", "1000 Byte", "1000 KB", "1000 MB"]
    for k in range(4):
        x = x0 + k * (cw + gap)
        E(f, t, zt[k], lambda d, dy, x=x, k=k: (feld(d, x, y0 + dy, cw, 90, txt[k], 38, (DARK, BLUE, GREEN, RED)[k], (LIGHTK, LIGHTB, LIGHTG, LIGHTR)[k], (LINE, BLUE, GREEN, RED)[k], 3, what="Einheit"),
                                                TB(d, x + cw / 2, y0 + 120 + dy, unter[k], F(26, 700), GREY, cw, "mm", "Einheit unten")))
        if k:
            E(f, t, zt[k], lambda d, dy, x=x: (pfeil(d, x - gap + 8, y0 + 45 + dy, x - 8, y0 + 45 + dy, GREY, 5, 15),
                                              TB(d, x - gap / 2, y0 - 6 + dy, "mal 1000", F(20, 700), GREY, gap + 40, "mm", "Pfeil")))
    E(f, t, a(0, pos(2, 0, "Es reicht")), lambda d, dy: tag(d, 60, 310 + dy, 440, 52, "Zahl bis 255 oder ein Buchstabe", LIGHTK, DARK, 28, 700, outl=LINE))
    E(f, t, a(1, pos(2, 1, "Viele Programme")), lambda d, dy: tag(d, 520, 310 + dy, 700, 52, "gerechnet wird hier mit 1000 (manche Programme: 1024)", LIGHTA, AMB, 24, 700, outl=AMB), tout=a(2, 0.0))
    bsp = [("Textseite", "etwa 2 KB", BLUE, LIGHTB), ("Foto", "etwa 3 MB", GREEN, LIGHTG), ("Film", "etwa 2 GB", RED, LIGHTR)]
    tb = [a(2, 0.0), a(2, pos(2, 2, "Ein Foto")), a(2, pos(2, 2, "Ein Film"))]
    for k, (nm, gr, col, fill) in enumerate(bsp):
        x = 60 + k * 400
        def karte(d, dy, x=x, nm=nm, gr=gr, col=col, fill=fill):
            imbild(400, 600, "Karte")
            d.rounded_rectangle((x, 400 + dy, x + 360, 600 + dy), 16, fill=fill, outline=col, width=3)
            TB(d, x + 180, 450 + dy, nm, F(36, 700), DARK, 330, "mm", "Beispiel")
            TB(d, x + 180, 530 + dy, gr, F(44, 700), col, 330, "mm", "Beispiel Größe")
        E(f, t, tb[k], karte)
    E(f, t, a(2, pos(2, 2, "das sind")), lambda d, dy: TB(d, 1020, 640 + dy, "2 GB sind 2000 MB", F(28, 700), RED, 360, "mm", "Umrechnung"))


# ---------------------------------------------------------------- 3 Zeichen sind Zahlen
BX0, BWc, BGp = 480, 96, 8

def zeichenzeile(d, y, zeichen, zahl, bits, col, fill, dy=0, bits_sichtbar=True):
    feld(d, 60, y + dy, 120, 110, zeichen, 64, col, fill, col, 3, mono=False, what="Zeichen")
    pfeil(d, 190, y + 55 + dy, 236, y + 55 + dy, GREY, 5, 15)
    feld(d, 246, y + dy, 150, 110, str(zahl), 54, DARK, WHITE, LINE, 3, mono=False, what="Zahl")
    if bits_sichtbar:
        for k in range(7):
            an = bits[k] == "1"
            feld(d, BX0 + k * (BWc + BGp), y + dy, BWc, 110, bits[k], 54, GREEN if an else GREY, LIGHTG if an else WHITE, GREEN if an else LINE, 3 if an else 2, what="Bit")


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Zeichen sind Zahlen")
    E(f, t, a(0, 0.3), lambda d, dy: tag(d, 60, 124 + dy, 520, 52, "Buchstabe wird Zahl: der Code", LIGHTK, DARK, 28, 700, outl=LINE))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 640, 124 + dy, 580, 52, "ASCII: 7 Bit, 128 Zeichen", RED, WHITE, 30))
    E(f, t, a(2, pos(3, 2, "In Bits")), lambda d, dy: [TB(d, BX0 + k * (BWc + BGp) + BWc / 2, 214 + dy, str(GEW[k]), F(24, 600), GREY, BWc, "mm", "Gewicht") for k in range(7)])
    E(f, t, a(2, 0.0), lambda d, dy: zeichenzeile(d, 240, "A", 65, BITS_A, BLUE, LIGHTB, dy, t >= a(2, pos(3, 2, "In Bits"))))
    E(f, t, a(2, pos(3, 2, "Das B")), lambda d, dy: (feld(d, 60, 380 + dy, 120, 70, "B", 40, BLUE, LIGHTB, BLUE, 2, mono=False, what="B"), pfeil(d, 190, 415 + dy, 236, 415 + dy, GREY, 4, 13),
                                                    feld(d, 246, 380 + dy, 150, 70, "66", 38, DARK, WHITE, LINE, 2, mono=False, what="66"),
                                                    feld(d, 480, 380 + dy, 120, 70, "C", 40, BLUE, LIGHTB, BLUE, 2, mono=False, what="C"), pfeil(d, 610, 415 + dy, 656, 415 + dy, GREY, 4, 13),
                                                    feld(d, 666, 380 + dy, 150, 70, "67", 38, DARK, WHITE, LINE, 2, mono=False, what="67")))
    E(f, t, a(3, 0.0), lambda d, dy: zeichenzeile(d, 490, "a", 97, BITS_a, GREEN, LIGHTG, dy, t >= a(3, pos(3, 3, "in Bits"))))
    E(f, t, a(3, pos(3, 3, "Zwischen")), lambda d, dy: tag(d, 60, 630 + dy, 1160, 56, "groß und klein liegen immer 32 auseinander: 97 minus 65", RED, WHITE, 32))


SCENES = {1: sc1, 2: sc2, 3: sc3}
assert len(SRC) == 3 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 10 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Schnell,", F(96, 700), DARK)
        T2(d, 90, 270, "groß, Zahlen", F(96, 700), DARK)
        T2(d, 90, 400, "Speicher, Größen und Zeichen", F(40, 400), GREY)
        tag(d, 90, 600, 560, 70, "RAM 1 Sekunde, Festplatte 28 Stunden", RED, WHITE, 28)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        for k, (nm, gr, zt, bl) in enumerate(STUFEN):
            col = (BLUE, GREEN, AMB, RED)[k]; fill = (LIGHTB, LIGHTG, LIGHTA, LIGHTR)[k]
            d.rounded_rectangle((720, 170 + k * 96, 720 + bl, 170 + k * 96 + 64), 12, fill=fill, outline=col, width=3)
        for k in range(7):
            an = BITS_A[k] == "1"
            feld(d, 720 + k * 70, 560, 62, 80, BITS_A[k], 36, GREEN if an else GREY, LIGHTG if an else WHITE, GREEN if an else LINE, 2, what="Bit")
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
