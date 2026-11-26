def _pruefe(gewicht, soll):
    z = zeilen(run_program([str(gewicht)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.01, "Bei %s kg soll das Porto %s ausgegeben werden. Dein Plan gibt zuletzt aus:\n%s" % (gewicht, soll, ausgabe_text(letzte))

def test_leicht():
    """1 kg: Porto 5"""
    _pruefe(1, 5)

def test_grenzfall_2():
    """Grenzfall 2 kg: Porto 5"""
    _pruefe(2, 5)

def test_mittel():
    """2.5 kg: Porto 8"""
    _pruefe(2.5, 8)

def test_grenzfall_10():
    """Grenzfall 10 kg: Porto 8"""
    _pruefe(10, 8)

def test_schwer():
    """12 kg: Porto 15"""
    _pruefe(12, 15)
