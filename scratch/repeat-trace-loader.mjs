export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/allmain.js')) return result;
    let source = String(result.source);
    source = source.replace(
        `        if (checkStopSearching
            && (g._simple_timed_repeats_remaining || 0) > 0
            && monsterNearbyForSafety(2)) {`,
        `        if (checkStopSearching) {
            const ux = g.u?.ux ?? 0;
            const uy = g.u?.uy ?? 0;
            const traceEntry = {
                idx: globalThis.__teleportRngTraceIndex || 0,
                moves: g.moves,
                remaining: g._simple_timed_repeats_remaining || 0,
                multi: g.context?.multi || 0,
                nearby: monsterNearbyForSafety(2),
                pending: g._pending_message || '',
                hero: { x: ux, y: uy },
                mons: (g.level?.monsters || [])
                    .filter((mon) => Math.abs((mon.mx ?? 0) - ux) <= 2
                        && Math.abs((mon.my ?? 0) - uy) <= 2)
                    .map((mon) => ({
                        name: mon.data?.name,
                        x: mon.mx,
                        y: mon.my,
                        peaceful: mon.mpeaceful,
                        tame: mon.mtame,
                        sleeping: mon.msleeping,
                        mcanmove: mon.mcanmove,
                        mundetected: mon.mundetected,
                    })),
            };
            (globalThis.__teleportRepeatTrace ||= []).push(traceEntry);
            console.error('REPEAT', JSON.stringify(traceEntry));
        }
        if (checkStopSearching
            && (g._simple_timed_repeats_remaining || 0) > 0
            && monsterNearbyForSafety(2)) {`,
    );
    return { ...result, source };
}
