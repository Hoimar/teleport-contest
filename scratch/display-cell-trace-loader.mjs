export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/display.js')) {
        let source = String(result.source);
        source = source.replace(
            'export function show_glyph_cell(x, y, ch, color = NO_COLOR, decgfx = false, attr = 0) {\n    const loc = game.level?.at(x, y);\n    if (!loc) return;',
            `export function show_glyph_cell(x, y, ch, color = NO_COLOR, decgfx = false, attr = 0) {
    const loc = game.level?.at(x, y);
    if (!loc) return;
    if (globalThis.__teleportDisplayCellTrace) {
        const moves = game.moves || 0;
        const start = globalThis.__teleportDisplayTraceMoveStart ?? -Infinity;
        const end = globalThis.__teleportDisplayTraceMoveEnd ?? Infinity;
        const cells = globalThis.__teleportDisplayTraceCells || null;
        const key = x + ',' + y;
        if (moves >= start && moves <= end && (!cells || cells.has(key))) {
            (globalThis.__teleportDisplayCellEvents ||= []).push({
                moves,
                x,
                y,
                old: { ch: loc.disp_ch, color: loc.disp_color, decgfx: loc.disp_decgfx, attr: loc.disp_attr },
                next: { ch, color, decgfx, attr },
                pending: game._pending_message || '',
                more: !!game._more,
                dismissals: game._more_dismissals_remaining || 0,
                afterMore: game._after_more_message || '',
                monsterPaused: !!game._monster_turn_paused_for_more,
                screenIndex: globalThis.__teleportDisplayScreenIndex ?? null,
                stack: String(new Error().stack || '').split('\\n').slice(2, 9).map((line) => line.trim()),
            });
        }
    }`
        );
        return { ...result, source };
    }
    return result;
}
