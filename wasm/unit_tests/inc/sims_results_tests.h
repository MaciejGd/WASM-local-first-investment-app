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

    inline void t_SetVAR(SimulationOutput& sims_output, const CMatrix<double>& weights) {
        SimsResults::t_SetVAR(sims_output, weights);
    }

    inline void t_SetReturns(std::vector<double>& sims_output) {
        SimsResults::t_SetReturns(sims_output);
    }

    inline double t_GetES() const {
        return this->t_ES;
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
        2
        ,4
        ,6
        ,8
        ,10
        ,12
        ,14
        ,16
        ,18, // returns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // drawdowns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // upsides percentiles
        0, // VAR
        0 // CVAR
    };

    SimsResultsTest res(buff_data);
    res.t_SetReturns(rets);    
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
        2
        ,4
        ,6
        ,8
        ,10
        ,12
        ,14
        ,16
        ,18, // drawdowns percentiles
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
        2
        ,4
        ,6
        ,8
        ,10
        ,12
        ,14
        ,16
        ,18, // upsides percentiles
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
    std::array<double, 31> buff{};
    CMatrix<double> weights(std::vector<double>{0.5, 0.25, 0.25});
    SimsResultsTest res(buff.data());
    
    std::array<double, 31> expected_results = {        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // returns percentiles        
        0, 0, 0, 0, 0, 0, 0, 0, 0, // drawdowns percentiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, // upsides percentiles
        -0.2923375735491905, // VAR
        -0.49237985, 0.2473031, -0.04726082 // CVAR
    };
    std::vector<double> returns = {
        3.71337462,
        2.99464877,
        7.54594324,
        5.05260566,
        6.18458635,
        0.13788667,
        0.66275053, 
        -0.09498895,
        0.32892596, 
        -0.29233757, 
        4.01769362,  
        0.3243178,
        -0.09548051, 
        0.03668832,
        2.23548179,
        6.2340782,   
        1.40045788,
        5.89565084,
        0.18820471,
        2.46798588
    };

    std::vector<std::vector<double>> stock_changes_mats = {
        {-1.0524507764791937,2.885784288941471,-1.4366557622828098},
        {-1.787464780248237,2.73149963319796,-1.245040853127271},
        {0.6894317256036078,3.403804208347564,-2.1177635900245955},
        {-1.8780829450964749,3.1610826185891945,-1.1759390949271507},
        {-0.08585701809798563,3.286284246224013,-1.835164347168429},
        {-4.506009725695383,1.162132497725188,0.28722103127836046},
        {-4.485872355729108,1.721495280559198,0.03496440358743219},
        {-5.3115045243463905,0.8231526785818835,0.28706131761696607},
        {-2.541609285485241,1.5207890635241654,-0.5406144523610585},
        {-4.183811806234981,0.6877387794516774,-0.20954061391722478},
        {-0.26522157925609696,2.9060405400688083,-1.3765687610470698},
        {-3.436557302131937,1.5161609233091033,-0.38829099439357695},
        {-2.6867010498292503,0.9913094545933131,-0.239391517665955},
        {-3.325402040523594,1.1740790922181144,-0.17474050056390308},
        {-0.6815405590703713,2.4545769621124442,-1.2422106015537908},
        {0.7736623166985431,3.1978935348060182,-2.120062606587533},
        {-1.2057273748459953,2.159612423298449,-1.0933090902303166},
        {-0.05060655197202135,3.2388450781791045,-1.7313300728149963},
        {-3.263195644644822,1.3937417092430735,-0.43635781926324324},
        {-1.305249277824822,2.5693745888659305,-1.301665927634805}
    };


    SimulationOutput output(20, 3); // initialize empty value
    for (int i = 0; i < returns.size(); i++) {
        output.output[i].first = returns[i];
        auto& mat = output.output[i].second;
        auto expected = stock_changes_mats[i];
        mat[0][0] = expected[0];
        mat[1][0] = expected[1];
        mat[2][0] = expected[2];
    }
    output.sort(); // crutial for counting!!!
    res.t_SetVAR(output, weights);
    // TODO test for the CVAR
    double sum = 0.0;
    double ES = res.t_GetES();
    for (int i = 0; i < 3; i++) {
        sum += buff[i+28];
    }   
    CHECK_NEAR(sum, ES, 0.000001);
    for (int i = 0; i < buff.size(); i++) {
        CHECK_NEAR(buff[i], expected_results[i], 0.000001);
    }
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

UNIT_TEST(SimsResultsTests, InsertToBuff) {
    std::vector<double> test(1, 1); // initialize 1x1 vector
    std::array<double, 2> expected_res = {0, 1};

    std::array<double, 2> buff{};
    SimsResultsTest res(buff.data());

    res.t_InsertToBuff(test, 1);
    for (int i = 0; i < 2; i++) {
        CHECK_EQUAL(buff[i], expected_res[i]);
    }    
}