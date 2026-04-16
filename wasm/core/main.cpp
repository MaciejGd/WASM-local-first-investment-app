#include <iostream>
#include "./inc/monte_carlo_sim.h"

typedef long int i32;
typedef long long i64;
typedef double f64;
// TODO add last error method of preserving last failed error message
static char* last_message = "";


extern "C" {
    f64* alloc_f64(i32 size) {
        return new f64[size];
    }

    void dealloc_f64(f64* ptr) {
        delete[] ptr;
    }

    void runSimulations(f64* stocks, f64* weights, i32 stocks_amount, i32 stock_size, 
                        i32 time, i32 sims, f64* results) {
        using namespace finance_api;
        MonteCarloSimulator<f64> mont = MonteCarloSimulator<f64>(stocks, stocks_amount, stock_size, weights);
        static_cast<void>(mont.RunSimulation(time, sims, results));
    }

    void getLastError() {

    }
};