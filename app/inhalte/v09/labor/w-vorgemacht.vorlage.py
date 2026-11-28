# Getränkeautomat: 1 = Cola, 2 = Wasser, 3 = Saft
def preis_von(nr):
    if nr == 1:
        return 2.5
    elif nr == 2:
        return 1.0
    else:
        return 2.0

def antwort(geld, preis):
    if geld >= preis:
        rest = geld - preis
        return f"Bitte sehr. Wechselgeld: {rest:.2f} Euro"
    else:
        fehlt = preis - geld
        return f"Es fehlen {fehlt:.2f} Euro"

wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))
geld = float(input("Geld in Euro: "))
preis = preis_von(wahl)
print(antwort(geld, preis))
