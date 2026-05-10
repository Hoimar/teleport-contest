---
description: Prompt template to kick off an implementation loop on the highest-ROI subsystem until feature parity improves
---

# Implementation Loop Workflow

You have been invoked via the `/implementation-loop` command. The task is to advance generalized feature parity by improving one subsystem, not by repairing one testcase.

**Your Mission:**

1. Read `AGENTS.md`, `lessons.md`, and `feature_map.md` first. Do not skip this step.
2. Establish the broad baseline:
   ```bash
    node frozen/ps_test_runner.mjs
   ```
   Record the corpus result as a lagging indicator only. Do not use total matched screens as the optimization target.
3. Run the sentinel suite before editing:
   ```bash
   node scripts/run-sentinel-suite.mjs
   ```
   The default suite is intentionally cross-cutting and must stay small enough for frequent reruns.
4. Identify the target subsystem:
   - If the user named a subsystem or feature (e.g. `chargen`, `o_init`, `monmove`, `sounds`, `display RNG context`), work on that subsystem.
   - If the user named only a session, use that session only as evidence for choosing the blocked subsystem.
   - If no target was specified, consult `feature_map.md` and pick the highest-ROI subsystem or blocker, not the highest-ROI session symptom.
5. Choose evidence sessions before editing:
   - Pick at least one target session that exposes the subsystem.
   - Pick at least one sentinel session likely to regress if the subsystem change is wrong.
   - Think in terms of evidence coverage, not “the testcase to make pass.”
6. Triage the evidence session before editing:
   ```bash
   node scripts/triage-session.mjs sessions/<session>.session.json
   ```
   Record:
   - screen counts
   - RNG counts
   - first mismatch step
   - mismatch class
   - cursor-only mismatch count
7. State the hypothesis in subsystem terms before editing.
   Good:
   - `chargen still bypasses role/race selection logic and hardcodes seed0002 startup`
   - `zero-turn UI path still consumes per-turn monster RNG`
   Bad:
   - `screen 14 needs a different dog position`
   - `seed0002 should match 30 more screens`
8. Implement or extend the responsible subsystem in `js/` (never in `frozen/`). If the only apparent fix is session-specific, stop and choose a more structural change instead. Follow harness hygiene rules in `AGENTS.md`.
9. After every meaningful fix:
   - re-run `node scripts/triage-session.mjs sessions/<session>.session.json` for the evidence session
   - re-run `node scripts/run-sentinel-suite.mjs`
   - if possible, check one additional session that exercises the same subsystem
   - if regressions appear, keep working before declaring success
10. Re-run the full suite before you stop. No regressions allowed.
11. Update `feature_map.md` status and `lessons.md` with:
   - subsystem changed
   - evidence sessions checked
   - hack debt reduced or introduced
12. Provide a summary of your work. Report progress on three axes:
   - implementation delta: what subsystem or blocker actually moved
   - regression stability: sentinel-suite outcome and evidence sessions checked
   - score delta: any session/corpus screen changes as lagging evidence only

**The central goal is generalized feature parity.** Sessions and screens are evidence sources, not the object being optimized. A change only counts if it advances a subsystem, avoids sentinel regressions, and moves the implementation away from hardcoded session behavior.

Have fun!
