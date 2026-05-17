# Agent Memory Model

The harness should retrieve context, not preload history.

## Files

See `AGENTS.md` under "## Memory Routing"

## Budgets

- `AGENTS.md`: target 90-140 lines.
- `scratch/agent-loop.md`: target 80-140 lines.
- Runbook files: target 40-120 lines.
- Generated briefs: target 80-180 lines.
- Lesson bullets: one durable paragraph, not an iteration log.

## Tags

New durable lessons should include at least one retrievable anchor when natural:

- `[subsystem:display]`
- `[session:seed0383]`
- `[c:display.c:swallowed]`
- `[js:display.js]`
- `[fr:16915]`

Do not rewrite old lessons just to tag everything. Add tags as touched.

## Generated Memory

Generated files must say how to regenerate them. Treat them as indexes, not
truth:

- `scratch/divergence-inventory.md`
- `scratch/agent-brief.md`
- `scratch/verification-last.json`
- `scratch/hack-debt.md`

## Update Rules

- Put current state in `scratch/agent-loop.md`.
- Put subsystem truth in `feature_map.md`.
- Put durable, general discoveries in `lessons.md`.
- Put chronology in commit messages.
- Do not paste long command output into memory files.
- Commit coherent truth changes after verification so git history becomes the
  chronology instead of another markdown log.
