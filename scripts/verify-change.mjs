#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import {
    analyzeSessionIsolated,
    DEFAULT_SENTINEL_SUITE,
    isExactSession,
    scoredScreenMatched,
    summarizeSessionResults,
} from './triage-lib.mjs';
import { auditHackDebt, renderHackDebt } from './hack-debt-audit.mjs';
import { collectMemoryIssues, renderMemoryLint } from './memory-lint.mjs';

function parseArgs(argv) {
    const out = { target: null, full: false, json: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--target') out.target = argv[++i] || null;
        else if (arg.startsWith('--target=')) out.target = arg.slice(9);
        else if (arg === '--full') out.full = true;
        else if (arg === '--json') out.json = true;
        else if (!arg.startsWith('--') && !out.target) out.target = arg;
        else throw new Error(`unknown argument ${arg}`);
    }
    return out;
}

function short(result) {
    const fs = result.firstScreenMismatch;
    const fr = result.firstRngMismatch;
    return {
        session: result.session,
        screens: `${scoredScreenMatched(result)}/${result.metrics.screens.total}`,
        cells: `${result.metrics.screens.matched}/${result.metrics.screens.total}`,
        rng: `${result.metrics.rngCalls.matched}/${result.metrics.rngCalls.total}`,
        firstScreen: fs ? `${fs.index}:${fs.mismatchClass}:${fs.screen.surface}:${fs.keyDisplay}` : '-',
        firstRng: fr ? `${fr.index}:${fr.expected ?? 'null'}=>${fr.actual ?? 'null'}` : '-',
        cursorOnly: result.metrics.cursorOnly.count,
        exact: isExactSession(result),
        error: result.error,
        warnings: result.warnings,
    };
}

function hackCounts(findings) {
    return {
        hard: findings.filter((f) => f.level === 'hard').length,
        suspicious: findings.filter((f) => f.level === 'suspicious').length,
    };
}

function printRows(title, rows) {
    console.log(`\n## ${title}`);
    for (const row of rows) console.log(row);
}

function formatSession(row) {
    return `- ${row.session}: S ${row.screens} R ${row.rng} FS ${row.firstScreen} FR ${row.firstRng} C ${row.cursorOnly}${row.exact ? ' OK' : ''}`;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const target = options.target ? short(await analyzeSessionIsolated(options.target)) : null;
    const sentinels = [];
    for (const ref of DEFAULT_SENTINEL_SUITE) {
        sentinels.push(await analyzeSessionIsolated(ref, { sampleLimit: 3, cursorStepLimit: 6 }));
    }
    const sentinelShort = sentinels.map(short);
    const total = summarizeSessionResults(sentinels);
    const sentinelOk = sentinels.every(isExactSession);
    const hackFindings = auditHackDebt();
    const hackDebt = hackCounts(hackFindings);
    const memoryIssues = collectMemoryIssues();
    const hack = {
        status: hackFindings.some((f) => f.level === 'hard') ? 1 : 0,
        stdout: renderHackDebt(hackFindings),
    };
    const memory = {
        status: 0,
        stdout: renderMemoryLint(memoryIssues),
    };
    let full = null;
    if (options.full) {
        const refs = JSON.parse(readFileSync('sessions/manifest.json', 'utf8'));
        const fullResults = [];
        for (const ref of refs) fullResults.push(await analyzeSessionIsolated(ref, { sampleLimit: 1, cursorStepLimit: 3 }));
        const fullTotals = summarizeSessionResults(fullResults);
        full = {
            status: 0,
            total: {
                screens: `${fullTotals.screenMatched}/${fullTotals.screenTotal}`,
                rng: `${fullTotals.rngMatched}/${fullTotals.rngTotal}`,
            },
        };
    }

    const payload = {
        target,
        sentinel: {
            sessions: sentinelShort,
            total: {
                screens: `${total.screenMatched}/${total.screenTotal}`,
                rng: `${total.rngMatched}/${total.rngTotal}`,
                exact: `${total.exact}/${total.sessions}`,
                cursorOnly: total.cursorOnly,
            },
            status: sentinelOk ? 0 : 1,
        },
        audits: {
            hackDebtStatus: hack.status,
            hackDebt,
            memoryLintStatus: memory.status,
            memoryIssues: memoryIssues.length,
        },
        full: full?.total ?? null,
        fullStatus: full ? full.status : null,
    };

    if (options.json) {
        console.log(JSON.stringify(payload, null, 2));
        return;
    }

    console.log('# Verification Summary');
    printRows('Target', target
        ? [formatSession(target)]
        : ['- no target supplied']);
    printRows('Sentinels', [
        `- strict: ${sentinelOk ? 'ok' : 'regression'} exact ${payload.sentinel.total.exact} S ${payload.sentinel.total.screens} R ${payload.sentinel.total.rng} C ${payload.sentinel.total.cursorOnly}`,
        ...sentinelShort.map(formatSession),
    ]);
    printRows('Harness Checks', [
        `- hack debt: hard=${hackDebt.hard} suspicious=${hackDebt.suspicious} status=${hack.status}`,
        `- memory lint: issues=${memoryIssues.length} status=${memory.status}`,
        ...(full ? [`- full suite: S ${full.total.screens} R ${full.total.rng}`] : []),
    ]);
    printRows('Human Report Checklist', [
        '- compare target numbers to the pre-change baseline',
        '- fix or explicitly classify any sentinel regression before handoff',
        '- name the subsystem truth or harness rule that changed',
        '- commit the coherent change after verification when truth changed',
    ]);
    if (hack.stdout && hack.status !== 0) printRows('Blocking Hack Debt', hack.stdout.split('\n').slice(0, 12));
    if (memory.stdout && memoryIssues.length) printRows('Memory Lint Details', memory.stdout.split('\n').slice(0, 12));

    if (sentinelOk === false || hack.status !== 0 || memory.status !== 0 || (full && full.status !== 0)) process.exit(1);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
