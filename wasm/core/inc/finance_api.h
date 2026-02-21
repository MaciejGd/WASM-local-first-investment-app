#pragma once
#include <iostream>
#include <vector>
#include <memory>
#include <random>
#include "./matrix_special.h"
#include "./random_generator.h"
// jakich funkcji tutaj potrzebujemy???

// co należy robić
// 1) policzenie prerequisitów (to jest rzecz, którą należy liczyć tylko raz, cholesky etc.) 
// 2) losowanie wektora liczb pomiędzy 0 a 1
// 3) zamiana cen akcji w stopy zwrotów

namespace finance_api {

using namespace linalg::algorithms;
using namespace linalg::primitives;
using namespace linalg::utils;

// I guess we should encapsulate the logic in some kind of class to manage that
template<typename T>
class MonteCarloSimulator {
private:
    T* m_buffer;
    size_t m_stock_size;
    size_t m_stocks;
    CMatrix<double> m_weights; // we need weights 

    CMatrixLowerTriangular<double> m_cholesky_decomposition;

    std::unique_ptr<IRandomGenerator> m_rand_gen;
public:
    MonteCarloSimulator(T* buffer, size_t chunk_size, size_t chunks_amount, double* weights) {
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

    const CMatrix<double>& GetWeights() const {
        return m_weights;
    }

    void Simulate(int32_t time, int32_t sims) {
        // here we need to accomplish a few things:
        // run two for loops, outer one, for number of simulations, inner one, for number of analyzed days.
        // for each day we want to analyze pseudo random sample
        auto means = GetMeanMatrix(m_buffer, m_stock_size, m_stocks);
        auto covariance = GetCovarianceMatrix(m_buffer, m_stock_size, m_stocks);
        auto cholesky = CholeskyFactorization(covariance);
        // weight should be already filled in
        // output matrix, with dimensions: rows - number of simulations, cols - timestamps
        CMatrix<double> outputs(sims, time);   

        CMatrix<double> random_samples;
        for (int i = 0; i < sims; i++) {
            for (int j = 0; j < time; j++) {
                random_samples = m_GenerateRandomSamples();
                auto motion = means + (cholesky * random_samples);
                outputs[i][j] = outputs[i][j-1] + (m_weights * motion)[0][0];
            }
        }   
    }

    void SetRandomGenerator(std::unique_ptr<IRandomGenerator> rand_gen) {
        m_rand_gen = std::move(rand_gen);
    }

protected:
    /// @brief Generate vector of Random samples created using inverse of normal distribution.
    /// @return Matrix of 1 to m_stocks dimensions filled with pseudo random nums.
    CMatrix<double> m_GenerateRandomSamples() {
        CMatrix<double> samples(1, m_stocks);
        for (int i = 0; i < samples.rows(); i++) {
            samples[0][i] = InverseNormal(m_rand_gen->GenerateRandom());
        }

        return samples;
    }
    
    std::vector<std::vector<double>> m_TransformPriceToReturns() {
        // each chunk of returns should be of size - 1
        std::vector<std::vector<double>> result(m_stocks, std::vector<double>(m_stock_size - 1));
        for (int i = 0; i < result.size(); i++) {
            int start = i * m_stock_size;
            // check each chunk
            double prev = static_cast<double>(m_buffer[start]);
            for (int j = 0; j < result[i].size(); j++) {
                double current = m_buffer[start + j + 1];
                if (current == 0) {
                    throw std::logic_error("Stock price provided cannot be equal to zero!!!");
                }
                result[i][j] = (current - prev) / prev;
                prev = current;
            }
        }
        return result;
    }

    /// @brief Initialize weight matrix.
    /// @param weights pointer to double array with array weights.
    void m_InitWeightMatrix(double* weights) {
        double sum = 0.0; // weights should sum up to one
        m_weights = CMatrix<double>(m_stocks, 1);
        for (size_t i = 0; i < m_stocks; i++) {
            m_weights[i][0] = weights[i];
            sum += weights[i];
        }
        // check if weights summed up to one
        if (!EqualOperator<double>(sum, 1.0)) {
            std::logic_error("Sum of stock prices weights should be equal to one!");
        }
    }
};

} // end of finance_api namespace

//void PrepareData();




