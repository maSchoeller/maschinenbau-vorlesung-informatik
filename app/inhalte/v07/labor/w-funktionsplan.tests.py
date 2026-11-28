def _pruefe(kmh, soll):
    z = zahlen(run_program([str(kmh)]))
    # Die Aufforderung enthält keine Zahl: Die letzte Zahl der Ausgabe ist das Ergebnis.
    assert z and abs(z[-1] - soll) < 0.05, "Bei %s km/h sollen %s m/s erscheinen. Dein Plan gibt zuletzt aus:\n%s" % (kmh, soll, ausgabe_text(z[-1:]))

def test_sechsunddreissig():
    """36 km/h sind 10.0 m/s"""
    _pruefe(36, 10.0)

def test_zweiundsiebzig():
    """72 km/h sind 20.0 m/s"""
    _pruefe(72, 20.0)

def test_neunzig():
    """90 km/h sind 25.0 m/s"""
    _pruefe(90, 25.0)

def test_grenzfall_null():
    """Grenzfall 0 km/h: 0.0 m/s"""
    _pruefe(0, 0.0)

def test_hundert():
    """100 km/h sind 27.8 m/s"""
    _pruefe(100, 27.8)

def test_zehn():
    """10 km/h sind 2.8 m/s"""
    _pruefe(10, 2.8)
