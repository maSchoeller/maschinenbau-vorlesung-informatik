def _pruefe(runden, schnitt, ziel, soll):
    z = zahlen(run_program([str(runden), str(schnitt), str(ziel)]))
    assert z and abs(z[-1] - soll) < 0.01, "Nach %s Runden mit Schnitt %s brauchst du für den Schnitt %s in der nächsten Runde %s Punkte. Dein Programm gibt zuletzt aus:\n%s" % (runden, schnitt, ziel, soll, ausgabe_text(z[-1:]))

def test_beispiel():
    """4 Runden, Schnitt 70, Ziel 75: 95.0 Punkte"""
    _pruefe(4, 70, 75, 95.0)

def test_eine_runde():
    """1 Runde, Schnitt 80, Ziel 80: 80.0 Punkte"""
    _pruefe(1, 80, 80, 80.0)

def test_ziel_niedriger():
    """3 Runden, Schnitt 60, Ziel 50: 20.0 Punkte"""
    _pruefe(3, 60, 50, 20.0)

def test_viele_runden():
    """9 Runden, Schnitt 72.5, Ziel 73: 77.5 Punkte"""
    _pruefe(9, 72.5, 73, 77.5)

def test_zwei_runden():
    """2 Runden, Schnitt 40, Ziel 60: 100.0 Punkte"""
    _pruefe(2, 40, 60, 100.0)
