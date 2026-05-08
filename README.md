# SLITSCAN.AV

**An audio-visual instrument exploring the slit-scan effect across two domains, with cross-modulated analysis bridging them.**

A no-build web app. Open `slitscan-av.html` in a browser. No dependencies to install, no bundler, no server required.

---

## What it is

SLITSCAN.AV applies the slit-scan effect to both image and sound *simultaneously*, with each domain's analysis modulating the other's parameters. Drop in a video clip and the picture smears into time-displaced trails while its soundtrack stretches into a drone — and the way each one warps is shaped by what's happening in the other.

It started as a port of a TouchDesigner GLSL slit-scan shader into the browser. It grew into a thinking exercise about what signal-processing concepts actually mean across modalities, and ended up as a small instrument for cross-modal experimentation.

---

## The concept

### Visual slit-scan, briefly

The slit-scan effect designates a thin "slit" region of the image as the *present*. Pixels inside the slit show the live source. Every other pixel is constantly moving away from the slit, one texel per frame, carrying the value it had a moment ago. Distance from the slit equals time elapsed since that information was new. The image becomes its own delay line — no separate frame buffer, just a feedback loop where each pixel propagates outward and ages as it travels.

### Spectral slit-scan

The audio analog isn't a delay — delays sound like echoes. The mapping that captures the slit-scan *feeling* (sustained presence, the present refusing to fade) operates in the spectrogram. A frequency band is designated as the slit. New audio entering that band replaces its bins live; bins outside the slit propagate outward through the spectrum, carrying their old magnitudes with them. The result is a drone — every harmonic that ever entered the slit gets smeared across the spectrum and held there. New harmonics keep arriving; old ones don't disappear, they just drift to a different frequency.

### Cross-modulation

Once both engines exist, the most interesting question becomes how they interact. SLITSCAN.AV uses a parametric coupling layer: each domain runs continuous analysis on its source (visual extracts brightness, motion, hue; audio extracts amplitude, spectral centroid, onset events), and these analyzed features modulate parameters in the *other* domain's slit-scan. Loud audio makes the picture smear faster. Bright frames raise the audio gain. The dominant color hue in the image steers the audio slit through the spectrum.

The film's natural audio-visual correlation becomes the system's input; the cross-mods amplify, displace, or break that correlation depending on how the depth sliders are set.

---

## Running it

Open `slitscan-av.html` in a modern browser:

- Double-click `slitscan-av.html`, or
- Drag it into any browser window, or
- Serve it from any static host (GitHub Pages, Netlify, Vercel, etc.)

No build step. No `npm install`. Three.js is loaded from a CDN, and the local runtime lives in sibling `js/*.js` files.

The audio engine requires a user gesture before it can start (browser autoplay policy) — that's what the **Start audio** button is for.

---

## Controls

### Slit (shared base values)

These set the baseline before cross-modulation. Both domains use the same slit position, width, and scan speed values, then each modulates them with the other domain's analysis on top.

| Control | Range | Effect |
|---|---|---|
| Position | 0–1 | Visual: 0 = left/top edge, 1 = right/bottom edge. Audio: maps log to 80 Hz–12 kHz. |
| Width | 0.005–0.5 | Fractional width of the slit relative to the image / spectrum. |
| Scan speed | 0–5 | How many texels (visual) or FFT bins (audio) data shifts per frame. |

### Visual

Sources: four procedural scenes (Cars, Bouncers, Marquee, Walker) or upload a video file. `Cars` and `Bouncers` now reset from fixed seeds so fresh-start feedback screens stay comparable. Render resolution scales the WebGL output independent of source resolution. Axis flips the slit between vertical and horizontal orientation.

### Audio

Sources: built-in **Pad** synth (drone, ideal for hearing slit-scan sustain, now seeded for repeatable fresh starts), **Pulse** synth (short-note probe source, also seeded), **Movie** (routes the uploaded video's own audio track through the spectral slit-scan), or **Upload audio** (any audio file).

Master controls output gain. Dry/wet blends the original input signal with the slit-scanned output.

### Cross-modulation depths

Each row is a routing from an analyzed feature to a target parameter. The depth slider controls how strongly that routing is active (0 = disabled). The `source / feedback` selector chooses whether that route reads pre-effect source analysis or processed-output feedback analysis. The meter beneath shows the live value currently feeding that route.

**Audio drives visual:**
- `loudness → scan speed` — amplitude (RMS) of audio adds to the visual scan speed.
- `centroid → slit position` — spectral centroid shifts the visual slit horizontally.
- `onsets → clear` — percussive hits in audio briefly clear the visual feedback.
- `spread → slit width` — spectral spread widens the visual slit, admitting more fresh source when the audio spectrum broadens.

**Visual drives audio:**
- `motion → scan speed` — frame-to-frame pixel difference adds to audio scan speed.
- `brightness → gain` — average frame luminance multiplies audio gain.
- `hue → slit position` — dominant color hue (saturation-weighted circular mean) shifts the audio slit through the spectrum, with wrap-safe folding at the red seam so near-red frames stay adjacent.

### Feedback safety

Feedback-routed depths are capped at `0.30`, ramp in over approximately 5 seconds, and pass through a small attenuation stage before modulation. The **Explorer loop** button uses the current best spread pair: audio feedback spread to visual slit width at depth `0.18`, plus visual feedback hue to audio slit position at depth `0.15`. That hue path uses circular smoothing and wrap-safe folding before it hits the linear slit-position control. When the current audio source is **Pulse**, the quick-start also narrows the base slit to `0.03` and lowers dry/wet to `0.85`. With seeded built-in sources and scenes, that quick-start now reproduces cleanly on `Marquee` and `Bouncers` with both `Pad` and `Pulse`. The **Lockup loop** button preserves the original bounded pair: audio feedback centroid to visual slit position plus visual feedback brightness to audio gain, both at depth `0.20`. The **Panic** button zeroes all currently feedback-routed depths.

---

## Architecture

```
[ source ] ───┬─→ [ visual slit-scan ] ──→ display
              │      ▲
              │      │ params (modulated)
              │      │
              ├─→ [ visual analysis ] ──┐
              │                          │  cross-modulation routing
              ├─→ [ audio analysis  ] ──┘
              │                          │
              │                          ▼ params (modulated)
              └─→ [ spectral slit-scan ] ──→ output
```

### Visual pipeline

A 2D canvas (`sourceCanvas`, 960 × 540) holds whatever the current source is — either a frame of the procedural scene drawn each tick, or a `drawImage()` of the current video frame. This canvas is wrapped in a `THREE.CanvasTexture` and fed to the WebGL slit-scan shader.

The shader uses a classic ping-pong feedback architecture. Two `WebGLRenderTarget`s alternate between read and write each frame. The fragment shader's rule:

```glsl
if (coord < uSlit.x) {
  // outside slit, "before" side: pull from feedback shifted toward the slit
  color = texture2D(uFeedback, uv + step);
} else if (coord > uSlit.y) {
  // outside slit, "after" side: pull from feedback shifted the other way
  color = texture2D(uFeedback, uv - step);
} else {
  // inside the slit: fresh source pixel
  color = texture2D(uSource, vUv);
}
```

There's no buffer of stored frames — the pixels themselves are the memory. Distance from the slit equals time elapsed since that information was at the slit.

### Audio pipeline

An `AudioWorkletNode` runs the spectral slit-scan in the audio render thread (sample-accurate, off the main thread). The worklet maintains a sliding window of recent input samples, runs an in-place radix-2 FFT (size 2048, hop 512, 75% overlap, Hann window).

For each FFT frame:

1. Compute current spectrum (magnitude + phase).
2. Save current magnitudes as "live."
3. Build the output spectrum by propagating last frame's magnitudes outward from the slit (bins inside the slit get the live magnitude; bins outside pull from the feedback magnitude shifted toward the slit).
4. Reconstruct complex spectrum: new magnitudes × current frame's phases.
5. Inverse FFT, apply synthesis Hann window, overlap-add into output ring buffer with COLA correction (1/1.5 for Hann² at 75% overlap).

The phase strategy — using the input frame's phase with the propagated magnitudes — gives a coherent, drone-like sustain rather than a noisy smear. A pure phase vocoder with phase locking across frames would be cleaner but more complex; the trade is a little smearing for much simpler code, and that smearing actually enhances the drone aesthetic.

### Analysis layer

**Visual analysis** runs on a tiny 64 × 36 offscreen canvas — fast enough to compute every frame:

- *Brightness* — luminance-weighted average using Rec. 709 coefficients (0.2126 R + 0.7152 G + 0.0722 B).
- *Motion* — per-pixel absolute difference from previous frame, summed and normalized. Poor man's optical flow — fast and reactive enough for modulation duty.
- *Hue* — per-pixel hue computation, then saturation-weighted circular mean. The weighting prevents gray pixels from pulling the result toward red (hue 0°).

**Audio analysis** uses an `AnalyserNode` placed before the worklet for source analysis, and a second `AnalyserNode` after the worklet for processed-output feedback analysis:

- *Amplitude* — RMS of the magnitude spectrum.
- *Centroid* — weighted-mean bin index, normalized 0–1.
- *Onset* — positive-going spectral flux with fast attack and slow release, threshold-based. Crude, but the right shape for triggering events.

Visual analysis now keeps separate source and feedback taps: source analysis reads the unprocessed source canvas, while feedback analysis downsamples the displayed slit-scan output. The analysis taps panel shows source and feedback values side by side. Each route can choose source or feedback independently.

All analysis values are smoothed with single-pole low-pass filters. Time constants vary by feature — fast for transients (motion, amplitude, onset), slower for things that should feel stable (hue, brightness, centroid). Without smoothing the cross-modulation feels twitchy; with it, musical.

### Cross-modulation routing

Modulations apply additively or multiplicatively over the base parameter values, scaled by their depth slider:

- *Position modulations* (centroid → visual pos, hue → audio pos) — centered around 0.5, applied as `±0.3 × depth` offset from the base position.
- *Speed modulations* (loudness → visual speed, motion → audio speed) — scaled `0–3 × depth` and added to base scan speed.
- *Gain modulation* (brightness → audio gain) — multiplicative; at depth 0 gain is unchanged, at depth 1 gain becomes `base × brightness`.
- *Clear modulation* (onset → visual clear) — the visual fragment shader has a `uClear` uniform that fades the feedback contribution toward black; onsets push this up briefly with fast decay.

Per-modulation depth sliders mean you can isolate any single coupling to study it, or stack them all.

Feedback routing uses safety transforms before modulation: route depth is capped, route engagement ramps from 0 to the requested depth, feedback taps use slower smoothing, and feedback-routed analysis values are attenuated. These controls are intentionally part of the instrument core rather than polish.

---

## File structure

This is a simple static app: one HTML entry point plus a small `js/` source folder. There is still no build step — Three.js loads from a CDN, and the audio worklet still ships as a string and is instantiated via `URL.createObjectURL(new Blob([workletCode]))`.

```
slitscan-av.html
├── <style>          theme variables, layout, typography
├── markup           sidebar controls + main stage
└── <script type="module"> bootstrap loader for Three.js + ordered runtime scripts
js/
├── worklet-code.js  FFT slit-scan AudioWorklet source string
├── core.js          DOM handles, route model, helpers, safety state
├── visual.js        scenes, Three.js setup, visual analysis
├── audio.js         AudioContext, sources, worklet wiring, audio analysis
├── modulation.js    cross-domain parameter mapping, meters, spectrogram
├── loop.js          requestAnimationFrame render/update loop
├── presets.js       video upload, status, presets, resolution/axis helpers
└── app.js           boot, labels, UI bindings, quick-start actions
```

---

## Browser requirements

- WebGL 1.0 (any browser from the last decade).
- AudioWorklet support: Chrome 66+, Firefox 76+, Safari 14.1+. Edge inherits Chromium.
- For video upload: H.264/MP4 or WebM are most reliable. iPhone HEVC `.mov` files often fail in browser decoders — switch the iPhone's camera capture format to "Most Compatible" (Settings → Camera → Formats) for future recordings, or transcode existing clips to H.264.

The artifact iframe sandbox in some embedded contexts blocks `getUserMedia()` — which is why this version uses procedural scenes + file upload rather than live webcam. To use a live webcam, run the file outside a sandbox (open it locally or host it).

---

## Presets

The sidebar now includes a small preset panel:

- `Copy link` writes the current state into the URL hash and attempts to copy the shareable link.
- `Save slot` / `Load slot` store and restore named presets through `localStorage`.
- `Load hash` reapplies the current URL hash without relying on browser history state.
- Curated reference hashes now live in `presets/library.md`.

Preset capture currently includes:

- Built-in visual source selection.
- Built-in audio source selection.
- Base slit, gain, mix, axis, and resolution controls.
- Per-route tap selection and route depth.

Uploaded movie and audio files are not serialized, so shared hashes remain structural rather than asset-complete.

---

## Known limitations

- Phone CPUs may chug at 1280×720 with audio enabled. Drop visual resolution to 640×480 if FPS drops.
- iPhone HEVC video files often fail to decode in browser. Re-encode or change capture format.
- Built-in synth sources and the stochastic `Cars` and `Bouncers` scenes now reset from fixed seeds, which makes fresh-start regression screens much more meaningful, but uploaded media still varies with the asset itself.
- Onset detection is intentionally crude (single-band spectral flux). It triggers reliably on percussive material but may miss soft attacks. A proper onset detector would whiten the spectrum and adapt the threshold over time.
- Uploaded movie and audio files are not serialized into presets, so media-backed sessions still require manual re-selection after hash or slot reload.
- The original brightness-to-gain feedback pair still trends toward lockup across the tested built-in Cars, Bouncers, and Marquee scenes with both Pad and Pulse. It is now treated as a bounded feedback demo rather than the exploratory default.
- The current spread+hue Explorer loop is still not universal. After making the built-in synth sources and stochastic built-in scenes deterministic, it now reproduces cleanly under fresh starts on `Marquee + Pad`, `Marquee + Pulse`, `Bouncers + Pad`, and `Bouncers + Pulse`. `Walker` remains outside the regression set, and `Cars` remains outside the supported Explorer family: a seeded rerun still flips between hue lockup and spread runaway.
- Earlier motion, brightness, amplitude, and weak-hybrid Explorer alternatives were screened before the visual-determinism fix and none is currently promoted over the spread+hue quick-start. If the present built-in coverage regresses later, those alternatives should be re-screened from the seeded baseline rather than assumed settled.
- Adding the new `spread -> slit width` route materially improved the Explorer family, but `Cars` still does not yield a reproducible Explorer preset inside the current spread+hue route family. Revisit it only after adding a new feedback-capable route or different control surface.

---

## Planned: reciprocal feedback layer

The cross-modulation built into the current version is *reactive* — each modulation is a function of the source signal. The next architectural step is to make the system *self-referential*: each domain analyzes its own processed output and modulates the other accordingly. The system gains internal state that evolves on its own, and starts behaving less like an effect chain and more like an instrument with its own inner life.

This section captures the design thinking before the implementation — the architectural delta, the failure modes, the damping strategy, and the minimal starting configuration.

### The shift

Currently:

- Visual analysis taps `sourceCanvas` (the unprocessed source).
- Audio analysis taps an `AnalyserNode` placed *before* the worklet.

In feedback mode:

- Visual analysis taps the slit-scan's *output* — either via `gl.readPixels` on the displayed framebuffer, or by rendering the current ping-pong target into a small offscreen 2D canvas (cheaper).
- Audio analysis taps an `AnalyserNode` placed *after* the worklet.

The cross-routing matrix stays the same — the same six modulations — but the values flowing through it are now post-effect, not pre-effect. The slit-scan's output becomes its own input, via the other domain.

A `source / feedback` toggle should be available *per routing*, not as a global switch. Some routings might stay on source while others go to feedback, which gives the most expressive control surface and lets you mix open-loop reactivity with closed-loop autonomy.

### Why damping is load-bearing

Closed loops with effective gain greater than one diverge. Closed loops with effective gain less than one converge to silence. The interesting behavior lives in the narrow band between, where the loop sustains without locking up or running away — and damping mechanisms are what hold the system in that band.

Three damping mechanisms to implement together:

- **Slow follows.** The smoothing low-pass filters on analyzed values should be markedly slower in feedback mode than in source mode. If the loop responds in milliseconds, it locks instantly. If it responds over seconds, the system has time to evolve before the loop closes.
- **Depth limits.** Modulation depths must be capped lower in feedback mode. A depth of 0.5 that feels gentle on source signals can be wildly unstable on feedback signals because the loop multiplies through itself each cycle. A reasonable starting cap is 0.3.
- **Attenuation.** Each feedback path is slightly reduced before modulation. This is a practical damping control, not a true time-based decay.

### Failure modes

**Lockup.** The system finds a stable attractor and sits in it. All meters flatten to constant values. The output becomes static — the visual stops evolving, the audio holds a fixed drone. Recognized by: meters reading the same value for more than ~1 second with no modulation activity. Cause: damping too high, depths too low, or the system has found a self-consistent state from which it can't escape on its own.

**Runaway.** Positive feedback amplifies through the loop. Analyzed values clip to extremes. The visual goes to pure white or pure black; the audio clips or drops to silence. Recognized by: meters pegged at 0 or 1 for sustained periods, harsh output. Cause: damping too low, depths too high, attenuation too weak.

**Sweet spot.** Perpetual evolution without convergence — meters in motion, output continuously shifting but never extreme. This is the goal. The system surprises you without becoming useless.

A small stability indicator in the UI watches the active feedback routes over a rolling 2-second window. It reports stable, lockup, or runaway when meters flatten or peg.

### Minimal first loop

Don't enable all six modulations in feedback mode at once. The first build should engage one weakly-coupled bidirectional pair:

- Audio output centroid → visual slit position (depth ≈ 0.2)
- Visual output brightness → audio gain (depth ≈ 0.2)

This is the smallest closed loop: each domain affects the other through exactly one channel. Easy to debug, easy to feel what the loop is doing, easy to identify failure modes when they appear. Once this is stable across a range of source materials, additional routings can be moved to feedback one at a time, watching for instability after each addition.

### UI affordances worth building

- A `source / feedback` toggle per routing (six toggles total) rather than a single global switch.
- A slow-ramp engage control — when feedback is enabled on any routing, that routing's depth scales up over ~5 seconds, giving the operator time to pull back if the system heads in a bad direction.
- A global stability indicator that flags lockup or runaway in real time.
- A panic button that instantly zeroes all feedback depths.
- Optionally: a "freeze" toggle that holds the current feedback state, letting you walk away from a good moment without it drifting.

### Lineage

This direction places the project in the cybernetic music tradition — instruments where the performer is one of several driving signals, with the system's internal state contributing equally. Worth knowing for creative grounding:

- **David Tudor's *Rainforest* series** (1968 onward) — physical sculptures excited by recordings, microphones picking up the resonances, the picked-up signal re-driving the sculptures. Acoustic-electronic feedback as composition.
- **Gordon Mumma's *Hornpipe*** (1967) — French horn played into electronics that respond to and modify the player's input, with the modified output influencing what the player does next.
- **Pauline Oliveros's Expanded Instruments System** — delay-and-feedback architectures that augment performer input over long timescales.
- **Steina and Woody Vasulka's video work**, and the **Sandin Image Processor** / **Rutt-Etra Scan Processor** — analog video synthesizers with explicit feedback paths between processing modules. Visual cousins to what we're describing.

The shared property across all of these: the instrument is not fully under the performer's control. You collaborate with it. The reciprocal feedback layer is what would move SLITSCAN.AV from the "tool" category into that "collaborator" category.

---

## Future directions

Roads we discussed but haven't taken (the reciprocal feedback layer is the major next step — see its own section above).

**Format blending.** A purist version where audio and visual share a single 2D buffer (a spectrogram-on-canvas), and the slit-scan operates on that shared buffer. The visual is the spectrogram; the audio is the spectrogram played back. One slit, one substrate, two display methods. Conceptually cleanest, but visually constrained — the picture always looks like a spectrogram.

**Multiple slits.** The shader currently supports one slit. A multi-slit version (different positions, different scan speeds per slit) would produce more complex temporal layering.

**Diagonal / radial slit axis.** The current axis options are horizontal or vertical. Diagonal would smear along an angled vector; radial (slit as a ring) would cause images to expand or contract from a center point.

**Channel-split slit.** Apply the slit-scan separately to R, G, B (or stereo L, R) with different positions per channel. Produces chromatic-aberration-style temporal displacement.

**Optical flow.** Replace the frame-difference motion estimator with a real Lucas-Kanade or Farnebäck optical flow. Gives directional motion vectors, which open up motion-direction-driven modulations (horizontal motion biases one parameter, vertical motion biases another).

**Live webcam mode.** The original goal of the project. Trivially supported by the architecture — replace `CanvasTexture(sourceCanvas)` with `VideoTexture(getUserMediaStream)`. Requires running outside a sandboxed iframe.

---

## Credits and inspiration

- The original GLSL slit-scan shader is a port of a TouchDesigner tutorial by **The Interactive & Immersive HQ**.
- The cross-modal thinking owes a debt to the lineage of format-blending instruments: the **ANS synthesizer** (Murzin, USSR, 1958), Iannis Xenakis's **UPIC** system (1977), **MetaSynth** (Eric Wenger, 1998), **Photosounder**, and the spectrogram-hidden-imagery of **Aphex Twin's** *Windowlicker* EP.
- Three.js for WebGL plumbing.
- The audio architecture follows standard phase vocoder conventions: Hann window, 4× overlap, OLA reconstruction with COLA correction.

---

## License

Use it, modify it, share it, perform with it. No warranty.
