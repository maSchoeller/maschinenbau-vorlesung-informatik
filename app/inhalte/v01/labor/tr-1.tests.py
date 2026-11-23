def test_variablen():
    """karten hat den Wert 3, preis den Wert 9.5"""
    assert "karten" in globals(), "Die Variable karten fehlt."
    assert "preis" in globals(), "Die Variable preis fehlt."
    assert karten == 3 and preis == 9.5, "karten soll 3 sein und preis 9.5. Bei dir: karten = %r, preis = %r" % (karten, preis)

def test_gesamt():
    """gesamt ist berechnet: 3 mal 9.5 sind 28.5"""
    assert "gesamt" in globals(), "Die Variable gesamt fehlt."
    assert abs(gesamt - 28.5) < 0.001, "gesamt soll 28.5 sein. Bei dir: %r" % gesamt

def test_ausgabe():
    """Ausgabe: Gesamt: 28.5"""
    assert "Gesamt: 28.5" in zeilen(AUSGABE), "Erwartet wird die Zeile 'Gesamt: 28.5'. Dein Programm gibt aus: %r" % zeilen(AUSGABE)
