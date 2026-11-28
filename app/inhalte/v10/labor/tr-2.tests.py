def _pruefe(wurf, eingaben, soll):
    try:
        z, aufrufe = mit_zufall([wurf], eingaben)
    except AssertionError as e:
        t = str(e)
        if "EOFError" in t:
            raise AssertionError("Dein Programm hat mehr Eingaben verlangt als vorgesehen: Endet die Schleife nach 3 Versuchen?\n" + t)
        raise
    assert aufrufe == [(1, 6)], "Würfle genau einmal mit random.randint(1, 6), vor der Schleife. Dein Programm hat randint %s Mal aufgerufen." % len(aufrufe)
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Beim Wurf %s und den Tipps %s soll als letzte Zeile '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (wurf, ", ".join(str(e) for e in eingaben), soll, letzte)

def test_treffer_beim_ersten():
    """Wurf 4, Tipp 4: Treffer, Versuche: 1"""
    _pruefe(4, [4], "Treffer, Versuche: 1")

def test_grenzfall_treffer_beim_dritten():
    """Grenzfall Wurf 4, Tipps 1, 2, 4: Treffer, Versuche: 3"""
    _pruefe(4, [1, 2, 4], "Treffer, Versuche: 3")

def test_grenzfall_verloren_nach_drei():
    """Wurf 4, Tipps 1, 2, 3: Verloren, es war 4"""
    _pruefe(4, [1, 2, 3], "Verloren, es war 4")

def test_dreimal_daneben():
    """Wurf 4, Tipps 6, 6, 6: Verloren, es war 4"""
    _pruefe(4, [6, 6, 6], "Verloren, es war 4")

def test_grenzfall_wurf_eins():
    """Grenzfall Wurf 1, Tipp 1: Treffer, Versuche: 1"""
    _pruefe(1, [1], "Treffer, Versuche: 1")

def test_grenzfall_wurf_sechs():
    """Grenzfall Wurf 6, Tipps 2, 6: Treffer, Versuche: 2"""
    _pruefe(6, [2, 6], "Treffer, Versuche: 2")
