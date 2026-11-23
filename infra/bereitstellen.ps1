#Requires -Version 7.0
<#
.SYNOPSIS
  Stellt die Lern-App in Azure bereit (idempotent, Schritt für Schritt).

.DESCRIPTION
  Schritte (einzeln über -Schritt oder alle nacheinander):
    Pruefen         Voraussetzungen: az-Anmeldung, Abo, Node 22, SWA-CLI
    Gruppe          Ressourcengruppe anlegen (idempotent)
    Infrastruktur   infra/main.bicep ausrollen (mit -WhatIf: az deployment group what-if)
    Videos          site/assets/video/*.mp4 in den Container 'video' laden (nur neue/geänderte, per Entra-Anmeldung)
    Bauen           app/ mit VIDEO_BASIS bauen (Node 22)
    Paket           API-Paket in einem Temp-Ordner bauen (nur src, daten, host.json, package*.json und
                    Laufzeit-Abhängigkeiten) und prüfen, dass nichts Lokales darin liegt (ohne Azure)
    Ausrollen       Paket bauen, swa deploy --env production (Deployment-Token nur in einer Variablen, nie ausgegeben)
    Rauchtest       api/skripte/rauchtest.mjs gegen die veröffentlichte Adresse

  Geheimnisse: Das Skript gibt weder Schlüssel, Verbindungszeichenfolgen noch den Deployment-Token aus.
  Den Tutor-Schlüssel setzt der Besitzer selbst (siehe docs/app/BETRIEB.md).

.PARAMETER Schritt
  Alle (Standard) oder einer der oben genannten Schritte. Mehrere mit Komma: -Schritt Bauen,Ausrollen

.PARAMETER BudgetEmail
  E-Mail-Adresse für die Budgetwarnung (nur für den Schritt Infrastruktur nötig).

.PARAMETER WhatIf
  Trockenlauf: zeigt, was geschehen würde; für die Infrastruktur läuft 'az deployment group what-if'.

.EXAMPLE
  ./infra/bereitstellen.ps1 -BudgetEmail dozent@example.org -WhatIf
  ./infra/bereitstellen.ps1 -BudgetEmail dozent@example.org
  ./infra/bereitstellen.ps1 -Schritt Bauen,Ausrollen,Rauchtest
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [ValidateSet('Alle', 'Pruefen', 'Gruppe', 'Infrastruktur', 'Videos', 'Bauen', 'Paket', 'Ausrollen', 'Rauchtest')]
  [string[]] $Schritt = @('Alle'),

  [string] $BudgetEmail = $env:LERNAPP_BUDGET_EMAIL,

  [string] $Abo = '',

  [string] $Ressourcengruppe = 'rg-informatik-lernapp',

  [string] $GruppenRegion = 'westeurope',

  [ValidateSet('germanywestcentral', 'westeurope')]
  [string] $DatenRegion = 'germanywestcentral',

  [string] $DeploymentName = 'lernapp-main'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Wurzel = Split-Path -Parent $PSScriptRoot
$Reihenfolge = @('Pruefen', 'Gruppe', 'Infrastruktur', 'Videos', 'Bauen', 'Ausrollen', 'Rauchtest')
$Auswahl = if ($Schritt -contains 'Alle') { $Reihenfolge } else { @($Reihenfolge + 'Paket') | Where-Object { $Schritt -contains $_ } }
$Trocken = [bool]$WhatIfPreference
$Skript = $PSCmdlet   # für ShouldProcess in den Funktionen

# ------------------------------------------------------------------ Hilfen

function Write-Schritt([string] $Text) { Write-Host "`n=== $Text ===" -ForegroundColor Cyan }
function Write-Info([string] $Text) { Write-Host "  $Text" }
function Write-Warnung([string] $Text) { Write-Host "  WARNUNG: $Text" -ForegroundColor Yellow }

# Ruft az auf, wirft bei Fehler. Ausgabe wird zurückgegeben (nicht angezeigt).
function Invoke-AzBefehl {
  param([Parameter(Mandatory)] [string[]] $Argumente, [switch] $Still)
  $ausgabe = & az @Argumente 2>&1
  if ($LASTEXITCODE -ne 0) {
    $text = ($ausgabe | Out-String).Trim()
    throw "az $($Argumente[0..1] -join ' ') ist fehlgeschlagen: $text"
  }
  $nurText = $ausgabe | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] }
  return ($nurText -join "`n")
}

function Set-Node22Pfad {
  $node22 = Join-Path $Wurzel '.werkzeuge/node22'
  $bin = Join-Path $Wurzel '.werkzeuge/node_modules/.bin'
  if (Test-Path $node22) {
    $env:PATH = "$node22$([IO.Path]::PathSeparator)$bin$([IO.Path]::PathSeparator)$env:PATH"
  }
  $v = (& node -v) 2>$null
  if (-not $v -or -not $v.StartsWith('v22.')) { throw "Node 22 wird gebraucht (gefunden: '$v'). Siehe docs/app/WERKZEUGE.md." }
  return $v
}

# Ausgaben des Bicep-Deployments (Namen und Adressen, keine Geheimnisse).
# Im Trockenlauf ohne vorhandenes Deployment: $null (der Schritt wird dann übersprungen).
function Get-Ausgaben {
  try {
    $json = Invoke-AzBefehl @('deployment', 'group', 'show', '-g', $Ressourcengruppe, '-n', $DeploymentName, '--query', 'properties.outputs', '-o', 'json')
    $o = $json | ConvertFrom-Json
  } catch { $o = $null }
  if (-not $o) {
    if ($Trocken) { Write-Info "Trockenlauf: Deployment '$DeploymentName' existiert noch nicht, Schritt übersprungen."; return $null }
    throw "Keine Ausgaben des Deployments '$DeploymentName' gefunden. Zuerst den Schritt Infrastruktur ausführen."
  }
  return [pscustomobject]@{
    SwaName     = $o.swaName.value
    SwaHost     = $o.swaHostname.value
    VideoBasis  = $o.videoBasis.value
    StorageName = $o.storageName.value
    CosmosKonto = $o.cosmosKonto.value
  }
}

# Startdatum (JJJJ-MM-TT) des vorhandenen Budgets oder '' (noch keines). Keine Geheimnisse.
function Get-BudgetStart {
  $url = "https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/$Ressourcengruppe/providers/Microsoft.Consumption/budgets/lernapp-budget-monat?api-version=2024-08-01"
  try {
    $start = (Invoke-AzBefehl @('rest', '--method', 'get', '--url', $url, '--query', 'properties.timePeriod.startDate', '-o', 'tsv')).Trim()
  } catch { return '' }   # 404: Budget gibt es noch nicht
  if ($start -match '^(\d{4}-\d{2}-\d{2})') { return $Matches[1] }
  return ''
}

function Get-Md5Hex([string] $Pfad) {
  (Get-FileHash -Algorithm MD5 -LiteralPath $Pfad).Hash.ToLowerInvariant()
}

# ------------------------------------------------------------------ Schritte

function Invoke-Pruefen {
  Write-Schritt 'Voraussetzungen prüfen'
  if (-not (Get-Command az -ErrorAction SilentlyContinue)) { throw 'Azure CLI (az) fehlt.' }
  if ($Abo) { Invoke-AzBefehl @('account', 'set', '--subscription', $Abo) | Out-Null }
  $konto = Invoke-AzBefehl @('account', 'show', '--query', '{abo:name, id:id}', '-o', 'json') | ConvertFrom-Json
  Write-Info "Abo: $($konto.abo) ($($konto.id))"
  Write-Info "Node: $(Set-Node22Pfad)"
  if (-not (Get-Command swa -ErrorAction SilentlyContinue)) { throw 'SWA-CLI (swa) fehlt; erwartet in .werkzeuge/node_modules/.bin.' }
  Write-Info "SWA-CLI: $((& swa --version) | Select-Object -Last 1)"
  Invoke-AzBefehl @('bicep', 'version') | Out-Null
  Write-Info 'Bicep: vorhanden'
}

function Invoke-Gruppe {
  Write-Schritt "Ressourcengruppe $Ressourcengruppe"
  $existiert = (Invoke-AzBefehl @('group', 'exists', '-n', $Ressourcengruppe)).Trim() -eq 'true'
  if ($existiert) { Write-Info 'existiert bereits'; return }
  if ($Skript.ShouldProcess($Ressourcengruppe, "Ressourcengruppe in $GruppenRegion anlegen")) {
    Invoke-AzBefehl @('group', 'create', '-n', $Ressourcengruppe, '-l', $GruppenRegion, '-o', 'none') | Out-Null
    Write-Info 'angelegt'
  }
}

function Invoke-Infrastruktur {
  Write-Schritt 'Infrastruktur (Bicep)'
  if (-not $BudgetEmail) { throw 'Für die Infrastruktur wird -BudgetEmail (oder $env:LERNAPP_BUDGET_EMAIL) gebraucht.' }
  $env:LERNAPP_BUDGET_EMAIL = $BudgetEmail
  $env:LERNAPP_DATEN_REGION = $DatenRegion
  # Objekt-ID der angemeldeten Person für die Rolle "Storage Blob Data Contributor" (Upload der Videos)
  try {
    $env:LERNAPP_UPLOADER_ID = (Invoke-AzBefehl @('ad', 'signed-in-user', 'show', '--query', 'id', '-o', 'tsv')).Trim()
    Write-Info 'Rollenzuweisung für den Video-Upload: angemeldete Person'
  } catch {
    $env:LERNAPP_UPLOADER_ID = ''
    Write-Warnung 'Objekt-ID der angemeldeten Person nicht ermittelbar; Rolle für den Video-Upload bitte manuell zuweisen (BETRIEB.md).'
  }
  # Startdatum eines vorhandenen Budgets beibehalten (ein geändertes Startdatum lehnt Azure ab bzw.
  # das Budget würde bei jedem Deployment umgeschrieben); neues Budget: Erster des aktuellen Monats
  $env:LERNAPP_BUDGET_START = Get-BudgetStart
  Write-Info "Budget-Beginn: $(if ($env:LERNAPP_BUDGET_START) { $env:LERNAPP_BUDGET_START } else { 'neu, Erster des aktuellen Monats' })"
  $param = Join-Path $PSScriptRoot 'main.bicepparam'
  $gruppeDa = (Invoke-AzBefehl @('group', 'exists', '-n', $Ressourcengruppe)).Trim() -eq 'true'
  if ($Trocken) {
    if (-not $gruppeDa) { Write-Info "Trockenlauf: Ressourcengruppe fehlt noch, what-if nicht möglich. Bicep wird nur übersetzt."; Invoke-AzBefehl @('bicep', 'build', '--file', (Join-Path $PSScriptRoot 'main.bicep'), '--stdout') | Out-Null; return }
    Write-Info 'Trockenlauf: az deployment group what-if'
    & az deployment group what-if -g $Ressourcengruppe -n $DeploymentName --parameters $param --result-format FullResourcePayloads
    if ($LASTEXITCODE -ne 0) { throw 'what-if ist fehlgeschlagen.' }
    return
  }
  if ($Skript.ShouldProcess($Ressourcengruppe, 'main.bicep ausrollen')) {
    Invoke-AzBefehl @('deployment', 'group', 'create', '-g', $Ressourcengruppe, '-n', $DeploymentName, '--parameters', $param, '-o', 'none') | Out-Null
    $a = Get-Ausgaben
    Write-Info "Static Web App: $($a.SwaName) (https://$($a.SwaHost))"
    Write-Info "Video-Basis:    $($a.VideoBasis)"
    Write-Info "Cosmos-Konto:   $($a.CosmosKonto)"
    # nur die NAMEN der Einstellungen anzeigen, nie die Werte
    # (kein JMESPath mit Klammern: az.cmd reicht sie unter Windows nicht sauber durch)
    $einst = Invoke-AzBefehl @('staticwebapp', 'appsettings', 'list', '-n', $a.SwaName, '-g', $Ressourcengruppe, '--query', 'properties', '-o', 'json') | ConvertFrom-Json
    $namen = (@($einst.PSObject.Properties.Name) | Sort-Object) -join ', '
    $einst = $null
    Write-Info "App-Einstellungen (Namen): $namen"
    if ($namen -notmatch 'ANTHROPIC_API_KEY') { Write-Info 'Hinweis: ANTHROPIC_API_KEY ist noch nicht gesetzt (Tutor aus). Siehe BETRIEB.md.' }
  }
}

function Invoke-Videos {
  Write-Schritt 'Videos hochladen'
  $a = Get-Ausgaben; if (-not $a) { return }
  $ordner = Join-Path $Wurzel 'site/assets/video'
  $dateien = @(Get-ChildItem -LiteralPath $ordner -Filter '*.mp4' -File)
  Write-Info "$($dateien.Count) Videos in site/assets/video"
  foreach ($d in $dateien) {
    if ($d.Length -lt 2048 -and (Get-Content -LiteralPath $d.FullName -TotalCount 1) -like 'version https://git-lfs*') {
      throw "$($d.Name) ist nur ein Git-LFS-Zeiger. Zuerst 'git lfs pull' ausführen."
    }
  }
  # vorhandene Blobs mit unserer Prüfsumme (Metadatum md5) holen; Rollenzuweisung kann einige Minuten brauchen
  $vorhanden = $null
  $maxVersuche = if ($Trocken) { 1 } else { 10 }   # im Trockenlauf nicht minutenlang warten
  for ($versuch = 1; $versuch -le $maxVersuche -and $null -eq $vorhanden; $versuch++) {
    try {
      $json = Invoke-AzBefehl @('storage', 'blob', 'list', '--account-name', $a.StorageName, '-c', 'video', '--auth-mode', 'login', '--include', 'm', '--num-results', '*', '--query', '[].{n:name, m:metadata.md5}', '-o', 'json')
      $vorhanden = @{}
      foreach ($b in @($json | ConvertFrom-Json)) { $vorhanden[$b.n] = $b.m }
    } catch {
      if ($Trocken) { Write-Warnung "Trockenlauf: noch kein Zugriff auf den Container 'video' (Rolle fehlt oder wirkt noch nicht). Vergleich übersprungen."; return }
      if ($versuch -eq $maxVersuche) { throw "Kein Zugriff auf den Container 'video' (Rolle 'Storage Blob Data Contributor'?): $_" }
      Write-Info "Noch kein Zugriff (Rollenzuweisung wirkt nach 1 bis 8 Minuten), neuer Versuch in 30 s ($versuch/10)"
      Start-Sleep -Seconds 30
    }
  }
  $neu = 0
  foreach ($d in $dateien) {
    $md5 = Get-Md5Hex $d.FullName
    if ($vorhanden.ContainsKey($d.Name) -and $vorhanden[$d.Name] -eq $md5) { continue }
    if ($Skript.ShouldProcess($d.Name, 'hochladen')) {
      Invoke-AzBefehl @('storage', 'blob', 'upload', '--account-name', $a.StorageName, '-c', 'video', '-n', $d.Name, '-f', $d.FullName,
        '--auth-mode', 'login', '--overwrite', 'true', '--content-type', 'video/mp4',
        '--content-cache-control', 'public, max-age=604800', '--metadata', "md5=$md5", '-o', 'none') | Out-Null
      Write-Info "hochgeladen: $($d.Name) ($([math]::Round($d.Length / 1MB, 1)) MB)"
    }
    $neu++
  }
  Write-Info "$neu neu oder geändert, $($dateien.Count - $neu) unverändert"
}

function Invoke-Bauen {
  Write-Schritt 'App und API bauen'
  Set-Node22Pfad | Out-Null
  $a = Get-Ausgaben; if (-not $a) { return }
  $env:VIDEO_BASIS = $a.VideoBasis
  Write-Info "VIDEO_BASIS = $($env:VIDEO_BASIS)"
  if ($Skript.ShouldProcess('app/', 'npm ci && npm run build')) {
    Push-Location (Join-Path $Wurzel 'app')
    try {
      & npm ci --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { throw 'npm ci in app/ fehlgeschlagen.' }
      & npm run build; if ($LASTEXITCODE -ne 0) { throw 'npm run build in app/ fehlgeschlagen.' }
    } finally { Pop-Location }
    if (-not (Test-Path (Join-Path $Wurzel 'app/dist/staticwebapp.config.json'))) { throw 'app/dist/staticwebapp.config.json fehlt.' }
    if (-not (Test-Path (Join-Path $Wurzel 'api/daten/aufgaben.json'))) { throw 'api/daten/aufgaben.json fehlt (der Build hat sie nicht erzeugt; ohne sie arbeitet der Tutor ohne Aufgabentexte und ohne Musterlösungs-Abgleich).' }
    Test-DistGroesse (Join-Path $Wurzel 'app/dist')
  }
}

# Free-Tarif von Static Web Apps: höchstens 250 MB und 15.000 Dateien je App. Wir brechen mit Abstand ab.
$DistGrenzeMB = 230
$DistGrenzeDateien = 14000
function Test-DistGroesse([string] $Ordner) {
  $dateien = @(Get-ChildItem -LiteralPath $Ordner -Recurse -File -Force)
  $bytes = ($dateien | Measure-Object -Property Length -Sum).Sum
  $mb = [math]::Round($bytes / 1MB, 1)
  $mp4 = @($dateien | Where-Object Extension -eq '.mp4').Count
  Write-Info "Größe app/dist: $mb MB in $($dateien.Count) Dateien (Grenze Free-Tarif 250 MB / 15.000 Dateien; Abbruch ab $DistGrenzeMB MB)"
  if ($mp4) { Write-Warnung "$mp4 Videos liegen in dist (VIDEO_BASIS nicht gesetzt?)." }
  if ($mb -gt $DistGrenzeMB) { throw "app/dist ist mit $mb MB zu groß (Abbruch ab $DistGrenzeMB MB)." }
  if ($dateien.Count -gt $DistGrenzeDateien) { throw "app/dist hat $($dateien.Count) Dateien (Abbruch ab $DistGrenzeDateien)." }
}

# Baut das API-Paket in einem eigenen Temp-Ordner: nur, was zur Laufzeit gebraucht wird.
# Lokale Testdaten (api/.daten), local.settings.json, tests/ und skripte/ kommen so nie in das
# Bereitstellungspaket, unabhängig davon, ob swa deploy die .funcignore beachtet.
# Gibt den Pfad zurück; der Aufrufer löscht den Ordner.
$ApiPaketInhalt = @('host.json', 'package.json', 'package-lock.json', 'src', 'daten')
$ApiPaketVerboten = @('.daten', 'local.settings.json', 'local.settings.beispiel.json', 'tests', 'skripte', '.funcignore', '.vscode')
function New-ApiPaket {
  Set-Node22Pfad | Out-Null
  $quelle = Join-Path $Wurzel 'api'
  $ziel = Join-Path ([IO.Path]::GetTempPath()) ("lernapp-api-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Path $ziel | Out-Null
  foreach ($teil in $ApiPaketInhalt) {
    $p = Join-Path $quelle $teil
    if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $ziel -Recurse }
    else { throw "api/$teil fehlt$(if ($teil -eq 'daten') { ' (App-Build erzeugt api/daten/aufgaben.json)' })." }
  }
  # lokale Dateien, die versehentlich unter src/ oder daten/ liegen könnten
  Get-ChildItem -LiteralPath $ziel -Recurse -Force -File | Where-Object { $_.Name -in @('local.settings.json', 'ablage.json', '.env') } | Remove-Item -Force
  Push-Location $ziel
  try { & npm ci --omit=dev --no-audit --no-fund --loglevel=error | Out-Host; if ($LASTEXITCODE -ne 0) { throw 'npm ci im API-Paket fehlgeschlagen.' } } finally { Pop-Location }
  Test-ApiPaket $ziel
  return $ziel
}

function Test-ApiPaket([string] $Ordner) {
  $oben = @(Get-ChildItem -LiteralPath $Ordner -Force | ForEach-Object Name)
  $falsch = @($oben | Where-Object { $_ -in $ApiPaketVerboten })
  $fremd = @($oben | Where-Object { $_ -notin ($ApiPaketInhalt + 'node_modules') })
  if ($falsch.Count -or $fremd.Count) { throw "API-Paket enthält Unerwartetes: $(($falsch + $fremd | Select-Object -Unique) -join ', ')" }
  $lokal = @(Get-ChildItem -LiteralPath $Ordner -Recurse -Force -File | Where-Object { $_.Name -in @('local.settings.json', 'ablage.json') })
  if ($lokal.Count) { throw "API-Paket enthält lokale Dateien: $($lokal.FullName -join ', ')" }
  if (-not (Test-Path (Join-Path $Ordner 'node_modules/@azure/functions'))) { throw 'API-Paket: node_modules/@azure/functions fehlt.' }
  if (-not (Test-Path (Join-Path $Ordner 'node_modules/@anthropic-ai/sdk'))) { throw 'API-Paket: node_modules/@anthropic-ai/sdk fehlt (Tutor antwortete mit 503).' }
  $aufgaben = Join-Path $Ordner 'daten/aufgaben.json'
  if (-not (Test-Path -LiteralPath $aufgaben)) { throw 'API-Paket: daten/aufgaben.json fehlt (zuerst die App bauen).' }
  $n = @((Get-Content -LiteralPath $aufgaben -Raw | ConvertFrom-Json).aufgaben).Count
  if ($n -lt 1) { throw 'API-Paket: daten/aufgaben.json enthält keine Aufgaben.' }
  Write-Info "API-Paket: @anthropic-ai/sdk vorhanden, daten/aufgaben.json mit $n Aufgaben"
}

function Invoke-Paket {
  Write-Schritt 'API-Paket bauen und prüfen'
  $p = New-ApiPaket
  try {
    $dateien = @(Get-ChildItem -LiteralPath $p -Recurse -File -Force | Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' })
    Write-Info "Inhalt ohne node_modules ($($dateien.Count) Dateien):"
    foreach ($d in $dateien) { Write-Info ('  ' + $d.FullName.Substring($p.Length + 1)) }
    Write-Info 'Paket in Ordnung (keine lokalen Daten, Tests oder Einstellungen).'
  } finally { Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue }
}

function Invoke-Ausrollen {
  Write-Schritt 'Ausrollen (swa deploy, Produktion)'
  Set-Node22Pfad | Out-Null
  $a = Get-Ausgaben; if (-not $a) { return }
  $dist = Join-Path $Wurzel 'app/dist'
  if (-not (Test-Path $dist)) { throw 'app/dist fehlt. Zuerst den Schritt Bauen ausführen.' }
  if (-not $Skript.ShouldProcess($a.SwaName, 'swa deploy app/dist --api-location <API-Paket> --env production')) { return }
  $api = New-ApiPaket
  $token = (Invoke-AzBefehl @('staticwebapp', 'secrets', 'list', '-n', $a.SwaName, '-g', $Ressourcengruppe, '--query', 'properties.apiKey', '-o', 'tsv')).Trim()
  if (-not $token) { throw 'Deployment-Token nicht erhalten.' }
  $env:SWA_CLI_DEPLOYMENT_TOKEN = $token
  try {
    # -w: staticwebapp.config.json aus dist (sonst sucht die CLI ab dem Arbeitsverzeichnis und nimmt evtl. app/staticwebapp.config.json)
    & swa deploy $dist --api-location $api --swa-config-location $dist --api-language node --api-version 22 --env production
    if ($LASTEXITCODE -ne 0) { throw 'swa deploy ist fehlgeschlagen.' }
  } finally {
    Remove-Item Env:SWA_CLI_DEPLOYMENT_TOKEN -ErrorAction SilentlyContinue
    $token = $null
    Remove-Item -LiteralPath $api -Recurse -Force -ErrorAction SilentlyContinue
  }
  Write-Info "veröffentlicht: https://$($a.SwaHost)"
}

function Invoke-Rauchtest {
  Write-Schritt 'Rauchtest'
  Set-Node22Pfad | Out-Null
  $a = Get-Ausgaben; if (-not $a) { return }
  if ($Trocken) { Write-Info "Trockenlauf: würde api/skripte/rauchtest.mjs gegen https://$($a.SwaHost) ausführen"; return }
  & node (Join-Path $Wurzel 'api/skripte/rauchtest.mjs') "https://$($a.SwaHost)" --erwarte-ablage=cosmos --versuche=6
  if ($LASTEXITCODE -ne 0) { throw 'Rauchtest fehlgeschlagen.' }
}

# ------------------------------------------------------------------ Ablauf

if ($Trocken) { Write-Host 'Trockenlauf (-WhatIf): es wird nichts angelegt, hochgeladen oder veröffentlicht.' -ForegroundColor Yellow }
foreach ($s in $Auswahl) {
  switch ($s) {
    'Pruefen'       { Invoke-Pruefen }
    'Gruppe'        { Invoke-Gruppe }
    'Infrastruktur' { Invoke-Infrastruktur }
    'Videos'        { Invoke-Videos }
    'Bauen'         { Invoke-Bauen }
    'Paket'         { Invoke-Paket }
    'Ausrollen'     { Invoke-Ausrollen }
    'Rauchtest'     { Invoke-Rauchtest }
  }
}
Write-Host "`nFertig: $($Auswahl -join ', ')" -ForegroundColor Green
