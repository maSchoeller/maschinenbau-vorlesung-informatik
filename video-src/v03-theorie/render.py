"""Termin 03, Video 1: Und, oder: die Wahrheitstabelle (Automat mit leerem Fach, Aussagen A und B, Tabelle fuer UND,
Museum mit ODER, beide Spalten im Vergleich, Ausblick auf die Raute).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys
from itertools import product
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v03-theorie"; LABEL = "DHBW · Informatik · Termin 03 · Und, oder: die Wahrheitstabelle"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
KOMBI = list(product((0, 1), repeat=2))                       # Reihenfolge 00, 01, 10, 11
assert KOMBI == [(0, 0), (0, 1), (1, 0), (1, 1)]
UND = [[str(a), str(b), str(int(bool(a) and bool(b)))] for a, b in KOMBI]
ODER = [[str(a), str(b), str(int(bool(a) or bool(b)))] for a, b in KOMBI]
BEIDE = [[str(a), str(b), str(int(bool(a) and bool(b))), str(int(bool(a) or bool(b)))] for a, b in KOMBI]
assert [z[2] for z in UND] == ["0", "0", "0", "1"] and [z[2] for z in ODER] == ["0", "1", "1", "1"]
assert sum(z[2] == "1" for z in UND) == 1 and sum(z[2] == "1" for z in ODER) == 3     # 1 von 4, 3 von 4
assert [z[:2] for z in ODER].index(["0", "0"]) == 0 and ODER[0][2] == "0"                # die einzige 0 steht in Zeile 1
# Automat: Cola kostet 1,50 Euro; mit 2 Euro reicht das Geld, aber ohne Flasche kommt trotzdem keine Cola
GELD, PREIS = 2.0, 1.5
assert (GELD >= PREIS) is True and ((GELD >= PREIS) and (0 > 0)) is False
# Museum: Tom ist 16 und hat einen Ausweis -> frei (Zeile 1 1)
assert ((16 < 18) or True) is True and ((20 < 18) or False) is False

SP_UND = ["A", "B", "A UND B"]; BR_UND = [130, 130, 230]
SP_ODER = ["A", "B", "A ODER B"]; BR_ODER = [120, 120, 240]
SP_BEIDE = ["A", "B", "A UND B", "A ODER B"]; BR_BEIDE = [120, 120, 220, 240]


# ---------------------------------------------------------------- eigene Hilfen (nur in diesem Video)
def bunt(d, x, y, teile, font, maxw, anchor="lm"):
    """Eine Textzeile aus farbigen Teilen [(text, farbe)], links (anchor "lm") oder mittig ("mm") an x, Mitte bei y."""
    w = sum(font.getlength(s) for s, _ in teile); fit("".join(s for s, _ in teile), font, maxw, "Zeile")
    cx = x - w / 2 if anchor == "mm" else x
    for s, col in teile:
        T2(d, cx, y, s, font, col, "lm"); cx += font.getlength(s)


def mini_tabelle(d, x, y, breiten, kopf, zeilen, rh=60, size=34):
    """Kleine feste Wahrheitstabelle (Erinnerung an Termin 02), mit wahr gruen und falsch rot."""
    imbild(y, y + rh * (len(zeilen) + 1), "Erinnerungstabelle")
    xx = x
    for w, k in zip(breiten, kopf):
        d.rectangle((xx, y, xx + w, y + rh), fill=DARK, outline=DARK)
        TB(d, xx + w / 2, y + rh / 2, k, F(30, 700), WHITE, w - 16, "mm", "Tabellenkopf"); xx += w
    for i, z in enumerate(zeilen):
        xx = x; yy = y + rh * (i + 1)
        for w, v in zip(breiten, z):
            d.rectangle((xx, yy, xx + w, yy + rh), fill=WHITE, outline=LINE, width=2)
            TB(d, xx + w / 2, yy + rh / 2, v, F(size, 700), WERTFARBE[v], w - 16, "mm", "Tabellenwert"); xx += w


def spalten_rahmen(d, x, y, breiten, j, n, rh, col=RED):
    """Roter Rahmen um die ganze Spalte j einer Wahrheitstabelle (Kopf und n Zeilen)."""
    x0 = x + sum(breiten[:j]); x1 = x0 + breiten[j]
    d.rectangle((x0 - 3, y - 3, x1 + 3, y + rh * (n + 1) + 3), outline=col, width=6)


def museum(d, x, y, s=1.0):
    """Museum mit Kasse: Giebel, Saeulen, Stufen, in der Mitte die Tuer mit dem Schild Kasse. Etwa 360 x 330 bei s=1."""
    W_, H_ = 360 * s, 330 * s; imbild(y, y + H_, "Museum")
    lw = max(3, int(5 * s))
    d.polygon([(x, y + 90 * s), (x + W_ / 2, y), (x + W_, y + 90 * s)], fill=WHITE, outline=DARK, width=lw)
    TB(d, x + W_ / 2, y + 60 * s, "MUSEUM", F(int(28 * s), 700), DARK, W_ * 0.5, "mm", "Museum")
    d.rectangle((x + 10 * s, y + 90 * s, x + W_ - 10 * s, y + 112 * s), fill=LIGHTK, outline=DARK, width=lw)
    for k in range(4):                                         # Saeulen links und rechts der Tuer
        cx = x + [44, 104, 256, 316][k] * s
        d.rectangle((cx - 15 * s, y + 112 * s, cx + 15 * s, y + 280 * s), fill=WHITE, outline=DARK, width=max(2, int(3 * s)))
    # Tuer mit Kasse
    d.rounded_rectangle((x + 140 * s, y + 160 * s, x + 220 * s, y + 280 * s), int(8 * s), fill=LIGHTA, outline=AMB, width=3)
    d.rounded_rectangle((x + 134 * s, y + 124 * s, x + 226 * s, y + 154 * s), int(6 * s), fill=AMB)
    TB(d, x + 180 * s, y + 139 * s, "Kasse", F(int(22 * s), 700), WHITE, 86 * s, "mm", "Kasse")
    d.rectangle((x, y + 280 * s, x + W_, y + 302 * s), fill=LIGHTK, outline=DARK, width=lw)
    d.rectangle((x - 14 * s, y + 302 * s, x + W_ + 14 * s, y + 324 * s), fill=LIGHTK, outline=DARK, width=lw)


# ---------------------------------------------------------------- 1 Automat mit leerem Fach, zwei Aussagen
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Wann kommt die Cola?")
    t_leer = a(1, 0.3)
    E(f, t, 0.3, lambda d, dy: automat(d, 80, 140 + dy, 1.0, "1,50 €", flaschen=6, ausgabe=True), tout=t_leer)
    E(f, t, t_leer, lambda d, dy: automat(d, 80, 140 + dy, 1.0, "1,50 €", flaschen=0))
    x, y, w = 460, 140, 760
    fz = F(36, 700)
    def satz1(d, dy):
        card(d, x, y + dy, w, 176)
        bunt(d, x + 40, y + 56 + dy, [("Die Cola kommt, wenn das Geld reicht", DARK)], fz, w - 70)
    E(f, t, a(0, 0.35), satz1)
    E(f, t, a(2, 0.3), lambda d, dy: bunt(d, x + 40, y + 122 + dy, [("UND", RED), (" noch eine Flasche im Fach ist.", DARK)], fz, w - 70))
    E(f, t, a(1, 0.35), lambda d, dy: tag(d, x, 344 + dy, w, 68, "Fach leer: Das Geld allein hilft nicht", LIGHTR, RED, 32, 700, outl=RED),
      tout=a(3, 0.0))
    E(f, t, a(3, 0.42), lambda d, dy: aussage_karte(d, x, 360 + dy, w, 100, "A", "„Das Geld reicht“", BLUE, size=38))
    E(f, t, a(3, 0.72), lambda d, dy: aussage_karte(d, x, 480 + dy, w, 100, "B", "„Eine Flasche ist da“", AMB, size=38))


# ---------------------------------------------------------------- 2 Wahrheitstabelle fuer UND
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Die Wahrheitstabelle für UND")
    # Erinnerung an Termin 02, verschwindet, wenn die neue Tabelle kommt
    def erinnerung(d, dy):
        TB(d, 640, 170 + dy, "Aus Termin 02: jeder Fall eine Zeile", F(32, 700), GREY, 900, "mm")
        mini_tabelle(d, 640 - 230, 220 + dy, [230, 230], ["A", "NICHT A"], [["wahr", "falsch"], ["falsch", "wahr"]], 68, 36)
    E(f, t, 0.4, erinnerung, tout=a(1, 0.0))
    x, y, rh = 80, 136, 72
    t_ab = zeilenweise(a(3, 0.25), 1.1, 4)        # 00, 01, 10, 11 beim Sprechen
    t_und = zeilenweise(a(4, 0.72), 0.3, 4)
    hl_a = show(t, a(5, 0.1))
    wahrheitstabelle(f, t, x, y, SP_UND, UND, [a(1, 0.25), a(1, 0.25), a(4, 0.38)], [t_ab, t_ab, t_und],
                     hl={3}, hl_a=hl_a, breiten=BR_UND, rh=rh, size=42, kopf_size=34, trenner=2)
    rx, rw = 620, 600
    # rechts: Hinweise; die beiden zum Aufbau der Tabelle gehen, wenn die UND-Spalte kommt (ruhigeres Bild)
    E(f, t, a(1, 0.45), lambda d, dy: tag(d, rx, 140 + dy, rw, 66, "zwei Aussagen: vier Zeilen", LIGHTK, DARK, 32, 700, outl=GREY),
      tout=a(4, 0.0))
    E(f, t, a(2, 0.15), lambda d, dy: chip(d, rx, 232 + dy, 290, 66, "1 = wahr", LIGHTG, GREEN, 34, outl=GREEN))
    E(f, t, a(2, 0.5), lambda d, dy: chip(d, rx + 310, 232 + dy, 290, 66, "0 = falsch", LIGHTR, RED, 34, outl=RED))
    E(f, t, a(3, 0.75), lambda d, dy: tag(d, rx, 324 + dy, rw, 66, "immer: 00, 01, 10, 11", LIGHTB, BLUE, 32, 700, outl=BLUE),
      tout=a(4, 0.0))
    E(f, t, a(4, 0.75), lambda d, dy: tag(d, rx, 140 + dy, rw, 66, "UND: beide müssen stimmen", LIGHTR, RED, 32, 700, outl=RED))
    E(f, t, a(5, 0.45), lambda d, dy: tag(d, x, 548 + dy, 1140, 76, "1 1: Das Geld reicht, und eine Flasche ist da", LIGHTG, GREEN, 34, 700, outl=GREEN))


# ---------------------------------------------------------------- 3 Museum: ODER
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "ODER: Eintritt ins Museum")
    def schild(d, dy):
        d.rounded_rectangle((80, 124 + dy, 1220, 196 + dy), 14, fill=DARK)
        bunt(d, 650, 160 + dy, [("Eintritt frei: unter 18 ", WHITE), ("ODER", (255, 110, 120)), (" mit Studierendenausweis", WHITE)],
             F(36, 700), 1100, "mm")
    E(f, t, a(0, 0.15), schild)
    t_tab = a(2, 0.05)
    E(f, t, a(0, 0.3), lambda d, dy: museum(d, 120, 250 + dy, 1.0), tout=t_tab)
    rx, rw = 600, 620
    E(f, t, a(1, 0.05), lambda d, dy: aussage_karte(d, rx, 232 + dy, rw, 96, "A", "„unter 18“", BLUE, size=36))
    E(f, t, a(1, 0.5), lambda d, dy: aussage_karte(d, rx, 346 + dy, rw, 96, "B", "„Studierendenausweis“", AMB, size=36))
    x, y, rh = 80, 232, 64
    t_oder = [a(2, 0.3), a(2, 0.36), a(2, 0.42), a(2, 0.86)]          # genuegt eine ...; und wenn beide stimmen? auch frei
    t_hl1, t_hl0 = a(4, 0.2), a(5, 0.3)
    if t < t_hl0: hl, hl_a = {3}, show(t, t_hl1)
    else: hl, hl_a = {0}, show(t, t_hl0)
    wahrheitstabelle(f, t, x, y, SP_ODER, ODER, [t_tab + 0.2, t_tab + 0.2, a(2, 0.15)], [t_tab + 0.4, t_tab + 0.4, t_oder],
                     hl=hl, hl_a=hl_a, breiten=BR_ODER, rh=rh, size=38, kopf_size=32, trenner=2)
    def kaffee(d, dy):
        card(d, rx, 466 + dy, rw, 76, stripe=False, fill=LIGHTK)
        bunt(d, rx + rw / 2, 504 + dy, [("„Kaffee oder Tee?“", DARK), ("  = entweder oder", GREY)], F(30, 700), rw - 40, "mm")
    # Kaffee und Logik gehen, wenn Satz 6 die Spalte zusammenfasst; dann rechts die einzige 0 erklaert
    E(f, t, a(3, 0.4), kaffee, tout=a(5, 0.0))
    E(f, t, a(4, 0.25), lambda d, dy: tag(d, rx, 562 + dy, rw, 70, "Logik: auch wahr, wenn beides stimmt", LIGHTR, RED, 30, 700, outl=RED),
      tout=a(5, 0.0))
    E(f, t, a(5, 0.1), lambda d, dy: tag(d, x, 576 + dy, sum(BR_ODER), 70, "ODER-Spalte: drei Einsen", LIGHTG, GREEN, 30, 700, outl=GREEN))
    E(f, t, t_hl0 + 0.1, lambda d, dy: tag(d, rx, 466 + dy, rw, 76, "0 0: nicht unter 18, kein Ausweis", LIGHTR, RED, 32, 700, outl=RED))


# ---------------------------------------------------------------- 4 Beide Spalten nebeneinander
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "UND und ODER nebeneinander")
    x, y, rh = 80, 136, 72
    t0 = a(0, 0.15); t1 = a(0, 0.45)
    wahrheitstabelle(f, t, x, y, SP_BEIDE, BEIDE, [t0, t0, t1, t1 + 0.25], breiten=BR_BEIDE, rh=rh, size=42, kopf_size=32, trenner=2)
    ra = [(2, a(1, 0.0), a(2, 0.0)), (3, a(2, 0.0), a(3, 0.0))]
    for j, tin, tout in ra:
        E(f, t, tin, lambda d, dy, j=j: spalten_rahmen(d, x, y + dy, BR_BEIDE, j, 4, rh), tout=tout)
    rx, rw = 800, 420
    def streng(d, dy):
        card(d, rx, 150 + dy, rw, 150, stripe=False)
        TB(d, rx + 30, 196 + dy, "UND ist streng", F(36, 700), DARK, rw - 60, "lm")
        TB(d, rx + 30, 252 + dy, "1 von 4 Zeilen wahr", F(30, 600), RED, rw - 60, "lm")
    def gross(d, dy):
        card(d, rx, 326 + dy, rw, 150, stripe=False)
        TB(d, rx + 30, 372 + dy, "ODER ist großzügig", F(36, 700), DARK, rw - 60, "lm")
        TB(d, rx + 30, 428 + dy, "3 von 4 Zeilen wahr", F(30, 600), GREEN, rw - 60, "lm")
    E(f, t, a(1, 0.3), streng)
    E(f, t, a(2, 0.3), gross)
    E(f, t, a(3, 0.15), lambda d, dy: tag(d, 80, 548 + dy, 1140, 84, "In der Klausur: beide Spalten aus dem Kopf", RED, WHITE, 40))


# ---------------------------------------------------------------- 5 Merksatz und Ausblick: UND und ODER in der Raute
RAUTE_TXT = ("groesse >= 140 and alter >= 10?", "groesse >= 140 or alter >= 10?")
RAUTE_FS = 30                                                # Schrift in der Raute (px)
RAUTE_W, RAUTE_H = 780, 150                                  # Rautengroesse
RAUTE_MX = 640                                               # gemeinsame Mittellinie
RAUTE_CY = [322, 506]                                        # Rautenmitten untereinander
STUMMEL = 56                                                 # Abgang ja/nein: waagerecht, dann kurz nach unten


def raute_form(d, cx, cy, lw=3):
    """Raute wie die Plan-Symbole (Fuellung hellrot, Rand rot), mit kurzen Abgaengen ja (links) und nein (rechts)."""
    imbild(cy - RAUTE_H / 2, cy + RAUTE_H / 2, "Raute")
    pts = [(cx - RAUTE_W / 2, cy), (cx, cy - RAUTE_H / 2), (cx + RAUTE_W / 2, cy), (cx, cy + RAUTE_H / 2)]
    d.polygon(pts, fill=LIGHTR); d.line(pts + [pts[0]], fill=RED, width=lw, joint="curve")
    fl = F(26, 700)
    for seite, txt in ((-1, "ja"), (1, "nein")):
        x0 = cx + seite * RAUTE_W / 2; x1 = x0 + seite * STUMMEL
        d.line((x0, cy, x1, cy), fill=DARK, width=3)
        pfeil(d, x1, cy, x1, cy + 40, DARK, 3, 13)
        T2(d, (x0 + x1) / 2, cy - 18, txt, fl, LABC_B02, "mm")


def raute_text(d, cx, cy, txt):
    font = F(RAUTE_FS, 700)
    fit(txt, font, RAUTE_W * 0.70, "Rautentext")
    T2(d, cx, cy, txt, font, DARK, "mm")


def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Zusammengefasst")
    t_r = a(2, 0.0)
    E(f, t, a(0, 0.05), lambda d, dy: tag(d, 80, 128 + dy, 1140, 90, "Aus zwei Aussagen wird eine neue", RED, WHITE, 46))
    # die mittlere Karte macht den Platz fuer die beiden Rauten frei
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, 80, 236 + dy, 1140, 66, "Wahrheitstabelle: für jede der vier Kombinationen 1 oder 0",
                                         LIGHTK, DARK, 30, 700, outl=GREY), tout=t_r)
    ankunft = [a(2, 0.25), a(2, 0.72)]                       # "... steht das Und in der Raute", "... genauso das Oder"
    wort = ["UND", "ODER"]
    for k in range(2):
        cy = RAUTE_CY[k]; t_an = ankunft[k] + 0.7            # Chip erreicht die Rautenmitte
        lw = 5 if t < a(3, 0.3) else 3
        E(f, t, t_r + 0.25 * k, lambda d, dy, cy=cy, lw=lw: raute_form(d, RAUTE_MX, cy + dy, lw))
        al = show(t, t_r + 0.25 * k)
        if t < t_an:                                         # leere Raute: Fragezeichen, bis das Wort ankommt
            f.el(al, lambda d, dy, cy=cy: T2(d, RAUTE_MX, cy, "?", F(RAUTE_FS + 8, 700), RED, "mm"))
        else:                                                # danach (ohne Ueberlappung mit dem Chip) der Rautentext
            f.el(ap(t, t_an + 0.15, 0.3), lambda d, dy, cy=cy, k=k: raute_text(d, RAUTE_MX, cy, RAUTE_TXT[k]))
        # das Wort wandert von links unten in die Rautenmitte und blendet dort aus
        if t >= ankunft[k] - 0.3 and t < t_an + 0.15:
            px, py = bahn(t, ankunft[k], 0.7, (200, cy + 82), (RAUTE_MX, cy))
            aw = show(t, ankunft[k] - 0.3) * (1 - ap(t, t_an, 0.15))
            f.el(aw, lambda d, dy, px=px, py=py, w_=wort[k]: chip(d, px - 70, py - 30, 140, 60, w_, LIGHTR, RED, 34, outl=RED))
    E(f, t, a(3, 0.1), lambda d, dy: tag(d, 80, 610 + dy, 1140, 66, "Ein Programm entscheidet nach zwei Dingen zugleich",
                                         LIGHTB, BLUE, 32, 700, outl=BLUE))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 03 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Und, oder", F(96, 700), DARK)
        T2(d, 90, 300, "die Wahrheitstabelle", F(40, 400), GREY)
        tag(d, 90, 560, 540, 70, "UND ist streng, ODER großzügig", RED, WHITE, 32)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    wahrheitstabelle(f, 100, 660, 170, SP_BEIDE, BEIDE, [0, 0, 0, 0], breiten=[100, 100, 170, 190], rh=64, size=38, kopf_size=28, trenner=2)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
