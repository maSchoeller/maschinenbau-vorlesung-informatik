def _pruefe(alter, soll):
    z = zeilen(run_program([str(alter)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.01, "Bei Alter %s soll der Preis %s ausgegeben werden. Dein Plan gibt zuletzt aus: %r" % (alter, soll, letzte)

def test_kind():
    """Alter 4: Preis 0"""
    _pruefe(4, 0)

def test_grenzfall_6():
    """Grenzfall Alter 6: Preis 3"""
    _pruefe(6, 3)

def test_jugend():
    """Alter 17: Preis 3"""
    _pruefe(17, 3)

def test_grenzfall_18():
    """Grenzfall Alter 18: Preis 5"""
    _pruefe(18, 5)

def test_erwachsen():
    """Alter 40: Preis 5"""
    _pruefe(40, 5)
