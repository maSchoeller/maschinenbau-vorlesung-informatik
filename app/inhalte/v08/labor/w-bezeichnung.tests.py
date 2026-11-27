def _pruefe(d, l, soll):
    z = zeilen(run_program([str(d), str(l)]))
    # Die Eingabeaufforderungen enden ohne Zeilenumbruch und stehen vor der Bezeichnung in derselben Zeile. Geprüft wird die wirklich letzte Zeile.
    letzte = z[-1] if z else ""
    assert "None" not in letzte, "Dein Programm gibt am Ende None aus. print zeigt nur an, gibt aber nichts zurück. Die Funktion braucht return."
    i = letzte.rfind("M")
    if i >= 0 and any(c.isdigit() for c in letzte[i:]):
        letzte = letzte[i:]
    assert " ".join(letzte.split()) == soll, "Bei Durchmesser %s und Länge %s soll '%s' erscheinen. Dein Programm gibt aus: '%s'" % (d, l, soll, letzte)

def test_zehn_vierzig():
    """10 und 40: M10 x 40"""
    _pruefe(10, 40, "M10 x 40")

def test_sechs_fuenfundzwanzig():
    """6 und 25: M6 x 25"""
    _pruefe(6, 25, "M6 x 25")

def test_acht_dreissig():
    """8 und 30: M8 x 30, der letzte Wert ändert die Bezeichnung"""
    _pruefe(8, 30, "M8 x 30")

def test_grenzfall_einstellig():
    """Grenzfall 4 und 10: M4 x 10, der Durchmesser ist einstellig"""
    _pruefe(4, 10, "M4 x 10")
