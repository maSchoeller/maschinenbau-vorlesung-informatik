def _pruefe(eingaben, verlierer):
    text = ", ".join(str(e) for e in eingaben)
    soll = "Spieler %s nimmt das letzte Holz und verliert" % verlierer
    z = zeilen(run_program([str(e) for e in eingaben]))
    meldungen = [l for l in z if "verliert" in l.lower()]
    assert len(meldungen) == 1, "Bei den Eingaben %s soll genau eine Zeile mit 'verliert' erscheinen. Dein Programm gibt %s solche Zeilen aus." % (text, len(meldungen))
    assert z[-1].lower() == soll.lower(), "Bei den Eingaben %s soll zuletzt '%s' stehen. Dein Programm gibt zuletzt aus: '%s'" % (text, soll, z[-1])

def test_beispiel():
    """3, 3, 3, 2, 1: Spieler 1 nimmt das letzte Holz"""
    _pruefe([3, 3, 3, 2, 1], 1)

def test_spieler_wechseln():
    """3, 3, 3, 3: Spieler 2 nimmt das letzte Holz"""
    _pruefe([3, 3, 3, 3], 2)

def test_zwei_pro_zug():
    """sechsmal 2: Spieler 2 nimmt das letzte Holz"""
    _pruefe([2, 2, 2, 2, 2, 2], 2)

def test_zwoelf_einzeln():
    """zwölfmal 1: Spieler 2 nimmt das letzte Holz (zwölf Züge)"""
    _pruefe([1] * 12, 2)

def test_zu_viel_genommen():
    """4, dann 3, 3, 3, 2, 1: die 4 ist ungültig, Spieler 1 verliert"""
    _pruefe([4, 3, 3, 3, 2, 1], 1)

def test_null_ungueltig():
    """0, dann 3, 3, 3, 2, 1: die 0 ist ungültig, Spieler 1 verliert"""
    _pruefe([0, 3, 3, 3, 2, 1], 1)

def test_negativ_ungueltig():
    """-1, dann 3, 3, 3, 2, 1: die -1 ist ungültig, Spieler 1 verliert"""
    _pruefe([-1, 3, 3, 3, 2, 1], 1)

def test_mehrere_ungueltige_hintereinander():
    """4, 0, -1, dann 3, 3, 3, 2 und 3, 2, 1: alle ungültigen Zahlen werden wiederholt abgefragt"""
    _pruefe([4, 0, -1, 3, 3, 3, 2, 3, 2, 1], 1)

def test_mehr_als_noch_da():
    """3, 3, 3, 2, 2, 1: bei einem Holz ist die 2 ungültig, Spieler 1 nimmt das letzte"""
    _pruefe([3, 3, 3, 2, 2, 1], 1)

def test_mehr_als_noch_da_spaeter_weiter():
    """3, 3, 3, 1, 3, 1, 1: bei zwei Hölzern ist die 3 ungültig, danach geht es weiter, Spieler 2 verliert"""
    _pruefe([3, 3, 3, 1, 3, 1, 1], 2)
