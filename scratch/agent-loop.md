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
  help pager data, scorer-drift diagnostics, and deterministic inventory sort
  ordering, plus scoreboard clean-ref aliases and corpus-triage cleanup.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch succeeds from `https://mazesofmenace.ai/leaderboard/data.json`.
  Default inferred team `Hoimar` currently classifies as
  `persistent-scorer-drift`: leaderboard public
  `29/44 S 11295/11405 R 792838/792838`, scored at
  `2026-07-02T05:31:56.208Z`.
- Clean-ref evidence rules out simple origin lag: `origin/main` at `f3d982e`
  scores `44/44 S 11405/11405 R 792838/792838` locally, while the later
  official leaderboard row is still `29/44`.
- Online failure signature is screen-only: 15 failed public sessions, 110
  missed screens, full RNG and RNG-step match for all 15; cell-only metrics
  equal the combined screen score on all 15, so the online misses are cell-grid
  misses rather than cursor-only misses.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard fetch works, but default inferred team `Hoimar` differs from all
  locally reproduced scorer surfaces and remains official scorer-path drift.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit is clean: `hard=0 suspicious=0`. Production `js/` has no
  intentional debug I/O or imports from `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-07-02:
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
  - Harness truth: `scripts/play-assets-state.mjs --score` fetches `/play`
    assets into a temporary checkout and scores them; current Hoimar assets
    score `43/44`, failing only `seed2200`, so stale play assets do not explain
    the official `29/44` row.
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
    exact on the 15 online-failed public seeds, so missing time/version
    normalization and basic Node permission effects do not reproduce the
    leaderboard row.
  - Harness truth: `scoreboard:state`/`scoreboard:json` now pass
    `--score-upstream`, resolving the configured upstream ref before scoring a
    clean `/tmp` checkout. The leaderboard report now names `origin/main`
    rather than Git's `@{u}` shorthand while preserving explicit
    `--score-ref <ref>` for non-upstream comparisons.
    The aliases also save both `.cache/leaderboard-data.json` and a
    timestamped `.cache/leaderboard-history/*.json` snapshot so current and
    historic online rows remain replayable after the live endpoint moves.
  - Harness truth: `scripts/leaderboard-lib.mjs` owns shared leaderboard
    fetch/team/session parsing and failed-session target expansion.
    `npm run score:leaderboard-failures` now runs
    score-surface probes on the current failed public leaderboard sessions
    without manually copying seed names; the latest run selected 15 Hoimar
    failures and all visual variants passed `15/15 S 8850/8850 R 646394/646394`.
    `parity:state` and the same failure probe can now take
    `--leaderboard-json <file>` to replay a saved or historic leaderboard
    snapshot when the live endpoint has moved or fetch access is unavailable.
    The `scoreboard:*` aliases save their classified raw leaderboard payload to
    `.cache/leaderboard-data.json` for repeatable follow-up probes.
    Worker process failures now make `score-surfaces` exit non-zero, so
    sandbox/runner failures cannot masquerade as scorer mismatches.
  - Harness dehack: `triage-corpus` no longer carries stale hardcoded known
    blocker sessions. Bucket hypotheses now come from the live first-mismatch
    shape, and the generated divergence inventory stays a single exact public
    bucket.
  - Production determinism: inventory-letter range helpers now call the same
    explicit ASCII comparator as broader inventory and loot ordering.
  - External scorer evidence: GitHub Actions artifact for pushed `f3ae03f`
    scored `43/44`, only `seed2200`, matching local clean-ref scoring. The
    official leaderboard later scored the same public corpus shape at `29/44`,
    so this is not explained by local commits merely being ahead of origin.
  - Verification: checked-in public corpus exact
    `44/44 S 11405/11405 R 792838/792838 C 0`; strict sentinel exact
    `5/5 S 1063/1063 R 64569/64569 C 0`; focused verification stayed exact for
    `seed0002`, `seed0030`, `seed0399`, `seed2200`, and `seed4500`;
    `hack:audit` stayed `hard=0 suspicious=0`; `memory:lint ok`.
  - Regression classification: none on checked-in public, hosted public,
    focused targets, and strict sentinels. Official leaderboard remains a
    separate scorer-path drift with full RNG parity but screen misses.
  - Global next-step check: active public queue is empty. To test scoreboard
    motion, push the local commits to `origin/main` only after explicit user
    approval, then wait for/rescore the online row. Without push approval,
    continue local held-out-risk cleanup and scorer-surface reduction from fresh
    evidence rather than adding seed-specific behavior.

- Older checkpoint history lives in git, `feature_map.md`, and `lessons.md`;
  keep this file focused on the active loop state and next queue.
