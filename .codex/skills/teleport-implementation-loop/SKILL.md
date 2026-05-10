---
name: teleport-implementation-loop
description: Use when working in the teleport-contest repo to run a sustained autonomous implementation loop that advances generalized NetHack feature parity across subsystems. Trigger when the user asks to keep iterating, continue autonomously, run a marathon, work from blocker to blocker, or improve parity without a single named patch.
---

# Teleport Implementation Loop

Use this skill to enter the marathon workflow defined in `AGENTS.md`.

## Source Of Truth

`AGENTS.md` is authoritative for:
- baseline and triage commands
- minimum marathon budget
- queue order
- probe and regression handling
- full-suite cadence
- valid stop conditions
- final handoff requirements

Follow `AGENTS.md` Step 2.7, then continue through Steps 3 and 4 for each queued target. Do not duplicate or reinterpret those rules here; update `AGENTS.md` if the loop contract changes.

## Skill-Specific Reminders

- Read `AGENTS.md`, `lessons.md`, and `feature_map.md` before starting.
- Keep `scratch/agent-loop.md` as the live checkpoint while the loop runs.
- Use sessions as evidence for generalized NetHack parity, not as scoreboard targets.
- If triage is unclear, use `$teleport-triage-divergence`.
- If the next useful work is removing scaffolding, stale truth, or reward-hacking debt, use `$teleport-dehack-simplify`.
