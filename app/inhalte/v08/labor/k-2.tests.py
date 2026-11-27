def _pruefe(grenze, soll):
    z = zeilen(run_program([str(grenze)]))
    # Die Eingabeaufforderung enthält Text: Es zählen nur Zeilen, die eine reine Zahl sind.
    ist = [l for l in z if l.isdigit()]
    assert ist == [str(s) for s in soll], "Bei der Grenze %s sollen diese Zahlen erscheinen, je eine pro Zeile:\n%s\nDein Programm gibt aus:\n%s" % (grenze, ausgabe_text([str(s) for s in soll]), ausgabe_text(ist))

def test_dreissig():
    """Grenze 30: 6 und 28"""
    _pruefe(30, [6, 28])

def test_hundert():
    """Grenze 100: 6 und 28"""
    _pruefe(100, [6, 28])

def test_grenze_zaehlt_mit():
    """Grenze 28: 6 und 28, die Grenze selbst zählt mit"""
    _pruefe(28, [6, 28])

def test_siebenundzwanzig():
    """Grenze 27: nur die 6, die 28 liegt über der Grenze"""
    _pruefe(27, [6])

def test_sechs():
    """Grenze 6: nur die 6"""
    _pruefe(6, [6])

def test_grenzfall_fuenf():
    """Grenzfall Grenze 5: keine Zeile"""
    _pruefe(5, [])
