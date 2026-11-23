import math

def kreisflaeche(d):
    """Kreisfläche in mm² aus Durchmesser d in mm."""
    print(math.pi * d ** 2 / 4)

def druckkraft(p, d):
    """Kolbenkraft in N aus Druck p in bar und Kolbendurchmesser d in mm (1 bar = 0.1 N/mm²)."""
    return p * 0.1 * kreisflaeche(d)

print(druckkraft(6, 50))

