#Requires -Version 7.0
<#
.SYNOPSIS
  Stellt die Lern-App in Azure bereit (idempotent, Schritt für Schritt).

.DESCRIPTION
  Schritte (einzeln über -Schritt oder alle nacheinander):
    Pruefen         Voraussetzungen: az-Anmeldung, Abo, Node 22, SWA-CLI
    Gruppe          Ressourcengruppe anlegen (idempotent)
    Infrastruktur   infra/main.bicep ausrollen (mit -WhatIf: az deployment group what-if). Stellt vorher fest,
                    wo der BENUTZER_SALT liegt (Key Vault, SWA, keiner; siehe salt-fall.ps1), meldet den Fall
                    und prüft danach, dass Tresor und SWA denselben Salt haben (wie SaltPruefen)
    SaltPruefen     nur prüfen: Tresor und SWA haben denselben Salt (Ausgabe: ja/nein und Länge, nie Werte);
                    wartet bis gut 10 Minuten auf die Leserolle; bleibt der Tresor unlesbar, nur Warnung;
                    Abbruch nur bei echter Abweichung. Nicht Teil von 'Alle', weil Infrastruktur es schon tut
    Videos         site/assets/video/*.mp4 in den Container 'video' laden (nur neue/geänderte, per Entra-Anmeldung)
    Bauen           app/ mit VIDEO_BASIS bauen (Node 22)
    Paket           API-Paket in einem Temp-Ordner bauen (nur src, daten, host.json, package*.json und
                    Laufzeit-Abhängigkeiten) und prüfen, dass nichts Lokales darin liegt (ohne Azure)
    Ausrollen       Salt-Kurzprüfung (ein Lesezugriff, nur Warnung), Paket bauen, swa deploy --env production
                    (Deployment-Token nur in einer Variablen, nie ausgegeben)
    Rauchtest       api/skripte/rauchtest.mjs gegen die veröffentlichte Adresse

  Geheimnisse: Das Skript gibt weder Schlüssel, Verbindungszeichenfolgen, den Salt noch den
  Deployment-Token aus. Der Salt wird nur im Speicher verglichen (SHA-256) und, wenn der Tresor ihn
  hat, für die Dauer des Deployments über die Umgebungsvariable LERNAPP_SALT_TRESOR an den sicheren
  Bicep-Parameter saltAusTresor übergeben (nie auf einer Befehlszeile, nie im Deployment-Verlauf).
  Den Tutor-Schlüssel setzt der Besitzer selbst (siehe docs/app/BETRIEB.md).

.PARAMETER NeuenSaltErlauben
  Nur wenn sicher ist, dass es keinen alten Salt mehr gibt: erlaubt einen neuen Salt, obwohl die SWA
  oder ein (leerer) Tresor schon existiert. Beim echten Erstdeployment nicht nötig. Hilft nicht bei
  gelöschtem Tresor, gelöschtem Geheimnis oder ungeklärtem Löschstatus (dort wird immer abgebrochen)
  und wirkt nicht, solange der Tresor nicht lesbar ist.

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
  [ValidateSet('Alle', 'Pruefen', 'Gruppe', 'Infrastruktur', 'SaltPruefen', 'Videos', 'Bauen', 'Paket', 'Ausrollen', 'Rauchtest')]
  [string[]] $Schritt = @('Alle'),

  [switch] $NeuenSaltErlauben,

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
$Auswahl = if ($Schritt -contains 'Alle') { $Reihenfolge } else { @($Reihenfolge[0..2] + 'SaltPruefen' + $Reihenfolge[3..6] + 'Paket') | Where-Object { $Schritt -contains $_ } }
$Trocken = [bool]$WhatIfPreference
$Skript = $PSCmdlet   # für ShouldProcess in den Funktionen

. (Join-Path $PSScriptRoot 'salt-fall.ps1')   # Get-SaltFall, Get-SaltHash
$Praefix = 'lernapp'                          # wie in main.bicepparam
$SaltGeheimnis = 'benutzer-salt'              # wie in main.bicep
$SaltVariablen = @('LERNAPP_SALT_TRESOR', 'LERNAPP_SALT_SICHERN', 'LERNAPP_NEUER_SALT')

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
    TresorName  = if ($o.PSObject.Properties['tresorName']) { $o.tresorName.value } else { '' }   # erst ab dem Deployment mit Tresor
  }
}

# ------------------------------------------------------------------ Salt (Key Vault und SWA)
# Werte werden nur in Variablen gehalten, per SHA-256 verglichen und nie ausgegeben. Fehlertexte von az
# enthalten keine Werte (bei Erfolg geht die Ausgabe in die Variable, bei Fehler gibt es keinen Wert).

# Führt az aus, ohne zu werfen und ohne etwas anzuzeigen. Ergebnis: Ok, Text (stdout), Fehler (stderr).
function Invoke-AzLeise([string[]] $Argumente) {
  $roh = & az @Argumente 2>&1
  $ok = ($LASTEXITCODE -eq 0)
  $text = (@($roh | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] }) -join "`n")
  $fehler = (@($roh | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] } | ForEach-Object { $_.ToString() }) -join ' ').Trim()
  $roh = $null
  return [pscustomobject]@{ Ok = $ok; Text = $(if ($ok) { $text } else { '' }); Fehler = $fehler }
}

# Geheimnis 'benutzer-salt' im Tresor: Status 'vorhanden' | 'fehlt' | 'geloescht' | 'unklar' | 'unlesbar',
# Wert nur bei 'vorhanden'. 'unklar': nicht in der Liste, und gelöschte Geheimnisse waren nicht abfragbar.
function Read-TresorSalt([string] $Tresor) {
  $liste = Invoke-AzLeise @('keyvault', 'secret', 'list', '--vault-name', $Tresor, '-o', 'json')   # nur Metadaten, keine Werte
  if (-not $liste.Ok) { return [pscustomobject]@{ Status = 'unlesbar'; Wert = ''; Grund = $liste.Fehler } }
  $eintrag = @($liste.Text | ConvertFrom-Json | Where-Object { $_.name -eq $SaltGeheimnis })
  if ($eintrag.Count -eq 0) {
    $geloescht = Invoke-AzLeise @('keyvault', 'secret', 'list-deleted', '--vault-name', $Tresor, '-o', 'json')   # nur Metadaten
    if (-not $geloescht.Ok) {
      return [pscustomobject]@{ Status = 'unklar'; Wert = ''; Grund = "gelöschte Geheimnisse nicht abfragbar: $($geloescht.Fehler)" }
    }
    if (@($geloescht.Text | ConvertFrom-Json | Where-Object { $_.name -eq $SaltGeheimnis }).Count -gt 0) {
      return [pscustomobject]@{ Status = 'geloescht'; Wert = ''; Grund = '' }
    }
    return [pscustomobject]@{ Status = 'fehlt'; Wert = ''; Grund = '' }
  }
  $attr = $eintrag[0].PSObject.Properties['attributes']
  if ($attr -and $attr.Value -and $attr.Value.PSObject.Properties['enabled'] -and $attr.Value.enabled -eq $false) {
    return [pscustomobject]@{ Status = 'unlesbar'; Wert = ''; Grund = "Geheimnis '$SaltGeheimnis' ist deaktiviert (az keyvault secret set-attributes --vault-name $Tresor -n $SaltGeheimnis --enabled true, Rolle 'Key Vault Secrets Officer')" }
  }
  $wert = Invoke-AzLeise @('keyvault', 'secret', 'show', '--vault-name', $Tresor, '-n', $SaltGeheimnis, '--query', 'value', '-o', 'tsv')
  if (-not $wert.Ok -or [string]::IsNullOrEmpty($wert.Text.Trim())) {
    return [pscustomobject]@{ Status = 'unlesbar'; Wert = ''; Grund = $(if ($wert.Ok) { 'Geheimnis ist leer' } else { $wert.Fehler }) }
  }
  return [pscustomobject]@{ Status = 'vorhanden'; Wert = $wert.Text.Trim(); Grund = '' }
}

# BENUTZER_SALT der SWA ('' wenn nicht gesetzt). Wirft, wenn die Einstellungen nicht lesbar sind.
function Read-SwaSalt([string] $Swa) {
  $r = Invoke-AzLeise @('staticwebapp', 'appsettings', 'list', '-n', $Swa, '-g', $Ressourcengruppe, '--query', 'properties.BENUTZER_SALT', '-o', 'tsv')
  if (-not $r.Ok) { throw "Einstellungen der SWA '$Swa' nicht lesbar: $($r.Fehler)" }
  return $r.Text.Trim()
}

# Lage vor dem Deployment: Zustände, Gleichheit (Hash), Längen; den Tresorwert nur, wenn vorhanden.
function Get-SaltLage {
  $gruppeDa = (Invoke-AzBefehl @('group', 'exists', '-n', $Ressourcengruppe)).Trim() -eq 'true'
  $aktiv = @()
  $swaName = ''
  if ($gruppeDa) {
    $aktiv = @((Invoke-AzBefehl @('keyvault', 'list', '-g', $Ressourcengruppe, '-o', 'json')) | ConvertFrom-Json | Where-Object { $_.name -like "$Praefix-kv-*" })
    $swas = @((Invoke-AzBefehl @('staticwebapp', 'list', '-g', $Ressourcengruppe, '-o', 'json')) | ConvertFrom-Json | Where-Object { $_.name -like "$Praefix-swa-*" })
    if ($swas.Count -gt 1) { throw "Mehr als eine Static Web App '$Praefix-swa-*' in $Ressourcengruppe; Salt-Abgleich nicht eindeutig." }
    if ($swas.Count -eq 1) { $swaName = $swas[0].name }
  }
  if ($aktiv.Count -gt 1) { throw "Mehr als ein Tresor '$Praefix-kv-*' in $Ressourcengruppe; Salt-Abgleich nicht eindeutig." }
  # gelöschte Tresore dieser Ressourcengruppe (Soft-Delete, abonnementweit gelistet)
  $geloescht = @((Invoke-AzBefehl @('keyvault', 'list-deleted', '--resource-type', 'vault', '-o', 'json')) | ConvertFrom-Json | Where-Object {
      $_.name -like "$Praefix-kv-*" -and (-not $_.PSObject.Properties['properties'] -or -not $_.properties.PSObject.Properties['vaultId'] -or
        "$($_.properties.vaultId)" -match "/resourceGroups/$([regex]::Escape($Ressourcengruppe))/")
    })

  $lage = [ordered]@{ Tresor = 'fehlt'; TresorName = '<neu>'; Geheimnis = 'unbekannt'; Swa = 'fehlt'; SwaName = $swaName; Gleich = $false; TresorWert = ''; TresorLaenge = 0; SwaLaenge = 0 }
  if ($aktiv.Count -eq 1) {
    $lage.Tresor = 'aktiv'; $lage.TresorName = $aktiv[0].name
    $t = Read-TresorSalt $aktiv[0].name
    $lage.Geheimnis = $t.Status
    if ($t.Status -eq 'unlesbar') { Write-Info "Tresor nicht lesbar: $($t.Grund)" }
    if ($t.Status -eq 'unklar') { Write-Info "Geheimnis nicht gefunden, Löschstatus unklar: $($t.Grund)" }
    $lage.TresorWert = $t.Wert; $lage.TresorLaenge = $t.Wert.Length
    $t = $null
  } elseif ($geloescht.Count -ge 1) {
    $lage.Tresor = 'geloescht'; $lage.TresorName = $geloescht[0].name
  }
  if ($swaName) {
    $s = Read-SwaSalt $swaName
    $lage.Swa = if ($s) { 'mitSalt' } else { 'ohneSalt' }
    $lage.SwaLaenge = $s.Length
    $lage.Gleich = [bool]$s -and [bool]$lage.TresorWert -and ((Get-SaltHash $s) -eq (Get-SaltHash $lage.TresorWert))
    $s = $null
  }
  return [pscustomobject]$lage
}

# Nicht über Remove-Item: das würde im Trockenlauf (-WhatIf) nur angekündigt, die Variable bliebe in der Sitzung.
# [NullString]::Value statt $null: PowerShell machte aus $null einen Leerstring, die Variable bliebe (leer) bestehen.
function Remove-SaltVariablen { foreach ($v in $SaltVariablen) { [Environment]::SetEnvironmentVariable($v, [NullString]::Value, 'Process') } }

# Nach dem Deployment: haben Tresor und SWA denselben Salt? Ausgabe nur ja/nein und Längen.
function Invoke-SaltPruefen {
  Write-Schritt 'Salt prüfen (Key Vault und Static Web App)'
  $a = Get-Ausgaben; if (-not $a) { return }
  if (-not $a.TresorName) {
    if ($Trocken) { Write-Info 'Trockenlauf: Das letzte Deployment hat noch keinen Tresor; Prüfung erst nach dem Schritt Infrastruktur möglich.'; return }
    throw "Das Deployment '$DeploymentName' hat keine Ausgabe tresorName. Zuerst den Schritt Infrastruktur ausführen."
  }
  # bis gut 10 Minuten warten (Rollenzuweisungen wirken nach 1 bis 8 Minuten); im Trockenlauf ein Versuch
  $max = if ($Trocken) { 1 } else { 21 }
  for ($versuch = 1; ; $versuch++) {
    $t = Read-TresorSalt $a.TresorName
    if ($t.Status -ne 'unlesbar' -or $versuch -ge $max) { break }
    Write-Info "Tresor noch nicht lesbar (Rollenzuweisung wirkt nach 1 bis 8 Minuten), neuer Versuch in 30 s ($versuch/$max)"
    Start-Sleep -Seconds 30
  }
  $s = Read-SwaSalt $a.SwaName
  $gleich = [bool]$t.Wert -and [bool]$s -and ((Get-SaltHash $t.Wert) -eq (Get-SaltHash $s))
  $status = $t.Status; $grund = $t.Grund
  $tText = if ($status -eq 'vorhanden') { "vorhanden ($($t.Wert.Length) Zeichen)" } else { $status }
  $sText = if ($s) { "vorhanden ($($s.Length) Zeichen)" } else { 'fehlt' }
  $swaHat = [bool]$s
  $t = $null; $s = $null
  Write-Info "Tresor $($a.TresorName): $tText"
  Write-Info "SWA $($a.SwaName): $sText"
  if ($status -eq 'unlesbar') {
    # Kein Vergleich möglich: das ist keine Abweichung, also kein Abbruch (sonst fiele bei 'Alle' das Ausrollen weg)
    Write-Info 'Gleicher Salt: nicht prüfbar (Tresor nicht lesbar)'
    Write-Warnung "Tresor nicht lesbar: $grund. Rolle 'Key Vault Secrets User' wirkt evtl. noch nicht (bei Anmeldung als Dienstprinzipal gibt es keine). In einigen Minuten: ./infra/bereitstellen.ps1 -Schritt SaltPruefen$(if (-not $swaHat) { '; die SWA hat KEINEN Salt: dann -Schritt Infrastruktur (holt ihn aus dem Tresor zurück)' })."
    return
  }
  Write-Info "Gleicher Salt: $(if ($gleich) { 'ja' } else { 'NEIN' })"
  if (-not $gleich) {
    $text = if ($status -ne 'vorhanden') {
      "Der Tresor hat keinen lesbaren Salt (Status '$status'). ./infra/bereitstellen.ps1 -Schritt Infrastruktur -BudgetEmail <adresse> zeigt den Fall und was zu tun ist; siehe BETRIEB.md, Abschnitt 5."
    } else {
      'Tresor und SWA haben nicht denselben Salt. ./infra/bereitstellen.ps1 -Schritt Infrastruktur -BudgetEmail <adresse> stellt ihn her (der Tresor gewinnt); siehe BETRIEB.md, Abschnitt 5.'
    }
    if ($Trocken) { Write-Warnung $text } else { throw $text }
  }
}

# Kurzprüfung vor dem Ausrollen: ein Lesezugriff, kein Warten, nie Abbruch. Fällt eine überschriebene
# SWA-Einstellung so früher auf als erst beim nächsten Schritt Infrastruktur.
function Test-SaltKurz($Ausgaben) {
  if (-not $Ausgaben.TresorName) { return }
  try {
    $t = Read-TresorSalt $Ausgaben.TresorName
    if ($t.Status -ne 'vorhanden') { $t = $null; Write-Info "Salt-Kurzprüfung: Tresor '$($Ausgaben.TresorName)' nicht lesbar oder ohne Salt; ausführlich: -Schritt SaltPruefen"; return }
    $s = Read-SwaSalt $Ausgaben.SwaName
    $gleich = [bool]$s -and ((Get-SaltHash $t.Wert) -eq (Get-SaltHash $s))
    $t = $null; $s = $null
    if ($gleich) { Write-Info 'Salt-Kurzprüfung: Tresor und SWA gleich' }
    else { Write-Warnung 'Salt-Kurzprüfung: Tresor und SWA haben NICHT denselben Salt (oder die SWA hat keinen). ./infra/bereitstellen.ps1 -Schritt Infrastruktur -BudgetEmail <adresse> stellt ihn her; siehe BETRIEB.md, Abschnitt 5.' }
  } catch { Write-Info "Salt-Kurzprüfung nicht möglich: $($_.Exception.Message)" }
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
    Write-Warnung 'Objekt-ID der angemeldeten Person nicht ermittelbar (z. B. Anmeldung als Dienstprinzipal). Das Deployment vergibt dann weder die Rolle für den Video-Upload noch die Leserolle für den Tresor: Der Salt-Abgleich meldet "Tresor nicht lesbar" (Fall erhalten, keine Salt-Änderung). Besser als Person anmelden (az login); siehe BETRIEB.md, Abschnitt 5.'
  }
  # Startdatum eines vorhandenen Budgets beibehalten (ein geändertes Startdatum lehnt Azure ab bzw.
  # das Budget würde bei jedem Deployment umgeschrieben); neues Budget: Erster des aktuellen Monats
  $env:LERNAPP_BUDGET_START = Get-BudgetStart
  Write-Info "Budget-Beginn: $(if ($env:LERNAPP_BUDGET_START) { $env:LERNAPP_BUDGET_START } else { 'neu, Erster des aktuellen Monats' })"
  $param = Join-Path $PSScriptRoot 'main.bicepparam'
  $gruppeDa = (Invoke-AzBefehl @('group', 'exists', '-n', $Ressourcengruppe)).Trim() -eq 'true'

  # Salt: Fall feststellen (nur Vorhandensein und Gleichheit, nie Werte ausgeben)
  Remove-SaltVariablen
  $lage = Get-SaltLage
  try {
    $fall = Get-SaltFall -Tresor $lage.Tresor -Geheimnis $lage.Geheimnis -Swa $lage.Swa -Gleich $lage.Gleich `
      -NeuenSaltErlauben $NeuenSaltErlauben.IsPresent -TresorName $lage.TresorName -Ressourcengruppe $Ressourcengruppe
    Write-Info ("Salt: Tresor {0} ({1}, Geheimnis {2}, {3} Zeichen), SWA {4} ({5} Zeichen), gleich: {6}" -f `
        $lage.TresorName, $lage.Tresor, $lage.Geheimnis, $lage.TresorLaenge, $(if ($lage.SwaName) { $lage.SwaName } else { '<neu>' }), $lage.SwaLaenge, $(if ($lage.Gleich) { 'ja' } else { 'nein' }))
    Write-Info "Salt-Fall '$($fall.Fall)': $($fall.Meldung)"
    if ($fall.Warnung) { Write-Warnung $fall.Warnung }
    if ($fall.Abbruch) { throw "Abbruch zum Schutz des Salts ($($fall.Fall)): $($fall.Meldung)" }
    if ($fall.TresorWertUebergeben) { $env:LERNAPP_SALT_TRESOR = $lage.TresorWert }   # nur für den az-Prozess des Deployments
    $env:LERNAPP_SALT_SICHERN = if ($fall.Sichern) { 'true' } else { 'false' }
    $env:LERNAPP_NEUER_SALT = if ($fall.NeuErlauben) { 'true' } else { 'false' }

    if ($Trocken) {
      if (-not $gruppeDa) { Write-Info "Trockenlauf: Ressourcengruppe fehlt noch, what-if nicht möglich. Bicep wird nur übersetzt."; Invoke-AzBefehl @('bicep', 'build', '--file', (Join-Path $PSScriptRoot 'main.bicep'), '--stdout') | Out-Null; return }
      Write-Info 'Trockenlauf: az deployment group what-if'
      $wi = & az deployment group what-if -g $Ressourcengruppe -n $DeploymentName --parameters $param --result-format FullResourcePayloads 2>&1
      $wiOk = ($LASTEXITCODE -eq 0)
      # Vorsorge: Sollte what-if je den Tresorwert zeigen, wird er vor der Anzeige ersetzt
      foreach ($zeile in $wi) {
        $z = "$zeile"
        if ($lage.TresorWert) { $z = $z.Replace($lage.TresorWert, '***') }
        Write-Host $z
      }
      $wi = $null
      if (-not $wiOk) { throw 'what-if ist fehlgeschlagen.' }
      Write-Info 'Hinweis: Die App-Einstellungen der SWA zeigt what-if nur als "Unsupported" (ohne Werte); ob BENUTZER_SALT bleibt, prüft erst das echte Deployment (SaltPruefen). Siehe BETRIEB.md, Abschnitt 3.'
      return
    }
    if ($Skript.ShouldProcess($Ressourcengruppe, "main.bicep ausrollen (Salt-Fall '$($fall.Fall)')")) {
      Invoke-AzBefehl @('deployment', 'group', 'create', '-g', $Ressourcengruppe, '-n', $DeploymentName, '--parameters', $param, '-o', 'none') | Out-Null
    } else { return }
  } finally {
    Remove-SaltVariablen
    $lage.TresorWert = $null
  }
  $a = Get-Ausgaben
  Write-Info "Static Web App: $($a.SwaName) (https://$($a.SwaHost))"
  Write-Info "Video-Basis:    $($a.VideoBasis)"
  Write-Info "Cosmos-Konto:   $($a.CosmosKonto)"
  Write-Info "Key Vault:      $($a.TresorName)"
  # nur die NAMEN der Einstellungen anzeigen, nie die Werte
  # (kein JMESPath mit Klammern: az.cmd reicht sie unter Windows nicht sauber durch)
  $einst = Invoke-AzBefehl @('staticwebapp', 'appsettings', 'list', '-n', $a.SwaName, '-g', $Ressourcengruppe, '--query', 'properties', '-o', 'json') | ConvertFrom-Json
  $namen = (@($einst.PSObject.Properties.Name) | Sort-Object) -join ', '
  $einst = $null
  Write-Info "App-Einstellungen (Namen): $namen"
  if ($namen -notmatch 'ANTHROPIC_API_KEY') { Write-Info 'Hinweis: ANTHROPIC_API_KEY ist noch nicht gesetzt (Tutor aus). Siehe BETRIEB.md.' }
  Invoke-SaltPruefen
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
  Test-SaltKurz $a
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
    'SaltPruefen'   { Invoke-SaltPruefen }
    'Videos'       { Invoke-Videos }
    'Bauen'         { Invoke-Bauen }
    'Paket'         { Invoke-Paket }
    'Ausrollen'     { Invoke-Ausrollen }
    'Rauchtest'     { Invoke-Rauchtest }
  }
}
Write-Host "`nFertig: $($Auswahl -join ', ')" -ForegroundColor Green
