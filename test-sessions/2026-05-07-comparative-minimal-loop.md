# Comparative Minimal-Loop Session - 2026-05-07

## Purpose

Compare the current minimal reciprocal loop across the main built-in scene and audio combinations, then probe whether a small source-reactive assist produces a more durable evolving state.

## Build Under Test

- Branch: `feature/feedback-routing-controls`
- App: `slitscan-av.html`
- Test URL: `http://127.0.0.1:8080/slitscan-av.html`
- Browser automation: Playwright MCP against local static server
- Preset hashes: recorded in `presets/library.md`

## Shared Test Conditions

- Render resolution: `640 x 480`
- Axis: `horizontal`
- Base slit center: `0.50`
- Base slit width: `0.04`
- Base scan speed: `1.00`
- Audio gain: `0.50`
- Dry/wet: `1.00`
- Audio status: `audio: on - 44100Hz - 2048-FFT`
- Feedback safety:
  - Depth cap: `0.30`
  - Engagement ramp: `5s`
  - Feedback attenuation: `0.98`
  - Feedback tap smoothing: slower than source tap smoothing

## Minimal-Loop Comparison Set

The tested reciprocal pair stayed the same in all six comparison cases:

- `audCentroidToVisPos`: feedback tap, depth `0.20`
- `visBrightToAudGain`: feedback tap, depth `0.20`
- All other routes: depth `0`

| Preset slot | Scene | Audio | Stability after ~9 s | Visual feedback brightness | Audio feedback centroid | Audio feedback amplitude |
| --- | --- | --- | --- | --- | --- | --- |
| `cars-pad-minloop` | Cars | Pad | `lockup - flat 0.15 on brightness to gain` | `0.16` | `0.42` | `0.51` |
| `cars-pulse-minloop` | Cars | Pulse | `lockup - flat 0.15 on brightness to gain` | `0.15` | `0.39` | `0.10` |
| `bouncers-pad-minloop` | Bouncers | Pad | `lockup - flat 0.12 on brightness to gain` | `0.11` | `0.41` | `0.51` |
| `bouncers-pulse-minloop` | Bouncers | Pulse | `lockup - flat 0.08 on brightness to gain` | `0.09` | `0.42` | `0.13` |
| `marquee-pad-minloop` | Marquee | Pad | `lockup - flat 0.26 on brightness to gain` | `0.27` | `0.41` | `0.50` |
| `marquee-pulse-minloop` | Marquee | Pulse | `lockup - flat 0.24 on brightness to gain` | `0.24` | `0.39` | `0.12` |

## Mixed Source-Reactive Probes

Two probes added a small open-loop assist while keeping a weaker feedback pair:

- `audAmpToVisSpeed`: source tap, depth `0.18`
- `visMotionToAudSpeed`: source tap, depth `0.18`
- `audCentroidToVisPos`: feedback tap, depth `0.15`
- `visBrightToAudGain`: feedback tap, depth `0.15`
- `audOnsetToVisClear`: depth `0`
- `visHueToAudSlit`: depth `0`

| Preset slot | Scene | Audio | Stability after ~9 s | Visual feedback brightness | Audio feedback centroid | Audio feedback amplitude |
| --- | --- | --- | --- | --- | --- | --- |
| `marquee-pulse-mixed-watch` | Marquee | Pulse | `lockup - flat 0.24 on brightness to gain` | `0.26` | `0.28` | `0.09` |
| `bouncers-pulse-mixed-watch` | Bouncers | Pulse | `lockup - flat 0.12 on brightness to gain` | `0.12` | `0.38` | `0.10` |

## Source-Driven References

Two open-loop reference presets were saved to anchor later comparisons:

- `source-default-cars-pad`
- `source-default-marquee-pulse`

After `Panic` and a short wait with no active feedback routes:

- Feedback safety status returned to `Active feedback routes: 0 - status: source-driven`
- Stability status returned to `stable - source-driven`

## Interpretation

The main finding is consistent: the current minimal feedback pair is bounded but not yet musically self-sustaining. Across all tested Cars, Bouncers, and Marquee combinations with both Pad and Pulse, the loop converged toward brightness-driven lockup rather than runaway or long-form evolution.

Two secondary patterns are already clear:

- `Marquee` settles into the brightest attractor. Its lockup plateaus sit around `0.24` to `0.27`, which reads and sounds more drone-like than the darker `Bouncers` cases.
- `Pulse` lowers post-worklet amplitude substantially relative to `Pad`, but that reduction alone does not prevent lockup.

The mixed source-reactive assist did not materially change the attractor. It altered the plateau values, especially the audio centroid, but still collapsed toward the same brightness-to-gain lockup class.

No runaway was observed in any tested case. The current reciprocal pair is therefore useful as a safety and lockup demonstration preset family, but not yet as the instrument's primary "sweet spot" behavior.

## Follow-Ups

- Test an alternative minimal pair that uses a more active visual feedback feature than brightness.
- Try lower `visBrightToAudGain` feedback depth values below `0.15` before changing the safety heuristics.
- Keep `Marquee` and `Bouncers + Pulse` as contrast cases for future lockup comparisons.
- Continue attaching preset hash names to every logged session.
