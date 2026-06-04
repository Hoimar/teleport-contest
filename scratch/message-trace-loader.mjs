export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context);
    if (result.format !== 'module') return result;
    let source = String(result.source);
    if (url.endsWith('/js/display.js')) {
        source = source.replace(
            "export async function pline(msg) {\n    game._pending_message = msg;",
            "export async function pline(msg) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[pline] move=${game.moves || 0} ${msg}`);\n    game._pending_message = msg;",
        );
        source = source.replace(
            "export async function append_pline(msg) {\n    if (game._pending_message) {",
            "export async function append_pline(msg) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[append_pline] move=${game.moves || 0} ${msg} pending=${game._pending_message || ''} more=${!!game._more}`);\n    if (game._pending_message) {",
        );
        source = source.replace(
            "export function queue_more_prompt(count = 1) {\n    game._more_dismissals_remaining",
            "export function queue_more_prompt(count = 1) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[queue_more] move=${game.moves || 0} count=${count} pending=${game._pending_message || ''} after=${game._after_more_message || ''}`);\n    game._more_dismissals_remaining",
        );
        source = source.replace(
            "export function clear_pending_message() {\n    game._pending_message = '';",
            "export function clear_pending_message() {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[clear_pending] move=${game.moves || 0} pending=${game._pending_message || ''} after=${game._after_more_message || ''} more=${!!game._more}`);\n    game._pending_message = '';",
        );
    }
    if (url.endsWith('/js/dog.js')) {
        source = source.replace(
            "async function append_topline_message(line) {\n    if (game._pending_message?.startsWith('You start putting on ')) game._pending_message = '';",
            "async function append_topline_message(line) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[dog_append] move=${game.moves || 0} ${line} pending=${game._pending_message || ''} more=${!!game._more} after=${game._after_more_message || ''}`);\n    if (game._pending_message?.startsWith('You start putting on ')) game._pending_message = '';",
        );
        source = source.replace(
            "export async function finish_pet_kill(mtmp, target) {\n    // C ref:",
            "export async function finish_pet_kill(mtmp, target) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[finish_pet_kill] move=${game.moves || 0} killer=${mtmp?.data?.name} target=${target?.data?.name} pending=${game._pending_message || ''} more=${!!game._more}`);\n    // C ref:",
        );
    }
    if (url.endsWith('/js/monmove.js')) {
        source = source.replace(
            "async function append_monster_topline(line) {\n    if (game.context?.run) {",
            "async function append_monster_topline(line) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[append_monster_topline] move=${game.moves || 0} ${line} pending=${game._pending_message || ''} more=${!!game._more} after=${game._after_more_message || ''}`);\n    if (game.context?.run) {",
        );
        source = source.replace(
            "async function show_blocking_monster_message(line) {\n    if (!line) return;",
            "async function show_blocking_monster_message(line) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[blocking_monster] move=${game.moves || 0} ${line} pending=${game._pending_message || ''} more=${!!game._more} after=${game._after_more_message || ''}`);\n    if (!line) return;",
        );
        source = source.replace(
            "async function append_monster_effect_topline(line, opts = {}) {\n    if ((game._monster_topline_deferred || monster_attack_tail_pack_pending())",
            "async function append_monster_effect_topline(line, opts = {}) {\n    if (globalThis.__teleportMessageTrace && (!globalThis.__teleportMessageTraceMove || (game.moves || 0) >= globalThis.__teleportMessageTraceMove)) console.log(`[monster_effect] move=${game.moves || 0} ${line} pending=${game._pending_message || ''} more=${!!game._more} after=${game._after_more_message || ''} tailPack=${!!game._monster_attack_tail_pending_pack}`);\n    if ((game._monster_topline_deferred || monster_attack_tail_pack_pending())",
        );
    }
    return { ...result, source };
}
