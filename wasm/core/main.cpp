#include <iostream>
#include "./inc/monte_carlo_sim.h"

typedef long int i32;
typedef long long i64;
typedef double f64;

extern "C" {
    void runSimulations(f64* stocks, f64* weights, i32 stocks_amount, i32 stock_size, 
                        i32 time, i32 sims, f64* results) {
        using namespace finance_api;
        MonteCarloSimulator<f64> mont = MonteCarloSimulator<f64>(stocks, stocks_amount, stock_size, weights);
        static_cast<void>(mont.RunSimulation(time, sims, results));
    }

    void runMultithreadingSimulations(f64* stocks, f64* weights, i32 stocks_amount, i32 stock_size, 
                        i32 time, i32 sims, f64* results) {
        using namespace finance_api;
        MonteCarloSimulator<f64> mont = MonteCarloSimulator<f64>(stocks, stocks_amount, stock_size, weights);
        static_cast<void>(mont.RunSimulationMultithreading(time, sims, results));
    }
};