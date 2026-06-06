export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/cmd.js')) {
        let source = String(result.source);
        source = source.replace(
            '    let ch = String.fromCharCode(key);\n',
            `    let ch = String.fromCharCode(key);
    if (globalThis.__teleportCmdStateTrace) {
        const truthyFlags = Object.keys(game)
            .filter((k) => k.startsWith('_awaiting') && game[k])
            .sort();
        (globalThis.__teleportCmdStateEvents ||= []).push({
            moves: game.moves || 0,
            key,
            ch,
            pending: game._pending_message || '',
            more: !!game._more,
            contextMove: game.context?.move,
            ux: game.u?.ux,
            uy: game.u?.uy,
            flags: truthyFlags,
            travelTip: game._travel_tip_active || '',
            terrainActive: !!game._terrain_view_active,
            override: !!game._override_screen,
            farlookCursor: game._farlook_cursor || null,
            promptCursor: game._prompt_cursor || null,
        });
    }
`
        );
        return { ...result, source };
    }
    return result;
}
