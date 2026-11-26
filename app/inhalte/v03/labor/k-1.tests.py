def _pruefe(a, b, c, soll):
    z = zeilen(run_program([str(a), str(b), str(c)]))
    ergebnis = z[3:]
    assert len(ergebnis) == 1, "Bei den Stäben %s, %s und %s soll genau eine Ergebniszeile erscheinen ('%s'). Dein Programm gibt nach den Eingaben aus:\n%s" % (a, b, c, soll, ausgabe_text(ergebnis))
    assert ergebnis[-1].lower() == soll.lower(), "Bei den Stäben %s, %s und %s soll '%s' herauskommen. Dein Programm gibt aus: '%s'" % (a, b, c, soll, ergebnis[-1])

def test_beispiel():
    """3, 4 und 5: Ungleichseitig"""
    _pruefe(3, 4, 5, "Ungleichseitig")

def test_gleichseitig():
    """5, 5 und 5: Gleichseitig"""
    _pruefe(5, 5, 5, "Gleichseitig")

def test_gleichschenklig_an_jeder_stelle():
    """5, 5, 8 und 5, 8, 5 und 8, 5, 5: jedes Mal Gleichschenklig"""
    _pruefe(5, 5, 8, "Gleichschenklig")
    _pruefe(5, 8, 5, "Gleichschenklig")
    _pruefe(8, 5, 5, "Gleichschenklig")

def test_zu_lang():
    """2, 3 und 9 in jeder Reihenfolge: Kein Dreieck"""
    _pruefe(2, 3, 9, "Kein Dreieck")
    _pruefe(9, 2, 3, "Kein Dreieck")
    _pruefe(3, 9, 2, "Kein Dreieck")

def test_grenzfall_flach():
    """Grenzfall 1, 2 und 3 in jeder Reihenfolge: Kein Dreieck (es liegt flach)"""
    _pruefe(1, 2, 3, "Kein Dreieck")
    _pruefe(3, 1, 2, "Kein Dreieck")
    _pruefe(2, 3, 1, "Kein Dreieck")

def test_zwei_gleich_aber_kein_dreieck():
    """2, 2 und 9 sowie Grenzfall 2, 2 und 4: Kein Dreieck, obwohl zwei Stäbe gleich lang sind"""
    _pruefe(2, 2, 9, "Kein Dreieck")
    _pruefe(9, 2, 2, "Kein Dreieck")
    _pruefe(2, 4, 2, "Kein Dreieck")

def test_knapp_ein_dreieck():
    """2, 3 und 4 sowie 2, 2 und 3: knapp ein Dreieck"""
    _pruefe(2, 3, 4, "Ungleichseitig")
    _pruefe(4, 2, 3, "Ungleichseitig")
    _pruefe(3, 2, 2, "Gleichschenklig")
