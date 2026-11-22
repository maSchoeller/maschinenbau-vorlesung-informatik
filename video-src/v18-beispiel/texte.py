"""Sprechertext V18 Beispiel (Quelltext mit Markup), genau briefing/v18-beispiel.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v18-common"))
from sprech18 import hexsp

SHA = "[[SHA-256|S H A zweihundertsechsundfünfzig]]"

SRC = [
 [f"Der Servicetechniker bringt die Firmware 3.2.1 für Roboter R1 auf einem USB-Stick. Der Hersteller veröffentlicht die {SHA}-Prüfsumme auf seiner Download-Seite.",
  "Das Programm berechnet die Prüfsumme der Dateien und vergleicht sie mit dem Soll-Wert: das Original und die Datei vom Stick."],
 ["Der Plan: erst den Soll-Wert aus der Herstellerdatei lesen.",
  "Dann eine Schleife über beide Dateien: Prüfsumme berechnen und mit dem Soll vergleichen.",
  "Gleich heißt: OK, einspielen. Ungleich heißt: Abweichung, nicht einspielen."],
 ["Zeile 5 holt [[hashlib|Hasch-Lib]]. Die Funktion ab Zeile 8 berechnet die Prüfsumme einer Datei, Stück für Stück.",
  "Zeile 10 legt das Hash-Objekt an, Zeile 11 öffnet die Datei mit `rb`: Bytes, nicht Text.",
  "In der Schleife liest Zeile 13 je 4096 Bytes. Ist der Block leer, beendet Zeile 15 die Schleife.",
  "Zeile 16 mischt jeden Block mit `update` ein, Zeile 17 gibt das Ergebnis als [[hexdigest|Hex-Digest]] zurück."],
 ["Zeile 20 öffnet die Prüfsummendatei des Herstellers. Zeile 21 nimmt mit `split` und Index 0 die erste Spalte: den Hash.",
  f"Zeile 22 gibt die ersten 16 Zeichen aus: {hexsp('f457673f9e3b31fd', False)}."],
 ["Die Schleife in Zeile 24 läuft über beide Dateien, Zeile 25 berechnet die Ist-Prüfsumme.",
  "Zeile 26 vergleicht. Das Original stimmt, Zeile 27 meldet OK.",
  f"Die Datei vom Stick nicht: Zeile 29 meldet Abweichung, ihr Hash beginnt mit {hexsp('c01a88af')}.",
  "Ein einziges Bit an Byte 40000 ist gekippt. Nicht einspielen!"],
 [f"Die letzten Zeilen zeigen den Lawineneffekt: Drehzahl 1450 gibt {hexsp('23f2ab28ad6cc6b5', False)}, Drehzahl 1451 gibt {hexsp('2318b47cd742ca40', False)}.",
  "Merke: Soll-Wert über einen zweiten Weg holen, Datei hashen, vergleichen, bei Abweichung nicht einspielen."],
]

SZENEN = [
 "Zelle FZ-3 mit Roboter R1, USB-Stick mit Firmware 3.2.1 und Hersteller-Seite mit SHA-256; drei Dateikarten R1_fw_3.2.1.bin, .sha256 und _usb.bin; Aufgabenkarten.",
 "Programmablaufplan Firmware prüfen: Start, Soll lesen, Schleife je Datei, Prüfsumme berechnen, Entscheidung ist gleich soll, OK einspielen oder Abweichung nicht einspielen, Ende.",
 "Code Zeilen 5 bis 17 getippt; je Satz Markierung; rechts Kacheln: Modul, Bytes statt Text mit rb, Block-Schleife mit 4096, update und hexdigest.",
 "Code Zeilen 20 bis 22; Prüfsummendatei als Zeile mit Hash und Dateiname, split zerlegt, Index 0 markiert; Ausgabezeile Soll f457673f9e3b31fd.",
 "Code Zeilen 24 bis 29 mit Ausgabe; OK grün, ABWEICHUNG rot; Vergleich der Hex-Anfänge; Kachel: ein Bit an Byte 40000 gekippt.",
 "Code Zeilen 31 bis 33 mit Ausgaben 23f2ab28ad6cc6b5 und 2318b47cd742ca40; Lawineneffekt-Karte; Merkkarte mit vier Haken.",
]
