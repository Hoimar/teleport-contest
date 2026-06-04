export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (result.format !== 'module') return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;

    if (url.endsWith('/js/monmove.js')) {
        source = source.replace(
            'function finish_deferred_physical_hit_damage(mtmp, damage, preDamageHp) {\n    mhitm_knockback_frontdoor();',
            `function finish_deferred_physical_hit_damage(mtmp, damage, preDamageHp) {
    if (globalThis.__teleportPhysicalTailTrace) console.log('[phys-hit-damage]', JSON.stringify({
        rng: game.rng?.count ?? game.rng?.idx ?? null,
        moves: game.moves || 0,
        mon: mtmp?.data?.name,
        damage,
        preDamageHp,
        hp: game.u?.uhp,
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
        deathPending: !!game._monster_death_pending,
    }));
    mhitm_knockback_frontdoor();`
        );
        source = source.replace(
            'function finish_deferred_physical_side_effect_tail(mtmp, current) {\n    restore_hero_combat_state(current?.postSideEffectHero);',
            `function finish_deferred_physical_side_effect_tail(mtmp, current) {
    if (globalThis.__teleportPhysicalTailTrace) console.log('[phys-side-tail]', JSON.stringify({
        rng: game.rng?.count ?? game.rng?.idx ?? null,
        moves: game.moves || 0,
        mon: mtmp?.data?.name,
        current,
        hp: game.u?.uhp,
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
    }));
    restore_hero_combat_state(current?.postSideEffectHero);`
        );
        source = source.replace(
            'export async function finish_deferred_monster_physical_attack() {\n    const pending = game._deferred_monster_physical_attack;',
            `export async function finish_deferred_monster_physical_attack() {
    if (globalThis.__teleportPhysicalTailTrace) console.log('[phys-finish-entry]', JSON.stringify({
        rng: game.rng?.count ?? game.rng?.idx ?? null,
        moves: game.moves || 0,
        pendingKind: game._deferred_monster_physical_attack?.current?.attack ? 'attack'
            : game._deferred_monster_physical_attack?.current?.postSideEffectHero ? 'postSide'
            : game._deferred_monster_physical_attack?.current ? 'damage'
            : game._deferred_monster_physical_attack ? 'tail'
            : 'none',
        current: game._deferred_monster_physical_attack?.current || null,
        wait: !!game._deferred_monster_physical_attack?.waitForDisplayedMore,
        msg: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
        deathPending: !!game._monster_death_pending,
    }));
    const pending = game._deferred_monster_physical_attack;`
        );
    }

    if (url.endsWith('/js/cmd.js')) {
        source = source.replace(
            '            if (physicalWaitsForDisplayedMore) {\n                game._deferred_monster_physical_attack.waitForDisplayedMore = false;',
            `            if (globalThis.__teleportPhysicalTailTrace && game._deferred_monster_physical_attack) console.log('[hm-phys-gate]', JSON.stringify({
                moves: game.moves || 0,
                physicalWaitsForDisplayedMore,
                needsPrompt,
                msg,
                pending: game._pending_message || '',
                after: game._after_more_message || '',
                current: game._deferred_monster_physical_attack?.current || null,
                deathPending: !!game._monster_death_pending,
            }));
            if (physicalWaitsForDisplayedMore) {
                game._deferred_monster_physical_attack.waitForDisplayedMore = false;`
        );
        source = source.replace(
            '                if (game._deferred_monster_physical_attack?.current?.postSideEffectHero\n                    && game._deferred_monster_physical_attack.current.encumberShown) {',
            `                if (globalThis.__teleportPhysicalTailTrace) console.log('[death-decline-phys]', JSON.stringify({
                    moves: game.moves || 0,
                    pending: game._pending_message || '',
                    after: game._after_more_message || '',
                    current: game._deferred_monster_physical_attack?.current || null,
                    more: !!game._more,
                    deathPending: !!game._monster_death_pending,
                }));
                if (game._deferred_monster_physical_attack?.current?.postSideEffectHero
                    && game._deferred_monster_physical_attack.current.encumberShown) {`
        );
    }

    return { ...result, source };
}
