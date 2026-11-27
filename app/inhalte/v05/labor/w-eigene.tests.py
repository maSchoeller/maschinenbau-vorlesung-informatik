def _pruefe(eingaben, soll):
    z = zeilen(run_program([str(e) for e in eingaben]))
    # Zusätzliche Zeilen (z. B. Einsen) sind erlaubt: Es zählt die letzte Zeile, die mit „Sechsen“ beginnt.
    kandidaten = [l for l in z if l.lower().startswith("sechsen")]
    letzte = kandidaten[-1] if kandidaten else (z[-1] if z else "")
    text = ", ".join(str(e) for e in eingaben)
    assert letzte.lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, letzte)

def test_zwei_sechsen():
    """5 Würfe: 6, 1, 6, 3, 4: Sechsen: 2"""
    _pruefe([5, 6, 1, 6, 3, 4], "Sechsen: 2")

def test_ein_wurf():
    """Grenzfall ein Wurf, 6: Sechsen: 1"""
    _pruefe([1, 6], "Sechsen: 1")

def test_keine_sechs():
    """3 Würfe: 1, 2, 3: Sechsen: 0"""
    _pruefe([3, 1, 2, 3], "Sechsen: 0")

def test_kein_wurf():
    """Grenzfall 0 Würfe: Sechsen: 0, die Schleife läuft nie"""
    _pruefe([0], "Sechsen: 0")

def test_letzter_wurf_zaehlt():
    """4 Würfe: 6, 6, 6, 6: Sechsen: 4, auch der letzte Wurf zählt"""
    _pruefe([4, 6, 6, 6, 6], "Sechsen: 4")

def test_fuenf_und_sieben():
    """3 Würfe: 5, 7, 6: Sechsen: 1, nur genau eine 6 zählt, eine 7 ist keine Sechs"""
    _pruefe([3, 5, 7, 6], "Sechsen: 1")
