# Drehzahl aus Schnittgeschwindigkeit: die Rechnung steht dreimal da (kopiert).
# Aufräumen: Schreibe die Funktion drehzahl(vc, d) und ersetze die drei Kopien durch Aufrufe.
# Die Ausgabe darf sich nicht ändern.
import math

vc1 = 120.0
d1 = 30.0
n1 = vc1 * 1000 / (math.pi * d1)
print(f"d = {d1} mm, vc = {vc1} m/min: n = {n1:.1f} 1/min")

vc2 = 120.0
d2 = 50.0
n2 = vc2 * 1000 / (math.pi * d2)
print(f"d = {d2} mm, vc = {vc2} m/min: n = {n2:.1f} 1/min")

vc3 = 200.0
d3 = 80.0
n3 = vc3 * 1000 / (math.pi * d3)
print(f"d = {d3} mm, vc = {vc3} m/min: n = {n3:.1f} 1/min")

