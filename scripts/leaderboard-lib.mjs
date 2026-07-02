import { spawnSync, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const DEFAULT_LEADERBOARD_BASE_URL = 'https://mazesofmenace.ai';

export function inferTeamFromGitRemote(cwd) {
    try {
        const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        const ssh = url.match(/github\.com[:/]([^/]+)\/teleport-contest(?:\.git)?$/i);
        if (ssh) return ssh[1];
        const generic = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i);
        return generic ? generic[1] : null;
    } catch (_) {
        return null;
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function compactFetchError(err) {
    const code = err?.cause?.code || err?.code;
    return code ? `${err.message} (${code})` : err.message;
}

async function fetchTextNode(url) {
    const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
}

function fetchTextCurl(url) {
    const child = spawnSync('curl', ['-L', '--silent', '--show-error', '--fail', '--max-time', '20', url], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    if (child.error || child.status !== 0) {
        throw new Error(child.error?.message || child.stderr.trim() || child.stdout.trim() || `curl exited ${child.status ?? 1}`);
    }
    return child.stdout;
}

async function fetchTextRobust(url) {
    const errors = [];
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await fetchTextNode(url);
        } catch (err) {
            errors.push(`fetch attempt ${attempt + 1}: ${compactFetchError(err)}`);
            await sleep(250 * (attempt + 1));
        }
    }
    try {
        return fetchTextCurl(url);
    } catch (err) {
        errors.push(`curl fallback: ${err.message}`);
        throw new Error(errors.join('; '));
    }
}

async function fetchJson(url) {
    const text = await fetchTextRobust(url);
    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error(`invalid JSON: ${err.message}`);
    }
}

function uniqueStrings(values) {
    return [...new Set(values.filter(Boolean))];
}

function stripCacheQuery(url) {
    const parsed = new URL(url);
    if (parsed.searchParams.has('t')) parsed.searchParams.delete('t');
    return parsed.toString();
}

function extractLeaderboardDataUrls(html, pageUrl) {
    const urls = [];
    const dataConst = html.match(/\bDATA_URL\s*=\s*['"]([^'"]+)['"]/);
    if (dataConst) urls.push(new URL(dataConst[1], pageUrl).toString());
    for (const match of html.matchAll(/fetch\(\s*['"]([^'"]*data\.json[^'"]*)['"]/g)) {
        urls.push(stripCacheQuery(new URL(match[1], pageUrl).toString()));
    }
    return urls;
}

async function discoverLeaderboardCandidates(baseUrl) {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const pages = [`${cleanBaseUrl}/leaderboard/`, `${cleanBaseUrl}/`];
    const candidates = [];
    const errors = [];
    for (const pageUrl of pages) {
        try {
            const html = await fetchTextRobust(pageUrl);
            candidates.push(...extractLeaderboardDataUrls(html, pageUrl));
        } catch (err) {
            errors.push(`${pageUrl}: ${err.message}`);
        }
    }
    candidates.push(
        `${cleanBaseUrl}/leaderboard/data.json`,
        `${cleanBaseUrl}/data.json`,
        `${cleanBaseUrl}/leaderboard.json`,
    );
    return { candidates: uniqueStrings(candidates), errors };
}

export async function fetchLeaderboard(baseUrl = DEFAULT_LEADERBOARD_BASE_URL) {
    const { candidates, errors } = await discoverLeaderboardCandidates(baseUrl);
    for (const url of candidates) {
        try {
            return { available: true, url, data: await fetchJson(url) };
        } catch (err) {
            errors.push(`${url}: ${err.message}`);
        }
    }
    return { available: false, errors };
}

export function readLeaderboardSnapshot(file, cwd = process.cwd()) {
    const path = file.startsWith('/') ? file : resolve(cwd, file);
    try {
        return {
            available: true,
            url: path,
            data: JSON.parse(readFileSync(path, 'utf8')),
            snapshot: true,
        };
    } catch (err) {
        throw new Error(`leaderboard snapshot unavailable: ${err.message}`);
    }
}

export function findLeaderboardTeam(data, teamName) {
    const teams = Array.isArray(data?.teams) ? data.teams : [];
    if (!teamName) return null;
    const wanted = teamName.toLowerCase();
    return teams.find((team) => String(team.name || '').toLowerCase() === wanted) ||
        teams.find((team) => String(team.fork || '').split('/')[0].toLowerCase() === wanted) ||
        null;
}

export function leaderboardSessionRecords(team) {
    if (!Array.isArray(team?.sessions)) return [];
    return team.sessions.map((session) => ({
        session: session.name,
        exact: Boolean(session.passed),
        screen: {
            matched: Number(session.screen?.matched ?? 0),
            total: Number(session.screen?.total ?? 0),
        },
        cellsOnly: {
            matched: Number(session.cellsOnly?.matched ?? session.screen?.matched ?? 0),
            total: Number(session.cellsOnly?.total ?? session.screen?.total ?? 0),
        },
        cursors: {
            matched: Number(session.cursors?.matched ?? session.screen?.total ?? 0),
            total: Number(session.cursors?.total ?? session.screen?.total ?? 0),
        },
        cursorOnly: Math.max(0,
            Number(session.cellsOnly?.matched ?? session.screen?.matched ?? 0) -
            Number(session.screen?.matched ?? 0)),
        rng: {
            matched: Number(session.rng?.matched ?? 0),
            total: Number(session.rng?.total ?? 0),
        },
        firstScreen: '-',
        firstRng: '-',
        error: null,
        warnings: [],
    }));
}

export function failedLeaderboardSessionNames(team) {
    return leaderboardSessionRecords(team)
        .filter((session) => !session.exact)
        .map((session) => session.session);
}

export async function expandLeaderboardFailureTargets(options, cwd = process.cwd()) {
    if (!options.leaderboardFailures) return;
    const teamName = options.team || inferTeamFromGitRemote(cwd);
    if (!teamName) throw new Error('--leaderboard-failures needs --team <name> or a GitHub origin owner');
    const leaderboard = options.leaderboardJson
        ? readLeaderboardSnapshot(options.leaderboardJson, cwd)
        : await fetchLeaderboard(options.baseUrl);
    if (!leaderboard.available) {
        throw new Error(`leaderboard unavailable: ${(leaderboard.errors || []).join(' | ')}`);
    }
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) throw new Error(`team ${teamName} not found in ${leaderboard.url}`);
    const records = leaderboardSessionRecords(team);
    const failureRows = records.filter((session) => !session.exact);
    const failures = failureRows.map((session) => session.session);
    if (!failures.length) throw new Error(`team ${team.name || teamName} has no failed public leaderboard sessions`);
    options.targets = [...failures, ...(options.targets || [])];
    options.leaderboardReference = {
        team: team.name || teamName,
        source: leaderboard.url,
        snapshot: leaderboard.data?.timestamp || null,
        lastScored: team.lastScored || null,
        rows: failureRows,
    };
    const snapshotTime = leaderboard.data?.timestamp ? `, snapshot ${leaderboard.data.timestamp}` : '';
    options.sourceLabel = `leaderboard failures for ${team.name || teamName} (${leaderboard.url}${snapshotTime}, last scored ${team.lastScored || 'unknown'})`;
}
