import re

def _pruefe(eingaben):
    werte = eingaben[1:]
    z = zeilen(run_program([str(e) for e in eingaben]))
    # Eingabeaufforderungen sind nicht vorgegeben: Es zählen nur Zeilen der Form Blatt 2: 10 Punkte.
    ist = [l for l in z if re.fullmatch(r"blatt \d+: -?\d+ punkte", l.lower())]
    soll = ["Blatt %d: %d Punkte" % (i + 1, w) for i, w in enumerate(werte)]
    text = ", ".join(str(e) for e in eingaben)
    assert [l.lower() for l in ist] == [l.lower() for l in soll], "Bei den Eingaben %s sollen diese Zeilen erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (text, ausgabe_text(soll), ausgabe_text(ist))

def test_drei_blaetter():
    """3 Blätter: 8, 10, 4 Punkte, je Blatt eine Zeile"""
    _pruefe([3, 8, 10, 4])

def test_grenzfall_ein_blatt():
    """Grenzfall 1 Blatt: 7 Punkte"""
    _pruefe([1, 7])

def test_grenzfall_kein_blatt():
    """Grenzfall 0 Blätter: keine Zeile, die Schleife läuft nie"""
    _pruefe([0])

def test_null_punkte():
    """2 Blätter: 0 und 9 Punkte, auch 0 Punkte bekommen eine Zeile"""
    _pruefe([2, 0, 9])
