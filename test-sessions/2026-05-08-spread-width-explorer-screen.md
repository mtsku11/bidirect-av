# Spread-Width Explorer Screen

Date: 2026-05-08

## Goal

Add one new feedback-capable route to the current family, then re-run the Explorer search against that expanded routing surface.

New route added in this slice:

- `audSpreadToVisWidth`
- source feature: derived audio spectral spread
- target: visual slit width
- intent: make broader post-worklet spectra admit more fresh visual source, instead of only shifting slit position or scan speed

## Protocol

All runs used the current cleared-smear protocol in Chromium via Playwright:

1. Load the current local build from the repo-backed server.
2. Click `Start audio`.
3. Select the scene and built-in audio source.
4. Click `Clear smear`.
5. Zero all route depths and return all route taps to `source`.
6. Apply the test routing.
7. Wait approximately 9 seconds.
8. Read `stabilityStatus`.

Combinations screened:

- `Cars + Pad`
- `Cars + Pulse`
- `Marquee + Pad`
- `Marquee + Pulse`
- `Bouncers + Pad`
- `Bouncers + Pulse`

## Candidate pair

The most plausible new Explorer candidate was:

- `audSpreadToVisWidth`: feedback tap
- `visHueToAudSlit`: feedback tap

The old hue route stayed in place because it still outperformed the other visual-to-audio legs. The new question was whether replacing the audio side with spread-driven slit width would reduce lockup without introducing motion-style runaway.

## Results

### `spread+hue-0.18`

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

| Combination | Result |
| --- | --- |
| `Cars + Pad` | `lockup - flat 0.80 on hue to slitPosition` |
| `Cars + Pulse` | `lockup - flat 0.77 on hue to slitPosition` |
| `Marquee + Pad` | `stable - window 2.0s - range 0.11` |
| `Marquee + Pulse` | `stable - window 2.0s - range 0.11` |
| `Bouncers + Pad` | `stable - window 2.0s - range 0.07` |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.26` |

Observed spread taps at the end of the runs:

- source spread sat around `0.11` to `0.32`
- feedback spread sat around `0.95` to `1.00`

### `spread+hue-0.24`

- `audSpreadToVisWidth`: feedback tap, depth `0.24`
- `visHueToAudSlit`: feedback tap, depth `0.15`

| Combination | Result |
| --- | --- |
| `Cars + Pad` | `lockup - flat 0.81 on hue to slitPosition` |
| `Cars + Pulse` | `runaway - pegged 0.98 on spread to slitWidth` |
| `Marquee + Pad` | `stable - window 2.0s - range 0.11` |
| `Marquee + Pulse` | `stable - window 2.0s - range 0.98` |
| `Bouncers + Pad` | `stable - window 2.0s - range 0.97` |
| `Bouncers + Pulse` | `stable - window 2.0s - range 0.04` |

## Reading

- The new `spread -> slit width` route is the first added route that materially broadens Explorer coverage.
- At depth `0.18`, the pair stays mobile on both `Marquee` and `Bouncers` with both Pad and Pulse.
- `Cars + Pad` and `Cars + Pulse` still lock, so the new pair is not universal.
- Raising spread depth to `0.24` does not rescue `Cars`, and it introduces at least one clear runaway case on `Cars + Pulse`.

## Conclusion

Promote the lower-depth spread pair as the new Explorer quick-start:

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

Keep the old brightness pair as `Lockup loop`.

The next useful question is narrower now:

- either tune the new spread Explorer specifically for `Cars`
- or accept that `Cars` may need a distinct alternate exploratory preset rather than a single universal built-in quick-start
