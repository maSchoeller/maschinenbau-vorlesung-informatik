"""Mischt Sprachspur (audio/s1..s6.mp3, Versatz laut out/timeline.json) mit out/v03_silent.mp4 -> Zieldatei, kopiert VTT+Poster."""
import json, os, subprocess, shutil
H = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(H, "out")
DST = os.path.abspath(os.path.join(H, "..", "..", "site", "assets", "video")); os.makedirs(DST, exist_ok=True)
tl = json.load(open(os.path.join(O, "timeline.json")))
cmd = ["ffmpeg", "-y", "-v", "error", "-i", os.path.join(O, "v03_silent.mp4")]
for i in range(1, 7): cmd += ["-i", os.path.join(H, "audio", f"s{i}.mp3")]
fc = "".join(f"[{i}:a]adelay={int(tl[str(i)]['audio']*1000)}|{int(tl[str(i)]['audio']*1000)},aresample=44100[a{i}];" for i in range(1, 7))
fc += "".join(f"[a{i}]" for i in range(1, 7)) + "amix=inputs=6:normalize=0,loudnorm=I=-16:TP=-1.5[aout]"
cmd += ["-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
        "-t", str(tl["total"]), "-movflags", "+faststart", os.path.join(DST, "v03-erklaervideo.mp4")]
subprocess.run(cmd, check=True)
shutil.copy(os.path.join(O, "v03.vtt"), os.path.join(DST, "v03.vtt"))
shutil.copy(os.path.join(O, "v03-poster.png"), os.path.join(DST, "v03-poster.png"))
