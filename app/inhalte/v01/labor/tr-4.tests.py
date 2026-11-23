def _pruefe(stunden, lohn, soll):
    z = zahlen(run_program([str(stunden), str(lohn)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s Stunden zu %s Euro soll %s ausgegeben werden. Dein Programm gibt aus: %r" % (stunden, lohn, soll, z)

def test_beispiel():
    """12 Stunden zu 13.5 Euro: Verdienst 162.0"""
    _pruefe(12, 13.5, 162.0)

def test_andere_werte():
    """8 Stunden zu 15 Euro: Verdienst 120.0"""
    _pruefe(8, 15, 120.0)
