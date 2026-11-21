# Prüfprotokoll: Zugspannung in einem Rundstab
# (V01: print, Variablen, Kommentare, input – Zahlen sind noch fest im Code)

pruefer = input("Name der Prüferin / des Prüfers: ")
bauteil = input("Bauteil-Bezeichnung: ")

kraft_n = 12000          # Zugkraft F in N
durchmesser_mm = 10      # Durchmesser d in mm
pi = 3.14159             # Näherung für Pi

flaeche_mm2 = pi * durchmesser_mm * durchmesser_mm / 4   # A = pi * d * d / 4
spannung_mpa = kraft_n / flaeche_mm2                      # sigma = F / A in N/mm² = MPa

print("Prüfprotokoll Zugstab")
print("Prüfer:", pruefer)
print("Bauteil:", bauteil)
print("Querschnitt A in mm²:", flaeche_mm2)
print("Spannung in MPa:", spannung_mpa)
