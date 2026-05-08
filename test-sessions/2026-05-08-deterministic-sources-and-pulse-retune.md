# Deterministic Sources and Pulse Retune

Date: 2026-05-08

## Goal

Continue the Explorer retune after the fresh-start revalidation narrowed the current reproducible built-in set too far.

## Discovery

The tuning screen exposed a deeper reproducibility problem in the built-in sources themselves:

- `Pulse` generated notes from `Math.random()` on every fresh start.
- `Pad` also randomized its detune LFO rates and depths on every fresh start.

That meant some of the earlier "fresh-start" Explorer screens were partly measuring source variation rather than loop behavior.

## Code changes

Two structural changes landed before further screening:

1. Built-in synth sources now reset from fixed seeds in `js/audio.js`.
2. `Explorer loop` now applies a Pulse-specific starting point in `js/app.js`:
   - `slitWidth = 0.03`
   - `audioMix = 0.85`

Pad and non-built-in sources keep the previous base controls for now.

## Retune screen

Representative candidates screened after the determinism fix:

- `Marquee + Pulse`, current Explorer pair, width `0.04`, mix `1.0`
- `Marquee + Pulse`, tuned Explorer pair, width `0.04`, mix `0.85`
- `Marquee + Pulse`, tuned Explorer pair, width `0.03`, mix `0.85`
- `Bouncers + Pad`, width `0.03`, mix `0.85`, with and without a lower spread depth
- `Bouncers + Pulse`, width `0.03`, mix `0.85`
- `Marquee + Pad`, conservative probe width `0.02`, mix `0.75`

## Results

### Stable result

`Marquee + Pulse` with the tuned Pulse start reproduced cleanly twice under fresh starts:

- `audSpreadToVisWidth`: feedback depth `0.18`
- `visHueToAudSlit`: feedback depth `0.15`
- `slitWidth = 0.03`
- `audioMix = 0.85`

Observed outcomes:

- pass 1: `stable - window 2.0s - range 0.11`
- pass 2: `stable - window 2.0s - range 0.11`

### Negative results

- `Marquee + Pulse`, width `0.04`, mix `0.85`: still ran away on spread.
- `Bouncers + Pad`, width `0.03`, mix `0.85`: still ran away on spread.
- `Bouncers + Pad`, width `0.03`, mix `0.85`, spread depth `0.14`: still ran away on spread.
- `Bouncers + Pulse`, width `0.03`, mix `0.85`: still ran away on spread.
- `Marquee + Pad`, width `0.02`, mix `0.75`: produced one promising stable probe during manual tuning, but it did not hold up cleanly enough to promote into the quick-start.

## Conclusion

This slice improved the research harness and partially improved the Explorer quick-start, but it does not close the Explorer retune task yet.

Durable conclusions:

- Built-in source determinism was necessary and is now in place.
- The current best verified Explorer reference is `Marquee + Pulse` with the narrower, less-wet Pulse start.
- Pad-based and `Bouncers`-based Explorer coverage remain unresolved.
- The next tuning step should focus on finding a reproducible Pad-friendly starting point or replacing the spread+hue pair for non-Pulse sources.
