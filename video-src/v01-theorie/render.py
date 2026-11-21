"""V01 Theorie: Warum programmieren, wenn KI es kann? Aufruf: python render.py [text|stills t..|full|mux]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from ext import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v01-theorie"; LABEL = "DHBW · Informatik · V01 · Warum programmieren?"

SECS = [
 [("Eine KI soll die Zugspannung in einem Rundstab berechnen.", "Eine KI soll die Zugspannung in einem Rundstab berechnen."),
  ("Die Zugkraft beträgt 12 000 Newton, der Durchmesser 10 Millimeter.", "Die Zugkraft beträgt zwölftausend Newton, der Durchmesser zehn Millimeter."),
  ("Die KI antwortet selbstsicher: 0,153 Megapascal.", "Die KI antwortet selbstsicher: null Komma eins fünf drei Megapascal."),
  ("Das klingt plausibel, ist aber um den Faktor 1000 falsch.", "Das klingt plausibel, ist aber um den Faktor tausend falsch."),
  ("Richtig sind etwa 152,8 Megapascal.", "Richtig sind etwa einhundertzweiundfünfzig Komma acht Megapascal."),
  ("Die Fläche wurde von Quadratmillimetern falsch in Quadratmeter umgerechnet: durch 1000 statt durch eine Million.",
   "Die Fläche wurde von Quadratmillimetern falsch in Quadratmeter umgerechnet: durch tausend statt durch eine Million."),
  ("Wer das nicht merkt, dimensioniert danach ein Bauteil falsch.", "Wer das nicht merkt, dimensioniert danach ein Bauteil falsch.")],
 [("Warum also selbst programmieren lernen, wenn eine KI das kann? Dafür gibt es vier Gründe.",
   "Warum also selbst programmieren lernen, wenn eine KI das kann? Dafür gibt es vier Gründe."),
  ("Erstens: Du musst Code lesen können, um ihn zu prüfen. Wer ihn nicht versteht, kann nur glauben.",
   "Erstens: Du musst Code lesen können, um ihn zu prüfen. Wer ihn nicht versteht, kann nur glauben."),
  ("Zweitens: Eine KI verstärkt deine Spezifikation. Ist die Aufgabe unklar, bekommst du schnell und überzeugend das Falsche.",
   "Zweitens: Eine KI verstärkt deine Spezifikation. Ist die Aufgabe unklar, bekommst du schnell und überzeugend das Falsche."),
  ("Drittens: Du musst überschlagen können. 12 000 durch rund 80 sind etwa 150, und schon fällt der Fehler auf.",
   "Drittens: Du musst überschlagen können. Zwölftausend durch rund achtzig sind etwa hundertfünfzig, und schon fällt der Fehler auf."),
  ("Viertens: Im Betrieb läuft oft gar keine KI. Steuerungen, Messgeräte und Skripte sind Code, den du verstehen und anpassen musst.",
   "Viertens: Im Betrieb läuft oft gar keine KI. Steuerungen, Messgeräte und Skripte sind Code, den du verstehen und anpassen musst.")],
 [("Du musst aber nicht alles selbst können. Dafür gibt es die Wissens-Ampel.", "Du musst aber nicht alles selbst können. Dafür gibt es die Wissens-Ampel."),
  ("Im Kopf: Das brauchst du ohne Hilfe, sonst kannst du KI-Ergebnisse nicht beurteilen, zum Beispiel Größenordnungen und Einheiten.",
   "Im Kopf: Das brauchst du ohne Hilfe, sonst kannst du KI-Ergebnisse nicht beurteilen, zum Beispiel Größenordnungen und Einheiten."),
  ("Lesen und erkennen: Du verstehst Code, musst ihn aber nicht zwingend selbst schreiben.",
   "Lesen und erkennen: Du verstehst Code, musst ihn aber nicht zwingend selbst schreiben."),
  ("Delegieren: Die KI übernimmt, du musst nur wissen, dass es das gibt.", "Delegieren: Die KI übernimmt, du musst nur wissen, dass es das gibt."),
  ("Bei jedem Thema im Kurs zeigt dir die Ampel, in welche Stufe es gehört.", "Bei jedem Thema im Kurs zeigt dir die Ampel, in welche Stufe es gehört.")],
 [("Doch was ist eigentlich ein Programm?", "Doch was ist eigentlich ein Programm?"),
  ("Ein Programm folgt fast immer demselben Muster: Eingabe, Verarbeitung, Ausgabe.", "Ein Programm folgt fast immer demselben Muster: Eingabe, Verarbeitung, Ausgabe."),
  ("Hier stehen in den ersten beiden Zeilen die Eingaben, in der dritten wird gerechnet, und die vierte gibt das Ergebnis aus.",
   "Hier stehen in den ersten beiden Zeilen die Eingaben, in der dritten wird gerechnet, und die vierte gibt das Ergebnis aus."),
  ("Der Interpreter arbeitet den Code Zeile für Zeile von oben nach unten ab.", "Der Interpreter arbeitet den Code Zeile für Zeile von oben nach unten ab."),
  ("Und er ist deterministisch: gleiche Eingabe, gleiches Ergebnis, jedes Mal.", "Und er ist deterministisch: gleiche Eingabe, gleiches Ergebnis, jedes Mal."),
  ("Genau das macht ein Programm überprüfbar, anders als eine KI-Antwort, die bei jeder Anfrage anders ausfallen kann.",
   "Genau das macht ein Programm überprüfbar, anders als eine KI-Antwort, die bei jeder Anfrage anders ausfallen kann.")],
 [("Merke dir: Die KI ist ein starkes Werkzeug, aber die Verantwortung für das Ergebnis bleibt bei dir.",
   "Merke dir: Die KI ist ein starkes Werkzeug, aber die Verantwortung für das Ergebnis bleibt bei dir."),
  ("Dafür brauchst du Wissen im Kopf, Leseverständnis und ein Gefühl für Größenordnungen.",
   "Dafür brauchst du Wissen im Kopf, Leseverständnis und ein Gefühl für Größenordnungen."),
  ("Im nächsten Video schreibst du deine ersten Zeilen Python.", "Im nächsten Video schreibst du deine ersten Zeilen Python.")],
]

def rise(f, t, ti, fn):
    f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))

def sc1(f, t, ct):
    heading(f, t, "Die KI-Rechnung")
    def aufg(d, dy):
        card(d, 60, 130 + dy, 560, 270)
        T(d, 90, 146 + dy, "Aufgabe: Zugspannung im Rundstab", F(28, 700), DARK)
        d.rectangle((190, 250 + dy, 470, 300 + dy), fill=(190, 198, 210), outline=DARK, width=3)
        arrow(d, 188, 275 + dy, 100, 275 + dy, RED, 7, 22); arrow(d, 472, 275 + dy, 560, 275 + dy, RED, 7, 22)
        T(d, 330, 232 + dy, "Rundstab", F(24, 400), GREY, "ms")
        T(d, 540, 244 + dy, "F = 12 000 N", F(26, 700), RED, "ms")
        T(d, 330, 330 + dy, "Durchmesser d = 10 mm", F(28, 700), DARK, "ma")
        T(d, 330, 366 + dy, "gesucht: σ = F / A", F(24, 400), GREY, "ma")
    rise(f, t, ct(0) + 0.2, aufg)
    def ki(d, dy):
        card(d, 660, 130 + dy, 560, 118); T(d, 690, 142 + dy, "Antwort der KI", F(26, 600), GREY)
        T(d, 690, 178 + dy, "σ = 0,153 MPa", F(52, 700), RED)
        cross(d, 1150, 160 + dy, RED, 1.6)
    rise(f, t, ct(2), ki)
    def ri(d, dy):
        card(d, 660, 268 + dy, 560, 118); T(d, 690, 280 + dy, "Richtig", F(26, 600), GREY)
        T(d, 690, 316 + dy, "σ ≈ 152,8 MPa", F(52, 700), GREEN)
        check(d, 1150, 304 + dy, GREEN, 1.6)
    rise(f, t, ct(4), ri)
    rise(f, t, ct(3) + 0.3, lambda d, dy: pill(d, 160, 424 + dy, 360, 76, "Faktor 1000 daneben", 34))
    def ur(d, dy):
        card(d, 660, 406 + dy, 560, 170, stripe=False)
        T(d, 690, 418 + dy, "Ursache: Einheit der Fläche", F(26, 700), DARK)
        T(d, 690, 456 + dy, "A = 78,54 mm²", F(30, 700), DARK)
        T(d, 690, 498 + dy, "KI: 0,07854 m²   (durch 1000)", F(26, 600), RED)
        T(d, 690, 534 + dy, "richtig: 0,00007854 m²   (durch 1 000 000)", F(24, 600), GREEN)
    rise(f, t, ct(5), ur)
    rise(f, t, ct(6), lambda d, dy: pill(d, 60, 606 + dy, 1160, 64, "Wer die Größenordnung nicht prüft, dimensioniert falsch", 32, DARK))

def sc2(f, t, ct):
    heading(f, t, "Vier Gründe, selbst zu programmieren")
    items = [("1", "Lesen, um zu prüfen", "Wer Code nicht versteht, kann KI-Code nur glauben.", ct(1)),
             ("2", "KI verstärkt die Spezifikation", "Unklare Aufgabe: schnell und überzeugend das Falsche.", ct(2)),
             ("3", "Überschlagen können", "12 000 N / 80 mm² ≈ 150 MPa: Größenordnung im Kopf.", ct(3)),
             ("4", "Im Betrieb oft keine KI", "Steuerungen, Messgeräte, Skripte: Code verstehen und anpassen.", ct(4))]
    for k, (n, tt, sub, ti) in enumerate(items):
        x = 60 + (k % 2) * 600; y = 130 + (k // 2) * 270
        def fn(d, dy, x=x, y=y, n=n, tt=tt, sub=sub):
            card(d, x, y + dy, 560, 240)
            d.ellipse((x + 34, y + 30 + dy, x + 98, y + 94 + dy), fill=RED); T(d, x + 66, y + 62 + dy, n, F(40, 700), WHITE, "mm")
            sz = 32
            while F(sz, 700).getlength(tt) > 410: sz -= 1
            T(d, x + 120, y + 62 + dy, tt, F(sz, 700), DARK, "lm")
            TW(d, x + 34, y + 120 + dy, sub, 28, 400, 490, GREY, 36)
        rise(f, t, ti, fn)

def sc3(f, t, ct):
    heading(f, t, "Die Wissens-Ampel")
    cols = [("Im Kopf", "ohne das kannst du KI-Ergebnisse nicht beurteilen", RED, icon_head, ct(1)),
            ("Lesen & erkennen", "verstehen ja, selbst schreiben nicht zwingend", AMBER, icon_book, ct(2)),
            ("Delegieren", "die KI macht das, du weißt nur, dass es existiert", GREEN, icon_delegate, ct(3))]
    for k, (tt, sub, col, ic, ti) in enumerate(cols):
        x = 60 + k * 400
        def fn(d, dy, x=x, tt=tt, sub=sub, col=col, ic=ic):
            d.rounded_rectangle((x, 130 + dy, x + 360, 530 + dy), 14, fill=WHITE, outline=LINE, width=2)
            d.rounded_rectangle((x, 130 + dy, x + 360, 150 + dy), 8, fill=col)
            ic(d, x + 180, 250 + dy, col)
            T(d, x + 180, 372 + dy, tt, F(36, 700), DARK, "ma")
            TW(d, x + 30, 428 + dy, sub, 25, 400, 300, GREY, 32)
        rise(f, t, ti, fn)
    rise(f, t, ct(4), lambda d, dy: pill(d, 160, 566 + dy, 960, 70, "Bei jedem Thema zeigt die Ampel die passende Stufe", 32))

def sc4(f, t, ct):
    heading(f, t, "Was ist ein Programm?")
    boxes = [("Eingabe", RED, 60), ("Verarbeitung", DARK, 340), ("Ausgabe", GREEN, 620)]
    for i, (lab, col, x) in enumerate(boxes):
        def fn(d, dy, i=i, lab=lab, col=col, x=x):
            d.rounded_rectangle((x, 116, x + 220, 180), 12, fill=col)
            T(d, x + 110, 148, lab, F(30, 700), WHITE, "mm")
            if i < 2: arrow(d, x + 226, 148, x + 274, 148, GREY, 5, 16)
        rise(f, t, ct(1) + 0.3 + i * 0.3, fn)
    CODE = ["kraft = 12000", "flaeche = 80", "spannung = kraft / flaeche", 'print("Spannung in MPa:", spannung)']
    tm = [ct(1) + 1.2 + k * 1.3 for k in range(4)]
    hl = set()
    if ct(2) <= t < ct(3): hl = ({0, 1}, {2}, {3})[min(2, int((t - ct(2)) / 1.6))]
    elif ct(3) <= t < ct(4): hl = {min(3, int((t - ct(3)) / 1.0))}
    for ln in CODE: assert fits_mono(ln, 24, 780 - 62 - 20), ln
    f.el(ap(t, ct(1) + 0.9, 0.4), lambda d, dy: code_panel(d, 60, 210, 780, CODE, tm, t, 24, hl=hl, dim_others=bool(hl)))
    f.el(ap(t, ct(3) + 3.8, 0.4), lambda d, dy: console_panel(d, 60, 400, 780, 100, [(ct(3) + 4.0, O("Spannung in MPa: 150.0", CODE_G))], t, 24))
    def card3(y, ti, big, small, col):
        def fn(d, dy):
            card(d, 880, y + dy, 340, 130); T(d, 906, y + 12 + dy, big, F(30, 700), col)
            TW(d, 906, y + 56 + dy, small, 24, 400, 290, GREY, 30)
        rise(f, t, ti, fn)
    card3(210, ct(3), "Interpreter", "arbeitet Zeile für Zeile von oben nach unten", DARK)
    card3(356, ct(4), "Deterministisch", "gleiche Eingabe, gleiches Ergebnis", GREEN)
    card3(502, ct(5), "KI-Antwort", "kann bei jeder Anfrage anders ausfallen", AMBER)

def sc5(f, t, ct):
    heading(f, t, "Merke dir")
    def fn(d, dy):
        card(d, 60, 140 + dy, 1160, 150)
        T(d, 100, 160 + dy, "KI ist ein starkes Werkzeug.", F(44, 700), DARK)
        T(d, 100, 224 + dy, "Die Verantwortung für das Ergebnis bleibt bei dir.", F(36, 400), RED)
    rise(f, t, ct(0) + 0.2, fn)
    chips = [("Wissen im Kopf", RED), ("Code lesen können", AMBER), ("Größenordnung prüfen", GREEN)]
    for k, (lab, col) in enumerate(chips):
        def fc(d, dy, k=k, lab=lab, col=col):
            x = 60 + k * 395
            d.rounded_rectangle((x, 330 + dy, x + 370, 410 + dy), 40, fill=col)
            assert F(32, 700).getlength(lab) < 330
            T(d, x + 185, 370 + dy, lab, F(32, 700), WHITE, "mm")
        rise(f, t, ct(1) + 0.2 + k * 0.5, fc)
    rise(f, t, ct(2), lambda d, dy: pill(d, 260, 520 + dy, 760, 80, "Weiter: Erste Schritte in Python", 40))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 100, "V01 · Informatik", F(34, 600), GREY)
        T(d, 90, 150, "Warum programmieren,", F(88, 700), DARK)
        T(d, 90, 250, "wenn KI es kann?", F(88, 700), DARK)
        for k, (lab, col, ic) in enumerate((("Im Kopf", RED, icon_head), ("Lesen & erkennen", AMBER, icon_book), ("Delegieren", GREEN, icon_delegate))):
            x = 90 + k * 380
            d.rounded_rectangle((x, 400, x + 340, 650), 14, fill=WHITE, outline=LINE, width=2); d.rounded_rectangle((x, 400, x + 340, 418), 8, fill=col)
            ic(d, x + 170, 490, col); T(d, x + 170, 600, lab, F(32, 700), DARK, "mm")
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "text":
        tot = 0
        for i, s in enumerate(SECS, 1):
            txt = " ".join(sp for _, sp in s); tot += len(txt)
            print(f"s{i} ({len(txt)} Z., {len(txt.split())} W.)")
            open(os.path.join(HERE, "audio", f"s{i}.txt"), "w", encoding="utf-8").write(txt)
        print("Zeichen gesamt", tot, "Woerter", sum(len(sp.split()) for s in SECS for _, sp in s))
    else:
        main(HERE, SECS, SCENES, LABEL, poster, NAME)
