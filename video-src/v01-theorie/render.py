"""Termin 01, Video 1: Vom Problem zum Programmablaufplan (Trinkgeld, Eingabe/Verarbeitung/Ausgabe, Algorithmus, drei Symbole, Plan, vier Regeln).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v01-common/tts_run.py v01-theorie)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from bausteine import *
from texte import SRC

NAME = "v01-theorie"; LABEL = "DHBW · Informatik · Termin 01 · Vom Problem zum Plan"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
BETRAG, PROZENT = 40, 10
TRINKGELD = BETRAG * PROZENT / 100; GESAMT = BETRAG + TRINKGELD
assert TRINKGELD == 4 and GESAMT == 44

PLAN = plan([("s", "term", "Start"), ("e1", "io", "Eingabe: betrag"), ("e2", "io", "Eingabe: prozent"),
             ("p1", "proc", "trinkgeld = betrag · prozent / 100"), ("p2", "proc", "gesamt = betrag + trinkgeld"),
             ("o", "io", "Ausgabe: trinkgeld, gesamt"), ("end", "term", "Ende")])
PKEYS = ["s", "s-e1", "e1", "e1-e2", "e2", "e2-p1", "p1", "p1-p2", "p2", "p2-o", "o", "o-end", "end"]
assert set(PKEYS) == set(PLAN.nodes) | set(PLAN.edges)

# ---------------------------------------------------------------- 1 Trinkgeld im Kopf, Leitsatz
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Im Restaurant: Rechnung und Trinkgeld")
    x, y, w = 60, 124, 540
    E(f, t, 0.3, lambda d, dy: card(d, x, y + dy, w, 356))
    def zeile(d, dy, yy, links, rechts, col=DARK, wt=600):
        TB(d, x + 40, yy + dy, links, F(34, wt), GREY if wt == 600 else DARK, 300, "lm")
        TB(d, x + w - 40, yy + dy, rechts, F(50, 700), col, 180, "rm")
    E(f, t, a(0, 0.28), lambda d, dy: zeile(d, dy, y + 66, "Rechnung", "40 €"))
    E(f, t, a(0, 0.62), lambda d, dy: TB(d, x + 40, y + 156 + dy, "+ 10 % Trinkgeld", F(34, 600), GREY, 300, "lm"))
    E(f, t, a(1, 0.38), lambda d, dy: TB(d, x + w - 40, y + 156 + dy, "4 €", F(50, 700), AMB, 180, "rm"))
    E(f, t, a(1, 0.62), lambda d, dy: d.line((x + 40, y + 216 + dy, x + w - 40, y + 216 + dy), fill=DARK, width=4))
    E(f, t, a(1, 0.66), lambda d, dy: (TB(d, x + 40, y + 284 + dy, "zusammen", F(34, 700), DARK, 300, "lm"),
                                       TB(d, x + w - 40, y + 284 + dy, "= 44 €", F(60, 700), RED, 260, "rm")))
    # rechts: der Rechner
    rx, rw = 660, 560
    def rechner(d, dy):
        card(d, rx, y + dy, rw, 356)
        TB(d, rx + 36, y + 22 + dy, "Ein Rechner braucht", F(36, 700), DARK, rw - 72)
    E(f, t, a(2, 0.0), rechner)
    for k in range(3):
        tin = a(2, 0.42) + 0.3 * k
        def schritt(d, dy, k=k):
            bx = rx + 36 + k * 172
            d.rounded_rectangle((bx, y + 96 + dy, bx + 132, y + 160 + dy), 10, fill=LIGHTK, outline=LINE, width=2)
            TB(d, bx + 66, y + 128 + dy, f"Schritt {k + 1}", F(26, 700), DARK, 120, "mm")
            if k: pfeil(d, bx - 36, y + 128 + dy, bx - 4, y + 128 + dy, GREY, 5, 14)
        E(f, t, tin, schritt)
    E(f, t, a(2, 0.5), lambda d, dy: tag(d, rx + 36, y + 196 + dy, rw - 72, 58, "jeden Schritt einzeln", LIGHTB, BLUE, 30, 700, outl=BLUE))
    E(f, t, a(2, 0.76), lambda d, dy: tag(d, rx + 36, y + 270 + dy, rw - 72, 58, "in der richtigen Reihenfolge", LIGHTB, BLUE, 30, 700, outl=BLUE))
    E(f, t, a(3, 0.48), lambda d, dy: tag(d, 60, 520 + dy, 1160, 112, "Erst der Ablauf, dann der Code", RED, WHITE, 60))

# ---------------------------------------------------------------- 2 Eingabe, Verarbeitung, Ausgabe
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Drei Fragen an jede Aufgabe")
    inhalt = [("Was ist gegeben?", ["Rechnungsbetrag", "Prozentsatz"]),
              ("Was wird getan?", ["Trinkgeld ausrechnen", "zum Betrag addieren"]),
              ("Was soll herauskommen?", ["Trinkgeld", "Gesamtbetrag"])]
    sp = []
    for k, (frage, punkte) in enumerate(inhalt):
        sp.append(dict(t_karte=a(0, 0.35) + 0.3 * k, frage=frage, t_frage=a(k + 1, 0.0), t_titel=a(k + 1, 0.3),
                       punkte=[(punkte[0], a(k + 1, 0.56)), (punkte[1], a(k + 1, 0.8))]))
    eva_spalten(f, t, sp, y=132, h=330)
    E(f, t, a(4, 0.0), lambda d, dy: tag(d, 60, 510 + dy, 1160, 70, "Eingabe, Verarbeitung, Ausgabe", LIGHTK, DARK, 38, 700, outl=GREY))
    E(f, t, a(4, 0.4), lambda d, dy: TB(d, 640, 624 + dy, "Diese drei Teile stecken in jedem Programm.", F(30, 600), GREY, 1100, "mm"))

# ---------------------------------------------------------------- 3 Algorithmus
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Eine Folge von Schritten")
    namen = ["Schritt 1", "Schritt 2", "Schritt 3", "Ergebnis"]
    for k, nm in enumerate(namen):
        def kasten(d, dy, k=k, nm=nm):
            bx = 185 + k * 240; last = k == 3
            d.rounded_rectangle((bx, 128 + dy, bx + 190, 190 + dy), 10, fill=LIGHTG if last else LIGHTK, outline=GREEN if last else LINE, width=2)
            TB(d, bx + 95, 159 + dy, nm, F(28, 700), GREEN if last else DARK, 170, "mm")
            if k: pfeil(d, bx - 44, 159 + dy, bx - 6, 159 + dy, GREY, 5, 15)
        E(f, t, 0.4 + 0.3 * k, kasten)
    def wort(d, dy):
        TB(d, 640, 284 + dy, "Algorithmus", F(112, 700), DARK, 1000, "mm")
        d.rounded_rectangle((360, 352 + dy, 920, 360 + dy), 4, fill=RED)
    E(f, t, a(0, 0.62), wort)
    merk = [("eindeutig", "jeder Schritt ist klar festgelegt", a(1, 0.2)), ("endlich", "nach endlich vielen Schritten: Ergebnis", a(1, 0.5))]
    for k, (gross, klein, tin) in enumerate(merk):
        def karte(d, dy, k=k, gross=gross, klein=klein):
            bx = 60 + k * 600
            card(d, bx, 400 + dy, 560, 124, stripe=False)
            check_circle(d, bx + 52, 462 + dy, 24)
            TB(d, bx + 96, 412 + dy, gross, F(44, 700), DARK, 440)
            TB(d, bx + 96, 474 + dy, klein, F(26, 400), GREY, 440)
        E(f, t, tin, karte)
    E(f, t, a(2, 0.42), lambda d, dy: tag(d, 60, 556 + dy, 1160, 84, "Was du nicht hinschreibst, passiert nicht.", RED, WHITE, 44))

# ---------------------------------------------------------------- 4 Programmablaufplan: drei Symbole und der Pfeil
SYMBOLE = [("term", "Start", "Start / Ende", "abgerundetes Feld", "Start oder Ende des Ablaufs"),
           ("io", "Eingabe: betrag", "Ein- und Ausgabe", "Parallelogramm", "ein Wert kommt oder geht"),
           ("proc", "gesamt = betrag + trinkgeld", "Verarbeitung", "Rechteck", "hier wird gerechnet")]

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Einen Ablauf zeichnet man")
    E(f, t, a(0, 0.6), lambda d, dy: tag(d, 60, 112 + dy, 560, 56, "Die Zeichnung: Programmablaufplan", LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 660, 112 + dy, 560, 56, "genormte Symbole, heute drei", LIGHTK, DARK, 30, 700, outl=GREY))
    for k, (art, text, name, form, sinn) in enumerate(SYMBOLE):
        tin = a(k + 2, 0.0); x = 60 + k * 400
        def karte(d, dy, x=x, name=name, form=form, sinn=sinn):
            card(d, x, 188 + dy, 360, 316, stripe=False)
            TB(d, x + 180, 372 + dy, name, F(36, 700), DARK, 330, "mm")
            TB(d, x + 180, 420 + dy, form, F(27, 600), RED, 330, "mm")
            TB(d, x + 180, 462 + dy, sinn, F(25, 400), GREY, 330, "mm")
        E(f, t, tin, karte)
        symbol(f, show(t, tin + 0.15), art, text, (x + 14, 204, 332, 132), bg=WHITE, maxzoom=1.5)
    def pf(d, dy):
        card(d, 60, 524 + dy, 1160, 120, stripe=False)
        pfeil(d, 120, 540 + dy, 120, 628 + dy, DARK, 6, 20)
        TB(d, 170, 584 + dy, "Pfeile geben die Reihenfolge an: von oben nach unten", F(36, 700), DARK, 1020, "lm")
    E(f, t, a(5, 0.0), pf)

# ---------------------------------------------------------------- 5 Der Plan des Trinkgeld-Rechners
PBOX = (60, 104, 580, 572)
ZEILEN = [["betrag", "40"], ["prozent", "10"], ["trinkgeld", "4"], ["gesamt", "44"]]
BEZ = {"s": "abgerundetes Feld: Start", "e1": "Parallelogramm: Eingabe", "e2": "Parallelogramm: Eingabe", "p1": "Rechteck: Verarbeitung",
       "p2": "Rechteck: Verarbeitung", "o": "Parallelogramm: Ausgabe", "end": "abgerundetes Feld: Ende"}

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Der Plan für das Trinkgeld")
    tm = {k: 0.4 + 0.18 * i for i, k in enumerate(PKEYS)}
    merk = [a(4, 0.66), a(4, 0.75), a(4, 0.80), a(4, 0.86)]          # 40, 10, 4 und 44
    sched = [(a(1, 0.0), "s"), (a(1, 0.2), "e1"), (a(1, 0.6), "e2"), (a(2, 0.16), "p1"), (a(2, 0.64), "p2"), (a(3, 0.0), "o"), (a(3, 0.62), "end"),
             (a(4, 0.0), None), (merk[0], "e1"), (merk[1], "e2"), (merk[2], "p1"), (merk[3], "p2")]
    cur = aktuell(t, sched)
    plan_draw(f, ap(t, 0.3, 0.3), PLAN, PBOX, vis=reveal(t, tm), hl={cur: RED} if cur else None, maxzoom=1.4)
    if cur and t < a(4, 0.0):
        f.el(show(t, a(1, 0.0)), lambda d, dy: tag(d, 700, 124, 520, 60, BEZ[cur], LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, a(4, 0.0), lambda d, dy: tag(d, 700, 124 + dy, 520, 60, "Probelauf: 40 Euro, 10 Prozent", LIGHTG, GREEN, 30, 700, outl=GREEN))
    def tabelle(d, dy):
        TB(d, 700, 222 + dy, "Das merkt sich der Ablauf", F(30, 700), DARK, 520)
        grid(d, 700, 272 + dy, [300, 220], ["Name", "Wert"], ZEILEN, t, merk, size=32, rh=60)
    E(f, t, a(0, 0.5), tabelle)

# ---------------------------------------------------------------- 6 Vier Regeln, Ausblick
REGELN = ["Genau ein Start und genau ein Ende", "Gelesen wird von oben nach unten", "In jedem Symbol steht ein Schritt",
          "Was der Plan nicht zeigt, tut das Programm nicht"]

def sc6(f, t, ct):
    a = lambda k, fr=0.0: AT[6](ct, k, fr)
    kopf(f, t, "Vier Regeln für jeden Plan")
    for j, txt in enumerate(REGELN):
        def zeile(d, dy, j=j, txt=txt):
            y = 122 + j * 88
            d.rounded_rectangle((60, y + dy, 1220, y + 74 + dy), 14, fill=WHITE, outline=LINE, width=2)
            num_circle(d, 104, y + 37 + dy, 24, j + 1, RED)
            TB(d, 148, y + 37 + dy, txt, F(36, 700), DARK, 1040, "lm")
        E(f, t, a(j + 1, 0.0), zeile)
    E(f, t, a(5, 0.0), lambda d, dy: tag(d, 60, 492 + dy, 1160, 64, "In der Klausur: Pläne von Hand zeichnen", LIGHTK, DARK, 32, 700, outl=GREY))
    E(f, t, a(5, 0.5), lambda d, dy: tag(d, 60, 574 + dy, 1160, 80, "Weiter: aus dem Plan wird Code", RED, WHITE, 44))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}
assert len(SRC) == 6 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 01 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vom Problem", F(96, 700), DARK)
        T2(d, 90, 266, "zum Plan", F(96, 700), DARK)
        T2(d, 90, 400, "Eingabe, Verarbeitung, Ausgabe", F(40, 400), GREY)
        T2(d, 90, 452, "und der Programmablaufplan", F(40, 400), GREY)
        tag(d, 90, 560, 560, 70, "Erst der Ablauf, dann der Code", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.paste(plan_bild(PLAN, (480, 600), hl={"p1": RED}), (760, 50))
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
