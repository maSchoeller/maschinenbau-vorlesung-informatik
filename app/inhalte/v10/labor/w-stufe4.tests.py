HINWEISE = ("zu klein", "zu groß", "richtig!")

def _lauf(werte, eingaben):
    try:
        return mit_zufall(werte, eingaben)
    except AssertionError as e:
        t = str(e)
        if "name 'geheim' is not defined" in t:
            raise AssertionError("geheim braucht vor der Schleife einen Wert: Zieh die Zahl vor while.\n" + t)
        if "name 'geraten' is not defined" in t:
            raise AssertionError("geraten braucht vor der Schleife einen Startwert: Setz es vor while auf 0.\n" + t)
        if "name 'versuche' is not defined" in t:
            raise AssertionError("versuche braucht vor der Schleife den Startwert 0.\n" + t)
        if "EOFError" in t:
            raise AssertionError("Dein Programm hat mehr Eingaben verlangt als vorgesehen: Wird die Zahl wirklich nur einmal gezogen?\n" + t)
        raise

def _einmal(aufrufe):
    assert aufrufe == [(1, 100)], "Zieh die Zahl genau einmal mit random.randint(1, 100), und zwar vor der Schleife. Dein Programm hat randint %s Mal aufgerufen." % len(aufrufe)

def _pruefe(werte, eingaben, soll, versuche):
    z, aufrufe = _lauf(werte, eingaben)
    _einmal(aufrufe)
    ist = [l for l in z if l.lower() in HINWEISE]
    assert [l.lower() for l in ist] == [s.lower() for s in soll], "Bei den Eingaben %s sollen diese Hinweise erscheinen:\n%s\nDein Programm gibt aus:\n%s" % (", ".join(str(e) for e in eingaben), ausgabe_text(soll), ausgabe_text(ist))
    anz = [l for l in z if l.lower().startswith("versuche")]
    assert len(anz) == 1, "Die Zeile 'Versuche: ...' soll genau einmal erscheinen, nach der Schleife. Dein Programm zeigt sie %s Mal." % len(anz)
    letzte = z[-1] if z else ""
    erwartet = "Versuche: %d" % versuche
    assert letzte.lower() == erwartet.lower(), "Bei den Eingaben %s soll die letzte Zeile '%s' lauten. Dein Programm gibt zuletzt aus: '%s'" % (", ".join(str(e) for e in eingaben), erwartet, letzte)

def test_drei_tipps():
    """Zahl 30, Tipps 50, 20, 30: drei Hinweise, Versuche: 3"""
    _pruefe([30, 99, 5], [50, 20, 30], ["Zu groß", "Zu klein", "Richtig!"], 3)

def test_grenzfall_ein_versuch():
    """Grenzfall Zahl 30, Tipp 30: Richtig!, Versuche: 1"""
    _pruefe([30], [30], ["Richtig!"], 1)

def test_grenzfall_unten():
    """Grenzfall Zahl 1, Tipps 100, 1: Zu groß, Richtig!, Versuche: 2"""
    _pruefe([1], [100, 1], ["Zu groß", "Richtig!"], 2)

def test_vier_tipps():
    """Zahl 50, Tipps 100, 100, 1, 50: vier Hinweise, Versuche: 4"""
    _pruefe([50], [100, 100, 1, 50], ["Zu groß", "Zu groß", "Zu klein", "Richtig!"], 4)

def test_sieben_tipps():
    """Zahl 7, sieben Tipps: der letzte Wert entscheidet, Versuche: 7"""
    _pruefe([7], [50, 25, 12, 6, 9, 8, 7], ["Zu groß", "Zu groß", "Zu groß", "Zu klein", "Zu groß", "Zu groß", "Richtig!"], 7)

def test_gliederung():
    """Gliederung: Die Zufallszahl wird in der Funktion spiel() gezogen"""
    import random, sys
    orte = []
    echt = random.randint
    def fest(a, b):
        orte.append(sys._getframe(1).f_code.co_name)
        return 30
    random.randint = fest
    try:
        run_program(["50", "20", "30"])
    finally:
        random.randint = echt
    assert orte == ["spiel"], "Gliedere dein Spiel: Zieh die Zahl in der Funktion spiel(), vor der Schleife. Dein Programm zieht sie hier: %s." % (", ".join(o if o != "<module>" else "im Hauptprogramm" for o in orte) or "gar nicht")
