def _pruefe(betrag, prozent, soll):
    z = zahlen(run_program([str(betrag), str(prozent)]))
    assert z and abs(z[-1] - soll) < 0.01, "Bei %s Euro und %s Prozent soll zuletzt %s ausgegeben werden. Dein Programm gibt aus:\n%s" % (betrag, prozent, soll, ausgabe_text(z))

def test_beispiel():
    """40 Euro und 10 Prozent: zu zahlen 44.0"""
    _pruefe(40, 10, 44.0)

def test_andere_werte():
    """50 Euro und 20 Prozent: zu zahlen 60.0"""
    _pruefe(50, 20, 60.0)
