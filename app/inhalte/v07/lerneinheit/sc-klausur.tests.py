def _pruefe(n, soll):
    z = zeilen(run_program([str(n)]))
    assert ("Ergebnis: " + soll) in z, "Bei n = %d wird die Zeile %r erwartet. Dein Programm gibt aus: %r" % (n, "Ergebnis: " + soll, z)

def test_beispiel():
    """Beispiel n = 2500: Ergebnis: ok"""
    _pruefe(2500, "ok")

def test_ueber():
    """n = 3500 liegt über der Grenze: Überdrehzahl"""
    _pruefe(3500, "Überdrehzahl")

def test_grenze():
    """Die Grenze selbst gehört dazu: n = 3000 ist ok"""
    _pruefe(3000, "ok")

def test_knapp():
    """n = 3001 ist schon zu hoch"""
    _pruefe(3001, "Überdrehzahl")
