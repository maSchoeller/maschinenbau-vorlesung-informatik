def _pruefe(a, b, soll):
    z = zeilen(run_program([str(a), str(b)]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll, "Bei %s und %s soll zuletzt '%s' stehen. Dein Plan gibt zuletzt aus: '%s'" % (a, b, soll, letzte)

def test_null_komma_eins_und_zwei():
    """0.1 und 0.2: ja, die Summe stimmt nach dem Runden"""
    _pruefe(0.1, 0.2, "ja")

def test_vertauscht():
    """0.2 und 0.1: ja"""
    _pruefe(0.2, 0.1, "ja")

def test_zweimal_null_komma_fuenfzehn():
    """0.15 und 0.15: ja"""
    _pruefe(0.15, 0.15, "ja")

def test_summe_zu_gross():
    """0.1 und 0.3: nein, die Summe ist 0.4"""
    _pruefe(0.1, 0.3, "nein")

def test_summe_null_komma_fuenfunddreissig():
    """0.1 und 0.25: nein, die Summe ist 0.35"""
    _pruefe(0.1, 0.25, "nein")

def test_grenzfall_null_addiert():
    """Grenzfall 0.3 und 0.0: ja"""
    _pruefe(0.3, 0.0, "ja")
