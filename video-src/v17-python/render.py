"""V17 Python-Werkzeugkasten: json, verschachtelte Daten, requests, ipaddress (Code wird echt ausgefuehrt, Ausgaben stammen daraus).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts/full erst nach Freigabe der Credits)"""
import os, sys, types, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v17-common"))
from h17 import *
from texte import SRC

NAME = "v17-python"; LABEL = "DHBW · Informatik · V17 · Python-Werkzeugkasten"
SECS = make_secs(SRC)
ROOT = os.path.join(HERE, "..", "..")
API = os.path.join(ROOT, "site", "assets", "data", "v17", "api")

# ---------------------------------------------------------------- echte Ausfuehrung (requests liest die lokalen Dateien)
class _Antwort:
    def __init__(s, pfad):
        s.status_code = 200 if os.path.exists(pfad) else 404
        s.text = open(pfad, encoding="utf-8").read() if s.status_code == 200 else "404 Not Found"
    def json(s): return json.loads(s.text)
_req = types.ModuleType("requests")
_req.get = lambda url: _Antwort(os.path.join(API, url.replace("../assets/data/v17/api/", "")))
def ausfuehren(code): return run_code(code, {"requests": _req})

C1 = ['import json',
      'text = \'{"id": "D2", "drehzahl_1_min": 1450}\'',
      'd = json.loads(text)',
      'print(d["drehzahl_1_min"])',
      'print(json.dumps(d))',
      'print(json.dumps(d, indent=2))']
O1 = ausfuehren("\n".join(C1))
assert O1[0] == "1450" and O1[1] == '{"id": "D2", "drehzahl_1_min": 1450}' and O1[2:] == ['{', '  "id": "D2",', '  "drehzahl_1_min": 1450', '}'], O1

C2a = ['try:', '    d = json.loads("{\'id\': \'D2\'}")', 'except ValueError:', '    print("kein gültiges JSON")']
O2a = ausfuehren("import json\n" + "\n".join(C2a)); assert O2a == ["kein gültiges JSON"], O2a
C2b = ['with open("d2.json") as datei:', '    d = json.load(datei)', 'with open("kopie.json", "w") as datei:', '    json.dump(d, datei)']

C3a = ['for m in zelle["maschinen"]:', '    print(m["id"], m["status"])']
O3a = ausfuehren('import requests, json\nzelle = requests.get("../assets/data/v17/api/maschinen.json").json()\n' + "\n".join(C3a))
assert O3a == ["D2 laeuft", "F1 laeuft", "R1 gestoert", "M1 bereit", "SPS laeuft"], O3a
C3b = 'd2["werkzeugverschleiss_prozent"]["T4"]   # 83'
C3c = 'sps.get("stueckzahl_schicht", 0)           # 0'
_pre = 'import requests\nU = "../assets/data/v17/api/"\nd2 = requests.get(U + "D2.json").json()\nsps = requests.get(U + "SPS.json").json()\n'
assert ausfuehren(_pre + "print(" + C3b.split("   #")[0] + ")") == ["83"] and ausfuehren(_pre + "print(" + C3c.split("   #")[0] + ")") == ["0"]

C4 = ['URL = "../assets/data/v17/api/"', 'antwort = requests.get(URL + "D2.json")', 'print(antwort.status_code)', 'if antwort.status_code == 200:', '    d2 = antwort.json()']
O4 = ausfuehren("import requests\n" + "\n".join(C4)); assert O4 == ["200"], O4
assert ausfuehren('import requests\nprint(requests.get("../assets/data/v17/api/D9.json").status_code)') == ["404"]

C5 = ['import ipaddress', 'netz = ipaddress.ip_network("192.168.30.0/24")', 'ip = ipaddress.ip_address("192.168.31.20")', 'print(ip in netz)', 'print(netz.num_addresses, netz.num_addresses - 2)']
O5 = ausfuehren("\n".join(C5)); assert O5 == ["False", "256 254"], O5

def codeblock(f, t, x, y, w, lines, t0, size, lh, hl=None, cps=55, a0=None):
    times = [t0 + sum(len(l) / cps + 0.12 for l in lines[:k]) for k in range(len(lines))]
    f.el(ap(t, a0 if a0 is not None else t0 - 0.2, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, None, times, t, size, lh, hl, cps))
    return 50 + lh * len(lines) + 18
def outpanel(f, t, x, y, w, lines, t0, size=22, lh=32, step=0.5, cols=None):
    h = 46 + lh * len(lines) + 14
    ents = [(t0 + k * step, [(s, (cols or {}).get(k, CODE_T))]) for k, s in enumerate(lines)]
    f.el(show(t, t0 - 0.2), lambda d, dy: console_panel(d, x, y + dy, w, h, ents, t, size, title="Ausgabe", lh=lh), dy=dyf(t, t0 - 0.2))
    return h
def hlsel(t, sched): return hl_at(t, [(0, None)] + sched)

# ---------------------------------------------------------------- 1 loads und dumps
def sc1(f, t, ct):
    heading(f, t, "json: Text und Python-Daten")
    h = codeblock(f, t, 60, 112, 640, C1, 0.5, 22, 34, hlsel(t, [(ct(1), {2, 3}), (ct(2), {4}), (ct(3), {5})]), cps=40)
    ents = [(ct(1) + 1.2, [(O1[0], CODE_T)]), (ct(2) + 0.8, [(O1[1], CODE_T)])] + [(ct(3) + 0.8 + 0.4 * k, [(s, CODE_T)]) for k, s in enumerate(O1[2:])]
    f.el(show(t, ct(1) + 0.2), lambda d, dy: console_panel(d, 60, 410 + dy, 640, 46 + 32 * 6 + 14, ents, t, 22, title="Ausgabe", lh=32), dy=dyf(t, ct(1) + 0.2))
    def flow(d, dy):
        card(d, 740, 128 + dy, 480, 250); T2(d, 770, 140 + dy, "Text ↔ Dictionary", F(30, 700), DARK, "la")
        chip(d, 770, 232 + dy, 150, 60, "JSON-Text", LIGHTA, AMB, 24); chip(d, 1040, 232 + dy, 150, 60, "dict", LIGHTG, GREEN, 28, mono=True)
        a = ap(t, ct(1) + 0.4, 0.4)
        if a > 0:
            arrow(d, 932, 252 + dy, 1028, 252 + dy, mix(WHITE, DARK, a), 5, 15); T2(d, 980, 226 + dy, "loads", M(24, True), mix(WHITE, RED, a), "mm")
        b = ap(t, ct(2) + 0.2, 0.4)
        if b > 0:
            arrow(d, 1028, 276 + dy, 932, 276 + dy, mix(WHITE, DARK, b), 5, 15); T2(d, 980, 306 + dy, "dumps", M(24, True), mix(WHITE, RED, b), "mm")
    f.el(show(t, 0.4), flow, dy=dyf(t, 0.4))
    f.el(show(t, ct(3) + 0.2), lambda d, dy: tag(d, 740, 410 + dy, 480, 48, "indent=2: eingerückt, besser lesbar", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(3) + 0.2))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: T2(d, 740, 480 + dy, "Text zum Verschicken, z. B. per MQTT", F(26, 700), GREY, "la"), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 Typen, Fehler, Dateien
def sc2(f, t, ct):
    heading(f, t, "JSON ↔ Python: Typen, Fehler, Dateien")
    rows = [("Objekt  { }", "dict"), ("Array  [ ]", "list"), ("Text  \"…\"", "str"), ("Zahl", "int / float"), ("true / false", "True / False"), ("null", "None")]
    rt = [ct(0) + 0.6 + 0.9 * k for k in range(6)]
    f.el(show(t, 0.3), lambda d, dy: grid(d, 60, 124 + dy, [250, 250], ["JSON", "Python"], rows, t, rt, 24, 46), dy=dyf(t, 0.3))
    def err(d, dy):
        card(d, 60, 480 + dy, 500, 190); T2(d, 90, 490 + dy, "JSON ist streng", F(28, 700), DARK, "la")
        tag(d, 90, 536 + dy, 440, 40, "nur doppelte Anführungszeichen", LIGHTR, RED, 22, outl=RED)
        tag(d, 90, 586 + dy, 440, 40, "kein Komma am Ende", LIGHTR, RED, 22, outl=RED)
        a = ap(t, ct(1) + 1.6, 0.4)
        if a > 0: T2(d, 90, 638 + dy, "sonst: JSONDecodeError", M(21, True), mix(WHITE, RED, a), "la")
    f.el(show(t, ct(1) + 0.1), err, dy=dyf(t, ct(1) + 0.1))
    X, W_ = 620, 600
    h = codeblock(f, t, X, 124, W_, C2a, ct(2) + 0.1, 19, 30, hlsel(t, [(ct(2), {2})]), a0=ct(1) + 0.1)
    outpanel(f, t, X, 124 + h + 12, W_, O2a, ct(2) + 1.0, 22, 32)
    f.el(show(t, ct(2) + 1.2), lambda d, dy: tag(d, X + 300, 156 + dy, 280, 36, "ist ein ValueError", LIGHTA, AMB, 20, outl=AMB), dy=dyf(t, ct(2) + 1.2))
    codeblock(f, t, X, 474, W_, C2b, ct(3) + 0.2, 19, 30, hlsel(t, [(ct(3), {1}), (ct(3) + 2.4, {3})]), a0=ct(3) + 0.0)
    f.el(show(t, ct(3) + 0.1), lambda d, dy: T2(d, X, 432 + dy, "Datei lesen: load  ·  schreiben: dump", F(24, 700), GREY, "la"), dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 3 Verschachtelte Daten
def sc3(f, t, ct):
    heading(f, t, "Verschachtelte Daten")
    def lst(d, dy):
        card(d, 60, 112 + dy, 470, 262); T2(d, 88, 122 + dy, "zelle  (dict)", M(24, True), DARK, "la")
        T2(d, 88, 156 + dy, '"maschinen":  Liste von Dictionaries', F(22, 700), GREY, "la")
        for k, (i, s, bad) in enumerate((("D2", "laeuft", 0), ("F1", "laeuft", 0), ("R1", "gestoert", 1))):
            a = ap(t, ct(1) - 0.2 + 0.35 * k, 0.35)
            x = 88 + k * 140
            d.rounded_rectangle((x, 200 + dy, x + 128, 350 + dy), 10, fill=mix(WHITE, LIGHTR if bad else LIGHTK, a), outline=mix(WHITE, RED if bad else GREY, a), width=2)
            if a > 0.5:
                T2(d, x + 14, 212 + dy, "dict", M(17), GREY, "la"); T2(d, x + 14, 246 + dy, f'id: "{i}"', M(19, True), DARK, "la")
                T2(d, x + 14, 280 + dy, f'status:', M(17), GREY, "la"); T2(d, x + 14, 304 + dy, f'"{s}"', M(19, True), RED if bad else DARK, "la")
    f.el(show(t, 0.3), lst, dy=dyf(t, 0.3))
    def dd(d, dy):
        card(d, 60, 392 + dy, 470, 282); T2(d, 88, 402 + dy, "d2  (dict im dict)", M(24, True), DARK, "la")
        d.rounded_rectangle((88, 444 + dy, 500, 654 + dy), 10, fill=BOX)
        T2(d, 108, 456 + dy, '"programm": "WELLE_20H6",', M(19), CODE_T, "la")
        T2(d, 108, 486 + dy, '"werkzeugverschleiss_prozent": {', M(19), CODE_T, "la")
        a = ap(t, ct(2) + 0.2, 0.4)
        d.rounded_rectangle((120, 516 + dy, 470, 546 + dy), 6, fill=mix(BOX, HLBG, a)); T2(d, 130, 520 + dy, '"T1": 22,', M(19), CODE_T, "la")
        d.rounded_rectangle((120, 552 + dy, 470, 582 + dy), 6, fill=mix(BOX, HLBG, a), outline=mix(BOX, RED, a), width=2); T2(d, 130, 556 + dy, '"T4": 83', M(19, True), mix(CODE_T, CODE_N, a), "la")
        T2(d, 108, 600 + dy, "}", M(19), CODE_T, "la")
        if a > 0.5: T2(d, 108, 628 + dy, "zwei Schlüssel: 1. Verschleiß, 2. T4", F(20, 700), CODE_N, "la")
    f.el(show(t, ct(2) - 0.3), dd, dy=dyf(t, ct(2) - 0.3))
    X, W_ = 580, 640
    h = codeblock(f, t, X, 112, W_, C3a, ct(1) + 0.1, 20, 30, hlsel(t, [(ct(1), {0, 1})]), a0=ct(0) + 0.5)
    outpanel(f, t, X, 112 + h + 10, W_, O3a, ct(1) + 1.6, 19, 24, 0.35, {2: CODE_R})
    y3 = 112 + h + 10 + 46 + 24 * 5 + 14 + 12
    h2 = codeblock(f, t, X, y3, W_, [C3b], ct(2) + 0.3, 20, 30, {0}, a0=ct(2) + 0.0)
    h3 = codeblock(f, t, X, y3 + h2 + 12, W_, [C3c], ct(3) + 0.3, 20, 30, {0}, a0=ct(3) + 0.0)
    f.el(show(t, ct(3) + 2.5), lambda d, dy: tag(d, X, y3 + h2 + h3 + 24 + dy, 300, 28, "ohne .get: KeyError", LIGHTR, RED, 18, outl=RED), dy=dyf(t, ct(3) + 2.5))
    assert y3 + h2 + h3 + 24 + 28 <= 692, y3 + h2 + h3 + 52

# ---------------------------------------------------------------- 4 requests
def sc4(f, t, ct):
    heading(f, t, "requests: Daten per HTTP holen")
    h = codeblock(f, t, 60, 112, 700, C4, 0.5, 20, 32, hlsel(t, [(ct(0), {0, 1}), (ct(1), {2}), (ct(2), {3, 4})]), cps=40)
    outpanel(f, t, 60, 112 + h + 14, 700, O4, ct(1) + 1.0, 24, 36)
    def ok(d, dy):
        card(d, 800, 112 + dy, 420, 170); T2(d, 828, 122 + dy, "D2.json", M(26, True), DARK, "la")
        chip(d, 828, 170 + dy, 130, 54, "200", LIGHTG, GREEN, 34, outl=GREEN)
        a = ap(t, ct(2) + 0.6, 0.4)
        if a > 0: arrow(d, 970, 197 + dy, 1012, 197 + dy, GREY, 4, 12); chip(d, 1024, 170 + dy, 170, 54, "dict", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 28, mono=True)
        T2(d, 828, 240 + dy, "gut: json() ist erlaubt", F(22, 600), GREEN, "la")
    f.el(show(t, ct(1) - 0.2), ok, dy=dyf(t, ct(1) - 0.2))
    def nok(d, dy):
        card(d, 800, 296 + dy, 420, 170); T2(d, 828, 306 + dy, "D9.json", M(26, True), DARK, "la")
        chip(d, 828, 354 + dy, 130, 54, "404", LIGHTR, RED, 34, outl=RED)
        a = ap(t, ct(2) + 1.4, 0.4)
        if a > 0: arrow(d, 970, 381 + dy, 1012, 381 + dy, GREY, 4, 12); chip(d, 1024, 354 + dy, 170, 54, "kein JSON", mix(WHITE, LIGHTR, a), mix(WHITE, RED, a), 24)
        T2(d, 828, 424 + dy, "Datei gibt es nicht", F(22, 600), RED, "la")
    f.el(show(t, ct(1) + 0.4), nok, dy=dyf(t, ct(1) + 0.4))
    def foot(d, dy):
        card(d, 60, 496 + dy, 1160, 170)
        T2(d, 90, 508 + dy, "Reihenfolge", F(28, 700), RED, "la")
        steps = ["get", "status_code prüfen", "json()"]; x = 90
        for k, s in enumerate(steps):
            w = int(F(26, 700).getlength(s) + 44); chip(d, x, 562 + dy, w, 52, s, LIGHTB, BLUE, 26); x += w
            if k < 2: arrow(d, x + 8, 588 + dy, x + 44, 588 + dy, GREY, 4, 12); x += 54
        T2(d, 90, 628 + dy, "Im Labor nur GET. Anmeldung und Zugriffsrechte: Sache der IT.", F(24, 600), GREY, "la")
    f.el(show(t, ct(3) + 0.1), foot, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 5 ipaddress
def sc5(f, t, ct):
    heading(f, t, "ipaddress: Netze rechnen")
    h = codeblock(f, t, 60, 112, 700, C5, 0.5, 20, 32, hlsel(t, [(ct(0), {1, 2}), (ct(1), {3}), (ct(2), {4})]), cps=40)
    ents = [(ct(1) + 1.0, [("False", CODE_R)]), (ct(2) + 1.2, [("256 254", CODE_T)])]
    f.el(show(t, ct(1) + 0.3), lambda d, dy: console_panel(d, 60, 112 + h + 14 + dy, 700, 46 + 34 * 2 + 14, ents, t, 24, title="Ausgabe", lh=34), dy=dyf(t, ct(1) + 0.3))
    def vgl(d, dy):
        card(d, 800, 112 + dy, 420, 340); T2(d, 828, 122 + dy, "R1 im Netz?", F(28, 700), DARK, "la")
        T2(d, 828, 170 + dy, "Netz", F(22, 700), GREY, "la"); T2(d, 828, 266 + dy, "R1", F(22, 700), GREY, "la")
        for k, (v, bad) in enumerate((("192", 0), ("168", 0), ("30", 0), ("x", 0))):
            chip(d, 828 + k * 94, 198 + dy, 84, 52, v if k < 3 else "0…255", LIGHTB if k < 3 else LIGHTK, BLUE if k < 3 else GREY, 24 if k < 3 else 19)
        a = ap(t, ct(1) + 0.4, 0.4)
        for k, v in enumerate(("192", "168", "31", "20")):
            bad = k == 2 and a > 0
            chip(d, 828 + k * 94, 294 + dy, 84, 52, v, LIGHTR if bad else (LIGHTB if k < 3 else LIGHTK), RED if bad else (BLUE if k < 3 else GREY), 24, outl=RED if bad else None)
        if a > 0:
            T2(d, 828, 366 + dy, "ip in netz  →  False", M(23, True), mix(WHITE, RED, a), "la")
            T2(d, 828, 404 + dy, "drittes Oktett: 31 ≠ 30", F(22, 600), mix(WHITE, RED, a), "la")
    f.el(show(t, ct(0) + 0.2), vgl, dy=dyf(t, ct(0) + 0.2))
    def warn(d, dy):
        card(d, 60, 508 + dy, 1160, 164, stripe=False); d.rectangle((60, 508 + dy, 68, 672 + dy), fill=RED)
        T2(d, 90, 520 + dy, "Nie als Text vergleichen", F(28, 700), RED, "la")
        d.rounded_rectangle((90, 566 + dy, 790, 610 + dy), 8, fill=BOX); T2(d, 106, 588 + dy, 'm["ip"].startswith("192.168.3")', M(21), CODE_T, "lm")
        a = ap(t, ct(3) + 1.2, 0.4)
        if a > 0: tag(d, 820, 566 + dy, 360, 44, "lässt 192.168.31.20 durch", LIGHTR, RED, 22, outl=RED)
        T2(d, 90, 626 + dy, "Besser: ip in netz", F(24, 700), GREEN, "la")
    f.el(show(t, ct(3) + 0.1), warn, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V17 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 280, "json, requests und ipaddress", F(44, 400), GREY)
        code_n(d, 90, 380, 560, ['d = json.loads(text)', 'antwort = requests.get(URL)', 'ip in netz'], None, [-1] * 3, 9, 24, 34, {0})
        for k, s in enumerate(("json", "requests", "ipaddress")):
            chip(d, 760 + k * 150 - (30 if k == 2 else 0), 410, 140 + (20 if k == 2 else 0), 56, s, LIGHTB, BLUE, 22, mono=True)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
