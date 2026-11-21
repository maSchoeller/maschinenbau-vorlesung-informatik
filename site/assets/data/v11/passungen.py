"""passungen.py - eigenes Modul zu V11 (Passungen nach ISO 286, alle Maße in mm).

Datei in dieselbe Ordnerebene wie dein Programm legen, dann:
    import passungen
    print(passungen.passungsart(25.000, 25.021, 24.980, 24.993))
"""

# Grenzmaße (unteres, oberes) in mm für das Nennmaß 25 mm (Nennmaßbereich über 24 bis 30 mm)
GRENZMASSE_25 = {
    "H7": (25.000, 25.021),
    "f6": (24.967, 24.980),
    "g6": (24.980, 24.993),
    "h6": (24.987, 25.000),
    "k6": (25.002, 25.015),
    "r6": (25.028, 25.041),
    "s6": (25.035, 25.048),
}


def passungsart(bohrung_min, bohrung_max, welle_min, welle_max):
    """Liefert 'Spielpassung', 'Übermaßpassung' oder 'Übergangspassung'."""
    if bohrung_min >= welle_max:
        return "Spielpassung"
    elif bohrung_max <= welle_min:
        return "Übermaßpassung"
    else:
        return "Übergangspassung"


def hoechstspiel(bohrung_max, welle_min):
    """Höchstspiel = größte Bohrung minus kleinste Welle (negativ: Übermaß)."""
    return round(bohrung_max - welle_min, 3)


def mindestspiel(bohrung_min, welle_max):
    """Mindestspiel = kleinste Bohrung minus größte Welle (negativ: Übermaß)."""
    return round(bohrung_min - welle_max, 3)
