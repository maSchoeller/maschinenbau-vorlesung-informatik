# Prüfskript zur Probeklausur 2026/27 (site/probeklausur-2026-27.html)
# Prüft alle Rechenergebnisse aus Teil A und alle Code-Musterlösungen aus Teil B.
# Aufruf: python briefing/v22-probeklausur-pruefung.py  -> "Alle Prüfungen bestanden"

import builtins
import contextlib
import io
import ipaddress
import math
import os
import sqlite3
import tempfile


def lauf(quelltext, eingaben=()):
    """Führt ein Programm mit vorgegebenen Eingaben aus und liefert die Bildschirmausgabe."""
    rest = list(eingaben)
    alt = builtins.input

    def fake_input(prompt=""):
        return rest.pop(0)

    builtins.input = fake_input
    puffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(puffer):
            exec(quelltext, {"__name__": "__main__"})
    finally:
        builtins.input = alt
    return puffer.getvalue()


# ---------------------------------------------------------------- Teil A
# A1 a) 1011 0110 (binär) -> dezimal und hex
assert int("10110110", 2) == 182
assert hex(182) == "0xb6"
# A1 b) -100 im Zweierkomplement mit 8 Bit
assert format(-100 & 0xFF, "08b") == "10011100"
assert format(100, "08b") == "01100100"
# A1 c) 0.1 + 0.2 == 0.3 ist False, isclose ist True
assert (0.1 + 0.2 == 0.3) is False
assert math.isclose(0.1 + 0.2, 0.3)
# A1 d) 8-Bit-Zähler ohne Vorzeichen: 250 + 10 -> 4 (Überlauf)
assert (250 + 10) % 256 == 4

# A2 a) Y = (P oder H) und nicht N
tabelle = []
for p in (0, 1):
    for h in (0, 1):
        for n in (0, 1):
            tabelle.append((p, h, n, int((p or h) and not n)))
assert [z[3] for z in tabelle] == [0, 0, 1, 0, 1, 0, 1, 0]
assert sum(z[3] for z in tabelle) == 3
# A2 b) De Morgan: nicht (A und nicht B) == (nicht A) oder B
for a in (False, True):
    for b in (False, True):
        assert (not (a and not b)) == ((not a) or b)

# A3 a) Netz 192.168.30.0/24
netz = ipaddress.ip_network("192.168.30.0/24")
assert ipaddress.ip_address("192.168.30.12") in netz
assert ipaddress.ip_address("192.168.31.20") not in netz
assert ipaddress.ip_address("192.168.30.250") in netz
# A3 c) SQL-Abfrage
db = sqlite3.connect(":memory:")
cur = db.cursor()
cur.execute("CREATE TABLE auftraege (nr INTEGER PRIMARY KEY, teil TEXT, maschine TEXT, menge INTEGER, status TEXT)")
cur.executemany("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)", [
    (101, "Welle", "D2", 40, "offen"),
    (102, "Flansch", "F1", 25, "offen"),
    (103, "Welle", "D2", 60, "erledigt"),
    (104, "Buchse", "D2", 15, "offen"),
])
cur.execute("SELECT nr, menge FROM auftraege WHERE maschine = 'D2' AND status = 'offen'")
assert cur.fetchall() == [(101, 40), (104, 15)]
eingabe = "x' OR '1'='1"
cur.execute(f"SELECT nr FROM auftraege WHERE teil = '{eingabe}'")
assert len(cur.fetchall()) == 4          # Injection liefert alle Zeilen
cur.execute("SELECT nr FROM auftraege WHERE teil = ?", (eingabe,))
assert len(cur.fetchall()) == 0
db.close()


# A4 b) Grenzwert-Testfälle für "gut, wenn 19,98 <= d <= 20,02"
def gut(d):
    return 19.98 <= d <= 20.02


assert gut(19.98) and gut(20.02) and gut(20.0)
assert not gut(19.97) and not gut(20.03)

# ---------------------------------------------------------------- Teil B
# B1 PAP -> Code (Druckprüfung, fünf Messungen)
B1 = '''
abweichungen = 0
i = 1
while i <= 5:
    p = float(input("Druck in bar: "))
    if p > 10:
        print(i, "Überdruck")
        abweichungen = abweichungen + 1
    elif p < 2:
        print(i, "Unterdruck")
        abweichungen = abweichungen + 1
    else:
        print(i, "ok")
    i = i + 1
print("Abweichungen:", abweichungen)
'''
B1_FOR = '''
abweichungen = 0
for i in range(1, 6):
    p = float(input("Druck in bar: "))
    if p > 10:
        print(i, "Überdruck")
        abweichungen = abweichungen + 1
    elif p < 2:
        print(i, "Unterdruck")
        abweichungen = abweichungen + 1
    else:
        print(i, "ok")
print("Abweichungen:", abweichungen)
'''
B1_SOLL = "1 ok\n2 Überdruck\n3 ok\n4 Unterdruck\n5 ok\nAbweichungen: 2\n"
for code in (B1, B1_FOR):
    assert lauf(code, ["6", "10.5", "10", "1.5", "2"]) == B1_SOLL, lauf(code, ["6", "10.5", "10", "1.5", "2"])
    assert lauf(code, ["5"] * 5).endswith("Abweichungen: 0\n")
    assert lauf(code, ["11", "0", "12", "1", "20"]).endswith("Abweichungen: 5\n")

# B2 Code -> PAP (Abkühlen): Ablauf nachrechnen
B2 = '''
t = float(input("Starttemperatur in °C: "))
minuten = 0
while t > 40:
    t = t - 0.1 * (t - 20)
    minuten = minuten + 1
if minuten > 30:
    print("Zu langsam:", minuten, "min")
else:
    print("Abgekühlt nach", minuten, "min")
'''
assert lauf(B2, ["35"]) == "Abgekühlt nach 0 min\n"
assert lauf(B2, ["100"]) == "Abgekühlt nach 14 min\n", lauf(B2, ["100"])
assert lauf(B2, ["1000"]) == "Zu langsam: 37 min\n", lauf(B2, ["1000"])

# B3 Programmausgabe bestimmen
B3A = '''
werte = [12, 7, 15, 3, 9]
print(werte[1:4])
print(werte[-2])
werte.append(werte[0] + werte[-1])
print(len(werte), werte[-1])
'''
assert lauf(B3A) == "[7, 15, 3]\n3\n6 21\n"

B3B = '''
def gewicht(stueck, lager):
    summe = 0
    for nr in stueck:
        summe = summe + stueck[nr] * lager[nr]
    return summe

lager = {"S1": 0.5, "W3": 2.0, "F8": 1.25}
stueck = {"S1": 4, "F8": 2}
print(gewicht(stueck, lager))
stueck["W3"] = 1
print(gewicht(stueck, lager))
print(len(stueck), "S1" in lager)
'''
assert lauf(B3B) == "4.5\n6.5\n3 True\n", lauf(B3B)

B3C = '''
class Lager:
    def __init__(self, typ, d):
        self.typ = typ
        self.d = d
        self.stunden = 0

    def laufe(self, h):
        self.stunden = self.stunden + h
        return self.stunden > 1000

l = Lager("6205", 25)
print(l.laufe(600))
print(l.laufe(600), l.stunden)
print(l.typ + "-" + str(l.d))
'''
assert lauf(B3C) == "False\nTrue 1200\n6205-25\n"

# B4 a) Fehler: anzahl zählt auch übersprungene Zeilen
B4A_FALSCH = '''
def mittelwert(dateiname):
    summe = 0
    anzahl = 0
    with open(dateiname, encoding="utf-8") as datei:
        for zeile in datei:
            try:
                summe = summe + float(zeile.strip())
            except ValueError:
                print("Zeile übersprungen:", zeile.strip())
            anzahl = anzahl + 1
    return summe / anzahl
'''
B4A_RICHTIG = B4A_FALSCH.replace(
    "                summe = summe + float(zeile.strip())\n",
    "                summe = summe + float(zeile.strip())\n                anzahl = anzahl + 1\n",
).replace("            anzahl = anzahl + 1\n    return", "    return")
assert B4A_RICHTIG.count("anzahl = anzahl + 1") == 1
with tempfile.TemporaryDirectory() as tmp:
    pfad = os.path.join(tmp, "temperaturen.txt")
    with open(pfad, "w", encoding="utf-8") as f:
        f.write("20.0\n22.0\nFEHLER\n24.0\n")
    g_falsch, g_richtig = {}, {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(B4A_FALSCH, g_falsch)
        exec(B4A_RICHTIG, g_richtig)
        assert g_falsch["mittelwert"](pfad) == 66.0 / 4      # 16.5 statt 22.0
        assert g_richtig["mittelwert"](pfad) == 22.0


# B4 b) Einheitenfehler kW/W
def torsionsmoment_ki(P, n):
    """P in kW, n in 1/min, Ergebnis T in N·m"""
    return P / (2 * math.pi * n / 60)


def torsionsmoment(P, n):
    """P in kW, n in 1/min, Ergebnis T in N·m"""
    return P * 1000 / (2 * math.pi * n / 60)


assert abs(torsionsmoment_ki(15, 1450) - 0.0988) < 0.0001     # um Faktor 1000 zu klein
assert abs(torsionsmoment(15, 1450) - 98.8) < 0.1
assert abs(9550 * 15 / 1450 - torsionsmoment(15, 1450)) < 0.05   # Zahlenwertgleichung als Alternative


# B5 a)
def ist_im_soll(d, nenn, tol):
    return abs(d - nenn) <= tol


assert ist_im_soll(20.01, 20, 0.02) is True
assert ist_im_soll(19.97, 20, 0.02) is False
assert ist_im_soll(25.0, 25, 0.0) is True

# B5 b)
B5B = '''
durchmesser = [20.01, 19.97, 20.00, 20.03, 19.99, 20.02]
ausschuss = 0
for d in durchmesser:
    if d < 19.98 or d > 20.02:
        ausschuss = ausschuss + 1
print("Ausschuss:", ausschuss)
'''
assert lauf(B5B) == "Ausschuss: 2\n"

# B5 c)
B5C = '''
lager = {"S1": 120, "W3": 35, "F8": 50, "B2": 8}
for nr, menge in lager.items():
    if menge < 50:
        print(nr, menge)
'''
assert lauf(B5C) == "W3 35\nB2 8\n"

# B5 d)
B5D = '''
while True:
    try:
        n = int(input("Drehzahl in 1/min: "))
        break
    except ValueError:
        print("Bitte eine ganze Zahl eingeben")
print("Drehzahl:", n)
'''
assert lauf(B5D, ["abc", "14.5", "1450"]) == "Bitte eine ganze Zahl eingeben\nBitte eine ganze Zahl eingeben\nDrehzahl: 1450\n"
assert lauf(B5D, ["3000"]) == "Drehzahl: 3000\n"

print("Alle Prüfungen bestanden")
