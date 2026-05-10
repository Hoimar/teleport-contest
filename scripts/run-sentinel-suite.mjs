#!/usr/bin/env node

import { analyzeSession, DEFAULT_SENTINEL_SUITE } from './triage-lib.mjs';

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
    const refs = args.filter((arg) => !arg.startsWith('--'));
    const suite = refs.length ? refs : DEFAULT_SENTINEL_SUITE;

    const results = [];
    for (const ref of suite) {
        results.push(await analyzeSession(ref, { sampleLimit: 3, cursorStepLimit: 6 }));
    }

    if (jsonOnly) {
        console.log(JSON.stringify({ suite, results }, null, 2));
        return;
    }

    console.log(`sentinel ${suite.length}`);
    for (const result of results) {
        const session = result.session.replace(/\.session\.json$/, '');
        const line =
            `${pad(session, 40)} ` +
            `S ${pad(`${result.metrics.screens.matched}/${result.metrics.screens.total}`, 9)} ` +
            `R ${pad(`${result.metrics.rngCalls.matched}/${result.metrics.rngCalls.total}`, 13)} ` +
            `FS ${pad(shortScreenHead(result), 18)} ` +
            `FR ${pad(shortRngHead(result), 6)} ` +
            `C ${result.metrics.cursorOnly.count}`;
        console.log(line);
        if (result.error) console.log(`  error ${result.error}`);
        if (result.warnings.length) console.log(`  warn ${result.warnings.join(' | ')}`);
    }

    const totals = results.reduce((acc, result) => {
        acc.screenMatched += result.metrics.screens.matched;
        acc.screenTotal += result.metrics.screens.total;
        acc.rngMatched += result.metrics.rngCalls.matched;
        acc.rngTotal += result.metrics.rngCalls.total;
        return acc;
    }, { screenMatched: 0, screenTotal: 0, rngMatched: 0, rngTotal: 0 });

    console.log(
        `total S ${totals.screenMatched}/${totals.screenTotal} ` +
        `R ${totals.rngMatched}/${totals.rngTotal}`
    );
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
