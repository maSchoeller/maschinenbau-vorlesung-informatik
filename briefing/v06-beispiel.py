# Abkühlung eines Werkstücks nach dem Härten (Newtonsches Abkühlungsgesetz)
# (V06: while, for, range, Zähler und Summen)

temperatur = 850.0      # °C direkt nach dem Ofen
umgebung = 20.0         # °C Hallentemperatur
k = 0.08                # Abkühlkonstante pro Minute
ziel = 60.0             # ab hier darf das Teil weiterbearbeitet werden

minuten = 0
while temperatur > ziel:
    temperatur = temperatur - k * (temperatur - umgebung)
    minuten = minuten + 1

print(f"Nach {minuten} Minuten: {temperatur:.1f} °C")

# Tabelle für die ersten 5 Minuten mit for und range
t = 850.0
summe = 0.0
for minute in range(1, 6):
    t = t - k * (t - umgebung)
    summe = summe + t
    print(f"Minute {minute}: {t:6.1f} °C")
print(f"Mittelwert der ersten 5 Minuten: {summe / 5:.1f} °C")
