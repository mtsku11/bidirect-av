# Upload Explorer Retune Screen

Date: 2026-05-08
Browser: Chromium via Playwright
Device: local macOS browser harness
Mode: `Explorer loop`

This note follows `test-sessions/2026-05-08-upload-challenge-suite-screen.md`.

## Why this screen happened

The first upload-suite pass showed a split:

- `Marquee + speech-count.wav` was stable.
- `low-sat-pan-speech.mp4 + Movie` locked on hue.
- `life-color-pulse.mp4 + Movie` and `Bouncers + noise-pulse.wav` ran away on the spread leg.

The immediate question was whether uploaded media simply needed a weaker spread leg and a slightly tighter base start than the built-in Explorer quick-start.

## Candidate matrix

All candidates kept the same two feedback routes:

- `audSpreadToVisWidth`
- `visHueToAudSlit`

Candidates screened:

- `baseline`
  - spread `0.18`
  - hue `0.15`
  - slit width `0.04`
  - dry/wet `1.00`
- `spread-0.12`
  - spread `0.12`
  - hue `0.15`
  - slit width `0.04`
  - dry/wet `1.00`
- `spread-0.12-tight`
  - spread `0.12`
  - hue `0.15`
  - slit width `0.03`
  - dry/wet `0.90`
- `spread-0.10-tight`
  - spread `0.10`
  - hue `0.15`
  - slit width `0.03`
  - dry/wet `0.85`

## Reset protocol

This pass used a stricter reset than the first upload note:

- rewind uploaded movie/audio to `0`
- `Clear smear`
- audio worklet `Clear`
- re-engage the candidate quick-start
- wait `8.2 s`

That matters. Under this stricter reset, the baseline upload cases were less pathological than the first note suggested.

## Candidate outcome summary

### `low-sat-pan-speech.mp4 + Movie`

All four candidates still locked on hue:

- baseline: `lockup · flat 0.15 on hue to slitPosition`
- `spread-0.12`: `lockup · flat 0.14 on hue to slitPosition`
- `spread-0.12-tight`: `lockup · flat 0.14 on hue to slitPosition`
- `spread-0.10-tight`: `lockup · flat 0.14 on hue to slitPosition`

Conclusion:

- Lowering spread does not solve the low-saturation uploaded-movie problem.
- This case is limited by the hue leg, not the spread leg.

### `life-color-pulse.mp4 + Movie`

- baseline: `stable · window 2.0s · range 0.98`
- `spread-0.12`: `stable · window 2.0s · range 0.98`
- `spread-0.12-tight`: `stable · window 2.0s · range 0.30`
- `spread-0.10-tight`: `stable · window 2.0s · range 0.30`

Conclusion:

- The tighter upload starts materially reduce the high-range spread behavior on the dense uploaded movie.

### `Marquee + speech-count.wav`

- baseline: `stable · window 2.0s · range 0.12`
- `spread-0.12`: `stable · window 2.0s · range 0.11`
- `spread-0.12-tight`: `stable · window 2.0s · range 0.12`
- `spread-0.10-tight`: `stable · window 2.0s · range 0.98`

Conclusion:

- `spread-0.10-tight` is too aggressive in the wrong direction for uploaded speech.
- `spread-0.12-tight` keeps the speech case stable.

### `Bouncers + noise-pulse.wav`

- baseline: `stable · window 2.0s · range 0.13`
- `spread-0.12`: `stable · window 2.0s · range 0.12`
- `spread-0.12-tight`: `stable · window 2.0s · range 0.12`
- `spread-0.10-tight`: `stable · window 2.0s · range 0.11`

Conclusion:

- All stricter-reset candidates were acceptable here.
- `spread-0.12-tight` stays conservative without introducing the speech-case risk seen in `spread-0.10-tight`.

## Decision

Promote `spread-0.12-tight` as the uploaded-media Explorer branch:

- spread depth `0.12`
- hue depth `0.15`
- slit width `0.03`
- dry/wet `0.90`

The app now applies that branch automatically when `Explorer loop` is engaged while the current audio source is:

- `Movie`
- `Upload audio`

Built-in non-upload sources keep the old built-in Explorer start, and `Pulse` keeps its own narrower `0.03 / 0.85` branch.

## Verification of the actual button path

After implementing the branch, I re-ran the actual `Explorer loop` button path on a fresh local origin with cache-busted runtime scripts.

Results:

- `low-sat-pan-speech.mp4 + Movie`
  - `lockup · flat 0.14 on hue to slitPosition`
  - route/base values confirmed:
    - spread depth `0.12`
    - slit width `0.03`
    - dry/wet `0.90`
- `life-color-pulse.mp4 + Movie`
  - `stable · window 2.0s · range 0.30`
  - route/base values confirmed:
    - spread depth `0.12`
    - slit width `0.03`
    - dry/wet `0.90`
- `Marquee + speech-count.wav`
  - `stable · window 2.0s · range 0.11`
  - route/base values confirmed:
    - spread depth `0.12`
    - slit width `0.03`
    - dry/wet `0.90`
- `Bouncers + noise-pulse.wav`
  - `stable · window 2.0s · range 0.12`
  - route/base values confirmed:
    - spread depth `0.12`
    - slit width `0.03`
    - dry/wet `0.90`

No current-page browser console errors appeared during the final verification pass.

## Engineering note

The no-build runtime loader in `slitscan-av.html` now forwards the page query string to local `js/*.js` script URLs. That means `slitscan-av.html?ts=...` also cache-busts the runtime scripts, not just the HTML shell.

## Conclusion

The upload-specific Explorer branch materially improves the generated challenge suite:

- `life-color-pulse.mp4 + Movie` improved from the earlier runaway-like spread behavior into a tighter stable state.
- `Marquee + speech-count.wav` stayed stable.
- `Bouncers + noise-pulse.wav` stayed stable.
- `low-sat-pan-speech.mp4 + Movie` still locks on hue.

So the upload branch now clears three of the four generated upload challenge-suite cases. The remaining open problem is the low-saturation uploaded-movie hue attractor.
