import { runSimulation, TestRandomGenerator } from "./minimal_montecarlo.js";

const prices = [
    [7, 4, 5, 1, 2],
    [1, 2, 5, 4, 7],
    [10, 9, 5, 7, 4],
];

const weights = [0.5, 0.25, 0.25];
const time = 5;
const sims = 20;

const expectedResults = [
    -0.0954805060374801, 0.03668832290704804, 0.18820470642450823, 0.32892596324010703, 1.4004578802956584,
    2.4679858821746303, 3.713374615272557, 5.052605659459024, 6.184586353453597,
    -0.3919309424359614, -0.2878297492506418, -0.2522299061951612, -0.19379420054502533,
    -0.17375368115258444, 0, 0, 0, 0,
    0.03668832290704804, 0.13788667070476263, 0.32232207972891425, 0.32892596324010703,
    1.4004578802956584, 2.7574889736371064, 3.713374615272557, 5.052605659459024,
    6.184586353453597, -0.2923375735491905, -0.49237985, 0.2473031, -0.04726082,
];

const generator = new TestRandomGenerator();
const result = runSimulation({
    priceSeries: prices,
    weights,
    time,
    sims,
    randomSampleProvider: size => generator.next(size),
});

const actual = result.buffer;

function nearlyEqual(a, b, eps = 1e-8) {
    return Math.abs(a - b) <= eps || Math.abs(a - b) <= Math.abs(b) * eps;
}

let passed = true;
for (let i = 0; i < expectedResults.length; i++) {
    if (!nearlyEqual(actual[i], expectedResults[i], 1e-8)) {
        console.error(`Mismatch at index ${i}: expected ${expectedResults[i]}, got ${actual[i]}`);
        passed = false;
    }
}

if (actual.length !== expectedResults.length) {
    console.error(`Buffer length mismatch: expected ${expectedResults.length}, got ${actual.length}`);
    passed = false;
}

if (passed) {
    console.log("RunSimulationValid test passed: JS output matches the C++ expected buffer.");
} else {
    console.error("RunSimulationValid test failed.");    
}

console.log("Actual buffer:", actual);
