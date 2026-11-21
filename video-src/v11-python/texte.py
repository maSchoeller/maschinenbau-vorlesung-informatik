"""Sprechertext V11 Python (Quelltext mit Markup)."""
SRC = [
 ["Ein Modul holst du mit `import`. Es gibt drei Schreibweisen.",
  "`import math` holt das ganze Modul. Du schreibst immer `math.` vor die Funktion: `math.sqrt(16)`.",
  "`from math import sqrt` holt nur die Funktion. Du schreibst `sqrt(16)` ohne Modulnamen.",
  "`import math as m` gibt dem Modul einen Zweitnamen. Danach heißt es nur noch `m`, und `math.sqrt` ergibt einen NameError."],
 ["Die Standardbibliothek bringt Module mit, die du nur importieren musst.",
  "`math` kennt `sqrt`, `pi` und `isclose`.",
  "`statistics` liefert mit `mean` den Mittelwert, mit `median` den mittleren Wert der sortierten Reihe und mit `stdev` die Standardabweichung der Stichprobe.",
  "`random` liefert Zufallszahlen: `randint(1, 6)` mit beiden Grenzen, `uniform` für Kommazahlen. Mit `seed` wird die Folge reproduzierbar."],
 ["Jede Python-Datei ist ein Modul. Liegt `passungen.py` im selben Ordner, schreibst du `import passungen`, ohne die Endung.",
  "Dann rufst du `passungen.passungsart` mit den vier Maßen auf.",
  "Nenne eigene Dateien nie wie ein Modul der Standardbibliothek: Eine Datei `math.py` verdeckt das echte `math`."],
 ["Es gibt drei neue Fehlermeldungen.",
  "ModuleNotFoundError heißt: Das Paket ist nicht installiert, oder der Name ist falsch oder erfunden.",
  "ImportError heißt: Das Modul wurde gefunden, aber es enthält den Namen nicht.",
  "AttributeError heißt: `math.tolerance` gibt es nicht. Das ist typisch für erfundene KI-Funktionen."],
 ["`pip` installiert Pakete aus dem Paketindex, und zwar im Terminal. `pip install` und der Name holt das Paket.",
  "Mit einer Versionsnummer wie `numpy==2.0.0` legst du die Version fest. `pip list` zeigt, was installiert ist.",
  "Installiere nichts, nur weil KI-Code es importiert. Erst prüfen, ob es das Paket gibt."],
 ["Fünf Fragen vor jedem Prompt: Eingaben, Ausgaben, Einheiten, Grenzfälle, Beispiele.",
  "Die Testfälle schreibst du vorher von Hand, mit der Grenze dabei.",
  "Im Codespace nimmst du einen grauen Vorschlag mit Tab an und lehnst ihn mit Escape ab. Was Copilot liefert, gibst du frei."],
]

SZENEN = [
 "Drei Codezeilen untereinander (import math, from math import sqrt, import math as m) mit je einem Namensschild darunter: math.sqrt, sqrt, m.sqrt. Bei der dritten wird math.sqrt rot durchgestrichen mit der Meldung NameError.",
 "Drei Werkzeugkisten math, statistics, random mit je drei Werkzeugen: sqrt, pi, isclose; mean, median, stdev; randint, uniform, seed. Daneben jeweils ein kurzer Aufruf mit Ergebnis.",
 "Zwei Dateien nebeneinander: passungen.py mit der Funktion passungsart und ein Programm mit import passungen. Ein Pfeil führt vom Aufruf in die Datei. Ein Warnschild an einer Datei math.py.",
 "Drei rote Fehlermeldungen als Karten: ModuleNotFoundError, ImportError, AttributeError, je mit einer Zeile Code darüber und einer kurzen Bedeutung.",
 "Terminalfenster mit pip install numpy, pip install numpy==2.0.0 und pip list. Ein Pfeil führt zu einer Wolke Paketindex. Ein Warnschild an einem erfundenen Paketnamen.",
 "Fünf Haken (Eingaben, Ausgaben, Einheiten, Grenzfälle, Beispiele), dann ein Editor mit grauem Vorschlag; Tab und Esc leuchten auf.",
]
