# V15 Erklärvideos: was zum Fertigstellen noch zu tun ist

Stand: Texte (`texte.py`) und Bilder (`render.py`) aller drei Videos sind fertig, **nicht vertont, nicht gerendert**. Zeiten im Modus `probe` sind aus der Textlänge geschätzt (ca. 14 Zeichen je Sekunde): theorie ca. 199 s, python ca. 178 s, beispiel ca. 200 s.

## Voraussetzungen

- ElevenLabs-Credits: Bedarf zusammen ca. 7.800 Zeichen (Sprechfassungen 2.632 / 2.349 / 2.665). Restkontingent vorher prüfen, `tts_run.py` bricht bei jedem Fehler sofort ab und wiederholt nie.
- `ELEVENLABS_API_KEY` gesetzt (wie bei V1 bis V14).
- Die Render-Skripte rechnen die Daten mit **pandas** (`site/assets/data/v15/wellen.csv`, echte Ausgabe von `briefing/v15-beispiel.py`). pandas muss in der Umgebung installiert sein (`video-src/requirements.txt` führt es noch nicht auf, nicht angefasst). Nach Änderung von `wellen.csv` oder des Beispiels prüfen die Asserts in `v15-common/bausteine.py` und `v15-beispiel/render.py` die Kennzahlen und melden Abweichungen.

## Reihenfolge je Video (theorie, python, beispiel)

```
python video-src/v15-common/tts_run.py v15-theorie     # vertont strikt nacheinander, Szene fuer Szene
python video-src/v15-theorie/render.py full            # rendert mit Audio, schreibt nach site/assets/video
python video-src/v15-theorie/render.py zeiten          # Satzzeiten pruefen
```

Dasselbe mit `v15-python` und `v15-beispiel`. Vorab ohne Kosten: `python video-src/v15-<video>/render.py text` (Sprechfassung und PRUEFEN-Hinweise), `... probe` (Standbilder nach `out/`, Bild-Scan alle 0,5 s).

## Nach der Vertonung prüfen

- `zeiten` je Video: die Satzgrenzen aus der Pausenerkennung stimmen mit den Sätzen überein. Falls nicht, in `h15.py` das Dict `MANUAL` (`{Szene: [(von, bis), ...]}` in Sekunden) setzen.
- Echte Dauer weicht von der Schätzung ab: Zeitmarken `ct(k)` der Szenen folgen den Satzanfängen automatisch; in Szenen mit festen Offsets (Regelkarte in `v15-theorie` Szene 5, Tabellenaufbau in `v15-beispiel` Szene 4, Code-Tippen) per Stichprobe `full` + Einzelbilder prüfen, ob Bild und Satz zusammenpassen.
- Hörprobe der Zahlen: `[[Cp|C P]]`, `[[Cpk|C P K]]`, `D eins`/`D zwei`, Dezimalzahlen (Markup in `texte.py`).
- Untertitel (VTT) entstehen aus der Anzeigefassung; kurz auf Zeilenumbrüche achten.

## Einbinden

- Dateien kommen nach `site/assets/video/` (Namen wie bei V14, z. B. `v15-theorie.mp4`, `.vtt`, Poster). Die Lerneinheit und die Labor-Station V15 verweisen bereits auf die Videos (404, solange sie fehlen).
- `video-src/SPRECHFASSUNGEN.md` mit `python video-src/common/sprechfassungen_erzeugen.py` neu erzeugen (diese Datei und `common/` wurden hier bewusst nicht verändert).

## Bekannte Grenzen

- Szene 2 in `v15-theorie`: das Fülllicht der 99,7-%-Fläche erscheint passend zum dritten Satz; liegt der Satz nach der Vertonung früher oder später, bleibt es trotzdem zeitlich konsistent, da es an `ct(2)` hängt.
- Keine Emojis, Sonderzeichen nur σ, μ, √, ≥, ±, −, ✓, ✗ (in SourceSans3 vorhanden; Probebilder geprüft).
