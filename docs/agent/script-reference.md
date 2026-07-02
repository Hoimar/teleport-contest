# Script Reference

The scripts are the executable harness API. `npm run` aliases and direct `node`
commands work the same way.

| Task | Alias | Direct command |
|---|---|---|
| Brief | `npm run agent:brief -- --target <target>` | `node scripts/agent-brief.mjs --target <target>` |
| Parity state | `npm run parity:state -- --refresh-live` | `node scripts/parity-state.mjs --refresh-live` |
| Triage | `npm run triage -- <session>` | `node scripts/triage-session.mjs <session>` |
| Screen diff | `npm run screen:diff -- <session> --first` | `node scripts/screen-diff.mjs <session> --first` |
| Verify | `npm run verify -- --target <session>` | `node scripts/verify-change.mjs --target <session>` |
| Strict sentinel | `npm run sentinel:strict` | `node scripts/run-sentinel-suite.mjs --strict` |
| Scoreboard state | `npm run scoreboard:state` | `node scripts/parity-state.mjs --refresh-live --score-upstream --full` |
| Scoreboard JSON | `npm run scoreboard:json` | `node scripts/parity-state.mjs --refresh-live --score-upstream --full --json` |
| Score surfaces | `npm run score:surfaces -- [session]` | `node scripts/score-surfaces.mjs [session]` |
| Leaderboard failures | `npm run score:leaderboard-failures` | `node scripts/score-surfaces.mjs --leaderboard-failures --full` |
| Browser score | `npm run score:browser -- [session]` | `node scripts/browser-score.mjs [session]` |
| Play asset state | `npm run score:play-assets` | `node scripts/play-assets-state.mjs` |
| Ref score | `npm run score:ref -- <ref>` | `node scripts/score-ref.mjs <ref>` |
| Storage scope score | `npm run score:storage-scope -- [session]` | `node scripts/score-storage-scope.mjs [session]` |
| Hack audit | `npm run hack:audit` | `node scripts/hack-debt-audit.mjs` |
| Memory lint | `npm run memory:lint` | `node scripts/memory-lint.mjs` |
| Generate help data | `npm run generate:help-data` | `node scripts/generate-help-data.mjs` |

## Output Meaning

- `S matched/total`: terminal screens matching upstream.
- `R matched/total`: RNG calls matching upstream.
- `FS`: first screen mismatch as `index:kind:surface:key`.
- `FR`: first RNG mismatch as `index:expected=>actual`.
- `C`: cursor-only mismatch count.

Scores are evidence, not the goal. A good report explains the subsystem truth
that changed and classifies any sentinel movement.

## Parity State

`npm run parity:state -- --refresh-live` fetches the hosted public sessions,
compares their hashes and score totals with checked-in `sessions/`, checks the
sentinel invariant, and best-effort compares the inferred fork owner with the
online leaderboard. Leaderboard comparison chooses the checked-in or hosted
public score surface whose public-session shape matches the leaderboard payload,
so hosted-session drift does not mask deploy lag for an older leaderboard run.
It also summarizes the recent leaderboard history window; repeated comparable
scores that do not match the local score are reported as persistent scorer drift
instead of plain timestamp lag.
Use `--team <name>` when the fork owner is not the leaderboard name, `--full`
for non-exact rows, and `--json` for automation. The `scoreboard:*` aliases
also pass `--score-upstream` so each online refresh compares the leaderboard
with the clean upstream ref that the public scorer can actually see.
Delta sections are always `left minus right`; for example
`S +4/+8` means four more matched screens over eight more total screens in the
left corpus. Per-session rows distinguish `session-file-drift`,
`session-and-score-drift`, and pure `score-drift`.

Important classifications:

- `same`: checked-in and hosted public sessions agree.
- `public-session-drift`: hosted public sessions changed or the cache was stale.
- `local-dirty-or-unpushed`: local commits or WIP cannot match the leaderboard run.
- `leaderboard-lag`: leaderboard scoring predates local HEAD.
- `persistent-scorer-drift`: recent comparable leaderboard history repeatedly differs from local score, so timestamp lag alone is not a sufficient explanation.
- `scorer-drift`: same public corpus, different local vs leaderboard public score.
- `heldout-only-gap`: public score agrees, hidden held-out score differs.
- `unknown`: endpoint, team, or local data was unavailable.

Current limitation: the public leaderboard JSON reports repo, `lastScored`, and
score totals, but not the scored commit. Dirty/ahead trees are conservative;
for unresolved motion, pass `--score-upstream` or another clean pushed ref.
The `refs`, `timing`, and `next` lines show whether the last run is before or
after local/upstream HEAD and what operational action is next.

## Scoreboard Drift Tools

Use these when local public score is exact but the online row keeps moving:

- `npm run score:play-assets`: compare checked-in `js/*.js` with public `/play/<team>/js/` assets, including nearest matching commits. Add `-- --score` to score the fetched play asset bundle in a temporary checkout.
- `npm run score:browser -- [session]`: replay in headless Chromium; use `--mode official|viewer|both` and `--root <checkout>`.
- `npm run score:ref -- origin/main`: score a clean code ref from `/tmp`; pair it with `parity:state -- --score-ref origin/main`. Use `--session-ref <ref>` to score that code against another tracked session corpus, and `--runner-ref <ref>` to score it with another tracked frozen scorer.
- `npm run score:storage-scope -- [session]`: replay through one JS module process while varying storage lifetime.
- `npm run score:leaderboard-failures`: run score surfaces on the current failed public leaderboard sessions; add `-- --leaderboard-json <file>` for a saved or historic leaderboard snapshot.
- `npm run score:surfaces -- [session]`: score one Node replay through visual, strict, legacy, raw, and variant-normalization comparators. Add `--permission` or `--leaderboard-failures`; worker process failures exit non-zero.

## Library Boundary

`scripts/triage-lib.mjs` is not a human entry point. It owns session resolution,
screen/RNG scoring, sentinel defaults, and frozen-file warnings. Prefer changing
callers first unless multiple entry points need the same behavior.
