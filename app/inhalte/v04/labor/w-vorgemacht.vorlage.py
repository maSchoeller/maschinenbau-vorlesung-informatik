# Einkauf zusammenrechnen
preis = int(input("Preis in Euro (0 = fertig): "))
summe = 0
while preis != 0:
    summe = summe + preis
    preis = int(input("Preis in Euro (0 = fertig): "))
print(f"Summe: {summe} Euro")
