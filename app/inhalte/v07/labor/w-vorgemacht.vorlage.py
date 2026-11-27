# Fahrenheit: Die Umrechnung steht in einer Funktion
def fahrenheit(c):
    grad = c * 9 / 5 + 32
    return grad

celsius = float(input("Grad Celsius: "))
fahr = fahrenheit(celsius)
print(f"{celsius:.1f} Grad Celsius sind {fahr:.1f} Grad Fahrenheit")
