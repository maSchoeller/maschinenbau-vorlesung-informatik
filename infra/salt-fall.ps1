# Fallunterscheidung für den BENUTZER_SALT (ohne Azure-Aufrufe, damit sie sich testen lässt).
# Wird von bereitstellen.ps1 per Dot-Sourcing geladen; Test: infra/salt-fall.test.ps1.
#
# Quelle der Wahrheit in dieser Reihenfolge:
#   1. Geheimnis 'benutzer-salt' im Key Vault
#   2. vorhandene App-Einstellung BENUTZER_SALT der Static Web App
#   3. neuer Zufallswert – nur, wenn es nachweislich keinen alten Salt mehr gibt
#
# Grundregel: Solange irgendwo ein alter Salt existiert oder existieren könnte (Tresor gelöscht,
# Geheimnis gelöscht oder nicht prüfbar, Tresor nicht lesbar), wird kein neuer erzeugt. In den
# Tresor geschrieben wird nur der vorhandene Salt der SWA (Fall 'sichern') oder ein neuer Salt, wenn
# nachweislich keiner existiert. Ist der Tresor nicht lesbar, läuft das Deployment ohne jede
# Salt-Änderung (Fall 'erhalten'), damit es die Leserolle anlegen kann. Sonst bricht das Skript im
# Zweifel ab und sagt, was zu tun ist.
#
# Eingaben (nur Zustände, nie Werte):
#   Tresor     'fehlt' | 'aktiv' | 'geloescht' (soft-deleted)
#   Geheimnis  'fehlt' (nicht da, auch nicht gelöscht) | 'vorhanden' | 'geloescht' (soft-deleted) | 'unlesbar' |
#              'unklar' (nicht da, gelöschte Geheimnisse aber nicht abfragbar) | 'unbekannt' (Tresor nicht aktiv)
#   Swa        'fehlt' (Ressource gibt es nicht) | 'ohneSalt' | 'mitSalt'
#   Gleich     $true, wenn Tresor- und SWA-Salt übereinstimmen (Hash-Vergleich im Speicher)
#   NeuenSaltErlauben  ausdrücklicher Schalter -NeuenSaltErlauben des Skripts
#
# Ausgabe: Fall, Abbruch, und die Deployment-Parameter
#   TresorWertUebergeben  Tresorwert als saltAusTresor übergeben (Tresor gewinnt in der SWA)
#   Sichern               saltSichern: Geheimnis im Tresor anlegen (nur wenn es dort fehlt)
#   NeuErlauben           neuenSaltErlauben: Zufallswert verwenden, falls es nichts gibt

function Get-SaltFall {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)] [ValidateSet('fehlt', 'aktiv', 'geloescht')] [string] $Tresor,
    [Parameter(Mandatory)] [ValidateSet('fehlt', 'vorhanden', 'geloescht', 'unlesbar', 'unklar', 'unbekannt')] [string] $Geheimnis,
    [Parameter(Mandatory)] [ValidateSet('fehlt', 'ohneSalt', 'mitSalt')] [string] $Swa,
    [bool] $Gleich = $false,
    [bool] $NeuenSaltErlauben = $false,
    [string] $TresorName = '<tresor>',
    [string] $Ressourcengruppe = '<gruppe>'
  )

  function Neu([string] $Fall, [string] $Meldung, [bool] $Uebergeben = $false, [bool] $Sichern = $false, [bool] $NeuErlauben = $false, [string] $Warnung = '') {
    [pscustomobject]@{ Fall = $Fall; Abbruch = $false; TresorWertUebergeben = $Uebergeben; Sichern = $Sichern; NeuErlauben = $NeuErlauben; Meldung = $Meldung; Warnung = $Warnung }
  }
  function Stopp([string] $Fall, [string] $Meldung) {
    [pscustomobject]@{ Fall = $Fall; Abbruch = $true; TresorWertUebergeben = $false; Sichern = $false; NeuErlauben = $false; Meldung = $Meldung; Warnung = '' }
  }
  $swaText = switch ($Swa) { 'mitSalt' { 'Die SWA hat ihren Salt noch, es ist also nichts verloren.' } 'ohneSalt' { 'Die SWA hat keinen Salt mehr.' } default { 'Die SWA gibt es nicht.' } }

  # 1. Tresor gelöscht (soft-deleted): nie einen neuen anlegen, erst wiederherstellen
  if ($Tresor -eq 'geloescht') {
    return Stopp 'tresor-geloescht' ("Der Tresor '$TresorName' ist gelöscht (Soft-Delete, 90 Tage wiederherstellbar). $swaText " +
      "Wiederherstellen (Ressourcengruppe muss existieren): az keyvault recover -n $TresorName; danach dieses Skript erneut ausführen. " +
      'Der Tresor kommt mit dem Geheimnis zurück; die Rollenzuweisung legt das nächste Deployment neu an (BETRIEB.md, Abschnitt 5).')
  }

  if ($Tresor -eq 'aktiv') {
    switch ($Geheimnis) {
      'geloescht' {
        return Stopp 'geheimnis-geloescht' ("Das Geheimnis 'benutzer-salt' im Tresor '$TresorName' ist gelöscht (Soft-Delete). $swaText " +
          "Wiederherstellen: az keyvault secret recover --vault-name $TresorName -n benutzer-salt (Rolle 'Key Vault Secrets Officer' nötig); danach erneut ausführen.")
      }
      'unlesbar' {
        # Kein Abbruch: Ohne Tresorwert, ohne Sichern und ohne neuen Salt ändert das Deployment am Salt nichts
        # (SWA mit Salt behält ihn, SWA ohne Salt bleibt ohne). Es legt aber die Leserolle an, und zwar unter
        # dem festen Namen aus main.bicep. Eine Zuweisung von Hand (zufälliger Name) ließe das nächste
        # Deployment mit RoleAssignmentExists scheitern, deshalb wird sie hier nicht empfohlen.
        $ursache = 'Ursachen: Rolle "Key Vault Secrets User" fehlt oder wirkt noch nicht (1 bis 8 Minuten; nach "az keyvault recover" sind die Rollenzuweisungen weg), Anmeldung als Dienstprinzipal (bekommt keine Leserolle), oder das Geheimnis ist deaktiviert (dann: az keyvault secret set-attributes --vault-name ' + $TresorName + ' -n benutzer-salt --enabled true, Rolle "Key Vault Secrets Officer").'
        if ($Swa -eq 'mitSalt') {
          return Neu 'erhalten' "Tresor nicht lesbar: nichts wird gesichert oder überschrieben, die SWA behält ihren Salt. Das Deployment legt die Leserolle an. $ursache" `
            -Warnung 'Den Abgleich mit dem Tresor in einigen Minuten nachholen: ./infra/bereitstellen.ps1 -Schritt SaltPruefen (bzw. Infrastruktur erneut).'
        }
        return Neu 'erhalten' "Tresor nicht lesbar und $swaText Das Deployment ändert am Salt nichts (die SWA bleibt vorerst ohne Salt, die API antwortet mit 503), legt aber die Leserolle an. $ursache" `
          -Warnung 'SWA OHNE SALT: In einigen Minuten ./infra/bereitstellen.ps1 -Schritt Infrastruktur erneut ausführen; dann holt der Fall "wiederherstellen" den Salt aus dem Tresor zurück. Keine Rolle von Hand zuweisen (BETRIEB.md, Abschnitt 5).'
      }
      'unklar' {
        # Das Geheimnis fehlt, ob es gelöscht (soft-deleted) ist, ließ sich nicht prüfen.
        if ($Swa -eq 'mitSalt') {
          # Sicher: Ein gelöschtes Geheimnis gleichen Namens lässt Key Vault nicht überschreiben (der PUT scheitert),
          # und die SWA-Einstellungen hängen im Modul vom Geheimnis ab, werden dann also nicht geschrieben.
          return Neu 'sichern' 'Tresor ohne (sichtbares) Geheimnis, SWA mit Salt: der vorhandene Salt der SWA wird im Tresor gesichert, die SWA bleibt unverändert.' -Sichern $true `
            -Warnung ("Gelöschte Geheimnisse waren nicht abfragbar. Scheitert das Deployment mit 'deleted but recoverable', ist 'benutzer-salt' soft-deleted: nichts geht verloren; " +
              "az keyvault secret recover --vault-name $TresorName -n benutzer-salt (Rolle 'Key Vault Secrets Officer'), dann erneut ausführen.")
        }
        return Stopp 'geheimnis-unklar' ("Weder der Tresor '$TresorName' noch die SWA haben einen (sichtbaren) Salt, und ob 'benutzer-salt' gelöscht (soft-deleted) ist, ließ sich nicht prüfen. " +
          "Prüfen mit einer Rolle, die gelöschte Geheimnisse listen darf (z. B. 'Key Vault Secrets Officer'): az keyvault secret list-deleted --vault-name $TresorName --query [].name. " +
          "Ist es dort: az keyvault secret recover --vault-name $TresorName -n benutzer-salt, dann erneut ausführen. -NeuenSaltErlauben hilft hier nicht.")
      }
      'vorhanden' {
        if ($Swa -eq 'mitSalt' -and $Gleich) {
          return Neu 'unveraendert' 'Salt in Tresor und SWA gleich: nichts ändert sich.' -Uebergeben $true
        }
        if ($Swa -eq 'mitSalt') {
          return Neu 'abweichung' 'Salt der SWA weicht vom Tresor ab: der Tresor gewinnt, die SWA bekommt den Tresorwert zurück.' -Uebergeben $true `
            -Warnung 'ABWEICHUNG: Die SWA-Einstellung BENUTZER_SALT wurde überschrieben. Konten, die seitdem angelegt wurden, gehören zum falschen Salt (Werte werden nicht angezeigt).'
        }
        return Neu 'wiederherstellen' 'SWA ohne Salt (neu angelegt oder Einstellung entfernt): der Salt kommt aus dem Tresor zurück.' -Uebergeben $true
      }
      'fehlt' {
        if ($Swa -eq 'mitSalt') {
          return Neu 'sichern' 'Tresor ohne Geheimnis, SWA mit Salt: der vorhandene Salt der SWA wird im Tresor gesichert, die SWA bleibt unverändert.' -Sichern $true
        }
        if ($NeuenSaltErlauben) {
          return Neu 'neu' 'Kein Salt im Tresor und keiner in der SWA; -NeuenSaltErlauben ist gesetzt: neuer Salt, sofort im Tresor gesichert.' -Sichern $true -NeuErlauben $true `
            -Warnung 'Neuer Salt: vorhandene Daten in Cosmos passen zu keinem Konto mehr.'
        }
        return Stopp 'kein-salt' ("Weder der Tresor '$TresorName' noch die SWA haben einen Salt (auch kein gelöschtes Geheimnis), der Tresor existiert aber schon. " +
          'Wenn der alte Salt anderswo gesichert ist: zuerst in die SWA setzen (BETRIEB.md, Abschnitt 5). ' +
          'Nur wenn sicher ist, dass es keinen alten Salt mehr gibt (Daten gehen verloren): erneut mit -NeuenSaltErlauben.')
      }
      default { throw "Get-SaltFall: Geheimnis-Zustand '$Geheimnis' passt nicht zu einem aktiven Tresor." }
    }
  }

  # Tresor fehlt (weder aktiv noch gelöscht)
  if ($Swa -eq 'mitSalt') {
    return Neu 'sichern' 'Noch kein Tresor: er wird angelegt und der vorhandene Salt der SWA darin gesichert; die SWA bleibt unverändert.' -Sichern $true
  }
  if ($Swa -eq 'fehlt') {
    return Neu 'erstdeployment' 'Erstdeployment (weder Tresor noch SWA vorhanden): neuer Salt, sofort im Tresor gesichert.' -Sichern $true -NeuErlauben $true
  }
  if ($NeuenSaltErlauben) {
    return Neu 'neu' 'SWA ohne Salt und kein Tresor; -NeuenSaltErlauben ist gesetzt: neuer Salt, sofort im Tresor gesichert.' -Sichern $true -NeuErlauben $true `
      -Warnung 'Neuer Salt: vorhandene Daten in Cosmos passen zu keinem Konto mehr.'
  }
  return Stopp 'kein-salt' ('Die SWA existiert, hat aber keinen Salt, und es gibt keinen Tresor. Ein neuer Salt würde alle vorhandenen Daten verwaisen lassen. ' +
    'Wenn der alte Salt anderswo gesichert ist: zuerst in die SWA setzen (BETRIEB.md, Abschnitt 5). Nur wenn es sicher keinen mehr gibt: erneut mit -NeuenSaltErlauben.')
}

# SHA-256 als Hex, nur zum Vergleichen im Speicher (nie ausgeben).
function Get-SaltHash([string] $Wert) {
  if ([string]::IsNullOrEmpty($Wert)) { return '' }
  $sha = [System.Security.Cryptography.SHA256]::Create()
  # BitConverter statt Convert.ToHexString (erst ab .NET 5): läuft auch unter PowerShell 7.0
  try { return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Wert))).Replace('-', '') } finally { $sha.Dispose() }
}
