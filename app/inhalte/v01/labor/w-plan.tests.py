def _pruefe(anzahl, preis, soll):
    z = zahlen(run_program([str(anzahl), str(preis)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s Flaschen zu %s Euro soll %s ausgegeben werden. Dein Plan gibt aus: %r" % (anzahl, preis, soll, z)

def test_beispiel():
    """6 Flaschen zu 1.5 Euro: Gesamtpreis 9.0"""
    _pruefe(6, 1.5, 9.0)

def test_andere_werte():
    """10 Flaschen zu 0.8 Euro: Gesamtpreis 8.0"""
    _pruefe(10, 0.8, 8.0)
