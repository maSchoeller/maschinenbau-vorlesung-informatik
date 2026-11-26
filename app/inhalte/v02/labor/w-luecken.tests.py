def _pruefe(geld, soll):
    z = [l.lower() for l in zeilen(run_program([str(geld)]))[-2:]]
    assert z == soll, "Bei %s Euro sollen zuletzt diese Zeilen erscheinen (Groß und Klein egal):\n%s\nDein Programm gibt aus:\n%s" % (geld, ausgabe_text(soll), ausgabe_text(z))

def test_genug():
    """2 Euro: Cola kommt, dann Danke"""
    _pruefe(2, ["cola kommt", "danke"])

def test_grenzfall():
    """Grenzfall 1.5 Euro: Cola kommt, dann Danke"""
    _pruefe(1.5, ["cola kommt", "danke"])

def test_zu_wenig():
    """1 Euro: Zu wenig Geld, dann Danke"""
    _pruefe(1, ["zu wenig geld", "danke"])
