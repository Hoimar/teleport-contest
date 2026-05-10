import fs from 'fs';

const session = JSON.parse(fs.readFileSync('sessions/seed0002-healer-reflection-drummer.session.json', 'utf8'));
const steps = session.segments[0].steps;
const step12 = steps[12];
const step13 = steps[13];

console.log("STEP 12 SCREEN:");
console.log(step12.screen);
console.log("STEP 12 KEYS:", step12.key);

console.log("\nSTEP 13 SCREEN:");
console.log(step13.screen);
console.log("STEP 13 KEYS:", step13.key);
