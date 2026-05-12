---
name: teleport-dehack-simplify
description: Use when working in the teleport-contest repo to remove seed-specific hacks, stale operational truth, and other scaffolding that blocks generalized feature parity. Also use inside teleport-implementation-loop when the next useful step is reducing replay, override, or reward-hacking debt.
---

# Teleport Dehack And Simplify

Use this skill when the codebase is accumulating special cases, replay tables, override scaffolding, or stale docs.

Workflow:

1. Read `AGENTS.md` as needed for policy, read compact `scratch/agent-loop.md` for current state, and use `rg` to pull only the relevant `lessons.md` bullets and `feature_map.md` rows for the cleanup target.
2. Pick one cleanup target class:
   - per-seed branches
   - `_override_screen` scaffolding
   - fast-forward RNG tables
   - tracked one-off debug scripts
   - stale score or status claims in docs
3. Before editing, run:
   ```bash
   node scripts/run-sentinel-suite.mjs
   ```
4. Make cleanup changes that reduce special cases or duplicated truth.
5. Re-run the sentinel suite and at least one directly affected session with:
   ```bash
   node scripts/triage-session.mjs sessions/<session>.session.json
   ```
6. If cleanup reveals a broader regression, document it explicitly instead of restoring the old hack automatically.
7. Update docs so measured state and documented state do not diverge.

Guardrails:

- Prefer architectural truth over preserving a fragile local pass.
- Visible hack debt is better than hidden hack debt, but reduced hack debt is the target.
- No unclassified regressions: fix accidental regressions, but document expected regressions from hack removal instead of restoring hacks just to preserve screen totals.
