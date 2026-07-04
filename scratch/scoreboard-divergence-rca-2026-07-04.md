# Scoreboard Divergence RCA - 2026-07-04

## Executive Summary

The public leaderboard divergence is real and reproducible as a scorer-surface
split:

- Current pushed `origin/main` (`529ca23`) scores exact locally:
  `44/44 S 11405/11405 R 792838/792838 C 0`.
- GitHub Score artifact #123 for the same commit also scores exact:
  `44/44 S 11405/11405 R 792838/792838`.
- The public `/play/Hoimar/js/` mirror matches checked-in JS assets and scores
  exact: `44/44 S 11405/11405 R 792838/792838`.
- Offline headless Chromium in the official browser path scores the current
  failed leaderboard subset exact: `15/15 S 8796/8796 R 637545/637545`.
- The live leaderboard row remains `29/44 S 11346/11405 R 792838/792838`.

Root cause, as far as we can prove from repo-accessible evidence: the
leaderboard backend is not scoring through the same effective surface as local
`frozen/ps_test_runner.mjs`, GitHub Actions Score, the public `/play` asset
mirror, or the offline official browser runner. The mismatch is isolated to the
public leaderboard scorer/deployment/data pipeline.

The exact server-side sub-cause cannot be named from this repo alone because
the public leaderboard does not expose the scored commit SHA, the runner
artifact, or first differing screen payloads. The strongest likely class is a
leaderboard-only screen rendering/canonicalization or stale runner/deployment
path: RNG and cursors are exact, while a small number of cell-grid screens miss.

## Current Live Reproduction

Command:

```bash
npm run scoreboard:state
```

Evidence from 2026-07-04T14:49Z:

- commit: `529ca23`
- branch: `main -> origin/main`, ahead 0, behind 0
- checked-in public: `44/44 S 11405/11405 R 792838/792838 C 0`
- cached hosted public: `44/44 S 10982/10982 R 840358/840358 C 0`
- strict sentinels: `5/5 S 1063/1063 R 64569/64569 C 0`
- leaderboard class: `leaderboard-lag-after-persistent-drift`
- leaderboard public: `29/44 S 11346/11405 R 792838/792838`
- leaderboard lastScored: `2026-07-04T07:13:46.843Z`
- latest successful GitHub Score: #123 for `529ca23`, updated
  `2026-07-04T14:47:58Z`

The current leaderboard row predates #123, but the longer history rules out
"latest push has not been scored yet" as the whole explanation.

## Persistent History Evidence

GitHub Actions Score #118:

- run: #118, `3540d42`, updated `2026-07-02T15:59:09Z`
- downloaded artifact: `score-results`
- artifact summary: `44/44 S 11405/11405 R 792838/792838`

Leaderboard rows after #118:

- 20 rows from `2026-07-02T16:47:39.541Z` through
  `2026-07-04T07:13:46.843Z`
- passing range: `27..31`
- point range: `11344..11353 / 11405`
- latest row: `29/44 S 11346/11405`

Full team history in the cached row:

- 200 comparable rows from `2026-06-10T17:19:10.612Z` through
  `2026-07-04T07:13:46.843Z`
- passing range: `27..33`
- passing histogram: `27:7`, `28:28`, `29:74`, `30:73`, `31:13`,
  `32:2`, `33:3`

This is a persistent plateau around 30/44, not a transient local-ahead state.

## Online Failure Shape

The leaderboard failed sessions are:

```text
seed0002  -4 screens
seed0004  -4 screens
seed0007  -3 screens
seed0009  -1 screen
seed0012  -1 screen
seed0014  -7 screens
seed0030  -4 screens
seed0360  -7 screens
seed0361  -1 screen
seed0367  -1 screen
seed0373  -1 screen
seed0383  -2 screens
seed0399  -9 screens
seed2200  -3 screens
seed4500 -11 screens
```

Aggregate failed subset:

- leaderboard reference: `0/15 S 8737/8796 cells 8737/8796 cursors 8796/8796 R 637545/637545`
- local/current same subset: `15/15 S 8796/8796 cells 8796/8796 cursors 8796/8796 R 637545/637545`

Interpretation:

- RNG is exact for every failed session.
- Cursor totals are exact for every failed session.
- `cellsOnly` equals combined screen score, so the misses are real cell-grid
  differences, not cursor-only errors.
- The misses are sparse: 59 cell-grid screens out of 8796 in the failed subset.

That points away from game-state/RNG parity and toward a screen serialization,
rendering, normalization, stale-runner, or deployment-specific scorer path.

## Surfaces Tested

### Local Frozen Scorer

Command:

```bash
npm run scoreboard:state
```

Result:

- checked-in public exact: `44/44 S 11405/11405 R 792838/792838`
- clean ref `origin/main` exact: `44/44 S 11405/11405`

Conclusion: current local code and clean pushed ref do not reproduce the
leaderboard misses.

### GitHub Actions Score Artifacts

Commands:

```bash
gh run download 28709753266 -R Hoimar/teleport-contest -n score-results -D /tmp/tc-score-artifact-529ca23
gh run download 28603773306 -R Hoimar/teleport-contest -n score-results -D /tmp/tc-score-artifact-3540d42
```

Results:

- #123 (`529ca23`, 2026-07-04): `44/44 S 11405/11405 R 792838/792838`
- #118 (`3540d42`, 2026-07-02): `44/44 S 11405/11405 R 792838/792838`

Conclusion: GitHub Actions Score artifacts are exact. The public leaderboard
does not match the GitHub Score artifact contents.

### Public `/play` Assets

Command:

```bash
npm run score:play-assets -- --score --leaderboard-json .cache/leaderboard-data.json
```

Result:

- `38/38` JS assets match checked-in files
- play-asset score: `44/44 S 11405/11405 R 792838/792838 C 0`
- play assets minus leaderboard: `+15` exact sessions, `+59` screens
- failed-session overlap with leaderboard: `0`

Conclusion: stale public `/play` assets do not explain the leaderboard row.

### Offline Headless Browser

Command:

```bash
npm run score:browser -- --leaderboard-json .cache/leaderboard-data.json --mode both --full --timeout-ms 240000
```

Result:

- official browser path: `15/15 S 8796/8796 R 637545/637545`
- viewer path: `14/15 S 7324/8796 R 557656/637545`
- viewer failure: only `seed4500`, with RNG drift

Conclusion: the official browser surface is exact and does not reproduce the
online row. The viewer path has a known non-official failure shape, but it does
not match the leaderboard: online has 15 screen-only failures with exact RNG.

### Local Surface Comparators

Command:

```bash
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json
```

Result:

- visual: `15/15 S 8796/8796 R 637545/637545`
- visual-no-normalize: `15/15 S 8796/8796 R 637545/637545`
- visual-no-time-normalize: `15/15 S 8796/8796 R 637545/637545`
- visual-no-version-normalize: `15/15 S 8796/8796 R 637545/637545`
- strict-display, strict-terminal, legacy-string, and raw-string all fail far
  more screens than the leaderboard row

Conclusion: the leaderboard is not explained by our known local comparator
variants. It is close to the visual scorer, but misses 59 additional cell-grid
screens that local visual scoring accepts.

### Node Permission Sandbox

Command:

```bash
npm run score:surfaces -- --permission --leaderboard-json .cache/leaderboard-data.json --full
```

Result:

- visual variants remain exact `15/15 S 8796/8796 R 637545/637545`
- strict/raw diagnostic variants fail far more than leaderboard

Conclusion: Node permission constraints do not reproduce the online row.

### One-Process Storage/Module Leakage

Command:

```bash
npm run score:storage-scope -- --leaderboard-json .cache/leaderboard-data.json --full
```

Result:

- storage scope session/run: `13/15`
- failures: `seed0360`, `seed4500`
- failure shape includes RNG drift:
  `R 471318/637545`

Conclusion: same-process storage/module leakage is a real diagnostic failure
mode, but it does not match the online row. Online has 15 failed sessions with
full RNG and full cursor totals.

### Stale Ref Fingerprint

Command:

```bash
npm run score:ref-history -- --leaderboard-json .cache/leaderboard-data.json --limit 12 --max-runtime-ms 150000
```

Result:

- scanned 12 recent commits from `529ca23` back to `c962efd`
- exact summary matches: `0`
- every scanned ref scores the leaderboard-failed subset exact:
  `15/15 S 8796/8796 R 637545/637545`
- every scanned ref is exactly `+15` sessions and `+59` screens above the
  leaderboard row

Conclusion: the current online row does not fingerprint a recent stale code ref
within the last 12 commits. Earlier investigation also found no exact stale-ref
match across a wider 46-commit window.

## Ruled-Out Causes

Ruled out by current evidence:

- C-to-JS gameplay/RNG drift in current checked-in public sessions.
- Hosted public session-file drift as the cause of the row. Hosted sessions
  differ from checked-in sessions, but both score exact; leaderboard max screens
  match checked-in public, not hosted public.
- Stale `/play/Hoimar/js/` deployment assets.
- Official browser runtime behavior.
- Basic Node permission sandbox behavior.
- Same-process storage/module leakage as the direct cause.
- Current GitHub Actions Score artifact contents.
- Recent stale code ref among the latest 12 commits; previous wider scan also
  found no exact stale-ref fingerprint.
- Raw, legacy, strict-terminal, or strict-display comparison surfaces. Those
  fail thousands of screens, not the leaderboard's sparse 59-screen shape.

## Most Likely Root Cause

The most likely root cause is a leaderboard-only scorer/deployment/data-path
difference, specifically in a screen-grid path rather than in game logic:

1. The leaderboard sees exact RNG and exact cursor totals.
2. The leaderboard misses only sparse cell-grid screens.
3. Local frozen scoring, clean-ref scoring, public play-asset scoring, Actions
   artifact scoring, permission sandbox scoring, and official browser scoring
   all pass.
4. The row has persisted around 27-33/44 for weeks and continued after exact
   GitHub Score artifacts.

Practical phrasing: the online leaderboard is not consuming the same effective
score artifact/screen comparator/runner deployment that we can reproduce locally
or in GitHub Actions.

## What We Still Cannot Prove From The Repo

The public leaderboard endpoint does not expose enough information to identify
the exact server-side branch:

- no scored commit SHA
- no scorer runner version/hash
- no frozen scorer hash
- no first mismatching screen index/content
- no uploaded server-side score artifact

Because of that, we can isolate the bug to the online leaderboard scorer path,
but we cannot name the exact line of server code or deployment cache from this
checkout alone.

## Recommended Next Evidence To Ask From The Scorer Owner

Ask for any one of these; each would likely close the RCA:

1. The exact commit SHA scored for the Hoimar row at
   `2026-07-04T07:13:46.843Z`.
2. The `score-summary.json` and raw `score-stdout.txt` artifact produced by the
   leaderboard backend for that row.
3. First differing screen payloads for one small failure, e.g.
   `seed0009-swimmer-mforce.session.json` with its single missed screen.
4. The frozen scorer and `js/terminal.js` hashes used by the leaderboard worker.
5. Confirmation whether the leaderboard worker consumes GitHub Actions artifacts
   or runs an independent scorer checkout.

Best first minimal ask: expose first mismatch index/content for `seed0009`.
That session has only one missed screen online, while every local surface scores
it exact.

## Current Operator Guidance

Until the server-side scorer path is inspectable, the local loop should treat
the public leaderboard as lagging/externally divergent evidence, not as a C-to-JS
parity target:

```bash
npm run scoreboard:state
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json
npm run score:browser -- --leaderboard-json .cache/leaderboard-data.json --mode both --full
npm run score:play-assets -- --score --leaderboard-json .cache/leaderboard-data.json
npm run score:ref-history -- --leaderboard-json .cache/leaderboard-data.json --limit 12 --max-runtime-ms 150000
```

The actionable repo-side work is now harness visibility, not seed-specific
gameplay edits. Do not hardcode or alter production output to chase the public
row without a reproduced local first-mismatch screen.
