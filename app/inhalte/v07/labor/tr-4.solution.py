import math

def drehzahl(vc, d):
    """Drehzahl in 1/min aus Schnittgeschwindigkeit in m/min und Durchmesser in mm."""
    return vc * 1000 / (math.pi * d)

vc1 = 120.0
d1 = 30.0
n1 = drehzahl(vc1, d1)
print(f"d = {d1} mm, vc = {vc1} m/min: n = {n1:.1f} 1/min")

vc2 = 120.0
d2 = 50.0
n2 = drehzahl(vc2, d2)
print(f"d = {d2} mm, vc = {vc2} m/min: n = {n2:.1f} 1/min")

vc3 = 200.0
d3 = 80.0
n3 = drehzahl(vc3, d3)
print(f"d = {d3} mm, vc = {vc3} m/min: n = {n3:.1f} 1/min")
