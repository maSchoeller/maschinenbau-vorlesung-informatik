def _pruefe(werte, eingaben, soll):
    try:
        z, aufrufe = mit_zufall(werte, eingaben)
    except AssertionError as e:
        t = str(e)
        if "EOFError" in t:
            raise AssertionError("Dein Programm hat mehr Eingaben verlangt als vorgesehen: Endet die Schleife nach 7 Versuchen?\n" + t)
        raise
    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100). Dein Programm hat randint %s Mal aufgerufen." % len(aufrufe)
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei der Zahl %s und den Eingaben %s soll als letzte Zeile '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (werte[0], ", ".join(str(e) for e in eingaben), soll, letzte)

def test_gewonnen_im_siebten():
    """Zahl 57, sieben Tipps, der siebte trifft: Gewonnen! Versuche: 7"""
    _pruefe([57], [50, 75, 60, 55, 58, 56, 57], "Gewonnen! Versuche: 7")

def test_verloren_nach_sieben():
    """Zahl 57, sieben Tipps, der siebte trifft nicht: Verloren, die Zahl war 57"""
    _pruefe([57], [50, 75, 60, 55, 58, 56, 1], "Verloren, die Zahl war 57")

def test_gewonnen_zahl_sieben():
    """Zahl 7, Tipps 50, 25, 12, 6, 9, 8, 7: Gewonnen! Versuche: 7"""
    _pruefe([7], [50, 25, 12, 6, 9, 8, 7], "Gewonnen! Versuche: 7")

def test_grenzfall_gleich_beim_ersten():
    """Grenzfall Zahl 30, Tipp 30: Gewonnen! Versuche: 1"""
    _pruefe([30], [30], "Gewonnen! Versuche: 1")
