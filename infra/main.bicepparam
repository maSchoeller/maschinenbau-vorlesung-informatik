using './main.bicep'

// Standardwerte für die Lern-App. budgetEmail wird beim Deployment übergeben
// (bereitstellen.ps1 -BudgetEmail ...), damit keine Adresse im Repository steht.
param budgetEmail = readEnvironmentVariable('LERNAPP_BUDGET_EMAIL', '')
param swaRegion = 'westeurope'
param datenRegion = readEnvironmentVariable('LERNAPP_DATEN_REGION', 'germanywestcentral')
param praefix = 'lernapp'
param budgetBetrag = 30
// Startdatum eines vorhandenen Budgets (setzt bereitstellen.ps1); leer = Erster des aktuellen Monats
param budgetStart = readEnvironmentVariable('LERNAPP_BUDGET_START', '')
param cosmosKontoName = readEnvironmentVariable('LERNAPP_COSMOS_KONTO', '')
param videoUploaderObjectId = readEnvironmentVariable('LERNAPP_UPLOADER_ID', '')
param tutorModell = 'claude-haiku-5-5'
param tutorLimitNutzerTag = 40
param tutorLimitKursTag = 1500
param tutorPruefer = 'an'
