import re

def _pruefe(g):
    z = zeilen(run_program([str(g)]))
    soll = ["%d %d %d" % (a, b, c) for a in range(1, g + 1) for b in range(a + 1, g + 1) for c in range(b + 1, g + 1) if a * a + b * b == c * c]
    tripel = [" ".join(l.split()) for l in z if re.fullmatch(r"\d+\s+\d+\s+\d+", l)]
    letzte = z[-1] if z else ""
    assert letzte.lower() == ("Tripel: %d" % len(soll)).lower(), "Bei der Grenze %s soll zuletzt 'Tripel: %d' stehen. Dein Programm gibt zuletzt aus: '%s'" % (g, len(soll), letzte)
    assert sorted(tripel) == sorted(soll), "Bei der Grenze %s sollen diese Tripel erscheinen, jedes einmal:\n%s\nDein Programm gibt aus:\n%s" % (g, ausgabe_text(soll), ausgabe_text(tripel))

def test_zwanzig():
    """Grenze 20: sechs Tripel, von 3 4 5 bis 12 16 20"""
    _pruefe(20)

def test_fuenf_auf_der_grenze():
    """Grenze 5: ein Tripel, c = 5 liegt genau auf der Grenze"""
    _pruefe(5)

def test_grenzfall_vier():
    """Grenzfall Grenze 4: kein Tripel"""
    _pruefe(4)

def test_dreizehn():
    """Grenze 13: drei Tripel"""
    _pruefe(13)

def test_fuenfundzwanzig():
    """Grenze 25: acht Tripel"""
    _pruefe(25)

def test_dreissig():
    """Grenze 30: elf Tripel"""
    _pruefe(30)
