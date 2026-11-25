"""Termin 02, Video 1: Wahr oder falsch: Aussagen und Vergleiche (Automat, Aussage, Vergleich, Grenzfall, NICHT).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from PIL import Image, ImageDraw
from texte import SRC

NAME = "v02-theorie"; LABEL = "DHBW · Informatik · Termin 02 · Wahr oder falsch"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
PREIS = 1.5
WORT = lambda b: "wahr" if b else "falsch"
REICHT_2, REICHT_1 = WORT(2 >= PREIS), WORT(1 >= PREIS)                 # Szene 1: Stempel
assert (REICHT_2, REICHT_1) == ("wahr", "falsch")
assert (2 >= PREIS) is True                                             # Szene 2: 2 >= 1.5 ist True
assert (1.5 >= PREIS) is True and (1.5 > PREIS) is False                # Szene 3: Grenzfall
PROBE = [(1.0, "1,00 €", "darunter"), (1.5, "1,50 €", "auf der Grenze"), (2.0, "2,00 €", "darüber")]
assert PROBE[0][0] < PREIS == PROBE[1][0] < PROBE[2][0]
NICHT_ZEILEN = [[WORT(a), WORT(not a)] for a in (True, False)]          # Szene 4: Wahrheitstabelle
assert NICHT_ZEILEN == [["wahr", "falsch"], ["falsch", "wahr"]]
ZEICHEN = [("<", "kleiner"), (">", "größer"), ("<=", "kleiner gleich"), (">=", "größer gleich"), ("==", "ist gleich")]
assert [eval(f"1.5 {z} 1.5") for z, _ in ZEICHEN] == [False, False, True, True, True]   # Zeichen sind gueltiges Python


# ---------------------------------------------------------------- eigene Bildzeichen (nur dieses Video)
_STEMPEL = {}
def stempel_bild(wort, col, size=60):
    """Stempel als leicht gedrehtes RGBA-Bild (zwischengespeichert)."""
    k = (wort, col, size)
    if k not in _STEMPEL:
        fn = F(size, 800); w = int(fn.getlength(wort) + 64); h = int(size * 1.55)
        im = Image.new("RGBA", (w + 16, h + 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle((8, 8, w + 8, h + 8), 12, outline=col + (255,), width=7)
        d.rounded_rectangle((17, 17, w - 1, h - 1), 8, outline=col + (255,), width=2)
        d.text((8 + w / 2, 8 + h / 2), wort, font=fn, fill=col + (255,), anchor="mm")
        _STEMPEL[k] = im.rotate(8, resample=Image.BICUBIC, expand=True)
    return _STEMPEL[k]

def stempel(d, cx, cy, wort, size=60):
    """Stempel wahr (gruen) oder falsch (rot), Mitte cx, cy."""
    col = GREEN if wort == "wahr" else RED
    im = stempel_bild(wort.upper(), col, size); x0, y0 = int(cx - im.width / 2), int(cy - im.height / 2)
    imbild(y0, y0 + im.height, "Stempel"); assert 24 <= x0 and x0 + im.width <= 1256, "Stempel laeuft aus dem Bild"
    d._image.paste(im, (x0, y0), im)

def satz_karte(d, x, y, w, h, txt, size=44):
    """Karte mit einem Satz, mittig."""
    imbild(y, y + h, "Satz"); card(d, x, y, w, h, stripe=False)
    TB(d, x + w / 2, y + h / 2, txt, F(size, 700), DARK, w - 40, "mm", "Satz")

def zeichen_kachel(d, x, y, w, z, name, hl=False):
    """Ein Vergleichszeichen im Code-Kasten, darunter sein Name."""
    imbild(y, y + 124, "Zeichen")
    d.rounded_rectangle((x, y, x + w, y + 80), 14, fill=BOX, outline=RED if hl else None, width=5 if hl else 0)
    TB(d, x + w / 2, y + 40, z, M(48, True), CODE_T, w - 20, "mm", "Zeichen")
    TB(d, x + w / 2, y + 96, name, F(30, 700 if hl else 600), RED if hl else GREY, w + 30, "ma", "Zeichen-Name")


# ---------------------------------------------------------------- 1 Getraenkeautomat: wahr oder falsch
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Stimmt der Satz?")
    weg = a(3, 0.36)                                   # bei „heißt Aussage“ (Satzende) Wechsel auf das Wort Aussage
    E(f, t, 0.4, lambda d, dy: automat(d, 80, 150 + dy, 1.0, "1,50 €"), weg)
    E(f, t, a(1, 0.0), lambda d, dy: (muenze(d, 560, 340 + dy, 54, "2 €"), pfeil(d, 634, 340 + dy, 700, 340 + dy, GREY, 6, 18)), weg)
    E(f, t, a(1, 0.3), lambda d, dy: satz_karte(d, 460, 140 + dy, 760, 100, "„Das Geld reicht“", 48), weg)
    E(f, t, a(1, 0.75), lambda d, dy: stempel(d, 880, 340 + dy, REICHT_2), weg)
    E(f, t, a(2, 0.0), lambda d, dy: (muenze(d, 560, 490 + dy, 54, "1 €"), pfeil(d, 634, 490 + dy, 700, 490 + dy, GREY, 6, 18)), weg)
    E(f, t, a(2, 0.55), lambda d, dy: stempel(d, 880, 490 + dy, REICHT_1), weg)
    def wort(d, dy):
        TB(d, 640, 230 + dy, "Aussage", F(112, 700), DARK, 1000, "mm")
        d.rounded_rectangle((440, 298 + dy, 840, 306 + dy), 4, fill=RED)
    E(f, t, a(3, 0.76), wort)
    E(f, t, a(3, 0.38), lambda d, dy: TB(d, 640, 350 + dy, "ein Satz, der stimmt oder nicht stimmt", F(36, 600), GREY, 1100, "mm"))
    def werte(d, dy):
        wert_chip(d, 440, 440 + dy, "wahr", 96, anchor="m")
        TB(d, 640, 488 + dy, "oder", F(36, 600), GREY, 160, "mm")
        wert_chip(d, 840, 440 + dy, "falsch", 96, anchor="m")
    E(f, t, a(4, 0.1), werte)
    E(f, t, a(4, 0.6), lambda d, dy: tag(d, 340, 586 + dy, 600, 64, "dazwischen gibt es nichts", LIGHTK, DARK, 32, 700, outl=GREY))


# ---------------------------------------------------------------- 2 Aus dem Satz wird ein Vergleich
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Aus dem Satz wird ein Vergleich")
    weg2 = a(3, 0.3)                                  # Satzkarte und Zeile verschwinden, sobald die Zeichen kommen
    E(f, t, a(0, 0.15), lambda d, dy: satz_karte(d, 60, 118 + dy, 440, 84, "„Das Geld reicht“", 40), weg2)
    def mindestens(d, dy):
        pfeil(d, 516, 160 + dy, 572, 160 + dy, GREY, 6, 18)
        fr_, fn = F(34, 700), F(34, 600); w1 = fr_.getlength("mindestens ")
        fit("mindestens so viel, wie die Cola kostet", fn, 1220 - 590, "Satz")
        T2(d, 590, 160 + dy, "mindestens ", fr_, RED, "lm")
        T2(d, 590 + w1, 160 + dy, "so viel, wie die Cola kostet", fn, DARK, "lm")
    E(f, t, a(1, 0.3), mindestens, weg2)
    E(f, t, a(2, 0.4), lambda d, dy: vergleich(d, 640, 222 + dy, "2", ">=", "1.5", 68, unter=("dein Geld", "Preis der Cola"),
                                                op_col=RED, anchor="m"))
    xs = [123 + k * 215 for k in range(5)]                 # 5 x 175 + 4 x 40 = 1035, mittig
    for k, (z, name) in enumerate(ZEICHEN):
        hl = k == 4 and t >= a(4, 0.0)
        E(f, t, a(3, 0.36 + 0.13 * k), lambda d, dy, k=k, z=z, name=name, hl=hl: zeichen_kachel(d, xs[k], 420 + dy, 175, z, name, hl))
    E(f, t, a(4, 0.35), lambda d, dy: TB(d, xs[4] + 87, 552 + dy, "zwei Gleichheitszeichen", F(30, 700), RED, 460, "ma"))
    def tf(d, dy):
        TB(d, 560, 640 + dy, "Python schreibt:", F(34, 600), GREY, 400, "rm")
        x1 = wert_chip(d, 590, 608 + dy, "True", 64)
        wert_chip(d, x1 + 30, 608 + dy, "False", 64)
    E(f, t, a(5, 0.45), tf)


# ---------------------------------------------------------------- 3 Der Grenzfall
VX, VY1, VY2, VS = 120, 214, 336, 56
def grenz_zeile(f, t, y, op, t_in, t_erg, erwartet):
    """Wie vergleich_zeile (b02), aber Pfeil und Ergebnis stehen in beiden Zeilen an derselben Stelle (die Kaesten
    fuer >= und > sind verschieden breit). Das Ergebnis wird nachgerechnet."""
    wort = WORT(eval(f"1.5 {op} {PREIS}")); assert wort == erwartet, (op, wort)
    bw, hc = vergleich_mass("1.5", op, "1.5", VS); xa = VX + vergleich_mass("1.5", ">=", "1.5", VS)[0]
    E(f, t, t_in, lambda d, dy: vergleich(d, VX, y + dy, "1.5", op, "1.5", VS))
    def erg(d, dy):
        pfeil(d, VX + bw + 16, y + hc / 2 + dy, xa + 74, y + hc / 2 + dy, GREY, 6, 18)
        ch = int(hc * 0.78); wert_chip(d, xa + 88, y + (hc - ch) / 2 + dy, wort, ch)
    E(f, t, t_erg, erg)

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Genau auf der Grenze")
    E(f, t, a(0, 0.45), lambda d, dy: tag(d, 60, 116 + dy, 300, 62, "Grenzfall", RED, WHITE, 36))
    E(f, t, a(1, 0.0), lambda d, dy: (chip(d, 400, 116 + dy, 300, 62, "Geld: 1,50 €", LIGHTA, AMB, 32),
                                       chip(d, 724, 116 + dy, 300, 62, "Preis: 1,50 €", LIGHTK, DARK, 32)))
    grenz_zeile(f, t, VY1, ">=", a(2, 0.0), a(2, 0.45), "wahr")
    E(f, t, a(2, 0.6), lambda d, dy: TB(d, 790, VY1 + 48 + dy, "Gleich viel reicht.", F(32, 600), GREY, 430, "lm"))
    grenz_zeile(f, t, VY2, ">", a(3, 0.0), a(3, 0.3), "falsch")
    E(f, t, a(3, 0.5), lambda d, dy: TB(d, 790, VY2 + 48 + dy, "1.5 ist nicht größer als 1.5.", F(32, 600), GREY, 430, "lm"))
    fm = M(VS, True); ox0 = VX + 28 + fm.getlength("1.5 "); ox1 = ox0 + fm.getlength(">")
    E(f, t, a(4, 0.0), lambda d, dy: durchstreichen(d, ox0 - 8, VY2 + 18 + dy, ox1 + 8, VY2 + 78 + dy))
    E(f, t, a(4, 0.3), lambda d, dy: check_circle(d, 78, VY1 + 48 + dy, 22))
    # letzter Satz: zeiten() schaetzt sein Ende (7,2 s statt 6,3 s gesprochen), daher kleinere Anteile
    for k, (_, wert, txt) in enumerate(PROBE):
        col = RED if k == 1 else GREY
        E(f, t, a(5, (0.40, 0.62, 0.78)[k]), lambda d, dy, k=k, wert=wert, txt=txt, col=col:
          wertereihe(d, 60 + k * 394, 476 + dy, 372, [(wert, txt, col)], 128, 50))


# ---------------------------------------------------------------- 4 NICHT und die Wahrheitstabelle
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Ein Wort dreht die Aussage um")
    E(f, t, a(0, 0.8), lambda d, dy: tag(d, 60, 118 + dy, 240, 68, "NICHT", RED, WHITE, 44))
    E(f, t, a(1, 0.0), lambda d, dy: aussage_karte(d, 60, 214 + dy, 620, 92, "A", "„Das Geld reicht“"))
    E(f, t, a(1, 0.5), lambda d, dy: aussage_karte(d, 60, 326 + dy, 620, 92, "NICHT A", "„Das Geld reicht nicht“", RED))
    for k, (v0, v1) in enumerate(NICHT_ZEILEN):
        def flip(d, dy, k=k, v0=v0, v1=v1):
            y = 462 + k * 92 + dy
            wert_chip(d, 170, y, v0, 68, anchor="m")
            pfeil(d, 270, y + 34, 340, y + 34, GREY, 6, 18)
            wert_chip(d, 440, y, v1, 68, anchor="m")
        E(f, t, a(2, 0.05 + 0.5 * k), flip)
    TX, TY = 760, 214
    wahrheitstabelle(f, t, TX, TY, ["A", "NICHT A"], NICHT_ZEILEN, [a(3, 0.15), a(3, 0.15)],
                     [[a(3, 0.45), a(3, 0.65)], [a(3, 0.5), a(3, 0.7)]], breiten=[200, 260], rh=66, size=38, trenner=1)
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, TX, 444 + dy, 460, 66, "Wahrheitstabelle", DARK, WHITE, 36))
    E(f, t, a(4, 0.5), lambda d, dy: TB(d, TX + 230, 540 + dy, "listet jeden Fall auf", F(30, 600), GREY, 460, "mm"))


# ---------------------------------------------------------------- 5 Merksatz und Ausblick
AUSBLICK = Dia(20); AUSBLICK.node("d", "dec", "geld >= 1.5?", 0, 0)
RBOX = (730, 436, 440, 156)
LINIE = (52, 58, 68)                                    # Strichfarbe der Plan-Symbole (pap.py LINEC)

def raute_ausblick(f, al):
    """Die Raute allein, mit zwei kurzen Ausgaengen ja (links) und nein (rechts) nach unten."""
    z, cam = plan_draw(f, al, AUSBLICK, RBOX, maxzoom=1.8)
    x0, y0, x1, y1 = plan_kasten(RBOX, z, cam, AUSBLICK.nodes["d"]); ym = (y0 + y1) / 2
    def wege(d, dy):
        fl = F(max(17, int(20 * z)), 700)
        for xe, xa, txt, anc in ((x0, x0 - 70, "ja", "rs"), (x1, x1 + 70, "nein", "ls")):
            d.line((xe, ym, xa, ym), fill=LINIE, width=3)
            pfeil(d, xa, ym - 1, xa, ym + 74, LINIE, 3, 15)
            T2(d, xe + (-10 if anc == "rs" else 10), ym - 8, txt, fl, LABC_B02, anc)
        imbild(y0, ym + 74, "Raute")
    f.el(al, wege)

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Das nimmst du mit")
    E(f, t, a(0, 0.1), lambda d, dy: tag(d, 60, 120 + dy, 1160, 100, "Eine Aussage ist wahr oder falsch.", RED, WHITE, 52))
    def zeile(d, dy, y, txt, code):
        d.rounded_rectangle((60, y + dy, 1220, y + 76 + dy), 14, fill=WHITE, outline=LINE, width=2)
        check_circle(d, 104, y + 38 + dy, 22)
        TB(d, 146, y + 38 + dy, txt, F(34, 700), DARK, 760, "lm")
        l_, o_, r_ = code.split(); vergleich(d, 930, y + 8 + dy, l_, o_, r_, 34, pad=20)
    E(f, t, a(1, 0.05), lambda d, dy: zeile(d, dy, 250, "Ein Vergleich ist eine Aussage über Zahlen.", "2 >= 1.5"))
    E(f, t, a(2, 0.05), lambda d, dy: zeile(d, dy, 342, "Den Grenzfall prüfst du immer mit.", "1.5 >= 1.5"))
    def weiter(d, dy):
        TB(d, 60, 520 + dy, "Als Nächstes:", F(32, 600), GREY, 520)
        TB(d, 60, 562 + dy, "die Raute im Plan", F(48, 700), DARK, 560)
    E(f, t, a(3, 0.1), weiter)
    raute_ausblick(f, show(t, a(3, 0.2)))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Wahr oder falsch", F(96, 700), DARK)
        T2(d, 90, 290, "Aussagen und Vergleiche", F(40, 400), GREY)
        tag(d, 90, 560, 600, 70, "Den Grenzfall prüfst du immer mit", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    def vgl(d, dy):
        g = vergleich(d, 90, 380, "2", ">=", "1.5", 64)
        pfeil(d, g["x1"] + 16, (g["y0"] + g["y1"]) / 2, g["x1"] + 74, (g["y0"] + g["y1"]) / 2, GREY, 6, 18)
        wert_chip(d, g["x1"] + 88, g["y0"] + 12, "True", int((g["y1"] - g["y0"]) * 0.78))
    f.el(1, vgl)
    f.el(1, lambda d, dy: automat(d, 900, 150, 1.0, "1,50 €"))
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
