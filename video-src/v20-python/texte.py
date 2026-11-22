"""Sprechertext V20 Python-Werkstatt: Klassen, Attribute, Methoden (Quelltext mit Markup)."""
SRC = [
 ["Eine Klasse beginnst du mit `class` und einem Namen. Wir bauen die Klasse `Welle` mit Durchmesser und Länge. Der Name beginnt groß, und am Ende der Zeile steht ein Doppelpunkt.",
  "Darin steht die Methode [[__init__|init]]. Der erste Parameter heißt immer `self`, danach folgen die Maße.",
  "Mit `self.d = d` speicherst du den Parameter als Attribut im Objekt. Links vom Gleichheitszeichen steht das Attribut, rechts der Parameter."],
 ["Ein Objekt erzeugst du wie einen Funktionsaufruf: `w = Welle(20, 100)`. Das Argument für `self` setzt Python selbst ein.",
  "Ein Attribut liest du mit Punkt: `w.d` ist 20. Du kannst es auch ändern: `w.l = 200`.",
  "Die Änderung betrifft nur dieses eine Objekt. Ein zweites Objekt `Welle(30, 150)` behält seine eigenen Maße."],
 ["Eine Methode ist eine Funktion in der Klasse, mit `self` als erstem Parameter. `volumen` rechnet mit `self.d` und `self.l` und gibt Kubikmillimeter zurück.",
  "Aufgerufen wird sie mit Punkt und Klammern: `w.volumen()`.",
  "Die Methode `masse` hat zusätzlich einen Default-Parameter: `dichte=7.85` für Stahl, die Einheit ist Gramm pro Kubikzentimeter. `w.masse()` ergibt 0,25 Kilogramm, `w.masse(2.70)` rechnet mit Aluminium."],
 ["Objekte kannst du in einer Liste sammeln. `wellen = [Welle(20, 100), Welle(30, 150), Welle(40, 200)]`.",
  "Mit einer for-Schleife rufst du für jedes Objekt dieselbe Methode auf.",
  "Jedes Objekt in der Liste rechnet mit seinen eigenen Maßen. So entsteht eine Baureihe: 0,25, 0,83 und 1,97 Kilogramm."],
 ["Typischer Fehler eins: Du vergisst `self` in der Methodendefinition. Dann meldet Python einen `TypeError`: nimmt 0 Argumente, aber 1 wurde übergeben. Python hat `self` ja selbst übergeben.",
  "Fehler zwei: Du schreibst `d` statt `self.d`. Dann kommt ein `NameError`, denn `d` ist nur ein Parameter von `__init__`, nicht in `volumen` bekannt."],
 ["Fehler drei: Du rufst die Methode ohne Klammern auf. `print(w.volumen)` zeigt keine Zahl, sondern `bound method`: die Methode selbst, nicht ihr Ergebnis.",
  "Merke: `self` in die Definition, `self.` vor jedes Attribut, Klammern beim Aufruf."],
]

SZENEN = [
 "Code class Welle mit __init__, self.d = d, self.l = l.",
 "Objekt erzeugen, Attribut lesen und ändern.",
 "Methoden volumen und masse mit Default-Parameter, Aufrufe.",
 "Objekte in einer Liste, Schleife, Ausgabe.",
 "Fehler self vergessen (TypeError) und d statt self.d (NameError).",
 "Fehler Klammern vergessen (bound method), Merksatz.",
]
