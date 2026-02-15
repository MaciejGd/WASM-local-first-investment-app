#pragma once 
#include "../test_source/tests_runner.h"
#include "../../core/inc/utils.h"


UNIT_TEST(UtilsCheckEqual, CheckEqual) {
    using namespace linalg::utils;

    size_t test = 1;
    size_t test2 = 1;
    CHECK_NO_THROW(CheckEqual(test, test2, "dummy", 1));
}

UNIT_TEST(UtilsCheckEqual, CheckNotEqual) {
    using namespace linalg::utils;

    size_t test = 1;
    size_t test2 = 2;
    CHECK_THROW(CheckEqual(test, test2, "dummy", 1), std::logic_error);
}

UNIT_TEST(UtilsCheckRange, CheckOutOfRange) {
    using namespace linalg::utils;

    size_t i = 1;
    size_t range = 10;
    const char* filename = "dummy";
    int line = 1;

    CHECK_NO_THROW(CheckOutOfRange(i, range, filename, line));
}

UNIT_TEST(UtilsCheckRange, CheckOutOfRangeThrow) {
    using namespace linalg::utils;

    size_t i = 10;
    size_t range = 9;
    const char* filename = "dummy";
    int line = 1;

    CHECK_THROW(CheckOutOfRange(i, range, filename, line), std::out_of_range);
}

UNIT_TEST(UtilsCheckRange, CheckOutOfDownRangeThrow) {
    using namespace linalg::utils;

    int i = -2;
    int range = 0;
    const char* filename = "dummy";
    int line = 1;

    CHECK_THROW(CheckOutOfRange(range, i, filename, line), std::out_of_range);
}

UNIT_TEST(UtilsCheckRange, CheckOutOfDownRange) {
    using namespace linalg::utils;

    int i = 1;
    int range = 0;
    const char* filename = "dummy";
    int line = 1;

    CHECK_NO_THROW(CheckOutOfRange(range, i, filename, line));
}

UNIT_TEST(UtilsEqualOperator, IntegerOperatorEqual) {
    using namespace linalg::utils;

    int i = 1;
    int j = 1;
    CHECK_TRUE(EqualOperator(i, j));
}

UNIT_TEST(UtilsEqualOperator, IntegerOperatorNotEqual) {
    using namespace linalg::utils;

    int i = 1;
    int j = 2;
    CHECK_FALSE(EqualOperator(i, j));
}

UNIT_TEST(UtilsEqualOperator, FloatEqualOperator) {
    using namespace linalg::utils;

    float i = 1.f;
    
    int32_t test = std::bit_cast<int32_t>(i);
    test += MAX_ULPS;
    float j = std::bit_cast<float>(i);
    CHECK_TRUE(EqualOperator(i, j));
}

UNIT_TEST(UtilsEqualOperator, FloatEqualOperatorThrow) {
    using namespace linalg::utils;

    float i = 1.f;
    
    int32_t test = std::bit_cast<int32_t>(i);
    test += (MAX_ULPS + 1);
    float j = std::bit_cast<float>(i);
    CHECK_TRUE(EqualOperator(i, j));
}

UNIT_TEST(UtilsEqualOperator, DoubleEqualOperator) {
    using namespace linalg::utils;

    double i = 1.f;
    
    int64_t test = std::bit_cast<int64_t>(i);
    test -= MAX_ULPS;
    double j = std::bit_cast<double>(i);
    CHECK_TRUE(EqualOperator(i, j));
}

UNIT_TEST(UtilsEqualOperator, DoubleEqualOperatorThrow) {
    using namespace linalg::utils;

    double i = 1.f;
    
    int64_t test = std::bit_cast<int64_t>(i);
    test -= (MAX_ULPS + 1);
    double j = std::bit_cast<double>(i);
    CHECK_TRUE(EqualOperator(i, j));
}