# V17 Netzwerke & Industrie 4.0 – Inhaltsplan (verbindlich, vom Koordinator)

Worktree (Repo-Wurzel): C:\_Data\01_sourcecode\github\maschinenbau-vorlesung-informatik\.claude\worktrees\v17-netzwerke-ab63f4
Nie in das Haupt-Repo darüber wechseln. Nicht committen (macht der Koordinator). Keine Emojis. Deutsch, Du-Ansprache.

## Pflichtlektüre (gezielt)
- `DESIGN.md` (Regeln 1–15), `KONZEPT.md` (Python-Strang bis V17), `briefing/LEKTION-BRIEF.md` (Vorlage ist jetzt V11/V10/V09, nicht V03).
- Vorlage: `site/lektionen/v11-copilot.html`, `site/lektionen/v11-labor.html`, `site/notebooks/V11-Copilot.ipynb`, `explorables-v11.js`, `v11.css`; für Dateien/try-except auch `v09-*`. Gleiche Bausteine, Klassen, Skript-Tags (speicher.js zuerst), Abschnittsfolge, Footer, Navigation (inkl. Link `../pap-editor.html`).
- `docs/LABOR-ERWEITERUNGEN.md` Abschnitt 7 (requests im Browser) und 1 (data-files), `docs/PAP-EDITOR.md`.
- `briefing/v17-beispiel.py` (exakt verwenden), Notizen `C:\Users\micro\AppData\Roaming\Claude\side-session-notes\local_c78fbd74-5b4a-4ede-87e7-940eeffbebaf\LEKTION-AUFTRAG.md` (Abschnitt „Nachträge des Koordinators“), `v11-wuensche.md` und `v12-wuensche.md` (Tipps zu PAP-Aufgabe und Tests).

## Roter Faden „Fertigungszelle FZ-3“ (V16–V19, Namen und Daten exakt so)
Fertigungszelle FZ-3 in Halle 2. Geräte: D2 Drehmaschine, F1 Fräsmaschine, R1 Roboter, M1 Messmaschine, SPS Zellensteuerung.
Netz 192.168.30.0/24, Gateway 192.168.30.1, MQTT-Broker 192.168.30.5:1883, SPS .2, D2 .11, F1 .12, M1 .14, **R1 192.168.31.20 (absichtlich im falschen Subnetz – nach Tausch der Robotersteuerung falsch eingetragen)**. Topics `fz3/<ID>/status`, Wartung `fz3/D2/wartung`.
Statische „API“ (nicht ändern): `site/assets/data/v17/api/maschinen.json`, `D2.json`, `F1.json`, `R1.json`, `M1.json`, `SPS.json`. Aus Laborseiten: `requests.get("../assets/data/v17/api/maschinen.json")`. D2: Programm WELLE_20H6, 142 Stück, 1450 1/min, Spindel 48,5 °C, Verschleiß T1 22 %, T4 83 %. F1: FLANSCH_80, 61 Stück, 3000 1/min, 41,0 °C, T1 47 %. R1: gestört, programm null, 203 Stück, Meldung „Lichtgitter unterbrochen“ (passt zu den V16-Logs). M1: PRUEF_WELLE, 140 Stück, Raum 20,1 °C. SPS: Zykluszeit 10 ms (kein stueckzahl-Schlüssel!).
Verbindungen: V16 hat die Log-Dateien der Zelle durchsucht (R1 „Lichtgitter unterbrochen“, D2 „Werkzeugverschleiss T4 ueber 80 %“), V18 prüft die Firmware von R1 per SHA-256, V19 die Auftragsdatenbank (Aufträge 4711 WELLE_20H6 auf D2 …). Darf jeweils in einem Satz erwähnt werden („In V16 hast du …“, „In V18 …“).
`site/assets/data/v17/zelle.json` ist eine Demo der Infrastruktur („Fertigungszelle 1“) – in der Lektion NICHT verwenden.
Zusätzliche eigene Daten nur als NEUE Dateien unter `site/assets/data/v17/` (bestehende nicht ändern).

## Python-Strang V17 (neu) – alles davor ist bekannt (bis V16: Funktionen, Listen, Dicts, Tupel, Dateien, try/except, import, assert, NumPy, matplotlib, pandas, pathlib, time)
- `import json`: `json.loads(text)` (Text → dict/list), `json.dumps(obj)` und `json.dumps(obj, indent=2)`, `json.load(datei)` / `json.dump(obj, datei)` mit `with open`. Typtabelle JSON ↔ Python: object→dict, array→list, string→str, Zahl→int/float, true/false→True/False, null→None. JSON verlangt doppelte Anführungszeichen, kein Komma am Ende → `json.JSONDecodeError` (ist ein `ValueError`, also mit `except ValueError` abfangbar).
- **Verschachtelte Daten** (neu! V08 hatte keine Liste von Dicts): Liste von Dicts (`for m in zelle["maschinen"]: m["id"]`), Dict im Dict (`d2["werkzeugverschleiss_prozent"]["T4"]`), `.get(schluessel, ersatz)` für fehlende Schlüssel (bekannt aus V08).
- `import requests`: `antwort = requests.get(url)`, `antwort.status_code` (200, 404), `antwort.json()`, `antwort.text`; vor `.json()` Status prüfen (404-Seite ist kein JSON). `raise_for_status()` nur erwähnen.
- `import ipaddress` (Standardbibliothek): `ipaddress.ip_network("192.168.30.0/24")`, `ipaddress.ip_address("192.168.30.11")`, `ip in netz`, `netz.num_addresses`, `netz.network_address`, `netz.broadcast_address`, `netz.netmask`.
- f-String mit Breite `{m['id']:4}` (Spalte auffüllen) – im Beispiel vorhanden, in einem Satz erklären.
- NICHT verwenden: `class`, `sorted`/`lambda`, Generatoren, `async/await`, paho-mqtt im ausführbaren Code (nur Deep Dive, `data-run="no"` mit Hinweis „läuft nur mit Broker, z. B. im Codespace“).

## Wissens-Ampel V17
Im Kopf: IP-Adresse und Subnetz lesen (liegt ein Gerät im Netz? /24), JSON lesen und mit Python-Zugriffen auswerten (dict/list), HTTP-Statuscode 200/404 deuten.
Lesen & erkennen: `requests.get(...).json()`, MQTT (Broker, Publish/Subscribe, Topics, Wildcards `+` und `#`), Schichtenmodell, `ipaddress`.
Delegieren: Header, Authentifizierung/Token, Port-Freigaben, OPC UA-Details, MQTT-Bibliotheken (paho-mqtt) – nur wissen, dass es sie gibt.

## Lerneinheit `site/lektionen/v17-netzwerke.html` (Titel „Netzwerke & Industrie 4.0“)
1 Warum? Hook „Der Roboter, der nicht antwortet“: Leitstand zeigt R1 als nicht erreichbar/gestört; die Ursache ist kein Defekt, sondern die IP 192.168.31.20 nach Steuerungstausch. Hook-Bild `../assets/img/v17-hook.png/.webp` (liegt vor). Ampel + „Warum muss ich das wissen?“ (Ingenieur in Produktion/IBN: Maschinen hängen im Netz; Daten statt Zettel; KI-Code für API-Abfragen prüfen können).
2 Theorie (Video `v17-theorie` mit „Video folgt“-Fallback), Explorables (Regel 14, in `explorables-v17.js`):
  a) **Zellennetz FZ-3**: SVG-Topologie (Switch, Gateway .1, Broker .5, SPS, D2, F1, M1, R1 rot). Gerät anklicken → IP dezimal und binär (32 Bit, Bezug V02), Netzanteil/Hostanteil farbig für /24, schrittweise UND-Animation IP AND Maske = Netzadresse (Bezug V04 `and`), Ergebnis „im Netz“ / „falsches Netz“.
  b) **Subnetz-Rechner**: Präfix /16 … /30 per Regler; zeigt Maske, Netzadresse, Broadcast, nutzbare Adressen 2^(32−n) − 2 (/24 → 254, /26 → 62).
  c) **HTTP-Anfrage Schritt für Schritt**: Client (Python im Browser) → Server (diese Website); URL zerlegen (Schema, Host, Pfad), Anfrage `GET /…/api/D2.json`, Antwort Status 200 + JSON; Umschalter D9.json → 404. Kurz: 200, 404, 401/403, 500. „API = feste Adressen, unter denen ein Programm Daten liefert; hier sind es statische Dateien, in der Fabrik ein Server am Leitrechner.“
  d) **JSON-Übersetzer**: JSON-Text von D2.json links; Klick auf einen Wert zeigt rechts den Python-Zugriff (`d2["werkzeugverschleiss_prozent"]["T4"]` → `83`) und den Python-Typ; Typtabelle.
  e) **MQTT-Broker**: Maschinen publizieren auf `fz3/D2/status` usw.; Abonnenten (Leitstand `fz3/+/status`, Instandhaltung `fz3/D2/#`, Qualität `fz3/M1/#`) – Nachricht läuft animiert über den Broker nur zu passenden Abonnenten. Vergleich HTTP (Pull: „fragen, wenn ich es wissen will“) vs. MQTT (Push: „Bescheid bekommen, wenn sich etwas ändert“).
  Lesetext kompakt: Netzwerk, IP, Subnetz/Präfix, Gateway, Switch, Port (1883, 80/443), Protokoll, Client/Server, vereinfachtes Schichtenmodell (Anwendung HTTP/MQTT · Transport TCP/Port · Internet IP · Netzzugang Ethernet/WLAN, Brief-im-Umschlag-Bild), IT vs. OT, Industrie 4.0 (vernetzte Maschinen, OPC UA nur nennen), warum die Zelle ein eigenes Netz hat (Vorgriff V18).
  **PAP** (per `KursPAP.figure`, `v05.css` einbinden): „Zellen-Check“ passend zum Beispiel: Daten holen → Status 200? (nein: Fehlermeldung) → Schleife für jede Maschine → IP im Netz? → „im Netz“ / „FALSCHES NETZ“ → Ende.
  Begriffs-Hinweise `k-begriff` für jeden neuen Fachbegriff (Netzwerk, IP-Adresse, Subnetz, Präfix, Netzmaske, Gateway, Switch, Router, Port, Protokoll, Client, Server, HTTP, URL, API, Statuscode, JSON, MQTT, Broker, Topic, Publish/Subscribe, OT, OPC UA …).
3 Ausprobieren (ausführbare Snippets, Vorhersage zuerst): `json.loads('{"id": "D2", "drehzahl_1_min": 1450}')`, `type(...)`, `json.loads('[1, 2.5, true, null]')`, `json.dumps({"maschine": "D2", "aktion": "wechseln"})`, `ipaddress.ip_address("192.168.31.20") in ipaddress.ip_network("192.168.30.0/24")`, `requests.get("../assets/data/v17/api/D2.json").status_code` und `…/D9.json` → 404. Python-Werkzeuge kurz einführen und auf das Labor verlinken („genauer im Labor →“).
4 Selbstcheck (Klausurformat, Stil Probeklausur 25/26): u. a. Liegt 192.168.31.20 in 192.168.30.0/24? · Nutzbare Adressen bei /26 (62) · Netzadresse von 192.168.30.77/26 (192.168.30.64) · Python-Ausdruck für T4 aus gegebenem JSON · Ergebnis von `json.loads('[1, 2.5, true, null]')` · Bedeutung von 404 · welche Topics empfängt `fz3/+/status` · Code-Schreib-Aufgabe: aus gegebenem Dict `zelle` alle Maschinen ausgeben, deren Status nicht "laeuft" ist.
5 Deep Dive (eingeklappt): MQTT mit paho-mqtt (nicht ausführbar, Hinweis), OPC UA in drei Sätzen, Subnetz binär von Hand, IPv6 in zwei Sätzen.
Videos zur Nachbereitung (v17-theorie, v17-python, v17-beispiel, je „Video folgt“) · „Weiter ins Programmierlabor →“ · Hinweis Projektzeit mit Link `../projekt.html` (die Seite entsteht parallel in V14 – trotzdem verlinken) · „Für Dozierende“ (eingeklappt): Ablauf 135 Min mit **letzten 30 Min Projektzeit (Link `../projekt.html`)**, Hinweise (R1-Fehler absichtlich, requests im Browser über pyodide-http, nur GET).

## Labor `site/lektionen/v17-labor.html`
Teil A „Im Labor“:
1. Werkzeugkasten (Video `v17-python`): Karten (je ausführbar): JSON-Text ↔ Python (loads/dumps, Typtabelle) · Verschachtelte Daten (Liste von Dicts, Dict im Dict, .get) · JSON-Datei lesen/schreiben (json.load/json.dump mit with open) · HTTP mit requests (get, status_code, json(), 404 prüfen) · Fehler abfangen (`except ValueError` für kaputtes JSON, Status prüfen) · IP-Adressen mit ipaddress.
2. Vorgerechnetes Beispiel (Video `v17-beispiel`): exakt `briefing/v17-beispiel.py`, Zeile-für-Zeile-Erklärung, ausführbar.
3. Ablauf verfolgen (trace): Schleife über eine **inline** als Dict geschriebene Maschinenliste (ohne requests, damit der Visualisierer läuft), Variablen `m`, `ort`, Zähler.
4. Zeilen ordnen (2 Parsons): D2.json holen → Status prüfen → Verschleiß-Schleife; MQTT-Meldung als JSON bauen. Mit Ablenkern (`json.load(antwort)`, `zelle["maschinen"]["D2"]`).
5. Lücken füllen: `json.loads` / `["maschinen"]` / `.items()` / `in netz`.
6. **PAP zeichnen** (Aufgabentyp `pap-zeichnen`, eigene Station, z. B. „PAP: Adresse prüfen“): Eingaben drittes und viertes Oktett (int, Eingabeaufforderungen ohne Ziffern, ggf. `"prompt":""`), Ausgabe „im Netz“, „falsches Netz“ oder „keine Geräteadresse“ (viertes Oktett 0 oder 255). Tests über Ausgaben mehrerer Eingabepaare. Einmal richtig, einmal falsch im Browser prüfen.
7. Erste eigene Aufgabe (Code mit Tests): Funktion `gestoerte(zelle)` gibt die Liste der IDs mit Status "gestoert" zurück; Tests mit verschiedenen Dicts (auch leer, mehrere).
8. Code-Review (KI-Spiegel): KI-Code „Netz-Check“ mit eingebauten Fehlern: IP-Vergleich per `startswith("192.168.3")` (lässt 192.168.31.20 durch!), `.json()` ohne Statusprüfung, `m["temperatur_c"]` → KeyError (Schlüssel fehlt), `json.load(antwort)` statt `antwort.json()`.
9. Typische Fehlermeldungen: KeyError (Schlüssel fehlt), `TypeError: list indices must be integers or slices, not str` (`zelle["maschinen"]["D2"]`), `json.JSONDecodeError` (einfache Anführungszeichen / Komma am Ende), `TypeError: the JSON object must be str, bytes or bytearray, not dict`, `ValueError: ... does not appear to be an IPv4 or IPv6 address`, `.json()` auf 404-Antwort.
Teil B „Training zu Hause“ (6–8 gestuft, automatische Tests, Tests variieren Daten gegen Hardcoding):
T1 ⭐ JSON-Text einer Maschine mit `json.loads` lesen, zwei Werte ausgeben · T2 ⭐ MQTT-Nutzlast mit `json.dumps` bauen (Funktion `meldung(maschine, werkzeug)` → JSON-Text, Test parst ihn) · T3 ⭐⭐ `im_netz(ip, netz)` mit ipaddress → bool · T4 ⭐⭐ F1.json per requests holen und Programm + Stückzahl ausgeben (Test holt die Datei selbst und vergleicht) · T5 ⭐⭐⭐ `wartungsliste(details, grenze=80)` → Liste von Tupeln (maschine, werkzeug, prozent) aus Dict von Detail-Dicts (fehlender Verschleiß-Schlüssel → überspringen) · T6 ⭐⭐⭐ Zellenbericht: maschinen.json + je Gerät `URL + id + ".json"` holen, Gesamtstückzahl der Schicht mit `.get("stueckzahl_schicht", 0)` (Ergebnis 546) · T7 Wiederholung (V09 try/except + with open): MQTT-Mitschnitt als JSON-Lines-Datei (eigene Datei `site/assets/data/v17/mqtt-mitschnitt.jsonl`, je Zeile eine Nachricht, einige kaputt), Funktion zählt gültige Nachrichten je Topic, kaputte per `except ValueError` überspringen; Tests schreiben eigene Varianten-Dateien · T8 ⭐⭐⭐⭐ Klausur-Modus (erst auf Papier): aus gegebenem Dict (wie maschinen.json) alle Geräte im falschen /24-Netz finden **ohne ipaddress**, nur mit `split(".")` und Vergleich der ersten drei Oktette.
Notebook-Link. Projektzeit-Hinweis mit Link `../projekt.html`.
Musterlösungen lokal per Python-Skript gegen ihre Tests prüfen; für requests: Server läuft bereits unter http://localhost:8117 (Wurzel `site/`), im Testskript die relative URL `../assets/…` auf `http://localhost:8117/assets/…` umbiegen.

## Notebook `site/notebooks/V17-Netzwerke.ipynb`
Wie V11-Notebook. Läuft außerhalb des Browsers (Codespaces/Jupyter): URL absolut `https://maschoeller.github.io/maschinenbau-vorlesung-informatik/assets/data/v17/api/`. Inhalte: JSON, verschachtelte Daten, requests, ipaddress, Beispiel, 3–4 Übungen, optional MQTT-Ausblick (Markdown).

## Videos (nur vorbereiten, keine Vertonung)
`video-src/v17-theorie` (IP/Subnetz, HTTP, JSON, MQTT, Industrie 4.0), `v17-python` (Werkzeugkasten: json, verschachtelt, requests, ipaddress), `v17-beispiel` (genau v17-beispiel.py). Je `texte.py` (SRC + SZENEN, 5–6 Szenen, ≤ 2.700 Zeichen Sprechfassung) und `render.py`, gemeinsame Hilfen in `video-src/v17-common/`.

## Browser-Prüfung
Server läuft schon: http://localhost:8117/ (Wurzel `site/`), keinen eigenen starten. Eingebauter Browser, **eigener Tab** (tabs_create), `?v=<zufall>` gegen Cache, 1600 und 375 px ohne horizontales Scrollen, Konsole ohne JS-Fehler (404 für fehlende Videos ok), danach Viewport auf desktop zurück und eigenen Tab schließen.
