n = int(input("Wie viele Personen? "))
anzahl = 0
for i in range(1, n + 1):
    for j in range(i + 1, n + 1):
        print(f"{i} und {j}")
        anzahl = anzahl + 1
print(f"Händedrücke: {anzahl}")
