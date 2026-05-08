# Cars Fresh-Start Repro Screen

Date: 2026-05-08

## Goal

Close the open `Cars` question under the current supported Explorer family:

- `audSpreadToVisWidth`: feedback tap, depth `0.18`
- `visHueToAudSlit`: feedback tap, depth `0.15`

The prior geometry note found a promising vertical, wider-slit `Cars` state, but it did not reproduce cleanly enough to promote. This session reran `Cars` from strict fresh starts and only kept conclusions that survived reloads.

## Protocol

All `Cars` runs used Chromium via Playwright with a strict fresh-start routine:

1. Reload `slitscan-av.html`.
2. Click `Start audio`.
3. Select the scene and built-in audio source.
4. Set the candidate geometry and feedback routing.
5. Click `Clear smear`.
6. Wait approximately 9 seconds.
7. Read `stabilityStatus` and the audio/visual feedback taps.

I also ran one known-good control case to verify the harness:

- `Marquee + Pulse`
- horizontal axis
- base slit width `0.04`
- spread feedback `0.18`
- hue feedback `0.15`

That control remained `stable - window 2.0s - range 0.11`, with feedback spread at `1.00`, confirming that the browser setup and audio chain were behaving normally.

## Part 1 — Fresh-start repeats on the earlier `Cars` candidates

Repeated candidates:

- horizontal width `0.04`
- vertical width `0.08`

Both used the supported spread+hue Explorer pair unchanged.

| Candidate | Cars + Pad | Cars + Pulse |
| --- | --- | --- |
| `h-004-s18-h15` | `runaway - pegged 0.00 on spread to slitWidth` in 2/2 repeats | `runaway - pegged 0.00 on spread to slitWidth` in 2/2 repeats |
| `v-008-s18-h15` | `runaway - pegged 0.00 on spread to slitWidth` in 2/2 repeats | `runaway - pegged 0.00 on spread to slitWidth` in 2/2 repeats |

### Reading

- Under strict reloads, both the horizontal baseline and the earlier vertical-wide candidate collapsed the feedback spread leg all the way low.
- This is a different failure mode from the earlier optimistic screen, but it repeated cleanly across both built-in audio sources.
- The issue was not the harness; it was the route family inside `Cars`.

## Part 2 — Wider-width spot checks

To test whether the real lever was simply “let more spectrum through,” I widened the vertical base slit to `0.12` while keeping the same spread+hue pair.

| Candidate | Cars + Pad | Cars + Pulse |
| --- | --- | --- |
| `v-012-s18-h15` | `runaway - pegged 0.98 on spread to slitWidth` | `runaway - pegged 0.98 on spread to slitWidth` |

Observed taps after the 9-second window:

- `Cars + Pad`: source spread `0.32`, feedback spread `1.00`
- `Cars + Pulse`: source spread `0.14`, feedback spread `1.00`

### Reading

- Widening the base slit did not rescue `Cars`.
- It flipped the failure mode from “spread collapses to zero” to “spread saturates high.”
- Inside the current spread+hue route family, width-only geometry tuning moves `Cars` between opposite runaways rather than into a reproducible mobile regime.

## Conclusion

This closes the current `Cars` geometry question for now.

- Do not promote a `Cars`-specific Explorer preset from the current spread+hue family.
- Treat `Cars` as outside the supported Explorer quick-start for the time being.
- Keep the supported Explorer family focused on `Marquee` and `Bouncers`.
- If `Cars` is revisited, do it after adding a new feedback-capable route or a different control surface, not by continuing width-only tuning inside the same pair.
