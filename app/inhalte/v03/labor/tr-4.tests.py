def _pruefe(tempo, soll):
    z = zeilen(run_program([str(tempo)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei %s km/h soll zuletzt '%s' stehen. Dein Programm gibt aus: '%s'" % (tempo, soll, letzte)

def test_80():
    """80 km/h: Bußgeld"""
    _pruefe(80, "Bußgeld")

def test_71():
    """71 km/h: Bußgeld"""
    _pruefe(71, "Bußgeld")

def test_grenzfall_70():
    """Grenzfall 70 km/h: Verwarnung"""
    _pruefe(70, "Verwarnung")

def test_60():
    """60 km/h: Verwarnung"""
    _pruefe(60, "Verwarnung")

def test_grenzfall_50():
    """Grenzfall 50 km/h: Alles in Ordnung"""
    _pruefe(50, "Alles in Ordnung")
