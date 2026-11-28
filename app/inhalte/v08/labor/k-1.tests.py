def _pruefe(zahl, soll):
    z = zeilen(run_program([str(zahl)]))
    # Die Eingabeaufforderung enthält keine Zahl: Es zählt die letzte Zahl der Ausgabe.
    w = zahlen(z[-1]) if z else []
    letzte = z[-1] if z else ""
    assert w and w[-1] == soll, "Bei der Zahl %s soll 'Quersumme: %s' erscheinen. Dein Programm gibt zuletzt aus: '%s'" % (zahl, soll, letzte)

def test_eins_zwei_drei_vier():
    """1234: Quersumme 10"""
    _pruefe(1234, 10)

def test_viermal_neun():
    """9999: Quersumme 36"""
    _pruefe(9999, 36)

def test_einstellig():
    """7: Quersumme 7"""
    _pruefe(7, 7)

def test_grenzfall_null():
    """Grenzfall 0: Quersumme 0, die Schleife läuft nie"""
    _pruefe(0, 0)

def test_nullen_am_ende():
    """1000: Quersumme 1, Nullen am Ende zählen nichts"""
    _pruefe(1000, 1)

def test_achtundneunzigtausend():
    """98765: Quersumme 35"""
    _pruefe(98765, 35)

def test_fuenfstellig_neun():
    """99999: Quersumme 45"""
    _pruefe(99999, 45)
