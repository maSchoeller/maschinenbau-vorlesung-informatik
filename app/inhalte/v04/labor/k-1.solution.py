# Streichholzspiel für zwei: 12 Hölzer, wer das letzte nimmt, verliert.
hoelzer = 12
spieler = 1
while hoelzer > 0:
    nimm = int(input(f"Spieler {spieler}, wie viele Hölzer (1 bis 3)? "))
    while nimm < 1 or nimm > 3 or nimm > hoelzer:
        nimm = int(input(f"Ungültig, es sind noch {hoelzer} da. Nochmal (1 bis 3): "))
    hoelzer = hoelzer - nimm
    spieler = 3 - spieler
print(f"Spieler {3 - spieler} nimmt das letzte Holz und verliert")
