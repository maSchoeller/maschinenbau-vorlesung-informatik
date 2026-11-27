def _pruefe(wurf, tipp, soll):
    z, aufrufe = mit_zufall([wurf], [tipp])
    assert aufrufe == [(1, 6)], "Zieh die Zahl genau einmal mit random.randint(1, 6)."
    letzte = z[-1] if z else ""
    hilfe = "\nDie Funktion gibt nichts zurück. Fehlt ein return?" if letzte == "None" else ""
    assert letzte.lower() == soll.lower(), "Bei dem Wurf %s und dem Tipp %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'%s" % (wurf, tipp, soll, letzte, hilfe)

def test_treffer():
    """Wurf 4, Tipp 4: Treffer"""
    _pruefe(4, 4, "Treffer")

def test_daneben():
    """Wurf 4, Tipp 2: Leider nein, es war 4"""
    _pruefe(4, 2, "Leider nein, es war 4")

def test_grenzfall_eins():
    """Grenzfall Wurf 1, Tipp 1: Treffer"""
    _pruefe(1, 1, "Treffer")

def test_grenzfall_sechs():
    """Grenzfall Wurf 6, Tipp 5: Leider nein, es war 6"""
    _pruefe(6, 5, "Leider nein, es war 6")
