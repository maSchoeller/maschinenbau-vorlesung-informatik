def _pruefe(tipp, soll):
    z = zeilen(run_program([str(tipp)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Beim Tipp %s soll zuletzt '%s' stehen. Dein Programm gibt aus: '%s'" % (tipp, soll, letzte)

def test_treffer():
    """Grenzfall Tipp 7: Treffer"""
    _pruefe(7, "Treffer")

def test_zu_niedrig():
    """Tipp 3: Zu niedrig"""
    _pruefe(3, "Zu niedrig")

def test_zu_hoch():
    """Tipp 9: Zu hoch"""
    _pruefe(9, "Zu hoch")
