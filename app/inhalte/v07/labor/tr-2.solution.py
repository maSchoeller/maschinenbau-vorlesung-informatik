def zeige(nr, wert):
    print(f"Blatt {nr}: {wert} Punkte")

n = int(input("Wie viele Blätter? "))
for i in range(1, n + 1):
    punkte = int(input(f"Punkte Blatt {i}: "))
    zeige(i, punkte)
