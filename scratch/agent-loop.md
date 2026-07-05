# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`; use `agent:brief` Branch/status for
  live ahead/behind state.
- Latest verified repair units: runtime shapechange side effects, checked-in
  help pager data, deterministic inventory ordering, scoreboard diagnostics,
  online-viewer advisory reporting, and false-positive scorer audits.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch succeeds from `https://mazesofmenace.ai/leaderboard/data.json`.
  Default inferred team `Hoimar` currently classifies as
  `leaderboard-lag-after-persistent-drift`: leaderboard public
  `31/44 S 11351/11405 R 792838/792838`, scored at
  `2026-07-04T22:30:17.282Z`.
- Clean-ref evidence scores `origin/main`/`HEAD` at
  `44/44 S 11405/11405 R 792838/792838`; the leaderboard row predates latest
  Actions but recent history was already persistently below local.
- Online failure signature is screen-only: 13 failed public sessions, 54
  missed screens, full RNG and RNG-step match for all 13; cell-only metrics
  equal the combined screen score on all 13, so the online misses are cell-grid
  misses rather than cursor-only misses.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard fetch works, but the online row is still below all reproduced
  scorer surfaces. Visual surfaces, official browser replay, public `/play`
  assets, and GitHub Actions pass; `score:ref-history` found no exact stale-ref
  fingerprint across 46 recent commits back to `6864a80`. The current
  false-positive audit also rejects broad local visual-comparator strictness as
  the full explanation: the 13 online-failed sessions have 8112 locally accepted
  non-exact terminal/string frames while the online row misses only 54 screens,
  and all 44 public sessions have accepted non-exact frames. Competitor controls
  now show two online-44 repos (`kevinjosethomas`, `serteal`) have exact
  terminal/string output for all public frames, while `xeophon` has many
  accepted non-exact frames but zero DEC accepted frames and matches its
  online/local 43/44 shape. The current narrower suspect is Hoimar's DEC/Unicode
  accepted frame subset, not a generic scorer outage. `score:false-positive-audit`
  now supports `--samples N --sample-class <class> --sample-per-session`;
  current DEC samples show Unicode box glyphs (`┌`, `│`) versus canonical raw
  DEC chars (`l`, `x`) with `decgfx=1`, while string-only samples are mostly
  cursor-forward compression differences.

## Latest Loop Checkpoint

- Latest verified checkpoint on 2026-07-04:
  - Production truth: runtime shapechange now mirrors upstream armor/body side
    effects closely enough for local public parity, including gear checks after
    shapechange and deterministic pronoun/RNG behavior on armor destruction
    (`C refs: polyself.c:rehumanize()`, `polyself.c:break_armor()`,
    `do_wear.c:Armor_gone()`).
  - Production truth: inventory and loot ordering now use byte-style ASCII
    comparison instead of host ICU collation, matching C `strcmp()` ordering and
    avoiding runtime-locale display drift.
  - Data truth: generated help pager data is checked in, so clean checkouts no
    longer depend on a local untracked helper output for the public corpus.
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
    comparator policies. Current `30/44` evidence: current visual/space-neutral
    policies miss `0` screens, space-color/strict-display policies miss `5754`,
    and raw DEC strictness misses `7992`; none reproduce the online `57`.
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
    `seed0002`, `seed0030`, `seed0399`, `seed2200`, and `seed4500`;
    `hack:audit` stayed `hard=0 suspicious=0`; `memory:lint ok`.
  - Regression classification: none on checked-in public, hosted public,
    focused targets, strict sentinels, and the visual scorer surface for the
    current failed leaderboard set. The current official leaderboard row is
    lag layered over persistent scorer drift rather than local parity drift.
  - Global next-step check: active public queue is empty. Deployed
    `frozen/screen-decode.mjs`, recent frozen runner refs, recent clean code
    refs, saved online snapshots, and historical session refs do not fingerprint
    the online row. Current escalation packet:
    `scratch/scoreboard-divergence-escalation-2026-07-04.md`.
