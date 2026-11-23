"""Vertont die Termin-01-Texte strikt nacheinander, je Szene genau ein Aufruf, KEINE Wiederholung; bei jedem Fehler sofort Abbruch.
Vorhandene, textgleiche Audios (audio/sN.mp3 + sN.sprech.txt) werden uebersprungen.

Aufruf:  python tts_run.py v01-theorie            (bzw. v01-python, v01-beispiel); vorher Restkontingent pruefen
         python tts_run.py v01-theorie --trocken  (sendet nichts: zeigt nur, was gesendet wuerde)
Beim Laden dieses Moduls wird nichts gesendet; die API wird nur in tts_once() ohne --trocken aufgerufen."""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import h01
SP = h01.SP
VIDEOS = ("v01-theorie", "v01-python", "v01-beispiel")

def tts_once(vdir, src, trocken=False):
    ad = os.path.join(vdir, "audio"); sent = 0
    if not trocken: os.makedirs(ad, exist_ok=True)
    for i, sec in enumerate(src, 1):
        roh = " ".join(sec); ziel = os.path.join(ad, f"s{i}.mp3"); st = os.path.join(ad, f"s{i}.sprech.txt")
        n = len(SP.sprechfassung(roh))
        assert n <= SP.MAX_ZEICHEN, f"Szene {i}: {n} Zeichen, erlaubt sind {SP.MAX_ZEICHEN} je Aufruf"
        if os.path.exists(ziel) and os.path.exists(st) and open(st, encoding="utf-8").read() == SP.sprechfassung(roh):
            print("vorhanden", i, flush=True); continue
        if trocken:
            sent += n; print("wuerde senden", i, n, "Zeichen", flush=True); continue
        try:
            SP.tts(roh, ziel, versuche=1); sent += n
            print("erzeugt", i, n, "Zeichen", flush=True)
        except BaseException as e:
            print(f"ABBRUCH bei Szene {i}: {str(e)[:300]} (bis dahin gesendet: {sent} Zeichen)", flush=True); return sent
    print("trocken, nichts gesendet; offen:" if trocken else "fertig, gesendet:", sent, flush=True); return sent

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]; flags = [a for a in sys.argv[1:] if a.startswith("-")]
    if "-h" in flags or "--help" in flags or len(args) != 1 or any(f not in ("--trocken",) for f in flags):
        print(__doc__); raise SystemExit(0 if ("-h" in flags or "--help" in flags) else 2)
    name = args[0]; vdir = os.path.join(HERE, "..", name)
    if name not in VIDEOS or not os.path.exists(os.path.join(vdir, "texte.py")):
        raise SystemExit(f"Unbekanntes Video {name!r}: erlaubt sind {', '.join(VIDEOS)} (Ordner mit texte.py).")
    sys.path.insert(0, vdir)
    from texte import SRC
    tts_once(vdir, SRC, trocken="--trocken" in flags)
