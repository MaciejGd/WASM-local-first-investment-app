#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/finance_api.h"

using namespace finance_api;

template<typename T>
class MonteCarloTests : public MonteCarloSimulator<T> {
public:
    MonteCarloTests(T* buffer, size_t chunk_size, size_t chunks_amount): 
                        MonteCarloSimulator<T>(buffer, chunk_size, chunks_amount) {};
    // public test interfaces for private MonteCarloSimulator methods
    vector<vector<double>> m_TransformPriceToReturns() {
        return MonteCarloSimulator<T>::m_TransformPriceToReturns();
    }

    CMatrix<double> m_GenerateRandomSamples() {
        return MonteCarloSimulator<T>::m_GenerateRandomSamples();
    }

    double m_GenerateRandom() {
        return MonteCarloSimulator<T>::m_GenerateRandom();
    }
    // we should set seed for underlying MonteCarloSimulatorObject
    void SetSeed(size_t seed) {
        this->m_gen.seed(seed);
    }
};

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorNullptr) {    
    double* buf = nullptr;
    CHECK_THROW(MonteCarloSimulator(buf, 2, 2), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorToLowChunksize) {    
    double buf[] = { 1,
                     2,
                     3};
    CHECK_THROW(MonteCarloSimulator(buf, 1, 2), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorToLowChunksAmount) {    
    double buf[] = { 1, 2,
                     2, 3,
                     3, 4};
    CHECK_THROW(MonteCarloSimulator(buf, 2, 0), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, GenerateRandomDouble) {
    double buf[] = { 1 };
    size_t stock_size = 2;
    size_t stocks = 4;
    // compare output we values expected for below seed
    size_t seed = 45;
    double expected_output = 0.30453643924300827;
    //initialize test api, set seed and generate random samples
    auto test_instance = MonteCarloTests(buf, stock_size, stocks);
    test_instance.SetSeed(seed);
    auto samples = test_instance.m_GenerateRandom();
    // confirm results are correct
    CHECK_EQUAL(samples, expected_output);
    
}

UNIT_TEST(MonteCarloSimulatorTests, GenerateRandomSamples) {    
    double buf[] = { 1 };
    size_t stock_size = 2;
    size_t stocks = 4;
    // compare output we values expected for below seed
    size_t seed = 45;
    std::vector<double> expected_output = {-0.5113973095176207,
                                            0.4440026648946756,
                                            -0.20153917455817283,
                                            1.7196552083405074};
    //initialize test api, set seed and generate random samples
    auto test_instance = MonteCarloTests(buf, stock_size, stocks);
    test_instance.SetSeed(seed);
    auto samples = test_instance.m_GenerateRandomSamples();
    // confirm results are correct
    CHECK_EQUAL(samples.rows(), stocks);
    CHECK_EQUAL(samples.cols(), 1);
    for (int i = 0; i < samples.rows(); i++) {
        CHECK_EQUAL_FLOAT(expected_output[i], samples[i][0]);
    }
}

UNIT_TEST(FinanceApi, TransformPriceToReturnsWorking) {    
    using std::vector;

    int price[] = {1, 12, 35, 
                    41, 22, 11};

    vector<vector<double>> expected_out = {
        {11, 1.91666666667},
        {-0,46341463414, -1}
    };

    MonteCarloTests monte_carlo(price, 3, 2);

    auto output = monte_carlo.m_TransformPriceToReturns();
    CHECK_EQUAL(output.size(), expected_out.size());    
    for (int i = 0; i < output.size(); i++) {
        auto& row = output[i];
        auto& expected_row = expected_out[i];
        CHECK_EQUAL(row.size(), expected_row.size());
        for (int j = 0; j < row.size(); j++) {
            CHECK_EQUAL_FLOAT(row[j], expected_row[j]);
        }
    }
}




