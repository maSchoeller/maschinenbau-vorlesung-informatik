def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    letzte = z[-1] if z else ""
    w = zahlen(letzte)
    text = ", ".join(str(e) for e in eingaben)
    assert w and abs(w[-1] - soll) < 0.05, "Bei den Eingaben %s soll zuletzt 'Durchschnitt: %.1f s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, letzte)

def test_drei_laeufe():
    """3 Läufe: 62, 58, 60: Durchschnitt 60.0 s"""
    _pruefe([3, 62, 58, 60], 60.0)

def test_grenzfall_ein_lauf():
    """Grenzfall 1 Lauf: 75: Durchschnitt 75.0 s"""
    _pruefe([1, 75], 75.0)

def test_vier_laeufe():
    """4 Läufe: 50, 55, 61, 60: Durchschnitt 56.5 s"""
    _pruefe([4, 50, 55, 61, 60], 56.5)

def test_zwei_laeufe():
    """2 Läufe: 40, 45: Durchschnitt 42.5 s"""
    _pruefe([2, 40, 45], 42.5)
