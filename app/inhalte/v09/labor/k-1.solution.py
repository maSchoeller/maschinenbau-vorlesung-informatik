# Genau so addiert der Spielzeug-Rechner: Ein echter Prozessor hat zusätzlich einen Befehl für das Malnehmen.
def hoch(a, b):
    ergebnis = 1
    for i in range(b):
        neu = 0
        for j in range(a):
            neu = neu + ergebnis
        ergebnis = neu
    return ergebnis

a = int(input("Zahl: "))
b = int(input("Hoch: "))
print(f"{a} hoch {b} ist {hoch(a, b)}")
