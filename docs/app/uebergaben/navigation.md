# Übergabe Navigation

Stand: 2026-11-23. Rolle Navigation: Heute, Lernpfad, Über den Kurs, Glossar, Suche.

## Was gebaut wurde

| Datei | Inhalt |
|---|---|
| `app/src/pages/index.astro`, `public/app/heute.js` | Heute. Statisch steht der Einstieg „Starte mit V01“ (erster Besuch und ohne JavaScript). `heute.js` ersetzt ihn, sobald ein Lernstand oder `inf-mb/app/zuletzt` existiert. |
| `app/src/pages/lernpfad.astro`, `public/app/lernpfad.js` | Lernpfad: drei Phasen, 22 Stationen statisch aus `kurs.yaml`. Das Skript ergänzt Stand (Symbol und Text), Zahlen, „Jetzt dran“ und scrollt die aktuelle Lektion in den Blick (nicht bei Anker in der URL). |
| `app/src/pages/kurs.astro` | Über den Kurs: Fundament-Platzhalter geprüft, unverändert übernommen (Texte byte-genau aus `site/index.html`). Unverändert, braucht kein eigenes CSS. |
| `app/src/pages/glossar.astro`, `src/components/nav/glossar-daten.mjs`, `public/app/glossar.js` | Glossar: 459 Begriffe A bis Z statisch, Sprungleiste (klebt unter der Kopfzeile), Filterfeld (sofort, tolerant für Umlaute, ß, Groß/Klein; „n von 459“ als Statusmeldung). |
| `public/app/suche.js`, `suche.css` | Suchdialog (`<dialog>`, `showModal`): Knopf in der Kopfzeile, Strg+K bzw. Cmd+K (die Hülle sendet das Ereignis `suche`). |
| `public/app/stand.js` | Gemeinsame Stand-Berechnung (`window.KursStand`) für Heute und Lernpfad. Wird über `skripte={['stand']}` eingebunden. |
| `public/app/seiten.css` | Gestaltung aller vier Seiten (Präfixe `np-`, `lp-`, `gl-`). |

Nicht angefasst: `navigation.mjs`, Hülle, `site/`.

## Entscheidungen

- **Aktuelle Lektion** = die höchste Lektion, in der du schon gearbeitet hast (Abschnitt abgehakt, Aufgabe gelöst oder versucht); ist sie fertig, die nächste. Noch nichts getan: V01. Alles fertig: Hinweis mit Weg zum Klausurtrainer. Die Vertragsformulierung „erste nicht abgeschlossene“ würde das Warm-up leeren (frühere Lektionen wären immer fertig); so bleiben liegen gebliebene Aufgaben früherer Lektionen als Warm-up sichtbar.
- **Freigabedatum**: ist die nächste Lektion noch nicht freigegeben, steht dort „Als Nächstes“ mit „erst ab dem TT.MM. freigegeben, du kannst schon hineinschauen“. Im Lernpfad steht „Freigabe ab TT.MM.“, solange das Datum nicht erreicht ist. Nie gesperrt.
- **Fertig** = alle Pflichtabschnitte abgehakt (Abschnitte mit „freiwillig“ im Titel, also Deep Dive, zählen nicht) und alle prüfbaren Teile des Labors gelöst. **Begonnen** = irgendein Eintrag in `done`, `aufg`, `begonnen` oder `gesehen`. Zählung der Aufgaben je prüfbarem Teil (`data-id`), wie im Labor.
- **Warm-up**: aus allen früheren, begonnenen, nicht fertigen Lektionen je höchstens zwei offene Stationen, dann über alle gerankt (angefangene zuerst, dann Training/Teil B, dann leichtere; bei Gleichstand die nähere Lektion), höchstens drei. Deep-Link `lektionen/vXX-labor.html#<station>`.
- **Hinweise** auf Heute: höchstens einer. Erst „Konto“ (wenn `KursApp.konto.status()` nicht angemeldet meldet), sonst „Installieren“ (nicht, wenn die App schon eigenständig läuft). Wegklicken merkt sich `localStorage['inf-mb-app:heute-hinweise']` (nur dieses Gerät). Beide verlinken nur `konto.html`.
- **Weiter, wo du warst**: nur wenn die zuletzt besuchte Seite eine Lektionsseite ist (`lektion` gesetzt oder Pfad `lektionen/…`). Glossar, Lernpfad, Konto usw. werden ignoriert. Der Knopf ist primär, solange es keine „aktuelle Lektion“ gibt (alles fertig: dann Klausurtrainer primär, Weiter-Knopf ghost). Immer genau ein primärer Knopf.
- Wird ein Hinweis weggeklickt, geht der Fokus auf die Seitenüberschrift.
- **Suche**: Treffer in vier Gruppen (Lektionen, Abschnitte und Aufgaben, Bibliothek, Glossar). Punkte: Titel gleich > Titelanfang > Wortanfang im Titel > Teilwort > Text. Jedes Suchwort muss vorkommen. „ae/oe/ue“ findet „ä/ö/ü“. Lektionsnummer („v07“) findet die Lektion. Leere Suche: nur die Gruppe Lektionen mit allen 22 (die anderen Gruppen erst ab dem ersten Zeichen). Die Python-Themen aus `kurs.json` werden beim Laden an den Text der Lektionseinträge gehängt („numpy“, „for schleife“ finden die Lektion). Der Fokus kehrt beim Schließen zum Suchknopf zurück, auch wenn der Auslöser aus dem DOM verschwunden ist. Glossar-Filter und Suche behandeln „ae/oe/ue“ gleich. `suche.json` wird erst beim ersten Öffnen geladen.
- Esc im Suchdialog schließt sofort (das native Suchfeld würde sonst zuerst nur den Text löschen).

## So prüfst du es

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && KURS_AUSGABE=dist-nav npm run build
cd "$W" && swa start app/dist-nav --api-location api --port 4321 --api-port 7331
```

- Leerer Stand: `localStorage.clear()`, dann `index.html` (Einstieg), `lernpfad.html` (V01 hervorgehoben).
- Mit Stand: in einer Lerneinheit Abschnitte abhaken, im Labor eine Aufgabe beginnen; Heute zeigt „Weiter, wo du warst“, die Lektion mit Stand und, wenn eine spätere Lektion begonnen ist, das Warm-up.
- Tastatur: Strg+K, Tippen, Pfeil auf/ab, Enter; Esc; Fokus kehrt zum Suchknopf zurück. Glossar: Filterfeld, Sprungleiste per Tab.
- Die Stand-Logik lässt sich ohne Browser prüfen: `stand.js` mit einer Attrappe für `window.KursSpeicher` in `node:vm` laden (so wurde sie getestet: leer, V01 fertig, V02 begonnen, Freigabe in Zukunft, alles fertig).

## Wünsche an andere Rollen

- **Fundament**: `skripte/index-bauen.mjs` sollte die Glossar-Sammlung als Funktion exportieren (`export function sammleGlossar()`); `glossar.astro` braucht die Daten schon beim Astro-Build, wenn `dist/app/daten/glossar.json` noch nicht existiert. Bis dahin steht die gleiche Regel doppelt in `src/components/nav/glossar-daten.mjs` (geprüft: gleiche 459 Einträge und IDs wie `glossar.json`). Ändert sich die Regel in `index-bauen.mjs`, dort mitziehen.
- **Fundament**: `KursApp.fortschritt.lektion()` zählt alle Abschnitte inklusive Deep Dive, der Lektionswähler zeigt also „4/5 Abschnitte“, wo Heute und Lernpfad „4 von 4“ zeigen. Bei Bedarf angleichen.
- **Fundament (Glossar-Dubletten)**: Singular/Plural-Dubletten (Datei/Dateien, Argument/Argumente) entstehen durch exakte Wortlaut-Sammlung in `index-bauen.mjs`; zusammenführen, dabei die Anker-IDs erhalten. Kaputte Formen wie „Dateie“ sind in der Sammlung nicht reproduzierbar (Quelle enthält nur Datei/Dateien).
- **PWA/Konto**: Heute verlinkt nur `konto.html`. Gibt es dort einen Anker für „Offline nutzen“, kann der Hinweis darauf zeigen.

## Wiederholbare Prüfung

`node skripte/pruefe-navigation.mjs [dist-nav] [4321]` (Node 22, nach dem Build): eigener Dateiserver, Playwright bei 1440×900 und 1024×768. Prüft leere Suche (22 Lektionen), Python-Themen in der Suche, Fokus-Rückgabe, Glossar-Filter ae/oe/ue, „Weiter“ nie auf Navigationsseiten, genau ein primärer Knopf (auch im Fertig-Zustand), Warm-up mit drei Aufgaben (max. 2 je Lektion), Fokus nach Wegklicken des Hinweises, Lernpfad mit 22 Stationen, keine Konsolenfehler.

## Bekannte Grenzen

- Frontier-Logik: Wer eine spätere Lektion nur kurz bearbeitet (Abschnitt abgehakt), rückt die „aktuelle Lektion“ dorthin; die frühere erscheint dann im Warm-up. „Nur angesehen“ (`gesehen`) zählt dafür nicht.
- Freigabedaten gibt es in `kurs.yaml` noch nicht (alle `null`); die Darstellung ist nur über die Logik getestet (Node), nicht im Browser mit echtem Datum.
- Hinweis „Konto“ erscheint auch, wenn die API nicht erreichbar ist (`konto.status()` meldet dann nicht angemeldet, ohne Netz gilt der letzte bekannte Stand).
- Suchtreffer zeigen keine Hervorhebung des Suchworts; Tippfehler werden nicht toleriert (nur Umlaute, ß, Groß/Klein).
- Die Suche merkt sich nichts zwischen zwei Öffnungen; Tablet nicht auf echtem Gerät geprüft (nur 1024×768 emuliert).
