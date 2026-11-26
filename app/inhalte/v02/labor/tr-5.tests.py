def _pruefe(geld, betrag, wort):
    z = zeilen(run_program([str(geld)]))
    letzte = z[-1].lower() if z else ""
    teile = letzte.replace(":", " ").split()
    assert betrag in teile and wort in letzte, "Bei %s Euro soll in der letzten Zeile %s und das Wort '%s' stehen, die Zahl mit zwei Nachkommastellen. Dein Programm gibt aus:\n%s" % (geld, betrag, wort, ausgabe_text(z))

def test_reicht():
    """20 Euro: Übrig: 10.50 Euro"""
    _pruefe(20, "10.50", "übrig")

def test_grenzfall():
    """Grenzfall 9.5 Euro: Übrig: 0.00 Euro"""
    _pruefe(9.5, "0.00", "übrig")

def test_knapp():
    """9 Euro: Es fehlen 0.50 Euro"""
    _pruefe(9, "0.50", "fehlen")

def test_zu_wenig():
    """5 Euro: Es fehlen 4.50 Euro"""
    _pruefe(5, "4.50", "fehlen")
