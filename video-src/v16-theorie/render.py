"""V16 Theorie: Rechner und Betriebssystem (Warum ruckelt mein CAD?).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v16-common/tts_run.py v16-theorie)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v16-common"))
from bausteine import *
from texte import SRC

NAME = "v16-theorie"; LABEL = "DHBW · Informatik · V16 · Rechner und Betriebssystem"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Warum ruckelt mein CAD?")
    # links: Monitor mit ruckelnder Baugruppe
    def mon(d, dy):
        d.rounded_rectangle((60, 124 + dy, 560, 424 + dy), 18, fill=WHITE, outline=DARK, width=5)
        d.rounded_rectangle((76, 140 + dy, 544, 408 + dy), 10, fill=(240, 244, 250))
        d.rectangle((280, 424 + dy, 340, 452 + dy), fill=DARK); d.rounded_rectangle((220, 448 + dy, 400, 462 + dy), 6, fill=DARK)
        jit = int(((t * 3) % 1.0) < 0.5) * 6        # ruckelndes Bild
        ang = math.floor(t * 2.2) * 0.35
        gear(d, 250 + jit, 260 + dy, 78, 10, ang, DARK, WHITE)
        gear(d, 372 + jit, 220 + dy, 52, 8, -ang * 1.5 + 0.2, GREY, LIGHTB)
        gear(d, 410 + jit, 330 + dy, 44, 7, -ang * 1.7, GREY, LIGHTA)
        gear(d, 150 + jit, 340 + dy, 40, 7, -ang * 1.9, GREY, LIGHTG)
    f.el(show(t, 0.3), mon, dy=dyf(t, 0.3))
    f.el(show(t, 0.9), lambda d, dy: tag(d, 190, 484 + dy, 240, 44, "ca. 2.000 Teile", WHITE, DARK, 26, 700, outl=LINE), dy=dyf(t, 0.9))
    f.el(show(t, ct(0) + 2.0), lambda d, dy: tag(d, 100, 548 + dy, 420, 44, "Bild ruckelt beim Drehen", LIGHTR, RED, 26, 700, outl=RED), dy=dyf(t, ct(0) + 2.0))
    # rechts: Task-Manager
    tm = {"frame": ct(1) - 0.2, "cpu": ct(1) + 0.4, "kerne": ct(1) + 2.6, "ram": ct(2) + 0.3, "net": ct(2) + 3.0}
    hot = {"kern": ap(t, ct(1) + 4.5, 0.4) * (1 - ap(t, ct(2), 0.3)), "ram": ap(t, ct(2) + 2.0, 0.4) * (1 - ap(t, ct(2) + 3.0, 0.3)),
           "net": ap(t, ct(2) + 4.5, 0.4)}
    taskmgr(f, t, 620, 120, 600, 476, tm, hot)
    def q(d, dy):
        tag(d, 620, 616 + dy, 600, 56, "Wo ist der Engpass?", RED, WHITE, 32)
    f.el(show(t, ct(3) + 0.1), q, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 2 Bausteine
def box_(d, x, y, w, h, title, sub=None, fill=WHITE, col=DARK):
    d.rounded_rectangle((x, y, x + w, y + h), 16, fill=fill, outline=col, width=3)
    T2(d, x + w / 2, y + 22, title, F(34, 700), col, "ma")
    if sub: T2(d, x + w / 2, y + 72, sub, F(22, 600), GREY, "ma")

def sc2(f, t, ct):
    heading(f, t, "Die Bausteine des Rechners")
    BY = 346
    def bus(d, dy):
        d.rectangle((120, BY - 5 + dy, 1160, BY + 5 + dy), fill=GREY)
        T2(d, 455, BY - 12 + dy, "Datenwege", F(20, 700), GREY, "ms")
    f.el(show(t, 0.3), bus)
    # CPU
    def cpu(d, dy):
        box_(d, 120, 130 + dy, 300, 170, "CPU", None, LIGHTB, BLUE)
        for k in range(4):
            cx = 140 + (k % 2) * 60; cy = 204 + (k // 2) * 46 + dy
            d.rounded_rectangle((cx, cy, cx + 48, cy + 38), 6, fill=WHITE, outline=BLUE, width=2)
        T2(d, 270, 214 + dy, "mehrere Kerne", F(21, 600), DARK, "la"); T2(d, 270, 244 + dy, "Takt: GHz", F(21, 600), DARK, "la")
        d.line((270, 300 + dy, 270, BY - 5 + dy), fill=BLUE, width=4)
    f.el(show(t, 0.5), cpu, dy=dyf(t, 0.5))
    # RAM
    def ram(d, dy):
        box_(d, 490, 130 + dy, 300, 170, "RAM", "Arbeitsspeicher", LIGHTA, AMB)
        d.line((640, 300 + dy, 640, BY - 5 + dy), fill=AMB, width=4)
    f.el(show(t, ct(2) - 0.2), ram, dy=dyf(t, ct(2) - 0.2))
    f.el(show(t, ct(2) + 1.8), lambda d, dy: tag(d, 540, 246 + dy, 200, 36, "flüchtig", WHITE, AMB, 22, 700, outl=AMBER), dy=dyf(t, ct(2) + 1.8))
    # GPU
    def gpu(d, dy):
        box_(d, 860, 130 + dy, 300, 170, "GPU", "zeichnet das Bild", LIGHTG, GREEN)
        d.line((1010, 300 + dy, 1010, BY - 5 + dy), fill=GREEN, width=4)
    f.el(show(t, ct(3) + 2.4), gpu, dy=dyf(t, ct(3) + 2.4))
    # SSD
    def ssd(d, dy):
        box_(d, 120, 392 + dy, 300, 170, "SSD", "Massenspeicher", LIGHTK, DARK)
        d.line((270, BY + 5 + dy, 270, 392 + dy), fill=DARK, width=4)
    f.el(show(t, ct(3) - 0.2), ssd, dy=dyf(t, ct(3) - 0.2))
    f.el(show(t, ct(3) + 1.0), lambda d, dy: tag(d, 170, 508 + dy, 200, 36, "dauerhaft", WHITE, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ct(3) + 1.0))
    # Netzwerk
    def net(d, dy):
        box_(d, 490, 392 + dy, 300, 170, "Netzwerk", "Server, Netzlaufwerk", LIGHTK, DARK)
        d.line((640, BY + 5 + dy, 640, 392 + dy), fill=DARK, width=4)
    f.el(show(t, ct(3) + 3.4), net, dy=dyf(t, ct(3) + 3.4))
    # von Neumann
    def vn(d, dy):
        d.rounded_rectangle((860, 392 + dy, 1160, 562 + dy), 16, fill=WHITE, outline=RED, width=3)
        T2(d, 1010, 412 + dy, "von Neumann", F(30, 700), RED, "ma")
        chip(d, 884, 462 + dy, 124, 44, "Programm", LIGHTB, BLUE, 22); chip(d, 1018, 462 + dy, 124, 44, "Daten", LIGHTA, AMB, 22)
        T2(d, 1010, 524 + dy, "im selben Speicher", F(22, 600), GREY, "ma")
    f.el(show(t, ct(4) + 0.1), vn, dy=dyf(t, ct(4) + 0.1))
    def befehl(d, dy):
        a = (t * 1.2) % 1.0
        # Befehl wandert vom Speicher (RAM) zur CPU
        x = 640 + (270 - 640) * a
        d.rounded_rectangle((x - 34, BY - 16 + dy, x + 34, BY + 16 + dy), 8, fill=RED)
        T2(d, x, BY + dy, "Befehl", F(18, 700), WHITE, "mm")
    f.el(show(t, ct(4) + 1.2), befehl)
    f.el(show(t, ct(4) + 1.2), lambda d, dy: T2(d, 640, 600 + dy, "Die CPU holt Befehl für Befehl aus dem Speicher.", F(28, 700), GREY, "ma"))

# ---------------------------------------------------------------- 3 Speicherhierarchie
HIER = [("Cache (CPU)", "ca. 1 ns", "ca. 1 s", 0.0, GREEN),
        ("RAM", "ca. 100 ns", "knapp 2 min", 2.0, GREEN),
        ("SSD (NVMe)", "ca. 100 µs", "gut 1 Tag", 5.0, BLUE),
        ("Netzlaufwerk", "ab ca. 1 ms", "knapp 2 Wochen+", 6.0, AMB),
        ("Festplatte (HDD)", "ca. 10 ms", "ca. 4 Monate", 7.0, RED)]

def sc3(f, t, ct):
    heading(f, t, "Speicherhierarchie auf menschliches Maß")
    X0, X1 = 520, 960
    def head(d, dy):
        for x, txt, an in ((60, "Speicher", "la"), (300, "Zugriff real", "la"), (X0, "Balken (logarithmisch)", "la"), (1220, "wenn 1 ns = 1 s", "ra")):
            T2(d, x, 124 + dy, txt, F(22, 700), GREY, an)
        d.line((60, 160 + dy, 1220, 160 + dy), fill=LINE, width=2)
    f.el(show(t, 0.3), head, dy=dyf(t, 0.3))
    # Reihenfolge des Erscheinens richtet sich nach dem Text
    t_name = [ct(0) + 0.6, ct(2) + 0.2, ct(3) + 0.2, ct(3) + 2.6, ct(3) + 1.6]
    t_real = [ct(2) + 0.1, ct(2) + 1.6, ct(3) + 0.4, ct(3) + 2.8, ct(3) + 1.8]
    t_hum = [ct(1) + 1.0, ct(2) + 3.2, ct(3) + 1.0, ct(3) + 4.2, ct(3) + 3.0]
    for k, (nm, real, hum, lg, col) in enumerate(HIER):
        y = 176 + k * 78
        def row(d, dy, k=k, nm=nm, real=real, lg=lg, col=col, y=y):
            d.rounded_rectangle((60, y + dy, 1220, y + 66 + dy), 12, fill=WHITE, outline=LINE, width=2)
            T2(d, 82, y + 33 + dy, nm, F(26, 700), DARK, "lm")
            a = ap(t, t_real[k], 0.4)
            if a > 0:
                T2(d, 300, y + 33 + dy, real, F(26, 600), mix(WHITE, DARK, a), "lm")
                L = max(14, (lg + 1) / 8.0 * (X1 - X0)) * clamp((t - t_real[k]) / 0.9)
                d.rounded_rectangle((X0, y + 18 + dy, X0 + L, y + 48 + dy), 8, fill=col)
        f.el(show(t, t_name[k]), row, dy=dyf(t, t_name[k]))
        def hm(d, dy, k=k, hum=hum, col=col, y=y):
            T2(d, 1196, y + 33 + dy, hum, F(28, 700), col, "rm")
        f.el(show(t, t_hum[k]), hm, dy=dyf(t, t_hum[k]))
    f.el(show(t, ct(0) + 0.2), lambda d, dy: (T2(d, 60, 594 + dy, "schnell · klein · teuer", F(24, 700), GREEN, "la"),
                                           arrow(d, 360, 607 + dy, 800, 607 + dy, GREY, 4, 12),
                                           T2(d, 1220, 594 + dy, "langsam · groß · günstig", F(24, 700), RED, "ra")))
    f.el(show(t, ct(1) + 0.2), lambda d, dy: tag(d, 440, 632 + dy, 400, 40, "1 ns = 1 s: menschliches Maß", RED, WHITE, 24), dy=dyf(t, ct(1) + 0.2))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: tag(d, 960, 632 + dy, 260, 40, "RAM → SSD: Faktor 1000", LIGHTR, RED, 22, 700, outl=RED), dy=dyf(t, ct(4) + 0.2))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: T2(d, 60, 646 + dy, "Zahlen: Größenordnungen (ca.)", F(22, 600), GREY, "lm"))

# ---------------------------------------------------------------- 4 Betriebssystem
def sc4(f, t, ct):
    heading(f, t, "Das Betriebssystem: der Vermittler")
    # oben Programme, Mitte Betriebssystem, unten Hardware
    def top(d, dy):
        x = 60
        for nm in ("CAD", "Browser", "Teams", "Messprogramm"):
            w = chip_w(nm, 26, 18); chip(d, x, 116 + dy, w, 44, nm, LIGHTB, BLUE, 26); x += w + 14
        T2(d, 1220, 138 + dy, "Programme", F(24, 700), GREY, "rm")
    f.el(show(t, 0.3), top, dy=dyf(t, 0.3))
    f.el(show(t, 0.5), lambda d, dy: (d.rounded_rectangle((60, 176 + dy, 1220, 226 + dy), 12, fill=DARK),
                                       T2(d, 640, 201 + dy, "Betriebssystem (Windows, Linux, macOS)", F(28, 700), WHITE, "mm")))
    f.el(show(t, 0.7), lambda d, dy: (d.rounded_rectangle((60, 612 + dy, 1220, 660 + dy), 12, fill=LIGHTK, outline=LINE, width=2),
                                       T2(d, 640, 636 + dy, "Hardware: CPU · RAM · SSD · GPU", F(26, 700), GREY, "mm")))
    TW = 276; XS = [60, 356, 652, 948]; TY = 246; TH = 344
    def tile(d, dy, k, title):
        card(d, XS[k], TY + dy, TW, TH); T2(d, XS[k] + 28, TY + 14 + dy, title, F(28, 700), DARK, "la")
    # 1 Prozesse mit Zeitscheiben auf zwei Kernen
    def pr(d, dy):
        tile(d, dy, 0, "1  Prozesse")
        cols = [BLUE, GREEN, AMB, RED]; names = ["CAD", "Brow", "Teams", "Scan"]
        for kern in range(2):
            T2(d, XS[0] + 28, TY + 84 + kern * 70 + dy, f"Kern {kern + 1}", F(20, 600), GREY, "la")
            for s in range(4):
                k = (s + kern * 2) % 4; x = XS[0] + 28 + s * 56; a = ap(t, ct(1) + 1.5 + 0.5 * (s + 4 * kern), 0.3)
                col = mix(WHITE, cols[k], a)
                d.rounded_rectangle((x, TY + 108 + kern * 70 + dy, x + 52, TY + 144 + kern * 70 + dy), 6, fill=col)
                if a > 0.5: T2(d, x + 26, TY + 126 + kern * 70 + dy, names[k], F(15, 700), WHITE, "mm")
        T2(d, XS[0] + 28, TY + 252 + dy, "Scheduler: Zeitscheiben", F(22, 700), BLUE, "la")
        T2(d, XS[0] + 28, TY + 284 + dy, "verteilt auf die Kerne", F(22, 400), GREY, "la")
    f.el(show(t, ct(1) + 0.1), pr, dy=dyf(t, ct(1) + 0.1))
    # 2 Speicher mit Auslagerung
    def sp(d, dy):
        tile(d, dy, 1, "2  Speicher")
        x = XS[1] + 28
        d.rounded_rectangle((x, TY + 80 + dy, x + 220, TY + 130 + dy), 8, fill=WHITE, outline=AMB, width=3)
        segs = [(0.0, 0.34, BLUE), (0.34, 0.62, GREEN), (0.62, 1.0, AMB)]
        for a0, b0, c0 in segs: d.rectangle((x + 4 + a0 * 212, TY + 84 + dy, x + 4 + b0 * 212, TY + 126 + dy), fill=c0)
        T2(d, x + 110, TY + 148 + dy, "RAM voll", F(22, 700), AMB, "ma")
        a = ap(t, ct(2) + 2.4, 0.5)
        if a > 0:
            col = mix(WHITE, RED, a); arrow(d, x + 110, TY + 180 + dy, x + 110, TY + 214 + dy, col, 5, 14)
            d.rounded_rectangle((x, TY + 220 + dy, x + 220, TY + 262 + dy), 8, fill=mix(WHITE, LIGHTK, a), outline=col, width=3)
            T2(d, x + 110, TY + 241 + dy, "SSD: Auslagerung", F(22, 700), col, "mm")
            T2(d, x + 110, TY + 284 + dy, "ca. 1000-mal langsamer", F(22, 700), col, "ma")
    f.el(show(t, ct(2) + 0.1), sp, dy=dyf(t, ct(2) + 0.1))
    # 3 Dateisystem
    def fs(d, dy):
        tile(d, dy, 2, "3  Dateisystem")
        x = XS[2] + 30; y = TY + 84 + dy
        rows = [(0, "Ordner", True), (1, "Ordner", True), (2, "Datei", False), (1, "Datei", False)]
        for k, (dep, nm, dr) in enumerate(rows):
            xx = x + dep * 30; yy = y + k * 44
            (folder_icon if dr else file_icon)(d, xx, yy)
            T2(d, xx + 36, yy + 12, nm, F(22, 600), DARK, "lm")
        T2(d, XS[2] + 28, TY + 276 + dy, "Baum aus Ordnern", F(22, 700), DARK, "la")
        T2(d, XS[2] + 28, TY + 306 + dy, "Namen, Größe, Rechte", F(22, 400), GREY, "la")
    f.el(show(t, ct(3) + 0.1), fs, dy=dyf(t, ct(3) + 0.1))
    # 4 Treiber
    def dr(d, dy):
        tile(d, dy, 3, "4  Treiber")
        x = XS[3] + 28
        d.rounded_rectangle((x, TY + 88 + dy, x + 100, TY + 150 + dy), 8, fill=LIGHTG, outline=GREEN, width=3); T2(d, x + 50, TY + 119 + dy, "GPU", F(26, 700), GREEN, "mm")
        arrow(d, x + 108, TY + 119 + dy, x + 142, TY + 119 + dy, GREY, 4, 12)
        d.rounded_rectangle((x + 148, TY + 88 + dy, x + 232, TY + 150 + dy), 8, fill=LIGHTB, outline=BLUE, width=3); T2(d, x + 190, TY + 119 + dy, "Treiber", F(20, 700), BLUE, "mm")
        a = ap(t, ct(3) + 2.4, 0.5)
        if a > 0:
            d.ellipse((x + 4, TY + 180 + dy, x + 40, TY + 216 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 22, TY + 198 + dy, 22, WHITE, 4)
            T2(d, x + 52, TY + 198 + dy, "zertifiziert", F(24, 700), mix(WHITE, GREEN, a), "lm")
        T2(d, XS[3] + 28, TY + 256 + dy, "bei CAD wichtig:", F(22, 700), DARK, "la"); T2(d, XS[3] + 28, TY + 286 + dy, "Grafiktreiber", F(22, 400), GREY, "la")
    f.el(show(t, ct(3) + 0.8), dr, dy=dyf(t, ct(3) + 0.8))

# ---------------------------------------------------------------- 5 Prozess und Thread
def sc5(f, t, ct):
    heading(f, t, "Prozess, Thread und der eine Kern")
    # links oben: Prozess mit einem Thread
    def pr(d, dy):
        card(d, 60, 116 + dy, 540, 190)
        T2(d, 90, 128 + dy, "Prozess: CAD", F(28, 700), DARK, "la")
        d.rounded_rectangle((90, 180 + dy, 330, 236 + dy), 12, fill=LIGHTB, outline=BLUE, width=3)
        T2(d, 210, 208 + dy, "Thread 1", F(26, 700), BLUE, "mm")
        for k in range(5):
            x = 350 + k * 44; d.rounded_rectangle((x, 188 + dy, x + 36, 228 + dy), 6, fill=WHITE, outline=GREY, width=2)
            T2(d, x + 18, 208 + dy, str(k + 1), F(20, 700), GREY, "mm")
        arrow(d, 336, 208 + dy, 346, 208 + dy, GREY, 3, 8)
        T2(d, 90, 252 + dy, "arbeitet Schritt für Schritt nacheinander", F(22, 600), GREY, "la")
    f.el(show(t, 0.3), pr, dy=dyf(t, 0.3))
    # rechts oben: Feature-Baum
    FE = ["Skizze", "Extrusion", "Bohrung", "Muster", "Rundung"]
    def fb(d, dy):
        card(d, 640, 116 + dy, 580, 190)
        T2(d, 670, 128 + dy, "Feature-Baum im CAD", F(28, 700), DARK, "la")
        x = 670
        for k, nm in enumerate(FE):
            w = chip_w(nm, 20, 10)
            on = t >= ct(2) + 1.0 + 1.0 * k
            lit = on and not (t >= ct(2) + 2.0 + 1.0 * k)
            chip(d, x, 190 + dy, w, 46, nm, LIGHTR if lit else (LIGHTG if on else WHITE), RED if lit else (GREEN if on else GREY), 20)
            if k < len(FE) - 1: arrow(d, x + w + 1, 213 + dy, x + w + 9, 213 + dy, GREY, 3, 7)
            x += w + 11
        T2(d, 670, 252 + dy, "jedes Feature baut auf dem vorigen auf", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.1), fb, dy=dyf(t, ct(2) + 0.1))
    # Kerne
    def cores(d, dy):
        T2(d, 60, 330 + dy, "8 Kerne", F(26, 700), GREY, "la")
        for k, v in enumerate(KERNE_HOOK):
            x = 60 + (k % 4) * 168; y = 372 + (k // 4) * 120 + dy
            d.rounded_rectangle((x, y, x + 150, y + 100), 12, fill=WHITE, outline=RED if v >= 90 else LINE, width=3)
            if v > 0: d.rounded_rectangle((x + 4, y + 96 - 92 * v / 100, x + 146, y + 96), 8, fill=RED)
            T2(d, x + 75, y + 50, f"{v} %" if v else "frei", F(30 if v else 24, 700), WHITE if v >= 90 else GREY, "mm")
    f.el(show(t, ct(1) + 0.1), cores, dy=dyf(t, ct(1) + 0.1))
    f.el(show(t, ct(1) + 1.6), lambda d, dy: tag(d, 330, 322 + dy, 360, 36, "nur auf höchstens einem Kern", LIGHTB, BLUE, 22, 700, outl=BLUE), dy=dyf(t, ct(1) + 1.6))
    # Rechnung
    def calc(d, dy):
        card(d, 740, 340 + dy, 480, 250)
        T2(d, 770, 354 + dy, "Gesamtanzeige", F(26, 700), DARK, "la")
        a1 = ap(t, ct(3) + 0.8, 0.4); a2 = ap(t, ct(3) + 2.6, 0.4); a3 = ap(t, ct(3) + 4.4, 0.4)
        T2(d, 770, 410 + dy, "100 % : 8 Kerne", F(40, 700), mix(WHITE, DARK, a1), "la")
        T2(d, 770, 468 + dy, "= 12,5 %", F(40, 700), mix(WHITE, RED, a2), "la")
        T2(d, 770, 528 + dy, "Task-Manager: 13 %", F(30, 700), mix(WHITE, GREEN, a3), "la")
    f.el(show(t, ct(3) + 0.1), calc, dy=dyf(t, ct(3) + 0.1))
    f.el(show(t, ct(3) + 5.0), lambda d, dy: tag(d, 740, 608 + dy, 480, 44, "Drehen und Rendern: die GPU", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=dyf(t, ct(3) + 5.0))

# ---------------------------------------------------------------- 6 Aufloesung
def sc6(f, t, ct):
    heading(f, t, "Auflösung: drei Engpässe, ein Plan")
    tm = {"frame": 0.2, "cpu": 0.3, "kerne": 0.3, "ram": 0.3, "net": 0.3}
    hot = {"kern": ap(t, ct(0) + 0.6, 0.4), "ram": ap(t, ct(0) + 1.8, 0.4), "net": ap(t, ct(0) + 3.0, 0.4)}
    taskmgr(f, t, 60, 112, 520, 480, tm, hot, titel="Task-Manager")
    rows = []
    rows.append(("Baugruppe vereinfachen", RED, ct(1) + 0.2)); rows.append(("Teile unterdrücken", RED, ct(1) + 1.6))
    rows.append(("andere Programme schließen", AMB, ct(1) + 2.8)); rows.append(("Kopie auf der SSD, lokal arbeiten", BLUE, ct(2) + 0.4))
    rows.append(("Takt pro Kern vor Kernzahl", RED, ct(3) + 0.3)); rows.append(("mehr RAM", AMB, ct(3) + 2.4))
    rows.append(("zertifizierter Grafiktreiber", GREY, ct(3) + 3.6))
    for k, (txt, col, tin) in enumerate(rows):
        y = 118 + k * 66
        def rw(d, dy, txt=txt, col=col, y=y):
            d.rounded_rectangle((620, y + dy, 1220, y + 54 + dy), 12, fill=WHITE, outline=LINE, width=2)
            d.ellipse((636, y + 15 + dy, 660, y + 39 + dy), fill=col)
            fit(txt, F(28, 700), 520, "Massnahme"); T2(d, 676, y + 27 + dy, txt, F(28, 700), DARK, "lm")
        f.el(show(t, tin), rw, dy=dyf(t, tin))
    def diag(d, dy):
        d.rounded_rectangle((60, 612 + dy, 1220, 672 + dy), 14, fill=LIGHTG, outline=GREEN, width=3)
        T2(d, 640, 642 + dy, "Diagnose statt „der Rechner ist langsam“", F(32, 700), GREEN, "mm")
    f.el(show(t, ct(4) + 0.2), diag, dy=dyf(t, ct(4) + 0.2))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V16 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Warum ruckelt mein CAD?", F(88, 700), DARK)
        T2(d, 90, 290, "Rechner und Betriebssystem kompakt", F(48, 400), GREY)
        x = 90
        for nm, (fill, col) in (("CPU", (LIGHTB, BLUE)), ("RAM", (LIGHTA, AMB)), ("SSD", (LIGHTK, DARK)), ("GPU", (LIGHTG, GREEN))):
            wd = chip_w(nm, 40, 30); chip(d, x, 430, wd, 84, nm, fill, col, 40); x += wd + 16
        gear(d, 1010, 480, 110, 10, 0.2, DARK, WHITE); gear(d, 1160, 400, 60, 8, 0.5, GREY, LIGHTB)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
