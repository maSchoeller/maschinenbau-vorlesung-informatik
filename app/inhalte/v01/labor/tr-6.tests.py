def _pruefe(ziel, betrag, soll):
    z = zahlen(run_program([str(ziel), str(betrag)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei einem Ziel von %s Euro und %s Euro pro Woche sollen %s Wochen herauskommen. Dein Programm gibt aus: %r" % (ziel, betrag, soll, z)

def test_beispiel():
    """600 Euro Ziel, 25 Euro pro Woche: 24.0 Wochen"""
    _pruefe(600, 25, 24.0)

def test_kommazahl():
    """100 Euro Ziel, 8 Euro pro Woche: 12.5 Wochen"""
    _pruefe(100, 8, 12.5)
