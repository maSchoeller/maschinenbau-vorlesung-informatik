def _pruefe(punkte, soll):
    z = zeilen(run_program([str(punkte)]))
    # Die Eingabeaufforderung beginnt mit Punkte: Es zählt die letzte Zeile, die mit Gesamt beginnt.
    kandidaten = [l for l in z if l.lower().startswith("gesamt")]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    w = zahlen(letzte)
    assert w and w[-1] == soll, "Bei %s Punkten soll 'Gesamt: %s' erscheinen. Dein Programm gibt aus: '%s'" % (punkte, soll, letzte)

def test_fuenfundzwanzig():
    """25 Punkte: Gesamt: 35"""
    _pruefe(25, 35)

def test_grenzfall_null():
    """Grenzfall 0 Punkte: Gesamt: 10"""
    _pruefe(0, 10)

def test_hundert():
    """100 Punkte: Gesamt: 110"""
    _pruefe(100, 110)

def test_sieben():
    """7 Punkte: Gesamt: 17"""
    _pruefe(7, 17)

def test_neunundachtzig():
    """89 Punkte: Gesamt: 99"""
    _pruefe(89, 99)
