import bauteil3d as _b

def _mass(d, l):
    assert "schraube" in globals() and callable(schraube), "Die Funktion schraube(d, l) fehlt. Steht def schraube(d, l): im Programm?"
    k = schraube(d, l)
    assert isinstance(k, dict) and "vertices" in k, "schraube(%s, %s) soll einen Körper zurückgeben. Steht in der Funktion return vereinige(kopf, schaft)?" % (d, l)
    return k, _b.abmessungen(k)

def _gleich(ist, soll):
    return abs(ist - soll) <= 0.5

def test_gross():
    """schraube(10, 40) misst 20 x 20 x 50 mm: Kopf 20 breit und 10 hoch, Schaft 40 lang darauf"""
    k, b = _mass(10, 40)
    if _gleich(b[0], 80) and _gleich(b[2], 50):
        raise AssertionError("Die Schraube misst 80 x 80 x 50 mm. Der erste Parameter ist der Durchmesser, der zweite die Länge.")
    if _gleich(b[0], 20) and _gleich(b[2], 40):
        raise AssertionError("Der Schaft steckt im Kopf, die Schraube ist nur 40 mm hoch. Er muss um die Kopfhöhe d nach oben.")
    if _gleich(b[0], 25) and _gleich(b[2], 40):
        raise AssertionError("Der Schaft ist zur Seite geschoben. Er muss nach oben: verschiebe(…, 0, 0, d).")
    assert _gleich(b[0], 20) and _gleich(b[1], 20) and _gleich(b[2], 50), "schraube(10, 40) soll 20 x 20 x 50 mm messen (Kopf 20 mm breit und 10 mm hoch, Schaft 40 mm lang). Deine Schraube misst %.1f x %.1f x %.1f mm." % b

def test_mittel():
    """schraube(6, 25) misst 12 x 12 x 31 mm: die Parameter wirken"""
    k, b = _mass(6, 25)
    assert _gleich(b[0], 12) and _gleich(b[1], 12) and _gleich(b[2], 31), "schraube(6, 25) soll 12 x 12 x 31 mm messen. Deine Schraube misst %.1f x %.1f x %.1f mm. Stehen in der Funktion feste Zahlen statt d und l?" % b

def test_grenzfall_klein():
    """Grenzfall schraube(4, 10): die kleinste Schraube misst 8 x 8 x 14 mm"""
    k, b = _mass(4, 10)
    assert _gleich(b[0], 8) and _gleich(b[1], 8) and _gleich(b[2], 14), "schraube(4, 10) soll 8 x 8 x 14 mm messen. Deine Schraube misst %.1f x %.1f x %.1f mm." % b

def test_volumen():
    """Volumen von schraube(10, 40): Kopf und Schaft haben je rund 3133 mm3, zusammen rund 6265 mm3"""
    k, b = _mass(10, 40)
    soll = _b.volumen(_b.zylinder(20, 10)) + _b.volumen(_b.zylinder(10, 40))
    v = _b.volumen(k)
    assert abs(v - soll) <= 0.01 * soll, "Kopf und Schaft haben zusammen rund %.0f mm3. Deine Schraube hat %.0f mm3. Ist der Kopf doppelt so breit wie der Schaft und so hoch, wie der Schaft breit ist?" % (soll, v)
