"""Sprechertext V07 Python-Werkzeugkasten (Quelltext mit Markup)."""
SRC = [
 ["Heute lernst du, eigene Funktionen zu schreiben.",
  "Eine Funktion beginnt mit dem Wort `def`, dem Namen, Klammern mit den Parametern und einem Doppelpunkt.",
  "Darunter steht der Rumpf, eingerückt um vier Leerzeichen.",
  "Zum Beispiel `def widerstandsmoment(d)`, und im Rumpf: `return math.pi * d ** 3 / 16`.",
  "Wichtig: Beim Schreiben von `def` passiert noch nichts. Die Funktion wird nur bekannt gemacht."],
 ["Aufgerufen wird sie mit dem Namen und Klammern: `widerstandsmoment(30)`.",
  "Der Wert in der Klammer heißt Argument. Er landet im Parameter `d`.",
  "Bei mehreren Parametern zählt die Reihenfolge: `tau(98.8, 30)` bedeutet T gleich [[98.8|achtundneunzig Komma acht]] und d gleich 30.",
  "Du kannst aber auch Namen angeben: `tau(d=30, T=98.8)`. Dann ist die Reihenfolge egal."],
 ["`return` gibt einen Wert an den Aufrufer zurück und beendet die Funktion sofort.",
  "Der häufigste Anfängerfehler: `print` statt `return`.",
  "Ein `print` zeigt den Wert nur auf dem Bildschirm. Die Variable `x = f(3)` bekommt dann `None`, also: nichts.",
  "Und rechnest du damit weiter, kommt ein `TypeError`.",
  "Merke: Rechnen mit `return`, Anzeigen mit `print`."],
 ["Ein Parameter kann einen Default-Wert haben: `def pruefe(tau_vorh, tau_zul=40.0)`.",
  "Wird beim Aufruf nichts angegeben, gilt der Standardwert 40.",
  "Mit `pruefe(30)` wird gegen 40 geprüft, mit `pruefe(30, 25.0)` gegen 25.",
  "Parameter mit Default-Wert stehen immer hinten."],
 ["Variablen, die du in einer Funktion anlegst, sind lokal.",
  "Nach dem Aufruf sind sie verschwunden. Von außen greifst du darauf mit einem `NameError` ins Leere.",
  "Der Docstring in dreifachen Anführungszeichen direkt unter dem `def` beschreibt kurz, was die Funktion tut und in welchen Einheiten.",
  "Typ-Hinweise wie [[d: float|d Doppelpunkt float]] musst du nur lesen können, schreiben musst du sie nicht."],
]

SZENEN = [
 "Code: def widerstandsmoment(d) mit Rumpf und return, Teile farbig beschriftet (def, Name, Parameter, Doppelpunkt, Rumpf).",
 "Code-Zeilen mit Aufrufen tau(98.8, 30) und tau(d=30, T=98.8); Pfeile von Argumenten zu Parametern.",
 "Zwei Varianten nebeneinander: print statt return (x ist None, TypeError) und return (x ist 5301.4).",
 "Code def pruefe(tau_vorh, tau_zul=40.0) und zwei Aufrufe mit Ergebnis.",
 "Frame-Grafik mit lokalen Variablen; NameError beim Zugriff von außen; Docstring und Typ-Hinweis farbig markiert.",
]
