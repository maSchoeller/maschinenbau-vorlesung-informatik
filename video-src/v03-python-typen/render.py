"""Python-Werkstatt: Typen, Umwandlung, f-Strings. Aufruf: python render.py [text|stills t1 t2..|full|mux]
Audio: audio/s1..s6.mp3 (ein Absatz je Abschnitt), Satzzeiten per silencedetect."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "common"))
from core import *
from pages import page_scene, O
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v03-python-typen"; LABEL = "DHBW · Informatik · V03 · Python-Werkstatt"

# (Untertitel, gesprochener Text)
SECS = [
 [("In Python hat jeder Wert einen Typ.", "In Python hat jeder Wert einen Typ."),
  ("Eine ganze Zahl ist ein int, eine Kommazahl ein float, Text ein str und ein Wahrheitswert ein bool.",
   "Eine ganze Zahl ist ein int, eine Kommazahl ein float, Text ein str und ein Wahrheitswert ein bool."),
  ("Mit type() fragst du den Typ ab.", "Mit der Funktion type fragst du den Typ ab."),
  ("Beachte: 25 ist ein int, 25.0 ein float und \"25\" in Anführungszeichen ein str.",
   "Beachte: fünfundzwanzig ist ein int, fünfundzwanzig Punkt null ein float und fünfundzwanzig in Anführungszeichen ein str.")],
 [("Jetzt der wichtigste Stolperstein bei Messwerten: input() liefert immer Text.",
   "Jetzt der wichtigste Stolperstein bei Messwerten: Die Funktion input liefert immer Text."),
  ("Auch wenn du eine Zahl eintippst, steht in der Variablen ein str.", "Auch wenn du eine Zahl eintippst, steht in der Variablen ein str."),
  ("Zum Rechnen wandelst du um: float(input(...)).", "Zum Rechnen wandelst du um: float von input."),
  ("So hast du in einer Zeile gleich eine Zahl.", "So hast du in einer Zeile gleich eine Zahl.")],
 [("Was passiert, wenn du Typen falsch mischst?", "Was passiert, wenn du Typen falsch mischst?"),
  ("int(\"2.5\") ist ein ValueError: Text mit Dezimalpunkt lässt sich nicht direkt in eine Ganzzahl wandeln.",
   "int von Text zwei Punkt fünf ist ein ValueError, denn Text mit Dezimalpunkt lässt sich nicht direkt in eine Ganzzahl umwandeln."),
  ("Der Umweg geht erst über float, dann über int.", "Der Umweg geht erst über float und dann über int."),
  ("\"3\" + 4 ist ein TypeError: Text und Zahl lassen sich nicht addieren.",
   "Und der Text drei plus die Zahl vier ist ein TypeError, denn Text und Zahl lassen sich nicht addieren."),
  ("Lies immer die letzte Zeile der Fehlermeldung: Dort steht, was los ist.", "Lies immer die letzte Zeile der Fehlermeldung: Dort steht, was los ist.")],
 [("Jetzt: Abschneiden gegen Runden.", "Jetzt: Abschneiden gegen Runden."),
  ("int() schneidet die Nachkommastellen ab, in Richtung null: int(2.9) ist 2, int(-2.9) ist -2.",
   "int schneidet die Nachkommastellen ab, in Richtung null: int von zwei Punkt neun ist zwei, und int von minus zwei Punkt neun ist minus zwei."),
  ("round() rundet: round(2.9) ist 3.", "round rundet: round von zwei Punkt neun ist drei."),
  ("Genau bei .5 rundet Python zur nächsten geraden Zahl: round(2.5) ist 2, round(3.5) ist 4.",
   "Genau bei einem halben rundet Python zur nächsten geraden Zahl: round von zwei Punkt fünf ist zwei, round von drei Punkt fünf ist vier."),
  ("Das nennt man Banker's Rounding.", "Das nennt man Bankers Rounding.")],
 [("Für saubere Ausgaben nimmst du f-Strings.", "Für saubere Ausgaben nimmst du f-Strings."),
  ("Vor dem Anführungszeichen steht ein f, in geschweiften Klammern der Wert.", "Vor dem Anführungszeichen steht ein f, und in geschweiften Klammern der Wert."),
  ("Nach dem Doppelpunkt folgt das Format: .2f bedeutet zwei Nachkommastellen.", "Nach dem Doppelpunkt folgt das Format: Punkt zwei f bedeutet zwei Nachkommastellen."),
  ("8.3f macht das Feld 8 Zeichen breit, mit drei Nachkommastellen.", "Acht Punkt drei f macht das Feld acht Zeichen breit, mit drei Nachkommastellen."),
  ("Und e schreibt in wissenschaftlicher Schreibweise.", "Und e schreibt in wissenschaftlicher Schreibweise."),
  ("Das Format ändert nur die Anzeige, nicht den gespeicherten Wert.", "Das Format ändert nur die Anzeige, nicht den gespeicherten Wert.")],
 [("Das Modul math bringt Funktionen mit. Du holst es mit import math.", "Das Modul math bringt Funktionen mit. Du holst es mit import math."),
  ("math.sqrt(2) ist die Wurzel aus 2, math.pi ist die Kreiszahl.", "math Punkt sqrt von zwei ist die Wurzel aus zwei, und math Punkt pi ist die Kreiszahl."),
  ("Weil Floats nie ganz exakt sind, ist 0.1 + 0.2 == 0.3 falsch.", "Weil Floats nie ganz exakt sind, ist null Komma eins plus null Komma zwei gleich null Komma drei: False."),
  ("Vergleiche stattdessen mit math.isclose, und du bekommst True.", "Vergleiche stattdessen mit math Punkt is close, und du bekommst True."),
  ("Probier alles selbst aus!", "Probier alles selbst aus!")],
]

C = lambda s: O(s, CODE_T)
ERR = lambda s: O(s, CODE_R)
IN = lambda p, v: [(p, CODE_T), (v, CODE_N)]

def sc1(f, t, ct):
    heading(f, t, "1 · Datentypen und type()")
    page_scene(f, t, ct, [
      dict(t0=(1, -0.2),
           code=[((1, 0.7), "print(type(42))"), ((1, 2.5), "print(type(3.14))"), ((1, 4.1), 'print(type("Hallo"))'), ((1, 5.7), "print(type(True))")],
           out=[((1, 1.5), O("<class 'int'>")), ((1, 3.3), O("<class 'float'>")), ((1, 5.0), O("<class 'str'>")), ((1, 6.5), O("<class 'bool'>"))],
           tiles=[((1, 0.8), "int", "ganze Zahl, z. B. 42", DARK), ((1, 2.6), "float", "Kommazahl, z. B. 3.14", DARK),
                  ((1, 4.2), "str", 'Text, z. B. "Hallo"', DARK), ((1, 5.8), "bool", "Wahrheitswert: True / False", DARK)]),
      dict(t0=(3, -0.3),
           code=[((3, 0.3), "print(type(25))"), ((3, 1.6), "print(type(25.0))"), ((3, 3.0), 'print(type("25"))')],
           out=[((3, 0.9), O("<class 'int'>")), ((3, 2.2), O("<class 'float'>")), ((3, 3.6), O("<class 'str'>", CODE_R))],
           tiles=[((3, 0.4), "25", "int", DARK), ((3, 1.7), "25.0", "float", DARK), ((3, 3.1), '"25"', "str: Text, kein Zahlenwert", RED)]),
    ])

def sc2(f, t, ct):
    heading(f, t, "2 · input() liefert immer Text")
    page_scene(f, t, ct, [
      dict(t0=(0, 0.6),
           code=[((0, 1.0), 'messwert = input("Messwert in mm: ")'), ((1, 0.2), "print(type(messwert))")],
           out=[((1, 0.8), IN("Messwert in mm: ", "25")), ((1, 1.7), ERR("<class 'str'>"))],
           tiles=[((1, 1.7), "str", 'steht in der Variablen: "25"', RED)]),
      dict(t0=(2, -0.2),
           code=[((2, 0.3), 'messwert = float(input("Messwert in mm: "))'), ((2, 2.0), "print(type(messwert), messwert * 2)")],
           out=[((2, 1.0), IN("Messwert in mm: ", "25")), ((2, 3.0), O("<class 'float'> 50.0", CODE_G))],
           tiles=[((2, 0.5), "float(...)", "wandelt Text in Zahl um", DARK), ((2, 3.0), "float", "50.0 = 25.0 × 2: jetzt rechenbar", GREEN)]),
    ], code_size=23)

def sc3(f, t, ct):
    heading(f, t, "3 · Typfehler lesen")
    TB = O("Traceback (most recent call last):", CODE_C)
    page_scene(f, t, ct, [
      dict(t0=(0, 1.0),
           code=[((1, 0.2), 'print(int("2.5"))')],
           out=[((1, 1.3), TB), ((1, 1.7), ERR("ValueError: invalid literal for int() with base 10: '2.5'"))],
           tiles=[((1, 1.7), "ValueError", "Programm bricht hier ab", RED)]),
      dict(t0=(2, -0.3),
           code=[((2, 0.2), 'print(int(float("2.5")))')],
           out=[((2, 1.2), O("2", CODE_G))],
           tiles=[((2, 0.3), "Neuer Lauf", "mit dem Umweg über float", DARK), ((2, 1.2), "float → int", "Ergebnis 2: der Wert wird abgeschnitten", GREEN)]),
      dict(t0=(3, -0.2),
           code=[((3, 0.3), 'print("3" + 4)')],
           out=[((3, 1.6), TB), ((3, 2.0), ERR('TypeError: can only concatenate str (not "int") to str'))],
           tiles=[((3, 2.0), "TypeError", "Text und Zahl passen nicht zusammen", RED), ((4, 0.6), "Letzte Zeile lesen", "sie nennt Fehlerart und Ursache", GREEN)]),
    ], con_size=21)

def sc4(f, t, ct):
    heading(f, t, "4 · int() schneidet ab, round() rundet")
    page_scene(f, t, ct, [
      dict(t0=(0, 0.5),
           code=[((1, 0.3), "print(int(2.9))"), ((1, 1.0), "print(int(-2.9))"), ((2, 0.2), "print(round(2.9))"),
                 ((3, 0.4), "print(round(2.5))"), ((3, 1.2), "print(round(3.5))")],
           out=[((1, 0.9), O("2")), ((1, 1.6), O("-2")), ((2, 0.9), O("3")), ((3, 1.0), O("2", CODE_R)), ((3, 1.8), O("4", CODE_R))],
           tiles=[((1, 0.4), "int()", "schneidet ab (Richtung null)", DARK), ((2, 0.3), "round()", "rundet auf die nächste ganze Zahl", DARK),
                  ((3, 0.6), "x,5 → gerade", "Bankers Rounding: 2.5 → 2, 3.5 → 4", RED)]),
    ], code_size=26, con_size=24)

def sc5(f, t, ct):
    heading(f, t, "5 · f-Strings und Formate")
    page_scene(f, t, ct, [
      dict(t0=(0, 0.6),
           code=[((1, 0.2), "x = 2.71828"), ((2, 0.3), 'print(f"{x:.2f}")'), ((3, 0.3), 'print(f"|{x:8.3f}|")'),
                 ((4, 0.2), 'print(f"{x:e}")'), ((5, 0.2), "print(x)")],
           out=[((2, 1.3), O("2.72")), ((3, 1.4), O("|   2.718|")), ((4, 1.0), O("2.718280e+00")), ((5, 0.9), O("2.71828", CODE_G))],
           tiles=[((1, 0.4), "{x}", "Wert in geschweiften Klammern", DARK), ((2, 0.5), ".2f", "zwei Nachkommastellen", DARK),
                  ((3, 0.5), "8.3f", "8 Zeichen breit, 3 Nachkommastellen", DARK), ((4, 0.4), "e", "wissenschaftliche Schreibweise", DARK)]),
    ], code_size=26, con_size=24)

def sc6(f, t, ct):
    heading(f, t, "6 · Das math-Modul")
    page_scene(f, t, ct, [
      dict(t0=(0, 0.5),
           code=[((0, 1.2), "import math"), ((1, 0.2), "print(math.sqrt(2))"), ((1, 1.8), "print(math.pi)"),
                 ((2, 0.5), "print(0.1 + 0.2 == 0.3)"), ((3, 0.2), "print(math.isclose(0.1 + 0.2, 0.3))")],
           out=[((1, 0.8), O("1.4142135623730951")), ((1, 2.2), O("3.141592653589793")), ((2, 1.6), O("False", CODE_R)), ((3, 1.4), O("True", CODE_G))],
           tiles=[((1, 0.4), "math.sqrt", "Quadratwurzel", DARK), ((1, 1.9), "math.pi", "Kreiszahl π", DARK),
                  ((2, 0.8), "==  bei float", "unsicher: 0.1 + 0.2 ≠ 0.3", RED), ((3, 0.6), "math.isclose", "Vergleich mit Toleranz", GREEN)]),
    ], code_size=24, con_size=24)
    def end(d, dy):
        d.rounded_rectangle((60, 590 + dy, 820, 660 + dy), 35, fill=RED)
        T(d, 440, 625 + dy, "Probier alles selbst aus!", F(40, 700), WHITE, "mm")
    f.el(ap(t, ct(4), 0.5), end, dy=int((1 - ap(t, ct(4), 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 130, "V03 · Informatik", F(34, 600), GREY)
        T(d, 90, 180, "Python-Werkstatt", F(104, 700), DARK)
        T(d, 90, 310, "Typen, Umwandlung, f-Strings", F(52, 400), GREY)
        code_panel(d, 90, 410, 900, ['x = float(input("Messwert: "))', 'print(f"{x:8.3f} mm")', "print(type(x))"], [0, 0, 0], 9, 32, lineno=False)
        for i, (lab, c) in enumerate((("int", DARK), ("float", DARK), ("str", DARK), ("bool", RED))):
            d.rounded_rectangle((1030, 410 + i * 62, 1210, 460 + i * 62), 8, fill=c)
            T(d, 1120, 435 + i * 62, lab, M(30, True), WHITE, "mm")
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "text":
        tot = 0
        for i, s in enumerate(SECS, 1):
            txt = " ".join(sp for _, sp in s); tot += len(txt)
            print(f"s{i} ({len(txt)} Z., {len(txt.split())} W.): {txt}\n")
            open(os.path.join(HERE, "audio", f"s{i}.txt"), "w", encoding="utf-8").write(txt)
        print("Zeichen gesamt", tot, "Woerter", sum(len(sp.split()) for s in SECS for _, sp in s))
    else:
        main(HERE, SECS, SCENES, LABEL, poster, NAME)
