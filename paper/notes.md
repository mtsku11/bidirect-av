# SLITSCAN.AV Paper Notes

Working notes for the NIME 2027 paper/demo track. Keep this file lightweight and cumulative: add findings, phrasing, evidence gaps, and figure ideas as sessions land.

## 1. Abstract

- Working contribution: a browser-native audiovisual instrument that couples visual slit-scan and spectral slit-scan through explicit, per-route cross-modal analysis mappings, with a controllable shift from source-driven reactivity to reciprocal feedback.
- Current evidence supports the instrument build, safety controls, preset reproducibility, and multiple documented feedback behaviors.
- Evidence still needed: downloadable feature traces, recorded performance-style sessions, live demo packaging, and the final paper framing around findings rather than only implementation.

## 2. Introduction

- Frame the project as an under-mapped intersection of audiovisual instrument design, feedback musicianship, and explicit cross-modal coupling.
- Emphasize that the contribution is not “audio and visuals modulate each other,” but that the couplings are inspectable, per-route, performer-adjustable, and feedback-addressable.
- Avoid novelty inflation. Use “design case study”, “practice-led investigation”, and “proposed operational analogue”.

## 3. Background and Related Work

- Feedback musicianship and ecosystemic agency.
- Audiovisual performance instruments and mapping design.
- Practice-led digital musical instrument research in NIME.
- Explicit-analysis coupling as a contrast to opaque latent-space systems.

## 4. Instrument Concept

- Visual slit-scan as temporal displacement in image space.
- Spectral slit-scan as a drone-oriented operational analogue in the frequency domain.
- Cross-modal routing matrix as the instrument’s inspectable coupling surface.
- Named presets are more important for research communication than a single universal quick-start.

## 5. Technical Implementation

- Static no-build browser app with one HTML entry point and ordered local `js/*.js` runtime files.
- Visual pipeline: source canvas, ping-pong WebGL slit-scan, downsampled source/feedback visual analysis.
- Audio pipeline: AudioWorklet spectral slit-scan, source/post-worklet analysis taps, overlap-add synthesis.
- Safety layer: per-route source/feedback taps, feedback caps, ramping, attenuation, panic, and global stability lamp.
- Reproducibility layer: preset hash/local slots, deterministic built-in regression sources, generated upload challenge suite.

## 6. Reciprocal Feedback Design

- Minimal reciprocal pair now lives as the named `Lockup loop` example.
- Current exploratory pair is `audSpreadToVisWidth` feedback plus `visHueToAudSlit` feedback, with separate built-in and upload-specific starting depths.
- Design claim: the interesting control problem is not maximizing feedback depth, but shaping bounded yet evolving attractors.

## 7. Testing Method

- Structured session logs live in `test-sessions/`.
- Reproducibility currently comes from named presets, deterministic built-ins, and the generated upload challenge suite.
- Add downloadable feature-trace export so sessions produce analyzable data rather than only textual observation.
- Add a minimal Playwright smoke test to protect the no-build runtime.

## 8. Findings

- The original centroid-plus-brightness reciprocal pair is a reliable bounded lockup demo, not the best exploratory start.
- The spread-plus-hue Explorer family is source-dependent rather than universal.
- Supported built-in Explorer cases currently include `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`.
- `Cars` and `Walker` remain outside the supported Explorer family under the current route set.
- Generated upload screening now clears three of four cases with the weaker upload-specific Explorer branch, but `low-sat-pan-speech.mp4 + Movie` still locks on hue.
- Source-family failure modes are themselves useful findings for the paper, not just bugs to eliminate.

## 9. Discussion

- Why explicit routes matter: they let the performer and the paper isolate which coupling is active when a loop locks or runs away.
- Why named presets matter: they communicate the instrument more honestly than a universal quick-start would.
- The instrument appears to support a family of attractors rather than one global “best” feedback regime.

## 10. Limitations and Future Work

- Feature traces are not exportable yet.
- Per-route stability is computed internally but not yet surfaced in the UI.
- No repository license yet.
- No live demo deployment yet.
- Smoke tests are still missing.
- Deterministic built-ins currently favor regression comparability over performer-facing variability; that split should be made explicit later.

## 11. Conclusion

- Current conclusion draft: SLITSCAN.AV already functions as a reciprocal audiovisual instrument with legible feedback affordances and documented behavior families.
- The remaining work is less about proving that reciprocal feedback can exist and more about making the resulting behaviors portable, traceable, performable, and publishable.
