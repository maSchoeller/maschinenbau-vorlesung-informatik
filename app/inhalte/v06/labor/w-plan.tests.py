def _pruefe(n, m, soll):
    z = zeilen(run_program([str(n), str(m)]))
    # Eine Eingabeaufforderung ist nicht vorgegeben: Es zählen nur Zeilen, die reine Zahlen sind.
    gedruckt = [l for l in z if l.strip().lstrip('-').isdigit()]
    text = ", ".join(str(x) for x in soll) if soll else "(keine)"
    assert gedruckt == [str(x) for x in soll], "Bei n = %s und m = %s sollen die Zeilen %s erscheinen. Dein Plan gibt aus:\n%s" % (n, m, text, ausgabe_text(gedruckt))

def test_zwei_mal_drei():
    """n = 2, m = 3: 1, 2, 3, 2, 4, 6, jedes Produkt in einer eigenen Zeile"""
    _pruefe(2, 3, [1, 2, 3, 2, 4, 6])

def test_drei_mal_vier():
    """n = 3, m = 4: zwölf Produkte, zuerst alle für i = 1, zuletzt 12"""
    _pruefe(3, 4, [i * j for i in range(1, 4) for j in range(1, 5)])

def test_grenzfall_eins_eins():
    """Grenzfall n = 1, m = 1: nur die 1"""
    _pruefe(1, 1, [1])

def test_grenzfall_aussen_null():
    """Grenzfall n = 0, m = 3: keine Zeile, die äußere Schleife läuft nie"""
    _pruefe(0, 3, [])

def test_grenzfall_innen_null():
    """Grenzfall n = 3, m = 0: keine Zeile, die innere Schleife läuft nie"""
    _pruefe(3, 0, [])
