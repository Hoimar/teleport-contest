import { game } from '../js/gstate.js';
import { newgame, moveloop_core } from '../js/allmain.js';
import { set_nhgetch_queue } from '../js/input.js';
import { docrt } from '../js/display.js';

async function run() {
    game._seed = 2;
    // Step 0 to 12 are moves. Turn 14 is Step 13.
    // David starts with 10 turns of interaction? No.
    // The keys for Seed 2 are:
    // ... wait, I'll need the keys.
    // I'll extract them from ff0002.js if they were there, but they aren't.
    // I'll assume standard movement keys.
}
run();
