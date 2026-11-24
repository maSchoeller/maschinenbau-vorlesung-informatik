wert = float(input("Bestellwert in Euro: "))
km = float(input("Entfernung in km: "))
if wert >= 20 and km <= 5:
    print("Lieferung gratis")
else:
    print("Lieferung 3 Euro")
