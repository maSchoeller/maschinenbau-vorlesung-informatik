"""Sprechertext V18 Theorie (Quelltext mit Markup): IT-Sicherheit am Beispiel der Fertigungszelle FZ-3."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v18-common"))
from sprech18 import hexsp

SHA = "[[SHA-256|S H A zweihundertsechsundfünfzig]]"
MD5 = "[[MD5|M D fünf]]"
SHA1 = "[[SHA-1|S H A eins]]"
CRA = "[[CRA|C R A]]"

D1 = "[[10. Dezember 2024|zehnten Dezember zweitausendvierundzwanzig]]"
D2 = "[[11. September 2026|elften September zweitausendsechsundzwanzig]]"
D3 = "[[11. Dezember 2027|elften Dezember zweitausendsiebenundzwanzig]]"
D4 = "[[20. Januar 2027|zwanzigsten Januar zweitausendsiebenundzwanzig]]"

SRC = [
 ["Roboter R1 der Zelle FZ-3 soll vom USB-Stick des Servicetechnikers neue Firmware bekommen.",
  "Was ist zu schützen? Vertraulichkeit: Nur Berechtigte sehen die NC-Programme. Integrität: Nichts wird unbemerkt verändert, auch die Firmware nicht. Verfügbarkeit: Die Zelle läuft, wenn man sie braucht.",
  "Dazu die Authentizität: Stammt die Datei vom Hersteller?"],
 ["In der Büro-IT steht die Vertraulichkeit oben, in der Produktion, der OT, die Verfügbarkeit und die Sicherheit von Menschen.",
  "Ein Patch mal eben geht dort nicht: Anlagen laufen 15 bis 25 Jahre.",
  "Security schützt vor Angriffen, Safety schützt Menschen vor Unfällen. Lichtgitter: Safety. Firewall: Security."],
 [f"Eine Hashfunktion macht aus beliebig langen Daten einen Fingerabdruck fester Länge: bei {SHA} 256 Bit, also 64 Hex-Zeichen.",
  f"Aus der Drehzahl 1450 wird {hexsp('23f2')}. Aus 1451 wird {hexsp('2318')}.",
  "Lawineneffekt: Ein Zeichen Unterschied, und etwa die Hälfte der Bits ist anders.",
  f"Zurückrechnen geht nicht. {MD5} und {SHA1} sind gebrochen: Nimm {SHA}."],
 ["Drei Fälle. Erstens: Der Stick ist defekt. Die Prüfsumme erkennt das.",
  "Zweitens: Jemand tauscht nur die Datei. Die Prüfsumme erkennt das, wenn der Sollwert über einen zweiten Weg kommt, etwa von der Herstellerseite.",
  "Drittens: Datei und Prüfsumme sind getauscht. Dann hilft nur eine digitale Signatur: Der Hersteller signiert mit seinem privaten Schlüssel, das Gerät prüft mit dem öffentlichen.",
  "Bei [[Secure Boot|Sikjur Buht]] startet die Steuerung nur signierte Firmware."],
 [f"Der Cyber Resilience Act, kurz {CRA}, gilt für vernetzte Produkte wie Steuerungen und Roboter.",
  f"In Kraft seit dem {D1}, die Meldepflicht seit dem {D2}: Frühwarnung nach 24 Stunden, Meldung nach 72 Stunden. Vollständig ab dem {D3}.",
  "Hersteller müssen sichere Voreinstellungen, Sicherheitsupdates und Schutz vor Manipulation liefern.",
  f"Die Maschinenverordnung gilt ab dem {D4}. Keine Rechtsberatung: Im Betrieb fragt man die Produkt-Compliance."],
 ["Was du in einen KI-Chat schreibst, liegt beim Anbieter.",
  "Nicht hinein gehören personenbezogene Daten, Geschäftsgeheimnisse wie NC-Programme und Zugangsdaten wie Passwörter.",
  "Nutze freigegebene Werkzeuge, nimm Platzhalter statt echter Werte. Faustregel: Würde ich das einer Fremden per E-Mail schicken?",
  "Merke: Soll-Wert über einen zweiten Weg, Signatur gegen Austausch, nichts Vertrauliches in den Prompt."],
]

SZENEN = [
 "Zelle FZ-3 mit Geräten D2, F1, R1, M1, SPS und USB-Stick mit Firmware 3.2.1; vier Karten erscheinen nacheinander: Vertraulichkeit (NC-Programme), Integrität (Firmware), Verfügbarkeit (Zelle läuft), Authentizität (vom Hersteller?).",
 "Zwei Spalten Büro-IT und Produktion (OT) mit Prioritäten und Patch-Praxis; darunter Karten Security (Firewall, schützt vor Angriffen) und Safety (Lichtgitter, schützt Menschen).",
 "Eingabe Drehzahl 1450 und 1451 laufen in den SHA-256-Kasten, rechts die echten Hash-Anfänge; Zähler, wie viele von 256 Bit abweichen; Eigenschaften Einweg, kollisionsresistent, MD5 und SHA-1 gebrochen.",
 "Drei Fallzeilen (defekter Stick, Datei getauscht, Datei und Prüfsumme getauscht) mit Ergebnis der Prüfsumme; darunter Ablauf Signatur: privater Schlüssel, öffentlicher Schlüssel, Secure Boot.",
 "Zeitstrahl Dezember 2024 bis Dezember 2027 mit Marken in Kraft, Meldepflichten, heute (22.11.2026), Maschinenverordnung, vollständig; darunter Pflichtenkarten und Bußgeld.",
 "Zwei Spalten: nicht in den Prompt (Personen, Geschäftsgeheimnisse, Zugangsdaten) und besser (Platzhalter, freigegebene Werkzeuge); Faustregel-Karte; Merkkarte mit drei Haken.",
]
