def _pruefe(eingaben, falsch):
    z = zeilen(run_program([str(e) for e in eingaben]))
    meldungen = [l for l in z if l.lower() == "falsch"]
    text = ", ".join(str(e) for e in eingaben)
    assert z and z[-1].lower() == "tür offen", "Bei den Codes %s soll zuletzt 'Tür offen' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, z[-1] if z else "")
    assert len(meldungen) == falsch, "Bei den Codes %s soll 'Falsch' genau %s-mal erscheinen. Dein Programm gibt es %s-mal aus." % (text, falsch, len(meldungen))

def test_gleich_richtig():
    """Grenzfall 4711: Tür offen, keine Meldung"""
    _pruefe([4711], 0)

def test_zwei_falsche():
    """1, 2, 4711: zweimal Falsch, dann Tür offen"""
    _pruefe([1, 2, 4711], 2)

def test_knapp_daneben():
    """4710, 4712, 4711: zweimal Falsch, dann Tür offen"""
    _pruefe([4710, 4712, 4711], 2)
