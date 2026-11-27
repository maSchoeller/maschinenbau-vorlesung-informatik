def _pruefe(start, soll):
    z = zeilen(run_program([str(start)]))
    # Die Eingabeaufforderung ist keine Ausgabe der Aufgabe: Es zählen nur Zahlen und das Wort Los.
    gedruckt = [l for l in z if l.lstrip('-').isdigit() or l.lower() == 'los']
    erwartet = [str(x) for x in soll] + ['Los']
    assert [l.lower() for l in gedruckt] == [l.lower() for l in erwartet], "Beim Start %s sollen die Zeilen %s erscheinen. Dein Programm gibt aus:\n%s" % (start, ", ".join(erwartet), ausgabe_text(gedruckt))

def test_start_drei():
    """Start 3: 3, 2, 1, Los"""
    _pruefe(3, [3, 2, 1])

def test_grenzfall_start_eins():
    """Grenzfall Start 1: 1, Los"""
    _pruefe(1, [1])

def test_grenzfall_start_null():
    """Grenzfall Start 0: nur Los, die Schleife läuft nie"""
    _pruefe(0, [])

def test_start_fuenf():
    """Start 5: 5, 4, 3, 2, 1, Los, die 1 kommt noch dran"""
    _pruefe(5, [5, 4, 3, 2, 1])
