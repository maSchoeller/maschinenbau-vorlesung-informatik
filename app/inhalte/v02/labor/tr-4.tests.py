def _pruefe(groesse, soll):
    z = zeilen(run_program([str(groesse)]))
    ist = z[-1].lower() if z else ""
    assert ist == soll.lower(), "Bei %s cm soll zuletzt '%s' erscheinen. Dein Programm gibt aus:\n%s" % (groesse, soll, ausgabe_text(z))

def test_grenzfall():
    """Grenzfall 140 cm: Einsteigen"""
    _pruefe(140, "Einsteigen")

def test_zu_klein():
    """139 cm: Leider zu klein"""
    _pruefe(139, "Leider zu klein")

def test_gross():
    """150 cm: Einsteigen"""
    _pruefe(150, "Einsteigen")
