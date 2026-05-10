---
description: Workflow for removing per-seed hacks, stale docs, and forward-only clutter
---

# Dehack And Simplify Workflow

Use this when the codebase is accumulating session-specific scaffolding or stale operational truth.

1. Read `AGENTS.md`, `lessons.md`, and `feature_map.md`.
2. Identify one cleanup target class:
   - per-seed branches
   - `_override_screen` scaffolding
   - fast-forward RNG tables
   - tracked one-off debug scripts
   - stale score claims in docs
3. Before editing, run:
   ```bash
   node scripts/run-sentinel-suite.mjs
   ```
4. Make cleanup changes that reduce special cases or duplicated truth.
5. Re-run the sentinel suite and at least one directly affected target session with `node scripts/triage-session.mjs`.
6. If cleanup reveals a broader regression, document it explicitly instead of restoring the old hack automatically.
7. Update docs so measured state and documented state do not diverge.
