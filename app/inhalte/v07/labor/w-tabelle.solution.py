import math

def schnittgeschwindigkeit(d, n):
    """Schnittgeschwindigkeit in m/min aus Durchmesser d in mm und Drehzahl n in 1/min."""
    return math.pi * d * n / 1000

print(schnittgeschwindigkeit(60, 1000))
