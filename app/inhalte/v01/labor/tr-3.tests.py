def _pruefe(laenge, breite, flaeche, umfang):
    z = zahlen(run_program([str(laenge), str(breite)]))
    assert len(z) >= 2 and abs(z[-2] - flaeche) < 0.01 and abs(z[-1] - umfang) < 0.01, "Bei Länge %s und Breite %s sollen zuerst die Fläche %s und dann der Umfang %s ausgegeben werden. Dein Plan gibt aus:\n%s" % (laenge, breite, flaeche, umfang, ausgabe_text(z))

def test_beispiel():
    """Länge 4 und Breite 3: Fläche 12.0, Umfang 14.0"""
    _pruefe(4, 3, 12.0, 14.0)

def test_kommazahl():
    """Länge 2.5 und Breite 2: Fläche 5.0, Umfang 9.0"""
    _pruefe(2.5, 2, 5.0, 9.0)
