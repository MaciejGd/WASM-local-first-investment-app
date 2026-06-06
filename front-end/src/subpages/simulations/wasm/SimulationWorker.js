import { SimulationAPI } from "./SimulationAPI";
import { runSimulations } from "../../../js_sims/minimal_montecarlo.js";

// simulationAPI instance. Initialized via SimulationWorker request
let simAPI = null;
/**
 * WebWorker for running non blocking simulations
 * WebWorker should be sent object in form:
 * type: "INIT" for API initialization, "RUN" for running simulation
 * payload:
 * simulationAPI : simAPIobject
 * stockData: stock data
 * weights: weights of particular stocks
 * times: number of timestamps to be simulated
 * sims: number of simulations to be performed
 */
onmessage = async (e) => {
    const {type, payload} = e.data;

    if (type === "INIT") {
        simAPI = await SimulationAPI.create();
    }
    else if (type === "RUN") {
        console.log("Worker received message from the main script");
        const stockData = payload.stockData;
        const weights = payload.weights;
        const times = payload.times;
        const sims = payload.sims;
        

        // const results = simAPI.runSimulation(stockData, weights, times, sims);
        
        // const results = measureWasm(stockData, weights, times, sims);
        const results = measureJS(stockData, weights, times, sims);

        postMessage(results);
    }
};

function measureWasm(stockData, weights, times, sims) {
    console.log("WASM simulation starting");
    var res = [];
    for (var i = 0; i < 10; i++) {
        const start = performance.now();
        const results = simAPI.runSimulation(stockData, weights, times, sims);
        const end = performance.now();
        console.log(`WASM simulation took ${end - start} milliseconds.`);
        res.push(end - start);
    }
    console.log('Run simulations 10 times, results: ', res);
    print_benchmark_tests(res);
    return results;
}

function measureJS(stockData, weights, times, sims) {
    console.log("Running JS simulation...");
    var res = [];
    for (var i = 0; i < 10; i++) {
        const start = performance.now();
        var results = runSimulations(stockData, weights, times, sims);
        const end = performance.now();
        console.log(`JS simulation took ${end - start} milliseconds.`);
        res.push(end - start);
    }
    console.log('Run simulations 10 times, results: ', res);
    print_benchmark_tests(res);
    return results;
}

function print_benchmark_tests(res) {
    var result_str = "";
    for (var i = 0; i < res.length; i++) {
        result_str += res[i] + "\n";
    }
    console.log(result_str);
}