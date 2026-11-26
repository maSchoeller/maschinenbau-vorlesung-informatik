def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    letzte = z[-1] if z else ""
    text = ", ".join(str(e) for e in eingaben)
    assert letzte.lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, letzte)

def test_grenzen_sind_gut():
    """5 Bolzen: 100, 97, 102, 103, 98: Ausschuss 2, die Grenzen 98 und 102 sind gut"""
    _pruefe([5, 100, 97, 102, 103, 98], "Ausschuss: 2 von 5")

def test_alle_gut():
    """3 Bolzen: 100, 101, 99: kein Ausschuss"""
    _pruefe([3, 100, 101, 99], "Ausschuss: 0 von 3")

def test_ein_bolzen():
    """1 Bolzen: 104: Ausschuss 1 von 1"""
    _pruefe([1, 104], "Ausschuss: 1 von 1")

def test_grenzfall_kein_bolzen():
    """Grenzfall 0 Bolzen: Ausschuss 0 von 0, die Schleife läuft nie"""
    _pruefe([0], "Ausschuss: 0 von 0")

def test_alle_schlecht():
    """4 Bolzen: 90, 110, 50, 150: alle sind Ausschuss"""
    _pruefe([4, 90, 110, 50, 150], "Ausschuss: 4 von 4")

def test_nur_grenzen():
    """2 Bolzen: 98, 102: kein Ausschuss, nur Grenzen"""
    _pruefe([2, 98, 102], "Ausschuss: 0 von 2")

def test_letzter_bolzen_zaehlt():
    """3 Bolzen: 100, 100, 120: der letzte ist Ausschuss"""
    _pruefe([3, 100, 100, 120], "Ausschuss: 1 von 3")
