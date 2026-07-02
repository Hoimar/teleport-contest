#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const MAX_BUFFER = 512 * 1024 * 1024;

function usage() {
    console.log([
        'Usage: node scripts/score-ref.mjs [--json] [--full] [--keep] [--target <path>] [--session-ref <ref>] [--runner-ref <ref>] [ref]',
        '',
        'Scores a clean code ref by unpacking it to /tmp, optionally overlaying',
        'the target session path and/or frozen scorer from another git ref,',
        'applying the scorer\'s official frozen js/ overlay, and running it.',
        'Default code ref is @{u}; default target is sessions.',
    ].join('\n'));
}

function parseArgs(argv) {
    const options = {
        ref: null,
        target: 'sessions',
        json: false,
        full: false,
        keep: false,
        sessionRef: null,
        runnerRef: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '-h' || arg === '--help') {
            usage();
            process.exit(0);
        } else if (arg === '--json') {
            options.json = true;
        } else if (arg === '--full') {
            options.full = true;
        } else if (arg === '--keep') {
            options.keep = true;
        } else if (arg === '--target') {
            options.target = argv[++i] || options.target;
        } else if (arg.startsWith('--target=')) {
            options.target = arg.slice('--target='.length);
        } else if (arg === '--session-ref') {
            options.sessionRef = argv[++i] || null;
        } else if (arg.startsWith('--session-ref=')) {
            options.sessionRef = arg.slice('--session-ref='.length);
        } else if (arg === '--runner-ref') {
            options.runnerRef = argv[++i] || null;
        } else if (arg.startsWith('--runner-ref=')) {
            options.runnerRef = arg.slice('--runner-ref='.length);
        } else if (!options.ref) {
            options.ref = arg;
        } else {
            throw new Error(`unexpected argument ${arg}`);
        }
    }
    options.ref ||= '@{u}';
    return options;
}

function gitOutput(args) {
    return execFileSync('git', args, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: MAX_BUFFER,
    }).trim();
}

function unpackRef(ref) {
    const dir = mkdtempSync(path.join(tmpdir(), 'tc-score-ref-'));
    const archive = execFileSync('git', ['archive', '--format=tar', ref], {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: MAX_BUFFER,
    });
    const tar = spawnSync('tar', ['-xf', '-', '-C', dir], {
        input: archive,
        encoding: 'utf8',
        maxBuffer: MAX_BUFFER,
    });
    if (tar.error || tar.status !== 0) {
        throw new Error(tar.error?.message || tar.stderr || 'tar extract failed');
    }
    return dir;
}

function safeRelativeTarget(target) {
    const normalized = path.posix.normalize(String(target || 'sessions').replace(/\\/g, '/'));
    if (!normalized || normalized === '.' || normalized.startsWith('../') || path.isAbsolute(normalized)) {
        throw new Error(`unsafe target path for session-ref overlay: ${target}`);
    }
    return normalized;
}

function overlayTargetFromRef(dir, ref, target) {
    const safeTarget = safeRelativeTarget(target);
    rmSync(path.join(dir, safeTarget), { recursive: true, force: true });
    const archive = execFileSync('git', ['archive', '--format=tar', ref, safeTarget], {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: MAX_BUFFER,
    });
    const tar = spawnSync('tar', ['-xf', '-', '-C', dir], {
        input: archive,
        encoding: 'utf8',
        maxBuffer: MAX_BUFFER,
    });
    if (tar.error || tar.status !== 0) {
        throw new Error(tar.error?.message || tar.stderr || `tar extract failed for ${safeTarget} from ${ref}`);
    }
}

function overlayFrozenFromRef(dir, ref) {
    overlayTargetFromRef(dir, ref, 'frozen');
}

function parseRunnerJson(stdout) {
    const marker = '__RESULTS_JSON__';
    const idx = stdout.lastIndexOf(marker);
    if (idx < 0) throw new Error('scorer output did not include __RESULTS_JSON__');
    return JSON.parse(stdout.slice(idx + marker.length).trim());
}

function applyFrozenOverlay(dir) {
    for (const name of ['isaac64.js', 'terminal.js', 'storage.js']) {
        copyFileSync(path.join(dir, 'frozen', name), path.join(dir, 'js', name));
    }
}

function cursorOnlyCount(metrics) {
    const cells = metrics.cellsOnly || metrics.screens;
    const cursors = metrics.cursors;
    if (!cells || !cursors) return 0;
    return cells.matched === cells.total ? Math.max(0, cells.total - cursors.matched) : 0;
}

function rowFromRunner(result) {
    const metrics = result.metrics || {};
    return {
        session: result.session,
        exact: Boolean(result.passed),
        screen: {
            matched: metrics.screens?.matched ?? 0,
            total: metrics.screens?.total ?? 0,
        },
        cellsOnly: {
            matched: metrics.cellsOnly?.matched ?? metrics.screens?.matched ?? 0,
            total: metrics.cellsOnly?.total ?? metrics.screens?.total ?? 0,
        },
        cursorOnly: cursorOnlyCount(metrics),
        rng: {
            matched: metrics.rngCalls?.matched ?? 0,
            total: metrics.rngCalls?.total ?? 0,
        },
        firstScreen: '-',
        firstRng: '-',
        error: result.error || null,
    };
}

function summarizeRows(rows) {
    return rows.reduce((acc, row) => {
        acc.sessions++;
        if (row.exact) acc.exact++;
        if (row.error) acc.errors++;
        acc.screenMatched += row.screen.matched;
        acc.screenTotal += row.screen.total;
        acc.cellMatched += row.cellsOnly.matched;
        acc.cursorOnly += row.cursorOnly;
        acc.rngMatched += row.rng.matched;
        acc.rngTotal += row.rng.total;
        return acc;
    }, {
        sessions: 0,
        exact: 0,
        errors: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellMatched: 0,
        cursorOnly: 0,
        rngMatched: 0,
        rngTotal: 0,
    });
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

function summarizeLine(summary) {
    return `exact ${summary.exact}/${summary.sessions} S ${fmtCount(summary.screenMatched, summary.screenTotal)} R ${fmtCount(summary.rngMatched, summary.rngTotal)} C ${summary.cursorOnly}`;
}

export function scoreRef(ref, options = {}) {
    let dir = null;
    try {
        const commitFull = gitOutput(['rev-parse', ref]);
        const commit = gitOutput(['rev-parse', '--short', ref]);
        const commitTime = gitOutput(['log', '-1', '--format=%cI', ref]);
        dir = unpackRef(ref);
        const target = options.target || 'sessions';
        const sessionRef = options.sessionRef || null;
        const sessionCommitFull = sessionRef ? gitOutput(['rev-parse', sessionRef]) : commitFull;
        const sessionCommit = sessionRef ? gitOutput(['rev-parse', '--short', sessionRef]) : commit;
        const sessionCommitTime = sessionRef ? gitOutput(['log', '-1', '--format=%cI', sessionRef]) : commitTime;
        if (sessionRef) overlayTargetFromRef(dir, sessionRef, target);
        const runnerRef = options.runnerRef || null;
        const runnerCommitFull = runnerRef ? gitOutput(['rev-parse', runnerRef]) : commitFull;
        const runnerCommit = runnerRef ? gitOutput(['rev-parse', '--short', runnerRef]) : commit;
        const runnerCommitTime = runnerRef ? gitOutput(['log', '-1', '--format=%cI', runnerRef]) : commitTime;
        if (runnerRef) overlayFrozenFromRef(dir, runnerRef);
        applyFrozenOverlay(dir);
        const run = spawnSync(process.execPath, ['frozen/ps_test_runner.mjs', target], {
            cwd: dir,
            encoding: 'utf8',
            maxBuffer: MAX_BUFFER,
        });
        if (run.error || run.status !== 0) {
            throw new Error(run.error?.message || run.stderr || run.stdout || 'ref scorer failed');
        }
        const parsed = parseRunnerJson(run.stdout || '');
        const sessions = (parsed.results || []).map(rowFromRunner);
        const summary = summarizeRows(sessions);
        return {
            available: true,
            label: `clean ref ${ref}`,
            ref,
            commit,
            commitFull,
            commitTime,
            sessionRef: sessionRef || ref,
            sessionCommit,
            sessionCommitFull,
            sessionCommitTime,
            runnerRef: runnerRef || ref,
            runnerCommit,
            runnerCommitFull,
            runnerCommitTime,
            target,
            dir: options.keep ? dir : null,
            summary,
            sessions,
            rawTimestamp: parsed.timestamp || null,
        };
    } catch (err) {
        return {
            available: false,
            label: `clean ref ${ref}`,
            ref,
            target: options.target || 'sessions',
            sessionRef: options.sessionRef || ref,
            runnerRef: options.runnerRef || ref,
            error: err instanceof Error ? err.message : String(err),
        };
    } finally {
        if (dir && !options.keep) rmSync(dir, { recursive: true, force: true });
    }
}

function printHuman(report, options) {
    console.log('# Ref Score');
    if (!report.available) {
        console.log(`- ref: ${report.ref}`);
        console.log(`- unavailable: ${report.error}`);
        return;
    }
    console.log(`- ref: ${report.ref}`);
    console.log(`- commit: ${report.commit} at ${report.commitTime || 'unknown'}`);
    if (report.sessionRef && report.sessionRef !== report.ref) {
        console.log(`- session ref: ${report.sessionRef} (${report.sessionCommit || 'unknown'} at ${report.sessionCommitTime || 'unknown'})`);
    }
    if (report.runnerRef && report.runnerRef !== report.ref) {
        console.log(`- runner ref: ${report.runnerRef} (${report.runnerCommit || 'unknown'} at ${report.runnerCommitTime || 'unknown'})`);
    }
    console.log(`- target: ${report.target}`);
    if (report.dir) console.log(`- worktree: ${report.dir}`);
    console.log(`- ${summarizeLine(report.summary)}`);
    const failed = report.sessions.filter((row) => !row.exact);
    if (failed.length) {
        console.log('\n## Non-Exact Sessions');
        for (const row of failed.slice(0, options.full ? failed.length : 20)) {
            console.log(`- ${row.session}: S ${fmtCount(row.screen.matched, row.screen.total)} R ${fmtCount(row.rng.matched, row.rng.total)} C ${row.cursorOnly}`);
        }
        if (!options.full && failed.length > 20) {
            console.log(`- showing 20/${failed.length}; rerun with --full for all rows`);
        }
    }
}

if (process.argv[1] === SCRIPT_PATH) {
    try {
        const options = parseArgs(process.argv.slice(2));
        const report = scoreRef(options.ref, options);
        if (options.json) console.log(JSON.stringify(report, null, 2));
        else printHuman(report, options);
        if (!report.available) process.exitCode = 1;
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
}
