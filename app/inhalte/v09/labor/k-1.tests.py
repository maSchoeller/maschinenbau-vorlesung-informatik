def _pruefe(a, b):
    soll = a ** b
    z = zeilen(run_program([str(a), str(b)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and w[-1] == soll, "Bei %s und %s soll am Ende %s stehen, zum Beispiel '%s hoch %s ist %s'. Dein Programm gibt zuletzt aus: '%s'" % (a, b, soll, a, b, soll, letzte)

def test_zwei_hoch_zehn():
    """2 und 10: 1024"""
    _pruefe(2, 10)

def test_drei_hoch_vier():
    """3 und 4: 81"""
    _pruefe(3, 4)

def test_grenzfall_hoch_null():
    """Grenzfall 5 und 0: 1"""
    _pruefe(5, 0)

def test_grenzfall_null_hoch():
    """Grenzfall 0 und 3: 0"""
    _pruefe(0, 3)

def test_hoch_eins():
    """7 und 1: 7"""
    _pruefe(7, 1)

def test_zehn_hoch_drei():
    """10 und 3: 1000"""
    _pruefe(10, 3)

def test_neun_hoch_fuenf():
    """9 und 5: 59049, der letzte Wert ändert das Ergebnis"""
    _pruefe(9, 5)
