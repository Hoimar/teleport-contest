# Agent Harness

Welcome to the Teleport Contest Agent Harness. This document outlines the standard operating procedure for any AI agent working on porting NetHack 5.0 C code to JavaScript for this project.

## Objective

The goal is to produce a JavaScript implementation whose external behavior is exactly indistinguishable from upstream NetHack 5.0. It must perfectly match the PRNG sequence and terminal output, frame by frame.

**See `docs/API.md` for the exact API contract you must adhere to.**

**The metric that matters: total matched screens / total screens across all 44 sessions.** More matched screens = better score. You do NOT need to pass a whole session; partial credit is awarded per matched screen.

## Key Documents

| Document | Purpose |
|---|---|
| `docs/API.md` | API contract — what `runSegment()` must return and how scoring works |
| `feature_map.md` | Cross-reference of every subsystem: C source ↔ JS implementation ↔ status ↔ blocked screens |
| `lessons.md` | Accumulated learnings — **read before every task, update after every breakthrough** |

## Workflow & Verification Loop

### Step 1 — Read first
```
agent.md → lessons.md → feature_map.md (check status/ROI of target)
```

### Step 2 — Run baseline
```bash
# Score a single session (fast)
node frozen/ps_test_runner.mjs sessions/<session>.session.json

# Full regression suite (run before AND after any change)
node frozen/ps_test_runner.mjs
```

Output format: `FAIL: seed0002-... (RNG 1149/27158, Screen 11/595)`
- `Screen 11/595` means you matched 11 out of 595 screens — the headline metric.
- Always record the before/after screen counts when reporting progress.

### Step 3 — Find the divergence

The first non-matching screen index tells you where to look. Use the standard debug pattern below to compare cells.

### Step 4 — Fix and verify

1. Make the smallest possible change addressing the root cause.
2. Re-run the single session to confirm screens improve.
3. Re-run the full suite (`node frozen/ps_test_runner.mjs`) to confirm **no regressions**.
4. Update `feature_map.md` status and `lessons.md`.

### Step 5 — Debug the web view (optional)
```bash
python3 -m http.server 8000
# Navigate to http://localhost:8000/
```

## Harness Hygiene Rules

> ⚠️ These rules exist to prevent broken debug code ending up in production paths.

1. **Never modify frozen files** — `frozen/ps_test_runner.mjs`, `js/isaac64.js`, `js/terminal.js`, `js/storage.js`. The judge overlays these before scoring. Any edits will be wiped.
2. **No debug I/O in production paths** — Never leave `console.log`, `import('fs').writeFileSync`, or similar in `js/jsmain.js`, `js/allmain.js`, `js/display.js`, or any other file that runs during `runSegment()`. The judge sandbox blocks filesystem writes and your session will error.
3. **Debug folder** — Debug scripts, logs etc. may live in the debug/ folder which is already in the .gitignore. other temporary files have to be moved there or removed before committing.
4. **One canonical debug pattern** — Write a standalone `debug_screen.mjs` in the project root, use it, then delete it. Never inline debug I/O in the engine.

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
2. **Consult feature_map.md**: Find the highest-ROI target. Check which C source file implements the feature you need.
3. **Identify the Divergence**: From the test runner output, find the exact step where the code diverges (screen or PRNG).
4. **Find the C Implementation**: Use `grep_search` to search `nethack-c/upstream/` for the relevant logic or function names.
5. **Trace the PRNG Calls**: Every `rn2()`, `rnd()`, `rnz()` call must fire in the same order as C. C (clang) evaluates arguments left-to-right — JavaScript does too; don't reorder.
6. **Implement in JS**: Write the corresponding logic in `js/`. Do not modify frozen files.
7. **Summarize Your Work**: After successfully passing a session or significantly improving screen counts, provide a clear summary and update `feature_map.md`.

## Code Context & Pitfalls

- **fastforward.js / fastforward0002.js**: Hardcoded RNG replay for seed8000 and seed0002. These are scaffolding — your job is to replace them with real ported logic.
- **Three PRNG Contexts**: NetHack uses different random states for core gameplay, Lua-scripts, and display (hallucinations). Your port must match all of these.
- **`_override_screen`**: A hack to inject pre-rendered screens during startup (chargen UI). These are hardcoded per-seed and must eventually be replaced by real chargen logic.

## Crucial Learnings for AI Agents (Avoid these Pitfalls!)

1. **Do Not Invent "Religions" to Explain Bugs**: If your JavaScript logic consumes random numbers in the wrong order, you have a bug. Fix the root cause — don't invent theories.
2. **Accept Real Regressions**: When you remove workarounds or fix a core flaw, many passing tests might fail. This is expected. Do not instantly revert an architectural fix.
3. **Beware of Bad Memes Spreading**: Flawed architectures spread through comments and call chains. Purge bad concepts entirely from the codebase.
4. **Solve Hard Problems, Don't Chase Metrics**: Do not pad stats by writing easy tests. Face fundamental issues head-on.
5. **Get the Core Loop Right**: Ensure `async`/`await` plumbing exactly mimics C's execution before building logic on top.

## Standard Agent Prompt Template

```text
Please read `agent.md`, `lessons.md`, and `feature_map.md`.
Your mission is to iterate on the codebase to maximize the total number of passing screens,
focusing on: sessions/<INSERT_SESSION_NAME>.session.json (or pick the highest-ROI target from feature_map.md).
Document your findings in `lessons.md`, update `feature_map.md` status, and provide a summary of your work.
Have fun!
```
