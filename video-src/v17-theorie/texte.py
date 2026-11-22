"""Sprechertext V17 Theorie (Quelltext mit Markup): Netzwerke und Industrie 4.0 am Beispiel der Fertigungszelle FZ-3."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v17-common"))
from sprech17 import ip, net

T_STATUS = "[[fz3/D2/status|F Z drei, Schrägstrich, D zwei, Schrägstrich, status]]"
T_PLUS = "[[fz3/+/status|F Z drei, Plus, status]]"
T_RAUTE = "[[fz3/D2/#|F Z drei, D zwei, Raute]]"
PYZUGRIFF = '[[d2["werkzeugverschleiss_prozent"]["T4"]|d zwei, Schlüssel werkzeugverschleiss prozent, dann Schlüssel T vier]]'

SRC = [
 ["Die Fertigungszelle FZ-3 hat fünf Geräte: Drehmaschine D2, Fräsmaschine F1, Roboter R1, Messmaschine M1 und die Zellensteuerung SPS.",
  "Der Leitstand meldet: R1 antwortet nicht.",
  "Der Roboter ist heil. Nach dem Tausch seiner Steuerung wurde nur eine falsche Adresse eingetragen."],
 [f"Jedes Gerät hat eine IP-Adresse: vier Zahlen bis 255, zusammen 32 Bit. D2 hat {ip('192.168.30.11')}.",
  f"Die Zelle ist das Subnetz {net('192.168.30.0')}: Die ersten 24 Bit, also drei Zahlen, bestimmen das Netz, die letzte das Gerät.",
  "Das ergibt 254 nutzbare Adressen.",
  f"R1 hat {ip('192.168.31.20')}: Die dritte Zahl ist 31 statt 30. Falsches Netz, keine Antwort."],
 ["Bei HTTP fragt ein Client, hier dein Python-Programm, und ein Server antwortet.",
  "Die Anfrage heißt GET und nennt eine Adresse, die URL: Schema, Rechner und Pfad.",
  "Die Antwort beginnt mit einem Statuscode. 200 heißt: in Ordnung. Gibt es die Datei nicht, kommt 404.",
  "Eine API sind feste Adressen, unter denen ein Programm Daten abholt. Prüfe immer erst den Status."],
 ["Die Daten kommen als JSON: Text mit geschweiften Klammern, in dem Schlüssel und Wert stehen, wie bei einem Dictionary.",
  "Ein Wert darf selbst ein Objekt sein. So liegt der Verschleiß von Werkzeug T4 in einem Objekt in einem Objekt.",
  f"In Python liest du ihn mit {PYZUGRIFF}. Das Ergebnis: 83.",
  "Aus einem Objekt wird in Python ein Dictionary."],
 [f"MQTT arbeitet anders: Maschinen publizieren an einen Broker unter einem Topic wie {T_STATUS}.",
  "Wer das Topic abonniert hat, bekommt die Nachricht vom Broker, sonst niemand: Publish und Subscribe.",
  f"Das Plus steht für genau eine Ebene: {T_PLUS} liefert den Status aller Maschinen. Die Raute steht für alles darunter: {T_RAUTE} liefert alles von D2.",
  "Bei HTTP fragst du, wenn du etwas wissen willst: Pull. Bei MQTT bekommst du Bescheid, sobald sich etwas ändert: Push."],
 ["Vernetzte Maschinen, die Daten liefern, heißen [[Industrie 4.0|Industrie vier Punkt null]].",
  "Die Welt der Maschinen heißt OT, die Büro-Welt IT. Die Zelle hat ein eigenes Netz, damit ein Fehler im Büro keine Maschine stoppt. Weitere Standards wie OPC UA kennst du jetzt beim Namen.",
  "Merke: erst die Adresse prüfen, dann den Status, dann die Daten auswerten."],
]

SZENEN = [
 "Netzplan der Zelle FZ-3: Switch in der Mitte, oben Gateway, Broker, SPS, unten D2, F1, M1 und R1; R1 färbt sich rot mit der Meldung keine Antwort; Hinweis falsche Adresse nach Steuerungstausch.",
 "IP-Adresse von D2 als vier Zahlen mit Bits; das Netz /24 färbt die ersten drei Zahlen blau; Kachel 254 nutzbare Adressen; R1 im Vergleich mit rotem Kreuz bei der dritten Zahl 31.",
 "Client links, Server rechts, Pfeil GET und Pfeil Antwort; URL in Schema, Rechner, Pfad zerlegt; Kacheln 200 in Ordnung und 404 nicht gefunden; Karte API.",
 "JSON-Text von D2 links mit hervorgehobenem Pfad zu T4, rechts der Python-Zugriff mit Ergebnis 83 und die Typtabelle JSON gegen Python.",
 "MQTT-Broker in der Mitte, links D2 und M1 publizieren, rechts drei Abonnenten mit Topic und Platzhaltern; Nachrichten laufen nur zu passenden Abonnenten; Vergleich Pull und Push.",
 "Zwei Welten IT und OT mit Trennlinie, Schlagworte Industrie 4.0, MQTT, HTTP, OPC UA; Merkkarte mit drei Haken: Adresse, Status, Daten.",
]
