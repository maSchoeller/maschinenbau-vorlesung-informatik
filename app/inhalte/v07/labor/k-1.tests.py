def _pruefe(grenze):
    z = zeilen(run_program([str(grenze)]))
    soll = [p for p in range(2, grenze + 1) if all(p % t for t in range(2, p))]
    ist = [l for l in z if l.isdigit()]
    assert ist == [str(p) for p in soll], "Bei der Grenze %s sollen diese Primzahlen erscheinen, je eine pro Zeile:\n%s\nDein Programm gibt aus:\n%s" % (grenze, ausgabe_text([str(p) for p in soll]), ausgabe_text(ist))

def test_dreissig():
    """Grenze 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29"""
    _pruefe(30)

def test_grenze_ist_prim():
    """Grenze 31: dieselben Zahlen und 31, die Grenze selbst zählt mit"""
    _pruefe(31)

def test_zehn():
    """Grenze 10: 2, 3, 5, 7"""
    _pruefe(10)

def test_grenzfall_zwei():
    """Grenzfall Grenze 2: nur die 2"""
    _pruefe(2)

def test_grenzfall_eins():
    """Grenzfall Grenze 1: keine Zeile"""
    _pruefe(1)
