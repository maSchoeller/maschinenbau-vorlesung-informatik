def _pruefe(r, h, soll):
    z = zeilen(run_program([str(r), str(h)]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.05, "Bei Radius %s und Höhe %s soll zuletzt 'Volumen: %.1f cm³' stehen. Dein Programm gibt zuletzt aus: '%s'" % (r, h, soll, letzte)

def test_sechs_und_fuenf():
    """Radius 6, Höhe 5: Volumen 565.2 cm³"""
    _pruefe(6, 5, 565.2)

def test_zwei_und_zehn():
    """Radius 2, Höhe 10: Volumen 125.6 cm³"""
    _pruefe(2, 10, 125.6)

def test_vier_und_drei():
    """Radius 4, Höhe 3: Volumen 150.7 cm³"""
    _pruefe(4, 3, 150.7)

def test_grenzfall_radius_null():
    """Grenzfall Radius 0, Höhe 5: Volumen 0.0 cm³"""
    _pruefe(0, 5, 0.0)

def test_grenzfall_hoehe_null():
    """Grenzfall Radius 10, Höhe 0: Volumen 0.0 cm³"""
    _pruefe(10, 0, 0.0)
