# Explorer Loop Screen - 2026-05-07

## Purpose

Screen alternative bidirectional pairs that might sustain motion longer than the current brightness-to-gain lockup loop, then validate one candidate as a second quick-start mode.

## Build Under Test

- Branch: `feature/feedback-routing-controls`
- App: `slitscan-av.html`
- Test URL: `http://127.0.0.1:8080/slitscan-av.html`
- Browser automation: Playwright MCP against local static server

## Candidate Pairs Tested

All tests used the same base control state as the existing feedback studies:

- Render resolution: `640 x 480`
- Axis: `horizontal`
- Base slit center: `0.50`
- Base slit width: `0.04`
- Base scan speed: `1.00`
- Audio gain: `0.50`
- Dry/wet: `1.00`

### Depth `0.20` screen on `Marquee + Pulse` and `Bouncers + Pulse`

| Pair | Marquee + Pulse | Bouncers + Pulse | Interpretation |
| --- | --- | --- | --- |
| `audCentroidToVisPos` + `visMotionToAudSpeed` | `lockup - flat 0.04 on motion to scanSpeed` | `runaway - pegged 0.01 on motion to scanSpeed` | Motion-to-scan speed is too collapse-prone at this depth. |
| `audAmpToVisSpeed` + `visMotionToAudSpeed` | `runaway - pegged 0.02 on motion to scanSpeed` | `runaway - pegged 0.01 on motion to scanSpeed` | Too unstable to promote. |
| `audAmpToVisSpeed` + `visBrightToAudGain` | `lockup - flat 0.24 on brightness to gain` | `stable - window 2.0s - range 0.08` | Better than the old pair in one case, but not consistently enough. |
| `audCentroidToVisPos` + `visHueToAudSlit` | `stable - window 2.0s - range 0.11` | `lockup - flat 0.71 on hue to slitPosition` | Most promising candidate, but still source-dependent at `0.20`. |

### Hue-pair follow-up

The best candidate was the hue pair, so it was retested at lower depth:

- `audCentroidToVisPos`: feedback tap
- `visHueToAudSlit`: feedback tap
- Target depth: `0.15`

| Source combination | Result after ~9 s |
| --- | --- |
| `Cars + Pad` | `lockup - flat 0.78 on hue to slitPosition` |
| `Cars + Pulse` | `lockup - flat 0.80 on hue to slitPosition` |
| `Marquee + Pad` | `stable - window 2.0s - range 0.11` |
| `Marquee + Pulse` | `stable - window 2.0s - range 0.10` |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.06` |

## Decision

The hue pair is good enough to promote as an exploratory quick-start, but not good enough to replace the old pair universally.

Product decision:

- Keep `audCentroidToVisPos` plus `visBrightToAudGain` as the explicit `Lockup loop`.
- Add `audCentroidToVisPos` plus `visHueToAudSlit` at depth `0.15` as `Explorer loop`.

This matches the observed behavior:

- `Explorer loop` stays mobile on `Marquee` and often on `Bouncers + Pulse`.
- `Lockup loop` remains a reliable bounded-demo preset.
- `Cars` still tends to lock under the new hue pair, so the new quick-start should be treated as exploratory rather than canonical.

## Saved Explorer Presets

The following explorer presets were saved and added to `presets/library.md`:

- `explorer-marquee-pad`
- `explorer-marquee-pulse`
- `explorer-bouncers-pulse`

## Side Fix

While testing, the render loop produced a transient warning on fresh load when ping-pong targets were not yet ready. A guard was added in `slitscan-av.html` so the frame is skipped cleanly instead of dereferencing an undefined render target.

## Engineering Follow-up

After this screen, the hue path was corrected in code:

- Hue smoothing now interpolates on the unit circle instead of linearly across the `0/1` seam.
- `visHueToAudSlit` now folds hue around the red seam before mapping it onto linear slit position.

That follow-up directly targets the `Cars` failure hypothesis from this screen. The results in this file remain valid for the pre-fix app state; `Cars`, `Marquee`, and `Bouncers` still need to be re-screened under the updated hue path.

That re-screen has now been completed in `test-sessions/2026-05-07-explorer-loop-post-fix.md`.
