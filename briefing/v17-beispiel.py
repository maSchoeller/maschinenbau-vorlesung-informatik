# Fertigungszelle FZ-3: Maschinendaten per HTTP abfragen und das Netz prüfen
# (V17: JSON, requests - HTTP-API abfragen; IP-Adresse und Subnetz)
# Die "API" der Zelle sind statische JSON-Dateien auf dieser Website.

import json
import ipaddress
import requests

URL = "../assets/data/v17/api/"          # relativ zur Labor-Seite

antwort = requests.get(URL + "maschinen.json")
print("HTTP-Status:", antwort.status_code)
zelle = antwort.json()                   # JSON-Text -> Dictionary

netz = ipaddress.ip_network(zelle["netz"])
print(f"Zelle {zelle['zelle']}, Netz {netz}, {netz.num_addresses - 2} nutzbare Adressen")

for m in zelle["maschinen"]:
    ip = ipaddress.ip_address(m["ip"])
    if ip in netz:
        ort = "im Netz"
    else:
        ort = "FALSCHES NETZ"
    print(f"{m['id']:4} {m['ip']:15} {m['status']:9} {ort}")

# Details der Drehmaschine abrufen
d2 = requests.get(URL + "D2.json").json()
verschleiss = d2["werkzeugverschleiss_prozent"]
for werkzeug, prozent in verschleiss.items():
    if prozent > 80:
        print(f"D2: Werkzeug {werkzeug} bei {prozent} % - wechseln")

# Meldung als JSON-Text, so wie sie per MQTT an fz3/D2/wartung gehen könnte
meldung = {"maschine": "D2", "werkzeug": "T4", "aktion": "wechseln"}
print(json.dumps(meldung))
