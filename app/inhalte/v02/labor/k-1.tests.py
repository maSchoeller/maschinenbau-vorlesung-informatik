def _pruefe(vorsprung, anna, ben, soll):
    z = zeilen(run_program([str(vorsprung), str(anna), str(ben)]))
    ist = " ".join(z[-1].lower().split()) if z else ""
    assert ist == soll.lower(), "Bei %s m Vorsprung, Anna mit %s m/s und Ben mit %s m/s soll zuletzt '%s' erscheinen. Dein Programm gibt aus: %r" % (vorsprung, anna, ben, soll, z)

def test_beispiel():
    """10 m Vorsprung, Anna 4 m/s, Ben 5 m/s: Ben gewinnt, 2.50 Sekunden vor Anna"""
    _pruefe(10, 4, 5, "Ben gewinnt, 2.50 Sekunden vor Anna")

def test_schneller_verliert():
    """30 m Vorsprung, Anna 4 m/s, Ben 5 m/s: Anna gewinnt, 2.50 Sekunden vor Ben"""
    _pruefe(30, 4, 5, "Anna gewinnt, 2.50 Sekunden vor Ben")

def test_grenzfall():
    """Grenzfall: 20 m Vorsprung, Anna 4 m/s, Ben 5 m/s, beide brauchen 20 Sekunden: Anna gewinnt, 0.00 Sekunden vor Ben"""
    _pruefe(20, 4, 5, "Anna gewinnt, 0.00 Sekunden vor Ben")

def test_ohne_vorsprung():
    """0 m Vorsprung, Anna 5 m/s, Ben 4 m/s: Anna gewinnt, 5.00 Sekunden vor Ben"""
    _pruefe(0, 5, 4, "Anna gewinnt, 5.00 Sekunden vor Ben")

def test_grosser_vorsprung():
    """50 m Vorsprung, Anna 2 m/s, Ben 8 m/s: Ben gewinnt, 12.50 Sekunden vor Anna"""
    _pruefe(50, 2, 8, "Ben gewinnt, 12.50 Sekunden vor Anna")
