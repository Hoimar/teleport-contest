---
name: teleport-implementation-loop
description: Use when working in the teleport-contest repo to run a continuing implementation loop that advances generalized NetHack feature parity across subsystems, using sessions only as evidence and treating screen totals as a lagging indicator.
---

# Teleport Implementation Loop

Use this skill in the `teleport-contest` repo when the goal is to make forward engineering progress, not just classify a failure. This is a loop, not a single-patch checklist: continue from blocker to blocker until a stopping condition is reached.

Default loop budget:

- Complete as many meaningful implementation iterations per invocation as possible.
- A meaningful implementation iteration is one of:
  - a subsystem fix or extension;
  - a hack-debt / tech-debt reduction;
  - a diagnostic, harness, or documentation improvement that directly unlocks a subsystem-level implementation step.
- Do not hand off after one successful iteration. Continue within the same subsystem, or move to the next queued subsystem or highest-ROI target.

Stopping conditions:

- The user asked for a single pass.
- Tooling or missing information blocks further progress.
- No safe structural next step is clear anywhere in the follow-up queue or `feature_map.md`. In that case, refer to the `$teleport-dehack-simplify` and `$teleport-triage-divergence` skills to re-center on a new goal.
- Context/runtime budget is close to exhausted.
- Further work would require a risky broad rewrite.

A blocker in the current subsystem is not a stopping condition by itself. If the current subsystem becomes risky, classify and document the blocker, then switch to the next queued subsystem or highest-ROI target. Only stop when no safe structural next step exists globally.

Do not stop after the first small valid fix. Small fixes are acceptable when they unlock or clarify the next structural step; after such a fix, continue the loop.

Workflow:

1. Read `AGENTS.md`, `lessons.md`, and `feature_map.md`.
2. Run the broad baseline when starting a new loop:
   ```bash
   node frozen/ps_test_runner.mjs
   ```
   Treat corpus screen totals as lagging evidence only.
3. Run the sentinel suite:
   ```bash
   node scripts/run-sentinel-suite.mjs
   ```
4. Pick a subsystem or blocker and maintain a follow-up queue:
   - Prefer a user-named subsystem.
   - If the user names only a session, use it as evidence for choosing the subsystem.
   - Otherwise, use the highest-ROI subsystem in `feature_map.md`.
   - After each completed change, either continue within the same subsystem or move to the next highest-value subsystem from the queue or `feature_map.md`.
5. Pick evidence sessions:
   - one target session that exposes the subsystem
   - one sentinel session likely to regress
6. Triage the evidence session:
   ```bash
   node scripts/triage-session.mjs sessions/<session>.session.json
   ```
7. State the hypothesis in subsystem terms before editing.
8. Implement or extend the subsystem in `js/`, never `frozen/`.
   - If the apparent fix is session-specific, stop and choose a more structural change.
9. After each meaningful change:
   - rerun `node scripts/triage-session.mjs sessions/<session>.session.json`
   - rerun `node scripts/run-sentinel-suite.mjs`
   - if possible, check one more session that exercises the same subsystem
10. Run the full suite:
    ```bash
    node frozen/ps_test_runner.mjs
    ```
    Use this cadence:
    - at the start of a new loop
    - before final handoff only after the loop budget is met or a global stopping condition is reached, if practical
    - after broad shared changes
    - after every 3-5 meaningful iterations
    Treat regressions as evidence to classify, not automatic grounds for reverting.
11. Update `feature_map.md` and `lessons.md` with:
    - subsystem changed
    - evidence sessions checked
    - hack debt reduced or introduced
    - any classified regression or exposed blocker
12. Summarize progress on three axes:
    - implementation delta
    - regression stability
    - score delta as lagging evidence only

Before final handoff, state:

- completed meaningful iteration count;
- current follow-up queue;
- why each remaining queued item is not being attempted now;
- the exact stopping condition being invoked.

If fewer than 10 meaningful implementation iterations were completed, the stopping explanation must be concrete and global, not limited to the current subsystem.

Guardrails:

- Optimize for generalized feature parity, not passed-screen totals.
- Do not add per-seed, per-step, or per-screen hacks.
- Prefer reducing hardcoded scaffolding over preserving a local score bump.
- No unclassified regressions: fix accidental regressions, but document expected regressions from hack removal instead of restoring hacks just to preserve screen totals.
