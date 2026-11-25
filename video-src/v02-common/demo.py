"""Standbilder aller neuen Bausteine aus b02.py (nach v02-common/out/). Aufruf: python demo.py
Jedes Bild ist ein Szenenbild mit Kopfzeile und Fusszeile wie in den Videos; Beispiele und Zahlen aus den SZENEN von Termin 02/03."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from b02 import *

OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
LABEL = "DHBW · Informatik · Termin 02 · Bausteine"

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
EINLASS = ["# Einlass ab 16", 'alter = int(input("Alter: "))', "if alter >= 16:", '    print("Einlass")', "else:",
           '    print("Kein Einlass")', 'print("Der Nächste bitte")']
assert run(NL.join(EINLASS), ["16"]) == ["Alter: 16", "Einlass", "Der Nächste bitte"]
assert run(NL.join(EINLASS), ["15"])[1:] == ["Kein Einlass", "Der Nächste bitte"]
AMPEL = ["sekunde = 32", "if sekunde < 30:", '    print("Grün")', "elif sekunde < 35:", '    print("Gelb")', "else:", '    print("Rot")']
assert run(NL.join(AMPEL)) == ["Gelb"]
UND = [["0", "0", "0"], ["0", "1", "0"], ["1", "0", "0"], ["1", "1", "1"]]
ODER = [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "1"]]
for A, B, u in UND: assert int(u) == (int(A) and int(B))
for A, B, o in ODER: assert int(o) == (int(A) or int(B))
_g = {}; exec("geld = 2.0" + NL + "rueckgeld = geld - 1.5", _g); assert f"{_g['rueckgeld']:.2f}" == "0.50"

P_EINLASS = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: alter"),
                        ("d", "dec", "alter >= 16?", [("j", "io", 'Ausgabe: "Einlass"')], [("n", "io", 'Ausgabe: "Kein Einlass"')]),
                        ("o", "io", 'Ausgabe: "Der Nächste bitte"'), ("end", "term", "Ende")])
P_DREI = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: geld"),
                     ("d1", "dec", "geld < 1.5?", [("o1", "io", 'Ausgabe: "Zu wenig Geld"')],
                      [("d2", "dec", "geld > 1.5?", [("r", "proc", "rueckgeld = geld - 1.5"), ("o2", "io", "Ausgabe: rueckgeld")],
                        [("o3", "io", 'Ausgabe: "Passt genau"')])]),
                     ("end", "term", "Ende")])
P_RAUTE = plan_zweig([("d", "dec", "geld >= 1.5?", [], [])])
W16 = weg(P_EINLASS, {"d": "ja"})
assert W16 == ["s", "s-e", "e", "e-d", "d", "d-ja", "j", "d-ja-z", "d-o", "o", "o-end", "end"], W16
W2 = weg(P_DREI, {"d1": "nein", "d2": "ja"})
assert W2 == ["s", "s-e", "e", "e-d1", "d1", "d1-nein", "d2", "d2-ja", "r", "r-o2", "o2", "d2-ja-z", "d1-nein-z", "d1-end", "end"], W2
assert (2 < 1.5) is False and (2 > 1.5) is True


def bild(name, titel, fn, t=30.0):
    f = Frame(); kopf(f, t, titel); fn(f, t); chrome(f, 60, 100, LABEL)
    p = os.path.join(OUT, name + ".png"); f.img.save(p); print("geschrieben", p)


# ---------------------------------------------------------------- 1 Plan mit Raute: Weg leuchtet, anderer Weg grau, daneben der Lauf
def d1(f, t):
    plan_draw(f, 1.0, P_EINLASS, (40, 104, 520, 560), vis=weg_vis(W16), hl=weg_hl(W16), maxzoom=1.4)
    E(f, t, 0, lambda d, dy: code_lauf(d, 580, 116 + dy, 640, EINLASS, t, 22, 38, aktiv={2}, grau={4, 5}))
    g = CodeGeo(580, 116, 640, 22, 38, 7)
    E(f, t, 0, lambda d, dy: vergleich(d, 580, 470 + dy, "16", ">=", "16", 44))
    bw, bh = vergleich_mass("16", ">=", "16", 44)
    E(f, t, 0, lambda d, dy: wert_chip(d, 580 + bw + 24, 470 + (bh - 58) / 2 + dy, "True", 58))
    E(f, t, 0, lambda d, dy: tag(d, 580, 590 + dy, 640, 60, "Zeilen 5 und 6 werden übersprungen", LIGHTK, DARK, 28, 700, outl=GREY))


# ---------------------------------------------------------------- 2 Drei Wege: zwei Rauten hintereinander im nein-Weg
def d2(f, t):
    plan_draw(f, 1.0, P_DREI, (60, 104, 1160, 484), vis=weg_vis(W2, 0.3), hl=weg_hl(W2), maxzoom=1.3)
    E(f, t, 0, lambda d, dy: tag(d, 60, 600 + dy, 1160, 60, "Eingabe 2: erst nein, dann ja, also der mittlere Weg", LIGHTR, RED, 28, 700, outl=RED))


# ---------------------------------------------------------------- 3 Aufbau des Plans (reveal) und Zusammenfuehrung
def d3(f, t):
    tm = {k: 0.5 + 0.3 * i for i, k in enumerate(P_EINLASS.reihenfolge)}
    t_halb = tm["d-ja-z"] - 0.01
    plan_draw(f, 1.0, P_EINLASS, (40, 104, 560, 540), vis=reveal(t_halb, tm), hl={"d": RED}, maxzoom=1.4)
    plan_draw(f, 1.0, P_EINLASS, (660, 104, 560, 540), hl={k: RED for k in zusammen(P_EINLASS, "d") + ["o"]}, maxzoom=1.4)
    E(f, t, 0, lambda d, dy: TB(d, 320, 640 + dy, "Aufbau Symbol für Symbol", F(28, 700), GREY, 520, "mm"))
    E(f, t, 0, lambda d, dy: TB(d, 940, 640 + dy, "hier laufen die Wege zusammen", F(28, 700), RED, 520, "mm"))


# ---------------------------------------------------------------- 4 Wahrheitstabelle: Spalten erscheinen, Werte zeilenweise, Zeile hervorgehoben
def tab(f, t, x, y, hl):
    t_sp = [1.0, 1.4, 3.0]
    t_z = [2.0, 2.0, zeilenweise(4.0, 0.6, 4)]
    return wahrheitstabelle(f, t, x, y, ["A", "B", "A UND B"], UND, t_sp, t_z, hl=hl, trenner=2)

def d4(f, t):
    bw = tabelle_breite(["A", "B", "A UND B"])
    tab(f, 4.7, 60 + (560 - bw) / 2, 150, None)                 # mitten im Fuellen
    tab(f, t, 660 + (560 - bw) / 2, 150, {3})
    E(f, t, 0, lambda d, dy: TB(d, 340, 500 + dy, "Spalte füllt sich zeilenweise", F(28, 700), GREY, 540, "mm"))
    E(f, t, 0, lambda d, dy: TB(d, 940, 500 + dy, "letzte Zeile leuchtet", F(28, 700), RED, 540, "mm"))
    E(f, t, 0, lambda d, dy: (tag(d, 60, 580 + dy, 270, 60, "1 = wahr", LIGHTG, GREEN, 30, 700, outl=GREEN),
                              tag(d, 350, 580 + dy, 270, 60, "0 = falsch", LIGHTR, RED, 30, 700, outl=RED)))


# ---------------------------------------------------------------- 5 Zwei Ergebnisspalten, Termin-02-Tabelle mit wahr/falsch, Aussagen
def d5(f, t):
    sp = ["A", "B", "A UND B", "A ODER B"]
    rows = [u + [o[2]] for u, o in zip(UND, ODER)]
    wahrheitstabelle(f, t, 60, 130, sp, rows, [0, 0, 0, 0], trenner=2, rh=60)
    E(f, t, 0, lambda d, dy: aussage_karte(d, 660, 130 + dy, 560, 92, "A", "„Das Geld reicht“", BLUE, size=32))
    E(f, t, 0, lambda d, dy: aussage_karte(d, 660, 240 + dy, 560, 92, "NICHT A", "„Das Geld reicht nicht“", RED, size=32))
    wahrheitstabelle(f, t, 760, 370, ["A", "NICHT A"], [["wahr", "falsch"], ["falsch", "wahr"]], [0, 0], breiten=[200, 200], rh=62, size=34)
    E(f, t, 0, lambda d, dy: (tag(d, 60, 470 + dy, 560, 60, "UND ist streng: 1 von 4", LIGHTK, DARK, 28, 700, outl=GREY),
                              tag(d, 60, 546 + dy, 560, 60, "ODER ist großzügig: 3 von 4", LIGHTK, DARK, 28, 700, outl=GREY)))


# ---------------------------------------------------------------- 6 Vergleiche mit Ergebnis, durchgestrichenes Zeichen, Probewerte
def d6(f, t):
    E(f, t, 0, lambda d, dy: vergleich(d, 60, 120 + dy, "2", ">=", "1.5", 64, unter=("dein Geld", "Preis der Cola")))
    vergleich_zeile(f, t, 600, 120, "1.5", ">=", "1.5", 0, 0, "deutsch", 56, ergebnis="wahr")
    g = vergleich_zeile(f, t, 600, 250, "1.5", ">", "1.5", 0, 0, "deutsch", 56, ergebnis="falsch")
    fm = M(56, True); a0 = g["x0"] + 28 + fm.getlength("1.5 "); a1 = a0 + fm.getlength(">")
    E(f, t, 0, lambda d, dy: durchstreichen(d, a0 - 8, g["y0"] + 16 + dy, a1 + 8, g["y1"] - 16 + dy))
    E(f, t, 0, lambda d, dy: check_circle(d, 570, 120 + 48 + dy, 22))
    E(f, t, 0, lambda d, dy: wertereihe(d, 60, 400 + dy, 1160, [("1,00 €", "darunter", GREY), ("1,50 €", "auf der Grenze", RED), ("2,00 €", "darüber", GREY)]))
    E(f, t, 0, lambda d, dy: (wert_chip(d, 60, 560 + dy, "True"), wert_chip(d, 220, 560 + dy, "False"), wert_chip(d, 400, 560 + dy, "ja"),
                              wert_chip(d, 510, 560 + dy, "nein"), wert_chip(d, 650, 560 + dy, "1"), wert_chip(d, 740, 560 + dy, "0")))


# ---------------------------------------------------------------- 7 Programmlauf: graue Zeilen, Notizen an den Zeilen, Fluchtlinie, Markierungen
def d7(f, t):
    def fn(d, dy):
        g = code_lauf(d, 60, 116 + dy, 640, AMPEL, t, 26, 46, aktiv={3, 4}, grau={2, 5, 6})
        code_fluchtlinie(d, g, 1, 5)
        zeilen_notiz(d, g, 1, 740, 480, "32 < 30 ist falsch: nein", LIGHTR, RED, 26, outl=RED)
        zeilen_notiz(d, g, 3, 740, 480, "32 < 35 ist wahr: ja", LIGHTG, GREEN, 26, outl=GREEN)
    E(f, t, 0, fn)
    E(f, t, 0, lambda d, dy: lauf_panel(d, 60, 530 + dy, 640, [(0, "Gelb", None, None, CODE_G)], t, 26, 42, "Ausgabe"))

def d8(f, t):
    code = ["punkte = 48", "if punkte >= 50:", '    print("Bestanden")']
    fstr = ["preis = 9.5", 'print(f"Ticket: {preis:.2f} Euro")']
    assert run(NL.join(fstr)) == ["Ticket: 9.50 Euro"] and run(NL.join(code)) == []
    def fn(d, dy):
        g = code_lauf(d, 60, 116 + dy, 620, code, t, 28, 48)
        code_markiere(d, g, 1, *spalte(code[1], ":", True))
        code_einrueckung(d, g, 2)
        g2 = code_lauf(d, 60, 360 + dy, 1160, fstr, t, 30, 50)
        code_markiere(d, g2, 1, *spalte(fstr[1], 'f"'))
        code_markiere(d, g2, 1, *spalte(fstr[1], "{preis:.2f}"), col=AMBER)
        code_markiere(d, g2, 1, *spalte(fstr[1], ":.2f"), col=CODE_G)
    E(f, t, 0, fn)
    E(f, t, 0, lambda d, dy: tag(d, 720, 150 + dy, 500, 60, "Doppelpunkt am Ende", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, 0, lambda d, dy: tag(d, 720, 226 + dy, 500, 60, "vier Leerzeichen: ja-Weg", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, 0, lambda d, dy: lauf_panel(d, 60, 540 + dy, 1160, [(0, "Ticket: 9.50 Euro", None, None, CODE_G)], t, 30, 46, "Ausgabe"))


# ---------------------------------------------------------------- 9 Bildzeichen: Automat, Muenzen, Raute als Ausblick
def d9(f, t):
    E(f, t, 0, lambda d, dy: automat(d, 60, 120 + dy, 1.0, "1,50 €", 6, ausgabe=True))
    E(f, t, 0, lambda d, dy: automat(d, 400, 210 + dy, 0.8, "1,50 €", 0))
    E(f, t, 0, lambda d, dy: (muenze(d, 720, 250 + dy, 50, "2 €"), muenze(d, 720, 380 + dy, 44, "1 €")))
    plan_draw(f, 1.0, P_RAUTE, (800, 140, 420, 300), hl={"d": RED}, maxzoom=1.6)
    E(f, t, 0, lambda d, dy: TB(d, 1010, 470 + dy, "Raute als Ausblick", F(28, 700), GREY, 400, "mm"))


# ---------------------------------------------------------------- 10 Werkzeugkarten: zwei neue vorn, drei alte blass dahinter
def d10(f, t):
    alt = [(1, "Vergleichen", "punkte >= 50"), (2, "if und else", "if ...:  else:"), (3, "f-String", 'f"{preis:.2f}"')]
    for k, (nr, ti, co) in enumerate(alt):
        f.el(0.35, lambda d, dy, k=k, nr=nr, ti=ti, co=co: werkzeugkarte(d, 60 + k * 400, 120, 360, 190, nr, ti, co, col=GREY))
    E(f, t, 0, lambda d, dy: werkzeugkarte(d, 60, 350 + dy, 560, 230, 1, "elif", "elif sekunde < 35:", "mehr als zwei Wege"))
    E(f, t, 0, lambda d, dy: werkzeugkarte(d, 660, 350 + dy, 560, 230, 2, "and und or", "groesse >= 140 and alter >= 10", "zwei Vergleiche verbinden", code_size=22))


DEMOS = [("01_plan_weg_und_lauf", "Plan mit Raute: der gegangene Weg leuchtet", d1),
         ("02_plan_drei_wege", "Zwei Rauten: drei Wege", d2),
         ("03_plan_aufbau_zusammen", "Aufbau und Zusammenführung", d3),
         ("04_tabelle_fuellen", "Wahrheitstabelle mit 1 und 0", d4),
         ("05_tabelle_aussagen", "UND und ODER, NICHT, Aussagen", d5),
         ("06_vergleich", "Vergleiche mit Ergebnis", d6),
         ("07_lauf_ampel", "Programmlauf: übersprungene Zeilen", d7),
         ("08_code_markierungen", "Markierungen im Code", d8),
         ("09_automat", "Getränkeautomat, Münzen, Raute", d9),
         ("10_werkzeugkarten", "Werkzeugkarten", d10)]

if __name__ == "__main__":
    for name, titel, fn in DEMOS: bild(name, titel, fn)
