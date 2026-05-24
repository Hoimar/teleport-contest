#!/usr/bin/env node

import {
    analyzeSession,
    DEFAULT_SENTINEL_SUITE,
    isExactSession,
    summarizeSessionResults,
} from './triage-lib.mjs';

function pad(text, width) {
    return String(text).padEnd(width, ' ');
}

function shortScreenHead(result) {
    const first = result.firstScreenMismatch;
    if (!first) return '-';
    return `${first.index}:${first.mismatchClass}:${first.keyDisplay}`;
}

function shortRngHead(result) {
    const first = result.firstRngMismatch;
    if (!first) return '-';
    return String(first.index);
}

async function main() {
    const args = process.argv.slice(2);
    const jsonOnly = args.includes('--json');
    const strict = args.includes('--strict');
    const refs = args.filter((arg) => !arg.startsWith('--'));
    const suite = refs.length ? refs : DEFAULT_SENTINEL_SUITE;

    const results = [];
    for (const ref of suite) {
        results.push(await analyzeSession(ref, { sampleLimit: 3, cursorStepLimit: 6 }));
    }
    const summary = summarizeSessionResults(results);
    const ok = results.every(isExactSession);

    if (jsonOnly) {
        console.log(JSON.stringify({ suite, strict, ok, summary, results }, null, 2));
        return;
    }

    console.log(`sentinel ${suite.length}${strict ? ' strict' : ''}`);
    for (const result of results) {
        const session = result.session.replace(/\.session\.json$/, '');
        const screenMatched = result.metrics.scoredScreens.matched;
        const line =
            `${pad(session, 40)} ` +
            `S ${pad(`${screenMatched}/${result.metrics.scoredScreens.total}`, 9)} ` +
            `R ${pad(`${result.metrics.rngCalls.matched}/${result.metrics.rngCalls.total}`, 13)} ` +
            `FS ${pad(shortScreenHead(result), 18)} ` +
            `FR ${pad(shortRngHead(result), 6)} ` +
            `C ${result.metrics.cursorOnly.count} ` +
            `${isExactSession(result) ? 'OK' : 'FAIL'}`;
        console.log(line);
        if (result.error) console.log(`  error ${result.error}`);
        if (result.warnings.length) console.log(`  warn ${result.warnings.join(' | ')}`);
    }

    console.log(
        `total S ${summary.screenMatched}/${summary.screenTotal} ` +
        `R ${summary.rngMatched}/${summary.rngTotal} ` +
        `exact ${summary.exact}/${summary.sessions}`
    );

    if (strict && !ok) process.exit(1);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
