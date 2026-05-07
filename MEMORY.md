# SLITSCAN.AV Memory

Durable project facts for compacted sessions.

- Local project path: `/Users/marcscully/Projects/bidirect-av`.
- GitHub repository: `mtsku11/bidirect-av` at `https://github.com/mtsku11/bidirect-av.git`.
- Research target: NIME 2027 paper/demo submission, not NIME 2026.
- Current artifact constraint: keep the instrument as a single-file browser app until modularization becomes necessary.
- Current implementation file: `slitscan-av.html`.
- Build direction: reciprocal audiovisual feedback with explicit per-route source/feedback analysis taps, safety caps, ramping, attenuation, panic recovery, and stability logging.
- Current reproducibility support: preset round-tripping exists through URL hash and `localStorage` slot names for built-in sources, controls, taps, and route depths; uploaded media still needs manual re-selection.
- Current finding: the present minimal pair (`audCentroidToVisPos` feedback plus `visBrightToAudGain` feedback) is bounded but consistently locks across tested Cars, Bouncers, and Marquee scenes with Pad and Pulse. No runaway observed yet.
- Current preset library: `presets/library.md`.
