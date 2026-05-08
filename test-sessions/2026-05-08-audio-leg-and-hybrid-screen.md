# Audio-Leg and Hybrid Explorer Screen

Date: 2026-05-08

## Goal

Test the next two worthwhile Explorer directions after the hue-wrap fix and second-leg screen:

1. replace the Explorer loop's audio-feedback leg, keeping the structure as a pure two-leg reciprocal pair
2. if that fails, add one very weak source-driven assist to the current best reciprocal pair

## Protocol

All runs used the same cleared-smear protocol as the prior post-fix re-screen:

1. Load `slitscan-av.html` in Chromium via Playwright.
2. Click `Start audio`.
3. Select the scene and built-in audio source.
4. Click `Clear smear`.
5. Zero all route depths and return all route taps to `source`.
6. Apply the test routing.
7. Wait approximately 9 seconds.
8. Read `stabilityStatus`.

Representative combinations:

- `Cars + Pad`
- `Cars + Pulse`
- `Marquee + Pulse`
- `Bouncers + Pulse`

Hybrid check combinations:

- `Cars + Pad`
- `Cars + Pulse`
- `Marquee + Pad`
- `Bouncers + Pad`
- `Marquee + Pulse`

## Part 1 — Replace the audio-feedback leg

Tested pure reciprocal pairs:

- `audAmpToVisSpeed`: feedback tap at depth `0.12`
- `visHueToAudSlit`: feedback tap at depth `0.12`

- `audAmpToVisSpeed`: feedback tap at depth `0.16`
- `visHueToAudSlit`: feedback tap at depth `0.16`

- `audAmpToVisSpeed`: feedback tap at depth `0.12`
- `visBrightToAudGain`: feedback tap at depth `0.12`

- `audAmpToVisSpeed`: feedback tap at depth `0.16`
- `visBrightToAudGain`: feedback tap at depth `0.16`

| Pair | Cars + Pad | Cars + Pulse | Marquee + Pulse | Bouncers + Pulse |
| --- | --- | --- | --- | --- |
| `amp+hue-0.12` | `lockup - flat 0.37 on amplitude to scanSpeed` | `lockup - flat 0.81 on hue to slitPosition` | `lockup - flat 0.14 on amplitude to scanSpeed` | `stable - window 2.0s - range 0.14` |
| `amp+hue-0.16` | `lockup - flat 0.34 on amplitude to scanSpeed` | `lockup - flat 0.14 on amplitude to scanSpeed` | `stable - window 2.0s - range 0.10` | `lockup - flat 0.13 on amplitude to scanSpeed` |
| `amp+bright-0.12` | `lockup - flat 0.17 on brightness to gain` | `lockup - flat 0.16 on brightness to gain` | `lockup - flat 0.24 on brightness to gain` | `lockup - flat 0.12 on amplitude to scanSpeed` |
| `amp+bright-0.16` | `lockup - flat 0.16 on brightness to gain` | `lockup - flat 0.27 on amplitude to scanSpeed` | `lockup - flat 0.24 on brightness to gain` | `lockup - flat 0.12 on amplitude to scanSpeed` |

### Reading

- Replacing `audCentroidToVisPos` with `audAmpToVisSpeed` did not broaden coverage.
- The best amplitude pair only produced one stable representative case at a time.
- `amp+hue` is not strictly worse than every prior screen, but it is still worse than the current Explorer pair as a quick-start because it does not hold two representative cases at once.
- `amp+bright` is not a viable Explorer family.

## Part 2 — Add one weak source-driven assist

Starting point:

- `audCentroidToVisPos`: feedback tap at depth `0.15`
- `visHueToAudSlit`: feedback tap at depth `0.15`

Added assist:

- `audAmpToVisSpeed`: source tap at depth `0.08`
- `audAmpToVisSpeed`: source tap at depth `0.12`

| Config | Cars + Pad | Cars + Pulse | Marquee + Pad | Bouncers + Pad | Marquee + Pulse |
| --- | --- | --- | --- | --- | --- |
| `explorer + source amp 0.08` | `lockup - flat 0.80 on hue to slitPosition` | `lockup - flat 0.82 on hue to slitPosition` | `lockup - flat 0.43 on centroid to slitPosition` | `lockup - flat 0.51 on centroid to slitPosition` | `stable - window 2.0s - range 0.11` |
| `explorer + source amp 0.12` | `lockup - flat 0.80 on hue to slitPosition` | `lockup - flat 0.79 on hue to slitPosition` | `lockup - flat 0.41 on centroid to slitPosition` | `lockup - flat 0.51 on centroid to slitPosition` | `stable - window 2.0s - range 0.11` |

### Reading

- The weak source amplitude assist preserved the already-stable `Marquee + Pulse` case.
- It did not unlock `Cars`, and it did not rescue the current Pad-based lockups.
- Within the current route family, both the pure audio-leg swap and the smallest hybrid assist have now failed to produce a broader Explorer quick-start.

## Conclusion

The current built-in route family looks exhausted for "just one more screen" style fixes.

- Keep `Explorer loop` as the current best quick-start, with the explicit limitation that it is still source-dependent.
- Keep `Lockup loop` as the bounded demo preset.
- Treat the next worthwhile engineering slice as structural, not parametric:
  - add a new feedback-capable route or derived analysis feature
  - or add a new target mapping that is less attractor-prone than the current centroid/brightness family
