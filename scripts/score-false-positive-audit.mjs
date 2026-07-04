#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import { decodeScreen, diffCell, renderCell, ROWS_24, COLS_80 } from '../frozen/screen-decode.mjs';
import {
    DEFAULT_LEADERBOARD_BASE_URL,
    expandLeaderboardFailureTargets,
} from './leaderboard-lib.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DEFAULT_SESSIONS_DIR = join(PROJECT_ROOT, 'sessions');

const STARTUP_VARIANT_LINES = [
    /Version\s+\d+\.\d+\.\d+[^\n]*/,
];

function usage() {
    return [
        'Usage: node scripts/score-false-positive-audit.mjs [--leaderboard-failures] [--leaderboard-json <file>] [--team <name>] [--full] [file-or-dir...]',
        '',
        'Replays sessions with the official local visual comparator, then counts',
        'screens that pass locally only because stricter terminal/string encodings',
        'are ignored. This probes whether local 44/44 could be false-positive',
        'relative to the online leaderboard row.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        targets: [],
        full: false,
        limit: 20,
        leaderboardFailures: false,
        leaderboardJson: null,
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_LEADERBOARD_BASE_URL,
        sourceLabel: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--full') {
            out.full = true;
        } else if (arg === '--limit') {
            out.limit = Number(argv[++i] || out.limit);
        } else if (arg.startsWith('--limit=')) {
            out.limit = Number(arg.slice('--limit='.length));
        } else if (arg === '--leaderboard-failures') {
            out.leaderboardFailures = true;
        } else if (arg === '--leaderboard-json') {
            out.leaderboardJson = argv[++i] || null;
        } else if (arg.startsWith('--leaderboard-json=')) {
            out.leaderboardJson = arg.slice('--leaderboard-json='.length);
        } else if (arg === '--team') {
            out.team = argv[++i] || null;
        } else if (arg.startsWith('--team=')) {
            out.team = arg.slice('--team='.length);
        } else if (arg === '--base-url') {
            out.baseUrl = argv[++i] || out.baseUrl;
        } else if (arg.startsWith('--base-url=')) {
            out.baseUrl = arg.slice('--base-url='.length);
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown argument ${arg}`);
        } else {
            out.targets.push(arg);
        }
    }
    if (!Number.isFinite(out.limit) || out.limit < 0) out.limit = 20;
    out.baseUrl = out.baseUrl.replace(/\/+$/, '');
    if (out.leaderboardJson) out.leaderboardFailures = true;
    return out;
}

function resolveSessionFiles(targets) {
    const files = [];
    const manifest = existsSync(DEFAULT_SESSIONS_DIR)
        ? readdirSync(DEFAULT_SESSIONS_DIR).filter(file => file.endsWith('.session.json')).sort()
        : [];
    for (const target of targets) {
        const targetPath = target.startsWith('/') ? target : join(PROJECT_ROOT, target);
        if (!existsSync(targetPath)) {
            const normalized = target.endsWith('.session.json') ? target : `${target}.session.json`;
            const exact = manifest.find(file => file === normalized || file === target);
            if (exact) {
                files.push(join(DEFAULT_SESSIONS_DIR, exact));
                continue;
            }
            const fuzzy = manifest.filter(file => file.includes(target));
            if (fuzzy.length === 1) {
                files.push(join(DEFAULT_SESSIONS_DIR, fuzzy[0]));
                continue;
            }
            if (fuzzy.length > 1) {
                throw new Error(`ambiguous session ref "${target}": ${fuzzy.join(', ')}`);
            }
            throw new Error(`not found: ${target}`);
        }
        const st = statSync(targetPath);
        if (st.isFile() && targetPath.endsWith('.session.json')) {
            files.push(targetPath);
        } else if (st.isDirectory()) {
            for (const file of readdirSync(targetPath)) {
                if (file.endsWith('.session.json')) files.push(join(targetPath, file));
            }
        }
    }
    return [...new Set(files)].sort();
}

function pushAll(dst, src) {
    if (!src || !src.length) return;
    const CHUNK = 0x8000;
    for (let i = 0; i < src.length; i += CHUNK) {
        dst.push(...src.slice(i, i + CHUNK));
    }
}

function normalizeRng(entry) {
    return String(entry || '').replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}

function isRngCall(entry) {
    return /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(normalizeRng(entry));
}

function extractRngCalls(rng) {
    return (rng || []).filter(isRngCall).map(normalizeRng);
}

function preDecode(s) {
    let cur = String(s || '');
    for (const re of STARTUP_VARIANT_LINES) {
        cur = cur.replace(re, '<<VERSION_BANNER>>');
    }
    cur = cur.replace(/^\d{2}:\d{2}:\d{2}\.$/gm, '<time>.');
    return cur;
}

function sameCursor(actual, expected) {
    if (!Array.isArray(expected)) return true;
    return Array.isArray(actual) &&
        actual[0] === expected[0] &&
        actual[1] === expected[1] &&
        actual[2] === expected[2];
}

function visualCellsEqual(actual, expected) {
    const ga = decodeScreen(preDecode(actual));
    const gb = decodeScreen(preDecode(expected));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            if (diffCell(ga[r][c], gb[r][c])) return false;
        }
    }
    return true;
}

function strictDisplayCellsEqual(actual, expected) {
    const ga = decodeScreen(preDecode(actual));
    const gb = decodeScreen(preDecode(expected));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            const a = ga[r][c];
            const b = gb[r][c];
            if (renderCell(a) !== renderCell(b) || a.color !== b.color || a.attr !== b.attr) return false;
        }
    }
    return true;
}

function strictTerminalCellsEqual(actual, expected) {
    const ga = decodeScreen(preDecode(actual));
    const gb = decodeScreen(preDecode(expected));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            const a = ga[r][c];
            const b = gb[r][c];
            if (a.ch !== b.ch || a.color !== b.color || a.attr !== b.attr || a.decgfx !== b.decgfx) return false;
        }
    }
    return true;
}

function firstStrictSample(actual, expected) {
    const ga = decodeScreen(preDecode(actual));
    const gb = decodeScreen(preDecode(expected));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            const a = ga[r][c];
            const b = gb[r][c];
            if (a.ch === b.ch && a.color === b.color && a.attr === b.attr && a.decgfx === b.decgfx) continue;
            return {
                row: r,
                col: c,
                actual: { ch: renderCell(a), raw: a.ch, color: a.color, attr: a.attr, decgfx: a.decgfx },
                expected: { ch: renderCell(b), raw: b.ch, color: b.color, attr: b.attr, decgfx: b.decgfx },
            };
        }
    }
    return null;
}

function makeStorageHandle() {
    const storage = new Map();
    return {
        getItem(k) { return storage.has(k) ? storage.get(k) : null; },
        setItem(k, v) { storage.set(k, String(v)); },
        removeItem(k) { storage.delete(k); },
        get length() { return storage.size; },
        key(i) {
            let n = 0;
            for (const k of storage.keys()) { if (n === i) return k; n++; }
            return null;
        },
    };
}

function replayInputFor(segment) {
    return {
        seed: segment.seed,
        datetime: segment.datetime,
        nethackrc: segment.nethackrc,
        moves: segment.moves,
    };
}

async function runWorker(sessionPath) {
    const sessionData = JSON.parse(readFileSync(sessionPath, 'utf8'));
    const { runSegment } = await import(join(PROJECT_ROOT, 'js/jsmain.js'));
    const session = normalizeSession(sessionData);

    const canonicalRng = [];
    const canonicalScreens = [];
    const canonicalCursors = [];
    for (const seg of session.segments) {
        for (const step of seg.steps || []) {
            pushAll(canonicalRng, extractRngCalls(step.rng));
            if (step.screen) {
                canonicalScreens.push(step.screen);
                canonicalCursors.push(Array.isArray(step.cursor) ? step.cursor : null);
            }
        }
    }

    const storage = makeStorageHandle();
    const jsRng = [];
    const jsScreens = [];
    const jsCursors = [];
    let jsError = null;
    try {
        for (const seg of session.segments) {
            const game = await runSegment({ ...replayInputFor(seg), storage });
            pushAll(jsRng, extractRngCalls(game.getRngLog?.() || []));
            pushAll(jsScreens, game.getScreens?.() || []);
            pushAll(jsCursors, game.getCursors?.() || []);
        }
    } catch (err) {
        jsError = err instanceof Error ? err.message : String(err);
    }

    let rngMatched = 0;
    for (let i = 0; i < canonicalRng.length; i++) {
        if (normalizeRng(canonicalRng[i]) === normalizeRng(jsRng[i])) rngMatched++;
    }

    const summary = {
        session: basename(sessionPath),
        error: jsError,
        rngCalls: { matched: rngMatched, total: canonicalRng.length },
        screens: { matched: 0, total: canonicalScreens.length },
        cellsOnly: { matched: 0, total: canonicalScreens.length },
        cursors: { matched: 0, total: canonicalScreens.length },
        accepted: {
            exactTerminal: 0,
            invisibleSgrOnly: 0,
            decEncodingOnly: 0,
            otherAcceptedEncoding: 0,
        },
        firstAcceptedDiff: null,
    };

    for (let i = 0; i < canonicalScreens.length; i++) {
        const jsScreen = jsScreens[i] || '';
        const canonicalScreen = canonicalScreens[i] || '';
        const cellsOk = visualCellsEqual(jsScreen, canonicalScreen);
        const cursorOk = sameCursor(jsCursors[i], canonicalCursors[i]);
        if (cellsOk) summary.cellsOnly.matched++;
        if (cursorOk) summary.cursors.matched++;
        if (cellsOk && cursorOk) summary.screens.matched++;
        if (!cellsOk) continue;

        const strictDisplay = strictDisplayCellsEqual(jsScreen, canonicalScreen);
        const strictTerminal = strictTerminalCellsEqual(jsScreen, canonicalScreen);
        if (!strictDisplay) {
            summary.accepted.invisibleSgrOnly++;
        } else if (!strictTerminal) {
            summary.accepted.decEncodingOnly++;
        } else if (jsScreen !== canonicalScreen) {
            summary.accepted.otherAcceptedEncoding++;
        } else {
            summary.accepted.exactTerminal++;
        }

        if (!summary.firstAcceptedDiff && (!strictTerminal || jsScreen !== canonicalScreen)) {
            summary.firstAcceptedDiff = {
                index: i,
                class: !strictDisplay
                    ? 'invisible-sgr'
                    : !strictTerminal
                        ? 'dec-encoding'
                        : 'string-encoding',
                sample: firstStrictSample(jsScreen, canonicalScreen),
            };
        }
    }

    return summary;
}

function summarizeReference(rows) {
    const map = new Map();
    for (const row of rows || []) {
        map.set(row.session, {
            missed: Math.max(0, (row.screen?.total ?? 0) - (row.screen?.matched ?? 0)),
            screen: row.screen,
            cellsOnly: row.cellsOnly,
            cursors: row.cursors,
            rng: row.rng,
        });
    }
    return map;
}

function fmtCount(count, total) {
    return `${count}/${total}`;
}

function printResults(results, options) {
    const refs = summarizeReference(options.leaderboardReference?.rows || []);
    const totals = {
        sessions: results.length,
        missedOnline: 0,
        visualPassed: 0,
        screenTotal: 0,
        invisibleSgrOnly: 0,
        decEncodingOnly: 0,
        otherAcceptedEncoding: 0,
        exactTerminal: 0,
        matchingAcceptedBucket: 0,
    };
    console.log(`False-positive audit: ${results.length} session(s)${options.sourceLabel ? ` from ${options.sourceLabel}` : ''}`);
    for (const result of results) {
        const ref = refs.get(result.session);
        const onlineMissed = ref?.missed ?? null;
        const accepted = result.accepted;
        const acceptedNonExact = accepted.invisibleSgrOnly + accepted.decEncodingOnly + accepted.otherAcceptedEncoding;
        if (onlineMissed != null) totals.missedOnline += onlineMissed;
        totals.visualPassed += result.screens.matched;
        totals.screenTotal += result.screens.total;
        totals.invisibleSgrOnly += accepted.invisibleSgrOnly;
        totals.decEncodingOnly += accepted.decEncodingOnly;
        totals.otherAcceptedEncoding += accepted.otherAcceptedEncoding;
        totals.exactTerminal += accepted.exactTerminal;
        if (onlineMissed != null && onlineMissed === acceptedNonExact) totals.matchingAcceptedBucket++;
    }

    const rows = options.full ? results : results.slice(0, options.limit);
    for (const result of rows) {
        const ref = refs.get(result.session);
        const onlineMissed = ref?.missed ?? null;
        const accepted = result.accepted;
        const acceptedNonExact = accepted.invisibleSgrOnly + accepted.decEncodingOnly + accepted.otherAcceptedEncoding;
        const exactLocal = !result.error &&
            result.rngCalls.matched === result.rngCalls.total &&
            result.screens.matched === result.screens.total;

        const missText = onlineMissed == null ? 'n/a' : String(onlineMissed);
        const sample = result.firstAcceptedDiff
            ? ` firstAccepted=${result.firstAcceptedDiff.index}:${result.firstAcceptedDiff.class}`
            : '';
        console.log(`- ${result.session}: onlineMiss=${missText} local=${exactLocal ? 'exact' : 'drift'} ` +
            `S ${fmtCount(result.screens.matched, result.screens.total)} R ${fmtCount(result.rngCalls.matched, result.rngCalls.total)} ` +
            `acceptedNonExact=${acceptedNonExact} invisibleSgr=${accepted.invisibleSgrOnly} ` +
            `dec=${accepted.decEncodingOnly} other=${accepted.otherAcceptedEncoding} exactTerminal=${accepted.exactTerminal}${sample}`);
        if (options.full && result.firstAcceptedDiff?.sample) {
            const s = result.firstAcceptedDiff.sample;
            console.log(`  sample row=${s.row} col=${s.col} actual=${JSON.stringify(s.actual)} expected=${JSON.stringify(s.expected)}`);
        }
    }
    if (!options.full && rows.length < results.length) {
        console.log(`- showing ${rows.length}/${results.length}; rerun with --full`);
    }
    console.log('## Totals');
    console.log(`- online missed screens: ${totals.missedOnline}`);
    console.log(`- local visual screens: ${fmtCount(totals.visualPassed, totals.screenTotal)}`);
    console.log(`- locally accepted non-exact terminal screens: ` +
        `${totals.invisibleSgrOnly + totals.decEncodingOnly + totals.otherAcceptedEncoding} ` +
        `(invisibleSgr=${totals.invisibleSgrOnly}, dec=${totals.decEncodingOnly}, other=${totals.otherAcceptedEncoding})`);
    console.log(`- exact terminal/string screens among local visual passes: ${totals.exactTerminal}`);
    console.log(`- sessions where onlineMiss equals acceptedNonExact: ${totals.matchingAcceptedBucket}/${totals.sessions}`);
}

async function main() {
    const workerArg = process.argv.find(arg => arg.startsWith('--worker-session='));
    if (workerArg) {
        const result = await runWorker(workerArg.slice('--worker-session='.length));
        console.log('__FALSE_POSITIVE_AUDIT_RESULT__');
        console.log(JSON.stringify(result));
        return;
    }

    const options = parseArgs(process.argv.slice(2));
    await expandLeaderboardFailureTargets(options, PROJECT_ROOT);
    if (options.targets.length === 0) options.targets.push(DEFAULT_SESSIONS_DIR);
    const files = resolveSessionFiles(options.targets);
    if (!files.length) throw new Error('no session files found');

    const timeoutMs = Number(process.env.SESSION_REPLAY_TIMEOUT_MS || 45000);
    const results = [];
    let workerProcessFailed = false;
    for (const file of files) {
        const child = spawnSync(process.execPath, [SCRIPT_PATH, `--worker-session=${file}`], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            timeout: timeoutMs,
            maxBuffer: 64 * 1024 * 1024,
        });
        if (child.error || (child.status ?? 0) !== 0) {
            workerProcessFailed = true;
            results.push({
                session: basename(file),
                error: child.error?.message || child.stderr?.trim() || `exit ${child.status}`,
                rngCalls: { matched: 0, total: 0 },
                screens: { matched: 0, total: 0 },
                accepted: {
                    exactTerminal: 0,
                    invisibleSgrOnly: 0,
                    decEncodingOnly: 0,
                    otherAcceptedEncoding: 0,
                },
            });
            continue;
        }
        const idx = child.stdout.lastIndexOf('__FALSE_POSITIVE_AUDIT_RESULT__');
        if (idx < 0) throw new Error(`${basename(file)}: worker output missing result marker`);
        results.push(JSON.parse(child.stdout.slice(idx + '__FALSE_POSITIVE_AUDIT_RESULT__'.length).trim()));
    }

    printResults(results, options);
    if (workerProcessFailed) process.exitCode = 1;
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
