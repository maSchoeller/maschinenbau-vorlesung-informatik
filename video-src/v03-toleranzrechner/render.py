"""Vorgerechnet: der Toleranzrechner (Code aus site/lektionen/v03-labor.html, Station a-vorgemacht).
Aufruf: python render.py [text|stills t1 t2..|full|mux]"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "common"))
from core import *
from sprechen import tts, anzeige, sprechfassung, pruefen
from pages import O
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v03-toleranzrechner"; LABEL = "DHBW · Informatik · V03 · Toleranzrechner"

# Ein Quelltext mit Markup: Untertitel = anzeige(), Audio = tts() (Sprechfassung automatisch)
SRC = [
 ["Aufgabe: Ein Programm liest Nennmaß, Abmaß und Messwert ein.",
  "Es gibt die Grenzmaße aus und prüft, ob der Messwert in der Toleranz liegt.",
  "Unser Beispiel: Nennmaß 25 mm, Abmaß ± 0,05 mm.",
  "Das Bauteil darf also zwischen 24,95 und 25,05 mm messen.",
  "Unser Messwert liegt genau auf der Grenze: 25,05 mm. Ist das noch in Ordnung?"],
 ["Bevor du Code schreibst, zerlegst du die Aufgabe, ähnlich wie in einem Struktogramm.",
  "Eingabe: drei Zahlen, nämlich Nennmaß, Abmaß und Messwert.",
  "Verarbeitung: Untermaß und Obermaß berechnen und prüfen, ob der Messwert passt.",
  "Ausgabe: die Grenzmaße und das Ergebnis der Prüfung.",
  "Jeder dieser Kästen wird später ein Abschnitt im Code."],
 ["Abschnitt 1 liest die Eingaben. `input()` liefert Text, deshalb steht `float()` drumherum.",
  "Ohne `float()` bricht schon die Subtraktion mit einem TypeError ab.",
  "Abschnitt 2 rechnet: Untermaß ist Nennmaß minus Abmaß, Obermaß ist Nennmaß plus Abmaß.",
  "Abschnitt 3 gibt die Grenzmaße aus. Der f-String mit [[:.2f|Doppelpunkt, Punkt zwei f,]] zeigt zwei Nachkommastellen."],
 ["Abschnitt 4 ist der Kern der Aufgabe.",
  "`math.isclose` prüft, ob der Messwert höchstens ein Abmaß vom Nennmaß entfernt liegt.",
  "`rel_tol` ist null, damit nur die absolute Toleranz zählt. `abs_tol` ist das Abmaß.",
  "Der kleine Zuschlag von `1e-9` fängt Rundungsfehler ab."],
 ["Jetzt der Probelauf mit den Eingaben 25, 0.05 und 25.05.",
  "Die Grenzmaße lauten 24.95 und 25.05.",
  "Der Messwert liegt genau auf der Grenze, also erwarten wir True.",
  "Aber 25.05 minus 25 ergibt in Python 0.05000000000000071, also minimal mehr als 0.05.",
  "Ohne Zuschlag fiele der Grenzwert fälschlich durch. Bei 25.06 ist False dagegen richtig."],
 ["Zum Schluss: Vergleiche deine Lösung mit einem KI-Vorschlag.",
  "Steht `float()` um `input()`?",
  "Werden Floats irgendwo mit [[==|zwei Gleichheitszeichen]] verglichen?",
  "Und teste immer die Grenzfälle: genau auf der Grenze, knapp darüber und knapp darunter.",
  "Dann weißt du, ob du den Code wirklich verstanden hast."],
]
SECS = [[(anzeige(s), sprechfassung(s)) for s in sec] for sec in SRC]

CODE = [
 "import math",
 "",
 "# 1. Eingaben lesen und sofort in Zahlen umwandeln",
 'nennmass = float(input("Nennmaß in mm: "))',
 'abmass = float(input("Abmaß ± in mm: "))',
 'messwert = float(input("Messwert in mm: "))',
 "",
 "# 2. Grenzmaße berechnen",
 "untermass = nennmass - abmass",
 "obermass = nennmass + abmass",
 "",
 "# 3. Formatiert ausgeben",
 'print(f"Grenzmaße: {untermass:.2f} mm bis {obermass:.2f} mm")',
 "",
 "# 4. Abstand zum Nennmaß höchstens Abmaß? Mit Toleranz für die Rechnung",
 "ok = math.isclose(messwert, nennmass, rel_tol=0.0, abs_tol=abmass + 1e-9)",
 'print(f"Messwert {messwert:.2f} mm in Toleranz: {ok}")',
]
CPS = 55
def seq(idxs, start, cps=CPS, gap=0.12):
    """Zeiten fuer eine Gruppe von Zeilenindizes, nacheinander getippt."""
    out = {}; c = start
    for i in idxs:
        out[i] = c; c += len(CODE[i]) / cps + gap
    return out

CX, CW, CSZ, CLH, CY = 40, 800, 17, 27, 108
RX, RW = 860, 360

def code_times(spec):
    tm = [1e9] * len(CODE)
    for i, v in spec.items(): tm[i] = v
    return tm

def draw_code(f, t, times, hl=None, dim=False):
    def fn(d, dy): code_panel(d, CX, CY + dy, CW, CODE, times, t, CSZ, CPS * 1.0, hl=hl, dim_others=dim, lh=CLH)
    f.el(ap(t, 0.0, 0.3), fn)

def side_card(f, t, tin, y, h, big, small, col=DARK, lines=None, x=RX, w=RW, tout=None):
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    def fn(d, dy):
        card(d, x, y + dy, w, h)
        T(d, x + 28, y + 12 + dy, big, F(30, 700), col)
        yy = y + 54 + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 23
            while F(sz, 400).getlength(ln) > w - 50 and sz > 16: sz -= 1
            T(d, x + 28, yy, ln, F(sz, 400), GREY); yy += 28
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

def console(f, t, entries, y, h, tin=0.0, size=17):
    f.el(ap(t, tin, 0.4), lambda d, dy: console_panel(d, RX, y + dy, RW, h, entries, t, size, lh=24))

PR = lambda p, v: [(p, CODE_T), (v, CODE_N)]
FULL = {i: -1 for i in range(len(CODE))}   # alles bereits getippt

# ---------------------------------------------------------------- Szenen
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe")
    items = [("Nennmaß", "25 mm", ct(0) + 1.6), ("Abmaß", "± 0,05 mm", ct(0) + 2.8), ("Messwert", "25,05 mm", ct(4) + 0.2)]
    for i, (lab, val, ti) in enumerate(items):
        x = 60 + i * 400
        def fn(d, dy, x=x, lab=lab, val=val, i=i):
            card(d, x, 130 + dy, 360, 110, fill=WHITE)
            T(d, x + 28, 144 + dy, lab + (" (Eingabe)" if False else ""), F(26, 600), GREY)
            T(d, x + 28, 180 + dy, val, F(50, 700), RED if i == 2 else DARK)
        f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))
    # Toleranzband
    def band(d, dy):
        x0, x1, y = 160, 1120, 470 + dy
        def X(v): return x0 + (v - 24.90) / 0.20 * (x1 - x0)
        d.line((x0, y, x1, y), fill=GREY, width=4)
        if t > ct(3):
            k = ap(t, ct(3) + 0.2, 0.7)
            d.rectangle((X(24.95), y - 30, X(24.95) + k * (X(25.05) - X(24.95)), y + 30), fill=(205, 235, 217))
        for v, lab, big in ((24.90, "24,90", False), (24.95, "24,95", True), (25.00, "25,00", True), (25.05, "25,05", True), (25.10, "25,10", False)):
            if big and v in (24.95, 25.05) and t < ct(3) + 0.4: continue
            d.line((X(v), y - 14, X(v), y + 14), fill=DARK if big else GREY, width=3)
            T(d, X(v), y + 40, lab, F(26, 700 if big else 400), DARK if big else GREY, "ma")
        if t > ct(2):
            d.line((X(25.0), y - 44, X(25.0), y + 14), fill=DARK, width=4)
            T(d, X(25.0), y - 70, "Nennmaß", F(26, 700), DARK, "mm")
        if t > ct(3) + 0.8:
            T(d, X(24.95), y - 112, "Untermaß", F(26, 600), GREEN, "mm"); T(d, X(25.05), y - 112, "Obermaß", F(26, 600), GREEN, "mm")
            T(d, X(25.0), y + 100, "Toleranzbereich: darf messen", F(26, 600), GREEN, "mm")
    f.el(ap(t, ct(2) - 0.2, 0.5), band)
    def pin(d, dy):
        x = 160 + (25.05 - 24.90) / 0.20 * 960; y = 470 + dy
        d.polygon([(x, y - 2), (x - 14, y - 36), (x + 14, y - 36)], fill=RED)
        d.ellipse((x - 20, y - 78, x + 20, y - 38), fill=RED)
        T(d, x, y - 58, "?", F(34, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 0.5, 0.5), pin, dy=int((1 - ap(t, ct(4) + 0.5, 0.5)) * -10))

def sc2(f, t, ct):
    heading(f, t, "Zerlegen wie im Struktogramm")
    X0, X1 = 140, 1140
    rows = [("Eingabe", RED, ["Nennmaß, Abmaß und Messwert einlesen", "(als Zahlen)"], 130, 120, ct(1), "1"),
            ("Verarbeitung", DARK, ["Untermaß = Nennmaß − Abmaß", "Obermaß = Nennmaß + Abmaß", "Messwert in der Toleranz? Prüfen"], 262, 170, ct(2), "2 · 4"),
            ("Ausgabe", GREEN, ["Grenzmaße ausgeben", "Ergebnis der Prüfung ausgeben"], 444, 140, ct(3), "3 · 4")]
    f.el(ap(t, ct(0) + 0.3, 0.5), lambda d, dy: d.rectangle((X0 - 2, 128 + dy, X1 + 2, 586 + dy), outline=DARK, width=3))
    for lab, col, body, y, h, ti, num in rows:
        def fn(d, dy, lab=lab, col=col, body=body, y=y, h=h, num=num):
            d.rectangle((X0, y + dy, X1, y + h + dy), fill=WHITE, outline=DARK, width=2)
            d.rectangle((X0, y + dy, X0 + 220, y + h + dy), fill=col)
            T(d, X0 + 110, y + h / 2 + dy, lab, F(32, 700), WHITE, "mm")
            yy = y + (h - 36 * len(body)) / 2 + dy
            for ln in body:
                T(d, X0 + 250, yy, ln, F(30, 400), DARK); yy += 36
            if t > ct(4) + 0.3:
                k = ap(t, ct(4) + 0.3, 0.5)
                T(d, X1 - 110, y + h / 2 + dy, "Abschnitt", F(22, 400), GREY, "mm")
                d.ellipse((X1 - 70, y + h / 2 - 22 + dy, X1 - 14, y + h / 2 + 22 + dy), fill=RED) if len(num) == 1 else d.rounded_rectangle((X1 - 90, y + h / 2 - 22 + dy, X1 - 8, y + h / 2 + 22 + dy), 22, fill=RED)
                T(d, X1 - (42 if len(num) == 1 else 49), y + h / 2 + dy, num, F(28, 700), WHITE, "mm")
        f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))

def sc3(f, t, ct):
    heading(f, t, "Der Code, Abschnitt für Abschnitt")
    tm = {0: ct(0) + 0.1}
    tm.update(seq([2, 3, 4, 5], ct(0) + 0.5))
    tm.update(seq([7, 8, 9], ct(2) + 0.1))
    tm.update(seq([11, 12], ct(3) + 0.1))
    hl = set()
    if t < ct(2): hl = {2, 3, 4, 5}
    elif t < ct(3): hl = {7, 8, 9}
    else: hl = {11, 12}
    draw_code(f, t, code_times(tm), hl, True)
    side_card(f, t, ct(0) + 0.3, 108, 118, "Abschnitt 1: Eingabe", ["input() liefert Text,", "float() macht daraus eine Zahl"], RED, tout=ct(1) - 0.2)
    side_card(f, t, ct(1), 108, 150, "Ohne float()", ["nennmass - abmass:", "TypeError: unsupported operand", "type(s) for -: 'str' and 'str'"], RED, tout=ct(2) - 0.2)
    side_card(f, t, ct(2), 108, 118, "Abschnitt 2: Rechnen", ["untermass = 25 − 0.05 = 24.95", "obermass = 25 + 0.05 = 25.05"], DARK, tout=ct(3) - 0.2)
    side_card(f, t, ct(3), 108, 118, "Abschnitt 3: Ausgabe", [":.2f = zwei Nachkommastellen", "Variablen bleiben unverändert"], DARK)
    ents = [(ct(3) + 1.2, PR("Nennmaß in mm: ", "25")), (ct(3) + 1.7, PR("Abmaß ± in mm: ", "0.05")), (ct(3) + 2.2, PR("Messwert in mm: ", "25.05")),
            (ct(3) + 2.9, O("Grenzmaße: 24.95 mm bis 25.05 mm", CODE_G))]
    console(f, t, ents, 360, 190, ct(3) + 1.0)

def sc4(f, t, ct):
    heading(f, t, "Abschnitt 4: die Prüfung")
    tm = dict(FULL); tm.update(seq([14], ct(0) + 0.3)); tm.update(seq([15], ct(1) - 0.3)); tm.update(seq([16], ct(3) + 1.8))
    hl = {14, 15} if t < ct(3) + 1.8 else {16}
    draw_code(f, t, code_times(tm), hl, True)
    side_card(f, t, ct(1) + 0.3, 108, 100, "math.isclose(a, b, …)", ["Liegen a und b nah genug beieinander?"], DARK)
    side_card(f, t, ct(2) + 0.2, 220, 100, "rel_tol=0.0", ["kein relativer Anteil, nur absolut"], DARK)
    side_card(f, t, ct(2) + 3.0, 332, 100, "abs_tol=abmass + 1e-9", ["erlaubte Abweichung: Abmaß plus Zuschlag"], DARK)
    side_card(f, t, ct(3) + 0.2, 444, 100, "1e-9 = 0,000000001", ["fängt Rundungsfehler ab"], RED)

def sc5(f, t, ct):
    heading(f, t, "Probelauf an der Toleranzgrenze")
    tm = dict(FULL)
    draw_code(f, t, code_times(tm), {15, 16}, True)
    ents = [(ct(0) + 0.9, PR("Nennmaß in mm: ", "25")), (ct(0) + 1.6, PR("Abmaß ± in mm: ", "0.05")), (ct(0) + 2.3, PR("Messwert in mm: ", "25.05")),
            (ct(1) + 0.6, O("Grenzmaße: 24.95 mm bis 25.05 mm", CODE_T)),
            (ct(2) + 0.6, O("Messwert 25.05 mm in Toleranz: True", CODE_G)),
            (ct(4) + 3.2, O("# zweiter Lauf mit Messwert 25.06", CODE_C)),
            (ct(4) + 3.7, O("Messwert 25.06 mm in Toleranz: False", CODE_R))]
    console(f, t, ents, 108, 240)
    def cmp(d, dy):
        card(d, RX, 366 + dy, RW, 262)
        T(d, RX + 24, 378 + dy, "Warum + 1e-9?", F(28, 700), DARK)
        mono = M(19, True)
        if t > ct(3) + 0.4:
            T(d, RX + 24, 424 + dy, "Abstand: 25.05 − 25.0", F(22, 400), GREY)
            T(d, RX + 24, 452 + dy, "0.05000000000000071", mono, RED)
        if t > ct(3) + 3.2:
            T(d, RX + 24, 492 + dy, "erlaubt (mit Zuschlag):", F(22, 400), GREY)
            T(d, RX + 24, 520 + dy, "0.050000001", mono, DARK)
        if t > ct(4) + 0.4:
            T(d, RX + 24, 562 + dy, "Abstand ≤ erlaubt → True", F(24, 700), GREEN)
        if t > ct(4) + 1.6:
            T(d, RX + 24, 594 + dy, "ohne Zuschlag: 0.05 → False", F(22, 600), RED)
    f.el(ap(t, ct(2) + 0.6, 0.5), cmp)

def sc6(f, t, ct):
    heading(f, t, "Lösung mit KI-Vorschlag vergleichen")
    checks = [("float() um input()?", "Ohne Umwandlung rechnest du mit Text.", ct(1) + 0.1),
              ("Float-Vergleich mit ==?", "Besser: math.isclose mit Toleranz.", ct(2) + 0.1),
              ("Grenzfälle getestet?", "Auf der Grenze, knapp darüber, knapp darunter.", ct(3) + 0.1)]
    for i, (a, b, ti) in enumerate(checks):
        def fn(d, dy, i=i, a=a, b=b):
            y = 140 + i * 130 + dy
            card(d, 60, y, 680, 108)
            d.rounded_rectangle((90, y + 30, 138, y + 78), 8, outline=GREEN, width=4)
            d.line((99, y + 55, 112, y + 68), fill=GREEN, width=6); d.line((112, y + 68, 131, y + 40), fill=GREEN, width=6)
            T(d, 165, y + 16, a, F(34, 700), DARK); T(d, 165, y + 60, b, F(26, 400), GREY)
        f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))
    def tab(d, dy):
        card(d, 790, 140 + dy, 430, 368)
        T(d, 820, 154 + dy, "Testwerte (Nennmaß 25, Abmaß 0.05)", F(21, 700), DARK)
        rows = [("24.94", "False", CODE_R, "darunter"), ("24.95", "True", CODE_G, "Grenze"), ("25.00", "True", CODE_G, "Mitte"), ("25.05", "True", CODE_G, "Grenze"), ("25.06", "False", CODE_R, "darüber")]
        for i, (v, r, c, n) in enumerate(rows):
            y = 204 + i * 58 + dy
            d.rounded_rectangle((820, y, 1190, y + 48), 8, fill=BOX)
            T(d, 840, y + 24, v, M(24, True), CODE_T, "lm"); T(d, 940, y + 24, r, M(24, True), c, "lm"); T(d, 1170, y + 24, n, F(22, 400), CODE_C, "rm")
    f.el(ap(t, ct(3) + 0.3, 0.5), tab, dy=int((1 - ap(t, ct(3) + 0.3, 0.5)) * 12))
    def end(d, dy):
        d.rounded_rectangle((260, 560 + dy, 1020, 640 + dy), 40, fill=RED)
        T(d, 640, 600 + dy, "Erst verstehen, dann übernehmen", F(44, 700), WHITE, "mm")
    f.el(ap(t, ct(4), 0.5), end, dy=int((1 - ap(t, ct(4), 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 120, "V03 · Informatik", F(34, 600), GREY)
        T(d, 90, 170, "Vorgerechnet", F(104, 700), DARK)
        T(d, 90, 300, "Der Toleranzrechner Schritt für Schritt", F(52, 400), GREY)
        code_panel(d, 90, 400, 1000, CODE[12:13] + CODE[15:17], [0, 0, 0], 9, 24, lineno=False)
        d.rounded_rectangle((90, 560, 1090, 600), 0, fill=None)
        x0, x1, y = 130, 1050, 640
        d.line((x0, y, x1, y), fill=GREY, width=4)
        d.rectangle((x0 + 330, y - 16, x0 + 590, y + 16), fill=(205, 235, 217))
        d.polygon([(x0 + 590, y - 4), (x0 + 576, y - 34), (x0 + 604, y - 34)], fill=RED)
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    modus = sys.argv[1] if len(sys.argv) > 1 else "full"
    if modus == "text":   # Vorschau ohne Kosten: gesendeter Text je Absatz + PRUEFEN-Hinweise
        for i, sec in enumerate(SRC, 1):
            roh = " ".join(sec); sp = sprechfassung(roh)
            print(f"s{i} ({len(sp)} Z.): {sp}")
            for h in pruefen(roh): print("  PRUEFEN:", h)
            print()
    elif modus == "vertonen":   # je Absatz eine Datei audio/sN.mp3 (+ sN.sprech.txt)
        gesamt = 0
        for i, sec in enumerate(SRC, 1):
            roh = " ".join(sec)
            tts(roh, os.path.join(HERE, "audio", f"s{i}.mp3")); gesamt += len(sprechfassung(roh))
        print("Zeichen gesendet", gesamt)
    else:
        main(HERE, SECS, SCENES, LABEL, poster, NAME)
