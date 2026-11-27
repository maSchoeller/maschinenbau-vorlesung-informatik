# Liest n Laufzeiten in Sekunden ein und gibt den Durchschnitt aus.
n = int(input("Wie viele Läufe? "))
for i in range(1, n):
    zeit = int(input(f"Zeit Lauf {i}: "))
    summe = summe + zeit
mittel = summe / n
print(f"Durchschnitt: {mittel:.1f} s")
