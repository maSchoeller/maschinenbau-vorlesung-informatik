SOLL = ["d = 30.0 mm, vc = 120.0 m/min: n = 1273.2 1/min",
        "d = 50.0 mm, vc = 120.0 m/min: n = 763.9 1/min",
        "d = 80.0 mm, vc = 200.0 m/min: n = 795.8 1/min"]

def test_funktion():
    """Die Funktion drehzahl(vc, d) ist definiert und rechnet: drehzahl(120, 30) = 1273.2"""
    assert "drehzahl" in globals(), "Die Funktion drehzahl ist nicht definiert. Beginne mit: def drehzahl(vc, d):"
    erg = drehzahl(120, 30)
    assert erg is not None, "drehzahl gibt None zurück: return statt print?"
    assert abs(erg - 1273.24) < 0.01, "drehzahl(120, 30) soll 1273.24 liefern, deine Funktion liefert %r" % (erg,)

def test_namen():
    """Aufruf mit Namen: drehzahl(d=50, vc=120) = 763.9"""
    assert "drehzahl" in globals(), "Die Funktion drehzahl ist nicht definiert."
    erg = drehzahl(d=50, vc=120)
    assert erg is not None and abs(erg - 763.94) < 0.01, "drehzahl(d=50, vc=120) soll 763.94 liefern, deine Funktion liefert %r" % (erg,)

def test_ausgabe():
    """Die Ausgabe des Programms bleibt unverändert (drei Zeilen)"""
    z = zeilen(AUSGABE)
    assert z == SOLL, "Die Ausgabe soll unverändert bleiben:\n%s\nDein Programm gibt aus: %r" % ("\n".join(SOLL), z)
