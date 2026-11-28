def _pruefe(geheim, tipp, soll):
    z, aufrufe = mit_zufall([geheim], [tipp])
    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100)."
    ist = [l for l in z if l.lower() in ("zu klein", "zu groß", "richtig!")]
    assert [l.lower() for l in ist] == [soll.lower()], "Bei der Zahl %s und dem Tipp %s soll '%s' erscheinen. Dein Programm gibt aus:\n%s" % (geheim, tipp, soll, ausgabe_text(ist))

def test_zu_klein():
    """Zahl 42, Tipp 30: Zu klein"""
    _pruefe(42, 30, "Zu klein")

def test_zu_gross():
    """Zahl 42, Tipp 77: Zu groß"""
    _pruefe(42, 77, "Zu groß")

def test_richtig():
    """Zahl 42, Tipp 42: Richtig!"""
    _pruefe(42, 42, "Richtig!")

def test_grenzfall_eins():
    """Grenzfall Zahl 1, Tipp 1: Richtig!"""
    _pruefe(1, 1, "Richtig!")

def test_grenzfall_hundert_gegen_eins():
    """Grenzfall Zahl 100, Tipp 1: Zu klein"""
    _pruefe(100, 1, "Zu klein")

def test_grenzfall_eins_gegen_hundert():
    """Grenzfall Zahl 1, Tipp 100: Zu groß, der letzte Wert wechselt die Richtung"""
    _pruefe(1, 100, "Zu groß")
