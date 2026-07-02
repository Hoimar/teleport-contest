#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DEFAULT_BASE_URL = 'https://mazesofmenace.ai';

function usage() {
    return [
        'Usage: node scripts/play-assets-state.mjs [--team NAME] [--base-url URL] [--score] [--target <path>] [--json]',
        '',
        'Compares checked-in production JS against the public /play/<team>/ mirror.',
        'Useful when leaderboard/playability behavior differs from local score.sh.',
        '--score downloads the public play JS bundle into a temp checkout and',
        'runs the frozen public scorer against the selected target.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_BASE_URL,
        json: false,
        score: false,
        target: 'sessions',
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--team') {
            out.team = argv[++i];
        } else if (arg.startsWith('--team=')) {
            out.team = arg.slice('--team='.length);
        } else if (arg === '--base-url') {
            out.baseUrl = argv[++i];
        } else if (arg.startsWith('--base-url=')) {
            out.baseUrl = arg.slice('--base-url='.length);
        } else if (arg === '--json') {
            out.json = true;
        } else if (arg === '--score') {
            out.score = true;
        } else if (arg === '--target') {
            out.target = argv[++i] || out.target;
        } else if (arg.startsWith('--target=')) {
            out.target = arg.slice('--target='.length);
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    out.baseUrl = out.baseUrl.replace(/\/$/, '');
    if (!out.team) out.team = inferTeamFromGitRemote();
    if (!out.team) throw new Error('could not infer team; pass --team NAME');
    return out;
}

function git(args, options = {}) {
    const child = spawnSync('git', args, {
        cwd: PROJECT_ROOT,
        encoding: options.encoding || 'utf8',
        maxBuffer: options.maxBuffer || 64 * 1024 * 1024,
    });
    if (child.status !== 0) return null;
    return child.stdout;
}

function inferTeamFromGitRemote() {
    const remote = git(['remote', 'get-url', 'origin']);
    const text = remote?.trim() || '';
    const match = text.match(/github\.com[:/]([^/]+)\/teleport-contest(?:\.git)?$/i);
    return match?.[1] || null;
}

function sha256Text(text) {
    return createHash('sha256').update(text).digest('hex');
}

function short(hash) {
    return hash ? hash.slice(0, 12) : '-';
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

function listProductionJs() {
    const out = git(['ls-files', 'js/*.js']);
    return (out || '').split('\n').filter(Boolean).sort();
}

async function fetchText(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        throw err;
    }
    return await response.text();
}

async function mapLimit(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    async function worker() {
        for (;;) {
            const idx = next++;
            if (idx >= items.length) return;
            results[idx] = await fn(items[idx], idx);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

function nearestCommitForContent(rel, hash) {
    const log = git(['log', '--format=%H', '--', rel]);
    if (!log) return null;
    for (const commit of log.split('\n').filter(Boolean)) {
        const content = git(['show', `${commit}:${rel}`], { maxBuffer: 64 * 1024 * 1024 });
        if (content != null && sha256Text(content) === hash) {
            const label = git(['log', '-1', '--format=%h %cI %s', commit])?.trim();
            return label || commit.slice(0, 12);
        }
    }
    return null;
}

async function inspectAsset(rel, options) {
    const localPath = `${PROJECT_ROOT}/${rel}`;
    const localText = readFileSync(localPath, 'utf8');
    const localHash = sha256Text(localText);
    const url = `${options.baseUrl}/play/${encodeURIComponent(options.team)}/${rel}`;
    try {
        const remoteText = await fetchText(url);
        const remoteHash = sha256Text(remoteText);
        const match = localHash === remoteHash;
        return {
            file: rel,
            status: match ? 'same' : 'different',
            localHash,
            remoteHash,
            remoteCommit: match ? null : nearestCommitForContent(rel, remoteHash),
            bytes: remoteText.length,
            url,
        };
    } catch (err) {
        return {
            file: rel,
            status: err.status === 404 ? 'missing' : 'error',
            localHash,
            remoteHash: null,
            error: err.message,
            url,
        };
    }
}

function summarize(rows) {
    return rows.reduce((acc, row) => {
        acc.total++;
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
    }, { total: 0, same: 0, different: 0, missing: 0, error: 0 });
}

function unpackHead() {
    const dir = mkdtempSync(path.join(tmpdir(), 'tc-play-assets-'));
    const archive = execFileSync('git', ['archive', '--format=tar', 'HEAD'], {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 512 * 1024 * 1024,
    });
    const tar = spawnSync('tar', ['-xf', '-', '-C', dir], {
        input: archive,
        encoding: 'utf8',
        maxBuffer: 512 * 1024 * 1024,
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

function scoreRow(result) {
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
        error: result.error || null,
    };
}

function summarizeScore(rows) {
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

async function scorePlayAssets(rows, options) {
    let dir = null;
    try {
        dir = unpackHead();
        for (const row of rows) {
            const dst = path.join(dir, row.file);
            if (row.status === 'missing') {
                rmSync(dst, { force: true });
            } else {
                const remoteText = await fetchText(row.url);
                mkdirSync(path.dirname(dst), { recursive: true });
                writeFileSync(dst, remoteText);
            }
        }
        for (const name of ['isaac64.js', 'terminal.js', 'storage.js']) {
            copyFileSync(path.join(dir, 'frozen', name), path.join(dir, 'js', name));
        }
        const child = spawnSync(process.execPath, ['frozen/ps_test_runner.mjs', options.target], {
            cwd: dir,
            encoding: 'utf8',
            maxBuffer: 512 * 1024 * 1024,
        });
        if (child.error || child.status !== 0) {
            throw new Error(child.error?.message || child.stderr || child.stdout || 'play asset scorer failed');
        }
        const parsed = parseRunnerJson(child.stdout || '');
        const sessions = (parsed.results || []).map(scoreRow);
        return {
            available: true,
            target: options.target,
            summary: summarizeScore(sessions),
            sessions,
            rawTimestamp: parsed.timestamp || null,
        };
    } catch (err) {
        return {
            available: false,
            target: options.target,
            error: err instanceof Error ? err.message : String(err),
        };
    } finally {
        if (dir) rmSync(dir, { recursive: true, force: true });
    }
}

function print(payload) {
    const s = payload.summary;
    console.log(`Play Assets: team ${payload.team}, source ${payload.baseUrl}/play/${payload.team}/`);
    console.log(`- ${s.same}/${s.total} match, ${s.different || 0} different, ${s.missing || 0} missing, ${s.error || 0} error`);
    for (const row of payload.rows.filter(row => row.status !== 'same')) {
        const commit = row.remoteCommit ? ` remoteCommit=${row.remoteCommit}` : '';
        const err = row.error ? ` error=${JSON.stringify(row.error)}` : '';
        console.log(`- ${row.file}: ${row.status} local=${short(row.localHash)} remote=${short(row.remoteHash)}${commit}${err}`);
    }
    if (payload.score) {
        console.log('\nPlay Asset Score:');
        if (!payload.score.available) {
            console.log(`- unavailable: ${payload.score.error}`);
            return;
        }
        const ss = payload.score.summary;
        console.log(`- target: ${payload.score.target}`);
        console.log(`- exact ${ss.exact}/${ss.sessions} S ${fmtCount(ss.screenMatched, ss.screenTotal)} R ${fmtCount(ss.rngMatched, ss.rngTotal)} C ${ss.cursorOnly}`);
        const failed = payload.score.sessions.filter(row => !row.exact);
        for (const row of failed.slice(0, 20)) {
            console.log(`- ${row.session}: S ${fmtCount(row.screen.matched, row.screen.total)} R ${fmtCount(row.rng.matched, row.rng.total)} C ${row.cursorOnly}`);
        }
        if (failed.length > 20) {
            console.log(`- showing 20/${failed.length}; rerun with --json for all rows`);
        }
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const files = listProductionJs();
    const rows = await mapLimit(files, 8, file => inspectAsset(file, options));
    const payload = {
        generatedAt: new Date().toISOString(),
        team: options.team,
        baseUrl: options.baseUrl,
        summary: summarize(rows),
        rows,
        score: options.score ? await scorePlayAssets(rows, options) : null,
    };
    if (options.json) console.log(JSON.stringify(payload, null, 2));
    else print(payload);
    const bad = rows.some(row => row.status !== 'same');
    if (bad) process.exitCode = 1;
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
