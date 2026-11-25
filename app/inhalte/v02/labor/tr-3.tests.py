def _pruefe(tipp, soll):
    z = zeilen(run_program([str(tipp)]))
    ist = z[-1].lower() if z else ""
    assert ist == soll.lower(), "Beim Tipp %s soll zuletzt '%s' erscheinen. Dein Programm gibt aus: %r" % (tipp, soll, z)

def test_treffer():
    """Grenzfall Tipp 7: Treffer"""
    _pruefe(7, "Treffer")

def test_daneben():
    """Tipp 3: Daneben"""
    _pruefe(3, "Daneben")

def test_daneben_darueber():
    """Tipp 9: Daneben (über dem geheimen Wert)"""
    _pruefe(9, "Daneben")

def test_daneben_knapp():
    """Tipp 6: Daneben (knapp darunter)"""
    _pruefe(6, "Daneben")
