export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/allmain_turns.js')) {
        let source = String(result.source);
        source = source.replace(
            'export function exercise(index, increase) {\n',
            `export function exercise(index, increase) {
    const __exerciseTraceBefore = () => ({
        idx: globalThis.__teleportRngTraceIndex || 0,
        index,
        increase: !!increase,
        moves: game.moves,
        before: game.u?.aexe ? [...game.u.aexe] : null,
        acurr: game.u?.acurr?.a ? [...game.u.acurr.a] : null,
        hunger: game.u?.uhunger,
        uhs: game.u?.uhs,
        uencumber: game.u?.uencumber,
        props: game.u?.uprops ? { ...game.u.uprops } : null,
        context: {
            next_attrib_check: game.context?.next_attrib_check,
            run: game.context?.run,
            multi: game.context?.multi,
        },
        stack: String(new Error().stack || '')
            .split('\\n')
            .slice(2, 8)
            .map((line) => line.trim().replace((typeof process !== 'undefined' && process.cwd ? process.cwd() : '') + '/', '')),
    });
    const __exerciseTrace = globalThis.__teleportExerciseTrace ? __exerciseTraceBefore() : null;
`
        );
        source = source.replace(
            '        game.u.aexe[index] -= rn2(2);\n    }\n}\n',
            `        game.u.aexe[index] -= rn2(2);
    }
    if (__exerciseTrace) {
        __exerciseTrace.after = game.u?.aexe ? [...game.u.aexe] : null;
        __exerciseTrace.rngAfter = globalThis.__teleportRngTraceIndex || 0;
        (globalThis.__teleportExerciseTraceLog ||= []).push(__exerciseTrace);
    }
}
`
        );
        return { ...result, source };
    }
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
    if (url.endsWith('/js/display.js')) {
        let source = String(result.source);
        source = source.replace(
            'export function newsym(x, y) {\n',
            `export function newsym(x, y) {
    {
        const __newsymIdx = globalThis.__teleportRngTraceIndex || 0;
        const __newsymStart = globalThis.__teleportApparxyStart ?? -Infinity;
        const __newsymEnd = globalThis.__teleportApparxyEnd ?? Infinity;
        if (__newsymIdx >= __newsymStart && __newsymIdx <= __newsymEnd) {
            const loc = game.level?.at(x, y);
            const mon = (game.level?.monsters || []).find((m) => m.mx === x && m.my === y);
            (globalThis.__teleportNewsymTrace ||= []).push({
                idx: __newsymIdx,
                x,
                y,
                typ: loc?.typ ?? null,
                viz: game.viz_array?.[y]?.[x] ?? null,
                lit: !!loc?.lit,
                disp: loc ? { ch: loc.disp_ch, color: loc.disp_color, dec: loc.disp_decgfx } : null,
                remembered: loc?.remembered_glyph || null,
                mon: mon ? { id: mon.m_id, name: mon.data?.name, mx: mon.mx, my: mon.my } : null,
                ux: game.u?.ux,
                uy: game.u?.uy,
                pending: game._pending_message || '',
                stack: String(new Error().stack || '').split('\\n').slice(2, 7).map((line) => line.trim().replace((typeof process !== 'undefined' && process.cwd ? process.cwd() : '') + '/', '')),
            });
        }
    }
`
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
        uinvis: game.u?.uinvis,
        Invis: game.u?.Invis,
        upInvisible: game.u?.uprops?.invisible,
        upBlind: game.u?.uprops?.blind,
        upBlinded: game.u?.uprops?.blinded,
        mcansee: mtmp?.mcansee,
        mflags1: mtmp?.data?.mflags1,
    });
    const __apparxyTrace = (event) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportApparxyTrace ||= []).push({ idx, ...__apparxyCtxBase(), ...event });
        }
    };
    __apparxyTrace({ phase: 'entry' });`
        );
        source = source.replace(
            `    if (mtmp.mtame || game.u?.ustuck === mtmp || (mx === ux && my === uy)) {
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`,
            `    if (mtmp.mtame || game.u?.ustuck === mtmp || (mx === ux && my === uy)) {
        __apparxyTrace({
            phase: 'early-known',
            mtame: !!mtmp.mtame,
            stuck: game.u?.ustuck === mtmp,
            rememberedHero: mx === ux && my === uy,
        });
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`
        );
        source = source.replace(
            `    if (!displ) {
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`,
            `    if (!displ) {
        __apparxyTrace({ phase: 'no-displ', notseen, notthere, displ });
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`
        );
        source = source.replace(
            'const gotu = notseen ? !rn2(3) : notthere ? !rn2(4) : false;',
            `globalThis.__teleportMonsterContext = { ...__apparxyCtxBase(), phase: 'gotu', notseen, notthere, displ };
    const gotu = notseen ? !rn2(3) : notthere ? !rn2(4) : false;
    __apparxyTrace({ phase: 'after-gotu', notseen, notthere, displ, gotu });`
        );
        source = source.replace(
            `    if (gotu) {
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`,
            `    if (gotu) {
        __apparxyTrace({ phase: 'gotu-known', notseen, notthere, displ });
        mtmp.mux = ux;
        mtmp.muy = uy;
        return;
    }`
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
            `        if (!seen) continue;
        mtmp.mux = mx;
        mtmp.muy = my;
        return;
    }
    mtmp.mux = ux;
    mtmp.muy = uy;
}`,
            `        if (!seen) continue;
        __apparxyTrace({
            phase: 'accepted',
            tryCnt,
            displ,
            mx,
            my,
            notseen,
            notthere,
        });
        mtmp.mux = mx;
        mtmp.muy = my;
        return;
    }
    __apparxyTrace({ phase: 'punt', notseen, notthere, displ });
    mtmp.mux = ux;
    mtmp.muy = uy;
}`
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
            '    let chcnt = 0;\n    let moved = false;\n    const jcnt = Math.min(MTSZ, candidates.length - 1, mtmp.mtrack?.length || 0);',
            `    let chcnt = 0;
    let moved = false;
    {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportCandidateTrace ||= []).push({
                idx,
                phase: 'm_move-candidates',
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
                mtrack: (mtmp?.mtrack || []).slice(0, 8),
                candidates: candidates.map(({ x, y, tunnel }) => {
                    const loc = game.level?.at(x, y);
                    const mon = (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === x && m.my === y);
                    const trap = (game.level?.traps || []).find((t) => t.tx === x && t.ty === y);
                    return {
                        x,
                        y,
                        tunnel,
                        typ: loc?.typ,
                        doormask: loc?.doormask,
                        roomno: loc?.roomno,
                        edge: !!loc?.edge,
                        mon: mon?.data?.name || null,
                        boulder: !!(game.level?.objects || []).find((o) => o.ox === x && o.oy === y && o.otyp === BOULDER),
                        trap: trap?.ttyp ?? null,
                    };
                }),
                adjacent: (() => {
                    const cells = [];
                    for (let ax = (mtmp?.mx ?? 0) - 1; ax <= (mtmp?.mx ?? 0) + 1; ax++)
                        for (let ay = (mtmp?.my ?? 0) - 1; ay <= (mtmp?.my ?? 0) + 1; ay++) {
                            if (ax === mtmp?.mx && ay === mtmp?.my) continue;
                            const loc = game.level?.at(ax, ay);
                            const mon = (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === ax && m.my === ay);
                            const trap = (game.level?.traps || []).find((t) => t.tx === ax && t.ty === ay);
                            cells.push({
                                x: ax,
                                y: ay,
                                typ: loc?.typ,
                                doormask: loc?.doormask,
                                roomno: loc?.roomno,
                                edge: !!loc?.edge,
                                mon: mon?.data?.name || null,
                                boulder: !!(game.level?.objects || []).find((o) => o.ox === ax && o.oy === ay && o.otyp === BOULDER),
                                trap: trap?.ttyp ?? null,
                            });
                        }
                    return cells;
                })(),
            });
        }
    }
    const jcnt = Math.min(MTSZ, candidates.length - 1, mtmp.mtrack?.length || 0);`
        );
        source = source.replace(
            '            || (appr === 0 && !rn2(++chcnt))',
            `            || (appr === 0 && (() => {
                const idx = globalThis.__teleportRngTraceIndex || 0;
                const start = globalThis.__teleportApparxyStart ?? -Infinity;
                const end = globalThis.__teleportApparxyEnd ?? Infinity;
                if (idx >= start && idx <= end) {
                    const loc = game.level?.at(cand.x, cand.y);
                    const mon = (game.level?.monsters || []).find((m) => m !== mtmp && m.mx === cand.x && m.my === cand.y);
                    globalThis.__teleportMonsterContext = {
                        fn: 'm_move_basic',
                        phase: 'neutral-choice',
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
                        candidate: {
                            x: cand.x,
                            y: cand.y,
                            tunnel: cand.tunnel,
                            typ: loc?.typ,
                            doormask: loc?.doormask,
                            roomno: loc?.roomno,
                            mon: mon?.data?.name || null,
                        },
                        chcntBefore: chcnt,
                        candidates: candidates.map(({ x, y, tunnel }) => ({
                            x,
                            y,
                            tunnel,
                            typ: game.level?.at(x, y)?.typ,
                            doormask: game.level?.at(x, y)?.doormask,
                        })),
                        mtrack: (mtmp?.mtrack || []).slice(0, 8),
                    };
                }
                return !rn2(++chcnt);
            })())`
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
            `    if (getitems) {
        const itemGoal = m_search_items_basic(mtmp, ggx, ggy, appr);`,
            `    if (getitems) {
        const __teleportItemSearchBefore = { ggx, ggy, appr };
        const itemGoal = m_search_items_basic(mtmp, ggx, ggy, appr);
        {
            const idx = globalThis.__teleportRngTraceIndex || 0;
            const start = globalThis.__teleportApparxyStart ?? -Infinity;
            const end = globalThis.__teleportApparxyEnd ?? Infinity;
            if (idx >= start && idx <= end) {
                (globalThis.__teleportDecisionTrace ||= []).push({
                    idx,
                    phase: 'after-item-search',
                    id: mtmp?.m_id,
                    name: mtmp?.data?.name,
                    mx: mtmp?.mx,
                    my: mtmp?.my,
                    ux: game.u?.ux,
                    uy: game.u?.uy,
                    mux: mtmp?.mux,
                    muy: mtmp?.muy,
                    before: __teleportItemSearchBefore,
                    itemGoal,
                    objects: (game.level?.objects || [])
                        .filter((obj) => Math.abs((obj.ox ?? -99) - mtmp.mx) <= 5
                            && Math.abs((obj.oy ?? -99) - mtmp.my) <= 5)
                        .map((obj) => ({ otyp: obj.otyp, oclass: obj.oclass, ox: obj.ox, oy: obj.oy, quan: obj.quan })),
                });
            }
        }`
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
    if (url.endsWith('/js/dog.js')) {
        let source = String(result.source);
        const dogRedrawMode = process.env.TRACE_DOG_REDRAW_MODE || '';
        if (dogRedrawMode === 'no-old' || dogRedrawMode === 'none') {
            source = source.replace(
                '    newsym(oldx, oldy);\n',
                '    // trace-only: suppress ordinary pet old-square redraw\n'
            );
        }
        if (dogRedrawMode === 'no-new' || dogRedrawMode === 'none') {
            source = source.replace(
                '        newsym(nix, niy);\n',
                '        // trace-only: suppress ordinary pet new-square redraw\n'
            );
        }
        source = source.replace(
            'function pet_goal(mtmp, after, udist, whappr) {\n',
            `function pet_goal(mtmp, after, udist, whappr) {
    const __petGoalObj = (obj) => obj ? {
        otyp: obj.otyp,
        oclass: obj.oclass,
        ox: obj.ox,
        oy: obj.oy,
        quan: obj.quan,
        cursed: !!obj.cursed,
        blessed: !!obj.blessed,
        worn: obj.owornmask || 0,
    } : null;
    const __petGoalTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportPetGoalTrace ||= []).push({
                idx,
                phase,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                movement: mtmp?.movement,
                mflee: !!mtmp?.mflee,
                ux: game.u?.ux,
                uy: game.u?.uy,
                mux: mtmp?.mux,
                muy: mtmp?.muy,
                after,
                udist,
                whappr,
                ...extra,
            });
        }
    };
    const __dogMoveSquareFacts = (x, y, allowHeroTarget = false) => {
        const loc = game.level?.at(x, y);
        const target = mon_at(x, y, mtmp);
        return {
            x,
            y,
            typ: loc?.typ ?? null,
            doormask: loc?.doormask ?? null,
            edge: !!loc?.edge,
            horizontal: !!loc?.horizontal,
            lit: !!loc?.lit,
            viz: game.viz_array?.[y]?.[x] ?? null,
            diagonal: x !== mtmp.mx && y !== mtmp.my,
            doorBlocksFrom: door_blocks_diagonal(mtmp.mx, mtmp.my),
            doorBlocksTo: door_blocks_diagonal(x, y),
            sideA: game.level?.at(mtmp.mx, y)?.typ ?? null,
            sideB: game.level?.at(x, mtmp.my)?.typ ?? null,
            heroTarget: pet_candidate_is_hero_target(mtmp, x, y),
            monster: target ? {
                id: target.m_id,
                name: target.data?.name,
                mtame: !!target.mtame,
                mpeaceful: !!target.mpeaceful,
                mx: target.mx,
                my: target.my,
            } : null,
            boulder: is_boulder_at(x, y),
            cursed: cursed_object_at(x, y),
            trap: (() => {
                const trap = trap_at(x, y);
                return trap ? { ttyp: trap.ttyp, tseen: !!trap.tseen } : null;
            })(),
            objects: objects_at(x, y).map((obj) => ({
                otyp: obj.otyp,
                cursed: !!obj.cursed,
                quan: obj.quan,
            })),
            canEnter: pet_can_enter_square(mtmp, x, y, {
                ignoreMonster: !!target,
                allowHeroTarget,
            }),
            canEnterStrict: pet_can_enter_square(mtmp, x, y, { allowHeroTarget }),
        };
    };
`
        );
        source = source.replace(
            '    const dogHasMinvent = !!pet_droppable(mtmp);\n    for (const obj of game.level?.objects || []) {',
            `    const dogHasMinvent = !!pet_droppable(mtmp);
    __petGoalTrace('entry', {
        appr,
        dogHasMinvent,
        inMastersSight,
        heroLoc: loc ? { typ: loc.typ, lit: !!loc.lit } : null,
        petLoc: petLoc ? { typ: petLoc.typ, lit: !!petLoc.lit } : null,
        edog: {
            apport: edog?.apport,
            hungrytime: edog?.hungrytime,
            mhpmax_penalty: edog?.mhpmax_penalty,
            ogoal: edog?.ogoal ? { ...edog.ogoal } : null,
        },
        search: { minX, maxX, minY, maxY },
        floorObjects: (game.level?.objects || [])
            .filter((obj) => obj && obj.ox >= minX && obj.ox <= maxX && obj.oy >= minY && obj.oy <= maxY)
            .map(__petGoalObj),
        inventory: (game.inventory || []).map(__petGoalObj),
    });
    for (const obj of game.level?.objects || []) {`
        );
        source = source.replace(
            '        const foodType = dogfood(mtmp, obj);\n        if (foodType > goalType || foodType === UNDEF) continue;',
            `        const foodType = dogfood(mtmp, obj);
        __petGoalTrace('floor-dogfood', {
            obj: __petGoalObj(obj),
            foodType,
            goalType,
            goalX,
            goalY,
        });
        if (foodType > goalType || foodType === UNDEF) continue;`
        );
        source = source.replace(
            '                goalType = foodType;\n            }\n        } else if (goalType === UNDEF && inMastersSight && !dogHasMinvent',
            `                goalType = foodType;
                __petGoalTrace('floor-food-goal', {
                    obj: __petGoalObj(obj),
                    foodType,
                    goalType,
                    goalX,
                    goalY,
                });
            }
        } else if (goalType === UNDEF && inMastersSight && !dogHasMinvent`
        );
        source = source.replace(
            '            goalType = APPORT;\n        }\n    }\n\n    // C ref: dogmove.c:dog_goal(). Non-apport/non-dogfood goals are ignored',
            `            goalType = APPORT;
            __petGoalTrace('floor-apport-goal', {
                obj: __petGoalObj(obj),
                goalType,
                goalX,
                goalY,
            });
        }
    }
    __petGoalTrace('after-floor', { goalType, goalX, goalY, appr });

    // C ref: dogmove.c:dog_goal(). Non-apport/non-dogfood goals are ignored`
        );
        source = source.replace(
            '        return { abort: false, gx: goalX, gy: goalY, appr: 1 };\n',
            `        __petGoalTrace('return-floor-goal', { goalType, goalX, goalY, appr: 1 });
        return { abort: false, gx: goalX, gy: goalY, appr: 1 };
`
        );
        source = source.replace(
            '        return { abort: true, gx, gy, appr };\n',
            `        __petGoalTrace('return-abort-after', { goalType, goalX, goalY, appr, gx, gy });
        return { abort: true, gx, gy, appr };
`
        );
        source = source.replace(
            '                for (const obj of game.inventory || []) {\n                    if (typeof obj.otyp !== \'number\') continue;\n                    if (dogfood(mtmp, obj) === DOGFOOD) {',
            `                __petGoalTrace('inventory-scan-start', { appr, goalType, goalX, goalY });
                for (const obj of game.inventory || []) {
                    if (typeof obj.otyp !== 'number') continue;
                    const __petGoalFoodType = dogfood(mtmp, obj);
                    __petGoalTrace('inventory-dogfood', {
                        obj: __petGoalObj(obj),
                        foodType: __petGoalFoodType,
                        appr,
                    });
                    if (__petGoalFoodType === DOGFOOD) {`
        );
        source = source.replace(
            '    return {\n        abort: false,\n        gx: followX,\n        gy: followY,\n        appr,',
            `    __petGoalTrace('return-follow', {
        goalType,
        goalX,
        goalY,
        followX,
        followY,
        appr,
        inMastersSight,
        ogoal: edog?.ogoal ? { ...edog.ogoal } : null,
    });
    return {
        abort: false,
        gx: followX,
        gy: followY,
        appr,`
        );
        source = source.replace(
            'async function dog_move_after_inventory_core(mtmp, after, udist, edog) {\n',
            `async function dog_move_after_inventory_core(mtmp, after, udist, edog) {
    const __dogMoveTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx >= start && idx <= end) {
            (globalThis.__teleportDogMoveTrace ||= []).push({
                idx,
                phase,
                id: mtmp?.m_id,
                name: mtmp?.data?.name,
                mx: mtmp?.mx,
                my: mtmp?.my,
                movement: mtmp?.movement,
                mflee: !!mtmp?.mflee,
                ux: game.u?.ux,
                uy: game.u?.uy,
                after,
                udist,
                ...extra,
            });
        }
    };
    const __dogMoveSquareFacts = (x, y, allowHeroTarget = false) => {
        const loc = game.level?.at(x, y);
        const target = mon_at(x, y, mtmp);
        return {
            x,
            y,
            typ: loc?.typ ?? null,
            doormask: loc?.doormask ?? null,
            edge: !!loc?.edge,
            horizontal: !!loc?.horizontal,
            lit: !!loc?.lit,
            viz: game.viz_array?.[y]?.[x] ?? null,
            diagonal: x !== mtmp.mx && y !== mtmp.my,
            doorBlocksFrom: door_blocks_diagonal(mtmp.mx, mtmp.my),
            doorBlocksTo: door_blocks_diagonal(x, y),
            sideA: game.level?.at(mtmp.mx, y)?.typ ?? null,
            sideB: game.level?.at(x, mtmp.my)?.typ ?? null,
            heroTarget: pet_candidate_is_hero_target(mtmp, x, y),
            monster: target ? {
                id: target.m_id,
                name: target.data?.name,
                mtame: !!target.mtame,
                mpeaceful: !!target.mpeaceful,
                mx: target.mx,
                my: target.my,
            } : null,
            boulder: is_boulder_at(x, y),
            cursed: cursed_object_at(x, y),
            trap: (() => {
                const trap = trap_at(x, y);
                return trap ? { ttyp: trap.ttyp, tseen: !!trap.tseen } : null;
            })(),
            objects: objects_at(x, y).map((obj) => ({
                otyp: obj.otyp,
                cursed: !!obj.cursed,
                quan: obj.quan,
            })),
            canEnter: pet_can_enter_square(mtmp, x, y, {
                ignoreMonster: !!target,
                allowHeroTarget,
            }),
            canEnterStrict: pet_can_enter_square(mtmp, x, y, { allowHeroTarget }),
        };
    };
`
        );
        source = source.replace(
            '    const goal = pet_goal(mtmp, after, udist, whappr);\n    if (goal.abort) return 0;\n',
            `    const goal = pet_goal(mtmp, after, udist, whappr);
    __dogMoveTrace('goal', { whappr, goal: { ...goal } });
    if (goal.abort) {
        __dogMoveTrace('abort', { whappr, goal: { ...goal } });
        return 0;
    }
`
        );
        source = source.replace(
            '    searchCandidates:\n',
            `    __dogMoveTrace('candidate-count', {
        uncursedcnt,
        mfndposcnt,
        squares: (() => {
            const items = [];
            for (let sx = Math.max(1, mtmp.mx - 1); sx <= maxx; sx++) {
                for (let sy = Math.max(0, mtmp.my - 1); sy <= maxy; sy++) {
                    if (sx === mtmp.mx && sy === mtmp.my) continue;
                    items.push(__dogMoveSquareFacts(sx, sy, allowHeroTarget));
                }
            }
            return items;
        })(),
    });

    searchCandidates:
`
        );
        source = source.replace(
            '            const ndist = dist2(nx, ny, goal.gx, goal.gy);\n            const j = (ndist - nidist) * goal.appr;\n',
            `            const ndist = dist2(nx, ny, goal.gx, goal.gy);
            const j = (ndist - nidist) * goal.appr;
            const __dogMoveBefore = { nix, niy, nidist, chcnt };
            __dogMoveTrace('candidate', {
                nx,
                ny,
                target: target?.data?.name || null,
                cursedOnCandidate,
                canReachFood,
                trap: trap ? { tt: trap.ttyp, tseen: !!trap.tseen } : null,
                ndist,
                j,
                before: __dogMoveBefore,
                objects: objects_at(nx, ny).map((obj) => ({ otyp: obj.otyp, cursed: !!obj.cursed })),
            });
`
        );
        source = source.replace(
            `                attackHeroTarget = isHeroTarget;
                continue;
            }
            if ((j === 0 && !rn2(++chcnt))`,
            `                attackHeroTarget = isHeroTarget;
                __dogMoveTrace('forced-select', {
                    nx,
                    ny,
                    ndist,
                    j,
                    before: __dogMoveBefore,
                    afterSelect: { nix, niy, nidist, chcnt },
                });
                continue;
            }
            if ((j === 0 && !rn2(++chcnt))`
        );
        source = source.replace(
            `                if (j < 0) chcnt = 0;
            }
        }
    }
`,
            `                if (j < 0) chcnt = 0;
                __dogMoveTrace('select', {
                    nx,
                    ny,
                    ndist,
                    j,
                    before: __dogMoveBefore,
                    afterSelect: { nix, niy, nidist, chcnt },
                });
            }
        }
    }
`
        );
        source = source.replace(
            `    if (!doEat) pet_ranged_attk(mtmp, false);

    if (attackHeroTarget && (nix !== mtmp.mx || niy !== mtmp.my)) {`,
            `    __dogMoveTrace('after-candidates', {
        nix,
        niy,
        nidist,
        chcnt,
        doEat,
        moveReluctant,
        attackHeroTarget,
    });
    if (!doEat) pet_ranged_attk(mtmp, false);

    if (attackHeroTarget && (nix !== mtmp.mx || niy !== mtmp.my)) {`
        );
        source = source.replace(
            `        mtmp._dog_conflict_attack_u = true;
        return 3;
    }

    if (nix === mtmp.mx && niy === mtmp.my) {`,
            `        mtmp._dog_conflict_attack_u = true;
        __dogMoveTrace('attack-hero-target', { nix, niy });
        return 3;
    }

    if (nix === mtmp.mx && niy === mtmp.my) {`
        );
        source = source.replace(
            `        // Falling through dog_move() reports MMOVE_MOVED even when no new
        // square was selected, so post-move trap effects still run.
        return 1;
    }
    const oldx = mtmp.mx;`,
            `        // Falling through dog_move() reports MMOVE_MOVED even when no new
        // square was selected, so post-move trap effects still run.
        __dogMoveTrace('no-move', { nix, niy });
        return 1;
    }
    const oldx = mtmp.mx;`
        );
        source = source.replace(
            `    const wasSeen = hero_can_spot_pet_basic(mtmp);
    mtmp.mx = nix;
    mtmp.my = niy;`,
            `    const wasSeen = hero_can_spot_pet_basic(mtmp);
    __dogMoveTrace('move', { oldx, oldy, nix, niy, doEat, moveReluctant });
    mtmp.mx = nix;
    mtmp.my = niy;`
        );
        source = source.replace(
            'function monster_visible_combat_square(mon) {',
            `function monster_visible_combat_square(mon) {
    const __combatIdx = globalThis.__teleportRngTraceIndex || 0;
    const __combatStart = globalThis.__teleportApparxyStart ?? -Infinity;
    const __combatEnd = globalThis.__teleportApparxyEnd ?? Infinity;
    if (__combatIdx >= __combatStart && __combatIdx <= __combatEnd) {
        (globalThis.__teleportCombatVisibilityTrace ||= []).push({
            idx: __combatIdx,
            name: mon?.data?.name,
            id: mon?.m_id,
            mx: mon?.mx,
            my: mon?.my,
            ux: game.u?.ux,
            uy: game.u?.uy,
            viz: game.viz_array?.[mon?.my]?.[mon?.mx] ?? null,
            cansee: mon ? cansee(mon.mx, mon.my) : false,
            couldsee: mon ? couldsee(mon.mx, mon.my) : false,
            minvis: mon?.minvis,
            mundetected: mon?.mundetected,
            infravision: !!game.u?.uprops?.infravision,
            mflags3: mon?.data?.mflags3,
            pending: game._pending_message || '',
            stack: String(new Error().stack || '').split('\\n').slice(2, 8).map((line) => line.trim()),
        });
    }`
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
            'function getbones() {\n    const flags = game.flags || {};\n',
            `function getbones() {
    const flags = game.flags || {};
    const __getbonesTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx < start || idx > end) return;
        const __uz = game.u?.uz ? { ...game.u.uz } : null;
        const __special = game.specialLevels?.find((lev) =>
            lev?.dlevel?.dnum === __uz?.dnum && lev?.dlevel?.dlevel === __uz?.dlevel) || null;
        const __dungeon = game.dungeons?.[__uz?.dnum ?? 0] || null;
        (globalThis.__teleportBonesTrace ||= []).push({
            idx,
            phase,
            uz: __uz,
            special: __special ? {
                proto: __special.proto,
                boneid: __special.boneid,
                rndlevs: __special.rndlevs,
            } : null,
            dungeon: __dungeon ? {
                name: __dungeon.dname,
                boneid: __dungeon.boneid,
                num_dunlevs: __dungeon.num_dunlevs,
            } : null,
            debug: !!game.flags?.debug,
            explore: !!flags.explore,
            bonesFlag: flags.bones,
            ...extra,
        });
    };
`
        );
        source = source.replace(
            'function put_lregion_here(x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev) {\n',
            `function __teleportLregionTrace(phase, x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev, extra = {}) {
    const idx = globalThis.__teleportRngTraceIndex || 0;
    const start = globalThis.__teleportApparxyStart ?? -Infinity;
    const end = globalThis.__teleportApparxyEnd ?? Infinity;
    if (idx < start || idx > end) return;
    const loc = game.level?.at(x, y);
    const mons = game.level?.monsters || [];
    const objs = game.level?.objects || [];
    const traps = game.level?.traps || [];
    const mon = m_at(x, y);
    const trap = traps.find((t) => t.tx === x && t.ty === y) || null;
    const terrainOk = !!loc && (loc.typ === ROOM || loc.typ === AIR
        || (loc.typ === CORR && game.level?.flags?.is_maze_lev));
    let occ = null;
    try {
        occ = occupied(x, y);
    } catch {
        occ = null;
    }
    (globalThis.__teleportLregionTrace ||= []).push({
        idx,
        phase,
        x,
        y,
        nlx,
        nly,
        nhx,
        nhy,
        rtype,
        oneshot: !!oneshot,
        lev: lev ? { ...lev } : null,
        uz: game.u?.uz ? { ...game.u.uz } : null,
        special: typeof currentSpecialLevel === 'function' ? currentSpecialLevel()?.proto || null : null,
        lastSpecialProtofile: game._last_special_protofile || null,
        levelFlags: game.level?.flags ? { ...game.level.flags } : null,
        hero: { x: game.u?.ux, y: game.u?.uy },
        loc: loc ? {
            typ: loc.typ,
            roomno: loc.roomno,
            edge: !!loc.edge,
            doormask: loc.doormask,
            flags: loc.flags,
            lit: !!loc.lit,
            horizontal: !!loc.horizontal,
        } : null,
        terrainOk,
        occupied: occ,
        inNoArea: within_bounded_area(x, y, nlx, nly, nhx, nhy),
        trap: trap ? { ttyp: trap.ttyp, tx: trap.tx, ty: trap.ty, tseen: trap.tseen, once: trap.once } : null,
        monster: mon ? {
            name: mon.data?.name,
            mx: mon.mx,
            my: mon.my,
            m_id: mon.m_id,
            mtame: !!mon.mtame,
            mpeaceful: !!mon.mpeaceful,
            mtrapped: !!mon.mtrapped,
        } : null,
        objects: objs
            .filter((o) => o.ox === x && o.oy === y)
            .map((o) => ({ otyp: o.otyp, quan: o.quan, spe: o.spe, oclass: o.oclass })),
        monsterCount: mons.length,
        trapCount: traps.length,
        ...extra,
        stack: String(new Error().stack || '')
            .split('\\n')
            .slice(2, 8)
            .map((line) => line.trim().replace((typeof process !== 'undefined' && process.cwd ? process.cwd() : '') + '/', '')),
    });
}

function put_lregion_here(x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev) {
`
        );
        source = source.replace(
            '    if (bad_location(x, y, nlx, nly, nhx, nhy)) return false;\n    if ((rtype === LR_TELE || rtype === LR_UPTELE || rtype === LR_DOWNTELE) && m_at(x, y)) {\n        return !!oneshot;\n    }\n',
            `    const __lregionBad = bad_location(x, y, nlx, nly, nhx, nhy);
    __teleportLregionTrace('candidate', x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev, {
        badLocation: __lregionBad,
    });
    if (__lregionBad) {
        __teleportLregionTrace('reject-bad-location', x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev, {
            badLocation: __lregionBad,
        });
        return false;
    }
    const __lregionMonster = (rtype === LR_TELE || rtype === LR_UPTELE || rtype === LR_DOWNTELE)
        ? m_at(x, y)
        : null;
    if (__lregionMonster) {
        __teleportLregionTrace(oneshot ? 'accept-monster-oneshot' : 'reject-monster', x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev, {
            badLocation: false,
        });
        return !!oneshot;
    }
`
        );
        source = source.replace(
            '    return true;\n}\n\nconst CC_INCL_CENTER',
            `    __teleportLregionTrace('accept', x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev, {
        badLocation: false,
    });
    return true;
}

const CC_INCL_CENTER`
        );
        source = source.replace(
            '    if (flags.explore) return false;\n    if (flags.bones === false) return false;\n    if (rn2(3) && !game.flags?.debug) return false;\n    if (no_bones_level()) return false;\n\n    const key = bones_file_key();\n    const text = key ? vfsReadFile(key) : null;\n    if (!text) return false;\n',
            `    if (flags.explore) {
        __getbonesTrace('skip-explore');
        return false;
    }
    if (flags.bones === false) {
        __getbonesTrace('skip-disabled');
        return false;
    }
    const __roll = rn2(3);
    __getbonesTrace('roll', { roll: __roll });
    if (__roll && !game.flags?.debug) {
        __getbonesTrace('skip-roll', { roll: __roll });
        return false;
    }
    const __noBones = no_bones_level();
    __getbonesTrace('no-bones-check', { noBones: __noBones });
    if (__noBones) return false;

    const key = bones_file_key();
    const text = key ? vfsReadFile(key) : null;
    __getbonesTrace('file-check', { key, hasText: !!text });
    if (!text) return false;
`
        );
        source = source.replace(
            '    const deleted = vfsDeleteFile(key);\n    return ok && deleted;\n',
            `    const deleted = vfsDeleteFile(key);
    __getbonesTrace('restore-result', { key, ok, deleted });
    return ok && deleted;
`
        );
        source = source.replace(
            'function join(a, b, nxcor) {\n    const g = game;\n',
            `function join(a, b, nxcor) {
    const g = game;
    const __corrTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx < start || idx > end) return;
        const __locInfo = (x, y) => {
            const loc = game.level?.at(x, y);
            return loc ? {
                x, y,
                typ: loc.typ,
                roomno: loc.roomno,
                edge: !!loc.edge,
                flags: loc.flags,
                doormask: loc.doormask,
                lit: !!loc.lit,
            } : { x, y, missing: true };
        };
        (globalThis.__teleportCorridorTrace ||= []).push({
            idx,
            phase,
            a,
            b,
            nxcor,
            nroom: game.level?.nroom,
            smeq: game.smeq ? game.smeq.slice(0, game.level?.nroom || 0) : [],
            ...extra,
            locs: (extra.locs || []).map(([x, y]) => __locInfo(x, y)),
        });
    };
`
        );
        source = source.replace(
            '    const dig_result = dig_corridor(org, dest, npoints, nxcor, ftyp, STONE);\n    if ((npoints.v > 0) && (okdoor(xx, yy) || !nxcor))\n        dodoor(xx, yy, croom);\n    if (!dig_result) return;\n    if (okdoor(tt.x, tt.y) || !nxcor)\n        dodoor(tt.x, tt.y, troom);\n',
            `    const dig_result = dig_corridor(org, dest, npoints, nxcor, ftyp, STONE);
    const __originOk = okdoor(xx, yy);
    __corrTrace('post-dig', {
        croom: croom ? { lx: croom.lx, hx: croom.hx, ly: croom.ly, hy: croom.hy, roomnoidx: croom.roomnoidx, doorct: croom.doorct, fdoor: croom.fdoor, needjoining: croom.needjoining } : null,
        troom: troom ? { lx: troom.lx, hx: troom.hx, ly: troom.ly, hy: troom.hy, roomnoidx: troom.roomnoidx, doorct: troom.doorct, fdoor: troom.fdoor, needjoining: troom.needjoining } : null,
        dx, dy, xx, yy, tx, ty,
        org: { ...org },
        dest: { ...dest },
        npoints: npoints.v,
        dig_result,
        originOk: __originOk,
        locs: [[xx, yy], [xx + dx, yy + dy], [tt.x, tt.y], [tx, ty]],
    });
    if ((npoints.v > 0) && (__originOk || !nxcor)) {
        __corrTrace('door-origin', { x: xx, y: yy, locs: [[xx, yy]] });
        dodoor(xx, yy, croom);
    }
    if (!dig_result) {
        __corrTrace('dig-failed-return', { locs: [[xx, yy], [tt.x, tt.y]] });
        return;
    }
    const __destOk = okdoor(tt.x, tt.y);
    __corrTrace('before-dest-door', {
        destOk: __destOk,
        locs: [[xx, yy], [tt.x, tt.y], [tt.x - dx, tt.y - dy], [tx, ty]],
    });
    if (__destOk || !nxcor) {
        __corrTrace('door-dest', { x: tt.x, y: tt.y, locs: [[tt.x, tt.y]] });
        dodoor(tt.x, tt.y, troom);
    }
`
        );
        source = source.replace(
            '    let num = 0;\n    const weights = new Map();\n',
            `    let num = 0;
    const weights = new Map();
    const __mkclassTraceItems = [];
    const __mkclassTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx < start || idx > end) return;
        (globalThis.__teleportMkclassTrace ||= []).push({
            idx,
            phase,
            mlet,
            spc,
            atyp,
            maxmlev,
            moves: game.moves,
            uz: game.u?.uz ? { ...game.u.uz } : null,
            ulevel: game.u?.ulevel,
            zlevel: level_difficulty(),
            inhell: Inhell(),
            special: currentSpecialLevel()?.proto || null,
            ...extra,
            stack: String(new Error().stack || '')
                .split('\\n')
                .slice(2, 8)
                .map((line) => line.trim().replace((typeof process !== 'undefined' && process.cwd ? process.cwd() : '') + '/', '')),
        });
    };
`
        );
        source = source.replace(
            '            const weight = k + 1 - (adj_lev_for(ptr) > ((game.u?.ulevel ?? 1) * 2) ? 1 : 0);\n            weights.set(ptr, weight);\n            num += weight;\n',
            `            const __adjLev = adj_lev_for(ptr);
            const __biasThreshold = (game.u?.ulevel ?? 1) * 2;
            const weight = k + 1 - (__adjLev > __biasThreshold ? 1 : 0);
            __mkclassTraceItems.push({
                name: ptr.name,
                mlevel: ptr.mlevel,
                difficulty: ptr.difficulty,
                geno: ptr.geno,
                k,
                adjLev: __adjLev,
                biasThreshold: __biasThreshold,
                biased: __adjLev > __biasThreshold,
                weight,
                numBefore: num,
                numAfter: num + weight,
            });
            weights.set(ptr, weight);
            num += weight;
`
        );
        source = source.replace(
            '    if (!num) return null;\n\n    let pick = rnd(num);\n',
            `    if (!num) {
        __mkclassTrace('empty', { entries: __mkclassTraceItems });
        return null;
    }

    __mkclassTrace('pick', { num, entries: __mkclassTraceItems });
    let pick = rnd(num);
`
        );
        source = source.replace(
            'function rndmonst_adj(minadj = 0, maxadj = 0) {',
            `function rndmonst_adj(minadj = 0, maxadj = 0) {
    const __rndmonstTrace = (phase, extra = {}) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        if (idx < start || idx > end) return;
        (globalThis.__teleportRndmonstTrace ||= []).push({
            idx,
            phase,
            minadj,
            maxadj,
            moves: game.moves,
            uz: game.u?.uz ? { ...game.u.uz } : null,
            ulevel: game.u?.ulevel,
            special: currentSpecialLevel()?.proto || null,
            specialAlign: currentSpecialLevel()?.flags?.align ?? null,
            dungeonAlign: game.dungeons?.[game.u?.uz?.dnum ?? 0]?.flags?.align ?? null,
            ...extra,
        });
    };`
        );
        source = source.replace(
            '            let mdat = null;\n',
            `            {
                const idx = globalThis.__teleportRngTraceIndex || 0;
                const start = globalThis.__teleportApparxyStart ?? -Infinity;
                const end = globalThis.__teleportApparxyEnd ?? Infinity;
                if (idx >= start && idx <= end) {
                    const mons = game.level?.monsters || [];
                    const objs = game.level?.objects || [];
                    (globalThis.__teleportZooTrace ||= []).push({
                        idx,
                        phase: 'cell',
                        type,
                        sx,
                        sy,
                        loc: loc ? { typ: loc.typ, roomno: loc.roomno, edge: loc.edge } : null,
                        occupied: !!m_at(sx, sy),
                        monster: mons.find(m => m.mx === sx && m.my === sy)?.data?.name || null,
                        existingGold: objs.find(o => o.otyp === GOLD_PIECE && o.ox === sx && o.oy === sy)?.quan || 0,
                        goldlim,
                        door: door ? { x: door.x, y: door.y } : null,
                    });
                }
            }
            let mdat = null;
`
        );
        source = source.replace(
            '            makemon(mdat, sx, sy, MM_ASLEEP | MM_NOGRP);\n',
            `            {
                const idx = globalThis.__teleportRngTraceIndex || 0;
                const start = globalThis.__teleportApparxyStart ?? -Infinity;
                const end = globalThis.__teleportApparxyEnd ?? Infinity;
                const beforeCount = game.level?.monsters?.length || 0;
                const made = makemon(mdat, sx, sy, MM_ASLEEP | MM_NOGRP);
                if (idx >= start && idx <= end) {
                    (globalThis.__teleportZooTrace ||= []).push({
                        idx: globalThis.__teleportRngTraceIndex || idx,
                        phase: 'makemon',
                        type,
                        sx,
                        sy,
                        requested: mdat?.name || null,
                        made: made?.data?.name || null,
                        beforeCount,
                        afterCount: game.level?.monsters?.length || 0,
                    });
                }
            }
`
        );
        source = source.replace(
            `    const zlevel = level_difficulty();
    const minmlev = monmin_difficulty(zlevel) + minadj;
    const maxmlev = monmax_difficulty(zlevel) + maxadj;
    let totalweight = 0;
    let selected = null;`,
            `    const zlevel = level_difficulty();
    const minmlev = monmin_difficulty(zlevel) + minadj;
    const maxmlev = monmax_difficulty(zlevel) + maxadj;
    let totalweight = 0;
    let selected = null;
    __rndmonstTrace('entry', { zlevel, minmlev, maxmlev });`
        );
        source = source.replace(
            `        const weight = (ptr.geno & G_FREQ) + align_shift(ptr) + temperature_shift(ptr);
        if (weight <= 0) continue;
        totalweight += weight;
        if (rn2(totalweight) < weight) selected = ptr;`,
            `        const baseWeight = (ptr.geno & G_FREQ);
        const alignWeight = align_shift(ptr);
        const tempWeight = temperature_shift(ptr);
        const weight = baseWeight + alignWeight + tempWeight;
        if (weight <= 0) continue;
        totalweight += weight;
        __rndmonstTrace('candidate', {
            name: ptr.name,
            difficulty: ptr.difficulty,
            maligntyp: ptr.maligntyp,
            geno: ptr.geno,
            baseWeight,
            alignWeight,
            tempWeight,
            weight,
            totalweight,
        });
        if (rn2(totalweight) < weight) selected = ptr;`
        );
        source = source.replace(
            `    }
    return selected;
}`,
            `    }
    __rndmonstTrace('return', { selected: selected?.name || null, totalweight });
    return selected;
}`
        );
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
        source = source.replace(
            '    if (game.level?.monsters) game.level.monsters.unshift(mon);\n',
            `    if (game.level?.monsters) game.level.monsters.unshift(mon);
    if (globalThis.__teleportBigrmTrace && game._last_special_protofile === 'bigrm-1') {
        (globalThis.__teleportBigrmMonsterTrace ||= []).push({
            idx: globalThis.__teleportRngTraceIndex || 0,
            event: 'makemon',
            name: ptr?.name,
            x,
            y,
            id: m_id,
            mmflags,
            noGroup: !!(mmflags & MM_NOGRP),
            peaceful: !!peaceful,
            asleep: !!mon.msleeping,
            invisible: !!mon.minvis,
        });
    }
`
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
