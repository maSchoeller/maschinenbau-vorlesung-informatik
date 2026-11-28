def rabatt_satz(betrag):
    if betrag >= 100:
        return 10
    elif betrag >= 50:
        return 5
    else:
        return 0

betrag = float(input("Einkauf in Euro: "))
satz = rabatt_satz(betrag)
nach_rabatt = betrag - betrag * satz / 100
trinkgeld = nach_rabatt * 0.1
gesamt = nach_rabatt + trinkgeld
print(f"Rabatt: {satz} Prozent")
print(f"Gesamt mit Trinkgeld: {gesamt:.2f} Euro")
