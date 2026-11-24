def _pruefe(ich, du, soll):
    z = zeilen(run_program([str(ich), str(du)]))
    ergebnis = z[2:]
    assert len(ergebnis) == 1, "Bei ich = %s und du = %s soll genau eine Ergebniszeile erscheinen ('%s'). Dein Programm gibt nach den beiden Eingaben aus: %r" % (ich, du, soll, ergebnis)
    assert ergebnis[-1].lower() == soll.lower(), "Bei ich = %s und du = %s soll '%s' herauskommen. Dein Programm gibt aus: '%s'" % (ich, du, soll, ergebnis[-1])

def test_schere_papier():
    """Schere (1) gegen Papier (3): Ich gewinne"""
    _pruefe(1, 3, "Ich gewinne")

def test_stein_schere():
    """Stein (2) gegen Schere (1): Ich gewinne"""
    _pruefe(2, 1, "Ich gewinne")

def test_papier_stein():
    """Papier (3) gegen Stein (2): Ich gewinne"""
    _pruefe(3, 2, "Ich gewinne")

def test_unentschieden():
    """Stein (2) gegen Stein (2): Unentschieden"""
    _pruefe(2, 2, "Unentschieden")

def test_schere_stein():
    """Schere (1) gegen Stein (2): Du gewinnst"""
    _pruefe(1, 2, "Du gewinnst")

def test_papier_schere():
    """Papier (3) gegen Schere (1): Du gewinnst"""
    _pruefe(3, 1, "Du gewinnst")
