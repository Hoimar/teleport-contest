export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/cmd.js')) return result;

    let source = String(result.source);
    source = source.replace(
        'function buildAttributesScreens() {\n',
        `function buildAttributesScreens() {
    globalThis.__attributesTrace = {
        role: game.urole?.name?.m,
        flags: game.flags,
        uprops: game.u?.uprops,
        inventory: (game.inventory || []).map((obj) => ({
            invlet: obj.invlet,
            otyp: obj.otyp,
            oclass: obj.oclass,
            worn: obj.worn,
            owornmask: obj.owornmask,
            wornSide: obj.wornSide,
            wielded: obj.wielded,
        })),
    };
`
    );
    return { ...result, source };
}
