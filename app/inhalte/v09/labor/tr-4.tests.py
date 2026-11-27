def _pruefe(betrag, satz, gesamt):
    z = zeilen(run_program([str(betrag)]))
    zwei = z[-2:] if len(z) >= 2 else z
    s = zahlen(zwei[0]) if len(zwei) == 2 else []
    g = zahlen(zwei[1]) if len(zwei) == 2 else []
    ok = len(zwei) == 2 and s and g and abs(s[-1] - satz) < 0.005 and abs(g[-1] - gesamt) < 0.005
    assert ok, "Bei %s Euro sollen die letzten zwei Zeilen lauten:\nRabatt: %s Prozent\nGesamt mit Trinkgeld: %.2f Euro\nDein Programm gibt zuletzt aus:\n%s" % (betrag, satz, gesamt, ausgabe_text(zwei))

def test_hundertzwanzig():
    """120 Euro: Rabatt 10 Prozent, Gesamt 118.80 Euro"""
    _pruefe(120, 10, 118.80)

def test_grenzfall_hundert():
    """Grenzfall 100 Euro: Rabatt 10 Prozent, Gesamt 99.00 Euro"""
    _pruefe(100, 10, 99.00)

def test_achtzig():
    """80 Euro: Rabatt 5 Prozent, Gesamt 83.60 Euro"""
    _pruefe(80, 5, 83.60)

def test_grenzfall_fuenfzig():
    """Grenzfall 50 Euro: Rabatt 5 Prozent, Gesamt 52.25 Euro"""
    _pruefe(50, 5, 52.25)

def test_grenzfall_knapp_unter_fuenfzig():
    """Grenzfall 49.9 Euro: Rabatt 0 Prozent, Gesamt 54.89 Euro"""
    _pruefe(49.9, 0, 54.89)

def test_grenzfall_null():
    """Grenzfall 0 Euro: Rabatt 0 Prozent, Gesamt 0.00 Euro"""
    _pruefe(0, 0, 0.00)

def test_sechzig():
    """60 Euro: Rabatt 5 Prozent, Gesamt 62.70 Euro"""
    _pruefe(60, 5, 62.70)
