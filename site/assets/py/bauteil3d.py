"""bauteil3d - einfache 3D-Bauteile als Dreiecksnetz (Mesh).

Läuft im Browser (Pyodide) und in normalem Python; nutzt nur die Standardbibliothek.

Ein Mesh ist ein Dictionary:
    {"name": "Flansch", "vertices": [[x, y, z], ...], "faces": [[i, j, k], ...]}
Einheiten: Millimeter. Die Bauteilachse ist die z-Achse, das Bauteil beginnt bei z = 0.
Die Dreiecke sind geschlossen (jede Kante gehört zu genau zwei Dreiecken) und so
angeordnet, dass die Flächennormalen nach außen zeigen (Volumen positiv).
"""
import json
import math

_NACHKOMMA = 4


# ---------------------------------------------------------------- Hilfsfunktionen

def _mesh(name, vertices, faces):
    return {
        "name": name,
        "vertices": [[round(c, _NACHKOMMA) for c in v] for v in vertices],
        "faces": [list(f) for f in faces],
    }


def volumen(mesh):
    """Volumen in mm^3 (Summe der vorzeichenbehafteten Tetraeder zum Ursprung)."""
    v = mesh["vertices"]
    summe = 0.0
    for i, j, k in mesh["faces"]:
        a, b, c = v[i], v[j], v[k]
        summe += (a[0] * (b[1] * c[2] - b[2] * c[1])
                  - a[1] * (b[0] * c[2] - b[2] * c[0])
                  + a[2] * (b[0] * c[1] - b[1] * c[0]))
    return summe / 6.0


def abmessungen(mesh):
    """Bounding Box: (Breite x, Tiefe y, Höhe z) in mm."""
    v = mesh["vertices"]
    return tuple(max(p[a] for p in v) - min(p[a] for p in v) for a in range(3))


def _rotation(name, profil, segmente):
    """Dreht ein geschlossenes Profil [(r, z), ...] um die z-Achse.
    Punkte mit r = 0 liegen auf der Achse."""
    if segmente < 3:
        raise ValueError("segmente muss mindestens 3 sein")
    verts, index = [], {}

    def punkt(k, i):
        r, z = profil[k]
        schluessel = (k, 0) if r == 0 else (k, i % segmente)
        if schluessel not in index:
            w = 2 * math.pi * (i % segmente) / segmente
            index[schluessel] = len(verts)
            verts.append([r * math.cos(w), r * math.sin(w), z])
        return index[schluessel]

    faces = []
    n = len(profil)
    for p in range(n):
        q = (p + 1) % n
        rp, rq = profil[p][0], profil[q][0]
        if rp == 0 and rq == 0:
            continue
        for i in range(segmente):
            a, b = punkt(p, i), punkt(q, i)
            c, d = punkt(q, i + 1), punkt(p, i + 1)
            if rp == 0:
                faces.append([a, b, c])
            elif rq == 0:
                faces.append([a, b, d])
            else:
                faces.append([a, b, c])
                faces.append([a, c, d])
    mesh = _mesh(name, verts, faces)
    if volumen(mesh) < 0:
        mesh["faces"] = [[f[0], f[2], f[1]] for f in mesh["faces"]]
    return mesh


# ---------------------------------------------------------------- Bauteile

def zylinder(d, l, segmente=48):
    """Vollzylinder: Durchmesser d, Länge l (Achse z, von 0 bis l)."""
    if d <= 0 or l <= 0:
        raise ValueError("d und l müssen positiv sein")
    r = d / 2
    return _rotation("Zylinder", [(0, 0), (r, 0), (r, l), (0, l)], segmente)


def ring(d_aussen, d_innen, l, segmente=48):
    """Hohlzylinder (Buchse): Außen-, Innendurchmesser, Länge."""
    if not 0 < d_innen < d_aussen or l <= 0:
        raise ValueError("Es muss 0 < d_innen < d_aussen und l > 0 gelten")
    ra, ri = d_aussen / 2, d_innen / 2
    return _rotation("Ring", [(ri, 0), (ra, 0), (ra, l), (ri, l)], segmente)


def welle(absaetze, segmente=48):
    """Gestufte Welle aus einer Liste von (Durchmesser, Länge), von unten nach oben."""
    if not absaetze:
        raise ValueError("absaetze darf nicht leer sein")
    profil = [(0, 0)]
    z = 0.0
    for d, laenge in absaetze:
        if d <= 0 or laenge <= 0:
            raise ValueError("Durchmesser und Länge müssen positiv sein")
        r = d / 2
        profil.append((r, z))
        z += laenge
        profil.append((r, z))
    profil.append((0, z))
    return _rotation("Welle", profil, segmente)


# --- Flansch: Querschnitt (Kreisring mit Löchern) triangulieren und extrudieren

def _schneidet(p1, p2, q1, q2):
    """Echter Schnitt zweier Strecken (gemeinsame Endpunkte zählen nicht)."""
    def o(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    d1, d2, d3, d4 = o(p1, p2, q1), o(p1, p2, q2), o(q1, q2, p1), o(q1, q2, p2)
    eps = 1e-12
    return (((d1 > eps and d2 < -eps) or (d1 < -eps and d2 > eps))
            and ((d3 > eps and d4 < -eps) or (d3 < -eps and d4 > eps)))


def _verbinde_loecher(pts, aussen, loecher):
    """Fügt die Löcher über Brücken in die Außenkontur ein; liefert eine Liste von Punkt-Indizes."""
    poly = list(aussen)
    for h in sorted(loecher, key=lambda h: -max(pts[i][0] for i in h)):
        m = max(range(len(h)), key=lambda k: pts[h[k]][0])
        mi = h[m]
        kanten = [(poly[k], poly[(k + 1) % len(poly)]) for k in range(len(poly))]
        for g in loecher:
            kanten += [(g[k], g[(k + 1) % len(g)]) for k in range(len(g))]
        beste = None
        for pos, pi in enumerate(poly):
            dist = (pts[pi][0] - pts[mi][0]) ** 2 + (pts[pi][1] - pts[mi][1]) ** 2
            if beste is not None and dist >= beste[0]:
                continue
            if any(_schneidet(pts[mi], pts[pi], pts[a], pts[b]) for a, b in kanten
                   if a not in (mi, pi) and b not in (mi, pi)):
                continue
            beste = (dist, pos)
        if beste is None:
            raise ValueError("Bohrung liegt zu nah an Rand oder anderer Bohrung")
        pos = beste[1]
        drehung = h[m:] + h[:m]
        poly = poly[:pos + 1] + drehung + [mi, poly[pos]] + poly[pos + 1:]
    return poly


def _ohr_dreiecke(pts, poly):
    """Ear-Clipping einer gegen den Uhrzeigersinn orientierten Kontur (mit Brücken)."""
    def kreuz(a, b, c):
        return ((pts[b][0] - pts[a][0]) * (pts[c][1] - pts[a][1])
                - (pts[b][1] - pts[a][1]) * (pts[c][0] - pts[a][0]))

    def gleich(a, b):
        return abs(pts[a][0] - pts[b][0]) < 1e-9 and abs(pts[a][1] - pts[b][1]) < 1e-9

    def drin(p, a, b, c):
        return kreuz(a, b, p) >= -1e-9 and kreuz(b, c, p) >= -1e-9 and kreuz(c, a, p) >= -1e-9

    poly = list(poly)
    dreiecke = []
    while len(poly) > 3:
        n = len(poly)
        wahl = None
        for k in range(n):
            a, b, c = poly[k - 1], poly[k], poly[(k + 1) % n]
            if kreuz(a, b, c) <= 1e-9:
                continue
            if any(not gleich(q, a) and not gleich(q, b) and not gleich(q, c)
                   and drin(q, a, b, c) for q in poly):
                continue
            wahl = k
            break
        if wahl is None:
            # Notausgang bei Rundungsproblemen: Ohr mit kleinster Fläche abschneiden
            wahl = min(range(n), key=lambda k: abs(kreuz(poly[k - 1], poly[k], poly[(k + 1) % n])))
        a, b, c = poly[wahl - 1], poly[wahl], poly[(wahl + 1) % n]
        if kreuz(a, b, c) > 1e-9:
            dreiecke.append([a, b, c])
        del poly[wahl]
    if len(poly) == 3 and kreuz(*poly) > 1e-9:
        dreiecke.append(list(poly))
    return dreiecke


def flansch(d_aussen, d_innen, dicke, lochkreis, n_bohrungen, d_bohrung, segmente=48):
    """Runder Flansch mit Mittelbohrung und n Bohrungen auf dem Lochkreis (Durchmesser).

    Achse z, Dicke von z = 0 bis z = dicke. Die erste Bohrung liegt auf der +x-Achse.
    """
    if not 0 < d_innen < d_aussen or dicke <= 0:
        raise ValueError("Es muss 0 < d_innen < d_aussen und dicke > 0 gelten")
    if n_bohrungen > 0:
        if d_bohrung <= 0:
            raise ValueError("d_bohrung muss positiv sein")
        rl, rb = lochkreis / 2, d_bohrung / 2
        if rl - rb <= d_innen / 2 + 1e-6 or rl + rb >= d_aussen / 2 - 1e-6:
            raise ValueError("Die Bohrungen liegen nicht zwischen Innen- und Außenrand")
        if n_bohrungen > 1 and 2 * rl * math.sin(math.pi / n_bohrungen) <= d_bohrung:
            raise ValueError("Die Bohrungen überlappen sich")
    pts = []

    def kontur(cx, cy, r, n, ccw):
        ids = []
        for i in range(n):
            w = 2 * math.pi * i / n * (1 if ccw else -1)
            pts.append((cx + r * math.cos(w), cy + r * math.sin(w)))
            ids.append(len(pts) - 1)
        return ids

    aussen = kontur(0, 0, d_aussen / 2, segmente, True)
    loecher = [kontur(0, 0, d_innen / 2, segmente, False)]
    seg_b = max(12, segmente // 3)
    for k in range(n_bohrungen):
        w = 2 * math.pi * k / n_bohrungen
        loecher.append(kontur(lochkreis / 2 * math.cos(w), lochkreis / 2 * math.sin(w),
                              d_bohrung / 2, seg_b, False))
    dreiecke = _ohr_dreiecke(pts, _verbinde_loecher(pts, aussen, loecher))

    n = len(pts)
    verts = [[x, y, 0.0] for x, y in pts] + [[x, y, dicke] for x, y in pts]
    faces = [[a + n, b + n, c + n] for a, b, c in dreiecke]      # Deckel, Normale +z
    faces += [[a, c, b] for a, b, c in dreiecke]                  # Boden, Normale -z
    for schleife in [aussen] + loecher:                           # Mantelflächen
        m = len(schleife)
        for i in range(m):
            a, b = schleife[i], schleife[(i + 1) % m]
            faces.append([a, b, b + n])
            faces.append([a, b + n, a + n])
    return _mesh("Flansch", verts, faces)


# ---------------------------------------------------------------- Zusammenbauen und Anzeigen

def verschiebe(mesh, dx=0, dy=0, dz=0):
    """Kopie des Meshes, um (dx, dy, dz) mm verschoben."""
    return {"name": mesh.get("name", "Bauteil"),
            "vertices": [[x + dx, y + dy, z + dz] for x, y, z in mesh["vertices"]],
            "faces": [list(f) for f in mesh["faces"]]}


def vereinige(*meshes, name="Baugruppe"):
    """Hängt mehrere Meshes zusammen (ohne Boolesche Verschmelzung)."""
    if len(meshes) == 1 and isinstance(meshes[0], (list, tuple)):
        meshes = meshes[0]
    verts, faces = [], []
    for m in meshes:
        offset = len(verts)
        verts += [list(v) for v in m["vertices"]]
        faces += [[i + offset for i in f] for f in m["faces"]]
    return {"name": name, "vertices": verts, "faces": faces}


def zeige(mesh, name=None):
    """Zeigt das Bauteil in der Kursausgabe (3D-Vorschau); sonst nur ein Hinweis mit den Maßen."""
    daten = dict(mesh)
    if name:
        daten["name"] = name
    try:
        import kursausgabe
    except ImportError:
        b = abmessungen(daten)
        print("3D-Vorschau nur im Kurs verfügbar: %s, %.1f x %.1f x %.1f mm, %d Dreiecke"
              % (daten.get("name", "Bauteil"), b[0], b[1], b[2], len(daten["faces"])))
        return
    kursausgabe.zeige("3d", json.dumps(daten))
