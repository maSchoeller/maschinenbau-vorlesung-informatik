def _pruefe(bit, soll):
    z = zeilen(run_program([str(bit)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.05, "Bei %s Bit soll die Stundenzahl %s als letzte Zahl der letzten Zeile stehen. Dein Programm gibt zuletzt aus: '%s'" % (bit, soll, letzte)

def test_sechzehn_bit():
    """16 Bit: nach 18.2 Stunden"""
    _pruefe(16, 18.2)

def test_acht_bit():
    """8 Bit: nach 0.1 Stunden"""
    _pruefe(8, 0.1)

def test_zwoelf_bit():
    """12 Bit: nach 1.1 Stunden"""
    _pruefe(12, 1.1)

def test_vierundzwanzig_bit():
    """24 Bit: nach 4660.3 Stunden"""
    _pruefe(24, 4660.3)

def test_zweiunddreissig_bit():
    """32 Bit: nach 1193046.5 Stunden"""
    _pruefe(32, 1193046.5)

def test_grenzfall_ein_bit():
    """Grenzfall 1 Bit: nach 0.0 Stunden, zwei Werte"""
    _pruefe(1, 0.0)
