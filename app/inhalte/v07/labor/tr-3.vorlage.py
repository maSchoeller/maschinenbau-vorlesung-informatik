# Prüft, ob zwei Preise zusammen genau 0.30 Euro kosten.
a = float(input("Preis 1: "))
b = float(input("Preis 2: "))
if gesamt(a, b) == 0.3:
    print("Passt")
else:
    print("Passt nicht")

def gesamt(x, y):
    return x + y
