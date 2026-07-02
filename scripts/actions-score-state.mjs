#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
export const DEFAULT_ACTIONS_WORKFLOW = 'score.yml';
export const DEFAULT_ACTIONS_BRANCH = 'main';

function usage() {
    return [
        'Usage: node scripts/actions-score-state.mjs [--repo owner/repo] [--workflow score.yml] [--branch main] [--leaderboard-json <file>] [--team <name>] [--json]',
        '',
        'Reports the latest GitHub Actions Score workflow run and score-results',
        'artifact metadata. Pair this with scoreboard:state when the public',
        'leaderboard differs from local scorer surfaces.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        repo: null,
        workflow: DEFAULT_ACTIONS_WORKFLOW,
        branch: DEFAULT_ACTIONS_BRANCH,
        leaderboardJson: existsSync(join(PROJECT_ROOT, '.cache/leaderboard-data.json'))
            ? '.cache/leaderboard-data.json'
            : null,
        team: null,
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
        } else if (arg === '--json') {
            out.json = true;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
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

function apiHeaders() {
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'teleport-contest-score-actions-probe',
    };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
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

export function githubApiUrl(repo, workflow, branch) {
    const encodedWorkflow = encodeURIComponent(workflow);
    const params = new URLSearchParams({ branch, per_page: '1' });
    return `https://api.github.com/repos/${repo}/actions/workflows/${encodedWorkflow}/runs?${params.toString()}`;
}

export async function fetchActionsState(options = {}) {
    const repo = options.repo || inferRepoFromGitRemote();
    if (!repo) throw new Error('--repo owner/repo is required when origin is not a GitHub repo');
    const workflow = options.workflow || DEFAULT_ACTIONS_WORKFLOW;
    const branch = options.branch || DEFAULT_ACTIONS_BRANCH;
    const runs = await fetchJson(githubApiUrl(repo, workflow, branch));
    const latest = runs.workflow_runs?.[0] || null;
    const artifacts = latest ? await fetchJson(latest.artifacts_url) : null;
    return {
        repo,
        workflow,
        branch,
        totalRuns: Number(runs.total_count ?? 0),
        latest: latest ? {
            id: latest.id,
            number: latest.run_number,
            status: latest.status,
            conclusion: latest.conclusion,
            event: latest.event,
            title: latest.display_title,
            headBranch: latest.head_branch,
            headSha: latest.head_sha,
            headShaShort: String(latest.head_sha || '').slice(0, 7),
            createdAt: latest.created_at,
            startedAt: latest.run_started_at,
            updatedAt: latest.updated_at,
            htmlUrl: latest.html_url,
        } : null,
        artifacts: (artifacts?.artifacts || []).map((artifact) => ({
            id: artifact.id,
            name: artifact.name,
            size: artifact.size_in_bytes,
            expired: Boolean(artifact.expired),
            digest: artifact.digest || null,
            createdAt: artifact.created_at,
            updatedAt: artifact.updated_at,
            expiresAt: artifact.expires_at,
            downloadUrl: artifact.archive_download_url,
        })),
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
    if (payload.refs?.local?.full) {
        console.log(`- local HEAD: ${payload.refs.local.commit} ${payload.refs.local.subject || ''}`.trimEnd());
    }
    if (payload.refs?.upstream?.full) {
        const matches = payload.refs.upstream.full === run.headSha ? 'matches' : 'differs';
        console.log(`- upstream ${payload.refs.upstream.name}: ${payload.refs.upstream.commit} ${matches} latest run`);
    }
    if (payload.actions.artifacts.length) {
        console.log(`- artifacts: ${payload.actions.artifacts.length}`);
        for (const artifact of payload.actions.artifacts) {
            console.log(`  ${artifact.name}: id ${artifact.id}, expired ${artifact.expired ? 'yes' : 'no'}, size ${artifact.size}, created ${artifact.createdAt || 'unknown'}${artifact.digest ? `, ${artifact.digest}` : ''}`);
        }
    } else {
        console.log('- artifacts: none');
    }
    if (payload.leaderboard) {
        const board = payload.leaderboard;
        const pub = board.public || {};
        console.log('');
        console.log('## Leaderboard Cross-Check');
        console.log(`- source: ${board.source}${board.snapshot ? `, snapshot ${board.snapshot}` : ''}`);
        console.log(`- team: ${board.team} (${board.fork || 'unknown fork'}), last scored ${board.lastScored || 'unknown'}`);
        console.log(`- public: ${pub.passing ?? '?'} / ${pub.total ?? '?'} passing, S ${pub.points ?? '?'}/${pub.maxPoints ?? '?'}`);
        console.log(`- timing: leaderboard lastScored is ${timeRelation(board.lastScored, run.updatedAt)} latest Actions update`);
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
