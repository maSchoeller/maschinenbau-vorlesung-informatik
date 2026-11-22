"""Sprechertext V17 Python-Werkzeugkasten (Quelltext mit Markup): json, verschachtelte Daten, requests, ipaddress."""
JSON = "[[json|Jason]]"
LOADS = "[[json.loads|Jason Punkt loads]]"
DUMPS = "[[json.dumps|Jason Punkt dumps]]"
LOAD = "[[json.load|Jason Punkt load]]"
DUMP = "[[json.dump|Jason Punkt dump]]"
REQ = "[[requests|Rekwests]]"
IPA = "[[ipaddress|I P Address]]"
JSONF = "[[json()|Jason]]"
IPN = "[[ip_network|I P Network]]"
IPAD = "[[ip_address|I P Address]]"
RGET = "[[requests.get|Rekwests Punkt get]]"
NUMA = "[[num_addresses|num addresses]]"

SRC = [
 [f"Das Modul {JSON} verwandelt Text in Python-Daten und zurück.",
  f"{LOADS} macht aus einem JSON-Text ein Dictionary. Dann liest du die Drehzahl mit ihrem Schlüssel: 1450.",
  f"{DUMPS} geht den umgekehrten Weg: aus dem Dictionary wird Text, den du verschicken kannst, zum Beispiel per MQTT.",
  "Mit `indent` gleich 2 wird der Text eingerückt und besser lesbar."],
 ["Die Typen übersetzt Python für dich: Ein Objekt wird zum Dictionary, ein Array zur Liste, ein Text zu `str`, eine Zahl zu `int` oder `float`. Aus true und false werden True und False, aus null wird None.",
  "JSON ist streng: nur doppelte Anführungszeichen und kein Komma am Ende. Sonst gibt es einen [[JSONDecodeError|Jason Decode Error]].",
  "Der ist ein [[ValueError|Value Error]], also fängst du ihn mit `except ValueError` ab.",
  f"Aus einer Datei liest du mit {LOAD} ohne s, und schreibst mit {DUMP}, beide innerhalb von `with open`."],
 ["Echte Daten sind verschachtelt. Die Zelle ist ein Dictionary, und unter dem Schlüssel `maschinen` liegt eine Liste von Dictionaries.",
  "Die Schleife `for m in zelle` mit dem Schlüssel `maschinen` gibt dir jede Maschine als Dictionary. Mit `m` und dem Schlüssel `id` liest du ihre Kennung.",
  "Ein Dictionary im Dictionary liest du mit zwei Schlüsseln hintereinander: erst der Verschleiß, dann T4.",
  "Fehlt ein Schlüssel, gibt es einen `KeyError`. Mit `get` und einem Ersatzwert bekommst du stattdessen den Ersatz, zum Beispiel 0 bei der SPS, die keine Stückzahl meldet."],
 [f"Das Modul {REQ} holt Daten über HTTP. {RGET} mit der Adresse liefert eine Antwort.",
  "Die Antwort hat einen `status_code`: 200 heißt gut, 404 heißt: nicht gefunden.",
  f"Erst bei 200 rufst du {JSONF} auf. Das macht aus dem Text direkt ein Dictionary. Bei 404 ist der Text kein JSON, und dein Programm bricht ab.",
  "Im Browser-Labor läuft nur GET. Anmeldung und Zugriffsrechte richtet in der Fabrik die IT ein."],
 [f"Das Modul {IPA} rechnet für dich. {IPN} baut ein Netz aus Text, {IPAD} eine einzelne Adresse.",
  "Mit `in` fragst du, ob die Adresse im Netz liegt. Für R1 ist das Ergebnis False.",
  f"{NUMA} zählt alle Adressen: 256. Ziehst du zwei ab, bleiben 254 nutzbare.",
  "Vergleiche Adressen nie als Text. Ein Vergleich mit `startswith` und [[192.168.3|hundertzweiundneunzig Punkt hundertachtundsechzig Punkt drei]] lässt R1 durch."],
]

SZENEN = [
 "Code-Kasten mit json.loads und json.dumps; Pfeil Text zu Dictionary und zurück; Ausgabe 1450 und der JSON-Text; Hinweis indent=2.",
 "Typtabelle JSON gegen Python (Objekt dict, Array list, Text str, Zahl int/float, true True, null None); Code mit try und except ValueError; Dateipfeil json.load und json.dump.",
 "Dict zelle mit Liste maschinen als Kacheln; Schleife über m; Dict im Dict mit zwei Schlüsseln und Pfad zu T4; get mit Ersatzwert 0 bei der SPS.",
 "Code mit requests.get, status_code und json(); zwei Fälle nebeneinander: maschinen.json mit 200 und D9.json mit 404; Hinweis GET im Labor.",
 "Code mit ip_network, ip_address, in und num_addresses; Ergebnisse True und False; Warnkarte startswith lässt R1 durch.",
]
