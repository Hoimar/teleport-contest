export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/cmd.js')) {
        let source = String(result.source);
        source = source.replace(
            'game._prayer_turns_remaining = 4;\n            game._pending_prayer_finish_message = true;',
            `game._prayer_turns_remaining = 4;
            console.error('[pray-trace] force-decline set', JSON.stringify({
                remaining: game._prayer_turns_remaining,
                fast: game.u?.uprops?.fast,
                intrinsic_fast: game.u?.uprops?.intrinsic_fast,
                moves: game.moves,
            }));
            game._pending_prayer_finish_message = true;`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/allmain.js')) {
        let source = String(result.source);
        source = source.replace(
            'while ((g._prayer_turns_remaining || 0) > 0) {\n            g._prayer_turns_remaining--;\n            await advanceTurn();\n        }',
            `while ((g._prayer_turns_remaining || 0) > 0) {
            console.error('[pray-trace] before loop turn', JSON.stringify({
                remaining: g._prayer_turns_remaining,
                fastPending: !!g._fast_extra_action_pending,
                moves: g.moves,
                rng: globalThis.__teleportRngTraceIndex,
            }));
            g._prayer_turns_remaining--;
            await advanceTurn();
            console.error('[pray-trace] after loop turn', JSON.stringify({
                remaining: g._prayer_turns_remaining,
                completedTail: !!g._advance_turn_completed_tail,
                fastPending: !!g._fast_extra_action_pending,
                more: !!g._more,
                monsterPaused: !!g._monster_turn_paused_for_more,
                moves: g.moves,
                rng: globalThis.__teleportRngTraceIndex,
            }));
        }`
        );
        source = source.replace(
            'if (g._pending_prayer_finish_message) {\n            g._pending_prayer_finish_message = false;',
            `if (g._pending_prayer_finish_message) {
            console.error('[pray-trace] finish prayer message', JSON.stringify({
                remaining: g._prayer_turns_remaining,
                fastPending: !!g._fast_extra_action_pending,
                moves: g.moves,
                rng: globalThis.__teleportRngTraceIndex,
            }));
            g._pending_prayer_finish_message = false;`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/rng.js')) {
        let source = String(result.source);
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);",
            "if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);",
            "if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);",
            "if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);",
            "if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`);",
            "if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        source = source.replace(
            "if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`);",
            "if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`); globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;"
        );
        return { ...result, source };
    }
    return result;
}
