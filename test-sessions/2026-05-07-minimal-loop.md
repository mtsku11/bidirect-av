# Minimal Loop Test Session - 2026-05-07

## Purpose

First minimal reciprocal-feedback run after adding the global lockup/runaway stability indicator.

## Build Under Test

- Branch: `feature/feedback-routing-controls`
- App: `slitscan-av.html`
- Test URL: `http://127.0.0.1:8080/slitscan-av.html`
- Browser automation: Playwright MCP against local static server

## Starting Configuration

- Visual source: Cars
- Audio source: Pad
- Audio status: `audio: on - 44100Hz - 2048-FFT`
- Minimal loop engaged:
  - `audCentroidToVisPos`: feedback tap, depth `0.20`
  - `visBrightToAudGain`: feedback tap, depth `0.20`
  - All other route depths: `0`
- Feedback safety:
  - Depth cap: `0.30`
  - Engagement ramp: `5s`
  - Feedback attenuation: `0.98`
  - Feedback tap smoothing: slower than source tap smoothing

## Observed Values

After approximately 9 seconds:

- Active feedback routes: `2`
- Ramp status: both active feedback routes reached `100%`
- Stability indicator: `lockup - flat 0.16 on brightness to gain`
- Visual feedback brightness: `0.16`
- Audio feedback centroid: `0.41`
- Audio feedback amplitude: `0.50`
- FPS: approximately `100 FPS`
- Console warnings/errors during fresh run: none

After Panic:

- Active feedback routes: `0`
- All route depths: `0`
- Feedback ramps on selected feedback taps: `0%`
- Stability indicator: `stable - source-driven`

## Interpretation

The first minimal loop is bounded and recoverable: no runaway was observed, no browser/runtime error occurred, and Panic returned the system to a source-driven stable state.

The default Cars + Pad pairing tends toward lockup rather than sustained evolution. The watchdog flagged the visual feedback brightness route as flat, which is plausible because the default scene/output brightness is relatively stable and the brightness-to-gain feedback path is weak.

## Follow-Ups

- Try the same minimal loop with Bouncers, Marquee, and Pulse before changing the heuristic.
- Add preset/hash capture before longer comparative sessions.
- Consider whether the minimal loop should use visual motion rather than brightness for a more active first reciprocal pair.
- Keep the current lockup threshold until several source combinations have been logged.
