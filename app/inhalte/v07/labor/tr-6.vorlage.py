import math

def torsionsmoment(P, n):
    """Moment in N·m aus Leistung P in kW und Drehzahl n in 1/min."""
    return P * 1000 / (2 * math.pi * n / 60)

def widerstandsmoment(d):
    """Polares Widerstandsmoment in mm³ einer Vollwelle."""
    return math.pi * d ** 3 / 16

def tau(T, d):
    """Torsionsspannung in MPa aus Moment in N·m und Durchmesser in mm."""
    return T * 1000 / widerstandsmoment(d)

def pruefe(tau_vorh, tau_zul=40.0):
    """Gibt 'ok' oder 'zu hoch' zurück."""
    if tau_vorh <= tau_zul:
        return "ok"
    else:
        return "zu hoch"

# Schreibe wellenpruefung(P, n, d, tau_zul=40.0). Sie benutzt die vier Funktionen oben
# und gibt EINEN Text zurück, zum Beispiel "18.6 MPa: ok" (Spannung mit einer Nachkommastelle).

