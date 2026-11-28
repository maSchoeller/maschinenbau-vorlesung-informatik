grenze = int(input("Grenze: "))
anzahl = 0
for a in range(1, grenze + 1):
    for b in range(a + 1, grenze + 1):
        for c in range(b + 1, grenze + 1):
            if a * a + b * b == c * c:
                print(f"{a} {b} {c}")
                anzahl = anzahl + 1
print(f"Tripel: {anzahl}")
