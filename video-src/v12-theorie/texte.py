"""Sprechertext V12 Theorie (Quelltext mit Markup)."""
SRC = [
 ["Ein Lager in einer Förderanlage meldet seine Temperatur. Laut Lastenheft ist alles unter 70 Grad normal, bis einschließlich 85 Grad gibt es eine Warnung, darüber wird abgeschaltet.",
  "Die KI schreibt die Funktion in Sekunden. Du probierst 20, 75 und 90 Grad: Alles stimmt.",
  "Dann läuft die Anlage mit genau 85 Grad, und sie schaltet ab. Der Fehler fällt nur auf, wenn man genau diesen Wert testet."],
 ["Ein Test vergleicht, was du erwartest, mit dem, was das Programm tatsächlich liefert. Das Erwartete rechnest du vorher von Hand aus der Spezifikation aus.",
  "In Python schreibst du das mit `assert`. Stimmt die Behauptung, passiert nichts. Stimmt sie nicht, bricht Python mit einem `AssertionError` ab, und hinter dem Komma steht deine Meldung.",
  "Ein bestandener Test beweist nicht, dass das Programm richtig ist. Es kommt darauf an, welche Werte du testest."],
 ["Welche Werte? Zuerst die Bereiche der Spezifikation: Sensorfehler, normal, Warnung, abschalten. Aus jedem Bereich genügt ein typischer Wert.",
  "Dann die Grenzen, denn dort sitzen die Fehler. Jede Grenze testest du von beiden Seiten: den letzten Wert, der noch drin ist, und den ersten, der schon draußen ist. Hier [[69,9|neunundsechzig Komma neun]] und 70, dann 85 und [[85,1|fünfundachtzig Komma eins]].",
  "Wie gut deine Tests sind, siehst du an fehlerhaften Varianten, den Mutanten: Ein guter Test scheitert bei jeder von ihnen."],
 ["Es gibt drei Arten von Fehlern. Ein Syntaxfehler verstößt gegen die Schreibregeln. Python meldet ihn, bevor das Programm läuft.",
  "Ein Laufzeitfehler tritt erst beim Ausführen auf: Das Programm bricht ab und druckt einen Traceback.",
  "Ein Logikfehler ist ein Denkfehler. Das Programm läuft ohne Meldung durch und liefert ein falsches Ergebnis, wie das kleiner statt kleiner gleich bei 85 Grad. Nur ein Test findet ihn."],
 ["Den Traceback liest du von unten nach oben. Ganz unten steht die Fehlerart mit der Meldung: Was ist passiert?",
  "Die Zeile darüber ist die Fehlerstelle: Wo ist es passiert? Darüber stehen die Aufrufer: Wie kam es dazu?",
  "Bei einem gescheiterten Test zeigt der Traceback die Stelle des Tests, nicht die des Fehlers. Die Ursache suchst du selbst."],
 ["Dafür gibt es einen Kreislauf. Der Test scheitert. Du stellst eine Hypothese auf: Vermutlich ist die Grenze falsch. Du beobachtest mit `print` oder mit dem Schritt-für-Schritt-Visualisierer. Du korrigierst eine Sache. Dann laufen alle Tests noch einmal.",
  "In [[VS Code|V S Code]] gibt es das als Debugger. Ein Haltepunkt, ein roter Punkt am Zeilenrand, hält das Programm an. Du siehst die Variablen und gehst mit Schritt über oder Schritt hinein weiter.",
  "Das Prüfen ist dein Beitrag: Die KI erzeugt, du prüfst."],
]

SZENEN = [
 "Lagerbock mit Thermometer (flache Vektorgrafik); daneben der Code der KI-Funktion mit drei grünen Haken für 20, 75 und 90 Grad. Dann springt das Thermometer auf genau 85 Grad, ein rotes Abschalten-Symbol erscheint und der Code zeigt hervorgehoben elif t < 85.",
 "Zwei Spalten erwartet und tatsächlich mit einem Gleichheitszeichen; darunter der Code assert zustand(85) == \"warnung\", \"Grenzwert 85 °C falsch eingeordnet\"; bei Fehler erscheint ein roter AssertionError mit der Meldung, bei Erfolg bleibt die Ausgabe leer.",
 "Wie das Explorable Zahlenstrahl: Bereiche Sensorfehler, normal, Warnung, abschalten, Sensorfehler in Farben, an den Grenzen -40, 70, 85, 200 erscheinen Testpunkte auf beiden Seiten; rechts füllt sich eine Liste fehlerhafter Varianten mit grünen Häkchen.",
 "Drei Karten nebeneinander: Syntaxfehler (Code mit fehlendem Doppelpunkt, Meldung vor dem Start), Laufzeitfehler (Traceback mit ZeroDivisionError), Logikfehler (Programm gibt ohne Meldung abschalten aus, erwartet warnung).",
 "Mehrstufiger Traceback mit drei Einträgen; eine Markierung wandert von der Fehlerzeile unten nach oben, daneben leuchtet jeweils die zugehörige Codezeile auf. Beschriftung Was, Wo, Wie kam es dazu.",
 "Kreislauf mit vier Stationen Test scheitert, Hypothese, Beobachten, Korrigieren und Pfeil zurück zu Test; danach ein schematisches VS-Code-Fenster mit rotem Haltepunkt, gelb markierter Zeile, Variablenfenster und Aufrufliste.",
]
