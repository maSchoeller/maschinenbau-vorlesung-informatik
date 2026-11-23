def _pruefe(kmh, soll):
    z = zahlen(run_program([str(kmh)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s km/h sollen %s m/s herauskommen. Dein Programm gibt aus: %r" % (kmh, soll, z)

def test_beispiel():
    """90 km/h sind 25.0 m/s"""
    _pruefe(90, 25.0)

def test_stadt():
    """36 km/h sind 10.0 m/s"""
    _pruefe(36, 10.0)

def test_stillstand():
    """0 km/h sind 0.0 m/s"""
    _pruefe(0, 0.0)
