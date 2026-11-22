"""V17 Theorie: Netzwerke und Industrie 4.0 am Beispiel der Fertigungszelle FZ-3. Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v17-common"))
from h17 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import along
from texte import SRC

NAME = "v17-theorie"; LABEL = "DHBW · Informatik · V17 · Netzwerke und Industrie 4.0"
SECS = make_secs(SRC)

def polyline(d, pts, col, w=4, dash=False):
    if not dash: d.line(pts, fill=col, width=w, joint="curve"); return
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.dist((x0, y0), (x1, y1)) / 16))
        for k in range(n):
            a = k / n; b = (k + 0.55) / n
            d.line((x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b), fill=col, width=w)

def dot(d, pts, p, col=RED, r=11):
    """Nachricht als Punkt entlang einer Linie (p = 0..1)."""
    if p <= 0 or p >= 1: return
    x, y = along(pts, p); d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=WHITE, width=3)

# ---------------------------------------------------------------- 1 Zellennetz
SW = (640, 372)
TOP = [("gw", "Gateway", "", "192.168.30.1", 250), ("br", "Broker", "", "192.168.30.5:1883", 640), ("sps", "SPS", "Zellensteuerung", "192.168.30.2", 1030)]
BOT = [("d2", "D2", "Drehmaschine", "192.168.30.11", 190), ("f1", "F1", "Fräsmaschine", "192.168.30.12", 470), ("m1", "M1", "Messmaschine", "192.168.30.14", 750), ("r1", "R1", "Roboter", "192.168.31.20", 1030)]
SXS = {"gw": 520, "br": 640, "sps": 760, "d2": 520, "f1": 580, "m1": 700, "r1": 760}
def sc1(f, t, ct):
    heading(f, t, "Die Fertigungszelle FZ-3 im Netz")
    f.el(show(t, 0.3), lambda d, dy: T2(d, 1220, 62 + dy, "Netz 192.168.30.0/24 · Halle 2", M(22), GREY, "ra"))
    BW, BH = 250, 104
    def sw(d, dy):
        d.rounded_rectangle((SW[0] - 150, SW[1] - 30 + dy, SW[0] + 150, SW[1] + 30 + dy), 12, fill=BOX)
        T2(d, SW[0], SW[1] + dy, "Switch", F(28, 700), WHITE, "mm")
    f.el(show(t, 0.3), sw, dy=dyf(t, 0.3))
    r1bad = ap(t, ct(1) + 0.4, 0.5)
    def node(key, title, sub, ipt, cx, cy, top, tin):
        def fn(d, dy):
            bad = key == "r1" and r1bad > 0
            col = RED if bad else DARK
            sx = SXS[key]
            if top: pts = [(sx, SW[1] - 30 + dy), (sx, SW[1] - 86 + dy), (cx, SW[1] - 86 + dy), (cx, cy + BH / 2 + dy)]
            else: pts = [(sx, SW[1] + 30 + dy), (sx, SW[1] + 86 + dy), (cx, SW[1] + 86 + dy), (cx, cy - BH / 2 + dy)]
            polyline(d, pts, RED if bad else GREY, 4, dash=bad)
            fill = mix(WHITE, LIGHTR, r1bad) if key == "r1" else WHITE
            d.rounded_rectangle((cx - BW / 2, cy - BH / 2 + dy, cx + BW / 2, cy + BH / 2 + dy), 12, fill=fill, outline=mix(LINE, RED, r1bad) if key == "r1" else LINE, width=3 if bad else 2)
            if sub:
                T2(d, cx, cy - 28 + dy, title, F(28, 700), col, "mm"); T2(d, cx, cy + 2 + dy, sub, F(20, 600), GREY, "mm"); T2(d, cx, cy + 30 + dy, ipt, M(21, True if bad else False), col if bad else DARK, "mm")
            else:
                T2(d, cx, cy - 14 + dy, title, F(28, 700), col, "mm"); T2(d, cx, cy + 24 + dy, ipt, M(21), DARK, "mm")
        f.el(show(t, tin), fn, dy=dyf(t, tin))
    nodes = [(*n, 190, True) for n in TOP] + [(*n, 560, False) for n in BOT]
    for k, (key, title, sub, ipt, cx, cy, top) in enumerate(nodes):
        node(key, title, sub, ipt, cx, cy, top, ct(0) + 0.2 + 0.35 * k)
    f.el(show(t, ct(0) + 0.2), lambda d, dy: T2(d, 250, 128 + dy, "zum Werksnetz", F(20, 600), GREY, "mm"))
    f.el(show(t, ct(1) + 0.5), lambda d, dy: tag(d, 905, 624 + dy, 250, 40, "R1: keine Antwort", RED, WHITE, 24), dy=dyf(t, ct(1) + 0.5))
    f.el(show(t, ct(2) + 0.3), lambda d, dy: tag(d, 60, 630 + dy, 560, 36, "falsche Adresse nach dem Steuerungstausch", LIGHTR, RED, 22, outl=RED), dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 IP und Subnetz
def sc2(f, t, ct):
    heading(f, t, "IP-Adresse und Subnetz")
    X0, CW, GAP = 170, 190, 16
    ox = lambda k: X0 + k * (CW + GAP)
    d2 = [192, 168, 30, 11]; r1 = [192, 168, 31, 20]
    blue = ap(t, ct(1) + 0.3, 0.5)
    def rowa(d, dy):
        T2(d, 60, 176 + dy, "D2", F(32, 700), DARK, "lm")
        for k, v in enumerate(d2):
            net = k < 3
            fill = mix(WHITE, LIGHTB if net else LIGHTA, blue); outl = mix(LINE, BLUE if net else AMB, blue)
            d.rounded_rectangle((ox(k), 130 + dy, ox(k) + CW, 254 + dy), 12, fill=fill, outline=outl, width=2)
            T2(d, ox(k) + CW / 2, 168 + dy, str(v), F(48, 700), DARK, "mm")
            a = ap(t, ct(0) + 1.6 + 0.3 * k, 0.4)
            if a > 0: T2(d, ox(k) + CW / 2, 222 + dy, format(v, "08b"), M(26), mix(fill, GREY, a), "mm")
    f.el(show(t, 0.3), rowa, dy=dyf(t, 0.3))
    def brk(d, dy):
        a = ap(t, ct(1) + 0.5, 0.5)
        xa, xb, xc = ox(0), ox(3) - GAP, ox(4) - GAP
        for x0, x1, col, lab in ((xa, xb, BLUE, "Netz: 24 Bit"), (ox(3), xc, AMB, "Gerät: 8 Bit")):
            c = mix(BG, col, a); y = 270 + dy
            d.line((x0, y, x0, y + 12), fill=c, width=3); d.line((x1, y, x1, y + 12), fill=c, width=3); d.line((x0, y + 12, x1, y + 12), fill=c, width=3)
            T2(d, (x0 + x1) / 2, y + 36 + dy * 0, lab, F(26, 700), c, "mm")
        tg = ap(t, ct(1) + 0.9, 0.4)
        if tg > 0: tag(d, 1010, 160 + dy, 170, 54, "/24", mix(WHITE, RED, tg), WHITE, 32)
    f.el(show(t, ct(1) + 0.2), brk, dy=dyf(t, ct(1) + 0.2))
    def rown(d, dy):
        T2(d, 60, 372 + dy, "Netz", F(28, 700), GREY, "lm")
        for k, v in enumerate(("192", "168", "30", "0…255")):
            net = k < 3
            chip(d, ox(k), 348 + dy, CW, 48, v, LIGHTB if net else LIGHTK, BLUE if net else GREY, 28 if net else 22)
    f.el(show(t, ct(1) + 1.0), rown, dy=dyf(t, ct(1) + 1.0))
    def card2(d, dy):
        card(d, 60, 530 + dy, 1160, 130)
        T2(d, 92, 548 + dy, "254 nutzbare Adressen", F(40, 700), GREEN, "la")
        T2(d, 92, 602 + dy, "2⁸ = 256 Adressen, minus erste (Netz) und letzte (Broadcast)", F(26, 600), GREY, "la")
        chip(d, 960, 566 + dy, 220, 58, "256 − 2 = 254", LIGHTG, GREEN, 28, outl=GREEN)
    f.el(show(t, ct(2) + 0.1), card2, dy=dyf(t, ct(2) + 0.1))
    def rowr(d, dy):
        T2(d, 60, 452 + dy, "R1", F(28, 700), RED, "lm")
        for k, v in enumerate(r1):
            bad = k == 2
            chip(d, ox(k), 428 + dy, CW, 48, str(v), LIGHTR if bad else (LIGHTB if k < 3 else LIGHTK), RED if bad else (BLUE if k < 3 else GREY), 28, outl=RED if bad else None)
        a = ap(t, ct(3) + 0.8, 0.4)
        if a > 0:
            badge(d, 1030, 452 + dy, 18, False); T2(d, 1062, 452 + dy, "falsches Netz", F(26, 700), RED, "lm")
    # R1-Zeile liegt ueber der Kachel: Kachel erst nach R1 anzeigen -> R1 zwischen Netz und Kachel
    f.el(show(t, ct(3) + 0.1), rowr, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 3 HTTP
def sc3(f, t, ct):
    heading(f, t, "HTTP: Anfrage und Antwort")
    def box(d, dy, x, title, sub):
        card(d, x, 128 + dy, 300, 160); T2(d, x + 28, 140 + dy, title, F(34, 700), DARK, "la"); T2(d, x + 28, 190 + dy, sub, F(22, 600), GREY, "la")
        d.rounded_rectangle((x + 28, 228 + dy, x + 272, 268 + dy), 8, fill=BOX)
    f.el(show(t, 0.3), lambda d, dy: (box(d, dy, 60, "Client", "dein Python-Programm"), T2(d, 90 + 28, 248 + dy, "requests.get", M(20), CODE_K, "lm")), dy=dyf(t, 0.3))
    f.el(show(t, 0.45), lambda d, dy: (box(d, dy, 920, "Server", "Leitrechner · Website"), T2(d, 948 + 28, 248 + dy, "D2.json", M(20), CODE_G, "lm")), dy=dyf(t, 0.45))
    a1 = ap(t, ct(0) + 1.0, 0.5)
    def req(d, dy):
        arrow(d, 390, 186 + dy, 900, 186 + dy, mix(BG, RED, a1), 5, 16); T2(d, 645, 152 + dy, "GET  /api/D2.json", M(26, True), mix(BG, RED, a1), "mm")
    f.el(1.0 if a1 > 0 else 0, req)
    a2 = ap(t, ct(0) + 2.2, 0.5)
    def resp(d, dy):
        arrow(d, 900, 250 + dy, 390, 250 + dy, mix(BG, GREEN, a2), 5, 16); T2(d, 645, 282 + dy, "200 + Daten (JSON)", M(26, True), mix(BG, GREEN, a2), "mm")
    f.el(1.0 if a2 > 0 else 0, resp)
    def url(d, dy):
        d.rounded_rectangle((60, 336 + dy, 1220, 394 + dy), 12, fill=BOX)
        segs = [("http", CODE_K, "Schema"), ("://", CODE_C, ""), ("leitrechner", CODE_G, "Rechner"), ("/api/D2.json", CODE_N, "Pfad")]
        x = 90; fm = M(32, True)
        for s, col, lab in segs:
            T2(d, x, 365 + dy, s, fm, col, "lm")
            w = fm.getlength(s)
            if lab:
                tgt = ap(t, ct(1) + 0.8 + 0.6 * ("Schema Rechner Pfad".split().index(lab)), 0.4)
                if tgt > 0:
                    d.line((x + 2, 404 + dy, x + w - 4, 404 + dy), fill=mix(BG, col, tgt) if col != CODE_K else mix(BG, BLUE, tgt), width=3)
                    T2(d, x + w / 2, 414 + dy, lab, F(22, 700), mix(BG, GREY, tgt), "ma")
            x += w
    f.el(show(t, ct(1) + 0.1), url, dy=dyf(t, ct(1) + 0.1))
    def st200(d, dy):
        card(d, 60, 468 + dy, 360, 140); T2(d, 90, 478 + dy, "200", F(64, 700), GREEN, "la"); T2(d, 90, 560 + dy, "in Ordnung, Daten kommen", F(22, 700), GREY, "la")
    def st404(d, dy):
        card(d, 450, 468 + dy, 360, 140); T2(d, 480, 478 + dy, "404", F(64, 700), RED, "la"); T2(d, 480, 560 + dy, "nicht gefunden", F(22, 700), GREY, "la")
    f.el(show(t, ct(2) + 0.1), st200, dy=dyf(t, ct(2) + 0.1)); f.el(show(t, ct(2) + 2.6), st404, dy=dyf(t, ct(2) + 2.6))
    def api(d, dy):
        card(d, 840, 468 + dy, 380, 140); T2(d, 870, 478 + dy, "API", F(40, 700), RED, "la")
        T2(d, 870, 534 + dy, "feste Adressen, unter denen", F(21, 600), GREY, "la"); T2(d, 870, 560 + dy, "ein Programm Daten abholt", F(21, 600), GREY, "la")
    f.el(show(t, ct(3) + 0.1), api, dy=dyf(t, ct(3) + 0.1))
    f.el(show(t, ct(3) + 2.2), lambda d, dy: tag(d, 60, 630 + dy, 750, 44, "Erst den Status prüfen, dann die Daten auswerten", LIGHTG, GREEN, 26, outl=GREEN), dy=dyf(t, ct(3) + 2.2))

# ---------------------------------------------------------------- 4 JSON
JSON_LINES = ['{', '  "id": "D2",', '  "programm": "WELLE_20H6",', '  "drehzahl_1_min": 1450,', '  "werkzeugverschleiss_prozent": {', '    "T1": 22,', '    "T4": 83', '  }', '}']
def sc4(f, t, ct):
    heading(f, t, "JSON: Daten als Text")
    times = [ct(0) + 0.2 + 0.3 * k for k in range(9)]
    hl = hl_at(t, [(0, None), (ct(0) + 2.0, {1}), (ct(1), {4, 5, 6, 7}), (ct(2), {4, 6})])
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 540, JSON_LINES, None, times, t, 22, 32, hl, cps=60, title="D2.json"))
    def leg(d, dy):
        card(d, 60, 500 + dy, 540, 170); T2(d, 90, 510 + dy, "Schlüssel : Wert", F(28, 700), DARK, "la")
        chip(d, 90, 560 + dy, 200, 52, '"id"', LIGHTB, BLUE, 26, mono=True); T2(d, 306, 586 + dy, ":", F(32, 700), GREY, "mm"); chip(d, 322, 560 + dy, 200, 52, '"D2"', LIGHTG, GREEN, 26, mono=True)
        T2(d, 90, 626 + dy, "wie bei einem Dictionary", F(22, 600), GREY, "la")
    f.el(show(t, ct(0) + 1.4), leg, dy=dyf(t, ct(0) + 1.4))
    X, W_ = 640, 580
    f.el(show(t, ct(2) + 0.1), lambda d, dy: code_n(d, X, 112 + dy, W_, ['d2["werkzeugverschleiss_prozent"]["T4"]'], None, [ct(2) + 0.2], t, 20, 32, {0}, title="Python"), dy=dyf(t, ct(2) + 0.1))
    def res(d, dy):
        a = ap(t, ct(2) + 2.4, 0.4)
        if a > 0:
            arrow(d, X + 20, 252 + dy, X + 70, 252 + dy, GREY, 4, 12); chip(d, X + 80, 228 + dy, 120, 48, "83", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 30, mono=True)
            T2(d, X + 214, 252 + dy, "int", M(22), GREY, "lm")
    f.el(show(t, ct(2) + 0.1), res)
    rows = [("Objekt  { }", "dict"), ("Array  [ ]", "list"), ("Text  \"…\"", "str"), ("Zahl", "int / float"), ("null", "None")]
    rt = [ct(3) + 0.3 + 0.5 * k for k in range(5)]
    f.el(show(t, ct(3) + 0.1), lambda d, dy: grid(d, X, 310 + dy, [290, 290], ["JSON", "Python"], rows, t, rt, 24, 46), dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 5 MQTT
BRK = (480, 130, 800, 400)
PUBS = {"D2": (60, 150, 290, 240), "M1": (60, 290, 290, 380)}
SUBS = [("Leitstand", "fz3/+/status", 120), ("Instandhaltung", "fz3/D2/#", 230), ("Qualität", "fz3/M1/#", 340)]
def sc5(f, t, ct):
    heading(f, t, "MQTT: Publish und Subscribe")
    def broker(d, dy):
        card(d, BRK[0], BRK[1] + dy, 320, 270, stripe=False); d.rectangle((BRK[0], BRK[1] + dy, BRK[0] + 320, BRK[1] + 8 + dy), fill=RED)
        T2(d, 640, 172 + dy, "Broker", F(36, 700), DARK, "mm"); T2(d, 640, 214 + dy, "192.168.30.5:1883", M(21), GREY, "mm")
        for k, tp in enumerate(("fz3/D2/status", "fz3/M1/status")):
            a = ap(t, ct(0) + 2.4 + 3.2 * k if k == 0 else ct(2) + 3.0, 0.4)
            T2(d, 640, 280 + k * 40 + dy, tp, M(20), mix(WHITE, DARK, a), "mm")
    f.el(show(t, 0.3), broker, dy=dyf(t, 0.3))
    def pubs(d, dy):
        for nm, (x0, y0, x1, y1) in PUBS.items():
            d.rounded_rectangle((x0, y0 + dy, x1, y1 + dy), 12, fill=WHITE, outline=LINE, width=2)
            T2(d, x0 + 20, y0 + 26 + dy, nm, F(30, 700), DARK, "lm"); T2(d, x0 + 20, y0 + 60 + dy, "publiziert", F(21, 600), GREY, "lm")
            yy = (y0 + y1) / 2 + dy
            d.line((x1, yy, BRK[0], yy), fill=GREY, width=4)
            T2(d, (x1 + BRK[0]) / 2, yy - 20, f"fz3/{nm}/status", M(18), GREY, "mm")
    f.el(show(t, 0.3), pubs, dy=dyf(t, 0.3))
    SY = {n: (y0 + 40) for n, _, y0 in [(s[0], s[1], s[2]) for s in SUBS]}
    def subs(d, dy):
        for nm, tp, y0 in SUBS:
            hit = (ap(t, ct(1) + 0.9, 0.3) * (1 - ap(t, ct(1) + 3.4, 0.5)) if nm in ("Leitstand", "Instandhaltung") else 0)
            hit2 = (ap(t, ct(2) + 4.2, 0.3) * (1 - ap(t, ct(2) + 6.4, 0.5)) if nm in ("Leitstand", "Qualität") else 0)
            h = max(hit, hit2)
            d.line((BRK[2], 265 + dy, 890, 265 + dy), fill=GREY, width=4); d.line((890, y0 + 40 + dy, 890, 265 + dy), fill=GREY, width=4); d.line((890, y0 + 40 + dy, 980, y0 + 40 + dy), fill=GREY, width=4)
            d.rounded_rectangle((980, y0 + dy, 1220, y0 + 80 + dy), 12, fill=mix(WHITE, LIGHTG, h), outline=mix(LINE, GREEN, h), width=3 if h > 0.5 else 2)
            T2(d, 1000, y0 + 24 + dy, nm, F(24, 700), DARK, "lm"); T2(d, 1000, y0 + 54 + dy, tp, M(19, True), mix(GREY, GREEN, h), "lm")
    f.el(show(t, ct(1) - 0.3), subs, dy=dyf(t, ct(1) - 0.3))
    # Nachrichten als Punkte
    def msgs(d, dy):
        p1 = (ct(0) + 1.4, 1.0); pD = [(290, 195), (480, 195)]
        dot(d, pD, clamp((t - ct(0) - 1.4) / 0.9))
        for nm, y0 in (("Leitstand", 120), ("Instandhaltung", 230)):
            pts = [(BRK[2], 265), (890, 265), (890, y0 + 40), (980, y0 + 40)]
            dot(d, pts, clamp((t - ct(1) - 0.2) / 0.8))
        pM = [(290, 335), (480, 335)]; dot(d, pM, clamp((t - ct(2) - 3.0) / 0.9))
        for y0 in (120, 340):
            pts = [(BRK[2], 265), (890, 265), (890, y0 + 40), (980, y0 + 40)]; dot(d, pts, clamp((t - ct(2) - 4.0) / 0.8))
    f.el(1.0, msgs)
    f.el(show(t, ct(1) + 1.3, ct(2) + 2.8), lambda d, dy: T2(d, 1100, 432 + dy, "Qualität: kein Treffer", F(20, 600), GREY, "mm"), dy=dyf(t, ct(1) + 1.3))
    def wild(d, dy):
        for x, sym, tp, txt in ((60, "+", "fz3/+/status", "genau eine Ebene: alle Maschinen"), (660, "#", "fz3/D2/#", "alles darunter: alles von D2")):
            card(d, x, 452 + dy, 560, 96); T2(d, x + 40, 500 + dy, sym, F(60, 700), RED, "mm")
            T2(d, x + 84, 480 + dy, tp, M(22, True), DARK, "lm"); T2(d, x + 84, 518 + dy, txt, F(22, 600), GREY, "lm")
    f.el(show(t, ct(2) + 0.1), wild, dy=dyf(t, ct(2) + 0.1))
    def pp(d, dy):
        for x, tt, col, sub, tin in ((60, "HTTP: Pull", BLUE, "du fragst, wenn du etwas wissen willst", ct(3) + 0.1), (660, "MQTT: Push", RED, "du bekommst Bescheid, sobald sich etwas ändert", ct(3) + 2.4)):
            a = ap(t, tin, 0.4)
            if a > 0:
                d.rounded_rectangle((x, 568 + dy, x + 560, 662 + dy), 14, fill=mix(WHITE, LIGHTB if col == BLUE else LIGHTR, a), outline=mix(WHITE, col, a), width=2)
                T2(d, x + 24, 590 + dy, tt, F(30, 700), mix(WHITE, col, a), "lm"); T2(d, x + 24, 630 + dy, sub, F(21, 600), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.1), pp, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 6 Industrie 4.0, IT und OT
def sc6(f, t, ct):
    heading(f, t, "Industrie 4.0: Maschinen im Netz")
    def band(d, dy):
        card(d, 60, 112 + dy, 1160, 112)
        T2(d, 92, 126 + dy, "Industrie 4.0", F(34, 700), RED, "la")
        x = 380
        for k, (s, col, fill) in enumerate((("vernetzte Maschinen", DARK, LIGHTK), ("Daten", GREEN, LIGHTG), ("Auswertung", BLUE, LIGHTB))):
            w = int(F(26, 700).getlength(s) + 44); a = ap(t, ct(0) + 0.8 + 0.9 * k, 0.4)
            if a > 0:
                chip(d, x, 138 + dy, w, 56, s, mix(WHITE, fill, a), mix(WHITE, col, a), 26)
                if k < 2: arrow(d, x + w + 8, 166 + dy, x + w + 44, 166 + dy, GREY, 4, 12)
            x += w + 54
        T2(d, 92, 176 + dy, "statt Zettel und Handarbeit", F(22, 600), GREY, "la")
    f.el(show(t, 0.3), band, dy=dyf(t, 0.3))
    def itot(d, dy):
        card(d, 60, 244 + dy, 480, 250); T2(d, 90, 256 + dy, "IT", F(44, 700), BLUE, "la"); T2(d, 160, 270 + dy, "Büro-Welt", F(26, 700), GREY, "la")
        for k, s in enumerate(("E-Mail", "Büro-PC", "Server")): chip(d, 90 + (k % 2) * 210, 330 + (k // 2) * 70 + dy, 190, 52, s, LIGHTB, BLUE, 24)
        card(d, 740, 244 + dy, 480, 250); T2(d, 770, 256 + dy, "OT", F(44, 700), RED, "la"); T2(d, 840, 270 + dy, "Maschinen-Welt", F(26, 700), GREY, "la")
        for k, s in enumerate(("SPS", "Roboter R1", "D2, F1, M1")): chip(d, 770 + (k % 2) * 210, 330 + (k // 2) * 70 + dy, 190, 52, s, LIGHTR, RED, 24)
        a = ap(t, ct(1) + 2.8, 0.4)
        if a > 0: chip(d, 980, 400 + dy, 210, 52, "OPC UA", mix(WHITE, LIGHTA, a), mix(WHITE, AMB, a), 24)
        w = ap(t, ct(1) + 1.0, 0.5)
        d.line((640, 244 + dy, 640, 494 + dy), fill=mix(BG, RED, w), width=8)
        if w > 0.5: tag(d, 560, 504 + dy, 160, 34, "eigenes Netz", RED, WHITE, 21)
    f.el(show(t, ct(1) + 0.1), itot, dy=dyf(t, ct(1) + 0.1))
    def merk(d, dy):
        card(d, 60, 560 + dy, 1160, 112); T2(d, 90, 572 + dy, "Merke", F(26, 700), RED, "la")
        items = ["Adresse prüfen", "Status prüfen", "Daten auswerten"]; x = 90
        for k, s in enumerate(items):
            a = ap(t, ct(2) + 0.4 + 1.2 * k, 0.4)
            if a > 0:
                d.ellipse((x, 616 + dy, x + 36, 652 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 18, 634 + dy, 20, WHITE, 4)
                w = F(28, 700).getlength(s); T2(d, x + 50, 634 + dy, s, F(28, 700), mix(WHITE, DARK, a), "lm"); x += 50 + w + 70
                if k < 2: arrow(d, x - 58, 634 + dy, x - 18, 634 + dy, GREY, 4, 12)
    f.el(show(t, ct(2) + 0.1), merk, dy=dyf(t, ct(2) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V17 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Netzwerke", F(104, 700), DARK)
        T2(d, 90, 290, "und Industrie 4.0", F(48, 400), GREY)
        cx = 760
        d.rounded_rectangle((cx - 90, 520 - 24, cx + 90, 520 + 24), 10, fill=BOX); T2(d, cx, 520, "Switch", F(26, 700), WHITE, "mm")
        for k, (nm, bad) in enumerate((("D2", 0), ("F1", 0), ("R1", 1), ("M1", 0))):
            x = 450 + k * 180
            d.line([(cx, 496), (cx, 470), (x + 60, 470), (x + 60, 440)], fill=RED if bad else GREY, width=4)
            chip(d, x, 380, 120, 60, nm, LIGHTR if bad else LIGHTG, RED if bad else GREEN, 30, outl=RED if bad else GREEN)
        T2(d, 90, 520, "192.168.30.0/24", M(30), GREY, "lm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
