#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/finance_api.h"

using namespace finance_api;

template<typename T>
class MonteCarloTests : public MonteCarloSimulator<T> {
public:
    MonteCarloTests(T* buffer, size_t chunk_size, size_t chunks_amount, double* weights): 
                        MonteCarloSimulator<T>(buffer, chunk_size, chunks_amount, weights) {};
    // public test interfaces for private MonteCarloSimulator methods
    vector<vector<double>> m_TransformPriceToReturns() {
        return MonteCarloSimulator<T>::m_TransformPriceToReturns();
    }

    CMatrix<double> m_GenerateRandomSamples() {
        return MonteCarloSimulator<T>::m_GenerateRandomSamples();
    }
};

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorNullptr) {    
    double* buf = nullptr;
    double weights[] = {1, 2, 3};
    CHECK_THROW(MonteCarloSimulator(buf, 2, 2, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorToLowChunksize) {    
    double buf[] = { 1,
                     2,
                     3};
    double weights[] = {1, 2, 3};
    CHECK_THROW(MonteCarloSimulator(buf, 1, 2, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorToLowChunksAmount) {    
    double buf[] = { 1, 2,
                     2, 3,
                     3, 4};
    double weights[] = {1, 2, 3};
    CHECK_THROW(MonteCarloSimulator(buf, 2, 0, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorWeightsNullptr) {    
    double buf[] = {1, 2, 3};
    double* weights = nullptr;
    CHECK_THROW(MonteCarloSimulator(buf, 2, 2, weights), std::invalid_argument);
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
    double weights[] = {1, 2, 3};
    //initialize test api, set seed and generate random samples
    auto test_instance = MonteCarloTests(buf, stock_size, stocks, weights);
    // set random generator with predefined seed
    std::unique_ptr<CRandomGenerator> rand_gen = std::make_unique<CRandomGenerator>();
    rand_gen->SetSeed(seed);
    test_instance.SetRandomGenerator(std::move(rand_gen));

    auto samples = test_instance.m_GenerateRandomSamples();
    // confirm results are correct
    CHECK_EQUAL(samples.cols(), stocks);
    CHECK_EQUAL(samples.rows(), 1);
    for (int i = 0; i < samples.cols(); i++) {
        CHECK_EQUAL_FLOAT(expected_output[i], samples[0][i]);
    }
}

UNIT_TEST(MonteCarloSimulatorTests, TransformPriceToReturnsWorking) {    
    using std::vector;

    int price[] = {1, 12, 35, 
                    41, 22, 11};

    vector<vector<double>> expected_out = {
        {11, 1.91666666667},
        {-0,46341463414, -1}
    };
    double weights[] = {1, 2, 3};
    MonteCarloTests monte_carlo(price, 3, 2, weights);

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

UNIT_TEST(MonteCarloSimulatorTests, WeightsNotOne) {
    int price[] = {1,2,3,4};
    const size_t chunk_size = 1;
    const size_t chunks_amount = 4;
    double weights[chunks_amount] = {0.33, 0.25, 0.25, 0.18};
    CHECK_THROW(MonteCarloSimulator(price, chunk_size, chunks_amount, weights), std::logic_error);
}

UNIT_TEST(MonteCarloSimulatorTests, InitWeights) {
    int price[] = {1,2,3,4};
    const size_t chunk_size = 2;
    const size_t chunks_amount = 4;
    double weights[chunks_amount] = {0.33, 0.25, 0.25, 0.17};
    auto test = MonteCarloSimulator(price, chunk_size, chunks_amount, weights);
    auto weights_mat = test.GetWeights();
    CHECK_EQUAL(weights_mat.rows(), chunks_amount);
    CHECK_EQUAL(weights_mat.cols(), 1);
    for (int i = 0; i < chunks_amount; i++) {
        CHECK_EQUAL(weights_mat[i][0], weights[i]);
    }
}



