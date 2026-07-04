#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
    analyzeSessionIsolated,
    DEFAULT_SENTINEL_SUITE,
    isExactSession,
    scoredScreenMatched,
    summarizeSessionResults,
} from './triage-lib.mjs';
import { auditHackDebt } from './hack-debt-audit.mjs';
import { collectMemoryIssues } from './memory-lint.mjs';
import { scoreRef } from './score-ref.mjs';
import { fetchActionsState } from './actions-score-state.mjs';
import {
    DEFAULT_LEADERBOARD_BASE_URL,
    fetchLeaderboard,
    findLeaderboardTeam,
    inferTeamFromGitRemote,
    leaderboardSessionRecords,
    readLeaderboardSnapshot,
} from './leaderboard-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_LOCAL_DIR = 'sessions';
const DEFAULT_LIVE_DIR = '.cache/live-sessions';

function usage() {
    return [
        'Usage: node scripts/parity-state.mjs [--refresh-live] [--full] [--json] [--team <name>] [--leaderboard-json <file>] [--save-leaderboard-json <file>] [--save-leaderboard-history-dir <dir>] [--score-ref <ref>|--score-upstream] [--score-actions]',
        '',
        'Options:',
        '  --refresh-live       Fetch hosted public sessions into .cache/live-sessions first.',
        '  --leaderboard        Fetch leaderboard data even without --refresh-live.',
        '  --leaderboard-json <file>  Read saved leaderboard JSON instead of fetching.',
        '  --save-leaderboard-json <file>  Save the classified leaderboard JSON.',
        '  --save-leaderboard-history-dir <dir>  Also save a timestamped leaderboard JSON snapshot.',
        '  --no-leaderboard     Skip leaderboard fetch/classification.',
        '  --team <name>        Leaderboard team name or fork owner to compare.',
        '  --base-url <url>     Override public site base URL.',
        '  --local-dir <dir>    Override checked-in public session directory.',
        '  --live-dir <dir>     Override cached live-public session directory.',
        '  --score-ref <ref>    Score a clean git ref and compare it with leaderboard public.',
        '  --score-upstream     Score the configured upstream ref and compare it with leaderboard public.',
        '  --score-actions      Fetch latest GitHub Actions Score run metadata for timing.',
        '  --full               Print per-session non-exact rows.',
        '  --json               Emit machine-readable JSON only.',
    ].join('\n');
}

function parseArgs(argv) {
    const options = {
        refreshLive: false,
        full: false,
        json: false,
        leaderboard: null,
        leaderboardJson: null,
        saveLeaderboardJson: null,
        saveLeaderboardHistoryDir: null,
        team: null,
        baseUrl: process.env.MOM_BASE_URL || DEFAULT_LEADERBOARD_BASE_URL,
        localDir: DEFAULT_LOCAL_DIR,
        liveDir: DEFAULT_LIVE_DIR,
        scoreRef: null,
        scoreUpstream: false,
        scoreActions: false,
        explicitTeam: false,
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--refresh-live') options.refreshLive = true;
        else if (arg === '--full') options.full = true;
        else if (arg === '--json') options.json = true;
        else if (arg === '--leaderboard') options.leaderboard = true;
        else if (arg === '--no-leaderboard') options.leaderboard = false;
        else if (arg === '--leaderboard-json') options.leaderboardJson = argv[++i] || null;
        else if (arg.startsWith('--leaderboard-json=')) options.leaderboardJson = arg.slice('--leaderboard-json='.length);
        else if (arg === '--save-leaderboard-json') options.saveLeaderboardJson = argv[++i] || null;
        else if (arg.startsWith('--save-leaderboard-json=')) options.saveLeaderboardJson = arg.slice('--save-leaderboard-json='.length);
        else if (arg === '--save-leaderboard-history-dir') options.saveLeaderboardHistoryDir = argv[++i] || null;
        else if (arg.startsWith('--save-leaderboard-history-dir=')) options.saveLeaderboardHistoryDir = arg.slice('--save-leaderboard-history-dir='.length);
        else if (arg === '--team') {
            options.team = argv[++i] || null;
            options.explicitTeam = true;
        } else if (arg.startsWith('--team=')) {
            options.team = arg.slice('--team='.length);
            options.explicitTeam = true;
        }
        else if (arg === '--base-url') options.baseUrl = argv[++i] || options.baseUrl;
        else if (arg.startsWith('--base-url=')) options.baseUrl = arg.slice('--base-url='.length);
        else if (arg === '--local-dir') options.localDir = argv[++i] || options.localDir;
        else if (arg.startsWith('--local-dir=')) options.localDir = arg.slice('--local-dir='.length);
        else if (arg === '--live-dir') options.liveDir = argv[++i] || options.liveDir;
        else if (arg.startsWith('--live-dir=')) options.liveDir = arg.slice('--live-dir='.length);
        else if (arg === '--score-ref') options.scoreRef = argv[++i] || null;
        else if (arg.startsWith('--score-ref=')) options.scoreRef = arg.slice('--score-ref='.length);
        else if (arg === '--score-upstream') options.scoreUpstream = true;
        else if (arg === '--score-actions') options.scoreActions = true;
        else throw new Error(`unknown argument ${arg}\n${usage()}`);
    }

    if (options.scoreRef && options.scoreUpstream) {
        throw new Error('--score-ref and --score-upstream are mutually exclusive');
    }
    if (options.leaderboard == null) {
        options.leaderboard = options.refreshLive || options.explicitTeam;
    }
    if (options.leaderboardJson) options.leaderboard = true;
    if (options.leaderboard && !options.team) options.team = inferTeamFromGitRemote(PROJECT_ROOT);
    options.baseUrl = options.baseUrl.replace(/\/+$/, '');
    return options;
}

function sha256(text) {
    return createHash('sha256').update(text).digest('hex');
}

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf8'));
}

function relPath(p) {
    return path.relative(PROJECT_ROOT, p) || '.';
}

function resolveProjectPath(file) {
    return path.isAbsolute(file) ? file : path.resolve(PROJECT_ROOT, file);
}

function gitOutput(args) {
    try {
        return execFileSync('git', args, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (_) {
        return null;
    }
}

function gitState() {
    const status = gitOutput(['status', '--short']) || '';
    const upstream = gitOutput(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
    const upstreamCommitFull = upstream ? gitOutput(['rev-parse', upstream]) : null;
    let ahead = null, behind = null;
    if (upstream) {
        const counts = gitOutput(['rev-list', '--left-right', '--count', `${upstream}...HEAD`]);
        const [behindText, aheadText] = (counts || '').split(/\s+/);
        if (behindText !== undefined && aheadText !== undefined) {
            behind = Number(behindText);
            ahead = Number(aheadText);
        }
    }
    return {
        commit: gitOutput(['rev-parse', '--short', 'HEAD']) ?? 'unknown',
        commitFull: gitOutput(['rev-parse', 'HEAD']) ?? 'unknown',
        commitTime: gitOutput(['log', '-1', '--format=%cI']),
        branch: gitOutput(['branch', '--show-current']) || null,
        upstream,
        upstreamCommit: upstreamCommitFull ? gitOutput(['rev-parse', '--short', upstream]) : null,
        upstreamCommitFull,
        upstreamCommitTime: upstream ? gitOutput(['log', '-1', '--format=%cI', upstream]) : null,
        ahead,
        behind,
        dirty: Boolean(status),
        dirtyFiles: status ? status.split('\n').filter(Boolean).length : 0,
    };
}

function loadManifest(dir) {
    const manifestPath = path.join(PROJECT_ROOT, dir, 'manifest.json');
    if (!existsSync(manifestPath)) {
        return { available: false, dir, error: `missing ${relPath(manifestPath)}` };
    }
    const manifest = readJson(manifestPath);
    if (!Array.isArray(manifest)) {
        return { available: false, dir, error: `manifest is not an array: ${relPath(manifestPath)}` };
    }
    return { available: true, dir, manifest };
}

function corpusFingerprint(dir) {
    const loaded = loadManifest(dir);
    if (!loaded.available) return loaded;

    const files = [];
    for (const name of loaded.manifest) {
        const file = path.join(PROJECT_ROOT, dir, name);
        if (!existsSync(file)) {
            files.push({ name, missing: true, sha256: null });
            continue;
        }
        files.push({ name, sha256: sha256(readFileSync(file)) });
    }
    const metadataPath = path.join(PROJECT_ROOT, dir, 'metadata.json');
    const metadata = existsSync(metadataPath) ? readJson(metadataPath) : null;
    return {
        available: true,
        dir,
        sessions: loaded.manifest.length,
        manifestHash: sha256(JSON.stringify(loaded.manifest)),
        corpusHash: sha256(JSON.stringify(files)),
        files,
        metadata,
    };
}

function compareCorpora(local, live) {
    if (!local.available) return { class: 'unknown', reason: local.error };
    if (!live.available) return { class: 'unknown', reason: live.error };

    const localFiles = new Map(local.files.map((file) => [file.name, file]));
    const liveFiles = new Map(live.files.map((file) => [file.name, file]));
    const added = [];
    const removed = [];
    const changed = [];
    const missing = [];

    for (const name of liveFiles.keys()) {
        if (!localFiles.has(name)) added.push(name);
    }
    for (const name of localFiles.keys()) {
        if (!liveFiles.has(name)) removed.push(name);
    }
    for (const [name, liveFile] of liveFiles.entries()) {
        const localFile = localFiles.get(name);
        if (!localFile) continue;
        if (localFile.missing || liveFile.missing) missing.push(name);
        else if (localFile.sha256 !== liveFile.sha256) changed.push(name);
    }

    const same = added.length === 0 && removed.length === 0 && changed.length === 0 && missing.length === 0;
    return {
        class: same ? 'same' : 'public-session-drift',
        added,
        removed,
        changed,
        missing,
        reason: same ? 'checked-in sessions match cached hosted public sessions' : 'hosted public sessions differ from checked-in sessions',
    };
}

function fetchLiveSessions(liveDir) {
    const child = spawnSync(process.execPath, ['scripts/fetch-live-public-sessions.mjs', liveDir], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    if (child.error || child.status !== 0) {
        return {
            status: child.status ?? 1,
            error: child.error?.message || child.stderr.trim() || child.stdout.trim() || 'live session fetch failed',
        };
    }
    return { status: 0 };
}

function firstScreenHead(result) {
    const first = result.firstScreenMismatch;
    if (!first) return '-';
    return `${first.index}:${first.mismatchClass}:${first.screen.surface}:${first.keyDisplay}`;
}

function firstRngHead(result) {
    const first = result.firstRngMismatch;
    if (!first) return '-';
    return `${first.index}:${first.expected ?? 'null'}=>${first.actual ?? 'null'}`;
}

function sessionRecord(result) {
    return {
        session: result.session,
        exact: isExactSession(result),
        screen: {
            matched: scoredScreenMatched(result),
            total: result.metrics.screens.total,
        },
        cellsOnly: {
            matched: result.metrics.screens.matched,
            total: result.metrics.screens.total,
        },
        cursorOnly: result.metrics.cursorOnly.count,
        rng: {
            matched: result.metrics.rngCalls.matched,
            total: result.metrics.rngCalls.total,
        },
        firstScreen: firstScreenHead(result),
        firstRng: firstRngHead(result),
        error: result.error,
        warnings: result.warnings,
    };
}

function metricDelta(left, right) {
    if (!left || !right) return null;
    return {
        matched: left.matched - right.matched,
        total: left.total - right.total,
    };
}

function formatSigned(n) {
    return n > 0 ? `+${n}` : String(n);
}

function sameMetric(left, right) {
    return left?.matched === right?.matched && left?.total === right?.total;
}

function compareCorpusScores(leftCorpus, rightCorpus, leftLabel, rightLabel, fingerprints = {}) {
    if (!leftCorpus.available || !rightCorpus.available) {
        return {
            available: false,
            reason: 'one or both corpora are unavailable',
            leftLabel,
            rightLabel,
        };
    }

    const leftBySession = new Map(leftCorpus.sessions.map((session) => [session.session, session]));
    const rightBySession = new Map(rightCorpus.sessions.map((session) => [session.session, session]));
    const leftHashes = new Map((fingerprints.left?.files || []).map((file) => [file.name, file.sha256]));
    const rightHashes = new Map((fingerprints.right?.files || []).map((file) => [file.name, file.sha256]));
    const sessions = [...new Set([...leftBySession.keys(), ...rightBySession.keys()])].sort();
    const rows = [];

    for (const session of sessions) {
        const left = leftBySession.get(session);
        const right = rightBySession.get(session);
        if (!left || !right) {
            rows.push({
                session,
                class: left ? 'missing-right' : 'missing-left',
                left,
                right,
            });
            continue;
        }
        const hashChanged = leftHashes.has(session) && rightHashes.has(session) &&
            leftHashes.get(session) !== rightHashes.get(session);
        const screenDelta = metricDelta(left.screen, right.screen);
        const rngDelta = metricDelta(left.rng, right.rng);
        const exactDelta = Number(left.exact) - Number(right.exact);
        const scoreChanged = exactDelta !== 0 ||
            !sameMetric(left.screen, right.screen) ||
            !sameMetric(left.rng, right.rng) ||
            left.cursorOnly !== right.cursorOnly;
        if (!hashChanged && !scoreChanged) continue;
        rows.push({
            session,
            class: hashChanged && scoreChanged ? 'session-and-score-drift'
                : hashChanged ? 'session-file-drift'
                    : 'score-drift',
            hashChanged,
            exact: { left: left.exact, right: right.exact, delta: exactDelta },
            screen: { left: left.screen, right: right.screen, delta: screenDelta },
            rng: { left: left.rng, right: right.rng, delta: rngDelta },
            cursorOnly: {
                left: left.cursorOnly,
                right: right.cursorOnly,
                delta: left.cursorOnly - right.cursorOnly,
            },
            first: {
                leftScreen: left.firstScreen,
                rightScreen: right.firstScreen,
                leftRng: left.firstRng,
                rightRng: right.firstRng,
            },
        });
    }

    const summary = {
        exact: leftCorpus.summary.exact - rightCorpus.summary.exact,
        sessions: leftCorpus.summary.sessions - rightCorpus.summary.sessions,
        screenMatched: leftCorpus.summary.screenMatched - rightCorpus.summary.screenMatched,
        screenTotal: leftCorpus.summary.screenTotal - rightCorpus.summary.screenTotal,
        rngMatched: leftCorpus.summary.rngMatched - rightCorpus.summary.rngMatched,
        rngTotal: leftCorpus.summary.rngTotal - rightCorpus.summary.rngTotal,
        cursorOnly: leftCorpus.summary.cursorOnly - rightCorpus.summary.cursorOnly,
    };

    return {
        available: true,
        leftLabel,
        rightLabel,
        summary,
        differingSessions: rows.length,
        rows,
    };
}

async function analyzeCorpus(dir, label) {
    const loaded = loadManifest(dir);
    if (!loaded.available) return { available: false, label, dir, error: loaded.error };

    const results = [];
    for (const name of loaded.manifest) {
        results.push(await analyzeSessionIsolated(path.join(dir, name), { sampleLimit: 1, cursorStepLimit: 3 }));
    }
    const summary = summarizeSessionResults(results);
    return {
        available: true,
        label,
        dir,
        summary,
        sessions: results.map(sessionRecord),
    };
}

async function analyzeSentinels() {
    const results = [];
    for (const ref of DEFAULT_SENTINEL_SUITE) {
        results.push(await analyzeSessionIsolated(ref, { sampleLimit: 1, cursorStepLimit: 3 }));
    }
    return {
        available: true,
        label: 'sentinel',
        suite: DEFAULT_SENTINEL_SUITE,
        ok: results.every(isExactSession),
        summary: summarizeSessionResults(results),
        sessions: results.map(sessionRecord),
    };
}

function summarizeLeaderboardSessions(team) {
    if (Array.isArray(team?.sessions)) {
        return team.sessions.reduce((acc, session) => {
            acc.sessions++;
            acc.exact += session.passed ? 1 : 0;
            acc.screenMatched += Number(session.screen?.matched ?? 0);
            acc.screenTotal += Number(session.screen?.total ?? 0);
            acc.rngMatched += Number(session.rng?.matched ?? 0);
            acc.rngTotal += Number(session.rng?.total ?? 0);
            return acc;
        }, {
            sessions: 0,
            exact: 0,
            screenMatched: 0,
            screenTotal: 0,
            rngMatched: 0,
            rngTotal: 0,
        });
    }
    const pub = team?.public || {};
    return {
        sessions: Number(pub.total ?? 0),
        exact: Number(pub.passing ?? 0),
        screenMatched: Number(pub.points ?? 0),
        screenTotal: Number(pub.maxPoints ?? 0),
        rngMatched: null,
        rngTotal: null,
    };
}

function compactLeaderboardTeam(team) {
    if (!team) return null;
    return {
        name: team.name,
        fork: team.fork,
        category: team.category,
        lastScored: team.lastScored,
        public: team.public,
        heldOut: team.heldOut,
    };
}

function makeLeaderboardCorpus(team) {
    const sessions = leaderboardSessionRecords(team);
    if (!sessions.length) return null;
    return {
        available: true,
        label: 'leaderboard public',
        dir: null,
        summary: {
            sessions: sessions.length,
            exact: sessions.filter((session) => session.exact).length,
            errors: 0,
            screenMatched: sessions.reduce((acc, session) => acc + session.screen.matched, 0),
            screenTotal: sessions.reduce((acc, session) => acc + session.screen.total, 0),
            cellMatched: sessions.reduce((acc, session) => acc + session.cellsOnly.matched, 0),
            cursorOnly: sessions.reduce((acc, session) => acc + session.cursorOnly, 0),
            rngMatched: sessions.reduce((acc, session) => acc + session.rng.matched, 0),
            rngTotal: sessions.reduce((acc, session) => acc + session.rng.total, 0),
        },
        sessions,
    };
}

function scoresEqual(localSummary, leaderboardSummary) {
    if (!localSummary || !leaderboardSummary) return false;
    const screenEqual = localSummary.screenMatched === leaderboardSummary.screenMatched &&
        localSummary.screenTotal === leaderboardSummary.screenTotal;
    if (!screenEqual) return false;
    if (leaderboardSummary.rngMatched == null || leaderboardSummary.rngTotal == null) return true;
    return localSummary.rngMatched === leaderboardSummary.rngMatched &&
        localSummary.rngTotal === leaderboardSummary.rngTotal;
}

function scoreShapeMatches(summary, leaderboardSummary) {
    if (!summary || !leaderboardSummary) return false;
    if (summary.sessions !== leaderboardSummary.sessions) return false;
    if (summary.screenTotal !== leaderboardSummary.screenTotal) return false;
    if (leaderboardSummary.rngTotal != null && summary.rngTotal !== leaderboardSummary.rngTotal) return false;
    return true;
}

function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function numberRange(values) {
    const finite = values.filter((value) => Number.isFinite(value));
    if (!finite.length) return null;
    return {
        min: Math.min(...finite),
        max: Math.max(...finite),
    };
}

function summarizeLeaderboardHistory(team, targetSummary, limit = 12) {
    const history = Array.isArray(team?.history) ? team.history : [];
    const tail = history.slice(-limit);
    const rows = tail.map((entry) => ({
        ts: entry.ts || null,
        points: finiteNumber(entry.points),
        maxPoints: finiteNumber(entry.maxPoints),
        passing: finiteNumber(entry.passing),
    }));
    const target = targetSummary ? {
        exact: targetSummary.exact,
        sessions: targetSummary.sessions,
        screenMatched: targetSummary.screenMatched,
        screenTotal: targetSummary.screenTotal,
    } : null;
    const comparable = target
        ? rows.filter((row) => row.maxPoints === target.screenTotal)
        : [];
    const matchingTarget = target
        ? comparable.filter((row) => row.points === target.screenMatched && row.passing === target.exact).length
        : 0;
    const points = numberRange(comparable.map((row) => row.points));
    const passing = numberRange(comparable.map((row) => row.passing));
    const pointSpread = points ? points.max - points.min : 0;
    const passingSpread = passing ? passing.max - passing.min : 0;
    const latest = rows[rows.length - 1] || null;
    return {
        entries: history.length,
        window: rows.length,
        comparable: comparable.length,
        firstTs: rows[0]?.ts || null,
        lastTs: latest?.ts || null,
        points,
        passing,
        pointSpread,
        passingSpread,
        matchingTarget,
        target,
        latest,
        volatile: comparable.length >= 3 && (pointSpread > 0 || passingSpread > 0),
        persistentMismatch: Boolean(target && comparable.length >= 3 && matchingTarget === 0),
    };
}

function leaderboardFailureSignature(team) {
    const sessions = Array.isArray(team?.sessions) ? team.sessions : [];
    const failed = sessions.filter((session) => !session.passed);
    const rows = failed.map((session) => {
        const rng = session.rng || {};
        const rngSteps = session.rngSteps || {};
        const screen = session.screen || {};
        const cellsOnly = session.cellsOnly || screen;
        const cursors = session.cursors || {};
        return {
            session: session.name,
            missedScreens: Number(screen.total ?? 0) - Number(screen.matched ?? 0),
            rngFull: Number(rng.matched ?? -1) === Number(rng.total ?? 0),
            rngStepsFull: Number(rngSteps.matched ?? -1) === Number(rngSteps.total ?? 0),
            cellsFull: Number(cellsOnly.matched ?? -1) === Number(cellsOnly.total ?? 0),
            cellsOnlyEqualsScreen: Number(cellsOnly.matched ?? -1) === Number(screen.matched ?? 0) &&
                Number(cellsOnly.total ?? -1) === Number(screen.total ?? 0),
            cursorsFull: Number(cursors.matched ?? -1) === Number(cursors.total ?? 0),
        };
    });
    return {
        failed: rows.length,
        missedScreens: rows.reduce((acc, row) => acc + row.missedScreens, 0),
        fullRng: rows.filter((row) => row.rngFull).length,
        fullRngSteps: rows.filter((row) => row.rngStepsFull).length,
        fullCells: rows.filter((row) => row.cellsFull).length,
        cellsOnlyEqualsScreen: rows.filter((row) => row.cellsOnlyEqualsScreen).length,
        fullCursors: rows.filter((row) => row.cursorsFull).length,
        rows,
    };
}

function gitCaveats(git) {
    const caveats = [];
    if (git.dirty) {
        caveats.push(`working tree has ${git.dirtyFiles || 1} uncommitted file(s) not represented by leaderboard`);
    }
    if ((git.ahead ?? 0) > 0) {
        caveats.push(`local HEAD is ahead of ${git.upstream || 'upstream'} by ${git.ahead} commit(s)`);
    }
    if ((git.behind ?? 0) > 0) {
        caveats.push(`local branch is behind ${git.upstream || 'upstream'} by ${git.behind} commit(s)`);
    }
    return caveats;
}

function reasonWithCaveats(reason, caveats) {
    return caveats.length ? `${reason}; ${caveats.join('; ')}` : reason;
}

function timeRelation(left, right) {
    const l = Date.parse(left || '');
    const r = Date.parse(right || '');
    if (!Number.isFinite(l) || !Number.isFinite(r)) return 'unknown';
    if (l < r) return 'before';
    if (l > r) return 'after';
    return 'same-time';
}

function compactScore(summary) {
    if (!summary) return 'unavailable';
    return `${summary.exact}/${summary.sessions} S ${summary.screenMatched}/${summary.screenTotal}`;
}

function scoreboardMotion({ git, team, publicEqual, persistentHistory }) {
    const lastScored = team?.lastScored || null;
    const upstreamName = git.upstream || null;
    let nextAction = 'Inspect scorer drift before assuming the scoreboard will move.';
    if (git.dirty) {
        nextAction = 'Commit or discard local WIP before expecting leaderboard parity with this tree.';
    } else if ((git.ahead ?? 0) > 0) {
        nextAction = `Push ${git.ahead} local commit(s) before expecting this HEAD on the leaderboard.`;
    } else if ((git.behind ?? 0) > 0) {
        nextAction = `Sync with ${upstreamName || 'upstream'} before comparing this checkout to the leaderboard.`;
    } else if (persistentHistory) {
        nextAction = 'Treat the delta as persistent scorer/environment drift; reproduce the online scorer surface instead of waiting on commit timing alone.';
    } else if (timeRelation(lastScored, git.commitTime) === 'before') {
        nextAction = 'Wait for or trigger a scorer run after the current HEAD commit time.';
    } else if (publicEqual) {
        nextAction = 'Public leaderboard is current for the comparable corpus; hidden held-out parity is the next scoring surface.';
    }
    return {
        localHead: {
            commit: git.commit,
            time: git.commitTime,
            lastScoredRelation: timeRelation(lastScored, git.commitTime),
        },
        upstreamHead: {
            name: upstreamName,
            commit: git.upstreamCommit,
            time: git.upstreamCommitTime,
            lastScoredRelation: timeRelation(lastScored, git.upstreamCommitTime),
        },
        ahead: git.ahead,
        behind: git.behind,
        dirty: git.dirty,
        lastScored,
        nextAction,
    };
}

function cleanRefEvidence(refCorpus, publicSummary, team) {
    if (!refCorpus) return null;
    if (!refCorpus.available) {
        return {
            available: false,
            ref: refCorpus.ref,
            error: refCorpus.error,
        };
    }
    const publicEqual = scoresEqual(refCorpus.summary, publicSummary);
    const shapeMatches = scoreShapeMatches(refCorpus.summary, publicSummary);
    const lastScoredRelation = timeRelation(team?.lastScored, refCorpus.commitTime);
    return {
        available: true,
        ref: refCorpus.ref,
        commit: refCorpus.commit,
        commitFull: refCorpus.commitFull,
        commitTime: refCorpus.commitTime,
        lastScoredRelation,
        summary: refCorpus.summary,
        publicEqual,
        shapeMatches,
        rulesOutLocalAhead: shapeMatches &&
            !publicEqual &&
            (lastScoredRelation === 'after' || lastScoredRelation === 'same-time'),
    };
}

function scoreActionsEvidence(actionsState, team, git) {
    if (!actionsState) return null;
    if (!actionsState.available) {
        return {
            available: false,
            error: actionsState.error || 'score actions unavailable',
        };
    }
    const latest = actionsState.latest || null;
    if (!latest) {
        return {
            available: false,
            error: 'no score workflow runs found',
            repo: actionsState.repo,
            workflow: actionsState.workflow,
            branch: actionsState.branch,
        };
    }
    const compared = actionsState.latestSuccessful || latest;
    const latestSuccessful = actionsState.latestSuccessful || null;
    const lastScoredRelation = timeRelation(team?.lastScored, compared.updatedAt);
    const headMatchesUpstream = Boolean(compared.headSha && git.upstreamCommitFull && compared.headSha === git.upstreamCommitFull);
    const headMatchesLocal = Boolean(compared.headSha && git.commitFull && compared.headSha === git.commitFull);
    const completedSuccess = compared.status === 'completed' && compared.conclusion === 'success';
    const scoreArtifact = (actionsState.artifacts || []).find((artifact) => artifact.name === 'score-results') || null;
    return {
        available: true,
        repo: actionsState.repo,
        workflow: actionsState.workflow,
        branch: actionsState.branch,
        latest: {
            id: latest.id,
            number: latest.number,
            status: latest.status,
            conclusion: latest.conclusion,
            headSha: latest.headSha,
            headShaShort: latest.headShaShort,
            createdAt: latest.createdAt,
            updatedAt: latest.updatedAt,
            htmlUrl: latest.htmlUrl,
        },
        latestSuccessful: latestSuccessful ? {
            id: latestSuccessful.id,
            number: latestSuccessful.number,
            status: latestSuccessful.status,
            conclusion: latestSuccessful.conclusion,
            headSha: latestSuccessful.headSha,
            headShaShort: latestSuccessful.headShaShort,
            createdAt: latestSuccessful.createdAt,
            updatedAt: latestSuccessful.updatedAt,
            htmlUrl: latestSuccessful.htmlUrl,
        } : null,
        compared: {
            id: compared.id,
            number: compared.number,
            status: compared.status,
            conclusion: compared.conclusion,
            headSha: compared.headSha,
            headShaShort: compared.headShaShort,
            createdAt: compared.createdAt,
            updatedAt: compared.updatedAt,
            htmlUrl: compared.htmlUrl,
        },
        artifact: scoreArtifact ? {
            id: scoreArtifact.id,
            name: scoreArtifact.name,
            expired: scoreArtifact.expired,
            digest: scoreArtifact.digest,
            createdAt: scoreArtifact.createdAt,
        } : null,
        lastScoredRelation,
        headMatchesUpstream,
        headMatchesLocal,
        completedSuccess,
        leaderboardPredatesLatestRun: completedSuccess && headMatchesUpstream && lastScoredRelation === 'before',
    };
}

function chooseLeaderboardScoreCorpus(publicSummary, localCorpus, liveCorpus) {
    if (localCorpus?.available && scoreShapeMatches(localCorpus.summary, publicSummary)) return localCorpus;
    if (liveCorpus?.available && scoreShapeMatches(liveCorpus.summary, publicSummary)) return liveCorpus;
    return liveCorpus?.available ? liveCorpus : localCorpus;
}

function classifyLeaderboard({ leaderboard, teamName, localCorpus, liveCorpus, corpusComparison, git, cleanRefCorpus, actionsState }) {
    if (!leaderboard?.available) {
        return { class: 'unknown', reason: (leaderboard?.errors || ['leaderboard unavailable']).join(' | ') };
    }
    const team = findLeaderboardTeam(leaderboard.data, teamName);
    if (!team) {
        return { class: 'unknown', reason: `team ${teamName || '(none)'} not found`, url: leaderboard.url };
    }
    const publicSummary = summarizeLeaderboardSessions(team);
    const leaderboardCorpus = makeLeaderboardCorpus(team);
    const cleanRef = cleanRefEvidence(cleanRefCorpus, publicSummary, team);
    const actions = scoreActionsEvidence(actionsState, team, git);
    const cleanRefDelta = cleanRefCorpus?.available && leaderboardCorpus
        ? compareCorpusScores(cleanRefCorpus, leaderboardCorpus, cleanRefCorpus.label, 'leaderboard public')
        : null;
    const withCleanRef = (payload) => ({
        ...payload,
        ...(cleanRef ? { cleanRef } : {}),
        ...(actions ? { actions } : {}),
        ...(cleanRefDelta ? { cleanRefDelta } : {}),
    });
    const scoreCorpus = chooseLeaderboardScoreCorpus(publicSummary, localCorpus, liveCorpus);
    if (!scoreCorpus?.available) {
        return withCleanRef({ class: 'unknown', reason: 'no local/live corpus score available', url: leaderboard.url, team: compactLeaderboardTeam(team) });
    }
    const sessionDelta = leaderboardCorpus
        ? compareCorpusScores(scoreCorpus, leaderboardCorpus, scoreCorpus.label, 'leaderboard public')
        : null;
    const caveats = gitCaveats(git);
    const history = summarizeLeaderboardHistory(team, scoreCorpus.summary);
    const failureSignature = leaderboardFailureSignature(team);
    if (!scoreShapeMatches(scoreCorpus.summary, publicSummary) && corpusComparison?.class === 'public-session-drift') {
        return withCleanRef({ class: 'public-session-drift', reason: reasonWithCaveats('leaderboard public corpus shape differs from checked-in and hosted public sessions', caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, history, failureSignature });
    }

    const publicEqual = scoresEqual(scoreCorpus.summary, publicSummary);
    const persistentHistory = !publicEqual && history.persistentMismatch;
    const motion = scoreboardMotion({ git, team, publicEqual, persistentHistory });
    if (!publicEqual && actions?.leaderboardPredatesLatestRun) {
        const lagAfterPersistentDrift = persistentHistory && cleanRef?.shapeMatches && !cleanRef.publicEqual;
        const nextAction = lagAfterPersistentDrift
            ? 'Leaderboard predates the latest successful GitHub Score run, but recent comparable history was already persistently below local. Refresh after the online scorer catches up; if it still misses, run score:online-viewer, score:leaderboard-failures, score:false-positive-audit, score:online-history, and score:ref-history before escalating to backend scorer/deployment evidence.'
            : 'Leaderboard predates the latest successful GitHub Score run for the current upstream HEAD. Wait for or trigger the online scorer after that run, then refresh scoreboard:state.';
        const cls = lagAfterPersistentDrift ? 'leaderboard-lag-after-persistent-drift' : 'leaderboard-lag';
        const reason = lagAfterPersistentDrift
            ? `latest successful GitHub Score run #${actions.compared.number} for ${actions.compared.headShaShort} completed after leaderboard lastScored, but recent comparable history has ${history.matchingTarget}/${history.comparable} score(s) matching local ${scoreCorpus.label}; the row is lagging a push after an unresolved scorer delta`
            : `latest successful GitHub Score run #${actions.compared.number} for ${actions.compared.headShaShort} completed after leaderboard lastScored; the online row has not caught up to the current pushed ref`;
        return withCleanRef({
            class: cls,
            reason: reasonWithCaveats(reason, caveats),
            url: leaderboard.url,
            team: compactLeaderboardTeam(team),
            publicSummary,
            sessionDelta,
            caveats,
            motion: { ...motion, nextAction },
            history,
            failureSignature,
        });
    }
    if (publicEqual) {
        const held = team.heldOut;
        if (held && Number(held.points ?? 0) !== Number(held.maxPoints ?? 0)) {
            return withCleanRef({ class: 'heldout-only-gap', reason: reasonWithCaveats('public score matches; held-out sessions remain private cleanliness evidence', caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
        }
        return withCleanRef({ class: 'same', reason: reasonWithCaveats(`leaderboard public score matches local ${scoreCorpus.label} score`, caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
    }

    const cleanRefSupportsScorerDrift = cleanRef?.shapeMatches &&
        !cleanRef.publicEqual &&
        (cleanRef.rulesOutLocalAhead || persistentHistory);
    if (cleanRefSupportsScorerDrift) {
        const refScore = compactScore(cleanRef.summary);
        const cls = persistentHistory ? 'persistent-scorer-drift' : 'scorer-drift';
        const failureProbe = failureSignature?.failed
            ? ' Run npm run score:online-viewer, score:leaderboard-failures, and score:false-positive-audit to compare the current failed public sessions across local scorer surfaces.'
            : '';
        const actionsProbe = ' Run npm run score:actions:artifact to inspect the latest GitHub Score workflow artifact totals when credentials are available.';
        const refHistoryProbe = ' Run npm run score:online-history and score:ref-history to test saved-row volatility and whether the online row fingerprints a recent stale code ref.';
        const evidence = cleanRef.rulesOutLocalAhead
            ? `leaderboard lastScored is ${cleanRef.lastScoredRelation} that ref`
            : `recent comparable leaderboard history has ${history.matchingTarget}/${history.comparable} score(s) matching local ${scoreCorpus.label}`;
        const cleanRefMotion = {
            ...motion,
            nextAction: `Clean-ref evidence rules out local-ahead timing.${failureProbe}${actionsProbe}${refHistoryProbe} Inspect deployment/scorer artifacts if local surfaces still pass.`,
        };
        return withCleanRef({
            class: cls,
            reason: reasonWithCaveats(`clean ref ${cleanRef.ref} (${cleanRef.commit}) scores ${refScore}, and ${evidence}; local-ahead timing alone does not explain the public delta`, caveats),
            url: leaderboard.url,
            team: compactLeaderboardTeam(team),
            publicSummary,
            sessionDelta,
            caveats,
            motion: cleanRefMotion,
            history,
            failureSignature,
        });
    }

    if ((git.ahead ?? 0) > 0) {
        return withCleanRef({ class: 'local-dirty-or-unpushed', reason: reasonWithCaveats(`local HEAD is ahead of ${git.upstream || 'upstream'} and cannot be reflected by leaderboard yet`, caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
    }
    if (git.dirty) {
        return withCleanRef({ class: 'local-dirty-or-unpushed', reason: reasonWithCaveats('working tree has local changes not represented by leaderboard', caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
    }
    if (persistentHistory) {
        return withCleanRef({ class: 'persistent-scorer-drift', reason: reasonWithCaveats(`leaderboard history has ${history.matchingTarget}/${history.comparable} recent comparable score(s) matching local ${scoreCorpus.label}; timestamp lag alone does not explain the stable public delta`, caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
    }
    if (team.lastScored && git.commitTime && Date.parse(team.lastScored) < Date.parse(git.commitTime)) {
        return withCleanRef({ class: 'leaderboard-lag', reason: reasonWithCaveats('leaderboard lastScored is older than local HEAD commit time', caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
    }
    return withCleanRef({ class: 'scorer-drift', reason: reasonWithCaveats('same public corpus but leaderboard public score differs from local scorer output', caveats), url: leaderboard.url, team: compactLeaderboardTeam(team), publicSummary, sessionDelta, caveats, motion, history, failureSignature });
}

function auditSummary() {
    const hackFindings = auditHackDebt();
    const memoryIssues = collectMemoryIssues();
    return {
        hackDebt: {
            hard: hackFindings.filter((finding) => finding.level === 'hard').length,
            suspicious: hackFindings.filter((finding) => finding.level === 'suspicious').length,
        },
        memory: {
            issues: memoryIssues.length,
        },
    };
}

function saveLeaderboardSnapshot(file, data) {
    if (!file || !data) return null;
    const target = resolveProjectPath(file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
    return relPath(target);
}

function leaderboardHistoryFile(dir, data) {
    if (!dir || !data) return null;
    const raw = data.timestamp || new Date().toISOString();
    const stamp = String(raw).replace(/[^0-9A-Za-z_-]+/g, '-').replace(/^-+|-+$/g, '') || 'snapshot';
    return path.join(dir, `${stamp}.json`);
}

function fmtCount(matched, total) {
    return `${matched}/${total}`;
}

function fmtRange(range, suffix = '') {
    if (!range) return 'unknown';
    const body = range.min === range.max ? `${range.min}` : `${range.min}-${range.max}`;
    return `${body}${suffix}`;
}

function summarizeLine(summary) {
    return `exact ${summary.exact}/${summary.sessions} S ${fmtCount(summary.screenMatched, summary.screenTotal)} R ${fmtCount(summary.rngMatched, summary.rngTotal)} C ${summary.cursorOnly ?? 0}`;
}

function printCorpus(title, corpus) {
    console.log(`\n## ${title}`);
    if (!corpus.available) {
        console.log(`- unavailable: ${corpus.error}`);
        return;
    }
    console.log(`- ${summarizeLine(corpus.summary)}`);
}

function printNonExact(title, corpus, limit) {
    if (!corpus.available) return;
    const rows = corpus.sessions.filter((session) => !session.exact).slice(0, limit);
    if (!rows.length) return;
    console.log(`\n## ${title}`);
    for (const row of rows) {
        console.log(`- ${row.session}: S ${fmtCount(row.screen.matched, row.screen.total)} R ${fmtCount(row.rng.matched, row.rng.total)} FS ${row.firstScreen} FR ${row.firstRng} C ${row.cursorOnly}`);
    }
}

function printScoreDelta(title, delta, options = {}) {
    if (!delta?.available) return;
    const limit = options.limit ?? 10;
    console.log(`\n## ${title}`);
    console.log(
        `- ${delta.leftLabel} minus ${delta.rightLabel}: ` +
        `exact ${formatSigned(delta.summary.exact)} sessions ${formatSigned(delta.summary.sessions)} ` +
        `S ${formatSigned(delta.summary.screenMatched)}/${formatSigned(delta.summary.screenTotal)} ` +
        `R ${formatSigned(delta.summary.rngMatched)}/${formatSigned(delta.summary.rngTotal)} ` +
        `C ${formatSigned(delta.summary.cursorOnly)}`
    );
    console.log(`- differing sessions: ${delta.differingSessions}`);
    const rows = delta.rows.slice(0, limit);
    for (const row of rows) {
        if (row.class === 'missing-left' || row.class === 'missing-right') {
            console.log(`- ${row.session}: ${row.class}`);
            continue;
        }
        console.log(
            `- ${row.session}: ${row.class} ` +
            `S ${formatSigned(row.screen.delta.matched)}/${formatSigned(row.screen.delta.total)} ` +
            `R ${formatSigned(row.rng.delta.matched)}/${formatSigned(row.rng.delta.total)} ` +
            `C ${formatSigned(row.cursorOnly.delta)}`
        );
    }
    if (rows.length < delta.rows.length) {
        console.log(`- showing ${rows.length}/${delta.rows.length}; rerun with --full for all rows`);
    }
}

function printHuman(payload) {
    console.log('# Parity State');
    console.log(`- commit: ${payload.git.commit}${payload.git.dirty ? ' dirty' : ''}`);
    if (payload.git.branch || payload.git.upstream) {
        const upstream = payload.git.upstream || 'no upstream';
        const ahead = payload.git.ahead == null ? '?' : payload.git.ahead;
        const behind = payload.git.behind == null ? '?' : payload.git.behind;
        console.log(`- branch: ${payload.git.branch || 'unknown'} -> ${upstream} (ahead ${ahead}, behind ${behind})`);
    }
    if (payload.git.dirty) console.log(`- dirty files: ${payload.git.dirtyFiles}`);
    console.log(`- generated: ${payload.generatedAt}`);
    printCorpus('Checked-In Public Corpus', payload.localCorpus);
    printCorpus('Cached Hosted Public Corpus', payload.liveCorpus);
    console.log('\n## Public Corpus Comparison');
    console.log(`- class: ${payload.corpusComparison.class}`);
    console.log(`- reason: ${payload.corpusComparison.reason}`);
    if (payload.liveFingerprint?.metadata?.fetchedAt) {
        console.log(`- live cache fetched: ${payload.liveFingerprint.metadata.fetchedAt}`);
    }
    const drift = payload.corpusComparison;
    if (drift.changed?.length || drift.added?.length || drift.removed?.length || drift.missing?.length) {
        console.log(`- changed=${drift.changed.length} added=${drift.added.length} removed=${drift.removed.length} missing=${drift.missing.length}`);
    }
    printScoreDelta('Local Vs Hosted Score Delta', payload.localVsLiveDelta, {
        limit: payload.options.full ? Number.POSITIVE_INFINITY : 10,
    });

    console.log('\n## Sentinel');
    console.log(`- strict: ${payload.sentinel.ok ? 'ok' : 'regression'} ${summarizeLine(payload.sentinel.summary)}`);

    console.log('\n## Leaderboard');
    if (payload.leaderboard?.skipped) {
        console.log(`- skipped: ${payload.leaderboard.reason}`);
    } else {
        console.log(`- class: ${payload.leaderboard.class}`);
        console.log(`- reason: ${payload.leaderboard.reason}`);
        if (payload.leaderboard.url) console.log(`- source: ${payload.leaderboard.url}`);
        if (payload.leaderboardSnapshot?.saved) console.log(`- saved snapshot: ${payload.leaderboardSnapshot.saved}`);
        if (payload.leaderboardSnapshot?.historySaved) console.log(`- saved history snapshot: ${payload.leaderboardSnapshot.historySaved}`);
        if (payload.leaderboardSnapshot?.error) console.log(`- snapshot save failed: ${payload.leaderboardSnapshot.error}`);
        if (payload.leaderboard.team) {
            const team = payload.leaderboard.team;
            console.log(`- team: ${team.name} (${team.fork || 'unknown fork'}), last scored ${team.lastScored || 'unknown'}`);
            if (payload.leaderboard.publicSummary) {
                const pub = payload.leaderboard.publicSummary;
                const rng = pub.rngMatched == null ? 'unknown' : fmtCount(pub.rngMatched, pub.rngTotal);
                console.log(`- public: exact ${pub.exact}/${pub.sessions} S ${fmtCount(pub.screenMatched, pub.screenTotal)} R ${rng}`);
            }
            if (payload.leaderboard.failureSignature?.failed) {
                const sig = payload.leaderboard.failureSignature;
                console.log(`- online failure signature: ${sig.failed} failed public session(s), ${sig.missedScreens} missed screen(s); full RNG ${sig.fullRng}/${sig.failed}, full RNG-steps ${sig.fullRngSteps}/${sig.failed}, full cells ${sig.fullCells}/${sig.failed}, cells-only equals combined ${sig.cellsOnlyEqualsScreen}/${sig.failed}, full cursors ${sig.fullCursors}/${sig.failed}`);
            }
            if (team.heldOut) {
                console.log(`- held-out: points ${fmtCount(team.heldOut.points, team.heldOut.maxPoints)} passing ${fmtCount(team.heldOut.passing, team.heldOut.total)}; private sessions are the cleanliness benchmark`);
            }
            if (payload.leaderboard.history) {
                const history = payload.leaderboard.history;
                const target = history.target
                    ? `local ${history.target.exact}/${history.target.sessions} S ${fmtCount(history.target.screenMatched, history.target.screenTotal)}`
                    : 'local target';
                const volatility = history.volatile
                    ? `; volatile spread S ${formatSigned(history.pointSpread)} passing ${formatSigned(history.passingSpread)}`
                    : '';
                console.log(`- history: last ${history.window}/${history.entries} score(s), comparable ${history.comparable}, passing ${fmtRange(history.passing)}, S ${fmtRange(history.points, `/${history.target?.screenTotal ?? '?'}`)}; ${history.matchingTarget}/${history.comparable} match ${target}${volatility}`);
                if (history.firstTs || history.lastTs) {
                    console.log(`- history window: ${history.firstTs || 'unknown'} -> ${history.lastTs || 'unknown'}`);
                }
            }
            if (payload.leaderboard.motion) {
                const motion = payload.leaderboard.motion;
                const upstream = motion.upstreamHead.name
                    ? `${motion.upstreamHead.name} ${motion.upstreamHead.commit || 'unknown'}`
                    : 'no upstream';
                console.log(`- refs: local ${motion.localHead.commit} at ${motion.localHead.time || 'unknown'}; upstream ${upstream} at ${motion.upstreamHead.time || 'unknown'}`);
                console.log(`- timing: lastScored is ${motion.localHead.lastScoredRelation} local HEAD and ${motion.upstreamHead.lastScoredRelation} upstream HEAD`);
                console.log(`- next: ${motion.nextAction}`);
            }
            if (payload.leaderboard.actions) {
                const actions = payload.leaderboard.actions;
                if (actions.available) {
                    const latest = actions.latest;
                    const compared = actions.compared || actions.latestSuccessful || latest;
                    const comparedLabel = actions.latestSuccessful ? 'latest successful' : 'latest';
                    const latestPrefix = latest.id === compared.id
                        ? `#${latest.number}`
                        : `latest #${latest.number} ${latest.status}/${latest.conclusion || 'unknown'}; ${comparedLabel} #${compared.number}`;
                    const artifact = actions.artifact
                        ? `; artifact ${actions.artifact.name} ${actions.artifact.expired ? 'expired' : 'active'}`
                        : '; artifact unavailable';
                    console.log(`- actions: ${latestPrefix} ${compared.status}/${compared.conclusion || 'unknown'} ${compared.headShaShort || 'unknown'} updated ${compared.updatedAt || 'unknown'}; leaderboard lastScored is ${actions.lastScoredRelation} ${comparedLabel} Actions update${artifact}`);
                } else {
                    console.log(`- actions: unavailable: ${actions.error}`);
                }
            }
            if (payload.leaderboard.cleanRef) {
                const ref = payload.leaderboard.cleanRef;
                if (ref.available) {
                    console.log(`- clean-ref: ${ref.ref} ${ref.commit} at ${ref.commitTime || 'unknown'} -> ${compactScore(ref.summary)}`);
                    console.log(`- clean-ref timing: lastScored is ${ref.lastScoredRelation} clean-ref HEAD; shape ${ref.shapeMatches ? 'matches' : 'differs'}; score ${ref.publicEqual ? 'matches' : 'differs'}`);
                    if (ref.rulesOutLocalAhead && !payload.leaderboard.actions?.leaderboardPredatesLatestRun) {
                        console.log('- clean-ref conclusion: local-ahead timing does not explain this public delta');
                    }
                } else {
                    console.log(`- clean-ref: ${ref.ref || 'unknown'} unavailable: ${ref.error}`);
                }
            }
            printScoreDelta('Local Vs Leaderboard Public Delta', payload.leaderboard.sessionDelta, {
                limit: payload.options.full ? Number.POSITIVE_INFINITY : 10,
            });
            printScoreDelta('Clean Ref Vs Leaderboard Public Delta', payload.leaderboard.cleanRefDelta, {
                limit: payload.options.full ? Number.POSITIVE_INFINITY : 10,
            });
        }
    }

    console.log('\n## Maintenance Signals');
    console.log(`- hack debt: hard=${payload.audits.hackDebt.hard} suspicious=${payload.audits.hackDebt.suspicious}`);
    console.log(`- memory lint: issues=${payload.audits.memory.issues}`);

    if (payload.options.full) {
        printNonExact('Checked-In Non-Exact Sessions', payload.localCorpus, 20);
        printNonExact('Hosted Public Non-Exact Sessions', payload.liveCorpus, 20);
        printNonExact('Sentinel Non-Exact Sessions', payload.sentinel, 20);
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const git = gitState();
    const cleanScoreRef = options.scoreUpstream ? git.upstream : options.scoreRef;
    let liveFetch = null;
    if (options.refreshLive) liveFetch = fetchLiveSessions(options.liveDir);

    const localFingerprint = corpusFingerprint(options.localDir);
    const liveFingerprint = corpusFingerprint(options.liveDir);
    const corpusComparison = compareCorpora(localFingerprint, liveFingerprint);
    const localCorpus = await analyzeCorpus(options.localDir, 'checked-in public');
    const liveCorpus = liveFingerprint.available
        ? await analyzeCorpus(options.liveDir, 'hosted public')
        : { available: false, label: 'hosted public', dir: options.liveDir, error: liveFingerprint.error };
    const localVsLiveDelta = compareCorpusScores(localCorpus, liveCorpus, 'checked-in public', 'hosted public', {
        left: localFingerprint,
        right: liveFingerprint,
    });
    const cleanRefCorpus = cleanScoreRef
        ? scoreRef(cleanScoreRef, { target: options.localDir })
        : options.scoreUpstream
            ? { available: false, ref: 'upstream', error: 'no configured upstream ref' }
            : null;
    const sentinel = await analyzeSentinels();
    const audits = auditSummary();

    const wantLeaderboard = options.leaderboard;
    const leaderboardData = wantLeaderboard
        ? options.leaderboardJson
            ? readLeaderboardSnapshot(options.leaderboardJson, PROJECT_ROOT)
            : await fetchLeaderboard(options.baseUrl)
        : null;
    let actionsState = null;
    if (options.scoreActions) {
        try {
            actionsState = { available: true, ...await fetchActionsState({ branch: git.branch || 'main' }) };
        } catch (err) {
            actionsState = { available: false, error: err.message };
        }
    }
    let leaderboardSnapshot = null;
    if (wantLeaderboard && leaderboardData?.available && (options.saveLeaderboardJson || options.saveLeaderboardHistoryDir)) {
        try {
            leaderboardSnapshot = {};
            if (options.saveLeaderboardJson) {
                leaderboardSnapshot.saved = saveLeaderboardSnapshot(options.saveLeaderboardJson, leaderboardData.data);
            }
            if (options.saveLeaderboardHistoryDir) {
                leaderboardSnapshot.historySaved = saveLeaderboardSnapshot(leaderboardHistoryFile(options.saveLeaderboardHistoryDir, leaderboardData.data), leaderboardData.data);
            }
        } catch (err) {
            leaderboardSnapshot = { error: err.message };
        }
    }
    const leaderboard = wantLeaderboard
        ? classifyLeaderboard({
            leaderboard: leaderboardData,
            teamName: options.team,
            localCorpus,
            liveCorpus,
            corpusComparison,
            git,
            cleanRefCorpus,
            actionsState,
        })
        : { skipped: true, reason: 'use --leaderboard, --team, or --refresh-live to compare online leaderboard data' };

    const payload = {
        generatedAt: new Date().toISOString(),
        options: {
            refreshLive: options.refreshLive,
            full: options.full,
            team: options.team,
            explicitTeam: options.explicitTeam,
            baseUrl: options.baseUrl,
            leaderboardJson: options.leaderboardJson,
            saveLeaderboardJson: options.saveLeaderboardJson,
            saveLeaderboardHistoryDir: options.saveLeaderboardHistoryDir,
            localDir: options.localDir,
            liveDir: options.liveDir,
            scoreRef: cleanScoreRef,
            scoreUpstream: options.scoreUpstream,
            scoreActions: options.scoreActions,
        },
        git,
        liveFetch,
        localFingerprint,
        liveFingerprint,
        corpusComparison,
        localVsLiveDelta,
        cleanRefCorpus,
        actionsState,
        localCorpus,
        liveCorpus,
        sentinel,
        leaderboard,
        leaderboardSnapshot,
        audits,
    };

    if (options.json) console.log(JSON.stringify(payload, null, 2));
    else printHuman(payload);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
