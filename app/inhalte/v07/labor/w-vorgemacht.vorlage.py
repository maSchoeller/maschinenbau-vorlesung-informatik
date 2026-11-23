# Wellen-Rechner aus Bausteinen: Torsionsspannung einer Getriebewelle
# (vereinfachte Lehr-Rechnung, nur Torsion, keine Normauslegung)
# (V07: def, Parameter, return, Default-Werte, Docstring, lokale Variablen)

import math


def torsionsmoment(P, n):
    """Torsionsmoment in N·m aus Leistung P in kW und Drehzahl n in 1/min."""
    omega = 2 * math.pi * n / 60      # Winkelgeschwindigkeit in 1/s
    return P * 1000 / omega           # kW -> W, dann T = P / omega


def widerstandsmoment(d):
    """Polares Widerstandsmoment in mm³ für eine Vollwelle mit Durchmesser d in mm."""
    return math.pi * d ** 3 / 16


def tau(T, d):
    """Torsionsspannung in N/mm² (= MPa) aus Moment T in N·m und Durchmesser d in mm."""
    return T * 1000 / widerstandsmoment(d)    # N·m -> N·mm


def pruefe(tau_vorh, tau_zul=40.0):
    """Gibt 'ok' oder 'zu hoch' zurück. tau_zul in MPa, Standard 40 MPa."""
    if tau_vorh <= tau_zul:
        return "ok"
    else:
        return "zu hoch"


T = torsionsmoment(15.0, 1450)        # Motor: 15 kW bei 1450 1/min
print(f"Torsionsmoment: {T:.1f} N·m")

for d in range(20, 35, 5):          # 20, 25, 30 mm
    t = tau(T, d)
    print(f"d = {d} mm: tau = {t:.1f} MPa -> {pruefe(t)}")

print("Mit tau_zul = 25 MPa:", pruefe(tau(T, 25), tau_zul=25.0))
