# Script Reference

The scripts are the only executable harness API. `npm run` names are convenient
aliases; direct `node` commands work the same way.

| Task | Alias | Direct command |
|---|---|---|
| Brief | `npm run agent:brief -- --target <target>` | `node scripts/agent-brief.mjs --target <target>` |
| Triage | `npm run triage -- <session>` | `node scripts/triage-session.mjs <session>` |
| Screen diff | `npm run screen:diff -- <session> --first` | `node scripts/screen-diff.mjs <session> --first` |
| Verify | `npm run verify -- --target <session>` | `node scripts/verify-change.mjs --target <session>` |
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

## Library Boundary

`scripts/triage-lib.mjs` is not a human entry point. It owns session resolution,
screen comparison, RNG extraction, sentinel defaults, and frozen-file warnings
for the user-facing scripts. Prefer changing its callers first unless multiple
entry points need the same behavior.
