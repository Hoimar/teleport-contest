#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DEFAULT_BASE_URL = 'https://mazesofmenace.ai';

function usage() {
    return [
        'Usage: node scripts/play-assets-state.mjs [--team NAME] [--base-url URL] [--json]',
        '',
        'Compares checked-in production JS against the public /play/<team>/ mirror.',
        'Useful when leaderboard/playability behavior differs from local score.sh.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_BASE_URL,
        json: false,
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

function print(payload) {
    const s = payload.summary;
    console.log(`Play Assets: team ${payload.team}, source ${payload.baseUrl}/play/${payload.team}/`);
    console.log(`- ${s.same}/${s.total} match, ${s.different || 0} different, ${s.missing || 0} missing, ${s.error || 0} error`);
    for (const row of payload.rows.filter(row => row.status !== 'same')) {
        const commit = row.remoteCommit ? ` remoteCommit=${row.remoteCommit}` : '';
        const err = row.error ? ` error=${JSON.stringify(row.error)}` : '';
        console.log(`- ${row.file}: ${row.status} local=${short(row.localHash)} remote=${short(row.remoteHash)}${commit}${err}`);
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
