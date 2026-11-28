def _pruefe(anna, ben, soll):
    z = zeilen(run_program([str(anna), str(ben)]))
    # Die Eingabeaufforderungen enthalten kein Wort Sieger: Es zählt die letzte Zeile, die mit Sieger beginnt.
    kandidaten = [l for l in z if l.lower().startswith("sieger")]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    assert letzte.lower() == ("Sieger: " + soll).lower(), "Bei %s und %s Fingern soll 'Sieger: %s' erscheinen. Dein Plan gibt aus: '%s'" % (anna, ben, soll, letzte)

def test_drei_und_fuenf():
    """3 und 5 Finger: Summe 8, Sieger: Anna"""
    _pruefe(3, 5, "Anna")

def test_drei_und_vier():
    """3 und 4 Finger: Summe 7, Sieger: Ben"""
    _pruefe(3, 4, "Ben")

def test_grenzfall_kleinste_summe():
    """Grenzfall 1 und 1 Finger: Summe 2, Sieger: Anna"""
    _pruefe(1, 1, "Anna")

def test_grenzfall_groesste_summe():
    """Grenzfall 5 und 5 Finger: Summe 10, Sieger: Anna"""
    _pruefe(5, 5, "Anna")

def test_fuenf_und_vier():
    """5 und 4 Finger: Summe 9, Sieger: Ben"""
    _pruefe(5, 4, "Ben")

def test_zwei_und_drei():
    """2 und 3 Finger: Summe 5, Sieger: Ben"""
    _pruefe(2, 3, "Ben")
