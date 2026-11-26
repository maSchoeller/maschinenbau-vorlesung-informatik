def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    meldungen = [l for l in z if l.lower() == "das gibt es nicht."]
    erwartet = len(eingaben) - 1
    assert z and z[-1].lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (", ".join(str(e) for e in eingaben), soll, z[-1] if z else "")
    assert len(meldungen) == erwartet, "Bei den Eingaben %s soll 'Das gibt es nicht.' genau %s-mal erscheinen. Dein Programm gibt es %s-mal aus." % (", ".join(str(e) for e in eingaben), erwartet, len(meldungen))

def test_gueltig():
    """Monat 3: eingetragen, keine Meldung"""
    _pruefe([3], "Monat 3 eingetragen")

def test_grenzfall_1():
    """Grenzfall Monat 1: keine Meldung"""
    _pruefe([1], "Monat 1 eingetragen")

def test_grenzfall_12():
    """Grenzfall Monat 12: keine Meldung"""
    _pruefe([12], "Monat 12 eingetragen")

def test_zwei_fehler():
    """0, 13, 7: zwei Meldungen, dann Monat 7"""
    _pruefe([0, 13, 7], "Monat 7 eingetragen")

def test_ein_fehler():
    """13, 12: eine Meldung, dann Monat 12"""
    _pruefe([13, 12], "Monat 12 eingetragen")
