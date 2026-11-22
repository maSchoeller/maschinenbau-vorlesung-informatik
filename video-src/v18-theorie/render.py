"""V18 Theorie: IT-Sicherheit am Beispiel der Fertigungszelle FZ-3 (Schutzziele, Hash, Signatur, CRA, KI).
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]  (tts/full erst nach Freigabe der Credits; ohne Audio nur text/probe/scan/zeiten)"""
import os, sys, hashlib, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v18-common"))
from h18 import *
from texte import SRC

NAME = "v18-theorie"; LABEL = "DHBW · Informatik · V18 · IT-Sicherheit"
SECS = make_secs(SRC)

H1450 = hashlib.sha256(b"Drehzahl 1450").hexdigest(); H1451 = hashlib.sha256(b"Drehzahl 1451").hexdigest()
assert H1450.startswith("23f2ab28ad6cc6b5") and H1451.startswith("2318b47cd742ca40")
BITS = bin(int(H1450, 16) ^ int(H1451, 16)).count("1")
assert 100 < BITS < 156

# ---------------------------------------------------------------- 1 Schutzziele
def sc1(f, t, ct):
    heading(f, t, "Schutzziele an der Zelle FZ-3")
    def zelle(d, dy):
        card(d, 60, 112 + dy, 1160, 116, stripe=False); T2(d, 88, 124 + dy, "Fertigungszelle FZ-3", F(26, 700), DARK, "la")
        for k, (nm, bad) in enumerate((("D2", 0), ("F1", 0), ("R1", 1), ("M1", 0), ("SPS", 0))):
            chip(d, 88 + k * 100, 166 + dy, 90, 46, nm, LIGHTR if bad else LIGHTG, RED if bad else GREEN, 24, outl=RED if bad else GREEN)
        arrow(d, 620, 190 + dy, 700, 190 + dy, GREY, 5, 15)
        chip(d, 716, 150 + dy, 270, 66, "USB-Stick", LIGHTA, AMB, 28); chip(d, 1000, 150 + dy, 190, 66, "Firmware 3.2.1", LIGHTA, AMB, 22)
    f.el(show(t, 0.3), zelle, dy=dyf(t, 0.3))
    cards = [(ct(1) + 1.0, "Vertraulichkeit", ["Nur Berechtigte sehen", "die NC-Programme"], LIGHTB, BLUE),
             (ct(1) + 5.0, "Integrität", ["Nichts wird unbemerkt", "verändert, auch die", "Firmware nicht"], LIGHTR, RED),
             (ct(1) + 9.0, "Verfügbarkeit", ["Die Zelle läuft,", "wenn man sie braucht"], LIGHTG, GREEN),
             (ct(2) + 0.3, "Authentizität", ["Stammt die Datei", "vom Hersteller?"], LIGHTA, AMB)]
    for k, (te, ti, lines, fill, col) in enumerate(cards):
        def fn(d, dy, k=k, ti=ti, lines=lines, fill=fill, col=col):
            x = 60 + k * 295; card(d, x, 262 + dy, 275, 280, stripe=False)
            chip(d, x + 14, 276 + dy, 247, 56, ti, fill, col, 25, outl=col)
            for j, ln in enumerate(lines): T2(d, x + 24, 360 + j * 36 + dy, ln, F(23, 600), DARK, "la")
        f.el(show(t, te), fn, dy=dyf(t, te))
    f.el(show(t, ct(2) + 1.5), lambda d, dy: tag(d, 60, 580 + dy, 1160, 56, "Die Prüfsumme der Firmware prüft Integrität und Authentizität", LIGHTK, DARK, 26, outl=LINE), dy=dyf(t, ct(2) + 1.5))

# ---------------------------------------------------------------- 2 IT, OT, Security, Safety
def sc2(f, t, ct):
    heading(f, t, "Büro-IT und Produktion, Security und Safety")
    def col(d, dy, x, titel, prios, fcol, fill):
        card(d, x, 112 + dy, 560, 250, stripe=False); chip(d, x + 16, 126 + dy, 528, 50, titel, fill, fcol, 28, outl=fcol)
        for j, (n, s) in enumerate(prios): T2(d, x + 30, 200 + j * 44 + dy, f"{n}  {s}", F(26, 700), DARK, "la")
    f.el(show(t, 0.3), lambda d, dy: col(d, dy, 60, "Büro-IT", [("1", "Vertraulichkeit"), ("2", "Integrität"), ("3", "Verfügbarkeit")], BLUE, LIGHTB), dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 2.0), lambda d, dy: col(d, dy, 660, "Produktion (OT)", [("1", "Verfügbarkeit"), ("1", "Sicherheit von Menschen"), ("2", "Integrität, Vertraulichkeit")], RED, LIGHTR), dy=dyf(t, ct(0) + 2.0))
    def alter(d, dy):
        d.rounded_rectangle((690, 322 + dy, 1190, 354 + dy), 16, fill=LIGHTA); T2(d, 940, 338 + dy, "Anlage läuft 15 bis 25 Jahre: kein Patch mal eben", F(21, 700), AMB, "mm")
    f.el(show(t, ct(1) + 0.3), alter, dy=dyf(t, ct(1) + 0.3))
    def box(d, dy, x, titel, sub, bsp, fill, c):
        card(d, x, 394 + dy, 560, 250, stripe=False); chip(d, x + 16, 408 + dy, 528, 56, titel, fill, c, 30, outl=c)
        T2(d, x + 30, 490 + dy, sub, F(26, 600), DARK, "la"); T2(d, x + 30, 560 + dy, bsp, F(30, 700), c, "la")
    f.el(show(t, ct(2) + 0.3), lambda d, dy: box(d, dy, 60, "Security", "Schutz vor Angriffen", "Beispiel: Firewall", LIGHTB, BLUE), dy=dyf(t, ct(2) + 0.3))
    f.el(show(t, ct(2) + 2.8), lambda d, dy: box(d, dy, 660, "Safety", "Schutz von Menschen vor Unfällen", "Beispiel: Lichtgitter", LIGHTR, RED), dy=dyf(t, ct(2) + 2.8))

# ---------------------------------------------------------------- 3 Hash
def hexrow(d, x, y, s, other, t0, t, n=16, size=28, col=DARK):
    fm = M(size, True); cw = fm.getlength("0"); on = ap(t, t0, 0.5) > 0.5
    for i, ch in enumerate(s[:n]): T2(d, x + i * cw, y, ch, fm, RED if (on and ch != other[i]) else col, "lm")
    T2(d, x + n * cw + 4, y, "…", fm, GREY, "lm")
def sc3(f, t, ct):
    heading(f, t, "Hash: ein Fingerabdruck für Daten")
    def zeile(d, dy, y, inp, h, other, tin, tdiff):
        a = ap(t, tin, 0.4)
        chip(d, 60, y + dy, 300, 60, inp, LIGHTA, AMB, 26, mono=True)
        arrow(d, 372, y + 30 + dy, 424, y + 30 + dy, GREY, 5, 15)
        d.rounded_rectangle((436, y + dy, 640, y + 60 + dy), 12, fill=DARK); T2(d, 538, y + 30 + dy, "SHA-256", F(28, 700), WHITE, "mm")
        arrow(d, 652, y + 30 + dy, 704, y + 30 + dy, GREY, 5, 15)
        d.rounded_rectangle((716, y + dy, 1220, y + 60 + dy), 12, fill=BOX); hexrow(d, 736, y + 30 + dy, h, other, tdiff, t, 16, 26, CODE_T)
    f.el(show(t, ct(0) + 0.3), lambda d, dy: zeile(d, dy, 120, "Drehzahl 1450", H1450, H1451, 0, ct(2)), dy=dyf(t, ct(0) + 0.3))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: zeile(d, dy, 206, "Drehzahl 1451", H1451, H1450, 0, ct(2)), dy=dyf(t, ct(1) + 0.3))
    def k64(d, dy):
        card(d, 60, 310 + dy, 370, 150, stripe=False); T2(d, 86, 322 + dy, "feste Länge", F(24, 700), DARK, "la")
        T2(d, 86, 362 + dy, "64", F(52, 700), RED, "la"); T2(d, 160, 380 + dy, "Hex-Zeichen", F(26, 700), DARK, "la"); T2(d, 86, 424 + dy, "= 256 bit", F(28, 700), GREEN, "la")
    f.el(show(t, ct(0) + 0.5), k64, dy=dyf(t, ct(0) + 0.5))
    def klaw(d, dy):
        card(d, 460, 310 + dy, 760, 150); T2(d, 488, 322 + dy, "Lawineneffekt", F(26, 700), DARK, "la")
        a = ap(t, ct(2) + 1.0, 0.5)
        T2(d, 488, 366 + dy, f"{BITS}", F(52, 700), mix(WHITE, RED, a), "la"); T2(d, 580, 384 + dy, "von 256 Bit anders (etwa die Hälfte)", F(26, 700), mix(WHITE, DARK, a), "la")
        T2(d, 488, 428 + dy, "ein Zeichen Unterschied, ganz anderer Fingerabdruck", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.3), klaw, dy=dyf(t, ct(2) + 0.3))
    items = [(ct(3) + 0.3, "nicht zurückrechenbar", LIGHTB, BLUE), (ct(3) + 1.5, "praktisch keine Kollision", LIGHTB, BLUE), (ct(3) + 2.7, "MD5, SHA-1: gebrochen", LIGHTR, RED), (ct(3) + 4.0, "Nimm SHA-256", LIGHTG, GREEN)]
    for k, (te, s, fill, c) in enumerate(items):
        f.el(show(t, te), lambda d, dy, k=k, s=s, fill=fill, c=c: chip(d, 60 + (k % 2) * 590, 500 + (k // 2) * 80 + dy, 570, 60, s, fill, c, 26, outl=c), dy=dyf(t, te))

# ---------------------------------------------------------------- 4 Pruefsumme oder Signatur
def sc4(f, t, ct):
    heading(f, t, "Prüfsumme oder Signatur?")
    rows = [(ct(0) + 0.2, "1", "Stick defekt", "Übertragungsfehler", "Prüfsumme erkennt es", LIGHTG, GREEN),
            (ct(1) + 0.2, "2", "Nur die Datei getauscht", "Soll-Wert über zweiten Weg (Herstellerseite)", "erkannt mit zweitem Weg", LIGHTG, GREEN),
            (ct(2) + 0.2, "3", "Datei und Prüfsumme getauscht", "z. B. gehackter Download-Server", "Prüfsumme nutzlos", LIGHTR, RED)]
    for k, (te, n, titel, sub, res, fill, c) in enumerate(rows):
        def fn(d, dy, k=k, n=n, titel=titel, sub=sub, res=res, fill=fill, c=c):
            y = 112 + k * 96; card(d, 60, y + dy, 1160, 86, stripe=False)
            d.ellipse((80, y + 20 + dy, 128, y + 68 + dy), fill=DARK); T2(d, 104, y + 44 + dy, n, F(28, 700), WHITE, "mm")
            T2(d, 152, y + 14 + dy, titel, F(28, 700), DARK, "la"); T2(d, 152, y + 52 + dy, sub, F(21, 600), GREY, "la")
            chip(d, 850, y + 14 + dy, 350, 58, res, fill, c, 24, outl=c)
        f.el(show(t, te), fn, dy=dyf(t, te))
    boxes = [(ct(2) + 0.8, "Hersteller", "signiert mit privatem Schlüssel", LIGHTB, BLUE), (ct(2) + 3.2, "Signatur", "gehört zur Datei", LIGHTA, AMB),
             (ct(2) + 5.6, "Gerät", "prüft mit öffentlichem Schlüssel", LIGHTB, BLUE), (ct(3) + 0.3, "Secure Boot", "nur signierte Firmware startet", LIGHTG, GREEN)]
    for k, (te, ti, sub, fill, c) in enumerate(boxes):
        def fn(d, dy, k=k, ti=ti, sub=sub, fill=fill, c=c):
            x = 60 + k * 300
            d.rounded_rectangle((x, 440 + dy, x + 260, 600 + dy), 14, fill=fill, outline=c, width=3)
            T2(d, x + 130, 480 + dy, ti, F(30, 700), c, "mm")
            sz = 20
            while F(sz, 600).getlength(sub) > 240: sz -= 1
            T2(d, x + 130, 540 + dy, sub, F(sz, 600), DARK, "mm")
            if k < 3: arrow(d, x + 266, 520 + dy, x + 294, 520 + dy, GREY, 4, 12)
        f.el(show(t, te), fn, dy=dyf(t, te))

# ---------------------------------------------------------------- 5 CRA
def mon(y, m, dd): return (y - 2024) * 12 + (m - 12) + (dd - 10) / 30.0
X0, X1 = 90, 1190
def tx(y, m, dd): return X0 + (X1 - X0) * mon(y, m, dd) / mon(2027, 12, 11)
def sc5(f, t, ct):
    heading(f, t, "Cyber Resilience Act: der Zeitstrahl")
    f.el(show(t, 0.3), lambda d, dy: tag(d, 60, 108 + dy, 1160, 44, "CRA = Verordnung (EU) 2024/2847 für Produkte mit digitalen Elementen", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, 0.3))
    AY = 268
    def axis(d, dy):
        d.line((X0, AY + dy, X1, AY + dy), fill=LINE, width=8)
        hx = tx(2026, 11, 22); a = ap(t, ct(1) + 0.2, 1.5)
        d.line((X0, AY + dy, X0 + (hx - X0) * a, AY + dy), fill=GREEN, width=8)
    f.el(show(t, 0.5), axis, dy=dyf(t, 0.5))
    # (zeit, x, Datum, Text, Ebene oben/unten1/unten2, Farbe, Anker)
    marks = [(ct(1) + 0.3, tx(2024, 12, 10), "10.12.2024", "in Kraft", "o", GREEN, "la"),
             (ct(1) + 3.0, tx(2026, 9, 11), "11.09.2026", "Meldepflicht: 24 h / 72 h", "o", RED, "ma"),
             (ct(1) + 5.5, tx(2027, 12, 11), "11.12.2027", "gilt vollständig", "o", GREEN, "ra"),
             (ct(1) + 0.3, tx(2026, 11, 22), "22.11.2026", "heute", "u1", DARK, "rr"),
             (ct(3) + 0.3, tx(2027, 1, 14), "14.01.2027", "Maschinenverordnung", "u2", AMB, "ma")]
    for te, x, dat, txt, lv, c, anc in marks:
        def fn(d, dy, x=x, dat=dat, txt=txt, lv=lv, c=c, anc=anc):
            d.ellipse((x - 11, AY - 11 + dy, x + 11, AY + 11 + dy), fill=c, outline=WHITE, width=3)
            if lv == "o":
                d.line((x, AY - 12 + dy, x, 232 + dy), fill=c, width=3); yy = 164
            elif lv == "u1":
                d.line((x, AY + 12 + dy, x, 296 + dy), fill=c, width=3); yy = 300
            else:
                d.line((x, AY + 12 + dy, x, 356 + dy), fill=c, width=3); yy = 360
            xx = {"la": x - 30, "ma": x, "ra": x + 30, "rr": x + 14}[anc]
            T2(d, xx, yy + dy, dat, F(26, 700), c, anc[0] + "a"); T2(d, xx, yy + 32 + dy, txt, F(22, 600), DARK, anc[0] + "a")
        f.el(show(t, te), fn, dy=dyf(t, te))
    items = [(ct(2) + 0.3, "sichere Voreinstellungen"), (ct(2) + 1.8, "Sicherheitsupdates"), (ct(2) + 3.3, "Schutz vor Manipulation")]
    def pf(d, dy):
        card(d, 60, 440 + dy, 1160, 130, stripe=False); T2(d, 88, 450 + dy, "Hersteller müssen liefern", F(26, 700), DARK, "la")
        for k, (te, s) in enumerate(items):
            a = ap(t, te, 0.4)
            if a > 0: chip(d, 88 + k * 376, 494 + dy, 360, 58, s, mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 24, outl=mix(WHITE, GREEN, a))
    f.el(show(t, ct(2) + 0.1), pf, dy=dyf(t, ct(2) + 0.1))
    f.el(show(t, ct(3) + 2.0), lambda d, dy: tag(d, 60, 600 + dy, 1160, 56, "Keine Rechtsberatung: im Betrieb fragt man die Produkt-Compliance", LIGHTA, AMB, 26, outl=AMB), dy=dyf(t, ct(3) + 2.0))

# ---------------------------------------------------------------- 6 KI
def sc6(f, t, ct):
    heading(f, t, "KI und vertrauliche Daten")
    def prompt(d, dy):
        d.rounded_rectangle((60, 108 + dy, 640, 156 + dy), 24, fill=LIGHTK, outline=LINE); T2(d, 90, 132 + dy, "Prompt im KI-Chat", F(24, 700), DARK, "lm")
        arrow(d, 656, 132 + dy, 716, 132 + dy, GREY, 5, 15); chip(d, 730, 108 + dy, 490, 48, "Server des Anbieters", LIGHTA, AMB, 24, outl=AMB)
    f.el(show(t, 0.3), prompt, dy=dyf(t, 0.3))
    def col(d, dy, x, titel, fill, c, items, ok, t0):
        card(d, x, 186 + dy, 560, 240, stripe=False); chip(d, x + 16, 200 + dy, 528, 50, titel, fill, c, 28, outl=c)
        for k, s in enumerate(items):
            a = ap(t, t0 + 1.4 * k, 0.4)
            if a > 0:
                y = 276 + k * 50; badge(d, x + 44, y + 16 + dy, 15, ok); T2(d, x + 72, y + 16 + dy, s, F(24, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(1) + 0.2), lambda d, dy: col(d, dy, 60, "Nicht in den Prompt", LIGHTR, RED, ["Personenbezogene Daten", "Geschäftsgeheimnisse (NC-Programme)", "Zugangsdaten (Passwörter)"], False, ct(1) + 0.5), dy=dyf(t, ct(1) + 0.2))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: col(d, dy, 660, "Besser", LIGHTG, GREEN, ["Freigegebene Werkzeuge nutzen", "Platzhalter statt echter Werte"], True, ct(2) + 0.5), dy=dyf(t, ct(2) + 0.2))
    f.el(show(t, ct(2) + 3.5), lambda d, dy: tag(d, 60, 452 + dy, 1160, 60, "Faustregel: Würde ich das einer Fremden per E-Mail schicken?", LIGHTB, BLUE, 28, outl=BLUE), dy=dyf(t, ct(2) + 3.5))
    def merk(d, dy):
        card(d, 60, 536 + dy, 1160, 146); T2(d, 90, 546 + dy, "Merke", F(26, 700), RED, "la")
        items = ["Soll-Wert über zweiten Weg", "Signatur gegen Austausch", "nichts Vertrauliches in den Prompt"]; pos = [(90, 594), (650, 594), (90, 638)]
        for k, s in enumerate(items):
            a = ap(t, ct(3) + 0.3 + 1.2 * k, 0.4)
            if a > 0:
                x, y = pos[k]; d.ellipse((x, y + dy, x + 30, y + 30 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 15, y + 15 + dy, 17, WHITE, 4)
                T2(d, x + 42, y + 15 + dy, s, F(26, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.1), merk, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V18 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "IT-Sicherheit", F(104, 700), DARK)
        T2(d, 90, 290, "Hash, Signatur und CRA an der Fertigungszelle FZ-3", F(44, 400), GREY)
        for k, (s, fill, c) in enumerate((("Vertraulichkeit", LIGHTB, BLUE), ("Integrität", LIGHTR, RED), ("Verfügbarkeit", LIGHTG, GREEN), ("Authentizität", LIGHTA, AMB))):
            chip(d, 90 + (k % 2) * 330, 400 + (k // 2) * 76, 310, 60, s, fill, c, 26, outl=c)
        d.rounded_rectangle((780, 400, 1200, 536), 14, fill=BOX)
        T2(d, 806, 436, "SHA-256", F(22, 600), CODE_C, "lm"); T2(d, 806, 480, H1450[:16], M(30, True), CODE_T, "lm"); T2(d, 806, 516, H1451[:16], M(30, True), CODE_R, "lm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
