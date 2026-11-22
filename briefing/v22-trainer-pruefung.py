# Prüfskript zum Klausurtrainer (site/klausurtrainer.html)
# Liest die Aufgaben aus der HTML-Datei und prüft:
#  - Struktur (24 Aufgaben, V01 bis V20 abgedeckt, Typenverteilung, Punkteschema = Punktzahl)
#  - Code-Aufgaben: Musterlösung besteht alle Tests (Prelude wie in aufgaben.js), leeres und
#    festverdrahtetes Programm sowie typische Fehlerfassungen bestehen NICHT
#  - PAP-Aufgaben: der Plan (JSON) ergibt ein Programm, das dieselben Tests besteht
#  - Ausgabe-Aufgaben: die hinterlegte Ausgabe stimmt mit der echten Ausgabe des Codes überein
#  - Rechenaufgaben und Code-Beispiele in den Lösungen (Zahlensysteme, Netz, Hash, Cpk, Hubhöhe ...)
# Aufruf: python briefing/v22-trainer-pruefung.py  -> "Alle Prüfungen bestanden"

import ast
import contextlib
import hashlib
import html
import io
import ipaddress
import json
import math
import re
import subprocess
import sys
import tempfile
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

WURZEL = Path(__file__).resolve().parent.parent
HTML = WURZEL / "site" / "klausurtrainer.html"
AUFGABEN_JS = WURZEL / "site" / "assets" / "js" / "aufgaben.js"
DATEIEN = [HTML, WURZEL / "site" / "assets" / "js" / "klausurtrainer.js",
           WURZEL / "site" / "assets" / "css" / "klausurtrainer.css"]

fehler = []


def pruefe(bedingung, text):
    if not bedingung:
        fehler.append(text)
        print("FEHLER:", text)


# ---------------------------------------------------------------- Prelude aus aufgaben.js
js = AUFGABEN_JS.read_text(encoding="utf-8")
m = re.search(r"/\*PY-BEGIN\*/\s*var PY_PRELUDE = String\.raw`(.*?)`;\s*/\*PY-END\*/", js, re.S)
assert m, "PY_PRELUDE in aufgaben.js nicht gefunden"
PRELUDE = m.group(1)


def jq(v):
    return json.dumps(v, ensure_ascii=False)


def lauf_tests(src, tests, mode="programm", timeout=20):
    """Führt die Aufgabenprüfung wie aufgaben.js aus. Liefert (fatal, [ok-Liste mit (titel, ok, meldung)])."""
    prog = PRELUDE + "\n_main(" + ", ".join(jq(x) for x in ["test", src, [], tests, mode]) + ")\n"
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(prog)
        pfad = f.name
    try:
        r = subprocess.run([sys.executable, "-I", "-X", "utf8", pfad], capture_output=True, text=True, encoding="utf-8", timeout=timeout)
    finally:
        Path(pfad).unlink(missing_ok=True)
    fatal = None
    erg = []
    for zeile in r.stdout.split("\n"):
        if zeile.startswith("\x1e"):
            o = json.loads(zeile[1:])
            if "fatal" in o:
                fatal = o["fatal"]
            elif "done" in o:
                pass
            else:
                erg.append((o["t"], o["ok"], o.get("m", "")))
    if not erg and fatal is None:
        fatal = "keine Ergebnisse. stderr: " + r.stderr[-400:]
    return fatal, erg


def alle_ok(src, tests, mode):
    fatal, erg = lauf_tests(src, tests, mode)
    return fatal is None and len(erg) > 0 and all(e[1] for e in erg), fatal, erg


def etwas_faellt_durch(src, tests, mode):
    fatal, erg = lauf_tests(src, tests, mode)
    return fatal is not None or any(not e[1] for e in erg)


# ---------------------------------------------------------------- HTML lesen
text = HTML.read_text(encoding="utf-8")
artikel = re.findall(r'<article class="kt-task" id="(k-\d+)"([^>]*)>(.*?)</article>', text, re.S)
pruefe(len(artikel) == 24, "Es müssen 24 Aufgaben sein, gefunden: %d" % len(artikel))


def attr(s, name):
    mm = re.search(r'\b' + re.escape(name) + r'="([^"]*)"', s)
    return mm.group(1) if mm else None


def skripte(inhalt):
    d = {}
    for a, c in re.findall(r"<script([^>]*)>(.*?)</script>", inhalt, re.S):
        rolle = attr(a, "data-role")
        d.setdefault(rolle, []).append((a, c))
    return d


def roh(c):
    return re.sub(r"\s+$", "", c.lstrip("\n"))


aufgaben = {}
for aid, a, inhalt in artikel:
    typ = attr(a, "data-typ")
    sk = skripte(inhalt)
    aufgaben[aid] = {
        "id": aid, "lektion": attr(a, "data-lektion"), "typ": typ,
        "punkte": int(attr(a, "data-punkte")), "min": int(attr(a, "data-minuten")),
        "inhalt": inhalt, "sk": sk,
        "mode": attr(re.search(r'<div class="a-task[^"]*"[^>]*>', inhalt).group(0), "data-mode"),
    }
    pruefe(re.search(r'<h2 id="h-' + aid + '"', inhalt) is not None, aid + ": Überschrift h2 mit id h-" + aid + " fehlt")
    pruefe(re.search(r'data-id="' + aid + '"', inhalt) is not None, aid + ": data-id der Aufgabe fehlt oder falsch")
    pruefe(aufgaben[aid]["min"] > 0, aid + ": Richtzeit fehlt")

ids = sorted(aufgaben)
pruefe(ids == ["k-%02d" % i for i in range(1, 25)], "IDs müssen k-01 bis k-24 sein: %r" % ids)

# Abdeckung und Typen
lektionen = {aufgaben[i]["lektion"] for i in aufgaben}
for n in range(1, 21):
    pruefe("V%02d" % n in lektionen, "Lektion V%02d hat keine Aufgabe" % n)
pruefe(lektionen <= {"V%02d" % n for n in range(1, 21)}, "Unbekannte Lektion: %r" % lektionen)
typen = {}
for i in aufgaben:
    typen.setdefault(aufgaben[i]["typ"], []).append(i)
code_aufgaben = typen.get("code", []) + typen.get("pap-code", [])
pruefe(len(code_aufgaben) >= 12, "Mindestens 12 Code-schreiben-Aufgaben nötig, vorhanden: %d" % len(code_aufgaben))
pruefe(len(typen.get("pap-code", [])) == 2, "Genau 2 Aufgaben PAP -> Code erwartet")
pruefe(1 <= len(typen.get("pap-zeichnen", [])) <= 2, "1 bis 2 Aufgaben Code -> PAP erwartet")
pruefe(4 <= len(typen.get("ausgabe", [])) <= 5, "4 bis 5 Ausgabe-Aufgaben erwartet")
pruefe(len(typen.get("fehler", [])) == 3, "3 Fehler-finden-Aufgaben erwartet")
pruefe(3 <= len(typen.get("theorie", [])) <= 4, "3 bis 4 Theorie-Aufgaben erwartet")
pruefe(set(typen) <= {"code", "pap-code", "pap-zeichnen", "ausgabe", "fehler", "theorie"}, "Unbekannter Typ: %r" % set(typen))

# ---------------------------------------------------------------- Punkteschema
for aid, t in aufgaben.items():
    if t["typ"] == "pap-zeichnen":
        continue
    sc = t["sk"].get("scheme")
    pruefe(sc is not None and len(sc) == 1, aid + ": Punkteschema (data-role=scheme) fehlt")
    if not sc:
        continue
    schema = json.loads(sc[0][1])
    summe = sum(x["p"] for x in schema)
    pruefe(summe == t["punkte"], "%s: Punkteschema ergibt %d, data-punkte ist %d" % (aid, summe, t["punkte"]))
    pruefe(all(x["p"] >= 1 and x["t"].strip() for x in schema), aid + ": Schemaeintrag ohne Punkte oder Text")
    t["schema"] = schema

# pap-zeichnen hat 8 Punkte über die Tests
for aid in typen.get("pap-zeichnen", []):
    pruefe(aufgaben[aid]["punkte"] > 0, aid + ": Punkte fehlen")

# ---------------------------------------------------------------- Code-Aufgaben
leer = ["", "pass\n", "x = 1\n"]
MUTANTEN = {
    "k-03": ['print("Fläche: 314.16 mm²")\nprint("Spannung: 159.15 MPa")\n',
             'import math\nF = float(input())\nd = float(input())\nA = math.pi * d ** 2 / 4\nprint(f"Fläche: {A:.2f} mm²")\nprint(f"Spannung: {F / A:.2f} MPa")\n'],
    "k-05": ['print("im Bereich")\nprint(125.7)\n',
             'import math\nd = float(input())\nn = float(input())\nvc = math.pi * d * n\nif vc > 250:\n    print("zu hoch")\nelif vc < 80:\n    print("zu niedrig")\nelse:\n    print("im Bereich")\nprint(round(vc, 1))\n',
             'import math\nd = float(input())\nn = float(input())\nvc = math.pi * d * n / 1000\nif vc > 250:\n    print("zu hoch")\nif vc < 80:\n    print("zu niedrig")\nelse:\n    print("im Bereich")\nprint(round(vc, 1))\n'],
    "k-07": ['print("Werkstücke: 27")\nprint("Rest in l: 9.5")\n',
             'v = float(input())\nstueck = 0\nwhile v > 10:\n    v = v - 1.5\n    stueck = stueck + 1\nprint("Werkstücke:", stueck)\nprint("Rest in l:", v)\n'],
    "k-09": ['def querschnitt(d_aussen, d_innen=0):\n    return 314.1593\ndef masse(*a, **k):\n    return 2.466\n',
             'import math\ndef querschnitt(d_aussen, d_innen=0):\n    return math.pi / 4 * (d_aussen ** 2 - d_innen ** 2)\ndef masse(d_aussen, laenge, d_innen=0, dichte=7.85):\n    return querschnitt(d_aussen, d_innen) * laenge * dichte / 1000\n',
             'import math\ndef querschnitt(d_aussen, d_innen=0):\n    print(math.pi / 4 * (d_aussen ** 2 - d_innen ** 2))\n'],
    "k-11": ['print("Spannweite: 0.50 mm")\nprint("Größter Wert an Position 4")\nprint("Über dem Mittelwert: 2 von 5")\n',
             'n = int(input())\nw = []\nfor i in range(n):\n    w.append(float(input()))\nprint(f"Spannweite: {max(w) - min(w):.2f} mm")\nprint(f"Größter Wert an Position {w.index(max(w))}")\nm = sum(w) / n\nu = 0\nfor x in w:\n    if x > m:\n        u = u + 1\nprint(f"Über dem Mittelwert: {u} von {n}")\n'],
    "k-12": ['print("Zeile 2 ungültig")\nprint("Zeile 4 ungültig")\nprint("Gültig: 2 von 4")\nprint("Mittelwert: 22.0 °C")\n',
             'n = int(input())\ns = 0\ng = 0\nfor k in range(1, n + 1):\n    zeile = input()\n    try:\n        a, b = zeile.split(";")\n        s = s + float(b)\n        g = g + 1\n    except ValueError:\n        print(f"Zeile {k} ungültig")\nprint(f"Gültig: {g} von {n}")\nprint(f"Mittelwert: {s / g:.1f} °C")\n'],
    "k-13": ['def bereinige(namen):\n    return ["WELLE_20H6", "FLANSCH"]\n',
             'def bereinige(namen):\n    return [n.strip().upper().replace(" ", "_") for n in namen]\n'],
    "k-15": ['def abweichung_ok(soll, ist, tol_prozent):\n    return True\n',
             'def abweichung_ok(soll, ist, tol_prozent):\n    return abs(ist - soll) < soll * tol_prozent / 100\n',
             'def abweichung_ok(soll, ist, tol_prozent):\n    return ist - soll <= soll * tol_prozent / 100\n'],
    "k-16": ['def ausschuss_anteil(werte, u, o):\n    return 33.3333333\n',
             'import numpy as np\ndef ausschuss_anteil(werte, u, o):\n    return np.mean((werte <= u) | (werte >= o)) * 100\n'],
    "k-19": ['def zaehle_endungen(pfade):\n    return {"step": 2, "pdf": 1}\n',
             'from pathlib import Path\ndef zaehle_endungen(pfade):\n    d = {}\n    for p in pfade:\n        e = Path(p).suffix[1:]\n        d[e] = d.get(e, 0) + 1\n    return d\n'],
    "k-22": ['def verschlissene_werkzeuge(db, maschine, grenze):\n    return [(3, 480), (2, 455), (5, 400)]\n',
             'def verschlissene_werkzeuge(db, maschine, grenze):\n    cur = db.cursor()\n    cur.execute(f"SELECT id, standzeit_min FROM werkzeuge WHERE maschine = \'{maschine}\' AND standzeit_min >= {grenze} ORDER BY standzeit_min DESC")\n    return cur.fetchall()\n'],
    "k-24": ['class Welle:\n    def __init__(self, d, laenge, dichte=7.85):\n        self.d = d\n        self.laenge = laenge\n        self.dichte = dichte\n    def masse(self):\n        return 2.466\n    def schlankheit(self):\n        return 50.0\n    def kuerzen(self, mm):\n        return True\n',
             'import math\nclass Welle:\n    def __init__(self, d, laenge, dichte=7.85):\n        self.d = d\n        self.laenge = laenge\n        self.dichte = dichte\n    def masse(self):\n        return math.pi / 4 * self.d ** 2 * self.laenge * self.dichte / 1e6\n    def schlankheit(self):\n        return self.laenge / self.d\n    def kuerzen(self, mm):\n        if mm <= self.laenge:\n            self.laenge = self.laenge - mm\n            return True\n        return False\n'],
}

for aid in code_aufgaben:
    t = aufgaben[aid]
    sk = t["sk"]
    pruefe("tests" in sk and "solution" in sk, aid + ": Tests oder Musterlösung fehlen")
    if "tests" not in sk or "solution" not in sk:
        continue
    tests = roh(sk["tests"][0][1])
    loesung = roh(sk["solution"][0][1])
    mode = t["mode"]
    pruefe(mode in ("programm", "funktion"), aid + ": data-mode muss programm oder funktion sein")
    n_tests = len(re.findall(r"^def test_", tests, re.M))
    pruefe(n_tests >= 3, "%s: mindestens 3 Testfälle nötig, gefunden: %d" % (aid, n_tests))
    ok, fatal, erg = alle_ok(loesung, tests, mode)
    pruefe(ok, "%s: Musterlösung besteht nicht alle Tests. fatal=%s, %s" % (aid, fatal, [e for e in erg if not e[1]]))
    pruefe(len(erg) == n_tests, "%s: %d Tests gefunden, aber %d ausgeführt" % (aid, n_tests, len(erg)))
    for v in leer:
        pruefe(etwas_faellt_durch(v, tests, mode), "%s: triviales Programm %r besteht die Tests" % (aid, v))
    for v in MUTANTEN.get(aid, []):
        pruefe(etwas_faellt_durch(v, tests, mode), "%s: Fehlerfassung besteht die Tests:\n%s" % (aid, v))
    pruefe(aid in MUTANTEN, aid + ": keine Fehlerfassungen (Festverdrahtung) hinterlegt")
    print("ok", aid, "Code-Aufgabe,", n_tests, "Tests,", len(MUTANTEN.get(aid, [])), "Fehlerfassungen scheitern")

# ---------------------------------------------------------------- PAP -> Python


def tree_zu_python(baum, ein=0):
    z = []
    pad = "    " * ein

    def rumpf(b, e):
        r = tree_zu_python(b, e)
        return r if r else ["    " * e + "pass"]

    for k in baum:
        v = k.get("v", "")
        t = k["k"]
        if t == "in":
            typ = k.get("typ", "float")
            p = json.dumps(k.get("prompt", ""), ensure_ascii=False)
            wrap = {"float": "float(input(%s))", "int": "int(input(%s))", "str": "input(%s)"}[typ] % p
            z.append("%s%s = %s" % (pad, v, wrap))
        elif t == "out":
            z.append("%sprint(%s)" % (pad, v))
        elif t in ("op", "call"):
            z.append(pad + v)
        elif t == "if":
            z.append("%sif %s:" % (pad, v))
            z += rumpf(k.get("yes", []), ein + 1)
            if k.get("no"):
                z.append("%selse:" % pad)
                z += rumpf(k["no"], ein + 1)
        elif t == "while":
            z.append("%swhile %s:" % (pad, v))
            z += rumpf(k.get("body", []), ein + 1)
        elif t == "for":
            z.append("%sfor %s:" % (pad, v))
            z += rumpf(k.get("body", []), ein + 1)
        elif t == "repeat":
            z.append(pad + "while True:")
            z += rumpf(k.get("body", []), ein + 1)
            z.append("%s    if not (%s):" % (pad, v))
            z.append("%s        break" % pad)
        else:
            raise ValueError("unbekannte Knotenart " + t)
    return z


def plan_pruefen(aid, json_text, tests):
    baum = json.loads(json_text)["baum"]
    code = "import math\n" + "\n".join(tree_zu_python(baum)) + "\n"
    ok, fatal, erg = alle_ok(code, tests, "programm")
    pruefe(ok, "%s: der PAP ergibt ein Programm, das die Tests nicht besteht. fatal=%s, %s\n%s" % (aid, fatal, [e for e in erg if not e[1]], code))
    print("ok", aid, "PAP ergibt Programm, das alle Tests besteht")


for aid in typen.get("pap-code", []):
    t = aufgaben[aid]
    pruefe("pap" in t["sk"], aid + ": PAP (data-role=pap) fehlt")
    if "pap" in t["sk"]:
        plan_pruefen(aid, t["sk"]["pap"][0][1], roh(t["sk"]["tests"][0][1]))

for aid in typen.get("pap-zeichnen", []):
    t = aufgaben[aid]
    pruefe("tests" in t["sk"] and "solution" in t["sk"], aid + ": Tests oder Musterlösung (PAP) fehlen")
    tests = roh(t["sk"]["tests"][0][1])
    pruefe(len(re.findall(r"^def test_", tests, re.M)) >= 3, aid + ": mindestens 3 Testfälle nötig")
    plan_pruefen(aid, t["sk"]["solution"][0][1], tests)
    # ein falscher Plan (zweite Raute fehlt) und ein leerer Plan müssen scheitern
    falsch = {"baum": [{"k": "in", "v": "t", "typ": "float", "prompt": "t: "},
                       {"k": "if", "v": "t < 20", "yes": [{"k": "out", "v": "\"Zu kalt\""}], "no": [{"k": "out", "v": "\"Messen\""}]},
                       {"k": "out", "v": "\"Prüfung beendet\""}]}
    code = "\n".join(tree_zu_python(falsch["baum"])) + "\n"
    pruefe(etwas_faellt_durch(code, tests, "programm"), aid + ": falscher Plan besteht die Tests")
    pruefe(etwas_faellt_durch("", tests, "programm"), aid + ": leerer Plan besteht die Tests")
    print("ok", aid, "Code -> PAP: richtiger Plan besteht, falscher und leerer nicht")

# ---------------------------------------------------------------- Ausgabe-Aufgaben


def echte_ausgabe(code, stdin=()):
    puffer = io.StringIO()
    with contextlib.redirect_stdout(puffer):
        exec(compile(code, "<ausgabe>", "exec"), {"__name__": "__main__"})
    return puffer.getvalue()


def norm_zeilen(s):
    return [" ".join(z.split()) for z in str(s).split("\n") if z.strip()]


for aid in typen.get("ausgabe", []):
    t = aufgaben[aid]
    pruefe("code" in t["sk"] and "ausgabe" in t["sk"], aid + ": Code oder erwartete Ausgabe fehlen")
    code = roh(t["sk"]["code"][0][1])
    erw = norm_zeilen(t["sk"]["ausgabe"][0][1])
    echt = norm_zeilen(echte_ausgabe(code))
    pruefe(erw == echt, "%s: hinterlegte Ausgabe %r weicht von der echten %r ab" % (aid, erw, echt))
    z_alle = []
    for x in t.get("schema", []):
        pruefe("z" in x, aid + ": Schemaeintrag ohne z (Zeilenbezug)")
        z_alle.append(x.get("z"))
    pruefe(sorted(set(z_alle)) == list(range(len(erw))), "%s: Schema verweist nicht auf alle %d Zeilen: %r" % (aid, len(erw), z_alle))
    print("ok", aid, "Ausgabe stimmt mit echter Ausgabe überein (%d Zeilen)" % len(erw))

# ---------------------------------------------------------------- Rechnungen und Beispiele in Theorie- und Fehleraufgaben
# k-02
pruefe(format(173, "08b") == "10101101" and hex(173) == "0xad", "k-02 a) 173 = 1010 1101 = AD")
pruefe(int("11100101", 2) - 256 == -27, "k-02 b) 1110 0101 = -27")
pruefe(2 ** 12 == 4096 and round(360 / 4096, 3) == 0.088, "k-02 c) 4096 Stellungen, 0,088 Grad")
# k-04: nur 001 ergibt 1
tab = [(a, b, c, int((not (a or b)) and c) if True else 0) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
pruefe([x[3] for x in tab] == [0, 1, 0, 0, 0, 0, 0, 0], "k-04 Wahrheitstabelle")
for a in (False, True):
    for b in (False, True):
        pruefe((not (a or b)) == ((not a) and (not b)), "k-04 De Morgan")
# k-14
pruefe(abs(500 * math.sin(30) + 494.0158) < 0.001, "k-14 a) fehlerhafte Ausgabe ist -494,0")
pruefe(abs(500 * math.sin(math.radians(30)) - 250) < 1e-9, "k-14 c) korrigierte Hubhöhe 250")
# k-18
mittel, s = 19.995, 0.004
obere = (20.02 - mittel) / (3 * s)
untere = (mittel - 19.98) / (3 * s)
pruefe(round(obere, 2) == 2.08 and round(untere, 2) == 1.25 and min(obere, untere) == untere, "k-18 Cpk 2,08 gegen 1,25")
# k-20
netz = ipaddress.ip_network("172.16.8.0/22")
pruefe(str(netz.netmask) == "255.255.252.0", "k-20 Maske")
pruefe(netz.num_addresses == 1024 and len(list(netz.hosts())) == 1022, "k-20 1024 Adressen, 1022 nutzbar")
pruefe(ipaddress.ip_address("172.16.10.77") in netz and ipaddress.ip_address("172.16.12.5") not in netz, "k-20 Zugehörigkeit")
pruefe(str(next(netz.hosts())) == "172.16.8.1" and str(list(netz.hosts())[-1]) == "172.16.11.254", "k-20 erste und letzte nutzbare Adresse")
pruefe(str(netz.network_address) == "172.16.8.0" and str(netz.broadcast_address) == "172.16.11.255", "k-20 Netz- und Broadcastadresse")
pruefe(json.loads('{"temp": 21.5, "einheit": "C"}')["temp"] == 21.5, "k-20 c) JSON")
# k-21
h = hashlib.sha256(b"Welle Z-17").hexdigest()
pruefe(len(h) == 64 and len(h) * 4 == 256, "k-21 a) 64 Hex-Zeichen = 256 Bit")
pruefe(h != hashlib.sha256(b"Welle Z-18").hexdigest(), "k-21 a) andere Eingabe, anderer Hash")

# Code-Beispiele in den aufgedeckten Lösungen (pre.k-code in templates): ausführen, soweit ohne matplotlib
for aid, t in aufgaben.items():
    for tpl in re.findall(r'<template data-role="loesung">(.*?)</template>', t["inhalt"], re.S):
        for blk in re.findall(r'<pre class="k-code"[^>]*><code>(.*?)</code></pre>', tpl, re.S):
            quelle = html.unescape(blk)
            try:
                ast.parse(quelle)
            except SyntaxError as e:
                pruefe(False, "%s: Codebeispiel in der Lösung hat einen Syntaxfehler: %s" % (aid, e))
                continue
            if "matplotlib" in quelle:
                print("ok", aid, "Codebeispiel (matplotlib): nur Syntax geprüft")
                continue
            try:
                echte_ausgabe(quelle)
                print("ok", aid, "Codebeispiel in der Lösung läuft")
            except Exception as e:
                pruefe(False, "%s: Codebeispiel in der Lösung scheitert: %r" % (aid, e))

# Anzeige-Code der Fehler-Aufgaben: Syntax prüfen
for aid in typen.get("fehler", []):
    quelle = roh(aufgaben[aid]["sk"]["code"][0][1])
    try:
        ast.parse(quelle)
    except SyntaxError as e:
        pruefe(False, "%s: Anzeige-Code hat einen Syntaxfehler: %s" % (aid, e))
# k-14 Anzeige-Code: läuft und liefert die falsche Zahl
aus = norm_zeilen(echte_ausgabe(roh(aufgaben["k-14"]["sk"]["code"][0][1])))
pruefe(len(aus) == 1 and abs(float(aus[0]) + 494.0158) < 0.001, "k-14: Anzeige-Code gibt nicht -494,0 aus: %r" % aus)

# ---------------------------------------------------------------- Dateien: keine Emojis, keine Nicht-Du-Anrede-Reste nötig
emoji = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]")
for d in DATEIEN:
    if d.exists():
        pruefe(emoji.search(d.read_text(encoding="utf-8")) is None, "Emoji in " + d.name)
    else:
        pruefe(False, "Datei fehlt: " + str(d))

if fehler:
    print("\n%d Fehler:" % len(fehler))
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("Alle Prüfungen bestanden")
