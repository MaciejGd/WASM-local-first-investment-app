#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/monte_carlo_sim.h"
#include <array>

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
    static inline std::vector<std::vector<double>> data = {
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
        {3.19, -0.06, -0.12},

        {-0.60, 0.31, 0.37},
        {-1.47, 1.57, -1.45},
        {0.11, -2.12, 0.65},
        {-0.69, -0.11, 1.64},
        {-0.27, -0.093, 1.0},

        {-0.81, 0.65, 0.97},
        {-1.36, 0.81, -1.05},
        {0.14, -0.69, 0.10},
        {-0.63, -0.12, 0.51},
        {-0.24, 0.70, -0.16},

        {-0.34, -0.08, -0.74},
        {0.26, 1.33, -0.97},
        {-2.05, -0.025, 0.22},
        {-1.08, -0.88, -0.68},
        {-0.51, -0.88, -0.43},

        {0.64, -0.54, -0.04},
        {0.071, -0.90, 1.18},
        {-0.32, -0.57, 1.84},
        {-1.26, 0.61, -0.42},
        {-0.10, -0.34, -1.4},

        {0.30, -0.20, 1.18},
        {-0.65, -0.79, -0.68},
        {-0.60, -0.94, -1.26},
        {-2.34, -0.44, -2.68},
        {0.69, -0.019, -1.01},

        {0.508193, 1.25777, -1.04248},
        {-1.08744, 0.39644, 0.493098},
        {0.576084, -0.0805815, 1.44284},
        {1.18317, 0.208409, 1.36491},
        {0.111852, -1.87317, 2.09622},

        {-0.752641, 0.229195, -1.04893},
        {-0.292133, -0.519732, -1.07381},
        {0.540665, -0.0640594, 1.01553},
        {-2.23279, -0.522869, 1.01974},
        {0.879056, 0.244449, -0.946964},

        {-0.238884, -0.935514, 0.91621},
        {-0.73763, -0.653948, 0.362986},
        {-0.147578, -0.725908, 1.43087},
        {-1.16066, -0.800722, 0.409834},
        {1.17165, -0.163111, 0.0425847},

        {-0.293317, 0.184021, 0.483496},
        {0.106194, -0.252728, -0.62501},
        {-1.7014, -0.743361, 1.05491},
        {0.840667, -1.35457, 1.13979},
        {-0.69959, 0.282302, -0.548771},

        {0.926868, 0.327958, 1.61403},
        {0.196347, -0.608139, 0.35722},
        {0.726418, -0.370961, -0.388522},
        {-1.16781, 1.94092, 0.881583},
        {0.196557, -2.32647, 0.497231},

        {-0.985032, 0.078109, -0.382601},
        {0.939276, 0.123579, -0.0890286},
        {0.267873, 0.00632345, 0.309938},
        {0.855939, -1.45797, 0.122875},
        {1.2456, 0.805029, -0.112876},

        {0.226636, 0.364071, 0.332235},
        {0.571056, -1.13575, -0.53249},
        {-1.3782, 0.673571, 1.20086},
        {0.37893, -0.588209, 0.159134},
        {0.559347, -0.651986, 0.529052},

        {-0.638641, 0.332571, 0.361464},
        {0.48295, 1.07514, 0.14195},
        {-0.218935, 0.929282, 1.77458},
        {1.15829, -0.612682, 0.00506883},
        {0.721346, -1.00271, -0.88744},

        {0.384715, -1.97474, -0.906562},
        {-0.454313, -0.165979, -1.24253},
        {-1.4617, -1.05571, 1.14338},
        {-0.155255, 1.47548, -0.643583},
        {0.000889046, 0.472651, 0.439133},

        {0.666788, 0.264937, -1.69653},
        {0.159886, 0.123942, 1.71866},
        {-0.565609, -0.689291, 0.481996},
        {0.925075, 0.178276, -1.28287},
        {-0.927214, 0.240567, 0.245048}
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
                {2.4849066497880004, 1.0704414117014134},
                {-0.6225296133459919, -0.6931471805599453}};
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
    int price[] = {7,4,5,1,2,
                    1,2,5,4,7,
                    10,9,5,7,4};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};

    std::vector<double> expected_results = {3.71337462, 2.99464877, 7.54594324, 5.05260566, 6.18458635};


    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    std::vector<double> drawdowns(5, 0.0);
    std::vector<double> upsides(5, 0.0);
    auto outputs = mont.Simulate(5, 5, drawdowns, upsides);
    // validate output
    auto results = outputs.GetRets();
    for (int i = 0; i < results.size(); i++) {
        CHECK_EQUAL_FLOAT(expected_results[i], results[i]);
    }
}

UNIT_TEST(MonteCarloSimulator, SimulationUpsides) {
    int price[] = {7,4,5,1,2,
                    1,2,5,4,7,
                    10,9,5,7,4};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};

    std::vector<double> expected_results = {3.713374615272557, 
                                            2.9946487739656593, 
                                            7.5459432366090065, 
                                            5.052605659459024, 
                                            6.184586353453597};

    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    std::vector<double> drawdowns(5, 0.0);
    std::vector<double> upsides(5, 0.0);
    auto outputs = mont.Simulate(5, 5, drawdowns, upsides);
    // validate output
    for (int i = 0; i < upsides.size(); i++) {
        CHECK_EQUAL_FLOAT(expected_results[i], upsides[i]);
    }
}

UNIT_TEST(MonteCarloSimulator, SimulationDrawdown) {
    int price[] = {7,4,5,1,2,
                    1,2,5,4,7,
                    10,9,5,7,4};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};

    std::vector<double> expected_results = {-0.12610791746510455, 0, 0, 0, 0};

    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    std::vector<double> drawdowns(5, 0.0);
    std::vector<double> upsides(5, 0.0);
    auto outputs = mont.Simulate(5, 5, drawdowns, upsides);
    // validate output
    for (int i = 0; i < drawdowns.size(); i++) {
        CHECK_EQUAL_FLOAT(expected_results[i], drawdowns[i]);
    }
}

UNIT_TEST(MonteCarloSimulator, SimulationStockChanges) {
    int price[] = {7,4,5,1,2,
                    1,2,5,4,7,
                    10,9,5,7,4};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};

    std::vector<double> expected_results =
                    {-0.16394326, -0.5221177, 0.66622602, -0.44275559, 0.31985147};


    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    std::vector<double> drawdowns(5, 0.0);
    std::vector<double> upsides(5, 0.0);
    auto outputs = mont.Simulate(5, 5, drawdowns, upsides);
    // multiply stocks changes by weights and sum up to check if they are equal to final changes
    auto stocks_changes = outputs.GetStocksChanges();
    for (int i = 0; i < stocks_changes.size(); i++) {
        double sum = 0.0;
        for (int j = 0; j < 3; j++) {
            sum += (weights[j] * stocks_changes[i][j]);
        }
        CHECK_EQUAL_FLOAT(sum, expected_results[i]);
    }
}

UNIT_TEST(MonteCarloSimulator, RunSimulationInvalidBuffer) {
    int price[] = {7,4,2,1,2,
                    1,2,5,4,4,
                    10,9,5,7,2};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};
    double* buff = nullptr;
    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    CHECK_EQUAL(mont.RunSimulation(5, 5, buff), false);
}

UNIT_TEST(MonteCarloSimulator, RunSimulationValid) {
    int price[] = {7,4,5,1,2,
                1,2,5,4,7,
                10,9,5,7,4};
    size_t stocks = 3;
    size_t stock_size = 5;
    double weights[] = {0.5, 0.25, 0.25};

    std::array<double, 31> expected_results = {
            -0.0954805060374801,0.03668832290704804,0.18820470642450823,0.32892596324010703,1.4004578802956584,2.4679858821746303,3.713374615272557,5.052605659459024,6.184586353453597, // returns
            -0.3919309424359614,-0.2878297492506418,-0.2522299061951612,-0.19379420054502533,-0.17375368115258444,0,0,0,0, // DRAWDOWNS
            0.03668832290704804,0.13788667070476263,0.32232207972891425,0.32892596324010703,1.4004578802956584,2.7574889736371064,3.713374615272557,5.052605659459024,6.184586353453597, // UPSIDES
            -0.2923375735491905, // VAR
            -0.49237985, 0.2473031, -0.04726082 // CVARS
        };

    std::array<double, 31> buff{};
    auto mont = MonteCarloSimulator(price, stocks, stock_size, weights);
    std::unique_ptr<TestRandomGenerator> rand_gen = std::make_unique<TestRandomGenerator>();

    mont.SetRandomGenerator(std::move(rand_gen));
    mont.RunSimulation(5, 20, buff.data());
    for (int i = 0; i < 29; i++) {
        CHECK_EQUAL_FLOAT(buff[i], expected_results[i]);
    }
}