# Explorer Loop Post-Fix Re-screen - 2026-05-07

## Purpose

Re-screen the current `Explorer loop` after the wrap-safe hue smoothing and hue-to-slit mapping fix, using a clean protocol that clears accumulated smear before each run.

## Build Under Test

- Branch: `feature/feedback-routing-controls`
- Commit under test: `019944a` (`Make hue feedback wrap-safe`)
- App: `slitscan-av.html`
- Test URL: `http://127.0.0.1:8080/slitscan-av.html`
- Browser automation: Playwright MCP against local static server

## Protocol

All runs used the current `Explorer loop` quick-start:

- `audCentroidToVisPos`: feedback tap, depth `0.15`
- `visHueToAudSlit`: feedback tap, depth `0.15`
- all other routes: depth `0`

For each scene/source combination:

1. Set scene.
2. Set audio source.
3. Click `Clear smear`.
4. Click `Explorer loop`.
5. Wait approximately 9 seconds so the 5-second feedback ramp can settle and the 2-second stability window can populate.
6. Read `stabilityStatus`.

Base controls remained at the quick-start defaults:

- Render resolution: `640 x 480`
- Axis: `horizontal`
- Base slit center: `0.50`
- Base slit width: `0.04`
- Base scan speed: `1.00`
- Audio gain: `0.50`
- Dry/wet: `1.00`

## Results

| Scene + source | Result after ~9 s | Interpretation |
| --- | --- | --- |
| `Cars + Pad` | `lockup - flat 0.56 on centroid to slitPosition` | The hue seam fix changed the collapse mode, but did not create sustained movement. |
| `Cars + Pulse` | `lockup - flat 0.81 on hue to slitPosition` | `Cars` still fails under the explorer pair. |
| `Marquee + Pad` | `lockup - flat 0.39 on centroid to slitPosition` | Post-fix this is no longer a verified moving explorer preset. |
| `Marquee + Pulse` | `stable - window 2.0s - range 0.11` | Still the strongest current explorer case. |
| `Bouncers + Pad` | `lockup - flat 0.42 on centroid to slitPosition` | Pad pushes this pair toward a position attractor. |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.07` | Still a valid but dimmer explorer case. |

## Conclusion

The wrap-safe hue fix was the right code correction, but it did not rescue the `Explorer loop` as a universal quick-start.

What changed:

- `Cars + Pad` no longer fails by obvious hue seam snapping; it now settles into centroid-position lockup instead.
- `Cars + Pulse` still locks on hue.

What still holds:

- `Marquee + Pulse` remains the best current moving explorer preset.
- `Bouncers + Pulse` remains a second valid explorer preset.

What no longer holds:

- `Marquee + Pad` should not be described as a stable explorer variant on the current build.

## Next Step

The project should now pivot away from assuming hue can serve as the explorer second leg unchanged. The highest-value next slice is to screen a different second feedback leg against the same cleared-smear protocol, keeping `Lockup loop` intact as the bounded demo preset.
