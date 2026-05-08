# Explorer Revalidation and Walker Screen

Date: 2026-05-08

## Goal

Validate the current supported `Explorer loop` on the built-in scene set after the source split, and decide whether `Walker` belongs in the core built-in regression set.

Current quick-start under test:

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

## Protocol

All runs used Chromium via Playwright against the current local build on port `8090`.

For each case:

1. Reload `slitscan-av.html`.
2. Click `Start audio`.
3. Select the scene and built-in audio source.
4. Set axis `Horizontal` unless otherwise noted.
5. Set base controls to width `0.04`, scan speed `1.0`, master gain `0.5`, dry/wet `1.0`.
6. Click `Explorer loop`.
7. Click `Clear smear`.
8. Wait approximately 9 seconds.
9. Read `stabilityStatus` plus the feedback spread and hue taps.

## Results

### Core built-in revalidation

| Combination | Result | Notes |
| --- | --- | --- |
| `Marquee + Pad` | `stable - window 2.0s - range 0.10` | Fresh-start pass 1. |
| `Marquee + Pad` | `stable - window 2.0s - range 0.11` | Fresh-start repeat. Reproduced cleanly. |
| `Marquee + Pulse` | `runaway - pegged 0.98 on spread to slitWidth` | Spread feedback saturated high. |
| `Bouncers + Pad` | `runaway - pegged 0.98 on spread to slitWidth` | Spread feedback saturated high. |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.06` | First pass looked acceptable. |
| `Bouncers + Pulse` | `runaway - pegged 0.98 on spread to slitWidth` | Fresh-start repeat failed; not reproducible enough to keep in the supported set. |

### Walker screen

| Combination | Result | Notes |
| --- | --- | --- |
| `Walker + Pad` horizontal | `lockup - flat 0.96 on spread to slitWidth` | Spread leg held high with low range. |
| `Walker + Pulse` horizontal | `lockup - flat 0.54 on hue to slitPosition` | Hue leg converged to a narrow band. |
| `Walker + Pulse` vertical | `runaway - pegged 0.98 on spread to slitWidth` | Fast axis spot-check to rule out a simple orientation mismatch. |

## Reading

- `Walker` does not join the built-in regression set under the current Explorer pair.
- The more important correction is broader: the older claim that the spread+hue Explorer pair was supported on all `Marquee` and `Bouncers` Pad/Pulse combinations no longer holds under strict fresh-start reruns.
- On the current build, only `Marquee + Pad` reproduced cleanly across two fresh starts.
- `Bouncers + Pulse` looked promising in one run but failed its repeat, so it should not stay in the supported set.

## Conclusion

Current durable state:

- Keep `Explorer loop` as the current best built-in exploratory quick-start for now.
- Treat `Marquee + Pad` as the only currently reproducible built-in Explorer reference case.
- Do not add `Walker` to the core regression set.
- Do not move on to the external challenge suite yet; first retune or replace the current Explorer quick-start so that more than one built-in case reproduces cleanly.
