def ist_teilbar(zahl, teiler):
    if zahl % teiler == 0:
        return True
    else:
        return False

def teilersumme(n):
    summe = 0
    for t in range(1, int(n / 2) + 1):
        if ist_teilbar(n, t):
            summe = summe + t
    return summe

grenze = int(input("Grenze: "))
for kandidat in range(2, grenze + 1):
    if teilersumme(kandidat) == kandidat:
        print(kandidat)
