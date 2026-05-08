# Visual Determinism and Explorer Revalidation

Date: 2026-05-08

## Goal

Continue the Explorer retune from a cleaner reproducibility baseline.

While preparing the next Pad-focused screen, a deeper problem emerged: the built-in `Cars` and `Bouncers` scenes still randomized their initial visual state on every fresh start. That meant some of the earlier Explorer reruns were still partly measuring scene variation.

## Code changes

One structural change landed before the next screen:

1. `Cars` and `Bouncers` now reset from fixed seeds in `js/visual.js`.

No route definitions or quick-start mappings changed in this slice.

## Preliminary seeded comparison

Before revalidating the quick-start button path, a small seeded comparison checked whether the older negative Pad results were mostly an artifact of scene randomness.

Representative seeded runs:

- Current `Explorer loop` pair:
  - `audSpreadToVisWidth`: feedback depth `0.18`
  - `visHueToAudSlit`: feedback depth `0.15`
- Older `amp+hue` alternative:
  - `audAmpToVisSpeed`: feedback depth `0.12` or `0.16`
  - `visHueToAudSlit`: feedback depth `0.12` or `0.16`

Observed seeded outcomes:

- `spread+hue / Marquee + Pad`: `stable - window 2.0s - range 0.11`
- `spread+hue / Bouncers + Pad`: `stable - window 2.0s - range 0.13`
- `spread+hue / Bouncers + Pulse`: `stable - window 2.0s - range 0.13`
- `amp+hue 0.12 / Marquee + Pad`: `stable - window 2.0s - range 0.11`
- `amp+hue 0.12 / Bouncers + Pad`: `stable - window 2.0s - range 0.12`
- `amp+hue 0.16 / Marquee + Pad`: `stable - window 2.0s - range 0.11`
- `amp+hue 0.16 / Bouncers + Pad`: `stable - window 2.0s - range 0.12`

Reading:

- Earlier negative `Bouncers` and Pad conclusions were contaminated by random built-in scene starts.
- After seeding the scenes, the current spread+hue pair no longer needs to be replaced just to clear the built-in reproducibility threshold.
- The amplitude+hue alternative no longer looks clearly worse under seeded conditions, but it was not promoted because the current Explorer button path already met the immediate build goal.

## Explorer button-path revalidation

Using the actual `Explorer loop` button path:

- `Marquee + Pad`, pass 1: `stable - window 2.0s - range 0.11`
- `Marquee + Pad`, pass 2: `stable - window 2.0s - range 0.11`
- `Marquee + Pulse`, pass 1: `stable - window 2.0s - range 0.11`
- `Marquee + Pulse`, pass 2: `stable - window 2.0s - range 0.11`
- `Bouncers + Pad`, pass 1: `stable - window 2.0s - range 0.13`
- `Bouncers + Pad`, pass 2: `stable - window 2.0s - range 0.13`
- `Bouncers + Pulse`, pass 1: `stable - window 2.0s - range 0.13`
- `Bouncers + Pulse`, pass 2: `stable - window 2.0s - range 0.13`

Pulse continued to use the narrower, less-wet quick-start controls:

- `slitWidth = 0.03`
- `audioMix = 0.85`

Pad retained the default Explorer controls:

- `slitWidth = 0.04`
- `audioMix = 1.0`

## Cars recheck

Because `Cars` also moved to a fixed seed in this slice, it was rechecked under the same Explorer button path:

- `Cars + Pad`, pass 1: `lockup - flat 0.81 on hue to slitPosition`
- `Cars + Pad`, pass 2: `runaway - pegged 0.98 on spread to slitWidth`
- `Cars + Pulse`, pass 1: `runaway - pegged 0.97 on spread to slitWidth`
- `Cars + Pulse`, pass 2: `runaway - pegged 0.98 on spread to slitWidth`

`Cars` therefore remains outside the supported Explorer family.

## Conclusion

This slice closes the current Explorer retune for the built-in regression suite.

Durable conclusions:

- Built-in visual determinism was necessary and is now in place for `Cars` and `Bouncers`.
- The current `Explorer loop` no longer needs replacement for the core built-in set.
- Supported fresh-start Explorer cases are now:
  - `Marquee + Pad`
  - `Marquee + Pulse`
  - `Bouncers + Pad`
  - `Bouncers + Pulse`
- `Cars` remains unstable under the current spread+hue family.
- `Walker` remains outside the core regression set from the earlier screen.
- The next worthwhile step is to move on to the external challenge suite rather than continue parametric retuning inside the built-in set.
