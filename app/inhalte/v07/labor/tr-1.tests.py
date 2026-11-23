def _fn():
    assert "masse_zylinder" in globals(), "Die Funktion masse_zylinder ist nicht definiert."
    return globals()["masse_zylinder"]

def _soll(d, l, rho=7.85):
    return math.pi * d ** 2 / 4 * l / 1e6 * rho

def test_beispiel():
    """masse_zylinder(30, 200) = 1.11 kg (Stahl)"""
    erg = _fn()(30, 200)
    assert erg is not None, "Die Funktion gibt None zurück: return statt print?"
    assert abs(erg - _soll(30, 200)) < 0.001, "masse_zylinder(30, 200) soll %.3f liefern, deine Funktion liefert %r" % (_soll(30, 200), erg)

def test_default():
    """Ohne rho gilt 7.85, mit rho=2.7 (Aluminium) kommt weniger heraus"""
    f = _fn()
    erg = f(30, 200, 2.7)
    assert erg is not None and abs(erg - _soll(30, 200, 2.7)) < 0.001, "masse_zylinder(30, 200, 2.7) soll %.3f liefern, deine Funktion liefert %r" % (_soll(30, 200, 2.7), erg)

def test_namen():
    """Aufruf mit Namen: masse_zylinder(l=100, d=50, rho=2.7)"""
    erg = _fn()(l=100, d=50, rho=2.7)
    assert erg is not None and abs(erg - _soll(50, 100, 2.7)) < 0.001, "Mit Namen soll %.3f herauskommen, deine Funktion liefert %r" % (_soll(50, 100, 2.7), erg)

def test_ausgabe():
    """Die Funktion gibt selbst nichts aus (nur return)"""
    erg = _fn()(10, 10)
    assert isinstance(erg, float), "Die Funktion soll eine Kommazahl zurückgeben, nicht %r" % (erg,)
