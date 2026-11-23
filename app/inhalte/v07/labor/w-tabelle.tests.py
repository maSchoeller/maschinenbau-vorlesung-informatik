def _fn():
    assert "schnittgeschwindigkeit" in globals(), "Die Funktion schnittgeschwindigkeit ist nicht definiert. Beginne mit: def schnittgeschwindigkeit(d, n):"
    return globals()["schnittgeschwindigkeit"]

def _pruefe(d, n):
    f = _fn()
    erg = f(d, n)
    assert erg is not None, "Die Funktion gibt None zurück. Steht im Rumpf ein return? (Ein print gibt den Wert nur aus, zurückgegeben wird dabei nichts.)"
    soll = math.pi * d * n / 1000
    assert abs(erg - soll) < 0.01, "schnittgeschwindigkeit(%s, %s) soll %.2f liefern, deine Funktion liefert %r" % (d, n, soll, erg)

def test_beispiel():
    """schnittgeschwindigkeit(60, 1000) = 188.50 m/min"""
    _pruefe(60, 1000)

def test_zweites():
    """Anderer Wert: schnittgeschwindigkeit(25, 2000) = 157.08 m/min"""
    _pruefe(25, 2000)

def test_kommazahl():
    """Kommazahl: schnittgeschwindigkeit(12.5, 800) = 31.42 m/min"""
    _pruefe(12.5, 800)

def test_namen():
    """Aufruf mit Namen: schnittgeschwindigkeit(n=500, d=40) = 62.83 m/min"""
    f = _fn()
    erg = f(n=500, d=40)
    assert erg is not None and abs(erg - math.pi * 40 * 500 / 1000) < 0.01, "Mit Namen aufgerufen (n=500, d=40) soll 62.83 herauskommen. Heißen deine Parameter genau d und n?"
