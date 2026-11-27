# Pendelzeit: Durchschnitt über n Tage
n = int(input("Wie viele Tage? "))
summe = 0
for i in range(1, n + 1):
    minuten = int(input(f"Minuten an Tag {i}: "))
    summe = summe + minuten
mittel = summe / n
print(f"Im Schnitt {mittel:.1f} Minuten")
