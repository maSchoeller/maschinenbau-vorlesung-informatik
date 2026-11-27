HINWEISE = ("zu klein", "zu groß", "richtig!")

def _lauf(werte, eingaben):
    try:
        return mit_zufall(werte, eingaben)
    except AssertionError as e:
        t = str(e)
        if "name 'geheim' is not defined" in t:
            raise AssertionError("geheim braucht vor der Schleife einen Wert: Zieh die Zahl vor while.\n" + t)
        if "name 'geraten' is not defined" in t:
            raise AssertionError("geraten braucht vor der Schleife einen Startwert: Setz es vor while auf 0.\n" + t)
        if "name 'versuche' is not defined" in t:
            raise AssertionError("versuche braucht vor der Schleife den Startwert 0.\n" + t)
        if "EOFError" in t:
            raise AssertionError("Dein Programm hat mehr Eingaben verlangt als vorgesehen: Wird die Zahl wirklich nur einmal gezogen?\n" + t)
        raise

def _einmal(aufrufe):
    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100), und zwar vor der Schleife. Dein Programm hat randint %s Mal aufgerufen." % len(aufrufe)

def _pruefe(werte, eingaben, soll):
    z, aufrufe = _lauf(werte, eingaben)
    _einmal(aufrufe)
    ist = [l for l in z if l.lower() in HINWEISE]
    assert [l.lower() for l in ist] == [s.lower() for s in soll], "Bei den Eingaben %s sollen diese Hinweise erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (", ".join(str(e) for e in eingaben), ausgabe_text(soll), ausgabe_text(ist))

def test_drei_tipps():
    """Zahl 30, Tipps 50, 20, 30: Zu groß, Zu klein, Richtig!"""
    _pruefe([30, 99, 5], [50, 20, 30], ["Zu groß", "Zu klein", "Richtig!"])

def test_grenzfall_gleich_beim_ersten():
    """Grenzfall Zahl 30, Tipp 30: Richtig!, die Schleife läuft einmal"""
    _pruefe([30], [30], ["Richtig!"])

def test_grenzfall_unten():
    """Grenzfall Zahl 1, Tipps 100, 1: Zu groß, Richtig!"""
    _pruefe([1], [100, 1], ["Zu groß", "Richtig!"])

def test_grenzfall_oben():
    """Grenzfall Zahl 100, Tipps 1, 99, 100: Zu klein, Zu klein, Richtig!"""
    _pruefe([100], [1, 99, 100], ["Zu klein", "Zu klein", "Richtig!"])
