# SLITSCAN.AV Project Plan

## 1. Project aim

Build, test, document, and write up **SLITSCAN.AV** as a real-time audiovisual instrument for NIME 2027. The instrument explores a dual slit-scan metaphor: visual slit-scan in image space and spectral slit-scan in audio space, connected by explicit cross-modal analysis routings. The core research direction is to move from a reactive audiovisual effect toward a controllable reciprocal-feedback instrument.

The intended NIME contribution is not simply that audio and visuals modulate one another. The stronger contribution is:

> A browser-native audiovisual feedback instrument using explicit, inspectable, per-routing cross-modal analysis couplings, with controllable transition from source-driven reactivity to reciprocal self-referential feedback.

This should be framed as an **instrument-design and practice-led research contribution**, supported by technical implementation, situated literature, testing, performance use, and documented observations of behavior.

## 2. Working research questions

Use these as provisional research questions. They can be refined after implementation and testing.

1. How can slit-scan, a visual temporal-smearing technique, be operationally reinterpreted in the spectral domain as a playable audio process?
2. What kinds of musical and visual behaviors emerge when visual and audio slit-scan processes are coupled through explicit analysis features?
3. How does reciprocal feedback change the system from a reactive audiovisual processor into an instrument with autonomous or semi-autonomous behavior?
4. What control affordances are needed to keep cross-modal audiovisual feedback playable rather than unstable, static, or chaotic?
5. What does the performer learn to listen for and look for when performing with a feedback-coupled audiovisual instrument?

## 3. Contribution statement

The project should aim to contribute the following:

- A working browser-native audiovisual instrument requiring no build step or installation.
- A spectral slit-scan process proposed as an audio-domain analogue of visual slit-scan.
- An explicit cross-modal routing matrix using interpretable features rather than opaque latent spaces.
- Per-routing depth control, enabling isolation and study of individual audio-to-visual and visual-to-audio couplings.
- A reciprocal feedback mode in which each domain can analyze the processed output of the other domain rather than only the original source.
- Design knowledge about damping, stability, ramping, runaway, lockup, and performer control in cross-modal feedback systems.
- A documented set of findings based on testing, performance trials, and reflective use.

## 4. Academic grounding

### 4.1 Main academic threads

The project sits between several bodies of work rather than wholly inside one of them.

#### Feedback musicianship

Relevant for the reciprocal-feedback layer, emergence, instability, autonomy, and the performer-system relationship.

Core references:

- Kiefer, C., Eldridge, A., and Overholt, D. (2025). *Future Research Challenges in Feedback Musicianship*. Zenodo. https://zenodo.org/records/15005138
- Sanfilippo, D. and Valle, A. (2013). *Feedback Systems: An Analytical Framework*. Computer Music Journal. https://www.jstor.org/stable/24265464
- Eldridge, A., Kiefer, C., Overholt, D., and Ulfarsson, H. (2021). *Self-resonating Vibrotactile Feedback Instruments*. https://feedback-musicianship.pubpub.org/pub/kl8m5o5y
- Di Scipio, A. and Sanfilippo, D. (2019). Ecosystemic agency and live performance writings. https://www.dariosanfilippo.com/publications.html

#### Audiovisual performance instruments

Relevant for simultaneous audio/image performance, instrumentality, audiovisual mapping, and performer-facing interface design.

Core references:

- Levin, G. (2000). *Painterly Interfaces for Audiovisual Performance*. MIT. https://dspace.mit.edu/handle/1721.1/61848
- NIME proceedings archive. https://nime.org/papers/
- NIME conference overview. https://nime.org/

#### Digital musical instrument design and practice-led NIME research

Relevant for how to write about the artefact as research, not only as software.

Useful references and search targets:

- Green, O. (2014). *NIME, Musicality and Practice-led Methods*.
- Gurevich, Stapleton, and Bennett (2009). *Designing for Style in New Musical Interactions*.
- Rodger, Stapleton, van Walstijn, Ortiz, and Pardue (2020). *What Makes a Good Musical Instrument? A Matter of Processes, Ecologies and Specificities*.
- Morreale et al. and related NIME writing on digital musical instruments as research products.

#### Machine-learning and latent-space audiovisual instruments

Relevant mostly as a contrast: SLITSCAN.AV should be positioned as explicit, interpretable, and analysis-driven rather than latent-space-driven.

Core reference:

- Akten, M. PhD-era and later work on deep visual instruments and latent-space navigation. https://www.memo.tv/writing/

#### Recent related work

Track emerging NIME and arXiv work around AI, feedback, agency, and recursive audiovisual systems. One useful recent reference is:

- *Co-constructing a Dual Feedback Apparatus* (arXiv, 2026). https://arxiv.org/pdf/2604.25207

### 4.2 Safe positioning

Use this formulation in the paper and project description:

> SLITSCAN.AV addresses an under-mapped intersection between feedback musicianship, audiovisual instrument design, and cross-modal analysis-driven coupling. While prior work has explored audiovisual performance interfaces, audio feedback instruments, ecosystemic agency, and latent-space audiovisual systems, fewer examples make real-time cross-modal routings explicit, performer-adjustable, and feedback-addressable at the level of individual analysis-to-parameter paths.

Avoid saying:

- “Nobody has done this before.”
- “This is the first audiovisual feedback instrument.”
- “Spectral slit-scan is the correct audio equivalent of visual slit-scan.”

Prefer:

- “Under-mapped.”
- “A proposed operational analogue.”
- “A design case study.”
- “An exploratory instrument.”
- “A practice-led investigation.”

## 5. Technical architecture

### 5.1 Current architecture

The current system should remain a single-file web instrument for as long as possible. This supports accessibility, reproducibility, and easy NIME demo distribution.

Current components:

- Visual source canvas, fed by procedural scenes or uploaded video.
- WebGL visual slit-scan shader using ping-pong feedback render targets.
- Audio sources: internal synths, movie audio, uploaded audio.
- AudioWorklet spectral slit-scan using FFT, magnitude propagation, inverse FFT, and overlap-add.
- Visual analysis: brightness, motion, hue.
- Audio analysis: RMS amplitude, spectral centroid, onset flux.
- Cross-modulation routing matrix with per-routing depth sliders.
- Real-time meters for analyzed features.

### 5.2 Planned reciprocal feedback architecture

Current analysis taps source signals. Feedback mode should allow each routing to choose whether it uses source analysis or processed-output analysis.

Required change:

- Visual analysis input options:
  - `source`: analyze `sourceCanvas`.
  - `feedback`: analyze the rendered slit-scan output.
- Audio analysis input options:
  - `source`: analyze signal before the spectral slit-scan worklet.
  - `feedback`: analyze signal after the spectral slit-scan worklet.

This should be implemented **per routing**, not globally. Each modulation path should have its own source/feedback toggle.

Example routing state:

```js
{
  id: 'audioCentroidToVisualPosition',
  sourceDomain: 'audio',
  feature: 'centroid',
  targetDomain: 'visual',
  targetParam: 'slitPosition',
  depth: 0.2,
  analysisTap: 'feedback',
  feedbackRamp: 1.0,
  feedbackAttenuation: 0.98,
  smoothingTime: 1.5
}
```

### 5.3 Minimum viable feedback loop

Do not enable all feedback routings at once.

Start with one weak bidirectional pair:

1. Audio output centroid -> visual slit position, depth approximately 0.2.
2. Visual output brightness -> audio gain, depth approximately 0.2.

This gives a minimal closed audiovisual loop with two analyzers, two target parameters, and one cross-domain cycle.

Only after this is stable should additional feedback-addressable routings be enabled.

### 5.4 Stability and safety controls

The feedback layer must include stability controls from the beginning. Do not treat them as polish.

Required controls:

- Per-routing source/feedback toggle.
- Per-routing depth cap in feedback mode, initially around 0.3.
- Slow-ramp engagement over approximately 5 seconds when feedback is enabled.
- Slower smoothing constants for feedback mode than source mode.
- Feedback attenuation, initially 0.97 to 0.99.
- Panic button that immediately sets all feedback-routing depths to zero.
- Stability indicator detecting lockup and runaway.
- Optional freeze button that holds the current feedback state.

### 5.5 Stability detection

Implement simple, observable heuristics rather than complex theory at first.

Lockup indicator:

- Feature meters show very low variance for more than 1 to 2 seconds.
- Visual output appears static or nearly static.
- Audio output holds a fixed drone with little spectral movement.

Runaway indicator:

- One or more normalized meters remain close to 0 or 1 for more than 1 second.
- Output gain approaches clipping.
- Visual output approaches all black, all white, or saturated smear.

Sweet-spot indicator:

- Feature values remain bounded but active.
- Output continues to evolve without clipping or freezing.
- Performer can intervene and predict broad consequences without fully controlling the result.

Possible metrics:

```js
const varianceWindowSeconds = 2.0;
const lockupVarianceThreshold = 0.0005;
const runawayLowThreshold = 0.03;
const runawayHighThreshold = 0.97;
const runawayHoldSeconds = 1.0;
```

## 6. Development phases

### Phase 0 — Repository setup and baseline preservation

Goals:

- Create a GitHub repository.
- Commit the current single-file version as a known baseline.
- Add README, license, and project notes.
- Add issue labels: `audio`, `visual`, `feedback`, `ui`, `paper`, `testing`, `bug`, `nime`.
- Add a changelog.

Deliverables:

- `slitscan-av.html` baseline commit.
- `README.md` updated with current state and limitations.
- `plan.md` and `agent.md` committed.
- GitHub issues created for each development phase.

### Phase 1 — Technical cleanup before feedback

Status: complete for the current build. The explicit routing matrix, source/feedback analysis separation, debug readout, and per-routing tap selectors are implemented.

Goals:

- Refactor routing logic into a clear data structure.
- Separate source analysis values from processed-output analysis values.
- Add debug panel for feature values and parameter values.
- Ensure all parameter ranges are clamped and documented.
- Add basic browser compatibility notes.

Deliverables:

- Modularized routing layer, even if still inside one HTML file.
- Visible feature meters for both source and feedback taps.
- Reproducible test presets manually documented.

Acceptance criteria:

- Existing source-driven cross-modulations still work.
- Each modulation can be isolated and tested independently.
- No major audio dropouts in Chrome on a desktop/laptop machine.

### Phase 2 — Processed-output analysis taps

Status: complete for the current build. Source and processed-output values are available simultaneously for visual and audio features, and the UI exposes source/feedback tap selection per route.

Goals:

- Implement visual analysis of processed slit-scan output.
- Implement audio analysis of post-worklet output.
- Expose source/feedback tap selection internally first, then in UI.

Implementation notes:

- Visual feedback analysis should downsample the rendered output to a small analysis canvas. Avoid expensive full-resolution readbacks if possible.
- Audio feedback analysis should use an `AnalyserNode` after the worklet. Watch for added latency, clipping, and gain-scaling inconsistencies.

Deliverables:

- Source and feedback analysis values available simultaneously.
- UI debug display showing source vs feedback values.
- Performance notes for visual readback cost.

Acceptance criteria:

- Processed-output meters respond correctly.
- Frame rate remains acceptable at 960 x 540 and lower render resolutions.
- Post-worklet audio analysis behaves consistently with gain staging.

### Phase 3 — Minimal reciprocal feedback loop

Status: in progress. A minimal-loop control now configures the intended weak bidirectional pair with feedback depth `0.20`, feedback cap `0.30`, slow ramp, attenuation, stability indication, and panic recovery. The first short test session is logged in `test-sessions/2026-05-07-minimal-loop.md`, and the first comparative matrix is logged in `test-sessions/2026-05-07-comparative-minimal-loop.md`. The current brightness-to-gain reciprocal pair is bounded but consistently converges toward lockup rather than a sustained evolving sweet spot.

Goals:

- Implement the first weak bidirectional feedback pair:
  - audio feedback centroid -> visual slit position.
  - visual feedback brightness -> audio gain.
- Add attenuation, smoothing, ramping, and feedback depth cap.
- Add panic button.

Deliverables:

- Minimal feedback mode functioning.
- Manual test log for at least 10 different sources/presets.
- Notes on lockup, runaway, and sweet-spot behavior.

Acceptance criteria:

- Feedback can be engaged gradually without immediate runaway.
- Panic button reliably stops feedback modulation.
- The loop produces audible/visible behavior distinct from source-only mode.

### Phase 4 — Full per-routing feedback controls

Goals:

- Add feedback toggles for all six routing paths.
- Allow mixed source/feedback routing states.
- Add global feedback safety status.
- Add optional per-routing stability display.

Deliverables:

- Six source/feedback toggles.
- Six depth controls with feedback-mode caps.
- Stability indicator.
- Preset examples:
  - source-reactive AV smear.
  - weak reciprocal drone.
  - unstable/runaway demonstration.
  - lockup demonstration.
  - sweet-spot demonstration.

Acceptance criteria:

- Each routing can be tested independently.
- Multiple feedback routings can be combined without hidden global assumptions.
- The instrument remains performable under constrained settings.

### Phase 5 — Presets, logging, and reproducibility

Status: in progress. URL-hash and local-slot preset round-tripping is now working for built-in scenes, built-in audio sources, base controls, routing taps, and routing depths. Uploaded media still needs manual re-selection after reload. A first curated preset library now exists in `presets/library.md`, and broader logged sessions are underway.

Goals:

- Add preset save/recall through JSON, URL hash, or localStorage.
- Add session logging for research notes.
- Add optional export of feature traces as JSON or CSV.

Useful logs:

- Date/time.
- Browser and device.
- Source type.
- Preset values.
- Routing states.
- Feature traces.
- Stability flags.
- User notes.

Deliverables:

- Preset save/recall.
- At least 8 named presets.
- Test-session template.
- Exportable logs.

Acceptance criteria:

- A behavior can be approximately reproduced from a saved preset.
- Findings can be tied to specific settings.
- Screenshots, screen recordings, and audio captures can be matched to logs.

### Phase 6 — Performance testing

Goals:

- Use the instrument in actual performance-like sessions.
- Record screen and audio output.
- Write reflective notes immediately after each session.
- Identify whether the system affords exploration, repeatability, surprise, and recovery.

Test structure:

1. Source-reactive session.
2. Minimal feedback session.
3. Multi-routing feedback session.
4. Uploaded video/audio session.
5. Procedural-source session.
6. Failure-mode session.
7. Performance rehearsal session.
8. Final documentation recording.

Collect:

- Video recordings.
- Audio recordings.
- Preset files.
- Feature logs.
- Reflective notes.
- Bugs and design changes.

### Phase 7 — Evaluation and findings

This is not a controlled psychophysics experiment. Treat it as practice-led instrument-design research.

Possible findings categories:

- Mapping behavior:
  - Which feature-to-parameter paths are musically useful?
  - Which feel arbitrary?
  - Which are too unstable?
- Feedback behavior:
  - What causes lockup?
  - What causes runaway?
  - What produces the sweet spot?
- Performer control:
  - Which controls are essential in performance?
  - Does per-routing depth control matter?
  - Is the panic button musically useful or only technical safety?
- Instrumentality:
  - Does the system invite learning?
  - Does it develop recognizable behaviors?
  - Can the performer form strategies?
- Technical constraints:
  - Browser performance limits.
  - Audio latency/dropouts.
  - Visual readback costs.
  - Reproducibility limitations.

### Phase 8 — NIME paper preparation

Target submission types:

- Short paper / demo-style paper if the instrument and findings are compact.
- Medium paper if there are substantial design findings and evaluation notes.
- Demo, performance, or artwork submission alongside the paper if appropriate.

NIME context:

- NIME publishes peer-reviewed open-access proceedings.
- NIME welcomes work on new interfaces for musical expression, including instrument design, performance, and artistic research.
- Current target: NIME 2027 paper/demo submission. Track the official call dates when they are announced and keep the testing/paper schedule aligned to that cycle.

Paper working title options:

- *SLITSCAN.AV: A Cross-Modal Feedback Instrument for Audiovisual Slit-Scan Performance*
- *Spectral Slit-Scan and Reciprocal Feedback in a Browser-Based Audiovisual Instrument*
- *From Cross-Modulation to Reciprocal Feedback: Designing SLITSCAN.AV*

Proposed paper structure:

1. Abstract.
2. Introduction.
3. Background and related work.
4. Instrument concept.
5. Technical implementation.
6. Reciprocal feedback design.
7. Testing method.
8. Findings.
9. Discussion.
10. Limitations and future work.
11. Conclusion.

### Phase 9 — Release package

Goals:

- Make the project reproducible and reviewable.
- Prepare a clear demo path for reviewers.

Deliverables:

- GitHub repository.
- Live demo page.
- README with screenshots/GIFs.
- `plan.md`.
- `agent.md`.
- Preset files.
- Demo video.
- Short technical explanation video if useful.
- Paper PDF.
- Citation metadata file if the project is archived.

## 7. Testing protocol

### 7.1 Technical test matrix

Test across:

- Chrome desktop.
- Firefox desktop.
- Safari desktop if available.
- At least one lower-powered laptop.
- Optional mobile test, but do not optimize for mobile as the main platform.

Test sources:

- Built-in Pad.
- Built-in Pulse.
- Procedural Cars.
- Procedural Bouncers.
- Procedural Marquee.
- Procedural Walker.
- Uploaded video with audio.
- Uploaded audio only.

Test modes:

- No modulation.
- Source-only modulation.
- Single routing isolated.
- Minimal feedback pair.
- Multiple feedback routings.
- Deliberate runaway.
- Deliberate lockup.
- Sweet-spot preset.

### 7.2 Observation template

For each session, record:

```md
# Test Session

Date:
Browser:
Device:
Source:
Preset:
Mode: source / feedback / mixed
Duration:

## Settings

- Visual resolution:
- Slit position:
- Slit width:
- Scan speed:
- Audio source:
- Dry/wet:
- Master gain:
- Active routings:
- Feedback toggles:
- Depth values:
- Smoothing values:
- Attenuation values:

## Observed behavior

- Stable behaviors:
- Emergent behaviors:
- Lockup moments:
- Runaway moments:
- Recoverability:
- Performer strategies:

## Technical issues

- Audio glitches:
- Frame drops:
- UI problems:
- Browser-specific issues:

## Research notes

- What did this reveal about the instrument?
- What should be changed?
- What might be worth writing about?
```

## 8. Paper argument outline

The likely argument:

1. Audiovisual instruments often use mappings between image and sound, but many mappings are either fixed, gestural, opaque, or one-directional.
2. Feedback musicianship offers a language for systems that behave with partial autonomy, but much of the literature emphasizes audio, physical feedback, or electromechanical systems.
3. SLITSCAN.AV explores a cross-modal feedback instrument where both domains are signal-processing systems with their own temporal memory.
4. The instrument uses explicit analysis-to-parameter routings so the performer can inspect, isolate, and tune the coupling paths.
5. Reciprocal feedback introduces useful instability, but only if constrained by damping, ramping, depth caps, and emergency controls.
6. Testing shows which routings produce playable behaviors, which tend toward lockup/runaway, and what interface affordances support performance.

## 9. Risks and mitigations

### Risk: Overclaiming novelty

Mitigation:

- Use careful language: under-mapped, exploratory, proposed analogue, design case study.
- Cite adjacent work generously.
- State clearly what the project does and does not claim.

### Risk: Browser audio performance problems

Mitigation:

- Keep FFT size and hop configurable internally.
- Profile AudioWorklet CPU usage.
- Provide lower-quality fallback settings.
- Document browser/device limits.

### Risk: Visual readback cost

Mitigation:

- Analyze small downsampled outputs only.
- Avoid high-frequency `gl.readPixels` at full resolution.
- Consider analysis every second or third frame if needed.

### Risk: Feedback becomes unplayable

Mitigation:

- Add ramping, attenuation, caps, smoothing, freeze, and panic controls early.
- Build from one bidirectional pair upward.
- Save stable presets.

### Risk: Findings remain anecdotal

Mitigation:

- Use structured test sessions.
- Log presets and feature traces.
- Record video/audio documentation.
- Write reflective notes immediately after testing.
- Compare source-only, feedback-only, and mixed modes.

## 10. Immediate next actions

- [x] Commit the current baseline to GitHub.
- [x] Add this `plan.md` and `agent.md`.
- [ ] Create GitHub issues for Phases 1 to 4.
- [x] Refactor routing state into explicit data structures.
- [x] Add source vs feedback analysis taps.
- [x] Add per-routing source/feedback tap controls.
- [x] Implement the minimal two-routing reciprocal loop.
- [x] Add panic, ramp, attenuation, and feedback depth cap.
- [x] Add lockup/runaway stability indicator.
- [x] Record the first minimal-loop test session and begin the findings log.
- [x] Add preset save/recall through URL hash and local slot names.
- [ ] Start a paper notes document with headings from the proposed NIME structure.

## 11. Definition of done

The project is ready for NIME submission when the following exist:

- A stable live demo.
- A documented GitHub repository.
- At least 6 to 8 meaningful presets.
- A clear reciprocal-feedback mode.
- A panic/recovery mechanism.
- At least 8 recorded test/performance sessions.
- Written findings organized around mappings, feedback behavior, performer control, and limitations.
- A complete paper draft with citations and figures.
- A demo video suitable for reviewers.
