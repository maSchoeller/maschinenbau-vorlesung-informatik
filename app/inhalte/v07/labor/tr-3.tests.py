def _fn():
    assert "toleranz_ok" in globals(), "Die Funktion toleranz_ok ist nicht definiert."
    return globals()["toleranz_ok"]

def _ist(mass, nenn, tol, soll):
    erg = _fn()(mass, nenn, tol)
    assert erg is not None, "toleranz_ok gibt None zurück. Jeder Zweig braucht ein return."
    assert erg == soll and isinstance(erg, bool), "toleranz_ok(%s, %s, %s) soll %s liefern, deine Funktion liefert %r" % (mass, nenn, tol, soll, erg)

def test_gut():
    """25.03 liegt in der Toleranz: True"""
    _ist(25.03, 25.0, 0.05, True)

def test_zu_gross():
    """25.1 ist zu groß: False"""
    _ist(25.1, 25.0, 0.05, False)

def test_zu_klein():
    """24.9 ist zu klein: False (auch die untere Grenze zählt)"""
    _ist(24.9, 25.0, 0.05, False)

def test_unten_gut():
    """24.96 liegt knapp unter dem Nennmaß, aber in Toleranz: True"""
    _ist(24.96, 25.0, 0.05, True)

def test_andere_werte():
    """Anderes Nennmaß: 40.2 bei 40 mit tol 0.1 ist False, 40.05 ist True"""
    _ist(40.2, 40.0, 0.1, False)
    _ist(40.05, 40.0, 0.1, True)
