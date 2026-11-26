druck = int(input("Hydraulikdruck in bar: "))
fehler = 0
while druck < 150 or druck > 210:
    fehler = fehler + 1
    druck = int(input("Außerhalb von 150 bis 210 bar. Nochmal: "))
print(f"Druck ok: {druck} bar, Fehlversuche: {fehler}")
