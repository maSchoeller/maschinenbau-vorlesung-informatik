def _pruefe(liter, preis, soll):
    z = zahlen(run_program([str(liter), str(preis)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s Litern zu %s Euro sollen %s Euro herauskommen. Dein Programm gibt aus: %r" % (liter, preis, soll, z)

def test_beispiel():
    """40 Liter zu 1.8 Euro: Kosten 72.0"""
    _pruefe(40, 1.8, 72.0)

def test_andere_werte():
    """10 Liter zu 2 Euro: Kosten 20.0"""
    _pruefe(10, 2, 20.0)
