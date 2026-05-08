# Upload Challenge Suite Screen

Date: 2026-05-08
Browser: Chromium via Playwright
Device: local macOS browser harness
Mode: `Explorer loop`
Duration: four 8.2 s windows after `Clear smear`

## Suite

Assets came from the generated upload fixture suite in `fixtures/challenge-suite/`:

- `video/low-sat-pan-speech.mp4`
- `video/life-color-pulse.mp4`
- `audio/speech-count.wav`
- `audio/noise-pulse.wav`

The suite itself is synthetic, not a replacement for later real-world footage or recordings. Its purpose is to exercise the uploaded movie, movie-audio, and uploaded-audio paths with reproducible non-built-in material.

## Structural baseline

- Render resolution: `640 × 480`
- Axis: `Horizontal`
- Audio gain: `0.50`
- Explorer quick-start:
  - `audSpreadToVisWidth` = feedback `0.18`
  - `visHueToAudSlit` = feedback `0.15`
  - all other routes = `0`
- Non-Pulse cases kept the normal Explorer base:
  - slit width `0.04`
  - dry/wet `1.00`

## Protocol

For each case:

1. Start audio.
2. Upload the file through the real UI.
3. If testing a movie case, switch audio source to `Movie`.
4. Click `Clear smear`.
5. Click `Explorer loop`.
6. Wait `8.2 s`.
7. Read `stabilityStatus`, `feedbackSafetyStatus`, and the main route meters.

## Cases

### `low-sat-pan-speech.mp4 + Movie`

- Result: `lockup · flat 0.15 on hue to slitPosition`
- Spread meter: `77%`
- Hue meter: `15%`
- Audio amplitude meter: `26%`

Interpretation:

- The low-saturation movie did not produce runaway.
- It also did not stay exploratory.
- The loop settled into a low-hue lockup attractor.

### `life-color-pulse.mp4 + Movie`

- Result: `runaway · pegged 0.98 on spread to slitWidth`
- Spread meter: `98%`
- Hue meter: `32%`
- Audio amplitude meter: `10%`

Interpretation:

- Dense hue-rich motion plus the embedded pulsed noise track drives the spread leg too hard at the current Explorer depth.
- This is a clean uploaded-movie runaway case, not a browser failure.

### `Marquee + speech-count.wav`

- Result: `stable · window 2.0s · range 0.11`
- Spread meter: `98%`
- Hue meter: `71%`
- Audio amplitude meter: `17%`

Interpretation:

- The current Explorer pair can survive uploaded speech when the visual side stays on a known-good built-in scene.
- This is the only stable case in the first upload suite screen.

### `Bouncers + noise-pulse.wav`

- Result: `runaway · pegged 0.98 on spread to slitWidth`
- Spread meter: `98%`
- Hue meter: `60%`
- Audio amplitude meter: `8%`

Interpretation:

- Broadband pulsed uploaded audio is enough to trigger the same spread-led runaway seen in the denser movie case.
- The failure is not specific to movie audio routing.

## Technical notes

- Uploaded movie, movie-audio, and uploaded-audio flows all worked.
- No browser console errors were present during the screen.
- Uploads are still not serialized into preset hashes or local slots, so the durable reference is:
  - structural quick-start definition
  - exact uploaded filename
  - this session note

## Conclusion

The current Explorer quick-start now has a meaningful split:

- It is reproducible on the seeded built-in `Marquee` and `Bouncers` cases with both `Pad` and `Pulse`.
- It is not yet robust across the first uploaded-media challenge suite.

The main failure mode is the spread feedback leg pegging high on denser or broadband uploaded audio. The immediate follow-up should be to screen a lower-spread uploaded-media Explorer start, or branch the quick-start so uploaded movie/file audio does not inherit the same spread depth as the built-in regression cases.
