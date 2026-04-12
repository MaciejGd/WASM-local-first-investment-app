#pragma once
#include "../test_source/tests_runner.h"
#include "../../core/inc/simulation_output.h"

UNIT_TEST(SimulationOutputs, Constructor) {
    SimulationOutput out(2, 3);
    CHECK_EQUAL(out.output.size(), 2);
    CHECK_EQUAL(out.output[0].second.rows(), 3);
    CHECK_EQUAL(out.output[0].second.cols(), 1);
    CHECK_EQUAL(out.output[0].second[0][0], 0.0);
}

UNIT_TEST(SimulationOutputs, Sort) {
    std::vector<double> res = {2.0, 3.0, 1.0};
    std::vector<CMatrix<double>> mats = {
        CMatrix<double>(1,2),
        CMatrix<double>(2,3),
        CMatrix<double>(1,5)
    };
    SimulationOutput out(3, 3);
    for (int i = 0; i < res.size(); i++) {
        out.output[i].first = res[i];
        out.output[i].second = mats[i];
    }
    out.sort();

    CHECK_EQUAL(out.output[0].first, 1.0);
    CHECK_EQUAL(out.output[0].second, mats[2]);
    CHECK_EQUAL(out.output[1].first, 2.0);
    CHECK_EQUAL(out.output[1].second, mats[0]);
    CHECK_EQUAL(out.output[2].first, 3.0);
    CHECK_EQUAL(out.output[2].second, mats[1]);
}

UNIT_TEST(SimulationOutputs, Getters) {
    std::vector<double> res = {2.0, 3.0, 1.0};
    std::vector<CMatrix<double>> mats = {
        CMatrix<double>(1,2),
        CMatrix<double>(2,3),
        CMatrix<double>(1,5)
    };
    SimulationOutput out(3, 3);
    for (int i = 0; i < res.size(); i++) {
        out.output[i].first = res[i];
        out.output[i].second = mats[i];
    }

    CHECK_EQUAL(out.GetRet(1), 3.0);
    CHECK_EQUAL(out.GetStocksChange(1), mats[1]);
    auto returns = out.GetRets();
    auto changes = out.GetStocksChanges();
    CHECK_EQUAL(returns.size(), changes.size());
    for (int i = 0; i < returns.size(); i++) {
        CHECK_EQUAL(returns[i], res[i]);
        CHECK_EQUAL(changes[i], mats[i]);
    }
}

UNIT_TEST(SimulationOutputs, Setters) {
    std::vector<double> res = {2.0, 3.0, 1.0};
    std::vector<CMatrix<double>> mats = {
        CMatrix<double>(1,2),
        CMatrix<double>(2,3),
        CMatrix<double>(1,5)
    };
    SimulationOutput out(3, 3);
    for (int i = 0; i < res.size(); i++) {
        out.SetRet(i, res[i]);
        out.SetStocksChange(i, mats[i]);
    }

    CHECK_EQUAL(out.output[0].first, 2.0);
    CHECK_EQUAL(out.output[0].second, mats[0]);
    CHECK_EQUAL(out.output[1].first, 3.0);
    CHECK_EQUAL(out.output[1].second, mats[1]);
    CHECK_EQUAL(out.output[2].first, 1.0);
    CHECK_EQUAL(out.output[2].second, mats[2]);
}

UNIT_TEST(SimulationOutputs, Size) {
    SimulationOutput out(3, 5);
    CHECK_EQUAL(out.size(), 3);
}