def _pruefe(d, n):
    vc = math.pi * d * n / 1000
    soll = "Ausgabe: zu schnell" if vc > 250 else "vc = %.2f m/min" % vc
    z = zeilen(run_program([str(d), str(n)]))
    assert soll in z or soll.replace("Ausgabe: ", "") in z, "Bei d = %s und n = %s wird die Zeile %r erwartet. Dein Programm gibt aus: %r" % (d, n, soll.replace("Ausgabe: ", ""), z)

def test_beispiel():
    """d = 60, n = 1000: vc = 188.50 m/min"""
    _pruefe(60, 1000)

def test_schnell():
    """d = 100, n = 1000: vc = 314.16, also 'zu schnell'"""
    _pruefe(100, 1000)

def test_grenze_nah():
    """d = 80, n = 1000: vc = 251.33, knapp zu schnell"""
    _pruefe(80, 1000)

def test_langsam():
    """d = 20, n = 500: vc = 31.42 m/min"""
    _pruefe(20, 500)
