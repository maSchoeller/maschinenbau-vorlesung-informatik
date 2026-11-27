# Einkauf: Rabatt nach Betrag, danach Trinkgeld.
betrag = float(input("Einkauf in Euro: "))
if betrag >= 100:
    satz = 10
elif betrag >= 50:
    satz = 5
else:
    satz = 0
nach_rabatt = betrag - betrag * satz / 100
trinkgeld = nach_rabatt * 0.1
gesamt = nach_rabatt + trinkgeld
print(f"Rabatt: {satz} Prozent")
print(f"Gesamt mit Trinkgeld: {gesamt:.2f} Euro")
