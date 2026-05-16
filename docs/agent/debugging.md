# Debugging Guide

Prefer compact tools before ad hoc scripts.

There is no required MCP server or plugin layer. The supported harness surface
is `AGENTS.md`, these runbooks, and the repo scripts.

## Triage

```bash
npm run triage -- sessions/<session>.session.json
npm run screen:diff -- <session> --first
```

Use the first mismatch to form a subsystem hypothesis:

- message row: `pline`, prompt, menu, or command lifecycle
- map cells: display, retained state, movement, object/monster placement
- status rows: attributes, time, conditions, inventory/wear state
- RNG first mismatch: identify the C consumer and preserve call order

## C Source

Search upstream by function, message text, RNG call, or file:

```bash
rg -n "function_or_message" nethack-c/upstream
```

Use compact breadcrumbs in docs and comments:

`C ref: path:function()`

## Screen Cells

`npm run screen:diff -- <session> --first` prints row summaries, message row,
cursor comparison, and sample cell diffs without editing frozen files.

Only create one-off debug scripts when these tools do not expose enough state.
Put them in `debug/` or `scratch/`, document their header, and delete or retire
them after use.

For script output meanings and direct `node` commands, see
`docs/agent/script-reference.md`.
