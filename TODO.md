# SLITSCAN.AV TODO

This file tracks current build status so compacted sessions can resume from repository state rather than conversation history.

## Current Build State

- [x] Baseline no-build app committed and pushed to `main`.
- [x] Runtime source split out of the HTML monolith into ordered local `js/*.js` files without adding a build system.
- [x] Explicit route definitions added for the six current cross-modulation paths.
- [x] Source and processed-output analysis taps added in `feature/feedback-analysis-taps`.
- [x] Analysis taps debug panel added for source vs feedback values.
- [x] Browser smoke test confirms app load, visual feedback tap updates, audio start, and post-worklet audio analysis.
- [x] Per-routing `source / feedback` selectors added.
- [x] Feedback depth cap, ramp, attenuation, panic, and minimal-loop setup added in `feature/feedback-routing-controls`.
- [x] Simple global lockup/runaway stability indicator added.
- [x] Preset round-tripping added through URL hash and local slot names.

## Next Implementation Tasks

- [x] Add manual feedback test-session logging template.
- [x] Run first minimal-loop test session with notes on lockup/runaway/sweet spots.
- [x] Add preset save/recall after the minimal loop is stable.
- [x] Log the next comparative sessions with saved hash or slot names attached.
- [x] Build a first small library of named presets from stable and unstable behaviors.
- [x] Test an alternative minimal reciprocal pair that aims for sustained evolution instead of brightness lockup.
- [x] Decide whether to keep `visBrightToAudGain` as the primary feedback leg or demote it to a lockup-demo preset.
- [x] Re-screen `Explorer loop` on `Cars`, `Marquee`, and `Bouncers` after the wrap-safe hue smoothing/mapping fix.
- [x] Screen a different second feedback leg for the explorer quick-start; the hue pair still locks on `Cars` and on all current Pad-based cases.
- [x] Screen a new explorer pair that changes the audio-feedback leg as well; keeping `audCentroidToVisPos` fixed did not solve the lockup problem.
- [x] Consider one weak source-driven assist if the next pure two-leg reciprocal pairs remain too collapse-prone.
- [x] Add one new feedback-capable route or derived analysis feature for Explorer screening; the new `audSpreadToVisWidth` route broadened Explorer coverage.
- [x] Repeat Cars geometry tuning under a fresh-start reproducibility criterion. Result: no reproducible `Cars` Explorer preset emerged inside the current spread+hue family.
- [x] Screen `Walker` against the current supported Explorer quick-start and decide whether it joins the core built-in regression set. Result: `Walker` does not join; horizontal runs locked on both Pad and Pulse, and a vertical Pulse spot-check ran away.
- [x] Make built-in synth sources deterministic for fresh-start feedback screening. `Pad` detune modulation and `Pulse` note scheduling now reset from fixed seeds.
- [x] Make stochastic built-in visual scenes deterministic for fresh-start feedback screening. `Cars` and `Bouncers` now reset from fixed seeds.
- [x] Re-tune or replace the current Explorer quick-start. After seeding the built-in visual scenes, the current spread+hue Explorer loop now reproduces on `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`. `Cars` and `Walker` remain outside the supported set.
- [ ] Add a small external challenge suite of uploaded video and audio clips now that the built-in Explorer quick-start reproduces across the core `Marquee` and `Bouncers` reference cases.
- [ ] Revisit `Cars` only after adding a new feedback-capable route or different control surface; width-only tuning inside the current spread+hue family flips between low-spread and high-spread runaway.
- [ ] Choose and add a repository license before publication/archive.

## Documentation Tasks

- [ ] Create GitHub issues for Phases 1 to 4.
- [ ] Add a changelog for merged build slices.
- [x] Add first test-session notes after the minimal reciprocal loop exists.
