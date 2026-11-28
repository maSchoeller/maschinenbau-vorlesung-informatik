def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    # Die Aufforderungen zählen nicht: Es zählen nur die Zeilen mit dem Urteil.
    urteile = ("unentschieden", "ich gewinne", "du gewinnst")
    ist = [l for l in z if l.lower() in urteile]
    text = ", ".join(str(e) for e in eingaben)
    assert [l.lower() for l in ist] == [s.lower() for s in soll], "Bei den Eingaben %s sollen diese Urteile erscheinen:\n%s\nDein Plan gibt aus:\n%s" % (text, ausgabe_text(soll), ausgabe_text(ist))

def test_gemischt():
    """Eingaben 1 3, 2 1, 3 3: Ich gewinne, Ich gewinne, Unentschieden"""
    _pruefe([1, 3, 2, 1, 3, 3], ["Ich gewinne", "Ich gewinne", "Unentschieden"])

def test_dreimal_verloren():
    """Eingaben 1 2, 1 2, 1 2: dreimal Du gewinnst"""
    _pruefe([1, 2, 1, 2, 1, 2], ["Du gewinnst", "Du gewinnst", "Du gewinnst"])

def test_grenzfall_dreimal_gleich():
    """Grenzfall 2 2, 2 2, 2 2: dreimal Unentschieden"""
    _pruefe([2, 2, 2, 2, 2, 2], ["Unentschieden", "Unentschieden", "Unentschieden"])

def test_letzte_runde_entscheidet():
    """Eingaben 2 1, 3 2, 1 2: Ich gewinne, Ich gewinne, Du gewinnst (die dritte Runde entscheidet)"""
    _pruefe([2, 1, 3, 2, 1, 2], ["Ich gewinne", "Ich gewinne", "Du gewinnst"])

def test_dreimal_gewonnen():
    """Eingaben 2 1, 3 2, 3 2: dreimal Ich gewinne"""
    _pruefe([2, 1, 3, 2, 3, 2], ["Ich gewinne", "Ich gewinne", "Ich gewinne"])
