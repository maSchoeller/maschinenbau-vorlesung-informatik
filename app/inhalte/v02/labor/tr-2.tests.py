def _pruefe(gewicht, soll):
    z = zahlen(run_program([str(gewicht)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s kg soll das Porto %s ausgegeben werden. Dein Plan gibt aus: %r" % (gewicht, soll, z)

def test_leicht():
    """0.5 kg: Porto 5"""
    _pruefe(0.5, 5)

def test_grenzfall():
    """Grenzfall 2 kg: Porto 5"""
    _pruefe(2, 5)

def test_knapp_drueber():
    """2.5 kg: Porto 7"""
    _pruefe(2.5, 7)

def test_schwer():
    """10 kg: Porto 7"""
    _pruefe(10, 7)
