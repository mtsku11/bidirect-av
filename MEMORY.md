# SLITSCAN.AV Memory

Durable project facts for compacted sessions.

- Local project path: `/Users/marcscully/Projects/bidirect-av`.
- GitHub repository: `mtsku11/bidirect-av` at `https://github.com/mtsku11/bidirect-av.git`.
- Research target: NIME 2027 paper/demo submission, not NIME 2026.
- Current artifact constraint: keep the instrument as a single-file browser app until modularization becomes necessary.
- Current implementation file: `slitscan-av.html`.
- Build direction: reciprocal audiovisual feedback with explicit per-route source/feedback analysis taps, safety caps, ramping, attenuation, panic recovery, and stability logging.
- Current reproducibility support: preset round-tripping exists through URL hash and `localStorage` slot names for built-in sources, controls, taps, and route depths; uploaded media still needs manual re-selection.
- Current quick-start split: `Explorer loop` = `audCentroidToVisPos` feedback plus `visHueToAudSlit` feedback at depth `0.15`.
- Current quick-start split: `Lockup loop` = `audCentroidToVisPos` feedback plus `visBrightToAudGain` feedback at depth `0.20`.
- Current finding: the old brightness pair is a reliable bounded lockup demo. After the wrap-safe hue fix, the new hue pair is still only verified as mobile on `Marquee + Pulse` and `Bouncers + Pulse`; `Cars + Pad`, `Cars + Pulse`, `Marquee + Pad`, and `Bouncers + Pad` all lock.
- Current engineering follow-up: hue analysis now smooths on the unit circle, and `visHueToAudSlit` now folds hue around the red seam before mapping onto linear slit position. That fixed the topology bug, but not the larger Explorer-loop stability problem.
- Current screen result: replacing the Explorer loop's second feedback leg with lower-depth `visMotionToAudSpeed` or `visBrightToAudGain` while keeping `audCentroidToVisPos` fixed does not beat hue. Motion still runs away or collapses; brightness still locks.
- Current screen result: replacing the Explorer loop's audio-feedback leg with `audAmpToVisSpeed` also does not beat the current centroid+hue pair. Amplitude-based pairs produced at most one stable representative case at a time.
- Current screen result: adding weak source `audAmpToVisSpeed` assist to the current Explorer pair preserved `Marquee + Pulse` but did not unlock `Cars` or Pad-based lockups.
- Current next step: stop rescreening the existing route family and add a new feedback-capable route or derived analysis feature before the next Explorer search.
- Current preset library: `presets/library.md`.
