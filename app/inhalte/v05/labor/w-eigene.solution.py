n = int(input("Wie viele Würfe? "))
sechsen = 0
for i in range(1, n + 1):
    wurf = int(input(f"Wurf {i}: "))
    if wurf == 6:
        sechsen = sechsen + 1
print(f"Sechsen: {sechsen}")
