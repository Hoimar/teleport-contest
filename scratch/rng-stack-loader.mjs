export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/track.js')) {
        let source = String(result.source);
        source = source.replace(
            'export function initrack() {\n    game._utrack = [];\n}',
            `export function initrack() {
    (globalThis.__teleportTrackTrace ||= []).push({
        event: 'initrack',
        rng: globalThis.__teleportRngTraceIndex || 0,
        ux: game.u?.ux,
        uy: game.u?.uy,
        stack: String(new Error().stack || '').split('\\n').slice(2, 7).map((line) => line.trim()),
    });
    game._utrack = [];
}`
        );
        source = source.replace(
            'export function settrack() {\n    if (!game.u || wearing_stealth_ring()) return;',
            `export function settrack() {
    (globalThis.__teleportTrackTrace ||= []).push({
        event: 'settrack',
        rng: globalThis.__teleportRngTraceIndex || 0,
        ux: game.u?.ux,
        uy: game.u?.uy,
        before: (game._utrack || []).slice(-8),
        stack: String(new Error().stack || '').split('\\n').slice(2, 7).map((line) => line.trim()),
    });
    if (!game.u || wearing_stealth_ring()) return;`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/monmove.js')) {
        let source = String(result.source);
        source = source.replace(
            'function set_apparxy_basic(mtmp) {',
            `function set_apparxy_basic(mtmp) {
    const __apparxyCtxBase = () => ({
        fn: 'set_apparxy_basic',
        name: mtmp?.data?.name,
        mx: mtmp?.mx,
        my: mtmp?.my,
        mux: mtmp?.mux,
        muy: mtmp?.muy,
        ux: game.u?.ux,
        uy: game.u?.uy,
    });
    const __apparxyTrace = (event) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportApparxyTrace ||= []).push({ idx, ...__apparxyCtxBase(), ...event });
        }
    };`
        );
        source = source.replace(
            'const gotu = notseen ? !rn2(3) : notthere ? !rn2(4) : false;',
            `globalThis.__teleportMonsterContext = { ...__apparxyCtxBase(), phase: 'gotu', notseen, notthere, displ };
    const gotu = notseen ? !rn2(3) : notthere ? !rn2(4) : false;
    __apparxyTrace({ phase: 'after-gotu', notseen, notthere, displ, gotu });`
        );
        source = source.replace(
            `        mx = ux - displ + rn2(2 * displ + 1);
        my = uy - displ + rn2(2 * displ + 1);`,
            `        globalThis.__teleportMonsterContext = { ...__apparxyCtxBase(), phase: 'candidate-x', tryCnt, displ };
        const __apparxyRollX = rn2(2 * displ + 1);
        mx = ux - displ + __apparxyRollX;
        globalThis.__teleportMonsterContext = { ...__apparxyCtxBase(), phase: 'candidate-y', tryCnt, displ, rollX: __apparxyRollX, candX: mx };
        const __apparxyRollY = rn2(2 * displ + 1);
        my = uy - displ + __apparxyRollY;`
        );
        source = source.replace(
            `        const seen = couldsee(mx, my);
        if (!isok(mx, my)) continue;`,
            `        const seen = couldsee(mx, my);
        __apparxyTrace({
            phase: 'candidate-eval',
            tryCnt,
            displ,
            rollX: __apparxyRollX,
            rollY: __apparxyRollY,
            candX: mx,
            candY: my,
            blockedSelf,
            accessible,
            seen,
            isok: isok(mx, my),
            locTyp: game.level?.at(mx, my)?.typ,
        });
        if (!isok(mx, my)) continue;`
        );
        source = source.replace(
            'async function mattacku_basic(mtmp, state) {',
            `async function mattacku_basic(mtmp, state) {
    globalThis.__teleportMonsterContext = {
        fn: 'mattacku_basic',
        name: mtmp?.data?.name,
        mx: mtmp?.mx,
        my: mtmp?.my,
        movement: mtmp?.movement,
        state: state ? {
            inrange: !!state.inrange,
            nearby: !!state.nearby,
            scared: !!state.scared,
            mux: mtmp?.mux,
            muy: mtmp?.muy,
        } : null,
    };`
        );
        source = source.replace(
            'async function thrwmu_basic(mtmp) {',
            `async function thrwmu_basic(mtmp) {
    const __throwObj = (obj) => obj ? {
        otyp: obj.otyp,
        quan: obj.quan,
        spe: obj.spe,
        worn: obj.owornmask,
        ox: obj.ox,
        oy: obj.oy,
    } : null;
    const __throwTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportThrowTrace ||= []).push({
                idx,
                phase,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                ux: game.u?.ux,
                uy: game.u?.uy,
                mux: mtmp?.mux,
                muy: mtmp?.muy,
                weapon_check: mtmp?.weapon_check,
                mw: __throwObj(mtmp?.mw),
                inventory: (mtmp?.inventory || []).map(__throwObj),
                ...extra,
            });
        }
    };
    __throwTrace('entry');`
        );
        source = source.replace(
            '        if (await mon_wield_item_basic(mtmp)) return true;\n    }\n    const obj = ranged_weapon_candidate(mtmp);',
            `        if (await mon_wield_item_basic(mtmp)) {
            __throwTrace('wielded-ranged', { mwAfter: __throwObj(mtmp?.mw) });
            return true;
        }
        __throwTrace('wield-ranged-false', { mwAfter: __throwObj(mtmp?.mw) });
    }
    const obj = ranged_weapon_candidate(mtmp);
    __throwTrace('candidate', { candidate: __throwObj(obj) });`
        );
        source = source.replace(
            '    if (!obj) return false;\n    const linedUp = lined_up_basic(mtmp);\n    if (!linedUp) return false;',
            `    if (!obj) {
        __throwTrace('no-candidate');
        return false;
    }
    const linedUp = lined_up_basic(mtmp);
    __throwTrace('lined-up', { linedUp });
    if (!linedUp) return false;`
        );
        source = source.replace(
            '    return throw_weapon_at_hero_basic(mtmp, obj);\n}\n\nfunction can_attack_after_move_basic',
            `    __throwTrace('throw-call', { candidate: __throwObj(obj) });
    const __throwResult = await throw_weapon_at_hero_basic(mtmp, obj);
    __throwTrace('throw-result', { result: __throwResult });
    return __throwResult;
}

function can_attack_after_move_basic`
        );
        source = source.replace(
            'async function m_move_basic(mtmp, resumeAfterTenguTeleRestrict = false) {',
            `async function m_move_basic(mtmp, resumeAfterTenguTeleRestrict = false) {
    globalThis.__teleportMonsterContext = {
        fn: 'm_move_basic',
        phase: 'entry',
        name: mtmp?.data?.name,
        mx: mtmp?.mx,
        my: mtmp?.my,
        mux: mtmp?.mux,
        muy: mtmp?.muy,
        peaceful: !!mtmp?.mpeaceful,
        mflee: !!mtmp?.mflee,
        mtrack: (mtmp?.mtrack || []).slice(0, 4),
    };`
        );
        source = source.replace(
            'function monflee_basic(mtmp, fleetime, first = false) {',
            `function monflee_basic(mtmp, fleetime, first = false) {
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportMonfleeTrace ||= []).push({
                idx,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                ux: game.u?.ux,
                uy: game.u?.uy,
                mux: mtmp?.mux,
                muy: mtmp?.muy,
                mflee: !!mtmp?.mflee,
                mfleetim: mtmp?.mfleetim,
                fleetime,
                first,
                mtrack: (mtmp?.mtrack || []).slice(0, 8),
                stack: String(new Error().stack || '').split('\\n').slice(2, 8).map((line) => line.trim()),
            });
        }
    }`
        );
        source = source.replace(
            'function decide_to_shapeshift_basic(mon) {',
            `function decide_to_shapeshift_basic(mon) {
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportShapeTrace ||= []).push({
                idx,
                phase: 'decide-entry',
                name: mon?.data?.name,
                cham: mon?.cham?.name,
                mx: mon?.mx,
                my: mon?.my,
                mspec_used: mon?.mspec_used,
                mtrack: (mon?.mtrack || []).slice(0, 8),
            });
        }
    }`
        );
        source = source.replace(
            'function apply_newcham_basic(mon, ptr) {',
            `function apply_newcham_basic(mon, ptr) {
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportShapeTrace ||= []).push({
                idx,
                phase: 'apply-entry',
                from: mon?.data?.name,
                to: ptr?.name,
                cham: mon?.cham?.name,
                mx: mon?.mx,
                my: mon?.my,
                mspec_used: mon?.mspec_used,
                mtrack: (mon?.mtrack || []).slice(0, 8),
            });
        }
    }`
        );
        source = source.replace(
            'function mon_track_add(mtmp, x, y) {',
            `function mon_track_add(mtmp, x, y) {
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportMonTrackTrace ||= []).push({
                idx,
                event: 'add',
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                x,
                y,
                before: (mtmp?.mtrack || []).slice(0, 8),
            });
        }
    }`
        );
        source = source.replace(
            'const denom = 4 * (candidates.length - j);',
            `globalThis.__teleportMonsterContext = {
                    fn: 'm_move_basic',
                    phase: 'track-check',
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    movement: mtmp?.movement,
                    mhp: mtmp?.mhp,
                    mhpmax: mtmp?.mhpmax,
                    mcansee: mtmp?.mcansee,
                    ux: game.u?.ux,
                    uy: game.u?.uy,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    peaceful: !!mtmp?.mpeaceful,
                    mflee: !!mtmp?.mflee,
                    appr,
                    ggx,
                    ggy,
                    utrack: (game._utrack || []).slice(-16),
                    gettrack: gettrack(mtmp?.mx, mtmp?.my),
                    cand,
                    j,
                    track: trk,
                    mtrack: (mtmp?.mtrack || []).slice(0, 8),
                    adjacent: (() => {
                        const cells = [];
                        for (let ax = (mtmp?.mx ?? 0) - 1; ax <= (mtmp?.mx ?? 0) + 1; ax++)
                            for (let ay = (mtmp?.my ?? 0) - 1; ay <= (mtmp?.my ?? 0) + 1; ay++) {
                                if (ax === mtmp?.mx && ay === mtmp?.my) continue;
                                const loc = game.level?.at(ax, ay);
                                const mon = (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === ax && m.my === ay);
                                const objects = (game.level?.objects || []).filter((o) => o.ox === ax && o.oy === ay).map((o) => o.otyp);
                                const trap = (game.level?.traps || []).find((t) => t.tx === ax && t.ty === ay);
                                const engraving = (game.level?.engravings || []).find((e) => e.x === ax && e.y === ay);
                                cells.push({
                                    x: ax,
                                    y: ay,
                                    typ: loc?.typ,
                                    doormask: loc?.doormask,
                                    mon: mon?.data?.name || null,
                                    objects,
                                    engraving: engraving ? { text: engraving.text, etype: engraving.etype } : null,
                                    trap: trap ? trap.ttyp : null,
                                    trapSeen: trap ? trap.tseen : null,
                                    lineToHero: typeof monlineu === 'function' ? monlineu(mtmp, ax, ay) : null,
                                });
                            }
                        return cells;
                    })(),
                    candidates: candidates.map(({ x, y, tunnel }) => {
                        const trap = (game.level?.traps || []).find((t) => t.tx === x && t.ty === y);
                        const engraving = (game.level?.engravings || []).find((e) => e.x === x && e.y === y);
                        return {
                            x,
                            y,
                            tunnel,
                            objects: (game.level?.objects || []).filter((o) => o.ox === x && o.oy === y).map((o) => o.otyp),
                            engraving: engraving ? { text: engraving.text, etype: engraving.etype } : null,
                            trap: trap ? trap.ttyp : null,
                            lineToHero: typeof monlineu === 'function' ? monlineu(mtmp, x, y) : null,
                        };
                    }),
                };
                    const denom = 4 * (candidates.length - j);`
        );
        source = source.replace(
            '    if (!candidates.length) return MMOVE_NOTHING;',
            `    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportCandidateTrace ||= []).push({
                idx,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                ux: game.u?.ux,
                uy: game.u?.uy,
                mux: mtmp?.mux,
                muy: mtmp?.muy,
                ggx,
                ggy,
                appr,
                candidates: candidates.map(({ x, y, tunnel }) => ({ x, y, tunnel })),
                adjacent: (() => {
                    const cells = [];
                    for (let ax = (mtmp?.mx ?? 0) - 1; ax <= (mtmp?.mx ?? 0) + 1; ax++)
                        for (let ay = (mtmp?.my ?? 0) - 1; ay <= (mtmp?.my ?? 0) + 1; ay++) {
                            if (ax === mtmp?.mx && ay === mtmp?.my) continue;
                            const loc = game.level?.at(ax, ay);
                            const obj = (game.level?.objects || []).find((o) => o.ox === ax && o.oy === ay);
                            const mon = (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === ax && m.my === ay);
                            cells.push({ x: ax, y: ay, typ: loc?.typ, doormask: loc?.doormask, obj: obj?.otyp ?? null, mon: mon?.data?.name || null });
                        }
                    return cells;
                })(),
                currentObj: (game.level?.objects || []).filter((o) => o.ox === mtmp?.mx && o.oy === mtmp?.my).map((o) => o.otyp),
            });
        }
    }
    if (!candidates.length) return MMOVE_NOTHING;`
        );
        source = source.replace(
            'export async function movemon() {\n    const g = game;',
            `export async function movemon() {
    const g = game;
    const __monScanTrace = (phase, mtmp, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx < start || idx > end) return;
        (globalThis.__teleportMonScanTrace ||= []).push({
            idx,
            phase,
            id: mtmp?.m_id,
            name: mtmp?.data?.name,
            mx: mtmp?.mx,
            my: mtmp?.my,
            movement: mtmp?.movement,
            mmove: mtmp?.data?.mmove,
            msleeping: mtmp?.msleeping,
            mcanmove: mtmp?.mcanmove,
            mstrategy: mtmp?.mstrategy,
            mtame: mtmp?.mtame,
            mpeaceful: mtmp?.mpeaceful,
            mflee: mtmp?.mflee,
            mtrack: (mtmp?.mtrack || []).slice(0, 4),
            somebody_can_move,
            ...extra,
        });
    };`
        );
        source = source.replace(
            '        const mtmp = monsters[monIndex];\n        let resumePostMoveForThis = false;',
            `        const mtmp = monsters[monIndex];
        __monScanTrace('scan-entry', mtmp, { monIndex });
        let resumePostMoveForThis = false;`
        );
        source = source.replace(
            '        if (!g.level.monsters?.includes(mtmp)) continue;\n        if (resumePostMoveForThis) {',
            `        if (!g.level.monsters?.includes(mtmp)) {
            __monScanTrace('skip-missing', mtmp, { monIndex });
            continue;
        }
        if (resumePostMoveForThis) {`
        );
        source = source.replace(
            '        m_everyturn_effect(mtmp);\n        if (mtmp.movement < NORMAL_SPEED) continue;\n\n        mtmp.movement -= NORMAL_SPEED;\n        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;',
            `        m_everyturn_effect(mtmp);
        if (mtmp.movement < NORMAL_SPEED) {
            __monScanTrace('skip-budget', mtmp, { monIndex });
            continue;
        }

        __monScanTrace('take-turn-before-subtract', mtmp, { monIndex });
        mtmp.movement -= NORMAL_SPEED;
        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;
        __monScanTrace('take-turn-after-subtract', mtmp, { monIndex });`
        );
        source = source.replace(
            '        if (minliquid_basic(mtmp)) continue;',
            `        if (minliquid_basic(mtmp)) {
            __monScanTrace('skip-minliquid', mtmp, { monIndex });
            continue;
        }`
        );
        source = source.replace(
            '        if (mtmp.mcanmove === 0 || (mtmp.mstrategy & STRAT_WAITMASK)) continue;\n        if (mtmp.msleeping) {',
            `        if (mtmp.mcanmove === 0 || (mtmp.mstrategy & STRAT_WAITMASK)) {
            __monScanTrace('skip-cannot-move-or-wait', mtmp, { monIndex });
            continue;
        }
        if (mtmp.msleeping) {`
        );
        source = source.replace(
            '            if (!awoke) continue;\n        }\n\n        // C ref: monmove.c:dochug().  Awake movable monsters scuff any',
            `            if (!awoke) {
                __monScanTrace('skip-sleeping', mtmp, { monIndex });
                continue;
            }
        }

        __monScanTrace('dochug-entry', mtmp, { monIndex });

        // C ref: monmove.c:dochug().  Awake movable monsters scuff any`
        );
        source = source.replace(
            '        if (mtmp.mcanmove === 0 || (mtmp.mstrategy & STRAT_WAITMASK)) {\n            if (mtmp.mcanmove !== 0',
            `        if (mtmp.mcanmove === 0 || (mtmp.mstrategy & STRAT_WAITMASK)) {
            __monScanTrace('skip-cannot-move-or-wait', mtmp, { monIndex });
            if (mtmp.mcanmove !== 0`
        );
        source = source.replace(
            '        const fleeState = distfleeck(mtmp); // consuming rn2(5)',
            `        {
            const idx = globalThis.__teleportRngTraceIndex || 0;
            const start = globalThis.__teleportApparxyStart ?? -Infinity;
            const end = globalThis.__teleportApparxyEnd ?? Infinity;
            if (idx >= start && idx <= end) {
                globalThis.__teleportMonsterContext = {
                    fn: 'movemon',
                    phase: 'pre-distfleeck',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    movement: mtmp?.movement,
                    mhp: mtmp?.mhp,
                    mhpmax: mtmp?.mhpmax,
                    mcansee: mtmp?.mcansee,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    msleeping: mtmp?.msleeping,
                    mcanmove: mtmp?.mcanmove,
                    weapon_check: mtmp?.weapon_check,
                    mw: mtmp?.mw ? { otyp: mtmp.mw.otyp, spe: mtmp.mw.spe, worn: mtmp.mw.owornmask } : null,
                    inventory: (mtmp?.inventory || []).map((obj) => ({ otyp: obj?.otyp, spe: obj?.spe, worn: obj?.owornmask })),
                    mtrack: (mtmp?.mtrack || []).slice(0, 8),
                };
            }
        }
        const fleeState = distfleeck(mtmp); // consuming rn2(5)
        {
            const idx = globalThis.__teleportRngTraceIndex || 0;
            const start = globalThis.__teleportApparxyStart ?? -Infinity;
            const end = globalThis.__teleportApparxyEnd ?? Infinity;
            if (idx >= start && idx <= end) {
                (globalThis.__teleportDecisionTrace ||= []).push({
                    idx,
                    phase: 'after-distfleeck',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    movement: mtmp?.movement,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    state: fleeState,
                    weapon_check: mtmp?.weapon_check,
                    mw: mtmp?.mw ? { otyp: mtmp.mw.otyp, spe: mtmp.mw.spe, worn: mtmp.mw.owornmask } : null,
                    inventory: (mtmp?.inventory || []).map((obj) => ({ otyp: obj?.otyp, spe: obj?.spe, worn: obj?.owornmask })),
                });
            }
        }`
        );
        source = source.replace(
            '        if (await maybe_use_defensive_item_basic(mtmp, false)) {',
            `        let __teleportDefensiveResult = false;
        {
            const idx = globalThis.__teleportRngTraceIndex || 0;
            const start = globalThis.__teleportApparxyStart ?? -Infinity;
            const end = globalThis.__teleportApparxyEnd ?? Infinity;
            if (idx >= start && idx <= end) {
                const candidate = defensive_item_candidate_basic(mtmp, false);
                (globalThis.__teleportDecisionTrace ||= []).push({
                    idx,
                    phase: 'before-defensive',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    mhp: mtmp?.mhp,
                    mhpmax: mtmp?.mhpmax,
                    mcansee: mtmp?.mcansee,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    nohands: !!((mtmp?.data?.mflags1 ?? 0) & M1_NOHANDS),
                    candidate: candidate ? {
                        kind: candidate.kind,
                        otyp: candidate.obj?.otyp,
                        desc: getObjectDescription(candidate.obj?.otyp),
                        blessed: !!candidate.obj?.blessed,
                        cursed: !!candidate.obj?.cursed,
                    } : null,
                    inventory: (mtmp?.inventory || []).map((obj) => ({ otyp: obj?.otyp, spe: obj?.spe, blessed: !!obj?.blessed, cursed: !!obj?.cursed })),
                });
            }
            __teleportDefensiveResult = await maybe_use_defensive_item_basic(mtmp, false);
            if (idx >= start && idx <= end) {
                (globalThis.__teleportDecisionTrace ||= []).push({
                    idx: globalThis.__teleportRngTraceIndex || idx,
                    phase: 'after-defensive',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    result: __teleportDefensiveResult,
                    mhp: mtmp?.mhp,
                    mhpmax: mtmp?.mhpmax,
                    inventory: (mtmp?.inventory || []).map((obj) => ({ otyp: obj?.otyp, spe: obj?.spe })),
                });
            }
        }
        if (__teleportDefensiveResult) {`
        );
        source = source.replace(
            '        if (!mtmp.mtame && await maybe_wield_hth_before_move(mtmp, fleeState)) {',
            `        let __teleportWieldBeforeMove = false;
        if (!mtmp.mtame) {
            __teleportWieldBeforeMove = await maybe_wield_hth_before_move(mtmp, fleeState);
            const idx = globalThis.__teleportRngTraceIndex || 0;
            const start = globalThis.__teleportApparxyStart ?? -Infinity;
            const end = globalThis.__teleportApparxyEnd ?? Infinity;
            if (idx >= start && idx <= end) {
                (globalThis.__teleportDecisionTrace ||= []).push({
                    idx,
                    phase: 'after-hth-wield-gate',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    movement: mtmp?.movement,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    state: fleeState,
                    result: __teleportWieldBeforeMove,
                    weapon_check: mtmp?.weapon_check,
                    mw: mtmp?.mw ? { otyp: mtmp.mw.otyp, spe: mtmp.mw.spe, worn: mtmp.mw.owornmask } : null,
                    inventory: (mtmp?.inventory || []).map((obj) => ({ otyp: obj?.otyp, spe: obj?.spe, worn: obj?.owornmask })),
                });
            }
        }
        if (!mtmp.mtame && __teleportWieldBeforeMove) {`
        );
        source = source.replace(
            `                // C calls distfleeck() again after m_move() returns for ordinary
                // movement, even when the monster is off-screen.
                postMoveState = distfleeck(mtmp);`,
            `                // C calls distfleeck() again after m_move() returns for ordinary
                // movement, even when the monster is off-screen.
                postMoveState = distfleeck(mtmp);
                {
                    const idx = globalThis.__teleportRngTraceIndex || 0;
                    const start = globalThis.__teleportApparxyStart ?? -Infinity;
                    const end = globalThis.__teleportApparxyEnd ?? Infinity;
                    if (idx >= start && idx <= end) {
                        (globalThis.__teleportDecisionTrace ||= []).push({
                            idx,
                            phase: 'after-postmove-distfleeck',
                            id: mtmp?.m_id,
                            name: mtmp?.data?.name,
                            mx: mtmp?.mx,
                            my: mtmp?.my,
                            movement: mtmp?.movement,
                            moveStatus,
                            postMoveState,
                            ranged: ranged_attk_available_basic(mtmp),
                            atWeap: mon_has_attack_type(mtmp, 'AT_WEAP'),
                            offensive: !!offensive_item_candidate_basic(mtmp),
                        });
                    }
                }`
        );
        source = source.replace(
            `                if (!await maybe_finish_post_move_attack(g, mtmp, moveStatus, postMoveState, somebody_can_move)) {`,
            `                {
                    const idx = globalThis.__teleportRngTraceIndex || 0;
                    const start = globalThis.__teleportApparxyStart ?? -Infinity;
                    const end = globalThis.__teleportApparxyEnd ?? Infinity;
                    if (idx >= start && idx <= end) {
                        (globalThis.__teleportDecisionTrace ||= []).push({
                            idx,
                            phase: 'before-finish-postmove-attack',
                            id: mtmp?.m_id,
                            name: mtmp?.data?.name,
                            mx: mtmp?.mx,
                            my: mtmp?.my,
                            moveStatus,
                            postMoveState,
                            reaches: moved_monster_reaches_attack_phase_basic(mtmp, postMoveState),
                            standard: can_standard_attack_basic(postMoveState),
                        });
                    }
                }
                if (!await maybe_finish_post_move_attack(g, mtmp, moveStatus, postMoveState, somebody_can_move)) {`
        );
        source = source.replace(
            `    let candidates = m_move_candidate_list_basic(mtmp, omx, omy);
    if (!candidates.length && mtmp.data?.mlet === 'S_EEL'`,
            `    let candidates = m_move_candidate_list_basic(mtmp, omx, omy);
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportCandidateTrace ||= []).push({
                idx,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                ux: game.u?.ux,
                uy: game.u?.uy,
                mux: mtmp?.mux,
                muy: mtmp?.muy,
                ggx,
                ggy,
                appr,
                candidates: candidates.map(({ x, y, tunnel }) => ({
                    x,
                    y,
                    tunnel,
                    typ: game.level?.at(x, y)?.typ,
                    doormask: game.level?.at(x, y)?.doormask,
                    objects: (game.level?.objects || []).filter((o) => o.ox === x && o.oy === y).map((o) => o.otyp),
                    mon: (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === x && m.my === y)?.data?.name || null,
                })),
            });
        }
    }
    if (!candidates.length && mtmp.data?.mlet === 'S_EEL'`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/allmain.js')) {
        let source = String(result.source);
        source = source.replace(
            'export async function advanceTurn() {\n    const g = game;',
            `export async function advanceTurn() {
    const g = game;
    {
        const __advanceIdx = globalThis.__teleportRngTraceIndex || 0;
        const __advanceStart = globalThis.__teleportApparxyStart ?? -Infinity;
        const __advanceEnd = globalThis.__teleportApparxyEnd ?? Infinity;
        if (__advanceIdx >= __advanceStart && __advanceIdx <= __advanceEnd) {
            (globalThis.__teleportAdvanceTrace ||= []).push({
                idx: __advanceIdx,
                moves: g.moves,
                contextMove: g.context?.move,
                more: !!g._more,
                pending: g._pending_message || '',
                ux: g.u?.ux ?? null,
                uy: g.u?.uy ?? null,
                ux0: g.u?.ux0 ?? null,
                uy0: g.u?.uy0 ?? null,
                resumeMonsterTurn: !!g._resume_monster_turn,
                resumeTailOnly: !!g._resume_turn_tail_after_more,
                deferredPreTurn: !!g._deferred_pre_turn_after_more,
                monsterPaused: !!g._monster_turn_paused_for_more,
                extraEncumberedTurnPending: !!g._extra_encumbered_turn_pending,
                encumberedMoveDebt: g._encumbered_move_debt ?? null,
                uencumber: g.u?.uencumber || 0,
                umovement: g.u?.umovement ?? null,
                stack: String(new Error().stack || '').split('\\n').slice(2, 9).map((line) => line.trim()),
            });
        }
    }`
        );
        source = source.replace(
            '    for (const m of g.level.monsters) {\n        m.movement += mcalcmove(m, true);\n    }',
            `    for (const m of g.level.monsters) {
        const __allocIdx = globalThis.__teleportRngTraceIndex || 0;
        const __allocStart = globalThis.__teleportApparxyStart ?? -Infinity;
        const __allocEnd = globalThis.__teleportApparxyEnd ?? Infinity;
        const __beforeMovement = m.movement;
        const __gain = mcalcmove(m, true);
        if (__allocIdx >= __allocStart && __allocIdx <= __allocEnd) {
            (globalThis.__teleportMonAllocTrace ||= []).push({
                idx: __allocIdx,
                id: m?.m_id,
                name: m?.data?.name,
                mx: m?.mx,
                my: m?.my,
                movementBefore: __beforeMovement,
                gain: __gain,
                movementAfter: __beforeMovement + __gain,
                mmove: m?.data?.mmove,
                mspeed: m?.mspeed,
                msleeping: m?.msleeping,
                mcanmove: m?.mcanmove,
                mtame: m?.mtame,
                mpeaceful: m?.mpeaceful,
                mflee: m?.mflee,
            });
        }
        m.movement += __gain;
    }`
        );
        return { ...result, source };
    }
    if (url.endsWith('/js/mklev.js')) {
        let source = String(result.source);
        source = source.replace(
            'function sanctumCreateMonster(id, x = null, y = null, peaceful = null) {',
            `function sanctumCreateMonster(id, x = null, y = null, peaceful = null) {
    globalThis.__teleportMonsterContext = { fn: 'sanctumCreateMonster', phase: 'entry', id, x, y, peaceful };`
        );
        source = source.replace(
            '    const mon = makemon(ptr, loc.x, loc.y, alignedCleric ? (MM_ADJACENTOK | MM_EMIN | MM_NOMSG) : 0);',
            `    globalThis.__teleportMonsterContext = {
        fn: 'sanctumCreateMonster',
        phase: 'makemon',
        id,
        ptr: ptr?.name,
        ptrLevel: ptr?.mlevel,
        ptrDifficulty: ptr?.difficulty,
        cls,
        loc,
        alignedCleric,
        peaceful,
    };
    const mon = makemon(ptr, loc.x, loc.y, alignedCleric ? (MM_ADJACENTOK | MM_EMIN | MM_NOMSG) : 0);`
        );
        source = source.replace(
            '        const dir = dirs[rn2(dirs.length)];\n        let pos = mazeMove(x, y, dir);',
            `        const __mazeWalkIdx = globalThis.__teleportRngTraceIndex || 0;
        const __mazeWalkStart = globalThis.__teleportApparxyStart ?? -Infinity;
        const __mazeWalkEnd = globalThis.__teleportApparxyEnd ?? Infinity;
        let __mazeWalkEvent = null;
        if (__mazeWalkIdx >= __mazeWalkStart && __mazeWalkIdx <= __mazeWalkEnd) {
            __mazeWalkEvent = {
                idx: __mazeWalkIdx,
                fn: 'specialWalkfrom',
                x,
                y,
                dirs: dirs.slice(),
                targets: dirs.map((candidateDir) => {
                    let p = mazeMove(x, y, candidateDir);
                    p = mazeMove(p.x, p.y, candidateDir);
                    return { dir: candidateDir, x: p.x, y: p.y, typ: game.level?.at(p.x, p.y)?.typ };
                }),
            };
            (globalThis.__teleportMazeWalkTrace ||= []).push(__mazeWalkEvent);
        }
        const dir = dirs[rn2(dirs.length)];
        if (__mazeWalkEvent) __mazeWalkEvent.chosen = dir;
        let pos = mazeMove(x, y, dir);`
        );
        return { ...result, source };
    }
    if (!url.endsWith('/js/rng.js')) return result;

    let source = String(result.source);
    source = source.replace(
        "export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }",
        `export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }

function __traceRngEntry(entry) {
    if (globalThis.__teleportRngStackTrace) {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        globalThis.__teleportRngTraceIndex = idx + 1;
        const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '';
        const stack = String(new Error().stack || '')
            .split('\\n')
            .slice(2, 9)
            .map((line) => line.trim().replace(cwd + '/', ''));
        (globalThis.__teleportRngTrace ||= []).push({
            idx,
            entry,
            stack,
            monster: globalThis.__teleportMonsterContext || null,
        });
    }
    if (_rngLogEnabled) _rngLog.push(entry);
}`
    );
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);", "__traceRngEntry(`rn2(${x})=${val}`);");
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);", "__traceRngEntry(`rnd(${x})=${val}`);");
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);", "__traceRngEntry(`rnl(${x})=${val}`);");
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);", "__traceRngEntry(`d(${n},${x})=${sum}`);");
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`);", "__traceRngEntry(`rne(${x})=${tmp}`);");
    source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`);", "__traceRngEntry(`rnz(${i})=${x}`);");
    return { ...result, source };
}
