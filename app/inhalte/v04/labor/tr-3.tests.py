def _pruefe(n, soll):
    out = run_program([str(n)])
    # Die erste Zeile ist die Eingabeaufforderung, danach folgen die Zahlen.
    gedruckt = [l.strip() for l in out.split("\n")[1:] if l.strip()]
    assert gedruckt == [str(x) for x in soll], "Bei n = %s sollen die Zeilen %s erscheinen. Dein Programm gibt aus:\n%s" % (n, ", ".join(str(x) for x in soll) if soll else "(keine)", "\n".join(gedruckt) if gedruckt else "(keine Zahl)")

def test_drei():
    """n = 3: die Zeilen 1, 2, 3"""
    _pruefe(3, [1, 2, 3])

def test_grenzfall_eins():
    """Grenzfall n = 1: genau die Zeile 1"""
    _pruefe(1, [1])

def test_grenzfall_null():
    """Grenzfall n = 0: keine Zahl"""
    _pruefe(0, [])

def test_fuenf():
    """n = 5: die Zeilen 1 bis 5"""
    _pruefe(5, [1, 2, 3, 4, 5])
