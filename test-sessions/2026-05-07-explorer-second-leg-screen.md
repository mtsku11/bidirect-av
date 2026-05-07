# Explorer Second-Leg Screen - 2026-05-07

## Purpose

Test whether the current `Explorer loop` can be improved by keeping the audio-feedback centroid leg fixed and replacing only the visual-feedback leg.

## Build Under Test

- Branch: `feature/feedback-routing-controls`
- App: `slitscan-av.html`
- Test URL: `http://127.0.0.1:8080/slitscan-av.html`
- Browser automation: Playwright MCP against local static server

## Protocol

This screen kept the first feedback leg fixed:

- `audCentroidToVisPos`: feedback tap, depth `0.15`

The second leg candidates were:

- `visMotionToAudSpeed` at depth `0.04`
- `visMotionToAudSpeed` at depth `0.06`
- `visBrightToAudGain` at depth `0.10`
- `visBrightToAudGain` at depth `0.12`

All other routes were set to depth `0`.

Each run used the same cleared-smear protocol:

1. Set scene.
2. Set audio source.
3. Click `Clear smear`.
4. Apply the candidate route pair.
5. Wait approximately 9 seconds.
6. Read `stabilityStatus`.

This was a representative screen rather than a full six-combination sweep. It focused on the combinations most likely to expose useful differences:

- `Cars + Pad`
- `Cars + Pulse`
- `Marquee + Pulse`
- `Bouncers + Pulse`

## Results

| Candidate | Cars + Pad | Cars + Pulse | Marquee + Pulse | Bouncers + Pulse | Interpretation |
| --- | --- | --- | --- | --- | --- |
| `centroid 0.15 + motion 0.04` | `lockup - flat 0.50 on centroid to slitPosition` | `runaway - pegged 0.01 on motion to scanSpeed` | `lockup - flat 0.04 on motion to scanSpeed` | `runaway - pegged 0.01 on motion to scanSpeed` | Motion remains too collapse-prone even at very low depth. |
| `centroid 0.15 + motion 0.06` | `runaway - pegged 0.01 on motion to scanSpeed` | `runaway - pegged 0.01 on motion to scanSpeed` | `lockup - flat 0.04 on motion to scanSpeed` | `runaway - pegged 0.01 on motion to scanSpeed` | Worse than `0.04`; not viable. |
| `centroid 0.15 + brightness 0.10` | `lockup - flat 0.52 on centroid to slitPosition` | `lockup - flat 0.16 on brightness to gain` | `lockup - flat 0.25 on brightness to gain` | `lockup - flat 0.08 on brightness to gain` | Lower brightness depth removes runaway risk but not lockup. |
| `centroid 0.15 + brightness 0.12` | `lockup - flat 0.15 on brightness to gain` | `lockup - flat 0.16 on brightness to gain` | `lockup - flat 0.26 on brightness to gain` | `lockup - flat 0.10 on brightness to gain` | Still lockup-only. |

## Conclusion

Replacing only the second feedback leg is not enough.

Key outcome:

- `visMotionToAudSpeed` is still too unstable.
- Lower-depth `visBrightToAudGain` is safer than motion, but still converges to lockup across the representative screen.
- The current hue-based `Explorer loop` remains the best of the existing "centroid plus visual->audio leg" family, even though it is still too source-dependent to be the final answer.

## Next Step

The next useful screen should change the pair more fundamentally:

- test a different audio-feedback leg rather than keeping `audCentroidToVisPos` fixed
- or test a non-minimal explorer configuration that mixes one weak source-driven assist with one reciprocal pair
