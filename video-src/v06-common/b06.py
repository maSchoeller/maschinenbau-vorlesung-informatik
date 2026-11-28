"""Baustein fuer das Video v06-beispiel (Kino): Plan mit der Raute in der Raute und einer Entscheidung im inneren Rumpf.

Baut auf v04-common/b04.py auf (alles von dort ist mit importiert: schleife_draw, reveal, weg_vis, weg_hl, E, kopf, ...).
b04.schleife_plan kennt keine Entscheidung im Rumpf; deshalb ist der Kino-Plan hier von Hand gesetzt (feste Lage, alle Symbole
auf einer Mittellinie, ja geht unten durch das Symbol, nein rechts daran vorbei, beide laufen in einem Punkt zusammen).
Die Linienfuehrung entspricht der Lern-App (pap-engine.js): Ruecksprung links nach oben und von links in die Linie ueber der
Raute, nein rechts hinaus und unten weiter.

    P = kino_plan()                 # Dia mit .reihenfolge, .into, .luecke (Zusammenfuehrungspunkt)
    W = kino_weg(P, [[1, 0, 1], [1, 1, 0]])   # Lauf: je Reihe die Plaetze (1 belegt, 0 frei)
    schleife_draw(f, 1.0, P, box, vis=weg_vis(W), hl=weg_hl(W))
"""
import os, sys
HERE_B06 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE_B06, "..", "v04-common"))
from b04 import *

KINO_FS, KINO_GAP = 18, 10
MIN_SCHRIFT = 14.0        # kleinste Schrift im Plan (b04 verlangt 17; der Kino-Plan hat 12 Symbole und waere dann zu hoch)


def kino_plan(fs=KINO_FS, gap=KINO_GAP):
    D = Dia(fs); D.reihenfolge = []; D.into = {}; D.luecke = None
    spec = [("s", "term", "Start"), ("r", "io", "Eingabe: reihen"), ("p", "io", "Eingabe: plaetze"), ("b", "proc", "belegt = 0"),
            ("wi", "dec", "i von 1 bis reihen?"), ("wj", "dec", "j von 1 bis plaetze?"), ("e", "io", "Eingabe: platz"),
            ("d", "dec", "platz == 1?"), ("a", "proc", "belegt = belegt + 1"), ("g", "proc", "gesamt = reihen * plaetze"),
            ("o", "io", "Ausgabe: belegt, gesamt"), ("end", "term", "Ende")]
    for k, kind, txt in spec: D.node(k, kind, txt, 0, 0)
    N = D.nodes
    y = 0.0; ey = {}
    def setze(k, extra=0.0):
        nonlocal y
        N[k].cy = y + extra + N[k].h / 2; y = N[k].cy + N[k].h / 2 + gap
    for k in ("s", "r", "p", "b"): setze(k)
    ey["wi"] = y - 5; setze("wi")
    y += 10; ey["wj"] = y - 5; setze("wj")                     # nach einer Raute mehr Platz fuer die Beschriftung ja
    y += 10; setze("e"); setze("d")
    y += 10; setze("a")
    ym = N["a"].cy + N["a"].h / 2 + gap * 0.9                  # Zusammenfuehrung hinter dem if
    reti = ym + gap * 0.9                                       # Ruecksprung der inneren Schleife
    reto = reti + gap * 1.6                                     # Ruecksprung der aeusseren Schleife (inneres nein laeuft hinein)
    y = reto + gap * 1.2
    for k in ("g", "o", "end"): setze(k)
    # Breiten: links die beiden Rueckspruenge, rechts die vier Umwege (nein von d, wj, wi)
    hw = {k: N[k].w / 2 for k in N}
    xl_j = -(max(hw["wj"], hw["e"], hw["d"], hw["a"]) + 26)
    xl_i = xl_j - 26
    rx_d = hw["d"] + 24
    rx_j = max(hw["wj"], rx_d, hw["a"]) + 28
    rx_i = max(hw["wi"], rx_j) + 28
    JA = (12, 17, "ls")
    def ede(a, b, label=None):
        D.edge(f"{a}-{b}", a, "b", b, "t", label=label, lab=JA if label else None); D.into[b] = f"{a}-{b}"
    for a_, b_ in (("s", "r"), ("r", "p"), ("p", "b"), ("b", "wi"), ("e", "d"), ("g", "o"), ("o", "end")): ede(a_, b_)
    ede("wi", "wj", "ja"); ede("wj", "e", "ja"); ede("d", "a", "ja")
    # Zusammenfuehrung hinter dem if: a laeuft unten in den Punkt, d-nein rechts herum in den Punkt
    mp = (0.0, ym); D.luecke = mp
    D.edge("a-m", "a", "b", mp, None, via=[], arrow=False)
    D.edge("d-nein", "d", "r", mp, None, via=[(rx_d, N["d"].cy), (rx_d, ym)], label="nein", lab="r", arrow=False)
    # Ruecksprung innen: vom Punkt nach unten, links, hoch, von links in die Linie ueber wj
    D.edge("wj-zurueck", mp, None, (0.0, ey["wj"]), None, via=[(0.0, reti), (xl_j, reti), (xl_j, ey["wj"])])
    # inneres nein: rechts hinaus, unten nach links, hoch und von links in die Linie ueber wi (das ist der aeussere Ruecksprung)
    D.edge("wj-nein", "wj", "r", (0.0, ey["wi"]), None,
           via=[(rx_j, N["wj"].cy), (rx_j, reto), (xl_i, reto), (xl_i, ey["wi"])], label="nein", lab="r")
    # aeusseres nein: ganz rechts hinaus, unten links in g hinein
    D.edge("wi-nein", "wi", "r", "g", "t", via=[(rx_i, N["wi"].cy), (rx_i, reto + gap * 0.6), (0.0, reto + gap * 0.6)], label="nein", lab="r")
    D.into["g"] = "wi-nein"
    D.reihenfolge = ["s", "s-r", "r", "r-p", "p", "p-b", "b", "b-wi", "wi", "wi-wj", "wj", "wj-e", "e", "e-d", "d", "d-a", "a", "a-m",
                     "d-nein", "wj-zurueck", "wj-nein", "wi-nein", "g", "g-o", "o", "o-end", "end"]
    assert set(D.reihenfolge) == set(N) | set(D.edges), set(D.reihenfolge) ^ (set(N) | set(D.edges))
    assert len(D.reihenfolge) == len(set(D.reihenfolge))
    return D


def kino_weg(D, plaetze):
    """Schluessel des Laufs. plaetze: je Reihe die Liste der Plaetze (1 belegt, 0 frei), zum Beispiel [[1, 0, 1], [1, 1, 0]]."""
    out = ["s", "s-r", "r", "r-p", "p", "p-b", "b", "b-wi", "wi"]
    for reihe in plaetze:
        out += ["wi-wj", "wj"]
        for pi, platz in enumerate(reihe):
            out += ["wj-e", "e", "e-d", "d"]
            if platz == 1: out += ["d-a", "a", "a-m"]
            else: out += ["d-nein"]
            out += ["wj-zurueck", "wj"]
        out += ["wj-nein", "wi"]
    out += ["wi-nein", "g", "g-o", "o", "o-end", "end"]
    return out


def kino_draw(f, a, D, box, vis=None, hl=None, bg=BG, minschrift=MIN_SCHRIFT, maxzoom=1.4):
    """Wie schleife_draw (b04), aber mit kleinerer Mindestschrift. Gibt (zoom, cam) zurueck."""
    hl = hl or {}; vis = vis or (lambda k: 1.0)
    D.edges = dict(sorted(D.edges.items(), key=lambda kv: kv[0] in hl))
    x, y, w, h = box; bb = D.bbox(); pw, ph = bb[2] - bb[0], bb[3] - bb[1]; pad = 10
    z = min(maxzoom, (w - 2 * pad) / pw, (h - 2 * pad) / ph)
    assert z * D.fs >= minschrift, f"Plan wird zu klein (Schrift {z * D.fs:.1f} px)"
    cam = (bb[0] - (w / z - pw) / 2, bb[1] - (h / z - ph) / 2)
    pap_view(f, a, D, box, cam, vis=vis, hl=hl, zoom=z, bg=bg, labels=False)
    fl = F(max(int(minschrift), int(D.fs * z)), 700)
    for k, e in D.edges.items():
        if not e.label: continue
        X0, Y0 = e.pts[0]; col = hl.get(k, LABC_B04)
        dx, dy, an = e.lab if isinstance(e.lab, tuple) else (8, -6, "ls")
        X, Y = plan_xy(box, z, cam, X0 + dx, Y0 + dy)
        f.el(clamp(a) * vis(k), lambda d, dy_, X=X, Y=Y, col=col, an=an, txt=e.label: T2(d, X, Y, txt, fl, col, an))
    return z, cam
