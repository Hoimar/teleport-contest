# Agent Harness

This repo ports NetHack 5.0 C behavior to JavaScript. The target is exact
parity: PRNG sequence and terminal output must match upstream frame by frame.

## Hard Law

The goal is parity, not vanity score. Public matched screens are lagging
evidence only.

No reward-hacking:

- no per-seed or per-step logic to force a recorded session
- no `switch(step)` / screen-index state forcing
- no new replay tables unless they are explicitly temporary and tracked
- no hidden `_override_screen`, fast-forward, or RNG-stub debt

Before editing, ask: "Am I implementing a general NetHack system, or am I
hardcoding this screen?" If it is hardcoding, stop and choose a subsystem fix.

## Files Never To Modify

- `frozen/ps_test_runner.mjs`
- `js/isaac64.js`
- `js/terminal.js`
- `js/storage.js`

Production `js/` must not leave debug I/O, filesystem writes, or imports from
`frozen/`.

## Memory Routing

Start with:

```bash
npm run agent:brief -- --target <session-or-subsystem>
```

Then open only the files it points to. `npm run` entries are short aliases for
the `node scripts/*.mjs` commands listed in `package.json`.

| File | Role | Default access |
|---|---|---|
| `scratch/agent-loop.md` | live checkpoint | read fully, keep compact |
| `feature_map.md` | subsystem truth | search by session/subsystem/C ref/JS path |
| `lessons.md` | durable lessons | search by tag/C ref/JS path/session |
| `scratch/divergence-inventory.md` | generated corpus index | search or regenerate |
| Git history | chronology | use `git log`, `git show`, `git log -S` |

More: `docs/agent/memory-model.md`.

## Standard Commands

```bash
npm run agent:brief -- --target <target>
npm run triage -- <session>
npm run screen:diff -- <session> --first
npm run verify -- --target <session>
npm run verify -- --target <session> --full
npm run hack:audit
npm run memory:lint
```

Use compact tools before ad hoc scripts. See `docs/agent/debugging.md` and
`docs/agent/using-the-harness.md`.

## Implementation Loop

For sustained work, follow `docs/agent/loop-contract.md`. Required cycle:

1. Triage first mismatch.
2. State a subsystem hypothesis.
3. Check relevant C source, JS files, feature-map rows, lessons, and git history.
4. Implement or dehack a general subsystem behavior.
5. Run `npm run verify -- --target <session>`.
6. Classify regressions.
7. Update memory only when subsystem truth changed.
8. Commit coherent truth or harness changes after verification.
9. Continue unless a valid stop condition applies.

Use sessions as evidence. The unit of progress is subsystem truth. Progress
rules: `docs/agent/progress-model.md`.

## Verification Contract

Every meaningful change report needs:

- target/evidence score delta
- sentinel stability
- implementation delta by subsystem
- hacks/stubs removed, reduced, or introduced
- regression classification

Run the full suite at startup for marathon loops, after broad shared changes,
after every 3-5 meaningful implementation iterations, and before valid final
handoff when the loop budget is met.

## Stop Conditions

Only stop when one is true:

1. The user asked for a bounded pass or explicitly told the agent to stop.
2. Tests cannot run after retrying and any required escalation request.
3. Continuing needs a project-direction decision not answerable from repo docs
   or upstream C sources.
4. No safe structural next step exists after checking queue, feature map,
   visible hack debt, git history, and role runbooks.

Checkpoint updates, full-suite runs, documentation updates, local blockers, and
classified regressions are not stop conditions.

## Role Modes

Roles are behavioral modes: loop driver, triage analyst, C porter, dehacker,
memory curator, verifier, and safety reviewer. Guide: `docs/agent/roles.md`.

## Human Feedback

When working interactively, report the current target, why the next command is
being run, the first mismatch hypothesis, verification evidence, and any
classified regression. Do not paste long raw logs unless asked.

## Commit Discipline

After verification, commit when a coherent unit changed durable truth or harness
policy: production parity behavior, `feature_map.md`, `lessons.md`, runbooks,
scripts, or hack-debt removal. Stage only related files and leave unrelated
dirty worktree changes alone. Do not commit checkpoint-only churn unless it is
the handoff artifact.

## C References And Handoff

Use compact C breadcrumbs: `C ref: path:function()`. Avoid long upstream
excerpts. Final loop reports need active time, iteration count, implementation
delta, score delta, sentinel stability, regressions, queue, stop condition, and
global-next-step check.
