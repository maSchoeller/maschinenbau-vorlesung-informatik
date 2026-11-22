"""Sprechertext V19 Theorie (Quelltext mit Markup): Datenbanken und SQL am Beispiel der Auftragsdatenbank der Fertigungszelle FZ-3."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v19-common"))
from sprech19 import sql, K

Q3 = "SELECT nr, menge FROM auftraege WHERE maschine = 'D2' ORDER BY menge DESC"
Q4 = "SELECT maschine, SUM(menge) FROM auftraege GROUP BY maschine"
Q6 = "SELECT nr FROM auftraege WHERE teil = ?"
NR = K("4711", "vier sieben eins eins")
INJ = K("x' OR '1'='1", "x, Hochkomma, or, Hochkomma, eins gleich Hochkomma eins")
NRS = K("nr", "n r")
V08 = K("V08", "V acht")
SQ3 = K("sqlite3", "S Q Lite drei")
OB = K("O'Brien", "O Brien")
TUP = K("(maschine,)", "Klammer auf, maschine, Komma, Klammer zu")

SRC = [
 ["Morgens fragt die Schichtleitung der Zelle FZ-3: Was liegt heute noch für D2 an?",
  "Bisher steht die Antwort in einer CSV-Liste auf dem Gruppenlaufwerk. Ändern zwei Leute sie gleichzeitig, entstehen zwei Stände.",
  "Ein Datenbankmanagementsystem löst das: Es regelt den Zugriff, prüft Datentypen und beantwortet Fragen ohne eigene Schleife.",
  "Eine Transaktion führt Änderungen ganz oder gar nicht aus. SQLite steckt als einzelne Datei direkt in Python."],
 ["Die Aufträge der Zelle liegen in einer Tabelle namens auftraege.",
  "Jede Zeile ist ein Datensatz, also ein Auftrag. Jede Spalte hat einen Namen und einen Datentyp: INTEGER für ganze Zahlen, TEXT für Text.",
  f"Die Spalte {NRS} ist der Primärschlüssel: eindeutig wie eine Seriennummer. Eine zweite {NR} lehnt die Datenbank ab.",
  "Zum Ändern gibt es INSERT, UPDATE und DELETE, die letzten beiden immer mit WHERE."],
 [f"SQL ist deklarativ: Du sagst, was du willst, nicht wie. In {V08} hast du dafür eine Schleife geschrieben, hier genügt eine Abfrage.",
  f"Zum Beispiel: {sql(Q3)}.",
  "Geschrieben steht SELECT vorn, ausgewertet wird zuerst FROM: Die Tabelle wird geholt.",
  "Dann wirft WHERE die Zeilen weg, die nicht passen.",
  "Danach behält SELECT nur die gewünschten Spalten.",
  "Zuletzt ordnet ORDER BY die Zeilen. Ohne ORDER BY ist die Reihenfolge nicht garantiert."],
 ["Mit GROUP BY sortierst du die Zeilen in Fächer, eines je Maschine, und SUM rechnet je Fach.",
  f"{sql(Q4)}.",
  "Im Fach D2 liegen drei Aufträge: 500 plus 300 plus 800 ergibt 1600. Im Fach F1 zwei: 120 plus 60 ergibt 180.",
  "Aus fünf Zeilen werden zwei, eine je Fach. Python gibt dir das als Liste von Tupeln."],
 ["Jetzt das Suchfeld Teil suchen im Dashboard der Zelle: Das Programm baut den SQL-Text per f-String.",
  f"Jemand tippt {INJ}.",
  "Das Hochkomma beendet den Text, der Rest ist kein Datenwert mehr, sondern SQL-Code.",
  "Eins gleich eins ist für jede Zeile wahr: Alle Aufträge kommen zurück. Das ist SQL-Injection.",
  f"Bei {SQ3} führt execute nur eine Anweisung aus, andere Schnittstellen erlauben mehrere."],
 [f"Die Lösung heißt Platzhalter: {sql(Q6)}. Der Text bleibt fest, den Wert gibst du getrennt als Tupel mit.",
  f"Die Datenbank behandelt ihn nur als Daten: null Treffer, und {OB} geht ebenfalls.",
  f"Bei einem einzelnen Wert gehört das Komma dazu: {TUP}.",
  "Merke: Daten nie in den SQL-Text kleben. Immer Fragezeichen und ein Tupel."],
]

SZENEN = [
 "Links die CSV-Liste auf dem Gruppenlaufwerk mit zwei Bearbeitern, die gleichzeitig ändern, und der Warnung zwei Stände; rechts die Datenbank mit vier Leistungen: gleichzeitiger Zugriff, Regeln und Datentypen, Abfragen, Transaktion; Hinweis SQLite in einer Datei.",
 "Tabelle auftraege mit den Aufträgen 4711 bis 4715; Begriffe Tabelle, Zeile (Datensatz), Spalte, Datentyp und Primärschlüssel werden nacheinander markiert; Fehlermeldung bei doppelter 4711; Leiste INSERT, SELECT, UPDATE, DELETE.",
 "Abfrage mit vier farbigen Klauseln; die Tabelle wird in vier Schritten verarbeitet: FROM holt alle fünf Zeilen, WHERE streicht zwei, SELECT blendet drei Spalten aus, ORDER BY ordnet absteigend; Ergebnis als Liste von Tupeln.",
 "Fünf Auftragszeilen wandern in zwei Fächer D2 und F1; je Fach erscheint die Summe 1600 und 180; Ergebnis als Liste von Tupeln.",
 "Eingabefeld Teil suchen und der SQL-Text mit f-String; die Eingabe wird erst als Datenwert gelb markiert, dann wechselt der Teil nach dem Hochkomma zur Farbe von SQL-Code; je Zeile wird die Bedingung ausgewertet: alle fünf wahr.",
 "Links SQL-Text mit Fragezeichen fest, rechts der Wert als getrenntes Datenpaket; Ergebnis null Treffer; Tupel mit und ohne Komma; Merkkarte: Daten nie in den SQL-Text kleben, immer Fragezeichen und ein Tupel.",
]
