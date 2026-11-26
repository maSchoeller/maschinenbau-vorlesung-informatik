def _pruefe(temperatur, soll):
    z = zeilen(run_program([str(temperatur)]))
    ist = z[-1].lower() if z else ""
    assert ist == soll.lower(), "Bei %s Grad soll zuletzt '%s' erscheinen. Dein Programm gibt aus:\n%s" % (temperatur, soll, ausgabe_text(z))

def test_kalt():
    """8 Grad: Jacke anziehen"""
    _pruefe(8, "Jacke anziehen")

def test_knapp_drunter():
    """14.5 Grad: Jacke anziehen"""
    _pruefe(14.5, "Jacke anziehen")

def test_grenzfall():
    """Grenzfall 15 Grad: T-Shirt reicht"""
    _pruefe(15, "T-Shirt reicht")

def test_warm():
    """22.5 Grad: T-Shirt reicht"""
    _pruefe(22.5, "T-Shirt reicht")
