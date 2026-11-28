# Kino: Wie viele Plätze sind belegt?
reihen = int(input("Wie viele Reihen? "))
plaetze = int(input("Wie viele Plätze je Reihe? "))
belegt = 0
for i in range(1, reihen + 1):
    for j in range(1, plaetze + 1):
        platz = int(input(f"Reihe {i}, Platz {j} (1 belegt, 0 frei): "))
        if platz == 1:
            belegt = belegt + 1
gesamt = reihen * plaetze
print(f"Belegt: {belegt} von {gesamt}")
