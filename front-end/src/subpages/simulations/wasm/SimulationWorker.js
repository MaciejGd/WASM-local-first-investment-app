import { SimulationAPI } from "./SimulationAPI";

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
        
        const results = simAPI.runSimulation(stockData, weights, times, sims);
        postMessage(results);
    }
};