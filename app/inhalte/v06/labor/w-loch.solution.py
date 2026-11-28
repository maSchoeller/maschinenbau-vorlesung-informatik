laenge = int(input("Länge der Leiste in mm: "))
abstand = int(input("Abstand der Löcher in mm: "))
for x in range(0, laenge + 1, abstand):
    print(f"Loch bei {x} mm")
