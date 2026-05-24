# Using The Harness

The harness now has three active layers:

| Layer | Purpose |
|---|---|
| `AGENTS.md` | hard policy, routing, stop rules |
| `docs/agent/*.md` | short runbooks and human explanations |
| `scripts/*.mjs` | executable checks and compact diagnostics |

No MCP server, repo plugin, or installed skill package is required.

## Setup

Use Node 22+ and npm 11.10+. From a checkout:

```bash
npm ci
npm run deps:audit
npm run memory:lint
npm run parity:state -- --refresh-live
```

The repo defaults to disabling dependency lifecycle scripts in `.npmrc`; see
`docs/npm-supply-chain.md` before adding or updating npm dependencies. The npm
commands are aliases for direct `node scripts/*.mjs` commands in
`package.json`.

## What To Ask An Agent

For a bounded fix:

```text
Follow AGENTS.md. Run the harness brief for <target>, triage the first mismatch,
implement the smallest general subsystem fix, verify, and commit if durable
truth changed.
```

For a read-only pass:

```text
Follow AGENTS.md. Triage <target> and report the subsystem hypothesis only.
Do not edit files.
```

For cleanup:

```text
Follow AGENTS.md. Run the hack audit, remove one general piece of hack debt,
verify, update memory if truth changed, and commit the coherent cleanup.
```

## Typical Session

1. Agent runs `npm run agent:brief -- --target <target>`.
2. Agent runs `npm run parity:state -- --refresh-live` unless fresh state
   exists in the current turn.
3. Agent reads only the docs/files named by the brief.
4. Agent runs triage or screen diff to extract first mismatch facts.
5. Agent states a subsystem hypothesis before editing.
6. Agent implements or dehacks a general behavior.
7. Agent runs `npm run verify -- --target <target>` and
   `npm run sentinel:strict` before commit.
8. Agent updates `feature_map.md` or `lessons.md` only when durable truth
   changed.
9. Agent commits the coherent change when verification is complete.
10. Agent reports what changed, evidence, regressions, commit hash, and next
   queue item.

For broad/shared changes, rerun `npm run parity:state -- --refresh-live --full`
before handoff. Public sessions are useful evidence, but the hidden held-out
sessions are the later cleanliness benchmark; do not optimize for public-score
surface gains at the expense of general systems.
When public/local scores differ, use the Local Vs Hosted and Local Vs
Leaderboard delta sections before choosing a subsystem target.

## Expected Feedback

The agent should keep you oriented with:

- current target and subsystem hypothesis
- command being run and why
- score and RNG evidence, compared to the pre-change baseline when available
- strict sentinel stability or classified regressions
- local/public/leaderboard classification from `parity:state` when relevant
- files staged for commit and why

Raw script logs are evidence for the agent. Human reports should summarize the
meaning unless you ask for the full output.

## Simplifier / De-Hacker Pass

After every few parity iterations, run `npm run hack:audit` and look for stale
replay, override, seed, debug, or duplicated harness code that can be deleted or
merged into an existing tool. Expected regressions from removing debt are
acceptable only when they are classified and queued.

## MCP Status

There is no MCP server to start or stop. If `/mcp` does not show Teleport tools,
that is expected for this simplified harness. Use the npm or direct Node
commands instead.
