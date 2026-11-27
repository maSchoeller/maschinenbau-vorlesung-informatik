"""Termin 09, Video 1: Was im Rechner arbeitet (Spiel von der SSD in den Arbeitsspeicher, Weg eines Programms und Bus, Strom aus,
Dreischritt holen, entschluesseln, ausfuehren, Takt).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v09-theorie"; LABEL = "DHBW · Informatik · Termin 09 · Was im Rechner arbeitet"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
assert 3 * 10 ** 9 == 3_000_000_000          # 3 GHz = 3 Milliarden Takte pro Sekunde
ZEILE = "c = a + b"
assert eval(ZEILE.split("=")[1], {"a": 2, "b": 7}) == 9


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
def bauteil(d, x, y, w, h, name, zeile, col, fill, wd=3, what="Bauteil"):
    imbild(y, y + h, what)
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=fill, outline=col, width=wd)
    TB(d, x + w / 2, y + h * 0.36, name, F(34, 700), col, w - 24, "mm", what)
    TB(d, x + w / 2, y + h * 0.72, zeile, F(24, 600), GREY, w - 24, "mm", what)


def leer(d, x, y, w, h, txt=None, size=28):
    imbild(y, y + h, "leere Stelle")
    gestrichelt(d, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], GREYL, 3)
    if txt: TB(d, x + w / 2, y + h / 2, txt, F(size, 700), GREYL, w - 16, "mm", "leere Stelle")


# ---------------------------------------------------------------- 1 Die Bauteile
BW, BHH = 300, 130
XS = {"ssd": 90, "ram": 490, "cpu": 890}
YT = 130; YBUS = 360; YU = 520


def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Was im Rechner arbeitet")
    t_ssd = a(0, pos(1, 0, "Es liegt")); t_ram = a(0, pos(1, 0, "Arbeitsspeicher")); t_cpu = a(0, pos(1, 0, "Prozessor", "Dort"))
    t_in = a(1, 0.0); t_out = a(1, pos(1, 1, "Die Ausgabe")); t_bus = a(2, 0.0)

    def bus(d, dy):
        for nm in ("ssd", "ram", "cpu"):
            cx = XS[nm] + BW / 2; d.line((cx, YT + BHH + dy, cx, YBUS + dy), fill=GREY, width=5)
        for cx in (XS["ssd"] + BW / 2, XS["cpu"] + BW / 2):
            d.line((cx, YBUS + 40 + dy, cx, YU + dy), fill=GREY, width=5)
        d.rounded_rectangle((70, YBUS + dy, 1210, YBUS + 40 + dy), 12, fill=LIGHTK, outline=GREY, width=3)
        TB(d, 640, YBUS + 20 + dy, "Bus", F(28, 700), DARK, 300, "mm", "Bus")
    E(f, t, t_bus, bus)
    E(f, t, t_ssd, lambda d, dy: bauteil(d, XS["ssd"], YT + dy, BW, BHH, "SSD", "speichert dauerhaft", BLUE, LIGHTB))
    E(f, t, t_ram, lambda d, dy: bauteil(d, XS["ram"], YT + dy, BW, BHH, "Arbeitsspeicher", "hält, was gerade läuft", AMB, LIGHTA))
    E(f, t, t_cpu, lambda d, dy: bauteil(d, XS["cpu"], YT + dy, BW, BHH, "Prozessor", "rechnet", RED, LIGHTR))
    E(f, t, t_in, lambda d, dy: bauteil(d, XS["ssd"], YU + dy, BW, 110, "Eingabe", "Taste, Maus", GREEN, LIGHTG))
    E(f, t, t_out, lambda d, dy: bauteil(d, XS["cpu"], YU + dy, BW, 110, "Ausgabe", "Bildschirm", GREEN, LIGHTG))
    # das Spiel wandert von der SSD in den Arbeitsspeicher
    t_w = a(0, pos(1, 0, "geladen"))

    def spiel(d, dy):
        k = ap(t, t_w, 0.9)
        x = lerp(XS["ssd"] + 50, XS["ram"] + 50, k)
        chip(d, x, YT + BHH + 14 + dy, 200, 54, "Spiel", WHITE, DARK, 30, outl=DARK)
    E(f, t, t_ssd + 0.4, spiel)
    for nm, wort in (("ssd", "Lager"), ("ram", "Werkbank"), ("cpu", "Facharbeiter")):
        E(f, t, a(3, pos(1, 3, {"ssd": "das ", "ram": "Werkbank", "cpu": "Facharbeiter"}[nm]) if nm != "ssd" else pos(1, 3, "Lager")),
          lambda d, dy, nm=nm, wort=wort: tag(d, XS[nm] + BW - 190, YT - 20 + dy, 180, 36, wort, WHITE, GREY, 22, 700, outl=LINE))
    E(f, t, a(1, 0.4), lambda d, dy: TB(d, 640, YU + 55 + dy, "du und der Rechner", F(26, 600), GREY, 400, "mm", "Beschriftung"))


# ---------------------------------------------------------------- 2 Der Weg eines Programms
KW = 190; KH = 90; KGAP = 55
KX0 = (1280 - (5 * KW + 4 * KGAP)) // 2


def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Der Weg eines Programms")
    ketten = [("SSD", BLUE, LIGHTB), ("Bus", GREY, LIGHTK), ("Arbeitsspeicher", AMB, LIGHTA), ("Bus", GREY, LIGHTK), ("Prozessor", RED, LIGHTR)]
    zt = [a(0, 0.02), a(0, pos(2, 0, "über den Bus")), a(0, pos(2, 0, "in den Arbeitsspeicher")), a(0, pos(2, 0, "dann über")), a(0, pos(2, 0, "zum Prozessor"))]
    y1 = 150
    for k, ((nm, col, fill), tin) in enumerate(zip(ketten, zt)):
        x = KX0 + k * (KW + KGAP)
        E(f, t, tin, lambda d, dy, x=x, nm=nm, col=col, fill=fill: chip(d, x, y1 + dy, KW, KH, nm, fill, col, 24, outl=col))
        if k: E(f, t, tin, lambda d, dy, x=x: pfeil(d, x - KGAP + 6, y1 + KH / 2 + dy, x - 6, y1 + KH / 2 + dy, GREY, 5, 15))
    xs0 = KX0 + KW / 2; xs1 = KX0 + 4 * (KW + KGAP) + KW / 2
    t_nie = a(1, 0.0)

    def nie(d, dy):
        yb = y1 + KH + 50
        pts = [(xs0, y1 + KH + 4 + dy), (xs0, yb + dy), (xs1, yb + dy), (xs1, y1 + KH + 8 + dy)]
        for p0, p1 in zip(pts, pts[1:]): gestrichelt(d, [p0, p1], GREYL, 4)
        durchstreichen(d, 640 - 34, yb - 28 + dy, 640 + 34, yb + 28 + dy)
        TB(d, 640, yb + 52 + dy, "nie direkt", F(28, 700), RED, 300, "mm", "Beschriftung")
    E(f, t, t_nie, nie)
    t_erg = a(2, 0.0); y2 = 440
    for nm, col, fill, x in (("Prozessor", RED, LIGHTR, KX0), ("Bus", GREY, LIGHTK, KX0 + KW + KGAP)):
        E(f, t, t_erg, lambda d, dy, x=x, nm=nm, col=col, fill=fill: chip(d, x, y2 + dy, KW, KH, nm, fill, col, 24, outl=col))
    E(f, t, t_erg, lambda d, dy: (pfeil(d, KX0 + KW + 6, y2 + KH / 2 + dy, KX0 + KW + KGAP - 6, y2 + KH / 2 + dy, GREY, 5, 15),
                                  TB(d, KX0, y2 - 30 + dy, "das Ergebnis", F(28, 700), GREY, 300, "lm", "Beschriftung")))
    xe = KX0 + 2 * (KW + KGAP)
    E(f, t, t_erg + 0.3, lambda d, dy: (pfeil(d, xe - KGAP + 6, y2 + KH / 2 + dy, xe - 6, y2 + KH / 2 + dy, GREY, 5, 15),
                                        chip(d, xe, y2 + dy, KW, KH, "Arbeitsspeicher", LIGHTA, AMB, 24, outl=AMB)))
    xo = KX0 + 3 * (KW + KGAP)
    E(f, t, a(2, pos(2, 2, "und zur Ausgabe")), lambda d, dy: (pfeil(d, xo - KGAP + 6, y2 + KH / 2 + dy, xo - 6, y2 + KH / 2 + dy, GREY, 5, 15),
                                                              chip(d, xo, y2 + dy, KW, KH, "Ausgabe", LIGHTG, GREEN, 28, outl=GREEN)))
    E(f, t, a(2, pos(2, 2, "und zur Ausgabe")), lambda d, dy: tag(d, KX0, 580 + dy, 5 * KW + 4 * KGAP, 60, "Alles läuft über den Bus", RED, WHITE, 32))


# ---------------------------------------------------------------- 3 Strom aus
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Strom aus: was bleibt, was verschwindet")
    t_aus = a(0, 0.3); t_leer = a(1, 0.3); t_beh = a(2, 0.3); t_spei = a(3, 0.0)
    X1, X2, Y, W_, H_ = 90, 690, 190, 500, 250

    def kasten(d, dy, x, nm, col, fill):
        d.rounded_rectangle((x, Y + dy, x + W_, Y + H_ + dy), 16, fill=fill, outline=col, width=4)
        TB(d, x + W_ / 2, Y + 36 + dy, nm, F(34, 700), col, W_ - 20, "mm", "Bauteil")
    E(f, t, 0.1, lambda d, dy: kasten(d, dy, X1, "Arbeitsspeicher", AMB, LIGHTA))
    E(f, t, 0.1, lambda d, dy: kasten(d, dy, X2, "SSD", BLUE, LIGHTB))

    def ram_inhalt(d, dy):
        if t < t_leer:
            chip(d, X1 + 40, Y + 90 + dy, 420, 56, "Spiel", WHITE, DARK, 30, outl=DARK)
            chip(d, X1 + 40, Y + 164 + dy, 420, 56, "Spielstand", WHITE, DARK, 30, outl=DARK)
        else: leer(d, X1 + 40, Y + 90 + dy, 420, 130, "leer", 40)
    E(f, t, 0.3, ram_inhalt)

    def ssd_inhalt(d, dy):
        chip(d, X2 + 40, Y + 90 + dy, 420, 56, "Spiel", WHITE, DARK, 30, outl=DARK)
        if t >= t_spei + 1.0: chip(d, X2 + 40, Y + 164 + dy, 420, 56, "Spielstand", LIGHTG, GREEN, 30, outl=GREEN)
    E(f, t, 0.3, ssd_inhalt)

    def strom(d, dy):
        an = t < t_aus
        tag(d, 90, 120 + dy, 220, 52, "Strom: an" if an else "Strom: aus", GREEN if an else RED, WHITE, 28)
    E(f, t, 0.2, strom)
    E(f, t, t_leer, lambda d, dy: tag(d, X1, 470 + dy, W_, 56, "Inhalt verschwindet", LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, t_beh, lambda d, dy: tag(d, X2, 470 + dy, W_, 56, "Inhalt bleibt", LIGHTG, GREEN, 30, 700, outl=GREEN))

    def speichern(d, dy):
        k = ap(t, t_spei + 0.2, 0.8)
        pfeil(d, X1 + W_ + 6, Y + 192 + dy, lerp(X1 + W_ + 14, X2 - 8, max(k, 0.05)), Y + 192 + dy, GREEN, 6, 16)
    E(f, t, t_spei, speichern)
    E(f, t, t_spei, lambda d, dy: tag(d, 470, 570 + dy, 340, 60, "Speichern: kopieren", GREEN, WHITE, 32))


# ---------------------------------------------------------------- 4 Der Dreischritt
DS = [("1  holen", BLUE, LIGHTB), ("2  entschlüsseln", AMB, LIGHTA), ("3  ausführen", RED, LIGHTR)]
DX = [100, 470, 840]; DY = 270; DW = 340; DH = 110


def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Der Dreischritt des Prozessors")
    tz = [a(1, 0.0), a(2, 0.0), a(3, 0.0)]
    aktiv = aktuell(t, [(tz[0], 0), (tz[1], 1), (tz[2], 2), (a(3, pos(4, 3, "Dann")), 3)])
    for k, ((nm, col, fill), x) in enumerate(zip(DS, DX)):
        def feld(d, dy, k=k, nm=nm, col=col, fill=fill, x=x):
            an = aktiv == k
            d.rounded_rectangle((x, DY + dy, x + DW, DY + DH + dy), 16, fill=fill if an else WHITE, outline=col if an else LINE, width=5 if an else 2)
            TB(d, x + DW / 2, DY + DH / 2 + dy, nm, F(36, 700), col if an else GREY, DW - 20, "mm", "Schritt")
        E(f, t, a(0, 0.2) if k == 0 else tz[k - 1] + 0.1, feld)
        if k: E(f, t, tz[k - 1] + 0.1, lambda d, dy, x=x: pfeil(d, x - 30, DY + DH / 2 + dy, x - 4, DY + DH / 2 + dy, GREY, 5, 14))
    erkl = ["nächsten Befehl holen", "feststellen, was er bedeutet", "den Befehl machen"]
    for k, (txt, x) in enumerate(zip(erkl, DX)):
        E(f, t, tz[k] + 0.2, lambda d, dy, txt=txt, x=x: TB(d, x + DW / 2, DY + DH + 40 + dy, txt, F(26, 600), GREY, DW, "mm", "Erklärung"))
    t_n = a(3, pos(4, 3, "Dann"))

    def zurueck(d, dy):
        yb = DY + DH + 110
        d.line((DX[2] + DW / 2, DY + DH + 76 + dy, DX[2] + DW / 2, yb + dy), fill=GREY, width=5)
        d.line((DX[2] + DW / 2, yb + dy, DX[0] + DW / 2, yb + dy), fill=GREY, width=5)
        pfeil(d, DX[0] + DW / 2, yb + dy, DX[0] + DW / 2, DY + DH + 76 + dy, GREY, 5, 15)
        tag(d, 450, yb + 20 + dy, 380, 52, "dann der nächste Befehl", LIGHTK, DARK, 28, 700, outl=LINE)
    E(f, t, t_n, zurueck)
    E(f, t, a(0, 0.5), lambda d, dy: TB(d, 640, 170 + dy, "bei jedem Befehl derselbe Ablauf", F(32, 700), DARK, 800, "mm", "Beschriftung"))


# ---------------------------------------------------------------- 5 Der Takt
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Der Takt")
    cx, cy, r = 250, 330, 120

    def uhr(d, dy):
        d.ellipse((cx - r, cy - r + dy, cx + r, cy + r + dy), fill=WHITE, outline=DARK, width=6)
        for k in range(12):
            w = math.radians(k * 30 - 90)
            d.line((cx + (r - 18) * math.cos(w), cy + dy + (r - 18) * math.sin(w), cx + (r - 4) * math.cos(w), cy + dy + (r - 4) * math.sin(w)), fill=GREY, width=4)
        w = math.radians((t * 120) % 360 - 90)
        d.line((cx, cy + dy, cx + (r - 30) * math.cos(w), cy + dy + (r - 30) * math.sin(w)), fill=RED, width=7)
        d.ellipse((cx - 9, cy - 9 + dy, cx + 9, cy + 9 + dy), fill=DARK)
    E(f, t, 0.2, uhr)
    E(f, t, a(0, 0.1), lambda d, dy: TB(d, cx, cy + r + 50 + dy, "Takt", F(34, 700), DARK, 300, "mm", "Beschriftung"))

    def impulse(d, dy):
        x0, y0, h = 520, 190, 60
        for k in range(8):
            an = int(t * 3) % 8 == k and t >= a(0, 0.4)
            d.rectangle((x0 + k * 80, y0 + dy, x0 + k * 80 + 60, y0 + h + dy), fill=RED if an else LIGHTK, outline=LINE)
        TB(d, x0, y0 - 30 + dy, "ein kleiner Schritt je Takt", F(26, 600), GREY, 640, "lm", "Beschriftung")
    E(f, t, a(0, 0.4), impulse)
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 520, 300 + dy, 660, 70, "3 GHz = 3 Milliarden Takte je Sekunde", LIGHTK, DARK, 32, 700, outl=LINE))
    t_z = a(2, 0.0)
    E(f, t, t_z, lambda d, dy: chip(d, 520, 420 + dy, 260, 64, ZEILE, BOX, CODE_K, 32, outl=BOX, mono=True))
    E(f, t, t_z + 0.5, lambda d, dy: pfeil(d, 800, 452 + dy, 860, 452 + dy, GREY, 5, 15))
    E(f, t, t_z + 0.5, lambda d, dy: tag(d, 880, 420 + dy, 300, 64, "viele kleine Befehle", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(2, pos(5, 2, "Python übersetzt")), lambda d, dy: tag(d, 520, 520 + dy, 660, 64, "Python übersetzt jede Zeile für dich", RED, WHITE, 34))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()

    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 09 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Was im Rechner", F(88, 700), DARK)
        T2(d, 90, 262, "arbeitet", F(88, 700), DARK)
        T2(d, 90, 392, "Bauteile, Bus und Takt", F(40, 400), GREY)
        tag(d, 90, 560, 520, 70, "holen, entschlüsseln, ausführen", RED, WHITE, 32)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        for k, (nm, col, fill) in enumerate((("SSD", BLUE, LIGHTB), ("RAM", AMB, LIGHTA), ("CPU", RED, LIGHTR))):
            d.rounded_rectangle((720 + k * 170, 190, 720 + k * 170 + 150, 290), 14, fill=fill, outline=col, width=3)
            TB(d, 720 + k * 170 + 75, 240, nm, F(36, 700), col, 130, "mm", "Bauteil")
        d.rounded_rectangle((720, 330, 1210, 370), 12, fill=LIGHTK, outline=GREY, width=3)
        TB(d, 965, 350, "Bus", F(26, 700), DARK, 200, "mm", "Bus")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
