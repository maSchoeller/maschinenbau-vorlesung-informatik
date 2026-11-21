"""V05 Vorgerechnet: Werkstoffvorschlag fuer eine Welle (Code exakt aus briefing/v05-beispiel.py).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from ns import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-beispiel"; LABEL = "DHBW · Informatik · V05 · Werkstoffvorschlag für eine Welle"

W16 = "[[16Mo3|sechzehn M O drei]]"; WS235 = "[[S235JR|S zweihundertfünfunddreißig J R]]"
WC45 = "[[C45E|C fünfundvierzig E]]"; W42 = "[[42CrMo4|zweiundvierzig C R M O vier]]"

SRC = [
 ["Die Aufgabe: ein Werkstoff für eine Welle, aus Spannung in MPa und Temperatur in °C.",
  "Wichtig vorab: Das ist eine vereinfachte Lehr-Regel, keine Normauslegung.",
  "Unsere Regel: Heiß braucht warmfesten Stahl, sonst entscheidet die Spannung, und Unsinn wird abgewiesen.",
  "Wir zeichnen zuerst das Struktogramm und gehen dann den Code durch."],
 ["Zuerst zwei Eingaben: Spannung und Temperatur.",
  "Dann die Plausibilitätsprüfung: Nur mögliche Werte kommen durch, sonst folgt eine Meldung.",
  f"Sonst: Über 300 °C ein warmfester Stahl, bis 200 MPa der {W16}, darüber ein Sonderwerkstoff.",
  f"Bei höchstens 300 °C wählt eine Mehrfachauswahl nach der Spannung: {WS235}, {WC45} oder {W42}.",
  "Zum Schluss die Ausgabe."],
 ["Jetzt der Code: Die Zeilen 1 bis 3 sind Kommentare.",
  "Die Zeilen 5 und 6 sind die Eingaben: `input` liest Text, `float` macht eine Kommazahl daraus."],
 ["Zeile 8 ist die erste Verzweigung: `or` verknüpft drei Bedingungen, eine wahre genügt.",
  "Zeile 9 ist die Meldung: der ja-Zweig.",
  "Mit `else` in Zeile 10 beginnt der nein-Zweig: Alles Eingerückte läuft nur bei plausiblen Eingaben."],
 ["Zeile 11 fragt nach über 300 °C und ist eingerückt, weil sie im nein-Zweig steckt.",
  f"Bei ja prüft Zeile 12 die Spannung: bis 200 MPa {W16} in Zeile 13, sonst ein Sonderwerkstoff."],
 ["Das `else` in Zeile 16 gehört zu Zeile 11: bis 300 °C.",
  f"Eine Kette aus `if`, `elif` und `else` prüft die Spannung: bis 140 {WS235}, bis 220 {WC45}, sonst {W42}.",
  "`elif` heißt: sonst, wenn. So entsteht die Mehrfachauswahl."],
 ["Zeile 23 gibt den Werkstoff aus, eingerückt wie im Struktogramm.",
  f"Probelauf eins: 180 MPa bei 20 °C ergibt {WC45}.",
  f"Probelauf zwei: 250 MPa bei 20 °C ergibt {W42}, vergütet."],
 [f"Probelauf drei: 150 MPa bei 400 °C ergibt {W16}, warmfest.",
  "Probelauf vier: -5 MPa. Unmöglich, also nur die Meldung.",
  "Vier Läufe, vier Wege, vier Testfälle.",
  "Nochmals: vereinfachte Lehr-Regel, keine Normauslegung."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung (exakt briefing/v05-beispiel.py)
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v05-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 23 and CODE[4].startswith("spannung = float") and CODE[22].lstrip().startswith("print(\"Empfohlener")
SRCTEXT = "\n".join(CODE)
LAEUFE = [(("180", "20"), "C45E"), (("250", "20"), "42CrMo4 (vergütet)"), (("150", "400"), "16Mo3 (warmfest)"), (("-5", "20"), None)]
KON = []
for ein, erw in LAEUFE:
    out = run_in(SRCTEXT, ein)
    assert len(out) == 3
    assert out[2] == ("Empfohlener Werkstoff: " + erw if erw else "Eingabe unplausibel - bitte Werte prüfen"), out
    KON.append(out)
assert KON[0] == ["Maximale Spannung in MPa: 180", "Betriebstemperatur in °C: 20", "Empfohlener Werkstoff: C45E"]
# Grenzen der Regel: 300 gehoert zum kalten Zweig, 200 zum 16Mo3, 140/220 jeweils zur unteren Klasse
assert run_in(SRCTEXT, ("140", "20"))[2].endswith("S235JR") and run_in(SRCTEXT, ("220", "20"))[2].endswith("C45E")
assert run_in(SRCTEXT, ("200", "301"))[2].endswith("16Mo3 (warmfest)") and run_in(SRCTEXT, ("100", "300"))[2].endswith("S235JR")
fit_check(CODE, M(14), 672 - 56 - 14, "Code")

# ---------------------------------------------------------------- Struktogramm
def DIAG():
    sw = SW("spannung ?", [("≤ 140", [A("S235JR", "s1")], "l1"), ("≤ 220", [A("C45E", "s2")], "l2"),
                           ("sonst", [A("42CrMo4\n(vergütet)", "s3")], "l3")], key="sw1", wts=[1, 1, 1.25])
    if3 = IF("spannung\n≤ 200 ?", [A("16Mo3\n(warmfest)", "w16")], [A("Sonder-\nwerkstoff", "wson")], key="if3")
    if2 = IF("temperatur > 300 ?", [if3], [sw], key="if2", split=0.44)
    return [A("Eingabe: spannung in MPa", "ein1"), A("Eingabe: temperatur in °C", "ein2"),
            IF("spannung ≤ 0  oder  temperatur < −50\noder  temperatur > 600", [A("Ausgabe:\nEingabe\nunplausibel", "meld")],
               [if2, A("Ausgabe: Empfohlener Werkstoff: werkstoff", "aus")], key="if1", split=0.3)]

# Zuordnung Struktogramm-Block <-> Codezeilen (0-basiert)
GREYC = (120, 130, 150)
BIND = {
    "ein": (["ein1", "ein2"], [4, 5], PAL[0]),
    "if1": (["if1"], [7], PAL[1]), "meld": (["meld"], [8], PAL[2]), "else1": ([], [9], PAL[4]),
    "if2": (["if2"], [10], PAL[1]), "if3": (["if3"], [11], PAL[5]), "w16": (["w16"], [12], PAL[2]), "wson": (["wson"], [14], PAL[3]),
    "else2": ([], [15], PAL[4]),
    "c1": (["l1", "s1"], [16, 17], PAL[0]), "c2": (["l2", "s2"], [18, 19], PAL[1]), "c3": (["l3", "s3"], [20, 21], PAL[2]),
    "aus": (["aus"], [22], PAL[3]),
}
def binds(names):
    keys = {}; lines = {}
    for n in names:
        ks, ls, col = BIND[n]
        for k in ks: keys[k] = col
        for l in ls: lines[l] = col
    return keys, lines

CX, CW, CSZ, CLH, CY = 16, 672, 14, 21, 100
DX, DW = 706, 546
NSX = lambda **kw: NS(fs=14, pv=5, **kw)
def code_view(f, t, cols, active=None):
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_c(d, CX, CY + dy, CW, CODE, [-1] * len(CODE), t, CSZ, CLH, cols, active, off=56))

def diag_view(f, t, hl=None):
    ns = NSX(fill=hl_fill(hl or {}))
    f.el(ap(t, 0.0, 0.3), lambda d, dy: ns.draw(d, DIAG(), DX, CY + dy, DW))

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Werkstoff für eine Welle")
    def shaft(d, dy):
        y = 330 + dy
        d.rectangle((90, y - 40, 300, y + 40), fill=(205, 210, 218), outline=DARK, width=3)
        d.rectangle((300, y - 56, 420, y + 56), fill=(184, 190, 200), outline=DARK, width=3)
        d.rectangle((420, y - 40, 640, y + 40), fill=(205, 210, 218), outline=DARK, width=3)
        for xx in (150, 560):
            d.polygon([(xx - 34, y + 56), (xx + 34, y + 56), (xx + 50, y + 100), (xx - 50, y + 100)], fill=GREY)
            d.rectangle((xx - 50, y + 100, xx + 50, y + 108), fill=DARK)
        T2(d, 365, y + 128, "Welle", F(30, 700), DARK, "mm")
        arrow(d, 365, y - 130, 365, y - 62, RED, 5, 16); T2(d, 365, y - 150, "Last", F(26, 700), RED, "mm")
    f.el(ap(t, ct(0) + 0.3, 0.5), shaft, dy=int((1 - ap(t, ct(0) + 0.3, 0.5)) * 12))
    def eing(d, dy):
        card(d, 720, 130 + dy, 500, 150)
        T2(d, 752, 142 + dy, "Eingaben", F(28, 700), DARK)
        T2(d, 752, 188 + dy, "größte Spannung in MPa", F(30, 400), DARK)
        T2(d, 752, 232 + dy, "Betriebstemperatur in °C", F(30, 400), DARK)
    f.el(ap(t, ct(0) + 2.0, 0.5), eing, dy=int((1 - ap(t, ct(0) + 2.0, 0.5)) * 12))
    def ausg(d, dy):
        arrow(d, 970, 292 + dy, 970, 338 + dy, DARK, 4, 14)
        card(d, 720, 346 + dy, 500, 90, stripe=True)
        T2(d, 752, 358 + dy, "Ausgabe", F(28, 700), DARK); T2(d, 752, 396 + dy, "Werkstoffvorschlag oder Meldung", F(26, 400), DARK)
    f.el(ap(t, ct(0) + 5.0, 0.5), ausg, dy=int((1 - ap(t, ct(0) + 5.0, 0.5)) * 12))
    pill(f, t, ct(1) + 0.4, 90, 500, 1130, "Vereinfachte Lehr-Regel, keine Normauslegung", AMBER, 60, 32)
    note(f, t, ct(2) + 0.2, 90, 586, 1130, 90, "Unsere Regel", ["hohe Temperatur: warmfester Stahl, sonst entscheidet die Spannung; unsinnige Eingaben werden abgewiesen"], DARK, bsz=24)

# ---------------------------------------------------------------- 2 Struktogramm zeichnen
def sc2(f, t, ct):
    heading(f, t, "Zuerst das Struktogramm")
    tm = {"ein1": ct(0) + 0.3, "ein2": ct(0) + 2.2, "if1": ct(1) + 0.3, "meld": ct(1) + 4.2,
          "if2": ct(2) + 0.3, "if3": ct(2) + 3.0, "w16": ct(2) + 5.2, "wson": ct(2) + 7.4,
          "sw1": ct(3) + 0.3, "l1": ct(3) + 2.2, "s1": ct(3) + 2.7, "l2": ct(3) + 3.8, "s2": ct(3) + 4.3, "l3": ct(3) + 5.4, "s3": ct(3) + 5.9,
          "aus": ct(4) + 0.3}
    ns = NS(fs=21, pv=8, vis=reveal(t, tm))
    f.el(ap(t, 0.0, 0.3), lambda d, dy: ns.draw(d, DIAG(), 90, 108 + dy, 1100))
    note(f, t, ct(4) + 1.8, 90, 606, 1100, 70, "Lesehilfe", ["In den Werkstoff-Blöcken wird die Variable werkstoff auf den genannten Wert gesetzt."], DARK, bsz=22)

# ---------------------------------------------------------------- 3 Eingaben
def sc3(f, t, ct):
    heading(f, t, "Abschnitt 1: Kommentare und Eingaben")
    keys, lines = binds(["ein"])
    if t < ct(1) - 0.2:
        code_view(f, t, {0: GREYC, 1: GREYC, 2: GREYC}, {0, 1, 2}); diag_view(f, t, {})
        note(f, t, ct(0) + 2.0, DX, 540, DW, 110, "Kommentar", ["beginnt mit #", "wird von Python nicht ausgeführt"], DARK)
    else:
        code_view(f, t, lines, {4, 5}); diag_view(f, t, keys)
        note(f, t, ct(1) + 3.0, DX, 540, DW, 110, "Eine Anweisung, eine Zeile", ["zwei Blöcke im Diagramm", "zwei Zeilen im Code"], GREEN)

# ---------------------------------------------------------------- 4 Plausibilitaet
def sc4(f, t, ct):
    heading(f, t, "Abschnitt 2: Eingabe prüfen")
    if t < ct(1) - 0.2: names, act = ["if1"], {7}
    elif t < ct(2) - 0.2: names, act = ["if1", "meld"], {8}
    else: names, act = ["if1", "meld", "else1"], set(range(9, 23))
    keys, lines = binds(names)
    code_view(f, t, lines, act)
    if t > ct(2) - 0.2: keys["if2"] = PAL[4]; keys["aus"] = PAL[4]
    diag_view(f, t, keys)
    note(f, t, ct(0) + 2.0, DX, 540, DW, 110, "or", ["eine wahre Bedingung genügt:", "spannung ≤ 0, zu kalt oder zu heiß"], DARK, tout=ct(1) - 0.2)
    note(f, t, ct(2) + 3.0, DX, 540, DW, 110, "Einrückung", ["vier Leerzeichen weiter rechts unter else:", "gehört zum nein-Zweig"], PAL[4])

# ---------------------------------------------------------------- 5 Temperatur ueber 300
def sc5(f, t, ct):
    heading(f, t, "Abschnitt 3: ist es heiß?")
    names = ["if2"] + (["if3"] if t > ct(1) - 0.2 else []) + (["w16"] if t > ct(1) + 3.4 else []) + (["wson"] if t > ct(1) + 6.6 else [])
    keys, lines = binds(names)
    act = {10} if t < ct(1) else ({11} if t < ct(1) + 3.4 else ({12} if t < ct(1) + 6.6 else {14}))
    code_view(f, t, lines, act)
    diag_view(f, t, keys)
    note(f, t, ct(0) + 3.5, DX, 540, DW, 110, "Zwei Ebenen", ["if in if: jede Ebene", "ist ein Einrückschritt mehr"], PAL[5])

# ---------------------------------------------------------------- 6 Mehrfachauswahl
def sc6(f, t, ct):
    heading(f, t, "Abschnitt 4: Kette aus if, elif, else")
    names = ["else2"] + (["c1"] if t > ct(1) + 2.6 else []) + (["c2"] if t > ct(1) + 5.2 else []) + (["c3"] if t > ct(1) + 7.6 else [])
    keys, lines = binds(names)
    if t < ct(1): act = {15}
    elif t < ct(1) + 5.0: act = {16, 17}
    elif t < ct(1) + 7.4: act = {18, 19}
    elif t < ct(2): act = {20, 21}
    elif t < ct(2) + 3.0: act = {18}
    else: act = set(range(16, 22))
    if t > ct(2) + 3.0: keys["sw1"] = (90, 100, 110)
    code_view(f, t, lines, act)
    diag_view(f, t, keys)
    note(f, t, ct(2) + 0.2, DX, 540, DW, 110, "elif = sonst, wenn", ["erste zutreffende Bedingung gewinnt,", "die übrigen Zweige werden übersprungen"], DARK, tout=ct(2) + 3.0)
    note(f, t, ct(2) + 3.4, DX, 540, DW, 110, "Alle setzen werkstoff", ["drei Fälle, eine Variable:", "danach genügt eine einzige Ausgabe"], PAL[3])

# ---------------------------------------------------------------- Probelaeufe
PFAD = [
    (["ein1", "ein2", "if1", "if2", "sw1", "l2", "s2", "aus"], {4, 5, 7, 9, 10, 15, 16, 18, 19, 22}),
    (["ein1", "ein2", "if1", "if2", "sw1", "l3", "s3", "aus"], {4, 5, 7, 9, 10, 15, 16, 18, 20, 21, 22}),
    (["ein1", "ein2", "if1", "if2", "if3", "w16", "aus"], {4, 5, 7, 9, 10, 11, 12, 22}),
    (["ein1", "ein2", "if1", "meld"], {4, 5, 7, 8}),
]
def lauf_view(f, t, k, tstart, title):
    keys = {x: GREEN for x in PFAD[k][0]}; lines = {i: GREEN for i in PFAD[k][1]}
    code_view(f, t, lines, PFAD[k][1])
    diag_view(f, t, keys)
    out = KON[k]
    ents = [(tstart + 0.2, [(out[0], CODE_T)]), (tstart + 1.4, [(out[1], CODE_T)]), (tstart + 2.6, [(out[2], CODE_R if k == 3 else CODE_G)])]
    f.el(ap(t, tstart, 0.3), lambda d, dy: console_panel(d, DX, 500 + dy, DW, 150, ents, t, 16, title=title, lh=26))

def sc7(f, t, ct):
    heading(f, t, "Abschnitt 5: Ausgabe und Probeläufe")
    if t < ct(1) - 0.2:
        keys, lines = binds(["aus"])
        code_view(f, t, lines, {22}); diag_view(f, t, keys)
        note(f, t, ct(0) + 2.5, DX, 540, DW, 110, "Eingerückt wie im Diagramm", ["nur im nein-Zweig der Prüfung:", "bei unplausiblen Eingaben keine Werkstoffzeile"], PAL[3])
    elif t < ct(2) - 0.2: lauf_view(f, t, 0, ct(1) + 1.0, "Probelauf 1: 180 MPa, 20 °C")
    else: lauf_view(f, t, 1, ct(2) + 1.0, "Probelauf 2: 250 MPa, 20 °C")

def sc8(f, t, ct):
    heading(f, t, "Probeläufe und Testfälle")
    if t < ct(1) - 0.2: lauf_view(f, t, 2, ct(0) + 1.0, "Probelauf 3: 150 MPa, 400 °C")
    elif t < ct(2) - 0.2: lauf_view(f, t, 3, ct(1) + 1.0, "Probelauf 4: -5 MPa, 20 °C")
    else:
        code_view(f, t, {}, None)
        hl = {}
        for i, (ks, _) in enumerate(PFAD):
            for k in ks[-2:]: hl[k] = PAL[i]
        diag_view(f, t, hl)
        note(f, t, ct(2) + 0.4, DX, 540, DW, 110, "4 Läufe, 4 Wege", ["jeder Zweig mindestens einmal durchlaufen:", "das sind die Testfälle"], GREEN)
    pill(f, t, ct(3) + 0.2, DX - 20, 650, DW + 20, "Vereinfachte Lehr-Regel, keine Normauslegung", AMBER, 44, 24)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7, 8: sc8}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Werkstoffvorschlag für eine Welle", F(48, 400), GREY)
        code_c(d, 90, 380, 600, CODE[7:12], [-1] * 5, 9, 16, 26, {7: PAL[1], 8: PAL[2], 9: PAL[4]}, None, title="Python", off=56)
        ns = NS(fs=15, pv=6)
        ns.draw(d, [IF("temperatur > 300 ?", [A("16Mo3\n(warmfest)")], [A("C45E")], split=0.5)], 740, 392, 440)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else "full"
    if m == "text": text_modus(SRC)
    elif m == "fake": fake_audio(HERE, SECS)
    elif m == "tts": tts_safe(HERE, SECS)
    else: dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
