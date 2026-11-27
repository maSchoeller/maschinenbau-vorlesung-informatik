# Prüft, ob zwei Preise zusammen genau 0.30 Euro kosten.
def gesamt(x, y):
    return x + y

a = float(input("Preis 1: "))
b = float(input("Preis 2: "))
if round(gesamt(a, b), 2) == 0.3:
    print("Passt")
else:
    print("Passt nicht")
