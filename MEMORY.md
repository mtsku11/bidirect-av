# SLITSCAN.AV Memory

Durable project facts for compacted sessions.

- Local project path: `/Users/marcscully/Projects/bidirect-av`.
- GitHub repository: `mtsku11/bidirect-av` at `https://github.com/mtsku11/bidirect-av.git`.
- Research target: NIME 2027 paper/demo submission, not NIME 2026.
- Current artifact constraint: keep the instrument as a no-build static browser app with a single HTML entry point.
- Current implementation entry point: `slitscan-av.html`, with ordered source files in `js/`.
- Build direction: reciprocal audiovisual feedback with explicit per-route source/feedback analysis taps, safety caps, ramping, attenuation, panic recovery, and stability logging.
- Current reproducibility support: preset round-tripping exists through URL hash and `localStorage` slot names for built-in sources, controls, taps, and route depths; uploaded media still needs manual re-selection.
- Current built-in determinism: `Pad` detune modulation, `Pulse` note scheduling, and the stochastic `Cars` and `Bouncers` scene initial states now reset from fixed seeds for fresh-start screening.
- Current upload challenge suite: generated fixtures live in `fixtures/challenge-suite/` and can be regenerated with `./scripts/generate_challenge_suite.sh`.
- Current quick-start split: `Explorer loop` = `audSpreadToVisWidth` feedback at depth `0.18` plus `visHueToAudSlit` feedback at depth `0.15`.
- Current quick-start split: `Lockup loop` = `audCentroidToVisPos` feedback plus `visBrightToAudGain` feedback at depth `0.20`.
- Current finding: the old brightness pair is a reliable bounded lockup demo. After fixing both built-in source and built-in scene determinism, the current spread+hue Explorer pair now reproduces on `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`. `Walker` and `Cars` remain outside the supported Explorer family.
- Current upload-screen finding: the first generated upload challenge suite did not clear the same threshold. `Marquee + speech-count.wav` stayed stable, `low-sat-pan-speech.mp4 + Movie` locked on hue, and both `life-color-pulse.mp4 + Movie` and `Bouncers + noise-pulse.wav` ran away on the spread leg.
- Current engineering follow-up: hue analysis smooths on the unit circle, `visHueToAudSlit` folds hue around the red seam before mapping onto linear slit position, and the added `audSpreadToVisWidth` route uses derived audio spectral spread to widen the visual slit under feedback.
- Current screen result: pre-determinism alternative-pair screens found no clear replacement strong enough to dislodge the spread+hue quick-start. After the determinism fixes, the current quick-start already clears the built-in reproducibility threshold, so those alternatives are not the active path.
- Current Cars result: strict fresh-start screening showed width `0.04` to `0.08` collapses the feedback spread leg low on `Cars`, while width `0.12` pegs it high. No Cars-specific Explorer preset was promoted.
- Current Walker result: `Walker + Pad` horizontal locks on spread, `Walker + Pulse` horizontal locks on hue, and a vertical Pulse spot-check runs away. `Walker` does not join the core regression set under the current Explorer pair.
- Current next step: tune or branch an upload-friendly Explorer start, because the current spread+hue quick-start is built-in-stable but upload-fragile. Only revisit `Cars` after adding a new feedback-capable route or different control surface.
- Current preset library: `presets/library.md`.
