def endpreis(betrag, satz):
    rabatt = betrag * satz / 100
    return betrag - rabatt

preis = float(input("Preis in Euro: "))
prozent = float(input("Rabatt in Prozent: "))
ergebnis = endpreis(preis, prozent)
print(f"Endpreis: {ergebnis:.2f} Euro")
