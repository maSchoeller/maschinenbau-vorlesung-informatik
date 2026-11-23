def test_beispiel():
    """Ausgabe: 'Moment: 98.8 N·m'"""
    z = zeilen(run_program([]))
    assert "Moment: 98.8 N·m" in z, "Erwartet wird die Zeile 'Moment: 98.8 N·m'. Dein Programm gibt aus: %r" % z
