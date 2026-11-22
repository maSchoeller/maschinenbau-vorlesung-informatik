"""Vertont die V12-Texte strikt nacheinander, je Szene genau ein Aufruf, KEINE Wiederholung; bei jedem Fehler sofort Abbruch."""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import h12
SP = h12.SP

def tts_once(vdir, src):
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True); sent = 0
    for i, sec in enumerate(src, 1):
        roh = " ".join(sec); ziel = os.path.join(ad, f"s{i}.mp3"); st = os.path.join(ad, f"s{i}.sprech.txt")
        if os.path.exists(ziel) and os.path.exists(st) and open(st, encoding="utf-8").read() == SP.sprechfassung(roh):
            print("vorhanden", i, flush=True); continue
        try:
            SP.tts(roh, ziel, versuche=1); n = len(SP.sprechfassung(roh)); sent += n
            print("erzeugt", i, n, "Zeichen", flush=True)
        except BaseException as e:
            print(f"ABBRUCH bei Szene {i}: {str(e)[:300]} (bis dahin gesendet: {sent} Zeichen)", flush=True); return None
    print("fertig, gesendet:", sent, flush=True); return sent

if __name__ == "__main__":
    # Aufruf: python tts_run.py [theorie|python|beispiel|alle]   (Standard: alle; Credits: pro Video ca. 2.000-2.700 Zeichen)
    import importlib.util
    wahl = sys.argv[1] if len(sys.argv) > 1 else "alle"
    namen = ["theorie", "python", "beispiel"] if wahl == "alle" else [wahl]
    for n in namen:
        vdir = os.path.abspath(os.path.join(HERE, "..", f"v12-{n}"))
        spec = importlib.util.spec_from_file_location(f"texte_{n}", os.path.join(vdir, "texte.py"))
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        print("==", n, flush=True)
        if tts_once(vdir, m.SRC) is None: break
