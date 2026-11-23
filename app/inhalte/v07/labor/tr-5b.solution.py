import math

def schnittgeschwindigkeit(d, n):
    """vc in m/min aus Durchmesser d in mm und Drehzahl n in 1/min."""
    return math.pi * d * n / 1000

d = float(input("d in mm: "))
n = float(input("n in 1/min: "))
vc = schnittgeschwindigkeit(d, n)
if vc > 250:
    print("zu schnell")
else:
    print(f"vc = {vc:.2f} m/min")
