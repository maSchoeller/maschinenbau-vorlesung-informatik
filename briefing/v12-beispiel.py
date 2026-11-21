# Lagertemperatur überwachen: Testfälle mit Grenzwerten und assert
# (V12: assert, Testfälle von Hand inkl. Grenzwerte, Traceback lesen, Debuggen)
# Spezifikation: unter 70 °C "normal", von 70 °C bis einschließlich 85 °C "warnung",
# über 85 °C "abschalten". Messwerte unter -40 °C oder über 200 °C sind Sensorfehler.


def zustand(t):
    """Bewertet die Lagertemperatur t in °C."""
    if t < -40 or t > 200:
        return "sensorfehler"
    if t < 70:
        return "normal"
    elif t <= 85:
        return "warnung"
    else:
        return "abschalten"


# Testfälle von Hand: je Bereich ein typischer Wert und JEDE Grenze von beiden Seiten
assert zustand(20) == "normal"
assert zustand(69.9) == "normal"
assert zustand(70) == "warnung"            # Grenze: 70 gehört schon zur Warnung
assert zustand(85) == "warnung"            # Grenze: 85 gehört noch zur Warnung
assert zustand(85.1) == "abschalten"
assert zustand(-40) == "normal"            # unterste gültige Messung
assert zustand(-40.1) == "sensorfehler"
assert zustand(200) == "abschalten"
assert zustand(200.1) == "sensorfehler"
print("Alle 9 Tests bestanden")

# Die KI-Version hatte einen Fehler an der Grenze - assert zeigt ihn sofort:
def zustand_ki(t):
    if t < 70:
        return "normal"
    elif t < 85:
        return "warnung"
    else:
        return "abschalten"

try:
    assert zustand_ki(85) == "warnung", "Grenzwert 85 °C falsch eingeordnet"
except AssertionError as fehler:
    print("AssertionError:", fehler)
