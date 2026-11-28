def volumen(r, h):
    return 3.14 * r * r * h

radius = float(input("Radius in cm: "))
hoehe = float(input("Höhe in cm: "))
v = volumen(radius, hoehe)
print(f"Volumen: {v:.1f} cm³")
