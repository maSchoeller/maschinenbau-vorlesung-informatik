"""Vertont die V19-Texte strikt nacheinander, je Szene genau ein Aufruf, KEINE Wiederholung; bei jedem Fehler sofort Abbruch."""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import h19
SP = h19.SP

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
            print(f"ABBRUCH bei Szene {i}: {str(e)[:300]} (bis dahin gesendet: {sent} Zeichen)", flush=True); return sent
    print("fertig, gesendet:", sent, flush=True); return sent

if __name__ == "__main__":
    # Aufruf: python tts_run.py v19-theorie   (bzw. v19-python, v19-beispiel); vorher Restkontingent pruefen
    name = sys.argv[1] if len(sys.argv) > 1 else "v19-theorie"
    sys.path.insert(0, os.path.join(HERE, "..", name))
    from texte import SRC
    tts_once(os.path.join(HERE, "..", name), SRC)
