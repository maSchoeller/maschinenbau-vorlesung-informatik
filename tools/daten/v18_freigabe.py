"""Erzeugt site/assets/data/v18/nc-freigabe.zip (Training V18, Aufgabe 3: NC-Programme gegen die Freigabeliste).

Ordner freigabe/ im ZIP:
  freigabe.sha256                    Freigabeliste, Zeilen "<sha256>  nc-programme/<Name>" (Stand der Freigabe)
  nc-programme/WELLE_20H6.nc         unveraendert -> OK
  nc-programme/FLANSCH_80.nc         nach der Freigabe geaendert (Vorschub F200 -> F2000) -> GEAENDERT
  nc-programme/BUCHSE_30.nc          unveraendert -> OK
  GEHAEUSE_45.nc steht in der Liste, liegt aber nicht im Ordner -> FEHLT
"""
import hashlib
import io
import zipfile
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v18"

FREIGEGEBEN = {
    "WELLE_20H6.nc": "%\nO1001 (WELLE 20 H6)\nG21 G90 G95\nT0404 M06\nG96 S180 M03\nG00 X22 Z2\nG01 X20 Z-60 F0.15\nG00 X100 Z100\nM30\n%\n",
    "FLANSCH_80.nc": "%\nO2001 (FLANSCH 80)\nG21 G90 G94\nT1 M06\nS3000 M03\nG81 X30 Y0 Z-12 R2 F200\nX15 Y25.98\nX-15 Y25.98\nG80 M30\n%\n",
    "BUCHSE_30.nc": "%\nO1002 (BUCHSE 30)\nG21 G90 G95\nT0202 M06\nG96 S200 M03\nG00 X32 Z2\nG01 X30 Z-25 F0.12\nG00 X100 Z100\nM30\n%\n",
    "GEHAEUSE_45.nc": "%\nO2002 (GEHAEUSE 45)\nG21 G90 G94\nT3 M06\nS4000 M03\nG01 X0 Y0 Z-5 F300\nG01 X45 Y0\nG01 X45 Y45\nG01 X0 Y45\nG01 X0 Y0\nM30\n%\n",
}
# Stand im Ordner: FLANSCH_80 wurde nach der Freigabe veraendert, GEHAEUSE_45 fehlt
IM_ORDNER = dict(FREIGEGEBEN)
IM_ORDNER["FLANSCH_80.nc"] = FREIGEGEBEN["FLANSCH_80.nc"].replace("F200\n", "F2000\n")
del IM_ORDNER["GEHAEUSE_45.nc"]


def dateien():
    out = {}
    for name, text in IM_ORDNER.items():
        out[f"freigabe/nc-programme/{name}"] = text
    liste = ""
    for name, text in FREIGEGEBEN.items():
        liste += f"{hashlib.sha256(text.encode('utf-8')).hexdigest()}  nc-programme/{name}\n"
    out["freigabe/freigabe.sha256"] = liste
    return out


if __name__ == "__main__":
    ZIEL.mkdir(parents=True, exist_ok=True)
    puffer = io.BytesIO()
    with zipfile.ZipFile(puffer, "w", zipfile.ZIP_DEFLATED) as z:
        for name, text in sorted(dateien().items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 20, 18, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, text.encode("utf-8"))
    (ZIEL / "nc-freigabe.zip").write_bytes(puffer.getvalue())
    print(len(dateien()), "Dateien ->", ZIEL / "nc-freigabe.zip", len(puffer.getvalue()), "Bytes")
