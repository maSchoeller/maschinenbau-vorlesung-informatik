"""Termin 01, Video 3: Vorgerechnet: Pendelstrecke, vom Plan zum Programm (Aufgabe, drei Fragen, Plan, Code Symbol fuer Symbol, Programmlauf mit Probe, Jetzt du).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v01-common/tts_run.py v01-beispiel)
Der Code wird aus briefing/v01-beispiel.py gelesen und muss zeichengleich mit der Seite sein (app/inhalte/v01/labor/w-vorgemacht.vorlage.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from bausteine import *
from texte import SRC

NAME = "v01-beispiel"; LABEL = "DHBW · Informatik · Termin 01 · Vorgerechnet: Pendelstrecke"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}
NL = chr(10)

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echter Programmlauf
_ROOT = os.path.join(HERE, "..", "..")
_BRIEF = open(os.path.join(_ROOT, "briefing", "v01-beispiel.py"), encoding="utf-8").read()
_SEITE = os.path.join(_ROOT, "app", "inhalte", "v01", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE): assert open(_SEITE, encoding="utf-8").read() == _BRIEF, "briefing/v01-beispiel.py weicht vom Code der Seite ab"
CODE = _BRIEF.splitlines()
assert CODE == ["# Pendelstrecke: Kilometer pro Woche", 'strecke = float(input("Einfache Strecke in km: "))', 'tage = int(input("Tage pro Woche: "))',
                "woche = strecke * 2 * tage", 'print("Kilometer pro Woche:", woche)'], CODE
EINGABEN = ["18.5", "4"]
LAUF = run(_BRIEF, EINGABEN)
assert LAUF == ["Einfache Strecke in km: 18.5", "Tage pro Woche: 4", "Kilometer pro Woche: 148.0"], LAUF
assert 18.5 * 2 == 37 and 37 * 4 == 148 == float(LAUF[2].split(": ")[1])          # Probe von Hand

_ITEMS = [("s", "term", "Start"), ("e1", "io", "Eingabe: strecke"), ("e2", "io", "Eingabe: tage"),
          ("p", "proc", "woche = strecke * 2 * tage"), ("o", "io", "Ausgabe: woche"), ("end", "term", "Ende")]
PLAN = plan(_ITEMS)
PLAN8 = plan(_ITEMS[:4] + [("x1", "proc", "?", dict(minw=210))] + _ITEMS[4:5] + [("x2", "io", "?", dict(minw=210))] + _ITEMS[5:], gap=16)

# ---------------------------------------------------------------- Bildzeichen
def haus(d, cx, by, col=DARK):
    d.rectangle((cx - 58, by - 78, cx + 58, by), fill=WHITE, outline=col, width=5)
    dach = [(cx - 78, by - 78), (cx, by - 142), (cx + 78, by - 78)]
    d.polygon(dach, fill=WHITE); d.line(dach + [dach[0]], fill=col, width=5, joint="curve")
    d.rectangle((cx - 15, by - 46, cx + 15, by), fill=col)

def hochschule(d, cx, by, col=DARK):
    d.rectangle((cx - 100, by - 92, cx + 100, by), fill=WHITE, outline=col, width=5)
    dach = [(cx - 116, by - 92), (cx, by - 142), (cx + 116, by - 92)]
    d.polygon(dach, fill=WHITE); d.line(dach + [dach[0]], fill=col, width=5, joint="curve")
    for k in range(4):
        x = cx - 72 + k * 48; d.rectangle((x - 7, by - 76, x + 7, by - 6), fill=col)

# ---------------------------------------------------------------- 1 Die Aufgabe
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Pendelstrecke")
    def aufgabe(d, dy):
        card(d, 60, 118 + dy, 1160, 96)
        TB(d, 644, 166 + dy, "Wie viele Kilometer fährst du pro Woche zur Hochschule und zurück?", F(36, 700), DARK, 1100, "mm")
    E(f, t, 0.4, aufgabe)
    by = 446
    E(f, t, a(0, 0.3), lambda d, dy: (haus(d, 200, by + dy), TB(d, 200, by + 10 + dy, "Zuhause", F(28, 700), DARK, 240, "ma")))
    E(f, t, a(0, 0.62), lambda d, dy: (hochschule(d, 1060, by + dy), TB(d, 1060, by + 10 + dy, "Hochschule", F(28, 700), DARK, 240, "ma")))
    def hin(d, dy):
        pfeil(d, 310, 334 + dy, 920, 334 + dy, DARK, 6, 20); TB(d, 615, 296 + dy, "hin", F(26, 700), GREY, 200, "ma")
    def zurueck(d, dy):
        pfeil(d, 920, 430 + dy, 310, 430 + dy, DARK, 6, 20); TB(d, 615, 438 + dy, "zurück", F(26, 700), GREY, 200, "ma")
    E(f, t, a(0, 0.66), hin); E(f, t, a(0, 0.86), zurueck)
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, 385, 354 + dy, 460, 56, "gegeben: einfache Strecke in km", LIGHTB, BLUE, 26, 700, outl=BLUE))
    E(f, t, a(1, 0.55), lambda d, dy: tag(d, 385, 498 + dy, 460, 56, "gegeben: Tage pro Woche", LIGHTA, AMB, 26, 700, outl=AMB))
    E(f, t, a(2, 0.5), lambda d, dy: tag(d, 60, 578 + dy, 1160, 80, "Erst der Plan, dann der Code", RED, WHITE, 46))

# ---------------------------------------------------------------- 2 Drei Fragen
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Drei Fragen, drei Antworten")
    sp = [dict(t_karte=0.4, frage="Was ist gegeben?", t_frage=a(0, 0.0), t_titel=a(0, 0.76),
               punkte=[("Strecke", a(0, 0.3)), ("Tage", a(0, 0.52))], fuss=("zwei Eingaben", a(0, 0.76))),
          dict(t_karte=0.7, frage="Was wird getan?", t_frage=a(1, 0.0), t_titel=a(1, 0.82),
               punkte=[("Strecke mal 2", a(1, 0.2)), ("mal die Tage", a(1, 0.66))], fuss=("eine Verarbeitung", a(1, 0.82))),
          dict(t_karte=1.0, frage="Was soll herauskommen?", t_frage=a(2, 0.0), t_titel=a(2, 0.78),
               punkte=[("Kilometer pro Woche", a(2, 0.38))], fuss=("eine Ausgabe", a(2, 0.78)))]
    eva_spalten(f, t, sp, y=140, h=400)
    E(f, t, a(1, 0.34), lambda d, dy: TB(d, 640, 600 + dy, "mal 2, weil du hin und zurück fährst", F(30, 600), GREY, 1100, "mm"), tout=a(2, 0.0) - 0.2)

# ---------------------------------------------------------------- 3 Der Plan, Symbol fuer Symbol
PBOX3 = (60, 104, 640, 572)
FORM = {"e1": "Parallelogramm", "e2": "Parallelogramm", "p": "Rechteck", "o": "Parallelogramm"}

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Aus den Antworten wird der Plan")
    tin = {"s": a(1, 0.0), "e1": a(1, 0.14), "e2": a(1, 0.58), "p": a(2, 0.0), "o": a(3, 0.0), "end": a(3, 0.74)}
    tm = dict(tin); tm.update({"s-e1": tin["e1"], "e1-e2": tin["e2"], "e2-p": tin["p"], "p-o": tin["o"], "o-end": tin["end"]})
    cur = aktuell(t, sorted((z, k) for k, z in tin.items()))
    hl = {k: RED for k in ("e1", "e2", "p", "o")} if t >= a(4, 0.0) else ({cur: RED} if cur else None)
    z, cam = plan_draw(f, 1.0, PLAN, PBOX3, vis=reveal(t, tm), hl=hl, maxzoom=1.5)
    for k, name in FORM.items():
        x0, y0, x1, y1 = plan_kasten(PBOX3, z, cam, PLAN.nodes[k])
        E(f, t, tin[k] + 0.2, lambda d, dy, x1=x1, y0=y0, y1=y1, name=name: TB(d, x1 + 18, (y0 + y1) / 2 + dy, name, F(24, 600), GREY, 780 - x1 - 18, "lm", "Symbolname"))
    teile = [("2 Eingaben", BLUE, LIGHTB), ("1 Verarbeitung", AMB, LIGHTA), ("1 Ausgabe", GREEN, LIGHTG)]
    for j, (txt, col, fill) in enumerate(teile):
        E(f, t, 0.5 + 0.35 * j, lambda d, dy, j=j, txt=txt, col=col, fill=fill: chip(d, 800, 150 + j * 82 + dy, 420, 64, txt, fill, col, 32))
    def vier(d, dy):
        card(d, 800, 430 + dy, 420, 124)
        TB(d, 834, 444 + dy, "Vier Symbole", F(38, 700), RED, 370)
        TB(d, 834, 498 + dy, "zwischen Start und Ende", F(30, 600), DARK, 370)
    E(f, t, a(4, 0.0), vier)

# ---------------------------------------------------------------- 4 und 5 Vom Plan zum Code
PBOX4 = (40, 104, 400, 572); CX, CY, CW, CSIZE, CLH = 460, 124, 760, 24, 42
NY = CY + code_h(5, CLH) + 22          # Notizen unter dem Code

def plan_und_code(f, t, zeiten_code, hl_code, hl_plan):
    plan_draw(f, ap(t, 0.2, 0.3), PLAN, PBOX4, hl={hl_plan: RED} if hl_plan else None, maxzoom=1.4)
    cpanel(f, t, CODE, CX, CY, CW, CSIZE, CLH, hl_code, zeiten_code)

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: Zeilen 1 bis 3")
    t1, t2, t3 = a(1, 0.0) + 0.2, a(2, 0.0) + 0.1, a(2, 0.0) + 1.2
    hl_code = aktuell(t, [(a(1, 0.0), {0}), (a(2, 0.0), {1}), (t3, {2}), (a(3, 0.0), {1}), (a(3, 0.5), {2})])
    hl_plan = aktuell(t, [(a(2, 0.0), "e1"), (t3, "e2"), (a(3, 0.0), "e1"), (a(3, 0.5), "e2")])
    plan_und_code(f, t, [t1, t2, t3, 1e9, 1e9], hl_code, hl_plan)
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, CX, NY + dy, CW, 60, "Kommentar: hinter der Raute # steht eine Notiz für Menschen", LIGHTK, DARK, 26, 700, outl=GREY), tout=a(2, 0.0) - 0.2)
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, CX, NY + dy, CW, 60, "zwei Parallelogramme: zwei Zeilen mit input", LIGHTR, RED, 28, 700, outl=RED), tout=a(3, 0.0) - 0.2)
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, CX, NY + dy, CW, 60, "strecke: eine Kommazahl, also float", LIGHTB, BLUE, 28, 700, outl=BLUE))
    E(f, t, a(3, 0.5), lambda d, dy: tag(d, CX, NY + 76 + dy, CW, 60, "tage: eine ganze Zahl, also int", LIGHTA, AMB, 28, 700, outl=AMB))

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: Zeilen 4 und 5")
    t4, t5 = a(0, 0.0) + 0.3, a(1, 0.0) + 0.2
    hl_code = aktuell(t, [(a(0, 0.0), {3}), (a(1, 0.0), {4})])
    hl_plan = aktuell(t, [(a(0, 0.0), "p"), (a(1, 0.0), "o")])
    plan_und_code(f, t, [-1, -1, -1, t4, t5], hl_code, hl_plan)
    E(f, t, a(0, 0.5), lambda d, dy: tag(d, CX + 390, NY + dy, 370, 60, "rechts wird gerechnet", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(0, 0.75), lambda d, dy: tag(d, CX, NY + dy, 370, 60, "links wird gemerkt", LIGHTB, BLUE, 28, 700, outl=BLUE))
    E(f, t, a(1, 0.2), lambda d, dy: tag(d, CX, NY + 76 + dy, CW, 60, "letztes Parallelogramm: ein print", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, CX, NY + 152 + dy, CW, 60, "Der Text davor sagt, was die Zahl bedeutet", LIGHTG, GREEN, 28, 700, outl=GREEN))

# ---------------------------------------------------------------- 6 Programmlauf und Probe von Hand
def sc6(f, t, ct):
    a = lambda k, fr=0.0: AT[6](ct, k, fr)
    kopf(f, t, "Programmlauf und Probe von Hand")
    cpanel(f, t, CODE, 60, 116, 720, 22, 34)
    y = 116 + code_h(5, 34) + 18
    p1, p2 = LAUF[0][:-len(EINGABEN[0])], LAUF[1][:-len(EINGABEN[1])]
    zeilen = [(0.5, p1, a(0, 0.3), EINGABEN[0]), (a(0, 0.5), p2, a(0, 0.72), EINGABEN[1]), (a(1, 0.4), LAUF[2], None, None, CODE_G)]
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, 60, y + dy, 720, zeilen, t, 26, 42, hl={2} if t >= a(1, 0.4) else None))
    def probe_karte(d, dy):
        card(d, 820, 116 + dy, 400, 290)
        TB(d, 852, 132 + dy, "Probe im Kopf", F(34, 700), DARK, 350)
    E(f, t, a(2, 0.0), probe_karte)
    E(f, t, a(2, 0.42), lambda d, dy: TB(d, 852, 200 + dy, "18,5 · 2 = 37", F(46, 700), DARK, 350))
    E(f, t, a(2, 0.72), lambda d, dy: TB(d, 852, 270 + dy, "37 · 4 = 148", F(46, 700), DARK, 350))
    E(f, t, a(2, 0.9), lambda d, dy: (check_circle(d, 876, 368 + dy, 20), TB(d, 908, 368 + dy, "stimmt mit 148.0 überein", F(24, 700), GREEN, 290, "lm")))
    E(f, t, a(3, 0.2), lambda d, dy: tag(d, 60, 584 + dy, 1160, 72, "Probe von Hand: bei jedem Programm", RED, WHITE, 38))

# ---------------------------------------------------------------- 7 Jetzt du
PBOX7 = (60, 110, 480, 520); Z8, CAM8 = plan_fit(PLAN8, PBOX7, 1.4)

def sc7(f, t, ct):
    a = lambda k, fr=0.0: AT[7](ct, k, fr)
    kopf(f, t, "Jetzt du: auch die Kilometer pro Monat")
    t1, t2 = a(1, 0.0), a(1, 0.5)
    a8 = ap(t, t1 - 0.3, 0.4)                       # Wechsel vom Plan zum Plan mit zwei freien Plaetzen
    if a8 < 0.999: plan_draw(f, ap(t, 0.2, 0.3), PLAN, PBOX7, maxzoom=Z8)
    unsichtbar = lambda k: 0.0 if k in ("x1", "x2") else 1.0
    if a8 > 0.001: plan_draw(f, a8, PLAN8, PBOX7, vis=unsichtbar, maxzoom=1.4)
    def frage(d, dy):
        card(d, 600, 124 + dy, 620, 160)
        absatz(d, 632, 142 + dy, "Was änderst du im Plan und im Code, wenn auch die Kilometer pro Monat ausgegeben werden sollen?", F(31, 700), DARK, 560, 40, 4)
    E(f, t, 0.5, frage)
    for key, tin, txt in (("x1", t1, "ein Rechteck mehr"), ("x2", t2, "eine Ausgabe mehr")):
        n = PLAN8.nodes[key]; x0, y0, x1, y1 = plan_kasten(PBOX7, Z8, CAM8, n); ym = (y0 + y1) / 2
        def neu(d, dy, n=n, x1=x1, ym=ym, txt=txt):
            symbol_gestrichelt(d, PBOX7, Z8, CAM8, n, RED)
            d.line((x1 + 8, ym, 596, ym), fill=RED, width=3)
            tag(d, 600, ym - 30, 380, 60, txt, LIGHTR, RED, 30, 700, outl=RED)
        f.el(show(t, tin + 0.1), neu)
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 600, 590 + dy, 620, 68, "Probier es im Labor aus", RED, WHITE, 36))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}
assert len(SRC) == 7 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 01 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet:", F(84, 700), DARK)
        T2(d, 90, 256, "Pendelstrecke", F(84, 700), DARK)
        T2(d, 90, 384, "Vom Plan zum Programm", F(40, 400), GREY)
        tag(d, 90, 450, 520, 66, "Erst der Plan, dann der Code", RED, WHITE, 34)
        code_n(d, 90, 536, 620, CODE[3:], [4, 5], [-1] * 2, 0, 22, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.paste(plan_bild(PLAN, (440, 580), hl={"p": RED}), (790, 60))
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
