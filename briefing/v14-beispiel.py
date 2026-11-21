# Bremsmessung darstellen: ehrliches Diagramm mit Achsen, Einheiten und Subplots
# (V14: matplotlib plot, Achsenbeschriftung mit Einheiten, Subplots)
# Datei: bremsen.csv (phyphox-Export, Semikolon, Dezimalkomma)

import csv
import matplotlib.pyplot as plt


def zahl(text):
    return float(text.replace(",", "."))


zeit = []
a_y = []
with open("bremsen.csv", encoding="utf-8") as datei:
    leser = csv.reader(datei, delimiter=";")
    next(leser)
    for zeile in leser:
        zeit.append(zahl(zeile[0]))
        a_y.append(zahl(zeile[2]))

# Geschwindigkeit durch Aufsummieren (Integration, Rechteckregel), Start 4,4 m/s (ca. 16 km/h)
dt = zeit[1] - zeit[0]
v = [4.4]
for a in a_y[1:]:
    v.append(v[-1] + a * dt)

fig, (oben, unten) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
oben.plot(zeit, a_y, color="#E2001A", linewidth=1)
oben.set_ylabel("Beschleunigung a in m/s²")
oben.set_title("Bremsen mit dem Fahrrad (phyphox)")
oben.axhline(0, color="gray", linewidth=0.8)
oben.grid(True, alpha=0.3)

unten.plot(zeit, v, color="black")
unten.set_xlabel("Zeit t in s")
unten.set_ylabel("Geschwindigkeit v in m/s")
unten.set_ylim(0, 5)              # ehrlich: Achse beginnt bei 0
unten.grid(True, alpha=0.3)

fig.tight_layout()
plt.show()

print(f"Größte Verzögerung: {min(a_y):.2f} m/s²")
print(f"Geschwindigkeit am Ende: {v[-1]:.2f} m/s")
