"""Standbilder des Bausteins b04.py (nach v04-common/out/). Aufruf: python demo.py
Jedes Bild ist ein Szenenbild mit Kopfzeile und Fusszeile wie in den Videos; die Plaene sind die der Videos
v04-beispiel (while) und v05-beispiel (Zaehlschleife)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from b04 import *

OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
LABEL = "DHBW · Informatik · Termin 04 · Bausteine"

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
WHILE = ['preis = int(input("Preis in Euro (0 = fertig): "))', "summe = 0", "while preis != 0:", "    summe = summe + preis",
         '    preis = int(input("Preis in Euro (0 = fertig): "))', 'print(f"Summe: {summe} Euro")']
assert run(NL.join(WHILE), ["12", "8", "5", "0"])[-1] == "Summe: 25 Euro"
assert run(NL.join(WHILE), ["0"])[-1] == "Summe: 0 Euro"
MITTEL = ["n = int(input(\"Tage: \"))", "summe = 0", "for i in range(1, n + 1):", "    minuten = int(input(\"Minuten: \"))",
          "    summe = summe + minuten", "mittel = summe / n", "print(mittel)"]
assert run(NL.join(MITTEL), ["3", "30", "45", "60"])[-1] == "45.0"

P_WHILE = schleife_plan([("s", "term", "Start"), ("e", "io", "Eingabe: preis"), ("i", "proc", "summe = 0"),
                         ("w", "loop", "preis != 0?", [("a", "proc", "summe = summe + preis"), ("e2", "io", "Eingabe: preis")]),
                         ("o", "io", 'Ausgabe: "Summe: ... Euro"'), ("end", "term", "Ende")])
P_FOR = schleife_plan([("s", "term", "Start"), ("n", "io", "Eingabe: n"), ("i", "proc", "summe = 0"),
                       ("w", "loop", "i von 1 bis n?", [("e", "io", "Eingabe: minuten"), ("a", "proc", "summe = summe + minuten")]),
                       ("m", "proc", "mittel = summe / n"), ("o", "io", "Ausgabe: mittel"), ("end", "term", "Ende")])
W3 = schleife_weg(P_WHILE, {"w": 3})
assert W3 == ["s", "s-e", "e", "e-i", "i", "i-w", "w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w", "w-ja", "a", "a-e2", "e2",
              "w-zurueck", "w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w", "w-nein", "o", "o-end", "end"], W3
assert schleife_weg(P_WHILE, {"w": 0}) == ["s", "s-e", "e", "e-i", "i", "i-w", "w", "w-nein", "o", "o-end", "end"]
WF = schleife_weg(P_FOR, {"w": 3})
assert set(P_WHILE.reihenfolge) == set(P_WHILE.nodes) | set(P_WHILE.edges) and len(P_WHILE.reihenfolge) == 16


def bild(name, titel, fn, t=30.0):
    f = Frame(); kopf(f, t, titel); fn(f, t); chrome(f, 60, 100, LABEL)
    p = os.path.join(OUT, name + ".png"); f.img.save(p); print("geschrieben", p)


# ---------------------------------------------------------------- 1 while-Plan: ganzer Plan, Ruecksprung rot
def d1(f, t):
    schleife_draw(f, 1.0, P_WHILE, (60, 100, 560, 576), hl={"w-zurueck": RED})
    E(f, t, 0, lambda d, dy: TB(d, 920, 300 + dy, "ja: der Rumpf läuft, dann zurück", F(30, 700), RED, 560, "mm"))


# ---------------------------------------------------------------- 2 Zaehlschleife: Plan mit drei Durchgaengen
def d2(f, t):
    schleife_draw(f, 1.0, P_FOR, (60, 100, 560, 576), vis=weg_vis(WF), hl=weg_hl(WF, nur=lambda k: k in ("w-zurueck", "w")))
    schleife_draw(f, 1.0, P_FOR, (660, 100, 560, 576), hl=weg_hl(WF), marker=schleife_marke(P_FOR, WF, 0.55))


# ---------------------------------------------------------------- 3 Aufbau Symbol fuer Symbol, Weg mit 0 Durchgaengen
def d3(f, t):
    tm = {k: 0.5 + 0.3 * i for i, k in enumerate(P_WHILE.reihenfolge)}
    schleife_draw(f, 1.0, P_WHILE, (60, 100, 560, 576), vis=reveal(tm["w-zurueck"] - 0.1, tm), hl={"w": RED})
    W0 = schleife_weg(P_WHILE, {"w": 0})
    schleife_draw(f, 1.0, P_WHILE, (660, 100, 560, 576), vis=weg_vis(W0), hl=weg_hl(W0))


def main():
    bild("b04-while", "Plan mit Rücksprung: while", d1)
    bild("b04-zaehl", "Zählschleife und Lauf mit Marker", d2)
    bild("b04-aufbau", "Aufbau und Weg ohne Durchgang", d3)


if __name__ == "__main__":
    main()
