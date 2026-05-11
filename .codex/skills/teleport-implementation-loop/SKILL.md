---
name: teleport-implementation-loop
description: Use when working in the teleport-contest repo to run a sustained autonomous implementation loop that advances generalized NetHack feature parity across subsystems. Trigger when the user asks to keep iterating, continue autonomously, run a marathon, work from blocker to blocker, or improve parity without a single named patch.
---

# Teleport Implementation Loop

Use this skill to enter the sustained implementation workflow defined in `AGENTS.md`.

## Source Of Truth

`AGENTS.md` is authoritative for:
- baseline and triage commands
- branch and commit discipline
- marathon budget
- queue order
- regression handling
- full-suite cadence
- valid stop conditions
- final handoff requirements

Follow `AGENTS.md` Step 2.7, then continue through Steps 3 and 4 for each queued target. Do not duplicate or reinterpret those rules here; update `AGENTS.md` if the loop contract changes.

## Loop Reminders

- Read `AGENTS.md`, `lessons.md`, and `feature_map.md` before starting.
- Keep `scratch/agent-loop.md` as the live checkpoint while the loop runs.
- Apply the branch, commit, marathon-budget, and regression policy from `AGENTS.md` Step 2.7; do not invent a branch strategy or probe quota.
- Use sessions as evidence for generalized NetHack parity, not as scoreboard targets.
- Use `$teleport-triage-divergence` before editing whenever the next target is not localized to a subsystem.
- Use `$teleport-dehack-simplify` whenever the useful next step is removing scaffolding, stale truth, or reward-hacking debt.
- Do not hand off after a checkpoint, verification run, local blocker, or classified regression unless a valid `AGENTS.md` stop condition applies.
- If the user asks for progress or percentages, report them as a brief interruption and then continue the queue unless the user explicitly asks to stop or only report.
- Before any final response, verify that no safe structural next step remains or quote the exact user stop request. Otherwise, keep working.
