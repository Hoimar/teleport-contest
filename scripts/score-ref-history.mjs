#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    leaderboardSessionRecords,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';
import { scoreRef } from './score-ref.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');

function usage() {
    return [
        'Usage: node scripts/score-ref-history.mjs [--leaderboard-json <file>] [--team <name>] [--limit N] [--from <ref>] [--full] [--json] [--no-progress]',
        '',
        'Scores recent clean git refs against the current failed public',
        'leaderboard sessions. Use this to test whether a persistent online row',
        'matches a stale code ref rather than the current pushed HEAD.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        leaderboardJson: existsSync(path.join(PROJECT_ROOT, '.cache/leaderboard-data.json'))
            ? '.cache/leaderboard-data.json'
            : null,
        team: null,
        limit: 12,
        from: 'HEAD',
        full: false,
        json: false,
        progress: true,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--leaderboard-json') {
            out.leaderboardJson = argv[++i] || null;
        } else if (arg.startsWith('--leaderboard-json=')) {
            out.leaderboardJson = arg.slice('--leaderboard-json='.length);
        } else if (arg === '--team') {
            out.team = argv[++i] || null;
        } else if (arg.startsWith('--team=')) {
            out.team = arg.slice('--team='.length);
        } else if (arg === '--limit') {
            out.limit = Number(argv[++i] || out.limit);
        } else if (arg.startsWith('--limit=')) {
            out.limit = Number(arg.slice('--limit='.length));
        } else if (arg === '--from') {
            out.from = argv[++i] || out.from;
        } else if (arg.startsWith('--from=')) {
            out.from = arg.slice('--from='.length);
        } else if (arg === '--full') {
            out.full = true;
        } else if (arg === '--json') {
            out.json = true;
        } else if (arg === '--no-progress') {
            out.progress = false;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    if (!out.leaderboardJson) throw new Error('--leaderboard-json is required when no cached snapshot exists');
    if (!Number.isFinite(out.limit) || out.limit < 1) out.limit = 12;
    out.limit = Math.min(Math.trunc(out.limit), 200);
    return out;
}

function git(args) {
    return execFileSync('git', args, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 64 * 1024 * 1024,
    }).trim();
}

function recentCommits(options) {
    const raw = git(['log', `--max-count=${options.limit}`, '--format=%H%x09%h%x09%cI%x09%s', options.from]);
    return raw.split('\n').filter(Boolean).map((line) => {
        const [commit, short, time, ...subjectParts] = line.split('\t');
        return { commit, short, time, subject: subjectParts.join('\t') };
    });
}

function copyFailureSessions(rows) {
    const dir = mkdtempSync(path.join(tmpdir(), 'tc-ref-history-sessions-'));
    for (const row of rows) {
        const name = row.session;
        const src = path.join(PROJECT_ROOT, 'sessions', name);
        if (!existsSync(src)) throw new Error(`missing session file ${src}`);
        mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
        copyFileSync(src, path.join(dir, name));
    }
    return dir;
}

function summarizeRows(rows) {
    return rows.reduce((acc, row) => {
        acc.sessions++;
        if (row.exact) acc.exact++;
        if (row.error) acc.errors++;
        acc.screenMatched += row.screen?.matched ?? 0;
        acc.screenTotal += row.screen?.total ?? 0;
        acc.cellMatched += row.cellsOnly?.matched ?? row.screen?.matched ?? 0;
        acc.cellTotal += row.cellsOnly?.total ?? row.screen?.total ?? 0;
        acc.cursorMatched += row.cursors?.matched ?? row.screen?.total ?? 0;
        acc.cursorTotal += row.cursors?.total ?? row.screen?.total ?? 0;
        acc.cursorOnly += row.cursorOnly ?? 0;
        acc.rngMatched += row.rng?.matched ?? 0;
        acc.rngTotal += row.rng?.total ?? 0;
        return acc;
    }, {
        sessions: 0,
        exact: 0,
        errors: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellMatched: 0,
        cellTotal: 0,
        cursorMatched: 0,
        cursorTotal: 0,
        cursorOnly: 0,
        rngMatched: 0,
        rngTotal: 0,
    });
}

function summaryDelta(left, right) {
    left = normalizeSummary(left);
    right = normalizeSummary(right);
    const keys = [
        'sessions',
        'exact',
        'errors',
        'screenMatched',
        'screenTotal',
        'cellMatched',
        'cellTotal',
        'cursorMatched',
        'cursorTotal',
        'cursorOnly',
        'rngMatched',
        'rngTotal',
    ];
    return Object.fromEntries(keys.map((key) => [key, (left?.[key] ?? 0) - (right?.[key] ?? 0)]));
}

function normalizeSummary(summary) {
    if (!summary) return null;
    const screenMatched = summary.screenMatched ?? 0;
    const screenTotal = summary.screenTotal ?? 0;
    const cellMatched = summary.cellMatched ?? screenMatched;
    const cellTotal = summary.cellTotal ?? screenTotal;
    const cursorOnly = summary.cursorOnly ?? 0;
    const cursorTotal = summary.cursorTotal ?? screenTotal;
    const cursorMatched = summary.cursorMatched ?? Math.max(0, cursorTotal - cursorOnly);
    return {
        sessions: summary.sessions ?? 0,
        exact: summary.exact ?? 0,
        errors: summary.errors ?? 0,
        screenMatched,
        screenTotal,
        cellMatched,
        cellTotal,
        cursorMatched,
        cursorTotal,
        cursorOnly,
        rngMatched: summary.rngMatched ?? 0,
        rngTotal: summary.rngTotal ?? 0,
    };
}

function sameSummary(left, right) {
    return Object.values(summaryDelta(left, right)).every((value) => value === 0);
}

function distance(delta) {
    return Math.abs(delta.exact) * 1000 +
        Math.abs(delta.screenMatched) +
        Math.abs(delta.screenTotal) +
        Math.abs(delta.cellMatched) +
        Math.abs(delta.cellTotal) +
        Math.abs(delta.cursorMatched) +
        Math.abs(delta.cursorTotal) +
        Math.abs(delta.rngMatched) +
        Math.abs(delta.rngTotal) +
        Math.abs(delta.cursorOnly);
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

function fmtSummary(summary) {
    return `${summary.exact}/${summary.sessions} S ${fmtCount(summary.screenMatched, summary.screenTotal)} ` +
        `cells ${fmtCount(summary.cellMatched, summary.cellTotal)} cursors ${fmtCount(summary.cursorMatched, summary.cursorTotal)} ` +
        `R ${fmtCount(summary.rngMatched, summary.rngTotal)} C ${summary.cursorOnly}`;
}

function fmtDelta(delta) {
    const sign = (value) => value >= 0 ? `+${value}` : String(value);
    return `exact ${sign(delta.exact)} S ${sign(delta.screenMatched)}/${sign(delta.screenTotal)} ` +
        `cells ${sign(delta.cellMatched)}/${sign(delta.cellTotal)} cursors ${sign(delta.cursorMatched)}/${sign(delta.cursorTotal)} ` +
        `R ${sign(delta.rngMatched)}/${sign(delta.rngTotal)} C ${sign(delta.cursorOnly)}`;
}

function loadLeaderboard(options) {
    const leaderboard = readLeaderboardSnapshot(options.leaderboardJson, PROJECT_ROOT);
    const teamName = options.team || inferTeamFromGitRemote(PROJECT_ROOT);
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) throw new Error(`team ${teamName || '(none)'} not found in ${leaderboard.url}`);
    const rows = leaderboardSessionRecords(team);
    const failedRows = rows.filter((row) => !row.exact);
    if (!failedRows.length) throw new Error(`team ${team.name || teamName} has no failed public leaderboard sessions`);
    return {
        source: leaderboard.url,
        snapshot: leaderboard.data?.timestamp || null,
        team: team.name || teamName,
        fork: team.fork || null,
        lastScored: team.lastScored || null,
        rows: failedRows,
        summary: summarizeRows(failedRows),
    };
}

function scoreHistory(options) {
    const leaderboard = loadLeaderboard(options);
    let targetDir = null;
    try {
        targetDir = copyFailureSessions(leaderboard.rows);
        const commits = recentCommits(options);
        const results = [];
        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];
            const report = scoreRef(commit.commit, { target: targetDir });
            const summary = report.available ? normalizeSummary(report.summary) : null;
            const delta = report.available ? summaryDelta(summary, leaderboard.summary) : null;
            const result = {
                commit,
                available: report.available,
                error: report.error || null,
                summary,
                delta,
                distance: delta ? distance(delta) : Number.POSITIVE_INFINITY,
                sameSummary: delta ? sameSummary(summary, leaderboard.summary) : false,
            };
            results.push(result);
            if (options.progress && !options.json) {
                const status = result.sameSummary ? 'MATCH' : `d=${result.distance}`;
                const summaryText = result.available ? fmtSummary(result.summary) : `unavailable: ${result.error}`;
                console.error(`[${i + 1}/${commits.length}] ${commit.short} ${status} ${summaryText}`);
            }
        }
        results.sort((a, b) => a.distance - b.distance || a.commit.time.localeCompare(b.commit.time));
        return {
            generatedAt: new Date().toISOString(),
            leaderboard,
            from: options.from,
            limit: options.limit,
            results,
        };
    } finally {
        if (targetDir) rmSync(targetDir, { recursive: true, force: true });
    }
}

function printHuman(payload, options) {
    console.log('# Ref History Score');
    const board = payload.leaderboard;
    console.log(`- source: ${board.source}${board.snapshot ? `, snapshot ${board.snapshot}` : ''}`);
    console.log(`- team: ${board.team} (${board.fork || 'unknown fork'}), last scored ${board.lastScored || 'unknown'}`);
    console.log(`- target: ${board.rows.length} failed leaderboard session(s)`);
    console.log(`- leaderboard reference: ${fmtSummary(board.summary)}`);
    console.log(`- scanned: ${payload.results.length} commit(s) from ${payload.from}`);
    const matches = payload.results.filter((row) => row.sameSummary);
    console.log(`- exact summary matches: ${matches.length}`);
    const rows = options.full ? payload.results : payload.results.slice(0, 12);
    for (const row of rows) {
        const status = row.sameSummary ? 'MATCH' : `d=${row.distance}`;
        if (!row.available) {
            console.log(`- ${row.commit.short} ${row.commit.time} ${status} unavailable: ${row.error}`);
            continue;
        }
        console.log(`- ${row.commit.short} ${row.commit.time} ${status}: ${fmtSummary(row.summary)}; delta ${fmtDelta(row.delta)}; ${row.commit.subject}`);
    }
    if (!options.full && payload.results.length > rows.length) {
        console.log(`- showing ${rows.length}/${payload.results.length}; rerun with --full for all scanned refs`);
    }
}

try {
    const options = parseArgs(process.argv.slice(2));
    const payload = scoreHistory(options);
    if (options.json) console.log(JSON.stringify(payload, null, 2));
    else printHuman(payload, options);
} catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
}
