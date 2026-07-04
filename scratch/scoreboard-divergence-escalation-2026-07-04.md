# Scoreboard Divergence Escalation - 2026-07-04

## Current status

The public leaderboard still reports Hoimar at `30/44 S 11348/11405
R 792838/792838`, last scored `2026-07-04T16:33:38.346Z`.

The current local checkout is `4d04ea0` and is harness-only ahead of
`origin/main` by three commits. The pushed clean ref `origin/main` is
`dfea935`.

Current verified local surfaces:

- checked-in public corpus: `44/44 S 11405/11405 R 792838/792838 C 0`;
- hosted public corpus: `44/44 S 10982/10982 R 840358/840358 C 0`;
- strict sentinel suite: `5/5 S 1063/1063 R 64569/64569 C 0`;
- latest GitHub Score artifact for `dfea935`: `44/44 S 11405/11405`;
- public `/play/Hoimar/js/` mirror: 38/38 files match checked-in JS and scores
  `44/44`.

## Current online failure signature

From `.cache/leaderboard-data.json` saved by `npm run scoreboard:state`:

```text
seed0002-healer-reflection-drummer  -4
seed0004-feeding-pony               -4
seed0007-rogue-snake-swamp          -2
seed0012-monk-vault-escort          -1
seed0014-dequa-fountain-explore     -6
seed0030-ten-diverse-deaths         -4
seed0360-wizard-world-tour          -7
seed0361-archeologist-tour          -1
seed0373-barbarian-quest-tour       -1
seed0383-wizard-hallucinate         -2
seed0399-wizard-hallu-actions       -9
seed2200-wizard-quaff-zap-read      -4
seed2600-wizard-custom-binds        -1
seed4500-knight-coverage           -11
```

Aggregate: `14` failed public sessions, `57` missed screens, full RNG and
RNG-step match on all 14, full cursor match on all 14, and
`cellsOnly.matched == screen.matched` on all 14. The row is a sparse cell-grid
miss signature, not cursor-only drift or RNG drift.

## Reproduction attempts that do not match

These commands were run against the current saved row unless noted otherwise:

```bash
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json --full
npm run score:false-positive-audit -- --leaderboard-json .cache/leaderboard-data.json --limit=3
npm run score:browser -- --leaderboard-json .cache/leaderboard-data.json --mode both --full --timeout-ms 240000
npm run score:browser -- --leaderboard-json .cache/leaderboard-data.json --mode official --shared-page --full --timeout-ms 240000
npm run score:play-assets -- --score --leaderboard-json .cache/leaderboard-data.json
npm run score:storage-scope -- --leaderboard-json .cache/leaderboard-data.json --full
node scripts/score-surfaces.mjs --leaderboard-json .cache/leaderboard-data.json --permission --full
env LC_ALL=C LANG=C TZ=UTC node scripts/score-surfaces.mjs --leaderboard-json .cache/leaderboard-data.json --full
npm run score:ref-history -- --leaderboard-json .cache/leaderboard-data.json --limit=80 --per-ref-timeout-ms=120000 --max-runtime-ms=600000 --full
npm run score:ref-history -- --leaderboard-json .cache/leaderboard-history/2026-07-02T07-45-44-140Z.json --limit=55 --per-ref-timeout-ms=120000 --max-runtime-ms=480000
npm run score:ref -- --session-ref ba8547e --timeout-ms 120000 HEAD
npm run score:ref -- --session-ref 52960eb --timeout-ms 120000 HEAD
npm run score:ref -- --session-ref a12475b --timeout-ms 120000 HEAD
npm run score:ref -- --session-ref 9a070a2 --timeout-ms 120000 HEAD
npm run score:ref -- --runner-ref 04fe7c2 --timeout-ms 120000 HEAD
```

Observed results:

- current visual scorer surfaces pass the 14 online-failed sessions exactly;
- Node permission-sandbox and `LC_ALL=C LANG=C TZ=UTC` also pass visually;
- false-positive comparator variants miss either `0`, `5754`, or `7992`
  screens, never the online `57`;
- official browser path passes `14/14`;
- viewer browser path fails only `seed4500` with RNG/cursor drift;
- one-process storage/shared-page probes fail only `seed0360` and `seed4500`
  with RNG/cursor drift;
- recent clean refs have no exact stale-code match; the best historical plateau
  is one local failed session and `+3` screens versus the online row, not the
  online all-failed sparse signature;
- historical session refs do not match; the only same-total session ref scores
  `44/44`;
- deployed `/frozen/screen-decode.mjs` matches local content; public
  `mazesofmenace` exposes only the static-site decoder, not the judge backend
  scorer script.

## History volatility

`npm run score:online-history` over saved snapshots shows the online row is not
stable:

- `2026-07-02T05:31:56.208Z`: `29/44 S 11295/11405`, 15 failures, 110 misses;
- `2026-07-02T07:22:17.569Z`: `29/44 S 11348/11405`, 15 failures, 57 misses;
- `2026-07-02T12:52:37.197Z`: `29/44 S 11344/11405`, 15 failures, 61 misses;
- `2026-07-04T07:13:46.843Z`: `29/44 S 11346/11405`, 15 failures, 59 misses;
- `2026-07-04T16:33:38.346Z`: `30/44 S 11348/11405`, 14 failures, 57 misses.

Volatile sessions include `seed2200`, which changed from `55` missed screens to
`1`, `4`, `3`, and `4`, plus `seed0116`/`seed0367` disappearing and `seed2600`
appearing. The volatility points away from a stable local comparator
false-positive class or a simple pinned historical code ref.

## Conclusion

The strongest current root cause is an unpublished online scorer/deployment
path mismatch. The available public and repo-side surfaces do not reproduce the
leaderboard row, and multiple independent probes rule out local gameplay drift,
known visual false positives, stale `/play` assets, stale public sessions,
recent stale code refs, stale frozen runner refs, stale canonical sessions,
browser runtime differences, permission sandbox differences, locale/timezone
differences, and same-process storage/module leakage.

Do not patch production `js/` output to chase this row. There is no local
first mismatch and the online row lacks the screen-index/content evidence needed
for a subsystem parity fix.

## Backend evidence needed

To identify the server-side line, the public scorer needs at least one of:

- scored commit SHA and tree hash for each leaderboard run;
- frozen scorer hash or scorer image/tag;
- canonical session bundle hash;
- first mismatching screen index and a compact diff for each failed session;
- raw score artifact for the leaderboard run;
- whether leaderboard scoring consumes GitHub Actions artifacts or runs an
  independent checkout.

Until one of those is available or the online row updates to match the current
artifact, the repo-side action is limited to preserving diagnostic visibility.
