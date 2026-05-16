# Implementation Loop Contract

Use this contract for sustained parity work. Use sessions as evidence, never as
the optimization target.

## Startup

1. Run `npm run agent:brief -- --target <target>`.
2. Confirm branch, commit, and dirty files from the brief.
3. Run baseline verification unless a fresh baseline exists in the current turn:
   - `npm run verify -- --target <session>`
   - add `--full` after broad shared changes.
4. Update `scratch/agent-loop.md` with only current state and queue.

## Work Cycle

1. Triage the first mismatch with compact tools.
2. State a subsystem hypothesis.
3. Check relevant C refs, JS files, feature-map rows, lessons, and git history.
4. Implement general subsystem behavior or remove hack debt.
5. Run `npm run verify -- --target <session>`.
6. Classify regressions.
7. Update `feature_map.md`, `lessons.md`, and checkpoint only if truth changed.
8. Commit the coherent truth or harness change after verification.
9. Continue to the next queue item unless a valid stop condition applies.

## Queue Order

1. User-named subsystem or session.
2. Same-subsystem followups exposed by the latest change.
3. Highest-ROI structural blocker from `feature_map.md`.
4. Hack-debt cleanup that unlocks real subsystem work.
5. Corpus bucket from `scratch/divergence-inventory.md`.

## Stop Conditions

Only stop when one is true:

1. The user asked for a bounded pass or told the agent to stop.
2. Tests cannot run after retrying and any required escalation request.
3. Continuing needs a project-direction decision not answerable from repo docs or C sources.
4. No safe structural next step exists after checking queue, feature map, visible hack debt, and role runbooks.

## Commit Rule

Commit after verified production behavior, durable memory, runbook, script, or
hack-debt changes. Stage only the coherent files for that unit; never sweep in
unrelated dirty worktree changes.

## Final Handoff

Report active loop time, iteration count, implementation delta, score delta,
sentinel stability, classified regressions, current queue, exact stop condition,
the global-next-step check, and the commit hash when a commit was made.
