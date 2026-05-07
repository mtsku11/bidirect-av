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
- Current finding: the old brightness pair is a reliable bounded lockup demo. The new hue pair is more mobile on `Marquee` and `Bouncers + Pulse`, but initially failed on `Cars`.
- Current engineering follow-up: hue analysis now smooths on the unit circle, and `visHueToAudSlit` now folds hue around the red seam before mapping onto linear slit position. `Cars` needs to be re-screened after this fix.
- Current preset library: `presets/library.md`.
