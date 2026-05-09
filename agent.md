# Agent Harness

Welcome to the Teleport Contest Agent Harness. This document outlines the standard operating procedure for any AI agent working on porting NetHack 5.0 C code to JavaScript for this project.

## Objective
The goal is to produce a JavaScript implementation whose external behavior is exactly indistinguishable from upstream NetHack 5.0. It must perfectly match the PRNG sequence and terminal output, frame by frame.

## Workflow & Verification Loop

The primary loop you should use to verify your work is running the scoring scripts against the recorded sessions.

1. **Targeting the Starter Session**:
   Before trying to pass everything, focus on the starter session. Run:
   ```bash
   node frozen/ps_test_runner.mjs sessions/seed8000-tourist-starter.session.json
   ```
   *Look for the output line like `div@392`, which tells you the step at which your output diverged from the recording.*

2. **Full Test Suite**:
   Once you're making good progress, or want to check for regressions on the other sessions, score all of them at once:
   ```bash
   bash frozen/score.sh
   ```

3. **Debugging the Web View**:
   Sometimes seeing the game helps. The project includes a basic HTTP server setup. If it isn't running, start it:
   ```bash
   python3 -m http.server 8000
   ```
   Then navigate to `http://localhost:8000/`.

## Agent Skills & Tasks

To successfully port the game, apply these steps:

1. **Identify the Divergence**: From the test runner output, find the exact step where the code diverges (either screen or PRNG).
2. **Find the C Implementation**: Use `grep_search` to search the `nethack-c/upstream/` directory for the relevant logic, strings, or function names. NetHack has a large codebase; use specific function names and constants to locate the code efficiently.
3. **Trace the PRNG Calls**: Ensure you understand every single time the C code asks for a random number (e.g. `rn2()`, `rnd()`, `rnz()`). *Important: The C codebase was compiled with clang, meaning left-to-right argument evaluation. You must match this in JavaScript so PRNG numbers are drawn in the exact same order.*
4. **Implement in JS**: Write the corresponding logic in the `js/` directory. Remember not to modify frozen files like `js/isaac64.js`, `js/terminal.js`, or `js/storage.js`.

## Code Context & Pitfalls
- **fastforward.js**: Initially, the codebase uses `js/fastforward.js` to fake PRNG calls for the starter session. Your job is to eventually replace these hardcoded fakes with the actual replicated logic in `js/`.
- **Three PRNG Contexts**: NetHack uses different random states for core gameplay, Lua-scripts, and display (hallucinations). Your port must match all of these.

## Crucial Learnings for AI Agents (Avoid these Pitfalls!)
Based on the creator's initial attempt to use agents for this project, here are fundamental rules you must follow:

1. **Do Not Invent "Religions" to Explain Bugs**: If your JavaScript logic consumes random numbers in the wrong order or produces different sequencing from C, you have a bug. Do not invent complex architectural theories (like "sparse boundary frames" or artificial sync concepts) to explain it away. Fix the root cause.
2. **Accept Real Regressions**: When you remove workarounds or fix a core flaw, many passing tests might suddenly fail. This does not mean your fix was bad; it means those tests were passing for the wrong reasons. Do not instantly revert your code if an architectural fix reveals real underlying bugs.
3. **Beware of Bad Memes Spreading**: Flawed architectures can easily spread through comments, variable names, and call chains. If you realize an approach was fundamentally flawed, purge the concept entirely from the codebase so you don't keep accidentally returning to it.
4. **Solve Hard Problems, Don't Chase Metrics, don't engage in Reward Hacking**: Do not spend time padding stats by writing "easy" tests or avoiding difficult sessions just to make dashboard numbers go up. Face the difficult fundamental issues - especially asynchronous event management and core game loop ordering - head-on.
5. **Get the Core Loop Right**: Ensure `async`/`await` plumbing and event loop ordering (especially for things like waiting for user input prompts) exactly mimic C's execution before building massive amounts of logic on top of it.

You have been provided with VS Code launch and task configs to easily start these scripts if the user decides to run them manually from their editor.
