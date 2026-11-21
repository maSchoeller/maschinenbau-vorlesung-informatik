# Architektur: Backend für Arbeitsstand und Lernfortschritt

Stand: Entwurf. Heute läuft die Website vollständig im Browser; der Arbeitsstand liegt in `localStorage`. Dieses Dokument beschreibt, wie derselbe Stand später kontobasiert in Azure gespeichert wird, ohne dass sich die Lektionsseiten ändern.

## 1. Ausgangslage und Zielbild

Alle Seiten sprechen nur noch `window.KursSpeicher` (`site/assets/js/speicher.js`) an. Heute steckt dahinter ein localStorage-Adapter (Schlüssel `dhbw-inf-mb:speicher:v2`, Einträge `{wert, geaendert, benutzer}`). Der Kern hält einen Cache, wendet die Konfliktregel an und bedient Abonnenten; ein Adapter speichert nur. Dadurch genügt ein neuer Adapter, um auf ein Backend umzuschalten (`KursSpeicher.setzeAdapter(...)`).

Zielbild:

```
Browser (statische Seiten)  --fetch/JSON-->  Azure Static Web Apps (Hosting + Login)
   KursSpeicher + AzureAdapter                    |  /api/* (verwaltete Azure Functions)
   Cache + localStorage (offline)                 v
                                           Azure Cosmos DB (Region Germany West Central)
```

- **Hosting:** Azure Static Web Apps (SWA). Die Seiten bleiben statisch, kein Build nötig. Die API ist als verwaltete Azure Functions (Node.js) im selben Projekt, dadurch gleiche Herkunft, keine CORS-Konfiguration.
- **Login:** SWA-Authentifizierung mit Microsoft Entra ID. Für DHBW-Konten als Gast-/B2B-Anmeldung des DHBW-Mandanten, alternativ Entra External ID für Studierende ohne Mandantenzugang. Der Login liefert eine `userId` (Objekt-ID) im Header `x-ms-client-principal`; die API vertraut nur diesem Header.
- **Ohne Login bleibt alles nutzbar:** Wer nicht angemeldet ist, arbeitet wie heute lokal (Adapter `localStorage`).

## 2. Datenbank: Cosmos DB statt Azure SQL

Empfehlung: **Azure Cosmos DB for NoSQL** (Serverless).

| Kriterium | Cosmos DB | Azure SQL |
|---|---|---|
| Datenform | Eintrag = Pfad + beliebiges JSON, schemafrei, wächst mit jeder Lektion | Tabelle mit JSON-Spalte oder ständigen Schemaänderungen |
| Last | wenige Lese-/Schreibzugriffe, Spitzen in Vorlesungszeiten | gleichmäßige Grundkosten (auch im Leerlauf) |
| Kosten bei ~100 Nutzern | Serverless: Cent- bis niedriger Euro-Bereich | Basic/serverless: ca. 5 bis 15 EUR/Monat |
| Auswertung | einfache Abfragen je Partition; Dozenten-Statistik über Änderungsfeed oder Export | stark bei freien Ad-hoc-Auswertungen |

Gründe für Cosmos: die Daten sind ohnehin Schlüssel-Wert-Paare je Benutzer (Partitionsschlüssel `/benutzerId`, jede Abfrage der Studierenden trifft genau eine Partition), kein Schema-Migrationsaufwand, Serverless rechnet nur echte Anfragen ab. Azure SQL wäre sinnvoll, wenn das Dozenten-Dashboard viele freie SQL-Auswertungen braucht; dafür genügt notfalls ein nächtlicher Export in eine kleine SQL-Datenbank.

## 3. Datenmodell

Container `eintraege`, Partitionsschlüssel `/benutzerId`.

```json
{
  "id": "inf-mb/v05/code:t-3",
  "benutzerId": "a3f9...",         // pseudonyme ID (siehe Abschnitt 7)
  "pfad": "inf-mb/v05/code:t-3",
  "wert": "x = 5\nprint(x)",       // beliebiges JSON, max. ca. 64 KB
  "geaendert": "2026-11-21T20:15:03.120Z",
  "geraet": "tab-7c2e",            // optional, nur zur Fehlersuche
  "geloescht": false                // Löschmarke für den Abgleich
}
```

Container `benutzer`: `{id: benutzerId, angelegt, letzterZugriff, einwilligungen: {fortschrittFuerDozent: true|false}}`. Es werden weder Name noch E-Mail gespeichert (siehe Abschnitt 7).

Pfadkonvention wie heute: `inf-mb/<lektion>/<schluessel>`. Beispiele: `inf-mb/v01/done` (erledigte Abschnitte), `inf-mb/v05/aufg` (gelöste Aufgaben), `inf-mb/v05/code:t-3` (Code einer Aufgabe), `inf-mb/bibliothek/stand`.

## 4. REST-Endpunkte (passend zur Adapter-Schnittstelle)

Alle Endpunkte verlangen Login; der Benutzer ergibt sich aus dem Principal, nie aus dem Pfad oder Body.

| Adapter-Methode | Endpunkt | Zweck |
|---|---|---|
| `alle()` | `GET /api/eintraege?seit=<ISO>` | alle Einträge des Benutzers, optional nur Änderungen seit einem Zeitpunkt |
| `speichern(e)` | `PUT /api/eintraege/{pfad}` mit `{wert, geaendert}` | legt an oder überschreibt, wenn `geaendert` neuer ist als der gespeicherte Stand; Antwort 200 mit dem gültigen Eintrag, 409 mit dem neueren Serverstand |
| `loeschen(p)` | `DELETE /api/eintraege/{pfad}` | setzt die Löschmarke |
| (Massenabgleich) | `POST /api/eintraege/abgleich` mit Liste von Einträgen | ein Aufruf statt vieler PUTs, beim ersten Login und nach Offline-Phasen |
| `abonnieren(fn)` | Polling `GET /api/eintraege?seit=...` alle 30 bis 60 s und bei Fokus des Tabs | Änderungen von anderen Geräten; optional später SignalR |
| Datenschutz | `GET /api/mein-konto/export`, `DELETE /api/mein-konto` | Auskunft und Löschung (Abschnitt 7) |

Der Adapter ist klein: `fetch` mit `credentials: 'same-origin'`, Wiederholung mit Wartezeit bei Netzfehlern, Weitergabe der Antworten an den Kern.

## 5. Offline-first und Konfliktregel

- Lesen und Schreiben gehen immer zuerst auf den Cache (`sofort.*`), damit die Seiten unverändert synchron bleiben. Der Adapter gleicht im Hintergrund ab.
- Nicht übertragbare Schreibvorgänge bleiben im lokalen Speicher markiert und werden beim nächsten Start, bei `online`-Ereignis und beim Tab-Fokus nachgereicht.
- **Konfliktregel: neuester Stand gewinnt je Pfad** (Zeitstempel `geaendert`, UTC, ISO-8601). Die Regel gilt im Browser (`importieren`, `setzeAdapter`) wie auf dem Server (PUT prüft `geaendert`). Bei Gleichstand bleibt der Serverstand.
- Die Pfade sind so geschnitten, dass Konflikte selten vorkommen: Code je Aufgabe ein eigener Eintrag; gesammelte Maps wie `aufg` und `done` sind klein. Wo Mengen zusammenwachsen sollen (z. B. gelöste Aufgaben auf zwei Geräten), merged ein späterer Schritt die Maps feldweise statt den ganzen Eintrag zu ersetzen.
- Uhrzeit des Geräts kann falsch gehen: der Server verwirft Zeitstempel mehr als 5 Minuten in der Zukunft und setzt dann die Serverzeit.

## 6. Migration: lokal zu Konto

1. Erster Aufruf der neuen Version: `speicher.js` übernimmt `dhbw-inf-mb:v1` und `dhbw-inf-mb:bib-stand` einmalig in das neue Format (Zeitstempel 1970, alter Schlüssel bleibt als Sicherung). Das ist bereits umgesetzt.
2. Studierende melden sich an. Der Adapter fragt `alle()` ab und führt den Serverstand mit dem lokalen Cache zusammen (neuester gewinnt). Lokal Neueres geht per `abgleich` zum Server.
3. Dialog beim ersten Login: „Deinen bisherigen Arbeitsstand aus diesem Browser in dein Konto übernehmen?“ mit der Anzahl der Einträge. Bei Ja läuft Schritt 2, bei Nein bleibt der lokale Stand unberührt.
4. Die Export-Datei („Arbeitsstand sichern“) bleibt als Notausgang und für Geräte ohne Login erhalten.

## 7. DSGVO und Datensparsamkeit

- **Region:** West Europe (Niederlande) oder besser Germany West Central (Frankfurt) für Cosmos DB, Functions und SWA-Daten; Auftragsverarbeitungsvertrag mit Microsoft über die DHBW bzw. das Online Services DPA.
- **Pseudonyme IDs:** gespeichert wird nur `benutzerId = HMAC-SHA256(Entra-Objekt-ID, geheimer Salt)`. Der Salt liegt im Key Vault, nicht in der Datenbank. Namen, E-Mails und Matrikelnummern werden nicht gespeichert. Die Zuordnung zur Person ist ohne Salt nicht möglich; für Rückfragen kann der Dozent sie mit dem Salt reproduzieren, wenn die Studierenden das wünschen.
- **Zweckbindung:** nur Lernstand (erledigt, gelöst, Code, Quiz-Ergebnis). Kein Tracking, keine Cookies außer dem Login-Cookie von SWA.
- **Einwilligung** für die Weitergabe an das Dozenten-Dashboard als eigener, abschaltbarer Schalter (Standard aus).
- **Löschkonzept:** Auskunft und Export per `GET /api/mein-konto/export`; Löschen aller Daten per `DELETE /api/mein-konto` (hart, nicht nur Löschmarke). Automatisch: Konten ohne Zugriff nach 12 Monaten nach Semesterende löschen (Cosmos TTL auf `letzterZugriff` plus Aufräum-Function). Backups: Cosmos Continuous Backup 7 Tage.
- **Transport und Zugriff:** nur HTTPS, Zugriff der Entwickler über Entra-Rollen, keine Produktionsdaten in Testumgebungen.
- Verzeichnis der Verarbeitungstätigkeiten und Datenschutzhinweis auf der Startseite ergänzen; Abstimmung mit dem Datenschutzbeauftragten der DHBW.

## 8. Späteres Dozenten-Dashboard

- Eigene Rolle `dozent` in SWA (Entra-Gruppe). Seite `/dozent/` ist nur für diese Rolle erreichbar.
- Datenbasis: ein Cosmos-Änderungsfeed (oder eine Function mit Zeitsteuerung) verdichtet Einträge zu **Fortschrittszahlen je Lektion und Aufgabe**: Anteil gelöst, häufig abgebrochene Aufgaben, Quiz-Durchschnitt. Das Dashboard zeigt standardmäßig **aggregierte** Werte der Gruppe.
- Einzelansichten nur mit Einwilligung (Schalter aus Abschnitt 7) und pseudonym. Der Code von Studierenden wird nie ans Dashboard geliefert.
- Auswertungen für die Vorlesung: „Welche Aufgabe scheitert am häufigsten?“, „Wie viele sind bei V07 angekommen?“, ohne Personenbezug.

## 9. Grobe Kosten pro Monat (60 bis 120 Studierende)

Annahmen: ca. 200 Schreib- und 1000 Lesezugriffe je Studierendem und Monat, Daten unter 100 MB.

| Baustein | Tarif | Kosten/Monat |
|---|---|---|
| Static Web Apps | Free (reicht für Hosting, Login und verwaltete Functions bis 100 GB Traffic) oder Standard bei Bedarf an eigener Anbindung | 0 EUR (Standard: ca. 8 EUR) |
| Azure Functions (in SWA) | Verbrauch, weit unter der Freigrenze von 1 Mio. Aufrufen | 0 EUR |
| Cosmos DB Serverless | wenige Millionen Request Units, 1 GB Speicher | ca. 1 bis 3 EUR |
| Key Vault, Monitoring (Application Insights, Basis) | Mini-Nutzung | ca. 1 bis 3 EUR |
| Gesamt | | **ca. 2 bis 15 EUR** |

Vergleich: Azure SQL (Basic bzw. serverless) ab ca. 5 bis 15 EUR Grundkosten, damit Gesamt ca. 10 bis 25 EUR. Entra External ID ist bis 50 000 monatlich aktive Benutzer kostenlos (aktuelle Preise vor Entscheidung prüfen, alle Angaben gerundet und ohne Gewähr).

## 10. Umsetzungsreihenfolge

1. Speicherschicht und Migration lokal (erledigt).
2. SWA-Projekt mit Login, Functions `eintraege` (GET/PUT/DELETE) und Cosmos-Container anlegen.
3. `AzureAdapter` in `site/assets/js/speicher-azure.js`, Umschaltung nach Login über `KursSpeicher.setzeAdapter`.
4. Migrationsdialog beim ersten Login, Löschen/Export in der Kontoansicht.
5. Pilot mit einer Gruppe, Last und Kosten messen.
6. Dozenten-Dashboard.
