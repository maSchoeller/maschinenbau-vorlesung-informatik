# Messreihe Bohrungsdurchmesser und Stückliste
# (V08: Listen, Index, Slicing, append, len, in, for über Listen, sum/min/max, Tupel, Dictionaries)

# --- Teil 1: Messreihe einer Bohrung, Soll 12,00 mm H7 (+0,018 / 0) ---
messungen = [12.004, 12.011, 11.998, 12.007, 12.019, 12.002, 12.015, 12.009]
toleranz = (12.000, 12.018)           # Tupel: (untere Grenze, obere Grenze) in mm

mittelwert = sum(messungen) / len(messungen)
spannweite = max(messungen) - min(messungen)

ausserhalb = []
for d in messungen:
    if d < toleranz[0] or d > toleranz[1]:
        ausserhalb.append(d)

print(f"Anzahl Messungen: {len(messungen)}")
print(f"Mittelwert: {mittelwert:.4f} mm, Spannweite: {spannweite:.3f} mm")
print(f"Außerhalb Toleranz: {len(ausserhalb)} -> {ausserhalb}")
print("Letzte drei Messungen:", messungen[-3:])

# --- Teil 2: Stückliste (Teilenummer -> (Menge, Gewicht je Stück in kg)) ---
stueckliste = {
    "W-100": (1, 2.40),     # Welle
    "L-6205": (2, 0.13),    # Rillenkugellager
    "D-35": (2, 0.02),      # Wellendichtring
}
stueckliste["P-8x7"] = (1, 0.01)    # Passfeder nachträglich ergänzt

gesamt = 0.0
for teil, werte in stueckliste.items():
    menge = werte[0]
    gewicht = werte[1]
    gesamt = gesamt + menge * gewicht
    print(f"{teil:8} {menge:2} x {gewicht:.2f} kg")
print(f"Gesamtgewicht: {gesamt:.2f} kg")

if "L-6205" in stueckliste:
    print("Lager L-6205 ist in der Stückliste:", stueckliste["L-6205"][0], "Stück")
