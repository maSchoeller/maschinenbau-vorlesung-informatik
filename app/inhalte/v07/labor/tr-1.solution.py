import math

def masse_zylinder(d, l, rho=7.85):
    volumen = math.pi * d ** 2 / 4 * l / 1e6
    return volumen * rho

print(masse_zylinder(30, 200))
