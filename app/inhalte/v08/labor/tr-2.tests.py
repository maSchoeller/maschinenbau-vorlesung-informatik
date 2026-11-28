def _pruefe(n, soll):
    z = zeilen(run_program([str(n)]))
    # Die Eingabeaufforderung beginnt mit Bis: Es zählt die letzte Zeile, die mit Gerade beginnt.
    kandidaten = [l for l in z if l.lower().startswith("gerade")]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    w = zahlen(letzte)
    assert w and w[-1] == soll, "Bei n = %s soll 'Gerade Zahlen: %s' erscheinen. Dein Programm gibt aus: '%s'" % (n, soll, letzte)

def test_zehn():
    """n = 10: Gerade Zahlen: 5"""
    _pruefe(10, 5)

def test_sechs():
    """n = 6: Gerade Zahlen: 3, die 6 zählt mit"""
    _pruefe(6, 3)

def test_fuenf():
    """n = 5: Gerade Zahlen: 2, die 5 zählt nicht mit"""
    _pruefe(5, 2)

def test_grenzfall_eins():
    """Grenzfall n = 1: Gerade Zahlen: 0"""
    _pruefe(1, 0)

def test_zwei():
    """n = 2: Gerade Zahlen: 1"""
    _pruefe(2, 1)

def test_grenzfall_null():
    """Grenzfall n = 0: Gerade Zahlen: 0, die Schleife läuft nie"""
    _pruefe(0, 0)

def test_dreizehn():
    """n = 13: Gerade Zahlen: 6"""
    _pruefe(13, 6)
