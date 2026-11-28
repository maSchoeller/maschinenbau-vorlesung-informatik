def _pruefe(laenge, abstand):
    z = zeilen(run_program([str(laenge), str(abstand)]))
    soll = ["Loch bei %d mm" % x for x in range(0, laenge + 1, abstand)]
    ist = [" ".join(l.split()) for l in z if l.lower().startswith("loch bei")]
    assert [l.lower() for l in ist] == [l.lower() for l in soll], "Bei Länge %s und Abstand %s sollen diese Zeilen erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (laenge, abstand, ausgabe_text(soll), ausgabe_text(ist))

def test_hundert_fuenfundzwanzig():
    """Länge 100, Abstand 25: Löcher bei 0, 25, 50, 75, 100, der Stoppwert fällt auf einen Schritt"""
    _pruefe(100, 25)

def test_abstand_zwanzig():
    """Länge 100, Abstand 20: sechs Löcher, ein fest eingetragener Abstand 25 reicht nicht"""
    _pruefe(100, 20)

def test_stopp_daneben():
    """Länge 90, Abstand 25: Löcher bei 0, 25, 50, 75, der Stoppwert fällt nicht auf einen Schritt"""
    _pruefe(90, 25)

def test_grenzfall_laenge_null():
    """Grenzfall Länge 0, Abstand 10: nur das Loch bei 0"""
    _pruefe(0, 10)

def test_grenzfall_abstand_gross():
    """Grenzfall Länge 10, Abstand 25: nur das Loch bei 0, der Abstand ist größer als die Leiste"""
    _pruefe(10, 25)
