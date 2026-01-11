#pragma once 
#include "tests_runner.h"

// ################## CHECK_NEAR ########################## 
UNIT_TEST(AssertionsTests, CheckNearSuccess) 
{
    CHECK_NEAR(1.0000001, 1.0000002, 0.0000001); // should pass
}

UNIT_TEST(AssertionsTests, CheckNearFail) 
{
    auto lambda = [&]() {
        CHECK_NEAR(1.0001, 1.022, 0.02); // should fail
    };
    lambda();
    test_result_contianer.value ^= 1; // if assertion failed means success
}

// ################## CHECK_G ########################## 
UNIT_TEST(AssertionsTests, CheckGreaterFail)
{
    auto lambda = [&]() {
        CHECK_G(1, 2); // should fail
    };
    lambda();
    test_result_contianer.value ^= 1;
}

UNIT_TEST(AssertionsTests, CheckGreaterSuccess)
{
    CHECK_G(2, 1); // should pass
}

// ################## CHECK_GE ##########################
UNIT_TEST(AssertionsTests, CheckGreaterEqualFail)
{
    auto lambda = [&]() {
        CHECK_GE(1, 2); // should fail
    };

    lambda();
    test_result_contianer.value ^= 1;
}

UNIT_TEST(AssertionsTests, CheckGreaterEqualSuccess)
{
    CHECK_GE(2, 2); // should pass
}

// ################## CHECK_LE ##########################
UNIT_TEST(AssertionsTests, CheckLowerEqualFail)
{
    auto lambda = [&]() {
        CHECK_LE(2, 1); // should fail
    };
    lambda();
    test_result_contianer.value ^= 1;
}

UNIT_TEST(AssertionsTests, CheckLowerEqualSuccess)
{
    CHECK_LE(2, 2); // should pass
}

// ################## CHECK_L ##########################
UNIT_TEST(AssertionsTests, CheckLowerFail)
{
    auto lambda = [&]() {
        CHECK_L(2, 2); // should fail
    };

    lambda();
    test_result_contianer.value ^= 1;
}

UNIT_TEST(AssertionsTests, CheckLowerSuccess)
{
    CHECK_L(1, 2); // should pass
}

// ################## CHECK_EQUAL ##########################
UNIT_TEST(AssertionsTest, CheckEqualSuccess) 
{
    CHECK_EQUAL(1, 1); // should pass
}

UNIT_TEST(AssertionsTest, CheckEqualFail) 
{
    auto lambda = [&]() {
        CHECK_EQUAL(1, 2); // should fail
    };

    lambda();
    test_result_contianer.value ^= 1;
}

// ################## CHECK_NOT_EQUAL ##########################
UNIT_TEST(AssertionsTest, CheckNotEqualFail) 
{
    auto lambda = [&]() {
        CHECK_NOT_EQUAL(1, 1); // should fail
    };

    lambda();
    test_result_contianer.value ^= 1;
}

UNIT_TEST(AssertionsTest, CheckNotEqualSuccess) 
{
    CHECK_NOT_EQUAL(2, 1); // should pass
}

// ################## CHECK_TRUE ##########################
UNIT_TEST(AssertionTest, CheckTrueSuccess) 
{
    CHECK_TRUE(2 == 2); // shoud pass
}

UNIT_TEST(AssertionTest, CheckTrueFail) 
{
    auto lambda = [&]() {
        CHECK_TRUE(2 != 2); // should fail
    };

    lambda();
    test_result_contianer.value ^= 1;
}

// ################## CHECK_FALSE ##########################
UNIT_TEST(AssertionTest, CheckFalseSuccess) 
{
    CHECK_FALSE(2 != 2); // should pass
}

UNIT_TEST(AssertionTest, CheckFalseFail) 
{
    auto lambda = [&]() {
        CHECK_FALSE(2 == 2); // should fail
    };
    lambda();
    test_result_contianer.value ^= 1;
}