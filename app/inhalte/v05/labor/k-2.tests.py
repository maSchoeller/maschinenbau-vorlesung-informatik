def _pruefe(grenze, feld, koerner, summe):
    z = zeilen(run_program([str(grenze)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w == [float(feld), float(koerner), float(summe)], "Bei der Grenze %s sollen die Zahlen %s, %s und %s in der letzten Zeile stehen (Feld, Körner, zusammen). Dein Programm gibt zuletzt aus: '%s'" % (grenze, feld, koerner, summe, letzte)

def test_hundert():
    """Grenze 100: Feld 8 mit 128 Körnern, zusammen 255"""
    _pruefe(100, 8, 128, 255)

def test_eine_million():
    """Grenze 1000000: Feld 21 mit 1048576 Körnern, zusammen 2097151"""
    _pruefe(1000000, 21, 1048576, 2097151)

def test_dreiundsechzig():
    """Grenze 63: Feld 7 mit 64 Körnern, zusammen 127"""
    _pruefe(63, 7, 64, 127)

def test_vierundsechzig():
    """Grenzfall Grenze 64: Feld 8 mit 128 Körnern, 64 ist nicht mehr als 64"""
    _pruefe(64, 8, 128, 255)

def test_eins():
    """Grenze 1: Feld 2 mit 2 Körnern, zusammen 3"""
    _pruefe(1, 2, 2, 3)

def test_null():
    """Grenzfall Grenze 0: Feld 1 mit 1 Korn, die Schleife läuft nie"""
    _pruefe(0, 1, 1, 1)
