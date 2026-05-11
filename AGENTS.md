# Agent Harness

Welcome to the Teleport Contest Agent Harness. This document outlines the standard operating procedure for any AI agent working on porting NetHack 5.0 C code to JavaScript for this project.

## Core Objective & Principles

The goal is to produce a JavaScript implementation whose behavior is exactly indistinguishable from upstream NetHack 5.0. It must perfectly match the PRNG sequence and terminal output, frame by frame.

**The end goal is parity, not a vanity score.** Total matched screens across all 44 sessions is still a public scoreboard output, but it is a lagging indicator and must not be used as an explicit optimization target.

### The Golden Rule: NO REWARD HACKING
Do NOT use `switch` statements or per-step logic (e.g., `apply_seed0002_hacks`) to force states to match a specific session. This is "reward hacking" and provides zero value for general feature parity. You MUST implement the underlying game systems (AI, pathfinding, message buffers, etc.) instead.

**The Adversarial Check:** Before every edit, ask: *"Am I implementing a general NetHack system, or am I hardcoding logic to pass a specific screen?"* If the latter, **STOP**.

## Key Documents

| Document | Purpose |
|---|---|
| `docs/API.md` | API contract — what `runSegment()` must return and how scoring works |
| `feature_map.md` | Cross-reference of every subsystem: C source ↔ JS implementation ↔ status ↔ blocked screens |
| `lessons.md` | Accumulated learnings — **read before every task, update after every breakthrough** |

## Workflow & Verification Loop

### Step 1 — Read first
```
AGENTS.md → lessons.md → feature_map.md (check status/ROI of target)
```

### Step 2 — Establish a real baseline
```bash
# Score a single session (fast)
node frozen/ps_test_runner.mjs sessions/<session>.session.json

# Full regression suite (run before AND after any change)
node frozen/ps_test_runner.mjs
```

Output format: `FAIL: seed0002-... (RNG 1149/27158, Screen 11/595)`
- `Screen 11/595` means you matched 11 out of 595 screens — a lagging outcome measure.
- Always record before/after counts, but do not report them alone.

### Step 2.5 — Track progress on three axes

Every change report must include all three:

1. **Score delta**
   - Public corpus screens before/after, treated as lagging evidence only.
   - Evidence-session screens before/after, treated as lagging evidence only.
2. **Regression stability**
   - A fixed sentinel suite must be re-run after each meaningful edit.
   - Currently, the minimum reasonable included sessions are:
     - `seed8000-tourist-starter` for startup/UI/menu behavior
     - `seed0002-healer-reflection-drummer` for messages, pet, and zero-turn handling
     - `seed0013-friday13-save-then-fullmoon-restore` for datetime/save-restore behavior
     - `seed0116-wizard-wear-shop` for inventory/shop/object handling
     - `seed0383-wizard-hallucinate` for display RNG context
3. **Implementation delta**
   - Which subsystem moved in `feature_map.md`
   - Which hacks/stubs were removed, reduced, or introduced
   - Evidence sessions supporting the claim

If score goes up while hack debt also goes up, that is **not** progress. Treat it as temporary exploration only.

### Step 2.6 — Use compact triage first

Prefer the low-noise tooling before writing ad hoc debug scripts:

```bash
# Compact first-mismatch summary for one target session
node scripts/triage-session.mjs sessions/<session>.session.json

# Small cross-cutting suite for rapid regression checks
node scripts/run-sentinel-suite.mjs
```

Only fall back to custom debug scripts when the compact triage output is insufficient.

### Step 2.7 — Marathon loop contract

Unless the user explicitly asks for a single patch, a review, or a bounded investigation, agents must assume they are in a sustained implementation loop. A checkpoint is not a stopping point.

Branch and commit discipline:
- Use the current branch as the long-running work lane unless the user names another branch. Do not create extra work branches as routine loop bookkeeping.
- Do not push or force-push during the loop unless the user explicitly asks for that operation. Treat pushes to `main` as deliberate leaderboard submissions.
- Make local commits after coherent, verified implementation improvements. Failed experiments do not need commits; either revert the experiment, narrow it into a real fix, or leave it only as a scratch note.
- Record the current branch at startup so handoffs can distinguish local implementation work from leaderboard submission state.

At loop startup:
1. Confirm branch, dirty state, and baseline commit with `git status --short --branch` and a suitable revision command.
2. Run the full suite and sentinel suite unless a fresh baseline is already present in the current turn.
3. Create or update `scratch/agent-loop.md` with:
   - current branch and baseline commit
   - baseline scores and sentinel results
   - current subsystem target and evidence session
   - active hypothesis
   - queued next targets
   - verification cadence
   - notable regressions, discarded directions, and what they imply
4. Pick work in this order:
   - user-named subsystem or evidence session
   - same-subsystem followups exposed by the latest change
   - highest-ROI target from `feature_map.md`
   - hack-debt cleanup that unlocks real subsystem work

During the loop:
- Complete a minimum marathon budget before final handoff: at least 5 meaningful implementation iterations, or every currently queued structural target, whichever is larger. A meaningful implementation iteration means: triage a target, state a subsystem hypothesis, implement or clean up general subsystem behavior, verify it, classify any regression, update docs if subsystem truth changed, and select the next queued target.
- Prefer robust feature iterations over probe accounting. Regressions and wrong porting directions can and will happen; larger short-term regressions are acceptable when removing hacks or moving toward a more faithful architecture, as long as they are understood and recorded.
- After any meaningful edit, continue to the next queued target unless a valid stop condition below applies.
- Full-suite verification, sentinel verification, `feature_map.md` updates, `lessons.md` updates, and checkpoint notes are loop maintenance tasks, not handoff triggers.
- A wrong direction is not a global stop. Revert accidental damage when that is the clearest path, or roll forward when the regression exposes missing subsystem work. Record only durable lessons in `scratch/agent-loop.md` and/or `feature_map.md`, then continue with the next hypothesis or target.
- A local subsystem blocker is not a global stop. Classify it, record the next required structural work, and move to the next queued subsystem.
- Run the full suite at startup, after broad shared changes, after every 3-5 meaningful implementation iterations, and before a valid final handoff.

Valid stop conditions are only:
1. The user explicitly asked for one bounded pass or asks the agent to stop.
2. Tests cannot run after retrying and any required escalation request.
3. Continuing requires an unresolved project-direction decision that cannot be answered from `AGENTS.md`, `lessons.md`, `feature_map.md`, or upstream C sources.
4. No safe structural next step exists globally after checking the active queue, `feature_map.md`, visible hack debt, and the available teleport skills.

Final handoff after a marathon loop must state:
- iteration count
- implementation delta by subsystem
- lagging score delta
- sentinel stability
- notable regressions, discarded directions, and how they were classified
- current queue
- exact valid stop condition

### Step 3 — Find the divergence

The first non-matching screen index tells you where to look. Use the standard debug pattern below to compare cells.

### Step 4 — Fix and verify

1. Make the smallest possible change addressing the root cause.
2. Re-run the target session to confirm the first divergence moved in the right direction.
3. Re-run the sentinel suite to confirm the change generalizes and to classify immediate regressions.
4. Run the full suite (`node frozen/ps_test_runner.mjs`) when starting a new implementation loop, before final handoff only after the loop budget is met or a global stopping condition is reached, after broad shared changes, and after every 3-5 meaningful iterations.
5. Treat regressions as evidence to classify, not automatic grounds for reverting.
   - Fix accidental regressions.
   - Document expected regressions from hack removal or broader architectural cleanup instead of restoring hacks to preserve screen totals.
6. Update `feature_map.md` status and `lessons.md`.
7. If no valid stop condition applies, return to Step 2.6 with the next queued target.

### Step 5 — Debug the web view (optional)
```bash
python3 -m http.server 8000
# Navigate to http://localhost:8000/
```

## Harness Hygiene & Tooling

1. **Never modify frozen files** — `frozen/ps_test_runner.mjs`, `js/isaac64.js`, `js/terminal.js`, `js/storage.js`.
2. **No debug I/O in production paths** — Never leave `console.log` or filesystem writes in core engine files.
3. **Extend the Harness** — You are encouraged to create new tools, debug scripts (in `debug/` or `scratch/`), or unit tests to make your life easier. Ensure all new tools are well-documented in their own header or in `docs/`.
4. **Garbage Collection** — Fearlessly remove any functions, files, or hacks that were identified as "reward hacking" by previous turns, even if this breaks screens in the short term.
5. **Fearless Regressions** — Do not be afraid to break passing screens if it means moving away from hacks and toward a correct architectural foundation.
6. **Capture residual hack debt explicitly** — Every fast-forward table, `_override_screen`, seed-specific branch, or stubbed RNG consumer must be tracked in `feature_map.md` notes. Hidden hacks are worse than visible hacks.

## Worktree Policy

This repo is expected to be dirty during agent work. Treat the current worktree as the working baseline.

- Do not comment on dirty worktree state unless it blocks the task or indicates files outside the requested scope were changed by the agent.
- Do not run `git status` just to warn about pre-existing changes.
- Never revert or protect pre-existing changes unless explicitly asked.
- It is acceptable to edit files that are already modified; work with the current contents.

## Standard Debug Pattern for Screen Mismatches

```js
// debug_screen.mjs — DELETE after use
import { decodeScreen } from './frozen/screen-decode.mjs';
import { readFileSync, writeFileSync } from 'fs';

// Step 1: TEMPORARILY add to ps_test_runner.mjs runSession() loop (revert after!):
//   } else if (i === TARGET_IDX) {
//     writeFileSync('act.txt', jsScreens[i]); writeFileSync('exp.txt', cScreens[i]);
//   }
// Step 2: run the session, then run this script.
// Step 3: REVERT ps_test_runner.mjs. DELETE act.txt, exp.txt, this file.

function translateDecSpans(s) {
    const MAP = { j:'\u2518', k:'\u2510', l:'\u250c', m:'\u2514', n:'\u253c',
        q:'\u2500', t:'\u251c', u:'\u2524', v:'\u2534', w:'\u252c', x:'\u2502' };
    let out='', dec=false;
    for (let i=0; i<s.length; i++) {
        const ch = s[i];
        if (ch==='\x0e'){dec=true;continue;}
        if (ch==='\x0f'){dec=false;continue;}
        if (ch==='\x1b'&&s[i+1]==='['){
            const start=i; i+=2;
            while(i<s.length){const c=s.charCodeAt(i);if(c>=0x40&&c<=0x7e)break;i++;}
            out+=s.slice(start,i+1); continue;
        }
        out+=dec?(MAP[ch]||ch):ch;
    }
    return out;
}

const ga = decodeScreen(translateDecSpans(readFileSync('act.txt','utf8')));
const gb = decodeScreen(translateDecSpans(readFileSync('exp.txt','utf8')));
let n=0;
for (let r=0; r<24; r++)
    for (let c=0; c<80; c++)
        if (ga[r][c].ch!==gb[r][c].ch || ga[r][c].color!==gb[r][c].color)
            console.log(`[${r},${c}] EXP='${gb[r][c].ch}' col=${gb[r][c].color} vs ACT='${ga[r][c].ch}' col=${ga[r][c].color}`), n++;
console.log('Total diffs:', n);
```

## Agent Skills & Tasks

1. **Continuous Learning (lessons.md)**: Before you begin any task, you MUST read `lessons.md`. Whenever you solve a complex bug, document your findings. Ensure new lessons are consistent with old ones.
2. **Consult feature_map.md**: Find the highest-ROI subsystem or blocker. Check which C source file implements the feature you need.
3. **Identify the Divergence**: From the test runner output, find the exact step where the code diverges (screen or PRNG).
4. **Find the C Implementation**: Use `grep_search` to search `nethack-c/upstream/` for the relevant logic or function names.
5. **Trace the PRNG Calls**: Every `rn2()`, `rnd()`, `rnz()` call must fire in the same order as C. C (clang) evaluates arguments left-to-right — JavaScript does too; don't reorder.
6. **Implement in JS**: Write the corresponding logic in `js/`. Do not modify frozen files.
7. **Summarize Your Work**: After advancing a subsystem or reducing hack debt, provide a clear summary and update `feature_map.md`.

## What Counts As Progress

A change counts as real progress only if all of the following are true:

1. A subsystem advances or a known divergence becomes more structurally correct in subsystem terms.
2. The sentinel suite is run when required, and any regression is classified as accidental damage to fix or an expected consequence of removing hacks / moving toward upstream architecture.
3. `feature_map.md` becomes more truthful:
   - status advances toward general implementation, or
   - notes identify a blocker more precisely, or
   - hack debt decreases.

Examples of good progress:
- replacing a seed-specific menu replay with a general menu renderer, even if total screens stay flat for one turn
- fixing cursor handling for all override screens, not one testcase
- moving a divergence from "unknown mismatch" to "monster move RNG after zero-turn command"

Examples of fake progress:
- adding a new per-seed special case while leaving the underlying subsystem unimplemented
- improving one target session while silently regressing a sentinel session
- reporting only screen-count movement without describing what system actually changed

## Code Context & Pitfalls

- **fastforward.js / fastforward0002.js**: Hardcoded RNG replay for seed8000 and seed0002. These are scaffolding — your job is to replace them with real ported logic.
- **Three PRNG Contexts**: NetHack uses different random states for core gameplay, Lua-scripts, and display (hallucinations). Your port must match all of these.
- **`_override_screen`**: A hack to inject pre-rendered screens during startup (chargen UI). These are hardcoded per-seed and must eventually be replaced by real chargen logic.

## The Path to Feature Parity

Instead of hardcoding session-specific states, agents must implement the actual NetHack 5.0 logic. Follow this workflow for any divergence:

1. **Observe Divergence:** Use `debug_screen.mjs` to find the exact screen/PRNG mismatch.
2. **Trace to C Source:** Use `grep_search` to find the relevant function in `nethack-c/upstream/`. (e.g., if a monster moves wrong, look at `monmove.c`; if a message is missing, look at `sounds.c`).
3. **Implement Subsystem:** Port the C logic to a new or existing JS file (e.g., `js/monmove.js`, `js/sounds.js`).
4. **Replace RNG Stubs:** Once a subsystem is implemented, remove the corresponding hardcoded RNG calls from `fastforward.js` and call your new JS logic instead.
5. **Verify Generality:** Ensure your implementation works across multiple seeds, not just the one you are debugging.

## Feature Parity Checklist
- [ ] **Monster AI:** Port `monmove.c` and `dog.c` behavior.
- [ ] **Combat:** Port `fight.c` for hit/miss logic and damage.
- [ ] **Messages:** Implement a proper `pline()` buffer and `sounds.c` events.
- [ ] **Inventory:** Implement `invent.c` logic for picking up, wearing, and using items.
- [ ] **Object ID:** Implement `o_init.c` for randomized object appearance.

## Standard Agent Prompt Template

```text
Please read `AGENTS.md`, `lessons.md`, and `feature_map.md`.
Your mission is to run a sustained implementation loop to improve generalized feature parity by advancing subsystems,
using sessions only as evidence (or pick the highest-ROI subsystem from feature_map.md).
Use the branch and commit discipline from Step 2.7; do not create branch chaos or touch `main` unless the user asks.
Do not stop after a checkpoint, full-suite run, documentation update, small fix, wrong direction, or local subsystem blocker.
Keep `scratch/agent-loop.md` current, continue through the queue, and hand off only when a valid stop condition in `AGENTS.md` applies.
Document your findings in `lessons.md`, update `feature_map.md` status, and provide a summary of your work.
Have fun!
```
