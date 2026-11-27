def _pruefe(breite, hoehe, abstand):
    z = zeilen(run_program([str(breite), str(hoehe), str(abstand)]))
    soll = ["Loch bei x = %d, y = %d" % (x, y) for y in range(0, hoehe + 1, abstand) for x in range(0, breite + 1, abstand)]
    loecher = [" ".join(l.split()) for l in z if l.lower().startswith("loch bei")]
    letzte = z[-1] if z else ""
    eingaben = "%s, %s, %s" % (breite, hoehe, abstand)
    assert letzte.lower() == ("Löcher: %d" % len(soll)).lower(), "Bei den Eingaben %s soll zuletzt 'Löcher: %d' stehen. Dein Programm gibt zuletzt aus: '%s'" % (eingaben, len(soll), letzte)
    assert [l.lower() for l in loecher] == [l.lower() for l in soll], "Bei den Eingaben %s sollen die Zeilen 'Loch bei x = …, y = …' Reihe für Reihe erscheinen, in jeder Reihe von links nach rechts. Die ersten Zeilen:\n%s\nDein Programm gibt aus:\n%s" % (eingaben, "\n".join(soll[:4]), ausgabe_text(loecher[:4]))

def test_klein():
    """50, 25, 25: sechs Löcher, zuerst x = 0, 25, 50 für y = 0, dann für y = 25"""
    _pruefe(50, 25, 25)

def test_stopp_auf_schritt():
    """100, 50, 50: der Stoppwert fällt genau auf einen Schritt, sechs Löcher"""
    _pruefe(100, 50, 50)

def test_vier_mal_drei():
    """60, 40, 20: zwölf Löcher, vier je Reihe, drei Reihen"""
    _pruefe(60, 40, 20)

def test_stopp_daneben():
    """45, 30, 20: sechs Löcher, das letzte bei x = 40, y = 20"""
    _pruefe(45, 30, 20)

def test_grenzfall_nur_ecke():
    """Grenzfall 0, 0, 10: nur ein Loch in der Ecke"""
    _pruefe(0, 0, 10)

def test_grenzfall_abstand_gross():
    """Grenzfall 30, 30, 40: der Abstand ist größer als die Platte, nur die Ecke"""
    _pruefe(30, 30, 40)
