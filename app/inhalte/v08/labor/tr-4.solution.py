def ist_teilbar(zahl, teiler):
    if zahl % teiler == 0:
        return True
    else:
        return False

def ist_schaltjahr(jahr):
    if ist_teilbar(jahr, 400):
        return True
    elif ist_teilbar(jahr, 100):
        return False
    else:
        return ist_teilbar(jahr, 4)

eingabe = int(input("Jahr: "))
if ist_schaltjahr(eingabe):
    print(eingabe, "ist ein Schaltjahr")
else:
    print(eingabe, "ist kein Schaltjahr")

# Auch richtig, kürzer:
# def ist_teilbar(zahl, teiler):
#     return zahl % teiler == 0
#
# def ist_schaltjahr(jahr):
#     return (ist_teilbar(jahr, 4) and not ist_teilbar(jahr, 100)) or ist_teilbar(jahr, 400)
#
# and bindet stärker als or: Erst werden die Teile mit and zusammengefasst, dann kommt or. Darum stehen hier Klammern.
