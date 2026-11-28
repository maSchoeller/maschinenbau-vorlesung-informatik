def _ist_schaltjahr(j):
    return (j % 4 == 0 and j % 100 != 0) or j % 400 == 0

def _pruefe(jahr):
    soll = _ist_schaltjahr(jahr)
    z = zeilen(run_program([str(jahr)]))
    # Die Eingabeaufforderung enthält nicht das Wort Schaltjahr: Es zählt die letzte Zeile, die das Wort enthält.
    kandidaten = [l for l in z if "schaltjahr" in l.lower()]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    t = letzte.lower()
    if "kein schaltjahr" in t:
        ist = False
    elif "ein schaltjahr" in t:
        ist = True
    else:
        ist = None
    erwartet = "ist ein Schaltjahr" if soll else "ist kein Schaltjahr"
    assert ist is soll, "Bei %s soll '%s %s' erscheinen. Dein Programm gibt aus: '%s'" % (jahr, jahr, erwartet, letzte)

def test_zweitausendvierundzwanzig():
    """2024: ist ein Schaltjahr"""
    _pruefe(2024)

def test_zweitausenddreiundzwanzig():
    """2023: ist kein Schaltjahr"""
    _pruefe(2023)

def test_grenzfall_neunzehnhundert():
    """Grenzfall 1900: ist kein Schaltjahr, durch 100 teilbar"""
    _pruefe(1900)

def test_zweitausend():
    """2000: ist ein Schaltjahr, durch 400 teilbar"""
    _pruefe(2000)

def test_zweitausendeinhundert():
    """2100: ist kein Schaltjahr"""
    _pruefe(2100)

def test_zweitausendachtundzwanzig():
    """2028: ist ein Schaltjahr"""
    _pruefe(2028)
