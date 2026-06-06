export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/monmove.js')) {
        let source = String(result.source);
        source = source.replace(
            'if (is_wanderer(mtmp) && fleeState.nearby) rn2(4);',
            `if (is_wanderer(mtmp) && fleeState.nearby) {
                if (globalThis.__teleportWandererTrace) {
                    (globalThis.__teleportWandererEvents ||= []).push({
                        moves: game.moves || 0,
                        name: mtmp?.data?.name,
                        mx: mtmp?.mx,
                        my: mtmp?.my,
                        mux: mtmp?.mux,
                        muy: mtmp?.muy,
                        ux: game.u?.ux,
                        uy: game.u?.uy,
                        mtame: mtmp?.mtame,
                        mpeaceful: mtmp?.mpeaceful,
                        mflee: mtmp?.mflee,
                        mcansee: mtmp?.mcansee,
                        fleeState,
                    });
                }
                rn2(4);
            }`
        );
        source = source.replace(
            'const dogStatus = await dog_move(mtmp, false);',
            `if (globalThis.__teleportWandererTrace) {
                (globalThis.__teleportDogMoveEvents ||= []).push({
                    moves: game.moves || 0,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    ux: game.u?.ux,
                    uy: game.u?.uy,
                    mtame: mtmp?.mtame,
                    mpeaceful: mtmp?.mpeaceful,
                    mflee: mtmp?.mflee,
                    mcansee: mtmp?.mcansee,
                    fleeState,
                });
            }
            const dogStatus = await dog_move(mtmp, false);`
        );
        return { ...result, source };
    }
    return result;
}
