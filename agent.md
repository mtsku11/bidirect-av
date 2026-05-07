# Agent Operating Instructions for SLITSCAN.AV

## 1. Authorization

The project owner, Marc Scully, grants the coding/research agent permission to work on the SLITSCAN.AV project using the available GitHub and Playwright MCP servers.

This permission includes using those MCP servers to inspect, modify, test, and document the project when the agent is operating within the scope described in this file.

The GitHub repository for this project is `mtsku11/bidirect-av` at `https://github.com/mtsku11/bidirect-av.git`. If the repository owner or remote URL changes, inspect the authenticated GitHub account or ask before making remote changes.

## 2. Project context

SLITSCAN.AV is a browser-based audiovisual instrument investigating bidirectional cross-modulation, visual slit-scan, spectral slit-scan, cross-modal analysis routing, and reciprocal feedback. The ultimate goal is to build the instrument, test it, gather findings, and prepare a paper or demo submission for NIME 2027.

The agent should treat the project as both:

1. A technical software/instrument build.
2. An academic/practice-led research artefact.

Decisions should therefore support stability, usability, reproducibility, documentation, and later paper writing.

### 2.1 Durable context for compacted sessions

At the start of every new or compacted session, rebuild project context from repository files rather than conversation history. Treat conversation history as disposable unless its decisions have been written into the project files.

Read these files in this order:

1. `agent.md` for operating instructions, permissions, boundaries, and context-loading order.
2. `MEMORY.md` for durable project facts that must survive conversation compaction.
3. `README.md` for the current user-facing description, controls, architecture, and known limitations.
4. `plan.md` for the research direction, development phases, acceptance criteria, and testing protocol.
5. `TODO.md` for current build status, immediate implementation tasks, and known follow-ups.
6. `suggested-reading.md` for academic framing and literature-reading priorities.
7. `slitscan-av.html` for implementation reality before changing code.

If a conversation decision must survive compaction, record it in the appropriate Markdown file before relying on it. If the Markdown files and implementation disagree, inspect the implementation, preserve user work, and update the relevant documentation as part of the change.

## 3. GitHub MCP permission

The agent has full permission to use the GitHub MCP server and all available GitHub MCP tools for project-scoped repository work on `mtsku11/bidirect-av`.

This includes permission to use GitHub MCP tools for:

- Inspect repository files, branches, commits, issues, and pull requests.
- Create branches for coherent units of work.
- Edit project files.
- Create, update, push, and delete project files when appropriate.
- Add new documentation files.
- Commit changes with clear commit messages.
- Open pull requests when appropriate.
- Create and update GitHub issues.
- Add issue labels and milestones if supported.
- Read, create, update, review, comment on, and merge pull requests when appropriate.
- Read and write issue comments, PR comments, review comments, and review-thread resolutions.
- Search repository code, issues, pull requests, repositories, users, releases, tags, branches, and commits when useful.
- Read and manage releases, tags, branches, repository metadata, check runs, and commit status when useful.
- Use available Copilot-related GitHub MCP tools for issue assignment or PR review when appropriate.
- Inspect the authenticated GitHub account, accessible organizations, and teams when needed to resolve repository ownership or permissions.
- Review diffs before committing.
- Read repository history to understand previous decisions.
- Keep the repository organized for research and publication.

The human approval boundaries in section 12 still apply. In particular, ask before deleting substantial project files, changing repository visibility, changing the license, publishing a release, submitting externally, force-pushing, or rewriting shared Git history.

### 3.1 GitHub working conventions

Prefer small, legible changes over large opaque edits.

Use branch names such as:

- `feature/feedback-analysis-taps`
- `feature/routing-matrix-refactor`
- `feature/stability-indicator`
- `docs/nime-paper-notes`
- `test/playwright-smoke-tests`

Use commit messages such as:

- `Refactor cross-modulation routing state`
- `Add feedback analysis taps`
- `Add reciprocal feedback safety controls`
- `Document feedback testing protocol`
- `Add Playwright smoke test for app startup`

Before making large changes, inspect the current repository state and avoid overwriting uncommitted user work.

If the local project folder is not currently a Git repository, do not assume branch, commit, or pull-request workflows are available. Work against the local files, state that baseline versioning is unavailable, and recommend initializing or connecting a Git repository before major implementation work.

## 4. Playwright MCP permission

The agent has full permission to use the Playwright MCP server and its available browser tools for browser-based testing, debugging, inspection, and documentation of the instrument within the project scope.

This includes permission to:

- Open the local or hosted SLITSCAN.AV page.
- Interact with UI controls.
- Upload test media if test files are provided or generated.
- Click buttons such as Start Audio, source selectors, routing toggles, preset controls, panic, freeze, and feedback controls.
- Use keyboard, mouse, drag/drop, file upload, tab, resize, wait, screenshot, accessibility snapshot, console, network, and page-evaluation tools as needed.
- Verify that UI controls update expected values.
- Check that the app loads without console errors.
- Capture screenshots for debugging and documentation.
- Run smoke tests across supported browser contexts where available.
- Inspect console logs and runtime errors.
- Test for regressions after code changes.

### 4.1 Playwright testing priorities

Prioritize tests that verify:

- The app loads.
- The visual canvas renders.
- The Start Audio flow does not crash.
- Built-in audio sources can be selected.
- Procedural visual scenes can be selected.
- Slit parameters update without runtime errors.
- Cross-modulation depth sliders update correctly.
- Source/feedback toggles work once implemented.
- Panic button zeroes feedback depths once implemented.
- Preset save/recall works once implemented.
- No severe console errors appear during normal operation.

Browser audio can be difficult to test fully in automated environments. The agent should not treat absence of audible sound in automated Playwright as proof of failure unless there are clear runtime errors or broken audio graph setup.

## 5. Scope of permitted changes

The agent may modify:

- `slitscan-av.html`
- `README.md`
- `plan.md`
- `agent.md`
- test files
- preset files
- paper notes
- documentation
- GitHub issue descriptions
- supporting scripts if the project later adds them

The agent may add:

- `tests/` directory
- `presets/` directory
- `docs/` directory
- `paper/` directory
- `.github/` issue templates or workflows
- lightweight test fixtures

The agent should preserve the single-file no-build-step nature of the main instrument unless the project owner explicitly decides to move to a build system.

## 6. Technical priorities

When working on the code, the agent should prioritize:

1. Real-time reliability.
2. Clear signal flow.
3. Explicit routing state.
4. Stable feedback behavior.
5. Performer safety controls.
6. Reproducible presets.
7. Readable code.
8. Documentation that supports a NIME paper.

Avoid clever abstractions that make the instrument harder to understand or write about.

## 7. Academic priorities

When documenting or making design decisions, the agent should preserve the academic framing:

- Feedback musicianship.
- Audiovisual performance instruments.
- Practice-led digital musical instrument design.
- Cross-modal analysis-driven coupling.
- Explicit mappings rather than opaque latent spaces.
- Reciprocal feedback and ecosystemic agency.
- Performer control, instability, lockup, runaway, and sweet spots.

The agent should avoid unsupported novelty claims. Prefer language such as:

- “under-mapped intersection”
- “proposed operational analogue”
- “practice-led investigation”
- “design case study”
- “instrument-building research”

Avoid language such as:

- “first ever”
- “no one has done this”
- “proves”
- “solves audiovisual feedback”

## 8. Safety and stability rules for feedback features

Any implementation of reciprocal feedback should include damping and recovery affordances from the start.

Required or strongly preferred:

- Feedback depth caps.
- Slow-ramp feedback engagement.
- Attenuation in feedback paths.
- Slower smoothing in feedback mode.
- Panic button.
- Lockup/runaway indicator.
- Per-routing source/feedback toggles.

The agent should not enable high-gain feedback defaults that risk sudden loud output, clipping, or browser instability.

Default feedback depths should be conservative. Initial suggested maximum is approximately 0.3.

## 9. Testing and documentation expectations

After code changes, the agent should, where possible:

- Run or perform a browser smoke test.
- Check the console for errors.
- Verify that existing controls still work.
- Update README or notes if behavior changes.
- Add findings or TODOs to GitHub issues.
- Record any known limitations.

For research-relevant behavior, the agent should document:

- What was changed.
- Why it was changed.
- How to test it.
- What behavior it enables.
- What limitations remain.

## 10. Media and file handling

The agent may use test media files only for testing and documentation. Do not commit large media files unless explicitly approved.

Prefer small generated fixtures, short clips, or documented instructions for user-supplied media.

Do not commit private, copyrighted, or personally sensitive media unless the project owner explicitly provides and authorizes it.

## 11. Paper preparation permission

The agent may help prepare NIME-related materials, including:

- Paper outline.
- Abstract drafts.
- Related work notes.
- Figure captions.
- Technical diagrams.
- Test-session summaries.
- Findings synthesis.
- Demo script.
- Reviewer-facing README.

The agent should keep paper claims tied to observed behavior, documented implementation details, and cited academic work.

## 12. Human approval boundaries

The agent may make routine commits and test changes within the project scope. However, the agent should request explicit confirmation before:

- Deleting substantial project files.
- Rewriting the project into a different framework.
- Adding a build system.
- Publishing a release.
- Submitting to NIME or any external venue.
- Making the repository public if it is private.
- Uploading large media files.
- Changing the license.
- Force-pushing or rewriting shared Git history.

## 13. Preferred development sequence

The agent should follow this broad sequence unless instructed otherwise:

1. Preserve the current baseline.
2. Refactor routing state.
3. Add source/feedback analysis taps.
4. Implement minimal reciprocal feedback pair.
5. Add damping, ramping, attenuation, depth caps, and panic controls.
6. Add stability indicators.
7. Add presets and logging.
8. Add Playwright smoke tests.
9. Document findings.
10. Support NIME paper writing.

## 14. Standing instruction

When in doubt, the agent should favor changes that make the instrument more understandable, testable, performable, and writeable as research.
