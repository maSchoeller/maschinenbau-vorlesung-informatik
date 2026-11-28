def _pruefe(a, b, soll):
    z = zeilen(run_program([str(a), str(b)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei den Preisen %s und %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (a, b, soll, letzte)

def test_null_komma_eins_und_zwei():
    """0.1 und 0.2: Passt"""
    _pruefe(0.1, 0.2, "Passt")

def test_vertauscht():
    """0.2 und 0.1: Passt"""
    _pruefe(0.2, 0.1, "Passt")

def test_zweimal_fuenfzehn_cent():
    """0.15 und 0.15: Passt"""
    _pruefe(0.15, 0.15, "Passt")

def test_zu_teuer():
    """0.1 und 0.3: Passt nicht, die Summe ist 0.4"""
    _pruefe(0.1, 0.3, "Passt nicht")

def test_zu_teuer_krumm():
    """0.1 und 0.25: Passt nicht, die Summe ist 0.35"""
    _pruefe(0.1, 0.25, "Passt nicht")

def test_grenzfall_null_dazu():
    """Grenzfall 0.3 und 0.0: Passt"""
    _pruefe(0.3, 0.0, "Passt")
