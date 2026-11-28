def _zaehle(geheim):
    tipps = []
    echt = globals()["hinweis"]
    def zaehl(geraten, g):
        tipps.append(geraten)
        assert len(tipps) <= 7, "Für die Zahl %s braucht dein Computer mehr als 7 Tipps. Die ersten Tipps waren: %s" % (geheim, ", ".join(str(t) for t in tipps))
        return echt(geraten, g)
    globals()["hinweis"] = zaehl
    try:
        n = computer_raet(geheim)
    finally:
        globals()["hinweis"] = echt
    return n, tipps

def test_hoechstens_sieben():
    """Für jede Zahl von 1 bis 100 reichen höchstens 7 Tipps"""
    for g in range(1, 101):
        n, tipps = _zaehle(g)
        assert n <= 7, "Für die Zahl %s gibt dein Computer %s Versuche zurück, erlaubt sind höchstens 7." % (g, n)

def test_rueckgabe_stimmt():
    """Die Rückgabe ist die Zahl der Tipps, der letzte Tipp ist die gesuchte Zahl"""
    for g in (1, 2, 17, 50, 73, 99, 100):
        n, tipps = _zaehle(g)
        assert n == len(tipps), "Für die Zahl %s hat dein Computer %s Tipps gefragt, gibt aber %s zurück." % (g, len(tipps), n)
        assert tipps and tipps[-1] == g, "Für die Zahl %s soll der letzte Tipp die Zahl selbst sein. Dein letzter Tipp war %s." % (g, tipps[-1] if tipps else "keiner")

def test_erster_tipp_gleich():
    """Der erste Tipp hängt nicht von der gesuchten Zahl ab"""
    erste = set()
    for g in (3, 40, 77, 100):
        n, tipps = _zaehle(g)
        erste.add(tipps[0] if tipps else None)
    assert len(erste) == 1, "Der erste Tipp darf deine Zahl nicht kennen. Für die Zahlen 3, 40, 77 und 100 hat dein Computer verschieden angefangen: %s" % ", ".join(sorted(str(e) for e in erste))

def test_grenzfall_eins():
    """Grenzfall Zahl 1"""
    n, tipps = _zaehle(1)
    assert tipps and tipps[-1] == 1, "Für die Zahl 1 soll der letzte Tipp 1 sein."

def test_grenzfall_hundert():
    """Grenzfall Zahl 100"""
    n, tipps = _zaehle(100)
    assert tipps and tipps[-1] == 100, "Für die Zahl 100 soll der letzte Tipp 100 sein."
