# Wettlauf mit Vorsprung: Die Strecke ist 100 Meter lang.
vorsprung = float(input("Vorsprung von Anna in Metern: "))
anna = float(input("Tempo von Anna in m/s: "))
ben = float(input("Tempo von Ben in m/s: "))
zeit_anna = (100 - vorsprung) / anna
zeit_ben = 100 / ben
if zeit_ben < zeit_anna:
    abstand = zeit_anna - zeit_ben
    print(f"Ben gewinnt, {abstand:.2f} Sekunden vor Anna")
else:
    abstand = zeit_ben - zeit_anna
    print(f"Anna gewinnt, {abstand:.2f} Sekunden vor Ben")
