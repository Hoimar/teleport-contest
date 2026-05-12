import { game } from './gstate.js';
import { d, rn2, rnd } from './rng.js';
import { dog_move } from './dog.js';
import {
    D_CLOSED, D_LOCKED, IS_DOOR, IS_LAVA, IS_OBSTRUCTED, IS_POOL,
    IS_WATERWALL, M_AP_FURNITURE, M_AP_OBJECT, isok, SPACE_POS,
} from './const.js';
import { newsym } from './display.js';

const NORMAL_SPEED = 12;
const BOLT_LIM = 8;
const M2_WERE = 0x00000004;
const M2_HUMAN = 0x00000008;
const M2_WANDER = 0x00800000;
const M1_FLY = 0x00000001;
const M1_SWIM = 0x00000002;
const M1_HIDE = 0x00000100;
const MTSZ = 4;
const MSLOW = 1;
const MFAST = 2;
const BASIC_MELEE_ATTACKS = new Set(['AT_CLAW', 'AT_KICK', 'AT_BITE', 'AT_STNG', 'AT_TUCH', 'AT_BUTT', 'AT_TENT']);

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

function set_apparxy_basic(mtmp) {
    // C ref: monmove.c:set_apparxy().  In the current visibility model the
    // hero is neither invisible nor displaced, so monsters target the real
    // hero square.  This is especially important for u.ustuck while swallowed.
    mtmp.mux = game.u?.ux ?? mtmp.mx;
    mtmp.muy = game.u?.uy ?? mtmp.my;
}

function is_hider(mtmp) {
    return !!(mtmp.data?.mflags1 & M1_HIDE);
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

function mon_in_air(mtmp) {
    return !!((mtmp.data?.mflags1 ?? 0) & M1_FLY);
}

function mon_swims(mtmp) {
    return !!((mtmp.data?.mflags1 ?? 0) & M1_SWIM) || !!mtmp.data?.swimmer;
}

function mon_likes_lava(mtmp) {
    return !!mtmp.data?.likes_lava;
}

function mfndpos_terrain_ok(mtmp, x, y) {
    if (!isok(x, y)) return false;
    const loc = game.level?.at(x, y);
    if (!loc) return false;
    const typ = loc.typ;

    // C ref: mon.c:mfndpos().  Obstructed rock/walls are blocked here
    // until ALLOW_WALL/ALLOW_DIG are ported.
    if (IS_OBSTRUCTED(typ)) return false;
    if (IS_WATERWALL(typ) && !mon_swims(mtmp)) return false;
    if (IS_DOOR(typ)) return !(loc.doormask & (D_CLOSED | D_LOCKED));

    const wantpool = mtmp.data?.mlet === 'S_EEL';
    const poolok = mon_in_air(mtmp) || (mon_swims(mtmp) && !wantpool);
    const lavaok = mon_in_air(mtmp) || mon_likes_lava(mtmp);
    if (!poolok && (IS_POOL(typ) !== wantpool)) return false;
    if (!lavaok && IS_LAVA(typ)) return false;
    return SPACE_POS(typ) || IS_POOL(typ) || IS_LAVA(typ);
}

function can_mon_step(mtmp, x, y) {
    if (x === game.u?.ux && y === game.u?.uy) return false;
    if (mon_at(x, y, mtmp)) return false;
    return mfndpos_terrain_ok(mtmp, x, y);
}

function mon_track_add(mtmp, x, y) {
    if (!mtmp.mtrack) mtmp.mtrack = [];
    mtmp.mtrack.unshift({ x, y });
    if (mtmp.mtrack.length > MTSZ) mtmp.mtrack.length = MTSZ;
}

function monster_level(mtmp) {
    return mtmp?.m_lev ?? mtmp?.data?.mlevel ?? 0;
}

function attack_is_basic_physical(attack) {
    if (!attack) return true;
    const [aatyp, adtyp, damn, damd] = attack;
    return BASIC_MELEE_ATTACKS.has(aatyp)
        && adtyp === 'AD_PHYS'
        && damn > 0
        && damd > 0;
}

function basic_physical_attacks(mtmp) {
    const attacks = mtmp.data?.mattk || [];
    if (attacks.filter(Boolean).length < 2) return null;
    if (!attacks.every(attack_is_basic_physical)) return null;
    return attacks;
}

function basic_engulf_attack(mtmp) {
    const attacks = mtmp.data?.mattk || [];
    const realAttacks = attacks.filter(Boolean);
    if (realAttacks.length !== 1) return null;
    const attack = realAttacks[0];
    const [aatyp, adtyp, damn, damd] = attack;
    if (aatyp !== 'AT_ENGL' || damn <= 0 || damd <= 0) return null;
    if (!['AD_COLD', 'AD_FIRE', 'AD_ELEC', 'AD_PHYS', 'AD_ACID'].includes(adtyp)) return null;
    return attack;
}

function hero_ac_value() {
    const uac = game.u?.uac ?? 10;
    return uac >= 0 ? uac : -rnd(-uac);
}

function reduce_damage_by_negative_ac(damage) {
    const uac = game.u?.uac ?? 10;
    if (damage > 0 && uac < 0) {
        damage -= rnd(-uac);
        if (damage < 1) damage = 1;
    }
    return damage;
}

function mhitm_knockback_frontdoor() {
    // C ref: uhitm.c:mhitm_knockback() computes these two rolls before
    // most qualification checks, including attack-type eligibility.
    rn2(3);
    rn2(6);
}

function mattacku_to_hit(mtmp) {
    let toHit = hero_ac_value() + 10 + monster_level(mtmp);
    if ((game._occupation_turns_remaining || 0) > 0) toHit += 4;
    if (mtmp.mcansee === 0) toHit -= 2;
    if (mtmp.mtrapped) toHit -= 2;
    if (toHit <= 0) toHit = 1;
    return toHit;
}

function apply_hero_damage(damage) {
    if (damage > 0) game.u.uhp = Math.max(0, (game.u.uhp ?? 0) - damage);
}

function engulf_attack(mtmp, attack, toHit) {
    const [, adtyp, damn, damd] = attack;
    const alreadySwallowed = game.u?.uswallow && game.u?.ustuck === mtmp;
    if (!alreadySwallowed && !(toHit > rnd(20))) return true;
    let damage = d(damn, damd);
    if (!alreadySwallowed) {
        game.u.uswallow = true;
        game.u.ustuck = mtmp;
        mtmp.mx = game.u.ux;
        mtmp.my = game.u.uy;
        game.u.uswldtim = Math.max(2, rnd(monster_level(mtmp) + 5));
    } else if ((game.u.uswldtim || 0) > 0) {
        game.u.uswldtim--;
    }

    switch (adtyp) {
    case 'AD_COLD':
    case 'AD_FIRE':
    case 'AD_ELEC':
        if (mtmp.mcan || !rn2(2)) damage = 0;
        break;
    case 'AD_PHYS':
        damage = reduce_damage_by_negative_ac(damage);
        break;
    case 'AD_ACID':
        break;
    default:
        damage = 0;
        break;
    }
    apply_hero_damage(damage);
    if (damage > 0) game._occupation_turns_remaining = 0;
    return true;
}

function physical_melee_attacks(mtmp, attacks, toHit) {
    for (let i = 0; i < attacks.length; i++) {
        const attack = attacks[i];
        if (!attack) continue;
        const [, , damn, damd] = attack;
        if (toHit > rnd(20 + i)) {
            let damage = d(damn, damd);
            mhitm_knockback_frontdoor();
            damage = reduce_damage_by_negative_ac(damage);
            apply_hero_damage(damage);
            if ((game.u?.uhp ?? 0) <= 0) break;
        }
    }
    return true;
}

function mattacku_basic(mtmp, state) {
    if (!state?.nearby || state.scared || mtmp.mpeaceful || mtmp.mtame) return false;
    if ((game._occupation_turns_remaining || 0) > 1 || game._occupation_finish_uac != null) return false;
    if ((game.u?.uhp ?? 1) <= 0) return false;

    const engulf = basic_engulf_attack(mtmp);
    const physical = engulf ? null : basic_physical_attacks(mtmp);
    if (!engulf && !physical) return false;
    const toHit = mattacku_to_hit(mtmp);
    return engulf ? engulf_attack(mtmp, engulf, toHit) : physical_melee_attacks(mtmp, physical, toHit);
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
    let appr = mtmp.mflee ? -1 : 1;
    // C ref: monmove.c:m_move().  While swallowed, bystander monsters
    // spend their movement opportunity without ordinary path selection.
    if (game.u?.uswallow && !mtmp.mflee && game.u?.ustuck !== mtmp) return 1;
    if (mtmp.mconf || (mtmp.mpeaceful && !mtmp.isshk)) appr = 0;
    if (appr === 1
        && (mtmp.data?.name === 'STALKER' || mtmp.data?.mlet === 'S_BAT' || mtmp.data?.mlet === 'S_LIGHT')
        && !rn2(3)) {
        appr = 0;
    }
    if (!mtmp.mpeaceful || !rn2(10)) {
        // m_search_items() remains future work; this preserves the C front
        // door before ordinary candidate selection.
    }
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
        if (visible_gas_region_at(mtmp.mx, mtmp.my)) return;
        const ttl = 4 + rn2(3); // create_gas_cloud(..., 1, 0) TTL via rn1(3, 4)
        game.level.gasClouds = game.level.gasClouds || [];
        game.level.gasClouds.push({ x: mtmp.mx, y: mtmp.my, ttl });
    }
}

function visible_gas_region_at(x, y) {
    return (game.level?.gasClouds || []).some((region) =>
        region.ttl > 0 && region.x === x && region.y === y);
}

function age_gas_clouds() {
    const clouds = game.level?.gasClouds;
    if (!clouds?.length) return;
    for (const cloud of clouds) cloud.ttl--;
    game.level.gasClouds = clouds.filter((cloud) => cloud.ttl > 0);
}

function were_change(mtmp) {
    const flags = mtmp.data?.mflags2 ?? 0;
    if (!(flags & M2_WERE)) return;
    const fullMoon = game.flags?.moonphase === 4; // FULL_MOON
    const atNight = !!game.iflags?.at_night;
    if (flags & M2_HUMAN) {
        const denom = atNight ? (fullMoon ? 3 : 30) : (fullMoon ? 10 : 50);
        if (!rn2(denom)) {
            // new_were() state transformation is still future work; this
            // preserves the turn-boundary RNG ownership for unchanged rolls.
        }
    } else if (!rn2(30)) {
        // See note above.
    }
}

export function mcalcdistress() {
    for (const mtmp of game.level?.monsters || []) {
        were_change(mtmp);
    }
}

export async function movemon() {
    const g = game;
    let somebody_can_move = false;
    if (g._gas_clouds_aged_turn !== g.moves) {
        age_gas_clouds();
        g._gas_clouds_aged_turn = g.moves;
    }

    // In a real engine, we'd iterate over all monsters.
    // For now, let's just handle the monsters we have.
    for (const mtmp of g.level.monsters) {
        // C ref: mon.c:movemon_singlemon() runs this before the movement
        // budget check, so zero-budget fog clouds still leave vapor.
        m_everyturn_effect(mtmp);
        if (mtmp.movement < NORMAL_SPEED) continue;

        mtmp.movement -= NORMAL_SPEED;
        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;

        // C ref: monmove.c:dochug() returns before distfleeck() for frozen,
        // waiting, or still-sleeping monsters. Disturb/wake-up RNG is not
        // modeled yet, so sleeping monsters spend movement without movement
        // AI until that front door is ported.
        if (mtmp.mcanmove === 0 || mtmp.msleeping) continue;
        if (is_hider(mtmp)
            && (mtmp.m_ap_type === M_AP_FURNITURE
                || mtmp.m_ap_type === M_AP_OBJECT
                || mtmp.mundetected)) {
            continue;
        }

        // dochugw -> dochug
        set_apparxy_basic(mtmp);
        const fleeState = distfleeck(mtmp); // consuming rn2(5)
        
        // C ref: monmove.c:dochug() delegates tame monsters to
        // dogmove.c:dog_move() after the shared distfleeck() phase.
        if (mtmp.mtame) {
            if (is_wanderer(mtmp) && monnear_hero(mtmp)) rn2(4);
            dog_move(mtmp, false);
            distfleeck(mtmp);
        } else {
            let postMoveState = fleeState;
            let moveStatus = 0;
            if (non_tame_movement_opportunity(mtmp, fleeState)) {
                moveStatus = m_move_basic(mtmp);
                // C calls distfleeck() again after m_move() returns for ordinary
                // movement, even when the monster is off-screen.
                postMoveState = distfleeck(mtmp);
            }
            if (moveStatus !== 1) mattacku_basic(mtmp, postMoveState);
        }
    }
    
    return somebody_can_move;
}
