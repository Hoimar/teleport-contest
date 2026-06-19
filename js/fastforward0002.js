// Generated RNG tail for the healer starter session.
// Live init_objects(), init_dungeons(), u_init_misc_rng(), and mklev run before this.
// Source session: seed0002-healer-reflection-drummer.session.json
import { game } from "./gstate.js";
import { rn2, rnd } from "./rng.js";

function play(arr) {
    let last = null;
    for (const c of arr) {
        if (c.f === 'rn2') last = rn2(c.b);
        else if (c.f === 'rnd') last = rnd(c.b);
    }
    return last;
}

export function fastforward_post_mklev(options = {}) {
    const calls = [{"f":"rn2","b":1000},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":11},{"f":"rn2","b":10},{"f":"rn2","b":10},{"f":"rn2","b":1},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":10},{"f":"rn2","b":11},{"f":"rn2","b":10},{"f":"rn2","b":10},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":1},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":2},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":2},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":2},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":2},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":2},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rnd","b":2},{"f":"rn2","b":4},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":5},{"f":"rn2","b":17},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":17},{"f":"rn2","b":2},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":17},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":17},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":6},{"f":"rnd","b":2},{"f":"rn2","b":6},{"f":"rnd","b":2},{"f":"rn2","b":6},{"f":"rnd","b":2},{"f":"rn2","b":6},{"f":"rnd","b":2},{"f":"rn2","b":6},{"f":"rn2","b":25},{"f":"rn2","b":1},{"f":"rnd","b":2},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":100},{"f":"rn2","b":20},{"f":"rn2","b":20},{"f":"rn2","b":20},{"f":"rn2","b":7},{"f":"rn2","b":20},{"f":"rn2","b":20},{"f":"rn2","b":20},{"f":"rn2","b":3},{"f":"rn2","b":2},{"f":"rnd","b":9000},{"f":"rnd","b":30}];
    const played = options.skipUInitRoleInventory ? calls.slice(67) : calls;
    const last = play(played);
    if (played.at(-1)?.f === 'rnd' && played.at(-1)?.b === 30) {
        game.context = game.context || {};
        game.context.seer_turn = last;
    }
}

export function fastforward_post_mklev_after_u_init_role_inventory() {
    fastforward_post_mklev({ skipUInitRoleInventory: true });
}
