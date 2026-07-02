#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
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

const DEC_TO_UNICODE = {
    '`': '\u25c6', a: '\u2592', f: '\u00b0', g: '\u00b1',
    j: '\u2518', k: '\u2510', l: '\u250c', m: '\u2514', n: '\u253c',
    q: '\u2500', t: '\u251c', u: '\u2524', v: '\u2534', w: '\u252c',
    x: '\u2502', y: '\u2264', z: '\u2265', '|': '\u2260',
    o: '\u23ba', s: '\u23bd', '{': '\u03c0', '~': '\u00b7',
};

function usage() {
    return [
        'Usage: node scripts/score-surfaces.mjs [--permission] [--leaderboard-failures] [--leaderboard-json <file>] [--team <name>] [--full] [--limit N] [file-or-dir...]',
        '',
        'Replays sessions once and scores the same JS output with multiple screen',
        'comparison surfaces. This catches scoreboard drift caused by scorer or',
        'comparator differences rather than NetHack state/RNG parity.',
        '--permission runs each replay worker under Node\'s permission sandbox',
        'with project-root read access, mirroring the judge constraint more closely.',
        '--leaderboard-failures fetches the current leaderboard and prepends its',
        'failed public sessions to the target list.',
        '--leaderboard-json reads a saved leaderboard snapshot instead of fetching',
        'live data and implies --leaderboard-failures.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        targets: [],
        full: false,
        limit: 20,
        permission: false,
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
        } else if (arg === '--permission') {
            out.permission = true;
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
        } else if (arg === '--limit') {
            out.limit = Number(argv[++i]);
        } else if (arg.startsWith('--limit=')) {
            out.limit = Number(arg.slice('--limit='.length));
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown argument ${arg}`);
        } else {
            out.targets.push(arg);
        }
    }
    out.baseUrl = out.baseUrl.replace(/\/+$/, '');
    if (out.leaderboardJson) out.leaderboardFailures = true;
    if (!Number.isFinite(out.limit) || out.limit < 0) throw new Error('--limit must be a non-negative number');
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

function preDecodeVersionOnly(s) {
    let cur = String(s || '');
    for (const re of STARTUP_VARIANT_LINES) {
        cur = cur.replace(re, '<<VERSION_BANNER>>');
    }
    return cur;
}

function preDecodeTimeOnly(s) {
    return String(s || '').replace(/^\d{2}:\d{2}:\d{2}\.$/gm, '<time>.');
}

function canonSGR(s) {
    const ESC = '\x1b';
    let out = '';
    let fg = 39, bold = false, inverse = false, underline = false;
    let i = 0;
    while (i < s.length) {
        if (s[i] === ESC && s[i + 1] === '[') {
            let j = i;
            let tfg = fg, tbold = bold, tinv = inverse, tul = underline;
            let isSGR = true;
            while (isSGR && s[j] === ESC && s[j + 1] === '[') {
                let k = j + 2;
                const numStart = k;
                while (k < s.length && (s[k] === ';' || (s[k] >= '0' && s[k] <= '9'))) k++;
                if (k >= s.length || s[k] !== 'm') { isSGR = false; break; }
                const params = s.slice(numStart, k).split(';').map(p => p === '' ? 0 : parseInt(p, 10));
                for (const p of params) {
                    if (p === 0) { tfg = 39; tbold = false; tinv = false; tul = false; }
                    else if (p === 1) tbold = true;
                    else if (p === 22) tbold = false;
                    else if (p === 4) tul = true;
                    else if (p === 24) tul = false;
                    else if (p === 7) tinv = true;
                    else if (p === 27) tinv = false;
                    else if ((p >= 30 && p <= 37) || p === 39) tfg = p;
                    else if (p >= 90 && p <= 97) tfg = p;
                }
                j = k + 1;
            }
            if (j > i) {
                if (tfg === 39 && !tbold && !tinv && !tul) {
                    if (fg !== 39 || bold || inverse || underline) out += ESC + '[0m';
                } else {
                    const parts = [];
                    const needReset = (!tbold && bold) || (!tinv && inverse) || (!tul && underline);
                    if (needReset) {
                        parts.push(0);
                        if (tbold) parts.push(1);
                        if (tinv) parts.push(7);
                        if (tul) parts.push(4);
                        if (tfg !== 39) parts.push(tfg);
                    } else {
                        if (tbold && !bold) parts.push(1);
                        if (tinv && !inverse) parts.push(7);
                        if (tul && !underline) parts.push(4);
                        if (tfg !== fg) parts.push(tfg);
                    }
                    if (parts.length) out += ESC + '[' + parts.join(';') + 'm';
                }
                fg = tfg; bold = tbold; inverse = tinv; underline = tul;
                i = j;
                continue;
            }
        }
        out += s[i];
        i++;
    }
    return out;
}

function translateDecSpans(s) {
    let out = '';
    let dec = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '\x0e') { dec = true; continue; }
        if (ch === '\x0f') { dec = false; continue; }
        if (ch === '\x1b' && s[i + 1] === '[') {
            const start = i;
            i += 2;
            while (i < s.length) {
                const c = s.charCodeAt(i);
                if (c >= 0x40 && c <= 0x7e) break;
                i++;
            }
            out += s.slice(start, i + 1);
            continue;
        }
        out += dec ? (DEC_TO_UNICODE[ch] || ch) : ch;
    }
    return out;
}

function normalizeLegacyString(s) {
    let cur = preDecode(s);
    cur = canonSGR(cur);
    cur = cur.replace(/\x1b\[(\d+)C/g, (_, n) => ' '.repeat(parseInt(n, 10)));
    cur = translateDecSpans(cur);
    cur = cur.replace(/[\x0e\x0f]+$/gm, '');
    cur = cur.replace(/\x0f((?:\x1b\[[0-9;]*[a-zA-Z])*)$/gm, '$1');
    cur = cur.replace(/^\x0f( +\x0e)/gm, '$1');
    let prev;
    do {
        prev = cur;
        cur = cur.replace(/(\x1b\[[0-9;]*[a-zA-Z])\x0f/g, '\x0f$1');
        cur = cur.replace(/\x0e(\x1b\[[0-9;]*[a-zA-Z])/g, '$1\x0e');
        cur = cur.replace(/( +)\x0f/g, '\x0f$1');
        cur = cur.replace(/\x0e( +)/g, '$1\x0e');
        cur = cur.replace(/\x0e\x0f/g, '');
        cur = cur.replace(/\x0f\x0e/g, '');
    } while (cur !== prev);
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

function visualCellsEqualWith(preprocessor) {
    return (actual, expected) => {
        const ga = decodeScreen(preprocessor(actual));
        const gb = decodeScreen(preprocessor(expected));
        for (let r = 0; r < ROWS_24; r++) {
            for (let c = 0; c < COLS_80; c++) {
                if (diffCell(ga[r][c], gb[r][c])) return false;
            }
        }
        return true;
    };
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

const SURFACES = [
    {
        key: 'visual',
        label: 'visual cells',
        cellsEqual: visualCellsEqual,
    },
    {
        key: 'visual-no-normalize',
        label: 'visual cells without variant normalization',
        cellsEqual: visualCellsEqualWith(s => String(s || '')),
    },
    {
        key: 'visual-no-time-normalize',
        label: 'visual cells without timestamp normalization',
        cellsEqual: visualCellsEqualWith(preDecodeVersionOnly),
    },
    {
        key: 'visual-no-version-normalize',
        label: 'visual cells without version-banner normalization',
        cellsEqual: visualCellsEqualWith(preDecodeTimeOnly),
    },
    {
        key: 'strict-display',
        label: 'strict display cells',
        cellsEqual: strictDisplayCellsEqual,
    },
    {
        key: 'strict-terminal',
        label: 'strict terminal cells',
        cellsEqual: strictTerminalCellsEqual,
    },
    {
        key: 'legacy-string',
        label: 'legacy normalized string',
        cellsEqual: (actual, expected) => normalizeLegacyString(actual) === normalizeLegacyString(expected),
    },
    {
        key: 'raw-string',
        label: 'raw string',
        cellsEqual: (actual, expected) => preDecode(actual) === preDecode(expected),
    },
];

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

    const surfaces = {};
    for (const surface of SURFACES) {
        let screensMatched = 0;
        let cellsMatched = 0;
        let cursorsMatched = 0;
        let firstMismatch = null;
        for (let i = 0; i < canonicalScreens.length; i++) {
            const cellsOk = surface.cellsEqual(jsScreens[i] || '', canonicalScreens[i] || '');
            const cursorOk = sameCursor(jsCursors[i], canonicalCursors[i]);
            if (cellsOk) cellsMatched++;
            if (cursorOk) cursorsMatched++;
            if (cellsOk && cursorOk) {
                screensMatched++;
            } else if (!firstMismatch) {
                firstMismatch = {
                    index: i,
                    cellsOk,
                    cursorOk,
                };
            }
        }
        surfaces[surface.key] = {
            passed: !jsError &&
                rngMatched === canonicalRng.length &&
                screensMatched === canonicalScreens.length,
            screens: { matched: screensMatched, total: canonicalScreens.length },
            cellsOnly: { matched: cellsMatched, total: canonicalScreens.length },
            cursors: { matched: cursorsMatched, total: canonicalScreens.length },
            firstMismatch,
        };
    }

    return {
        session: basename(sessionPath),
        error: jsError,
        rngCalls: { matched: rngMatched, total: canonicalRng.length },
        surfaces,
    };
}

function summarize(results) {
    const summaries = {};
    for (const surface of SURFACES) {
        summaries[surface.key] = {
            key: surface.key,
            label: surface.label,
            sessions: 0,
            passing: 0,
            screenMatched: 0,
            screenTotal: 0,
            cellMatched: 0,
            cursorMatched: 0,
            rngMatched: 0,
            rngTotal: 0,
            rows: [],
        };
    }
    for (const result of results) {
        for (const surface of SURFACES) {
            const score = result.surfaces[surface.key];
            const summary = summaries[surface.key];
            summary.sessions++;
            if (score.passed) summary.passing++;
            summary.screenMatched += score.screens.matched;
            summary.screenTotal += score.screens.total;
            summary.cellMatched += score.cellsOnly.matched;
            summary.cursorMatched += score.cursors.matched;
            summary.rngMatched += result.rngCalls.matched;
            summary.rngTotal += result.rngCalls.total;
            if (!score.passed) {
                summary.rows.push({
                    session: result.session,
                    screens: score.screens,
                    cellsOnly: score.cellsOnly,
                    cursors: score.cursors,
                    rngCalls: result.rngCalls,
                    firstMismatch: score.firstMismatch,
                    error: result.error,
                });
            }
        }
    }
    return summaries;
}

function summarizeLeaderboardRows(rows) {
    return (rows || []).reduce((acc, row) => {
        acc.sessions++;
        if (row.exact) acc.passing++;
        acc.screenMatched += row.screen?.matched ?? 0;
        acc.screenTotal += row.screen?.total ?? 0;
        acc.cellMatched += row.cellsOnly?.matched ?? row.screen?.matched ?? 0;
        acc.cellTotal += row.cellsOnly?.total ?? row.screen?.total ?? 0;
        acc.cursorMatched += row.cursors?.matched ?? row.screen?.total ?? 0;
        acc.cursorTotal += row.cursors?.total ?? row.screen?.total ?? 0;
        acc.rngMatched += row.rng?.matched ?? 0;
        acc.rngTotal += row.rng?.total ?? 0;
        return acc;
    }, {
        sessions: 0,
        passing: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellMatched: 0,
        cellTotal: 0,
        cursorMatched: 0,
        cursorTotal: 0,
        rngMatched: 0,
        rngTotal: 0,
    });
}

function fmtCount(count, total) {
    return `${count}/${total}`;
}

function fmtSigned(value) {
    return `${value >= 0 ? '+' : ''}${value}`;
}

function fmtCountDelta(matched, total, refMatched, refTotal) {
    return `${fmtSigned(matched - refMatched)}/${fmtSigned(total - refTotal)}`;
}

function formatReference(summary) {
    return `${summary.passing}/${summary.sessions} passing ` +
        `S ${fmtCount(summary.screenMatched, summary.screenTotal)} ` +
        `cells ${fmtCount(summary.cellMatched, summary.cellTotal)} ` +
        `cursors ${fmtCount(summary.cursorMatched, summary.cursorTotal)} ` +
        `R ${fmtCount(summary.rngMatched, summary.rngTotal)}`;
}

function formatMinusReference(summary, reference) {
    return `passing ${fmtSigned(summary.passing - reference.passing)} ` +
        `S ${fmtCountDelta(summary.screenMatched, summary.screenTotal, reference.screenMatched, reference.screenTotal)} ` +
        `cells ${fmtCountDelta(summary.cellMatched, summary.screenTotal, reference.cellMatched, reference.cellTotal)} ` +
        `cursors ${fmtCountDelta(summary.cursorMatched, summary.screenTotal, reference.cursorMatched, reference.cursorTotal)} ` +
        `R ${fmtCountDelta(summary.rngMatched, summary.rngTotal, reference.rngMatched, reference.rngTotal)}`;
}

function printResults(results, options) {
    const summaries = summarize(results);
    const referenceRows = options.leaderboardReference?.rows || [];
    const referenceSummary = summarizeLeaderboardRows(referenceRows);
    const referenceNames = new Set(referenceRows.map((row) => row.session));
    const referenceResults = referenceNames.size
        ? results.filter((result) => referenceNames.has(result.session))
        : [];
    const referenceSurfaceSummaries = referenceResults.length
        ? summarize(referenceResults)
        : null;
    console.log(`Score surfaces: ${results.length} session(s)${options.sourceLabel ? ` from ${options.sourceLabel}` : ''}`);
    if (referenceSummary.sessions) {
        const subset = referenceResults.length === results.length
            ? ''
            : `; surface deltas compare ${referenceResults.length}/${referenceSummary.sessions} referenced session(s)`;
        console.log(`Leaderboard reference: ${formatReference(referenceSummary)}${subset}`);
    }
    for (const surface of SURFACES) {
        const summary = summaries[surface.key];
        const referenceDelta = referenceSurfaceSummaries
            ? `; minus leaderboard ${formatMinusReference(referenceSurfaceSummaries[surface.key], referenceSummary)}`
            : '';
        console.log(`- ${surface.key}: ${summary.passing}/${summary.sessions} passing ` +
            `S ${fmtCount(summary.screenMatched, summary.screenTotal)} ` +
            `cells ${fmtCount(summary.cellMatched, summary.screenTotal)} ` +
            `cursors ${fmtCount(summary.cursorMatched, summary.screenTotal)} ` +
            `R ${fmtCount(summary.rngMatched, summary.rngTotal)}${referenceDelta}`);
        const rows = options.full ? summary.rows : summary.rows.slice(0, options.limit);
        for (const row of rows) {
            const first = row.firstMismatch
                ? ` first=${row.firstMismatch.index} cells=${row.firstMismatch.cellsOk ? 'ok' : 'miss'} cursor=${row.firstMismatch.cursorOk ? 'ok' : 'miss'}`
                : '';
            const err = row.error ? ` error=${JSON.stringify(row.error)}` : '';
            console.log(`  ${row.session}: S ${fmtCount(row.screens.matched, row.screens.total)} ` +
                `cells ${fmtCount(row.cellsOnly.matched, row.cellsOnly.total)} ` +
                `cursors ${fmtCount(row.cursors.matched, row.cursors.total)} ` +
                `R ${fmtCount(row.rngCalls.matched, row.rngCalls.total)}${first}${err}`);
        }
        if (!options.full && rows.length < summary.rows.length) {
            console.log(`  showing ${rows.length}/${summary.rows.length}; rerun with --full`);
        }
    }
}

async function main() {
    const workerArg = process.argv.find(arg => arg.startsWith('--worker-session='));
    if (workerArg) {
        const result = await runWorker(workerArg.slice('--worker-session='.length));
        console.log('__SURFACE_RESULT__');
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
        const nodeArgs = options.permission
            ? ['--permission', `--allow-fs-read=${PROJECT_ROOT}`]
            : [];
        const child = spawnSync(process.execPath, [...nodeArgs, SCRIPT_PATH, `--worker-session=${file}`], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            timeout: timeoutMs,
            maxBuffer: 64 * 1024 * 1024,
        });
        if (child.error || (child.status ?? 0) !== 0) {
            workerProcessFailed = true;
            const err = child.error?.message || child.stderr?.trim() || `exit ${child.status}`;
            results.push({
                session: basename(file),
                error: err,
                rngCalls: { matched: 0, total: 0 },
                surfaces: Object.fromEntries(SURFACES.map(surface => [surface.key, {
                    passed: false,
                    screens: { matched: 0, total: 0 },
                    cellsOnly: { matched: 0, total: 0 },
                    cursors: { matched: 0, total: 0 },
                    firstMismatch: null,
                }])),
            });
            continue;
        }

        const idx = child.stdout.lastIndexOf('__SURFACE_RESULT__');
        if (idx < 0) {
            throw new Error(`${basename(file)}: worker output missing __SURFACE_RESULT__`);
        }
        results.push(JSON.parse(child.stdout.slice(idx + '__SURFACE_RESULT__'.length).trim()));
    }

    printResults(results, options);
    if (workerProcessFailed) process.exitCode = 1;
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
