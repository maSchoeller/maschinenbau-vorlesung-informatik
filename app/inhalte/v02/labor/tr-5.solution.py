geld = float(input("Dein Geld in Euro: "))
if geld >= 9.5:
    uebrig = geld - 9.5
    print(f"Übrig: {uebrig:.2f} Euro")
else:
    fehlt = 9.5 - geld
    print(f"Es fehlen {fehlt:.2f} Euro")
