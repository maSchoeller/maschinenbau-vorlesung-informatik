# Seitenstruktur und Gestaltungsregeln

Gilt für alle 22 Termine. Ziel: ruhig, übersichtlich, DHBW-Stil – Inhalt statt Kacheln.

## Seitenstruktur pro Termin

Jeder Termin hat zwei Seiten:

### 1. Lerneinheit `lektionen/vXX-<thema>.html` – verstehen
Lineares Lesestück wie ein gutes Lehrbuchkapitel.
1. Warum? – Hook + Wissens-Ampel
2. Theorie – Video, Explorables, Lesetext
3. Ausprobieren – kurze Vorhersage-Snippets direkt im Text
4. Selbstcheck – Quiz im Klausurformat
5. Deep Dive (freiwillig, eingeklappt)
Am Ende ein klarer Übergang: „Weiter ins Programmierlabor →“.
„Für Dozierende“ eingeklappt ganz unten.

### 2. Programmierlabor `lektionen/vXX-labor.html` – selbst programmieren
Arbeitsumgebung wie eine IDE: immer **eine Aufgabe** im Blick statt einer langen Seite.
- Teil A „Im Labor“ (Präsenz): Werkzeugkasten (Syntax-Karten) · Vorgerechnetes Beispiel · Ablauf verfolgen · Zeilen ordnen · Lücken füllen · Erste eigene Aufgabe · Code-Review (KI-Spiegel) · Typische Fehlermeldungen
- Teil B „Training zu Hause“ (~60 Min): gestufte Aufgaben ⭐–⭐⭐⭐⭐, eine Wiederholungsaufgabe, eine Klausur-Modus-Aufgabe, Notebook-Link

Layout Desktop (≥ 1100 px), drei Spalten:
- links (ca. 260 px, sticky): Aufgabenliste in zwei Gruppen (Im Labor / Training zu Hause) mit Status ○ offen · ◐ begonnen · ✓ gelöst, Sterne, Gesamtfortschritt
- Mitte: aktuelle Aufgabe – Titel, Aufgabenstellung, ggf. eingeklappter Werkzeugkasten-Hinweis, Editor, Knöpfe (Ausführen · Prüfen · Tipp · Lösung), Ausgabe/Testergebnisse; unten „← Zurück · Weiter →“
- rechts (ca. 340 px): Befehls-Bibliothek angedockt (nicht als Overlay), einklappbar
Tablet: Bibliothek als Overlay. Mobil: Aufgabenliste als Auswahlmenü oben, Bibliothek als Bottom-Sheet.
Jede Aufgabe hat einen Anker (`#a-werkzeugkasten`, `#t-3` …) – Deep-Links und Zurück-Taste funktionieren.

## Gestaltungsregeln

1. **Höchstens eine Rahmen-Ebene.** Keine Karte in einer Karte, keine Box in einer Box. Abschnitte trennt Weißraum und eine Überschrift, nicht ein Rahmen.
2. **Karten nur für anklickbare Dinge** (Lernpfad-Stationen, Aufgaben in der Liste). Inhalte stehen frei auf der Seite.
3. **Genau drei Hinweis-Typen**: Merke · Achtung · Warum muss ich das wissen? – jeweils linke Linie (3 px) + sehr heller Hintergrund, kein umlaufender Rahmen, kein Schatten.
4. **Rot sparsam**: Links, aktiver Zustand, ein primärer Knopf pro Bereich, Akzentlinien. Erfolg = Grün, Fehler = dunkles Rot mit Symbol (nicht nur Farbe).
5. **Emojis nur in der Wissens-Ampel** (🧠 📖 🤖). Sonst keine Emojis, keine Deko-Icons.
6. **Typografie**: h1 2rem, h2 1.5rem, h3 1.125rem; Fließtext 1.0625rem, Zeilenlänge max. 70 Zeichen; Medien (Video, Explorables, Code) dürfen breiter sein.
7. **Abstände**: zwischen Abschnitten 64 px, zwischen Blöcken 24 px. Kein Abschnitt beginnt mit einer Liste von Badges.
8. **Code** ist der einzige dunkle Block. Jeder Codeblock und jeder Editor hat oben rechts einen **Kopieren-Knopf** (Symbol + „Kopieren“ → „Kopiert ✓“, per aria-live angesagt). Optional Sprach-Label „Python“.
9. **Knöpfe**: primär (rot gefüllt) höchstens einer pro Bereich, sonst sekundär (Kontur) oder Textlink.
10. **Nummerierung**: Abschnitte ja (1, 2, 3), Unter-Nummern (3.1, 3.2) nein.
11. **Mobil zuerst prüfen**: 375 px ohne horizontales Scrollen, Bedienelemente ≥ 44 px.
