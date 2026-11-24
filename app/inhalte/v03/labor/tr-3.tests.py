def _pruefe(wurf, soll):
    z = zeilen(run_program([str(wurf)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei Wurf %s soll zuletzt '%s' stehen. Dein Programm gibt aus: '%s'" % (wurf, soll, letzte)

def test_eins():
    """Wurf 1: Nochmal würfeln"""
    _pruefe(1, "Nochmal würfeln")

def test_sechs():
    """Wurf 6: Nochmal würfeln"""
    _pruefe(6, "Nochmal würfeln")

def test_drei():
    """Wurf 3: Der Nächste ist dran"""
    _pruefe(3, "Der Nächste ist dran")
