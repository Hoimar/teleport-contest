export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/dog.js')) return result;

    let source = String(result.source);
    source = source.replace(
        'function pet_goal(mtmp, after, udist, whappr) {',
        `function pet_goal(mtmp, after, udist, whappr) {
    const __dogTrace = (event) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        const wanted = Number(process.env.TRACE_DOG_ID || 82);
        if (mtmp?.m_id !== wanted || idx < start || idx > end) return;
        console.log('[dog-trace]', JSON.stringify({
            idx,
            event,
            id: mtmp?.m_id,
            name: mtmp?.data?.name,
            x: mtmp?.mx,
            y: mtmp?.my,
            movement: mtmp?.movement,
            after,
            udist,
            whappr,
            mtrack: mtmp?.mtrack || [],
        }));
    };
    __dogTrace({ phase: 'goal-entry' });`
    );
    source = source.replace(
        '    const dogHasMinvent = !!pet_droppable(mtmp);\n',
        `    const dogHasMinvent = !!pet_droppable(mtmp);
    __dogTrace({
        phase: 'goal-context',
        inMastersSight,
        dogHasMinvent,
        hero: { x: gx, y: gy },
        locTyp: loc?.typ,
        petLocTyp: petLoc?.typ,
        petLit: petLoc?.lit,
        heroLit: loc?.lit,
        apport: edog?.apport,
        hungrytime: edog?.hungrytime,
        initialAppr: appr,
    });
`
    );
    source = source.replace(
        '    for (const obj of game.level?.objects || []) {\n',
        `    let __dogObjIndex = -1;
    for (const obj of game.level?.objects || []) {
        __dogObjIndex++;
`
    );
    source = source.replace(
        `        const foodType = dogfood(mtmp, obj);
        if (foodType > goalType || foodType === UNDEF) continue;`,
        `        const foodType = dogfood(mtmp, obj);
        __dogTrace({
            phase: 'object-scan',
            objectIndex: __dogObjIndex,
            otyp: obj.otyp,
            oclass: obj.oclass,
            quan: obj.quan,
            x: nx,
            y: ny,
            foodType,
            goalType,
            cursedAt: cursed_object_at(nx, ny),
            canReachItem: could_reach_item(mtmp, nx, ny),
            canReachLocation: can_reach_location(mtmp, mtmp.mx, mtmp.my, nx, ny),
            petCanSee: pet_can_see_object(mtmp, nx, ny),
            carry: can_carry(mtmp, obj),
        });
        if (foodType > goalType || foodType === UNDEF) continue;`
    );
    source = source.replace(
        `        } else if (goalType === UNDEF && inMastersSight && !dogHasMinvent
                   && (!petLoc?.lit || loc?.lit)
                   && (foodType === MANFOOD || pet_can_see_object(mtmp, nx, ny))
                   && edog.apport > rn2(8)
                   && can_carry(mtmp, obj) > 0) {
            goalX = nx;
            goalY = ny;
            goalType = APPORT;
        }`,
        `        } else if (goalType === UNDEF && inMastersSight && !dogHasMinvent
                   && (!petLoc?.lit || loc?.lit)
                   && (foodType === MANFOOD || pet_can_see_object(mtmp, nx, ny))) {
            const __apportRoll = rn2(8);
            const __carry = can_carry(mtmp, obj);
            __dogTrace({
                phase: 'object-apport-gate',
                objectIndex: __dogObjIndex,
                otyp: obj.otyp,
                oclass: obj.oclass,
                quan: obj.quan,
                x: nx,
                y: ny,
                foodType,
                apport: edog.apport,
                apportRoll: __apportRoll,
                carry: __carry,
                pass: edog.apport > __apportRoll && __carry > 0,
            });
            if (edog.apport > __apportRoll && __carry > 0) {
                goalX = nx;
                goalY = ny;
                goalType = APPORT;
            }
        }`
    );
    source = source.replace(
        `    if (goalType !== UNDEF && (goalType === DOGFOOD || goalType === APPORT
        || (game.moves || 0) >= (edog.hungrytime || 0))) {
        return { abort: false, gx: goalX, gy: goalY, appr: 1 };
    }`,
        `    if (goalType !== UNDEF && (goalType === DOGFOOD || goalType === APPORT
        || (game.moves || 0) >= (edog.hungrytime || 0))) {
        __dogTrace({ phase: 'goal-object-return', goalType, goalX, goalY, appr: 1 });
        return { abort: false, gx: goalX, gy: goalY, appr: 1 };
    }`
    );
    source = source.replace(
        `    if (after && udist <= 4) {
        return { abort: true, gx, gy, appr };
    }`,
        `    if (after && udist <= 4) {
        __dogTrace({ phase: 'goal-abort-close', gx, gy, appr });
        return { abort: true, gx, gy, appr };
    }`
    );
    source = source.replace(
        '    return { abort: false, gx: followX, gy: followY, appr };\n}',
        `    __dogTrace({ phase: 'goal-follow-return', followX, followY, appr, inMastersSight });
    return { abort: false, gx: followX, gy: followY, appr };
}`
    );
    source = source.replace(
        'async function dog_move_after_inventory_core(mtmp, after, udist, edog) {',
        `async function dog_move_after_inventory_core(mtmp, after, udist, edog) {
    const __dogMoveTrace = (event) => {
        const idx = globalThis.__teleportRngTraceIndex || 0;
        const start = globalThis.__teleportApparxyStart ?? -Infinity;
        const end = globalThis.__teleportApparxyEnd ?? Infinity;
        const wanted = Number(process.env.TRACE_DOG_ID || 82);
        if (mtmp?.m_id !== wanted || idx < start || idx > end) return;
        console.log('[dog-trace]', JSON.stringify({
            idx,
            event,
            id: mtmp?.m_id,
            name: mtmp?.data?.name,
            x: mtmp?.mx,
            y: mtmp?.my,
            movement: mtmp?.movement,
            after,
            udist,
            mtrack: mtmp?.mtrack || [],
        }));
    };
    __dogMoveTrace({ phase: 'move-entry' });`
    );
    source = source.replace(
        '    if (goal.abort) return 0;\n',
        `    if (goal.abort) {
        __dogMoveTrace({ phase: 'move-abort-goal', goal });
        return 0;
    }
    __dogMoveTrace({ phase: 'move-goal', goal });\n`
    );
    source = source.replace(
        `            const ndist = dist2(nx, ny, goal.gx, goal.gy);
            const j = (ndist - nidist) * goal.appr;
            if ((j === 0 && !rn2(++chcnt))`,
        `            const ndist = dist2(nx, ny, goal.gx, goal.gy);
            const j = (ndist - nidist) * goal.appr;
            __dogMoveTrace({
                phase: 'candidate-eval',
                nx,
                ny,
                ndist,
                nidist,
                j,
                chcnt,
                currentBest: { x: nix, y: niy },
                cursedOnCandidate,
            });
            if ((j === 0 && !rn2(++chcnt))`
    );
    source = source.replace(
        `                nix = nx;
                niy = ny;
                nidist = ndist;
                moveReluctant = cursedOnCandidate;`,
        `                __dogMoveTrace({
                    phase: 'candidate-select',
                    nx,
                    ny,
                    ndist,
                    oldBest: { x: nix, y: niy, nidist },
                    j,
                });
                nix = nx;
                niy = ny;
                nidist = ndist;
                moveReluctant = cursedOnCandidate;`
    );
    source = source.replace(
        `    if (nix === mtmp.mx && niy === mtmp.my) return 0;
    const oldx = mtmp.mx;`,
        `    if (nix === mtmp.mx && niy === mtmp.my) {
        __dogMoveTrace({ phase: 'move-stay', nix, niy, nidist });
        return 0;
    }
    __dogMoveTrace({ phase: 'move-commit', nix, niy, nidist });
    const oldx = mtmp.mx;`
    );

    return { ...result, source };
}
