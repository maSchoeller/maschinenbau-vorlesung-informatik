"""Sprechertext V19 Beispiel (Quelltext mit Markup), genau briefing/v19-beispiel.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v19-common"))
from sprech19 import sql, K

SQ3 = K("sqlite3", "S Q Lite drei")
QA = "SELECT nr, teil, menge FROM auftraege WHERE maschine = ? AND status != ?"
QB = "SELECT maschine, SUM(menge) FROM auftraege GROUP BY maschine"
INJ = K("x' OR '1'='1", "x, Hochkomma, or, Hochkomma, eins gleich Hochkomma eins")
N11 = K("4711", "vier sieben eins eins"); N13 = K("4713", "vier sieben eins drei"); N12 = K("4712", "vier sieben eins zwei"); N14 = K("4714", "vier sieben eins vier")
NRS = K("nr", "n r")

SRC = [
 ["Die Fertigungszelle FZ-3 bekommt eine Auftragsdatenbank.",
  "Das Programm legt eine Tabelle an, trägt fünf Aufträge ein und gibt die offenen Aufträge von D2 aus. Dann rechnet es die Stückzahl je Maschine.",
  "Zum Schluss vergleicht es zwei Wege, eine Eingabe in SQL zu bringen: den unsicheren mit f-String und den sicheren mit Platzhalter."],
 ["Der Plan: Datenbank öffnen, Tabelle anlegen, fünf Aufträge eintragen und mit commit speichern.",
  "Dann eine Abfrage mit einer Schleife über die Treffer: die offenen Aufträge von D2.",
  "Danach die Summe je Maschine.",
  "Zum Schluss der Test mit der Eingabe, einmal unsicher und einmal mit Platzhalter, und die Verbindung schließen."],
 [f"Zeile 4 holt {SQ3}. Zeile 6 öffnet eine Datenbank im Arbeitsspeicher, und Zeile 7 gibt dir den Cursor.",
  f"Die Zeilen 8 bis 14 legen die Tabelle an: {NRS} ist der Primärschlüssel, menge eine ganze Zahl, die anderen Spalten sind Text.",
  "Die Zeilen 16 bis 22 sind eine Liste von fünf Tupeln.",
  "Zeile 23 trägt sie mit executemany ein, mit einem Fragezeichen je Spalte, und Zeile 24 speichert mit commit."],
 ["Zeile 27 legt die Maschine D2 fest.",
  f"Die Zeilen 28 und 29 fragen: {sql(QA)}. Die beiden Werte stehen im Tupel, D2 und fertig.",
  f"Die Schleife in Zeile 30 entpackt jede Zeile in {NRS}, teil und menge.",
  f"Es erscheinen {N11} und {N13}. {N14} ist fertig, und {N12} gehört zu F1."],
 [f"Zeile 34 gruppiert die Aufträge nach der Maschine und summiert die Menge: {sql(QB)}.",
  "D2 hat 500 plus 300 plus 800, also 1600, F1 hat 120 plus 60, also 180.",
  "Zeile 35 gibt das Ergebnis aus: eine Liste von Tupeln."],
 [f"Zeile 38 setzt die Eingabe {INJ}.",
  "Zeile 39 klebt sie per f-String in den SQL-Text, und Zeile 40 führt ihn aus: 5 Treffer, alle Aufträge.",
  "Zeile 43 nimmt den Platzhalter, die Eingabe geht im Tupel mit: 0 Treffer. Zeile 45 schließt die Datenbank.",
  "Merke: Daten nie in den SQL-Text kleben. Immer Fragezeichen und ein Tupel."],
]

SZENEN = [
 "Kachel Auftragsdatenbank der Zelle FZ-3 mit Tabelle auftraege und den Maschinen; Pfeil zum Programm; vier Aufgabenkarten: Tabelle anlegen und fünf Aufträge eintragen, offene Aufträge von D2 ausgeben, Menge je Maschine, f-String gegen Platzhalter.",
 "Programmablaufplan, Knoten erscheinen in vier Gruppen: Datenbank öffnen, Tabelle anlegen, Aufträge eintragen, commit; Abfrage und Schleife über die Treffer; Summe je Maschine; Injection-Test und Verbindung schließen.",
 "Code Zeilen 4 bis 24 getippt, je Satz eine Gruppe markiert; rechts Kacheln Verbindung und Cursor, Tabellenschema mit Primärschlüssel, Liste von fünf Tupeln, die Tabelle füllt sich mit fünf Zeilen.",
 "Code Zeilen 26 bis 31 mit Ausgabe zweier Zeilen; rechts die Tabelle mit Filter: 4712 und 4715 fallen wegen F1 weg, 4714 wegen fertig; die Treffer 4711 und 4713 bleiben.",
 "Code Zeilen 33 bis 35 mit Ausgabe der Liste von Tupeln; rechts fünf Zeilen in zwei Fächern D2 und F1 mit den Summen 1600 und 180.",
 "Code Zeilen 37 bis 45; Ausgabe Unsicher 5 Treffer in Rot und Sicher 0 Treffer in Grün; der SQL-Text mit farbig markierter Eingabe; Merkkarte.",
]
