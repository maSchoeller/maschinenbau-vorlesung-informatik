"""V02-Hilfen: ElevenLabs-Vertonung (ein Absatz je Datei), Code-Ausfuehrung zur Pruefung, Passgenauigkeits-Check."""
import os, sys, io, json, contextlib, urllib.request
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE0, "..", "common"))
from core import *

VOICE = "TIKjTeWOFujJEvXK1qIU"   # Theo Teacher - Clear & Trustworthy
MODEL = "eleven_multilingual_v2"

def spoken(secs, i): return " ".join(sp for _, sp in secs[i - 1])

def tts(vdir, secs):
    ad = os.path.join(vdir, "audio"); os.makedirs(ad, exist_ok=True); used = 0
    for i in range(1, len(secs) + 1):
        txt = spoken(secs, i); p = os.path.join(ad, f"s{i}.mp3"); tp = os.path.join(ad, f"s{i}.txt")
        if os.path.exists(p) and os.path.exists(tp) and open(tp, encoding="utf-8").read() == txt:
            print("vorhanden", i); continue
        body = json.dumps({"text": txt, "model_id": MODEL, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode("utf-8")
        rq = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128", data=body,
                                    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json", "Accept": "audio/mpeg"})
        open(p, "wb").write(urllib.request.urlopen(rq).read()); open(tp, "w", encoding="utf-8").write(txt); used += len(txt)
        print("erzeugt", i, len(txt), "Zeichen", flush=True)
    print("Zeichen neu verbraucht:", used)

def text_report(vdir, secs):
    os.makedirs(os.path.join(vdir, "audio"), exist_ok=True); tot = 0
    for i in range(1, len(secs) + 1):
        tot += len(spoken(secs, i))
    w = sum(len(sp.split()) for s in secs for _, sp in s)
    print("Zeichen gesamt", tot, "Woerter", w)

def run(code):
    """Fuehrt Code aus und gibt die print-Ausgabe als Zeilenliste zurueck (fuer Pruefung der Konsolenausgaben)."""
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf): exec(code, {})
    return buf.getvalue().splitlines()

def fit_check(lines, font, maxw, what=""):
    for ln in lines:
        w = font.getlength(ln)
        assert w <= maxw, f"{what}: zu breit ({w:.0f} > {maxw}): {ln}"

def T2(d, x, y, s, font, fill=DARK, anchor="la"):
    """Text mit Randpruefung: bricht ab, wenn er ueber den Bildrand laeuft."""
    w = font.getlength(s); a = anchor[0]
    left = x if a == "l" else (x - w / 2 if a == "m" else x - w)
    assert 24 <= left and left + w <= 1256, f"Text laeuft aus dem Bild: {s!r} ({left:.0f}..{left+w:.0f})"
    T(d, x, y, s, font, fill, anchor)

def scan(vdir, secs, scenes, label, step=0.5):
    tl = build_timeline(vdir, secs); n = 0; gt = 0.0
    while gt < tl["total"]:
        render_frame(gt, tl, scenes, label); gt += step; n += 1
    print("scan ok:", n, "Bilder")

def dispatch(vdir, secs, scenes, label, poster_fn, name):
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "text": text_report(vdir, secs)
    elif mode == "tts": tts(vdir, secs)
    elif mode == "scan": scan(vdir, secs, scenes, label)
    else: main(vdir, secs, scenes, label, poster_fn, name)
