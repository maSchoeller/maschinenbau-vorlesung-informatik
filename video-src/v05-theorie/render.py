"""Termin 05, Video 1: Die Stellenwerttabelle: binaer und dezimal (Zaehlen mit zwei Ziffern, Stellenwerte und acht Schalter,
Binaer in dezimal, Dezimal in binaer mit Rest, ein Byte hat 256 Werte).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v05-theorie"; LABEL = "DHBW · Informatik · Termin 05 · Die Stellenwerttabelle: binär und dezimal"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
WERTE = [128, 64, 32, 16, 8, 4, 2, 1]
assert all(WERTE[i] == 2 * WERTE[i + 1] for i in range(7)) and WERTE[-1] == 1             # jede Stelle doppelt so viel wert
BYTE45 = "00101101"
assert int(BYTE45, 2) == 45 and f"{45:08b}" == BYTE45
BITS45 = [int(c) for c in BYTE45]
assert [w for w, b in zip(WERTE, BITS45) if b] == [32, 8, 4, 1] and 32 + 8 + 4 + 1 == 45
assert 3 * 100 + 4 * 10 + 5 * 1 == 345
# Dezimal in binaer: von links, passt der Stellenwert in den Rest?
PASST, BITS, RESTE = [], [], []; rest = 45
for w in WERTE:
    p = w <= rest; PASST.append("ja" if p else "nein"); BITS.append(int(p)); rest -= w if p else 0; RESTE.append(rest)
assert PASST == ["nein", "nein", "ja", "nein", "ja", "ja", "nein", "ja"]
assert BITS == BITS45 and RESTE == [45, 45, 13, 13, 5, 1, 1, 0]                           # wie Lerneinheit und Sprechtext
# Werte je Bit und Byte
assert [2 ** b for b in (1, 2, 3, 4, 8)] == [2, 4, 8, 16, 256] and sum(WERTE) == 255 == 2 ** 8 - 1
assert int("11111111", 2) == 255
# Wahrheitstabelle mit vier Variablen: die Zeilen zaehlen von 0000 bis 1111 (0 bis 15)
ZEILEN4 = [[c for c in f"{n:04b}"] for n in range(16)]
assert ZEILEN4[0] == list("0000") and ZEILEN4[1] == list("0001") and ZEILEN4[2] == list("0010") and ZEILEN4[15] == list("1111")
assert [int("".join(z), 2) for z in ZEILEN4] == list(range(16)) and int("1011", 2) == 11


def pos(i, k, snip, after=None):
    """Anteil (0..1) im Satz k der Szene i, an dem der Sprechtext `snip` beginnt (zeichenproportional, leicht vorgezogen)."""
    s = SECS[i - 1][k][1]; st = s.find(after) if after else 0
    j = s.find(snip, max(st, 0)); assert j >= 0, f"Sprechtext enthaelt nicht: {snip!r}"
    return max(0.0, j / len(s) - 0.02)


# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
def fest(d, x, y, teile, font, col_default=DARK):
    """Textzeile aus farbigen Teilen [(text, farbe)], links ab x, Mitte bei y; gibt die Endposition zurueck."""
    cx = x
    for s, col in teile:
        T2(d, cx, y, s, font, col or col_default, "lm"); cx += font.getlength(s)
    return cx


def breite(teile, font):
    return sum(font.getlength(s) for s, _ in teile)


def schalter(d, x, y, w, p, h=None):
    """Kippschalter: p = 0 aus (Knopf unten, grau), p = 1 an (Knopf oben, gruen)."""
    h = h or int(w * 1.5); imbild(y, y + h, "Schalter")
    d.rounded_rectangle((x, y, x + w, y + h), w // 2, fill=mix((196, 200, 208), GREEN, p))
    r = w * 0.38; cx = x + w / 2; cy = lerp(y + h - w / 2, y + w / 2, p)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE, outline=mix(GREYL, (30, 120, 70), p), width=2)


def reihe_x(x0, w, gap, extra=0):
    xs = []; x = x0
    for i in range(8):
        xs.append(x); x += w + gap + (extra if i == 3 else 0)
    return xs


def reihe_breite(w, gap, extra=0):
    return 8 * w + 7 * gap + extra


def werte_zelle(d, x, y, w, h, wert, p, size):
    """Wertzelle ueber einem Schalter; leuchtet gruen, wenn der Schalter an ist."""
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=mix(LIGHTK, LIGHTG, p), outline=mix(LINE, GREEN, p), width=2)
    TB(d, x + w / 2, y + h / 2, str(wert), F(size, 700), mix(GREY, (30, 120, 70), p), w - 12, "mm", "Stellenwert")


def reihe(d, xs, y, w, ps, vh=48, vsize=30, swh=None, digit_size=0, vals=True, sw=True, digits_a=1.0):
    """Acht Schalter mit Wert darueber (vals) und Bit darunter (digit_size > 0); ps = Zustand 0..1 je Schalter."""
    swh = swh or int(w * 1.5); ys = y + (vh + 14 if vals else 0)
    for i, x in enumerate(xs):
        if vals: werte_zelle(d, x, y, w, vh, WERTE[i], ps[i], vsize)
        if sw: schalter(d, x, ys, w, ps[i], swh)
        if digit_size:
            b = "1" if ps[i] > 0.5 else "0"
            TB(d, x + w / 2, ys + swh + 14 + digit_size * 0.55, b, F(digit_size, 700), GREEN if b == "1" else GREY, w, "mm", "Bit")
    return ys


def faktor_chip(d, cx, y, w, txt):
    """Chip ueber der Grenze zweier Stellen: jede Stelle ist so viel mal die rechts daneben (Pfeil zeigt nach links)."""
    chip(d, cx - w / 2, y, w, 34, txt, LIGHTA, AMB, 24)
    pfeil(d, cx + 22, y + 44, cx - 22, y + 44, AMB, 3, 11)


# ---------------------------------------------------------------- 1 Die Wahrheitstabelle zaehlt: Zweiersystem, Bit, Byte
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zählen mit zwei Ziffern")
    x, y, rh = 80, 112, 33
    t_ein = a(0, 0.08)
    t_erste = a(0, pos(1, 0, "null null null null bis"))               # Zeile 0000
    t_letzte = a(0, pos(1, 0, "bis eins eins eins"))                     # Zeile 1111
    # Zahlenspalte: 0, 1, 2 beim Aufzaehlen, dann der Rest schnell
    t0 = a(1, pos(1, 1, "null null null null,", after="zählen"))
    t1 = a(1, pos(1, 1, "null null null eins"))
    t2 = a(1, pos(1, 1, "null null eins null"))
    t_rest = a(1, pos(1, 1, "und so weiter"))
    t_zahl = [t0, t1, t2] + [t_rest + 0.12 * (n - 2) for n in range(3, 16)]
    # Hervorhebung: erst 0000, dann 1111, beim Zaehlen die gerade genannte Zeile
    vis = [n for n in range(16) if t >= t_zahl[n]]
    if t >= t_zahl[0]:
        hl = {vis[-1]} if t < t_zahl[15] + 0.5 else set(); hl_a = 1.0
    elif t >= t_letzte: hl, hl_a = {15}, ap(t, t_letzte, 0.2)
    elif t >= t_erste: hl, hl_a = {0}, ap(t, t_erste, 0.2)
    else: hl, hl_a = set(), 1.0
    wahrheitstabelle(f, t, x, y, ["A", "B", "C", "D"], ZEILEN4, [t_ein] * 4, hl=hl, hl_a=hl_a, breiten=[84] * 4, rh=rh, size=26, kopf_size=24, farbig=False)
    zx = x + 336 + 20; zw = 120
    def zahl_kopf(d, dy):
        d.rectangle((zx, y + dy, zx + zw, y + rh + dy), fill=BLUE, outline=BLUE)
        TB(d, zx + zw / 2, y + rh / 2 + dy, "Zahl", F(24, 700), WHITE, zw - 16, "mm", "Zahlenkopf")
    E(f, t, t0 - 0.2, zahl_kopf)
    for n in range(16):
        def zelle(d, dy, n=n):
            yy = y + rh * (n + 1) + dy
            d.rectangle((zx, yy, zx + zw, yy + rh), fill=LIGHTB, outline=LINE, width=2)
            TB(d, zx + zw / 2, yy + rh / 2, str(n), F(26, 700), BLUE, zw - 16, "mm", "Zahl")
        E(f, t, t_zahl[n], zelle)
    # rechts: die drei Begriffe
    rx, rw = 640, 580
    def zweier(d, dy):
        card(d, rx, 130 + dy, rw, 124)
        TB(d, rx + 36, 170 + dy, "Zweiersystem", F(40, 700), DARK, rw - 70, "lm")
        TB(d, rx + 36, 218 + dy, "nur die Ziffern 0 und 1", F(30, 400), GREY, rw - 70, "lm")
    def bit(d, dy):
        card(d, rx, 276 + dy, rw, 124)
        TB(d, rx + 36, 316 + dy, "Bit", F(40, 700), DARK, 300, "lm")
        TB(d, rx + 36, 364 + dy, "eine Stelle: 0 oder 1", F(30, 400), GREY, 380, "lm")
        d.rounded_rectangle((rx + rw - 120, 296 + dy, rx + rw - 40, 380 + dy), 12, fill=LIGHTG, outline=GREEN, width=3)
        T2(d, rx + rw - 80, 338 + dy, "1", F(54, 700), GREEN, "mm")
    def byte(d, dy):
        card(d, rx, 422 + dy, rw, 190)
        TB(d, rx + 36, 462 + dy, "Byte", F(40, 700), DARK, 300, "lm")
        TB(d, rx + 36, 510 + dy, "= 8 Bit", F(30, 400), GREY, 300, "lm")
        for i, c in enumerate("00101101"):
            bx = rx + 36 + i * 62 + (20 if i >= 4 else 0)
            d.rounded_rectangle((bx, 548 + dy, bx + 54, 596 + dy), 8, fill=LIGHTG if c == "1" else WHITE, outline=GREEN if c == "1" else GREYL, width=3)
            T2(d, bx + 27, 572 + dy, c, F(34, 700), GREEN if c == "1" else GREY, "mm")
    E(f, t, a(2, pos(1, 2, "Zweiersystem")), zweier)
    E(f, t, a(2, pos(1, 2, "Jede Stelle heißt Bit")), bit)
    E(f, t, a(2, pos(1, 2, "acht Bit sind")), byte)


# ---------------------------------------------------------------- 2 Stellenwerte: 345 und acht Schalter
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Jede Stelle hat ihren Wert")
    # links: Dezimalsystem mit 345
    lx, lw, lgap = 80, 120, 20
    lxs = [lx + k * (lw + lgap) for k in range(3)]
    DEZ = [100, 10, 1]; ZIF = [3, 4, 5]; PROD = [d_ * z for d_, z in zip(DEZ, ZIF)]
    assert PROD == [300, 40, 5] and sum(PROD) == 345 and all(DEZ[i] == 10 * DEZ[i + 1] for i in range(2))
    yv, yd, yp = 226, 296, 396
    t_dez = a(0, pos(2, 0, "zehnmal"))
    E(f, t, a(0, 0.0), lambda d, dy: TB(d, 80, 134 + dy, "Dezimalsystem", F(30, 700), GREY, 300, "lm", "Titel"))
    for k in range(3):
        E(f, t, t_dez + 0.1 * k, lambda d, dy, k=k: werte_zelle(d, lxs[k], yv + dy, lw, 52, DEZ[k], 0, 32))
    for k in range(2):
        E(f, t, t_dez + 0.35 + 0.1 * k, lambda d, dy, k=k: faktor_chip(d, lxs[k] + lw + lgap / 2, 168 + dy, 70, "· 10"))
    t_345 = a(0, pos(2, 0, "Bei dreihundertfünfundvierzig"))
    t_p = [a(0, pos(2, 0, "für dreihundert")), a(0, pos(2, 0, "für vierzig")), a(0, pos(2, 0, "für fünf"))]
    def ziffer(d, dy, k):
        d.rounded_rectangle((lxs[k], yd + dy, lxs[k] + lw, yd + 84 + dy), 12, fill=WHITE, outline=DARK, width=3)
        T2(d, lxs[k] + lw / 2, yd + 42 + dy, str(ZIF[k]), F(58, 700), DARK, "mm")
    def produkt(d, dy, k):
        d.rounded_rectangle((lxs[k], yp + dy, lxs[k] + lw, yp + 56 + dy), 10, fill=LIGHTB, outline=BLUE, width=2)
        TB(d, lxs[k] + lw / 2, yp + 28 + dy, str(PROD[k]), F(32, 700), BLUE, lw - 12, "mm", "Produkt")
        pfeil(d, lxs[k] + lw / 2, yd + 90 + dy, lxs[k] + lw / 2, yp - 6 + dy, GREYL, 3, 11)
    for k in range(3):
        E(f, t, t_345 + 0.25 * k, lambda d, dy, k=k: ziffer(d, dy, k))
        E(f, t, t_p[k], lambda d, dy, k=k: produkt(d, dy, k))
    def summe(d, dy):
        teile = [("345", DARK), (" = ", GREY), ("300", BLUE), (" + ", GREY), ("40", BLUE), (" + ", GREY), ("5", BLUE)]
        font = F(34, 700); w_ = breite(teile, font); assert w_ <= 440
        card(d, 60, 480 + dy, 460, 70, stripe=False, fill=WHITE)
        fest(d, 60 + 230 - w_ / 2, 515 + dy, teile, font)
    E(f, t, t_p[2] + 0.9, summe)
    # rechts: Zweiersystem mit acht Schaltern
    rw_, rg = 70, 8
    rxs = reihe_x(596, rw_, rg); assert rxs[-1] + rw_ <= 1216
    E(f, t, a(1, 0.0), lambda d, dy: TB(d, 596, 134 + dy, "Zweiersystem", F(30, 700), GREY, 300, "lm", "Titel"))
    s_list = [a(1, pos(2, 1, nm, after="nach links")) for nm in
              ["eins,", "zwei,", "vier,", "acht,", "sechzehn", "zweiunddreißig", "vierundsechzig", "hundertachtundzwanzig"]]
    for k in range(8):                                           # von rechts nach links: k = 0 ist der Wert 1
        i = 7 - k
        E(f, t, s_list[k], lambda d, dy, i=i: werte_zelle(d, rxs[i], yv + dy, rw_, 52, WERTE[i], 0, 30))
        if i < 7:
            E(f, t, s_list[k], lambda d, dy, i=i: faktor_chip(d, rxs[i] + rw_ + rg / 2, 168 + dy, 52, "· 2"))
    # Schalter erscheinen, der mit dem Wert 8 wird gekippt
    t_sw = a(2, pos(2, 2, "Stell dir"))
    t_an = a(2, pos(2, 2, "Ist der Schalter an")); t_aus = a(2, pos(2, 2, "sonst nicht"))
    p8 = ap(t, t_an, 0.3) * (1 - ap(t, t_aus, 0.3))
    for i in range(8):
        def sw(d, dy, i=i):
            schalter(d, rxs[i], yv + 66 + dy, rw_, p8 if i == 4 else 0.0)
            if i == 4: werte_zelle(d, rxs[i], yv + dy, rw_, 52, WERTE[i], p8, 30)
        E(f, t, t_sw + 0.06 * i, sw)
    E(f, t, t_an, lambda d, dy: tag(d, 596, 450 + dy, 300, 58, "an: der Wert zählt mit", LIGHTG, GREEN, 26, 700, outl=GREEN))
    E(f, t, t_aus, lambda d, dy: tag(d, 912, 450 + dy, 300, 58, "aus: zählt nicht", LIGHTK, DARK, 26, 700, outl=GREY))


# ---------------------------------------------------------------- 3 Binaer in dezimal: 0010 1101 = 45
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Binär in dezimal: 0010 1101")
    w_, gap, extra = 96, 14, 40
    xs = reihe_x(640 - reihe_breite(w_, gap, extra) / 2, w_, gap, extra)
    t_an = {2: a(1, pos(3, 1, "bei zweiunddreißig")), 4: a(1, pos(3, 1, "bei acht")),
            5: a(1, pos(3, 1, "bei vier")), 7: a(1, pos(3, 1, "bei eins."))}
    ps = [ap(t, t_an[i], 0.35) if i in t_an else 0.0 for i in range(8)]
    assert sorted(t_an) == [i for i, b in enumerate(BITS45) if b]                   # Schalter an genau dort, wo eine 1 steht
    t_in = a(0, 0.05)
    yv = 124
    def zeile(d, dy):
        ys = reihe(d, xs, yv + dy, w_, ps, vh=56, vsize=36, swh=144, digit_size=0)
        yb = ys + 144 + 44
        for i, x in enumerate(xs):                               # Bits unter den Schaltern
            b = str(BITS45[i])
            TB(d, x + w_ / 2, yb, b, F(62, 700), GREEN if b == "1" else GREY, w_, "mm", "Bit")
    E(f, t, t_in, zeile)
    def klammer(d, dy):
        ygr = 124 + 56 + 14 + 144 + 44 + 52 + dy
        for g in range(2):
            x0 = xs[4 * g] + 4; x1 = xs[4 * g + 3] + w_ - 4
            d.line((x0, ygr, x0, ygr + 14, x1, ygr + 14, x1, ygr), fill=BLUE, width=4, joint="curve")
            TB(d, (x0 + x1) / 2, ygr + 40, "Vierergruppe", F(28, 600), BLUE, 300, "mm", "Gruppe")
    E(f, t, a(0, pos(3, 0, "in zwei")), klammer)
    # die Summe
    fs_ = F(58, 700)
    teile = [("32", GREEN), (" + ", GREY), ("8", GREEN), (" + ", GREY), ("4", GREEN), (" + ", GREY), ("1", GREEN)]
    erg = [(" = ", GREY), ("45", RED)]
    wges = breite(teile + erg, fs_); assert wges <= 900 and 32 + 8 + 4 + 1 == 45
    x_s = 640 - wges / 2; cy = 600
    E(f, t, a(2, 0.0), lambda d, dy: card(d, 140, cy - 54 + dy, 1000, 108, stripe=False))
    E(f, t, a(2, pos(3, 2, "zweiunddreißig plus")), lambda d, dy: fest(d, x_s, cy + dy, teile, fs_))
    E(f, t, a(2, pos(3, 2, "ergibt")), lambda d, dy: fest(d, x_s + breite(teile, fs_), cy + dy, erg, fs_))
    E(f, t, a(2, 0.05), lambda d, dy: TB(d, 640, 512 + dy, "Werte der Einsen addieren", F(28, 600), GREY, 600, "mm", "Hinweis"), tout=None)


# ---------------------------------------------------------------- 4 Dezimal in binaer: die Zahl 45
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Dezimal in binär: die Zahl 45")
    x0, lw, cw, rh, y0 = 75, 250, 110, 62, 124
    ZE = ["Stellenwert", "passt in den Rest?", "Bit", "Rest danach"]
    t_tab = a(0, 0.02)
    def gitter(d, dy):
        for r in range(4):
            yy = y0 + r * rh + dy
            d.rectangle((x0, yy, x0 + lw, yy + rh), fill=DARK if r == 0 else LIGHTK, outline=DARK if r == 0 else LINE, width=2)
            TB(d, x0 + lw / 2, yy + rh / 2, ZE[r], F(26, 700), WHITE if r == 0 else DARK, lw - 16, "mm", "Zeilenkopf")
            for j in range(8):
                xx = x0 + lw + j * cw
                d.rectangle((xx, yy, xx + cw, yy + rh), fill=DARK if r == 0 else WHITE, outline=DARK if r == 0 else LINE, width=2)
                if r == 0: TB(d, xx + cw / 2, yy + rh / 2, str(WERTE[j]), F(34, 700), WHITE, cw - 16, "mm", "Stellenwert")
    E(f, t, t_tab, gitter)
    # Zeitpunkte je Spalte: Stellenwert genannt, Bit, Rest
    tc = [a(1, pos(4, 1, "hundertachtundzwanzig")), a(1, pos(4, 1, "vierundsechzig")), a(1, pos(4, 1, "zweiunddreißig")),
          a(2, pos(4, 2, "sechzehn")), a(2, pos(4, 2, "acht: ja")), a(2, pos(4, 2, "vier: ja")),
          a(2, pos(4, 2, "zwei: nein")), a(2, pos(4, 2, "eins: ja"))]
    trest = {2: a(1, pos(4, 1, "Der Rest ist dreizehn")), 4: a(2, pos(4, 2, "der Rest ist fünf")),
             5: a(2, pos(4, 2, "der Rest ist eins")), 7: a(2, pos(4, 2, "der Rest ist null"))}
    t_ende = a(3, 0.0) - 0.45                                      # alte Hinweise gehen, bevor das Ergebnis kommt
    for j in range(8):
        nxt = tc[j + 1] if j < 7 else t_ende
        tb = min(tc[j] + 0.55, nxt - 0.3); tr = trest.get(j, min(tb + 0.25, nxt - 0.1)); tr = max(tr, tb + 0.15)
        tr = min(tr, nxt - 0.05) if j < 7 else tr
        def passt(d, dy, j=j):
            xx = x0 + lw + j * cw; yy = y0 + rh + dy
            TB(d, xx + cw / 2, yy + rh / 2, PASST[j], F(32, 700), GREEN if PASST[j] == "ja" else RED, cw - 16, "mm", "passt")
        def bit(d, dy, j=j):
            xx = x0 + lw + j * cw; yy = y0 + 2 * rh + dy
            if BITS[j]: d.rectangle((xx + 2, yy + 2, xx + cw - 2, yy + rh - 2), fill=LIGHTG)
            TB(d, xx + cw / 2, yy + rh / 2, str(BITS[j]), F(40, 700), GREEN if BITS[j] else GREY, cw - 16, "mm", "Bit")
        def rest_(d, dy, j=j):
            xx = x0 + lw + j * cw; yy = y0 + 3 * rh + dy
            TB(d, xx + cw / 2, yy + rh / 2, str(RESTE[j]), F(34, 700), BLUE, cw - 16, "mm", "Rest")
        E(f, t, tc[j] + 0.15, passt); E(f, t, tb, bit); E(f, t, tr, rest_)
        tout = nxt if j < 7 else t_ende
        al = ap(t, tc[j], 0.15) * (1 - ap(t, tout, 0.2))
        f.el(al, lambda d, dy, j=j: d.rectangle((x0 + lw + j * cw - 2, y0 - 2, x0 + lw + (j + 1) * cw + 2, y0 + 4 * rh + 2), outline=RED, width=5))
    # darunter: Frage und Regeln, spaeter Ergebnis und Probe
    E(f, t, a(0, 0.05), lambda d, dy: tag(d, 80, 410 + dy, 360, 66, "Zu Beginn: Rest = 45", LIGHTB, BLUE, 30, 700, outl=BLUE), tout=t_ende)
    E(f, t, a(0, pos(4, 0, "Passt der Wert")), lambda d, dy: tag(d, 460, 410 + dy, 740, 66, "Passt der Stellenwert in den Rest?", LIGHTK, DARK, 32, 700, outl=GREY), tout=t_ende)
    t_regel = a(1, pos(4, 1, "und du ziehst ab"))
    E(f, t, t_regel, lambda d, dy: tag(d, 80, 510 + dy, 560, 66, "ja: Bit 1, Wert vom Rest abziehen", LIGHTG, GREEN, 28, 700, outl=GREEN), tout=t_ende)
    E(f, t, t_regel + 0.3, lambda d, dy: tag(d, 660, 510 + dy, 540, 66, "nein: Bit 0, der Rest bleibt", LIGHTR, RED, 28, 700, outl=RED), tout=t_ende)
    t_erg = a(3, 0.03); t_probe = a(3, pos(4, 3, "Zur Probe"))
    E(f, t, t_erg, lambda d, dy: tag(d, 80, 420 + dy, 1120, 84, "Ergebnis: 0010 1101", RED, WHITE, 46))
    E(f, t, t_probe, lambda d, dy: tag(d, 80, 530 + dy, 1120, 84, "Probe: 32 + 8 + 4 + 1 = 45", LIGHTG, GREEN, 42, 700, outl=GREEN))
    # Bit-Zeile am Ende umrahmen
    f.el(ap(t, t_erg, 0.3), lambda d, dy: d.rectangle((x0 - 2, y0 + 2 * rh - 2, x0 + lw + 8 * cw + 2, y0 + 3 * rh + 2), outline=RED, width=5))


# ---------------------------------------------------------------- 5 Ein Byte hat 256 Werte
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Ein Byte: 256 Werte")
    bits = [1, 2, 3, 4, 8]; cwid, cg = 200, 40
    zt = [a(0, 0.03), a(0, pos(5, 0, "vier, acht")), a(0, pos(5, 0, "acht, sechzehn")), a(0, pos(5, 0, "sechzehn, und")),
          a(0, pos(5, 0, "zweihundertsechsundfünfzig") - 0.03)]
    for i, b in enumerate(bits):
        cx = 60 + i * (cwid + cg); last = b == 8
        def karte(d, dy, i=i, b=b, cx=cx, last=last):
            card(d, cx, 124 + dy, cwid, 150, stripe=last)
            TB(d, cx + cwid / 2, 158 + dy, f"{b} Bit", F(30, 700), RED if last else GREY, cwid - 24, "mm", "Bit")
            TB(d, cx + cwid / 2, 212 + dy, str(2 ** b), F(64, 700), RED if last else DARK, cwid - 24, "mm", "Anzahl")
            TB(d, cx + cwid / 2, 254 + dy, "Werte", F(26, 400), GREY, cwid - 24, "mm", "Werte")
        E(f, t, zt[i], karte)
        if i:
            lab = "…" if bits[i] == 8 else "· 2"
            E(f, t, zt[i] - 0.05, lambda d, dy, i=i, lab=lab, cx=cx: (T2(d, cx - cg / 2, 168 + dy, lab, F(24, 700), AMB, "mm"),
                                                                   pfeil(d, cx - cg + 6, 199 + dy, cx - 6, 199 + dy, AMB, 3, 10)))
    # darunter: alle Schalter an, Anzeige zaehlt mit
    w_, gap, extra = 64, 14, 36
    xs = reihe_x(640 - reihe_breite(w_, gap, extra) / 2, w_, gap, extra)
    t_s = a(1, 0.0); t_an = a(1, pos(5, 1, "Der größte Wert"))
    t_on = [t_an + 0.12 * i for i in range(8)]
    ps = [ap(t, t_on[i], 0.25) for i in range(8)]
    E(f, t, t_s, lambda d, dy: reihe(d, xs, 296 + dy, w_, ps, vh=44, vsize=28, swh=96, digit_size=36))
    an_ = [i for i in range(8) if ps[i] > 0.5]; summe = sum(WERTE[i] for i in an_)
    bs = "".join("1" if ps[i] > 0.5 else "0" for i in range(8))
    def anzeige(d, dy):
        card(d, 60, 530 + dy, 560, 70, stripe=False)
        TB(d, 340, 565 + dy, f"{bs[:4]} {bs[4:]} = {summe}", F(44, 700), DARK, 520, "mm", "Anzeige")
    E(f, t, t_s + 0.1, anzeige)
    E(f, t, t_s + 0.1, lambda d, dy: tag(d, 660, 530 + dy, 560, 70, "Werte von 0 bis 255", LIGHTG, GREEN, 38, 700, outl=GREEN))
    E(f, t, a(2, 0.15), lambda d, dy: tag(d, 60, 620 + dy, 1160, 64, "Gleich ausprobieren: Baustein „Acht Schalter, ein Byte“", RED, WHITE, 34))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Binär und dezimal", F(96, 700), DARK)
        T2(d, 90, 300, "die Stellenwerttabelle", F(40, 400), GREY)
        tag(d, 90, 600, 500, 70, "8 Bit, 256 Werte", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        xs = reihe_x(640, 64, 8)
        reihe(d, xs, 380, 64, [float(b) for b in BITS45], vh=46, vsize=28, swh=96, digit_size=38)
    f.el(1, fn)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
