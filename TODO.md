# SLITSCAN.AV TODO

This file tracks current build status so compacted sessions can resume from repository state rather than conversation history.

## Current Build State

- [x] Baseline single-file app committed and pushed to `main`.
- [x] Explicit route definitions added for the six current cross-modulation paths.
- [x] Source and processed-output analysis taps added in `feature/feedback-analysis-taps`.
- [x] Analysis taps debug panel added for source vs feedback values.
- [x] Browser smoke test confirms app load, visual feedback tap updates, audio start, and post-worklet audio analysis.

## Next Implementation Tasks

- [ ] Add per-routing source/feedback tap controls in the routing UI.
- [ ] Add feedback-mode depth caps, initially around `0.3`.
- [ ] Add slow ramping when a routing switches into feedback mode.
- [ ] Add leak/attenuation for feedback-routed analysis values.
- [ ] Add a panic control that zeroes feedback-routing depths.
- [ ] Add a simple lockup/runaway stability indicator.

## Documentation Tasks

- [ ] Create GitHub issues for Phases 1 to 4.
- [ ] Add a changelog once the feedback tap PR is merged.
- [ ] Add first test-session notes after the minimal reciprocal loop exists.
