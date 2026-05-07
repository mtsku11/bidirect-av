# SLITSCAN.AV TODO

This file tracks current build status so compacted sessions can resume from repository state rather than conversation history.

## Current Build State

- [x] Baseline single-file app committed and pushed to `main`.
- [x] Explicit route definitions added for the six current cross-modulation paths.
- [x] Source and processed-output analysis taps added in `feature/feedback-analysis-taps`.
- [x] Analysis taps debug panel added for source vs feedback values.
- [x] Browser smoke test confirms app load, visual feedback tap updates, audio start, and post-worklet audio analysis.
- [x] Per-routing `source / feedback` selectors added.
- [x] Feedback depth cap, ramp, leak, panic, and minimal-loop setup added in `feature/feedback-routing-controls`.

## Next Implementation Tasks

- [ ] Add a simple lockup/runaway stability indicator.
- [ ] Add manual feedback test-session logging template.
- [ ] Run first minimal-loop test session with notes on lockup/runaway/sweet spots.
- [ ] Add preset save/recall after the minimal loop is stable.

## Documentation Tasks

- [ ] Create GitHub issues for Phases 1 to 4.
- [ ] Add a changelog for merged build slices.
- [ ] Add first test-session notes after the minimal reciprocal loop exists.
