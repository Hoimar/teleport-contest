# Scoreboard Divergence Fix Plan - 2026-07-04

## Diagnosis to preserve

The online 30/44 plateau is not a production gameplay parity bug reproduced in
this checkout. It is a leaderboard-only scorer/deployment/comparator/data-path
split. The current row's exact RNG and cursor totals, plus exact local
visual/browser/play-assets/Actions results, make a production `js/` output
change the wrong fix.

## Fix scope

Implement a harness/operations fix:

1. Add a command that reads the same `/leaderboard/data.json` advisory consumed
   by the online Session Viewer hub mode.
2. Print the current team public score, last-scored timestamp, all failed
   sessions, missed-screen counts, and the aggregate screen/cell/cursor/RNG
   signature.
3. Support saved snapshots with `--leaderboard-json` so reports remain
   reproducible after the live endpoint moves.
4. Add a package script for the command.
5. Verify the command against the current saved `.cache/leaderboard-data.json`,
   then rerun strict sentinels and the focused online-failed-surface probe.

## Non-goals

- No production `js/` change.
- No per-seed/session workaround.
- No local comparator weakening to declare the online row fixed.
- No attempt to spoof the public leaderboard's sparse 59 missed screens.

## Expected behavior

Example command:

```bash
npm run score:online-viewer -- --leaderboard-json .cache/leaderboard-data.json --failed
```

Expected output should show:

- source snapshot `2026-07-04T07:37:10.615Z`;
- team `Hoimar`, last scored `2026-07-04T07:13:46.843Z`;
- public `29/44 S 11346/11405 R 792838/792838`;
- failures `15`, missed screens `59`;
- full RNG `15/15`, full cursors `15/15`, full cells `0/15`,
  cells-only equals combined `15/15`;
- the same 15 failed sessions listed in the RCA.

## Verification

Run:

```bash
npm run score:online-viewer -- --leaderboard-json .cache/leaderboard-data.json --failed
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json --full
npm run sentinel:strict
git diff --check
```

Passing criteria:

- New command faithfully reports the viewer/leaderboard advisory rows.
- Focused local scorer surfaces remain exact for the online-failed subset.
- Strict sentinel suite remains exact.
- No forbidden files are modified.
