"""Sprechertext V16 Python-Werkstatt: pathlib, Dateien suchen, Zeit messen (Quelltext mit Markup)."""
SRC = [
 ["Pfade baust du mit `pathlib`. Mit `from pathlib import Path` holst du die Klasse `Path`.",
  "[[Path(\"zelle\")|Path von zelle]] ist der Ordner der Fertigungszelle. Mit dem Schrägstrich hängst du Teile an: [[Path(\"zelle\") / \"maschinen\" / \"D2\"|Path von zelle, Schrägstrich, maschinen, Schrägstrich, D zwei]].",
  "Das läuft unter Windows und Linux gleich, denn `pathlib` setzt das richtige Trennzeichen selbst.",
  "Ein relativer Pfad beginnt im Arbeitsverzeichnis, ein absoluter ganz oben im Dateibaum."],
 ["Ein Pfad lässt sich zerlegen. Nehmen wir die Logdatei [[zelle/maschinen/D2/logs/2026-11-16.log|der Maschine D zwei vom sechzehnten November]].",
  "`.name` liefert den Dateinamen, `.stem` den Namen ohne Endung und `.suffix` die Endung mit Punkt.",
  "`.parent` ist der Ordner darüber. `.parent.parent.name` geht zwei Ordner hoch: Das ist die Maschine, hier [[D2|D zwei]].",
  "Ob es den Pfad gibt, zeigt `.exists()`. `.is_file()` und `.is_dir()` unterscheiden Datei und Ordner."],
 ["Mit `.iterdir()` gehst du durch alle Einträge eines Ordners. Mit `.glob` suchst du nach einem Muster.",
  "Das Sternchen steht für irgendeinen Namen: [[glob(\"maschinen/*/logs/*.log\")|glob von maschinen, Schrägstrich, Stern, Schrägstrich, logs, Schrägstrich, Stern Punkt log]] findet alle Log-Dateien, ein Stern je Ordnerebene.",
  "[[.rglob(\"*.nc\")|Punkt r glob von Stern Punkt N C]] sucht dazu in allen Unterordnern, hier nach den [[NC|En Ze]]-Programmen.",
  "Die Reihenfolge ist nicht festgelegt. Darum schreibst du `sorted` davor, dann ist sie auf jedem Rechner gleich."],
 ["Mit `.stat().st_size` bekommst du die Größe in Bytes. Durch 1024 geteilt sind das [[KiB|Kibibyte]].",
  "[[.read_text(encoding=\"utf-8\")|Punkt read text, mit encoding gleich utf acht,]] liest eine ganze Datei als einen Text. Für lange Logs bleibst du bei `with open` und einer Schleife.",
  "Gibt es die Datei nicht, meldet Python einen `FileNotFoundError`. Prüfe vorher mit `.exists()` oder fange den Fehler ab."],
 ["In älterem Code und von der [[KI|Ka I]] siehst du oft das Modul `os`.",
  "`os.getcwd()` liefert das Arbeitsverzeichnis, [[os.listdir(\".\")|os punkt listdir, mit dem aktuellen Ordner,]] die Namen darin.",
  "[[os.path.join(\"zelle\", \"maschinen\")|os punkt path punkt join von zelle und maschinen]] verbindet Pfadteile, `os.walk` läuft durch einen ganzen Baum.",
  "Das musst du nur lesen können. Selbst schreibst du es mit `pathlib` kürzer."],
 ["Zum Schluss die Zeit. Die Uhrzeit sagt, wie spät es ist, die Laufzeit, wie lange etwas dauert.",
  "Mit `import time` und `time.perf_counter()` liest du eine Stoppuhr in Sekunden. Start und Ende abziehen, mal 1000 ergibt Millisekunden.",
  "Die Messwerte schwanken, weil das Betriebssystem andere Prozesse dazwischenschiebt. Miss mehrmals und nimm den kleinsten Wert."],
]

SZENEN = [
 "Code-Fenster: from pathlib import Path, zelle = Path(\"zelle\"), Verbindung mit /; daneben ein Ordnerbaum, der Teil für Teil aufgebaut wird (zelle, maschinen, D2); Etiketten Windows und Linux mit gleichem Ergebnis; Gegenüberstellung absolut (C:/Users/anna/...) und relativ (zelle/...).",
 "Pfad zelle/maschinen/D2/logs/2026-11-16.log in farbigen Teilen; darunter Ausgaben von name, stem, suffix, parent.parent.name nacheinander; kleine Prüfliste exists/is_file/is_dir mit True/False.",
 "Ordnerbaum der Zelle; iterdir() leuchtet Einträge eines Ordners auf; glob-Muster mit Sternchen wählt 20 Log-Dateien aus; rglob(\"*.nc\") findet drei Programme; sorted ordnet die Namen.",
 "stat().st_size: 2437 Bytes werden durch 1024 zu 2,4 KiB; read_text liest LIESMICH.txt; FileNotFoundError-Meldung neben exists()-Prüfung.",
 "Code mit os.getcwd, os.listdir, os.path.join und os.walk; rechts jeweils die pathlib-Entsprechung; Stempel Nur lesen können.",
 "Stoppuhr-Grafik: perf_counter vor und nach dem Programmstück, Differenz mal 1000 in ms; vier Messungen mit leicht schwankenden Werten, der kleinste Wert wird markiert.",
]
