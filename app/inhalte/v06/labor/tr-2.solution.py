summe = int(input("Gewünschte Augensumme: "))
anzahl = 0
for i in range(1, 7):
    for j in range(1, 7):
        if i + j == summe:
            anzahl = anzahl + 1
print(f"Paare: {anzahl}")
