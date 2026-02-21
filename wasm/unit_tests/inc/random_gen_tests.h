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
