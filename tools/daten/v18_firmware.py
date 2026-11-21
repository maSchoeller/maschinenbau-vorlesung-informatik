"""Erzeugt Firmware-Beispieldateien für V18 (Roboter R1 der Zelle FZ-3).

R1_fw_3.2.1.bin          Originaldatei (Pseudo-Binärdaten, 64 KiB, Seed fest)
R1_fw_3.2.1.bin.sha256   vom Hersteller veröffentlichte Prüfsumme (Format: <hex>  <dateiname>)
R1_fw_3.2.1_usb.bin      angeblich gleiche Datei vom USB-Stick eines Servicetechnikers - ein Byte verändert
"""
import hashlib
import random
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v18"

if __name__ == "__main__":
    ZIEL.mkdir(parents=True, exist_ok=True)
    rng = random.Random(18)
    daten = bytearray(b"R1-FW 3.2.1\x00" + bytes(rng.getrandbits(8) for _ in range(65536 - 12)))
    (ZIEL / "R1_fw_3.2.1.bin").write_bytes(daten)
    h = hashlib.sha256(daten).hexdigest()
    (ZIEL / "R1_fw_3.2.1.bin.sha256").write_text(f"{h}  R1_fw_3.2.1.bin\n", encoding="utf-8")
    daten[40000] ^= 0x01                     # ein einziges Bit gekippt
    (ZIEL / "R1_fw_3.2.1_usb.bin").write_bytes(daten)
    print(h)
