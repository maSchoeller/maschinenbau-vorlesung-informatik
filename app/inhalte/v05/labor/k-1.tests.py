def _pruefe(bits, soll):
    z = zeilen(run_program([str(b) for b in bits]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    text = ", ".join(str(b) for b in bits)
    assert w and abs(w[-1] - soll) < 0.01, "Bei den Bits %s soll zuletzt die Dezimalzahl %s stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, letzte)

def test_beispiel():
    """0, 0, 1, 0, 1, 1, 0, 1: 45"""
    _pruefe([0, 0, 1, 0, 1, 1, 0, 1], 45)

def test_alle_eins():
    """achtmal 1: 255"""
    _pruefe([1] * 8, 255)

def test_alle_null():
    """Grenzfall achtmal 0: 0"""
    _pruefe([0] * 8, 0)

def test_nur_links():
    """1, 0, 0, 0, 0, 0, 0, 0: 128"""
    _pruefe([1, 0, 0, 0, 0, 0, 0, 0], 128)

def test_nur_rechts():
    """0, 0, 0, 0, 0, 0, 0, 1: 1, das letzte Bit zählt mit"""
    _pruefe([0, 0, 0, 0, 0, 0, 0, 1], 1)

def test_zweihundert():
    """1, 1, 0, 0, 1, 0, 0, 0: 200"""
    _pruefe([1, 1, 0, 0, 1, 0, 0, 0], 200)

def test_einhundertsechsundsechzig():
    """1, 0, 1, 0, 0, 1, 1, 0: 166"""
    _pruefe([1, 0, 1, 0, 0, 1, 1, 0], 166)
