#pragma once
#include <iostream>
#include <vector>
#include <memory>
#include <random>
#include <cmath>
#include "../linalg/matrix_special.h"
#include "./random_generator.h"
#include "./simulation_results.h"

namespace finance_api {

using namespace linalg::algorithms;
using namespace linalg::primitives;
using namespace linalg::utils;

/// @brief Class encapsulating Monte Carlo simulation
/// @tparam T type of underlying data
template<typename T>
class MonteCarloSimulator {
private:
    T* m_buffer;
    size_t m_stock_size;
    size_t m_stocks;
    CMatrix<double> m_weights; // we need weights 

    CMatrixLowerTriangular<double> m_cholesky_decomposition;

    std::unique_ptr<IRandomGenerator> m_rand_gen;
    std::unique_ptr<ISimsResults> m_results;
public:
    /// @brief Class for running Monte Carlo simulations for input stock data
    /// @param buffer pointer to stock values array
    /// @param chunk_size size of particular stock data
    /// @param chunks_amount number of stocks
    /// @param weights pointer to array of weights for particular stocks
    MonteCarloSimulator(T* buffer, size_t chunks_amount, size_t chunk_size, double* weights) {
        if (buffer == nullptr) {
            throw std::invalid_argument("Buffer passed as input argument is nullptr!");
        }
        if (chunk_size < 2) {
            throw std::invalid_argument("Chunk size of stock prices should be at least two to count returns!");
        }
        if (chunks_amount <= 0) {
            throw std::invalid_argument("Analyzed stock amounts should be at least one!");
        }
        if (weights == nullptr) {
            throw std::invalid_argument("Weights input buffer is nullptr!!!");
        }
        
        m_buffer = buffer;
        m_stock_size = chunk_size;
        m_stocks = chunks_amount;
        m_rand_gen = std::make_unique<CRandomGenerator>(); // init random double generator
        m_InitWeightMatrix(weights);
    };

    /// Weights matrix getter
    const CMatrix<double>& GetWeights() const {
        return m_weights;
    }

    const ISimsResults& GetResults() const {
        return *m_results;
    }

    /// @brief Main function for running Monte Carlo simulation. It runs simulation and returns results
    /// @param time number of simulated timestamps
    /// @param sims number of run simulations
    /// @param buff buffer of doubles in which results would be stored
    void RunSimulation(int32_t time, int32_t sims, double* buff) {        
        std::vector<double> max_drawdowns(sims, 0); // count the minimum possible value of the wallet
        std::vector<double> max_upsides(sims, 0);
        // run simulation and produce output matrix
        auto output = Simulate(time, sims, max_drawdowns, max_upsides);

        // update the output buffer with results
        m_results = std::make_unique<SimsResults>(buff);
        if (m_results) {
            auto last_col = output.GetCol(output.cols()-1);            
            m_results->SetReturns(last_col);
            m_results->SetVAR(last_col);
            m_results->SetDrawdowns(max_drawdowns);
            m_results->SetUpsides(max_upsides);            
        }
    }

    /// @brief Run Monte Carlo simulation
    /// @param time number of timestamps that simulation would run for
    /// @param sims number of simulations to be performed
    /// @param[out] drawdowns vectoloSumr of max drawdowns to be filled during simulation
    /// @param[out] upsides vector of max upsides to be filled during simulation
    /// @return Matrix of doubles with simulation's results
    CMatrix<double> Simulate(int32_t time, int32_t sims, std::vector<double>& drawdowns, std::vector<double>& upsides) {
        CHECK_OUT_OF_RANGE(drawdowns.size(), sims);
        CHECK_OUT_OF_RANGE(upsides.size(), sims);
        // transform prices to returns
        auto returns = m_TransformPriceToReturns();
        // count mean values for prices
        auto means = GetMeanMatrix(returns.data(), returns.rows(), returns.cols());
        // count Cholesky decomposition for returns data
        auto covariance = GetCovarianceMatrix(returns.data(), returns.rows(), returns.cols());
        auto cholesky = CholeskyFactorization(covariance);
        // create outputs matrix, TODO - do not create a matrix with number of times as it can be very high
        CMatrix<double> outputs(sims, time+1);
        // run simulation TODO - introduce multithreading in here so Simulation is sped up
        for (int i = 0; i < sims; i++) {
            for (int j = 1; j < time+1; j++) {
                // generate random samples
                CMatrix<double> random_samples = m_rand_gen->GenerateRandomSamples(m_stocks);
                // add means + randoms generated with probability equivalent to covariance matrix
                auto motion = means + (cholesky * random_samples);
                // fill output matrix with motion multiplied by weight of asset
                outputs[i][j] = outputs[i][j-1] + (m_weights * motion)[0][0];
                // update minimal drawdown
                drawdowns[i] = std::min(drawdowns[i], outputs[i][j]); 
                upsides[i] = std::max(upsides[i], outputs[i][j]);
            }
        }
        return outputs; 
    }

    /// @brief Random generator setter
    /// @param rand_gen unique_ptr to IRandomGenerator instance
    void SetRandomGenerator(std::unique_ptr<IRandomGenerator> rand_gen) {
        m_rand_gen = std::move(rand_gen);
    }
protected:
    /// @brief Transform input prices to logarithmic returns
    /// @return 2D doubles vector of returns
    CMatrix<double> m_TransformPriceToReturns() {
        // each chunk of returns should be of size - 1
        CMatrix<double> result(m_stocks, m_stock_size - 1);
        for (int i = 0; i < result.rows(); i++) {
            int start = i * m_stock_size;
            // check each chunk
            double prev = static_cast<double>(m_buffer[start]);
            for (int j = 0; j < result.cols(); j++) {
                double current = m_buffer[start + j + 1];
                if (current == 0) {
                    throw std::logic_error("Stock price provided cannot be equal to zero!!!");
                }
                // result[i][j] = (current - prev) / prev;
                result[i][j] = std::log(current / prev);
                prev = current;
            }
        }
        return result;
    }

    /// @brief Initialize weight matrix.
    /// @param weights pointer to double array with array weights.
    void m_InitWeightMatrix(double* weights) {
        double sum = 0.0; // weights should sum up to one
        m_weights = CMatrix<double>(1, m_stocks);
        for (size_t i = 0; i < m_stocks; i++) {
            m_weights[0][i] = weights[i];
            sum += weights[i];
        }
        // check if weights summed up to one
        if (!EqualOperator<double>(sum, 1.0)) {
            std::logic_error("Sum of stock prices weights should be equal to one!");
        }
    }
};

} // end of finance_api namespace