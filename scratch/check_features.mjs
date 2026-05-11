import { game } from '../js/gstate.js';
import { newgame } from '../js/allmain.js';
import { pushKeys } from '../js/input.js';
import { initRng } from '../js/rng.js';

initRng(2);
pushKeys('          '); // 10 spaces

async function check() {
    game._seed = 2;
    await newgame();
    console.log("NSINKS:", game.level.flags.nsinks);
    console.log("NFOUNTAINS:", game.level.flags.nfountains);
}

check();
