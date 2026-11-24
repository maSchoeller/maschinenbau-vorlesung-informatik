def _pruefe(wert, km, soll):
    z = zeilen(run_program([str(wert), str(km)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei %s Euro und %s km soll zuletzt '%s' stehen. Dein Programm gibt aus: '%s'" % (wert, km, soll, letzte)

def test_beides_stimmt():
    """25 Euro, 3 km: Lieferung gratis"""
    _pruefe(25, 3, "Lieferung gratis")

def test_grenzfall():
    """Grenzfall 20 Euro, 5 km: Lieferung gratis"""
    _pruefe(20, 5, "Lieferung gratis")

def test_zu_wenig_bestellt():
    """15 Euro, 3 km: Lieferung 3 Euro"""
    _pruefe(15, 3, "Lieferung 3 Euro")

def test_zu_weit():
    """25 Euro, 8 km: Lieferung 3 Euro"""
    _pruefe(25, 8, "Lieferung 3 Euro")

def test_beides_falsch():
    """10 Euro, 10 km: Lieferung 3 Euro"""
    _pruefe(10, 10, "Lieferung 3 Euro")
