# Scoreboard Divergence RCA, second pass - 2026-07-04

## Executive summary

The 30/44 plateau is still real, but it is not reproduced by any repo-side
gameplay, canonical-session, public `/play`, GitHub Actions, browser, storage,
or recent-ref scorer surface available from this checkout.

Current live evidence says:

- `HEAD` and `origin/main`: `6ca1f85`.
- Checked-in public corpus: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Cached hosted public corpus: `44/44 S 10982/10982 R 840358/840358 C 0`.
- Strict sentinels: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Online leaderboard row: `29/44 S 11346/11405 R 792838/792838`, last scored
  `2026-07-04T07:13:46.843Z`.
- Latest GitHub Score artifact for `6ca1f85`: `44/44 S 11405/11405
  R 792838/792838`, timestamp `2026-07-04T15:04:53.214Z`.

The online row is therefore a leaderboard/scorer-surface divergence, not a
local C-to-JS parity regression we can patch in production gameplay code from
available evidence.

## What the online viewer proves

`https://mazesofmenace.ai/sessions-viewer/?fork=Hoimar` loads hub mode from
`/sessions-viewer/viz.mjs`. In hub mode it:

- lists sessions from `/sessions/manifest.json`;
- imports Hoimar's deployed JS from `/play/Hoimar/js/jsmain.js`;
- reads pass/fail advisory status from `/leaderboard/data.json`.

So the viewer is insightful because its dropdown pass/fail markers are the
leaderboard's current per-session public row, not because it exposes a separate
scorer artifact. It confirms exactly which public sessions the online row marks
failed.

Current online-failed sessions:

```text
seed0002-healer-reflection-drummer.session.json  -4 screens
seed0004-feeding-pony.session.json               -4 screens
seed0007-rogue-snake-swamp.session.json          -3 screens
seed0009-swimmer-mforce.session.json             -1 screen
seed0012-monk-vault-escort.session.json          -1 screen
seed0014-dequa-fountain-explore.session.json     -7 screens
seed0030-ten-diverse-deaths.session.json         -4 screens
seed0360-wizard-world-tour.session.json          -7 screens
seed0361-archeologist-tour.session.json          -1 screen
seed0367-priest-quest-tour.session.json          -1 screen
seed0373-barbarian-quest-tour.session.json       -1 screen
seed0383-wizard-hallucinate.session.json         -2 screens
seed0399-wizard-hallu-actions.session.json       -9 screens
seed2200-wizard-quaff-zap-read.session.json      -3 screens
seed4500-knight-coverage.session.json           -11 screens
```

Aggregate online failed subset:

- leaderboard reference: `0/15 S 8737/8796 cells 8737/8796 cursors
  8796/8796 R 637545/637545`;
- all 15 have full RNG;
- all 15 have full cursor totals;
- `cellsOnly.matched == screen.matched` for all 15, so the missed screens are
  cell-grid misses, not cursor-only misses.

## Local reproduction attempts

Refreshed commands:

```bash
npm run scoreboard:state
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json --full
npm run score:browser -- --leaderboard-json .cache/leaderboard-data.json --mode both --full --timeout-ms 240000
npm run score:play-assets -- --score --leaderboard-json .cache/leaderboard-data.json
npm run score:actions:artifact
npm run score:storage-scope -- --leaderboard-json .cache/leaderboard-data.json --full
npm run score:ref-history -- --leaderboard-json .cache/leaderboard-data.json --limit 20 --max-runtime-ms 240000 --per-ref-timeout-ms 45000
node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md
```

Results:

- Visual scorer variants over the 15 online-failed sessions:
  `15/15 S 8796/8796 cells 8796/8796 cursors 8796/8796 R 637545/637545`.
- Strict/raw diagnostic comparator variants fail far more screens than the
  leaderboard row; none matches the sparse 59-screen miss shape.
- Official headless browser path:
  `15/15 S 8796/8796 cells 8796/8796 cursors 8796/8796 R 637545/637545`.
- Viewer browser path:
  `14/15`, with only `seed4500` failing and with RNG/cursor drift. This is a
  viewer-runtime issue, not the online row's 15-session screen-only signature.
- Public `/play/Hoimar/js/` assets: `38/38` files match checked-in JS and score
  `44/44 S 11405/11405 R 792838/792838`.
- GitHub Score artifact #125 for `6ca1f85`: exact `44/44`.
- Same-process storage-scope probe: `13/15`, only `seed0360` and `seed4500`
  fail, with large RNG/cursor drift. This does not match the online row.
- Recent ref-history scan: 20 recent commits all score the online-failed subset
  exact `15/15`; exact stale-ref matches: `0`.
- Corpus triage: all 44 checked-in public sessions are in one passing bucket.

## History shape

The current leaderboard row predates the latest pushed HEAD and latest GitHub
Score artifact, so the latest individual row is technically lagging current
HEAD. That does not explain the plateau:

- 200 comparable Hoimar rows in the cached leaderboard history;
- passing range: `27..33`;
- public point range: `9249..11353 / 11405`;
- passing histogram: `27:7`, `28:28`, `29:74`, `30:73`, `31:13`, `32:2`,
  `33:3`;
- recent 12-row window: `0/12` rows match local `44/44`.

This is a persistent online scoring surface issue, not just one delayed rescore.

## Ruled out

Ruled out by current evidence:

- Current checked-in public C-to-JS gameplay/RNG drift.
- Hosted public sessions as the cause; hosted sessions differ from checked-in
  files, but the hosted corpus also scores exact.
- Stale `/play/Hoimar/js/` assets.
- Latest GitHub Score workflow/artifact mismatch.
- Official browser runtime mismatch.
- Known visual normalization variants.
- Raw/strict/string comparator variants.
- Same-process module or storage leakage as the direct online signature.
- Recent stale commit among the latest 20 refs.

## Root cause conclusion

The strongest defensible root cause is: the public leaderboard backend is using
an effective scorer/deployment/comparator/data path that is not the same as
local `frozen/score.sh`, GitHub Actions Score, the deployed `/play` asset
surface, hosted public session scoring, or the official browser runner.

The exact server-side line or deployment cache cannot be identified from this
repo because the public payload still does not expose:

- scored commit SHA;
- scorer worker version or frozen scorer hash;
- first mismatching screen index/content;
- uploaded score artifact for the leaderboard run;
- whether the leaderboard consumes GitHub Actions artifacts or runs an
  independent checkout.

## Repo-side action

Do not change production NetHack output to chase this row. There is no local
first mismatch, and the online signature is screen-only with exact RNG/cursors.

The safe repo-side fix is harness visibility: make the online viewer advisory
surface a first-class local command so future runs can say "local 44/44 but
online advisory 29/44" without manually opening the viewer or copying session
names.
