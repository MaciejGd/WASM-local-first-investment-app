export class SimulationAPI {
    constructor(module) {
        this.module = module;
    }
    // how many days back should we look at
    static days_back = 300;
    static results_length = 29;

    /**
     * Create an instance of SimulationAPI
     * @returns 
     */
    static async create() {
        // import and unpack create module function
        const { default : createModule } = await import("./wasm_module.js");
        const module = await createModule();
        return new SimulationAPI(module);
    }
    
    /**
     * Private method for transforming prices as return form Finance API to format that can be used
     * by SimulationAPI
     * @param {Array} stock_prices array of stock prices in form [{prices: {date:price}}]
     * @returns Float64Array created from passed stock prices
     */
    #createStockArray(stock_prices) {
        const stocks_amount = stock_prices.length;
        // fill last indexes of each stock price
        let idxs = [];
        stock_prices.forEach(element => {
            let l = Object.values(element.prices).length;
            idxs.push(l-1);
        });

        var prices = new Float64Array(SimulationAPI.days_back * stocks_amount);
        // TODO - data should be probably aligned, so that we check if there are not empty data frames
        for (var i = 0; i < stocks_amount; i++) {
            var curr_prices = Object.values(stock_prices[i].prices);
            for (var j = 1; j <= SimulationAPI.days_back; j++, idxs[i]--) {
                prices[(i + 1) * SimulationAPI.days_back - j] = curr_prices[idxs[i]];
            }
        }
        return prices;
    }

    /**
     * Count weights Float64Array. Should be supplied with list of money spent on particular stock
     * @param {Array} stock_weights array of amount of stock invested 
     * @returns Array of weights of particular stock
     */
    #createWeightsArray(stock_weights) {
        var sum = stock_weights.reduce((a, b) => { return a + b}, 0);
        var weights = new Float64Array(stock_weights.length);
        var new_weights = stock_weights.map((el) => { return el / sum });
        weights.set(new_weights);
        return weights;
    }

    /**
     * Run MonteCarlo simulations
     * @param {Array} stock_prices list of objects {prices: {data:price}}
     * @param {Array} stock_weights list of weights of particular inverstments
     * @param {number} time number of simulated timepoints
     * @param {number} sims number of simulations to be run
     * @returns 
     */
    testSimulation(stock_prices, stock_weights, time, sims) {
        if (this.module === undefined) {
            return null;
        }
        if (stock_weights.length == 0) {
            console.error("Specify assets, so that application can run simulations!");
            return null;
        }
        var exit_code = true;
        // init arguments for the WASM module
        const stocks = this.#createStockArray(stock_prices);
        const weights = this.#createWeightsArray(stock_weights);
        const STOCKS_AMOUNT = weights.length;
        const RESULTS_AMOUNT = SimulationAPI.results_length;
        var RESULTS = new Float64Array(RESULTS_AMOUNT);
        const STOCK_SIZE = SimulationAPI.days_back; // amount of stock prices samples
        // pointers to arrays needed for simulations
        var res_ptr = null;
        var stocks_ptr = null;
        var weights_ptr = null;
        try {
            // allocate memory for simulation on heap
            res_ptr = this.module._malloc(RESULTS.length * RESULTS.BYTES_PER_ELEMENT); // 8 bytes per each result
            stocks_ptr = this.module._malloc(stocks.length * stocks.BYTES_PER_ELEMENT);
            weights_ptr = this.module._malloc(weights.length * weights.BYTES_PER_ELEMENT);
            // set memory for arrays
            this.module.HEAPF64.set(stocks, stocks_ptr / stocks.BYTES_PER_ELEMENT); // set works in float units, not in bytes so need to divide by 8
            this.module.HEAPF64.set(weights, weights_ptr / weights.BYTES_PER_ELEMENT);            
            // run main function utilizing buffers
            this.module._runSimulations(stocks_ptr, weights_ptr,
                                        STOCKS_AMOUNT, STOCK_SIZE,
                                        time, sims,
                                        res_ptr);
            // fill results array with simulation results
            RESULTS = this.module.HEAPF64.subarray(res_ptr / RESULTS.BYTES_PER_ELEMENT, 
                                            res_ptr / RESULTS.BYTES_PER_ELEMENT + RESULTS.length).slice();
        }
        catch (error) {
            console.error(error);
            exit_code = false;
        }
        finally {
            if (res_ptr != null)        this.module._free(res_ptr);
            if (stocks_ptr != null)     this.module._free(stocks_ptr);
            if (weights_ptr != null)    this.module._free(weights_ptr);    
        }        
        console.log("Results: ", RESULTS);
        return RESULTS;
    }

}
