---
description: Prompt template to iterate on a NetHack JS session until test cases pass
---

# Iterate on Testcase Workflow

You have been invoked via the `/iterate-on-testcase` command. The user may have provided a session name or path as an argument.

**Your Mission:**

1. Read `agent.md`, `lessons.md`, and `feature_map.md` first. Do not skip this step.
2. Run the full test suite to establish a baseline screen count:
   ```bash
   node frozen/ps_test_runner.mjs
   ```
   Record the total matched screens. This is your starting score.
3. Identify the target session:
   - If the user passed a session name (e.g. `seed8000-tourist-starter`), target `sessions/<name>.session.json`.
   - If no session was specified, consult `feature_map.md` "Recommended Next Targets" and pick the highest-ROI session.
4. Run the single-session test and note the `Screen X/Y` count:
   ```bash
   node frozen/ps_test_runner.mjs sessions/<session>.session.json
   ```
5. Find the first diverging screen. Use the standard debug pattern in `agent.md` to compare expected vs actual cells.
6. Implement the fix in `js/` (never in `frozen/`). Follow harness hygiene rules in `agent.md`.
7. After every fix: re-run the single session, then re-run the full suite. No regressions allowed.
8. Update `feature_map.md` status and `lessons.md` with your findings.
9. Provide a summary of your work — state the screen count before and after your changes.

**The central metric that counts: total number of matched screens increases without introducing regressions, band-aid hacks or esoteric theories.**

Have fun!