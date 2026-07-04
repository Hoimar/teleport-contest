#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateRawSync } from 'node:zlib';

import {
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
export const DEFAULT_ACTIONS_WORKFLOW = 'score.yml';
export const DEFAULT_ACTIONS_BRANCH = 'main';
export const DEFAULT_ACTIONS_RUN_LIMIT = 10;
let cachedGhToken = undefined;

function usage() {
    return [
        'Usage: node scripts/actions-score-state.mjs [--repo owner/repo] [--workflow score.yml] [--branch main] [--leaderboard-json <file>] [--team <name>] [--artifact-score] [--json]',
        '',
        'Reports recent GitHub Actions Score workflow runs and score-results',
        'artifact metadata for the latest successful run. With --artifact-score,',
        'downloads score-results and compares score-summary.json with the leaderboard row.',
        'Artifact download uses GITHUB_TOKEN, GH_TOKEN, or an authenticated gh CLI session.',
        'Pair this with scoreboard:state when the public',
        'leaderboard differs from local scorer surfaces.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        repo: null,
        workflow: DEFAULT_ACTIONS_WORKFLOW,
        branch: DEFAULT_ACTIONS_BRANCH,
        limit: DEFAULT_ACTIONS_RUN_LIMIT,
        leaderboardJson: existsSync(join(PROJECT_ROOT, '.cache/leaderboard-data.json'))
            ? '.cache/leaderboard-data.json'
            : null,
        team: null,
        artifactScore: false,
        json: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--repo') {
            out.repo = argv[++i] || null;
        } else if (arg.startsWith('--repo=')) {
            out.repo = arg.slice('--repo='.length);
        } else if (arg === '--workflow') {
            out.workflow = argv[++i] || DEFAULT_ACTIONS_WORKFLOW;
        } else if (arg.startsWith('--workflow=')) {
            out.workflow = arg.slice('--workflow='.length);
        } else if (arg === '--branch') {
            out.branch = argv[++i] || DEFAULT_ACTIONS_BRANCH;
        } else if (arg.startsWith('--branch=')) {
            out.branch = arg.slice('--branch='.length);
        } else if (arg === '--limit') {
            out.limit = Number(argv[++i] || DEFAULT_ACTIONS_RUN_LIMIT);
        } else if (arg.startsWith('--limit=')) {
            out.limit = Number(arg.slice('--limit='.length));
        } else if (arg === '--leaderboard-json') {
            out.leaderboardJson = argv[++i] || null;
        } else if (arg.startsWith('--leaderboard-json=')) {
            out.leaderboardJson = arg.slice('--leaderboard-json='.length);
        } else if (arg === '--no-leaderboard') {
            out.leaderboardJson = null;
        } else if (arg === '--team') {
            out.team = argv[++i] || null;
        } else if (arg.startsWith('--team=')) {
            out.team = arg.slice('--team='.length);
        } else if (arg === '--artifact-score') {
            out.artifactScore = true;
        } else if (arg === '--json') {
            out.json = true;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    if (!Number.isFinite(out.limit) || out.limit < 1) out.limit = DEFAULT_ACTIONS_RUN_LIMIT;
    out.limit = Math.min(Math.trunc(out.limit), 100);
    return out;
}

function git(args, fallback = null) {
    try {
        return execFileSync('git', args, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (_) {
        return fallback;
    }
}

export function inferRepoFromGitRemote() {
    const url = git(['remote', 'get-url', 'origin']);
    if (!url) return null;
    const match = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    return match ? `${match[1]}/${match[2]}` : null;
}

function localRefs() {
    const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
    return {
        local: {
            commit: git(['rev-parse', '--short', 'HEAD']),
            full: git(['rev-parse', 'HEAD']),
            time: git(['show', '-s', '--format=%cI', 'HEAD']),
            subject: git(['show', '-s', '--format=%s', 'HEAD']),
        },
        upstream: upstream ? {
            name: upstream,
            commit: git(['rev-parse', '--short', upstream]),
            full: git(['rev-parse', upstream]),
            time: git(['show', '-s', '--format=%cI', upstream]),
            subject: git(['show', '-s', '--format=%s', upstream]),
        } : null,
    };
}

function ghAuthToken() {
    if (cachedGhToken !== undefined) return cachedGhToken;
    try {
        cachedGhToken = execFileSync('gh', ['auth', 'token'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 5000,
        }).trim() || null;
    } catch (_) {
        cachedGhToken = null;
    }
    return cachedGhToken;
}

function githubToken() {
    return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ghAuthToken();
}

function apiHeaders() {
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'teleport-contest-score-actions-probe',
    };
    const token = githubToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

export async function fetchJson(url) {
    const errors = [];
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetch(url, {
                headers: apiHeaders(),
                cache: 'no-store',
                signal: AbortSignal.timeout(15000),
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
            return JSON.parse(text);
        } catch (err) {
            errors.push(err.message);
            await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
    }
    throw new Error(errors.join('; '));
}

async function fetchBuffer(url) {
    const errors = [];
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetch(url, {
                headers: apiHeaders(),
                cache: 'no-store',
                redirect: 'follow',
                signal: AbortSignal.timeout(30000),
            });
            const textPrefix = res.ok ? null : (await res.text()).replace(/\s+/g, ' ').trim().slice(0, 200);
            if (!res.ok) {
                const err = new Error(`HTTP ${res.status}: ${textPrefix}`);
                err.noRetry = res.status === 401 || res.status === 403 || res.status === 404;
                throw err;
            }
            return Buffer.from(await res.arrayBuffer());
        } catch (err) {
            if (err.noRetry) throw err;
            errors.push(err.message);
            await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
    }
    throw new Error(errors.join('; '));
}

function readUInt32(buffer, offset) {
    return buffer.readUInt32LE(offset);
}

function readUInt16(buffer, offset) {
    return buffer.readUInt16LE(offset);
}

function zipEntryText(zip, wantedName) {
    let eocd = -1;
    for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
        if (readUInt32(zip, i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error('zip end-of-central-directory not found');
    const entryCount = readUInt16(zip, eocd + 10);
    let centralOffset = readUInt32(zip, eocd + 16);
    for (let i = 0; i < entryCount; i++) {
        if (readUInt32(zip, centralOffset) !== 0x02014b50) {
            throw new Error('invalid zip central directory');
        }
        const method = readUInt16(zip, centralOffset + 10);
        const compressedSize = readUInt32(zip, centralOffset + 20);
        const nameLen = readUInt16(zip, centralOffset + 28);
        const extraLen = readUInt16(zip, centralOffset + 30);
        const commentLen = readUInt16(zip, centralOffset + 32);
        const localOffset = readUInt32(zip, centralOffset + 42);
        const name = zip.subarray(centralOffset + 46, centralOffset + 46 + nameLen).toString('utf8');
        centralOffset += 46 + nameLen + extraLen + commentLen;
        if (name !== wantedName) continue;
        if (readUInt32(zip, localOffset) !== 0x04034b50) {
            throw new Error(`invalid zip local header for ${wantedName}`);
        }
        const localNameLen = readUInt16(zip, localOffset + 26);
        const localExtraLen = readUInt16(zip, localOffset + 28);
        const dataStart = localOffset + 30 + localNameLen + localExtraLen;
        const compressed = zip.subarray(dataStart, dataStart + compressedSize);
        if (method === 0) return compressed.toString('utf8');
        if (method === 8) return inflateRawSync(compressed).toString('utf8');
        throw new Error(`unsupported zip compression method ${method} for ${wantedName}`);
    }
    throw new Error(`${wantedName} not found in score-results artifact`);
}

function scoreFromSummaryJson(raw) {
    const parsed = JSON.parse(raw);
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    return {
        available: true,
        timestamp: parsed.timestamp || null,
        summary: results.reduce((acc, result) => {
            acc.sessions++;
            if (result.passed) acc.exact++;
            acc.screenMatched += Number(result.screen?.matched ?? 0);
            acc.screenTotal += Number(result.screen?.total ?? 0);
            acc.rngMatched += Number(result.rng?.matched ?? 0);
            acc.rngTotal += Number(result.rng?.total ?? 0);
            return acc;
        }, {
            sessions: 0,
            exact: 0,
            screenMatched: 0,
            screenTotal: 0,
            rngMatched: 0,
            rngTotal: 0,
        }),
        failures: results
            .filter((result) => !result.passed)
            .map((result) => result.session)
            .sort(),
    };
}

function scoreDelta(left, right) {
    if (!left || !right) return null;
    return {
        exact: left.exact - right.exact,
        sessions: left.sessions - right.sessions,
        screenMatched: left.screenMatched - right.screenMatched,
        screenTotal: left.screenTotal - right.screenTotal,
        rngMatched: left.rngMatched - right.rngMatched,
        rngTotal: left.rngTotal - right.rngTotal,
    };
}

async function fetchArtifactScore(artifact) {
    if (!artifact) return { available: false, error: 'score-results artifact unavailable' };
    if (artifact.expired) return { available: false, error: 'score-results artifact expired' };
    try {
        const zip = await fetchBuffer(artifact.downloadUrl);
        return scoreFromSummaryJson(zipEntryText(zip, 'score-summary.json'));
    } catch (err) {
        const authHint = githubToken()
            ? ''
            : ' Set GITHUB_TOKEN/GH_TOKEN or run gh auth login to download private GitHub Actions artifact zips.';
        return { available: false, error: `${err.message}${authHint}` };
    }
}

export function githubApiUrl(repo, workflow, branch, perPage = DEFAULT_ACTIONS_RUN_LIMIT) {
    const encodedWorkflow = encodeURIComponent(workflow);
    const params = new URLSearchParams({ branch, per_page: String(perPage) });
    return `https://api.github.com/repos/${repo}/actions/workflows/${encodedWorkflow}/runs?${params.toString()}`;
}

function compactRun(run) {
    if (!run) return null;
    return {
        id: run.id,
        number: run.run_number,
        status: run.status,
        conclusion: run.conclusion,
        event: run.event,
        title: run.display_title,
        headBranch: run.head_branch,
        headSha: run.head_sha,
        headShaShort: String(run.head_sha || '').slice(0, 7),
        createdAt: run.created_at,
        startedAt: run.run_started_at,
        updatedAt: run.updated_at,
        htmlUrl: run.html_url,
    };
}

function isSuccessfulRun(run) {
    return run?.status === 'completed' && run?.conclusion === 'success';
}

export async function fetchActionsState(options = {}) {
    const repo = options.repo || inferRepoFromGitRemote();
    if (!repo) throw new Error('--repo owner/repo is required when origin is not a GitHub repo');
    const workflow = options.workflow || DEFAULT_ACTIONS_WORKFLOW;
    const branch = options.branch || DEFAULT_ACTIONS_BRANCH;
    const limit = Math.min(Math.max(Math.trunc(Number(options.limit || DEFAULT_ACTIONS_RUN_LIMIT)), 1), 100);
    const runs = await fetchJson(githubApiUrl(repo, workflow, branch, limit));
    const recentRuns = runs.workflow_runs || [];
    const latest = recentRuns[0] || null;
    const latestSuccessful = recentRuns.find(isSuccessfulRun) || null;
    const artifactRun = latestSuccessful || latest;
    const artifacts = artifactRun ? await fetchJson(artifactRun.artifacts_url) : null;
    const compactArtifacts = (artifacts?.artifacts || []).map((artifact) => ({
        id: artifact.id,
        name: artifact.name,
        size: artifact.size_in_bytes,
        expired: Boolean(artifact.expired),
        digest: artifact.digest || null,
        createdAt: artifact.created_at,
        updatedAt: artifact.updated_at,
        expiresAt: artifact.expires_at,
        downloadUrl: artifact.archive_download_url,
    }));
    const scoreArtifact = compactArtifacts.find((artifact) => artifact.name === 'score-results') || null;
    return {
        repo,
        workflow,
        branch,
        limit,
        totalRuns: Number(runs.total_count ?? 0),
        latest: compactRun(latest),
        latestSuccessful: compactRun(latestSuccessful),
        artifactRun: compactRun(artifactRun),
        recentRuns: recentRuns.map(compactRun),
        artifacts: compactArtifacts,
        artifactScore: options.artifactScore ? await fetchArtifactScore(scoreArtifact) : null,
    };
}

function summarizeLeaderboard(options) {
    if (!options.leaderboardJson) return null;
    const leaderboard = readLeaderboardSnapshot(options.leaderboardJson, PROJECT_ROOT);
    const teamName = options.team || inferTeamFromGitRemote(PROJECT_ROOT);
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) throw new Error(`team ${teamName || '(none)'} not found in ${leaderboard.url}`);
    return {
        source: leaderboard.url,
        snapshot: leaderboard.data?.timestamp || null,
        team: team.name || teamName,
        fork: team.fork || null,
        lastScored: team.lastScored || null,
        public: team.public || null,
        heldOut: team.heldOut || null,
        summary: team.public ? {
            sessions: Number(team.public.total ?? 0),
            exact: Number(team.public.passing ?? 0),
            screenMatched: Number(team.public.points ?? 0),
            screenTotal: Number(team.public.maxPoints ?? 0),
            rngMatched: null,
            rngTotal: null,
        } : null,
    };
}

export function timeRelation(left, right) {
    const l = Date.parse(left || '');
    const r = Date.parse(right || '');
    if (!Number.isFinite(l) || !Number.isFinite(r)) return 'unknown';
    if (l < r) return 'before';
    if (l > r) return 'after';
    return 'same-time';
}

function printHuman(payload) {
    console.log('# GitHub Score Actions');
    console.log(`- repo: ${payload.actions.repo}`);
    console.log(`- workflow: ${payload.actions.workflow} on ${payload.actions.branch}`);
    if (!payload.actions.latest) {
        console.log('- latest run: unavailable');
        return;
    }
    const run = payload.actions.latest;
    console.log(`- latest run: #${run.number} ${run.id} ${run.status}/${run.conclusion || 'unknown'} (${run.event})`);
    console.log(`- head: ${run.headShaShort} ${run.title || ''}`.trimEnd());
    console.log(`- times: created ${run.createdAt || 'unknown'}, updated ${run.updatedAt || 'unknown'}`);
    console.log(`- url: ${run.htmlUrl}`);
    const successful = payload.actions.latestSuccessful;
    if (successful) {
        const suffix = successful.id === run.id ? 'same as latest' : `${successful.headShaShort} updated ${successful.updatedAt || 'unknown'}`;
        console.log(`- latest successful: #${successful.number} ${successful.id} (${suffix})`);
    } else {
        console.log(`- latest successful: none in last ${payload.actions.limit} run(s)`);
    }
    if (payload.refs?.local?.full) {
        console.log(`- local HEAD: ${payload.refs.local.commit} ${payload.refs.local.subject || ''}`.trimEnd());
    }
    if (payload.refs?.upstream?.full) {
        const comparedRun = successful || run;
        const matches = payload.refs.upstream.full === comparedRun.headSha ? 'matches' : 'differs';
        const comparedLabel = successful ? 'latest successful run' : 'latest run';
        console.log(`- upstream ${payload.refs.upstream.name}: ${payload.refs.upstream.commit} ${matches} ${comparedLabel}`);
    }
    if (payload.actions.artifacts.length) {
        const artifactRun = payload.actions.artifactRun || successful || run;
        console.log(`- artifacts for #${artifactRun.number}: ${payload.actions.artifacts.length}`);
        for (const artifact of payload.actions.artifacts) {
            console.log(`  ${artifact.name}: id ${artifact.id}, expired ${artifact.expired ? 'yes' : 'no'}, size ${artifact.size}, created ${artifact.createdAt || 'unknown'}${artifact.digest ? `, ${artifact.digest}` : ''}`);
        }
    } else {
        console.log('- artifacts: none');
    }
    if (payload.actions.artifactScore) {
        const artifactScore = payload.actions.artifactScore;
        if (artifactScore.available) {
            const s = artifactScore.summary;
            console.log(`- artifact score: exact ${s.exact}/${s.sessions} S ${s.screenMatched}/${s.screenTotal} R ${s.rngMatched}/${s.rngTotal}${artifactScore.timestamp ? `, timestamp ${artifactScore.timestamp}` : ''}`);
            if (artifactScore.failures.length) {
                console.log(`- artifact failures: ${artifactScore.failures.join(', ')}`);
            }
        } else {
            console.log(`- artifact score: unavailable: ${artifactScore.error}`);
        }
    }
    if (payload.leaderboard) {
        const board = payload.leaderboard;
        const pub = board.public || {};
        console.log('');
        console.log('## Leaderboard Cross-Check');
        console.log(`- source: ${board.source}${board.snapshot ? `, snapshot ${board.snapshot}` : ''}`);
        console.log(`- team: ${board.team} (${board.fork || 'unknown fork'}), last scored ${board.lastScored || 'unknown'}`);
        console.log(`- public: ${pub.passing ?? '?'} / ${pub.total ?? '?'} passing, S ${pub.points ?? '?'}/${pub.maxPoints ?? '?'}`);
        const comparedRun = successful || run;
        const comparedLabel = successful ? 'latest successful Actions update' : 'latest Actions update';
        console.log(`- timing: leaderboard lastScored is ${timeRelation(board.lastScored, comparedRun.updatedAt)} ${comparedLabel}`);
        if (payload.actions.artifactScore?.available && board.summary) {
            const d = scoreDelta(payload.actions.artifactScore.summary, board.summary);
            console.log(`- artifact minus leaderboard: exact ${d.exact >= 0 ? '+' : ''}${d.exact}, sessions ${d.sessions >= 0 ? '+' : ''}${d.sessions}, S ${d.screenMatched >= 0 ? '+' : ''}${d.screenMatched}/${d.screenTotal >= 0 ? '+' : ''}${d.screenTotal}`);
        }
    }
    console.log('');
    console.log('Artifact zip downloads may require authenticated GitHub API access even when metadata is public.');
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const payload = {
        generated: new Date().toISOString(),
        refs: localRefs(),
        actions: await fetchActionsState(options),
        leaderboard: summarizeLeaderboard(options),
    };
    if (options.json) {
        console.log(JSON.stringify(payload, null, 2));
    } else {
        printHuman(payload);
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}
