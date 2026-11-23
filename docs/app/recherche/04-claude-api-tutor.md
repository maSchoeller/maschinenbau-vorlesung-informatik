# Recherche 04: Tutor-Chat mit Claude Haiku über die Anthropic-API (Azure Function, Node)

Stand der Quellen: Abruf am 2026-11-22. Alle Aussagen sind mit einer URL belegt, sofern nicht als UNBELEGT markiert.

## 1. Modell, Preise, Kontext, Prompt-Caching

**Modell-ID:** `claude-haiku-5-5` (aktuelles Haiku; Quelle: Skill `claude-api`, Modelltabelle; Preise bestätigt unter https://platform.claude.com/docs/en/about-claude/pricing).

| Position | Preis je MTok (Prompt bis 100.000 Token) | Quelle |
|---|---|---|
| Base Input | $0,10 | https://platform.claude.com/docs/en/about-claude/pricing |
| Cache-Schreiben 5 min | $0,125 (1,25x) | dieselbe Seite |
| Cache-Schreiben 1 h | $0,20 (2x) | dieselbe Seite |
| Cache-Lesen (Treffer) | $0,01 (0,1x) | dieselbe Seite |
| Output | $0,50 | dieselbe Seite |

- Prompts über 100.000 Token kosten $0,50 / $2,50 (für dieses Projekt irrelevant).
- Kontextfenster: 1M Token laut Skill-Modelltabelle (Haiku 5.5). Max-Output: UNBELEGT (nicht auf der Pricing-Seite genannt; im Projekt mit `max_tokens` 1024 arbeiten).

**Prompt-Caching lohnt sich bei 1.500–2.500 Token System-Prompt, aber der Effekt ist in Euro klein:**
- Mindestlänge für Haiku 5.5: **512 Token** (https://platform.claude.com/docs/en/build-with-claude/prompt-caching, Abschnitt "Minimum cacheable prompt length"). Ein 1.500–2.500-Token-Prompt liegt darüber.
- `cache_control`-Syntax (https://platform.claude.com/docs/en/build-with-claude/prompt-caching):
  ```json
  "system": [{ "type": "text", "text": "<STABLER SYSTEM-PROMPT>", "cache_control": { "type": "ephemeral" } }]
  ```
- Der Cache-Block muss **vor** allen variablen Inhalten stehen (Reihenfolge tools -> system -> messages). Frage und Kontext nur in `messages`.
- Lookback: 20 Blöcke; ein Breakpoint pro Request reicht.
- Usage-Felder: `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`, `usage.input_tokens` (nur Token nach dem letzten Breakpoint). Gesamt-Input = Summe der drei.
- **Ersparnis pro Anfrage** (2.000 Token gecacht): 2.000 × (0,10 − 0,01) / 1 Mio = ca. $0,00018. Bei ~8.700 Anfragen/Monat rund $1,5/Monat. Sinnvoll, aber kein Kostentreiber.

**Wichtig – Thinking kostet Output:** Laut Skill-Modelltabelle läuft Haiku 5.5 standardmäßig mit adaptivem Thinking, Effort-Standard `medium`. Thinking-Token werden als Output abgerechnet. Deshalb im Tutor explizit setzen:
- `thinking: { type: "disabled" }` (laut https://platform.claude.com/docs/en/build-with-claude/... Fehlerseite "Thinking cannot be disabled": Haiku 5.5 akzeptiert `disabled` bei Effort `high` oder niedriger; bei `xhigh`/`max` 400)
- `output_config: { effort: "low" }` (Effort-Stufen siehe Skill; Standard für Haiku 5.5 `medium`, UNBELEGT in offizieller Doku abgerufen, nur Skill-Angabe)

## 2. Minimalbeispiel Node (Azure Function, @anthropic-ai/sdk)

Installation: `npm install @anthropic-ai/sdk` (Quelle: Skill `claude-api`, `typescript/claude-api/README.md`).
Der Client liest `ANTHROPIC_API_KEY` aus der Umgebung. In Azure als **Application Setting** der Static Web App hinterlegen, nie im Code.

```ts
// api/src/tutor.ts  (Azure Functions v4 Programmiermodell)
import Anthropic from "@anthropic-ai/sdk";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Modul-Singleton: einmal pro Instanz anlegen
// timeout in MILLISEKUNDEN (TypeScript-SDK). SWA-Limit pro API-Request: 45 s
// (https://learn.microsoft.com/azure/static-web-apps/apis-overview).
const client = new Anthropic({ maxRetries: 2, timeout: 40_000 });

const STABLE_SYSTEM = `Du bist ein Tutor für Informatik-Studierende. ...`; // 1.500–2.500 Token, unverändert

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function tutorAnswer(question: string, context: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: [{ type: "text", text: STABLE_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `<frage>${escapeXml(question)}</frage>\n<kontext>${escapeXml(context)}</kontext>`,
      },
    ],
  });

  // Vor dem Lesen des Inhalts stop_reason prüfen (refusal, max_tokens)
  if (response.stop_reason === "refusal") return "Diese Anfrage kann ich nicht beantworten.";
  if (response.stop_reason === "max_tokens") { /* Antwort abgeschnitten: Hinweis anhängen */ }

  // Usage für Kostenlog
  console.log(
    response.usage.input_tokens,
    response.usage.cache_read_input_tokens,
    response.usage.cache_creation_input_tokens,
    response.usage.output_tokens,
  );

  return response.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("");
}

app.http("tutor", {
  methods: ["POST"],
  authLevel: "anonymous", // Schutz über SWA-Auth (GitHub-Login), siehe Rolle authenticated
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as { question: string; context: string };
      const text = await tutorAnswer(body.question, body.context ?? "");
      return { status: 200, jsonBody: { text } };
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        // err.status: 400, 401, 403, 404, 413, 429, 500, 529 (https://platform.claude.com/docs/en/api/errors)
        ctx.error("Anthropic", err.status, err.message);
        if (err.status === 429) return { status: 503, jsonBody: { error: "Bitte kurz warten." } };
        if (err.status === 529 || (err.status ?? 0) >= 500)
          return { status: 503, jsonBody: { error: "Dienst kurz überlastet." } };
      }
      ctx.error(err);
      return { status: 500, jsonBody: { error: "Interner Fehler." } };
    }
  },
});
```

**Fehlerbehandlung (Belegstand):**
- Typisierte Klassen vom SDK fangen, nicht Fehlermeldungen vergleichen (https://platform.claude.com/docs/en/api/errors). Belegte Klassennamen laut Skill: `Anthropic.APIError` (Basis, mit `status`), `Anthropic.BadRequestError`, `Anthropic.AuthenticationError`, `Anthropic.RateLimitError`. Weitere Klassennamen für 5xx/Timeout: UNBELEGT im Skill, daher über `err.status` prüfen.
- SDK-Retries: standardmäßig 2 Wiederholungen bei Verbindungsfehlern, 408/409/429 und 5xx, mit Backoff und `retry-after` (https://platform.claude.com/docs/en/api/errors). 529 = `overloaded_error`.
- **429 ist nicht immer ein Rate-Limit:** Ein Monatslimit (Spend Cap) liefert 429 **ohne** `retry-after`; Wiederholen hilft dann nicht (https://platform.claude.com/docs/en/api/rate-limits, Abschnitt "Reaching your spend cap"). Ein Spend-Limit des Workspace liefert dagegen 400 (https://platform.claude.com/docs/en/api/errors). Die App sollte den Fehler dem Nutzer verständlich zeigen.
- Timeout: nicht-streamende Requests müssen unter 10 min bleiben (SDK-Vorgabe, siehe errors-Seite). Die Function selbst läuft bei SWA höchstens 45 s pro API-Request (apis-overview).

**Raw HTTP ohne SDK** (nur falls nötig; Quelle Header/Version: Beispiel auf https://platform.claude.com/docs/en/api/errors):
```ts
const r = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2026-10-21",
    "content-type": "application/json",
  },
  body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 1024, system: [...], messages: [...] }),
});
const data = await r.json(); // bei !r.ok: data.error.type, data.request_id
```
Hinweis: Im Projekt ist das SDK die Standardwahl (Skill `claude-api`, Abschnitt "Output Requirement").

**Streaming – lohnt es sich?** Nein, für diesen Anwendungsfall nicht zwingend:
- Antworten mit ~350 Output-Token sind bei Haiku in wenigen Sekunden fertig.
- Azure Static Web Apps: Managed Functions sind HTTP-only und haben 45 s Maximaldauer pro API-Request (https://learn.microsoft.com/azure/static-web-apps/apis-overview, Abschnitt "API constraints").
- HTTP-Streams gibt es für Azure Functions Node v4 (`app.setup({ enableHttpStream: true })`, `@azure/functions` ab 4.3.0, Runtime ab 4.28; https://learn.microsoft.com/azure/azure-functions/node-http-stream). Ob SWA-**Managed** Functions diese Stream-Antworten unverändert an den Browser durchreichen: **UNBELEGT** (in der Doku nicht genannt).
- Empfehlung: zunächst ohne Streaming bauen. Wenn Streaming gewünscht wird, Azure Functions mit "Bring your own Functions" (nur SWA Standard-Plan, https://learn.microsoft.com/azure/static-web-apps/apis-overview) testen. Achtung: Der Free-Plan erlaubt nur Managed Functions (Quelle: apis-overview, "Bring your own API" nur Standard-Plan).

## 3. Härten gegen Jailbreaks und Prompt-Injection (offizielle Empfehlungen)

Quellen: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks und https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak.

**Direkte Jailbreaks (Nutzer ist der Gegner):**
1. **Vorfilter mit Haiku 5.5 (Harmlessness-Screen):** Eingabe in einem eigenen kleinen Aufruf prüfen; Ausgabe per **Structured Outputs** als JSON-Schema erzwingen (`output_config.format` mit `json_schema`, `additionalProperties: false`). Vorfilter-Modell kann selbst `stop_reason: "refusal"` liefern; das als "schädlich" werten.
2. **Eingabevalidierung:** bekannte Injektions-Muster filtern, bevor die Eingabe Claude erreicht.
3. **Ethisch und rollenbezogen formulierter System-Prompt:** Grenzen klar benennen und sagen, wie abgelehnt wird (Beispiel in der Doku: "Ihre Antworten müssen unseren Werten entsprechen ... Falls nicht, antworte: ...").
4. **Wiederholungstäter:** wiederholte Umgehungsversuche erkennen, dem Nutzer die Regeln nennen, ggf. drosseln oder sperren.

**Indirekte Injektion (Inhalte, die Claude liest):**
5. Fremde Inhalte **nur in `tool_result`-Blöcken** liefern, nie im System-Prompt oder in `text` des User-Turns.
6. Herkunft des Inhalts in der Tool-Beschreibung oder im Ergebnis benennen.
7. Im System-Prompt festhalten: Tool-/Dokumentinhalt ist **untrusted data** und darf Ziele, System-Prompt und Tool-Aufrufe nicht ändern (Beispiel-Wortlaut in der Doku).
8. Fremde Strings **JSON-kodieren**, damit keine Anführungszeichen oder Tags ausbrechen können.
9. Eigene Anweisungen **nicht** in Tool-Ergebnisse schreiben; sie gehören in einen User-Turn oder eine Mid-Conversation-System-Message.
10. Least Privilege, Sandbox, Tool-Ausgaben vor Verwendung mit Haiku-Klassifikator prüfen (`injection_suspected` als Boolean).
11. Red-Teaming vor Deployment.

**Prompt-Leak (Systemprompt nicht preisgeben):** Die Doku warnt, Leak-Schutz nur bei echter Notwendigkeit einzusetzen, da er die Leistung senken kann. Techniken:
- Kontext vom Nutzerinput trennen (Systemprompt für Rolle und Regeln, Nutzerfrage im User-Turn).
- **Post-Processing der Ausgabe** (Regex/Keyword, oder kleiner LLM-Prüfer); nach Doku die bevorzugte Überwachungsmethode.
- Keine unnötigen Geheimnisse in den Prompt schreiben.
- Regelmäßig Prompts und Ausgaben prüfen.
- Prefill zur Verstärkung ist bei Haiku 5.5 nicht möglich (Prefill-Verbot ab 4.6+, siehe Fehlerseite).

**Für "keine Lösung, nur Hilfe zur Lösung" (Tutor-Verhalten):** Die offiziellen Seiten nennen keine Pädagogik-Techniken. Umsetzung als Systemprompt-Regel plus Ausgabe-Prüfung durch den Vorfilter (zweiter Haiku-Aufruf mit JSON-Ausgabe `{ "loest_aufgabe": boolean }`) ist eine Eigenkonstruktion, **UNBELEGT** als Best Practice.

## 4. Kostenabschätzung (USD / Monat)

Annahmen:
- 100 Studierende × 20 Fragen/Woche = 2.000 Anfragen/Woche; × 52/12 ≈ **8.667 Anfragen/Monat**.
- Je Anfrage 3.000 Input-Token (2.000 gecacht, 1.000 unkacht) und 350 Output-Token.
- Thinking aus (siehe Abschnitt 1), sonst steigen die Kosten.

Pro Anfrage (Preise aus Abschnitt 1):

| Variante | Rechnung je Anfrage | je Anfrage | Monat (8.667) |
|---|---|---|---|
| A: ohne Cache | 3.000 × 0,10 + 350 × 0,50 | $0,000475 | **$4,12** |
| B: mit Cache (2.000 Lesen) | 2.000 × 0,01 + 1.000 × 0,10 + 350 × 0,50 | $0,000295 | **$2,56** |
| C: Cache, jede Anfrage schreibt (Worst Case, kalter Cache) | 2.000 × 0,125 + 1.000 × 0,10 + 350 × 0,50 | $0,000525 | **$4,55** |

Nachprüfung (zweiter Haiku-Aufruf, ohne Cache):
- Vorfilter Eingabe: ca. 400 Input, 10 Output → $0,000045 je Aufruf → **$0,39/Monat**.
- Prüfung der Antwort: ca. 800 Input, 10 Output → $0,000085 je Aufruf → **$0,74/Monat**.

Gesamt:
- **Mit Cache, mit Vorfilter Eingabe:** $2,56 + $0,39 = **ca. $2,95/Monat**.
- **Mit Cache, mit beiden Prüfungen:** $2,56 + $1,13 = **ca. $3,69/Monat**.
- Worst Case (kalter Cache, beide Prüfungen): $4,55 + $1,13 = **ca. $5,70/Monat**.

Die Ziel-Obergrenze von $30/Monat wird deutlich unterschritten. Die Plattform-Kosten (Azure SWA Free, Cosmos DB Serverless) sind hier nicht enthalten (siehe andere Recherchen).

## 5. Rate-Limits Haiku 5.5 und 30 gleichzeitige Nutzer

Quelle: https://platform.claude.com/docs/en/api/rate-limits (Tabellen je Tarif).

| Tarif | RPM | ITPM (nur unkaschte Token zählen) | OTPM |
|---|---|---|---|
| Start | 4.000 | 2.000.000 | 400.000 |
| Build | 10.000 | 5.000.000 | 1.000.000 |
| Scale | 13.000 | 10.000.000 | 2.000.000 |

- Cache-Lesetoken zählen **nicht** in ITPM (Rate-Limit-Seite, Abschnitt "Cache-aware ITPM").
- Neue Organisationen können im **Evaluation-Tarif** mit niedrigeren Limits starten (Quelle: Rate-Limit-Seite). Die Zahlen dafür: UNBELEGT.
- Org mit verknüpftem Max-Plan: mindestens **Start**; ab $200 monatlichem Credit mindestens **Build** (https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers). Bei $100 (Max) also Start.

**Bedeutung für 30 gleichzeitige Nutzer:**
- Dauerlast: 30 Nutzer × etwa 1 Anfrage alle 10 s = ca. 180 RPM. Das liegt weit unter 4.000 RPM. ITPM: ca. 1.000 unkachte Token je Anfrage, also rund 18.000 Token/min. Unkritisch.
- **Das eigentliche Risiko ist die Ramp Limit** (https://platform.claude.com/docs/en/api/rate-limits, Abschnitt "Ramp limits"): Ein plötzlicher Anstieg (z. B. 30 Anfragen in wenigen Sekunden zu Beginn einer Vorlesung) kann 429 auslösen, obwohl die ITPM/OTPM-Limits nicht erreicht sind. Fehlercode `ramp_limit_exceeded` im Body; `retry-after` beachten. Die Schrittgröße ist UNBELEGT (Doku sagt nur "variiert").
- Maßnahmen: Client-seitige Warteschlange oder Semaphore (z. B. max. 5 gleichzeitige Aufrufe), Frontend zeigt "Warteschlange" bei 429/503, Backoff. Lasttest mit 30 parallelen Anfragen vor der Vorlesung.
- Spend-Cap-429 (monatlich erreicht) hat keinen `retry-after` (siehe Abschnitt 2).

## 6. API-Guthaben aus dem Claude-Max-Abo und API-Schlüssel anlegen

**Max-Guthaben ist belegt** (https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers):
- Max: **$100 USD/Monat**, Ultra: $200 USD/Monat. Team-Pool bis $500.
- Anspruch: auf claude.ai unter **Settings > Billing** die Console-Organisation verknüpfen. Nötige Rollen: Max-Abonnent (bzw. Team: Primary Owner/Owner) und in der Console **Admin** oder **Billing**. Erst nach 7 Tagen Plan-Laufzeit.
- Jeder Plan verknüpft **eine** Console-Organisation; Wechsel nur über Support.
- Abgedeckt: Claude API, Managed Agents, Agent SDK, Playground. **Nicht** abgedeckt: Claude Code, Extra Usage in den Apps, Cloud-Plattformen (Bedrock/Vertex/Foundry).
- Verfall: Ende jedes Abrechnungszyklus, kein Übertrag. Credits erscheinen unter Billing > "Promotional credits".
- Ohne weitere Guthaben stoppen die API-Anfragen bis zum nächsten Credit (Fehlertext laut Doku: "Your credit balance is too low ..."). Es wird nie automatisch vom Plan abgebucht, sofern kein Guthaben/Auto-Reload gesetzt ist.
- Kein Zugriff über Free/Pro/Enterprise.
- Hinweis: Sekundärquellen nennen teils abweichende Beträge (z. B. $200 für Max 5x). Maßgeblich ist die offizielle Seite: $100.

**API-Schlüssel anlegen:**
1. Auf https://platform.claude.com anmelden (Console), Organisation mit verknüpftem Max-Plan wählen.
2. **Workspace anlegen** (nicht den Default-Workspace nutzen): Die Doku sagt, Spend-Limits am Default-Workspace zählen eventuell nicht vollständig. Empfehlung laut Credit-Seite: eigenen Workspace je Projekt.
3. Im Workspace einen API-Key erstellen (Menü "API Keys"; Pfad laut Doku: "Get API key", https://platform.claude.com/docs/en/get-api-key, nicht abgerufen, Menüname UNBELEGT).
4. **Ausgabenlimit setzen:** Settings > Spend limits (https://platform.claude.com/settings/spend-limits). Dort das Monatslimit der Organisation und im Workspace ein Workspace-Limit setzen, z. B. $30. Ein gesetztes Limit liefert HTTP 400 mit `invalid_request_error` ("You have reached your specified API usage limits"), siehe https://platform.claude.com/docs/en/api/rate-limits, Abschnitt "Setting your own spend limit".
5. Schlüssel als Azure-Application-Setting `ANTHROPIC_API_KEY` hinterlegen. Nie im Repo.

## 7. Datenschutz

- **Training:** Laut Commercial Terms, Abschnitt B "Customer Content": "Anthropic may not train models on Customer Content from Services." (https://www.anthropic.com/legal/commercial-terms). Gilt für Inputs und Outputs der kommerziellen API.
- **Aufbewahrung:** Für API-Nutzer löscht Anthropic Inputs und Outputs nach **30 Tagen** vom Backend ("we automatically delete inputs and outputs on our backend within 30 days of receipt or generation"; https://privacy.claude.com/en/articles/7996866-how-long-do-you-retain-my-organization-s-data).
- **Ausnahmen:** Safety-markierte Chats bis zu **2 Jahre** (Klassifikator-Scores bis 7 Jahre). Feedback (Daumen, Bug-Reports) 5 Jahre. Nutzung der Files API bzw. vereinbarte Zero-Data-Retention-Verträge ändern die Frist. Quelle: dieselbe Privacy-Seite.
- Consumer-Hinweise (Claude.ai Free/Pro/Max) gelten **nicht** für die API.
- Für die Vorlesung relevant: Studierendenfragen können Personendaten enthalten. Im Systemprompt bzw. in der Oberfläche auf "keine personenbezogenen Daten eingeben" hinweisen. Das ist eine Empfehlung dieser Recherche, keine Vorgabe der Anbieter.

## Offene Unsicherheiten

- Haiku 5.5 Standard-Effort (`medium`) und die Verfügbarkeit von `thinking: disabled` bei `effort: low`: nur über den Skill belegt, nicht über die offiziellen Migrations-Seiten geprüft.
- Ramp-Limit-Schwellen für Haiku 5.5: UNBELEGT.
- Streaming über SWA-Managed-Functions: UNBELEGT.
- Max-Max-Credit-Start-Datum (Sekundärquellen: Oktober 2026) und Abweichungen: Offizielle Seite nennt $100, Start-Datum nicht geprüft.
- Die Kosten gehen von 350 Output-Token aus; lange Erklärungen oder aktiviertes Thinking erhöhen den Output-Anteil deutlich.
