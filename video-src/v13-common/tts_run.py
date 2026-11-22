"""Vertont die V13-Texte (ein Video-Verzeichnis als Argument), strikt nacheinander, je Szene genau ein Aufruf, KEINE Wiederholung;
bei jedem Fehler sofort Abbruch. Aufruf: python tts_run.py v13-theorie | v13-python | v13-beispiel   (verbraucht ElevenLabs-Credits)."""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import h13
SP = h13.SP

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
    if len(sys.argv) != 2 or sys.argv[1] not in ("v13-theorie", "v13-python", "v13-beispiel"):
        raise SystemExit("Aufruf: python tts_run.py v13-theorie | v13-python | v13-beispiel")
    vdir = os.path.abspath(os.path.join(HERE, "..", sys.argv[1])); sys.path.insert(0, vdir)
    from texte import SRC
    tts_once(vdir, SRC)
