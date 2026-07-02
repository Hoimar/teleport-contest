#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import {
    DEFAULT_LEADERBOARD_BASE_URL,
    failedLeaderboardSessionNames,
    fetchLeaderboard,
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';
import {
    compareScreen,
    keyToDisplay,
    resolveSessionRef,
} from './triage-lib.mjs';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const SESSIONS_DIR = join(PROJECT_ROOT, 'sessions');
const MANIFEST_PATH = join(SESSIONS_DIR, 'manifest.json');
const SCRIPT_PATH = fileURLToPath(import.meta.url);

function usage() {
    console.log([
        'Usage: node scripts/score-storage-scope.mjs [--scope session|run|none|both] [--order manifest|reverse] [--leaderboard-failures] [--leaderboard-json <file>] [--full] [file-or-dir...]',
        '',
        'Replays sessions in one JS module process while changing storage',
        'isolation. This catches diagnostic module/VFS leakage that the official',
        'worker-isolated score.sh path should not see between public sessions.',
    ].join('\n'));
}

function parseArgs(argv) {
    const options = {
        scope: 'both',
        order: 'manifest',
        full: false,
        limit: 20,
        leaderboardFailures: false,
        leaderboardJson: null,
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_LEADERBOARD_BASE_URL,
        sourceLabel: null,
        targets: [],
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '-h' || arg === '--help') {
            usage();
            process.exit(0);
        } else if (arg === '--scope') {
            options.scope = argv[++i] || '';
        } else if (arg.startsWith('--scope=')) {
            options.scope = arg.slice('--scope='.length);
        } else if (arg === '--order') {
            options.order = argv[++i] || '';
        } else if (arg.startsWith('--order=')) {
            options.order = arg.slice('--order='.length);
        } else if (arg === '--full') {
            options.full = true;
        } else if (arg === '--leaderboard-failures') {
            options.leaderboardFailures = true;
        } else if (arg === '--leaderboard-json') {
            options.leaderboardJson = argv[++i] || null;
        } else if (arg.startsWith('--leaderboard-json=')) {
            options.leaderboardJson = arg.slice('--leaderboard-json='.length);
        } else if (arg === '--team') {
            options.team = argv[++i] || null;
        } else if (arg.startsWith('--team=')) {
            options.team = arg.slice('--team='.length);
        } else if (arg === '--base-url') {
            options.baseUrl = argv[++i] || options.baseUrl;
        } else if (arg.startsWith('--base-url=')) {
            options.baseUrl = arg.slice('--base-url='.length);
        } else if (arg === '--limit') {
            options.limit = Number(argv[++i] || options.limit);
        } else if (arg.startsWith('--limit=')) {
            options.limit = Number(arg.slice('--limit='.length));
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown argument ${arg}`);
        } else {
            options.targets.push(arg);
        }
    }
    if (!['session', 'run', 'none', 'both'].includes(options.scope)) {
        throw new Error(`unknown scope "${options.scope}"`);
    }
    if (!['manifest', 'reverse'].includes(options.order)) {
        throw new Error(`unknown order "${options.order}"`);
    }
    if (!Number.isFinite(options.limit) || options.limit < 0) options.limit = 20;
    options.baseUrl = options.baseUrl.replace(/\/+$/, '');
    if (options.leaderboardJson) options.leaderboardFailures = true;
    return options;
}

async function expandLeaderboardFailureTargets(options) {
    if (!options.leaderboardFailures) return;
    const teamName = options.team || inferTeamFromGitRemote(PROJECT_ROOT);
    if (!teamName) throw new Error('--leaderboard-failures needs --team <name> or a GitHub origin owner');
    const leaderboard = options.leaderboardJson
        ? readLeaderboardSnapshot(options.leaderboardJson, PROJECT_ROOT)
        : await fetchLeaderboard(options.baseUrl);
    if (!leaderboard.available) {
        throw new Error(`leaderboard unavailable: ${(leaderboard.errors || []).join(' | ')}`);
    }
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) throw new Error(`team ${teamName} not found in ${leaderboard.url}`);
    const failures = failedLeaderboardSessionNames(team);
    if (!failures.length) throw new Error(`team ${team.name || teamName} has no failed public leaderboard sessions`);
    options.targets = [...failures, ...options.targets];
    const snapshotTime = leaderboard.data?.timestamp ? `, snapshot ${leaderboard.data.timestamp}` : '';
    options.sourceLabel = `leaderboard failures for ${team.name || teamName} (${leaderboard.url}${snapshotTime}, last scored ${team.lastScored || 'unknown'})`;
}

function readManifest() {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

function resolveTargets(targets) {
    if (!targets.length) {
        return readManifest().map((name) => join(SESSIONS_DIR, name));
    }
    const files = [];
    for (const target of targets) {
        const direct = target.startsWith('/') ? target : join(PROJECT_ROOT, target);
        if (existsSync(direct)) {
            const st = statSync(direct);
            if (st.isDirectory()) {
                for (const name of readdirSync(direct).sort()) {
                    if (name.endsWith('.session.json')) files.push(join(direct, name));
                }
            } else if (st.isFile()) {
                files.push(direct);
            }
            continue;
        }
        files.push(resolveSessionRef(target));
    }
    return [...new Set(files)];
}

function orderedFiles(files, order) {
    const out = files.slice();
    if (order === 'reverse') out.reverse();
    return out;
}

function makeStorageHandle() {
    const data = new Map();
    return {
        getItem(key) { return data.has(key) ? data.get(key) : null; },
        setItem(key, value) { data.set(key, String(value)); },
        removeItem(key) { data.delete(key); },
        clear() { data.clear(); },
        dumpKeys() { return [...data.keys()].sort(); },
        get length() { return data.size; },
        key(index) {
            let i = 0;
            for (const key of data.keys()) {
                if (i === index) return key;
                i++;
            }
            return null;
        },
    };
}

function replayInputFor(segment, storage) {
    const input = {
        seed: segment.seed,
        datetime: segment.datetime,
        nethackrc: segment.nethackrc,
        moves: segment.moves,
    };
    if (storage) input.storage = storage;
    return input;
}

function normalizeRng(entry) {
    return String(entry || '').replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}

function isRngCall(entry) {
    return /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(normalizeRng(entry));
}

function extractRngCalls(entries) {
    return (entries || []).filter(isRngCall).map(normalizeRng);
}

function pushAll(dst, src) {
    if (!src?.length) return;
    const chunk = 0x8000;
    for (let i = 0; i < src.length; i += chunk) {
        dst.push(...src.slice(i, i + chunk));
    }
}

function sameCursor(actual, expected) {
    if (!Array.isArray(expected)) return true;
    return Array.isArray(actual) &&
        actual[0] === expected[0] &&
        actual[1] === expected[1] &&
        actual[2] === expected[2];
}

function canonicalFromSession(session) {
    const rng = [];
    const steps = [];
    for (let segIdx = 0; segIdx < session.segments.length; segIdx++) {
        const seg = session.segments[segIdx];
        for (let stepIdx = 0; stepIdx < (seg.steps || []).length; stepIdx++) {
            const step = seg.steps[stepIdx];
            pushAll(rng, extractRngCalls(step.rng));
            if (step.screen) {
                steps.push({
                    segmentIndex: segIdx,
                    segmentStepIndex: stepIdx,
                    key: step.key ?? null,
                    screen: step.screen,
                    cursor: Array.isArray(step.cursor) ? step.cursor : null,
                });
            }
        }
    }
    return { rng, steps };
}

async function runSession(sessionPath, runSegment, scope, runStorage) {
    const raw = JSON.parse(readFileSync(sessionPath, 'utf8'));
    const session = normalizeSession(raw);
    const canonical = canonicalFromSession(session);
    const storage = scope === 'none'
        ? null
        : scope === 'run'
            ? runStorage
            : makeStorageHandle();

    const jsRng = [];
    const jsScreens = [];
    const jsCursors = [];
    let error = null;

    try {
        for (const seg of session.segments) {
            const game = await runSegment(replayInputFor(seg, storage));
            pushAll(jsRng, extractRngCalls(game.getRngLog?.() || []));
            pushAll(jsScreens, game.getScreens?.() || []);
            pushAll(jsCursors, game.getCursors?.() || []);
        }
    } catch (err) {
        error = err instanceof Error ? err.message : String(err);
    }

    let rngMatched = 0;
    let firstRngMismatch = null;
    for (let i = 0; i < canonical.rng.length; i++) {
        if (canonical.rng[i] === (jsRng[i] || null)) {
            rngMatched++;
        } else if (!firstRngMismatch) {
            firstRngMismatch = {
                index: i,
                expected: canonical.rng[i] || null,
                actual: jsRng[i] || null,
            };
        }
    }
    if (!firstRngMismatch && jsRng.length > canonical.rng.length) {
        firstRngMismatch = {
            index: canonical.rng.length,
            expected: null,
            actual: jsRng[canonical.rng.length],
        };
    }

    let screenMatched = 0;
    let cellsMatched = 0;
    let cursorsMatched = 0;
    let firstMismatch = null;
    for (let i = 0; i < canonical.steps.length; i++) {
        const expected = canonical.steps[i];
        const actualScreen = jsScreens[i] || '';
        const actualCursor = jsCursors[i] || null;
        const screen = compareScreen(actualScreen, expected.screen, 3);
        const cellsOk = screen.equal;
        const cursorOk = sameCursor(actualCursor, expected.cursor);
        if (cellsOk) cellsMatched++;
        if (cursorOk) cursorsMatched++;
        if (cellsOk && cursorOk) {
            screenMatched++;
        } else if (!firstMismatch) {
            firstMismatch = {
                index: i,
                segmentIndex: expected.segmentIndex,
                segmentStepIndex: expected.segmentStepIndex,
                key: expected.key,
                keyDisplay: keyToDisplay(expected.key),
                cellsOk,
                cursorOk,
                screen,
                cursor: {
                    expected: expected.cursor,
                    actual: actualCursor,
                },
            };
        }
    }

    return {
        session: basename(sessionPath),
        error,
        passed: !error &&
            rngMatched === canonical.rng.length &&
            screenMatched === canonical.steps.length,
        metrics: {
            rngCalls: {
                matched: rngMatched,
                total: canonical.rng.length,
                actualTotal: jsRng.length,
            },
            screens: {
                matched: screenMatched,
                total: canonical.steps.length,
                actualTotal: jsScreens.length,
            },
            cellsOnly: {
                matched: cellsMatched,
                total: canonical.steps.length,
            },
            cursors: {
                matched: cursorsMatched,
                total: canonical.steps.length,
            },
        },
        firstRngMismatch,
        firstMismatch,
    };
}

function summarize(results) {
    return results.reduce((acc, row) => {
        acc.sessions++;
        if (row.passed) acc.passing++;
        acc.screenMatched += row.metrics.screens.matched;
        acc.screenTotal += row.metrics.screens.total;
        acc.cellMatched += row.metrics.cellsOnly.matched;
        acc.cursorMatched += row.metrics.cursors.matched;
        acc.rngMatched += row.metrics.rngCalls.matched;
        acc.rngTotal += row.metrics.rngCalls.total;
        if (!row.passed) acc.failed.push(row);
        return acc;
    }, {
        sessions: 0,
        passing: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellMatched: 0,
        cursorMatched: 0,
        rngMatched: 0,
        rngTotal: 0,
        failed: [],
    });
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

async function runScope(scope, files) {
    const { runSegment } = await import(join(PROJECT_ROOT, 'js/jsmain.js'));
    const runStorage = scope === 'run' ? makeStorageHandle() : null;
    const results = [];
    for (const file of files) {
        results.push(await runSession(file, runSegment, scope, runStorage));
    }
    return {
        scope,
        results,
        storageKeys: runStorage?.dumpKeys?.() || [],
    };
}

function printScope(report, options) {
    const summary = summarize(report.results);
    console.log(`Storage scope ${report.scope}: ${summary.passing}/${summary.sessions} passing ` +
        `S ${fmtCount(summary.screenMatched, summary.screenTotal)} ` +
        `cells ${fmtCount(summary.cellMatched, summary.screenTotal)} ` +
        `cursors ${fmtCount(summary.cursorMatched, summary.screenTotal)} ` +
        `R ${fmtCount(summary.rngMatched, summary.rngTotal)}`);
    if (report.scope === 'run') {
        const keys = report.storageKeys.length
            ? report.storageKeys.slice(0, 8).join(', ') + (report.storageKeys.length > 8 ? ` +${report.storageKeys.length - 8}` : '')
            : '-';
        console.log(`- run storage keys: ${keys}`);
    }
    const rows = options.full ? summary.failed : summary.failed.slice(0, options.limit);
    for (const row of rows) {
        const m = row.metrics;
        const first = row.firstMismatch
            ? ` first=${row.firstMismatch.index}:${row.firstMismatch.keyDisplay} cells=${row.firstMismatch.cellsOk ? 'ok' : 'miss'} cursor=${row.firstMismatch.cursorOk ? 'ok' : 'miss'} surface=${row.firstMismatch.screen.surface}/${row.firstMismatch.screen.kind}`
            : '';
        const firstRng = row.firstRngMismatch
            ? ` FR=${row.firstRngMismatch.index}:${row.firstRngMismatch.expected}=>${row.firstRngMismatch.actual}`
            : '';
        const err = row.error ? ` error=${JSON.stringify(row.error)}` : '';
        console.log(`  ${row.session}: S ${fmtCount(m.screens.matched, m.screens.total)} ` +
            `cells ${fmtCount(m.cellsOnly.matched, m.cellsOnly.total)} ` +
            `cursors ${fmtCount(m.cursors.matched, m.cursors.total)} ` +
            `R ${fmtCount(m.rngCalls.matched, m.rngCalls.total)}${first}${firstRng}${err}`);
    }
    if (!options.full && summary.failed.length > rows.length) {
        console.log(`  ... ${summary.failed.length - rows.length} more failed session(s); use --full`);
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    await expandLeaderboardFailureTargets(options);
    const files = orderedFiles(resolveTargets(options.targets), options.order);
    const scopes = options.scope === 'both' ? ['session', 'run'] : [options.scope];
    console.log(`Score one-process storage scope: ${files.length} session(s), order ${options.order}`);
    if (options.sourceLabel) console.log(`Source: ${options.sourceLabel}`);
    for (const scope of scopes) {
        const report = await runScope(scope, files);
        printScope(report, options);
    }
}

if (process.argv[1] === SCRIPT_PATH) {
    main().catch((err) => {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    });
}
