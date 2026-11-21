"""V01 Python: print, Variablen, input. Aufruf: python render.py [text|stills t..|full|mux]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from ext import *
from sprechen import anzeige, sprechfassung, pruefen, tts
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v01-python"; LABEL = "DHBW · Informatik · V01 · Erste Schritte in Python"

class Satz(tuple):
    """(Untertitel, Sprechfassung) mit Quelltext .q (Markup)."""

def S(t):
    """Ein Quelltext mit Markup: Untertitel = anzeige(t), Audio = tts(t) -> sprechfassung(t) (sprechen.py)."""
    r = Satz((anzeige(t), sprechfassung(t))); r.q = t
    return r

SECS = [
 [S("Mit `print` gibst du etwas auf dem Bildschirm aus."),
  S("Text steht in Anführungszeichen, Zahlen schreibst du ohne."),
  S("Du kannst mehrere Argumente übergeben, getrennt durch Kommas."),
  S("Python setzt zwischen die Teile automatisch ein Leerzeichen."),
  S("Und jedes `print` beginnt in einer neuen Zeile.")],
 [S("Eine Variable ist ein Name für einen Wert."),
  S("Mit dem Gleichheitszeichen gibst du einem Wert einen Namen."),
  S("Das nennt man Zuweisung, und es ist keine Gleichung."),
  S("Python liest sie von rechts nach links: Erst wird die rechte Seite berechnet, dann bekommt das Ergebnis den Namen auf der linken Seite."),
  S("Danach kannst du den Namen überall verwenden, wo du den Wert brauchst.")],
 [S("Einer Variablen darfst du jederzeit einen neuen Wert zuweisen."),
  S("Der alte Wert ist dann weg."),
  S("Häufig siehst du `zähler = zähler + 1`."),
  S("Das ist keine Gleichung, sondern eine Anweisung: Nimm den aktuellen Wert, addiere 1 und speichere das Ergebnis unter demselben Namen.")],
 [S("Kommentare beginnen mit einer Raute."),
  S("Python ignoriert alles ab der Raute bis zum Zeilenende."),
  S("Sie erklären dir und anderen, warum etwas im Code steht, zum Beispiel die Einheit."),
  S("Mit `input` liest du eine Eingabe von der Tastatur."),
  S("Der Text in den Klammern erscheint als Aufforderung, und die Antwort speichert Python in einer Variablen."),
  S("Wichtig: `input` liefert immer Text, auch wenn du Ziffern tippst."),
  S("Wie du daraus Zahlen machst, lernst du in Lektion 3.")],
 [S("Für Namen gelten feste Regeln."),
  S("Erlaubt sind Buchstaben, Ziffern und der Unterstrich."),
  S("Ein Name darf nicht mit einer Ziffer beginnen und keine Leerzeichen enthalten."),
  S("Python unterscheidet Groß- und Kleinschreibung: `kraft` und `Kraft` sind zwei verschiedene Namen."),
  S("Wähle sprechende Namen mit Einheit, zum Beispiel [[kraft_n|kraft Unterstrich n]] statt nur `k`.")],
 [S("Zum Schluss: Fehlermeldungen sind keine Strafe, sondern Hinweise."),
  S("Ein `NameError` heißt: Python kennt diesen Namen nicht, hier wegen eines Tippfehlers."),
  S("Die Meldung schlägt sogar den richtigen Namen vor."),
  S("Ein `SyntaxError` heißt: Die Zeile ist grammatisch falsch, hier fehlt ein Komma. Dann läuft das Programm gar nicht erst los."),
  S("Lies immer die letzte Zeile der Meldung und die Zeilennummer darüber."),
  S("Jetzt bist du dran: Tippe alle Beispiele selbst ab und probiere sie aus.")],
]

CG = lambda s: O(s, CODE_G)
CC = lambda s: O(s, CODE_C)
ERR = lambda s: O(s, CODE_R)
IN = lambda p, v: [(p, CODE_T), (v, CODE_N)]

def sc1(f, t, ct):
    heading(f, t, "1 · Ausgeben mit print()")
    pages_scene(f, t, ct, [dict(t0=(0, 0.5),
        code=[((0, 1.0), 'print("Prüfprotokoll")'), ((2, 0.2), 'print("Kraft:", 12000, "N")')],
        out=[((0, 2.2), O("Prüfprotokoll")), ((2, 1.4), O("Kraft: 12000 N"))],
        tiles=[((1, 0.2), "Text", "in Anführungszeichen", DARK), ((1, 1.6), "Zahl", "ohne Anführungszeichen", DARK),
               ((2, 0.8), "Komma", "trennt die Argumente", DARK), ((3, 0.3), "Leerzeichen", "setzt print automatisch dazwischen", GREEN)])],
        code_size=26, con_size=26)

def sc2(f, t, ct):
    heading(f, t, "2 · Variablen und Zuweisung")
    pages_scene(f, t, ct, [
      dict(t0=(0, 0.5), code=[((0, 1.2), "d_mm = 10")], out=[],
           tiles=[((1, 0.3), "Name", "links: d_mm", DARK), ((1, 1.4), "Wert", "rechts: 10", DARK), ((2, 0.3), "Zuweisung", "keine Gleichung", RED)]),
      dict(t0=(3, -0.4),
           code=[(-1, "d_mm = 10"), ((3, 0.4), "flaeche_mm2 = 3.14159 * d_mm * d_mm / 4"), ((4, 0.2), 'print("Fläche in mm²:", flaeche_mm2)')],
           out=[((4, 1.6), O("Fläche in mm²: 78.53975"))],
           tiles=[((3, 1.4), "1. rechts", "der Ausdruck wird berechnet", DARK), ((3, 3.6), "2. links", "das Ergebnis bekommt den Namen", DARK),
                  ((4, 0.6), "Name statt Wert", "überall verwendbar", GREEN)]),
    ], code_size=24, con_size=24)

def sc3(f, t, ct):
    heading(f, t, "3 · Neu-Zuweisung")
    pages_scene(f, t, ct, [
      dict(t0=(0, 0.5), code=[((0, 1.0), "zaehler = 5"), ((0, 2.2), "zaehler = 8"), ((1, 0.0), "print(zaehler)")],
           out=[((1, 1.0), O("8"))],
           tiles=[((1, 0.3), "5 → 8", "der alte Wert ist weg", RED)]),
      dict(t0=(2, -0.3), code=[((2, 0.2), "zaehler = 8"), ((2, 1.4), "zaehler = zaehler + 1"), ((3, 3.0), "print(zaehler)")],
           out=[((3, 4.0), O("9"))],
           tiles=[((3, 0.6), "rechts zuerst", "8 + 1 = 9", DARK), ((3, 1.8), "dann links", "9 wird wieder unter zaehler gespeichert", DARK),
                  ((3, 3.2), "Anweisung", "keine Gleichung", GREEN)]),
    ], code_size=26, con_size=26)

def sc4(f, t, ct):
    heading(f, t, "4 · Kommentare und input()")
    pages_scene(f, t, ct, [
      dict(t0=(0, 0.5),
           code=[((0, 1.0), "# Zugkraft des Prüfstabs"), ((0, 2.3), "kraft_n = 12000   # in Newton"), ((2, 0.0), 'print("Kraft in N:", kraft_n)')],
           out=[((2, 1.2), O("Kraft in N: 12000"))],
           tiles=[((1, 0.2), "#", "Kommentar bis Zeilenende", DARK), ((1, 1.8), "ignoriert", "Python überspringt den Kommentar", DARK),
                  ((2, 2.0), "Warum, nicht was", "z. B. die Einheit", GREEN)]),
      dict(t0=(3, -0.2),
           code=[((3, 0.3), 'name = input("Dein Name: ")'), ((4, 1.0), 'print("Hallo,", name)')],
           out=[((4, 2.5), IN("Dein Name: ", "Ada")), ((4, 3.5), O("Hallo, Ada"))],
           tiles=[((4, 0.6), "input(...)", "Text in Klammern = Aufforderung", DARK), ((5, 0.3), "liefert Text", "auch bei Ziffern", RED),
                  ((6, 0.3), "Zahlen daraus", "erst in Lektion 3", GREEN)]),
    ], code_size=25, con_size=25)

def sc5(f, t, ct):
    heading(f, t, "5 · Namensregeln")
    rows = [(1, "kraft_n", True, "Buchstaben und Unterstrich"), (1, "d2", True, "Ziffer nach dem ersten Zeichen ist erlaubt"),
            (2, "2d", False, "beginnt mit einer Ziffer"), (2, "zug kraft", False, "enthält ein Leerzeichen"),
            (3, "Kraft  ≠  kraft", None, "Groß- und Kleinschreibung zählt"), (4, "k  →  kraft_n", None, "sprechend, mit Einheit")]
    for k, (si, nm, ok, note) in enumerate(rows):
        def fn(d, dy, k=k, nm=nm, ok=ok, note=note):
            y = 130 + k * 82 + dy
            card(d, 60, y, 1160, 70, stripe=False)
            T(d, 90, y + 35, nm, M(30, True), DARK, "lm")
            sz = 28
            while F(sz, 400).getlength(note) > 520 and sz > 18: sz -= 1
            T(d, 520, y + 35, note, F(sz, 400), GREY, "lm")
            if ok is True: check(d, 1150, y + 20, GREEN, 1.0)
            elif ok is False: cross(d, 1150, y + 20, RED, 1.0)
            else: d.ellipse((1148, y + 22, 1176, y + 50), fill=AMBER)
        ti = ct(si) + (0.5 if k % 2 else 0.0)
        rise_(f, t, ti, fn)

def rise_(f, t, ti, fn):
    f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))

TBN = [O("Prüfprotokoll"), CC("Traceback (most recent call last):"), CC('  File "main.py", line 3, in <module>'),
       CC('    print("Kraft in N:", kraft)'), ERR("                         ^^^^^"),
       ERR("NameError: name 'kraft' is not defined. Did you mean: 'kraft_n'?")]
TBS = [CC('  File "main.py", line 2'), CC('    print("Kraft:" kraft_n)'), ERR("          ^^^^^^^^^^^^^^^^"),
       ERR("SyntaxError: invalid syntax. Perhaps you forgot a comma?")]

def sc6(f, t, ct):
    heading(f, t, "6 · Fehlermeldungen lesen")
    pages_scene(f, t, ct, [
      dict(t0=(0, 1.0),
           code=[((1, -3.0), 'print("Prüfprotokoll")'), ((1, -2.2), "kraft_n = 12000"), ((1, -1.4), 'print("Kraft in N:", kraft)')],
           out=[((1, 0.4 + 0.5 * i), s) for i, s in enumerate(TBN)],
           tiles=[((1, 3.2), "NameError", "Python kennt den Namen kraft nicht", RED), ((2, 0.8), "Vorschlag", "Did you mean: 'kraft_n'?", GREEN)]),
      dict(t0=(3, -0.2),
           code=[((3, 0.2), "kraft_n = 12000"), ((3, 1.0), 'print("Kraft:" kraft_n)')],
           out=[((3, 2.0 + 0.5 * i), s) for i, s in enumerate(TBS)],
           tiles=[((3, 3.6), "SyntaxError", "Grammatikfehler: Komma fehlt", RED), ((3, 5.6), "Kein Start", "das Programm läuft gar nicht los", DARK),
                  ((4, 0.4), "Letzte Zeile", "nennt Fehlerart und Ursache", GREEN), ((4, 2.0), "Zeilennummer", "steht direkt darüber", GREEN)]),
    ], code_size=24, con_size=19)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 130, "V01 · Informatik", F(34, 600), GREY)
        T(d, 90, 180, "Erste Schritte", F(104, 700), DARK)
        T(d, 90, 310, "print, Variablen, input", F(52, 400), GREY)
        code_panel(d, 90, 410, 900, ['name = input("Dein Name: ")', 'kraft_n = 12000   # in Newton', 'print("Hallo,", name, kraft_n)'], [0, 0, 0], 9, 32, lineno=False)
        for i, lab in enumerate(("print", "=", "input")):
            d.rounded_rectangle((1030, 410 + i * 62, 1210, 460 + i * 62), 8, fill=RED if i == 1 else DARK)
            T(d, 1120, 435 + i * 62, lab, M(30, True), WHITE, "mm")
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("text", "tts"):
        tot = 0
        for i, sec in enumerate(SECS, 1):
            q = " ".join(x.q for x in sec); sp = sprechfassung(q); tot += len(sp)
            print(f"s{i} ({len(sp)} Z.)")
            for h in pruefen(q): print("  PRUEFEN:", h)
            if sys.argv[1] == "tts": tts(q, os.path.join(HERE, "audio", f"s{i}.mp3"))
            else: open(os.path.join(HERE, "audio", f"s{i}.sprech.txt"), "w", encoding="utf-8").write(sp)
        print("Zeichen gesamt", tot)
    else:
        main(HERE, SECS, SCENES, LABEL, poster, NAME)
