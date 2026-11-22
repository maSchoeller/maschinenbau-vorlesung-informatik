# Code-Walkthrough: Prüfprotokoll einer Wellen-Charge erklären
# (V22: eigenen Code erklären - Zweck, Eingaben und Ausgaben, Ablauf, Grenzfälle)
# Spezifikation: Nennmaß 20,00 mm, Toleranz +-0,02 mm. Zu dicke Wellen kann man
# nacharbeiten (abdrehen), zu dünne sind Ausschuss.


def bewerte(d, nenn=20.0, tol=0.02):
    """Ordnet einen Durchmesser d in mm ein: gut, nacharbeit oder ausschuss."""
    abweichung = d - nenn
    if abs(abweichung) <= tol:
        return "gut"
    elif abweichung > 0:
        return "nacharbeit"        # zu dick: kann man noch abdrehen
    else:
        return "ausschuss"         # zu dünn: Material ist weg


messwerte = [20.01, 20.03, 19.97, 20.00, 20.02]
zaehler = {"gut": 0, "nacharbeit": 0, "ausschuss": 0}
for d in messwerte:
    ergebnis = bewerte(d)
    zaehler[ergebnis] = zaehler[ergebnis] + 1
    print(f"{d:.2f} mm -> {ergebnis}")

anteil = zaehler["gut"] / len(messwerte) * 100
print(zaehler)
print(f"Gutanteil: {anteil:.0f} %")

# Walkthrough-Fragen zum Selbsttest (Antworten stehen in der Lerneinheit):
# 1. Was passiert bei bewerte(19.98)?  -> "gut" (Grenze gehört dazu)
# 2. Warum steht abs() in der ersten Bedingung und nicht in der zweiten?
# 3. Was ändert sich, wenn man elif und else vertauscht?
assert bewerte(19.98) == "gut"
assert bewerte(20.025) == "nacharbeit"
assert bewerte(19.975) == "ausschuss"
# 4. Grenzfall mit Kommazahlen (V03): 25.1 - 25.0 ergibt 0.10000000000000142, also > 0.1.
#    Die Welle liegt genau auf der Grenze und wird trotzdem nicht als "gut" erkannt.
assert bewerte(25.1, nenn=25.0, tol=0.1) == "nacharbeit"
print("Alle Grenzfall-Tests bestanden")
