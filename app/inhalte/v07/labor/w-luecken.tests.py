def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    # Die Eingabeaufforderungen beginnen mit Punkte und zählen nicht: Es zählen die Zeilen, die mit Runde beginnen.
    ist = [l for l in z if l.lower().startswith("runde")]
    text = ", ".join(str(e) for e in eingaben)
    assert ist == soll, "Bei den Eingaben %s sollen diese Zeilen erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (text, ausgabe_text(soll), ausgabe_text(ist))

def test_drei_runden():
    """12, 9, 15: Runde 1: 12 Punkte, Runde 2: 9 Punkte, Runde 3: 15 Punkte"""
    _pruefe([12, 9, 15], ["Runde 1: 12 Punkte", "Runde 2: 9 Punkte", "Runde 3: 15 Punkte"])

def test_grenzfall_nullen():
    """Grenzfall 0, 0, 7: Runde 1: 0 Punkte, Runde 2: 0 Punkte, Runde 3: 7 Punkte, der letzte Wert zählt"""
    _pruefe([0, 0, 7], ["Runde 1: 0 Punkte", "Runde 2: 0 Punkte", "Runde 3: 7 Punkte"])

def test_dreimal_fuenf():
    """5, 5, 5: dreimal 5 Punkte, mit der Nummer der Runde davor"""
    _pruefe([5, 5, 5], ["Runde 1: 5 Punkte", "Runde 2: 5 Punkte", "Runde 3: 5 Punkte"])
