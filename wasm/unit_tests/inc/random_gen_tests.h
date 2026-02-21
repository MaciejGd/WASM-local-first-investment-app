#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/random_generator.h"

UNIT_TEST(RandomGen, CheckValue) {
    CRandomGenerator gen;
    size_t seed = 45;
    double expected_output = 0.30453643924300827;
    gen.SetSeed(seed);
    CHECK_EQUAL(gen.GenerateRandom(), expected_output);
}

UNIT_TEST(RandomGen, GenerateRandomSamples) {    
    double buf[] = { 1 };
    size_t stock_size = 2;
    size_t stocks = 4;
    // compare output we values expected for below seed
    size_t seed = 45;
    std::vector<double> expected_output = {-0.5113973095176207,
                                            0.4440026648946756,
                                            -0.20153917455817283,
                                            1.7196552083405074};
    // set random generator with predefined seed
    auto gen = CRandomGenerator();
    gen.SetSeed(seed);
    auto samples = gen.GenerateRandomSamples(stocks);
    // confirm results are correct
    CHECK_EQUAL(samples.rows(), stocks);
    CHECK_EQUAL(samples.cols(), 1);
    for (int i = 0; i < samples.rows(); i++) {
        CHECK_EQUAL_FLOAT(expected_output[i], samples[i][0]);
    }
}