#!/usr/bin/env node

// Trace the JS state feeding dogmove.c:dog_goal() without modifying
// production modules.  This is a diagnostic helper for pet/object parity:
// it runs one session prefix, then prints the tame pet, hero, dog-goal
// search rectangle, retained floor objects inside it, hero inventory, and
// an optional flat RNG window.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import {
    APPORT, CADAVER, DOGFOOD, MANFOOD, TABU, UNDEF,
    D_CLOSED, D_LOCKED, IS_DOOR, IS_LAVA, IS_OBSTRUCTED, IS_POOL, isok,
} from '../js/const.js';
import { game } from '../js/gstate.js';
import { runSegment } from '../js/jsmain.js';
import { OBJECT_CLASS } from '../js/object_data.js';
import { clear_path } from '../js/vision.js';
import { resolveSessionRef } from './triage-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

function usage() {
    return [
        'Usage: node scripts/trace-dog-goal.mjs <session-ref> [--moves <count>] [--rng <start>:<end>] [--scan] [--monsters]',
        '',
        'Examples:',
        '  node scripts/trace-dog-goal.mjs seed0116 --moves 16 --rng 5510:5545',
        '  node scripts/trace-dog-goal.mjs seed0383 --moves 140 --rng 9700:9725 --scan',
        '  node scripts/trace-dog-goal.mjs seed0116 --moves 17 --monsters',
    ].join('\n');
}

function parseArgs(argv) {
    const out = { ref: null, moves: null, rng: null, scan: false, monsters: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        }
        if (arg === '--moves') {
            out.moves = Number(argv[++i]);
            continue;
        }
        if (arg.startsWith('--moves=')) {
            out.moves = Number(arg.slice('--moves='.length));
            continue;
        }
        if (arg === '--rng') {
            out.rng = argv[++i];
            continue;
        }
        if (arg.startsWith('--rng=')) {
            out.rng = arg.slice('--rng='.length);
            continue;
        }
        if (arg === '--scan') {
            out.scan = true;
            continue;
        }
        if (arg === '--monsters') {
            out.monsters = true;
            continue;
        }
        if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`);
        if (!out.ref) out.ref = arg;
        else throw new Error(`unexpected argument ${arg}`);
    }
    if (!out.ref) throw new Error(usage());
    if (out.moves != null && (!Number.isInteger(out.moves) || out.moves < 0)) {
        throw new Error('--moves must be a non-negative integer');
    }
    return out;
}

function rngCalls(nhGame) {
    return (nhGame.getRngLog?.() || [])
        .map((entry) => String(entry || '').replace(/^\d+\s+/, '').replace(/\s*@.*/, '').trim())
        .filter((entry) => /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(entry));
}

function expectedRngCalls(session) {
    const calls = [];
    for (const seg of session.segments) {
        for (const step of seg.steps || []) {
            for (const entry of step.rng || []) {
                const normalized = String(entry || '').replace(/^\d+\s+/, '').trim();
                if (/^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(normalized)) calls.push(normalized);
            }
        }
    }
    return calls;
}

function parseRngWindow(spec, total) {
    if (!spec) return null;
    const [rawStart, rawEnd] = spec.split(':');
    const start = Number(rawStart);
    const end = Number(rawEnd);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
        throw new Error('--rng must be formatted as start:end');
    }
    return { start, end: Math.min(end, total) };
}

function objectSummary(obj) {
    return {
        otyp: obj.otyp,
        oclass: obj.oclass,
        ox: obj.ox,
        oy: obj.oy,
        ch: obj.ch,
        cursed: !!obj.cursed,
        blessed: !!obj.blessed,
        quan: obj.quan ?? 1,
    };
}

function monsterSummary(mon, index) {
    return {
        index,
        name: mon.data?.name,
        mx: mon.mx,
        my: mon.my,
        movement: mon.movement ?? 0,
        mmove: mon.data?.mmove,
        mtame: mon.mtame ?? 0,
        mpeaceful: mon.mpeaceful ?? 0,
        msleeping: mon.msleeping ?? 0,
        mflee: mon.mflee ?? 0,
        mcanmove: mon.mcanmove ?? 1,
        mstate: mon.mstate ?? 0,
        strategy: mon.mstrategy ?? 0,
        ch: mon.ch,
    };
}

const FOOD_CLASS = 7;
const ROCK_CLASS = 14;
const TRIPE_RATION = 264;
const BOULDER = 475;
const CORPSE = 265;
const EGG = 266;
const MEATBALL = 267;
const MEAT_STICK = 268;
const ENORMOUS_MEATBALL = 269;
const GLOB_OF_GREEN_SLIME = 273;
const BANANA = 281;
const CARROT = 282;
const CLOVE_OF_GARLIC = 284;
const SLIME_MOLD = 285;
const TIN = 296;
const BELL_OF_OPENING = 263;
const CANDELABRUM_OF_INVOCATION = 262;
const AMULET_OF_YENDOR = 185;
const SPE_BOOK_OF_THE_DEAD = 373;

function foodName(value) {
    switch (value) {
    case DOGFOOD: return 'DOGFOOD';
    case CADAVER: return 'CADAVER';
    case MANFOOD: return 'MANFOOD';
    case APPORT: return 'APPORT';
    case UNDEF: return 'UNDEF';
    case TABU: return 'TABU';
    default: return String(value);
    }
}

function objectClass(otyp) {
    return OBJECT_CLASS[otyp] || 0;
}

function petDiet(mtmp) {
    if (mtmp.data?.mlet === 'S_UNICORN') return { carni: false, herbi: true };
    return { carni: true, herbi: false };
}

function objResistsShape(obj) {
    if (obj.otyp === AMULET_OF_YENDOR
        || obj.otyp === SPE_BOOK_OF_THE_DEAD
        || obj.otyp === CANDELABRUM_OF_INVOCATION
        || obj.otyp === BELL_OF_OPENING
        || (obj.otyp === CORPSE && obj.corpsenm?.is_rider)) {
        return { consumesRng: false, assumedResists: true };
    }
    return { consumesRng: true, assumedResists: false };
}

function dogfoodShape(mtmp, obj) {
    const resist = objResistsShape(obj);
    if (resist.assumedResists) {
        return { foodType: obj.cursed ? TABU : APPORT, resist };
    }
    if (objectClass(obj.otyp) === FOOD_CLASS) {
        const { carni, herbi } = petDiet(mtmp);
        switch (obj.otyp) {
        case TRIPE_RATION:
        case MEATBALL:
        case MEAT_STICK:
        case ENORMOUS_MEATBALL:
            return { foodType: carni ? DOGFOOD : MANFOOD, resist };
        case CORPSE:
        case EGG:
            return { foodType: carni ? CADAVER : MANFOOD, resist };
        case GLOB_OF_GREEN_SLIME:
            return { foodType: MANFOOD, resist };
        case CLOVE_OF_GARLIC:
            return { foodType: herbi ? 2 : MANFOOD, resist };
        case TIN:
            return { foodType: MANFOOD, resist };
        case BANANA:
            return { foodType: herbi ? 2 : MANFOOD, resist };
        case CARROT:
            return { foodType: herbi ? DOGFOOD : MANFOOD, resist };
        default:
            if (obj.otyp > SLIME_MOLD) return { foodType: carni ? 2 : MANFOOD, resist };
            return { foodType: herbi ? 2 : MANFOOD, resist };
        }
    }
    if (objectClass(obj.otyp) === ROCK_CLASS) return { foodType: UNDEF, resist };
    return { foodType: obj.cursed ? UNDEF : APPORT, resist };
}

function objectsAt(x, y) {
    return (game.level?.objects || []).filter((obj) => obj.ox === x && obj.oy === y);
}

function cursedObjectAt(x, y) {
    return objectsAt(x, y).some((obj) => obj.cursed);
}

function isBoulderAt(x, y) {
    return objectsAt(x, y).some((obj) => obj.otyp === BOULDER);
}

function couldReachItem(mtmp, x, y) {
    const loc = game.level?.at(x, y);
    if (!loc) return false;
    if (IS_POOL(loc.typ) && !mtmp.data?.swimmer) return false;
    if (IS_LAVA(loc.typ) && !mtmp.data?.likes_lava) return false;
    if (isBoulderAt(x, y) && !mtmp.data?.throws_rocks) return false;
    return true;
}

function dist2(x0, y0, x1, y1) {
    const dx = x0 - x1;
    const dy = y0 - y1;
    return dx * dx + dy * dy;
}

function canReachLocation(mtmp, mx, my, fx, fy, depth = 0) {
    if (mx === fx && my === fy) return true;
    if (!isok(mx, my) || depth > 6) return false;

    const curdist = dist2(mx, my, fx, fy);
    for (let x = mx - 1; x <= mx + 1; x++) {
        for (let y = my - 1; y <= my + 1; y++) {
            if (!isok(x, y)) continue;
            if (dist2(x, y, fx, fy) >= curdist) continue;
            const loc = game.level?.at(x, y);
            if (!loc) continue;
            if (IS_OBSTRUCTED(loc.typ)) continue;
            if (IS_DOOR(loc.typ) && (loc.doormask & (D_CLOSED | D_LOCKED))) continue;
            if (!couldReachItem(mtmp, x, y)) continue;
            if (canReachLocation(mtmp, x, y, fx, fy, depth + 1)) return true;
        }
    }
    return false;
}

function canCarry(mtmp, obj) {
    if (mtmp === game.u?.usteed) return 0;
    if (obj.cursed) return 0;
    if (objectClass(obj.otyp) === ROCK_CLASS && obj.otyp === BOULDER && !mtmp.data?.throws_rocks) return 0;
    return Math.max(1, obj.quan || 1);
}

function traceDogGoalScan(pet, floorObjects, inventory) {
    const hero = game.u;
    const edog = pet.edog || {};
    const minX = Math.max(1, pet.mx - 5);
    const maxX = Math.min(79, pet.mx + 5);
    const minY = Math.max(0, pet.my - 5);
    const maxY = Math.min(20, pet.my + 5);
    const heroLoc = game.level?.at(hero?.ux, hero?.uy);
    const petLoc = game.level?.at(pet.mx, pet.my);
    const dogHasMinvent = !!(pet.inventory?.length);

    let goalType = UNDEF;
    let goalX = 0;
    let goalY = 0;
    let objResistsCount = 0;
    let apportGateCount = 0;
    const floorScan = [];

    for (const obj of floorObjects) {
        const item = objectSummary(obj);
        if (typeof obj.otyp !== 'number') {
            floorScan.push({ ...item, action: 'skip-non-numeric' });
            continue;
        }
        const nx = obj.ox;
        const ny = obj.oy;
        if (nx < minX || nx > maxX || ny < minY || ny > maxY) {
            floorScan.push({ ...item, action: 'skip-outside-search' });
            continue;
        }

        const { foodType, resist } = dogfoodShape(pet, obj);
        if (resist.consumesRng) objResistsCount++;
        const row = {
            ...item,
            food: foodName(foodType),
            objResistsIndex: resist.consumesRng ? objResistsCount : null,
            action: 'consider',
        };

        if (foodType > goalType || foodType === UNDEF) {
            row.action = 'skip-inferior-or-undef';
            floorScan.push(row);
            continue;
        }
        if (cursedObjectAt(nx, ny) && !(edog.mhpmax_penalty && foodType < MANFOOD)) {
            row.action = 'skip-cursed-pile';
            floorScan.push(row);
            continue;
        }
        if (!couldReachItem(pet, nx, ny)) {
            row.action = 'skip-could-not-reach-item';
            floorScan.push(row);
            continue;
        }
        if (!canReachLocation(pet, pet.mx, pet.my, nx, ny)) {
            row.action = 'skip-could-not-reach-location';
            floorScan.push(row);
            continue;
        }

        if (foodType < MANFOOD) {
            if (foodType < goalType
                || dist2(nx, ny, pet.mx, pet.my) < dist2(goalX, goalY, pet.mx, pet.my)) {
                goalX = nx;
                goalY = ny;
                goalType = foodType;
                row.action = 'set-food-goal';
            } else {
                row.action = 'reachable-food-not-better';
            }
            floorScan.push(row);
            continue;
        }

        const reachesApportGate = goalType === UNDEF
            && !dogHasMinvent
            && (!petLoc?.lit || heroLoc?.lit)
            && (foodType === MANFOOD || clear_path(pet.mx, pet.my, nx, ny))
            && canCarry(pet, obj) > 0;
        if (reachesApportGate) {
            apportGateCount++;
            row.apportGateIndex = apportGateCount;
            row.action = 'apport-gate';
        } else {
            row.action = 'skip-apport-front-door';
        }
        floorScan.push(row);
    }

    const inventoryScan = [];
    for (const obj of inventory) {
        if (typeof obj.otyp !== 'number') {
            inventoryScan.push({ ...objectSummary(obj), action: 'skip-non-numeric' });
            continue;
        }
        const { foodType, resist } = dogfoodShape(pet, obj);
        if (resist.consumesRng) objResistsCount++;
        inventoryScan.push({
            ...objectSummary(obj),
            food: foodName(foodType),
            objResistsIndex: resist.consumesRng ? objResistsCount : null,
            action: foodType === DOGFOOD ? 'follow-food-hit' : 'scan-no-follow-food',
        });
        if (foodType === DOGFOOD) break;
    }

    return {
        counts: { objResistsCount, apportGateCount },
        floorScan,
        inventoryScan,
    };
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const sessionPath = resolveSessionRef(opts.ref);
    const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
    const seg = session.segments[0];
    const moves = opts.moves == null ? seg.moves : seg.moves.slice(0, opts.moves);

    const nhGame = await runSegment({
        seed: seg.seed,
        datetime: seg.datetime,
        nethackrc: seg.nethackrc,
        moves,
    }, null);

    const pet = game.level?.monsters?.find((mon) => mon.mtame);
    const hero = game.u;
    console.log(`session ${path.relative(PROJECT_ROOT, sessionPath)} moves ${moves.length}/${seg.moves.length}`);
    console.log(`screens ${nhGame.getScreens?.().length ?? 0} rng ${rngCalls(nhGame).length}`);

    if (!pet) {
        console.log('pet none');
        return;
    }

    const minX = Math.max(1, pet.mx - 5);
    const maxX = Math.min(79, pet.mx + 5);
    const minY = Math.max(0, pet.my - 5);
    const maxY = Math.min(20, pet.my + 5);
    const floorObjects = (game.level?.objects || [])
        .filter((obj) => typeof obj.otyp === 'number')
        .filter((obj) => obj.ox >= minX && obj.ox <= maxX && obj.oy >= minY && obj.oy <= maxY)
        .map(objectSummary);
    const inventory = (game.inventory || [])
        .filter((obj) => typeof obj.otyp === 'number')
        .map(objectSummary);

    console.log('hero', JSON.stringify({
        ux: hero?.ux,
        uy: hero?.uy,
        uz: hero?.uz,
    }));
    console.log('pet', JSON.stringify({
        name: pet.data?.name,
        mx: pet.mx,
        my: pet.my,
        movement: pet.movement,
        mtame: pet.mtame,
        edog: pet.edog,
        inventory: pet.inventory?.length || 0,
    }));
    console.log('search', JSON.stringify({ minX, maxX, minY, maxY }));
    if (opts.monsters) {
        console.log('monsters', JSON.stringify(
            (game.level?.monsters || []).map((mon, index) => monsterSummary(mon, index)),
        ));
    }
    console.log('floorObjects', JSON.stringify(floorObjects));
    console.log('inventory', JSON.stringify(inventory));
    if (opts.scan) {
        const scan = traceDogGoalScan(
            pet,
            (game.level?.objects || []).filter((obj) => typeof obj.otyp === 'number'),
            (game.inventory || []).filter((obj) => typeof obj.otyp === 'number'),
        );
        console.log('scanCounts', JSON.stringify(scan.counts));
        console.log('floorScan', JSON.stringify(scan.floorScan));
        console.log('inventoryScan', JSON.stringify(scan.inventoryScan));
    }

    const calls = rngCalls(nhGame);
    const expectedCalls = expectedRngCalls(session);
    const window = parseRngWindow(opts.rng, Math.max(calls.length, expectedCalls.length));
    if (window) {
        for (let i = window.start; i < window.end; i++) {
            const expected = expectedCalls[i] ?? '<missing>';
            const actual = calls[i] ?? '<missing>';
            const mark = expected.replace(/\s*@.*/, '') === actual ? ' ' : '!';
            console.log(`${mark} ${i}: exp ${expected} | act ${actual}`);
        }
    }
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
