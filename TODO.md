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
- [x] Named preset families and logged failure cases now exist for the current built-in and upload screens.
- [x] `Cars`, `Walker`, and `low-sat-pan-speech.mp4 + Movie` are currently treated as documented source-family findings rather than universal-quick-start regressions.

## Next Implementation Tasks

- [x] Start `paper/notes.md` with the planned NIME paper structure and current verified findings.
- [ ] Add downloadable feature-trace export (`CSV` or `JSON`) for route values, route depths, taps, and stability state.
- [ ] Surface per-route stability in the routing UI, not only the global lamp.
- [ ] Add a tiny Playwright smoke test covering page load, audio start, panic, and preset round-trip.
- [ ] Prepare a stable live demo deployment path (GitHub Pages or equivalent).
- [ ] Choose and add a repository license before publication/archive.
- [ ] Expand the named preset library for paper/demo use: built-in explorer, upload explorer, lockup, runaway, and sweet-spot examples.
- [ ] Log recorded performance-style sessions and reflective notes using the named presets rather than only quick-start screening.
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
- [x] Add a small external challenge suite of uploaded video and audio clips. A generated suite now lives in `fixtures/challenge-suite/`, and the first upload-based screen is logged in `test-sessions/2026-05-08-upload-challenge-suite-screen.md`.
- [x] Screen a lower-spread or otherwise upload-friendly Explorer start against the external challenge suite. The app now uses an upload-specific Explorer branch for `Movie` and `Upload audio`: spread depth `0.12`, slit width `0.03`, dry/wet `0.90`. That branch clears three of the four generated upload cases; see `test-sessions/2026-05-08-upload-explorer-retune-screen.md`.
- [ ] Screen a lower-hue or alternate uploaded-movie second leg for low-saturation footage. `low-sat-pan-speech.mp4 + Movie` still locks on hue even after the weaker upload-specific spread branch, but it is now being treated as a source-family finding rather than the main blocker.
- [ ] Revisit `Cars` only after adding a new feedback-capable route or different control surface. Width-only tuning inside the current spread+hue family flips between low-spread and high-spread runaway, so `Cars` is currently a finding rather than a default-preset blocker.
- [ ] Consider separating deterministic regression mode from default performer boot once trace export and smoke tests exist.

## Documentation Tasks

- [ ] Create GitHub issues for Phases 1 to 4.
- [ ] Add a changelog for merged build slices.
- [x] Add first test-session notes after the minimal reciprocal loop exists.
