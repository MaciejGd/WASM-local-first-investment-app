#include "./inc/simulation_results.h"
#include <algorithm>
#include <iostream>
#include <cmath>
#include "./linalg/algorithms.h"

void SimsResults::SetSimOutput(SimulationOutput& sims_output, const CMatrix<double>& weights) {
    // sort output by returns
    sims_output.sort();
    std::vector<double> rets = sims_output.GetRets();
    t_SetVAR(sims_output, weights); // set VaR and CVaR
    t_SetReturns(rets); // set returns
}

void SimsResults::t_SetVAR(SimulationOutput& sims_output, CMatrix<double> weights) {
    // find the lowest 5% of results
    int idx = (sims_output.size()) / s_VAR_DIVIDER - 1; // need to substract one as 0 indexed
    // set VAR in buffer
    double VAR = sims_output.GetRet(idx);
    this->t_buff[m_var_ptr] = VAR;
    // count Component VARs    
    CMatrix<double> averages(weights.cols(), weights.rows());
    t_ES = 0.0; // expected shortfall
    // sum up all elements below VAR in a loop
    idx = 0;
    while (sims_output.GetRet(idx) <= VAR) {
        t_ES += sims_output.GetRet(idx);
        auto stocks_mat = sims_output.GetStocksChange(idx); // matrix of stocks
        // add averages turned into an exponential form
        averages = averages + (stocks_mat.Map([this](const auto& x) {
            // return this->t_TransformToExp(x); 
            return std::exp(x) - 1;
        }));
        idx++;
    }
    // divide by the number of analyzed elements to get averages
    averages = averages.Map([idx](const auto& x) {
        return x / idx;
    });
    // multiply by weights to get CVaRs
    auto cVARS = linalg::algorithms::HadamardProduct(averages.Transpose(), weights);
    size_t buff_idx = m_cvar_ptr;
    for (int i = 0; i < cVARS.cols(); i++) {
        t_buff[buff_idx + i] = cVARS[0][i];
    }
};

void SimsResults::t_SetReturns(std::vector<double>& _rets) {
    auto res = t_CountPercentile(_rets);
    t_InsertToBuff(res, m_returns_ptr);
};

void SimsResults::SetDrawdowns(std::vector<double>& _drawdowns) {
    auto res = t_CountPercentile(_drawdowns);
    t_InsertToBuff(res, m_drawdowns_ptr);
};

void SimsResults::SetUpsides(std::vector<double>& _upsides) {
    auto res = t_CountPercentile(_upsides);
    t_InsertToBuff(res, m_upsides_ptr);
}

double SimsResults::t_TransformToExp(double value) {
    return std::exp(value) - 1.0;
}

void SimsResults::t_InsertToBuff(std::vector<double>& data, int start_ptr) {
    if (data.size() > s_MEASURES) {
        throw std::logic_error("Data passed to buffer exceeds measures points");
    }
    if (this->t_buff == nullptr) {
        throw std::logic_error("Results buffer should be initialized prior appending to it!");
    }

    int idx = start_ptr;
    for (const auto& d : data) {
        this->t_buff[idx++] = d;
    }
};

std::vector<double> SimsResults::t_CountPercentile(std::vector<double> &data) {
    if (data.size() == 0) {
        throw std::logic_error("Data vector for t_Counting percentile of results, should not be empty!");
    }

    // take all values, sort them
    std::sort(data.begin(), data.end());
    // now check the percentiles
    int percentiles = data.size() / s_PERCENTILE_DIVIDER; // t_Count each 10 percent
    std::vector<double> result(s_MEASURES, {});
    // fill results with proper percentile
    for (int i = 1; i <= 9; i++) {
        result[i - 1] = data[i * percentiles - 1];
    }
    return result;
}

