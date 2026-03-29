#pragma once

#include "../test_source/tests_runner.h"
#include "../../core/inc/simulation_results.h"

class SimsResultsTest: public SimsResults {
public:
    SimsResultsTest(double* buff) : SimsResults(buff) {};
    // simulate protected method of SimsResults
    std::vector<double> t_CountPercentile(std::vector<double>& data) {
        return SimsResults::t_CountPercentile(data);
    }

    void t_InsertToBuff(std::vector<double>& data, int start_ptr) {
        SimsResults::t_InsertToBuff(data, start_ptr);
    }
};

UNIT_TEST(SimsResultsTests, CountPercentile) {
    std::vector<double> rets = {1, 2, 3, 4, 5, 6, 7, 8, 9,10,
                                     11,12,13,14,15,16,17,18,19,20};
    std::vector<double> expected_res = {2, 4, 6, 8, 10, 12, 14, 16, 18};
    double t[2] = {1,2};

    SimsResultsTest test(t);
    auto test_res = test.t_CountPercentile(rets);
    // check results
    CHECK_EQUAL(test_res.size(), expected_res.size());
    for (int i = 0; i < test_res.size(); i++) {
        CHECK_EQUAL(test_res[i], expected_res[i]);
    }
}

UNIT_TEST(SimsResultsTests, SetReturns) {
    // test vector with 20 elements
    std::vector<double> rets = {1, 2, 3, 4, 5, 6, 7, 8, 9,10,
                                    11,12,13,14,15,16,17,18,19,20};

    // we should allocate the data for all sims results:
    // 9 + 9 + 9 + 1 + CVAR(for now can be 1 as well as VAR)
    std::array<double, 29> buff{}; // default initialize buffor
    double* buff_data = buff.data();

    std::array<double, 29> expected_results = {
        6.38905609893065
        ,53.598150033144236
        ,402.4287934927351
        ,2979.9579870417283
        ,22025.465794806718
        ,162753.79141900392
        ,1202603.2841647768
        ,8886109.520507872
        ,65659968.13733051, // returns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // drawdowns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // upsides percentiles
        0, // VAR
        0 // CVAR
    };

    SimsResults res(buff_data);
    res.SetReturns(rets);    
    for (int i = 0; i < 29; i++) {
        CHECK_EQUAL(buff[i], expected_results[i]);
    }
}


UNIT_TEST(SimsResultsTests, SetDrawdowns) {
    // test vector with 20 elements
    std::vector<double> rets = {1, 2, 3, 4, 5, 6, 7, 8, 9,10,
                                    11,12,13,14,15,16,17,18,19,20};
    std::array<double, 29> buff{}; // default initialize buffor
    double* buff_data = buff.data();

    std::array<double, 29> expected_results = {        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // returns percentiles
        6.38905609893065
        ,53.598150033144236
        ,402.4287934927351
        ,2979.9579870417283
        ,22025.465794806718
        ,162753.79141900392
        ,1202603.2841647768
        ,8886109.520507872
        ,65659968.13733051, // drawdowns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // upsides percentiles
        0, // VAR
        0 // CVAR
    };

    SimsResults res(buff_data);
    res.SetDrawdowns(rets);

    for (int i = 0; i < 29; i++) {
        CHECK_EQUAL(buff[i], expected_results[i]);
    }
}

UNIT_TEST(SimsResultsTests, SetUpsides) {
    // test vector with 20 elements
    std::vector<double> rets = {1, 2, 3, 4, 5, 6, 7, 8, 9,10,
                                    11,12,13,14,15,16,17,18,19,20};
    std::array<double, 29> expected_results = {        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // returns percentiles        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // drawdowns percentiles
        6.38905609893065
        ,53.598150033144236
        ,402.4287934927351
        ,2979.9579870417283
        ,22025.465794806718
        ,162753.79141900392
        ,1202603.2841647768
        ,8886109.520507872
        ,65659968.13733051, // upsides percentiles
        0, // VAR
        0 // CVAR
    };

    std::array<double, 29> buff{}; // default initialize buffor
    double* buff_data = buff.data();
    SimsResults res(buff_data);
    res.SetUpsides(rets);
    for (int i = 0; i < 29; i++) {
        CHECK_EQUAL(buff[i], expected_results[i]);
    }
}

UNIT_TEST(SimsResultsTests, SetVAR) {
    std::vector<double> rets = {1, 2, 3, 4, 5, 6, 7, 8, 9,10,
                                11,12,13,14,15,16,17,18,19,20};

    std::array<double, 29> buff{};
    SimsResults res(buff.data());
    
    std::array<double, 29> expected_results = {        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // returns percentiles        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // drawdowns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // upsides percentiles
        1.718281828459045, // VAR
        0 // CVAR
    };

    res.SetVAR(rets);

    for (int i = 0; i < 29; i++) {
        CHECK_EQUAL(buff[i], expected_results[i])
    }
}

UNIT_TEST(SimsResultsTests, SetVarEmptyInput) {
    std::vector<double> rets = {};

    std::array<double, 29> buff{};
    SimsResults res(buff.data());

    CHECK_THROW(res.SetVAR(rets), std::logic_error);
}

UNIT_TEST(SimsResultsTests, InsertToBuffTooBigData) {
    std::vector<double> test(12000, 0); // initialize some big vector

    std::array<double, 29> buff{};
    SimsResultsTest res(buff.data());
    CHECK_THROW(res.t_InsertToBuff(test, 0), std::logic_error);
}

UNIT_TEST(SimsResultsTests, InsertToBuffEmptyBuffer) {
    std::vector<double> test(1, 0); // initialize some big vector
    
    SimsResultsTest res(nullptr);

    CHECK_THROW(res.t_InsertToBuff(test, 0), std::logic_error);
}

UNIT_TEST(SimsResultsTests, InsetToBuff) {
    std::vector<double> test(1, 1); // initialize 1x1 vector
    std::array<double, 2> expected_res = {0, 1.718281828459045};

    std::array<double, 2> buff{};
    SimsResultsTest res(buff.data());

    res.t_InsertToBuff(test, 1);
    for (int i = 0; i < 2; i++) {
        CHECK_EQUAL(buff[i], expected_res[i]);
    }    
}