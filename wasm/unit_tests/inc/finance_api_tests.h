#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/monte_carlo_sim.h"

using namespace finance_api;

template<typename T>
class MonteCarloTests : public MonteCarloSimulator<T> {
public:
    MonteCarloTests(T* buffer, size_t chunks_amount, size_t chunk_size, double* weights): 
                        MonteCarloSimulator<T>(buffer, chunks_amount, chunk_size, weights) {};
    // public test interfaces for private MonteCarloSimulator methods
    CMatrix<double> m_TransformPriceToReturns() {
        return MonteCarloSimulator<T>::m_TransformPriceToReturns();
    }

    CMatrix<double> m_InitWeightMatrix(double* weights) {
        return MonteCarloSimulator<T>::m_InitWeightMatrix();
    }
};


class TestRandomGenerator : public IRandomGenerator {
    // vector of example random values
    std::vector<std::vector<double>> data = {
        {-0.19, -0.01, -1.37},
        {0.02, 0.57, 2.14},
        {0.45, -0.79, 0.41},
        {-0.38, 0.97, -1.59},
        {0.61, 0.09, 0.10},

        {0.26, 1.45, -1.56},
        {0.46, -0.92, -0.56},
        {0.39, -1.07, -0.17},
        {-1.30, -0.08, 0.31},
        {-0.03, 1.87, 0.37},

        {0.27, 0.01, -1.63},
        {0.04, 0.07, 0.66},
        {-0.37, -0.12, 0.86},
        {-0.43, -0.15, -1.20},
        {2.73, 0.52, 1.36},

        {0.98, -1.19, 0.07},
        {1.02, 1.71, -1.41},
        {-2.36, 1.44, -0.62},
        {0.16, 1.17, 1.98},
        {-0.11, -0.37, 0.09},

        {0.22, 1.09, 0.27},
        {-0.47, 0.56, -0.80},
        {-0.32, -0.48, 0.40},
        {-1.15, -0.19, 0.17},
        {3.19, -0.06, -0.12}
    };
    int vec_cnt = 0; // counter to keep track of already used values
public:
    TestRandomGenerator(): IRandomGenerator() {};

    linalg::primitives::CMatrix<double> GenerateRandomSamples(size_t size) override {
        if (vec_cnt > data.size()) {
            throw std::logic_error("vector count outside of the bounds");
        }
        auto curr_vec = data[vec_cnt++];
        linalg::primitives::CMatrix<double> mat(size, 1);
        for (int i = 0; i < 3; i++) {
            mat[i][0] = curr_vec[i];
        }

        return mat;
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
    CHECK_THROW(MonteCarloSimulator(buf, 2, 1, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorToLowChunksAmount) {
    double buf[] = { 1, 2,
                     2, 3,
                     3, 4};
    double weights[] = {1, 2, 3};
    CHECK_THROW(MonteCarloSimulator(buf, 0, 2, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, MonteCarloSimulatorWeightsNullptr) {    
    double buf[] = {1, 2, 3};
    double* weights = nullptr;
    CHECK_THROW(MonteCarloSimulator(buf, 2, 2, weights), std::invalid_argument);
}

UNIT_TEST(MonteCarloSimulatorTests, TransformPriceToReturnsWorking) {    
    using std::vector;

    int price[] = {1, 12, 35, 
                    41, 22, 11};

    std::vector<std::vector<double>> vec{
        {11, 1.9166666666666667},
        {-0.46341463414634149, -0.5}
    };
    CMatrix<double> expected_out(vec);
    double weights[] = {1, 2, 3};
    MonteCarloTests monte_carlo(price, 2, 3, weights);

    auto output = monte_carlo.m_TransformPriceToReturns();
    CHECK_EQUAL(output, expected_out);
}

UNIT_TEST(MonteCarloSimulatorTests, WeightsNotOne) {
    int price[] = {1,2,3,4};
    const size_t chunk_size = 1;
    const size_t chunks_amount = 4;
    double weights[chunks_amount] = {0.33, 0.25, 0.25, 0.18};
    CHECK_THROW(MonteCarloSimulator(price, chunks_amount, chunk_size, weights), std::logic_error);
}

UNIT_TEST(MonteCarloSimulatorTests, InitWeights) {
    int price[] = {1,2,3,4};
    const size_t chunk_size = 2;
    const size_t chunks_amount = 4;
    double weights[chunks_amount] = {0.33, 0.25, 0.25, 0.17};
    auto test = MonteCarloSimulator(price, chunks_amount, chunk_size, weights);
    auto weights_mat = test.GetWeights();
    CHECK_EQUAL(weights_mat.cols(), chunks_amount);
    CHECK_EQUAL(weights_mat.rows(), 1);
    for (int i = 0; i < chunks_amount; i++) {
        CHECK_EQUAL(weights_mat[0][i], weights[i]);
    }
}


UNIT_TEST(MonteCarloSimulator, Simulation) {
    int price[] = {1,4,2,1,8,  
                    1,2,2,4,4,
                    1,3,5,7,8};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.33, 0.25, 0.42};

    std::vector<std::vector<double>> expected_results = 
            {{0, 0.59918167, 2.62726198, 4.18429212, 4.83468066, 6.76982304},
            {0, 1.52283082, 2.76996008, 4.00217519, 3.83640938, 5.73145857},
            {0, 1.0382252,  2.49907251, 3.50264135, 3.83981105, 8.61444332},
            {0, 1.91158495, 4.40084064, 3.30234411, 5.63701222, 6.62388375},
            {0, 1.8843095,  2.52651108, 3.33446232, 3.25755661, 7.9234451}};

    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    auto outputs = mont.Simulate(5, 5);
    // validate output
    for (int i = 0; i < outputs.rows(); i++) {
        for (int j = 0; j < outputs.cols(); j++) {
            CHECK_EQUAL_FLOAT(expected_results[i][j], outputs[i][j]);
        }
    }
}
