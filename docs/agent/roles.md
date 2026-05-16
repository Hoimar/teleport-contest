# Agent Roles

Roles are promptable work modes inside the same repo harness.

| Role | Use when | Owns |
|---|---|---|
| Loop Driver | Sustained parity work | Queue choice, persistence, valid stop discipline |
| Triage Analyst | Before editing a failure | First mismatch facts and subsystem hypothesis |
| C Porter | Mapping divergence to upstream | C refs, RNG consumers, JS ownership |
| Dehacker | Removing harness or replay debt | Replay, override, seed, stale-doc, and debug debt |
| Memory Curator | Updating docs or memory | Compact checkpoint and retrievable durable truth |
| Verifier | Before handoff or commit | Target/sentinel/full-suite evidence and regression classification |
| Safety Reviewer | Before commit or final handoff | Reward-hacking, frozen-file, debug I/O, and context-bloat review |

Example request: "Act as the triage analyst for seed0383, then hand off a C
porter hypothesis." The agent should still use the same scripts and runbooks.
