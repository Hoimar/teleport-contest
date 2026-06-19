#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';

function parseArgs(argv) {
    const opts = {
        ref: null,
        moves: null,
        rng: null,
        segment: 0,
        rngOnly: false,
        exerciseOnly: false,
        changesOnly: false,
        skipRng: false,
        types: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--moves') opts.moves = Number(argv[++i]);
        else if (arg === '--rng') opts.rng = argv[++i];
        else if (arg === '--segment') opts.segment = Number(argv[++i]);
        else if (arg === '--rng-only') opts.rngOnly = true;
        else if (arg === '--exercise-only') opts.exerciseOnly = true;
        else if (arg === '--changes-only') opts.changesOnly = true;
        else if (arg === '--skip-rng') opts.skipRng = true;
        else if (arg === '--types') opts.types = new Set(String(argv[++i] || '').split(',').filter(Boolean));
        else if (!opts.ref) opts.ref = arg;
        else throw new Error(`unexpected argument ${arg}`);
    }
    if (!opts.ref || !opts.rng) {
        throw new Error('Usage: node --loader ./scratch/rng-stack-loader.mjs scratch/trace-rng-stacks.mjs <session> --moves <n> --rng <start>:<end>');
    }
    const [rawStart, rawEnd] = opts.rng.split(':');
    opts.start = Number(rawStart);
    opts.end = Number(rawEnd);
    if (!Number.isInteger(opts.start) || !Number.isInteger(opts.end) || opts.end < opts.start) {
        throw new Error('--rng must be start:end');
    }
    return opts;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const inWindow = (item) => {
        const idx = item?.idx ?? item?.rng;
        return typeof idx === 'number' && idx >= opts.start - 8 && idx <= opts.end + 8;
    };
    const wants = (type) => !opts.types || opts.types.has(type);
    globalThis.__teleportRngStackTrace = true;
    globalThis.__teleportRngTrace = [];
    globalThis.__teleportRngTraceIndex = 0;
    globalThis.__teleportApparxyTrace = [];
    globalThis.__teleportExerciseTrace = true;
    globalThis.__teleportExerciseTraceLog = [];
    globalThis.__teleportApparxyStart = opts.start - 8;
    globalThis.__teleportApparxyEnd = opts.end + 8;

    const sessionPath = resolveSessionRef(opts.ref);
    const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
    let nhGame = null;
    for (let i = 0; i <= opts.segment; i++) {
        const seg = session.segments[i];
        const moves = i === opts.segment && opts.moves != null
            ? seg.moves.slice(0, opts.moves)
            : seg.moves;
        nhGame = await runSegment({
            seed: seg.seed,
            datetime: seg.datetime,
            nethackrc: seg.nethackrc,
            moves,
        }, nhGame);
    }

    console.log(`rng trace entries ${globalThis.__teleportRngTrace.length}; logged ${nhGame.getRngLog?.().length ?? 0}`);
    if (!opts.exerciseOnly && !opts.skipRng) {
        for (const item of globalThis.__teleportRngTrace) {
            if (item.idx < opts.start || item.idx >= opts.end) continue;
            console.log(`R${item.idx} ${item.entry}`);
            if (item.monster) console.log(`  monster ${JSON.stringify(item.monster)}`);
            for (const line of item.stack) console.log(`  ${line}`);
        }
    }
    if (opts.rngOnly && !opts.exerciseOnly) return;
    if (wants('exercise') && globalThis.__teleportExerciseTraceLog?.length) {
        console.log('exercise trace');
        const changed = (item) => JSON.stringify(item.before || null) !== JSON.stringify(item.after || null);
        for (const item of globalThis.__teleportExerciseTraceLog.filter(inWindow).filter((item) => !opts.changesOnly || changed(item))) {
            console.log(`  E@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (opts.exerciseOnly) return;
    if (wants('apparxy') && globalThis.__teleportApparxyTrace?.length) {
        console.log('apparxy trace');
        for (const item of globalThis.__teleportApparxyTrace.filter(inWindow)) {
            console.log(`  A@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('track') && globalThis.__teleportTrackTrace?.length) {
        console.log('track trace');
        for (const item of globalThis.__teleportTrackTrace.filter(inWindow)) {
            console.log(`  T@${item.rng} ${JSON.stringify(item)}`);
        }
    }
    if (wants('montrack') && globalThis.__teleportMonTrackTrace?.length) {
        console.log('monster track trace');
        for (const item of globalThis.__teleportMonTrackTrace.filter(inWindow)) {
            console.log(`  MT@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('newsym') && globalThis.__teleportNewsymTrace?.length) {
        console.log('newsym trace');
        for (const item of globalThis.__teleportNewsymTrace.filter(inWindow)) {
            console.log(`  N@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('candidate') && globalThis.__teleportCandidateTrace?.length) {
        console.log('candidate trace');
        for (const item of globalThis.__teleportCandidateTrace.filter(inWindow)) {
            console.log(`  C@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('pet') && globalThis.__teleportPetGoalTrace?.length) {
        console.log('pet goal trace');
        for (const item of globalThis.__teleportPetGoalTrace.filter(inWindow)) {
            console.log(`  P@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('dog') && globalThis.__teleportDogMoveTrace?.length) {
        console.log('dog move trace');
        for (const item of globalThis.__teleportDogMoveTrace.filter(inWindow)) {
            console.log(`  G@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('combat') && globalThis.__teleportCombatVisibilityTrace?.length) {
        console.log('combat visibility trace');
        for (const item of globalThis.__teleportCombatVisibilityTrace.filter(inWindow)) {
            console.log(`  V@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('scan') && globalThis.__teleportMonScanTrace?.length) {
        console.log('mon scan trace');
        for (const item of globalThis.__teleportMonScanTrace.filter(inWindow)) {
            console.log(`  S@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('rndmonst') && globalThis.__teleportRndmonstTrace?.length) {
        console.log('rndmonst trace');
        for (const item of globalThis.__teleportRndmonstTrace.filter(inWindow)) {
            console.log(`  R@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('mkclass') && globalThis.__teleportMkclassTrace?.length) {
        console.log('mkclass trace');
        for (const item of globalThis.__teleportMkclassTrace.filter(inWindow)) {
            console.log(`  K@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('zoo') && globalThis.__teleportZooTrace?.length) {
        console.log('zoo trace');
        for (const item of globalThis.__teleportZooTrace.filter(inWindow)) {
            console.log(`  Z@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('bones') && globalThis.__teleportBonesTrace?.length) {
        console.log('bones trace');
        for (const item of globalThis.__teleportBonesTrace.filter(inWindow)) {
            console.log(`  B@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('alloc') && globalThis.__teleportMonAllocTrace?.length) {
        console.log('mon alloc trace');
        for (const item of globalThis.__teleportMonAllocTrace.filter(inWindow)) {
            console.log(`  A@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('advance') && globalThis.__teleportAdvanceTrace?.length) {
        console.log('advance trace');
        for (const item of globalThis.__teleportAdvanceTrace.filter(inWindow)) {
            console.log(`  V@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('throw') && globalThis.__teleportThrowTrace?.length) {
        console.log('throw trace');
        for (const item of globalThis.__teleportThrowTrace.filter(inWindow)) {
            console.log(`  W@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('decision') && globalThis.__teleportDecisionTrace?.length) {
        console.log('decision trace');
        for (const item of globalThis.__teleportDecisionTrace.filter(inWindow)) {
            console.log(`  D@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (wants('maze') && globalThis.__teleportMazeWalkTrace?.length) {
        console.log('maze walk trace');
        for (const item of globalThis.__teleportMazeWalkTrace.filter(inWindow)) {
            console.log(`  M@${item.idx} ${JSON.stringify(item)}`);
        }
    }
}

main().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
});
