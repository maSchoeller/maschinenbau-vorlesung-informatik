"""Eintraege der Lektion V16 (Rechner & Betriebssystem kompakt). Nur anhaengen, keine fremden Eintraege aendern."""
from helfer import E

DF = "Dateien & Fehler"
AU = "Ausblick (ab V10)"

E("path", "Path (pathlib)", DF, "V16", "kopf",
  "Ein Pfad als Objekt: Teile verbindest du mit /, geprüft und gelesen wird per Methode.",
  "from pathlib import Path\nordner = Path(\"zelle\")\ndatei = ordner / \"maschinen\" / \"D2\"",
  "Path(\"zelle\") erzeugt ein Pfad-Objekt, keinen gewöhnlichen Text. Mit dem Operator / hängst du Teile an, Python setzt das passende Trennzeichen für dein Betriebssystem ein. Ein relativer Pfad (\"zelle/x.log\") gilt ab dem Ordner, in dem das Programm läuft; ein absoluter Pfad beginnt an der Wurzel des Laufwerks. Mit / rechnet nur ein Path: Text / Text ist ein Fehler, mindestens der linke Teil muss ein Path sein.",
  '''
  from pathlib import Path

  zelle = Path("zelle")
  logs = zelle / "maschinen" / "D2" / "logs"
  datei = logs / "2026-11-16.log"

  print(datei.as_posix())
  print(datei.name)
  print(datei.is_absolute())
  ''',
  "Immer wenn dein Programm Dateien oder Ordner anspricht: Messdaten, Logs, NC-Programme der Fertigungszelle.",
  [("Pfad aus Teilen bauen", 'from pathlib import Path\nbasis = Path("zelle")\nmaschine = "F1"\nprint((basis / "maschinen" / maschine / "logs").as_posix())'),
   ("Relativ oder absolut?", 'from pathlib import Path\nprint(Path("daten/messung.csv").is_absolute())\nprint(Path("daten/messung.csv").resolve().is_absolute())')],
  [("Text durch Text geteilt", 'ordner = "zelle"\ndatei = ordner / "x.log"'),
   ("Datei liegt nicht im aktuellen Ordner (relativer Pfad)", 'from pathlib import Path\ntext = Path("messung.csv").read_text(encoding="utf-8")')],
  ["with-open", "import", "path-teile", "path-pruefen"],
  bez=["Path", "pathlib", "from pathlib import Path"],
  aliase=["Pfad", "pfad verbinden", "relativ", "absolut", "pathlib"])

E("path-teile", "Path: name, stem, suffix, parent, parts", DF, "V16", "kopf",
  "Zerlegt einen Pfad in Dateiname, Name ohne Endung, Endung und Ordner.",
  "datei.name    datei.stem    datei.suffix    datei.parent    datei.parts",
  "Ein Pfad besteht aus Teilen, die du direkt abfragen kannst. name ist der letzte Teil mit Endung, stem der Name ohne Endung, suffix die Endung samt Punkt. parent ist der Ordner darüber (wieder ein Path, also geht auch parent.parent). parts liefert alle Teile als Tupel. Das Zerlegen passiert nur im Text: Die Datei muss dafür nicht existieren.",
  '''
  from pathlib import Path

  datei = Path("zelle/nc-programme/WELLE_20H6.nc")

  print(datei.name)
  print(datei.stem)
  print(datei.suffix)
  print(datei.parent.as_posix())
  print(datei.parent.parent.name)
  print(datei.parts)
  ''',
  "Wenn du Dateien nach Endung sortierst, Namen ohne Endung brauchst oder wissen willst, in welchem Ordner (welcher Maschine) eine Datei liegt.",
  [("Maschine aus dem Logpfad lesen", 'from pathlib import Path\nlog = Path("zelle/maschinen/R1/logs/2026-11-18.log")\nprint(log.parent.parent.name)'),
   ("Neue Endung für den Namen", 'from pathlib import Path\np = Path("WELLE_20H6.nc")\nprint(p.stem + "_v2" + p.suffix)\nprint(p.with_suffix(".txt").name)')],
  [("name mit Klammern aufgerufen", 'from pathlib import Path\nprint(Path("a/b.nc").name())'),
   ("Endung ohne Punkt verglichen: nie wahr", 'from pathlib import Path\nprint(Path("a/b.nc").suffix == "nc")', "False (die Endung ist \".nc\", mit Punkt)", False)],
  ["path", "glob", "path-pruefen"],
  bez=[".name", ".stem", ".suffix", ".parent", ".parts", ".with_suffix"],
  aliase=["dateiname", "endung", "ordner", "elternordner"])

E("glob", "glob, rglob, iterdir", DF, "V16", "lesen",
  "Findet Dateien und Ordner nach Muster, auch in Unterordnern.",
  "ordner.iterdir()    ordner.glob(\"*.log\")    ordner.rglob(\"*.nc\")",
  "iterdir() liefert alles, was direkt im Ordner liegt. glob(\"*.log\") liefert nur die Treffer des Musters; * steht für beliebigen Text, auch mitten im Pfad (\"maschinen/*/logs/*.log\"). rglob(\"*.nc\") sucht zusätzlich in allen Unterordnern. Das Ergebnis ist keine Liste, sondern ein Generator: Es hat kein len(), und die Reihenfolge ist nicht festgelegt. Mit sorted(...) oder list(...) bekommst du eine Liste, die du zählen und sortieren kannst.",
  '''
  from pathlib import Path

  for maschine in ["D2", "F1"]:
      logs = Path("zelle/maschinen") / maschine / "logs"
      logs.mkdir(parents=True)
      for tag in ["2026-11-17", "2026-11-16"]:
          (logs / f"{tag}.log").write_text("x", encoding="utf-8")

  zelle = Path("zelle")
  alle = sorted(p.name for p in zelle.rglob("*.log"))
  print(len(alle), alle)

  nur_d2 = sorted(p.name for p in zelle.glob("maschinen/D2/logs/*.log"))
  print(nur_d2)
  ''',
  "Wenn du viele Dateien auf einmal bearbeiten willst: alle Logs einer Woche, alle NC-Programme, alle CSV-Dateien eines Ordners.",
  [("Nur die Dateien direkt im Ordner", 'from pathlib import Path\nproben = Path("proben")\nproben.mkdir()\n(proben / "a.csv").write_text("1", encoding="utf-8")\n(proben / "b.txt").write_text("2", encoding="utf-8")\nprint(sorted(p.name for p in proben.iterdir()))'),
   ("Anzahl der Treffer, mit und ohne Unterordner", 'from pathlib import Path\nnc = Path("nc")\n(nc / "alt").mkdir(parents=True)\n(nc / "A.nc").write_text("G0", encoding="utf-8")\n(nc / "alt" / "A_v1.nc").write_text("G0", encoding="utf-8")\nprint(len(list(nc.glob("*.nc"))), len(list(nc.rglob("*.nc"))))')],
  [("len() auf das glob-Ergebnis", 'from pathlib import Path\nordner = Path("x")\nordner.mkdir()\nprint(len(ordner.glob("*.txt")))'),
   ("glob findet nichts in Unterordnern", 'from pathlib import Path\nordner = Path("x/y")\nordner.mkdir(parents=True)\n(ordner / "a.nc").write_text("G0", encoding="utf-8")\nprint(len(list(Path("x").glob("*.nc"))))', "0 (glob sucht nur im Ordner selbst; rglob auch in Unterordnern)", False)],
  ["path", "path-pruefen", "sorted", "liste"],
  bez=[".glob", ".rglob", ".iterdir", "glob", "rglob", "iterdir"],
  aliase=["dateien suchen", "dateien finden", "muster", "wildcard", "durchsuchen", "generator"])

E("path-pruefen", "Path: exists, is_file, stat, read_text", DF, "V16", "lesen",
  "Prüft, ob es eine Datei oder einen Ordner gibt, liest die Größe und den Inhalt.",
  "p.exists()    p.is_file()    p.is_dir()    p.stat().st_size    p.read_text(encoding=\"utf-8\")",
  "exists() fragt, ob der Pfad etwas bezeichnet; is_file() und is_dir() unterscheiden Datei und Ordner. p.stat().st_size gibt die Größe in Bytes (durch 1024 teilen für KiB). read_text(encoding=\"utf-8\") liest die ganze Datei als Text, write_text(...) schreibt sie. Kurz und ohne with; für sehr große Dateien oder zeilenweises Lesen bleibt open() mit with die bessere Wahl.",
  '''
  from pathlib import Path

  ordner = Path("zelle")
  ordner.mkdir()
  datei = ordner / "LIESMICH.txt"
  datei.write_text("Fertigungszelle FZ-3\\nHalle 2\\n", encoding="utf-8")

  print(datei.exists(), datei.is_file(), datei.is_dir())
  print(ordner.is_dir())
  print(Path("gibt_es_nicht.txt").exists())
  print(datei.stat().st_size, "Bytes")
  print(datei.read_text(encoding="utf-8").splitlines()[0])
  ''',
  "Vor dem Lesen prüfen, ob die Datei da ist; Dateigrößen vergleichen; kleine Textdateien in einem Schritt einlesen.",
  [("Nur lesen, wenn es die Datei gibt", 'from pathlib import Path\np = Path("config.txt")\nif p.exists():\n    print(p.read_text(encoding="utf-8"))\nelse:\n    print("keine Konfiguration gefunden")'),
   ("Größe in KiB", 'from pathlib import Path\np = Path("daten.txt")\np.write_text("x" * 2048, encoding="utf-8")\nprint(p.stat().st_size / 1024, "KiB")')],
  [("Relativer Pfad zeigt ins Leere", 'from pathlib import Path\nprint(Path("messung.csv").read_text(encoding="utf-8"))'),
   ("st_size direkt auf dem Path statt auf stat()", 'from pathlib import Path\np = Path("a.txt")\np.write_text("x", encoding="utf-8")\nprint(p.st_size)', "AttributeError: 'PosixPath' object has no attribute 'st_size'", False)],
  ["path", "glob", "with-open", "try-except"],
  bez=[".exists", ".is_file", ".is_dir", ".stat", ".st_size", ".read_text", ".write_text"],
  aliase=["datei existiert", "dateigröße", "datei lesen", "ordner prüfen", "FileNotFoundError"])

E("os-modul", "os: getcwd, listdir (os.path, os.walk)", DF, "V16", "lesen",
  "Ältere Schreibweise für Ordner und Dateien; kommt in KI-Code und alten Skripten häufig vor.",
  "import os\nos.getcwd()    os.listdir(\".\")    os.path.join(a, b)    os.walk(ordner)",
  "Das Modul os kann vieles, was auch Path kann, aber mit Funktionen und Text statt Objekten. os.getcwd() nennt den aktuellen Arbeitsordner, os.listdir(\".\") liefert die Namen im Ordner als Liste (unsortiert). os.path.join(a, b) verbindet Pfadteile, os.walk(ordner) läuft durch einen ganzen Ordnerbaum. Für eigenen Code ist pathlib meist lesbarer; os.path.join und os.walk musst du nur erkennen und verstehen.",
  '''
  import os

  os.mkdir("zelle")
  for name in ["b.txt", "a.txt"]:
      with open(os.path.join("zelle", name), "w", encoding="utf-8") as f:
          f.write("x")

  print(sorted(os.listdir("zelle")))
  print(os.getcwd() != "")

  for ordner, unterordner, dateien in os.walk("zelle"):
      print(ordner, sorted(dateien))
  ''',
  "Wenn du fremden Code liest, der os benutzt, oder wissen willst, in welchem Ordner dein Programm gerade läuft.",
  [("Nur die Namen im Ordner", 'import os\nos.mkdir("d")\nopen("d/x.txt", "w").close()\nprint(os.listdir("d"))'),
   ("Dieselbe Aufgabe mit pathlib", 'from pathlib import Path\np = Path("d")\np.mkdir()\n(p / "x.txt").write_text("", encoding="utf-8")\nprint([q.name for q in p.iterdir()])')],
  [("os.listdir auf einen Ordner, den es nicht gibt", 'import os\nprint(os.listdir("ordner_fehlt"))', "FileNotFoundError: [Errno 2] No such file or directory: 'ordner_fehlt'", False),
   ("os nicht importiert", 'print(os.getcwd())')],
  ["path", "glob", "import", "with-open"],
  bez=["os", "os.getcwd", "os.listdir", "os.path", "os.path.join", "os.walk"],
  aliase=["arbeitsordner", "aktueller ordner", "ordnerbaum", "betriebssystem"])

E("perf-counter", "time.perf_counter()", AU, "V16", "lesen",
  "Misst, wie lange ein Programmteil läuft: Zeit davor und danach, dann die Differenz.",
  "import time\nstart = time.perf_counter()\n...\ndauer = time.perf_counter() - start",
  "perf_counter() liefert eine Zeit in Sekunden, die nur zum Vergleichen taugt: Der absolute Wert ist bedeutungslos, die Differenz zweier Aufrufe ist die Laufzeit. Mal 1000 ergibt Millisekunden. Die Messwerte schwanken von Lauf zu Lauf, weil der Rechner nebenbei anderes erledigt; wiederhole die Messung also einige Male, bevor du etwas daraus schließt. Mit der Uhrzeit (time.time, datetime) hat das nichts zu tun.",
  '''
  import time

  start = time.perf_counter()
  summe = 0
  for i in range(1_000_000):
      summe += i
  ende = time.perf_counter()

  dauer_ms = (ende - start) * 1000
  print(summe)
  print(dauer_ms > 0)
  ''',
  "Um zwei Lösungen zu vergleichen (Schleife oder NumPy, Suche in Ordnern) oder zu prüfen, ob ein Programm bei großen Datenmengen zu langsam wird.",
  [("Zwei Varianten vergleichen", 'import time\nzahlen = list(range(200000))\nt0 = time.perf_counter()\ns1 = sum(zahlen)\nt1 = time.perf_counter()\ns2 = 0\nfor z in zahlen:\n    s2 += z\nt2 = time.perf_counter()\nprint(s1 == s2)\nprint(f"sum: {(t1 - t0) * 1000:.2f} ms, Schleife: {(t2 - t1) * 1000:.2f} ms")', ),
   ("Mehrfach messen, kleinsten Wert nehmen", 'import time\nwerte = []\nfor _ in range(5):\n    t = time.perf_counter()\n    sorted(range(50000, 0, -1))\n    werte.append(time.perf_counter() - t)\nprint(min(werte) <= max(werte))')],
  [("Differenz in falscher Reihenfolge: negative Dauer", 'import time\nstart = time.perf_counter()\nende = time.perf_counter()\nprint(start - ende)', "negative Zahl (ende - start rechnen)", False),
   ("time nicht importiert", 'start = time.perf_counter()')],
  ["import", "with-open", "glob", "zeit-messen"],
  bez=["time", "perf_counter", "time.perf_counter"],
  aliase=["laufzeit", "zeit messen", "stoppuhr", "millisekunden", "benchmark"])

E("raw-string", "Roher String r\"C:\\Users\\...\" (Windows-Pfade)", DF, "V16", "lesen",
  "Windows-Pfade mit \\ als rohen Text schreiben, damit Python den Backslash nicht als Sonderzeichen liest.",
  'pfad = r"C:\\Users\\name\\daten.csv"\npfad = Path("C:/Users/name/daten.csv")',
  "In normalen Texten leitet der Backslash eine Sonderschreibweise ein: \\n ist ein Zeilenumbruch, \\U beginnt ein Unicode-Zeichen. Ein Windows-Pfad wie \"C:\\Users\\...\" erzeugt daher einen SyntaxError (unicodeescape) oder, bei \\n und \\t, still einen falschen Pfad. Zwei Auswege: ein r vor das Anführungszeichen (roher String, der Backslash bleibt wörtlich) oder Schrägstriche / verwenden, die Python auch unter Windows versteht. Ein roher String darf nicht mit einem einzelnen \\ enden.",
  r'''
  from pathlib import Path

  roh = r"C:\Users\marvin\daten\messung.csv"
  print(roh)
  print(len(roh))

  schraeg = Path("C:/Users/marvin/daten/messung.csv")
  print(schraeg.name, schraeg.suffix)

  normal = "Spalte1\tSpalte2"
  print(len(normal))
  ''',
  "Sobald du einen Pfad aus dem Windows-Explorer in den Code kopierst, oder wenn KI-Code Pfade mit Backslash enthält.",
  [("Pfad aus dem Explorer als roher String", r'''pfad = r"C:\Daten\neu\test.txt"
print(pfad)
print(pfad.endswith(".txt"))'''),
   ("Ohne r wird aus \\n ein Zeilenumbruch", r'''falsch = "C:\neu\test"
print(len(falsch))
richtig = r"C:\neu\test"
print(len(richtig))''')],
  [("Backslash-U im normalen Text", 'pfad = "C:\\Users\\marvin\\daten.csv"\nprint(pfad)'),
   ("Roher String endet auf Backslash", 'pfad = r"C:\\Daten\\"\nprint(pfad)')],
  ["path", "path-teile", "str-text"],
  bez=["r\"", "unicodeescape", "Backslash"],
  aliase=["raw string", "backslash", "windows pfad", "unicodeescape", "SyntaxError"])
