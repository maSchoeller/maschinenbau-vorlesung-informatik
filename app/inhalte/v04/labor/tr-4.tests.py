def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    letzte = z[-1] if z else ""
    assert letzte.lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (", ".join(str(e) for e in eingaben), soll, letzte)

def test_gleich_gueltig():
    """180: Druck ok, keine Fehlversuche"""
    _pruefe([180], "Druck ok: 180 bar, Fehlversuche: 0")

def test_grenzfall_150():
    """100, 250, 150: zwei Fehlversuche, Grenzfall 150 ist erlaubt"""
    _pruefe([100, 250, 150], "Druck ok: 150 bar, Fehlversuche: 2")

def test_grenzfall_210():
    """211, 210: ein Fehlversuch, Grenzfall 210 ist erlaubt"""
    _pruefe([211, 210], "Druck ok: 210 bar, Fehlversuche: 1")

def test_knapp_zu_klein():
    """149, 180: ein Fehlversuch"""
    _pruefe([149, 180], "Druck ok: 180 bar, Fehlversuche: 1")

def test_gueltig_ohne_nachfrage():
    """Grenzfall 150 und 210 als erste Eingabe: keine Fehlversuche"""
    _pruefe([150], "Druck ok: 150 bar, Fehlversuche: 0")
    _pruefe([210], "Druck ok: 210 bar, Fehlversuche: 0")

def test_drei_fehlversuche():
    """99, 0, 300, 180: drei Fehlversuche, jeder zählt"""
    _pruefe([99, 0, 300, 180], "Druck ok: 180 bar, Fehlversuche: 3")
