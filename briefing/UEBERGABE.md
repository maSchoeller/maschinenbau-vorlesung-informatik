# Übergabe: Maschinenbau-Vorlesung Informatik (Stand 2026-11-21)

## Projekt in einem Satz
Interaktive Vorlesungs-Website für das Modul **Informatik (T4MB1006)**, Maschinenbau, DHBW Stuttgart Campus Horb, 1. Studienjahr, 22 Termine à 135 Min plus ~60 Min Training zu Hause, rein schriftliche Klausur (Niveau Probeklausur 25/26). Leitidee: *KI schreibt Code – Ingenieure spezifizieren, prüfen und verantworten.*

- Repo: `maSchoeller/maschinenbau-vorlesung-informatik` (öffentlich), Website: https://maschoeller.github.io/maschinenbau-vorlesung-informatik/ – Push auf `main` veröffentlicht automatisch (GitHub Actions, Medien in Git LFS).
- Verbindlich lesen: `KONZEPT.md` (Leitidee, Wissens-Ampel, 22 Termine mit Informatik- und Python-Strang), `DESIGN.md` (Seitenstruktur Lerneinheit + Programmierlabor, Gestaltungsregeln 1–11, didaktische Regeln 12–15), `briefing/LEKTION-BRIEF.md` (Briefing für neue Lektionen), `README.md` Abschnitt „Erklärvideos“.
- Wissensspeicher (MCP `wissen`, project `main`): Notiz `projekte/Vorlesung Informatik Grundlagen.md` – Entscheidungen und Stand.

## Stand
| Lektion | Inhalt (Lerneinheit, Labor, Notebook) | Videos | Hook-Bild | Online |
|---|---|---|---|---|
| V01–V03 | fertig, abgenommen, Regeln 12–15 umgesetzt | je 3, eleven_v3 | ja | ja |
| V04 Logik & Verzweigungen | fertig | 3 fertig | **fehlt** | nein |
| V05 | gebaut mit Schwerpunkt **Struktogramm** → **muss auf Programmablaufplan umgebaut werden** | v05-theorie (Struktogramm) fertig, python/beispiel abgebrochen → alle 3 neu | **fehlt** | nein |
| V06 Schleifen | fertig (enthält Struktogramme der Schleifenformen → auf PAP umstellen) | 3 fertig | **fehlt** | nein |

Lokal noch nicht committet: V04–V06 (Seiten, Notebooks, explorables-v04/05/06, v04/05/06.css, Videos, video-src), `index.html` (V04–V06 im Lernpfad freigeschaltet), `site/assets/js/aufgaben.js` (neuer Knopf „Schritt für Schritt“ in Code-Aufgaben – im Browser noch ungetestet), `briefing/v04..v06-beispiel.py`.

## Entscheidung des Dozenten (neu)
**Statt Struktogramm (Nassi-Shneiderman) Schwerpunkt auf den Programmablaufplan (PAP, DIN 66001 / ISO 5807)** – für die Studierenden leichter zu zeichnen und weniger aufwendig. Struktogramm höchstens als kurzer Ausblick/Vergleich.

## Nächste Schritte
1. **PAP-Umstellung**
   - `KONZEPT.md`: V05 → „Problemanalyse & Programmablaufplan“, Hook „Der PAP wird zum Prompt“; Leitidee/Argument 2 („Ein sauberes Struktogramm ist ein sehr guter Prompt“) auf PAP umformulieren. Dasselbe in `site/index.html` (Argumente, Lernpfad-Station V05), in V01 (Lerneinheit/Labor/Video-Text erwähnen „Struktogramm“) und `DESIGN.md`/`LEKTION-BRIEF.md`, falls erwähnt (`grep -ri struktogramm`).
   - V05 neu konzipieren: Lerneinheit, Labor, Notebook mit PAP (Symbole Start/Ende, Anweisung, Ein-/Ausgabe, Verzweigung, Übergangsstelle; Ablauf läuft animiert durch den PAP; PAP-Baukasten mit live erzeugtem Python-Code; PAP → Code, Testfälle je Pfad; Klausuraufgabe „PAP gegeben → Code“). Vorgerechnetes Beispiel bleibt `briefing/v05-beispiel.py` (Werkstoffvorschlag), nur als PAP gezeichnet. Dateinamen sinnvoll umbenennen (z. B. `v05-programmablaufplan.html`, `V05-Programmablaufplan.ipynb`, index-Link anpassen). Vorjahresmaterial: `maSchoeller/maschinenbau-vorlsung-25_26`, Lektionen V05/V06 „Programm-Ablauf-Pläne“.
   - V05-Videos alle drei neu (Pipeline `video-src/common/sprechen.py`, eleven_v3, Quellen in `video-src/v05-*` überschreiben).
   - V06: Struktogramme der Schleifenformen durch PAP-Schleifen ersetzen (Lerneinheit, Labor, ggf. Video v06-theorie neu vertonen/rendern, falls dort Struktogramme vorkommen – prüfen).
2. **Hook-Bilder V04–V06** (`site/assets/img/v0X-hook.png/.webp`, Stil wie v02-hook): letzter Versuch scheiterte, weil chatgpt.com im Chrome des Nutzers nicht lud. Erst den Nutzer bitten, chatgpt.com in Chrome zu öffnen; dann per Claude in Chrome erzeugen (Prompts stehen im Verlauf: Presse mit Zweihand-Tastern; Ingenieurin zeichnet PAP am Whiteboard + KI erzeugt Code; glühendes Werkstück mit Abkühlkurve und Kreispfeil).
3. **Prüfen** im eingebauten Browser (eigener Tab, Cache mit `?v=…` umgehen): V04–V06 Lerneinheit + Labor bei 1600/375 px, Konsole, je eine Code-Aufgabe, Parsons, Visualisierer, neuer „Schritt für Schritt“-Knopf in Code-Aufgaben, Begriffs-Popover auf 375 px, Quiz-Code „nach-antwort“. Video v04-beispiel: Code nur 15 px groß – prüfen, ob lesbar.
4. **Committen und auf `main` pushen** (Trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), Deploy abwarten, online prüfen.
5. Danach weiter mit **V07–V09** nach `briefing/LEKTION-BRIEF.md`: vorgerechnete Beispiele zuerst selbst als `briefing/vXX-beispiel.py` schreiben und prüfen, dann parallel Sonnet-Agenten für Inhalt (je Lektion), Videos (je Lektion), Bilder.

## Arbeitsweise, die sich bewährt hat
- Token sparen: Arbeit an **Sonnet-Subagenten** mit klarer Dateizuständigkeit verteilen (gemeinsame JS/CSS nur ein Agent; Lektions-Agenten nur ihre Dateien), Bericht max. 10 Zeilen. Opus nur für Koordination/Prüfung.
- Browser-Tests: jeder Agent eigener Tab und eigener Port; Browser-Cache umgehen.
- ElevenLabs: max. ~3 gleichzeitige Anfragen über alle Agenten → TTS strikt nacheinander; nur über `sprechen.tts` (eleven_v3, Stimme Theo Teacher, Sprechfassung mit `[[Anzeige|Sprechweise]]`). Videos: nach einer Exception keine weitere Ausgabe, keine Codezeile außerhalb des Kastens, nur bis dahin eingeführte Python-Konstrukte.
- Bilder: ChatGPT über Claude in Chrome (Nutzer ist dort angemeldet), flacher Vektorstil, nur DHBW-Farben, kein Text im Bild.
- Laufende lokale Python-Testserver ließen sich nicht beenden (Rechteprüfung) – stören nicht.

## Stand 2026-11-21 spät (nach PAP-Umstellung)
- Erledigt, noch nicht committet: V05 neu als PAP (`v05-programmablaufplan.html`, Labor, `V05-Programmablaufplan.ipynb`, explorables-v05.js, v05.css; Vorgabe `briefing/v05-pap-konzept.md`), V06 auf PAP-Schleifen, KONZEPT/DESIGN/index/V01/V04/Bibliothek auf PAP, Videos v05-theorie/-python/-beispiel neu, v06-theorie und v03-toleranzrechner (je Szene 2) neu vertont, PAP-Zeichenhilfe `video-src/v05-common/pap.py`, Hook-Bilder V04–V06.
- Geprüft (Browser 1600/375 px, Konsole, Code-Aufgaben, Parsons, Schritt für Schritt, Popover, nach-antwort): ok.
- Veröffentlicht am 2026-11-21 (Commit 52b9b5d auf `main`), online geprüft. Weiter: Nachtlauf nach `briefing/NACHTLAUF-V07-V22.md`.
- Bekannte Kleinigkeiten: in v05-beispiel-Video angeschnittene Linienstummel am Ausschnittrand; auf 375 px ist das Bedienfeld des Ablauf-Explorables in V05 recht groß.
