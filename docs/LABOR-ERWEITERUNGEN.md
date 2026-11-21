# Labor-Erweiterungen (Python im Browser)

Gilt für jeden Python-Codeblock (`<pre><code>`, wird automatisch ausführbar) und für Code-Aufgaben (`data-a="code"`, `"klausur"`, `"gap"`). Alles läuft im Browser (Pyodide 0.26.4 im Web Worker). Demo mit allen Fällen: `site/werkzeuge/labor-test.html`. Die Attribute stehen am `<pre>` (Codeblock) bzw. am `.a-task` (Aufgabe). Pfade relativ zur Seite (aus `site/lektionen/`: `../assets/...`).

Bestehendes bleibt: ohne die neuen Attribute verhält sich alles wie bisher.

## Grundregeln

- Arbeitsverzeichnis ist vor **jedem** Lauf frisch: Dateien und Ordner früherer Läufe sind weg, `data-files` und der Upload werden neu abgelegt. Ein Programm darf also nicht darauf bauen, dass ein anderer Block etwas geschrieben hat.
- Die Laufzeitgrenze (`data-timeout`, Standard 8000 ms) zählt erst ab Programmstart. Das Laden von Paketen und Dateien zählt nicht.
- Pakete werden anhand der `import`-Zeilen automatisch geladen (erster Lauf langsamer, danach gecacht). Im Ausgabebereich steht eine Ladeanzeige („NumPy wird geladen … nur beim ersten Mal, ca. 8 MB“). Ungefähre Größen: NumPy 8 MB, pandas +16 MB, matplotlib +22 MB (jeweils mit NumPy), requests und sqlite3 ca. 1 MB.
- Im Konsolen-Echo erscheinen Rückgabewerte von `plt.plot(...)` und `con.execute(...)` nicht als Zeile.

## 1 Beispieldateien: `data-files`

Mehrere Dateien mit Leerzeichen trennen. Sie liegen vor dem Lauf unter ihrem Dateinamen im Arbeitsverzeichnis; `open("bremsen.csv")` genügt.

```html
<pre data-files="../assets/data/v09/bremsen.csv ../assets/data/v09/waschmaschine.csv"><code>zeilen = open("bremsen.csv", encoding="utf-8").read().splitlines()
print(len(zeilen), "Zeilen")</code></pre>
```

Bei Code-Aufgaben am `.a-task` (gilt für „Ausführen“ **und** „Prüfen“, die Tests sehen die Dateien):

```html
<div class="a-task" data-a="code" data-id="v09-t1" data-mode="programm" data-files="../assets/data/v09/bremsen.csv">
```

Testdaten: `site/assets/data/v09/bremsen.csv`, `waschmaschine.csv`, `bremsen-kaputt.csv` (Semikolon, Dezimalkomma, UTF-8).

- **`.py`-Dateien** in `data-files` sind danach importierbar: `data-files="../assets/py/bauteil3d.py"` und im Code `import bauteil3d`.
- **`.zip`-Dateien** werden automatisch ins Arbeitsverzeichnis entpackt (Ordnerstruktur bleibt, das ZIP verschwindet): `data-files="../assets/data/labortest/zelle.zip"` ergibt `zelle/logs/f1.txt` usw. Mit `os.walk(".")` oder `glob` durchsuchbar.

## 2 Eigene Datei laden: `data-upload`

Zeigt den Knopf „Eigene CSV laden“ (mehrere Dateien möglich, bis 20 MB), den Dateinamen und den Hinweis „Die Datei bleibt in deinem Browser, nichts wird hochgeladen.“ Die Datei liegt im Arbeitsverzeichnis unter ihrem Namen. Mit `data-files` kombinierbar.

```html
<pre data-files="../assets/data/v09/bremsen.csv" data-upload><code>import csv
datei = "bremsen.csv"   # oder den Namen der eigenen Datei eintragen
with open(datei, encoding="utf-8") as f:
    zeilen = list(csv.reader(f, delimiter=";"))
print(len(zeilen), "Zeilen")</code></pre>
```

## 3 Erzeugte Dateien

Schreibt das Programm Dateien (`open(..., "w")`, `df.to_csv(...)`, `plt.savefig("bild.png")`), erscheint unter der Ausgabe die Liste „Erzeugte Dateien“ mit „Anzeigen“ und „Herunterladen“. Nichts zu tun; nur Dateien im Arbeitsverzeichnis selbst (keine Unterordner).

```html
<pre><code>with open("ergebnis.csv", "w", encoding="utf-8") as f:
    f.write("x;y\n")
    for x in range(5):
        f.write(f"{x};{x * x}\n")</code></pre>
```

## 4 NumPy, pandas

Einfach importieren, kein Attribut nötig. Beim ersten Lauf kommt die Ladeanzeige.

```html
<pre data-files="../assets/data/v09/bremsen.csv"><code>import pandas as pd
df = pd.read_csv("bremsen.csv", sep=";", decimal=",")
print(df.describe())</code></pre>
```

Bei Code-Aufgaben prüft die Paket-Erkennung auch den Code der Studierenden, `import numpy as np` in der Lösung genügt. Tests, die Pakete brauchen, importieren sie selbst (`import numpy as np` im Testskript).

## 5 Diagramme: matplotlib

`plt.show()` zeigt das Diagramm als Bild unter der Textausgabe (Backend `Agg`, mehrere `plt.show()` ergeben mehrere Bilder nacheinander, Alt-Text aus dem Titel). Ohne `plt.show()` erscheint nichts. `plt.savefig("bild.png")` landet zusätzlich bei den erzeugten Dateien.

```html
<pre><code>import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 100)
plt.plot(x, np.sin(x))
plt.title("Sinus")
plt.xlabel("x in rad")
plt.show()</code></pre>
```

Immer `plt.title(...)` setzen, es ist der Alt-Text des Bildes. Achsen mit Einheit beschriften.

## 6 sqlite3

Läuft ohne Zusatz (Standardbibliothek, wird automatisch nachgeladen). Datenbank im Speicher (`":memory:"`) oder als Datei im Arbeitsverzeichnis (taucht dann unter „Erzeugte Dateien“ auf). Platzhalter `?` funktionieren.

```html
<pre><code>import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE teile (name TEXT, masse REAL)")
con.executemany("INSERT INTO teile VALUES (?, ?)", [("Welle", 2.4), ("Flansch", 5.1)])
for zeile in con.execute("SELECT name, masse FROM teile WHERE masse > ?", (1.0,)):
    print(zeile)</code></pre>
```

## 7 HTTP: `requests`

Entscheidung: **echtes `requests` mit `pyodide-http`**, nicht `pyodide.http.pyfetch` und kein eigenes Shim. Begründung: Studierende schreiben genau den Code, den sie später in der Praxis brauchen (`requests.get(url).json()`), ohne `await`; `pyodide-http` setzt `requests` im Worker auf synchrones XMLHttpRequest um, beides gehört zur Pyodide-Distribution (ca. 1 MB, kein PyPI nötig). `pyfetch` hätte `async`/`await` in die Lektion getragen, ein Shim wäre nur ein Abbild von `requests`. Relative URLs werden gegen die aktuelle Seite aufgelöst (Zusatz im Worker). Die Maschinendaten liefert die Website selbst als statische JSON-Dateien (z. B. `site/assets/data/v17/zelle.json`, `site/assets/data/v17/api/...`); nur `GET`, `POST` an den statischen Server schlägt mit Fehler 501 fehl. Fremde Server nur mit CORS-Freigabe erreichbar.

```html
<pre><code>import requests

antwort = requests.get("../assets/data/v17/zelle.json")
print(antwort.status_code)
daten = antwort.json()
for m in daten["maschinen"]:
    print(m["id"], m["status"], m["temperatur_c"])</code></pre>
```

Fehler (`requests.get` auf nicht vorhandene URL) liefern `status_code` 404, `antwort.raise_for_status()` wirft `requests.HTTPError`.

## 8 3D-Vorschau

Python-Hilfsmodul `bauteil3d.py` per `data-files` mitgeben; `bauteil3d.zeige(mesh, name)` zeigt die drehbare Ansicht mit STL-Download unter der Ausgabe. Funktionen und Mesh-Format: `docs/3D-VORSCHAU.md`.

```html
<pre data-files="../assets/py/bauteil3d.py"><code>import bauteil3d

f = bauteil3d.flansch(120, 40, 15, 90, 6, 11)
print("Volumen in mm3:", round(bauteil3d.volumen(f)))
bauteil3d.zeige(f, "Flansch")</code></pre>
```

Eigene Meshes ohne das Hilfsmodul: `import kursausgabe` und `kursausgabe.zeige("3d", {"name": "...", "vertices": [[x, y, z], ...], "faces": [[i, j, k], ...]})`.

## 9 Reiche Ausgaben allgemein: `kursausgabe`

Im Worker gibt es das Modul `kursausgabe` (immer vorhanden, kein Import-Attribut nötig). `kursausgabe.zeige(art, daten)` mit `art` `"bild"` (`{"png": "<base64>", "alt": "..."}`) oder `"3d"` (Mesh-Dict); `daten` darf ein Dict oder ein JSON-Text sein. matplotlib und `bauteil3d` nutzen es.

## Für JavaScript (Seitenautoren mit eigenen Skripten)

`window.KursPy.run(code, {timeout, onOut, onErr, files, upload, scan, onStatus, onRich, onFiles})` ist die Basis. Bequemer: `KursPy.mix({timeout, onOut, onErr}, KursPy.ui(ausgabeElement, {files: ["../assets/..."], upload: function () { return [{name, data /* Uint8Array */}]; }, scan: quelltext}))`; `ui()` legt unter dem Ausgabeelement Bereiche für Bilder, 3D und erzeugte Dateien an, nach dem Lauf `.finish()` aufrufen. `KursPy.uploadUI(id)` liefert `{el, get}` für den Upload-Knopf. Fehler beim Laden einer Beispieldatei kommen als normaler Fehlertext („Beispieldatei … nicht ladbar (HTTP 404)“) zurück.
