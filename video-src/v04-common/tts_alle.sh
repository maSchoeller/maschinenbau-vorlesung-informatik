#!/bin/sh
# Vertont V04 strikt nacheinander (ElevenLabs erlaubt nur wenige gleichzeitige Anfragen); vorhandene Audios bleiben
cd "$(dirname "$0")/.."
for n in python beispiel; do
  echo "=== v04-$n"
  .venv/Scripts/python.exe "v04-$n/render.py" tts || exit 1
done
echo FERTIG
