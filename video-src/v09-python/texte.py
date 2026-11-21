"""Sprechertext V09 Python (Quelltext mit Markup)."""
SRC = [
 ["Eine Zeile aus einer Datei ist ein Text. Mit `strip` schneidest du Leerzeichen und den Zeilenumbruch an den Enden ab.",
  "`split` mit dem Trennzeichen in Anführungszeichen zerschneidet den Text und liefert eine Liste aus Texten.",
  "`replace` ersetzt das Komma durch einen Punkt, danach macht `float` aus dem Text eine Zahl.",
  "So holst du `felder[2]` und bekommst [[-3.78|minus drei Komma sieben acht]]."],
 ["Eine Datei öffnest du mit `with open`, dem Namen in Anführungszeichen und `encoding=\"utf-8\"`.",
  "Alles, was die Datei braucht, steht eingerückt unter dem `with`. Am Ende schließt Python die Datei von selbst.",
  "`datei.readlines()` liefert alle Zeilen als Liste. Mit `for zeile in datei` läufst du Zeile für Zeile durch."],
 ["Zum Schreiben öffnest du mit dem Modus `\"w\"`. Vorsicht: Er löscht eine vorhandene Datei sofort.",
  "Mit `aus.write` schreibst du Text. Den Zeilenumbruch [[\\n|backslash n]] hängst du selbst an.",
  "Zahlen wandelst du vorher mit einem f-String um. Für ein deutsches Excel ersetzt du dabei den Punkt durch ein Komma."],
 ["Für Tabellen gibt es das Modul `csv`. `csv.reader` bekommt die Datei und mit `delimiter` das Trennzeichen.",
  "Jede Zeile kommt schon als Liste von Feldern. Ohne `delimiter` gilt das Komma.",
  "`next(leser)` holt die Kopfzeile ab, damit sie nicht als Messwert in die Schleife läuft.",
  "Das Dezimalkomma wandelt das Modul nicht um: `replace` bleibt nötig."],
 ["Mit `try` versuchst du etwas, das schiefgehen kann. Tritt der `ValueError` auf, springt Python in den `except`-Block.",
  "Die übrigen Zeilen im `try`-Block werden dann übersprungen. Danach geht das Programm normal weiter.",
  "Mehrere Fehlerarten stehen als Tupel in Klammern: `except (ValueError, IndexError)`."],
 ["Das Muster für kaputte Zeilen: Im `except`-Block erhöhst du einen Zähler und machst mit `continue` mit der nächsten Zeile weiter.",
  "Schreibe nie ein nacktes `except` ohne Fehlerart. Es fängt jeden Fehler, auch deine Tippfehler, und du merkst es nicht.",
  "Lies Fehlermeldungen von unten nach oben, und gib am Ende aus, wie viele Zeilen du übersprungen hast."],
]

SZENEN = [
 "Code-Ausschnitt mit zeile = \"4,94;-0,13;-3,78\\n\"; die vier Schritte strip, split, replace, float nacheinander, das Ergebnis jeweils darunter (Text, Liste, Text mit Punkt, Zahl).",
 "Code with open(\"bremsen.csv\", encoding=\"utf-8\") as datei: mit farbig markiertem Einrückungsblock; daneben eine Liste aus Zeilen (readlines) und ein Zeilenzähler bei for zeile in datei.",
 "Code mit Modus \"w\" und aus.write; rechts erscheint die erzeugte Datei export.csv mit Nr;Wert und Dezimalkomma. Eine rote Warnung beim Modus w: alter Inhalt weg.",
 "Code import csv, csv.reader mit delimiter, next(leser); Kopfzeile fliegt in die Variable kopf, die Schleife läuft nur über Messzeilen.",
 "Code mit try und except ValueError; ein Pfeil springt bei \"abc\" aus der float-Zeile direkt in den except-Block, die übersprungene Zeile wird durchgestrichen.",
 "Muster mit Zähler kaputt, continue und Ausgabe am Ende; daneben ein durchgestrichenes nacktes except mit rotem Warnzeichen und ein Traceback, der von unten nach oben gelesen wird.",
]
