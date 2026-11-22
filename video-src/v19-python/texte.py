"""Sprechertext V19 Python-Werkzeugkasten (Quelltext mit Markup): sqlite3, Platzhalter, fetchall, fetchone, commit, typische Fehler."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v19-common"))
from sprech19 import sql, K

SQ3 = K("sqlite3", "S Q Lite drei")
CONN = K("connect", "connect"); CUR = K("cursor", "Kursor"); EXE = K("execute", "execute"); FALL = K("fetchall", "fetch all"); FONE = K("fetchone", "fetch one")
EMANY = K("executemany", "execute many"); COMM = K("commit", "commit"); CLOSE = K("close", "close"); ROWC = K("rowcount", "row count")
MEM = K(":memory:", "memory"); FZ3DB = K("fz3.db", "F Z drei Punkt D B")
ENTP = K("for nr, menge in cur.fetchall()", "for n r, menge in cur Punkt fetch all")
NR = K("4711", "vier sieben eins eins")
TUP1 = K("(maschine,)", "Klammer auf, maschine, Komma, Klammer zu")
TUP0 = K("('D2')", "Klammer auf, D zwei, Klammer zu")
COLS = K("5 columns but 3 values", "five columns but three values")
SELEC = K("SELEC", "Selek")

SRC = [
 [f"Mit dem Modul {SQ3} sprichst du in sechs Schritten mit einer Datenbank: {CONN}, {CUR}, {EXE}, {FALL}, {COMM} und {CLOSE}.",
  f"{CONN} öffnet die Datenbank. Mit dem Namen {MEM} liegt sie nur im Arbeitsspeicher, mit einem Dateinamen wie {FZ3DB} in einer Datei.",
  f"Der {CUR} ist dein Zeiger auf die Datenbank. Über ihn schickst du mit {EXE} den SQL-Text los, hier CREATE TABLE für die Tabelle auftraege."],
 ["Zum Eintragen schreibst du INSERT und je Wert ein Fragezeichen. Die Werte gibst du als Tupel mit, in der Reihenfolge der Spalten.",
  f"Mit {EMANY} trägst du eine ganze Liste von Tupeln auf einmal ein.",
  f"Erst {COMM} macht die Änderungen dauerhaft. Ohne {COMM} sind sie bei einer Datei nach {CLOSE} weg. Im Labor kommt {FZ3DB} bei jedem Lauf frisch."],
 [f"Zum Lesen schickst du SELECT mit {EXE} und holst das Ergebnis mit {FALL}: eine Liste von Tupeln.",
  f"Mit {ENTP} entpackst du jedes Tupel in zwei Variablen.",
  f"{FONE} liefert nur ein Tupel. Findet die Abfrage nichts, ist das Ergebnis None. Prüfe das, bevor du ein Element liest."],
 ["Die Werte gehören nie per f-String in den SQL-Text, sondern ins Tupel: Fragezeichen im Text, Wert im Tupel.",
  f"Ein einzelner Wert braucht das Komma: {TUP1} ist ein Tupel, {TUP0} ist nur der Text D2.",
  "Der hat zwei Zeichen, und die Meldung lautet: Incorrect number of bindings. Die Anweisung braucht einen Wert, du gibst zwei."],
 [f"UPDATE und DELETE brauchen immer ein WHERE. So ändert UPDATE nur den Auftrag {NR}, und {ROWC} zählt eine betroffene Zeile.",
  "Ohne WHERE setzt dieselbe Anweisung den Status aller Aufträge.",
  f"Am Ende gehören {COMM} und {CLOSE} dazu: speichern, dann die Verbindung schließen."],
 ["Diese Meldungen siehst du ständig. No such table: Der Tabellenname stimmt nicht. No such column: der Spaltenname.",
  f"Syntax error near {SELEC}: ein Tippfehler im SQL.",
  "UNIQUE constraint failed: Der Primärschlüssel ist doppelt.",
  f"Und {COLS}: Die Zahl der Platzhalter passt nicht zur Tabelle."],
]

SZENEN = [
 "Kette der sechs Schritte connect, cursor, execute, fetchall, commit, close; Code mit sqlite3.connect, db.cursor und CREATE TABLE; Karte mit zwei Möglichkeiten: :memory: im Arbeitsspeicher oder fz3.db als Datei.",
 "Code mit INSERT und fünf Platzhaltern, executemany mit zwei Tupeln und db.commit; rechts wächst die Tabelle auf drei Zeilen; Stempel gespeichert nach commit; Hinweis fz3.db kommt im Labor bei jedem Lauf frisch.",
 "Code mit SELECT und Platzhalter, fetchall und fetchone; Ausgabe Liste von Tupeln und None; rechts Karten fetchall gleich Liste von Tupeln, fetchone gleich Tupel oder None und das Entpacken in nr und menge.",
 "Code mit Platzhalter und Tupel mit Komma; Ausgabe Tupel mit einem Element; Vergleich ('D2') ist der Text mit zwei Zeichen gegen ('D2',) als Tupel; rote Fehlermeldung Incorrect number of bindings supplied.",
 "Tabelle mit drei Aufträgen: UPDATE mit WHERE ändert nur Zeile 4711 auf fertig, rowcount 1; zweite Tabelle: UPDATE ohne WHERE setzt alle Zeilen auf fertig; Code mit commit und close.",
 "Fünf Fehlermeldungen von sqlite3 untereinander, jeweils mit der Ursache daneben: Tabellenname, Spaltenname, Tippfehler im SQL, Primärschlüssel doppelt, Zahl der Platzhalter.",
]
