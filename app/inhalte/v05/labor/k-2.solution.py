grenze = int(input("Grenze: "))
feld = 1
koerner = 1
summe = 1
while koerner <= grenze:
    feld = feld + 1
    koerner = koerner * 2
    summe = summe + koerner
print(f"Feld {feld}: {koerner} Körner, zusammen {summe}")
