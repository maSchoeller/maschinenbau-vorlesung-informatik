gross = float(input("Durchmesser der großen Pizza in cm: "))
klein = float(input("Durchmesser einer kleinen Pizza in cm: "))
anzahl = int(input("Anzahl der kleinen Pizzen: "))
flaeche_gross = gross * gross
flaeche_klein = anzahl * klein * klein
if flaeche_gross >= flaeche_klein:
    faktor = flaeche_gross / flaeche_klein
    print(f"Die große Pizza ist {faktor:.2f}-mal so viel wie die {anzahl} kleinen")
else:
    faktor = flaeche_klein / flaeche_gross
    print(f"Die {anzahl} kleinen sind {faktor:.2f}-mal so viel wie die große Pizza")
