# Fertigungszelle FZ-3: Firmware für Roboter R1 vor dem Einspielen prüfen
# (V18: hashlib, Prüfsummen von Dateien)
# Dateien: R1_fw_3.2.1.bin, R1_fw_3.2.1.bin.sha256 (vom Hersteller), R1_fw_3.2.1_usb.bin (vom USB-Stick)

import hashlib


def sha256_datei(pfad):
    """Berechnet die SHA-256-Prüfsumme einer Datei, Stück für Stück (auch für große Dateien)."""
    h = hashlib.sha256()
    with open(pfad, "rb") as datei:              # "rb": Bytes lesen, nicht Text
        while True:
            block = datei.read(4096)
            if not block:
                break
            h.update(block)
    return h.hexdigest()


with open("R1_fw_3.2.1.bin.sha256", encoding="utf-8") as f:
    soll = f.read().split()[0]                   # erste Spalte: Prüfsumme in Hex
print("Soll (Hersteller):", soll[:16], "...")

for name in ["R1_fw_3.2.1.bin", "R1_fw_3.2.1_usb.bin"]:
    ist = sha256_datei(name)
    if ist == soll:
        print(f"{name}: OK - darf eingespielt werden")
    else:
        print(f"{name}: ABWEICHUNG - nicht einspielen! ({ist[:16]} ...)")

# Schon ein Zeichen Unterschied ändert die ganze Prüfsumme (Lawineneffekt)
print(hashlib.sha256(b"Drehzahl 1450").hexdigest()[:16])
print(hashlib.sha256(b"Drehzahl 1451").hexdigest()[:16])
