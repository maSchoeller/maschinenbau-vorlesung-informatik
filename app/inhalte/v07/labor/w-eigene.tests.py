def _pruefe(preis, prozent, soll):
    z = zeilen(run_program([str(preis), str(prozent)]))
    # Zusätzliche Zeilen (z. B. ein Sonderpreis) sind erlaubt: Es zählt die letzte Zeile, die mit Endpreis beginnt.
    kandidaten = [l for l in z if l.lower().startswith("endpreis")]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    w = zahlen(letzte)
    assert w and abs(w[-1] - soll) < 0.005, "Bei %s Euro und %s Prozent soll 'Endpreis: %.2f Euro' stehen. Dein Programm gibt aus: '%s'" % (preis, prozent, soll, letzte)

def test_fuenfzehn_prozent():
    """80 Euro, 15 Prozent: Endpreis 68.00 Euro"""
    _pruefe(80, 15, 68.00)

def test_grenzfall_kein_rabatt():
    """Grenzfall 50 Euro, 0 Prozent: Endpreis 50.00 Euro"""
    _pruefe(50, 0, 50.00)

def test_grenzfall_voller_rabatt():
    """Grenzfall 120 Euro, 100 Prozent: Endpreis 0.00 Euro"""
    _pruefe(120, 100, 0.00)

def test_krummer_preis():
    """39.9 Euro, 10 Prozent: Endpreis 35.91 Euro"""
    _pruefe(39.9, 10, 35.91)

def test_fuenfundzwanzig_prozent():
    """60 Euro, 25 Prozent: Endpreis 45.00 Euro"""
    _pruefe(60, 25, 45.00)
