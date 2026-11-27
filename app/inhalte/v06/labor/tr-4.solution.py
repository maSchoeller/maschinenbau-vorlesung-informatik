breite = int(input("Breite in mm: "))
hoehe = int(input("Höhe in mm: "))
abstand = int(input("Abstand in mm: "))
anzahl = 0
for y in range(0, hoehe + 1, abstand):
    for x in range(0, breite + 1, abstand):
        print(f"Loch bei x = {x}, y = {y}")
        anzahl = anzahl + 1
print(f"Löcher: {anzahl}")
