# Cars Geometry Explorer Screen

Date: 2026-05-08

## Goal

Decide whether the new spread+hue Explorer pair should be tuned specifically for `Cars`, or whether `Cars` needs a separate alternate exploratory preset.

The route-only spread Explorer quick-start from the previous slice was:

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

That broadened coverage on `Marquee` and `Bouncers`, but `Cars + Pad` and `Cars + Pulse` still failed under the then-current horizontal, narrow-slit baseline.

## Protocol

All runs used Chromium via Playwright and the same cleared-smear protocol:

1. Start audio.
2. Select the scene and built-in audio source.
3. Set the test geometry and feedback routing.
4. Click `Clear smear`.
5. Wait approximately 9 seconds.
6. Read `stabilityStatus`.

## Part 1 — Tune `Cars`

Test matrix:

- base horizontal explorer geometry
- vertical axis alone
- vertical axis plus wider base slit
- vertical axis plus wider base slit plus softer hue depth

All tests used:

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`, except the final softer-hue probe at `0.10`

| Config | Cars + Pad | Cars + Pulse |
| --- | --- | --- |
| `cars-base-h` | `runaway - pegged 0.98 on spread to slitWidth` | `runaway - pegged 0.97 on spread to slitWidth` |
| `cars-vert` | `stable - window 2.0s - range 0.05` | `lockup - flat 0.74 on hue to slitPosition` |
| `cars-vert-wide` | `stable - window 2.0s - range 0.98` | `stable - window 2.0s - range 0.14` |
| `cars-vert-wide-soft-hue` | `stable - window 2.0s - range 0.98` | `stable - window 2.0s - range 0.19` |

### Reading

- `Cars` did not need a separate route family.
- The missing ingredient was scene geometry, not another modulation path.
- Vertical axis alone already rescued `Cars + Pad`.
- Vertical axis plus a wider base slit (`0.08`) rescued both `Cars + Pad` and `Cars + Pulse`.
- Softening hue depth to `0.10` did not materially improve the result over the simpler `0.15`.

## Part 2 — Check that the same geometry still works on the other built-ins

Candidate universal built-in Explorer quick-start:

- axis: `vertical`
- base slit width: `0.08`
- base scan speed: `1.0`
- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

| Combination | Result |
| --- | --- |
| `Cars + Pad` | `stable - window 2.0s - range 0.98` |
| `Cars + Pulse` | `stable - window 2.0s - range 0.14` |
| `Marquee + Pad` | `stable - window 2.0s - range 0.10` |
| `Marquee + Pulse` | `stable - window 2.0s - range 0.11` |
| `Bouncers + Pad` | `stable - window 2.0s - range 0.97` |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.06` |

## Fresh-start rerun

A fresh reload of the local build did not reproduce the clean six-combination result strongly enough to promote it.

Observed rerun:

| Combination | Result |
| --- | --- |
| `Cars + Pad` | `runaway - pegged 0.98 on spread to slitWidth` |
| `Cars + Pulse` | `stable - window 2.0s - range 0.14` |

The button-wired version of the same geometry also failed to hold `Cars + Pulse` consistently under immediate recheck.

## Conclusion

The geometry-aware `Cars` tuning is promising, but not yet reproducible enough to promote as the supported Explorer quick-start.

- Keep the current supported Explorer quick-start as the route-only spread+hue pair.
- Treat the vertical, wider-slit `Cars` geometry as an unresolved candidate rather than a confirmed preset.
- Require fresh-start reproducibility before promoting any geometry-aware universal quick-start.

The next worthwhile test is still `Cars` tuning, but with a stricter criterion:

- repeat the `Cars` geometry screens from clean starts
- if one configuration keeps winning, promote it as a `Cars`-specific alternate exploratory preset
