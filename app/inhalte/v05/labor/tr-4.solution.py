n = int(input("Wie viele Bolzen? "))
ausschuss = 0
for i in range(1, n + 1):
    laenge = int(input(f"Länge Bolzen {i} in mm: "))
    if laenge < 98 or laenge > 102:
        ausschuss = ausschuss + 1
print(f"Ausschuss: {ausschuss} von {n}")
