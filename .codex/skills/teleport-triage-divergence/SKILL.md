---
name: teleport-triage-divergence
description: Use when working in the teleport-contest repo to classify a failing session or divergence before editing code, and to translate the first mismatch into a subsystem-level hypothesis. Also use inside teleport-implementation-loop when the next target is not localized to a subsystem.
---

# Teleport Triage Divergence

Use this skill when the immediate task is understanding a failure, not implementing quickly.

Workflow:

1. Read `AGENTS.md` as needed for policy, read compact `scratch/agent-loop.md` for current state, and use `rg` to pull only the relevant `lessons.md` bullets and `feature_map.md` rows for the active session/subsystem.
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
4. State the hypothesis in subsystem terms, not testcase terms.
   Good:
   - `zero-turn command still consumes monster RNG`
   - `chargen path still bypasses nethackrc-driven role selection`
   Bad:
   - `screen 14 needs a different dog position`
   - `this session needs 20 more screens`
5. If compact triage is insufficient, use a one-off debug script and delete it after use.
6. Move to implementation only when the failure is localized to a subsystem or a narrow uncertainty range.

Guardrails:

- Use sessions as evidence, not as the unit of optimization.
- Prefer hypotheses that map to C subsystems or JS modules.
