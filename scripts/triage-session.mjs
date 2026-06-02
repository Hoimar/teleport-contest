#!/usr/bin/env node

import { analyzeSession } from './triage-lib.mjs';

function formatSample(sample) {
    const exp = `${JSON.stringify(sample.expected.ch)}/${sample.expected.color}`;
    const act = `${JSON.stringify(sample.actual.ch)}/${sample.actual.color}`;
    return `[${sample.row},${sample.col}] ${sample.kind} ${exp} -> ${act}`;
}

async function main() {
    const options = {
        jsonOnly: false,
        sampleLimit: undefined,
        cursorStepLimit: undefined,
        refs: [],
    };
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--json') {
            options.jsonOnly = true;
        } else if (arg === '--sample-limit') {
            options.sampleLimit = Number(args[++i]);
        } else if (arg.startsWith('--sample-limit=')) {
            options.sampleLimit = Number(arg.slice('--sample-limit='.length));
        } else if (arg === '--cursor-step-limit') {
            options.cursorStepLimit = Number(args[++i]);
        } else if (arg.startsWith('--cursor-step-limit=')) {
            options.cursorStepLimit = Number(arg.slice('--cursor-step-limit='.length));
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown option ${arg}`);
        } else {
            options.refs.push(arg);
        }
    }
    if (options.refs.length !== 1) {
        console.error('Usage: node scripts/triage-session.mjs [--json] [--sample-limit <n>] [--cursor-step-limit <n>] <session-ref>');
        process.exit(2);
    }

    const result = await analyzeSession(options.refs[0], {
        sampleLimit: Number.isFinite(options.sampleLimit) ? options.sampleLimit : undefined,
        cursorStepLimit: Number.isFinite(options.cursorStepLimit) ? options.cursorStepLimit : undefined,
    });
    if (options.jsonOnly) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    const firstScreen = result.firstScreenMismatch;
    const firstRng = result.firstRngMismatch;
    const firstCursor = result.firstCursorOnlyMismatch;
    const screenHead = firstScreen
        ? `${firstScreen.index}:${firstScreen.mismatchClass}:${firstScreen.screen.surface}:${firstScreen.keyDisplay}`
        : '-';
    const rngHead = firstRng
        ? `${firstRng.index}:${firstRng.expected ?? 'null'}=>${firstRng.actual ?? 'null'}`
        : '-';

    console.log(
        `${result.session} ` +
        `S ${result.metrics.screens.matched}/${result.metrics.screens.total} ` +
        `R ${result.metrics.rngCalls.matched}/${result.metrics.rngCalls.total} ` +
        `FS ${screenHead} FR ${rngHead} ` +
        `C ${result.metrics.cursorOnly.count}`
    );

    if (result.error) console.log(`error ${result.error}`);
    if (result.warnings.length) console.log(`warn ${result.warnings.join(' | ')}`);

    if (firstScreen) {
        console.log(
            `screen rows=${firstScreen.rowSummary} ` +
            `char=${firstScreen.screen.charDiffs} attr=${firstScreen.screen.attrDiffs} ` +
            `cursor=${firstScreen.cursor.equal ? 'ok' : 'mismatch'}`
        );
        if (firstScreen.screen.message.expected !== firstScreen.screen.message.actual) {
            console.log(
                `msg exp=${JSON.stringify(firstScreen.screen.message.expected)} ` +
                `act=${JSON.stringify(firstScreen.screen.message.actual)}`
            );
        }
        if (firstScreen.screen.samples.length) {
            console.log(`cells ${firstScreen.screen.samples.map(formatSample).join(' ; ')}`);
        }
        if (!firstScreen.cursor.equal) {
            console.log(
                `cursor exp=${JSON.stringify(firstScreen.cursor.expected)} ` +
                `act=${JSON.stringify(firstScreen.cursor.actual)}`
            );
        }
    }

    if (result.metrics.cursorOnly.count) {
        const head = firstCursor
            ? `${firstCursor.index}:${firstCursor.keyDisplay}`
            : '-';
        console.log(
            `cursor_only count=${result.metrics.cursorOnly.count} ` +
            `first=${head} steps=${result.metrics.cursorOnly.steps.join(',')}`
        );
    }
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
