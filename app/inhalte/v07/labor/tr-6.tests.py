def _fn():
    assert "wellenpruefung" in globals(), "Die Funktion wellenpruefung ist nicht definiert."
    return globals()["wellenpruefung"]

def _ist(args, kw, soll):
    erg = _fn()(*args, **kw)
    assert erg is not None, "wellenpruefung gibt None zurück: Fehlt das return, oder steht ein print?"
    assert erg == soll, "wellenpruefung%s soll %r liefern, deine Funktion liefert %r" % (args if not kw else (args, kw), soll, erg)

def test_ok():
    """wellenpruefung(15, 1450, 30) = '18.6 MPa: ok'"""
    _ist((15, 1450, 30), {}, "18.6 MPa: ok")

def test_zu_hoch():
    """wellenpruefung(15, 1450, 20) = '62.9 MPa: zu hoch'"""
    _ist((15, 1450, 20), {}, "62.9 MPa: zu hoch")

def test_grenzwert():
    """Eigener Grenzwert: wellenpruefung(15, 1450, 25, tau_zul=25.0) = '32.2 MPa: zu hoch'"""
    _ist((15, 1450, 25), {"tau_zul": 25.0}, "32.2 MPa: zu hoch")

def test_default():
    """Ohne tau_zul gilt 40: wellenpruefung(22, 1450, 40) = '11.5 MPa: ok'"""
    _ist((22, 1450, 40), {}, "11.5 MPa: ok")
