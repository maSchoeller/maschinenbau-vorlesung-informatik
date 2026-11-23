import math

def moment(P, n):
    return P * 1000 / (2 * math.pi * n / 60)

def spannung(T, d):
    return T * 1000 / (math.pi * d ** 3 / 16)

def urteil(tau_vorh, tau_zul=40.0):
    if tau_vorh <= tau_zul:
        return "ok"
    else:
        return "zu hoch"

P = float(input("Leistung P in kW: "))
n = float(input("Drehzahl n in 1/min: "))
d = float(input("Durchmesser d in mm: "))
T = moment(P, n)
t = spannung(T, d)
print(f"Moment: {T:.1f} N·m")
print(f"Spannung: {t:.1f} MPa")
print(f"Urteil: {urteil(t)}")
