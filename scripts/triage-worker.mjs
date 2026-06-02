import { parentPort, workerData } from 'node:worker_threads';

import { analyzeSession } from './triage-lib.mjs';

try {
    const result = await analyzeSession(workerData.sessionRef, workerData.options || {});
    parentPort.postMessage({ result });
} catch (err) {
    parentPort.postMessage({
        error: {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : null,
        },
    });
}
