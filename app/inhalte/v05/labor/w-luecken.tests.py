def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    letzte = z[-1] if z else ""
    text = ", ".join(str(e) for e in eingaben)
    assert letzte.lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, letzte)

def test_woche():
    """5000, 7000, 9000, 6000, 8000, 10000, 4000: Summe 49000, im Schnitt 7000.0"""
    _pruefe([5000, 7000, 9000, 6000, 8000, 10000, 4000], "Woche: 49000 Schritte, im Schnitt 7000.0 am Tag")

def test_grenzfall_nullen():
    """Grenzfall siebenmal 0: Summe 0, im Schnitt 0.0"""
    _pruefe([0] * 7, "Woche: 0 Schritte, im Schnitt 0.0 am Tag")

def test_krumme_werte():
    """6500, 7200, 8100, 5400, 9900, 12000, 3100: Summe 52200, im Schnitt 7457.1"""
    _pruefe([6500, 7200, 8100, 5400, 9900, 12000, 3100], "Woche: 52200 Schritte, im Schnitt 7457.1 am Tag")

def test_nur_letzter_tag():
    """sechsmal 0, dann 7000: Summe 7000, im Schnitt 1000.0, der siebte Tag zählt mit"""
    _pruefe([0, 0, 0, 0, 0, 0, 7000], "Woche: 7000 Schritte, im Schnitt 1000.0 am Tag")
