from helfer import E, S

LD = "Listen, Tupel & Dicts"
DF = "Dateien & Fehler"
TX = "Text & Formatierung"
RE = "Rechnen"
AU = "Ausblick (ab V10)"

# ───────────── V08 ─────────────
E("liste", "Liste", LD, "V08", "kopf",
  "Eine geordnete, veränderbare Sammlung von Werten.",
  "liste = [wert1, wert2, ...]",
  "Eine Liste hält mehrere Werte unter einem Namen, zum Beispiel eine Messreihe oder eine Stückliste. Die Werte stehen in eckigen Klammern, durch Komma getrennt, und behalten ihre Reihenfolge. Du kannst einzelne Elemente lesen und ändern, Elemente anhängen und die Liste mit for durchlaufen.",
  '''
  messwerte = [20.1, 20.4, 19.9]
  print(messwerte)
  messwerte[0] = 20.0
  print(messwerte)
  leer = []
  print(len(leer))
  ''',
  "Sobald du mehr als ein paar zusammengehörige Werte hast: Messreihen, Stücklisten, Ergebnisse.",
  [("Stückliste mit Texten", 'teile = ["Welle", "Lager", "Dichtung"]\nprint(teile)'),
   ("Gemischte Typen sind erlaubt", 'zeile = ["M10", 10, 49.5]\nprint(zeile)'),
   ("Liste mit Schleife füllen", 'quadrate = []\nfor i in range(5):\n    quadrate.append(i * i)\nprint(quadrate)')],
  [("Komma zwischen den Werten vergessen", 'werte = [1 2 3]'),
   ("Index außerhalb der Liste", 'werte = [1, 2, 3]\nprint(werte[3])')],
  ["append", "index", "len", "slicing", "for-liste"],
  bez=["list", "[]"])

E("append", "append()", LD, "V08", "kopf",
  "Hängt ein Element ans Ende einer Liste an.",
  "liste.append(wert)",
  "append() verändert die Liste direkt und gibt selbst nichts zurück (genauer: None). Deshalb darfst du das Ergebnis nicht wieder der Liste zuweisen. Mit append() baust du Ergebnislisten in Schleifen auf.",
  '''
  messwerte = []
  for i in range(1, 4):
      messwerte.append(i * 10.5)
  print(messwerte)
  ''',
  "Beim schrittweisen Sammeln von Ergebnissen oder Messwerten.",
  [("Nur gültige Werte sammeln", 'gueltig = []\nfor x in [3, -1, 7, -4]:\n    if x > 0:\n        gueltig.append(x)\nprint(gueltig)'),
   ("Mehrere Elemente auf einmal anhängen", 'a = [1, 2]\na.extend([3, 4])\nprint(a)')],
  [("append auf einem Tupel", 't = (1, 2)\nt.append(3)'),
   ("Ergebnis von append zugewiesen", 'liste = [1, 2]\nliste = liste.append(3)\nprint(len(liste))')],
  ["liste", "len", "tupel"],
  bez=[".append"])

E("len", "len()", LD, "V08", "kopf",
  "Anzahl der Elemente (oder Zeichen).",
  "len(objekt)",
  "len() zählt die Elemente einer Liste, eines Tupels oder Dictionaries und die Zeichen eines Textes. Der letzte gültige Index einer Liste ist len(liste) - 1. Der Mittelwert einer Liste ergibt sich aus sum(liste) / len(liste).",
  '''
  messwerte = [20.1, 20.4, 19.9, 20.2]
  print(len(messwerte))
  print(sum(messwerte) / len(messwerte))
  print(len("Welle"))
  ''',
  "Für Mittelwerte, Schleifen über Indizes und Abfragen wie „ist die Liste leer?“.",
  [("Liste leer?", 'daten = []\nif len(daten) == 0:\n    print("keine Daten")'),
   ("Alle Indizes durchlaufen", 'w = [5, 6, 7]\nfor i in range(len(w)):\n    print(i, w[i])')],
  [("len auf einer Zahl", 'len(5)'),
   ("Letztes Element mit len(liste) statt len(liste) - 1", 'w = [1, 2, 3]\nprint(w[len(w)])')],
  ["liste", "index", "sum-min-max"])

E("index", "Index [ ]", LD, "V08", "kopf",
  "Greift auf ein einzelnes Element zu – gezählt ab 0.",
  "liste[0]    liste[-1]",
  "Das erste Element hat den Index 0, das zweite 1 und so weiter. Negative Indizes zählen von hinten: -1 ist das letzte Element. Ein Index außerhalb der Liste ist ein IndexError. Einzelne Zeichen eines Textes erreichst du genauso.",
  '''
  teile = ["Welle", "Lager", "Dichtung", "Schraube"]
  print(teile[0])
  print(teile[-1])
  print("Welle"[1])
  ''',
  "Wenn du ein bestimmtes Element brauchst: das erste, das letzte, das n-te.",
  [("Erste und letzte Messung vergleichen", 'w = [20.0, 20.5, 21.3]\nprint(w[-1] - w[0])'),
   ("Zeile einer Tabelle als Liste", 'zeile = ["M10", 10, 49.5]\nprint("Schraube", zeile[0], "hat", zeile[2], "N")')],
  [("Index zu groß", 'w = [1, 2, 3]\nprint(w[5])'),
   ("Index als Fließkommazahl", 'w = [1, 2, 3]\nprint(w[1.0])')],
  ["liste", "slicing", "len"],
  bez=["[0]", "[-1]"])

E("slicing", "Slicing [von:bis]", LD, "V08", "kopf",
  "Schneidet einen Teil einer Liste oder eines Textes heraus.",
  "liste[start:stop]    liste[start:stop:schritt]",
  "Bei liste[a:b] ist das Element a dabei, b nicht (wie bei range). Lässt du eine Grenze weg, gilt Anfang bzw. Ende. Negative Werte zählen von hinten. Ein Slice liefert immer eine neue Liste, auch wenn er leer ist, und löst keinen IndexError aus.",
  '''
  m = [10, 20, 30, 40, 50]
  print(m[1:4])
  print(m[:2])
  print(m[-2:])
  print(m[::2])
  ''',
  "Zum Herausgreifen von Teilbereichen: erste drei Werte, letzte zwei, jeder zweite.",
  [("Die ersten drei Messwerte", 'w = [5, 6, 7, 8, 9]\nprint(w[:3])'),
   ("Kopie einer Liste", 'a = [1, 2, 3]\nb = a[:]\nb.append(4)\nprint(a, b)'),
   ("Liste umkehren", 'print([1, 2, 3][::-1])')],
  [("Komma statt Doppelpunkt", 'm = [1, 2, 3, 4]\nprint(m[1,3])'),
   ("Slice über das Ende hinaus: kein Fehler", 'm = [1, 2, 3]\nprint(m[1:10])', "(keine Fehlermeldung) Ausgabe: [2, 3] – Slices schneiden nur ab, was da ist.")],
  ["index", "liste", "len"],
  bez=[":"])

E("for-liste", "for über eine Liste", LD, "V08", "kopf",
  "Jedes Element einer Liste der Reihe nach bearbeiten.",
  "for element in liste:\n    anweisungen",
  "Die Schleifenvariable nimmt nacheinander jedes Element der Liste an – ohne dass du Indizes brauchst. Brauchst du auch die Position, nimm enumerate(). Verändere die Liste nicht, während du darüber läufst.",
  '''
  gewichte_kg = [12.5, 8.0, 3.2]
  gesamt = 0
  for g in gewichte_kg:
      gesamt += g
  print(gesamt, "kg")
  for i, g in enumerate(gewichte_kg):
      print(i, g)
  ''',
  "Für fast jede Auswertung einer Liste: summieren, filtern, ausgeben.",
  [("Grenzwertverletzungen melden", 'for p in [5.1, 6.8, 5.9]:\n    if p > 6:\n        print("zu hoch:", p)'),
   ("Zwei Listen parallel durchlaufen", 'namen = ["A", "B"]\nwerte = [1.5, 2.5]\nfor n, w in zip(namen, werte):\n    print(n, w)')],
  [("Liste während der Schleife verändern", 'w = [1, 2, 3, 4]\nfor x in w:\n    if x % 2 == 0:\n        w.remove(x)\nprint(w)', "(keine Fehlermeldung) Ausgabe: [1, 3] – hier zufällig richtig, aber bei anderen Daten werden Elemente übersprungen. Besser eine neue Liste aufbauen."),
   ("Schleifenvariable ändern ändert die Liste nicht", 'w = [1, 2, 3]\nfor x in w:\n    x = x * 10\nprint(w)', "(keine Fehlermeldung) Ausgabe: [1, 2, 3] – x ist nur eine Kopie des Wertes.")],
  ["for", "liste", "range", "zaehler-summe"])

E("sum-min-max", "sum(), min(), max()", LD, "V08", "kopf",
  "Summe, kleinster und größter Wert einer Liste.",
  "sum(liste)    min(liste)    max(liste)",
  "Diese drei Funktionen ersetzen viele Schleifen. Der Mittelwert ist sum(liste) / len(liste). Auf eine leere Liste angewendet, lösen min() und max() einen ValueError aus.",
  '''
  werte = [20.1, 20.4, 19.9, 20.2]
  print(sum(werte))
  print(min(werte), max(werte))
  print("Spannweite:", max(werte) - min(werte))
  print("Mittelwert:", sum(werte) / len(werte))
  ''',
  "Für die Statistik einer Messreihe.",
  [("Zwei Zahlen vergleichen", 'print(max(3, 8), min(3, 8))'),
   ("Größtes Element eines Textes (alphabetisch)", 'print(max(["Welle", "Lager", "Zahnrad"]))')],
  [("Summe über Texte", 'sum(["a", "b"])'),
   ("Maximum einer leeren Liste", 'max([])')],
  ["len", "liste", "sorted", "zaehler-summe"],
  bez=["sum", "min", "max"])

E("sorted", "sorted() / sort()", LD, "V08", "kopf",
  "Sortiert eine Liste.",
  "sorted(liste)    sorted(liste, reverse=True)    liste.sort()",
  "sorted() liefert eine neue, sortierte Liste und lässt das Original unverändert. liste.sort() sortiert die Liste selbst und gibt None zurück. Mit reverse=True sortierst du absteigend. Alle Elemente müssen vergleichbar sein.",
  '''
  werte = [3.2, 1.5, 2.8]
  print(sorted(werte))
  print(sorted(werte, reverse=True))
  print(werte)
  werte.sort()
  print(werte)
  ''',
  "Für Ranglisten, Medianbestimmung, Ausreißer finden.",
  [("Median einer ungeraden Zahl Werte", 'w = sorted([7, 1, 5])\nprint(w[len(w) // 2])'),
   ("Nach Länge sortieren", 'print(sorted(["Welle", "Ei", "Lager"], key=len))')],
  [("Zahlen und Text mischen", 'sorted([3, "a", 1])'),
   ("Ergebnis von sort() zugewiesen", 'l = [3, 1, 2]\nl = l.sort()\nprint(l)', "(keine Fehlermeldung) Ausgabe: None – sort() verändert die Liste und gibt None zurück.")],
  ["liste", "sum-min-max"],
  bez=["sorted", "sort"])

E("tupel", "Tupel", LD, "V08", "kopf",
  "Wie eine Liste, aber unveränderlich.",
  "t = (wert1, wert2)    a, b = t",
  "Ein Tupel hat runde Klammern und lässt sich nach dem Anlegen nicht mehr ändern. Das passt zu Dingen, die zusammengehören und fest sind, etwa Koordinaten. Mit dem „Auspacken“ x, y = punkt verteilst du die Werte auf Variablen. Funktionen, die mehrere Werte zurückgeben, liefern ein Tupel.",
  '''
  punkt = (10.5, 20.0)
  x, y = punkt
  print(x, y)
  print(punkt[0])
  ''',
  "Für feste Wertegruppen wie Koordinaten oder mehrere Rückgabewerte.",
  [("Tupel mit einem Element braucht das Komma", 't = (5,)\nprint(type(t), len(t))'),
   ("Mehrere Rückgabewerte", 'def min_max(a, b):\n    return min(a, b), max(a, b)\n\nprint(min_max(7, 3))'),
   ("Werte tauschen nutzt Tupel", 'a, b = 1, 2\na, b = b, a\nprint(a, b)')],
  [("Element eines Tupels ändern", 'punkt = (1, 2)\npunkt[0] = 5'),
   ("Zu viele Werte beim Auspacken", 'a, b = (1, 2, 3)')],
  ["liste", "dict", "return"])

E("dict", "Dictionary (dict)", LD, "V08", "kopf",
  "Speichert Werte unter Schlüsseln – wie ein Datenblatt.",
  "d = {'schluessel': wert}    d['schluessel']    d['neu'] = wert",
  "Ein Dictionary verbindet Schlüssel mit Werten, etwa Eigenschaften eines Bauteils. Du greifst mit dem Schlüssel in eckigen Klammern zu, nicht mit einer Nummer. Neue Einträge legst du einfach per Zuweisung an. Ein nicht vorhandener Schlüssel führt zu einem KeyError.",
  '''
  bauteil = {"name": "Welle", "laenge_mm": 250, "werkstoff": "C45"}
  print(bauteil["name"])
  bauteil["masse_kg"] = 1.2
  print(bauteil)
  ''',
  "Für Datensätze mit benannten Feldern: Bauteil, Messung, Konfiguration.",
  [("Zahl pro Bauteilnummer ablegen", 'lager = {"A-17": 12, "B-04": 3}\nlager["A-17"] += 5\nprint(lager)'),
   ("Wert ändern", 'd = {"d": 10}\nd["d"] = 12\nprint(d)'),
   ("Anzahl Einträge", 'd = {"a": 1, "b": 2}\nprint(len(d))')],
  [("Schlüssel nicht vorhanden", 'bauteil = {"name": "Welle"}\nprint(bauteil["preis"])'),
   ("Liste als Schlüssel", 'd = {}\nd[[1, 2]] = "x"')],
  ["dict-get", "dict-items", "liste"],
  bez=["dict", "{}"])

E("dict-get", "dict.get()", LD, "V08", "kopf",
  "Liest einen Wert und liefert einen Ersatzwert, wenn der Schlüssel fehlt.",
  "d.get(schluessel)    d.get(schluessel, ersatz)",
  "d[key] bricht mit KeyError ab, wenn der Schlüssel fehlt. d.get(key) gibt dann None zurück, d.get(key, 0) einen Ersatzwert deiner Wahl. Praktisch zum Zählen und für optionale Felder.",
  '''
  bauteil = {"name": "Welle", "laenge_mm": 250}
  print(bauteil.get("name"))
  print(bauteil.get("preis"))
  print(bauteil.get("preis", 0))
  ''',
  "Wenn ein Schlüssel fehlen darf.",
  [("Häufigkeiten zählen", 'zaehler = {}\nfor w in ["a", "b", "a"]:\n    zaehler[w] = zaehler.get(w, 0) + 1\nprint(zaehler)'),
   ("Optionales Feld mit Vorgabe", 'cfg = {"tol": 0.05}\nprint(cfg.get("einheit", "mm"))')],
  [("Eckige statt runde Klammern", 'd = {"a": 1}\nprint(d.get["a"])'),
   ("Fehlender Wert ist None und lässt sich nicht verrechnen", 'd = {"a": 1}\nprint(d.get("b") + 1)')],
  ["dict", "dict-items"],
  bez=[".get", "get"])

E("dict-items", "dict.items(), keys(), values()", LD, "V08", "kopf",
  "Ein Dictionary durchlaufen.",
  "for k, v in d.items():    d.keys()    d.values()",
  "d.items() liefert Schlüssel-Wert-Paare, die du in der for-Schleife direkt in zwei Variablen auspackst. d.keys() sind die Schlüssel, d.values() die Werte. Läufst du nur über d, bekommst du nur die Schlüssel.",
  '''
  lager = {"A-17": 12, "B-04": 3, "C-22": 0}
  for nr, menge in lager.items():
      print(nr, "->", menge)
  print(sum(lager.values()))
  print(list(lager.keys()))
  ''',
  "Für Auswertungen über alle Einträge eines Dictionaries.",
  [("Nur Einträge mit Bestand", 'lager = {"A": 5, "B": 0}\nfor k, v in lager.items():\n    if v > 0:\n        print(k)'),
   ("Prüfen, ob ein Schlüssel vorhanden ist", 'd = {"a": 1}\nprint("a" in d, "b" in d)')],
  [("Zwei Variablen für die Schlüsselschleife", 'd = {"abc": 1}\nfor k, v in d:\n    print(k, v)'),
   ("Dictionary beim Durchlaufen ändern", 'd = {"a": 1, "b": 2}\nfor k in d:\n    d[k + "x"] = 0')],
  ["dict", "dict-get", "for"],
  bez=[".items", "items", "keys", "values"])

# ───────────── V09 ─────────────
E("split", "str.split()", TX, "V09", "kopf",
  "Zerlegt einen Text in eine Liste von Teilen.",
  "text.split(trenner)    text.split()",
  "split(';') schneidet den Text an jedem Semikolon und liefert die Teile als Liste von Texten. Ohne Argument trennt split() an beliebigen Leerzeichen. Die Teile bleiben Text: Für Rechnungen musst du sie mit float() oder int() umwandeln.",
  '''
  zeile = "12.5;13.1;12.9"
  teile = zeile.split(";")
  print(teile)
  summe = 0
  for t in teile:
      summe += float(t)
  print(summe / len(teile))
  ''',
  "Beim Lesen von Zeilen aus Dateien und bei Eingaben mit mehreren Werten.",
  [("Wörter zählen", 'satz = "Welle Lager  Dichtung"\nprint(len(satz.split()))'),
   ("Zwei Zahlen aus einer Zeile", 'a, b = "3.5 4.5".split()\nprint(float(a) + float(b))')],
  [("split auf einer Liste", '[1, 2].split(",")'),
   ("Leeres Stück am Ende wird umgewandelt", 'teile = "1;2;".split(";")\nfor t in teile:\n    print(float(t))')],
  ["strip", "join", "csv-reader", "typumwandlung"],
  bez=["split"])

E("strip", "str.strip()", TX, "V09", "kopf",
  "Entfernt Leerzeichen und Zeilenumbrüche an Anfang und Ende.",
  "text.strip()    text.strip(zeichen)",
  "Zeilen aus Dateien enden mit einem Zeilenumbruch \\n. strip() schneidet Leerzeichen, Tabs und Umbrüche an beiden Enden ab, nicht in der Mitte. Mit lstrip() und rstrip() nur links bzw. rechts.",
  '''
  zeile = "  20.5\\n"
  print(repr(zeile))
  sauber = zeile.strip()
  print(repr(sauber), float(sauber) * 2)
  ''',
  "Direkt nach dem Lesen einer Zeile, bevor du sie auswertest.",
  [("Bestimmte Zeichen abschneiden", 'print("###Titel###".strip("#"))'),
   ("Nur rechts abschneiden", 'print(repr("Text  \\n".rstrip()))')],
  [("strip auf einer Zahl", 'x = 5\nprint(x.strip())'),
   ("strip wirkt nicht in der Mitte", 'print("a  b".strip())', "(keine Fehlermeldung) Ausgabe: a  b – innere Leerzeichen bleiben stehen.")],
  ["split", "with-open", "join"],
  bez=["strip"])

E("join", "str.join()", TX, "V09", "kopf",
  "Setzt eine Liste von Texten zu einem Text zusammen.",
  "trenner.join(liste_von_texten)",
  "Der Trenner steht vor dem Punkt: \", \".join(liste) verbindet alle Elemente mit Komma und Leerzeichen. Alle Elemente müssen Text sein; Zahlen wandelst du vorher mit str() um.",
  '''
  teile = ["Welle", "Lager", "Dichtung"]
  print(", ".join(teile))
  zahlen = [1.5, 2.5, 3.0]
  texte = []
  for z in zahlen:
      texte.append(str(z))
  print(";".join(texte))
  ''',
  "Zum Erzeugen von CSV-Zeilen und lesbaren Aufzählungen.",
  [("Pfad zusammenbauen", 'print("/".join(["daten", "2026", "messung.csv"]))'),
   ("Ohne Trenner zusammenfügen", 'print("".join(["a", "b", "c"]))')],
  [("Zahlen in der Liste", '",".join([1, 2, 3])'),
   ("join mit vertauschten Rollen", 'print(["a", "b"].join(","))')],
  ["split", "str-text", "fstring"],
  bez=["join"])

E("with-open", "with open()", DF, "V09", "kopf",
  "Öffnet eine Datei und schließt sie sicher wieder.",
  "with open(name, modus, encoding='utf-8') as datei:",
  "open() öffnet eine Datei zum Lesen (\"r\"), Schreiben (\"w\") oder Anhängen (\"a\"). Mit with schließt Python die Datei am Ende des Blocks automatisch, auch bei Fehlern. Mit for zeile in datei läufst du Zeile für Zeile durch die Datei. Gib encoding='utf-8' an, damit Umlaute auf jedem Rechner stimmen.",
  '''
  with open("messung.txt", "w", encoding="utf-8") as datei:
      datei.write("20.5\\n21.0\\n19.8\\n")

  with open("messung.txt", encoding="utf-8") as datei:
      for zeile in datei:
          print(float(zeile.strip()))
  ''',
  "Für jedes Lesen und Schreiben von Textdateien: Messdaten, Protokolle, Konfiguration.",
  [("Ganze Datei als Text lesen", 'with open("t.txt", "w", encoding="utf-8") as f:\n    f.write("Hallo\\nWelt\\n")\nwith open("t.txt", encoding="utf-8") as f:\n    print(f.read())'),
   ("An eine Datei anhängen", 'with open("log.txt", "a", encoding="utf-8") as f:\n    f.write("Start\\n")\nprint(open("log.txt", encoding="utf-8").read())')],
  [("Datei existiert nicht", 'with open("gibt_es_nicht.txt") as f:\n    text = f.read()'),
   ("Nach dem with-Block weiterlesen", 'with open("x.txt", "w") as f:\n    f.write("a")\nf.write("b")')],
  ["csv-reader", "try-except", "strip", "split"],
  bez=["open", "with"])

E("csv-reader", "csv.reader()", DF, "V09", "lesen",
  "Liest CSV-Dateien Zeile für Zeile als Listen von Texten.",
  "import csv\ncsv.reader(datei, delimiter=';')",
  "CSV-Dateien sind Tabellen als Text, die Spalten durch ein Trennzeichen getrennt. csv.reader zerlegt jede Zeile für dich in eine Liste von Texten. Deutsche Excel-Dateien benutzen meist ; als Trennzeichen. Alle Werte sind zunächst Text, auch die Zahlen; die erste Zeile ist oft eine Kopfzeile, die du überspringen musst.",
  '''
  import csv

  with open("messung.csv", "w", encoding="utf-8") as f:
      f.write("zeit_s;kraft_n\\n0;0.0\\n1;12.5\\n2;24.9\\n")

  with open("messung.csv", encoding="utf-8") as f:
      leser = csv.reader(f, delimiter=";")
      kopf = next(leser)
      print(kopf)
      for zeile in leser:
          print(float(zeile[0]), float(zeile[1]))
  ''',
  "Für Messdaten aus Excel, Messgeräten oder phyphox-Exports.",
  [("Spalte aufsummieren", 'import csv\nwith open("d.csv", "w", encoding="utf-8") as f:\n    f.write("a;b\\n1;2\\n3;4\\n")\nwith open("d.csv", encoding="utf-8") as f:\n    r = csv.reader(f, delimiter=";")\n    next(r)\n    s = 0\n    for z in r:\n        s += float(z[1])\n    print(s)'),
   ("Alle Zeilen als Liste von Listen", 'import csv, io\nr = csv.reader(io.StringIO("1,2\\n3,4"))\nprint(list(r))')],
  [("Kopfzeile als Zahl umgewandelt", 'import csv, io\nr = csv.reader(io.StringIO("zeit;kraft\\n1;2"), delimiter=";")\nfor z in r:\n    print(float(z[0]))'),
   ("Falsches Trennzeichen: nur eine Spalte", 'import csv, io\nr = csv.reader(io.StringIO("1;2;3"))\nfor z in r:\n    print(z[1])')],
  ["with-open", "split", "typumwandlung", "try-except"],
  bez=["csv"])

E("try-except", "try / except", DF, "V09", "kopf",
  "Fängt Fehler ab, damit das Programm weiterläuft.",
  "try:\n    riskanter_code\nexcept ValueError:\n    ersatz",
  "Im try-Block steht Code, der scheitern kann. Tritt der genannte Fehler auf, springt Python in den except-Block, statt abzubrechen. Nenne den erwarteten Fehlertyp (ValueError, FileNotFoundError …) und fange nie alles pauschal ab, sonst verschwinden echte Fehler. Der Programmfluss danach läuft normal weiter.",
  '''
  for text in ["12.5", "abc", "7"]:
      try:
          wert = float(text)
          print("OK:", wert)
      except ValueError:
          print("Keine Zahl:", text)
  ''',
  "Bei Eingaben, Dateien und Umwandlungen, die schiefgehen können.",
  [("Datei fehlt", 'try:\n    with open("fehlt.txt") as f:\n        text = f.read()\nexcept FileNotFoundError:\n    print("Datei nicht gefunden")'),
   ("Division durch null abfangen", 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Nenner ist null")'),
   ("Wiederholen bis die Eingabe stimmt", 'versuche = ["x", "3,5", "3.5"]\nfor v in versuche:\n    try:\n        zahl = float(v)\n        break\n    except ValueError:\n        print("ungültig:", v)\nprint(zahl)')],
  [("try ohne except", 'try:\n    x = 1'),
   ("Falscher Fehlertyp wird nicht abgefangen", 'try:\n    int("abc")\nexcept TypeError:\n    print("nie erreicht")')],
  ["typumwandlung", "with-open", "eingabe-pruefen"],
  bez=["try", "except"])

# ───────────── Stichwörter ab V10 ─────────────
S("list-comprehension", "List Comprehension", AU, "V10", "lesen",
  "Baut eine Liste in einer Zeile: [x * 2 for x in daten if x > 0].",
  "[ausdruck for x in folge if bedingung]", ["for-liste", "liste"], bez=["comprehension"])
S("tokenizer", "Tokenizer", AU, "V10", "lesen",
  "Zerlegt Text in Tokens, die kleinsten Einheiten eines Sprachmodells.",
  "text.split()  → vereinfachter Tokenizer", ["split"])
S("import", "import & Module", AU, "V11", "kopf",
  "Holt fremden Code in dein Programm: import modul, from modul import name.",
  "import modul    from modul import name    import modul as kurz", ["import-math"], bez=["from"])
S("pip", "pip install", AU, "V11", "lesen",
  "Installiert zusätzliche Pakete aus dem Internet (Terminal).",
  "pip install paketname", [])
S("assert", "assert", AU, "V12", "kopf",
  "Bricht mit Fehler ab, wenn eine Annahme nicht stimmt: assert x > 0, 'Meldung'.",
  "assert bedingung, 'Meldung'", ["if", "try-except"])
S("traceback", "Traceback lesen", AU, "V12", "kopf",
  "Die Fehlermeldung von unten nach oben lesen: letzte Zeile = Fehlerart, davor die Stelle im Code.",
  "Traceback (most recent call last): ...", ["try-except"])
S("numpy-array", "NumPy-Array", AU, "V13", "lesen",
  "Schnelles Feld aus Zahlen, mit dem sich ganze Reihen auf einmal rechnen lassen.",
  "import numpy as np\nnp.array([1, 2, 3])", ["liste"], bez=["numpy", "np"])
S("vektorisierung", "Vektorisierung", AU, "V13", "lesen",
  "Rechnen auf ganzen Arrays statt in Schleifen: a * 2 + b.",
  "arr * 2 + 1", ["numpy-array", "for"])
S("zeit-messen", "Zeit messen (time)", AU, "V13", "lesen",
  "Laufzeit eines Programmteils messen: time.perf_counter().",
  "import time\nstart = time.perf_counter()", ["import"], bez=["time"])
S("matplotlib-plot", "matplotlib: plot()", AU, "V14", "lesen",
  "Zeichnet Diagramme: plt.plot(x, y), Achsenbeschriftung nicht vergessen.",
  "import matplotlib.pyplot as plt\nplt.plot(x, y)\nplt.show()", ["liste"], bez=["matplotlib", "plt"])
S("pandas-dataframe", "pandas: DataFrame", AU, "V15", "lesen",
  "Tabelle im Speicher mit Spaltennamen; read_csv, Filtern, groupby, describe.",
  "import pandas as pd\ndf = pd.read_csv('daten.csv')", ["csv-reader", "dict"], bez=["pandas", "pd", "read_csv", "groupby"])
S("pathlib", "pathlib / os", AU, "V16", "lesen",
  "Dateien und Ordner finden und durchsuchen.",
  "from pathlib import Path\nPath('.').glob('*.csv')", ["with-open"], bez=["Path", "os"])
S("json", "json", AU, "V17", "lesen",
  "Austauschformat für Daten, sieht fast aus wie ein dict.",
  "import json\njson.loads(text)", ["dict"])
S("requests", "requests (HTTP)", AU, "V17", "delegieren",
  "Fragt Daten von einer Web-API ab.",
  "import requests\nrequests.get(url).json()", ["json"])
S("hashlib", "hashlib", AU, "V18", "delegieren",
  "Bildet Prüfsummen (Hashes) von Daten oder Dateien.",
  "import hashlib\nhashlib.sha256(daten).hexdigest()", [])
S("sqlite3", "sqlite3 (SQL)", AU, "V19", "lesen",
  "Eingebaute Datenbank: Tabellen abfragen mit SQL und Platzhaltern.",
  "import sqlite3\ncon = sqlite3.connect('daten.db')", ["dict"], bez=["sql"])
S("class", "class", AU, "V20", "lesen",
  "Eigener Datentyp mit Attributen und Methoden, z. B. ein parametrisches Bauteil.",
  "class Bauteil:\n    def __init__(self, laenge):\n        self.laenge = laenge", ["def"], bez=["__init__", "self"])

# ───────────── V12 ─────────────
TE = "Testen & Fehlersuche"

E("testfunktion", "Testfunktion", TE, "V12", "lesen",
  "Eine Funktion test_...(), die mit assert prüft, ob deine Funktion das Richtige liefert.",
  "def test_name():\n    assert funktion(eingabe) == erwartet\n    print(\"bestanden\")\n\ntest_name()",
  "Eine Testfunktion ist eine kleine Funktion ohne Parameter, deren Name mit test_ beginnt. Darin steht pro Prüfung eine assert-Zeile: links der Aufruf deiner Funktion, rechts der Wert, den du von Hand aus der Spezifikation bestimmt hast. Stimmt alles, läuft die Funktion bis zum Ende und gibt „bestanden“ aus. Scheitert ein assert, bricht der Test mit AssertionError ab. Wichtig: Die Testfunktion läuft nur, wenn du sie selbst aufrufst.",
  '''
  def zustand(t):
      if t < -40 or t > 200:
          return "sensorfehler"
      if t < 70:
          return "normal"
      if t <= 85:
          return "warnung"
      return "abschalten"

  def test_zustand():
      assert zustand(20) == "normal"
      assert zustand(69.9) == "normal"
      assert zustand(70) == "warnung"
      assert zustand(85) == "warnung"
      assert zustand(85.1) == "abschalten"
      assert zustand(-41) == "sensorfehler"
      print("bestanden")

  test_zustand()
  ''',
  "Sobald du eine Funktion geschrieben hast und wissen willst, ob sie für typische Werte und Grenzfälle stimmt, und nach jeder späteren Änderung wieder.",
  [("Drehzahl-Ampel prüfen", 'def ampel(n):\n    if n < 0:\n        return "ungueltig"\n    if n < 3000:\n        return "gruen"\n    if n <= 4500:\n        return "gelb"\n    return "rot"\n\ndef test_ampel():\n    assert ampel(-1) == "ungueltig"\n    assert ampel(0) == "gruen"\n    assert ampel(2999) == "gruen"\n    assert ampel(3000) == "gelb"\n    assert ampel(4500) == "gelb"\n    assert ampel(4501) == "rot"\n    print("bestanden")\n\ntest_ampel()'),
   ("Gleitkommazahlen mit math.isclose vergleichen", 'import math\n\ndef kmh_in_ms(v):\n    return v / 3.6\n\ndef test_kmh_in_ms():\n    assert math.isclose(kmh_in_ms(36), 10)\n    assert math.isclose(kmh_in_ms(0), 0, abs_tol=1e-9)\n    assert math.isclose(kmh_in_ms(100), 27.7778, rel_tol=1e-4)\n    print("bestanden")\n\ntest_kmh_in_ms()'),
   ("Mehrere Tests nacheinander aufrufen", 'def verdoppeln(x):\n    return 2 * x\n\ndef test_positiv():\n    assert verdoppeln(3) == 6\n\ndef test_null():\n    assert verdoppeln(0) == 0\n\ntest_positiv()\ntest_null()\nprint("alle bestanden")')],
  [("Test scheitert: Funktion liefert etwas anderes", 'def zustand(t):\n    if t <= 70:\n        return "normal"\n    return "warnung"\n\ndef test_zustand():\n    assert zustand(70) == "warnung"\n    print("bestanden")\n\ntest_zustand()'),
   ("Testfunktion mit Argument aufgerufen", 'def test_null():\n    assert 0 == 0\n\ntest_null(5)')],
  ["assert", "assertion-error", "testfaelle-liste", "def", "grenzwerte-testen"],
  bez=["Testfunktion"])

E("testfaelle-liste", "Testfälle als Liste", TE, "V12", "lesen",
  "Alle Testfälle als Liste von Tupeln (Eingabe, erwartet) und eine Schleife, die sie abarbeitet.",
  "faelle = [(eingabe1, erwartet1), (eingabe2, erwartet2)]\nfor eingabe, erwartet in faelle:\n    assert funktion(eingabe) == erwartet, f\"...\"",
  "Statt dutzende assert-Zeilen zu schreiben, legst du die Testfälle als Liste von Tupeln an: erst die Eingabe, dann das erwartete Ergebnis. Die Schleife entpackt jedes Tupel in zwei Namen und prüft den Fall. Hinter dem Komma des assert steht eine Meldung als f-String, die den scheiternden Fall nennt, sonst weißt du nicht, welcher von vielen Fällen schuld ist. Neue Fälle brauchen nur eine neue Zeile in der Liste.",
  '''
  def ampel(n):
      if n < 0:
          return "ungueltig"
      if n < 3000:
          return "gruen"
      if n <= 4500:
          return "gelb"
      return "rot"

  faelle = [
      (-1, "ungueltig"),
      (0, "gruen"),
      (2999, "gruen"),
      (3000, "gelb"),
      (4500, "gelb"),
      (4501, "rot"),
  ]
  for eingabe, erwartet in faelle:
      ergebnis = ampel(eingabe)
      assert ergebnis == erwartet, f"ampel({eingabe}): erwartet {erwartet}, bekommen {ergebnis}"
  print("alle", len(faelle), "Fälle bestanden")
  ''',
  "Wenn du viele Eingaben mit bekannten Ergebnissen prüfen willst, besonders alle Grenzwerte einer Funktion.",
  [("Temperatur-Zustände", 'def zustand(t):\n    if t < -40 or t > 200:\n        return "sensorfehler"\n    if t < 70:\n        return "normal"\n    if t <= 85:\n        return "warnung"\n    return "abschalten"\n\nfaelle = [(-41, "sensorfehler"), (-40, "normal"), (69, "normal"), (70, "warnung"), (85, "warnung"), (86, "abschalten"), (200, "abschalten"), (201, "sensorfehler")]\nfor t, erwartet in faelle:\n    assert zustand(t) == erwartet, f"zustand({t}) lieferte {zustand(t)}, erwartet {erwartet}"\nprint("bestanden")'),
   ("Mit math.isclose bei Dezimalzahlen", 'import math\n\ndef kmh_in_ms(v):\n    return v / 3.6\n\nfaelle = [(0, 0.0), (36, 10.0), (72, 20.0), (-36, -10.0)]\nfor kmh, erwartet in faelle:\n    ergebnis = kmh_in_ms(kmh)\n    assert math.isclose(ergebnis, erwartet, abs_tol=1e-9), f"{kmh} km/h: {ergebnis}, erwartet {erwartet}"\nprint("bestanden")')],
  [("Ein Fall ist falsch: die Meldung nennt ihn", 'def ampel(n):\n    if n < 3000:\n        return "gruen"\n    return "rot"\n\nfaelle = [(0, "gruen"), (3000, "gelb")]\nfor eingabe, erwartet in faelle:\n    assert ampel(eingabe) == erwartet, f"ampel({eingabe}): erwartet {erwartet}"'),
   ("Tupel hat nicht zwei Werte", 'faelle = [(1, 2), (3, 4, 5)]\nfor eingabe, erwartet in faelle:\n    print(eingabe, erwartet)')],
  ["testfunktion", "tupel", "liste", "for-liste", "fstring", "assert"],
  bez=["Testfälle"])

E("except-as", "except … as fehler", TE, "V12", "lesen",
  "Fängt einen Fehler ab und gibt dir das Fehlerobjekt, dessen Meldung du ausgeben kannst.",
  "try:\n    ...\nexcept AssertionError as fehler:\n    print(fehler)",
  "Mit as gibst du dem abgefangenen Fehler einen Namen. print(fehler) zeigt dann die Meldung, die hinter dem Komma des assert steht. So läuft eine Testschleife auch nach einem gescheiterten Fall weiter, und du bekommst am Ende eine Übersicht statt nur den ersten Fehler. Ein Zähler für die gescheiterten Fälle zeigt, wie viele es insgesamt waren.",
  '''
  def zustand(t):
      if t < 70:
          return "normal"
      if t < 85:
          return "warnung"
      return "abschalten"

  faelle = [(20, "normal"), (70, "warnung"), (85, "warnung"), (90, "abschalten")]
  gescheitert = 0
  for t, erwartet in faelle:
      try:
          assert zustand(t) == erwartet, f"zustand({t}): erwartet {erwartet}, bekommen {zustand(t)}"
      except AssertionError as fehler:
          print("FEHLER:", fehler)
          gescheitert += 1
  print(gescheitert, "von", len(faelle), "Fällen gescheitert")
  ''',
  "Wenn ein Test nicht beim ersten Fehler stoppen soll, sondern alle gescheiterten Fälle melden soll. Auch für andere Fehler, deren Meldung du anzeigen willst.",
  [("Meldung eines ValueError ausgeben", 'try:\n    zahl = float("abc")\nexcept ValueError as fehler:\n    print("Eingabe ungültig:", fehler)'),
   ("Fehlerart mit ausgeben", 'try:\n    print(10 / 0)\nexcept ZeroDivisionError as fehler:\n    print(type(fehler).__name__, "-", fehler)'),
   ("Gescheiterte Fälle sammeln", 'def ampel(n):\n    return "gruen" if n < 3000 else "rot"\n\nfaelle = [(0, "gruen"), (3000, "gelb"), (5000, "rot"), (4000, "gelb")]\nschlecht = []\nfor n, erwartet in faelle:\n    try:\n        assert ampel(n) == erwartet\n    except AssertionError:\n        schlecht.append(n)\nprint("gescheitert bei:", schlecht)')],
  [("as vergessen: fehler ist nicht definiert", 'try:\n    assert 1 == 2, "ungleich"\nexcept AssertionError:\n    print(fehler)'),
   ("Doppelpunkt nach dem Namen vergessen", 'try:\n    x = 1\nexcept ValueError as fehler\n    print(fehler)')],
  ["try-except", "assert", "assertion-error", "testfaelle-liste"],
  bez=["as"])

E("grenzwerte-testen", "Grenzwerte testen", TE, "V12", "kopf",
  "Merkkarte: Welche Testfälle du wählst, damit Fehler an den Rändern nicht durchrutschen.",
  "Bereich: je ein typischer Wert\nGrenze: beide Seiten testen\nSonderfälle: 0, negativ, leere Liste",
  "Fehler sitzen selten mitten im Bereich, sondern an den Grenzen. Gehe so vor: 1. Pro Bereich ein typischer Wert. 2. Jede Grenze von beiden Seiten, also direkt darunter, genau darauf und direkt darüber, besonders bei < gegen <=. 3. Sonderfälle: 0, negative Werte, leere Liste, ein einzelnes Element, unmögliche Eingaben. 4. Die erwartete Antwort bestimmst du von Hand aus der Spezifikation, nie, indem du deine Funktion laufen lässt und das Ergebnis abschreibst.",
  '''
  # Spezifikation: unter 70 normal, 70 bis 85 einschließlich Warnung,
  # über 85 abschalten, unter -40 oder über 200 Sensorfehler.
  def zustand(t):
      if t < -40 or t > 200:
          return "sensorfehler"
      if t < 70:
          return "normal"
      if t <= 85:
          return "warnung"
      return "abschalten"

  faelle = [
      (20, "normal"),          # typisch je Bereich
      (78, "warnung"),
      (120, "abschalten"),
      (69.9, "normal"),        # Grenze 70 von beiden Seiten
      (70, "warnung"),
      (85, "warnung"),         # Grenze 85 von beiden Seiten
      (85.1, "abschalten"),
      (-40, "normal"),         # Sensorgrenzen
      (-40.1, "sensorfehler"),
      (200, "abschalten"),
      (200.1, "sensorfehler"),
      (0, "normal"),           # Sonderfall 0
  ]
  for t, erwartet in faelle:
      assert zustand(t) == erwartet, f"zustand({t}) falsch"
  print("alle", len(faelle), "Fälle bestanden")
  ''',
  "Immer, wenn du Testfälle für eine Funktion mit Bereichen, Schwellen oder Listen auswählst.",
  [("Sonderfälle bei einer Liste", 'def mittelwert(werte):\n    if len(werte) == 0:\n        return 0\n    return sum(werte) / len(werte)\n\nassert mittelwert([]) == 0\nassert mittelwert([5]) == 5\nassert mittelwert([2, 4]) == 3\nassert mittelwert([-2, 2]) == 0\nprint("bestanden")'),
   ("Grenze < gegen <= prüfen", 'def ampel(n):\n    if n < 0:\n        return "ungueltig"\n    if n < 3000:\n        return "gruen"\n    if n <= 4500:\n        return "gelb"\n    return "rot"\n\nfor n, erwartet in [(2999, "gruen"), (3000, "gelb"), (4500, "gelb"), (4501, "rot"), (-1, "ungueltig"), (0, "gruen")]:\n    assert ampel(n) == erwartet, f"ampel({n})"\nprint("bestanden")')],
  [("Nur typische Werte getestet: der Fehler an der Grenze 85 fällt erst mit dem Grenzwert auf", 'def zustand(t):\n    if t < 70:\n        return "normal"\n    if t < 85:\n        return "warnung"\n    return "abschalten"\n\nassert zustand(20) == "normal"\nassert zustand(78) == "warnung"\nassert zustand(120) == "abschalten"\nassert zustand(85) == "warnung", "Grenze 85 gehört noch zur Warnung"'),
   ("Sonderfall leere Liste nie getestet", 'def mittelwert(werte):\n    return sum(werte) / len(werte)\n\nprint(mittelwert([2, 4]))\nprint(mittelwert([]))')],
  ["testfaelle-liste", "testfunktion", "assert", "vergleiche"],
  bez=["Grenzwerte"])

E("assertion-error", "AssertionError", TE, "V12", "kopf",
  "Die Fehlerart, wenn ein assert scheitert: Die Annahme war falsch.",
  "AssertionError: Meldung",
  "Ein AssertionError bedeutet: Eine mit assert geprüfte Bedingung war falsch, dein Test ist gescheitert. Die Meldung hinter dem Komma des assert steht in der letzten Traceback-Zeile. Der Traceback zeigt die Stelle des assert, also die Stelle des Tests, nicht die Stelle des Fehlers. Den Fehler selbst suchst du in der geprüften Funktion. Achtung bei Klammern: assert (bedingung, \"Meldung\") bildet ein Tupel, und ein nicht leeres Tupel ist immer wahr. Der Test kann dann nie scheitern.",
  '''
  def zustand(t):
      if t < 70:
          return "normal"
      return "warnung"

  try:
      assert zustand(70) == "normal", "zustand(70) sollte normal sein"
  except AssertionError as fehler:
      print("AssertionError:", fehler)
  ''',
  "Beim Lesen von Testergebnissen: Er sagt dir, welcher Fall scheitert, nicht warum.",
  [("Meldung des Tests lesen", 'drehzahl = 5000\ntry:\n    assert drehzahl <= 4500, f"Drehzahl {drehzahl} zu hoch"\nexcept AssertionError as fehler:\n    print("AssertionError:", fehler)'),
   ("Vergleich mit math.isclose", 'import math\ntry:\n    assert math.isclose(100 / 3.6, 28), "100 km/h sind nicht 28 m/s"\nexcept AssertionError as fehler:\n    print("AssertionError:", fehler)')],
  [("Test gescheitert: Meldung steht hinter dem Komma", 'def kmh_in_ms(v):\n    return v * 3.6\n\nassert kmh_in_ms(36) == 10, "36 km/h sollten 10 m/s sein"'),
   ("Klammern machen ein Tupel: der Test scheitert nie, obwohl 1 == 2 falsch ist", 'assert (1 == 2, "wird nie geprüft")\nprint("läuft durch, obwohl falsch")', "Kein Fehler, nur eine Warnung: SyntaxWarning: assertion is always true, perhaps remove parentheses?", False)],
  ["assert", "traceback", "except-as", "tupel", "testfunktion"],
  bez=["AssertionError"])
S("numpy-reihen", "np.arange / np.linspace", AU, "V13", "lesen",
  "Zahlenreihen als Array: arange wie range (Stopp nicht dabei), linspace mit fester Anzahl (beide Enden dabei).",
  "np.arange(0, 1, 0.25)\nnp.linspace(0, 1, 5)\nt = np.arange(N) / fs", ["numpy-array", "range"],
  bez=["np.arange", "np.linspace"])
S("numpy-kennwerte", "np.mean / np.max / np.sqrt", AU, "V13", "lesen",
  "Kennwerte eines Arrays: Mittelwert, Maximum, Minimum, Summe; np.sqrt wirkt auf jedes Element. Effektivwert: np.sqrt(np.mean(a ** 2)).",
  "np.mean(a)    np.max(a)    np.sum(a)\nnp.sqrt(np.mean(a ** 2))", ["numpy-array", "sum-min-max"],
  bez=["np.mean", "np.max", "np.min", "np.sum", "np.sqrt", "np.median"])
S("numpy-maske", "Maske a[a > 3]", AU, "V13", "lesen",
  "Ein Vergleich auf dem Array ergibt Wahr/Falsch je Element; a[maske] behält nur die passenden Werte. Zwei Bedingungen mit & bzw. | und Klammern.",
  "a[a > 3]\nlen(a[a > 3]) / len(a)\na[(a > 1) & (a < 4)]", ["numpy-array", "vergleiche"])
S("numpy-loadtxt", "np.loadtxt", AU, "V13", "lesen",
  "Liest eine Textdatei mit Zahlen direkt als Array: Trennzeichen, Kopfzeile überspringen, Spalten wählen.",
  "np.loadtxt('daten.csv', delimiter=',', skiprows=1, usecols=4)", ["numpy-array", "csv-reader"],
  bez=["np.loadtxt"])
