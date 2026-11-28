def stunden_bis_ueberlauf(n):
    werte = 1
    for i in range(1, n + 1):
        werte = werte * 2
    return werte / 3600

bit = int(input("Wie viele Bit? "))
stunden = stunden_bis_ueberlauf(bit)
print(f"Der Zähler springt auf 0 nach {stunden:.1f} Stunden")
