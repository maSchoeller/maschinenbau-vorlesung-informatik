def _pruefe(a, b, c, soll):
    z = zeilen(run_program([str(a), str(b), str(c)]))
    ergebnis = [l for l in z if l.lower() in ("ja", "nein")]
    assert len(ergebnis) == 1, "Bei den Tastern %s, %s, %s soll genau eine Zeile 'Ja' oder 'Nein' erscheinen. Dein Programm gibt aus:\n%s" % (a, b, c, ausgabe_text(z))
    assert ergebnis[0].lower() == soll.lower(), "Bei den Tastern %s, %s, %s soll '%s' herauskommen. Dein Programm gibt aus: '%s'" % (a, b, c, soll, ergebnis[0])

def test_keiner():
    """Grenzfall 0, 0, 0: Nein"""
    _pruefe(0, 0, 0, "Nein")

def test_alle():
    """Grenzfall 1, 1, 1: Nein (drei sind zu viel)"""
    _pruefe(1, 1, 1, "Nein")

def test_einer():
    """Einer gedrückt (1, 0, 0 und 0, 1, 0 und 0, 0, 1): Nein"""
    _pruefe(1, 0, 0, "Nein")
    _pruefe(0, 1, 0, "Nein")
    _pruefe(0, 0, 1, "Nein")

def test_zwei_a_b():
    """1, 1, 0: Ja"""
    _pruefe(1, 1, 0, "Ja")

def test_zwei_a_c():
    """1, 0, 1: Ja"""
    _pruefe(1, 0, 1, "Ja")

def test_zwei_b_c():
    """0, 1, 1: Ja"""
    _pruefe(0, 1, 1, "Ja")
