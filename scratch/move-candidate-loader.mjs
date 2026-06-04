export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context);
    if (result.format !== 'module' || !url.endsWith('/js/monmove.js')) return result;
    let source = String(result.source);
    source = source.replace(
        "    candidateLoop:\n    for (const cand of candidates) {",
        `    if ((process.env.TRACE_MONSTER_NAME && mtmp.data?.name === process.env.TRACE_MONSTER_NAME)
        || (mtmp.mx === 44 && mtmp.my === 8)) {
        console.log('[candidate-entry]', JSON.stringify({
            name: mtmp.data?.name,
            mx: mtmp.mx,
            my: mtmp.my,
            mux: mtmp.mux,
            muy: mtmp.muy,
            appr,
            ggx,
            ggy,
            nidist,
            mtrack: mtmp.mtrack,
            candidates,
            kicked: game._kickedloc,
            flags: game.level?.flags,
            rng: globalThis.__teleportRngTraceIndex || 0,
        }));
    }
    candidateLoop:
    for (const cand of candidates) {`,
    );
    source = source.replace(
        "                if (cand.x === trk.x && cand.y === trk.y) {\n                    const denom = 4 * (candidates.length - j);",
        `                if (cand.x === trk.x && cand.y === trk.y) {
                    if ((process.env.TRACE_MONSTER_NAME && mtmp.data?.name === process.env.TRACE_MONSTER_NAME)
                        || (mtmp.mx === 44 && mtmp.my === 8))
                        console.log('[candidate-track]', JSON.stringify({ cand, j, trk, count: candidates.length }));
                    const denom = 4 * (candidates.length - j);`,
    );
    return { ...result, source };
}
