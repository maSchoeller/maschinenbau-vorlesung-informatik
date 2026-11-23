#Requires -Version 7.0
# Test der Salt-Fallunterscheidung ohne Azure und ohne Pester:  pwsh ./infra/salt-fall.test.ps1
# Jeder Fall mit nachgebildeten Zuständen; Ausgang 0 = alles bestanden.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'salt-fall.ps1')

$faelle = @(
  # Name, Eingaben, erwarteter Fall, Abbruch, Übergeben, Sichern, NeuErlauben
  @{ N = '1 bestehende Umgebung: SWA mit Salt, noch kein Tresor'; E = @{ Tresor = 'fehlt'; Geheimnis = 'unbekannt'; Swa = 'mitSalt' }; F = 'sichern'; A = $false; U = $false; S = $true; Z = $false }
  @{ N = '2 Folgedeployment: Tresor und SWA gleich'; E = @{ Tresor = 'aktiv'; Geheimnis = 'vorhanden'; Swa = 'mitSalt'; Gleich = $true }; F = 'unveraendert'; A = $false; U = $true; S = $false; Z = $false }
  @{ N = '3a SWA neu angelegt (Ressource fehlt), Tresor vorhanden'; E = @{ Tresor = 'aktiv'; Geheimnis = 'vorhanden'; Swa = 'fehlt' }; F = 'wiederherstellen'; A = $false; U = $true; S = $false; Z = $false }
  @{ N = '3b SWA-Einstellung entfernt, Tresor vorhanden'; E = @{ Tresor = 'aktiv'; Geheimnis = 'vorhanden'; Swa = 'ohneSalt' }; F = 'wiederherstellen'; A = $false; U = $true; S = $false; Z = $false }
  @{ N = '4 SWA-Einstellung überschrieben: Tresor gewinnt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'vorhanden'; Swa = 'mitSalt'; Gleich = $false }; F = 'abweichung'; A = $false; U = $true; S = $false; Z = $false }
  @{ N = '5a Tresor gelöscht, SWA mit Salt'; E = @{ Tresor = 'geloescht'; Geheimnis = 'unbekannt'; Swa = 'mitSalt' }; F = 'tresor-geloescht'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '5b Tresor gelöscht, SWA ohne Salt'; E = @{ Tresor = 'geloescht'; Geheimnis = 'unbekannt'; Swa = 'fehlt' }; F = 'tresor-geloescht'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '5c Tresor gelöscht, -NeuenSaltErlauben hilft nicht'; E = @{ Tresor = 'geloescht'; Geheimnis = 'unbekannt'; Swa = 'fehlt'; NeuenSaltErlauben = $true }; F = 'tresor-geloescht'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '6 echtes Erstdeployment'; E = @{ Tresor = 'fehlt'; Geheimnis = 'unbekannt'; Swa = 'fehlt' }; F = 'erstdeployment'; A = $false; U = $false; S = $true; Z = $true }
  @{ N = '7a Geheimnis gelöscht, SWA mit Salt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'geloescht'; Swa = 'mitSalt' }; F = 'geheimnis-geloescht'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '7b Geheimnis gelöscht, -NeuenSaltErlauben hilft nicht'; E = @{ Tresor = 'aktiv'; Geheimnis = 'geloescht'; Swa = 'ohneSalt'; NeuenSaltErlauben = $true }; F = 'geheimnis-geloescht'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '8a Tresor unlesbar, SWA mit Salt: nur erhalten'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unlesbar'; Swa = 'mitSalt' }; F = 'erhalten'; A = $false; U = $false; S = $false; Z = $false }
  # 8b/8c: kein Abbruch mehr, aber auch keine Salt-Änderung: das Deployment legt nur die Leserolle (fester Name) an
  @{ N = '8b Tresor unlesbar, SWA ohne Salt, -NeuenSaltErlauben wirkt nicht'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unlesbar'; Swa = 'ohneSalt'; NeuenSaltErlauben = $true }; F = 'erhalten'; A = $false; U = $false; S = $false; Z = $false }
  @{ N = '8c Tresor unlesbar (z. B. nach recover), SWA fehlt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unlesbar'; Swa = 'fehlt' }; F = 'erhalten'; A = $false; U = $false; S = $false; Z = $false }
  @{ N = '9a Tresor leer, SWA ohne Salt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'fehlt'; Swa = 'ohneSalt' }; F = 'kein-salt'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '9b Tresor leer, SWA ohne Salt, ausdrücklich erlaubt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'fehlt'; Swa = 'fehlt'; NeuenSaltErlauben = $true }; F = 'neu'; A = $false; U = $false; S = $true; Z = $true }
  @{ N = '9c Tresor leer, SWA mit Salt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'fehlt'; Swa = 'mitSalt' }; F = 'sichern'; A = $false; U = $false; S = $true; Z = $false }
  @{ N = '10a kein Tresor, SWA da ohne Salt'; E = @{ Tresor = 'fehlt'; Geheimnis = 'unbekannt'; Swa = 'ohneSalt' }; F = 'kein-salt'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '10b kein Tresor, SWA da ohne Salt, ausdrücklich erlaubt'; E = @{ Tresor = 'fehlt'; Geheimnis = 'unbekannt'; Swa = 'ohneSalt'; NeuenSaltErlauben = $true }; F = 'neu'; A = $false; U = $false; S = $true; Z = $true }
  # 11: Geheimnis fehlt, gelöschte Geheimnisse nicht abfragbar (list-deleted scheitert)
  @{ N = '11a Löschstatus unklar, SWA mit Salt: sichern (Key Vault verweigert PUT bei gelöschtem Namen)'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unklar'; Swa = 'mitSalt' }; F = 'sichern'; A = $false; U = $false; S = $true; Z = $false }
  @{ N = '11b Löschstatus unklar, SWA ohne Salt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unklar'; Swa = 'ohneSalt' }; F = 'geheimnis-unklar'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '11c Löschstatus unklar, -NeuenSaltErlauben hilft nicht'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unklar'; Swa = 'fehlt'; NeuenSaltErlauben = $true }; F = 'geheimnis-unklar'; A = $true; U = $false; S = $false; Z = $false }
  @{ N = '11d Löschstatus unklar, SWA ohne Salt, ausdrücklich erlaubt'; E = @{ Tresor = 'aktiv'; Geheimnis = 'unklar'; Swa = 'ohneSalt'; NeuenSaltErlauben = $true }; F = 'geheimnis-unklar'; A = $true; U = $false; S = $false; Z = $false }
)

$fehler = 0
foreach ($t in $faelle) {
  $e = $t.E
  $r = Get-SaltFall @e -TresorName 'lernapp-kv-test' -Ressourcengruppe 'rg-test'
  $ist = "$($r.Fall)|$($r.Abbruch)|$($r.TresorWertUebergeben)|$($r.Sichern)|$($r.NeuErlauben)"
  $soll = "$($t.F)|$($t.A)|$($t.U)|$($t.S)|$($t.Z)"
  # Invariante: Wer einen neuen Salt erlaubt, darf keinen Tresorwert haben und nie bei vorhandenem/gelöschtem Salt
  $invariante = -not ($r.NeuErlauben -and ($e.Swa -eq 'mitSalt' -or $e.Geheimnis -in @('vorhanden', 'geloescht', 'unlesbar', 'unklar') -or $e.Tresor -eq 'geloescht'))
  # Invariante: Geschrieben wird der Tresor nur, wenn er kein (auch kein gelöschtes) Geheimnis hat;
  # bei unklarem Löschstatus nur der vorhandene Salt der SWA (ein gelöschter Name lässt den PUT scheitern)
  $invariante = $invariante -and -not ($r.Sichern -and $e.Geheimnis -in @('vorhanden', 'geloescht', 'unlesbar'))
  $invariante = $invariante -and -not ($r.Sichern -and $e.Geheimnis -eq 'unklar' -and $e.Swa -ne 'mitSalt')
  # Invariante: Tresor nicht lesbar heißt nie Abbruch und nie Salt-Änderung (Deployment legt nur die Leserolle an)
  $invariante = $invariante -and -not ($e.Geheimnis -eq 'unlesbar' -and ($r.Abbruch -or $r.Sichern -or $r.NeuErlauben -or $r.TresorWertUebergeben))
  if ($ist -eq $soll -and $invariante) { Write-Host "ok    $($t.N) -> $($r.Fall)" }
  else { $fehler++; Write-Host "FEHLER $($t.N): ist $ist, soll $soll, Invariante $invariante" -ForegroundColor Red }
}

# Hash-Vergleich
$h1 = Get-SaltHash 'abc'; $h2 = Get-SaltHash 'abc'; $h3 = Get-SaltHash 'abd'
# Bekannter Testvektor (FIPS 180-2) für 'abc': Format Hex ohne Trennzeichen, unabhängig von der .NET-Version
$soll = 'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD'
if ($h1 -ne $soll -or $h1 -ne $h2 -or $h1 -eq $h3 -or (Get-SaltHash '') -ne '') { $fehler++; Write-Host 'FEHLER Get-SaltHash' -ForegroundColor Red } else { Write-Host 'ok    Get-SaltHash' }

Write-Host "$($faelle.Count + 1) Prüfungen, $fehler Fehler"
exit [int]($fehler -gt 0)
