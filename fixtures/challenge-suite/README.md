# Upload Challenge Suite

Small generated media fixtures for testing SLITSCAN.AV's upload paths.

This suite is intentionally tiny and reproducible:

- It exercises uploaded movie, movie-audio, and uploaded-audio flows.
- It avoids committing large or copyrighted media.
- It is broader than the built-in scenes/synths, but it is still synthetic.

Treat these files as upload-path probes, not as a substitute for later real-world footage and recordings.

## Files

### Video

- `video/low-sat-pan-speech.mp4`
  - Low-saturation drifting texture with two moving blocks.
  - Embedded speech track.
  - Useful for testing weak hue content, modest motion, and speech-driven onset behavior.

- `video/life-color-pulse.mp4`
  - High-chroma cellular motion clip.
  - Embedded pulsed noise track.
  - Useful for testing hue-rich motion and whether the Explorer loop drifts toward spread runaway on denser feedback.

### Audio

- `audio/speech-count.wav`
  - Short counted speech phrase with pauses.
  - Useful for checking how speech spectral shape behaves against the current Explorer pair.

- `audio/noise-pulse.wav`
  - Broadband pulsed texture with a low thump, a high click, and filtered noise.
  - Useful for testing spread sensitivity and onset response outside the built-in synths.

## Regeneration

Regenerate the suite with:

```bash
./scripts/generate_challenge_suite.sh
```

## First screen

Recommended first upload-based screen:

1. Upload `video/low-sat-pan-speech.mp4`, set audio source to `Movie`, engage `Explorer loop`.
2. Upload `video/life-color-pulse.mp4`, set audio source to `Movie`, engage `Explorer loop`.
3. Set visual source to `Marquee`, upload `audio/speech-count.wav`, engage `Explorer loop`.
4. Set visual source to `Bouncers`, upload `audio/noise-pulse.wav`, engage `Explorer loop`.

Document the structural preset or quick-start used, plus the exact uploaded filename, because uploaded assets are not serialized into hashes or local preset slots.
