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
import { game } from '../js/gstate.js';
import { runSegment } from '../js/jsmain.js';
import { resolveSessionRef } from './triage-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

function usage() {
    return [
        'Usage: node scripts/trace-dog-goal.mjs <session-ref> [--moves <count>] [--rng <start>:<end>]',
        '',
        'Examples:',
        '  node scripts/trace-dog-goal.mjs seed0116 --moves 16 --rng 5510:5545',
        '  node scripts/trace-dog-goal.mjs seed0383 --moves 140 --rng 9700:9725',
    ].join('\n');
}

function parseArgs(argv) {
    const out = { ref: null, moves: null, rng: null };
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
    console.log('floorObjects', JSON.stringify(floorObjects));
    console.log('inventory', JSON.stringify(inventory));

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
