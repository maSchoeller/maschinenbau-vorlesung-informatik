"""Sprechertext V18 Python-Werkzeugkasten (Quelltext mit Markup): bytes, encode, hashlib, Dateien binaer lesen, Pruefsummen vergleichen."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v18-common"))
from sprech18 import hexsp

HL = "[[hashlib|Hasch-Lib]]"
SHA = "[[sha256|S H A zweihundertsechsundfünfzig]]"
HEXD = "[[hexdigest|Hex-Digest]]"
RB = '[[open(pfad, "rb")|open, Pfad, r b]]'

SRC = [
 ["Ein Hash rechnet mit Bytes, nicht mit Text. Ein `str` ist Text, ein `bytes` sind rohe Bytes, geschrieben mit einem `b` vor den Anführungszeichen.",
  "Mit `encode` und [[UTF-8|U T F acht]] machst du aus Text Bytes. Der Text Drehzahl 1450 hat 13 Zeichen und 13 Bytes.",
  "Ein Ä ist ein Zeichen, aber zwei Bytes. Die Länge kann sich also ändern.",
  "Gibst du einem Hash Text ohne `encode`, gibt es einen `TypeError`."],
 [f"Das Modul {HL} liefert die Hashfunktionen. {SHA} bekommt Bytes und gibt ein Objekt zurück.",
  f"Mit {HEXD} wird daraus der Fingerabdruck als Text: 64 Hex-Zeichen, also 256 Bit.",
  f"Für Drehzahl 1450 beginnt er mit {hexsp('23f2ab28')}.",
  "Es gibt auch [[md5|M D fünf]] und [[sha1|S H A eins]], aber die gelten als gebrochen. Für Sicherheit nimmst du [[sha256|S H A zweihundertsechsundfünfzig]]."],
 ["Eine große Datei liest du nicht auf einmal. Du öffnest sie binär, mit `rb`, und liest in Blöcken zu 4096 Bytes.",
  "Eine Schleife `while True` holt mit `read` den nächsten Block. Ist er leer, ist die Datei zu Ende, und `break` verlässt die Schleife.",
  "Jeder Block geht mit `update` in den Hash. Am Ende gibt `hexdigest` den Fingerabdruck der ganzen Datei.",
  "Diese 64 Zeichen sind die Prüfsumme der Firmware von R1."],
 ["Der Hersteller liefert die Prüfsumme als Datei, mit einer Zeile: erst der Hash, dann zwei Leerzeichen, dann der Dateiname.",
  "Mit `read` liest du den ganzen Text. `split` zerlegt ihn an den Leerzeichen in eine Liste.",
  "Der Eintrag mit Index 0 ist der Hash. Den Dateinamen brauchst du für den Vergleich nicht."],
 ["Beim Vergleich zählt jedes Zeichen: Ein Leerzeichen am Ende oder ein Großbuchstabe macht zwei gleiche Hashes ungleich.",
  "Darum erst `strip`, das entfernt Leerzeichen und Zeilenumbrüche an den Enden, und `lower`, das alles klein schreibt.",
  "Dann prüft ein Vergleich mit zwei Gleichheitszeichen: gleich heißt einspielen, ungleich heißt nicht einspielen.",
  "Merke: bytes für Hashes, binär lesen, blockweise, vor dem Vergleich säubern."],
]

SZENEN = [
 "Zwei Kacheln str (Text) und bytes (b-Präfix); Code mit encode, type und len; Ausgabe class bytes, 13 und 1, 2; Hinweis TypeError ohne encode.",
 "Code mit import hashlib, sha256, hexdigest und len; Ausgabe 64-stelliger Hash von Drehzahl 1450 mit den ersten 8 Hex-Zeichen hervorgehoben; Kachel 64 Hex-Zeichen = 256 bit; rote Karte md5 und sha1 gebrochen.",
 "Code mit sha256-Objekt, open rb, while True, read(4096), break, update, hexdigest; rechts die Firmware-Datei als 16 Blöcke, die nacheinander in den Hash laufen; Ausgabe Prüfsumme.",
 "Inhalt der Prüfsummendatei als Zeile mit Hash, zwei Leerzeichen und Dateiname; Code split()[0]; Zerlegung in Liste mit Index 0 und 1; Ausgabe Hash.",
 "Code mit strip und lower und Vergleich; Ausgaben False und True; Entscheidungskarte gleich einspielen, ungleich nicht einspielen; Merkkarte mit vier Haken.",
]
