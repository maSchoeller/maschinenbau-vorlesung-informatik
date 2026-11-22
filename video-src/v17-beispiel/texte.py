"""Sprechertext V17 Beispiel (Quelltext mit Markup), genau briefing/v17-beispiel.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v17-common"))
from sprech17 import ip, net

SRC = [
 ["Die Fertigungszelle FZ-3 liefert ihre Daten als JSON unter einer festen Adresse, hier eine Datei auf dieser Website.",
  "Das Programm soll den Status der Abfrage melden und für jede Maschine prüfen, ob ihre IP-Adresse im Netz der Zelle liegt.",
  "Danach liest es die Werkzeugverschleiße von D2 und baut eine Meldung als JSON für MQTT."],
 ["Der Plan: erst Daten holen und das Netz bestimmen.",
  "Eine Schleife läuft über alle Maschinen und prüft jede Adresse: im Netz oder falsches Netz.",
  "Dann holt das Programm die Details von D2, und eine zweite Schleife prüft die Werkzeuge.",
  "Zum Schluss gibt es die Meldung als JSON aus."],
 ["Die Zeilen 5 bis 7 holen [[json|Jason]], [[ipaddress|I P Address]] und [[requests|Rekwests]].",
  "Zeile 9 legt die Adresse als Variable `URL` ab, relativ zur Seite.",
  "Zeile 11 holt die Datei [[maschinen.json|maschinen Punkt Jason]], und Zeile 12 gibt den Status aus: 200.",
  "Zeile 13 macht aus dem JSON-Text ein Dictionary namens `zelle`."],
 [f"Zeile 15: Unter dem Schlüssel `netz` steht der Text {net('192.168.30.0')}, und [[ip_network|I P Network]] macht daraus ein Netz.",
  "Zeile 16 gibt Zelle, Netz und die nutzbaren Adressen aus: alle Adressen minus zwei, also 254.",
  "Name und Netz stammen aus den Daten, nicht aus dem Programm."],
 ["Die Schleife in Zeile 18 gibt dir jede Maschine als Dictionary.",
  "Zeile 19 macht aus dem Text die Adresse, und Zeile 20 fragt: liegt sie im Netz?",
  "Zeile 24 gibt die Spalten aus. Die Zahl hinter dem Doppelpunkt füllt die Spalte auf: vier Zeichen für die Kennung, fünfzehn für die Adresse, neun für den Status.",
  f"Vier Geräte liegen im Netz. R1 mit {ip('192.168.31.20')} nicht: falsches Netz, und sein Status ist gestört."],
 ["Zeile 27 holt [[D2.json|D zwei Punkt Jason]] und macht mit [[json()|Jason]] gleich ein Dictionary daraus.",
  "Zeile 28 nimmt das innere Dictionary mit dem Verschleiß, und `items` liefert Werkzeug und Prozent.",
  "Nur T4 mit 83 Prozent liegt über 80: wechseln.",
  "Zeile 35 macht mit [[json.dumps|Jason Punkt dumps]] aus dem Dictionary den Text, der per MQTT an das Topic [[fz3/D2/wartung|F Z drei, Schrägstrich, D zwei, Schrägstrich, wartung]] gehen könnte.",
  "Merke: Status prüfen, JSON lesen, Adressen nie als Text vergleichen."],
]

SZENEN = [
 "Zelle FZ-3 als Kachel mit Datei maschinen.json; Pfeil zum Programm; drei Aufgabenkarten: Status melden, IP im Netz prüfen, Werkzeuge von D2 kontrollieren, JSON-Meldung für MQTT.",
 "Programmablaufplan des Zellen-Checks, Knoten erscheinen nacheinander: Daten holen, Status ausgeben, Netz bestimmen, Schleife je Maschine mit Entscheidung im Netz, Details D2, Schleife je Werkzeug mit Verschleiß über 80, Meldung, Ende.",
 "Code Zeilen 5 bis 13 getippt; je Satz eine Gruppe markiert; rechts Kacheln: Module, URL plus Dateiname, Ausgabe HTTP-Status 200, Text wird Dictionary.",
 "Code Zeilen 15 und 16 mit Ausgabezeile Zelle FZ-3, Netz 192.168.30.0/24, 254 nutzbare Adressen; Rechnung 256 minus 2.",
 "Code Zeilen 18 bis 24 links, rechts die fünf Ausgabezeilen; R1 in Rot mit FALSCHES NETZ; Breiten 4, 15, 9 als Spaltenraster.",
 "Code Zeilen 27 bis 35 mit Verschleiß-Balken T1 22 und T4 83 und Grenze 80; Ausgabe D2 Werkzeug T4; JSON-Meldung als Ausgabezeile; Merkkarte.",
]
