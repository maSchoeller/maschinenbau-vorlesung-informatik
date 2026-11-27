def zerlegungen(n):
    anzahl = 0
    for a in range(2, n):
        for b in range(2, n):
            if a * b == n:
                anzahl = anzahl + 1
    return anzahl

grenze = int(input("Grenze: "))
for zahl in range(2, grenze + 1):
    if zerlegungen(zahl) == 0:
        print(zahl)
