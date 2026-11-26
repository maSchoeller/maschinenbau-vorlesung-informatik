def _pruefe(n, soll):
    z = zeilen(run_program([str(n)]))
    letzte = z[-1] if z else ""
    werte = zahlen(letzte)
    assert werte == [float(soll)], "Bei n = %s soll zuletzt %s stehen. Dein Programm gibt aus: '%s'" % (n, soll, letzte)

def test_vier():
    """n = 4: Summe 10"""
    _pruefe(4, 10)

def test_drei():
    """n = 3: Summe 6"""
    _pruefe(3, 6)

def test_grenzfall_eins():
    """Grenzfall n = 1: Summe 1 (der Rumpf läuft genau einmal)"""
    _pruefe(1, 1)

def test_grenzfall_null():
    """Grenzfall n = 0: Summe 0 (der Rumpf läuft nie)"""
    _pruefe(0, 0)

def test_zehn():
    """n = 10: Summe 55"""
    _pruefe(10, 55)
