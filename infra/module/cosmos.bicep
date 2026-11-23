// Cosmos DB for NoSQL, Serverless, eine Region, Continuous Backup 7 Tage (ohne Speicherkosten).
// Sparsame Indexierung: nur die Felder, nach denen die API abfragt (id und _ts sind immer indiziert;
// der seit-Abgleich filtert nach _ts); 'wert' und 'code' werden nie indiziert.
// TTL: 'eintraege' hat defaultTtl -1 (nichts verfällt von selbst), Löschmarken tragen aber ein
// eigenes 'ttl' (180 Tage) und verfallen damit. Im Container 'zaehler' (8 Tage) tragen die
// Kontozähler 'ttl: -1' und bleiben.

param kontoName string
param region string
param datenbank string = 'lernapp'

resource konto 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' = {
  name: kontoName
  location: region
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableServerless' }
    ]
    locations: [
      {
        locationName: region
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    backupPolicy: {
      type: 'Continuous'
      continuousModeProperties: {
        tier: 'Continuous7Days'
      }
    }
    publicNetworkAccess: 'Enabled'    // SWA Free hat kein VNet
    disableLocalAuth: false           // Schlüssel nötig: SWA Free bietet der API keine Managed Identity
    disableKeyBasedMetadataWriteAccess: true
    minimalTlsVersion: 'Tls12'
  }
}

resource db 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-11-15' = {
  parent: konto
  name: datenbank
  properties: {
    resource: { id: datenbank }
  }
}

var behaelter = [
  {
    name: 'eintraege'
    pk: '/benutzerId'
    indiziert: [ '/geloescht/?' ]   // Nachzählen lebender Einträge
    ttl: -1
  }
  {
    name: 'benutzer'
    pk: '/id'
    indiziert: []
    ttl: -1
  }
  {
    name: 'geteilt'
    pk: '/id'
    indiziert: [ '/benutzerId/?' ]
    ttl: -1
  }
  {
    name: 'zaehler'
    pk: '/id'
    indiziert: [ '/benutzerId/?' ]
    ttl: 691200 // 8 Tage: Tageszähler verfallen von selbst
  }
]

resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-11-15' = [for c in behaelter: {
  parent: db
  name: c.name
  properties: {
    resource: {
      id: c.name
      partitionKey: {
        paths: [ c.pk ]
        kind: 'Hash'
        version: 2
      }
      defaultTtl: c.ttl
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [for p in c.indiziert: { path: p }]
        excludedPaths: [
          { path: '/*' }
        ]
      }
    }
    // kein 'options.throughput': Serverless-Container haben keinen bereitgestellten Durchsatz
  }
}]

output kontoName string = konto.name
output endpunkt string = konto.properties.documentEndpoint
