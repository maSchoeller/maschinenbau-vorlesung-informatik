HINWEISE = ("zu klein", "zu groß", "richtig!")

def _wichtig(zeilen_):
    return [l for l in zeilen_ if l.lower() in HINWEISE or l.lower().startswith("gewonnen") or l.lower().startswith("verloren")]

def _pruefe(werte, eingaben, soll, spiele):
    try:
        z, aufrufe = mit_zufall(werte, eingaben)
    except AssertionError as e:
        t = str(e)
        if "EOFError" in t:
            raise AssertionError("Dein Programm hat mehr Eingaben verlangt als vorgesehen: Fragt es nach jedem Spiel nur einmal 'Noch einmal? (ja/nein)' und endet es bei nein?\n" + t)
        raise
    assert aufrufe == [(1, 100)] * spiele, "Es sollen %s Spiele laufen, jedes mit einer eigenen Zufallszahl von random.randint(1, 100). Dein Programm hat randint %s Mal aufgerufen." % (spiele, len(aufrufe))
    ist = _wichtig(z)
    assert [l.lower() for l in ist] == [s.lower() for s in soll], "Bei den Eingaben %s sollen diese Zeilen erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (", ".join(str(e) for e in eingaben), ausgabe_text(soll), ausgabe_text(ist))

def test_zwei_spiele():
    """Zwei Spiele mit den Zahlen 30 und 77, dann nein"""
    _pruefe([30, 77], [50, 30, "ja", 80, 77, "nein"],
            ["Zu groß", "Richtig!", "Gewonnen! Versuche: 2", "Zu groß", "Richtig!", "Gewonnen! Versuche: 2"], 2)

def test_grenzfall_ein_spiel():
    """Grenzfall Zahl 57 im siebten Versuch, dann nein: nur ein Spiel"""
    _pruefe([57], [1, 2, 3, 4, 5, 6, 57, "nein"],
            ["Zu klein"] * 6 + ["Richtig!", "Gewonnen! Versuche: 7"], 1)
