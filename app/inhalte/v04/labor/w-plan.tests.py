def _pruefe(ziel, soll):
    z = zeilen(run_program([str(ziel)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.01, "Bei einem Sparziel von %s Euro sollen %s Wochen ausgegeben werden. Dein Plan gibt zuletzt aus:\n%s" % (ziel, soll, ausgabe_text(letzte))

def test_genau_getroffen():
    """Grenzfall Ziel 40: 8 Wochen"""
    _pruefe(40, 8)

def test_ueberschritten():
    """Ziel 42: 9 Wochen"""
    _pruefe(42, 9)

def test_eine_woche():
    """Ziel 5: 1 Woche"""
    _pruefe(5, 1)

def test_knapp():
    """Ziel 1: 1 Woche"""
    _pruefe(1, 1)

def test_ziel_null():
    """Grenzfall Ziel 0: 0 Wochen, die Schleife läuft nie"""
    _pruefe(0, 0)
