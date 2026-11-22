"""Sprech-Markup fuer V17 (ohne Abhaengigkeiten): IP-Adressen und Netze als [[Anzeige|Sprechweise]]."""
ZW = {0: "null", 1: "eins", 2: "zwei", 5: "fünf", 11: "elf", 12: "zwölf", 14: "vierzehn", 20: "zwanzig", 24: "vierundzwanzig", 30: "dreißig", 31: "einunddreißig",
      168: "hundertachtundsechzig", 192: "hundertzweiundneunzig", 255: "zweihundertfünfundfünfzig"}

def ip(s, port=None):
    """IP-Adresse als Markup: Anzeige 192.168.30.11, Sprechweise ausgeschrieben; port=1883 -> ' Port achtzehnhundertdreiundachtzig'."""
    sp = " Punkt ".join(ZW[int(p)] for p in s.split("."))
    if port == 1883: return f"[[{s}:1883|{sp}, Port achtzehnhundertdreiundachtzig]]"
    return f"[[{s}|{sp}]]"

def net(s, praefix=24):
    """Netz mit Praefix: Anzeige 192.168.30.0/24, Sprechweise 'Schraegstrich vierundzwanzig'."""
    sp = " Punkt ".join(ZW[int(p)] for p in s.split("."))
    return f"[[{s}/{praefix}|{sp} Schrägstrich {ZW[praefix]}]]"
