---
description: Prompt template to iterate on a NetHack JS session until test cases pass
---

# Iterate on Testcase Workflow

You have been invoked via the `/iterate-on-testcase` command. The user has provided a session name or path as an argument.

**Your Mission:**
1. Please read `agent.md` and `lessons.md` first to understand the context and pitfalls.
2. Identify the session the user wants you to fix from their prompt argument. If it's just a filename (e.g. `seed8000-tourist-starter`), assume it's located in `sessions/` and ends with `.session.json`.
3. Iterate on the codebase until the specified session passes the test suite using `node frozen/ps_test_runner.mjs <session_file>`.
4. Document your findings in `lessons.md`.
5. Provide a summary of your work once the session passes.

Have fun!

If no session name is passed, run the Full Test Suite and pick a random failing test case.