# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md`
(avoid full reads per `AGENTS.md`), and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`; use `agent:brief` Branch/status for
  live ahead/behind state.
- Latest verified repair units: runtime shapechange side effects, checked-in
  help data, deterministic inventory ordering, scoreboard diagnostics,
  false-positive audits, DECgraphics metadata, darkroom wire color, and active
  tty-screen blank-run serialization.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch succeeds from `https://mazesofmenace.ai/leaderboard/data.json`.
  Default inferred team `Hoimar` most recently classified as
  `local-dirty-or-unpushed`: leaderboard public
  `31/44 S 11351/11405 R 792838/792838`, scored at
  `2026-07-04T22:30:17.282Z`, before the current local-ahead scorer repairs.
- Clean-ref `origin/main`/`HEAD` scores `44/44 S 11405/11405 R 792838/792838`;
  recent leaderboard history was persistently below local.
- Online failure signature is screen-only: 13 failed public sessions, 54
  missed screens, full RNG and RNG-step match for all 13; cell-only metrics
  equal the combined screen score on all 13, so the online misses are cell-grid
  misses rather than cursor-only misses.
- Strict sentinels are exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard fetch works, but the online row is still below reproduced scorer
  surfaces. Browser replay, `/play` assets, Actions, and ref-history do not
  fingerprint the row. Competitor controls showed online-44 repos have exact
  strings; Hoimar's DEC/Unicode, invisible-space, darkroom wire-color, SGR, and
  tty padding classes are now repaired. Current storage-aware audit: local visual
  `44/44`, `invisibleSgr=0`, DEC `0`, cell variants miss `0`, exact-string form
  misses `101` full-public frames (`48` on the online-failed subset).

## Latest Loop Checkpoint

- Latest verified checkpoint on 2026-07-04:
  - Production/data truth: recent verified public-parity repairs include
    shapechange armor/body side effects, byte-style inventory/loot ordering, and
    checked-in generated help pager data.
  - Harness truth: `scripts/parity-state.mjs` classifies persistent official
    scorer drift against a clean ref, reports online failure signatures, and
    compares leaderboard rows with checked-in, hosted, and clean-ref public
    surfaces.
  - Harness truth: `scripts/score-ref.mjs` can score clean code refs with
    frozen overlay, alternate session refs, and alternate runner refs.
  - Harness truth: `scripts/score-ref-history.mjs` ranks recent clean refs
    against the saved failed leaderboard subset. It now reports elapsed time and
    supports bounded large scans with per-ref and overall runtime limits.
  - Harness truth: `scripts/play-assets-state.mjs --score` fetches `/play`
    assets into a temporary checkout and scores them. Current Hoimar assets are
    fully synchronized and score `44/44`, so stale play assets no longer explain
    the official `30/44` row. Against the saved leaderboard snapshot, play
    assets are `+14` sessions and `+57` screens above the online row; pass
    `--leaderboard-json <file>` to print the saved-snapshot delta.
  - Harness truth: `scripts/browser-score.mjs` defaults to the official browser
    path and isolates multi-session runs because shared-page module state caused
    false browser-only RNG drift in long sessions; use `--shared-page` only to
    probe leakage.
    It also accepts `--leaderboard-failures`/`--leaderboard-json <file>` so
    browser probes can reuse the current failed leaderboard session set.
  - Harness truth: `scripts/score-storage-scope.mjs` is a one-JS-module-process
    storage/module leakage probe, not an official scorer replica. It accepts
    `--leaderboard-failures`/`--leaderboard-json <file>` so leakage probes use
    the same failed-session set as the current online row.
  - Harness truth: `scripts/score-surfaces.mjs` now has visual-normalization
    variants and a Node permission-sandbox mode. All visual variants remain
    exact on the 14 online-failed public seeds, so missing time/version
    normalization and basic Node permission effects do not reproduce the
    leaderboard row. When driven by leaderboard failures, it now prints the
    official failed-session reference and each local surface minus that row.
  - Harness truth: `scripts/score-false-positive-audit.mjs` now ranks narrow
    comparator policies. Current evidence after DEC/cursor/darkroom and active
    tty-screen repairs: all cell-state variants miss `0`; exact string form
    still differs on `101` checked-in public frames (`48` on the online-failed
    subset) and is broader than the online sparse miss shape.
  - Production truth: terminal cells can now carry raw DECgraphics payload
    metadata while retaining Unicode browser display. The base serializer emits
    SO/SI around marked cells, active serialized text screens remain the outer
    capture override, and `renderTextScreen()` preserves DEC metadata when
    round-tripping stored tty screens. DECgraphics liquid, tree, iron-bars,
    altars, loot-menu frames, and swallowed-frame payloads are marked from
    `dat/symbols`; the terminal-grid serializer compresses internal uniform
    blank runs longer than four cells with `ESC[nC`, preserves unseen room
    `S_darkroom` as bright-black `ESC[90m`, emits single-purpose SGR
    transitions, and skips only blanks with no visible inverse/underline
    pixels. `docrt()` and magic mapping now apply C's out-of-sight ROOM
    `S_darkroom` memory correction without darkening visible corridors.
    `#wipe` now uses blindness-toggle vision redraw instead of stale-memory
    `docrt()`, making `seed0108` exact-string clean. Sokoban premapped traps
    now use C trap colors, and stale DEC room-floor grid cells serialize as
    `S_darkroom` when their map cell is out-of-sight `ROOM`. Active help,
    enhance, and intrinsic screens use cursor-forward padding for long default
    blank runs and trim compact final help pages after their More row.
  - Harness truth: `scoreboard:state`/`scoreboard:json` now pass
    `--score-upstream --score-actions`, save `.cache/leaderboard-data.json` and
    `.cache/leaderboard-history/*.json`, and route next-action text through
    online-viewer/history/false-positive probes before backend escalation.
  - Harness truth: `scripts/leaderboard-lib.mjs` owns shared leaderboard
    fetch/team/session parsing and failed-session target expansion.
    `npm run score:leaderboard-failures` runs score-surface probes on the
    current failed public leaderboard sessions without manual seed copying.
    `score:online-history` summarizes saved per-session failure volatility.
    `parity:state` and failure probes take `--leaderboard-json <file>` for
    repeatable saved/historic snapshot follow-up.
    Worker process failures now make `score-surfaces` exit non-zero, so
    sandbox/runner failures cannot masquerade as scorer mismatches. The shared
    leaderboard parser preserves explicit cursor totals from `data.json`
    alongside cells/RNG for surface-reference comparisons.
  - External scorer evidence: latest successful public GitHub Actions Score run
    still parses the uploaded `score-summary.json` as `44/44 S 11405/11405`;
    the live leaderboard row remains below that artifact.
  - Verification: checked-in public corpus exact
    `44/44 S 11405/11405 R 792838/792838 C 0`; strict sentinel exact
    `5/5 S 1063/1063 R 64569/64569 C 0`; focused verification stayed exact for
    `seed0007`, `seed0012`, `seed0360`, `seed0361`, `seed0373`, `seed0900`,
    `seed2200`, and `seed4500`; `hack:audit` stayed `hard=0 suspicious=0`;
    `memory:lint ok`.
  - Regression classification: none on checked-in public, hosted public,
    focused targets, strict sentinels, and the visual scorer surface for the
    current failed leaderboard set. The current official leaderboard row is
    lag layered over persistent scorer drift rather than local parity drift.
  - Global next-step check: active public queue is empty. Deployed
    `frozen/screen-decode.mjs`, recent frozen runner refs, recent clean code
    refs, saved online snapshots, and historical session refs do not fingerprint
    the online row. Current escalation packet:
    `scratch/scoreboard-divergence-escalation-2026-07-04.md`.
