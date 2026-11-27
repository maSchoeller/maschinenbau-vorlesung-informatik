"""Termin 04, Video 1: Gleichwertig: zwei Tabellen, eine Spalte (Presse mit zwei Sperren, Tabelle mit zwei Spalten,
Vergleich, dritter Vorschlag, De Morgan, Klammern).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys, re, math
from itertools import product
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v04-theorie"; LABEL = "DHBW · Informatik · Termin 04 · Gleichwertig: zwei Tabellen, eine Spalte"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
KOMBI = list(product((0, 1), repeat=2))                       # Reihenfolge 00, 01, 10, 11
assert KOMBI == [(0, 0), (0, 1), (1, 0), (1, 1)]
b = lambda x: str(int(x))
UND_ = lambda p, q: p & q
ODER_ = lambda p, q: p | q
NICHT_ = lambda p: 1 - p
CUD = [UND_(c, d) for c, d in KOMBI]                          # C UND D
S1 = [NICHT_(UND_(c, d)) for c, d in KOMBI]                   # NICHT (C UND D)
NC = [NICHT_(c) for c, d in KOMBI]; ND = [NICHT_(d) for c, d in KOMBI]
S2 = [ODER_(NICHT_(c), NICHT_(d)) for c, d in KOMBI]          # (NICHT C) ODER (NICHT D)
S3 = [UND_(NICHT_(c), NICHT_(d)) for c, d in KOMBI]           # (NICHT C) UND (NICHT D)
assert CUD == [0, 0, 0, 1] and S1 == [1, 1, 1, 0] and S2 == [1, 1, 1, 0] and S3 == [1, 0, 0, 0]
assert S1 == S2 and S1 != S3                                  # gleichwertig / nicht gleichwertig
assert [i for i in range(4) if S1[i] != S3[i]] == [1, 2]      # die Zeilen 01 und 10 weichen ab
assert KOMBI[1] == (0, 1) and S1[1] == 1 and S3[1] == 0       # Tuer offen, Druck gut: S1 sperrt, S3 gibt frei
assert sum(S1) == 3 and sum(CUD) == 1                         # S1 dreht die Spalte C UND D um
assert [NICHT_(CUD[i]) for i in range(4)] == S1
# A, B: Regel von De Morgan, beide Richtungen
NOR = [NICHT_(ODER_(p, q)) for p, q in KOMBI]; NA_NB = [UND_(NICHT_(p), NICHT_(q)) for p, q in KOMBI]
NAND = [NICHT_(UND_(p, q)) for p, q in KOMBI]; NA_ODER_NB = [ODER_(NICHT_(p), NICHT_(q)) for p, q in KOMBI]
assert NOR == NA_NB == [1, 0, 0, 0] and NAND == NA_ODER_NB == [1, 1, 1, 0]
# Rangfolge: NICHT vor UND vor ODER; A ODER B UND C == A ODER (B UND C), aber nicht (A ODER B) UND C
DREI = list(product((0, 1), repeat=3))
assert all((a or (bb and c)) == (a or bb and c) for a, bb, c in DREI)
assert any(((a or bb) and c) != (a or bb and c) for a, bb, c in DREI)

# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
KWCOL = {"NICHT": BLUE, "UND": RED, "ODER": AMB}


def teile(txt):
    """Text in farbige Teile: NICHT blau, UND rot, ODER bernstein, der Rest dunkel."""
    return [(s, KWCOL.get(s, DARK)) for s in re.findall(r"NICHT|UND|ODER|[^NUO]+|[NUO]", txt)]


def formel(d, x, y, txt, font, maxw, anchor="lm"):
    """Eine Formelzeile mit farbigen Wortzeichen, links (anchor "lm"), mittig ("mm") oder rechts ("rm") an x, Mitte bei y."""
    tt = teile(txt); w = sum(font.getlength(s) for s, _ in tt); fit(txt, font, maxw, "Formel")
    cx = {"lm": x, "mm": x - w / 2, "rm": x - w}[anchor]
    for s, col in tt:
        T2(d, cx, y, s, font, col, "lm"); cx += font.getlength(s)
    return w


def spalten_rahmen(d, x, y, breiten, j0, j1, n, rh, col=RED):
    """Rahmen um die Spalten j0..j1 einer Wahrheitstabelle (Kopf und n Zeilen)."""
    x0 = x + sum(breiten[:j0]); x1 = x + sum(breiten[:j1 + 1])
    d.rectangle((x0 - 3, y - 3, x1 + 3, y + rh * (n + 1) + 3), outline=col, width=6)


def presse(d, x, y, s=1.0, tuer=True, druck_ok=True, warn=False, hl_tuer=0.0, hl_druck=0.0):
    """Presse mit Schutztuer und Manometer, etwa 340 x 460 bei s=1. tuer=True: Tuer geschlossen. druck_ok: Zeiger im gruenen Bereich."""
    P = lambda px, py: (x + px * s, y + py * s)
    R = lambda x0, y0, x1, y1: (x + x0 * s, y + y0 * s, x + x1 * s, y + y1 * s)
    lw = max(2, int(4 * s)); imbild(y, y + 460 * s, "Presse")
    d.rectangle(R(0, 420, 340, 460), fill=LIGHTK, outline=DARK, width=lw)
    TB(d, x + 170 * s, y + 440 * s, "PRESSE", F(int(24 * s), 700), DARK, 200 * s, "mm", "Presse")
    for cx0 in (30, 280):
        d.rectangle(R(cx0, 120, cx0 + 30, 420), fill=LIGHTK, outline=DARK, width=lw)
    d.rectangle(R(10, 60, 330, 130), fill=LIGHTK, outline=DARK, width=lw)
    d.rectangle(R(160, 130, 180, 290), fill=GREYL, outline=DARK, width=max(2, lw - 1))
    d.rectangle(R(110, 290, 230, 326), fill=DARK, outline=DARK)
    d.rectangle(R(80, 380, 260, 420), fill=GREYL, outline=DARK, width=max(2, lw - 1))
    # Schutztuer: geschlossen = Scheibe vor dem Arbeitsraum, offen = zur Seite geklappt
    if tuer:
        d.rectangle(R(60, 150, 280, 420), fill=LIGHTB, outline=BLUE, width=lw)
        d.line((P(74, 164), P(140, 164)), fill=WHITE, width=max(2, int(6 * s)))
        d.rounded_rectangle(R(256, 270, 270, 330), 4, fill=BLUE)
    else:
        d.polygon([P(60, 150), P(96, 170), P(96, 410), P(60, 420)], fill=LIGHTB, outline=BLUE, width=lw)
    # Manometer auf dem Querbalken
    mx, my, mr = 270, 95, 30
    cxp, cyp = P(mx, my)
    d.ellipse((cxp - mr * s, cyp - mr * s, cxp + mr * s, cyp + mr * s), fill=WHITE, outline=DARK, width=lw)
    bb = (cxp - (mr - 6) * s, cyp - (mr - 6) * s, cxp + (mr - 6) * s, cyp + (mr - 6) * s)
    d.arc(bb, 180, 235, fill=RED, width=max(2, int(5 * s))); d.arc(bb, 305, 360, fill=RED, width=max(2, int(5 * s)))
    d.arc(bb, 235, 305, fill=GREEN, width=max(2, int(5 * s)))
    ang = math.radians(270 if druck_ok else 205)
    d.line((cxp, cyp, cxp + math.cos(ang) * (mr - 8) * s, cyp + math.sin(ang) * (mr - 8) * s), fill=DARK, width=max(2, int(4 * s)))
    d.ellipse((cxp - 4 * s, cyp - 4 * s, cxp + 4 * s, cyp + 4 * s), fill=DARK)
    if hl_tuer > 0.01:
        d.rectangle(R(52, 142, 288, 428), outline=mix(WHITE, RED, hl_tuer), width=max(3, int(6 * s)))
    if hl_druck > 0.01:
        d.ellipse((cxp - (mr + 8) * s, cyp - (mr + 8) * s, cxp + (mr + 8) * s, cyp + (mr + 8) * s), outline=mix(WHITE, RED, hl_druck), width=max(3, int(6 * s)))
    if warn:
        wx, wy = P(170, 232)
        d.polygon([(wx, wy - 46 * s), (wx + 44 * s, wy + 30 * s), (wx - 44 * s, wy + 30 * s)], fill=AMB, outline=DARK, width=max(2, lw - 1))
        T2(d, wx, wy + 6 * s, "!", F(int(40 * s), 700), WHITE, "mm")


def zettel(d, x, y, w, h, kopf_txt, txt, size=36):
    """Notizzettel eines Technikers: kleine Ueberschrift, darunter die Formel."""
    d.rounded_rectangle((x, y, x + w, y + h), 12, fill=LIGHTA, outline=AMB, width=3)
    TB(d, x + 24, y + 26, kopf_txt, F(24, 600), GREY, w - 48, "lm", "Zettel")
    formel(d, x + 24, y + h * 0.62, txt, F(size, 700), w - 48)


def abzeichen(d, x, y, r, txt, col=RED):
    d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=WHITE, width=3); T2(d, x, y, txt, F(int(r * 1.1), 700), WHITE, "mm")


# ---------------------------------------------------------------- 1 Presse, zwei Zettel, die Frage
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zwei Sperren für eine Presse")
    px, py = 60, 130
    hl_t = ap(t, a(1, 0.1), 0.3) * (1 - ap(t, a(1, 0.55), 0.3)); hl_d = ap(t, a(1, 0.55), 0.3) * (1 - ap(t, a(2, 0.0), 0.3))
    f.el(show(t, 0.3), lambda d, dy: presse(d, px, py + dy, 1.0, True, True, hl_tuer=hl_t, hl_druck=hl_d))
    E(f, t, a(1, 0.15), lambda d, dy: abzeichen(d, px + 70, py + 330 + dy, 24, "C"))
    E(f, t, a(1, 0.6), lambda d, dy: abzeichen(d, px + 300, py + 40 + dy, 24, "D", BLUE))
    x, w = 460, 760
    E(f, t, a(1, 0.15), lambda d, dy: aussage_karte(d, x, 130 + dy, w, 86, "C", "„Die Schutztür ist geschlossen“", RED, size=34))
    E(f, t, a(1, 0.6), lambda d, dy: aussage_karte(d, x, 232 + dy, w, 86, "D", "„Der Druck liegt im Bereich“", BLUE, size=34))
    E(f, t, a(2, 0.1), lambda d, dy: zettel(d, x, 344 + dy, w, 96, "Techniker 1", "S1 = NICHT (C UND D)"))
    E(f, t, a(3, 0.1), lambda d, dy: zettel(d, x, 456 + dy, w, 96, "Techniker 2", "S2 = (NICHT C) ODER (NICHT D)"))
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, x + 200, 580 + dy, 360, 80, "Dasselbe?", RED, WHITE, 44))


# ---------------------------------------------------------------- 2 Die beiden Spalten entstehen
SP2 = ["C", "D", "C UND D", "S1", "NICHT C", "NICHT D", "S2"]
BR2 = [100, 100, 200, 110, 190, 190, 110]
TAB2 = [[b(c), b(d), b(CUD[i]), b(S1[i]), b(NC[i]), b(ND[i]), b(S2[i])] for i, (c, d) in enumerate(KOMBI)]


def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Zwei Tabellen, eine Spalte")
    x, y, rh = 140, 134, 72
    z0 = zeilenweise(a(0, 0.5), 0.3, 4)
    tsp = [a(0, 0.15), a(0, 0.15), a(1, 0.1), a(2, 0.1), a(3, 0.1), a(3, 0.1), a(3, 0.62)]
    tz = [z0, z0, zeilenweise(a(1, 0.5), 0.3, 4), zeilenweise(a(2, 0.45), 0.3, 4),
          zeilenweise(a(3, 0.3), 0.2, 4), zeilenweise(a(3, 0.3), 0.2, 4), zeilenweise(a(4, 0.1), 0.3, 4)]
    wahrheitstabelle(f, t, x, y, SP2, TAB2, tsp, tz, breiten=BR2, rh=rh, size=42, kopf_size=30, trenner=2)
    t_rahm = a(4, 0.55)
    E(f, t, t_rahm, lambda d, dy: spalten_rahmen(d, x, y + dy, BR2, 3, 3, 4, rh, GREEN))
    E(f, t, t_rahm, lambda d, dy: spalten_rahmen(d, x, y + dy, BR2, 6, 6, 4, rh, GREEN))
    E(f, t, a(2, 0.1), lambda d, dy: tag(d, 80, 542 + dy, 560, 70, "S1 = NICHT (C UND D): Spalte umgedreht", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, 660, 542 + dy, 560, 70, "S2 = (NICHT C) ODER (NICHT D)", LIGHTB, BLUE, 28, 700, outl=BLUE))
    E(f, t, a(4, 0.55), lambda d, dy: tag(d, 80, 626 + dy, 1140, 56, "Beide Spalten: 1 1 1 0", LIGHTG, GREEN, 30, 700, outl=GREEN))


# ---------------------------------------------------------------- 3 Gleichwertig, und ein dritter Vorschlag
SP3 = ["C", "D", "S1", "S2", "S3"]; BR3 = [90, 90, 110, 110, 110]
TAB3 = [[b(c), b(d), b(S1[i]), b(S2[i]), b(S3[i])] for i, (c, d) in enumerate(KOMBI)]


def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Gleichwertig: gleiche Spalte")
    x, y, rh = 60, 134, 64
    t_s3 = a(2, 0.3)
    hl_a = show(t, a(2, 0.75))
    tsp = [0.3, 0.3, 0.3, 0.3, t_s3]
    tz = [0.3, 0.3, 0.3, 0.3, zeilenweise(a(2, 0.5), 0.3, 4)]
    wahrheitstabelle(f, t, x, y, SP3, TAB3, tsp, tz, hl={1, 2} if hl_a > 0 else None, hl_a=hl_a, breiten=BR3, rh=rh, size=38,
                     kopf_size=32, trenner=2)
    E(f, t, a(0, 0.3), lambda d, dy: spalten_rahmen(d, x, y + dy, BR3, 2, 3, 4, rh, GREEN), tout=a(2, 0.0))
    tw = sum(BR3)
    def gleich(d, dy):
        tag(d, x, 488 + dy, tw, 64, "S1 und S2: in jeder Zeile gleich", LIGHTG, GREEN, 28, 700, outl=GREEN)
    E(f, t, a(0, 0.5), gleich, tout=a(2, 0.0))
    E(f, t, a(1, 0.1), lambda d, dy: check_circle(d, x + tw + 26, 520 + dy, 20), tout=a(2, 0.0))
    E(f, t, a(3, 0.05), lambda d, dy: tag(d, x, 488 + dy, tw, 64, "S1 und S3: nicht gleichwertig", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(4, 0.05), lambda d, dy: tag(d, x, 572 + dy, tw, 64, "Dieser Fehler ist gefährlich", AMB, WHITE, 30, 700))
    rx, rw = 680, 540
    def defi(d, dy):
        card(d, rx, 134 + dy, rw, 214, stripe=True)
        TB(d, rx + 34, 172 + dy, "Gleichwertig", F(36, 700), DARK, rw - 60, "lm", "Karte")
        absatz(d, rx + 34, 214 + dy, "Zwei Ausdrücke sind gleichwertig, wenn ihre Ergebnisspalten in jeder Zeile übereinstimmen.",
               F(28, 600), GREY, rw - 60, 38, 3)
    E(f, t, a(1, 0.0), defi)
    E(f, t, a(2, 0.2), lambda d, dy: tag(d, rx, 362 + dy, rw, 60, "S3 = (NICHT C) UND (NICHT D)", LIGHTB, BLUE, 28, 700, outl=BLUE))
    E(f, t, a(3, 0.15), lambda d, dy: presse(d, rx, 440 + dy, 0.5, False, True, warn=a(3, 0.8) < t))
    E(f, t, a(3, 0.3), lambda d, dy: tag(d, rx + 200, 456 + dy, 340, 52, "C = 0: Tür offen", LIGHTK, DARK, 26, 700, outl=GREY))
    E(f, t, a(3, 0.55), lambda d, dy: tag(d, rx + 200, 518 + dy, 340, 52, "D = 1: Druck gut", LIGHTK, DARK, 26, 700, outl=GREY))
    E(f, t, a(3, 0.8), lambda d, dy: tag(d, rx + 200, 580 + dy, 340, 52, "S3 = 0: Presse frei", LIGHTR, RED, 26, 700, outl=RED))


# ---------------------------------------------------------------- 4 Taster und De Morgan
SP4 = ["A", "B", "NICHT (A ODER B)", "(NICHT A) UND (NICHT B)"]; BR4 = [80, 80, 320, 380]
TAB4 = [[b(p), b(q), b(NOR[i]), b(NA_NB[i])] for i, (p, q) in enumerate(KOMBI)]


def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "De Morgan: das NICHT auflösen")
    x, y, rh = 60, 128, 56
    tsp = [a(0, 0.2), a(0, 0.2), a(1, 0.1), a(2, 0.1)]
    tz = [a(0, 0.2), a(0, 0.2), zeilenweise(a(1, 0.45), 0.3, 4), zeilenweise(a(2, 0.45), 0.3, 4)]
    wahrheitstabelle(f, t, x, y, SP4, TAB4, tsp, tz, breiten=BR4, rh=rh, size=36, kopf_size=28, trenner=2)
    E(f, t, a(0, 0.4), lambda d, dy: aussage_karte(d, 950, 128 + dy, 270, 72, "A", "„A gedrückt“", BLUE, size=24))
    E(f, t, a(0, 0.65), lambda d, dy: aussage_karte(d, 950, 214 + dy, 270, 72, "B", "„B gedrückt“", AMB, size=24))
    E(f, t, a(2, 0.65), lambda d, dy: tag(d, 1032, 322 + dy, 188, 66, "gleich", LIGHTG, GREEN, 30, 700, outl=GREEN))
    E(f, t, a(2, 0.65), lambda d, dy: check_circle(d, 1000, 355 + dy, 20))
    # Merkkasten
    cx0, cy0, cw, ch = 60, 420, 1160, 262
    def kasten(d, dy):
        card(d, cx0, cy0 + dy, cw, ch, stripe=True)
        TB(d, cx0 + 36, cy0 + 36 + dy, "Regel von De Morgan", F(36, 700), DARK, 600, "lm", "Karte")
    E(f, t, a(3, 0.3), kasten)
    f2 = F(32, 700)
    def zeile(d, dy, j, links, rechts):
        yy = cy0 + 100 + 56 * j + dy
        formel(d, cx0 + 520, yy, links, f2, 470, "rm")
        pfeil(d, cx0 + 560, yy - 7, cx0 + 640, yy - 7, DARK, 4, 13); pfeil(d, cx0 + 640, yy + 9, cx0 + 560, yy + 9, DARK, 4, 13)
        formel(d, cx0 + 680, yy, rechts, f2, 470, "lm")
    E(f, t, a(3, 0.45), lambda d, dy: zeile(d, dy, 0, "NICHT (A ODER B)", "(NICHT A) UND (NICHT B)"))
    E(f, t, a(3, 0.7), lambda d, dy: zeile(d, dy, 1, "NICHT (A UND B)", "(NICHT A) ODER (NICHT B)"))
    E(f, t, a(4, 0.05), lambda d, dy: tag(d, cx0 + 36, cy0 + 198 + dy, cw - 72, 46,
                                           "Jedes NICHT einzeln, aus UND wird ODER, aus ODER wird UND", RED, WHITE, 28, 700))


# ---------------------------------------------------------------- 5 Klammern
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Ein Hinweis zu Klammern")
    lx = 60
    # rechts: Rangfolge, wie Punkt vor Strich
    rx, rw = 720, 500
    def rang(d, dy):
        card(d, rx, 130 + dy, rw, 340, stripe=True)
        TB(d, rx + 34, 168 + dy, "Ohne Klammern gilt", F(34, 700), DARK, rw - 60, "lm", "Karte")
    E(f, t, a(0, 0.1), rang)
    for k, (nr, wort, rest, col) in enumerate([("1", "NICHT", "zuerst", BLUE), ("2", "UND", "wie Mal (Punkt)", RED), ("3", "ODER", "wie Plus (Strich)", AMB)]):
        yy = 206 + 66 * k
        E(f, t, a(0, 0.3 + 0.2 * k), lambda d, dy, yy=yy, nr=nr, wort=wort, rest=rest, col=col: (
            num_circle(d, rx + 56, yy + 26 + dy, 22, nr, col),
            T2(d, rx + 96, yy + 26 + dy, wort, F(34, 700), col, "lm"),
            TB(d, rx + 210, yy + 26 + dy, rest, F(26, 600), GREY, rw - 230, "lm", "Rangfolge")))
    E(f, t, a(0, 0.85), lambda d, dy: TB(d, rx + rw / 2, 424 + dy, "A + B · C  =  A + (B · C)", F(32, 700), DARK, rw - 40, "mm", "Rechnung"))
    # links: der Ausdruck und die Umrandung
    fz = F(54, 700); y1 = 190
    txt = "A ODER B UND C"
    pre = "A ODER "; mitte = "B UND C"
    w_all = fz.getlength(txt); x0 = lx + 20
    xa = x0 + fz.getlength(pre); xb = xa + fz.getlength(mitte)
    assert x0 + w_all <= rx - 30
    E(f, t, a(1, 0.1), lambda d, dy: (TB(d, lx + 20, 140 + dy, "Du liest:", F(26, 600), GREY, 300, "lm", "Hinweis"),
                                       formel(d, x0, y1 + dy, txt, fz, 600)))
    E(f, t, a(1, 0.55), lambda d, dy: d.rounded_rectangle((xa - 3, y1 - 40 + dy, xb + 10, y1 + 40 + dy), 14, outline=RED, width=5))
    E(f, t, a(1, 0.55), lambda d, dy: (TB(d, lx + 20, 300 + dy, "Das heißt:", F(26, 600), GREY, 300, "lm", "Hinweis"),
                                        formel(d, x0, 350 + dy, "A ODER (B UND C)", fz, 640)))
    E(f, t, a(2, 0.1), lambda d, dy: tag(d, lx, 520 + dy, 1160, 70, "Eigene Ausdrücke bekommen immer Klammern", RED, WHITE, 38))
    E(f, t, a(3, 0.15), lambda d, dy: tag(d, lx, 606 + dy, 1160, 70, "Im Zweifel: die Tabelle bauen", LIGHTB, BLUE, 38, 700, outl=BLUE))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Gleichwertig", F(96, 700), DARK)
        T2(d, 90, 300, "zwei Tabellen, eine Spalte", F(40, 400), GREY)
        tag(d, 90, 560, 620, 70, "Gleiche Spalte heißt gleichwertig", RED, WHITE, 32)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    wahrheitstabelle(f, 1, 700, 170, SP3, TAB3, [0] * 5, breiten=[90, 90, 110, 110, 110], rh=64, size=38, kopf_size=30, trenner=2)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
