# SLITSCAN.AV Memory

Durable project facts for compacted sessions.

- Local project path: `/Users/marcscully/Projects/bidirect-av`.
- GitHub repository: `mtsku11/bidirect-av` at `https://github.com/mtsku11/bidirect-av.git`.
- Research target: NIME 2027 paper/demo submission, not NIME 2026.
- Current artifact constraint: keep the instrument as a single-file browser app until modularization becomes necessary.
- Current implementation file: `slitscan-av.html`.
- Build direction: reciprocal audiovisual feedback with explicit per-route source/feedback analysis taps, safety caps, ramping, attenuation, panic recovery, and stability logging.
- Current reproducibility support: preset round-tripping exists through URL hash and `localStorage` slot names for built-in sources, controls, taps, and route depths; uploaded media still needs manual re-selection.
- Current quick-start split: `Explorer loop` = `audSpreadToVisWidth` feedback at depth `0.18` plus `visHueToAudSlit` feedback at depth `0.15`.
- Current quick-start split: `Lockup loop` = `audCentroidToVisPos` feedback plus `visBrightToAudGain` feedback at depth `0.20`.
- Current finding: the old brightness pair is a reliable bounded lockup demo. The supported spread+hue Explorer pair is verified as mobile on `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`, but `Cars` is still unresolved.
- Current engineering follow-up: hue analysis smooths on the unit circle, `visHueToAudSlit` folds hue around the red seam before mapping onto linear slit position, and the added `audSpreadToVisWidth` route uses derived audio spectral spread to widen the visual slit under feedback.
- Current screen result: replacing the Explorer loop's second feedback leg with lower-depth `visMotionToAudSpeed` or `visBrightToAudGain` while keeping `audCentroidToVisPos` fixed does not beat hue. Motion still runs away or collapses; brightness still locks.
- Current screen result: replacing the Explorer loop's audio-feedback leg with `audAmpToVisSpeed` also does not beat the current centroid+hue pair. Amplitude-based pairs produced at most one stable representative case at a time.
- Current screen result: adding weak source `audAmpToVisSpeed` assist to the current Explorer pair preserved `Marquee + Pulse` but did not unlock `Cars` or Pad-based lockups.
- Current next step: repeat Cars geometry tuning under a fresh-start reproducibility criterion, then either promote a Cars-specific preset or leave Cars out of the core Explorer quick-start.
- Current preset library: `presets/library.md`.
