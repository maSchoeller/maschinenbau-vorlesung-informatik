import random

wurf = random.randint(1, 6)
versuche = 0
tipp = 0
while tipp != wurf and versuche < 3:
    tipp = int(input("Dein Tipp (1 bis 6): "))
    versuche = versuche + 1
if tipp == wurf:
    print(f"Treffer, Versuche: {versuche}")
else:
    print(f"Verloren, es war {wurf}")
