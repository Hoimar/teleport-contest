export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/dog.js')) {
        let source = String(result.source);
        source = source.replace(
            'function make_pet_kill_corpse(mon) {\n',
            `function make_pet_kill_corpse(mon) {
    if (globalThis.__teleportPetKillTrace) {
        (globalThis.__teleportPetKillEvents ||= []).push({
            moves: game.moves || 0,
            name: mon?.data?.name,
            mx: mon?.mx,
            my: mon?.my,
            geno: mon?.data?.geno,
            msize: mon?.data?.msize,
            mhp: mon?.mhp,
        });
    }
`
        );
        return { ...result, source };
    }
    return result;
}
