# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md`
(avoid full reads per `AGENTS.md`), and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch: `main`; use `agent:brief` Branch/status for live ref state.
- Latest verified repair units: runtime shapechange side effects, checked-in
  help data, deterministic inventory ordering, scoreboard diagnostics,
  false-positive audits, DECgraphics metadata, darkroom wire color, active
  tty-screen blank-run serialization, stored terminal-cell color, top-ten
  trailing-row trimming, vault vision-topology refresh, terrain-view
  darkroom normalization, and save-exit row trimming.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`; it is `public-session-drift`
  only because 30 hosted session files differ while both surfaces are exact.
- Leaderboard fetch succeeds from `https://mazesofmenace.ai/leaderboard/data.json`.
  Default inferred team `Hoimar` most recently classified as `heldout-only-gap`:
  leaderboard public exact `44/44 S 11405/11405 R 792838/792838`, scored at
  `2026-07-05T10:54:47.458Z`; held-out private remains `2/44`.
- Clean-ref `origin/main`/`HEAD` scores `44/44 S 11405/11405 R 792838/792838`.
- The earlier public online failure signature was screen-only cell-grid drift,
  but the current live public row no longer reproduces that plateau.
- Strict sentinels are exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in, hosted public, and leaderboard
  public corpora are exact. Competitor controls showed online-44 repos have
  exact strings; Hoimar's DEC/Unicode, invisible-space, darkroom wire-color,
  SGR, tty padding, stored-cell-color, terrain-view, and terminal-exit classes
  are now mostly repaired. Current full-public audit: local visual `44/44`,
  `invisibleSgr=0`, DEC `0`, accepted non-exact byte-string-only frames `27`,
  exact terminal/string `11378/11405`.

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
    still differs on `60` checked-in public frames (`7` on the online-failed
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
    now use C trap colors. Terminal-grid serialization now trusts stored cell
    color rather than recoloring stale cells from current map state; leading
    cursor-forward gaps preserve skipped-cell color state. Active help, enhance,
    and intrinsic screens use cursor-forward padding for long default blank
    runs and trim compact final help pages after their More row. Final top-ten
    text windows trim trailing empty rows.
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
    `seed0002`, `seed0012`, `seed0030`, `seed0360`, `seed0361`, `seed0367`,
    `seed0373`, `seed0900`, `seed2200`, and `seed4500`; `hack:audit` stayed
    `hard=0 suspicious=0`;
    `memory:lint ok`.
  - Regression classification: none on checked-in public, hosted public,
    focused targets, strict sentinels, and the visual scorer surface for the
    current failed leaderboard set. The current official leaderboard row is
    lag layered over persistent scorer drift rather than local parity drift.
  - Global next-step check: active public queue is empty. Deployed
    `frozen/screen-decode.mjs`, recent frozen runner refs, recent clean code
    refs, saved online snapshots, and historical session refs do not fingerprint
    the online row.
