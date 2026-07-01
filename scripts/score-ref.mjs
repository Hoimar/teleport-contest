#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const MAX_BUFFER = 512 * 1024 * 1024;

function usage() {
    console.log([
        'Usage: node scripts/score-ref.mjs [--json] [--full] [--keep] [--target <path>] [ref]',
        '',
        'Scores a clean git ref by unpacking it to /tmp and running that ref\'s',
        'frozen public scorer. Default ref is @{u}; default target is sessions.',
    ].join('\n'));
}

function parseArgs(argv) {
    const options = {
        ref: null,
        target: 'sessions',
        json: false,
        full: false,
        keep: false,
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

function parseRunnerJson(stdout) {
    const marker = '__RESULTS_JSON__';
    const idx = stdout.lastIndexOf(marker);
    if (idx < 0) throw new Error('scorer output did not include __RESULTS_JSON__');
    return JSON.parse(stdout.slice(idx + marker.length).trim());
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
