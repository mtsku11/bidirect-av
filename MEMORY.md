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
- Current research framing: failures on `Cars`, `Walker`, and `low-sat-pan-speech.mp4 + Movie` are source-family findings unless a new route or control surface changes the picture. They are no longer the main blocker for moving the project toward paper/demo readiness.
- Current preset stance: use the named structures in `presets/library.md` as the reproducible research-facing entry point. The `Explorer loop` button is a convenience quick-start, not the thesis.
- Current quick-start split: `Explorer loop` keeps the built-in spread+hue branch for seeded built-in sources, but now uses an upload-specific branch for `Movie` and `Upload audio`: `audSpreadToVisWidth` feedback at depth `0.12`, `visHueToAudSlit` feedback at depth `0.15`, slit width `0.03`, dry/wet `0.90`.
- Current quick-start split: `Lockup loop` = `audCentroidToVisPos` feedback plus `visBrightToAudGain` feedback at depth `0.20`.
- Current finding: the old brightness pair is a reliable bounded lockup demo. After fixing both built-in source and built-in scene determinism, the current spread+hue Explorer pair now reproduces on `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`. `Walker` and `Cars` remain outside the supported Explorer family.
- Current upload-screen finding: after a stricter reset protocol and an upload-specific Explorer branch, the generated upload challenge suite now clears three of four cases. `life-color-pulse.mp4 + Movie`, `Marquee + speech-count.wav`, and `Bouncers + noise-pulse.wav` are stable under the new branch; `low-sat-pan-speech.mp4 + Movie` still locks on hue.
- Current engineering follow-up: hue analysis smooths on the unit circle, `visHueToAudSlit` folds hue around the red seam before mapping onto linear slit position, and the added `audSpreadToVisWidth` route uses derived audio spectral spread to widen the visual slit under feedback.
- Current loader note: the page query string now propagates to runtime `js/*.js` URLs, so `slitscan-av.html?ts=...` cache-busts the no-build runtime during local testing.
- Current paper scaffold: `paper/notes.md` now exists with the planned NIME structure and starter findings.
- Current screen result: pre-determinism alternative-pair screens found no clear replacement strong enough to dislodge the spread+hue quick-start. After the determinism fixes, the current quick-start already clears the built-in reproducibility threshold, so those alternatives are not the active path.
- Current Cars result: strict fresh-start screening showed width `0.04` to `0.08` collapses the feedback spread leg low on `Cars`, while width `0.12` pegs it high. No Cars-specific Explorer preset was promoted.
- Current Walker result: `Walker + Pad` horizontal locks on spread, `Walker + Pulse` horizontal locks on hue, and a vertical Pulse spot-check runs away. `Walker` does not join the core regression set under the current Explorer pair.
- Current next step: prioritize feature-trace export, per-route stability surfacing, smoke tests, paper-note growth, live-demo packaging, and the repository license. The remaining low-saturation movie hue lockup is still a useful follow-up, but not the only thing that can move the project forward.
- Current preset library: `presets/library.md`.
