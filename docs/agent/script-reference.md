# Script Reference

The scripts are the only executable harness API. `npm run` names are convenient
aliases; direct `node` commands work the same way.

| Task | Alias | Direct command |
|---|---|---|
| Brief | `npm run agent:brief -- --target <target>` | `node scripts/agent-brief.mjs --target <target>` |
| Parity state | `npm run parity:state -- --refresh-live` | `node scripts/parity-state.mjs --refresh-live` |
| Triage | `npm run triage -- <session>` | `node scripts/triage-session.mjs <session>` |
| Screen diff | `npm run screen:diff -- <session> --first` | `node scripts/screen-diff.mjs <session> --first` |
| Verify | `npm run verify -- --target <session>` | `node scripts/verify-change.mjs --target <session>` |
| Strict sentinel | `npm run sentinel:strict` | `node scripts/run-sentinel-suite.mjs --strict` |
| Hack audit | `npm run hack:audit` | `node scripts/hack-debt-audit.mjs` |
| Memory lint | `npm run memory:lint` | `node scripts/memory-lint.mjs` |

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
online leaderboard. Use `--team <name>` when the fork owner is not the
leaderboard name, `--full` for non-exact rows, and `--json` for automation.
Delta sections are always `left minus right`; for example
`S +4/+8` means four more matched screens over eight more total screens in the
left corpus. Per-session rows distinguish `session-file-drift`,
`session-and-score-drift`, and pure `score-drift`.

Important classifications:

- `same`: checked-in and hosted public sessions agree.
- `public-session-drift`: hosted public sessions changed or the cache was stale.
- `local-dirty-or-unpushed`: local work cannot match the leaderboard run.
- `leaderboard-lag`: leaderboard scoring predates local HEAD.
- `scorer-drift`: same public corpus, different local vs leaderboard public score.
- `heldout-only-gap`: public score agrees, hidden held-out score differs.
- `unknown`: endpoint, team, or local data was unavailable.

## Library Boundary

`scripts/triage-lib.mjs` is not a human entry point. It owns session resolution,
screen comparison, cursor-adjusted score totals, RNG extraction, sentinel
defaults, and frozen-file warnings for the user-facing scripts. Prefer changing
its callers first unless multiple entry points need the same behavior.
