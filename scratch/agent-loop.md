# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`, ahead of origin.
- Latest verified repair unit: leaderboard comparison-surface cleanup.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch succeeds from `https://mazesofmenace.ai/leaderboard/data.json`.
  Default inferred team `Hoimar` currently classifies as `leaderboard-lag`:
  leaderboard public `29/44 S 11292/11405 R 792838/792838`; held-out
  `2523/11265` points and `2/44` passing.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard fetch works, but default inferred team `Hoimar` is behind the
  checked-in public score surface and remains deploy/lag evidence.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit is clean: `hard=0 suspicious=0`. Production `js/` has no
  intentional debug I/O or imports from `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-28:
  - Harness truth: `scripts/parity-state.mjs` now compares leaderboard public
    rows against the checked-in or hosted public score surface whose session
    totals match the leaderboard payload. This keeps hosted-session drift from
    masking deploy/leaderboard lag when the leaderboard row still uses the
    checked-in public corpus shape.
  - Production dehack: removed the unused no-op `dealloc_obj()` scaffold from
    `js/mklev.js`; no static call sites remained.
  - Harness truth: `scripts/parity-state.mjs` discovers leaderboard data URLs
    from `/leaderboard/` and `/`, keeps the known JSON candidates, retries
    transient Node fetch/DNS failures, and can fall back to `curl -L`; default
    inferred team `Hoimar` now fetches from
    `https://mazesofmenace.ai/leaderboard/data.json` instead of reporting
    endpoint failure.
  - Harness truth: `scripts/fetch-live-public-sessions.mjs` uses the same
    retry plus `curl -L` fallback shape for hosted public session pulls.
  - Production dehack: `newgame()` no longer installs a hardcoded branch/dungeon
    fallback after `init_dungeons()`; branch predicates and stair direction now
    rely on generated dungeon topology (`C refs: dungeon.c:init_dungeons()`,
    `mklev.c:place_branch()`).
  - Durable feature-map truth: branch entrance placement now records generated
    `end1_up` topology from `init_dungeons()` instead of the retired seed8000
    startup fallback.
  - Durable feature-map truth: monster/object-fill now records live startup
    state instead of startup fast-forward scaffolds and replaces stale partial
    `seed0383`/`seed5002` evidence with current exact-session evidence.
  - Durable feature-map truth: current moveloop/monster-movement rows no longer
    describe per-step fast-forward stubs as active and now record the current
    exact `seed0383` evidence instead of the old partial score.
  - Durable feature-map truth: current message, menu, and help/look rows now
    describe active or latched More, tty-window/menu, and lookup-window state
    rather than "active override" wording; dated historical dehack entries
    remain intact.
  - Durable memory truth: remaining current-guidance `lessons.md` references to
    menu/prompt/spell/help "override" handling now use active tty-window,
    prompt, More, or stored active-screen wording; historical evidence rows
    remain intact.
  - Durable memory truth: top-level `lessons.md` UI guidance now marks generic
    `_override_screen` menu/page handling as historical and points agents at
    named active tty-window/menu, terminal-exit, prompt, or latched-More state
    with stored cursor ownership.
  - Harness/doc truth: `feature_map.md` now records that tracked reusable
    `scratch/*trace*.mjs` and `scratch/*loader.mjs` files are agent-toolkit
    diagnostics; one-off probes should stay temporary or untracked.
  - Previous harness truth: `scripts/hack-debt-audit.mjs` suppresses two exact
    API-comment false positives in frozen `js/storage.js` and `js/terminal.js`
    while continuing to scan real hard/debug/frozen-import debt.
  - Previous production truth remains the Juiblex named-level topology
    predicate cleanup (`C refs: dungeon.c:level_map[]`,
    `include/dungeon.h:Is_juiblex_level()`).
  - Hack audit is clean:
    `hard=0 suspicious=0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Checked-in public corpus exact:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Cached hosted public corpus exact:
    `44/44 S 10982/10982 R 840358/840358 C 0`; still classified as
    `public-session-drift` because 30 hosted session files differ from
    checked-in sessions, with exact score delta.
  - Maintenance checks: `hack:audit` is `hard=0 suspicious=0`,
    `memory:lint ok`, regenerated divergence inventory is one passing bucket
    with no live blockers.
  - Regression classification: none. Checked-in public, hosted public, target,
    and strict sentinels are exact. Leaderboard fetch succeeds; default inferred
    team `Hoimar` currently differs from hosted public score evidence and has
    held-out gaps, so leaderboard remains deploy/lag evidence rather than a
    local parity blocker.
  - Global next-step check: active queue is empty; use regenerated
    divergence-inventory buckets for the next live target. Broad startup,
    role, or display TODOs need fresh failing evidence before implementation.

- Older checkpoint history lives in git, `feature_map.md`, and `lessons.md`;
  keep this file focused on the active loop state and next queue.
