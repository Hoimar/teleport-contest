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
- Latest verified repair unit: live `seed0360` monster/topline and display
  completion (`ba366fe`).
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch still fails from all known endpoints.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard state remains unknown because endpoint fetches failed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=2`. Production `js/` has no intentional
  debug I/O or imports from `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-28:
  - Live `.cache` `seed0360-wizard-world-tour` is exact:
    `S 618/618 R 133910/133910 C 0`.
  - Checked-in `seed0360-wizard-world-tour` remains exact:
    `S 833/833 R 120639/120639 C 0`.
  - Focused guards remain exact: `seed0012-monk-vault-escort`
    (`S 308/308 R 13878/13878 C 0`), `seed0373-barbarian-quest-tour`
    (`S 124/124 R 35386/35386 C 0`), `seed0399-wizard-hallu-actions`
    (`S 532/532 R 11409/11409 C 0`), and `seed4500-knight-coverage`
    (`S 1814/1814 R 108275/108275 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Checked-in public corpus exact via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Hosted public corpus exact after `npm run score:live-public`:
    `44/44 S 10982/10982 R 840358/840358 C 0`.
  - `parity:state -- --refresh-live` classifies checked-in versus hosted as
    `public-session-drift` only because 30 session files differ; local and
    hosted score deltas are exact.
  - Implementation truth:
    - `artifact.c:artifact_hit()` lines can own a topline More that blocks the
      next command key. After dismissal, JS replays the saved key through
      ordinary `rhack()` dispatch.
    - Artifact-owned deferred monster physical hits can promote the waiting
      hit line into the active More with stored damage already reflected in
      status; when no attack rows remain, the monster scan continues behind
      that More.
    - Duplicate displaced-image `wildmiss()` output prompts on the current
      identical topline rather than queuing a second after-More copy.
    - Travel getpos describes a recorded blank `STONE`/`SCORR` display glyph as
      `stone (no travel path)` while unrecorded raw stone remains unexplored.
    - `display.h:_mon_visible()` is not a terrain filter. Visible vault guards
      can draw on temporary stone/fake-corridor cells; the Air/CLOUD vortex
      clear-path check remains a scoped display exception for current evidence.
  - Regression classification: none. Checked-in public, hosted public, and
    strict sentinels are exact. Leaderboard remains unknown because endpoint
    fetches failed.
  - Verification covered `verify --target .cache/live-sessions/seed0360...`,
    focused guards (`seed0012`, `seed0373`, `seed0399`, `seed4500`), strict
    sentinels, `hack:audit`, `memory:lint`, full checked-in public,
    live-hosted public, and `parity:state -- --refresh-live`.
  - Global next-step check:
    - `agent:brief --target next-frontier`: queue empty.
    - `node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md`:
      all 44 checked-in sessions are passing; no failing bucket.
    - `hack:audit`: only the known suspicious comments in files that AGENTS.md
      forbids modifying (`js/storage.js`, `js/terminal.js`).
    - `docs/agent/roles.md`: dehacker/simplifier has no scoped safe target
      because visible audit debt is in never-modify files and no mismatch
      bucket exposes a subsystem owner.
  - Stop condition: no safe structural next step exists after checking queue,
    feature map, visible hack debt, divergence inventory, and role runbooks.

- Older checkpoint history lives in git, `feature_map.md`, and `lessons.md`;
  keep this file focused on the active loop state and next queue.
