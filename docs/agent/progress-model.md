# Progress Model

Screen totals are lagging evidence. They are not the objective.

A change counts as progress only when it moves subsystem truth:

- a real C behavior is ported or made more faithful
- seed-specific, replay, override, or stale-doc debt is reduced
- a divergence is localized to a clearer subsystem boundary
- docs become more truthful about current state

Every meaningful change report needs three axes:

1. **Score delta**: target and public/sentinel screens before and after.
2. **Regression stability**: sentinel result and classification of changes.
3. **Implementation delta**: subsystem moved, hacks removed/introduced, evidence sessions.

Fake progress:

- new seed-specific branches
- per-screen/per-step state forcing
- score gains with hidden hack debt
- target improvement with unclassified sentinel regression
- reporting only screen counts

Expected regressions from dehacking are acceptable when they are classified and
queued. Hidden regressions are not.

When a verified change updates durable truth, commit the coherent unit. The
commit message should name the subsystem or harness surface and the evidence
target, so git history stays useful as memory.
