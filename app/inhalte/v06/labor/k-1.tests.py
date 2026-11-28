import re

def _pruefe(n):
    z = zeilen(run_program([str(n)]))
    soll = ["%d und %d" % (a, b) for a in range(1, n + 1) for b in range(a + 1, n + 1)]
    paare = [" ".join(l.split()) for l in z if re.fullmatch(r"\d+\s+und\s+\d+", l)]
    letzte = z[-1] if z else ""
    assert letzte.lower() == ("Händedrücke: %d" % len(soll)).lower(), "Bei %s Personen soll zuletzt 'Händedrücke: %d' stehen. Dein Programm gibt zuletzt aus: '%s'" % (n, len(soll), letzte)
    assert paare == soll, "Bei %s Personen soll jedes Paar genau einmal erscheinen, zum Beispiel '1 und 2', aber nicht noch einmal '2 und 1'. Dein Programm gibt diese Paare aus:\n%s" % (n, ausgabe_text(paare))

def test_vier():
    """4 Personen: sechs Paare, von 1 und 2 bis 3 und 4"""
    _pruefe(4)

def test_sechs():
    """6 Personen: 15 Händedrücke"""
    _pruefe(6)

def test_zwei_letztes_paar_zaehlt():
    """2 Personen: 1 Händedruck, das letzte Paar zählt mit"""
    _pruefe(2)

def test_grenzfall_eine_person():
    """Grenzfall 1 Person: Händedrücke: 0, keine Paarzeile"""
    _pruefe(1)

def test_grenzfall_keine_person():
    """Grenzfall 0 Personen: Händedrücke: 0"""
    _pruefe(0)

def test_zehn():
    """10 Personen: 45 Händedrücke"""
    _pruefe(10)
