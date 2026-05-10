---
description: Compact workflow for classifying a divergence before editing code
---

# Triage Divergence Workflow

Use this when the immediate goal is understanding a failure, not writing code quickly.

1. Read `AGENTS.md`, `lessons.md`, and the relevant `feature_map.md` rows.
2. Run:
   ```bash
   node scripts/triage-session.mjs sessions/<session>.session.json
   ```
3. Extract the minimum facts needed to act:
   - first screen mismatch step
   - first RNG mismatch index
   - mismatch class: `cursor`, `message`, `char`, `attr`, `char+attr`
   - mismatch surface: `message`, `map`, `status`, `mixed`
   - first sample cells
4. State a hypothesis in subsystem terms, not testcase terms.
   Good: `zero-turn command still consumes monster RNG`
   Bad: `screen 14 needs a different dog position`
5. If the compact triage is insufficient, use a one-off debug script and delete it after use.
6. Only move on to implementation once the divergence is localized to a subsystem or a narrow uncertainty range.
