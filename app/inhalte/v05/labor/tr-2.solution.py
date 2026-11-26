betrag = int(input("Betrag pro Monat in Euro: "))
monate = int(input("Wie viele Monate? "))
geld = 0
for i in range(1, monate + 1):
    geld = geld + betrag
    print(f"Monat {i}: {geld} Euro")
