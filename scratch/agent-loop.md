# Teleport Implementation Loop

This file is the live handoff checkpoint, not a full history. It was compacted on 2026-05-12 to reduce agent context load. Older iteration detail is intentionally omitted; use `git log`, `git show`, `lessons.md`, and `feature_map.md` only when a specific past decision needs to be recovered.

## Context Hygiene

- Read this file in full before resuming the loop; it is intentionally compact.
- Prefer `rg` over full reads for large persistent memory:
  - `lessons.md`: grep by subsystem, function, C file, session, or FR number.
  - `feature_map.md`: grep by session id, subsystem row, JS file, or C source.
  - `scratch/divergence-inventory.md`: generated inventory; grep or regenerate with `scripts/triage-corpus.mjs`.
  - `sessions/*.session.json`: do not read in full; use `scripts/triage-session.mjs`, `scripts/trace-dog-goal.mjs`, or targeted JSON searches.
- Full-read `AGENTS.md` when loop policy is uncertain. Otherwise use targeted searches for workflow clauses.
- Full-read local `teleport-*` skill `SKILL.md` files when invoked; they are short.

## Current State

- Branch: `main`.
- Baseline requested by user: resume from commit `04d9360` and continue on the current branch without pushing.
- Latest committed loop work: `d9f72d4 Handle pet abuse on hero kill`.
- Local divergence from remote: branch is ahead of `origin/main`; do not push unless explicitly asked.
- Current target: `seed0383-wizard-hallucinate`.
- Active subsystem hypothesis: ordinary monster movement candidate geometry after hero-killed pet removal. C reaches `rn2(20)` in `m_move()`; JS reaches `rn2(16)`, likely from incomplete `mfndpos()` flags, actor ownership, live position state, or backtracking candidate count rather than a missing seed-specific roll.

## Latest Verified Scores

- Sentinel before/after this checkpoint compaction: total `S 143/1063 R 28848/64569`.
- `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, FR `3047`.
- `seed0002-healer-reflection-drummer`: `S 11/595 R 1255/27158`, FR `1215`.
- `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 541/4804`, FR `507`.
- `seed0116-wizard-wear-shop`: `S 109/127 R 12562/12562`, no RNG mismatch; first screen mismatch remains screen 109 attr/object color drift.
- `seed0383-wizard-hallucinate`: `S 0/219 R 11430/16915`, FR `11387`.
- Full suite after latest production commit: `S 143/11406`, 0/44 passing.

## Recent Implementation Delta

The recent loop advanced `seed0383` through multiple general subsystems without adding per-seed reward hacks:

- Fog cloud gas-region lifetime and `inside_gas_cloud()` TTL maintenance.
- Hallucination/confusion Wisdom exercise on 5-turn boundaries.
- Swallow timer decrement, expulsion, `unstuck()`, `mnexto()` relocation, and `mspec_used` countdown.
- Occupied-square and swallowed-hero melee front doors using the same current-evidence `uhitm()` shape.
- Hero-killed tame monster path: current `abuse_dog()`/hallucination yelp/`xkilled()` gates, live monster removal, and redraw.

Latest committed production slice:

- Commit: `d9f72d4 Handle pet abuse on hero kill`.
- Evidence: `seed0383` moved from FR `11372` / `R 11419/16915` to FR `11387` / `R 11430/16915`.
- Classification: the pet-abuse blocker is resolved for current evidence; remaining blocker is ordinary movement candidate geometry after the pet is removed.
- Known limitation: hero combat is still only a narrow front door. Corpses, treasure object creation, luck/accounting, passive effects, and general `uhitm()` remain incomplete.

## Current Queue

1. Classify `seed0383` FR `11387` with compact tooling first:
   - `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json`
   - `node scripts/trace-dog-goal.mjs sessions/seed0383-wizard-hallucinate.session.json --moves 179 --rng 11370:11405 --monsters`
   - If compact tooling is insufficient, add temporary guarded movement tracing and remove it before any commit.
2. Identify which monster owns JS `rn2(16)` and compare its position, movement budget, `mtrack`, and `mfndpos()` candidate set with C's expected `rn2(20)`.
3. Continue `seed0116` screen 109 object identity/color drift after the FR `11387` movement blocker is classified or locally blocked.
4. Keep broader startup/display/save blockers secondary unless the active queue is blocked.

## Regression Notes

- `seed0116` currently has exact RNG parity, so avoid broad changes that disturb Soko zoo, pet movement, command prompt, object color, or turn-tail state without a clear classification.
- `seed0002` and other non-target RNG prefixes shifted during shared hero-kill/death-side-effect work while matched screens stayed unchanged. Treat these as queued evidence only if those sessions become active targets.
- `seed0383` still has screen `0` mismatch because hallucination/display context and startup rendering remain incomplete; do not optimize visible screens directly.

## Verification Cadence

- Run target triage after each production edit.
- Run sentinel suite after each meaningful edit.
- Run the full suite after broad shared changes or every 3-5 meaningful implementation iterations.
- Update `feature_map.md` and `lessons.md` only when subsystem truth changes.
- Make local commits after coherent, verified implementation improvements; do not push.

## Compaction Note

Historical detail removed from this file included older iterations for seed0116 special-level/zoo work, seed0383 startup/special-level work, and earlier probes. Durable subsystem lessons from those iterations are preserved in `lessons.md` and summarized in `feature_map.md`. For old operational details, prefer targeted `git show`/`git log -S` searches over re-expanding this checkpoint.
