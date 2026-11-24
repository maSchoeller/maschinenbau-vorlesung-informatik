def _pruefe(a, b, c, soll):
    z = zeilen(run_program([str(a), str(b), str(c)]))
    letzte = z[-1] if z else ""
    erwartet = "Gewertet: %s" % soll
    assert letzte.lower() == erwartet.lower(), "Bei den Wertungen %s, %s und %s soll zuletzt '%s' stehen. Dein Programm gibt aus: '%s'" % (a, b, c, erwartet, letzte)

def test_beispiel():
    """7, 9 und 3: Gewertet: 7"""
    _pruefe(7, 9, 3, 7)

def test_jede_reihenfolge():
    """3, 7 und 9 in allen sechs Reihenfolgen: immer Gewertet: 7"""
    _pruefe(3, 7, 9, 7)
    _pruefe(3, 9, 7, 7)
    _pruefe(7, 3, 9, 7)
    _pruefe(7, 9, 3, 7)
    _pruefe(9, 3, 7, 7)
    _pruefe(9, 7, 3, 7)

def test_zwei_gleiche_unten():
    """Grenzfall zwei gleiche Wertungen: 5, 5 und 8 in jeder Reihenfolge ergeben Gewertet: 5"""
    _pruefe(5, 5, 8, 5)
    _pruefe(5, 8, 5, 5)
    _pruefe(8, 5, 5, 5)

def test_zwei_gleiche_oben():
    """Grenzfall zwei gleiche Wertungen: 8, 8 und 5 in jeder Reihenfolge ergeben Gewertet: 8"""
    _pruefe(8, 8, 5, 8)
    _pruefe(8, 5, 8, 8)
    _pruefe(5, 8, 8, 8)

def test_alle_gleich():
    """6, 6 und 6: Gewertet: 6"""
    _pruefe(6, 6, 6, 6)
