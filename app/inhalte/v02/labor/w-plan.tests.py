def _pruefe(alter, soll):
    z = zahlen(run_program([str(alter)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei einem Alter von %s soll der Preis %s ausgegeben werden. Dein Plan gibt aus: %r" % (alter, soll, z)

def test_kind():
    """12 Jahre: Preis 3"""
    _pruefe(12, 3)

def test_unter_18():
    """17 Jahre: Preis 3"""
    _pruefe(17, 3)

def test_grenzfall():
    """Grenzfall 18 Jahre: Preis 5"""
    _pruefe(18, 5)

def test_erwachsen():
    """40 Jahre: Preis 5"""
    _pruefe(40, 5)
