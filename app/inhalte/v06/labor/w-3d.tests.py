import bauteil3d as _b

# Sollwerte der facettierten Säule (48 Ecken): 2349,46 mm3 je Säule, nicht pi * r * r * l
_SAEULE = _b.volumen(_b.zylinder(10, 30))

def _reihe():
    assert "reihe" in globals() and isinstance(reihe, dict) and "vertices" in reihe, "Das Programm braucht die Variable reihe mit dem Körper. Steht reihe = zylinder(10, 30) noch im Programm?"
    return reihe

def test_abmessungen():
    """Die Reihe misst 110 x 10 x 30 mm: erste Säule bei x = 0, letzte bei x = 100"""
    b = _b.abmessungen(_reihe())
    if abs(b[0] - 85) <= 0.5:
        raise AssertionError("Die Reihe ist nur %.1f mm breit, es sollen 110 mm sein. Es fehlt eine Säule am Ende. Der Stoppwert gehört nicht dazu." % b[0])
    assert abs(b[0] - 110) <= 0.5, "Die Reihe soll 110 mm breit sein (Säule bei x = 0 bis Säule bei x = 100, jede 10 mm dick). Deine Reihe ist %.1f mm breit." % b[0]
    assert abs(b[1] - 10) <= 0.5 and abs(b[2] - 30) <= 0.5, "Tiefe und Höhe sollen 10 mm und 30 mm sein. Deine Reihe misst %.1f und %.1f mm." % (b[1], b[2])

def test_erste_saeule_bei_null():
    """Die Reihe beginnt mit der Säule bei x = 0 und endet mit der Säule bei x = 100"""
    xs = [p[0] for p in _reihe()["vertices"]]
    assert abs(min(xs) + 5) <= 0.5, "Die linke Kante soll bei x = -5 mm liegen (die erste Säule steht bei x = 0). Bei dir liegt sie bei x = %.1f mm." % min(xs)
    assert abs(max(xs) - 105) <= 0.5, "Die rechte Kante soll bei x = 105 mm liegen (die letzte Säule steht bei x = 100). Bei dir liegt sie bei x = %.1f mm." % max(xs)

def test_volumen():
    """Fünf Säulen: das Volumen ist das Fünffache einer Säule, rund 11747 mm3"""
    v = _b.volumen(_reihe())
    soll = 5 * _SAEULE
    if abs(v - 6 * _SAEULE) <= 0.01 * soll:
        raise AssertionError("Zwei Säulen stehen am selben Platz. Prüf, bei welchen x die Schleife die Säulen setzt: Die erste steht schon bei 0.")
    assert abs(v - soll) <= 0.01 * soll, "Fünf Säulen haben zusammen rund %.0f mm3. Deine Reihe hat %.0f mm3. Wie viele Säulen stehen in der Reihe?" % (soll, v)
