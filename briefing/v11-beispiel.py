# Copilot-Ergebnis prüfen: Passungsart einer Welle-Bohrung-Paarung
# (V11: import-Varianten, Module der Standardbibliothek, KI-Code mit Testfällen prüfen)
# Prompt war ein PAP: Spiel, wenn kleinste Bohrung >= größte Welle;
# Übermaß, wenn größte Bohrung <= kleinste Welle; sonst Übergang.

import statistics
from math import isclose


# --- von Copilot erzeugt (nach dem PAP als Prompt) ---
def passungsart(bohrung_min, bohrung_max, welle_min, welle_max):
    """Liefert 'Spielpassung', 'Übermaßpassung' oder 'Übergangspassung' (Maße in mm)."""
    if bohrung_min >= welle_max:
        return "Spielpassung"
    elif bohrung_max <= welle_min:
        return "Übermaßpassung"
    else:
        return "Übergangspassung"


# --- Testfälle, VOR dem Generieren von Hand aufgeschrieben ---
testfaelle = [
    # (Bohrung min, max, Welle min, max, erwartet)          # Beispiel
    (25.000, 25.021, 24.980, 24.993, "Spielpassung"),       # 25 H7/g6
    (25.000, 25.021, 25.028, 25.041, "Übermaßpassung"),     # 25 H7/r6
    (25.000, 25.021, 25.002, 25.015, "Übergangspassung"),   # 25 H7/k6
    (25.000, 25.021, 24.987, 25.000, "Spielpassung"),       # 25 H7/h6, Grenzfall: Spiel genau 0
]

fehler = 0
for fall in testfaelle:
    ergebnis = passungsart(fall[0], fall[1], fall[2], fall[3])
    if ergebnis == fall[4]:
        print("ok    ", fall[4])
    else:
        print("FEHLER", fall, "->", ergebnis)
        fehler = fehler + 1
print("Fehlgeschlagene Tests:", fehler)

# Module helfen beim Auswerten: Höchstspiel und Mittelwert mehrerer Paarungen
hoechstspiele = [round(f[1] - f[2], 3) for f in testfaelle]
print("Höchstspiele in mm:", hoechstspiele)
print("Mittel:", round(statistics.mean(hoechstspiele), 4), "mm")
grenz = testfaelle[3]
print("Mindestspiel im Grenzfall 0 mm?", isclose(grenz[0] - grenz[3], 0.0, abs_tol=1e-9))
