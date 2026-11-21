"""Baut site/assets/data/bibliothek.json und prueft dabei ALLE Codebeispiele
durch echte Ausfuehrung (python -I). Fehlermeldungen werden aus dem echten Traceback uebernommen.

Aufruf:  python tools/editor-build/bibliothek-quelle/bauen.py
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path

HIER = Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import helfer  # noqa: E402
import teil1, teil2, teil3  # noqa: E402,F401

ZIEL = HIER.parents[2] / "site" / "assets" / "data" / "bibliothek.json"
PROBLEME = []


def lauf(code, stdin=None, timeout=6):
    with tempfile.TemporaryDirectory() as d:
        try:
            r = subprocess.run([sys.executable, "-X", "utf8", "-I", "-c", code], input=stdin or "", capture_output=True,
                               text=True, timeout=timeout, cwd=d, encoding="utf-8")
        except subprocess.TimeoutExpired:
            return None, "", "Timeout"
        return r.returncode, r.stdout, r.stderr


def letzte_zeile(err):
    z = [l for l in err.strip().splitlines() if l.strip()]
    return z[-1] if z else ""



# Bezeichner, die der Editor fuer Vorschlaege/Hover nutzt ('.x' = Methode, 'mod.x' = Modul-Mitglied)
BEZ = {
    "range": ["range"], "def": ["def"], "len": ["len"], "tupel": ["tuple"], "dict": ["dict"],
    "dict-get": [".get"], "dict-items": [".items", ".keys", ".values"], "split": [".split"], "strip": [".strip"],
    "join": [".join"], "with-open": ["open", "with"], "csv-reader": ["csv", "csv.reader"],
    "try-except": ["try", "except"], "append": [".append"], "sorted": ["sorted", ".sort"],
    "eingabe-pruefen": [".isdigit"], "slicing": ["Slicing"], "sum-min-max": ["sum", "min", "max"],
    "zaehler-summe": ["+="], "liste": ["list"], "index": ["Index"], "docstring": ["help"],
    "default-werte": ["Standardwert"], "verschachtelte-if": ["Verschachtelung"], "einrueckung": ["Einrueckung"],
    "vergleiche": ["==", "!=", "<", ">", "<=", ">="], "and-or": ["and", "or"],
    "bool": ["bool", "True", "False"], "fstring": ["f-String"], "round": ["round"], "abs": ["abs"], "type": ["type"],
    "typumwandlung": ["Typumwandlung"], "import-math": ["math"], "int": ["int"], "float": ["float"],
    "str-text": ["str"], "bin-hex": ["bin", "hex"], "for-liste": ["enumerate"],
    "potenz": ["**"], "modulo": ["%"], "floordiv": ["//"], "rechenoperatoren": ["+", "-", "*", "/"],
    "rangfolge": ["Rangfolge"], "namensregeln": ["Namensregeln"], "parameter": ["Parameter"],
    "lokale-variablen": ["Lokale-Variablen"], "kommentar": ["Kommentar"], "zuweisung": ["Zuweisung"],
}

for _e in helfer.EINTRAEGE:
    if _e["id"] in BEZ:
        _e["bezeichner"] = BEZ[_e["id"]]

ids = [e["id"] for e in helfer.EINTRAEGE]
if len(ids) != len(set(ids)):
    PROBLEME.append("doppelte ids: " + str({i for i in ids if ids.count(i) > 1}))

out = []
for e in helfer.EINTRAEGE:
    if e.get("stichwort"):
        for v in e["verwandt"]:
            if v not in ids:
                PROBLEME.append(f"{e['id']}: verwandt unbekannt {v}")
        out.append(e)
        continue
    stdin = e.pop("_stdin")
    fehler_quelle = e.pop("_fehler")
    # Beispiel pruefen
    rc, so, se = lauf(e["beispiel"], stdin)
    if rc != 0:
        PROBLEME.append(f"{e['id']}: Beispiel scheitert: {letzte_zeile(se)}")
    e["beispiel_ausgabe"] = so.rstrip("\n")
    if not (2 <= len(e["transfer"]) <= 3):
        PROBLEME.append(f"{e['id']}: transfer-Anzahl {len(e['transfer'])}")
    for t in e["transfer"]:
        rc, so, se = lauf(t["code"], stdin)
        if rc != 0:
            PROBLEME.append(f"{e['id']}: transfer scheitert ({t['situation']}): {letzte_zeile(se)}")
    fehler = []
    for f in fehler_quelle:
        beschr, code = f[0], f[1]
        meldung = f[2] if len(f) > 2 else None
        ausfuehren = f[3] if len(f) > 3 else True
        if ausfuehren:
            rc, so, se = lauf(code, stdin)
            if meldung is None:
                if rc == 0:
                    PROBLEME.append(f"{e['id']}: Fehlerbeispiel wirft nichts: {beschr}")
                meldung = letzte_zeile(se)
            elif rc != 0:
                PROBLEME.append(f"{e['id']}: stiller Fehler wirft doch: {beschr}: {letzte_zeile(se)}")
        fehler.append(dict(beschreibung=beschr, code=code, meldung=meldung))
    if not fehler:
        PROBLEME.append(f"{e['id']}: keine typischen Fehler")
    e["typische_fehler"] = fehler
    for v in e["verwandt"]:
        if v not in ids:
            PROBLEME.append(f"{e['id']}: verwandt unbekannt {v}")
    out.append(e)

if PROBLEME:
    print("PROBLEME:")
    for p in PROBLEME:
        print(" -", p)
    sys.exit(1)

ZIEL.parent.mkdir(parents=True, exist_ok=True)
daten = dict(version=1, ampel={"kopf": "Im Kopf", "lesen": "Lesen & erkennen", "delegieren": "Delegieren"},
             eintraege=out)
ZIEL.write_text(json.dumps(daten, ensure_ascii=False, indent=1), encoding="utf-8")
voll = [e for e in out if not e.get("stichwort")]
print(f"OK: {len(out)} Eintraege ({len(voll)} voll, {len(out)-len(voll)} Stichwort) -> {ZIEL}")
