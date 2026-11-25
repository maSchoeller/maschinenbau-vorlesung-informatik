def _pruefe(gross, klein, anzahl, soll):
    z = zeilen(run_program([str(gross), str(klein), str(anzahl)]))
    ist = " ".join(z[-1].lower().split()) if z else ""
    assert ist == soll.lower(), "Bei einer großen Pizza mit %s cm und %s kleinen mit je %s cm soll zuletzt '%s' erscheinen. Dein Programm gibt aus: %r" % (gross, anzahl, klein, soll, z)

def test_beispiel():
    """40 cm gegen 2 mal 25 cm: Die große Pizza ist 1.28-mal so viel wie die 2 kleinen"""
    _pruefe(40, 25, 2, "Die große Pizza ist 1.28-mal so viel wie die 2 kleinen")

def test_knapp():
    """32 cm gegen 2 mal 22 cm: Die große Pizza ist 1.06-mal so viel wie die 2 kleinen"""
    _pruefe(32, 22, 2, "Die große Pizza ist 1.06-mal so viel wie die 2 kleinen")

def test_grenzfall():
    """Grenzfall: 30 cm gegen 4 mal 15 cm, beide gleich viel: Die große Pizza ist 1.00-mal so viel wie die 4 kleinen"""
    _pruefe(30, 15, 4, "Die große Pizza ist 1.00-mal so viel wie die 4 kleinen")

def test_kleine_gewinnen():
    """28 cm gegen 2 mal 24 cm: Die 2 kleinen sind 1.47-mal so viel wie die große Pizza"""
    _pruefe(28, 24, 2, "Die 2 kleinen sind 1.47-mal so viel wie die große Pizza")

def test_kommazahl():
    """33 cm gegen 3 mal 16.5 cm: Die große Pizza ist 1.33-mal so viel wie die 3 kleinen"""
    _pruefe(33, 16.5, 3, "Die große Pizza ist 1.33-mal so viel wie die 3 kleinen")

def test_drei_kleine():
    """32 cm gegen 3 mal 20 cm: Die 3 kleinen sind 1.17-mal so viel wie die große Pizza"""
    _pruefe(32, 20, 3, "Die 3 kleinen sind 1.17-mal so viel wie die große Pizza")
