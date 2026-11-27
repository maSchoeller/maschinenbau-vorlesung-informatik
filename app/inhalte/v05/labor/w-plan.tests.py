def _pruefe(zahl, soll):
    z = zeilen(run_program([str(zahl)]))
    # Eine Eingabeaufforderung ist nicht vorgegeben: Es zählen nur Zeilen, die reine Zahlen sind.
    gedruckt = [l for l in z if l.strip().lstrip('-').isdigit()]
    text = ", ".join(str(x) for x in soll) if soll else "(keine)"
    assert gedruckt == [str(x) for x in soll], "Bei der Zahl %s sollen die Zeilen %s erscheinen. Dein Plan gibt aus:\n%s" % (zahl, text, ausgabe_text(gedruckt))

def test_drei():
    """Zahl 3: 3, 6, 9 bis 30, jede Zahl in einer eigenen Zeile"""
    _pruefe(3, [3 * i for i in range(1, 11)])

def test_sieben():
    """Zahl 7: 7, 14 bis 70"""
    _pruefe(7, [7 * i for i in range(1, 11)])

def test_eins():
    """Zahl 1: 1 bis 10"""
    _pruefe(1, [i for i in range(1, 11)])

def test_grenzfall_null():
    """Grenzfall Zahl 0: zehnmal 0"""
    _pruefe(0, [0] * 10)
