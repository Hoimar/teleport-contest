export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/cmd.js')) {
        let source = String(result.source);
        source = source.replace(
            `    const vaultroom = vaultOccupiedBasic();
    const u = game.u || {};
    if (!vaultroom) {`,
            `    const vaultroom = vaultOccupiedBasic();
    const u = game.u || {};
    if (globalThis.__teleportVaultTrace) console.log('[vault-entry]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        ux: u.ux,
        uy: u.uy,
        urooms: u.urooms || [],
        urooms0: u.urooms0 || [],
        uinvault: u.uinvault || 0,
        vaultroom,
        contextMulti: game.context?.multi || 0,
        simpleRepeats: game._simple_timed_repeats_remaining || 0,
        simpleText: game._simple_timed_repeat_text || '',
        stack: String(new Error().stack || '').split('\\n').slice(2, 8).map((line) => line.trim()),
    }));
    if (!vaultroom) {`
        );
        source = source.replace(
            `    u.uinvault = (u.uinvault || 0) + 1;
    if (u.uinvault < C.VAULT_GUARD_TIME`,
            `    u.uinvault = (u.uinvault || 0) + 1;
    if (globalThis.__teleportVaultTrace) console.log('[vault-after-inc]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        ux: u.ux,
        uy: u.uy,
        uinvault: u.uinvault || 0,
        vaultroom,
    }));
    if (u.uinvault < C.VAULT_GUARD_TIME`
        );
        source = source.replace(
            `    if (findVaultGuardBasic()) return false;
    const dest = findGuardDestBasic(null);`,
            `    if (globalThis.__teleportVaultTrace) console.log('[vault-threshold]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        ux: u.ux,
        uy: u.uy,
        uinvault: u.uinvault || 0,
        vaultroom,
        hasGuard: !!findVaultGuardBasic(),
    }));
    if (findVaultGuardBasic()) return false;
    const dest = findGuardDestBasic(null);`
        );
        source = source.replace(
            `    const guard = makemon(monsterPtr('GUARD'), entry.x, entry.y, C.MM_EGD | C.MM_NOMSG);
    if (!guard) return false;`,
            `    const guard = makemon(monsterPtr('GUARD'), entry.x, entry.y, C.MM_EGD | C.MM_NOMSG);
    if (globalThis.__teleportVaultTrace) console.log('[vault-makemon]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        ux: u.ux,
        uy: u.uy,
        entry,
        guardId: guard?.m_id || null,
        rngAfter: globalThis.__teleportRngTraceIndex || 0,
    }));
    if (!guard) return false;`
        );
        source = source.replace(
            `    const base = Math.max(0, game.context?.multi || 0);
    const remaining = actionText === 'searching' ? Math.max(0, base - 2) : base;
    if (actionText === 'searching' && remaining < base && vaultOccupiedBasic()) {`,
            `    const base = Math.max(0, game.context?.multi || 0);
    const remaining = actionText === 'searching' ? Math.max(0, base - 2) : base;
    if (globalThis.__teleportVaultTrace) console.log('[simple-repeat-queue]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        actionText,
        base,
        remaining,
        ux: game.u?.ux,
        uy: game.u?.uy,
        urooms: game.u?.urooms || [],
        uinvault: game.u?.uinvult || game.u?.uinvault || 0,
        vaultroom: vaultOccupiedBasic(),
    }));
    if (actionText === 'searching' && remaining < base && vaultOccupiedBasic()) {`
        );
        source = source.replace(
            `        game.u.uinvault = (game.u.uinvault || 0) + (base - remaining);
    }`,
            `        game.u.uinvault = (game.u.uinvault || 0) + (base - remaining);
        if (globalThis.__teleportVaultTrace) console.log('[simple-repeat-vault-bump]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: game.moves || 0,
            added: base - remaining,
            uinvault: game.u.uinvault || 0,
        }));
    }`
        );
        source = source.replace(
            `    const egd = guard.mextra.egd;
    if (egd.gddone || !guard.mpeaceful) return false;`,
            `    const egd = guard.mextra.egd;
    if (globalThis.__teleportVaultTrace && (globalThis.__teleportRngTraceIndex || 0) >= 13400) console.log('[gd-state]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        ux: game.u?.ux,
        uy: game.u?.uy,
        mx: guard.mx,
        my: guard.my,
        gdx: egd.gdx,
        gdy: egd.gdy,
        ogx: egd.ogx,
        ogy: egd.ogy,
        gddone: egd.gddone || 0,
        fcbeg: egd.fcbeg || 0,
        fcend: egd.fcend || 0,
        fakecorr: (egd.fakecorr || []).map((fc) => fc ? ({ fx: fc.fx, fy: fc.fy, ftyp: fc.ftyp, flags: fc.flags || 0 }) : null),
    }));
    if (egd.gddone || !guard.mpeaceful) return false;`
        );
        source = source.replace(
            `    if (!guardAdjacentToHeroBasic(guard)) {
        // C refs: src/vault.c:gd_move(), src/apply.c:um_dist().  A distant
        // escort guard does not extend the temporary corridor or move.`,
            `    if (globalThis.__teleportVaultTrace && (globalThis.__teleportRngTraceIndex || 0) >= 13700) console.log('[gd-adjacent-check]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        adjacent: guardAdjacentToHeroBasic(guard),
        uInVault,
        uCarryGold,
        urooms: game.u?.urooms || [],
        locRoomno: game.level?.at(game.u?.ux, game.u?.uy)?.roomno || 0,
        guardRoomno: game.level?.at(guard.mx, guard.my)?.roomno || 0,
    }));
    if (!guardAdjacentToHeroBasic(guard)) {
        // C refs: src/vault.c:gd_move(), src/apply.c:um_dist().  A distant
        // escort guard does not extend the temporary corridor or move.`
        );
        source = source.replace(
            `    const exitStep = vaultGuardExitStepBasic(guard);
    if (exitStep) {`,
            `    const exitStep = vaultGuardExitStepBasic(guard);
    if (globalThis.__teleportVaultTrace && (globalThis.__teleportRngTraceIndex || 0) >= 13700) console.log('[gd-exit-step]', JSON.stringify({
        rng: globalThis.__teleportRngTraceIndex || 0,
        moves: game.moves || 0,
        exitStep,
        ux: game.u?.ux,
        uy: game.u?.uy,
        mx: guard.mx,
        my: guard.my,
        urooms: game.u?.urooms || [],
        candidates: [[-1,0],[0,-1],[0,1],[1,0]].map(([dx, dy]) => {
            const x = guard.mx + dx;
            const y = guard.my + dy;
            const loc = game.level?.at(x, y);
            return {
                x,
                y,
                typ: loc?.typ,
                roomno: loc?.roomno || 0,
                stwall: loc ? C.IS_STWALL(loc.typ) : null,
                pool: loc ? IS_POOL(loc.typ) : null,
                fake: inFakeCorridorBasic(guard, x, y),
                vault: vaultRoomAtBasic(x, y),
                accessible: loc ? C.ACCESSIBLE(loc.typ) : null,
                mon: !!findMonsterAtBasic(x, y),
                hero: C.u_at(x, y),
            };
        }),
    }));
    if (exitStep) {`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/rng.js')) {
        let source = String(result.source);
        source = source.replace(
            /if \(_rngLogEnabled\) _rngLog\.push\(([^;]+)\);/g,
            'if (_rngLogEnabled) { _rngLog.push($1); globalThis.__teleportRngTraceIndex = _rngLog.length; }'
        );
        return { ...result, source };
    }
    return result;
}
