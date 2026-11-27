def _pruefe(punkte, soll):
    z = zeilen(run_program([str(punkte)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == ("Medaille: " + soll).lower(), "Bei %s Punkten soll zuletzt 'Medaille: %s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (punkte, soll, letzte)

def test_fuenfundneunzig():
    """95 Punkte: Medaille: Gold"""
    _pruefe(95, "Gold")

def test_grenzfall_neunzig():
    """Grenzfall 90 Punkte: Medaille: Gold"""
    _pruefe(90, "Gold")

def test_neunundachtzig():
    """89 Punkte: Medaille: Silber"""
    _pruefe(89, "Silber")

def test_grenzfall_siebzig():
    """Grenzfall 70 Punkte: Medaille: Silber"""
    _pruefe(70, "Silber")

def test_neunundsechzig():
    """69 Punkte: Medaille: Bronze"""
    _pruefe(69, "Bronze")

def test_grenzfall_fuenfzig():
    """Grenzfall 50 Punkte: Medaille: Bronze"""
    _pruefe(50, "Bronze")

def test_neunundvierzig():
    """49 Punkte: Medaille: keine"""
    _pruefe(49, "keine")

def test_grenzfall_null():
    """Grenzfall 0 Punkte: Medaille: keine"""
    _pruefe(0, "keine")
