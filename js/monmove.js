import { game } from './gstate.js';
import { rn2 } from './rng.js';
import { dog_move } from './dog.js';
import { D_CLOSED, D_LOCKED, IS_DOOR, isok, SPACE_POS } from './const.js';
import { newsym } from './display.js';

const NORMAL_SPEED = 12;
const BOLT_LIM = 8;
const M2_WANDER = 0x00800000;
const MTSZ = 4;
const MSLOW = 1;
const MFAST = 2;

export function mcalcmove(mtmp, m_moving) {
    let mmove = mtmp.data.mmove;

    // C ref: mon.c:mcalcmove() speed adjustments.
    if (mtmp.mspeed === MSLOW) {
        if (mmove < NORMAL_SPEED) mmove = Math.trunc((2 * mmove + 1) / 3);
        else mmove = 4 + Math.trunc(mmove / 3);
    } else if (mtmp.mspeed === MFAST) {
        mmove = Math.trunc((4 * mmove + 2) / 3);
    }

    if (m_moving) {
        const mmove_adj = mmove % NORMAL_SPEED;
        mmove -= mmove_adj;
        if (rn2(NORMAL_SPEED) < mmove_adj) {
            mmove += NORMAL_SPEED;
        }
    }
    return mmove;
}

export function distfleeck(mtmp) {
    // C ref: monmove.c:538
    // boolean sawscary = FALSE, bravegremlin = (rn2(5) == 0);
    rn2(5); // bravegremlin check

    const targetX = mtmp.mux ?? game.u?.ux ?? mtmp.mx;
    const targetY = mtmp.muy ?? game.u?.uy ?? mtmp.my;
    const d2 = dist2(mtmp.mx, mtmp.my, targetX, targetY);
    return {
        inrange: d2 <= BOLT_LIM * BOLT_LIM,
        nearby: d2 < 3,
        // Elbereth, sanctuary, and light-fleeing behavior are not modeled yet.
        scared: false,
    };
}

function is_wanderer(mtmp) {
    // C ref: mondata.h:is_wanderer() checks M2_WANDER; explicit pet data
    // still marks startup pet records created before full monster data.
    return !!mtmp.data?.m2_wander || !!(mtmp.data?.mflags2 & M2_WANDER);
}

function dist2(x0, y0, x1, y1) {
    const dx = x0 - x1;
    const dy = y0 - y1;
    return dx * dx + dy * dy;
}

function monnear_hero(mtmp) {
    // C ref: mon.c:monnear().  dochug() short-circuits before the
    // is_wanderer() RNG gate when the pet is not near its target.
    return dist2(mtmp.mx, mtmp.my, game.u?.ux ?? mtmp.mx, game.u?.uy ?? mtmp.my) < 3;
}

function non_tame_movement_opportunity(mtmp, state) {
    // C ref: monmove.c:dochug() movement-opportunity predicate before
    // m_move().  Only the front-door predicates represented in JS state are
    // modeled here; far-away monsters take the no-RNG short-circuit.
    if (!state.nearby || mtmp.mflee || state.scared || mtmp.mconf || mtmp.mstun) return true;
    if (mtmp.minvis && !rn2(3)) return true;
    if (is_wanderer(mtmp) && !rn2(4)) return true;
    if (mtmp.mcansee === 0 && !rn2(4)) return true;
    if (mtmp.mpeaceful) return true;
    return false;
}

function mon_at(x, y, self) {
    return (game.level?.monsters || []).find((mon) => mon !== self && mon.mx === x && mon.my === y);
}

function can_mon_step(mtmp, x, y) {
    if (!isok(x, y)) return false;
    if (x === game.u?.ux && y === game.u?.uy) return false;
    if (mon_at(x, y, mtmp)) return false;
    const loc = game.level?.at(x, y);
    return !!loc && (SPACE_POS(loc.typ)
        || (IS_DOOR(loc.typ) && !(loc.doormask & (D_CLOSED | D_LOCKED))));
}

function mon_track_add(mtmp, x, y) {
    if (!mtmp.mtrack) mtmp.mtrack = [];
    mtmp.mtrack.unshift({ x, y });
    if (mtmp.mtrack.length > MTSZ) mtmp.mtrack.length = MTSZ;
}

function m_move_basic(mtmp) {
    // C ref: monmove.c:m_move().  This is a narrow ordinary-monster
    // movement skeleton: adjacent candidates, mtrack backtracking rolls, and
    // deterministic approach/flee selection.  Item pickup, doors, tunneling,
    // attacks, and special monsters remain future subsystem work.
    const omx = mtmp.mx;
    const omy = mtmp.my;
    const ggx = mtmp.mux ?? game.u?.ux ?? omx;
    const ggy = mtmp.muy ?? game.u?.uy ?? omy;
    const appr = mtmp.mflee ? -1 : 1;
    const candidates = [];
    const maxx = Math.min(omx + 1, 79);
    const maxy = Math.min(omy + 1, 20);
    for (let nx = Math.max(1, omx - 1); nx <= maxx; nx++) {
        for (let ny = Math.max(0, omy - 1); ny <= maxy; ny++) {
            if (nx === omx && ny === omy) continue;
            if (!can_mon_step(mtmp, nx, ny)) continue;
            candidates.push({ x: nx, y: ny });
        }
    }
    if (!candidates.length) return 0;

    let nix = omx;
    let niy = omy;
    let nidist = dist2(nix, niy, ggx, ggy);
    let chcnt = 0;
    let moved = false;
    const jcnt = Math.min(MTSZ, candidates.length - 1, mtmp.mtrack?.length || 0);

    candidateLoop:
    for (const cand of candidates) {
        if (appr !== 0) {
            for (let j = 0; j < jcnt; j++) {
                const trk = mtmp.mtrack[j];
                if (cand.x === trk.x && cand.y === trk.y && rn2(4 * (candidates.length - j))) {
                    continue candidateLoop;
                }
            }
        }

        const ndist = dist2(cand.x, cand.y, ggx, ggy);
        const nearer = ndist < nidist;
        if ((appr === 1 && nearer)
            || (appr === -1 && !nearer)
            || (appr === 0 && !rn2(++chcnt))
            || !moved) {
            nix = cand.x;
            niy = cand.y;
            nidist = ndist;
            moved = true;
        }
    }

    if (!moved || (nix === omx && niy === omy)) return 0;
    mtmp.mx = nix;
    mtmp.my = niy;
    mon_track_add(mtmp, omx, omy);
    newsym(omx, omy);
    newsym(nix, niy);
    return 1;
}

function m_everyturn_effect(mtmp) {
    if (mtmp.data?.name === 'FOG_CLOUD') {
        rn2(3); // create_gas_cloud(..., 1, 0) TTL via rn1(3, 4)
    }
}

export async function movemon() {
    const g = game;
    let somebody_can_move = false;

    // In a real engine, we'd iterate over all monsters.
    // For now, let's just handle the monsters we have.
    for (const mtmp of g.level.monsters) {
        // C ref: mon.c:movemon_singlemon() runs this before the movement
        // budget check, so zero-budget fog clouds still leave vapor.
        m_everyturn_effect(mtmp);
        if (mtmp.movement < NORMAL_SPEED) continue;

        mtmp.movement -= NORMAL_SPEED;
        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;

        // dochugw -> dochug
        const fleeState = distfleeck(mtmp); // consuming rn2(5)
        
        // C ref: monmove.c:dochug() delegates tame monsters to
        // dogmove.c:dog_move() after the shared distfleeck() phase.
        if (mtmp.mtame) {
            if (is_wanderer(mtmp) && monnear_hero(mtmp)) rn2(4);
            dog_move(mtmp, false);
            distfleeck(mtmp);
        } else if (non_tame_movement_opportunity(mtmp, fleeState)) {
            m_move_basic(mtmp);
            // C calls distfleeck() again after m_move() returns for ordinary
            // movement, even when the monster is off-screen.
            distfleeck(mtmp);
        }
    }
    
    return somebody_can_move;
}
