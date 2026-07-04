#!/usr/bin/env node

import {
    DEFAULT_LEADERBOARD_BASE_URL,
    fetchLeaderboard,
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    leaderboardSessionRecords,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

function usage() {
    return [
        'Usage: node scripts/online-viewer-state.mjs [--leaderboard-json <file>] [--team <name>] [--failed|--all] [--json]',
        '',
        'Prints the same per-session pass/fail advisory consumed by the online',
        'Session Viewer hub mode. This is leaderboard data, not an independent',
        'local replay.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        leaderboardJson: null,
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_LEADERBOARD_BASE_URL,
        failedOnly: false,
        all: false,
        json: false,
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
        } else if (arg === '--base-url') {
            out.baseUrl = argv[++i] || out.baseUrl;
        } else if (arg.startsWith('--base-url=')) {
            out.baseUrl = arg.slice('--base-url='.length);
        } else if (arg === '--failed') {
            out.failedOnly = true;
        } else if (arg === '--all') {
            out.all = true;
        } else if (arg === '--json') {
            out.json = true;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    out.baseUrl = out.baseUrl.replace(/\/+$/, '');
    return out;
}

function fmtCount(count, total) {
    return `${count}/${total}`;
}

function summarizeRows(rows) {
    const summary = {
        sessions: rows.length,
        passing: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellsMatched: 0,
        cellsTotal: 0,
        cursorsMatched: 0,
        cursorsTotal: 0,
        rngMatched: 0,
        rngTotal: 0,
        fullRng: 0,
        fullCells: 0,
        fullCursors: 0,
        cellsOnlyEqualsScreen: 0,
    };
    for (const row of rows) {
        if (row.exact) summary.passing++;
        summary.screenMatched += row.screen.matched;
        summary.screenTotal += row.screen.total;
        summary.cellsMatched += row.cellsOnly.matched;
        summary.cellsTotal += row.cellsOnly.total;
        summary.cursorsMatched += row.cursors.matched;
        summary.cursorsTotal += row.cursors.total;
        summary.rngMatched += row.rng.matched;
        summary.rngTotal += row.rng.total;
        if (row.rng.matched === row.rng.total) summary.fullRng++;
        if (row.cellsOnly.matched === row.cellsOnly.total) summary.fullCells++;
        if (row.cursors.matched === row.cursors.total) summary.fullCursors++;
        if (row.cellsOnly.matched === row.screen.matched &&
            row.cellsOnly.total === row.screen.total) {
            summary.cellsOnlyEqualsScreen++;
        }
    }
    summary.missedScreens = summary.screenTotal - summary.screenMatched;
    return summary;
}

function publicSummary(team) {
    const pub = team.public || {};
    return {
        passing: Number(pub.passing ?? 0),
        total: Number(pub.total ?? 0),
        screenMatched: Number(pub.points ?? 0),
        screenTotal: Number(pub.maxPoints ?? 0),
        rngPct: Number(pub.rngPct ?? 0),
        rngStepsPct: Number(pub.rngStepsPct ?? 0),
    };
}

function rowLine(row) {
    const status = row.exact ? 'pass' : 'fail';
    const missed = row.screen.total - row.screen.matched;
    const suffix = row.exact ? '' : ` missed=${missed}`;
    return `  ${status.padEnd(4)} ${row.session}: ` +
        `S ${fmtCount(row.screen.matched, row.screen.total)} ` +
        `cells ${fmtCount(row.cellsOnly.matched, row.cellsOnly.total)} ` +
        `cursors ${fmtCount(row.cursors.matched, row.cursors.total)} ` +
        `R ${fmtCount(row.rng.matched, row.rng.total)}${suffix}`;
}

async function loadLeaderboard(options) {
    if (options.leaderboardJson) {
        return readLeaderboardSnapshot(options.leaderboardJson, PROJECT_ROOT);
    }
    return fetchLeaderboard(options.baseUrl);
}

function makePayload({ leaderboard, teamName, team, rows, selectedRows }) {
    const pub = publicSummary(team);
    const selectedSummary = summarizeRows(selectedRows);
    const failedRows = rows.filter((row) => !row.exact);
    const failedSummary = summarizeRows(failedRows);
    return {
        source: leaderboard.url,
        snapshot: leaderboard.data?.timestamp || null,
        team: team.name || teamName,
        fork: team.fork || null,
        lastScored: team.lastScored || null,
        public: pub,
        failed: {
            rows: failedRows,
            summary: failedSummary,
        },
        selected: {
            rows: selectedRows,
            summary: selectedSummary,
        },
    };
}

function printPayload(payload, options) {
    const pub = payload.public;
    console.log('# Online Viewer Advisory');
    console.log(`- source: ${payload.source}`);
    if (payload.snapshot) console.log(`- snapshot: ${payload.snapshot}`);
    console.log(`- team: ${payload.team}${payload.fork ? ` (${payload.fork})` : ''}`);
    console.log(`- last scored: ${payload.lastScored || 'unknown'}`);
    console.log(`- public: ${fmtCount(pub.passing, pub.total)} passing ` +
        `S ${fmtCount(pub.screenMatched, pub.screenTotal)} ` +
        `rngPct ${pub.rngPct} rngStepsPct ${pub.rngStepsPct}`);

    const failed = payload.failed.summary;
    console.log(`- failures: ${failed.sessions} session(s), ${failed.missedScreens} missed screen(s); ` +
        `full RNG ${fmtCount(failed.fullRng, failed.sessions)}, ` +
        `full cells ${fmtCount(failed.fullCells, failed.sessions)}, ` +
        `cells-only equals combined ${fmtCount(failed.cellsOnlyEqualsScreen, failed.sessions)}, ` +
        `full cursors ${fmtCount(failed.fullCursors, failed.sessions)}`);

    const rows = payload.selected.rows;
    if (!rows.length) return;
    console.log(options.failedOnly ? '## Failed Sessions' : '## Sessions');
    for (const row of rows) console.log(rowLine(row));
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const teamName = options.team || inferTeamFromGitRemote(PROJECT_ROOT);
    if (!teamName) throw new Error('--team <name> is required when git origin does not identify the fork owner');
    const leaderboard = await loadLeaderboard(options);
    if (!leaderboard.available) {
        throw new Error(`leaderboard unavailable: ${(leaderboard.errors || []).join(' | ')}`);
    }
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) throw new Error(`team ${teamName} not found in ${leaderboard.url}`);
    const rows = leaderboardSessionRecords(team);
    const selectedRows = options.all ? rows : rows.filter((row) => !row.exact);
    const payload = makePayload({ leaderboard, teamName, team, rows, selectedRows });
    if (options.json) {
        console.log(JSON.stringify(payload, null, 2));
    } else {
        printPayload(payload, { failedOnly: !options.all });
    }
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
