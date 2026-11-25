"""V02 Python: Rechnen mit int. Aufruf: python render.py [text|tts|stills t1 t2..|full|mux]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from h import *
from pages import page_scene, O
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v02-python"; LABEL = "DHBW · Informatik · V02 · Rechnen mit int"

SRC = [
 ["In Python rechnest du mit `int`, also mit ganzen Zahlen.",
  "Plus, Minus und Mal funktionieren wie gewohnt, nur dass Mal als Sternchen geschrieben wird.",
  "7 + 3 ist 10, 7 − 3 ist 4, 7 · 3 ist 21.",
  "Das Ergebnis bleibt dabei ein `int`."],
 ["Der einfache Schrägstrich dividiert und liefert immer einen `float`, auch wenn die Division aufgeht.",
  "7 / 2 ergibt [[3.5|drei Komma fünf]], 6 / 3 ergibt [[2.0|zwei Komma null]].",
  "Zwei Sterne potenzieren: 2 ** 10 ist 1024.",
  "Brauchst du eine ganze Zahl als Ergebnis, nimmst du den doppelten Schrägstrich."],
 ["Jetzt das wichtigste Paar: [[//|Der doppelte Schrägstrich]] liefert den Ganzteil der Division, [[%|das Prozentzeichen]] den Rest.",
  "[[17 // 5|siebzehn durch fünf]] ergibt 3, [[17 % 5|siebzehn modulo fünf]] ergibt 2.",
  "Die beiden gehören zusammen: 3 · 5 + 2 ergibt wieder 17.",
  "Praktisch: Aus 4000 Sekunden werden 66 Minuten und 40 Sekunden.",
  "Dasselbe Muster gilt für Zähler, Stückzahlen und Zeiten: erst der Ganzteil, dann der Rest."],
 ["Python beachtet die Rangfolge wie in der Mathematik: Potenz vor Punkt vor Strich.",
  "2 + 3 * 4 ergibt 14, weil zuerst multipliziert wird.",
  "Mit Klammern erzwingst du die Reihenfolge: [[(2 + 3) * 4|Klammer auf zwei plus drei Klammer zu mal vier]] ergibt 20.",
  "Und 2 * 3 ** 2 ist 18, denn die Potenz kommt zuerst.",
  "Im Zweifel setze Klammern, das liest sich auch besser."],
 ["Zwischen den Zahlensystemen wandelst du mit drei Funktionen um.",
  "`bin()` liefert die Binärschreibweise als Text, mit dem Präfix `0b`.",
  "`hex()` liefert die Hexschreibweise mit dem Präfix `0x`, in Kleinbuchstaben.",
  "Zurück geht es mit `int()` und der Basis als zweitem Argument: Aus [[\"1010\"|dem Text eins null eins null]] zur Basis 2 wird 10, aus [[\"ff\"|dem Text f f]] zur Basis 16 wird 255.",
  "Die Präfixe sind nur Beschriftung: Der Wert der Zahl bleibt derselbe."],
 ["Anders als in der SPS ist ein Python-int beliebig groß, er wächst einfach mit.",
  "2 ** 100 hat 31 Stellen und läuft nie über, ganz anders als ein Zähler mit 16 Bit.",
  "Einen Überlauf simulierst du selbst: Der Rest modulo 2 ** 16 lässt den Wert wieder bei 0 beginnen.",
  "Und teilst du durch null, meldet Python einen `ZeroDivisionError` und bricht ab.",
  "Lies die Meldung, sie sagt dir genau, was los ist. Probier alles selbst aus!"],
]
SECS = make_secs(SRC)   # Untertitel = anzeige(text), Audio = sprechfassung(text)

def OUT(lines, col=CODE_T): return [O(l, col) for l in run("\n".join(lines))]
def page(t0, code, tcode, tout, tiles, hl=None, ocol=CODE_T):
    outs = OUT(code, ocol)
    assert len(outs) == len(tout)
    return dict(t0=t0, code=[(tcode[i], c) for i, c in enumerate(code)], out=[(tout[i], o) for i, o in enumerate(outs)], tiles=tiles, hl=hl)

def sc1(f, t, ct):
    heading(f, t, "1 · Grundrechenarten mit int")
    page_scene(f, t, ct, [page((0, 0.5), ["print(7 + 3)", "print(7 - 3)", "print(7 * 3)", "print(type(7 * 3))"],
        [(0, 2.0), (2, 0.2), (2, 1.0), (3, 0.1)], [(1, 0.7), (2, 0.8), (2, 1.6), (3, 0.9)],
        [((1, 0.4), "+", "Addition", DARK), ((2, 0.5), "−", "Subtraktion", DARK), ((2, 1.3), "*", "Multiplikation", DARK), ((3, 1.0), "int", "ganze Zahl bleibt ganze Zahl", GREEN)])])

def sc2(f, t, ct):
    heading(f, t, "2 · Division und Potenz")
    page_scene(f, t, ct, [page((0, 0.5), ["print(7 / 2)", "print(6 / 3)", "print(2 ** 10)", "print(7 // 2)"],
        [(0, 1.3), (1, 0.2), (2, 0.2), (3, 0.3)], [(0, 1.9), (1, 0.9), (2, 0.9), (3, 1.2)],
        [((0, 1.4), "/", "Division: immer ein float", RED), ((1, 0.5), "2.0", "auch 6 / 3 ist ein float", RED), ((2, 0.4), "**", "Potenz: 2 ** 10 = 1024", DARK), ((3, 1.2), "//", "ganzzahlig: 7 // 2 = 3", GREEN)])])

def sc3(f, t, ct):
    heading(f, t, "3 · // und % als Paar")
    p1 = page((0, 0.5), ["print(17 // 5)", "print(17 % 5)", "print(3 * 5 + 2)"],
        [(0, 4.5), (1, 1.0), (2, 0.3)], [(1, 0.8), (1, 1.6), (2, 1.2)],
        [((0, 0.6), "//", "Ganzteil der Division", DARK), ((1, 1.0), "%", "Rest der Division", DARK), ((2, 1.2), "3 · 5 + 2", "ergibt wieder 17", GREEN)])
    p2 = page((3, -0.3), ["sekunden = 4000", 'print(sekunden // 60, "min", sekunden % 60, "s")'],
        [(3, 0.0), (3, 0.9)], [(3, 2.6)],
        [((3, 1.0), "// 60", "volle Minuten: 66", DARK), ((3, 2.7), "% 60", "übrige Sekunden: 40", DARK)])
    page_scene(f, t, ct, [p1, p2], code_size=24)

def sc4(f, t, ct):
    heading(f, t, "4 · Rangfolge und Klammern")
    page_scene(f, t, ct, [page((0, 0.5), ["print(2 + 3 * 4)", "print((2 + 3) * 4)", "print(2 * 3 ** 2)"],
        [(1, 0.2), (2, 0.2), (3, 0.0)], [(1, 1.0), (2, 1.4), (3, 1.0)],
        [((0, 0.6), "** vor * vor +", "Potenz vor Punkt vor Strich", DARK), ((1, 1.2), "14", "erst 3 * 4 = 12, dann + 2", DARK),
         ((2, 1.6), "20", "Klammer zuerst: 5 * 4", GREEN), ((3, 1.2), "18", "erst 3 ** 2 = 9, dann * 2", DARK)])])

def sc5(f, t, ct):
    heading(f, t, "5 · bin(), hex() und int(text, basis)")
    page_scene(f, t, ct, [page((0, 0.5), ["print(bin(45))", "print(hex(45))", 'print(int("1010", 2))', 'print(int("ff", 16))'],
        [(1, 0.2), (2, 0.2), (3, 3.5), (3, 9.0)], [(1, 1.0), (2, 1.2), (3, 8.2), (3, 14.0)],
        [((1, 0.9), "bin()", "Zahl → Text mit 0b", DARK), ((2, 1.0), "hex()", "Zahl → Text mit 0x", DARK),
         ((3, 8.3), 'int("1010", 2)', "Text + Basis → Zahl", GREEN), ((3, 14.0), 'int("ff", 16)', "Basis 16 → 255", GREEN)])])

def sc6(f, t, ct):
    heading(f, t, "6 · Große Zahlen, Überlauf und Fehler")
    p1 = page((0, 0.5), ["print(2 ** 100)", "print(65536 % 2 ** 16)", "print(65540 % 2 ** 16)"],
        [(0, 3.5), (2, 0.4), (2, 1.9)], [(1, 1.2), (2, 1.4), (2, 2.9)],
        [((0, 0.7), "int", "in Python beliebig groß", GREEN), ((1, 1.3), "31 Stellen", "2 ** 100 läuft nie über", DARK),
         ((2, 1.5), "% 2 ** 16", "simuliert 16 Bit: 65536 → 0", DARK), ((2, 3.0), "65540 → 4", "Wert beginnt neu", DARK)])
    TB = O("Traceback (most recent call last):", CODE_C)
    p2 = dict(t0=(3, -0.2), code=[((3, 0.2), "print(5 / 0)")],
        out=[((3, 1.4), TB), ((3, 1.8), O("ZeroDivisionError: division by zero", CODE_R))],
        tiles=[((3, 0.3), "Neuer Lauf", "nur diese eine Zeile", DARK), ((3, 1.8), "ZeroDivisionError", "Programm bricht hier ab", RED)])
    page_scene(f, t, ct, [p1, p2])
    def end(d, dy):
        d.rounded_rectangle((60, 590 + dy, 820, 660 + dy), 35, fill=RED)
        T(d, 440, 625 + dy, "Probier alles selbst aus!", F(40, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 1.6, 0.5), end, dy=int((1 - ap(t, ct(4) + 1.6, 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 130, "V02 · Informatik", F(34, 600), GREY)
        T(d, 90, 180, "Rechnen mit int", F(104, 700), DARK)
        T(d, 90, 310, "Operatoren, // und %, bin() und hex()", F(52, 400), GREY)
        code_panel(d, 90, 410, 900, ["print(5000 // 1024, 5000 % 1024)", "print(bin(45), hex(45))", "print(2 ** 100)"], [0, 0, 0], 9, 32, lineno=False)
        for i, (lab, c) in enumerate((("+  -  *", DARK), ("/  **", DARK), ("//  %", RED))):
            d.rounded_rectangle((1030, 410 + i * 70, 1210, 466 + i * 70), 8, fill=c)
            T(d, 1120, 438 + i * 70, lab, M(30, True), WHITE, "mm")
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
