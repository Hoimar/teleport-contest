#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import {
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    leaderboardSessionRecords,
} from './leaderboard-lib.mjs';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DEFAULT_HISTORY_DIR = '.cache/leaderboard-history';

function usage() {
    return [
        'Usage: node scripts/leaderboard-history-signatures.mjs [--history-dir <dir>] [--team <name>] [--json] [file...]',
        '',
        'Summarizes saved leaderboard JSON snapshots for one team, focusing on',
        'the public failed-session signature consumed by scorer-drift probes.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        historyDir: DEFAULT_HISTORY_DIR,
        team: null,
        json: false,
        files: [],
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--history-dir') {
            out.historyDir = argv[++i] || out.historyDir;
        } else if (arg.startsWith('--history-dir=')) {
            out.historyDir = arg.slice('--history-dir='.length);
        } else if (arg === '--team') {
            out.team = argv[++i] || null;
        } else if (arg.startsWith('--team=')) {
            out.team = arg.slice('--team='.length);
        } else if (arg === '--json') {
            out.json = true;
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown argument ${arg}`);
        } else {
            out.files.push(arg);
        }
    }
    out.team ||= inferTeamFromGitRemote(PROJECT_ROOT);
    if (!out.team) throw new Error('--team <name> is required when git origin does not identify the fork owner');
    return out;
}

function resolvePath(path) {
    return path.startsWith('/') ? path : resolve(PROJECT_ROOT, path);
}

function listSnapshotFiles(options) {
    if (options.files.length) {
        return options.files.map(resolvePath);
    }
    const dir = resolvePath(options.historyDir);
    if (!existsSync(dir)) throw new Error(`history directory not found: ${options.historyDir}`);
    return readdirSync(dir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => join(dir, file))
        .filter((file) => statSync(file).isFile())
        .sort();
}

function publicSummary(team) {
    const pub = team.public || {};
    return {
        passing: Number(pub.passing ?? 0),
        total: Number(pub.total ?? 0),
        points: Number(pub.points ?? 0),
        maxPoints: Number(pub.maxPoints ?? 0),
    };
}

function summarizeRows(rows) {
    return rows.reduce((acc, row) => {
        acc.sessions++;
        if (row.exact) acc.passing++;
        acc.screenMatched += row.screen.matched;
        acc.screenTotal += row.screen.total;
        acc.rngMatched += row.rng.matched;
        acc.rngTotal += row.rng.total;
        if (!row.exact) {
            const missed = row.screen.total - row.screen.matched;
            acc.failed++;
            acc.missedScreens += missed;
            acc.failures.push({
                session: row.session,
                missed,
                screen: row.screen,
                cellsOnly: row.cellsOnly,
                cursors: row.cursors,
                rng: row.rng,
            });
        }
        return acc;
    }, {
        sessions: 0,
        passing: 0,
        failed: 0,
        missedScreens: 0,
        screenMatched: 0,
        screenTotal: 0,
        rngMatched: 0,
        rngTotal: 0,
        failures: [],
    });
}

function loadSnapshot(file, teamName) {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const team = findLeaderboardTeam(data, teamName);
    if (!team) throw new Error(`team ${teamName} not found in ${file}`);
    const rows = leaderboardSessionRecords(team);
    const summary = summarizeRows(rows);
    return {
        file,
        label: basename(file),
        snapshot: data.timestamp || null,
        team: team.name || teamName,
        fork: team.fork || null,
        lastScored: team.lastScored || null,
        public: publicSummary(team),
        summary,
    };
}

function missMap(snapshot) {
    return new Map(snapshot.summary.failures.map((row) => [row.session, row.missed]));
}

function volatility(snapshots) {
    const names = new Set();
    for (const snapshot of snapshots) {
        for (const row of snapshot.summary.failures) names.add(row.session);
    }
    const rows = [];
    for (const session of [...names].sort()) {
        const counts = snapshots.map((snapshot) => missMap(snapshot).get(session) || 0);
        const unique = new Set(counts);
        rows.push({
            session,
            counts,
            min: Math.min(...counts),
            max: Math.max(...counts),
            changed: unique.size > 1,
        });
    }
    return rows;
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

function printHuman(payload) {
    console.log('# Leaderboard History Signatures');
    console.log(`- team: ${payload.team}`);
    console.log(`- snapshots: ${payload.snapshots.length}`);
    for (const snapshot of payload.snapshots) {
        const s = snapshot.summary;
        const pub = snapshot.public;
        console.log(`- ${snapshot.label}: snapshot ${snapshot.snapshot || 'unknown'}, ` +
            `lastScored ${snapshot.lastScored || 'unknown'}, public ${fmtCount(pub.passing, pub.total)} ` +
            `S ${fmtCount(pub.points, pub.maxPoints)}, failures ${s.failed}, missed ${s.missedScreens}`);
        const failures = s.failures.map((row) => `${row.session.replace(/\.session\.json$/, '')}:${row.missed}`);
        if (failures.length) console.log(`  ${failures.join(' ')}`);
    }
    const changed = payload.volatility.filter((row) => row.changed);
    console.log('## Volatile Miss Counts');
    if (!changed.length) {
        console.log('- none');
        return;
    }
    for (const row of changed) {
        console.log(`- ${row.session.replace(/\.session\.json$/, '')}: ${row.counts.join(' -> ')}`);
    }
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    const files = listSnapshotFiles(options);
    if (!files.length) throw new Error('no leaderboard history snapshots found');
    const snapshots = files.map((file) => loadSnapshot(file, options.team))
        .sort((a, b) => String(a.snapshot || a.label).localeCompare(String(b.snapshot || b.label)));
    const payload = {
        team: snapshots[0]?.team || options.team,
        snapshots,
        volatility: volatility(snapshots),
    };
    if (options.json) console.log(JSON.stringify(payload, null, 2));
    else printHuman(payload);
}

try {
    main();
} catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
}
