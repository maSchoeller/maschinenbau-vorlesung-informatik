def _pruefe(betrag, monate):
    z = zeilen(run_program([str(betrag), str(monate)]))
    # Eingabeaufforderungen sind nicht vorgegeben (auch input() ohne Text ist richtig): Es zählen nur die letzten Zeilen, je Monat eine.
    gedruckt = z[len(z) - monate:] if monate else [l for l in z if l.lower().startswith('monat ')]
    soll = [[float(m), float(m * betrag)] for m in range(1, monate + 1)]
    ist = [zahlen(l) for l in gedruckt]
    text = "\n".join("Monat %s: %s Euro" % (m, m * betrag) for m in range(1, monate + 1))
    assert ist == soll, "Bei %s Euro und %s Monaten sollen diese Zeilen erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (betrag, monate, text if text else "(keine)", ausgabe_text(gedruckt))

def test_drei_monate():
    """50 Euro, 3 Monate: Monat 1: 50, Monat 2: 100, Monat 3: 150"""
    _pruefe(50, 3)

def test_grenzfall_ein_monat():
    """Grenzfall 1 Monat, 20 Euro: Monat 1: 20 Euro"""
    _pruefe(20, 1)

def test_grenzfall_kein_monat():
    """Grenzfall 0 Monate: keine Zeile, der Rumpf läuft nie"""
    _pruefe(50, 0)

def test_zwoelf_monate():
    """25 Euro, 12 Monate: zwölf Zeilen, die letzte Monat 12: 300 Euro"""
    _pruefe(25, 12)
