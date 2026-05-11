import { game } from '../js/gstate.js';
import { mklev } from '../js/mklev.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';
import { NethackGame } from '../js/jsmain.js';

async function test() {
    const nh = new NethackGame({ seed: 2 });
    const g = game;
    g.u = { ux: 0, uy: 0, ux0: 0, uy0: 0 };
    g.moves = 1;
    g._seed = 2;
    g.urole = { name: { m: 'Rambler', f: 'Rambler' } };
    g.urace = { adj: 'human' };
    initRng(2);
    enableRngLog();
    
    await mklev();
    console.log(getRngLog().join('\n'));
    console.log('Sinks:', game.level?.flags?.nsinks || 0);
}
test();
