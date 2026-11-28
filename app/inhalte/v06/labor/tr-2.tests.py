def _pruefe(summe, soll):
    z = zeilen(run_program([str(summe)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == ("Paare: %d" % soll).lower(), "Bei der Augensumme %s soll zuletzt 'Paare: %d' stehen. Dein Programm gibt zuletzt aus: '%s'" % (summe, soll, letzte)

def test_sieben():
    """Summe 7: Paare: 6"""
    _pruefe(7, 6)

def test_zwoelf_beide_grenzen():
    """Summe 12: Paare: 1, nur 6 und 6, beide Schleifen laufen bis 6"""
    _pruefe(12, 1)

def test_zwei():
    """Summe 2: Paare: 1, nur 1 und 1"""
    _pruefe(2, 1)

def test_acht():
    """Summe 8: Paare: 5"""
    _pruefe(8, 5)

def test_grenzfall_dreizehn():
    """Grenzfall Summe 13: Paare: 0, kein Paar"""
    _pruefe(13, 0)

def test_grenzfall_eins():
    """Grenzfall Summe 1: Paare: 0, die kleinste Summe ist 2"""
    _pruefe(1, 0)
