# SLITSCAN.AV TODO

This file tracks current build status so compacted sessions can resume from repository state rather than conversation history.

## Current Build State

- [x] Baseline single-file app committed and pushed to `main`.
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
- [ ] Add one new feedback-capable route or derived analysis feature for Explorer screening; the current built-in route family is exhausted as a universal quick-start search space.
- [ ] Choose and add a repository license before publication/archive.

## Documentation Tasks

- [ ] Create GitHub issues for Phases 1 to 4.
- [ ] Add a changelog for merged build slices.
- [x] Add first test-session notes after the minimal reciprocal loop exists.
