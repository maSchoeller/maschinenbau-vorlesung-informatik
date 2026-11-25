# Punkteschnitt: Wie viele Punkte brauchst du in der nächsten Runde?
runden = int(input("Bisher gespielte Runden: "))
schnitt = float(input("Bisheriger Schnitt: "))
ziel = float(input("Gewünschter Schnitt: "))
bisher = runden * schnitt
noetig = ziel * (runden + 1) - bisher
print("Nötig in der nächsten Runde:", noetig)
