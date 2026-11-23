def _fn():
    assert "wurzel" in globals(), "Die Funktion wurzel ist nicht definiert."
    return globals()["wurzel"]

def test_zwei():
    """wurzel(2) = 1.41421356"""
    erg = _fn()(2)
    assert erg is not None, "wurzel gibt None zurück: return nach der Schleife (nicht in der Schleife!)?"
    assert abs(erg - 2 ** 0.5) < 1e-8, "wurzel(2) soll 1.41421356 liefern, deine Funktion liefert %r" % (erg,)

def test_neun():
    """wurzel(9) = 3.0"""
    erg = _fn()(9)
    assert erg is not None and abs(erg - 3.0) < 1e-8, "wurzel(9) soll 3.0 liefern, deine Funktion liefert %r" % (erg,)

def test_klein():
    """Eine Zahl kleiner als 1: wurzel(0.25) = 0.5"""
    erg = _fn()(0.25)
    assert erg is not None and abs(erg - 0.5) < 1e-8, "wurzel(0.25) soll 0.5 liefern, deine Funktion liefert %r" % (erg,)

def test_toleranz():
    """Mit grober Toleranz: Der Rest |x*x - a| ist höchstens tol (wurzel(10, 0.01))"""
    erg = _fn()(10, 0.01)
    assert erg is not None and abs(erg * erg - 10) <= 0.01, "Mit tol = 0.01 muss abs(x * x - 10) höchstens 0.01 sein. Deine Funktion liefert %r" % (erg,)

def test_toleranz_namen():
    """tol beim Namen: wurzel(2, tol=1e-12)"""
    erg = _fn()(2, tol=1e-12)
    assert erg is not None and abs(erg * erg - 2) <= 1e-12, "Mit tol = 1e-12 muss abs(x * x - 2) höchstens 1e-12 sein. Deine Funktion liefert %r" % (erg,)
