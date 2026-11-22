"""Sprech-Markup fuer V18 (ohne Abhaengigkeiten): Hex-Anfaenge von Pruefsummen als [[Anzeige|Sprechweise]]."""
HEX = {"0": "null", "1": "eins", "2": "zwei", "3": "drei", "4": "vier", "5": "fünf", "6": "sechs", "7": "sieben", "8": "acht", "9": "neun",
       "a": "a", "b": "be", "c": "ze", "d": "de", "e": "e", "f": "eff"}

def hexsp(s, mehr=True):
    """Hex-Anfang einer Pruefsumme: Anzeige z. B. 23f2ab28..., Sprechweise Zeichen fuer Zeichen (mehr=True: ', und so weiter')."""
    sp = " ".join(HEX[c] for c in s)
    return f"[[{s}{'…' if mehr else ''}|{sp}{', und so weiter' if mehr else ''}]]"
