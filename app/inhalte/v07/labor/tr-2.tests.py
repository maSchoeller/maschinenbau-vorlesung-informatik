def test_flaeche():
    """kreisflaeche(10) = 78.54 mm²"""
    erg = kreisflaeche(10)
    assert erg is not None, "kreisflaeche gibt None zurück: print zeigt den Wert nur an. Was muss stattdessen im Rumpf stehen?"
    assert abs(erg - 78.5398) < 0.01, "kreisflaeche(10) soll 78.54 liefern, bei dir kommt %r heraus" % (erg,)

def test_kraft():
    """druckkraft(6, 50) = 1178.1 N"""
    erg = druckkraft(6, 50)
    assert erg is not None and abs(erg - 1178.097) < 0.01, "druckkraft(6, 50) soll 1178.1 liefern, bei dir kommt %r heraus" % (erg,)

def test_kraft2():
    """druckkraft(10, 20) = 314.16 N"""
    erg = druckkraft(10, 20)
    assert erg is not None and abs(erg - 314.159) < 0.01, "druckkraft(10, 20) soll 314.16 liefern, bei dir kommt %r heraus" % (erg,)
