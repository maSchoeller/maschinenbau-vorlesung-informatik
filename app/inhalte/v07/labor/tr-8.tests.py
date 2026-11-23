def _soll(P, n, d):
    T = P * 1000 / (2 * math.pi * n / 60)
    t = T * 1000 / (math.pi * d ** 3 / 16)
    return ["Moment: %.1f N·m" % T, "Spannung: %.1f MPa" % t, "Urteil: " + ("ok" if t <= 40.0 else "zu hoch")]

def _pruefe(P, n, d):
    z = zeilen(run_program([str(P), str(n), str(d)]))
    for s in _soll(P, n, d):
        assert s in z, "Bei P = %s, n = %s, d = %s wird die Zeile %r erwartet. Dein Programm gibt aus: %r" % (P, n, d, s, z)

def test_beispiel():
    """Beispiel P = 15, n = 1450, d = 30: ok"""
    _pruefe(15, 1450, 30)

def test_zu_hoch():
    """d = 20 mm: Urteil zu hoch"""
    _pruefe(15, 1450, 20)

def test_anders():
    """Anderer Motor: P = 7.5, n = 960, d = 35"""
    _pruefe(7.5, 960, 35)

def test_grosse_welle():
    """P = 55, n = 1480, d = 45"""
    _pruefe(55, 1480, 45)
