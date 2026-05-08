#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/fixtures/challenge-suite"
AUDIO_DIR="$OUT_DIR/audio"
VIDEO_DIR="$OUT_DIR/video"
TMP_DIR="$(mktemp -d)"
SAY_VOICE="${SAY_VOICE:-Samantha}"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$AUDIO_DIR" "$VIDEO_DIR"

SPEECH_AIFF="$TMP_DIR/speech-count.aiff"
/usr/bin/say -v "$SAY_VOICE" -r 165 -o "$SPEECH_AIFF" "One two three four. Feedback breathes, then settles. Five six seven eight. Listen for the loop."

ffmpeg -y \
  -i "$SPEECH_AIFF" \
  -ac 1 \
  -ar 44100 \
  -af "highpass=f=120,lowpass=f=6000,loudnorm=I=-18:LRA=7:TP=-2" \
  "$AUDIO_DIR/speech-count.wav"

ffmpeg -y \
  -f lavfi -i "anoisesrc=r=44100:d=8:c=pink:seed=29:a=0.22" \
  -f lavfi -i "aevalsrc=0.65*sin(2*PI*55*t)*exp(-32*mod(t\\,0.5))+0.12*sin(2*PI*1800*t)*exp(-220*mod(t\\,0.25)):s=44100:d=8" \
  -filter_complex "[0:a]highpass=f=700,volume='if(isnan(t),0,0.05 + 0.12*exp(-28*mod(t,0.5)))':eval=frame[wash];[1:a]lowpass=f=220[synth];[wash][synth]amix=inputs=2:normalize=0,alimiter=limit=0.85,atrim=0:8" \
  -ac 1 \
  -ar 44100 \
  "$AUDIO_DIR/noise-pulse.wav"

ffmpeg -y \
  -f lavfi -i "perlin=s=640x360:r=30:octaves=4:persistence=0.7:tscale=0.35:random_mode=seed:random_seed=117" \
  -i "$AUDIO_DIR/speech-count.wav" \
  -shortest \
  -vf "format=yuv420p,hue=s=0.22,eq=contrast=1.15:brightness=-0.03,drawgrid=width=80:height=60:thickness=1:color=white@0.05,drawbox=x='120+80*sin(2*PI*t/4.5)':y='80+40*cos(2*PI*t/3.7)':w=140:h=90:color=0xd7c6a4@0.18:t=fill,drawbox=x='400+60*cos(2*PI*t/6.5)':y='170+35*sin(2*PI*t/5.2)':w=90:h=70:color=0x8aa08e@0.20:t=fill,vignette=PI/7" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -crf 29 \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  "$VIDEO_DIR/low-sat-pan-speech.mp4"

ffmpeg -y \
  -f lavfi -i "life=s=640x360:r=30:seed=29:mold=8:ratio=0.12:life_color=0x8cff1a:death_color=0x06080b" \
  -i "$AUDIO_DIR/noise-pulse.wav" \
  -shortest \
  -vf "format=yuv420p,hue=H=2*PI*t/6:s=1.15,boxblur=1:1,drawbox=x='(w-120)/2+140*sin(2*PI*t/5)':y='(h-120)/2+90*cos(2*PI*t/4)':w=120:h=120:color=0xffffff@0.08:t=fill,eq=contrast=1.18:saturation=1.25" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -crf 31 \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  "$VIDEO_DIR/life-color-pulse.mp4"

printf 'Generated challenge suite in %s\n' "$OUT_DIR"
