def bezeichnung(d, l):
    return "M" + str(d) + " x " + str(l)

durchmesser = int(input("Durchmesser in mm: "))
laenge = int(input("Länge in mm: "))
print(bezeichnung(durchmesser, laenge))
